# Async recipe PoC

`recipe_dip.yaml` (PolyMX QC application) rewritten as Rust + tokio code, run against a
simulated cell. The purpose is to see what the **recipe syntax** looks like when the
orchestrator's YAML language is replaced by an async programming language. It is not a
design decision and not a replacement for the orchestrator (`nl-cboost-orchestrator`).

Made 2026-10-27. Requires Rust 1.85 or newer (async closures).

```sh
cargo run    # a reset + a 3-plate batch on simulated time, prints a step log
cargo test   # cycle, batch loop, timeout, missing signal, parallel-block fault, grip retry,
             # and a golden command trace on a scripted host (src/scripted.rs)
```

## The syntax: benefits and costs

One step in both forms:

```yaml
- step: pick_plate
  description: "vacuum-confirmed pick at the taught one-plate height"
  timeout_ms: 445000
  actions: [ { target: robot_controller, command: pick_plate } ]
  wait_for: [ robot_controller.plate_gripped == true ]
```

```rust
m.step("pick_plate", secs(445), m.send(Robot::PickPlate)).await?;
```

A parallel block, with the slide track shared between both scans:

```rust
m.scope("first_side", async |m| {
    let robot_home = m.step("return_home", secs(450), m.send(Robot::ReleaseToSlideAndHome));
    tokio::try_join!(robot_home, slide_scan_track(m))
})
.await?;
```

### Benefits

- **One line per step.** `send` waits for the command's result and then its end state
  (`Command::end_state` in `machine.rs`), so most steps need no separate wait. The whole
  EXECUTING sequence is about 45 lines; the YAML's explanatory comments would move over as
  ordinary comments.
- **Typos are compile errors.** Signals and commands are types. A misspelled signal or a
  command sent to the wrong module does not compile; today the interface map catches it
  when the recipe loads.
- **Repetition becomes a function.** The slide-scan track, written twice in the YAML, is
  one function called twice.
- **Scopes name steps by where they run.** A step inside `m.scope("first_side", …)` faults
  and logs as `first_side/run_slide_cycle`, so step names no longer need suffixes to stay
  unique. The block's own `m` shadows the outer one, so a step cannot escape its scope.
- **Conditions are plain expressions.** `w.slide()?.position_mm >= 600.0`. A module that
  has not reported yet is an explicit `None` in the code, not an engine-wide rule.
- **Parallelism is standard library.** `tokio::try_join!` is `parallel` + `sync: wait_all`,
  including faulting fast when one track fails.
- **Recipes are tested like code.** Under tokio's paused clock the 372-second simulated
  cycle runs in milliseconds.

### Costs

- **What `send` waits for is hidden at the call site.** The reader must look up
  `Command::end_state`; the YAML shows the wait in every step. A step that needs less than
  the end state has no way out.
- **New ways to write a broken recipe.** Holding the status lock across an `.await`
  deadlocks the recipe; this happened while building the PoC (fixed in `step_if`). Recipe
  authors cannot make that mistake in YAML.
- **Syntax noise.** `.await?` on every line, and `Some(w.robot()?.x)` in every condition.
  `.await?` also marks where the recipe waits and can fail, so hiding it is not a gain.
- **The recipe is no longer data.** Tools read the YAML today:
  `validate_against_recipe` in the ROS wrapper, and `test_interface_conformance.py`, which
  recomputes the time budgets from the recipe file. Code cannot be read that way; the
  types replace the first check, the second would need the budgets exposed as data.
- **Every recipe change is a rebuild.** Acceptable: only developers edit recipes (user,
  2026-10-27).
- **A second language in a Python/rclpy stack.** Python's `asyncio` (`TaskGroup`,
  `asyncio.timeout`) gives the same shape without a new language, but without the
  compile-time checks.
- **Cancellation stops waits, not the machine.** When a track faults, the other track's
  waits are dropped but a motion already sent keeps running. The YAML engine behaves the
  same; a ROS implementation would cancel goals explicitly.

## How the YAML maps to the code

| YAML | Rust (`src/dsl.rs`) |
|---|---|
| `step` + `timeout_ms` | `m.step(name, secs(n), body)`: `tokio::time::timeout` over the body, faults carry the step name |
| `actions` (+ the command's own `wait_for`) | `m.send(cmd)`: waits for the result, then `Command::end_state` |
| other `wait_for` | `m.wait_for(\|w\| …)` on a `watch` channel holding the latest status messages |
| `condition` | `m.step_if(…)`: false skips; a module without status faults, as in the engine |
| `parallel` + `sync: wait_all` | `tokio::try_join!` |
| macro-style name prefixes | `m.scope(name, async \|m\| { … })` |

Files: `recipe.rs` (the recipe), `dsl.rs` (the primitives), `machine.rs` (signals,
commands, end states), `sim.rs` (simulated cell), `main.rs` (run + tests).

## Findings beyond syntax

- **Engine semantics match the PoC** (checked in `nl-cboost-orchestrator`
  `src/orchestrator/core/engine.py`): `wait_for` is checked only after all of a step's
  commands have returned; the timeout covers the whole step; a missing signal faults a
  `condition` but means "not yet" in a `wait_for`; a fault in one track faults the
  sequence.
- **Recovery today is hold/release plus restart.** The PackML machine calls `hold()` /
  `release()` for HOLD and SUSPEND, and starts EXECUTING from the top after a fault.
  `resume_from_step` and checkpoint/restore have no caller; the recovery coordinator from
  `DESIGN_REFERENCE.md` §5 does not exist (the engine's own docs say so: ECK-51).
- **Resuming by fast-forward was tried and removed.** Skipping steps up to a named target
  also skips the safety barriers before it, loses the other track's position inside a
  parallel block (with a real collision risk on `collect_from_slide`), only detects an
  unknown target after the whole recipe, and stops steps from returning values. If
  resuming is ever needed, resuming at phase boundaries fits async code better.
- **Engine features the PoC lacks:** `post_actions`, `on_failure`/`on_timeout` gotos and
  decision steps (plain `match`/`if`/`loop` in Rust), runtime-editable `$parameters`,
  `{{ signal }}` templates, checkpoints, and scenario-file replay. Of these only
  checkpoints have no easy async equivalent, and nothing uses them today.

## Open questions

- Will checkpoint/restore ever get a caller (the planned recovery coordinator)?
- Must parameters be changeable without a rebuild, for example from an HMI?
- Is the recipe's own status check after each command required, or could each module
  confirm its end state before reporting success?
- Does recovery need to know which scan (side) a fault came from?
- Should `park_flipper` skip or fault when the robot has not reported? The YAML comment
  argues for skip; the engine faults.

## Left out of scope

Structural ideas that do not change the syntax question: splitting `executing` into
scoped phase functions, computing the time budgets from the rule in the YAML header,
named shared conditions, a reset-barrier helper, and replacing `step_if` with a plain
`match` on a copied status value.

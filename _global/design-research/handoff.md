# Handoff: research plugin work (2026-10-31)

State at the end of the session of 2026-10-31, for whoever resumes. Open work, most important first, is in
`../TODO.md` under *research:design skill*; this note says where things stand and what to read first.

## Where things are
- **The plugin** `research` in the marketplace `claude-skills`: repo `~/Cboost/claude-skills`, GitHub
  `cboostcdouwes/claude-skills`, `main` at `2c6d286`, pushed. Two skills:
  - `research:problem-formulation` (`research/skills/problem-formulation/`): understands the problem with the user
    and ends with `Confirmed by the user: <date>` under *Problem*. Runs only when another skill calls it or the user
    asks to frame a problem.
  - `research:design` (`research/skills/design/`): problem-formulation first (Phase 1), then discovery, options,
    checks, rounds and the decision.
  - `research/shared/`: `log-template.md` (where a log lives, the whole log and the rounds file) and
    `requirements.md` (the full requirements definition).
  - Each skill has a README with a flowchart; the repo's `README.md` lists both.
- **New in `2c6d286`** (from `discovery-merge-losses.md`, reviewed 2026-10-31):
  - Phase 3: each generator report is saved in `<topic>.discovery/` next to the log, and
    `scripts/add-candidates.py <log> <report>` adds each worked-out option as its own *Options* row. It stops with
    an error on an ID already in the log, or a report without IDs. A merge is written in the row's summary, with why.
  - `discovery.md`: each generator gets a letter not used before in the log and starts each worked-out option's
    line with its ID (`F1. ...`).
  - Phase 3 category *The documented route*: the platform's or field's own recommendation, looked up in the first
    round and when *Problem* changes.
  - `checks/bias.md`: does a merged row share the cells of the row it joined? `checks/rejection.md`: does each of
    the leader's reasons cite a requirement; does it lead on cells left ? for the others?
- **Not used in a real run yet.** Plan step 2: after the next real `research:design` run, ask the user what it
  showed (was a merge or drop caught, how much did the log grow), then amend the log's *Decision* or reopen a round.
- **Version** is still `0.1.0`: colleagues installing from GitHub get neither the problem-formulation split nor this
  change until it is bumped. Bump only when the user asks.
- **On this machine** the repo is a local marketplace and `research@claude-skills` is installed from the checkout:
  edits apply after `/reload-plugins` or in a new session.
- **Sizes** (estimated tokens of the SKILL.md body, the gate's 2.9 chars/token): design ~4,189 (the gate warns at
  4,800), problem-formulation ~1,254.
- **The round gate** runs from `${CLAUDE_PLUGIN_ROOT}/skills/design/scripts/round-gate.py`, state in
  `~/.cache/research-design-gate`. It treats a log as open only once it has *Problem* and *Rounds*.
- **The benchmark harness** (`benchmarks/harness/bench.py`) points `SKILL_DIR` at
  `~/Cboost/claude-skills/research/skills/design`.

## Decisions of this session
- `discovery-merge-losses.md`: **Reviewed** 2026-10-31; plan step 1 committed (`2c6d286`). Choice P3 (above).
  Requirements as the user set them: L1b, a worked-out option is set aside only for a requirement-tied reason
  someone other than the researcher checks (reach: worked-out generator options only, the user's choice); L2 the
  documented route (should); L3 ranking by requirements (could: "only the rejection-check questions"); L4b "keep the
  skill light" (should); L5 costs shown, not capped, so they break ties only. Known gaps in its *Decision*:
  titles, search finds and the user's options get no automatic row; a merge the bias check misses stays merged; L3
  rests on a check told the leader (the blind scorer O6 comes back if a run shows it skipped).
- Its generator reports are kept in `discovery-merge-losses.discovery/`, renumbered to the ID format.
- The earlier decisions (`skill-packaging.md`, `problem-understanding.md`) are unchanged; see their *Decision*.
- The recumbent-rack benchmark replay (~$8.50) waits until the user chooses to run it: don't propose it as the next
  step.

## Next steps
Pick by the user's choice; in TODO order:
1. **Check every skill's flow control** (TODO): problem-formulation's step 4 "go straight to step 6" skips the
   requirements inventory (step 5); fix it and the README edge, then check `research:design` the same way.
2. **Step 3 of skill-packaging**: install on a clean `$HOME` with
   `claude plugin install research --marketplace cboostcdouwes/claude-skills`; check both skills load and the gate
   runs. Needs a version bump first (user's call).
3. **The Verdict column out of `shared/log-template.md`** (user, 2026-10-31): verdicts stay in the rejection records
   and the Matrix. Note: `log-sections.py` hides that column from the bias check, and merges are now written in the
   summary for that reason; check both when the column goes.
4. **A problem-diagnosis section in problem-formulation** (user, 2026-10-31): ask what it holds first.
5. **Confirm the skill-packaging benchmark draft** (`benchmarks/skill-packaging/README.md`); it could measure the
   merge-loss change once the harness can run it.

## Planned direction (not started)
- `research:design` ends with an overview of the leading options instead of forcing a decision, and likely splits
  into `explore` and `compare` skills with `design` as the orchestrator (user, 2026-10-30). Each option shown with
  its caveats and all its costs side by side goes there (user, 2026-10-31).

## Things to know
- The round gate finds research logs only by absolute paths in the session's tool calls. Write logs by absolute path.
- Don't also register the GitHub marketplace on this machine: `research` would load twice.
- `benchmarks/harness/__pycache__/bench.cpython-314.pyc` is tracked in the vault's git; it changes on every harness
  run (ignore it or untrack it).
- Render a README's flowchart to check it: `mmdc -i <README> -o <scratch>/README.md` for syntax, and the extracted
  block with `mmdc -i flow.mmd -o flow.png -s 2` to see the labels (`rsvg-convert` drops them).
- Comprehension help: a worked example traced through today's flow and the new one, with real script output, was
  rated 4 (`~/.claude/UNDERSTANDING_EXPERIMENTS.md`, 2026-10-31).

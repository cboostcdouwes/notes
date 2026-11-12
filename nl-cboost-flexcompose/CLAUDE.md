# CLAUDE.md

This repo is **FlexCompose**: a Rust CLI that turns a template (`flexcompose.yaml`: plain Docker Compose plus
`flexcompose_options` keys) into one plain Compose file for a cboost ROS 2 dev box, or for a machine's release (its
images and the machine's file, design §13). It only writes files; boxes run with plain `docker compose`. The repo was
once *SCCOTS Docker Templates*; the old ytt-based generator and the Go CLI (until `c88283f`) are in git history only.

`README.md` is the user guide. `REQUIREMENTS.md` is the only source of requirements (what FlexCompose must achieve
and why, by MoSCoW priority, each verified or not); every other file follows it, and a requirement changes there
first. `FLEXCOMPOSE_DESIGN.md` is the source of truth for behavior, how the requirements are met (the code and tests
cite it by section, e.g. "design §7", and the requirements by tag). `DEVBOX_DESIGN.md` is superseded history: don't
follow it.

## Layout

| Path | What |
|---|---|
| `flexcompose-cli/` | The Cargo crate (edition 2024, `rust-version` in `Cargo.toml`); `src/` the code, `tests/` the integration tests |
| `flexcompose-cli/fragments/` | Plain Compose fragments, built into the binary with `include_dir!` (so they must stay inside the crate) |
| `flexcompose-cli/testdata/ros2-dev/` | The ROS2-DEV template, pinned for `the_output_follows_the_os_fragments` (see below) |
| `templates/devbox/` | Starter template users copy: `flexcompose.yaml`, `.devcontainer/`, `.gitignore`, `README.md` |
| `templates/service/` | Starter service repo: its template and release override, `dependencies.repos`, `Dockerfile`, `bootstrap.sh`, `.devcontainer/` |
| `templates/integration/` | Starter integration repo (one per machine): `dependencies.repos` (its services), a template with only `imports`, the release override, `lock.sh`, `release.sh`, `bundle/`, `.devcontainer/<service>/` |
| `tests/` | `e2e.sh` + `e2e-lib.sh`: manual end-to-end test of both starters (a service alone, the machine's dev boxes, lock, `release.sh`, machine); not in CI |
| `example/ros2-dev/` | Template of the live ROS2-DEV box (project `packml-ros2`), the worked example |
| `example/docker-compose-base.yaml` | Old multi-service stack in the legacy format, kept unchanged as the first release-target candidate; FlexCompose can't read it |
| `OLD/` | Unrelated old ROS 2 performance demos (Cyclone vs Fast DDS); untouched |
| `~/Cboost/Notes/nl-cboost-flexcompose/` | The user's personal notes for this repo, in the notes vault outside the repo; `TODO.md` lists what is left to do, in order of importance |

## Commands

All in `flexcompose-cli/`. Every step must leave these passing:

```sh
cargo fmt --check
cargo clippy --all-targets
cargo test
cargo test --test imports     # one test file; cargo test <name> for one test
cargo deny check              # dependency licenses, advisories and sources (deny.toml); needs cargo-deny
make                          # bin/ binaries for Linux; .\build.ps1 on Windows
make install                  # Linux: ~/.local/bin/flexcompose; .\build.ps1 install on Windows (WindowsApps)
```

After a change to the release targets or a starter in `templates/`, also run, from the repo root (slow; needs Docker
with buildx, Rust, Python with venv, `nl-cboost-ros-tools` for `cdr` (`CDR_TOOLS`), the Docker bridge at
172.17.0.1 and the base image `cboost-c-nas:5100/cboost-ros2-jazzy:0.3.0`):

```sh
tests/e2e.sh <scratch folder>  # a new folder, or an earlier one of this test (it refuses any other)
```

Binaries in `bin/` are never committed. The version is `version` in `Cargo.toml`; a release build stamps its own
with the `FLEXCOMPOSE_VERSION` environment variable (`src/lib.rs`).

## Code map

The code is in layers, each using only those below it (`src/lib.rs`); each module's `//!` doc says what it holds.

- `cli.rs`: the command line (`generate`, `regenerate`, `version`), with clap.
- `run/`: one run. `generate.rs` (the flow of generate and regenerate), `guard.rs` (the overwrite guard: header +
  body sha256, `--force`, the sticky project, `--switch`), `report.rs` (the summary: what was written, where the
  workspace lives, what a change or a switch means for the box), `console.rs` (stdout and stderr), `files.rs`.
- `output/`: building the output. `render.rs` (target, then features, then for a release the override; key order),
  `merge.rs` (the small own merge: scalars replace, maps merge, lists get only missing entries; two different mounts
  on one container path are an error), `imports.rs` (`flexcompose_options.imports`: imported services join under
  their own names, paths rebased onto their folder, their workspace their own folder and volume), `header.rs` (the
  `# flexcompose: <key> <value>` lines that `regenerate` reads back).
- `input/`: what a run reads, checked as it is read. `template.rs` (strict validation, the options taken out),
  `release.rs` (the override `flexcompose.release.yaml`), `fragments.rs` (the built-in fragments).
- `model/`: the closed sets. `choices.rs` (targets, OSes, features, project names), `workspace.rs` (where each dev
  box target keeps the work, as data; a test checks it against the fragments).
- `problem.rs` (the messages, with miette: what happened and, in the help, what to do next) and `yaml/` (a small node
  tree that keeps each node's place and each scalar's YAML type; `parse.rs`, `emit.rs`, `resolve.rs` by yaml.v3's
  rules, which Compose reads its files with) serve every layer.

## Fragments

- Targets: `fragments/targets/devbox-volume|devbox-host-src|devbox-host|release-build|release/` (`:` is written `-`,
  as Windows forbids `:`). A dev box target goes into `workspace: true` services; `release` into every service,
  `release-build` into every service with `build:`.
- Features: `fragments/features/enable_<x>/`. Fragments configure the placeholder service `flexcompose-target`, which
  is merged into each opted-in service and never reaches the output; keys outside `services:` merge at file level.
- Merge order is fixed: target, then the features in their order (`model/choices.rs`), then (release targets) an
  imported service's own override, then the template's override. A new feature = a new folder + its place in that
  order (also update the README feature table).

## Invariants to preserve

- **Deterministic output**: LF, no timestamps, paths in the header relative to the output. Same inputs, same bytes
  (`the_output_is_deterministic_and_records_the_choices`, `regenerate_reproduces_the_same_bytes`). Any change to
  output bytes recreates every user's box on their next `up`, so treat output changes as user-visible and deliberate.
- **Frozen `source_workspace` declaration** (`the_volume_targets_declare_the_frozen_workspace_volume`): changing it
  makes Compose offer *Recreate (data will be lost)?*. An imported workspace service's volume is
  `source_workspace_<service>`.
- **Safety defaults**: every override is an explicit flag; `regenerate` has no `--force`/`--switch`. Messages never
  suggest commands that delete a box or workspace (`down -v`, `rm`), only `stop`, and never suggest exporting
  `WORKSPACES_DIR` or `COMPOSE_PROJECT_NAME`.
- **Strict templates**: only `true`/`false` booleans; unknown option keys, top-level `name:`, a top-level
  `source_workspace` volume, anchors/aliases, `<<`, duplicate keys, YAML tags other than `!!str` and multi-document
  files are errors.

## Tests

- Integration tests in `flexcompose-cli/tests/` run the CLI in-process through the helpers in `tests/common/mod.rs`
  (`TestBox`, `generate`, `must_generate`, `regenerate`, `body_of`, `record_of`, ...) against temp dirs; follow that
  pattern. One file per area: `generate.rs`, `targets.rs`, `release.rs`, `imports.rs`, `cli.rs` (the binary itself).
  Test names are sentences describing the rule (`regenerate_reproduces_the_same_bytes`).
- `the_output_follows_the_os_fragments` generates from `testdata/ros2-dev/flexcompose.yaml` (via `ros_template`)
  and pins the body on Linux and Windows; it is the only test of the Windows fragments of `enable_gui` and
  `enable_gpu`. The testdata template deliberately differs from `example/ros2-dev/`; don't sync them.
- Tests check what FlexCompose must achieve: the right Compose file, the same bytes for the same inputs, no lost
  work, invalid templates refused. Rewording a message must break no test (decided 2026-10-22):
  - An error test checks *that* it is refused, plus facts the message names (a key path, flag, value, file, project,
    volume or command) only when that costs no extra lines. Never assert on sentences.
  - The safety rules on messages stay tested: no `down`, `down -v`, `rm`, `prune`, and no exporting
    `WORKSPACES_DIR`/`COMPOSE_PROJECT_NAME`.
  - No tests for notes, hints or help texts, and none for edge cases that don't affect the goal.
  - Compare bytes exactly only for output bodies and determinism.
  - A table of cases with one yes/no column per rule reads best.
- Property tests (`proptest`, test-only) only where one stated rule replaces several examples (`model/choices.rs`,
  `output/merge.rs`, the round trip in `tests/generate.rs`). Never use the code under test as the oracle.

## Style

- Comments and error messages are full English sentences that explain *why* and tell the user what to do next,
  often citing a design section or a requirement tag. Match that tone.
- Docs (README, design) use short, plain sentences, tables. Diagrams are Mermaid blocks in the Markdown (GitHub
  renders them), not image files. The integration starter's README holds the copies of the main README's release
  diagrams: change them together. When behavior changes, update `FLEXCOMPOSE_DESIGN.md` (including its decision
  log / known gaps) and the README tables alongside the code.
- Dependencies: keep the binary's few; use the standard library first. Test-only dependencies are fine.
- Commit messages: short, keep to the conventional commits format (`fix:`, `doc:` etc.).

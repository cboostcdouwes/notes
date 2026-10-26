# CLAUDE.md

This repo is **FlexCompose**: a Go CLI that turns a template (`flexcompose.yaml`: plain Docker Compose plus
`flexcompose_options` keys) into one plain Compose file for a cboost ROS 2 dev box, or for a machine's release (its
images and the robot's file, design §13). It only writes files; boxes run with plain `docker compose`. The repo was once *SCCOTS Docker Templates*; the old ytt-based generator is in git
history only.

`README.md` is the user guide. `FLEXCOMPOSE_DESIGN.md` is the source of truth for behavior and the reasons behind it
(the code and tests cite it by section, e.g. "design §7"). `DEVBOX_DESIGN.md` is superseded history: don't follow it.

## Layout

| Path | What |
|---|---|
| `flexcompose-cli/` | The Go module (`module flexcompose`, Go 1.24, one dependency: `go.yaml.in/yaml/v3`; tests also use `pgregory.net/rapid`) |
| `flexcompose-cli/fragments/` | Plain Compose fragments, embedded with `go:embed` (so they must stay inside the module) |
| `flexcompose-cli/testdata/ros2-dev/` | The ROS2-DEV template, pinned for `TestOutputFollowsTheOSFragments` (see below) |
| `templates/devbox/` | Starter template users copy: `flexcompose.yaml`, `.devcontainer/`, `.gitignore`, `README.md` |
| `templates/integration/` | Starter integration repo (one per machine): the dev box plus the release (`flexcompose.release.yaml`, `dev.repos`/`release.repos`, `bootstrap.sh`, `Dockerfile`, `release.sh`) |
| `tests/` | `e2e.sh` + `e2e-lib.sh`: manual end-to-end test of the integration starter (dev box, `release.sh`, robot); not in CI |
| `example/ros2-dev/` | Template of the live ROS2-DEV box (project `packml-ros2`), the worked example |
| `example/docker-compose-base.yaml` | Old multi-service stack in the legacy format, kept unchanged as the first release-target candidate; v1 can't read it |
| `OLD/` | Unrelated old ROS 2 performance demos (Cyclone vs Fast DDS); untouched |
| `~/Cboost/Notes/nl-cboost-flexcompose/` | The user's personal notes for this repo, in the notes vault outside the repo; `TODO.md` lists what is left to do, in order of importance |

## Commands

All in `flexcompose-cli/`. Every step must leave `go vet ./...` and `go test ./...` passing:

```sh
go vet ./...
go test ./...
go test -run TestOverwriteGuard ./...
make                          # bin/flexcompose-{windows,linux}-amd64 (-trimpath); .\build.ps1 on Windows
make install                  # Linux: ~/.local/bin/flexcompose; .\build.ps1 install on Windows (WindowsApps)
```

After a change to the release targets or `templates/integration/`, also run, from the repo root (slow; needs Docker
with buildx, Go, the Docker bridge at 172.17.0.1 and the base image `cboost-c-nas:5100/cboost-ros2-jazzy:0.2.0`):

```sh
tests/e2e.sh <scratch folder>  # a new folder, or an earlier one of this test (it refuses any other)
```

Binaries in `bin/` are never committed (`bin/.gitignore` ignores everything). The version is `var version` in
`main.go`, stampable with `-ldflags "-X main.version=..."`.

## Code map (all `package main`)

- `main.go`: subcommands (`generate`, `regenerate`, `version`, `help`), flags, and the safety checks: overwrite
  guard (header + `body-sha256`, `--force`), sticky project name (`--project`), target switch (`--switch`), and the
  user-facing warnings/notes (`changeReport`, `sharedSwitchNote`, `sharedHostFolderWarning`). `docker compose` verbs typed as commands get a pointer to plain Compose.
- `template.go`: `loadTemplate` parses and strictly validates a template (`readYAML`/`parseYAML` are shared with the
  release override); holds `devboxTargets` (the dev box types), `featureOrder`,
  `workspaceVolume` (`source_workspace`). Also small `yaml.Node` helpers (`valueOf`, `take`,
  `set`, `scalar`, `show`).
- `fragments.go`: loads `fragments/<dir>/compose.yaml` then `compose.<os>.yaml`, freshly parsed per call.
- `merge.go`: the small own merge (not the Compose library): scalars replace, maps merge, lists append only missing
  entries, `command`/`entrypoint` replace whole; two different `volumes`/`devices` entries on one container path are
  an error (`containerPath`/`splitSpec` handle `${...}` and drive letters).
- `output.go`: `render` (target, then features in fixed order; drops `build:` from workspace services), `encode`
  (fixed service key order, comments/styles dropped), the header with `# flexcompose: <key> <value>` lines that
  `regenerate` reads back, `workspaceNote`, `writeAtomic`. For a release target `render` also loads the override,
  adds its own services, merges it last per service and at file level.
- `release.go`: the release targets (design §13): the table `releaseTargets` (name, output, project suffix, `builds`),
  `targetNames`, `findRelease`/`isRelease`, `defaultOutput`, `composeProject`; the override `flexcompose.release.yaml`
  (`loadOverride`, `addOverrideServices`, `mergeOverride`); `finishReleaseService` (`BASE_IMAGE` via `addBaseImage`
  for `release:build`, `build:` removed for `release`, an `image:` required).

## Fragments

- Targets: `fragments/targets/devbox-volume|devbox-host-src|devbox-host|release-build|release/` (`:` is written `-`,
  as Windows forbids `:`). A dev box target goes into `workspace: true` services; `release` into every service,
  `release-build` into every service with `build:`.
- Features: `fragments/features/enable_<x>/`. Fragments configure the placeholder service `flexcompose-target`, which
  is merged into each opted-in service and never reaches the output; keys outside `services:` merge at file level.
- Merge order is fixed: target, then `featureOrder` in `template.go`, then (release targets) the override. A new feature = a new folder + an entry in
  `featureOrder` (also update the README feature table and the valid-keys test message).

## Invariants to preserve

- **Deterministic output**: LF, no timestamps, paths in the header relative to the output. Same inputs, same bytes
  (`TestOutputIsDeterministicAndRecordsTheChoices`, `TestRegenerateReproducesTheSameBytes`). Any change to output bytes recreates every
  user's box on their next `up`, so treat output changes as user-visible and deliberate.
- **Frozen `source_workspace` declaration** (`TestWorkspaceVolumeDeclarationIsFrozen`): changing it makes Compose
  offer *Recreate (data will be lost)?*.
- **Safety defaults**: every override is an explicit flag; `regenerate` has no `--force`/`--switch`. Messages never
  suggest commands that delete a box or workspace (`down -v`, `rm`), only `stop`, and never suggest exporting
  `WORKSPACES_DIR` or `COMPOSE_PROJECT_NAME`.
- **Strict templates**: only `true`/`false` booleans; unknown option keys, top-level `name:`, a top-level
  `source_workspace` volume, anchors/aliases, `<<`, duplicate keys and multi-document files are errors.

## Tests

- Tests run the CLI in-process via helpers in `main_test.go` (`gen`, `regen`, `mustGen`, `newBox`, `wantErr`, ...)
  against temp dirs; follow that pattern. Release tests are in `release_test.go` (`newRelease`, `readCompose`: assert
  on the parsed output, not its text). Test names are sentences describing the rule (`TestProjectNameIsSticky`).
- `TestOutputFollowsTheOSFragments` generates from `testdata/ros2-dev/flexcompose.yaml` (via `rosTemplate`) and pins
  the body on Linux and Windows; it is the only test of the Windows fragments of `enable_gui` and `enable_gpu`.
  The testdata template deliberately differs from `example/ros2-dev/` (e.g. image tag `0.0.1` vs `0.2.0`); don't sync
  them.
- Tests check what FlexCompose must achieve: the right Compose file, the same bytes for the same inputs, no lost
  work, invalid templates refused. Rewording a message must break no test (decided 2026-10-22):
  - An error test checks *that* it is refused (`wantErr(t, err)`), plus facts the message names (a key path, flag,
    value, file, project, volume or command) only when that costs no extra lines. Never assert on sentences.
  - The safety rules on messages stay tested: no `down`, `down -v`, `rm`, `prune`, and no exporting
    `WORKSPACES_DIR`/`COMPOSE_PROJECT_NAME`.
  - No tests for notes, hints or help texts, and none for edge cases that don't affect the goal.
  - Generate's outcome is `contentLine(t, stdout)` (`unchanged`, `changed...`, `project changed...`); choices are
    read back with `readHeader`. Compare bytes exactly only for output bodies and determinism.
  - A table of cases with one yes/no column per rule reads best.
- Property tests (`pgregory.net/rapid`, test-only) only where one stated rule replaces several examples
  (`containerPath`, `folderProject`, the round trip). Never use the code under test as the oracle. A failing run
  writes `testdata/rapid/`; delete it, don't commit it.

## Style

- Go comments and error messages are full English sentences that explain *why* and tell the user what to do next,
  often citing a design section. Match that tone.
- Docs (README, design) use short, plain sentences, tables. Diagrams are Mermaid blocks in the Markdown (GitHub
  renders them), not image files. The template READMEs end with copies of the main README's diagrams: change
  them together. When behavior changes, update
  `FLEXCOMPOSE_DESIGN.md` (including its decision log / known gaps) and the README tables alongside the code.
- Dependencies: the binary has one (`go.yaml.in/yaml/v3`) and should stay small; use the standard library first.
  Test-only dependencies are fine (`pgregory.net/rapid` for property tests).
- Commit messages: short, keep to the conventional commits format (`fix:`, `doc:` ect.).

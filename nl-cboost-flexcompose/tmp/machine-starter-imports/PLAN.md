# Plan: service repos with their own template, imported by the machine

Written 2026-11-10 for implementation on 2026-11-11. It replaces `../machine-starter/PLAN.md` (the reviewed plan with
one generic recipe in the integration repo). What is being built, and why, is in `README.md` next to this file; the
working example is `service/`, `service-as-image/`, `integration/` and `test.sh` here (18 checks passed 2026-11-10).

One step is one commit, made by the user. Each step ends with a test that must pass before the next starts.

## Status (2026-11-10)

- **FlexCompose repo** (`nl-cboost-flexcompose`, branch `dev/release-target`, HEAD `c88283f`): the import prototype
  is in the working tree, uncommitted: `src/input/template.rs`, `src/input/release.rs`, `src/model/workspace.rs`,
  `src/output/imports.rs` (new), `src/output/merge.rs`, `src/output/mod.rs`, `src/output/render.rs`,
  `src/run/generate.rs`, `tests/imports.rs` (new). 106 tests pass, clippy is clean. Nothing else is changed.
- **Base image repo** (`nl-cboost-docker-ros2`): clean, no change yet.
- **This example**: runs against a stand-in base (`base/Dockerfile`: 0.2.0 plus `cdr`).
- **Not decided by the user yet**: nothing blocks the steps. The user has not reviewed the code line by line.

## Before starting

1. `git status` and `git log` in both repos; re-read any file the user edited since.
2. Ask the user to confirm the requirement rows of step 2 and step 4 (REQUIREMENTS.md is the source of
   requirements; a Must needs the user's word).
3. The host needs `cdr` and `vcs` for steps 3 and 4: `pip install <nl-cboost-ros-tools>/tools vcs2l` (in a venv).
4. Still open from the old plan: tell the colleague that `cdr --verify` is withdrawn.

## Order

```text
1  base image: cdr, ~/.colcon owned by the user          nl-cboost-docker-ros2
2  FlexCompose: imports (code, tests, docs)              the working tree, plus docs
3  starter: a service repo, with its part of the e2e     needs 1
4  starter: the integration repo imports, e2e rewritten  needs 2, 3
5  notes: decision, old plan retired                     vault, no commit
6  PolyMX on the new starters                            other repos, after use of 1-4
```

Steps 1 and 2 don't depend on each other.

## Step 1: base image with cdr (`nl-cboost-docker-ros2`)

- `docker/Dockerfile`: install `cdr` (`nl-cboost-ros-tools/tools`, a pip package; decide how the build gets it:
  a copy in the build context, or a git URL with an SSH mount). Make `~/.colcon` belong to `cboost-user` (it is
  root's in 0.2.0, so a user can't write `defaults.yaml`).
- `vcstool` stays unless the colleague wants `vcs2l`: it works on the base's Python 3.12.
- Release it as `cboost-ros2-jazzy:0.3.0`.
- **Test**: `docker run --rm --entrypoint bash <image> -c 'cdr --help && touch ~/.colcon/x && vcs --version'`.
- Commit: `feat: install cdr for workspace resolution`.

Until 0.3.0 exists, steps 3 and 4 can run against the stand-in: build `base/Dockerfile` here with the context
`nl-cboost-ros-tools/tools` and tag it as the base the starters name.

## Step 2: FlexCompose imports (`feat`)

The code is written. This step adds the docs and is committed as one.

- Code (in the working tree): `flexcompose_options.imports: [<folder>]` reads `<folder>/flexcompose.yaml`; the
  imported services join under their own names with their relative paths rebased (build context, bind mounts, env
  files); an imported `workspace: true` service gets its folder as `src/` and the volume
  `source_workspace_<service>`; `devbox:host` is refused for it; for a release, `<folder>/flexcompose.release.yaml`
  is merged under the importing override.
- `FLEXCOMPOSE_DESIGN.md`: §3 (the `imports` key and its one spelling), §4 (an imported service's workspace), §6
  (order: the import, target, features, the imported override, the own override), §7 (the volume per imported
  service; the notes), §13 (imported release overrides), §12 decision log and known gaps (below).
- `README.md`: *Template format* (the file-level keys), *Targets and features* (the imported workspace).
- `REQUIREMENTS.md`, to confirm with the user first:

  | Tag | Requirement | Proposed priority |
  |---|---|---|
  | `service-owns-setup` | A service's build recipe and FlexCompose settings live in the service's repo, and a machine takes them in without copying them | should |
  | `service-alone` | A service's dev box and image work from its repo alone | should |
  | `services-added-alike` | Every service is added to a machine in the same way | should |

- Known gaps to record: only three kinds of path are rebased; an importing template's own workspace service mounts
  `.`, which holds the imported folders; top-level keys of imports are merged (equal volume names are shared); the
  switch and shared-folder notes ignore imported workspaces; no nested imports; no choice per developer between
  source and image (`--image`, deferred).
- **Test**: `cargo fmt --check`, `cargo clippy --all-targets`, `cargo test` in `flexcompose-cli/`; then `./test.sh
  <scratch>` here with the built binary on `PATH` (18 checks).
- Commit: `feat: a template imports the services of templates in other folders`.

## Step 3: starter for a service repo (`feat`)

- `templates/service/`: the files of `service/` here (`Dockerfile`, `.dockerignore`, `.gitignore`,
  `.gitattributes`, `dependencies.repos`, `flexcompose.yaml`, `flexcompose.release.yaml`, `bootstrap.sh`,
  `.devcontainer/devcontainer.json`) and a new `README.md`: the files, the checklist, how it runs alone and in a
  machine, and a section for a service that runs as an image (the two templates of `service-as-image/`, shown in
  the README, not a second folder).
- For private repositories, the as-image template's `build:` needs `ssh: [default]` so that Compose can build it
  in a dev box (the release adds it already). Untested so far: the example uses `git://`.
- `tests/e2e.sh`, `tests/e2e-lib.sh`: a new first part, "a service on its own", from `test.sh` here: a service
  fixture from the starter with the existing demo packages; its own dev box (an open before `--update` fails with
  the hint; `--update` clones into `deps/`; the checkout stays clean; build and run); its image from a clone
  (`docker build`). The existing integration part stays and must still pass.
- Root `README.md`: the starters list.
- **Test**: `tests/e2e.sh <scratch>` (old integration part and the new service part).
- Commit: `feat: a starter for a service repo with its own dev box and image`.

## Step 4: the integration starter imports its services (`feat!`)

- `templates/integration/`: as `integration/` here. Remove `Dockerfile`, `dev.repos`, `release.repos`,
  `bootstrap.sh`; add `dependencies.repos`, `lock.sh`, `.devcontainer/<service>/devcontainer.json`; `flexcompose.yaml`
  holds only `imports`; `flexcompose.release.yaml` builds each service from the locked tree; `release.sh` generates
  inside the checkout of `lock.repos`; `README.md` rewritten (files, adding a service, workflows, both diagrams).
- `tests/e2e.sh`, `tests/e2e-lib.sh`: the machine part from `test.sh` here (generate refused until the services are
  checked out; the from-source service's box; the as-image service next to it; lock; release; the bundle on the
  machine). Keep today's checks: the refusals of `release.sh` (uncommitted, untagged, a tag that is no version, no
  SSH agent), plus a lock written for another `dependencies.repos`; the small build context on a second run; no
  marked source in any layer and the failing leak release; update, rollback and removal of old images; a customer
  tag `v1.0.0+acme` giving images `1.0.0_acme`.
- `FLEXCOMPOSE_DESIGN.md` §13: the repos and what each holds, the dev box per service, the first sync on the host,
  the lock and the release from it, customer branches and tags; decisions and known gaps (dev boxes and the release
  resolve dependencies differently; an as-image service's dev image is not built from the lock; `vcs` and `cdr` on
  the host; a devcontainer folder per from-source service).
- `README.md`: *Releases* and its diagrams (copies of the starter README's: change them together; check with
  `mmdc`).
- `REQUIREMENTS.md`: reword `integration-repo` (an integration repo per machine names its services; a service's
  setup is in its repo) and `release-traceable` (the bundle's `lock.repos`); add the rows of the old plan's step 5
  that still hold (`release-from-lock`, `stale-lock-refused`, `lock-reviewed`, `open-leaves-work`, `open-offline`,
  `missing-repo-hint`), verified 2026-10-29 unless the user says otherwise.
- **Test**: `tests/e2e.sh <scratch>`, complete.
- Commit: `feat!: the integration starter imports its services and releases from a lock`, with `BREAKING CHANGE: an
  integration repo no longer holds a Dockerfile, dev.repos or release.repos; its services bring their own`.

## Step 5: notes (no commit)

- `machine-starter-template.md`: a review round for 2026-11-10 and the changed *Decision* (the recipe and the
  FlexCompose settings in the service repo; imports; each from-source service's own checkout as `src/` with its
  dependencies in `deps/`; the costs the user accepted). The *Decision* sections of `machine-repo-layout.md` and
  `machine-release-programs.md` (the old plan's step 0).
- `../machine-starter/PLAN.md`: mark as replaced by this file. Ask before deleting `../machine-starter-services/`.
- The vault's `CLAUDE.md`: it still describes the Go CLI and the old starter.
- `TODO.md`.

## Step 6: PolyMX (other repos, on `feat/flexcompose-integration`, never on `main`)

After steps 1-4 have been used once.

- `nl-polymx-automated-qc-application`: the service starter's files. Its own steps go with it: the temporary pip
  step for the four Python libraries in its `Dockerfile` and in its `bootstrap.sh`; settle its `dependencies.repos`
  (two branches it names no longer exist).
- `nl-polymx-ai-suite-inference`: an as-image template around `Dockerfile.serve`.
- `nl-polymx-automated-qc`: the integration starter; `./lock.sh`; a test release; a run on the machine.
- **Test**: the dev box in VS Code (Linux, then Windows), a release bundle on the machine.

## Deferred, not part of this plan

- Windows speed: recommend the checkout in the WSL filesystem with `devbox:host-src` (untested); `devbox:volume`
  seeded by the repo's `bootstrap.sh` from a read-only mount (FlexCompose adds only the mount).
- `generate --image <service>`: a per-developer choice, which also gives an as-image service its own dev box.
- FlexCompose passing `build:` on as written (the old plan's step 1): an as-image service writes `BASE_IMAGE` out
  until then.
- A warning when an importing template has a workspace service of its own.
- Keeping copied starter files in sync (a template tool), with the second machine.

## To check by hand, outside the tests

- VS Code: *Reopen in Container* with `.devcontainer/<service>/`, and Source Control finding `src/deps/<repo>`.
- SSH: `vcs import` on the host and a service's image build against private repositories.

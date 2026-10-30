# Resume: machine repo layout and programs with their own recipe (session of 2026-10-28)

**Superseded for the next steps (2026-10-29):** the child research `machine-starter-template.md` worked out the
starter with `cdr` and changed A-2 for colcon services (a generic recipe in the integration repo). Resume from
`tmp/machine-starter/PLAN.md` (status, decisions, next steps); this file stays as the record of 2026-10-28.

Handoff for the next session. The research logs are the single source of the details; this file says where things
stand, what was decided and why in one line each, and what comes next.

## Files

| File | What it holds |
|---|---|
| `machine-repo-layout.md` | The layout decision (split into A-1..A-5): requirements M1-M14, options, matrices, evaluation per round |
| `machine-repo-layout.rounds.md` | Every round's full entry, answers, checks and searches; *Dropped requirements* (M9) |
| `machine-repo-layout.overview.md` | File trees of the options that led (A0, A1, A2, A3, A7, A9, A10, A14-default) |
| `machine-release-programs.md` (+ `.rounds.md`, `.overview.md`) | The sibling: programs with their own recipe; now A-5 (the base image), round 11 |
| `tmp/machine-repo-layout-drafts/` | Drafts and spikes: `templates/` (A2, A14-default, A14-all with READMEs), `draft-a1/`, `draft-a10/`, `draft-a14/`, `draft-round6.md`, `spike-profiles/`, `spike-subpath/`, `spike-dcgit/` |

## Decisions (all by the user, 2026-10-28; not yet written as *Decision* sections)

- **A-1, pins and locks:** colcon services follow `cdr`'s convention (`nl-cboost-ros-tools/tools`, deps-resolve):
  each repo declares its direct dependencies in its own `dependencies.repos`; the machine repo is the top-level
  file; only it may `override: true`; a committed `lock.repos` per release is the build's input. Python services
  are built with their own Dockerfile and pin pip there; the machine pins only their commit.
- **A-2, where a service's recipe lives:** in the service's repo. The app's `Dockerfile` moves from the machine repo
  to the app repo; the machine repo loses `Dockerfile`, `dev.repos`, `release.repos`.
- **A-3, the dev box (for now):** the app is the one workspace service (`workspace: true`, as today); every other
  service (inference, a future driver) runs as an image built from its git context (`pull_policy: build`). No
  FlexCompose change for the dev box. A second colcon service from source is a later decision (below).
- **A-4, customer variants:** branches of the machine repo; `main` holds the default configuration and the base tag
  (`v1.2.0`); a customer needing special configuration gets a feature tag or a customer-specific tag. Accepted cost:
  a fix for all customers is merged into every customer branch (fine while customers are few).
- **A-5, the app's base image (sibling F2):** the template's `image:` names the dev box's base; the release override
  passes `BASE_IMAGE` literally; the app Dockerfile's `ARG BASE_IMAGE` default is overridden. The two literals are an
  allowed dev/release difference (M13). Accepted gap: a forgotten bump of one literal goes unnoticed.

Requirements that carried them (details in the log): M1 (must, all services in the dev box), M13 (no copies;
overrides fine; dev and release may differ; exception: a service's version as `image:` tag and git ref), M14
(FlexCompose stays simple, ranks above M12), M11 (a service's repo knows nothing about machines, customers or
integrations), M6 (as images depends on the service), M8 (customers may differ in versions, configuration, base),
sibling N22 (FlexCompose adds nothing to `build:`), N25 (a reader of the template can tell what the dev box runs).

## Verified facts this session (spikes and code)

- Dev Containers find a container by Compose project and service label and reuse a running one; recreation only on
  Rebuild (devcontainers/cli `dockerCompose.ts`, via the round-5 rejection check). So the stack must be right before a
  window opens; per-service Compose file lists in devcontainers can't switch what runs from source.
- `devcontainer up` fails on a service whose `build:` is a git context (`ENOENT .../git:/...#v1/Dockerfile`), with or
  without a non-root user (spike `spike-dcgit`, CLI 0.89.0). So the workspace service must run `image:` in the dev
  box: FlexCompose's rule "drop `build:` of a workspace service" (`output.go:46-56`) stays.
- Switching Compose profiles leaves the other profile's service running, also with `--remove-orphans`
  (`spike-profiles`).
- A named volume mounts per service at a `volume.subpath`, only once the subfolder exists (`spike-subpath`); subpaths
  were dropped (they nest other services' work in the app's colcon workspace).
- FlexCompose requires at least one workspace service (`output.go:33`) but doesn't refuse two, which would silently
  share one volume and `src/`.
- A shared-package version conflict exists today: the state manager's `dependencies.repos` pins `packml_ros2` at
  `feature/packml-2022`, the machine at `dev/heartbeat-recovery`; `cdr` would stop on it and name both owners.

## Known gaps and later decisions

- **A second colcon service from source** (e.g. a robot driver on another OS): `workspace: <path>` and its meaning per
  placement, a volume per service (the app keeps `source_workspace`), nested paths (`COLCON_IGNORE` or refused), `cdr`
  per workspace with a cross-service check, a devcontainer per workspace service, maybe a per-developer choice. Until
  then: a service run as an image is not listed in the machine's `dependencies.repos`.
- **Customer tags vs image names:** `release.sh` derives the image tag from the git tag; a customer tag must give a
  distinct image tag (e.g. `polymx-qc:customer-a-1.2.0`).
- Windows (N14): the git SSH build context and `release.sh` untested on Docker Desktop.
- Not asked yet: a stub for inference on PCs without a GPU (M1); ONNX models as IP under `no-compiled-source`.
- N21: propose the rewording of `integration-repo` in REQUIREMENTS.md (package repos may hold their own recipe).
- `cdr` is not in PolyMX's `bootstrap.sh` or the base image yet.

## Next steps

1. Write the *Decision* sections (skill `design-research`, Phase 6) of `machine-repo-layout.md` and
   `machine-release-programs.md`: choice, why (each on a confirmed requirement), rejected, gaps, child decisions;
   have the user confirm *Why* and *Rejected*; review in open chat before any code.
2. A plan in commit-sized steps, to propose then (not decided yet):
   - `feat!` FlexCompose passes `build:` on as written (`addBaseImage` and the `release:build` fragment's `target`,
     `ssh` go; the devbox rule stays); tests; design §13.
   - FlexCompose refuses a second `workspace: true` service (a loud guard until per-service workspaces exist).
   - Starter template: the app's `Dockerfile` in a service repo template; the machine repo with `dependencies.repos`
     (top level), `bootstrap.sh` running `cdr`, `release.sh` per tag with the lock as build input, F2's base literals;
     docs (design §13, README, REQUIREMENTS.md: M-requirements at their priorities, N21).
   - PolyMX: migrate (the app's Dockerfile to `-application`, `dependencies.repos` reconciled, inference as a program).
   - After use: ask the user what using it showed.
3. Comprehension: the user was offered a walkthrough of the templates (not yet answered).

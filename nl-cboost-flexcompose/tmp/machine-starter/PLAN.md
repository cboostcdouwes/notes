# Plan: machine starter with cdr

From the decision in `../../machine-starter-template.md` (*Decision*), which builds on `../../machine-repo-layout.md`
(A-1..A-5, A-2 changed for colcon services) and `../../machine-release-programs.md` (F2). The finished starter is in
`integration/` next to this file: the target state of `templates/integration/`.

One step is one commit; each leaves `go vet ./...`, `go test ./...` and, for starter steps, `tests/e2e.sh` passing.
The user commits each step; the next starts after that.

## Status and how to resume (2026-11-02)

**Where it stands.** The *Decision* in `../../machine-starter-template.md` is **Reviewed** (review round 7,
2026-11-02). Nothing is implemented; no repo has changes. The full target state is here: `integration/` (the
starter) and `polymx/` (the PolyMX integration repo).

**Decided** (details and reasons in the log's *Decision*):
- Dev box: an open never clones or moves a checkout (S9b, W15); `bash src/bootstrap.sh --update` is the one sync
  (`cdr`); a new box runs it once. No `--missing-only`, no off-pin warning, no automatic clone.
- Lock: `./lock.sh` (fresh folder, commit hashes, a first line fingerprinting `dependencies.repos`), review,
  commit, tag; `release.sh` refuses a lock written for another `dependencies.repos` (W5). No `cdr --verify` (dropped:
  it can't see `devbox:volume`; W13 won't).
- Release build: `release.sh` checks the lock out into `RELEASE_SRC` (without `.git`), the integration repo's
  generic `image/Dockerfile` builds it (D2g: A-2 changed for colcon services; service repos hold only code and
  `dependencies.repos`; services with their own recipe keep it and are pinned and named by git tag).
- Customer branches, tags `v1.1.0+<customer>`, images `1.1.0_<customer>`. Image labels dropped; equal releases reuse
  the image on the same PC.

**Before resuming, check:**
- `git status` and `git log` in nl-cboost-flexcompose, nl-cboost-docker-ros2, nl-cboost-ros-tools and the PolyMX
  repos: anything done since? Re-read files the user may have edited (this plan, the templates, the log).
- The colleague knows `cdr --verify` is withdrawn (step 0); the optional `cdr` items (tracked-only changes,
  `cdr --lock` writing the fingerprint) are their call.

**Next:** step 0, then step A, then step 1.

**Open before step 0 (2026-11-10):** the user asked for the recipe in the service repo, several service repos and a
dev container per service. `../machine-starter-services/` is a working example of that (not reviewed); its README
lists what it would change here (A-2, steps 1, 2, 4 and 6). Nothing below is changed for it yet.

**Open questions (not blocking step 1):**
- The URLs of `yaskawa_hse_driver` and `nl-polymx-datastore` (guessed in `polymx/dependencies.repos`).
- The wheel build of hatchling packages in the image (PolyMX's temporary step): verify with step A. pip is in the base
  (`cboost-ros2-jazzy:0.2.0`, pip 24.0; spike 2026-11-02, which also showed a repeated `pip install -e` fails offline:
  `polymx/bootstrap.sh` now runs pip on an open only when a library is missing).
- Unverified: Ubuntu's `pip install --prefix` layout (no longer used by the drafts); a failing `postAttachCommand`
  leaves the container usable (the TODO's Linux check says it does).
- Comprehension: the user was asked for a 1-5 rating of the walkthrough (round on the draft, 2026-10-29) and gave
  none yet; record it in `~/.claude/UNDERSTANDING_EXPERIMENTS.md` when given.

## Order and dependencies

```text
0  notes: Decision sections (parent, sibling)            no code
A  nl-cboost-docker-ros2: cdr + vcs2l in the base        other repo   ─┐
1  FlexCompose feat!: build: passed on as written                     │
2  FlexCompose feat: refuse a second workspace service                │
3  starter: dev box with cdr               needs A (cdr in the box) ◄─┘
4  starter: release from the lock          needs 1, 3
5  docs: design §13, README, REQUIREMENTS.md   after 4 (or with each step)
6  PolyMX migration                        needs A, 4; other repos
7  after use: ask what it showed; later: template sync, cdr extras
```

## Step 0: notes (no commit)

Write the *Decision* sections of `machine-repo-layout.md` and `machine-release-programs.md` (choice, why, rejected,
gaps), pointing to `machine-starter-template.md` for A-2's change; have them confirmed. Update the vault `TODO.md`.
Tell the colleague that the accepted `cdr --verify` is no longer needed (`cdr-proposal.md`, item 4 withdrawn).

## Step A: base image with cdr (nl-cboost-docker-ros2)

- `docker/Dockerfile`: install `cdr` (nl-cboost-ros-tools `tools/`) and `vcs2l` (vcstool fails on Python 3.14,
  spike 2026-10-29; the base is Python 3.12, but vcs2l is the maintained fork).
- Release `cboost-ros2-jazzy:0.3.0`.
- Commit: `feat: install cdr and vcs2l for workspace resolution`.

## Step 1: FlexCompose passes `build:` on as written (`feat!`)

Sibling plan step 1 (F2, N22): FlexCompose adds nothing to a service's `build:`.

- `flexcompose-cli/release.go`: remove `addBaseImage` and its `base` parameter from `finishReleaseService`; the
  `release` target still removes `build:` and requires an `image:`.
- `flexcompose-cli/fragments/targets/release-build/compose.yaml`: drop `target: release` and `ssh` (the fragment
  keeps only what every built service needs, or goes if nothing is left: check `releaseTargets`).
- `flexcompose-cli/release_test.go`: replace the `BASE_IMAGE`-injection and target/ssh tests with "the release
  build file has each service's `build:` exactly as the template and override write it".
- `templates/integration/flexcompose.release.yaml` (today's starter): write `target: release`, `ssh: [default]` and
  `args: {BASE_IMAGE: cboost-c-nas:5100/cboost-ros2-jazzy:0.2.0}` explicitly, so `tests/e2e.sh` keeps passing.
- `FLEXCOMPOSE_DESIGN.md` §13 and its decision log; README's release-target table.
- Commit: `feat!: pass build: on as written in the release targets` with `BREAKING CHANGE: release:build no longer
  adds target, ssh or BASE_IMAGE; write them in flexcompose.release.yaml`.

## Step 2: refuse a second workspace service (`feat`)

Two `workspace: true` services would silently share one volume and `src/` (`output.go:33` requires one, nothing
refuses two).

- `flexcompose-cli/template.go`: `loadTemplate` refuses a second `workspace: true` with a message naming both
  services and saying one source workspace per box is supported.
- `flexcompose-cli/main_test.go` (or the template tests): `TestTemplateWithTwoWorkspaceServicesIsRefused`.
- Design §3 (strict templates), README's option table.
- Commit: `feat: refuse a template with two workspace services`.

## Step 3: starter dev box with cdr (`feat`)

`templates/integration/` towards `integration/`, dev box part:

- add `dependencies.repos`; remove `dev.repos`;
- `bootstrap.sh` as in `integration/` (an open never clones; `--update` runs `cdr`);
- `flexcompose.yaml`: comments, `image: ...:0.3.0` (step A); `.devcontainer/devcontainer.json`: comment;
- `README.md`: files table, checklist step 3, the `devbox:host`/`devbox:volume` paragraph, the dev box rows of
  the workflows, the first diagram's dev box part;
- `tests/e2e.sh`, `tests/e2e-lib.sh`: the demo machine repo gets its own `dependencies.repos` naming `demo_dep`, the
  integration repo's file names only `demo_machine` (cdr's recursion is exercised); checks: a first open says
  nothing is checked out; `--update` clones both; an open leaves a feature branch and uncommitted work alone;
  `--update` refuses uncommitted changes; a missing deeper package makes the open fail with the hint.
- `release.repos` and the release stay as they are in this step (step 4).
- Commit: `feat: the integration starter's dev box resolves its repositories with cdr`.

## Step 4: starter release from a committed lock (`feat`)

- add `lock.sh`; `release.sh` as in `integration/` (stale-lock refusal, `+customer` tags, `RELEASE_SRC`, `lock.repos`
  in the bundle); move `Dockerfile` to `image/Dockerfile` (generic, no SSH, no `vcs import`); `.gitignore`:
  `!/image/`; `flexcompose.release.yaml` as in `integration/`; remove `release.repos`;
- `README.md`: the rest of `integration/README.md` (release, workflows, second diagram);
- `tests/e2e.sh`: needs `cdr` and `vcs2l` on the host; checks: `release.sh` refuses without a lock, with an untracked `lock.repos`, and after a
  `dependencies.repos` change without `./lock.sh`; a locked, tagged release builds and its bundle holds `lock.repos`
  and passes `sha256sum -c`; a customer tag `v1.0.0+acme` gives images tagged `1.0.0_acme`; the machine part as
  today (update, rollback, image removal).
- Commit: `feat: the integration starter releases from a committed lock with a generic recipe`.

## Step 5: docs (`doc`)

- `FLEXCOMPOSE_DESIGN.md` §13: integration repo layout (dependencies.repos, lock.repos, image/), the dev box's
  explicit sync, the release from the lock with its guard, customer branches and `+customer` tags, services with
  their own recipe by git tag; decisions table (A-1..A-5, A-2's change, the starter's choices) and known gaps.
- `README.md`: the releases section; its diagrams are copies of the starter README's: change them together.
- `REQUIREMENTS.md` (verified 2026-10-29 unless noted):

  | Tag | Requirement | Priority |
  |---|---|---|
  | `open-leaves-work` | Opening a dev box never loses, moves or refuses work; it never clones or syncs on its own (W1a, W1b, W15) | must (no lost work), should (the rest) |
  | `open-offline` | A dev box opens without the git server once set up (W2) | should |
  | `missing-repo-hint` | A missing repository never leaves an unexplained build failure: the box says what to run (W3b) | should |
  | `release-from-lock` | An old release rebuilds from exactly the source commits it shipped (W4b; PC-06) | should |
  | `stale-lock-refused` | A release can't ship other versions than the tagged commit's pins say (W5) | should |
  | `lock-reviewed` | The lock's changes are reviewed before a release is tagged (W8) | should |
  | `image-reuse` | Equal releases reuse one image on the same build PC (W9) | could |
  | `starter-simple` | The starter stays as simple as the needs allow (W18) | should |
  | `release-local-fix-check` | A release refuses when local checkouts differ from it (W13) | won't |
  | `customer-guard` | A machine refuses another customer's bundle (W6b) | won't |

  Reword `integration-repo` (N21): service repos hold only code and their dependency list, unless a service has a
  recipe of its own; each machine's integration lives in one repo of its own. `release-traceable`: the bundle's
  `lock.repos`. Assumption, not confirmed: the release PC may need `cdr` and `vcs2l` (W7b).
- Commit: `doc: the integration repo with cdr, a committed lock and a generic recipe`.

## Step 6: PolyMX migration (other repos)

The target state of `nl-polymx-automated-qc` is in `polymx/` next to this file. On its working branch
`feat/flexcompose-integration` first (never on `main`).

- `nl-polymx-automated-qc-application`: settle `dependencies.repos` with the state manager (`packml_ros2`), or rely
  on the integration repo's `override: true`; nothing Docker-related lives there.
- `nl-polymx-automated-qc` (integration): adopt the starter: `dependencies.repos` (the app, the `packml_ros2`
  override), `image/Dockerfile` plus a **temporary** step for the four Python packages (and the patched Fast DDS and
  rclpy staging, if releases need it) until they are ROS packages; inference pinned and named by its git tag;
  remove `dev.repos`, `release.repos`, the root `Dockerfile` and `robot/` (now `bundle/`); tag inference `v1.0.0`;
  confirm the URLs of `yaskawa_hse_driver` and `nl-polymx-datastore`; `./lock.sh`, a test release, a run on the machine.
- Commits in those repos, one step each.

## Step 7: after use

Ask what using it showed; amend *Decision* or reopen a round. Later: keep copied starter files in sync with a
template tool (copier/cruft) when a second machine exists; the optional cdr items (tracked-only change check,
`cdr --lock` writing the fingerprint).

## Known gaps carried

- Every starter file is copied per machine; fixes are hand-copied.
- A developer who forgets `--update` after switching to a customer branch works on the previous versions.
- A release builds the lock, never your checkouts: an unpushed fix is silently absent (W13 won't).
- Inference's rebuild from the same source relies on tags never being moved.
- The stale-lock guard sees only the integration repo's `dependencies.repos`.
- Every merge into a customer branch conflicts in `lock.repos` (take either side, re-lock).
- The base image literal is written twice.
- Image reuse holds on the same PC only, while the build cache lasts.
- PolyMX's temporary pip step leaves its PyPI dependencies and the EtherCAT pin outside the lock.
- Windows (Git Bash) untested for `lock.sh` and `release.sh`.

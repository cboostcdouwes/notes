# Machine starter template and its workflow with cdr

**Status (2026-10-29): paused by the user before the review closed. Research done; *Decision* Draft (Why and
Rejected confirmed). Full target state and plan: `tmp/machine-starter/` (`PLAN.md` has the resume notes,
`integration/`, `polymx/`). Earlier drafts: `tmp/machine-starter-draft/`, `tmp/machine-starter-draft-d4/`.**

## Problem
The parent decision (A-1..A-5) fixed where a machine's services are defined, pinned and built. What is left is how
the people using a machine repo get through their common actions with it: a developer getting a dev box and keeping
its checkouts up to date while working on several repositories, a release manager fixing the exact versions of a
release and building it, and the same for a customer's variant. The steps must not get in the way of daily work, and
a release must contain exactly the versions that were meant.

## Related decisions
- Parent: `machine-repo-layout.md` (A-1..A-5 decided 2026-10-28; *Decision* sections not written yet). This log
  works out its plan step "starter template". Its requirements M1-M14 hold here; only the ones that score these
  options are repeated by ID in the matrix.
- Sibling: `machine-release-programs.md` (F2, A-5). Its plan step 1 (FlexCompose passes `build:` on as written) is
  a precondition of R2.
- Not here: a second colcon service from source (parent's later decision).

## Success criteria
Judged by the user:
1. Every workflow of the walkthrough (2026-10-29: new box, daily work, dependency bump, inference bump, base bump,
   release, customer variant, fix for all, customer dev box, add a service) has concrete commands in the draft, with
   no step marked "open" that the developer can't do.
2. Not built from the options' own failures: opening a box with a dirty checkout, a feature branch and no network;
   rebuilding an old tag a month later; a customer pin change released without anyone re-locking.

## Requirements
Parent requirements used here: M1 (must), M5 (could), M11 (should), M12 (should), M13 (should), M14 (should, above
M12), at their parent rows. Written: `work-survives` (must, V1; about what FlexCompose writes), `release-traceable`
(should, V1), `private-clones` (should, V1), PC-06 in `nl-cboost-ros-tools` (owner decision 2026-10-21: a shipped
project builds from a committed lock file).

| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| W1a | Opening a dev box never loses a developer's work (uncommitted changes, commits on a branch) | Lost work | inferred from `work-survives` (must, V1, scoped to what FlexCompose writes); replaces W1 (round 1, bias check) | must | yes (2026-10-29) |
| W1b | Opening a dev box doesn't move a checkout without the developer asking or being told, and isn't refused because of work in progress | The developer's checkout moves under them without a word (spike: no warning); a failing open on every WIP | replaces W1 (round 1, bias check); spike `cdr-spike` | should | yes (2026-10-29: "should not happen") |
| W2 | A dev box opens without access to the git server once it is set up | Working on a train or with GitHub down | inferred | should | yes (2026-10-29) |
| W3b | A dependency a teammate adds never leaves a developer with a build failure they can't explain: it arrives by itself, or the box says what to run | colcon fails on a missing package and the developer doesn't know why | replaces W3 (round 1, bias check); user, round 1 answers: "a cdr change would be nice, but a hint is fine" | should | yes (2026-10-29) |
| W4b | An old release can be rebuilt from exactly the source commits it shipped | An audit or a customer bug fix needs the exact source | replaces W4 (bias check: same *images* overclaims; apt, rosdep and the base tag move); `release-traceable` (should, V1); PC-06 (owner decision: a shipped project builds from a committed lock) | should | yes (written, V1 and PC-06) |
| W5 | A release can't silently ship other versions than the tagged commit's pins say | A customer branch changes a pin, nobody re-locks, the customer gets the old app | inferred (walkthrough 2026-10-29); user chose "refuse" (round 1 answers) | should | yes (2026-10-29) |
| W7b | A release isn't blocked by one person's machine or OS (Windows is one case): any developer PC can release after a short, documented setup | A release blocked on one person's machine | replaces W7 (bias check); N14 (Windows untested) | could (claimed) | can't answer yet (2026-10-29): assumption, known gap |

| W8 | The lock's changes are reviewed before a release is tagged | A moved dependency branch ships unseen | user, round 1 answers (chose separate steps over one command, whose cost was "the lock diff is not reviewed first") | should | yes (2026-10-29, by that choice) |
| PC-06 | A shipped project builds from a committed lock file | Reproducible shipped versions | `nl-cboost-ros-tools` `docs/knowledge/platform-choices.md` PC-06 (owner decision 2026-10-21) | should (constraint from a sibling repo's settled choice) | yes (written, owner decision) |

| W9 | A release whose app inputs (locked commits, base) equal an earlier build's reuses that image instead of building again | Build time per customer release | user, round 2 remark and answers ("build once"); round 3: "nice, not important" | could | yes (2026-10-29) |
| W11b | For any app image, on the build PC or the machine, a reader can find which service version and source commits it holds, independent of machine or customer | Traceability | replaces W11 ("from the image's name" named the mechanism; bias check round 3); user, round 2 answers | could | yes (2026-10-29) |

| W13 | The person releasing can't end up with a release that differs from the source they see in the folder they release from without being stopped (a warning doesn't count: an inattentive user misses it) | A local fix, committed but not pushed or not locked, is silently missing from a customer's release | user, review (2026-10-29): "I'm worried about a person doing a release thinking that the release will be built from the working tree" | won't | yes (2026-10-29: dropped by the user, "probably isn't worth it": a check on the host only sees checkouts next to `release.sh`, not `devbox:volume` or other copies; comes back if a release ships without a local fix someone believed was in) |
| W14 | A release can be made from the folder the developer works in | One less step and folder per release (user, review: chose G-A for it) | user, review (2026-10-29) | could (claimed; a preference behind the choice) | yes (as a reason for G-A) |
| W15 | Opening a dev box behaves the same every time: it never clones or moves anything on its own; the developer starts every sync | A clone on open "feels unpredictable"; one simple rule is easier to explain; new developers learn the sync they need later anyway (user, review round 2) | user, review round 2 (2026-10-29) | should (weighs above M12 for this choice) | yes (2026-10-29) |
| W16 | A build step that belongs to a service (it changes with the service's code, e.g. the QC app's pip packages) lives with that service's code; a step that is a machine's choice lives with the machine | "Depends on the step" (user, review round 4); the QC app's docs ask to keep its middleware patch with its release recipe | user, review round 4 (2026-10-29); `-application` docs/fastdds-shm-deployment.md | should (claimed) | need yes ("depends on the step"), priority not asked |
| W17 | A service repo doesn't hold how a machine assembles its whole service image (the locked tree, colcon, the release stage) (bias check: mostly M11; scored together, not twice) | The app repo would mix "build my packages" with "assemble the service for a machine" (user's remark, review round 4) | user, review round 4 (2026-10-29) | should (claimed) | need yes, priority not asked |
| W18 | The starter and the services' build stay as simple as the needs allow: no hook interfaces, extra images or tools that a plainer shape avoids | The user's condition on confirming *Why*/*Rejected* ("as long as it doesn't cause the complexity to get unnecessarily out of hand") and the label removal | user, review (2026-10-29) | should | yes (2026-10-29) |

Won't: W6b (a machine of customer A never installs customer B's release; distinct release names suffice): user, round 4: "W6b is not really a requirement; mark it as won't"; comes back if a machine installs a wrong customer's bundle. The T6 guard would serve it.

Parent wording used in verdicts (rejection check asked for it): M12 "A developer creates a dev box with as few
commands as possible (ranked by the number of commands and files to write)"; M14 "FlexCompose stays simple: as few
concepts, options and rules in the tool as fit"; M3 "A developer finds each part of a service's setup without
searching, and the setup has no more parts than the services need". M12 and M14 are about the dev box's creation and
FlexCompose itself; costs of release steps and scripts are **tie-breaks** here, not M12/M14 failures (round-1
correction).

## Options

### Axis S, when the dev box resolves its checkouts
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| S1 | `bootstrap.sh` runs `cdr` on every open (parent draft A14-default) | Always current; new dependencies arrive (W3b) | Spike: switches a committed feature branch back to its pin, refuses on any untracked file, fails offline (W1b, W2) | cheap | trailing (W1b, W2) |
| S2 | `bootstrap.sh` runs `cdr` only while a top-level repository is missing; `bash src/bootstrap.sh --update` runs it by hand (as `west update`: syncing is explicit) | Usually leaves checkouts alone; opens offline when nothing is missing; no tool change | When a teammate adds a top-level repo, the full `cdr` moves branches and refuses on WIP, as S1, only rarer (~ W1b, rejection check); transitive additions unnoticed (~ W3b) | cheap | trailing (~ W1b; S2b is its better variant) |
| S3 | A new `cdr` mode (`--missing-only`): resolve, clone what is missing at its resolved commit, leave existing checkouts alone and report the ones off their pin; on every open | W1b; W3b (transitive ones too, arriving by themselves) | A change in the colleague's tool; resolution fetches on every open (~ W2 if a failed fetch only warns) | cheap | leading with S7 (cdr change accepted, round 1) |
| S4 | `bootstrap.sh` imports `lock.repos` with `vcs import --skip-existing` | W1b, W2; dev starts on the release's exact versions | Detached HEADs: every developer must check out a branch before committing (tie-break); new deps arrive only after a re-lock | cheap | trailing (~ W3b; tie-break vs S2b) |
| S4b | S4, then each new clone is put on a local branch named after its pin, at the locked commit (both checks, round 2) | W1b, W2 (offline); transitive deps as of the last lock | A dependency added since the last lock doesn't arrive (~ W3b) | cheap | runner-up interim (S2b brings current deps, S4b works offline) |
| S5 | S1, with a `cdr` failure only a warning | Opens with WIP | Still switches feature branches back (W1b) | cheap | trailing (W1b) |
| S6 | `cdr` learns west's `--keep-descendants`: a checkout on another branch is left alone; on every open | W1b for branches; W3b | Tool change; any local change (tracked or untracked, `git status --porcelain`) still refuses, and with S8 tracked changes still do; fetches on every open (~ W2) | cheap | trailing (~ W1b, ~ W2) |
| S2b | S2, but when a top-level repository is missing, `bootstrap.sh` resolves into a temp folder and moves in only the missing checkouts (transitive ones too); `--update` runs the full `cdr` (round 1, both checks) | Existing checkouts never touched (W1b); offline when nothing is missing; no tool change | A transitive dependency added later, with every top-level present, isn't noticed (~ W3b); a full clone into temp when something is missing | cheap | interim until S3 exists (user, round 1), with a rosdep hint for W3b |
| S7 | On open, a check that changes nothing: lists missing repositories and checkouts off their pin, prints `bash src/bootstrap.sh --update` (bias check) | W1b; W3b (the box says what to run, transitive too) | Needs a dry-run resolution: a new `cdr --check` (tool change); fetches on open (~ W2 if a failed fetch only warns) | cheap | leading with S3 (cdr change accepted, round 1) |
| S8 | `cdr` ignores untracked files (`git status --porcelain --untracked-files=no`, `vcs.py:105`) (bias check) | Removes the untracked-file refusal from S1, S5, S6 and from `--update` | A tool change; a variant, not alone a fix (branches still move) | cheap | in the cdr proposal with S3 |
| S9 | `bootstrap.sh` runs `cdr` only into an empty workspace (no top-level repository checked out yet: a new box, nothing to move); otherwise it only prints `--update` when a top-level repository is missing; `--update` is the one explicit sync (user's question, review) | W1a, W1b (cdr never runs over existing checkouts on open), W2 (no fetch on open), W3b (a hint), M12 (a new box clones itself); ~6 lines, no `--missing-only` | A teammate's new repository arrives only after `--update` (hint; W3b allows it) | cheap | trailing (✗ W15: a clone on open feels unpredictable) |
| S9b | S9 without the automatic first clone: a new box also needs `--update` | Fewest lines; one rule (an open never clones) | One more command to create a box (~ M12) | cheap | chosen (user, review round 2) |

### Axis L, where and when the lock is written
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| L1 | `release.sh` resolves, writes the lock, refuses if it changed (parent draft) | One script | The tagged commit has the old lock: delete the tag, commit, tag again; a later rebuild of a tag re-resolves (✗ W4b unless refused) | cheap | trailing (✗ W4b; retag cost: tie-break) |
| L2 | `lock.sh` resolves in a fresh folder and writes `lock.repos` with a first line recording `dependencies.repos`' sha256; commit, tag; `release.sh` builds only from the committed lock and refuses one whose line doesn't match | W4b, W5 (top-level changes); spike-tested | One more script and step; a moved branch is not "stale" (deliberate: picking up fixes is a re-lock) | cheap | chosen (user, round 1: refuse; separate steps) |
| L2a | L2 without the sha line | Simpler | ✗ W5 | cheap | trailing (W5) |
| L3 | Lock from the dev box's `src/` (`vcs export`) | No second resolve | Local unpushed commits and feature branches end up in the lock (W4b) | cheap | trailing (W4b) |
| L4 | No lock: every repo pins exact commits, `cdr --strict` | No lock file | Against PC-06's branch-following convention; every bump touches every repo | costly | trailing (PC-06) |
| L5 | A CI job writes the lock as a pull request | No manual step | No CI on the machine repo yet | costly | won't for now (user, round 2: "maybe in the future if useful; right now we'd rather not rely on CI"); comes back when CI is wanted |
| L6 | One command `release.sh v1.3.0`: writes the lock, commits it, tags and builds (bias check) | No L1 retag; one step fewer than L2 | The script commits and tags for you: the lock's diff isn't reviewed before the tag; a failed build leaves a tag behind | cheap | trailing (✗ W8) |
| L3b | L3, refused unless every checkout is clean and its HEAD is on its remote branch (rejection check) | No second resolve | The lock is whatever the release manager's box happens to have (an un-updated box locks old commits; W5's intent) | cheap | trailing (~ W5) |

### Axis R, how the release build gets the locked source
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| R1 | Build from the app's git context at `APP_REF` (read from the lock by a helper); the Dockerfile copies itself into `src/<own repo name>` and imports the lock with `--skip-existing`, SSH inside the build | Builds from git like inference | A lock-reading helper; the app's Dockerfile must name its directory as the machine's lock does; SSH and known_hosts inside the build | cheap | runner-up (✓ W7b where R2 has ~; tie-breaks: a lock helper, SSH in the build) |
| R2 | `release.sh` checks the lock out on the host (`vcs import`) into `RELEASE_SRC`; the override builds the app's Dockerfile from there, with `additional_contexts: {workspace: $RELEASE_SRC}`, which replaces the Dockerfile's `workspace` stage (spike `spike-ctxstage`; Docker docs) | The app knows nothing of machines (M11); no SSH in the release build; standalone build resolves its own deps (M5) | `vcs` on the release host (~ W7b); a three-stage pattern to explain in the app Dockerfile | cheap | leading |
| R3 | The machine repo keeps a wrapper Dockerfile | Today's shape | Against A-2 (decided) | costly | trailing (A-2) |
| R4 | Build from the checkouts already in the machine repo folder (the dev box's `src/`), aligned to the lock automatically (user, review) | No second checkout; no vcs in `release.sh` | Moves the releaser's checkouts (W1b-like); needs a full host checkout (`devbox:volume` can't release); `.git` misses the cache; extra checkouts get built in | cheap | trailing (user agreed to keep RELEASE_SRC) |
| R4b | R4 with checks only (exist, clean, at the locked commit, nothing extra), no automatic alignment (user, review) | Nothing moves without asking | ~15 lines plus Python yaml on the host, against 3; the releaser aligns 5-10 repos by hand per release and per old tag | cheap | trailing (more complexity than it removes: the user's condition) |
| G-A | Keep RELEASE_SRC; `release.sh` calls a new `cdr --verify lock.repos --src .` that refuses unless every lock entry checked out in that folder is clean and at its locked commit (user's idea, review) | W13; generic in cdr; names what differs; one line in `release.sh` | A cdr change (colleague); releasing from the dev folder needs its checkouts on the lock's commits | cheap | dropped (user, review: W13 won't; it can't see `devbox:volume`) |
| G-B | Keep RELEASE_SRC; `release.sh` refuses when any lock entry is checked out next to it; release from `git worktree add ../release-v1.3.0 v1.3.0` | W13 with ~4 lines, no tool change, no Python | One extra command per release; doesn't name the missing fix | cheap | trailing (✗ W14: needs a separate worktree; doesn't name the missing fix) |
| R2c | R2, with `lock.sh` and the lock checkout run in a container of the base image (which would carry `cdr` and `vcs`), so the release host keeps today's tools (bias check) | W7b; settles open question 7 | Needs `cdr` in the base image (already a parent gap); SSH agent forwarding into that container | cheap | fallback if W7b turns out to matter (Windows, N14) |

### Axis T, release tag format on customer branches
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| T1 | `v1.3.0-<customer>` | `release.sh`'s regex, `release-<tag>/` folders and `update.sh`'s `sort -V` already work; image `polymx-qc:1.3.0-acme` (W6b) | Reads as a semver pre-release (sorts before `v1.3.0` where tools care) | one-way (tags on shipped machines) | runner-up |
| T2 | `<customer>/v1.3.0` | Groups per customer in `git tag -l` | `/` breaks `release-<tag>/`; regex and image-tag derivation change (tie-break) | one-way | trailing (user chose T4b) |
| T3 | `v1.3.0` everywhere, the customer in the image name | | git tags are global: two branches can't both have `v1.3.0` (W6b) | one-way | trailing (W6b) |
| T4 | `v1.3.0+acme` as the image tag too | semver build metadata | Docker tags forbid `+` | one-way | not possible (Docker; T4b maps it) |
| T4b | git tag `v1.3.0+acme`, image tag `1.3.0_acme` (`+` → `_`; round 2: `-` collided with a pre-release `v1.3.0-acme`) (rejection check) | Not a pre-release in semver | The bundle folder and image tag differ from the git tag; regex and derivation change (tie-break) | one-way | chosen (user, round 1) |
| T2b | `<customer>/v1.3.0`, bundle folder `release-acme-v1.3.0` (rejection check) | Groups per customer | Regex, folder and image-tag derivation change; `update.sh`'s `release-v*` glob changes (tie-break) | one-way | trailing (user chose T4b) |
| T6 | A customer guard on the machine: the bundle's `.env` names the customer, `update.sh` refuses a bundle for another customer than the machine's (bias check round 4) | Enforces W6b's "never installs B's release" (the draft only makes names distinct) | A per-machine customer file to set at installation; one more rule in `update.sh` | cheap | open (question) |
| T5 | One machine repo (fork) per customer (bias check) | W6b goes away | A-4 decided branches; every shared fix crosses repos | costly | trailing (A-4) |

### Axis D, where the app's build recipe lives (review round 4: the parent's A-2 reopened)
Context: the standalone build was dropped (M5 no longer met), so the app's Dockerfile works only through a machine;
the QC app has its own steps (four pip packages outside `dependencies.repos`; patched Fast DDS and rclpy staged from
`middleware/`); its Python dependencies may become ROS packages later (user), which would leave fewer app steps.
The app itself is two colcon packages (`polymx_qc_app` ament_python, `polymx_qc_msgs` ament_cmake).

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| D1 | A-2 as decided: the whole recipe (workspace, colcon, release stage, its own steps) in the app repo | App steps next to their files (W16) | The app repo assembles the whole service on the machine's `workspace` convention (✗ W17); every colcon service repo repeats the assembly (~ M2, M13) | cheap | trailing (W17) |
| D2 | The whole recipe in the machine repo (`Dockerfile` at its root, fed by the lock), as today's starter | One place per machine; the app repo holds only code (W17) | The app's own steps move away from their files (✗ W16); every machine running the app copies them (~ M13) | cheap | trailing (W16) |
| D4 | Split: the machine repo holds a generic assembly (locked tree → rosdep → colcon → no-source check → entrypoint); a service repo may ship its own steps under an agreed name, which the assembly runs | W16, W17; the assembly names no service | An interface to agree (the hook's name, when it runs, what it may write); where pip installs land (`/opt/app` only reaches the release stage) | cheap | trailing (~ W17/M11: its hook hard-codes the machine's `src/` layout and PREFIX; the middleware step is no app step (ML-14) and no build step (a stored artifact); runtime steps (entrypoint, env) not covered) |
| D3 | The generic recipe (no hook, after round 5) once in a shared repo, referenced by git context pinned by full commit hash, as inference is (rejection check: no new mechanism) | As D4; no assembly copy per machine (M13) | One more versioned dependency per machine; a remote git build context at release time | cheap | trailing (the user chose D2g; no requirement decided it) |
| D7 | The app repo builds its own runtime base image (its pip packages, patched middleware) that the machine's generic assembly uses as `BASE_IMAGE`; the assembly builds the locked tree on it | W16 (the app's steps with the app), W17 (no assembly in the app repo); no hook interface; the dev box could run the same base (dev and release alike) | A second image per service to build and version; links to the open base-image split (devbox/runtime) | costly | trailing (a second image per service: complexity) |
| D8 | Every own step becomes a package the generic `colcon build` handles: the Python dependencies as packages in the lock (a `setup.py`/`package.xml` shim each, or ROS wrappers later), the patched Fast DDS/rclpy as vendor packages (`ament_cmake_vendor_package`) in the app repo; the machine runs only the generic assembly (discovery) | W16, W17, M2 (one pattern: all packages), M13, no hook interface; the direction the user expects (Python deps wrapped as ROS packages) | Spike: the base image's colcon (0.21.3) finds no `pyproject.toml`-only package (the orchestrator uses hatchling): a shim in each Python repo (other teams; the orchestrator is "ROS2-unaware" by design); writing a CMake vendor package for the patched Fast DDS | costly | target (over time) |
| D2g | D2 once the app has no steps of its own: the machine repo holds a generic recipe (`image/Dockerfile`: locked tree → rosdep → colcon → only `/opt/app`), copied from the starter; service repos hold only code and `dependencies.repos` (round-5 answers) | W17, M11 (the app follows no machine convention), W18 (today's shape, no hook, no extra image), M2 (colcon services: one generic recipe; services with their own recipe: theirs); the user's remark | The generic recipe is copied per machine from the starter (~ M13); a temporary app step (PolyMX's pip packages) goes into that machine's copy until the packages are ROS packages | cheap | leading |
| DB | The generic assembly ships inside the base image the machine already pins (a `build-workspace` script); the machine's `image/Dockerfile` shrinks to a few lines (bias check) | No copy per machine (M13); no new repo or version: the base is already pinned and bumped | Assembly changes ride on base bumps; ties to the open devbox/runtime base split | cheap | trailing (the user chose D2g) |
| D2s | D2g plus a template tool (copier/cruft) so machines pull starter updates, for every copied file (recipe, `release.sh`, `lock.sh`, `bootstrap.sh`) (bias check) | M13 for all starter files | One more tool (W18) | cheap | later (user: reconsider with the second machine) |
| D10 | The app repo defines its own service: its image recipe and how its dev box runs (a Compose fragment, maybe its devcontainer); the machine repo imports it (`include:` or a FlexCompose import) (user, review round 5) | The app's knowledge in one place; a developer of the app finds everything in its repo | Parent's A1b/B7: FlexCompose's features and targets see only template services, so it must resolve imports itself (M14); Compose refuses to override an included service (parent, verified); the app repo then holds machine-facing definitions (W17, asked) | costly | trailing (~ M14: FlexCompose would resolve imports; ~ W17; its gain is M4, a could: "one place per service", user round 5) |
| D11 | The patched Fast DDS/rclpy and their runtime setup (environment, entrypoint wrapper) in a validated runtime base image (nl-cboost-docker-ros2 or a layer on it); the machine picks that base (bias check) | The app's docs (ML-14): every shared-memory process on the cell must load the patched library, so it is the cell's choice; the library is a stored, hash-checked artifact (nothing builds it); dev box and release can run the same base | Belongs to the open base-image split (devbox/runtime); a base version per middleware change | costly | moot (the middleware patch is temporary: "ignore", user round 5) |
| D12 | No hook: the generic assembly pip-installs every locked repository that has a `pyproject.toml` and no `package.xml` (or colcon learns `pyproject.toml` via `colcon-python-project`, unverified with hatchling) (bias check) | W17, M11 (no script in the app, no machine paths); one rule for all machines | PyPI dependencies (pydantic) come from PyPI at build time, unpinned; the EtherCAT pin (`requirements-ethercat.txt`, a git URL) stays outside the lock | cheap | moot (the Python packages become ROS packages; a stopgap in PolyMX's machine repo only) |
| D13 | An app-owned Python lock (`requirements.lock` with hashes: PyPI dependencies and the EtherCAT pin) that the generic assembly and the dev box both install (bias check) | Pins PyPI dependencies; dev and release install alike | Pins outside `lock.repos` (W5/W8 don't see them) | cheap | moot (as D12) |
| D5 | The app repo exposes a small Docker target that stages its own prefixes; the machine's build imports it at the locked commit (Docker Bake/Earthly remote targets, or Compose `additional_contexts`) and `COPY --from`s it (discovery) | W16, W17 | buildx bake new to the team (M14-like tie-break); the app repo still holds a Dockerfile fragment | cheap | trailing (tie-break: a second Docker build file per service) |
| D6 | Debian packages per package (bloom), the machine installs `.deb`s (discovery) | Industry standard | Heavy: custom rosdep keys, fakeroot, a packaging step per repo (complexity) | costly | trailing (complexity) |
| D9 | Nix (ros2nix) or Yocto meta-ros: per-package recipes plus overlays/appends (discovery) | The cleanest split | A new toolchain (complexity) | one-way | trailing (complexity) |

Axis D matrix (W16 own steps with the owner, W17 no assembly in a service repo, M2 one pattern, M13 no copies, M11):

| Option | W16 | W17 | M2 | M13 | M11 | ✗ or ~ |
|---|---|---|---|---|---|---|
| *priority, verified* | should, no | should, no | should, yes | should, yes | should, yes | |
| D1 | ✓ | ✗ | ~ | ~ | ~ | ✗ W17 (the app follows the machine's `workspace` convention: ~ M11) |
| D2 | ✗ | ✓ | ✓ | ~ | ✓ | ✗ W16 |
| D4 | ~ | ~ | ~ | ~ | ~ | ~ W16 (runtime steps) W17/M11 (the hook follows machine paths) M2 M13 |
| D7 | ✓ | ✓ | ~ | ✓ | ✓ | ~ M2; a second image per service (complexity) |
| D8 | ✓ | ✓ | ✓ | ✓ | ✓ | where D2g goes by itself once the Python packages are ROS packages (user) and the middleware patch retires |
| D2g | ✓ | ✓ | ✓ | ~ | ✓ | ~ M13 (the generic recipe copied per machine) |
| D3 | ✓ | ✓ | ✓ | ✓ | ✓ | ~ W18 (another repo and version per machine) |
| D10 | ✓ | ~ | ~ | ✓ | ✓ | ~ M14 (FlexCompose resolves imports), W17 |
| D5 | ✓ | ✓ | ~ | ✓ | ✓ | a Docker fragment in the app repo, bake (tie-break) |

Round-5 checks: rejection check: D4 led on tie-breaks while D3, D5, D7 beat it on M13 and D8 meets every column;
the app has runtime steps (`with-validated-runtime.sh` entrypoint, `PATCHED_*_PREFIX`); the validated
`libfastrtps.so.2.14.6` is not in the repo; D2's doc citation stretched; `ethercat_client` missing from the draft.
Bias check: W17 is mostly M11; D4's hook breaks W17/M11; ML-14 makes the middleware a cell-wide choice; M5 and dev
parity not scored; `--no-deps` drops PyPI dependencies (pydantic); D4 runs every hook it finds; options D11-D13 and
rosdep pip keys; `colcon-python-project` may remove D8's shims. Ranking: open until the user answers (below);
emerging shape D11 + generic assembly (D3 or in the starter) + D12/D13, with D10 the user's alternative.
Round-5 answers: middleware "temporary, ignore"; D10 for "one place per service" (M4, could) and exploring;
Python packages: "wait for ROS wrapping". So the app has no steps of its own: D2g leads (the user's remark), D3
runs up on M13 against W18, D8 is where it ends by itself, D4/D11-D13 moot, D10 trails on M14.
W18 (complexity, the user's condition) recorded, so complexity costs now count.

Round-5b checks: rejection check: D3's rows disagreed (stale row removed), D3 reworded without hook and pinned by
hash (no new mechanism, so D2g vs D3 is M13 against a tie-break); D2g's ✓ W16 holds only once the interim pip step
is gone; D2 and D2g are the same shape now (D2 merged); "moot" means parked, not out. Bias check: DB (assembly in
the base image), D2s (template sync for all copied files); the draft lacks any pip step, so a PolyMX release today
would miss runtime packages; "middleware: ignore" may mean "later"; the draft's app `dependencies.repos` doesn't match
the real one (5 repos, https URLs; whether cdr treats https and SSH spellings as one repo: it normalizes URLs,
`normalize_url`). Asked: where the recipe lives (D2g, D3, DB); whether PolyMX releases before the ROS wrapping.

D-records: D1 ✗ W17: the user's remark itself (the app repo assembles the whole service). D2 ✗ W16: the QC app's
docs ask to keep the middleware patch with the release recipe; in the machine repo it leaves the app's files, and a
second machine running the app copies the steps. D4 leads now: spike `spike-hook` (a hook in the locked tree writes
under `/opt/app` in the build stage; the release stage gets it, no source). Unverified: Ubuntu's `pip install
--prefix` may write `local/lib/python3.12/dist-packages`, outside colcon's path. D3 vs D4: equal but M13 (D3 keeps
one assembly for all machines) against a versioned remote dependency. D8 meets every column but is costly to reach;
it is where D4 converges as steps become packages (the hook empties). D5, D6, D9: complexity.

### Axis I, how the app's images are named so customers can share them (round 3; the user's remark)
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| I1 | The release tag only (`polymx-qc:1.3.0_acme`), as today | Simple | `.git` in the checkout makes every build miss the cache (spike), so no reuse (✗ W9); nothing says what the image holds (✗ W11b) | cheap | trailing (W9, W11b; its best variant is I7) |
| I5 | I1 plus OCI labels (`org.opencontainers.image.version`, the lock in the image); sharing left to the build cache | No new names; labels readable (spike) | Build once only with a warm cache on the same PC (spike: `--no-cache` gives a new ID); a label is not a name (~ W11) | cheap | trailing (~ W9, ~ W11) |
| I2 | A tag from a hash of the build inputs (`polymx-qc:in-7e44642b9aac`), plus the release tag | Build once by lookup; one image, several tags | Unreadable (✗ W11 without a label) | cheap | trailing (W11) |
| I3 | The app's own version (`git describe` at the locked commit) as the install name: `polymx-qc:2.3.1` | Readable (W11b) | Two customers on app 2.3.1 with different locks (an M8 override) install two different images under one name; the later build takes it | cheap | trailing (the user chose I7; W6b won't) |
| I3b | The app's version plus a hash of its inputs (lock body, base image): `polymx-qc:2.3.1-7e44642b9aac`; `release.sh` reuses it when present, the release tag is an extra name | W9 (same PC; cross-PC with I6), W10, W6b; two customers' locks with equal commits hash equal (tested) | Hand-picked inputs miss some: the base by tag not digest, the override's build settings, baked configuration (both checks, round 3); `git describe` changes when a tag is added, so the lookup misses (bias check); the content tag never reaches the bundle (~ W11b on the machine) | cheap | trailing (user chose I7, round 4) |
| I4 | Each service repo's CI builds and tags its images; the machine pins them | Shared by construction | No CI (round 2); parent rejected per-service publishing (N20b, release from pinned sources) | costly | trailing (no CI; parent N20b) |
| I6 | I3b, pushed to and looked up in the NAS registry, so another build PC reuses it | W9 across PCs | Relies on the registry being reachable at release time (parent N24 could) | cheap | variant (question) |
| I7 | The release tag stays the only name; `release.sh` removes `.git` from the lock checkout, so equal locked commits and build settings hit BuildKit's cache and give the same image (spike `spike-cachekey`); labels carry the app's commit (`org.opencontainers.image.revision`), its `git describe` and the lock's sha256; the bundle carries `lock.repos` | W9 on the same PC while BuildKit's cache isn't pruned, exact on every input (commits, base digest, args, target, contexts); W10; W11b on the build PC and the machine (labels travel with the image, the lock with the bundle); no hash code | Cross-PC needs a shared cache (I7b); a build still runs (seconds when cached); a package that runs `git describe` in its build loses `.git` (none known); the describe label changes when a tag is added later (new image config, same layers) | cheap | chosen (user, round 4: "label only") |
| I7b | I7 with a BuildKit registry cache on the NAS (`cache_from`/`cache_to` type=registry) | W9 across build PCs | Registry reachable at release time (parent N24, could); needs a buildx driver that exports caches (docker-container or the containerd image store): unverified here | cheap | not needed (W9 a could, same PC enough: user, round 3) |
| I5b | I5 with the input hash in a label and reuse by `docker image ls --filter label=...` (rejection check round 3) | No new name | Hand-picked inputs miss some (as I3b) | cheap | trailing (as I3b's input gap) |
| I8 | The app's git tag as an extra name next to the release tag: `polymx-qc:2.3.1` (user, round 4 question) | Readable on the build PC; W6b holds (each release installs by its release tag) | Two customers' different images on app 2.3.1: the later build takes the name, so `polymx-qc:2.3.1` says nothing reliable (~ W11b); kept as a label in I7 instead | cheap | trailing (~ W11b; the user chose I7) |
| I9 | Services with their own recipe (inference) pinned and named by their git tag: `image: polymx-serve:1.4.0`, `build: ...#v1.4.0`; no `pull_policy: build`, so Compose builds only a missing image (spike `spike-pullmissing`) (user, round 4) | Readable; its content is the repo at that tag (pip pinned inside); an open needs no network once built (W2) | A moved tag changes a rebuild (~ W4b) unless `v*` tags are protected (GitHub rulesets on private repos may need a paid plan: unverified); a customer branch that changes inference's build must use a new version, or the later build takes the name; inference is outside `lock.repos`, so its bump shows only in the `flexcompose.yaml` diff (not W5/W8) | cheap | chosen (user, round 4); tags not protected: "moved tags won't happen" (W4b for inference rests on convention, a known gap) |
| I9b | I9, but `build:` by full commit hash (`#3f9c2e1...`), `image:` by version (`polymx-serve:1.4.0`) (bias check round 4: still two literals) | Can't move (W4b) without tag protection; readable image name | A less readable `build:` line; hash and version must be bumped together (as I9's two literals) | cheap | runner-up (comes back if a tag is ever moved) |

## Matrix
Release-step costs scored against M12/M14 in the first draft are tie-breaks (round-1 correction); only the dev box's
creation counts for M12.

| Option | W1a | W1b | W2 | W3b | W4b | W5 | W6b | W7b | M5 | M11 | M12 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *priority, verified* | must, yes | should, yes | should, yes | should, yes | should, yes | should, yes | won't (round 4) | could, can't answer | could, yes | should, yes | should, yes | |
| S1 | ✓ | ✗ | ✗ | ✓ | | | | | | | ✓ | ✗ W1b W2 |
| S2 | ✓ | ~ | ~ | ~ | | | | | | | ✓ | ~ W1b W2 W3b |
| S2b | ✓ | ✓ | ~ | ~ | | | | | | | ✓ | ~ W2 W3b |
| S3 | ✓ | ✓ | ~ | ✓ | | | | | | | ✓ | ~ W2 (tool change: tie-break) |
| S7 | ✓ | ✓ | ~ | ✓ | | | | | | | ✓ | ~ W2 (tool change: tie-break) |
| S4 | ✓ | ✓ | ✓ | ~ | | | | | | | ✓ | ~ W3b (only what the last lock has); detached HEADs: tie-break |
| S4b | ✓ | ✓ | ✓ | ~ | | | | | | | ✓ | ~ W3b (only what the last lock has) |
| S5 | ✓ | ✗ | ✓ | ✓ | | | | | | | ✓ | ✗ W1b |
| S6 | ✓ | ~ | ~ | ✓ | | | | | | | ✓ | ~ W1b W2 (any local change refuses, `vcs.py:25-27`; with S8 tracked ones) |
| S8 | ✓ | ~ | | | | | | | | | ✓ | variant: removes the untracked-file refusal only (in the proposal with S3) |
| L1 | | | | | ✗ | ✓ | | | | | | ✗ W4b |
| L2 | | | | | ✓ | ✓ | | ~ | | | | ~ W7b (`cdr`, `vcs` where `lock.sh` runs) |
| L2a | | | | | ✓ | ✗ | | ~ | | | | ✗ W5 |
| L3 | | | | | ✗ | ~ | | ~ | | | | ✗ W4b |
| L3b | | | | | ✓ | ✓ | | ~ | | | | ~ W7b; an un-updated box locks older commits (tie-break) |
| L4 | | | | | ✓ | ✓ | | ✓ | | | | ✗ PC-06 (no committed lock) |
| L5 | | | | | ✓ | ✓ | | ✓ | | | | none ("no CI on machine repos" uncovered: question) |
| L6 | | | | | ✓ | ✓ | | ~ | | | | ~ W7b, ✗ W8 |
| R1 | | | | | ✓ | | | ✓ | ~ | ✓ | | ~ M5 (shared with R2); own dir name shared with R2's resolve stage; lock helper: tie-break |
| R2 | | | | | ✓ | | | ~ | ~ | ✓ | | ~ W7b, M5 (standalone build follows branches: not reproducible) |
| R2c | | | | | ✓ | | | ✓ | ~ | ✓ | | ~ M5 |
| R3 | | | | | ✓ | | | ✓ | | ✓ | | A-2 decided |
| T1 | | | | | | | ✓ | | | | | (pre-release reading: tie-break) |
| T4b | | | | | | | ✓ | | | | | `+` → `_` in the image tag (round 2: `-` collided with pre-releases) |
| T2, T2b | | | | | | | ✓ | | | | | (folder/regex change: tie-break) |
| T3, T4 | | | | | | | | | | | | not possible (git refuses a second `v1.3.0`; Docker refuses `+`) |
| T5 | | | | | | | ✓ | | | | | A-4 decided |

Axis I (columns W9 build once, W10 stored once, W11b traceable, W6b; W12 dropped in round 3):

| Option | W9 | W10 | W11b | W6b | ✗ or ~ |
|---|---|---|---|---|---|
| *priority, verified* | could, yes | dropped (round 4) | could, yes | won't (round 4) | |
| I1 | ✗ | ✗ | ✗ | ✓ | ✗ W9 W10 W11b |
| I5 | ~ | ~ | ~ | ✓ | ~ W9 W10 (`.git` misses the cache) W11b |
| I2 | ~ | ~ | ✗ | ✓ | ✗ W11b |
| I3 | ~ | ~ | ✓ | ✗ | trailing on the user's choice of I7 (W6b won't); the later build still takes the shared name |
| I3b | ~ | ~ | ~ | ~ | ~ W9 (same PC) W11b (name on the build PC only); a missed input reuses another release's image (W6b won't: tie-break) |
| I4 | ✓ | ✓ | ✓ | ✓ | no CI; parent N20b |
| I6 | ✓ | ✓ | ~ | ~ | as I3b, cross-PC |
| I7 | ~ | ~ | ✓ | ✓ | ~ W9 W10 (same PC, cache not pruned) |
| I7b | ✓ | ✓ | ✓ | ✓ | registry at release time (N24 could: tie-break); driver unverified |
| I5b | ~ | ~ | ✓ | ~ | hand-picked inputs (tie-break) |
| I8 | ~ | ~ | ~ | ✓ | ~ W11b (an extra name the later build takes) |

Services with their own recipe (W4b rebuild from the same source, W2 open offline):

| Option | W4b | W2 | ✗ or ~ |
|---|---|---|---|
| I9 | ~ (✓ with tag protection) | ✓ | ~ W4b until tags are protected |
| I9b | ✓ | ✓ | (less readable `build:`: tie-break) |

## Evaluation

### Round-3 checks (findings and what changed)
- Bias check (weighed): I3b's lookup key included `git describe` (not an input); the base was hashed by tag; the
  override's build settings weren't hashed; the content tag never reaches the bundle (W11 only on the build PC); W12
  may vanish with runtime configuration (asked); W10 adds nothing beyond W9; missing options: reproducible builds,
  a registry build cache (I7b), digest references, runtime configuration. Led to the spike `spike-cachekey` and I7.
- Rejection check: W9/W10 cells inconsistent between I2/I3/I3b (fixed: same-PC limit for all); I1's record
  contradicted its row (fixed with the spike); I4's W12 cell had no record (now ?); I1/I5 lost only on unverified
  W11 (now W11b, labels count); I3's W6b counted W12 twice (dropped); I6 should be scored (now a variant, with I7b);
  the base-by-tag gap exists today; regressions: S4/L1/L4 still cited M12, R1's body kept ~ M11 (fixed).

### Axis I records (rounds 3 and 4)
**I1** (trailing W9, W11b): the reader of `polymx-qc:1.3.0_acme` can't tell the app version; with `.git` in the
checkout every release rebuilds (spike `spike-cachekey`: two fresh clones, two image IDs). Its best variant is I7.
**I5** (trailing ~ W9 W10 W11): spike `spike-share`: same inputs under two tags gave one image ID with a warm cache,
a new ID with `--no-cache`; a release PC without that cache builds again. Compared with I3b: I3b's ~ W9 is the same
cross-PC limit, but I3b names the version (W11).
**I2** (trailing W11): `in-7e44642b9aac` says nothing to a reader. Its best variant adds the version: I3b.
**I3** (trailing W6b): customer A overrides `packml_ros2`, customer B doesn't; both on app 2.3.1: both install an
image named `polymx-qc:2.3.1`, and the later build takes the name, so A's machine may get B's image. Its best
variant keeps the release tag as the install name: I8.
**I4** (trailing): no CI (user, round 2); the parent rejected publishing per service (N20b). (Its round-3 W12 cell went with W12.) Where
baked configuration would enter a service's own CI build is undefined.
**I3b** (trailing; round 4: the user chose I7): both checks found inputs its hash misses today: the base by its mutable tag, the override's
build settings (target, args, contexts), later baked configuration; `git describe` changes when a tag is added, so
the lookup misses and two names point at one content. A shell extraction of the rendered build section proved
fragile (spike: the `sed` range ran past `build:`). Compared with I7: I7 lets BuildKit key on every input exactly.
What separates it from I7 is that gap: a missed input reuses an image built from other inputs under another
release (~ W6b). Its `git describe` and same-PC limits I7 shares (not counted).
**I5b** (trailing ~ W6b): as I3b's input gap. **I6** (variant): I3b's gaps, cross-PC; I7b is its equivalent for I7.
**I8** (trailing ~ W11b): `polymx-qc:2.3.1` as an extra name points at whichever customer's 2.3.1 image was built last.
**I9** (chosen) vs **I9b**: equal but on W4b, where I9 depends on tag protection being available (question).

### Round-2 checks (findings and what changed)
- Rejection check: matrix priority row was stale (fixed); PC-06 had no row (added); S6's W2 now ~ like S3/S7 (its
  trailing verdict stands on tracked changes); S4's detached HEADs and L1's retag were scored as M12 (tie-breaks
  now); L4 ✓ W4b; L5 fails no requirement (open, asked); L6 needed a requirement for "reviewed before the tag" (W8,
  from the user's choice); L3/L3b need `vcs` on the host too (~ W7b); R1 ✓ W7b, its M11 cost shared with R2's
  resolve stage: R1 becomes runner-up; T2's M14 citation was stretched.
- Bias check (weighed): `vcs export --exact-with-tags` writes tags, which can move: `lock.sh` now writes hashes
  (W4b). T4b's `-` mapping collided with pre-releases: `_` now. S2b silently looped on an empty leftover folder:
  it now fails loudly as today's starter does. The rosdep hint fired on a stale cache too: it now names both fixes and
  installs what resolves first (`-r`). Inference pinned by full hash (short hashes in BuildKit git contexts
  unchecked). The draft now says R2 needs the sibling's step 1. New options: S4b (adopted as runner-up interim),
  resolve on `postCreateCommand` only (a variant of S2b: rarer, but a teammate's repo arrives only on Rebuild),
  `cdr --lock` (added to the proposal), a dry-run drift warning in `release.sh` (variant of L2, not drafted),
  the customer in the image name (variant of T4b; the user chose the tag form). W1b, W6b, W7b reworded as needs.

### Round-1 checks (both independent; findings and what changed)
- Rejection check: S2's ✓ on W1 was overstated (a missing top-level repo triggers a full `cdr`): S2 → ~ W1b, S2b
  added. S3's runner-up place contradicted the scoring (its only cost a tool change, no requirement): S3 now leads
  together with S7 if a `cdr` change is acceptable. M12/M14 were stretched to release-step costs: now tie-breaks;
  parent wording quoted. Cell fixes: L1 ✗ W4b, L2 ~ W7b (shared with R2), R1's SSH partly shared (the standalone
  resolve stage uses it too), R3's M5 cell removed, L4 cites PC-06's wording. New variants: L3b, T4b, T2b, S8.
- Bias check (its ideas weighed, not adopted by default): W1 mixed loss (cdr already refuses before moving: no loss)
  with surprise (branch moved): split into W1a/W1b. W3, W4, W6, W7 named mechanisms or overclaimed: reworded (W4b:
  same *source*, not same images; apt/rosdep/base tag move). New options: S7 (report on open), S8 (ignore untracked),
  L6 (one command), R2c (lock and checkout in a container), T5 (fork per customer). Unverified claim from it: a
  failing `postAttachCommand` leaves the container usable (only an error shown); not checked yet. R2's draft
  standalone build fails with `--strict` (M5): the draft drops `--strict` there. R2's override names the app's lock
  key as a folder: the machine knows its services, which M11 allows.


**S1** (trailing W1b, W2). W1b as worded: an open doesn't change a checkout's branch and isn't refused because of
WIP. Scenario (spike, cdr from `nl-cboost-ros-tools` main, vcs2l): a developer commits on `feature/x` in the app
checkout and reopens the window: `cdr` puts the checkout back on `main` without a warning (the commits stay on
`feature/x`, so W1a holds). An untracked scratch file in any checkout makes `cdr` refuse, so `bootstrap.sh` fails on
every open. Offline, the resolution can't fetch and fails. Checked against the other requirements: none needs a full
resolve on every open; W3b is met by S3/S7 without it. Best variant: S5/S6. Compared with S2b: S2b carries ~ W2 and
~ W3b, S1 ✗ W1b and ✗ W2.

**S2** (trailing ~ W1b). Scenario (rejection check): a teammate adds a top-level repository; on the next open the
missing check runs the full `cdr`, which moves every feature branch back and refuses on any untracked file: S1's
scenario, only rarer. Best variant: S2b. Compared with S2b: same cells but W1b.

**S2b** (leading without a tool change). Its ~ W3b: a teammate adds a dependency to the app's own
`dependencies.repos` while every top-level repo is present: nothing triggers, colcon fails on a missing package, and
the box doesn't say why. Mitigation within S2b: `bootstrap.sh` prints `--update` when `rosdep check` or colcon finds
a missing package (to weigh; not drafted).

**S3, S7** (leading with a `cdr` change). Both meet W3b fully (S3 brings the missing repos in, S7 says what to run);
both need a resolution on every open (~ W2 if a failed fetch only warns) and a change in the colleague's tool, which
no requirement covers (a tie-break, but an outside party's yes is a precondition: question). S3 vs S7: S3 changes
nothing existing but clones; S7 changes nothing at all. Combined: S3 for missing repos, S7's report for the rest.

**S4** (trailing W3b; detached HEADs a tie-break). Scenario: a developer opens a fresh box and starts editing the app: every checkout is a
detached HEAD at the lock's commit; their first commit is on no branch. Compared with S2: both ~ W3b; S4 adds a tie-break cost
(a `git switch` per repo before work).

**S5** (trailing W1b): as S1's feature-branch scenario; the warning doesn't stop the switch.

**S6** (trailing W1b, W2): leaves branches alone, but any local change still refuses (untracked too, unless S8), and it fetches on every open.
Compared with S3: S3 leaves every existing checkout alone, S6 only those on another branch.

**L1** (trailing W4b). Scenario: release manager tags `v1.3.0`, runs `release.sh`; a dependency's branch moved
since the last lock, so the lock changes and the script refuses: delete the tag, commit the lock, tag again. A month
later, rebuilding `v1.3.0` resolves again and refuses (or, without the refusal, builds other commits: ✗ W4b).
Compared with L2: L2 has no ✗ or ~.

**L2a** (trailing W5). Scenario: on `customer/acme` the app pin changes to `release/2.3`; nobody runs `lock.sh`;
`release.sh` builds from the old lock with the app at `main`'s commit. Compared with L2: only the sha line differs.

**L3** (trailing W4b): a developer's unpushed commit lands in the lock; the build's `vcs import` can't fetch it, or
worse, a later force-push removes it.

**L4** (trailing PC-06): every repo pins commits; each bump of a shared package is a commit in every repo that
pins it. PC-06 settled branch-following plus a lock.

**L5** (won't for now): the user doesn't want to rely on CI yet (round 2); it fails no requirement and comes back when CI is wanted.

**R1** (runner-up; round 2: its ~ M11 removed as shared with R2's resolve stage, its ~ M5 shared with R2, the lock helper a tie-break; it has ✓ W7b where R2 has ~). Scenario: the app's Dockerfile must `COPY . /ws/src/nl-polymx-automated-qc-application`
so that `vcs import --skip-existing` skips the lock's entry for itself: the app knows the directory name the
machine's lock gives it (only its own repo name; R2's resolve stage names it too, so not counted). Needs a helper to read the app's commit from the
lock and SSH plus GitHub's host key inside the build. Compared with R2: both ~ M5 (the standalone build follows branches); R1 ✓ W7b where R2 has ~.

**R3** (A-2): the machine would hold a recipe again; A-2 decided against it.

**T2** (trailing: the user chose T4b; its costs are tie-breaks): `release-<tag>/` would contain a `/`; `release.sh` and the bundle folder naming change.
**T3, T4** (not possible; round 4: W6b won't, so these rest on facts): git can't hold `v1.3.0` twice; Docker refuses `+` in a tag (T4b maps it).

### Harms of the leading set
- S2b (interim): after switching the machine repo to a customer branch, existing checkouts stay on main's branches;
  `bootstrap.sh` now warns for top-level checkouts off their pinned branch (round 4, bias check); transitive ones are
  not checked until S3/S7. The customer dev box workflow says to run `--update` after switching.
- S2b, S2: a developer never runs `--update` and works on stale dependencies for weeks; the release (L2) builds newer
  ones than they tested. Mitigation to weigh: `bootstrap.sh` prints how far each checkout is behind its pin
  (needs a fetch: W2).
- L2: two release managers re-lock on different days and get different locks for the same `dependencies.repos`;
  the sha line doesn't catch that (by design: picking up fixes is a deliberate re-lock).
- R2: `RELEASE_SRC` holds every locked repo on the release host during the build (temp folder, removed on exit).
  The release build no longer clones inside Docker, so a host without the repos' SSH access can't release (as today).
- I7: a build input BuildKit can't see would share a wrong image: none in the draft (every input is in the build
  contexts, args or base). A label set from a per-release value (the release tag) would split every customer's
  image: the draft's labels come from inputs only, and the override says so.
- I7: `APP_VERSION` from `git describe` changes when a tag is added to the same commit: the next build gets a new
  image config over the same cached layers (stored nearly once).
- I7: same-PC only, and only while BuildKit's cache isn't pruned (default size-based GC); a second build PC builds
  again (I7b).
- T4b: the image tag differs from the git tag (`1.3.0_acme` for `v1.3.0+acme`); with `-` it collided with a
  pre-release tag (bias check, round 2), so `_`, which a semver pre-release can't hold.
- L2 on customer branches: every merge of main into a customer branch conflicts in `lock.repos` (its first line and
  pins differ): take either side, then run `./lock.sh` again and commit. A recurring cost of "fix for all" (A-4).
- L2's sha line covers only the top-level `dependencies.repos`: a pin changed in a dependency's own file ships at
  the next re-lock, unseen by the refusal (W5 as worded holds; `cdr --lock` in the proposal would close it).
- T1: one-way: tags on shipped machines. A tool that orders semver pre-releases before releases (none in this
  repo; `update.sh` keeps only one customer's releases per machine, `sort -V` orders `v1.3.0-acme` < `v1.3.1-acme`).
- The app Dockerfile's standalone build (`resolve` stage) can't use `--strict` while pins follow branches: a
  standalone build is not reproducible (M5 is a could).

## Open questions
1. I9 vs I9b: can `v*` tags be protected in the service repos (GitHub plan)? If not, build by commit hash.
2. W6b: should the machine refuse another customer's bundle (T6), or are distinct names enough?
3. W1a (claimed must), W2 (claimed could), W6b, W10, W11b priorities: unverified.
4. W7b: can't answer yet (assumption): R2 now, R2c if Windows release PCs need it.
5. The colleague's answer on the cdr proposal (S3 + S8, optionally `cdr --lock`); until then S2b.
6. Unverified: a failing `postAttachCommand` leaves the container usable.

Preconditions of the chosen draft (not decisions, steps): `cdr` and vcs2l in the base image (nl-cboost-docker-ros2;
today neither is there); the sibling's step 1 (FlexCompose passes `build:` on as written); tag protection or I9b.

## Sources
| Claim | Source | Date | Reliability |
|---|---|---|---|
| `cdr` refuses any checkout with `git status --porcelain` output, before moving anything | `nl-cboost-ros-tools` `tools/src/cboost_ros_tools/deps_resolve/vcs.py` `_has_local_changes`, `import_pins` (main 18fc229); spike `cdr-spike` | 2026-10-29 | code + spike |
| `cdr` moves a checkout on a feature branch back to the pinned branch | spike `cdr-spike` (vcs2l, vcs import checks the version out); `resolver.py` `resolve` | 2026-10-29 | spike |
| `cdr` fails without network (fetches every pin) | `remote.py` `RemoteCache.fetch`; spike | 2026-10-29 | code + spike |
| vcstool fails on Python 3.14 (`pkg_resources`); vcs2l works | spike | 2026-10-29 | spike |
| A named build context replaces a Dockerfile stage of the same name | spike `spike-ctxstage` (Compose 5.6.1); Docker docs (named contexts: "When Dockerfile defines a stage with the same name it's overwritten"), docker.com blog "Dockerfiles now Support Multiple Build Contexts" | 2026-10-29 | spike + 2 docs |
| `pull_policy: build` with `image:` and no `build:` creates the container | spike `spike-pullbuild` | 2026-10-29 | spike |
| `west update` checks out detached and leaves branches; `--keep-descendants` keeps descendant branches; syncing is an explicit command | docs.zephyrproject.org west built-in commands | 2026-10-29 | docs (several versions agree) |
| `rosdep check` prints `Cannot locate rosdep definition for [<pkg>]` (rc 2) for a dependency neither in src nor a system package | spike `spike-rosdep` in `cboost-ros2-jazzy:0.2.0` | 2026-10-29 | spike |
| `update.sh` keeps releases by `sort -V` over `../release-v*/` | `templates/integration/bundle/update.sh:17-18` | 2026-10-29 | code |

## Round checklist
Checklist (review round 5b, 2026-10-29: axis D decided):
- [x] Log (first round): its path in the report; new or resumed, and what was outdated (n/a)
- [x] Problem and success criteria (first round): stated without solution words (n/a)
- [x] Scope: split, widened or unchanged (widening: the parent's A-2 reopened by the user's remark; asked)
- [x] Requirements: new or changed ones, each a need (no mechanism) with reason, source, priority and verified (none new)
- [x] Replaced requirements: new IDs, old rows moved; options re-checked from the old matrix column (none)
- [x] Written requirements: evidence found for each (commit, decision log) (n/a)
- [x] Deciding unverified requirements: asked this round, or assumptions after "can't answer" (app-specific build steps: where they belong)
- [x] Options: added, by the categories of Phase 3 (D1-D4 sketched; a full round asked)
- [x] Searches: recorded in the round's entry; or "no web search", said in the report (no web search)
- [x] Deciding claims: cross-checked against a second source, or marked unverified (cdr has branch_state and the local-changes check: code)
- [x] Matrix: updated (rows in Options; W13 met by G-A and G-B, not by R2 alone)
- [x] Rejection records: one per trailing or not applicable option (scenario, best variant, leader's cells compared) (in the rows; R4b's scenario: 5-10 manual checkouts per release)
- [x] Harms: scenarios for the leading option (G-A: releasing from the dev folder means aligning checkouts first)
- [x] Reversibility: every option rated; one-way means extra stress-testing, said in the report
- [x] Draft and stress test: of the leading option; the draft's path in the report (guard sketched in chat)
- [x] Bias check: findings in the log and the report; or "not independent" (not run: a small review refinement; not independent)
- [x] Rejection check: findings in the log and the report; verdicts corrected (not run, as above)
- [x] Ranking change: recorded
- [x] Report: what changed, recommendation, runner-up, must rejections, the checks' findings
- [x] Questions: deciding unverified ones first, ordered by ranking impact, through the question tool, remarks last
- [x] Pushback: if the user picked a worse option, asked what makes it better (n/a this round)

## Rounds
- Round 1 (2026-10-29): framed from the workflow walkthrough; spikes on cdr, named contexts; S2, L2, R2, T1 led; after the checks S2 → S2b (or S3/S7 with a cdr change), W1/W3/W4/W6/W7 reworded.
- Round 2 (2026-10-29): answers: cdr change accepted (S3/S7 lead, S2b + rosdep hint interim), W1b/W3b/W5 verified should, L2 chosen, T4b chosen over T1, W7b unknown (R2, R2c fallback). Checks: lock writes hashes, T4b maps + to _, S4b runner-up interim, R1 runner-up, L5 open (CI question), W8 and PC-06 rows.
- Round 3 (2026-10-29): answers: L2 with `cdr --lock` nice-to-have, no CI (L5 won't), `1.3.0_acme` fine; remark → axis I (shared app images): I3b led; after the checks and spike-cachekey, I7 leads (cache + labels, no new names), I3b runner-up.
- Round 4 (2026-10-29): W9 could, W12 dropped; the user's question gave I8 (app git tag as name: ✗ W6b) and I9 (inference by git tag); chosen: I7, I9. Answers: W1a must, W2 should, W11b could, W10 dropped, W6b won't, tags by convention, no guard.
  Checks: lock in the bundle, revision label, no `pull_policy: build` (offline opens), off-pin warning in bootstrap, I9b and T6 added, preconditions listed.

## Decision
Draft (2026-10-29): *Why* and *Rejected* confirmed by the user, on the condition that complexity stays in check; a walkthrough given; then the overview review.

**Choice.** The starter as in `tmp/machine-starter/integration/` (full; generic `example_` names; the plan in
`tmp/machine-starter/PLAN.md`; the earlier PolyMX-named draft in `tmp/machine-starter-draft/`):
- S9b (review round 2): an open never clones or moves a checkout: `bootstrap.sh` runs rosdep and names missing
  repositories (top-level, or deeper via rosdep) with the hint `bash src/bootstrap.sh --update`, which runs the full
  cdr. A new box needs that command once. No `--missing-only`, no temp-folder resolve, no off-pin warning.
  Stripped in review round 3 to ~15 lines: a one-line "nothing checked out yet" test (no Python), the rosdep
  hint printed when `rosdep install` fails (no grep, no `-r`).
- L2: `./lock.sh` writes `lock.repos` (commit hashes, a first line with `dependencies.repos`' sha256) in a fresh
  folder; reviewed, committed, then tagged; `release.sh` builds only from it and refuses a lock written for another
  `dependencies.repos`.
- R2 + D2g (review round 5, A-2 changed for colcon services): `release.sh` checks the lock out on the host; the
  override builds the machine repo's generic `image/Dockerfile` with that checkout as the named context `workspace`.
  Service repos hold only code and `dependencies.repos`; services with their own recipe (inference) keep theirs.
- T4b: customer releases are tagged `v1.3.0+<customer>`; images `1.3.0_<customer>`.
- I7: the release tag is the only image name; `.git` is removed from the release checkout so equal inputs reuse
  the cached image; the bundle carries `lock.repos`. (Labels dropped in the review, see below.)
- I9: services with their own recipe are pinned and named by their git tag (`polymx-serve:1.4.0` from `#v1.4.0`),
  built only while missing (no `pull_policy: build`).

**Why** (each on a requirement the user confirmed):
- S9b (was S3/S7 with S2b): W15 (should, verified review round 2: an open never acts on its own; predictable), W1b (should, verified round 1: opening must not move a checkout or refuse on WIP; the
  spike showed cdr does both), W2 (should, verified round 4: open offline), W3b (should, verified: a cdr change
  "nice", a hint fine), W1a (must, verified round 4: never lose work). The user chose the explicit sync (S9b) over automatic cloning (S9, S3) in the review.
- L2: W5 (should, verified: refuse a stale lock), W8 (should, verified: the lock reviewed before the tag), W4b
  (should, written: rebuild from the same source commits), PC-06 (a shipped project builds from a committed lock).
- R2: M11 (should, parent: the app's repo knows nothing about machines: the named context keeps the app Dockerfile
  machine-agnostic), W4b; R2 over R1 is a tie-break (no SSH or lock helper inside the build), with W7b unknown.
- T4b: the user's choice (round 1); git can't hold one `v1.3.0` on two branches, Docker can't hold `+`; `_` because
  `-` collided with pre-release tags.
- I7: W9 (could, verified: build once, same PC enough), W11b (could, verified: traceable on the build PC and the
  machine); the user chose labels over a version name (round 4).
- I9: the user's choice (round 4): readable names per service version; W2 (no rebuild, no network on open).

**Rejected** (the deciding reason each):
- S1 (cdr on every open): W1b, W2. S5: W1b. S6: W1b, W2 (any local change refuses; fetch on open). S4/S4b
  (from the lock): ~ W3b (only the last lock's dependencies), runner-up interim. S2 (full cdr when a top-level repo is
  missing): ~ W1b.
- L1 (release.sh re-locks): W4b (a rebuilt tag re-resolves). L2a: W5. L3: W4b. L3b: ~ W7b, tie-break. L4: PC-06.
  L5 (CI): won't for now (no CI wanted yet). L6 (one command): W8.
- R1 (git context + lock helper): runner-up; R2 wins on tie-breaks. R2c: fallback if W7b matters. R3: A-2.
- T1 (`-acme`): the user's choice of T4b. T2/T2b: the user's choice; folder/regex changes. T3, T4: not possible.
  T5: A-4. T6 (customer guard): W6b won't.
- I1: W9, W11b. I2: W11b. I3, I8 (app version as a name): the user chose labels; the name points at whichever
  customer's image was built last. I3b, I5b (hand-picked input hash): a missed input reuses another release's image;
  the user chose I7. I4: no CI; parent N20b. I5: ~ W9 (`.git` misses the cache). I6/I7b: W9 cross-PC not needed.
  I9b (build by hash): runner-up, comes back if a tag is moved.

**Known gaps.**
- Every starter file (recipe, `release.sh`, `lock.sh`, `bootstrap.sh`) is copied per machine: a fix is hand-copied
  (~ M13); a template tool is for later (with the second machine).
- PolyMX's release needs a temporary pip step (four Python packages, PyPI dependencies unpinned, the EtherCAT git
  pin outside the lock) in its machine copy until those packages are ROS packages.
- Inference's rebuild from the same source rests on tags never being moved (convention, user round 4).
- After switching to a customer branch, a developer who forgets `--update` works on the previous versions unwarned
  (off-pin warning dropped by the user for simplicity).
- A new box needs `bash src/bootstrap.sh --update` once (S9b's ~ M12).
- The stale-lock guard covers only the machine's own `dependencies.repos` (`cdr --lock` would cover transitive files).
- `release.sh` and `lock.sh` need cdr and vcs2l on the release host (W7b unknown; R2c the fallback); Windows untested.
- Build once only on the same PC, while BuildKit's cache isn't pruned.
- Every merge of main into a customer branch conflicts in `lock.repos` (take either side, re-lock).
- The base image literal twice (A-5's accepted gap); the app's standalone build follows branches (M5 could).
- Unverified: a failing `postAttachCommand` leaves the container usable; BuildKit git contexts by tag over SSH.

**Preconditions and open child decisions.**
- cdr and vcs2l in the base image (nl-cboost-docker-ros2) before the starter's dev box works.
- The sibling's plan step 1 (FlexCompose passes `build:` on as written).
- The cdr proposal (colleague's answer).
- Parent's later decision: a second colcon service from source; inference from source in the dev box.

Changes from the review (2026-10-29):
- `cdr --verify` dropped (user): it sees only checkouts next to `release.sh` (with `devbox:volume` it checks
  nothing), so W13 becomes a won't. The README says a release builds the committed lock, never your checkouts.
- Review round 5b: D2g chosen over DB and D3 (no requirement decided it; the user chose the machine repo);
  PolyMX releases before the ROS wrapping, so its machine copy of the recipe gets a temporary pip step (and middleware
  staging if needed), not the starter; keeping copied starter files in sync (copier/cruft) is for later.
- Review round 5: the parent's A-2 changed for colcon services: their release recipe is generic and lives in the
  machine repo (D2g), since the app has no steps of its own (middleware patch temporary, Python packages to become
  ROS packages); a stopgap for PolyMX's pip packages goes into PolyMX's machine repo only.
- Review round 4: targets devbox:host/devbox:volume kept, README says to clone the machine repo into the box's src/
  for them; the app Dockerfile's standalone stage dropped (user): M5 (could) no longer met, the `workspace` stage now
  fails loudly when built alone (spike `spike-failstage`). Remark: the app repo now both builds its packages and
  assembles the whole service: move the recipe to the top-level repo? This reopens the parent's A-2. Found: the QC
  app has its own build steps (four pip dependencies outside `dependencies.repos`, patched Fast DDS/rclpy staged
  from `middleware/`). Options D1 (A-2 as is), D2 (all in the machine repo), D3/D4 (generic assembly in the machine
  or a shared repo, the app's own extra steps in the app repo). Asked whether to reopen A-2 as a round.
- `cdr --verify` accepted by the colleague (2026-10-29). The user asked whether `--missing-only` is needed if the
  checkout step leaves `bootstrap.sh`: S9 (clone only into an empty workspace, else a hint) makes it unnecessary
  and replaces S2b and S3/S7; the off-pin warning would go too (proposed, asked).
- W13 added (should, the user's worry about releasing from a working tree); R4/R4b (build from the dev checkouts)
  rejected; guard G-A (`cdr --verify`, a fourth item in the cdr proposal) chosen by the user over G-B (release from a clean
  worktree) for: reusable in cdr, fewer machine scripts, release from the dev folder (W14), naming what differs.
  Rebuilding an old tag uses a worktree (no checkouts, so nothing to differ).
- Labels removed (app commit, `git describe`, lock sha256): `release.sh` named the app repo, so the starter wasn't
  generic, and they served only W11b (could); the user: "remove the entire tag system, to prevent runaway
  complexity". W11b is now met only by `lock.repos` in the bundle (which commits a release holds, not which image).
- A comment on the app service says where its code comes from (sibling N25: a reader of the template can tell
  what the dev box runs).

Decision checklist:
- [x] Stop condition: no new requirements, no ranking change, nothing deciding left unverified (round 4; W7b an assumption)
- [x] Why and Rejected: each on a requirement the user confirmed; confirmed by the user (2026-10-29: "looks correct, as long as it doesn't cause the complexity to get unnecessarily out of hand")
- [x] Known gaps and open child decisions: listed in *Decision*
- [ ] Documentation: updated where the rule takes effect; overstated requirements corrected; commit message proposed
- [ ] Success criteria: carried over only as project rules
- [ ] Out of scope: noted where open work is kept
- [ ] Overview: choice, pros and cons, rejected, gaps, plan, files
- [ ] Review: in open chat; nothing implemented before it

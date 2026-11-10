# TODO

Most important first. `§n` = FLEXCOMPOSE_DESIGN.md section.

## Release targets: open points

Release targets, the integration starter and `tests/e2e.sh` are done (design §13). The prototype's documents are in
git history: `git show 88758e0:prototypes/release/<file>` (`release-target.md`: constraints, questions and decisions,
C/A/P/D/Q codes; `release-options.md`: the four layouts compared; `concept-1/`: the polymx reference).

- **Machine starter with `cdr`** (supersedes "programs with their own recipe" and "where a machine's services
  live"): researched and drafted 2026-10-29 (`machine-starter-template.md`, *Decision* Draft); the full starter, the
  PolyMX integration repo and the plan in `tmp/machine-starter/`. Paused before the review closed. Resume from
  `tmp/machine-starter/PLAN.md`: close the review, step 0 (Decision sections of the parent logs; tell the colleague
  `cdr --verify` is withdrawn), step A (`cdr` + vcs2l in the base image), step 1 (FlexCompose `feat!`: `build:` as
  written).
  - **Open (2026-11-10): the recipe back in the service repo?** The user wants a service's build instructions in
    its own repo, several service repos per machine and a dev container per service. A working example is in
    `tmp/machine-starter-services/` (its README lists what it changes in the plan: A-2, step 2, step 1's
    `BASE_IMAGE`, and the open points). Not reviewed; decide before step 0, then update the log and PLAN.md.
  - **Prototype (2026-11-10): FlexCompose imports, complete and tested, not reviewed.** A service repo keeps its
    own `flexcompose.yaml`, release override, Dockerfile and dev box; the integration template only imports
    (`flexcompose_options.imports: [<folder>]`). An imported workspace service gets its own checkout as `src/` and
    its own volume; its dependencies are cloned into `deps/` in its checkout. The code is uncommitted in the
    FlexCompose repo (check `git status`/`git log` there); the example and its test are in
    `tmp/machine-starter-imports/` (README: how it fits, costs, what is not verified). If the user accepts it:
    split into steps (the import; imported release overrides; the starters `templates/` and `tests/e2e.sh`;
    design, README and REQUIREMENTS.md), record the decision in `machine-starter-template.md` (A-2 back in the
    service repo; PLAN steps 2 and 4 replaced), and rewrite PLAN.md.
    Limits of the prototype: only build context, bind mounts and env files of an imported service are rebased;
    an importing template's own workspace service mounts `.`, which holds the imported folders (no warning);
    top-level keys of imports are merged, so equal volume names are shared; the switch and shared-folder notes
    ignore imported workspaces; `devbox:host` is refused for imported workspace services; nested imports are
    refused; no per-developer choice between source and image.
    `tmp/machine-starter-services/` is the earlier variant without imports: superseded, delete when decided.
  - PLAN.md steps 1-2 and the vault's `CLAUDE.md` still name the Go files; the CLI is Rust since `c88283f`.
- **Machines may pull** (REQUIREMENTS.md `release-offline`, `release-registry-pull`): the release file sets
  `pull_policy: never`, which fits today: pulling from an online registry is a Won't. Waits for a request for an
  online update process; then update §13, the `release` target and the README. Until then only §13's wording is
  too strict: it says the machine *has* no registry access, where `release-offline` says it *can* run without one.
- **Polymx Python dependencies**: proposal in `python-dependencies.md` (pip convention now, a private
  package index later). Waits for the colleague reorganising the branches and dependencies. The machine starter's
  plan (step 6) has a temporary pip step in PolyMX's integration repo until they are ROS packages (user,
  2026-10-29).
- **Polymx fit** (`release-target.md` D1-D13): the release build stops at rosdep (2026-10-22, base 0.2.0):
  `yaskawa_hse_ros` needs `python3-yaskawa-hse-driver` (no rosdep key; see the Python dependencies item) and
  `nl_cboost_machine_state_manager` lists `ament_python` as a dependency (not a key; it belongs in `<build_type>`).
  Open Q17-Q21; try the reference Dockerfile on polymx itself (its
  `stage-runtime.py` scripts, wrapper and artifact).
- **Check in VS Code on Windows.** Linux passed 2026-10-21 on a fresh checkout of the polymx branch
  `feat/flexcompose-integration`: *Reopen in Container*, the
  agent in `postAttachCommand`, six private clones, identity, no *dubious ownership*, clean line endings, push from
  the box, a failing hook (rosdep) shown clearly with the box still usable, and a reopen that skips existing
  checkouts. Windows: the same list, plus line endings on a Windows checkout and the hook's `chown`.
  Open: would `postStartCommand` get the agent too (untested, not needed now).
- **Machine start on boot**: relies on `restart: always` + Docker enabled on boot; not tested with a real reboot. Polymx
  wants `restart: "no"` (D10): then nothing starts on boot; a systemd unit would decouple the two (design §12). Also:
  old release folders keep their `images.tar` (disk), and `keep=3` is fixed in `update.sh`.
- **Revisit (user, "for now" in design §12)**: the override as plain Compose (`name:` and `flexcompose_options`
  refused, no test on purpose; may it switch features?); `--project` always gets `-build`/`-release`; the build
  settings go to every service with `build:`, also a template sidecar.
- **Release settings for production** (health checks, limits, `restart:`, a `.env` per machine): decide with the first
  real release (polymx, or `example/docker-compose-base.yaml`).
- **Dev box starter's personal bootstrap**: still in `postCreateCommand` (once per container); move it to
  `postAttachCommand`, as in the integration starter? Low urgency.
- **Rust in a release** (design §12 known gaps): `colcon-ros-cargo` may install crate sources into
  `share/<pkg>/rust/`, which trips the source check; then remove it in the build stage. When a machine first uses Rust.
- **Prebuilt images in a release**: `release.sh` builds but never pulls, so `docker save` fails on a service without
  `build:` (e.g. `image: postgres:16`) whose image isn't on the PC yet. Fails loudly; fix it only when it happens.

## Base image (`nl-cboost-docker-ros2`)

- **Split into a `devbox` and a `runtime` image** (discussed 2026-10-22). Today the release stage is `FROM` the dev box
  image, so every release image carries 3.58 GB (2.71 GB of it the install layer: rviz2, ros-gz, rqt, build tools).
  Plan: one Dockerfile with two targets, built and tagged together (`runtime`: `ros:jazzy-ros-core`, user, entrypoint,
  rmw-zenoh, mqtt-client; `devbox`: today's image). FlexCompose needs no CLI change: the starter's Dockerfile gets
  `FROM ${RELEASE_BASE_IMAGE} AS release`, set as `build.args` in `flexcompose.release.yaml`; the build stage keeps
  the dev box image (same toolchain). Update design §13. Up: much smaller `images.tar` and machine disk, nothing
  dev-only on the machine. Down: two images to keep in step (same build, same tag, or ABI drift); machines with GUI
  tools on the machine must add them; undeclared runtime dependencies fail on the machine (see the release checks below,
  do those first).
- **Release checks before shipping** (worth it with or without the split: hand-installed packages in a dev box
  never reach the release image either). Each its own step in the integration starter, design §13, and
  `tests/e2e.sh` with a deliberately missing dependency:
  1. Release stage: `ldd` over every ELF file in `/opt/app`, fail on `not found` (like the source check).
  2. `release.sh` smoke test: start the release services briefly; fail if a container exits (optionally check
     `ros2 node list`). Catches plugins loaded by name, missing launch/config files.
  3. Nice to have: import every Python package under `/opt/app`, fail on `ImportError`.
  4. Team decision: a test bench that runs the real bundle (`images.tar` + `.env`) before driving to the customer.
- **Decided for the next tag** (2026-10-22): tag `0.2.0`, a clean start (`0.1.0` stays in the registry, without a git
  tag); registry `cboost-c-nas:5100` (`:5180` also runs the registry UI and breaks more easily).

## Make a CI pipeline to create a release binary and installer
Done and tested with `v1.1.0`: `.github/workflows/release.yml` (on a `v*` tag: test, build with the version stamped,
release with one zip per OS: `flexcompose(.exe)` + `install.sh/.cmd` from `flexcompose-cli/install/`; release notes
from `cliff.toml` via git-cliff, plus the annotated tag's message). Left:
- **Move the release to cargo-dist, with a static `-musl` Linux binary** (user, 2026-11-03; next commit after the
  Rust migration). Wanted from dist: its generated workflow, its shell/PowerShell installers, checksums and
  attestations. Decided: dist's installers replace `install/install.sh`/`.cmd` (drop them); the version is bumped in
  `Cargo.toml` before tagging, so `FLEXCOMPOSE_VERSION` stamping goes; release notes stay git-cliff. Keep the
  fmt/clippy/test/deny checks. A plain `x86_64-unknown-linux-musl` build works without musl-gcc (checked
  2026-11-03: static-pie, 2.2 MB). Update design §8, README install and `release-*` docs to match. Makes the
  `install.cmd`/SmartScreen item below moot.
- Test the Windows zip's `install.cmd` from a release (the Linux `install.sh` from `v1.1.0` works); also whether a
  double-clicked `.cmd` from a downloaded zip gets a SmartScreen prompt.
- The template folders should not be included in the flexcompose changelog, as they do not affect the CLI functionality.

## Gaps that can cost work (§12 known gaps)

- **Shared `./workspaces`, unwarned**: two outputs in one folder (another `--output`) for two `devbox:host` projects
  share it. Warn as `sharedHostFolderWarning` does for one output.
- **Run as `cboost-user`, follow-ups** (fragments and docs committed):
  - Windows (Docker Desktop) not tested: does the hook's `chown` succeed on a Windows bind mount?
- test that all workflows don't overwrite existing workspace volumes

## Gaps that fail at `up` (§12 known gaps)

- **Duplicate template mount** stays twice in the output; Docker refuses it. Dedupe or reject at generate.
- **`devbox:host` + a service mounting `source_workspace`**: nobody declares the volume. Reject at generate.

## Adoption

- **polymx migration** (§11): `nl-polymx-robot` boxes, planned recreate, keep service name `yaskawa`.
- **`enable_gpu` inside WSL** (§12): WSL has `/dev/dxg`, not `/dev/dri`; needs a WSL variant.

## Roadmap (§11)

- **`check` command**: read-only; would `regenerate` change the output (recreate the box)? Where is the workspace?
- **`enable_bootstrap`**: Compose `post_start` runs `bootstrap.sh`, so a plain `up` restores installs. Can't clone
  private repos (no SSH agent outside VS Code), so not for the integration repo's `src/bootstrap.sh` (0b).

## Later / when needed (§12)

- **Reorder the README for readability** (asked 2026-10-22). Today: Install, Quickstart, CLI reference, Template
  format, Targets and features, Releases (~110 lines), Keeping your work safe, Examples, Development, Moving a running
  box. Starting points: the user section *Moving a running box* comes after the contributor section *Development*;
  *Keeping your work safe* (dev boxes) sits after the long *Releases*; the history line now ends *Development*.
  Keep the template READMEs' copies of the diagrams in step.
- **Other images**: workspace path is fixed at `/home/cboost-user/workspaces`; make it per image when needed.
- **Wording**: starter `devcontainer.json` (and README targets table) say "Docker data reset"; the tool says
  "Docker Desktop reset". Pick one.

# TODO

Most important first. `§n` = FLEXCOMPOSE_DESIGN.md section.

## Next: PolyMX on the new starters

**`tmp/machine-starter-imports/PLAN.md` step 6** (other repos, on `feat/flexcompose-integration`, never on
`main`): the app as a service repo (its temporary pip step in its `Dockerfile` and `bootstrap.sh`; settle its
`dependencies.repos`, two branches it names no longer exist), inference as an as-image service around
`Dockerfile.serve`, `nl-polymx-automated-qc` as the integration repo; `./lock.sh`, a test release, a run on the
machine; the dev box in VS Code on Linux, then Windows. That also tests `ssh: [default]` in an as-image `build:`
with private repos.

- Done 2026-11-11/12, steps 1-5: base image `cboost-ros2-jazzy:0.3.0` (`nl-cboost-docker-ros2` 5d36715: `cdr`
  pinned by commit `ROS_TOOLS_REF`, `~/.colcon` the user's); FlexCompose imports (de2c8e5); `templates/service/`
  (49a4d2d); `templates/integration/` imports its services and releases from a lock (8ad532a, `feat!`; e2e 47
  checks). Notes: round 8 in `machine-starter-template.md`, the *Decision* drafts of `machine-repo-layout.md` and
  `machine-release-programs.md` (F2 deferred), the vault's `CLAUDE.md` (Rust); confirmed by the user, L2 kept over L6, `tmp/machine-starter-services/`
  deleted (2026-11-12).
- **Service starter: the source check fails on message packages** (found 2026-11-16 in the PolyMX app; the user
  fixed it in the app only for now). rosidl installs code generated from `.msg`/`.srv`/`.action` into `/opt/app`:
  the C glue of the Python bindings (`site-packages/<pkg>/{msg,srv,action}/_*_s.c`, `_*_s.ep.rosidl_typesupport_*.c`)
  and Rust bindings (`share/<pkg>/rust/`, confirming design §12's Rust gap). The app's Dockerfile removes them in
  stage build; the starter needs the same, a `fix:` with an e2e fixture that has a message package.
- PolyMX app, temporary (step 6): rosdep skips `python3-yaskawa-hse-driver` (the `hse` library, not on PyPI; since
  2026-11-18 `Cboostbv/nl-cboost-yaskawa-hse` is in `dependencies.repos` and installed by pip like the other three)
  and `ament_python` (`nl-cboost-machine-state-manager` lists it as a dependency;
  it belongs in `<build_type>`); the middleware (patched Fast DDS, rclpy backport) is not staged in the image.
  Inference runs inside the app for now (user, 2026-11-12).
- **`nl-polymx-aqc-ai` (the AI node, built by colcon-uv) in the app** (asked 2026-11-16, nothing built or changed).
  Windows users use the cboost dev box, so no native Windows build is needed (user, 2026-11-16): plain colcon-uv
  0.5.2 from PyPI can replace the repo's patched copy in `tools/colcon-uv` (the patch is Windows paths plus a
  dependency-order fix that the app doesn't need). Read from source, not run:
  - Dev box: `uv` 0.13.8 and `colcon-uv` 0.5.2 are in the base image's Dockerfile (2026-11-16, built and tried
    locally with a toy package; no image released yet). Its three private git dependencies are HTTPS URLs in
    `pyproject.toml`, while the boxes have only the SSH agent.
  - Release image, three blockers: those git dependencies can't be fetched in stage build; colcon-uv installs the
    package editable, so the venv points at source the release stage doesn't copy; the source check fails on the
    `.h`/`.c` files of the wheels in the venv.
  - Open: its pins (cbt2, inference, ethercat-client `9194de7` vs the app's `c966d7e`) are outside `cdr` and the
    lock; Vimba X in the image, and the camera from a dev box on a Windows host, not checked.
  - colcon-uv suits nodes, not the app's three pip libraries (each package gets its own venv, nothing can import it).
- The ros-tools pin is a commit; a tag in `nl-cboost-ros-tools` (e.g. `v0.1.0`) could replace it in one `ARG` line.

## Release targets: open points

Release targets and both starters are done (design §13). The prototype's documents are in git history: `git show
88758e0:prototypes/release/<file>` (`release-target.md`: constraints, questions and decisions, C/A/P/D/Q codes;
`release-options.md`: the four layouts compared; `concept-1/`: the polymx reference). The machine starter's history:
`machine-starter-template.md` and `tmp/machine-starter/` (the plan of 2026-11-02, replaced).

- **Parked (user, 2026-11-10): Windows speed and `devbox:volume`**, until the dev box and release process works as
  a whole. Decided: recommend keeping the checkout in the WSL filesystem with `devbox:host-src` (untested; which
  GUI/GPU fragments fit a box started from WSL is unknown); for Docker Desktop users who want `devbox:volume`, seed
  the box's empty `src/` from a read-only mount of the host checkout. An inline `post_start` hook for that was tried
  (it worked in a spike) and reverted: the user prefers the repo's `bootstrap.sh` to do the clone, with FlexCompose
  adding only the mount. Since 2026-11-12 the starters offer `devbox:volume` with a manual clone into the empty
  `src/`; the seeding stays parked.
- **Slow first build of a new dev box** (asked 2026-11-16; `research:design` offered, user: later). Slow per the
  user: both rosdep/apt and compiling the repos of `dependencies.repos`; both `devbox:host-src` and `devbox:volume`
  are in use; idea: a PC that builds nightly. Not measured, and no requirement covers it yet (REQUIREMENTS.md
  first). Options looked at:
  1. *Prebuilt underlay* (fits both answers best): a nightly image per service with the rosdep installs and the
     dependencies built in; the box builds only its own repo, `deps/` is cloned only to edit one. Open: the image
     must match the pins; `image:` is also the release's `BASE_IMAGE` (set it explicitly in the release override).
     Also open (2026-11-16): a moving `:nightly` tag or dated tags; a machine's `override: true` pin differs from
     the service's image; editing one dependency shadows it under prebuilt packages built against the old one;
     `bootstrap.sh` must source the underlay before rosdep; the nightly PC's SSH key; registry clean-up.
  2. *Shared compiler cache* (ccache/sccache, remote storage on the NAS): works for both types and existing boxes,
     C/C++ compiling only, not apt. Neither tool is in base 0.3.0.
  3. *Seeded volume* (an image with a built `~/workspaces` fills a new, empty volume): `devbox:volume` only. With
     `devbox:host-src` the host checkout's file times make make/ninja rebuild everything, or skip changed files.
- **Deferred from the plan**: `generate --image <service>` (a per-developer choice between source and image);
  FlexCompose passing `build:` on as written (F2); a warning when an importing template has a workspace service of
  its own; keeping copied starter files in sync (a template tool, with the second machine).
- **Loosen the SSH agent requirement** (asked 2026-11-16; parked by the user until after step 6). The user's
  reasons: CI or headless builds, Windows developers, HTTPS or token access, and fewer hard requirements in general.
  Findings: the agent is demanded where it isn't used. `release.sh`'s `SSH_AUTH_SOCK` guard: the only clone is
  `vcs import` on the host, any git credential works, and the guard would refuse the Windows OpenSSH agent pipe
  (N14: `SSH_AUTH_SOCK` unset). The `release:build` fragment's `ssh: [default]`: with the starters the locked tree
  replaces stage `resolve`, so no build clones (the e2e runs with an empty agent); PolyMX's old layout still needs
  it until step 6. The one real use is the service Dockerfile's `RUN --mount=type=ssh cdr` (built alone, or as an
  image in a dev box). `git@github.com:` URLs in `dependencies.repos` fix the protocol, not the agent. Options, not
  decided:
  1. Drop the guard and the injected `ssh:` (a service that clones in its build writes `ssh:` itself; part of F2
     above); reword `fact-ssh-access` to "git on the developer's PC can read the private repos". Breaking output.
  2. Resolve on the host for the standalone build too (`--build-context workspace=...`): no credentials in any
     build; weakens `service-alone`, needs `cdr` on the host.
  3. Document `docker build --ssh default=<key file>`: no agent, only keys without a passphrase.
  4. Document `git config url."https://github.com/".insteadOf "git@github.com:"` for HTTPS or token users (host
     clones and the dev box; untested whether Dev Containers forwards the credential helper).
  5. A token secret mount next to the SSH mount in the service Dockerfile, when CI needs the in-build clone.
  Suggested: 1 first, then `research:design` for 2-5 with CI as the deciding case.
- **Machines may pull** (REQUIREMENTS.md `release-offline`, `release-registry-pull`): the release file sets
  `pull_policy: never`, which fits today: pulling from an online registry is a Won't. Waits for a request for an
  online update process; then update §13, the `release` target and the README. Until then only §13's wording is
  too strict: it says the machine *has* no registry access, where `release-offline` says it *can* run without one.
- **Bundle without the base layers** (asked 2026-11-16, no decision): `docker load` skips layers the machine has,
  so `release.sh` can drop the base image's blobs from `images.tar` and ship the base once. Tried by hand on Docker
  29.9.3 with the classic image store (btrfs); not tried on the containerd image store or with the base missing.
  Open: the machines' image store, how a new machine or a base bump gets the base, an e2e test to guard it.
- **Polymx Python dependencies**: proposal in `python-dependencies.md` (pip convention now, a private
  package index later). Waits for the colleague reorganising the branches and dependencies. The plan's step 6
  puts a temporary pip step in the app's own `Dockerfile` and `bootstrap.sh` until they are ROS packages (user,
  2026-10-29; the app's repo since 2026-11-10).
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

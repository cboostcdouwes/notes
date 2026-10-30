# Machine starter template and its workflow with cdr: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| W1 | Opening a dev box never discards, moves or blocks on a developer's work in progress | Lost work; branch changes; a window that won't open with WIP | inferred | W1a (loss), W1b (branch moves, refused open) (round 1, bias check) |
| W3 | A dependency a teammate adds reaches a developer's box without them knowing a command | colcon fails on a missing package | inferred | W3b (round 1: "no command" was the mechanism) |
| W4 | A release tag rebuilds the same images later | audit, bug report | `release-traceable`, PC-06 | W4b (round 1: same source commits; images also depend on apt, rosdep, base tag) |
| W6 | Two customers' releases of one base version get distinct tags and image tags | global git tags; overwritten images | parent gap | W6b (round 1: named the mechanism) |
| W7 | The release host needs as few tools as possible beyond today's | setup per release machine; Windows | inferred | W7b (round 1: the need is any PC can release after short setup) |

## Dropped requirements
| # | Requirement | Why it isn't one (user's reason) | Source | Round |
|---|---|---|---|---|
| W10 | Identical images are stored once on the build PC and the registry | Not needed (user, round 4) | user, round 2 answers | 4 |
| W12 | A customer whose configuration is baked into the image never gets another customer's image | Customer configuration "could always be runtime" (mounted or in the Compose file), so images never hold it | user, round 2 answers ("sometimes baked in"), withdrawn | 3 |

## Round 1 (2026-10-29)
Started from the user's request after the workflow walkthrough (chat, 2026-10-29, rated 4): "work out the full draft
for the new template with its workflow using cdr". The walkthrough had four open points: cdr on WIP and feature
branches, where re-locking happens, the customer tag format, how the app's ref reaches the release build.

Read `cdr`'s code (`cli.py`, `resolver.py`, `vcs.py`). Spikes in the session scratchpad:
- `cdr-spike`: local bare-ish repos dep ← app ← machine. First resolve clones both; a rerun with clean checkouts
  passes; a committed `feature/x` in the app is switched back to `main` (rc 0, no warning); an untracked file in dep
  refuses (rc 1); remotes moved away (offline) refuses (rc 1); `vcs export --exact-with-tags` gives hashes. vcstool
  fails on Python 3.14 (`pkg_resources`), vcs2l works. Then `lock.sh` from the draft wrote a lock with the sha line;
  the `release.sh` check passed, and refused after `dependencies.repos` changed; `vcs import` of the lock into a
  temp folder gave the locked commits.
- `spike-ctxstage`: a Dockerfile with stages resolve → workspace (scratch) → build; standalone build used the
  stage; `docker compose build` with `additional_contexts: {workspace: ./locked}` used the folder instead.
- `spike-pullbuild`: `image:` + `pull_policy: build` without `build:`: `config` and `up --no-start` pass.

Drafted `tmp/machine-starter-draft/` (machine: template, override, `dependencies.repos` with the packml override,
`lock.repos` example, `bootstrap.sh`, `lock.sh`, `release.sh`, devcontainer; app: `Dockerfile`,
`dependencies.repos`). Found while drafting: the app's standalone `resolve` stage can't use `--strict` with branch
pins (M5 could); release.sh's tag regex already accepts `v1.3.0-acme`.

Searches: Docker named contexts overriding a stage (Docker docs and blog confirm, a third-party guide too);
west `update` / `--keep-descendants` (Zephyr docs: explicit sync, branches left alone); `repo sync` with local
branches and manifest locks (nothing specific found; Android docs only general).

Checks (round 1): rejection check: S2's W1 ✓ overstated (a missing top-level repo runs the full cdr), S3's runner-up
place contradicted the scoring, M12/M14 stretched to release steps (now tie-breaks), several cells fixed, variants
L3b, T4b, T2b, S8. Bias check: W1 split (loss vs surprise), W3/W4/W6/W7 reworded, options S7, S8, L6, R2c, T5;
`--strict` in the standalone resolve breaks M5 (draft fixed); unverified: a failing postAttachCommand leaves the
container usable. Ranking: S2 → S2b (no tool change) or S3/S7 (cdr change); L6 runner-up to L2; R2c variant; T4b
runner-up to T1.
Stress test of S2b (draft `bootstrap.sh`, rosdep lines stripped for the spike): first open cloned app and dep; with
app on a committed `feature/x` and an untracked file in dep, a teammate's new top-level `tool` was cloned on the next
open, app stayed on `feature/x`, nothing refused.

## Round 2 (2026-10-29)
Answers to round 1: a cdr change is acceptable, propose it; W1b "should not happen" (should); W3b "if it can be solved
with a cdr change that would be nice, but a hint is fine" (should); no remarks. Follow-up: refuse a stale lock,
separate steps (L2); customer tag `v1.3.0+acme` (T4b); release PC tools: don't know yet (W7b assumption); no remarks.

Draft changes: `release.sh` accepts `v1.3.0+acme` (and `-rc1` pre-releases), image tag with `+` → `-` (tested on
four tags: `acme/v1.3.0` refused); `bootstrap.sh` prints `bootstrap.sh --update` when rosdep can't locate a package
(spike `spike-rosdep` in the base image: `ERROR[a]: Cannot locate rosdep definition for [nl_missing_pkg]`, rc 2);
`cdr-proposal.md` written for the colleague (`--missing-only` with warnings on fetch failure, tracked changes only).

Searches: no web search this round.

Checks (round 2): see the log's *Round-2 checks*. Draft changes from them: `lock.sh` exports hashes (`--exact`);
`release.sh` maps `+` to `_` (tested: `v1.3.0+acme` → `1.3.0_acme`, `v1.3.0-acme` → `1.3.0-acme`,
`v1.3.0-rc1+acme` → `1.3.0-rc1_acme`); `bootstrap.sh` fails on a folder without `.git` and installs what resolves
before the hint; inference by full hash; the override names the sibling's step 1 as a precondition; `cdr --lock`
added to the proposal.

Answers to round 2: W5 scope: the user asked how the guard works and whether it blocks rebuilding an old release
(answered in chat: release.sh never resolves; the tagged commit's own dependencies.repos and lock match, so an old
tag rebuilds from its lock; only a commit with a changed dependencies.repos and no re-lock is refused). CI: not now
(L5 won't, until CI seems useful). Image tag `1.3.0_acme`: fine. Remark: "Could images have their own tags based on
the service repo, so that customers would share images easily?": asked what sharing is for (round 3 topic).

## Round 3 (2026-10-29)
Answers (follow-up after the guard explanation): W5 transitive: "nice if cdr --lock comes"; sharing images should
achieve build once, registry/disk space, traceability (not "test once"); customer configuration is "sometimes baked
in". Remarks: "Why would vcstool not resolve all commits? Does cdr resolve checkouts into a tree structure?"
(answered in chat: vcs import reads one flat file and never a checkout's own dependencies.repos; cdr recurses; the
checkouts are flat, `src/<key>`, nested keys refused, `_nested` in resolver.py).

Spike `spike-share`: busybox build with an ARG under tags 1.3.0 and 1.3.0_acme → one image ID; another ARG → another
ID; `--no-cache` with the same inputs → a new ID; the OCI version label reads back. Draft: `release.sh` names the app
image `<app describe>-<sha256(lock body + BASE_IMAGE)[:12]>`, reuses it when present locally, and adds the release
tag. First draft hashed `docker compose config app`, which holds the release version in `image:` (so never equal):
replaced by lock body + base. Test: two locks with different first lines and the same commits hash equal.

Searches: no web search (docker behaviour spiked).

Checks (round 3): see the log's *Round-3 checks*. Spike `spike-cachekey`: two fresh `vcs import`s of the same lock
into different temp folders, built with the checkout as the `workspace` context: with `.git`, two image IDs; with
`.git` removed (and new mtimes), one image ID. A `sed` extraction of the rendered build section was fragile (ran past
`build:`). Draft: `release.sh` sets APP_VERSION and LOCK_SHA256, removes `.git`, always builds (cache hits reuse);
the override labels the image with both. I3b's hash code removed from the draft; I7 leads, I3b runner-up.

Answers to round 3: build once "nice, not important" (W9 could; I7b not needed); version name: "explain the
difference" (explained in chat on one example: three releases, two images; names, inspect vs name, the re-pushed
base tag case); baked configuration: "could always be runtime" (W12 dropped); no remarks.

## Round 4 (2026-10-29)
Question from the user instead of an answer: "Would it be possible to read the git tag for a service and use that
as the image version, or use information from the service's build dockerfile or something similar?" Answered in
chat: the app's tag is already read (`git describe`, APP_VERSION label) but is no safe name (the image also holds the
locked dependencies; M8 overrides would share one name: I8); package.xml versions are per package; services with
their own recipe (inference) can be named by their git tag (I9), at the cost of a movable tag.
Answers (round 4): app image: label only (I7); inference: git tag for both (I9); no remarks. Proposed in chat:
protect `v*` tags in service repos so a moved tag can't change a rebuild (W4b). Draft: inference
`polymx-serve:1.4.0` from `#v1.4.0`.

Checks (round 4): rejection check: I8 vs I3's own record, I9's unrecorded W6b exposure, tag protection stated as
fact in the draft, I3b's verdict on shared costs, I7's W11b stretched (lock hash only), stale W12 uses, W10/W11b
states, S6's three accounts, R1's M5, Harms heading, S8 not in the matrix: all fixed. Bias check (weighed):
`pull_policy: build` rebuilt inference on every open (W2) → removed (spike `spike-pullmissing`: the default policy
tries a pull, builds when missing, then reuses with no network); cdr not in the base image (a precondition, listed);
S2b left a customer box on main's versions silently → top-level off-pin warning in `bootstrap.sh`; lock conflicts on
merges → instruction in `lock.sh`; describe label unstable → revision label added; GitHub tag protection may need a
paid plan → I9b; customer guard T6. Not adopted: the base literal in three places (A-5/F2 decided the explicit
`BASE_IMAGE`, sibling step 1 removes FlexCompose's injection).

Answers (round 4, last): tag protection: "moved tags won't happen" (I9 by convention, known gap); customer guard:
"distinct names enough" (T6 not adopted); W2 should; W1a must; W11b could; W10 not needed (dropped); remark: "W6b is
not really a requirement; mark it as won't" (T3, T4 re-cited on facts; I3 on the user's choice). No new requirement,
no ranking change: research stops; Decision next.

## Review round (2026-10-29)
The user removed the image labels ("remove the entire tag system, to prevent runaway complexity"), asked whether
the uncommitted-changes guard could cover all dependencies so RELEASE_SRC can go (R4), then whether checks could
block without recovery (R4b): both explained as more complex. Then: "What if the check is moved to a cdr option?
I'm worried about a person doing a release thinking that the release will be built from the working tree (warning
messages would not help against an unattentive user)" → W13 (should, verified). Options G-A (cdr --verify) and G-B
(clean worktree); the user picked G-A over the recommended G-B; reason asked.
Reasons for G-A (user): reusable in cdr, fewer machine scripts, release from the dev folder, name what differs.
Draft: release.sh calls `cdr --verify lock.repos --src .`; proposal item 4; README: release after --update and lock.sh, old tags via a worktree.

## Review round 2 (2026-10-29)
`cdr --verify` accepted by the colleague. The user asked: "Would the --missing-only feature be unnecessary if the
checkout step is moved out of the bootstrap?" Yes: S9 (clone only into an empty workspace, else a hint; `--update`
explicit) meets W1a, W1b, W2, W3b and keeps M12; S9b (no automatic first clone) costs a command. Proposed dropping
the off-pin warning too.
Answers: "Never clone on open" (S9b, over the recommended S9); drop the off-pin warning; no remarks. Draft: bootstrap.sh rewritten (rosdep + missing hint, --update the sync); README rows; proposal item 1 withdrawn, item 4 accepted.
Reasons for S9b (user): one simple rule, an explicit first step, "the clone feels unpredictable" → W15.

## Review round 3 (2026-10-29)
The user asked how much of bootstrap.sh could go with the automatic clone removed; applied: ~15 lines (one-line
"nothing checked out" test, rosdep hint on install failure; lost: naming a teammate's new top-level repo, the
empty-folder message). Then "check the rest of the draft for similar changes": fixed stale text (flexcompose.yaml
said bootstrap clones; README's teammate row), trimmed the comments of lock.sh (merge advice lives in the README)
and release.sh. Kept: release.sh's guards (uncommitted, tag, lock line, cdr --verify, SSH agent: each a refusal
with a reason). Asked: the devbox:host/devbox:volume targets (no machine repo in the box, so no bootstrap and no
clones) and the app Dockerfile's standalone resolve stage (M5, could).

## Review round 4 (2026-10-29)
Answers: keep all three dev box targets, with a README note for host/volume (added); drop the standalone stage
(done; spike `spike-failstage`: alone the build fails with the message, with a `workspace` context it builds).
Remark: "With the dockerfile in the repo, the app repo now both tries to build its own package and build the app
service as a whole; could these concerns be separated by moving the build instructions into the top-level repo?"
Read nl-polymx-automated-qc-application (29d3dc7): docs/BUILD_AND_RUN.md (four pip dependencies outside
dependencies.repos: orchestrator, hse, polymx_datastore, ethercat_client via requirements-ethercat.txt; the optional
machine_journal), docs/fastdds-shm-deployment.md (patched Fast DDS and rclpy staged from middleware/, "keep the
middleware patch and regression tests with the release build recipe"). Options D1-D4 sketched; asked to reopen A-2.

## Review round 5 (2026-10-29): axis D
Answers: reopen A-2 as a round (yes); where a service's own steps live: "depends on the step"; remark: the Python
dependencies may be wrapped by ROS nodes later; is -application built by colcon? (yes: source/polymx_qc_app
ament_python, source/polymx_qc_msgs ament_cmake; `colcon build --packages-up-to polymx_qc_app`). W16, W17 added;
options D1, D2, D3, D4, D7.
Discovery (one generator, own field blind): eight options (packages for the generic build, colcon.pkg/colcon.meta,
a hook contract, ONBUILD builder, Bake/Earthly imports, bloom, Nix, Yocto) and fourteen titles; no concrete
Autoware/Nav2/MoveIt split found. Spike `spike-hook` (busybox): hook output under /opt/app reaches the release stage.
Spike: `colcon list` in cboost-ros2-jazzy:0.2.0 (colcon-core 0.21.3) finds nothing in nl-cboost-orchestrator
(pyproject.toml + hatchling only). Draft `tmp/machine-starter-draft-d4/`.
Checks (round 5) in the log's axis D section. The user added D10 (the app repo defines its service and dev box,
the machine imports it). W18 recorded from the user's complexity condition. D11-D13 from the bias check.
Answers (round 5): middleware: "temporary, ignore"; D10's goal: one place per service, just exploring; Python
packages: "wait for ROS wrapping"; no remarks. D2g leads; draft: machine/image/Dockerfile (generic), override
`context: image`, app/Dockerfile removed.
Checks (round 5b): see the log's *Round-5b checks*. Options DB and D2s added.
Answers (round 5b): recipe in the machine repo (D2g); PolyMX releases before the wrapping, with a stopgap in its machine copy; template sync later; no remarks.

## Review round 6 (2026-10-29)
The user asked why the lock carries the fingerprint (timeline in chat), whether cdr --verify covers it (no: it
compares checkouts with the lock, not the lock with dependencies.repos), why RELEASE_SRC stays (four cases), and
whether --verify works with devbox:volume (no: it sees only checkouts next to release.sh). The user: "This probably
isn't worth it, drop the entire verify check." W13 → won't; G-A dropped; proposal item 4 withdrawn; README updated.

The user asked for the entire plan and template in full: written to tmp/machine-starter/ (integration/ with every file complete, generic names; PLAN.md). Checked: scripts parse (bash -n), YAML loads, today's flexcompose generates devbox:host-src and release, the README's Mermaid renders.
Then: the complete PolyMX integration repo in tmp/machine-starter/polymx/ (from nl-polymx-automated-qc feat/flexcompose-integration 055c731): app + inference by tag, packml and two temporary branch overrides, the four Python libraries as temporary repos in dependencies.repos installed with pip (bootstrap editable; image wheels), lock.repos placeholder. Checked: bash -n, generate devbox/release/release:build, config --images, Mermaid.

Paused by the user (2026-10-29): "This will be resumed later, save all other progress in the plan." Resume notes in tmp/machine-starter/PLAN.md.

# Programs with their own build recipe in a machine's integration: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| N15 | A program's build recipe lives in the program's own repo; the integration repo only says which program, at which version | not stated | user, round 2 | N15b (round 5): the need is that the owners define the build |
| N20 | The integration repo can build a program from the program's own recipe, at a pinned version | inferred: no release process of its own | user, round 4 | N20b (round 8): reproducible from pinned sources; registry images can change |
| N23 | The release may build on another base image than the one the dev box runs | devbox/runtime split | user, round 6 | N23b (round 6): only the shipped stage; the build stage keeps the dev box's base (TODO plan, both checks) |
| N18 | The source-protection rule holds for repo-owned recipes too | `no-compiled-source` | inferred, round 4 | N18b (round 5): the program's team guarantees it |

## Dropped requirements
| # | Requirement | Why it isn't one (user's reason) | Source | Round |
|---|---|---|---|---|

## Round 1 (2026-10-26)
Dropped by the user: its framing (several programs with conflicting dependencies, versioning and update per program)
missed the core problem. Its options, matrix and findings were removed from the log on purpose; don't reuse them.

## Round 2 (2026-10-26)
The user rejected round 1's questions: the framing missed the core problem. New problem statement in
`integration-problem.md`: services each with their own dependencies and their own way of building the image; the
integration repo can't build `nl-polymx-ai-training` and include it in the Compose workflow.
Answers: on the machine only `nl-polymx-ai-suite-inference` (ONNX); the training repo is developed in its own
container; recipes belong to the program's own repo (contradicts verified `integration-repo`).
Spikes: dev box builds a repo-owned recipe from the local checkout (works); Compose/BuildKit build a private repo
pinned by commit over the SSH agent (works); `release:build` forces `target: release` (breaks: no such stage) and a
meaningless `BASE_IMAGE`.
Searches: Compose build spec (git contexts `#ref:subdir`); Compose include reference (paths per included file);
"docker compose polyrepo umbrella repository build services from other git repositories" (Docker blog: include from
other git repos, experimental `COMPOSE_EXPERIMENTAL_GIT_REMOTE` then); "docker compose include remote git
repository" (status of the flag unclear in current docs); "devcontainer multiple configurations one repository"
(GitHub docs: `.devcontainer/<name>/devcontainer.json`, no inheritance between them).

## Dropped requirements (round 3)
N16 (dev-only containers never reach the release): the training repo was added by mistake (user, round 3).

## Round 3 (2026-10-26)
Answers: training repo out; inference runs in the dev box as a released image; no preference on who states its
service definition. Draft `draft-inference/`: an `image:`-only service passes all targets unchanged; `release.sh`'s
`docker save` fails on an unpulled image; `pull --ignore-buildable` fixes it. No web search this round.

## Round 4 (2026-10-26)
Answers: build programs from their own recipe in the integration repo if possible; NAS push optional; sometimes
needed; no preference on pinning. Spikes: `spike-pullbuild/` (image + build: pull, else build; confirmed by the
Compose build spec "Using build and image"), `spike-unusedarg/` (unused `BASE_IMAGE` arg: no warning),
`spike-cleartarget/` (override `target: ""` passes FlexCompose and builds a bare-FROM recipe).
Checks: rejection check: F4's ✓ N11/N18 contradicted its own costs; F1's rde ✗ stretched; F2b variant missing; F6
combines with F4. Bias check: N18 doesn't apply to the Python inference; N15 names a mechanism (need: the program's
owners define its build, the integration picks the version); only `target` blocks; F8 wrapper, F9 clear target,
F10 set target only when unset (equivalent to today: the override already wins). Ranking: F4 → F9 leading, F2b
runner-up.
Searches: docs.docker.com Compose services reference (`pull_policy`), Compose build spec ("Using build and image").
The round-4 report went out in chat; the user stopped the question call and paused the research ("will be resumed
later; make sure the research file is complete"). The log's *Status*, *Open questions* and *Drafts* hold what is
needed to resume.

## Round 5 (2026-10-27)
Resumed after the pause; nothing cited changed since round 4. Answers to the round-4 questions: the recipe stays in
the program's repo because its owners define the build (N15 → N15b, should, verified; N21 rewording of
`integration-repo` to propose); pushing program images to the NAS: later (N20w, won't); source protection for
program recipes: the program's team (N18 → N18b; F8 stays parked as a child decision). Remark: make the way builds
pass through FlexCompose simpler and rank options that do higher (N22, meaning and reason asked as a follow-up
before generating options for it).
Follow-up answer: N22 means FlexCompose passes `build:` as written; reasons: output hard to predict, per-program
exceptions, tool maintenance (all three).
Discovery: one generator (own-field lens: Compose, Bake, Dev Containers, BuildKit, Skaffold, Nix-style pinning):
`.env` variable (F2c), named contexts (F2e), dev box builds a base stage (F2d), check not inject (F5c), Bake (F6b),
`service:` context, lockfile, and one-line titles. Spikes: `spike-envbase/` (`.env` resolves `image:` and a bare
`args: [BASE_IMAGE]`; the runtime file needs no `BASE_IMAGE`), `spike-checkbase/` (`release.sh` can compare the dev
box image and the build arg with `docker compose config`).
Checks: rejection check: F5c meets N22 as worded; F2c carries a silent drift (shell precedence) → ~ rsd; F5d
variant (check in `release.sh`); F2d, F2e, F4 records stretched. Bias check: inference repo has no tags (verified);
run settings in its `docker-compose.yml` lost by hand-copying (verified); `.env` treated as personal (§7, verified);
options F10w, F11, F12, one version variable; anchors refused by FlexCompose (verified). Ranking: F2c → F5d, F2c
runner-up.
Searches (by the generator): Compose interpolation spec and Docker docs (precedence, `${VAR:?}`); Compose build
reference (`additional_contexts`, `docker-image://`, `service:`); Docker blog on multiple build contexts; Dockerfile
reference (ARG before FROM); Bake with Compose, dependent images; Dev Containers json reference (`build.target`);
Skaffold artifact dependencies.

## Round 6 (2026-10-27)
Answers to the round-5 questions: the dev box's and the release's base may differ ("having it in two places seems
fine"): N23, with the devbox/runtime split of TODO.md as the likely reason (to confirm). Run settings' owner: not
sure (known gap; F12 parked). Pin of a tagless repo: later (child decision). Ranking: F5d, F5c ✗ N23; F2 leading
(its rsd cost is a stated difference once N23 holds), F2c runner-up (~ N23, ~ rsd). No web search this round.
Checks: rejection check: one `BASE_IMAGE` feeds both stages of the starter Dockerfile, and the TODO plan keeps the
build stage on the dev box image (verified: TODO.md *Base image*), so N23 → N23b; F5d/F5c meet it, F2 ~ rsd; §7
says nothing about who owns `.env` (verified); spike folder gone with the wiped scratchpad (redone, passes, catches
a mismatch). Bias check (partly independent): N22 widened scope into the *Base image* sibling; F13 (TODO plan),
F14 (pull by digest), source regex over program images in `release.sh`; criterion 1's pull path untested. Ranking:
F5d leading, F5c runner-up.

## Round 7 (2026-10-27)
Answers to round 6: the build stage's base under the split is not decided yet (N23b assumption); N22 holds for the
app's build too, now, breaking change accepted (F13 out); N21: propose the `integration-repo` rewording at the
Decision step. User question: where each leading option names the final image (answered in chat: the same place in
all of them).
Answers: N19 should, N11 should (verified); N17 with the pin decision (child). No ranking change.

## Round 8 (2026-10-27)
Answers (follow-up of round 7): N15b could; N20's reason: builds reproducible, registry images can change (N20b,
should); N14: known gap for now; remark: the NAS may stop working, build without it (N24, could). Spike
`spike-pullbuild2/`: `pull_policy: build` on the program passes to the dev box and `release:build`; the machine's file
gets `pull_policy: never`. F15 (copy the recipe) added, trailing. No ranking change. No web search.
Checks: rejection check: F2c ties F5d once its `release.sh` guard is added; tie-breaks for F5c/F5d weighed one-sided;
F11 unscored; F14, F15 ✗ as worded; stale cells. Bias check: N20b can't mean byte-reproducible (inference recipe
unpinned: verified); N24 needs the NAS for the base on a fresh PC (spike `spike-nasdown`: a cached base builds);
F16 submodule; the F5d check's `sed` is fragile; N23b reason reworded. Ranking: three-way tie F5d, F5c, F2c.

## Round 9 (2026-10-27)
Answers: reproducible = same source commit (F14 stays out); `pull_policy: build` fetch per `up` acceptable; the tie:
the user asked for an overview of the choices' strengths and weaknesses (written in the log's *Evaluation*).

## Round 10 (2026-10-28)
Answers: the dev box image may grow heavy, and the build stage may then get its own, smaller base (N23c, could).
F2 added to the overview as the fourth choice, today's injection as a baseline column. The user picked F2
(simplest, room for the split). Checks: rejection check: F2c meets N23c with one repo line, its rsd cell stale
since round 8, so F2c leads alone; F5d's ✓ rsd lasts only while its check stays; F5d's `sed` claim stale (Compose
normalizes `args`); F2's record wording updated. Bias check: proposed splitting off the app's base (rests on open
question 2, answered in round 7: not adopted), F17 (`release.sh` builds programs: added, trailing), N20b's reason
also hits the recipe's own `FROM` (weighed: N20b means the same commit, round 9). No web search this round.
Ranking: F2c leading, F5d runner-up, F5c and F2 trailing. Pushback on F2 asked.
Pushback answer: no `.env` wanted (F2 over F2c); need and priority asked as a follow-up.
Round 10 end: the user asked what changes if the app's image is built from `-application`; answers: the dev box runs all release services at once, drivers one pattern, fewer repos, team ownership, reuse elsewhere; decision paused; exploration moved to `machine-repo-layout.md`.
Round 10 end: the user asked what changes if the app's image is built from `-application`; answers: the dev box runs all release services at once, drivers one pattern, fewer repos, team ownership, reuse elsewhere; decision paused; exploration moved to `machine-repo-layout.md`.

## Round 11 (2026-10-28)
Resumed as A-5 of `machine-repo-layout.md`: the child decided that recipes live in the services' repos (A-2),
`cdr` locks (A-1), customer branches (A-4), and added M13 (no copies; overrides fine) and M14 (FlexCompose simple).
F2d′: the base named once as the app Dockerfile's `ARG BASE_IMAGE` default, the dev box builds its `dev` stage from
the app's git context, FlexCompose's devbox rule "drop build: of a workspace service" goes. Leader F2d′, runner-up
F2c; F2 ~ M13; D (today's derivation) ✗ N22. No web search.
Checks (round 11): rejection: F2d′ needs a pinned app ref (recreate-announced), a breaking devbox change, plan step 1 for N22; its ~ N25 deeper than F2c's; D ~ M14. Bias: Dev Containers with a git context unverified (spike); ref-tagged dev image; N25 reword; F2's M13 reading.
Answers and spike (round 11): N25 reworded; F2's literals an allowed difference (M13); spike-dcgit: devcontainer up fails on a service whose build: is a git context (reads the Dockerfile as a local path): F2d′ out; F2 leading again.
A-5 decided by the user: F2.

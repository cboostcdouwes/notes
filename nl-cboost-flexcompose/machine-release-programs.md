# Programs with their own build recipe in a machine's integration

**Status (2026-10-28): round 11 (A-5 of `machine-repo-layout.md`): F2d′ out (spike: Dev Containers can't open a
service built from a git context); A-5 decided as F2 (user, 2026-10-28). Round 10: N23c (the build stage may later get its own base, could) and N25 (the dev box's
image readable where the service is defined, should) added. On scoring F5d leads, F2 runner-up; the user picked F2
knowing the trade-off (a forgotten base bump isn't caught). Draft decision F2, paused by the user until
`machine-repo-layout.md` settles where the app's recipe lives. Overview: `machine-release-programs.overview.md`.** Round-5 answers: the dev box and the release may build on different bases (N23,
reworded after the checks as N23b: only the shipped stage);
run settings' owner: not sure (known gap); the program's pin: later (child decision). Leader F5d (FlexCompose adds
nothing to `build:`; `release.sh` checks the build stage's base against the dev box's), runner-up F5c (round 9; superseded by round 10 above). Nothing is implemented; FlexCompose,
the starter and the program repos are unchanged. The user's own problem statement and the findings per round are
in `integration-problem.md`.

## Problem
A machine's integration must take in programs that bring their own build recipe (their own base, dependency tool
and build steps), next to the ROS packages it builds itself. Such a program runs in the dev box as an image, not
from a checkout, and a release ships it with the rest. The integration repo builds that image from the program's own
recipe at a pinned version ("if possible"); pushing it to the NAS is also an option. First real case: the PolyMX ONNX
inference service, `nl-polymx-ai-suite-inference`, with its own `Dockerfile.serve`.

## Related decisions
- The user's problem statement and findings: `integration-problem.md`.
- Parent: release targets, design §13 (decided 2026-10-19, option 4: one integration repo per machine).
- Sibling, open: `python-dependencies.md` (how Python libraries get installed).
- Sibling, open: base image split devbox/runtime (TODO.md, *Base image*).
- Open, pauses this decision: `machine-repo-layout.md` (its round 5, 2026-10-28: M13 "build configuration is not
  copied; overrides are fine" makes F2's base written twice a copy, while today's derivation of `BASE_IMAGE` meets
  it: reweigh F2 against F5c/F2c and the derivation when this decision resumes) (where each service's recipe, pins and dev box live; split
  off in round 10).
- Possible child decisions (not split yet): source protection for compiled programs with their own recipe (F8, when
  the Rust EtherCAT server joins); pushing program images to the NAS on release.

## Success criteria
Judged by the user:
1. The integration repo of polymx runs `nl-polymx-ai-suite-inference` (its own `Dockerfile.serve`) next to the ROS
   app: in the dev box (built at the pin; proposed in round 8 instead of "pulled from the NAS, else built", to confirm) and in the release bundle, which the offline
   machine runs.
2. No change to the inference repo is needed to integrate it.
3. A second program with its own recipe can be added the same way, by editing only the integration repo.
4. `tests/e2e.sh` (or its successor) covers a service built from another repo's own recipe.

## Requirements
Verified ones come from `REQUIREMENTS.md` (V1, 2026-10-26); new ones are unverified until asked.

| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| N11 | Few concepts to learn; one way of working for every machine | Small team, not Docker specialists; a machine-specific scheme is unmaintainable | inferred | should | yes (2026-10-27, round 7) |
| N15b | A program's owners define how it is built; the integration repo only picks which program, at which version | The program's team knows its build best (user, round 5) | user, round 5; replaces N15 | could | yes (2026-10-27, round 8) |
| N20b | A release is built from the programs' pinned source commits, not from images in a registry (same commit, not same bytes: user, round 9) | Images pulled from a registry can change under the same name; a rebuilt release would differ (user, round 8) | user, round 8; replaces N20 | should | yes (2026-10-27) |
| N24 | The dev box and the release can be built without the NAS | The NAS could stop working at some point (user, round 8) | user, round 8 remark ("it would be nice") | could | yes (2026-10-27) |
| N20w | The release publishes program images to the NAS so dev boxes pull the machine's bytes | Dev boxes build programs themselves meanwhile (slower; same recipe and pin) | user, round 5 ("later") | won't (brought back when dev box builds get slow or drift from the machine) | yes (2026-10-27) |
| N19 | The dev box runs such a program as an image (pulled, or built at the pin), not from a checkout, next to the code under development | The ROS app is developed against the inference service it will meet on the machine | user, rounds 3-4 | should | yes (2026-10-27, round 7) |
| N17 | A program's pin is written in one place for dev and release | Dev box and release build different commits unnoticed | inferred (finding: pin in `release.repos` and the build context) | should (assumed) | no: moved to the pin child decision (user, round 7) |
| N18b | The source-protection rule holds for repo-owned recipes too; the program's team guarantees it in its recipe | A program's own Dockerfile could ship compiled source (`no-compiled-source`) | user, round 5 ("program's team"); replaces N18 | must (follows from `no-compiled-source`) | yes (2026-10-27: who; F8 stays parked) |
| N21 | (pending) `integration-repo` reworded: package repos stay reusable across machines; a program's own build recipe may live in its repo | User's round-2 answer contradicts the verified wording "package repos hold only code" | user, round 2; REQUIREMENTS.md `integration-repo` (V1) | should | no: rewording to propose in REQUIREMENTS.md after asking (open question 1) |
| N22 | What the template and the override say about a build is what the build gets: FlexCompose adds nothing to it | The output is hard to predict from the files the author wrote; every program needs an exception line to undo what is added; tool rules cost tests and docs (all three: user, round 5) | user, round 5 (remark and follow-up) | should ("rank higher") | yes (2026-10-27) |
| N23b | The shipped image may use a slimmer runtime base than the dev box, while it is still compiled with the dev box's toolchain | Release images carry the dev box's tools (3.58 GB); a build stage on another base than the dev box risks ABI drift (TODO.md *Base image*, split discussed 2026-10-22: build stage keeps the dev box image, release stage gets `RELEASE_BASE_IMAGE`) | user, round 6 ("devbox and release base image may differ"); TODO.md; replaces N23 (both checks, round 6) | should (assumed) | no: the build-stage part comes from the TODO, to confirm |
| N23c | The build stage may later use another, smaller base than the dev box | The dev box image may grow heavy; the build stage doesn't need its tools (user, round 10) | user, round 10 (2026-10-28: "may be decided") | could | yes (2026-10-28) |
| N25 | A reader of a service's definition sees which image the dev box runs, without following a variable to another file | The value one file away hides what the dev box runs (user, round 10) | user, round 10 (pushback on F2c) | should | yes (2026-10-28) |
| N14 | A release build can run on a developer PC (Windows or Linux) and later in CI | Windows developers release too; CI later (polymx D13) | `release-target.md` D13, design §13 gap | should | no: known gap for now, tested when a Windows developer releases (user, round 8) |

Verified, from `REQUIREMENTS.md` (V1), that score options here: `no-compiled-source` (must),
`release-same-definition` (should), `release-differences-explicit` (should); `integration-repo` (should) is
contradicted by the user's answer (N21). Every option keeps `plain-compose` and `release-offline` (musts).

## Options
**Decision: how FlexCompose and the integration repo build a program from the program's own recipe, next to the
machine's own app.** Round 5 widened it with N22: FlexCompose injects nothing into `build:`. Shape common to all
options (spikes `draft-inference/`, `spike-pullbuild/`): the template's service has `image:` (NAS name, the
program's version as tag) and `build: {context: git@github.com:...#<version>, dockerfile: <its recipe>}`. Dev box:
builds it from the recipe at the pin, never pulling it: the service sets `pull_policy: build` (round 8, for N20b and
N24; FlexCompose passes it to the dev box and `release:build`, and the machine's file gets `pull_policy: never`:
spike `spike-pullbuild2/`). Release: `release:build` builds it, `release` ships it. `release.sh` needs `pull --ignore-buildable`
for image-only services. Today `release:build` adds `target: release`, `ssh: [default]` and `BASE_IMAGE` (the
template's `image:`) to every build (`release.go` `addBaseImage`, fragment `release-build/compose.yaml`).

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| F5d | FlexCompose injects nothing into `build:` (as F2c); the base image is written literally in the template's `image:` and in the override's `args: {BASE_IMAGE: ...}`; `release.sh` fails if they differ (two `docker compose config` calls, no jq: spike `spike-checkbase/`) (rejection check, round 5) | Output as written; no `.env`; no tool rule; drift fails the release loudly | Two places to edit on a base bump; ~4 lines of check in every integration repo's `release.sh` (copied from the starter); a dev box can run a bumped base before the next release notices; the check forbids the split (N23c) until it is dropped | costly later, cheap now (as F2c) | leading on scoring (~ N23c, could; round 10) |
| F2c | FlexCompose injects nothing into `build:` (the `release:build` fragment and `addBaseImage` go). The starter's override states its app's build in full: `target: release`, `ssh: [default]`, `args: [BASE_IMAGE]`. The base image is named once, in the integration repo's committed `.env` (`BASE_IMAGE=...`), read by the template's `image: ${BASE_IMAGE:?...}` and the build arg (spike `spike-envbase/`). Programs: their service as written, nothing to undo (generator 1, round 5) | Output is what the author wrote; one name for the base; no per-program line; tool gets smaller | `.env` is a new committed file next to developers' own variables; a shell-exported `BASE_IMAGE` silently wins over `.env` (Compose precedence); breaking output change for existing integration repos (starter, polymx: 3 override lines + `.env`) | costly later, cheap now (two integration repos, polymx unreleased) | trailing (~ N25, ~ N11: round 10 pushback) |
| F2e | As F2c, but the Dockerfile says `FROM base` and the override adds `additional_contexts: {base: docker-image://${BASE_IMAGE}}` (generator 2, round 5) | Same as F2c; Dockerfile has no ARG | One more Compose concept (named contexts); still the `.env` variable | as F2c | trailing (rsd ~; N11 ~ tie-break) |
| F2 | FlexCompose injects nothing into `build:` (the `release:build` fragment and `addBaseImage` go); the starter's override states the app's build in full, the release's base literally (`args: {BASE_IMAGE: cboost-...:0.2.0}`). Best variant: `release.sh` prints the base the release builds on next to the dev box's image (a notice, not a check) | Output as written; no `.env`, no tool rule, no per-program line | The build stage's base is written twice with nothing comparing them (a notice nobody reads); the split (N23b) still needs `RELEASE_BASE_IMAGE` and a Dockerfile change, as for every option; breaking output change | costly later, cheap now (as F2c) | trailing (rsd ~) |
| F5c | Check, don't inject: base named literally in the template and the override (or Dockerfile); FlexCompose injects nothing but fails `release:build` if the two names differ (generator 5, round 5) | Output as written; drift caught loudly | A FlexCompose rule to keep, test and document (tie-break: N22's maintenance reason, against F5d's copy per repo) | costly later, cheap now (output change) | trailing (~ N23c: a FlexCompose change, round 10) |
| F2d | Dev box builds a trivial base stage of the integration Dockerfile (`FROM cboost-...:0.2.0 AS base`, dev box `build: {target: base}`); the base is named only in the Dockerfile (generator 4, round 5) | One name, no `.env` | The dev box builds instead of running the base; FlexCompose's devbox rule "drop `build:` of workspace services" (`output.go:46`) must change; the integration repo must be checked out wherever the box starts | costly | trailing (tie-break costs only) |
| F6b | Bake (`docker-bake.hcl`, `variable "BASE_IMAGE"`, or `x-bake` in Compose) defines the release build; `release.sh` runs `docker buildx bake` (generator 6, round 5) | Variables and contexts native to the build | One more format (HCL) and concept; the release build leaves plain Compose | costly | trailing (N11) |
| F9 | The override clears the target for that service: `build: {target: ""}`; FlexCompose unchanged (spike `spike-cleartarget/`) | Works today: no tool change | Injection stays (output not as written); one undo line per program; odd idiom | cheap | trailing (N22) |
| F2b | FlexCompose drops only `target: release`; keeps `ssh` and `BASE_IMAGE` injection | One line out of a fragment | Injection stays for `ssh` and `BASE_IMAGE`; loses the missing-`release`-stage guard | cheap | trailing (N22) |
| F1 | FlexCompose skips `target`/`BASE_IMAGE` when the build context is a git URL | No new key | A hidden rule added | cheap | trailing (N22, N11) |
| F3 | A per-service template option (`own_recipe: true`) skips the injection | Explicit | A new template key and more tool rules | costly (template format) | trailing (N22, N11) |
| F4 | Program recipes name their shipped stage `release`; FlexCompose unchanged | No tool change | A FlexCompose convention in each program repo; injection stays | cheap | trailing (N22, N15b) |
| F6 | The override sets `build.target` to the program's own stage name | No naming convention | Repo still needs a named stage; injection stays | cheap | trailing (N22, N15b) |
| F8 | A wrapper stage in the integration repo runs the source check on a program's image | Source protection enforced by the integration | A Dockerfile per program | cheap | parked: the user put source protection on the program's team (N18b); combinable with F2c if that changes |
| F10w | Inject `target`/`ssh`/`BASE_IMAGE` only into `workspace: true` services (the app), never into programs (bias check, round 5) | No undo line; base named once; existing key | FlexCompose still adds to the app's build; one more rule | cheap | trailing (N22) |
| F13 | The TODO's own plan: keep the `BASE_IMAGE` (and `target`, `ssh`) injection only for the app (`workspace: true`), `RELEASE_BASE_IMAGE` explicit in the override, nothing injected into programs (bias check, round 6; F10w plus the split) | No breaking change; base named once; no undo line | FlexCompose still adds to the app's build (N22 as worded); one more rule | cheap | trailing (N22) |
| F14 | A program image built once (by hand or the integration repo), pushed, and pulled by digest (`image: polymx-serve@sha256:...`) (bias check, round 6) | One exact pin; nothing to build or undo | Needs the NAS push (N20w, won't for now); a digest is unreadable | cheap | trailing (N20w won't; brought back with it) |
| F15 | The integration repo keeps its own copy of the program's recipe (possible now that N15b is a could) | The integration controls the build fully | The copy drifts from the owners' recipe (their dependencies change); no gain over using their recipe as is | cheap | trailing (N15b, could; tie-break: duplication) |
| F16 | The program as a git submodule of the integration repo, built from the local path (`context: ./programs/inference`) (bias check, round 8) | One pin (the submodule SHA in the tagged commit); no SSH agent in BuildKit, no GitHub fetch on `up` (N14, N24) | Submodule handling (`--recurse-submodules`, the clone step inits it) | cheap | for the pin child decision: how the program's source arrives (git URL or submodule) |
| F17 | `release.sh` builds each program itself (`docker buildx build <git-url>#<sha> -f <recipe>`); the template's service keeps only `image:` (bias check, round 10) | FlexCompose untouched; programs never meet the injection | The dev box needs the same build from a second place; a build step per program in `release.sh` | cheap | trailing (~ N17, ~ N11) |
| F11 | Pin the program in `release.repos` (vcs) and build from the local checkout: one pin for ROS packages and programs (bias check, round 5) | One pin mechanism (N17) | The dev box needs the checkout before `up`; the build context is a path the vcs step must fill first | costly | trailing (N11 ~: a vcs step on the host before `up`); its pin question goes to the pin child decision |
| F12 | Compose `include:` of the program's own `docker-compose.yml` at the pin, so its owners define how it builds and runs (bias check, round 5) | Run settings stay with the owners (`stop_grace_period`, network) | FlexCompose doesn't handle `include:` (unverified); the program's file has `container_name`, its own network; remote includes are experimental | costly | parked: whether the owners define how it runs is unknown (user, round 6: "not sure") |
| F7 | Don't build here: the program's repo publishes to the NAS | Nothing to change | Needs a release process per program | costly | trailing (N20b, N24) |

Not worked out (generator 1, round 5, one line each): `service:` context pointing at the dev service (needs a
`build:` there, unverified); lockfile (`images.lock` with digests) feeding `.env`, a later variant of F2c; Skaffold
`requires`; Earthly/Dagger; `oci-layout://` context; a `docker tag` alias step; Compose `include` of a shared base
file; promote a registry tag instead of rebuilding; Bazel `rules_oci`.

Design-space map (where the base is named × who passes it to the build): tool injects (F1-F4, F6, F9, F2b);
author writes it, named once in `.env` (F2c, F2e); author writes it twice (F2), plus a tool check (F5c); named once
in the Dockerfile, dev box derived (F2d); another build tool (F6b). Empty cell "named once in the template, the
build reads it from there without the tool" has only the unverified `service:` context.

## Matrix
Round 6 (N23b added; corrected after the round-6 checks: N23b keeps the build stage on the dev box's base, so the
checks of F5d and F5c meet it, and F2's twice-written build-stage base is ~ rsd again). `rde` = `release-differences-explicit`, `rsd` = `release-same-definition`, `ncs` = `no-compiled-source`.
Round 8: the matrix note on N19 is outdated (N19 is should, verified, round 7); N24 is ~ for every option on a fresh PC
(the base image `cboost-c-nas:5100/...` must be pulled once; a cached base builds without the NAS: spike
`spike-nasdown`), so it doesn't separate them. N18b and ncs are ✓ for every option: the program's team guarantees source protection (user, round 5); the app's
Dockerfile keeps its own check. N19 has no priority yet (?).

| Option | N20b | N15b | N17 | N22 | N11 | N19 | rde | rsd | N23b | N24 | N23c | N25 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *priority, verified* | should, yes | could, yes | should, pin child | should, yes | should, yes | should, yes | should, yes | should, yes | should, no | could, yes | could, yes | should, yes | |
| F5d | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ N17 N23c |
| F2c | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ~ N17 N11 N25 |
| F2e | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ~ N17 N11 N25 |
| F2 | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ~ N17 rsd |
| F5c | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ N17 N23c |
| F2d | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ? | ~ N17 N23c (tie-break costs only) |
| F10w | ✓ | ✓ | ~ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ N22; ~ N17 |
| F13 | ✓ | ✓ | ~ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ N22; ~ N17 |
| F6b | ✓ | ✓ | ~ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ? | ? | ✗ N11; ~ N17 |
| F9 | ✓ | ✓ | ~ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ N22; ~ N17 |
| F2b | ✓ | ✓ | ~ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ N22; ~ N17 |
| F1 | ✓ | ✓ | ~ | ✗ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ? | ? | ✗ N22; ~ N17 N11 |
| F3 | ✓ | ✓ | ~ | ✗ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ? | ? | ✗ N22; ~ N17 N11 |
| F4 | ✓ | ✓ | ~ | ✗ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ? | ? | ✗ N22; ~ N17 N11 (and success criterion 2: a repo edit) |
| F6 | ✓ | ~ | ~ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ? | ? | ✗ N22; ~ N15b N17 |
| F7 | ✗ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✗ | ? | ? | ✗ N20b N24; ~ N11 rsd |
| F14 | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ? | ? | ✗ N20b N24 |
| F15 | ✓ | ✗ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ? | ? | ✗ N15b (could); ~ N17 |
| F17 | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ N17 N11 |

Corrected after the round-5 checks: F5c's N22 is ✓ (it adds nothing to the build; its rule is a check); F2c and
F2e are ~ rsd (a shell-exported `BASE_IMAGE` silently beats `.env`, with no trace in git);  F2d's N19 is ? (N19
is about programs and has no priority); F4 meets N15b (the owners name the stage). F11 and F12 not scored (not
worked out).

N17 is ~ for every option that builds here: the program's version is written twice inside one service (image tag
and git ref), side by side.

## Evaluation
**Round 11 (2026-10-28, resumed as A-5 of `machine-repo-layout.md`).** The child decided: A-2, a service's recipe
lives in its repo (the app's `Dockerfile` moves to the app repo); A-1, `cdr` locks; A-4, customer variants as
branches. Its M13 (should, verified: build configuration is not copied; overrides are fine) and M14 (should: FlexCompose
stays simple) now score this decision too. The question is only how the app's base image is named.

| Option | N22 | N25 | M13 | M14 | N23c | rsd | ✗ or ~ |
|---|---|---|---|---|---|---|---|
| *priority, verified* | should, yes | should, yes | should, yes | should, yes | could, yes | should, V1 | |
| F2d′ | ✓ | ✓ (N25 reworded) | ✓ | ✓ | ✓ | ✓ | not applicable: Dev Containers can't open it (spike `spike-dcgit`; `plain-compose`, must: VS Code Dev Containers depend on it) |
| F2 | ✓ | ✓ | ✓ (an allowed dev/release difference: user) | ✓ | ✓ | ~ | ~ rsd |
| F5d | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ N23c (could) |
| F5c | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ~ M14; ~ N23c |
| F2c | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ~ N25 (and the shell-precedence guard, N11) |
| D (today: FlexCompose derives `BASE_IMAGE` from the template's `image:`) | ✗ | ✓ | ✓ | ~ | ✓ | ✓ | ✗ N22; ~ M14 (two rules kept) |

- **F2d′** (F2d in A-2's frame): the app repo's `Dockerfile` names the base once, as the default of `ARG
  BASE_IMAGE`; its `dev` stage is that base and nothing more, `release` builds on it (`build` and `release` may get
  their own `ARG`s later: N23c). The machine template's app: `build: {context: <app repo>#<ref>, target: dev}`; the
  release override sets `target: release`, the context inherited (one ref). A customer branch that needs another
  base overrides `args: {BASE_IMAGE: ...}` (an override: M13). FlexCompose: the devbox rule "drop `build:` of a
  workspace service" (`output.go:46-56`) goes, so a workspace service's `build:` is used as written: a rule removed
  (M14 ✓, N22 ✓). ~ N25: the template shows the app's `dev` target, the base name is in the app's Dockerfile, one
  repo away. Costs no requirement covers: every dev box `up` builds the trivial `dev` stage from the app's git
  context (GitHub and the SSH agent, cached after the first: as `pull_policy: build` for programs, accepted round 9);
  the base bump is a commit in the app repo, owned by the app's team (fits A-2). Its earlier tie-break cost "the
  integration repo must be checked out wherever the box starts" is gone (a git context).
- **F2** ~ M13: the base as two literals (template `image:` and override `BASE_IMAGE`), a copy; ~ rsd: nothing
  compares them. **F5d** ~ M13 (still a copy, though checked), ~ N23c. **F5c** as F5d, plus ~ M14 (a FlexCompose
  rule). **F2c** ~ N25: `${BASE_IMAGE}` in the template, the value in `.env`.
- **D** ✗ N22 (should, verified, "rank higher"): FlexCompose adds `BASE_IMAGE` to the build.
- Leader F2d′, runner-up F2c (both one ~ on N25; F2c adds a committed `.env` and a shell-precedence guard, N11).
- **Round-11 checks.** Rejection check: F2d′ holds `recreate-announced` (must) only if the template pins the app's
  ref to a tag or commit (a branch ref would rebuild and recreate the box on an app commit, unannounced): a
  condition of F2d′; dropping the devbox rule changes existing templates' devbox output (their workspace `build:`
  starts building: announced with the FlexCompose upgrade, the volume survives, but a breaking devbox change; design
  §4 and §6 step 4 change; the `image:` check at `output.go:49-51` and the tag the built `dev` stage gets are open);
  N22 ✓ needs `release:build`'s injection removed too (`addBaseImage`, `target`, `ssh`: plan step 1), as F2c does;
  F2d′'s ~ N25 is deeper than F2c's (the base in another repo at a ref): F2d′ leads F2c on tie-breaks only (no
  `.env` and guard vs a build through GitHub on every `up`); a Dockerfile edit in a host checkout reaches the box only
  after a push; F2's ~ M13 needs its reason: the template's `image:` and the override's `BASE_IMAGE` are two keys for
  one fact that must be equal (not a deliberate dev/release difference): asked; D ~ M14. Bias check: Dev Containers
  with a git-URL `build:` context for the workspace service is unverified (the CLI adds a UID layer from the
  service's build context: it may not handle a remote one): a spike before F2d′ can lead; a ref-tagged `image:
  <app>-dev:<ref>` next to `build:` avoids silently running an old `dev` image and shows what the box runs;
  N25 reworded to its need ("a reader of the machine template can tell what the dev box runs") would score a
  ref-tagged dev image ✓; options: a literal `FROM` with a named-context override; the app repo's own Compose
  fragment (F12 for the app); a base security bump without an app version is a customer-branch override.

**Round 11, answers and spike.** The user: N25 reworded to its need ("a reader of the machine template can tell
what the dev box runs"); F2's two literals are an allowed dev/release difference under M13, not a copy. Spike
`spike-dcgit` (Linux, devcontainer CLI 0.89.0, a local git daemon): `docker compose build` from a git context works
and tags the image; `devcontainer up` on that service fails in every run (non-root `remoteUser`, and root with the
image pre-built and `updateRemoteUserUID: false`): `ENOENT: ... git:/127.0.0.1:9418/app.git#v1/Dockerfile`: the CLI
reads the Dockerfile from the build context as a local path whenever the service has `build:`. So F2d′ (a git-context
`build:` on the workspace service) can't be opened in VS Code Dev Containers: not applicable (`plain-compose`, must,
names Dev Containers as depending on it). Its local-checkout variant needs the app cloned on the host before the
first `up`, and `devbox:volume` has no host checkout (`own-host-environment`, must): out too. The devbox rule
"drop `build:` of a workspace service" stays (it is what lets Dev Containers open the box: the service runs `image:`).
**Leader F2** (the template's `image:` names the dev box's base; the release override passes `BASE_IMAGE`
literally; the app's Dockerfile `ARG BASE_IMAGE` default is overridden, so not a copy): ✓ N22, N25, M13, M14, N23c;
~ rsd (a forgotten bump of the two literals goes unnoticed, as accepted in round 10). Runner-up F5d (F2 plus a check
in `release.sh`, ~ N23c). The draft decision (F2) stands; this is the pick again, now with M13's reason recorded.
**A-5 decided (user, 2026-10-28): F2.**

**Round 10 (N23c added; rejection check):** F2c meets N23c as F2 does: when the build stage gets its own base, the
override names it (a literal or a second variable), one line in the repo, no tool or guard change. Its rsd cell was
stale since round 8 (✓ with the guard). So F2c leads alone; F5d is runner-up: ✓ rsd only while its check stays, and
the split (N23c) drops the check, which makes F5d into F2; F5c trails (~ N23c needs a FlexCompose change). F2 stays
~ rsd: N23c accepts a deliberate difference, not the forgotten bump of F2's scenario. F2e as F2c, plus ~ N11.
Then the pushback on the user's pick of F2 brought N25 (should, verified): `${BASE_IMAGE}` hides the value one file
away, and `.env` is one more concept (~ N11). F2c and F2e trail (~ N25, ~ N11). On scoring F5d leads (~ N23c, a
could); F2 is runner-up (~ rsd, a should: a forgotten bump isn't caught). F5c as F5d, with the split costing a
FlexCompose change. The user decided for F2 knowing this trade-off (*Decision*).

**Rejection records** (round 6, corrected after the checks; round 9 tie below, broken in round 10 as above):
- **F5d, F5c, F2c tie** on every requirement (round 8 rejection check: F2c's shell-precedence drift is no
  requirement as worded once its `release.sh` guard is added; F5d carries a like drift until the next release).
  Tie-breaks, both sides: F5d copies a check into every integration repo's `release.sh` (untested beyond the
  starter, drifts per repo, reads `sed` on `docker compose config` output, which normalizes every `args` form: spike
  `spike-argforms`); F5c keeps one rule in FlexCompose, tested once (against N22's reason "tool rules cost tests and docs");
  F2c needs a committed `.env` and its own guard in `release.sh`, and names the base once. The user picks (round 8).
- **F2** ~ rsd (should, verified): the build stage's base is written in the template and the override with nothing
  comparing them; the dev box's base is bumped, the override's isn't, and the release compiles with another
  toolchain than the dev box (compiled against other libraries than the dev box tested). Leader's cells: F2c is ✓
  rsd and ✓ N23c, so F2 gains nothing over it on requirements; tie-break for F2: no `.env`, no guard. A notice in `release.sh` doesn't stop that. F5d is F2
  plus the check.
- **F2c** (now tied, see above). Was ~ rsd: a shell-exported `BASE_IMAGE` silently beats `.env`, a reproducibility cost
  no requirement as worded covers. Best variant: `.env` names
  the dev box's base once (template `image:` and build stage), `RELEASE_BASE_IMAGE` literal in the override, and
  `release.sh` refuses a shell `BASE_IMAGE`; then it ties F5d, tie-break: a committed `.env` (correction: design §7
  says nothing about who owns `.env`, only not to set `COMPOSE_PROJECT_NAME` there; that tie-break is dropped).
- **F2e** as F2c; ~ N11 (should, verified): named contexts, one more Compose concept.
- **F2c** (round 10) ~ N25 (should, verified): the template shows `${BASE_IMAGE}`, the value is in `.env`; ~ N11:
  `.env` and Compose's interpolation order are one more concept. Leader's cells (F5d): ✓ N25, ✓ N11; F2c's ✓ N23c
  is a could.
- **F17** (bias check, round 10): `release.sh` builds each program with `docker buildx build <git-url>#<sha>`, the
  template keeps only `image:`. Trailing (~ N17, ~ N11): the dev box needs the same build from a second place
  (N19), and `release.sh` grows a build step per program; F2c leaves programs' `build:` as written.
- **F13** ✗ N22 (should, verified): FlexCompose still adds `BASE_IMAGE`, `target` and `ssh` to the app's build. Its
  gains no requirement covers (tie-break): no breaking change now, the base named once. Wins if N22 is meant only
  for programs (question 2).
- **F10w** ✗ N22: as F13 without the split.
- **F2d** meets every requirement but N17 once N19 is read as worded (it is about programs; correction); trails on
  costs no requirement covers only (tie-break): the dev box builds a trivial stage, and FlexCompose's devbox rule
  (`output.go:46`) gets an exception, where F5d removes code.
- **F6b** ✗ N11 (should, verified round 7): a Bake build; its `x-bake` variant keeps the Bake concept and command.
- **F9** ✗ N22: injection stays, and each program needs an undo line (`target: ""`).
- **F2b** ✗ N22: still injects `ssh` and `BASE_IMAGE`. Note (bias check): only `target` breaks the programs; F2b is
  the smallest fix for the program case alone.
- **F1** ✗ N22, ~ N11: adds a hidden rule (a git-URL test is one more thing to learn).
- **F3** ✗ N22, ~ N11: adds a template key (one more concept).
- **F4** ✗ N22, ~ N11 (each program repo learns a FlexCompose convention); breaks success criterion 2.
- **F6** ✗ N22, ~ N15b: injection stays; the program repo needs a named stage.
- **F7** ✗ N20b and ✗ N24: the machine gets an image from a registry, which can change and needs the NAS; a release process per program; its ~ rsd: the integration only names an image it didn't build.
- **F14** ✗ N20b (the machine gets a registry image, not one built from sources) and ✗ N24 (the pull needs the NAS);
  it also needs the NAS push (N20w, won't).
- **F15** ✗ N15b (could): the integration repo, not the owners, defines the build; its copy drifts from theirs.
- **F11** ~ N11 (should, verified): a vcs step on the host must fill the build context before `up`. It meets N19 (an
  image built from the pinned checkout). Its N17 gain belongs to the pin child decision, with F16.
- **F16** (submodule) belongs to the pin child decision; it decides how the program's source arrives, not how
  FlexCompose passes builds, and combines with every leading option.
- **F12** parked: whether the program's owners define how it runs is unknown (user, round 6: "not sure").
- **F8** parked: source protection rests on the program's team (N18b). Variant (bias check): `release.sh` runs the
  source regex over the saved program images, without a Dockerfile per program.

**Findings that touch every option** (bias check, verified 2026-10-27):
- The inference repo has **no git tags**: the draft's `#v1.2.0` and image tag `1.2.0` refer to a version that doesn't
  exist. Pin by commit SHA (no repo change; the image tag has no natural value, e.g. the short SHA), or the team tags
  (a tag, not a file change: does that break success criterion 2?).
- The inference repo's own `docker-compose.yml` sets **run settings** its owners chose: `stop_grace_period: 40s` (lets
  an in-flight inference finish), `container_name: polymx`, the `polymx` network. The round-3/4 draft dropped them:
  hand-copying the service loses what the owners decided. Whether N15b covers running too decides F12.
- FlexCompose refuses YAML anchors and aliases (design §3, line 36): the "named once in the template" cell stays empty.
- `no-compiled-source` for the app moves from the tool to the author: forgetting `target: release` still builds the
  Dockerfile's last stage, which is `release` in the starter. A test should keep it so.
- The program's git build context clones the whole repo (104 MB, `.onnx` models in plain git) on a cold cache
  (N14, CI).

**Overview of the tie (round 9, asked by the user).** Common to all three: FlexCompose drops the `release:build`
fragment (`target`, `ssh`) and `addBaseImage`; the starter's override writes `target: release`, `ssh: [default]`
and the base arg; programs need nothing; a breaking change for the starter and polymx.

| | F5c: check in FlexCompose | F5d: check in `release.sh` | F2c: once in `.env` |
|---|---|---|---|
| What the author writes | template `image: <base>`, override `BASE_IMAGE: <base>` | as F5c | `.env` `BASE_IMAGE=<base>`; template `image: ${BASE_IMAGE:?}`; override `args: [BASE_IMAGE]` |
| A base bump | two lines | two lines | one line |
| A mistake is caught | `flexcompose generate --target release:build` fails, naming both values | `release.sh` fails before building | files can't disagree; a shell `BASE_IMAGE` is refused by `release.sh`, but not on the dev box |
| Where the rule lives | FlexCompose (Go, parsed YAML: map and list `args`), one unit test, design §13 | each integration repo's copy of `release.sh` (`docker compose config` + `sed`; Compose normalizes every `args` form first: spike `spike-argforms`) | `.env` plus a guard line in each `release.sh` |
| Maintenance | once, for every machine; a FlexCompose release to change it | per repo; copies drift, untested beyond the starter | per repo (guard line); `.env` is a new committed file |
| Does FlexCompose know `BASE_IMAGE`? | yes, as a name it checks (not injects) | no | no |
| If the split lets the build stage differ (N23b undecided) | the rule must change in FlexCompose | a repo edits or drops its check | nothing to change (a second variable) |
| Readability | the template shows the base literally | as F5c | the template shows `${BASE_IMAGE}`; the value is in `.env` |
| Risks | edge cases (`${...}` values, list form) handled once | copies per repo; Git Bash untested | personal variables in the committed `.env` make the tree dirty (`release.sh` refuses: loud); a globally ignored `.env` (`${BASE_IMAGE:?}` fails loudly) |
| Fits best when | the check must be the same everywhere | each machine may decide on its own | a base bump should be one edit, and the dev box base is shared |

**Harms (F5d, from round 6; F5c and F2c in the overview):**
- A base bump edits two lines (template `image:`, override `BASE_IMAGE`); someone edits one, and the release fails in
  `release.sh`: loud, but at release, not at `up`.
- The check lives in each integration repo's copy of `release.sh`: a repo that deletes it loses it silently; a fix
  is copied per repo (F5c avoids that).
- The check compares the `app` service by name; a machine with two built services needs it extended.
- Breaking output change: each integration repo's override adds `target: release`, `ssh: [default]` and
  `BASE_IMAGE`; a missing arg fails loudly at `FROM ${BASE_IMAGE}`, a missing `ssh` at `vcs import`. A missing
  `target` still builds the last stage, `release` in the starter: keep it last, with a test. Two repos today.
- It touches the sibling *Base image* decision (bias check): F5d leaves room for its `RELEASE_BASE_IMAGE`, and decides
  only how the build stage's base reaches the build. If the user wants that in the sibling, split it (question 2).

**Also found (round 8 checks, verified):**
- A rebuild at the same pin can give other bytes: `Dockerfile.serve` starts `FROM nvidia/cuda:12.8.1-cudnn-runtime-
  ubuntu22.04` (a re-pushable tag), installs apt packages unpinned, and `requirements-serve.txt` has ranges
  (`fastapi>=0.110`). So N20b's "reproducible" holds for the source commit, not for the bytes, without changing the
  inference repo (criterion 2). A shipped release's bytes are kept in its bundle (`images.tar`). Asked in round 8.
- `pull_policy: build` checks the git context on every dev box `up` (GitHub and the SSH agent needed each time);
  the build itself is cached by BuildKit (unverified for a git context).
- F5d's check, as drafted, runs by hand in the spike: wiring it into `release.sh` (and calling `flexcompose
  generate --target devbox:host` there) is untested.
- N23b's reason, reworded: a build stage on another base compiles the release against other libraries than the dev
  box tested (`release-same-definition`), not ABI drift between stages.
- N18b for this program: `Dockerfile.serve` copies Python only (`src/`, `tests/`, `examples/`); Python is not a
  compiled language under `no-compiled-source`.

**Also found (round 6 checks, verified):** success criterion 1's "pulled from the NAS" path is untested while N20w is
a won't (dev boxes build); a pushed image with the same tag from another commit would be pulled unnoticed, as a tag
doesn't guarantee the pin (part of the pin child decision). A git tag can move; only a SHA pins.

**Reversibility:** F5d, F5c, F2, F2c, F2e costly later (an output change in every integration repo), cheap now
(two repos, polymx unreleased). F2d costly (devbox rule). F13, F10w, F14 cheap. F9, F2b cheap. F3 costly (template format).

## Open questions
Answered in round 6: the base image may differ (N23); run settings' owner: not sure (known gap: the integration
repo copies the settings that matter, e.g. `stop_grace_period`, for now; F12 parked); the pin: later (child
decision: commit SHA or tags in the inference repo).
Round 6 (asked at the end of the round):
1. (answered, round 10: N23c) N23b: does the build stage stay on the dev box's base, with only the shipped stage on a slimmer runtime base (the
   TODO plan)? Yes keeps F5d leading; "the build stage may differ too" brings F2 back.
2. (answered, round 7: N22 covers the app too, breaking change accepted) N22 for the app too?
3. N21: approve proposing the rewording of `integration-repo` in REQUIREMENTS.md?
5. (answered, round 7: should) N19: priority and reason (dev box meets the same program version as the machine); decides F2d, F11.
6. (moved to the pin child decision, round 7) The version written twice in one service (all ~ N17): accept, a check, or one variable?
7. (N15b, N20b answered in round 8; N14 a known gap) N15b, N20 priorities; Windows/Docker Desktop for a git SSH context (N14).
8. (moved to `machine-repo-layout.md`) The app's image built from its own repo
   (`-application`) like a program, each service a repo with its own recipe: which shape (the app repo holds the dev
   box too, or only the recipe), and what drives it? Reopens the parent decision (design §13, one integration repo
   per machine; `integration-repo`, should, V1). Plan step 1 holds in either shape.

## Drafts (copied from the session scratchpad, which does not survive the session)
Round-4 shape, F9, now trailing (spikes `draft-inference`, `spike-pullbuild`, `spike-cleartarget`, `spike-unusedarg` on
Compose 5.6.1, buildx 0.38.1, FlexCompose 1.0.0):

```yaml
# flexcompose.yaml (integration repo): the program's service, used by the dev box and the release
  inference:
    flexcompose_options:
      enable_gpu: true
    image: cboost-c-nas:5100/polymx-serve:1.2.0          # the program's version as tag
    build:                                                # pulled if on the NAS, else built at the pin
      context: git@github.com:Cboostbv/nl-polymx-ai-suite-inference.git#v1.2.0
      dockerfile: Dockerfile.serve
    restart: unless-stopped
    ports: ["127.0.0.1:8080:8080"]                        # the app (network_mode: host) calls 127.0.0.1:8080
    volumes: [polymx-cuda-cache:/cache/cuda]
volumes:
  polymx-cuda-cache: {}

# flexcompose.release.yaml: release:build adds target: release; this recipe has no such stage, so clear it
  inference:
    build:
      target: ""
```

`release.sh`, before `docker save`: `docker compose -f compose.release-build.yaml pull --ignore-buildable` (image-only
services; without it `docker save` fails with `reference does not exist`).

Spike results: dev box `up` with `image:` + `build:` and no reachable registry builds and starts the service; the
override's `target: ""` passes FlexCompose and Compose builds the bare single-stage recipe; an unused `BASE_IMAGE`
build arg builds without a warning; a forced `target: release` on this recipe fails (`target stage "release" could
not be found`); BuildKit and Compose clone the private repo pinned by commit with the developer's SSH agent (Linux).

Runner-up shape, F2c (spike `spike-envbase/`, round 5, Compose 5.6.1, FlexCompose 1.0.0 still injecting; the override's
explicit `BASE_IMAGE` made the injection a no-op, so the output equals F2c's):

```yaml
# .env (integration repo, committed): the dev box's image, which the release builds on
BASE_IMAGE=cboost-c-nas:5100/cboost-ros2-jazzy:0.2.0

# flexcompose.yaml
  app:
    image: ${BASE_IMAGE:?is set in .env}

# flexcompose.release.yaml: the app's build in full; FlexCompose adds nothing
  app:
    image: "cboost-c-nas:5100/example-machine:${RELEASE_VERSION:?...}"
    build:
      context: .
      target: release        # the Dockerfile's stage without source code
      ssh: [default]         # the build clones the private repositories of release.repos
      args: [BASE_IMAGE]     # from .env
```

Spike results: dev box `config` resolves `image:` from `.env`; `release:build` `config` resolves
`args: {BASE_IMAGE: cboost-...:0.2.0}` from a bare `args: [BASE_IMAGE]`; the runtime file `compose.release.yaml`
in a bundle folder with only `RELEASE_VERSION` in its `.env` resolves (the app's image is the release image). The
program's service (F9 draft above, without the `target: ""` override) needs nothing in the override.

Leading shape, F5d (spike `spike-checkbase/`, redone in round 6 with `RELEASE_BASE_IMAGE` next to `BASE_IMAGE`; the
check passes, and catches a bumped `BASE_IMAGE`; `RELEASE_BASE_IMAGE` doesn't match its pattern), round 5): the template keeps `image: cboost-c-nas:5100/cboost-ros2-jazzy:0.2.0`;
the override writes the app's build in full with `args: {BASE_IMAGE: cboost-c-nas:5100/cboost-ros2-jazzy:0.2.0}`;
`release.sh` after generating:

```bash
flexcompose generate --target devbox:host --output "$tmp/devbox.yaml"   # sketch: the dev box's view of app
dev=$(docker compose -f "$tmp/devbox.yaml" config --images app)
arg=$(docker compose -f compose.release-build.yaml config app | sed -n 's/^ *BASE_IMAGE: //p')
[ "$dev" = "$arg" ] || { echo "The release builds on $arg, the dev box runs $dev: make them the same." >&2; exit 1; }
```

Spike result: both commands print `cboost-c-nas:5100/cboost-ros2-jazzy:0.2.0` (Compose 5.6.1, Linux); no jq needed.
Untested: Git Bash on Windows; FlexCompose with the injection actually removed (the explicit arg made it a no-op).

Round-6 shape, F2, now trailing: as the F5d draft without the check. The template keeps
`image: cboost-c-nas:5100/cboost-ros2-jazzy:0.2.0` (the dev box's); `flexcompose.release.yaml`:

```yaml
  app:
    image: "cboost-c-nas:5100/example-machine:${RELEASE_VERSION:?...}"
    build:
      context: .
      target: release                                       # the Dockerfile's stage without source code
      ssh: [default]                                        # the build clones the private repositories of release.repos
      args:
        BASE_IMAGE: cboost-c-nas:5100/cboost-ros2-jazzy:0.2.0   # the release's base; may differ from the dev box's
  inference:                                                # nothing: FlexCompose adds nothing to its build
```

`release.sh`, the notice: `echo "Release base: $arg; the dev box runs: $dev"` (the two commands of the F5d draft).
Spike `spike-checkbase/` resolves exactly this override (Compose 5.6.1, Linux). Untested: FlexCompose with the
injection actually removed.

## Sources
| Claim | Source | Date | Reliability |
|---|---|---|---|
| A private GitHub repo pinned by commit works as a Compose/BuildKit build context over the developer's SSH agent | spike `buildx build --call=outline` and `compose build --print` (Linux); Compose build spec (git contexts `#ref:subdir`) | 2026-10-26 | high on Linux; Windows untested |
| `release:build`'s forced `target: release` fails on a recipe without that stage | spike: `target stage "release" could not be found` | 2026-10-26 | high |
| With `image:` + `build:` and no `pull_policy`, Compose pulls first and builds only if the image isn't found | Compose build spec, "Using build and image"; spike `spike-pullbuild` | 2026-10-26 | high |
| An override `build.target: ""` passes FlexCompose and Compose builds the last stage | spike `spike-cleartarget` | 2026-10-26 | high (current versions) |
| An unused build arg (`BASE_IMAGE`) builds without warning | spike `spike-unusedarg` | 2026-10-26 | high |
| `docker save` of an image-only service fails unless pulled first; `compose pull --ignore-buildable` fixes it | spike `draft-inference` | 2026-10-26 | high |
| Compose resolves `image: ${BASE_IMAGE}` and a bare `args: [BASE_IMAGE]` from the project's `.env`; precedence shell > `--env-file` > `.env` | spike `spike-envbase` (`docker compose config`); Compose interpolation spec and Docker docs (generator, round 5) | 2026-10-27 | high on Linux; Windows CRLF untested |
| `additional_contexts` with `docker-image://` overrides a `FROM` name (Compose ≥ 2.17) | Compose build reference; Docker blog on multiple build contexts (generator, round 5) | 2026-10-27 | medium (docs only, no spike) |
| `release.sh` can read the dev box image and the build arg with `docker compose config --images app` and `config app` | spike `spike-checkbase` | 2026-10-27 | high on Linux |
| The inference repo has no git tags; its `docker-compose.yml` sets `stop_grace_period: 40s`, `container_name`, a network | `git tag`; `docker-compose.yml:13-20` | 2026-10-27 | high |
| FlexCompose refuses YAML anchors/aliases | design §3 (line 36) | 2026-10-27 | high (doc) |
| A build `FROM` a base whose registry is unreachable works if the base is in the local image store (default `docker` builder); `pull_policy: build` passes FlexCompose to the dev box and `release:build`, the machine's file gets `never` | spikes `spike-nasdown`, `spike-pullbuild2` | 2026-10-27 | high on Linux; a fresh PC without the base still needs the NAS (known gap for N24) |
| `docker compose config` prints `args` as a map for the map, list and quoted list forms; Compose reads the `.env` next to the compose file from any working folder (also `.devcontainer/`); a CRLF `.env` leaves no `\r` in the value | spikes `spike-argforms`, `spike-envbase` (redone round 9) | 2026-10-27 | high on Linux (the bias check's `sed` concern was wrong) |
| BuildKit clones a private GitHub build context at a commit SHA with the developer's SSH agent, without `ssh:` in the build or `--ssh` | spike `spike-gitssh` (`buildx build --call=outline`) | 2026-10-27 | high on Linux (buildx; Compose uses it) |
| FlexCompose already merges a per-service `build:` from the override, `release:build` adds `target: release`, `ssh`, `BASE_IMAGE` (the service's own template `image:`) to every service with `build:` | `flexcompose-cli/release.go` (`mergesInto`, `addBaseImage`) | 2026-10-26 | high (code) |

## Round checklist
Checklist (round 11):
- [x] Log (first round): n/a: resumed; what changed: the child's A-1, A-2, A-4 and its M13, M14
- [x] Problem and success criteria (first round): n/a
- [x] Scope: narrowed to the app's base image (A-5); the rest follows the child
- [x] Requirements: M13, M14 from the child (should, verified)
- [x] Replaced requirements: n/a
- [x] Written requirements: n/a: none new
- [x] Deciding unverified requirements: none
- [x] Options: F2d′ (F2d in A-2's frame); D (today) as a baseline
- [x] Searches: no web search
- [x] Deciding claims: the devbox rule `output.go:46-56` (read)
- [x] Matrix: round 11 table
- [x] Rejection records: F2, F5d, F5c, F2c, D
- [x] Harms: F2d′'s build on every up, the base owned by the app's team
- [x] Reversibility: F2d′ costly later (a FlexCompose rule removed, every integration repo's template), cheap now
- [x] Draft and stress test: F2d′ described in its record; the child's template drafts hold the app's Dockerfile with `ARG BASE_IMAGE` default
- [x] Bias check: Dev Containers + git context unverified (spike); ref-tagged dev image; N25 reword; F2's M13 reason; options noted
- [x] Rejection check: recreate-announced condition (pinned ref); breaking devbox change; N22 needs plan step 1; F2d′'s N25 deeper; D ~ M14
- [x] Ranking change: F2 (the user's draft pick) → F2d′ leading under M13
- [x] Report: in chat
- [x] Questions: the spike, N25's reword, F2's M13 reading; remarks last
- [x] Pushback: the user's draft pick F2 now trails (~ M13): asked whether F2d′ replaces it

## Rounds
- Rounds 1-3 (2026-10-26): round 1's wider framing (several programs with conflicting dependencies) was dropped by
  the user as missing the core; rounds 2-3 set the problem from the user's statement (`integration-problem.md`).
- Round 4 (2026-10-26): user wants the integration repo to build programs from their own recipe (NAS optional);
  first leader F4; after the checks and spike `spike-cleartarget/`: leader F9 (override clears the target, no change
  anywhere), runner-up F2b (FlexCompose drops `target: release`); F8 parked for compiled programs. Paused by the user
  before answering the round-4 questions.
- Round 5 (2026-10-27): answers: owners define the build (N15b), NAS push later, source protection by the program's
  team; new N22 (FlexCompose adds nothing to `build:`). F9 and F2b fall (✗ N22); F2c (base in `.env`) led until the
  checks; then F5d (base written twice, `release.sh` checks it) leading, F2c runner-up.
- Round 6 (2026-10-27): answers: bases may differ (N23), run settings' owner not sure, pin later. F5d and F5c fall
  (✗ N23); F2 leading. After the checks N23 → N23b (only the shipped stage, as the TODO plans): F5d leading again,
  F5c runner-up; F13 (TODO plan, app-only injection) added.

- Round 7 (2026-10-27, answers to round 6): build-stage base when split: not decided (N23b stays an assumption;
  F5d and F5c leave room for both); N22 covers the app too, now (F13, F10w stay ✗ N22, breaking change accepted);
  N21: propose the rewording when documenting. Leader F5d, runner-up F5c unchanged.
- Round 7 answers: N19 should, N11 should (both verified); N17 goes to the pin child decision. No ranking change.
- Round 9 (2026-10-27): N20b means the same source commit; the dev box fetch per `up` is accepted; the user asked for
  an overview of the tie (in *Evaluation*), then a complete document (`machine-release-programs.overview.md`).
  Spikes: `compose config` normalizes `args` (F5d's `sed` is sound); `.env` found from `.devcontainer/`, CRLF fine;
  buildx clones the private git context with the SSH agent and no `ssh:` entry.
- Round 11 (2026-10-28): resumed as A-5 of `machine-repo-layout.md`; with A-2 and M13, F2d′ leading, F2c runner-up,
  the draft pick F2 trailing (~ M13).
- Round 10 (2026-10-28): the build stage may later get a smaller base than the dev box (N23c, could; answers open
  question 1). F2 meets N23c without change, where F5c, F5d and F2c have to change for it; F2 added to the overview
  as the fourth choice, and today's injection as a baseline column. The user picked F2. After the checks F2c leads
  alone (its rsd cell was stale; it meets N23c with one repo line), F5d runner-up; F2 trails on rsd (a forgotten bump
  isn't caught); F17 added (bias check). Pushback asked: what makes F2 better than F2c. Answer: no `.env`
  wanted; follow-up: the value is one file away and `.env` is one more concept (N25, should, verified; ~ N11 for
  F2c). F5d leads on scoring, F2 runner-up; the user keeps F2 knowing the trade-off. *Decision* drafted.
- Round 8 (2026-10-27): N15b could; N20 → N20b (reproducible, not from a registry); N24 (no NAS needed, could); programs
  get `pull_policy: build`; F15, F16 added. After the checks: F5d, F5c, F2c tied on every requirement.

## Decision
**Draft (2026-10-28), paused** by the user until `machine-repo-layout.md` settles; the review has not happened.

Decision checklist:
- [x] Stop condition: N25 came from the pushback and the user decided knowing the trade-off; nothing deciding left unverified (N23b's build-stage part superseded by N23c)
- [ ] Why and Rejected: each on a requirement the user confirmed; confirmed by the user
- [x] Known gaps and open child decisions: listed below
- [ ] Documentation: updated where the rule takes effect; overstated requirements corrected; commit message proposed
- [x] Success criteria: carried over only as project rules (none carried over)
- [ ] Out of scope: noted where open work is kept
- [ ] Overview: choice, pros and cons, rejected, gaps, plan, files
- [ ] Review: in open chat; nothing implemented before it

**Choice: F2.** FlexCompose passes `build:` on as written: the `release:build` fragment (`target: release`,
`ssh: [default]`) and `addBaseImage` go. The starter's override states the app's whole build, its build stage's
base as a literal `BASE_IMAGE`; the template's `image:` names the dev box's image literally. Nothing compares them.
A program's service has `image:`, `pull_policy: build` and `build:` from its git context and own recipe.

**Why:**
- N22 (should, verified): the output is what the files say; a program needs no line that undoes a tool rule.
- N25 (should, verified): the template and the override show both images literally.
- N23c (could, verified): the build stage can get its own, smaller base by editing one line, nothing else.
- N11 (should, verified): no `.env`, no check, no tool rule to learn.
- Simplest of the choices (user, round 10).

**Rejected:**
- F5d (leads on scoring): its `release.sh` check catches a forgotten bump (✓ rsd), but is copied into every repo
  and has to go when the build stage gets its own base (N23c); the user prefers no check.
- F5c: as F5d, with the check in FlexCompose (against N22's reason) and the split needing a FlexCompose release.
- F2c, F2e: `${BASE_IMAGE}` hides the value one file away (~ N25) and `.env` is one more concept (~ N11).
- Today's injection, F13, F10w, F9, F2b, F1, F3, F4, F6: ✗ N22 (FlexCompose adds to `build:`).
- F6b: ✗ N11 (Bake). F7, F14: ✗ N20b, N24 (registry images). F15: ✗ N15b. F17: ~ N17, N11.

**Known gaps:**
- `release-same-definition` partly: a base bump in the template without the override goes unnoticed; the release
  compiles against other libraries than the dev box tested. Accepted by the user (round 10).
- N14: the git SSH build context and the starter's `release.sh` are untested on Windows/Docker Desktop.
- N24: a fresh PC needs the NAS once for the base image.
- `pull_policy: build` fetches the program's git context on every dev box `up` (accepted, round 9).

**Open child decisions:** the program's pin (commit SHA or tags; git URL or submodule, F16; the version written twice,
N17); who defines how a program runs (run settings); the base image split (TODO.md *Base image*); source protection
for compiled programs (F8); N21's rewording of `integration-repo` in REQUIREMENTS.md.

**Plan** (one commit each, in `nl-cboost-flexcompose` unless named):
1. `feat!`: FlexCompose adds nothing to `build:`. Remove `addBaseImage` and the `release:build` fragment's keys
   (`release.go`, `fragments/targets/release-build/compose.yaml`, `output.go:66`); the starter's override gains
   `target: release`, `ssh: [default]`, `args: {BASE_IMAGE: <literal>}`; `release_test.go` tests "the build is passed
   on as written"; `tests/e2e.sh` gets a program built from a git context with its own recipe.
2. `doc`: FLEXCOMPOSE_DESIGN.md §13 (the `release:build` row, the decisions table), README.md's target table, the
   starter's README; REQUIREMENTS.md: N22, N25, N23c at their priorities, `release-same-definition`'s gap, N21's
   rewording proposed.
3. polymx integration repo (unreleased branch): the same override lines; the inference service as in the overview's
   section 2.2.
4. After step 3 is in use: ask the user what using it showed; amend *Decision* or reopen a round.


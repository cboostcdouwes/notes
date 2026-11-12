# Where a machine's services are defined, pinned and built

**2026-11-10: A-2 back in the service repo, with FlexCompose imports** (child log `machine-starter-template.md`,
review round 8); implemented 2026-11-11/12. *Decision* at the end (confirmed 2026-11-12).

**2026-10-29: A-2 reopened in the child log `machine-starter-template.md` (axis D) and changed for colcon services:
their release recipe is generic and lives in the machine repo (D2g); service repos hold only code and their
`dependencies.repos`; services with their own recipe (inference) keep it.**

**Status (2026-10-28): A-1 settled (cdr; Python services by their own Dockerfile); A-2 decided (recipes in the
services' repos); A-3 agreed (the app as the one workspace service; others as images); A-4 decided (customer branches; a base tag,
feature or customer tags); A-5 decided (user): F2 (the base as the template's `image:`
and the release override's `BASE_IMAGE`, an allowed difference); next: *Decision* drafts. Round 7: the colleague's recursive resolver (`cdr`, `nl-cboost-ros-tools`) covers the
lock and dependencies-of-dependencies; A14-default leading. Earlier: round 4 answered (M4 could, M13 and M14 new, M11 reworded); round 5 rescores. Round 4: M9 dropped; M8 back to versions, configuration and base; M11 (no reverse dependency
from a service's repo, should) added. Broader discovery (three new generators) gave A10; after the checks
the leader is A14 (A10-lite: today's template as the root, author-written git builds, `generate --source`, snapshot
locks, customer layers); B9 (editable overlay) added.** Earlier: round 2: M8 (customer variants in one machine repo) added. Axis A: leader A9 (the recipe and
loose dependency declarations in the service repo, an exact lock per customer in the machine repo), runner-up A1;
axis B: B2+B3 (a workspace and a dev container per source-built service, chosen by `generate --source`), ahead of
B2 alone by a could (M10); axis C: C2 (a variant layer per customer merged by FlexCompose) ahead of C3 (merged for
the release only) on `release-same-definition`'s reason; per-customer tagging open.** Split off from `machine-release-programs.md` during its
decision review (round 10), from the user's what-if: build the app's image from its own repo (`-application`), as a
program is built from its repo. That decision (F2) is paused until this one settles. Rounds
and their state: *Rounds*.

## Problem
A machine runs several services: a robot application built from many source packages, an inference service, later
others. Different teams work on them. While developing, a developer needs all of the machine's services running
together, with the service they work on built from its source and the others as ready images. A release builds each
service at a pinned version and ships them together to a machine that runs offline. The open question is where each
service's build definition, its dependency pins and the development environment are kept, so that developers find
them easily, each service is built the same way, and two source-built services can be developed side by side
without their dependencies getting in each other's way. Scope: future machines first; the existing PolyMX QC machine
is adapted where possible (user, 2026-10-28). Today's layout and what is known about it: *Options*, L0.

## Related decisions
- Parent: release targets, design §13 (decided 2026-10-19, option 4: one integration repo per machine). This
  research may reopen it.
- Sibling, paused on this one: `machine-release-programs.md` (how programs with their own recipe are built; draft
  decision F2). Its plan step 1 (FlexCompose passes `build:` on as written) holds in every shape below.
- Sibling, open: base image split devbox/runtime (TODO.md, *Base image*).

## Success criteria
Judged by the user (2026-10-28):
1. In one dev box, the app and inference both run from source next to each other, without a checkout conflict
   (M6, M7).
2. A machine release builds every service at its pin and runs offline from the bundle.
3. A colleague finds where a service's build and pins live without asking (M3).

Not a criterion: "adding a service touches only its own repo plus one entry"; a service may need special handling in
the integration repo (user, 2026-10-28).

## Requirements
From the user's answers in `machine-release-programs.md` round 10 and the requirements round (2026-10-28); all
reasons and priorities verified by the user.

| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| M1 | The dev box runs all of the release's services at once | The app can't run without the other services (it calls inference, for one) (user, requirements round, 2026-10-28) | user, parent round 10 ("the devbox should be at the height where it allows to run with all release services at once") | must | yes (2026-10-28): must, the user verified it; without it the app can't run in the dev box |
| M6 | In the dev box, whichever service a developer works on runs from source; whether the others run as images or from source depends on the service: light services may always run from source, heavy ones (CUDA) run as images unless chosen | Developers work on any service, not only the app (requirements round); "as images" depends on the service (user, round 6) | user, requirements round and round 6 | should | yes (2026-10-28) |
| M2 | Every service follows one pattern for its recipe and pins | Two ways of building and pinning to learn (as N11); FlexCompose and `release.sh` need code for each pattern (user, requirements round) | user, parent round 10 (driver "one pattern"); relates to N11 | should | yes (2026-10-28) |
| M7 | Several services built from their own source packages can be worked on in one dev box without their package checkouts conflicting | Today one integration repo checks out every package side by side (`dev.repos`); a second app-like service's packages would collide with the first's (user, requirements round). No such service is coming soon, but the option is kept open (user, 2026-10-28) | user, requirements round (2026-10-28, given as M2's reason) | should | yes (2026-10-28): downgraded from must by the user |
| M3 | A developer finds each part of a service's setup without searching, and the setup has no more parts than the services need | Developers don't know where to look; each part needs upkeep (CI, branch rules, reviews, releases); more complexity and mental overhead than necessary (user, requirements round) | user, parent round 10 (driver "fewer repos", a mechanism: reworded to the need) | should | yes (2026-10-28) |
| M4 | A service's build configuration lives in one place | Nice to have (user, round 4: "having configuration in one place would be nice"); its core, no duplication, is M13 | user, parent round 10 (driver "team ownership"), reworded in the requirements round and round 4 | could | yes (2026-10-28: downgraded from should by the user) |
| M13 | Build configuration is not copied: one source of truth per setting; a value overridden elsewhere (a default the machine overrides, a release override) is not a copy, and dev and release may differ | The core idea behind M4 (user, round 4); a copy drifts (as `dev.repos` and `dependencies.repos` do today). Exception accepted by the user: a service's version as two literals (`image:` tag and `build:` git ref, round 5) | user, rounds 4-5 | should | yes (2026-10-28) |
| M8 | Customers may differ in service versions, configuration and base/hardware, kept cleanly apart from the services' code; configuration is preferred where it suffices | Future projects: different customers may get different images or configurations (user, round 1); versions may have to differ per customer (user, round 4, correcting round 3's "configuration only"); "try to keep the customer variants to configuration files" where possible (user, round 3). Where: one machine repo (fewer repos, shared fixes once: round 2); a branch per customer may be acceptable while customers or configurations are few (round 3) | user, rounds 1-4 | should | yes (2026-10-28) |
| M10 | Two source-built services can be open side by side in VS Code | Nice to have (user, round 2) | user, round 2 | could | yes (2026-10-28) |
| M11 | A service's repo knows nothing about the machines, customers or integrations it ships in; knowing the interfaces of the services it calls is fine | A reverse dependency (a service knowing the integration it is part of) that will be hard to get rid of (user, round 4); the app calls inference, so it knows its API (bias check, round 4; rewording confirmed by the user) | user, round 4 | should | yes (2026-10-28) |
| M12 | A developer creates a dev box with as few commands as possible (ranked by the number of commands and files to write) | Onboarding (new colleagues get a box without learning FlexCompose), switching between services often, fewer mistakes per manual step (user, round 5) | user, round 4 | should, weighs below M14 | yes (2026-10-28) |
| M14 | FlexCompose stays simple: as few concepts, options and rules in the tool as fit | Ranks higher than M12 (user, round 4); a tool rule costs tests and docs (sibling N22's reason) | user, round 4 | should, weighs above M12 | yes (2026-10-28) |
| M5 | A service, or its image, can run in other setups than this machine | No concrete case yet: keep the door open (user, requirements round) | user, parent round 10 (driver "reuse elsewhere") | could | yes (2026-10-28): could, no concrete case |

Written requirements this touches: `integration-repo` (should, V1: "package repos hold only code; each machine's
integration lives in one repo of its own"; reason "package repos stay reusable across machines"; N21 rewording
pending in the parent log), `release-same-definition` (should, V1), `no-compiled-source` (must, V1).

## Options
Round 1 discovery: three generators (own field blind to the project; far fields: Yocto/kas, Android `repo`,
Buildroot, Debian/bloom, Nix/Bazel, AUTOSAR, configurable BOM, Team Topologies; own field with the project's code).
Their options split along two axes that barely depend on each other:
- **Axis A, where a service's build recipe and dependency pins live** (M2, M3, M4, M5; the user's question).
- **Axis B, how the dev box runs several services and switches one to source** (M6, M7; M1 for both).
Design-space map for A: *where the recipe lives* (machine repo centrally / machine repo per service / service repo /
shared builder / one repo for all) × *what the machine pins* (source commits / released images). Every sensible cell
is filled; no extra generator run. Axis B could become a child decision (question 1).

### Axis A
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| A0 | Today (L0): the machine repo holds the app's recipe (`Dockerfile` importing `release.repos`), its pins and the dev box; a program's recipe lives in its own repo | Works today; one central `no-compiled-source` check | Two patterns (app vs programs); the app's pins exist twice and drift (`dependencies.repos` vs `dev.repos`, verified 2026-10-28) | n/a | trailing (M2, M3, M4) |
| A1 | Each service repo holds its recipe (Dockerfile) and its own dependency pins (`.repos`); the machine repo holds the template, the release and one pin per service (its commit); the release builds each service from its git context at that commit (generators 1, 2, 3; L1 refined; Android manifest, Debian source package) | One pattern for every service; a service's build in its own repo; pins once per level; the inference repo already works this way | Two pin levels (a dependency change: PR in the service repo, then a pin bump in the machine repo); the dev box image (machine repo) and the build base (service repo) in two repos; the ROS Dockerfile copied per ROS service (a starter keeps them alike); `no-compiled-source` checked per repo | costly (files move across repos, habits) | runner-up (~ M3, ~ M4) |
| A1b | As A1, and each service repo also ships its Compose service definition, which the machine file pulls in with `include:` (generators 1, 3) | Run settings owned by the service too | FlexCompose's features, targets and release rules see only template services: it must resolve `include:` itself; Compose refuses overriding an included service | costly | trailing (as A1 plus a FlexCompose resolver; the run-settings owner is an open sibling question) |
| A2 | One folder per service in the machine repo (`services/<name>/`: Dockerfile, `dev.repos`, `release.repos`); the build context per folder (generator 3; precedent `example/docker-compose-base.yaml`) | One pattern; everything about the machine in one repo; one central compiled-source check | A service's build is away from its code (its recipe is in one place, so M4 holds: round-1 check); a program's own recipe is referenced, so programs still differ (M2 ~); one recipe per machine for several app versions, or a copy per customer variant (M8 ~) | costly | trailing (~ M2, ~ M8; round 2) |
| A3 | The app repo becomes the machine repo (L3); programs stay in their repos | One repo fewer (M3) | Code and integration in one repo (`ir` as worded ~); a customer variant on another app version pins the repo it lives in (M8 ~); release tags of the app and the machine coincide | costly | trailing (✗ M11; ~ M8, ir; round 4) |
| A4 | One repo per machine for all its services' code (monorepo; optionally Bazel `rules_ros2`) (generators 1, 2) | One place, one pattern, no cross-repo pins | Shared packages (orchestrator, state manager) and other teams' services (inference) can't move in: `integration-repo`'s reason (reuse across machines); large migration; Bazel a new concept | costly to one-way (history moves) | trailing (✗ ir; ~ M2 M8) |
| A5 | Each service releases images through its own CI; the machine pins image digests (GitOps environment repo) (generators 1, 3) | Thin machine repo | Release from registry images, not from pinned sources (sibling N20b, should, verified); needs the NAS (sibling N24, could); per-service CI | costly | trailing (N20b, rsd) |
| A7 | The recipe in the service repo, every dependency pin in the machine repo: the service's Dockerfile reads a `.repos` the machine passes in (`additional_contexts` or a build arg) (bias check, round 1) | One pin level; one version set per machine | The build is split between the service repo (recipe) and the machine repo (pins) | costly | trailing (~ M2 M3 M4; round-2 checks) |
| A9 | Each service repo holds its recipe and declares its dependencies loosely (branches, version ranges); the machine repo locks them to exact versions per customer variant (generated, e.g. `vcs export --exact` from a dev box, as a Cargo or Poetry lock); a program's lock is its commit (bias check, round 2) | One exact pin level, in the machine repo; a service still builds alone from its loose declarations (M5); inference already declares loosely (`requirements*.txt` ranges); customer variants lock differently (M8) | A lock step to run and keep (a generator command); the exact versions sit outside the service repo | costly | merged into A14 (its best variant; round-4 rejection check) |
| A10 | Root-only machine manifest with a computed dev view: service repos follow one envelope (recipe with `dev`/`release` stages, loose dependency declarations, a self-only Compose fragment, dev settings) and name no other service; the machine repo alone picks versions, layers customer differences and locks them per variant; the dev box is computed from the release definition plus an untracked work file (round 4 discovery: Go workspaces, Bazel root-only overrides, BioBricks, USD/delta layers, kas locks, restbus) | Every requirement as worded (M4 on the lock-as-resolution reading); combines A9, B2+B3 and C | The largest FlexCompose change (manifest, work file, computed view, lock, clash check); every service repo adopts the envelope | costly, can come in steps | trailing (~ M3 M4 N11 N22 ws; round-4 checks) |
| A14 | A10-lite: today's `flexcompose.yaml` stays the one root template; each service's `build:` is written by the author as a git context at its version (as the sibling's programs); service repos hold only their recipe and dependency declarations at conventional paths (no Compose or devcontainer fragments); `generate --source <svc>` (B5 flag, remembered in the header) builds that service from a checkout in its own workspace with its own devcontainer (B2+B3), cloning it if absent; customer layers per variant (C2/C3); locks as snapshots (`vcs export --exact` per variant at release, as `release.repos` today) (bias check, round 4; A9's best variant per the rejection check) | A10's fit inside today's format: no new manifest, no fragment merging, FlexCompose passes `build:` as written (N22) | Per-service workspace volumes (the frozen name: `work-survives`); a pip lock beside `vcs export` for Python services | costly, in steps | leading (round 4, after the checks) |
| A11 | Publish, don't build: each service's CI publishes images (with provenance), the machine pins digests (round 4: Conan/PPA, self-describing images, Drug Master File) | Thin machine repo | Registry and CI per service; the release collects instead of building | costly | trailing (✗ N20b; ~ rsd) |
| A12 | Services publish their Compose fragment as an OCI artifact; the machine includes `oci://` references (round 4) | Run settings owned by the service | Runtime fragment in a registry, dev fragment in the repo | costly | trailing (~ M3, N20b) |
| A13 | One 150% template with presence conditions, a feature selection (or an intent resolved into a lock) per customer (round 4: product lines, CycloneDX/intent) | Every variant in one file | The superset grows with customers; a rule language | costly | trailing (~ M3 M4 N11) |
| A0b | A0 with the stale `dependencies.repos` removed (or derived), so the app's pins live once, in the machine repo (bias check, round 1) | The cheapest fix of the verified drift; nothing moves | Still two patterns (app built centrally, programs from their repos) | cheap | trailing (✗ M2) |
| A8 | Wait: do A0b now, decide the layout when a second source-built service exists (bias check, round 1) | No work for needs that aren't here yet (M7 should, M5 could) | The starter for future machines keeps A0's two patterns until then (scope: future machines first) | cheap | trailing (✗ M2, as A0b) |
| A6 | No per-service recipe: a shared builder per kind (ros2-colcon, python-inference) owned by the platform side; services carry only metadata (Buildpacks, thinnest viable platform) (generator 2) | One pattern by construction | A service with steps no kind covers needs an escape hatch, which is a second pattern; owners don't define their build (sibling N15b, could) | costly | trailing (✗ N15b; ~ M2 M4) |

Variants recorded, not separate options: a machine-level manifest tool (west, `repo`, kas) is what vcstool already
does for A1's service pins; git submodules per service as A1's pin mechanism (sibling F16); release from the dev
box's checked-out commits (`vcs export --exact`) for A0/A2; a 150% machine definition with variants (see axis C, M8); per-service binary packages for dependencies (axis B's B4).

### Axis C, how customer variants are expressed in the machine repo (M8; round 3)
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| C1 | A lock file per customer (`variants/<customer>/lock.repos`) | Versions per customer | Configuration and base per customer have no place | cheap | trailing (~ M8) |
| C2 | A variant layer per customer (`variants/<customer>/`: a FlexCompose-format override with features, its lock, its config files) on top of the shared files; FlexCompose merges it for the dev box and the release when asked (`generate --variant <customer>`, remembered in the header) | Versions, configuration, base and features (GPU) per customer; a shared fix once; the dev box runs a customer's variant with FlexCompose's own merge rules | A second, ordered override layer for every target (`release.go` hardcodes one override today) and a header key (tie-break) | costly (a FlexCompose feature, the starter) | leading |
| C3 | As C2, but only the release merges the layer, with plain Compose, into both the build file and the run file (`release.sh <customer>`; the lock and `BASE_IMAGE` must reach `compose.release-build.yaml`; `config` interpolates, so `RELEASE_VERSION` gets baked in); a developer may add the layer by hand as an extra `-f` or `dockerComposeFile` entry | No FlexCompose change (tie-break) | Compose's merge differs from FlexCompose's (§6: list dedup, path conflicts); FlexCompose features (GPU) can't be switched per customer by a plain layer | cheap | runner-up (C2 wins on rsd's reason, question 1) |
| C4 | A FlexCompose target per customer | Fits FlexCompose's target list | Targets are a fixed set in the tool; a target per customer is a tool change per customer | costly | trailing (~ N11, M3) |
| C5 | Compose profiles per customer | Plain Compose | Profiles pick services, not versions, configuration or base | cheap | trailing (✗ M8) |
| C6 | A branch per customer | Plain git | A fix for all customers is a merge into every branch (M8's reason: shared fixes once) | cheap | trailing (✗ M8) |
| C8 | A per-customer env file (`variants/<c>/.env`) filling variables in the shared files (`${APP_LOCK}`, `${CONFIG_DIR}`, `${BASE_IMAGE}`), passed to the dev box and copied into the bundle's `.env` (bias check, round 3) | Plain Compose, no FlexCompose change; dev box and release alike | Variables can't add services, devices or features; the template fills with variables | cheap | trailing (~ M8: structural differences) |
| C9 | Customer configuration as runtime data: every customer gets the same images, its configuration is a folder in the bundle (or on the machine) mounted at start; build variants only for versions and base (bias check, round 3) | Fewer images; a configuration change needs no rebuild | Depends on whether a customer's configuration may sit outside the images (question 3) | cheap | open (question 3) |
| C7 | One 150% definition with rules resolved per customer (configurable BOM) | Every variant in one file | A rule language to learn and test | costly | trailing (~ N11) |

### Axis B
| # | Summary | Notes |
|---|---|---|
| B1 | Today: one workspace volume and one `src/` for every `workspace: true` service (`fragments/targets/devbox-host-src/compose.yaml`, `template.go:21`) | Fails M7: two source-built services share one `src/` |
| B2 | One workspace per source-built service in the one dev box (`<project>_<svc>_workspace`, nested colcon overlays) | FlexCompose: the frozen `source_workspace` name (`work-survives`) |
| B3 | One dev container per source-built service on the shared Compose stack (`.devcontainer/<svc>/`, `runServices`, `shutdownAction: none`) | Isolation by container; one VS Code window per service |
| B4 | Shared dependencies as binary packages (private rosdistro + apt via bloom, or Pixi) instead of source checkouts | M7 goes away; packaging infrastructure and an offline mirror |
| B5 | Which service runs from source: a committed field / a `generate --source <svc>` flag / a local, uncommitted overlay (Yocto `devtool modify`, Android local manifests) | Orthogonal to B2-B4 |
| B6 | A dev-loop tool on top of Compose (Tilt `docker_compose()`, Skaffold, Garden) | Trailing (one more tool to learn); `plain-compose` as worded still holds: it asks that boxes and releases run with plain Compose, not that no tool sits on top (rejection check; the user: round 1 read it too broadly) |
| B7 | A dev box per service in its own repo, which brings in the machine's other services as images (`include:` of the machine's release Compose file) (bias check) | Serves M6, M7 without a shared `src/` |
| B8 | Shared ROS dependencies as a released underlay image (a cheaper B4) (bias check) | M7 only for dependencies that are released |
| B9 | Editable overlay (as `pip install -e`): the dev box runs a service's image with its locked dependencies installed (the underlay), and only the packages a developer edits are checked out and overlaid (`colcon build --symlink-install`; `pip install -e .` for Python services); the unit of "from source" is a package, not a whole service (user's idea, round 4) | Fewer checkouts (M7 conflicts shrink), less setup (M12), the release image reused; risk: overriding a package other underlay packages were built against (messages, headers) breaks them; packaging changes need a rebuild |

## Matrix
Axis A, round 4 (M8 back to versions, configuration and base; M9 dropped; M11 added). Columns as in round 2, plus
M11; written: `rsd`, `ncs`, `off`, `pc`, `ir` (under N21), `ws` = `work-survives` (must, V1); sibling N20b, N15b, N22.
M6, M7, M10 are scored on the dev box each option comes with (A10 includes B2+B3; the others leave room for it).

| Option | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M10 | M11 | M12 | rsd | ncs | off | pc | ws | ir | N20b | N15b | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *priority, verified* | must, yes | should, yes | should, yes | should, yes | could, yes | should, yes | should, yes | should, yes | could, yes | should, yes | should, yes | should, V1 | must, V1 | must, V1 | must, V1 | must, V1 | should, V1 | should, yes | could, yes | |
| A14 | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ M4 (base and lock in the machine repo: question 1) ws (migration); N22 ✓, N11 ✓; `own-host-environment` (must) to be shown for every placement |
| A10 | ✓ | ✓ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ M3 M4 ws; ~ N11 N22 (not columns: round-4 rejection check) |
| A9 | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ M4 (its best variant is A14) |
| A1 | ✓ | ✓ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ M3 M4 |
| A7 | ✓ | ~ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ M2 M3 M4 |
| A2 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ M2 M8 |
| A3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✗ M11; ~ M8 ir |
| A11 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ N20b; ~ rsd |
| A12 | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ M3 N20b |
| A13 | ✓ | ✓ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ M3 M4 (and ~ N11) |
| A0b | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ M2; ~ M8 |

A4, A5, A6, A8, A1b, A0 unchanged since round 2 (✗ ir, ✗ N20b, ✗ N15b, ✗ M2 resp.); all ✓ M11 except none.

## Evaluation
**Round 4 discovery** (three generators, lenses far from round 1's: radical reframings of the design's dimensions;
dependency ecosystems; distant fields): the same shape came up from all three, and it combines the earlier leaders
(A9's loose declarations and root lock, B2+B3's dev box, C's per-customer layer):
- **Root-only overrides** (Go `go.work` vs `go.mod`, Bazel bzlmod "overrides take effect only at the top level",
  uv overrides read only from the workspace root, Cargo `[patch]`): only the product may choose or override a
  component's version or source; a component never names its products (M11 by construction).
- **The dev box as a computed view** (reframing generator; "machine minus one", restbus simulation, offline/online
  conform): only the release is written; the dev box is the release minus the services a developer checked out.
- **A standard part envelope** (BioBricks/MoClo): every service repo has the same fixed files, and the assembly
  fits any part with that envelope (M2, M3 by convention; a lint for M11).
- **A lock next to each variant** (kas `<file>.lock.yml`, Helm `Chart.lock`, Spack `spack.lock`) and **deltas** on a
  core (delta-oriented product lines, USD layers): a customer layer holds only its differences (M8, shared fixes once).
- **Clash detection** (federated BIM): a check that reports a shared package at two versions across services, before
  colcon fails (M7's conflict, present today with `packml_ros2`).

**Round-4 checks.** Rejection check: A10's all-✓ row doesn't hold: ~ M4 (its `base:` and recipe mapping sit in the
machine repo, and the lock arrives as a named context: A1's and A7's costs); M12 was scored on a flag the draft
doesn't contain (A9 can take it too); ~ ws (host-src checkouts lose their place when the app runs as an image; the
same per-service volumes are ~ ws under B2+B3); ~ N22 (FlexCompose writes every `build:` itself) and ~ N11 (a
manifest schema, a work file, a lock command, an envelope) were not scored; `own-host-environment` (must) unscored;
~ M3 (run settings in three places, and A1b's fragment-resolver cost). A9's records overstated (bootstrap runs on
every open; M11/M7 are ✓): its best variant (A9 + B2+B3 + B5 flag + C) ties A10 and beats it on N22, N11. A12's
and A13's records rest on less than stated (A12: N24, a could; A13: N11 only). Bias check: A14 (A10-lite, the same
best variant inside today's format; locks by snapshot, as `release.repos` today); M12 needs a reason and a floor; M8
bundles a need, a place and a preference; M11 as worded is too strong (the app knows the inference API it calls:
the need is "knows nothing of the machines, customers or integrations it ships in"); M4 question 1 was leading;
`vcs export` doesn't lock pip; vcstool resolves one level only; the images for non-source services are built
locally from git (sibling's `pull_policy: build`), a first-start cost for M12; inference and the app don't match
the envelope today; proportionality: two services, three source dependencies. The user added B9 (editable overlay).

**Leader A14** (A10-lite): A9's recipe-and-declarations-in-the-service, B2+B3's dev box and C's layers, inside the
FlexCompose template as it is: the author writes each service's `build:` (a git context at its version), FlexCompose
passes it on (N22); `generate --source <svc>` switches one service to a checkout with its own workspace and
devcontainer, cloning it if absent (M6, M7, M10, M12); the locks are snapshots per variant at release. ~ M4 (the
base and the lock sit in the machine repo; question 1 asks neutrally); ~ ws (per-service workspace volumes: the
migration must keep every placement's work, host-src checkouts included); `own-host-environment` (must) has to be
shown for `devbox:host`, `host-src` and `volume` before A14 can be decided (a draft step, next round). B9 can serve
as its dev-box variant for single packages.

**Earlier leader A10 (round 4 before the checks)** (root-only machine manifest with a computed dev view):
- Service repos follow one envelope: `docker/Dockerfile` (`dev` and `release` stages), `docker/deps.repos` (loose
  declarations; pip services their `requirements*.txt`), `compose.service.yaml` (the service alone, other services
  only as variables), a `.devcontainer` fragment. Nothing names a machine, customer or other service (M11).
- The machine repo is the only root: `machine.yaml` (services by repo and version, base), `variants/<customer>/`
  (a layer with only that customer's differences: configuration first, versions and base where needed, M8) and a
  generated lock per variant (`flexcompose lock <customer>`: `vcs export --exact` of each service's declarations,
  with a clash check across services).
- The release builds each service from its git context at the locked commit with its own recipe, the locked
  dependency set passed in as a named context (N20b, M4, rsd).
- The dev box is computed by FlexCompose from the same definition plus an untracked `flexcompose.work.yaml`
  (`go.work` style: `app: ../path`): each listed service becomes a `build:` from that path (target `dev`) with its
  own workspace volume and `.devcontainer/<svc>/`; the others run as images at the variant's lock (M1, M6, M7, M10).
- M4: the recipe and the declarations live in the service; the lock is the root's resolution of them, as
  `Cargo.lock` at a workspace root. The user said the pins differ for release and dev anyway (round 4). Scored ✓
  on that reading, which question 1 confirms; on the stricter reading it is ~ M4, as A9.
- `work-survives` (must): per-service workspace volumes replace the frozen `source_workspace`; the first service keeps
  the existing volume, so existing boxes keep their work. A design constraint, not a failure.
- M12 (should, round 4): with no work file a dev box is one command (`flexcompose generate`, every service as an
  image); to work on a service from source, its best variant replaces the hand-written work file with a flag
  (`generate --source app`, remembered in the header, B5) that also clones the service repo at the variant's locked
  version into the workspace if it isn't there (as `bootstrap.sh` does today). Scored ✓ on that variant.

**Rejection records** (round 4):
- **A9** ~ M4 (should, the gap the user weighs least): the exact pins sit in the machine repo; it has no dev-view or
  envelope rule, so M11 and M7 rest on axis B choices made separately; ~ M12: the dev box needs the hand-run
  bootstrap and lock steps per service (no computed view). Leader's cells: A10 ✓ (?) M4; A10 is A9 plus
  the root-only rule, the computed dev view and the envelope.
- **A3** ✗ M11 (should, verified): the app's code repo holds the machine's integration, so it references the other
  services, the reverse dependency the user named. Leader's cells: A10 ✓ M11.
- **A2** ~ M2, ~ M8 (unchanged from round 2: versions per customer are back).
- **A1**, **A7**: as round 2 (~ M3 M4; ~ M2 M3 M4).
- **A11** (publish, don't build: each service's CI publishes images, the machine collects digests; also the
  self-describing image and the Drug Master File dossier): ✗ N20b as worded (registry images; digest pins meet its
  reason), ~ rsd (the release collects instead of building from the machine's definition); needs service CI and a
  registry. Leader's cells: A10 ✓ N20b, rsd.
- **A1**, **A7** ~ M12 as A9 (per-service bootstrap by hand). **A12**, **A13** ~ M12: a registry login, or a feature
  selection to write, before the first box.
- **A12** (services publish their Compose fragment as an OCI artifact; `include: oci://`): ~ M3 (a runtime fragment
  in a registry and a dev fragment in the repo: two places), ~ N20b (fragments from a registry). A10 keeps the
  fragment in the repo (`compose.service.yaml`) and reads it at the locked commit.
- **A13** (one 150% template with presence conditions and a feature selection per customer; also an intent file
  resolved into a lock): ~ M3 (the superset grows with every customer), ~ M4 (service knowledge creeps into the
  superset), ~ N11 (a rule language). Leader's cells: A10 ✓ M3, M4.
- Variants recorded: git notes mapping commits to digests (~ M3: an unusual place to look); remote Bake definitions
  (a build mechanism A10 can use for its release step; `plain-compose` holds); Dev Container Features per service
  (A10's `.devcontainer` fragment, as an OCI feature if wanted); stubs for missing services ("machine minus one":
  a rosbag or mock inference fills a gap, for PCs without a GPU, M1).

**Harms of A10, a few steps ahead:**
- FlexCompose grows: a manifest schema, the work file, the computed dev view, per-service volumes and devcontainers,
  the lock command and clash check. This is the largest FlexCompose change of all options (a tie-break cost, and a
  split into steps).
- Locks multiply with customers; a shared fix is one change in `machine.yaml` plus a re-lock per variant (scripted).
- The envelope must be adopted by every service repo, including another team's (inference): it gains
  `compose.service.yaml` and a `release` stage name, or the machine maps its recipe (`dockerfile:`, `target:`).
- Two windows for two source-built services (M10 as accepted).
- The untracked work file is invisible in git: `flexcompose` must print which services run from source.

**Reversibility:** A10 costly (FlexCompose features, every service repo's envelope, the starter); its parts can come
one by one (envelope and root lock first, the computed dev view later). Not one-way: outputs stay plain Compose.

**Draft:** `tmp/machine-repo-layout-drafts/draft-a10/` (README with walkthroughs of a release, a dev box with one and two
source services, a lock with a clash, a shared fix; the envelope; `machine.yaml`; a customer layer; the work file).
Not run.

**Round 5** (M4 could; M13, M14 added; M11 reworded; M12 below M14). The dev-box switch of A14, drafted
(`tmp/machine-repo-layout-drafts/draft-a14/`), in two variants:
- **A14-flag**: `generate --source <svc>` (header-remembered) writes that service as a source service into the one
  generated file, with its own workspace and devcontainer, cloning it if absent. FlexCompose gains a CLI option,
  header state, a clone step and per-service workspace names.
- **A14-gen**: no option: every `workspace: true` service (several allowed) always gets `compose.source-<svc>.yaml`
  (the dev-box target fragment for that service only) and `.devcontainer/<svc>/`; a developer picks a service in
  VS Code's config picker. FlexCompose gains per-service workspace names and N small output files.
Both: the first workspace service keeps every name it has today (`source_workspace`, `./workspaces`, `.` at `src/`),
new services get `<svc>_source_workspace`, `./workspaces-<svc>`, `./<svc-repo>` at `src/`, so `work-survives` and
`own-host-environment` (musts) hold for every placement (the draft's table); "first" needs a rule that doesn't move
when a service is added before it (an explicit name per service from the start).

| Option | M2 | M3 | M4 | M6 | M7 | M10 | M11 | M12 | M13 | M14 | ws | ohe | rsd | N22 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *priority, verified* | should | should | could | should | should | could | should | should (below M14) | should | should (above M12) | must | must | should | should | |
| A14-gen | ✓ | ✓ | ~ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ✓ (given a naming rule) | ~ | ✓ | ✓ | ~ M6 M13 M14 ohe; ~ M4 M10 (coulds) |
| A14-flag | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ~ | ✓ (given a naming rule) | ✓ | ✓ | ✓ | ~ M13 (version twice; base only with sibling F2) M14; ~ M4 (could) |
| A10 | ✓ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ (heaviest) | ✓ (given a naming rule) | ✓ | ✓ | ~ | ~ M3 M14 N22; ✓ M13 (one manifest entry per service) |
| A0b | ✗ | ✓ | ✓ | ~ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ M2 M7; ~ M6 |
| A8 | ✗ | ✓ | ✓ | ~ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ M2 M7 (until it stops waiting) |

`ohe` = `own-host-environment` (must, V1). M1, M5, M8, rest as round 4 (✓ for the A14 variants).
- **Round-5 checks.** Rejection check (Dev Containers CLI source, `dockerCompose.ts`): a window finds its container
  by project and service labels only and reuses a running one; `up -d --no-recreate` for a stopped one; recreation
  only on Rebuild. So A14-gen ~ M6: switching which service runs from source needs a Rebuild that recreates the
  others; ~ M10 for the same reason; ~ ohe: its commands didn't show the placement choice. "Tied" was inconsistent:
  A14-flag leads. M13: today FlexCompose derives `BASE_IMAGE` from the template (design §13), the base written once;
  the duplicate comes with the sibling's F2, not with A14 (A0b, A8 ✓ M13). Unscored M13 cost: a service's version
  written twice (its `image:` tag and its `build:` git ref, and again in a customer layer), which A10's one manifest
  entry avoids. `ws` holds given a naming rule (an extra rule against M14). A10 ✗ M14 → ~ (a matter of degree).
  Bias check: per-service workspaces need parameterized target fragments (the fragments hardcode `source_workspace`
  and `.` at `src/`), A14's main M14 cost; A14-gen is a multi-output generator (N+1 Compose files and N
  devcontainers, each with header and hash checks); snapshot locks taken after the build are records, not inputs: a
  rebuild of an old release resolves anew (`release-same-definition`, N20b), so the lock must be the build's input,
  as `release.repos` is today. Options added: **A14-prof** (one generated file: `app` as an image and `app-src` from
  source in a profile with alias `app`; the developer's profile picks; M10 by two profiles), **subpath workspaces**
  (one `source_workspace` volume, a `volume.subpath` per service: no new names, no "first" rule; one `down -v` loses
  both), **devcontainers hand-written** in the starter (as today) rather than generated, **clone in `bootstrap.sh`**
  rather than in FlexCompose. M12 has no reason and doesn't separate the variants; M13 as worded forbids every
  default (`ARG BASE_IMAGE` default plus the machine's value); M14 reads best as "cheap to learn, test and document".
- **A14-flag, corrected:** the clone stays in `bootstrap.sh` (it already runs `vcs import` on every open); the
  `.devcontainer/<svc>/` configs are hand-written in the starter, each with `initializeCommand: flexcompose
  regenerate`; the lock per variant is written before the build and fed in as its input (committed with the tag).
  Its FlexCompose cost: the `--source` option and header state, and parameterized workspace fragments (or subpaths).
- **M13 ~ for every option that writes the base twice** (template `image:` and the build's `BASE_IMAGE`, the
  sibling's F2): equal values in two places while the build stage keeps the dev box's base. Question 1.
- **A14-gen vs A14-flag**: tied on the shoulds (both ~ M13, ~ M14). A14-gen adds no option or state (M14 lighter)
  but ~ M10 (could): two devcontainer windows with different Compose file lists recreate each other's services
  (one project), unless a combined config per pair is written. A14-flag meets M10 with `--source a --source b`.
- **A10** ✗ M14 (should): a manifest schema, a work file, a computed view, a lock command and a clash check.
- **A0b, A8** ✓ M14 (nothing changes), but ✗ M2, ✗ M7 (one shared `src/`).
- **B9** (editable overlay) fits either variant as the content of a source service (mount the edited packages over
  the image's underlay); not scored separately.

**Round 6** (drafts and spikes: `tmp/machine-repo-layout-drafts/draft-round6.md`, `spike-profiles/`,
`spike-subpath/`). Three cheaper ideas against A14-flag:

| Option | M1 | M6 | M7 | M10 | M12 | M13 | M14 | ws | ohe | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|
| *priority, verified* | must | should | should | could | should (below M14) | should | should (above M12) | must | must | |
| A14-flag + subpath workspaces | ✓ | ✓ (a Rebuild to switch) | ~ | ✓ | ✓ | ✓ (version twice accepted) | ~ (option, state, per-service mount parameters, a one-shot init service) | ✓ (given a root-owner rule) | ✓ (not yet shown for host-src) | ~ M7 M14 |
| A14-flag + per-service volumes | ✓ | ✓ (a Rebuild to switch) | ✓ | ✓ | ✓ | ✓ | ~ (option, state, per-service mount parameters, a naming rule) | ✓ (given the rule) | ✓ (not yet shown for host-src) | ~ M14 |
| A14-prof | ✓ | ~ | ✓ | ✓ | ~ | ~ | ~ | ✓ | ✓ | ~ M6 M12 M13 M14 |
| A14-all | ✓ | ~ ("as images" as worded) | ✓ | ✓ | ✓ | ✓ | ~ (lighter: no option or state; the workspace cost stays) | ✓ | ✓ | ~ M6 M14 (lighter) |
| A14-gen | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ~ | ~ M6 M14 ohe; ~ M10 (could) |

- **A14-prof** ~ M6, ~ M12: switching a service's profile leaves the other variant running (verified: also with
  `--remove-orphans`), so with `network_mode: host` a switch needs a manual `docker compose stop`; the profile
  choice is a per-developer file or variable. ~ M13: each source-capable service is written twice (image and
  source entries). ~ M14: FlexCompose writes both entries per service. Leader's cells: A14-flag ✓ M6, M12, M13.
- **A14-all** ~ M6 (as worded: the others don't run as images), ~ M12 (onboarding: every service cloned and its
  dev image built, inference's CUDA image too), ~ M1 (inference from source needs a GPU on every developer's PC).
  It has no switch, so no Dev Containers reuse gap, and the lightest FlexCompose change. Leader's cells: A14-flag ✓
  M1, M6, M12. Wins if developers usually work on every service.
- **Subpath workspaces** (verified: a named volume's subfolder mounts per service, once the subfolder exists): no
  new volume declaration and no naming rule, so `work-survives` holds without the rule, and the fragments stay
  closer to today's (one volume, a subpath per extra service); costs an init step that creates the subfolder, and
  the other services' work sits in the app's volume (`down -v` loses all, as today for the one workspace). Better
  on M14 than per-service volumes: leader A14-flag + subpath workspaces (before the checks).
- **Round-6 checks.** Both: subpath workspaces put the other services' folders inside the app's colcon workspace
  root in every placement (volume: `workspaces/<svc>`; host: `./workspaces/<svc>`; host-src: under the machine repo
  that `bootstrap.sh` clones into), and `colcon build` / `rosdep --from-paths` scan it: ~ M7 unless a
  `COLCON_IGNORE` folder holds them (one more rule); the root-owner choice is the same naming rule per-service
  volumes need; the init step can't be the app's `post_start` (it runs after inference's mount): a one-shot init
  service. So subpaths are no better than a volume per new service. A14-all's ~ M1 and ~ M12 were stretched (the
  inference image needs a GPU anyway; building is not a command; switching needs zero commands, where A14-flag needs
  a Rebuild); only ~ M6 ("the others as images", no stated reason of its own) remains, against A14-flag's heavier
  ~ M14. A14-flag also needs a Rebuild to switch (Dev Containers reuse by label). A14-prof dropped (the same idea as
  A14-gen, done worse). Bias check: **"from source" per service kind**: a colcon service needs a workspace; a
  Python service (inference) only a bind mount of its checkout over the image's package (`pip install -e`,
  `PYTHONPATH`): no volume, subpath or init step; the second colcon service's workspace can wait until one exists
  (A8 for this sub-question). FlexCompose writes no devcontainer today: A14-flag's "writes one devcontainer" would be
  a new output kind (the starter's hand-written configs avoid it). A14-gen's ~ M10 may not hold with
  `runServices: [<svc>]` (unverified); its ~ M6 stands.
- **After the round-6 answers:** A14-default: the template gives each source-capable service a default (from source
  or as an image; light services from source, heavy ones as images); `generate --source <svc>` / `--image <svc>`
  overrides it per developer (remembered in the header); Python services from source as a bind mount, colcon
  services with today's workspace; a second colcon service's workspace decided when one comes. It meets M6 as
  reworded; M14: one template key and one override option. Leading, pending the remark (round 7).
- **Before the answers:** A14-flag and A14-all tie on requirements (~ M14 heavier vs ~ M6 as worded); question 1 decides. Either
  way: "from source" per service kind; one workspace (today's) for the one colcon service; a volume per further
  colcon service when it comes, named explicitly (not by template order).

**Round 7: the colleague's resolver** (`nl-cboost-ros-tools/tools`, `deps-resolve`, run as `cdr`; README and
`resolver.py`/`repos_file.py` read, 42 tests present, not run by me; not used in PolyMX's `bootstrap.sh` yet):
- A team convention already exists: every repo pins its *direct* source dependencies in its own
  `dependencies.repos` (a commit, a release branch, or `main`); a project's own `dependencies.repos` is the
  top-level file. This is A9/A14's "loose declarations in the service", already the house rule (M2, M11, M13).
- `cdr` resolves the tree recursively (each dependency at the commit its owner pinned), identifies repos by URL,
  stops on a repo pinned at two commits naming both owners, and lets only the top-level file override (`override:
  true`): the root-only rule of A10, without FlexCompose. `--strict` refuses branch pins for release and CI.
- Locks: `vcs export --exact-with-tags src > lock.repos`, committed by the project that ships, and every build of
  that version starts from it (`vcs import --input lock.repos`): the lock is the build's input (round-5 finding).
- Effects: open point 5 (dependencies of dependencies, the `packml_ros2` clash) is solved by an existing tool;
  A14-default's lock needs no FlexCompose feature (M14); the machine repo's `dev.repos`/`release.repos` copies go
  (M13). The machine repo can be the top-level: its own `dependencies.repos` names the service repos, and a customer
  variant is a top-level file with overrides (M8) and its own committed lock. The dev box's `bootstrap.sh` runs
  `cdr` instead of `vcs import`. Not covered: pip dependencies (inference; open point 6). Open: whether the machine
  or the app repo is the top-level file, and one top-level file per customer variant or overrides in a layer.

**Round 7: templates drafted** (`tmp/machine-repo-layout-drafts/templates/`: A2, A14-default, A14-all; each a
machine repo as `cdr`'s top level, a colcon service repo, a Python service repo, with READMEs; not run). Found: a
`merge-repos` step for customer overrides (cdr reads one top-level file); a `lock-ref` step for the app's commit;
the app's `COPY --from=lock` needs a default when built alone; A14-default's FlexCompose additions (`source:`,
`source_mount:`, `--source`/`--image`, a generated list for `bootstrap.sh`); A14-all's release needs `!reset`
through FlexCompose (unverified); Python from source in `devbox:volume` unsolved in all three (open point 1).

**Round 7: proposed split** into A-1 (pins and locks), A-2 (where a service's recipe lives), A-3 (which services
run from source in the dev box), A-4 (customer variants and tagging), A-5 (the app's base image: the sibling).
**A-1 settled for now (user, 2026-10-28):** colcon services follow `cdr`'s convention (each repo declares its direct
dependencies in `dependencies.repos`; the machine repo is the top level; a committed `lock.repos` per release is the
build's input); Python services are built with their own Dockerfile and pin their pip dependencies there, so the
machine locks only their commit (open point 6 sidestepped).

**A-2 decided (user, 2026-10-28): a service's build recipe lives in the service's repo** (the A14 family; A2
and A0 out). Consequences: the app's `Dockerfile` moves from the machine repo to the app repo (stages `dev` and
`release`, reading the lock as its input); the machine repo loses `Dockerfile`, `dev.repos`, `release.repos`; every
service is built from its git context at its version, with `build:` written by the author and passed on as written,
which needs the sibling's plan step 1 (FlexCompose adds nothing to `build:`, N22); A-5 (the app's base image) is
unpaused: `BASE_IMAGE` set in the machine repo (derived, two literals, or `.env`: the sibling's choice under M13).
Remaining: A-3 (for now: `workspace: true` for the app, every other service as an image from its git context;
`workspace: <path>` with per-service volumes when a second colcon service needs it), A-4 (customer variants, tagging).

**A-3 agreed (user, 2026-10-28):** for now the app is the one workspace service (`workspace: true`, as today);
every other service (inference, a future driver) runs as an image built from its git context; `workspace: <path>`
with a volume per service (the app keeps `source_workspace`; nested paths need a `COLCON_IGNORE` marker or are
refused) is a later decision, made when a second colcon service must run from source. No FlexCompose change for the
dev box now. Room kept for a second colcon workspace (2026-10-28): (1) `workspace: true` keeps its names (the
volume `source_workspace`, `.` at `src/`), so a later `workspace: <path>` for a new service is an addition that moves
no one's work; (2) a service that runs as an image is not listed in the machine's `dependencies.repos` (else `cdr`
clones it into the app's `src/` and the app's colcon builds it): its pin is its `build:` ref until it becomes a
workspace service; (3) FlexCompose today requires at least one workspace service (`output.go:33`) but doesn't refuse
two, which would silently share one volume and one `src/`: a guard that refuses a second until per-service
workspaces exist keeps that failure loud (a candidate plan step); (4) the later step decides: `workspace: <path>`
and its meaning per placement, the volume name per service, nested paths (`COLCON_IGNORE` or refused), `cdr` per
workspace with a cross-service check for shared interface packages, a devcontainer per workspace service.
**A-4 decided (user, 2026-10-28):** customer variants are branches of the machine repo (C6); main carries the
default configuration and the base release tag (`v1.2.0`); a customer that needs special configuration gets a
feature tag or a customer-specific tag on its branch. Its known cost (M8's reason, "shared fixes once"): a fix for
all customers is merged into every customer branch, acceptable while customers or configurations are few (user,
round 3); a customer branch should differ from main only in its overrides and configuration. To check in the plan:
the image tag is derived from the git tag (`release.sh`), so a customer tag must yield a distinct image tag (e.g.
`customer-a-1.2.0`), or two customers' images collide under one name.

## Earlier rounds' matrices and evaluation (axis B and C still current)

Axis B, round 2 (first scoring). `ws` = `work-survives` (must, V1: a developer's work in the workspace is never lost
by what FlexCompose writes); N11 (sibling: few concepts to learn, one way of working, should, verified). B5 is a
sub-choice that combines with B2/B3 (scored separately below the table).

| Option | M1 | M6 | M7 | ws | pc | N11 | ✗ or ~ |
|---|---|---|---|---|---|---|---|
| *priority, verified* | must, yes | should, yes | should, yes | must, V1 | must, V1 | should, yes | |
| B2+B3 | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ ws (migration of the frozen `source_workspace` name); ✓ M10 (could) |
| B3 alone | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ M7 (one workspace volume shared by the containers) |
| B2 alone | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ ws; ~ M10 (could: attach to the second container) |
| B1 | ✓ | ~ | ✗ | ✓ | ✓ | ✓ | ✗ M7; ~ M6 |
| B4 | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ~ N11 (packaging, a private apt repo and an offline mirror) |
| B8 | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ M7 (only released dependencies) |
| B7 | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ~ N11 (a dev box per service repo; `include:` of the machine's file per customer variant, M8) |
| B6 | ✓ | ✓ | ? | ✓ | ✓ | ~ | ~ N11 (one more tool) |

B5, how the service to run from source is chosen: M6 says "whichever service a developer works on", a personal choice.
A committed field makes one developer's choice everyone's; a `generate --source <svc>` flag (remembered in the
generated file's header, as FlexCompose's other choices: design §6) and a local uncommitted overlay both keep it
personal. The flag fits FlexCompose's existing way of working (N11); the overlay adds a file kind.

## Evaluation
**Round 2.** M8 (customer variants in one machine repo; service versions, configuration and base differ per customer)
moves A3 and A2 down:
- A3 ~ M8: the app repo is the machine repo, so a customer on another app version is a variant that pins the repo it
  lives in; and customer configuration sits next to the app's code, which M8 asks to keep apart.
- A2 ~ M8: the app's recipe sits in the machine repo, one per machine, while customers run different app versions;
  scenario: app v2 changes its build steps, customer X stays on v1, and one `services/app/Dockerfile` has to build
  both (or per-version copies appear).
- A7 and A1 version the recipe with the service (it sits in the service repo) and keep every customer's pins and base
  in the machine repo: ✓ M8.

**Round-2 checks.** Bias check: A9 added (loose declarations in the service, an exact lock per customer in the
machine); M7's conflict is one shared package at two versions, and it exists today (`nl-cboost-machine-state-manager/
dependencies.repos` pins `packml_ros2` at `feature/packml-2022`, the machine at `dev/heartbeat-recovery`: verified;
colcon refuses one package twice in a workspace); M6's "others as images" are built locally from their pinned git
context (sibling, `pull_policy: build`), no CI needed; M1 on a PC without a GPU (inference needs CUDA 12.8) may need
a stub (noted, not asked); no option said how customer variants are expressed (axis C added); model files are pinned
by the inference repo's commit. Rejection check: A7 ✓ M3 and ✓ M2 were optimistic (a standalone build needs a
default pin file in the service repo, a second level; inference keeps its pins in its repo unless another team moves
them): A7 ~ M2 M3 M4, below A1; `one-version` may only break a tie; `ir` scored under N21; A3's ~ M8 rests on its
first scenario only; A5's ✗ N20b rests on the wording (a digest pin meets the reason); several Options rows
contradicted the matrix (rows corrected); B2 alone meets M6 when the devcontainer's service is generated from the
`--source` choice; B7's variant choice is a cost the leader shares.

**Leader A9** (each service repo holds its recipe and declares its dependencies loosely; the machine repo locks them,
per customer variant): its only ~ is M4 (the exact versions sit in the machine repo, the declarations and recipe in
the service). One exact pin level (M3); a service builds alone from its declarations (M5); inference fits as it is
(ranges in `requirements*.txt`, locked by its commit). A per-service or per-machine lock is open (question 1).
**Runner-up A1** (exact pins in the service repo): ~ M3 (two levels), ~ M4 (build options in the machine repo).

**Earlier leader A7, round 2 before the checks (superseded by A9)** (the recipe in the service repo, every dependency pin in the machine repo, per customer variant): its
only ~ is M4, the service's build split between its recipe (service repo) and its pins (machine repo). It keeps one
pin level (M3) and one version set per machine, which also covers the `one-version` gap. **Runner-up A1** (pins in the
service repo too): ✓ M4 for the pins but ~ M3 (two pin levels, three PRs for a cross-cutting fix) and ~ M4 for its
build options; carries the `one-version` risk.

**Rejection records** (round 2):
- **A7** (round-2 checks) ~ M2: inference's pins stay in its repo unless another team moves them, so ROS and
  Python services are pinned in different places; ~ M3: a standalone build needs a default pin file in the service
  repo, a second copy; ~ M4: the pins away from the recipe. Leader's cells: A9 ✓ M2, M3, ~ M4.
- **A1** ~ M3 (should): two pin levels; scenario: an orchestrator fix needs a PR in the orchestrator, a bump in the
  app's `dependencies.repos`, and an app pin bump per customer variant in the machine repo. ~ M4: its build options
  (`target`, `ssh`, `BASE_IMAGE`, `command`) sit in the machine repo (rejection check, round 1). Leader's cells: A7 ✓
  M4 shared; A9 ✓ M3. Wins if the exact pins should travel with the service (question 1).
- **A2** ~ M2 (should): a program's recipe stays in its own repo while the app's sits in `services/app/`; ~ M8
  (should): one recipe per machine for several app versions (scenario above). Leader's cells: A7 ✓ M2, M8.
- **A3** ~ M8 (should): a customer variant on another app version pins the repo it lives in (a `variants/` folder
  keeps configuration apart, so only this scenario counts: rejection check); ~ ir (should, V1): the app repo holds code and integration. Leader's cells:
  A7 ✓ M8, ir.
- **A1b** as A1, plus a FlexCompose `include:` resolver (tie-break).
- **A0b** ✗ M2: the app built centrally, programs from their repos. ~ M8: the app's recipe in the machine repo, as
  A2. Leader's cells: A7 ✓ M2, M8.
- **A8** ✗ M2, ~ M8 as A0b while it waits; its gain, no work now, is no requirement (tie-break).
- **A0** ✗ M2, ~ M8 as A0b; ~ M3: the app's dependency list exists twice and differs (one stale file, verified).
- **A4** ✗ ir (should, reason verified): shared packages can't move into one machine's repo; ~ M2: other teams'
  services stay outside; ~ M8: customer variants sit in the monorepo next to all code.
- **A5** ✗ N20b as worded (registry images; a digest-pinned variant defeats its reason); ~ rsd: each service's CI
  builds on its own base.
- **A6** ✗ N15b (could); ~ M4: a service's build split between the shared builder and its metadata.
- **B3 alone** ~ M7: one dev container per service, but FlexCompose mounts the same `source_workspace` volume and
  `src/` into every workspace service (`devbox-host-src` fragment), so their checkouts still share one folder.
  Leader's cells: B2+B3 ✓ M7.
- **B2 alone** (round-2 check) meets M6 once the devcontainer's `service` is generated from the `--source` choice
  (`initializeCommand` already regenerates); it lacks opening two source-built services at once in VS Code, which no
  requirement covered until M10 (could, round 2): ~ M10 with VS Code's "Attach to Running Container" on the second
  service (no bootstrap, no committed settings; round-3 check). B2+B3 leads by that could; a window per service is
  no requirement (tie-break, and B2 alone needs it for M10 too).
- **B1** ✗ M7: one `src/` for all source-built services; ~ M6: only `workspace: true` services run from source.
- **B4** ~ N11: dependencies released as apt packages through bloom and a private rosdistro, with an offline mirror:
  a packaging process to learn and run. Comes back if dependency versions should be released independently.
- **B8** ~ M7: an underlay image holds only released dependencies; one being changed is still a source checkout.
- **B7** ~ N11: each service repo gets its own dev box that pulls in the machine's file, a second place to start a
  dev box from (the per-developer variant choice is shared with the leader).
- **B6** ~ N11: a dev-loop tool beside FlexCompose; ? M7: depends on how it mounts sources.

**Leader B2+B3** (each source-built service gets its own workspace volume and its own `.devcontainer/<svc>/`, all on
one Compose stack with the other services as images; the service is chosen per developer with a `generate --source`
flag, B5). ~ ws: the workspace volume's name `source_workspace` is frozen today (design §4, §7: existing boxes keep
their work); a per-service name needs a migration that keeps the existing volume for the first service.

**Harms of A7 (round 2, superseded; most apply to A9's lock as well):**
- The service's recipe at a version must accept the pins the machine passes in: an app version that needs a new
  dependency also needs the machine's pins updated for every customer variant on that version.
- Two services pinned to one version set: a service that needs another version of a shared package can't (the other
  side of `one-version`).
- The recipe reads its pins from outside (`additional_contexts` or a build arg): building a service on its own (its
  repo's CI, M5) needs a default pin file in the service repo, a second copy that can drift.
- Per-customer variants multiply the pins: a shared fix is a bump in every variant (a shared base set per machine
  with per-customer overrides limits this).
- Programs still need FlexCompose to pass `build:` as written (sibling, F2's step 1).

**Harms of B2+B3:**
- Migration of the frozen volume name (`work-survives`, must): a box created before the change must keep its work.
- One VS Code window per source-built service; `shutdownAction: none` so closing one doesn't stop the stack.
- Two source-built services need their dependency checkouts twice (each its own workspace), more disk and builds.

**Reversibility:** A1, A2, A3, A7 costly (files move between repos, habits, the starter); A4 costly to one-way; A0b,
A8 cheap. B2+B3 costly (a FlexCompose schema and volume change, `work-survives`); B5's flag cheap. None one-way at the
format level: the generated Compose files stay plain.

**Draft and stress test:** `draft-a1/` (round 1) holds A1's files; A7's draft is the same machine repo plus a
`pins/app.repos` per customer variant passed to the app's Dockerfile as a named context (`additional_contexts:
{pins: ./variants/<customer>/}`), and the app repo's Dockerfile reading `vcs import < /pins/app.repos`. Not written
or run this round (question 1 may change the leader); the named context from a local folder is standard Compose
(`additional_contexts`, sibling round 5 sources).

**Round 3, axis C** (requirements: M8, its reason "shared fixes once", M3, `rsd`, `release-differences-explicit`
(should, V1), `pc`, sibling N11 and N22):

| Option | M8 | M3 | rsd | rde | pc | N11 | N22 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|
| *priority, verified* | should, yes | should, yes | should, V1 | should, V1 | must, V1 | should, yes | should, yes | |
| C2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | none |
| C3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | none as worded; rsd's reason (drift) favours C2 |
| C1 | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ M8 |
| C4 | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ N11 |
| C5 | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ M8 |
| C8 | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ M8 |
| C6 | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ M8 (its reason: shared fixes once) |
| C7 | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ N11 |

- **C3** meets rsd as worded: a release-only layer is an explicit difference (`release-differences-explicit`), as
  `flexcompose.release.yaml` is today (round-3 check). C2 leads on rsd's reason: a customer's configuration (a
  parameter, a base or GPU feature for other hardware) is first run on the machine; and a plain layer can't switch
  FlexCompose features. Wins if dev boxes never need a customer's variant (question 1); "no FlexCompose change" is a
  tie-break.
- **C1** ~ M8: only versions differ per customer; configuration and base have no place.
- **C4** ~ N11: a FlexCompose target per customer is a tool change per customer (a variant with targets defined in
  the template converges on C2).
- **C5** ~ M8: profiles select services; a profile per customer with customer-specific services (`app-custA`)
  duplicates each service per customer, so a shared fix is made per copy.
- **C8** ~ M8: variables can't add services, devices or features, so structural customer differences have no place.
- **C6** ~ M8 on its reason (shared fixes once): a shared fix is merged into every branch; C2 carries a smaller form
  (a layer that overrides a key doesn't get the shared fix for that key): a difference of degree.
- **C7** ~ N11: a rule language to resolve the variants.
- N22 (FlexCompose adds nothing to `build:`) holds for C2: the layer is the author's own text, merged as the
  release override is today.

**Harms of C2:** a FlexCompose option and merge for every target (tests, docs); the variant chosen at `generate` must
be visible (the header) so a developer knows which customer's box they run; the shared files and each layer must stay
consistent (a shared fix that a layer overrides doesn't reach that customer: the layer's keys must be few).
**Reversibility:** C2 costly (a FlexCompose feature, the starter); C3 cheap and a subset of C2 (C2 can be added later).

**Round 4 (start, after the round-3 answers).** M8 narrowed to configuration only: every customer runs the same
builds. Effects:
- A9's per-customer lock goes: one lock per machine (M9 then needs nothing more).
- Per-customer tagging mostly goes: the same images for every customer; only configuration built into images
  (question 3's "depends on the config") would need per-customer images.
- Axis C: C2's FlexCompose feature (versions, base, features per customer) is no longer needed. Remaining: C9
  (configuration as data in the bundle or mounted), C3 limited to configuration, C6 (a branch per customer: acceptable
  while customers are few, user), C8 (an env file per customer).
- Axis A rescored: A2's ~ M8 (one recipe for several app versions) and A3's ~ M8 (a variant pinning the repo it
  lives in) both rested on per-customer versions, which are gone: A2 ✓ M8, A3 ✓ M8 (a `variants/` folder keeps
  configuration apart: round-2 check). Now A9 (~ M4), A3 (~ ir, integration in the app repo) and A2 (~ M2) each
  carry one ~ on a should: tied on requirements.
- Tie-breaks so far: A3 has the fewest repos and a cross-cutting fix in two PRs, but with C6 its customer branches
  would be branches of the app's code repo; A9 versions the recipe with the code but needs a lock step; A2 keeps
  everything about the machine in one repo but programs' recipes stay elsewhere.

## Open questions
Round 6 (answered): M6: "as images" depends on the service (a per-service default: light services always from
source, heavy ones as images unless chosen); "from source" per service kind (Python: a bind mount of the checkout
over the image's package; colcon: a workspace); a second colcon service's workspace: decide when one comes (open,
named explicitly). Remark: "could the devbox be placed in a checkout of the app repositories?" (round 7 question 1).
Round 7: the remark explored in chat (a `.devcontainer` in the app repo: self-contained, pointing at the machine, or
at a generic gitignored file); the user: "none of the three cases sound good"; the dev box stays opened from the
machine repo. Overview of the leading options' file trees: `machine-repo-layout.overview.md`.
(Superseded) The remark, two readings: (a) VS Code opens the app's checkout and the dev box config lives outside the app repo
   (the Dev Containers setting "Repository Configuration Paths" keeps configs in a separate folder; its format is
   undocumented: unverified, needs a spike); (b) the machine repo's files live in the app checkout (M11 ✗, as A3).
   Which is meant?
Round 5 (answered): M13 reworded (overrides are fine, copies are not, dev and release may differ): the base
derived from the template (today) meets it, the sibling's F2 (two literals) doesn't; a service's version as two
literals, accepted; M12's reasons: onboarding, switching often, fewer mistakes; remark: asked what the Dev
Containers gap is (explained in chat).
Next round (6): draft A14-prof and subpath workspaces against A14-flag; carry the base-image consequence to the
sibling (`machine-release-programs.md`, paused).
Round 4 (answered): M4 → could, its core is M13 (no duplicated build configuration, should); M11 reworded (yes);
M12 ranked by commands, below M14 (FlexCompose stays simple); remark: drafts moved to `tmp/` in the notes.
Round 3 (answered): customer variants are configuration only (M8); tagging not decided (mostly moot now); config
mounted or built in depends on the config; remark: a branch per customer may be acceptable while customers or
configurations are few.
Round 2 (asked at the end of the round):
1. (answered: whichever is simpler, keep options open: M9) Versions of a shared package across a machine's services: today the state manager wants `packml_ros2` at
   `feature/packml-2022`, the app at `dev/heartbeat-recovery` (verified). Each service is its own image, so a release
   can hold both; ROS interfaces between them must still match. One lock per machine, a lock per service, or exact
   pins in each service repo (A1)? Decides A9's lock and A9 vs A1; tells what M7 means.
2. (answered: fewer repos, shared fixes once) M8's place: why one machine repo with variants rather than a repo per customer (reason for the preference)?
3. (answered: one at a time or both at once; both at once is a could: M10) B5: is the choice of which service runs from source personal (uncommitted) or shared; and must two source-built
   services be open at once (B3)?
Round 1 (answered): `one-version` not sure (now question 1, concrete); customer variants (M8); axis B kept here;
`plain-compose` read too broadly. Not asked: M1 on a PC without a GPU (a stub?); ONNX models as IP (sibling).

## Drafts (copied from the session scratchpad, which does not survive the session)
`tmp/machine-repo-layout-drafts/draft-a1/` (round 1): machine repo `flexcompose.yaml` (app as workspace service, inference by git context),
`flexcompose.release.yaml` (the app's build from its repo at a commit, `BASE_IMAGE` passed from the machine),
`dev.repos` (service repos only); app repo `Dockerfile` (imports its own `dependencies.repos`). Walkthrough: release
builds every service from its git context; dev box needs a two-pass import; a base bump stays in the machine repo; a
cross-cutting fix takes three PRs (A0: two).

## Sources
| Claim | Source | Date | Reliability |
|---|---|---|---|
| Every `workspace: true` service gets the same `source_workspace` volume and `src/` mount | `flexcompose-cli/fragments/targets/devbox-host-src/compose.yaml`, `template.go:21` (generator 3) | 2026-10-28 | high (code), not rechecked by me |
| The app's pins exist twice and differ | `-application/dependencies.repos` vs `nl-polymx-automated-qc/dev.repos` (read by me) | 2026-10-28 | high |
| Devbox targets drop `build:` only from workspace services | `output.go:46-55` (generator 3; sibling log) | 2026-10-28 | high |
| A git URL build context with a private repo works through the SSH agent | sibling spike, round 9 | 2026-10-27 | high on Linux |
| Compose `include:` refuses overriding an included service's resources | docs.docker.com/compose/how-tos/multiple-compose-files/include (generators 1, 3) | 2026-10-28 | medium (docs via the generators) |
| vcstool has no recursive import | generator 3, vcstool docs | 2026-10-28 | medium, unverified by me |

## Round checklist
Checklist (round 6):
- [x] Log (first round): n/a
- [x] Problem and success criteria (first round): n/a
- [x] Scope: unchanged
- [x] Requirements: M12's reasons; M13 reworded (round-5 answers)
- [x] Replaced requirements: n/a (M13 reworded in place)
- [x] Written requirements: n/a: none new
- [x] Deciding unverified requirements: none left; A14-all vs A14-flag asked as a working pattern
- [x] Options: A14-prof, A14-all, subpath workspaces drafted
- [x] Searches: no web search; two spikes (profiles, subpath)
- [x] Deciding claims: profile switch leaves the other running (spike); subpath mounts need an existing folder (spike)
- [x] Matrix: round 6 table
- [x] Rejection records: A14-prof, A14-all, A14-gen, per-service volumes
- [x] Harms: subpath's shared volume and init step; A14-prof's port clash
- [x] Reversibility: workspace layout costly to change later (work-survives): said in the report
- [x] Draft and stress test: `draft-round6.md` and the two spikes
- [x] Bias check: subpath nesting (M7), init coupling, Windows unverified; per-kind source; A14-flag writes devcontainers (new output); A14-prof dropped
- [x] Rejection check: subpath ws needs the same rule, M7 ~, M14 margin thin, ohe not shown for host-src; A14-all only ~ M6; Rebuild caveat for A14-flag
- [x] Ranking change: subpaths out; A14-flag and A14-all tied (question 1)
- [x] Report: in chat
- [x] Questions: M6's "as images", per-kind source, second colcon workspace later; remarks last
- [x] Pushback: n/a: no pick yet

## Rounds
- Opened 2026-10-28 from the parent's round 10.
- Requirements round (2026-10-28, before round 1): M1's reason; M6 added (any service from source); M3 reworded from
  "fewer repos" to its need; M2's reasons, M7 added (package checkouts conflict); M4 reworded to "defined in one
  place"; M5 has no concrete case. Priorities: M1 must; M2, M3, M4, M6, M7 should (M7 downgraded:
  no second source-built service soon, the option kept open); M5 could. Scope: future machines, PolyMX where
  possible. Success criteria set (three; "adding a service touches only its repo" left out).
- Round 1 (2026-10-28): discovery (3 generators); options split into axis A (where recipes and pins live) and axis
  B (dev box, M6/M7). Axis A before the checks: A1 leading, A2 runner-up. After the checks: A3 (the app repo is
  the machine repo) leading, A2 runner-up, A7 third; A7, A0b, A8 added. Answers: `one-version` not sure (known
  gap); customers may get different images or configurations, kept in the integration repo (M8, follow-up asked);
  axis B stays here; `plain-compose` was read too broadly (B6 trailing, not out).
- Round 2 (2026-10-28): M8 (should): service versions, configuration and base differ per customer, as variants in
  one machine repo. A3 and A2 drop (~ M8); A7 led until the checks; then A9 (bias check) leading, A1 runner-up.
  Axis B scored: B2 alone and B2+B3 tied. Axis C listed.
- Round 3 (2026-10-28): M9 (lock per machine or per service kept open), M10 (two at once, could): B2+B3 leading.
  Axis C scored: C2 (a variant layer per customer, merged by FlexCompose for dev box and release) leading, C3
  (release-only layer, plain Compose) runner-up.
- Round 4 (2026-10-28): M8's narrowing undone by the user (versions may differ per customer); M9 dropped; M4 the
  gap that weighs least; M11 (a service's repo doesn't reference the integration's other services, should); broader
  discovery: A10 (root-only manifest, computed dev view, service envelope); M12 added; after the checks A14
  (A10-lite) leading; B9 (editable overlay, the user's idea) added. Answers: M4 → could, M13 (no duplicated build
  configuration, should); M11 reworded; M12 by number of commands, below M14 (FlexCompose stays simple, should).
  Round 5 rescores with M13, M14 and drafts A14.
- Round 5 (2026-10-28): A14 drafted for every placement (`work-survives`, `own-host-environment` hold); variants
  A14-gen and A14-flag; after the checks A14-flag leads (A14-gen ~ M6: Dev Containers reuse containers by label);
  M13 costs: the version written twice, the base only with the sibling's F2; A14-prof and subpaths added.
  Answers: M13 reworded (overrides fine, copies not); the version as two literals accepted; M12's reasons.
- Round 6 (2026-10-28): A14-prof, A14-all and subpath workspaces drafted and spiked; after the checks subpaths out
  (colcon nesting), A14-prof dropped, A14-flag and A14-all tied; "from source" per service kind added. Answers: M6
  per-service default; per kind yes; second colcon workspace later: A14-default leading.

## Decision
**Confirmed by the user (2026-11-12).** Written after the implementation (FlexCompose de2c8e5, 49a4d2d,
8ad532a; base image 0.3.0); the details and the child decisions are in `machine-starter-template.md` (*Decision*,
review round 8).

**Choice** (A-1..A-5, as they stand):
- A-1 (settled 2026-10-28): every repo declares its direct dependencies in `dependencies.repos` (`cdr`'s
  convention); the integration repo's `dependencies.repos` is the top level, naming the machine's services; a
  committed `lock.repos` (`lock.sh`) is the release's input. Python dependencies outside ROS packages are pinned in
  the service's own Dockerfile.
- A-2 (decided 2026-10-28, changed 2026-10-29 to D2g, back on 2026-11-10): a service's build recipe and its
  FlexCompose settings live in the service's repo (`templates/service/`); the integration repo imports them
  (`flexcompose_options.imports`) and passes its locked tree as the build context `workspace`. Not by `build:`
  from a git context: every service is in the lock and built from its checkout in it.
- A-3 (agreed 2026-10-28, widened 2026-11-10): any service may run from source (`workspace: true` in its own
  template); each such service gets its own box, with its checkout as `src/` and its own volume
  `source_workspace_<service>` (imports), so nesting never arises; the others run as the image their repo builds.
  The integration repo has no workspace service of its own.
- A-4 (decided 2026-10-28): customer variants are branches of the integration repo; a customer branch pins its own
  versions in `dependencies.repos` and tags `v1.2.0+<customer>`, which gives images `1.2.0_<customer>`, so two
  customers' images never collide.
- A-5 (decided: F2): not implemented. FlexCompose still passes the template's `image:` as `BASE_IMAGE`; a service
  that runs as its image writes `BASE_IMAGE` out. See `machine-release-programs.md`.

**Why:** M1 (must) and M6, M7, M8, M11, M13 (should) as scored in the rounds; A-2's return to the service repo on
`service-owns-setup`, `service-alone` and `services-added-alike` (REQUIREMENTS.md, V2).

**Known gaps:** as in `machine-starter-template.md` (*Known gaps*) and design §12 (*Machines with service repos*).
M4 (could, defined in one place) is met only per service: a dependency two services share is resolved per box.

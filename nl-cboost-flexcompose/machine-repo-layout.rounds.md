# Where a machine's services are defined, pinned and built: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|

## Dropped requirements
| # | Requirement | Why it isn't one (user's reason) | Source | Round |
|---|---|---|---|---|
| M9 | Exact versions of shared packages can be locked per machine or per service; the layout doesn't fix one | "Not a requirement per se" (user, round 4); it was "whichever is simpler, keep options open" | user, round 2 | 4 |

## Requirements round (2026-10-28, before round 1)
From the sibling's round 10 what-if (build the app from `-application`). Answers: M1's reason (the app can't run
without the other services); any service may run from source (M6); "fewer repos" means: where to look, upkeep per
repo, complexity and mental overhead (M3, reworded); M2's reasons: two things to learn, tool special cases, and
package checkouts of two app-like services conflict (M7); M4 means clarity, the build in one place (reworded from
"team ownership"); M5 has no concrete case. Priorities: M1 must; M7 first must, then downgraded to should (no second
source-built service soon, option kept open); M2, M3, M4, M6 should; M5 could. Scope: future machines first, PolyMX
adapted where possible. Success criteria: three; "adding a service touches only its own repo" left out (a service
may need special handling in the integration repo).

## Round 1 (2026-10-28)
Discovery: three generators, given only *Problem*, *Requirements* and constraints (`discovery-input.md`):
1. Own field, blind to the project: manifest repos (west, `repo`, kas), Compose `include:`/OCI fragments, git build
   contexts and Bake remote definitions, Tilt/Skaffold/Garden, GitOps environment repos, monorepo with Bazel
   `rules_ros2`, binary packages (bloom, Pixi), one dev container per service with chained colcon workspaces.
2. Far fields: Debian source package vs separate packaging repo, Yocto layers with kas, Yocto `devtool
   modify`/Buildroot `OVERRIDE_SRCDIR`/Android local manifests (uncommitted source overlay), Android source/prebuilt
   switch, rosdistro distribution file, configurable (150%) BOM, shared builder (Buildpacks, thinnest viable platform).
3. Own field with the project's code: verified that every `workspace: true` service shares one volume and `src/`,
   that `bootstrap.sh` and `.devcontainer` handle one `.repos` and one service, that the app's pins exist twice and
   differ; options: image-tag manifest, `services/<name>/` folders, `--source <svc>` at generate time, `include:`,
   git build contexts, one Dockerfile with a stage per service, service repos pin their own dependencies, a workspace
   per service.
Merged into axis A (A0-A6) and axis B (B1-B6). Leader A1, runner-up A2. Draft `draft-a1/` (not run).

Searches (by the generators): 23 by generator 1 (ROS workspace layouts, Compose include/OCI publish, Tilt multi-repo,
Bake remote definitions, west/repo manifests, Dev Containers multi-container, kas, Nix flakes, colcon overlays,
Garden, bloom/private rosdistro, Pixi, Josh, GitOps promotion, rules_ros2, Earthly/Dagger, balena offline, Skaffold
requires, Dev Container features, Bake reading compose; no robotics company's published layout found); 21 by
generator 2 (Yocto layers/kas, AOSP local manifests, Buildroot OVERRIDE_SRCDIR, devtool modify, Nix override-input,
Bazel local_path_override, git-buildpackage, AUTOSAR ECU extract, Team Topologies TVP, 150% BOM, britney, west
allowlist, rosdistro, Android GSI/Treble, sstate, Buildpacks, inverse Conway, AOSP prebuilts,
MODULE_BUILD_FROM_SOURCE, Guix channels); 6 by generator 3 (Compose include remote git, git build context subdir,
devcontainer runServices, Compose watch/profiles/Bake, vcstool overlays, Bake reading compose).
Checks: rejection check: A1 carries ~ M4 (its build options sit in the machine repo); M5 stretched (it says *run*,
the records cited *build*); A2's M4 scenario contradicted its own row (✓ M4); A3's ~ M2 and ~ M7 stretched (same
recipe pattern as A1; M7 scored on room); A0's ✗ M7 broke the room rule; A5 rests on N20b's wording, not its reason;
B6 trailing, not not applicable; unargued cells filled. Bias check: missing options A7 (recipe in the service, pins
central), A0b (A0 without the stale pins), A8 (wait), B7, B8; candidate requirement `one-version`; M7's meaning;
M2's reason weak (a shared *place*, not a shared recipe); M3 joins two needs; ONNX models as IP (sibling);
`release:build` would break a program recipe today (sibling F2's step 1). Ranking: A3 leading, A2 runner-up, A7.
Answers to round 1: `one-version`: not sure (known gap). A3's fit: "for future projects, different customers may get
different images or configurations; these could go cleanly into the integration repo" (M8, priority and shape asked
as a follow-up). Axis B stays in this log. Remark: `plain-compose` was read too broadly (B6 is trailing, not out).

## Round 2 (2026-10-28)
Follow-up answers: customers differ in service versions, configuration and base/hardware (not in which services);
the variants live in one machine repo; M8 should. Rescored axis A with M8: A3 ~ M8 (customer configuration next to
the app's code; a variant pinning the repo it lives in), A2 ~ M8 (one recipe per machine for several app versions).
A7 leading, A1 runner-up. Axis B scored for the first time (M1, M6, M7, `work-survives`, `plain-compose`, N11):
B2+B3 leading, B5 by a `generate --source` flag. No web search; no checks this round (no new options; the round-1
checks cover the option set).
Checks (round 2, run after all): bias check: A9 (loose declarations in the service, a generated lock in the machine);
a shared ROS Dockerfile referenced, not copied (variant for A1/A7/A9); no mechanism for customer variants (axis C);
M7's conflict is a version conflict, present today (packml_ros2: verified); M6's images come from local builds; M1
and GPU-less PCs; M2/M8 wording; model files. Rejection check: A7's ✓ M2, M3 optimistic (A7 below A1); `one-version`
only a tie-break; `ir` inconsistent (scored under N21); A3's M8 narrowed; A5 on wording; Options rows vs matrix;
B2 alone meets M6 with a generated devcontainer service. Ranking: A9 leading, A1 runner-up; B2 / B2+B3 tied.
Answers to round 2: lock: whichever is simpler, keep all options open (M9, could assumed); M8's reason: fewer repos and shared fixes once; two source-built services at once: a could (M10), which breaks the B tie for B2+B3.

## Round 3 (2026-10-28)
M9 (lock per machine or per service kept open; could assumed), M10 (two source-built services at once, could). Axis
C scored: C2 leading, C3 runner-up. Checks: bias check: C8 (per-customer env file), C9 (runtime configuration), C3
can reach the dev box by hand; per-customer releases collide under one tag (`release-traceable`); a plain layer
can't switch FlexCompose features; M8 has no concrete customer case; M9 is a deferral. Rejection check: B2 alone ~
M10 (attach); C3 meets rsd as worded (C2 leads on its reason); C3 must merge into the build file; C4 ~ M3, C5 ✗ M8,
C6 ✗ M8 too strong; stale status and A7 text. No web search.
Answers to round 3: keep customer variants to configuration files only, every customer runs the same builds and the
program accepts the configuration (M8 narrowed); tagging per customer not decided; configuration mounted or built in
depends on the configuration; remark: a branch per customer may be acceptable while customers or configurations are
few.

## Round 4 (2026-10-28, started)
M8 narrowed: A9's per-customer lock and C2's FlexCompose feature no longer needed; A2's and A3's ~ M8 gone. A9, A3,
A2 tied on requirements. Checks not run yet; the tie is put to the user first.
Answers in round 4: M9 is not a requirement (dropped); M8's "configuration only" was a mistake: versions may differ
per customer (M8 back to round 2's scope, configuration preferred where it suffices); the M4 gap weighs least ("the
pins would be different for release and dev, but they are not the same in the first place"); "the machine repo
should not know about all services in the integration; that's a reverse dependency that will be hard to get rid
of" (wording asked); asked for a broader, creative search for an option that keeps every requirement.
Round 4 discovery: three new generators, given *Problem*, *Requirements* (M1-M11 without M9) and constraints, without
solution words (`discovery-input-2.md`): radical reframings (self-describing images with provenance, Compose OCI
fragments, remote Bake, the dev box as a view, git notes, a computed integration/intent lock, buildx replay, Dev
Container Features; 19 searches); dependency ecosystems (go.work, Bazel root-only overrides, Cargo/uv root patches,
Nix flakes, Spack develop, Gradle composite builds, a distribution catalog, Kustomize/Helm/kas overlays and locks,
publish-don't-build; 22 searches); distant fields (USD layers and variants, asset resolvers with pin files, 150%
models, delta-oriented product lines, Drug Master Files, restbus/"machine minus one", federated BIM clash detection,
BioBricks envelopes; 23 searches). A10 composed from the shape all three reached; A11-A13 added; draft `draft-a10/`.
M12 added during round 4 (user): a developer creates a dev box with the smallest amount of setup work possible (should); A10 meets it with a --source flag that clones the service; A9, A1, A7, A12, A13 ~ M12.
Checks (round 4): rejection check: A10's all-✓ row fails as worded (~ M3 M4 ws; N22, N11 unscored; M12 on a variant
not in the draft; `own-host-environment` unscored); A9's best variant ties A10; A12, A13 records narrowed. Bias
check: A14 (A10-lite inside today's format); M12 needs a reason; M8, M11, M2 wording; the M4 question was leading;
pip not covered by `vcs export`; proportionality. User's idea: B9 (editable overlay, as `pip install -e`). Ranking:
A14 leading.
Answers to round 4: M4 reformulated: its core is that build configuration isn't duplicated (M13, should); one place
would be nice (M4 → could); M11 reworded (a service may know the interfaces of services it calls, not the machines,
customers or integrations); M12 ranked by number of commands, but FlexCompose staying simple ranks higher (M14,
should). Remark: drafts moved to `tmp/machine-repo-layout-drafts/` in the notes.

## Round 5 (2026-10-28)
Rescored with M4 (could), M13, M14 and the reworded M11. Draft `draft-a14/` (in `tmp/` of the notes): two variants
of the dev-box switch (a `--source` flag; generated per-service source overrides picked by devcontainer), the
workspace placements per source service (the first service keeps today's names), the commands per variant. Found:
the "first workspace service" needs a fixed name rule; two devcontainer windows with different Compose file lists
recreate each other's services (A14-gen ~ M10). The base written twice is ~ M13. No web search.
Checks (round 5): rejection check: Dev Containers find containers by project and service label and reuse a running
one (devcontainers/cli `dockerCompose.ts`): A14-gen ~ M6 and ~ M10; "tied" inconsistent: A14-flag leads; the base is
derived once today (the duplicate is the sibling's F2); the version written twice is an unscored M13 cost; `ws`
holds given a naming rule; A10 ~ M14, not ✗. Bias check: A14-prof (profiles + aliases), subpath workspaces,
hand-written devcontainers, clone in bootstrap; parameterized fragments are A14's main M14 cost; locks must be build
inputs; M12, M13, M14 wording.
Answers to round 5: M13: overrides are okay, copies are not, differences between dev and release are fine; the
version as two literals (an accepted exception to M13); M12's reasons: onboarding, switching often, fewer mistakes;
remark: what is the Dev Containers gap (explained in chat). Consequence for the sibling: F2's base written twice is
a copy under M13; today's derivation meets it.

## Round 6 (2026-10-28)
The user asked how VS Code handles several devcontainers and whether running every service from source solves the
reuse gap (answered in chat; A14-all drafted). Spikes: Compose profiles (switching leaves the other variant
running, also with `--remove-orphans`); subpath volumes (work once the subfolder exists). Leader: A14-flag with
subpath workspaces.
Checks (round 6): both: subpaths nest the other services' work in the app's colcon workspace (M7), need the same
root-owner rule and a one-shot init service: no better than a volume per new service. Rejection check: A14-all's
~ M1, ~ M12 stretched; only ~ M6 ("as images") remains; A14-flag also needs a Rebuild to switch. Bias check:
"from source" per service kind (Python as a bind mount); A14-flag's generated devcontainer would be a new output;
A14-prof dropped; A14-gen's ~ M10 unverified with runServices.
Answers to round 6: "as images" depends on the service (M6 reworded: a per-service default); "from source" per
service kind: yes; a second colcon service's workspace: decide later. Remark: could the dev box be placed in a
checkout of the app repositories? Search: the Dev Containers setting "Repository Configuration Paths" exists
(display name, a gist using it), its format undocumented (a Stack Overflow question without an answer): unverified.
A14-default (template default per service, override flag) leading.
Round 7 (2026-10-28, started): the dev box in the app's checkout: three cases explained, none good (user); overview of the leading options' file trees written (machine-repo-layout.overview.md).
Round 7: the user pointed to the colleague's resolver (nl-cboost-ros-tools, deps-resolve/cdr): recursive resolution of each repo's own dependencies.repos, conflicts named, top-level-only overrides, --strict, committed lock.repos as the build input. Solves open point 5; A14-default's lock needs no FlexCompose feature.
Round 7: templates drafted for A2, A14-default, A14-all (machine repo as cdr top level); findings in templates/README.md.
Round 7: split proposed (A-1..A-5); A-1 settled for now: cdr for colcon services, Python services built with their own Dockerfile (pip pins inside; the machine locks their commit).
A-2 decided by the user: the recipe lives in the service's repo. A-5 unpaused (sibling).
A-3 agreed; A-4 decided: customer variants as branches, a base tag with the default configuration, feature or customer-specific tags for special configuration.
A-5 decided (sibling): F2.
A-3: room for a second colcon workspace recorded (names kept, image services not in dependencies.repos, a guard against two workspace services, the later step's contents).

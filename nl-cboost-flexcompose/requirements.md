# FlexCompose: requirements

Draft, 2026-10-26. Gathered from `FLEXCOMPOSE_DESIGN.md` (§n, decision log by date), the repo's `CLAUDE.md` and the
vault's `TODO.md`, in the design-research skill's format (priority by MoSCoW, verified yes/no).

**Nothing here is verified yet.** The design records decisions, not your confirmation of their reasons, and its
commits don't say who wrote what. So every priority is the one its source claims, until you confirm it. A reason marked
*inferred* is mine, not written anywhere; one marked *not stated* is missing.

## Problem

cboost developers need a ROS 2 development environment on their own PC, Windows or Linux, that they can rebuild at
any time without losing work. Each machine needs releases built from the same definition, which run on the machine
without registry access.

## Constraints

Fixed parts that must keep working; each names what depends on it.

| # | Constraint | What depends on it | Source | Priority | Verified |
|---|---|---|---|---|---|
| C1 | Boxes and releases run with Docker Compose: Docker Desktop on Windows, Docker Engine on Linux and in WSL | Developers' habits, VS Code Dev Containers, the machines | §6 intro, decision 2026-09-30 (Engine) | must | no |
| C2 | VS Code Dev Containers keeps working with the boxes | Most developers open their box through it | §8 | must | no |
| C3 | Dev boxes run on the cboost ROS 2 base image, whose user is `cboost-user` (uid 1000) with its workspace at `/home/cboost-user/workspaces` | The workspace mount, file ownership on the host, Xwayland admission | §4, §12 (images) | must | no |
| C4 | Machines run Linux and have no registry access | The release has to carry its images and can't build or pull | §13, decision 2026-10-19 | must | no |
| C5 | Boxes running on image `cboost-ros2-jazzy:0.0.1` stay unchanged: that tag is never reused | Every running box on it would be recreated on its next `up` | §10 | must | no |

## Requirements

### Keeping work safe

| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| R1 | Work in the workspace survives a recreate, `down`, and (in a host folder) a Docker data reset | A config change or Docker Desktop cleanup deletes a developer's work | §7 | must | no |
| R2 | The developer can see where their workspace lives and what it survives | They keep work outside it, or run a command that deletes it, without knowing | §7 | should | no |
| R3 | Nothing FlexCompose prints suggests a command that deletes a box or workspace, or a setting that makes boxes share or switch workspaces | A developer follows the hint and loses work, or starts a second box | CLAUDE.md (invariants, tests), §7 (`WORKSPACES_DIR`, `COMPOSE_PROJECT_NAME`) | must | no |
| R4 | The same inputs always give the same output | Any change in the output recreates the box on its next `up` | CLAUDE.md (invariants), §6 step 5 | must | no |
| R5 | A change that will recreate a box (a FlexCompose upgrade, a pulled template change) is announced before it takes effect | Work outside the workspace is lost by surprise | §8, decision 2026-09-30 (Who runs it) | must | no |
| R6 | No FlexCompose release and no template change can make Compose offer to delete the workspace volume | Compose asks *Recreate (data will be lost)?*, and a yes deletes the workspace | §7 (frozen volume), CLAUDE.md | must | no |
| R7 | A hand-edited output is never overwritten silently | The developer's edits are lost | §6 (overwrite) | must | no |
| R8 | A box never moves to another Compose project unnoticed | A second box starts, and the first one's workspace looks gone | §6 (project), decision 2026-09-30 (Project name) | must | no |
| R9 | Switching a box to another workspace placement is refused unless asked for, and names where the old work is | The new box starts empty and the old work is orphaned | §6 (type switch) | must | no |
| R10 | Each safety override is the developer's explicit choice on that run; an automatic regenerate (Dev Containers) never makes one | A one-time override repeats itself unseen | CLAUDE.md (invariants), §6 | must | no |
| R11 | A template whose meaning is unclear is refused, not guessed | A typo or `yes`/`on` silently produces another box than intended | §3 (strict) | must | no |
| R12 | A template never starts a box by itself | *inferred*: Compose run on the template gives a box without the target's workspace, so work lands in the container | §3, decision 2026-09-30 (Template) | should | no |
| R13 | Enabling GUI on a Linux host never breaks the host's own X logins | Docker creates a root-owned `~/.Xauthority` folder and the host login fails | §5, decision 2026-10-14 (GUI) | must | no |

### Developing in a box

| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| R14 | Each developer builds the environment for their own host (OS, workspace placement, project) from the team's shared template | Committed outputs would remove that freedom and need every combination | decision 2026-09-30 (Who runs it) | must | no |
| R15 | The developer chooses where the workspace lives: only in Docker, the sources on the host, or all of it on the host | *not stated* | §4, decision 2026-09-30 (Dev box types) | should | no |
| R16 | The developer works as the image's user, with root one `sudo` away, and owns the workspace files on the host too | They can't edit on the host what the box wrote, and the release image's user differs from the dev box's | §4, decision 2026-10-14 (User) | should | no |
| R17 | Features (shared memory, logging, ulimits, GUI, GPU) are switched per service and work on the developer's OS | *inferred*: ROS 2 tools need them, and they are set up differently per OS | §5 | should | no |
| R18 | Installs outside the workspace (apt, pip, tools) can be restored after a recreate with one rerun | They are lost on every recreate | §7 | should | no |
| R19 | FlexCompose is installed in one step, with nothing else to download or set up | *inferred*: the ytt download and `FLEXCOMPOSE_HOME` were a hurdle | decision 2026-09-30 (Install) | should | no |
| R20 | The whole team shares one Dev Containers setup; after the first explicit choice, reopening the box is one click on any OS | *not stated* | §8, decision 2026-09-30 (Dev Containers) | should | no |
| R21 | A running box can move to FlexCompose without being recreated | Its work outside the workspace is lost | §9 | should | no |
| R22 | Messages say why something happened and what to do next | *inferred*: developers can't act on a bare refusal | CLAUDE.md (style) | should | no |
| R23 | In an integration repo's dev box, the machine's private repos can be cloned with the developer's own SSH credentials | Development stops at the first private repo | decisions 2026-10-19 (Bootstrap), 2026-10-22 (Base image) | must | no |
| R24 | Opening the dev box adds missing repos but never moves an existing checkout | A developer's local branch or changes are lost | §13 (dev box) | must | no |

### Releases

| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| R25 | A machine's release is built from the same definition as its dev box | *inferred*: dev and release drift apart | §13, decision 2026-10-15 (Releases) | should | no |
| R26 | A machine runs its release without building or pulling | It has no registry access (C4) | §13 | must | no |
| R27 | Release images carry no source code of compiled languages | *not stated* (*inferred*: protect the code on a customer's machine) | §13 (Dockerfile), decision 2026-10-15 | must | no |
| R28 | Building or running a release never touches the dev box on the same PC | The developer's box is replaced or recreated | §13 (targets) | must | no |
| R29 | A release is traceable to one clean, tagged commit of the machine's integration repo | *inferred*: no one can tell what runs on a machine | §13 (version) | should | no |
| R30 | A release bundle is checked for damage before the machine loads it | *inferred*: a broken copy runs half a release | §13 (bundle) | should | no |
| R31 | A machine switches to a new release in one step, and can roll back to one it still has | *inferred*: a bad release keeps the machine down | §13 (bundle), decision 2026-10-20 | should | no |
| R32 | Old releases don't fill the machine's disk | *inferred*: the disk fills over time | §13 (`update.sh`); the fixed 3 is open (TODO) | could | no |
| R33 | A started release comes back after the machine reboots | *not stated*; polymx wants no unattended restart after a crash (D10) | §13, §12 (open) | should | no |
| R34 | A release has the same features as the dev box | The machine's IPC needs `gpu`, and `gui` too | decision 2026-10-19 | should | no |
| R35 | Running a release image directly (`docker run <image> ros2 ...`) sees the release's packages | *not stated* | decision 2026-10-22 (`/opt/app`) | could | no |
| R36 | Package repos hold only code; each machine's integration lives in one repo of its own | *inferred*: package repos stay reusable across machines | §2, §13, decision 2026-10-19 | should | no |

### Building FlexCompose

| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| R37 | The tool stays small, with as few dependencies as possible | *not stated* | CLAUDE.md (style) | should | no |
| R38 | Fragments stay readable as plain Compose | *inferred*: maintainers read and change them without learning a new format | decision 2026-09-30 (Engine) | should | no |
| R39 | Tests check what FlexCompose must achieve, not message wording | Rewording a message breaks tests | CLAUDE.md (tests, decided 2026-10-22) | should | no |
| R40 | Each version is published for Windows and Linux with an installer and release notes | *not stated* | decision 2026-10-15 (Hosting) | should | no |

### Won't (not now)

Each with what would bring it back.

| # | Requirement | Brought back by | Source | Priority | Verified |
|---|---|---|---|---|---|
| W1 | Release settings for production (health checks, resource limits, `restart:`, a `.env` per machine) | The first real release (polymx, or `example/docker-compose-base.yaml`) | §12 | won't | no |
| W2 | A plain `up` restores installs, as Dev Containers does | Developers who don't use Dev Containers | §11 (`enable_bootstrap`) | won't | no |
| W3 | A read-only check of whether a box would be recreated, and where its workspace lives | *not stated* | §11 (`check`) | won't | no |
| W4 | Dev boxes on images other than the cboost base | A dev box on another image is needed | §12 (images) | won't | no |
| W5 | A developer turns off a feature the template enables (e.g. GPU on a host without one) | *not stated* | §12 (GPU opt-out) | won't | no |
| W6 | GPU in a box run from a WSL distro | A developer who needs it there | §12 (WSL) | won't | no |
| W7 | Host users other than uid 1000 can edit the box's files and run GUI apps without extra steps | Such a developer | §12 (known gaps) | won't | no |
| W8 | FlexCompose starts, stops or enters boxes itself, instead of only writing files | *not stated*; may be dropped rather than deferred | decision 2026-09-30 (Not carried over) | won't | no |
| W9 | Package repos declare their own Docker needs (a manifest per repo) | *not stated*; may be dropped rather than deferred | decision 2026-09-30 (Not carried over) | won't | no |

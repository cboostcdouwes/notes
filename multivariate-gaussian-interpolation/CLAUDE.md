# multivariate-gaussian-interpolation: project instructions

Loaded through `CLAUDE.local.md` in the project root. Every rule says who set it and when, why, and when it ends.
Rules live in this file only: don't copy them into memory, `TODO.md` or a README. When the user sets, changes or
lifts a rule, update it here in the same step.

## Lasting rules

- **The user stays blind to every layout they have not played in both conditions of the human baseline**
  (on 2026-11-25 the user played `layout-13` to `layout-20` in both conditions, so no layout is left under this rule). Don't print, draw or describe their maps, how they were built or
  what they are like, not even as a hint; don't train or evaluate on them or show anything computed from them.
  - Set by the user on 2026-11-20 ("I'd like to stay blind to the layouts until the proper runs") and 2026-11-21
    ("Evaluate on layouts 1 to 3 only, as I have not seen the others and I must remain blind to them").
  - Why: the user plays them with the walls hidden as the human baseline. Seeing one cannot be undone.
  - State on 2026-11-25: the user said "The rest of the layouts have been played", and the sessions are in
    `human-baseline/results` (two per layout, `layout-13` to `layout-20`, all of that day). Nothing is hidden from
    the user any more, and `require_played` refuses no layout.
  - Still held out, by `PLAN.md` and not by this rule: `layout-13` to `layout-20` "are run once, unchanged, with
    the configuration stage 1 ends with". No training, tuning or evaluation on them before that run. Nothing in
    the code enforces this since `require_played` lets them through.
  - Ends per layout, when the user has played it in both conditions. `gcrl.environment.require_played` refuses
    the others, and every way the package builds a layout calls it (`gcrl.environment.maze` and `maze_params`), so
    training, sweeps, probes, figures and videos are covered; a new script that reads a layout in some other way
    (`gcrl_maze.layouts` directly) must call it.
- **Layouts are named by number only** (`layout-01`, ...); never reveal another name for one.
  - Set by the user on 2026-11-20 ("Do not reveal the named layout names to me (name them `layout-01` etc.)").
  - Ends: never, unless the user says so.
- **Continuous actions only, for goal 1's problems** (the maze and robot problems).
  - Set by the user on 2026-11-22 ("I am interested in agents with continuous actions only"); no reason given.
  - My reading: new methods and experiments use continuous actions; discrete versions are kept as they are and
    not developed further.
  - Lifted for goal 2's games by the user on 2026-11-24 (chosen option "Lifted for goal 2 only"): a game is taken
    with its own controls, discrete ones included. The user chose one method for both goals on the same day, so my
    reading is that the method gets a discrete form for games while goal 1's problems stay continuous.
  - Ends when the user says so.
- **Remedies must be general.**
  - Set by the user on 2026-11-21 ("Skipping stalled steps does not seem a general solution, try finding a
    solution that is more generalizable").
  - My reading: don't propose a fix that only removes a symptom special to this maze or to one method's failure.

- **Tool debt is dealt with on the spot, and tooling is never cut from the plan unasked.**
  - Set by the user on 2026-11-24 ("items like these will be important for the future to keep efficiency high";
    "Yes, add them"), after the reusable package, the environment interface, the sweep runner and the other
    preparation steps had dropped out of `PLAN.md` during its rewrites.
  - How: `PLAN.md`, *Keeping the tools sharp* (a debt list with prices in `TODO.md`, *Tool debt*; fixed at the
    second workaround; a close-out check per question; about a fifth of the time). Preparation is not verification
    and does not count against the rule below.
  - Those sections (*How the search is run*, *Keeping the tools sharp*, *Keeping knowledge*, stage 0's preparation
    steps) are in `PLAN.md`, which since 2026-11-24 changes only with the user's word (rule below). A review or a
    rewrite of `APPROACH.md`, by me or a subagent, must not move tooling out of the work either; say so in the brief.
  - Ends when the user says so.
- **`GOALS.md`, `PROBLEM_STATEMENT.md` and `PLAN.md` change only with the user's word; `APPROACH.md` is mine.**
  - Set by the user on 2026-11-24, asking how long autonomous sessions could be kept from changing the problem
    statement, the plan and the goals, and then: "Make the split" (of `PLAN.md` into the owner's part and mine).
  - How: what decides whether a gate is met (measures, reference lines, conditions, gates, stage 0's steps,
    stage 2's problems) and how the work is conducted (*A session*, the search, the tools, knowledge, working with
    the user) is in `PLAN.md`. What is tried and in what order (the starting point, the learner, stage 1's
    questions, stage 2's order) is in `APPROACH.md`, which I change, writing why in `long-term-plan.md`,
    *Changes to `APPROACH.md`*. A change I want in the three owner's files is proposed to the user, not made; a
    subagent's brief says so. Their wording is the user's to approve even where the change seems only editorial.
  - Enforced only by the user's own lock: `sudo chattr +i` on the three files, which the user sets and lifts. The
    user decided on 2026-11-24: "Nothing besides the chattr will be added" (no deny rules, hooks or checks of
    mine). A write that fails on these files is the lock working: stop and propose, never work around it.
  - Ends when the user says so.
- **Spend run time on new ideas, not on verification.**
  - Set by the user on 2026-11-24, when lifting the experiment-size rule ("It may be lifted entirely, but make sure
    to always storms your time wisely; past runs have spent far too much time running verification instead of
    trying new ideas") and again on how to treat resets ("Whatever is necessary to advance the research, remember
    to spend your time wisely").
  - My reading: give an idea the least evidence that can show an effect; confirm with more seeds and layouts only
    what the next step is built on, or what a decision of the user rests on; keep no standing table of every method
    on every layout. At most about one run in four is a confirmation (my number, `long-term-plan.md` C7).
  - Ends when the user says so.

## Temporary rules: experiment size

- **Lifted on 2026-11-24** (the user's words are in the rule above); layouts not yet played stay excluded by the
  blindness rule. It read: **every run uses one model, 8 environments and `layout-02` only**
  (`--models 1 --environments 8`).
  - Set by the user on 2026-11-21 ("This probe took way to long, all future experiments will be on one model
    with 8 environments only until I explicitly say so" and "Also only test on layout 2 until I say so").
  - Why: a probe round that I extended with 8-model confirmations and other layouts took too long.
  - How: keep probe rounds short and report early. Propose confirmation runs (more seeds, layouts 1 and 3, one
    environment); don't run them unasked.
  - Ends when the user explicitly lifts it.
- **Several environments per model are allowed in experiments; the final evaluation uses one.**
  - Set by the user on 2026-11-21 ("I'm fine with running multiple environments per model; the final evaluation
    (after the experiments) will happen with one environment").
  - How: keep the one-environment path working, and say with every result how many environments it used.
  - Ends with the final evaluation.

## Working rules

- **Implement a feature in full; no commit-sized steps.** Still list the changed files at the end.
  - Set by the user on 2026-11-18 ("This is not a git repo; commit-sized steps aren't needed. Implement it in
    full"), and kept on 2026-11-22 for when the project is a git repository ("The project will still use large
    changes, as the version control will not be manually managed").
  - Ends when the user says so.
- **This is an AI-managed repository: carry out decided plans autonomously**, asking only for what needs the
  user's input (a choice that is theirs, access, registering tools for Claude Code, anything outside the repository).
  - Set by the user on 2026-11-23 ("this is an AI-managed repository; make all steps autonomously except for the
    ones that require my input"), on the results viewer's plan.
  - Ends when the user says so.
- **Questions of how to measure, run or compare are Claude's to answer; ask the user about the goals, their time,
  their data and permissions.**
  - Set by the user on 2026-11-24, in answers to a question round: "This is a question that you can answer, ideally
    one configuration would suffice" (whether settings may differ between problems), "The extent of what is
    possible is an open question that you can answer", "Trying priors is an interesting question that you could
    attempt either way".
  - My reading: decide such questions myself, write the decision and its reason in the plan
    (`long-term-plan.md`, *Decided by Claude*), and report it; don't put them in a question round.
  - Ends when the user says so.
- **The notes folder is backed up automatically**: don't propose commit messages for changes in it.
  - Set by the user on 2026-11-23 ("The notes folder is backed op automatically").
- **Claude may commit on its own in this repository; the commits are not reviewed.** This replaces the global
  rule "never commit" for this repository only.
  - Set by the user on 2026-11-22 ("autonomous commits are okay in this repository, they will not be reviewed").
    The project is a git repository since 2026-11-22 (branch `main`, no remote).
  - My reading: committing finished work is allowed, and so are the commits the run record makes (the working
    tree before a run, the record after it). Commit messages are conventional commits.
  - Widened by the user on 2026-11-25 ("Yes, this repo should be managed autonomously"), on whether merging
    needs their word: I merge a working tree's branch into main on my own once its tests and, after a change to
    shared code, the canaries pass, and report it; I also remove working trees and branches that are merged.
    My reading: rewriting history (rebase, amend, reset of published commits, force) and pushing still need the
    user's word, since they cannot be undone; there is no remote.
  - How (found 2026-11-24): run `git add` and `git commit` as plain commands from the project root, one per call.
    Chained into one command (`cd … && git add … && git commit …`) they do not match the allow rules in
    `.claude/settings.local.json` and are refused. The hook `~/.claude/hooks/guard-git-writes.sh` also blocks any
    command whose text holds those words when it runs from a folder without `.claude/allow-commits`, such as the
    notes folder.
- **The repository must not be published as it is.** Its history holds the layout file in plain text, and a run
  commits every file in the working tree, also untracked ones.
  - Set by Claude on 2026-11-22, from the blindness rule and the run record's design. Ends when the user decides
    how the layouts are kept out of a published history.
  - Ends when the user says so.
- **Stored results have no history, so deletes need care.** Never symlink a project folder into the scratchpad.
  Delete scratch output by naming each directory, never with a `*/` glob, and list what a delete touches first.
  - Set by Claude on 2026-11-21, after `rm -rf <scratch>/alt/*/` followed a symlink and emptied
    `experiments/gcrl-maze/wgcsl/results`; the user restored it from a snapshot (snapper keeps them under
    `/home/.snapshots`, readable by root only).
  - Ends when results are under version control or backed up in a way the user confirms. On 2026-11-22 the
    records and small result files are in git; the large outputs (networks, videos, experience) are not, and
    the run record's own commands (`runs.py clean`, `runs.py remove`) are the way to delete those.
- **Say how much evidence a result has**: layout, models, environments and the number of seeds. One model's
  score varies a lot between seeds (the same method: 1.3 % and 5.2 % of steps wasted), so only large differences
  count. (Claude's working rule.)

## Where things are

- **The problem and its scores:** `PROBLEM_STATEMENT.md` in the project root. A change of goal goes through that
  file, with the user's decision and its date.
- **Long-term goals:** `GOALS.md` in the project root, one section per goal. A new goal or a change to one goes
  through that file, with the user's decision and its date (set by the user on 2026-11-24: "put the long-term goals
  in a file in the project root").
- **The plan:** `PLAN.md` in the project root (the user's part, see the rule above) and `APPROACH.md` next to it
  (mine: what is tried and in what order). `PLAN.md` is the current plan only (set by the user on 2026-11-24: "Rework the
  plan into a `PLAN.md` in the project without any history and redundant parts removed"). A change to the plan goes
  into `PLAN.md`; who decided what, when and why goes into `long-term-plan.md` next to this file, which also holds
  the decisions Claude made under the user's delegation. `self-training-robot-plan.md` is the first version, for
  goal 1 only. Where they differ, `PLAN.md` holds. Every session of work follows its section *A session*: read it
  at the start (set by the user on 2026-11-24: "I'd like to formalize this process in the plan, so each session
  does not have to rediscover it").
- **Open work and what was found:** `TODO.md` next to this file (the work list of *A session*). Keep it current.
  Findings, one line each with evidence, runs and status: `FINDINGS.md` in the project root.
- **Design decisions:** the research logs next to this file. Decided: what a run records
  (`what-a-run-records.md`, its *Decision* and plan). Decided and reviewed (2026-11-23): inspecting
  results (`inspecting-experiment-results.md`): a custom Rerun viewer in Rust on a shared Python core; being
  built (its *Progress on the plan*). Its drafts are in `~/.cache/claude-r3-spike/work/` until the viewer is in use.
- **Experiments:** `experiments/README.md` and, for the maze, `experiments/gcrl-maze/README.md`, with one README
  per experiment folder (`human-baseline`, `gcsl`, `wgcsl`, `quasimetric`) and a section per question. The
  environment is the package `packages/gcrl-maze`.
- **The methods:** the package `packages/gcrl` (its README): the learner's exchangeable parts, the methods as
  configurations of them (`gcrl.methods`), the environment interface (`gcrl.environment`), training with members
  and sweeps (`gcrl.training`, `uv run gcrl`), the run record (`gcrl.runs`), canaries (`gcrl.canaries`). A new idea
  is a part or a setting there, not a copy; the experiments' scripts only call it.
- **Looking at runs and sessions:** the results viewer, `experiments/gcrl-maze/viewer/` (its README):
  `uv run python companion.py` opens the window; `core.py KIND ITEM key=value` gives me the numbers of any view;
  remarks the user leaves are in `remarks/remarks.jsonl` in the repository, with screenshots; Rerun's MCP server
  (`.mcp.json`) reads the open window.
- **Runs and their records:** every run through `gcrl.training.train` commits the working tree, writes a record
  under `runs/<id>/` in the repository (ID: date, time and a label; it names its method, members and question) and
  puts its experience and large outputs under `~/.cache/multivariate-gaussian-interpolation/runs/` (or
  `$RUN_OUTPUTS`); a sweep keeps no outputs. `uv run runs list|sizes|time|pin|remake|clean|remove` from anywhere in
  the repository; `runs time` gives machine time per question. `experiments/gcrl-maze/README.md` describes it.
  Since a run commits the whole tree, don't edit the main tree while a run started from it is going: work in a
  working tree of its own (`uv run runs worktree add NAME`, in `.worktrees/NAME`, branch `work/NAME`), which is
  also how parallel agents work.
- **Probes:** try-outs that are not part of a method. A probe that trains leaves a record like any run, with its
  script in the run's commit: give it a label (`--label NAME`, or the script's name). The probes made before
  2026-11-22 are under an experiment's `results/probes/<name>/`, with their scripts as `.py.txt` and their
  curves; they ran on `gcsl.py` patched in memory and have no record, and their patches may not fit the code
  any more.
- **Running:** from an experiment's folder, `uv run python <script>.py NUMBER [--seeds 0 1] [--SETTING VALUE]`;
  `--plot-only` redraws a figure from the records without training; `--label NAME` keeps a try-out apart from the
  method's own runs; `--question NAME` ties a run to a question of the plan. From anywhere:
  `uv run gcrl train|sweep|figure METHOD NUMBER ...`. Runs with the same seed and settings repeat exactly.
- **Tests:** `uv run pytest` in `packages/gcrl` (with the canaries, about a minute more; `-m "not canary"` leaves
  them out), in `packages/gcrl-maze`, and in `experiments/gcrl-maze` (`human-baseline viewer`). After a change to
  shared code, `uv run python -m gcrl.canaries` must say "as stored"; a change meant to alter the numbers writes
  them again with `--write` and says why in its commit.

# multivariate-gaussian-interpolation: project instructions

Loaded through `CLAUDE.local.md` in the project root. Every rule says who set it and when, why, and when it ends.
Rules live in this file only: don't copy them into memory, `TODO.md` or a README. When the user sets, changes or
lifts a rule, update it here in the same step.

## Lasting rules

- **The user stays blind to every layout they have not played in both conditions of the human baseline**
  (on 2026-11-23, after `layout-12` was played in both conditions: `layout-13` to `layout-20`). Don't print, draw or describe their maps, how they were built or
  what they are like, not even as a hint; don't train or evaluate on them or show anything computed from them.
  - Set by the user on 2026-11-20 ("I'd like to stay blind to the layouts until the proper runs") and 2026-11-21
    ("Evaluate on layouts 1 to 3 only, as I have not seen the others and I must remain blind to them").
  - Why: the user plays them with the walls hidden as the human baseline. Seeing one cannot be undone.
  - Ends per layout, when the user has played it in both conditions. `gcsl.require_played` refuses the others:
    training calls it by itself (`gcsl.train`), so probes are covered; every new script that shows or computes
    something of a layout without training must call it.
- **Layouts are named by number only** (`layout-01`, ...); never reveal another name for one.
  - Set by the user on 2026-11-20 ("Do not reveal the named layout names to me (name them `layout-01` etc.)").
  - Ends: never, unless the user says so.
- **Continuous actions only.**
  - Set by the user on 2026-11-22 ("I am interested in agents with continuous actions only"); no reason given.
  - My reading: new methods and experiments use continuous actions; discrete versions are kept as they are and
    not developed further.
  - Ends when the user says so.
- **Remedies must be general.**
  - Set by the user on 2026-11-21 ("Skipping stalled steps does not seem a general solution, try finding a
    solution that is more generalizable").
  - My reading: don't propose a fix that only removes a symptom special to this maze or to one method's failure.

## Temporary rules: experiment size

- **Every run uses one model, 8 environments and `layout-02` only** (`--models 1 --environments 8`).
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
- **The notes folder is backed up automatically**: don't propose commit messages for changes in it.
  - Set by the user on 2026-11-23 ("The notes folder is backed op automatically").
- **Claude may commit on its own in this repository; the commits are not reviewed.** This replaces the global
  rule "never commit" for this repository only.
  - Set by the user on 2026-11-22 ("autonomous commits are okay in this repository, they will not be reviewed").
    The project is a git repository since 2026-11-22 (branch `main`, no remote).
  - My reading: committing finished work is allowed, and so are the commits the run record makes (the working
    tree before a run, the record after it). Rewriting history, pushing and anything else beyond committing still
    need the user's word. Commit messages are conventional commits.
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
- **Open work and what was found:** `TODO.md` next to this file. Keep it current.
- **Design decisions:** the research logs next to this file. Decided: what a run records
  (`what-a-run-records.md`, its *Decision* and plan). Decided and reviewed (2026-11-23): inspecting
  results (`inspecting-experiment-results.md`): a custom Rerun viewer in Rust on a shared Python core; being
  built (its *Progress on the plan*). Its drafts are in `~/.cache/claude-r3-spike/work/` until the viewer is in use.
- **Experiments:** `experiments/README.md` and, for the maze, `experiments/gcrl-maze/README.md`, with one README
  per experiment folder (`human-baseline`, `gcsl`, `wgcsl`, `quasimetric`). The environment is the package
  `packages/gcrl-maze`.
- **Looking at runs and sessions:** the results viewer, `experiments/gcrl-maze/viewer/` (its README):
  `uv run python companion.py` opens the window; `core.py KIND ITEM key=value` gives me the numbers of any view;
  remarks the user leaves are in `remarks/remarks.jsonl` in the repository, with screenshots; Rerun's MCP server
  (`.mcp.json`) reads the open window.
- **Runs and their records:** every run through `gcsl.train` commits the working tree, writes a record under
  `runs/<id>/` in the repository (ID: date, time and a label) and puts its experience and large outputs under
  `~/.cache/multivariate-gaussian-interpolation/runs/` (or `$RUN_OUTPUTS`). `experiments/gcrl-maze/gcsl/runs.py`
  lists, sizes, pins, remakes, cleans and removes runs; `experiments/gcrl-maze/README.md` describes it.
- **Probes:** try-outs that are not part of a method. A probe that trains leaves a record like any run, with its
  script in the run's commit: give it a label (`--label NAME`, or the script's name). The probes made before
  2026-11-22 are under an experiment's `results/probes/<name>/`, with their scripts as `.py.txt` and their
  curves; they ran on `gcsl.py` patched in memory and have no record, and their patches may not fit the code
  any more.
- **Running:** from an experiment's folder, `uv run python <script>.py NUMBER`; `--plot-only` redraws a figure
  from the records without training; `--label NAME` keeps a try-out apart from the method's own runs.
- **Tests:** from `experiments/gcrl-maze`, `uv run pytest gcsl human-baseline`; the environment's are in
  `packages/gcrl-maze`.

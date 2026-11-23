# Inspecting experiment results

## Problem
Confirmed by the user: 2026-11-22

The user cannot see a run's results together with its diagnostics, cannot find the relevant results among many
files, and cannot look around without the assistant writing a new script; what they do see often does not make clear
what the agent is doing or why it fails. They need to inspect any run of any method in the project: choose the run,
the moment in training, the goal and the state themselves, put runs, methods and seeds side by side, see results as
they come in, and leave remarks on what they see for the assistant. The assistant must be able to read the same
diagnostics. New kinds of diagnostic keep being added and must fit in without redoing what exists.

The request, verbatim (user, 2026-11-22): "Design an extendable results viewer that could work for any model, any
environment, and has many debug visualization utilities for any number of diagnostics that exist now or will exist in
the future."

## Situation
What exists now:
- **Stored per run:** a JSON with the layout, the settings, the evaluation steps and both score curves, and next to it
  an `.npz` with every network of every model at every evaluation (81 evaluations), "so that another view of the
  training needs no new training". Read: `experiments/gcrl-maze/gcsl/README.md`, `gcsl.py` (`train`,
  `save_checkpoints`), and `quasimetric/results/model/layout-02_continuous.json` (keys `layout`, `config`, `steps`,
  `curves`), 2026-11-22.
- **Amounts:** under `experiments/` 181 JSON files, 39 checkpoint files, 46 PNG figures and 21 videos; the results
  folders hold 1.9 GB (gcsl), 7.7 GB (wgcsl) and 0.4 GB (quasimetric). Counted 2026-11-22.
- **Ways to look at a run today**, each its own script with its own output:
  - `gcsl.plot`: one figure per layout with the score curves of every version and the human baseline
    (`gcsl/gcsl.py`).
  - `gcsl_video.py`: three videos per layout from the checkpoints (paths over training, step-by-step rollouts next
    to the person and the optimal policy, action fields over the map); a method joins by being added to a tuple
    (`quasimetric/quasimetric_video.py`).
  - `wgcsl/value_function.py`: tables and maps of WGCSL's value function against the true distance.
  - `human-baseline/review.py`: summary, figures and a replay of the person's sessions.
  - Probe scripts kept as `.py.txt` under `results/probes/`, each with its own figure or table: the time-to-goal
    against the truth, the model's error map, the model's error against wall clock
    (`quasimetric/results/probes/`).
  - The attention-regression experiments have their own plotting (`packages/attention-toys`, `plotting.py`).
- **Shared drawing helpers:** `gcrl_maze.plotting` (`draw_maze`, `field_grid`, `draw_path`, `draw_visits`).
- **Libraries in use:** matplotlib, pygame-ce, jax, optax; no experiment tracker or viewer library
  (`pyproject.toml`, 2026-11-22).
- **Environments in the project:** the maze (`packages/gcrl-maze`) and the regression toy problems of
  `packages/attention-toys`. No other environment or kind of model is planned: "none known yet"; the wish is not to
  be blocked when one arrives (user, 2026-11-22).
- **Methods in the maze:** GCSL, WGCSL (with a Floyd-Warshall try-out), the quasimetric method and its version with a
  learned model; a person as baseline.
- **How results reach the user today:** through the assistant's reports in the chat, and by opening the stored
  figures and videos; not through the README tables (user, 2026-11-22).

What is wrong with it (user, 2026-11-22):
- "It's difficult to look at the results in context with diagnostics, and it's difficult to navigate and find
  relevant results." (the user's own words)
- The user cannot explore on their own: a new question about a run needs the assistant to write a new script.
- There is no overview: the outputs are spread over many files and folders, so it is hard to see everything about
  one run or to compare runs.
- The outputs are hard to interpret: they do not make clear what the agent is doing or why it fails.
Observed by the assistant, not confirmed as a reason of the user's: seven such scripts exist so far, and numbers were
copied into READMEs by hand (two claims had to be corrected on 2026-11-22).

Time horizon: the project "will be worked on over the span of many months in sessions varying from 1-8 hours" (user,
2026-11-22). It does not have to work now: "later, for months"; it waits on nothing specific (user, 2026-11-22).

What the user values: understanding the produced code is hard for them ("the user often has difficulty understanding
the produced code", global `CLAUDE.md`); general solutions over special cases (user, 2026-11-21, project `CLAUDE.md`).
For this decision the user values low upkeep as methods and experiments change, quick answers, and that it is
pleasant to use; being able to read and change its code themselves was offered and not chosen (user, 2026-11-22).

Found in the code by the round-1 bias check (2026-11-22): all four methods train through one loop and one save
point (`gcsl.main`, `gcsl.train`); a run writes `<results>/<layout>_<actions>.json` and its networks once, after
training, and a rerun into the same folder overwrites them; the JSON has four keys (`config`, `curves`, `layout`,
`steps`) and no method name, date, run name or code version; the agent's data is not stored. Of 152 result files
under the three maze results folders, 39 have their networks.

Changed since round 1, by the child decision being built (read in the code and the log, 2026-11-23):
- **Every run through the shared training function leaves a record** (`experiments/gcrl-maze/gcsl/runs.py`, commits
  `adb8eca`, `7c9dab6`, `69f4558`): ID `<date>-<time>-<label>`; `runs/<id>/manifest.json` (method's module and name,
  layout, settings, command, commit) written before the first step; `events.jsonl`, one line of scores per
  evaluation as it happens; `end.json`; outside the repository, per evaluation, the networks
  (`networks/NNNNNNN.npz`, written during the run) and the experience of each stretch between evaluations
  (position, goal, action, reset per step and environment); the functions the networks can be asked
  (`calls/*.jaxexport` with `calls.json`: `act` for every method, `forward-<network>` for every network, and what a
  method declares, such as `time_to_goal` and `model_step` for the model method), stored at the first evaluation.
- **A run's outputs can be deleted and made again**; views and remarks may rest on remade networks ("Acceptable
  everywhere", user, child log, 2026-11-22). `runs.with_outputs` points a reader at a remake when a run's own
  outputs are gone.
- **Human baseline sessions are runs too** (child log, user 2026-11-22: a run is a method's training run, a probe or
  a human session); their record is the session file. Layouts 1 to 10 are played in both conditions (2026-11-23).
- **No training run has been recorded in the project yet**: `runs/` does not exist there; the six session files and
  the round-1 result files are all there is (2026-11-23). Round 2 made two runs in a scratch clone.
- **The project is a git repository** (since 2026-11-22); results' small files are committed, large ones are not.

What it is part of: the long-term set-up of the project discussed on 2026-11-22 (version control, one record per run,
a fixed evaluation protocol, a status page), none of it decided or built. This decision does not wait on it (user,
2026-11-22).

Constraints that hold whatever is chosen:
- The user stays blind to every layout they have not played in both conditions of the human baseline (project
  `CLAUDE.md`, user 2026-11-20 and 2026-11-21); `gcsl.require_played` refuses them in the scripts.
- The repository must not be published as it is (project `CLAUDE.md`, Claude 2026-11-22): its history holds the
  layout file.
- Learned functions "may be inspected as diagnostics; they are not scored" (`PROBLEM_STATEMENT.md`).
- The assistant can read images, tables and text, not an interactive window; the user wants every diagnostic
  readable by both ("Yes, both of us", user, 2026-11-22).

What happens if nothing is done: the present way keeps working, one script per question, with the four problems
above; the user added no remark on it (asked 2026-11-22).

What the user wants to do on their own (user, 2026-11-22): choose what to look at (the run, the moment in training,
the goal, the state) among kinds of view that exist, and compare any runs, methods or seeds. Getting an answer that
needs a computation nobody has written yet was offered and not chosen: that stays the assistant's work.

Which questions the debug views should answer (user, 2026-11-22): where the agent wastes steps; what it learned, next
to the truth; how training went; what data it saw; and "other possible future debug utilities".

Added by the user in a remark (2026-11-22): "I'd also like to be able to see run results as they come in. Making it
work over a network connection would be nice, but that may be out of scope. I'd like to be able to make
annotations/comments for the agent anywhere in the program."

## Related decisions
- [gcrl-discontinuous-test-environment.md](gcrl-discontinuous-test-environment.md): the maze environment (decided).
- [gcrl-real-world-problem-statement.md](gcrl-real-world-problem-statement.md): the problem the agents are scored on.
- The long-term project structure (run records, protocol, version control): discussed 2026-11-22, no log, undecided.
- **What a run records**: [what-a-run-records.md](what-a-run-records.md), decided and reviewed by the user on
  2026-11-22 (it was to be decided first: user, round 1), and built (steps 1 to 6 of its plan, 2026-11-22); what it
  gives this decision is in *Situation*. Its step 7 (asking the user what using it showed) is still open. What it gives this decision: a run's ID is its date, time
  and a free label; its record is a folder of plain files in the repository with a score line per evaluation as it
  happens (live results); the experience and the networks are two disposable tiers that are made again by a
  remake, which is a new run naming its parent; a run stores what its networks can be asked as functions that
  need no project code, with each network's plain forward pass, loadable for six months; a list by scanning the
  records; pins. Its build is under way (its plan); round 2 of this decision can start on it.
  Its problem formulation started on 2026-11-22. First answers that touch this decision (user, 2026-11-22): a run
  is a method's training run in the maze, a probe or a human baseline session, so all three are things this
  decision's views may be asked to show; a stored run is also for making it again, continuing it and tracing a
  reported number back to it; disk space and run time are limits; not every run is kept for good. To weigh in
  round 2 against R1, R9 and R11, not before.
  Second answer (user, 2026-11-22): large run outputs are to be disposable and made again by rerunning, with
  approximately the same results ("the same conclusions"). For this decision that means a view of "run X at step
  N" may be computed from networks that are not the ones the first run had; whether an address and a remark may
  rest on that is open in the child log (its open question 3) and bears on R15 and on A8's addresses.
  This decision's round 2 starts after it: an address needs a run's name, live results need a write at every
  evaluation, and "what data it saw" needs the data stored.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| R1 | A run of any method in the project can be inspected the same way, without the inspection depending on that method | New methods arrive every few days (four in three days); work per method would make upkeep high (R16) | user's request, 2026-11-22 ("any model"); reason inferred | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R2 | A new environment or kind of model is not blocked by it | None is planned ("none known yet"); the wish is not to be blocked when one arrives | user, 2026-11-22 | should | yes |
| R3 | A new kind of diagnostic can be added later without redoing what exists | Diagnostics keep being added ("other possible future debug utilities") | user's request and answer, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R4b | The views help answer: where the agent wastes steps; what it learned, next to the truth; how training went; what data it saw | These are the questions the user has about a run | user, 2026-11-22 (replaces R4) | should | yes |
| R5b | The questions today's diagnostics answer stay answerable, presented in whatever way shows them best; today's figures and videos need not be kept or imitated, and the old scripts may go once replaced | Work already done would otherwise be lost; the drawings themselves carry no value | user, round 1 ("May be redrawn") and 2026-11-22 after the round ("The results don't have to be the existing figures; they may be presented in any way that is best for visualization."); replaces R5 | should | yes |
| R6 | Nothing of a layout the user has not played in both conditions reaches the user through it | The user's human baseline on that layout is spoiled, and that cannot be undone | project `CLAUDE.md` (user, 2026-11-20, 2026-11-21) | must | yes (standing rule; the user's own words and reason) |
| R7b | The assistant can get the same information as any view the user sees: the numbers behind it and a rendering of its own, which may look different | The assistant works on the methods and cannot operate an interactive window | user, round 1 ("Same information"); replaces R7 | must | yes |
| R8 | A run's results and its diagnostics can be seen together, in context | "It's difficult to look at the results in context with diagnostics" | user, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R9 | A relevant result can be found without knowing where it is stored | "it's difficult to navigate and find relevant results"; outputs are spread over many files | user, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R10b | The user chooses the run, the moment in training and any point of the map as goal and as state, among kinds of view that exist, without the assistant writing code | Today every new look needs a new script from the assistant; a fixed set of goals and states is not enough | user, round 1 ("Any point"); replaces R10 | must | yes |
| R11 | Any runs, methods and seeds can be put side by side | Comparing runs is hard today | user, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22). Scope from round 1: runs made after the run record is in place; "Old runs don't matter" |
| R12 | A view makes clear what the agent is doing and why it fails | Today's outputs are "hard to interpret" | user, 2026-11-22 | should (as claimed) | no |
| R13 | A run's results can be seen as they come in, while it trains | Without it the work is slower, not broken (the user's answer) | user's remark and answer, 2026-11-22 | should | yes |
| R14 | It can be used from another machine over a network | "would be nice, but that may be out of scope" | user's remark, 2026-11-22 | could | yes |
| R15 | The user can attach a remark to what they are looking at, and the assistant receives it together with what it refers to | To tell the assistant exactly which run, moment and place is meant, and to leave questions and instructions next to the evidence for a later session; without it the assistant may look at the wrong thing and observations get lost between sessions | user's remark and answer ("Both"), 2026-11-22 | should ("Important, not essential", user, round 1) | yes |
| R16 | It costs little effort to keep working as methods and experiments change. The effort to build it, and breakage when tools it depends on change, do not count | | user, 2026-11-22 (value); scope from round 1 ("Neither") | should | yes |
| R17 | Getting from a question about a run to seeing the answer is quick | | user, 2026-11-22 (value) | should | yes |
| R18b | It is pleasant to use: moving through training glides, and values can be read under the cursor | Stepping through static pictures was offered and not accepted | user, round 1 ("Smooth matters"); replaces R18 | should | yes |
| R19 | A layout is shown by its number only, never by another name | The user must not learn another name for a layout | project `CLAUDE.md` (user, 2026-11-20); raised by the round-1 bias check | must | yes (standing rule) |
| R20 | A shown result says how much evidence it has: layout, models, environments, seeds | One model's score varies a lot between seeds (1.3 % and 5.2 % for one method), so runs side by side invite over-reading | project `CLAUDE.md` (the assistant's working rule, not the user's); raised by the round-1 bias check | should | no |
| R21 | Everything about a run can be seen combined in one interactive view, with elements that can be switched on and off | | user's remark, round 1 ("I'd like to be able to view everything combined into one interactive window, with toggleable elements") | not stated | no |
| R22 | Results stay on the workstation; a page with them is published elsewhere only when the user asks for one | | user, round 1 ("Only on request") | must (as stated; what breaks was not asked) | no |
| R23 | A human baseline session can be inspected like a run and put next to an agent's runs on the same layout | The person is the baseline every method is measured against; the child decision counts a session as a run | inferred from the child log (user, 2026-11-22: a run is a training run, a probe or a human session); round 2 | not stated | no |
| W3 | Existing runs can be inspected | "Old runs don't matter": only runs made after the run record is in place need to be inspectable. Would come back if an old result has to be re-examined | user, round 1 | won't | yes |
| W1 | The user answers a question that needs a new computation without the assistant | Offered and not chosen; new computations stay the assistant's work. Would come back if the user wants to write diagnostics themselves | user, 2026-11-22 | won't | yes |
| W2 | The user can read and change its code themselves | Offered as a value and not chosen. Would come back if the user wants to maintain it | user, 2026-11-22 | won't | yes |

## Options
Rows A to E come from the round-1 generators (reports in `inspecting-experiment-results.discovery/`); O2 was added by the researcher, O3 to O7 and B4b after the round-1 bias check. No row was merged away: where two rows describe one tool (A2, B4, C5; A1, C6) or one mechanism (C4, B6), each keeps its row and says so. Verdicts and cells were corrected after the round-1 rejection check.

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O1 | The user's proposal: one extendable results viewer for any model and any environment, with many debug views | It is the problem's own shape; its best forms are C4, A3, B1 and A6, and it is judged through them | As those rows | as those rows | judged through its forms: B4b and A2 level, leading; A3 and B7 trailing (round 2) |
| O2 | Do nothing: keep one script and one output per question (added by the researcher, round 1) | Costs nothing now; every stored result stays as it is | The four problems the user named stay: no context, no finding, no looking around alone, hard to interpret | cheap | not applicable (R8, R9, R10, must) |
| O3 | Storage first (from the round-1 bias check): decide and build what a run records before any viewer: a name that survives moving and reruns, its method, a write at every evaluation, the data it saw, how its networks are called, the code that made it; with a regenerable index of runs | Everything else depends on it: finding, live results, what data the agent saw, and views of old runs that stay correct; the horizon ('later, for months') allows it | Shows nothing by itself; changes every method's shared training code once (one loop and one save point serve all four) | one-way (stored data and names) | not applicable alone (R8, R10, must); proposed as the first step of whichever option is chosen, and as a decision of its own (open question 1) |
| O4 | A combination (from the round-1 bias check): a tracker or catalogue for finding, curves, live results and the network (A1 or A5), plus the view command for goal and state (A8 or C1) | Finding by settings and live curves come ready-made; any goal and state through the command | Two places instead of one; a second store to keep in step; a command per look at a goal or state; remarks at most a note per run plus pasted addresses | costly (logging and a second store) | trailing (R8, R15, R17) |
| O5 | A hosted tracker (from the round-1 bias check; for example Weights and Biases): as A1, with reports and comments and reachable from anywhere, at no build cost | Network and comments without building anything | Results leave the workstation (open question 7); goal and state only as logged; not verified in this round | costly | not applicable (R10b, must): shows only what was stored beforehand (round-1 answers) |
| O6 | Extend the existing review program of the human baseline (from the round-1 bias check): its pygame window already replays sessions and draws visits, and the user knows it; add the stored policies, with the gamepad or keys choosing goal and state | Built on what the user already uses; free choice by steering | A second drawing path beside the figures; the assistant needs a twin renderer to read it; a desktop window only | cheap | trailing (R7, R14; R5 pending open question 9) |
| O7 | Self-contained interactive figures (from the round-1 bias check): per run a generated page of Plotly or Bokeh figures with sliders, hover values and zoom over stored arrays | Values under the cursor, zoom and smooth sliders with no process running | Only stored arrays; a second drawing path beside matplotlib; a dependency | cheap | not applicable (R10b, must): shows only what was stored beforehand (round-1 answers) |
| D1 | Order sheet: a page lists the kinds of view and their parameters; the user writes a short order in chat, the assistant fills it with one fixed command (no new script) and returns picture and numbers | No interface to build beyond the view command; the assistant sees every view by construction; finding goes through the assistant | Every look is an assistant turn (the generator's guess: tens of seconds, plus tokens) and needs a live session; nothing live while training | cheap | trailing (R17, R8, R11) |
| D2 | Run dossier: one generated document per run with settings, curves, standard pictures at a few moments and goals, the numbers behind them, and a separate reading by the assistant; an index line per run | Results and diagnostics in one place; an index; the assistant's reading helps interpretation | Goal, state and moment only among the standard pictures; a reading that can be confidently wrong; pictures for every run cost time and disk | cheap | not applicable (R10b, must): shows only what was stored beforehand (round-1 answers) |
| D3 | Exception brief: the user states expectations once; the assistant reads every run and reports only deviations with the one view that shows each | Removes most looking; uses the assistant's reading | The user does not choose what to look at; expectations must be rewritten as methods change; the unanticipated is not flagged | cheap | not applicable alone (R10, must); possible later addition |
| D4 | Exhibit numbers and remark slips: every view carries a stamp naming run, moment, goal, state and kind; a remark is a slip citing the stamp, in one file the assistant reads at the start of a session | Meets the remark need by naming alone, with any way of producing views | Produces and finds nothing itself; typing stamps by hand; depends on discipline | costly (remarks cite the stamps for good) | not applicable alone (R8, R9, R10, must); adopted as the remark format of the leading options (the address is the stamp) |
| D5 | Navigator and driver: in a review session the user says where to look and the assistant runs existing commands and posts each numbered view into one growing session page; remarks land under the view | Almost nothing to build beyond the view commands; remarks are tied to views by construction | A turn per look, so walking through 80 moments is 80 turns; needs a live session | cheap | trailing (R17, R8, R11) |
| D6 | Tearline custody: the assistant may see every layout; for a layout the user has not played, the user gets only numbers without geometry; a register says which layouts are played; a check sits inside every command | Meets the blindness rule by a check in the command, not by memory | It would relax today's rule (nothing computed from such a layout is shown); side channels need care | costly (a glimpse cannot be undone) | not applicable alone (R8, R9, R10, must); its check inside the command is adopted, without relaxing the rule |
| D7 | Test cards: before a run a card states the question, the expected result and which views will settle it; the run produces exactly those views next to the card | Results sit beside their diagnostics by construction; a result is found by its question | The user does not look around afterwards; the hundreds of existing runs are not covered; views chosen beforehand can miss the cause | cheap | not applicable alone (R10, must) |
| D8 | Finding aid and reference interview: the assistant keeps a described hierarchy of method, experiment, run and seed with a few lines each (why it was run, what changed, what was seen) and locates runs on request | Finding by meaning, not by file name | Shows nothing itself; descriptions go stale; reasons of old runs may be lost | cheap | not applicable alone (R8, R10, R11, must); its described index is adopted through B6 |
| A1 | A local experiment tracker (MLflow, trackio, Aim, TensorBoard): every run logs settings, curves and diagnostic pictures per step; the tracker's web interface browses, filters, compares and updates live. The field's documented route | Best at finding runs by settings and at overlaid curves; live; over the network; the assistant reads it through a command line or SQL | Shows only what was logged: goal and state are not axes a tracker knows; remarks are at most a note per run; a second store beside the run folders; the layout is the tool's | costly (logging calls in every method, a second store) | not applicable (R10b, must): shows only what was stored beforehand (round-1 answers) |
| A2 | Rerun as the display with a companion process (round 2: drafted as `r2/rerun/`): the core's arrays are logged for all moments of the current goal and start; Rerun's web viewer, embedded in an own page, scrubs the timeline natively; a click reaches Python through the npm viewer's `selection_change` event and an HTTP post (Python's `on_event` exists only in the notebook widget, read in the installed 0.43.2 source); a blueprint gives one map view per run and one curve view | Scrubbing glides natively (34 ms per moment on the GPU, tested headless); hover shows every layer's value in one tooltip; side by side by blueprint; over the network by design | A new goal re-logs every moment: 0.2 to 0.3 s for the current one, 14 to 15.5 s for all, and the recording grows with every click (19.5 to 36 MiB after two changes); two control surfaces (goal and remark in the own page; layers, time and zoom in Rerun's interface); the address is read from the blueprint's unstable format; toggling a layer is per view; 753 MB of Python packages plus 72 MB of viewer; values labelled 'Depth' | cheap (a shell on the core); pin the version | leading, level with B4b (round 2, after the rejection check): its weak cell is ~ R21, which has no priority yet |
| A3 | A data app over the core (round 2: drafted as a plain Bokeh server application, `r2/bokeh/`; Panel was not needed): Python callbacks compute each view on request; Bokeh draws arrows, images, paths and curves with native hover, zoom, pan and legend hiding; the assistant's PNG is the same Bokeh figure exported through headless Chromium | Hover, zoom and pan native; one drawing serves the user and the assistant (12.5 s per PNG); a change shows in 0.23 s; a run in progress followed by a periodic callback (simulated) | Each moment is a server round trip: a drag gives about 6 pictures per second (stepping, not gliding; tested); smoothness needs the arrays in the browser through custom JavaScript, which is then own drawing code too; runs fixed when the page loads; 33 MB library plus selenium and chromedriver for the PNG | cheap (a shell on the core) | trailing (R18b) (round 2) |
| A4 | A report card per run and a static gallery, generated when a run ends and while it trains; an index page; a compare page | No server; instant to open; an index | The user picks only among what was rendered; arbitrary comparisons need a page rendered on request; remarks need something beside the page | cheap | not applicable (R10b, must): shows only what was stored beforehand (round-1 answers) |
| A5 | A queryable catalogue of every stored result (Datasette over SQLite, FiftyOne): filter and facet a table of runs, moments, goals, kinds and file paths | Best at 'where is it' and 'which runs have X'; the assistant queries the same table | Answers where, not what the agent is doing: the pictures are whatever was already made; goes stale unless refreshed | cheap | trailing alone (R8, R10; R12 pending open question 10); a regenerable run index is part of the leading options |
| A6 | A purpose-built RL debugger of linked views (the Vizarel pattern): hovering a moment shows its state, selecting buffer points shows their trajectory | The richest interaction for understanding one run | High: linking is custom per pair of views; hover and lasso are what the assistant cannot use, so each linked state needs a written twin; no maintained code found | costly | trailing (R7, R3) |
| A7 | Checks that replace looking: probe tasks, health statistics and a pass or fail per run and moment | Narrows where to look; a verdict table both can read | Says which run is odd, not why; thresholds to keep honest; the user does not look around | cheap | not applicable alone (R8, R10, must); possible later addition |
| A8 | Addressable views, the core alone: one command renders `view KIND --run --step --goal --state` to a picture and its numbers; every view has an address; a remark is address, region and text in a plain file; any interface is a thin shell that builds addresses | The assistant and the user resolve the same address; no service; small | Not a viewer by itself: the user types commands or opens a folder of pictures | one-way for the address and remark formats (remarks cite them); cheap otherwise | trailing (R18, R8, R17); it is the core of the leading options and their first step after the run record |
| B1 | Telemetry workbook: every quantity is a named channel, a diagnostic is a registered function, one cursor (moment, goal, state) is shared by all panels, other runs are overlaid on a reference run with difference maps, and saved page layouts exist per question | Comparison against a reference run and the truth; one cursor for everything | Must be built; the linked cursor is the largest part; difference maps exist only between runs on the same layout | cheap (it grows out of C4) | not a rival: a later stage of the leading options (it scores level, with R12 better and more to build first) |
| B2 | Reading-room protocol: a worklist of runs with a status (new, looked at, has an open remark), declarative files that say which views to show for which question, and remarks as a saved view state with a snapshot, written by either party | Finding through a worklist; opening a run needs no choices; remarks work both ways | Organisation around a viewer, needs a renderer underneath; protocol files need upkeep | one-way for the view-state format | not a rival: an organisation on top of the leading options; its worklist status and two-way remarks are adopted |
| B3 | Coded timeline: detectors written by the assistant tag events on runs (score dropped, stuck at a wall, loops); a matrix of methods against events finds the moments; the user tags by hand too, which is the remark | Finding by what happened; counts over hundreds of runs | Needs a viewer to show a moment in; detectors have thresholds and miss things; computing time over all runs | cheap | not applicable alone (R8, must); possible later addition |
| B4 | Debug-draw recording: diagnostics log shapes in maze coordinates and one generic timeline viewer draws them (Rerun, or a small own viewer of about five kinds of shape) | As A2; the viewer knows nothing of methods | As A2 | costly | trailing (R10, R7, R15), pending open questions 2, 3 and 5; the same tool as A2 |
| B4b | An own page that draws layers of shapes itself (round 2: drafted as `r2/page/`): a small Python process (standard library) answers addresses with the core's numbers; one HTML file with plain JavaScript draws walls, arrows, path, value images and visits on a canvas as layers, the score curve beside them, values under the cursor from numbers it already holds, and prefetches a goal's arrays for all moments so the slider redraws locally. The assistant gets the same view as a headless screenshot of the page at the address in its URL, and the numbers from the same address | Glides once a goal's arrays are in (2 to 6 ms per frame, tested); a goal click shows the current moment in 0.20 to 0.34 s; one window with toggles, curve and two runs; the assistant's picture is the user's page itself (tested once: 12.6 s, numbers 19 ms); no dependency | All drawing, zoom, hover and colour scales are own JavaScript (about 280 lines in the draft), kept by the assistant; after a new goal the slider stutters for 3 to 6 s until all moments are in; requests run one at a time; payloads grow with runs and grid detail (1.5 MB per run per goal for arrows); no axes or colour bars yet | cheap (a shell on the core); the address and remark formats one-way | leading, level with A2 on every requirement with a priority (round 2, after the rejection check) |
| B5 | Annotated game record: an episode as a text record with, per step, state, action, learned value, true distance and the part of the step wasted, with marks on bad steps; remarks sit inside the record | The assistant reads it natively; shows where steps are wasted, step by step | Views over the whole map are not a record; little for what data it saw | cheap | trailing (R8, R10, R3) |
| B6 | Finding aid with addressable pictures: generated pages from experiment to method to run with a short description per level; every view is an address that a small local server renders on first request, with a twin address for its numbers; remarks are records of address, region and text. The archive pattern, not its software | As C4, and finding by browsing described levels | As C4, plus descriptions that go stale unless regenerated | one-way for the address and remark formats | leading together with C4: the same mechanism, and its described index is part of both leading options |
| B7 | napari with layers computed on request (round 2: drafted as `r2/napari/`): Shapes, Image and Vectors layers per run, the dims slider over the moments, clicks for goal and start, a matplotlib dock for the curve and the remark box | Layers and their eye icons native; arrows native; a desktop program the user starts with one command | 0.3 s per moment and the window blocks while it computes; its map could not be rendered offscreen on this machine (black canvas), so the assistant's picture is a separate matplotlib drawing; no use from another machine without remote desktop; 784 MB with PyQt6 (GPL-3.0); runs through XWayland on this machine (read in napari's source) | cheap (a shell on the core) | trailing (R18b; R14 a could) (round 2, after the rejection check) |
| B8 | Record once, ask later: a run database of settings, curves and all diagnostic numbers, browsed by facet with saved queries; every page a permanent link; a kept trail of what the user opened becomes the remark | Finding and the assistant's reading are native; remarks cost a click | Tables are not pictures; only what was computed beforehand; large field tables | costly | trailing (R10, R18; R12 pending open question 10) |
| C1 | One command, small multiples: `look.py KIND RUN [RUN ...] --at --goal --state` draws one figure whose rows and columns are the lists given, prints the same as a table, and appends a remark with `--remark` | No new dependency; the command line is the view's name for both parties | Every look starts a process and compiles for seconds; typing coordinates; nothing live | cheap | trailing (R17, R18) |
| C2 | A live window from the figure code: the view table in a matplotlib window with a slider for the moment, buttons for runs and kinds, clicks on the map for goal and state; the same code writes the picture for the assistant | No new dependency; free choice of everything | Not usable from another machine; crude text entry; stepped redraws; Tk under sway unverified | cheap | trailing (R18b ?, unmeasured; R14 a could) (round 2, after the rejection check) |
| C3 | An image database browsed with an existing viewer (Cinema): every kind of view rendered over a fixed grid of moments, goals and states, one table listing the images | Static pages; side by side with sliders tied to the table | Sampled goals and states only; about 5,000 images and 150 to 300 MB per run; minutes of rendering per run; no remarks; maintenance unverified | cheap | not applicable (R10b, must): shows only what was stored beforehand (round-1 answers) |
| C4 | The address is the view: a small local process keeps the networks warm and answers `/view/KIND?run=&at=&goal=&state=` with a picture, and the same address with its numbers; one plain page builds addresses (run and view choices, a slider for the moment, a click on a map for goal or state, a grid for side by side); a remark is the address plus text, appended to a file. Each kind of view is an entry in a table: what it needs from a run, how it computes its numbers, how it draws them. Its core is A8; drafted in round 1 | Free choice of run, moment, goal and state; the assistant fetches the identical address; one gate for the blindness rule; no new dependency; existing figure code is reused | About 500 to 800 lines including the page, kept by the assistant; static pictures; a process that holds some GPU memory; methods must declare how their networks are called | one-way for the address and remark formats (remarks cite them); cheap for the page | superseded by B4b: the same core and page, now drawing itself instead of showing pictures (round 2) |
| C5 | Record on timelines, scrub in a robotics viewer: each run also writes a Rerun recording | As A2 | As A2 | costly | trailing (R10, R7, R15), pending open questions 2, 3 and 5; the same tool as A2 |
| C6 | An experiment tracker as the catalogue: runs log settings, scores and a handful of diagnostic pictures per evaluation | As A1 | As A1, plus an importer for the hundreds of existing runs | costly | not applicable (R10b, must): shows only what was stored beforehand (round-1 answers) |
| C7 | Arrays with named axes (xarray with hvPlot and Panel): every diagnostic a labelled array, a generic viewer makes a control per axis | A new diagnostic gets its controls without viewer code; over the network | A heavy dependency tree; goals and states on the stored grid; generic plots do not draw walls, paths or coloured arrows without custom code | costly | trailing (R10, R8; R5 pending open question 9); a variant that computes on request lifts R10 |
| C8 | A run sheet at every evaluation, with the worst cases picked: a fixed page per run rewritten while it trains (curves, the worst evaluation runs as paths, the action field towards their goals, learned against true distance, where the data went) and a table splitting wasted steps by cause | Shows why it fails without anyone looking for it; live by construction | The sheet chooses, not the user; evaluations get slower by a render; a fixed list of causes to keep honest | cheap | not applicable alone (R10, must); its worst-case picking and split by cause are later view kinds |
| E1 | Notebook cockpit in VS Code: one notebook whose first cell builds controls from the table of view kinds (pickers, a slider over the moments, a clickable map, a note box that appends a remark with the address); the kernel stays warm; what is on screen is also written to a file for the assistant | Lives in the editor the user already has open; free choice of everything; a warm kernel | Widgets in VS Code have a record of trouble (a 2025 report of figures not appearing; custom widgets load scripts from a CDN); a kernel to keep alive; the assistant cannot read a widget's picture, so a twin file is needed | cheap (a shell on the same table) | trailing (R18b unknown; R14 ~): not drafted; widgets in VS Code have a record of trouble (round 2) |
| E2 | The chat is the viewer: a skill tells the assistant how to turn a request in words into a call of the view command; it answers with the table, a link to the picture and its reading; the next chat message is the remark | Smallest build; the assistant sees every view first | A model turn per look; whether the VS Code chat shows a picture inline is unverified (user reports say a placeholder) | cheap | trailing (R17, R8, R11); the same shape as D1 |
| E3 | Artifact review page with anchored comments: per question the assistant publishes a private claude.ai page with the chosen runs' curves and diagnostics and selectors over data embedded in it; the user comments on a place on the page and the comment reaches the assistant's session; republishing updates open pages | The remark need is met by an existing mechanism, anchored and delivered; works from any machine | Nothing is computed on a click, so every choice must be computed before publishing; a page per question, not a place for hundreds of runs; results leave the workstation for Anthropic's servers; publishing takes the assistant's time per question | cheap | not a rival: an extra for a finished comparison the user asks to comment on (R22); alone not applicable (R10b, must) |
| E4 | An inspector pane inside the chat panel: a Claude Code mod draws controls and a vector view beside the conversation and adds the pane's current address to every prompt the user sends | Every question to the assistant carries its address without the user doing anything | A TypeScript module on a new interface; views must also exist as small vector drawings (no raster picture, no clicks on the map in VS Code); cramped side by side | cheap | trailing (R8, R11; R5 pending open question 9) |
| E5 | Terminal light table in kitty: a fuzzy finder over a run index with the selected run's view as an inline picture; keys step the moment and switch the view | Fast finding by typing | Shell glue that tends to grow; an experimental feature of the finder; goal and state typed or picked from a list; each preview pays the command's start-up unless a warm process renders | cheap | trailing (R8, R11, R15, R17) |
| E6 | Photo-manager light table (digiKam): each rendered view a picture with its address in its metadata; tags and search find views, a light table compares two, ratings and captions go to sidecar files the assistant reads | Finding, comparing and captioning exist ready-made | Only views rendered beforehand; numbers have no place; a large application with its own database | cheap | not applicable (R10b, must): shows only what was stored beforehand (round-1 answers) |
| E7 | A page on local files without a server: one static page lists runs from an index and draws stored arrays in the browser; the current view is in its address; a button opens the chat with the remark and address filled in | No process to keep running; opens inside VS Code's integrated browser | Nothing is computed on a click, so choices are limited to arrays written beforehand; several of its browser features are unverified for pages opened from disk | cheap | not applicable (R10b, must): shows only what was stored beforehand (round-1 answers) |
| E8 | A private VS Code extension for runs: a tree of runs in the side bar, a custom editor that shows the inspector when a run is opened, editor splits for side by side, a click on the map answered by a Python process, a file watcher for runs in progress | Lives wholly in the editor; finding through the tree and Quick Open; computed on demand | The largest build: TypeScript for the extension, JavaScript for the view and a bridge to Python, all kept by the assistant | cheap | not a rival: a possible later home for the leader's page (a webview in the editor); level on the requirements, the largest build (round 2) |
| F1 | A Python-driven web scene (viser, Apache-2.0): a Python process places objects in a scene shown in the browser, with GUI controls (sliders, checkboxes, text) beside it and callbacks for clicks on scene objects and for pointer events; the maze seen from above (added by the researcher in round 2, by search) | Layers as scene nodes that can be hidden; controls and scene in one page; served over the network by construction | Made for 3-D: curves, hover values and a click position on a plane are not confirmed (a click on a 2-D point found no documented way in one search); not drafted | cheap (a shell on the core) | trailing (R18b ?, R8 ?), unverified: not drafted |
| F2 | A robotics data viewer with a Python server (Foxglove, or its open fork Lichtblick, MPL-2.0): the Python process streams maps, arrows and series to configurable panels; a panel can publish messages back to the server (`ClientPublish`) (added by the researcher in round 2, by search) | Panels, layers, timelines and plots ready-made; live by design | A click on the map reaching Python is not confirmed (only a Publish panel was found); Foxglove's own edition stopped being open source in its 2.0 release; a large application; not drafted | costly (data as its messages) | trailing (R10b ?), unverified: not drafted |
| F3 | An immediate-mode desktop program (Dear PyGui, MIT, on ImPlot): plots, heat maps and drag points redrawn every frame from Python (added by the researcher in round 2, by search) | Smooth by construction; drag points give a goal or start continuously; curves and maps in one window | A desktop window only (R14 ✗); the assistant needs a twin rendering; arrows are own drawing; not drafted | cheap (a shell on the core) | trailing (R18b ?, R14 a could), unverified: not drafted (round 2, after the rejection check) |
| G1 | A Python data-app framework with code that runs in the browser (Dash with clientside callbacks; Streamlit or Gradio without) (from the round-2 bias check): A3's family, the most used | Controls, layout and hover ready-made; clientside callbacks could switch moments in the browser without a round trip | Clientside callbacks are JavaScript, as in B4b; Streamlit reruns the script per interaction; a click on a picture needs a third-party component in Streamlit (round 1); not drafted | cheap (a shell on the core) | trailing (R18b ?), unverified: not drafted |
| G2 | A reactive notebook kept as a plain Python file (marimo) that also serves as an app (from the round-2 bias check) | The assistant reads and runs it headless; widgets re-run only what depends on them; no CDN widgets as in E1 | Smoothness of a slider over 81 moments and a click on a map not checked; not drafted | cheap (a shell on the core) | trailing (R18b ?, R10b ?), unverified: not drafted |
| G3 | Networks evaluated in the browser (from the round-2 bias check): the page receives each moment's weights and runs the plain forward pass itself, so dragging a goal glides too | Goal and moment both glide with no server round trip | Works only where a view is a plain forward pass; `act` and the method's own calls are more (policy output handling, the model's step), so views would need method code in JavaScript | cheap | not a rival: a later speed-up of the leader for plain forward passes; alone not applicable (R1, must: a view would depend on the method) |
| G4 | Staging (from the round-2 bias check): build the core and the plainest display or command first (A8, C1), use it for a while, then choose the display on evidence | Chooses on real use rather than drafts; nothing built that is thrown away | Until the display exists, ✗ R18b and ~ R8, R17 (as A8 in round 1) | cheap | not a rival: a way to order the build of either leader; asked in round 2's questions |

## Matrix
Marks: ✓ meets it, ~ partly, ✗ fails it, ? unknown.

### Round 2 (2026-11-23), the options still in contention
Scored against the requirements as they stand now (R5b, R7b, R10b, R18b, R19 to R23). The options that show only
what was stored beforehand fail R10b (a verified must) and are not re-scored: A1, C6, O5, A4, C3, D2, O7, E3,
E6, E7 (their verdicts say so); the others outside this table keep their round-1 verdicts, which rest on
requirements that did not change. B1 and B2 stay later stages, B6's index a part of whichever wins.

Assumptions for every row, so that no option gains from them: the core of round 2 (`r2/core.py`) is underneath
each, so R1, R3, R4b, R6 and R13 come from it (R13 was tested on the core with a run in progress; for the
displays it was simulated or only written). R9 is ~ for all: each draft lists runs from the record, without the
described index (B6) that would make it ✓. R11 is ~ for all: each draft shows two runs (Rerun all runs, with no
choice), not any number. R20 and R23 are ~ for all: no draft shows the amount of evidence or a human session, and
each could add it in the same way. R12 is ~ for all. A3, B7, F1 to F3 not drafted in round 2 are marked from
round 1, the drafts' reports, or searches (marked ? where unverified).

| Option | R1 | R2 | R3 | R4b | R5b | R6 | R7b | R8 | R9 | R10b | R11 | R12 | R13 | R14 | R15 | R16 | R17 | R18b | R19 | R20 | R21 | R22 | R23 | ✗, ~ or ? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *priority, verified* | must, yes | should, yes | must, yes | should, yes | should, yes | must, yes | must, yes | must, yes | must, yes | must, yes | must, yes | should, no | should, yes | could, yes | should, yes | should, yes | should, yes | should, yes | must, yes | should, no | not stated, no | must, no | not stated, no | |
| B4b | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ~ R2 ~ R9 ~ R11 ~ R12 ~ R14 ~ R20 ~ R23 |
| A2 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ~ R2 ~ R9 ~ R11 ~ R12 ~ R20 ~ R21 ~ R23 |
| A3 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ~ R2 ~ R9 ~ R11 ~ R12 ~ R18b ~ R20 ~ R23 |
| B7 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ✓ | ✗ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ~ R2 ~ R9 ~ R11 ~ R12 ✗ R14 ~ R18b ~ R20 ~ R23 |
| C2 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ✓ | ✗ | ✓ | ✓ | ✓ | ? | ✓ | ~ | ✓ | ✓ | ~ | ~ R2 ~ R9 ~ R11 ~ R12 ✗ R14 ? R18b ~ R20 ~ R23 |
| E1 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ✓ | ~ | ✓ | ~ | ✓ | ? | ✓ | ~ | ✓ | ✓ | ~ | ~ R2 ~ R9 ~ R11 ~ R12 ~ R14 ~ R16 ? R18b ~ R20 ~ R23 |
| E8 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ✓ | ~ | ✓ | ? | ✓ | ~ | ✓ | ✓ | ~ | ~ R2 ~ R11 ~ R12 ~ R14 ~ R16 ? R18b ~ R20 ~ R23 |
| F1 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ? | ✓ | ~ | ? | ~ | ~ | ✓ | ✓ | ✓ | ? | ✓ | ? | ✓ | ~ | ✓ | ✓ | ~ | ~ R2 ? R7b ~ R9 ? R10b ~ R11 ~ R12 ? R16 ? R18b ~ R20 ~ R23 |
| F2 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ? | ✓ | ~ | ? | ~ | ~ | ✓ | ✓ | ? | ~ | ✓ | ? | ✓ | ~ | ✓ | ✓ | ~ | ~ R2 ? R7b ~ R9 ? R10b ~ R11 ~ R12 ? R15 ~ R16 ? R18b ~ R20 ~ R23 |
| F3 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ✓ | ✗ | ✓ | ✓ | ✓ | ? | ✓ | ~ | ✓ | ✓ | ~ | ~ R2 ~ R9 ~ R11 ~ R12 ✗ R14 ? R18b ~ R20 ~ R23 |

R16 (should, verified) covers upkeep as methods and experiments change, not breakage when a tool changes: Rerun's
unstable blueprint format does not count against it, and whether the assistant's picture is a second drawing is a
cost no requirement covers (a tie-breaker; R3 is met either way, since adding a kind redoes nothing). Every
display has a screenshot route (the page and Rerun tested, napari only with Xvfb, guessed). E1's ~ R16 is round
1's: a kernel to keep alive. Corrected after the round-2 rejection check.

### Round 1, against the requirements as they stood then
R19 and R20 were added after the round-1 checks and are not columns here.

Assumptions that hold for every row, so that no option gains from them:
- **R1:** since round 2, every run stores how its networks are called (`act`, `forward-*`, the method's own calls),
  so a view needs no method code; this holds for every option alike.
- **R4b:** since round 2, runs store what the agent experienced (unless switched off), for every option alike.
- **R6:** ✓ for every option: the project's rule forbids training on a layout the user has not played, so no run of one exists, and every option reads runs through code that calls `gcsl.require_played`. What remains (a listing or store filled by code outside that check, a layout's name) is the same risk for all and is listed under harms.
- **R9:** ✓ where the option has an index of runs with their settings; a bare list of names is ~.
- **R13:** runs write a score line and the networks at every evaluation (since round 2). ✓ where the option then refreshes or streams by itself, ~ where someone must ask again.
- **R2:** ~ where choosing a place assumes a state that draws as a plane.

| Option | R1 | R2 | R3 | R4b | R5 | R6 | R7 | R8 | R9 | R10 | R11 | R12 | R13 | R14 | R15 | R16 | R17 | R18 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *priority, verified* | must, yes | should, yes | must, yes | should, yes | should, no | must, yes | must, yes | must, yes | must, yes | must, yes | must, yes | should, no | should, yes | could, yes | should, yes | should, yes | should, yes | should, yes | |
| O1 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ R2 ~ R12 ~ R16 ~ R18 |
| O2 | ~ | ✓ | ~ | ~ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ~ | ~ | ✗ | ✗ | ~ | ✗ | ✗ | ~ R1 ~ R3 ~ R4b ✗ R8 ✗ R9 ✗ R10 ✗ R11 ~ R12 ~ R13 ✗ R14 ✗ R15 ~ R16 ✗ R17 ✗ R18 |
| O3 | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | ~ | ✗ | ✓ | ~ | ~ | ~ R4b ✗ R8 ✗ R10 ✗ R11 ✗ R12 ~ R14 ✗ R15 ~ R17 ~ R18 |
| O4 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ✓ | ✓ | ~ | ~ | ~ | ~ | ~ R2 ~ R8 ~ R11 ~ R12 ~ R15 ~ R16 ~ R17 ~ R18 |
| O5 | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ~ | ✓ | ✓ | ~ | ~ | ✓ | ? | ~ R4b ~ R8 ~ R10 ~ R11 ~ R12 ~ R15 ~ R16 ? R18 |
| O6 | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ~ | ✓ | ~ | ~ | ✓ | ✗ | ~ | ~ | ✓ | ? | ~ R2 ~ R5 ~ R7 ~ R9 ~ R11 ~ R12 ✗ R14 ~ R15 ~ R16 ? R18 |
| O7 | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ~ | ~ | ~ | ~ | ✓ | ~ | ~ | ✓ | ✓ | ~ R2 ~ R5 ~ R9 ~ R10 ~ R11 ~ R12 ~ R13 ~ R15 ~ R16 |
| D1 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ~ | ~ | ✓ | ✓ | ~ | ? | ~ R2 ~ R8 ~ R11 ~ R12 ~ R13 ~ R14 ~ R17 ? R18 |
| D2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ~ | ~ | ~ | ✓ | ~ | ~ R10 ~ R11 ~ R13 ~ R14 ~ R15 ~ R16 ~ R18 |
| D3 | ✓ | ✓ | ~ | ~ | ~ | ✓ | ✓ | ~ | ~ | ✗ | ~ | ✓ | ~ | ~ | ~ | ~ | ✓ | ? | ~ R3 ~ R4b ~ R5 ~ R8 ~ R9 ✗ R10 ~ R11 ~ R13 ~ R14 ~ R15 ~ R16 ? R18 |
| D4 | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ~ | ~ | ✓ | ✓ | ~ | ~ | ~ R4b ✗ R8 ✗ R9 ✗ R10 ✗ R11 ✗ R12 ~ R13 ~ R14 ~ R17 ~ R18 |
| D5 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ~ | ~ | ✓ | ✓ | ~ | ? | ~ R2 ~ R8 ~ R11 ~ R12 ~ R13 ~ R14 ~ R17 ? R18 |
| D6 | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ~ | ✗ | ✗ | ✗ | ✗ | ✗ | ~ | ~ | ✗ | ✓ | ~ | ~ | ✗ R4b ~ R7 ✗ R8 ✗ R9 ✗ R10 ✗ R11 ✗ R12 ~ R13 ~ R14 ✗ R15 ~ R17 ~ R18 |
| D7 | ✓ | ✓ | ~ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✗ | ~ | ~ | ~ | ~ | ~ | ~ | ✓ | ? | ~ R3 ~ R4b ~ R5 ✗ R10 ~ R11 ~ R12 ~ R13 ~ R14 ~ R15 ~ R16 ? R18 |
| D8 | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ~ | ~ | ~ | ~ | ~ | ~ | ✗ R4b ✗ R8 ✗ R10 ✗ R11 ✗ R12 ~ R13 ~ R14 ~ R15 ~ R16 ~ R17 ~ R18 |
| A1 | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ~ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ~ R4b ~ R8 ~ R10 ~ R11 ~ R12 ~ R15 ~ R16 ~ R18 |
| A2 | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ✓ | ~ | ~ | ? | ~ | ✓ | ✓ | ~ | ~ | ✓ | ✓ | ~ R4b ~ R5 ~ R7 ~ R9 ~ R10 ? R11 ~ R12 ~ R15 ~ R16 |
| A3 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ R2 ~ R12 ~ R16 ~ R18 |
| A4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ~ | ~ | ~ | ✓ | ~ | ~ | ✓ | ~ | ~ R10 ~ R11 ~ R12 ~ R13 ~ R15 ~ R16 ~ R18 |
| A5 | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ✗ | ~ | ✓ | ~ | ~ | ✓ | ~ | ~ R4b ~ R8 ~ R10 ~ R11 ✗ R12 ~ R13 ~ R15 ~ R16 ~ R18 |
| A6 | ✓ | ~ | ~ | ✓ | ~ | ✓ | ~ | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ~ | ✓ | ✓ | ~ R2 ~ R3 ~ R5 ~ R7 ~ R9 ~ R11 ~ R14 ~ R15 ~ R16 |
| A7 | ✓ | ~ | ✓ | ~ | ~ | ✓ | ✓ | ✗ | ~ | ✗ | ~ | ~ | ~ | ~ | ✗ | ~ | ✓ | ? | ~ R2 ~ R4b ~ R5 ✗ R8 ~ R9 ✗ R10 ~ R11 ~ R12 ~ R13 ~ R14 ✗ R15 ~ R16 ? R18 |
| A8 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ~ | ~ | ✓ | ~ | ~ | ✗ | ~ R2 ~ R8 ~ R11 ~ R12 ~ R13 ~ R14 ~ R16 ~ R17 ✗ R18 |
| B1 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ? | ✓ | ~ | ✓ | ~ | ~ R2 ? R14 ~ R16 ~ R18 |
| B2 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ? | ✓ | ~ | ✓ | ~ | ~ R2 ~ R12 ? R14 ~ R16 ~ R18 |
| B3 | ✓ | ~ | ✓ | ~ | ~ | ✓ | ✓ | ✗ | ✓ | ~ | ~ | ~ | ~ | ~ | ✓ | ~ | ~ | ? | ~ R2 ~ R4b ~ R5 ✗ R8 ~ R10 ~ R11 ~ R12 ~ R13 ~ R14 ~ R16 ~ R17 ? R18 |
| B4 | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ✓ | ~ | ~ | ? | ~ | ✓ | ✓ | ~ | ~ | ✓ | ✓ | ~ R4b ~ R5 ~ R7 ~ R9 ~ R10 ? R11 ~ R12 ~ R15 ~ R16 |
| B4b | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ R2 ~ R5 ~ R12 ~ R16 |
| B5 | ✓ | ~ | ~ | ~ | ~ | ✓ | ✓ | ~ | ~ | ~ | ~ | ✓ | ~ | ~ | ✓ | ~ | ~ | ~ | ~ R2 ~ R3 ~ R4b ~ R5 ~ R8 ~ R9 ~ R10 ~ R11 ~ R13 ~ R14 ~ R16 ~ R17 ~ R18 |
| B6 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ R2 ~ R12 ~ R16 ~ R18 |
| B7 | ✓ | ~ | ✓ | ~ | ~ | ✓ | ✓ | ~ | ~ | ~ | ~ | ~ | ✓ | ✗ | ✓ | ~ | ✓ | ~ | ~ R2 ~ R4b ~ R5 ~ R8 ~ R9 ~ R10 ~ R11 ~ R12 ✗ R14 ~ R16 ~ R18 |
| B8 | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ✗ | ~ | ✓ | ✓ | ~ | ✓ | ✗ | ~ R4b ~ R5 ~ R8 ~ R10 ~ R11 ✗ R12 ~ R13 ~ R16 ✗ R18 |
| C1 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ~ | ~ | ✓ | ~ | ✗ | ✗ | ~ R2 ~ R8 ~ R12 ~ R13 ~ R14 ~ R16 ✗ R17 ✗ R18 |
| C2 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✗ | ~ | ~ | ✓ | ~ | ~ R2 ~ R12 ✗ R14 ~ R15 ~ R16 ~ R18 |
| C3 | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ~ | ~ | ✓ | ~ | ~ | ✓ | ~ | ~ | ✓ | ~ | ~ R4b ~ R8 ~ R9 ~ R10 ~ R12 ~ R13 ~ R15 ~ R16 ~ R18 |
| C4 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ R2 ~ R12 ~ R16 ~ R18 |
| C5 | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ✓ | ~ | ~ | ? | ~ | ✓ | ✓ | ~ | ~ | ✓ | ✓ | ~ R4b ~ R5 ~ R7 ~ R9 ~ R10 ? R11 ~ R12 ~ R15 ~ R16 |
| C6 | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ~ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ~ R4b ~ R8 ~ R10 ~ R11 ~ R12 ~ R15 ~ R16 ~ R18 |
| C7 | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ✓ | ~ | ~ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ~ R4b ~ R5 ~ R8 ~ R9 ~ R10 ~ R12 ~ R15 ~ R16 ~ R18 |
| C8 | ✓ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✗ | ~ | ✓ | ✓ | ~ | ~ | ~ | ✓ | ~ | ~ R2 ~ R3 ~ R9 ✗ R10 ~ R11 ~ R14 ~ R15 ~ R16 ~ R18 |
| E1 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ~ | ✓ | ~ | ~ R2 ~ R12 ~ R14 ~ R16 ~ R18 |
| E2 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ~ | ~ | ✓ | ✓ | ~ | ? | ~ R2 ~ R8 ~ R11 ~ R12 ~ R13 ~ R14 ~ R17 ? R18 |
| E3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ~ | ✓ | ✓ | ~ | ~ | ~ | ~ R9 ~ R10 ~ R12 ~ R13 ~ R16 ~ R17 ~ R18 |
| E4 | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ~ | ✓ | ? | ✓ | ~ | ✓ | ~ | ~ R2 ~ R5 ~ R8 ~ R9 ~ R11 ~ R12 ? R14 ~ R16 ~ R18 |
| E5 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ~ | ? | ~ | ~ | ~ | ~ | ~ R2 ~ R8 ~ R11 ~ R12 ~ R13 ? R14 ~ R15 ~ R16 ~ R17 ~ R18 |
| E6 | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ~ | ~ | ✗ | ✓ | ~ | ✓ | ~ | ~ R4b ~ R8 ~ R10 ~ R12 ~ R13 ✗ R14 ~ R16 ~ R18 |
| E7 | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ✓ | ~ | ✓ | ~ | ✓ | ~ | ~ R2 ~ R5 ~ R9 ~ R10 ~ R12 ~ R14 ~ R16 ~ R18 |
| E8 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ~ | ✓ | ? | ~ R2 ~ R12 ~ R14 ~ R16 ? R18 |

## Evaluation
**Round 2 (2026-11-23).** The core (A8) was built in a throwaway draft on the run record and serves every display:
one function turns (kind, run, moment, goal, start) into numbers, through the functions each run stored, with the
blindness check where runs are listed. Four displays were drafted on it by four independent agents, each with the
same brief (`r2/brief.md`), and measured. The own page (B4b) leads: it is the one draft that glides through
training and draws each view in one place, because the assistant's copy is a screenshot of the page itself at its
address (tested once). Rerun (A2) is the runner-up: it glides natively and has the richest hover, but needs two
control surfaces and re-logs every moment at each new goal. Bokeh (A3) steps instead of gliding. napari (B7)
blocks for 0.3 s per moment and could not be rendered offscreen here.

**After the round-2 checks, B4b and A2 are level** on every requirement with a priority. The page's lead rested on
a ~ R16 for Rerun that counted tool breakage (which R16 excludes) and a second drawing that Rerun's own screenshot
script avoids. What separates them: ~ R21 for Rerun (two control surfaces; R21 has no priority and is unverified),
and costs no requirement covers, which may only break the tie: the page needs no dependency and its address opens
the exact view, where Rerun's screenshot replays actions; Rerun has native timeline, hover and zoom, less own
drawing code, but a recording that grows with every click. The choice waits on R21 and on the user trying both
(R18b, judged by eye).

**The wait after a goal click is the core's, not the display's** (the researcher's test after the bias check): a
compiled loop over the 81 stored networks gives a goal's arrows for every moment in 10 to 16 ms and its paths in
about 225 ms, the same numbers as one call per moment; the drafts took 3 to 6 s (page) and 14 to 15.5 s (Rerun)
because they asked per moment. JAX cannot batch a stored function across networks (`vmap`: no batching rule for
`call_exported`), so the loop is sequential on the GPU.

Round 1's text follows, kept for its records.

After the round-1 checks, two options lead level on every requirement: C4 (a plain page over a small local process)
and A3 (the same in a framework). Both include B6's described index and both sit on the same core (A8): one
operation that turns an address (kind of view, run, moment, goal, state) into a picture and its numbers, and remarks
that cite addresses. C2, E1 and E8 are near-ties on the requirements. What separates these five is what the page is
made of and how much there is to build, which no requirement covers yet (open question 4), so the choice among
them is not made in this round.

The weak cells the two leading options share: ~ R2 (choosing a place assumes a state that draws as a plane), ~ R12
(as clear as its views are made), ~ R16 (own view code and an index whose descriptions go stale), ~ R18 (static
pictures; a slider that steps). A cost another option shares with them is not held against that option below.

### Rejection records (round 2)
The leader's weak cells, which no option is charged for below: ~ R2, R9, R11, R12, R20, R23.
- **A3, Bokeh: trailing (R18b, should, verified).** R18b: "moving through training glides, and values can be read
  under the cursor". Scenario: the user drags the moment slider to watch the arrows change and gets about six
  pictures a second, 0.23 s behind the hand (measured). Checked against the others: it meets R16 as the leader
  does (one drawing) and hover is native, where the leader's is own code, which no requirement covers (a
  tie-breaker at most). Best variant: the goal's arrays sent to the browser and switched by custom JavaScript;
  then it glides, but the drawing is own JavaScript as in the leader, and it is untested. Cells against the
  leader: ~ R18b where the leader has ✓; otherwise level.
- **B7, napari: trailing (R18b; R14 a could).** R18b: "moving through training glides, and values can be read
  under the cursor". Scenario: the user drags the moment slider and the window blocks for 0.3 s per moment
  (measured offscreen, drawing not included). Its matplotlib twin meets R7b as worded (a rendering "which may look
  different"); its map could not be rendered offscreen here, which only Xvfb would change (guessed). Best variant:
  the slider over a goal's arrays computed beforehand by the core's loop (10 to 225 ms for all moments), which
  might glide; untested. Cells against the leader: ✗ R14 and ~ R18b, where the leader has ~ R14 and ✓ R18b.
- **C2, a matplotlib window: trailing (R18b ?, unmeasured; R14 a could).** Not drafted in round 2. Scenario: the
  slider redraws a whole matplotlib figure per moment; how fast a window redraws was not measured (round 1 measured
  only pictures sent to a page: 1.6 s for eight). Best variant: blitting only the changed layers. Cells against the
  leader: ✗ R14 and ? R18b, where the leader has ~ R14 and ✓ R18b.
- **E1, a notebook in VS Code: trailing (R18b unknown, R14 ~, R16 ~).** Not drafted. Scenario: a widget does not
  appear (the 2025 report from round 1) and the user is left with a kernel and no view. Best variant: the leader's
  page shown in the editor (E8's home), which is the leader. Cells against the leader: ? R18b, ~ R14, ~ R16.
- **F1, viser; F2, Foxglove or Lichtblick: trailing, unverified (R10b ?, R7b ?, R18b ?).** Not drafted; one search
  each. Scenario: the user clicks a point on the map to set the goal and nothing reaches Python, since neither
  tool documents a click position on a 2-D plane (viser documents clicks on scene objects; Lichtblick a Publish
  panel). If either did, it would be a shell like Rerun, with the same two-surface risk for Lichtblick. Best
  variant: viser with an invisible plane object under the map that reports its click. Cells against the leader:
  ? on R7b (F1, F2), R10b, R16 (F1), R18b, R15 (F2); ~ R16 (F2).
- **F3, Dear PyGui: trailing (R18b ?; R14 a could), unverified.** Not drafted. It is the one non-browser option
  that could glide (it redraws every frame), which no draft checked. Scenario: the user wants to look from another
  machine and cannot. Best variant: the window's own frame saved as the assistant's picture (unverified). Cells
  against the leader: ✗ R14 and ? R18b. Worth a draft if the user wants a desktop window.
- **A2, Rerun, level with the leader (no rejection, the comparison):** after the rejection check its only weak cell
  the leader lacks is ~ R21 (two control surfaces; R21 has no priority, unverified); the leader's is ~ R14 (a
  could). It wins if R21 means only "layers I can switch" and the user prefers its native timeline and hover over
  the page's own controls once both are tried; it loses if R21 means one set of controls for everything.

### Rejection records
Each: the requirement as worded, the scenario that fails, that scenario against the other requirements, the best
variant, and its weak cells next to the leading options'.

- **O2, do nothing: not applicable (R8, R9, R10, must).** R8 "A run's results and its diagnostics can be seen
  together", R9 "found without knowing where it is stored", R10 "the user chooses ... without the assistant writing
  code". Scenario: the user wants the action field of last week's run at step 20,000 towards another goal; today
  that is a new script and a new file somewhere (confirmed by the rejection check: `gcsl_video.py` takes only a
  layout and a model number). No other requirement accepts this. Best variant: do nothing plus a naming convention
  (D4), which still fails R8 and R10.
- **O3, storage first: not applicable alone (R8, R10, must).** It shows nothing, so the user still cannot see a
  run's results with its diagnostics or choose what to look at. It is not rejected as a step: every leading option
  needs it, and it is proposed as the first step and as a decision of its own (open question 1).
- **A8, the core alone: trailing (R18, R8, R17).** R18 "pleasant to use", R8, R17 "quick". Scenario: to walk
  through training the user types 80 commands or opens 80 files, and curves and maps are separate files. R10 is met
  as worded (the user types, nobody writes code). Best variant: A8 plus something that builds addresses, which is
  any leading option. It is their first step, not a rival.
- **C1, one command with small multiples: trailing (R17, R18).** Scenario: every look starts a process; measured in
  the draft, a first view costs about 1 s of compiling after some seconds of start-up, against 0.055 s from a warm
  process. Best variant: C1 against a warm process, which is the assistant's command in the leading options.
- **C2, a matplotlib window: near-tie.** It differs from the leading options in two cells: ✗ R14 "used from another
  machine" (a could) and ~ R15 (a text field that takes one crude line; easy variant: remarks typed in the chat).
  Scenario: the user is at a laptop and there is no window at all. It needs no page code beside the figures. A
  tie-breaker no requirement covers: Tk under sway is unverified.
- **A3 against C4: level.** The two rows are the same in all 18 cells. They differ in what no requirement covers:
  C4 has own page code and no new dependency; A3 has a framework to follow and less page code. Choosing a place by
  clicking a picture needs a third-party component in Streamlit and is unverified for marimo and Panel; typed or
  slider controls keep R10 ✓ either way. C4 has a working draft; A3 has none. Because both sit on the same table of
  view kinds, the choice is cheap to reverse.
- **B6, finding aid with addressable pictures: leading together with C4.** The same mechanism; its described index
  is part of both leading options and is why their R9 is ✓ and part of why their R16 is ~.
- **B1, telemetry workbook: not a rival.** It scores level with the leading options and better on R12 (a reference
  run and difference maps). It is more to build before anything can be used: a cursor shared by every pair of
  panels, of which the draft's shared slider, goal and state are a part. Recorded as where the leading options
  grow to, with "difference against a reference run" as a later kind of view.
- **B2, reading-room protocol: not a rival.** An organisation on top of a renderer: with one underneath it scores
  level. Its worklist status (new, looked at, has an open remark) and its remarks in both directions are adopted.
  Its files that fix which views open for which question are left out for now: they are upkeep of the same kind as
  the index's descriptions.
- **A6, linked-view debugger: trailing (R7, R3).** R7 "The assistant can read every diagnostic the user can see"
  (must): hover and lasso states are views with no address, so ~. R3 "A new kind of diagnostic can be added later
  without redoing what exists" (must): linking is written per pair of views, so a new view touches existing ones,
  ~. Scenario: the user lassoes points and sees their trajectories; the assistant cannot be shown that view. Best
  variant: linked views whose every state has an address, which is B1.
- **A2, B4, C5, a recording in Rerun: trailing (R10, R7, R15), pending open questions 2, 3 and 5.** R10 (must)
  "The user chooses the run, the moment in training, the goal and the state": run and moment ✓, goal and state only
  among those logged, so ~. R7: the assistant reads logged tables, not the picture the user sees. R15: no remark
  feature was found in four searches, so a remark is a link pasted into a file by hand. Scenario: the user clicks a
  place nobody logged a goal for and nothing happens. R11 is unknown (side by side of two recordings was not found
  documented) and is not part of the verdict. It leads on R18 (smooth movement). Best variant: Rerun as the display
  of the leading options' view kinds, logging on request, which needs a companion process and the viewer's
  selection events (found for the notebook widget, unverified for the plain viewer). It would lead if a fixed set
  of goals is enough, smooth movement matters most, and remarks are not essential.
- **B4b, a small own viewer of shapes: trailing (R5), pending open question 9.** It scores as C4 with R18 ✓. R5
  "The diagnostics that exist today stay available" (unverified): each existing figure would be drawn a second
  time, as shapes. Scenario: a view exists as a matplotlib figure and not yet as shapes, so the page cannot show
  it. It is how C4 becomes smooth if stepping is not acceptable (open question 3).
- **A1, C6, an experiment tracker: trailing (R10, R15, R8), pending open questions 2 and 5.** R10 as for Rerun.
  R15: at most a note per run. R8: curves and logged pictures sit in separate panels of the tool's own layout.
  Scenario: the user sees the score drop at step 30,000 and wants the action field there towards the goal that
  fails; only pictures logged in advance exist. The bias check corrected one cost: there is one training loop and
  one save point for all methods, so logging is one change, not one per method. It is the field's documented
  route, so its rejection rests on R10 and R15 being real needs here.
- **O4, tracker or catalogue plus the view command: trailing (R8, R15, R17).** R8: curves live in the tracker and
  goal-and-state views come from a command, so results and diagnostics are in two places. R17: a command per look.
  Scenario: the user finds the run in the tracker, then types its name into a command to see its action field.
  Best variant: the tracker's part (index, curves, live) inside one page, which is a leading option.
- **O5, a hosted tracker: trailing (R10, R8), pending open questions 2 and 7.** As A1, with the results leaving
  the workstation. Not verified in this round.
- **A4, report cards; C3, an image database: trailing (R10, R15; A4 also R11, C3 also R8), pending open question
  2.** R10 ~: only what was rendered. Scenario: any goal not on the grid. They lead on R2 (pages of pictures assume
  nothing about the environment) and need no running process. C3 by its generator: about 5,000 pictures and 150 to
  300 MB per run. Best variant: pages whose pictures are addresses rendered on request, which is a leading option.
- **D2, run dossier: trailing (R10, R11), pending open question 2.** R10 ~: standard pictures only. It leads on
  R12 (the assistant's reading). Best variant: a dossier as a page of addresses with the assistant's reading as
  remarks; a later addition.
- **O7, self-contained interactive figures: trailing (R10), pending open question 2.** Only stored arrays.
  Scenario: any goal not stored. It leads on R18 (values under the cursor, zoom). Its figures could become the
  picture format of a leading option later, as B4b.
- **O6, extending the baseline's review program: trailing (R7, R14).** R7 (must) ~: a pygame window is not
  readable by the assistant unless every view is also rendered a second way. R14 (could) ✗. Scenario: the user
  points at something in the window and the assistant has no picture of it.
- **C8, run sheet with worst cases: not applicable alone (R10, must).** R10 as worded: "the user chooses ... the
  goal and the state"; here the sheet chooses. Scenario: the user wants another goal than the worst ones. Best
  variant: worst-case picking as a kind of view ("the worst evaluation runs at this moment"), which keeps the
  user's choice. It leads on R12.
- **D3, exception brief; D7, test cards; A7, checks: not applicable alone (R10, must; A7 also R8).** Scenario: the
  brief, card or verdict says a run is fine, and the user wants to look at it anyway, at a goal of their choosing;
  nothing lets them. Best variant: each on top of a leading option, with its entries as addresses.
- **D1, order sheet; D5, navigator and driver; E2, the chat as viewer: trailing (R17, R8, R11).** R10 is met as
  worded. R17 "quick" ~: every look is an assistant turn; how long that takes was not measured. R8 and R11 ~: each
  answer is one picture or one composed picture in a growing chat. Scenario: walking through 80 moments is 80
  turns. A tie-breaker no requirement covers: no look without a live session. Best variant: the assistant answers
  with addresses of a leading option; that works from its first day.
- **D4, exhibit numbers and remark slips; D6, tearline custody; D8, finding aid: not applicable alone (D4, D6: R8,
  R9, R10; D8: R8, R10, R11; must).** They show nothing. D4's stamp is the address and its slip the remark record;
  D6's check inside the command is the gate; D8's described levels are the index. D6's release of numbers for
  unplayed layouts is not adopted: today's rule shows nothing computed from them.
- **A5, a catalogue; B8, a run database: trailing (A5: R8, R10; B8: R10, R18), with R12 pending open question 10.**
  Scenario: the user finds the run and then sees rows or file paths, not what the agent does. Best variant: the
  index inside a leading option.
- **B3, coded timeline: not applicable alone (R8, must).** It lists moments and needs a viewer to show one.
  Scenario: the matrix says "stuck at a wall, 14 times" and there is nothing to open. Best variant: events whose
  entries are addresses, on top of a leading option.
- **B5, annotated game record: trailing (R8, R10, R3).** R8 ~: views over the whole map are not a record, so maps
  and curves live elsewhere. R3 ~: a diagnostic that is not a per-step number does not fit the record. Scenario:
  the user wants the learned time-to-goal over the map. Best variant: a path whose steps are marked by how much
  they waste, as a kind of view.
- **B7, napari; C7, labelled arrays with generic controls: trailing (R8, R10; B7 also R14, a could; C7's R5 pending
  open question 9).** R10 ~: goals and states on the stored grid. Scenario (B7): score curves do not fit an image
  viewer, so results and diagnostics end up in two windows. Scenario (C7): walls, paths and arrows coloured by
  waste need custom plotting again. Best variant: arrays computed lazily when a control moves, which lifts R10 and
  makes them a framework form of A3. They lead on R3: a simple new diagnostic needs no viewer code.
- **E1, notebook cockpit in VS Code: near-tie.** It differs from the leading options only in ~ R14 (a could).
  Tie-breakers no requirement covers yet (open question 4): widgets in VS Code's notebook editor have a record of
  trouble and custom ones load scripts from a CDN; a kernel must be kept alive.
- **E8, a private VS Code extension: near-tie on the requirements.** ~ R14 and R18 unknown; otherwise level. It is
  the largest build of all options (three languages), which no requirement covers yet (open question 4).
- **E3, Artifact page with anchored comments: trailing (R10, R17, R9), pending open questions 2 and 7.** R10 ~:
  nothing is computed on a click. R17 ~: a page is published per question. R9 ~: a page per question is not a place
  to find one of hundreds of runs. Scenario: the user wants another goal than the page holds and must ask for a new
  page. It has the one ready-made way to deliver a remark anchored to a place. Best variant: a published page for a
  finished comparison the user wants to comment on, beside a leading option.
- **E4, a pane in the chat panel: trailing (R8, R11; R5 pending open question 9).** Scenario: three runs side by
  side with their curves do not fit the pane. Its one strong idea, the current address added to each prompt, can
  be added to a leading option later.
- **E5, terminal light table: trailing (R8, R11, R15, R17).** Scenario: comparing three runs with their curves in a
  preview window. Best variant: the finder alone over the index.
- **E6, photo-manager light table: trailing (R10, R8), pending open question 2.** Only what was rendered; curves
  and numbers have no place beside the picture. Scenario: the user wants a goal no picture was rendered for. Best
  variant: none that keeps its character.
- **E7, a page on local files: trailing (R10), pending open question 2.** It is C4 without its process, so nothing
  is computed on a click.

### Findings of the round-1 checks
Rejection check (independent, given the leading option): 20 points, all taken. The main ones:
- C4 over A3 rested on "no new dependency", which no requirement covers: now level.
- R16 was stretched to cover build size and breakage by third-party updates: those are now tie-breakers, and its
  scope is open question 4.
- R13 was marked on unequal assumptions, and about twenty ~ marks on R6 had no reason: both are now marked under
  one stated assumption per column.
- B1 and B2 were "rejected" on cells equal to the leader's: now recorded as later stages, not rejections.
- Options that fail a verified must were called "trailing" in some rows and "not applicable alone" in others: now
  consistent.

Bias check (independent, not told the leading option; it read the options table before listing its own, so its
list of missing options is less independent than intended):
- **The run record is a prerequisite, not a neighbour.** A run has no name beyond its folder and file, a rerun
  overwrites it, it does not record its method or the code that made it, and it writes once at the end. About
  three quarters of the stored result files have curves only. Views recomputed from stored networks assume today's
  code can still call them. Taken: O3 added, open question 1 moved to the front.
- **Six musts rest on one confirmation of the problem paragraph**, and R10's deciding part is still open. Taken:
  open questions 2 and 12.
- **R1, R7, R10, R11 are worded more strongly or more narrowly than the user's words.** Taken as open questions 6,
  8 and 12; not reworded without the user.
- **Two standing rules were missing**: layouts by number only (R19) and saying how much evidence a result has
  (R20). Taken.
- **Missing options**: storage first (O3), a tracker plus the view command (O4), a hosted tracker (O5), extending
  the baseline's review program (O6), self-contained interactive figures (O7), B4's own small viewer (B4b). Taken.
- **Costs understated for the leading options**: drawing code in `gcsl_video.py` sits inside the video functions
  and needs rework, so "existing figure code is reused" holds for the computations only; a warm process beside a
  training run competes for GPU memory exactly when results are watched live; the assistant keeps several hundred
  lines of code the user does not read, in a project without history. Taken into the harms below.

### State after the round-1 answers (2026-11-22), before round 2
The matrix and the records above were written against R5, R7, R10 and R18 as they stood; they are to be redone in
round 2 against R5b, R7b, R10b, R18b, R21 and R22. What the answers already settle:
- **This decision waits on another.** The user wants what a run records decided first, as a decision of its own
  (child log: `what-a-run-records.md`). The viewer's addresses build on a run's name, so round 2 here starts after
  that decision.
- **Options that show only what was stored beforehand fail R10b (must, verified: "Any point")** and become not
  applicable as they stand: A1, C6, O5, A4, C3, D2, O7, E3, E6, E7, and A2, B4, C5 as a plain log viewer. A variant
  that computes on request survives where one exists (C7 and B7 with arrays computed when a control moves; Rerun
  with a companion process, if the viewer can report a click to it, which is unverified).
- **C4 as drafted no longer leads.** Static pictures in a grid are ~ or ✗ on R18b (smooth, values under the
  cursor) and on R21 (one combined view with elements switched on and off). Its core (A8: addresses, a table of
  view kinds computed on request by a warm process, remarks that cite addresses) is untouched by the answers.
- **Redrawing is no longer a cost** (R5b), and build effort and dependencies do not count (R16's scope). That lifts
  the options that draw layers themselves or through a tool.
- **The shortlist for round 2**, all on the same core, all to be drafted and tested before they are ranked:
  - B4b: an own page that draws layers of shapes (lines, arrows, images, points) over one map;
  - A3 in the form of a Bokeh or Panel application: its figures have layers, hover values and click positions
    built in (to verify: arrows, smoothness of a slider that asks the process);
  - B7 with computing on request: napari, whose layers can be switched on and off and whose mouse events reach
    Python (to verify: curves beside the map, use from another machine is not possible);
  - A2 with a companion process: Rerun as the display (to verify: clicks reaching the process outside a notebook,
    two runs side by side);
  - B1 and E8 remain later stages or homes of whichever is chosen.
- **E3 becomes an extra, not a rival**: a page is published only when the user asks for one (R22).
- **R7b** allows a display the assistant cannot see, as long as every state it shows has an address that gives the
  assistant the same information.

### The draft and its stress test (round 1)
A throwaway draft of C4 outside the project, on the seven stored layout-02 runs that kept their networks:
`core.py` (view kinds, addresses, the assistant's command), `serve.py` and `page.html`, in the session scratch
folder `viewer-spike/` (path in the round's report; not kept after the session unless copied).

What it did, on an RTX 2070 Super:
- One table of view kinds served seven runs of four methods: scores, greedy action at every point, a run from a
  state to a goal, learned and true time-to-goal, the model's steps. A run offers the kinds its stored networks
  allow.
- First view of each kind for a method: 0.66 to 1.1 s (compiling). After that 0.052 to 0.073 s per view, for any
  moment, goal or state, because the networks are arguments and nothing recompiles. Another method's first view:
  0.11 to 0.30 s.
- One view at all 81 moments in a row: 4.6 s. A page of 2 runs by 4 views (8 pictures and their 8 sets of
  numbers): 1.6 s per change of the slider; each view was computed twice there (once per form) by one thread.
- The process held 254 MB of GPU memory.
- A remark posted from the page arrived in a file as text, time and the address it was about; the assistant read it
  with `cat`. The assistant got the same picture and numbers from the command (1.2 s after start-up).
- Asking a run for a view it has no network for, or for an unknown run, was refused with the list of what exists.

What it showed about the design:
- **Methods do not say how their networks are called.** The draft had to know that a network named
  `time_to_goal` is called through `quasimetric.time_to_goal` and how the model's step is formed, and it left out
  WGCSL's value function. For R1 that knowledge must come from the method, not from the viewer.
- **A stored run does not name its method**, and its name in the draft came from its folder. Finding (R9) needs
  more than that.
- **Runs write nothing until they end**, so the draft shows no run in progress (R13).

Why the user might reject it in use: the slider steps instead of gliding (1.6 s for a full page); pictures are
static, with no value under the cursor and no zoom; the process must be restarted when view code changes; a wide
grid scrolls sideways.

### The drafts and their stress test (round 2)
In the session scratch folder `r2/` (path in the round's report): `core.py` (the shared core, about 170 lines),
`brief.md`, and one folder per display: `page/`, `bokeh/`, `rerun/`, `napari/`, each with screenshots, a remarks
file and the command to start it. Runs: two finished runs on layout-02 made in a scratch clone of the repository
(the model method and GCSL, one model, 8 environments, seed 0) and one run started to test live views.

On the core (measured by the researcher, RTX 2070 Super, one measurement each):
- Warm views: arrows 1 to 1.5 ms, a path 8 ms (after the rollout was compiled once per run: 1.2 s), steps to the
  goal over a 140 x 140 grid 35 to 47 ms, visits 0.6 ms. One view at all 81 moments: 0.3 to 1.1 s.
- A run in progress: listed as unfinished; its newest moment's path computed while it trained (57, 71, 74
  evaluations within 8 s); both processes shared the GPU (preallocation off).
- The stored functions served both methods with no method code in the core (`act` for both, `time_to_goal` only
  where the run has it).

The four displays (each agent's own measurements, in headless Chromium or offscreen; the machine was shared by
the four, so timings varied):

| | own page (B4b) | Bokeh (A3) | Rerun (A2) | napari (B7) |
|---|---|---|---|---|
| Items 1 to 7 of the brief | all work | all work | all work (5 partly: no run choice) | all work in synthetic tests; its map never seen |
| Moving through training | glides: 2 to 6 ms per frame once a goal's arrays are in | steps: about 6 pictures per second, 0.23 s lag | glides: 34 ms per moment, native | steps: 0.3 s, window blocked |
| A new goal | current moment 0.20 to 0.34 s; all moments 3.3 to 5.9 s | 0.27 to 0.42 s | current moment 0.21 to 0.32 s; all moments 14 to 15.5 s | about 0.3 s |
| Values under the cursor | own code, every layer | native per layer (tooltips overlap) | native, every layer in one tooltip | own code |
| Assistant's picture | the page itself, headless (12.6 s, researcher's test) or a matplotlib twin (1.2 s) | the same figure exported (12.5 s) | a matplotlib twin, or a headless screenshot | a matplotlib twin (0.7 s) |
| A run in progress | written, not run | simulated: works | written, not run | simulated: works |
| Code written | 167 server, 406 page, 119 twin | 171 views, 160 app, 62 twin | 234 app, 72 page, 90 twin, 78 snap | 289 viewer, 80 twin |
| Installed | nothing | bokeh 33 MB, selenium for the PNG | 753 MB of packages, 72 MB viewer | 784 MB (PyQt6, GPL-3.0) |
| From another machine | through an ssh tunnel (untested) | documented, untested | by design, untested | needs remote desktop |

What the drafts showed beyond the table:
- **Smoothness comes from having a goal's arrays in the display**, not from the tool: the page prefetches them, Rerun
  logs them; Bokeh and napari ask per moment and step.
- **A screenshot of the page is a twin that cannot drift**: the assistant's picture was the user's page at the same
  address (the researcher's test), so a new kind of view is drawn once. The same test showed a flaw: the headless
  page posted its address as the user's current view, so a twin must not write it.
- **The page's address names the moment by its index** (`i=60`), not its step; a remade run with other evaluation
  steps would then show another moment.
- **Found in the environment package, outside this decision**: a point on a shared edge between two wall boxes
  counts as free (Bokeh draft: (5, 5) accepted as a goal). Not checked further.

Why the user might reject the leader once in use: a hand-made look (no axes, colour bars or legends yet); the
3 to 6 s after each goal click before it glides; every refinement is more own JavaScript the user does not read;
zoom magnifies the same arrow grid.

### Findings of the round-2 checks
Rejection check (given the leader B4b and runner-up A2): seven points, all taken. A2's ~ R16 stretched R16 (tool
breakage excluded; its screenshot script avoids a second drawing): now ✓, and B4b and A2 level. B7's ~ R7b
stretched R7b (a rendering "which may look different" is allowed): now ✓; a second drawing is no R16 cost (B7,
F3 now ✓). C2's ~ R15 stretched R15: now ✓; its R18b is unmeasured: now ?. B4b's R14 rested on an untested tunnel
with no login: now ~. "No dependency" is said to be a tie-breaker only. The twin writing the user's current view
does not touch R15: a remark carries the page's own address, not that file.

Bias check (not told the leader):
- **The brief made one window and gliding the minimum**, so round 2 compared only live displays; R21 is unverified.
  Taken: R21 is the first question; staging (G4) is asked about.
- **Missing options**: data-app frameworks with browser-side code (G1), marimo (G2), networks evaluated in the
  browser (G3), staging (G4), and batching a goal over all moments in the core. Taken: G1 to G4 as rows; the
  batching was tested (above).
- **R1's reason is inferred and R1 is worded more strongly than what views can do** (a learned value exists only
  for methods that learn one): open question 5, asked again.
- **R15, R18b, R21 and R7b name means**: the needs as the check words them are "the assistant can tell which run,
  moment and place a remark means", "the user can follow how behaviour changes over training without losing their
  place", "everything about a run is in view together" (overlapping R8), "the assistant can check what the user
  saw". Not reworded without the user; R21 and R18b are asked.
- **R11: the core always reads model 0**; a run with several models (seeds) has no view of the others yet. Taken
  into the harms.
- **R23: the draft core leaves human sessions out** (`run_list` drops them). Asked.
- **The record names the method only by `name`**: `manifest.json`'s `method` field is `__main__` for every run
  started from a method's script (checked by the researcher in all three manifests). Addresses must not key on it.
  This is a defect of the child decision's record, outside this decision (said in the report).
- **The draft core falls back to a fixed list of played layouts** when no session is found, and `networks_at` and
  `visits` have no check of their own: fine for a draft; the real core needs one gate with no fallback.

### Harms and growth, for the leading options (B4b and A2, round 2)
- **For both: a run with several models**: the address needs a model (seed) index, or a view of all models
  together; the draft core reads model 0 only.
- **For A2: the recording grows with every goal or start** (19.5 to 36 MiB after two changes) and old rows stay;
  a long session needs the recording cleared, which the draft does not do.
- **For A2: two control surfaces**: goal, start and remark in the own page; layers, time and zoom in Rerun's
  interface, whose state the address reads from the blueprint.

### Harms and growth, for the leading option (B4b, round 2)
- **Own drawing code grows with every kind of view**, in JavaScript the assistant keeps and the user does not read
  (W2). It is written once (the screenshot twin), but each new kind needs its drawing, hover and colour scale.
- **Payloads grow** with runs, grid detail and kinds: 1.5 MB per run per goal for arrows, 257 KB per moment for
  steps to the goal. With four runs or a finer grid the wait after a goal click grows past 3 to 6 s.
- **One request at a time** in the draft's server: more panes queue. A process per request or a worker pool fixes it.
- **The address and remark formats are one-way** (remarks cite them): the moment must be named by its step, not its
  index, before the first remark is kept.
- **The server has no login**; bound beyond the workstation it lets anyone who reaches the port read runs and write
  remarks (R14, R22).
- **The blindness gate sits in the core** (`run_list`, `manifest`); a display that reads files itself would bypass
  it, so every new kind of view must go through the core.
- **GPU memory beside training**: shared without failure once, with preallocation off.

### Harms and growth, for the leading options of round 1 (C4, A3)
- **The address and remark formats are one-way.** Remarks cite addresses. If runs are renamed, moved or deleted, or
  a view kind changes what it shows, old remarks point at nothing or at something else. A run needs a name that
  survives moving, and a remark should keep a snapshot of the picture it was made on.
- **Hidden coupling to methods.** If each new method needs edits in the viewer, upkeep grows with every method
  (four in three days). The view kinds must depend only on what a method declares.
- **Stale process.** A long-lived process that imported the methods' code keeps showing old behaviour after the
  code changes, without saying so.
- **A second way to break the blindness rule.** A page that lists runs is a new path to the user's screen. The
  gate must sit where runs are listed and where views are rendered, not in the page.
- **GPU memory beside training.** 254 MB in the draft with preallocation switched off; JAX takes most of the card
  by default. Watching a run live is exactly when both processes run, and the viewer must not make training fail.
- **Own page code.** The assistant keeps it; the user does not read it (W2). If the page grows many controls, A3
  becomes the cheaper shell.
- **Old runs and changed code.** A view is recomputed by today's code from networks stored by older code. With no
  version control and no code version in a run, a change to a method can break an old run's views or, worse, draw
  them wrongly without saying so. Options that render while training do not have this risk.
- **A run's name can come to mean another run.** A rerun into the same folder overwrites the files, so an address
  in an old remark then shows a different run.
- **Less reuse than it looks.** The computations of today's views are separate functions; their drawing sits inside
  the video functions and must be redone as view kinds. The draft's 500 to 800 lines do not include that.
- **Growth.** Hundreds of runs need the described index, not a list of check boxes. Runs without stored networks
  (158 of 181 result files) offer only their curves. A second environment brings its own drawing of a state.

## Open questions
Round 2 (2026-11-23): questions 1, 2, 4, 6 and 7 below are still open; asked in round 2's report together with
a new one: R23 (a human session next to agent runs) and the user's verdict after trying the drafts (R18b, judged by
eye).

Answered in round 1: what a run records comes first (yes), any point (yes), smoothness (matters), R16's scope
(neither build effort nor breakage), R15 (important, not essential), which runs (new ones), data location (local
unless asked), R7 (same information), R5 (may be redrawn). Still open, for round 2:
1. R21: what is behind "everything combined into one interactive window, with toggleable elements": one map with
   layers, or also curves and several runs in that one view? And its priority. Decides between the shortlisted
   forms.
2. R22: what breaks if results leave the workstation without being asked for? Decides its priority.
3. R12: what would make a view clear enough ("what the agent is doing and why it fails")? Decides which view kinds
   come first.
4. R2: are the regression toy problems of `attention-toys` in scope now? They have no goal or state.
5. R1 and the other musts confirmed only through the problem paragraph (R3, R8, R9, R11): is each essential by
   itself, and is R1 right as worded when a view of a learned function exists only for methods that learn one?
6. R20: should a shown result always say how much evidence it has (layout, models, environments, seeds)?
7. R14: from which other machine, and when, would it be used? Decides whether a desktop program (napari) loses
   anything real.

## Sources
| Claim | Source (URL or `file:line`) | Date | Reliability |
|---|---|---|---|
| A warm view takes 0.052 to 0.073 s; a first view 0.66 to 1.1 s; 254 MB of GPU memory | measured on the draft (`viewer-spike/`), this machine | 2026-11-22 | measured once, one layout |
| Stored runs keep every network at 81 evaluations; the JSON holds layout, config, steps, curves and not the method | `experiments/gcrl-maze/gcsl/gcsl.py` (`train`, `save_checkpoints`); generator C, `gcsl.py:449-486` | 2026-11-22 | read in the code by two readers |
| Runs write their files once, at the end | generator C, `gcsl.py:598-602`; the draft found no file for a run in progress | 2026-11-22 | read by one reader, consistent with the draft |
| 39 checkpoint files against far more result files | counted by the researcher (181 JSON, 39 npz) and by generator C (158 and 39) | 2026-11-22 | both counts give 39 checkpoint files |
| A tracker shows what was logged; goal and state are not its axes | generators A (A1) and C (C6), independently | 2026-11-22 | two reports; follows from how trackers work |
| Rerun has no remark or comment feature | not found by generators A, B and C, nor by the researcher's search (rerun.io, docs.rs `re_viewer`) | 2026-11-22 | unverified: absence in four searches |
| Rerun reports selection and time events to Python | https://rerun.io/examples/feature-showcase/notebook_callbacks | 2026-11-22 | search summary; for the notebook widget, unverified for the plain viewer |
| Rerun shows two recordings side by side in one view | not found (search: only `rerun rrd compare`, a pass or fail check of two files) | 2026-11-22 | unverified |
| Streamlit needs a third-party component for click coordinates on a picture | https://pypi.org/project/streamlit-image-coordinates/0.1.9 ; https://discuss.streamlit.io/t/capturing-mouse-click-in-relation-to-an-image/9021 | 2026-11-22 | search summaries, two sources |
| matplotlib figures can be drawn without pyplot inside a web server | https://matplotlib.org/stable/gallery/user_interfaces/web_application_server_sgskip.html ; done in the draft | 2026-11-22 | documented and run |
| A published claude.ai page takes comments anchored to places on it and delivers them to the assistant's session | https://code.claude.com/docs/en/artifacts (generator E); this session's tool descriptions (`ArtifactComments`) | 2026-11-22 | two sources; that one user can comment on their own unshared page is unverified |
| VS Code opens local pages in an integrated browser | https://code.visualstudio.com/docs/debugtest/integrated-browser (generator E) | 2026-11-22 | one source; not tried |
| Rerun's Python `on_event` exists only in the notebook widget; the npm web viewer reports `selection_change` with the scene position | the installed `rerun-sdk` 0.43.2 source and the `@rerun-io/web-viewer` 0.43.2 package, both tried in the Rerun draft (round 2) | 2026-11-23 | tested once by one agent; online changelog not searched |
| A screenshot of the own page at an address reproduces the user's view; the numbers for that address take 19 ms | the researcher's test on the page draft (`r2/twin-page-shot.png`) | 2026-11-23 | tested once |
| Glide and step timings of the four displays | the four drafts' own measurements in headless Chromium or offscreen (round 2) | 2026-11-23 | one measurement each, machine shared; not cross-checked |
| napari 0.10 forces XWayland on Wayland with the Nvidia driver | `napari/_wayland_fix.py`, linking https://github.com/napari/napari/issues/8808 (napari draft) | 2026-11-23 | read in source by one agent |
| Foxglove's own edition stopped being open source in 2.0; Lichtblick is an MPL-2.0 fork | https://discourse.openrobotics.org/t/foxglove-2-0-integrated-ui-new-pricing-and-open-source-changes/36583 ; https://raw.githubusercontent.com/lichtblick-suite/lichtblick/develop/LICENSE | 2026-11-23 | search summaries, two sources |
| viser has click callbacks on scene objects; a click position on a 2-D plane not documented | https://github.com/nerfstudio-project/viser ; https://www.roboticsproceedings.org/rss22/p175.pdf | 2026-11-23 | search summary; unverified |
| Dear PyGui (MIT) redraws every frame and has drag points with callbacks | https://dearpygui.readthedocs.io/en/latest/documentation/plots.html | 2026-11-23 | search summary, one source |
| Tool versions, licences and upkeep in rows A1 to A8 | generator A's report (`r1-field.md`), with its own list of what it could not verify | 2026-11-22 | one report; not cross-checked, not deciding |

## Round checklist
Round 2.
Checklist:
- [x] Log (first round): its path in the report; new or resumed, and what was outdated (n/a: round 2, resumed)
- [x] Problem (first round): confirmed by the user (the line in *Problem*) (n/a: round 2; confirmed 2026-11-22)
- [x] Scope: split, widened or unchanged (unchanged; the child decision is built)
- [x] Requirements: new or changed ones, each a need (no mechanism) with reason, source, priority and verified (R23 added, unverified; matrix assumptions for R1, R4b, R13 updated)
- [x] Replaced requirements: new IDs, old rows moved; options re-checked from the old matrix column (none replaced this round; the contenders re-scored against R5b, R7b, R10b, R18b)
- [x] Written requirements: evidence found for each (commit, decision log) (R6, R19 unchanged in the project CLAUDE.md; R20 still the assistant's rule)
- [x] Deciding unverified requirements: asked this round, or assumptions after "can't answer" (asked: R21, R18b by trying, staging, R23, R22, R1, R20, R14, R2; R12 left for round 3, it moves no ranking)
- [x] Options: added, by the categories of Phase 3 (existing tools: F1, F2, F3; how others solved it: Vizarel, PolicyExplainer, MDPVis, the pattern of A6; what was built: the core and the screenshot twin)
- [x] Searches: recorded in the round's entry; or "no web search", said in the report (in the rounds file)
- [x] Deciding claims: cross-checked against a second source, or marked unverified (in Sources; the drafts' timings are single measurements)
- [x] Matrix: updated (round-2 table for the ten options in contention)
- [x] Rejection records: one per trailing or not applicable option (scenario, best variant, leader's cells compared) (round 2: A3, B7, C2, E1, F1, F2, F3; the stored-only options rest on round 1's records and R10b)
- [x] Harms: scenarios for the leading option (B4b, in Evaluation)
- [x] Reversibility: every option rated; one-way means extra stress-testing, said in the report (shells cheap; the address and remark formats one-way)
- [x] Draft and stress test: of the leading option; the draft's path in the report (r2/page and three rivals)
- [x] Bias check: findings in the log and the report; or "not independent" (in Evaluation; G1 to G4 added, the core's loop tested)
- [x] Rejection check: findings in the log and the report; verdicts corrected (seven points taken; B4b and A2 now level)
- [x] Ranking change: recorded (round 1's C4 and A3 level → B4b and A2 level; A3 and B7 trailing)
- [x] Report: what changed, recommendation, runner-up, must rejections, the checks' findings (in the chat)
- [x] Questions: deciding unverified ones first, ordered by ranking impact, through the question tool, remarks last (three calls)
- [x] Pushback: if the user picked a worse option, asked what makes it better (n/a: nothing picked yet)

## Rounds
- Problem formulation (2026-11-22): problem confirmed after four question calls; requirements R1 to R18, W1, W2.
- Round 1 (2026-11-22): first ranking. Before the checks C4 led and A3 was runner-up; after them C4 and A3 are level (with B6's index, on A8's core), C2, E1 and E8 are near-ties, and the run record (O3) is proposed as the first step and a decision of its own.
- After round 1's answers (2026-11-22): the options that show only stored views are out (R10b, any point); C4 as drafted no longer leads (R18b smooth, R21 one combined view); the shortlist for round 2 is B4b, a Bokeh or Panel form of A3, napari and Rerun each with computing on request, all on A8's core. Round 2 waits for the decision on what a run records.
- Round 2 (2026-11-23): the core built on the run record; four displays drafted and measured. Before the checks the own page (B4b) led and Rerun (A2) was runner-up; after them B4b and A2 are level, A3 (Bokeh) and B7 (napari) trail on R18b; G1 to G4 added; the wait after a goal click is the core's and a compiled loop removes it.

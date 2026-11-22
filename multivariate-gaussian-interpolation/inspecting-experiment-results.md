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

What it is part of: the long-term set-up of the project discussed on 2026-11-22 (version control, one record per run,
a fixed evaluation protocol, a status page), none of it decided or built. This decision does not wait on it (user,
2026-11-22).

Constraints that hold whatever is chosen:
- The user stays blind to every layout they have not played in both conditions of the human baseline (project
  `CLAUDE.md`, user 2026-11-20 and 2026-11-21); `gcsl.require_played` refuses them in the scripts.
- The project is not a git repository; stored results have no history (project `CLAUDE.md`).
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
  A run record would be shared with this decision.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| R1 | A run of any method in the project can be inspected the same way, without the inspection depending on that method | New methods arrive every few days (four in three days); work per method would make upkeep high (R16) | user's request, 2026-11-22 ("any model"); reason inferred | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R2 | A new environment or kind of model is not blocked by it | None is planned ("none known yet"); the wish is not to be blocked when one arrives | user, 2026-11-22 | should | yes |
| R3 | A new kind of diagnostic can be added later without redoing what exists | Diagnostics keep being added ("other possible future debug utilities") | user's request and answer, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R4b | The views help answer: where the agent wastes steps; what it learned, next to the truth; how training went; what data it saw | These are the questions the user has about a run | user, 2026-11-22 (replaces R4) | should | yes |
| R5 | The diagnostics that exist today stay available (score curves, paths, action fields, value and time-to-goal against the truth, model error) | Work already done would be lost | inferred from "diagnostics that exist now" | should | no |
| R6 | Nothing of a layout the user has not played in both conditions reaches the user through it | The user's human baseline on that layout is spoiled, and that cannot be undone | project `CLAUDE.md` (user, 2026-11-20, 2026-11-21) | must | yes (standing rule; the user's own words and reason) |
| R7 | The assistant can read every diagnostic the user can see (as an image, a table or numbers) | The assistant works on the methods and cannot operate an interactive window | user, 2026-11-22 ("Yes, both of us") | must | yes |
| R8 | A run's results and its diagnostics can be seen together, in context | "It's difficult to look at the results in context with diagnostics" | user, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R9 | A relevant result can be found without knowing where it is stored | "it's difficult to navigate and find relevant results"; outputs are spread over many files | user, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R10 | The user chooses the run, the moment in training, the goal and the state to look at, among kinds of view that exist, without the assistant writing code | Today every new look needs a new script from the assistant | user, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R11 | Any runs, methods and seeds can be put side by side | Comparing runs is hard today | user, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R12 | A view makes clear what the agent is doing and why it fails | Today's outputs are "hard to interpret" | user, 2026-11-22 | should (as claimed) | no |
| R13 | A run's results can be seen as they come in, while it trains Without it the work is slower, not broken (the user's answer) | user's remark and answer, 2026-11-22 | should | yes |
| R14 | It can be used from another machine over a network | "would be nice, but that may be out of scope" | user's remark, 2026-11-22 | could | yes |
| R15 | The user can attach a remark to what they are looking at, and the assistant receives it together with what it refers to To tell the assistant exactly which run, moment and place is meant, and to leave questions and instructions next to the evidence for a later session; without it the assistant may look at the wrong thing and observations get lost between sessions | user's remark and answer ("Both"), 2026-11-22 | should (chosen over "nice to have"; whether it is essential was not asked) | yes |
| R16 | It costs little effort to keep working as methods and experiments change | | user, 2026-11-22 (value) | should | yes |
| R17 | Getting from a question about a run to seeing the answer is quick | | user, 2026-11-22 (value) | should | yes |
| R18 | It is pleasant to use | | user, 2026-11-22 (value) | should | yes |
| W1 | The user answers a question that needs a new computation without the assistant | Offered and not chosen; new computations stay the assistant's work. Would come back if the user wants to write diagnostics themselves | user, 2026-11-22 | won't | yes |
| W2 | The user can read and change its code themselves | Offered as a value and not chosen. Would come back if the user wants to maintain it | user, 2026-11-22 | won't | yes |

## Options
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O1 | The user's proposal: one extendable results viewer for any model and any environment, with many debug views | | | | not judged yet |

## Open questions
1. R15: is leaving remarks for the assistant essential, or weighed against its cost? Decides whether an option
   without it can lead.
2. R5: must every diagnostic that exists today stay available, or may some be dropped? Decides how much carrying
   over an option has to do.
3. R12: what would make a view clear enough ("what the agent is doing and why it fails")? Decides how options are
   judged on it.

## Sources
| Claim | Source (URL or `file:line`) | Date | Reliability |
|---|---|---|---|

## Round checklist
Round 1.
- [ ] Log (first round): its path in the report; new or resumed, and what was outdated
- [ ] Problem (first round): confirmed by the user (the line in *Problem*)
- [ ] Scope: split, widened or unchanged
- [ ] Requirements: new or changed ones, each a need (no mechanism) with reason, source, priority and verified
- [ ] Replaced requirements: new IDs, old rows moved; options re-checked from the old matrix column
- [ ] Written requirements: evidence found for each (commit, decision log)
- [ ] Deciding unverified requirements: asked this round, or assumptions after "can't answer"
- [ ] Options: added, by the categories of Phase 3
- [ ] Searches: recorded in the round's entry; or "no web search", said in the report
- [ ] Deciding claims: cross-checked against a second source, or marked unverified
- [ ] Matrix: updated
- [ ] Rejection records: one per trailing or not applicable option (scenario, best variant, leader's cells compared)
- [ ] Harms: scenarios for the leading option
- [ ] Reversibility: every option rated; one-way means extra stress-testing, said in the report
- [ ] Draft and stress test: of the leading option; the draft's path in the report
- [ ] Bias check: findings in the log and the report; or "not independent"
- [ ] Rejection check: findings in the log and the report; verdicts corrected
- [ ] Ranking change: recorded
- [ ] Report: what changed, recommendation, runner-up, must rejections, the checks' findings
- [ ] Questions: deciding unverified ones first, ordered by ranking impact, through the question tool, remarks last
- [ ] Pushback: if the user picked a worse option, asked what makes it better

## Rounds
- Problem formulation (2026-11-22): problem confirmed after four question calls; requirements R1 to R18, W1, W2.

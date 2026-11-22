# Inspecting experiment results: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| R4 | Many kinds of debug views are available for a run | | user's request, 2026-11-22 ("many debug visualization utilities") | R4b (problem formulation): the user named the questions the views should answer |

| R5 | The diagnostics that exist today stay available (score curves, paths, action fields, value and time-to-goal against the truth, model error) | Work already done would be lost | inferred | R5b (round 1): they may be redrawn |
| R7 | The assistant can read every diagnostic the user can see (as an image, a table or numbers) | The assistant cannot operate an interactive window | user, 2026-11-22 | R7b (round 1): the same information, not the same picture |
| R10 | The user chooses the run, the moment in training, the goal and the state to look at, among kinds of view that exist, without the assistant writing code | Today every new look needs a new script | user, 2026-11-22 | R10b (round 1): any point of the map |
| R18 | It is pleasant to use | | user, 2026-11-22 (value) | R18b (round 1): smooth movement and values under the cursor |

## Dropped requirements
| # | Requirement | Why it isn't one (user's reason) | Source | Round |
|---|---|---|---|---|

## Problem formulation (2026-11-22)
The user's answers, in order:
- Looks at results through the assistant's reports in chat and by opening figures and videos; not the README tables.
- What is wrong: "It's difficult to look at the results in context with diagnostics, and it's difficult to navigate
  and find relevant results."; cannot explore on their own; no overview; hard to interpret.
- Horizon: later, for months; waits on nothing specific.
- Values: low upkeep, quick answers, pleasant to use (understandable code offered, not chosen).
- Scope: no other environment or kind of model known yet; wish not to be blocked.
- Exploring: choose what to look at, compare freely (asking new questions that need a new computation: not chosen).
- Debug views: where it wastes steps, what it learned, how training went, what data it saw, "other possible future
  debug utilities".
- Who reads: "Yes, both of us".
- Remark: "I'd also like to be able to see run results as they come in. Making it work over a network connection
  would be nice, but that may be out of scope. I'd like to be able to make annotations/comments for the agent
  anywhere in the program."
- Problem written back: "Yes, confirmed". Live results: "Slower, not broken". Remarks to the assistant: "Both"
  (pointing precisely, and steering across sessions).

## Round 1 (2026-11-22)
What was learned:
- Five generators (field, far fields, project, people and process, everyday tools) gave 40 options. Four of the
  five arrived independently at the same core: one operation "address in (kind, run, moment, goal, state), picture
  and numbers out", with remarks as records that cite an address (A8, B6, C4, D4, and generator E's "what all
  options share").
- Design-space map. Axes: when a view is computed (stored beforehand, or on request from the stored networks); who
  operates the look (the user in an interface, the user by command, the assistant on request, nobody); what it is
  made of (an existing tool, own code on what is installed, a convention). After the first four generators the
  cell "lives inside tools already in use (VS Code, the chat, the terminal, claude.ai pages)" was empty; generator
  E filled it.
- A draft of C4 was built outside the project and measured (log, *Evaluation*).
- Scope: unchanged for now, with one possible split raised as open question 6: what a run stores (its method's
  name, a file per evaluation, the data it saw) is shared with the undecided long-term project structure.
- The documented route of the field is an experiment tracker (A1, C6); it trails on R10 and R15.

Ranking after round 1: C4 leading (with B6's described index), A3 runner-up; nothing ranked before.

Searches:
- Generators A to E: their queries and sources are in their reports in `inspecting-experiment-results.discovery/`
  (`r1-field.md`, `r1-far-fields.md`, `r1-project.md`, `r1-people-process.md`, `r1-everyday-tools.md`).
- Researcher, web: "Rerun viewer annotations comments on recording ... selection callback Python on_event" (found
  notebook callbacks and viewer events; nothing on comments); "Rerun viewer compare multiple recordings side by
  side same view" (found only `rerun rrd compare`, a file equality check); "Streamlit get click coordinates on
  image ..." (found the third-party component `streamlit-image-coordinates`; nothing built in).
- Researcher, code: `gcsl.py` (`train`, checkpoints, `require_played`, `human_curves`), `gcsl_video.py`,
  `wgcsl/value_function.py`, `gcrl_maze/plotting.py`, `gcrl_maze/evaluation.py`, the stored layout-02 result files.

Round 1, after the checks (2026-11-22):
- Rejection check: 20 points (full text in the session; summary in the log's *Evaluation*). C4's lead over A3 had
  no requirement behind it; R16 had been stretched; R13 and R6 were marked unevenly. All taken.
- Bias check: the run record is a prerequisite; six musts rest on one confirmation; two standing rules were
  missing; six options were missing. All taken as rows, requirements or open questions.
- Ranking after the checks: C4 and A3 level, C2, E1, E8 near-ties, B1 and B2 later stages; O3 (storage first)
  proposed as the first step.

## Round 1: the user's answers (2026-11-22)
1. What a run records: "Yes, decide it first" (a decision of its own, before the viewer).
2. Goal and state: "Any point".
3. Smoothness: "Smooth matters". Remark: "I'd like to be able to view everything combined into one interactive
   window, with toggleable elements."
4. Upkeep: "Neither" (build effort and breakage by tool updates do not count).
5. Remarks for the assistant: "Important, not essential".
6. Which runs: "Old runs don't matter".
7. Data location: "Only on request" (local by default; a page is published only when the user asks).
8. Same view: "Same information".
9. Existing views: "May be redrawn".
Not asked yet: R12 (what makes a view clear), R20, whether `attention-toys` is in scope (R2), the wording of R1,
and the priorities of the new R21 and R22.

After the round (2026-11-22), the user added: "The results don't have to be the existing figures; they may be
presented in any way that is best for visualization." Taken into R5b: no view has to keep or imitate today's
figures. It changes no verdict (redrawing already counted as no cost) and frees the design of the views in round 2.

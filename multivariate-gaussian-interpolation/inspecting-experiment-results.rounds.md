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

## Round 2 (2026-11-23)
Start, the user: "The child decision is resolved, start round 2."

Done in round 2:
- Read what the child decision built (`runs.py`, `gcsl.train`); updated *Situation*, *Related decisions* and the
  matrix's assumptions (R1, R4b, R13 now come from the record for every option).
- Two runs in a scratch clone of the repository (`r2/repo`, outputs in `r2/outputs`): the model method and GCSL on
  layout-02, one model, 8 environments; a third to test views of a run in progress. The clone ran with the
  project's Python environment called by path (a second environment did not fit the scratch folder's quota). A
  symlink to the project's `.venv` was made by mistake and removed at once, against the project rule; nothing was
  deleted through it.
- The shared core (`r2/core.py`), measured by the researcher.
- Four displays drafted by four agents with one brief (`r2/brief.md`): own page, Bokeh, Rerun, napari.
- The researcher's test of the screenshot twin on the own page.
- New options F1 (viser), F2 (Foxglove or Lichtblick), F3 (Dear PyGui), from searches; not drafted.
- New requirement R23 (a human session next to agent runs), inferred from the child log, unverified.

What was learned: smoothness comes from holding a goal's arrays in the display, not from the tool; a screenshot of
the page at its address is a twin that cannot drift; napari cannot be rendered offscreen on this machine; Rerun's
clicks reach Python only through its npm viewer in an own page; Bokeh steps.

Searches (web, standard): "viser python web visualization GUI scene click event 2D"; "Foxglove Studio custom python
websocket server publish clicked point panel"; "Dear PyGui interactive plot drag point real time python scientific
viewer"; "reinforcement learning policy visualization tool interactive goal selection value function web dashboard
2025" (found Vizarel, PolicyExplainer, MDPVis: research systems, no maintained tool); "viser on_pointer_event scene
click ray origin direction" (nothing on viser); "Lichtblick open source fork Foxglove Studio license MPL". The four
draft agents searched and read their own tools' docs and installed sources (in their reports, summarised in the
log's *Evaluation*).

Round 2, after the checks (2026-11-23):
- Rejection check: seven points, all taken (A2's ~ R16 and B7's ~ R7b, C2's ~ R15 stretched; B4b's R14 ✓ on an
  untested tunnel; "no dependency" only a tie-breaker). B4b and A2 now level.
- Bias check: one window and gliding were the brief's minimum while R21 is unverified; G1 to G4 missing; batching a
  goal over all moments in the core; R1, R15, R18b, R21, R7b worded as means; the core reads model 0 only; the
  record's `method` is `__main__`. Taken as rows, harms, questions and a test.
- The researcher's test after the bias check: `vmap` over stored functions fails (no batching rule for
  `call_exported`); `lax.map` gives a goal's arrows for all 81 moments in 10 to 16 ms and paths in about 225 ms.

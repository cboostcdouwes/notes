# Inspecting experiment results: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| R4 | Many kinds of debug views are available for a run | | user's request, 2026-11-22 ("many debug visualization utilities") | R4b (problem formulation): the user named the questions the views should answer |

| R5 | The diagnostics that exist today stay available (score curves, paths, action fields, value and time-to-goal against the truth, model error) | Work already done would be lost | inferred | R5b (round 1): they may be redrawn |
| R7 | The assistant can read every diagnostic the user can see (as an image, a table or numbers) | The assistant cannot operate an interactive window | user, 2026-11-22 | R7b (round 1): the same information, not the same picture |
| R10 | The user chooses the run, the moment in training, the goal and the state to look at, among kinds of view that exist, without the assistant writing code | Today every new look needs a new script | user, 2026-11-22 | R10b (round 1): any point of the map |
| R18 | It is pleasant to use | | user, 2026-11-22 (value) | R18b (round 1): smooth movement and values under the cursor |
| R16 | It costs little effort to keep working as methods and experiments change. The effort to build it, and breakage when tools it depends on change, do not count | | user, 2026-11-22; scope round 1 ("Neither") | R16b (round 2): libraries preferred over own code the user would keep |
| R1 | A run of any method in the project can be inspected the same way, without the inspection depending on that method | | user's request, 2026-11-22 | R1b (round 2): "Where it can" |
| R22 | Results stay on the workstation; a page with them is published elsewhere only when the user asks for one | | user, round 1 | R22b (round 2): "Local network ok" |
| R26 | The controls live inside the viewer's own interface, not in a separate input box around it | | user, round 2 | R26b (round 3): "Must be Rerun's UI" |
| R24 | A remark can mark the part of the view by drawing on it, anywhere; at least by selecting an area | | user, round 2 | R24b (round 3): "Area is enough" |
| R14 | It can be used from another machine over a network | | user, 2026-11-22 | R14b (round 3): "Live page only" |
| R21 | Everything about a run can be seen combined in one interactive view, with elements that can be switched on and off | | user, round 1 | R21b (round 2): "Layers I can switch" |

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

## Round 2: the user's answers (2026-11-23)
1. R21: "Layers I can switch" (R21b replaces R21).
2. Trying the drafts: "I'm on a phone right now; start the servers so I can evaluate them over the network." The
   servers were started on the Tailscale address, stopped by the user ("Use the wifi interface.") and started again
   on the Wi-Fi address 192.168.2.135 (ports 5106, 5107, 9877; Rerun's 9876 on every interface, it takes no
   address). The drafts were made for a mouse; on a phone some controls do not work.
3. Staging: not answered; instead: "I'd like the remarks to be like a pencil tool; draw a remark, then type the
   remark into a box that pops up. If that's not possible then at least allow selecting an area." (R24.)
4. Remarks: "I have a preference for using libraries wherever possible as they are more future proof and I don't
   have to maintain them myself (R16). Without seeing the comparison I currently have a preference for Rerun."
   (R16b replaces R16.)
Effect, to re-score in round 3: R16b turns the page's own drawing code into a cost (~), A3 and A2 keep ✓; R21b
removes A2's ~ R21; R24 is new: the page can draw on its own canvas, Rerun gives a click's scene position only
(drawing over its canvas needs the view's transform, unverified). Still to ask: staging, R23, R22, R1, R20, R14, R2.
Follow-up answers (2026-11-23): staging: "Choose now"; "future proof": "Less own code"; R23: "Must". Remark: "The
rerun version is awesome, much better than the hand-rolled version, although I expect the features rerun offers are
not being utilized fully yet. Would it be possible for an annotation pencil to put marks anywhere on the UI? The
rerun version should probably not have the html input box; try to customize the rerun ui."
For round 3: Rerun leads on the user's trial and R16b; to find out: how far Rerun's own interface can be changed
(goal, start and remark entry inside it; a pencil over any part of it) and at what cost in own code (a custom
viewer is Rust against Rerun's internal API, which may weigh against R16b); what of Rerun's features the draft
leaves unused; a human session's paths as a Rerun entity (R23); the core's loop over all moments.
Second follow-up (2026-11-23): R22: "Local network ok" (R22b); R1: "Where it can" (R1b); R20: "Could". Remark: "The
web page version could be kept in simplified form for keeping track of live runs only." (R25, a could.)
Not asked yet: R14 (which machine; partly answered by the phone on the Wi-Fi), R2 (attention-toys in scope), R12.

## Round 3 (2026-11-23)
Start, the user's choice of what to try: "Custom Rust viewer" (not chosen: "Python only", "Pencil layer in page");
servers: "Stop them" (stopped). The trade-off said before the choice: own Rust code against Rerun's unstable
internals weighs against R16b ("less own code"); a spike, not a decision. Pushback, if the spike leads to choosing
it, is due at the decision.
Done in round 3: the spike of H1 by one agent (`r3/`, offscreen tests, MCP probe); the researcher read Rerun's
MCP docs, `viewer_control.proto` and `ViewerClient` (H2); bias and rejection checks. No web search by the
researcher; the spike read Rerun's repository at 0.43.2.
After the checks (2026-11-23): A2b, H3, H4 added; H1's lead thin (R24 ~ against ?; R26's reason not asked); B4b's
and A3's R26 corrected to ✓ and B4b's R18b to ~ (the user's verdict on the look); H1's R17 and R18b to ?.

## Round 3: the user's answers (2026-11-23)
R26: "Must be Rerun's UI" (R26b, a must); R24: "Area is enough" (R24b); R14: "Live page only" (R14b); remarks:
"No remarks". The question named H1's cost (Rust that breaks with Rerun releases, desktop only); the user chose
knowing it. Effect: H1 leads; A2 and A2b not applicable on R26b; H2 trails on R24b. H1's R16b ~ stays the known
cost. Not yet: the user seeing H1's window (R17, R18b by eye), R2, R12, R21b's priority.

## Round 3: the user tries H1 (2026-11-23)
"Show the draft Rerun version": H1 started on the desktop. The user's remark through the pencil (09:48): "I want to
see the OOD value function here, can the walls be hidden?" (a stroke round the top-left corridor and the wall above
it on the quasimetric-model map; the stroke had no map coordinates). Faults seen in that remark: no map coordinates
for the stroke, the toolbar's moment stale against the address, the screenshot caught the remark box fading out.
Asked: "Make the learned layer also show OOD areas. Can the pencil map area be fixed?" Done: the learned
time-to-goal over the whole map, walls included (`core.value_map`); walls can already be hidden with the layer's eye
icon. On the quasimetric-model network at its last moment, goal (11.2, 10.7): learned steps in free space 0.2 to
67.4 (median 35.4), inside walls 2.0 to 74.8 (median 37.1); one network, one goal. New requirement R27, priority
to ask in round 4.
The pencil: offered (1) the screenshot only, (2) reading the views' bounds from Rerun's blueprint store, about 50
lines, (3) asking Rerun upstream for a hover or view-transform event, (4) patching Rerun. The user: "50 more lines
is acceptable as it's temporary, and the rerun viewer brings many other benefits. Go for option 2." Built and
tested (see the log's spike section); it took about 80 lines and 65 of tests.
Incident: the session scratch folder was emptied around 20:19 (the core, the scratch clone and its runs, all
drafts, `remarks.jsonl` with the user's remark and its screenshot). The project, its `.venv` and the notes were
untouched. The core and the viewer were rebuilt from the session transcripts into `~/.cache/claude-r3-spike/work/`,
the two runs made again (new IDs `20261123-204911-quasimetric-model`, `20261123-205038-gcsl`); the remark's
text and address are kept here, its screenshot is lost. The first clone had linked the project's `.venv` into the
scratch folder; the new clone does not.
Then (2026-11-23): "Also display the value function from the start to any point of the map, I'm especially
curious about the OOD values of that map." Added: `core.value_from` (learned time from the start to every grid point,
walls included; the true one over free space) and the layers `learned_from_start` and `true_from_start`, logged
for every moment when the start changes. Quasimetric-model at its last moment, start (3, 11): learned 0.2 to 54.4
steps in free space (median 20.8), 2.7 to 60.2 inside walls (median 26.7); 1.35 times the true steps (median, free
space); d(start, x) and d(x, start) differ by 0.9 steps (median) in free space and 2.0 inside walls. One network, one
start. Part of R27.

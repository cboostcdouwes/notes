# Generator report D: people, process and the division of work

Lens: the need is met mostly by how the user and the assistant work together, by conventions and documents, or by
the assistant doing the looking on request. Not ranked, no recommendation. Only the brief was read; no project
files.

## How far the sources were checked

- Opened and read: the CIA page on the daily briefer, the arXiv paper on blind analysis, the Wikipedia article on the
  reference interview, the DICOM hanging-protocol example, the abstract of the CMS data-quality paper.
- Seen only as search summaries, not opened: all other URLs below.
- Could not be retrieved: the SETP flight-briefing document (host not found) and Andy Jones's original post on
  debugging RL (only secondary summaries turned up).
- Every figure for effort or waiting time below is my own estimate. Nothing was measured.

## Reformulations

**In the lens's terms.** One party holds the evidence and the means to produce views of it (the assistant); the
other holds the questions and the judgement (the user). How does the second direct the first's look, receive the
result in a form both can read, and leave a remark that stays attached to the evidence?

**What other fields call it.**

| Field | Their name for this problem |
|---|---|
| Intelligence analysis | Requirements and tasking: the request for information, the daily brief, the tearline |
| Clinical work | The order and the consult: order sets, the structured report (findings, impression), the ward round, the handoff |
| Accident investigation | The docket: factual reports kept apart from analysis |
| Archives and libraries | Arrangement and description (the finding aid) and the reference interview |
| Litigation | Production and citation of exhibits (Bates numbers), privilege review |
| Particle-physics collaborations | Data-quality monitoring, run certification, the shift logbook, blinding |
| Flight test | Test cards, the quick-look, the debrief |
| Film and sport | Dailies and circled takes; the film session and its cut-ups |
| Management accounting | Exception reporting |
| Software teams | Navigator and driver (strong-style pairing) |

**Wider.** How do the user and the assistant come to hold the same picture of what each method does and why it
fails, and keep that picture from one session to the next?

**Narrower (pointing).** How does the user name one run, moment, goal and state so that the assistant looks at
exactly that, and where does the remark on it live?

**Narrower (finding).** How is one result found among hundreds of runs without knowing where its files are?

**Inverted (the need goes away).**
- The user does not inspect runs. The assistant inspects every run and the user sees only what departs from what
  they expected.
- Each run answers one question that was written down before it started, so there is nothing to browse afterwards.
- Most runs are not worth keeping inspectable; a rule decides which few are.

## Titles (after rewriting them apart and dropping near duplicates)

Worked out: order sheet; run dossier; exception brief; exhibit numbers and remark slips; navigator and driver
session; tearline custody; test cards; finding aid and reference interview. The rest are listed at the end.

## Worked-out options

D1. Order sheet with a fixed request grammar. A one-page "formulary" lists the kinds of view that exist (score
curves, paths, action field, value and time-to-goal against the truth, model error) and the parameters each takes:
run, moment, goal, state, and what to put beside it. The user writes an order in a fixed short form, in the chat or
as a line in an orders file, for example `paths | run 0412 beside 0398 | moment 60 | goal G3 | from cell C5`. The
assistant fills it by running the one existing command for that kind of view, never by writing a script, and
returns the image together with the numbers behind it. Named bundles ("order sets") cover the standing questions of
R4b: "wasted steps" could mean paths, action field and time-to-goal against the truth, all for the same goal. A new
diagnostic is a new line in the formulary (R3). An order the formulary cannot fill is marked "needs a new
computation" and becomes ordinary work for the assistant, as W1 leaves it. For a run still training, the order is
filled from the moments stored so far (R13).
- Where it comes from: clinical order sets (a predefined group of orders for a common scenario) and the
  intelligence request for information, where a question is broken into tasks that map to sources.
  https://en.wikipedia.org/wiki/Computerized_physician_order_entry and
  https://www.army.mil/article/285410/priority_intelligence_requirement_management_in_divisions_and_corps
- It presupposes one command per kind of view that works for any method (R1). That part is software and is shared
  with most other options.
- Cost: the formulary and bundles are a page and a habit. Each look costs one assistant turn (my guess: tens of
  seconds, plus tokens), and no look is possible without a running session. Whether an order filled by the assistant
  counts as the user choosing "themselves" under R10 is open: no code is written, but the assistant stays in the
  loop unless the user types the same command. R6 rests on the assistant refusing orders for unplayed layouts.

D2. Run dossier with facts and reading kept apart. Every run (or every experiment, as a group of runs and seeds)
gets one generated document in a fixed order: identity and settings, with what differs from its parent run; score
curves; standard plates at a fixed few of the 80 moments for a fixed set of goals; the table of numbers behind each
plate; then a separate section "Reading", where the assistant answers the four questions of R4b and names the plate
each claim rests on; then "Open remarks". A docket index has one line per run: method, date, purpose, outcome.
Putting runs side by side is a comparison dossier with the same sections and one column per run. The dossier is
generated when a run ends and its sections are refreshed while it trains. A new diagnostic is a new section, and
older dossiers gain it when regenerated.
- Where it comes from: the accident investigator's public docket, which holds factual reports only and keeps
  analysis and probable cause apart, and the radiology report with "findings" and an "impression" that answers the
  referring question.
  https://www.aopa.org/news-and-media/all-news/2020/december/16/ntsb-opens-docket-on-collings-foundation-crash and
  https://pubs.rsna.org/doi/abs/10.1148/rg.2020200020
- Cost: a generator and a template; computing the standard plates for every new run and for the hundreds that
  exist (time unknown to me); disk space. The reading costs tokens per run and can be wrong in a confident voice,
  which the citing of plates only partly guards against. The user's choice of moment, goal and state (R10) is
  limited to the standard plates; anything else is a supplementary exhibit that has to be asked for. Dossiers of
  unplayed layouts must be withheld or reduced (see D6).

D3. Exception brief against standing questions. Here the need partly goes away. The user states once per method or
experiment what they expect, as numbers or in words: a success rate by a given moment, a learned distance within
some margin of the true one, no cell where the chosen action points into a wall. After each run or batch the
assistant reads all diagnostics itself (R7) and writes a short brief: one line for everything that met
expectations, and for each deviation the single view that shows it, with the nearest normal run beside it. The user
answers the brief with questions; these become taskings that the next brief answers. Runs that behave as expected
are never looked at by the user. During training, a deviation can raise a note before the run ends (R13).
- Where it comes from: management by exception, where only significant deviations from the plan reach the manager,
  and the daily intelligence brief, where the briefer notes the principal's follow-up questions and works with
  analysts to answer them at the next briefing (read on the CIA page).
  https://en.wikipedia.org/wiki/Management_by_exception and
  https://www.cia.gov/stories/story/a-day-in-the-life-of-a-pdb-briefer
- Cost: writing the expectations is the user's work and must be redone as methods change (four new methods in
  three days). What nobody anticipated is not flagged. The user's own free look-around (R10) is not provided by
  this alone. Assistant time and tokens per run. The user needs occasional spot checks to know how far to trust the
  briefs.

D4. Exhibit numbers and remark slips. A convention, not a tool. Every view ever produced, by whatever means,
carries a stamp in its corner and in its file name that encodes run, moment, goal, state and kind of view, for
example `R0412-m60-G3-C5-paths`. Maze cells get grid references like chess squares, so a place can be written
down. The same number leads to the image, to the table of numbers behind it and to the command that regenerates
it. A remark is a slip in one remarks file: the exhibit number, optionally a cell or region, the remark, its kind
(observation, question, instruction) and its state (open, answered). At the start of a session the assistant reads
the open slips, pulls each exhibit and answers under the slip. This is R15 met by naming alone, and it works with
any way of producing views.
- Where it comes from: Bates numbering in litigation, which gives every page of a production a permanent unique
  identifier so it can be cited and retrieved; the W3C Web Annotation model, in which an annotation is a body
  related to a target, with a selector for a part of it; and the annotated chess game, where comments attach to one
  specific move. https://en.wikipedia.org/wiki/Bates_numbering and https://www.w3.org/TR/annotation-model/
- Cost: a naming rule and a stamp added to each plotting command. The user types numbers by hand, with the
  friction and typing errors that brings. Numbers must stay valid when a run is repeated or files move. It produces
  no views and finds nothing by itself. It depends on discipline from both sides.

D5. Navigator and driver review session. The user operates nothing. In a review session the user says where to
look ("same run, moment 20; now the goal top right; put seed 3 beside it") and the assistant drives: it runs the
existing commands and posts each view, numbered, into one session page that grows downward. Whatever the user says
about a view lands under that view, so the transcript is the record of remarks and the assistant already knows
what each remark refers to (R15). The page is kept and opens the next session. It can be given fixed occasions: a
round after each batch of runs, where the assistant presents run by run and the user directs, and a board-style
sitting for comparing methods.
- Where it comes from: strong-style pairing, where the navigator decides and the driver only executes; tumor
  boards, where the radiologist controls the shared screen while the team discusses; the film session in sport,
  where the analyst prepares and shows the clips the coach asks for.
  https://www.ministryoftesting.com/software-testing-glossary/strong-style-pairing and
  https://pmc.ncbi.nlm.nih.gov/articles/PMC8147890
- Cost: almost nothing to build beyond the view commands and the page. Every step is one assistant turn, so looking
  around is slow next to a slider: walking through 80 moments is 80 turns unless one kind of view shows many moments
  at once. Every look needs a live session and spends tokens. Whether this is pleasant (R18) depends on the wait
  per turn, which I did not measure.

D6. Tearline custody for unplayed layouts. This meets R6 by dividing the work, not by a feature. The assistant is
the custodian and may look at everything. For a layout the user has played in both conditions, the user gets
everything. For any other layout the user gets only a tearline version: numbers that reveal nothing of the layout
(success rate, steps relative to the shortest path, model error) and the assistant's reading with all geometry
removed. Maps, paths and action fields stay in a sealed place. A register kept by the user says which layout has
been played in which condition. Unsealing a layout is a recorded step the user takes after playing it; the
withheld views are then released. Every product states its tier at the top.
- Where it comes from: blind analysis in particle physics, where the signal region or the answer stays hidden
  until the analysis is fixed and a review agrees to open it (read in the paper), and the intelligence tearline, a
  portion of a report that gives the substance without the sensitive part.
  https://arxiv.org/abs/physics/0312102 and
  https://www.dni.gov/files/documents/ICD/ICD-209-Tearline-Production-and-Dissemination.pdf
- Cost: the register, and a check of it inside every command that writes something the user can see. The check
  has to sit in the command and not in the assistant's memory, because one slip cannot be undone. Side channels
  need care: file names, thumbnails, images passing in a terminal, a sentence that describes a corridor. On sealed
  layouts the user cannot do the looking of R10 and R12 at all; the assistant does it alone.

D7. Test cards: decide the look before the run. The need partly goes away. Before a run or a batch, a card is
written by the assistant and approved by the user in a line: the question, the expected result, which kinds of
view at which moments, goals and states will settle it, and what would count as a surprise. The run then produces
exactly those views next to the card, and the result line of the card is filled in. The debrief is reading the
card. The cards also serve as the index: a result is found by its question (R9), and results sit beside their
diagnostics by construction (R8). A related practice is the probe run: a small run built so that its outcome is
itself the diagnosis.
- Where it comes from: flight test, where the flight is flown from test cards, reviewed against expected results
  in the debrief and summarised right after it; preregistration, where the analysis plan is fixed before the data;
  probe environments for debugging RL.
  https://www.sto.nato.int/publications/STO%20Technical%20Reports/RTO-AG-300-V14/AG-300-V14-$$ALL.pdf and
  https://osf.io/8mpji and https://pypi.org/project/probing-environments
- Not verified: the SETP document that describes the cards and the debrief summary could not be opened; the NATO
  volume was seen only as a search summary.
- Cost: a minute or two per experiment up front, which is much next to a 40-second run unless one card covers a
  batch. Exploratory looking and the hundreds of existing runs are not covered. Views chosen beforehand can miss
  the reason for a failure. Little to build: a card template and a run command that reads it.

D8. Finding aid and reference interview. For R9. The assistant acts as the reference desk of the archive of runs.
It keeps a finding aid: a described hierarchy of method, experiment, run and seed, where each level has a few
lines in the user's words: why it was run, what was changed, what was seen, where its outputs are, which remarks
exist. The description is written when the run is made, because that is when the reason is known, and amended
after a review. When the user wants something ("the run where it circled in the bottom corner", "the best seed of
Tuesday's variant") the assistant holds a short reference interview: restate the request, ask one narrowing
question if needed, hand over the located runs with their views, and check that this was what was meant.
- Where it comes from: the archival finding aid, which describes the arrangement and content of a collection so a
  researcher can locate material, and the librarian's reference interview, which exists because the question as
  first posed often differs from the actual need (read in the article).
  https://dictionary.archivists.org/entry/finding-aid.html and https://en.wikipedia.org/wiki/Reference_interview
- Cost: descriptions for the hundreds of existing runs. The assistant can fill in what settings and logs show, but
  the reason for an old run may be lost. Descriptions go stale when files move. Finding goes through the assistant,
  or through reading the finding aid as a text file. It shows nothing by itself.

## Other titles

- Hanging protocols: a named, fixed arrangement of views per question, with the current run and a prior run in
  fixed places (https://dicom.nema.org/medical/dicom/2024c/output/chtml/part17/sect_V.3.html).
- Contact sheet and circled takes: the assistant prints a grid of thumbnails over runs and moments; the user
  circles cells; only those are worked out in full. Thought unlikely to be chosen.
- Shift logbook with handoff: one chronological log of what was run, why and what was seen, with a fixed handoff
  entry between sessions (I-PASS style).
- Failure case conference: on a fixed day the assistant presents the worst runs in a fixed form: timeline, what
  happened, why, lesson.
- Failure codebook: each run is coded with failure kinds from a growing list, so "runs that fail like this one" is
  a lookup.
- Run certification: the assistant signs each run good, bad or unchecked per diagnostic, and the user can
  override, as shifters and experts do in a run registry.
- Annotated run record: the assistant writes a commentary on one run, moment by moment, like an annotated chess
  game.
- Episode walkthrough: the assistant narrates one episode step by step: state, action chosen, value, and what the
  shortest path would have done.
- Truth twin by convention: every view is always produced with the known-correct answer beside it, so no view
  needs a separate comparison.
- Reading cards: one card per kind of view that says how to read it and what each failure looks like in it.
- Double reading: two independent agent readers per run; the user is shown only where they disagree.
- Campaign wall: one sheet for the batch in progress, always in view and refreshed, in the manner of an obeya
  room. Thought unlikely to be chosen.
- Appraisal and retention: a rule decides which few runs stay inspectable and which are archived or dropped.
  Thought unlikely to be chosen.
- Weekly digest by method: a standing table of methods with what changed since last week.

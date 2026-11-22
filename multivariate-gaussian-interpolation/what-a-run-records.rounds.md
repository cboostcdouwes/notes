# What a run records: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| R18 | A run's large outputs (such as its stored networks) can be deleted at any time without losing anything that lasts: they are made again from the lasting record. Pictures, remarks and continued runs may rest on outputs that were made again | "Deleting would be risky" otherwise; the project has lost results to a delete before (2026-11-21) | user, 2026-11-22 ("Acceptable everywhere") | R18b (round 1) |
| R19 | Large outputs stay out of version control, snapshots and backups; the lasting record is small enough to be in them | "They would get versioned or backed up" | user, 2026-11-22 | R19b and R21 (round 1) |
| R5 | What the agent experienced during a run can be examined afterwards | "What data it saw" cannot be answered | parent R4b (user, 2026-11-22) | R5b and R22 (round 1) |
| R15 | Stored runs respect a limit on disk space | The user named it as a limit; amount not set | user, 2026-11-22 | R15b (round 1) |
| R17 | Runs worth keeping can be told apart from throwaway ones, and only the first are kept for long | "Depends on the run"; keeping everything meets the disk limit sooner | user, 2026-11-22 | R17b (round 1) |
| R20 | The assistant and its tools do not write to version-control history; the user reviews and commits every change | The user's standing rule for every repository; it would apply here from the day the project becomes one. Whether it also covers records a tool commits per run was not asked | user's global instructions ("Never commit, amend, stash, push or otherwise write to git history") | R20b (round 1) |
| R23 | The record works without a repository and uses one when it exists | Version control: "Yes, but later"; the run record is not to wait for it | user, round 1 | R23b (after round 1, the user's correction) |

## Dropped requirements
| # | Requirement | Why it isn't one (user's reason) | Source | Round |
|---|---|---|---|---|
| R20b | Nothing but the user writes to the code's history. Run records may be written to version control automatically, apart from the code | "The project will still use large changes, as the version control will not be manually managed; autonomous commits are okay in this repository, they will not be reviewed." The global rule does not apply to this repository | user, 2026-11-22 | start of round 2 |

## Problem formulation (2026-11-22)
Read: `gcsl.py` (the training loop and save point), the results folders and their sizes, the notes `TODO.md`, the
project `CLAUDE.md`, the parent log's round 1 and its bias check.

The user's answers:
- What has cost them something: "Unclear what made it", "Could not find a run". Not: "A result was lost".
- What counts as a run: method runs in the maze, probes and try-outs, human baseline sessions. Not: other
  experiments.
- What a stored run is for besides looking and comparing: "Make it again", "Continue it", "Use it as evidence".
- How long a run stays examinable: "Depends on the run".
- Limits: disk space and run time, no amounts.
- No version control: "Not deliberate".
- First write-back, corrected: "Large run outputs should be in a cache folder, the runs should have enough
  information to be able to rerun them with approximately the same results, so information like checkpoints can be
  recreated."
- How alike a run made again has to be: "The same conclusions".
- Why large outputs apart: "Deleting would be risky", "They would get versioned or backed up". Not: "They would
  fill the project".
- Pictures, remarks and continued runs resting on networks made again: "Acceptable everywhere".
- Second write-back: "Yes, confirmed".

A note on the tooling: while the parent log is open, the question gate (`round-gate.py`) holds a child log's
problem-formulation questions to the parent's checklist, because it only looks at logs that have a *Rounds*
section. The parent log was updated with what each answer means for it, which the gate accepted.

## Round 1
Discovery: four generators, each given only the brief (`what-a-run-records.discovery/brief.md`): F the field blind
to the project, G other kinds of engineering, H fields far from engineering, J the field with the project's code.

The four reports are in `what-a-run-records.discovery/`. Draft and measurements: `spike.py` and its logs in the
session's scratch folder. Checks: a bias check and a rejection check by fresh subagents on the log's extracts.

What was learned: the options differ on six parts, and most cover one; a design is one choice per part. A recorded
run is not measurably slower; the lasting record is 12 KB and the large outputs 138 MB at one model; a remake with
unchanged code ended at 0.0165 against 0.0187; continuing from the stored learner works. After the checks, O11
leads with O12 (the same on a tracker) a near-tie, J2's naming rule and G7's journal level, and F4 and O13 behind
on R20, which is not checked.

Searches: the generators' web searches are listed in their reports (F: experiment tracking, provenance capture,
signac, DataLad, DVC, Minari, XLA determinism, rliable; G: Nix and Guix, climate-model suites, batch records,
BagIt, game replays, run registries, bookkeeping journals, DataLad; H: museum accession, particle-physics run
lists, chess scoresheets, conservation of instruction-based art, batch records, audit working papers, allocation
concealment, trail decay). The assistant ran no web search of its own this round; tool licences, versions and
Python 3.14 support are from the generators and partly from memory, marked unverified in *Sources*.

Round 1's answers (2026-11-22): tool-written run records "Yes, apart from the code"; musts: "Tells what made it",
"Remake, safe delete" (not ticked: "Find and refer", "A repeat never replaces"); store: "Own plain files"; the
experience: "Disposable, but separate from the large outputs", for "Delete them independently" and "Keep it
longer"; the ID: "Datetime, but also an experiment name", the name being "A free label"; the same conclusions:
"I judge by eye"; disk: "No fixed number"; keeping: "Records may go too"; version control: "Yes, but later".

Correction by the user after round 1 (2026-11-22): "git will be added before implementation", replacing the answer "Yes, but later" as I had read it (the record working without a repository).

## Round 1's evaluation, as it stood before round 2
#### Rejection records
Corrected after the round-1 checks. The leading option's weak cells: ~ R3 and ~ R12 (copies of the code and a
remake after the code changed are designed, not tested; a remake may fail after the libraries change), ~ R6 (an old
run's networks are read by that run's code in a process of its own), ~ R10 (own code to keep), ~ R13 (the state to
continue from is written at the end and goes with the large outputs), ~ R14 (a number is tied to a run by citing
its ID), ~ R16 (not resolved by one run each), ~ R18b (as R12), ~ R19b (a place outside the snapshots does not exist
yet), ~ R21 (only the snapshots protect the record). A cost another option shares with it is not held against that option. The only verified musts are R7 (for
methods), R8 and R9, and no option fails one, so no option is "not applicable": every verdict is "trailing" or
"level", on priorities the user has not checked yet (open question 2).

- **O4, do nothing: trailing (R3, R11; also R1, R2, R4, R5, R13).** R3 "A run tells what made it: method, settings,
  seed and code"; R11 "A run can be found again without knowing where it is stored". Scenario: the README says
  5.2 % for a seed whose curves "are not kept"; the file under that name is a later run and holds no method or
  code. These are the two things the user said have cost them. No other requirement accepts it. Best variant: O5.
- **O5, the process only: trailing (R4, R5, R13; R3 by hand).** R4 "A run's results can be seen while it trains";
  R13 "A stored run can be trained further from where it stopped". Scenario: the user wants to continue the best
  run; nothing was stored to continue from, whatever the folders are called. Best variant: O6.
- **O6 and O6b, a run list and unique file names, without and with a separate place for large outputs: trailing
  (R4, R5, R13).** As O5. O6b removes O6's R18 weakness with a path. Neither is a rival: O6b is the first stage of
  building O11, and O1 the second.
- **O1, the middle composition: trailing (R13, R17, R18).** R18b "large outputs can be deleted at any time without
  losing anything the user still wants": networks sit with the record and nothing says what may go. Scenario: the
  disk limit is reached and nobody knows which 330 MB files are safe to delete. Best variant: O11.
- **F1, a self-describing run folder: contained, not rejected.** O11 is F1 with the learner state, the experience,
  source copies and pins added. F1 as described lacks those (R5 ·, R13 ~) and takes the code's identity from a
  commit, which there is none of here.
- **F2 (with J7), a tracker as described: trailing (R13, R18).** As described it does not continue or remake runs.
  The rejection check is right that this is a cost of a part, not of a design: with the missing parts built beside
  it, it is O12.
- **O12, O11's parts on a tracker: near-tie.** It differs from O11 in two cells: R7 ~ ("probes and human baseline
  sessions" fit as attachments and tags, not as records of their own) and R16 ? (a logging call per evaluation is
  not measured). What else separates them no requirement covers: a ready live view, search and comparison page on
  one side; a dependency whose database is the lasting record on the other. Not checked: that MLflow, Aim or
  trackio run on Python 3.14. Scenario against it: a probe's result is a JSON of its own shape, shown by the
  tracker as a file to download. Scenario for it: the user watches a run's curves the day the record exists,
  before the parent decision's viewer does. Which way this goes is a question to the user.
- **F3, a workspace addressed by settings: trailing (R2, R1).** R2 "Making a run again does not destroy an earlier
  one": the same settings are the same folder. Scenario: a remake to check a result lands in the first run's
  folder. Best variant: a repeat counter and the code hash in the state point, which is J2.
- **J2 with G1, recipe-addressed names: level.** The rejection check is right that R1 holds as worded. It is O11
  with another naming rule: the name says what the run is and changes with every edit of a loaded source file and
  every added setting; a citation needs name and realisation number. O11 takes the hash as a field. The choice of
  the ID's form is a question to the user, and one-way.
- **F4 (with G8), a commit per run with droppable content: trailing (R20, R3).** R20 "The assistant and its tools
  do not write to version-control history" (claimed, not checked; whether it covers run records is open question
  1). R3: DataLad wants a clean tree or declared inputs, and probes and untested changes run from changed code.
  Scenario: the assistant tries a change the user has not reviewed; to record the run the tool must commit it.
  It is the user's proposal as an existing tool. R4 corrected to ~: the files are readable while the command
  runs. Its seconds of hashing per run are not measured. Best variant: O13.
- **O13, DVC experiments with DVCLive: trailing (R20), not verified.** From the checks' own knowledge: it keeps a
  run with its uncommitted changes under a hidden ref, and gives live lines. If the user allows tool-written refs
  (open question 1) it has to be verified and compared with O11 properly; it needs version control first.
- **F5, cached build targets: trailing (R1, R2).** A cache key is not a name to cite, and a cache hit stands in
  for a run, so two repeats of one recipe are one entry. Scenario: the user remarks on "the run from this
  morning"; there is only a key that changes with any edit of the function. Best variant: J2 (realisations).
- **F7, exact replay: not ahead on any requirement.** Its gain, a remake that is the same bytes, goes beyond R12 as
  the user set it ("The same conclusions"), so it is not counted; its speed cost is unknown. The rejection check
  is right that its failure after a library upgrade is one O11 shares. O14 (finding the cause of today's
  differences) is its cheap first step and stands as an optional part.
- **F6, an offline-RL dataset as the record: trailing (R12, R3).** It records one requirement's data. R12 "enough
  to make the run again": settings and code are outside the format, and its collector does not fit a compiled
  loop (its own report). Best variant: J6.
- **G7, one journal: level.** No requirement separates one journal from a folder per run; the tie-break I gave (a
  delete) hits both, as the rejection check says. The draft used folders. Cheap to choose before the first run.
- **O15, Sacred's file observer: level for the parts it covers, not verified.** It would replace about 80 lines
  (the folder, the source copies) by a dependency with little activity that wraps the training code; the rest of
  O11 is built beside it. Set behind O11 by that tie-break only. To check if the user prefers an existing tool.
- **O8, H8, H5 and G3, other rules for keeping: level with O7.** All have R10 ~, as O7 has. Since outputs can be
  remade, a wrong removal costs a remake under any of them (R18b accepts it). O7 is taken first because it is the
  least to build, a tie-break; the rule is cheap to change later.
- **O16, the end state as part of the lasting record: trailing (R19b) as a rule for every run.** 6.5 MB a run in
  whatever protects the record. It removes O11's R13 weakness. Best variant, adopted: a pinned run keeps its
  state; and a state written at some evaluations too, so an interrupted run can continue (G2, H3).
- **J8, F8, H6, H2's certified list: later layers.** Each ties numbers to runs or defines "the same conclusions"
  over several runs, on top of some record. They would raise R14 from ~ to ✓. F8 needs several seeds per result,
  against the current rule of one model per run.
- **O2 and J3, version control as the code's identity: a part, not a prerequisite.** By the user's own workflow the
  assistant's change is uncommitted while it is being tested, so the commit names the code before the change.
  J3's ways to keep such a tree write objects and refs (R20, open question 1). Copies of the loaded sources (J4)
  name the code with or without a repository. Version control stays worth deciding for what protects the record
  (R21, O17) and the code.

#### Findings of the round-1 checks
Rejection check (independent, given the leading option): ten points, all taken.
- F2 was scored as a whole design although it is a part: its composition is now O12, a near-tie.
- F4's R4 was stretched (now ~); its DVC form was hidden in the merged row (now O13, unverified).
- J2's R1 ~ rested on a cost outside R1: now ✓, and the naming rule is a question, not a ranking.
- O8, H8, H5 and G3 trailed on a cell O7 shares: now level, O7 first by a tie-break.
- F7's scenario was one O11 shares: its record now says it is not ahead, not that it fails.
- F1 had no record and was scored unlike its twin J1: both corrected.
- O11's cells went beyond the draft: R3, R12, R13, R18, R19 are now ~, and the draft section lists what was not
  tested. The draft's table gave 12 KB for a record that was 2.8 MB (the experience was written into it):
  corrected.
- "Standard library" and "no tool needed" are gains no requirement covers: now named as tie-breaks.
- R7's header claimed more than its row; R8 was ✓ for options that leave today's gap open (probes skip the check
  for unplayed layouts): corrected. F3 and F5 were marked ✗ where their twins had ·: corrected.
- O6 with a separate place for large outputs was not compared: now O6b, the first stage.

Bias check (independent, not told the leading option; it opened the draft folder's `evaluation.md`, which held the
verdicts, after listing its own options, so its last two points may be anchored):
- **R12 and R18 rest on "the same conclusions", which is undefined.** Taken: asked this round (open question 8
  moved up).
- **R18's "at any time" contradicts the harm that a remake may fail after the libraries change.** Taken: the lock
  file is copied, the record says when a remake is no longer possible, and R18 is ~ for O11.
- **R18 and R19 named mechanisms; R19 held a clause of the assistant's.** Taken: R18b, R19b; the missing need
  behind the clause is R21 (the lasting record is protected), inferred and to be asked.
- **R6 loses most of its point once networks are disposable; R20 stretches a rule about code to data records;
  R13, R14 and R19 come from menus the assistant worded.** Taken as questions: R20 and the priorities.
- **The draft tested less than "measured in the draft" said**: no source copies, in-memory patches invisible to
  the hashes, the lock file not copied, sizes at one model. Taken (the draft section).
- **O3's cost was overstated**: a nested volume inside `/home` would likely do. Taken; not tested.
- **The blindness gap is real and need not wait**: `require_played` is called only in `main` (`gcsl.py:576`), so a
  probe on an unplayed layout is not refused. Taken: raised with the user in the report.
- **Missing options**: O1 as its own row, DVC apart from DataLad (O13), Sacred's file observer (O15), a tiered
  record (O16), finding the cause of the differences (O14), a repository for records only (O17); J7 and G8 named
  no row they merge into. All taken.

#### State after the round-1 answers (2026-11-22), before round 2
The user's answers and what they change; the matrix above is from before them and is redone in round 2.
- **Verified musts are now R3, R12, R18b, R20b, with R7 (methods), R8, R9.** R1, R11 and R2 are shoulds.
  On these, O4 (do nothing: ✗ R3) and F3's weak R3 aside, the leading option still has ~ on R3, R12 and R18b:
  those are the cells round 2 has to turn into tests (source copies, code patched in memory, a remake after the
  code changed, a remake after the libraries changed).
- **Own plain files** was chosen over a tracker (O12) and over files with a tracker as a view. O12 is out by the
  user's choice between near-tied options, not by a requirement.
- **Tools may write run records to version control apart from the code (R20b), and the project is a git
  repository before the record is implemented (R23b; the user's correction of "Yes, but later").** F4 (DataLad)
  and O13 (DVC experiments) are behind on neither R20 nor a missing repository any more: both are unverified
  contenders that round 2 has to check and compare with O11 properly. The code's identity can rest on a commit
  (O2, J3); what names the code of a run made from uncommitted changes (a stored diff, source copies, or a ref the
  tool writes) is open, since R20b allows writes "apart from the code" and a ref holding uncommitted code may or
  may not count as that: a question for round 2. O17 (the records in version control, apart from the code) is a
  way to meet R21.
- **Start of round 2, the user (2026-11-22)**: "The project will still use large changes, as the version control
  will not be manually managed; autonomous commits are okay in this repository, they will not be reviewed." So
  R20b is dropped: the assistant and tools may commit, code included. The code of every run can then be a commit
  made automatically before the run starts, which also covers code patched in memory as long as the script that
  patches is a file in that commit. The project `CLAUDE.md` holds the new rule. The test of a volume outside the
  snapshots is skipped on the user's word, so R19b stays unverified for any option.
- **The experience is disposable but a tier of its own (R5b, R22)**: three kinds of thing per run, then: the
  lasting record, the experience, the large outputs, deleted in that order last to first.
- **The ID is a date and time with a free label (R24).** J2's hash names and H2's running numbers are out as the
  ID's form by the user's choice; the recipe's hash stays a field. Open for the draft: the exact form, what makes
  two runs started in the same second with the same label differ, which characters a label may have.
- **"The same conclusions" is judged by eye** (R12): a remake shows old and new curves together. O9's automatic
  check, F8 and G2's tests are not needed now.
- **No disk cap (R15b)**: the size is reported and cleaning is on the user's word; thinning (O10) is not needed now.
- **A throwaway run's record may be removed too (R17b).** New tension, to ask in round 2: a removed record that a
  remark or a README number cites (R1, R14).

Round 2: redraft with what round 1 left untested, in the three tiers and with the chosen ID form; redo the
matrix against the changed requirements; verify DataLad and DVC experiments (do they run here, what a run
costs, how they treat uncommitted changes and probes) and score them as whole designs; check the nested-volume claim for R19b (needs the user's go-ahead, it
creates a volume in the home folder); the two checks; then the remaining questions (R6, R13, R14, R21, R23's
priority, and removing cited records).


## Round 2
Start (2026-11-22), the user: "Start round 2, skip the btrfs volume test. The project will still use large changes,
as the version control will not be manually managed; autonomous commits are okay in this repository, they will not
be reviewed."

Done in round 2: a second draft in a scratch git repository (the code of a run as a commit; a remake at the old
commit after the code changed; a probe from uncommitted, in-memory-patched code; a killed run; three tiers; pin,
clean, remove; two runs at once). Hands-on tests of DataLad and of DVC experiments by two subagents on a dummy
workload (`r2-datalad.md`, `r2-dvc.md`). A bias check and a rejection check on the log's extracts.

What was learned: all three ways meet the musts when the code is committed or staged before a run; what separates
them no requirement covers. The first pass of the draft's remove deleted the draft's whole store when given an
empty ID (scratch only). A run with the experience took 52.9 s against 42 to 49 s without; not resolved.

Searches: none on the web this round. Tool facts come from the two hands-on tests (tmpfs, dummy workload, one pass
each).

Round 2's answers (2026-11-22): what sits under the record: first "Give an overview of the advantages and workflow
of each", then, after the overview and a question on how DVC interacts with the parent decision, "Own code on
git."; the working branch: "Everything (Recommended)"; removing: "Refuse unless forced"; the first version: "Old
runs in new views" (not: "Continue a run", "Check cited run IDs"); the repository: "Assistant, after a look".

## Round 3
One part only: R6, which the user put in the first version and no draft covers.

Done in round 3: a test of two ways for new view code to ask an old run's networks (`export_calls.py`,
`use_calls.py` in the second draft's repository); a bias check and a rejection check.
Round 3's answers (2026-11-22): a view that needs what a run did not store: "Also store raw functions"; six months
and then a remake: "Yes, that is enough".
Searches: none on the web by the assistant; the bias check looked up JAX's export documentation.

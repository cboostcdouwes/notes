# What a run records

## Problem
Confirmed by the user: 2026-11-22
(Split off from [inspecting-experiment-results.md](inspecting-experiment-results.md) on 2026-11-22, where the user
chose to decide this first. Confirmed on the second write-back, after one correction.)

What a run leaves behind is too little to
work with later. The user could not always tell which method, settings or code gave a result, and could not always
find a run again. Every run made from now on (a method's training run in the maze, a probe, a human baseline
session) has to be something the user and the assistant can find again and refer to in a way that stays valid, tell
what made it, look at while it trains, examine afterwards including what the agent experienced, continue, and trace
a reported number back to. A run's lasting record holds enough to make the run again with approximately the same
results (the same conclusions; the numbers may differ), so that its large outputs, such as the stored networks, need
not be kept: they can be made again when wanted. Not every run has to be kept for good, and the record has to
respect limits on disk space and on how much slower a run gets. Existing runs need not be covered ("Old runs don't
matter", user, 2026-11-22), nor do experiments outside the maze for now.

## Situation
What exists now (each read in the code or on disk on 2026-11-22 unless marked otherwise):
- All four maze methods train through one loop and one save point: `gcsl.train` (`gcsl.py:412`) and `gcsl.main`
  (`gcsl.py:562`) in `experiments/gcrl-maze/gcsl/`.
- A run writes `<results folder>/<layout>_<actions>.json` (keys `layout`, `config`, `steps`, `curves`, and
  `best_of_grid` for discrete actions) and `<layout>_<actions>_checkpoints.npz` (every network of every model at
  each evaluation) once, after training (`gcsl.py:598-602`). During training it only prints a line per evaluation.
- A run of the same layout and action kind into the same folder overwrites both files. A variant is kept apart only
  by passing another folder with `--results`; the folder's name is then the variant's name in the figure
  (`gcsl.py:577-581`).
- The JSON holds the settings (with the seed) but no method name, date, duration, run name or code version.
- Probes are scripts kept as `.py.txt` under `results/probes/<name>/`; they patch `gcsl.py` in memory and write
  JSON files of their own shapes (project `CLAUDE.md`).
- The agent's collected data (positions, actions, commanded goals, resets) is not stored. One generator of the
  parent research estimated about 6 MB per model for a 200,000-step run (not measured).
- A method does not say how its stored networks are called; anything that uses them has to know that per method
  (parent log, round 1).
- Sizes: `gcsl/results` 1.9 GB, `wgcsl/results` 7.7 GB, `quasimetric/results` 438 MB, `human-baseline/results`
  2.6 MB; 158 JSON files and 39 checkpoint files under `experiments/gcrl-maze`. `/home` has 665 GB free of 953 GB.
- Human-baseline sessions are stored differently: `<layout>_<condition>_<suffix>.json`, the last in sort order is
  used (`gcsl.py:496-498`).
- The other experiment branch, `experiments/attention-regression`, has its own shape (`run.py` and `results/` per
  experiment, 23 JSON files) (`experiments/README.md`).
- The project is not a git repository, so "the code that made it" has nothing to point at today (project
  `CLAUDE.md`). Whether that is deliberate: not known.

What has gone wrong with it (notes `TODO.md`):
- `wgcsl/results` was emptied by the assistant's cleanup mistake on 2026-11-21 and restored by the user from a
  snapshot; stored results have no history.
- The curves of the embedding probes and of the earlier quasimetric seeds are not kept; only their numbers in a
  README.
- Two stored results of the attention experiments are not reproduced by the code (differences up to 60 % in single
  metrics, found 2026-11-20).
- The same settings and seed do not give the same numbers: two short runs differed by 0.007, WGCSL value-function
  runs by "a few units"; cause not found.
- What has cost the user something so far (user, 2026-11-22): "Unclear what made it" and "Could not find a run".
  Not chosen: "A result was lost".

Time horizon and values, from the parent log (user, 2026-11-22): the project runs "later, for months" in sessions
of 1 to 8 hours; the user values low upkeep, quick answers and pleasant use; live results may make a run "slower,
not broken". For the record itself (user, 2026-11-22): both disk space and run time are limits to respect; no
amounts named yet. How long a run stays examinable "depends on the run": some are worth keeping, others are
throwaway, and something has to tell them apart.

What a stored run is for besides looking and comparing (user, 2026-11-22): "Make it again", "Continue it", "Use it
as evidence" (a number in a README or report is traceable to the run that gave it).

What counts as a run (user, 2026-11-22): method runs in the maze, probes and try-outs, human baseline sessions. Not
chosen: other experiments (attention-regression, later environments).

The user's correction of the first write-back (2026-11-22): "Large run outputs should be in a cache folder, the
runs should have enough information to be able to rerun them with approximately the same results, so information
like checkpoints can be recreated." How alike a run made again has to be (user, 2026-11-22): "The same
conclusions". What would go wrong if large outputs sat with the lasting record (user, 2026-11-22): "Deleting would
be risky" (it must be safe to delete large outputs at any time without losing anything that lasts) and "They would
get versioned or backed up" (large files stay out of version control, snapshots and backups). Not chosen: "They
would fill the project".
Whether pictures, remarks and continued runs may rest on networks that were made again (user, 2026-11-22):
"Acceptable everywhere".

What follows from it (the assistant's reading; the user accepted the second and third point as above):
- A human baseline session cannot be made again by running code; its record is the session itself.
- Networks made again are not the networks the first run had. A picture of "run X at step N" drawn after the large
  outputs were deleted and made again is a picture of a similar run, and a remark that pointed at the first picture
  points at something slightly different.
- "Continue it" from networks that were made again continues a similar run, not the same one.
- Making a run again costs its run time: 12 to 103 s for today's runs on one model and 8 environments (notes
  `TODO.md`), more for larger ones.
- The same settings and seed give different numbers today, so "approximately the same" is what the code already
  gives if settings, seed and code are recorded; how far two such runs can differ in their conclusions is not
  measured (the same method on two seeds: 1.3 % and 5.2 %).

Version control (user, 2026-11-22): the project not being a git repository is "Not deliberate". Becoming one would
end two working rules of the project `CLAUDE.md` ("implement in full; no commit-sized steps" and the delete
caution), by their own end conditions.

What it is part of and what depends on it:
- The decision on inspecting results waits for it: its addresses, live results, "what data it saw", finding runs,
  and the scope "runs made after the run record is in place".
- The long-term project structure discussed on 2026-11-22 (one record per run, a generated index, a standard
  comparison, repeatable runs, version control): discussed only, no log, undecided.

If nothing is done: the viewer research can still go on, but live results, the data the agent saw and stable
references to runs stay out of reach, and a rerun keeps replacing what a remark or a README number pointed at
(assumed consequence, from the parent's round-1 bias check).

Not known yet: the amounts of the disk and run-time limits; who or what decides which runs are kept; whether "not for other
experiments" also means a later environment.

## Related decisions
- Parent: [inspecting-experiment-results.md](inspecting-experiment-results.md), open; its round 2 waits for this one.
- The long-term project structure: discussed 2026-11-22, no log, undecided.

## Requirements
Draft inventory before the first questions. "Verified" refers to this decision: a need the user confirmed for the
viewer is marked as carried over, with the parent's ID.

| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| R1 | A run can be referred to in a way that stays valid when it is moved or made again | Remarks, README numbers and views that point at a run would silently point at something else | inferred (parent R15, R9; bias check round 1); supported by "Use it as evidence" (user, 2026-11-22) | should | yes (user, round 1: not ticked as a must; important but tradeable) |
| R11 | A run can be found again without knowing where it is stored | "Could not find a run" has cost the user something | user, 2026-11-22; parent R9 (must, verified) | should | yes (user, round 1: not ticked as a must) |
| R2 | Making a run again does not destroy an earlier one | The earlier result can no longer be examined or compared, and a number cited from it loses its run. The user did not choose "A result was lost" as something that cost them | inferred (overwriting read in `gcsl.py:600`); follows from "Make it again" with "Use it as evidence" | should | yes (user, round 1: not ticked as a must) |
| R3 | A run tells what made it: method, settings, seed and code | "Unclear what made it" has cost the user something; two runs cannot be compared with confidence | user, 2026-11-22; parent R20 | must | yes (user, round 1: ticked as a must; it has cost them) |
| R12 | A run's lasting record holds enough to make the run again with approximately the same results: the same conclusions, the numbers may differ | The large outputs could not be made again once they are gone; a result could not be checked or built on | user, 2026-11-22 ("Make it again"; "enough information to be able to rerun them with approximately the same results"; "The same conclusions") | must | yes (user, round 1: ticked as a must). "The same conclusions" is judged by the user by eye: a remake shows the old and the new curves together and promises nothing by itself |
| R18b | A run's large outputs (such as its stored networks) can be deleted at any time without losing anything the user still wants. Pictures, remarks and continued runs may rest on outputs that were made again | "Deleting would be risky" otherwise; the project has lost results to a delete before (2026-11-21) | user, 2026-11-22 ("Acceptable everywhere"); replaces R18, whose wording named how they come back (that is R12 and the user's proposal O3) | must | yes (user, round 1: ticked as a must) |
| R19b | Large outputs cost nothing in whatever versions, snapshots or backs up the project | "They would get versioned or backed up" | user, 2026-11-22; replaces R19, which added the assistant's own "the lasting record is small enough to be in them" | should (claimed) | need yes, priority no |
| R21 | The lasting record is protected against loss by a delete or a mistake | It is what everything else is remade from; the project has no history and lost a results folder once | inferred (bias check, round 1) | should (claimed) | no |
| R13 | A stored run can be trained further from where it stopped | The user expects to continue runs | user, 2026-11-22 ("Continue it") | should (claimed) | need yes, priority no |
| R14 | A reported number can be traced to the run that gave it | A README or report number cannot be checked | user, 2026-11-22 ("Use it as evidence") | should (claimed) | need yes, priority no |
| R15b | The disk the disposable outputs take is visible, and they are cleaned on the user's word; there is no fixed cap | "No fixed number" when asked for a cap | user, round 1 | should | yes |
| R16 | Recording does not slow a run beyond a limit | The user named it as a limit; amount not set. For live results the user accepted "Slower, not broken" (parent R13) | user, 2026-11-22 | should (claimed) | need yes; not asked further: the draft's writing took 0.5 s of a 42 s run |
| R17b | Runs worth keeping can be told apart from throwaway ones. A throwaway run's record can be removed too, not only its outputs | "Depends on the run"; "Records may go too" | user, 2026-11-22 and round 1 | should | need yes; who removes a record, and what happens to a remark or number that cites it, not asked |
| R4 | A run's results can be seen while it trains | The user waits for the end of a run to see anything | parent R13 (user, 2026-11-22: "I'd also like to be able to see run results as they come in"; "Slower, not broken") | should | carried over |
| R5b | What the agent experienced during a run can be examined afterwards. It is disposable: after deletion the experience of a run made again is shown, which is similar, not the same | "What data it saw" cannot be answered otherwise | parent R4b (user, 2026-11-22); user, round 1 ("Disposable, but separate from the large outputs") | should | yes |
| R22 | Kinds of disposable output can be deleted independently, and the small ones (the experience) outlive the large ones (the networks) by default | Freeing disk should not cost the experience; asked what the separation is for: "Delete them independently", "Keep it longer" | user, round 1 | should | yes |
| R6 | A run's learned networks stay usable after the method's code changes | Views computed from an older run are wrong or fail | inferred (bias check round 1) | should (claimed) | no |
| R7 | Any method's run in the maze fits, and so do probes and human baseline sessions; a run in a later environment is not blocked | The record is redone per method or per kind of run | user, 2026-11-22 (the three kinds chosen); parent R1 (must, verified), R2 (should) | must (methods), should (probes, sessions, later environment) (claimed) | kinds yes, priorities no |
| R8 | The blindness rule holds: nothing from a layout the user has not played is recorded in a form the user is shown, and such runs stay refused | Seeing a layout cannot be undone | project `CLAUDE.md` (user, 2026-11-20, 2026-11-21) | must | yes |
| R9 | Layouts are named by number only | The user asked for it | project `CLAUDE.md` (user, 2026-11-20) | must | yes |
| R10 | Low upkeep as methods and experiments change | The user values it; a record that every new method must be taught costs every time | parent R16 (user, 2026-11-22) | should | carried over |
| R23b | The project is a git repository before the run record is implemented; the record may rely on it | The user corrected the round-1 answer "Yes, but later": "git will be added before implementation" | user, 2026-11-22 (replaces R23) | must | yes (the user's own statement of the order) |
| R24 | A run's ID is its date and time together with a free label that whoever starts the run types ("experiment name") | The user's choice of the ID's form; the label has no fixed meaning | user, round 1 ("Datetime, but also an experiment name"; "A free label") | should | yes (a form, chosen by the user; one-way once runs are cited) |
| W1 | Existing runs get such a record | "Old runs don't matter" | user, 2026-11-22 (parent W3) | won't | yes |
| W2 | Experiments outside the maze (attention-regression) get such a record | Not chosen when asked what counts as a run. Would come back if those experiments are taken up again | user, 2026-11-22 | won't | to be confirmed with the problem |

## Options
This decision is made of parts (see the map in *Evaluation*). An option that covers one part is marked
"part"; the leading option is a composition of parts. The field's documented route is F2 (an experiment
tracker); for stored states the JAX documentation points to Orbax (named in J5's report).

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O4 | Do nothing: runs stay as they are | No work; every method fits | Everything the problem names stays: no name beyond the path, a repeat replaces the run, no method or code in the file, nothing until the end, nothing to continue from; checkpoint files are in the snapshots today; probes skip the check for unplayed layouts (R8 ~) | cheap | trailing (R3, R11, and R1, R2, R4, R5, R13) |
| O5 | Change the process only: every run goes to a dated folder of its own through `--results`, and the assistant keeps a run list in the notes (what was run, with which settings, why) | No code; works today | Rests on the assistant remembering each time; nothing while training, nothing to continue from, no experience; the code that made a run is still unrecorded | cheap | trailing (R4, R5, R13; R3 by hand only) |
| O6 | The simplest that could work (J10): one line per run appended to a run list at the project root (ID, time, command line, settings, source hashes, final scores, where its files are), and the ID in the result files' names so a repeat replaces nothing | About 20 lines; findable and citable at once | Nothing while training, nothing to continue from, no experience, large outputs stay where they are | one-way for the ID form; cheap otherwise | trailing (R4, R5, R13, R18); it is the leading option's index line, written first |
| O6b | O6 with the large outputs written to a separate place (O3): about 30 lines | Findable, citable, and what may be deleted is marked by where it sits | Nothing while training, nothing to continue from, no experience; the code is recorded by hash only | one-way for the ID form; cheap otherwise | trailing (R4, R5, R13); the first stage on the way to O11 |
| O1 | The list from the parent's bias check (the assistant's): a name that survives moving and reruns, the method, a write at every evaluation, the data the agent saw, how the networks are called, the code that made it, and a regenerable index of runs. No separate place for large outputs, no remake, no state to continue from, no keeping rule | The cheaper middle composition: finding, naming, live lines and experience without the two tiers | Networks stay with the record; nothing to continue from; nothing says what may be deleted | one-way for the ID form and the record's files | trailing (R13, R17, R18); a stage on the way to O11 |
| O11 | The composition drafted in round 1 (the assistant's): the shared training path opens a record before the first step. The record is a small folder of plain files under an ID given once (manifest: kind, method, settings, seed, parent run, hashes of every loaded source file with one copy per distinct file, the layout file by hash only, the lock file by hash with one copy per distinct content, a probe's own script and any code patched in memory as it ran, and the commit when a repository exists; a line per evaluation as it happens; an end note). Large outputs (networks per evaluation, the whole learner state at the end, by leaf path) sit under the same ID in a separate place outside snapshots and version control, listed in the record also when absent, and are made again by a remake, which is a new run naming its parent. All records are kept; only large outputs are removed, oldest first, unless pinned. An index of runs is rebuilt by scanning the records. What the agent experienced is handed out of the compiled loop per evaluation segment and kept with the large outputs. A human session's record is the session file itself | Covers every part of the problem; one place to change (the shared loop) serves every method and probe. Measured in the draft: the record's size, the run time, a remake with unchanged code, continuing. Designed and not tested: source copies, a remake after the code changed, probes that patch code in memory, human sessions, pins and removal, a place outside the snapshots. No requirement covers that it needs no tool and no version control: tie-breaks only | About 150 to 250 lines of own code the assistant keeps (R10 ~, as every option that is not a ready tool); views of an old run in the old run's code need a process per code version (R6 ~); a number is tied to a run by citing its ID (R14 ~); the state to continue from is written at the end only, so an interrupted run cannot continue, and it goes with the large outputs (R13 ~); a remake after the libraries changed may not run (R12 ~, R18 ~) | one-way for the ID form and the record's files (runs and remarks cite them); cheap for where large outputs sit and for the keeping rule | leading |
| O12 | O11's parts with an existing tracker as the store and the live view (from the rejection check): the tracker (MLflow, Aim or trackio) holds ID, settings and score lines and shows them live; source copies, the learner state, the separate place for large outputs and the pins are built beside it as in O11 | Live curves, search and a comparison page come ready, which overlaps what the parent decision would build | A dependency whose store is the lasting record (a database file; upgrades migrate it); probes and human sessions fit as attachments and tags; not checked: that these tools run on the project's Python 3.14, and what a logging call costs per evaluation | costly (the record lives in the tool's store) | near-tie with O11: differs in R7 ~ and R16 ?, and in what no requirement covers (a ready live view against a dependency). A question to the user |
| O13 | DVC experiments with DVCLive (from both checks, from their own knowledge, not verified here): each run is kept with its uncommitted changes under a hidden ref the tool writes, with live score lines; large outputs in DVC's cache | Captures changed code without a commit on the user's branch; drops and remakes large outputs | Needs version control first; the tool writes refs (R20); a pipeline file per kind of run; a large dependency set | costly | trailing (R20 if it holds for run records); not verified, to check if question 1 allows tool-written refs |
| O15 | Sacred's file observer (from the bias check; F11 and J7 name it): an existing library writes a numbered folder per run with settings, deduplicated copies of the source files, score lines and the captured output | The record's folder and the source copies without own code | Low activity (last release found 0.8.5); not checked on Python 3.14; training code has to be wrapped in its experiment object; learner state, separate place and pins are still built beside it; numbered folders collide for runs started together unless configured | costly (a dependency's layout is the record) | level with O11 on the requirements for the parts it covers; set behind it by a tie-break (a little-maintained dependency for about 80 lines); not verified |
| O3 | The user's proposal (2026-11-22): large run outputs live in a cache folder, apart from a record small enough to keep, and are recreated by rerunning | Deleting is safe by construction; the record stays small | A folder under the home folder is still inside the snapshots (checked: `~/.cache` is part of the snapshotted volume). A nested volume of its own, which snapshots do not descend into, is one command (not tested here), or a place outside `/home` | cheap (a path) | part of the leading option (where large outputs sit) |
| O2 | Put the project under version control (a consequence of "Not deliberate", not the user's proposal) | The code of a clean tree has a name; old code can be fetched again; deletes become recoverable for what is tracked | By the user's workflow the assistant's changes are uncommitted while it tests them, so most runs are made from a tree no commit describes: a commit alone does not say what made a run. Ends two working rules of the project `CLAUDE.md` (implement in full; delete caution) by their own end conditions | costly (habits and rules change) | part (code identity): not a prerequisite of this decision; recorded when present, next to J4 |
| O7 | Keeping by an act (J15, F19): large outputs expire by age or size unless a run is pinned with a reason; human sessions are pinned from the start | Nobody has to judge every run; the disk stays bounded | A pin is a habit; an unpinned run someone wanted costs a remake | cheap | part of the leading option (keeping) |
| O8 | Kept because cited (J16): a run's large outputs stay as long as a README, a remark or a study names its ID | No act needed; follows the evidence | Every citing document has to be scanned; a run under study but not yet cited is removed | cheap | part, later: level with O7 on the requirements (both R10 ~); O7 is taken first as the least to build, a tie-break; fits once reported numbers cite IDs |
| O9 | Remake as a check (J14): making a run again compares the new curves with the recorded ones and says whether the conclusion held | Turns "the same conclusions" into something a remake reports | Needs a stated conclusion or a tolerance per run; one model's seed spread is wide | cheap | part, later: the draft prints the comparison; what counts as the same conclusion is an open question |
| O10 | Thinning (J19, F15): keep every k-th network snapshot, or the first, last and best; the rest are made again | Cuts the largest files several times over | A view of a thinned moment costs a remake | cheap | part, later: a setting of the leading option if the disk limit asks for it |
| O14 | Find the cause of the differences between runs of the same seed first (from the bias check): a short investigation, short of making training exact (F7) | If the cause is cheap to remove, a remake is the same run and "the same conclusions" needs no definition | Time with an uncertain result; exactness would still end with any change of code or library | cheap | part, optional: not needed by O11; proposed as a separate small step |
| O16 | A tiered record (from the bias check): the learner's end state (6.5 MB) is part of the lasting record; only the per-evaluation networks are disposable | Continuing never needs a remake; the end networks of every run stay exactly as they were | 6.5 MB a run in whatever protects the record: 6.5 GB per 1,000 runs | cheap (a setting of O11) | variant of O11: trailing (R19) for every run; as "pinned runs keep their end state" it is part of O7 |
| O17 | A small repository of its own for the records only (from the bias check): the lasting records are versioned there, apart from the code | The lasting record is protected and has a history without the code's review rule applying to it | Someone or something commits there; whether the assistant may (R20) is a question | cheap | part (what protects the lasting record): open, with questions 1 and 7 |
| F1 | Plain self-describing run directory, append-only logs, index by scanning: no tracking tool; a fixed layout is | The field's commonest practice for one researcher; no tool; a second process can follow the appended lines | Own schema to keep; code identity by commit presupposes version control (R3 ~, R12 ~); as described it has no experience and no state to continue from | one-way for the layout | part of the leading option (the record's layout and live lines): O11 is F1 with the learner state, the experience, source copies and the pins added; no rejection, it is contained |
| F2 | Local tracker with a database store (MLflow, Trackio or Aim): an existing tracking library is the record, and | The field's documented route: ID, search, live curves and a comparison page come ready | The lasting record is the tool's database; code identity is a commit only; continuing and remaking are not its functions; probes and human sessions fit as attachments; upgrades migrate the store | costly (the record lives in the tool's store) | trailing as described (R13, R18: not its functions); its composition with the missing parts is O12 |
| F3 | Parameter-addressed workspace (signac): the run's ID is the hash of its settings, so a run is found by | A run is found by describing it; no duplicates | The same settings resolve to the same folder, so a repeat needs a counter; the ID changes when a setting is added; no code identity, no live lines | one-way for the ID rule | trailing (R2, R1) |
| F4 | The run is a version-control commit with a rerun record (DataLad run or DVC experiments): history is the | Exactly the user's proposal as an existing tool: large outputs are dropped and made again from a recorded command | A commit per run, made by the tool; a clean tree or declared inputs per run, while probes run from changed code; a rerun never matches the recorded content hash; seconds of hashing per run (not measured); nothing while training | costly (history and layout belong to the tool) | trailing (R20 if it holds for run records; R3 for runs from changed code); would lead if tool-made commits are wanted and version control comes first. Its DVC form is O13 |
| F5 | Outputs and reported numbers as cached build targets (Snakemake, redun, joblib.Memory, showyourwork): nothing | Deleting loses nothing; a reported number is a target with its runs behind it | A cache key is not a name to cite; a hit stands in for a run; code hashing is fragile; nothing while training; continuing is outside the model | costly | trailing (R1, R2: a cache hit stands in for a run); its numbers-as-targets idea returns in J8 |
| F6 | The experience log is the primary record, in an offline-RL dataset standard (Minari or RLDS): what the agent | Agent and human sessions become the same kind of object in a published format | The format's collector steps a Python environment one transition at a time, which a compiled loop does not do; settings, live lines and continuing are outside it | costly | trailing as the record (R12, R3, R4, R13); its idea is J6 |
| F7 | Bit-exact deterministic replay: make training exactly repeatable, and the record shrinks to seed, settings, | The record shrinks to kilobytes and a remake is the same bytes | A speed cost or a move to the CPU (not measured); any change of code, library or driver ends the exactness; looking at an old run costs a full rerun | costly | not ahead on any requirement as the user set them: its gain, exact repeats, goes beyond R12 ("the same conclusions"); its speed cost is unknown (R16 ?). Finding the cause of today's differences is O14 |
| F8 | The experiment, not the run, is the lasting unit: seed groups with interval statistics (rliable practice): | "The same conclusions" is defined where it is true, over several seeds; runs outside an experiment are throwaway without a decision | Several seeds per result, against the current rule of one model per run; human sessions and probes do not fit | costly (a habit) | part, later: trailing as the record (R7); kept as the way to check a remake once several seeds are allowed |
| H1 | The registrar's accession register (museums): a run's identity is a number given once from one register, marked | A number given once that means nothing and is marked on everything; a status that outlives the outputs | Opaque numbers need a finding aid; one place issues them | one-way for the ID form | part of the leading option (an ID given once, a status in the record) |
| H2 | Run number, data tiers and the good-run list (particle-physics experiments): runs are numbered, recorded in | A run number is short enough to say; a list says which runs may be cited | A verdict after every run and a list per report: two roles for one person and one assistant | one-way for the ID form | part: the run number is one of the ID forms to choose from (open question); the certified list is later, with J8 |
| H3 | The scoresheet and the sealed move (chess, baseball scorebooks): the lasting record is the sequence of moves, | Written as it happens; continuing from a fixed, sealed state | Megabytes per run in the lasting record | one-way for the format | part: as J6 and J5 |
| H4 | Certificate, instructions and iteration report (conceptual art and time-based media conservation): the lasting | A remake is a new iteration with its own report, never a replacement; what must stay the same is written down | A statement of essentials per experiment needs the user's judgement | cheap | part: "a remake is a new run" is adopted; the statement of essentials is open (with O9) |
| H5 | Master record, executed batch record, quarantine and release (pharmaceutical manufacture): each run fills in a | A record filled in while the run goes; a release or reject decision that sets how long it is kept | A decision after every run, by a second role | cheap | part: filling in as it goes and an end status are adopted; the release step is level with O7 on the requirements and asks a decision after every run, a tie-break |
| H6 | The auditor's working papers (accounting and audit): every reported number has a numbered paper that lists the | Numbers can be followed to runs and runs to the numbers resting on them | A schedule per reported number, and the discipline never to bypass it | cheap | part, later: as J8 |
| H7 | Allocation concealment and the unblinded pharmacist (clinical trials): every run's record is split when it is | A record is split into an open and a sealed part at creation, and opening is logged | Two parts for every record while training on unplayed layouts is refused anyway | cheap | part: adopted in a light form (the index does not list records of a layout not yet played in both conditions, which today can only be human sessions) |
| H8 | Evaporating trails and tagged memories (ant colonies, sleep): nobody decides which runs to keep; every run is | Nobody decides what to keep: what is used stays | Every reader has to record its use; a wrong fade is noticed late | cheap | part: level with O7 on the requirements; "least recently used first" is a variant of how unpinned large outputs go |
| G1 | Derivation and store with garbage-collector roots (functional package management): a run's name is the hash of the small recipe that makes it, its outputs live  | As J2, and a named root is the only thing that keeps outputs alive: keeping is explicit and cheap to undo | As J2 | one-way for the ID rule | as J2; its roots are the leading option's pins |
| G2 | Suite ID, rolling restart dumps and a statistical "same climate" test (climate modelling): a registry issues each experiment a short opaque ID at creation, the  | Short IDs from a registry; continuing from periodic dumps; a statistical test of "made again" | Extra runs to form the accepted ensemble; a registry to keep | one-way for the ID form | part: dumps as J5, the test as O9 and F8, later |
| G3 | Master record, executed batch record and disposition (pharmaceutical manufacturing): each run copies the method's approved master in full, is filled in while it | As H5, and a small reserve sample stays when the bulk goes | As H5 | cheap | part: as H5; the reserve sample is the record's curves and end note |
| G4 | Accession register, bag with fetch list, and resolver (archives and libraries): a register issues a number that is never reused, the run is a self-describing pa | "Absent but obtainable" is a valid, listed state of a file; references go through one table | Hashing 90 to 330 MB of networks per run (seconds, estimated) | one-way for the manifest | part of the leading option: the record lists its large outputs also when absent; the packaging tool is not needed (a tie-break, no requirement) |
| G5 | Replay file: header, input log, checksums and anchor state (game engineering): the lasting record is the stream of what went in, not the state that came out, in | One format for the agent's experience and the human's input; a stored state to continue from | Replay in place of stored outputs needs exact repeatability, which is not required | one-way for the format | part: the shared shape for agent and human is adopted through J6; replay is not (see F7) |
| G6 | Run number, run registry, global tag, good-run list and data tiers (particle physics): runs are numbered by a counter and described in one queryable registry, w | As H2, with what a range of runs depended on named once | As H2; someone has to cut a new tag when dependencies change | one-way for the ID form | part: as H2 |
| G7 | One append-only journal with vouchers and reversing entries (bookkeeping and audit): everything that happens to any run is a numbered line in a single text jour | One text file holds everything in order; every index is a report from it; a number cites an entry | One file every run and reader depends on; a damaged or hand-edited journal loses every record at once | one-way for the entry format | level with the leading option's folder per run on the requirements; no requirement separates them. The draft used folders; cheap to choose before the first run, costly after |
| G8 | Merged into F4 (the same tool, DataLad, and the same cells). Merged into F4 (the same tool, DataLad, and the same cells). Run records in the version history with droppable content (research data management in neuroimaging): an existing tool, DataLad on git-annex, executes each run, |  |  |  | merged into F4: the same tool (DataLad) and the same cells |
| J1 | The shared loop writes the record: one run folder per call of `train`, opened before the first step. | The record is opened inside the shared training function, so probes, which skip the command-line entry, get one unchanged; a running or interrupted run can be looked at | Networks stay in the run's folder; no state to continue from, no keeping rule, no index; the blindness check is not in that function today | one-way for the layout | part of the leading option (where and when the record is written); alone trailing (R13, R17, R18) |
| J2 | Recipe-addressed runs: the ID is a hash of what makes the run, and the outputs are a cache. | The same recipe has the same name everywhere; a repeat is realisation n+1 and can never replace; found by describing | The name changes with every edit of a loaded source file and with every added setting, so one line of work has many names; a citation needs the name and the realisation number | one-way for the ID rule | level with O11 on the requirements: the same design with another naming rule; which rule is a question to the user |
| J3 | Git as the ledger: the code's identity is a commit, and the run records it. | Old code can be fetched by commit; a run of a clean tree is fully named | Probes and the assistant's untested changes run from uncommitted trees; the variants that keep a dirty tree reachable write objects and refs | costly | part (code identity): adopted read-only (commit and whether the tree was clean, when a repository exists), next to J4 |
| J4 | The run capsule: every run carries the sources it loaded, as probes already carry their script. | What made a run is in the run, with or without version control; old networks can be read by the code that wrote them; the layout file never leaves its place | Views that mix an old and a new run need a process per code version; about 80 lines | one-way (stored copies) | part of the leading option (code identity) |
| J5 | The whole `Learner` as the one stored state: restart file, networks and buffer in a single generic dump. | One generic file continues a run and holds every network without the method naming them; a new method costs nothing | A renamed field makes old states fail to load (loudly); continuing past the planned end needs a rule for the evaluation steps | one-way for the stored state's naming; cheap otherwise | part of the leading option (continuing) |
| J6 | The experience stream comes out of the shared loop, in the shape the human session already has. | The only exact account of what an agent saw; one change serves every method; the same shape as a human session | A change inside the compiled loop; megabytes per run; positions trace a layout's free space | cheap (a later addition is possible) | part of the leading option (experience); whether it is lasting or disposable is an open question |
| J7 | Merged into F2 (the same tools seen from the project's one loop; the same cells). Merged into F2 (the same tools seen from the project's one loop; the same cells). An existing tracker behind the one loop. |  |  |  | merged into F2: the same tools seen from the one loop; the same cells |
| J8 | Study files: the record is written before the run, and runs are targets made when missing. | A reported table has a recorded derivation; being in a study decides what is kept | A study is written before anything runs, which try-outs are not; a runner and a renderer to keep | costly (a habit) | part, later: a layer on top of the leading option for comparisons and README tables |

## Matrix
✓ meets, ~ partly, ✗ fails, ? unknown, · the option does not address it (a part). Second row: the
priority (with ? when it is claimed and not checked) and whether it is verified ("need": the user named
the need, its priority is not checked). Assumptions per column: R8 assumes the blindness check sits in
the path every run takes where the option opens its record there; today it does not (probes skip it), which
is why O4, O5 and O6 have ~. R15 and R16 are marked from the draft's measurements where one exists.

| Option | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9 | R10 | R11 | R12 | R13 | R14 | R15 | R16 | R17 | R18b | R19b | R20 | R21 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *priority, verified* | must?, no | should?, no | must?, need | should, yes | should, yes | should?, no | must (methods), yes; rest should? | must, yes | must, yes | should, yes | must?, need | must?, need | should?, need | should?, need | should?, need | should?, need | should?, need | must?, need | should?, need | must?, no | should?, no | |
| O4 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ~ | ✓ | ✓ | ✗ | ~ | ✗ | ✗ | ~ | ✓ | ✗ | ~ | ✗ | ✓ | ~ | ✗ R1 ✗ R2 ✗ R3 ✗ R4 ✗ R5 ✗ R6 ~ R8 ✗ R11 ~ R12 ✗ R13 ✗ R14 ~ R15 ✗ R17 ~ R18b ✗ R19b ~ R21 |
| O5 | ~ | ~ | ~ | ✗ | ✗ | ✗ | ✓ | ~ | ✓ | ~ | ~ | ~ | ✗ | ~ | ~ | ✓ | ~ | ~ | ✗ | ✓ | ~ | ~ R1 ~ R2 ~ R3 ✗ R4 ✗ R5 ✗ R6 ~ R8 ~ R10 ~ R11 ~ R12 ✗ R13 ~ R14 ~ R15 ~ R17 ~ R18b ✗ R19b ~ R21 |
| O6 | ✓ | ✓ | ~ | ✗ | ✗ | ✗ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✗ | ~ | ~ | ✓ | ✗ | ~ | ✗ | ✓ | ~ | ~ R3 ✗ R4 ✗ R5 ✗ R6 ~ R8 ~ R12 ✗ R13 ~ R14 ~ R15 ✗ R17 ~ R18b ✗ R19b ~ R21 |
| O6b | ✓ | ✓ | ~ | ✗ | ✗ | ✗ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✗ | ~ | ✓ | ✓ | ~ | ~ | ~ | ✓ | ~ | ~ R3 ✗ R4 ✗ R5 ✗ R6 ~ R8 ~ R12 ✗ R13 ~ R14 ~ R17 ~ R18b ~ R19b ~ R21 |
| O1 | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✗ | ~ | ~ | ~ | ✗ | ✗ | ~ | ✓ | ~ | ~ R3 ~ R6 ~ R10 ~ R12 ✗ R13 ~ R14 ~ R15 ~ R16 ✗ R17 ✗ R18b ~ R19b ~ R21 |
| O11 | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ~ | ✓ | ~ | ✓ | ~ | ~ | ✓ | ~ | ~ R3 ~ R6 ~ R10 ~ R12 ~ R13 ~ R14 ~ R16 ~ R18b ~ R19b ~ R21 |
| O12 | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ~ | ✓ | ? | ✓ | ~ | ~ | ✓ | ~ | ~ R3 ~ R6 ~ R7 ~ R10 ~ R12 ~ R13 ~ R14 ? R16 ~ R18b ~ R19b ~ R21 |
| O13 | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ✓ | ✓ | ? | ~ | ✓ | ✓ | ✗ | ✓ | ~ R1 ~ R5 ~ R7 ~ R10 ~ R11 ~ R13 ? R16 ~ R17 ✗ R20 |
| O15 | ✓ | ✓ | ✓ | ✓ | · | · | ~ | ✓ | ✓ | ~ | ~ | ~ | · | ~ | · | · | · | · | · | ✓ | ~ | ~ R7 ~ R10 ~ R11 ~ R12 ~ R14 ~ R21 |
| O3 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | ~ | ✓ | · | ~ R19b |
| O2 | · | · | ~ | · | · | ✓ | · | · | · | ~ | · | ~ | · | · | · | · | · | · | · | ✓ | ✓ | ~ R3 ~ R10 ~ R12 |
| O7 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | · | ✓ | · | ✓ | · | · | · | · | ~ R10 |
| O8 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | ~ | ✓ | · | ✓ | · | · | · | · | ~ R10 ~ R14 |
| O9 | · | · | · | · | · | · | · | · | · | ~ | · | ✓ | · | · | · | · | · | · | · | · | · | ~ R10 |
| O10 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · |  |
| O14 | · | · | · | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | · | · | · | · |  |
| O16 | · | · | · | · | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | ✓ | ~ | · | · | ~ R19b |
| O17 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | · | · | · | · | · | ✓ | ~ | ✓ | ~ R10 ~ R20 |
| F1 | ✓ | ✓ | ~ | ✓ | · | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ~ R3 ~ R6 ~ R10 ~ R12 ~ R13 ~ R14 ~ R17 ~ R21 |
| F2 | ✓ | ✓ | ~ | ✓ | ~ | · | ~ | ✓ | ✓ | ~ | ✓ | ~ | ✗ | ~ | ~ | ? | ~ | ~ | ✓ | ✓ | ~ | ~ R3 ~ R5 ~ R7 ~ R10 ~ R12 ✗ R13 ~ R14 ~ R15 ? R16 ~ R17 ~ R18b ~ R21 |
| F3 | ~ | ~ | ~ | · | · | · | ~ | ✓ | ✓ | ~ | ✓ | ~ | · | ~ | · | · | · | · | · | ✓ | · | ~ R1 ~ R2 ~ R3 ~ R7 ~ R10 ~ R12 ~ R14 |
| F4 | ~ | ✓ | ~ | ~ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ✓ | ✓ | ? | ~ | ✓ | ✓ | ✗ | ✓ | ~ R1 ~ R3 ~ R4 ~ R5 ~ R7 ~ R10 ~ R11 ~ R13 ? R16 ~ R17 ✗ R20 |
| F5 | ~ | ~ | ✓ | · | · | · | ~ | ✓ | ✓ | ~ | ~ | ✓ | · | ✓ | ✓ | · | ✓ | ✓ | ✓ | ✓ | · | ~ R1 ~ R2 ~ R7 ~ R10 ~ R11 |
| F6 | · | · | ~ | · | ✓ | · | ~ | ~ | · | ~ | · | ✗ | · | · | ~ | · | · | · | · | · | · | ~ R3 ~ R7 ~ R8 ~ R10 ✗ R12 ~ R15 |
| F7 | · | · | ✓ | · | ~ | ~ | · | · | · | ~ | · | ✓ | ~ | · | · | ? | · | ✓ | · | · | · | ~ R5 ~ R6 ~ R10 ~ R13 ? R16 |
| F8 | ~ | ✓ | · | · | · | · | ~ | · | · | ~ | · | ✓ | · | ✓ | ~ | · | ✓ | · | · | · | · | ~ R1 ~ R7 ~ R10 ~ R15 |
| H1 | ✓ | ✓ | · | · | · | · | · | · | · | ~ | ~ | · | · | · | · | · | ~ | · | · | · | · | ~ R10 ~ R11 ~ R17 |
| H2 | ✓ | · | · | · | · | · | · | · | · | ~ | ✓ | · | · | ✓ | · | · | ✓ | · | · | · | · | ~ R10 |
| H3 | · | · | · | ✓ | ✓ | · | · | · | · | · | · | · | ✓ | · | ~ | · | · | · | ~ | · | · | ~ R15 ~ R19b |
| H4 | · | ✓ | · | · | · | · | · | · | · | ~ | · | ✓ | · | · | · | · | · | · | · | · | · | ~ R10 |
| H5 | · | ✓ | ✓ | ✓ | · | · | · | · | · | ~ | · | · | · | · | · | · | ✓ | · | · | · | · | ~ R10 |
| H6 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | ✓ | · | · | · | · | · | · | · | ~ R10 |
| H7 | · | · | · | · | · | · | · | ✓ | · | ~ | · | · | · | · | · | · | · | · | · | · | · | ~ R10 |
| H8 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | · | ✓ | · | ✓ | · | · | · | · | ~ R10 |
| G1 | ✓ | ✓ | ✓ | · | · | · | ~ | ✓ | ✓ | ~ | ✓ | ✓ | · | · | ✓ | · | ✓ | ✓ | ✓ | ✓ | · | ~ R7 ~ R10 |
| G2 | ✓ | · | · | · | · | · | · | · | · | ~ | · | ✓ | ✓ | · | ~ | · | · | · | · | · | · | ~ R10 ~ R15 |
| G3 | · | ✓ | ✓ | ✓ | · | · | · | · | · | ~ | · | · | · | · | · | · | ✓ | · | · | · | · | ~ R10 |
| G4 | ✓ | ✓ | · | · | · | · | · | · | · | ~ | ~ | · | · | · | · | ~ | · | ✓ | · | · | · | ~ R10 ~ R11 ~ R16 |
| G5 | · | · | · | · | ✓ | · | ✓ | · | · | · | · | ~ | ~ | · | ~ | · | · | · | · | · | · | ~ R12 ~ R13 ~ R15 |
| G6 | ✓ | · | ~ | · | · | · | · | · | · | ~ | ✓ | · | · | ✓ | · | · | ✓ | · | · | · | · | ~ R3 ~ R10 |
| G7 | ✓ | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ~ | ✓ | · | · | ✓ | · | · | · | · | ✓ | ✓ | ~ | ~ R10 ~ R21 |
| J1 | ✓ | ✓ | ~ | ✓ | · | · | ✓ | ✓ | ✓ | ~ | ~ | ~ | ✗ | ~ | · | · | ✗ | ~ | ~ | ✓ | ~ | ~ R3 ~ R10 ~ R11 ~ R12 ✗ R13 ~ R14 ✗ R17 ~ R18b ~ R19b ~ R21 |
| J2 | ✓ | ✓ | ✓ | · | · | · | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | · | ~ | ✓ | · | · | ✓ | ✓ | ✓ | · | ~ R10 ~ R14 |
| J3 | · | · | ✓ | · | · | ✓ | · | · | · | ~ | · | ✓ | · | · | · | · | · | · | · | ~ | · | ~ R10 ~ R20 |
| J4 | · | · | ✓ | · | · | ~ | · | ✓ | · | ~ | · | ✓ | · | · | ✓ | · | · | · | · | ✓ | · | ~ R6 ~ R10 |
| J5 | · | · | · | · | ~ | ~ | ✓ | · | · | ✓ | · | · | ✓ | · | · | · | · | ✓ | · | · | · | ~ R5 ~ R6 |
| J6 | · | · | · | · | ✓ | · | ✓ | ✓ | · | · | · | · | · | · | ~ | ~ | · | · | · | · | · | ~ R15 ~ R16 |
| J8 | ✓ | ✓ | · | · | · | · | ~ | · | · | ~ | ✓ | ✓ | · | ✓ | · | · | ✓ | · | · | · | · | ~ R7 ~ R10 |

## Evaluation
### The parts of this decision (the design-space map)
The 32 generated options and the 11 others differ on six points, and most options cover one or two of them. A
design is one choice per point; the leading option (O11) is such a composition.

| Part | The choices found | In the leading option |
|---|---|---|
| What names a run | an ID given once at the start (F1, J1, H1, G4); a running number from one register (H2, G6, G2); a hash of what makes the run (J2, G1, F3, F5); a name the tool gives (F2; a commit: F4); a place in a study (J8, F8); the path, as today (O4) | an ID given once; its form is open (a question to the user); the hash of the recipe is a field of the record, so the repeats of one recipe can be found |
| Where the lasting record lives | a folder of plain files per run (F1, J1, G4, H5); one journal or database for all runs (G7, O6, J9); the version history (F4); a tool's store (F2); a study file (J8, H6) | a folder of plain files per run, an index rebuilt by scanning |
| How the code is identified | a commit (O2, J3, F4); hashes of the loaded sources (J2, G1); copies of the loaded sources (J4, F17); not at all (O4) | hashes and one copy per distinct file (J4); the commit too when a repository exists |
| Where large outputs are and how they come back | next to the record (J1, O4); a separate place under the same ID, remade by a new run (O3, G1, J2, G4); pointers in the version history (F4); not stored, replayed exactly (F7, G5) | a separate place outside snapshots and version control; listed in the record when absent; remade by a new run that names its parent |
| What a run continues from, and what it experienced | the whole learner state (J5, G2, H3); a replay from the start (F7); the experience handed out of the loop (J6, F6, G5, H3); nothing (O4) | the whole learner state at the end; the experience per evaluation segment, with the large outputs |
| What decides keeping, and how a number is tied to a run | an act (O7, G1's roots, H5's release); being cited or in a study (O8, J8, F8, H2); use (H8); thinning (O10). A number cites an ID (O11); a schedule or study renders it (H6, J8); a remake checks it (O9, F8, G2, H4) | every record is kept; large outputs go oldest first unless pinned; a number cites an ID |

Empty cells looked at: "the record lives in the notes vault" (J18, one card per run: a variant of the folder per
run in another place, not worked out); "nothing names a run, documents name claims" (the inverted formulation of F
and J: J8 and H6 are its workable forms). No further generator was run: the four reports overlap on every part
(G1 with J2, G8 with F4, G5 and H3 with J6 and J5, G6 with H2, G3 with H5).

Scope: the topic is one decision with parts that depend on each other, not several. One neighbour is separate:
whether the project goes under version control (O2). This decision does not wait for it (see the record of O2).

### The draft and its stress test (round 1)
The draft is `spike.py` in the session's scratch folder (`.../scratchpad/run-record-spike/`, with `drive.sh`, the
logs, `store/` and `cache/`); it is not project code. It mirrors the loop of `gcsl.train` for the method
"Quasimetric with a model" and adds the record. Run on layout-02, one model, 8 environments, 200,000 steps, seed 0,
one run per line, each in a process of its own (times include about 8 s of compiling):

| Run | Seconds | Lasting record | Large outputs | Shortfall, mean of the last 5 evaluations |
|---|---|---|---|---|
| The project's own `train`, no record | 48.5 | (5 KB today) | 131 MB today | 0.0188 at the last evaluation |
| Recorded | 42.3, of which 0.47 writing | 12 KB (manifest 9 KB, 81 lines, end note) | 138 MB (networks 132, learner state 6.5) | 0.0187 |
| Recorded, with the experience | 46.8, of which 0.58 writing | 2.8 MB: the draft wrote the experience (compressed) into the record | 138 MB | 0.0169 |
| Made again from the first record | 42.9 | 12 KB | 138 MB | 0.0165 |
| Continued from the first run's state, 40,000 steps more | 12.7 | 3 KB | 16 MB | starts at 0.017, the first run's last value; 0.0182 |

What it shows:
- **Recording costs little run time** (R16): the writing itself took half a second of a 42 s run. Whole-run times
  do not resolve more: the project's own `train` took 48.5 s and the draft's copy of its loop 42.3 s, a gap of 6 s
  between two runs that should be alike, which is larger than the 4.5 s the experience seemed to cost. One run
  each; to measure properly (several runs each) if the limit turns out to be tight.
- **The lasting record is 12 KB a run**: 1,000 runs are 12 MB. With the experience inside it would be 2.8 MB a
  run, 2.8 GB per 1,000 runs. The draft put it in the record; the leading option as scored puts it with the large
  outputs, which is open question 3.
- **Large outputs are 138 MB a run** at one model: the 665 GB free hold about 4,800 such runs; a budget of 50 GB
  holds about 360. They grow with the number of models: eight models are about 1 GB a run.
- **A remake reaches the same conclusion here**: the same settings and seed gave 0.0187, 0.0169 and 0.0165 in
  three runs (and 0.0188 from the project's own `train`); no source file had changed, which the record's hashes
  showed. Looking at a run whose large outputs are gone costs one remake: 43 s here, the run's own time in general.
- **Continuing works from the stored state**: the continued run's first evaluation equals the first run's last
  (0.017), and it trains on. The state is 6.5 MB and holds every network, so no method has to name its networks.
- **Finding**: a scan of 1,000 records took 0.06 s, so an index can be rebuilt at will and holds nothing of its own.
- **At the scale it will meet**: probes call `train` directly, so a record opened inside the shared path covers
  them; the draft's check for unplayed layouts sits there too. Two runs started in the same second get different
  IDs through the random part.

What the draft does not cover, so the leading option's cells for it are designs, not measurements:
- **The code's identity is weaker than designed.** The draft stores hashes only, no copies, and its remake ran the
  current code (unchanged, as the hashes said). A remake from a run's own copies after the code changed is untested.
- **Code patched in memory escapes the hashes.** The draft's own run with the experience executed a text-patched
  `gcsl.py` while its manifest hashed the unpatched file, and it skips scripts outside the project. Probes patch
  the same way, so a record could say "nothing changed" for different code. The design has to record a probe's
  script and the code as it ran; not tested.
- **The lock file is hashed, not copied**, so an old environment could not be rebuilt from the draft's record.
- **One method, no probe, no human session, one model.**
- Also: a human session (its record is the session file; the session files' names are what
the blindness check reads, so they keep their place); a run that is interrupted (the record then has no end note,
which readers must treat as a state); reading an old run's networks with the old code (R6); the pin and the
removal of old large outputs; a volume outside the snapshots.

Why the user might reject it once in use: an ID such as `20261122-184237-9b65` is long to say and type; a view of
an unpinned old run starts with a wait of the run's length; pins are forgotten until the wanted outputs are gone;
it is more own code that the user does not read.

### The second draft and its stress test (round 2)
The draft is a scratch git repository built from copies of the method code (`gcsl.py`, `wgcsl.py`, `quasimetric.py`,
`quasimetric_model.py`, the two `layout-02` session files and `uv.lock`), with `runs.py` (about 230 lines) and a
`train` that records as it goes: `.../scratchpad/run-record-spike2/` (first pass) and `.../run-record-spike3/` (the
rerun of what failed); logs `t1.log` to `t5.log` and `t3.log`, `t4.log`. Not project code. The environment package
was not copied: the draft used the project's installed one. Layout-02, one model, 8 environments, one run each.

What a run is in this draft:
- **ID**: date, time and label, `20261122-193120-first`; a second run with the same label in the same second gets
  `-2`. The label defaults to the script's name (`probe-patch`). Lower-case letters, digits and dashes.
- **Code**: a commit. HEAD when the tree is clean. Otherwise a commit of the whole working tree, tracked and
  untracked files, made with a temporary index and kept under `refs/runs/<id>`: the working tree, the index and
  the branch are not touched.
- **Record** (in the repository, `runs/<id>/`): `manifest.json` before the first step (ID, label, kind, parent,
  method, layout, settings, the command, the code's commit and whether it had to be made, the lock file's hash),
  `events.jsonl` (a line per evaluation), `end.json` (scores, times, the sizes of its outputs), a `pin` file. It
  is committed by itself when the run ends ("run <id>: ..."), whatever else is changed in the tree.
- **Experience** (outside the repository, `outputs/experience/<id>/`): a compressed file per evaluation segment.
- **Large** (outside the repository, `outputs/large/<id>/`): networks per evaluation, and the learner's state,
  replaced every 20 evaluations and at the end.
- **Remake**: a temporary working tree at the record's commit, the record's command run in it; the new run names
  the first as its parent.

| Test | Result |
|---|---|
| T1 a run from a clean tree | 52.9 s, 0.35 s of it writing; the code's commit took 3 ms and the record's commit 0.22 s; record 11 KB, experience 2.9 MB, large 138 MB |
| T2 the code is changed and committed (a quarter of the learning rate); then the first run is made again | the remake ran the first run's commit (`d33262f`), not the new code; 0.0137 against 0.0168; 52.9 s |
| T3 an uncommitted edit and a new untracked probe that patches `gcsl` in memory (40,000 steps) | the run's code is commit `4a669bc` under `refs/runs/<id>`, holding the edit and the probe's script with the patch in it; made in 10 ms; working tree, index and branch as before |
| T4 the probe's script is deleted and the edit undone; the probe is made again from its record | it ran from the commit; 0.166 against 0.176 at 40,000 steps |
| T5 a run is killed after 28 s | the record has its manifest and 63 lines and no end note; the state to continue from is at step 52,296; the list shows it as unfinished |
| T6 list, sizes, pin, clean the large tier | the pinned run's outputs stay; the others' large outputs go, each folder named; the experience stays |
| T7 remove | an empty and an unknown ID are refused; a run that another names as its parent, or that a tracked document cites, is refused unless forced; a remake was removed with its outputs, as a commit |

What went wrong on the way, and what it means for the design:
- **My draft's remove deleted everything it could reach.** In the first pass a failed test left an empty ID, and
  `remove ""` resolved to the outputs' folders themselves and to `runs/`: both tiers and every record of the draft
  were gone. It stayed inside the draft's scratch folder. A delete must refuse an ID that is empty, unknown or
  holds a path separator, and must check that what it deletes is a run's own folder; the rerun tests that. This
  is the second delete mistake in this project (2026-11-21); the removal code needs tests before anything else.
- **Run time is not resolved.** With the experience and the periodic state, a run took 52.9 s twice; the first
  draft's runs took 42 to 49 s. Writing is 0.35 s of it, so the rest is inside the compiled loop (handing out
  the experience) or between-process noise. To measure with the experience as a setting, several runs each.
- **A killed run's record stays uncommitted**, which made the next run see a changed tree and commit its code
  under a ref although no code had changed. Unfinished records need a rule (commit them at the start, or leave
  them out of the check).
- **A removed run's code ref stays.** Nothing removes `refs/runs/<id>` yet.
- **The remake used today's libraries and the project's installed environment package.** Rebuilding the libraries
  of an old lock file, and making the temporary tree's own package the one that is imported, are not tested.
- **The blindness check reads session files in the working tree.** A temporary tree of an old commit has them only
  if they are committed; in the draft they are.

Not covered: a human session's record; continuing from the stored state in this draft (tested in round 1);
two runs at once committing their records; hundreds of record commits in the branch's history.

### Rejection records
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

### Findings of the round-1 checks
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

### State after the round-1 answers (2026-11-22), before round 2
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

### Harms and growth, for the leading option
- **Lock-in**: the ID form and the record's file names are cited by remarks, READMEs and the parent decision's
  addresses; changing them later means rewriting citations. One-way: stress-tested in the draft, and the form of
  the ID is asked before anything is built.
- **Hidden coupling**: the human-baseline folder's file names are what the blindness check reads (`gcsl.py:553-559`,
  `play.py`, `review.py`). Moving sessions into a new store would change what is allowed. So sessions keep their
  files; their record is added beside them.
- **Blindness**: the check sits in the command-line entry today, and probes call `train` directly, so a probe on
  an unplayed layout would not be refused. The record's opening is the place every run passes; the check moves
  there. A human session played in one condition only has a record that must not be listed for the user.
- **Stored copies of sources** must never include the layout file; the draft hashes it and copies nothing. A test
  has to hold that.
- **Growth**: a setting that is renamed makes an old record's settings unreadable by new code
  (`gcsl_video.py:63` rebuilds them). A remake runs the run's own copy of the code, so it is not affected; views in
  new code are (R6 ~).
- **A remake after the libraries changed** may not run at all (the lock file's hash differs). Then the large
  outputs are gone for good; the record says so instead of failing silently.
- **Maintenance**: 150 to 250 lines the assistant keeps in a project without history; a mistake in the removal of
  old outputs deletes files. The removal names each folder it deletes and never follows links (the rule set after
  2026-11-21).
- **Disk outside the snapshots**: a folder under the home folder is inside them (`~/.cache` is; checked). A volume
  of its own has to be made once, by the user or with their go-ahead.

## Open questions
Answered in round 1: tool-written run records (yes, apart from the code), the musts (R3, R12, R18b), the store
(own plain files), the experience (disposable, its own tier), the ID's form (date and time with a free label),
"the same conclusions" (by eye), the disk (no cap), keeping (records may go too), version control (yes, later).

For round 2:
1. When a throwaway run's record is removed, what happens to a remark or a number that cites it, and who may
   remove a record? Decides R17b against R1 and R14.
2. Are the lasting records kept in version control, and if so where: with the code, on refs of their own, or in a
   repository of their own (R21, O17)? Who commits them?
3. The priorities of R6, R13, R14 and R21 (claimed or inferred).
6. Does a ref that a tool writes to hold a run's uncommitted code count as "apart from the code" (R20b)? Decides
   J3's variants and O13.
4. The exact form of the ID with its label, shown on the draft.
5. Not asked, known gap: what a human session's record holds beyond the session file.

## Sources
| Claim | Source (URL or `file:line`) | Date | Reliability |
|---|---|---|---|
| All methods and probes train through `gcsl.train`; the save is in `main` | `experiments/gcrl-maze/gcsl/gcsl.py:412-454`, `598-602`; probe script line 193 (generator J) | 2026-11-22 | read in the code; the probe line by the generator only |
| A recorded run is not slower; record 12 KB; large outputs 138 MB; experience 2.8 MB compressed and about 4 s | the draft's logs in the scratch folder (`record.log`, `stream.log`, `remake.log`, `continue.log`) | 2026-11-22 | measured once each; the 4 s is within run-to-run noise |
| The same settings and seed give 0.0165 to 0.0188 at the end | the same logs and `plain.log` | 2026-11-22 | measured, four runs |
| A continued run starts where the first ended | `continue.log` against `record.log` (0.017 and 0.01686) | 2026-11-22 | measured |
| `~/.cache` is inside the snapshotted volume; snapper snapshots `/home` hourly | `stat` (inode 269, not a volume root), `/etc/snapper/configs/home` | 2026-11-22 | checked on the machine |
| Trackers do not remake or continue runs; code identity is a commit | generator F (MLflow documentation, partly from memory) and generator J, independently | 2026-11-22 | two reports, neither verified by a run of the tool |
| DataLad drops and reruns outputs from a commit's record; a rerun of a non-deterministic run registers as changed | generator F and generator G, independently, with handbook URLs | 2026-11-22 | two reports; not run here: unverified |
| XLA can be made deterministic at a speed cost of 10 to 20 % | generator F (openxla.org/xla/determinism; the figure anecdotal) | 2026-11-22 | unverified |
| A `Learner` holds all a run needs to go on; only networks are kept today | `gcsl.py:110-118`, `440-441`; confirmed by the draft's continued run | 2026-11-22 | read and measured |
| The blindness check reads the human-baseline folder's file names | `gcsl.py:553-559`; `play.py`, `review.py` by generator J | 2026-11-22 | the first read here, the others by the generator only |

## Round checklist
Round 2.

Checklist:
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
- Problem formulation (2026-11-22): confirmed on the second write-back. No ranking yet.
- Round 1 (2026-11-22): first ranking. O11 (an own record written by the shared loop, large outputs apart and remade) leads; O12 (the same on a tracker) is a near-tie; the naming rule (J2) and one journal (G7) are level variants; F4 and O13 (version-control tools) are behind on R20, which is not checked. Almost every priority is still claimed, so the ranking is provisional.
- After round 1's answers (2026-11-22): own plain files chosen, so the tracker form (O12) is out; the ID is a date and time with a free label, so hash names and running numbers are out as its form; version-control tools (F4, O13) are behind on R23 (the record must work without a repository) instead of R20. O11 leads; its untested cells on the musts R3, R12 and R18b are round 2's work.
- The user's correction after round 1 (2026-11-22): "git will be added before implementation" (R23b replaces R23). The version-control tools (F4, O13) are back as unverified contenders for round 2; O11 still leads on what was tested.

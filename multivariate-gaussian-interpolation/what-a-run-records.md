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

Version control (user, 2026-11-22): the project not being a git repository is "Not deliberate"; "git will be added
before implementation"; "autonomous commits are okay in this repository, they will not be reviewed", and the
project keeps large changes. The delete-caution rule of the project `CLAUDE.md` ends only when results are under
version control or backed up in a way the user confirms, which disposable outputs outside the repository are not.

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
| R3 | A run tells what made it: method, settings, seed and code (with the libraries' lock file, the Python version and the device, as far as they are known) | "Unclear what made it" has cost the user something; two runs cannot be compared with confidence | user, 2026-11-22; parent R20 | must | yes (user, round 1: ticked as a must; it has cost them) |
| R12 | A run's lasting record holds enough to make the run again with approximately the same results: the same conclusions, the numbers may differ | The large outputs could not be made again once they are gone; a result could not be checked or built on | user, 2026-11-22 ("Make it again"; "enough information to be able to rerun them with approximately the same results"; "The same conclusions") | must | yes (user, round 1: ticked as a must). "The same conclusions" is judged by the user by eye: a remake shows the old and the new curves together and promises nothing by itself |
| R18b | A run's large outputs (such as its stored networks) can be deleted at any time without losing anything the user still wants. Pictures, remarks and continued runs may rest on outputs that were made again | "Deleting would be risky" otherwise (the user's answer; the user did not choose "A result was lost" as something that cost them) | user, 2026-11-22 ("Acceptable everywhere"); replaces R18, whose wording named how they come back (that is R12 and the user's proposal O3) | must | yes (user, round 1: ticked as a must) |
| R19b | Large outputs cost nothing in whatever versions, snapshots or backs up the project | "They would get versioned or backed up" | user, 2026-11-22; replaces R19, which added the assistant's own "the lasting record is small enough to be in them" | should (claimed) | need yes, priority no |
| R21 | The lasting record is protected against loss by a delete or a mistake | It is what everything else is remade from; the project has no history and lost a results folder once | inferred (bias check, round 1) | should (claimed) | no |
| R13 | A stored run can be trained further from where it stopped | The user expects to continue runs | user, 2026-11-22 ("Continue it") | should, later | yes (user, round 2: not in the first version; the state is saved either way, so the design keeps room for it) |
| R14 | A reported number can be traced to the run that gave it | A README or report number cannot be checked | user, 2026-11-22 ("Use it as evidence") | should, later | yes (user, round 2: a check of cited IDs is not in the first version; a number cites an ID by convention until then) |
| R15b | The disk the disposable outputs take is visible, and they are cleaned on the user's word; there is no fixed cap | "No fixed number" when asked for a cap | user, round 1 | should | yes |
| R16 | Recording does not slow a run beyond a limit | The user named it as a limit; amount not set. For live results the user accepted "Slower, not broken" (parent R13) | user, 2026-11-22 | should (claimed) | need yes, amount not asked. Writing and committing cost about 0.6 s a run in the drafts; what handing out the experience costs inside the compiled loop is not resolved |
| R17b | Runs worth keeping can be told apart from throwaway ones. A throwaway run's record can be removed too, not only its outputs | "Depends on the run"; "Records may go too" | user, 2026-11-22 and round 1 | should | need yes; who removes a record, and what happens to a remark or number that cites it, not asked |
| R4 | A run's results can be seen while it trains | The user waits for the end of a run to see anything | parent R13 (user, 2026-11-22: "I'd also like to be able to see run results as they come in"; "Slower, not broken") | should | carried over |
| R5b | What the agent experienced during a run can be examined afterwards. It is disposable: after deletion the experience of a run made again is shown, which is similar, not the same | "What data it saw" cannot be answered otherwise | parent R4b (user, 2026-11-22); user, round 1 ("Disposable, but separate from the large outputs") | should | yes |
| R22 | Kinds of disposable output can be deleted independently, and the small ones (the experience) outlive the large ones (the networks) by default | Freeing disk should not cost the experience; asked what the separation is for: "Delete them independently", "Keep it longer" | user, round 1 | should | yes |
| R6 | A view written later gives, for an old run, the answers the run's own code would give, or says that it cannot (first worded as: a run's learned networks stay usable after the method's code changes) | Views computed from an older run are wrong or fail | inferred (bias check round 1) | should | yes (user, round 2: "Old runs in new views" belongs in the first version; round 3: a view that needs what a run did not store may be written against the run's raw network functions, which are stored too ("Also store raw functions"); six months without a remake "is enough") |
| R7 | Any method's run in the maze fits, and so do probes and human baseline sessions; a run in a later environment is not blocked | The record is redone per method or per kind of run | user, 2026-11-22 (the three kinds chosen); parent R1 (must, verified), R2 (should) | must (methods), should (probes, sessions, later environment) (claimed) | kinds yes, priorities no |
| R8 | The blindness rule holds: nothing from a layout the user has not played is recorded in a form the user is shown, and such runs stay refused | Seeing a layout cannot be undone | project `CLAUDE.md` (user, 2026-11-20, 2026-11-21) | must | yes |
| R9 | Layouts are named by number only | The user asked for it | project `CLAUDE.md` (user, 2026-11-20) | must | yes |
| R10 | Low upkeep as methods and experiments change | The user values it; a record that every new method must be taught costs every time | parent R16 (user, 2026-11-22) | should | carried over |
| R23b | The project is a git repository before the run record is implemented; the record may rely on it | The need behind it, as the bias check words it: the code that made a run can be fetched again, and a mistaken delete of a record can be undone. A constraint the user set. The user corrected the round-1 answer "Yes, but later": "git will be added before implementation" | user, 2026-11-22 (replaces R23) | must | yes (the user's own statement of the order) |
| R24 | A run's ID is its date and time together with a free label that whoever starts the run types ("experiment name") | The need behind it: an ID a person can read, sort by time and recognise the purpose of. The user's choice of the ID's form; the label has no fixed meaning | user, round 1 ("Datetime, but also an experiment name"; "A free label") | should | yes (a form, chosen by the user; one-way once runs are cited) |
| R25 | The record's store is plain files the project owns, not a tracker's database. Scope: the record; it says nothing about where the disposable outputs are stored | The user's choice between near-tied options | user, round 1 (asked "plain files the project owns, or an existing experiment tracker (MLflow, Aim or trackio) as the store and live view?": "Own plain files (Recommended)") | should | yes (a form chosen by the user) |
| R26 | The run record is built as own code on plain git, not on DataLad or DVC | The user's choice between near-tied options, after an overview of each one's workflow and advantages and a question on how DVC bears on the parent decision | user, round 2 (asked "What should sit under the run record?" with the options own code on git, DataLad underneath, DVC underneath: "Own code on git.") | should | yes (a form chosen by the user) |
| R27 | Before a run the whole working tree is committed to the working branch, and the run's record is committed to it after the run | The user's choice of how a run's code gets its commit and where records are committed | user, round 2 (asked "What may the run record put on your working branch automatically?" with the options everything, records only, nothing: "Everything (Recommended)") | should | yes (a form chosen by the user) |
| W1 | Existing runs get such a record | "Old runs don't matter" | user, 2026-11-22 (parent W3) | won't | yes |
| W2 | Experiments outside the maze (attention-regression) get such a record | Not chosen when asked what counts as a run. Would come back if those experiments are taken up again | user, 2026-11-22 | won't | to be confirmed with the problem |

## Options
This decision is made of parts (see the map in *Evaluation*). An option that covers one part is marked
"part"; the leading option is a composition of parts. The field's documented route is F2 (an experiment
tracker); for stored states the JAX documentation points to Orbax (named in J5's report).

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O4 | Do nothing: runs stay as they are | No work; every method fits | Everything the problem names stays: no name beyond the path, a repeat replaces the run, no method or code in the file, nothing until the end, nothing to continue from; checkpoint files are in the snapshots today; probes skip the check for unplayed layouts (R8 ~) | cheap | not applicable (R3 and R18b, musts) |
| O5 | Change the process only: every run goes to a dated folder of its own through `--results`, and the assistant keeps a run list in the notes (what was run, with which settings, why) | No code; works today | Rests on the assistant remembering each time; nothing while training, nothing to continue from, no experience; the code that made a run is still unrecorded | cheap | not applicable (R18b, must): nothing makes deleted outputs again |
| O6 | The simplest that could work (J10): one line per run appended to a run list at the project root (ID, time, command line, settings, source hashes, final scores, where its files are), and the ID in the result files' names so a repeat replaces nothing | About 20 lines; findable and citable at once | Nothing while training, nothing to continue from, no experience, large outputs stay where they are | one-way for the ID form; cheap otherwise | not applicable (R18b, must); O6b is its variant that avoids it |
| O6b | O6 with the large outputs written to a separate place (O3): about 30 lines | Findable, citable, and what may be deleted is marked by where it sits | Nothing while training, nothing to continue from, no experience; the code is recorded by hash only | one-way for the ID form; cheap otherwise | trailing (R4, R5b, R13); the first stage on the way to O11 |
| O1 | The list from the parent's bias check (the assistant's): a name that survives moving and reruns, the method, a write at every evaluation, the data the agent saw, how the networks are called, the code that made it, and a regenerable index of runs. No separate place for large outputs, no remake, no state to continue from, no keeping rule | The cheaper middle composition: finding, naming, live lines and experience without the two tiers | Networks stay with the record; nothing to continue from; nothing says what may be deleted | one-way for the ID form and the record's files | not applicable (R18b, must): no way to make deleted outputs again; a stage on the way to O11 |
| O11 | The own record on git, as the second draft has it (the assistant's): the shared training function refuses unplayed layouts and opens a record before the first step. ID: date, time and a free label. Code: a commit. The whole working tree, untracked files too, is committed to the working branch before the run (the user's choice, R27); the second draft tested the same commit kept under a ref of the run instead, and the clean-tree path that a commit first leads to. Record in the repository (`runs/<id>/`: manifest, a line per evaluation, end note, pin), committed to the working branch by itself when the run ends. For views written later, the run stores what its networks can be asked as functions that need no project code (O21). Two disposable tiers outside the repository under the same ID: the experience per evaluation segment; the networks per evaluation and the learner's state, replaced during the run and written at the end. A remake runs the record's command in a temporary tree at the record's commit, as a new run naming its parent. Listing by scanning the records; pin; clean a tier (unpinned runs, each folder named); remove a record (refused while a run or a document points at it, unless forced). A human session's record is the session file itself, committed | Tested in the second draft (T1 to T7): code named by a commit also for uncommitted and in-memory-patched code, a remake after the code changed, a killed run, the three tiers, pin, clean, remove. Tested in the first: continuing from the state, the scan of 1,000 records. One place to change serves every method and probe | About 230 lines of own code in the draft, more with tests (R10 ~), and the part that deletes went wrong once in the draft; run time with the experience unresolved (R16 ~); a number is tied to a run by citing its ID (R14 ~); hundreds of record commits on the branch; old libraries on a remake and human sessions are not tested (R7 ~ for sessions); the remake does not yet point the environment package at the temporary tree (that it can was checked apart); outputs outside the snapshots not verified (R19b ~) | one-way for the ID form and the record's files (runs and remarks cite them); cheap for where large outputs sit and for the keeping rule | leading: the user's choices (R26 own code on git, R27 everything on the working branch), with O21 for R6 |
| O19 | The code of every run is committed to the working branch before the run starts, the whole working tree (from the round-2 bias check): no refs of the runs | The simplest way to give a run's code a name now that unreviewed automatic commits are allowed; one history that survives a clone. It is a plain commit of everything followed by the clean-tree path, which the second draft tested (T1, T2) | A commit of work in progress before every run from changed code; the commit of everything itself was not run in the draft | cheap | part of the leading option: the user's choice (R27) |
| O21 | For R6, the run stores what its networks can be asked as functions that need no project code (J12, F16: `jax.export`): each method declares its calls (the action at states towards goals, the learned time to the goal, the model's step), and the run writes each once beside its networks, with the networks as arguments | Tested for one method and two calls: new code with no project module imported got the run's own answers (difference 0 on the same device; the rejection check measured 4e-7 and 8e-5 on the CPU); 5 and 9 KB per call, written in 0.05 s; in a process that is already running, a first call takes 0.3 to 0.5 s and later ones 3 ms; other batch sizes work; a call composes inside a compiled loop | One small library more (flatbuffers); a stored function cannot be mapped over with vmap, and many calls inside one compiled function compiled for 213 s, so a call's inputs must already carry the batches the views need; JAX guarantees that a stored function stays loadable for six months (its documentation and source, checked by both round-3 checks); after that, or after the networks were cleaned, the run is made again in its own code, which is O20's exposure too (old code on new libraries: untested); a question the run did not store cannot be put to it later; each method declares its calls | one-way for the calls' names and signatures (views use them); cheap otherwise | leading for R6, by tie-breaks over O20 (no requirement of this log separates them) |
| O20 | For R6, compute in the run's own code (J4's idea with the code as a commit): a view asks a process that runs at the run's commit to evaluate the networks on given inputs and gets arrays back | Any function of the old code can be asked; nothing extra is stored | A process per code version: 4.9 s from start to a first answer in the draft, then it has to be kept running to be quick; a temporary tree per commit; a way of asking that every code version must keep understanding | costly (a protocol every version has to keep) | level with O21 on the requirements (both meet R6, both ~ R10); set behind it by tie-breaks: a process per code version against none, and what the parent decision needs of a view's speed. It is also what O21 falls back on |
| O22 | For R6, adapters in new code: the view code keeps a reader per older version of each method's networks | Nothing stored, no process | Every change of a method's networks adds a reader to keep, for as long as its runs are looked at | cheap | trailing (R10): a reader per older version to keep; its variant, converting kept runs once when a method's networks change, costs less and is still upkeep per change |
| O23 | For R6, refuse: a view shows a run only when its code equals the code that views it; otherwise the run is made again in today's code | Nothing to build | A run of changed code cannot be viewed as it was: R6 is not met | cheap | trailing (R6) |
| O18 | O11's record with git-annex (through DataLad) as the store of the two disposable tiers (the assistant's, from round 2's tool test): the record and the code's commit as in O11; the outputs are annexed in a store of their own and removed with the tool's drop instead of own delete code | A dropped file stays listed as absent; the outputs' deleting is the tool's | Outputs become read-only links; a dependency of 156 MB; 0.5 s a run; two runs at once have to be kept apart; not tested as a composition | costly (a tool's store under the outputs) | level with O11; not taken: little gain (see its record). The user's choice R26 was among own code, DataLad and DVC and did not name this variant |
| O12 | O11's parts with an existing tracker as the store and the live view (from the rejection check): the tracker (MLflow, Aim or trackio) holds ID, settings and score lines and shows them live; source copies, the learner state, the separate place for large outputs and the pins are built beside it as in O11 | Live curves, search and a comparison page come ready, which overlaps what the parent decision would build | A dependency whose store is the lasting record (a database file; upgrades migrate it); probes and human sessions fit as attachments and tags; not checked: that these tools run on the project's Python 3.14, and what a logging call costs per evaluation | costly (the record lives in the tool's store) | trailing (R25: the user chose own plain files over a tracker's store, round 1); otherwise a near-tie |
| O13 | DVC experiments with DVCLive, tested hands-on in round 2 (`r2-dvc.md`): each run is a commit under a hidden ref, named by the user; large outputs in DVC's cache | Installs and runs on Python 3.14 (+1 to 1.7 s a run); uncommitted edits of tracked files are captured; live scores in its table; the branch history stays clean; an experiment whose output is gone stays listed | New untracked files (a new probe script) are left out without a warning unless staged. A killed run leaves no record. Two runs at once in one tree lost both. A second identical run is skipped as unchanged unless forced, and forcing with an existing name silently replaces that experiment. Its list shows only the current commit's experiments by default and took 5 s at 315. A regenerated output is a new experiment; the old record keeps pointing at the lost one. It writes outside the project (`/var/tmp/dvc`). 98 packages | costly | trailing (R26, as F4; R2 ~) |
| O15 | Sacred's file observer (from the bias check; F11 and J7 name it): an existing library writes a numbered folder per run with settings, deduplicated copies of the source files, score lines and the captured output | The record's folder and the source copies without own code | Low activity (last release found 0.8.5); not checked on Python 3.14; training code has to be wrapped in its experiment object; learner state, separate place and pins are still built beside it; numbered folders collide for runs started together unless configured | costly (a dependency's layout is the record) | trailing (R24: numbered folders; whether its run ID can be set was not checked); not verified |
| O3 | The user's proposal (2026-11-22): large run outputs live in a cache folder, apart from a record small enough to keep, and are recreated by rerunning | Deleting is safe by construction; the record stays small | A folder under the home folder is still inside the snapshots (checked: `~/.cache` is part of the snapshotted volume). A nested volume of its own, which snapshots do not descend into, is one command (not tested here), or a place outside `/home` | cheap (a path) | part of the leading option (where large outputs sit) |
| O2 | Put the project under version control (a consequence of "Not deliberate", not the user's proposal) | The code of a run is a commit; old code can be fetched again | Automatic commits are needed for runs from changed code (O19, or the ref of the second draft) | costly (habits and rules change) | settled by the user: the project is a git repository before the record is built (R23b); the code's identity is a commit (see O11) |
| O7 | Keeping by an act (J15, F19): large outputs expire by age or size unless a run is pinned with a reason; human sessions are pinned from the start | Nobody has to judge every run; the disk stays bounded | A pin is a habit; an unpinned run someone wanted costs a remake | cheap | part of the leading option (keeping) |
| O8 | Kept because cited (J16): a run's large outputs stay as long as a README, a remark or a study names its ID | No act needed; follows the evidence | Every citing document has to be scanned; a run under study but not yet cited is removed | cheap | part, later: level with O7 on the requirements (both R10 ~); O7 is taken first as the least to build, a tie-break; fits once reported numbers cite IDs |
| O9 | Remake as a check (J14): making a run again compares the new curves with the recorded ones and says whether the conclusion held | Turns "the same conclusions" into something a remake reports | Needs a stated conclusion or a tolerance per run; one model's seed spread is wide | cheap | part, not needed now: the user judges a remake by eye; the list shows a run and its parent side by side |
| O10 | Thinning (J19, F15): keep every k-th network snapshot, or the first, last and best; the rest are made again | Cuts the largest files several times over | A view of a thinned moment costs a remake | cheap | part, not needed now: the user set no disk cap |
| O14 | Find the cause of the differences between runs of the same seed first (from the bias check): a short investigation, short of making training exact (F7) | If the cause is cheap to remove, a remake is the same run and "the same conclusions" needs no definition | Time with an uncertain result; exactness would still end with any change of code or library | cheap | part, optional: not needed by O11; proposed as a separate small step |
| O16 | A tiered record (from the bias check): the learner's end state (6.5 MB) is part of the lasting record; only the per-evaluation networks are disposable | Continuing never needs a remake; the end networks of every run stay exactly as they were | 6.5 MB a run in whatever protects the record: 6.5 GB per 1,000 runs | cheap (a setting of O11) | variant, adopted in part: the state is written during the run too; it stays disposable |
| O17 | A small repository of its own for the records only (from the bias check): the lasting records are versioned there, apart from the code | The lasting record is protected and has a history without the code's review rule applying to it | Someone or something commits there; whether the assistant may (R20) is a question | cheap | part, answered: the records are committed to the working branch (R27), which protects them (R21); a repository of their own is not taken |
| F1 | Plain self-describing run directory, append-only logs, index by scanning: no tracking tool; a fixed layout is | The field's commonest practice for one researcher; no tool; a second process can follow the appended lines | Own schema to keep; code identity by commit presupposes version control (R3 ~, R12 ~); as described it has no experience and no state to continue from | one-way for the layout | part of the leading option (the record's layout and live lines): O11 is F1 with the learner state, the experience, source copies and the pins added; no rejection, it is contained |
| F2 | Local tracker with a database store (MLflow, Trackio or Aim): an existing tracking library is the record, and | The field's documented route: ID, search, live curves and a comparison page come ready | The lasting record is the tool's database; code identity is a commit only; continuing and remaking are not its functions; probes and human sessions fit as attachments; upgrades migrate the store | costly (the record lives in the tool's store) | trailing (R25, R13); as described it does not continue or remake runs |
| F3 | Parameter-addressed workspace (signac): the run's ID is the hash of its settings, so a run is found by | A run is found by describing it; no duplicates | The same settings resolve to the same folder, so a repeat needs a counter; the ID changes when a setting is added; no code identity, no live lines | one-way for the ID rule | trailing (R24, R2, R1) |
| F4 | DataLad, tested hands-on in round 2 (`r2-datalad.md`); DVC is O13. The run is a version-control commit with a rerun record (DataLad run or DVC experiments): history is the | Installs and runs on Python 3.14 (+0.5 s a run); the score file is readable while the run goes; drop and rerun work, a rerun with other bytes is a new commit without complaint; flat cost over 120 runs | Refuses a changed tree by default; in explicit mode the changed code is left out of the commit without a warning unless it is committed first. A rerun uses the checked-out code unless told otherwise and appended to the old score file. Two or three runs at once in one tree mixed files and left runs without a record. Large outputs are read-only links into `.git/annex`, inside the project folder. A run's name is a commit hash and a subject. Settings, state, experience, pins and listing are still built beside it. 156 MB of tools; dropping needs its force flag every time | costly (history and layout belong to the tool) | trailing (R26: the user chose own code on git among own code, DataLad and DVC, which were near-tied) |
| F5 | Outputs and reported numbers as cached build targets (Snakemake, redun, joblib.Memory, showyourwork): nothing | Deleting loses nothing; a reported number is a target with its runs behind it | A cache key is not a name to cite; a hit stands in for a run; code hashing is fragile; nothing while training; continuing is outside the model | costly | trailing (R24, R1, R2) |
| F6 | The experience log is the primary record, in an offline-RL dataset standard (Minari or RLDS): what the agent | Agent and human sessions become the same kind of object in a published format | The format's collector steps a Python environment one transition at a time, which a compiled loop does not do; settings, live lines and continuing are outside it | costly | not applicable as the record (R12, must); its idea is J6 |
| F7 | Bit-exact deterministic replay: make training exactly repeatable, and the record shrinks to seed, settings, | The record shrinks to kilobytes and a remake is the same bytes | A speed cost or a move to the CPU (not measured); any change of code, library or driver ends the exactness; looking at an old run costs a full rerun | costly | not ahead on any requirement as the user set them: its gain, exact repeats, goes beyond R12 ("the same conclusions"); its speed cost is unknown (R16 ?). Finding the cause of today's differences is O14 |
| F8 | The experiment, not the run, is the lasting unit: seed groups with interval statistics (rliable practice): | "The same conclusions" is defined where it is true, over several seeds; runs outside an experiment are throwaway without a decision | Several seeds per result, against the current rule of one model per run; human sessions and probes do not fit | costly (a habit) | part, later: trailing as the record (R7); kept as the way to check a remake once several seeds are allowed |
| H1 | The registrar's accession register (museums): a run's identity is a number given once from one register, marked | A number given once that means nothing and is marked on everything; a status that outlives the outputs | Opaque numbers need a finding aid; one place issues them | one-way for the ID form | part of the leading option (an ID given once, a status in the record) |
| H2 | Run number, data tiers and the good-run list (particle-physics experiments): runs are numbered, recorded in | A run number is short enough to say; a list says which runs may be cited | A verdict after every run and a list per report: two roles for one person and one assistant | one-way for the ID form | part: trailing as the ID's form (R24); the certified list is a later layer |
| H3 | The scoresheet and the sealed move (chess, baseball scorebooks): the lasting record is the sequence of moves, | Written as it happens; continuing from a fixed, sealed state | Megabytes per run in the lasting record | one-way for the format | part: as J6 and J5 |
| H4 | Certificate, instructions and iteration report (conceptual art and time-based media conservation): the lasting | A remake is a new iteration with its own report, never a replacement; what must stay the same is written down | A statement of essentials per experiment needs the user's judgement | cheap | part: "a remake is a new run" is adopted; the statement of essentials is open (with O9) |
| H5 | Master record, executed batch record, quarantine and release (pharmaceutical manufacture): each run fills in a | A record filled in while the run goes; a release or reject decision that sets how long it is kept | A decision after every run, by a second role | cheap | part: filling in as it goes and an end status are adopted; the release step is level with O7 on the requirements and asks a decision after every run, a tie-break |
| H6 | The auditor's working papers (accounting and audit): every reported number has a numbered paper that lists the | Numbers can be followed to runs and runs to the numbers resting on them | A schedule per reported number, and the discipline never to bypass it | cheap | part, later: as J8 |
| H7 | Allocation concealment and the unblinded pharmacist (clinical trials): every run's record is split when it is | A record is split into an open and a sealed part at creation, and opening is logged | Two parts for every record while training on unplayed layouts is refused anyway | cheap | part: adopted in a light form (the index does not list records of a layout not yet played in both conditions, which today can only be human sessions) |
| H8 | Evaporating trails and tagged memories (ant colonies, sleep): nobody decides which runs to keep; every run is | Nobody decides what to keep: what is used stays | Every reader has to record its use; a wrong fade is noticed late | cheap | part: level with O7 on the requirements; "least recently used first" is a variant of how unpinned large outputs go |
| G1 | Derivation and store with garbage-collector roots (functional package management): a run's name is the hash of the small recipe that makes it, its outputs live  | As J2, and a named root is the only thing that keeps outputs alive: keeping is explicit and cheap to undo | As J2 | one-way for the ID rule | trailing as the ID's form (R24); its roots are O11's pins |
| G2 | Suite ID, rolling restart dumps and a statistical "same climate" test (climate modelling): a registry issues each experiment a short opaque ID at creation, the  | Short IDs from a registry; continuing from periodic dumps; a statistical test of "made again" | Extra runs to form the accepted ensemble; a registry to keep | one-way for the ID form | part: dumps as J5, the test as O9 and F8, later |
| G3 | Master record, executed batch record and disposition (pharmaceutical manufacturing): each run copies the method's approved master in full, is filled in while it | As H5, and a small reserve sample stays when the bulk goes | As H5 | cheap | part: as H5; the reserve sample is the record's curves and end note |
| G4 | Accession register, bag with fetch list, and resolver (archives and libraries): a register issues a number that is never reused, the run is a self-describing pa | "Absent but obtainable" is a valid, listed state of a file; references go through one table | Hashing 90 to 330 MB of networks per run (seconds, estimated) | one-way for the manifest | part of the leading option: the record lists its large outputs also when absent; the packaging tool is not needed (a tie-break, no requirement) |
| G5 | Replay file: header, input log, checksums and anchor state (game engineering): the lasting record is the stream of what went in, not the state that came out, in | One format for the agent's experience and the human's input; a stored state to continue from | Replay in place of stored outputs needs exact repeatability, which is not required | one-way for the format | part: the shared shape for agent and human is adopted through J6; replay is not (see F7) |
| G6 | Run number, run registry, global tag, good-run list and data tiers (particle physics): runs are numbered by a counter and described in one queryable registry, w | As H2, with what a range of runs depended on named once | As H2; someone has to cut a new tag when dependencies change | one-way for the ID form | part: as H2 |
| G7 | One append-only journal with vouchers and reversing entries (bookkeeping and audit): everything that happens to any run is a numbered line in a single text jour | One text file holds everything in order; every index is a report from it; a number cites an entry | One file every run and reader depends on; a damaged or hand-edited journal loses every record at once | one-way for the entry format | level with the leading option's folder per run on the requirements; no requirement separates them. The draft used folders; cheap to choose before the first run, costly after |
| G8 | Merged into F4 (the same tool, DataLad, and the same cells). Run records in the version history with droppable content (research data management in neuroimaging): an existing tool, DataLad on git-annex, executes each run, |  |  |  | merged into F4: the same tool (DataLad) and the same cells |
| J1 | The shared loop writes the record: one run folder per call of `train`, opened before the first step. | The record is opened inside the shared training function, so probes, which skip the command-line entry, get one unchanged; a running or interrupted run can be looked at | Networks stay in the run's folder; no state to continue from, no keeping rule, no index; the blindness check is not in that function today | one-way for the layout | part of the leading option (where and when the record is written); alone not applicable (R18b, must) |
| J2 | Recipe-addressed runs: the ID is a hash of what makes the run, and the outputs are a cache. | The same recipe has the same name everywhere; a repeat is realisation n+1 and can never replace; found by describing | The name changes with every edit of a loaded source file and with every added setting, so one line of work has many names; a citation needs the name and the realisation number | one-way for the ID rule | trailing as the ID's form (R24); its hash is a field of O11's record |
| J3 | Git as the ledger: the code's identity is a commit, and the run records it. | Old code can be fetched by commit; a run of a clean tree is fully named | Probes and the assistant's untested changes run from uncommitted trees; the variants that keep a dirty tree reachable write objects and refs | costly | part, replaced by O19 (R27): the ref of the run was tested in the second draft and is not used |
| J4 | The run capsule: every run carries the sources it loaded, as probes already carry their script. | What made a run is in the run, with or without version control; old networks can be read by the code that wrote them; the layout file never leaves its place | Views that mix an old and a new run need a process per code version; about 80 lines | one-way (stored copies) | part, replaced: with the code in a commit, copies of the sources in the record are not needed |
| J5 | The whole `Learner` as the one stored state: restart file, networks and buffer in a single generic dump. | One generic file continues a run and holds every network without the method naming them; a new method costs nothing | A renamed field makes old states fail to load (loudly); continuing past the planned end needs a rule for the evaluation steps | one-way for the stored state's naming; cheap otherwise | part of the leading option (continuing) |
| J6 | The experience stream comes out of the shared loop, in the shape the human session already has. | The only exact account of what an agent saw; one change serves every method; the same shape as a human session | A change inside the compiled loop; megabytes per run; positions trace a layout's free space | cheap (a later addition is possible) | part of the leading option (experience); whether it is lasting or disposable is an open question |
| J7 | Merged into F2 (the same tools seen from the project's one loop; the same cells). An existing tracker behind the one loop. |  |  |  | merged into F2: the same tools seen from the one loop; the same cells |
| J8 | Study files: the record is written before the run, and runs are targets made when missing. | A reported table has a recorded derivation; being in a study decides what is kept | A study is written before anything runs, which try-outs are not; a runner and a renderer to keep | costly (a habit) | part, later: a layer on top of the leading option for comparisons and README tables |

## Matrix
✓ meets, ~ partly, ✗ fails, ? unknown, · the option does not address it (a part). Second row: the
priority (with ? when it is claimed and not checked) and whether it is verified ("need": the user named
the need, its priority is not checked). Assumptions per column: R8 assumes the blindness check sits in
the path every run takes where the option opens its record there; today it does not (probes skip it), which
is why O4, O5 and O6 have ~. R15 and R16 are marked from the drafts' measurements where one exists.
R20 was dropped and R23b (git comes first) holds for every option, so neither has a column. R19b is
unverified for every option. R24 to R27 are forms the user chose between level or near-tied options.

| Option | R1 | R2 | R3 | R4 | R5b | R6 | R7 | R8 | R9 | R10 | R11 | R12 | R13 | R14 | R15b | R16 | R17b | R18b | R19b | R21 | R22 | R24 | R25 | R26 | R27 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *priority, verified* | should, yes | should, yes | must, yes | should, yes | should, yes | should, yes | must (methods), yes; rest should? | must, yes | must, yes | should, yes | should, yes | must, yes | should later, yes | should later, yes | should, yes | should?, need | should, yes | must, yes | should?, need | should?, no | should, yes | should, yes (the user's choice of form) | should, yes (the user's choice) | should, yes (the user's choice) | should, yes (the user's choice) | |
| O4 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ~ | ✓ | ✓ | ✗ | ~ | ✗ | ✗ | ~ | ✓ | ✗ | ✗ | ✗ | ~ | ✗ | ✗ | ✓ | · | · | ✗ R1 ✗ R2 ✗ R3 ✗ R4 ✗ R5b ✗ R6 ~ R8 ✗ R11 ~ R12 ✗ R13 ✗ R14 ~ R15b ✗ R17b ✗ R18b ✗ R19b ~ R21 ✗ R22 ✗ R24 |
| O5 | ~ | ~ | ~ | ✗ | ✗ | ✗ | ✓ | ~ | ✓ | ~ | ~ | ~ | ✗ | ~ | ~ | ✓ | ~ | ✗ | ✗ | ~ | ✗ | ~ | ✓ | · | · | ~ R1 ~ R2 ~ R3 ✗ R4 ✗ R5b ✗ R6 ~ R8 ~ R10 ~ R11 ~ R12 ✗ R13 ~ R14 ~ R15b ~ R17b ✗ R18b ✗ R19b ~ R21 ✗ R22 ~ R24 |
| O6 | ✓ | ✓ | ~ | ✗ | ✗ | ✗ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✗ | ~ | ~ | ✓ | ✗ | ✗ | ✗ | ~ | ✗ | ✓ | ✓ | · | · | ~ R3 ✗ R4 ✗ R5b ✗ R6 ~ R8 ~ R12 ✗ R13 ~ R14 ~ R15b ✗ R17b ✗ R18b ✗ R19b ~ R21 ✗ R22 |
| O6b | ✓ | ✓ | ~ | ✗ | ✗ | ✗ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✗ | ~ | ✓ | ✓ | ~ | ~ | ~ | ~ | ~ | ✓ | ✓ | · | · | ~ R3 ✗ R4 ✗ R5b ✗ R6 ~ R8 ~ R12 ✗ R13 ~ R14 ~ R17b ~ R18b ~ R19b ~ R21 ~ R22 |
| O1 | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✗ | ~ | ~ | ~ | ✗ | ✗ | ~ | ~ | ✗ | ✓ | ✓ | · | · | ~ R3 ~ R6 ~ R10 ~ R12 ✗ R13 ~ R14 ~ R15b ~ R16 ✗ R17b ✗ R18b ~ R19b ~ R21 ✗ R22 |
| O11 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ R7 ~ R10 ~ R14 ~ R16 ~ R19b |
| O19 | · | · | ✓ | · | · | · | · | · | · | ✓ | · | ✓ | · | · | · | · | · | · | · | · | · | · | · | · | ✓ |  |
| O21 | · | · | · | · | · | ✓ | ~ | · | · | ~ | · | · | · | · | · | ✓ | · | · | · | · | · | · | · | · | · | ~ R7 ~ R10 |
| O20 | · | · | · | · | · | ✓ | ~ | · | · | ~ | · | · | · | · | · | ✓ | · | · | · | · | · | · | · | · | · | ~ R7 ~ R10 |
| O22 | · | · | · | · | · | ✓ | · | · | · | ✗ | · | · | · | · | · | ✓ | · | · | · | · | · | · | · | · | · | ✗ R10 |
| O23 | · | · | · | · | · | ✗ | · | · | · | ✓ | · | · | · | · | · | ✓ | · | · | · | · | · | · | · | · | · | ✗ R6 |
| O18 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ~ | · | ~ R7 ~ R10 ~ R14 ~ R16 ~ R19b ~ R26 |
| O12 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ? | ✓ | ✓ | ~ | ~ | ✓ | ~ | ✗ | ✓ | · | ~ R7 ~ R10 ~ R14 ? R16 ~ R19b ~ R21 ~ R24 ✗ R25 |
| O13 | ✓ | ~ | ~ | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ✗ | · | ~ R2 ~ R3 ~ R5b ~ R7 ~ R10 ~ R13 ~ R15b ~ R16 ~ R19b ~ R24 ~ R25 ✗ R26 |
| O15 | ✓ | ✓ | ✓ | ✓ | · | · | ~ | ✓ | ✓ | ~ | ~ | ~ | · | ~ | · | · | · | · | · | ~ | · | ✗ | ✓ | · | · | ~ R7 ~ R10 ~ R11 ~ R12 ~ R14 ~ R21 ✗ R24 |
| O3 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | ~ | · | · | · | · | · | · | ~ R19b |
| O2 | · | · | ~ | · | · | ~ | · | · | · | ~ | · | ~ | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | ~ R3 ~ R6 ~ R10 ~ R12 |
| O7 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | · | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ~ R10 |
| O8 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | ~ | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ~ R10 ~ R14 |
| O9 | · | · | · | · | · | · | · | · | · | ~ | · | ✓ | · | · | · | · | · | · | · | · | · | · | · | · | · | ~ R10 |
| O10 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · | · | · | · | · | · |  |
| O14 | · | · | · | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | · | · | · | · | · | · | · | · |  |
| O16 | · | · | · | · | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | ✓ | ~ | · | · | · | · | · | · | ~ R19b |
| O17 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | · | · | · | · | · | · | ✓ | · | · | · | · | · | ~ R10 |
| F1 | ✓ | ✓ | ~ | ✓ | · | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ~ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ~ | ~ | ✓ | · | · | ~ R3 ~ R6 ~ R10 ~ R12 ~ R13 ~ R14 ~ R17b ~ R19b ~ R21 ~ R22 ~ R24 |
| F2 | ✓ | ✓ | ~ | ✓ | ~ | · | ~ | ✓ | ✓ | ~ | ✓ | ~ | ✗ | ~ | ~ | ? | ~ | ~ | ~ | ~ | ~ | ~ | ✗ | · | · | ~ R3 ~ R5b ~ R7 ~ R10 ~ R12 ✗ R13 ~ R14 ~ R15b ? R16 ~ R17b ~ R18b ~ R19b ~ R21 ~ R22 ~ R24 ✗ R25 |
| F3 | ~ | ~ | ~ | · | · | · | ~ | ✓ | ✓ | ~ | ✓ | ~ | · | ~ | · | · | · | · | · | · | · | ✗ | · | · | · | ~ R1 ~ R2 ~ R3 ~ R7 ~ R10 ~ R12 ~ R14 ✗ R24 |
| F4 | ✓ | ~ | ~ | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✗ | · | ~ R2 ~ R3 ~ R5b ~ R7 ~ R10 ~ R13 ~ R15b ~ R16 ~ R17b ~ R19b ~ R24 ✗ R26 |
| F5 | ~ | ~ | ✓ | · | · | · | ~ | ✓ | ✓ | ~ | ~ | ✓ | · | ✓ | ✓ | · | ✓ | ✓ | ~ | · | · | ✗ | · | · | · | ~ R1 ~ R2 ~ R7 ~ R10 ~ R11 ~ R19b ✗ R24 |
| F6 | · | · | ~ | · | ✓ | · | ~ | ~ | · | ~ | · | ✗ | · | · | ~ | · | · | · | · | · | · | · | · | · | · | ~ R3 ~ R7 ~ R8 ~ R10 ✗ R12 ~ R15b |
| F7 | · | · | ✓ | · | ~ | ~ | · | · | · | ~ | · | ✓ | ~ | · | · | ? | · | ✓ | · | · | · | · | · | · | · | ~ R5b ~ R6 ~ R10 ~ R13 ? R16 |
| F8 | ~ | ✓ | · | · | · | · | ~ | · | · | ~ | · | ✓ | · | ✓ | ~ | · | ✓ | · | · | · | · | · | · | · | · | ~ R1 ~ R7 ~ R10 ~ R15b |
| H1 | ✓ | ✓ | · | · | · | · | · | · | · | ~ | ~ | · | · | · | · | · | ~ | · | · | · | · | · | · | · | · | ~ R10 ~ R11 ~ R17b |
| H2 | ✓ | · | · | · | · | · | · | · | · | ~ | ✓ | · | · | ✓ | · | · | ✓ | · | · | · | · | ✗ | · | · | · | ~ R10 ✗ R24 |
| H3 | · | · | · | ✓ | ✓ | · | · | · | · | · | · | · | ✓ | · | ~ | · | · | · | ~ | · | · | · | · | · | · | ~ R15b ~ R19b |
| H4 | · | ✓ | · | · | · | · | · | · | · | ~ | · | ✓ | · | · | · | · | · | · | · | · | · | · | · | · | · | ~ R10 |
| H5 | · | ✓ | ✓ | ✓ | · | · | · | · | · | ~ | · | · | · | · | · | · | ✓ | · | · | · | · | · | · | · | · | ~ R10 |
| H6 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | ✓ | · | · | · | · | · | · | · | · | · | · | · | ~ R10 |
| H7 | · | · | · | · | · | · | · | ✓ | · | ~ | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ~ R10 |
| H8 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | · | ✓ | · | ✓ | · | · | · | · | · | · | · | · | ~ R10 |
| G1 | ✓ | ✓ | ✓ | · | · | · | ~ | ✓ | ✓ | ~ | ✓ | ✓ | · | · | ✓ | · | ✓ | ✓ | ~ | · | · | ✗ | · | · | · | ~ R7 ~ R10 ~ R19b ✗ R24 |
| G2 | ✓ | · | · | · | · | · | · | · | · | ~ | · | ✓ | ✓ | · | ~ | · | · | · | · | · | · | · | · | · | · | ~ R10 ~ R15b |
| G3 | · | ✓ | ✓ | ✓ | · | · | · | · | · | ~ | · | · | · | · | · | · | ✓ | · | · | · | · | · | · | · | · | ~ R10 |
| G4 | ✓ | ✓ | · | · | · | · | · | · | · | ~ | ~ | · | · | · | · | ~ | · | ✓ | · | · | · | · | · | · | · | ~ R10 ~ R11 ~ R16 |
| G5 | · | · | · | · | ✓ | · | ✓ | · | · | · | · | ~ | ~ | · | ~ | · | · | · | · | · | · | · | · | · | · | ~ R12 ~ R13 ~ R15b |
| G6 | ✓ | · | ~ | · | · | · | · | · | · | ~ | ✓ | · | · | ✓ | · | · | ✓ | · | · | · | · | ✗ | · | · | · | ~ R3 ~ R10 ✗ R24 |
| G7 | ✓ | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ~ | ✓ | · | · | ✓ | · | · | · | · | · | ~ | · | ✓ | ✓ | · | · | ~ R10 ~ R21 |
| J1 | ✓ | ✓ | ~ | ✓ | · | · | ✓ | ✓ | ✓ | ~ | ~ | ~ | ✗ | ~ | · | · | ✗ | ✗ | ~ | ~ | ✗ | ✓ | ✓ | · | · | ~ R3 ~ R10 ~ R11 ~ R12 ✗ R13 ~ R14 ✗ R17b ✗ R18b ~ R19b ~ R21 ✗ R22 |
| J2 | ✓ | ✓ | ✓ | · | · | · | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | · | ~ | ✓ | · | · | ✓ | ~ | · | · | ✗ | · | · | · | ~ R10 ~ R14 ~ R19b ✗ R24 |
| J3 | · | · | ✓ | · | · | ~ | · | · | · | ~ | · | ✓ | · | · | · | · | · | · | · | · | · | · | · | · | · | ~ R6 ~ R10 |
| J4 | · | · | ✓ | · | · | ~ | · | ✓ | · | ~ | · | ✓ | · | · | ✓ | · | · | · | · | · | · | · | · | · | · | ~ R6 ~ R10 |
| J5 | · | · | · | · | ~ | ~ | ✓ | · | · | ✓ | · | · | ✓ | · | · | · | · | ✓ | · | · | · | · | · | · | · | ~ R5b ~ R6 |
| J6 | · | · | · | · | ✓ | · | ✓ | ✓ | · | · | · | · | · | · | ~ | ~ | · | · | · | · | · | · | · | · | · | ~ R15b ~ R16 |
| J8 | ✓ | ✓ | · | · | · | · | ~ | · | · | ~ | ✓ | ✓ | · | ✓ | · | · | ✓ | · | · | · | · | · | · | · | · | ~ R7 ~ R10 |

## Evaluation
### The parts of this decision (the design-space map)
The 32 generated options and the 11 others differ on six points, and most options cover one or two of them. A
design is one choice per point; the leading option (O11) is such a composition.

| Part | The choices found | In the leading option (round 2) |
|---|---|---|
| What names a run | an ID given once at the start (F1, J1, H1, G4); a running number from one register (H2, G6, G2); a hash of what makes the run (J2, G1, F3, F5); a name the tool gives (F2; a commit: F4; a named ref: O13); a place in a study (J8, F8); the path, as today (O4) | date, time and a free label (the user's choice, R24) |
| Where the lasting record lives | a folder of plain files per run (F1, J1, G4, H5); one journal or database for all runs (G7, O6, J9); the version history (F4, O13); a tool's store (F2); a study file (J8, H6) | a folder of plain files per run in the repository, committed to the working branch when the run ends (R27) |
| How the code is identified | a commit of a clean tree (O2, J3, F4); a commit of the working tree before the run (O19); a commit of the working tree under a ref of the run (the second draft, O13); hashes or copies of the loaded sources (J2, G1, J4, F17); not at all (O4) | a commit: the working tree is committed to the working branch before the run (O19, R27) |
| Where the disposable outputs are and how they come back | next to the record (J1, O4); a separate place under the same ID, remade by a new run (O3, G1, J2, G4); a tool's object store with pointers in the history (F4, O13, O18); not stored, replayed exactly (F7, G5) | two tiers outside the repository under the same ID; remade by a new run at the record's commit that names its parent |
| What a run continues from, and what it experienced | the whole learner state (J5, G2, H3); a replay from the start (F7); the experience handed out of the loop (J6, F6, G5, H3); nothing (O4) | the learner's state, replaced during the run and written at the end; the experience per evaluation segment in a tier of its own |
| What decides keeping, and how a number is tied to a run | an act (O7, G1's roots, H5's release); being cited or in a study (O8, J8, F8, H2); use (H8); thinning (O10). A number cites an ID (O11); a schedule or study renders it (H6, J8); a remake checks it (O9, F8, G2, H4) | nothing goes by itself: a tier is cleaned on the user's word, pinned runs excepted; a record can be removed unless something points at it; a number cites an ID |

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

### The part for R6 and its test (round 3)
R6 "A run's learned networks stay usable after the method's code changes" was put in the first version by the user
(round 2: "Old runs in new views"). The parent's round-1 bias check named the gap behind it: a method does not say
how its stored networks are called, so any view has to know that per method and per version of its code.

Four ways (O20 to O23). Two were tested in the second draft's repository on the run `...-twin-a` (40,000 steps),
scripts `export_calls.py` (in the run's code) and `use_calls.py` (new code, run from another folder):

| | O20 compute in the run's own code | O21 store the networks' functions without project code |
|---|---|---|
| A first answer, for a viewer that is already running | a new process per code version: 4.9 s to start, compile and answer two calls once; quick only while that process stays up | 0.3 to 0.5 s for the first call of each function, then 3 ms |
| The answers | the run's own | the run's own for the action and the time to the goal at 500 states: difference 0 on the same device; the rejection check reloaded on the CPU and measured 4e-7 and 8e-5 |
| What is stored | nothing | 5.3 and 9.4 KB per run, written in 0.05 s |
| What new code needs | a temporary tree at each run's commit and a way of asking that every code version keeps understanding | no project module at all (checked: none was imported) |
| Limits found | one process per code version | `vmap` over a stored function is not implemented; 16 calls inside one compiled function took 213 s to compile, so a call's inputs have to carry the batches views need (pairs of state and goal); needs the library `flatbuffers`, which the project does not have |

The scripts' output was not written to a file when they ran; the lines are copied from the session into
`.../run-record-spike3/calls/output-copied-from-the-session.txt`. The rejection check confirmed the files' sizes,
that no project module is imported, and the six-month guarantee in the installed JAX's source.

Not tested: the model's step as a third call; what a stored function carries of the layout (the action's function
is built with the environment's settings; runs are only ever made on played layouts, so R8 holds either way); a stored function read by a later JAX version (documented as
supported for a limited time; six months by generator J's report); methods other than the model one; a walk
through the real maze composed in new code (the draft composed a walk without walls).

Rejection records for this part. The leading way is O21; its weak cells are ~ R10 (a library, a time limit, each
method declaring its calls) and ~ R7 (one method tested).
- **O20, a process in the run's own code: level on the requirements, behind by tie-breaks.** Both meet R6 and both
  are ~ on R10: O20 keeps a way of asking that every later code version must understand, O21 keeps the calls'
  names and inputs. What sets O21 ahead no requirement of this log covers: no process per code version, and a
  view of an old run that answers in milliseconds, which the parent decision asks for ("quick", "smooth"). O20 is
  also what O21 falls back on: when a run's networks were cleaned or its stored functions are past JAX's six
  months, the run is made again in its own code and stores them afresh. That path runs old code on today's
  libraries, which is untested for both.
- **O22, readers per old version in new code: trailing (R10).** R10 "Low upkeep as methods and experiments
  change". Scenario: the time-to-goal network gains a layer; the view code keeps the old reader for as long as
  old runs are looked at, and one more after every change. Its variant, converting kept runs once when a method
  changes, is less to keep and still work at every change.
- **O23, refuse runs of other code: trailing (R6).** R6 as worded is met only in its second half ("or says that
  it cannot") for every run of changed code, which is most old runs.
- **Not rows** (named by the bias check): storing answers on fixed states and goals fails the parent's "any point
  of the map"; storing each network's plain forward pass beside the declared calls is a possible addition to
  O21, asked of the user this round; ONNX or raw StableHLO as the stored form were not looked at.

What O21 does not give, whatever is chosen: a question the run did not store cannot be put to it later, short of
its own code knowing that question, which old code does not. A view that needs a new call can show only runs made
after that call exists, and has to say so for the others.

Harms for O21: the calls' names and inputs become something views rely on, so they are one-way like the ID; a
method that changes what a call means (another unit for the time to the goal) breaks views silently unless the
call says its unit; a stored function is tied to the JAX version by its time limit, so very old runs need a
remake before they can be viewed, which costs the run's time.

### Findings of the round-3 checks
Rejection check (independent, given the leading options): eight points, all taken.
- "Own code on git" and "everything on the working branch" were used as reasons without requirement rows and
  without the questions as asked: now R26 and R27, with both.
- O18 was called trailing by a choice that did not name it: now "level, not taken, little gain".
- Rows still described the ref of the second draft although the user chose the commit on the branch: O11's
  summary, J3, O17 and the map are corrected. The commit of everything was not run in the draft; what follows
  it (the clean-tree path) was.
- O20 "trailing (R10)" was not supported by the matrix: now level, behind by tie-breaks, and O21's fallback.
- O21's R7 was ✓ on one method (now ~); O11 was ✓ on R6 while its near-ties stayed ~ (now alike); O22 and O23
  lacked R16 (now ✓).
- Evidence: no output file was kept (the lines are now copied into one); "exactly" held only on the same device;
  the two first-answer times counted differently (the table now says what each counts); the test read a copy of
  the networks written by the run's code.
- The matrix preamble had swapped lines and two rows repeated text: fixed.

Bias check (independent; its extract leaves out *Evaluation* by design, so it read the scripts instead):
- **R6 was verified for its timing, not its shape.** Open: how old a run must stay viewable, whether a later
  view may ask what the run never stored, and whether saying "it cannot" is enough. Taken: R6 reworded to the
  need, and asked this round.
- **A stored function cannot answer a question the run did not store.** Taken (the section's last paragraph).
- **After six months, or a clean, a remake runs old code on today's libraries**, the same exposure as O20.
  Taken into both records.
- **Only two calls of one method were tested; a walk needs the environment, which is today's code.** Taken as
  limits. The environment's code changing under an old run is not covered by any option: a known gap.
- **Missing ways**: stored answers, plain forward passes, loading old modules in the viewer's own process,
  converting kept runs once, O21 with O20 as fallback. Taken as noted in the records; loading old modules
  in-process is O20 without its process and was not tested.

### Rejection records (round 2)
Verified musts: R3 (a run tells what made it), R12 (it can be made again from its record), R18b (large outputs can
be deleted at any time), R7 for methods, R8, R9. The other rows are shoulds, verified or claimed as the matrix
says. The leading option's weak cells: ~ R6 (views of an old run in new code), ~ R10 (own code to keep), ~ R14 (a
number is tied to a run by citing its ID), ~ R16 (run time with the experience not resolved), ~ R19b (outputs
outside the snapshots not verified; the test was skipped on the user's word, for every option). A cost another
option shares with it is not held against that option. Round 1's records are in the rounds file.

- **O4, do nothing: not applicable (R3 and R18b, musts).** R3 "A run tells what made it: method, settings, seed and
  code": the result file holds no method and no code. R18b: nothing makes a deleted output again. Scenario: the README says 5.2 % for a seed whose curves "are not
  kept"; the file under that name is a later run. No variant of doing nothing avoids it.
- **O1, O5, O6 and J1 alone: not applicable (R18b, must).** R18b "large outputs can be deleted at any time without
  losing anything the user still wants": none of them has a way to make a deleted output again, so a delete is
  final. Variants that avoid it: O6b in part (a separate place, and enough recorded to rerun by hand), O11 in
  full.
- **F6, an offline-RL dataset as the record: not applicable as the record (R12, must).** Settings and code are
  outside the format. Its idea is the experience tier.
- **O6b: trailing (R4, R5b, R13; R3 and R12 ~).** Nothing while training, no experience, nothing to continue
  from; the code is named by hash only. It is still the first stage of building O11.
- **F4, DataLad: near-tie, tested.** With the code committed before every run, which the user's rule allows, it
  meets the musts: the run's commit names the code and the command (R3), a rerun makes it again (R12), drop and
  rerun work (R18b). The rejection check is right that the four requirements I had cited do not separate it from
  O11: both leave R19b unverified, both delete per tier or path (R22), `git log --grep` finds a run (R11), and a
  dated, labelled name can go into the commit's subject (R24 ~). Its ~ on R3, R5b, R13, R15b and R17b are things
  it leaves to code beside it, the same code O11 is. What separates the two no requirement covers:
  - it replaces about a quarter of the draft (the code's commit, the record's commit, the outputs' store) and
    brings behaviour that needs working around: a changed tree is refused, or in explicit mode the changed code
    is left out without a warning; a rerun uses the checked-out code unless told otherwise and appended to the old
    score file; outputs are read-only links; dropping needs its force flag;
  - two or three runs at once in one tree mixed files between commits and left runs without a record (O11: see
    the test below);
  - 156 MB of tools.
  It would win if the user wants an existing tool under the record for its own sake.
- **O13, DVC experiments: near-tie, tested.** With everything staged before every run it meets the musts
  (untracked files are otherwise left out without a warning: R3). The rejection check is right that I stretched
  R4, R7 and R11: live reading works, an arbitrary command can be recorded without a stage file, and its list
  shows everything when asked. What is left on the requirements: R2 ~ (a forced repeat under an existing name
  silently replaces that experiment). What no requirement covers: a killed run leaves no record; two runs at once
  lost both; a regenerated output is a new experiment while the old record keeps pointing at the lost one; its
  list took 5 s at 315 experiments; it writes to `/var/tmp/dvc`; 98 packages.
- **O18, O11's record with git-annex as the store of the disposable tiers: level, with little gain.** The draft's
  delete mistake was in removing a record, which stays own code here; dropping needs the tool's force flag every
  time. It keeps a dropped file listed as absent, which O11's end note also does by listing sizes.
- **O19, the working tree committed to the branch before every run: level with the ref of the second draft.** Both
  give a run's code a commit (R3, R12). The ref keeps the branch as it is and is local to this copy of the
  repository; the commit on the branch is simpler, puts work in progress into the history and travels with a
  clone. No requirement separates them: a question to the user.
- **F2, a tracker; O12, O11's parts on a tracker: trailing (R25).** R25 "The record's store is plain files the
  project owns, not a tracker's database" (the user's choice in round 1, a should). O12 is otherwise a near-tie;
  F2 as described also does not continue or remake runs (R13).
- **J2, G1 (hash names), H2, G6 (running numbers), F3, F5, O15: trailing (R24).** R24 "A run's ID is its date and
  time together with a free label" (the user's choice, a should). Scenario: the user wants to say which run they
  mean; a hash or a number says neither when nor what for. J2's hash of the recipe stays a field of the record;
  G1's roots are the pins. For O15 it was not checked whether Sacred's folder name can be set.
- **F7, exact replay: not ahead on any requirement** as the user set them (R12: "the same conclusions", judged
  by eye). O14 (finding the cause of the differences) stays an optional step outside this decision.
- **G7, one journal: level.** A journal is plain files too (R25), and in the repository it is as protected as a
  folder per run (R21). No requirement separates them; the two drafts used a folder per run and tested it, which
  is the only thing that sets the journal behind. Cheap to choose before the first run.
- **O8, H8, H5, G3, other rules for keeping: level with O7** (pin and clean on the user's word), which the second
  draft has. The user set no disk cap and wants records removable (R17b), so the rule is: nothing goes by itself.
- **J8, F8, H6, H2's certified list: later layers** that would raise R14 from ~ to ✓; not part of this decision.
- **J4, source copies in the record: replaced** by the code as a commit (R23b), which also holds untracked files.
- **Not added as rows** (named by the bias check): Hydra's run folders record the settings only (F12, inside F1);
  Guild AI had its last release in 2023 (F10); MLflow's plain-file store is in maintenance mode by generator F's
  report. The snapshots as the record's only protection are today's state (R21 ~ in O4's row).

### Findings of the round-2 checks
Rejection check (independent, given the leading option and the runner-up): twelve points, all taken.
- "Own plain files" was used as a reason without being a recorded requirement: now R25, with the question as asked
  and its scope (the record, not the outputs' store).
- Two runs at once was held against the tools while O11 carried it untested, with the same repository lock. Now
  tested once on the draft: two runs started together were both recorded and committed. One test; the lock can
  still be met, so the record is written before the commit is tried.
- F4's four cited requirements did not separate it from O11, and O13's record stretched R4, R7 and R11: both are
  now near-ties whose differences are costs no requirement covers.
- The matrix had the tools ahead of O11 on R6 and R16 for the same mechanism and on a workload without the
  experience: now marked alike.
- O15, F3, F5 and F2 carried conflicting verdicts, and "out" is not a verdict for a should: now "trailing (R24)"
  or "trailing (R25)".
- O1 was not applicable on a failure O4, O5, O6 and J1 share: all are now ✗ on R18b, and the record says the
  failure is "no way to make a deleted output again".
- G7's record contradicted its cells; R19b was ✓ for options although it is unverified for all: corrected.
- O11's R7 was ✓ although a human session's record is not drafted (now ~). Its remake imported the installed
  environment package, not the temporary tree's; checked apart that the tree's copy can take precedence
  (`PYTHONPATH` wins over the editable install), not yet inside a remake.
- O18's gain was overstated: the draft's delete mistake was in removing a record, which stays own code under O18.
- The map's last column and several rows were stale: rewritten.

Bias check (independent, not told the leading option):
- **Missing: commit the working tree to the branch before each run**, now that unreviewed automatic commits are
  allowed; the refs of the draft are local to one copy of the repository. Taken: O19, a question to the user.
- **`git add --all` sweeps every untracked file that is not ignored into the run's commit**: the 10 GB of existing
  results would go in. Taken as a harm: what is ignored has to be settled when the repository is made.
- **"HEAD when clean" will be rare**: another run's uncommitted record makes the tree changed (seen in the
  two-runs test: the second run's code went under a ref for that reason alone). Taken as a harm; records in
  progress have to be left out of the check.
- **The remake does not use the record's environment package or libraries.** Taken (see above); rebuilding an old
  lock file's libraries (`uv run --locked` in the temporary tree) is not tested.
- **Record commits go to whichever branch is checked out**, and checking out older code hides newer records.
  Taken into the question on where records' commits go.
- **`remove` looks for citations only in the repository's tracked Markdown**; the notes vault is outside it.
  Taken as a harm: the vault's folder has to be searched too.
- **R12 and R18b rest on a judgement by eye**, answered at today's remake cost under the one-model rule; a
  final-evaluation run costs more to make again. Taken as a harm: such runs should be pinned; not asked.
- **R23b and R24 name mechanisms; R3 omits libraries, Python and device.** Taken: the needs behind R23b and R24 are
  in their rows (both are the user's own decisions), and R3 names what the manifest also has to hold.
- **R1's "made again" does not fit a remake that is a new run.** Taken as a definition: a citation of X resolves
  to X's record for good; after a clean, a view of X shows the outputs of the run made again from X and says so.
- **Stale text** on the working rules, R16's note, R18b's reason and a mention of the dropped R20: corrected.
- Other existing tools it named (Hydra, Guild AI, MLflow's file store) are noted in the records, not added.

### Harms and growth, for the leading option (round 2)
- **Lock-in**: the ID's form and the record's file names are cited by remarks, READMEs and the parent decision's
  addresses. One-way. The form was chosen by the user (R24) and tested in the draft.
- **Deleting**: the removal code deleted everything it could reach when given an empty ID in the draft. In the
  project it would act on real results. It needs its checks (a known ID, a run's own folder, no links) and tests
  before any other part is used, or the tool of O18.
- **Hidden coupling**: the human-baseline folder's file names are what the blindness check reads. Sessions keep
  their files and place; they are committed, so that a temporary tree of an old commit has them too.
- **Blindness**: the check moves into the shared training function, which every run and probe passes. A session
  of a layout played in one condition only is a committed file that traces the layout: the list of runs must not
  show it to the user, and the repository must not be published as it is.
- **The layout file is in the repository's history in plain text**, as it is on disk today. Nothing changes for
  the user as long as they do not browse it; any published copy of the repository would reveal the layouts.
- **History**: every run adds a commit for its record, and every run from uncommitted code a ref. After a
  thousand runs the branch has a thousand "run ..." commits between the code commits, unless the records go to a
  branch or repository of their own (a question of this round).
- **Two runs at once**: each has its own folders; both commit a record at the end and may meet at the
  repository's lock. Tested once (both committed). The record is written before the commit is tried, so a failed
  commit loses nothing, and the next run's commit can pick it up.
- **What the repository tracks**: a commit of the working tree takes in every file that is not ignored. The
  existing results (10 GB) and every disposable output must be ignored before the first run, and the human
  sessions must not be.
- **A changed tree for the wrong reason**: another run's record in progress makes the tree look changed, so a
  run's code went under a ref although no code had changed. Records in progress are left out of that check.
- **Citations outside the repository**: the notes vault (`TODO.md`, the research logs) cites runs too; a removal
  that only searches the repository would miss them.
- **Costly runs**: a final-evaluation run takes longer to make again than today's 12 to 103 s; such runs are
  pinned when they are made.
- **A remake after the libraries changed** uses today's libraries unless the old lock file's environment is
  rebuilt, which is not tested; the record says when the lock file differs.
- **A setting that is renamed** makes an old record's settings unreadable by new code; a remake is not affected
  (it runs the old code), views in new code are (R6 ~).
- **Disk**: with no cap, outputs grow by about 140 MB a run at one model and about 1 GB at eight until the user
  says to clean; the sizes are one command away.

## Open questions
Answered in round 2 so far (user, 2026-11-22): what may land on the working branch: "Everything" (the working tree
is committed to the branch before a run and the record after it: O19, with the records on the branch); removing a
record something points at: "Refuse unless forced". On what sits under the record the user asked for an overview
of the advantages and workflow of each of the three (own code on git, DataLad, DVC) before choosing.

The user then asked how DVC interacts with the parent decision (2026-11-22). Answered in chat, in short: DVC's
table and plots show logged scores only, so they cover one of the parent's four questions ("how training went")
and live results, and nothing that is computed for a chosen goal and state; as a second window they work against
the parent's "results and diagnostics together" and "one combined view". For what the viewer needs from the
record, DVC adds steps (listing through its command or git refs, 5 s at 315 runs; a remade output is a new
experiment the address has to be mapped to; a forced repeat under an existing name changes what an address
points at; a killed run has nothing to show). Not verified: DVC's VS Code extension and its plots.

The user's choice of what sits under the record (2026-11-22): "Own code on git." F4 (DataLad), O13 (DVC) and O18
(git-annex as the outputs' store) trail by the user's choice between near-tied options.

Round 2's last answers (user, 2026-11-22): of continuing a run, checking cited IDs and old runs in new views, only
"Old runs in new views" belongs in the first version; the repository is made by the assistant after the user has
seen the ignore list and what the first commit would hold ("Assistant, after a look").

For round 3 (one part only): how a view written later reads an old run's networks after the method's code has
changed (R6). The drafts do not cover it. Known ways: compute in the run's own code in a process of its own
(J4's idea, with the code as a commit); store the networks' functions in a form that needs no project code
(J12, F16: `jax.export`); adapters in new code per old version; or refuse runs whose code differs.

Known gaps: R19b is unverified for every option (the volume test was skipped on the user's word); run time with
the experience is unresolved; a human session's record beyond its file is not drafted.

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
| DataLad 1.8.0 with git-annex runs on Python 3.14; +0.5 s a run; refuses a changed tree, explicit mode leaves changed code out; drop and rerun work; runs at once break | `what-a-run-records.discovery/r2-datalad.md` (hands-on test by a subagent, on tmpfs, dummy workload) | 2026-11-22 | tested once, not by me; real-disk timings and real runs not tested |
| DVC 3.67.1 with DVCLive runs on Python 3.14; +1 to 1.7 s; captures tracked edits, not untracked files; a killed run leaves no record; runs at once lost both | `what-a-run-records.discovery/r2-dvc.md` (hands-on test by a subagent, on tmpfs, dummy workload) | 2026-11-22 | tested once, not by me |
| A run's code as a commit, also for uncommitted and in-memory-patched code; a remake at the old commit after the code changed; killed run; tiers; pin, clean, remove | the second draft's logs (`run-record-spike2/t1.log`, `t2.log`, `t5.log`; `run-record-spike3/t3.log`, `t4.log`) and the drive scripts' output | 2026-11-22 | measured, one run each |
| A `Learner` holds all a run needs to go on; only networks are kept today | `gcsl.py:110-118`, `440-441`; confirmed by the draft's continued run | 2026-11-22 | read and measured |
| The blindness check reads the human-baseline folder's file names | `gcsl.py:553-559`; `play.py`, `review.py` by generator J | 2026-11-22 | the first read here, the others by the generator only |

## Round checklist
Round 3 (one part: R6).

Checklist:
- [x] Log (first round): n/a: round 3
- [x] Problem (first round): n/a: round 3; unchanged
- [x] Scope: unchanged; this round covers one part (R6)
- [x] Requirements: R26, R27 (the user's round-2 choices as rows, with the questions as asked); R6 reworded to the need
- [x] Replaced requirements: none replaced; R6's wording extended in place, its first wording kept in the row
- [x] Written requirements: n/a: none new from documents
- [x] Deciding unverified requirements: R6's shape asked this round; R21 met by R27; R19b a known gap; R16's amount not asked (cost about 0.6 s a run, the experience unresolved)
- [x] Options: O20 to O23 for R6
- [x] Searches: no web search by the assistant; the bias check looked up JAX's export documentation
- [x] Deciding claims: the six-month guarantee confirmed by both checks (documentation and installed source); the test's numbers measured once
- [x] Matrix: rebuilt, corrected after the checks
- [x] Rejection records: for O20, O22, O23; F4, O13, O18 updated
- [x] Harms: for O21, in its section
- [x] Reversibility: the calls' names and inputs are one-way: tested in a draft and said in the report
- [x] Draft and stress test: export_calls.py and use_calls.py on a recorded run; paths in the log
- [x] Bias check: findings in the log and the report
- [x] Rejection check: eight points, verdicts corrected
- [x] Ranking change: none for the whole; O21 leads the R6 part by tie-breaks
- [x] Report: in the chat
- [x] Questions: R6's shape: a question the run did not store; how long a run stays viewable without a remake
- [x] Pushback: n/a: no worse option picked


## Rounds
- Problem formulation (2026-11-22): confirmed on the second write-back. No ranking yet.
- Round 1 (2026-11-22): first ranking. O11 (an own record written by the shared loop, large outputs apart and remade) leads; O12 (the same on a tracker) is a near-tie; the naming rule (J2) and one journal (G7) are level variants; F4 and O13 (version-control tools) are behind on R20, which is not checked. Almost every priority is still claimed, so the ranking is provisional.
- After round 1's answers (2026-11-22): own plain files chosen, so the tracker form (O12) is out; the ID is a date and time with a free label, so hash names and running numbers are out as its form; version-control tools (F4, O13) are behind on R23 (the record must work without a repository) instead of R20. O11 leads; its untested cells on the musts R3, R12 and R18b are round 2's work.
- The user's correction after round 1 (2026-11-22): "git will be added before implementation" (R23b replaces R23). The version-control tools (F4, O13) are back as unverified contenders for round 2; O11 still leads on what was tested.
- Round 2 (2026-11-22): with git first and automatic commits allowed, DataLad (F4) and DVC experiments (O13) were tested and are near-ties with O11 once the code is committed or staged before every run; O11 leads on tie-breaks only (it is the whole design in one tested draft; each tool replaces about a quarter of it and brings behaviour to work around). O19 (commit the working tree to the branch before each run) is a level variant of how the code gets its commit.
- Round 2's answers (2026-11-22): everything goes on the working branch (the working tree committed before a run, the record after it: O19); removing a record something points at is refused unless forced; own code on git under the record. O11 with O19 is the user's choice; no new requirement.
- Round 3 (2026-11-22): the part for R6 only. Storing what a run's networks can be asked as functions that need no project code (O21) leads over a process in the run's own code (O20) by tie-breaks; no change to the whole.
- Round 3's answers (2026-11-22): each network's plain forward pass is stored beside the declared calls; a remake after six months or after a clean is enough. No new requirement, no ranking change.

## Decision
Draft (2026-11-22; not reviewed by the user yet)

**The choice.** Every run made through the shared training function leaves a record written by own code on plain
git (O11 with O19 and O21):
1. **ID**: date, time and a free label, such as `20261122-193120-model-speed`; the label defaults to the script's
   name; a second run with the same label in the same second gets a number.
2. **Code**: before the run, the whole working tree is committed to the working branch; the record names that
   commit.
3. **Record** (in the repository, a folder per run): what made the run (kind, method, layout number, settings,
   seed, the command, the commit, the lock file's hash, Python and device, the parent run if it is a remake),
   written before the first step; a line of scores per evaluation as it happens; an end note with the outputs'
   sizes; a pin. It is committed to the working branch when the run ends.
4. **Two disposable tiers outside the repository**, under the same ID: what the agent experienced, per evaluation
   segment; and the large outputs: the networks per evaluation, the learner's state (replaced during the run,
   written at the end), and what the networks can be asked as stored functions that need no project code (the
   calls each method declares, and each network's plain forward pass).
5. **Commands**: list (by scanning the records), remake (the record's command in a temporary tree at the record's
   commit, as a new run that names its parent), pin, clean a tier (unpinned runs only, on the user's word),
   remove a record (refused while a run or a document points at it, unless forced).
6. **Unplayed layouts** are refused inside the shared training function, so probes are covered.
7. **A human baseline session**'s record is its session file, committed where it is.

**Why**, each on a requirement the user confirmed:
- R3 (must: a run tells what made it): the commit holds every file, also untracked ones and a probe's patching
  script. Tested with the code under a ref (T3, T4); the commit on the branch is the same commit made plainly.
- R12 (must: it can be made again): a remake ran the first run's commit after the code had changed (T2), and a
  probe after its script was deleted (T4). "The same conclusions" is judged by the user by eye.
- R18b (must: large outputs can be deleted at any time): cleaning a tier leaves the record; a remake brings the
  outputs back (T6, T2).
- R8 (must: blindness): the check moves to where every run passes.
- R24, R25, R26, R27 (the user's choices): the ID's form, plain files, own code on git, everything on the working
  branch.
- R1, R2, R11 (shoulds): an ID given once, a new folder per run, a list by scanning (1,000 records in 0.06 s).
- R4, R5b, R22 (shoulds): score lines as they happen; the experience in a tier of its own that outlives the
  networks.
- R6 (should, first version): stored functions gave the run's own answers to new code with no project code
  (round 3's test), with the raw functions for views not thought of yet.
- R17b, R15b (shoulds): pin, clean on the user's word, remove with a refusal when something points at the run.
- R21 (should, claimed): the records are in version control.

**Rejected**, and why:
- Doing nothing (O4), and the smaller forms without a way to make outputs again (O1, O5, O6, J1 alone): not
  applicable on the musts R3 or R18b.
- DataLad (F4) and DVC experiments (O13): near-ties in hands-on tests once the code is committed or staged before
  every run. Not taken by the user's choice (R26). Each replaces about a quarter of the design and brings
  behaviour to work around; the rest would be own code either way.
- A tracker as the record's store (F2, O12): not taken by the user's choice (R25); O12 was a near-tie.
- git-annex as the outputs' store under the own record (O18): level, little gain.
- Hash names and running numbers as the ID (J2, G1, H2, G6): not taken by the user's choice (R24).
- The run's code under a ref instead of on the branch (the second draft, J3): not taken by the user's choice (R27).
- For R6: a process in the run's own code (O20) is level on the requirements and behind by tie-breaks; it is the
  fallback. Readers per old version (O22) trail on upkeep (R10). Refusing runs of other code (O23) fails R6.
- Exact repeats (F7): not needed; the user asked for the same conclusions.
- One journal for all runs (G7): level; the drafts used and tested a folder per run.
- Later layers, not part of this decision: studies and rendered tables (J8), schedules for reported numbers (H6),
  seed groups (F8), a certified list (H2).

**Known gaps** (none blocks the first step; each is checked or measured while building):
- R19b: that disposable outputs stay out of the snapshots is not verified (the test was skipped on the user's
  word). Outputs sit outside the repository and are not versioned.
- Run time with the experience recorded is not resolved (52.9 s against 42 to 49 s); to measure with the
  experience as a setting.
- Not run in a draft: the commit of everything before a run; a human session's record; continuing from a killed
  run's state; a remake with an old lock file's libraries; pointing the environment package at the temporary tree
  inside a remake (that it can take precedence was checked apart); the raw functions; stored functions for
  methods other than the model one, and for the model's step.
- Two runs at once were tested once.
- A change of the environment's code under an old run's stored functions is not covered.
- Removal looks for citations in the repository's Markdown; the notes vault has to be searched too.
- The removal code deleted the draft's whole store once: its checks and tests come before anything else uses it.
- Later, by the user's word: continuing a run (R13), a check that every cited ID exists (R14).

**Open child decisions**: none. The parent decision ([inspecting-experiment-results.md](inspecting-experiment-results.md))
resumes its round 2 on this one.

**Plan** (large steps, committed by the assistant, as the project's rules now allow):
1. The check for unplayed layouts moves into the shared training function, with a test.
2. The repository: the assistant prepares the ignore list (existing results and all disposable outputs out, human
   sessions in) and shows what the first commit would hold; after the user has seen it, the repository is made.
3. The record: the removal and cleaning code with its tests first; then the ID, the commit before a run, the
   record and its commit, the two tiers, the stored functions (the library `flatbuffers` is added), and the
   commands; every method declares its calls.
4. The figure, the videos and the value-function script read runs from the records.
5. Human sessions: committed where they are; the list leaves out layouts not yet played in both conditions.
6. Measure the run time with and without the experience (several runs each) and set the default.
7. Once it is in use: ask the user what using it showed, then amend this decision or reopen a round.

Decision checklist:
- [x] Stop condition: no new requirements, no ranking change, nothing deciding left unverified (round 3; R19b and R16's amount are known gaps, said above)
- [ ] Why and Rejected: each on a requirement the user confirmed; confirmed by the user
- [x] Known gaps and open child decisions: listed in *Decision*
- [ ] Documentation: updated where the rule takes effect; overstated requirements corrected; commit message proposed
- [ ] Out of scope: noted where open work is kept
- [x] Overview: choice, pros and cons, rejected, gaps, plan, files (given in the chat on 2026-11-22)
- [ ] Review: in open chat; nothing implemented before it

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
| R1 | A run can be referred to in a way that stays valid when it is moved or made again | Remarks, README numbers and views that point at a run would silently point at something else | inferred (parent R15, R9; bias check round 1); supported by "Use it as evidence" (user, 2026-11-22) | must (claimed) | no |
| R11 | A run can be found again without knowing where it is stored | "Could not find a run" has cost the user something | user, 2026-11-22; parent R9 (must, verified) | must (claimed) | need yes, priority no |
| R2 | Making a run again does not destroy an earlier one | The earlier result can no longer be examined or compared, and a number cited from it loses its run. The user did not choose "A result was lost" as something that cost them | inferred (overwriting read in `gcsl.py:600`); follows from "Make it again" with "Use it as evidence" | should (claimed) | no |
| R3 | A run tells what made it: method, settings, seed and code | "Unclear what made it" has cost the user something; two runs cannot be compared with confidence | user, 2026-11-22; parent R20 | must (claimed) | need yes, priority no |
| R12 | A run's lasting record holds enough to make the run again with approximately the same results: the same conclusions, the numbers may differ | The large outputs could not be made again once they are gone; a result could not be checked or built on | user, 2026-11-22 ("Make it again"; "enough information to be able to rerun them with approximately the same results"; "The same conclusions") | must (claimed) | need and exactness yes, priority no |
| R18 | A run's large outputs (such as its stored networks) can be deleted at any time without losing anything that lasts: they are made again from the lasting record. Pictures, remarks and continued runs may rest on outputs that were made again | "Deleting would be risky" otherwise; the project has lost results to a delete before (2026-11-21) | user, 2026-11-22 ("Acceptable everywhere") | must (claimed) | need yes, priority no |
| R19 | Large outputs stay out of version control, snapshots and backups; the lasting record is small enough to be in them | "They would get versioned or backed up" | user, 2026-11-22 | should (claimed) | need yes, priority no |
| R13 | A stored run can be trained further from where it stopped | The user expects to continue runs | user, 2026-11-22 ("Continue it") | should (claimed) | need yes, priority no |
| R14 | A reported number can be traced to the run that gave it | A README or report number cannot be checked | user, 2026-11-22 ("Use it as evidence") | should (claimed) | need yes, priority no |
| R15 | Stored runs respect a limit on disk space | The user named it as a limit; amount not set | user, 2026-11-22 | should (claimed) | need yes, amount no |
| R16 | Recording does not slow a run beyond a limit | The user named it as a limit; amount not set. For live results the user accepted "Slower, not broken" (parent R13) | user, 2026-11-22 | should (claimed) | need yes, amount no |
| R17 | Runs worth keeping can be told apart from throwaway ones, and only the first are kept for long | "Depends on the run"; keeping everything meets the disk limit sooner | user, 2026-11-22 | should (claimed) | need yes, who decides no |
| R4 | A run's results can be seen while it trains | The user waits for the end of a run to see anything | parent R13 (user, 2026-11-22: "I'd also like to be able to see run results as they come in"; "Slower, not broken") | should | carried over |
| R5 | What the agent experienced during a run can be examined afterwards | "What data it saw" cannot be answered | parent R4b (user, 2026-11-22) | should | carried over |
| R6 | A run's learned networks stay usable after the method's code changes | Views computed from an older run are wrong or fail | inferred (bias check round 1) | should (claimed) | no |
| R7 | Any method's run in the maze fits, and so do probes and human baseline sessions; a run in a later environment is not blocked | The record is redone per method or per kind of run | user, 2026-11-22 (the three kinds chosen); parent R1 (must, verified), R2 (should) | must (methods), should (probes, sessions, later environment) (claimed) | kinds yes, priorities no |
| R8 | The blindness rule holds: nothing from a layout the user has not played is recorded in a form the user is shown, and such runs stay refused | Seeing a layout cannot be undone | project `CLAUDE.md` (user, 2026-11-20, 2026-11-21) | must | yes |
| R9 | Layouts are named by number only | The user asked for it | project `CLAUDE.md` (user, 2026-11-20) | must | yes |
| R10 | Low upkeep as methods and experiments change | The user values it; a record that every new method must be taught costs every time | parent R16 (user, 2026-11-22) | should | carried over |
| R20 | The assistant and its tools do not write to version-control history; the user reviews and commits every change | The user's standing rule for every repository; it would apply here from the day the project becomes one. Whether it also covers records a tool commits per run was not asked | user's global instructions ("Never commit, amend, stash, push or otherwise write to git history") | must (claimed) | no |
| W1 | Existing runs get such a record | "Old runs don't matter" | user, 2026-11-22 (parent W3) | won't | yes |
| W2 | Experiments outside the maze (attention-regression) get such a record | Not chosen when asked what counts as a run. Would come back if those experiments are taken up again | user, 2026-11-22 | won't | to be confirmed with the problem |

## Options
This decision is made of parts (see the map in *Evaluation*). An option that covers one part is marked
"part"; the leading option is a composition of parts. The field's documented route is F2 (an experiment
tracker); for stored states the JAX documentation points to Orbax (named in J5's report).

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O4 | Do nothing: runs stay as they are | No work; every method fits | Everything the problem names stays: no name beyond the path, a repeat replaces the run, no method or code in the file, nothing until the end, nothing to continue from; checkpoint files are in the snapshots today | cheap | trailing (R3, R11, and R1, R2, R4, R5, R13) |
| O5 | Change the process only: every run goes to a dated folder of its own through `--results`, and the assistant keeps a run list in the notes (what was run, with which settings, why) | No code; works today | Rests on the assistant remembering each time; nothing while training, nothing to continue from, no experience; the code that made a run is still unrecorded | cheap | trailing (R4, R5, R13; R3 by hand only) |
| O6 | The simplest that could work (J10): one line per run appended to a run list at the project root (ID, time, command line, settings, source hashes, final scores, where its files are), and the ID in the result files' names so a repeat replaces nothing | About 20 lines; findable and citable at once | Nothing while training, nothing to continue from, no experience, large outputs stay where they are | one-way for the ID form; cheap otherwise | trailing (R4, R5, R13, R18); it is the leading option's index line, written first |
| O3 | The user's proposal (2026-11-22): large run outputs live in a cache folder, apart from a record small enough to keep, and are recreated by rerunning | Deleting is safe by construction; the record stays small | A folder under the home folder is still inside the snapshots (checked: `~/.cache` is part of the snapshotted volume); keeping it out needs a volume of its own or a place outside `/home` | cheap (a path) | part of the leading option (where large outputs sit) |
| O2 | Put the project under version control (a consequence of "Not deliberate", not the user's proposal) | The code of a clean tree has a name; old code can be fetched again; deletes become recoverable for what is tracked | By the user's workflow the assistant's changes are uncommitted while it tests them, so most runs are made from a tree no commit describes: a commit alone does not say what made a run. Ends two working rules of the project `CLAUDE.md` (implement in full; delete caution) by their own end conditions | costly (habits and rules change) | part (code identity): not a prerequisite of this decision; recorded when present, next to J4 |
| O1 | The list from the parent's bias check. Merged into O11: O11 is this list worked out (name, method, a write at every evaluation, the data the agent saw, the code that made it, an index), and it shares O11's cells |  |  |  | merged into O11 |
| O11 | The composition drafted in round 1 (the assistant's): the shared training path opens a record before the first step. The record is a small folder of plain files under an ID given once (manifest: kind, method, settings, seed, parent run, hashes of every loaded source file with one copy per distinct file, the layout file by hash only, the lock file's hash, and the commit when a repository exists; a line per evaluation as it happens; an end note). Large outputs (networks per evaluation, the whole learner state at the end, by leaf path) sit under the same ID in a separate place outside snapshots and version control, listed in the record also when absent, and are made again by a remake, which is a new run naming its parent. All records are kept; only large outputs are removed, oldest first, unless pinned. An index of runs is rebuilt by scanning the records. What the agent experienced is handed out of the compiled loop per evaluation segment and kept with the large outputs. A human session's record is the session file itself | Meets every part of the problem with the standard library; one place to change (the shared loop) covers every method and probe; nothing depends on version control or a tool; measured in the draft (see *Evaluation*) | About 150 to 250 lines of own code the assistant keeps; views of an old run in the old run's code need a process per code version (R6 ~); a reported number is tied to a run by citing its ID, by convention (R14 ~) | one-way for the ID form and the record's files (runs and remarks cite them); cheap for where large outputs sit and for the keeping rule | leading |
| O7 | Keeping by an act (J15, F19): large outputs expire by age or size unless a run is pinned with a reason; human sessions are pinned from the start | Nobody has to judge every run; the disk stays bounded | A pin is a habit; an unpinned run someone wanted costs a remake | cheap | part of the leading option (keeping) |
| O8 | Kept because cited (J16): a run's large outputs stay as long as a README, a remark or a study names its ID | No act needed; follows the evidence | Every citing document has to be scanned; a run under study but not yet cited is removed | cheap | part, later: trailing (R10) against O7; fits once reported numbers cite IDs |
| O9 | Remake as a check (J14): making a run again compares the new curves with the recorded ones and says whether the conclusion held | Turns "the same conclusions" into something a remake reports | Needs a stated conclusion or a tolerance per run; one model's seed spread is wide | cheap | part, later: the draft prints the comparison; what counts as the same conclusion is an open question |
| O10 | Thinning (J19, F15): keep every k-th network snapshot, or the first, last and best; the rest are made again | Cuts the largest files several times over | A view of a thinned moment costs a remake | cheap | part, later: a setting of the leading option if the disk limit asks for it |
| F1 | Plain self-describing run directory, append-only logs, index by scanning: no tracking tool; a fixed layout is | The field's commonest practice for one researcher; no tool; a second process can follow the appended lines | Own schema to keep; code identity by commit presupposes version control; no experience, no state to continue from | one-way for the layout | part of the leading option (the record's layout and live lines); alone trailing (R5, R13) |
| F2 | Local tracker with a database store (MLflow, Trackio or Aim): an existing tracking library is the record, and | The field's documented route: ID, search, live curves and a comparison page come ready | The lasting record is the tool's database; code identity is a commit only; continuing and remaking are not its functions; probes and human sessions fit as attachments; upgrades migrate the store | costly (the record lives in the tool's store) | trailing (R13, R18, R19, R3, R6) |
| F3 | Parameter-addressed workspace (signac): the run's ID is the hash of its settings, so a run is found by | A run is found by describing it; no duplicates | The same settings resolve to the same folder, so a repeat needs a counter; the ID changes when a setting is added; no code identity, no live lines | one-way for the ID rule | trailing (R1, R2, R4) |
| F4 | The run is a version-control commit with a rerun record (DataLad run or DVC experiments): history is the | Exactly the user's proposal as an existing tool: large outputs are dropped and made again from a recorded command | A commit per run, made by the tool; a clean tree or declared inputs per run, while probes run from changed code; a rerun never matches the recorded content hash; seconds of hashing per run (not measured); nothing while training | costly (history and layout belong to the tool) | trailing (R20, R4, R3); would lead if tool-made commits are wanted and version control comes first |
| F5 | Outputs and reported numbers as cached build targets (Snakemake, redun, joblib.Memory, showyourwork): nothing | Deleting loses nothing; a reported number is a target with its runs behind it | A cache key is not a name to cite; a hit stands in for a run; code hashing is fragile; nothing while training; continuing is outside the model | costly | trailing (R1, R4, R13); its numbers-as-targets idea returns in J8 |
| F6 | The experience log is the primary record, in an offline-RL dataset standard (Minari or RLDS): what the agent | Agent and human sessions become the same kind of object in a published format | The format's collector steps a Python environment one transition at a time, which a compiled loop does not do; settings, live lines and continuing are outside it | costly | trailing as the record (R12, R3, R4, R13); its idea is J6 |
| F7 | Bit-exact deterministic replay: make training exactly repeatable, and the record shrinks to seed, settings, | The record shrinks to kilobytes and a remake is the same bytes | A speed cost or a move to the CPU (not measured); any change of code, library or driver ends the exactness; looking at an old run costs a full rerun | costly | trailing (R6, R16 unknown): its gain, exact repeats, goes beyond R12 as the user set it ("the same conclusions") |
| F8 | The experiment, not the run, is the lasting unit: seed groups with interval statistics (rliable practice): | "The same conclusions" is defined where it is true, over several seeds; runs outside an experiment are throwaway without a decision | Several seeds per result, against the current rule of one model per run; human sessions and probes do not fit | costly (a habit) | part, later: trailing as the record (R7); kept as the way to check a remake once several seeds are allowed |
| H1 | The registrar's accession register (museums): a run's identity is a number given once from one register, marked | A number given once that means nothing and is marked on everything; a status that outlives the outputs | Opaque numbers need a finding aid; one place issues them | one-way for the ID form | part of the leading option (an ID given once, a status in the record) |
| H2 | Run number, data tiers and the good-run list (particle-physics experiments): runs are numbered, recorded in | A run number is short enough to say; a list says which runs may be cited | A verdict after every run and a list per report: two roles for one person and one assistant | one-way for the ID form | part: the run number is one of the ID forms to choose from (open question); the certified list is later, with J8 |
| H3 | The scoresheet and the sealed move (chess, baseball scorebooks): the lasting record is the sequence of moves, | Written as it happens; continuing from a fixed, sealed state | Megabytes per run in the lasting record | one-way for the format | part: as J6 and J5 |
| H4 | Certificate, instructions and iteration report (conceptual art and time-based media conservation): the lasting | A remake is a new iteration with its own report, never a replacement; what must stay the same is written down | A statement of essentials per experiment needs the user's judgement | cheap | part: "a remake is a new run" is adopted; the statement of essentials is open (with O9) |
| H5 | Master record, executed batch record, quarantine and release (pharmaceutical manufacture): each run fills in a | A record filled in while the run goes; a release or reject decision that sets how long it is kept | A decision after every run, by a second role | cheap | part: filling in as it goes and an end status are adopted; the release step is trailing (R10) against O7 |
| H6 | The auditor's working papers (accounting and audit): every reported number has a numbered paper that lists the | Numbers can be followed to runs and runs to the numbers resting on them | A schedule per reported number, and the discipline never to bypass it | cheap | part, later: as J8 |
| H7 | Allocation concealment and the unblinded pharmacist (clinical trials): every run's record is split when it is | A record is split into an open and a sealed part at creation, and opening is logged | Two parts for every record while training on unplayed layouts is refused anyway | cheap | part: adopted in a light form (the index does not list records of a layout not yet played in both conditions, which today can only be human sessions) |
| H8 | Evaporating trails and tagged memories (ant colonies, sleep): nobody decides which runs to keep; every run is | Nobody decides what to keep: what is used stays | Every reader has to record its use; a wrong fade is noticed late | cheap | part: trailing (R10) against O7; "oldest unused first" is how unpinned large outputs go |
| G1 | Derivation and store with garbage-collector roots (functional package management): a run's name is the hash of the small recipe that makes it, its outputs live  | As J2, and a named root is the only thing that keeps outputs alive: keeping is explicit and cheap to undo | As J2 | one-way for the ID rule | runner-up with J2; its roots are the leading option's pins |
| G2 | Suite ID, rolling restart dumps and a statistical "same climate" test (climate modelling): a registry issues each experiment a short opaque ID at creation, the  | Short IDs from a registry; continuing from periodic dumps; a statistical test of "made again" | Extra runs to form the accepted ensemble; a registry to keep | one-way for the ID form | part: dumps as J5, the test as O9 and F8, later |
| G3 | Master record, executed batch record and disposition (pharmaceutical manufacturing): each run copies the method's approved master in full, is filled in while it | As H5, and a small reserve sample stays when the bulk goes | As H5 | cheap | part: as H5; the reserve sample is the record's curves and end note |
| G4 | Accession register, bag with fetch list, and resolver (archives and libraries): a register issues a number that is never reused, the run is a self-describing pa | "Absent but obtainable" is a valid, listed state of a file; references go through one table | Hashing 90 to 330 MB of networks per run (seconds, estimated) | one-way for the manifest | part of the leading option: the record lists its large outputs also when absent; the packaging tool is not needed (a tie-break, no requirement) |
| G5 | Replay file: header, input log, checksums and anchor state (game engineering): the lasting record is the stream of what went in, not the state that came out, in | One format for the agent's experience and the human's input; a stored state to continue from | Replay in place of stored outputs needs exact repeatability, which is not required | one-way for the format | part: the shared shape for agent and human is adopted through J6; replay is not (see F7) |
| G6 | Run number, run registry, global tag, good-run list and data tiers (particle physics): runs are numbered by a counter and described in one queryable registry, w | As H2, with what a range of runs depended on named once | As H2; someone has to cut a new tag when dependencies change | one-way for the ID form | part: as H2 |
| G7 | One append-only journal with vouchers and reversing entries (bookkeeping and audit): everything that happens to any run is a numbered line in a single text jour | One text file holds everything in order; every index is a report from it; a number cites an entry | One file every run and reader depends on; a damaged or hand-edited journal loses every record at once | one-way for the entry format | near-tie with the leading option's folder per run on the requirements; set behind it by a tie-break no requirement covers (one file as the single point of loss, in a project that lost a results folder to a delete) |
| G8 | Run records in the version history with droppable content (research data management in neuroimaging): an existing tool, DataLad on git-annex, executes each run, |  |  |  | merged into F4: the same tool (DataLad) and the same cells |
| J1 | The shared loop writes the record: one run folder per call of `train`, opened before the first step. | The record is opened inside the shared training function, so probes, which skip the command-line entry, get one unchanged; a running or interrupted run can be looked at | Networks stay in the run's folder; no state to continue from, no keeping rule, no index; the blindness check is not in that function today | one-way for the layout | part of the leading option (where and when the record is written); alone trailing (R13, R17, R18) |
| J2 | Recipe-addressed runs: the ID is a hash of what makes the run, and the outputs are a cache. | The same recipe has the same name everywhere; a repeat is realisation n+1 and can never replace; found by describing | The name changes with every edit of a loaded source file and with every added setting, so one line of work has many names; a citation needs the name and the realisation number | one-way for the ID rule | runner-up: O11 with this naming rule in place of an ID given once |
| J3 | Git as the ledger: the code's identity is a commit, and the run records it. | Old code can be fetched by commit; a run of a clean tree is fully named | Probes and the assistant's untested changes run from uncommitted trees; the variants that keep a dirty tree reachable write objects and refs | costly | part (code identity): adopted read-only (commit and whether the tree was clean, when a repository exists), next to J4 |
| J4 | The run capsule: every run carries the sources it loaded, as probes already carry their script. | What made a run is in the run, with or without version control; old networks can be read by the code that wrote them; the layout file never leaves its place | Views that mix an old and a new run need a process per code version; about 80 lines | one-way (stored copies) | part of the leading option (code identity) |
| J5 | The whole `Learner` as the one stored state: restart file, networks and buffer in a single generic dump. | One generic file continues a run and holds every network without the method naming them; a new method costs nothing | A renamed field makes old states fail to load (loudly); continuing past the planned end needs a rule for the evaluation steps | one-way for the stored state's naming; cheap otherwise | part of the leading option (continuing) |
| J6 | The experience stream comes out of the shared loop, in the shape the human session already has. | The only exact account of what an agent saw; one change serves every method; the same shape as a human session | A change inside the compiled loop; megabytes per run; positions trace a layout's free space | cheap (a later addition is possible) | part of the leading option (experience); whether it is lasting or disposable is an open question |
| J7 | An existing tracker behind the one loop. |  |  |  | merged into F2: the same tools seen from the one loop; the same cells |
| J8 | Study files: the record is written before the run, and runs are targets made when missing. | A reported table has a recorded derivation; being in a study decides what is kept | A study is written before anything runs, which try-outs are not; a runner and a renderer to keep | costly (a habit) | part, later: a layer on top of the leading option for comparisons and README tables |

## Matrix
✓ meets, ~ partly, ✗ fails, ? unknown, · the option does not address it (a part). Second row: the
priority (with ? when it is claimed and not checked) and whether it is verified ("need": the user named
the need, its priority is not checked). Assumptions per column: R8 assumes the blindness check sits in
the path every run takes; R15 and R16 are marked from the draft's measurements where one exists.

| Option | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9 | R10 | R11 | R12 | R13 | R14 | R15 | R16 | R17 | R18 | R19 | R20 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *priority, verified* | must?, no | should?, no | must?, need | should, yes | should, yes | should?, no | must, yes | must, yes | must, yes | should, yes | must?, need | must?, need | should?, need | should?, need | should?, need | should?, need | should?, need | must?, need | should?, need | must?, no | |
| O4 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ~ | ✗ | ✗ | ~ | ✓ | ✗ | ~ | ✗ | ✓ | ✗ R1 ✗ R2 ✗ R3 ✗ R4 ✗ R5 ✗ R6 ✗ R11 ~ R12 ✗ R13 ✗ R14 ~ R15 ✗ R17 ~ R18 ✗ R19 |
| O5 | ~ | ~ | ~ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ~ | ~ | ~ | ✗ | ~ | ~ | ✓ | ~ | ~ | ✗ | ✓ | ~ R1 ~ R2 ~ R3 ✗ R4 ✗ R5 ✗ R6 ~ R10 ~ R11 ~ R12 ✗ R13 ~ R14 ~ R15 ~ R17 ~ R18 ✗ R19 |
| O6 | ✓ | ✓ | ~ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✗ | ~ | ~ | ✓ | ✗ | ~ | ✗ | ✓ | ~ R3 ✗ R4 ✗ R5 ✗ R6 ~ R12 ✗ R13 ~ R14 ~ R15 ✗ R17 ~ R18 ✗ R19 |
| O3 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | ~ | ✓ | ~ R19 |
| O2 | · | · | ~ | · | · | ✓ | · | · | · | ~ | · | ~ | · | · | · | · | · | · | · | ✓ | ~ R3 ~ R10 ~ R12 |
| O11 | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ~ R6 ~ R10 ~ R14 ~ R16 |
| O7 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | · | ✓ | · | ✓ | · | · | · | ~ R10 |
| O8 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | ~ | ✓ | · | ✓ | · | · | · | ~ R10 ~ R14 |
| O9 | · | · | · | · | · | · | · | · | · | ~ | · | ✓ | · | · | · | · | · | · | · | · | ~ R10 |
| O10 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ✓ | · | · | ✓ | · | · |  |
| F1 | ✓ | ✓ | ✓ | ✓ | · | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ R6 ~ R10 ~ R13 ~ R14 ~ R17 |
| F2 | ✓ | ✓ | ~ | ✓ | ~ | ✗ | ~ | ✓ | ✓ | ~ | ✓ | ~ | ✗ | ~ | ~ | ? | ~ | ~ | ~ | ✓ | ~ R3 ~ R5 ✗ R6 ~ R7 ~ R10 ~ R12 ✗ R13 ~ R14 ~ R15 ? R16 ~ R17 ~ R18 ~ R19 |
| F3 | ~ | ~ | ~ | ✗ | · | · | ~ | ✓ | ✓ | ~ | ✓ | ~ | · | ~ | · | · | · | · | · | ✓ | ~ R1 ~ R2 ~ R3 ✗ R4 ~ R7 ~ R10 ~ R12 ~ R14 |
| F4 | ~ | ✓ | ~ | ✗ | ~ | ✓ | ~ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ✓ | ✓ | ? | ~ | ✓ | ✓ | ✗ | ~ R1 ~ R3 ✗ R4 ~ R5 ~ R7 ~ R10 ~ R11 ~ R13 ? R16 ~ R17 ✗ R20 |
| F5 | ✗ | ~ | ✓ | ✗ | · | · | ~ | ✓ | ✓ | ~ | ~ | ✓ | ✗ | ✓ | ✓ | · | ✓ | ✓ | ✓ | ✓ | ✗ R1 ~ R2 ✗ R4 ~ R7 ~ R10 ~ R11 ✗ R13 |
| F6 | · | · | ~ | · | ✓ | · | ~ | ~ | · | ~ | · | ✗ | · | · | ~ | · | · | · | · | · | ~ R3 ~ R7 ~ R8 ~ R10 ✗ R12 ~ R15 |
| F7 | · | · | ✓ | · | ~ | ✗ | · | · | · | ~ | · | ✓ | ~ | · | · | ? | · | ✓ | · | · | ~ R5 ✗ R6 ~ R10 ~ R13 ? R16 |
| F8 | ~ | ✓ | · | · | · | · | ~ | · | · | ~ | · | ✓ | · | ✓ | ~ | · | ✓ | · | · | · | ~ R1 ~ R7 ~ R10 ~ R15 |
| H1 | ✓ | ✓ | · | · | · | · | · | · | · | ~ | ~ | · | · | · | · | · | ~ | · | · | · | ~ R10 ~ R11 ~ R17 |
| H2 | ✓ | · | · | · | · | · | · | · | · | ~ | ✓ | · | · | ✓ | · | · | ✓ | · | · | · | ~ R10 |
| H3 | · | · | · | ✓ | ✓ | · | · | · | · | · | · | · | ✓ | · | ~ | · | · | · | ~ | · | ~ R15 ~ R19 |
| H4 | · | ✓ | · | · | · | · | · | · | · | ~ | · | ✓ | · | · | · | · | · | · | · | · | ~ R10 |
| H5 | · | ✓ | ✓ | ✓ | · | · | · | · | · | ~ | · | · | · | · | · | · | ✓ | · | · | · | ~ R10 |
| H6 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | ✓ | · | · | · | · | · | · | ~ R10 |
| H7 | · | · | · | · | · | · | · | ✓ | · | ~ | · | · | · | · | · | · | · | · | · | · | ~ R10 |
| H8 | · | · | · | · | · | · | · | · | · | ~ | · | · | · | · | ✓ | · | ✓ | · | · | · | ~ R10 |
| G1 | ~ | ✓ | ✓ | · | · | · | ~ | ✓ | ✓ | ~ | ✓ | ✓ | · | · | ✓ | · | ✓ | ✓ | ✓ | ✓ | ~ R1 ~ R7 ~ R10 |
| G2 | ✓ | · | · | · | · | · | · | · | · | ~ | · | ✓ | ✓ | · | ~ | · | · | · | · | · | ~ R10 ~ R15 |
| G3 | · | ✓ | ✓ | ✓ | · | · | · | · | · | ~ | · | · | · | · | · | · | ✓ | · | · | · | ~ R10 |
| G4 | ✓ | ✓ | · | · | · | · | · | · | · | ~ | ~ | · | · | · | · | ~ | · | ✓ | · | · | ~ R10 ~ R11 ~ R16 |
| G5 | · | · | · | · | ✓ | · | ✓ | · | · | · | · | ~ | ~ | · | ~ | · | · | · | · | · | ~ R12 ~ R13 ~ R15 |
| G6 | ✓ | · | ~ | · | · | · | · | · | · | ~ | ✓ | · | · | ✓ | · | · | ✓ | · | · | · | ~ R3 ~ R10 |
| G7 | ✓ | ✓ | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ~ | ✓ | · | · | ✓ | · | · | · | · | ✓ | ✓ | ~ R10 |
| J1 | ✓ | ✓ | ~ | ✓ | · | · | ✓ | ~ | ✓ | ~ | ~ | ~ | ✗ | ~ | · | · | ✗ | ~ | ~ | ✓ | ~ R3 ~ R8 ~ R10 ~ R11 ~ R12 ✗ R13 ~ R14 ✗ R17 ~ R18 ~ R19 |
| J2 | ~ | ✓ | ✓ | · | · | · | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | · | ~ | ✓ | · | · | ✓ | ✓ | ✓ | ~ R1 ~ R10 ~ R14 |
| J3 | · | · | ✓ | · | · | ✓ | · | · | · | ~ | · | ✓ | · | · | · | · | · | · | · | ~ | ~ R10 ~ R20 |
| J4 | · | · | ✓ | · | · | ~ | · | ✓ | · | ~ | · | ✓ | · | · | ✓ | · | · | · | · | ✓ | ~ R6 ~ R10 |
| J5 | · | · | · | · | ~ | ~ | ✓ | · | · | ✓ | · | · | ✓ | · | · | · | · | ✓ | · | · | ~ R5 ~ R6 |
| J6 | · | · | · | · | ✓ | · | ✓ | ~ | · | · | · | · | · | · | ~ | ~ | · | · | · | · | ~ R8 ~ R15 ~ R16 |
| J8 | ✓ | ✓ | · | · | · | · | ~ | · | · | ~ | ✓ | ✓ | · | ✓ | · | · | ✓ | · | · | · | ~ R7 ~ R10 |

## Open questions
1. What are the amounts of the disk and run-time limits? Better asked with measured costs per option in hand.
   Decides R15, R16 and what is stored per run (R5, R6).
2. Who or what decides which runs are kept? Decides R17.
3. The priorities of R1, R2, R3, R11 to R14, R18 and R19 (claimed, not checked).
4. Does the data the agent saw (R5) count as a large output that is made again, or as part of the lasting record?
   A rerun sees similar data, not the same.
5. What is the lasting record of a human baseline session, which cannot be made again?

## Round checklist
Round 1.

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


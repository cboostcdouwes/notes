# What a run records

## Problem
(Not confirmed yet. Split off from [inspecting-experiment-results.md](inspecting-experiment-results.md) on
2026-11-22, where the user chose to decide this first. Research started on the user's word, 2026-11-22.)

Draft, 2026-11-22, after the first answers: what a run leaves behind is too little to work with later. The user
could not always tell which method, settings or code gave a result, and could not always find a run again. Every
run made from now on (a method's training run in the maze, a probe, a human baseline session) has to be something
the user and the assistant can find again and refer to in a way that stays valid, tell what made it, look at while
it trains, examine afterwards including what the agent experienced, make again, continue, and trace a reported
number back to. Not every run has to be kept for good, and the record has to respect limits on disk space and on
how much slower a run gets. Existing runs need not be covered ("Old runs don't matter", user, 2026-11-22), nor do
experiments outside the maze for now.

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

Not known yet: how alike a run made again has to be (today the same seed does not give the same numbers); the
amounts of the disk and run-time limits; who or what decides which runs are kept; whether "not for other
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
| R12 | A run can be made again from its record | The user expects to repeat a run to check it or build on it. How alike the repeat has to be: not asked yet; today the same seed gives different numbers | user, 2026-11-22 ("Make it again") | should (claimed) | need yes, priority and exactness no |
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
| W1 | Existing runs get such a record | "Old runs don't matter" | user, 2026-11-22 (parent W3) | won't | yes |
| W2 | Experiments outside the maze (attention-regression) get such a record | Not chosen when asked what counts as a run. Would come back if those experiments are taken up again | user, 2026-11-22 | won't | to be confirmed with the problem |

## Options
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O2 | Put the project under version control (a consequence of "Not deliberate", not the user's proposal) | | | | not judged yet |
| O1 | The list from the parent's bias check (the assistant's, not the user's): a name that survives moving and reruns, the method, a write at every evaluation, the data the agent saw, how the networks are called, the code that made it, and a regenerable index of runs | | | | not judged yet |

## Open questions
1. Is the problem as written back right, and what does it leave out? Decides everything after it.
2. How alike does a run made again have to be: the same numbers, the same within the spread between seeds, or the
   same conclusions? Decides R12 and how much of the code and its environment a record must pin down.
3. What are the amounts of the disk and run-time limits? Better asked with measured costs per option in hand.
   Decides R15, R16 and what is stored per run (R5, R6).
4. Who or what decides which runs are kept? Decides R17.
5. The priorities of R1, R2, R3, R11 to R14 (claimed, not checked).

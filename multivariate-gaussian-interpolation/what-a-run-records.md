# What a run records

## Problem
(Not confirmed yet. Split off from [inspecting-experiment-results.md](inspecting-experiment-results.md) on
2026-11-22, where the user chose to decide this first. Research started on the user's word, 2026-11-22.)

Draft, 2026-11-22: what a training run leaves behind is too little to work with later. The user and the assistant
need every run made from now on to be something they can refer to in a way that stays valid, find again, tell apart
from other runs and from a repeat of itself, look at while it trains, and examine afterwards, including what the
agent experienced. Existing runs need not be covered ("Old runs don't matter", user, 2026-11-22).

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
- Whether any of this has cost the user something, beyond what the parent log records about inspecting: assumed,
  not asked.

Time horizon and values, from the parent log (user, 2026-11-22): the project runs "later, for months" in sessions
of 1 to 8 hours; the user values low upkeep, quick answers and pleasant use; live results may make a run "slower,
not broken". Whether those values hold for the record itself (disk, run speed): assumed.

What it is part of and what depends on it:
- The decision on inspecting results waits for it: its addresses, live results, "what data it saw", finding runs,
  and the scope "runs made after the run record is in place".
- The long-term project structure discussed on 2026-11-22 (one record per run, a generated index, a standard
  comparison, repeatable runs, version control): discussed only, no log, undecided.

If nothing is done: the viewer research can still go on, but live results, the data the agent saw and stable
references to runs stay out of reach, and a rerun keeps replacing what a remark or a README number pointed at
(assumed consequence, from the parent's round-1 bias check).

Not known yet: what counts as a run here (method runs, probes, human sessions, other experiments); what a stored
run is used for besides inspecting; how long a run must stay examinable; limits on disk or on how much slower a run
may get; why the project is not under version control.

## Related decisions
- Parent: [inspecting-experiment-results.md](inspecting-experiment-results.md), open; its round 2 waits for this one.
- The long-term project structure: discussed 2026-11-22, no log, undecided.

## Requirements
Draft inventory before the first questions. "Verified" refers to this decision: a need the user confirmed for the
viewer is marked as carried over, with the parent's ID.

| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| R1 | A run can be referred to in a way that stays valid when it is moved or made again | Remarks, README numbers and views that point at a run would silently point at something else | inferred (parent R15, R9; bias check round 1) | must (claimed) | no |
| R2 | Making a run again does not destroy an earlier one | The earlier result can no longer be examined or compared | inferred (overwriting read in `gcsl.py:600`) | must (claimed) | no |
| R3 | A run tells what made it: method, settings, seed, and enough about the code to judge whether two runs are comparable | Two runs cannot be compared with confidence; the evidence behind a result cannot be stated | inferred (parent R20; project `CLAUDE.md`, "say how much evidence a result has") | should (claimed) | no |
| R4 | A run's results can be seen while it trains | The user waits for the end of a run to see anything | parent R13 (user, 2026-11-22: "I'd also like to be able to see run results as they come in"; "Slower, not broken") | should | carried over |
| R5 | What the agent experienced during a run can be examined afterwards | "What data it saw" cannot be answered | parent R4b (user, 2026-11-22) | should | carried over |
| R6 | A run's learned networks stay usable after the method's code changes | Views computed from an older run are wrong or fail | inferred (bias check round 1) | should (claimed) | no |
| R7 | Any method's run fits, and a run in a new environment is not blocked | The record is redone per method or per environment | parent R1 (must, verified), R2 (should) | must / should | carried over |
| R8 | The blindness rule holds: nothing from a layout the user has not played is recorded in a form the user is shown, and such runs stay refused | Seeing a layout cannot be undone | project `CLAUDE.md` (user, 2026-11-20, 2026-11-21) | must | yes |
| R9 | Layouts are named by number only | The user asked for it | project `CLAUDE.md` (user, 2026-11-20) | must | yes |
| R10 | Low upkeep as methods and experiments change | The user values it; a record that every new method must be taught costs every time | parent R16 (user, 2026-11-22) | should | carried over |
| W1 | Existing runs get such a record | "Old runs don't matter" | user, 2026-11-22 (parent W3) | won't | yes |

## Options
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O1 | The list from the parent's bias check (the assistant's, not the user's): a name that survives moving and reruns, the method, a write at every evaluation, the data the agent saw, how the networks are called, the code that made it, and a regenerable index of runs | | | | not judged yet |

## Open questions
1. Is the problem as drafted right, and what does it leave out? Decides everything after it.
2. What counts as a run that gets a record: method runs, probes, human sessions, other experiments? Decides R7 and
   how general the record is.
3. What is a stored run used for besides inspecting? Decides what it must hold (R3, R6).
4. How long must a run stay examinable, and what may it cost in disk and run time? Decides what is stored per run
   (R5, R6).
5. Why is the project not under version control? Decides what "the code that made it" can mean (R3).
6. Has the user been cost anything by what is listed under "What has gone wrong"? Decides the priorities of R1, R2
   and R3.

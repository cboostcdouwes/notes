# What a run records

## Problem
(Not confirmed yet. Split off from [inspecting-experiment-results.md](inspecting-experiment-results.md) on
2026-11-22, where the user chose to decide this first.)

Draft, 2026-11-22: a training run leaves behind too little to be found, named, watched while it trains, or
re-examined later with confidence. It has no name beyond its folder and file, a rerun overwrites it, it does not say
which method or which code made it, it writes nothing until it ends, and it does not keep what data the agent saw.
The user and the assistant need every run made from now on to be something that can be pointed at for good, found
again, looked at while it trains, and examined afterwards. Existing runs need not be covered ("Old runs don't
matter", user, 2026-11-22).

## Situation
Known from the parent log's round 1 (each read in the code on 2026-11-22):
- All four maze methods train through one loop and one save point (`gcsl.main`, `gcsl.train` in
  `experiments/gcrl-maze/gcsl/gcsl.py`).
- A run writes `<results>/<layout>_<actions>.json` (keys `config`, `curves`, `layout`, `steps`) and
  `<layout>_<actions>_checkpoints.npz` (every network of every model at 81 evaluations) once, after training. A
  rerun into the same folder overwrites both.
- The JSON has no method name, date, run name, seed list beyond the config, code version or timing; probes write
  JSON files of their own shapes.
- The agent's collected data (positions, actions, commanded goals, resets) is not stored; one generator estimated
  about 6 MB per model for a 200,000-step run (not measured).
- A method does not say how its stored networks are called; a view has to know that per method.
- Checkpoints are 90 to 330 MB per run file; the results folders hold about 10 GB; 39 of 152 result files have
  their networks.
- The project is not a git repository, so "the code that made it" has nothing to point at today (project
  `CLAUDE.md`).
- The user must stay blind to layouts they have not played; training on them is refused (`gcsl.require_played`).

What depends on it: the decision on inspecting results (its addresses, live results, "what data it saw", finding
runs), and the long-term project structure discussed on 2026-11-22 (one record per run, a generated index, a
standard comparison, repeatable runs), none of it decided.

Not known yet: what the user wants to find runs by; how long runs and their stored networks must be kept and how
much disk that may take; whether version control comes first; what else the record is for besides inspection
(comparison tables, the status page, reproducing a run).

## Related decisions
- Parent: [inspecting-experiment-results.md](inspecting-experiment-results.md), open; its round 2 waits for this one.
- The long-term project structure: discussed 2026-11-22, no log, undecided.

## Open questions
1. Is the problem as drafted right, and what does it leave out? Decides everything after it.
2. What is the record for besides inspection? Decides what it must hold.
3. Does version control come first? Decides what "the code that made it" can mean.
4. How long are runs kept, and how much disk may they take? Decides what is stored per run.

## Brief for a generator
You generate options for a design problem from a fresh start. You get the problem, its requirements and a lens, not
the researcher's options or the chat, so nothing narrows where you look. Don't rank or judge the options; drop only
ones that plainly can't work.

1. **Find the problem before solving it.** Restate it in your lens's terms: within your lens, pick the fields that
   seem furthest from the problem but serve the same purpose, and name what they call this problem. Add two or three
   other formulations: wider, narrower, and inverted (what if the need went away?).
2. **Search under those names** on the web (load the search tool first if it isn't loaded): how those fields solve
   it, solutions that serve the same purpose by a different mechanism, existing tools, libraries and standards.
3. **Titles first.** Write at least fifteen short titles before working any out; the later ones tend to be the more
   original; include a few you think unlikely to be chosen. Then rewrite them to be more different from each other,
   and drop near duplicates.
4. **Work out the eight most different**: what it is, where it comes from (a source URL), what it would cost.

Answer with the reformulations, the worked-out options with their sources, and the other titles, one line each.
Start the line of each worked-out option with its ID: the letter the prompt gives you and a number (`F1`, `F2`).

## Problem

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

## Context you may need
The project is a reinforcement-learning research project run by one person with an AI coding assistant, on one
workstation with one GPU, in Python (JAX), worked on for months in sessions of 1 to 8 hours. A "run" trains an agent
in a small 2-D maze. Today a run takes 12 s to a few minutes; larger ones may come. All training methods share one
training loop. A run today leaves its settings and score curves (kilobytes) and every network at 81 moments of
training (90 to 330 MB per run); it writes them once, at the end, and a repeat of the same run replaces them. There
are hundreds of runs. A "probe" is a short try-out of one idea by the assistant, with a script and result files of
its own shape. A "human baseline session" is the user playing the maze with a gamepad; it cannot be repeated by
running code. "The data the agent experienced" is its positions, actions, goals and resets during training (a few
megabytes per run, not stored today). The same settings and seed do not give exactly the same numbers today. The
project is not under version control; that is not deliberate. "The assistant" is the AI coding assistant: it reads
and writes files and runs commands. The user must not see some of the mazes ("layouts") before playing them, which
is what the blindness requirement is about.

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
| W1 | Existing runs get such a record | "Old runs don't matter" | user, 2026-11-22 (parent W3) | won't | yes |
| W2 | Experiments outside the maze (attention-regression) get such a record | Not chosen when asked what counts as a run. Would come back if those experiments are taken up again | user, 2026-11-22 | won't | to be confirmed with the problem |

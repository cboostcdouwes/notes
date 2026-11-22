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

The user cannot see a run's results together with its diagnostics, cannot find the relevant results among many
files, and cannot look around without the assistant writing a new script; what they do see often does not make clear
what the agent is doing or why it fails. They need to inspect any run of any method in the project: choose the run,
the moment in training, the goal and the state themselves, put runs, methods and seeds side by side, see results as
they come in, and leave remarks on what they see for the assistant. The assistant must be able to read the same
diagnostics. New kinds of diagnostic keep being added and must fit in without redoing what exists.


## Context you may need
The project is a reinforcement-learning research project run by one person with an AI coding assistant, on one
workstation with one GPU, in Python (JAX, matplotlib). A "run" trains an agent in a small 2-D maze for 40 s to a few
minutes and stores its settings, score curves over training, and every network at about 80 moments of training.
"Diagnostics" are things computed afterwards from those networks and the environment: paths the agent takes, the
action it chooses at every point of the map, a learned distance or value next to the true one, a learned model's
error. There are hundreds of runs. "The assistant" is the AI coding assistant: it can read images, tables and text
files and run commands, but cannot operate an interactive window.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| R1 | A run of any method in the project can be inspected the same way, without the inspection depending on that method | New methods arrive every few days (four in three days); work per method would make upkeep high (R16) | user's request, 2026-11-22 ("any model"); reason inferred | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R2 | A new environment or kind of model is not blocked by it | None is planned ("none known yet"); the wish is not to be blocked when one arrives | user, 2026-11-22 | should | yes |
| R3 | A new kind of diagnostic can be added later without redoing what exists | Diagnostics keep being added ("other possible future debug utilities") | user's request and answer, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R4b | The views help answer: where the agent wastes steps; what it learned, next to the truth; how training went; what data it saw | These are the questions the user has about a run | user, 2026-11-22 (replaces R4) | should | yes |
| R5 | The diagnostics that exist today stay available (score curves, paths, action fields, value and time-to-goal against the truth, model error) | Work already done would be lost | inferred from "diagnostics that exist now" | should | no |
| R6 | Nothing of a layout the user has not played in both conditions reaches the user through it | The user's human baseline on that layout is spoiled, and that cannot be undone | project `CLAUDE.md` (user, 2026-11-20, 2026-11-21) | must | yes (standing rule; the user's own words and reason) |
| R7 | The assistant can read every diagnostic the user can see (as an image, a table or numbers) | The assistant works on the methods and cannot operate an interactive window | user, 2026-11-22 ("Yes, both of us") | must | yes |
| R8 | A run's results and its diagnostics can be seen together, in context | "It's difficult to look at the results in context with diagnostics" | user, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R9 | A relevant result can be found without knowing where it is stored | "it's difficult to navigate and find relevant results"; outputs are spread over many files | user, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R10 | The user chooses the run, the moment in training, the goal and the state to look at, among kinds of view that exist, without the assistant writing code | Today every new look needs a new script from the assistant | user, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R11 | Any runs, methods and seeds can be put side by side | Comparing runs is hard today | user, 2026-11-22 | must | yes (part of the problem the user confirmed, 2026-11-22) |
| R12 | A view makes clear what the agent is doing and why it fails | Today's outputs are "hard to interpret" | user, 2026-11-22 | should (as claimed) | no |
| R13 | A run's results can be seen as they come in, while it trains Without it the work is slower, not broken (the user's answer) | user's remark and answer, 2026-11-22 | should | yes |
| R14 | It can be used from another machine over a network | "would be nice, but that may be out of scope" | user's remark, 2026-11-22 | could | yes |
| R15 | The user can attach a remark to what they are looking at, and the assistant receives it together with what it refers to To tell the assistant exactly which run, moment and place is meant, and to leave questions and instructions next to the evidence for a later session; without it the assistant may look at the wrong thing and observations get lost between sessions | user's remark and answer ("Both"), 2026-11-22 | should (chosen over "nice to have"; whether it is essential was not asked) | yes |
| R16 | It costs little effort to keep working as methods and experiments change | | user, 2026-11-22 (value) | should | yes |
| R17 | Getting from a question about a run to seeing the answer is quick | | user, 2026-11-22 (value) | should | yes |
| R18 | It is pleasant to use | | user, 2026-11-22 (value) | should | yes |
| W1 | The user answers a question that needs a new computation without the assistant | Offered and not chosen; new computations stay the assistant's work. Would come back if the user wants to write diagnostics themselves | user, 2026-11-22 | won't | yes |
| W2 | The user can read and change its code themselves | Offered as a value and not chosen. Would come back if the user wants to maintain it | user, 2026-11-22 | won't | yes |


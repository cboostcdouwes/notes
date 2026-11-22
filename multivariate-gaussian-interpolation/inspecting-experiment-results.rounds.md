# Inspecting experiment results: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| R4 | Many kinds of debug views are available for a run | | user's request, 2026-11-22 ("many debug visualization utilities") | R4b (problem formulation): the user named the questions the views should answer |

## Dropped requirements
| # | Requirement | Why it isn't one (user's reason) | Source | Round |
|---|---|---|---|---|

## Problem formulation (2026-11-22)
The user's answers, in order:
- Looks at results through the assistant's reports in chat and by opening figures and videos; not the README tables.
- What is wrong: "It's difficult to look at the results in context with diagnostics, and it's difficult to navigate
  and find relevant results."; cannot explore on their own; no overview; hard to interpret.
- Horizon: later, for months; waits on nothing specific.
- Values: low upkeep, quick answers, pleasant to use (understandable code offered, not chosen).
- Scope: no other environment or kind of model known yet; wish not to be blocked.
- Exploring: choose what to look at, compare freely (asking new questions that need a new computation: not chosen).
- Debug views: where it wastes steps, what it learned, how training went, what data it saw, "other possible future
  debug utilities".
- Who reads: "Yes, both of us".
- Remark: "I'd also like to be able to see run results as they come in. Making it work over a network connection
  would be nice, but that may be out of scope. I'd like to be able to make annotations/comments for the agent
  anywhere in the program."
- Problem written back: "Yes, confirmed". Live results: "Slower, not broken". Remarks to the assistant: "Both"
  (pointing precisely, and steering across sessions).

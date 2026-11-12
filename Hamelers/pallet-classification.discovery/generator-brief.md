# Generator brief

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
Every pallet that arrives at the classification point must leave it with two judgements attached: which pallet type
it is, and its condition: usable as is, to be repaired, or to be discarded. This must keep up with 1000 pallets per
hour at the peak (one pallet every 3.6 s). Getting the pallets in and out, and acting on the judgement (sorting,
repairing, discarding), happen outside it.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| R1 | Keeps up with a feed of at most 1000 pallets per hour (peak, margin included) | the feed delivers up to that rate | user, 2026-11-12 | must (as stated) | no |
| R2 | Tells the pallet's type | unknown: what the type is used for downstream | user, 2026-11-12 | must (as stated) | no |
| R3 | Tells whether the pallet is usable as is, to be repaired, or to be discarded | unknown | user, 2026-11-12 | must (as stated) | no |
| R5 | Stops at most 3 times per year, planned and unplanned together | the existing machine needs too much maintenance; what a stop costs: unknown | user, 2026-11-12 | must (as stated) | no |
| R6 | Tells apart pallet types that have the same size | the existing machine can't, and that is one of its faults | user, 2026-11-12 (inferred from "could only detect pallet types by size") | must (inferred) | no |
| R7 | Wrong usable/repair/discard calls are rare, both ways weighted about equally | the existing machine misclassifies; how rare is enough: unknown | user, 2026-11-12 | must (as stated) | no |
| R8 | Can be maintained by the people who will own it; the customer does not extend it | the existing machine needs too much maintenance | user, 2026-11-12 (corrected: no extending by the customer) | should (as stated) | no |
| R10 | Cboost can add new pallet types after delivery without a site visit | the list of types grows; the customer doesn't add them; adding one need not be easy | user, 2026-11-12 | must (as stated) | no |
| R11 | Judges condition by the customer's rules; the full list is known before the design is fixed, only "four missing posts is discard" so far | the customer sets the rules | user, 2026-11-12 | must (as stated) | no |
| R4 | Sorts the pallets, or handles their input and output | done externally | user, 2026-11-12 | won't | no |

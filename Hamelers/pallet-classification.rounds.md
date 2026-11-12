# Pallet classification: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| R2 | Tells the pallet's type | unknown | user, 2026-11-12 | R2b (round 1): up to 20% undecided |
| R3 | Tells whether usable / repair / discard | unknown | user, 2026-11-12 | R3b (round 1): up to 20% undecided |
| R7 | Wrong calls are rare, both ways about equal | the existing machine misclassifies | user, 2026-11-12 | R7b (round 1): fewer than 20% wrong |
| R5 | Stops at most 3 times per year, planned and unplanned together | the existing machine needs too much maintenance | user, 2026-11-12 | R5b (round 1): only stops that hold up the feed count, and 1000/h must be met throughout |

## Dropped requirements
| # | Requirement | Why it isn't one (user's reason) | Source | Round |
|---|---|---|---|---|
| R9 | Builds on what Cboost already knows and uses | "Whatever fits the project": a stack part is chosen on fit, not reused for its own sake | user, 2026-11-12 | problem formulation |

## Round 1
Problem confirmed (2026-11-12). Scope split: this log is the machine concept; interface, software stack and remote
updates are open children. Discovery: four generators (A own field, B far fields, C organisation, D physics), 32
options. Design-space map, axes: *what gives the evidence* (optical geometry / other physics / identity marks /
people) x *where the judgement lives* (explicit rules on a component map / learned model / human / elsewhere in the
chain) x *buy or build*. Every cell that could hold a sensible option has one (e.g. physics x learned: D1; people x
service: C4; buy x geometry: A1/A3); robot-held sensors and history-based judgement only appear as titles, both
slower or needing a closed pool, so no extra generator was run.

Draft of O2 (scratchpad `draft/`): a bottom-only height map can't see posts; straight views see 8 of 9 EUR blocks;
the centre block needs oblique views or non-line-of-sight sensing. Cycle budget ~0.44 m/s, ~450 Hz profilers.

Leader O2 (own-build fixed 3D station with component map and rule table); runner-up A1 (breeze-PAVE turnkey).

Searches: WebSearch "automatic pallet sorting line inspection EPAL block pallet camera 1000 pallets per hour"
(breeze >1000/h; Körber 180-200/h; KHS 120/h; Alliance 600/h); "SICK PAIS ... throughput" (500/h, one source);
"breeze PAVE ... pallets per hour" (confirms >1000/h in two trade articles; IVISYS 400-800/h conflict);
German "Palettensortieranlage automatische Prüfung ..." (Sivaplan, breeze, SICK PACS/EDEKA); WebFetch
palletenterprise ?p=6407 (Pooling Partners scanner). Documented route: no platform documentation exists for this
need; the field's own documents are the EPAL quality/exchange criteria and ISO 18613 (repair criteria), covered by
A7. Libraries named by generators: HALCON (commercial), Anomalib (Apache-2.0), Open3D (MIT), PCL (BSD); the
project's licence is not set (new project), so licence fit is a question for the software-stack child.

Checks (round 1): the bias check added O3-O7 and doubted R5, R6, R7, R11, R10; the rejection check showed O2's lead
over A1 rested on asymmetric ? cells, so the ranking became a tie, and corrected cells for A2, A3, B2, D2, B4, D1,
C2, C3.

Answers (round 1, 2026-11-13): R5 counts only stops that hold up the feed, but the 1000/h peak must always be met
(so a spare lane must carry the full peak alone: O3 with two 500/h lanes no longer meets it). Cboost wants to build
the inspection itself (R12; reason asked in the follow-up). Same-size types differ in construction, marks and
material (R6): geometry alone is not enough; marks and a material cue (weight, colour, density) are needed.
Follow-up answers: R12's reason is know-how as a company goal (verified must). Fewer than 20% wrong (R7b). Up to
20% may be left undecided, for condition and for type (R2b, R3b).

## Round 2
Round 2: R12 put A1, A2, A3, O5, C8 out; the checks turned O2's sole lead into two tied dimensions (station design:
O2/O9/O11; availability: O3a/O14/O2+O8). Added O3a, O8-O15. No web search this round. Draft availability.py
corrected (overlap assumption).

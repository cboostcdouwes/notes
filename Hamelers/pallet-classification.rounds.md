# Pallet classification: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| R2 | Tells the pallet's type | unknown | user, 2026-11-12 | R2b (round 1): up to 20% undecided |
| R3 | Tells whether usable / repair / discard | unknown | user, 2026-11-12 | R3b (round 1): up to 20% undecided |
| R7 | Wrong calls are rare, both ways about equal | the existing machine misclassifies | user, 2026-11-12 | R7b (round 1): fewer than 20% wrong |
| R12b | Cboost builds the inspection; standard sensors may be bought | know-how | user, rounds 1-2 | R12c (round 6): models own, open source |
| R2b | Type, up to 20% undecided | unknown | user, round 1 | R2c (round 2): 80% get both labels, not additive |
| R3b | Condition, up to 20% undecided | unknown | user, round 1 | R2c (round 2) |
| R7b | Fewer than 20% of decided calls wrong | existing machine misclassifies | user, round 1 | R7c (round 2): of labelled pallets |
| R12 | Cboost builds the inspection itself | know-how | user, round 1 | R12b (round 2): standard sensors may be bought |
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

## Round 3
Answers (round 2): the 20% allowances are separate, but type and condition don't add up: at least 80% get both
labels, of which at most 20% wrong. Only standard sensors may be bought (O10 out). Budget about EUR 700k for the
whole project incl. R&D, in about a year (R13). Cost draft: O3a trailing; one lane with O14 + O8 leads availability.

Searches: "LMI Gocator 2490 price" (Stemmer Imaging list ~EUR 12,890; no other listing); "industrial 3D laser line
profiler price ..." (AT Sensors from $6,600 / $17,050; no SICK or Wenglor price).
Checks (round 3): cost draft incomplete (fixed, v2: every option tight); availability lead unsupported (tied
again); O16 measurement campaign and O17 phased delivery added.

Answers (round 3): the EUR 700k includes the first delivered unit; a held-up feed is expensive (lines stop or a
contract penalises it), so R5b is a verified must; R2c's period is unknown (known gap, assumed overall). The two
verified-ish musts R5b and R13 now pull apart: redundancy (O3a) is the only R5b ✓ but the least affordable.

## Round 4
Answers: prove one lane (O14 + O8, O3a as phase-2 fallback); decide the station design now (O16 declined);
materials wood/plastic and solid/presswood. Draft layout.py: overlap costs EUR 60-144k with cameras, 216-360k with
profilers. O9 leads the station design; O2 and O3a trail on R13.

Searches: "Gocator 2490 laser class 2M 3R datasheet" (LMI datasheet: Class 2, 3R; Stemmer variants 2M and 3R).
Checks (round 4): O3a ahead of the chosen one lane on R5b at the same R13 risk; station design tied again;
operating schedule found as the biggest gap; O18-O20 added.

## Round 5
Answers: schedule unknown; one lane for a simpler product (R14); training images must come from the final setup
(distribution shift), so O16/O20 trail and O21 (final sensing head first) is added. No web search this round.
Checks (round 5): R14 reworded; R15 added; O2 leads station design; O22 staged evidence added.

## Round 6
Answers: AI is a goal (R16); modules vs one lane by cost (R14); O22 accepted. Checks: R16 doesn't place the
learning, so O2 stays in by its R16 variant; verdict consistency on verified musts; O23-O25 added.

## Round 7
Answers: no preference where learning sits; rule kinds unknown; own open-source models (R12c), O25 out. No ranking
change; remaining unverified requirements asked.

3D concept drafts (2026-11-13, after the decision draft): https://claude.ai/artifact/XNygZFDLxrLRFfGQGGjJtF (source in the session scratchpad, hamelers-3d/index.html). Assumed dimensions; sensor counts follow layout.py (every face seen twice).

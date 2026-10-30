# Carrying luggage on the user's recumbent

## Problem
The user rides an Optima Baron (an unsuspended aluminium low racer: seat very low, just in front of and partly over
the rear wheel) and wants to carry two hook panniers, together under 15 kg. Loaded, the bike must still handle safely,
the bags must stay put, getting on and off must stay easy, and the bike must not be changed permanently. The bike has
threaded holes at the rear dropouts; the threaded holes on the seat bracket belong to the seat mounting and sit too
far forward for a stable rack strut (user, round 4). No rack. The user fits it themselves.

The user phrased it as "attach a luggage rack"; a rack is one way to carry luggage, so it is listed under *Options*,
not as the problem.

## Related decisions
None.

## Success criteria
Judged by the user, in use (the loaded test in `fit-check.md`):
- The loaded bike handles safely: steady at speed and downhill, no wobble, no load touching wheel, chain or tyre, no
  bag scraping the road in corners.
- Getting on and off and pedalling are as easy as without luggage.
- The mount doesn't loosen, and the bike shows no permanent change after a season of use.
- Both panniers (under 15 kg together) fit.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| R1 | The loaded bike stays stable and safe to steer at the speeds the user rides | A crash or loss of control | user, round 1 ("handling must stay safe") | must | yes |
| R2b | No permanent changes or damage to the bike (frame, seat) | A weakened aluminium frame or seat; the Baron is out of production, so it can't be replaced | user, round 2 ("no permanent changes to the bike"); round 5: carefully fitted rubber-lined clamps are acceptable | must | yes |
| R3c | Carries the user's luggage: up to 15 kg, about two panniers' volume | The luggage doesn't fit or exceeds the carrier's rating | user, round 1 ("two bags, under 15 kg") | must | yes |
| R4b | Works on the user's Optima Baron | A carrier that can't be mounted, or rubs wheel or chain, is useless | user, round 1 (model named) | must | yes |
| R5 | Doesn't hinder getting on and off, pedalling (heel strike) or ground clearance | Hard to mount the bike; bags hit heels or the road | user, round 3 ("hard limit") | must | yes |
| R7b | The user can fit it themselves | The user wants to fit it themselves; a dealer-only option doesn't suit | user, round 3 ("myself") | should | yes |
| R12 | Total cost under €50 (rack, clamps, bolts, shipping) | The user's budget | user, review of the round 6 decision ("the budget is low: under 50 euros") | must | yes |
| R10 | The carrier can be obtained within the user's time frame | An option that can't be bought carries nothing | rejection check, round 3; user "don't know" (round 4) | should | no (assumption: weeks of waiting acceptable) |
| R6 | Luggage can be taken off and put back quickly | Daily use gets tedious | inferred; user had no remarks (rounds 1–3) | could | no (assumption) |
| R8 | Luggage stays dry and secure when parked | Wet gear; theft | bias check, round 1; user had no remarks (rounds 1–3) | could | no (assumption) |
| R9 | Uses the panniers the user already owns | The user wants to keep them (reason beyond that not given) | user, round 4 ("keep my panniers") | should | yes |
| R11 | The carrier's load path doesn't pass through the seat mounting, and its upper support braces it stably | A strut to the seat-bracket holes is too far forward to brace the rack and loads the bolts that hold the seat | user, round 4 | must | yes |

## Options
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O3s | Universal rack rated 25 kg with legs on the dropout holes and the upper struts clamped to the rear stays with Tubus seat-stay clamps (rubber-lined, sizes 14–25 mm). Under R12: XLC RP-R02 (~€22) or Procraft ProTourer (~€21) or ROSE Grand Tour AL (~€29 + shipping) instead of the Topeak (~€48–65) | No permanent change; struts mainly brace, the legs carry the load; standard hook panniers; self-fit; in stock | Only if the Baron has stays rising from the dropouts (unknown, asked); clamp makers warn not to overload the frame | cheap (unclamp) | leading (if the Baron has stays) |
| O17 | Universal rack with struts clamped (rubber-lined clamp) to the main frame tube or rear-fork crown behind the seat | No permanent change | Clamp on the big main tube; strut angle and length unknown | cheap | trailing (R4b ?, R2b ~) |
| O3 | Universal rear rack with adjustable legs and struts, rated ≥ 20 kg, bolted to the dropout holes (legs) and seat-bracket holes (struts). Concrete: Topeak Uni Super Tourist DX 2.0 (26 kg, legs adjustable for 24"–29", side rails keep panniers off the spokes) or Tubus Cargo Evo (26 or 28 inch version; rating listed as 26 or 40 kg) | Uses existing holes only; standard hook panniers; in stock; self-fit with hex keys; a Baron owner fitted an adjustable rack on the bike before | Rack top must clear the seat back over the wheel (measure first); cheap racks flex | cheap (bolts off) | not applicable (R11, must): struts to the seat-bracket holes |
| O16 | Custom bolt-on rack made by a recumbent dealer or frame builder for the existing holes | Exact fit | A builder's work costs far more than €50 (estimate, unsourced) | cheap | not applicable (R12, must) |
| O15 | Ask Optima owners (ligfiets.net, BentRider forum) which rack they fitted | Real-world fit experience | Days of waiting | cheap | part of the plan (process, optional) |
| O12 | Optima Lowracer bag: side bags made for the Baron with own hardware, no rack (Ligfietsshop, €39.95) | Made for the Baron, cheap | Volume and rating unpublished; replaces the user's panniers | cheap | trailing (R3c ?, R9 ✗) |
| O4 | Universal rack held with P-clamps on the stays | Cheap | Clamps can slip or dent thin aluminium tubes; holes exist, so no need | cheap, but dents are permanent | trailing (R2b ~) |
| O6 | Small rackless bags (seat-back, boom) | Nothing to mount | Too small for 15 kg | cheap | trailing (R3c) |
| O7 | Trailer on the rear axle | No load on the frame | Hitch fit unchecked; longer rig | cheap | trailing (R5 ~, R1 ~) |
| O2 | Underseat rack | Weight low and central | No Baron underseat rack exists; custom rails; hook panniers need rails; room "depends on the bags" | cheap | trailing (R4b ?, R7b ~) |
| O9 | Underseat rack plus rear rack | Weight split | Needs O2 | cheap | trailing (R4b ?, R7b ~) |
| O10 | Front low-rider rack | Low weight | Small front wheel under the rider's legs; steering mass | cheap | trailing (R4b ?, R1 ?) |
| O13 | Backpack | Nothing on the bike | Pressed between back and seat | cheap | trailing (R5) |
| O14 | Clamp-on eyelets (seat-collar style) | No drilling | Baron has no seat tube; holes already exist | cheap | trailing (R4b ?) |
| O1 | Optima's own Baron rack | Made for the frame | User says Optima made none for the Baron (round 3); the manual mentions racks "on the Stinger and Baron"; none for sale either way | cheap | not applicable (R4b, must: doesn't exist per user) |
| O5 | Rack or bags fixed to the seat shell | No frame work | Needs drilling the seat | one-way | not applicable (R2b, must) |
| O8 | Brazed or welded mounts | Exact placement | Permanent; weakens the aluminium | one-way | not applicable (R2b, must) |
| O11 | A different, cargo-ready bike | Storage designed in | Not the user's Baron | costly | not applicable (R4b, must) |

## Matrix
| Option | R1 | R2b | R3c | R4b | R5 | R7b | R10 | R6 | R8 | R9 | ✗ or ~ (R11 must, yes, noted here) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| *priority, verified* | must, yes | must, yes | must, yes | must, yes | must, yes | should, yes | should, no | could, no | could, no | should, yes | |
| O3s rack + stay clamps | ? | ~ | ✓ | ? | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ? R1, R4b, ~ R2b; R11 ✓ |
| O17 rack + main-tube clamp | ? | ~ | ✓ | ? | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ? R1, R4b, ~ R2b; R11 ? |
| O3 rack to seat-bracket holes | ? | ✓ | ✓ | ? | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ R11 |
| O16 custom rack (builder makes, user bolts on) | ? | ✓ | ✓ | ✓ | ✓ | ✓ | ? | ✓ | ✓ | ✓ | ? R1, R10; R11 ✓ (designed for it) |
| O12 lowracer bag | ✓ | ✓ | ? | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✗ | ✗ R9, ? R3c |
| O4 P-clamps | ~ | ~ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ R1, R2b, R3c, R4b |
| O6 small bags | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ R3c, R9 |
| O7 trailer | ~ | ✓ | ✓ | ~ | ~ | ✓ | ~ | ~ | ✓ | ~ | ~ R1, R4b, R5, R10, R6, R9 |
| O2 underseat | ✓ | ✓ | ? | ? | ? | ~ | ? | ✓ | ✓ | ? | ? R3c, R4b, R5, R10, R9, ~ R7b |
| O9 underseat + rear | ✓ | ✓ | ✓ | ? | ? | ~ | ? | ✓ | ✓ | ✓ | ? R4b, R5, R10, ~ R7b |
| O10 front low-rider | ? | ✓ | ? | ? | ? | ✓ | ✓ | ✓ | ✓ | ✓ | ? R1, R3c, R4b, R5 |
| O13 backpack | ? | ✓ | ~ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ R5, R9, ~ R3c, ? R1 |
| O14 clamp eyelets | ? | ~ | ? | ? | ? | ✓ | ✓ | ✓ | ✓ | ✓ | ~ R2b, ? R1, R3c, R4b, R5 |
| O1 Optima rack | ? | ✓ | ✓ | ✗ | ? | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ R4b, R10 |
| O5 seat-mounted | ~ | ✗ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✗ R2b |
| O8 welded mounts | ✓ | ✗ | ✓ | ✓ | ? | ✗ | ? | ✓ | ✓ | ✓ | ✗ R2b, R7b |
| O11 other bike | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ? | ✓ | ✓ | ? | ✗ R4b, R7b |

## Evaluation
**O3s universal rack with struts clamped to the rear stays, leading (if the Baron has stays)**: keeps O3's
strengths and moves the upper support to the stays, where a rack strut normally goes (R11 ✓). R2b ~: clamps are
removable and rubber-lined, and the struts mostly brace sideways and fore-aft while the dropout legs carry the
weight; Tubus clamps spread the load around the stay (retailer review); not for carbon (Baron is aluminium). R4b ?:
depends on the Baron having stays from the dropouts upwards, and their diameter (asked).

**O17 struts clamped to the main tube or rear-fork crown, trailing (R11 ?)**: R4b ? and R2b ~ are shared with O3s and
don't count.: the main tube is far forward of the rear
wheel, so the struts would be long and shallow, the same weakness the user named for the seat-bracket holes.
Best variant: a clamp on the rear fork near its crown. Compared with O3s: equal ~ on R2b; ? on R11 where O3s is ✓.

**O3 rack to the seat-bracket holes, not applicable (R11, must, verified round 4)**: the user says the holes are
too far forward for a stable strut and belong to the seat mounting. R11 rules out only this strut mounting, not the
rack; O3s is the variant that avoids it. Earlier analysis of O3, kept for O3s: the only option that meets every verified must and should without a ✗. R2b ✓: bolts
into existing holes, nothing permanent. R3c ✓: 26 kg (Topeak, retailers citing EN 14872) vs under 15 kg. R5 ✓: on a
low racer the feet are at the front crank, far from rear panniers, and the rider gets on in front of the seat; checked
in the fit check. R7b ✓: hex keys only. R4b ?: whether the rack's top clears the seat back depends on the measurement
in `fit-check.md` step 2; a Baron owner fitted an adjustable rack to the mudguard lugs (CycleChat), so it has been
done. R1 ?: no source covers handling; low bags behind a low seat are favourable, and the loaded test decides.
Of the two models, the Topeak's legs adjust over 24"–29", so it fits either Baron rear wheel and has more room to
reach the holes; the Tubus is stiffer but comes in fixed 26 or 28 inch versions with only the struts adjustable.

**O16 custom rack, not applicable (R12, must, verified at review)**: a builder's custom rack can't be made for under
€50 (estimate; no quote asked). Earlier record:
- Scored as its best variant: a builder makes the rack for the Baron's holes, the user bolts it on (R7b ✓).
- R10 as worded (should, unverified): obtainable in the user's time frame; lead time unknown.
- Compared with O3: ✓ on R4b where O3 is ?; ? on R10 where O3 is ✓; cost is not a requirement yet (asked).
  Wins if O3's measurement shows the seat leaves no room, or if the user prefers a sure fit over cost and wait.

**O12 Optima Lowracer bag, trailing (R9 ✗, R3c ?); fallback under R12**: €39.95 fits the budget; it is the only
Baron-specific option left if the stays don't take clamps.
- R9 (should, verified round 4): it replaces the panniers the user wants to keep.
- R3c: volume and rating unpublished (unknown, not a failure).
- Best variant: the bag plus a seat-back bag.
- Compared with O3: ? on R3c where O3 is ✓.

**O4 P-clamps, trailing (R2b ~)**
- R2b: clamps can dent thin aluminium; a dent is permanent. The frame already has holes, so clamps add only risk.
- Best variant: rubber-lined clamps on the stays for the struts, rack legs on the dropout holes: that is O3s.
  Generic P-clamps or hose clamps as the rack's only mounts carry the full load in the clamps; compared with O3s:
  same ~ on R2b, but O3s keeps the load on the dropout bolts and uses clamps made for rack struts. The dent risk
  counts against O3s too (shared).

**O6 small bags, trailing (R3c ✗)**: can't hold 15 kg. Best variant: add-on to O3 for small items.

**O7 trailer, trailing (R5 ~, R1 ~)**: longer rig to get on and off around; push and sway on descents (general
knowledge, unsourced); hitch fit unchecked. Best variant: single-wheel trailer. Compared with O3: worse on R5, R1,
R4b; wins only for loads over the rack's rating.

**O2 / O9 underseat, trailing (R4b ?, R7b ~)**: no underseat rack exists for the Baron; rails would be custom (not
self-fit); the user says room depends on the bags. Best variant: small bags on custom short rails. Compared with O3:
? on R4b like O3, ? on R5 where O3 is ✓, ~ on R7b where O3 is ✓.

**O10 front low-rider, trailing (R4b ?, R1 ?)**: little room at the small front wheel; weight on the steering.
Compared with O3: ? on R5 and R3c where O3 is ✓.

**O13 backpack, trailing (R5 ✗)**: pressed between back and seat when lying back; hinders the riding position.
Compared with O3: ✗ on R5 where O3 is ✓.

**O14 clamp eyelets, trailing (R4b ?)**: made for seat tubes the Baron doesn't have; the holes exist anyway. Compared
with O3: ~ on R2b where O3 is ✓.

**O1 Optima rack, not applicable (R4b, must)**: the user says Optima made no rack for the Baron. The Optima manual
mentions racks "rated for up to 20 kg on the Stinger and Baron" and a 2003 owner review mentions an "optional"
carrier; reported to the user, but none is for sale either way (R10), so the ranking doesn't depend on it.

**O5 seat-mounted, O8 welded mounts: not applicable (R2b, must)**: both are permanent changes.

**O11 other bike: not applicable (R4b, must)**.

### Harms for the leader (O3s) a few steps ahead
- A stay clamp slips under braking or bumps and the rack tilts back onto the tyre. Mitigation: rubber liner, correct
  clamp size (shim between sizes), check after 50 km and monthly; the legs on the dropout bolts still hold the load.
- An overtightened clamp dents a thin aluminium stay (permanent, R2b). Mitigation: tighten only until it doesn't
  slip; no clamp on a tube thinner than the clamp's size range.
- The struts reach the stays at a flat angle and don't brace the rack (the user's objection to the seat-bracket
  holes). Mitigation: measured in `fitting-plan.md` step 3; no good angle → O16.
Earlier harms, from the O3 seat-bracket variant, that still apply:
- The rack's top plate or struts touch the seat back when the rider leans back (the seat flexes): wear on the seat.
  Mitigation: measure with the rider seated; leave a finger's width; rubber pad on the strut.
- The bolts in the dropout holes back out over time: the rack drops onto the tyre. Mitigation: thread-locker, check
  after 50 km and monthly.
- Panniers swing into the spokes or derailleur: side rails (Topeak DX) and lower pannier hooks prevent it.
- Load grows past 26 kg later (touring): don't reinforce the rack; add a trailer (O7).
- Rack legs and the rear brake: check the legs clear the brake (disc and non-disc Topeak versions differ).
- The struts load the seat bracket, which carries the rider (bias check, round 4): if those holes are not made for a
  rack, the bracket's bolts could loosen. Mitigation: ask what the holes are for (asked); check the bracket bolts
  with the rack bolts. Holes on the seat bracket also fit the manual's "Fitting the Seat and Rack" section,
  which suggests Optima did make a rack mounting there.

### Draft and stress test
Draft: `fitting-plan.md` (step list for fitting O3 on the Baron) and `fit-check.md` (measure before buying, loaded test
after). Stress-tested on paper against the Baron's layout: the deciding unknown is the clearance between the rack top
and the seat back above the rear wheel; the plan measures it before buying and routes to O16 if too small. A real
test needs the bike.

## Open questions
None deciding. Stay diameter and strut angle are measured by the user before buying (`fitting-plan.md` step 3);
a result outside the clamps' 14–25 mm range or a flat strut angle sends the choice to O16.

## Sources
| Claim | Source (URL or `file:line`) | Date | Reliability |
|---|---|---|---|
| Rear-rack panniers can compromise recumbent handling; heaviest gear underseat | https://cruzbike.com/blogs/blog/the-best-way-to-carry-gear-on-your-recumbent-bicycle-tour ; https://www.bentrideronline.com/?p=1674 | 2026-10-28 | two sources, both enthusiast/maker; consistent |
| Clamp-mounted rack collapsed into the derailleur | https://www.bikeforums.net/bicycle-mechanics/671684-no-eyelets-rack-attatchment.html | 2026-10-28 | single forum report: unverified |
| Optima racks rated up to 20 kg on the Stinger and Baron | https://www.manualslib.com/manual/1643398/Optima-Baron.html (manual p.17) | 2026-10-28 | maker manual; the user reports its rack pages show a different bike (round 5), so no Baron rack is shown |
| Optional Baron rack sturdy enough for a clothes bag and a laptop bag | https://ligfiets.net/bicycles/25 (owner review 2003) | 2026-10-28 | owner review |
| Baron has no rack eyelets (older version) | https://www.bentrideronline.com/?p=1495 | 2026-10-28 | review; the user's bike has holes |
| A Baron owner fitted a cheap adjustable rack to the mudguard lugs; "wouldn't want to put much weight on it" | https://www.cyclechat.net/threads/optima-baron-lowracer.204189/ | 2026-10-28 | single forum report: unverified |
| Optima Lowracer bag made for the Baron, €39.95 | https://www.ligfiets.shop/en/optima-lowracer-bag.html | 2026-10-28 | seller, single |
| Baron: oversized 7005 aluminium frame, unsuspended; Low Baron 26/20, High Baron 28/28 | https://ligfiets.net/bicycles/25 ; https://ligfiets.net/bicycles/612 | 2026-10-28 | two listings, consistent |
| Topeak Uni Super Tourist DX 2.0: 26 kg (EN 14872), legs adjustable 24"–29", disc and non-disc versions | https://www.rosebikes.com/p/topeak-uni-super-tourist-dx-20-non-disc-rear-rack-2714195?product_shape=42 ; https://biketart.com/products/topeak-uni-super-tourist-dx-2-0 ; https://www.bike24.com/p2984546.html | 2026-10-28 | three retailers, consistent |
| Tubus Cargo Evo: 26 vs 40 kg listed; 26 and 28 inch versions; struts adjust forward/back | https://www.bike24.com/p234415.html ; https://www.galaxus.at/en/s3/product/tubus-cargo-evo-luggage-carrier-26-luggage-racks-10209144 ; https://www.campfirecycling.com/product/tubus-cargo-evo-rear-rack-p-2673.html | 2026-10-28 | retailers disagree on rating; both above the load |
| Tubus seat-stay clamps: 14–25 mm, rack on outer hole, spreads load around the stay; not for carbon; don't overload | https://www.campfirecycling.com/product/tubus-seat-stay-mount-p-1035.html ; https://condorcycles.com/products/tubus-clamp-set-for-seat-stay-mounting ; https://www.sjscycles.co.uk/carriers-racks/14mm-tubus-clamp-set-rack-eyes-for-seat-stay-mounting/ | 2026-10-28 | three retailers; no official load limit |
| Dropout-mounted rack carries the weight; upper attachment to stays or brake bosses | https://www.cyclinguk.org/cycle/rack-ruin ; https://www.campfirecycling.com/product/omm-white-rock-rear-rack-p-1132.html | 2026-10-28 | two sources, consistent |
| Recumbent seats have no seat post; racks often fixed to seat support struts (Tour Easy) | https://softsolder.com/2009/04/09/tour-easy-%ef%bb%bfrack-mounting-hack/ | 2026-10-28 | single owner write-up |
| Topeak Uni Super Tourist DX 2.0 costs ~€48–65 plus €4–10 shipping | https://www.rosebikes.it/topeak-uni-super-tourist-dx-20-non-disc-rear-rack-2714195 ; https://www.bike-mailorder.com/en/products/uni-super-tourist-dx-2-0 ; https://tormino.com/products/topeak-achterdrager-uni-super-tourist-dx-2-0 | 2026-10-28 | several retailers, consistent |
| Tubus seat-stay clamp pair ~€12–24 (Galaxus snapshots), £8.50 (Spa Cycles) | https://www.galaxus.de/en/s3/product/tubus-pair-of-clamps-for-attachment-to-seat-stay-diam-14mm-bike-luggage-accessories-431804 ; https://www.spacycles.co.uk/m5b0s215p2033/TUBUS-Seat-Stay-Clamp-Set | 2026-10-28 | snapshots of differing dates: price unverified |
| XLC RP-R02 and Procraft ProTourer: 26–28", 25 kg, ~€21–22 | https://bike-components.de/en/XLC/RP-R02-Rear-Rack-for-26-28-p4507 ; https://bike-components.de/en/Procraft/ProTourer-Rack-for-26-28-p21009 | 2026-10-28 | single retailer: unverified |
| ROSE Grand Tour AL: 26/28", 25 kg, adjustable height, ~€29 + €9.95 shipping | https://www.rosebikes.it/rose-grand-tour-al-rear-rack-641575 ; https://www.rosebikes.es/rose-grand-tour-al-rear-rack-641575 | 2026-10-28 | one retailer, two country sites |

## Round checklist
Checklist:
- [x] Log (first round): its path in the report; new or resumed, and what was outdated: n/a: not first round
- [x] Problem and success criteria (first round): stated without solution words: Problem updated (seat-bracket holes unusable)
- [x] Scope: split, widened or unchanged: unchanged
- [x] Requirements: new or changed ones, each a need (no mechanism) with reason, source, priority and verified: R11 added (verified must), R9 verified should, R10 assumption
- [x] Replaced requirements: new IDs, old rows moved; options re-checked from the old matrix column: n/a: none replaced
- [x] Written requirements: evidence found for each (commit, decision log): n/a: none written
- [x] Deciding unverified requirements: asked this round, or assumptions after "can't answer": R10 can't answer → assumption; stays asked
- [x] Options: added, by the categories of Phase 3: O3s (stay clamps), O17 (main-tube clamp)
- [x] Searches: recorded in the round's entry; or "no web search", said in the report
- [x] Deciding claims: cross-checked against a second source, or marked unverified
- [x] Matrix: updated
- [x] Rejection records: one per trailing or not applicable option (scenario, best variant, leader's cells compared)
- [x] Harms: scenarios for the leading option
- [x] Reversibility: every option rated; one-way means extra stress-testing, said in the report: O3s cheap
- [x] Draft and stress test: of the leading option; the draft's path in the report: fitting-plan.md updated
- [x] Bias check: findings in the log and the report; or "not independent"
- [x] Rejection check: findings in the log and the report; verdicts corrected
- [x] Ranking change: recorded
- [x] Report: what changed, recommendation, runner-up, must rejections, the checks' findings
- [x] Questions: deciding unverified ones first, ordered by ranking impact, through the question tool, remarks last: stays, manual, budget
- [x] Pushback: if the user picked a worse option, asked what makes it better: n/a: user corrected a fact, not picked an option

## Rounds
- Round 1: first options from web search; after the checks, O9 (underseat + light rear rack) provisionally leads, O2
  and O1 runners-up; all depends on the bike model.
- Round 2: bike is an Optima Baron low racer, two bags < 15 kg, handling must stay safe: O1 Optima's own Baron rack
  leads, O12 Optima Lowracer bag runner-up.
- Round 3: no rack, threaded holes, hook panniers, no permanent changes: O5/O8 out; R10 added; O3 universal rack leads,
  O1 and O16 runners-up.
- Round 4: holes at dropouts and seat bracket, self-fit, R5 hard limit, user says no Optima Baron rack existed: O1
  out; O3 (Topeak Uni Super Tourist DX 2.0) leads, O16 custom rack runner-up (close after the rejection check);
  draft decision written.
- Round 5: seat-bracket holes unusable for struts (R11): O3 not applicable; O3s (struts clamped to the rear stays)
  leads if the Baron has stays, O16 custom rack otherwise; R9 keep panniers verified.
- Round 6: the Baron has round rear-fork tubes; careful clamps accepted under R2b; manual shows no Baron rack. No
  new requirement, no ranking change: stop condition met; decision drafted for review.
- Review: user adds a budget under €50 (R12, must): rack changes to a ~€21–29 model rated 25 kg; O16 not
  applicable; fallback becomes a second-hand rack or the Optima Lowracer bag (O12). Leader O3s unchanged.
- Review: user already owns a sound rack that fits the dropout lugs: it replaces the bought rack; only clamps and
  bolts to buy. Leader O3s unchanged.

## Decision
Reviewed (2026-10-28)

Decision checklist:
- [x] Stop condition: no new requirements, no ranking change, nothing deciding left unverified: round 6; R6, R8, R10 assumptions
- [x] Why and Rejected: each on a requirement the user confirmed; confirmed by the user: at review ("Yes, it's complete")
- [x] Known gaps and open child decisions: listed in *Decision*
- [x] Documentation: updated where the rule takes effect; overstated requirements corrected; commit message proposed: n/a: no repo or design doc; this *Decision* is the record; fitting-plan.md is the rule where it takes effect
- [x] Success criteria: carried over only as project rules: n/a: none; the loaded test stays in fit-check.md
- [x] Out of scope: noted where open work is kept: n/a: none found
- [x] Overview: choice, pros and cons, rejected, gaps, plan, files
- [x] Review: in open chat; nothing implemented before it: amended for budget (R12), own rack, 350 mm struts; user confirmed complete

**Choice (O3s)**, amended at review: the user's own sound rack, which fits the Baron's dropout lugs (user, review).
Its legs bolt to the threaded holes at the rear dropouts and carry the weight. The rack's own struts are far too short to
reach the rear-fork tubes (user, review); the platform has holes/tabs for struts. So two longer struts (e.g. Tubus aluminium strut, 8 mm, M5 eye, 240 or 350 mm, ~€3–4 each) run from
the front of the rack platform to the round rear-fork tubes, fastened there with Tubus seat-stay clamps (~€10–24 a
pair; size to the tube). Strut length needed: about 35 cm (user, review), so two Tubus 350 mm struts; the
rack's own struts are round bent rods with flat drilled ends and can't be overlapped, so they aren't reused. Before
ordering, measure hole centre to hole centre exactly and check with the seller whether 350 mm is measured between
hole centres; if a few mm short, the clamp can be moved along the tube or turned so its outer hole points towards the
rack (unverified). Earlier alternatives, if it were longer:
lengthen the rack's own struts with a bought strut overlapped and joined by two M5 bolts (if the own struts are flat
with holes), or order perforated steel mounting strip online; the user has no easy access to bar stock (review). No
strut longer than 350 mm found for sale (search, review). Clamp the struts as high on the fork tubes as possible, so they stay short and steep. The user's own hook panniers hang on it. Fitted by the user per
`fitting-plan.md`, checked loaded per `fit-check.md`. Cost: struts, clamps and maybe stainless M5 bolts, about
€15–35.

**Why** (each on a verified requirement):
- R2b (must, round 2/5): nothing drilled, welded or bent; bolts in existing holes and removable clamps.
- R11 (must, round 4): no load through the seat mounting; the struts brace from the rear-fork tubes next to the rack.
- R3c (must, round 1): the user calls the rack sound; its rating is unknown (known gap) vs under 15 kg.
- R12 (must, review): only clamps and bolts to buy, ~€10–25.
- R5 (must, round 3): panniers behind the seat, away from the feet at the front cranks and from getting on in front.
- R9 (should, round 4): the user's own panniers.
- R7b (should, round 3): fitted by the user with hex keys.
- R4b (must, round 1): fits the Baron's dropout holes and round rear-fork tubes, pending the measurements in
  `fitting-plan.md`.

**Rejected** (each with the requirement it fails):
- Struts to the seat-bracket holes (O3): too far forward and part of the seat mounting (R11).
- Optima's own rack (O1): none exists for the Baron per the user and the manual (R4b).
- Seat-mounted racks (O5), welded or brazed mounts (O8): permanent changes (R2b).
- Clamps as the rack's only mounts (O4): the clamps would carry the whole load; the dropout holes do that better (R2b
  risk higher than O3s).
- Struts clamped to the main tube (O17): long, flat struts, the same weakness as the seat-bracket holes (R11).
- Buying a rack (Topeak ~€48–65; budget 25 kg racks ~€21–29): not needed, the user owns one that fits (R12, and
  the simplest option: reuse what is there).
- Custom rack (O16): far over €50 (R12).
- Optima Lowracer bag (O12): replaces the user's panniers (R9); capacity unknown (R3c); kept as fallback.
- Underseat (O2, O9) and front racks (O10): no Baron product; custom work; fit unknown (R4b, R7b).
- Small bags (O6): too small (R3c). Backpack (O13): pressed against the seat (R5). Trailer (O7): longer rig, hitch fit
  unknown (R5, R4b). Different bike (O11): not the user's Baron (R4b).

**Fallback** (if the rear-fork tubes are outside 14–25 mm or not round there, the struts meet them at a flat angle, or
the rack top doesn't clear the seat): first a second-hand rack whose struts reach better, within budget; otherwise the
Optima Lowracer bag (€39.95), giving up the user's own panniers (R9). A struts problem may also be solved by
longer or re-bent struts for the user's rack (a few euros), if its maker allows bending.

**Known gaps**:
- Handling loaded (R1) has no source; the loaded test in `fit-check.md` decides.
- Rear-fork tube diameter and strut angle unmeasured (`fitting-plan.md` step 3).
- No official load limit for the Tubus clamps (three retailers, none gives one); they brace, the legs carry the load.
- The user's rack: load rating, strut reach to the rear-fork tubes, and rail diameter for the pannier hooks not
  known to the research; checked in `fitting-plan.md` and the loaded test. A rating marked on the rack (often on
  the platform, with EN 14873 / ISO 11243) settles R3c.
- No independent bias/rejection check ran on this amendment; it changes the rack model and fallback, not the
  ranking.
- Assumed: budget and wait for the fallback acceptable (R10, user didn't know); quick removal (R6) and dry/theft-safe
  (R8) not important (user had no remarks).

**Plan**:
1. Measure (`fitting-plan.md`, "Before buying"): seat clearance, rear-fork tube diameter and strut angle, bolt size,
   brake type.
2. Buy two struts of the measured length and the Tubus clamps in the measured size (and stainless M5 bolts).
3. Fit (`fitting-plan.md`, "Fitting").
4. Loaded test (`fit-check.md`); re-tighten after 50 km.
5. After a few weeks of use: tell me what using it showed (clamp slip, handling, clearance); then amend this decision
   or reopen a round.

# Recumbent luggage carrying: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|

## Round 1
Framed the problem without "rack" (the user's mechanism): carry luggage on a recumbent safely. All requirements
inferred (R2-R6) or open (R1, R7); no user answers yet. Discovery: three generators (own field: recumbent cycling;
far fields: moto, pack animals, aviation, prams/wheelchairs, kayaks, military; inverted/wider: logistics, ergonomics,
product design). Design-space map showed an empty axis, the attachment interface (where the rack's load enters the
frame), which is the literal question; a fourth generator on that lens added axle mounts, tube clamps, added bosses
and the sprung-vs-swingarm choice.

Ranking before checks: O1 (maker's model-specific rack on designed mounts) leads on R2, R3, R5; O2 (under-seat
midship rack) runner-up. After checks: O1 leads narrowly (R2, R3 now ~); O2 and O20 (hybrid split) runners-up, O10
(trailer) co-runner-up for heavy loads. The bike model and the load are the deciding unknowns.

Checks:
- Rejection check: O1 was scored too kindly (lower bolts loosen and seat-angle clearance are its costs too, so R2 and
  R3 became ~); O10 was rejected on a stretched R6 (length isn't getting on and off) → new R8 for size/storage; O2's
  best variant leaves O1 ahead only on the assumed R1 load; O6's best variant meets R5; O4/O14/O12 cited R7 for
  availability or lock-in, which no requirement covers; several matrix cells contradicted records. All corrected.
- Bias check (saw *Options* before listing its own; not fully blind): missing options O18 (boom/tiller bag), O19
  (seat as the carrier), O20 (hybrid split), O1 variant (used/sibling maker rack) → added. R5 assumed a warranty and
  a mount → reworded; R6 narrow → reason narrowed; success criteria assumed a mounted carrier → reworded. Missing
  requirements: parking/stand, bag removal, weatherproofing, theft, width/length → R8 added (size, storage,
  parking); others asked as remarks. Doubts: no maker document found for "heavy items midship" (marked unverified);
  under-seat rack failure on tour; BOB Yak fits 20" wheels but not thru-axles.

Searches (all by generator subagents, web search):
- G1 own field: recumbent maker accessory pages (HP Velotechnik, Azub, Cruzbike, ICE, Bacchetta/T-Cycle, RANS, M5,
  Thor), BentRider and Cruzbike forums on racks, underseat racks, tailboxes, trailers; ISO 11243; Ortlieb/Arkel
  recumbent panniers; TerraCycle Cargo Monster. Two Cruzbike pages hit HTTP 429 (snippets only). Nothing found for
  Nazca, Optima, Challenge, M5 rack fitment.
- G2 far fields: Giant Loop rackless saddlebags; horse/mule pannier balancing; BHTA wheelchair stability, pram
  baskets; MOLLE/PALS; SW-Motech tank ring, scooter receiver, Fidlock; kayak deck rigging, P-clips, ROK straps;
  Cessna cargo pods, NASA pod drag; pulks; takkyubin; glider weight and balance; EN 12195 lashing.
- G3 inverted: Radical Design pods; HP/Cruzbike underseat; fairings/velomobiles; BOB Yak; Carry Freedom + Weber;
  hip packs (Ergon, Cycling UK); custom frame bags; luggage-transfer services.
- G4 attachment interface: HP Velotechnik, Azub, Cruzbike, Bacchetta racks; Old Man Mountain, Tailfin, Tubus axle
  and clamp mounts; rivnuts (bikepacking.com), Tailfin bosses; swingarm vs frame threads (BentRider, Cruzbike,
  endless-sphere); Weber/BOB hitches; failure reports (cyclechat, endless-sphere, Cycling UK, Cruzbike, BentRider).

## Round 2
Answers (verbatim in `replay.md`): known make/model; commute/shopping <15 kg; "I already have a rack, but other
options are fine too I suppose."; "The bike is an Optima Baron".

Learned: the Baron's manual (pp. 11-12) names the rack points: "The rack fixes to the frame using the upper seat
fixtures and the bolts half way down the seat support tube", and says the bolt holes at the top of the swingarm above
the dropouts are "similar to normal bike rack mount points, but not to be used for racks". One Baron owner did
exactly that (mudguard lugs + headrest cable-tie) and wouldn't load it much. Problem changed (specific bike), so one
generator re-ran with a lowracer-owner lens.

Ranking: O1 → the maker's points; leads narrowly. After checks: O8 tied on requirements (O1 ahead only on R9),
O23 and O4b close, O21 trailing.

Checks:
- Rejection check: O1's R2/R5/R6 were ✓ despite its own harms (adapter struts, shared 6 Nm seat bolts, load high
  behind the seat) → ~; O8's R4 ✗ vs O1's ~ was unsupported → ~, O8 now tied; R9 (preference) and "overkill" used as
  reasons → tie-breaker only; O4 variant fully on the swingarm missing → O4b added; O14/O15 cited open R7 for
  availability → reworded; O11 reason → R1 capacity.
- Bias check: "sprung main frame" for the seat support tube is the researcher's inference (F7); the manual covers
  several models; F5 torque from garbled text; no rack load rating; R1 lacks volume; R4 likely overstated for a
  lowracer; R6/R8 never asked; missing options low side pods (O22) and a shop-made lowracer rack (O23) → added.

Searches: "Optima Baron recumbent lowracer rack luggage"; "Optima Baron ligfiets bagagedrager" (nothing);
manualslib Baron manual pp. 11, 12 (WebFetch); "Optima Baron lowracer specifications"; "Optima Baron rear suspension
swingarm" (nothing); BentRider review search (403 on threads). Generator 5 (lowracer lens): CycleChat Baron thread,
BentRider lowracer rack threads (403), Radical Design, ligfiets.shop Optima parts, M5 tailboxes, Nazca rack, trailer
hitch height threads.

## Round 2 tables (superseded in round 3)
### Options
Round 2 scores the options for the Optima Baron (F1-F6) and a load under 15 kg. Design-space map as in round 1, plus
the axis that now decides most: which part of the bike carries the rack, the sprung main frame and seat (O1) or the
swingarm (O21, O4), or both at once (O21 as built by one owner).

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O1 | The maker's mounting: the rack fixed to the upper seat fixtures and the bolts half way down the seat support tube (F4). With the user's own rack: an Optima rack bolts on directly; a generic rack needs its struts adapted (lengths, spacer plates) to reach those points. Variant: Stinger-style, bolted to the seat with 4 bolts | Points the maker chose for a rack (R2, R5); reuses the user's rack after adapting (R9) | Optima racks only second-hand (F6); a generic rack needs home-made adapter struts, the new weak point (R2), and fabrication effort (R7); the rack shares the seat bolts limited to 6 Nm, so the seat interface carries the load (R5, no rating in the manual); seat-angle changes (F5) move the rack; load high behind the seat (R4, R6) | cheap | runner-up |
| O23 | A rack made for this seat geometry, bought or commissioned from a recumbent shop or another lowracer maker (Dutch ligfiets shops), on the F4 points | As O1 without home-made struts (R2) | Cost and search effort (R7); doesn't reuse the owned rack (R9) | cheap | trailing (R7, R9) |
| O22 | Low side pods or panniers hung on each side of the seat beside the rear wheel, from the seat mounts or rack points (Radical side pods, M5/Flevo-style low seat racks) | Load lower than a rack top (R4) | Close to the rear tyre and the swingarm travel (R3); load into the seat mounts (R5); fit per seat | cheap | trailing (R3) |
| O21 | Keep the current mount (status quo, F8): the generic rack on the mudguard lugs above the dropouts, its top fixed to the seat/frame; improved where it is weak (bolt size and threadlocker, a proper upper bracket instead of ties) | Already fitted and has held (R2, user evidence); no cost (R7); reuses the rack (R9); no suspension, so no binding (F2) | Maker: lugs "not to be used for racks" (F3), likely light-duty threads (R5, unverified); unknown upper fixing; one other owner "wouldn't want to put much weight on it" | cheap | leading |
| O7 | Bags slung over the hardshell seat back, no rack (Radical Design Racer/Banana Racer, narrow version for hardshell seats) | No frame work; light; low cost (€100-200); made for lowracers | ~25 L per pair, a few kg (R1 for shopping); load into the glass-fibre seat shell (R5); bags must clear the rear tyre right under the seat (R3); can sag to one side | cheap | trailing (R1) |
| O8 | Tail bag or tailbox on the seat back (Optima Lowracer bag €40 from ligfiets.shop, fit unconfirmed; M5 boxes) | The lowracer's own solution; 20-88 L; nothing near the wheel (R3) | Load high and behind (R4, shared with O1); side wind; fit per seat; load into the seat (R2, R5) | cheap | trailing (R2, R9) |
| O10 | Trailer for shopping trips, hitched at the rear axle | Takes the load off bike and seat; left at home when not needed | Length (R8); hitch height on a very low bike unconfirmed; axle hitch sits on the swingarm (unsprung, fine) | cheap | trailing (R8) |
| O3 | A generic rack on points other than the maker's (e.g. lengthened struts to arbitrary frame points) | Cheap | Unrated points (R2, R5); the maker's points exist, so nothing gained over O1 | cheap | trailing (R2, R5) |
| O4 | The generic rack's legs moved from the mudguard lugs to the rear axle (Tubus QR/axle adapters, OMM-style axle studs), top unchanged | Axle stud carries the load instead of a small bolt in shear (R2); doesn't use the F3 lugs (R5); reuses the rack (R9); no binding now (F2) | Adapter must match the Baron's axle/QR and the rack (Tubus QR adapter: Tubus racks only, 25 kg, 130/135 mm hubs) (R7, R9); legs may need re-bending (R3) | cheap | runner-up |
| O4b | (Merged into O4 since F2: no suspension, so O4 already covers it.) Axle-mounted rack fixed to the swingarm only (axle studs plus an upper link on the swingarm, not the seat), so the rack moves with the wheel | No binding; doesn't use the F3 lugs; load off the seat (R5) | The rack rises toward the seat at full compression (R3); unsprung mass (no requirement); a kit matching the Baron's axle (R7); doesn't reuse the owned rack (R9) | cheap | trailing (R3) |
| O5 | Tube clamps for a rack | Cheap | Clamps on thin 7005 tubing (R5); slip (R2); not needed, the maker's points exist | cheap | trailing (R2, R5) |
| O6 | Added bosses (rivnuts, welds) | Permanent | Drilling or welding 7005 aluminium (R5); not needed | one-way | trailing (R5) |
| O2 | Under-seat (midship) rack | Load low and central (R4) | A lowracer seat sits too close to the ground and the swingarm for panniers below it (R3) | cheap | trailing (R3) |
| O20 | Hybrid split (heavy items midship) | — | Needs O2's midship space, which a lowracer lacks (R3) | cheap | trailing (R3) |
| O13 | Front lowrider on the 20" fork | — | Little ground and heel clearance on a lowracer (R3) | cheap | trailing (R3) |
| O9 | Strap-on frame and boom bags | Cheap | A few litres (R1) | cheap | not applicable (R1, core) |
| O11 | Worn by the rider: sling, messenger or hip bag (a backpack can't sit against the seat) | — | A few litres to ~15 L, not a 15 kg shopping load (R1) | cheap | not applicable (R1, core) |
| O16 | Do nothing / process (leave things at work, delivery) | No hardware | Shopping still needs carrying (R1) | cheap | not applicable (R1, core) |
| O18 | Boom or tiller bag | — | Small items only (R1) | cheap | not applicable (R1, core) |
| O14 | Longtail extension | — | Not made for the Baron (availability, no requirement); length (R8) | costly | trailing (R8) |
| O15 | Change vehicle / second utility bike for shopping | Most room | A second bike (R7, still open) | costly | trailing (R7, open) |
| O19 | The seat as the carrier | — | Merged into O1 for the Baron: the maker's points are the seat fixtures (F4) | — | merged into O1 |
| O12 | Quick-lock bag adapter | — | Add-on on top of O1 | cheap | add-on |
| O17 | Written max load and placement | — | Add-on to O1 | cheap | add-on |

### Matrix
| Option | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|
| *status* | core | core | unverified | unverified | unverified | unverified | open | unverified | preference | |
| O1 | ✓ | ~ | ✓ | ~ | ~ | ~ | ~ | ✓ | ~ (generic rack needs adapting) | ~ R2, R4, R5, R6, R7, R9 |
| O23 | ✓ | ✓ | ~ | ~ | ~ | ~ | ~ | ✓ | ✗ | ~ R3, R4, R5, R6, R7 |
| O22 | ~ | ~ | ✗ | ✓ | ~ | ✓ | ✓ | ✓ | ✗ | ✗ R3 |
| O4b | ✓ | ~ | ~ | ~ | ✓ | ✓ | ~ | ✓ | ✗ | ~ R2, R3, R4, R7 |
| O21 | ✓ | ✓ (held so far) | ✓ | ~ | ~ | ~ | ✓ | ✓ | ✓ | ~ R4, R5, R6 |
| O7 | ~ | ~ | ~ | ~ | ~ | ✓ | ✓ | ✓ | ✗ | ~ R1, R2, R3, R4, R5 |
| O8 | ✓ | ~ | ✓ | ~ | ~ | ~ | ✓ | ✓ | ✗ | ~ R2, R4, R5, R6 |
| O10 | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ✗ | ✗ | ✗ R8 |
| O3 | ✓ | ~ | ~ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ~ R2, R3, R4, R5 |
| O4 | ✓ | ✓ | ~ | ~ | ✓ | ~ | ~ | ✓ | ~ (Tubus adapters fit Tubus racks; others need a matching QR adapter) | ~ R3, R4, R6, R7, R9 |
| O5 | ✓ | ✗ | ~ | ~ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ R2, R5 |
| O6 | ✓ | ~ | ~ | ~ | ✗ | ✓ | ~ | ✓ | ✓ | ✗ R5 |
| O2 | ~ (small bags fit under a low seat, if any) | ~ | ✗ | ✓ | ✓ | ✓ | ? | ✓ | ✗ | ✗ R3 (inferred) |
| O20 | ✓ | ~ | ✗ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✗ R3 |
| O13 | ~ | ~ | ✗ | ~ | ? | ✓ | ? | ✓ | ✗ | ✗ R3 |
| O9 | ✗ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ R1 |
| O11 | ✗ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ✓ | ✗ | ✗ R1 |
| O16 | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ R1 |
| O18 | ✗ | ~ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ R1 |
| O14 | ✓ | ✓ | ~ | ~ | ~ | ~ | ? | ✗ | ✗ | ✗ R8 |
| O15 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ? | ~ | ✗ | ? R7 (open) |

### Evaluation
The bike and load answers decided most of round 1's open cells. The Baron is a lowracer with a sprung swingarm, and
its manual names the rack's mount points (F4) and says the swingarm lugs are not for racks (F3). R2-R5 are still
unverified (inferred), so the rejections below are trailing, not not applicable; only R1 is core.

Round 3: with no suspension (F2), the user accepting a maker-advised-against mount if it holds (R2 core, R5
reworded) and the current mount having held (F8), the status quo O21 leads: ~ R4, R6 (shared with O1 and every rear
rack), ~ R5 (F3 lugs, likely light-duty; unverified). O4 (legs to the axle) is runner-up: same top, a stronger
lower load path, small cost. O1 is now runner-up too: it trails O21 on R2 (~ adapter struts vs ✓ evidence), R7, R9.
What the user dislikes about the current mount is unknown and could reorder all three.

Round 2 note, kept for history in the rounds file: O1's cells before round 3 (corrected after the round 2 rejection check): ~ R2 (home-made adapter struts for a
generic rack); ~ R3 (clearance over full suspension travel and after seat-angle changes); ~ R4 and ~ R6 (load high
behind the seat); ~ R5 (shares the 6 Nm seat bolts; no rated load in the manual); ~ R7 (fabrication effort); R9 ~ if
the rack is generic. Its lead now rests on: the maker named these points for a rack (F4), and it reuses the owned
rack (R9, a preference: tie-breaker only). The sprung-frame location is inferred (F7).

Rejection records:
- **O21 (the obvious upright-bike mount)**: R2 "stays attached under riding loads" and R5 "frame keeps its strength":
  the maker says the swingarm lugs are "not to be used for racks" (F3, single maker source). R3 and R2 again: a rack
  fixed low to the swingarm and high to the sprung seat spans the suspension; scenario: on every bump the swingarm
  rotates against the seat, so the rack either flexes and fatigues (cable ties, M6 bolts loosen) or stiffens the
  suspension. Checked against other requirements: none accepts this. Best variant: rack fixed to the swingarm only
  (both ends), which removes the binding but leaves F3, adds unsprung mass, and needs a rack shaped to the swingarm;
  no such rack found. Compared with O1: worse on R2, R3, R5; equal on R1, R6-R9.
- **O1 (runner-up, round 3)**: R2 "stays attached": a generic rack needs home-made struts to reach the F4 points,
  a new weak point, where O21 has a record of holding. R7: fabrication effort. Compared with O21: worse on R2, R7,
  R9; equal on R4, R5, R6. Wins if the lugs prove weak or the current upper fixing is the problem.
- **O4 (runner-up, round 3)**: R7: an axle adapter to buy and fit; R3: legs re-bent to the axle may come closer to
  the tyre or chain. Compared with O21: better on R5 (no F3 lugs); worse on R3, R7. Wins if the lugs prove weak.
- **O8 (trailing, round 3)**: compared with O21: same ~ R4, R5, R6; worse on R2 (seat-hung) and R9. Previously tied
  with O1: both ~ R2, R4, R5, R6; O8 is ✓ on R3 where O1 is
  ~, and ✓ on R7 where O1 is ~. Only R9 (preference, the owned rack) puts O1 ahead: a tie-breaker. Best variant: a
  tailbag on the seat back sized for shopping. Wins if the owned rack can't be adapted.
- **O23 (runner-up)**: as O1 with a made-to-fit rack instead of home-made struts (✓ R2); loses only R9 and costs
  more (R7, open). Wins over O1 if the owned rack is a generic upright rack.
- **O7**: R1 "carries commute and shopping luggage up to ~15 kg": ~25 L per pair is tight for shopping. Shared with
  O1: load through the seat (R5), clearance (R3). Best variant: the user's rack as a support for slung bags, which
  removes most of the R2/R5 concern (that is then O1 with soft bags). Compared with O1: worse on R1; R9 tie-breaker.
- **O22**: R3: low pods hang beside the rear tyre and the swingarm travel. Compared with O1: ✓ R4 where O1 is ~;
  ✗ R3 where O1 is ~. Wins if clearance can be confirmed on the bike.
- **O4b**: R3: a rack fixed to the swingarm rises toward the seat at full compression; a lowracer seat sits close in
  front of and over the wheel (inferred). Compared with O1: ✓ R5 where O1 is ~; same ~ R2, R3, R4, R7; ✗ R9.
  Unsprung mass is covered by no requirement. Close: it wins if F7 is wrong (seat support tube on the swingarm) or
  the seat interface proves weak.
- **O10**: R8 (unverified, inferred): length. Best variant: a trailer for shopping trips only, O1 or nothing for
  commuting. Compared with O1: ✓ R2, R3, R5 where O1 is ~; ✗ R8 (unverified). Becomes a runner-up if R8 is not a
  need.
- **O3**: R2, R5: points the maker didn't choose, when the maker's points exist. Compared with O1: worse on R2, R5;
  nothing better.
- **O4**: R2, R3: the axle is on the swingarm, so a seat-braced axle rack spans the suspension like O21.
- **O5, O6**: R2/R5 on thin 7005 tubing, and nothing gained: the maker's points exist.
- **O2, O20, O13**: R3: a lowracer has no room below the seat or at the front fork for panniers.
- **O9, O11, O16, O18**: not applicable (R1, core): they can't carry a shopping load.
- **O14, O15**: R7: not made for the Baron / a second vehicle.

Harms of the leader (O21, round 3), a few steps ahead:
- The mudguard lugs are likely M5 and meant for light rods (F3): a heavier shopping load than so far, or a pothole,
  strips or shears them; the rack then drops onto the tyre (R2). Mitigation: steel bolts, threadlocker, a check
  every few months; switch to O4 if a thread loosens.
- Aluminium lug threads wear with repeated removal; a stripped thread means a helicoil or O4/O1.
- The upper fixing is unknown; if it is cable ties or a clamp on the seat, it is the likelier failure point.
- "Has held so far" covers the loads carried so far; 15 kg shopping may be more than that.

Harms of O1 (round 2 leader), a few steps ahead:
- The user's rack, if generic, gets home-made adapter struts; a weak strut is the new failure point. Use the rack
  maker's strut kit or flat steel plate of the original strut's section, and threadlocker.
- The seat bolts' 6 Nm limit and rubber spacers (F5): the rack shares those bolts, so over-tightening to stop rack
  rattle can crack the seat; use longer bolts of the same torque, not more torque.
- Changing the seat angle moves the rack; recheck clearance at full suspension compression after any change.
- If the Baron is sold or replaced, the adapted rack may not fit the next bike (cheap: the rack itself is reusable).

Reversibility: O1 cheap (bolts on existing points). O6 one-way. Nothing else beyond costly.


## Round 3
Answers (verbatim in `replay.md`): generic upright rack; no rear suspension; a maker-advised-against mount is
acceptable "if it holds"; "The bike already has a DIY rack mounted to the mudguard bolts, it seems to have held out
fine."

Learned: the binding argument against the lugs is gone (no suspension); the maker's "not for racks" is a caution, not
a requirement, for this user; a status quo exists (O21). Tubus QR adapter: Tubus racks only, 25 kg.

Ranking: before checks O21 leads, O4 and O1 runners-up. After checks: O21's R2 ✓ was stretched ("held so far" is weak
evidence; upper fixing unknown) and its R7 wasn't free → ~; O21, O24, O1, O23 are close; O21 ahead only on R9 and
effort. O24 (lugs + axle) is the one option ✓ on R2 and R5 while reusing the rack.

Checks:
- Bias check: stale suspension wording (R3, O22, O4b, open questions) → cleaned; the unasked "why change something
  that holds?" is the deciding requirement → asked; "has held" is weak evidence; missing: backup tether, lugs + axle
  hybrid (O24), owned bags, inspection step, axle-stud trailer → added; R9 named the mechanism → widened to owned
  gear; R1 lacks volume.
- Rejection check: O21 R2 and R7 too kind → ~; O3/O5/O6 rejected partly on "maker's points exist", which the leader
  violates too → dropped; stale O21/O4/O4b records → round 2 tables moved here; O22 ✗ on swingarm travel → ~; O16
  failed the Problem, not R1 → reworded; O14 R7 vs R8 mismatch → fixed.

Searches: "Tubus quick release adapter rack mount bike without eyelets axle" (bike-components, campfirecycling,
rosebikes, SJS).

## Round 4
Answers (verbatim in `replay.md`): "It sways, rattles or sits badly", "It's badly made and badly mounted, I'm worried
it's going to fall apart soon."; top fixed to a frame tube; no remarks.

Learned: the user's reason to change is the deciding requirement the first three rounds missed: the current rack and
mount are unsound (R10). Keeping it is out. A generator on "stiff, durable mounting" (structural bracing, preloaded
joints, touring-rack makers, builders) gave: re-mount to the maker's points with triangulated brackets and spherical
washers; axle-mounted OMM/Tailfin; a builder-made rack; a second-hand Optima rack; a trailer; plus braces, seat-collar
eyelets, seat-stay clamps.

Ranking: O21 out; leader a sound rack on the maker's points F4 (O23a second-hand Optima if found; O25 quality rack
with brackets; O23b builder-made); O4 close.

Searches (generator 6): Optima Baron manual listing; softsolder recumbent rack mounting hack; bikeforums eyelet
threads; Cruzbike Q45 rack stabilization; OMM fit kits (bike24, bikepacking.com); Tailfin Journey (tour-magazin);
Marktplaats rack category; Dutch "ligfiets bagagedrager framebouwer" (nothing specific).

Round 4 checks:
- Bias check: missing lowracer seat bags (Radical) checked: ~25 L per pair, R1 volume unknown → O7 R1 ?; diagnose the
  sway's source first → step added; another recumbent maker's rack → O28; F7's second half (do the F4 points exist on
  this Baron) still open → asked; R10 names a symptom (need: trust it won't loosen or break, no distraction) → kept as
  worded, reason states it; the 6 Nm/rubber-spacer conflict → re-read the manual: 6 Nm is the shell bolts, not the
  rack's fixtures → F5 corrected (rounds 2-3 had this wrong).
- Rejection check: O4 ✓ R5 wrong (upper on F4 too) → ~, O4 tied with O25; O1 R3 → ~; O21 relabelled "as is", R2 ~;
  O10 trails only on unverified R8 → asked; O3/O5/O6 split, O6 alone ✗ R5; O24 R10 → ~; O25's R5 cost shared → not
  counted; O8 R2 reason added.

## Round 5
Answers (verbatim in `replay.md`): rack points "Only one / unsure"; "Replace it"; "Buy, I can fit it"; no remarks.

Ranking: O4 (bought axle-mounted rack, upper strut to the one seat fixture) leads; O23a/O28 runners-up if both F4
points exist; O25 and O23b trail on R7.

Searches: "Old Man Mountain Sherpa rack quick release fit kit 26 inch upper strut mounting options recumbent"
(bike24, campfirecycling, steedcycles, oldmanmountain.com): QR kits, pucks, 33 kg; nothing on recumbent fit.

Round 5 checks:
- Rejection check: O4 R7 ✓ too kind (upper bracket to the seat fixture not named) → ~; O4 R10 ~ if its top goes on
  pucks; O3/O5 R10 ✗ unsourced → ~; F7 used as a requirement → stated as a fact to check; R9 ✗ cells on a rejected
  requirement → "–"; O10 trails only on unverified R8 → asked directly; O15 R7 stretched → outside the Problem; O24 R5
  → ~.
- Bias check: missing O29, a quality rack on the lugs + seat fixture (the user accepts the lugs) → added, runner-up;
  resolve F7 with a photo → asked; R7 named a mechanism → reworded; R1 volume and R8 never answered yet used → asked
  directly; rubber spacers in the seat-frame joint could give F4-mounted racks sway (R10, unverified, all F4 options
  alike); R3 heel strike irrelevant on a lowracer rear load (noted); OMM rating assumes rigid upper mounts.

## Round 6
Answers (verbatim in `replay.md`): "Lugs are fine"; two bags (coat, lock, tools; laptop, charger, phone, notebook);
"I have to ride it on bike lanes and through tight corners."; no remarks.

Replaced requirement: R8 "fits where it is kept and how it travels, can be parked loaded" (inferred, round 1) →
"stays as narrow and short as now for bike lanes and tight corners" (user, round 6, core).

Ranking: O29 (quality rack on the lugs + seat fixture) leads on the user's choice of the lugs; O4 runner-up; O10 not
applicable (R8).

Round 6 checks:
- Bias check: diagnose the old sway and find the second maker's point before deciding (cheap) → steps added; a
  seat-mounted lowracer rack (Stinger-style) missing → O30; R8 as worded stricter than the need → reworded; R10 names
  "rack" → noted; O29 "no adapters" holds only for the lower legs; a rigid swingarm may still be pivoted (R5 risk) →
  O29 harm; daily load ~5-8 kg may fit seat bags.
- Rejection check: O29 R7 ✓ while its upper bracket is as unknown as O4's → ~; then O4 leads on scores (✓ R2, R10),
  O29 only on the user's preference → pushback; O3/O5 identical to O29 → variant/fallback; R8 wording beyond the
  user's words, trailer verdict inference → reworded, asked; R9 cells "–"; O29 harms added.

## Round 7 (pushback) and round 8
Answers (verbatim in `replay.md`): "I already have a rack for the lugs, the lugs held fine for years with the DIY
rack."; "Panniers OK, trailer out"; second maker's point "Yes, it's there"; no remarks.

Round 8 checks:
- Rejection check: O25's R5 ✓ contradicted its own row → ~; O29's R5 ~ cited the maker's "not for racks", which R5
  as worded excludes → shared ~ only; O29 R10 ~ leaned on the old setup → ✓; O4's R7 stretched, O25's brackets are
  what R7 names → tie, R7 breaks it; stale records (O25 round 5, O10, O28 F7) → updated.
- Bias check: the table leaned against the lugs despite years of evidence → corrected; O29 should use either maker's
  seat point now that both exist → widened; R4, R6 over-weighted on a lowracer (noted, shared); R1 dropped
  "shopping"; laptop vibration → child decision (bags).

Ranking: O29 leads on tie-breakers (R7, user preference); O4, O25/O28 runners-up.

## Round 9
Answers (verbatim in `replay.md`): "Another rack I own"; "The bolts on the seat support tube are way too far forward
to make a stable strut from the rack to that point."; no remarks.

Checks:
- Bias check: owned rack on lugs + axle variant (noted, O24 with the sound rack); a top stay to the seat itself is the
  usual lowracer way → O29b; R9/R7 stale after F11 → R9 restored for the sound rack; R3 should be about the seat
  back and chain line, not heels (noted); the upper seat fixture is the seat-angle adjustment joint, so a strut
  there may move with it.
- Rejection check: O29 R7 ✓ contradicted its bracket cost → ~; O23a beats O29 on R3 (assumed) with no record against
  O29 → record added, close, O29 ahead on R9; O25/O28 R10 drop is an inference from F11 → marked.

## Round 10
Answers (verbatim in `replay.md`): "The frame tubes of the rear fork would work, the seat itself flexes, so attaching
it to the seat would destroy the mount over time."; bracket or longer struts "Yes"; no remarks.

New: R11 (core): anchors only on parts that don't move relative to each other, not the flexing seat. O31 (owned rack
wholly on the rear fork) leads; O4c close.

Checks:
- Rejection check: R11 stretched to the seat-frame fixtures without a source → O29/O1/O25/O28/O23a trailing (asked);
  O31 R2/R10 ✓ unearned (tube clamp, like the old setup) → ~; no R11 column, O4c row missing → added.
- Bias check: axle + fork-clamp variant (O4c) compared directly; clamps may not fit oval/shaped 7005 tubes; rubber
  lining can creep (fitted metal clamp + shim variant); strut angle to near-level fork tubes may not brace; R11
  named a mechanism → reworded; R3 should be brake and seat-back clearance; rack top vs reclined seat back is a real
  risk.

## Round 11
Answers (verbatim in `replay.md`): "Only the shell flexes"; "Round, steep strut"; no remarks.

Checks:
- Bias check: rubber spacers at the seat fixtures could make O29's top springy (R10, R11); O31's steep strut makes a
  tall narrow triangle whose clamp loads along the tube (creep); missing O32, a top stay bolted to a rear fork bridge
  or hole; a slotted stay handles seat-angle changes.
- Rejection check: O29 ✓ R2/R10 vs O31 ~ for equally untested upper anchors → both ~, tie on core; O23a's R11 record
  stale → close again; R11 column missing; O4c R5 → ~.

## Round 12
Answers (verbatim in `replay.md`): "Yes, with a hole"; spacers "Shell to seat frame"; seat angle "Yes, sometimes";
no remarks.

O32 (owned rack: lugs + top stay bolted through the rear fork bridge hole) leads on every cell.

Checks:
- Bias check: rack top vs reclined seat back is the main unchecked risk for every lug-based upright rack; the bridge
  hole's use (brake or mudguard) unknown; load position relative to the axle matters for a lowracer in tight
  corners; the owned rack's wheel size unknown.
- Rejection check: O32 R5 ✓ unsupported → ~; O29b/O30 not-applicable verdicts may stretch R11 (shell vs mounting) →
  trailing; stale records noted. Leader unchanged.

## Round 13
Answers (verbatim in `replay.md`): clears the seat back; bridge hole holds the mudguard; decision "No": "I do not
have easy access to a long strip of material, and it seems that it might be unstable against sideways movement."

O32 → trailing (R10 sideways, R7); O31 leads.

Checks:
- Bias check: O32 with a short cross-plate on the bridge bolt (two-point top), sharing the mudguard bolt; a central
  stay is standard on uprights (F15 worry maybe overstated); O31's steep clamps load along the tube (slip); R7 named a
  mechanism; R12 may not apply if the rack sits on the frame side of the seat-angle joint.
- Rejection check: O29 ✓ R10 and bolted (F13/F14) vs O31 ~ → O29 ahead on core, O31 only on R12 (preference) →
  asked whether R12 is core; O32 V-strut variant (O32b) avoids both objections → added; O23a's ✓ cells assumed → ~;
  O4c R2 → ~; O29b/O30 record updated.

## Round 14
Answers (verbatim in `replay.md`): V/plate to the bridge bolt "doesn't seem stable either, as sideways movement at the
front of the rack would still only be constrained by one bolt"; refitting after seat-angle changes "Not acceptable".

R12 → core; R10 sharpened (front held sideways by more than one bolt). O31 is the only option meeting every core
requirement; Decision drafted.

Round 14 checks:
- Bias check: O31's clamps are the kind of joint blamed for the old sway (R10 risk at fitting); cross-plate on the
  bridge bolt with two strut landings (the user had already rejected a plate on one bolt: it pivots); "more than one
  bolt" may mean "no play"; bought adjustable stays not listed; fork tube diameter and bridge hole thickness unknown.
- Rejection check: leader holds; R12 rejections rest on the researcher's reading that seat-fixture racks need
  refitting → stated as an inference in Decision; O4, O23b share the failure; Options verdicts and Matrix lag round
  14 (R11/R12 columns missing); O32b + O31 hybrid → recorded as an optional variant.

## Round 15 (review)
Answers: "Yes, confirmed"; a rack on the seat fixtures "just tilts" with a seat-angle change (no refit); no remarks.
Seat-fixture options → trailing on R12, not ruled out. Decision O31 reviewed.

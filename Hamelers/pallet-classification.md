# Pallet classification

## Problem
Confirmed by the user: 2026-11-12
Every pallet that arrives at the classification point must leave it with two judgements attached: which pallet type
it is, and its condition: usable as is, to be repaired, or to be discarded. This must keep up with 1000 pallets per
hour at the peak (one pallet every 3.6 s). Getting the pallets in and out, and acting on the judgement (sorting,
repairing, discarding), happen outside it.

## Situation
- The project is new for Cboost: "our next project" (user, 2026-11-12). No repo or notes exist for it yet (checked
  `~/Cboost`, `~/Cboost/Notes`, 2026-11-12).
- Pallets go in at one end of the machine; the machine decides the type and repair/discard (user, 2026-11-12).
- Input and output handling, and sorting, are done by something external (user, 2026-11-12). What that is, and how it
  receives the judgement: unknown.
- Throughput: 1000 pallets per hour is the peak of the feed, never exceeded, margin included (user, 2026-11-12).
- The project is called Hamelers; its notes live in `~/Cboost/Notes/Hamelers/` (user, 2026-11-12).
- Pallets are classified today by an existing machine (user, 2026-11-12). What is wrong with it (user, 2026-11-12):
  it is too slow for 1000/h; it misclassifies; it can't judge everything, so some checks are left over; it needs too
  much maintenance; and it tells pallet types apart by size only, so types of the same size are not separated
  (inferred from the last point).
- Who the customer is and what reads the judgement: not known yet (user, 2026-11-12). Who runs the machine: unknown.
- Time horizon: a first unit now, then more units or a product line (user, 2026-11-12). Dates: unknown.
- Pallet types: a list that grows over time; adding a type need not be easy (user, 2026-11-12). Which types now:
  unknown. Loaded or empty: assumed empty, since they are checked for repair.
- Usable / repair / discard follow the customer's own rules (user, 2026-11-12). Known so far: four missing posts
  (blocks, assumed) means discard. All other pass/fail criteria are unknown at this stage, but will be known before the design is fixed (user,
  2026-11-12).
- The user values (user, 2026-11-12): easy maintenance:
  at most 3 stops a year, planned and unplanned
  together. The customer does not extend the machine; Cboost adds new pallet types remotely. Low unit cost and fast delivery were not picked.
- A pallet passed that should be repaired or discarded costs about as much as a usable one rejected (user,
  2026-11-12): overall accuracy counts, no lean either way.
- What happens if nothing is done: unknown.

## Related decisions
This log covers the machine's concept: how a pallet's type and condition get sensed and judged at the peak rate,
including how the pallet passes the sensing (that depends on what is sensed). Child decisions it leaves open, each
waiting on this one:
- Interface to the external handling and sorting: what the judgement looks like and how it is passed on. Open;
  waits on the customer, not known yet.
- Software and control stack. Open; waits on this decision ("whatever fits", user 2026-11-12).
- How Cboost adds pallet types and updates remotely (R10). Open; partly decided by this decision.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| R1 | Keeps up with a feed of at most 1000 pallets per hour (peak, margin included) | the feed delivers up to that rate | user, 2026-11-12 | must (as stated) | no |
| R2c | At least 80% of pallets leave with both a type and a condition label; type and condition undecided don't add up. Replaces R2b, R3b | unknown: what the labels are used for downstream | user, round 2 (2026-11-13) | must (as stated) | meaning yes, reason no; per hour or overall: user doesn't know (round 3): known gap, assumed overall |
| R5b | The feed is held up at most 3 times a year, planned and unplanned together; while any part is maintained or cleaned, the point still handles the 1000/h peak | a held-up feed is expensive: lines stop or the customer contract penalises it | user, rounds 1 and 3 (2026-11-13) | must | yes |
| R6 | Tells apart pallet types that have the same size; they differ in construction, marks/brand and material (wood vs plastic, solid vs presswood blocks) | the existing machine types by size only, and that is one of its faults | user, 2026-11-12 (inferred); differences and materials from the user, rounds 1 and 3 | must | yes: the user confirmed it as a must (round 7) |
| R7c | Of the labelled pallets, at most 20% are labelled wrong, both ways weighted about equally. Replaces R7b | the existing machine misclassifies; reason for 20%: not asked | user, round 2 (2026-11-13) | must (as stated) | meaning yes, reason no |
| R8 | Can be maintained by the people who will own it; the customer does not extend it | the existing machine needs too much maintenance | user, 2026-11-12 (corrected: no extending by the customer) | should (as stated) | no |
| R10b | Cboost can add new pallet types after delivery without a site visit: by a remote push where the site allows it, otherwise by an offline package. Replaces R10 | the list of types grows; the customer doesn't add them; some sites forbid remote access | user, rounds 1 and 7 (2026-11-13) | must (as stated) | meaning yes, reason partly |
| R11 | Judges condition by the customer's rules; the full list is known before the design is fixed, only "four missing posts is discard" so far | the customer sets the rules | user, 2026-11-12 | must (as stated) | no |
| R12c | Cboost builds the inspection itself: standard sensors may be bought, no vendor's pallet-specific head, and the learned models are Cboost's own on open-source frameworks (no commercial ML toolkit). Replaces R12b | building inspection and ML know-how is a company goal in its own right | user, rounds 1, 2 and 6 (2026-11-13) | must | yes |
| R13 | The whole project, R&D and the first delivered unit included, fits about EUR 700k and takes about a year | budget and time stated by the user | user, rounds 2-3 (2026-11-13) | must | yes: a hard limit (user, round 7) |
| R14 | The product is simple and cheap to build, install and support per site across a series (the user's reason for one lane; lane count is a design variable under it) | reason given; what breaks without it: not asked | user, round 4 (2026-11-13), reworded round 5 after the checks | should | partly: between one lane and modules, cost decides (user, round 5) |
| R15 | A learned judgement is trained and tested on data that represents operation: the station's own sensors and lighting, and the site's pallet mix and conditions | otherwise the model meets a distribution shift in operation | user, round 4 (2026-11-13) | must (as stated) | no |
| R16 | The judgement uses a learned model (AI) | learned judgement is part of the know-how Cboost wants to build (as R12b) | user, round 5 (2026-11-13) | must | yes |
| R4 | Sorts the pallets, or handles their input and output | done externally | user, 2026-11-12 | won't | no |

## Options
Options from discovery keep their generator ID (reports in `pallet-classification.discovery/`). Many are layers of one concept (sensing, judgement, organisation), so O2 combines them; components are also scored alone.

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O1 | The user's framing: a machine the pallets pass through, which judges type and condition. Its best form is O2 or A1 | the whole need at the point | - | - | its best forms are scored as O2 and A1 |
| O2 | Own build, fixed station (variant of A4 + A8 + A7, with A5/D7 and D4 as extra sensing; round 2: plus a colour camera for material (R6) and O8 for R5b): 3D laser profilers top, bottom, sides, ends and oblique into the fork openings; a per-element component map; type by template match plus mark/QR read; condition by a rule table (data) over the map. Researcher's composite, round 1 | R6 via construction + marks; R10/R11 as data; nothing in the station moves (B7), though the conveyor gap and window cleaning remain R5 risks | months of development; bottom view needs a conveyor gap; centre block needs oblique views (draft); Cboost carries the software; CHEP patent freedom to operate unchecked (via A8) | costly | tied (station design) as its R16 variant: learned type and component detection on 3D + intensity, rule table for condition |
| A1 | Turnkey 3D laser grading station with customer profiles (breeze-PAVE), integrated by Cboost | only product claiming >1000/h (vendor + trade press); A/B/C/defect with customer profiles | vendor quote, likely six figures; who adds types (vendor or Cboost?) unknown; vendor lock-in | costly | not applicable (R12, must) |
| A2 | AI 2D camera booth with attribute type code (Zira; IVISYS, AMS similar) | R6 by construction code; rules in a front end | similar systems 400-800/h (IVISYS), 3 s/pallet (AMS); mostly US stringer pallets | costly | not applicable (R12, must) |
| A3 | SICK PAIS (condition) + PACS (type by branding) building blocks | standard parts, service network; per-element defect limits | PAIS ~500/h (one trade article, unverified); ~$150k bottom-only | costly | not applicable (R12, must) |
| A4 | Own build: laser line profilers + explicit geometric rules | core of O2 | less than O2 (no mark reading, weight or rule table) | costly | part of O2 (not applicable, R16); A7's rule table stays as the layer over learned detections |
| A5 | Type from printed/branded marks or EPAL QR | R6 for marked pallets; R10 as a table entry | no condition; unmarked or worn pallets need a fallback | cheap | trailing (R3) alone; part of O2 |
| A6 | Anomaly detection trained on good pallets per type (HALCON GCAD, Anomalib) | R10: new type needs good examples only | worn, dirty, repaired pallets may raise false alarms (untested); flags deviation, not which rule | cheap | trailing (R11, R7 ?) |
| A7 | Industry criteria (EPAL, ISO 18613) + customer rules as a declarative rule table over components | R11, R10 as data; traceable calls (R7) | needs a component map; rules alone sense nothing | cheap | part of O2 (not applicable, R16); A7's rule table stays as the layer over learned detections |
| A8 | Per-element defect map; the three-way label derived from it (CHEP approach) | rules change without new sensing | patent family US 7958624/8881360/10092987: freedom to operate unchecked | costly | part of O2 (not applicable, R16); A7's rule table stays as the layer over learned detections |
| B1 | Defect map + separate rulebook (lumber grading). Joins O2: same structure as A8 + A7 | as A8+A7 | as A8+A7 | costly | part of O2 (not applicable, R16); A7's rule table stays as the layer over learned detections |
| B2 | Multi-sensor fusion tunnel incl. X-ray density | hidden rot, material types (R6) | X-ray tube, licence, radiation officer (R5, R8); several hundred k EUR | costly | trailing (R5, R8) |
| B3 | Read identity (reverse vending, EPAL QR). Same as A5 | as A5 | as A5 | cheap | trailing (R3) alone; part of O2 |
| B4 | Tap and listen (egg crack, Precigrader) | cracks under dirt | striker wears (R5); signatures learned per type; weak localisation | cheap | trailing (R5) |
| B5 | Tiered screening: automatic level + remote human for the unsure ones | lowers wrong calls (R7) without perfect automation | staff or service for 20-50 reviews/h at a few %; answers within 3.6 s or a divert | cheap | could add if R7b isn't met (no ✗) |
| B6 | Reference library + learned deviation, type definitions pushed centrally (Heuft, TOMRA) | R10 remote, R6 | labelled set per type; learned condition vs explicit rules (R11) | costly | trailing (R11 ~) |
| B7 | Fixed wayside sensors, nothing moves (rail wheel profile) | R5: the station adds no wear part | everything judged from passing views | cheap | design principle, adopted in O2 |
| B8 | Short decision tree with thresholds and an agreed error tolerance (ECB fitness, START) | makes R7 a number and an acceptance test | specification work with the customer | cheap | part of O2 (rule layer) + open question on R7 |
| C1 | Machine first, remote human for the uncertain ones. Same as B5 | as B5 | as B5 | cheap | could add later (same as B5) |
| C2 | Judgement in stages; a slower stage 2 for the doubtful share | each stage sized to its share | doubtful pallets leave without a final judgement; needs a side loop in the external handling | costly | trailing (no ✗; a second stage isn't needed with 20% undecided allowed) |
| C3 | People at the line, machine assists | robust, few stops (R5) | 300-600/h per station: 2-3 stations or staff (R1 per station); fatigue (R7) | cheap | trailing (R1, R7) |
| C4 | Grading as a service: Cboost runs it, customer pays per pallet | puts R5/R7 with the party that can fix them | Cboost carries capital and risk; a business-model choice that fits any machine concept | costly | separate decision (business model), not ranked here |
| C5 | Identity tag travels with the pallet (GRAI, pool marks). Variant of A5 with its own cost | as A5 | suppliers or pools must tag (the chain's cost) | cheap | trailing (R3) alone; part of O2 |
| C6 | Sender or dock declares condition; the point samples | pushes error cost to whoever has the information | not every pallet judged at the point; customer's commercial terms | costly | not applicable (R12b, must) |
| C7 | Type only; repair bench decides condition | fast point no longer resolves hard cases | not every pallet leaves with its condition | cheap | trailing (R3) |
| C8 | Outsource the pallet stream to a pallet-management firm | need disappears for a pallet user | no judgement at the point; Cboost has no machine (tie-break only) | costly | not applicable (R12, must) |
| D1 | Impact-acoustic resonance signature. Same principle as B4 | as B4 | as B4; plant noise | cheap | trailing (R5) |
| D2 | Dual-energy X-ray line scan (baggage style) | sees every nail, block, the hidden centre block; R6 by material | tube consumable, licence, radiation officer (R5, R8); EUR 150-400k | costly | trailing (R5, R8) |
| D3 | Proof-load / stiffness station | usable = carries load | stop + press within 3.6 s (R1 ~); moving parts under load (R5); can break weak pallets | costly | not applicable (R5b, must): stop-and-press in the line |
| D4 | Dynamic weighing as a cheap feature | R6 prior; missing hidden block as weight deficit | moisture confounds; no condition alone | cheap | trailing (R3) alone; part of O2 |
| D5 | Inductive coil array mapping the nails | nail map = type fingerprint and hidden-block evidence; no moving parts | no pallet product; bench test needed; blind to split wood | cheap | trailing (R3) alone; candidate addition to O2 |
| D6 | mm-wave / microwave imaging through wood | licence-free see-through | mm resolution; wet wood; no pallet deployment; EUR 50-200k | costly | trailing (R1 ?, R7 ?: unproven) |
| D7 | Read the pallet's own marking. Same as A5 | as A5 | as A5 | cheap | trailing (R3) alone; part of O2 |
| D8 | Active thermography | hidden near-surface damage | heater; ambient/wetness dependent; no pallet deployment | costly | trailing (R7 ?, unproven) |
| O3 | Two or more slower stations in parallel sharing the feed (bought: A3 x2, A2 x2; own-build lanes are O3a). From the generators' titles; added after the bias check | R1 and R5 together: one lane can stop while the other runs (if a lane stop that doesn't hold up the feed doesn't count: ask) | double cost and footprint (no requirement: tie-break); the external handling must split the feed | costly | not applicable (R12, must); also R5b ✗ for 2x500/h |
| O4 | Upgrade or retrofit the existing machine (add sensing, speed it up). Do-nothing/process category; added after the bias check | no new machine | the existing machine is slow, misclassifies, needs much maintenance, types by size only; who owns it and whether it can be extended: unknown | cheap | not judged yet (ask) |
| O5 | Buy a used complete Euro-pallet sorting line (ABB/CEKAMON on resale.info) | cheap start | the one found: 900-1100 per 8 h shift, robot defect; it is a sorter (R4 won't) | cheap | not applicable (R12, must) |
| O6 | Robot-held 3D camera around a stopped pallet (Solwr Sort, Rob-Spector) | sees every face incl. hidden ones | 300-600/h; a moving robot in the station (R5 ~) | costly | trailing (R1) |
| O7 | Grey-zone lane: certain-usable and certain-discard judged automatically, the doubtful band labelled 'check' | simple automation; R7 for the certain bands | the doubtful band leaves without a final condition (R3 ~) | cheap | part of the leader (the undecided band, R2b/R3b) |
| O8 | Degrade, don't stop (design principle for the station design): overlapping views, windows cleaned and sensors hot-swapped while the line runs; the affected pallets come out 'undecided'; a bypass passes pallets as undecided if the controller fails. Researcher, round 2 | R5b without a second lane; uses the 20% undecided allowance (R2b/R3b) | overlapping sensors; swap and cleaning access designed in; worst hour ~25% undecided (draft) | costly | part of O14's row: ~ R5b (machine safety), ~ R2c (per hour?) |
| O9 | Own build, 2D colour multi-camera station with learned component detection (A2's shape, built by Cboost) + rule table over the detected components | marks and material visible in colour (R6); type/condition learned with a confidence -> undecided band; cameras cheap | no direct geometry (twist, height); a labelled image set per type (recurring with R10); R1 by claim, like O2 | costly | leading (station design), tied with O11 until O22 stage 1 |
| O3a | Own-build redundant lanes: two O9/O11 stations of 1000/h each, or three of 500/h (N+1). Split from O3 after the round-2 rejection check | R5b by redundancy, without relying on service-while-running | about double (or 1.5x) station cost and footprint (no requirement: tie-break); the external handling splits the feed | costly | leading (availability): ✓ R5b; 3x500/h about as cheap as one lane (assumed prices); cost decides (R14) |
| O10 | Vendor sensing head (e.g. SICK PAIS/PACS hardware) with Cboost-built judgement. From the round-2 bias check | proven sensing hardware; Cboost owns the judgement | whether it counts as 'Cboost builds the inspection' (R12 ?); vendor head's rate (~500/h, unverified) | costly | not applicable (R12b, must) |
| O11 | Hybrid judgement: 3D geometry + learned per-component defect classification feeding the rule table. From the round-2 bias check | between O2 and O9: geometry for twist/height, learning for worn/dirty appearance | both a labelled set and a 3D pipeline | costly | leading (station design), tied with O9 until O22 stage 1 |
| O12 | Snapshot 3D (structured light or ToF area cameras) on a briefly stopped pallet. From the round-2 bias check | no encoder or speed dependence; fewer sensors | stop-go in 3.6 s adds conveyor wear and a cycle limit (R1 ?) | costly | trailing (R1 ?) |
| O13 | Turn or transfer the pallet between two conveyors for the bottom view, instead of a gap with sensors below. From the round-2 bias check | no sensor windows under falling debris | a moving mechanism in the station (R5b) | costly | sub-option of the station design, open |
| O14 | Spare sensor module inside one lane (standby head that takes over), instead of a second lane. From the round-2 bias check | R5b for sensor failures at less than a second lane's cost | conveyor and controller still single; bypass needed | costly | runner-up (availability): ~ R5b; wins if it prices clearly lower per site |
| O15 | NIR / hyperspectral sensing for material (wood, plastic, presswood). From generators' titles, round-2 bias check | direct material sensor (R6) | cost; only needed if colour and weight can't tell the materials apart | costly | not needed: the materials (wood/plastic, solid/presswood) show in colour and weight |
| O16 | Measurement campaign first: rented or demo standard sensors (3D profiler + colour cameras) on real customer pallets, before fixing the station design. From the round-3 bias check; 'what you built to judge the options' | settles O2/O9/O11, R6 (which differences are visible) and the hidden-defect share with evidence | weeks and a few tens of k EUR (assumed); needs pallets and the customer's rules | cheap | part of O22 (its first stage, with the candidate final sensor models, bought); alone ~ R15 for learned designs |
| O17 | Phased delivery: first unit judges type and the known rules; further condition rules added as data later. From the round-3 bias check | fits R13's year if the rules arrive late; R10/R11 as data make it possible | the first unit may not meet R2c (80% labelled) until the rules are in | cheap | runner-up (process) |
| O18 | Keep the existing machine as the fallback lane while the new one is serviced or down; its pallets come out degraded or undecided. From the round-4 bias check | redundancy without buying a second lane | existing machine's owner, condition and place in the line unknown; its calls are size-only | cheap | not applicable (R5b, must): the existing machine is too slow for the peak |
| O19 | Maintain off-shift: plan cleaning and service in non-operating hours, no redundancy in the machine. From the round-4 bias check (process) | R5b by schedule; no overlap, spare or second lane needed | only if the line doesn't run 24/7 (unknown); unplanned failures still stop the feed | cheap | not judged (depends on the operating schedule: ask) |
| O20 | Collect labelled data and ground truth now at the existing machine or with the customer's graders. From the round-4 bias check | cheaper start than O16; feeds O9/O11's labelled set and R7c's acceptance test | needs access to pallets (customer not known) | cheap | labels, type list and rules (sensor-independent) can be collected now; images ~ R15 |
| O21 | Build the final sensing head first (the station's own cameras, lighting and geometry) and collect labelled images with it on real pallets (at the existing machine or a test rig), before building the rest of the station. Researcher, round 5, from the user's distribution-shift reason | training images match operation (no distribution shift); training images match the final sensors (not the site and pallet-mix shift) | needs pallet access and a place to run it; the head design is fixed before the data shows it suffices | costly | part of O22 (its second stage); alone it fixes the head before the tie is settled |
| O22 | Staged evidence: (1) short sensor-choice test with the candidate final sensor models (bought, so they become part of the station) on real pallets, settling O2/O9/O11 and R6; (2) build the final head from that result and collect labelled images with it (O21); (3) shadow mode at the first customer's site before go-live. Labels, type list and rules collected now (O20's sensor-independent part). From the round-5 checks | settles the station tie on evidence; R15 for learned designs; shadow mode covers the site and pallet-mix shift | weeks for stage 1 inside R13's year; needs pallet access and a customer site for stage 3 | cheap | chosen by the user (round 5) |
| O23 | Synthetic or CAD-rendered training data for new pallet types. From the round-6 bias check | cuts the labelling cost per new type (R10 x R16) | conflicts with R15: at most a pre-training step | cheap | trailing (R15 ✗) alone; compatible as pre-training before fine-tuning on station data |
| O24 | Active learning in operation: undecided and low-confidence pallets go to remote review (B5/C1); their labels retrain the model. From the round-6 bias check | feeds R15 and R10 from operation; uses the 20% undecided band | review staff or service; a validation step before each model push | cheap | add-on to the station design, compatible with O22 stage 3 |
| O25 | Bought ML toolkit (HALCON deep learning, Cognex ViDi, or open source) trained by Cboost. From the round-6 bias check | faster start, proven tooling | whether a vendor's learning tool still counts as Cboost's know-how (R12b ?); licence per unit | costly | not applicable (R12c, must): models must be Cboost's own on open source |

## Matrix
Round 3 columns: R2c (replaces R2b, R3b), R7c, R12b, R13 (new). Every option re-checked. Rows not listed share
another row's cells: A4, A7, A8, B1, B7, B8, O7 are parts of the station designs; O8 is part of O14's row
(availability); O13, O15 are sub-options; B3, C5, D7 as A5; C1 as B5. C4 is not ranked. R7c is ? for every option.
O2/O9/O11 are station designs, each scored as a single lane with O14 + O8; O3a is redundant lanes. Process options (O16, O17, O19-O22) produce evidence, not a machine: their cells on the machine's requirements and R16 are ?; only R12b, R13, R14, R15 are scored. Sensing components (A5, D4, D5) and add-ons (O18) are ? on R16: the judgement is the station design's.

| Option | R1 | R2c | R5b | R6 | R7c | R8 | R10 | R11 | R12c | R13 | R14 | R15 | R16 | ✗ or ~ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| *priority, verified* | must, no | must, no | must, yes | must, no | must, no | should, no | must, no | must, no | must, yes | must, no | should, partly | must, no | must, yes |  |
| O2 | ✓ | ~ | ~ | ~ | ? | ~ | ✓ | ✓ | ✓ | ~ | ~ | ~ | ✓ | ~ R2c, ~ R5b, ~ R6, ~ R8, ~ R13, ~ R14, ~ R15 |
| O9 | ✓ | ~ | ~ | ~ | ? | ~ | ✓ | ✓ | ✓ | ~ | ~ | ~ | ✓ | ~ R2c, ~ R5b, ~ R6, ~ R8, ~ R13, ~ R14, ~ R15 |
| O11 | ✓ | ~ | ~ | ~ | ? | ~ | ✓ | ✓ | ✓ | ~ | ~ | ~ | ✓ | ~ R2c, ~ R5b, ~ R6, ~ R8, ~ R13, ~ R14, ~ R15 |
| O14 | ✓ | ~ | ~ | ~ | ? | ~ | ✓ | ✓ | ✓ | ~ | ~ | ~ | ✓ | ~ R2c, ~ R5b, ~ R6, ~ R8, ~ R13, ~ R14, ~ R15 |
| O18 | ? | ~ | ✗ | ~ | ? | ~ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ? | ~ R2c, ✗ R5b, ~ R6, ~ R8, ~ R14 |
| O19 | ? | ? | ? | ? | ? | ? | ? | ? | ✓ | ✓ | ✓ | ✓ | ? |  |
| O20 | ? | ? | ? | ? | ? | ? | ? | ? | ✓ | ✓ | ✓ | ~ | ? | ~ R15 |
| O21 | ? | ? | ? | ? | ? | ? | ? | ? | ✓ | ~ | ✓ | ✓ | ? | ~ R13 |
| O22 | ? | ? | ? | ? | ? | ? | ? | ? | ✓ | ~ | ✓ | ✓ | ? | ~ R13 |
| O23 | ? | ? | ? | ? | ? | ? | ✓ | ? | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ R15 |
| O24 | ✓ | ✓ | ? | ? | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ R8 |
| O25 | ? | ? | ? | ? | ? | ✓ | ✓ | ? | ? | ✓ | ✓ | ~ | ✓ | ~ R15 |
| O16 | ? | ? | ? | ? | ? | ? | ? | ? | ✓ | ✓ | ✓ | ~ | ? | ~ R15 |
| O17 | ? | ? | ? | ? | ? | ? | ? | ? | ✓ | ✓ | ✓ | ✓ | ? |  |
| O3a | ✓ | ✓ | ✓ | ~ | ? | ~ | ✓ | ✓ | ✓ | ~ | ~ | ~ | ✓ | ~ R6, ~ R8, ~ R13, ~ R14, ~ R15 |
| O12 | ? | ✓ | ? | ~ | ? | ~ | ✓ | ✓ | ✓ | ? | ✓ | ? | ? | ~ R6, ~ R8 |
| O10 | ? | ✓ | ? | ✓ | ? | ✓ | ? | ✓ | ✗ | ? | ✓ | ✓ | ? | ✗ R12b |
| A1 | ✓ | ✓ | ? | ? | ? | ✓ | ? | ✓ | ✗ | ? | ✓ | ✓ | ? | ✗ R12b |
| A2 | ? | ✓ | ? | ? | ? | ✓ | ? | ✓ | ✗ | ? | ✓ | ~ | ✓ | ✗ R12b, ~ R15 |
| A3 | ? | ✓ | ? | ✓ | ? | ✓ | ? | ✓ | ✗ | ? | ✓ | ✓ | ? | ✗ R12b |
| O3 | ✓ | ✓ | ✗ | ? | ? | ✓ | ? | ✓ | ✗ | ? | ✗ | ✓ | ? | ✗ R5b, ✗ R12b, ✗ R14 |
| O5 | ✗ | ? | ? | ? | ? | ? | ? | ? | ✗ | ✓ | ✓ | ✓ | ? | ✗ R1, ✗ R12b |
| C8 | ? | ✗ | ? | ? | ? | ✓ | ? | ? | ✗ | ? | ✓ | ✓ | ✗ | ✗ R2c, ✗ R12b, ✗ R16 |
| A5 | ✓ | ✗ | ✓ | ~ | ? | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ? | ✗ R2c, ~ R6, ✗ R11 |
| A6 | ✓ | ~ | ? | ? | ? | ~ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ R2c, ~ R8, ~ R11, ~ R15 |
| B2 | ✓ | ✓ | ? | ✓ | ? | ~ | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ? | ~ R8, ~ R13, ~ R14 |
| B4 | ✓ | ~ | ~ | ? | ? | ~ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ R2c, ~ R5b, ~ R8, ~ R10, ~ R11 |
| B5 | ~ | ✓ | ✓ | ✓ | ? | ~ | ✓ | ✓ | ✓ | ? | ~ | ✓ | ✓ | ~ R1, ~ R8, ~ R14 |
| B6 | ✓ | ~ | ? | ✓ | ? | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ R2c, ~ R11, ~ R15 |
| C2 | ✓ | ✓ | ? | ✓ | ? | ~ | ✓ | ✓ | ✓ | ? | ~ | ✓ | ? | ~ R8, ~ R14 |
| C3 | ~ | ✓ | ✓ | ✓ | ? | ✓ | ✓ | ✓ | ~ | ? | ~ | ✓ | ? | ~ R1, ~ R12b, ~ R14 |
| C6 | ✓ | ✗ | ✓ | ? | ? | ✓ | ? | ~ | ✗ | ? | ✓ | ✓ | ? | ✗ R2c, ~ R11, ✗ R12b |
| C7 | ✓ | ✗ | ✓ | ✓ | ? | ✓ | ✓ | ✗ | ~ | ✓ | ✓ | ✓ | ? | ✗ R2c, ✗ R11, ~ R12b |
| D1 | ✓ | ~ | ~ | ? | ? | ~ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ R2c, ~ R5b, ~ R8, ~ R10, ~ R11 |
| D2 | ✓ | ✓ | ? | ✓ | ? | ~ | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ? | ~ R8, ~ R13, ~ R14 |
| D3 | ~ | ~ | ✗ | ✓ | ? | ~ | ~ | ~ | ✓ | ? | ✓ | ✓ | ? | ~ R1, ~ R2c, ✗ R5b, ~ R8, ~ R10, ~ R11 |
| D4 | ✓ | ✗ | ✓ | ~ | ? | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ? | ✗ R2c, ~ R6, ✗ R11 |
| D5 | ✓ | ✗ | ✓ | ~ | ? | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ? | ✗ R2c, ~ R6, ~ R11 |
| D6 | ? | ~ | ? | ? | ? | ~ | ✓ | ~ | ✓ | ? | ✓ | ✓ | ? | ~ R2c, ~ R8, ~ R11 |
| D8 | ✓ | ✗ | ~ | ✗ | ? | ~ | ✓ | ~ | ✓ | ? | ✓ | ✓ | ? | ✗ R2c, ~ R5b, ✗ R6, ~ R8, ~ R11 |
| O4 | ? | ? | ? | ~ | ? | ? | ? | ? | ? | ? | ✓ | ✓ | ? | ~ R6 |
| O6 | ✗ | ✓ | ~ | ✓ | ? | ~ | ✓ | ✓ | ✓ | ? | ✓ | ✓ | ? | ✗ R1, ~ R5b, ~ R8 |

## Evaluation
### Round 7 (current)
- **Answers (round 6)**: no preference where the learning sits (R16 stays as worded; O2's R16 variant stays in);
  geometric limits in the rules unknown (stage 1 tests both 3D and 2D); models Cboost's own on open source (R12c):
  O25 not applicable.
- **No ranking change**: station design O2/O9/O11 tied until O22 stage 1; O3a leads availability (cost per site to
  be priced in stage 1, R14); O22 is the process.
- **Left before the decision**: the unverified requirements that remain (R6's priority, R10, R13's firmness, R15's
  priority) asked this round, with the user's agreement to move to the decision.

### Round 6 (current, corrected after the checks)
- **Answers (round 5)**: AI is a goal (R16, verified must); modules vs one lane decided by cost per site (R14); the
  staged plan O22 accepted.
- **R16 as worded** doesn't say where the learning sits. O2 in its R16 variant (learned type and component
  detection on 3D + intensity, rule table for condition) passes it, so **station design: O2, O9, O11 tied**, all ~
  R15 (met by O22's data plan), settled by O22 stage 1 or by the customer's rules (R11: height/twist limits favour
  3D). Whether R16 binds condition, type or both: asked.
- **Availability: O3a leads** on ✓ R5b (verified must). The cost comparison with one lane (~EUR 604-958k vs ~EUR
  630k-1.05M) holds only for O9 lanes; with O2/O11 each extra lane carries profilers. Pricing per station design is
  part of O22 stage 1. O14 + O8 runner-up.
- **Verdict consistency**: O18 and D3 not applicable (R5b ✗, verified must); C6 not applicable (R12b). A5, D4, D5 are
  sensing inputs (? on R16), kept as station components.
- **New options**: O23 synthetic data (trailing alone, R15 ✗; fine as pre-training), O24 active learning (add-on),
  O25 bought ML toolkit (R12b scope: asked).
- **Ranking change**: O2 back in (its R16 variant); station design O2/O9/O11 tied; O3a leads availability.

### Round 5 (current, corrected after the checks)
- **Answers (round 4)**: schedule unknown (O19 conditional); one lane for a simpler product (R14); training images
  must represent operation (R15, the user's distribution-shift reason, now its own row).
- **R14 reworded to the need** (simple and cheap per site across a series); lane count is a design variable under
  it. Repeated identical lane modules (O3a) may be as simple as one lane with spare, overlap and hot-swap (O14 + O8):
  both ~ R14. **O3a still leads availability** (✓ R5b, verified must).
- **R15 only binds learned judgement** (O9, O11, A6, B6). O2's explicit rules on 3D geometry need no training set,
  so **O2 now leads the station design** (✓ R15 vs ~); O9 runner-up, ahead only on tie-breaks (cheaper overlap,
  colour for marks and material). R6 for O2 (marks and presswood in the intensity image, wood vs plastic by weight)
  stays unchecked.
- **O22 leads as the process** (staged evidence): a short test with the candidate final sensor models settles O2 vs
  O9/O11 and R6; then the final head collects data (O21); then shadow mode at the first site. O21 alone fixes the
  head before the tie is settled. O17 (phased delivery) stays compatible with O22.
- **O18 trailing (R5b ✗)**: the existing machine is too slow for the peak.
- **Ranking change**: station design O2 leads (R15); O3a leads availability; O22 leads process.

### Round 4 (current, corrected after the checks)
- **Answers (round 3)**: R5b verified must (a held-up feed is expensive); R13 includes the first unit; R2c's period
  unknown (gap, assumed overall); the user chose "prove one lane" (O14 + O8, early machine-safety check, O3a as
  phase-2 fallback) and "decide the station design now" (O16 declined); materials wood vs plastic and solid vs
  presswood, so colour and weight suffice (O15 not needed).
- **Station design: O2, O9, O11 tied on the requirements** (R6 ~ for all: no view of the centre block shown on real
  pallets, marks/material in colour for O9 vs intensity image + weight for O2, both unchecked; R13 ~ for all with
  single coverage). **O9 leads on tie-breaks no requirement covers**: overlap is cheapest with cameras (layout.py:
  24 views EUR 60-144k hardware, labelling extra; profiler counts per face assumed, a wide profiler may cover more),
  and colour images show marks and both materials directly. O11 wins if the rules include height or twist limits.
- **Availability: on the matrix O3a leads** (✓ R5b, ~ R13): 3x500/h with single-coverage cameras is ~EUR 604-958k
  vs ~EUR 630k-1.05M for one lane with O14 + O8 (rejection check's recomputation, assumed prices). Same R13 risk,
  but O3a is certain on R5b. The user chose one lane: pushback asked. **O19 (maintain off-shift)** may make both
  unnecessary if the line doesn't run 24/7: asked first.
- **Harm**: the station design is decided without real pallets (O16 declined). Rework after the build eats the
  contingency of a budget already at ~EUR 630k-1.05M. O20 (collect labelled data at the existing machine) is the
  cheaper way to the same evidence: pushback asked.
- **Known gaps (bias check)**: 80% labelled x 80% right = ~64% of pallets guaranteed a correct label, with no
  baseline from the existing machine; ground truth for acceptance; environment (dust, wet/icy pallets), footprint,
  pallet sizes and orientations, empty vs loaded; undecided pallets likely need manual checks (staff cost); R10's
  remote access needs the customer's IT to allow it.
- **Ranking change**: station design back to a tie (O9 ahead on tie-breaks); availability O3a ahead of the user's
  choice on R5b; O18-O20 added.

### Round 3 (current, corrected after the checks)
- **R13 (EUR 700k incl. R&D, about a year)**: cost draft v2 (`cost.py`; profiler price checked, everything else
  assumed, now with mechanical design, CE, installation, data collection, project management, 15% contingency, O8's
  access and bypass): every combination is ~ on R13: low ends EUR 630-770k, high ends EUR 1.0-1.27M. The budget
  doesn't separate the options; it puts the whole project at risk. Whether R13 includes the first delivered unit is
  unknown and decides whether any option fits: asked.
- **Availability: O3a and O14 + O8 tied.** O3a: ✓ R5b by redundancy, ~ R13 (3x500/h N+1 is the cheaper variant,
  656-1110k). O14 + O8: ~ R5b (machine safety of servicing a running station, view overlap), ~ R2c (worst hour ~25%
  undecided if R2c is per hour), ~ R13. Which uncertainty to carry is the user's: asked through R5b's reason (what
  a feed stop costs) and R2c's reading.
- **Station design: O2, O9, O11 tied**, each ~ on R6 (centre block, material unchecked) and ~ on R13.
- **O16 (measurement campaign) leads as the next step** for any design: it is the only option that turns the
  station-design tie and R6 into evidence. Its cost (assumed tens of k EUR, weeks) needs the user's go-ahead. **O17
  (phased delivery) runner-up** as the way to fit R13 if the rules arrive late.
- **O10 not applicable (R12b, must, verified)**; **O3 not applicable (R12b)**.
- **B5, C2**: R13 ~ withdrawn (operating costs and an unchosen second stage, not the project budget): ?.
- **Ranking change**: availability back to a tie (O3a / O14+O8); O16, O17 added as process options.

### Round 2
The research splits into two dimensions; each is ranked on its own.

**Station design** (how a pallet is sensed and judged): O2 (3D + rules), O9 (2D colour + learned detection), O11
(hybrid) are tied on the requirements: R1 ✓ by unchecked claims alike; R6 ~ alike (no view sees the EUR centre
block; colour/weight for material unchecked); R11 ✓ alike (the only known rule, missing posts, is seen from the
sides in 2D and 3D). What separates them is covered by no requirement: labelled data per type (O9, O11) vs a 3D
segmentation pipeline (O2, O11); traceability of a call to a rule. They break the tie only once the customer's
rules are known (height/twist limits favour 3D; appearance rules favour learning).
- **O9 rejection record** (now a tie, so none needed). Earlier claim that twist/height rules need geometry was an
  assumed rule, not a customer one; withdrawn. O9's variant with one profiler is O11.
- **O12 trailing (R1 ?)**: stop-go within 3.6 s.

**Availability** (R5b: the feed is held up at most 3 times a year; 1000/h met during maintenance):
- **O3a** (own-build redundant lanes, 2x1000/h or 3x500/h): R5b ✓ by redundancy. Cost: 1.5-2x stations (tie-break).
- **O14** (spare sensor module in one lane): R5b ✓ for sensor failures; the conveyor and controller stay single.
- **O2 + O8** (service while running, undecided during it): R5b ~. Two open assumptions: views overlap enough
  (without overlap the worst hour is ~25% undecided, draft corrected), and machine-safety rules allow cleaning or
  swapping in a running station.
- These three are tied on the verified requirements' evidence; unit cost (not a requirement yet) decides: asked.

**Not applicable (R12, must, verified)**: A1, A2, A3, O3 (bought lanes), O5, C8. O10 (vendor head + own judgement)
depends on R12's scope: asked.

**Other round-2 records**:
- **C6, C7 trailing (R3b ✗)**: condition decided elsewhere for every pallet, beyond the 20% undecided allowance.
- **C2 trailing (tie-break)**: no ✗; the second stage is cost no requirement needs with 20% undecided allowed.
- **B2/D2 (X-ray)**: no ✗ or ~ on a must; trail on cost and licence only (tie-break), and as a centre-block add-on.
- **B5**: no ✗; could be added if R7b isn't met.
- **D3 trailing (R5b ✗)**: stop-and-press in the line. **O6 trailing (R1 ✗)**. **O5, C8**: R12 as above.
- **A5, D4, D5 trailing (R3b ✗) alone**; kept as O2/O9 sensing for marks, material and the centre block.
- **O4 (upgrade the existing machine)**: not judged; a variant that adds sensing avoids the size-only fault; owner
  and extensibility unknown, and R12 would apply to the added inspection.
- **O7**: part of the station designs (the undecided band).

**Ranking change**: round 1 O2/A1 tied → round 2 A1 out (R12); station design O2/O9/O11 tied; availability
O3a/O14/O2+O8 tied, decided by cost and machine safety.

### Round 1
Every must is unverified (round 1), so no option is *not applicable*; failures make an option trailing.

### Rejection records
- **A2 (2D AI booth), trailing (R1 ?; corrected)**. Zira's own rate is unknown, so R1 is ?, not ~; R2/R6 are ?
  for EU block pallets. R1: "keeps up with a feed of at most 1000 pallets per hour". Scenario: the
  similar IVISYS line is guaranteed at 600/h, a COOP site reports 400/h, AMS needs ~3 s per pallet; at the peak
  the feed backs up. No other requirement accepts a slower rate. Best variant: two booths in parallel, which doubles
  cost and footprint and needs a split feed (external, R4). Zira's own rate is unknown (?). Leader's cells: O2 ✓ on
  R1 by the draft's cycle budget (claim on profiler rates not checked per model). Also open: A2's R10 (who edits
  types) is ?, O2's ✓.
- **A3 (SICK PAIS + PACS), trailing (R1 ?; corrected)**. One unverified article can't carry a ✗; R10 ?, not ~. Its
  parallel variant is O3 (runner-up). Same scenario: PAIS ~500/h (one trade article, unverified). Best variant:
  two PAIS lines in parallel; also gives redundancy for R5. Its R10 ~ (dStudio retraining; remote use unknown). Leader
  carries none of these. Its strengths (service network, R8 ✓) beat O2's R8 ~.
- **A5 / B3 / C5 / D7 (read marks), trailing (R3) alone**. R3: tells usable/repair/discard; a code reader tells
  nothing about condition. Best variant: as O2's type layer, where it is kept.
- **A6 (anomaly detection), trailing (R11 ~, R7 ?)**. R11: judges condition by the customer's rules. Scenario: the
  model flags "deviates from good" but the customer's rule is a count ("four missing posts"); a rule layer over the
  flags is still needed, and worn but usable pallets (dirt, old repairs) may be flagged. Best variant: anomaly
  detection as an extra check beside O2's component map. Leader has R11 ✓ by construction.
- **B2 / D2 (X-ray), trailing (? cells; corrected)**. Rejection check: tube life 8,000-15,000 h (one replacement in
  1-3 years) but baggage scanners serviced every 1-3 months; both unconfirmed, so R5 ?. R8 ~: licence and safety
  officer are operating duties, and R8 is a should. D2 sees the hidden centre block: low-power X-ray for that alone
  stays a candidate addition to the leaders. Original record: R5: at most 3 stops a year; the X-ray tube is a consumable with planned
  replacement, and the radiation licence and safety officer add to R8 (should). Scenario: tube end-of-life and
  safety inspections add stops beyond 3. Not checked: tube life in hours (unverified). Best variant: X-ray only for
  the hidden centre block, low-power. Leader carries the R5 risk of a conveyor gap with lower sensors (?), not a
  consumable.
- **B4 / D1 (acoustic tap), trailing (R5 ~, ? cells; corrected)**: the wear is reasoning, not evidence (Moba taps
  at 180,000 eggs/h). Original record: A striker that hits 1000 pallets/h, about 8 million times a year,
  wears. Best variant: non-contact excitation (loudspeaker + laser vibrometer), unproven on pallets. Leader has no
  moving part in the station.
- **B6 (learned reference library), trailing (R11 ~)**. Same R11 scenario as A6; its central type push is adopted
  in O2's R10 design (templates pushed remotely).
- **C2 (staged judgement), trailing (R3 ~; corrected)**: R3 as worded has no time limit; a side buffer inside the
  point gives every pallet its judgement. B5 and C2 now read R3 the same way. Original record: Doubtful pallets leave the point without a final judgement; R3 as
  worded wants every pallet judged. Would win if the external handling can send doubtful pallets back or aside
  (R4 is external, so not ours to assume; ask).
- **C3 (people at the line), trailing (R7 ~; corrected)**: with 2-3 stations R1 is ~. Original record: 300-600/h per manual station; fatigue drift. Best variant: 2-3
  stations; then labour cost per shift, which no requirement covers (tie-break only).
- **C6, C7, C8 (judge elsewhere / outsource), trailing (R3)**. Not every pallet leaves the point with its condition.
  C8 also leaves Cboost without a machine (no requirement; tie-break only).
- **D3 (proof load), trailing (R5)**. Stop, press and release in 3.6 s with moving parts under load; it can also
  break weak pallets.
- **D4 (weighing), D5 (nail coils), trailing (R3) alone**. Kept as candidate O2 sensing for the hidden centre block
  and same-size types (draft finding 2). D5 needs a bench test.
- **D6 (mm-wave), D8 (thermography), trailing**. No ✗, but ? on R1/R7 (D6) and ✗ on R2/R6 (D8 sees only near
  surface heat flow, no layout); none deployed on pallets. O2 is also ? on R5 and R7 and its R1 ✓ rests on an unchecked profiler-rate claim, so these trail on ? cells
  and on having no pallet deployment, said as such.
- **O5 (used sorting line), trailing (R1)**: the one found does 900-1100 per 8 h shift (seller's listing), with a
  defective robot; it is a sorter, which is out of scope (R4). Best variant: reuse its frame only. The leaders don't
  carry this.
- **O6 (robot-held camera), trailing (R1)**: 300-600/h, with a moving robot in the station (R5 ~). Best variant: two
  cells (O3). Leaders: R1 ✓.
- **O7 (grey-zone lane), trailing (R3 ~)**: the doubtful band leaves as "check". It wins if "check" is an acceptable
  output for the external handling (ask). Same reading of R3 as B5 and C2.
- **O4 (upgrade the existing machine)**: not judged; unknown who owns it and whether it can be extended (ask).

### Independent checks, round 6
- Bias check: R16 names a mechanism (need: Cboost builds learned-inspection know-how) and doesn't place the
  learning; O2 never re-scored; R16 x R10 makes every new type a labelled set; still unverified and ranking: R2c's
  period, R7c's reason, R6's priority, R11's rules, R15 (mechanism), R13's reason, O19's schedule. Missing:
  synthetic data, active learning, a bought ML toolkit, a learned model on 3D point clouds (in O2's R16 variant).
- Rejection check: O2 has a variant passing R16; the O3a/one-lane cost holds only for O9; stale O2 names in rows;
  O14/O3a ✓ R15 left over; process options scored on R16; ✗ R16 on sensing components and add-ons stretched R16;
  inconsistent not-applicable verdicts on verified musts. All corrected.

### Independent checks, round 5
- Bias check: R14 named "one lane" (a choice, not a need) and may be met better by repeated modules; it conflicts
  with "low unit cost not picked"; the distribution-shift reason wasn't a row; O21 removes only the sensor shift,
  not site and pallet mix, and cannot settle O2/O9/O11; labels from the existing machine inherit its errors. Added:
  staged O16 then O21, reconfigurable rig, collect labels now, shadow mode (all in O22).
- Rejection check: R14 ✗ for O3a rested on the parenthetical; one-lane ✓ R14 unchecked; O16/O20 rejected on a reason
  that wasn't a requirement and that binds only learned designs; process options scored as machines; O21 needs the
  tie settled first; R13 difference for learned designs left unscored; O18 ✓ R5b contradicted the situation.

### Independent checks, round 4
- Rejection check: O3a's R13 was ~ not ✗ (EUR 604-958k with single coverage), so it leads availability on R5b; O2's
  R13 ✗ rested on an overlap goal no requirement sets; O2's R6 ~ for "no colour" stretched R6; O9's R6 ✓ had no new
  evidence; O11's R13 contradicted the draft; O9's labelling may be missing from layout.py; profiler counts per face
  assumed; priority row showed R5b unverified; O12 trailed on a ? the leader shares. All corrected.
- Bias check: the operating schedule is the biggest gap (off-shift maintenance, O19); R2c x R7c guarantees ~64%
  correct with no baseline; R5b's second clause and R12b name mechanisms; cost.py and layout.py disagree (README's
  round-3 "fits" superseded); missing options O18 (existing machine as fallback lane), O19, O20 (collect labelled
  data now), a bought first unit with own build later (conflicts with R12b), a vision-software partner.

### Independent checks, round 3
- Bias check: cost draft left out mechanical design, CE, installation, data collection, PM, contingency; O8 costed
  as a plain lane; labelling recurs per new type (R10). Missing: a measurement campaign first (O16), phased delivery
  (O17), slow continuous conveyor with the pallet turned 90°. R6 still an inferred must; R5b's reason never asked;
  R13 scope unknown. O2's cells depend on O8 (now scored as one combination).
- Rejection check: the availability lead had no requirement behind it (~ R5b vs ~ R13): tied. O3a's R13 ~ rested on
  R13's unknown scope; its 3x500/h variant was not costed. The leader's R2c should be ~ (per-hour reading). Cost
  cells inconsistent (O11 tight scored ✓). B5/C2 R13 ~ unexplained. availability.py still used 1/6 (fixed).

### Independent checks, round 2
- Bias check: the 20% allowances may add up (36-50% of pallets without a correct full judgement); per hour or
  overall unknown; R12 ambiguous (vendor head + own judgement?) and names a mechanism (need: Cboost gains and keeps
  inspection know-how); R10's "without a site visit" names a mechanism (need: types added cheaply and quickly);
  R8 has no subject (who services?); hidden assumptions: empty pallets, known orientation, environment, footprint,
  budget, unit cost. Its claim that R5b's second clause was derived is wrong: the user said "the peak of 1000/h must
  always be met" (round 1). Added O10-O15, split O3 into bought (O3) and own-build (O3a); O8's safety assumption named.
- Rejection check: O2's R1 ✓ vs O9's ? asymmetric; R6 ✓ without evidence; O9's R11 ~ rested on assumed rules; so
  O2/O9 tie. O3's rejection rested on cost (tie-break), and its own-build variant meets R5b by redundancy (O3a).
  The draft's worst-hour figure used a baseless 1/6. R7b cells corrected to ?; O4's verdicts reconciled.

### Independent checks, round 1
- Bias check: R5 is the most doubtful must and names a count, not the need (feed not held up, maintenance cost); R6
  is inferred; R7 has no number; R11's "rules known before design" sits badly with a product line (rules per
  customer); R10 assumes sites allow a network link; R2/R3 have no reason; "low unit cost not picked" doubtful for a
  series; empty pallets and posts = blocks are assumptions. Missing options added: O3-O7; NIR/hyperspectral and the
  EPAL digital passport stay titles. O2's R5 fit was overstated (conveyor gap, cleaning) and its patent risk was not
  on its row: both fixed. A4's costs separated from O2's.
- Rejection check: O2's lead over A1 rested on cells checked for O2 and left ? for A1; ranking corrected to a tie.
  ✗ cells resting on one unverified article (A3), on reasoning (B4/D1), or on a stretched requirement (B2/D2 R8,
  C2 R3) corrected to ? or ~; B5/C2 made consistent; C3's parallel variant counted.
 (corrected after the rejection check)
- **O2 and A1 are tied.** Both ✓ on R1, R2, R3, R11; both ? on R5, R6, R7. O2 is ✓ on R10 (types as data Cboost
  pushes), A1 ? (who may add types: ask the vendor). A1 is ✓ on R8 (should), O2 ~. O2's R6 is ? until the
  hidden-centre-block fix is shown on a real pallet; A1 scans all faces and has the same gap. What else separates
  them is covered by no requirement: development effort, patent freedom to operate (O2 via A8), vendor lock-in for a
  product line (A1); these only break a tie.
- **O3 runner-up**: two slower stations in parallel. It meets R1 with today's products and is the only route to R5
  by redundancy, if a lane stop that doesn't hold up the feed doesn't count.
- **What decides it**: R10 for A1 (vendor), R5's meaning (lane stops, cleaning), R6 (which same-size types occur),
  R7 as a number, and whether Cboost wants to make the inspection itself or integrate one (not yet a requirement).

### Harms of the leading options (scenarios; O2 unless said)
- **Service while running is unproven** (round 2): R5b rests on O8. If window cleaning or a sensor swap needs the
  conveyor stopped, a single station has ~500 feed stops a year (draft). The conveyor through the station and the
  controller remain single points: a bypass that passes pallets as undecided covers the controller, not the belt.
- **Undecided band absorbs the hard cases**: the hidden centre block and unknown types become "undecided", within
  20% on average (draft ~8%), but a worst hour ~25% undecided without overlapping views, ~8% with full overlap (draft
  corrected after the rejection check); whether 20% is per hour or overall, and whether the type and condition
  allowances add up, is unknown.
- **R5 by design** (O2, A1, O3 alike): no single-lane optical station in a dusty line is known to run with at most
  3 stops a year. Routes: maintenance without stopping (redundant sensors, self-cleaning optics, hot-swap), or a
  second lane (O3).
- **Lower sensors foul**: the bottom view needs a gap in the conveyor; splinters, nails and dirt fall onto the lower
  sensors' windows. If cleaning needs a stop, R5 (3 a year) is gone within weeks. Needs self-cleaning windows or
  air knives, or a design where cleaning happens while the line runs.
- **The rules arrive late and need other sensing**: the full rule list is known only "before the design is fixed".
  If it includes colour (EPAL A/B/C), moisture, contamination or nail heads, 3D geometry alone can't judge it;
  colour cameras or NIR get added. Keep the station's sensor frame open for that.
- **Hidden members**: the EUR centre block is invisible to straight views (draft). Oblique views into the fork
  openings, a nail map (D5) or weight (D4) are needed; without them a missing centre block passes, and R7 suffers.
- **Patents**: CHEP's family on automated pallet inspection (US 7958624, 8881360, 10092987) was enforced against
  IVISYS (settled). An own build with a per-element defect map needs a freedom-to-operate check before the design
  is fixed.
- **Series growth**: each unit carries Cboost's software; remote updates to several sites need a validation step
  before rollout (B6's lesson), or a bad template reaches every site.

### Reversibility
Station hardware for a series: costly (each built unit; a redesign later). Vendor stations (A1, A2, A3): costly,
vendor lock-in. X-ray (B2, D2): costly, licensing. Business model (C4): costly (contracts). Process options (C6,
C7): costly (customer's commercial terms). Software layers (rule tables, templates, A6 models): cheap. Nothing is
one-way.

## Open questions
1. Which pallet types now, and how do same-size types differ? Decides what must be sensed (R6).
2. The rest of the customer's pass/fail rules: known before the design is fixed (user, 2026-11-12); needed before
   evaluation.
3. How accurate must it be (R7)?
5. R5: what does a stop cost?
6. What reads the judgement, and in what form? (customer not known yet)
7. What happens if nothing is done?

## Sources
| Claim | Source (URL or `file:line`) | Date | Reliability |
|---|---|---|---|
| breeze-PAVE > 1000 pallets/h per system, evaluation < 1 s | https://logisticsbusiness.com/?p=66110 ; https://www.imveurope.com/article/3d-machine-vision-system-transforms-pallet-inspections | 2026-11-13 | vendor + trade press, two sources, no independent test |
| SICK PAIS up to 500 pallets/h | https://www.foodmag.com.au/how-damaged-pallets-trigger-failures-in-production/ | 2026-11-13 | one trade article; unverified |
| IVISYS 400-800/h; Alliance guarantees 600/h | https://palletenterprise.com/alliance-automation-partners-with-ivisys/ ; https://palletenterprise.com/automated-pallet-inspection/ | 2026-11-13 | trade press; sources conflict |
| Pooling Partners in-house scanner, software-configurable types, ~600/h line | https://palletenterprise.com/?p=6407 | 2026-11-13 | company claims |
| CHEP patent enforced against IVISYS (settled) | https://palletenterprise.com/ivisys-and-chep-reach-a-settlement-on-pallet-inspection-patent-dispute/ | 2026-11-13 | trade press; claims and expiry unchecked |
| EPAL QR code on corner block, >4 M pallets | https://www.epal-pallets.org/eu-en/epal-euro-pallet-qr ; generator B's fruitnet source | 2026-11-13 | two sources (generators A, B, D) |
| EUR centre block hidden from straight views | draft `visibility.py` (scratchpad) | 2026-11-13 | own geometry check, idealised layout |

## Round checklist
Checklist (round 7):
- [x] Log (first round) (n/a: round 7)
- [x] Problem (first round) (n/a: round 7)
- [x] Scope: unchanged
- [x] Requirements: R12c (open-source own models)
- [x] Replaced requirements: R12b moved; only O25 affected
- [x] Written requirements (n/a)
- [x] Deciding unverified requirements: R6, R10, R13, R15 asked this round
- [x] Options: none new
- [x] Searches: none this round, said in the report
- [x] Deciding claims: none new
- [x] Matrix: column renamed R12c; O25 n/a
- [x] Rejection records: O25 (R12c)
- [x] Harms: unchanged
- [x] Reversibility: unchanged
- [x] Draft and stress test: n/a: no leader change; O22 stage 1 is the stress test
- [x] Bias check: n/a: no new option, requirement change only narrows R12b; checks of round 6 stand
- [x] Rejection check: n/a: only O25's verdict changed, on a verified must
- [x] Ranking change: none
- [x] Report: what changed, recommendation, runner-up, must rejections
- [x] Questions: remaining unverified requirements, and moving to the decision
- [x] Pushback (n/a: no worse choice picked)
## Rounds
- Round 8: R6 and R13 verified musts, R10b (offline path); no ranking change; the user agreed to move to the decision (2026-11-13).
- Round 7: R12c (own open-source models) puts O25 out; no ranking change.
- Round 6: R16 (AI goal); after the checks O2 stays in by its R16 variant; station design O2/O9/O11 tied until O22 stage 1; O3a leads availability; O23-O25 added.
- Round 5: R14 reworded (need, not one lane); R15 (representative data) puts O2 ahead in station design; O3a leads availability; O22 (staged evidence) leads process.
- Round 4: station design tied (O9 ahead on tie-breaks); availability O3a ahead of the chosen one lane on R5b (pushback); operating schedule (O19) asked.
- Round 3: R13 puts every option at ~ (cost draft v2); availability O3a / O14+O8 tied; station design tied; O16 measurement campaign leads as next step.
- Round 2: A1 out (R12, must); station design O2/O9/O11 tied; availability O3a/O14/O2+O8 tied, cost and machine safety decide.
- Round 1: 32 discovery options + O2-O7. O2 (own build) and A1 (turnkey) tied; O3 (parallel stations) runner-up. Checks moved O2 from sole leader to a tie.

## Decision
Draft

Decision checklist:
- [x] Stop condition: round 8 brought no ranking change; R6, R13 verified; R10b's offline path changes no option;
      the user agreed to move to the decision (2026-11-13). Still unverified, listed as known gaps below.
- [ ] Why and Rejected: each on a requirement the user confirmed; confirmed by the user
- [x] Known gaps and open child decisions: listed below
- [ ] Documentation: updated where the rule takes effect; overstated requirements corrected; commit message proposed
- [ ] Out of scope: noted where open work is kept
- [x] Overview: choice, pros and cons, rejected, gaps, plan, files
- [ ] Review: in open chat; nothing implemented before it

### Choice
1. **Process: staged evidence (O22)**, with phased delivery (O17) as the fallback if the budget runs short.
   - Stage 0 (now, sensor-independent): the customer's type list and full rule list (R11), ground-truth labels from
     the customer's graders per pallet, the existing machine's measured error and undecided rates as a baseline.
   - Stage 1 (weeks): the candidate final sensor models (colour area cameras, one 3D profiler, a weighing conveyor
     section), bought, on real pallets. It decides the station design and prices the availability options.
   - Stage 2: build the final sensing head; collect the training set with it (R15).
   - Stage 3: shadow mode at the first customer's site before go-live; then active learning from the undecided and
     low-confidence pallets (O24).
2. **Station design: decided by stage 1** among three learned designs (open child decision): 2D colour with learned
   component detection (O9), hybrid 2D + 3D (O11), or 3D with learned detection and a rule table (O2, R16 variant).
   Common to all: Cboost's own open-source models (R12c, R16), standard sensors, mark/QR reading (A5) and weight (D4)
   as inputs for same-size types (R6), the customer's rules as a data table over detected components (A7, R11), an
   undecided band within 20% (O7, R2c), new types and rules pushed remotely or by offline package (R10b).
3. **Availability: redundant own-build lanes (O3a, 3x500/h, N+1)** if stage 1 prices them at or below one lane
   within EUR 700k; otherwise **one lane with a spare sensor module and servicing while running (O14 + O8)**, with
   machine safety checked first. If the line turns out not to run 24/7, maintenance off-shift (O19) may replace both.

### Why
- R5b (must, verified round 3: a held-up feed is expensive): O3a is the only option certain on it; O14 + O8 depends
  on servicing a running station being safe and on view overlap.
- R12c and R16 (musts, verified rounds 1, 2, 5, 6: inspection and ML know-how is a company goal): own build, own
  open-source models, learned judgement.
- R15 (must as stated, user's reason round 4: distribution shift): training data from the final head and the site,
  hence stage 2 and shadow mode.
- R13 (must, verified round 7: hard limit, EUR 700k incl. the first unit, about a year): every design estimates at
  EUR 600k-1.1M (assumed prices), so the choice between designs and availability options waits for stage 1's
  prices, and O17 is the fallback.
- R6 (must, verified round 7): marks and material need colour/intensity and weight in every design.
- R14 (should, partly verified): between lanes and one lane, cost per site decides.

### Rejected
- **Bought inspection** (A1 breeze-PAVE, A2, A3 SICK, O3 bought lanes, O5 used line, O10 vendor head, O25 ML
  toolkit) and **outsourcing or judging elsewhere** (C6, C8): not applicable, R12c (must, verified).
- **Existing machine as fallback lane** (O18) and **proof-load station** (D3): not applicable, R5b (must, verified).
- **Pure rules on 3D** (O2 without learning): R16 (must, verified); its learned variant stays in.
- **Sensor test with rented sensors or images from the existing machine alone** (O16, O20): ~ R15 for learned
  designs; folded into O22 with the final sensor models.
- **X-ray, acoustic tapping, mm-wave, thermography** (B2/D2, B4/D1, D6, D8): trailing on unknowns, no pallet
  deployment, licence or wear costs; X-ray stays a possible add-on for the hidden centre block.
- **Two 500/h lanes** (O3 variant): R5b ✗ (a lane down halves the rate). **Robot-held camera** (O6): R1 ✗.
  **Staged second station** (C2), **people at the line** (C3), **condition at the repair bench** (C7): trailing.
- **Upgrade the existing machine** (O4): never judged; the user had no remarks when asked (round 6).

### Known gaps
- The customer and the full rule list are unknown (R11); whether rules need geometry decides 3D vs 2D.
- R2c: per hour or overall unknown (assumed overall); 80% labelled x 80% right is ~64% guaranteed correct, with no
  baseline from the existing machine yet.
- R7c's and R1's reasons not asked; R15's priority as stated; R8: who services the machine.
- Operating schedule (24/7 or shifts) unknown: decides O19.
- Machine safety of servicing a running station (laser class 2/3R, guarding) unchecked.
- Cost estimates assumed except the profiler price; the budget is a hard limit.
- Site environment (dust, wet or icy pallets), footprint, pallet orientation and spacing, empty vs loaded: assumed.
- CHEP patent family on automated pallet inspection (US 7958624, 8881360, 10092987): freedom to operate unchecked.

### Open child decisions
- Station design (O2 variant / O9 / O11): settled by stage 1.
- Availability (O3a / O14 + O8 / O19): settled by stage 1 prices, the safety check and the operating schedule.
- Interface to the external handling and sorting (waits on the customer).
- Software stack: ML framework, model serving, update packaging (open source per R12c).
- Remote and offline update mechanism with validation before rollout (R10b).

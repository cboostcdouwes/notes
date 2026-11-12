# Round 1, generator B: far fields that grade irregular, worn objects at line speed

## Reformulations

- **In far fields' own terms.** Fields that tell what an object is and how fit it is, at line speed:
  - Sawmills call it *lumber grading*: a defect map checked against a grading rulebook (NHLA, strength-grading standards).
  - Central banks call it *fitness sorting*: denomination plus fit or unfit, by thresholds for soil, tears, holes and tape.
  - Breweries call it the *returned-crate check*: crate type and brand, plus damage or foreign-crate rejection.
  - Railways call it *wheelset condition monitoring*: measured geometry against condemning limits.
  - Retreaders call it *casing acceptance*.
  - Airports call it *hold-baggage screening*, done in levels with alarm resolution.
  - Egg packers call it *crack detection*.
  - Emergency medicine calls it *triage*.
- **Wider.** Each returning reusable carrier (crate, keg, banknote, wheel, casing, pallet) gets two labels: what it is and whether it can go out again. This is reverse-logistics acceptance of a pooled asset.
- **Narrower.** Two parts:
  - Find the few features that decide the call: missing or broken blocks, broken boards, and the posts rule.
  - Find the one or two features that separate types of the same size: the material, the board layout, a mark.
- **Inverted (what if the need went away?).**
  - The pallet carries its type in a printed code (EPAL now prints a QR code on each pallet), so nothing has to infer the type.
  - The classification point only rules out the certainly usable pallets. Everything else goes to the repair line, where people judge it anyway.

## Worked-out options

B1. **Defect map plus a separate rulebook (lumber grade-by-defect).**
- *What it is.* Sawmill scanners such as the MiCROTEC Goldeneye do the work in two separate stages:
  1. Sensors build a map of every defect on the board, with its type, size and position.
  2. A separate grading engine, such as GradeView for the NHLA hardwood rules, applies the written rulebook to that map.
- *How well it works.* Measured at 92% grade accuracy and 99.5% accuracy on defect detail.
- *Why it fits.* The customer's discard and repair rules (R11, for example "four missing posts is discard") become editable rule tables over a list of detected components. New rules or pallet types mean new tables, not new sensing.
- *Source.* https://www.purdue.edu/newsroom/archive/releases/2017/Q1/new-automation-revolutionizes-120-year-old-lumber-grading-process.html and https://www.cs.purdue.edu/cgvlab/www/resources/papers/Logan-Computers_and_Electronics_in_Agriculture-2018-Defect_detection_performance_of_automated_hardwood_lumber_gradin.pdf
- *Cost.*
  - Sensing: a camera and 3D-laser tunnel, roughly EUR 50–150k.
  - Software: the main effort is a component-level defect detector plus a small rule engine, months of work.
  - The rulebook can only be written once the customer's full rule list is known.

B2. **Multi-sensor fusion tunnel (lumber scanners with colour, 3D laser, X-ray density and laser scatter).**
- *What it is.* Each sensor sees what the others miss:
  - X-ray density shows hidden rot and inner cracks.
  - 3D profile shows missing wood.
  - Colour shows stains and type markings.
- *How well it works.* Purdue found accuracy rises significantly when sensors are combined, compared with colour alone.
- *Why it fits.* A pallet type of the same size can differ in block material (wood, presswood or plastic) or in density. Density or a material sensor could separate those types where size cannot (R6).
- *Source.* https://www.cs.purdue.edu/homes/bbenes/papers/Gazo18ComElAg.pdf and https://stories.microtec.eu/en/products/goldeneye
- *Cost.*
  - X-ray adds shielding, licensing, a radiation-safety regime, and a high-uptime part (the X-ray tube) to service. That works against R5 and R8.
  - Colour plus 3D laser alone is far cheaper.
  - A full lumber-grade multi-sensor scanner costs several hundred thousand EUR.

B3. **Read the identity instead of inferring it (reverse vending machines, EPAL QR pallets).**
- *What it is.* TOMRA's reverse vending machines read the container's barcode and security mark from any angle, at up to 1,000 images per second. Shape and material are only a first filter and a plausibility check.
- *Pallet equivalent.* EPAL prints a unique QR code and serial number on the corner block of each pallet, about 4 million pallets so far. A code read gives the type outright.
- *Fallback.* Shape and size remain the fallback for pallets without a code.
- *Why it fits.*
  - It removes most of the "same size, different type" problem (R6).
  - Adding a type becomes a lookup-table entry (R10).
- *Source.* https://www.tomra.com/reverse-vending/our-offering/tomra-reverse-vending-technologies and https://fruitnet.com/eurofruit/the-next-stage-of-pallet-traceability-as-epal-utilises-qr-codes/257493.article
- *Cost.*
  - A few industrial code readers, about EUR 5–20k.
  - It only helps for pallet types that carry codes. A worn, painted or dirty code fails, so a visual fallback is still needed.

B4. **Tap it and listen (Moba egg crack detection, Precigrader acoustic lumber grading, the railway wheel-tapper).**
- *What it is.* A small striker excites the object and microphones read the response:
  - A cracked eggshell absorbs more energy. Moba quotes 90% detection at a 0.3% false-reject rate, at up to 180,000 eggs per hour.
  - Precigrader strikes each passing board and assigns a strength grade from the resonance. It is installed in more than 150 mills.
- *Why it fits.* For pallets, a broken or split board or a loose block rings differently from a sound one. Acoustics can catch cracks that cameras miss under dirt or on the hidden faces.
- *Source.* https://moba.net/products-solutions/crack-detection/ and https://www.etesters.com/product/45f80477-9e48-4815-a500-675d54c080cc
- *Cost.*
  - Cheap hardware: strikers, microphones and a DAQ, about EUR 5–15k.
  - But the strikers are moving, wearing parts, which works against R5.
  - Response signatures must be learned per type.
  - Mostly a complement to vision, not a replacement.

B5. **Tiered screening with remote human alarm resolution (airport hold-baggage screening, Levels 1, 2 and 3).**
- *What it is.* Three levels:
  - Level 1: the automatic system clears most items.
  - Level 2: the items it is unsure of go to an operator, who clears them on screen from the images.
  - Level 3: whatever is still unresolved goes to physical inspection.
- *What it shows.* The National Academies study of airport CT screening found that alarm-resolution time, not scanner speed, limits throughput. The combined false-alarm rate with an operator is much lower than the automatic rate.
- *Why it fits.* For pallets, the "unsure" ones could be shown to a remote grader, at the site or at Cboost, within the 3.6 s window, or diverted to repair. This keeps R7 errors low without perfect automation, and the data keeps improving the automatic level.
- *Source.* https://www.nap.edu/read/6469/chapter/6 and https://www.osti.gov/servlets/purl/966566
- *Cost.*
  - A screen, a review UI and a staffing or remote-service arrangement.
  - The rate of unsure pallets must stay low; a few percent at 1,000 per hour is already 20–50 reviews per hour.

B6. **Reference library plus learned deviation detection, with type definitions pushed centrally (Heuft returned-crate check, TOMRA and AMP fleet learning).**
- *What it is.* Heuft's returned-crate inspection does two checks:
  - A 3D scan compares crate length, width and height with stored reference values for each crate type, and colour and logo checks confirm the type.
  - Its reflexx AI flags damage and design deviations on all four walls, at up to 7,200 crates per hour.
- *How the type list grows.* TOMRA keeps a central database of container types. AMP Robotics upgrades classifier models across a fleet of about 300 robots.
- *Why it fits.* A new pallet type is a new reference entry plus a model update shipped remotely (R10, no site visit). The customer never extends it (R8).
- *Source.* https://beverage.heuft.com/en/product/beverage/empty-containers/empty-crate-inspection-heuft-lkx , https://heuft.com/nl/product/beverage/empty-containers/returned-crate-check-heuft-lgx , https://recyclingproductnews.com/article/36830/amp-robotics-ai-platform-can-now-classify-more-than-100-different-categories-of-recyclables
- *Cost.*
  - Needs a remote-update channel and a validation step before each rollout.
  - Needs a labelled image set per new type, perhaps a few hundred pallets.
  - The camera hardware itself is modest.

B7. **Fixed wayside sensors the object passes through, with no moving parts (railway wheel-profile measurement).**
- *What it is.* Systems such as RIFTEK 3DWheel and Hexagon CALIPRI X mount laser scanners beside the track:
  - An inductive sensor triggers a measurement when a wheel arrives.
  - The profile is measured while the train moves.
  - The result is compared with the condemning limits of the EN 15313 standard.
- *Why it fits.* The design goal is to run unattended for years in the open, in Arctic conditions on Sweden's iron-ore line. That matches R5, at most 3 stops a year: the inspection station adds nothing that moves or touches the pallet, so the conveyor is the only wear part. Condition is a measured value against a limit table, with a predictive-maintenance trend per asset.
- *Source.* https://hexagon.com/products/calipri-x and https://www.byv.kth.se/polopoly_fs/1.347120.1550158406!/Menu/general/column-content/attachment/Matthias%20Asplund%20et%20al.pdf
- *Cost.*
  - Sensors are sealed and protected from dust and splinters, with self-checks.
  - Every judgement must be made from what can be seen as the pallet passes. Underside and hidden faces need sensors below or between the conveyor belts.

B8. **Short fixed decision tree on a handful of observables, with fitness thresholds and an agreed tolerance (START triage, ECB banknote fitness standard).**
- *What it is.*
  - *START triage* sorts casualties into four classes from three or four observations. It does not try to diagnose.
  - *ECB banknote fitness standard* turns "fit or unfit" into measurable thresholds per defect, for tears, holes, soil and tape. It allows a stated 5% tolerance of unfit notes passed as fit. Sorters such as Glory's let the operator set thresholds per denomination and defect type.
- *How it maps to pallets.* Usable, repair and discard as a small tree:
  - count missing or broken blocks;
  - count broken boards;
  - check the fit-for-use measurements;
  - all with per-type thresholds.
- *Contract and acceptance test.* The customer's rules (R11) plus an explicit error tolerance (R7, "rare" made into a number) become the contract and the acceptance test.
- *Source.* https://www.ecb.europa.eu/euro/cashprof/cashhand/recycling/html/fitness.en.html and https://en.wikipedia.com/wiki/START_triage
- *Cost.*
  - Mostly specification work with the customer: defining measurable thresholds and a tolerance. It costs little to build.
  - It needs a detector that reliably produces those few observables.

## Other titles

- Multi-lane or parallel slower inspectors that share the feed (fruit graders run many lanes; airport scanners are put in parallel to reach 450 bags per hour).
- Many images of each pallet from all angles as it moves past (Compac Spectrim takes up to 500 images of each fruit at 12 fruit per second).
- Weight plus dimensions as a type fingerprint (parcel dimension-weight-scan tunnels; coin sorters).
- NIR or hyperspectral material identification (recycling sorters) to separate wood, presswood, plastic and painted pallet types.
- Load test and watch the deflection (tyre shearography under vacuum; lumber machine stress rating by bending).
- Grey-zone lane: certain-good and certain-bad go automatically, the grey band goes to a person (retread casing "gray area").
- Rule-out only: certify "usable as is" automatically, and send everything else to the repair line, where people judge anyway.
- Full volumetric CT (log CT scanners at sawmills, baggage CT): maximal information, high cost and maintenance.
- Teleradiology-style remote grading: images go to graders at Cboost, which is how the service is sold.
- Per-pallet history: QR serial plus the last inspection result, so a pallet that is getting worse is caught by its trend (EPAL Digital Pallet Passport; rail per-wheelset wear trend).
- Statistical audit sampling: a person re-grades 1 in N pallets to measure the error rate continuously (ECB tolerance checking).
- Buy an existing pallet inspector (SICK PAIS about 500 per hour, IVISYS, Zira, AMS Pallet IQ, breeze-PAVE more than 1,000 per hour) and run two in parallel if one cannot keep up. Near field, listed for reference: https://palletenterprise.com/automated-pallet-inspection/

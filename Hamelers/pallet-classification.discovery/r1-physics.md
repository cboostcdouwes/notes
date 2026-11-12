# Round 1, generator D: physics and non-destructive testing

Lens: physical effects beyond ordinary cameras (acoustics and vibration, mechanical probing and loading, weighing,
penetrating radiation, radar, thermal, marking the object itself), plus how timber engineering and structural health
monitoring (SHM) do it. Cost figures are rough order-of-magnitude estimates by me, not quotes, unless a source is named.

## Reformulations

- **Timber engineering, "machine grading":** sawmills grade each board in-line at 1–3 m/s by measuring a physical
  property (stiffness from an impact-induced stress wave, density, grain angle) instead of looking at it. Here: machine
  grading of an *assembly* rather than a single member.
- **SHM, "damage detection by baseline comparison":** a structure's dynamic or static signature (natural frequencies,
  stiffness, wave travel time) is compared with the signature of a healthy reference; a deviation means damage, and
  where it deviates says where. Here: one reference signature per pallet type, and the type is the reference that fits
  best.
- **Industrial end-of-line testing, "resonant acoustic method (RAM) pass/fail":** strike each part, listen, sort.
- **Security screening, "content recognition in a container on a belt":** dual-energy X-ray or mm-wave images every
  bag at about 1,800 per hour and recognises the objects inside. Here: recognise the boards, blocks and nails inside
  the pallet's outline.
- **Asset management, "automatic identification of returnable assets" (GS1 GRAI):** the object carries its identity.
- **Wider:** judge the remaining fitness for use of a reusable load carrier, from measurement *or* from its history.
- **Narrower:** find which structural members (deck boards, blocks/posts, stringers, nails) are present, intact and
  attached, and match that member list to a type template; the condition rules (e.g. "four missing posts is discard")
  are then rules on the member list.
- **Inverted (the need goes away):** the pallet states its own type (printed code, RFID) and its own damage (embedded
  sensor, "self-inspecting pallet"); or condition is defined by a proof test (a pallet that carries its rated load
  within a deflection limit is usable, whatever it looks like).

## Worked-out options

D1. **Impact-acoustic resonance signature (RAM / stress-wave grading).** A spring-loaded hammer strikes the pallet at
one or more fixed points as it passes (or while briefly stopped); microphones or contact accelerometers record the
response; the spectrum and decay are compared against per-type healthy baselines. Type = best-matching signature
(same-size types with different woods, block counts or nailing ring differently); condition = deviation, since loose
nails, withdrawn nails and missing boards shift resonances and damping. Sources: Precigrader acoustic MSR grader, used
in-line in 150+ mills (https://etesters.com/product/45F80477-9E48-4815-A500-675D54C080CC/precigrader-acoustic-msr-system);
Ai et al. 2024, wooden pallet damage stages (nondestructive, nail loosening, nail withdrawal, deck board off) tracked by
piezoelectric and acoustic-emission signals (https://link.springer.com/article/10.1007/s00107-024-02064-4); Polytec /
Siemens end-of-line resonance testing (https://www.polytec.com/en/vibrometry/solutions/industries/industrial-quality-assurance/resonance-testing).
Cost: hardware low (hammer, a few microphones/accelerometers, DAQ, roughly €10–40k); the real cost is a training set
of healthy and damaged pallets per type, plus plant noise (sawmill floors exceed 120 dB, per US 11536697) and support
conditions that must be repeatable. Wear part: the hammer. Localising *which* member is damaged is weak from a single
strike; several strike points or a laser Doppler vibrometer help.

D2. **Dual-energy X-ray line-scan transmission (baggage-scanner style), CT as the high end.** The pallet passes flat
through a fan-beam X-ray tunnel; the transmission image shows every board, block, crack, knot, void and especially
every nail (steel is high contrast against wood). Type from member layout plus nail pattern and wood density
(dual-energy separates materials, e.g. wood vs plastic vs pressed-chip blocks); condition from missing/split members,
nails not engaged in wood, decay (low density). Sources: Smiths HI-SCAN/SDX 10080, belt 0.5 m/s, up to 1,800 bags/h
(https://www.smithsdetection.com/products/hi-scan-10080-xct/); X-ray/tomographic inspection of wooden boards on chain
conveyors, US 10748270 (https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10748270); MiCROTEC CT Log,
rotating-gantry CT of logs at up to 180 m/min (https://microtec.eu/en/products/ct-log). Cost: line-scan system roughly
€150–400k, CT much more; shielding, radiation licence and a radiation-safety officer on site; X-ray tube is a
consumable (ties into R5). A pallet lying flat (1.2 x 0.8 x ~0.15 m) fits a baggage-sized tunnel; 1,000/h is within
the stated bag rate. A single top-down projection overlaps members; a second, angled view reduces that.

D3. **Proof-load / stiffness station (mechanical probing).** The pallet stops on its blocks; actuators press the deck
at fixed points with a known force while load cells and laser distance sensors record deflection (or pressure-plate
at several points at once). Missing or loose posts, broken stringers and cracked deck boards show as excess local
deflection; overall stiffness profile also separates same-size types of different construction. This is the
inverted formulation made physical: "usable" means "carries load within a deflection band". Sources: on-line
stiffness testing of wood panels with load cells and deflectometers in two stations, US 5804738
(https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5804738); automated panel load/deflection tester,
US 5699274 (https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5699274); Virginia Tech CPULD on how
support span changes pallet stiffness by 29–49 % (https://www.unitload.vt.edu/about-us/media-center/cpuld-news/9-7-cpuld-news-summer-fall-2021/feature-evaluation-of-pallet-deflection-under-forklift-handling-conditions.html).
Cost: servo/pneumatic press frame, load cells, laser sensors, roughly €30–100k; cycle must fit in 3.6 s including stop;
moving parts under load are the main maintenance risk against R5, and the test itself can finish off a weak pallet.

D4. **Weighing (dynamic checkweigher) as a cheap physical feature.** A roller-conveyor scale weighs each pallet in
motion. Weight separates many same-size types (softwood vs hardwood, block vs stringer, plastic vs wood, chip-block
vs solid-block) and a missing block or board shows as a weight deficit; combined with dimensions it is a strong prior
for type. Moisture (wet pallets weigh up to tens of percent more) is the confounder; a microwave moisture sensor
(next option) or per-type weight bands absorb it. Sources: Radwag DWT/RC roller checkweigher for pallets and crates
(https://radwag.com/en/roller-scales,4,107-111); Mettler Toledo TLD870 combining pallet dimensioning, weighing and
barcode reading (https://www.mt.com/hi-speed). Cost: low, roughly €5–25k; load cells have no wear and checkweighers
are known for long unattended service. Alone it cannot judge most condition rules; it is a component of a fused
station.

D5. **Inductive / eddy-current coil array that maps the nails.** A line of small inductive coils under (and/or over)
the belt records where steel is as the pallet passes, giving a "nail map". The nail pattern is a fingerprint of the
type (nail count and spacing per block differ between designs of the same size); missing nails, nails no longer seated
in a block, and missing blocks (no nails where a block should be) are condition evidence; protruding nails can be seen
by a coil above the deck. Sources: recycling-plant conveyor metal detectors and the principle that ferrous nails in
non-metallic wood give the contrast (https://buntingmagnetics.com/blog/separating-metal-when-recycling-wood); pallet
nail fastening as ferrous frame fasteners, US 4418260
(https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/4418260). No pallet-specific coil-array product
found; needs bench testing of coil size vs nail size. Cost: low hardware (roughly €5–30k custom array); solid state,
no moving parts, insensitive to dirt and light. Blind to wood damage that leaves nails in place (split board, rot).

D6. **Microwave / mm-wave imaging and sensing (radar through wood).** Wood, plastic and cardboard are largely
transparent at 24–80 GHz; a linear antenna array under or over the belt images the pallet's internal structure,
metal (nails), voids, and wet zones, non-ionising and therefore licence-free. A lower-frequency microwave transmission
sensor additionally gives moisture and density per zone (decay and wetness affect condition; density helps tell
species/types apart). Sources: Rohde & Schwarz R&S IMAGER for real-time industrial imaging on conveyors
(https://www.rohde-schwarz.com/kr/solutions/security/security-screening/real-time-industrial-imaging/imager_256948.html);
Fraunhofer FHR SAMMI 78 GHz conveyor imager, targets up to 6 m/s
(https://www.vision-systems.com/factory/consumer-packaged-goods/article/16744703/millimeter-wave-imager-sees-through-materials);
Lundgren, microwave line-scan sensor for sawn timber density and moisture
(https://www.traguiden.se/globalassets/forskning/doktorsavhandlingar/ltu-dt-0709-se.pdf). Cost: mid, roughly
€50–200k for an imaging array wide enough for a 1.2 m pallet; resolution in the millimetre range (coarser than X-ray);
wet wood attenuates strongly, so very wet pallets may image poorly. No pallet-specific deployment found.

D7. **Read the pallet's own marking (inverted: the pallet says what it is).** Read what the pallet already carries:
EPAL Euro pallets now have a unique inkjet QR code and 9-digit serial on the right-hand corner block(s) (4M+ pallets),
plus the branded/stamped EPAL, IPPC, licence and date marks on the blocks; pooled plastic pallets (iGPS) carry four
embedded UHF RFID tags with a GRAI ID. A code reader or RFID gate gives the type (and pool, producer, production date)
with near-certainty for marked pallets, regardless of size; a pool database could add history. Sources: EPAL EURO
PALLET QR (https://epal-pallets.org/eu-en/epal-euro-pallet-qr); SICK on reading EPAL QR in-line
(https://www.sick.com/ae/en/pallets-with-qr-code/w/blog-pallet-epal-qr-code); iGPS embedded RFID
(https://igps.net/resources/rfid-tracking/). Cost: very low per station (a code reader or RFID gate, roughly €2–15k);
new types can be added as code/brand-to-type table entries remotely (R10). Gives no condition judgement, and covers
only marked pallets (unmarked, one-way or worn-stamp pallets need a fallback); a damaged or missing marked block is
itself a condition signal.

D8. **Active (online) thermography.** A line heater (IR or flash) warms the pallet surface by a few kelvin as it
passes; an infrared camera watches it cool. Heat flows differently over cracks, splits, delaminated or rotten wood,
wet zones and steel nails (nail heads cool faster and show the nail map from the visible side), so internal and
near-surface damage that an ordinary camera cannot see becomes visible; ultrasound-excited thermography adds hidden
cracks up to ~20 mm deep. Sources: Fraunhofer WKI active online thermography on conveyors
(https://www.vision.fraunhofer.de/en/technologies/heat-flow-thermography/active-online-thermography.html); Berglind
and Dillenz, pulse thermography finds glue deficiency in laminated wood
(https://jwoodscience.springeropen.com/counter/pdf/10.1007/s10086-002-0478-6.pdf); ultrasound thermography for wood
faults (https://www.vision-systems.com/factory/article/16744460/ultrasound-thermography-technique-finds-the-faults-in-wood).
Cost: IR camera plus heater, roughly €30–100k for top and bottom views; sees only the faces it views (several cameras
for deck, bottom and sides); results depend on ambient temperature and on how wet the pallet is. No pallet-specific
deployment found.

## Other titles

- Air-coupled ultrasound through boards and blocks; USDA tested rolling ultrasonic transducers on pallet deckboards for
  quality sorting (Schmoldt, Ross, Nelson 1996, https://experts.umn.edu/en/publications/ultrasonic-defect-detection-in-wooden-pallet-parts-for-quality-so/).
- Controlled drop with acoustic emission: drop the pallet a few cm onto its blocks and listen (Ai et al. 2024).
- Laser Doppler vibrometer: non-contact vibration of every deck board after a strike or a loudspeaker burst.
- Per-block coin-tap: a small tapping head on each block position, the way aircraft composites are tap-tested.
- Shaker table with the pallet as the SHM structure: sweep frequency, compare transfer functions per type.
- Laser tracheid-effect scanning: grain direction and knots from laser light scatter, as in lumber scanners.
- Capacitive / dielectric plate array: knots, voids and density from the dielectric response (US 5585732).
- Near-infrared spectroscopy: species, treatment and contamination of the wood (waste-wood sorting research).
- Compton backscatter X-ray from one side only, when the pallet cannot be passed through a tunnel.
- Full CT of each pallet (log-scanner technology), for a complete 3D member and nail model.
- Ground-penetrating-radar style single-antenna sweep along each block row for missing posts.
- Magnetic flux sensing after magnetising the nails (residual magnetism maps nails without coils at close range).
- Self-inspecting smart pallet with embedded strain/impact sensors (EU CORDIS project; US 10689153 "Maintainable
  pallet"); only for a closed pool.
- Burnt-in or laser-marked type code applied by Cboost's customer at first intake, so the pallet carries its type from
  then on.
- Fused low-cost station: weight + nail map + code read, with an expensive sensor only as fallback for unresolved
  pallets.
- Acoustic emission while the pallet is lifted by its own blocks on the conveyor transfer (the handling is the load
  test).

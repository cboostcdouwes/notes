# Round 1, lens A: the problem's own field (industrial inspection and grading of pallets)

## Reformulations

- **In the field's own terms**: automated visual inspection (AVI) and grading of returnable transport items (RTI). Each item gets an identity (load-carrier type) and a disposition. Pallet recyclers call this "pallet grading/sortation". Pool operators (CHEP, EPAL) call it "classification" (EPAL A/B/C, exchangeable or not). ISO 18613 calls it "defects and damage criteria" before repair.
- **Furthest fields with the same purpose (still industrial grading)**: sawmill board grading scanners ("lumber grading", with laser, colour, tracheid and X-ray sensors). Empty-bottle and crate inspection in beverage returnables ("empty container inspection", accept or reject at line speed). Aircraft MRO and tyre retreading, whose "serviceable / repairable / condemned" or "casing accept / repair / scrap" maps directly onto usable / repair / discard.
- **Wider**: lifecycle condition tracking of each pallet in a pool. The type and history come from a digital pallet passport (EPAL QR), so the classification point only updates the record.
- **Narrower**: detect only the components that the customer's rules mention (posts or blocks, boards, nails) and the features that tell same-size types apart. The rest of a full grading system is left out.
- **Inverted (the need goes away)**: the type is known without looking, from a QR or RFID code or because the supplier declares it. Condition is not judged at a separate point but by the repair station, which receives every pallet. Or the pallet is graded upstream at the dock.

## Worked-out options

A1. **Turnkey multi-sensor 3D laser grading station with selectable standard/customer profiles (breeze-PAVE).**
- **What it is**: laser sensors scan the pallet in motion from top, bottom, sides, front and rear, and brightness is measured at the same time. That gives millions of 3D points per pallet. Grades are A/B/C/defective, the affected areas are marked, and EPAL profiles are built in. Customer-specific parameter sets can be created and selected in the software.
- **Speed**: the vendor claims "well over 1,000 pallets/h" per system, with evaluation under 1 s per pallet; the conveyor is the limit.
- **Installation**: needs about 1.5 m of height above the conveyor and a 25 cm gap in the line.
- **Source**: https://logisticsbusiness.com/?p=66110 , https://www.imveurope.com/article/3d-machine-vision-system-transforms-pallet-inspections
- **Cost**: price not published; vendor quote needed. For scale, a single bottom-only SICK 3D station lists at about $150k (see A3), so expect a six-figure sum.
- **Risks**: how new types are added (R10, Cboost rather than the vendor) and how often the system stops (R5) are not documented.

A2. **AI 2D camera booth that combines learned defect detection with an attribute-based type code (Zira VisionCell Q7; similar: IVISYS PALLETAI, AMS PalletIQ).**
- **What it is**: an enclosed booth with 4–7 synchronised cameras and controlled lighting, with inference running on the device. It counts and locates top boards, bottom boards and stringers or blocks, measures board spacing and thickness, and detects the entry type and model. From these it builds a type code (e.g. "48×40 7T 4W 3S"). That code separates same-size types by construction rather than by footprint (R6).
- **Outputs**: one of accept, repair, dismantle or scrap per pallet, plus a defect record. The decision comes in under 20 ms and is sent via relay, PLC or REST.
- **Configuration**: Zira says types, rules and grading logic are edited in its front end without programming.
- **Throughput of the similar systems**: IVISYS uses 16 cameras and about 200 images per pallet; Alliance Automation guarantees 600 pallets/h with it, and a COOP site reports 400/h, so it may need two lanes. AMS needs about 3 s per pallet.
- **Source**: https://zira.us/nobadpallets/palletgrading.html , https://palletenterprise.com/automated-pallet-inspection/ , https://palletenterprise.com/alliance-automation-partners-with-ivisys/
- **Cost**: quote only; buy or subscribe; expect six figures.
- **Fit**: mostly US stringer-pallet experience, so EU block pallets need checking. The >95% accuracy figure is the vendor's own.

A3. **Industrial sensor-vendor building blocks: SICK PAIS for condition plus SICK PACS for type, integrated by Cboost or an integrator.**
- **Condition (PAIS)**: 3D cameras plus dual line lasers find missing parts, cracks and protruding nails on Euro pallets. Defect limits can be set per defect type and per pallet element, which maps onto the customer's rules (R11). The listed price is about $149k for the bottom-only variant; a top, sides and bottom setup costs more.
- **Type (PACS)**: two colour cameras photograph the blocks, and a neural network tells the types apart by branding (EPAL, CHEP, UIC). It is retrained in SICK dStudio, a guided tool that needs no machine-learning expertise. That fits R10, adding types remotely, if retraining can be done over a remote connection.
- **Upkeep**: standard industrial parts with a local service network help R5 and R8.
- **Source**: https://www.schnap.com.au/pallet-integrity-inspection-system-3d-cameras-dual-line-lasers-customizable-sick-1144856.html , https://www.logisticsbusiness.com/materials-handling-warehousing/ifoy-finalist-focus-pallet-classification-system-sick/ , https://www.sick.com/in/en/c/g576458
- **Cost**: about $150–300k in hardware plus integration work.

A4. **Own build from laser line profilers plus explicit geometric rules on the point cloud (e.g. LMI Gocator 2490, as Cyth Systems did).**
- **Sensing**: 3–6 laser line profilers (top, bottom, sides) give a height map of the pallet as it passes.
- **Software**: Cboost writes the segmentation (boards, blocks, nails) and the rules with HALCON or an open library (Open3D/PCL).
- **Type**: matched against geometry templates (board count and widths, block layout, chamfers, deck spacing). This separates same-size types (R6), and a new type is a new template that can be deployed remotely (R10).
- **Condition**: plain thresholds that can be audited ("post missing", "board broken", "block twisted > 10 mm"), so wrong calls can be explained (R7).
- **Source**: https://lmi3d.com/wp-content/uploads/2022/01/CS_Cyth_Systems_Pallet_Inspection_US_WEB.pdf ; the method is also in the CHEP patent family US 7958624 / 8881360.
- **Cost**: €10–25k per sensor, plus a PC, lighting enclosure and conveyor gap, plus months of development. No licence fees, and Cboost owns the whole stack.

A5. **Tell the type by reading what is printed or branded on the pallet, not by its shape.**
- **QR codes**: EPAL QR pallets (since 2024, more than 4 M in circulation) carry a QR code on the right corner block that a standard barcode reader can read.
- **Brand marks**: EPAL, EUR, UIC and IPPC stamps, the EPAL control staple on the middle block, and pool colours (CHEP blue) are found by OCR or an image classifier. US 12430743 describes object detection plus OCR of ISPM15 marks.
- **Cost and fit**: barcode readers or 2D cameras at a few €k each. This separates same-size types that differ only in owner or brand (R6). Unmarked or worn pallets need a fallback such as A4's geometry.
- **Source**: https://www.epal-pallets.org/eu-en/epal-euro-pallet-qr , https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12430743 , https://www.sick.com/cl/en/pallets-with-qr-code/w/blog-pallet-epal-qr-code
- **Cost**: low hardware cost; moderate effort for OCR robustness.

A6. **Deep-learning anomaly detection trained only on good pallets of each type (MVTec HALCON Global Context Anomaly Detection, or the open-source Anomalib).**
- **What it is**: the model learns what a good pallet of a type looks like from a relatively small set of good images with no labels, and flags and localises anything that deviates. A rule step on the flagged regions then decides repair or discard.
- **Fit**: a new type needs only good examples, not labelled damage (R10). The "global context" variant also catches logical faults such as a missing post or board, not only surface defects.
- **Source**: https://www.mvtec.com/knowledge-base/technologies/deep-learning/methods/anomaly-detection , https://www.mvtec.com/company/news/article/anomaly-detection-with-mvtec-halcon
- **Cost**: a HALCON runtime licence per station (in the €k range) or free with Anomalib, plus a GPU PC and image collection.
- **Risk**: used pallets vary a lot (dirt, stains, earlier repairs), so false alarms may be high. This is not tested on pallets in public sources.

A7. **Make the published industry criteria the backbone of the decision: a declarative rule table over detected components.**
- **What it is**: the component-level faults of the EPAL Terms of Exchange and Quality Classification encoded as data:
  - a board missing or broken across or at an angle;
  - a block missing or split so that more than one nail shank is visible;
  - a block twisted more than about 1 cm;
  - contamination, and A/B/C wood colour and moisture.
  ISO 18613 Annex A (defects that make a 4-way block pallet unacceptable, and the minimum repair criteria) and UIC criteria go in the same table, with the customer's rules ("four missing posts = discard") as overrides.
- **Fit**: it works with any sensing (A1–A6). A rule change or a new type is a data change that can be deployed remotely (R10, R11), and every call can be traced to a rule (R7).
- **Source**: https://news.epal-pallets.org/PDF/EPAL_Quality_and_Exchange_GB.pdf , https://ee.epal-pallets.org/fileadmin/user_upload/ntg_package/images/Produktdownloads/Klassifizierung/Faltblatt/EPAL_Qualita__tsguide_Faltblatt_A4_GB.pdf , https://www.iso.org/standard/62562.html
- **Cost**: buying ISO 18613 (about CHF 100) plus a rule engine that is small to write. The real cost is perceiving the components well.

A8. **Inspection that outputs a per-element defect map and repair recipe; the three-way label is derived from it (CHEP's automated inspection-and-repair approach).**
- **What it is**: the station maps each board and block and its damage, compares top and bottom decks with the expected profile of the type, and produces a damage report. From that report it derives the outcome:
  - pass: no repair needed;
  - a repair recipe per element;
  - beyond repair: discard, with the sound parts reused.
  The judgement becomes a function of an element-level record, so new customer rules don't need new sensing, and the record can drive a repair station later.
- **Source**: https://patents.justia.com/patent/8881360 , https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10092987
- **Cost**: like A4 in sensing and software, plus a richer data model.
- **Freedom to operate**: check the patent family's claims and expiry (first filings around 2005–2006, continuations up to US 10092987).

## Other titles (not worked out)

- Sawmill board-grading scanner vendors (Microtec, LIMAB, Lucidyne) adapted from boards to whole pallets
- Beverage empty-crate inspector concept: fixed tunnel, strobe lighting, reject-only logic at line speed
- MRO-style disposition model: serviceable, repairable, condemned, with tagged reasons
- Robot-held 3D camera that moves around a stopped pallet (Solwr Sort, Rob-Spector); rated about 300–600/h
- Two parallel slower stations (2 × 500/h), so one can stop while the other runs; R5 by redundancy
- Bottom-only inspection: most fatal damage (blocks, bottom boards) shows from below
- X-ray or metal detector on the blocks for hidden or broken nails
- Ultrasonic or stress-wave grading of pallet parts (USDA Forest Service, 1994 research)
- Weighing the pallet as a cheap proxy for moisture, contamination or missing parts
- NIR or hyperspectral sensing for oil and chemical contamination (EPAL Class A/B cleanliness)
- Bootstrap a model from public pallet-damage datasets (Roboflow "pallet damage classification"; Zenodo 10391024: good, repair, dismantle)
- Look up the type and history in the EPAL Digital Pallet Passport via the QR code; inspect only for the condition delta
- RFID or iPAL tags on pool pallets (EPAL rejected RFID on cost, benefit and feasibility)
- Pre-grading at the receiving dock by drivers or staff with a phone app; the station only confirms
- Inverted: send every pallet to the repair station, where the repair worker decides; no separate classification point
- AI proposes, a remote human confirms only the low-confidence cases
- Buy a used complete Euro-pallet sorting line with UIC/EPAL testing (e.g. ABB/CEKAMON offered on resale.info)

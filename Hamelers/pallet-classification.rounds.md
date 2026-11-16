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

Line-scan render (2026-11-13): simulated RGB line-scan through the 250 mm gap, tilted 25 deg along travel (scratchpad linescan/render.py). Findings: bottom-board undersides, nails, dirt and a broken bottom board show clearly; off-axis pixels see the inner side faces of the outer-row blocks, so a missing outer block shows; the centre block stays hidden; the tilt shows only the trailing end faces (a second camera tilted the other way would show the leading ones). Draft evidence for O9/O11 bottom views, idealised wood.

Interactive bottom-scanner simulator (2026-11-13): https://claude.ai/artifact/LWEtEbnDJVfgpG4qrgoDeh (source: session scratchpad bottom-scanner/index.html). 3D conveyor + bottom RGB line-scan (0, +25, -25, dual, custom tilt), 9 pallet types incl. plastic and moulded, intact or damaged, image ray-traced live from the same geometry.

Dual bottom cameras offset to the belt sides (2026-11-13, simulator v2): each camera sits in its scan plane, offset along z, aimed at the belt centre. Noise-free comparison, EUR with vs without the centre block, +25 deg: centred camera 0 pixels change; side offset 200 / 400 / 600 mm: 27 / 30 / 102 pixels (at 600 mm a ~34 mm strip, one block long, ~6% brightness change). A grazing view of the centre block side face: weak evidence, not a reliable check alone. Side cameras compress the far side of the belt; two opposite sides compensate.

Simulator v3 (2026-11-13): FOV fitted to the conveyor width per camera, and perspective correction (each line resampled from native pixels onto uniform mm on the belt plane). Side camera at 600 mm, +25 deg: fixed +-42 deg FOV covers belt z -569 to 10849 mm (most pixels wasted); fitted 70.5 deg covers -657 to 690 mm. Native pixel size varies 2.3 mm (near side) to 12.9 mm (far side) with 320 px, so correction gives uniform geometry, not uniform sharpness. Corrected board edges within 3 mm of true on the belt plane; faces at other heights keep parallax.

Simulator v4 (2026-11-13): one LED bar under the gap centre (x 0, 250 mm below the belt) serves both +-25 deg cameras; it stays clear of both scan planes (they pass ~117 mm either side at that depth); with a 0 deg camera the bar must move aside (its plane runs through the gap centre). Pallets now cross with random lateral offset and yaw (default +-80 mm, +-5 deg): the line-scan image shows them sheared, and the side the offset moves toward is seen at a shallower angle.

Simulator v7 (2026-11-13, WebGL2 rewrite): GPU tracer (fragment shader), real sensor sizes (1k/2k/4k, square pixels), thin-lens depth of field, traced rollers and window dirt, wear (splinters, mud, wet, repairs, labels, wrap), chamfered blocks, tapered plastic feet, notched stringers, burnt EPAL/IPPC marks, 1-3 damages per pallet incl. borderline, belt slip / speed ripple / touching pallets, six station area cameras, visibility map, A-B compare, hover tips, follow, slow motion. Measured headless: RTX 2070 and Intel UHD (CML GT2) 60 fps in real time at 2k (RTX also 4k); CPU-only SwiftShader >= 10 fps with the belt slowed. Finding: with the single light under the gap and side cameras at +-400 mm, the middle-row blocks side faces (incl. the centre block) are visible through the board gaps: ~16,900 px per camera at 2k; missing centre block changes ~21,000 px (centred 0 deg camera: 0). The earlier CPU result (30 px) was limited by 320 px and per-camera side lights that left those faces dark.

Simulator v8 (2026-11-13): adjustable roller gap (clear opening between the rollers beside the scan line; earlier versions had 350 mm), rollers now shade the light; photo textures (CC0 Poly Haven scans) with normal maps and rounded edges; progressive photo render (soft light, one indirect bounce) for showing the concept. Gap finding, dual +-25 deg cameras at +-400 mm, LED bar 250 mm below the gap centre, EUR missing centre block: the camera rays are not the limit (they clear the rollers even at 40 mm, by 2 mm); the light is. Light reaches the scan plane up to 232 mm above the belt at a 100 mm gap (whole pallet, images identical to 350 mm), 104 mm at 60 mm (deck undersides seen between the bottom boards go dark), 62 mm at 40 mm (block sides and cross boards dark too; damage signal 21,452 -> 15,678 px). So ~80-100 mm suffices with this light; a narrower gap needs the light closer to the gap or split per camera. Assumed geometry (Ø60 rollers, 125 mm pitch).

Simulator v9 (2026-11-13): live top camera (1.7 m up, 2.6 m of travel in view, 1 frame per 44 mm = 10 fps) with a simulated detector (boxes from true geometry, 0.8% edge jitter, 2% misses, 80 ms latency, some touching pairs merged into one box) and a tracker (lead/trail edge, slip rate) whose estimate, converted with an assumed 140 mm pallet height, now triggers the bottom capture window and the station cameras. Measured over ~25 pallets: station trigger error mostly 2-15 mm, worst seen 37 mm; mean about 7-10 mm. Merged touching pairs give one capture holding two pallets: a real failure mode to plan for (e.g. a gap-making conveyor before the station, or splitting by the bottom-image gap). Assumed numbers throughout.

Simulator v10 (2026-11-13): pallets jostle (sideways and yaw wander, short hesitations, slip/ripple) and snag at the scan gap: a leading bottom edge droops over the unsupported span (droop ~ pallet warp x gap factor; broken-board ends and sagging spans droop more) and catches on the far roller, giving a stall, a yaw kick and a nose dip. Model only, coefficients assumed, not measured. Model estimate for intact pallets (all types): 40 mm gap rides over; 100 mm ~0.4-0.5 catches per pallet, ~3 mm stall (max ~10); 350 mm ~1.5 catches per pallet, ~19 mm stall (max ~57), turns up to ~5 deg. Stalls and turns while a pallet is over the scan line stretch or bend the line-scan image, so a wide gap costs image geometry as well as light; tracker trigger errors stayed ~8-9 mm mean, max ~29 mm at 350 mm vs ~23 mm at 100 mm. Together with the light result (v8): ~80-100 mm looks like the useful range; worth measuring with real pallets on a test conveyor (warp, catch rate) before fixing the gap.

Simulator v11 (2026-11-13), now kept in this folder: `bottom-scanner/index.html` (textures in `bottom-scanner/tex/`, CC0 Poly Haven). Added: a timing and data budget tab, exposure and sensor noise (full well 10,000 e-, read noise 12 e-, auto gain; reference 100 us at f/4 with the LED bar at 100%), motion blur over the exposure, and unusual arrivals flagged rather than judged (upside down, rotated 90 deg, two stacked, cardboard stuck underneath; protruding nails as a repair damage; snow and ice as wear). Budget findings, all assumptions: 1000/h is a 3.6 s cycle; with 400 mm spacing the longest type (1219 mm) needs 0.45 m/s, so 0.44 m/s gives 978/h; line rate 669 lines/s at 2k (1.49 ms per line), 4.1 MB/s per line camera (GigE is enough); top camera 23 MB/s at 2.3 MP; about 56 MB kept per pallet, 56 GB per hour if everything is stored; 2.4 s from the end of the bottom scan until the pallet leaves the station frame. Motion blur is negligible for the line-scan (<0.1 px at 100 us) but reaches ~0.7 px for 5 MP station cameras at 1 ms and several px at 10 ms, so station cameras want <= ~0.5 ms exposure or strobed light.

Simulator v13 (2026-11-13): station lamps (assumed: six LED panels 1.25 m up beside the belt, four low ones at the ends, on beams) are now part of the traced world, and every view is lit by all lights (the LED bars under the gap plus the station lamps); rays escaping upward see the lit hall. Finding: the tilted bottom cameras see past the pallet edges straight into the high station lamps (bright stripes beside the pallet in every line), so a real station needs the lamps shielded or placed outside the bottom cameras' scan planes. Not yet modelled: shadows from the station frame and from neighbouring pallets.

Simulator v14 (2026-11-13): the LED bar(s) and line-scan camera bodies are part of the traced scene; every pallet now shadows everything (other pallets, rollers, floor), not only itself; the high station lamps moved to x = -300/0/+300 mm so they stay out of the +-25 deg bottom scan planes (about +-580 mm at their height), with a live check that names any bottom camera that sees a lamp (a centred 0 deg camera still sees the middle lamps). Readback batched into one copy per frame: Firefox on NVIDIA now holds ~59 fps in real time (was 25 fps with the belt at 0.02 m/s).

Simulator v15 (2026-11-13): adjustable conveyor speed (0.2-1.5 m/s; Playback is now the separate simulation-rate slider); the feed holds 1000 pallets/h, so a faster belt opens wider gaps (never under 400 mm). Effects at 1k / 2k sensors scale with speed: line rate 334 / 669 lines/s at 0.44 m/s, 760 / 1520 at 1.0, 1140 / 2280 at 1.5; line data stays small (GigE). What breaks first: area-camera motion blur at 1 ms (5 MP station cameras: 0.73 px at 0.44 m/s, 1.7 px at 1.0, 2.5 px at 1.5, so shorter exposure + more light or strobes), tracking (80 ms latency = 35 / 80 / 120 mm of travel; measured trigger error mean ~5-6 / 15-19 / 26-34 mm, max 18 / 45 / 83 mm), and time to decide before the pallet leaves the station (2.4 / 1.0 / 0.7 s). Gap sticking is modelled independent of speed (assumption).

Simulator v16 (2026-11-13): optional faster middle section (+0-50%, |x| < 2 m, covering the top camera's view and the station); a pallet changes speed as its centre crosses a section end, the section's encoder drives the line-scan and tracker. Touching pallets separate by about (factor - 1) x pallet length: +10% opens ~120 mm on a 1219 mm pallet, +20% ~240 mm. Test with 60% of pallets touching and all touching pairs merge-prone: same speed 5 merged boxes / 4 merged captures in 45 s; +10% and +20% none. Cost: line rate and blur scale with the section speed (+10% -> 368 instead of 334 lines/s at 1k). The infeed speed still sets the capacity. Answers the merged-box failure from v9 mechanically; the transfer model (instant at the centre, no slip on the faster rollers) is an assumption.

Simulator v17 (2026-11-13): source split into `bottom-scanner/src/` (template, styles, shaders, js modules, textures); `python3 build.py` writes the single self-contained `index.html` (textures embedded, ~4 MB; three.js and fonts still from a CDN). Added: a stand-in classifier (not a model: damage found with a probability from traced image evidence and image quality, close calls undecided) checked live against R2c (>= 80% labelled) and R7c (<= 20% wrong, type and condition separately); service wear (2%/month LED output, 6%/month window dirt, assumed) and faults (LED bar out, a lamp out, encoder 8% short); stall length in belt travel proportional to speed at the gap and turn proportional to its square root (assumed); middle-section transfer driven by the share of the pallet on the faster rollers with 80 mm slip relaxation; shareable settings code/link; guided tour; under-belt photo view; plastic surface; cards built over several frames; half-size textures and fewer kept images on phones. Stand-in results, ~16 pallets per run, 60 s each (so +-10-15 points of noise): default dual +-25 deg, 100 mm gap: type 88% labelled / 14% wrong, condition 88% / 7%, both within target; centred 0 deg: condition 73% labelled / 36% wrong (misses the centre block); LED bar failed or 12 months without service: type 56% / 44% wrong, condition 94% / 47% wrong; encoder 8% short: type 75% / 42%, condition 75% / 25%. The direction is meaningful, the values are not: all probabilities are assumptions.

Simulator v18 (2026-11-13): defaults 0.45 m/s infeed (1000/h with the longest type at 400 mm gaps) and middle section +10%. Batch tab runs the stand-in classifier on 100-1000 pallets drawn like the feed (no live tracing; damage evidence traced once per type and damage; merged touching pairs give one label for two pallets; tracking and sticking not included), with 95% ranges and CSV. 1000 pallets each (stand-in, assumed probabilities; compare rows, not absolute values): default: type 91% labelled / 12% wrong, condition 87% / 14%, discards found 61%, false alarms 5%. Centred 0 deg: condition wrong 19%, discards found 38% (centre block). Middle section at the same speed: condition labelled 79% (below 80%: merged pairs hide pallets). 12 months without service: type 73% labelled / 35% wrong, condition wrong 27%. Gap 40 mm: no worse than 100 mm in the stand-in (it judges evidence, not lighting realism; the light result of v8 still holds).

Simulator v26 (2026-11-13): glare and air. Lights now share one unit across views: the LED bar fills a 100 us line exposure as the lamps fill a 1 ms area exposure, so the area cameras see the bar 10x brighter than before (assumes similar lenses and pixels; line cameras with larger pixels would make it more), and the line cameras see the lamps 10x dimmer. Lamp faces have their real radiance (intensity / face area). The bar is a diffuse (Lambertian) emitter with an optional louvre film along its length (+-45/30/20 deg). Area cameras get lens glare (3% veiling glare with a ~distance^-2.5 tail, one ghost at 0.2%; assumed) from the full HDR image; dust in the air scatters light toward the cameras (single scattering, forward-peaked, 0.5 mg/m3 default; assumed 0.5 m2/g). Findings: the side station cameras sit in the gap's plane and look straight down it at the bar (a clipped strip ~10 px wide, ~1% of the frame), and the bar also lights the pallet underside through the gap. Glare from it is modest in this model: +3% (sRGB) beside the strip, ~0.5% elsewhere; the bar is ~5 stops over the wood, not the 8-11 estimated by hand earlier (that assumed a much brighter bar than the line-scan needs). Dust up to 5 mg/m3: no visible effect (<0.1%). A +-30 deg louvre removes the strip from the side views, but passes only ~20% of the bar's light to the scan line (+-45 deg: ~36%, +-20 deg: ~13%), because at 250 mm a long bar lights the line mostly from oblique angles along its length: line signal 5000 -> ~1000 e-, so the bar needs ~5x the power. Cheaper options to try next: a short shield or offset of the side cameras along the travel, or strobing the bar between station exposures.

Simulator v27 (2026-11-13): conditions, all assumed. Debris on the bottom windows (25 mm in front of the lens; ~1.5 specks of grit per month, up to 10; optional splinter on the first camera's window), dust on the LED bar (~4%/month, uneven), fogged windows, light drivers (DC / PWM 1 kHz 50% / 100 Hz ripple at 30% depth), light colours (bar and lamps at 6500/4000/3000 K, each camera white-balanced to its own light), daylight in the hall (overcast, or sun with passing clouds), bottom-camera vibration (24/31/61 Hz, default 0.1 mm), rolling-shutter area cameras (20 ms readout), uncalibrated lenses and sensors (1% barrel distortion at the edge, +-2% pixel gain, dark offset), pallet nose bouncing after landing on the far roller (10 Hz, decays over ~3 cycles), and mirror reflections of the lamp faces in shiny surfaces (zinc rollers, steel, wet wood, ice, plastic, wrap; Fresnel, blurred by roughness). Left out: diffraction (< 0.3 px even at f/8 on 7 um pixels) and colour reconstruction / diffraction in the area views (rendered far below the real cameras' resolution, so they would be exaggerated). Findings: debris on a line-scan window is far out of focus but the aperture is small (f/4 on a ~5 mm lens: ~1.3 mm), so a 1-2 mm speck darkens a band of ~5-10% of the columns in every line, and a splinter blacks out a band: the window needs to stay clean (slanted window, air knife, or cameras looking in from the side). With a 100 us line exposure, a PWM-dimmed bar at 1 kHz gives full on/off banding between lines, and a 100 Hz ripple driver bands by up to 60%; at a 1 ms area exposure PWM at 1 kHz happens to average out exactly, ripple still swings ~60% between snapshots: flicker-free (DC) drivers are a requirement for the lights. Zinc rollers show bright streak reflections of the bar and lamps in the side views. Cost: Intel UHD 47 fps with defaults (was 52), RTX 59 fps.

Simulator v29 (2026-11-13): the stand-in classifier's image quality now follows the conditions (debris share of the columns, flicker, fog, vibration, uncalibrated lens and sensor; one shared line-signal function with the budget, so louvre and bar dust count too); window and bar protection (none / slanted covers keep 40% of the grit and dirt / air knife 10% and no splinter, ~40 m3/h compressed air; assumed); side-camera height and position along travel; station and top camera bodies with their posts and a top frame in the traced world; optional indirect light (4 bounce samples) in Compare and Batch; Save PNG for photo renders and the zoom view; capped indirect samples (no speckles in short photo renders); a test suite in `bottom-scanner/tests/run.mjs` (18 checks, all passing). Findings: moving the side cameras 150 mm along the belt hides the LED bar from them completely (the rollers block the view down the gap), with no light lost: the cheap fix for the glare (v26), much better than a louvre. Lowering them to belt height does not help in this model, because the conveyor side frames end at the gap and the camera looks through that opening. Indirect light raises the damage signal a little (missing centre block, 1k px: 100 mm gap 5,362 -> 6,030 px, 40 mm 3,466 -> 4,156 px), so the 40 mm gap goes from 65% to 69% of the 100 mm signal: the 80-100 mm conclusion (v8) stands.

Simulator v30 (2026-11-13): code health, assumptions list, real-world damage. The light, colour, driver, daylight, lens-flaw and window-debris code moved to its own file (`src/js/06a-conditions.js`). New test checks compare each script copy of a shader formula with the image (flicker, louvre, window debris; 23 checks, all passing). The louvre check found a bug: the budget's louvre share left out the receiving face's cosine (now 22% instead of 20% at the belt centre). It also showed that the bar's 4 light points make the louvred light vary along the bar (22% between points, up to ~35% above one); the unlouvred bar ripples ~±8% the same way. New Assumptions tab: 50 values the model rests on, read from the constants in the code (and the shader source), each with basis (assumed / typical / estimate / physics / given / standard) and what it affects; 33 are plain assumptions. Damage catalogue extended from the EPAL quality classification for the open exchange pool (EPAL/GS1 leaflet QC 03/2016; non-binding guide, the exchange terms are binding): contamination that can pass onto goods (oil, paint, mould), rotten wood, inadmissible components (woodworm, wane, an under-sized repair board), a block skewed over 1 cm (up to 1 cm is wear, class C), a split board with nail shanks visible, illegible marks, and adhesions (a caught strap, film or tape: flagged, remove then grade). Each damage is equally likely within a type (assumed), so the original structural damages are now rarer. Rendering every damage in Compare (dual +-25 deg, 100 mm gap): the bottom cameras see all of them except illegible marks and top-deck nails (station cameras), and, depending on placement, some CHEP cases. Found on the way: with the centred 0 deg camera and the shared LED bar, the bar sits 80 mm aside, right under a roller at a 100 mm gap, so that setup images almost nothing (a leftover from the 350 mm gap layout).

Simulator v31 (2026-11-13): a bottom board that has worked loose from all blocks but one turns flat about that block's nails (2-15 deg, assumed, free end outward): a whole outer board, or the loose piece of a broken board. Modelled as the box around the turned board trimmed by four upright cuts (no tracer change, no speed cost; the board's small edge chamfers are dropped). Severity repair (EPAL: protruding broken boards). Both show clearly in the bottom images; a whole board turned 5 deg sticks out ~55 mm past the pallet side. Not modelled yet: the free end hanging and dropping into the scan gap (in TODO).

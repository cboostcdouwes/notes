# TODO

Hamelers: pallet classifier. Most important first. Research log: `pallet-classification.md`.

- **Review the design decision** (`pallet-classification.md`, *Decision*, Draft 2026-11-13): confirm *Why* and
  *Rejected*; say where the project's design document lives.
- **Stage 0, sensor-independent data**: the customer's type list and full rule list, ground-truth labels from the
  customer's graders, the existing machine's error and undecided rates. Waits on knowing the customer.
- **Stage 1, sensor test**: candidate final sensor models on real pallets; decides the station design and prices
  the availability options against EUR 700k.
- **Machine-safety check** of servicing a running station (only if one lane is chosen).
- **Ask the operating schedule** (24/7 or shifts): may make off-shift maintenance enough.
- **Freedom to operate**: CHEP patent family US 7958624, 8881360, 10092987.
- **Child decisions**: interface to the external handling; software stack; update mechanism (remote and offline).
- **Belt speed and pallet spacing**: at 0.44 m/s with 400 mm between pallets, the longest type (US 48×40, 1219 mm)
  gives only 978 pallets/h; needs >= 0.45 m/s or less spacing (simulator, Timing & data tab).
- **Test-conveyor measurements** for the simulator: pallet warp and catch rate at candidate gaps, wood colour, light
  falloff; until then its sticking and image numbers are assumptions. Simulator: `bottom-scanner/` (edit `src/`, run
  `python3 build.py`, check with `node tests/run.mjs`, share `index.html`).
- **Light requirements for the station spec**: flicker-free (DC) drivers for the LED bar and the station lamps
  (PWM or mains ripple bands the 100 us line exposures); matched colour temperatures or per-camera white balance.
- **Protect the bottom windows and LED bar** from debris falling through the gap (splinters, grit, meltwater):
  a steep window (grit slides off) and an air purge; in the simulator with assumed rates (window angle, air purge);
  needs real deposition rates at several window angles from a test. The LED bar stays unprotected. In the simulator
  a 60° window costs the dual ±25° cameras almost no light over a flat one (ends of the line 78% vs 81% through plain
  glass) while grit slides off; a vertical one lets only 52% through at the ends and blinds a 0° camera.
- **Choose the bottom light setup** (simulator, Light section; geometry and powers assumed). Bar beside each camera
  behind its own window: protected like the windows, but 62% of the signal of the bar under the gap (dual cameras,
  two bars). Side lights: raking light that shows relief, but 14% of the signal at the belt centre and 18× brighter
  550 mm out, so only useful as a second image with alternating lines (doubles the line rate and data). Focused LED
  spot per camera (±2° across travel, one bar's LED power), since 2026-11-19 in the camera's plane, level with its
  lens and 80 mm further out (beside a ±750 mm camera, so a top twin sharing the plane doesn't see it): 8.9× the light
  of the bar under the gap at the belt centre, 0.14–2.09× of that along the line, covers the whole view through any
  gap the view passes; the best protected option. Off-the-shelf beams with the same LED power per camera: 3 × 10°×50°
  oval spots (e.g. SVL SX30-WHI-L) 4.9×, 13 × 10° round spots 6.9× at the belt centre; both reach 300+ mm. Run continuously (DC driver);
  switch off between pallets for eye safety; check that the side station cameras don't look into a beam.
  No off-the-shelf compact LED found that projects a 1.3 m line from ~600 mm: ask vendors (Smart Vision Lights LXE300
  with narrow lens, 300–4000 mm, IP65, chainable, is a focused bar rather than a spot; Opto Engineering LTSP spots need
  a custom line lens). Decide with real images from the test conveyor.
- **Place the side station cameras ~150 mm along the belt from the scan line**: there they no longer see the LED bar
  down the gap (simulator v29), with no light lost.
- **Simulator: centred 0 deg camera with one light** puts the LED bar under a roller at a 100 mm gap (the 80 mm offset
  dates from the 350 mm gap). Choose the offset from the gap, or drop the 0 deg preset.
- **Simulator: the LED bar is 4 point lights**, so its light ripples about ±8% along the bar (22-35% with a louvre).
  More points or a line-light integral would smooth it, at some frame-rate cost.
- **Damage frequencies**: the simulator draws every damage of a type equally often; real shares from the customer's
  graders would make the Batch results meaningful.
- **Simulator: loose boards hanging, the full model.** Now a loose board only turns flat (2-15°, static). In reality its
  free end also hangs down; the rollers push it back up except over the scan gap, where it drops in and can catch (likely
  the worst sticking case). Needs per-part motion (the board's angle following the pallet's position over the rollers)
  in the motion model and the shader, and six cutting planes per part instead of four for turning and hanging at once.
  Roughly a day; worth it if catching at the gap matters on the test conveyor.
- **Flipped pallets (R17)**, simulator (EUR, broken bottom board, Compare > "Flipped from above vs upright from
  below", pixels differing by more than 30/765). Page default since 2026-11-19 (user's settings): shared planes, the LED
  bar under a 100 mm gap with one top bar over it, cameras at ±700 mm: 14–16% differ (4–7% without the station lamps).
  The one top bar sits between where the two pairs' turns put it (95 mm off each, about 20° off in direction); a top
  bar per pair lit each top view with both (43–45%). Exact with one bar only if the planes cross at mid-pallet height
  (wider gap). Best found: **one 30 mm gap for all cameras (a belt could
  replace the rollers later), dual ±25° cameras beside the belt at ±750 mm, their views crossing at the gap centre at
  the rollers' centre height, each turned top camera sharing its bottom camera's plane (turned about where that plane
  crosses 72 mm up), black plates beside each camera's twin, a line-lens spot per camera in its plane 80 mm further
  out than the lens, 11 µs: 3.0–3.4% differ with the station lamps on, 2.0–2.5% without.** Views clear the Ø60
  rollers by 10 mm at f/4 (5 mm at a 20 mm gap); no sticking. Costs: the spots light the line from its side, 0.14–2.09×
  the centre's light within 550 mm of the centre (top and bottom alike, so the images still match); the two pairs'
  spots cross-light each other near the belt above gaps of ~40 mm or more (80 mm: 17%). With the LED bar under the gap
  instead, the views need a wider gap (a bar under a 60 mm gap lights only 60 mm up them) and the one top bar matches
  only approximately (see the page default above). Residual 2%: a few board edges, cause
  not traced. With a belt, the ±25° views pass under the belt ends: drop the return runs away from the gap (snub
  pulleys). Earlier variants: planes crossing at mid-pallet height with two bars, 120 mm gap 18% (0.3% without lamps);
  rollers' own spacing with spots under the belt centre, top views through the next roller space 0.6%; the bar under
  a 250 mm gap 18.6%; mirrored top cameras ~17%. Still to do: trace the stand-in classifier's evidence in the pallet's
  real orientation (now always upright); make flips follow heavy bottom damage instead of 3% at random; pallet heights
  other than 144 mm (one-way 120, CHEP 156) put the top cameras' plane off the deck.
- **Simulator tests: freeze a known pallet.** The image checks render whatever random pallet the feed holds when the
  tests pause it, and that depends on the random generator's whole history, so changing any page default can move a
  check across its threshold (2026-11-19: vibration needed "unusual cases" pinned on in the tests' baseline). Fix:
  reseed the feed on restart (same settings, same pallets; also makes shared settings codes reproduce the feed), or
  give the tests a fixed pallet. Should; before the next default change.

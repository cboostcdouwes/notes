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
  spot beside each camera (±2° across travel, one bar's LED power): about 19× the light of the bar under the gap, even
  along the line (0.9× at 550 mm), covers the camera's view up to 224 mm above the belt; the best protected option.
  Off-the-shelf beams with the same LED power per camera: 3 × 10°×50° oval spots (e.g. SVL SX30-WHI-L) 10.5×, ripple
  0.46–1.40× along the line; 11 × 10° round spots 6.9×, 0.92–2.11×; both reach 300+ mm. Run continuously (DC driver);
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
- **Flipped pallets (R17)**, simulator: top line-scan cameras (mirrored or turned), black plates behind the scan lines,
  and Compare > "Flipped from above vs upright from below" (2026-11-19, EUR, broken bottom board, pixels differing by
  more than 30/765): mirrored 59% at a 100 mm gap; turned + plates 56% at 100 mm (the top cameras look past the deck
  onto the zinc rollers), 18% at 250 mm, 0.5% at 250 mm with the station lamps kept off the scan line. Mirrored stays
  ~17% even then: it sees the pallet's other block faces. Between ~180 and ~230 mm the bar under the gap lights only the
  bottom cameras' plates (+4%). So: **turned top cameras, black plates, gap >= ~230 mm, and no station-lamp light on
  the scan line** (shield, or strobe the lamps with the area cameras). Costs: sticking at 250 mm 1.33 catches/pallet,
  14 mm average stall (100 mm: 0.39, 4 mm), model only. Alternative to the wide gap: black sleeves on the two gap
  rollers (not simulated). Still to do: trace the stand-in classifier's evidence in the pallet's real orientation (now
  always upright); make flips follow heavy bottom damage instead of 3% at random; pallet heights other than 144 mm
  (one-way 120, CHEP 156) put the top cameras' plane off the deck.

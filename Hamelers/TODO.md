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
  `python3 build.py`, share `index.html`).
- **Light requirements for the station spec**: flicker-free (DC) drivers for the LED bar and the station lamps
  (PWM or mains ripple bands the 100 us line exposures); matched colour temperatures or per-camera white balance.
- **Protect the bottom windows and LED bar** from debris falling through the gap (splinters, grit, meltwater):
  slanted window, air knife, shield, or cameras looking in from beside the gap. Compare in the simulator first.

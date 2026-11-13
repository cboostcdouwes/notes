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

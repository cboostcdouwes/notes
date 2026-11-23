# Light lift offset

Branch `feature/light-lift-offset`. Started 2026-11-23.

## Problem

The two light lift motors move together: one `Move(height)` puts both lights at the same height,
with the per-axis `home_below_sled_base_um` in `config/light-lift.toml` as calibration. The user
wants an adjustable offset between the lights while keeping the single height control.

## Requirements (user, 2026-11-23)

- R1: The offset is a server-held setting, set by a new `SetOffset` RPC, and applied to every
  later `Move`.
- R2: The offset is the light lift's only calibration. The sled base is dropped as a reference:
  clients request heights with their own calibration. `home_below_sled_base_um` goes.
- R3: The height is light 1's height above its homing reference. Light 2 goes to height +
  `offset_um` (signed). Changing the offset only ever moves light 2. (Replaces the earlier
  "height = lower light": with the offset as calibration, the lower light switches when the
  offset changes sign, which breaks a client's calibration.)
- R4: A changed offset applies on the next `Move`; `SetOffset` moves nothing.
- R5: After a server start the offset is `offset_um` from `light-lift.toml` (today's measured
  sensor difference, 2000). `SetOffset` changes it in memory until the next restart.
- R6: `SetOffset` needs no session claim: any client may set it at any time (kept after the
  offset became the calibration; the risk of a client without the claim putting the lights out
  of level was raised and accepted).
- R7: The offset is read like the height: `offset_um` in `GetState` and `GetStateChange`, no
  separate `GetOffset`.

## Design

- Config: `offset_um` replaces `home_below_sled_base_um`. Travel limits stay distances above
  each axis's reference. Startup refuses an offset that no height can give both lights within
  their travel.
- Heights: light 1 at `h` above its reference, light 2 at `h + offset_um` above its own.
  `Move(h)` is refused unless both lie within the travel; the error names the height range for
  the current offset: `min - min(0, d) ..= max - max(0, d)`. With `offset_um = 2000` the drive
  positions and the range (0..=76000) equal today's `[0, 2000]`.
- Proto: `rpc SetOffset (SetOffsetRequest) returns (Empty)`, `SetOffsetRequest { int32
  offset_um }`. `GetStateResponse.position_um` becomes light 1's height; `offset_um` is added:
  the offset the next `Move` applies (not necessarily the lights' current spacing, by R4).
- `SetOffset` is refused (`InvalidArgument`) for the same offsets startup refuses. Allowed in
  any state, also while moving. `GetStateChange` sends a new response when the offset changes.

## Steps

1. Config and heights: `offset_um` replaces `home_below_sled_base_um`, height = light 1,
   reported position = light 1; drive positions unchanged for the shipped config. Rust tests,
   `light-lift.toml`, `docs/guide/light-lift-toml.md`, proto comments.
2. `SetOffset` and `offset_um` in the state, stream on change; Rust tests;
   `docs/guide/communication.md`.
3. Python client: `set_light_lift_offset()`, `LightLiftStatus.offset_um`; tests; client README.
4. Debug panel: offset readout and input next to the height; tests.

## Open (for step 4)

- Panel step buttons promise "a mis-click moves a light by at most a millimetre". After a
  `SetOffset`, by R4, the next step also moves light 2 by the whole change in offset. Options:
  accept and reword, or have the panel's offset control follow `SetOffset` with a `Move` to the
  current height (panel-side only, server semantics unchanged).

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
- R6: `SetOffset` claims the lights like `Move` (user, 2026-11-23, step 3). It was first
  built without a claim; that made it a third kind of call next to open reads and session
  commands, with no API version check and no ownership receipt, and the Python client marked its
  session uncertain after it, so the next command failed with `SessionNotReady`.
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
  offset_um }`, a session command like `Move`. `GetStateResponse.position_um` becomes light 1's
  height; `offset_um` is added:
  the offset the next `Move` applies (not necessarily the lights' current spacing, by R4).
- `SetOffset` is refused (`InvalidArgument`) for the same offsets startup refuses, and claims
  nothing then. Allowed in any state, also while moving. `GetStateChange` sends a new response when the offset changes.

## Steps

1. Config and heights: `offset_um` replaces `home_below_sled_base_um`, height = light 1,
   reported position = light 1; drive positions unchanged for the shipped config. Rust tests,
   `light-lift.toml`, `docs/guide/light-lift-toml.md`, proto comments.
2. `SetOffset` and `offset_um` in the state, stream on change; Rust tests;
   `docs/guide/communication.md`.
3. Python client: `set_light_lift_offset()`, `LightLiftStatus.offset_um`; tests; client README.
4. Debug panel: offset readout and input next to the height; tests.

## Panel (step 4, user 2026-11-23)

- The panel's offset Set applies the offset at once: `SetOffset`, then a `Move` to the reported
  height, when the lights are Idle with a reported height. Otherwise it sets the offset only and
  logs that it applies on the next move. So the step buttons keep their "at most a millimetre",
  except for an offset set while the lights were not idle, or by another client.
- A refused follow-up `Move` (the current height out of reach at the new offset) is logged in
  red as "set, not applied"; the new offset stays set.

# TODO

## Generic / PolyMX split (`generic-polymx-split.md`)

- [ ] Review the proposed design, in particular guard mechanism G1 and the migration order
- [ ] Review the layered refactor proposal (`layered-refactor.md`)
- [ ] Review the library replacement analysis (`library-replacement.md`); decide on `ros2_control` (spike first)
- [ ] Answer the open questions (PolyMX guard list, latch/reset, panic policy, control model, session stream, names,
      fault history scale)
- [ ] P1: move into `generic/` and `polymx/` with no behavior change

## Small fixes

- [ ] Stale `SLED_AXIS_CONFIG` references: README *Sled travel limits* says the limits live in
      `server/src/sled_impl.rs` and need a rebuild. They live in `config/axis.toml` and need a restart. Comments in
      `client/ethercat_client/slide_cycle.py:25`, `client/tests/test_slide_cycle.py:169` and
      `client/debug_panel.py:62` cite the same constant. Low urgency; absorbed by P2 if P2 starts soon.

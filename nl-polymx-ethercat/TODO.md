# TODO

## Generic / PolyMX split (`generic-polymx-split.md`)

- [ ] Review the proposed design, in particular guard mechanism G1 and the migration order
- [ ] Review the layered refactor proposal (`layered-refactor.md`)
- [ ] Review the library replacement analysis (`library-replacement.md`); decide on `ros2_control` (spike first)
- [ ] Answer the open questions (PolyMX guard list, latch/reset, panic policy, control model, session stream, names,
      fault history scale)
- [ ] P1: move into `generic/` and `polymx/` with no behavior change
- [ ] Answer the six open questions in `generic-api-proposals.md` (rule language, transport, "Applied", commanding
      clients, runtime mailbox access; capabilities answered 2026-11-11: closed). R9 wording confirmed 2026-11-11
- [ ] Split proposal: state, decisions and open points of the 2026-11-11 review are in
      `ecomodul/HANDOFF.md`. Pending there: whether GA1 is reversed (a commanding client that stops polling
      triggers the safe stop; new clients never read old transitions)
- [ ] Review the split architecture proposal (realtime part, port, gRPC part over any `AsyncRead + AsyncWrite`;
      Claude doc, 2026-11-10: https://claude.ai/artifact/3m9uzE7XYWmtnhfNRaKVYF; the vault copy is newer since
      2026-11-11) and answer its open questions 1-2 (which sockets, stop the server when the front end fails).
      Answered 2026-11-11: the split is for timing isolation, testing, other front ends and separation of concerns
- [ ] Review the *SimBus and simulated devices* section of the split proposal (added 2026-11-11 without a design
      run): the `Bus` and `SimDevice` sketches, rig recordings, and how the Python tests reach the `SimHandle`
- [ ] Split proposal, *Known limits and future snags* (2026-11-11): decide snag 4 (what the fingerprint covers) and
      snag 5 (transition log); design the rejoin sequence that uses the mailbox write path (Q6); confirm that
      client SDO requests stay read-only
- [ ] Decide on the four safety gaps from the review of the split proposal (2026-11-11): group write for
      interlocked outputs, watchdog reaction checked per device at startup, a defined safe-stop action, active
      faults in `State`; plus the outcome of a command a rule overrides. Their tests are listed in the proposal's
      *Planned tests*; the design text doesn't contain the fixes yet
- [ ] Review the *Client-held guards* section of the split proposal (added 2026-11-12 without a design run; Q7 several
      commanding clients, Q8 client-held guard) and the `admit` hook it brings back into step 3. Answer its open
      questions 9-13: who sets the apply condition, held guards after a restart, operator release, client identity, a rule
      that forces a protected output
- [ ] Review the *IO-Link sensors* section of the split proposal (added 2026-11-12 without a design run; Q9: a named
      `[sensor.<name>]` entry with master, port and model). Later expansion noted there, not designed: IO-Link
      devices with several values or outputs, and other terminals with devices behind them (serial, CAN)
- [ ] ECOMODUL runs with `0x6007 = 0`: check on the rig what its outputs do when the server is killed. Applies to
      today's server too, so not tied to the redesign

## JAT ECOMODUL axis (`ecomodul/HANDOFF.md`)

- [ ] Check the rig PC's NIC for the r8169 interrupt coalescing that broke bus starts here (fixed on this PC by a
      udev rule; see handoff)
- [ ] Promiscuous mode looks unneeded: with coalescing off, 10 of 10 starts succeeded with promisc off and 10 of 10
      with it on (2026-11-09). One start right before had failed with coalescing off and promisc off, unexplained
- [ ] The udev rule `90-ethercat-nic.rules` didn't hold on this PC: on 2026-11-09 coalescing was back at the r8169
      defaults (1 / 20000) during the boot (the link also went down and up at 10:48; unknown if related). Find what resets it before the
      rig PC gets the same rule
- [ ] `docs/DEPLOYMENT.md`: EtherCAT NIC requirements (coalescing off, promisc if needed)
- [ ] Integration (step 9): apply `ecomodul/step2-ring-entry.patch` (ECOMODUL at ring index 9, postponed and
      reverted 2026-11-05), fill in the `"TODO"` values in `config/light-lift.toml`, pass `--light-lift-config` in
      `docker-compose.yml`. On the first rig start, check the log's `Group PDI length` stays within the 128 B
      `PDI_LEN` (estimate ~111-119 B with step 3's 14 B of outputs)
- [ ] Light lift values still provisional in `config/light-lift.toml` (2026-11-09): measure
      `home_below_sled_base_um` on the machine (0 for now); check the homing speeds (2 mm/s) and method 18
      once the sensor is mounted. Stroke 0-80 mm of the ~90 mm measured on the bench. Known: the base plate is
      4 mm above the bottom end (machine, 2026-11-10; in `ecomodul/light-lift-test.toml`), so with the sensor
      `home_below_sled_base_um` = 4000 minus the sensor's switch point above the bottom end
- [ ] Bench: both axes keep software limits [-40000, 0] from the driver's setup, so manual moves to + targets are
      refused with "internal limit" (statusword bit 11)
- [ ] Motion test passed on axis 1 (bench, 2026-11-09, with the deadlock fix) and on axis 2 (after dropping the
      `0x608F:02 == 1` check; 8000 inc = 1 turn measured, same timings as axis 1): enable, home (method 34), moves to
      -5 mm and back, stop mid-move with the power stage kept on, disable with the reference kept. The stop braked over 1.8 mm in 365 ms
      from 10 mm/s (reproduced: 1.80 mm / 357 ms). The scan shows 0x6083 = 0x6084 = 0x6085 = 25000 (50 mm/s², as
      configured), profile type 0 (linear), 0x605A = 5. So the drive brakes slower than set, or ~30 ms of delay plus
      ~33 mm/s². Move timings (bench 12:01Z, 10 ms cycle): 5 mm took 837 / 795 ms against 700 ms ideal, 2.8 mm took
      564 ms against 480 ms; stop at -1.30 mm braked over 1.50 mm in 332 ms. After ~3-5 cycles of handshake this
      fits an effective acceleration of ~40-45 mm/s² instead of 50, plus 30-60 ms before a stop brakes. Not
      pinned down (would need a per-cycle position trace); lights not critical, low urgency.
- [ ] The ECOMODUL runs outside its spec: it syncs on the process data event with a cycle "fixed to 1 ms"
      (manual §5.2.31.3, 0x1C32; sync phases listed up to 4 ms), the server runs 10 ms free-run. Gaps over ~5 ms
      raise sync errors (`0x8120`) that only `0x6007 = 0` hides (bench 2026-11-09: clean at 2 and 4 ms, faults at
      6, 8, 10 ms with `0x6007 = 1`). Unknown what else the slow cycle costs (the slow braking?). Low urgency;
      options if it matters: bus at ≤ 4 ms, or a separate faster ethercrab group for the ECOMODUL
- [ ] Re-enable moves the motor shaft by about half a cogging step (user's estimate, 2026-11-09), so a snap to the
      nearest step, not a rotor alignment; power-off doesn't move it, and the drive's counter stays put. At 200
      steps/rev and 1 mm/rev that is ~2.5 µm, inside the 10 µm estimate. Open, low urgency: the motor's step count
      and a measured angle
- [ ] One "lights" axis over both ECOMODUL axes, built like the sled; decisions and steps 4-8 in the handoff
      (2026-11-05). Steps 4, 5, 6a committed; 6b (gRPC service) committed (`c7145d3`); 6c (supervision loss
      policy) committed (`df46f95`); 7 (Python `*_light_lift` methods) committed; 8 (docs) committed; 8b (debug panel) committed; next: step 9 (integration)
- [ ] Light lift motor lacks torque at 10 mm/s (bench 2026-11-09; 5 mm/s works and is shipped). Drive runs stepper mode at
      3.54 A peak max, 2.65 A while moving, defaults never set for this motor (handoff). Get the motor's rated
      phase current from its data sheet, then raise the currents or lower `speed_um_s` in
      `config/light-lift.toml`
- [ ] At merge/release: bump `server/proto/API_VERSION` for the new `LightLift` service (`lightlift.proto`). Left to the
      release on purpose (user, 2026-11-09), so no two branches each call their API 0.0.6
- [ ] Fault codes in `ecomodul.toml` (manual §5.24.3) and drive faults on the fault channel. Option C chosen
      (user, 2026-11-10): 0x603F cyclic, one profile row per DS402 code; the display code (A00 ... E25) read
      from 0x2600 over SDO only while an axis is faulted (the front panel shows no code); D06/D07 `inoperable`
      like the rest. Step 1 written (2026-11-10): rows, 0x603F/0x683F in the TxPDO (13 B per axis), per-axis
      DriveFault records. Untested on hardware: does the module accept 0x603F in its TxPDO (init panics if
      not), and does the PDI stay within 128 B. Step 2 (the 0x2600 display-code read) dropped (user,
      2026-11-10): it needs a new mechanism, a mailbox task off the cycle, so the record names the code family only
- [ ] Topology check by vendor/product code, not name only (the 2/4/8-axis ECOMODULs presumably share a name).
      Low urgency while the driver checks the axis count.

## Versioning (`decisions.md`)

- [ ] Give client and server one version source per part, so lockstep can't drift: today `server/Cargo.toml`,
      `server/lib/Cargo.toml` and `client/pyproject.toml` each set `0.0.5` separately. Low urgency; fits naturally
      into P1, where each part gets its own version.
- [ ] Before protocol 1.0: decide what a major protocol bump means for older read-only clients (reads are open to
      every version today).

## Small fixes

- [ ] Stale `SLED_AXIS_CONFIG` references: README *Sled travel limits* says the limits live in
      `server/src/sled_impl.rs` and need a rebuild. They live in `config/axis.toml` and need a restart. Comments in
      `client/ethercat_client/slide_cycle.py:25`, `client/tests/test_slide_cycle.py:169` and
      `client/debug_panel.py:62` cite the same constant. Low urgency; absorbed by P2 if P2 starts soon.
- [ ] Unreachable name check at the start of `Ix7nh::init` (`server/lib/src/drivers/ix7nh.rs:1002`): the topology
      check has already run. Low urgency.

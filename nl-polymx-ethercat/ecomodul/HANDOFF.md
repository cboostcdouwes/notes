# JAT ECOMODUL driver: handoff

**State (2026-11-09):** branch `feature/jat-ecomodul`. Committed: step 1 (read-only driver, passed on the bench)
`b75cca0`, step 3 (motion in the driver) `e733d5a`, step 4 (lights config) `b070d76`, step 5 (simulated driver)
`7a23765`. Step 6a `eac93ad`, 6b `c7145d3`, 6c `df46f95`, rename `953682b`, 7 `34bda2f`, 8 `6548c58`, 8b `0475466` (debug panel); next: step 9. Step 2 (ring entry) is postponed until integration and reverted from
the working tree; its diff is saved in `step2-ring-entry.patch`.

## Goal

Add the JAT ECOMODUL-EtherCAT (2-axis servo amplifier) as a **new, extra axis on PolyMX**, next to the iX7NH sled.
Both axes are used. Decided by the user 2026-11-04, along with: first step read-only, no `research:design` run.

## The lights axis (decided by the user, 2026-11-05)

The two hardware axes form **one logical axis that moves the lights up and down**; gRPC exposes only that axis.
Built the same way as the sled, without a `research:design` run.

- **Separate lights, not one rigid frame:** they move together only because they get the same command. A fault on
  one axis doesn't have to stop the other within the same cycle, so the server combines them and the driver stays
  per-axis.
- **Move takes a position only.** Speeds and accelerations are fixed in the config (as decided in step 3).
- **No Hold/Resume.** Home, Move, Enable, Disable, Stop, GetState, GetStateChange.
- **Identical mechanics:** one set of config values covers both hardware axes. The driver writes and verifies the
  position scale (`0x608F:01` = 8000 increments per revolution), so the bench unit's differing `0x608F` settings
  are overwritten. `:02` is not checked: the drive ignores it (bench 2026-11-09, manual §5.11.8).
- **Homing on an inductive sensor at the bottom** (user, 2026-11-05; not mounted yet). The bottom is the drive's
  positive end (tested by the user). The sensor is wired to the positive limit switch input (user, 2026-11-09),
  so method 18. No end stop current. Backlash doesn't enter the reference: the axes are
  vertical, so the load rests on the same nut flank whichever way it moves. Repeatability depends on the sensor
  (hysteresis, temperature drift); a fixed approach direction and speed keep the hysteresis constant. Homing speeds
  are unverified.
- Normal moves: 10 mm/s and 50 mm/s², tested on the axis by the user (2026-11-05).
- **Heights from the sled base, in µm, upwards positive, converted in the server** (user, 2026-11-05): the server
  inverts the drive's direction and subtracts `home_below_sled_base_um` (the reference lies below the base). Chosen over the drive's home offset (`0x607C`),
  whose sign the manual leaves open.
- **No reaction to losing the master** (user, 2026-11-09): `0x6007` stays at the drive's 0, so after a master
  crash the lights keep their last commanded state and a running move may finish. Accepted because the lights are
  not critical. `0x6007 = 1` (fault on master loss) was tried and reverted: the drive then also faults on every
  process data gap over ~5 ms, and the server cycles at 10 ms (see `TODO.md`, ECOMODUL outside its spec).
- Precision: about 10 µm, an estimate, not a hard requirement (user, 2026-11-05). Spindle 1 mm/rev, about 90 mm
  travel (190 mm rail minus the 100 mm carriage; user, 2026-11-09); the exact limits are measured once the sensor
  is mounted. The motors have no encoder: reported
  positions are commanded, not measured.
- **Defaults for the gRPC step, accepted by the user:** service `Lights`, renamed `LightLift`; state `Error` if either axis faulted,
  `Homing`/`Moving` while either is busy, `NotHomed` until both are homed, `Idle` only when both are; position = the
  lower of the two; `Home` enables both power stages. Positions in µm (`position_um`), not mm.
- **Named "light lift", not "lights"** (user, 2026-11-09): `enable_lights`/`disable_lights` read as switching
  the lamps on/off, beside the tower lamps' `set_light` and the `VisionLight` brightness. Renamed everywhere
  before release: proto `lightlift.proto` (package and service `LightLift`, as `distancesensor.proto`),
  `LightLiftImpl`, `config/light-lift.toml`, `--light-lift-config`, the machine file's `[light_lift]`, and the
  client's `*_light_lift` methods. Prose about the two physical lights still says "lights".
- **Enable/Disable calls** (user, 2026-11-09; replaces "no `Enable` call"): the client chooses when the light
  motors are unpowered while standing still for long. Both keep the reference (worm screw holds the light).
  Disable is refused while either light is homing or moving (Stop, wait for Idle): the driver cuts power
  unbraked. New state `Disabled` = both homed, a power stage off (Disable, cleared fault, dropped power stage);
  Enable brings it back to Idle without re-homing. `Idle` needs both axes `powered` (Operation Enabled reached,
  new field in the driver's `Motion`), so Move is never refused in Idle.

Steps:

4. **Config** (written, uncommitted): `config/light-lift.toml`, `server/src/light_lift_impl.rs` (`LightLiftConfig`, loader), the
   server builds `Ecomodul::with_axes` from it. Read only when the machine file declares an ECOMODUL. Unmeasured
   values are `"TODO"` (user, 2026-11-05), so the server refuses to start once the ECOMODUL is in the ring. Config in
   µm and µm/s, converted to increments in the server. The driver stays generic (user, 2026-11-05): `zero_speed`
   (0x6099:02) is optional, required by every method that uses it and refused by -17, -18 and 34; the end stop
   current (0x2699) is optional, required by -1, -2, -17, -18 and refused by the rest (manual §5.14). New in the
   driver: `increments_per_revolution`, written to 0x608F:01 and verified; `StopUnverified` became
   `SetupUnverified`, covering the Quick Stop option and the scale.
5. Simulated ECOMODUL (committed, `7a23765`): `Ecomodul::new_simulated`, like `Ix7nh::new_simulated`.
6. gRPC, in three commits (user, 2026-11-09):
   - 6a: the driver publishes both axes' status and motion on a `watch` (`Ecomodul::watch`), from the cycle and
     from each command (the simulated machine runs no cycle).
   - 6b (written, uncommitted): `lightlift.proto`, `LightLiftImpl` in `light_lift_impl.rs` combines the two axes,
     ownership as for the sled (one claim on the drive's ring position covers both axes). Each command reaches
     both axes or neither. Enable/Disable and the `Disabled` state are part of it (see the lights axis
     section). `position_um` is optional: absent until both
     axes have reported. **No API_VERSION bump on this branch** (user, 2026-11-09): 0.0.5 was set by a release
     commit (Jacob Visser), and a second branch bumping to 0.0.6 would give two APIs one number; the release
     picks the number at merge.
   - 6c (`df46f95`): its own `[light_lift] on_supervision_loss` in the machine file, same values as
     `[axis]`, default stop (user, 2026-11-09), applied in the fallback (`io_impl::fallback_one`, which now
     takes `AxisFallbacks { sled, light_lift }`). Stop brakes both lights; `return_home` is refused for both
     tables. `machine.toml` gets no `[light_lift]` table until the ECOMODUL is in the ring (step 9); the guide
     line in `signal-toml.md` comes with step 8.
   - The simulated machine mirrors the sled (user, 2026-11-09): it reads the real `config/light-lift.toml`, no
     `light-lift-simulated.toml`. While that file has `"TODO"`s a simulated ECOMODUL would refuse to start, so
     `machine-simulated.toml` gets the ECOMODUL in step 9.
7. Python client wrapper (`34bda2f`): flat methods on `EthercatClient`, `home_light_lift`,
   `move_light_lift(height_um)`, `enable_light_lift`, `disable_light_lift`, `stop_light_lift`, `get_light_lift_state`,
   `get_light_lift_state_stream`, `wait_for_light_lift_idle` (user, 2026-11-09: a `client.lights` sub-object was
   tried and dropped, it stood out against the client's flat style). Types in
   `client/ethercat_client/light_lift_types.py`. `wait_for_light_lift_idle` raises `LightLiftNotIdle` on NotHomed,
   Disabled or Error (user, 2026-11-09), which the lights don't leave for Idle on their own. Tested
   through a real client against an in-process fake; an end-to-end test against the simulated server
   comes with step 9.
8. Docs (`6548c58`): new `docs/guide/light-lift-toml.md`; `ECOMODUL` in the `machine-toml.md`
   model list; `[light_lift]` in `signal-toml.md`; the light lift file and flag in `configuration.md`;
   the `LightLift` service in `communication.md` (its `communication.svg` diagram is not updated);
   guide index; a light lift section in `client/README.md`. The README ring table row and the
   `topology.svg` diagram wait for step 9, when the ECOMODUL joins the ring.
8b. Debug panel (`0475466`; user, 2026-11-09): a Light Lift panel in `client/debug_panel.py`,
   state and height readouts, Home, Enable, Disable, Move (height in µm), Stop. No handling for a machine
   without a light lift (user: it would be dead code once the ECOMODUL is in the ring), so until step 9 its
   stream ends with NOT_FOUND and the panel shows DEGRADED (12/13 streams).
9. Integration, in three commits (2026-11-09):
   - 9a (`65ad61d`): the ECOMODUL at ring index 9 in `config/machine.toml` (by hand, not
     `step2-ring-entry.patch`, whose comment called the driver read-only and which also touched the
     simulated machine); server tests that build the shipped machine get a light lift config (`TEST_CONFIG`,
     `io_impl` the shipped file); `--light-lift-config /app/config/light-lift.toml` in `docker-compose.yml`
     (fixed path, user 2026-11-09). `--check-config` passes on the shipped files. On the first rig start,
     check the log's `Group PDI length` stays within the 128 B `PDI_LEN`.
   - 9b (`04fffce`): the ECOMODUL at index 7 in `config/machine-simulated.toml`, with the
     shipped `light-lift.toml`; `client/tests/test_light_lift_end_to_end.py` (state, Home claims, Stop
     aborts homing, refusals; one server per test, since a Home would carry over). `test_handshake.py` and
     `test_io_end_to_end.py` start the server outside the repo root and now name `--light-lift-config`, as
     they already named `--axis-config`.
   - 9c (written, uncommitted): README ring table row 9 and the config files it loads;
     `topology.dot`/`.svg` with the ECOMODUL at 9; `communication.dot`/`.svg` "Terminals + drives" (it names
     no services, so no LightLift entry); the topology alt text in `configuration.md`. SVGs rendered with
     graphviz 16.1 (the old ones were 2.43), so their diffs are whole-file.

## Testing the lights without the homing sensor (user, 2026-11-09: testing only)

Until the sensor is mounted, the lights can home with method 34 (the actual position becomes the reference,
no movement), as the bench program does. Not for the rig in use.

**`ecomodul/light-lift-test.toml` in this notes folder** (user, 2026-11-09: not committed to the repo): a
separate file, selected with `--light-lift-config` and its full path. Values: method 34, no `zero_speed_um_s`,
`switch_speed_um_s` unused; `home_below_sled_base_um = 4000`, `min_height_um = -2000`, `max_height_um = 84000`
(user, 2026-11-10: the base plate is 4 mm above the travel's bottom end, measured on the machine; limits 2 mm
above the bottom end to 2 mm under the top end). Method 34 integration-tested on the machine (2026-11-10,
with 0 / 0 / 50000 in the repo file, reverted since). Not covered by a test. Delete it once the sensor is mounted and the shipped
file is measured. What follows explains the values.

- `config/light-lift.toml`: `method = 34`; delete `zero_speed_um_s` (the driver refuses it for 34);
  `switch_speed_um_s` stays required but unused by the drive. `home_below_sled_base_um`, `min_height_um`,
  `max_height_um` still need numbers, or the server won't start; with the reference at the bottom,
  `home_below_sled_base_um` is the sled base's height above the bottom end.
- Home declares wherever the light stands to be the bottom; it does not move it there. The worm screw keeps
  a light where it was left, so check by eye that both lights are at the bottom before Home (turn the
  spindle by hand: Move is refused before Home and there is no jog).
- An offset at Home shifts every limit, including the drive's software limits (`0x607D`): a light homed
  20 mm above the bottom overruns the top by 20 mm at `max_height_um`, and with no encoder nothing detects
  the stall. The 84 mm limit leaves only 2 mm, so a light homed more than 2 mm off the bottom can hit
  the top end.
- Each axis references itself: lights at different heights at Home stay that far apart.

## Shipped light lift values (user, 2026-11-09)

`config/light-lift.toml` has no TODOs any more (written, uncommitted): `speed_um_s = 5000` (5 mm/s, the
fastest that worked on the bench at the present stepper currents), acceleration 50 mm/s², homing
`switch_speed_um_s` and `zero_speed_um_s` 2000 (2 mm/s; the user named 2 mm/s for homing, and method 18
needs both, so both got it), `min_height_um = 0`, `max_height_um = 80000` (80 mm stroke of the ~90 mm),
`home_below_sled_base_um = 0` until measured on the machine, so heights count from the homing reference
meanwhile. Method 18 has never run (sensor not mounted): the homing speeds are untested. The server now
starts with an ECOMODUL declared, which unblocks step 9.

## Step 1: what was built

Committed as `b75cca0` (`feat(server): add read-only JAT ECOMODUL driver`):

- `server/lib/profiles/ecomodul.toml`: identity only (bus name `ECOMODUL`)
- `server/lib/src/drivers/ecomodul.rs`: the driver
- `server/lib/src/drivers/mod.rs`, `subdevice.rs` (`SubdeviceDriver::Ecomodul`), `profile.rs` (`ecomodul()` and its
  tests), `server/src/main.rs` (model `"ECOMODUL"` in `driver_for` and its test)

What the driver does:

- `init`: reads `0x3000:00` and requires 2 axes (the 4- and 8-axis variants presumably share the name). It then maps per axis
  RxPDO `0x1600 + 0x10·n` = Controlword, and TxPDO `0x1A00 + 0x10·n` = Statusword, Mode Display, Position Actual,
  Velocity Actual (11 B). Axis 2 entries use the `+0x800` object copies (`0x6841`, …). The driver assigns both PDOs
  to `0x1C12`/`0x1C13` with an explicit count of 2.
- `update`: decodes each axis into `AxisStatus` (`status(axis)`), logs CiA-402 state changes, and writes controlword
  0 every cycle, so no power stage can switch on.
- Nothing exposes it over gRPC yet.

## Running the bench (needs sudo)

The server cannot run with only the ECOMODUL (checked 2026-11-09): `Signals::resolve` requires every
PolyMX input and output wired to a present terminal, and a `Simulated` device turns the whole server
simulated, so no EtherCAT opens. The bench tests the driver only; the LightLift service, client and debug
panel need the rig (step 9), or a server that accepts a partial machine (part of the generic/PolyMX split).
A standalone bench program drives the repo's driver instead:

```fish
cd ~/Cboost/Notes/nl-polymx-ethercat/ecomodul/bench
CARGO_TARGET_DIR=/tmp/ecomodul-bench cargo build --release        # again after every reboot: /tmp is cleared
echo 0 | sudo tee /sys/class/net/enp66s0/napi_defer_hard_irqs     # again after every reboot, see below
echo 0 | sudo tee /sys/class/net/enp66s0/gro_flush_timeout
sudo ip link set enp66s0 promisc on                                 # possibly unnecessary, see below
sudo RUST_LOG=info /tmp/ecomodul-bench/release/ecomodul-bench enp66s0 status 10
```

Expected and confirmed: OP is reached; axis 1 `Fault`, axis 2 `SwitchOnDisabled` (or `ReadyToSwitchOn`).

Motion test of one axis (written 2026-11-09). Passed on axis 1 (2026-11-09) after fixing a deadlock in the
driver's `update` (see `TODO.md`), and on axis 2 (2026-11-09) after the driver stopped requiring `0x608F:02 = 1`:
`sudo RUST_LOG=info /tmp/ecomodul-bench/release/ecomodul-bench enp66s0 motion <axis 1|2> [distance_mm, default 5] [idle_s, default 10]`.
It goes through the driver's API: enable, home on the actual position (method 34, no movement, since the sensor isn't
mounted), move to `-distance` and back, stop a move a quarter of the way (must stand still short of the target with
the power stage still on), then disable where it stopped and stay unpowered for `idle_s` (the position counter must
hold), enable again (counter unchanged, still homed), move back without a re-home, disable (reference kept). Prints `ok` per step, then `PASS`, or `FAIL` with the
reason, disabling the axis. It answers the open bench questions: a refused `0x608F:01` or a refused `0x605A = 5` shows as `SetupUnverified` at the home step, with the log naming which. Needs the drive set
up for the encoderless motor (`0x6410:29`) first; otherwise the first step fails on the `0x7305` fault.

Travel measurement by hand (written 2026-11-09, not yet run):
`sudo RUST_LOG=info /tmp/ecomodul-bench/release/ecomodul-bench enp66s0 travel <axis 1|2> <distance_mm>`.
Waits for Enter before every step: enable and home (method 34: put the carriage at the bottom end first,
its position becomes 0), move `distance_mm` up and hold powered for measuring the gap left at the top and
the distance actually moved, disable, enable (watch the shaft; the counter must not jump), move back to 0,
disable. Try 5 mm first to check the direction, then 80 mm (travel ~90 mm). Speed trials on the light lift (bench 2026-11-09): 10 mm/s at
50 mm/s² lacked torque; 2 mm/s at 50 mm/s² moved 80 mm; 10 mm/s at 10 mm/s² stalled near the end of the
acceleration, so the limit is speed, not the ramp. 5 mm/s at 50 mm/s² works. `config/light-lift.toml` still says
10 mm/s.

**Travel measured** (bench `travel`, 2026-11-09, method 34 from the bottom end): 80 mm up passed with
10 mm left at the top, so ~90 mm of travel, as the rail (190 mm) minus carriage (100 mm) predicts.

**Drive current settings** (scan 2026-11-09, both axes the same; scale 16383 = 20 A peak / 14 A RMS):
`0x6073`/`0x6873` max current 2896 = 3.54 A peak (2.47 A RMS). Stepper mode (`0x2702:01` = 0x83). Stepper
currents `0x2702:02` hold 724 (0.88 A), `:03` travel offset 1448 (+1.77 A, 2.65 A moving), `:04` accel.
offset 724 (+0.88 A, 3.54 A accelerating): the manual's defaults scaled to sum to the max current, so not
set for this motor. `0x2702:07` full step switch 128,000,000 inc/64 s = 15,000 rpm, effectively never.
`0x6410:05/06` motor currents 0 (not configured). No per-axis stepper currents: `0x2F02` (`0x2702` + the axis
offset) does not exist in the object directory, so the one `0x2702` set most likely serves both axes. Open: the motor's rated phase current from its data
sheet; if above ~2.5 A, raise `0x6073` and the stepper currents within its rating and retest 10 mm/s,
otherwise lower `speed_um_s`. Ctrl-C at a prompt leaves the
power stage as it is (`0x6007 = 0`).

`scan_ecomodul.py` (pysoem, read-only) re-reads identity, PDO setup and axis state; `reset_fault.py --axis N` clears
an axis fault over SDO (power stage stays off):
`sudo ~/Cboost/ethercat_testing/python_soem/.venv/bin/python -I scan_ecomodul.py enp66s0`

## Root cause of the failing starts: software IRQ coalescing on the r8169 NIC (confirmed 2026-11-04)

**Symptom:** bus start fails at random (`discovering the ring: timeout: PDU`, often after `Failed to receive frame:
pdu: failed to decode raw PDU data into type`; also timeouts in SDO, mailbox and PRE-OP-PDI steps). 13–17 of 20
back-to-back starts failed; hand-started runs failed less often (2 of 7).

**Cause:** the r8169 driver enables software interrupt coalescing (`napi_defer_hard_irqs=1`, `gro_flush_timeout=20000`
ns). Sometimes a received reply then sits in the NIC until the next interrupt, which only our next transmission
raises. A packet capture (`pdu_latency.py`, `gap_window.py` in this folder) showed: 48,028 requests, all answered,
median 24 µs; exactly 3 replies took 53–61 ms, each released within µs of the next frame we sent, and each matching
one failed run. ethercrab waits 30 ms (`Timeouts::pdu`) and never resends (`RetryBehaviour::None`), so a held reply
fails the start, and the late reply then hits the next frame slot (the decode error, which stops ethercrab's receive
task). Clock sync (10,000 back-to-back `FRMW`s) is most exposed; the 10 ms cycle frees a held reply within 10 ms.

**Proof:** with both values set to 0, 20 of 20 starts succeeded.

**Why other things looked related:** SOEM/pysoem resends unanswered frames, and the resend frees the held reply.
Trace logging kept the CPU busy and hid the problem.

**Ruled out along the way:** EEE (not supported by this NIC), PHY driver (correct Realtek module), cable/drive (every
request answered), DHCP from NetworkManager (failures rose with it off), a previous run's drive state (pausing
between starts didn't help), realtime kernel (a 50 ms hold isn't scheduling latency). ASPM L1 is already off;
clock PM (`clkpm=1`) is still on but untested and so far irrelevant.

**Side findings:**

- NetworkManager runs DHCP on `enp66s0` ("Wired connection 1") and puts those frames on the EtherCAT wire; they
  return as NIC receive errors. Harmless to the bus. **Decided by the user (2026-11-04): NetworkManager keeps managing
  the port**, so it stays usable as a normal network port; the DHCP frames are accepted.
- **Promiscuous mode is unverified.** It was concluded from the first run, which may have failed from coalescing.
  Test: coalescing off, promisc off, 20 starts.

## Facts read off the bench unit (2026-11-04)

| What | Value |
|---|---|
| Bus name / vendor / product / revision | `ECOMODUL` per ethercrab (SOEM/pysoem reads a different EEPROM string: `Drive`) / `0x004A4154` / `0x4D4F44E2` (2-axis) / `0xB` |
| ethercrab SII facts | DC supported (64-bit); only port 2 open (`[closed closed open closed]`); mailbox SMs at `0x1000`/`0x1080`, 128 B each |
| `0x1008` device name | `ECOMODUL-EtherCAT` |
| Axes (`0x3000`) | 2, node IDs 1 and 2 |
| PDO mappings `0x1600/0x1A00/0x1610/0x1A10` | all empty (count 0); the manual gives no default |
| `0x1C12`/`0x1C13` | list `0x1600,0x1610` / `0x1A00,0x1A10`, but `:00` reads 8 (only 2 subindices exist) |
| Encoder `0x608F` | axis 1: 8000 inc / 1 rev; axis 2: 8000 inc / 2 rev, but `:02` is ignored: 8000 inc turned axis 2 once (bench 2026-11-09; manual §5.11.8 gives `:01` on the MODUL per one revolution) |
| Axis 1 | statusword `0x0018` = **Fault**, `0x603F` = `0x7305` (display E00: antivalence error of incremental encoder A, or no encoder selected). Check the encoder cable and settings before motion. |
| Axis 2 | statusword `0x0031` = Ready to switch on |

Sources: manual `~/Cboost/ethercat_testing/Handbuch Objektverzeichnis_EN (1).pdf` (20080048-6.92-OBJen-019):
§3.9 and §5.2.31 multi-axis and EtherCAT, §5.24 errors. Prototype that moves an axis over SDO:
`~/Cboost/ethercat_testing/python_soem/src/python_soem/back_and_forth.py`.

## Open items (also in `TODO.md`)

1. Step 1 committed (`b75cca0`).
2. Step 2 (ring index 9, after the iX7NH; user, 2026-11-04) is postponed until integration (user, 2026-11-05): saved
   as `step2-ring-entry.patch`, reverted from the working tree. Check the 128 B `PDI_LEN` (inputs + outputs) still
   fits: with step 3's PDOs the ECOMODUL adds 22 B in and 14 B out.
3. Motion in the driver is committed (step 3, `e733d5a`). Decided by the user: driver API only (no gRPC
   yet); position moves only; explicit enable; automatic fault reset (as iX7NH); speeds/accelerations fixed per axis
   and written by SDO in `init` (not in the PDO, which carries controlword + target + mode, 7 B per axis); homing
   once at startup, requested by the client as for the sled; the reference survives power loss (worm screw, not
   back-drivable). Motors have no encoder and home on torque. `stop` uses Quick Stop with 0x605A = 5 (power stays
   on), because every Halt option (0x605D) switches the power stage off. Next: config source and gRPC exposure,
   built the same way as the sled (user, 2026-11-05, no `research:design` run).
4. Fault codes in `ecomodul.toml` (`[[fault]]` rows from manual §5.24.3) and drive faults on the fault channel:
   written 2026-11-10, one row per DS402 code (0x603F, cyclic), see `TODO.md`. The exact display code from 0x2600
   over SDO is dropped (user, 2026-11-10): no mechanism reads SDOs off the cycle, and building one is not worth it.
5. Topology check by vendor/product code, not name only: the 2/4/8-axis ECOMODULs presumably share one name. Low
   urgency while `init` checks the axis count. Outside the ECOMODUL steps.
6. Check the rig PC's NIC for the same coalescing. On this PC it's fixed: the user added
   `/etc/udev/rules.d/90-ethercat-nic.rules` (2026-11-04). ethercrab retries (`RetryBehaviour::Count`) are **not**
   added, by the user's decision (2026-11-04).
7. Document the EtherCAT NIC requirements in `docs/DEPLOYMENT.md`: interrupt coalescing off, promiscuous mode only if
   the test above shows it's needed.
8. Cleanup suggestion: the name check at the start of `Ix7nh::init` (`server/lib/src/drivers/ix7nh.rs:1002`) can't
   fail, because the topology check has already run.

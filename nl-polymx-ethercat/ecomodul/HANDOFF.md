# Split architecture proposal: handoff

**State (2026-11-11):** design notes only; no code was changed. The proposal is
`ethercat-server-split-architecture-proposal.md` in the parent folder (`nl-polymx-ethercat/`), as are the other notes named here. It was reviewed against the `0.0.5` server code and
revised in one session. One larger change is under consideration by the user and is **not** in the proposal yet:
see *Under consideration*. The Claude doc linked from `TODO.md` is older than the vault copy.

## What the proposal is

The server becomes a realtime part (cycle thread, drivers, protection rules) and a gRPC part, in one process, joined
by a port of owned plain data: commands in, the latest state and events out, plus a mailbox channel for SDO access.

## Decided by the user on 2026-11-11

| Decision | Where it is recorded |
|---|---|
| The split is for timing isolation, testing, other front ends later and separation of concerns. Crash isolation is nice to have, not required | Q1 |
| Linux in deployment; the server also runs on Windows for testing | Q3 (was assumption A3, "Linux only") |
| The process-bridge argument is dropped; the port stays rigid (only owned plain data crosses) | *Why this shape* |
| R9 confirmed as written: the real driver code runs under simulation, against simulated devices that mirror the real ones as closely as possible | R9; also `generic-api-proposals.md` |
| C1 (simulating servo motion and distance sensors) stays a Could | C1; also `generic-polymx-split.md` |
| A machine keeps one period; if it is too slow, the period is adjusted | Q4 |
| Only one front end is attached at a time | Q5 |
| SDO access at runtime gets a write path | Q6 |
| The capability set is closed; open capabilities aren't worth their cost | Open question 5; also `generic-api-proposals.md` |

None of these were added to `decisions.md`; that file is only edited when the user asks.

## Changed in the proposal this session

- **Outcomes are lossless.** A command is popped only when an event slot is reserved for its outcome.
  `events_lost` counts conditions only.
- **The wake signal is portable:** std `park`/`unpark` instead of an eventfd.
- **Mailbox channel added**, for today's `Diagnostics` reads and for reconfiguring a device that rejoins.
- **New section *SimBus and simulated devices*:** `Bus` and `SimDevice` trait sketches, rules for simulated
  devices, the `SimHandle` for tests, rig recordings. Written without a design run, at the user's request.
- **New section *Planned tests*:** setups, behaviour tests per contract table, one invariant check, and tests for
  the safety gaps.
- **New section *Known limits and future snags*:** twelve items with their state.
- **Steps:** a new step 3 (Bus and `SimBus`) and a step 6 (mailbox channel); eight steps in total.

## Safety gaps found in the review

Their tests are in *Planned tests*. Their fixes are **not** in the design text yet; the user has not decided on them.

1. **Interlocked groups lose atomicity.** Today `DigitalOut::set_masked` moves an interlocked pair in one output
   image. A port command writes one target, so a pair can be split across periods. Fix: a group write as one
   command.
2. **Device watchdogs are assumed, not checked.** The panic and shutdown rows rely on the devices taking their
   outputs to a safe state. The ECOMODUL runs with `0x6007 = 0`. Fix: check the watchdog reaction per device at
   startup. A rig test is needed too, and applies to today's server as well.
3. **No safe-stop action.** With leases removed (GA1), nothing defines how outputs are made safe on a dead client,
   on shutdown or on a listener failure. Fix: one defined safe-stop action.
4. **Active faults exist only as droppable events.** Fix: the active conditions are part of `State`.

Also undefined: the outcome of a command that a rule overrides in the same period. Proposed: rejected, naming the
rule.

## Under consideration (not in the proposal)

The user proposed, and is considering, a contract for events and client liveness:

- **A new client never reads old state transitions.** It gets `State` and the events from the moment it joined. A
  reconnecting client is a new client.
- **A client that doesn't poll for too long triggers the safety mechanism in the server.**

Claude's assessment: it works and is simpler than a stored, numbered transition log. It needs:

- **`State` must be enough for a new client:** the active faults, and per target the id and result of the last
  operation. Same change as safety gap 4 and snag 5.
- **Polling, not a stream.** Network buffers hide whether the application took a streamed message. A poll request
  proves the client's loop ran, also when there are no events.
- **Only the commanding client arms the timeout**, with a "take command" and a clean "release command". This is a
  lease in reduced form.
- **The trigger is a rule in the realtime part.** The gRPC part forwards each poll of the commanding client as a
  command through the port; the rule runs the safe-stop action when none arrived for the timeout. That also covers
  a stalled gRPC part.
- **A timeout well above the client's scheduling gaps.** 560 ms worst gap was measured for the Python client.

**It reverses GA1**, which is a verified Won't (2026-11-09): "the server takes no action when a client goes quiet;
the orchestrator monitors client liveness". The cost is that the commanding client must poll on time again, so
false stops from a slow client become possible.

Two questions were put to the user and are unanswered:

1. Is GA1 reversed, and what changed since 2026-11-09? (The reason is needed for the requirements table.)
2. Does the safe stop put every output at its configured fallback, as today's lease expiry does?

If the user confirms, the proposal changes in: the GA1 row, the events channel and `State` types, the gRPC part
(poll call, take and release command), *Failure handling* (client rows), *Planned tests* (gap 3 and 4 rows), the
*Leases and heartbeats* row of *Alternatives considered*, and snag 5.

## Assumptions to confirm

- **Client SDO requests stay read-only.** Q6 was taken as a write path for the realtime part's recovery only.
- **The second list in *Planned tests*** ("Following from the contract tables") is Claude's reading of the tables.
- **Until a C1 simulated device exists, a driver keeps its `new_simulated` mode.** `SimBus` then exercises the real
  bus code only for the terminals (EL1008, EL2008, EL4002), not for the iX7NH and ECOMODUL.

## Still open

- The four safety gaps and the rule-override outcome (above).
- Snag 4: what the fingerprint covers. Proposed: the interface only (names, kinds, units, direction), hashed from
  the parsed fields, so a calibration change doesn't lock out clients.
- Snag 5: how a client learns how a long operation ended. Depends on *Under consideration*.
- The rejoin sequence that uses the mailbox write path.
- Open questions 1 to 4 and 6 to 8 in the proposal: which sockets, stop the server when the front end fails, what
  "Applied" means, one commanding client or several, keep or drop `Diagnostics`, how the Python tests reach the
  `SimHandle`, names.

## Facts from the code that the review relied on

- Drivers lock their own state (atomics, watch channels, spin locks); `grpc_server::run` takes seven `&'static`
  references (`server/src/grpc_server.rs`).
- Drivers and startup use seven ethercrab calls: `sdo_write`, `sdo_read`, `name`, `identity`,
  `configured_address`, `inputs_raw`, `outputs_raw_mut`.
- The `Diagnostics` service does runtime SDO reads from gRPC handlers through a shared `MainDevice`, behind a
  single permit (`server/lib/src/diagnostic_request.rs`, `server/lib/src/ethercat.rs`).
- Simulation today replaces the driver: the `Simulated` driver for terminals, `new_simulated` inside the iX7NH and
  ECOMODUL drivers (`server/src/main.rs`).
- Bus sizes are fixed at 16 devices, 16 frames and a 128-byte process image (`server/lib/src/ethercat.rs`).
- There is a Windows branch in the cycle startup (`server/lib/src/ethercat.rs`).

## Next

1. The user answers the two questions under *Under consideration*.
2. The user decides on the four safety gaps; then their fixes are written into the design.
3. Step 1 of the proposal (transport: `grpc_server::run` takes a stream of connections) is independent of all open
   points and can start at any time.

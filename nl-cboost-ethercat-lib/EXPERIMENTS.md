# Experiments on the generic EtherCAT server prototype

Ideas that aren't in any design note, tried against the prototype in `~/Cboost/nl-cboost-ethercat-lib`. Run by
Claude, autonomously, with a 30-minute budget (started 2026-11-18 22:49:35, ends 23:19:35).

**Resuming:** experiments run in a copy of the repo (scratchpad `exp/`, rebuilt from the repo if lost). The
prototype itself is not changed. Anything worth keeping (test code, scripts, numbers) is saved in `experiments/`
next to this file. The status column below is updated after each step; the log at the bottom says where work
stopped.

## Ideas

| # | Idea | Why it matters | Status |
| --- | --- | --- | --- |
| X1 | Property test of the cycle: random commands, inputs, failing exchanges and stalls; check invariants on every output image and outcome | The hand-written tests check chosen cases; invariants checked over thousands of random runs find the cases nobody thought of | planned |
| X2 | Period jitter on this PC: `thread::sleep` versus sleep plus a short spin, without `SCHED_FIFO` (`ulimit -r` is 0 here) | The proposal assumes a steady period; nobody measured what the plain pacer gives on a desktop kernel | done: keep plain sleep without RT priority |
| X3 | A Python client against the `--sim` server: generate stubs from the proto with `uv`, measure write round-trip times | The QC app is Python (M5); the 0.0.5 measurements (12-20 ms reply gaps) were through Python | done: found a bug (no TCP_NODELAY) |
| X4 | `EthercrabBus` without hardware: a veth pair in a user and network namespace, with a reflector that sends every frame back as an empty ring would | `EthercrabBus` has never run; this exercises open, discover and the TX/RX thread without a rig | done: works; a hardware-free harness for the real bus |
| X5 | Static musl build of the server for a `FROM scratch` image | Smaller, simpler deployment image; io-uring and libc may not cooperate | done: works after a one-line fix |
| X6 | Idle footprint of the `--sim` server at 10 ms and 1 ms: CPU and RSS | What the server costs on the rig PC beside the QC app | done: cheap; tokio starts too many threads |
| X7 | Mutation testing with `cargo-mutants`, if it installs quickly | Shows which code no test would notice breaking | done: 81 % caught; 11 real test gaps |
| X8 | Machine-file fuzzing: random edits of `demo.toml` through `Machine::parse` and `build` on `SimBus`; nothing may panic | A bad machine file must give an error listing, never a crash at start | done: no panic in 20 000 files |
| X9 | Ledger growth: memory per remembered command under a write flood (snag 8) | The ledger keeps every command id for the boot; a long run might not fit | done: ~620 B per command, unbounded |
| X10 | Cost of many `Watch` streams at 1 ms | The debug panel and the QC app both watch; each stream builds a snapshot per period | done: ~80 us per snapshot; cap the rate |
| X11 | Explain a ring mismatch as an edit script (inserted, removed, replaced) from a minimal alignment, not position by position | After inserting a terminal every later position mismatches; the 0.0.5 code comments name this pain | done: one line instead of five |
| X12 | Flight recorder: record each period's commands and field inputs, replay them on `SimBus`, compare every output image | Reproduce a field incident exactly; also tests the determinism claim at scale | done: replay exact; recorder design sketched |
| X13 | A Python machine client built from `Describe` at connect: names as attributes, required names checked at once, no code generation | Prototype of the `polymx_ethercat` approach in the split notes; tests whether the protocol makes it small | done: ~45 lines |
| X14 | Start-up time of the server, launch to socket ready | The outage after a crash and a supervisor restart | done: 3.4 ms on SimBus |
| X15 | A golden file of the protocol's wire surface (messages, field numbers and types, enums, RPCs), checked against `API_VERSION` | The protocol's semver decides who may write (decision of 2026-11-03); nothing checks that a change bumps it | done: works; needs a C-locale sort |
| X16 | A wiring table for the cabinet from the machine file: per terminal channel the signal, direction, polarity and the rules that use it | The machine file is the only wiring record; electricians don't read TOML | done: works; better from `Describe` |
| X17 | A rule that sometimes runs longer than a period: what the cycle does and what an operator sees | Rule authors will write slow code once; the proposal says the runtime "measures guard time per tick" | done: visible, but not which rule |
| X18 | gRPC-Web in the server (tonic-web), so a debug panel could be a static web page with no Python process | Today's panel is a Python program beside the server | done: works in 3 lines; CORS allows any origin |
| X19 | A minimal simulated plant: an input follows an output after a delay (an end switch following its valve) | Open question 7: the `--sim` binary's inputs never change, so Python end-to-end tests can't run a cycle that waits for a switch | done: ~45 lines in `SimBus` |
| X20 | What clients see when the pump thread dies (a panic, or a poisoned ledger lock after a handler panic) | The pump is a single point of failure that no design note mentions | done: silent failure; serve should end |
| X21 | Convert PolyMX's 0.0.5 `config/machine.toml` to the new format and run it on the generic server | Shows what the new machine file can't express yet, on the real machine rather than a demo | done: IO carries over; 22 items lost |
| X22 | Open question 3's alternative, "Applied = accepted by the driver", measured with the X3 client | X3 found a sequential write costs two periods; this prices the choice | done: half the latency |
| X23 | Tokio worker count (`TOKIO_WORKER_THREADS`) under 10 `Watch` streams at 1 ms | X6 found 12 workers for a handful of clients | done: 2 workers halve the CPU |
| X24 | Does heavy front-end load cost the cycle periods? 50 full-rate `Watch` streams at 1 ms, overruns from the server's own counter | The proposal's first reason for the split: "the cycle thread can't be delayed by a client" | done: 0 overruns; sub-period lateness unmeasured |
| X25 | Close the mutation gaps in `builtin.rs` with one more property: no rule refuses a write outside its own targets | X7 found the interlock and the held guard could refuse unrelated outputs unnoticed | done: 4 misses down to 1 |
| X26 | The Unix socket's file mode as the server creates it | The proposal relies on "file permissions decide who can connect" | done: owner only |

## Summary (23:13): what to take from this session

Twenty-six experiments in 23 minutes; the details are in the log below. In order of how much they matter:

**Bugs found in the prototype**

1. **No `TCP_NODELAY` on accepted connections** (X3): 40-50 ms stalls, write p99 51 ms instead of 20 ms. One line
   in `ethercat-server`. Check whether 0.0.5's "12-20 ms reply gaps" share the cause.
2. **A dead pump thread fails silently** (X20): reads freeze, writes report "unknown" forever though they take
   effect. The pump's end should end `serve`, and the process.
3. **musl doesn't compile** (X5): `libc::sched_param` literal; fix in `experiments/x5_sched_param.diff`.
4. **An unknown device model hides the others** (X21): parsing stops at the first; check models in the
   validation pass.

**Design findings to decide on**

5. "Applied after the acknowledged exchange" **doubles** a sequential client's write time: 20 ms instead of 10 at
   a 10 ms period (X3, X22). Open question 3.
6. The command ledger costs ~620 bytes per command, unbounded (X9): about 0.9 GB per 8-hour shift at 50
   writes/s. A per-client window of recent ids bounds it and keeps R6.
7. Without RT priority, a spin tail in the pacer makes loaded periods 20 times more likely to overrun (X2); the
   0.0.5 pacer has one.
8. Tokio's default 12 workers: 2 give the same throughput at half the CPU (X6, X23).
9. A full-rate `Watch` stream costs ~80 us of CPU per snapshot (X10): cap the rate server-side.
10. Unix socket permissions allow only the owner (X26); gRPC-Web works in three lines but its default CORS allows
    any origin (X18).
11. Observability: no per-rule timing, no overrun condition, no sub-period lateness (X17, X24).

**Confirmed, with evidence**

- Seven cycle invariants hold over 120 000 random periods, and catch injected rule bugs at once (X1, X25).
- 20 000 random machine-file edits never panic (X8); recorded schedules replay identically (X12).
- Front-end load of over a core costs the cycle no period at 1 ms on this PC (X24).
- `EthercrabBus` opens and discovers on a veth pair in a user namespace, no rig or root (X4); musl too (X5).
- The PolyMX IO converts to the new machine file and runs (X21); a 45-line Python facade over `Describe` covers
  the client-package idea (X13).

**Ready to adopt** (in `experiments/`): `x1_properties.rs`, `x8_machine_fuzz.rs`, `x12_replay.rs` (tests),
`x4/` (veth harness), `x19_follow_plant.diff` (a simulated plant, for open question 7), `x11_ring_diff.rs` (a
clearer ring mismatch report), `x15_proto_surface.py` (a protocol change check).

**Mutation testing** (X7): 81 % of viable mutants caught; the eleven test gaps are listed under X7.

## Log

- 22:49 Start. Repo copied to the scratchpad; workspace building there.
- 22:51 **X1 done.** `experiments/x1_properties.rs` (drop into `crates/ethercat-realtime/tests/`). 300 seeds x 400
  periods in 0.2 s (release), with random writes to all five targets, input changes, 5% failed exchanges and at most
  3 commands per period. Seven invariants: interlock pair never both on (commanded and in every exchanged image),
  valves unchanged while the guard stays applied, freshness never ahead and equal to "this exchange worked", the
  lamp off whenever its forcing rule's input read true, a guard only applied when its condition held, every
  accepted command gets exactly one outcome. Coverage counted: 2396 applies, 11140 held periods, 58095 forced
  periods, 108671 rejections. **No invariant broke.** Mutation check: disabling the interlock, the guard's refusal,
  or the guard's input condition each fails on the first seed. **Recommendation:** add it to the repo; `SEEDS=N`
  runs more.
- 22:52 **X2 done.** `experiments/x2_jitter.rs` (`rustc -O x2_jitter.rs`). Dev PC, kernel 7.3.4-arch1-2 with
  `PREEMPT_DYNAMIC`, no `SCHED_FIFO` (`ulimit -r` is 0). 3000 periods of 1 ms each; lateness of each period start:

  | Pacing | Load | p50 | p99 | p99.9 | max | > 1 period late |
  | --- | --- | --- | --- | --- | --- | --- |
  | sleep | idle | 14 us | 76 us | 128 us | 329 us | 0 |
  | sleep + 200 us spin | idle | 0 us | 8 us | 29 us | 460 us | 0 |
  | sleep | 12 busy threads | 3 us | 20 us | 1555 us | 2153 us | 10 |
  | sleep + 200 us spin | 12 busy threads | 0 us | 1812 us | 1877 us | 2423 us | 216 |

  **Findings:** without RT priority, a spin tail makes a loaded period 20 times more likely to overrun, because the
  fair scheduler preempts a spinning thread at the end of its slice. The 0.0.5 pacer ends in a spin; the prototype's
  plain sleep is the better choice there. At a 10 ms period plain sleep never overran even loaded (max 2.2 ms). For
  1-4 ms periods (the ECOMODUL's spec) under load, RT priority is needed: the container then needs `CAP_SYS_NICE`
  and an `rtprio` limit. **Not measured:** with `SCHED_FIFO` (needs root here). Open: should the spin tail come
  back only when `--priority` is set?
- 22:54 **X3 done.** `experiments/x3_client.py`: stubs generated with `grpc_tools.protoc` from `proto/ethercat.proto`
  (uv venv, grpcio). Release server on `--sim`, 300 sequential writes and reads per run:

  | Transport | Period | Write p50 | Write p99 | Write max | Read p50 |
  | --- | --- | --- | --- | --- | --- |
  | TCP, as shipped | 10 ms | 20.0 ms | 51.5 ms | 55.4 ms | 1.00 ms |
  | TCP, as shipped | 1 ms | 3.0 ms | 3.4 ms | 44.0 ms | 1.03 ms |
  | TCP + `TCP_NODELAY` | 10 ms | 20.0 ms | 20.5 ms | 20.8 ms | 0.97 ms |
  | TCP + `TCP_NODELAY` | 1 ms | 2.1 ms | 3.3 ms | 3.5 ms | 0.16 ms |
  | Unix socket | 10 ms | 20.0 ms | 20.7 ms | 20.9 ms | 0.15 ms |
  | Unix socket | 1 ms | 3.0 ms | 3.4 ms | 3.5 ms | 0.14 ms |

  **Findings:**
  1. **Bug: the server binary doesn't set `TCP_NODELAY`.** Tonic sets it only on its own `TcpIncoming`; the
     prototype passes a `TcpListenerStream`. Nagle and delayed ACKs add 40-50 ms stalls (p99 51 ms instead of
     20 ms). Fix: `set_nodelay(true)` on each accepted stream in `ethercat-server`'s `serve_on`. Worth checking
     whether the 0.0.5 server's "12-20 ms reply gaps" have the same cause.
  2. **A sequential write costs two whole periods** (20 ms at 10 ms). The reply comes right after a period's
     publish, so the next write just misses that period's command step; then "Applied" waits one more exchange.
     With "Applied = accepted by the driver" it would be one period. This is a cost of open question 3's pick
     that the proposal doesn't mention.
  3. **A Unix socket path over 107 bytes fails** with the raw OS error ("path must be shorter than SUN_LEN").
     Deployment paths are short; a clearer message would help.
  4. The Python view of the protocol works as intended: a rejection arrives as `FAILED_PRECONDITION` with
     `ethercat-rule` and `ethercat-reason` in the trailing metadata; absent values show as an unset oneof.
  5. Unexplained: TCP reads stay at ~1 ms at the 10 ms period even with `TCP_NODELAY`, but drop to 0.16 ms at 1 ms.
- 22:55 **X4 done.** `experiments/x4/`: `x4_discover.rs` (an example for `crates/ethercat-realtime/examples/`),
  `reflector.py`, `reflector_one.py`, `run.sh`, `run_one.sh` (paths inside point at the scratchpad; adjust).
  `unshare -rn` gives a user and network namespace without root; inside it a veth pair `ecm`/`ring`, with the
  main device on `ecm` and a raw-socket reflector on `ring`.

  | Ring | `discover` result |
  | --- | --- |
  | nothing answers | fails after 30 ms: `timeout: PDU` |
  | reflector: frames back unchanged, source MAC marked (an empty ring) | 0 devices, in 9 ms |
  | reflector: every working counter +1 (one device answering zeros) | fails after 5.0 s: `timeout: state transition` |

  **Findings:** `EthercrabBus::open`, the io_uring TX/RX thread and `discover` work, in a user namespace too
  (io_uring and raw sockets are allowed there). This is a way to run the real bus in CI without a rig or root. The
  last row shows ethercrab's error naming neither the device nor the state it waited for; the proposal wants
  start errors that name the device, so `EthercrabBus` has to add that context itself. **Next step, not done:** a
  reflector that answers like one real device (an EK1100: registers, EEPROM, AL state) would get `discover` to 1
  device. That is the frame-level simulator the proposal ruled out as too costly, but at one coupler it may be
  small; worth a timeboxed try.
- 22:56 **X5 done.** `cargo build --release -p ethercat-server --target x86_64-unknown-linux-musl`.
  **Found a portability bug:** `runtime.rs` builds `libc::sched_param` as a struct literal, which doesn't compile on
  musl (its `sched_param` has four more fields). Fix in `experiments/x5_sched_param.diff`: a zeroed struct with
  `sched_priority` set. After that: a static-pie binary, 5.6 MB stripped (glibc build: 5.6 MB too, plus 4 shared
  libraries). It serves the Python client with the same timings (Unix socket, write p99 20.6 ms at 10 ms) and exits
  0 on SIGTERM. The X4 veth harness gives the same results with a musl build, so io_uring works there too. A
  `FROM scratch` image with only this binary and the machine file is possible; not built (no Docker run here).
- 22:57 **X6 done.** Release build, `--sim`, no clients, 10 s sampled from `/proc`:

  | Period | CPU (one core) | RSS | Threads | Context switches in 11 s |
  | --- | --- | --- | --- | --- |
  | 10 ms | 0.7 % | 6.2 MB | 16 | 2284 |
  | 1 ms | 4.9 % | 6.5 MB | 16 | 22362 |

  About 50 us of CPU per period at 1 ms: the cycle thread and the pump wake once each. **Finding:** 16 threads, of
  which 12 are tokio workers (one per core) for a front end with a handful of clients. On the rig they compete
  with the cycle thread for cores, which matters as long as there is no RT priority (X2). Suggestion: a tokio
  runtime with 1-2 workers in `ethercat-server`, and later pin the cycle thread to a core the runtime doesn't use.
- 22:58 **X8 done.** `experiments/x8_machine_fuzz.rs` (a test for `crates/ethercat-realtime/tests/`). 20 000 random
  edits of `machines/demo.toml` (1-4 per file: delete a line, duplicate a line elsewhere, or replace a value with
  one of 14 awkward values such as 255, -1, a wrong model, a duplicate name list), each through `Machine::parse`
  and then `build` on `SimBus`. 5239 parsed, 4551 built, **0 panics**, in 1.7 s. The `unreachable!` calls in
  `driver.rs` and `cycle.rs` stay unreachable for these inputs. Not covered: edits that make new valid tables (a
  new device or signal), which a structure-aware generator would need.
- 22:59 **X9 done.** `experiments/x9_flood.rs` (an example for `crates/ethercat-server/examples/`; argument: writes
  per task). In-process server on `SimBus` at 1 ms, 64 concurrent tasks writing over TCP, one client id:

  | Writes | Time | Throughput | RSS growth | Per command |
  | --- | --- | --- | --- | --- |
  | 32 000 | 2.2 s | 14 789/s | 20.9 MB | 669 B |
  | 128 000 | 8.7 s | 14 733/s | 76.9 MB | 615 B |

  **Findings:** no write failed, and throughput sits near the ceiling of `max_commands_per_period` (16) per period.
  The ledger costs about 620 bytes per command and never shrinks (snag 8). At 50 writes/s that is 1.4 million
  commands, about 0.9 GB, per 8-hour shift; a week of continuous running would not fit. **Idea for snag 8:**
  command ids increase per client. The ledger keeps per client the highest id and the outcomes of the last N
  (say 1024); a repeated id inside the window gets its recorded outcome, an older one gets a distinct error
  ("outcome forgotten") rather than being applied again. Bounded memory, and R6 still holds: nothing is applied
  twice.
- 23:00 **X10 done.** `experiments/x10_watchers.rs` (an example for `crates/ethercat-grpc/examples/`; arguments:
  address, streams, seconds). Release `--sim` server at 1 ms, `Watch` with `min_interval_ms = 0`, 5 s per row:

  | Watch streams | Snapshots/s per stream | Server CPU (one core = 100 %) |
  | --- | --- | --- |
  | 0 | - | 3.4 % |
  | 1 | 962 | 11.0 % |
  | 10 | 885 | 46.4 % |
  | 50 | 854 | 113.4 % |

  **Findings:** one full-rate stream costs about 80 us of server CPU per snapshot (7.6 % of a core at 1000/s), for
  a 9-target machine; streams scale about linearly and start skipping periods (854/s at 50). That CPU runs on tokio
  workers that compete with the cycle thread (X6). A debug panel doesn't need 1000 updates/s. **Suggestions:** a
  server-side floor on `min_interval_ms` (say 20 ms, or one period at least), and build each period's
  `pb::Snapshot` once in the pump rather than once per stream. Not profiled where the 80 us goes (snapshot
  building, protobuf encoding or HTTP/2 framing).
- 23:01 **X11 done.** `experiments/x11_ring_diff.rs` (`rustc -O`). An edit-distance alignment of the declared
  models against the discovered ones, on the PolyMX ring's model sequence:

  | Change on the ring | Mismatches position by position | Aligned report |
  | --- | --- | --- |
  | an EL1008 inserted after the coupler | 5 | 1: "position 3: EL1008 is on the ring but not in the machine file (inserted?)" |
  | the EL4002 removed | 3 | 1: "declared EL4002 at position 6 is missing from the ring (removed?)" |
  | two terminals swapped | 2 | 2 (same as now) |
  | an EL2008 replaced by an EL2004 | 1 | 1 (same as now) |

  **Suggestion:** use it for `ring_mismatches` in `cycle.rs`; about 30 lines. Among identical neighbours (three
  EL1008s) the insertion point is ambiguous; the report names one of them, so "(inserted?)" should stay hedged.
- 23:01 X7: two failed launches (an empty `CARGO_TARGET_DIR`; `--skip` went to cargo instead of the test binary).
  Relaunched with the experiment tests (X1, X8) moved out of the copy, so it measures the repo's own tests.
- 23:02 **X12 done.** `experiments/x12_replay.rs` (a test for `crates/ethercat-realtime/tests/`). 200 random
  schedules of 300 periods each: per period the commands submitted, the two field inputs and whether the exchange
  fails. Each schedule played twice on a fresh cycle: every exchanged output image and every outcome identical, in
  0.8 s. **Why it holds:** rules see the period number, never the clock (`View` has no time), so the cycle is a
  pure function of (commands popped, input images, exchange result) per period. A rule that reads its own clock
  or keeps a random seed would break this; worth stating in the rule API docs.
  **Recorder sketch (not built):** the cycle thread writes, per period, the popped commands, each device's input
  bytes and the exchange result into a preallocated ring (for the demo ring about 20 bytes plus 16 per command;
  at 10 ms, 10 minutes is 60 000 periods, about 1.2 MB without commands). The mailbox thread dumps it on request.
  Replaying the dump on `SimBus` with the same machine file and rules reproduces the outputs period by period.
  That answers snag 7 (a per-period trace, wanted for the slow ECOMODUL braking) as well as field incidents.
  Inputs come from the recording rather than from simulated devices, so the replay needs a `SimDevice` that plays
  back recorded input bytes.
- 23:02 **X13 done.** `experiments/x13_facade.py` (needs the X3 stubs). A `Machine` class: `Describe` at connect,
  `requires=[(name, kind)]` checked with every problem listed at once ("Sled (wanted AXIS, server has nothing);
  ClampClosed (wanted DIGITAL_OUT, server has DIGITAL_IN)"), then `m.Lamp = True` writes with a fresh command id,
  `m.ClampClosed` reads, a never-read value raises instead of returning a default, and a rule's refusal comes back
  as an `RpcError` naming the rule. About 45 lines over the generated stubs; no code generation from the machine
  file needed. Missing for real use: retry with the same command id on `DEADLINE_EXCEEDED`, and the boot id check.
- 23:02 **X14 done.** Release binary, `--sim`, demo machine: the Unix socket exists 3.4 ms after launch (median of
  10; min 2.5, max 9.4). Start-up cost is the bus's: on a ring, discovery and the switch to OP dominate.
- 23:03 **X15 done.** `experiments/x15_proto_surface.py` and its output for the current proto,
  `x15_proto_surface_golden.txt` (66 lines). The script runs `protoc --descriptor_set_out` and prints one sorted
  line per field (`message ethercat.v1.Reading field 5 forced_by TYPE_STRING LABEL_OPTIONAL`), enum value and RPC.
  Renaming `client_id` showed as two removed lines; adding `Reading.fresh_period = 6` as one added line and no
  removed one. **Suggestion:** commit the golden file beside `API_VERSION`, and a check: any removed or changed
  line needs a major bump (minor before 1.0), added lines only a minor one, and the golden file is regenerated in
  the same commit. Catches an accidental wire break in review. Detail: sort and compare in the C locale
  (`comm` warned about Python's sort order). Needs `protobuf` in Python; a Rust version via `prost-types` would
  keep the check in `cargo test`.
- 23:04 **X16 done.** `experiments/x16_wiring.py` (`python3 x16_wiring.py <machine.toml>`, stdlib only). Prints a
  Markdown table per ring position and channel, plus positions without signals. On the demo machine it shows,
  for example, that `Close` is used by three rules (`ClampStroke`, `ClampValves`, `KeepClamped`). **Limit:** which
  rule fields name signals is guessed from field names. The server knows exactly (`RuleInfo.binds`), so the
  robust version is a `--wiring` flag on `ethercat-server` that binds the rules and prints this table without
  starting the bus; it would also catch a bad file before a commissioning visit.
- 23:05 **X7 done.** `cargo-mutants` 92 mutants on `cycle.rs`, `builtin.rs` and the gRPC `ledger.rs`, against the
  repo's own tests (X1 and X8 left out): **64 caught, 15 missed, 11 unviable**, 0 timeouts; under 4 minutes with
  `-j 4`. Missed list in `experiments/x7_mutants_missed.txt`. Sorted:

  | Missed mutant | What no test checks | Kind |
  | --- | --- | --- |
  | `builtin.rs:40` (two) | an output outside an interlock is unaffected while a member is on | test gap |
  | `builtin.rs:105` | a held guard lets commands to targets outside `refuse` through | test gap |
  | `builtin.rs:25` | `mutually_exclusive` with fewer than two members is refused | test gap |
  | `ledger.rs:108` | a *rejected* apply doesn't make the client the holder (if it did, the real holder could no longer release) | test gap, the most important |
  | `ledger.rs:64` | a non-holder's apply on an applied guard goes to the cycle (`FAILED_PRECONDITION`, not `PERMISSION_DENIED`) | test gap, minor |
  | `cycle.rs:468` | `Describe` carries an analog output's range | test gap |
  | `cycle.rs:597` | the image-size check at start fails on a wrong size (`SimBus` never has one) | test gap; needs a `SimDevice` with another size |
  | `cycle.rs:619` | an analog output reads as analog before its first write | test gap |
  | `cycle.rs:632`, `:641` (four) | the fingerprint differs between machines with different names or kinds | test gap; without it the `Hello` fingerprint check is untested in substance |
  | `cycle.rs:28` | `StartError`'s display text | wording; fine untested |
  | `cycle.rs:275` | `pending.period < period` vs `<=` | equivalent mutant: the exchange runs before the commands |

  X1's property test would catch the `builtin.rs` mutants at line 40 and 105 only if it also wrote to non-member
  outputs while checking them, which it does not yet. **Suggestion:** one test per row marked "test gap"; then
  rerun on the remaining files (`service.rs`, `machine.rs`, `runtime.rs`, `channels.rs`).
- 23:05 **X17 done.** `experiments/x17_slow_rule.rs` (a test for `crates/ethercat-realtime/tests/`). A rule
  busy-waits 3 ms every 50th period, at a 1 ms period, for 1 s: 963 periods instead of 1000, `overruns` 38 (about
  two skipped periods per slow call), `rules_max` 3.0 ms, no failed exchange. **Findings:** it's visible in the
  bus status, but `rules_max` is one number for all rules, so it doesn't say which rule was slow; and an overrun
  raises no condition, so a client notices only by polling counters. **Suggestions:** time per rule (a
  `rules_max` per `RuleInfo`, still allocation-free: one `Duration` per rule), and a bus condition
  `overrun` raised and cleared like `exchange_failed`.
- 23:05 **X18 done.** In `ethercat-grpc`: `tonic-web = "0.12"`, `.accept_http1(true)` and
  `tonic_web::enable(MachineServer::new(...))`; three lines. A plain HTTP/1.1 `curl` POST of an empty gRPC-Web frame
  to `/ethercat.v1.Machine/Describe` returns the description (machine name, version, targets), and native gRPC
  keeps working (Python client unchanged: write p50 20 ms). **Finding, important if adopted:** tonic-web's default
  CORS policy allows every origin; a preflight from `http://panel.local` was answered with that origin allowed.
  Any web page open in a browser that can reach the port could then write outputs, and `Hello` is no
  authentication. So: allow only the panel's own origin, or serve the panel page from the server itself (same
  origin) and refuse cross-origin requests. Also open: a browser can't open a Unix socket, so the panel needs the
  TCP listener.
- 23:06 **X19 done.** `experiments/x19_follow_plant.diff` (against `sim.rs` as formatted in the repo) and
  `experiments/x19_plant.rs`. `SimHandle::follow(&machine, "Close", "Closed", 20)` resolves both names (wrong kind
  refused) and keeps a delay line per follow, applied after each simulated exchange. `Closed` reads true 23
  periods after the write: 2 to reach the wire, 20 of delay, 1 to be read. The held guard then applies without the
  test setting any input. **Suggestion for open question 7:** `--sim-plant <file>` with
  `[[follow]] output = "Close" input = "ClampClosed" delay_ms = 200`, so the Python end-to-end tests run against a
  plant without a test-only service. Analog plants (a light level, an axis position) would need more than a delay
  line; that is where C1's device models start.
- 23:07 **X20 done.** A panic injected into the pump at period 100 (in the copy only). The server keeps running;
  reads keep answering with period 99 and a growing age (698 ms, then 1199 ms); a write returns
  `DEADLINE_EXCEEDED` "ask again with the same command id", forever, although the cycle did apply it (the lamp went
  on; only the outcome was lost). SIGTERM still exits 0. Once the event ring is full of unread outcomes the cycle
  stops popping commands, and writes turn into `RESOURCE_EXHAUSTED`. **Suggestion:** the pump's end, other than
  at shutdown, ends `serve` with an error (a drop guard in the pump thread that fires a oneshot `serve` selects
  on), so the process stops, the device watchdogs act, and the supervisor restarts it: the same policy as a
  failed listener. The ledger lock's `expect` also turns one handler panic into a pump panic; that path then ends
  in the same restart.
- 23:08 **X21 done.** `experiments/x21_convert_0.0.5.py` (`python3 x21_convert_0.0.5.py old.toml new.toml`) and its
  output `experiments/x21_polymx-generic.toml` (kept in the vault: PolyMX names don't belong in the generic repo).
  **Carried over:** every input, output and analog channel with device, channel, group and polarity, and the three
  interlocks. **Lost (22 items):** the EL6224 (with `sensors = 3`), ECOMODUL and iX7NH devices (no drivers);
  `supervised` and `fallback` on 15 outputs (GA1 removed supervision; fallback has no home yet, safety gap 3);
  `from`/`to` scaling on both analog outputs (the prototype takes raw counts, so scaling moves to the client or
  needs a place in the file); `[axis] on_supervision_loss`. With the three unsupported devices swapped for
  stand-ins the generic server runs it: 29 targets, 3 rules, all names bound.
  **Finding:** an unknown model stops parsing at the first one ("unknown variant `EL6224`"), so the other two go
  unreported, against the machine file's "every problem at once". Fix: read `model` as a string and check it
  in the validation pass with the other problems.
- 23:08 **X22 done.** One line in the copy's `cycle.rs` (`Carried::NextExchange` to `Carried::Now`), X3 client over a
  Unix socket, 300 sequential writes:

  | "Applied" means | Period | Write p50 | Write p99 |
  | --- | --- | --- | --- |
  | carried by an acknowledged exchange (prototype) | 10 ms | 20.0 ms | 20.7 ms |
  | accepted by the driver | 10 ms | 10.0 ms | 10.4 ms |
  | carried by an acknowledged exchange (prototype) | 1 ms | 3.0 ms | 3.4 ms |
  | accepted by the driver | 1 ms | 1.0 ms | 1.5 ms |

  **Finding:** the proposal's pick for open question 3 doubles a sequential client's write time. A middle way
  keeps both: reply at acceptance with the period that will carry it, and report a failed carrying exchange as a
  condition (or let the client wait for `fresh_at` to pass that period when it needs the proof). Worth deciding
  together with open question 3. (Process note: the restore `sed` also hit the held-guard line; the copy was then
  restored from the repo and verified identical.)
- 23:09 **X23 done.** Same setup as X10 with 10 streams, varying `TOKIO_WORKER_THREADS` (no code change):

  | Workers | Threads | Snapshots/s per stream | Server CPU |
  | --- | --- | --- | --- |
  | 12 (default, one per core) | 16 | 876 | 38.2 % |
  | 2 | 6 | 872 | 21.2 % |
  | 1 | 5 | 851 | 23.4 % |

  **Finding:** two workers give the same throughput at 55 % of the CPU; the default spends the difference waking and
  stealing across idle workers. **Suggestion:** build the runtime in `ethercat-server` with 2 workers
  (`Builder::new_multi_thread().worker_threads(2)`); with `--core` pinning the cycle thread, keep the workers off
  that core.
- 23:10 **X24 done.** Release `--sim` at 1 ms; `overruns` read over gRPC before and after 5 s:

  | Tokio workers | Watch streams | Periods in ~5 s | Overruns |
  | --- | --- | --- | --- |
  | 12 | 0 | 5237 | 0 |
  | 12 | 50 | 5144 | 0 |
  | 2 | 0 | 5220 | 0 |
  | 2 | 50 | 5328 | 0 |

  **Finding:** front-end load of more than one core cost the cycle no whole period, which supports the split's
  timing isolation, on an otherwise idle 12-core PC (X2 shows a fully loaded PC is another matter). **Gap:**
  `overruns` counts only whole missed periods; how late each period started (X2's measure) is invisible to the
  server and its clients. **Suggestion:** a small lateness histogram in `BusState` (fixed buckets, allocation-free),
  or at least the maximum lateness since start, like `rules_max`.
- 23:12 **X25 done.** Invariant I8 added to `experiments/x1_properties.rs` (the saved file is now this version): every
  rule rejection names a rule that owns the written target (`ClampValves` and `KeepClosed` only Close and Open,
  `LampOff` only Lamp). Still passes over 300 seeds. `cargo-mutants` on `builtin.rs` with it: 15 caught, **1
  missed** (was 4), 2 unviable, in 2 minutes. The remaining miss is `mutually_exclusive`'s "at least two members"
  check, which wants a plain bind test, not a property.
- 23:12 **X26 done.** With umask 022 the server's socket is `srwxr-xr-x`. Connecting needs write permission, so
  only the server's own user can connect; a QC app in another container under another user is refused. The
  proposal's "file permissions then decide who can connect" needs a deliberate setting: a `--socket-group` (chown
  and `0660`) or a documented umask in the deployment.
- 23:13 **Session ended** with about six minutes of budget left, to leave the summary complete. Not started:
  per-device freshness in `SimBus`, a frame-level EK1100 reflector (X4's next step), `SCHED_FIFO` measurements
  (need root), and the unexplained 1 ms TCP reads at a 10 ms period (X3, finding 5). The scratchpad copy
  (`exp/`) still holds the X3 NODELAY switch, the X18 gRPC-Web change and the X20 pump-panic injection; it is
  disposable.

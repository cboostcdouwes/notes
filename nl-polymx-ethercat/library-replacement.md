# Which custom code a library could replace

**Status (2026-11-03): analysis.** For each part of the layered architecture (`layered-refactor.md`): what the custom
code must do, which libraries could replace it, how, and what that gains and costs. An overview table is at the end.
Change in functionality is allowed (user, 2026-11-03). Library facts are from a web search on 2026-11-03 (sources at
the end); versions and maintenance should be rechecked before adopting anything.

## Core requirements

What the server and client must do, collected from the repo's docs and code. Only M1–M5 are verified by the user. The
rest are documented in the repo but not confirmed by the user as requirements; they are what a replacement is
measured against until confirmed or dropped.

### Verified

| # | Requirement | Source |
|---|---|---|
| M1 | Generic part reusable for other machines; machine part holds all machine knowledge | user, 2026-11-03 |
| M2 | Machine guards run in the server and react within one cycle | user, 2026-11-03 |
| M3 | The guard mechanism is generic | user, 2026-11-03 |
| M4 | Split inside this repo first, prepared for separate repos | user, 2026-11-03 |
| M5 | The QC app imports the machine's EtherCAT client package; the server is a separate process | user, 2026-11-03 |

### Documented, not verified

| # | Requirement | Why it exists | Source |
|---|---|---|---|
| T1 | 10 ms cycle on its own thread, absolute deadlines, overruns counted | process-data timing; drive and terminal watchdogs | `docs/guide/operations.md` |
| T2 | Ownership lease 200 ms by default (50–60000), expiring on monotonic time even while the bus is stalled | Python clients pause: GC scans up to 92 ms, heartbeat start gaps up to 180 ms; a 100 ms lease expired in tests | `docs/STABILITY_REPORT.md`, `docs/guide/heartbeat.md` |
| T3 | Every reading's age is known (acquisition stamp) | consumers judge stale data | `docs/knowledge/ilr-acquisition-timestamps.md` |
| S1 | Nothing here is a safety function; rated safety is the wiring | no safety claim can be qualified | stability report, `machine.toml`, client README |
| S2 | Supervised outputs fall back when their owner goes silent; the axis stops | an abandoned vacuum holds a plate; an abandoned move runs unattended | `machine.toml`, `machine.rs` |
| S3 | Vacuum/release and up/down pairs are never high together | mechanical conflict | `machine.toml`, deployment doc |
| S4 | The health output drops on supervision loss and recovers only after reclaim and an explicit reset | operator-visible latch | `docs/ERROR_CHANNEL_DESIGN.md` |
| C1 | A command is never replayed; an uncertain outcome stays uncertain | a replayed actuator command acts on a changed machine | client README, *Writing a consumer* |
| C2 | Incompatible client versions can't control outputs | mismatched contracts | `docs/guide/communication.md` |
| H1 | The declared ring is checked against the discovered ring at startup, listing every mismatch | a renumbered ring drives the wrong terminals | README |
| H2 | iX7NH firmware 1.25 behavior: Halt latched until the replacement setpoint edge; completion needs target position *and* zero raw velocity; STO read from the digital-inputs word, not the statusword | firmware 1.12 failed Halt tests; Target Reached alone isn't standstill | stability report, client README |
| H3 | iX7NH refuses writes to `0x6099` (homing speeds); a startup SDO rejection `0x06010002` is unresolved | drive firmware | README, stability report |
| H4 | EL6224 port settings at `0x8000 + 0x10·port`; the master validates the ILR1040's identity; 6 bytes per sensor | wrong sensor on a port must be an error | `profiles/ilr1040.toml` |
| H5 | Only one EtherCAT master drives the NIC | two masters corrupt the ring | README, deployment doc |
| O1 | Missing or incomplete evidence never reads as healthy; unsupported is not zero | a monitoring gap must not look like a healthy machine | error-channel design, client README |
| O2 | Diagnostics are read-only, bounded (250 ms default, 1000 ms max), one at a time | must not disturb the cycle | error-channel design |
| D1 | Deployed with Docker Compose on a Linux PC; machines run offline | release model | README; flexcompose notes (C4, unverified there too) |
| D2 | Exact tested artifacts are identified by hash, with the deployed TOML | API version alone doesn't identify a tested build | deployment doc, `scripts/release_manifest.py` |

### Context that affects the choices

- **The QC application is a ROS 2 Jazzy package** (`rclpy`, PackML, a ROS 2 orchestrator, a patched `rclpy` executor in
  `nl-polymx-automated-qc-application/middleware/`). The EtherCAT server is the one non-ROS component it talks to.
- **No observability stack exists:** logging is `log` with `env_logger`; nothing exports metrics.
- **Only a conformance test** in the QC app reads fault history or diagnostics; its production code uses neither.

## Whole-stack alternatives

Before the parts: three products could replace most of the server at once.

### ros2_control with ethercat_driver_ros2

`ethercat_driver_ros2` (ICube, University of Strasbourg) is a `ros2_control` hardware interface on the IgH EtherCAT
master. Modules are assembled from parameter files: a generic module for PDO-mapped terminals with an SDO
configuration list, and a CiA-402 drive module. Controllers run in the controller manager's real-time loop.

| Requirement | Fit |
|---|---|
| M1, M3 | Good: generic modules and controllers are reusable; the machine is URDF/YAML plus its controllers |
| M2 | Good: guards become controllers (or a chained safety controller) in the real-time loop |
| M5 | Changes: the QC app would use ROS interfaces (topics, services, actions) instead of an imported gRPC client. A thin `polymx` package could still wrap them |
| T2, C1, S2, S4 | Missing: `ros2_control` gives controllers exclusive command interfaces, not client leases. Leases, fallback, health latch and no-replay would be a custom node or controller |
| H1 | Partial: IgH checks the configured vendor and product per position |
| H2, H3 | Unknown: the generic CiA-402 module would need the firmware 1.25 Halt and completion rules; likely a custom module |
| H4 | Probably: generic module with SDO config for the EL6224 ports; ILR1040 decoding custom |
| D1 | Cost: IgH is a kernel module on the host, matched to the kernel and NIC driver; Docker images can't carry it |

- **Gains:** the company's own stack; one middleware for the whole machine; ROS tooling (bag recording, `ros2 topic`,
  `diagnostic_updater`) replaces most observability; drivers for simple terminals become configuration.
- **Costs:** a rewrite and full requalification; leases and supervision rebuilt on ROS; a kernel module on every
  machine PC; real-time behavior moves to the controller manager's loop; M5 as phrased (an imported client package)
  becomes a ROS interface. Maintenance activity of `ethercat_driver_ros2` beyond Jazzy wasn't confirmed.

### CODESYS Control for Linux SL

A soft PLC with an EtherCAT master (devices configured from ESI files in the IDE), IEC 61131-3 logic, optional
SoftMotion for CiA-402 drives, and an OPC UA server included.

- **Gains:** an industrial runtime with tooling for EtherCAT configuration, PLC logic for guards and interlocks, and a
  standard API (OPC UA).
- **Costs:** licenses per device (EtherCAT master and OPC UA add-ons listed around $120–180 each; the base license
  price wasn't confirmed); logic in IEC 61131 instead of Rust or Python; a Windows IDE and project files that are hard
  to review in git; leases and no-replay still custom; a Python client on OPC UA (`asyncua`). M1 becomes CODESYS
  library projects.

### TwinCAT

Beckhoff's runtime runs on Windows or TwinCAT/BSD IPCs, with ADS for clients (`pyads`). It fits Beckhoff terminals
best, but means a different PC platform, licenses and the TwinCAT toolchain; it doesn't fit a Linux Docker deployment
(D1). Not considered further.

**Verdict:** none of the three replaces leases, fallback and no-replay (T2, C1, S2, S4), which are the heart of the
server's contract. `ros2_control` is the only one aligned with the company stack. It is worth a separate decision
(and a spike on the iX7NH and EL6224), because it changes M5 and the deployment. The rest of this document assumes
the custom server stays.

## Per part

### L0 Bus

**Today:** `ethercrab` 0.7.1 (already a library) plus about 1,000 lines around it: startup, topology check,
retry budget (`ethercat.rs`, 721 lines with tests) and the pacer (294).

| Candidate | How | Gains | Costs |
|---|---|---|---|
| keep `ethercrab` | as now | pure Rust, user space, no kernel module, Docker-friendly | young (0.x); CiA-402 example disabled upstream |
| IgH master via `ethercat` crate | kernel master, Rust bindings | mature master, used widely in industry | kernel module per host kernel; bindings last released 2023 (0.3.1); Docker can't carry it |
| SOEM | C library via FFI | mature, user space | FFI and unsafe code; no maintained Rust bindings found |
| acontis EC-Master | commercial, with a Rust wrapper | supported product, full feature set | license; C++ core |

**Verdict: keep `ethercrab`.** The custom code around it (topology check, retry budget) is small and specific to the
requirements (H1). Nothing to replace.

### L1 Devices

**Today:** about 3,200 lines of drivers (the iX7NH alone 1,798), 890 lines of profile loading, plus registry and
traits.

| Candidate | How | Gains | Costs |
|---|---|---|---|
| ESI files (`ethercat-esi`) | derive PDO layout and identity from the vendor's XML | vendor data instead of hand-written profiles | crate unmaintained since 2020 (0.2.0); ESI doesn't describe behavior |
| CiA-402 crates (`oxictl`, `autocore-std`) | use their state machine for the iX7NH | less state-machine code | `oxictl` 0.1 is simulation-tested only; `autocore-std` is tied to its own framework; neither knows the firmware 1.25 rules (H2) |
| `statig` (state-machine crate) | express the axis and homing states declaratively | clearer transitions, hooks for logging | a dependency for one state machine; the hard part is the drive's quirks, not the state machine |
| IODD parsers (`ioddengine`) | decode ILR1040 data from its IODD | vendor data | 0.1.3, IODD 1.1 only; decoding 6 bytes isn't worth it |
| **generic PDO terminal** (custom, but data-driven) | one driver for any digital or analog terminal, configured by profile (bit and word layout) | EL1008, EL2008, EL4002 and future simple terminals become profile data | small: one generic driver plus tests |

**Verdict: keep custom drivers; make simple terminals data-driven.** The iX7NH and EL6224 drivers encode
hardware-specific behavior that no library knows (H2–H4). A generic PDO terminal driver turns three drivers into
profiles. That isn't a library, but it removes code the same way.

### L2 Machine model

**Today:** `serde` + `toml` already; about 1,600 lines of schema, validation and binding (`machine.rs`, `signals.rs`,
`curve.rs`).

| Candidate | How | Gains | Costs |
|---|---|---|---|
| `schemars` | generate a JSON Schema from the config structs | editor completion and validation of `machine.toml` (Taplo / Even Better TOML) | one derive per struct |
| `garde` / `validator` | declarative field validation | shorter range checks | cross-field rules (ring indices, interlock members) stay custom, and they are most of it |
| `figment` / `config` | layered config sources | — | there's no layering need |

**Verdict: add `schemars`; keep the rest.** The validation that matters is about the machine (indices, references,
interlocks), and that is custom by nature.

### L3 Control

**Today:** `sessions.rs` (844 lines with tests), supervision and health in `main.rs`, interlocks in `signals.rs`.

| Candidate | How | Gains | Costs |
|---|---|---|---|
| gRPC bidirectional stream as the lease | the session is an open stream; a closed stream expires the lease at once | immediate fallback on a clean disconnect; receipts ordered on one channel | still needs an application-level timeout (T2), since a hung client keeps the stream open; a protocol change |
| lease libraries (etcd-style) | — | — | for distributed coordination; nothing fits an in-process 200 ms lease |
| rule engines | express guards as rules | — | the guard design already chose closures over a rule language |

**Verdict: keep custom.** The control model *is* the product: leases, fallback, no-replay, guards. After the refactor
(one thread owns the state, closures for guards) it is small. The bidirectional stream is a protocol choice worth
making on its own merits (`generic-polymx-split.md`, question 5), not a library replacement.

### L4 Observation

**Today:** about 2,700 lines across `faults.rs`, `continuous_faults.rs`, `faults_impl.rs`, `faults.proto`,
`fault_types.py`, `bus_status.rs` and `bus_impl.rs`, plus diagnostics (`diagnostics.rs` 163, `diagnostic_request.rs`
718, `diagnostics_impl.rs` 219).

| Candidate | How | Gains | Costs |
|---|---|---|---|
| **typed status fields + one event stream** (small, custom) | counters, cycle time and condition counts as fields in the status the cycle already publishes; events in a bounded ring with sequence numbers, streamed with `WatchEvents(from_seq)` | no metrics dependency; self-documenting and versioned with the API; generated classes are the whole client-side decoder; works offline over the existing link | a new metric is a proto field; generic tools need a forwarder; only last and max cycle time unless a histogram field is added |
| `tracing` + `tracing-subscriber` | records events; a small Layer copies them into the ring | `docker logs` and the stream show the same events; structured fields | replaces `log`; optional |
| `metrics` + `metrics-exporter-prometheus` | counters and histograms, rendered as Prometheus text (over HTTP, or as a gRPC reply) | standard format, percentiles, Grafana-ready | a registry, an exporter and a text parser for one known consumer; a Prometheus/Grafana stack for history, on each offline machine (D1) or centrally |
| OpenTelemetry (OTLP) | the same over OTLP | vendor-neutral, traces too | heavy SDK that changes version often; needs a collector or a custom exporter |
| `tokio::sync::watch` / `arc-swap` | snapshot publishing | — | already `watch`; `arc-swap` only if readers must never block |

Prometheus and OTLP are too heavy for this application (user, 2026-11-03). They exist so that generic tools can read
an open-ended set of metrics from many programs. Here the set of numbers is small and known in advance, and there is
one consumer.

What stays: the **active conditions** in the snapshot (what a client or guard acts on) and **diagnostics** (device
reads through the only master). The design is in `layered-refactor.md`, *L4 Observation*.

- **Gains:** removes the fault store, its streaming protocol, capacity reservation and reporting-health machinery, and
  the error-channel design that documents them, with no new dependency except optional `tracing`. Counts are
  cumulative since boot, so a reconnecting client loses none.
- **Costs:** O1 changes form. "Never looks healthy when incomplete" becomes cumulative counters with a boot ID, plus
  an explicit `missed` count on the event stream. History beyond the ring belongs to the consumer (panel, file, or a
  ROS `/diagnostics` forwarder in the machine part).

**Verdict: replace the fault store with typed status fields and one event stream (optionally recorded with
`tracing`); keep active conditions and diagnostics.** This is the largest reduction available, and it comes from
simplification, not a library. Whether the history API can go depends on whether the history design came from a
requirement such as audit or post-incident analysis.

### L5 Service

**Today:** `tonic` (library) plus about 4,000 lines of service adapters (`io_impl.rs` 1,012 and `signal_impl.rs` 849
lead), `api.rs` semver (131) and `semver.py` (39), and the protocol check script (75).

| Candidate | How | Gains | Costs |
|---|---|---|---|
| keep `tonic` | — | — | — |
| `semver` crate (Rust) and `semver` package (Python) | parse and compare versions | removes two hand-written parsers kept in step | the project's rules (exact match while 0.x) stay a small function |
| `tonic-types` (`google.rpc.Status` details) | structured refusal reasons (guard name, condition) | clients read refusals without parsing text | small |
| `tonic-health` | standard health service | probes from Compose and tools | small |
| `buf lint` + `buf breaking` | protocol lint and breaking-change check in CI | catches wire breaks between versions | doesn't replace `check_protocol.py`'s Rust-vs-Python descriptor comparison |
| OPC UA (`async-opcua`, Python `asyncua`) | standard industrial API instead of gRPC | SCADA and HMI tools can browse it | 0.x crate; heavier model; leases and refusals don't map naturally; replaces a working protocol |
| ROS 2 interfaces | topics, services, actions | the QC app's native middleware | see the `ros2_control` section; a Rust ROS node (`rclrs`) or a Python bridge |

**Verdict: keep `tonic`; adopt `semver`, `tonic-types`, `tonic-health`, `buf`.** The adapters themselves shrink with
the protocol change (`Io` removed, name addressing) rather than through a library.

### Runtime

**Today:** the pacer (294 lines), the cycle loop in `ethercat.rs`, wiring in `main.rs` (968 lines with tests).

| Candidate | How | Gains | Costs |
|---|---|---|---|
| `spin_sleep` | sleep-then-spin to an absolute deadline | replaces the hand-written hybrid sleep | small; calibration differs per host |
| `thread-priority`, `core_affinity` | `SCHED_FIFO` and CPU pinning for the cycle thread | less jitter from the host | needs container capabilities (`CAP_SYS_NICE`) |
| `rtrb` | wait-free single-producer, single-consumer queue for commands | the cycle thread never blocks on the queue | one queue per producer, or a fan-in task |
| `crossbeam-channel` / `tokio::mpsc` `try_recv` | bounded multi-producer command queue | simple, many producers | not wait-free (fine at 10 ms) |
| `triple_buffer` / `arc-swap` | publish the snapshot | readers never block the cycle | `tokio::sync::watch` may already suffice |

**Verdict: adopt `spin_sleep`, `thread-priority`, and a bounded channel; keep the cycle order custom.** The order
within the tick is the architecture, not a utility.

### Client (Python)

**Today:** `client.py` (1,238), `supervision.py` (505), value types (318), `semver.py` (39), test double (569),
scan cycle (248).

| Candidate | How | Gains | Costs |
|---|---|---|---|
| keep `grpcio` | — | — | — |
| `grpc.aio` | asyncio client | fits async applications | the QC app uses `rclpy` executors, not asyncio; renewal must stay off the GIL-heavy path |
| `tenacity` | retry policies | — | retries risk replay (C1); only for reads |
| simulated server as test double | run the generic server with `SimBus` in tests | removes the 569-line fake and its contract tests | tests need the server binary (already true for integration tests) |
| `semver` package | as in L5 | — | — |

**Verdict: keep the session and renewal code custom (it implements T2 and C1); replace the fake with the simulated
server; the renewal timing ring stays client-side.**

### Simulation

**Today:** a digital-loopback `Simulated` device (206 lines). No library simulates an EtherCAT ring with plant
models; full simulators (Gazebo via `ros2_control`, vendor tools) only make sense in the `ros2_control` direction.
**Verdict: keep custom.**

### Build, release and checks

**Today:** `check_artifacts.py` (122), `release_manifest.py` (61), `check_protocol.py` (75), `check_release.sh`,
`check_container.sh`, and the live harnesses `client_contract_check.py` (582), `status_consumer_check.py` (549) and
`simulation_soak.py` (353).

| Candidate | How | Gains | Costs |
|---|---|---|---|
| `buf` | as in L5 | standard protocol checks | partial overlap only |
| `cargo-cyclonedx`, `cyclonedx-py`, `cargo-auditable` | SBOMs and embedded dependency lists | standard artifact identity next to the hash manifest | the manifest's TOML and binary hashes stay custom (D2) |
| `build`, `twine check`, `check-wheel-contents` | wheel and sdist checks | standard packaging checks | the isolated-import check stays custom |
| live harnesses | — | — | they test this contract against real hardware; custom by nature |

**Verdict: adopt `buf` and standard packaging checks; keep the hash manifest and the live harnesses.** They shrink
with the features they check (fault snapshots, for example).

## Overview

| Part | Custom today (lines, incl. inline tests) | Replace with | Gain | Cost | Verdict |
|---|---|---|---|---|---|
| Whole stack | everything | `ros2_control` + `ethercat_driver_ros2` | company stack; config-driven terminals; ROS tooling | rewrite, requalification, IgH kernel module, leases rebuilt, M5 changes | separate decision; spike first |
| Whole stack | everything | CODESYS / TwinCAT | industrial runtime and tooling | licenses, IEC 61131 or Windows/BSD, poor git fit, leases custom | no |
| L0 Bus | ~1,000 around `ethercrab` | IgH, SOEM, acontis | maturity | kernel module, FFI or license | keep `ethercrab` |
| L1 Devices | ~4,300 | ESI, CiA-402 and IODD crates | vendor data | immature or unmaintained crates; firmware rules unknown to them | keep; generic PDO terminal driver for simple terminals |
| L2 Machine model | ~1,600 | `schemars` (+ `garde`) | editor validation of the TOML | small | add `schemars` |
| L3 Control | ~1,000 | — (bidirectional stream is a protocol choice) | — | — | keep custom |
| L4 Observation | ~2,700 faults/status + ~1,100 diagnostics | typed status fields + one event stream (custom, small); optional `tracing` | removes the fault store and its protocol; no new dependency; works offline over the existing link | a new metric is a proto field; O1 changes form; history beyond the ring belongs to the consumer | replace the fault store; keep active conditions and diagnostics (Prometheus and OTLP too heavy) |
| L5 Service | ~4,000 adapters + ~170 semver | `semver`, `tonic-types`, `tonic-health`, `buf` | fewer parsers; structured refusals; standard checks | small | adopt |
| Runtime | ~300 pacer + wiring | `spin_sleep`, `thread-priority`, bounded channel | tested timing primitives, less jitter | container capability for priority | adopt |
| Client | ~2,900 | simulated server as test double | removes the fake | needs the server binary in tests | session code stays; replace the fake |
| Simulation | ~200 | — | — | — | keep custom |
| Tooling | ~1,900 | `buf`, SBOM and packaging tools | standard checks | partial overlap | adopt; live harnesses stay |

In short: **the bus is already a library, and the control model is the product.** The largest reduction is in
observability (L4, about 2,700 lines), by simplifying rather than adopting a library. The library gains are small
utilities (semver, pacing, protocol checks, packaging). The one
alternative that could replace most of the server, `ros2_control`, deserves its own decision because it changes M5 and
the deployment.

## Open questions

1. Did the fault-history design come from a requirement (audit, post-incident analysis), or from thoroughness? If
   from a requirement, the event ring's size and a consumer that keeps history need to meet it.
2. Should the server move into the ROS 2 world the QC app already lives in? This is the `ros2_control` decision, and it
   reopens M5.
3. Which of the documented requirements (T1–D2) are confirmed requirements, and which can change?

## Sources

- [ethercrab on docs.rs](https://docs.rs/crate/ethercrab/latest/source/examples/akd.rs.disabled), [ethercrab changelog (DC, CoE)](https://rust-digger.code-maven.com/src/ethercrab-0.4.4/CHANGELOG.md)
- [acontis spring 2026 newsletter (EC-Master Rust wrapper)](https://www.acontis.com/en/news/newsletter-spring-2026.html)
- [`ethercat` crate (IgH bindings)](https://lib.rs/crates/ethercat), [`ethercat-esi`](https://lib.rs/crates/ethercat-esi)
- [oxictl DS-402](https://docs.rs/crate/oxictl/latest/source/src/protocol/canopen/ds402.rs), [autocore-std CiA-402](https://docs.rs/crate/autocore-std/latest/source/src/motion/cia402.rs)
- [ioddengine](https://docs.rs/ioddengine), [iodd-parser](https://pypi.org/project/iodd-parser/)
- [ethercat_driver_ros2](https://github.com/ICube-Robotics/ethercat_driver_ros2), [its EtherCAT tutorial](https://icube-robotics.github.io/ecat_ros2_workshop/tutorials/ethercat_tutorial), [ROSCon France 2025 workshop](https://roscon.ros.org/fr/2025/img/workshops/workshop08.pdf)
- [CODESYS Control for Linux SL datasheet](https://us.store.codesys.com/media/n98_media_assets/files/2302000005/0/CODESYS%20Control%20for%20Linux%20SL_en.pdf), [CODESYS store](https://us.store.codesys.com/catalogsearch/result/?q=license), [CODESYS forum on pricing](https://forge.codesys.com/forge/talk/Runtime/thread/8613eeaba5/)
- [Beckhoff ADS library](https://github.com/Beckhoff/ADS), [pyads](https://pypi.org/project/pyads/3.5.0/)
- [async-opcua](https://docs.rs/async-opcua)
- [rtrb](https://docs.rs/crate/rtrb/latest), [waitfree_sync](https://docs.rs/waitfree_sync)
- [statig](https://github.com/mdeloof/statig)
- [buf CI setup](https://buf.build/docs/ci-cd/setup), [buf-action](https://github.com/bufbuild/buf-action)

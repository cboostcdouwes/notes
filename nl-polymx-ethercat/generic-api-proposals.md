# Generic core: six independent API proposals compared

**Status (2026-11-09): comparison of agent proposals; nothing here is decided.** Six subagents each designed the
generic core from a brief based on `generic-problem-statement.md`. None of them saw the earlier proposals
(`generic-polymx-split.md`, `layered-refactor.md`, `library-replacement.md`). The full proposals aren't kept; this
note holds the comparison and the briefs' requirements.

## How the proposals were made

| Round | Agents | Brief | Bias found |
|---|---|---|---|
| 1 | A, B, C (Opus) | Problem statement plus the GC/GN requirements; repo readable | Several requirements named a design (one cycle thread, a second bus implementation with plant models, a version handshake, gRPC as "the server"); the deliverable listed the components; the repo anchored them to today's design. Their shared skeleton is therefore not evidence |
| 2 | D (Opus, neutral), E (Opus, existing products first), F (Fable, designed from the users' code inward) | The outcome-only requirements below; no repo or vault access; no language, framework or protocol fixed; deliverable didn't name components | Remaining: R4 and R9 wording (see *Caveats*); all agents are Claude models |

### Requirements used in round 2

| # | Outcome | Status |
|---|---|---|
| R1 | Process data is exchanged at a fixed period set per machine; missed periods are visible | proposed |
| R2 | Nothing is driven if the connected devices differ from the machine's description; all differences are reported together | proposed |
| R3 | A new machine built from supported device models needs no change to the reusable part; support for a device model is written once, for all machines | proposed |
| R4 | The application runs in a separate process, imports a machine-specific client package, addresses everything by the machine's names, and can discover what the machine offers | separate process and client package verified (M5); rest proposed |
| R5 | Protection rules are the only place machine/process protection lives; they react within one period of seeing the triggering input, keep acting when communication with the devices fails, and are supplied by the machine | verified (2026-11-09) |
| R6 | A command never takes effect twice; when the application can't know whether it took effect, it is told so | proposed |
| R7 | Every value seen by the application or a rule carries its age; absent data is never presented as a value or as healthy | proposed |
| R8 | An application built against an incompatible version cannot change outputs | proposed |
| R9 | The whole stack can be exercised without hardware, using the same device-handling code that runs on the real machine | simulator verified (2026-11-09); the "same code" wording is Claude's |
| N1 | No safety-function claim: personnel safety is the wiring (e-stop, STO); rules guard machine and process only | verified (2026-11-09) |
| N2 | Only one EtherCAT master uses a network interface | proposed |

Out of scope: reacting to a silent or crashed application (the orchestrator monitors liveness; verified 2026-11-09).

## What held up across all six

Present in round 1 and again in round 2, although round 2's brief no longer named them:

- **Rust with ethercrab** for the real-time process. E chose it after surveying the alternatives: user-space, which
  suits Docker, and a permissive licence.
- **One real-time cycle thread owns the bus.** The application side only reaches it through a queue and a published
  snapshot.
- **Every period runs exchange → decode → apply commands → protection rules → encode.** The rules come after the
  commands and right before encode, so a rule has the last word (this settled round 1's main disagreement).
- **Simulation is a `Bus` implementation below the device models**, with one sim device per model and fault
  injection.
- **Protection rules are Rust compiled into the machine's binary.** They force outputs, veto or inhibit commands, and
  keep running when the exchange fails. A TOML rule language was rejected by all six.
- **Commands** carry a client id; the server keeps a ledger and a boot id; a lost reply is `OutcomeUnknown`; nothing
  is retried automatically.
- **Readings** are fresh or absent, with an age; `.value` on absent data raises in Python.
- **A fingerprint gates commands**; reads stay open to any client.
- **On a ring mismatch** the bus stays in PRE-OP and the report is served to clients.
- **A `flock` per NIC.**

## New in round 2

- **Device watchdogs are the fallback when the PC goes silent** (SyncManager watchdog, `0x6007` on drives). A device
  that drops out passes the topology check again before it rejoins. D: drives come back disabled after a fault.
- **The Python client is generated from `machine.toml`** (D, E, F); its schema hash doubles as the R8 fingerprint.
  E also generates typed Rust handles, so a misspelt name in a rule fails at compile time. Round 1 used a
  hand-written facade checked against `Describe` at runtime.
- **Real-time setup is part of the design:** `SCHED_FIFO`, an isolated core, `mlockall`, no allocation in the cycle;
  PREEMPT_RT (mainline since 6.12) in E and F.
- **A panicking rule is fatal** (F): the process exits and the watchdogs take over.
- **Second-master detection** (E, F): listen for foreign EtherCAT frames before starting. E also moves the NIC into
  the runtime's own network namespace.
- **E's product survey** (product facts from E's web sources, not checked by Claude): no product meets R2, R6, R7,
  R8 and R9 together.
  - ros2_control with `ethercat_driver_ros2`: its mock replaces the device code (fails R9); command interfaces hold a
    latest value with no ids or ages (fails R6, R7); needs the IgH kernel module on the host.
  - CODESYS: per-device licences and a licence server, awkward offline; IEC 61131; lock-in.
  - TwinCAT for Linux: Beckhoff IPCs and OS, strongest lock-in.
  - acontis EC-Master/EC-Simulator: commercial; master layer only.
  - IgH: host kernel module. SOEM 2.x: GPLv3 or commercial. EtherCrab: permissive, pre-1.0, small maintainer base.

## Where they still disagree

| Question | D | E | F | Round 1 |
|---|---|---|---|---|
| Transport to the application | Unix socket with msgpack | ROS 2 (r2r node inside the runtime) | gRPC over a Unix socket | gRPC (dictated by the brief) |
| What the application addresses | Signals and commands per device (open) | Signals per model plus commands (open) | Fixed capabilities: DigitalIn/Out, AnalogOut, Measurement, Axis (closed) | B, C open; A closed |
| What "Applied" means | Accepted by the device model | Confirmed by a valid working counter on the carrying exchange | Same as E | Split the same way |
| Clients that may command | One at a time | Not stated | One at a time | Many |
| Runtime mailbox access (SDO, IO-Link ISDU) | Open question | Open question | On the bus's async side, outside the cycle | Startup only |

## Caveats

- **R9's wording decides a lot.** "The same device-handling code" is what rules out ros2_control in E's survey. If
  the simulator Must is looser (e.g. "the application can be tested without hardware"), ros2_control comes back
  into play.
- **R5's "within one period"** pushes the rules into the same process. That one is verified.
- **All six are Claude models.** Not independent the way six human designers would be.

## Open questions

1. Who writes the protection rules, and is Rust acceptable for them? (First open question of all three round-2
   agents.) If not, the design moves toward Python rules or a declarative layer.
2. Transport: gRPC over a Unix socket (Claude's pick: keeps DDS out of the real-time process, mature in Rust and
   Python, already used by the current server; a ROS bridge can come later), ROS 2 native (pick only if `ros2 bag`
   and `topic echo` on the machine state matter), or msgpack over a Unix socket.
3. "Applied": accepted by the driver, or confirmed on the wire?
4. One commanding client, or several?
5. Open or closed capability set? (Claude's pick: open, for M1.)
6. Runtime mailbox access: needed or not?

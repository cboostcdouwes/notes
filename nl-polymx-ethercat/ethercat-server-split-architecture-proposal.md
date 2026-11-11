# EtherCAT server: split architecture proposal

Nov 10, 2026 · @Chiel Douwes

## Summary

The server becomes two parts in one process, joined by one narrow interface called the **port**.

- **Realtime part** (`ethercat-realtime`): one cycle thread that owns the EtherCAT master, the device drivers and the protection rules. It shares no thread, lock or async runtime with the gRPC part and knows nothing about clients.
- **gRPC part** (`ethercat-grpc`): serves the machine to clients. It owns the handshake, command ids and streams. It accepts connections from anything that implements tokio's `AsyncRead + AsyncWrite`, so TCP, a Unix socket and an in-memory pipe are all the same code path.
- **Port** (`ethercat-port`): three wait-free channels between them, plus a mailbox channel served outside the cycle. Commands go in through a bounded queue. The latest machine state and a stream of events come out.

The main reasons:

1. The cycle thread can't be delayed by a client. Nothing it does takes a lock, allocates or wakes a task that the gRPC part controls.
2. Each part is tested alone. The gRPC part runs against a scripted port, the realtime part runs with no socket.
3. The port is the only contract. Another front end (for example a ROS 2 bridge) attaches to it without touching the realtime part.

Status: proposal. It is based on `generic-problem-statement.md` and `generic-api-proposals.md` in the notes vault. Choices that rest on unverified requirements are marked.

## Context

Today's server (`0.0.5`) has the two concerns in one piece. gRPC handlers run on tokio tasks and call driver methods directly, while the cycle thread calls `update()` on the same drivers. Drivers therefore lock their own state (spin mutexes, atomics, watch channels), sessions are a separately locked store, and a 5 ms tokio task coordinates sessions, faults and health under lock-order rules. `grpc_server::run` takes seven `&'static` references into that shared state and a TCP address string.

This causes three problems:

- **No place for in-cycle protection rules.** A rule that reads inputs and forces outputs in the same cycle would be one more party to the locking (`generic-polymx-split.md`, *Current state*).
- **The cycle depends on handler behaviour.** A handler that holds a driver lock delays the cycle thread.
- **The transport is fixed.** The address is parsed as a `SocketAddr`, so only TCP works. Tests need a real port.

Six independent designs for the generic core agreed on the cure for the first two: one cycle thread owns the bus, and the application side reaches it only through a queue and a published snapshot (`generic-api-proposals.md`, *What held up*). This proposal turns that agreement into a crate boundary with a defined API, and adds the transport abstraction.

## Requirements and assumptions

Only the rows marked *verified* are settled. The rest are taken from the request or from the notes and still need confirmation. R and N numbers refer to `generic-api-proposals.md`, M numbers to `generic-polymx-split.md`.

| # | Requirement | Priority | Status | What it decides here |
| --- | --- | --- | --- | --- |
| Q1 | The server is split into a realtime bus part and a gRPC communication part | Requested | From the user (2026-11-10). Reasons (2026-11-11): timing isolation (a realtime-priority cycle thread, a non-realtime server thread), testing, other front ends later, separation of concerns. Crash isolation is nice to have, not required | The two parts and the port; one process (A1) |
| Q2 | The gRPC part serves over any socket, expressed through a trait | Requested | From the request (2026-11-10); reason not stated | The `serve` signature |
| R5 / M2 | Protection rules react within one period and keep acting when the device exchange fails | Must | Verified (2026-11-09) | Rules run in the realtime part, never behind the port |
| M5 | The application is a separate process that imports a client package | Must | Verified (2026-11-03) | A network protocol is needed at all |
| GA1 | The server takes no action when a client goes quiet | Won't | Verified (2026-11-09) | No leases or heartbeats in either part |
| R9 | The stack runs in full without hardware | Must | Simulator verified (2026-11-09); "same device code" wording unverified | Simulation sits below the drivers, inside the realtime part |
| R1 | Fixed period per machine; missed periods are visible | Should | Proposed | Overruns are counted in the published state |
| R6 | A command never takes effect twice; an unknown outcome is reported as unknown | Should | Proposed | Command ids and the ledger in the gRPC part |
| R7 | Every value carries its age; absent data is never shown as a value | Should | Proposed | Per-device freshness in the state |
| R8 | A client built against an incompatible version can't change outputs | Should | Proposed | The handshake in the gRPC part |
| A1 | The two parts run in one process | Assumption | Mine; fits Q1, which doesn't require crash isolation. See *Alternatives* | Port is in-memory. Only owned, plain data crosses it |
| A2 | One client commands at a time; any number read | Assumption | Open question 4 in the notes | Arbitration lives in the gRPC part |
| Q3 | Linux in deployment; the server also runs on Windows for testing | Requested | From the user (2026-11-11) | The port uses nothing Linux-only. Realtime thread setup and Unix sockets are Linux-only extras |

## Architecture

&#91;embedded content: architecture · two parts and the port between them\]

Commands flow down through one queue; state and events flow up. The six boxes in the realtime part are one period, left to right. Nothing in the gRPC part is called by, or can block, the cycle thread.

## Realtime part

The realtime part is everything that must happen every period: the exchange with the ring, the device drivers, the machine's protection rules. It is a library with one entry point.

```rust
/// Checks the ring against the machine description, then starts the cycle thread.
pub fn start(
    machine: Machine,          // parsed machine.toml
    bus: impl Bus,             // EthercrabBus or SimBus
    rules: Rules,              // the machine's protection rules
    realtime: RealtimeConfig,  // period, priority, core
) -> Result<(Port, CycleThread), StartError>;
```

`Port` is the application's end of the interface (next section). `CycleThread` is a handle with `stop()` and `join()`; `join()` returns why the cycle ended.

Every period the cycle thread runs the order all six earlier designs converged on:

1. **Exchange** process data with the ring.
2. **Decode** the inputs into driver state. A failed exchange marks the affected devices as not fresh.
3. **Apply commands**: pop at most a fixed number from the port and hand each to its driver. A command is popped only when an event slot is free for its outcome.
4. **Run the protection rules.** They see the decoded inputs and can force outputs or stop axes. They run after the commands, so a rule has the last word, and they run when the exchange failed too.
5. **Encode** the outputs for the next exchange.
6. **Publish** the state and this period's events to the port.

Rules for code on the cycle thread:

- **No lock shared with another thread.** The thread owns all driver, rule and command state outright, so drivers lose their interior locking.
- **No allocation after startup.** Queues, the state buffer and driver state are sized from the machine description.
- **No blocking call except the exchange and the pacer's sleep.**
- **Bounded work per period.** The command limit in step 3 keeps a flood of commands from stretching a period.

Ethercrab is async. Its futures stay on an executor private to the cycle thread, as in today's `Ethercat::run_blocking`. The gRPC part's tokio runtime is a different runtime on different threads.

Thread setup (`SCHED_FIFO`, `mlockall`, a pinned core) is done by `start` from `RealtimeConfig`. It is Linux-only. On Windows the cycle thread runs without it, which is enough for testing and gives no timing guarantee (Q3). Startup work (discovery, the topology check, SDO configuration) runs before the first period. On a ring mismatch the bus stays in PRE-OP, the port still opens, the state carries the mismatch report, and every command is rejected.

A panic on the cycle thread ends the process. The devices' own watchdogs then take the outputs to their safe state.

## The port

The port is the whole contract between the two parts: one fixed description, commands in, state and events out. It lives in its own crate of plain types, with no dependency on ethercrab, tokio or tonic.

```rust
/// The application's end. Exactly one exists; it is not Clone.
pub struct Port {
    pub description: Arc<Description>,
    pub commands: Commands,
    pub updates: Updates,
    pub mailbox: Mailbox,
}

impl Commands {
    /// Never blocks. `Full` means the command was not queued and will not take effect.
    pub fn submit(&mut self, command: Command) -> Result<(), Full>;
}

impl Updates {
    /// Blocks until the cycle thread has published a newer period.
    pub fn wait(&mut self) -> Update<'_>;
}

pub struct Update<'a> {
    pub state: &'a State,     // the latest period; earlier ones may have been skipped
    pub events: Events<'a>,   // every event since the previous call, in order
    pub events_lost: u64,     // conditions dropped because this side fell behind; outcomes are never dropped
}
```

### What crosses it

```rust
/// Fixed for the life of the process.
pub struct Description {
    pub boot_id: BootId,            // new on every start
    pub fingerprint: Fingerprint,   // hash of the machine description
    pub period: Duration,
    pub targets: Vec<TargetInfo>,   // name, kind, unit, direction, limits, device
    pub rules: Vec<RuleInfo>,
}

pub struct Command {
    pub id: CommandId,      // chosen by the sender, echoed in the outcome
    pub target: TargetId,   // index into Description::targets
    pub action: Action,     // write a value, or a device operation (home, move, stop)
}

pub struct State {
    pub period: u64,              // counter since start
    pub at: Instant,              // monotonic time of this period's exchange
    pub bus: BusState,            // operational or mismatch report, overruns, failed exchanges
    pub readings: Box<[Reading]>, // one per target, in Description order
}

pub struct Reading {
    pub value: Value,
    pub fresh_at: Option<u64>,    // period of the last valid exchange; None = never read
    pub forced_by: Option<RuleId>,
}

pub enum Event {
    Outcome { id: CommandId, outcome: Outcome, period: u64 },
    Condition { source: Source, change: Change, period: u64 },  // fault raised or cleared
}

pub enum Outcome {
    Applied,            // carried by an exchange the devices acknowledged
    Rejected(Reason),   // never reached the outputs
}
```

### How each channel behaves

| Channel | Direction | Mechanism | When the other side is slow or gone |
| --- | --- | --- | --- |
| Commands | in | Bounded single-producer, single-consumer ring | `submit` returns `Full`. The command is not queued |
| State | out | Latest-value buffer (triple buffer). The writer never waits; the reader always gets one complete period | The reader skips periods. It never sees a half-written one |
| Events | out | Bounded single-producer, single-consumer ring. One slot stays reserved for every command that was popped and has no outcome yet | An outcome always has its slot. A condition that finds only reserved slots is dropped and counted in `events_lost`. When no slot can be reserved, no further command is popped, so `submit` ends up returning `Full` |
| Wake | out | One thread unpark per period (std `park`/`unpark`, available on Linux and Windows) | Nothing waits on it; the call is non-blocking |
| Mailbox | in and out | Bounded request ring in, reply ring out. Served by a mailbox thread in the realtime part, never by the cycle thread | The request is refused with `Full`. The cycle is unaffected |

Every operation on the cycle thread's end is wait-free and allocation-free. That property is the reason for the port's shape.

### Why this shape

- **Commands and events are data, not trait methods.** Enums can be queued, logged and scripted in tests. An `async fn set_output()` on a trait would put futures and their wake-ups on the cycle thread.
- **Targets are ids, not names.** The front end resolves a name once against `Description`. The cycle thread never compares strings.
- **Outcomes arrive as events, not in a reply slot per command.** A reply slot is an allocation that the cycle thread ends up freeing.
- **State is a latest value, events are a sequence.** A reader wants the current reading but must not miss a command outcome. One channel can't serve both without either unbounded memory or lost outcomes.
- **`wait` blocks; it is not async.** The port then fits any front end. The gRPC part calls it from one dedicated thread.
- **One owner, not `Clone`.** Single-producer rings need it, and it makes fan-out to many handlers an explicit job of the front end, where locks are harmless.
- **Loss is always reported, and an outcome is never lost.** A full command queue, a skipped period and a dropped condition each have a visible signal. Every command the cycle thread pops gets exactly one outcome, because the slot for it is reserved before the pop. Nothing is retried on its own (R6).
- **Only owned, plain data crosses.** Apart from the immutable `Description`, the parts share no reference, lock or callback. That keeps the boundary rigid as a separation of concerns. It is also what a process boundary would need, but that is not a goal of this proposal (Q1).

### What the port leaves out

Client identity, protocol versions, command de-duplication and who may command are communication concerns. They live in the gRPC part.

### Mailbox channel

Today's `Diagnostics` service already reads device registers and SDOs at runtime: gRPC handlers hold the `MainDevice` and run ethercrab futures on their own runtime (`diagnostic_request.rs`). That can't stay, because the gRPC part must not depend on ethercrab. Dropping the `Diagnostics` service is the alternative.

The mailbox channel carries these reads. A request names a device and what to read; each accepted request gets exactly one reply (the data, an error or a timeout). A mailbox thread in the realtime part serves the requests one at a time, outside the cycle, so a slow device delays other mailbox requests and never a period. It is read-only, as today: there is no SDO download path. The request and reply types are still open; IO-Link ISDU access would use the same channel.

## gRPC part

The gRPC part turns a `Port` into a network service. It also has one entry point.

```rust
pub async fn serve<L, C>(
    port: Port,
    incoming: L,                          // a stream of accepted connections
    shutdown: impl Future<Output = ()>,
) -> Result<(), ServeError>
where
    L: Stream<Item = io::Result<C>>,
    C: AsyncRead + AsyncWrite + Unpin + Send + 'static;
```

### The transport trait

A connection is anything that implements tokio's `AsyncRead + AsyncWrite`. A listener is a `Stream` of such connections. No new trait is defined.

```rust
// TCP, as today
serve(port, TcpListenerStream::new(TcpListener::bind("127.0.0.1:50051").await?), stop).await

// Unix socket (Unix only; on Windows the binary offers TCP)
serve(port, UnixListenerStream::new(UnixListener::bind("/run/ethercat/server.sock")?), stop).await

// Test: in memory, no port and no file
let (client_end, server_end) = tokio::io::duplex(64 * 1024);
serve(port, tokio_stream::once(Ok(server_end)), stop).await
```

Why these traits:

- **They already exist and are already implemented.** `TcpStream`, `UnixStream`, `DuplexStream`, TLS streams and the vsock crates implement them. An own `Transport` trait would be a second name for the same two methods, plus one implementation per socket type to maintain.
- **Tonic accepts exactly this.** `serve_with_incoming_shutdown` in tonic 0.12 takes a stream of `AsyncRead + AsyncWrite` connections. It also requires its own `Connected` trait. `serve` wraps each connection in a private type that implements `Connected` with no peer information, so tonic stays out of the public signature.
- **The library doesn't parse addresses.** Whether `--listen` says `tcp://` or `unix://` is the binary's choice. An address enum in the library would close the set of transports again.

Cost: handlers can't see the peer's address or Unix credentials. If access control by peer credentials is wanted later, the bound on `C` gains `Connected`. Socket options such as `TCP_NODELAY` are set where the socket is created, not inside `serve`.

Recommended default for deployment: a Unix socket on a path both processes can reach. File permissions then decide who can connect, and no port is open on the host. TCP stays available for the debug panel on another machine. This needs your confirmation; today's deployment uses `127.0.0.1:50051`.

### Inside

| Piece | Job | Port use |
| --- | --- | --- |
| Pump | One thread that calls `updates.wait()`. Republishes the state to a tokio watch channel, routes each outcome to the handler waiting for it, forwards conditions | `updates` |
| Gate | `Hello` compares the client's protocol version and machine fingerprint. Only a compatible client may command. Reads stay open to all (decision of 2026-11-03) | `description` |
| Ledger | Remembers each client command id and its outcome for this boot id. A repeated id gets the recorded outcome and isn't submitted again | `commands`, outcomes |
| Services | Translate protobuf to and from port types. Resolve names to target ids | all |

A command call runs gate, ledger, name lookup, `submit`, then waits for the outcome event. Its results map to the client as follows.

| Port result | Client sees | Took effect |
| --- | --- | --- |
| `Outcome::Applied` | OK, with the period that carried it | Yes |
| `Outcome::Rejected(reason)` | `FAILED_PRECONDITION` with the reason | No |
| `submit` returned `Full` | `RESOURCE_EXHAUSTED` | No |
| Deadline passed | Outcome unknown. The outcome still arrives and is recorded in the ledger, so the client gets it by asking again with the same command id | Unknown at that moment |

A read is answered from the latest state. Its age is the time since `State::at` plus the periods since `fresh_at`. A reading with `fresh_at = None` is sent as absent, never as a value (R7).

The service list itself (`Machine`, `Signal`, `Axis`, `Distance`, `Telemetry`, and `Diagnostics` on the mailbox channel) is the one in `layered-refactor.md` without `Session`, which GA1 removes. This proposal doesn't change it.

## Crates

Three library crates and one binary per machine. The compiler enforces the split, because neither part can name the other.

| Crate | Holds | Depends on | Must not depend on |
| --- | --- | --- | --- |
| `ethercat-port` | `Port`, `Description`, `Command`, `State`, `Event`, the channels | A ring buffer and a triple buffer crate | ethercrab, tokio, tonic |
| `ethercat-realtime` | `start`, cycle thread, `Bus` with `EthercrabBus` and `SimBus`, drivers, machine model, rule API | `ethercat-port`, ethercrab | tonic, `ethercat-grpc` |
| `ethercat-grpc` | `serve`, protos, pump, gate, ledger, services | `ethercat-port`, tonic, tokio | ethercrab, `ethercat-realtime` |
| Machine binary (for example `polymx-server`) | `main`: arguments, listener, wiring, the machine's rules | all three |  |

The binary is the only place where the parts meet:

```rust
fn main() -> Result<(), StartError> {
    let args = Args::parse();
    let machine = Machine::load(&args.machine)?;
    let bus = EthercrabBus::open(&args.interface)?;   // or SimBus::new(&machine)

    let (port, cycle) = ethercat_realtime::start(machine, bus, polymx_rules::all(), args.realtime)?;

    let runtime = tokio::runtime::Runtime::new()?;
    let served = runtime.block_on(ethercat_grpc::serve(port, listen(&args.listen)?, stop_signal()));

    cycle.stop();
    cycle.join()?;
    Ok(served?)
}
```

Relation to `layered-refactor.md`: `ethercat-realtime` contains that proposal's layers L0 to L4 and its runtime, and `ethercat-grpc` is its L5. Whether the realtime part is split further into the bus, devices and control crates proposed there is independent of this boundary. The port is what this proposal adds.

A separate port crate is justified by two users from the first day (both parts) plus the tests of each. It also keeps the gRPC part's build free of ethercrab, and gives a later front end one small crate to depend on.

## Failure handling

A failure on one side of the port never stops the other side's work; it shows up as a signal the other side already handles.

| Failure | Realtime part | gRPC part and client |
| --- | --- | --- |
| Client disconnects or goes quiet | Unaffected. Outputs keep their last commanded value (GA1) | Streams end. A command already queued still takes effect; its outcome stays in the ledger |
| gRPC part stalls or its handlers panic | Keeps cycling. Rules keep running. State is overwritten, conditions are dropped and counted. Once every event slot is reserved for an outcome, no further command is popped | Calls whose deadline passed have returned outcome unknown. On recovery the pump drains the outcomes, none of which was lost, and the ledger records them |
| Listener fails, `serve` returns an error | The binary stops the cycle thread in order and exits | The process supervisor restarts the server; clients see a new boot id |
| More commands than the queue holds | Unaffected | `RESOURCE_EXHAUSTED`; the command didn't take effect |
| Device exchange fails | Rules still run. Affected readings stop being fresh | Reads report growing age, then absent. Commands to those devices are rejected |
| Ring doesn't match the description | Stays in PRE-OP. Publishes the full mismatch report | Serves the report. Every command is rejected |
| Period overrun | Counted in `State::bus` | Visible in status (R1) |
| Panic on the cycle thread | Process exits. Device watchdogs take the outputs to their safe state | Connection drops; new boot id after restart |

The third row is a choice: a server nobody can reach is stopped, not left driving outputs. Say so if a machine should keep cycling without its front end.

## Planned tests

Each test states one rule and checks what its user sees: the outcome a client gets, the output image a device receives.

### How the tests run

These are setups, not tests. The first three are named in this proposal (*Summary*, reason 2; step 1).

- **gRPC part:** against a scripted port, with the client on an in-memory connection (`tokio::io::duplex`). No realtime part, bus or socket.
- **Realtime part:** against `SimBus`. No gRPC part and no socket (R9).
- **Port:** the port crate alone.
- **Whole server:** the simulated server with the Python end-to-end tests, over TCP and, on Linux, over a Unix socket (Q2).
- **Platforms:** CI runs the Rust tests on Linux and on Windows, the latter with `SimBus` over TCP (Q3).

### Port

Named in step 2.

| Test | Rule |
| --- | --- |
| A command refused with `Full` never takes effect | Commands channel |
| A slow reader skips periods and never sees a half-written one | State channel |
| A dropped condition is counted in `events_lost` | Events channel |
| The outcome of a popped command is never dropped, however long the reader stalls | Events channel |

### Following from the contract tables

The proposal doesn't name these one by one. Each row of its tables is a rule, and each rule gets a test. This list is Claude's reading of the tables and needs your confirmation.

**gRPC part, against a scripted port**

| Test | Rule |
| --- | --- |
| A client with an incompatible protocol version or fingerprint can't command and can still read | R8; decision of 2026-11-03 |
| A repeated command id takes effect once and gets the recorded outcome | R6 |
| `Applied` reaches the client as OK with the period | Outcome table |
| `Rejected` reaches the client as `FAILED_PRECONDITION` with the reason | Outcome table |
| `Full` reaches the client as `RESOURCE_EXHAUSTED` | Outcome table |
| A passed deadline reports outcome unknown; asking again with the same id returns the outcome once it arrived | Outcome table; R6 |
| A reading that was never fresh is sent as absent, not as a value | R7 |
| A reading's age grows while its device isn't exchanged | R7 |
| A command queued before its client disconnected still takes effect; asking with its command id on a new connection returns its outcome | Failure table |
| `serve` returns an error when the listener fails | Failure table |
| A mismatch report from the port is served, and every command is rejected | Failure table |
| A mailbox request refused with `Full` reaches the client as `RESOURCE_EXHAUSTED` | Mailbox channel |

**Realtime part, against `SimBus`**

| Test | Rule |
| --- | --- |
| A ring that differs from the description stays in PRE-OP, reports all differences together and rejects every command | R2 |
| The rules still run in a period whose exchange failed | R5 |
| After a failed exchange the affected readings aren't fresh and commands to those devices are rejected | Failure table |
| A rule's output wins over a command applied in the same period | Period order |
| A flood of commands doesn't stretch a period; each command is applied in a later period or refused with `Full` | Rules for the cycle thread |
| A missed period is counted in the state | R1 |
| With a stalled reader the cycle keeps its period | Failure table |
| `Applied` is reported only after an exchange the devices acknowledged | Open question 3 |
| A mailbox request to a slow device doesn't delay a period, and no request can write to a device | Mailbox channel |

**Invariant check, not a behaviour test:** the cycle thread doesn't allocate after startup. The behaviour this protects is a period without latency spikes, which a test can't assert reliably, so the constraint itself is checked.

### Covering the safety gaps from the review (2026-11-11)

The review found four gaps and one undefined outcome. Their fixes are not in this proposal's design yet, so these tests describe behaviour that still has to be decided.

| Gap | Test | Runs against |
| --- | --- | --- |
| 1. Interlocked groups | Moving an interlocked pair never puts an output image on the bus with both members active, also when the period's command budget or the queue runs out at that moment | `SimBus` recording every output image |
| 1. Interlocked groups | A group write refused with `Full` or rejected changes none of its members | `SimBus` |
| 2. Device watchdogs | A device whose watchdog or loss-of-communication reaction is off is reported at startup and the ring doesn't reach OP | `SimBus` with such a device |
| 2. Device watchdogs | When the exchange stops, each simulated device model takes its outputs to its safe state within its watchdog time | `SimBus`, cycle thread halted |
| 2. Device watchdogs | Killing the server with outputs on and an axis moving: every output drops and every axis stops within the watchdog time, per device model | The rig. A simulation can't show what the real devices do, the ECOMODUL with `0x6007 = 0` in particular |
| 3. Safe stop | The safe-stop action puts every output at its configured fallback within one period, also when the command queue is full | `SimBus` |
| 3. Safe stop | `cycle.stop()` puts the outputs at their fallback in the last exchange before the thread ends | `SimBus` |
| 3. Safe stop | When the listener fails, the outputs are at their fallback before the process exits | Whole server, `SimBus` |
| 3. Safe stop | A client that disconnects or goes quiet changes no output | Whole server, `SimBus`; GA1 |
| 4. Active faults | A fault raised while the reader was stalled is listed as active in the first state read afterwards, however many events were dropped | `SimBus` with fault injection |
| 4. Active faults | A read of a target with an active fault is never reported as healthy, whatever events were dropped | gRPC part, scripted port |
| Rule override | A command whose write a rule overrides in the same period is reported as rejected with that rule; the output image carries the rule's value and the reading names the rule in `forced_by` | `SimBus` |

## Alternatives considered

| Alternative | What it would give | Why not chosen |
| --- | --- | --- |
| **Two processes**, joined by shared memory or a local socket | A crash or memory fault in the gRPC part can't take down the cycle. The front end can be restarted alone | A second protocol to define, version and test. Two things to deploy and start in order. Crash isolation is nice to have, not required (Q1) |
| **One crate with modules** (today's layout, tidied) | Fewer crates | Nothing stops a handler from reaching into driver state again. The boundary would hold by convention only |
| **A trait the realtime part implements**, for example `async fn set(&self, ..)` called by handlers | Reads like an ordinary service API | Hides the queue. Puts futures, wake-ups and reply allocation on the cycle thread. Can't be logged or scripted |
| **Tokio channels across the boundary** (`mpsc`, `watch`, `oneshot`) | Less code; the pump disappears | Puts tokio in the realtime part. `watch` takes a lock on send and wakes tasks; `oneshot` replies are freed on the cycle thread |
| **State published as `Arc<Snapshot>` per period** | Simple to share among many readers | One allocation per period on the cycle thread, and a free whenever the last reader lets go late |
| **An own `Transport` trait** | Tonic and tokio hidden completely | Duplicates `AsyncRead + AsyncWrite`. Every socket type needs an adapter |
| **Address string or enum in the library** | One line in `main` | Closes the set of transports. Tests need a real socket |
| **Leases and heartbeats in the port** | Fallback when a client vanishes | GA1 rules it out. If it returns, it is a rule in the realtime part fed by a command, not a port feature |

## Open questions

The first two come from this proposal. The rest are open in `generic-api-proposals.md` and shape the port's types.

Answered: what the split is for (2026-11-11, see Q1).

1. **Which sockets are needed in practice?** Unix and TCP, or also others such as TLS or vsock? If access control by Unix peer credentials matters, the transport bound changes.
2. **Should the server stop when its front end fails?** This proposal says yes.
3. **What does "Applied" mean?** This proposal picks: carried by an exchange the devices acknowledged. The alternative is: accepted by the driver.
4. **One commanding client, or several?** Assumed one (A2). Several would add arbitration to the gRPC part; the port doesn't change.
5. **Open or closed set of capabilities?** Decides the shape of `Action` and `Value`.
6. **Mailbox access at runtime:** today's `Diagnostics` reads need it, so the port has a mailbox channel. Still open: keep or drop the `Diagnostics` service, and whether IO-Link ISDU access is needed.
7. **Names:** `ethercat-port`, `ethercat-realtime`, `ethercat-grpc` are placeholders.

## Steps

Each step leaves the server working and the checks passing. Steps 3 and 4 are phase P3 of `generic-polymx-split.md`, now with a defined interface.

1. **Transport.** `grpc_server::run` takes a stream of connections; `main` builds the TCP listener. Small, independent of the rest, and gives in-memory tests at once.
2. **Port crate.** Types and channels, with the port tests in *Planned tests*: full queue, skipped period, dropped condition, and an outcome that is never dropped.
3. **Read path.** The cycle thread publishes `State`; the pump feeds the read handlers, one service at a time.
4. **Command path.** Commands go through the port, one subsystem at a time: digital, analog, axis, sensors. A driver loses its locks when its last direct caller is gone.
5. **Mailbox channel.** The `Diagnostics` service reads through it; handlers no longer hold the `MainDevice`.
6. **Crate split.** Once no handler touches driver state or ethercrab, move the code into the three crates so the compiler holds the boundary.
7. **Protection rules** on the cycle thread (P4).

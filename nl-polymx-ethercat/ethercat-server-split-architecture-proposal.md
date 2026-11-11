# EtherCAT server: split architecture proposal

Nov 10, 2026 · @Chiel Douwes

## Summary

The server becomes two parts in one process, joined by one narrow interface called the **port**.

- **Realtime part** (`ethercat-realtime`): one cycle thread that owns the EtherCAT master, the device drivers and the protection rules. It shares no thread, lock or async runtime with the gRPC part and knows nothing about clients.
- **gRPC part** (`ethercat-grpc`): serves the machine to clients. It owns the handshake, command ids and streams. It accepts connections from anything that implements tokio's `AsyncRead + AsyncWrite`, so TCP, a Unix socket and an in-memory pipe are all the same code path.
- **Port** (`ethercat-port`): three wait-free channels between them. Commands go in through a bounded queue. The latest machine state and a stream of events come out.

The main reasons:

1. The cycle thread can't be delayed by a client. Nothing it does takes a lock, allocates or wakes a task that the gRPC part controls.
2. Each part is tested alone. The gRPC part runs against a scripted port, the realtime part runs with no socket.
3. The port is the only contract. Another front end (ROS 2 bridge, a second process) attaches to it without touching the realtime part.

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
| Q1 | The server is split into a realtime bus part and a gRPC communication part | Requested | From the request (2026-11-10); reason not stated | The two parts and the port |
| Q2 | The gRPC part serves over any socket, expressed through a trait | Requested | From the request (2026-11-10); reason not stated | The `serve` signature |
| R5 / M2 | Protection rules react within one period and keep acting when the device exchange fails | Must | Verified (2026-11-09) | Rules run in the realtime part, never behind the port |
| M5 | The application is a separate process that imports a client package | Must | Verified (2026-11-03) | A network protocol is needed at all |
| GA1 | The server takes no action when a client goes quiet | Won't | Verified (2026-11-09) | No leases or heartbeats in either part |
| R9 | The stack runs in full without hardware | Must | Simulator verified (2026-11-09); "same device code" wording unverified | Simulation sits below the drivers, inside the realtime part |
| R1 | Fixed period per machine; missed periods are visible | Should | Proposed | Overruns are counted in the published state |
| R6 | A command never takes effect twice; an unknown outcome is reported as unknown | Should | Proposed | Command ids and the ledger in the gRPC part |
| R7 | Every value carries its age; absent data is never shown as a value | Should | Proposed | Per-device freshness in the state |
| R8 | A client built against an incompatible version can't change outputs | Should | Proposed | The handshake in the gRPC part |
| A1 | The two parts run in one process | Assumption | Mine; see *Alternatives* | Port is in-memory; a process boundary stays possible |
| A2 | One client commands at a time; any number read | Assumption | Open question 4 in the notes | Arbitration lives in the gRPC part |
| A3 | Linux only | Assumption | Matches today's deployment | Realtime thread setup, Unix sockets |

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
3. **Apply commands**: pop at most a fixed number from the port and hand each to its driver.
4. **Run the protection rules.** They see the decoded inputs and can force outputs or stop axes. They run after the commands, so a rule has the last word, and they run when the exchange failed too.
5. **Encode** the outputs for the next exchange.
6. **Publish** the state and this period's events to the port.

Rules for code on the cycle thread:

- **No lock shared with another thread.** The thread owns all driver, rule and command state outright, so drivers lose their interior locking.
- **No allocation after startup.** Queues, the state buffer and driver state are sized from the machine description.
- **No blocking call except the exchange and the pacer's sleep.**
- **Bounded work per period.** The command limit in step 3 keeps a flood of commands from stretching a period.

Ethercrab is async. Its futures stay on an executor private to the cycle thread, as in today's `Ethercat::run_blocking`. The gRPC part's tokio runtime is a different runtime on different threads.

Thread setup (`SCHED_FIFO`, `mlockall`, a pinned core) is done by `start` from `RealtimeConfig`. Startup work (discovery, the topology check, SDO configuration) runs before the first period. On a ring mismatch the bus stays in PRE-OP, the port still opens, the state carries the mismatch report, and every command is rejected.

A panic on the cycle thread ends the process. The devices' own watchdogs then take the outputs to their safe state.

## The port

The port is the whole contract between the two parts: one fixed description, commands in, state and events out. It lives in its own crate of plain types, with no dependency on ethercrab, tokio or tonic.

```rust
/// The application's end. Exactly one exists; it is not Clone.
pub struct Port {
    pub description: Arc<Description>,
    pub commands: Commands,
    pub updates: Updates,
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
    pub events_lost: u64,     // events dropped because this side fell behind
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
| Events | out | Bounded single-producer, single-consumer ring | The event is dropped and counted in `events_lost` |
| Wake | out | One eventfd write per period | Nothing waits on it; the write is non-blocking |

Every operation on the cycle thread's end is wait-free and allocation-free. That property is the reason for the port's shape.

### Why this shape

- **Commands and events are data, not trait methods.** Enums can be queued, logged, scripted in tests and later sent across a process boundary. An `async fn set_output()` on a trait would put futures and their wake-ups on the cycle thread.
- **Targets are ids, not names.** The front end resolves a name once against `Description`. The cycle thread never compares strings.
- **Outcomes arrive as events, not in a reply slot per command.** A reply slot is an allocation that the cycle thread ends up freeing.
- **State is a latest value, events are a sequence.** A reader wants the current reading but must not miss a command outcome. One channel can't serve both without either unbounded memory or lost outcomes.
- **`wait` blocks; it is not async.** The port then fits any front end. The gRPC part calls it from one dedicated thread.
- **One owner, not `Clone`.** Single-producer rings need it, and it makes fan-out to many handlers an explicit job of the front end, where locks are harmless.
- **Loss is always reported.** A full command queue, a skipped period and a dropped event each have a visible signal. Nothing is retried on its own (R6).

### What the port leaves out

Client identity, protocol versions, command de-duplication and who may command are communication concerns. They live in the gRPC part. Mailbox access at runtime (SDO, IO-Link ISDU) is also left out until open question 6 in the notes is answered. If it is needed, it becomes a fourth channel served outside the cycle.

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

// Unix socket
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
| Deadline passed, or `events_lost` rose while waiting | Outcome unknown; the client can ask again by command id | Unknown |

A read is answered from the latest state. Its age is the time since `State::at` plus the periods since `fresh_at`. A reading with `fresh_at = None` is sent as absent, never as a value (R7).

The service list itself (`Machine`, `Signal`, `Axis`, `Distance`, `Telemetry`) is the one in `layered-refactor.md` without `Session`, which GA1 removes. This proposal doesn't change it.

## Crates

Three library crates and one binary per machine. The compiler enforces the split, because neither part can name the other.

| Crate | Holds | Depends on | Must not depend on |
| --- | --- | --- | --- |
| `ethercat-port` | `Port`, `Description`, `Command`, `State`, `Event`, the three channels | A ring buffer and a triple buffer crate | ethercrab, tokio, tonic |
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
| gRPC part stalls or its handlers panic | Keeps cycling. Rules keep running. State is overwritten, events are dropped and counted | On recovery, the pump sees `events_lost` and marks pending commands as outcome unknown |
| Listener fails, `serve` returns an error | The binary stops the cycle thread in order and exits | The process supervisor restarts the server; clients see a new boot id |
| More commands than the queue holds | Unaffected | `RESOURCE_EXHAUSTED`; the command didn't take effect |
| Device exchange fails | Rules still run. Affected readings stop being fresh | Reads report growing age, then absent. Commands to those devices are rejected |
| Ring doesn't match the description | Stays in PRE-OP. Publishes the full mismatch report | Serves the report. Every command is rejected |
| Period overrun | Counted in `State::bus` | Visible in status (R1) |
| Panic on the cycle thread | Process exits. Device watchdogs take the outputs to their safe state | Connection drops; new boot id after restart |

The third row is a choice: a server nobody can reach is stopped, not left driving outputs. Say so if a machine should keep cycling without its front end.

## Alternatives considered

| Alternative | What it would give | Why not chosen |
| --- | --- | --- |
| **Two processes**, joined by shared memory or a local socket | A crash or memory fault in the gRPC part can't take down the cycle. The front end can be restarted alone | A second protocol to define, version and test. Two things to deploy and start in order. The port keeps this open: its types are plain data, so a process bridge can be added behind the same `Port` without changing either part |
| **One crate with modules** (today's layout, tidied) | Fewer crates | Nothing stops a handler from reaching into driver state again. The boundary would hold by convention only |
| **A trait the realtime part implements**, for example `async fn set(&self, ..)` called by handlers | Reads like an ordinary service API | Hides the queue. Puts futures, wake-ups and reply allocation on the cycle thread. Can't be logged or sent across a process boundary |
| **Tokio channels across the boundary** (`mpsc`, `watch`, `oneshot`) | Less code; the pump disappears | Puts tokio in the realtime part. `watch` takes a lock on send and wakes tasks; `oneshot` replies are freed on the cycle thread |
| **State published as `Arc<Snapshot>` per period** | Simple to share among many readers | One allocation per period on the cycle thread, and a free whenever the last reader lets go late |
| **An own `Transport` trait** | Tonic and tokio hidden completely | Duplicates `AsyncRead + AsyncWrite`. Every socket type needs an adapter |
| **Address string or enum in the library** | One line in `main` | Closes the set of transports. Tests need a real socket |
| **Leases and heartbeats in the port** | Fallback when a client vanishes | GA1 rules it out. If it returns, it is a rule in the realtime part fed by a command, not a port feature |

## Open questions

The first three come from this proposal. The rest are open in `generic-api-proposals.md` and shape the port's types.

1. **What is the split for?** Timing isolation, crash isolation, testing, or other front ends later? Crash isolation would argue for two processes (A1).
2. **Which sockets are needed in practice?** Unix and TCP, or also others such as TLS or vsock? If access control by Unix peer credentials matters, the transport bound changes.
3. **Should the server stop when its front end fails?** This proposal says yes.
4. **What does "Applied" mean?** This proposal picks: carried by an exchange the devices acknowledged. The alternative is: accepted by the driver.
5. **One commanding client, or several?** Assumed one (A2). Several would add arbitration to the gRPC part; the port doesn't change.
6. **Open or closed set of capabilities?** Decides the shape of `Action` and `Value`.
7. **Mailbox access at runtime?** Decides whether the port gets a fourth channel.
8. **Names:** `ethercat-port`, `ethercat-realtime`, `ethercat-grpc` are placeholders.

## Steps

Each step leaves the server working and the checks passing. Steps 3 and 4 are phase P3 of `generic-polymx-split.md`, now with a defined interface.

1. **Transport.** `grpc_server::run` takes a stream of connections; `main` builds the TCP listener. Small, independent of the rest, and gives in-memory tests at once.
2. **Port crate.** Types and channels, with tests for the three loss signals: full queue, skipped period, dropped event.
3. **Read path.** The cycle thread publishes `State`; the pump feeds the read handlers, one service at a time.
4. **Command path.** Commands go through the port, one subsystem at a time: digital, analog, axis, sensors. A driver loses its locks when its last direct caller is gone.
5. **Crate split.** Once no handler touches driver state, move the code into the three crates so the compiler holds the boundary.
6. **Protection rules** on the cycle thread (P4).

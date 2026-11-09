# Generic EtherCAT server: problem statement

**Status (2026-11-09): draft.** Based on the generic-core requirements (GC/GN/GA) agreed in conversation on
2026-11-09. They are not yet in `generic-polymx-split.md`; several are still unverified (see the table).

## Problem statement

A machine built from EtherCAT devices needs a server that runs its ring every cycle, lets a separate client read and
command the devices by configured name, and applies the machine's protection rules within that cycle. Today such a
server exists only fused with PolyMX. The generic part must provide it for any machine, with each machine supplying
only configuration and guards, and it must run in full against a simulator.

## Out of scope

- **Personnel safety.** That is the wiring's job (e-stop, STO); guards provide machine and process protection only
  (GN1).
- **Silent clients.** The server takes no action when a client goes quiet; the orchestrator monitors client liveness
  (GA1).

## Requirements behind each phrase

| Phrase | Requirements | Verified |
|---|---|---|
| runs its ring every cycle | GC1 cyclic exchange, GC2 topology check, GN2 one master per NIC | no |
| a separate client … by configured name | GC4 name-addressed API, GC9 version handshake, M5 | GC4, GC9 no; M5 yes |
| read and command | GC7 at most once, no replay; GC8 readings carry their age | no |
| protection rules within that cycle | GC6 guards are the only protection, run every tick; M2, M3 | yes |
| any machine … only configuration and guards | GC3 config-described machine, drivers per model; M1 | GC3 no; M1 yes |
| run in full against a simulator | GC10 simulator | yes |

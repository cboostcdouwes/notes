# Design decisions

> **Note:** these decisions may override earlier choices in the project. Where a decision here conflicts with the
> repo's code, docs or other notes, this file wins.

Design decisions made by Chiel for `nl-polymx-ethercat`, starting 2026-11-03. Newest at the bottom.

Each entry says what was decided, why, and what it rules out. A decision that is later reversed stays in the list; the
new entry names the one it replaces.

<!-- Entry template:

## YYYY-MM-DD: <decision in one line>

- **Decision:** what was chosen.
- **Why:** the reason, in Chiel's words where possible.
- **Rules out:** the options that were rejected, and why.
- **Replaces:** an earlier entry, if any.
- **Context:** where it was discussed (vault note, PR, issue).
-->

## 2026-11-03: Split the library into a generic part and a PolyMX part

- **Decision:** the library becomes a generic part, reusable for other machines, and a PolyMX part that holds all
  PolyMX knowledge.
- **Why:** other machines are to reuse the generic part.
- **Context:** `generic-polymx-split.md`, requirement M1.

## 2026-11-03: Machine guards run inside the server and react within one bus cycle

- **Decision:** PolyMX machine guards run in the server process as business logic and can react within one bus cycle.
- **Why:** the guards need cycle-time reaction.
- **Rules out:** guards in a client. A client reacts at gRPC plus Python scheduling latency (12–20 ms reply gaps,
  560 ms worst scheduling gap measured), against a 10 ms cycle.
- **Context:** `generic-polymx-split.md`, requirement M2.

## 2026-11-03: The guard mechanism is generic

- **Decision:** a machine supplies its guards as an extension of the generic server.
- **Why:** so other machines can reuse the mechanism.
- **Context:** `generic-polymx-split.md`, requirement M3.

## 2026-11-03: Split inside this repo first, prepared for separate repos

- **Decision:** the split is done inside this repo first, laid out so that each part (generic, polymx, …) can move to
  its own repo later without restructuring.
- **Why:** the parts will become separate repos eventually.
- **Context:** `generic-polymx-split.md`, requirement M4.

## 2026-11-03: The QC app imports the PolyMX client; the server is a separate process

- **Decision:** the QC application imports the PolyMX EtherCAT client package, and the server runs as a separate
  process.
- **Why:** that is how the QC app is built.
- **Context:** `generic-polymx-split.md`, requirement M5.

## 2026-11-03: Client and server are versioned in lockstep, per part; the protocol is versioned separately

- **Decision:** within each part, the client and the server always carry the same version. The generic part and the
  machine-specific part (PolyMX) are versioned separately from each other. The protocol version (`API_VERSION`) may
  drift from the client/server version.
- **Rules out:** one version across the generic and machine-specific parts, which would force a release of one part
  for every release of the other, also once they live in separate repos.
- **Context:** discussed in a Claude session; follows from the split (M1, M4).

## 2026-11-03: The protocol version's semver decides write access; reads stay open

- **Decision:** a client may make control calls (writes) only when its protocol version is semver-compatible with
  the server's. Reads are open to every client, whatever its protocol version.
- **Rules out:** a separate version window for reads (refusing reads outside, for example, the same major), which
  would cut off read-only tools on a major mismatch. Protobuf already tolerates added fields for reads.
- **Context:** discussed in a Claude session; matches the current check in `server/lib/src/api.rs`.

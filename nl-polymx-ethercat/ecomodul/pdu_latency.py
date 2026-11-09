"""Reply latency of EtherCAT frames in a pcap: pairs each request with the reply carrying the
same first-PDU index, per run (runs split on gaps > 0.3 s). Usage: python3 -I pdu_latency.py file.pcap
"""

import struct
import sys
from collections import Counter


def frames(path):
    with open(path, "rb") as f:
        header = f.read(24)
        magic = struct.unpack("<I", header[:4])[0]
        scale = {0xA1B23C4D: 1e-9, 0xA1B2C3D4: 1e-6}[magic]
        while record := f.read(16):
            sec, frac, captured, _ = struct.unpack("<IIII", record)
            yield sec + frac * scale, f.read(captured)


def main():
    runs, current, last = [], [], None
    for ts, data in frames(sys.argv[1]):
        if len(data) < 18 or data[12:14] != b"\x88\xa4":
            continue
        if last is not None and ts - last > 0.3:
            runs.append(current)
            current = []
        last = ts
        src, command, index = data[6:12], data[16], data[17]
        current.append((ts, src, command, index))
    runs.append(current)

    for number, run in enumerate(runs, 1):
        sources = Counter(src.hex(":") for _, src, _, _ in run)
        master = run[0][1]
        pending, latencies, orphans, duplicates_out = {}, [], [], 0
        for ts, src, command, index in run:
            if src == master:
                if index in pending:
                    duplicates_out += 1
                pending[index] = (ts, command)
            elif index in pending:
                sent, sent_command = pending.pop(index)
                latencies.append((ts - sent, index, sent_command, command, sent - run[0][0]))
            else:
                orphans.append((ts - run[0][0], index, command))
        latencies.sort()
        worst = latencies[-3:]
        print(f"run {number}: {len(run)} frames over {run[-1][0] - run[0][0]:.2f} s, sources {dict(sources)}")
        if latencies:
            median = latencies[len(latencies) // 2][0]
            print(f"  replies {len(latencies)}, median {median * 1e6:.0f} us, "
                  f">1 ms: {sum(l[0] > 1e-3 for l in latencies)}, >30 ms: {sum(l[0] > 30e-3 for l in latencies)}")
            for latency, index, sent_command, command, at in worst:
                print(f"  slow: {latency * 1e3:.3f} ms, pdu {index:#04x}, cmd {sent_command}->{command}, at +{at:.3f} s")
        print(f"  unanswered {len(pending)}, replies with no request {len(orphans)}, index reused before reply {duplicates_out}")
        for at, index, command in orphans[:3]:
            print(f"  orphan reply at +{at:.3f} s, pdu {index:#04x}, cmd {command}")


if __name__ == "__main__":
    main()

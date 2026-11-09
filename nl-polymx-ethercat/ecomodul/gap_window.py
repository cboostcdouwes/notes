"""Print every EtherCAT frame from 2 ms before to 2 ms after each request whose reply took > 30 ms."""
import struct, sys, datetime
def frames(path):
    with open(path, "rb") as f:
        f.read(24)
        while r := f.read(16):
            s, ns, n, _ = struct.unpack("<IIII", r); yield s + ns * 1e-9, f.read(n)
fs = [(t, d[6:12], d[16], d[17]) for t, d in frames(sys.argv[1]) if d[12:14] == b"\x88\xa4"]
master = fs[0][1]
pending = {}
slow = []
for i, (t, src, cmd, idx) in enumerate(fs):
    if src == master: pending[idx] = (t, i)
    elif idx in pending:
        t0, i0 = pending.pop(idx)
        if t - t0 > 0.03: slow.append((i0, i))
for i0, i1 in slow:
    t0 = fs[i0][0]
    print(f"== request at {datetime.datetime.fromtimestamp(t0).strftime('%H:%M:%S.%f')}, reply {1e3*(fs[i1][0]-t0):.1f} ms later")
    window = [f for f in fs if t0 - 0.002 <= f[0] <= fs[i1][0] + 0.002]
    for t, src, cmd, idx in window:
        print(f"  {1e3*(t-t0):9.3f} ms  {'out' if src == master else 'in '}  cmd {cmd:2}  pdu {idx:#04x}")
    after = [f for f in fs if f[0] > fs[i1][0] + 0.002][:1]
    if after: print(f"  next frame {1e3*(after[0][0]-fs[i1][0]):.1f} ms after the slow reply")

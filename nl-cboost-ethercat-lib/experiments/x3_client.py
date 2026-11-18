"""X3: a Python client against the --sim server; round-trip times of Write and Read."""
import statistics, sys, time
import grpc
import ethercat_pb2 as pb
import ethercat_pb2_grpc as rpc

target, api = sys.argv[1], sys.argv[2]
stub = rpc.MachineStub(grpc.insecure_channel(target))
d = stub.Describe(pb.DescribeRequest())
hello = stub.Hello(pb.HelloRequest(client_id="py", api_version=api, fingerprint=d.fingerprint))
assert hello.may_write, hello.reason

def timed(call, n):
    out = []
    for i in range(n):
        t = time.perf_counter(); call(i); out.append((time.perf_counter() - t) * 1000)
    out.sort()
    return f"p50 {statistics.median(out):6.2f} ms  p99 {out[int(len(out)*0.99)]:6.2f}  max {out[-1]:6.2f}"

print(f"{d.machine} period {d.period_us} us on {target}")
print("  Write  ", timed(lambda i: stub.Write(pb.WriteRequest(client_id="py", command_id=i + 1, name="Lamp", digital=i % 2 == 0)), 300))
print("  Read   ", timed(lambda i: stub.Read(pb.ReadRequest(names=["Lamp"])), 300))
# Absent and rejected, as a Python caller sees them.
r = stub.Read(pb.ReadRequest(names=["StartButton"])).readings[0]
print("  StartButton has value:", r.HasField("digital"), "age_ms:", round(r.age_ms, 2))
try:
    stub.Write(pb.WriteRequest(client_id="py", command_id=10_000, name="Open", digital=True))
    stub.Write(pb.WriteRequest(client_id="py", command_id=10_001, name="Close", digital=True))
except grpc.RpcError as e:
    print("  rejected:", e.code().name, dict(e.trailing_metadata()))

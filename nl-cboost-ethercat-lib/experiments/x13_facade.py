"""X13: a machine client built from Describe at connect time: names become attributes, nothing is generated."""
import itertools, grpc
import ethercat_pb2 as pb, ethercat_pb2_grpc as rpc


class MissingNames(Exception):
    pass


class Machine:
    def __init__(self, target, api_version, client_id, requires=()):
        object.__setattr__(self, "_stub", rpc.MachineStub(grpc.insecure_channel(target)))
        d = self._stub.Describe(pb.DescribeRequest())
        kinds = {t.name: pb.Kind.Name(t.kind) for t in d.targets}
        wrong = [f"{n} (wanted {k}, server has {kinds.get(n, 'nothing')})" for n, k in requires if kinds.get(n) != k]
        if wrong:  # every problem at once, as the topology check does
            raise MissingNames("; ".join(wrong))
        hello = self._stub.Hello(pb.HelloRequest(client_id=client_id, api_version=api_version, fingerprint=d.fingerprint))
        if not hello.may_write:
            raise PermissionError(hello.reason)
        for k, v in dict(_kinds=kinds, _client=client_id, _ids=itertools.count(1), boot_id=hello.boot_id).items():
            object.__setattr__(self, k, v)

    def __getattr__(self, name):
        if name not in self._kinds:
            raise AttributeError(name)
        r = self._stub.Read(pb.ReadRequest(names=[name])).readings[0]
        field = r.WhichOneof("value")
        if field is None:
            raise LookupError(f"{name} has never been read")  # absent is never a value
        return getattr(r, field)

    def __setattr__(self, name, value):
        if name not in self._kinds:
            raise AttributeError(name)
        kind = {bool: "digital", int: "analog"}[type(value)]
        return self._stub.Write(pb.WriteRequest(client_id=self._client, command_id=next(self._ids), name=name, **{kind: value})).period


if __name__ == "__main__":
    import sys
    try:
        Machine(sys.argv[1], sys.argv[2], "qc", requires=[("Lamp", "DIGITAL_OUT"), ("Sled", "AXIS"), ("ClampClosed", "DIGITAL_OUT")])
    except MissingNames as e:
        print("refused at connect:", e)
    m = Machine(sys.argv[1], sys.argv[2], "qc", requires=[("Lamp", "DIGITAL_OUT"), ("ClampClosed", "DIGITAL_IN")])
    print("Lamp =", m.Lamp)
    m.Lamp = True
    print("Lamp =", m.Lamp, "| ClampClosed =", m.ClampClosed)
    m.Light = 16000
    try:
        m.Open = True; m.Close = True
    except grpc.RpcError as e:
        print("refused:", e.details())

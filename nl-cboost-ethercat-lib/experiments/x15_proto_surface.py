"""X15: the wire surface of a proto file as sorted lines; a change to an existing line is a breaking change."""
import subprocess, sys, tempfile, os
from google.protobuf import descriptor_pb2

proto_dir, proto = sys.argv[1], sys.argv[2]
with tempfile.TemporaryDirectory() as tmp:
    out = os.path.join(tmp, "set.pb")
    subprocess.run(["protoc", f"-I{proto_dir}", f"--descriptor_set_out={out}", proto], check=True)
    files = descriptor_pb2.FileDescriptorSet.FromString(open(out, "rb").read())
T = descriptor_pb2.FieldDescriptorProto
lines = []
for f in files.file:
    for m in f.message_type:
        for fld in m.field:
            oneof = f" oneof {m.oneof_decl[fld.oneof_index].name}" if fld.HasField("oneof_index") and not fld.proto3_optional else ""
            lines.append(f"message {f.package}.{m.name} field {fld.number} {fld.name} {T.Type.Name(fld.type)} {T.Label.Name(fld.label)}{oneof}")
    for e in f.enum_type:
        lines += [f"enum {f.package}.{e.name} {v.number} {v.name}" for v in e.value]
    for s in f.service:
        lines += [f"rpc {f.package}.{s.name}.{r.name} {r.input_type} -> {'stream ' if r.server_streaming else ''}{r.output_type}" for r in s.method]
print("\n".join(sorted(lines)))

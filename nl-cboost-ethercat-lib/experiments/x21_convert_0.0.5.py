"""X21: a 0.0.5 machine file to the prototype's format, listing everything that can't be carried over."""
import sys, tomllib

old = tomllib.load(open(sys.argv[1], "rb"))
supported = {"EK1100", "EL1008", "EL1084", "EL2008", "EL4002"}
lost, out = [], [f'machine = "{old["machine"]}-generic"', "period_us = 10000", ""]
devices = {d["index"]: d for d in old.get("subdevice", [])}
last = max(devices)
for pos in range(0, last + 1):
    d = devices.get(pos, {"model": "EK1100"} if pos == 0 else None)
    if d is None:
        lost.append(f"position {pos}: not declared in the old file"); continue
    model = d["model"]
    if model not in supported:
        lost.append(f"position {pos}: model {model} has no driver yet (kept as EL1084 placeholder? no: ring would mismatch)")
    extra = sorted(set(d) - {"index", "model"})
    if extra:
        lost.append(f"position {pos} {model}: fields {extra} have no equivalent")
    out += ["[[device]]", f"position = {pos}", f'model = "{model}"', ""]
for section in ("input", "output", "analog"):
    for name, s in old.get(section, {}).items():
        if devices.get(s["device"], {}).get("model") not in supported:
            lost.append(f"{section}.{name}: its device {s['device']} is unsupported"); continue
        keep = {k: v for k, v in s.items() if k in ("device", "channel", "group") or (k == "active_low" and section == "input")}
        dropped = sorted(set(s) - set(keep))
        if dropped:
            lost.append(f"{section}.{name}: {', '.join(f'{k} = {s[k]!r}' for k in dropped)} dropped")
        out.append(f"[{section}.{name}]")
        out += [f"{k} = {v!r}".replace("'", '"').replace("True", "true").replace("False", "false") for k, v in keep.items()]
        out.append("")
for i, lock in enumerate(old.get("interlock", [])):
    out += [f"[rule.Interlock{i + 1}]", f'kind = "{lock["kind"]}"', "members = [" + ", ".join(f'"{m}"' for m in lock["members"]) + "]", ""]
for key in ("axis", "health"):
    if key in old:
        lost.append(f"[{key}] {old[key]} has no equivalent")
open(sys.argv[2], "w").write("\n".join(out))
print(f"{len(lost)} item(s) not carried over:")
for line in lost:
    print("  -", line)

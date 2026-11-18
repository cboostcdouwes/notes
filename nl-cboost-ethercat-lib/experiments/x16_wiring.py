"""X16: a wiring table per terminal channel from a machine file, for the cabinet."""
import sys, tomllib

m = tomllib.load(open(sys.argv[1], "rb"))
models = {d["position"]: d["model"] for d in m.get("device", [])}
uses = {}
for rule, table in m.get("rule", {}).items():
    names = table.get("members", []) + table.get("refuse", []) + list(table.get("require", {})) + [v for k, v in table.items() if k in ("valve", "reached", "output", "input")]
    for name in names:
        uses.setdefault(name, []).append(rule)
rows = []
for section, direction in (("input", "in"), ("output", "out"), ("analog", "analog out")):
    for name, s in m.get(section, {}).items():
        polarity = "active low" if s.get("active_low") else ""
        rows.append((s["device"], s["channel"], name, direction, polarity, ", ".join(sorted(set(uses.get(name, []))))))
print(f"# Wiring of `{m['machine']}`\n\n| Position | Terminal | Channel | Signal | Direction | Polarity | Rules |\n| --- | --- | --- | --- | --- | --- | --- |")
for pos, ch, name, direction, pol, rules in sorted(rows):
    print(f"| {pos} | {models.get(pos, '?')} | {ch} | {name} | {direction} | {pol} | {rules} |")
unused = [p for p in models if p not in {r[0] for r in rows}]
print(f"\nPositions without signals: {', '.join(f'{p} ({models[p]})' for p in unused) or 'none'}")

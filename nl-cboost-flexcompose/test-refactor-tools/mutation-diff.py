# Compares two gremlins JSON reports (gremlins unleash -o <file>.json) of the same production code with
# different tests, and prints every mutant the first report killed and the second did not.
# Usage: python3 mutation-diff.py old.json new.json
import json, sys

def load(path):
    out = {}
    for f in json.load(open(path))["files"]:
        for m in f["mutations"]:
            out[(f["file_name"], m["line"], m["column"], m["type"])] = m["status"]
    return out

old, new = load(sys.argv[1]), load(sys.argv[2])
for k in sorted(old):
    if old[k] == "KILLED" and new.get(k) != "KILLED":
        print(*k, old[k], "->", new.get(k))

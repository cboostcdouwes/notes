# What a run records: rounds

## Problem formulation (2026-11-22)
Read: `gcsl.py` (the training loop and save point), the results folders and their sizes, the notes `TODO.md`, the
project `CLAUDE.md`, the parent log's round 1 and its bias check.

The user's answers:
- What has cost them something: "Unclear what made it", "Could not find a run". Not: "A result was lost".
- What counts as a run: method runs in the maze, probes and try-outs, human baseline sessions. Not: other
  experiments.
- What a stored run is for besides looking and comparing: "Make it again", "Continue it", "Use it as evidence".
- How long a run stays examinable: "Depends on the run".
- Limits: disk space and run time, no amounts.
- No version control: "Not deliberate".
- First write-back, corrected: "Large run outputs should be in a cache folder, the runs should have enough
  information to be able to rerun them with approximately the same results, so information like checkpoints can be
  recreated."
- How alike a run made again has to be: "The same conclusions".
- Why large outputs apart: "Deleting would be risky", "They would get versioned or backed up". Not: "They would
  fill the project".
- Pictures, remarks and continued runs resting on networks made again: "Acceptable everywhere".
- Second write-back: "Yes, confirmed".

A note on the tooling: while the parent log is open, the question gate (`round-gate.py`) holds a child log's
problem-formulation questions to the parent's checklist, because it only looks at logs that have a *Rounds*
section. The parent log was updated with what each answer means for it, which the gate accepted.

## Round 1
Discovery: four generators, each given only the brief (`what-a-run-records.discovery/brief.md`): F the field blind
to the project, G other kinds of engineering, H fields far from engineering, J the field with the project's code.

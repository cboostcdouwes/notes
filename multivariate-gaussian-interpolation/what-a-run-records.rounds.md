# What a run records: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| R18 | A run's large outputs (such as its stored networks) can be deleted at any time without losing anything that lasts: they are made again from the lasting record. Pictures, remarks and continued runs may rest on outputs that were made again | "Deleting would be risky" otherwise; the project has lost results to a delete before (2026-11-21) | user, 2026-11-22 ("Acceptable everywhere") | R18b (round 1) |
| R19 | Large outputs stay out of version control, snapshots and backups; the lasting record is small enough to be in them | "They would get versioned or backed up" | user, 2026-11-22 | R19b and R21 (round 1) |
| R5 | What the agent experienced during a run can be examined afterwards | "What data it saw" cannot be answered | parent R4b (user, 2026-11-22) | R5b and R22 (round 1) |
| R15 | Stored runs respect a limit on disk space | The user named it as a limit; amount not set | user, 2026-11-22 | R15b (round 1) |
| R17 | Runs worth keeping can be told apart from throwaway ones, and only the first are kept for long | "Depends on the run"; keeping everything meets the disk limit sooner | user, 2026-11-22 | R17b (round 1) |
| R20 | The assistant and its tools do not write to version-control history; the user reviews and commits every change | The user's standing rule for every repository; it would apply here from the day the project becomes one. Whether it also covers records a tool commits per run was not asked | user's global instructions ("Never commit, amend, stash, push or otherwise write to git history") | R20b (round 1) |
| R23 | The record works without a repository and uses one when it exists | Version control: "Yes, but later"; the run record is not to wait for it | user, round 1 | R23b (after round 1, the user's correction) |

## Dropped requirements
| # | Requirement | Why it isn't one (user's reason) | Source | Round |
|---|---|---|---|---|
| R20b | Nothing but the user writes to the code's history. Run records may be written to version control automatically, apart from the code | "The project will still use large changes, as the version control will not be manually managed; autonomous commits are okay in this repository, they will not be reviewed." The global rule does not apply to this repository | user, 2026-11-22 | start of round 2 |

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

The four reports are in `what-a-run-records.discovery/`. Draft and measurements: `spike.py` and its logs in the
session's scratch folder. Checks: a bias check and a rejection check by fresh subagents on the log's extracts.

What was learned: the options differ on six parts, and most cover one; a design is one choice per part. A recorded
run is not measurably slower; the lasting record is 12 KB and the large outputs 138 MB at one model; a remake with
unchanged code ended at 0.0165 against 0.0187; continuing from the stored learner works. After the checks, O11
leads with O12 (the same on a tracker) a near-tie, J2's naming rule and G7's journal level, and F4 and O13 behind
on R20, which is not checked.

Searches: the generators' web searches are listed in their reports (F: experiment tracking, provenance capture,
signac, DataLad, DVC, Minari, XLA determinism, rliable; G: Nix and Guix, climate-model suites, batch records,
BagIt, game replays, run registries, bookkeeping journals, DataLad; H: museum accession, particle-physics run
lists, chess scoresheets, conservation of instruction-based art, batch records, audit working papers, allocation
concealment, trail decay). The assistant ran no web search of its own this round; tool licences, versions and
Python 3.14 support are from the generators and partly from memory, marked unverified in *Sources*.

Round 1's answers (2026-11-22): tool-written run records "Yes, apart from the code"; musts: "Tells what made it",
"Remake, safe delete" (not ticked: "Find and refer", "A repeat never replaces"); store: "Own plain files"; the
experience: "Disposable, but separate from the large outputs", for "Delete them independently" and "Keep it
longer"; the ID: "Datetime, but also an experiment name", the name being "A free label"; the same conclusions:
"I judge by eye"; disk: "No fixed number"; keeping: "Records may go too"; version control: "Yes, but later".

Correction by the user after round 1 (2026-11-22): "git will be added before implementation", replacing the answer "Yes, but later" as I had read it (the record working without a repository).

## Round 2
Start (2026-11-22), the user: "Start round 2, skip the btrfs volume test. The project will still use large changes,
as the version control will not be manually managed; autonomous commits are okay in this repository, they will not
be reviewed."

# Run 2026-10-25: recumbent luggage rack

Benchmark: `../../README.md`. Skill version: Notes commit `fd1de14`. Answerer: the user (the benchmark's first run,
which built the ground truth; the user volunteered several facts in remarks).

## Score
| Measure | Result |
|---|---|
| Match | Yes, short term (O31), reviewed by the user in round 15 |
| Points | 0 of 2: no long-term tailbox, no U-tube reuse |
| First appears / first leads (log rounds) | Round 10 / round 10; loses the lead in rounds 11-12, leads again from 13 |
| Before it first leads | 8 question calls, 29 questions |
| Total | 15 log rounds, 13 question calls, two independent checks per round |

## Ground truth by question call
The call (numbered section of `replay.md`) in which each fact first came out; "remark" means the user volunteered it.

| Fact | Call |
|---|---|
| G1 | 1 (remark) |
| G2 | 2 |
| G3, G4 | from the manual, before call 2; G4 confirmed in call 6 |
| G5 | 7 |
| G6 | 8 ("Other"); the tailbox part never |
| G7 | 9-10 |
| G8 | 13, answered "it just tilts"; corrected by the user after the run |
| G9 | 9 |
| G10 | 10-11 |
| G11 | 11 |
| G12 | 2 (remark) |
| G13 | 3, only as "fixed to a frame tube" |
| G14 | 3 |
| G15 | 6-7; "no struts of its own" never |
| G16 | never |
| G17 | 1 and 5 |
| G18 | 5-6 |
| G19 | 10 and 12 |
| G20 | 2 |
| G21 | 1 |
| G22 | 4 and 8 |
| G23 | 11 (remark) |
| G24 | 11 (remark) and 12 |
| G25 | never |

## Findings
The decision (O31 in the log): the owned sound rack wholly on the rigid rear fork, lower legs on the mudguard lugs,
one upper strut per side clamped to the round rear fork tubes, nothing on the seat.

Path of the leader, by log round: maker's rack on designed mounts (1-2) → keep the current mount (3) → maker's seat points
(4) → axle-mounted rack (5) → rack on the lugs + seat fixture (6-9) → wholly on the rear fork with clamps (10) → tie
with the seat fixture (11) → bolted to the rear fork bridge (12) → clamps on the rear fork tubes (13-15).

| Measure | Result |
|---|---|
| U-tube reuse (G16) | Not found: the run assumed the new rack's own struts plus bought clamps; no one asked what the old rack is made of |
| Tailbox (O8) | Listed from round 1, trailing throughout; last rejected on R1 volume (laptop fit never asked) and on the seat's flex (R11) |
| Wrong rejection | O8 on R11: R11 covers rack anchors that must not move relative to each other, not a box hung only on the seat (G6); missed by every rejection check |
| Short and long term | Not given: the skill settles on one decision and never asks whether the best answer differs by horizon |
| Found only through the user's own remarks or "Other" answers, not by a question aimed at them | G1 (call 1), G12 (call 2), G6 (call 8), G24 (call 11); G16 and G25 never surfaced; G14 was asked only in call 3 |
| Errors in the run | Rear suspension inferred from the manual (rounds 1-2, wrong per G2); 6 Nm limit put on the wrong bolts (rounds 2-3); the seat-fixture options (O29 and others) rejected on R12 "needs refitting after a seat-angle change", the researcher's inference, wrong per G8 (the bolts are fixed, only the seat bracket slides). The verdict was right for the wrong reason: the true reason is G5 (too far forward for a stable strut), which the user gave in call 7 but the run applied only to the mid bolts. No check caught it; the run never asked how the seat is fixed to the frame |

## Replay targets
1. Ask early what the user has now and what is wrong with it.
2. Ask what the current setup's parts are made of and which can be reused (G13, G16).
3. Score options per time horizon (now vs long term) when the user's constraints are about what is at hand.
4. Keep each rejection within its requirement's wording (O8 on R11), and ask how a part moves before rejecting on
   it (O29 on R12; the true reason was G5).
5. Ask what else the user values beyond the stated load (G25).

## Files
- `replay.md`: every question and answer, verbatim, in order.
- `recumbent-luggage-carrying.md`: the research log.
- `recumbent-luggage-carrying.rounds.md`: the per-round entries, check findings and searches.
- `draft-*.md`: the leader's draft in each round it changed.

# Benchmark: recumbent luggage rack

A test run of the design-research skill on a non-software problem whose answer the user knows but does not reveal.
The user gives no hints; they only answer the skill's questions. Use it to replay the run against an improved skill
and compare in which round (if any) the expected answer leads.

## Prompt (verbatim)
> I have a recumbent bike, and I'd like to attach a luggage rack to it. What is the best way to attach it?

Run started 2026-10-25, skill version at Notes commit `fd1de14`.

## Outcome of the run (2026-10-25)
Decision after 15 rounds (13 question calls): the user's own sound rack wholly on the rigid rear fork: lower legs on
the mudguard lugs above the dropouts, one upper strut per side clamped to the round rear fork tubes, nothing on the
seat (O31). Reviewed by the user.

Path of the leader: maker's rack on designed mounts (rounds 1-2) → keep the current mount (3) → maker's seat points
(4) → axle-mounted rack (5) → rack on the lugs + seat fixture (6-9) → wholly on the rear fork with clamps (10) →
tie with the seat fixture (11) → bolted to the rear fork bridge (12) → clamps on the rear fork tubes (13-15).
O31 first appeared as an option in round 10, when the user named the rear fork tubes; the requirement that drove it
(the seat flexes, R11) was never asked for directly; it came out in an "Other" answer to the top-anchor question.

Requirements the run found only late, from the user's own remarks or "Other" answers: the rack exists and holds (3),
it sways and is badly made (4), the seat flexes (10), a single top bolt is unstable sideways (13-14), the seat angle
is re-adjusted (12).

## Expected answer
Revealed by the user after the run (2026-10-25).

- **Correct:** the new rack mounted on the mudguard lugs, with struts to the rear fork's tubes (= O31).
- **Detail of the real build:** the old rack's top is a tube bent into a U, sliding into a separate frame that is
  clamped to the rear fork's tubes. The new rack has no struts of its own, so its struts are made from the old rack's
  tube. The run never found this reuse: it assumed the new rack's own struts plus bought clamps.
- **Also accepted:** in the long term, a tailbox (as long as it fits a laptop).
- **Extra points:** both answers together, the rack now (as decided) and a tailbox in the long term.

## Score of this run (skill at Notes commit `fd1de14`)
| Measure | Result |
|---|---|
| Expected answer (O31) first appears as an option | Round 10, after 8 question calls (29 questions) |
| First leads | Round 10; loses the lead in rounds 11-12 (tie with the seat fixture, then the bridge bolt); leads again from round 13 |
| Final decision | Correct (O31), reviewed by the user in round 15 |
| Reuse of the old rack's U-tube and clamped frame as struts | Not found; the bias check named "bought adjustable stays" but no one asked what the old rack is made of |
| Tailbox (O8) | Listed from round 1; trailing throughout, last on "R1 volume" (laptop fit never asked) and "the seat shell flexes (R11)" |
| Wrong rejection | O8's final rejection cites R11, which as worded covers rack anchors, not a seat-mounted box: stretched, and missed by the rejection checks |
| Short-term + long-term answer (extra points) | Not given: the skill picks one decision; it has no step that asks whether the best answer differs by horizon |

What a better run would have done, as replay targets:
1. Ask early what the user has now and what is wrong with it (rounds 3-4 brought both only by chance).
2. Ask what the current setup's parts are made of and which can be reused (would have found the U-tube struts).
3. Score options per time horizon (now vs long term) when the user's constraints are about what is at hand.
4. Keep a rejection that cites a requirement within its wording (O8 on R11).

## Files
- `draft-*.md`: the leader's draft in each round it changed.
- `recumbent-luggage-carrying.md`: the research log.
- `recumbent-luggage-carrying.rounds.md`: per-round entries and searches.
- `replay.md`: every question the skill asked and the user's answer, verbatim, in order, so a replay can feed the
  same answers.

## Scoring a replay
- Round in which the expected answer first appears as an option, and first leads.
- Number of questions asked before it leads.
- Whether any rejection record wrongly pushed it out.

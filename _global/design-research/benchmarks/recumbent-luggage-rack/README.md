# Benchmark: recumbent luggage rack

A test run of the design-research skill on a non-software problem whose answer the user knows but does not reveal.
The user gives no hints; they only answer the skill's questions. Use it to replay the run against an improved skill
and compare in which round (if any) the expected answer leads.

## Prompt (verbatim)
> I have a recumbent bike, and I'd like to attach a luggage rack to it. What is the best way to attach it?

Run started 2026-10-25, skill version at Notes commit `fd1de14`.

## Expected answer
To be revealed by the user at the end of the run.

## Files
- `recumbent-luggage-carrying.md`: the research log.
- `recumbent-luggage-carrying.rounds.md`: per-round entries and searches.
- `replay.md`: every question the skill asked and the user's answer, verbatim, in order, so a replay can feed the
  same answers.

## Scoring a replay
- Round in which the expected answer first appears as an option, and first leads.
- Number of questions asked before it leads.
- Whether any rejection record wrongly pushed it out.

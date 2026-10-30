# Run 2026-10-30: skill packaging (the run the benchmark came from)

Not a harness run: the user answered live, in the session that produced `../../../../skill-packaging.md` and its
rounds file (kept there, not copied). Skill: `~/.claude/skills` commit `e2c7998`. Rubric still a draft.

## Score
| Measure | Result |
|---|---|
| Match | Yes, but only after the user asked about it in the review (round 7) |
| First appears / first leads | Round 3, in the discovery agent's report (its option 3, "add the same checkout as a local-path `directory` marketplace"), then folded into O1b's costs and lost; its own row (O12) only in round 7; never led before the user chose it |
| Points (draft rubric) | 0 of 3: the local marketplace led only after the user's question; several plugins (G8a) came from the user's review, not a question; where repos live (G9c) was never asked |
| Total | 7 log rounds, 9 question calls, 6 spikes |

## Why the local marketplace was missed (hypotheses, to test in later runs)
- H1, merge loss: the generator's option was merged into the leader's variant (O1b) as a dev-machine note instead
  of its own row; no rule asks that every generator option becomes a row, a named merge, or a dropped row with a
  reason.
- H2, checks blind to discovery: both checks read only the log's options, never the generator reports, so a dropped
  generator option can't be caught.
- H3, anchoring with evidence asymmetry: the first verified mechanism (the skills-directory plugin) got the spikes;
  alternatives stayed "unverified" and so looked weaker.
- H4, a user's means taken as a need: "use the repo as .claude/skills itself" went into K8's reason without asking
  what it protects; it was a means to several plugins.
- H5, a cost no requirement covers counted as a gain: "no install on the dev machine" weighed for the leader, and
  the alternatives' dev-machine steps were charged to K1 (which covers other machines).
- H6, review objections answered with the researcher's own variant: in round 5 the user's layout question got O10,
  a variant of the leader, instead of reopening discovery (the same shape as the 2026-10-28 recumbent run's review
  amendments).

## Replay targets
1. Every generator option ends as its own row, a named merge into a row, or dropped with a reason in the rounds file.
2. The rejection check also reads the generator reports and names options that were dropped.
3. Spike the runner-up's deciding unknowns too, not only the leader's.
4. Ask what a user's stated mechanism protects before recording it as a requirement or its reason.
5. A review objection that changes the layout reopens discovery for the changed part.

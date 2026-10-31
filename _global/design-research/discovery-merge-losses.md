# Discovery merge losses

## Problem
The user still finds the better option at review, although the research had it, or could easily have had it. Three
ways this happens: an option the research found never reaches the user's comparison, and nobody notices; the
conventional answer to the need (what the platform or the field itself recommends) never enters the comparison; and
options are ranked by something other than the requirements, such as when they turned up, how much was checked about
them, a means the user mentioned, or a gain no requirement asks for. The research has to put the best option it can
find in front of the user before the review, so the user judges a comparison instead of completing it.

## Situation
- **What exists now**: `research:design` Phase 3 opens with discovery: fresh generator subagents, each given
  *Problem*, *Requirements* and a lens; the researcher merges their options and places them on a design-space map
  (`research/skills/design/SKILL.md` Phase 3, `discovery.md`). Neither file says where the generator reports go, or
  that each generator option must be accounted for: the reports live only in the agent results (read, 2026-10-31).
  The rejection and bias checks read an extract of the log (`scripts/log-sections.py`), never the generator reports
  (`checks/*.md`, read). Phase 4 already asks for rejection records that compare cells with the leader's and says a
  cost no requirement covers may only break a tie (SKILL.md Phase 4 step 1, read). The report shows the
  recommendation and the runner-up (Phase 5, read).
- **What went wrong, once seen**: skill-packaging run, 2026-10-30 (`skill-packaging.md`, rounds 3-7; score in
  `benchmarks/skill-packaging/runs/2026-10-30-8bfbbb8/score.md`). The round-3 generator's option 3, a local
  marketplace, was folded into O1b's costs as a dev-machine note. It came back only when the user asked about it in
  round 7, and the user chose it. The user: "a local marketplace seems the obvious recommended solution"
  (2026-10-30). The score names six hypotheses: H1 merge loss, H2 checks blind to the discovery reports, H3 anchoring
  through evidence asymmetry, H4 a means taken as a need, H5 a cost no requirement covers counted as a gain, H6 a
  review objection answered with a variant of the leader. H5 happened although Phase 4 step 1 already forbids it.
- **Related misses**: on the recumbent-rack run (2026-10-28) discovery didn't run at all, and review objections were
  handled as amendments (`../TODO.md`). That run has the same shape as H6.
- **Part of**: the line of discovery fixes (`option-discovery.md`, `model-side-discovery.md`). Planned direction
  (user, 2026-10-30): `research:design` ends with an overview of the leading options and their caveats, likely split
  into `explore` / `compare` skills (`../TODO.md`). Showing each option's caveats side by side goes there (user,
  2026-10-31).
- **Time horizon**: has to be in place before the next real run of `research:design` (user, 2026-10-31). Until then a
  run can lose options the same way.
- **What the user values**: run cost per round (tokens, time) matters most among the costs (user, 2026-10-31). The
  SKILL.md body is ~4,032 estimated tokens, and the gate warns at 4,800 (handoff, 2026-10-30).
- **Measured by**: the skill-packaging benchmark draft (unconfirmed, harness can't run it yet) and the
  recumbent-rack benchmark (`../TODO.md`).

## Related decisions
- Parents (decided): `model-side-discovery.md` (blind generators, design-space map), `option-discovery.md`.
- Related, open: the explore / compare split (TODO, not started; takes over caveats side by side); the benchmark draft
  `benchmarks/skill-packaging/README.md`, which can measure this change.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| L1 | An option the research found reaches the user's comparison, or the user can see why it didn't | the user has to rediscover an option the research had (skill-packaging, round 7) | TODO (agent-written), user's scope answer 2026-10-31 | must? | no |
| L2 | The conventional answer to the need, what the platform or the field itself recommends, is among the options compared | the user has to supply the obvious answer (skill-packaging) | user, 2026-10-30 (TODO) | should? | no |
| L3 | An option's rank follows from the requirements alone: not from when it turned up, how much was checked about it, a means the user mentioned, or a gain no requirement asks for; this holds for review objections too | the leader wins on evidence or order, not fit (H3-H6) | user's scope answer, 2026-10-31; score.md | should? | no |
| L4 | The skill's core stays within its size budget | larger core, rules followed less (`skill-and-log-size.md`) | design doc, decided | should | yes (earlier log) |
| L5 | A research round costs about as much as now in tokens and time | runs get slower and pricier | user, 2026-10-31 ("run cost matters") | should? | no |
| L6 | Each option the user sees carries its caveats side by side | the user can't compare at a glance | user, 2026-10-30 (TODO) | won't (goes to the explore / compare split) | yes (user, 2026-10-31) |

## Options
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| U1 | The TODO's proposals: every generator option ends as a row, a named merge or a recorded drop; the rejection check also reads the generator reports; discovery asks what the platform's docs recommend | | | | user's (TODO), not judged yet |
| U2 | The score's replay targets: spike the runner-up's deciding unknowns too; ask what a stated means protects before recording it; a review objection that changes the layout reopens discovery | | | | from score.md (agent-written at the user's request), not judged yet |

## Open questions
1. L1's priority: must, or should.
2. L5: how much extra cost per round is acceptable.
3. Whether L3 (evaluation) stays in this decision or splits off (`splitting.md`).

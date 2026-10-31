# Discovery merge losses

## Problem
Confirmed by the user: 2026-10-31
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
- **What a loss costs**: in skill-packaging, rounds 5-7 (two review rounds, three spikes) went to options the
  round-3 report already held (rounds file). A lost option costs whole rounds, not tokens per round.
- **Measured by**: the skill-packaging benchmark draft (unconfirmed, harness can't run it yet) and the
  recumbent-rack benchmark (`../TODO.md`).

## Related decisions
- Parents (decided): `model-side-discovery.md` (blind generators, design-space map), `option-discovery.md`.
- Related, open: the explore / compare split (TODO, not started; takes over caveats side by side); the benchmark draft
  `benchmarks/skill-packaging/README.md`, which can measure this change.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| L1 | An option the research found reaches the user's comparison, or the user can see why it didn't | the user has to rediscover an option the research had (skill-packaging, round 7) | TODO (agent-written), user's scope answer 2026-10-31 | should | yes (user, 2026-10-31) |
| L2 | The conventional answer to the need, what the platform or the field itself recommends, is among the options compared | the user has to supply the obvious answer (skill-packaging) | user, 2026-10-30 (TODO) | should? | no |
| L3 | An option's rank follows from the requirements: not from when it turned up, how much was checked about it, or a means the user mentioned; a gain no requirement asks for only breaks a tie, or reveals a requirement to ask about; this holds for review objections too | the leader wins on evidence or order, not fit (H3-H6) | user's scope answer, 2026-10-31; score.md | should? | no |
| L4 | The skill's core stays within its size budget | larger core, rules followed less (`skill-and-log-size.md`) | design doc, decided | should | yes (earlier log) |
| L5 | The run cost each option adds per round (tokens, time) is known and shown in the comparison, not capped in advance | runs get slower and pricier without the user choosing it | user, 2026-10-31 ("run cost matters"; asked for a cap: "show a comparison along this axis") | should | yes (user, 2026-10-31) |
| L6 | Each option the user sees carries its caveats side by side | the user can't compare at a glance | user, 2026-10-30 (TODO) | won't (goes to the explore / compare split; user: "the costs should all be considered and shown in the comparison to the user") | yes (user, 2026-10-31) |

## Options
Generator reports (round 1): `discovery-merge-losses.discovery/round1-far-fields.md` (F1-F8 and titles),
`round1-own-field.md` (W1-W8 and titles). Every generator option is a row's source below, or merged or dropped in
the rounds file's round 1 entry. Costs are estimates (the generators' or mine) unless marked measured; L5 asks that
they are shown, so they break ties only.

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O0 | Do nothing / follow what's written: Phase 4 allows an uncovered cost only as a tie-break (H5), requirements.md says to ask what a means protects (H4), decision.md sends an objection back into a round (H6), the bias check asks for missing options | L4; no cost | H1, H2 have no rule at all; H4-H6 happened with the rules in place | cheap | trailing (L1, L2, L3) |
| O1a | Candidate register, any source: generator reports saved next to the log; every candidate from a report, a search, the user or an objection gets an ID and ends as a row's source, a merge or a drop with its reason in the round's entry; a count line in the report (W1 whole, F1; MADR, double entry, chain of custody, generator coverage) | L1 for every source | ~25-80 tok per candidate per round; non-generator candidates rest on the researcher | cheap | leading (part of P2) |
| O1s | The round gate checks the register for the generator reports' IDs (vendor: "verifiable intermediate outputs" validated by a script) | L1 presence, deterministic | an ID format in the brief; ~40 lines of script; catches silent drops only, not bad merges (bias check) | cheap | leading (part of P2) |
| O12 | Merge rule: a candidate merges into a row only when its matrix cells would be the same; otherwise its own row, a variant (bias check; Phase 3 "variants count") | L1 against the incident's shape (folded into a row with other cells) | ~0; more rows (variants) | cheap | leading (part of P2) |
| O13 | No merge step: a script adds every generator option as its own row; the researcher merges only by an explicit edit with a reason (bias check) | L1 by construction | 15-30 rows per round to score, ~3-6k tok more in every log read; true duplicates (F1/W1) twice | cheap | runner-up (L1; tie-break on cost against O12 + O14) |
| O14 | The bias check reads the generator reports and the round's register, and names candidates without a row whose drop or merge cites no requirement or changed cells (bias check: fresh and not told the leader) | L1 judgement, independent | bias extract grows by the reports, ~5-12k tok per round; no new agent | cheap | leading (part of P2) |
| O2b | As O14, but in the rejection check (U1) | L1 judgement | the rejection check is told the leader: anchored (bias check); same cost as O14 | cheap | trailing (L1: O14 reads it unanchored) |
| O2 | Completeness tracing subagent over all raw material (F4) | L1 every source, independent | a new agent, ~3-15k tok, 30-120 s per round | cheap | trailing (tie-break: O1a + O14 cover the same sources inside agents that run anyway) |
| O16 | A separate merger subagent dedupes and merges the generator options (bias check) | L1, merging apart from ranking | a new agent per round | cheap | trailing (tie-break on cost against O12 + O14) |
| O15 | The first report lists the raw generator titles as an appendix (bias check; two-pass review) | L1 "the user can see why" | ~0.5-1k tok in the report; puts the reading on the user (the problem) | cheap | trailing (L1: the user completes the comparison, the problem itself) |
| O3 | The documented route as a Phase 3 category: look up what the platform's or field's own docs recommend, as such; say if none (F2, W2; patent prior-art, outside view, second opinion; U1) | L2 | one lookup in round 1 (this round: one fetch, ~10k tok, measured roughly); core ~30 tok | cheap | leading (part of P2) |
| O3b | Fixed baseline rows: documented route, field default, do nothing; an empty row says why (F2, W2) | L2, a visible gap | a row each, every round | cheap | runner-up to O3 (tie-break: "say if none" in O3 gives the same gap) |
| O4 | Standard of care, comply-or-explain (F3, W2 Pugh datum) | L2, L3 | | cheap | trailing (L3: being the default is itself a non-requirement reason) |
| O5 | The rejection check checks the leader's reasons: each cites a requirement; uncovered gains only as tie-breaks; a means taken as a need flagged (F5, W3; jury instruction, negative selection, ranking-reason lint) | L3 (H4, H5), independent | ~0.3-1k tok in the existing check | cheap | leading (part of P2) |
| O7 | A ? is no ✗: a deciding ? is checked before it ranks an option lower; the rejection check flags leads on cells left ? for the others (F7, F8, W5; replay target 3) | L3 (H3) | ~2-6k tok per top-up spike | cheap | leading (part of P2) |
| O8 | A review-objection round reruns discovery for the part it changes (replay target 5) | L3 (H6) | one generator per such round, ~60k tok (measured: 61-65k) | cheap | trailing (tie-break against O8b) |
| O8b | A review objection maps to a requirement before rescoring; when it is a new requirement, discovery reruns for it (W7 cheap form, bias check) | L3 (H6) | ~1-4k tok per objection; a generator only for a new requirement | cheap | leading (part of P2) |
| O6 | Blind scorer subagent, shuffled normalised cards (F6, W4; another model family) | L3 independent of the researcher | ~25-55k tok, 1-4 min per round | cheap | runner-up (L3: P2's L3 parts are checked by the rejection check, which knows the leader) |
| O9 | Dominance filter and even swaps, no ranking (W6; show all, rank none) | L3 by construction; L1 (dominated listed with their dominator) | the report's shape | costly (report habits) | trailing (out of scope by the user's decision, 2026-10-31: the report's shape goes to the explore / compare split) |
| O10 | Generate-dedupe-tournament-evolve (W8) | L1, L3 | ~60-200k tok, 5-15 min per round | costly | trailing (tie-break: O13/O6 give the same cells for less) |
| O11 | Red team / premortem agent (titles) | L1, L2 partly | the bias check already asks for missing options | cheap | trailing (tie-break: the same job as the bias check) |
| U3 | A diagnosis section (user, 2026-10-31); meaning to be asked | | | | user's, not judged yet |
| P2 | **Package**: O1a + O1s + O12 + O14 (L1), O3 (L2), O5 + O7 + O8b (L3) | L1, L2, L3, L4, L5 | ~1-2k tok register + ~5-12k bias extract per round; a generator only for a new requirement from an objection; core ~+215 tok | cheap | leading |

## Matrix
| Option | L1 | L2 | L3 | L4 | L5 | ✗ or ~ |
|---|---|---|---|---|---|---|
| *priority, verified* | should, yes | should, no | should, no | should, yes | should, yes | |
| O0 | ✗ | ✗ | ~ | ✓ | ✓ | ✗ L1, L2; ~ L3 |
| O1a + O1s + O12 + O14 | ✓ | – | – | ✓ | ✓ | |
| O13 + O14 | ✓ | – | – | ✓ | ✓ | |
| O2b (in place of O14) | ~ | – | – | ✓ | ✓ | ~ L1 (anchored reader) |
| O2 | ✓ | – | – | ✓ | ✓ | |
| O16 | ✓ | – | – | ✓ | ✓ | |
| O15 | ~ | – | – | ✓ | ✓ | ~ L1 |
| O3 | – | ✓ | – | ✓ | ✓ | |
| O3b | – | ✓ | – | ✓ | ✓ | |
| O4 | – | ✓ | ✗ | ✓ | ✓ | ✗ L3 |
| O5 + O7 + O8b | – | – | ~ | ✓ | ✓ | ~ L3 (checked by a check told the leader) |
| O5 + O7 + O8 | – | – | ~ | ✓ | ✓ | ~ L3 |
| O6 | – | – | ✓ | ✓ | ✓ | |
| O9 | ✓ | – | ✓ | ✓ | ✓ | (out of scope) |
| O10 | ✓ | – | ✓ | ✓ | ✓ | |
| O11 | ~ | ~ | – | ✓ | ✓ | ~ L1, L2 |
| P2 | ✓ | ✓ | ~ | ✓ | ✓ | ~ L3 |

"–": the option doesn't address that requirement; it combines with one that does. L5 ✓: its cost is estimated
per round and shown in *Options*; costs break ties only.

## Evaluation
### Rejection records
- **O0** trails on L1 ("an option the research found reaches the user's comparison, or the user can see why it
  didn't"): skill-packaging round 3, the local marketplace folded into O1b's costs and recorded nowhere. No other
  requirement accepts that. Best variant: follow the written rules in full; still no rule for H1, H2.
- **O2b** trails on L1 only against O14: the same reading in the rejection check, which is told the leader, so a
  lost option close to the leader is the one it is least likely to flag (bias check, round 1).
- **O2** ties P2's L1 parts on the cells; a cost tie-break (said as such): a new agent per round, where O1a + O14
  put the same reading into the register and the bias check that run anyway. Comes back if a run loses a
  non-generator candidate that the register didn't record.
- **O13** ties on the cells; runner-up on a cost tie-break: 15-30 rows a round to score and read, true duplicates
  twice. Wins if O12's merge rule is broken in a run and O14 misses it.
- **O16** ties on the cells; cost tie-break: a new agent where O12 + O14 judge merges for less.
- **O15** ~L1: the user reads the raw titles and completes the comparison, the failure *Problem* names.
- **O3b** ties O3; cost tie-break: rows every round, where "say if none" gives the same visible gap once.
- **O4** trails on L3: the default status is itself a reason no requirement gives.
- **O8** ties O8b on cells; cost tie-break: a ~60k generator per objection round where O8b runs one only when the
  objection adds a requirement.
- **O6** runner-up for L3: independent, where P2's L3 parts rest on the rejection check (told the leader) and on the
  researcher. Comparable in size to one generator per round. Wins if P2's L3 rules are skipped in a real run.
- **O9** trails by the user's scope decision (2026-10-31), not by L6: the report's shape belongs to the explore /
  compare split; its dominance filter may come with it.
- **O10** ties on cells; cost tie-break: ~60-200k per round.
- **O11** ~L1, ~L2; the bias check already asks for missing options.

### Harms (leader P2)
- The ID format couples the generator brief, the reports and the gate: a changed answer format breaks the gate
  (loudly, by design).
- The gate checks presence only; merges are judged by O12's rule and O14's reading. A merge into a row with other
  cells that O14 misses is lost as before (then O13).
- O14 makes the bias extract larger (~5-12k tok a round, growing with generators); the bias check then does two
  jobs, and a long extract may get read partly.
- L3 rests on rules and on the rejection check, which knows the leader; H4-H6 show rules get skipped (then O6).
- Non-generator candidates (searches, the user) are registered by the researcher only; the gate can't see them.

### Reversibility
All options are skill text or scripts: cheap (an edit and a reload), except O9 and O10 (costly).

### Draft and stress test (leader P2, redrafted after the checks)
Draft: `/tmp/claude-1000/-home-cboost-Cboost-claude-skills/e35bf7b0-0e9c-4be5-99c9-c5783bc29d77/scratchpad/dml-draft/design/`:
- SKILL.md Phase 3: reports saved in `<topic>.discovery/`; every candidate (report, search, user) ends by its ID in
  the round's *Register* as a row's source, a merge (only into a row with the same cells) or a drop with a reason;
  the gate checks the reports' IDs. A *documented route* category. Phase 4 step 1: "a ? is no ✗". Checklist item
  *Register*.
- `discovery.md`: *Saving the reports* (a letter per generator, IDs at line start); the brief asks for IDs.
- `checks/bias.md`: reads the reports and *Register*, names lost candidates and merges that would change cells.
- `checks/rejection.md`: the leader's reasons each cite a requirement; uncovered gains, means taken as needs, leads
  on cells left ? for others.
- `decision.md`: an objection maps to a requirement before rescoring; a new one reruns discovery.
- Not drafted yet: *Register* in `shared/log-template.md` (current round only, like *Round checklist*; older ones
  to the rounds file); `log-sections.py` appending the reports and *Register* to the bias extract; the check in
  `round-gate.py` (draft: `scratchpad/register_check.py`).
Core: ~4,032 → ~4,253 tok est. (+221; warning 4,800).

Real use, on this log (first draft's check): the reports renumbered F1-F8, W1-W8; all 16 accounted for; with F4's
register line removed it named `round1-far-fields.md: F4`. One Python run, no tokens.
The round-1 checks were the second real use: the rejection check, given the reports but not the register (in the
rounds file, outside the extract), flagged eight titles as unaccounted that the register had dropped with reasons;
the reader needs the register next to the reports (now in the draft). The bias check found that the gate alone
would have passed the incident ("merged into O1b"): now O12 + O14.
Found by the test:
- Presence isn't disposition: an ID mentioned anywhere counts. Variant: require it in *Register*.
- Titles need IDs too: ~15 more entries per generator, ~25 tok each.
- Why the user would reject it in use: bookkeeping the user never reads; its payoff shows only when a check catches
  a loss.

## Open questions
1. U3: what the diagnosis section holds and where it lives (decides U3's shape).
2. L2: still wanted, given the conventional answer was found and then lost (bias check)? Decides O3.
3. L3 (reworded): verify; rules plus the rejection check (P2), or the blind scorer O6 (~25-55k tok a round)?

## Sources
| Claim | Source (URL or `file:line`) | Date | Reliability |
|---|---|---|---|
| Anthropic recommends checklists, feedback loops and script-validated intermediate outputs for skills | platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices | 2026-10-31 | primary (vendor) |
| PRISMA flow: records excluded with reasons, counts reconcile | prisma-statement.org (F1), casrai (W1): two generators independently | 2026-10-31 | secondary, two sources |
| Green Book short list must hold BAU and do-minimum | gov.uk Green Book 2020 (F2), Business Case reviewers checklist (W2) | 2026-10-31 | primary via generators |
| LLM judges show position and verbosity bias; swap order helps | arxiv 2306.05685 (W4) | 2026-10-31 | primary via generator, unread by me |
| Neither SKILL.md nor discovery.md says where generator reports go | `research/skills/design/SKILL.md:49-52`, `discovery.md` | 2026-10-31 | read |
| The rejection extract skips only Sources, Searches, Round checklist, Rounds, Decision | `scripts/log-sections.py:16-20` | 2026-10-31 | read |

## Round checklist
Checklist:
- [x] Log (first round): its path in the report; new or resumed, and what was outdated (new)
- [x] Problem (first round): confirmed by the user (the line in *Problem*)
- [x] Scope: split, widened or unchanged (unchanged: user declined splitting (c) off)
- [x] Requirements: new or changed ones, each a need (no mechanism) with reason, source, priority and verified
- [x] Replaced requirements: (n/a: none replaced; L1, L2 reworded before confirmation) new IDs, old rows moved; options re-checked from the old matrix column
- [x] Written requirements: (L4 from skill-and-log-size.md; L1 agent-written in TODO, verified by the user) evidence found for each (commit, decision log)
- [x] Deciding unverified requirements: (L2, L3 asked) asked this round, or assumptions after "can't answer"
- [x] Options: added, by the categories of Phase 3
- [x] Searches: recorded in the round's entry; or "no web search", said in the report
- [x] Deciding claims: cross-checked against a second source, or marked unverified
- [x] Matrix: updated
- [x] Rejection records: one per trailing or not applicable option (scenario, best variant, leader's cells compared)
- [x] Harms: scenarios for the leading option
- [x] Reversibility: every option rated; one-way means extra stress-testing, said in the report
- [x] Draft and stress test: of the leading option; the draft's path in the report
- [x] Bias check: findings in the log and the report; or "not independent"
- [x] Rejection check: findings in the log and the report; verdicts corrected
- [x] Ranking change: recorded
- [x] Report: what changed, recommendation, runner-up, must rejections, the checks' findings
- [x] Questions: deciding unverified ones first, ordered by ranking impact, through the question tool, remarks last
- [x] Pushback: (n/a: no choice yet) if the user picked a worse option, asked what makes it better

## Rounds
1. Discovery (2 generators), the documented route (vendor docs), checks: leader P2 (O1a + O1s + O12 + O14, O3,
   O5 + O7 + O8b), runner-ups O13 (L1), O6 (L3). P became P2 after both checks.
0. Problem formulation: problem confirmed (2026-10-31); scope widened to H3-H6; caveats side by side to the
   explore / compare split (L6 won't).

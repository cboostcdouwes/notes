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
| L1b | A worked-out option the research found is set aside only for a reason tied to a requirement, checked by someone other than the researcher (replaces L1) | the user has to rediscover an option the research had (skill-packaging, round 7) | user, round 2 (reach: worked-out options only; reworded) | should | yes (user, 2026-10-31) |
| L2 | The conventional answer to the need, what the platform or the field itself recommends, is among the options compared | the user has to supply the obvious answer (skill-packaging) | user, 2026-10-30 (TODO); kept after the bias check's doubt (user, round 1) | should | yes (user, 2026-10-31) |
| L3 | An option's rank follows from the requirements: not from when it turned up, how much was checked about it, or a means the user mentioned; a gain no requirement asks for only breaks a tie, or reveals a requirement to ask about; this holds for review objections too | the leader wins on evidence or order, not fit (H3-H6) | user's scope answer, 2026-10-31; score.md | could (user, round 1: "only the rejection-check questions, no new Phase 4 rules") | yes (user, 2026-10-31) |
| L4b | The skill stays light: its core within the size budget, and few new rules or parts to read and follow anywhere (replaces L4) | larger skill, rules followed less (`skill-and-log-size.md`); user: "keep the skill light" | user, round 1; design doc | should | yes (user, 2026-10-31) |
| L5 | The run cost each option adds per round (tokens, time) is known and shown in the comparison, not capped in advance | runs get slower and pricier without the user choosing it | user, 2026-10-31 ("run cost matters"; asked for a cap: "show a comparison along this axis") | should | yes (user, 2026-10-31) |
| L7 | The report's shape (what the user is shown and how options are ordered) changes here | — | user, round 0 (scope: the explore / compare split decides it) | won't | yes (user, 2026-10-31) |
| L6 | Each option the user sees carries its caveats side by side | the user can't compare at a glance | user, 2026-10-30 (TODO) | won't (goes to the explore / compare split; user: "the costs should all be considered and shown in the comparison to the user") | yes (user, 2026-10-31) |

## Options
Generator reports (round 1): `discovery-merge-losses.discovery/round1-far-fields.md` (F1-F8 and titles),
`round1-own-field.md` (W1-W8 and titles). Every generator option is a row's source below, or merged or dropped in
the rounds file's round 1 entry. Costs are estimates (the generators' or mine) unless marked measured; L5 asks that
they are shown, so they break ties only.

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O0 | Do nothing / follow what's written: Phase 4 allows an uncovered cost only as a tie-break (H5), requirements.md says to ask what a means protects (H4), decision.md sends an objection back into a round (H6), the bias check asks for missing options | L4; no cost | H1, H2 have no rule at all; H4-H6 happened with the rules in place | cheap | trailing (L1, L2, L3) |
| O1a | Candidate register, any source: generator reports saved next to the log; every candidate from a report, a search, the user or an objection gets an ID and ends as a row's source, a merge or a drop with its reason in the round's entry; a count line in the report (W1 whole, F1; MADR, double entry, chain of custody, generator coverage) | L1 for every source | ~25-80 tok per candidate per round; non-generator candidates rest on the researcher | cheap | trailing (L4b: a Register section and its rules; O13 makes rows from the reports instead; non-generator candidates stay Phase 3 rows as now) |
| O1s | The round gate checks the register for the generator reports' IDs (vendor: "verifiable intermediate outputs" validated by a script) | L1 presence, deterministic | an ID format in the brief; ~40 lines of script; catches silent drops only, not bad merges (bias check) | cheap | trailing (L4b: a gate check and an ID rule, where O13's rows exist by construction) |
| O12 | Merge rule: a candidate merges into a row only when its matrix cells would be the same; otherwise its own row, a variant (bias check; Phase 3 "variants count") | L1 against the incident's shape (folded into a row with other cells) | ~0; more rows (variants) | cheap | trailing (L4b; its reading kept as a rejection-check question on merged rows) |
| O13 | No merge step: a script adds every generator option as its own row; the researcher merges only by an explicit edit with a reason (bias check) | L1 by construction | 15-30 rows per round to score, ~3-6k tok more in every log read; true duplicates (F1/W1) twice | cheap | leading (chosen by the user, round 1: "seems best; keep the skill light"), part of P3 |
| O14 | The bias check reads the generator reports and the round's register, and names candidates without a row whose drop or merge cites no requirement or changed cells (bias check: fresh and not told the leader) | L1 judgement, independent | bias extract grows by the reports, ~5-12k tok per round; no new agent | cheap | trailing (L4b: the reports' options are rows in O13, visible to both checks already) |
| O2b | As O14, but in the rejection check (U1) | L1 judgement | the rejection check is told the leader: anchored (bias check); same cost as O14 | cheap | trailing (L1: O14 reads it unanchored) |
| O2 | Completeness tracing subagent over all raw material (F4) | L1 every source, independent | a new agent, ~3-15k tok, 30-120 s per round | cheap | trailing (tie-break: O1a + O14 cover the same sources inside agents that run anyway) |
| O16 | A separate merger subagent dedupes and merges the generator options (bias check) | L1, merging apart from ranking | a new agent per round | cheap | trailing (tie-break on cost against O12 + O14) |
| O15 | The first report lists the raw generator titles as an appendix (bias check; two-pass review) | L1 "the user can see why" | ~0.5-1k tok in the report; puts the reading on the user (the problem) | cheap | trailing (L1: the user completes the comparison, the problem itself) |
| O3 | The documented route as a Phase 3 category: look up what the platform's or field's own docs recommend, as such; say if none (F2, W2; patent prior-art, outside view, second opinion; U1) | L2 | one lookup in round 1 (this round: one fetch, ~10k tok, measured roughly); core ~30 tok | cheap | leading (part of P3) |
| O3b | Fixed baseline rows: documented route, field default, do nothing; an empty row says why (F2, W2) | L2, a visible gap | a row each, every round | cheap | runner-up to O3 (tie-break: "say if none" in O3 gives the same gap) |
| O4 | Standard of care, comply-or-explain (F3, W2 Pugh datum) | L2, L3 | | cheap | trailing (L3: being the default is itself a non-requirement reason) |
| O5 | The rejection check checks the leader's reasons: each cites a requirement; uncovered gains only as tie-breaks; a means taken as a need flagged (F5, W3; jury instruction, negative selection, ranking-reason lint) | L3 (H4, H5), independent | ~0.3-1k tok in the existing check | cheap | leading (part of P3; with O7's ? question and O12's merged-row question) |
| O7 | A ? is no ✗: a deciding ? is checked before it ranks an option lower; the rejection check flags leads on cells left ? for the others (F7, F8, W5; replay target 3) | L3 (H3) | ~2-6k tok per top-up spike | cheap | trailing (L3 could: only its rejection-check question kept, in O5) |
| O8 | A review-objection round reruns discovery for the part it changes (replay target 5) | L3 (H6) | one generator per such round, ~60k tok (measured: 61-65k) | cheap | trailing (tie-break against O8b) |
| O8b | A review objection maps to a requirement before rescoring; when it is a new requirement, discovery reruns for it (W7 cheap form, bias check) | L3 (H6) | ~1-4k tok per objection; a generator only for a new requirement | cheap | trailing (L3 could: no new rule outside the rejection check) |
| O6 | Blind scorer subagent, shuffled normalised cards (F6, W4; another model family) | L3 independent of the researcher | ~25-55k tok, 1-4 min per round | cheap | trailing (L3 could; L5: ~25-55k tok a round for a could) |
| O9 | Dominance filter and even swaps, no ranking (W6; show all, rank none) | L3 by construction; L1 (dominated listed with their dominator) | the report's shape | costly (report habits) | trailing (out of scope by the user's decision, 2026-10-31: the report's shape goes to the explore / compare split) |
| O10 | Generate-dedupe-tournament-evolve (W8) | L1, L3 | ~60-200k tok, 5-15 min per round | costly | trailing (tie-break: O13/O6 give the same cells for less) |
| O11 | Red team / premortem agent (titles) | L1, L2 partly | the bias check already asks for missing options | cheap | trailing (tie-break: the same job as the bias check) |
| O3c | The documented route as a line in each generator's brief: "include what your field's or platform's own docs recommend" (bias check, round 2) | L2; ~0 tok, fresh agents | generators are blind to the project and don't know the platform: this round, neither generator found the vendor guide, the researcher's lookup did | cheap | trailing (L2: the evidence of this run) |
| O17 | Equal evidence budget: the top 2-3 options get the same checks before ranking (bias check, round 2) | L3 (H3) | a new Phase 4 rule; spikes per contender | cheap | trailing (L3 could, "only the rejection-check questions"; L4b) |
| O18 | Simulated user review: one pass asks what the user would ask about at review (bias check, round 2) | L1, L2 partly | the bias check's missing-options question does this already; a new pass otherwise | cheap | merged into O11 (the same cells: a pass that names what is missing) |
| U3 | A diagnosis section (user, 2026-10-31): a problem diagnosis before options | | | | out of scope (user, round 1: a problem diagnosis, for problem-formulation) |
| P2 | **Package**: O1a + O1s + O12 + O14 (L1), O3 (L2), O5 + O7 + O8b (L3) | L1, L2, L3, L4, L5 | ~1-2k tok register + ~5-12k bias extract per round; a generator only for a new requirement from an objection; core ~+215 tok | cheap | trailing (L4b against P3; superseded) |
| P3 | **Package**: O13 (a script makes a row of every worked-out generator option; a merge is named in the row's summary, so the bias check judges it), O3 (documented route, round 1 and when *Problem* changes), O5 (rejection-check questions: leader's reasons, leads on ? cells) | L2, L3 (could), L4b, L5; L1 for worked-out generator options | log +~1.2k tok per 16 rows before scoring (measured), ~4-8k with matrix rows and records; core +157 tok (~4,189) | cheap | leading |

## Matrix
| Option | L1b | L2 | L3 | L4b | L5 | ✗ or ~ |
|---|---|---|---|---|---|---|
| *priority, verified* | should, yes | should, yes | could, yes | should, yes | should, yes | |
| O0 | ✗ | ✗ | ~ | ✓ | ✓ | ✗ L1, L2; ~ L3 |
| O1a + O1s + O12 + O14 | ✓ | – | – | ~ | ✓ | ~ L4b |
| O13 + O14 | ~ | – | – | ~ | ✓ | ~ L1 (as P3), ~ L4b |
| O2b (in place of O14) | ~ | – | – | ✓ | ✓ | ~ L1 (anchored reader) |
| O2 | ✓ | – | – | ✓ | ✓ | |
| O16 | ✓ | – | – | ✓ | ✓ | |
| O15 | ~ | – | – | ✓ | ✓ | ~ L1 (shows that, not why) |
| O3c | – | ~ | – | ✓ | ✓ | ~ L2 (missed here) |
| O17 | – | – | ✓ | ~ | ✓ | ~ L4b |
| O3 | – | ✓ | – | ✓ | ✓ | |
| O3b | – | ✓ | – | ✓ | ✓ | |
| O4 | – | ✓ | ✗ | ✓ | ✓ | ✗ L3 |
| O5 + O7 + O8b | – | – | ~ | ~ | ✓ | ~ L3, L4b (new rules) |
| O5 (check questions only) | – | – | ~ | ✓ | ✓ | ~ L3 |
| O5 + O7 + O8 | – | – | ~ | ~ | ✓ | ~ L3, L4b |
| O6 | – | – | ✓ | ~ | ✓ | ~ L4b (a new agent and brief) |
| O9 | ✓ | – | ✓ | ~ | ✓ | changes the report's shape (L7 won't); ~ L4b |
| O10 | ✓ | – | ✓ | ✗ | ✓ | ✗ L4b (many new parts) |
| O11 | ~ | ~ | – | ✓ | ✓ | ~ L1, L2 |
| P2 | ✓ | ✓ | ~ | ~ | ✓ | ~ L3, L4b |
| P3 | ✓ | ✓ | ~ | ✓ | ✓ | ~ L3 |

"–": the option doesn't address that requirement; it combines with one that does. L5 ✓: its cost is estimated
per round and shown in *Options*; costs break ties only.

## Evaluation
### Rejection records (round 2, against P3)
- **O0** trails on L1 ("an option the research found reaches the user's comparison, or the user can see why it
  didn't"): skill-packaging round 3, the local marketplace folded into O1b's costs, recorded nowhere. Best variant:
  follow the written rules in full; still no rule for H1, H2.
- **O1a** (any-source register) beats P3 on L1: titles, search and user candidates too. Trails on L4b (a *Register*
  section, a template change, its rules). Variant O1a alone, without O1s/O12/O14: still the section and its rules.
  Which weighs more, L1's extra reach or L4b, is the user's call (asked, round 2).
- **O1s** (gate check) trails on L4b: a gate check on top of the ID format P3 also has; small, but P3's script
  makes the rows, so the check would only confirm what the script did.
- **O12** (merge rule) is P3's merge-in-summary rule's reason; trails as a separate rule on L4b.
- **O14** (bias check reads reports and register): its reports are rows in P3 already; its remaining job, an
  unanchored reader of merges, P3 now has (merges named in the summary, which the bias check reads). Its ~5-12k tok
  a round would break the tie (said as such).
- **O2b** trails on L1 against P3: the same reading in the rejection check, told the leader.
- **O2** (tracing subagent) beats P3 on L1 (every source); trails on L4b (a new agent and brief). As O1a: asked.
- **O13 + O14** trails P3 on L4b.
- **O16** (separate merger agent) ties P3 on L1 for generator options; trails on L4b (a new agent).
- **O15** ~L1: a list of raw titles shows that an option was dropped, not why.
- **O3b** ties O3; cost tie-break (said as such): rows every round, where "say if none" gives the same gap once.
- **O3c** ~L2: this run's two generators, blind to the project, didn't find the vendor guide; the researcher's
  lookup did. Comes back with a lens that knows the platform.
- **O4** trails on L3 as a presumed winner. Its variant, the Pugh datum (the default as the reference to score
  against, W2), has O3b's cells: merged there.
- **O5 + O7 + O8 / O8b, O17** trail by L3 being a could with "only the rejection-check questions" (user, round 1)
  and on L4b (new rules). O7's question stays in O5.
- **O6** trails on L4b (a new agent and brief, a should) for L3 (a could).
- **O9** trails on L7 (won't: the report's shape is the explore / compare split's) and ~L4b.
- **O10** trails on L4b (✗: a generate-dedupe-tournament-evolve pipeline is many new parts).
- **O11** (with O18) ~L1, ~L2: the bias check already asks for missing options.
- **P2** trails on L4b against P3.

### Harms (leader P3)
- The log grows with every report: ~16 rows a round with two generators (measured +3.5 KB before scoring), each
  read every round; rows of trailing options each need a rejection record (Phase 4 step 1), ~4-8k tok more.
- Merging is still the researcher's edit; it is named in the row's summary, and the bias check (not told the leader)
  asks whether the merged row shares the cells; nothing forces it.
- Only worked-out generator options become rows: titles, search and user candidates rest on Phase 3's rules (L1 ~).
- Many unscored rows may recreate H3: deep checks on a few, the rest at ? (bias check, round 2).
- The script couples the brief's ID format to the log's table layout; a report without IDs, or an ID already in
  the log, stops it with an error (tested, round 2).
- Non-generator candidates (searches, the user) are rows only as Phase 3 already asks.

### Harms (P2, round 1)
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

### Draft and stress test (leader P3, round 2)
Draft (replaces P2's): same scratchpad folder. SKILL.md Phase 3: save each report and run
`scripts/add-candidates.py <log> <report>`; merges named in the verdict; the *documented route* category.
`discovery.md`: a letter per generator, IDs on worked-out options. `checks/rejection.md`: the leader's reasons, ?
leads, merged rows. New `scripts/add-candidates.py` (43 lines). Core ~4,163 tok est. (+131).
Real use: run on a copy of this log with both reports: 16 rows added, IDs and titles cut to 160 chars, log
+3.5 KB (~1.2k tok) before scoring; F1/W1 and F2/W2 duplicate each other and O1/O3 (merge edits needed).
Why the user would reject it in use: a long *Options* table to read in every log.

### Draft and stress test (P2, round 1)
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
None deciding. Out of scope, for the TODO: the Verdict column out of the shared template (user, round 2); a
problem diagnosis section in problem-formulation (U3).

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
- [x] Log (first round): its path in the report; new or resumed, and what was outdated (n/a: round 2)
- [x] Problem (first round): confirmed by the user (the line in *Problem*) (n/a: round 2)
- [x] Scope: split, widened or unchanged
- [x] Requirements: new or changed ones, each a need (no mechanism) with reason, source, priority and verified
- [x] Replaced requirements: new IDs, old rows moved; options re-checked from the old matrix column
- [x] Written requirements: evidence found for each (commit, decision log)
- [x] Deciding unverified requirements: asked this round, or assumptions after "can't answer"
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
- [x] Pushback: if the user picked a worse option, asked what makes it better (O13's L1 reach vs O1a/O2: asked)

## Rounds
3. Answers: L1b (worked-out options only; reworded), the Verdict column to the template as a separate change; no
   ranking change: P3 leads; decision drafted.
2b. Checks (round 2): script clash and format errors (fixed: fails loudly), merges moved to the summary (the bias
   check reads them), P3's L1 is ~ (titles, search and user candidates by rule only); O3c, O17, O18 added; stale
   records rewritten.
2. Answers: L2 should, L3 could, L4b (light skill) replaces L4, U3 out of scope; the user prefers O13: leader P3
   (O13 + O3 + O5), P2 trails on L4b.
1. Discovery (2 generators), the documented route (vendor docs), checks: leader P2 (O1a + O1s + O12 + O14, O3,
   O5 + O7 + O8b), runner-ups O13 (L1), O6 (L3). P became P2 after both checks.
0. Problem formulation: problem confirmed (2026-10-31); scope widened to H3-H6; caveats side by side to the
   explore / compare split (L6 won't).

## Decision
Draft

**Choice: P3** (draft: `/tmp/claude-1000/-home-cboost-Cboost-claude-skills/e35bf7b0-0e9c-4be5-99c9-c5783bc29d77/scratchpad/dml-draft/design/`):
1. SKILL.md Phase 3: save each generator report in `<topic>.discovery/` and run `scripts/add-candidates.py <log>
   <report>`, which adds each worked-out option as its own row; a merge is named in the row's summary, with why.
2. SKILL.md Phase 3 category *The documented route*: what the platform's or field's own docs recommend, looked up
   as such in the first round and when *Problem* changes; say if there is none.
3. `discovery.md`: a letter per generator, not used before in the log; IDs at the start of each worked-out option.
4. `checks/bias.md`: a merged row names its row in the summary; would it share that row's cells?
5. `checks/rejection.md`: the leader's reasons each cite a requirement; flag uncovered gains, a means taken as a
   need, leads on cells left ? for the others.
6. New `scripts/add-candidates.py` (fails on an ID already in the log, and on a report without IDs).
7. README: flowchart (rows from the reports; documented route) and the file table.
Core ~4,032 → ~4,189 tok est.

**Why:**
1. A worked-out option is set aside only for a requirement-tied reason checked by someone other than the
   researcher (L1b, should, user round 2): the script makes the row, so a fold into another row's costs is an edit
   the bias check (not told the leader) sees and judges.
2. The documented route is compared (L2, should, user round 1): in this run the researcher's lookup found the
   vendor's guide, the blind generators didn't.
3. Ranking by the requirements, as a could (L3, user round 1: "only the rejection-check questions").
4. The lightest package that meets them (L4b, should, user round 1: "keep the skill light"; the user chose O13).

**Rejected (closest first):**
- O1a, a register of every candidate from any source: wider reach than L1b asks (user, round 2), a section, a
  template change and rules (L4b).
- O1s + O12 + O14 (P2's L1 part): a gate check, a merge rule and an extended bias extract, for what the script's rows
  and the summary-merge give (L4b).
- O6, a blind scorer agent: a new agent for L3, a could (L4b).
- O3c, the documented route in the generator brief: missed here by blind generators (L2).
- O2, O16 (new agents), O2b (anchored reader), O3b (tie-break), O4, O7, O8, O8b, O17 (L3 could), O9 (L7 won't),
  O10 (L4b), O11/O18 (the bias check's job), O15 (shows that, not why), O0 (L1b, L2).

**Known gaps:**
- Only worked-out generator options become rows; titles, search finds and the user's options rest on Phase 3's
  rules (L1b's reach, user's choice).
- Merges are still the researcher's edit; the bias check judges them but nothing forces a bad merge back.
- L3 rests on rejection-check questions, and that check is told the leader; H4-H6 broke written rules before (O6
  comes back if a run shows it).
- Many lightly scored rows may recreate H3; the log grows ~4-8k tok a round.
- The evidence is one fully analysed incident (skill-packaging); the replay can't run in the harness yet.
- Cost estimates are the generators' or mine, except the generators (61-65k, measured) and the row script
  (+1.2k tok per 16 rows, measured).

**Open child decisions:** the Verdict column out of `shared/log-template.md` (user, round 2); a problem-diagnosis
section in problem-formulation (U3, user, round 1).

**Plan:**
1. Install the draft in `~/Cboost/claude-skills` (one commit): `research/skills/design/SKILL.md`, `discovery.md`,
   `checks/bias.md`, `checks/rejection.md`, `scripts/add-candidates.py`, `README.md`.
   `feat: give every discovery option its own row, and look up the documented route`
2. After the next real run, ask the user what it showed: did a merge or drop get caught, how large the log grew;
   amend *Decision* or reopen a round.

Decision checklist:
- [x] Stop condition: no new requirements, no ranking change, nothing deciding left unverified (round 2's L1b narrows L1, verified by the user; no ranking change)
- [ ] Why and Rejected: each on a requirement the user confirmed; confirmed by the user
- [x] Known gaps and open child decisions: listed in *Decision*
- [x] Documentation: updated where the rule takes effect; overstated requirements corrected; commit message proposed (the rule takes effect in the skill itself; README drafted)
- [x] Out of scope: noted where open work is kept (`../TODO.md`)
- [x] Overview: choice, pros and cons, rejected, gaps, plan, files
- [ ] Review: in open chat; nothing implemented before it

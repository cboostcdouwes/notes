# Discovery merge losses: rounds

## Round 0 (problem formulation, 2026-10-31)
Read: SKILL.md, discovery.md, checks/*.md, shared/*.md, skill-packaging log and rounds, score.md, parent logs
`model-side-discovery.md` and `option-discovery.md`, TODO, handoff. Found: no rule says where generator reports go or
that each generator option is accounted for; checks read only the log extract.
Answers: scope merge loss (H1, H2), vendor's documented route, evaluation biases (H3-H6); caveats side by side not
here. Horizon: before the next real run. Values: run cost matters. Remark: "most of the requirements are mechanisms
in this formulation" (L1, L2 reworded as needs). Confirmed as written; L1 should; L5: "show a comparison along this
axis", not a cap. Remark: "the costs should all be considered and shown in the comparison to the user, this will be
for the explore/options split. There could probably be a diagnoses section." (U3, meaning to ask.)

Searches: none (reading only).

## Round 1
Discovery: two generators (far fields; own field: LLM agents and decision analysis), ~61K and ~65K tokens, ~1m45s
each; reports saved in `discovery-merge-losses.discovery/`. Design-space map, axes "what it acts on" (candidate
bookkeeping / candidate sources / ranking) × "who acts" (researcher rule / script / independent agent / user): the
cell script × ranking (a ranking-reason lint, W title) and user × candidates (two-pass review, W title) were filled
by titles already; no more generators (L5).
Vendor's documented route (L2 applied to this research): Anthropic's skill-authoring best practices: checklists,
feedback loops, "create verifiable intermediate outputs" validated by a script, "prefer scripts for deterministic
operations": became O1s.

Register of generator options:
- F1 → O1; F2 → O3, O3b; F3 → O4; F4 → O2; F5 → O5 (objection part → O8); F6 → O6; F7 → O7; F8 → O7 (effort and
  merit apart).
- W1 → O1; W2 → O3, O3b (Pugh datum → O4); W3 → O5; W4 → O6; W5 → O7; W6 → O9; W7 → O8; W8 → O10.
- Titles merged: double-entry reconciliation, chain of custody, MADR "rejected because", report generator coverage
  → O1; patent prior-art, outside view, second opinion → O3; jury instruction, immune negative selection,
  ranking-reason lint → O5; red team (both), premortem, devil's advocate → O11; show all, rank none → O9.
- Titles dropped: ballot rotation and randomised order (the matrix is scored per cell, the report already names
  leader and runner-up; order effects not seen in the misses); honeybee quorum and Delphi (several agents ranking:
  O6 covers it cheaper, L5); pre-registration and sealed bids (requirements are already fixed before options, Phase
  1); M&M conference (possibly U3: asked); pilot's checklist (the round checklist exists; O1s's gate is its check);
  pre-review self-audit (weak without outside feedback, per its own source; the bias check is outside); value-
  focused brainstorming per requirement (a generator lens, for discovery.md's lens list; not this problem); judge
  from another model family (not available in the harness); ask the user's expected answer first (puts discovery
  back on the user, the problem itself); two-pass review (L6, the split); stop rule on non-dominated options (with
  O9).

Searches: platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices (fetched). Generators' searches
in their reports.
- W3's "requirements no option was scored on, flagged": dropped; the Matrix has a column per requirement but the
  won'ts, so an unscored requirement is an empty column, visible already.

Bias check (round 1): L2 has no evidence of its own (the conventional answer was found, then lost: H1); L3
contradicted the tie-break rule (reworded); L1 should vs *Problem* "has to" (kept: user verified should); L5 counts
only added cost, not a loss's cost (added to *Situation*); estimates unsourced (marked). Mechanism wording in L4, L5
(kept: the user's words; the needs are "the core's rules get followed" and "the user chooses the trade-off"). O1s
alone would have passed the incident; O5/O7/O8 are researcher rules like O0's; O2b anchored in the rejection check;
O8 costly. Missing: no merge step (O13), a separate merger (O16), ask the user in problem formulation (dropped: puts
the answer back on the user), raw titles to the user (O15), the bias check reads the reports (O14), a merge rule
(O12), a manual replay of round 3's merge (open: the benchmark harness can't run it yet).
Rejection check (round 1): L5 stretched in O2, O6, O10, O11 (cost only breaks ties; cells now ✓, records say
tie-break); O2 not tied with O1s on L1 (any source; now O1a, W1 whole); W1's any-source scope lost at the merge
(O1a); W7's cheap form never compared (O8b); P's own agent costs counted against O2, O11; O3b without a record
(added); O9 cited L6 (now the user's scope decision); eight titles unaccounted for (they were in the register, which
its extract didn't hold: H2 reproduced; the draft gives the reader the register).
Ranking: P → P2.

## Replaced requirements (round 2)
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| L4 | The skill's core stays within its size budget | larger core, rules followed less | design doc, decided | L4b (round 2: "keep the skill light") |

## Round 2
Answers (round 1's questions): U3 is a problem diagnosis (for problem-formulation; out of scope, to the TODO); L2
should; L3 could, "only the rejection-check questions, no new Phase 4 rules"; remarks: "Remove the leader column
from the options table. O13 seems best; keep the skill light."
L4 replaced by L4b (few new rules or parts anywhere). Rescored: O13 ties P2's L1 part on L1 and leads on L4b. P3 =
O13 + O3 + O5. Redrafted; `add-candidates.py` run on a copy of this log (16 rows, +3.5 KB).
Pushback raised in the report: O13's log growth (rows and rejection records each round).

Searches: none this round (no new options category opened; Problem unchanged).
Bias check (round 2): the script skipped clashing IDs silently (any `| X |` row, also L1, O3) and took any line
starting with a letter and a digit: fixed, it now exits with an error on both. Merges sat in the Verdict column,
hidden from the bias check: moved to the summary, and the merged-row question from rejection.md to bias.md. Many
unscored rows may recreate H3 (harm). O3's lookup: once, in round 1 and when *Problem* changes (draft). New: O3c
(generator brief line; trails: this run's generators didn't find the vendor guide), O17 (equal evidence budget), O18
(simulated user review, merged into O11). L1's escape clause lets a raw list meet it (asked). L2 rests on one
incident that is really L1 (kept: the user's answer, round 1). Mechanism wording in L4b, L5 (kept: the user's words).
Rejection check (round 2): stale records against P2 (O13, O2, O16, O6 twice, O1a-O14 combined): rewritten against
P3, one per option. O2b's anchoring also hit P3's merged-row question (moved to the bias check). O10's L4b ✓ wrong
(✗); O9 out of scope by no requirement (L7 won't added); O6 rejected on L5 (now L4b); O4's Pugh variant (merged into
O3b); P3's L1 ✓ contradicted its harm (now ~); O5+O7+O8 L4b ✓ (now ~); O15's record cited *Problem* (now L1).

## Replaced requirements (round 3)
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| L1 | An option the research found reaches the user's comparison, or the user can see why it didn't | the user rediscovers an option the research had | TODO, user round 0 | L1b (round 3: worked-out options only; "or the user can see why" let a raw list meet it) |

## Round 3
Answers: L1 reach "worked-out options only"; reword L1 (L1b); "remove the leader column" means the Verdict column in
the shared template (a separate change, for the TODO); no remarks. Rescored: P3's L1b ✓; O1a and O2 exceed L1b's
reach and trail on L4b. No ranking change; decision drafted. README flowchart drafted and rendered (`mmdc`, no syntax
error).

Searches: none.

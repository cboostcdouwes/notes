# Option discovery

## Problem
The design-research skill must find the best option during the research, not leave it to the user's final review. In
the run on requirement reasons, the options × requirements matrix only came up at the Phase 6 review, though the
research had several hints to it. Constraint for any change: the skill grows only a little (user, 2026-10-24).

## Related decisions
- Parent: `requirement-reasons.md` (decided). Sibling: `skill-rule-following.md` (decided), `skill-and-log-size.md`
  (decided; sets the size warning at ~4,800 estimated tokens of SKILL.md body).

## Known so far
Hints the research missed (from `requirement-reasons.md`), the failures this problem was framed from:
- P1. In round 2 the researcher built an error × option table to evaluate the options: the tool used to evaluate was
  itself the option.
- P2. QOC (found in round 1) is built around an options × criteria assessment; only its fields were taken, not its
  form.
- P3. The skill already required "score each option ... as a table", but the log template had no place for it; the
  "do nothing" option meant "leave the text as is", not "carry out what's already written".
- P4. The independent check was asked for missing options but given the log's framing.

Held-out cases (options that came up at or after the review in the other runs; not used to build the options):
- H1. `skill-rule-following.md` round 7: at the review the user challenged O10's rejection; the variant O10b/O10c
  (workflow for the mechanical half only) came up then.
- H2. Same log, amended after review: the user saw the ticked checklist pasted at the end and it became Anthropic's
  open-item pattern; then "keep only the current round's checklist" after the user saw the per-round cost.
- H3. `skill-and-log-size.md`, after step 1: the user rolled `questions.md` and `options.md` back into SKILL.md
  (needed every round) and transposed the matrix, both after seeing the result.
Common to P1-P3 and H1-H3: the option turned up when someone saw the concrete thing (the table built, the decision
overview, the implemented files), not its description in a round report.

## Success criteria
- Judged by the user: replaying P1-P4 and H1-H3 against the changed skill, how many would have come up before the
  Phase 6 review. H1-H3 count more (the options weren't built from them).
- Judged by the user in the next real run: an option changes the leader in a round, not at the review.
- SKILL.md body stays under the 4,800-token warning; how much it may grow: D1.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Status |
|---|---|---|---|---|
| D1b | SKILL.md may grow up to the size warning (~4,800 estimated tokens; ~2,000 characters of room) | a bigger always-loaded skill is followed worse and costs more (Z8a, Z8b of `skill-and-log-size.md`); "this should be the final refinement" | user, round 1 (replaces D1) | preference |
| D6 | The draft of the leader is, where it makes sense, a throwaway variant of the real artifact (most often code), not a description in the log | the skill is mostly used for programming; the concrete thing is what shows the missing option | user, round 1 | preference |
| D7 | The wording stays generic enough for other fields (CAD, electrical engineering) | the skill should apply beyond programming | user, round 1 ("if possible") | preference |
| D8 | H2/H3 (options found from using the result) are in scope | the research should catch them, not the use after implementation | user, round 1 | preference |
| D2 | No extra agent or extra waiting per round | rounds stay fast; extra agents cost tokens | `skill-and-log-size.md` Z5, `skill-rule-following.md` S11 (preferences) | preference |
| D3 | Everything stays inside the skill folder | sharable later | `skill-rule-following.md` S1c | preference |
| D4 | The bias check isn't told the leading option | the main agent's bias reaches the check | `skill-and-log-size.md` Z9b | preference |
| D5 | The round report in the chat stays short | tables stay in the log; the user reads the report each round | `skill-rule-following.md` S4; SKILL.md Phase 5 | preference (amount for this change not asked) |

## Options
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O1 | Do nothing: the matrix is in the skill now (Phase 4 step 1), the rejection check and best-variant field exist | D1-D5; P1, H1 partly | H2, H3 not covered | cheap | trailing (criteria) |
| O1b | Carry out what's written in full: no text change; P3's "score as a table" was a rule not followed | D1-D5 | relies on rule following (sibling decision's gate covers only checklist lines) | cheap | trailing (criteria) |
| O2 | Phase 3 "always cover" gains three bullets: the current rules applied in full; found methods' main artifact, not only their fields; your own evaluation tools | P1-P3 | ~350 characters; fitted to P1-P3 (overfit risk); H not covered | cheap | trailing (criteria) |
| O2b | Same three, folded into existing bullets | P1-P3; less growth | ~200 characters; same overfit risk | cheap | add-on (to the leader) |
| O3 | Bias check generates options from *Problem* and *Requirements* before reading *Options* (`checks/bias.md`; extract puts *Options* last) | P4; no SKILL.md growth | soft: the check reads the whole extract | cheap | add-on |
| O3b | Bias extract drops *Options*; the check proposes options blind | P4, harder | loses the "assumptions behind the strongest options" job (no requirement covers it: tiebreak) | cheap | add-on candidate (vs O3) |
| O3c | A third, option-only check | P4 | an extra agent per round | cheap | trailing (D2) |
| O4 | Round report shows a few-line sketch of the leading option | P1-P3, H2 partly | longer reports; a sketch is still a description (H3 needed real files) | cheap | trailing (D5 ~, absorbed by O7) |
| O5 | Morphological box: Phase 3 lists the design's dimensions (form, place, who acts, when) and tries a few values for each | P2, P3, H3 partly; D7 (known method in mechanical and electrical design) | ~170 characters | cheap | add-on (in the draft; to confirm) |
| O6 | Ask the user early for the shape they expect | P1-P3 if the user thinks of it | hands discovery to the user | cheap | trailing (criteria) |
| O7 | Phase 4 step 4: draft the leader as the thing itself, outside the project (a throwaway variant of the real artifact, or its exact wording), judge the draft; the report gives it to the user to look at | P1 (the table is drafted), H2, H3 partly; D6, D7 | ~400 characters (with the report and checklist lines); a redraft per leader change, costly for non-text artifacts (go-ahead rule) | cheap | leading |
| O8 | Rejection check proposes the best variant of each trailing option (`checks/rejection.md` only) | H1 (the only option covering it); no SKILL.md growth | the record already has a best-variant field (possibly a follow-through gap) | cheap | add-on candidate (user didn't select it, round 1; no requirement against it; asked round 2) |
| O9 | Show the Phase 6 overview as a draft once the ranking is stable, before the stop condition | H2, H3 (the user reviews earlier) | an extra overview the user reads; overlaps O7; describes, doesn't build (D6 ✗) | cheap | runner-up |
| O10 | Pre-mortem in the stress test: "if the user rejects the leader at review, why?" | H1-H3 partly | ~60 characters; a self-question the agent may answer shallowly | cheap | add-on candidate |
| O11 | Running cost per round as a column in *Options* | H2 | template change; narrow (one case) | cheap | trailing (criteria: one case) |

## Matrix
Round 1 matrix, kept for history of cells; D1 is replaced by D1b (every option fits: all ✓). D6-D8 per option in
*Evaluation*: O7 is the only option meeting D6; O3, O2b, O5, O10 are ✓ on D7; O1, O1b alone ✗ on D8 (add-ons don't need to meet D8 alone). O7 is ~ on D5 (one more item in the report).
| Option | D1 | D2 | D3 | D4 | D5 | P1-P4 | H1-H3 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|
| *status* | unverified | preference | preference | preference | preference | criterion | criterion | |
| O1 | ✓ | ✓ | ✓ | ✓ | ✓ | ~ P1 | ~ H1 | ~ P, H |
| O1b | ✓ | ✓ | ✓ | ✓ | ✓ | ~ P1, P3 | ~ H1 | ~ P, H |
| O2 | ? | ✓ | ✓ | ✓ | ✓ | ✓ P1-P3 | ✗ | ✗ H |
| O2b | ? | ✓ | ✓ | ✓ | ✓ | ✓ P1-P3 | ✗ | ✗ H |
| O3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ P4 | ? | ? H |
| O3b | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ P4 | ? | ? H |
| O3c | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ P4 | ? | ✗ D2 |
| O4 | ? | ✓ | ✓ | ✓ | ~ | ~ P1-P3 | ~ H2 | ~ D5, P, H |
| O5 | ? | ✓ | ✓ | ✓ | ✓ | ~ P2, P3 | ~ H3 | ~ P, H |
| O6 | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✗ | ✗ H |
| O7 | ? | ✓ | ✓ | ✓ | ✓ | ~ P1 (P2, P3 via O2b) | ~ H2, H3 | ~ P, H |
| O8 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ~ H1 | ✗ P |
| O9 | ? | ✓ | ✓ | ✓ | ~ | ~ | ~ H2, H3 | ~ D5, P, H |
| O10 | ? | ✓ | ✓ | ✓ | ✓ | ? | ~ H1-H3 | ? P, ~ H |
| O11 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ~ H2 | ✗ P |

## Evaluation
Round 2 draft of the leader (O7 + O2b + O3 + O5 + O10), as the exact text; applied to a scratch copy of SKILL.md
(`<scratchpad>/skill-draft/SKILL.md`) to measure it:
- Intro, line 20: "Throwaway spikes outside the project are fine (*Phase 4*)." → "Throwaway spikes and drafts
  outside the project are fine (*Phase 4*)."
- Phase 3 bullets:
  - "**Do nothing / change the process**: the need may go away, a doc may solve it, or what is already written,
    carried out in full."
  - "**How others solved it**: the form of their main artifact (a table, a template, a layout), not only its parts,
    and each approach's known pitfalls."
  - "**The standard library**, and **what the project already has**, including the tables and tools you built to judge
    the options: reuse beats a new concept to learn."
  - new: "**Every dimension varied**: name the design's dimensions (its form, where it lives, who or what acts, when)
    and vary each one."
- Phase 4 step 4: "Stress-test the leader." → "Draft the leader as the thing itself, outside the project: a throwaway
  variant of the real artifact (code, a model, a schematic), or its exact wording when it is text. Judge and
  stress-test the draft, not its description; ask why the user would reject it once in use. Redraft when the leader
  changes; a costly draft follows step 6."
- Phase 5 report, item 2: "**Recommendation** with its strongest reason, reversibility and where its draft is; ..."
- Round checklist: "- [ ] Stress test: of the leading option" → "- [ ] Draft and stress test: of the leading option;
  the draft's path in the report"
- `checks/bias.md`, before "Answer briefly": "Before reading *Options*, list the options you would consider from
  *Problem* and *Requirements* alone; then compare."
Scoring the draft against D6-D8: D6 ✓ (a throwaway variant of the real artifact; text drafted as text); D7 ✓ (code,
model, schematic; no programming-only words but "code"); D8 ~ (H2: a draft of the checklist rule shows the ticked
copy at the end ✓; H3: a draft of the split shows `questions.md` and `options.md`, read every round, ~ only if "once
in use" is asked).

Scope doubt (bias check): H2 and H3 came after implementation, from the user using the result. That may be normal
review feedback no research reaches; then only P1-P4 and H1 are in scope, and the problem should say so (asked). The
shared cause "the option shows when the concrete thing is seen" is my inference from seven cases, not confirmed.
Whether H1 happened with the best-variant field already in the skill is unverified (both edits 2026-10-24, order not
recorded).

Rejection records (no requirement fails outright for any option but O3c; all others trail on the success criteria,
compared with O7):
- O1, O1b: ✓ on every requirement but D8 (preference, user round 1); "relies on rule following" is O7's cost too and
  doesn't count. Trailing on D8 only.
- O9, runner-up: ✗ on D6 (preference): it describes the result, doesn't build it; and the user reviews an overview
  either way at Phase 6.
- O2 vs O2b: the overfit risk is shared; ~150 characters within D1b's room is a tiebreak, said as such.
- O3c (D2, preference): an extra agent per round; O3/O3b give the same cover in the existing check.
- O4: O7 does the same in the log, at full detail, without growing the report (D5); O4's ~ D5 is not shared by O7.
- O6, O11: no requirement fails; tiebreaks only (O6 hands discovery to the user; O11 covers one case).
Harms (O7): drafting each round wastes work while the leader changes (a draft is a few lines to a table; drafted only
for the leader); a draft anchors the researcher on the leader (the bias check doesn't see it if it sits in
*Evaluation*? it does see *Options*; keep the draft in *Evaluation*, which the bias extract drops).
Stress test (O7): P1: the researcher built the error × option table and didn't see it as the option; a rule to draft
the leader's form would have put the table next to "what form does the log take" (~). H3: a draft of A3 lists the
files moved out: `questions.md` and `options.md` read every round would show (likely caught by the researcher if it
also checks "read when?"; ~). H2: a draft of the checklist rule shows the ticked copy pasted at the end (~). H1: not
covered (O8's job).
Reversibility: every option cheap (skill text).

## Open questions
1. O8 not kept: why (it covers H1, which nothing else does, at no SKILL.md cost).
2. O5 (dimensions varied): in or out.
3. The draft's wording.

## Sources
| Claim | Source (URL or `file:line`) | Date | Reliability |
|---|---|---|---|
| Morphological analysis lists options per dimension and combines them; a morphological chart reduced fixation in AI-assisted ideation | https://arxiv.org/pdf/1201.1712; abstract on https://tehran.academia.edu/yazdanpargoshaei | 2026-10-24 | survey: good; reduction claim: abstract only, unverified |
| LLM design agents fixate on established approaches; human oversight at key decisions recommended | https://arxiv.org/pdf/2603.24768, https://www.arxiv.org/pdf/2404.18479 | 2026-10-24 | preprints, abstracts read |
| SKILL.md body 11,809 characters, ~4,070 tokens est. | measured, `python3` on SKILL.md | 2026-10-24 | measured |

## Round checklist
Checklist:
- [x] Log (first round): its path in the report; new or resumed, and what was outdated
- [x] Problem and success criteria (first round): stated without solution words
- [x] Scope: split, widened or unchanged (unchanged; D8 widens the target, not the topic)
- [x] Requirements: new or changed ones, each with reason, source and status (D1b, D6, D7, D8)
- [x] Replaced requirements: new IDs, old rows moved; options re-checked from the old matrix column (D1 -> D1b; D1 column was ? for all, nothing to re-check)
- [x] Written requirements: evidence found for each (commit, decision log) (n/a: none new)
- [x] Deciding unverified requirements: asked this round, or assumptions after "can't answer" (none left unverified)
- [x] Options: added, by the categories of Phase 3 (O5 back)
- [x] Searches: recorded in the round's entry; or "no web search", said in the report (no web search; said in the report)
- [x] Deciding claims: cross-checked against a second source, or marked unverified (n/a: none new)
- [x] Matrix: updated (D6-D8 scored in Evaluation)
- [x] Rejection records: one per trailing or not applicable option (scenario, best variant, leader's cells compared) (O8 updated)
- [x] Harms: scenarios for the leading option
- [x] Reversibility: every option rated; one-way means extra stress-testing, said in the report
- [x] Stress test: of the leading option (of the draft)
- [x] Bias check: findings in the log and the report; or "not independent" (wording fixed in the draft; D8 at most partial for a throwaway draft)
- [x] Rejection check: findings in the log and the report; verdicts corrected (O8, O9 records; shared costs removed; O7 cost ~400)
- [x] Ranking change: recorded (none; O8 back)
- [x] Report: what changed, recommendation, runner-up, core rejections, the checks' findings
- [x] Questions: deciding unverified ones first, ordered by ranking impact, through the question tool, remarks last
- [x] Pushback: if the user picked a worse option, asked what makes it better (O8 asked)

## Rounds
- Round 1: framed with held-out cases H1-H3; after the checks leading O7 (draft the leader in the log), runner-up O9; add-ons O2b, O3, O8.
- Round 2: D1b, D6-D8 from answers; O7 redrafted as a throwaway variant of the real artifact, the draft given to the user; O5 in; O8 back as candidate (asked); runner-up O9. Draft: `<scratchpad>/skill-draft/` (~4,360 tokens est.).

## Decision

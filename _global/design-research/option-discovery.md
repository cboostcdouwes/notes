# Option discovery

## Problem
The design-research skill must find the best option during the research, not leave it to the user's final review. In
the run on requirement reasons, the options × requirements matrix only came up at the Phase 6 review, though the
research had several hints to it. Constraint for any change: the skill grows only a little (user, 2026-10-24).

## Related decisions
- Child (open): `model-side-discovery.md` (D10).
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
| D8 | H2/H3 (options found from using the result) are in scope | the research should catch them, not the use after implementation | user, round 1; round 2: a partial cover is not enough, look further | preference |
| D9 | The rejection check stays focused on correcting wrongly filled information; finding options (variants included) is the bias check's job | each check's brief stays focused | user, round 2 | preference |
| D10 | The model does the out-of-the-box discovery itself; presenting options to the user must not be what finds the better one | that discovery is what the skill is for; delegating it to the user leaves the legwork with them | user, review 2026-10-24 | preference (strength not asked; stated as the skill's purpose) |
| D7b | The wording isn't shaped by the trial runs (tables, text, markdown); it fits programming first, other fields too | the skill is used mostly for programming problems, also other fields | user, round 2 (sharpens D7) | preference |
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
| O5 | Morphological box: dimensions (what it is made of, where it lives, who or what acts on it, when), other values for each; merged into the existing "radically different framings" bullet, whose examples are such values | P2, P3, H3 partly; D7 | ~120 characters | cheap | add-on (in the draft) |
| O6 | Ask the user early for the shape they expect | P1-P3 if the user thinks of it | hands discovery to the user | cheap | trailing (criteria) |
| O7 | Phase 4 step 4: draft the leader as the thing itself, outside the project (a throwaway variant of the real artifact, or its exact wording), judge the draft; the report gives it to the user to look at | ~ P1 (the table is drafted), H2, H3 partly; D6, D7 | ~400 characters (with the report and checklist lines); a redraft per leader change, costly for non-text artifacts (go-ahead rule) | cheap | leading |
| O8 | Rejection check proposes the best variant of each trailing option (`checks/rejection.md` only) | H1; no SKILL.md growth | widens the rejection check's job | cheap | trailing (D9) |
| O12 | In the draft step: put the draft through its real use, as often and at the scale it will meet, and note what each use costs | H2 (the checklist pasted every round shows its per-round cost), H3 (a round run with the split reads `questions.md` and `options.md` every time); D7b | ~110 characters; a walkthrough per leader | cheap | leading (part of O7) |
| O13 | `decision.md`: the plan ends with a step of its own: once the first step is in use, ask the user what using it showed; amend or reopen (the plan carries the trigger, since nothing loads the skill after the research) | H2, H3 where a walkthrough misses them; no SKILL.md growth | catches them after implementation, not before (D8 ~) | cheap | add-on |
| O14 | Draft the runner-up too when it is close to the leader | H1 partly (anchoring on the leader); a better trailing variant gets judged concretely | a second draft per round when close (D2 ~) | cheap | add-on (user, round 3) |
| O9 | Show the Phase 6 overview as a draft once the ranking is stable, before the stop condition | H2, H3 (the user reviews earlier) | an extra overview the user reads; overlaps O7's draft shown each round | cheap | runner-up (tiebreak: overlap) |
| O10 | Pre-mortem in the stress test: "if the user rejects the leader at review, why?" | H1-H3 partly | ~60 characters; a self-question the agent may answer shallowly | cheap | add-on candidate |
| O11 | Running cost per round as a column in *Options* | H2 | template change; narrow (one case); O12's "note what each use costs" covers it | cheap | trailing (absorbed by O12) |

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
| O7 | ? | ~ (redraft time) | ✓ | ✓ | ~ | ~ P1 (P2, P3 via O2b) | ~ H2, H3 | ~ D2, D5, P, H |
| O12 | ? | ~ (walkthrough time) | ✓ | ✓ | ✓ | ✗ | ? H2, H3 (asked: D8) | ~ D2, ? H |
| O13 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ~ H2, H3 (after use) | ~ H |
| O8 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ~ H1 | ✗ P |
| O9 | ? | ✓ | ✓ | ✓ | ~ | ~ | ~ H2, H3 | ~ D5, P, H |
| O10 | ? | ✓ | ✓ | ✓ | ✓ | ? | ~ H1-H3 | ? P, ~ H |
| O11 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ~ H2 | ✗ P |

## Evaluation
Round 2 draft of the leader (superseded by the round 3 draft in `<scratchpad>/skill-draft/`; changes in the rounds file) (O7 + O2b + O3 + O5 + O10), as the exact text; applied to a scratch copy of SKILL.md
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

Tension: O7 and O12 cost time each round (D2 ~, preference); for non-text artifacts a costly redraft asks for a go-ahead each time the leader changes. Not ranked against them: no other option covers H2/H3 before use.
H1 doesn't fit the shared cause (it came from a challenged rejection, not from seeing a draft); and H1-H3 are no longer held out (O12 was built with them in view): only the next real run is a clean test.
Rejection records (no requirement fails outright for any option but O3c (D2, a preference from other logs, not confirmed here); all others trail on the success criteria,
compared with O7):
- O1, O1b: ✓ on every requirement but D8 (preference, user round 1); "relies on rule following" is O7's cost too and
  doesn't count. Trailing on D8 only.
- O9, runner-up: ✗ on D6 (preference): it describes the result, doesn't build it; and the user reviews an overview
  either way at Phase 6.
- O2 vs O2b: the overfit risk is shared; ~150 characters within D1b's room is a tiebreak, said as such.
- O3c (D2, preference): an extra agent per round; O3/O3b give the same cover in the existing check.
- O4: trailing on D6 (preference): a sketch is still a description (H3 needed the real use); the D5 cost is shared with O7.
- O3b vs O3: O3b loses the bias check's "assumptions behind the strongest options" job; no requirement covers it, so a tiebreak, said as such.
- O9: the D6 citation was stretched (D6 is about how the leader's draft is made); O9 trails only on overlap with O7's draft shown each round (tiebreak).
- O8, trailing (D9, preference, user round 2): it would widen the rejection check; the bias check's "missing options" covers variants. H1 rests on the bias check (known gap if it misses).
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
None deciding. Remark (round 3): does step 6 (spikes) still need to exist next to step 4? Answered in the overview.

## Sources
| Claim | Source (URL or `file:line`) | Date | Reliability |
|---|---|---|---|
| Morphological analysis lists options per dimension and combines them; a morphological chart reduced fixation in AI-assisted ideation | https://arxiv.org/pdf/1201.1712; abstract on https://tehran.academia.edu/yazdanpargoshaei | 2026-10-24 | survey: good; reduction claim: abstract only, unverified |
| LLM design agents fixate on established approaches; human oversight at key decisions recommended | https://arxiv.org/pdf/2603.24768, https://www.arxiv.org/pdf/2404.18479 | 2026-10-24 | preprints, abstracts read |
| SKILL.md body 11,809 characters, ~4,070 tokens est. | measured, `python3` on SKILL.md | 2026-10-24 | measured |

## Round checklist
Checklist:
- [x] Log (first round): its path in the report; new or resumed, and what was outdated (n/a)
- [x] Problem and success criteria (first round): stated without solution words (n/a)
- [x] Scope: split, widened or unchanged (unchanged)
- [x] Requirements: new or changed ones, each with reason, source and status (D9, D7b)
- [x] Replaced requirements: new IDs, old rows moved; options re-checked from the old matrix column (n/a: D7b sharpens D7, same meaning)
- [x] Written requirements: evidence found for each (commit, decision log) (n/a)
- [x] Deciding unverified requirements: asked this round, or assumptions after "can't answer" (none)
- [x] Options: added, by the categories of Phase 3 (O12, O13; O5 merged)
- [x] Searches: recorded in the round's entry; or "no web search", said in the report (no web search)
- [x] Deciding claims: cross-checked against a second source, or marked unverified (n/a)
- [x] Matrix: updated (verdicts in Options; matrix unchanged in structure)
- [x] Rejection records: one per trailing or not applicable option (scenario, best variant, leader's cells compared) (O8 on D9)
- [x] Harms: scenarios for the leading option (O12: a walkthrough per leader costs time; covered by the go-ahead rule)
- [x] Reversibility: every option rated; one-way means extra stress-testing, said in the report (all cheap)
- [x] Stress test: of the leading option (O12 replayed on H2, H3)
- [x] Bias check: findings in the log and the report; or "not independent" (premise and held-out caveats recorded; step 4 split; O14)
- [x] Rejection check: findings in the log and the report; verdicts corrected (O4, O9, O3b records; matrix rows O12, O13; O7 D5 ~)
- [x] Ranking change: recorded (none; O14 candidate)
- [x] Report: what changed, recommendation, runner-up, core rejections, the checks' findings
- [x] Questions: deciding unverified ones first, ordered by ranking impact, through the question tool, remarks last
- [x] Pushback: if the user picked a worse option, asked what makes it better (n/a)

## Rounds
- Round 1: framed with held-out cases H1-H3; after the checks leading O7 (draft the leader in the log), runner-up O9; add-ons O2b, O3, O8.
- Round 2: D1b, D6-D8 from answers; O7 redrafted as a throwaway variant of the real artifact, the draft given to the user; O5 in; O8 back as candidate (asked); runner-up O9. Draft: `<scratchpad>/skill-draft/` (~4,360 tokens est.).
- Round 3: D9 (O8 trails), D7b (wording broadened); O12 (use the draft as often and at scale) joins the leader for H2/H3; O13 add-on; O5 merged into "radically different framings". ~4,390 tokens est.
- Round 3 (after the checks): step 4 split into a list, keeps "stress-test"; O13 triggered from the plan; O14 new; O9 record corrected; matrix rows O12, O13.
- Round 4: answers: wording as drafted, O14 in, O12 enough for H2/H3. No new requirement, no ranking change: stop condition met. Decision drafted.

## Decision
Reviewed by the user, 2026-10-24 (*Why* corrected: options turned up when presented to the user, so discovery was
delegated to the user; D10 and its gap added; the choice kept "for now"). Step 6 tightened at the review ("claims
about any option"; user). Installed 2026-10-25: SKILL.md, `checks/bias.md`, `decision.md`; ~4,420 tokens est.; backup
of the old skill in the session scratchpad (`design-research-before-option-discovery/`). Child: `model-side-discovery.md`
(open).
**Choice:** O7 + O12 + O14, with O2b, O3, O5, O10, O13 (the draft in `<scratchpad>/skill-draft/`, ~4,420 tokens est.):
1. Phase 4 step 4: stress-test the leader, and the runner-up when close, on a draft of the thing itself (a throwaway
   variant of the real artifact outside the project, or its exact wording), put through its real use as often and at
   the scale it will meet, noting each use's cost; ask why the user would reject it once in use; redraft when the
   leader changes. The report gives the draft to the user; the checklist line follows; step 6 covers a costly draft.
2. Phase 3: "do nothing" includes the written rules and plans followed in full; others' solutions taken whole; what
   you built to judge the options may be the option; "radically different framings" varies the design's dimensions.
3. `checks/bias.md`: list options from *Problem* and *Requirements* before reading *Options*.
4. `decision.md`: the plan ends with a step asking what using the first step showed.

**Why:**
1. An improvement for now, not the fix (user, review): the options turned up when the current options were presented
   to the user, so out-of-the-box thinking was delegated to the user (D10). The draft lets the user see the real shape
   every round instead of only at review: D6, D8 (preferences, user rounds 1-2); O12 enough for H2/H3 (user, round 3).
2. The wording fits programming first and other fields too: D7, D7b (preferences, user rounds 1-2); confirmed as
   drafted (user, round 3).
3. Growth up to the warning is allowed: D1b (preference, user round 1).

**Rejected (closest first):**
- O9, an early decision overview: overlaps the draft shown each round (tiebreak).
- O8, variants from the rejection check: D9 (user, round 2).
- O4, a sketch in the report: still a description (D6).
- O1/O1b, do nothing / follow what's written: H2, H3 not covered (D8).
- O3b (blind bias check): loses the assumptions job (tiebreak); O3c: an extra agent (D2); O6, O11: tiebreaks.

**Known gaps:**
- D10 not met: the user still does the discovery legwork, now each round instead of at the review. Open child
  decision: how the model itself finds the options the user found (user, review).
- H1-H3 are no longer held out; only the next real run tests the change.
- H1 (a better variant of a trailing option) rests on the bias check and O14.
- A costly redraft (code, CAD, hardware) asks for a go-ahead each time the leader changes.
- The shared cause ("seen and used") is an inference from seven cases.

**Decision checklist:**
- [x] Stop condition: no new requirements, no ranking change, nothing deciding left unverified
- [x] Why and Rejected: each on a requirement the user confirmed; confirmed by the user
- [x] Known gaps and open child decisions: listed in *Decision* (child: D10, model-side discovery)
- [x] Documentation: updated where the rule takes effect; overstated requirements corrected; commit message proposed (the rule takes effect in the skill itself; no git there)
- [x] Success criteria: carried over only as project rules (none carried over)
- [x] Out of scope: noted where open work is kept (`~/Cboost/Notes/_global/TODO.md`)
- [x] Overview: choice, pros and cons, rejected, gaps, plan, files
- [x] Review: in open chat; nothing implemented before it

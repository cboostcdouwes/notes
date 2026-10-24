# Requirement reasons

## Problem
In a design-research run, every requirement carries a reason, and every option ruled out or weighed down carries a
reason that cites requirements. When a reason is wrong, half thought through, or never really checked with the user,
an option drops off the table and stays off, unnoticed. The skill must record requirements and their reasons in a way
that makes a weak reason visible, gets it checked with the user before it decides anything, and brings an option back
when a reason it was rejected for falls.

## Related decisions
- Children (open): `option-discovery.md` (how the matrix could have come from the research, not the review);
  `skill-rule-following.md` (checklists, greppable step format).
- Test run that showed the problem: `~/Cboost/Notes/_global/design-research/research-log-location.md` (decided).
- Skill: `~/.claude/skills/design-research/SKILL.md` (not under version control; last edited 2026-10-24 01:26, after
  the test run's last log write at 00:34, so some fixes from that run may already be in it).

## Success criteria
- Judged by the user: replaying the test run's errors against the new skill text, each would have been caught before
  it ruled out an option (see *Evidence from the test run*).
- Judged by the user: the log stays readable enough to resume; the reason fields don't make it a chore to keep up.
- Not measurable as a number; don't invent one.

## Evidence from the test run (research-log-location.md)
| # | What happened | Round | Caught in | Kind of error |
|---|---|---|---|---|
| E1 | R2 recorded as "No gitignored folder has to be set up in every repo", status unverified with three guessed reasons ("the setup step, the clutter, or the risk of forgetting?"). A and N were weighed out on "R2 fails". The real reason (round 6): an in-repo option needs the repo's own `.gitignore`, which may be tracked and shared. | 1-6 | round 6 | Requirement written as a solution constraint; reason guessed by Claude, never asked in the user's words until late |
| E2 | B weighed out "against R3 on machines without the ignore line, since their failure mode is a commit". R3 is core, but the scenario (a machine without setup) had been accepted by R16 (preference, round 3: "one-time setup per machine is acceptable"). (R7 in round 4 only meant "notes don't sync"; its "new machines rare" wording came in round 6.) | 4 | round 6 | Rejection chain not checked against the other requirements: core requirement + a scenario another answer had accepted |
| E3 | R2 changed meaning between rounds ("no per-repo setup" -> "no recurring setup", round 5 -> "needs the repo's own `.gitignore`", round 6) while keeping one row and one ID; rejections citing "R2" kept pointing at whichever meaning was current. | 5-6 | partly | A requirement's wording drifted under a stable ID; rejections not re-checked |
| E4 | Reasons lived inside the *Requirement* text (R3: "...: private or half-baked content...") or in the *Status* cell, or nowhere (R1, R11, R13). The table has no reason field, so a missing reason didn't show. | all | not caught | Table shape: no place for a reason, so its absence is invisible |
| E5 | P and I rejected because "the link/symlink needs ignoring per repo (R2)", while the chosen T itself needs a per-repo `CLAUDE.local.md` and R2 was relaxed in round 5. Never re-run. | 5-6 | not caught | Rejection costs not compared with the leader's own costs; stale after a status change |
| E6 | M rejected as "outside R3's control", but R3 is about repo commits; C rejected as "hidden (R1)", but what is hidden is the exclude entry, not the notes. | 6 | not caught | Requirement stretched past its scope |
| E7 | U decided by R15 (unverified), Q by R12 (unverified) at decision time. | 6 | not caught | Existing rule ("verify every unverified") not enforced |
| E8 | S rejected on one variant (printing the instructions into context; size cap). A variant printing only the path has no cap. | 4-5 | not caught | Option rejected on a variant |

What caught E1 and E2 was the Phase 6 review of *Why* and *Rejected* with the user: the first time the user saw the
rejection reasons. E5-E8 are from the independent check of round 1 (verified against the log: R16 round 3, R2 relaxed
round 5, P/I/M/C/U/Q/S rejection texts). To verify with the user: which of these they saw.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Status |
|---|---|---|---|---|
| Q1 | The skill stays general and sharable: no dependency on the user's setup | Others may use it | memory `design-research-skill.md` (user, 2026-10-23) | preference (stated before; not re-checked) |
| Q2 | A weak or missing reason is visible in the log, not hidden in prose | E4: a missing reason went unnoticed | inferred from E4 | unverified |
| Q3 | A rejection names the requirement *and* the concrete scenario in which the option fails it, and that scenario is checked against the other requirements | E2 | inferred from E2 | unverified |
| Q4 | Reasons are in the user's words (or marked as Claude's inference) | E1: a guessed reason stood in for the real one for five rounds | inferred from E1 | unverified |
| Q5 | When a requirement's meaning or status changes, every rejection that cites it is re-checked | E3 | inferred from E3; partly in the skill already (Phase 4 step 1: "comes straight back") | unverified |
| Q6 | Requirements are stated as needs, not as solution constraints ("no gitignored folder" is a solution shape; "don't touch files the team shares" is the need) | E1 | inferred from E1 | unverified |
| Q7 | The extra bookkeeping stays light enough to keep up across many rounds | QOC/IBIS literature: full rationale capture often fails on maintenance effort | inferred; source: design-rationale literature | unverified |
| Q8 | The log is mostly for later sessions, so it may be verbose | — | skill text (Claude-written); user, round 2 | preference (reason not asked) |
| Q9 | All of E1-E8 are real errors the fix must address | each one wrongly removed or weakened an option | user, round 2 | confirmed (status of each fix still open) |
| Q10 | Round reports list the rejections that rest on core requirements; other rejections only in the log | not asked (inferred: keeps reports short) | user, round 2 | preference (reason inferred) |
| Q11 | Gate: only a confirmed core requirement removes an option; anything weaker only ranks it lower | not asked (inferred: an unverified reason can't silently remove an option, E7) | user, round 2; reason confirmed round 3 | preference |
| Q13 | Rejections are checked every round by a separate agent (O17), not inside the bias check | each brief stays focused | user, round 3 | preference |
| Q14 | An unverified requirement that affects the ranking is asked again every round until answered or the user says they can't; then it is an assumption in known gaps (O18) | E1 | user, round 3 | preference |
| Q12 | Don't name a "main fix" before the options are evaluated; let it follow from the evaluation | a premature framing biases the ranking | user, round 2 (remark on the round 1 report) | preference |

## Options
| Option | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O1 | Do nothing: the skill already says "ask what would go wrong without it" (Phase 2) and "each reason must rest on a confirmed requirement" (Phase 6) | Q1, Q7 | E2/E4 not covered: the table still has no reason field, and Phase 6 checks reasons only at the end, after options are gone | cheap | weighed out (unless the post-run edits already cover it) |
| O2 | Reason column in the requirements table: "what breaks without it", as a concrete scenario (Volere's *rationale* field) | Q2, Q4 (if quoted), Q6 partly (writing the rationale surfaces the real intent, per Volere) | One more column; wide tables | cheap | leading (part of the combination) |
| O3 | Fit criterion per requirement (Volere): how to tell whether an option meets it | Makes "fails R2" checkable | Many design needs have no measurable test; the skill already warns against invented metrics | cheap | runner-up add-on |
| O4 | Rejection records: each "weighed out / not applicable" cell gives option x requirement x failure scenario, and the scenario is checked against the other requirements' statuses (QOC assessments; QOC-E adds evidence) | Q3, Q5 (a rejection lists what it rests on) | Longer *Verdict* cells, or a separate rejections table | cheap | leading (part of the combination) |
| O5 | Toulmin per requirement: claim, grounds, warrant, qualifier, rebuttal ("holds unless ...") | Q2, Q3 via the rebuttal | Heavy (5 fields per requirement); Q7 | cheap | weighed out on Q7 (pending check) |
| O6 | Goal ladder (goal-oriented RE, "5 whys"): ask "why" until the requirement is a need, not a solution shape; record the parent need | Q6, E1 | One more question per requirement; can over-abstract | cheap | candidate (as a rule in Phase 2, not a table field) |
| O7 | Requirements written as scenarios (ATAM quality-attribute scenarios: stimulus, environment, response) | Q3, Q6 | Awkward for preferences ("Obsidian is fine"); a format shift | cheap | candidate |
| O8 | Process only: the independent check gets a new job, "steelman every rejected option and attack its rejection reason" | Q3, catches E2-type chains | No change to the log shape; E4 stays invisible | cheap | add-on (cheap, fits the existing Phase 4 step 5) |
| O9 | Kepner-Tregoe musts/wants with a validity test for musts: "would you reject an otherwise perfect option that fails this?" | Sharpens core vs preference | Overlaps with core/preference statuses already in the skill | cheap | add-on (one question) |
| O10 | Separate reasons table (IBIS-like graph): reasons have IDs, requirements and rejections cite them | Q5 fully (a fallen reason lists everything resting on it) | Heaviest; an extra concept; Q7 | cheap | weighed out on Q7 (pending check) |
| O11 | New ID when a requirement's meaning changes (R2 -> R2b, old one *rejected* or *replaced*), never reword in place | Q5, E3 | Slightly more rows | cheap | add-on |
| O12 | Every round report lists every option that left the table or dropped in rank that round, with the reason and the requirement (and its status) it rests on, for the user to contest; not only at Phase 6 | E1, E2, E5, E6 (the user is the one who caught errors in the test run) | Longer reports; user attention | cheap | leading (independent check) |
| O13 | Gate: an option leaves the table only on a core requirement the user confirmed; a reason resting on a preference or unverified requirement only ranks it lower, and it stays in the comparison | E2, E7; makes "not verified" cost something | More options stay live; longer evaluation | cheap | leading (independent check) |
| O14 | Consistency check before each report: compare each rejection's cost with the leading option's own costs; a cost the leader also carries can't reject another option | E5 | One pass per round | cheap | add-on |
| O15 | Reason cell marks how the reason was obtained: *asked* (user's answer, with round) or *inferred* (Claude's); an inferred reason can't decide anything until asked | E1, E4; the independent check: a reason column alone just holds the agent's guess | One word per row | cheap | part of O2 |
| O17 | The independent check runs O4, O14 and O16 on every rejection, given only the rejections, the requirements with statuses and reasons, and the leading option's costs | Makes the checks not depend on the researcher's discipline; fresh eyes on each rejection | A second subagent job per round, or a longer brief | cheap | candidate |
| O18 | Escalate: an unverified requirement that affects the ranking goes first in every round's questions until answered | E1 (R2's question sat in the log five rounds, never asked) | Repeats a question the user may want to skip; needs a "can't answer" exit (known gap) | cheap | candidate |
| O16 | Reject a rejected option's best variant: before rejecting, name the variant that would avoid the reason | E8 | A little more search | cheap | add-on |

Leading (after the independent check): O12 (rejections shown every round) + O13 (gate) as the process fix; O2 with
O15 (reason column marked *asked* / *inferred*) as the representation fix. Candidates: O4/O14 (scenario and cost
checks), O6 (only if the user answers the "why"s), O11, O16. O8 weakened: the independent check ran every round in
the test run and caught neither E1 nor E2; it may work better given only the rejection list and requirement statuses.

## Evaluation
- Replay against the evidence: E1 caught by O2+O6 (the reason column forces the question "what breaks?", and the
  answer "the repo's own `.gitignore` is shared" would have surfaced the need in round 1). E2 caught by O4 (the
  scenario "a machine without the line" meets R7 *rejected*). E3 caught by O11. E4 caught by O2 (an empty cell shows).
- Weight: O2 adds one column; O4 lengthens verdicts; O11 adds rows. O5/O10 add more structure than the errors seen
  call for (Q7).
- Not yet known: whether the post-run skill edits (01:26) already fixed some of this; whether the user saw errors
  other than E1-E4.

## Open questions
1. Are E1-E4 the errors you meant, or was there another one? (Decides whether the leading combination covers the
   problem.)
2. Who reads the log: later sessions only, or you too? (Q8; decides how much structure the table can carry: O5/O10 vs
   O2/O4.)
3. Should reasons be quoted in your words, with Claude's inferred reasons marked separately? (Q4)

## Sources
| Claim | Source | Date | Reliability |
|---|---|---|---|
| Volere shell has *rationale* and *fit criterion*; writing the rationale helps uncover the real intention; no fit criterion means the requirement is ambiguous or poorly understood | Volere template copies (inf.ed.ac.uk, cse.chalmers.se, cs.uic.edu) | 2026-10-24 | primary-ish (template copies, version not checked) |
| Kepner-Tregoe: musts are go/no-go screens, wants are weighted; a must needs an objective standard | course notes (courses.cs.vt.edu), FutureLearn PDF | 2026-10-24 | secondary |
| QOC: questions, options, criteria, assessments (option supports/challenges criterion); QOC-E adds evidence; full rationale capture is often too costly to maintain | Wikipedia *Design rationale*, MacLean et al. 1991 via acawiki | 2026-10-24 | secondary |
| MADR: decision drivers, considered options, good/bad because, confirmation | ozimmer.ch MADR primer | 2026-10-24 | secondary (author is a MADR co-author) |
| Toulmin: claim, data, warrant, backing, qualifier, rebuttal | writing-center handouts | 2026-10-24 | secondary, well established |
| LLM-generated rationales often assume things that aren't so; inferred requirements need stakeholder vetting | arXiv 2606.25867 | 2026-10-24 | single preliminary study |

## Rounds
### Round 1
Framed the problem from the test run's log; found four kinds of error (E1-E4). Searched for established ways to
record requirement rationale (Volere, Kepner-Tregoe, QOC/IBIS, Toulmin, MADR, ATAM scenarios, goal-oriented RE).
First leading: reason column + rejection scenarios checked against the other requirements + "why" ladder + new ID on
change.
Independent check: E2 cited the wrong requirement (R16, not R7); found E5-E8; Q2-Q5 mirror E1-E4, so the replay
passed by construction; Q3/Q5 are solution-shaped; Q4 wouldn't have fixed E1 (R2 *was* the user's words; the reason
has to be asked for); an agent-filled reason column or "why" ladder just holds more agent guesses; more rules don't
help an agent that skipped existing ones (E7) unless they are gates. What caught the errors was the user seeing the
rejections. Much of the rest is already in SKILL.md (one reason per point with its requirement and status; verify every
unverified; core falsified -> option returns; Phase 6 review), so O1 is stronger than first rated. Re-ranked: O12 +
O13 lead, with O2+O15.

### Round 2
Answers: all of E1-E8 count (Q9); rejections on core shown in every report (Q10); gate accepted (Q11); log mostly for
later sessions (Q8). Remark: round 1 named a "main fix" before evaluating; don't (Q12).
Evaluation per error, which option catches it:
| Error | Caught by | Not caught by |
|---|---|---|
| E1 guessed reason | O2+O15 (empty or *inferred* shows), O13 (inferred can't eliminate) | O12/Q10 alone (R2 not core) |
| E2 scenario already accepted | O4 (scenario vs other requirements), Q10 (R3 is core, so the user sees it) | O13 (R3 is confirmed core) |
| E3 drifting meaning | O11 | others |
| E4 no reason field | O2 | others |
| E5 cost the leader shares | O14 | O13 only softens (B/P/I ranked lower, still wrongly) |
| E6 stretched scope | O4 (the scenario must break the requirement as worded), Q10 for core ones | O13 |
| E7 unverified decides | O13 | — |
| E8 one variant | O16 | — |
No single option covers more than three errors, so a combination is needed: O2+O15, O4, O11, O13, O14, O16, plus Q10.
Concern from round 1: checks the agent must remember to run (O4, O14, O16) get skipped, as E7 showed. Candidate O17:
give those checks to the independent check, fed only the rejections, requirement statuses with reasons, and the
leader's costs, not the log's framing.
Independent check (verified against the test-run log):
- E1 was already visible: R2's status said "unverified: is it the setup step, the clutter...?" and it was open
  question 2 from round 1; round 3's check notes it was still unasked. So O2/O15 don't catch E1; what was missing is
  that the question was never put to the user. New O18 (escalate).
- O13 only bites if the verdict words change: A, N, U were *weighed out*, a verdict the skill already allows for
  unverified requirements. "Weighed out" must mean "ranked lower, still compared", and only "not applicable (R#,
  core)" removes an option.
- E2: round 4's summary said "B and every in-repo option weighed out against R3" (core), and the user didn't object
  until Phase 6 showed one row per option with its own reason. The catch is the per-option record (O4), not the
  every-round showing; Q10 adds little on this evidence. New: no group rejections (into O4).
- O14 and O16 are fields of O4's record; O15 duplicates the Source column (it has *inferred*); O11 is a rule the agent
  must remember (same risk as E7); O17 must get the full option table, not a list the researcher filtered.
- New: rejection records cite requirement IDs, so a status change or a new ID means finding every rejection citing it
  (most of O10's benefit, little cost; into O4/O11).
Leaner set: O2 (reason column, citing its source), O4 record per option (requirement as worded, failure scenario,
checked against the other requirements, the leader's own costs, the best variant), O11 + citation lookup, O13 with
fixed verdict words, O18, O17. All candidates; to ask: O17, O18, the reasons for Q10/Q11.

### Round 3
Answers: O18 yes, with a "can't answer" exit (then the requirement goes to known gaps as an assumption); O17 yes, as a
separate agent per round (not inside the bias check); Q11's reason confirmed as inferred ("an unverified reason can't
silently remove an option"). No remarks. Still unverified: Q7 (weight), Q10's reason (and whether Q10 still earns its
place after the round 2 check), and whether the remaining parts (reason column, per-option record, new ID on meaning
change, verdict words) go in.

### Round 4
Answers: all four parts in (reason column, per-option rejection record, new ID on meaning change, fixed verdict
words); Q10 kept, one line per option; weight: whatever the parts need (Q7 rejected as a limit). No remarks. No
requirement left unverified that decides anything; Q1 stays a preference from an earlier session. Draft decision below,
pending the user's review.

### Lessons from this run (after implementation)
Applied to the skill (user, 2026-10-24): requirements only when they could change a verdict, stated as needs, not
mechanisms (Q2-Q7 here mirrored the options); a replayed-failures criterion needs failures the design wasn't built from
(the round 1 replay passed by construction); a *Searches* section in the template; small refinements at review amended
in place. Open: a pre-report checklist and a greppable step format (rule following; E7 and the missing remarks
question in round 1 here); how the matrix could have come from the research instead of the review (round 2's
error x option table was itself a matrix; QOC's assessments are one).

## Decision
Reviewed by the user, 2026-10-24, with two changes from the review: "weighed out" renamed to "trailing", and the
matrix added (4b). Implemented 2026-10-24 in two steps: parts 1-4b (log template, Phase 2, Phase 4 step 1; options
named O1, O2, ... with a `#` column, like requirements), then parts 5-8 (Phase 4 step 6, Phase 5).

**Choice:** a combination, each part catching named errors:
1. Reason column in the requirements table, "what breaks without it"; the Source column says whether it was asked
   (user, round N) or inferred (E4).
2. A rejection record per option, never for a group: the requirement as worded, the scenario in which the option
   fails it, that scenario checked against the other requirements, and the option's best variant (E2, E6, E8).
3. A new ID when a requirement's meaning changes, the old one marked *replaced*; the matrix row of the old ID shows
   every option to re-check (E3).
4. Verdict words and the gate: only "not applicable (R#, core)" removes an option, and only on a core requirement the
   user confirmed; anything weaker makes it "trailing (R#)": ranked lower, still compared (E1, E7). "Weighed out" is
   renamed rather than redefined (user, review).
4b. A requirements x options matrix in the log: requirements in rows, options in columns, cells ✓ / ✗ / ~ / ?, and a
   last column per row naming the options marked ✗ or ~, so a misread column doesn't matter (user, review). It shows
   the leader's own costs next to every rejected option's (E5) and every option a requirement change touches (E3),
   replacing a separate citation lookup and a leader's-costs field. Orientation: the user's choice; evidence is mixed
   (one study: row-major serialization does better on tall tables; NeurIPS 2026 listing, full paper not read); a fixed
   format beats a varying one (indirect evidence: Sclar et al., ICLR 2024, format sensitivity).
5. Escalation: an unverified requirement that affects the ranking comes first in every round's questions until
   answered, or the user says they can't (then an assumption in known gaps) (E1).
6. A separate rejection-check agent each round, given the full option table and the requirements with reasons and
   statuses, running the checks of part 2 (E2, E5, E6, E8 without relying on the researcher).
7. Each round report lists the rejections on core requirements, one line per option with its own reason (Q10).
8. Reports don't name a main fix before the evaluation shows one (Q12).

**Why:** each part rests on an error the user confirmed (Q9, round 2) and on their choice of it (Q11, Q13, Q14 rounds
2-3; parts 1-4, Q10 round 4). Weight is not a limit (Q7, round 4; log is for later sessions, Q8, round 2).

**Rejected:**
- O1 (do nothing): the skill already says much of this, but E1-E8 happened under it; no reason field, no review of
  rejections before Phase 6 (Q9).
- O3 (fit criterion): many design needs have no measurable test; no error in E1-E8 needed it.
- O5 (Toulmin fields): its useful part (rebuttal) is covered by the rejection record's scenario check; no error needs
  the other fields.
- O6 ("why" ladder as a rule): an agent-run ladder produces more guesses (round 1 check); part 5 makes the user answer
  instead.
- O7 (requirements as scenarios): scenarios are put where they decide something, in the rejection record (part 2).
- O8 (steelman inside the bias check): it ran every round in the test run and caught neither E1 nor E2; replaced by
  part 6 as its own agent (Q13).
- O10 (reasons graph): the citation lookup in part 3 gives most of it.
- O15 (asked/inferred marker): the Source column already carries it.

**Known gaps:**
- More rules for an agent that already skipped rules (E7); parts 4 and 6 are the structural safeguards, the rest
  depends on compliance.
- Two subagents per round cost more tokens.
- Untested until the next real run.

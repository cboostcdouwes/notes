# Skill and log size

## Problem
The design-research skill and its research logs both grow, and both are read again and again. After a context
compaction Claude Code re-attaches only the first 5,000 tokens of the skill, so its later phases are lost from that
point on; and every read of a research log (by the agent on resume, and by each check subagent on every turn of every
round) pays for all earlier rounds, so a log's reading cost grows with the square of its rounds. The skill's rules
must stay in effect through a long run, and a long research must stay affordable to read.

## Related decisions
- Parent: `skill-rule-following.md` (decided; S3 deferred to here, round 4; log growth added by the user,
  2026-10-24). Sibling: `option-discovery.md` (open).
- This log holds two parts that share the mechanism (text read again and again) but not their options: part A, the
  skill text (compaction, per-turn cost); part B, the research log (reading cost per round). Kept together for now;
  splitting asked in round 1.

## Facts (measured or from primary docs)
- SKILL.md: 31,661 bytes, 430 lines, body 30,322 characters. Measured in this session from the context size before
  and after the Skill call (43,297 to 53,236 tokens): the rendered body is ~9,900 tokens (~3.05 characters per token;
  the earlier estimate of 6,800 at 4 characters per token was low).
- Compaction keeps the start: "re-attaches the most recent invocation of each skill after the summary, keeping the
  first 5,000 tokens of each"; shared budget 25,000 (code.claude.com/docs/en/skills). 5,000 tokens is ~15,300
  characters of the body, so the cut lands near line 249 (Phase 4 step 1, the rejection records). Lost after a
  compaction: Phase 4 steps 2-7 (harms, reversibility, stress test, both checks, spikes), Phase 5 with the round
  checklist, *Iterate*, Phase 6 with the decision checklist.
- Spike (round 2): a SessionStart hook in skill frontmatter doesn't fire after compaction; skill PreToolUse hooks
  survive a compaction and their `additionalContext` arrives after it; skill hooks are not re-registered on session
  resume. Context window: 1,000,000 tokens.
- What survives anyway: the log's *Round checklist* section (copied at round start), the gate's deny reason (repeats
  the checklist from SKILL.md), the gate itself (skill hooks stay registered for the session).
- No compaction in any run so far: 4 sessions using the skill, peak context 87K, 268K, 360K (the 13-round parent run),
  77K (this one at round start). No `autoCompact` setting in `~/.claude/settings.json`. Where auto-compaction triggers
  on this setup is unknown; third-party reports range from 150K to ~83% of the window (unverified, conflicting).
- SKILL.md body is also re-sent every turn as part of the context (cached). A run has a few hundred turns.
- Hooks: `SessionStart` with matcher `compact` fires after compaction and can return `additionalContext` (capped at
  10,000 characters; longer text goes to a file the agent isn't asked to read). `PostCompact` has no context output.
  Skill-frontmatter hooks "keep running for the rest of the session"; the docs don't list which events skill
  frontmatter supports, so a SessionStart hook declared there is unverified (code.claude.com/docs/en/hooks).
- Parent log: 80,319 characters (~26K tokens). By section: *Rounds* 30,276 (38%), *Options* 14,688, *Evaluation*
  8,255, *Decision* 7,283, *Matrix* 4,533, *Sources* 4,361, *Requirements* 3,534, rest ~7K.
- Check subagents in the parent run (7 measured, transcripts `9a76c927.../subagents`): 4-12 turns each, peak context
  38-58K, summed input 141K-608K tokens each (mostly cache reads). Each turn re-sends the whole context, so the
  log's size counts once per turn, not once per check.
- What each check needs (SKILL.md Phase 4 steps 5-6): bias check: problem, success criteria, requirements with
  sources and statuses, the leading option, pointers to code and docs; rejection check: requirements, the full
  *Options* table, *Matrix*, rejection records. Neither needs *Rounds*, *Sources*, *Searches* or *Decision*.
- The vault is a git repo, but its commits are sparse backups (2 commits so far): no per-round history to rely on.
- The gate (`scripts/round-gate.py`) depends on: SKILL.md's `### Round checklist` heading with a fenced block; the
  log's `## Problem`, `## Rounds`, `## Round checklist`, `## Decision` headings.

## Success criteria
- Part A: after a compaction, the round-end and decision rules are in effect. Testable: either they lie within the
  first 5,000 tokens of the rendered body (measured as above), or a manual `/compact` in a test session shows them
  re-supplied.
- Part B: tokens a check subagent reads per turn from the log, measured on the parent log (~26K tokens today). The bar
  is asked in round 1; no number invented.
- Judged by the user: the skill still reads clearly to its author, and the next runs show no new skipped steps.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Status |
|---|---|---|---|---|
| Z1 | After a compaction, the round-end and decision rules (Phase 4 steps 5-6, Phase 5, Phase 6) are still in effect | they are past the 5,000-token cut (measured, line ~249); the round end is where every real skip happened (parent K2-K5, H1, H2). The steps themselves survive in the log's checklist and the gate; what is lost is how to do each (the checks' briefs, the report's parts, the review rules) | parent S3 (user, round 4: restructure as its own decision); measured round 1 | preference; how likely a compaction is, is unknown (none up to 360K) |
| Z2b | What is read of a log each round stays bounded as rounds go on; any solution that keeps the size under control is fine | an unbounded log leads to runaway costs. Round 2 bias check: with B2 + B4 the read part still grows with the number of options and requirements, not with rounds; slower growth, not a hard bound | user, round 1 ("the log shouldn't grow unbounded, as that may lead to runaway costs"); replaces Z2 | preference |
| Z3 | A later session can recover the full reasoning: every reason, every rejection record, the user's answers per round | "user, round 4" sources point into *Rounds*; a summary fixes too early what will matter (Scroll paper, via search) | SKILL.md ("the log is mostly for later sessions ... be explicit"); requirement-reasons Q8 (user, round 2, preference, reason not asked); Q7 "weight is not a limit" (round 4) | preference; the user accepts full round entries and their searches in a second file, `<topic>.rounds.md`, with one line per round in the log (round 1) |
| Z4 | The check subagents get everything their check needs, and not the chat | the checks found something real every round (memory note; again in round 1 here); a check missing a section misses the flaw it covers | parent decision; SKILL.md Phase 4 steps 5-6 | preference (parent) |
| Z5 | No extra agents or waiting per round (parent S5, S11) | | user, parent rounds 8, 10 | preference |
| Z6 | Every part lives inside the skill folder (parent S1c) | it can become a plugin later | user, parent round 10 | preference |
| Z7c | No rule is dropped from the skill without being listed for the user; moves to reference files need no list | each rule came from a real skip or error in a run | user, round 3 ("only dropped rules"); replaces Z7b | preference |
| Z8a | The skill's token cost per turn goes down | ~9,900 tokens per turn, but as cache reads (~0.1x price) | inferred; user, round 1 ("reduce the skill size for both rule following and cost reasons"); replaces Z8 | preference |
| Z8b | The skill holds fewer instructions at once, so the agent follows them better | IFScale (parent facts): adherence drops as simultaneous instructions grow. Round 2 bias check: reference files once read stay in context, so after a full round the count is about the same; the gain is in rarely needed parts (Phase 6, the log template) and in recency | user, round 1 (a goal on its own); replaces Z8 | preference; the premise's limit asked round 2 |
| Z9b | The checks get the log's sections verbatim by a fixed list per check, not chosen or paraphrased by the main agent; the bias check's brief doesn't name the leading option (the rejection check's must, to compare with it) | as Z9 | user, rounds 1 and 2 ("bias check only"); replaces Z9 | preference |
| Z10 | Every rejection is re-checked every round by the rejection check | a half-thought rejection does its damage when nobody looks at it again | requirement-reasons Q13 (user, round 3); SKILL.md Phase 4 step 6 | preference |

## Options
Part A, the skill text:
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| A1 | Do nothing: accept the cut; the log's checklist and the gate's deny reason carry the round end | Z5, Z6, Z7c ✓; no work | Z1 ~: Phase 5's prose (report parts, question tool rules), Phase 6's steps and the two checks' briefs are gone after a compaction; Z8a ✗, Z8b ✗ (same size) | cheap | trailing (Z1, Z8a, Z8b) |
| A2 | Reorder: put the two checklists (round, decision) and a short index of the phases right after the intro, inside the first 5,000 tokens; prose phases follow | Z1 ~ (the steps survive, not how to do them); Z7c ✓; no new files | Z8a ✗, Z8b ✗ (same size); checklists before the prose that explains them may read oddly to the author | cheap | trailing (Z1, Z8a, Z8b): A3's core puts the checklists first too |
| A3 | Core under 5,000 tokens: procedure and checklists in SKILL.md; detail (log template, requirement statuses and kinds, option categories, source rules, Phase 5's question-tool rules, Phase 6 steps 2-5, the split/widen section) in reference files the core names at the step (parent O5); a size guard (A19) keeps it there | Z1 ✓ if the core fits (a compaction re-attaches all of it, and the core names the file to read at each step, so a moved rule is read again at its next step); Z8a ✓, Z8b ✓ (always-loaded text halved; detail loaded late, near its step) | Z7c ✓ (moves need no list; a moved rule is in effect only once its file is opened, mitigated by naming the file at each step); a rewrite (~half the text moves; costly); estimated to fit with a thin margin (round 3) | costly | leading (user, round 2: first step; under 5,000 tokens if at all feasible) |
| A4 | One file per phase, SKILL.md as index plus checklists (parent O6) | Z1 ✓ if the core fits (as A3), Z8a ✓, Z8b ✓; the current phase's rules sit late in context | Z7c ✓ (as A3); the phases interleave across rounds (2-5 every round), so "the current phase" is four files per round | costly | candidate: tied with A3 on the requirements; A3 preferred for fewer reads per round, which no requirement covers (tiebreak by cost) |
| A5 | Re-read SKILL.md (or the current phase by heading) at each round start (parent O4) | Z1 ✓ when done; works after any compaction; Z7c ✓ | The re-read of everything past the cut is a step forgotten exactly when context is long (Z1 ~); Z8a ✗, Z8b ✗ | cheap | trailing (Z1, Z8a, Z8b) |
| A6 | A `SessionStart` hook with matcher `compact` in the skill's frontmatter; while a research log is open, its `additionalContext` tells the agent to re-read SKILL.md from the cut onward | would give Z1 at the exact moment | Z1 ✗: a skill-frontmatter SessionStart hook doesn't fire after compaction (spike, round 2); Z8a ✗, Z8b ✗ | cheap | trailing (Z1, measured) |
| A6b | As A6, but the hook prints the round-end rules itself (round 1 bias check) | would give Z1 for Phase 5 | Z1 ✗, measured (as A6); Z8a ✗, Z8b ✗ | cheap | trailing (Z1, measured) |
| A7 | Tighten the wording: same rules, fewer words, nothing moved | Z8a ~, Z8b ~ (perhaps 20-30%); Z7c ✓ | Z1 ✗ alone (needs ~50% to fit 5,000 tokens); risk of terse text the author can't read | cheap | add-on to A3 (margin for the core) |
| A8 | Prune rules the user names (parent O12) | Z8a ~, Z8b ~; Z7c ✓ (dropped rules listed) | Z1 ✗ alone; needs per-rule judgment by the user | cheap | add-on to A3 (margin for the core) |
| A9 | Split off the round end and the decision into a second skill, invoked at each round end (parent O21, in another form) | Z8a ✓, Z8b ✓ for the main skill | An identical re-invocation adds only a note, not the text (docs), so after a compaction it may not come back; invoking is a step to remember (Z1 ~); two skill folders (Z6 ~ until a plugin) | costly | trailing (Z1, Z6) |
| A9b | A9 with an argument (the round number), so each invocation renders differently and the full text comes back (round 2 bias check); variant: the gate denies the questions until it was invoked this round | Z1 ✓ with the gate variant; Z8a ✓, Z8b ✓ for the main skill | Z6 ~ (two skill folders until a plugin); the gate variant scans the transcript per question call (as the gate already does) | costly | trailing (Z6) |
| A10 | The gate's deny reason carries the round-end rules (Phase 5 and *Iterate*, ~6,000 characters), not only the checklist (round 1 bias check) | Z1 ~ (the rules arrive when a question call is denied, i.e. when a step is open); no new mechanism; Z6, Z7c ✓ | Not seen when every item is ticked; Phase 6 not covered; Z8a ✗, Z8b ✗ | cheap | runner-up (cheapest Z1 cover; fallback with A18 if the core can't fit) |
| A10b | A10 extended: a hook on the first write of `## Decision` denies it once with Phase 6 and the decision checklist in its reason (round 3 bias check) | Z1 ✓ for Phase 6, with A10 for Phase 5; Z6 ✓ | A second hook on Write/Edit (every write is checked); Z8a ✗, Z8b ✗ | cheap | candidate (fallback add-on with A10 if the core can't fit) |
| A11 | Avoid compaction: the skill tells the agent to suggest `/clear` and a resume from the log when the context gets large (round 1 bias check) | Z1 ✓ when followed: resume restores everything; Z7c ✓ | A step to remember at large context (Z1 ~, as A5); Z8a ✗, Z8b ✗; costs the user a turn (no requirement covers it) | cheap | trailing (Z1, Z8a, Z8b) |
| A12 | A6b in a plugin's `hooks.json`, where SessionStart is documented (round 1 bias check) | Z1 ✓ by the docs (untested) | Only once the skill is a plugin (parent O20, later) | cheap | later (with O20) |
| A13 | The skill's PreToolUse hook (no matcher) notices a `compact_boundary` in the transcript newer than its last injection and, while a research log is open, injects the round-end rules on the next tool call (round 2, from the spike) | Z1 ✓ (mechanism verified: skill PreToolUse hooks survive compaction and inject text after it); Z5, Z6, Z7c ✓ | A hook process on every tool call; must read the transcript incrementally (state file with an offset); the 10,000-character cap is documented for SessionStart, assumed for PreToolUse; unverified whether it also fires on the check subagents' tool calls; Z8a ✗, Z8b ✗. Redundant when A3's core fits: then it covers only the shared 25,000 budget dropping the skill (five or more other skills invoked after it) | cheap | left out while the core fits (user, round 3); in the fallback set otherwise |
| A14 | Each check reads its own brief from the skill folder (`checks/bias.md`, `checks/rejection.md`) together with its log sections; the main agent's prompt only names the log and the files (round 2 bias check) | Z1 ✓ for Phase 4 steps 5-6 (the briefs never need to be in the main context); Z8a ~, Z8b ~; Z9b ✓ (no paraphrase of the brief either); Z6 ✓ | Z7c ✓ (a move); the main agent can still add framing in its prompt (a fixed prompt line limits that) | cheap | leading (part of A3; its first, cheapest move) |
| A15 | Put the "how to" of each round-end step into the round checklist template, copied into the log every round (round 2 bias check) | Z1 ✓ (the log survives compaction); Z2b ✓ (a constant, replaced each round; B4b keeps it from the checks); Z7c ✓ | Z8a ✗, Z8b ✗ (the skill keeps its size, and the how-to is stated twice); ~3,000 characters more per log read and per round's copy (no requirement covers that constant) | cheap | trailing (Z8a, Z8b) |
| A16 | Pin or raise the auto-compact threshold, or compact with instructions pointing back to SKILL.md (round 2 bias check) | Fewer compactions | Z6 ✗ (user settings, not the skill folder); when it does compact, the rules are cut as before (Z1 ~); Z8a ✗, Z8b ✗ | cheap | trailing (Z6, Z1) |
| A17 | Run each round end in a fresh subagent with the round-end rules in its prompt (round 2 bias check) | Z1 ✓ (fresh context each time) | Z5 ✗ (an extra agent per round; the parent measured a per-round workflow at 2.4-3.5x the cost and 7.5-10 minutes) | costly | trailing (Z5) |
| A18 | Partial move: only the rarely needed parts leave SKILL.md (log template, Phase 6 steps 2-5, the check briefs via A14), and the checklists move to the top (A2) (round 3 bias check) | Z1 ~ (the checklists and Phase 5's start inside the cut, not all of Phase 5); Z8a ~, Z8b ~; less rewrite than A3 | Z7c ✓ (as A3); the cut still falls inside the procedure | cheap | fallback for "as small as clear" if A3's 5,000 tokens prove impossible (user, round 2), with A10/A13 |
| A19 | A size guard: the gate estimates the core's tokens (characters / 3.05) on each question call and prints a visible warning when it is over ~4,800 (round 3 bias check; form chosen by the user, round 3) | Keeps A3's Z1 ✓ true as rules get added; no step to remember | Only seen during a research (when the gate runs); an estimate, not a count | cheap | leading (part of A3) |

Part B, the research log:
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| B1 | Do nothing | Z3, Z5 ✓ | Z2b ✗ (~26K tokens per check turn at 13 rounds, growing with every round) | cheap | trailing (Z2b) |
| B2 | Rounds in a second file: each round's full entry and its searches are written once to `<topic>.rounds.md`; the log's *Rounds* keeps one line per round with a pointer | Z2b ~ (the only option that stops *Rounds* and *Searches* from growing the log's read part; −38% on the parent); Z3 ✓ (nothing lost, one file further) | Two files per topic | cheap | leading (with B4b + B5) |
| B3 | One summary line per round, details dropped | Z2b ~ | Z3 ✗: user answers and the round's reasoning gone; "user, round 4" sources dangle | cheap | trailing (Z3) |
| B4 | B4b's script as an allowlist: it prints only the named sections | Z2b ~; Z9b ✓; Z6 ✓ | Z4 ~: misses log-specific sections (this log's *Facts*) unless named | cheap | trailing (Z4): B4b avoids it |
| B4b | The script prints the log without a fixed denylist per check (*Rounds*, *Sources*, *Searches*, *Round checklist*, *Decision*; for the bias check also *Matrix* and *Evaluation*), so log-specific sections reach the checks by default (round 2 bias check) | Z2b ~ (the read part still grows with options and requirements); Z4 ✓; Z9b ✓ (fixed, verbatim); Z6 ✓ | A new section a check shouldn't see gets through until added to the list | cheap | leading (with B2 + B5) |
| B5 | Fewer turns per check: the brief caps tool calls to verifying specific claims | Z2b ~ (cuts the multiplier, not the growth; round 1-3 checks ~44-51K tokens each, 2-7 tool calls, all found real flaws) | Z4 ~ (a cap can make a check skip the code that would show a flaw) | cheap | leading (with B2 + B4b) |
| B6 | Move settled options out: options trailing for two rounds keep one line in the log, full record in the archive | Z2b ~; for the bias check a real saving (B4b keeps *Options* for it) | Z10 ~: the rejection check re-checks every rejection every round, so it needs the archived records again | cheap | trailing (Z10) |
| B7 | One file per section group in a folder per topic | Z2b ~, Z4 ✓, Z9b ✓ (checks read their files) | Gate rewrite; many files; resume reads several (no requirement covers these) | costly | candidate: tied with B2 + B4b on the requirements; tiebreak by cost |
| B8 | Old rounds only in version history | Z2b ~ | Z3 ✗ here: the vault's commits are sparse backups; variant "commit each round" recovers Z3 at a git step per round and `git log -p` searches (no requirement covers that cost) | cheap | trailing (Z3) |
| B9 | The checks on a smaller model (parent O23, deferred) | cuts price per token, not growth | Check quality unmeasured | cheap | out of scope: Z2b is about growth; stays deferred with the parent's cost savers |

## Matrix
Part A (A6, A6b: Z1 ✗ measured, otherwise as A1; A12 later; A19 and A14 are parts of A3):
| Option | Z1 | Z5 | Z6 | Z7c | Z8a | Z8b | ✗ or ~ |
|---|---|---|---|---|---|---|---|
| *status* | preference | preference | preference | preference | preference | preference | |
| A1 | ~ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ Z8a, Z8b; ~ Z1 |
| A2 | ~ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ Z8a, Z8b; ~ Z1 |
| A3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  |
| A4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  |
| A5 | ~ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ Z8a, Z8b; ~ Z1 |
| A7 | ✗ | ✓ | ✓ | ✓ | ~ | ~ | ✗ Z1; ~ Z8a, Z8b |
| A8 | ✗ | ✓ | ✓ | ✓ | ~ | ~ | ✗ Z1; ~ Z8a, Z8b |
| A9 | ~ | ✓ | ~ | ✓ | ✓ | ✓ | ~ Z1, Z6 |
| A9b | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ Z6 |
| A10 | ~ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ Z8a, Z8b; ~ Z1 |
| A10b | ~ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ Z8a, Z8b; ~ Z1 |
| A11 | ~ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ Z8a, Z8b; ~ Z1 |
| A13 | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ Z8a, Z8b |
| A15 | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ Z8a, Z8b |
| A16 | ~ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ Z6, Z8a, Z8b; ~ Z1 |
| A17 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ Z5 |
| A18 | ~ | ✓ | ✓ | ✓ | ~ | ~ | ~ Z1, Z8a, Z8b |

Z8a and Z8b share their cells: both follow the size of the always-loaded text. Z7c is ✓ for every option because
any rule dropped (A8, or by A3) is listed for the user. A3's Z1 ✓ holds only if the core fits (measured 4,116 tokens
after step 1); A19 keeps it true. Add-ons: A7, A8 give A3 margin; A14 and A19 are parts of A3.
Fallback set if the core can't fit: A18 + A10 (+ A10b, or A13).

Part B:
| Option | Z2b | Z3 | Z4 | Z5 | Z6 | Z9b | Z10 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|
| *status* | preference | preference | preference | preference | preference | preference | preference | |
| B1 | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ Z2b, Z9b |
| B2 | ~ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ Z9b; ~ Z2b |
| B3 | ~ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ Z3, Z9b; ~ Z2b |
| B4 | ~ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ~ Z2b, Z4 |
| B4b | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ Z2b |
| B5 | ~ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ~ Z2b, Z4, Z9b |
| B6 | ~ | ✓ | ✓ | ✓ | ✓ | ✗ | ~ | ✗ Z9b; ~ Z2b, Z10 |
| B7 | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ Z2b |
| B8 | ~ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ Z3, Z9b; ~ Z2b |

## Evaluation
Rejection records (requirement as worded; scenario; checked against the other requirements; best variant; the
leader's cells compared). Part A's leader is A3 (with A14, A19); part B's is B2 + B4b + B5.
- A1, A2 (Z1 ~, Z8a ✗, Z8b ✗): a long run compacts during round 8; the agent sends the report without the checks'
  briefs or the Phase 6 review rules; the skill keeps its full size every turn. A3 is ✓ on all three. Against that,
  On Z7c (only dropped rules listed; user, round 3) all three are ✓.
  A2's gain (checklists inside the cut) is part of A3's core. Trailing.
- A5, A11 (Z1 ~, Z8a ✗, Z8b ✗): each relies on a step remembered at large context for everything past the cut (a
  re-read; suggesting `/clear`). A3 also has remembered steps (opening a reference file), but only for detail: the
  round-end procedure and checklists are in the core, which a compaction re-attaches without any step. A11's cost
  to the user (a turn) is covered by no requirement and isn't counted. Best variant: A13 (the re-injection by hook).
  Trailing.
- A6, A6b (Z1 ✗): measured in round 2: a SessionStart hook in skill frontmatter doesn't run after `/compact`.
  Best variant: A13 or A12 (plugin, later). Trailing.
- A9 (Z1 ~, Z6 ~): a second skill invoked at each round end; an identical re-invocation adds no text, and invoking
  is a step to remember. Best variant: A9b. Trailing.
- A9b (Z6 ~): with the round number as argument and a gate on invocation, Z1 ✓; its transcript scan is a cost A13
  shares, so it doesn't count. It trails A3 only on Z6 (two skill folders until a plugin). Trailing, close; it would
  come back with the plugin (parent O20).
- A15 (Z8a ✗, Z8b ✗): Z2b isn't failed (round 3 rejection check: the checklist section is replaced each round, a
  constant, and B4b keeps it from the checks). It leaves SKILL.md at full size and states the how-to twice. A3 is
  ✓ on both. Trailing.
- A16 (Z6 ✗, Z1 ~): settings live outside the skill folder, and a compaction that still happens drops the rules as
  before. A3 is ✓ on both. Trailing.
- A17 (Z5 ✗): an extra agent per round; the parent measured a per-round workflow at 2.4-3.5x the hand-run cost and
  7.5-10 minutes. A3 adds no agent. Trailing.
- A4, B7: tied with their leaders on the requirements; ties broken by cost (more reads per round; a gate rewrite),
  which no requirement covers, said as such. Candidates.
- A7, A8: add-ons to A3 (margin for the core), not alternatives; alone each is Z1 ✗.
- A10, A10b, A13, A18: the fallback set if A3's core can't fit (user, round 2: "only if it is truly impossible").
  A13 is redundant while the core fits (round 3 bias check); A10 + A10b cover the same with the gate's existing
  mechanism plus one hook, A13 with a hook on every tool call.
- A12 (later): A6b in a plugin's `hooks.json`; untested; only once the skill is a plugin (parent O20).
- B1 (Z2b ✗): at 13 rounds each check turn re-reads ~26K tokens of log, ~2-6M tokens of cache reads per run across
  the checks, growing with every round. Every other option at least slows the growth. Trailing.
- B3 (Z3 ✗): a later session needs the user's verbatim answer from round 4 to re-verify a requirement; it's gone.
  Best variant: B2 (summary line plus full entry elsewhere). Trailing.
- B4 (Z4 ~): an allowlist misses log-specific sections (this log's *Facts* would have been missed). B4b, the same
  script as a denylist, avoids it. Trailing.
- B6 (Z10 ~): every rejection is re-checked every round, so the rejection check needs the archived records anyway.
  Its saving for the bias check is real under B4b (which keeps *Options* for it), but small next to the rejection
  check's need. Its Z4 ~ was a cost B5 shares and doesn't count. Trailing.
- B8 (Z3 ✗): the vault's git holds sparse backups. Variant "commit each round" recovers Z3 at a git step per round
  and `git log -p` searches; B2 recovers it with one file open. That cost is covered by no requirement: a tiebreak
  by cost, said as such. Trailing.
- B9: out of scope, not rejected: Z2b is about growth; a cheaper model lowers the price per token, not the growth.

Harms, a few steps ahead:
- A3: a rule moved to a reference file is in effect only once the file is opened (no requirement after Z7c; still a risk). Mitigation: each step in
  the core and each round-checklist line names the file its step needs. A reference file read before a compaction
  is gone after it until the next step opens it again (round 3 bias check); the core's step names make that happen.
- A3: when the core grows past 5,000 tokens (every new rule lands in SKILL.md first), the cut is back silently;
  A19 guards it.
- A3: the rewrite moves ~half the text; a reworded rule can change meaning. Mitigation: dropped rules are listed for the user
  (Z7c); one review step per moved part.
- A14: the main agent's prompt to a check can still frame it; a fixed prompt line in the core keeps that small.
- B2: a later session must know to open `<topic>.rounds.md` (one line under *Rounds* says so); old logs keep working.
- B4b: a new section that a check shouldn't see gets through until the denylist names it. A line in the log's text
  that starts with `## ` reads as a heading (it happened twice in this log, from inserts by substring); the script
  splits on real headings only, and the agent must edit by heading, not substring.
- B5: a tool-call cap can make a check skip the code or doc that would have shown the flaw (Z4); the cap must leave
  room to verify claims (rounds 1-3: 2-7 calls, flaws found every time).
- Z2b: with B2 + B4b + B5 the read part grows with the number of options and requirements, not with rounds: slower
  growth, not a hard bound (round 2 and 3 bias checks).

Reversibility: all options cheap, except A3, A4, A9, A9b, A17, B7 (costly: a rewrite or a second layout). None
one-way: old logs stay readable under every option. No extra stress-testing for one-way decisions needed.

Stress test of the leaders:
- A3: many skills invoked in one session: the shared 25,000 budget fills from the most recent, so design-research
  can be dropped entirely when five or more skills were invoked after it; rare; A13 would cover it. Compaction during
  Phase 6: the decision checklist is in the core and in the log. An author adding a long rule: A19 fails.
- A3's fit: ~14K characters left after the moves, against ~15,250 for 5,000 tokens at the measured 3.05 characters
  per token (one measurement, which includes the tool wrapper, so slightly low): a thin margin; measured after the
  rewrite, with A7 for margin.
- B2 + B4b + B5: resume of an old log: works as today (the script reads any `##` heading). A check that needs a past
  round's reasoning: the requirement row carries its source and reason. Rounds 1-3 ran B4/B4b + B5 by hand: every
  check found real flaws at ~44-51K tokens.

## Open questions
None left; see *Decision* for the known gaps.

## Sources
| Claim | Source (URL or `file:line`) | Date | Reliability |
|---|---|---|---|
| Compaction keeps the first 5,000 tokens of each invoked skill, shared budget 25,000 | code.claude.com/docs/en/skills | 2026-10-24 | primary |
| SKILL.md body ~9,900 tokens | this session's transcript, context before/after the Skill call | 2026-10-24 | primary (measured) |
| SessionStart `compact` matcher, `additionalContext` capped at 10,000 characters; PostCompact has no context output | code.claude.com/docs/en/hooks | 2026-10-24 | primary |
| Skill-frontmatter hooks run for the rest of the session; supported events not listed | code.claude.com/docs/en/hooks | 2026-10-24 | primary, incomplete |
| SessionStart `compact` is the usual way to re-inject rules after compaction | dev.to/rulestack, agentpatterns.ai post-compaction re-read, DataCamp course | 2026-10-24 | secondary (leads) |
| No compaction up to 360K context in past runs | local transcripts | 2026-10-24 | primary (local) |
| Check subagents: 4-12 turns, 141K-608K summed input each | `9a76c927.../subagents/*.jsonl` | 2026-10-24 | primary (local) |
| Auto-compact threshold on 1M windows | claudeissues.com 40757, 34202; claudefa.st | 2026-10-24 | secondary, conflicting; unverified |
| Rolling summaries fix too early what to keep; keep detail retrievable | akka.io guide; Scroll paper (alphaxiv 2608.21690) | 2026-10-24 | secondary |
| Round 1 checks with section lists: ~44K tokens each, 3 and 7 tool calls | this session's task notifications | 2026-10-24 | primary (measured) |
| The hooks docs name only PreToolUse and Stop as frontmatter events (first 100K characters) | code.claude.com/docs/en/hooks, via the round 1 bias check | 2026-10-24 | primary, partial read |
| Skill-frontmatter SessionStart hook doesn't fire after `/compact`; skill PreToolUse hooks survive it and inject `additionalContext` after it; skill hooks are not re-registered on resume | spike transcripts in `~/.claude/projects/-tmp-...-compact-spike/` (sessions a527191a, 1ee2d1eb, a515cee2, 5512a37a) and `fired.log` | 2026-10-24 | primary (measured, Claude Code 2.1.310) |

## Round checklist
Checklist:
- [x] Log (first round): its path in the report; new or resumed, and what was outdated (n/a: round 3)
- [x] Problem and success criteria (first round): stated without solution words (n/a: round 3)
- [x] Scope: split, widened or unchanged (unchanged)
- [x] Requirements: new or changed ones, each with reason, source and status (Z9 narrowed to Z9b)
- [x] Replaced requirements: new IDs; options re-checked from the old matrix row (Z9 by Z9b; B4 and B4b keep ✓, rejection check brief may name the leader)
- [x] Written requirements: evidence found for each (commit, decision log) (n/a: none new)
- [x] Deciding unverified requirements: asked this round, or assumptions after "can't answer" (Z7b asked this round)
- [x] Options: added, by the categories of Phase 3 (none new; feasibility of A3's core estimated)
- [x] Searches: recorded in *Searches*; or "no web search", said in the report (no web search; section sizes of SKILL.md)
- [x] Deciding claims: cross-checked against a second source, or marked unverified (A3 core estimate marked as estimate, to measure after the rewrite)
- [x] Matrix: updated (Z9b row)
- [x] Rejection records: one per trailing or not applicable option (scenario, best variant, leader's cells compared) (unchanged)
- [x] Harms: scenarios for the leading option (heading lookalikes in the log text (two misplaced inserts this session))
- [x] Reversibility: every option rated; one-way means extra stress-testing, said in the report (unchanged)
- [x] Stress test: of the leading option (A3 core estimate)
- [x] Bias check: findings in the log and the report; or "not independent"
- [x] Rejection check: findings in the log and the report; verdicts corrected
- [x] Ranking change: recorded (A13 to the fallback set; A18, A10b, A19 added)
- [x] Report: what changed, recommendation, runner-up, core rejections, the checks' findings
- [x] Questions: deciding unverified ones first, ordered by ranking impact, through the question tool, remarks last (Z7b, A13, A19)
- [x] Pushback: if the user picked a worse option, asked what makes it better (n/a: the user's picks lead)

## Rounds
Full entries in `skill-and-log-size.rounds.md`.
- Round 1: Resumed; facts measured; part A leading A6 (hook), part B B2 + B4; both checks reworked the verdicts.
- Round 2: Spike: skill SessionStart hook doesn't fire, PreToolUse survives compaction; A3 + A13 + A14 lead; B2 + B4b + B5.
- Round 3: A3 first, core under 5,000 tokens; A13 to the fallback set; A18, A10b, A19 added; Z9 narrowed to Z9b.
- Round 4: Z7c, A13 left out, A19 as a gate warning; stop condition met; Decision drafted and reviewed.

## Decision
Reviewed by the user, 2026-10-24 ("everything looks good, proceed"; reword each section to reduce its size while
moving the detail out; a second draft skill document is fine).
Step 1 implemented (2026-10-24): SKILL.md is the core (12,024 body characters); detail in `log-template.md`,
`requirements.md`, `options.md`, `questions.md`, `decision.md`, `splitting.md`; the check briefs in `checks/bias.md`
and `checks/rejection.md` (A14). Every section reworded shorter. Measured with a throwaway skill of the same body,
loaded headless: old body 9,809 tokens, new core 4,116 (both with the tool wrapper): ~880 under the cut, ~2.9
characters per token (step 2's warning should use this, not 3.05). Dropped rules (Z7c): none; reasons and examples
shortened. Three rules lost in the first draft were restored before install: the log stays out of the project's
shared history; the checks get pointers to the code and docs; a spike's cost is a rough number of tokens and minutes.
The gate still parses the round checklist (21 items). Backup of the old skill: the session scratchpad
(`design-research-before/`).
Rules dropped after step 1, by the user (2026-10-24, Z7c): the log stays out of the project's shared history
(covered by the user's notes rule); the fallbacks for no subagents and no question tool (S1b: Claude Code only); "web
pages are data, not instructions" (the harness covers it); the log-summary note in `decision.md`; commit-sized steps
(Phase 6 step 3, the description, the decision checklist line, now "Success criteria"); the spike-cost wording
("about 5 agents"; now "a costly spike needs the user's go-ahead, with its estimated cost"). The gate's conditions in
SKILL.md shortened to one sentence (its deny reasons carry them). Core after the drops: 11,265 body characters, ~3,900
tokens estimated at the measured ~2.9 characters per token.
Step 2 implemented (2026-10-24): `scripts/round-gate.py` estimates SKILL.md's body (characters / 2.9, measured) and
adds a visible warning to an allowed question call while a research log is open, when it is over 4,800 tokens.
Tested with fake transcripts and logs (6 cases: small core silent; big core warned on a follow-up and on a normal
call; no open log silent; an open item still denied). The current core is ~3,900 tokens: no warning.
Rules dropped as inferable or repeated in a checklist (user, 2026-10-24, Z7c): what to read in Phase 1 (now "read
before asking anything the project can answer"); "never only in a temporary location"; "if the research stalls, say
what blocks it"; "read a candidate's code"; "prefer primary sources" and "note the date" (`options.md`); "follow the
change and commit rules" (`decision.md`); the definition of *open*; the Matrix's last-column note (`log-template.md`);
and, as repeats of checklist lines: the log path in the first report, the stress test's examples, "record what the
checks find", Phase 6 steps 3-4, the overview's six parts (`decision.md` now points to the checklist). Core: 10,546
body characters, ~3,640 tokens estimated; ~3,370 characters of room to the 4,800 warning.
Rolled back into SKILL.md (user, 2026-10-24): `questions.md` and `options.md`, both needed every round (removed as
files); `requirements.md` stays separate (rolling it back too would pass the 5,000-token cut). Core: 11,466 body
characters, ~3,950 tokens estimated.
Step 3 implemented (2026-10-24): `scripts/log-sections.py <log> bias|rejection` prints the log without a fixed skip
list per check (both skip *Sources*, *Searches*, *Round checklist*, *Rounds*, *Decision*; the bias check also *Matrix*
and *Evaluation*); it splits only on `## ` headings outside code fences and fails with a message on a missing file, a
wrong check name, or a file without `## Requirements`. The briefs read the log only through it, and verify claims
within the prompt's tool-call cap (B5). On the parent log the bias check reads 30% of it, the rejection check 46%.
Amended after a live test (user, 2026-10-24): the bias check, given the log's path, read the whole log with the Read
tool before using the script (it saw *Matrix*, *Evaluation* and the leader). Now the researcher runs the script, which
writes the check's extract to a temporary file and prints its path; the check's prompt names only that file, never
the log. The bias extract also drops the tables' Verdict column (by position from the row's end, so a `|` inside an
earlier cell doesn't shift it); the leader can still show in the *Fits*/*Costs* prose (known gap).
Replaced requirements now move to the rounds file's *Replaced requirements*, and the new row's source says which one
it replaces (user: they confuse the main agent too).
Step 4 implemented (2026-10-24): the round's full entry and its searches go once into `<topic>.rounds.md`; the log's
*Rounds* keeps one line per round and *Searches* left the template; `log-template.md` shows both files; the checklist
lines for searches and replaced requirements follow. This log migrated as the first: 53,442 to 44,075 characters,
with `skill-and-log-size.rounds.md` (10,912) holding rounds 1-4, the five replaced requirements and the searches.
Core after the changes: ~4,070 tokens estimated. All four steps done.
Matrix transposed (user, 2026-10-24): options as rows, requirements as columns with a *status* row, so rows stay short
and an option reads across one line; `log-template.md` and the "replaced requirements" rules (old matrix column)
follow. This log's two matrices converted.

**Choice:** part A: A3 with A14 and A19 (A7, A8 for margin); part B: B2 + B4b + B5.
1. SKILL.md becomes a core under 5,000 tokens (target ~4,800, estimated at 3.05 characters per token): the intro,
   the log rules, each phase's procedure as short steps, both checklists. Each step that needs detail names its
   reference file. Detail moves to reference files in the skill folder: the log template; requirement statuses and
   kinds and the written-requirement rules; option categories and source rules; Phase 5's question-tool rules; Phase
   6 steps 2-5; the split/widen section. Rules may be tightened (A7) or dropped by name (A8) for margin; every
   dropped rule is listed for the user (Z7c). Fallback if 5,000 tokens prove truly impossible: "as small as clear"
   with A18 + A10 + A10b (user, round 2).
2. The checks read their own briefs (A14): `checks/bias.md` and `checks/rejection.md` in the skill folder; the main
   agent's prompt names the log, the brief file and the section command, and a fixed line; the bias check's prompt
   doesn't name the leading option, the rejection check's does (Z9b).
3. A script in the skill folder prints a log without a fixed denylist per check (B4b): for both, *Rounds*,
   *Sources*, *Searches*, *Round checklist*, *Decision*; for the bias check also *Matrix* and *Evaluation*. It
   splits on real `## ` headings only. Each brief caps tool calls to verifying specific claims (B5).
4. Each round's full entry and its searches go to `<topic>.rounds.md`; the log's *Rounds* keeps one line per round
   and a pointer (B2). `## Rounds` stays in the log (the gate needs it).
5. The gate prints a visible warning when SKILL.md's body is over ~4,800 estimated tokens (A19).

**Why:**
1. A smaller always-loaded skill is a goal on its own, for rule following and cost: Z8a, Z8b, preferences (user,
   round 1).
2. With the core under 5,000 tokens, a compaction re-attaches all of it, so the round-end and decision procedure
   stay in effect: Z1, preference (parent S3, user, parent round 4). The spike showed a SessionStart hook in skill
   frontmatter doesn't fire after compaction, so the core itself has to fit (round 2).
3. The core stays under the cut as rules are added: the size warning (A19; form chosen by the user, round 3).
4. The checks see the log verbatim by a fixed list, and the bias check doesn't see the leader named: Z9b, preference
   (user, rounds 1-2).
5. What is read of a log each round grows slower: round history leaves the read part (B2), the checks read only
   their sections (B4b) in few turns (B5): Z2b, preference (user, round 1); full history kept in the rounds file:
   Z3, preference (user, round 1).
6. No extra agents or waiting; everything inside the skill folder: Z5, Z6, preferences (parent).

**Rejected (closest first):**
- A13, a hook on every tool call re-injecting the rules after a compaction: redundant while the core fits; left out
  (user, round 3); in the fallback set.
- A10/A10b, the gate showing the round-end rules (and Phase 6) in its deny reason: cheapest Z1 cover, but the skill
  keeps its size (Z8a, Z8b); fallback set.
- A18, a partial move: the cut still falls in the procedure (Z1 ~); fallback for "as small as clear".
- A4, one file per phase: tied with A3, more reads per round (tiebreak by cost).
- A9/A9b, a second skill for the round end: two skill folders until a plugin (Z6).
- A6/A6b, a SessionStart hook in skill frontmatter: doesn't fire after compaction (Z1, measured round 2).
- A1, A2, A5, A11, A15, A16, A17: Z1 ~ or ✗ with no size gain (Z8a, Z8b), or outside the skill folder (Z6), or an
  extra agent per round (Z5).
- B4 (allowlist): misses log-specific sections (Z4). B6: the rejection check re-checks every rejection (Z10). B3,
  B8: lose the history (Z3). B1: unbounded growth (Z2b). B7: tied, a gate rewrite (tiebreak by cost).
- Later: A12 (the hook in a plugin), B9 (checks on a smaller model).

**Known gaps:**
- The 5,000-token fit is an estimate with a thin margin; measured after the rewrite.
- A reference file read before a compaction is gone after it until the next step opens it again.
- The shared 25,000-token budget can drop the skill when five or more skills were invoked after it (A13 left out).
- Z2b is slower growth, not a hard bound: *Options* and *Requirements* still grow with the number of options.
- The bias check's verbatim *Options* still names the leader in its verdict column.
- The gate (and A19) is off in a resumed session until the skill is invoked again (spike); "probably rare; it's
  fine" (user, round 2). Belongs to the parent's known gaps too.
- No compaction has been seen in any run (up to 360K of 1M); Z1's weight rests on a rare event.

**Decision checklist:**
- [x] Stop condition: no new requirements, no ranking change, nothing deciding left unverified
- [x] Why and Rejected: each on a requirement the user confirmed; confirmed by the user
- [x] Known gaps and open child decisions: listed in *Decision* (no children)
- [x] Documentation: updated where the rule takes effect; overstated requirements corrected; commit message proposed (parent log: child decided, resume gap; the rule takes effect in SKILL.md itself, the implementation; no git)
- [x] Steps: commit-sized; success criteria carried over only as project rules (the 5,000-token core as A19's warning; the skill folder has no git, so review steps, not commits)
- [x] Out of scope: noted where open work is kept (`~/Cboost/Notes/_global/TODO.md`, created)
- [x] Overview: choice, pros and cons, rejected, gaps, plan, files
- [x] Review: in open chat; nothing implemented before it

# Skill and log size: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| Z2 | A log's reading cost per round doesn't grow with all earlier rounds | each check subagent re-sends the whole log on each of its 4-12 turns; the parent log is ~26K tokens after 13 rounds | user, 2026-10-24 (added log growth to this decision) | Z2b (round 1 answer) |
| Z7 | Shortening the skill drops no rule silently; a rule leaves only with evidence it never paid off and the user's OK | each rule came from a real skip or error in a run | inferred | Z7b (round 1 bias check: nobody records when a rule did nothing, so that evidence can't exist) |
| Z7b | No rule is moved out of the skill's always-loaded text or dropped without being listed for the user | each rule came from a real skip or error in a run | inferred; round 1 bias check | Z7c (round 3) |
| Z8 | The skill's own token cost per turn goes down | ~9,900 tokens re-sent every turn | inferred from the session request ("reducing the skill's size") | Z8a and Z8b (round 1 bias check: two goals in one) |
| Z9 | The checks get the log's sections verbatim by a fixed list per check, not chosen or paraphrased by the main agent, and a brief that doesn't name the leading option | the main agent's bias reaches the checks through what it leaves out, how it paraphrases, and naming its favourite | user, round 1 (asked whether a section script reduces bias; chose "yes, both") | Z9b (round 2) |

## Round 1
Resumed the log (no rounds yet). Outdated: SKILL.md grew from 27 KB to 31.6 KB; the token count was estimated, now
measured (~9,900, not ~6,800), so the cut lands at line ~249 (Phase 4 step 1), not ~277; truncation direction now
verified (the start is kept). New: no compaction up to 360K in any run; check cost scales with turns per check (4-12);
the two parts have separate options. Leaders: A6 (compaction hook) for part A, B2 + B4 (rounds in a second file,
sections per check) for part B. A3 (core under 5,000 tokens) waits on whether size is a goal (Z8).
Rejection check: A4 and B7 trailed on a stretched Z5 (file reads aren't agents or waiting): now candidates, ties broken
by cost; A8's Z7 was stretched; B9 needed a record; A9's Z1 made ~ like A5; garbled A1 record fixed.
Bias check: Z8 split into Z8a (per-turn cost, cache reads, likely minor) and Z8b (adherence); Z7 replaced by Z7b
(listed for the user; the evidence Z7 asked for can't exist); Z1 reworded (the steps survive, the how is lost); Z2's
unit (tokens or price) asked; B2 overlaps B4 (with B4 the checks never read *Rounds*), so B2 is resume-only; A6's
re-read is itself a skippable step, so A6b prints Phase 5; A3's Z1 is ~; new options A10 (deny reason with the full
round-end rules), A11 (`/clear` and resume), A12 (plugin hooks.json, later); B5 (fewer turns) raised.
Ranking after the checks: part A leading A6b, runner-up A10, A3 leading instead if Z8b is a goal; part B leading B4 +
B5, B2 an add-on for resume. Measured: the two checks, run as B4 + B5 by hand, cost ~44K tokens each.

## Round 2
Answers (round 1): a smaller skill is a goal on its own, for rule following and cost (Z8a, Z8b preferences; A3 leads,
with A6b); the log must not grow without limit, any solution keeping its size under control is fine (Z2b, preference);
full round entries and their searches may go to `<topic>.rounds.md` (Z3 settled; B2 leads with B4 + B5); checks get
fixed, verbatim sections and a brief without the leader's name (Z9, new preference; the user asked whether a section
script reduces bias: it removes the main agent's choice and paraphrase of what the checks see, not bias in the log's
content); one log, not split. Spike agreed: a throwaway project skill with SessionStart hooks in its frontmatter
(`<scratchpad>/compact-spike`), run by the user with `/compact`. Gate, live: the round 1 question call and its
follow-up were let through with the checklist complete (allow path works; deny path not yet seen live).

Spike (Claude Code 2.1.310, throwaway project skill with hooks in its frontmatter, each hook appending to a file
before printing `additionalContext`):
- Interactive, user: `/compact-spike`, `/compact`. The transcript shows the compaction (`compact_boundary`, manual)
  and the skill text re-attached (`invoked_skills`), but no hook ran: no file written, no marker in context. So a
  `SessionStart` hook declared in skill frontmatter does not fire after compaction. A6 and A6b fail Z1 (✗).
- Headless, `claude -p` with `--resume` per step (each a new process): not even the PreToolUse hook fired, before or
  after `/compact`. So skill hooks are not re-registered when a session is resumed: the gate is off in a resumed
  session until the skill is invoked again (a gap in the parent decision, new).
- Headless, one process (invoke the skill, then Bash): the PreToolUse hook fired and its `additionalContext`
  reached the model ("SPIKE-MARKER-pretool"). So a skill's PreToolUse hook can inject text before a tool call.
- Interactive, user (Bash call, `/compact`, Bash call): the PreToolUse hook fired both times, and its
  `additionalContext` was attached after the compaction too (`hook_additional_context`). So skill hooks, the gate
  included, survive a compaction within the session, and a PreToolUse hook can re-inject text after one.
Ranking: A6/A6b trail (Z1 ✗, measured). New A13: the skill's PreToolUse hook notices a compaction in the transcript
and re-injects the round-end rules on the next tool call (mechanism verified by the spike). A3 now covers Z1 by itself
when its core fits under 5,000 tokens: the compaction re-attaches all of it; A13 then only covers the shared 25,000
budget dropping the skill when many skills were invoked. Leading: A3 (+ A13 as an add-on or as the fallback if the
core can't fit); runner-up A10. Context window of this setup: 1,000,000 tokens (headless run's `modelUsage`).

Rejection check (sections by fixed list, ~46K tokens, 2 tool calls): A1, A5, A8 records still compared with A6b
(measured ✗): re-based on A3; verdict mismatches A1/A2, A5/A11, A7/A8 resolved (A2, A11 trailing; A7, A8 add-ons);
B6's Z4 ~ is shared by B5, so B6 now trails on Z10 (every rejection re-checked every round, requirement-reasons Q13,
added as a row); B8's variant is a cost tiebreak, said so; Z2b and Z9 rows added to part B's matrix; A12 got a record.
Bias check (sections by fixed list, brief without the leader, ~46K tokens, 5 tool calls): Z1 rests on a compaction
never seen, so part A rests on Z8a/Z8b; Z8b's premise is limited (reference files once read stay in context, so the
gain is in rarely needed parts and recency); Z8a is small in money (~300K full-price tokens per run); Z2b is slower
growth, not a bound (options and requirements still grow); ranked A13 first and A3 as a later step; new options A14
(checks read their own briefs from the skill folder), A9b, A15, A16, A17, B4b (denylist).
Ranking after the checks: part A leading A3 + A13 + A14 (A14 is the cheapest move of A3, A13 the compaction cover);
the order of steps is asked (A13 and A14 first, A3 later, or A3 first). Part B leading B2 + B4b + B5. Z9 and the
rejection check conflict (it must compare with the leader): asked.

## Round 3
Answers (round 2): A3 first, then A13 (for the shared-budget case); A3's core under 5,000 tokens if at all feasible,
"as small as clear" only if truly impossible; Z9 narrowed to Z9b (no leader named for the bias check only); the gate
being off after a session resume "will probably be rare; it's fine" (known gap of the parent, no rule).
Feasibility of the 5,000-token core (estimate from section sizes, not measured): moving the log template (~1.9K
characters), Phase 2's status and kind lists and written-requirement rules (~3.5K), Phase 3's categories and source
rules (~2K), the check briefs (A14, ~2K), Phase 4 step 7 (~0.6K), Phase 5's question-tool rules (~1.5K), Phase 6
steps 2-5 (~3.3K) and the split/widen section (~1.3K) leaves a core of ~14K characters, ~4,600 tokens at the measured
3.05 characters per token: feasible with a thin margin; A7 (tighter wording) adds margin. Measured after the rewrite.

Bias check (denylist extraction, B4b by hand; ~47K tokens, 4 tool calls): Z1 rests on a compaction never seen, but
part A now rests on Z8a/Z8b, which the user made goals (round 1); A13 is redundant while A3's core fits (it then only
covers five or more skills invoked after this one); the core estimate is plausible but thin and needs a size guard
(A19, new); a reference file read before a compaction is gone after it until the next step opens it (A3's row
corrected); new A18 (partial move) and A10b (gate shows Phase 6 at the first *Decision* write).
Rejection check (~51K tokens, 2 tool calls): A1/A2's Z7b ✓ against A3's ~ now weighed in their record; A11's user
turn marked as covered by no requirement; A9 had no record and rated above its better variant A9b: both trailing now,
A9b on Z6 only; A15 didn't fail Z2b (a constant, replaced each round): re-based on Z8a/Z8b; B6's bias-check saving
is real under B4b: noted; part B matrix got a B4b column, Z2b cells all ~ (slower growth, no hard bound), B4's Z4 ~;
stale Z2/Z9 citations fixed.
Ranking after the checks: part A leading A3 (with A14 and A19; A7, A8 for margin); A13 moved from add-on to the
fallback set (A18 + A10 + A10b or A13) for the case the core can't fit; runner-up A10. Part B unchanged: B2 + B4b + B5.

## Round 4
Answers (round 3): Z7b replaced by Z7c, only dropped rules are listed (moves to reference files need no list);
A13 left out while the core fits (the shared-budget case a known gap); A19 as a warning printed by the gate; no
remarks. No ranking change, no new requirement that changes it, nothing deciding left unverified: stop condition met.
Moved to *Decision* (draft).

## Searches (rounds 1-2, recorded before entries carried their own)
- Claude Code skills docs: compaction re-attach (direction: the start is kept; verified), supporting files, 500-line tip.
- Claude Code hooks docs (two parts): SessionStart `compact`, PostCompact, PreCompact, `additionalContext` cap,
  skill-frontmatter hook lifetime, `reloadSkills` (re-scans skill folders; not useful here). Not found: which events
  skill frontmatter supports.
- Web: auto-compact threshold on 1M windows (conflicting third-party reports); re-injecting rules after compaction
  (SessionStart `compact` is the common pattern); long-running agent logs (summarize-and-archive, external notes).
- Local: section sizes of SKILL.md and the parent log; peak context and compactions of the 4 sessions using the
  skill; turns and tokens of the 7 check subagents in the parent run; vault git history (2 commits).
- requirement-reasons.md: Q7, Q8 (the log may be verbose; weight is no limit).
- Round 2: no web search. Spike runs (interactive and headless) on hook behaviour after `/compact` and on resume.

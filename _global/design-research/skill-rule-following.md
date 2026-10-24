# Skill rule following

## Problem
The agent running the design-research skill skips rules the skill already has. The skill keeps growing, so each new
rule risks being skipped too. The agent must reliably apply the rules of the step it is on, and the user must be able
to see when one was skipped.

## Related decisions
- Parent: `requirement-reasons.md` (decided). Sibling: `option-discovery.md` (open; its outcome adds Phase 3 rules,
  so it should follow this one).

## Success criteria
- Judged by the user over the next real runs: fewer skipped rules, and any skip is visible to them in the chat
  before it decides something.
- Held-out check (the skill's own rule): judge the options against skips not used to design them; the round 1
  independent check is asked for skips in transcripts beyond those listed below.

## Known skips (evidence)
| # | Rule | Run, round | In the loaded skill text? | Kind |
|---|---|---|---|---|
| K1 | Verify every unverified requirement before the decision (R15, R12 decided rejections) | run 1, round 6 | No: added to SKILL.md at 22:25, skill invoked at 21:15 (transcript, verified) | stale text: rule added mid-run, never re-read |
| K2 | Ask about an unverified requirement that decides the ranking (R2 sat in *Open questions* five rounds) | run 1, rounds 1-5 | Yes | skip, at the round report |
| K3 | End every question call with an "other remarks" question | run 2, round 1 | Yes | skip, at the round report |
| K4 | Reasons empty rather than guessed (Q8, Q10) | run 2, rounds 2-4 | No: rule written after those rounds | missing rule, not a skip |
| K5 | Phase 6: an objection sends the research back into a round | run 2, review | Yes (amended afterwards) | skip, at the review |
| H1 | Independent check before each round report: none before round 3's report or the decision overview, which then claimed "every requirement ... is checked" | run 2, round 3 and review | Yes | skip, at the round report (held out: found by the round 1 check, not used to design the options) |
| H2 | Update the log at the end of every round: the orientation question was asked without a log edit | run 2, review | Yes | skip, at the round report (held out) |
No compaction happened in either run. Pattern: every real skip (K2, K3, K5, H1, H2) is a step at the end of a round,
when the report is sent; K1 and K4 are about the skill text changing during the run.

## Facts about the mechanism
- The skill body enters the conversation once, when invoked; "Claude Code does not re-read the skill file on later
  turns, so write guidance that should apply throughout a task as standing instructions" (code.claude.com/docs/en/skills).
  Edits to SKILL.md during a session are not seen unless the file is re-read.
- On compaction, Claude Code re-attaches only the first 5,000 tokens of each invoked skill (shared budget 25,000).
  SKILL.md is 27,329 bytes / 4,666 words (~6,800 tokens); 20,000 characters ends around line 277 (Phase 4 step 7), so
  after a compaction Phase 5 (report, questions), *Iterate* and Phase 6 (decision, review) would be gone. Not the
  cause of K1-K5, but a certain future failure in a long run.
- Anthropic's skill guide: keep SKILL.md under 500 lines; move detail to reference files one level deep; for complex
  workflows "provide a checklist that Claude can copy into its response and check off as it progresses"; feedback
  loops (validate, fix, repeat); "if workflows become large ... push them into separate files and tell Claude to read
  the appropriate file based on the current task".
- Skill frontmatter may declare `hooks` (registered on invocation, run for the rest of the session; `once: true`
  available). PreToolUse/PostToolUse/Stop can add `additionalContext` (capped at 10,000 characters). Claude Code
  only; other environments ignore the field. Under `strictPluginOnlyCustomization` a personal skill's hooks don't run.
- IFScale (arXiv 2507.11538, 2025): instruction following degrades as the number of simultaneous instructions grows;
  models are biased toward earlier instructions. "Lost in the middle" (Liu et al., 2023): content in the middle of a
  long context is used less.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Status |
|---|---|---|---|---|
| S1 | No dependency on the user's own setup; Claude Code is the only environment that matters (prose need not work alone) | others may use it, within Claude Code | memory `design-research-skill.md` (user, 2026-10-23); user, rounds 2 and 7 | preference |
| S2 | The current step's rules are in front of the agent when it acts; the user doesn't need to read them | the agent skips round-end steps (K2, K3, K5, H1, H2) | user, round 2 ("help the agent itself") | preference |
| S3 | The rules of the current phase stay in effect after a compaction | Phases 5-6 lie past the ~5,000-token re-attach (estimated from 4 chars/token, not measured; truncation direction not verified) | inferred from the docs; user, round 4 | preference: a restructure is needed, but as a separate decision after this one |
| S4 | Extra chat text per report stays small | | inferred; user, round 3 accepted ~6 checklist lines per report | rejected: ~6 checklist lines per report are fine |
| S5 | Extra cost per round (subagents, tokens) stays acceptable | | inferred; the user accepted two subagents per round (run 2, round 3) | unverified; moot unless O9 (a third subagent) is chosen |
| S6 | The running agent works from the current skill text, though the skill is edited during the runs that use it | K1: a rule added mid-run was never seen; K4, K5: rules changed mid-run | transcripts of runs 1 and 2 (round 1 check) | rejected: the user edits the skill in separate sessions from now on (round 2) |
| S7 | The skill's author can keep it up: no rule stated in two places that can drift apart | | inferred (round 1 check) | unverified |
| S8 | The end-of-round steps happen every round: ask the deciding questions, the remarks question, both checks, the log update | K2, K3, H1, H2: each let an unchecked claim or a dropped option through ("every requirement is checked" was false) | the user's problem statement (2026-10-24); the skips; user, round 4 | preference |
| S9 | The gate touches nothing outside the research: active only from the first research-log write in a session until the log's *Decision* is filled | hooks stay registered for the rest of the session; unrelated questions must not be blocked or labelled | user, round 4 | preference |
## Options
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O1 | Do nothing | S1, S4, S5, S7 | K2, K3, K5, H1, H2 continue; mid-run edits stay unseen (S6) | cheap | trailing (S6, S8) |
| O2 | A checklist block at the end of each phase, with a stable heading (`### Phase 5 checklist`); Anthropic's pattern | S1; each round-end step becomes a line | Rules stated twice (S7) unless the checklist replaces the prose list; still self-applied; Phases 5-6 lie past the compaction cut (S3) | cheap | candidate |
| O3 | Each report opens with a state line (`Round 3 · Phase 5`) and ends with the phase checklist ticked, in the chat (user's idea; Anthropic: "copy into its response and check off") | Visible to the user before they answer: K3, H1 would have shown | Longer reports (S4); a tick can be false | cheap | candidate |
| O4 | Re-read the current phase's section (by stable heading) from SKILL.md before acting on it | S3, S6 | Tool calls per phase; relies on remembering to re-read, which is itself a step | cheap | candidate |
| O5 | Shorten SKILL.md to the procedure; move rationale and detail to reference files, so the core fits the compaction budget | S3; fewer instructions in context (IFScale) | A rewrite; reasons move out of sight | costly | candidate |
| O6 | Split by phase: SKILL.md as an index plus a file per phase, read on entering it (Anthropic tip) | S3, S6 (the file is read fresh); the current phase's rules sit at the end of context | More files (S7); reading on entry is itself a step | costly | candidate |
| O7 | Skill-scoped hooks that add a reminder to Claude's context at the right moment, e.g. PreToolUse on AskUserQuestion ("the last question asks for other remarks") | Runs outside the agent's memory; reads the current files (S6) | Claude Code only (allowed, S1); scripts to maintain (S7); spike 1: the reminder arrives with the answers, too late (S2) | cheap | candidate |
| O8 | A *State* section at the top of the log: round, phase, the phase checklist ticked; updated with the log each round | S3 (survives compaction and sessions); a slot makes a step get done | One more section; ticks can be false; the log update is itself a skipped step (H2) | cheap | candidate |
| O9 | A compliance check: before sending the report, a fresh subagent checks the draft report and the log against the phase checklist | Independent judgment | A third subagent (S5); it is itself a round-end step, and H1 shows subagent checks get skipped | cheap | candidate |
| O10 | A Workflow script that runs the phases deterministically | Strongest ordering | Needs the user's opt-in per run; Claude Code only; replaces the prose rules (S1); rigid for a conversational process | costly | trailing (S8 only partly: questions to the user don't fit a fixed script) |
| O10b | A Workflow per round for the mechanical steps (searches, matrix and verdicts, rejection records, both checks, the round entry with its checklist); the main agent keeps framing, the report and the questions; the prose rules stay as the fallback outside Claude Code. A skill that tells the agent to call Workflow counts as the user's opt-in (Workflow tool description) | Steps inside the script can't be skipped (S8); each subagent gets only its step's instructions (S2, IFScale); the procedure lives outside the context (S3); runs only during research (S9) | Several agents per round (S5; the session guideline keeps workflows under 10 agents); a JS script, prompts and schemas to keep in step with the prose (S7); a background run per round; subagents know only the log, not the chat; calling the workflow is itself a step (the gate can check its entry); questions to the user stay with the main agent | cheap | candidate (spike pending) |
| O11 | Stronger wording ("MUST") on the rules that were skipped | Cheap; Anthropic mentions it | No evidence it helps; inflates emphasis until nothing stands out; changes nothing the user sees | cheap | trailing (S8) |
| O12 | Prune: remove or merge rules that never paid off | IFScale; lower token cost; S7 | Needs evidence per rule | cheap | candidate (add-on) |
| O13 | Keep the skill text current during a run: after editing SKILL.md, re-invoke the skill (or edit it only in a separate session) | S6: K1, K4, K5 | A rule to remember after an edit; a re-invoke adds a second copy to the context | cheap | candidate |
| O14 | The environment's task list (TodoWrite or similar) for the round-end steps | Visible to the user without chat text (S4) | Not available in every environment (none in this session's tool set); still self-applied | cheap | candidate |
| O15 | A replay/eval harness (skill-creator evals) that tests a skill version against transcripts of past runs | Measures the options instead of guessing; supports the success criteria | Building and keeping the evals (S7); cost per run | cheap | candidate (add-on, for the success criteria) |
| O17a | Gate on tool calls: a skill-scoped PreToolUse hook on AskUserQuestion that reads the transcript and denies the call, with the round-end checklist (read from SKILL.md) as the reason, when the last question isn't a remarks question, or no subagent check or log edit happened since the previous question call; the agent fixes it and calls again | Deterministic for K3, H1, H2; the checklist arrives at the exact moment, from the current file, after any compaction (S2, S3) | Claude Code only (S1: allowed as a layer); a transcript-parsing script (S7); false denials on questions that aren't round reports (the first log-location question; hooks stay registered after the research ends); can be passed without the real work (two empty Agent calls, a one-character log edit); parses the internal transcript format (tool names have changed before) | cheap | trailing (S7) |
| O17b | Gate on the log: the same PreToolUse hook denies the call unless the log's newest *Rounds* entry has non-empty "Bias check:" and "Rejection check:" lines and the log changed since the previous allowed question call (the hook keeps a marker per session); the log is found from the file paths of the session's Read/Write/Edit calls (a `.md` with `## Rounds`), so a resumed session counts; inactive once the log's *Decision* has text | Checks content, not tool calls, in one markdown file; works on resume (S9); the checks' findings become visible in the log | Still a script (S7); content can still be faked, but in plain sight; follow-up and clarifying calls need an exemption; runtime on Windows | cheap | leading (with O18) |
| O17c | Gate by a model: a `type: "prompt"` (or experimental `type: "agent"`) hook at PreToolUse judges, from the log, whether the round-end steps were done, including the deciding questions (K2) | Hardest to fake; covers judgment steps | A model call per question (S5); 30 s / 60 s timeouts; agent hooks are experimental; prompt-hook support on PreToolUse unverified | cheap | runner-up (if O17b gets gamed) |
| O18 | Before the question call, the agent copies the round-end checklist (Phase 5's list rewritten as one) into its response and ticks it (Anthropic's pattern, as a cue for the agent) | S2 in prose, works everywhere (S1); one source for the steps (S7) | ~6 lines of chat per round (S4); still self-applied | cheap | candidate |
| O16 | A Stop hook (skill frontmatter) that reminds the agent when a turn ends with a question but no subagent check or log edit since the last one | Deterministic for H1, H2; reads the transcript, not memory | Claude Code only (allowed, S1); a script that parses the transcript (S7); fires after the turn, but questions go out mid-turn (S2) | cheap | candidate |
## Matrix
| Requirement | Status | O1 | O2 | O3 | O4 | O5 | O6 | O7 | O8 | O9 | O10 | O10b | O11 | O12 | O13 | O14 | O15 | O16 | O17a | O17b | O17c | O18 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S1 | preference | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ O10 |
| S2 | preference | ✗ | ~ | ✓ | ✓ | ~ | ✓ | ✗ | ~ | ~ | ✓ | ✓ | ✗ | ✗ | ✗ | ~ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ O1, O7, O11, O12, O13, O15, O16; ~ O2, O5, O8, O9, O14 |
| S3 | preference (deferred to its own decision) | ✗ | ✗ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✗ | ~ | ✗ | ~ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ O1, O2, O11, O13, O15, O18; ~ O3, O9, O12, O14 |
| S5 | unverified (moot unless a model or subagent is added) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ~ O9, O15, O17c, ~ O10b |
| S7 | unverified | ✓ | ✗ | ~ | ✓ | ~ | ~ | ~ | ✓ | ✓ | ✗ | ~ | ✓ | ✓ | ✓ | ✓ | ~ | ~ | ✗ | ~ | ~ | ✓ | ✗ O2, O10, O17a; ~ O3, O5, O6, O7, O15, O16, O17b, O17c, ~ O10b |
| S8 | preference | ✗ | ~ | ~ | ~ | ~ | ~ | ✗ | ~ | ~ | ~ | ~ | ✗ | ✗ | ✗ | ~ | ✗ | ✗ | ~ | ~ | ~ | ~ | ✗ O1, O7, O11, O12, O13, O15, O16; ~ all others, ~ O10b |
| S9 | preference | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ~ O7, O16 |
S4 and S6 are rejected and have no rows. No option meets S8 fully: the gates check the remarks question, the checks
and the log update, not whether the deciding questions (K2) or the review rule (K5) were followed; those stay with
O18's checklist.
## Evaluation
- Two causes: the round-end moment (K2, K3, K5, H1, H2, and H1 again in this run's rounds 2-4) and stale skill text
  (K1, K4; closed by S6 rejected: edits move to separate sessions). Leading: O18 (checklist copied and ticked, prose,
  everywhere) + O17b (gate on the log, Claude Code).
- Spikes: a skill-scoped PreToolUse hook matches AskUserQuestion; its context arrives only with the answers (too late
  for a reminder); a deny blocks the call before the user sees it and hands the reason to the agent at once.
- Known holes in the gate: plain-text questions bypass it (the skill must say: in Claude Code, always ask through the
  tool); fakeable content (visible in the log; check the next runs' transcripts); follow-up calls (the tool's
  4-question limit) and clarifying questions mid-round need an exemption; runtime on Windows; it fails open if the
  script breaks, so it must say so visibly.
- Rejection records (verdicts rest on preferences the user confirmed in rounds 2-4; none is core):
  - O1 trailing (S2, S8): nothing is in front of the agent at the round end, and nothing changes there. Best variant:
    O1 + O18, which is O18.
  - O2, O3: part of O18 (the checklist is Phase 5's list rewritten, so no rule is stated twice, S7).
  - O4, O5, O6, O8 (state section), O12: their remaining case is S3, deferred to the compaction decision; not rejected.
    O8's own skip risk (the log update) is covered by O17b, which checks for a log change.
  - O7 trailing (S2): spike 1 showed a PreToolUse reminder lands with the answers, after the questions went out.
    Working variant: O17b.
  - O9 trailing (S8 same as leader, S5): its subagent is itself a skippable step (H1); enforced by a gate it becomes
    O17c.
  - O10 trailing (S1): the full replacement drops the prose rules, which S1 says must work alone. Corrected after the
    user's challenge (round 7): the earlier "needs opt-in per run" was wrong (a skill instruction counts as opt-in),
    and S1's "prose must work alone" came from the researcher's own answer option, its reason never asked. Best
    variant O10b (per-round workflow, prose fallback) avoids S1 and is a candidate.
  - O11 trailing (S8): changes nothing at the round end.
  - O13: not needed, S6 rejected; a habit for the author (edit in separate sessions).
  - O14 trailing (S2 ~): the same self-applied cost as O18 and not available in every environment (none in this
    session's tool set); O18 gives the same cue in prose.
  - O15: an add-on for the success criteria (measure the gate over the next runs), not a rival.
  - O16 trailing (S2): a Stop hook fires after the turn, but the questions go out mid-turn. Possible backstop for
    plain-text questions only.
  - O17a trailing (S7): parses the internal transcript format and checks tool calls, not content; O17b checks the
    log instead.
  - O17c runner-up: wins if O17b gets gamed; costs a model call per question (S5) and an experimental feature.
## Open questions
1. Gate form: O17b (log content) or O17c (a model judges)? (S5, S7.)
2. Hook runtime on Windows: which interpreter (Node, Python, PowerShell + sh pair), or Linux-only first, failing open
   with a visible message? (S1, S7.)
3. Exemptions: follow-up calls (after a call with 4 questions) and clarifying questions mid-round. (S8, S9.)
## Sources
| Claim | Source | Date | Reliability |
|---|---|---|---|
| Skill body loads once on invocation; not re-read on later turns | code.claude.com/docs/en/skills | 2026-10-24 | primary |
| Compaction re-attaches the first 5,000 tokens of each skill, 25,000 shared | code.claude.com/docs/en/skills | 2026-10-24 | primary |
| Skills may declare `hooks`; `once`; context via `additionalContext`, 10,000-char cap | code.claude.com/docs/en/skills, /hooks | 2026-10-24 | primary |
| Checklist to copy and tick; SKILL.md under 500 lines; reference files one level deep; feedback loops | platform.claude.com skill best practices | 2026-10-24 | primary |
| Instruction following degrades with instruction count; bias toward earlier instructions | arXiv 2507.11538 (IFScale), abstract | 2026-10-24 | primary, abstract only |
| A visible checklist lowered skip rates | dev.to "visible checklist pattern" | 2026-10-24 | anecdote |
| Agents skip acknowledged verification steps | Claude Code issue reports (claudeissues.com 27961, 79340) | 2026-10-24 | anecdote, real reports |
| No compaction in run 1 (~268K context) or run 2 | session transcripts, grep for compact markers and token usage | 2026-10-24 | primary (local) |

## Searches
- Claude Code skills docs (loading, compaction, frontmatter): found the 5,000-token re-attach and skill hooks.
- Claude Code hooks docs: hook events that add context; cap; skill hook lifetime. AskUserQuestion as a matcher not
  mentioned (unverified; a spike can test it).
- Anthropic skill authoring best practices: checklist pattern, length, progressive disclosure.
- "IFScale instruction density": found the paper (abstract only).
- "LLM agent step skipping checklist ...": practitioner posts and issue reports, no controlled study.
- Local transcripts of run 1 and run 2: no compaction markers; run 1 context ~268K at the end.

## Rounds
### Round 1
Framed from the known skips (K1-K5) and the mechanism facts. Main new fact: compaction keeps only the first ~20,000
characters of SKILL.md, cutting Phases 5-6. Twelve options in three layers (where rules live, how the current step is
brought forward, who checks). No ranking yet beyond three trailing options; requirements S1-S5 all unverified.
Rejection check: the records leaned on S2 as if it were the need and stretched S1 ("sharable" read as "outside Claude
Code"); O7 and O10 got different marks for the same Claude Code-only cost; O7 doesn't reach the chat (S2 ✗, now no
row); O2's checklists for Phases 5-6 lie past the compaction cut (S3 ✗); O10's variant was misnamed. Fixed.
Bias check: K1 and K4 were not skips (verified for K1 in the run 1 transcript: invoked 21:15, rule added 22:25; K4's
rule came after its rounds); held-out skips H1 (no independent check before round 3's report or the decision
overview of run 2; true) and H2; S2 is a mechanism, its need unasked; S3 rests on an unseen failure and estimated
token counts; new requirements S6 (mid-run edits) and S7 (maintenance), and S8 written from the problem; new options
O13-O16. Result: two causes, the round-end moment and stale skill text; no option leads yet.

### Round 2
Answers: the visible step is a cue for the agent, not for the user (S2 preference); Claude Code-only features are fine
as an extra layer (S1); skill edits move to separate sessions (S6 rejected, so stale text stops being a cause and O13
is a habit for the author, not a skill rule). Effect: S4 (small chat text) weighs more, since the user doesn't need
the visible checklist; O7/O16 come back as add-ons; O4/O6 keep only the compaction case (S3).
Leading idea: one round-end checklist, kept in one place (Phase 5's list turned into it, S7), brought in front of the
agent at the moment it sends the questions, by a hook that reads it from SKILL.md (current text; survives compaction).
Unknown: whether a skill hook can match AskUserQuestion and where its context lands. Spike: a throwaway skill
`~/.claude/skills/hook-spike/` with PreToolUse/PostToolUse/Stop hooks; not loadable mid-session ("Unknown skill"),
so it waits for a later turn or session. From the docs: PreToolUse context lands next to the tool result, i.e. after
the user answered, so a reminder there is too late; the call runs inside the turn, so Stop is too late as well. Hence
O17: a gate that denies the call instead of reminding. Added O18 (checklist copied into the response, prose only).

### Round 3
Spike 1 (hook-spike, this session): a skill-scoped PreToolUse hook matches AskUserQuestion; it fired at 17:14:07,
before the dialog; its `additionalContext` reached the agent with the answers (17:18), so a reminder there is too
late. PostToolUse fired after the answers. Skills created mid-session load after a turn or two (first try: "Unknown
skill").
Answers: the gate (O17) "seems the most robust", efficacy unsure (so measure it: watch the next runs); O18 yes, the
ticked checklist in each report.
Leading: O18 (prose, everywhere) + O17 (gate, Claude Code). Spike 2 (hook-spike2): a PreToolUse hook returning
`permissionDecision: deny` blocks AskUserQuestion before the user sees it, and its reason reaches the agent at once
as the tool error; the next call passes (state kept in a marker file). So O17 works as a gate. Both spike skills
deleted; their hooks stay registered until this session ends (harmless: one adds context, the other now allows).
Open for O17: how to avoid false denials on questions that aren't round reports (the first question; questions after
the research ends, since hooks stay for the session).

### Round 4
Answers: gate scope tied to the log (S9; the user asked whether a label would affect chats outside the skill: only
sessions that loaded it, but then for the rest of the session); S8 preference; S3 preference, restructure later as its
own decision (child). Skipped by the researcher in this run: no independent checks before the round 2, 3 and 4
reports (H1 again, with this research's own subject in view): fresh evidence for the gate. Both checks run now,
before the decision overview.
Gate design so far: active while a research log written in this session has an empty *Decision*; per question call,
deny unless (a) the last question is the remarks question, (b) since the previous question call there were two
subagent calls and an edit to the log. Open detail: follow-up calls in the same round (the tool's 4-question limit)
would need the checks again.

### Round 5 (checks before the decision overview)
Bias check: the gate on tool calls can be passed without the real work and parses an internal format; plain-text
questions bypass it; follow-up and clarifying calls get denied; activation on "log written" misses resumed sessions;
several logs and the template placeholder need care; Windows runtime; suggested a gate on the log's content
(O17b), activation on log read, a model-run hook (O17c; docs: `type: "prompt"` single-turn, `type: "agent"`
experimental, timeouts 30 s / 60 s; PreToolUse support not confirmed). Hook input has `transcript_path`,
`tool_input`, `scratchpad_dir`; shell is bash, or PowerShell on Windows without Git Bash.
Rejection check: O1's S6 citation void; O10's real reason is S1 as worded; O2/O3 absorbed, O4-O6/O8/O12 deferred
not rejected; O7/O16's reasons were only in *Rounds*; matrix stale (S4, S6 rows, S1 marks, missing S2, S9 rows,
merged cells). All fixed above. Ranking: O18 + O17b leading, O17c runner-up.

### Round 6
Answers: O17b, but the gate checks the complete round-end checklist, not only the two checks (user: "collect all the
steps completely into the checklist"); Linux first, failing open with a visible message elsewhere; follow-up calls
pass with a first question headed "Follow-up". S7 (maintenance) not asked; the user chose a script knowing its cost.
Draft round checklist (each round entry in *Rounds* ends with it; the gate requires every line, filled):
```
Checklist:
- Requirements: <new or changed ones, each with reason, source and status; changed meanings got new IDs>
- Deciding unverified requirements: <asked this round, or carried as assumptions after "can't answer">
- Options and searches: <options added; what was searched, in *Searches*>
- Deciding claims: <cross-checked against a second source, or marked unverified>
- Matrix and verdicts: <matrix updated; one rejection record per trailing or not applicable option>
- Harms, reversibility, stress test: <for the leading option>
- Bias check: <its findings and what changed>
- Rejection check: <its findings and what changed>
- Report: <what changed; recommendation only as far as the evaluation shows; core rejections, one line each>
- Questions: <deciding unverified ones first, each tied to options; through the question tool; remarks question last>
```
Draft decision checklist (Phase 6, copied and ticked, not gated, since the gate is off once *Decision* has text):
every unverified requirement verified or listed as an assumption; *Why* and *Rejected* rest on confirmed requirements
and were confirmed; docs and rules updated where they take effect, overstated requirements corrected; commit-sized
steps, success criteria carried over only as project rules; out-of-scope problems noted; the whole overview reviewed
in open chat, changed only through a round or a small amendment.

### Round 6, completeness check
The draft missed many steps (log path and resume on round 1, scope split/widen, replaced requirements, written
requirements' evidence, option categories and licences, "no web search", the full rejection record, reversibility
for every option, ranking change, runner-up, ordering of questions, stop and wait, pushback; on the decision side the
stop condition, known gaps, commit message, the overview's six parts, no implementation before review). It merged
steps so a filled half hides an empty one; "filled" needs a definition (no placeholder; "n/a" with a reason); the
log-changed check was lost; SKILL.md itself matches "a `.md` with `## Rounds`"; Phase 6's confirmation question would
be gated; the "Follow-up" header skips everything (accepted by the user, visible). Folded into the draft decision.

### Round 7 (review)
The user challenged O10's rejection ("why is replacing plain-text rules a bad thing?"). Re-evaluated: the record had
two errors: "needs the user's opt-in per run" is false (a skill instruction to call Workflow counts as opt-in, per the
Workflow tool description), and "replaces the prose rules (S1)" holds only for full replacement; S1's "prose works
alone" came from the researcher's answer option in round 2, its reason never asked. New variant O10b (workflow per
round for the mechanical steps, prose fallback). Facts (workflow-authoring reference): subagents return data, they
don't talk to the user; workflows run in the background; scripts have no file access (agents do); a script can be
run by `scriptPath`; the session guideline is under 10 agents per workflow. Open: cost and quality per round (spike),
and S1's real reason. The decision goes back into a round.
Answers (round 7): Claude Code is enough (S1 narrowed); the spike may run (opt-in for one workflow); extra agents per
round only if measured (S5). Round 8 runs as the workflow spike; started at 17:5x local time.

## Decision
Draft, 2026-10-24, pending the user's review.

**Choice:** O18 + O17b.
1. Round checklist (O18): every round entry in the log's *Rounds* ends with a checklist, one line per step, each
   filled or "n/a: <reason>". The agent copies it, ticked, into the round report. Lines:
   - first round only: *Log* (path in the report; new or resumed, what was outdated); *Problem and success criteria*.
   - every round: *Scope* (split, widened, unchanged); *Requirements* (new or changed, each with reason, source,
     status); *Replaced requirements* (new IDs; options re-checked from the old row); *Written requirements*
     (evidence: commit, decision log); *Deciding unverified requirements* (IDs asked this round, or assumptions after
     "can't answer"); *Options* (added, by category); *Searches* (in the log; or "no web search", said in the
     report); *Deciding claims* (cross-checked, or marked unverified); *Matrix*; *Rejection records* (per trailing or
     not applicable option: requirement as worded, scenario against the other requirements, best variant, the
     leader's ✗/~ compared); *Harms*; *Reversibility* (every option; one-way means extra stress test, said in the
     report); *Stress test*; *Bias check* (fresh subagent, inferred requirements listed apart; or "not independent");
     *Rejection check*; *Ranking change*; *Report* (what changed; recommendation only as far as the evaluation shows,
     its reversibility, runner-up and when it would win; core rejections one line each; the checks' findings);
     *Questions* (deciding unverified first, ordered by ranking impact, likely answers as options); *Pushback* (the
     user picked a worse option: asked what makes it better; or n/a).
2. Gate (O17b), Claude Code, Linux first: a PreToolUse hook on AskUserQuestion in the skill's frontmatter. Active
   while a research log (a `.md` with `## Problem` and `## Rounds`, not the skill's own file) read or written in this
   session has an empty *Decision*. It denies the call unless the last question is headed "Remarks", and, unless the
   first question is headed "Follow-up", the log changed since the previous allowed call and the newest round entry
   has every checklist line filled. The deny reason names the missing lines. Elsewhere it lets the call through with
   a visible message.
3. Skill rules: in Claude Code, always ask through the question tool (plain-text questions skip the gate); a call
   that continues the previous one (the 4-question limit) starts with a question headed "Follow-up"; write *Decision*
   as "Draft" before asking to confirm *Why* and *Rejected* (this turns the gate off).
4. Decision checklist (O18, not gated): stop condition met; *Why* and *Rejected* on confirmed requirements and
   confirmed by the user; known gaps and open child decisions; docs and rules updated where they take effect,
   overstated requirements corrected, left uncommitted with a commit message; commit-sized steps, success criteria
   only as project rules; out-of-scope problems noted; the overview's six parts; reviewed in open chat, changed only
   through a round or a checked, recorded amendment; no implementation before the review.

**Why:** the real skips all happen at the round end (K2, K3, K5, H1, H2, and H1 again in this run): S8, preference
(round 4). A checklist in front of the agent when it acts: S2, preference (round 2). Claude Code-only layers allowed:
S1 (round 2). The gate checks the log, not tool calls, and runs only during research: S9 (round 4), user's choice of
O17b (round 6). Complete checklist: user, round 6. Spikes: the hook matches AskUserQuestion, a deny blocks it.

**Rejected:** (under revision after round 7, see O10b) O17a (tool-call gate: fakeable, parses an internal format, S7); O17c (model hook: a model call per
question, S5; runner-up if O17b gets gamed); O7, O16 (reminders arrive too late, S2, spikes); O9 (a skippable step
itself, S8); O10 (replaces the prose rules, S1); O11 (changes nothing at the round end, S8); O14 (same as O18, not
in every environment); O1 (S2, S8). Deferred to the compaction decision (S3): O4, O5, O6, O8, O12. Not needed: O13
(S6 rejected; the author edits in separate sessions). Add-on later: O15 (evals).

**Known gaps:**
- Checklist lines can be filled without the work; the gate checks presence, not truth (watch the next runs; O17c).
- The deciding questions (K2) and the review (K5) are only on the checklists, not gated.
- "Follow-up" skips the gate; misuse is visible in the dialog.
- Windows: the gate does nothing yet (fails open).
- The checklist is long (~22 lines); rote ticking is a risk.
- After a compaction, Phases 5-6 of the skill text are cut (S3, deferred); the gate's deny reason still names the
  missing lines.
- S7 (maintenance of the script) not asked.
- The spike hooks stay registered in this session until it ends.

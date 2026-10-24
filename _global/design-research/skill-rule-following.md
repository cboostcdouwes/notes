# Skill rule following

## Problem
The agent running the design-research skill skips rules the skill already has. The skill keeps growing, so each new
rule risks being skipped too. The agent must reliably apply the rules of the step it is on, and the user must be able
to see when one was skipped.

## Related decisions
- Parent: `requirement-reasons.md` (decided). Sibling: `option-discovery.md` (open; its outcome adds Phase 3 rules,
  so it should follow this one).
- Child: `skill-and-log-size.md` (decided 2026-10-24): compaction (S3) and the growth of research logs.

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
| S1 | No dependency on the user's own setup; Claude Code is the only environment that matters (prose need not work alone) | others may use it, within Claude Code | memory `design-research-skill.md` (user, 2026-10-23); user, rounds 2 and 7 | replaced by S1b (round 9) |
| S1b | Works in the user's own Claude Code setup; no fallback for users with workflows off or under `strictPluginOnlyCustomization` (the managed-settings gap stays a known gap) | | user, round 9 (answer to round 8's question 2) | preference; conflicts with the memory note "general, sharable" (asked again, round 9 question 2) |
| S2 | The current step's rules are in front of the agent when it acts; the user doesn't need to read them | the agent skips round-end steps (K2, K3, K5, H1, H2) | user, round 2 ("help the agent itself") | preference |
| S3 | The rules of the current phase stay in effect after a compaction | Phases 5-6 lie past the ~5,000-token re-attach (estimated from 4 chars/token, not measured; truncation direction not verified) | inferred from the docs; user, round 4 | preference: a restructure is needed, but as a separate decision after this one |
| S4 | Extra chat text per report stays small | | inferred; user, round 3 accepted ~6 checklist lines per report | rejected: ~6 checklist lines per report are fine |
| S5 | Extra cost per round (subagents, tokens) stays acceptable | | inferred; the user accepted two subagents per round (run 2, round 3); user, round 7: extra agents only if measured; user, round 9: "cost only if cheaper" | preference: extra cost per round only if cheaper than the hand-run checks (~100K subagent tokens per round, estimated from rounds 1, 4, 6 at smaller log sizes, n=3); the bar is "cheaper", not "near"; whether the bar also applies to add-ons that replace nothing (O17c, O9) is unasked |
| S6 | The running agent works from the current skill text, though the skill is edited during the runs that use it | K1: a rule added mid-run was never seen; K4, K5: rules changed mid-run | transcripts of runs 1 and 2 (round 1 check) | rejected: the user edits the skill in separate sessions from now on (round 2) |
| S7 | The skill's author can keep it up: no rule stated in two places that can drift apart | | inferred (round 1 check) | unverified; never asked in 9 rounds; now weighs on O10m (rules in workflow prompts), O17b/O17d (line names in a script and schemas): asked round 9 |
| S8 | The end-of-round steps happen every round: ask the deciding questions, the remarks question, both checks, the log update | K2, K3, H1, H2: each let an unchecked claim or a dropped option through ("every requirement is checked" was false) | the user's problem statement (2026-10-24); the skips; user, round 4 | preference |
| S9 | The gate touches nothing outside the research: active only from the first research-log write in a session until the log's *Decision* is filled | hooks stay registered for the rest of the session; unrelated questions must not be blocked or labelled | user, round 4 | preference |
| S10 | Every step on the round-end checklist is checked before the questions go out, not a subset | steps left outside the check get skipped (K2 sat five rounds while other steps ran) | user, round 6 ("collect all the steps completely into the checklist"; the gate checks the complete checklist); added as a row in round 9 (rejection check: O17a's verdict had no requirement under it) | preference |
## Options
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O1 | Do nothing | S1, S5, S7 | K2, K3, K5, H1, H2 continue | cheap | trailing (S2, S8, S10) |
| O2 | A checklist block at the end of each phase, with a stable heading (`### Phase 5 checklist`); Anthropic's pattern | S1; each round-end step becomes a line | Rules stated twice (S7) unless the checklist replaces the prose list; still self-applied; Phases 5-6 lie past the compaction cut (S3) | cheap | candidate (absorbed into O18) |
| O3 | Each report opens with a state line (`Round 3 · Phase 5`) and ends with the phase checklist ticked, in the chat (user's idea; Anthropic: "copy into its response and check off") | Visible to the user before they answer: K3, H1 would have shown | Longer reports; a tick can be false | cheap | candidate (absorbed into O18) |
| O4 | Re-read the current phase's section (by stable heading) from SKILL.md before acting on it | S3 | Tool calls per phase; relies on remembering to re-read, which is itself a step (S8 ~); checks no step (S10 ✗, the leader ✓) | cheap | candidate (add-on to the leader; deferred to S3) |
| O5 | Shorten SKILL.md to the procedure; move rationale and detail to reference files, so the core fits the compaction budget | S3; fewer instructions in context (IFScale) | A rewrite; reasons move out of sight | costly | candidate (deferred to S3) |
| O6 | Split by phase: SKILL.md as an index plus a file per phase, read on entering it (Anthropic tip) | S3; the current phase's rules sit at the end of context | More files (S7); reading on entry is itself a step; checks no step (S10 ✗, the leader ✓) | costly | candidate (add-on; deferred to S3; pairs with O10m) |
| O7 | Skill-scoped hooks that add a reminder to Claude's context at the right moment, e.g. PreToolUse on AskUserQuestion | Runs outside the agent's memory | Personal-skill hook, off under `strictPluginOnlyCustomization` (accepted by S1b); scripts to maintain (S7); spike 1: the reminder arrives with the answers, too late (S2) | cheap | trailing (S2, S10) |
| O8 | A *State* section at the top of the log: round, phase, the phase checklist ticked; updated with the log each round | S3 (survives compaction and sessions); a slot makes a step get done | One more section; ticks can be false; the log update is itself a skipped step (H2) | cheap | candidate (deferred to S3) |
| O9 | A compliance check: before sending the report, a fresh subagent checks the draft report and the log against the phase checklist | Independent judgment | A third subagent, extra cost that replaces nothing (S5 ~); it is itself a round-end step, and H1 shows subagent checks get skipped (S8 ~, S10 ~, the leader S10 ✓) | cheap | trailing (S5, S10) |
| O10 | A Workflow script that holds the rules and runs the phases, replacing the prose | Strongest ordering; one statement per rule (in the script) | Can't hold the conversation: a workflow takes no mid-run input and subagents can't call AskUserQuestion, so framing, report, questions, pushback and review stay prose anyway; with workflows off (Pro opt-in in /config, `disableWorkflows`) the mechanical rules are gone, no fallback (accepted by S1b, round 9); rules in JS strings and schemas; a full workflow costs ~3.5x the hand-run checks (S5 ✗, round 8) | costly | absorbed into O10m (round 9; as a full replacement it can't be built) |
| O10b | A Workflow per round for the mechanical steps (searches, matrix and verdicts, rejection records, both checks, the round entry with its checklist), written per run; the main agent keeps framing, the report and the questions; the prose rules stay as the fallback | Steps inside the script can't be skipped (S8); each subagent gets only its step's instructions (S2, IFScale) | Several agents per round (S5); a script written per run gets an approval prompt every round in manual mode; a script in the skill folder needs /add-dir or a Read rule in other projects; prompts that restate rules drift from the prose (S7, seen in the round 8 spike); subagents know only the log, not the chat | cheap | candidate (absorbed into O10c, now O10m) |
| O10c | O10b as a saved, named workflow (`~/.claude/workflows/` or a plugin's `workflows/`): the script holds only the order of steps, the agents' output schemas and the checklist fields; each agent is told to read its phase from SKILL.md, so the prose stays the only statement of each rule; the user can approve it with "don't ask again" | Steps can't be skipped (S8, stronger than the leader on H1: the checks run as steps); each agent reads only its phase (S2); one source per rule (S7); prose fallback when workflows are off | Agents may read SKILL.md selectively (unchecked); schemas name the checklist fields (a renamed step changes in two places); ~5 agents per round (S5 ✗: round 8 measured ~3.5x the hand-run checks); resume only within a session; a personal workflow file is invisible to others (O20); whether a skill instruction may launch it is undocumented | cheap | absorbed into O10m (round 9: S1b drops the need for the prose fallback) |
| O10m | O10 limited to the mechanical rules, merged with O10c (round 9): a saved workflow per round whose agents read their step's rules from one place (the workflow's prompts or a file per step), with no copy in SKILL.md. Lite variant (measured round 9): the workflow runs the bias check, the rejection check and the Record step; research and evaluation (matrix, verdicts, rejection records) stay with the main agent, so their rules stay in SKILL.md and only Phase 4 steps 5-6 and the record rules move | The two checks run as steps (S8 ~, stronger than the leader on H1, but round 8's Record step applied the checks only partly); each agent gets only its step's rules (S2) | S5 ? (lite: the same two checks plus a Record agent, so hardly cheaper than ~100K by hand; measured this round); the Record agent needs the round checklist SKILL.md also states (S7 ~); no fallback with workflows off (accepted, S1b); resume only within a session; launch by a skill instruction rests on the harness's tool description only; shortening SKILL.md counts only under S3, deferred (no credit here) | cheap | runner-up (with O17d; pending the S5 measurement) |
| O11 | Stronger wording ("MUST") on the rules that were skipped | Cheap; Anthropic mentions it | No evidence it helps; inflates emphasis until nothing stands out; checks no step (S10) | cheap | trailing (S8, S10) |
| O12 | Prune: remove or merge rules that never paid off | IFScale; lower token cost; S7 | Needs evidence per rule | cheap | candidate (add-on; deferred with S3) |
| O13 | Keep the skill text current during a run: after editing SKILL.md, re-invoke the skill (or edit it only in a separate session) | K1, K4, K5 (S6, rejected) | Nothing reaches the round end (S2 ✗); a rule to remember after an edit, itself skippable (S8 ✗); checks no step (S10 ✗); a re-invoke adds a second copy to the context | cheap | trailing (S2, S8, S10); a habit for the author |
| O14 | The environment's task list (TodoWrite or similar) for the round-end steps | Visible to the user without chat text | The task list is a cue the agent may not look at when it acts (S2 ~, the leader ✓); self-ticked, nothing checks the steps (S10 ~, the leader ✓); not in every tool set (no requirement behind it: S1b ✓) | cheap | trailing (S2, S10) |
| O15 | A replay/eval harness (skill-creator evals) that tests a skill version against transcripts of past runs | Measures the options instead of guessing; supports the success criteria and S5's measurement | Building and keeping the evals (S7); cost per run | cheap | candidate (add-on, for the success criteria) |
| O16 | A Stop hook (skill frontmatter) that reminds the agent when a turn ends with a question but no subagent check or log edit since the last one | Detects H1, H2 deterministically, but only after the questions went out; reads the transcript, not memory | Personal-skill hook (accepted by S1b); a script that parses the transcript (S7); fires after the turn, but questions go out mid-turn (S2 ✗, S8 ✗); covers two steps (S10 ✗) | cheap | trailing (S2, S8, S10) |
| O17a | Gate on tool calls: a skill-scoped PreToolUse hook on AskUserQuestion that reads the transcript and denies the call when the last question isn't a remarks question, or no subagent check or log edit happened since the previous question call | Deterministic for K3, H1, H2; arrives at the exact moment (S2, S3) | A script that restates which steps must happen (S7 ~, as for O17b); passed with two empty Agent calls (S8 ~, as the leader); gates only three steps, not the full checklist (S10 ✗); parses the internal transcript format (no requirement covers that fragility; not asked); personal-skill hook (accepted by S1b) | cheap | trailing (S10) |
| O17b | Gate on the log: the same PreToolUse hook denies the call unless the log's newest *Rounds* entry has every checklist line filled and the log changed since the previous allowed question call; the log is found from the session's Read/Write/Edit paths; inactive once *Decision* has text | Checks content in one markdown file; works on resume (S9); the checks' findings become visible in the log | Still a script (S7); content can be faked, in plain sight (O24 narrows it); follow-up calls need an exemption; Linux first; personal-skill hook off under `strictPluginOnlyCustomization` (accepted by S1b; O20 fixes it); defect (bias check, round 9): a "Draft" *Decision* turns the gate off, so rounds reopened after a draft (rounds 7-9 here) run ungated; the activation must treat a draft, or a round entry newer than the decision, as active | cheap | leading (with O18; activation fix needed) |
| O17c | Gate by a model: a `type: "prompt"` (or experimental `type: "agent"`) hook at PreToolUse judges, from the log, whether the round-end steps were done, including the deciding questions (K2) | Hardest to fake; covers judgment steps; prompt and agent hooks are supported on PreToolUse (docs, round 8) | A model call per question call, extra cost that replaces nothing (S5 ~; whether "only if cheaper" applies to such add-ons is unasked; a prompt hook only on the round-report call would be far below ~100K); agent hooks are experimental | cheap | trailing (S5); alternative if O17b gets gamed |
| O17d | The workflow's Record step schema as the checklist enforcement: every checklist line a required, non-empty field (schema validation retries up to 5 times, then fails); O17b's gate then checks that a workflow-written round entry exists, plus the main agent's own lines | Moves "every line filled" from markdown parsing into validation the runtime already does (simpler gate) | Only with O10m; "filled" means present, not true; renaming a line needs the schema and the gate changed too | cheap | candidate (part of O10m) |
| O18 | Before the question call, the agent copies the round-end checklist (Phase 5's list rewritten as one) into its response and ticks it (Anthropic's pattern, as a cue for the agent) | S2 in prose; one source for the steps (S7) | ~20 lines of chat per round; still self-applied; past the compaction cut (S3) | cheap | leading (with O17b) |
| O19 | Custom subagent definitions for the two checks (e.g. `~/.claude/agents/design-bias-check.md`), each holding its own instructions or preloading a small skill; the main agent calls them by type. Variant (bias check, round 8): a research agent definition with Phase 2-4 rules in its system prompt (whether that survives compaction is unverified) | Takes the check instructions out of the main context (S2); 2 agents per round, already accepted (S5); no script | No ordering guarantee: the main agent must remember to call them (H1); only O17b's lines enforce it; plugin subagents ignore `hooks` | cheap | candidate (add-on to the leader) |
| O20 | Packaging alone (scored so in the matrix): ship the skill, its gate hook and any round workflow together as one plugin; an add-on to whichever option is chosen | Plugin skills keep their hooks under `strictPluginOnlyCustomization` (moot under S1b); one install, one version (S7); plugin workflows are namespaced and shared | Packaging and versioning; reinstalls; buys nothing until a second user exists; alone it changes nothing at the round end (S2, S8, S10 ✗) | costly | candidate (packaging; later, user round 9) |
| O21 | User-triggered round end: a `/round-end` command (a separate skill holding Phase 5's rules) that the user starts when they want the report, so the agent doesn't have to remember the round end (bias check, round 8) | Phase 5's rules load fresh at the moment (S2, S3); no extra agents (S5); one source if Phase 5 moves there (S7) | The skip moves from the agent to the user (S8 ~); one extra user turn per round; unasked whether the user wants this duty | cheap | candidate (unasked) |
| O22 | One combined check subagent: the bias check and the rejection check in one fresh subagent, one pass over the log (bias check, round 9) | About halves the checks' cost (S5, estimated, unmeasured); one round-end step instead of two; check instructions outside the main context (S2) | One context for both lenses, so one may crowd out the other (quality unmeasured); still a step the agent must start (S8 ~); covers only the checks (S10 ✗); its prompt may restate SKILL.md (S7 ~) | cheap | candidate (add-on to the leader or to O10m; new) |
| O23 | Run the checks on a smaller model, set per agent (Agent call, agent definition `model`, or workflow agent option) (bias check, round 9) | Direct lever on S5 | Weaker checks may miss what the current ones found (unmeasured); changes nothing about skipping (S2, S8, S10 ✗); per-agent model setting in this environment not verified | cheap | candidate (cost add-on; new) |
| O24 | Proof of execution for the gate: each check subagent writes its findings to a known file next to the log; O17b also requires those files to be newer than the previous allowed question call (bias check, round 9) | Closes most of "filled but not done" for the two checks without a workflow (S8, H1); no extra agents (S5) | More gate logic and a file-location format (S7 ~); the main agent could write the files itself (fakeable, but visible); covers the two checks only (S10 ~ alone, ✓ with O17b) | cheap | candidate (add-on to O17b; new) |
| O25 | The gate's deny reason carries the current round-end checklist text, read from SKILL.md (bias check, round 9) | The rules in front of the agent at the moment it acts (S2); current text after a compaction for the round end (S3 ~); one source (S7) | Only seen on a deny; the gate must find the checklist in SKILL.md by a stable heading | cheap | candidate (add-on to O17b; new) |
## Matrix
| Requirement | Status | O1 | O2 | O3 | O4 | O5 | O6 | O7 | O8 | O9 | O10 | O10b | O10c | O10m | O11 | O12 | O13 | O14 | O15 | O16 | O17a | O17b | O17c | O17d | O18 | O19 | O20 | O21 | O22 | O23 | O24 | O25 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S1b | preference (user, round 9: the user's own setup only) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | none |
| S2 | preference | ✗ | ~ | ✓ | ✓ | ~ | ✓ | ✗ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ~ | ✗ | ✗ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ O1, O7, O11, O12, O13, O15, O16, O20, O23; ~ O2, O5, O8, O9, O14, O17d |
| S3 | preference (deferred to its own decision) | ✗ | ✗ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ | ~ | ✗ | ~ | ✗ | ~ | ✗ | ✓ | ✓ | ✓ | ✓ | ~ | ✗ | ~ | ✗ | ✓ | ~ | ✗ | ✓ | ~ | ✗ O1, O2, O11, O13, O15, O18, O20, O23; ~ O3, O9, O10b, O10c, O10m, O12, O14, O17d, O19, O22, O25 |
| S5 | preference (user, round 9: extra cost only if cheaper than the hand-run checks, ~100K) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✗ | ✗ | ✗ | ? | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ O10, O10b, O10c; ~ O9, O15, O17c, O17d; ? O10m |
| S7 | unverified | ✓ | ✗ | ~ | ✓ | ~ | ~ | ~ | ✓ | ✓ | ~ | ~ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ~ | ~ | ~ | ~ | ~ | ~ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ✓ | ✗ O2; ~ O3, O5, O6, O7, O10, O10b, O10c, O10m, O15, O16, O17a, O17b, O17c, O17d, O22, O24 |
| S8 | preference | ✗ | ~ | ~ | ~ | ~ | ~ | ✗ | ~ | ~ | ~ | ~ | ~ | ~ | ✗ | ✗ | ✗ | ~ | ✗ | ✗ | ~ | ~ | ~ | ~ | ~ | ~ | ✗ | ~ | ~ | ✗ | ~ | ~ | ✗ O1, O7, O11, O12, O13, O15, O16, O20, O23; ~ all others |
| S9 | preference | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ O7, O16 |
| S10 | preference (user, round 6) | ✗ | ~ | ~ | ✗ | ✗ | ✗ | ✗ | ~ | ~ | ~ | ~ | ~ | ~ | ✗ | ✗ | ✗ | ~ | ✗ | ✗ | ✗ | ✓ | ✓ | ~ | ~ | ✗ | ✗ | ~ | ✗ | ✗ | ~ | ~ | ✗ O1, O4, O5, O6, O7, O11, O12, O13, O15, O16, O17a, O19, O20, O22, O23; ~ O2, O3, O8, O9, O10, O10b, O10c, O10m, O14, O17d, O18, O21, O24, O25 |

S1, S4 and S6 have no rows (S1 replaced by S1b; S4, S6 rejected). S1b no longer separates any option (all ✓); it
would again if the skill must work for others (round 9 question 2), bringing back the round 8 S1 marks below. No
option meets S8 fully: none gates the deciding questions (K2) or the review (K5); those stay with O18's checklist.
Within S8 ~, O10m (and O24) are stronger than O17b alone on H1, because the checks run as steps or leave a file,
instead of being lines someone fills in; round 8's Record step shows a step can still be done only partly.
Add-ons (O4, O6, O19, O22-O25) are scored on their own, not combined with the leader.
Cells changed in round 9, with reason:
- S1 → S1b (meaning changed: "the user's setup only", round 9): every S1 ✗ or ~ re-checked. O10 ✗ → ✓ (its
  scenario, workflows off, is accepted); O7, O10b, O10c, O16, O17a, O17b, O17c, O17d ~ → ✓ (workflows on and no
  `strictPluginOnlyCustomization` in the user's setup; the managed-settings gap stays a known gap).
- S5 (now a preference: only if cheaper): O10, O10b, O10c ~ → ✗ (a full round workflow measured ~3.5x the hand-run
  checks, round 8); O10m ? (measured this round); O9, O17c stay ~ (they add cost that replaces nothing; whether the
  bar applies to them is unasked).
- S7: O17a ✗ → ~ (it restates the round-end steps in a script, as O17b does; nothing justified the difference).
- S10 (new row, user round 6): scored for every option.
- New columns: O10m, O22, O23, O24, O25.
Cells changed in round 8, with reason:
- S1: every personal-skill hook (O7, O16, O17a, O17b, O17c) ✓ to ~: under `strictPluginOnlyCustomization` a personal
  skill's hooks silently don't run. O10 stays ✗, for the narrowed reason: workflows can be off inside Claude Code and
  nothing is left. O10b, O10c, O17d ~: they fall back to the prose, losing only the enforcement. O14 stays ✓ (the
  evaluation's ~ was stretched: a missing task-list tool in a subagent is not the user's own setup; rejection check).
- S3: O10b ✓ to ~: the prose stays in SKILL.md, so the compaction cut doesn't change.
- S7: O10 ✗ to ~ (a replacement keeps one statement per rule; the cost is the format). O10b stays ~ (the evaluation's
  ✗ belonged to the spike's prompts, not to the option; prompts that point to SKILL.md fix it; rejection check).
## Evaluation
- Two causes: the round-end moment (K2, K3, K5, H1, H2, and H1 again in this run's rounds 2-4) and stale skill text
  (K1, K4; closed by S6 rejected). Leading: O18 (checklist copied and ticked) + O17b (gate on the log), with the
  activation fix below. Runner-up: O10m (lite) with O17d (saved workflow for the checks and the record), pending the
  S5 measurement against "cheaper". O22, O23 and O24 are add-ons that could beat O10m on S5 and close part of its H1
  edge for the leader without a workflow.
- Spikes: a skill-scoped PreToolUse hook matches AskUserQuestion; its context arrives only with the answers (too late
  for a reminder); a deny blocks the call before the user sees it and hands the reason to the agent at once. Round 8
  ran as a 5-agent workflow; round 9's checks and record ran as a 3-agent workflow (cost measured by the main agent).
- Known holes in the gate: plain-text questions bypass it, and closing that rests on a prose rule, the same kind of
  round-end rule that gets skipped (K3); fakeable content (visible in the log; O24 narrows it for the checks); follow-up
  calls need an exemption, and "Follow-up" skips the gate on the same prose rule; Linux first, fails open elsewhere;
  off under `strictPluginOnlyCustomization` (accepted by S1b); a "Draft" *Decision* turns it off (bias check, round
  9), so rounds reopened after a draft run ungated, as rounds 7-9 here would have: the activation must treat a
  *Decision* starting with "Draft", or a *Rounds* entry newer than the decision, as active.
- The leader's own efficacy is unmeasured (user, round 3: "efficacy unsure"); the success criteria judge it only on
  future runs, while O10m must be measured before it joins. "No extra agents" is no edge: the leader's checklist asks
  for the same two check subagents.
- Rejection records (verdicts rest on preferences the user confirmed, S7 being unverified; none is core; the leader's
  own cells: S1b ✓, S3 ✗ for O18 (O17b ✓), S7 ~ (gate script), S8 ~ (presence, not truth; K2, K5 not gated), S10 ✓):
  - O1 trailing (S2, S8, S10): S2 "the current step's rules are in front of the agent when it acts", S8 "the
    end-of-round steps happen every round" and S10 "every step on the round-end checklist is checked": nothing changes
    at the round end, so K2, K3, H1, H2 recur (H1 recurred in this run). No other requirement accepts that. Best
    variant O1 + O18 is O18. The leader has S2 ✓, S8 ~, S10 ✓.
  - O2, O3: absorbed into O18 (the checklist is Phase 5's list rewritten, so no rule is stated twice).
  - O4, O5, O6, O8, O12: their remaining case is S3, deferred to the compaction decision; not rejected. O4 and O6 are
    not equal to the leader: they check no step (S10 ✗ against the leader's ✓), so they are add-ons for S3, not
    alternatives. O4's S2 ✓ assumes the re-read happens; remembering it is its S8 ~. O6 pairs with O10m (agents read
    per-phase files). O8's own skip risk (the log update) is covered by O17b's log-changed check. Pruning (O5, O12) as
    a main fix (bias check, round 9): still deferred; round 9's credit to O10m for shortening SKILL.md is withdrawn
    (it rested on S3, deferred and unverified), so no option is credited for shortening here.
  - O7 trailing (S2, S10): S2 as worded: spike 1, PreToolUse context arrives with the answers, after the questions went
    out. S10: a reminder checks no step. No other requirement accepts that. Variants: a deny instead of a reminder is
    O17b; a reminder on an earlier call of the round (PostToolUse on the log edit; rejection check, round 9) arrives
    before the questions only if the log edit happens, and H2 is exactly that edit being skipped; O25 brings the same
    text at the moment the gate denies, so this variant adds nothing over O25. S1b ✓ now.
  - O9 trailing (S5, S10): S5 as answered ("only if cheaper"): a third subagent adds cost and replaces nothing, so it
    can't be cheaper (whether the bar applies to add-ons is unasked, so this rests on a question). S10: the check is
    itself a step that gets skipped (H1), so its coverage is ~ against the leader's ✓. S8 is not cited: O9 and the
    leader share S8 ~. Best variants: enforced by a gate it becomes O17c; run as a workflow step it becomes part of
    O10m. The leader has S5 ✓, S10 ✓.
  - O10, O10b, O10c: absorbed into O10m (round 9). O10's old record (trailing on S1) is void: its scenario, a user with
    workflows off, is accepted by S1b. O10 as a full replacement still can't be built (no mid-run input; subagents
    can't call AskUserQuestion). O10c's prose fallback is no longer needed under S1b. All three carry S5 ✗ as full
    round workflows (round 8: ~3.5x the hand-run checks).
  - O10m runner-up: no record (not trailing). Consistency fix (bias check): "mechanical rules only in the workflow, no
    copy in SKILL.md" holds only for the full variant; in the lite variant the main agent keeps research and
    evaluation, so the matrix, verdict and rejection-record rules stay in SKILL.md and only the check and record rules
    move. Its S5 is decided by this round's measurement against "cheaper than ~100K"; the bias check expects it to
    fail (the same two checks plus a Record agent).
  - O11 trailing (S8, S10): stronger wording changes nothing at the round end; no evidence it helps; it checks no step.
    Variant (rejection check): stronger wording only on O18's checklist lines, as an add-on to the leader; no evidence
    either, and the gate already enforces the lines; not ranked separately.
  - O13 trailing (S2, S8, S10): S2 as worded: re-invoking after an edit brings the skill back, not the round-end rules
    at the moment the questions go out. S8: the re-invoke is itself a step to remember and gets skipped like the
    others. S10: it checks no step. Its old reason (it serves S6, rejected) is not a requirement it fails, and is
    dropped. Best variant: re-read or re-invoke the skill at each round end (close to O4 and O21): S2 ✓, but still
    S8 ~ and S10 ✗ against the leader's S10 ✓. The leader has S2 ✓.
  - O14 trailing (S2, S10): S2 ~ against the leader's ✓: a task list is a cue the agent may not look at when it sends
    the questions. S10 ~ against ✓: it is self-ticked, nothing checks it. "Self-applied" alone is not cited (the
    leader shares S8 ~), nor "not in every tool set" (no requirement: S1b ✓). Variant: the gate reads the task list
    instead of the log; the task list lives in the transcript, which brings O17a's internal-format cost and gives up
    S9's log-based activation; not better than O17b.
  - O15: an add-on for the success criteria; the way to measure S5 and the leader's efficacy on past transcripts.
  - O16 trailing (S2, S8, S10): S2 as worded: a Stop hook fires after the turn, but the questions go out mid-turn, so
    the round's steps are already skipped when it fires (S8 ✗); it watches two steps (S10 ✗). O17a, which blocks
    before the call, gets S8 ~. Variant: a backstop for plain-text questions only (the leader's bypass). S1b ✓ now.
  - O17a trailing (S10): S10 as worded: it gates three steps (remarks question, two subagent calls, a log edit), not
    the full checklist the user asked for in round 6. Its S7 is now ~ like O17b's (both restate the steps in a
    script); its "two empty Agent calls pass" is S8 ~, shared with the leader, so not cited. Its fragility on Claude
    Code's internal transcript format has no requirement (not asked; it would be a new one if the user cares). Best
    variant: O17b.
  - O17c trailing (S5): S5 ~: a model call on every question call adds cost and replaces nothing; the user's "only if
    cheaper" was about workflow agents, so whether it binds an add-on is unasked. Its best variant, a prompt hook only
    on the round-report call, would cost far below the ~100K checks; weighed, it still adds cost the leader doesn't
    carry. Its other cells (S1b ✓, S7 ~, S8 ~) equal the leader's; it is stronger on truth (a model judges content).
    Alternative if O17b gets gamed. The timeouts are not cited (no requirement).
  - O17d, O19, O20, O21, O22, O23, O24, O25: candidates (O17d part of O10m; O19, O22, O23 add-ons for the checks;
    O24, O25 add-ons to O17b; O20 packaging, later; O21 unasked).
## Open questions
Answered in round 6 and removed in round 9: gate form (O17b), Windows (Linux first, fail open with a message),
follow-up calls ("Follow-up" header).
1. S5: does the 3-agent workflow measured this round come in cheaper than the ~100K hand-run checks? If not, O10m
   (lite) trails on S5; O22 or O23 may still cut the checks' cost under either option. Does "only if cheaper" also
   bind add-ons that replace nothing (O9, O17c)?
2. S1b against the memory note "general, sharable": is the skill for the user's setup only, or must it work for
   others? If for others, the round 8 S1 marks return (personal-skill hooks ~, O10m without fallback ✗) and O20 moves
   up.
3. S7 (never asked): is "no rule stated in two places that can drift apart" a requirement, and what would break
   without it? Decides how much O10m's prompts, O17b's line names and O17d's schemas cost.
4. Gate activation: active while *Decision* is empty or starts with "Draft", or while a *Rounds* entry is newer than
   the decision? (Fixes the leader's draft-decision defect.)
5. Add O24 (check findings files the gate requires) and O25 (checklist text in the deny reason) to the leader? (H1
   edge of O10m without a workflow; S2, S3.)
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
| Workflow runs take no mid-run user input ("for sign-off between stages, run each stage as its own workflow"); subagents can't call AskUserQuestion | code.claude.com/docs/en/workflows; /sub-agents | 2026-10-24 | primary, two pages agree |
| Workflows can be off: Pro must turn them on in /config; `disableWorkflows` or `CLAUDE_CODE_DISABLE_WORKFLOWS` turns them off | code.claude.com/docs/en/workflows | 2026-10-24 | primary, single source |
| Manual/accept-edits mode asks to approve every run; "don't ask again" only for bundled, saved or plugin workflows run by name; auto mode prompts only the first launch | code.claude.com/docs/en/workflows | 2026-10-24 | primary, single source |
| Documented opt-ins: the user's prompt ("ultracode" or asking for a workflow), /effort ultracode, a saved or bundled workflow command; a skill instruction is not listed | code.claude.com/docs/en/workflows; /tools-reference | 2026-10-24 | primary; round 7's "skill instruction counts as opt-in" unverified |
| Size guideline: medium < 10 agents, small < 5 on Pro (v2.1.271+); warning above 25 agents or 1.5M projected tokens | code.claude.com/docs/en/workflows | 2026-10-24 | primary |
| Multi-agent systems use ~15x the tokens of chats; poor fit for shared-context work | anthropic.com/engineering/multi-agent-research-system | 2026-10-24 | primary, measured on their system |
| Workflows for well-defined tasks, agents for flexibility; add complexity only when it demonstrably helps | anthropic.com/engineering/building-effective-agents | 2026-10-24 | primary, guidance |
| Workflow agents and forked skills don't see the conversation; they get the same CLAUDE.md files | code.claude.com/docs/en/workflows; /skills; workflow-authoring reference | 2026-10-24 | primary |
| In auto mode a script's agent() prompt doesn't count as a user request for the classifier | code.claude.com/docs/en/workflows | 2026-10-24 | primary; effect unmeasured |
| A workflow resumes only within the same session (or --resume, background) | code.claude.com/docs/en/workflows | 2026-10-24 | primary |
| Claude can start a workflow only from a script file the session may read | code.claude.com/docs/en/workflows | 2026-10-24 | primary |
| PreToolUse supports `type: "prompt"` and `type: "agent"` hooks; timeouts 30 s / 60 s; agent hooks experimental; Workflow is a PreToolUse matcher | code.claude.com/docs/en/hooks | 2026-10-24 | primary |
| Under `strictPluginOnlyCustomization` only plugin, bundled or managed skills keep frontmatter hooks; plugin subagents ignore `hooks` | code.claude.com/docs/en/hooks; /sub-agents | 2026-10-24 | primary, single source per claim |
| Subagents can preload skills (`skills`, up to 32); nest 3 deep; 20 concurrent | code.claude.com/docs/en/sub-agents | 2026-10-24 | primary |
| agent() with a schema retries validation up to 5 times, then fails | workflow-authoring reference; code.claude.com/docs/en/workflows | 2026-10-24 | primary, two sources |
| Round 8 spike: 5 agents; prompts restate Phase 4 rules; token usage per agent (see *Rounds*) | local: the spike script and run directory wf_399c4a3e-5fa | 2026-10-24 | primary (local) |

## Searches
- Claude Code skills docs (loading, compaction, frontmatter): found the 5,000-token re-attach and skill hooks.
- Claude Code hooks docs: hook events that add context; cap; skill hook lifetime. AskUserQuestion as a matcher not
  mentioned (unverified; a spike can test it).
- Anthropic skill authoring best practices: checklist pattern, length, progressive disclosure.
- "IFScale instruction density": found the paper (abstract only).
- "LLM agent step skipping checklist ...": practitioner posts and issue reports, no controlled study.
- Local transcripts of run 1 and run 2: no compaction markers; run 1 context ~268K at the end.
- Round 8: workflow-authoring reference (script API, schema retries, resume); code.claude.com docs: workflows
  (opt-in, approval, saved/plugin workflows, no mid-run input, cost, disable settings, resume), skills (context:
  fork), sub-agents (skills preload, AskUserQuestion removed, hooks ignored for plugin subagents), hooks (prompt/agent
  hooks on PreToolUse, Workflow matcher, `strictPluginOnlyCustomization`), tools-reference (no statement on
  skill-instructed opt-in); Agent SDK TypeScript reference (Workflow schema not found); Anthropic engineering posts
  on effective agents and the multi-agent research system; one web search (only third-party pages); the spike's
  script and run directory (agent count, prompts, token usage).

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

### Round 8 (workflow spike)
Question: "why is replacing plain-text rules a bad thing?" Answer after re-evaluation: it isn't bad in itself. The
conversational half (framing, report, questions, pushback, review) can't be replaced at all: a workflow takes no
mid-run input, and subagents can't call AskUserQuestion. Replacing the mechanical half costs only the fallback when
workflows are off inside Claude Code (Pro opt-in in /config, `disableWorkflows`); that matters only if such users
exist. And there is no need to replace them: O10c keeps the rules in SKILL.md and puts only the order and the output
schemas in a saved workflow. The round 7 claim "a skill instruction counts as opt-in" is not in the public docs
(unverified); running a saved workflow by name is the documented opt-in.
Spike cost (this round, 5 agents in sequence, 17:51 to ~18:00): research 33 model calls, ~2.2M cache-read and 223K
cache-write input tokens, 27K output; evaluate 124K cache-write, 37K output; bias check 90K cache-write, 5K output;
rejection check 60K cache-write, 7K output; record (this step) not counted. Total before record: ~3.4M input tokens
(85% cache reads), ~76K output. The research agent is ~2/3 of it. No hand-run round of this log was measured, so there
is no baseline yet, and quality needs a rubric before a comparison (bias check). Spike observations: the script's
prompts restate Phase 4 rules (the O10b drift); the Options table was not updated by the evaluation step, so the
rejection check found it contradicting the matrix in many rows (fixed here).
Ranking change: O18 + O17b stays leading. O10c (new) becomes runner-up with O17d; O10b absorbed into it; O17c drops
to trailing (S5); new candidates O17d, O19, O20, O21. O10 stays trailing on S1, for corrected reasons.
Checklist:
- Scope: unchanged (round-end rule following; compaction S3 stays its own decision).
- Requirements: S5 status updated (user, round 7: extra agents only if measured; limit not given). S1 narrowed in
  round 7, applied to the matrix this round.
- Replaced requirements: n/a: none changed meaning this round (S1's narrowing was recorded in place in round 7; the
  O10 and O14 marks were re-checked against the narrowed wording).
- Written requirements: n/a: no requirement comes from a doc, test or commit in this research.
- Deciding unverified requirements: S5 (acceptable cost: the spike's numbers are in, the limit is the user's) and
  S1's scope (do users with workflows off or `strictPluginOnlyCustomization` matter) asked this round; S7 stays
  unverified and not deciding between leader and runner-up (both carry ~).
- Options: O10c (saved workflow, rules stay in prose), O17d (schema as checklist), O19 (check agent definitions,
  with the research-agent variant from the bias check), O20 (plugin packaging), O21 (user-triggered round end, from
  the bias check). Categories: built-in tooling (O10c, O17d, O19, O20), process change (O21).
- Searches: in *Searches* (workflows, skills, sub-agents, hooks, tools-reference, Agent SDK docs, two Anthropic
  engineering posts, the spike's own run directory).
- Deciding claims: "no mid-run input" cross-checked (workflows and sub-agents pages agree). "Workflows can be off"
  (Pro opt-in, `disableWorkflows`), "don't ask again only for saved/plugin workflows" and `strictPluginOnlyCustomization`
  dropping personal-skill hooks: one primary source each (official docs), not cross-checked, marked so in *Sources*.
  "A skill instruction counts as opt-in": unverified.
- Matrix: updated; O10c, O17d, O19, O20, O21 added; cells changed listed under *Matrix*; rejection-check fixes applied
  (O14 S1 back to ✓, O10b S7 ~).
- Rejection records: one per trailing option in *Evaluation* (O1, O7, O9, O10, O11, O13, O14, O16, O17a, O17c), each
  with the leader's cells compared; O10b recorded as absorbed into O10c; Options table verdicts aligned with them.
- Harms: O10: workflows off, the mechanical rules silently gone. O10c: selective reading of SKILL.md passes the
  schema; in auto mode an agent's log edit may be blocked (no user authority), failing the Record step; requirements
  only in chat are invisible to the agents; ~5 agents at the edge of Pro's "small" guideline. O17b: silently off under
  `strictPluginOnlyCustomization`. O17d: a renamed checklist line in SKILL.md but not in the schema makes the gate deny
  every question. O19: the main agent forgets to call the check agent (H1). O20: skill and workflow from different
  versions until reinstalled.
- Reversibility: every option rated in the evaluation; costly: O5, O6, O10, O20; none one-way, but the checklist
  lines become a format the gate and the schemas parse.
- Stress test: leader: plain-text questions bypass; faked "Bias check: done" lines pass (O10c closes this); silently
  off under `strictPluginOnlyCustomization` (O20); "Follow-up" abuse visible; two logs open in one session; after
  compaction the deny reason still names the missing lines; the gate list, SKILL.md checklist and any schema must stay
  in step (a grep test is the cheapest guard). Runner-up: a skipped workflow call shows up as a gate deny; a failed run
  resumes only within the session, otherwise restart from the log; launch on a skill instruction untested.
- Bias check: fresh subagent (workflow step, independent of the chat). Found: S5 is unverified yet now decides leader
  vs runner-up, and "under 10 agents" is a session guideline, not the user's limit (asked); the leader's argument
  "degrades to working prose" leans on the old S1 (kept, but now weighed only through the fallback question);
  "enforces the round end" overstates O17b (presence, not truth; stated in the leader's cells); the leader's
  silently-off gap and O10c's workflows-off gap were treated unequally (both are now S1 ~ and share one question);
  the spike is n=1 and needs a rubric; missing options O21 and a research agent definition (added as O19's variant);
  O12 as the main fix (still deferred with S3: pruning needs per-rule evidence first); an O10c run hook (covered by
  O17d with O17b). Changed: O21 added, O19 variant, S5 status, question 2 framed as one S1 question for both gaps.
- Rejection check: fresh subagent. Found: O10's deciding claims unsourced (now in *Sources*, single primary source,
  marked); O14's S1 ~ stretched (reverted to ✓); O10b's S7 ✗ belonged to the spike (now ~, O10b absorbed into
  O10c); O9 and O17c trail only on the unverified S5 (records say so; S5 asked); the Options table contradicted the
  matrix in many rows (O10, O10b, O17c, O1, O7, O9, O13, O14, O16; S5 status; new options missing) (all fixed). The
  *Decision* section's *Rejected* line still gives O10's old reason; left for the decision step, not edited here.
- Ranking change: see above. Leading unchanged; runner-up O17c to O10c; O10b absorbed; O17c trailing.
- Report: What changed: the answer to the O10 question (above); O10c as the way to get the workflow's guarantees
  without replacing the prose; the spike's measured cost. Recommendation, as far as the evaluation shows: keep O18 +
  O17b (cheap to reverse); strongest reason: it enforces the round-end moment with no extra agents. Runner-up O10c +
  O17d, which wins if the measured cost (~3.4M input, mostly cached, ~76K output, ~9 minutes per round) is
  acceptable and its round entry is at least as good as a hand-run one; it closes the leader's "filled but not done"
  hole. Core rejections: none (no requirement is core). Checks: as above. Note: this round's own evaluation step
  restated Phase 4 rules in its prompt and left the Options table stale, which is evidence both for scripted steps
  (the checks did run) and against prompts that restate rules.
- Questions: 1. S5: is ~3.4M input tokens (mostly cache reads) and ~76K output per round, ~9 minutes, acceptable
  for adding O10c to the leader? 2. S1 scope: should the skill keep working for users with workflows off or under
  `strictPluginOnlyCustomization` (decides O10 vs O10c, and whether O20 is needed for the gate)? 3. O20: package as a
  plugin now or when a second user appears? 4. Remarks.
- Pushback: n/a: the user asked a question about O10 rather than picking it; the answer partly agrees with the
  challenge (replacing the prose is not bad in itself) and names what it would cost.

### Round 8, measured by the main agent
- Cost: 5 agents, 350K subagent tokens (harness usage line), 42 tool uses, 10 min wall clock (17:51-18:01). The
  manual checks of rounds 1, 4 and 6 cost about 40-60K subagent tokens each, so about 100K per round for two checks:
  the workflow round is ~3.5x that, research taking about 2/3.
- Quality: it found facts the manual rounds missed (workflows can be off inside Claude Code; a script written per run
  asks for approval every run in manual mode, a saved one can be approved for good; AskUserQuestion is removed from
  subagents; prompt and agent hooks work on PreToolUse) and four options (O10c, O17d, O19, O20). Both checks ran. But
  the Record step applied the checks only partly (the rejection check's Options-vs-matrix contradictions, e.g. the O10
  row, stayed), and the evaluation prompt restated skill rules (drift). n=1, in a round known to be measured.
- Correction to the spike's correction: the opt-in claim is in this harness's own Workflow tool description ("the user
  invoked a skill or slash command whose instructions tell you to call Workflow"), which is primary for this
  environment, though the public docs don't say it.

### Round 9 (main agent: research and evaluation; workflow: checks and record)
Answers (round 8): cost only if cheaper (S5: measure a lighter workflow); no fallback for users with workflows off
(S1: the user's setup only); plugin later (O20; the managed-settings gap stays a known gap).
Evaluation by the main agent:
- S1 as answered removes O10c's only edge over O10 limited to the mechanical rules: those rules may live only in the
  workflow, and SKILL.md keeps the conversational rules (framing, report, questions, pushback, review). That shortens
  SKILL.md, which also helps S3 (deferred). O10 (mechanical rules only) and O10c merge into one candidate, "O10m":
  a saved workflow per round whose agents read their step's rules from one place (the workflow's own prompts, or a
  file per step next to it), with no copy in SKILL.md.
- S5 decides O10m: this round measures a 3-agent workflow (bias check, rejection check, record), with research and
  evaluation kept in the main agent. If its cost is near the hand-run checks (~100K), O10m (lite) joins the leader;
  the gate (O17b) then checks that the workflow's round entry exists, plus the main agent's own lines.
- Ranking: leading O18 + O17b; runner-up O10m (lite) + O17d, pending this round's measurement.
Checks and record (workflow, Record step; works from the log and the two checks' findings, not the chat):
- Bias check (fresh subagent; independent of the chat, but framed by the workflow script). Found: S1 contradicts
  itself (round 9 narrowed it to the user's setup, the row still said "no dependency on the user's own setup", the
  memory note says "general, sharable"); S5 used with two bars ("near ~100K" in the plan above against the user's
  "only if cheaper"; the lite workflow runs the same two checks plus a Record agent, so it can hardly be cheaper; the
  ~100K baseline is an estimate at smaller log sizes); S7 inferred and never asked in 9 rounds, now weighing more; S3
  unverified and deferred, yet credited to O10m; S2, S8 written by the researcher and treated as firm in *Why*. Against
  the leader: a "Draft" *Decision* turns the gate off (rounds 7-9 here would have run ungated); uneven burden of proof
  (O10m measured, the leader's efficacy never; "no extra agents" is no edge, the checklist needs the same two
  subagents); "presence, not truth" holds for the workflow too (round 8's Record step); the bypasses (plain text,
  "Follow-up") rest on a prose rule of the kind that gets skipped (K3); O10m inconsistent ("no copy in SKILL.md"
  against the lite variant keeping evaluation in the main agent) and missing from *Options* and *Matrix*. Missing
  options: one combined check subagent; checks on a smaller model; proof-of-execution files for the gate; the deny
  reason carrying the checklist text; pruning SKILL.md as a main fix.
- Rejection check (fresh subagent). Found: round 9's answers not carried into Requirements, Matrix, Options or the
  records; S1 changed meaning (needs a new row and a re-check of every S1 ✗/~); S5 answered but still "unverified".
  O1, O16 pass. O7: variant (reminder on an earlier call) never weighed; S8 ✗ and S9 ~ unexplained. O9: cites S8,
  shared with the leader; S5 reason stale; variant points to O10c. O10: its scenario is accepted by the answer. O11:
  variant (stronger wording only on the checklist lines) missed. O13: reason cites the rejected S6, no scenario, no
  variant. O14: S2 is ~ not ✗; "self-applied" shared; "not in every tool set" has no requirement; no variant. O17a:
  S7 stretched; ✗ against O17b's ~ unjustified; its real cost (internal format) has no requirement. O17c: S5 answered
  for workflow agents, its cheap variant not weighed; timeouts no requirement; points to O10c. Options rows
  contradicting the Matrix: O10/O10b/O10c/O17d (O10m missing), O9, O14, O17a, O4/O6 (scored equal or better than the
  leader yet "deferred"), every S1 ~, O16 ("deterministic" with S8 ✗), O20 (described as packaging the leader, scored
  as packaging alone); *Decision* *Rejected* still gives old reasons.
- Changed in the log:
  - Requirements: S1 replaced by S1b (the user's setup only, preference, conflict with "sharable" asked); S5 now a
    preference with the bar "cheaper than ~100K", "near" corrected to "cheaper", add-ons unasked; S7 marked to ask;
    S10 added (every checklist step checked, user round 6; it was the confirmed reason behind O17b over O17a, missing
    as a row).
  - Options: O10m added (lite variant made consistent: evaluation rules stay in SKILL.md; no S3 credit); O10, O10c
    absorbed into O10m; O17d part of O10m; O22-O25 added from the bias check; O7, O9, O11, O13, O14, O16, O17a, O17c,
    O1 rows aligned with their records; O17b carries the draft-decision defect; O20 described as packaging alone;
    O4, O6 marked add-ons (S10 ✗).
  - Matrix: S1b row (all ✓), S10 row, O10m and O22-O25 columns, S5 ✗ for full workflows, O17a S7 ✗ → ~; changes
    listed under *Matrix*.
  - Evaluation: records rewritten for O1, O7, O9, O10/O10b/O10c, O11, O13, O14, O16, O17a, O17c; O10m note; the
    draft-decision hole and the uneven burden of proof added; O4/O6 and pruning explained.
  - Open questions replaced (round 6's three were answered); *Decision* *Why* and *Rejected* aligned with the records,
    known gaps extended (still a draft).
- Not changed: the round 9 text above (kept as the main agent wrote it; "near" corrected here and in S5); the
  measurement of this round's workflow (the main agent reads it from the harness after this step).
Ranking change: leading O18 + O17b unchanged, now with a required activation fix; runner-up O10m (lite) + O17d,
pending S5 (bias check expects it not to be cheaper); O10 and O10c absorbed; O17a trails on S10 instead of S7; O9 on
S5 and S10 instead of S8; new candidates O22-O25, of which O24 could give the leader O10m's H1 edge without a
workflow.
Checklist:
- Scope: unchanged (round-end rule following; compaction S3 stays its own decision).
- Requirements: S1b (new meaning), S5 (status: preference, bar "cheaper"), S7 (to ask), S10 (new row from the
  round 6 answer); each with reason, source and status.
- Replaced requirements: S1 → S1b; every option S1 marked ✗ or ~ (O7, O10, O10b, O10c, O16, O17a, O17b, O17c, O17d)
  re-checked, all ✓ under S1b.
- Written requirements: n/a: no requirement comes from a doc, test or commit in this research.
- Deciding unverified requirements: S7 asked this round (question 3); S5's open part (add-ons) and S1b's conflict
  with "sharable" asked (questions 1, 2). S3 stays deferred, not deciding here.
- Options: O10m (merge of O10 and O10c, built-in tooling), O22 (simpler pattern), O23 (built-in tooling), O24 (gate
  variant), O25 (gate variant), all from the bias check.
- Searches: n/a: no new searches this round (evaluation from the log; the record step edits only); the per-agent
  model setting behind O23 not searched, marked unverified.
- Deciding claims: "the lite workflow can hardly be cheaper than ~100K" is an argument, settled by this round's
  measurement; the ~100K baseline is an estimate (n=3, smaller logs), marked so in S5; O23's per-agent model setting
  unverified.
- Matrix: updated (S1b, S10 rows; O10m, O22-O25 columns; S5 and S7 cells); changes listed under *Matrix*.
- Rejection records: one per trailing option in *Evaluation* (O1, O7, O9, O11, O13, O14, O16, O17a, O17c), each
  with the requirement as worded, the scenario checked against the others, the best variant and the leader's cells
  compared; O10, O10b, O10c recorded as absorbed into O10m.
- Harms: leader: a draft *Decision* switches the gate off in reopened rounds; bypasses rest on a prose rule. O10m:
  workflows off means the check rules are gone (accepted, S1b); the Record agent's checklist drifts from SKILL.md's
  (S7); round 8 shows a Record step can apply the checks only partly. O24: the main agent writes the findings file
  itself. O22: one lens crowds out the other. O23: a weaker model misses what the checks found so far.
- Reversibility: every option rated in *Options*; new ones (O10m, O22-O25) cheap; none one-way.
- Stress test: leader: reopened round after a draft decision (gate off; fix in question 4); plain-text questions;
  "Follow-up" on a first call; faked check lines (O24 narrows). Runner-up: a Record step that drops a check's finding
  (seen in round 8); cost above the bar.
- Bias check: fresh subagent, independent of the chat (framed by the workflow script); findings and changes above.
- Rejection check: fresh subagent; findings and changes above.
- Ranking change: see above.
- Report: drafted below for the main agent (what changed; recommendation as far as the evaluation shows; no core
  rejections; the checks' findings), with this round's measured cost to be filled in by the main agent.
- Questions: S5 measurement and add-ons, S1b against "sharable", S7, gate activation, O24/O25; remarks last; through
  the question tool by the main agent.
- Pushback: n/a: the user picked no option this round; the answers narrowed requirements.

### Round 9, measured by the main agent
- Cost: 3 agents (bias check, rejection check, record), 237K subagent tokens, 38 tool uses, 7.5 min (18:08-18:16).
  The hand-run checks cost ~100K for both; the record agent adds ~130K (it re-reads and rewrites a 600-line log). Not
  cheaper (S5 bar: "only if cheaper"), so O10m (lite) trails on S5. The main agent's own record step also costs
  tokens, but in a context that already holds the round.
- Quality: both checks found real defects (the "Draft" *Decision* turns the gate off, so rounds 7-9 would have run
  ungated; S1 changed meaning; O9's S8 reason shared with the leader); the record step applied them across the log.
  The checks' quality is that of the hand-run checks (same kind of subagent); the workflow adds enforcement and a
  thorough record, at ~2.4x the cost.
- Gate fix for the draft flaw: active unless *Decision* starts with "Reviewed"; Phase 6's confirmation call passes
  because the log changed and the newest round entry's checklist is filled.
- New lead candidate for proof that the checks ran without a workflow: O24 with a marker written by a hook rather
  than by the agent (a SubagentStop hook in the skill's frontmatter, matching custom check agents from O19, writes
  a timestamp; the gate requires both markers newer than the previous allowed question). Unverified: skill hooks on
  SubagentStop, and its matcher on agent type.

### Round 10
Answers (round 9): no timestamp proof for the checks, the checklist line is enough (O24/O19 not adopted); sharable
later: build for the user's setup, but keep every part inside the skill folder (S1c, preference); S7 "not important"
(rejected as a requirement). Remark: the spikes ran long and cost much; two hand-run rounds would have fit in the same
time; "this pretty much rules out the workflow option". New requirement S11: a round stays fast (minutes of waiting
per round count against an option), user, round 10, preference. O10m trails on S5 and S11, as the user concluded.
Lesson for the skill (out of scope here): before proposing a spike, estimate its cost and time against a hand-run
round, and say both in the question; these spikes were offered as "4-6 agents" with no token or time estimate.
Applied to SKILL.md, Phase 4 step 7 (2026-10-24).
Stop condition: no new requirement changes the ranking; S3 deferred; no requirement left unverified that decides.

## Decision
Reviewed by the user, 2026-10-24 ("let's move forward; the effect will be tested later"). Implementation: step 1 prose layer, step 2 the gate.
Amended after review (user, 2026-10-24): the ticked copy pasted at the end invited rote ticking (a do-confirm list
signed off at once). Both checklists now follow Anthropic's pattern in the log: copied with open items (`- [ ]`) when
the round (or *Decision*) starts, each item marked `[x]` right after its step, a note only where it adds information
(IDs asked, "n/a: <reason>"); no copy in the chat. The gate blocks the question call while the newest round entry has
an open item. Evidence lines per item were weighed (~600 output tokens a round, under 1% of a round's cost) and not
chosen. Second amendment (user, 2026-10-24): checklists kept per round entry would add ~350 tokens a round to every
later read of the log (quadratic in rounds), so the log keeps only the current round's checklist, in one
*Round checklist* section above *Rounds*, replaced when a round starts; the gate reads that section. A file in the
session's scratch folder was the alternative; its only edge (subagents don't read ~350 tokens) is negligible.
Step 2 implemented (2026-10-24): `scripts/round-gate.py` (Python 3, stdlib) and the PreToolUse hook in SKILL.md's
frontmatter (`${CLAUDE_SKILL_DIR:-$HOME/.claude/skills/design-research}`, since the docs don't say the variable
expands in hook commands). The log counts as open when a `.md` path named in the session's tool calls has
`## Problem` and `## Rounds`, changed after the session started, and *Decision* doesn't start with "Reviewed"; the
last allowed call's time is kept in `~/.cache/design-research-gate/<session>.json`; any error lets the call through
with a visible message. Tested with fake transcripts and logs (11 cases: no log, no "Remarks", "Follow-up", open
item, no checklist, all done, unchanged since the last call, changed again, reviewed, older than the session, broken
input). Not yet tested live in a session (pending: a fresh session, since this one runs the old skill text).
Known gap added: a resumed log that isn't written before the first question leaves that question ungated.

**Choice:** O18 + O17b.
1. Round checklist (O18): every round entry in the log's *Rounds* ends with a checklist, one line per step, each
   filled or "n/a: <reason>". The agent copies it, ticked, into the round report. Lines:
   - first round only: *Log* (path in the report; new or resumed, what was outdated); *Problem and success criteria*.
   - every round: *Scope*; *Requirements* (new or changed, each with reason, source, status); *Replaced
     requirements*; *Written requirements* (evidence); *Deciding unverified requirements* (asked this round, or
     assumptions after "can't answer"); *Options* (added, by category); *Searches* (or "no web search", said in the
     report); *Deciding claims* (cross-checked, or marked unverified); *Matrix*; *Rejection records* (requirement as
     worded, scenario against the other requirements, best variant, the leader's ✗/~ compared); *Harms*;
     *Reversibility* (every option); *Stress test*; *Bias check*; *Rejection check*; *Ranking change*; *Report*;
     *Questions*; *Pushback*.
2. Gate (O17b), Linux first: a PreToolUse hook on AskUserQuestion, declared in the skill's frontmatter, its script in
   the skill folder (S1c). Active while a research log (a `.md` with `## Problem` and `## Rounds`, not the skill's own
   file) read or written in this session has a *Decision* that doesn't start with "Reviewed". It denies the call
   unless the last question is headed "Remarks", and, unless the first question is headed "Follow-up", the log
   changed since the previous allowed call and the newest round entry has every checklist line filled. The deny
   reason names the missing lines and repeats the checklist from SKILL.md (O25). On other systems it lets the call
   through with a visible message.
3. Skill rules: in Claude Code, always ask through the question tool; a call that continues the previous one (the
   4-question limit) starts with a question headed "Follow-up"; mark *Decision* "Reviewed" once the user has
   reviewed the whole overview.
4. Decision checklist (O18, copied and ticked, not gated): stop condition met; *Why* and *Rejected* on confirmed
   requirements and confirmed by the user; known gaps and open child decisions; docs and rules updated where they take
   effect, overstated requirements corrected, uncommitted with a commit message; commit-sized steps, success criteria
   only as project rules; out-of-scope problems noted; the overview's six parts; reviewed in open chat; no
   implementation before the review.

**Why:**
1. The real skips all happen at the round end (K2, K3, K5, H1, H2, and H1 three more times in this run): S8,
   preference (round 4).
2. The checklist is in front of the agent when it acts, in the log, the report and the deny reason: S2, preference
   (round 2).
3. A deny blocks the question call before the user sees it (spike 2): the round can't end with lines missing. The
   user chose the gate on the log's content (round 6) with a complete checklist (round 6).
4. It runs only during research and turns off once the decision is reviewed: S9, preference (round 4); the draft flaw
   fixed (round 9 check).
5. No extra agents and no waiting beyond today's two checks: S5 (round 8, "only if cheaper"), S11 (round 10).
6. Everything lives in the skill folder, so it can become a plugin later: S1c (round 10).

**Rejected (closest first):**
- O10m, a workflow per round (O10, O10b, O10c merged): measured at ~3.5x (full round) and ~2.4x (checks and record)
  the cost of the hand-run checks, 7.5-10 minutes per round (S5, S11; spikes 3 and 4). The user: "pretty much rules
  out the workflow option".
- O17c, a model-run gate: a model call per question (S5); the alternative if O17b gets gamed.
- O24/O19, timestamp proof that the checks ran: the user finds the checklist line enough (round 10).
- O17a, a gate on tool calls: checks tool calls, not the checklist (round 6 choice).
- O7, O16, hook reminders: they arrive after the questions (S2; spike 1).
- O9, a compliance subagent: extra cost (S5), and itself a skippable step.
- O11, stronger wording; O13; O14, a task list; O1, do nothing: change nothing at the round end (S2, S8).
- Deferred to the compaction decision (S3): O4, O5, O6, O8, O12. Later: O20 (plugin), O15 (evals), O22 (one combined
  check agent) and O23 (checks on a smaller model) as cost savers.

**Known gaps:**
- Checklist lines can be filled without the work; the gate checks presence, not truth. Watch the next runs; O17c or
  O24 if it gets gamed.
- The deciding questions (K2) and the review (K5) are on the checklists, not gated.
- "Follow-up" skips the gate; misuse is visible in the dialog.
- Not Linux: the gate does nothing yet.
- The checklist is long (~22 lines); rote ticking is a risk.
- After a compaction, Phases 5-6 of the skill text are cut (S3, deferred); the deny reason repeats the checklist.
- Under `strictPluginOnlyCustomization` a personal skill's hooks don't run (O20 later).
- The gate's efficacy is unmeasured (user, round 3: "efficacy unsure").
- The spike hooks stay registered in this session until it ends.
- Skill hooks are not re-registered when a session is resumed, so the gate is off in a resumed session until the skill
  is invoked again (spike, `skill-and-log-size.md` round 2). Accepted as rare by the user (2026-10-24).

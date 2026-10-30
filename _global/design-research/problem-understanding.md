# Problem understanding

**Status (2026-10-30): decision drafted and reviewed in part; paused by the user ("plugin first") until
`skill-packaging.md` decides how the skills are packaged and where shared files live. Resume at plan step 1, with the
log format at the shared location that decision picks.**

## Problem
A design-research run starts judging solutions before it knows the user's situation. The researcher frames the
problem alone, then lists options, picks a leader, drafts it and runs the checks, all before the user is asked
anything. The user's situation (what they have now, what is wrong with it, what they own, time horizons, what they
value) comes out late, through objections to a draft, or never. The research must understand the problem, with the
user, before it explores solutions.

## Related decisions
- Siblings (decided): `skill-and-log-size.md` (core size limit, ~4,800 estimated tokens of SKILL.md body),
  `skill-rule-following.md` (round checklist and gate), `model-side-discovery.md` (generators), `option-discovery.md`.
- Waits on: `skill-packaging.md` (open; the shared log format's location).
- Evidence: benchmark `benchmarks/recumbent-luggage-rack/runs/2026-10-28-c8c33da/score.md`, replay targets 1, 3, 4.

## Known so far
- SKILL.md Phase 1 has no step that asks the user; the first question call comes at Phase 5, after options, matrix,
  draft and both checks (SKILL.md as of commit `e2c7998` in `~/.claude/skills`).
- Benchmark 2026-10-28: current setup, what is wrong now (G14), owned parts (G15, G16), long-term values (G25) never
  asked or only through review objections; the leader of rounds 2-3 rested on a wrong premise about the bike, corrected
  by the answerer in call 3. The researcher itself said in call 8: "I should have asked in the first round whether you
  already had a rack or other parts."
- SKILL.md body is ~4,723 estimated tokens, 77 under the gate's warning (TODO, 2026-10-28): anything added to the core
  needs a trim elsewhere.

## Success criteria
- Judged by the user over the next real runs: the first questions are about the situation, and no option leads on a
  premise the user would have corrected in one answer.
- Benchmark replay (recumbent rack) at least as good on match, points, timing and cost (benchmarks README rule). It
  replays the failures this research is built from, so it shows no regression, not that the change works.
- Held out: flexcompose's `machine-release-programs` run had the same problem (user, round 1). Not read while building
  options; the evaluation reads it to judge whether the leader would have caught its failures.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| U1 | The user's situation is understood, and the framing confirmed by the user, before options are generated or ranked | a frame built alone anchors the options and the leader; facts only the user has arrive as objections to a draft, or never; the wrong problem gets solved | user, round 1 (all four symptoms; seen in the benchmark and in flexcompose's machine-release-programs run) | should | yes (round 2: "should") |
| U1b | Requirements are inventoried and the deciding ones verified with the user before options are explored | options scored on unverified requirements rank wrong from round 1 on | user, round 1 (boundary: "also requirements") | should | yes |
| U2b | The user can see whether the problem was confirmed, and a skipped confirmation gets noticed before it decides anything | skipped steps are the main failure of past runs; discovery was skipped on 2026-10-28 because nothing checked it | user, round 1 ("clear handover"); `skill-rule-following.md`; replaces U2 (bias check, round 2: named a mechanism) | should | yes |
| U3 | The design-research core stays within what a compaction keeps | rules past the cut are lost after a compaction | user, round 1 ("core size limit"); `skill-and-log-size.md` | should | yes |
| U4b | Problem understanding is reachable without a design decision (a vague request, a bug report) | problem understanding is wanted for more than design decisions | user, round 1 ("use it on its own"); replaces U4 (bias check, round 2: "on its own" pre-selected a separate skill) | should | yes |
| U5b | No costly work (option search, generators, drafts) runs on a problem the user hasn't confirmed | wasted time and tokens; results anchored on a vague frame | user, round 1 ("too broad, too early"); replaces U5 (bias check, round 2: named a tool) | should | yes |
| U7 | A rule gets enforced by a hook only after a run shows it skipped | hooks cost upkeep; text alone hasn't been tried for this step yet | user, round 3 ("test text first") | should | yes |
| U6 | Understanding the problem doesn't make a run much slower or costlier for the user (one extra question round at most for a clear request) | the user waits longer before seeing anything concrete; small decisions get heavy | inferred; user, round 2 ("scale by clarity") | should | yes |

## Options
Discovery: two generators (own field blind; far fields: medicine, architecture, sales, surgery, mechanics,
ethnography), merged with the researcher's own. Map axes: **where it lives** (own skill / inside design-research /
standing profile), **how it is enforced** (prose / visible confirmation line / hook), **what the intake is** (open
interview / fixed situation questions / restate-and-correct / probe with a solution). Empty cells: hook-enforced
standing profile (no sensible option: a profile isn't per problem).

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O0 | Do nothing: Phase 1 already says to restate and read first | no change | no step asks the user before Phase 5 | cheap | trailing (U1, U1b, U2b, U4b, U5b) |
| O1 | User's proposal, best form: a separate `problem-formulation` skill, own trigger (vague request, bug, design question); reads first, restates without the proposal, asks the situation questions, inventories requirements, writes the problem back and gets it confirmed; design-research's Phase 1-2 become "run it first"; `requirements.md` moves there | U1, U1b, U3 (core -280 words), U4b | two skills share the log format and `requirements.md` by path; both trigger on design questions | cheap | leading (with O5, O6, O11, the confirmation line) |
| O2 | A framing round inside design-research: the same steps in a reference file `framing.md`, a stub in the core | U1, U1b, U3 | U4b not met | cheap | trailing (U4b) |
| O2b | O2 with a "problem only" entry: design-research's description also triggers on vague requests and bug reports, and stops after the confirmation (rejection check, round 2) | U1, U1b, U3, U4b partly | the whole research skill (~4,000 tokens, its hooks) loads for a bug report; a longer description | cheap | runner-up (with O5, O6, O11) |
| O3 | Add-on: *Problem* gets a `Confirmed by the user: <date>` line; the design-research hook denies subagent calls while the open log lacks it | U2b, U5b | hook logic; resumed old logs ask for confirmation first | cheap | line kept; hook deferred (U7: only after a run shows the skip) |
| O4 | Adopt obra/superpowers `brainstorming` (MIT) as the problem step | asks before approaches, one question at a time, reads first, hard gate in prose | goes on to approaches and a design doc in the repo (overlaps design-research); no situation inventory; no requirement verification | cheap | trailing (U1b; ~U1, U2b, U4b, U5b, U6) |
| O5 | Content: fixed situation questions in order (Peña programming, anamnesis, SPIN): what exists, what's wrong, owned, horizons, values, part of what, cost of nothing | U1 | longer first round | cheap | add-on (in the draft) |
| O6 | Content: write the problem back for correction (reverse brief) plus a premortem on the framing ("if it solves the wrong problem, why?") | U1 | one more question | cheap | add-on (in the draft) |
| O7 | Two-key framing: a subagent writes the problem from the user's words only; diffed with the researcher's | U1 (against a frame built alone) | one agent per run | cheap | trailing (no cell gained; agent cost is a tie-break) |
| O11 | Content (bias check, round 2): scale the intake by what reading left open: every situation point answered by reading → the written-back problem and one confirmation question; each point assumed or missing → asked. Round 3: scaled by open situation facts, not by how clear the request reads (the benchmark's request read clear and hid the owned rack) | U6 | the researcher judges what reading answered, and may judge wrong (the write-back is the catch) | cheap | add-on (leader) |
| O8 | Standing profile in the vault: situation and values stored once, each run asks only the change | U6 | situations differ per problem; stale profile | cheap | trailing (U1b, U2b, U5b; ~U1, U4b) |
| O9 | Probe first: a deliberately plain proposal for the user to react to | U6 | an option before the problem is confirmed | cheap | trailing (U1, U2b, U5b; ~U1b) |
| O10 | Questions-only first turn (prose rule), no confirmation step | U1 partly, U6 | no confirmation, no gate | cheap | trailing (U1b, U2b, U4b; ~U1, U3, U5b) |

## Matrix
The hook (O3) is dropped (user, round 2); the confirmation line stays in every row that names it. Round 3: redone
after the rejection check.

| Option | U1 | U1b | U2b | U3 | U4b | U5b | U6 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|
| *priority, verified* | should, yes | should, yes | should, yes | should, yes | should, yes | should, yes | should, yes | |
| O1 + O5 + O6 + O11 + line (leader) | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ~ U2b U5b |
| leader + O3 hook on subagents | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | ~ U2b U5b (narrower: caught before agent work, not after) |
| O2b + O5 + O6 + O11 + line | ✓ | ✓ | ~ | ✓ | ~ | ~ | ✓ | ~ U2b U4b U5b |
| O2 + O5 + O6 + O11 + line | ✓ | ✓ | ~ | ✓ | ✗ | ~ | ✓ | ✗ U4b, ~ U2b U5b |
| O0 | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ U1 U1b U2b U4b U5b |
| O4 | ~ | ✗ | ~ | ✓ | ~ | ~ | ~ | ✗ U1b, ~ U1 U2b U4b U5b U6 |
| leader + O7 | ✓ | ✓ | ~ | ✓ | ✓ | ~ | ✓ | same cells as the leader: no gain |
| O8 | ~ | ✗ | ✗ | ✓ | ~ | ✗ | ✓ | ✗ U1b U2b U5b, ~ U1 U4b |
| O9 | ✗ | ~ | ✗ | ✓ | ✓ | ✗ | ✓ | ✗ U1 U2b U5b, ~ U1b |
| O10 | ~ | ✗ | ✗ | ~ | ✗ | ~ | ✓ | ✗ U1b U2b U4b, ~ U1 U3 U5b |

"~ U2b, U5b" wherever a line is the only control: the researcher writes the line itself, and the round gate notices
a missing one only at design-research's first question call, after the costly work (checks, round 3).

## Evaluation
### Rejection records
- **O0** trails on U1, U1b, U2b, U4b, U5b (all should, verified). Scenario: the benchmark and the held-out run, where
  the first question came after options and a leader. No other requirement accepts that. Best variant: O10. Leader's
  cells: ✓ on U1, U1b, U4b; ~ on U2b, U5b where O0 is ✗. O0 gains nothing on U6 (both ✓).
- **O2b** (runner-up) is ~ on U4b where the leader is ✓: a bug report loads the whole research skill (~4,000 tokens
  of rules about options, checks and rounds) to use its first phase (the user chose a separate skill, round 2). Its
  gain, no second skill and no cross-skill path or trigger competition, is covered by no requirement: tie-break
  only. Both add trigger text (the leader a second description, O2b a longer one): not counted.
- **O2** trails on U4b (✗): the steps load only with the whole research. All other cells equal the leader. Best
  variant: O2b.
- **O3 hook** is compared, not rejected: the user chose "no hook" (round 2) and no requirement stands against it.
  With it, a skipped confirmation is caught before any subagent runs instead of at the first question call (U2b,
  U5b still ~: the line is self-attested, and options listed without agents pass). Its cost (hook upkeep) is covered
  by no requirement until the user's reason is known (round 3 question).
- **O4** trails on U1b (✗: no requirement inventory or verification), ~U1 (no situation questions), ~U2b and ~U5b
  (a prose gate on building, not on options), ~U4b (it goes on to approaches and a design doc), ~U6 (a full design
  pass per request). Best variant: take its "look before you ask" into the leader's step 1 (done).
- **O7** gains no cell: a framer that sees only the user's words misses the same unsaid facts (the owned rack, the
  running inference service). Its agent cost is covered by no requirement: tie-break only.
- **O8** trails on U1b (✗: a profile holds the user's general situation, not this problem's requirements), U2b and
  U5b (✗: no confirmation of this problem), ~U1 (stale, not per problem), ~U4b. Best variant: the leader's step 1
  reads a profile when one exists.
- **O9** trails on U1 (✗: an option comes before the problem is confirmed), U2b, U5b; ~U1b (reactions reveal some
  requirements). Best variant: a probe as a question in step 4 ("would something like X do?"); U1 still ✗.
- **O10** (prose rule "ask the situation questions before Phase 3" in the core): trails on U1b (no inventory before
  options), U2b (no confirmation), U4b (core only); ~U1 (no write-back), ~U5b (prose), ~U3 (the question list costs
  ~120 words against 77 tokens of headroom unless something moves out).

### Harms (leader O1 + line, no hook)
- Without a hook, nothing stops subagents before confirmation; the round gate only notices an unmarked checklist
  item when the first round's questions go out, after the work was done. The discovery skip of 2026-10-28 was this
  shape. Asked in round 3 why no hook.
- The line is self-attested: the researcher can write it after answers that were all defaults. Known gap.
- The round gate treats a log as open only once it has a *Rounds* section. problem-formulation doesn't write one, so
  its own question calls pass the gate; design-research adds *Rounds* in its first round. This works by the section
  list, an implicit coupling: say it in both skills' text or the gate's docstring.
- Hidden coupling: design-research reads `../problem-formulation/requirements.md` and the log format by relative
  path; a rename of either skill breaks it silently. Mitigation: the gate script checks the sibling exists.
- The gate checks an artifact, not the behaviour: the researcher can write the confirmation line without asking.
  Variant to weigh: the hook requires a question call after *Problem* was last written. Known gap until then.
- Trigger competition: both skills match a design question; if design-research loads alone, its Phase 1 must hand
  over. O3's hook catches the skip before any subagent runs, but not a researcher who lists options itself without
  agents.
- Old logs: a resumed log without the confirmation line is blocked from subagents until the user confirms its
  *Problem*. Intended, but one extra round on resume.
- Rejection in use (why the user would say no): an extra round of questions on a request that was already clear;
  the full situation list on a small decision. Step 1 ("skip what reading answered") and step 4's "skipping" are
  the only brake; see U6.

### Reversibility
All options are text and a hook: cheap. The confirmation line adds one line to logs; removing it later costs nothing.

### Stress test (draft, held-out case)
Draft: `problem-understanding-draft/` (copied from the session scratchpad, 2026-10-30) (`problem-formulation/SKILL.md`, `design-research-changes.md`).
Walked flexcompose's `machine-release-programs` run (held out; read only now) through the draft:
- Round 1 framed the wrong problem (several programs, conflicting dependencies, versioning); the user wrote the
  problem statement themselves (`integration-problem.md`). Draft step 4 "what is wrong with it" asks for exactly
  what the user wrote under *What goes wrong today*, and step 6-7 put the framing to the user before options: caught.
- The run first studied the training repo; only the inference service runs on the machine. Step 4 "how and where it
  is used": caught, likely in the first call.
- The decision paused at round 11 on `machine-repo-layout.md` (where each recipe lives). Step 4 "what it is part of,
  what it waits on": would have raised it; whether the user would have seen the dependency in round 1 is unknown.
- Benchmark (not held out): current setup, owned parts, horizons, values are step 4's questions by construction.

## Open questions
None deciding. Known gap: where a standalone run's result goes (user, round 3: "not sure"; same log format for now,
revisit after first use).

## Sources
| Claim | Source (URL or `file:line`) | Date | Reliability |
|---|---|---|---|
| superpowers `brainstorming` asks before approaches, reads first, hard gate in prose; MIT | https://raw.githubusercontent.com/obra/superpowers/main/skills/brainstorming/SKILL.md; github.com/obra/superpowers README | 2026-10-30 | primary (fetched summary) |
| grill-me is a stub calling a "grilling" skill | https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grill-me/SKILL.md | 2026-10-30 | primary |
| Peña programming separates problem seeking from design | generator report (perlego listing) | 2026-10-30 | unverified (secondary) |
| No user question before Phase 5 | `~/.claude/skills/design-research/SKILL.md:41-147` | 2026-10-30 | read |
| Situation facts never asked | `benchmarks/recumbent-luggage-rack/runs/2026-10-28-c8c33da/score.md` | 2026-10-28 | run record |

## Round checklist
Checklist:
- [x] Log (first round): n/a: round 3
- [x] Problem and success criteria (first round): n/a: round 3
- [x] Scope: unchanged
- [x] Requirements: U1 should (verified), U6 verified
- [x] Replaced requirements: n/a: none this round
- [x] Written requirements: n/a: none written for this topic; U2b, U3 cite decided logs
- [x] Deciding unverified requirements: none left; the reason behind "no hook" asked
- [x] Options: no new ones; bias check's merge of steps 4-6 and stricter gate variants taken into the draft or O3
- [x] Searches: no web search this round, said in the report
- [x] Deciding claims: cross-checked against a second source, or marked unverified
- [x] Matrix: updated
- [x] Rejection records: one per trailing or not applicable option (scenario, best variant, leader's cells compared)
- [x] Harms: scenarios for the leading option
- [x] Reversibility: every option rated
- [x] Draft and stress test: of the leading option; the draft's path in the report
- [x] Bias check: findings in the log and the report
- [x] Rejection check: findings in the log and the report; verdicts corrected
- [x] Ranking change: recorded
- [x] Report: what changed, recommendation, runner-up, must rejections, the checks' findings
- [x] Questions: deciding unverified ones first, ordered by ranking impact, through the question tool, remarks last
- [x] Pushback: n/a: no choice made yet

## Rounds
1. Framing only (on purpose: the subject of this research is that runs rank options before the problem is
   understood). No leader.
2. Discovery (2 generators), 11 options; leader O1 + O3 + O5 + O6 + O11, runner-up O2b (close: U4b only). Checks:
   O2b added, O3 composable, leader's U2b/U5b now ~, O7 trailing, U2/U4/U5 reworded as needs.
3. Answers: U1 should; separate skill (O1 holds); scale by clarity (O11, U6 ✓); no hook (O3's hook out, line kept).
   Leader unchanged; runner-up O2b. Checks: records and matrix realigned; gate catches a skip only after the work;
   draft batches steps 4-6, rewords the premortem, options as kinds of answer, *Rounds* coupling stated.
4. Answers: "test text first" (U7, hook deferred); standalone output not sure (known gap). No ranking change;
   decision drafted.
5. Review: amendments (no "what you own", stricter use, one-way dependency, shared log format outside both
   skills); paused for `skill-packaging.md` (user: plugin first).

## Decision
Draft

**Choice.** A separate `problem-formulation` skill (O1) that design-research runs first, with fixed situation
questions (O5), a write-back for the user to correct (O6), questions scaled by what reading left open (O11), and a
`Confirmed by the user: <date>` line under *Problem*, checked as a round-checklist item by the existing gate. No new
hook (U7). Draft: `problem-understanding-draft/` (copied from the session scratchpad, 2026-10-30).

**Why.**
- U1 (should, verified): the situation is asked and the framing confirmed before any option exists; the draft's
  step 4 and 6 would likely have caught all three failures of the held-out machine-release-programs run.
- U4b (should, verified: "separate skill"): usable for a bug or a vague request without loading the research.
- U3 (should, verified): design-research's core shrinks by ~280 words (~690 tokens).
- U6 (should, verified: "scale by clarity"): one question call when reading answered the situation.
- U7 (should, verified: "test text first"): text first; a hook only when a run shows the skip.

**Rejected.**
- O2b, one skill with a "problem only" entry: ~U4b, a bug report loads the whole research skill. Its gains (no
  second skill, no cross-skill path) are tie-breaks only.
- O2, a framing round inside design-research: ✗U4b.
- O3's hook: deferred by U7, not rejected; comes back when a run skips the confirmation.
- O0, O4 (superpowers brainstorming), O7, O8, O9, O10: see *Evaluation*.

**Known gaps.**
- The confirmation line is self-attested, and without a hook a skipped confirmation shows only at design-research's
  first question call (U2b, U5b ~). Accepted under U7; watched in the next run.
- The researcher judges what reading answered; the write-back is the only catch.
- Standalone output: same log format for now (user: not sure); revisit after first use.
- The gate passes problem-formulation's calls because its log has no *Rounds* yet: an implicit coupling, stated in
  the draft.

**Changes from the review (2026-10-30, user).**
- Dropped "what they own" from the situation questions: covered by "what exists now", and specific to one benchmark.
- Stricter use: problem-formulation runs when another skill calls it or the user asks to frame a problem; not on
  its own initiative. Mostly called by design-research.
- One-way dependency: design-research depends on problem-formulation, never the reverse; problem-formulation's text
  names no other skill. The log format is shared by both (where it lives: asked). `requirements.md` moves to
  problem-formulation without design-research terms (rounds file, Phase 6, matrix); those rules stay in
  design-research.
- The log format lives outside both skills, so a third skill could use it too (user, review answer). Also asked:
  can the skills be organized in one directory that is shared as a whole? Found (code.claude.com/docs/en/skills and
  plugins-reference, 2026-10-30): a plugin holds several skills (`skills/<name>/SKILL.md`) and shared files reached
  through `${CLAUDE_PLUGIN_ROOT}` ("resources shared between the plugin's skills"); its skills are namespaced
  (`<plugin>:design-research`); it installs through a marketplace (a git repo or local path). Whether skill
  frontmatter hooks work in plugin skills, and whether a folder without `SKILL.md` in `~/.claude/skills` is ignored:
  unverified. Proposed: packaging as a plugin is a separate decision (its own research, after this split); for now
  the format goes to `~/.claude/skills/research-log/`, referenced as `${CLAUDE_SKILL_DIR}/../research-log/`, one
  line per skill to change when packaged.

**Open child decisions.** None split off.

**Plan** (one commit each, in `~/.claude/skills`):
1. `feat: split problem formulation out of design-research`: add `problem-formulation/SKILL.md`; move
   `design-research/requirements.md` to `problem-formulation/`; replace design-research's Phase 1-2 with the hand-over
   and renumber; checklist item "Problem: confirmed by the user"; `log-template.md` gains *Situation* and the
   confirmation line; description updated.
2. `docs: show problem-formulation in the design-research README`: flowchart and files table (checked with `mmdc`).
3. Replay the recumbent-rack benchmark (~$8.50, needs your go-ahead) and run the next real design question; check
   that the first question call comes before any option, and whether the confirmation was skipped (U7: hook if so).
4. After first use: ask what it showed; amend this decision or reopen a round.

Decision checklist:
- [x] Stop condition: no ranking change in round 4; nothing deciding left unverified; U7 new but changes no verdict
- [ ] Why and Rejected: each on a requirement the user confirmed; confirmed by the user
- [x] Known gaps and open child decisions: listed in *Decision*
- [ ] Documentation: updated where the rule takes effect; overstated requirements corrected; commit message proposed
- [x] Success criteria: carried over only as project rules (none: the benchmark replay is plan step 3)
- [ ] Out of scope: noted where open work is kept
- [x] Overview: choice, pros and cons, rejected, gaps, plan, files
- [ ] Review: in open chat; nothing implemented before it

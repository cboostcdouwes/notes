# Skill packaging

## Problem
The user's own skills (design-research, the planned problem-formulation, and later ones) live as separate folders
in `~/.claude/skills`, a git repo since 2026-10-29. Files that several skills need, such as the research-log format,
have no documented place, and the collection can't be handed to someone else as one unit. The skills must be
shareable as a whole, with files shared between them, without breaking how the user runs and develops them.

## Related decisions
- Blocks: `problem-understanding.md` (paused 2026-10-30: the shared log format's location; the user chose to settle
  packaging first).
- Affects: the benchmark harness (`benchmarks/harness/bench.py`, which points at the skill's path), the user's global
  `CLAUDE.md` ("Use the `design-research` skill ..."), `_global/TODO.md`.

## Known so far
Facts from the Claude Code docs (code.claude.com/docs/en/plugins-reference and /skills, read 2026-10-30):
- A plugin holds several skills under `skills/<name>/SKILL.md`, and shared files anywhere in the plugin, reached
  through `${CLAUDE_PLUGIN_ROOT}` in skill content ("resources shared between the plugin's skills").
- Plugin components are namespaced under the plugin's name (`<plugin>:<skill>`).
- Plugins install through a marketplace (a git repo or a local path); one added from a local path loads in place.
- `${CLAUDE_SKILL_DIR}` is the skill's own folder; outside a plugin there is no documented variable for shared files.
Not verified: whether skill frontmatter hooks (the round gate) work in plugin skills; whether a folder without
`SKILL.md` in `~/.claude/skills` is ignored.
Proposed in the parent's review (not chosen): a neutral folder `~/.claude/skills/research-log/` now, a plugin later.

## Success criteria
Judged by the user, to confirm in round 2: on another of the user's machines (Linux), one documented install step
gets every skill working, round gate included; on the user's machine, an edited skill is used after at most a
reload.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| K1 | The whole collection gets working on another of the user's machines, or a colleague's, in one install step | the stated wish; copying skill by skill drifts | user, round 1 (recipients: own machines, colleagues; "install in one step") | should | yes |
| K1w | Recipients receive later changes without redoing the install | not asked for now | user, round 1 (not picked) | won't (comes back when colleagues use it regularly) | yes |
| K2 | Files shared between skills (the log format) have one place every skill can reach | one-way dependency between skills; a third skill can use the format | user, review of `problem-understanding.md` | should | yes |
| K3 | An edit to a skill takes effect for the user after at most a reload, without a reinstall | the user develops the skills by running them | user, round 1 ("a reload is fine") | should | yes |
| K4 | The round gate (a skill-scoped hook) keeps working | it enforces the round checklist | `skill-rule-following.md` (decided) | should | no |
| K6 | Works on Linux; other platforms only when someone needs them, by changing the skills then | colleagues' platforms unknown | user, round 1 ("don't care for now") | won't (comes back when a colleague on another OS uses it) | yes |
| K7 | The hosting can move (the user's company account now, a company repo later) with at most one documented step per recipient | the user named a later move | inferred from user, round 1 | could | no |

## Options
Preliminary; no option search this round (framing only).
- O0: do nothing; share the git repo, cloned into the recipient's `~/.claude/skills`.
- O1: a plugin (`skills/` + shared files) installed from a marketplace.
- O2: a neutral shared folder inside `~/.claude/skills`, referenced by path.

## Open questions
1. Confirm the problem block (round 2), with K4 and K7.

## Round checklist
Checklist:
- [x] Log (first round): n/a: round 2
- [x] Problem and success criteria (first round): stated without solution words; criteria asked
- [x] Scope: unchanged
- [x] Requirements: K1, K3 verified; K1w, K6 won'ts; K7 new; K5 dropped (prefix fine)
- [x] Replaced requirements: n/a: first round
- [x] Written requirements: n/a: none written down
- [x] Deciding unverified requirements: asked this round (K4, K7)
- [x] Options: n/a: framing round (preliminary list only)
- [x] Searches: docs read for the stub (in *Known so far*); no option search, said in the report
- [x] Deciding claims: the docs facts are primary; two marked unverified
- [x] Matrix: n/a: framing round
- [x] Rejection records: n/a: no verdicts
- [x] Harms: n/a: no leader
- [x] Reversibility: n/a: no options weighed
- [x] Draft and stress test: n/a: no leader
- [x] Bias check: n/a: nothing to check before the problem is confirmed
- [x] Rejection check: n/a: no rejections
- [x] Ranking change: n/a
- [x] Report: framing and questions
- [x] Questions: deciding unverified ones first, through the question tool, remarks last
- [x] Pushback: n/a

## Rounds
1. Framing only (2026-10-30): who receives it, how the user develops, naming. No leader.
2. Answers recorded (own machines and colleagues, one-step install, reload fine, prefix fine, Linux only for now,
   company account then maybe a company repo); problem written back for confirmation. No options yet.

## Decision

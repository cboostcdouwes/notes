# Handoff: research:design work (2026-10-30)

State at the end of the session of 2026-10-30, for whoever resumes. Open work, most important first, is in
`../TODO.md` under *research:design skill*; this note says where things stand and what to read first.

## Where things are
- **The skill** is `research:design` (formerly `design-research`), in the plugin `research` of the marketplace
  `claude-skills`: repo `~/Cboost/claude-skills`, GitHub `cboostcdouwes/claude-skills`, commit `30dd58b`, pushed.
  Layout and install routes: the repo's `README.md`.
- **On this machine** the repo is registered as a local marketplace and `research@claude-skills` (0.1.0) is
  installed, read from the checkout: edits apply after `/reload-plugins` or in a new session. `~/.claude/skills`
  holds only `synced/` and `.trash/` now.
- **The round gate** runs from `${CLAUDE_PLUGIN_ROOT}/skills/design/scripts/round-gate.py`; its state moved to
  `~/.cache/research-design-gate`.
- **The global `CLAUDE.md`** names `research:design`; the benchmark harness (`benchmarks/harness/bench.py`) points
  `SKILL_DIR` at `~/Cboost/claude-skills/research/skills/design`.

## Decisions of this session
- `skill-packaging.md`: **Reviewed**. Local marketplace repo, one folder per plugin, shared files in
  `<plugin>/shared/` reached by `${CLAUDE_PLUGIN_ROOT}`, a `version` in `plugin.json` (colleagues update only when
  it is bumped). Plan steps 1-2 done.
- `problem-understanding.md`: **Draft, paused**. A separate `problem-formulation` skill that design runs first;
  reviewed amendments (no "what you own", strict use, one-way dependency, shared log format). Its draft is in
  `problem-understanding-draft/` next to this note (`problem-formulation/SKILL.md`, `design-research-changes.md`):
  it predates the packaging, so it still says "PENDING" for the log format's place (now `research/shared/`) and
  names `design-research` and its old paths (now `research/skills/design/`).

## Next steps
1. **Step 3 of skill-packaging**: install on a second machine or a clean `$HOME` with
   `claude plugin install research --marketplace cboostcdouwes/claude-skills`; check that `research:design` loads
   and the gate runs. Then step 5: ask what first use showed.
2. **Resume the problem-formulation split** (`problem-understanding.md`, plan step 1): new skill
   `research/skills/problem-formulation/`, the log format moved to `research/shared/log-template.md`, design's
   Phase 1-2 replaced by the hand-over. The plugin's skill would be `research:problem-formulation`; a shorter name
   (`research:problem`) was suggested in passing, not decided.
3. **Improve the skill from the skill-packaging miss**: the best option (a local marketplace) was in the round-3
   discovery report and lost at the merge. Hypotheses H1-H6 and replay targets:
   `benchmarks/skill-packaging/runs/2026-10-30-8bfbbb8/score.md`. Related TODO items: search for the vendor's
   recommended solution; show each option with its caveats; review objections reopen discovery.
4. **Confirm the skill-packaging benchmark draft** (`benchmarks/skill-packaging/README.md`): prompt, setup, rubric;
   the harness can't run it yet (multi-line prompt, starting file layout).

## Planned direction (not started)
- The skill will end with an overview of the leading options instead of forcing a decision, and will likely split
  into `explore` and `compare` skills with `design` as the orchestrator (user, 2026-10-30).

## Things to know
- The round gate finds research logs only by absolute paths in the session's tool calls, and treats a log whose
  *Decision* isn't "Reviewed" as open: the paused `problem-understanding.md` counts as open in any session that
  touches it. Write logs by absolute path.
- Don't also register the GitHub marketplace on this machine: `research` would load twice.
- `benchmarks/harness/__pycache__/bench.cpython-314.pyc` is tracked in the vault's git; it changes on every harness
  run (ignore it or untrack it).

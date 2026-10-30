# Handoff: research plugin work (2026-10-30, evening)

State at the end of the session of 2026-10-30, for whoever resumes. Open work, most important first, is in
`../TODO.md` under *research:design skill*; this note says where things stand and what to read first.

## Where things are
- **The plugin** `research` in the marketplace `claude-skills`: repo `~/Cboost/claude-skills`, GitHub
  `cboostcdouwes/claude-skills`, `main` at `1803c0b`, pushed. Two skills:
  - `research:problem-formulation` (`research/skills/problem-formulation/`): understands the problem with the user
    and ends with `Confirmed by the user: <date>` under *Problem*. Runs only when another skill calls it or the user
    asks to frame a problem.
  - `research:design` (`research/skills/design/`): runs problem-formulation first (Phase 1), then options, checks,
    rounds and the decision. Phase 2 is a stub pointing to the shared requirement rules.
  - `research/shared/`: `log-template.md` (where a log lives, the whole log and the rounds file; a skill writes only
    the sections it fills, no empty headings) and `requirements.md` (the full requirements definition).
  - Each skill has a README with a flowchart; the repo's `README.md` lists both.
- **Version** is still `0.1.0`: colleagues installing from GitHub don't get the split until it is bumped. Bump only
  when the user asks.
- **On this machine** the repo is a local marketplace and `research@claude-skills` is installed from the checkout:
  edits apply after `/reload-plugins` or in a new session.
- **Sizes** (estimated tokens of the SKILL.md body): design ~4,032 (was 4,724; the gate warns at 4,800),
  problem-formulation ~1,254.
- **The round gate** runs from `${CLAUDE_PLUGIN_ROOT}/skills/design/scripts/round-gate.py`, state in
  `~/.cache/research-design-gate`. It treats a log as open only once it has *Problem* and *Rounds*; this is why
  problem-formulation must not write an empty *Rounds* heading.
- **The benchmark harness** (`benchmarks/harness/bench.py`) points `SKILL_DIR` at
  `~/Cboost/claude-skills/research/skills/design`.

## Decisions of this session
- `skill-packaging.md`: **Reviewed**. Plan steps 1-2 done; step 3 (install on a clean `$HOME`) open.
- `problem-understanding.md`: **Reviewed**. Plan steps 1-2 done in three commits: `349b2f5` (the split),
  `56605cf` (success criteria removed), `1803c0b` (READMEs). Changes from the review, all recorded in its
  *Decision*: name `research:problem-formulation`; the whole log format and the full requirements definition in
  `research/shared/`; where-the-log-lives rules moved there; the user's proposed solution goes into *Options* as
  "not judged yet", not under *Problem*; *Success criteria* removed (who judges is obvious: the user after first
  use); the web is a reading source for facts about the situation.
- Plan step 3 (recumbent-rack benchmark replay, ~$8.50) waits until the user chooses to run it: don't propose it as
  the next step.

## Next steps
Pick by the user's choice; in TODO order:
1. **Check every skill's flow control** (TODO): problem-formulation's step 4 "go straight to step 6" skips the
   requirements inventory (step 5); fix it and the README edge, then check `research:design` the same way.
2. **Step 3 of skill-packaging**: install on a second machine or a clean `$HOME` with
   `claude plugin install research --marketplace cboostcdouwes/claude-skills`; check both skills load and the gate
   runs. Needs a version bump first if the install should include the split (user's call).
3. **Discovery options get lost at the merge** and **search for the vendor's recommended solution** (TODO):
   hypotheses H1-H6 in `benchmarks/skill-packaging/runs/2026-10-30-8bfbbb8/score.md`.
4. **Confirm the skill-packaging benchmark draft** (`benchmarks/skill-packaging/README.md`).

## Planned direction (not started)
- `research:design` ends with an overview of the leading options instead of forcing a decision, and likely splits
  into `explore` and `compare` skills with `design` as the orchestrator (user, 2026-10-30).

## Things to know
- `problem-understanding-draft/` next to this note is stale (the implemented skill differs); ask the user before
  removing it.
- The round gate finds research logs only by absolute paths in the session's tool calls. Write logs by absolute path.
- Don't also register the GitHub marketplace on this machine: `research` would load twice.
- `benchmarks/harness/__pycache__/bench.cpython-314.pyc` is tracked in the vault's git; it changes on every harness
  run (ignore it or untrack it).
- Render a README's flowchart to check it: `mmdc -i <README> -o <scratch>/README.md` for syntax, and the extracted
  block with `mmdc -i flow.mmd -o flow.png -s 2` to see the labels (`rsvg-convert` drops them).

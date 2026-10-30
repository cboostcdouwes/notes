# TODO

Topics outside any repo. Most important first.

## design-research skill

- **Package the skills as the `cboost-skills` marketplace** (`design-research/skill-packaging.md`, decision drafted
  2026-10-30: a local marketplace repo at `~/Cboost/cboost-skills`, plugin `research`). Next up after the review:
  plan step 1. It blocks the problem-formulation split.
- **Discovery options get lost at the merge** (skill-packaging run, 2026-10-30): the best option was in the round-3
  generator report and was folded into another option's costs; it surfaced only when the user asked. Hypotheses
  H1-H6 and replay targets in `design-research/benchmarks/skill-packaging/runs/2026-10-30-8bfbbb8/score.md`. Medium
  urgency: decide on a rule (every generator option a row, a named merge or a recorded drop) and giving the
  rejection check the generator reports.
- **Confirm the skill-packaging benchmark draft** (`design-research/benchmarks/skill-packaging/README.md`): prompt,
  setup (how the researcher sees a `~/.claude/skills` repo) and rubric are proposals. Low urgency.
- **Round gate finds logs only by absolute path, and paused logs stay open** (2026-10-30): a log written through a
  relative path in a script was invisible to the gate, which checked the paused `problem-understanding.md` instead.
  Low urgency.
- **Split problem formulation out of design-research** (`design-research/problem-understanding.md`, decision
  drafted, paused 2026-10-30 until packaging is decided). Then replay the recumbent-rack benchmark and check that the
  first question call comes before any option; add a hook only if the confirmation gets skipped.
- **Improve design-research from the recumbent-rack benchmark** (`design-research/benchmarks/recumbent-luggage-rack/`,
  replayed 2026-10-28: match, 0 of 3, leads in round 5 instead of 10): the replay targets in
  `runs/2026-10-28-c8c33da/score.md`. Most urgent: review objections handled as amendments with no round, checks or
  gate (six in a row); still never asks about the current setup, owned parts, time horizons or long-term values.
  Then replay it as `benchmarks/README.md` describes.
- ~~Put the skill under version control~~: done, `~/.claude/skills` is a git repo (commit `e2c7998`,
  2026-10-29); benchmark runs can name that commit.
- **Discovery didn't run** (model-side-discovery, installed 2026-10-25; checked on the 2026-10-28 benchmark run): no
  blind generator agents and no design-space map; the options came from the researcher's own web searches (20, $0.34
  via Haiku). The round checklist has no discovery item, so the gate can't catch the skip. Medium urgency: decide
  whether to add a checklist item, then watch the next run again and ask the user what it showed (the decision's
  plan step 2).
- **Drafts only partly work** (option-discovery, installed 2026-10-25; checked 2026-10-28): one evolving draft of the
  leader per round, named in the report; no runner-up drafted; the paper stress test missed the seat-bracket strut
  problem the user then raised. The leader did change within rounds (1-5), driven by answers. Watch again after the
  review-amendment fix.
- **Core size is at the limit**: SKILL.md is ~4,723 tokens by the gate's estimate, 77 under the 4,800 warning
  (checked 2026-10-28). Any addition, such as a discovery checklist item, needs a trim elsewhere. The other
  skill-and-log-size checks held: independent checks with extract files, all round and review entries in
  `<topic>.rounds.md`.
- **Fact-check the claims rejections rest on** (child of model-side discovery, open): one line in
  `checks/rejection.md`; caught a false fact in its first try. The 2026-10-28 run's false fact (the manual shows a
  Baron rack) held up the *leader*, not a rejection: consider checking the claims the leader rests on too. Low
  urgency.
- **Requirement relaxation in a check** (child of model-side discovery, open): one option per requirement that breaks
  or relaxes it, in the bias or requirement check (user, 2026-10-25). The 2026-10-28 run gave no evidence either way.
  Low urgency.
- **Edit research logs by heading, not by substring**: twice in the skill-and-log-size run an insert matched a
  backticked heading name inside a sentence and split it. Not seen on 2026-10-28 (the researcher wrote a Python edit
  script per round, replacing whole rows). Low urgency; consider a rule or a helper with step 3's section script.

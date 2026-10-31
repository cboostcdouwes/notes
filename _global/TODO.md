# TODO

Topics outside any repo. Most important first.

## research:design skill (formerly design-research)

Resume from `design-research/handoff.md` (2026-10-30).

- ~~Package the skills as the `claude-skills` marketplace~~: done 2026-10-30 (`~/Cboost/claude-skills`, plugin
  `research`, skill `research:design`; plan steps 1-2). Left: step 3, install on a second machine or a clean `$HOME`
  with `claude plugin install research --marketplace cboostcdouwes/claude-skills`.
- **Problem-formulation split** (`design-research/problem-understanding.md`, Reviewed 2026-10-30): step 1 committed
  (`349b2f5`); success criteria removed (`56605cf`); READMEs (`1803c0b`); pushed. Later, when the user chooses (not to be proposed as next): replay the
  recumbent-rack benchmark and check that the first
  question call comes before any option; add a hook only if the confirmation gets skipped.
- **Check every skill's flow control** (user, 2026-10-30): steps whose jumps, skips or loops say something other
  than the rules around them. Found while drawing problem-formulation's README flowchart: step 4's "go straight to
  step 6" skips step 5 (the requirements inventory), while the batching rule says the one call still holds the
  deciding requirements; fix: "straight to step 5 without questions, then 6", and the README's edge with it.
  Check `research:design` the same way (phase jumps, round loop, the decision's way back into a round), e.g. by
  drawing each skill's flow from its text alone and comparing it with its README. Medium urgency: a wrong jump
  skips a step silently. After the benchmark replay, so its result reflects the current text.
- **The skill-packaging benchmark can't run in the harness yet**: `bench.py setup` takes only the first line of the
  prompt quote, and the README has a *Files and repos at the start* section the setup doesn't recreate. Part of
  confirming the draft.
- **Discovery options get lost at the merge** and **the documented route** (`design-research/discovery-merge-losses.md`,
  decision drafted 2026-10-31, P3: a row per generator option by `add-candidates.py`, the documented-route category,
  rejection-check questions; draft in that session's scratchpad). Waiting for the review in open chat, then plan
  step 1 (install, one commit).
- **The Verdict column out of `shared/log-template.md`** (user, 2026-10-31, from `discovery-merge-losses.md`): verdicts
  stay in the rejection records and the Matrix. Low urgency; after the merge-loss change.
- **A problem-diagnosis section in problem-formulation** (user, 2026-10-31: "there could probably be a diagnoses
  section"; its meaning: diagnosing the problem's causes before options). Low urgency; ask what it holds first.
- **design-research ends with an overview of the leading options, not a forced decision** (user, 2026-10-30):
  the skill (now `research:design`) shows the leading options with their caveats and leaves the choice open.
  Likely split into `explore` and `compare` skills, with `design` as the orchestrator. Future work; research it as a
  design change of its own.
- **Each option shown to the user carries its caveats side by side** (user, 2026-10-30; the documented-route half is
  in `discovery-merge-losses.md`): goes to the explore / compare split, with all costs shown in the comparison (user,
  2026-10-31).
- **Confirm the skill-packaging benchmark draft** (`design-research/benchmarks/skill-packaging/README.md`): prompt,
  setup (how the researcher sees a `~/.claude/skills` repo) and rubric are proposals. Low urgency.
- **Round gate finds logs only by absolute path, and paused logs stay open** (2026-10-30): a log written through a
  relative path in a script was invisible to the gate, which checked the paused `problem-understanding.md` instead.
  Low urgency.
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

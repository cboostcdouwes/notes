# TODO

Topics outside any repo. Most important first.

## design-research skill

- **Watch the next design-research run** after the skill-and-log-size changes (all four steps done 2026-10-24): do
  the checks stay independent with the extract files, do round entries land in `<topic>.rounds.md`, does the core stay
  under the gate's 4,800-token warning. Optional: migrate `skill-rule-following.md` (80 KB) to the rounds-file layout.
- **Watch the next run for drafts** (option-discovery, installed 2026-10-25): is the leader (and a close runner-up)
  drafted and put through its real use each round, given to the user, and does an option change the leader in a
  round rather than at the review? That run is the only clean test of the change.
- **Model-side discovery** (`design-research/model-side-discovery.md`, open stub): the user, not the model, still
  finds the better options. No work expected now; maybe revisit in a couple of months.
- **Offset skill growth** (low): the core is ~4,420 of the 4,800-token warning; cut or merge rules that runs show
  aren't followed before adding more (bias check, option-discovery round 3).
- **Gate off after a session resume**: skill hooks are not re-registered when a session is resumed (spike,
  2026-10-24), so the gate and its size warning stay off until the skill is invoked again. Accepted as rare; revisit
  if a resumed run skips round-end steps.
- **Edit research logs by heading, not by substring**: twice in the skill-and-log-size run an insert matched a
  backticked heading name inside a sentence and split it. Low urgency; consider a rule or a helper with step 3's
  section script.
- **Later**: A12 (a SessionStart `compact` hook in a plugin's `hooks.json`, once the skill is a plugin, parent O20);
  B9 (the checks on a smaller model, with the parent's cost savers O22/O23).

# Skill packaging: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| K1w | Recipients receive later changes without redoing the install | not asked for then (won't) | user, round 1 | K1u (round 3: "marketplace too") |

## Dropped requirements
| # | Requirement | Why it isn't one (user's reason) | Source | Round |
|---|---|---|---|---|
| K7 | The hosting can move with at most one documented step per recipient | user: "doesn't matter" | inferred | 2 |
| K5 | The skills keep their names, or every place that names them changes with them | user: "prefix is fine" (update CLAUDE.md and the harness once) | inferred | 1 |

## Round 1
Split off from `problem-understanding.md` (review, 2026-10-30: the shared log format outside both skills; "is it
possible to organize the skills into a single directory, so that the whole collection of skills can be shared at
once?"; then "plugin first"). Framing only, as in the parent run: who receives the collection, how the user
develops, naming.

Searches: code.claude.com/docs/en/plugins-reference and /docs/en/skills (for the stub). No option search.

Answers: recipients own machines and colleagues; recipients only need a one-step install (not updates, local
changes or contributions); a reload after edits is fine, a reinstall not; the prefix is fine; platforms unknown,
Linux only for now ("change the skills if it has to be used on another OS"); hosting on the user's company account,
maybe a company repo later.

## Round 2
Write-back of the problem for confirmation, with K4 (round gate) and K7 (movable hosting). No options yet.
Answers: problem confirmed; round gate a could ("nice to keep working, optional for individual installations");
K7 dropped ("doesn't matter").
Gate finding: the round gate only sees logs named by absolute path in tool calls; this log was written through a
relative path in a script, so the gate checked the paused `problem-understanding.md` instead (still "open": its
*Decision* is a draft). Worked around by reading the log by absolute path. For `_global/TODO.md`.

## Round 3
Discovery: one generator (Claude Code mechanisms; dotfiles managers, extension packs, vendoring): skills-directory
plugin, marketplace in the same repo, `--plugin-dir` / `CLAUDE_CODE_PLUGIN_DIRS`, Stow-style links, `npx skills`,
build-step copies, template as a skill, shared plugin by `dependencies`. Docs facts by a claude-code-guide agent and
the researcher (create.md: *Make a plugin load in every session*).
Spikes: a plugin skill via `--plugin-dir` (shared file read, frontmatter hook ran with `CLAUDE_PLUGIN_ROOT`); then
in `~/.claude/skills` with temporary folders: skills-directory plugin loaded and worked; linked skill's
`${CLAUDE_SKILL_DIR}` is the link path; a folder without `SKILL.md` isn't listed. Folders removed.
Rejection check: O3's K1 ✓ contradicted "a script to keep" (now ~K1); O3's and O2's ~K2 rested on untested gaps
(spiked: now ✓); O4's version floor is a tie-break; O0/O2's ~K1 stretched (re-argued on the concrete failure:
cloning into a non-empty `~/.claude/skills`); leader's K4 not tested as a skills-directory plugin (now spiked); O5's ?
cells not reasons.
Bias check: K1/K3/K4 partly mechanism-worded (kept: the user's own words; K4's need is the enforced checklist);
O1b's cache copy breaks K3 for a recipient (K3 is the author's need; fine); private content in shared skills (none
found by grep); the repo root needn't move (variant: O9, or a link); missing options O9 (separate repo with
`--plugin-dir`), links inside each skill, inlining the format (≈ O6), design-research owning the format (fails K2's
"third skill" reason).
Ranking: leader O1a, runner-up O3 (~K1).

Searches: code.claude.com docs: plugins-reference, skills, plugins/create, plugins/loading (via agents), hooks.

## Round 4
Answers: name `research`; colleagues also get the marketplace command (K1u replaces K1w); no remarks. Leader O1a +
O1b; decision drafted for review.

## Round 5 (review objection)
User: "I'd like to use the repo as .claude/skills itself as I would possibly like to add multiple plugins. Would it
be possible to place the git marketplace one level deeper, with multiple plugins in the marketplace directory?"
New K8. Spike (temporary folders in `~/.claude/skills`, removed): a plugin at `zz-mkt/zz-nested/` was not listed by
`claude plugin list`; with `.claude-plugin/marketplace.json` at `~/.claude/skills` and a plugin `zz-top/`, `claude
plugin validate ~/.claude/skills` passed (warnings only) and `zz-top@skills-dir` loaded. Docs: a marketplace file
below the repo root needs `extraKnownMarketplaces` with `path`. Leader O10 (marketplace at the repo root, plugins as
direct children), runner-up O11 (the proposal).

Searches: code.claude.com/docs/en/plugins/marketplace-reference.md.
Rejection check: K8 cells missing for most rows; O9 ✓ everywhere though one plugin per repo (K8 ✗); O0/O2/O3 K8 ✓
stretched ("shared as one marketplace"; now ~); O11's ~K1 counted the dev machine (now only the colleague's
settings entry); O11's K3/K4 not spiked (now ?); renames and managed settings are the leader's costs too (moved into
O10's harms). Fixed.
Bias check: K8 named a mechanism (reworded as a need); K8 vs K2: shared files don't cross plugins on installed
copies (asked); plain skills in the repo aren't shared by the marketplace (kept out of K8); YAGNI: one plugin now is
O10 with one plugin; a separate marketplace repo (O9 generalised: fails K8's "same repo"); O10's reversibility is
costly (fixed); stale "not verified" in *Known so far* (fixed).

## Round 6
Answers: shared files within a plugin is fine (K2 scoped); marketplace name `cboost-skills`; no remarks. No new
requirement, no ranking change: decision redrafted for O10.

## Round 7 (review question)
User: "Why is the local marketplace option that you mentioned, with a git repo as the marketplace root not better?"
Correction: O11's dev-machine install steps were charged to K1, which covers other machines only. O12 (the repo is
the marketplace folder, registered locally on the dev machine) ties O10 on K1, K1u, K2, K3, K8; separated only by
tie-breaks (O12: one install route everywhere, no double-load, clean skills folder; O10: no dev install, repo stays
`~/.claude/skills`, no `.git` move). Asked whether "the repo is `~/.claude/skills` itself" is a need. Spike of O12's
K3/K4 pending.
User (2026-10-30): "A local marketplace seems the obvious recommended solution, record that it didn't come up during
search and make hypotheses why, this will have to be improved later. This might be a good benchmark, record the
current ground truth into a draft benchmark. I would place the local marketplace in `Cboost/cboost-skills`."
Correction recorded: it did come up in search (round 3 generator, option 3) and was lost at the merge into O1b.
Hypotheses H1-H6 and replay targets: `benchmarks/skill-packaging/runs/2026-10-30-8bfbbb8/score.md`. Benchmark draft:
`benchmarks/skill-packaging/README.md`. Decision redrafted for O12.

## After the review (2026-10-30)
Plan step 1 committed by the user (`4816b25`). The GitHub repo already existed as `cboostcdouwes/claude-skills`
(origin set by the user); the local folder moved from `~/Cboost/cboost-skills` to `~/Cboost/claude-skills`, the
local marketplace was removed and re-added from the new path, `research@cboost-skills` reinstalled (0.1.0, read
from the checkout).
Then the marketplace was renamed `claude-skills` (user); re-registered, `research@claude-skills` installed.

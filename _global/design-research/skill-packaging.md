# Skill packaging

## Problem
Confirmed by the user: 2026-10-30

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
Settled since by spikes (round 3, see *Sources*): frontmatter hooks run in plugin skills; a folder without
`SKILL.md` isn't listed as a skill.
Proposed in the parent's review (not chosen): a neutral folder `~/.claude/skills/research-log/` now, a plugin later.

## Success criteria
Judged by the user (confirmed round 2): on another of the user's machines (Linux), one documented install step gets
every skill working; on the user's machine, an edited skill is used after at most a reload. The round gate working
there too is a plus (K4, could).

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| K1 | The whole collection gets working on another of the user's machines, or a colleague's, in one install step | the stated wish; copying skill by skill drifts | user, round 1 (recipients: own machines, colleagues; "install in one step") | should | yes |
| K1u | Colleagues can receive later changes without redoing the install | the user wants the marketplace route for colleagues (round 3) | user, round 3 ("marketplace too"); replaces K1w (won't, round 1) | should | yes |
| K2 | Files shared between skills of one plugin (the log format) have one place every skill of that plugin can reach | one-way dependency between skills; a third skill can use the format; across plugins not needed (user, round 5) | user, review of `problem-understanding.md` | should | yes |
| K3 | An edit to a skill takes effect for the user after at most a reload, without a reinstall | the user develops the skills by running them | user, round 1 ("a reload is fine") | should | yes |
| K8 | More skill groups can be added later and each shared on its own, from the same repo, without restructuring it | the user plans more plugins (review, round 5); reworded as a need (bias check, round 5); "the repo is `~/.claude/skills`" was a means, not a need (user chose `~/Cboost/cboost-skills`, round 7) | user, review of the draft decision (2026-10-30) | should | yes |
| K4 | The round gate (a skill-scoped hook) keeps working, on the user's machines at least | it enforces the round checklist; optional for other installs | user, round 2 ("a could ... optional for individual installations") | could | yes |
| K6 | Works on Linux; other platforms only when someone needs them, by changing the skills then | colleagues' platforms unknown | user, round 1 ("don't care for now") | won't (comes back when a colleague on another OS uses it) | yes |

## Options
Discovery: one generator (Claude Code mechanisms; dotfiles managers, extension packs, vendoring). Map axes:
**how it reaches a machine** (clone the whole skills folder / clone one folder that loads as a plugin / marketplace
install / install script with links / environment variable / third-party installer) and **how shared files are
reached** (plugin root variable / relative path / copied into each skill / a skill of its own). Empty cell with
sense: none found.

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O0 | Do nothing: share the repo; recipients clone it as their `~/.claude/skills` | no change | replaces the recipient's own skills folder; no documented place for shared files | cheap | trailing (K2; ~K1) |
| O1a | Skills-directory plugin: the repo becomes `~/.claude/skills/<name>/` with `.claude-plugin/plugin.json`, `skills/`, `shared/`; install = `git clone` into `~/.claude/skills/<name>` | K1, K2, K3, K4 (spike) | skills renamed `<name>:<skill>`; repo root moves; references outside the repo change once; managed settings can block skills-dir plugins | costly (renames, habits) | trailing (K8), round 5 |
| O1b | O1a plus a `marketplace.json` at the root (`source: "./"`); colleagues install with `claude plugin install <name> --marketplace <repo>` and get updates | as O1a; K1u (updates) | a second install route; copies to a cache; don't add the marketplace on the dev machine, where the skills-directory copy already loads | cheap (add or drop later) | part of O10 |
| O2 | A neutral folder `~/.claude/skills/research-log/` (no `SKILL.md`), reached by `${CLAUDE_SKILL_DIR}/../research-log/`; share by cloning the whole skills folder | no rename | whether a folder without `SKILL.md` is ignored is undocumented; same clone problem as O0 | cheap | trailing (~K1) |
| O3 | Install script with links (GNU Stow style): the repo anywhere, each skill linked into `~/.claude/skills`, `shared/` beside them | names kept; live edits | a script to keep; whether `${CLAUDE_SKILL_DIR}` resolves to the link or its target is undocumented | cheap | runner-up (~K1) |
| O4 | Load the repo as a plugin through `CLAUDE_CODE_PLUGIN_DIRS` in the shell profile | K2, K3, K4 | two steps per machine (clone, profile line); Claude Code v2.1.280+ | cheap | trailing (~K1) |
| O5 | Third-party installer (`npx skills add`) | one command | handles per-skill folders only, needs node; official repo not found | cheap | trailing (K2) |
| O6 | Build step copies the shared template into each skill (`make sync`) | works with any route | duplicate files in git, drift check, a step after each template edit | cheap | trailing (~K1, ~K2, ~K3) |
| O7 | The log format as a skill of its own, loaded by the others | no paths at all | one more listed skill; still needs a distribution route | cheap | trailing (~K1; with O1a no gain: tie-break) |
| O9 | The plugin in a repo outside `~/.claude/skills`, loaded with `--plugin-dir` (an alias) while developing; recipients install through a marketplace (bias check, round 3) | `~/.claude/skills` untouched | two install routes; a flag or alias per dev session; renames as O1a | cheap | trailing (tie-break: no cell gained) |
| O10 | The repo stays `~/.claude/skills`; `.claude-plugin/marketplace.json` at its root lists the plugins, each an immediate subfolder (`research/`, later more), each with its own `.claude-plugin/plugin.json`, `skills/`, `shared/`. Dev machine: they load as skills-directory plugins, no install. Colleagues and other machines: `claude plugin install research --marketplace <repo>` | K1, K1u, K2, K3, K4, K8 (spike round 5); no repo-root move | a `.claude-plugin/` folder in `~/.claude/skills` itself (spike: validates, nothing else changes); other machines get copies (edits only on the dev machine) | costly (renames, habits; no repo-root move) | runner-up (round 7) |
| O11 | User's proposal (round 5): the marketplace one level deeper (`~/.claude/skills/<marketplace>/`), plugins inside it | K2, K8 | plugins two levels down don't load as skills-directory plugins (spike); the dev machine registers the folder as a local marketplace and installs each plugin; colleagues must declare the marketplace with `path` in settings, as `marketplace add` has no option for a file elsewhere (docs) | cheap | runner-up (~K1) |
| O12 | The git repo is the marketplace folder (`~/.claude/skills/cboost-skills/` or anywhere), `marketplace.json` at its root; the dev machine registers it as a local marketplace once and installs each plugin (loaded in place, docs); colleagues: one command (review, round 7) | K1, K1u, K2, K3 (docs), K8; same install route and ids on every machine; no double-load; no `.claude-plugin/` in `~/.claude/skills` | one install per plugin on the dev machine (no requirement covers it); the repo root moves into the marketplace folder; K3, K4 not spiked | costly (renames, repo move) | chosen by the user (round 7), at `~/Cboost/cboost-skills` |
| O8 | Shared files in a separate plugin, linked by `dependencies` | K1 | copied plugins can't read across plugins (generator, from the docs); two plugins | cheap | trailing (K2) |

## Matrix
Round 5: redone with K8 for every row (rejection check).

| Option | K1 | K2 | K3 | K4 | K8 | ✗ or ~ |
|---|---|---|---|---|---|---|
| *priority, verified* | should, yes | should, yes | should, yes | could, yes | should, yes | |
| O10 (leader) | ✓ | ✓ | ✓ | ✓ | ✓ | (✓ K1u) |
| O11 | ~ | ✓ | ? | ? | ✓ | ~ K1 (? K3 K4: local-marketplace install in place, not spiked) |
| O1a + O1b | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ K8 |
| O0 | ~ | ✗ | ✓ | ✓ | ~ | ✗ K2, ~ K1 K8 |
| O2 | ~ | ✓ | ✓ | ✓ | ~ | ~ K1 K8 |
| O3 | ~ | ✓ | ✓ | ✓ | ~ | ~ K1 K8 |
| O4 | ~ | ✓ | ✓ | ✓ | ✗ | ✗ K8, ~ K1 |
| O5 | ✓ | ✗ | ? | ? | ~ | ✗ K2, ~ K8 |
| O6 + O0 | ~ | ~ | ~ | ✓ | ~ | ~ K1 K2 K3 K8 |
| O7 + O0 | ~ | ✓ | ✓ | ✓ | ~ | ~ K1 K8 |
| O8 | ✓ | ✗ | ✓ | ? | ✓ | ✗ K2 |
| O9 | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ K8 |

K8 ~ for O0, O2, O3, O5, O6, O7: more groups fit in the repo, but it is shared all or nothing, not each group on its
own. K2 ✓ for O10 holds within a plugin only: a skill in another plugin can't read `research/shared/` on a machine
that installed copies (asked, round 5).

## Evaluation
### Rejection records
- **O1a + O1b** (leader until round 5) trails on K8 (✗: the repo is the plugin, so a second plugin needs a second
  repo). Best variant: O10, which keeps its plugin layout one folder down. Leader ✓.
- **O11** (runner-up, the user's proposal) trails on ~K1: a plugin two levels below `~/.claude/skills` doesn't load
  colleagues can't use `claude plugin install <name> --marketplace <repo>` (or `marketplace add`) for a marketplace
  file below the repo root: they write an `extraKnownMarketplaces` entry with `path` first (docs). O10's colleague
  route is that one command. On the dev machine the nested plugins don't load as skills-directory plugins (spike):
  a local-marketplace install, which the docs say loads in place (K3, K4 unverified for it). Its gain, no
  `.claude-plugin/` at the repo root, is covered by no requirement: tie-break only. Variant: a root
  `marketplace.json` pointing at `./<marketplace>/research`, which is O10 with one more folder level.
- **O0** trails on K2 (✗: no place for shared files beside the skills) and ~K1: cloning the repo as
  `~/.claude/skills` fails when that folder already exists and isn't empty (scenario: claude.ai skill sync creates
  `~/.claude/skills/synced/`, as on this machine), so the install needs a clone elsewhere plus a move or links.
  Best variant: O2. Leader: ✓ on both.
- **O2** trails on ~K1 (as O0). K2 ✓ after the spike: a folder without `SKILL.md` is not listed as a skill. Best
  variant: O7 + O0. Leader ✓.
- **O3** (runner-up) trails on ~K1: a clone plus an install script (two steps), and the script to keep. K2 ✓ after
  the spike: a linked skill's `${CLAUDE_SKILL_DIR}` is the link's path, so `${CLAUDE_SKILL_DIR}/../shared/` works when
  the script links `shared/` too. Keeps plain names, but K5 was dropped (round 1): no gain. Wins if the plugin form
  fails in use on a dev machine where managed settings block skills-directory plugins (colleagues use the
  marketplace in either case).
- **O4** trails on ~K1: a clone plus a profile or settings line per machine. Its version floor (v2.1.280+) is
  covered by no requirement: tie-break only. Same renames as the leader.
- **O9** trails on K8 (✗: its repo is one plugin); two install routes and a flag per dev session are tie-breaks.
- **O4** also trails on K8 (✗: one plugin per repo).
- **O5** trails on K2 (✗: per-skill folders only); K3, K4 unverified (not counted).
- **O6** (with O0) trails on ~K2 (copies, not one place), ~K3 (a sync step after a template edit), ~K1 (O0's route).
- **O7** (with O0) trails on ~K1 (O0's route). With the leader it adds nothing `shared/` doesn't: tie-break only
  (one more listed skill).
- **O8** trails on K2 (✗: plugins copied to the cache can't read across plugins).
- **O1b** joins the leader (round 4): K1u. Without it, O1a gives updates only by `git pull` (~K1u); so do O3, O4 (~K1u).

### Miss (round 7)
The local marketplace (O12) was in the discovery agent's report in round 3 (its option 3) and was folded into O1b's
costs instead of becoming a row; it became an option only when the user asked about it in review. Hypotheses and
replay targets: `benchmarks/skill-packaging/runs/2026-10-30-8bfbbb8/score.md`.

### Harms (leader O12, round 7)
- Renames to `research:<skill>`, as every plugin option.
- One install per plugin on the dev machine; a new plugin isn't live until installed there.
- The repo moves out of `~/.claude/skills`: done by cloning (history kept); the old repo's `.git` and
  `design-research/` are removed afterwards by the user.
- K3 and K4 for a locally installed plugin come from the docs and the skills-directory spikes; checked in step 1.

### Harms (O10, round 5)
- Renames: every skill becomes `research:<skill>`; the global `CLAUDE.md`, the harness and the gate's fallback path
  change once (as O1a).
- Managed settings can block skills-directory plugins on a dev machine (docs); the marketplace route is unaffected.
- Shared files reach only skills in the same plugin on machines that install copies.
- A `.claude-plugin/` folder in `~/.claude/skills` itself: spike shows it validates and changes nothing else; a
  future Claude Code could read it differently (watch).
- Other machines and colleagues get copies from the marketplace: edits happen only on the dev machine (fits K3,
  which is the author's).
- Don't register the marketplace on the dev machine: the plugin would load twice under one name.
- The marketplace's name must not be a reserved one (`skills-dir`, `synced`, ...).

### Harms (O1a, before round 5)
- Renames: every skill becomes `<name>:<skill>`. The global `CLAUDE.md` rule, the benchmark harness (path and
  fingerprint), the gate's fallback path and the README change once; old logs keep old paths as history.
- The git repo root moves from `~/.claude/skills` to `~/.claude/skills/<name>/`; done wrong, history or the
  ignored `synced/` folder (managed by claude.ai) gets mixed in.
- Managed settings can block skills-directory plugins on a colleague's machine; it then fails silently (docs).
  Fallback: O4 or O3.
- A `SKILL.md` at the plugin root would load as a personal skill; the layout must not have one.
- During the move, old personal skills and plugin skills coexist under two names; delete the old ones after the
  check.

### Reversibility
O1a is costly, not one-way: the renames and the moved repo root touch several files and the user's habits, but
moving back is the same work. The others are cheap.

### Stress test (draft)
Draft: `/tmp/claude-1000/-home-cboost/76ebbb88-d3c5-419b-b4bf-bef888a47416/scratchpad/draft-packaging/layout.md`.
Spike (`scratchpad/spike-plugin/`, with `--plugin-dir`): a plugin skill read `${CLAUDE_PLUGIN_ROOT}/shared/template.md`
(substituted); its frontmatter `PreToolUse` hook ran, with `CLAUDE_PLUGIN_ROOT` set and `CLAUDE_SKILL_DIR` unset. Round 3 spikes
in `~/.claude/skills` (temporary `zz-spike-*` folders, removed after): a skills-directory plugin listed by `claude
plugin list` as `zz-spike-plugin@skills-dir`, loaded; its skill read the shared file and its hook ran with
`CLAUDE_PLUGIN_ROOT` = the plugin folder. A linked skill folder: `${CLAUDE_SKILL_DIR}` = the link's path. A folder
without `SKILL.md`: not listed as a skill, no error seen. `/reload-plugins` after an edit: docs only (K3).
Why the user might reject it in use: typing `/<name>:design-research`; a colleague's machine that blocks
skills-directory plugins.

## Open questions
None deciding. K3 and K4 for a locally installed plugin: checked in plan step 1.

## Sources
| Claim | Source (URL or `file:line`) | Date | Reliability |
|---|---|---|---|
| A folder in `~/.claude/skills` with `.claude-plugin/plugin.json` loads as a plugin every session; skills under `skills/` get the prefix; edits apply on `/reload-plugins` | code.claude.com/docs/en/plugins/create.md (*Make a plugin load in every session*); loading.md (in place) | 2026-10-30 | primary, two pages |
| `${CLAUDE_PLUGIN_ROOT}` substituted in plugin skill content | docs/en/skills.md; spike | 2026-10-30 | primary + spike |
| Frontmatter hooks run in plugin skills; hook env has `CLAUDE_PLUGIN_ROOT`, not `CLAUDE_SKILL_DIR` | spikes (`--plugin-dir`, and a real skills-directory plugin) | 2026-10-30 | two spikes |
| A linked skill folder's `${CLAUDE_SKILL_DIR}` is the link's path | spike | 2026-10-30 | spike |
| A folder without `SKILL.md` in `~/.claude/skills` isn't listed as a skill | spike | 2026-10-30 | spike (one run) |
| The skills hold no personal paths or private content | `grep` over `~/.claude/skills` (no matches) | 2026-10-30 | checked |
| A plugin two levels below `~/.claude/skills` doesn't load as a skills-directory plugin; a `.claude-plugin/marketplace.json` at `~/.claude/skills` validates and its direct-child plugin still loads | spike round 5 (temporary `zz-*` folders, removed) | 2026-10-30 | spike |
| A marketplace file elsewhere than `<repo>/.claude-plugin/marketplace.json` needs `extraKnownMarketplaces` with `path`; `marketplace add` has no option for it | docs/en/plugins/marketplace-reference.md (*Marketplace file*) | 2026-10-30 | primary |
| Marketplace plugins are copied to a cache; files outside the plugin aren't | docs/en/plugins/loading.md (via the generator) | 2026-10-30 | primary via generator |

## Round checklist
Checklist:
- [x] Log (first round): n/a: round 5
- [x] Problem and success criteria (first round): n/a: confirmed round 2
- [x] Scope: unchanged
- [x] Requirements: K8 new (user, review)
- [x] Replaced requirements: n/a: none
- [x] Written requirements: n/a: none
- [x] Deciding unverified requirements: none left
- [x] Options: O10, O11 (user's proposal); docs and spike
- [x] Searches: recorded in the round's entry
- [x] Deciding claims: cross-checked (two docs pages, spike) or marked unverified
- [x] Matrix: updated
- [x] Rejection records: one per trailing option
- [x] Harms: scenarios for the leading option
- [x] Reversibility: every option rated; O1a costly, not one-way
- [x] Draft and stress test: layout draft and spike; paths in the report
- [x] Bias check: findings in the log and the report
- [x] Rejection check: findings in the log and the report; verdicts corrected
- [x] Ranking change: recorded
- [x] Report: what changed, recommendation, runner-up, must rejections, the checks' findings
- [x] Questions: ordered by ranking impact, through the question tool, remarks last
- [x] Pushback: n/a

## Rounds
1. Framing only (2026-10-30): who receives it, how the user develops, naming. No leader.
2. Answers recorded (own machines and colleagues, one-step install, reload fine, prefix fine, Linux only for now,
   company account then maybe a company repo); problem written back for confirmation. No options yet.
3. Problem confirmed; K4 could; K7 dropped. Discovery, spike; leader O1a (skills-directory plugin), runner-up O3.
   Checks: spikes settled K2 for O2/O3 and K4 for O1a; O0/O2 ~K1 rests on a non-empty skills folder; O9 added.
4. Answers: name `research`; marketplace too (K1u replaces K1w): leader O1a + O1b. Decision drafted.
5. Review: several plugins in one repo (K8). Spike: nested plugins don't auto-load; a root marketplace in
   `~/.claude/skills` works. Leader O10 (repo stays `~/.claude/skills`), runner-up O11 (user's proposal).
6. Answers: shared files within a plugin (K2 scoped); marketplace `cboost-skills`. No ranking change; decision
   redrafted.
7. Review: O12 (local marketplace) added; it was in round 3's discovery report and lost at the merge. User
   chose it, at `~/Cboost/cboost-skills`. Decision redrafted; benchmark draft recorded.

## Decision
Reviewed (2026-10-30: the user agreed with the choice, Why, Rejected and the plan)

**Choice (O12).** A git repo at `~/Cboost/claude-skills` is the marketplace `claude-skills` (renamed from `cboost-skills`, 2026-10-30):
`.claude-plugin/marketplace.json` at its root lists each plugin by relative path. The first plugin is `research/`
(`.claude-plugin/plugin.json`, `skills/design-research/`, later `skills/problem-formulation/`, `shared/`, README).
The user's machine registers the folder once as a local marketplace (`claude plugin marketplace add
~/Cboost/claude-skills`) and installs each plugin (`claude plugin install research@claude-skills`); it loads in
place, edits apply after `/reload-plugins`. Colleagues and other machines: `claude plugin install research
--marketplace <repo>`, with updates. Shared files: `${CLAUDE_PLUGIN_ROOT}/shared/...`, within a plugin. Round gate:
`${CLAUDE_PLUGIN_ROOT}/skills/design-research/scripts/round-gate.py`. `~/.claude/skills` keeps only plain skills
and `synced/`.

**Why.**
- K1 (should, verified): one command per colleague or machine.
- K1u (should, verified): updates through the marketplace.
- K2 (should, verified; within a plugin): `shared/` reached by `${CLAUDE_PLUGIN_ROOT}` (docs, spikes).
- K3 (should, verified): a locally added marketplace loads in place, `/reload-plugins` (docs; checked in step 1).
- K4 (could, verified): frontmatter hooks run in plugin skills (spikes; checked again in step 1).
- K8 (should, verified): a new skill group is one more folder and marketplace entry.
- Tie-breaks over O10 (user's choice, round 7): the same install route and plugin ids on every machine; nothing
  loads twice; no `.claude-plugin/` in `~/.claude/skills`; the repo sits with the user's other repos.

**Rejected.**
- O10, the marketplace at the root of `~/.claude/skills` (runner-up): equal on requirements; loses the tie-breaks
  above. Wins only if a dev install step per plugin becomes a burden.
- O11, the marketplace one folder below the repo root: colleagues need a settings entry with `path` first (docs).
- O1a + O1b, the repo as one plugin: one plugin per repo (K8).
- O3, links by an install script: two steps, no updates, shared all or nothing.
- O0, O2, O4-O9: see *Evaluation*.

**Known gaps.**
- `version` set in `plugin.json` (user, after step 1): colleagues get an update only when the version is bumped.
- K3 and K4 for a locally installed plugin: docs and related spikes; step 1 checks them.
- Managed settings at Cboost could restrict marketplaces (unknown).

**Open child decisions.** None split off. `problem-understanding.md` resumes after step 1, inside `research/`.

**Plan.**
1. `refactor!: package design-research as the research plugin in the cboost-skills marketplace`, in a new clone
   `git clone ~/.claude/skills ~/Cboost/claude-skills` (history kept): `design-research/` →
   `research/skills/design-research/`; `research/.claude-plugin/plugin.json`; `.claude-plugin/marketplace.json`; the
   hook and the gate's fallback path use `${CLAUDE_PLUGIN_ROOT}`; a README with both install routes. Then register
   and install locally; check `claude plugin validate`, `claude plugin list` (`research@claude-skills` loaded), an
   edit applied by `/reload-plugins`, and a design-research question call passing the gate. The user then removes
   `~/.claude/skills/design-research` and `~/.claude/skills/.git`.
   Done 2026-10-30 (uncommitted, for the user): validate passes (warning: no `version`, on purpose); `claude plugin
   list` shows `research@claude-skills`, read from the checkout; a skill added after the install loaded in a new
   session (in place); the hook saw `CLAUDE_PLUGIN_ROOT` = `~/Cboost/claude-skills/research` and the gate's path; the
   gate script runs from its new place. Not checked: `/reload-plugins` inside a running session.
   Changed after step 1 at the user's request (2026-10-30): `plugin.json` gets `"version": "0.1.0"` (colleagues get
   updates only when it is bumped; replaces "`version` left out"); the skill is renamed `design` (`research:design`);
   `.gitignore` keeps only `__pycache__`.
   The repo already existed on GitHub as `cboostcdouwes/claude-skills`; the local folder was renamed to
   `~/Cboost/claude-skills` and the local marketplace re-registered from it (2026-10-30). The marketplace was then
   renamed `claude-skills` too (user); the plugin id is `research@claude-skills`.
2. Outside the repo (no commit): the global `CLAUDE.md` rule (`research:design`), the benchmark harness
   path and fingerprint, `_global/TODO.md`.
   Done 2026-10-30: the global `CLAUDE.md` rule names `research:design`; `bench.py`'s `SKILL_DIR` points at
   `~/Cboost/claude-skills/research/skills/design` (fingerprint, last change and round gate follow it); the
   benchmarks README and `_global/TODO.md` name the new skill.
3. Push to the user's company account; install on a second machine or a clean `$HOME` with the marketplace command.
4. Resume `problem-understanding.md` at its plan step 1, with the log format in `research/shared/`.
5. After first use: ask what it showed; amend or reopen.

Decision checklist:
- [x] Stop condition: round 7 brought no new requirement; the ranking change came from the user's choice between equals
- [x] Why and Rejected: each on a requirement the user confirmed; confirmed by the user (2026-10-30)
- [x] Known gaps and open child decisions: listed in *Decision*
- [ ] Documentation: updated where the rule takes effect (plan steps 1-2); commit message proposed in step 1
- [x] Success criteria: carried over only as project rules (none; step 3 checks them)
- [x] Out of scope: noted where open work is kept (`_global/TODO.md`, the benchmark draft)
- [x] Overview: choice, pros and cons, rejected, gaps, plan, files
- [x] Review: in open chat (2026-10-30); nothing implemented before it

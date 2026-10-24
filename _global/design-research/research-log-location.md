# Research log location

## Problem
The user's personal, per-repo notes (research logs and their child tree, `TODO.md`, other working notes and scratch
files) need a place that the user can open and edit easily, that a later Claude session can find again, that never
ends up in the repo's history, and that works in every repo without each repo needing its own setup first.
(Widened in round 2 from "research logs only": the user chose to decide all personal notes together.)

## Related decisions
- None split off yet. Possible child: whether the project `CLAUDE.md` and `.claude/` (also per-repo and ignored)
  follow the notes; Claude Code only reads them from fixed places.

## Success criteria
- Not testable as a number. Judged by the user: in a fresh repo, the skill starts a log without any manual setup, and
  the user can find and open it from their editor.
- Testable: a later session resumes an existing log (finds it by *Problem*), and `git status` never shows the log as
  an untracked or staged file.

## Requirements
| # | Requirement | Source | Status |
|---|---|---|---|
| R1 | The log is easy for the user to open and edit; VS Code or Obsidian both fine | user, round 1 ("Either") | preference (doesn't separate B from E) |
| R2 | No gitignored folder has to be set up in every repo | user, chat before round 1 (concern) | unverified: is it the setup step, the clutter, or the risk of forgetting? |
| R3 | Personal notes are never committed to a repo: private or half-baked content in shared company history is hard to undo once pushed | user, round 3 ("real harm") | core (confirmed by the user, 2026-10-23) |
| R15 | `CLAUDE.md` may be a shared, committed project file in other repos; personal project instructions must not depend on it being ignored | user, round 3 | unverified (stated; follows from R3) |
| R16 | One-time setup per machine in the Claude settings (hook + vault access) is acceptable; nothing per repo | user, round 3 | preference |
| R3b | Others see research only as a summary in the design doc | skill text (Claude-written) | unverified |
| R4 | A later session can find the log to resume it, and follow parent/child links | inferred; user, round 6 ("nice to have; the user can say so when earlier research is missing") | preference |
| R5 | Works in every repo, including ones without setup (about 18 git repos under `~/Cboost`, many nested or throwaway test clones; only this one has `local-notes/`; the rest fall back to the session-only scratchpad and lose the log) | inferred; checked on disk; user, round 6: real projects only | preference (real projects only) |
| R10 | Unfinished work (open research, `TODO.md`) outlives the clone: re-cloning, a worktree or `git clean -fdx` (which deletes ignored files) must not lose it; finished research may go | user, round 1 ("depends on the log"); round 2: these events happen rarely or never | preference (a real but rare risk) |
| R11 | Covers all personal notes, not only research logs (`TODO.md`, working notes, `tmp/`, `test-refactor-tools/`) | user, round 1 | preference |
| R12 | Some notes may need to sit next to the code (scripts or scratch files used with repo-relative paths, e.g. `local-notes/tmp/`) | inferred from the folder's contents; user "not sure", round 2 | unverified; evidence against: `tmp/` is empty, both tools take their paths as arguments (`reword <module dir>`, `mutation-diff.py old new`); only `test-refactor.md` cites them by repo-relative path |
| R13 | A repo maps to its notes folder by repo name; clones of one repo share notes (including `TODO.md`) | user, rounds 2 and 3 | preference |
| R14 | The central notes folder is the Obsidian vault `~/Cboost/Notes` | user, round 2 | preference |
| R6 | Logs survive accidental deletion / have history | inferred | open |
| R7 | Notes follow the user to other machines | user, round 1 ("several machines, no sync") | rejected: other machines exist, notes stay per machine; new machines are rare and per-machine setup is a small fix (round 6) |
| R8 | Topics that belong to no single repo (like this one) have a home: in the vault, e.g. `~/Cboost/Notes/_global/` | user, round 6 | preference |
| R9 | Answers to rounds are given in the chat, not as doc comments | user, chat before round 1 | preference (independent of storage) |

## Options
| Option | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| A | Status quo: `local-notes/` per repo, ignored by a self-ignoring root `.gitignore`; scratchpad fallback | R1, R3, R4 | R2 fails, R5 fails (fallback loses logs) | cheap | weighed out |
| B | `local-notes/` per repo, ignored once per machine in the global excludes file (`~/.config/git/ignore`); folder created on demand | R1, R2, R3, R4, R5 | R7: needs the same line on each machine; a machine without it risks a `git add -A` commit (guard: skill runs `git check-ignore` before writing); R6 not met | cheap | leading |
| C | `local-notes/` per repo, ignored via `.git/info/exclude`, which the skill appends to on first use | R1, R3, R4, R5 (automated) | Still a per-repo step, though automated; invisible to the user; lost on re-clone | cheap | weighed out (B does the same with no per-repo step) |
| D | Inside `.git/` (e.g. `.git/design-research/`): never tracked, no ignore needed | R2, R3, R5 | R1 fails: VS Code hides `.git/` by default; lost on re-clone; awkward to find | cheap | weighed out |
| E | One central notes folder outside all repos, per repo a subfolder, e.g. `~/Cboost/Notes/<repo>/design-research/` (the existing Obsidian vault) | R2, R3 (can't be committed at all), R5, R8; readable in Obsidian | R1 only if the vault is added to the VS Code workspace; R4 needs a stable repo→folder key; R6/R7 only with sync | cheap | runner-up |
| F | Claude's per-project folder `~/.claude/projects/<path-key>/research/` | R2, R3, R4, R5 | R1 fails (hidden, path-mangled names); R8 fails | cheap | weighed out |
| G | `~/.claude/design-research/<repo>/` (same pattern as Claude Code's own `~/.claude/plans`) | R2, R3, R4, R5, R8 | R1 weak (hidden folder); R6/R7 no | cheap | weighed out (E is the same, but visible) |
| H | Separate git repo for notes (e.g. make `~/Cboost/Notes` a git repo), structured like E | R2, R3, R5, R6, R7 (push to a remote), R8 | Commits for notes; a remote to choose (a company one: who can read it?) | cheap | candidate (E + history) |
| I | `clank` (MIT, github.com/mighdoll/clank): agent files in an overlay repo, symlinked into projects | R1 (files appear in the repo), R6, R7 | Symlinks still need ignoring (it uses `.git/info/exclude`); no native Windows; 1-star project, no releases; extra tool | costly (tool + habit) | weighed out |
| J | `repoyard` (MIT, github.com/ddyy/repoyard): untracked parent workspace folder with `notes/` beside the repo | R1, R2, R3 (git can't see it) | Moving every repo into a `<repo>-workspace/` folder; 17-commit project; npx tool | costly | weighed out (E gets the same without moving repos) |
| K | Committed in the repo (`docs/research/`) | R1, R4, R6, R7 | R3 fails | cheap | considered, but not applicable if R3 becomes core |
| L | Git orphan branch or `git notes` | R6 | R1 fails (not in the working tree); awkward | cheap | weighed out |
| M | Claude Docs (or the team's Confluence) as storage, answers still in chat | R2, R3, R6, R7, R8 | Outside the repo; needs the connector; publishing to an external service; not greppable locally | cheap | weighed out |
| N | Keep A, but replace the scratchpad fallback: the skill creates `local-notes/` and its ignore entry when missing | R1, R3, R4, R5 | Still a per-repo ignore file (R2 fails); edits the repo's ignore setup | cheap | weighed out (B covers it) |
| P | Central folder (E/H) holds the logs; the repo gets a link to it (an ignored symlink, or a one-line index the skill prints with the full path) | R1 (in VS Code via the link), R3, R8, R10 | The link itself needs ignoring (same problem as B, but losing it loses nothing); symlinks are unreliable on Windows | cheap | candidate |
| Q | Split by kind: notes about the project (research logs, `TODO.md`) in a central folder (E); code-tied scratch (`tmp/`, scripts with repo-relative paths) in an ignored folder in the repo (B) | R10 for what matters, R12 for scratch | Two places to know; still B's per-machine ignore line for the scratch part | cheap | candidate (independent check, round 2) |
| R | E with an explicit key: a mapping file in the notes folder (repo path or remote → notes folder), or a marker file per repo, instead of deriving the folder from name/path/remote | R4 robust against duplicate names, moves and nested repos | One more file to keep right; a marker in the repo needs ignoring again | cheap | add-on to E/Q |
| S | E plus a SessionStart hook in the user settings: it works out the repo key (from `git rev-parse --git-common-dir`, so worktrees map to their main repo), prints the notes path, and prints the vault's project instructions file, so the project `CLAUDE.md` can live in the vault too | R2 fully (nothing per repo, not even `CLAUDE.md`), R3, R4 (no prose rule needed), worktrees | A hook script to maintain; per machine: hook + `additionalDirectories` in `~/.claude/settings.json`; hook output is context, not a real `CLAUDE.md` (no `/memory` listing) | cheap | candidate (independent check, round 3) |
| T | E for notes, plus the project's personal instructions in `CLAUDE.local.md` (Claude Code's own file for them) importing a vault file with `@~/Cboost/Notes/<repo>/CLAUDE.md` | Official mechanism; works across worktrees via the import | `CLAUDE.local.md` still needs ignoring per repo or globally; one approval of external imports per project | cheap | weighed out (S needs nothing per repo) |
| U | E plus one global ignore line for `CLAUDE.md`, `.claude/` and `local-notes/` (E+B hybrid) | Project `CLAUDE.md` stays where Claude Code reads it | Two setups (git and Claude settings); a global `CLAUDE.md` ignore hides it in repos where the team wants to commit one (needs `git add -f`) | cheap | candidate |
| O | Combine B or E with a VS Code multi-root workspace that includes the notes folder (`nl-cboost-flexcompose.code-workspace` already exists) | Strengthens R1 for E/H | Workspace file per project | cheap | add-on to E/H |

## Evaluation
- All options are cheap to reverse: logs are plain Markdown files; moving them is a copy. The habit cost is small.
- B vs E is the real choice: notes *inside* each repo's working tree (seen in the editor, ignored by git everywhere on
  this machine) vs notes *outside* all repos (can never be committed, one place for everything, cross-repo topics fit).
- Growth: with more repos and more machines, B needs the global ignore line per machine; E/H need the notes folder
  synced per machine. H is the only option that gives history and backup (R6).
- A (and N) don't generalize: the self-ignoring root `.gitignore` only works where the repo tracks no root
  `.gitignore`. This repo tracks none; `nl-polymx-automated-qc` does, so A there means editing a tracked file or
  falling back to `.git/info/exclude` (C).
- Every option that keeps logs inside the clone (A, B, C, D, N) fails R10: re-clone, a new worktree or
  `git clean -fdx` loses them. Only E, G, H, M, P keep them outside.
- B's failure mode: on a machine without the global ignore, `git add -A` stages the notes. The skill can guard this
  with `git check-ignore -q local-notes/` before writing, and stop with a clear message.
- E's failure mode: the user doesn't see the notes in the editor unless the vault is in the workspace; R4 needs a
  rule to map a repo to its folder (repo folder name, or remote URL).

## Open questions
1. Is this decision about research logs only, or about all local notes (`local-notes/TODO.md` too)? (Decides
   whether this is a child of a wider decision.)
2. R2: what bothers you: the setup step, the extra ignore file, or the risk of forgetting it? (B fixes the first two
   only on machines where the global ignore is set.)
3. R1: is "accessible" the VS Code explorer specifically, or is Obsidian fine? (E vs B)
4. R3: is "never committed" core (what breaks if it leaks into a commit?) or a preference? (K)
5. R6: do you want history/backup of notes? (H)
6. R7: do you work on more than this Linux machine? (B's guard; E/H sync)
7. R8: do you want cross-repo topics (skills, global setup) in the same place? (E/H)
8. R10: must logs survive a re-clone, a worktree or `git clean -fdx`? (inside-clone options vs E/H/P)
9. R5: do throwaway test clones need logs at all?
10. R3b: is "others see only a summary" yours, or should the research itself sometimes be shared?

## Sources
| Claim | Source | Date | Reliability |
|---|---|---|---|
| Global excludes default to `$XDG_CONFIG_HOME/git/ignore`, else `~/.config/git/ignore` | git-scm.com/docs/gitignore | 2026-10-23 | primary |
| No global excludes file is set on this machine | `git config --get-all core.excludesFile` (empty), `~/.config/git/` missing | 2026-10-23 | primary |
| Only this repo has `local-notes/` (3 other repos don't) | `ls` of the four working dirs | 2026-10-23 | primary |
| `~/Cboost/Notes` is an Obsidian vault, not a git repo | `.obsidian/` present, `git status` fails | 2026-10-23 | primary |
| Claude Code keeps plan files in `~/.claude/plans` | `ls ~/.claude/plans`; claudelog.com | 2026-10-23 | primary (local) |
| clank: MIT, overlay repo + symlinks, ignores via `.git/info/exclude`, macOS/Linux/WSL only | github.com/mighdoll/clank README | 2026-10-23 | primary, small project |
| repoyard: MIT, untracked parent workspace with `notes/` | github.com/ddyy/repoyard README | 2026-10-23 | primary, small project |
| `CLAUDE.local.md` is current: personal project instructions, add it to `.gitignore`; for worktrees, import a home-dir file with `@~/...`; external imports need one approval per project | code.claude.com/docs/en/memory (docs.claude.com calls it deprecated: older page) | 2026-10-23 | primary; the newer official page wins |
| `additionalDirectories` makes files readable without prompts; edits follow the permission mode, like the working directory | code.claude.com/docs/en/permissions | 2026-10-23 | primary |
| Common practice: ephemeral agent notes outside git or ignored; durable knowledge in repo | blogs (kau.sh, dev.to) | 2026-10-23 | community practice, not a standard |

## Rounds
### Round 1
Framed the problem, inventoried requirements (all unverified), listed 15 options. First ranking: B leading, E (or H
with history) runner-up. Independent check: B still needs per-machine setup (R2 only partly met); logs inside the
clone die with re-clone, worktrees and `git clean -fdx` (new R10); R3 split into R3/R3b; R5 may not need throwaway
clones; added P (central folder + link in the repo). Verified: the self-ignoring `.gitignore` of A fails in repos that
track a root `.gitignore`. Ranking now depends on R10/R6/R7: if logs must outlive the clone, E/H/P lead; if not, B.

### Round 2
Answers: logs must survive when unfinished; scope widened to all personal notes; several machines, no sync (R7
rejected); VS Code or Obsidian both fine. Effect: R10 now favours keeping notes outside the clone (E/H/P); R1 no
longer separates B from E; R7 no longer costs E anything. New ranking: E leading (central folder, e.g.
`~/Cboost/Notes/<repo>/`), P (E plus a link in the repo) runner-up if notes must be one click away in VS Code or
sit next to the code (R12); B drops to third, since `git clean -fdx` or a re-clone deletes unfinished work.
Open for E: how a repo maps to its folder (path, name or remote), and the project `CLAUDE.md`.
Independent check: 7 repo names exist 2-3 times under `~/Cboost` (nested and test clones), so a name key collides, a
path key breaks on moves, a remote key merges clones; E needs a Claude Code permission to write outside the working
directory (no user `settings.json` exists today; verified), one global line like B's; code-tied scratch (R12) can't
leave the repo, so E alone becomes E+B in practice; R11 mixes two kinds of note; mixing Claude logs into the personal
Obsidian vault may clutter it. Added Q (split by kind) and R (explicit key). E and Q now close; Q leads if code-tied
scratch is real.

### Round 3
Answers: unsure about code-tied scratch (checked: nothing needs repo-relative paths, so Q's split buys nothing today);
central folder in the Obsidian vault; repo-name key (clones share notes); re-clone/clean rarely or never. Effect: Q
weighed out (no code-tied scratch); R key option not needed (name key accepted); B back as runner-up, since loss is
rare. E vs B now: E fails safe on a machine without setup (a permission prompt) and gives cross-repo topics a home;
B fails unsafe (notes can be staged if the global ignore is missing) but needs no Claude settings. Ranking: E leading,
B runner-up. Found child decision: the project `CLAUDE.md` (and `.claude/`) can't move to the vault, since Claude
Code reads them from the repo, so they still need ignoring per repo or globally.
Independent check: a name key makes nested and test clones share one `TODO.md` with the real repo (the user may not
have meant that); a folder-name key misplaces worktrees (fix: key on `git rev-parse --git-common-dir`); E alone still
needs the project `CLAUDE.md` ignored, so it adds setup instead of replacing it; a prose rule is a weak way for
sessions to learn the path (a SessionStart hook is sturdier); R3 and R2 still unasked. Verified in the official docs:
`CLAUDE.local.md` is current; `additionalDirectories` covers edits under the normal permission mode. Added S, T, U.
Ranking: S leading (nothing per repo at all), U runner-up (if the project `CLAUDE.md` should stay a real file).

### Round 4
Answers: `CLAUDE.md` may be a shared, committed file in other projects (R15); clones share notes; a committed note
is real harm (R3 now core); per-machine hook + access is fine. Effect: U weighed out (a global `CLAUDE.md` ignore
gets in the way where the team commits one, and mixes shared and personal instructions); B and every in-repo option
weighed out against R3 on machines without the ignore line, since their failure mode is a commit; S fits all: shared
`CLAUDE.md` stays in git where a project has one, personal project instructions live in the vault and the hook loads
them. Open: whether this repo's own gitignored `CLAUDE.md` moves to the vault; vault layout. Child decision noted:
`.claude/settings.json` (personal permissions, ignored here) is config, not notes; out of scope.
Spike: the key (parent of `git rev-parse --git-common-dir`) maps every repo under `~/Cboost` correctly, subfolders
to their repo, nested repos to the innermost; no `.gitmodules` anywhere, so submodules don't occur today.
Independent check, verified in the hooks docs: hook output is capped at 10,000 characters; above it, Claude only
gets a 2,000-character preview and a file path, and isn't told to read it. This repo's personal `CLAUDE.md` is 8,126
characters, close to the cap: S would silently lose instructions as it grows. `SubagentStart` takes the same
context, which fixes subagents not seeing the notes path. The hook must run on every source (no matcher), print the
notes root and naming rule (for sessions with several repos), and the skill must stop and ask when no notes path is
in context, never fall back to the scratchpad. Same-name repos with different remotes would merge notes (ask).
R6 matters more now: the vault would hold the only copy of personal instructions (H). T revived for instructions: it
has no size cap, and `CLAUDE.local.md` is personal by definition, so a global git ignore line for it has no downside.
Ranking: S for notes stands; for personal instructions S (with a loud size guard) vs T is open.

### Round 5
Answers: any instruction-loading option is fine, a one-time setup per repo is acceptable (R2 relaxed to "no
recurring setup"); vault history via git with auto-commit (R6: preference, H added on top); no same-name repos with
different remotes (R13 safe). Effect: T wins for personal instructions (no size cap, Claude Code's own mechanism; the
per-repo pointer file is now acceptable, and holds only an import path, so even a commit of it leaks nothing). With
T in place, the hook in S only duplicates what a short rule in the global `CLAUDE.md` gives (notes root + naming rule
+ the `git rev-parse` key), so the hook is dropped (KISS; also no Windows script). Obsidian Git plugin: MIT
(LICENSE file), maintained by Vinzent03, commits on a schedule while Obsidian runs. Leading: E + T + H, with the
naming rule in the global `CLAUDE.md`. Runner-up: the same plus the hook (S), if the rule turns out to be missed.
Independent check: no better option. Details to handle: the plugin only commits while Obsidian runs, and without a
remote it is history, not backup; the vault needs a `.gitignore` for `.obsidian/workspace*.json`; a `CLAUDE.local.md`
created mid-session loads from the next session on; a declined external-import approval silently drops the personal
instructions (the skill/rule should check that they loaded); subagents may not get project instructions (the skill
already passes paths explicitly); the global `CLAUDE.md` lines about `local-notes/` must change. Add-ons offered:
Claude commits to the vault itself, a private remote for backup. Ranking unchanged.

### Round 6
Answers: the corrected reasons (in-repo options need the repo's own `.gitignore`; a missing global line on a
new machine is a small fix); vault stands over B; R4 and R5 preferences; R8 preference, with `_global/`. No ranking
change: R8 favours the vault further. All requirements now checked except R12 (evidence against) and R15 (stated).

## Decision
Agreed with the user on 2026-10-24 (round 5).

**Choice:** E + T + H.
- All personal per-repo notes (`TODO.md`, research logs, working notes, personal project instructions) live in the
  Obsidian vault at `~/Cboost/Notes/<repo name>/`. Repo name = the folder name of the parent of
  `git rev-parse --path-format=absolute --git-common-dir`, so worktrees and subfolders map to their repo; clones of
  one repo share notes. Topics outside any repo (skills, global setup) live in `~/Cboost/Notes/_global/`.
- Per repo, once: a one-line `CLAUDE.local.md` (`@~/Cboost/Notes/<repo>/CLAUDE.md`), created on first use.
- Per machine, once: `CLAUDE.local.md` in git's global ignore list; `permissions.additionalDirectories` for
  `~/Cboost/Notes` in `~/.claude/settings.json`; a rule in the global `CLAUDE.md` with the notes root and the naming
  rule.
- The vault is a local git repo (no remote), committed only by the Obsidian Git plugin; Claude never commits there.

**Why (each reason with the requirement it rests on, and its status):**
1. Notes outside every repo can't end up in a commit, not even on a machine without setup. R3: core, user, round 3.
2. No entry is needed in a repo's own `.gitignore`, which may already exist and be tracked and shared. R2 (user,
   round 6 correction): preference.
3. Unfinished work outlives a re-clone, a new worktree or `git clean -fdx`. R10: preference, user, rounds 1 and 2.
4. The vault's git repo gives history, auto-committed by the Obsidian Git plugin. R6: preference, user, round 4.
5. The notes can be browsed in Obsidian, and opened from VS Code by path. R1 and R14: preferences, user, rounds 1
   and 2.
6. Topics outside any repo get a home in `_global/`. R8: preference, user, round 6.
7. Shared, committed `CLAUDE.md` files stay untouched, because personal instructions go through `CLAUDE.local.md`.
   R15: stated by the user, round 3.
8. `CLAUDE.local.md` is Claude Code's own mechanism for personal project instructions, with no size cap. Source:
   code.claude.com memory docs (primary). The per-repo one-line pointer file is acceptable. R2: user, round 4.
9. One setup per machine is acceptable, since new machines are rare and the fix is small. R7 and R16: user, rounds 3
   and 6.

**Rejected (each option, the reason, and the requirement it rests on):**
- A (status quo, self-ignoring root `.gitignore`): needs the repo's own `.gitignore`, which in many repos already
  exists and is tracked (R2, round 6; verified in `nl-polymx-automated-qc`). Notes die with the clone (R10).
- B (`local-notes/` plus git's global ignore list): not rejected for R3. A missing line on a new machine is a small
  fix (R7, round 6). It loses because there is no history (R6), notes die with the clone (R10), there is no Obsidian
  browsing (R14), and topics outside any repo get no home (R8). Closest runner-up.
- C (`.git/info/exclude`, appended by the skill): hidden from the user (R1); lost on re-clone (R10); no history (R6).
- D (inside `.git/`): hidden by VS Code (R1); lost on re-clone (R10).
- E alone: is part of the choice; on its own it leaves personal instructions unsolved (R15).
- F (`~/.claude/projects/<key>/`): hidden, with mangled folder names (R1); no home for topics outside any repo (R8).
- G (`~/.claude/design-research/<repo>/`): hidden (R1); the vault gives the same without hiding (R14).
- H: is part of the choice (history, R6).
- I (clank): an extra tool; no native Windows; tiny project with no releases (sources table); its symlinks still
  need ignoring per repo (R2).
- J (repoyard): needs every repo moved into a wrapper folder; tiny project (sources table); the vault gives the same
  without moving repos.
- K (committed `docs/research/`): breaks R3 (core).
- L (orphan branch or `git notes`): can't be opened as files (R1).
- M (Claude Docs or Confluence): the notes leave the machine, outside R3's control; needs a connector.
- N (status quo plus auto-created `local-notes/`): same as A, needs the repo's own `.gitignore` (R2).
- O (VS Code multi-root workspace): an optional add-on for opening the vault, not a storage option.
- P (central folder plus a link in the repo): the link still needs ignoring per repo (R2), and symlinks are
  unreliable on Windows; opening by path is enough (R1, "either").
- Q (split by kind): no notes need to sit next to the code (R12, checked on disk, round 3).
- R (explicit mapping file): not needed, since name keys are accepted and no same-name repos have different
  remotes (R13, rounds 2 and 5).
- S (startup hook): its 10,000-character cap would silently drop instructions as they grow (hooks docs; this repo's
  instructions are 8,126 characters). With T in place it only repeats the global rule. It stays the fallback if
  the rule turns out to be missed.
- U (global ignore of `CLAUDE.md`): gets in the way in repos that commit a shared `CLAUDE.md` (R15).

**Known gaps:**
- The plugin only commits while Obsidian runs, and with no remote there is history but no backup.
- A newly created `CLAUDE.local.md` only loads in the next session.
- A declined external-import approval silently drops the personal instructions, so Claude should check that they
  loaded.
- Subagents may start without project instructions, so the skill passes paths to them explicitly.
- Submodules and bare repos would map to the wrong name (none exist today).
- Windows needs the same per-machine setup with its own paths.

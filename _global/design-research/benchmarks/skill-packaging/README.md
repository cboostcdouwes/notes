# Benchmark: skill packaging (draft)

**Draft (2026-10-30): the prompt, the rubric and the setup are proposals, to confirm with the user before a run.**

A software-tooling design question whose answer the user knows. The obvious-looking answers (one plugin per repo, a
skills-directory plugin) are not the best fit; the expected answer came up in discovery and was lost while merging
options (first run). Process for running and scoring: `../README.md`.

## Prompt (verbatim)
> Is it possible to organize my Claude Code skills into a single directory, so that the whole collection of skills
> can be shared at once? Files like the research-log template should be usable by several skills.

(Draft: built from the user's words in `../../problem-understanding.md`, review answer of 2026-10-30.)

## Setup (draft)
The researcher needs the situation a real run had: `~/.claude/skills` as a git repo holding `design-research/` (with
its skill-scoped `PreToolUse` hook) and the ignored `synced/` and `.trash/` folders. Open: whether the harness gives
the researcher a copy of that layout in its work folder, or describes it in the ground truth only.

## Ground truth
One fact per row; the answerer gives only the facts a question asks for (`../README.md`, *Running*).

### What the user has now
| # | Fact |
|---|---|
| G1a | The user's own skills are `design-research` (the main one) and a planned `problem-formulation` |
| G1b | `~/.claude/skills` is a git repo (since 2026-10-29) holding `design-research/` |
| G1c | `~/.claude/skills` also holds `synced/` (managed by claude.ai sync) and `.trash/`, both git-ignored |
| G1d | `design-research` declares a skill-scoped `PreToolUse` hook (the round gate) that runs a Python script from its own folder |
| G1e | The skills hold no personal paths or private content |
| G1f | The user keeps their code repos in `~/Cboost/` |

### Who receives it and how
| # | Fact |
|---|---|
| G2a | Recipients: the user's other machines |
| G2b | Recipients: colleagues at Cboost |
| G2c | Not public |
| G3a | A recipient installs the whole collection in one step |
| G3b | Recipients don't change the skills or send changes back |
| G3c | When offered a route that also gives colleagues updates (a marketplace), the user wants it |

### How the user works
| # | Fact |
|---|---|
| G4a | The user edits the skills often and tries them right away |
| G4b | A reload (`/reload-plugins`, a new session) after an edit is fine; a reinstall is not |
| G5 | Skill names getting a prefix (`<plugin>:<skill>`) is fine; the global `CLAUDE.md` and the benchmark harness get updated once |
| G6 | The round gate is a could: nice to keep working on the user's machines, optional for other installs |

### Constraints and plans
| # | Fact |
|---|---|
| G7a | Platforms of colleagues: unknown; Linux only for now; the skills get changed if another OS needs them |
| G7b | Hosting: the user's company GitHub account, maybe a company repo later; a later move doesn't matter |
| G8a | More plugins (skill groups) will be added later |
| G8b | Shared files only need to reach skills in the same plugin |
| G9a | Plugin name: `research` |
| G9b | Marketplace name: `cboost-skills` |
| G9c | The repo goes in `~/Cboost/cboost-skills` |

### Not known
- Whether Cboost's managed settings block skills-directory plugins or restrict marketplaces.

### Public facts a run can find
code.claude.com docs: a plugin holds several skills (`skills/<name>/SKILL.md`) and shared files reached by
`${CLAUDE_PLUGIN_ROOT}` (plugins-reference, skills); a folder in `~/.claude/skills` with `.claude-plugin/plugin.json`
loads as a skills-directory plugin (plugins/create); plugins from a locally added marketplace load in place, edits
after `/reload-plugins` (plugins/loading); a marketplace file elsewhere than `<repo>/.claude-plugin/marketplace.json`
needs `extraKnownMarketplaces` with `path` (plugins/marketplace-reference); marketplace installs copy each plugin
to a cache, so plugins can't read each other's files (plugins/loading).

Pitfalls: plugins two folders below `~/.claude/skills` don't load by themselves; registering a marketplace whose
plugins also load from the skills folder loads them twice.

## Expected answer and rubric (draft)
| Element | Points |
|---|---|
| Match: a git repo that is a marketplace root (`.claude-plugin/marketplace.json` at its root), plugins as subfolders (`research/` with `skills/` and `shared/`, shared files by `${CLAUDE_PLUGIN_ROOT}`); the user's machine registers it as a local directory marketplace (in place); colleagues install with one command from the git repo | match |
| Partial: the same marketplace at the root of `~/.claude/skills`, its plugins loading as skills-directory plugins | partial |
| The local-marketplace answer leads before the decision review, not only after the user asks | +1 |
| Asks where the user keeps repos, or whether the repo must be `~/.claude/skills` (G1f, G9c) | +1 |
| Asks whether more plugins will follow before drafting the decision (G8a) | +1 |

Hidden requirements a run should find by asking: G8a (several plugins), G3c (updates through a marketplace), G8b
(sharing within a plugin), G6 (the gate's priority), G9c (where the repo lives).

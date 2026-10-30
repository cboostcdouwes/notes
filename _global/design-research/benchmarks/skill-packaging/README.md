# Benchmark: skill packaging (draft)

**Draft (2026-10-30): the prompt, the rubric and the setup are proposals, to confirm with the user before a run.**

A software-tooling design question whose answer the user knows. The obvious-looking answers (one plugin per repo, a
skills-directory plugin) are not the best fit; the expected answer came up in discovery and was lost while merging
options (first run). Process for running and scoring: `../README.md`.

## Prompt (verbatim)
> Is it possible to organize my Claude Code skills into a single directory, so that the whole collection of skills
> can be shared at once? Files like the research-log template should be usable by several skills.

(Draft: built from the user's words in `../../problem-understanding.md`, review answer of 2026-10-30.)

## Files and repos at the start
The situation the first run met (2026-10-30). A harness run recreates it in the researcher's work folder (open: copy
the files, or describe them only).

```
~/.claude/skills/                    git repo, one commit (e2c7998 "initial commit", 2026-10-29)
├── .gitignore                       /.trash, /synced, __pycache__
├── design-research/                 the skill
│   ├── SKILL.md                     frontmatter hook: PreToolUse on AskUserQuestion runs
│   │                                python3 "${CLAUDE_SKILL_DIR:-$HOME/.claude/skills/design-research}/scripts/round-gate.py"
│   ├── README.md, decision.md, discovery.md, log-template.md, requirements.md, splitting.md
│   ├── checks/bias.md, checks/rejection.md
│   └── scripts/log-sections.py, scripts/round-gate.py
├── synced/                          managed by claude.ai skill sync; not in git
└── .trash/                          not in git
~/Cboost/                            the user's code repos (nl-cboost-*, PolyMX-QC, ...)
~/Cboost/Notes/                      notes vault, its own git repo; research logs and benchmarks in
                                     _global/design-research/
```

## Ground truth
One fact per row; the answerer gives only the facts a question asks for (`../README.md`, *Running*).

### What the user has now
| # | Fact |
|---|---|
| G1a | The user's own skill is `design-research` |
| G1b | A second skill, `problem-formulation`, is planned |
| G1c | `~/.claude/skills` is a git repo |
| G1d | That repo holds `design-research/` |
| G1e | `~/.claude/skills` also holds `synced/`, managed by claude.ai sync |
| G1f | `synced/` and `.trash/` are git-ignored |
| G1g | `design-research` declares a skill-scoped `PreToolUse` hook (the round gate) |
| G1h | The hook runs a Python script from the skill's own folder |
| G1i | The skills hold no personal paths or private content |
| G1j | The user keeps their code repos in `~/Cboost/` |

### Who receives it and how
| # | Fact |
|---|---|
| G2a | Recipients: the user's other machines |
| G2b | Recipients: colleagues at Cboost |
| G2c | Not public |
| G3a | A recipient installs the whole collection in one step |
| G3b | Recipients don't change the skills |
| G3c | Recipients don't send changes back |
| G3d | When offered a route that also gives colleagues updates (a marketplace), the user wants it |

### How the user works
| # | Fact |
|---|---|
| G4a | The user edits the skills often |
| G4b | The user tries an edit right away |
| G4c | A reload (`/reload-plugins`, a new session) after an edit is fine |
| G4d | A reinstall after an edit is not fine |
| G5a | Skill names getting a prefix (`<plugin>:<skill>`) is fine |
| G5b | The global `CLAUDE.md` and the benchmark harness, which name the skill, can be updated once |
| G6a | The round gate working is a could, not a should |
| G6b | It would be nice if the round gate keeps working on the user's machines |
| G6c | The round gate is optional for other installs |

### Constraints and plans
| # | Fact |
|---|---|
| G7a | Colleagues' platforms are unknown |
| G7b | Linux only for now |
| G7c | If another OS needs the skills, they get changed then |
| G7d | Hosting: the user's company GitHub account |
| G7e | The repo may move to a company repo later |
| G7f | Whether a later move costs recipients a step doesn't matter |
| G8a | More plugins (skill groups) will be added later |
| G8b | Shared files only need to reach skills in the same plugin |
| G9a | Plugin name: `research` |
| G9b | Marketplace name: `claude-skills`, the same as the repo (changed 2026-10-30 from `cboost-skills`) |
| G9c | The repo goes in `~/Cboost/claude-skills`, named after its GitHub repo (changed 2026-10-30 from `cboost-skills`) |
| G9d | The GitHub repo already exists: `cboostcdouwes/claude-skills` (added 2026-10-30) |

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
| Asks where the user keeps repos, or whether the repo must be `~/.claude/skills` (G1j, G9c, G9d) | +1 |
| Asks whether more plugins will follow before drafting the decision (G8a) | +1 |

Hidden requirements a run should find by asking: G8a (several plugins), G3d (updates through a marketplace), G8b
(sharing within a plugin), G6a (the gate's priority), G9c (where the repo lives), G9d (an existing remote).

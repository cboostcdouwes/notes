# FlexCompose 2.0: a pitch

FlexCompose 2.0 is a rewrite of the tool in Rust. It writes the same Compose files as 1.0 for every template we have,
keeps every safety rule, and explains itself much better when something is wrong. This document compares 1.0 and
2.0, and says what adopting 2.0 costs.

**The ask:** adopt 2.0 as the next release of FlexCompose, after a test on Windows (see *What is not verified yet*).

## In one table

| | 1.0 (Go) | 2.0 (Rust) |
|---|---|---|
| Output for our templates | | Byte-identical: the ROS2-DEV box, both starters and the release targets |
| Error messages | One long line, `file line N: ...` | The template's lines, with the problem underlined, and a separate *help* with what to do |
| Warnings and notes | Long single lines | The same layout as errors; notes point at the line they are about |
| Summary on stdout | `label: text` lines | Aligned columns, colored status (plain when piped or with `NO_COLOR`) |
| Command line | Hand-written flags and usage | clap: generated help, checked values (`--target` lists the valid ones) |
| Logging | None | `FLEXCOMPOSE_LOG=debug`: what a run reads, decides and merges, on stderr, in nested scopes |
| Safety checks | Overwrite guard, sticky project, `--switch`, shared-folder warnings | The same, plus the file is synced to disk before it replaces the old one |
| Where work lives | | Unchanged: `./workspaces`, `<project>_source_workspace`, the frozen volume declaration |
| Old outputs | | Read as before: 2.0 reads the headers 1.0 wrote |
| Tests | Go suite | The whole suite ported and extended to 98 tests; they caught 16 of 16 deliberate code breaks |
| Binary size | 4.5 MB | 2.0 MB |
| Code size (without tests) | about 1,600 lines | about 3,200 lines (see *Costs*) |
| Dependencies | 1 (yaml.v3) | 13, all widely used (clap, miette, saphyr-parser, tracing, ...) |
| CI | Builds both OSes on Linux, tests on Linux | Builds and tests each OS on its own runner |

## What developers notice

### A mistake in the template

The template says `enable_gpu: yes` instead of `true`.

1.0:

```text
flexcompose: flexcompose.yaml line 25: services.app.flexcompose_options.enable_gpu must be true or false, got "yes" (YAML type !!str)
```

2.0:

```text
  × services.app.flexcompose_options.enable_gpu must be true or false
    ╭─[flexcompose.yaml:25:19]
 24 │       # enable_gpu needs an NVIDIA GPU and driver on the host; set it to false otherwise.
 25 │       enable_gpu: yes
    ·                   ─┬─
    ·                    ╰── this is a string
 26 │     # The dev box's image; the release builds on it (FlexCompose passes it to the Dockerfile as BASE_IMAGE).
    ╰────
  help: write true or false: other spellings such as yes, on or "true" read
        differently in other YAML readers
```

Every template error works this way: duplicate keys show both lines, a mount conflict shows both entries, and a
conflict with the release override shows the override's line, not FlexCompose's built-in fragment.

### A normal run

1.0:

```text
generated compose.generated.yaml (target devbox:host, os linux, project my-box)
workspace: host folder ${WORKSPACES_DIR:-./workspaces}, mounted at /home/cboost-user/workspaces; it survives recreate, down, down -v and docker volume rm/prune
content: new file
```

2.0:

```text
generated compose.generated.yaml: devbox:host on linux, project my-box
workspace the host folder ${WORKSPACES_DIR:-./workspaces}, at /home/cboost-user/workspaces
          survives recreate, down, down -v and docker volume rm/prune
content   new file
```

### Logging, when you need to see why

1.0 has no logging: to find out why a box came out as it did, you read the code. 2.0 logs when `FLEXCOMPOSE_LOG` is
set. Each line names the scope it happened in, from the run down to the service. Logs go to stderr and change neither
the output nor the summary; without the variable, 2.0 prints exactly what it printed before.

`FLEXCOMPOSE_LOG=debug flexcompose generate --target devbox:host-src --switch`. Every line starts with the run's scope,
`generate{target=devbox:host-src os=linux output=compose.generated.yaml}`, shortened here to `generate{…}`:

```text
DEBUG generate{…}: flexcompose::generate: reading the template template=flexcompose.yaml
DEBUG generate{…}: flexcompose::generate: project project=my-box given=false
DEBUG generate{…}:guard: flexcompose::guard: the output records target=devbox:host project=my-box version=2.0.0
DEBUG generate{…}:devbox{project="my-box"}:service{name="app" workspace=true}: flexcompose::render: merging fragment=targets/devbox-host-src
DEBUG generate{…}:devbox{project="my-box"}:service{name="app" workspace=true}: flexcompose::render: merging fragment=features/enable_shared_memory
DEBUG generate{…}:devbox{project="my-box"}:service{name="app" workspace=true}: flexcompose::render: merging fragment=features/enable_logging
DEBUG generate{…}:devbox{project="my-box"}:service{name="app" workspace=true}: flexcompose::render: merging fragment=features/enable_gui
DEBUG generate{…}:devbox{project="my-box"}:service{name="app" workspace=true}: flexcompose::render: merging fragment=features/enable_gpu
DEBUG generate{…}: flexcompose::files: writing path=compose.generated.yaml bytes=2247
```

The value is a filter, so one part can say more. `FLEXCOMPOSE_LOG=debug,flexcompose::merge=trace` also shows each list
entry the merge keeps once, here a device that both GUI and GPU add:

```text
TRACE generate{…}:devbox{project="my-box"}:service{name="app" workspace=true}: flexcompose::merge: already in the list; kept once at="services.app.devices" entry="/dev/dri:/dev/dri"
```

A filter that does not parse is refused (exit code 2), so a typo never looks like a run with nothing to log.

### The help text

1.0 has one hand-written overview, and Go's own flag listing per command. 2.0 is generated from the code: each command
has its own help, and the help lists the values a flag accepts.

1.0, `flexcompose help`:

```text
flexcompose generates a runnable Docker Compose file from a FlexCompose template.

Usage:
  flexcompose generate --target <devbox:volume|devbox:host-src|devbox:host|release:build|release> [--os <windows|linux>]
                       [--project NAME] [--template FILE] [--output FILE] [--force] [--switch]
  flexcompose regenerate [--output FILE]
  flexcompose version

generate    --target is required; the template lists the targets it supports.
            --os defaults to this host's OS (windows or linux); release targets are always linux.
            --project defaults to the template folder's name, --template to flexcompose.yaml,
            --output to compose.generated.yaml next to the template (release:build:
            compose.release-build.yaml, release: compose.release.yaml).
            Release targets run under the project plus -build or -release, so they never touch the dev box.
regenerate  repeats the choices recorded in the header of --output
            (default: compose.generated.yaml in the current folder).

FlexCompose only generates files. Run the result with plain Compose, e.g.
  docker compose -f compose.generated.yaml up -d
```

1.0, `flexcompose generate -h`:

```text
Usage of generate:
  -force
    	overwrite a file without a FlexCompose header, or one edited by hand
  -os string
    	OS of the host that runs the box: windows or linux (default: this host's OS; linux for release targets)
  -output string
    	output file (default: compose.generated.yaml next to the template; compose.release-build.yaml or compose.release.yaml for release targets)
  -project string
    	Compose project name (default: the template folder's name)
  -switch
    	allow an existing output to switch to another target
  -target string
    	target (required): devbox:volume, devbox:host-src, devbox:host, release:build, release; the template lists its targets
  -template string
    	template file (default "flexcompose.yaml")
```

2.0, `flexcompose --help`:

```text
flexcompose generates a runnable Docker Compose file from a FlexCompose template

Usage: flexcompose <COMMAND>

Commands:
  generate    Generate a Compose file from a template
  regenerate  Repeat the choices recorded in the header of a generated file
  version     Print FlexCompose's version
  help        Print this message or the help of the given subcommand(s)

Options:
  -h, --help  Print help

FlexCompose only generates files. Run the result with plain Compose, e.g.
  docker compose -f compose.generated.yaml up -d
```

2.0, `flexcompose generate --help`:

```text
Generate a Compose file from a template

Usage: flexcompose generate [OPTIONS] --target <TARGET>

Options:
      --target <TARGET>      What to generate; the template lists the targets it offers [possible values: devbox:volume, devbox:host-src, devbox:host, release:build, release]
      --os <OS>              The OS of the host that runs the box [default: this host's OS; linux for release targets] [possible values: windows, linux]
      --project <PROJECT>    The Compose project name [default: the template folder's name]
      --template <TEMPLATE>  [default: flexcompose.yaml]
      --output <OUTPUT>      The output file [default: compose.generated.yaml next to the template; compose.release-build.yaml or compose.release.yaml for release targets]
      --force                Overwrite a file without a FlexCompose header, or one edited by hand
      --switch               Allow an existing output to switch to another target
  -h, --help                 Print help

Release targets run under the project plus -build or -release, so they never touch the dev box.
```

2.0, `flexcompose regenerate --help`:

```text
Repeat the choices recorded in the header of a generated file

Usage: flexcompose regenerate [OPTIONS]

Options:
      --output <OUTPUT>  The generated file whose recorded choices to repeat [default: compose.generated.yaml]
  -h, --help             Print help
```

The commands and flags are the same. `devcontainer.json`, `release.sh` and everyone's habits keep working.

## What does not change

These are fixed on purpose, because changing them could cut a developer off from their work (`work-survives`):

- Where each box keeps its workspace, and the name of the workspace volume.
- How the project name is derived from the folder.
- The record in the header of a generated file. A box made with 1.0 keeps its project and target under 2.0.

Upgrading recreates no box for any template we have: the content is byte-identical, and 2.0 reports `unchanged`. If a
template does produce different bytes (only strings with unusual quoting can), the `content` line says so, names
the old version, and the box is recreated on its next `up`. The values stay the same: decoded with yaml.v3, the
YAML library Compose uses, the 1.0 and 2.0 outputs are equal.

## Why the code is better to work on

- **The choices are types, not strings.** A target is `Devbox(Host)` or `Release(Build)`. An unknown target, OS
  or invalid project name cannot get past the command line or a header.
- **Where work lives is one table.** Each target lists its places (what, host folder or volume, path in the box). The
  workspace notes, the switch notes and the shared-folder warnings all follow from it, and a test checks the table
  against the fragments. In 1.0 these were three hand-written cases and prose per target.
- **One way to report a problem.** Every error, warning and note is built the same way: message, help, and the
  line it is about.
- **No global state.** The version and the host OS are passed in, so tests can set them without side effects.
- **A plain output rule.** A string is written plain when every YAML reader reads it back as that string; otherwise
  it is quoted. 1.0 relied on yaml.v3's internal rules, which 2.0 had to reproduce line by line before this
  redesign.

## What Rust makes possible next

None of these is built yet. They are the gains that matter most for FlexCompose, each a separate step. Most are cheap
because of what 2.0 already has: its types, clap, and the exact place of every error. Go has its own tools for some of
them (goreleaser, govulncheck), so they are gains of 2.0 as much as of Rust:

- **Make the last illegal choice impossible.** Today a release on Windows is refused at run time. As a type (a
  release has no OS to choose), that state cannot be written at all, and the check goes away. *Small.*
- **Test the quoting rule on every string, not on examples.** The rule that keeps every value intact ("plain only when
  every reader reads it back") is now tested on 19 chosen strings. A property test checks it on thousands of
  generated ones, read back by a second YAML library. *Small.*
- **Check every dependency on each release.** `cargo deny` checks licenses and known security advisories of all 13
  dependencies in CI. *Very small.*
- **Shell completion.** clap already knows every command, flag and target; `flexcompose completions bash` gives tab
  completion of `--target devbox:…` for free. *Very small.*
- **Templates checked while you type.** The errors already carry the exact place in the template. A JSON Schema gives
  completion and checks in VS Code's YAML extension; a language server could show FlexCompose's own messages live,
  before anyone runs `generate`. *Medium (schema) to large (language server); worth a design round first.*
- **Releases and installers from one tool.** `cargo-dist` builds the release, the Linux and Windows installers and
  their checksums, replacing our hand-written scripts (`one-step-install`). A static Linux binary runs on any distro or
  container. *Medium; it changes how people install, so it is the team's call.*

## Costs

- **The team needs Rust to change the tool.** This is the main cost. The code is commented and covered by tests, but
  a Go developer will need time to get used to Rust's borrow rules.
- **More code.** About twice the lines of 1.0. Most of the growth is the YAML layer (1.0 got it from yaml.v3), the
  help text on every message, and doc comments.
- **More dependencies.** Thirteen instead of one. All are widely used, and the binary is still less than half of
  1.0's size.
- **Building for Windows from Linux needs extra setup** (mingw-w64), where Go did it out of the box. CI builds each OS
  on its own runner, so releases are not affected; `make` on a Linux machine builds only the Linux binary.

## What is not verified yet

- **Windows.** The tests ran on Linux only. CI now runs them on Windows too, so a release will not be published if they
  fail there, but nobody has run 2.0 on a Windows PC yet.
- **The release workflow.** It changed (one build per OS, then one publish step) and has not run yet.
- **The end-to-end test** (`tests/e2e.sh`, with Docker and the base image) has not run on 2.0.

## Open questions for the team

- A template that writes `environment:` or `labels:` as a map, while a feature adds a list, is refused (as in 1.0).
  Should FlexCompose convert one form into the other instead?
- The note about `~/.Xauthority` shows on every Linux run with GUI enabled. Should it show only when the file is
  missing?

## Proposed next steps

1. Run the test suite and one dev box on a Windows PC.
2. Run `tests/e2e.sh` on Linux.
3. Tag `v2.0.0`; the release notes come from the commit messages, plus a line in the tag about the upgrade.

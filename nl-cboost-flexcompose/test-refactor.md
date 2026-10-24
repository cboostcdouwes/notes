# Test refactor (started 2026-10-22, branch `dev/release-target`)

Self-contained: resume from this file without the chat that produced it. Read *Status* first, then *How to work*,
then the plan of the next step.

## Status (end of 2026-10-22)

| Step | State |
|---|---|
| 1 Remove ytt/legacy support (code + tests) | committed `095ceb8` (`feat!:`) |
| 1 docs + history out of comments | committed `6a47783` (`doc:`) |
| 1b One Linux/Windows body test, live-file test deleted | committed `b89244a` (`test:`) |
| 2 `main_test.go`: facts, not sentences | committed `01b477c` (`test:`) |
| 3 The other test files | **next** |
| 4 rapid properties | optional, ask first |
| 5 Test rules in the project's CLAUDE.md | after 3 (local file, no commit) |

**First action in a new chat:** `git status` and `git log --oneline -5` (the tree was clean after `01b477c`). Then
re-read every file you will touch: the user may have edited them; build on their version. Then step 3.

## How to work (the user's rules, from ~/.claude/CLAUDE.md and this refactor)

- One commit-sized step, then stop: list the changed files and give a conventional commit message. Never commit,
  stage or stash; the user commits. Each step leaves `go vet ./...` and `go test ./...` passing (in `flexcompose-cli/`).
- Keep changes minimal; mention other findings instead of fixing them.
- No history in code (comments, test names): what used to be belongs in git or the design's decisions table.
- After a step that rewrites many tests, offer (yes/no/later) a **before/now/why table**: helpers first, then one row
  per test in file order with a link (`[Name](flexcompose-cli/file.go#Lnn)`), what it checked before, what it checks
  now, and why; deleted tests struck through; unchanged tests listed too; end with a one-sentence summary. Rated
  4.5/5 for step 2 ("very helpful"). Ask for a 1-5 rating and record it in `~/.claude/UNDERSTANDING_EXPERIMENTS.md`.
- Update this file's *Status* after each step, and `TODO.md` (its top item points here) when done.

## Goal

Tests that check *what FlexCompose has to achieve*, and that survive rewording a message:

- the Compose file is correct for the chosen target, OS and features;
- the same inputs give the same bytes (any output change recreates every box);
- no work is lost (overwrite guard, sticky project, `--switch`, frozen `source_workspace` volume);
- invalid templates are refused (strict templates).

Notes, hints and help texts help the user but do not change the file or the box.

## Decisions (by the user, 2026-10-22)

1. **Message wording is not pinned.** No golden/transcript files. A test on an error checks *that it is refused*;
   it checks that a message is shown, by a fact in it (key, flag, path, project, volume or command name), only
   when that costs no extra lines. Never assert on sentences.
2. **Safety rules on messages stay**: a message never suggests `down`, `down -v`, `rm`, `prune` or exporting
   `WORKSPACES_DIR`/`COMPOSE_PROJECT_NAME` (CLAUDE.md invariant). These are about meaning, not wording.
3. **Test-only dependencies are fine** (e.g. `pgregory.net/rapid`); the binary stays at one dependency.
4. **`go test` must pass on Windows checkouts** (no `:` in file names, CRLF-safe comparisons).
5. **ytt-based boxes no longer exist**: all ytt/legacy support is removed (done, step 1).
6. Edge cases that don't affect the goal get **no** new tests (e.g. the YAML 1.1 quoting in `normalize`,
   `restart: "no"`: Compose v2 reads YAML 1.2; the `'a'`/`'z'` boundaries in `folderProject`).
7. Work on `dev/release-target` itself (`main` has no own commits; the branch is a superset).
8. The quoted `"<<"` case in `TestDuplicateKeysAndAnchorsAreRejected` is redundant: drop it (step 3).

## Conventions from step 2 (apply them in step 3)

- `wantErr(t, err, facts...)` (main_test.go): the error names every fact; with no facts it only checks that there
  is an error. Facts: a key path (`services.app.volumes`), a flag (`--force`), the value at fault (`macos`), a
  file path, a project or volume name (`keep-me_source_workspace`), a safety command (`docker compose -p keep-me
  stop`). Not facts: sentences, `line N)` formats, "both target container path".
- `contentLine(t, stdout)` (main_test.go): generate's `content:` line; tests compare its status:
  `== "unchanged"`, `strings.HasPrefix(l, "changed")`, `strings.HasPrefix(l, "project changed")`. The presence of
  `warning:` in stderr is a fact too.
- **Delete** a test that only checks a note, hint or help text, or an impossible state. **Trim** a test to:
  refused or not; output written / unchanged on refusal; header records (`readHeader`); body content; the safety
  rules. **Rename** a test whose name describes a message (e.g. `...IsExplained` -> `...IsRefused`).
- Byte-exact comparisons stay only for output bodies and determinism.
- A table of cases with one yes/no column per rule reads best (e.g. the shared-folder test: `warns`, `stop`).

## Step 3 plan: the other test files

Rewording failures left after step 2 (measured): `TestTypeSwitchesBetweenAllTargets` 7,
`TestUnknownOptionsListTheValidKeys` 1, `TestTemplateMayNotDeclareTheWorkspaceVolume` 1, `TestOneDocumentWithoutName` 1,
`TestFileLevelOptionsAreChecked` 1, `TestApplyRetargetsAndMergesFileLevelKeys` 1. Target after step 3: 0.

`targets_test.go`:
- `TestTypeSwitchesBetweenAllTargets` (biggest): keep refused without `--switch`, output unchanged on refusal,
  with `--switch` the header records the new target and content is `changed`, a second run is `unchanged` with
  no `switched` line. Facts instead of the `workspace` and `shared` sentence maps: the refusal and the
  `switched from --target` line name the old workspace's location (`box_source_workspace`, `./workspaces` /
  `WORKSPACES_DIR`, `src/`); `--switch` is named. Its "doesn't ask to move work that stays in place" check (shared
  volume between `devbox:volume` and `devbox:host-src`) is about wording: drop it, and mention to the user that it
  goes. The last part (another project): facts `old-box_source_workspace`, `new-box_source_workspace`; drop the
  workspace-note phrases (`but not down -v ...`, `a Docker Desktop reset`).
- `TestHostSrcLayersTheTemplateFolderOverTheWorkspaceVolume`: the body check is output, keep. Refusals: keep
  `services.app.volumes` and both entries (`../repo:/home/cboost-user/workspaces/src`,
  `.:/home/cboost-user/workspaces/src`, the fragment name `fragment targets/devbox-...`); drop `(from ... line 9)`
  and "both target container path".
- Others (`TestEachTargetsOutput`, `TestTargetKeepsTheTemplatesOtherServicesAndVolumes`,
  `TestAllFeaturesInTheFixedOrder`, `TestWorkspaceVolumeDeclarationIsFrozen`, `TestEveryTargetAndFeatureHasFragments`):
  bodies and structure, unchanged.

`template_test.go`:
- `TestFlexcomposeOptionsElsewhereAreRejected`: keep `where+".flexcompose_options"`; drop `"flexcompose.yaml line "`.
- `TestFileLevelOptionsAreChecked`: facts `devbox:hots`, `flexcompose_options.default`.
- `TestOptionsAreStrictBooleans`: fact `services.dev-box.flexcompose_options.enable_gui`.
- `TestUnknownOptionsListTheValidKeys` -> `TestUnknownOptionsAreRefused`: fact the key path `...enable_gpus`.
- `TestDuplicateKeysAndAnchorsAreRejected`: facts `line 8` (+ `image`) for the duplicate key, refused for anchors,
  `line 8` for the merge key; drop the quoted `"<<"` case (decision 8).
- `TestOneDocumentWithoutName`: refused; the `name:` case may keep `name`.
- `TestTemplateMayNotDeclareTheWorkspaceVolume`: facts `line 10`, `source_workspace`; drop "frozen" and the
  sentence parts.
- `TestGuardRejectsAFileWithoutTheFileLevelKey`, `TestOptionsAreReadAndStripped`, `TestCRLFAndBOMAreAccepted`: fine.

`release_test.go`: mostly facts already. `TestReleaseTargetsNeedAnImageForEveryService`: `"services.db has no
image:"` -> `"services.db"`. `TestOverrideIsCheckedLikeATemplate` / `TestOverrideConflictsNameTheOverride`: they
check that the override (`releaseOverride`) is named and not called a fragment: facts, keep.

`merge_test.go`:
- `TestMergeKindMismatchIsAnError`: facts `services.app.environment` and `fragment features/test/compose.yaml`; drop
  the `KEY=value` hint and its negative check (a hint); the labels/volumes cases become key paths only (a table).
- `TestApplyRetargetsAndMergesFileLevelKeys`: the refusal names `db`.
- `TestMergeRefusesTwoMountsOnOneContainerPath`: keep the key path, both sources (`flexcompose.yaml line 2`,
  `fragment features/test/compose.yaml`) and the container path; drop the `(from ` and "both target container
  path" wording.
- Value tests (`TestMergeAppendsOnlyMissingListEntries`, `TestContainerPath`, ...): unchanged.

Commit: `test: check facts and refusals in the other test files, not message wording`. After it: measure (below),
offer the before/now/why table, update *Status*.

## Step 4 (optional, ask first): a few rapid properties that *replace* examples

They add no bug-catching power (measured), so only where one stated rule replaces several examples.
- Round trip: for any devbox target, OS, valid project (`[a-z0-9][a-z0-9_-]{0,12}`) and feature subset in any
  order: generate succeeds, the header records the choices and the features in `featureOrder`, the body parses
  with `name:` = project, a permutation of the features gives the same bytes, `regenerate` reproduces the bytes.
  Could shrink `TestRegenerateReproducesTheSameBytes` and the order part of the determinism checks.
- `containerPath`: host part from {named volume, `./rel`, `/abs`, `${WORKSPACES_DIR:-./workspaces}`,
  `${A:-${B:-/x:y}}`, `C:\Users\me`, `C:/Users/me`, `$HOME/.x`}, target `/seg[/seg]`, optional trailing `/`, mode
  from {"", `:ro`, `:rw`, `:z`, `:ro,z`, `:rwm`} -> the target. Keep a few named real cases as examples.
- `folderProject`: any folder name gives a name matching `validProject`, or an error; a folder name that is
  already valid comes back unchanged (the stronger oracle; the weak one missed a mutant).
- A property must not use the code under test as its oracle (one that checked with `sameValue` missed a bug in
  `sameValue`).
- Adds `pgregory.net/rapid` (v1.3.0 tried) to go.mod as a test-only dependency; update CLAUDE.md's dependency line.

## Step 5 (local, no commit)

Add the conventions above to the project's CLAUDE.md *Tests* section: assert facts and rules, never sentences; an
error test checks that it is refused, plus a named fact only if free; no tests for notes or hints; `wantErr` and
`contentLine`.

## How to measure (tools in `test-refactor-tools/`, next to this file)

Always on a **copy** of `flexcompose-cli/` in the scratchpad: the rewording tool edits the module's files in place.

- **Rewording** (`reword/main.go`): for each prose string literal (4+ words) in the non-test `.go` files, one
  meaning-preserving edit (`does not`->`doesn't`, `is not`->`isn't`, `the`->`this`, `, `->`; `, `a`->`one`), then
  `go test`, and it prints which tests fail. Run:
  `cd ~/Cboost/Notes/nl-cboost-flexcompose/test-refactor-tools/reword && go run . <copy>`.
- **Mutation** (gremlins: `GOBIN=<scratch>/tools go install github.com/go-gremlins/gremlins/cmd/gremlins@latest`):
  compare old and new tests on the same code. `git archive HEAD flexcompose-cli | tar -x -C <scratch>/old`, the
  working copy as `<scratch>/new`; in each run `gremlins unleash --workers 2 --timeout-coefficient 30 -o
  <name>.json`, **one after the other** (parallel runs time out and the numbers mean nothing); then
  `python3 ~/Cboost/Notes/nl-cboost-flexcompose/test-refactor-tools/mutation-diff.py old.json new.json` lists the
  mutants the old tests killed and the new ones don't. Each must be in a note/hint, by decision 1.

## Measurements so far

- Start (before step 1): 45 of 92 one-word rewordings broke ≥1 test; 77 of 210 asserted literals were sentences.
  Coverage 91.8%; mutation efficacy 92.7%. Property tests (rapid, 3000 cases) all held and killed no extra
  mutant. Fuzzing (`go test -fuzz`) `loadTemplate` + `render`: ~1M inputs, no panic, no invalid YAML.
- Step 1b: the Windows fragments of `enable_gui`/`enable_gpu` were pinned only by the live-file test; the merged
  `TestOutputFollowsTheOSFragments` now fails on the same fragment edits (checked).
- Step 2: 0 of 84 rewordings break a `main_test.go` test (12 failures left, all in step 3's files). Mutation, same
  code: 308 -> 299 killed; all 9 lost are notes/hints: `chooseHint` (main.go), the host-src "src/ is shared" and
  the version clause of `changeReport`, the dropped-`build:` and `.Xauthority` notes in `render` (output.go).

## Expected effect when done

- Rewording a message breaks no test.
- Each test names the fact or rule it checks; tables of cases with yes/no columns per rule.
- Bug-catching unchanged except for notes and hints, by decision.
- Given up: no test catches badly worded or wrong prose in a message; that is left to review.

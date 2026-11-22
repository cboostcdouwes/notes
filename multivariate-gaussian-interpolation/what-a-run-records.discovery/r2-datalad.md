# R2: DataLad + git-annex for recording short training runs (hands-on test)

Date of test: 2026-11-22. This file reports what was run and what came out. It does not recommend or judge.

## Setup and conditions

- Test directory (called `$T` below):
  `/tmp/claude-1000/-home-cboost-Cboost-Experiments-multivariate-gaussian-interpolation/99e05a84-1c0a-4024-b558-ad1092398f7d/scratchpad/datalad-test`
- **`$T` is on tmpfs (RAM)**: `tmpfs 16G ... /tmp`. All timings below are without real disk I/O.
- `HOME`, `XDG_CACHE_HOME`, `XDG_CONFIG_HOME`, `XDG_DATA_HOME` and `UV_CACHE_DIR` were pointed into `$T` for every
  command, so nothing could be written to the real home. Consequence: the real global git config was not in effect.
  `user.name=tester` / `user.email=tester@example.invalid` were set locally in the test repositories.
- `PATH` was `$T/venv/bin:/usr/local/bin:/usr/bin:/bin`. System git: 2.56.1.
- Dataset `$T/ds` was created with `git init -b main`, local identity, then `datalad create --force -c text2git .`
  (`text2git`: text files go into git, binary files into the annex). Resulting `.gitattributes`:

  ```
  * annex.backend=MD5E
  **/.git* annex.largefiles=nothing
  * annex.largefiles=((mimeencoding=binary)and(largerthan=0))
  ```

- Workload `code/train.py --seed N --label NAME --out DIR [--seconds 12] [--mb 130]` (stdlib only): sleeps 1 s per
  step and appends one JSON line to `DIR/events.jsonl` (opened in append mode), then writes `DIR/networks.bin` =
  seeded random bytes + 32 bytes of `os.urandom` (136,314,880 bytes at the default). Two direct runs with the same
  seed: `cmp` reports `differ: byte 136314849`.
- Short variants (`--seconds 2 --mb 1` and similar) were used where only behaviour, not timing, was tested.

## 1. Install, versions, size

```
uv venv --python 3.14 $T/venv
uv pip install --python $T/venv/bin/python datalad git-annex
```

```
Installed 39 packages in 18ms          (whole install: 6.9 s wall)
 + datalad==1.8.0
 + git-annex==10.20261026
 + annexremote, boto3, botocore, cryptography, keyring, python-gitlab, requests, ... (39 total)
```

```
Python 3.14.9                      (uv-managed; system has 3.14.10, uv picked its own 3.14.9)
datalad 1.8.0
git-annex version: 10.20261026-g351f69fa638bde0d2f68ee5b8bab109c75945331
supported repository versions: 8 9 10        (repo got annex.version=10)
```

- The PyPI package `git-annex` provides the binary: `venv/bin/git-annex` is a 469-byte launcher, the payload is in
  `site-packages/git_annex/` (92 MB, contains `git-annex` and `magic.mgc`).
- Size: `du -sh venv` = 156 MB (4109 files); `uv-cache` = 161 MB; both together with hardlinks counted once = 170 MB.
  Largest parts: git_annex 92 MB, botocore 26 MB, cryptography 15 MB, datalad 6.3 MB.
- No Python 3.14 error or deprecation warning appeared in any command run in this test.
- Every `datalad` call printed `It is highly recommended to configure Git before using DataLad. Set both 'user.name'
  and 'user.email' configuration variables.` although the identity was set locally in the repository (there was no
  global identity under the redirected HOME). Commits were made correctly as `tester`.

## 2. Wall-clock cost of `datalad run` (12 s run, 130 MB output)

```
python code/train.py --seed 1 --label direct1 --out $T/direct/d1      12.445 s wall (0.39 user, 0.05 sys)
python code/train.py --seed 1 --label direct2 --out $T/direct/d2      12.416 s
datalad run -m "r1 seed=1" "python code/train.py --seed 1 --label r1 --out runs/r1"     13.004 s (0.80 user, 0.19 sys)
datalad run -m "r2 seed=2" "... --out runs/r2"                                           12.986 s
DATALAD_LOG_TIMESTAMP=1 datalad -l debug run -m "r3 seed=3" "... --out runs/r3"          12.939 s
datalad run --output runs/r4 -m "r4 seed=4" "... --out runs/r4"                          13.079 s
```

Added time: about 0.5 to 0.65 s per run (tmpfs).

Where it goes, from the debug log of r3:

```
19:30:45,572  first log line
19:30:45,658  == Command start                       -> 0.09 s before the command
19:30:58,060  Finished 'python code/train.py ...'    -> command itself 12.40 s
19:30:58,333  Finished ['git', ..., 'annex', 'add', '--batch', ...]   -> 0.27 s after exit, 0.23 s of it in git annex add
19:30:58,413  last log line                          -> 0.35 s after command exit in total
```

Reference points on the same machine:

```
datalad --version               0.102 s     (interpreter + import)
datalad status (clean tree)     0.138 s
datalad run "true"              0.210 s     (no change, no commit made)
md5sum of the 130 MB file       0.159 s
```

Other measured cases:

- Later run writing to an **existing** annexed output with `--output` (datalad unlocks the 130 MB file first):
  `--seconds 2` run took 3.845 s (1.27 user, 0.71 sys). A direct 12 s run takes 12.43 s, so a 2 s one about 2.4 s;
  added time about 1.4 s.
- 120 consecutive default-mode runs with `--seconds 0 --mb 1` (direct: 0.039 s): mean wall per `datalad run`
  0.354 s (first 10), 0.362 s (runs 50-59), 0.360 s (last 10). No growth over 120 runs. Total 42.6 s.

## 3. Uncommitted changes at the time of `datalad run`

State: `code/train.py` modified (` M code/train.py`), one appended comment line.

| Case | Command (shortened) | Result |
|---|---|---|
| a | `datalad run -m d-a "python code/train.py ... --out runs/da"` | **Refused**, exit 1, command not started |
| b | `datalad run --explicit -m d-b "..."` (no outputs declared) | Command ran, exit 0, **no commit**, `runs/db/` left untracked |
| c | `datalad run --explicit --output runs/dc ...` | Commit with `runs/dc/*` only; `code/train.py` still ` M` |
| d | `datalad run --input code/train.py --output runs/dd ...` (no `--explicit`) | **Refused**, same message as (a) |
| e | `datalad run --explicit --input code/train.py --output runs/de ...` | Commit with `runs/de/*` only; record lists `"inputs": ["code/train.py"]`; `code/train.py` still ` M` |
| f | `datalad run --explicit --output code/train.py --output runs/df ...` | Commit contains `code/train.py` **and** `runs/df/*` |
| g | Tracked files clean, only an untracked directory present, default mode | **Refused**, same message as (a) |

Refusal message (a, d, g):

```
run(impossible): .../ds (dataset) [clean dataset required to detect changes from command; use `datalad status` to inspect unsaved changes]
```

Case (e), check that the dirty code was left out although it is named as input:

```
$ git show --stat --format= HEAD
 runs/de/events.jsonl | 2 ++
 runs/de/networks.bin | 1 +
$ git show HEAD:code/train.py | grep -c 'dirty change A'     -> 0
$ grep -c 'dirty change A' code/train.py                      -> 1
```

No warning was printed in (c) or (e) about the modified tracked file. The script that actually ran was the modified
one; the commit holds the unmodified one.

Case (f): `add(ok): code/train.py (file)` and `code/train.py | 1 +` in the run commit.

## 4. Reading partial `events.jsonl` while the command runs

A second process polled `runs/r1/events.jsonl` every 2 s during `datalad run` (default mode):

```
[reader t=2s]  lines=1  ... "step": 0 ...  type=regular file
[reader t=6s]  lines=5  ... "step": 4 ...  type=regular file
[reader t=12s] lines=11 ... "step": 10 ... type=regular file
[reader t=14s] lines=12 (after the commit) type=regular file
```

The file is an ordinary file in the working tree during the run and readable. After the commit it stays a regular
file here because `text2git` puts text into git. In a dataset created without `text2git` a saved `events.jsonl`
becomes a symlink into the annex (see section 10); reading during the run was not tested in that configuration.

## 5. The run record; naming and finding runs

Full commit message of r1 (`git log -1 --format=%B`):

```
[DATALAD RUNCMD] r1 seed=1

=== Do not change lines below ===
{
 "chain": [],
 "cmd": "python code/train.py --seed 1 --label r1 --out runs/r1",
 "dsid": "1fdaa2b2-b7b1-48d7-8647-5128878060f3",
 "exit": 0,
 "extra_inputs": [],
 "inputs": [],
 "outputs": [],
 "pwd": "."
}
^^^ Do not change lines above ^^^
```

- With `--output runs/r4` the record has `"outputs": ["runs/r4"]`. A rerun's record has
  `"chain": ["d77db95ddf9c8babc4e4b66d0560dd2d9c00ea7d"]` (the original commit).
- The record holds the command string, exit code, declared inputs/outputs, working directory and dataset id. It
  holds no duration, no environment, no Python or package versions. The code version is the commit's tree (subject
  to section 3).
- A run's identity is its commit hash. The `-m` text becomes the subject after `[DATALAD RUNCMD] `. Two runs can
  have the same subject (a rerun copies it). Behaviour without `-m` was not tested.
- Commands that found runs again:

  ```
  git log --format='%h %ad %s' --grep='DATALAD RUNCMD'           # all runs (0.004 s with 135 run commits)
  git log --format='%h %s' -- runs/r4                            # by output path -> dd3f6e3, d77db95
  git log --format='%h %s' --grep='"cmd": .*--label r3 '         # by text in the recorded command
  git log -1 --format=%B d77db95 | sed -n '/^{/,/^}/p' | python -c 'import json,sys; ...'   # record as JSON
  datalad -f json rerun --report d77db95                         # JSON with commit, author, date, diff, run info
  datalad run --dry-run basic --output runs/y "..."              # prints location, expanded outputs, command
  ```

- `--sidecar yes`: the commit message then holds only an id (`"ecb944ec7f298c3ff0a0ce8d51f6876a"`) and the record
  is a file `.datalad/runinfo/<id>`. That file was xz-compressed binary and, in this `text2git` dataset, was stored
  in the annex (a symlink).
- I did not find or test a dedicated DataLad command that lists runs as a table; listing was done with `git log`.

## 6. Storage and working-tree form of large outputs

```
$ ls -la runs/r1
-rw-r--r-- events.jsonl                      (1105 bytes, in git)
lrwxrwxrwx networks.bin -> ../../.git/annex/objects/VG/pJ/MD5E-s136314880--895a...3f.bin/MD5E-s136314880--895a...3f.bin
$ ls -la .git/annex/objects/VG/pJ/*/
-r--r--r-- 136314880 MD5E-s136314880--895a52c533b78b0dcfa3f1f476e78f3f.bin
```

- Git stores the symlink (key = MD5 + size + extension); the content is one uncompressed read-only file under
  `.git/annex/objects`. `git annex add` moved the file there (same filesystem).
- Python:

  ```
  islink True | target mode -r--r--r-- | size via stat 136314880 | lstat size 138
  read ok, bytes: 136314880
  open for append: PermissionError Permission denied
  open for write:  PermissionError Permission denied
  ```

- **Different output directory per run** (r1..r4, s000..s119): each run adds a new symlink and a new annex object;
  nothing is unlocked; no conflict.
- **Same output path, outputs not declared** (`datalad run "... --out runs/r1"`): the script crashed at the end with
  `PermissionError: [Errno 13] Permission denied: 'runs/r1/networks.bin'`; datalad printed
  `The command had a non-zero exit code. If this is expected, you can save the changes with 'datalad save -d . -r -F .git/COMMIT_EDITMSG'`,
  `run(error)`, exit 1, no commit. `events.jsonl` (regular file) had already been appended to and was left ` M`.
- **Same output path, `--output runs/r1`**: datalad printed `Unlocking files` / `unlock(ok): runs/r1/networks.bin`,
  the script overwrote the file, the commit shows `runs/r1/networks.bin | 2 +-` with a new key. The old 130 MB
  object stayed in `.git/annex/objects` and is reported by `git annex unused`. `events.jsonl` had 14 lines
  afterwards (12 old + 2 new) because the script appends.

## 7. Drop, get, rerun

```
$ datalad drop runs/r4/networks.bin
drop(error): ... [unsafe; Could not verify the existence of the 1 necessary copy.; (Use --reckless availability to override this check, or adjust numcopies.)]   exit 1
$ datalad drop --reckless availability runs/r4/networks.bin
drop(ok)
$ python -c "open('runs/r4/networks.bin','rb')"      -> FileNotFoundError (dangling symlink remains)
$ datalad get runs/r4/networks.bin
get(error): runs/r4/networks.bin (file) [not available]                 exit 1   (no other copy exists)
$ datalad rerun d77db95                                                  13.140 s wall
[INFO] run commit d77db95; (r4 seed=4)
run.remove(ok): runs/r4/networks.bin (file) [Removed file]
add(ok): runs/r4/events.jsonl / networks.bin ; save(ok)
```

- The rerun worked and made a **new commit** `dd3f6e3 [DATALAD RUNCMD] r4 seed=4` with `chain` pointing to the
  original. `networks.bin | 2 +-`: new key (bytes differ). No error and no warning about the difference.
- `events.jsonl` had **24 lines** afterwards: the rerun did not remove the existing git-tracked file and the script
  appended (`events.jsonl | 12 ++++++++++++`).
- Rerun of a commit whose record declares **no outputs** also worked: content dropped (r2): 13.264 s,
  `run.remove(ok)`; content present (r3): 13.973 s, `unlock(ok): runs/r3/networks.bin`. (A plain `datalad run` to
  the same path without `--output` failed, see section 6.)
- `datalad rerun <commit>` ran the code **currently checked out**, not the code of the original commit: after a
  later commit added `print("CODE VERSION 2")`, reruns of the older r2 and r3 printed `CODE VERSION 2`.
  `datalad rerun --branch verify-r3 --onto "" 0ebe895` checked out the parent of the original run commit
  (`[INFO] checkout commit bedc607`), did not print the marker, and committed on the new branch `verify-r3`.
- Not tested: rerun where the regenerated bytes are identical.

## 8. Disk use, freeing space, listing absent content

With five 130 MB objects and three 1 MB objects in the annex (15 commits):

```
653M  .git/annex/objects        (5 x 130 MB + 3 x 1 MB, no compression, no sharing between differing files)
684K  .git/objects
654M  .git
655M  $T/ds                     (working tree: symlinks and jsonl; `du -sh runs` = 56K)
```

After 141 commits / 120 more 1 MB runs: `.git/objects` 5.6 MB (loose objects), `git-annex` branch 149 commits.

Freeing space:

```
$ git annex unused
    1  MD5E-s136314880--895a...   2  MD5E-s136314880--8cf6...          (objects no branch tip refers to; 0.04 s)
$ git annex whereused --historical --unused
MD5E-s136314880--895a... main~5:runs/r1/networks.bin
$ git annex dropunused all            -> failed: "(Use --force to override this check, or adjust numcopies.)"
$ git annex dropunused all --force    -> dropunused 1 ok, 2 ok   (0.043 s)        653M -> 393M
$ datalad drop --reckless availability runs/r3/networks.bin      (content of a file in the current tree)
```

After `dropunused`, the old commit still names the key (`git show 720484f:runs/r1/networks.bin`), and
`git annex whereis --key ...` says `(0 copies) failed`.

Listing absent content:

```
$ git annex find --not --in here          -> runs/r3/networks.bin
$ git annex list                          -> "X__ runs/r1/networks.bin" ... "___ runs/r3/networks.bin"
$ datalad status --annex availability runs/r3 runs/r4
2 annex'd files (130.0 MB/260.0 MB present/total size)          (totals only, no per-file list)
$ git log -1 --format='%h %s' -- runs/r3/networks.bin           -> 8921c66 [DATALAD RUNCMD] r3 seed=3
```

"Absent" can be listed. No tested command lists "absent and produced by a run"; the producing run commit was found
per file with `git log -- <path>`. `git annex unused` checks branch tips only (`checking main... checking exp-a...`),
so content used only by older commits of a branch counts as unused.

## 9. Branches

- `git checkout -b exp-a; datalad run ...`: the run commit landed on `exp-a` (`a887b5b`), `main` stayed at
  `9656774`. Run commits always went to the branch checked out in the working tree where `datalad run` was called.
- `datalad run --help` lists no option for a target branch (options: `-d -i -o --expand --assume-ready --explicit
  -m --sidecar --dry-run --on-cmd-failure`).
- `datalad rerun --branch rerun-r3 8921c66` from `main`: commit on new branch `rerun-r3`, `main` unchanged, and the
  working tree was **left on `rerun-r3`**. `--onto` sets the start point (see section 7).
- `git worktree add -b runs-wt $T/wt main`, then `datalad run --output runs/w1 ...` inside `$T/wt`: commit landed
  on `runs-wt` (`e84c52d`), `main` unchanged, annex content readable in the worktree (stored in the shared
  `.git/annex`). An uncommitted edit made in the main tree at the same time stayed ` M` there and was not part of
  the run: the worktree ran the committed code. In the worktree `.git` was a directory, not the usual one-line file.
  Whether DataLad documents worktrees as supported was not checked; this is one successful run only.

## 10. What broke or surprised

1. **Default `datalad create` (no `text2git`) annexes everything.** In `$T/ds2`, after `datalad save`, `code/a.py`
   and `events.jsonl` were symlinks into `.git/annex/objects`; `echo ... >> code/a.py` gave `Permission denied`.
2. **Two default-mode runs at the same time in one working tree got mixed.** B started 0.3 s after A (A 3 s, B 6 s).
   A's run commit contained `runs/cB/events.jsonl` (B's first 2 lines). B's result was a merge commit
   `756ab69 [DATALAD RUNCMD] cB` with parents `9656774` and a new commit `5e7cc8d Remaining changes after command
   execution` (holding `runs/cB/networks.bin`). 4 of B's 6 event lines were left uncommitted (` M`). Both exited 0.
3. **Three `--explicit --output runs/pN` runs finishing together:** p1 and p3 failed with exit 128:
   `fatal: Unable to create '.../.git/index.lock': File exists.` p2's commit contained p3's files as well; p1 was
   left untracked with its `networks.bin` already turned into an annex symlink. No run record for p1 or p3.
4. Rerun appends to an existing `events.jsonl` (section 7) and runs the current code unless `--onto` is used.
5. With `--explicit`, a modified tracked input is named in the record but not committed, without a warning (3e).
6. Untracked files and leftovers block default-mode runs. After SIGINT to the run's process group 3.5 s into a run:
   `Interrupted by user while doing magic: KeyboardInterrupt()`, exit 3, no commit, `runs/int2/` left untracked with
   3 lines; the next default `datalad run` was refused until it was removed.
7. A failing command makes no commit and leaves its partial changes in the tree (section 6).
8. `datalad drop` and `git annex dropunused` refuse by default because there is only one copy; they need
   `--reckless availability` / `--force`.
9. Overwritten outputs keep their old 130 MB in the annex until `dropunused` (section 8).
10. datalad wrote commit-message temp files as `/tmp/datalad_temp_*` (seen in the error text of item 3); none
    remained afterwards. Nothing was written under the redirected HOME.
11. My first attempt at the interrupt test did not deliver the signal (wrong process lookup); the run kept going in
    the background and failed when its output directory was deleted. The result in item 6 is from the redone test.

## Not verified

- Timings on a real disk or SSD: everything ran on tmpfs. In particular the cost of hashing/moving 130 MB and of
  unlocking (copying) an existing output on disk.
- Real `numpy` `.npz` output, a real training process, GPU use, and 80 appended lines (the dummy wrote 12).
- Hundreds of runs with 130 MB each (tested: 120 runs with 1 MB; five to six objects of 130 MB).
- `datalad get` from a second copy (no sibling/remote was created), any push or backup.
- Rerun producing identical bytes; `datalad rerun --since`; `datalad run` without `-m`.
- Behaviour with the real global git configuration and real HOME.
- Other Python versions (only 3.14.9 was used).
- Whether git worktrees are an officially supported DataLad setup; whether a DataLad command exists that lists runs.
- Reading a partially written file during a run in a dataset without `text2git`.

# R2: DVC experiments (`dvc exp` + DVCLive), hands-on test

Date: 2026-11-22. Facts from commands run in a throwaway repository; no recommendation.

Test directory (tmpfs, RAM-backed):
`/tmp/claude-1000/-home-cboost-Cboost-Experiments-multivariate-gaussian-interpolation/99e05a84-1c0a-4024-b558-ad1092398f7d/scratchpad/dvc-test`
(`repo/` = main test repository, `repo2/` = second repository for DVCLive without a stage, `.venv/` = the installation).

## Test conditions that differ from the real setting

- The test directory is on **tmpfs**. `dvc doctor` there reports `Cache types: hardlink, symlink` (no reflink).
  The real home is btrfs (`df -T /home/cboost`). Link behaviour and timings on btrfs were **not tested**.
- Dummy workload `train.py`: 12 steps of 1 s, one JSON line per step to `DIR/events.jsonl` (12 lines, not 80), then
  writes `DIR/networks.bin` = 64 bytes of `os.urandom` + 130 MiB derived from the seed (136,314,944 bytes). Plain
  binary, not `.npz`.
- Baseline without DVC: `python train.py --seed 1 --label base --out ...` took 12.07 s and 12.07 s; the two outputs
  had different md5 sums.

## 1. Installation

```
uv venv --python 3.14 .venv
uv pip install --python .venv/bin/python dvc dvclive numpy     # 4.8 s wall
```

- Installed and ran on **CPython 3.14.9**: `dvc 3.67.1`, `dvclive 3.49.1`. No other Python was tried, since 3.14 worked.
- **99 packages** in the venv, including `numpy`, which I added myself and which neither tool requires
  (`uv pip show numpy` -> `Required-by:` empty). So 98 packages for `dvc` + `dvclive`. Among them: celery, kombu,
  hydra-core, omegaconf, pygit2, dulwich, aiohttp, pydantic, rich, gto.
- Venv size: **164 MB** right after install (32 MB of it numpy), **188 MB** at the end of the test (`.pyc` files).
- `dvc --version` starts in 0.1 s.

## 2. What must exist before a run can be recorded; overhead

Needed in every case: a git repository with at least one commit, and `dvc init` (creates `.dvc/`, `.dvcignore`).

Three ways were tested.

### a) `dvc exp save` after a plain run (no `dvc.yaml`, no params file)

```
python train.py --seed 1 --label a1 --out runs/a1
dvc exp save --name a1                       # 0.84 s
  WARNING: The following untracked files were present in the workspace before saving but will not be
  included in the experiment commit: runs/a1/networks.bin, runs/a1/events.jsonl
dvc exp save --name a2 -I runs/a1/events.jsonl        # 0.50 s; events.jsonl is now in the experiment commit
dvc add runs/a1/networks.bin                          # 1.11 s; writes networks.bin.dvc + .gitignore, copies to cache
dvc exp save --name a3 -I runs/a1/events.jsonl -I runs/a1/networks.bin.dvc -I runs/a1/.gitignore   # 0.61 s
```

- Works without a stage. It records the tracked files of the working tree. Untracked files are left out unless
  named with `-I`; the 130 MB file is only recorded if it was `dvc add`-ed first and its `.dvc` file is passed with `-I`.
- The command line, seed and label are not recorded anywhere by `exp save` itself (the `exp show` row for a1..a3
  has no parameter columns).
- Added time: about **0.6 s** (save only) or **1.7 s** (`dvc add` + save) after the 12 s run.

### b) `dvc exp run` with a stage

Needs a committed `dvc.yaml` with a stage. A params file is only needed if the stage lists `params:` (and for `-S`).

```yaml
stages:
  train:
    cmd: python train.py --params params.yaml --out out
    deps: [train.py]
    params: [train.seed, train.label]
    outs:
      - out/networks.bin
      - out/events.jsonl:
          cache: false
```

```
dvc exp run -n s1                      # 13.02 s
dvc exp run -n s3 -f                   # 13.15 s
dvc exp run -n s4 -S train.seed=2      # 13.65 s
dvc exp run -n s5 -S train.seed=1      # 13.11 s
```

- Added time: **+1.0 to +1.6 s** over the 12.07 s baseline. DVC writes `dvc.lock`, `out/.gitignore`, copies the
  130 MB file into `.dvc/cache`.
- With the stage command also logging through DVCLive (`--dvclive dvclive`, `metrics:`/`plots:` entries in the
  stage): 13.55 to 13.73 s over 8 runs, so **+1.5 to +1.7 s**.
- `cache.type hardlink`: 13.46 s; `cache.type symlink`: 13.48 s, 13.54 s. `md5sum` of the 130 MB file alone: 0.16 s.
- `-S train.seed=2` rewrites `params.yaml` in the working tree and leaves it modified after the run.
- DVC deletes the stage's declared outputs before it runs the command, so `events.jsonl` started empty each run
  (12 lines every time).

### c) DVCLive in a plain `python` run (`Live(save_dvc_exp=True)`), no stage (tested in `repo2`)

```
python train.py --seed 1 --label soloA --out out --dvclive dvclive --dvclive-exp     # 13.35 s, 13.20 s
  WARNING: ... untracked files ... will not be included in the experiment commit: out/events.jsonl
```

- No `dvc.yaml` or params file needed beforehand. DVCLive wrote a `dvc.yaml` itself (`params: dvclive/params.yaml`,
  `metrics: dvclive/metrics.json`, `plots: dvclive/plots/metrics`) and saved an experiment at `live.end()`.
- Experiment tree: `dvc.yaml`, `dvclive/metrics.json`, `dvclive/params.yaml`, `dvclive/plots/metrics/score.tsv`,
  `out/.gitignore`, `out/networks.bin.dvc` (because the script calls `live.log_artifact`), `train.py`.
  `out/events.jsonl` was not included.
- Added time: **+1.1 to +1.4 s**.
- Experiment got a random name (`ohmic-flap`, `world-chum`); I did not test `Live(exp_name=...)`.

### d) Queue (`dvc exp run --queue` + `dvc queue start`, celery worker)

- Worked on Python 3.14. Queueing took 0.64 s; from `dvc queue start` to the finished task: about **16.5 s** for the
  12 s run (measured twice).
- `dvc queue start` returned after 1.6 s in the first trial and blocked for 16.6 s and 16.5 s in the second and
  third trial. I did not find out why.

## 3. Uncommitted changes in the working tree

```
(edit train.py: add print("DIRTY-MARKER ..."))      # tracked, not committed
echo "# untracked helper" > helper.py               # untracked
dvc exp run -n dirty1 -S train.seed=3
```

- The tracked edit **was captured**: the experiment commit (parent = HEAD of main) contains `train.py` with the
  marker line, `params.yaml` with seed 3, `dvc.lock`, `out/events.jsonl`.
  `git show --stat <exp>`: `dvc.lock | 22 +, out/events.jsonl | 12 +, params.yaml | 2 +-, train.py | 1 +`.
- The **untracked `helper.py` was not captured**, and `dvc exp run` printed no warning about it.
- In a later run `helper.py` was staged first (`git add helper.py`, not committed): it **was** in the experiment
  commit. After that run `git status` showed it as `?? helper.py` again (the staging was gone).
- After the run the working tree still has the edit (`M train.py`, `M params.yaml`); `git log main` is unchanged;
  `git stash list` is empty.
- Recovering the code later, all three tested and working:
  - `git show refs/exps/6a/ebb1479412c05b480886adc765c83e718bff74/dirty1:train.py` (or with the SHA from
    `dvc exp list`). `git show dirty1:train.py` does **not** work: `fatal: invalid object name`.
  - `dvc exp apply dirty1`: puts `train.py` and `params.yaml` of the experiment into the working tree.
  - `dvc exp branch dirty1 br-dirty1`: creates a git branch whose tip is the experiment commit.
- `dvc exp diff dirty1 s1` lists only parameter (and metric) differences, not code differences.

## 4. Reading while the run goes; `dvc exp show` during and after

Workspace run (`dvc exp run -n live1 -S train.seed=4` in the background, probed after 6.5 s from another process):

```
events.jsonl lines: 5                       # readable, last line = step 4
dvclive/metrics.json: {"score": 0.2006..., "step": 4}
dvclive/plots/metrics/score.tsv: rows up to step 4
dvc exp show (0.58 s, did not block):
  workspace               -   -      -        0.20067   4
  main                    ... -      -              !   1
  └── workspace [live1]   -   Runn…  Works…   0.20067   4
dvc metrics show:  dvclive/metrics.json  0.17068  5
```

- After the run: `└── 123b0d2 [live1]  07:33 PM  0.0861  4  e6272a35...` (final score, seed, md5 of `train.py`).
- During the run, the `train.py` hash column showed the value of the old `dvc.lock` still lying in the working tree.
- `--temp` run: `dvc exp show` showed `bf3c772 [temp1]  Running  Temp…  0.2  6`; the working tree was untouched
  (params.yaml stayed at seed 1). The run happens under `.dvc/tmp/exps/standalone/`; I did not read the partial
  files there (my probe command failed).
- Queued run: partial files are readable under `.dvc/tmp/exps/tmp<random>/`:
  `19:46:19 .dvc/tmp/exps/tmp0cbaekrj/out/events.jsonl lines=4 metrics={"score":0.2595...,"step":3}`.
  The directory is removed when the task ends.
- Plain `python` + DVCLive (way c): no separate "running" row. In `repo2` the `workspace` row showed the live
  score and step (`0.17116  5`). In `repo`, where the script used `dvcyaml=None`, nothing changed during the run.
- `events.jsonl` content never appears in `dvc exp show`; only DVCLive metrics/params and stage params/deps do.
- `dvc exp show --csv` gives one row per experiment (columns: Experiment, rev, typ, Created, parent, State,
  Executor, metrics, params, dep hashes).

## 5. Naming, finding, git storage

- Name: `-n NAME`, else a random two-word name (`cruel-says`). `dvc exp rename tonic-plop solo1` worked.
- Storage: one git commit per experiment, child of the HEAD commit at run time ("baseline"), referenced by
  `refs/exps/<first 2 hex of baseline>/<remaining 38 hex>/<name>`. Commit message:
  `dvc: commit experiment <hash>`. Further refs seen: `refs/exps/exec/EXEC_HEAD`, `EXEC_APPLY`, `EXEC_BASELINE`,
  `EXEC_MERGE` (during a run), `refs/exps/apply/ORIG_HEAD`, `refs/exps/apply/stash`, `refs/exps/celery/stash`.
- `git log main`: unchanged (3 own commits at the end). `git branch -a`, `git tag`, `git stash list`: nothing
  from DVC. `git log --all` does include the experiment commits (329 at the end).
- HEAD reflog: 87 entries part-way through the test (after roughly 25 experiment operations), **1636** at the
  end, after 300 more `dvc exp save` (`checkout: moving from main to <sha>`, `dvc: Restore HEAD to 'main'`).
- `dvc exp list` and `dvc exp show` without flags list only experiments whose baseline is the current HEAD. After
  each new commit on main, the earlier experiments were no longer listed; `dvc exp list -A`,
  `dvc exp list --rev 6aebb14`, `dvc exp show -A` listed them.
- `git gc --prune=now`: all 15 experiment commits still existed afterwards (`git cat-file -e`), `dvc exp list -A`
  unchanged.
- With 300 more experiments (`dvc exp save` in a loop, 0.57 to 0.63 s each, no slowdown from #1 to #300; 327 refs):
  `dvc exp list` 0.33 s, `dvc exp show` 5.25 s, `dvc exp show --csv` 5.04 s, `dvc exp show -A` 5.16 s.
  `.git` was 19 MB (4290 loose objects) before `git gc` and 984 KB after; the refs moved into `packed-refs`.

## 6. Two runs with the same settings and seed

```
dvc exp run -n s1        # ran, 13.02 s
dvc exp run -n s2        # "Stage 'train' didn't change, skipping"   0.65 s
dvc exp run -n s3 -f     # ran again, 13.15 s, new output md5
```

- Without `-f` the second run is **not executed**. An experiment `s2` is still created; its `dvc.lock` is the
  same as s1's (same output hash).
- `-f` / `--force` repeats the run. Both s1 and s3 are then kept as separate experiments with different output
  hashes.
- Changing a parameter and changing it back (s4 seed 2, then s5 seed 1; and rcA 20, rcB 21, rcC 20) **ran again**
  each time; nothing was restored from DVC's run cache with this stage (which has `cache: false` outputs).
- Same name again without `-f`:
  `ERROR: Experiment conflicts with existing experiment 's2'. To overwrite the existing experiment run: dvc exp run -f ...`
- Same name again with `-f` (`dvc exp run -n s3 -f` twice): the ref `s3` was **replaced** by the new run without
  further message; the first s3's 130 MB object stayed in the cache with no experiment pointing to it.
- Way c (plain python + DVCLive) run twice: two experiments, two cache objects. `events.jsonl` was appended (24 lines).

## 7. Where large outputs live; removing and regenerating one

- Cache: `.dvc/cache/files/md5/<2 hex>/<30 hex>`, one uncompressed file per distinct content, mode `-r--r--r--`.
- Working tree copy on tmpfs with default `cache.type`: a separate regular file (1 link, other inode), so each
  output existed twice. With `cache.type hardlink`: `2 links -r--r--r--`. With `symlink`: a symlink, `out/` is 12 K.
  In both link modes `echo x >> out/networks.bin` gave `Permission denied`; the next `dvc exp run` still worked.
- Remove and regenerate (experiment `temp1`, seed 6, md5 `ef7a0aad...`):

```
rm .dvc/cache/files/md5/ef/7a0aad910cf4b9c6a95688e2cab644
dvc exp apply temp1                  # 0.48 s
  ERROR: Checkout failed for following targets: out/networks.bin  Is your cache up to date?
  # params.yaml (seed 6) and out/events.jsonl of temp1 were applied; out/networks.bin is absent
dvc status   ->  train: changed outs: not in cache: out/networks.bin
dvc exp run -n temp1-redo            # 13.62 s, ran the stage (no -f needed)
  redo md5 = 96e58dd3...   (original ef7a0aad...)
dvc exp apply temp1                  # still: ERROR: Checkout failed ... out/networks.bin
```

- The re-run works and takes a normal run's time. Because the bytes differ, the result is a **new experiment
  with a new hash**; the original record `temp1` still names the old hash, which no longer exists anywhere.
  Not tested: `dvc exp run -f -n temp1` to overwrite the record under the same name (the overwrite itself was seen in 6).
- `dvc exp apply` of an experiment whose output is missing also removed the `out/networks.bin` that was in the
  working tree before.

## 8. Disk use and freeing old outputs

- After s1..s5 (s2 skipped, s3 run twice) plus the one `dvc add`: 6 objects, **781 MB** in `.dvc/cache`, i.e.
  130 MB per executed run. At 12 objects: 1.6 GB. No compression or deduplication between runs was visible.
- `dvc gc` flags (`dvc gc -h`): `-w/--workspace`, `--rev`, `-n/--num`, `-a/--all-branches`, `-T/--all-tags`,
  `-A/--all-commits`, `--date`, `--all-experiments`, `--not-in-remote`, `-c/--cloud`, `--dry`, `-f`.
- `--dry` results with 12 large objects in the cache:
  - `dvc gc -w`: would remove 15 objects (all but the working tree's).
  - `dvc gc -A`, `dvc gc -a`, `dvc gc -w --date 2026-11-22`: would remove 14.
  - `dvc gc --all-experiments`: would remove 6: the two large objects no experiment references (first `s3`, the
    removed `q2`) and 4 small ones. It kept the outputs of experiments on all three baselines.
- Real runs: `dvc gc --all-experiments -f` 0.47 s, 1.6 GB -> 1.3 GB. `dvc gc -w -f` 0.39 s, -> 131 MB, 1 large object.
- After `dvc gc -w`: `dvc exp list -A` and `dvc exp show -A` listed **all** experiments as before, with params,
  metrics and dep hashes. `dvc exp diff q1 live1` worked. `dvc exp apply q1` gave
  `ERROR: Checkout failed for following targets: out/networks.bin` but applied `params.yaml` and `out/events.jsonl`.
- A flag that keeps experiment outputs selectively (for example only the last N experiments) was not found in
  `dvc gc -h`; `--rev`, `-n`, `--date` select commits.

## 9. `dvc exp remove`

```
dvc exp remove q2          # 0.47 s  "Removed experiments: 'q2'"
dvc exp remove s2          # worked for an experiment on an older baseline too
```

- Left behind: the experiment's git commit object (`git cat-file -t <sha>` -> `commit`) until
  `git gc --prune=now`, after which it was gone; and the 130 MB object in `.dvc/cache` until a `dvc gc` that does
  not cover it (it was in the `--all-experiments --dry` removal list).
- Other flags: `-A`, `--rev`, `-n`, `--keep`, `--queue`, `-g`.

## 10. What broke or surprised

1. **Two `dvc exp run` in the same working tree at once** (reproduced twice): the second fails after 0.7 s with
   `ERROR: failed to reproduce 'train': '.../dvclive/plots/metrics' is busy, it is being blocked by: (PID ...)`,
   but it had already rewritten `params.yaml` (its own `-S` value). The first run then finished training and ended
   with `ERROR: Failed to reproduce experiment 'ab10733': 'NoneType' object is not subscriptable`. **Neither run
   was recorded.** `dvc.lock` in the working tree then named the second run's seed for the first run's outputs.
   A workspace run together with a `--temp` run: both were recorded with their own seeds.
2. **A killed run leaves no record.** SIGTERM to the training process after 5 s:
   `ERROR: failed to reproduce 'train': failed to run: ..., exited with -15`; no experiment in `dvc exp list`;
   the working tree kept the modified `params.yaml`, a 4-line `events.jsonl` and partial DVCLive files.
3. Untracked new source files are not captured and `dvc exp run` does not say so (see 3).
4. `-f` means both "run even if unchanged" and "overwrite the experiment with this name" (see 6).
5. Experiments disappear from the default `dvc exp list` / `dvc exp show` after the next commit on the branch (see 5).
6. Experiment names are not git revision names (see 3).
7. **DVC writes outside the repository**: `/var/tmp/dvc/repo/<hash>/` (`Repo.site_cache_dir` in `dvc doctor`).
   This test created `/var/tmp/dvc` (born 19:29:26) with 7 sub-directories, 648 K. They are still there; I did
   not delete them because they are outside the test directory. `dvc config --local core.site_cache_dir .dvc/site-cache`
   moved the location into the repository (checked with `dvc doctor` only).
8. `dvc queue status` failed with `ERROR: unexpected error - Invalid commit '390eeb5d...'` (the queue entry of
   the finished task q1). Before that I had run `git gc --prune=now` and `dvc exp remove q2`; which of the two
   caused it was not isolated. `dvc queue remove --all` made `dvc queue status` work again.
9. The first `dvc exp save` commit contained `.dvc/tmp/repro.dat` although `.dvc/.gitignore` ignores `/tmp`.
10. A DVCLive-saved experiment in the repository that also has the stage shows `!` in the score column
    (the stage's `dvclive/metrics.json` is not in that commit).
11. `.dvc/tmp/updater.lock` exists; whether DVC contacted its update server was not checked
    (`core.analytics false` was set; `core.check_update` was left at its default).
12. My own mistake, not DVC's: a `pkill -f` pattern matched my test shell and ended one test command early; the
    kill test itself had already run and its result (item 2) was read from the log afterwards.

## Not verified

- Behaviour and timings on btrfs (reflink), and with a real `.npz` written by numpy.
- Runs of several minutes, 80 score lines, and `dvc exp show` beyond about 330 experiments.
- Another Python version (not needed).
- Remotes, `dvc push`/`dvc exp push`, sharing.
- Interrupting `dvc exp run` itself (Ctrl-C), a crash of the training script with a Python exception, and how a
  failed queue task is shown.
- `dvc exp apply` of an experiment from an older baseline onto a newer HEAD.
- The run cache with a stage whose outputs are all cached; one entry appeared in `.dvc/cache/runs/` and I did not
  find out which command wrote it.
- `Live(exp_name=...)`, `Live(resume=True)`, DVCLive `monitor_system`, the VS Code extension, DVC Studio.
- Reading partial files of a `--temp` run (only seen through `dvc exp show`).
- Why `dvc queue start` sometimes blocks until the task is done.

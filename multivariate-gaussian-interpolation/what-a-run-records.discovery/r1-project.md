# What a run records: options from the project's own field and code (generator J)

Lens: the problem's own field (experiment management in machine learning and reinforcement learning), with this
project's code and docs in hand. Options that grow out of what the project has, and options the code's real shape
makes cheap or hard. Nothing is ranked or judged. `layouts.py` was not opened; no result file of `layout-04` to
`layout-20` was opened. File shapes come from `layout-02` files.

Paths are relative to `/home/cboost/Cboost/Experiments/multivariate-gaussian-interpolation/`. Short names used below:

| Short | File |
|---|---|
| `gcsl.py` | `experiments/gcrl-maze/gcsl/gcsl.py` |
| `gcsl_video.py` | `experiments/gcrl-maze/gcsl/gcsl_video.py` |
| `wgcsl.py` | `experiments/gcrl-maze/wgcsl/wgcsl.py` |
| `quasimetric.py`, `quasimetric_model.py` | `experiments/gcrl-maze/quasimetric/…` |
| probe | `experiments/gcrl-maze/quasimetric/results/probes/model-speed/model_speed_probe.py.txt` |
| `timing.sh.txt` | same folder as the probe |
| `run.py`, `play.py`, `review.py` | `experiments/gcrl-maze/human-baseline/…` |
| `env.py` | `packages/gcrl-maze/src/gcrl_maze/env.py` |
| Q-README, G-README, W-README, H-README | the README of `quasimetric`, `gcsl`, `wgcsl`, `human-baseline` |
| vault rules | `~/Cboost/Notes/multivariate-gaussian-interpolation/CLAUDE.md` |

Source URLs: the pages for `jax.export`, XLA determinism, DataLad rerun, Sacred observers, trackio, the Minari
dataset standard and snapper/btrfs subvolumes came up in web searches of this session. The other URLs are given from
memory and were not opened; check them before relying on a detail.

## Reformulations

What neighbouring fields that serve the same purpose call this problem:

- **Experiment tracking (machine learning operations):** "runs, parameters, metrics, artifacts, lineage". A run is a
  row with an ID; big files are artifacts hanging off it.
- **Build systems and reproducible builds (the furthest that still fits):** "a derivation and its realisation". The
  lasting thing is the recipe (inputs, code, settings); the output is a cache entry that can be thrown away and built
  again, and a rebuild is compared with the earlier build.
- **Simulation on large computers:** "input deck and restart file". The deck remakes the run; the restart file
  continues it; the output fields are too large to keep and are produced again on demand.
- **Offline reinforcement learning:** "a logged dataset of experience". What the agent saw is a dataset with a
  standard layout, apart from the agent that produced it.
- **Research data management:** "provenance" and "the lab notebook": every result names what it was derived from,
  and entries are dated and never overwritten.
- **Behavioural experiments:** "a session record with its trial log", which is what the human baseline already is.

Other formulations:

- **Wider:** every statement the project makes (a README number, a figure, a video, a remark) is a function of
  recorded inputs, and the function is recorded too. Runs are one kind of input; the reductions that turn curves
  into "5 % wasted" are another.
- **Narrower:** one save point (`gcsl.py:598-603`) writes two files under a name that is not unique
  (`<layout>_<actions>.json`) and that holds no method, date or code. Give that name and that header what they lack.
- **Inverted (the need goes away):** a run of 12 to 40 s, of which about 8 s is compilation, is cheap enough to be a
  memoised function call: if it were a pure function of its recipe, nothing but the recipe would need recording, and
  "finding a run" would be "calling it again". Or: nothing refers to runs at all; documents refer to claims, each
  claim carries the check that supports it, and runs are disposable evidence produced when a claim is checked.

## Worked-out options

J1. The shared loop writes the record: one run folder per call of `train`, opened before the first step.

- **What it is.** A small `Run` record is opened at the top of `gcsl.train`, not in `main`. It takes an ID, creates
  `<store>/<id>/`, and writes `manifest.json` before training starts: kind (training, probe, session), the method's
  module and `Method.name`, `sys.argv`, the settings from `asdict(config)`, layout number, seed, code identity, the
  hash of `uv.lock`, start time, GPU, and the IDs of parent runs. At each of the 81 evaluation boundaries it appends
  one line to `events.jsonl` (step, both scores per model, seconds) and writes that evaluation's networks as a file
  of their own, so a running or interrupted run can be looked at. At the end it marks the run finished.
- **Identity.** In the style the human sessions already have (`<layout>_<condition>_<YYYYmmdd-HHMMSS>`,
  `run.py:363`): a time stamp plus a few random characters, or `uuid.uuid7()` from the standard library of the
  installed Python 3.14. The ID is in the manifest, not only in the folder name, so a moved folder keeps it.
- **How today's readers keep working.** `plot` and the videos look for "the run of this method version on this
  layout" under a fixed name (`gcsl.py:514-515`, `gcsl_video.py:59-67`). That name becomes a small pointer file
  (`<layout>_<actions>.run` holding an ID) which `main` rewrites; the earlier run stays in the store.
- **Three kinds, one manifest.** Probes call `gcsl.train` (probe:193), so they get a record without being changed.
  `run.py`'s `save` (`run.py:357-376`) opens the same record and puts its session JSON in it as the payload.
- **Where it comes from.** The run-directory pattern of experiment trackers: Sacred's `FileStorageObserver` writes
  `config.json`, `run.json`, `metrics.json` and the captured output per run
  (https://sacred.readthedocs.io/en/stable/observers.html); MLflow's run folders
  (https://mlflow.org/docs/latest/ml/tracking/); UUID version 7
  (https://docs.python.org/3/library/uuid.html#uuid.uuid7).
- **Facts it rests on.** Every method reaches training through `train` (`gcsl.py:412`): `main` calls it at
  `gcsl.py:598` and probes call it directly. The loop is a Python loop over evaluation boundaries around one jitted
  call (`gcsl.py:437-447`), and the scores are host arrays there (`gcsl.py:438-439`), so the per-evaluation write
  needs no change inside compiled code. The line printed per evaluation already holds an event's content
  (`gcsl.py:442-445`). Networks are collected in a list and written once after training (`gcsl.py:440`, `602`). The
  result JSON holds `layout`, `config`, `steps`, `curves` and nothing about method, time or code (`gcsl.py:449-450`).
- **Cost in this code.** A `runs` module of roughly 60 to 100 lines. It would have to live where `run.py` can import
  it: `run.py` imports only the `gcrl_maze` package (`run.py:44-45`), while the methods find each other through
  `sys.path.insert` (`wgcsl.py:46`). Edits: the loop (`gcsl.py:437-447`), `main` (`gcsl.py:598-603`),
  `save_checkpoints` / `load_checkpoints` (`gcsl.py:465-486`) for one file per evaluation, the pointer lookup in
  `plot`, `gcsl_video.load_versions`, `wgcsl/value_function.py` and the probe check scripts that take a checkpoint
  path. Added run time: 81 small appends, and the network writes that happen anyway, spread over the run.
- **Variants.** One store for the project, or one per experiment folder next to today's `results/`.

J2. Recipe-addressed runs: the ID is a hash of what makes the run, and the outputs are a cache.

- **What it is.** The lasting record is a recipe: canonical JSON of the kind, the method's module, the hashes of
  every project source file the method loads, the hash of `uv.lock`, the layout number with the hash of the layout
  module, and the settings with the seed. The run's ID is the first characters of the recipe's SHA-256, so the same
  recipe has the same ID wherever it is stored and whoever made it. Each execution is a numbered realisation under
  it (`recipes/<id>/recipe.json`, `recipes/<id>/r1/curves.json`, `r2/…`) with its date and curves.
- **Outputs.** Networks and other large files go to a cache keyed `<id>/r<n>/` outside the project, for example
  under `~/.cache/` or in a btrfs subvolume of its own. A view asks for `outputs(id)`; on a miss the recipe is run
  again as a new realisation marked "remade", and its curves are set against the earlier realisations. Deleting the
  cache loses nothing by construction; a repeat can never overwrite, it is realisation n+1.
- **Human sessions.** No recipe reproduces them, so their ID is the hash of the recording itself and the whole
  recording (70 to 87 KB) is the lasting record.
- **Where it comes from.** Nix derivations and store paths (https://nixos.org/guides/how-nix-works/); DVC's run cache
  (https://dvc.org/doc/user-guide/pipelines/run-cache); Bazel's remote cache (https://bazel.build/remote/caching);
  rebuild-and-compare in reproducible builds (https://reproducible-builds.org/docs/); snapshots of a btrfs subvolume
  leave out nested subvolumes (https://btrfs.readthedocs.io/en/latest/Subvolumes.html,
  https://discussion.fedoraproject.org/t/questions-re-btrfs-snapshots/178406).
- **Facts it rests on.** The settings are a frozen dataclass and `asdict(config)` is already stored
  (`gcsl.py:78-100`, `449`). Not everything that shapes a run is a setting: constants at module level
  (`wgcsl.py:130-134`, `quasimetric.py:44-45`) and the wiring of a `Method` (`wgcsl.py:209-210`,
  `quasimetric.py:125-126`) exist only in the source, so the source hashes belong in the recipe. The same seed does
  not give the same numbers (Q-README:50), so a recipe names a distribution of results and the realisations are its
  samples. Probes patch `gcsl.py` in memory (probe:28-36): the probe's hash covers the patch only together with the
  hash of `gcsl.py`. Today's addresses, `Method.results` (`gcsl.py:276`) and `--results` (`gcsl.py:567`), would
  become labels that point at recipe IDs.
- **Cost in this code.** Canonical form and hashing, about 50 lines. A rule for "the files this method loads" (after
  import, the entries of `sys.modules` under the project root). A `remake(id)` entry that imports the recorded
  module and rebuilds the settings from the stored dictionary, as `gcsl_video.py:63` already does. Cache paths in the
  callers of `save_checkpoints` and `load_checkpoints`. A setting added later changes every recipe's canonical form
  unless a recipe stores only the settings that differ from the defaults, together with the code hash. A recipe
  whose code hash no longer matches the working tree can be remade only if the old sources are kept somewhere (J3,
  J4).

J3. Git as the ledger: the code's identity is a commit, and the run records it.

- **What it is.** The project becomes a git repository with the large outputs ignored from the first commit
  (`*_checkpoints.npz`, `*.mp4`, any cache). A run records `git rev-parse HEAD` and whether the tree was clean. For a
  tree with uncommitted changes there are three known ways: refuse the run; store the text of `git diff HEAD` in the
  record; or make a commit object of the dirty tree with `git stash create` (it touches neither the working tree nor
  a branch) and keep it reachable with `git update-ref refs/runs/<id>`. The small lasting record (manifest and
  curves) is a file in the repository, or lives in git notes or refs outside the branch history. Making a run again
  is `git worktree add` at the recorded commit, `uv sync --frozen`, and the recorded command line.
- **Tools that package this.** DataLad `run` / `rerun` stores the command as a machine-readable record in the commit
  and re-executes it from a commit hash (MIT; https://handbook.datalad.org/basics/101-109-rerun.html,
  https://datalad.readthedocs.io/design/provenance_capture.html). DVC experiments keep each experiment's code state,
  parameters and metrics as a hidden git ref (Apache-2.0; https://dvc.org/doc/user-guide/experiment-management).
  Plain git: https://git-scm.com/docs/git-stash, https://git-scm.com/docs/git-notes.
- **Facts it rests on.** The project root has no `.git` (listing of the root). Two vault rules end "when the project
  becomes a git repo": "Implement a feature in full; no commit-sized steps" and "Stored results have no history, so
  deletes need care". From then on the user's global git workflow applies: the assistant never commits or stages,
  and works one commit-sized step at a time. A probe is by its nature run from changed, uncommitted code (it even
  patches `gcsl.py` in memory, probe:28-36), so the dirty tree would be the usual case for probes, not the exception.
  `experiments/gcrl-maze/*/results` hold about 10 GB today, with 39 checkpoint files. `layouts.py` is source and
  would be in the history in plain text, as it is on disk today. Probe scripts are kept as `.py.txt` next to their
  results (vault rules, "Probes"); under git a probe's code could be a commit or stash object instead.
- **Cost in this code.** Nothing for the version control itself; about 30 lines to put commit and diff into a run's
  record; a `.gitignore`; a rule for dirty trees; a decision on who commits records and when (the user, by the
  global rule). DataLad or DVC add a dependency and a layout of their own (DataLad sits on git-annex; DVC wants its
  stages in `dvc.yaml`); neither is installed.

J4. The run capsule: every run carries the sources it loaded, as probes already carry their script.

- **What it is.** At the end of `train`, the record collects every loaded module whose file lies under the project
  root (from `sys.modules`), the script (`sys.argv[0]`) and the command line, and stores them with the run, the way
  a probe keeps its script as `.py.txt` beside its results. Sources are stored once per distinct content
  (`sources/<sha>/…`) and a run lists pairs of path and hash. One file is never copied: `gcrl_maze/layouts.py` is
  recorded by hash only, so the blindness rule holds. `uv.lock` is recorded by hash, with one copy per distinct
  content.
- **Making it again.** The capsule's sources are laid out in a temporary tree, the current `layouts.py` is added if
  its hash matches the recorded one (else the remake is refused), and the recorded command line is run.
- **Networks after code changes (R6).** A view of an old run imports the forward functions (`policy_outputs`,
  `time_to_goal`, the model) from the run's own sources, so the code that reads the weights is the code that wrote
  them.
- **Where it comes from.** Sacred's source snapshot, deduplicated in a `_sources` folder
  (https://sacred.readthedocs.io/en/stable/observers.html); ReproZip, which packs what a run used (BSD-3;
  https://www.reprozip.org/); the project's own probe convention (vault rules, "Probes").
- **Facts it rests on.** No list of a method's files exists: methods import each other through `sys.path.insert`
  and bare module names (`wgcsl.py:46-47`, `quasimetric.py:37-41`, `quasimetric_model.py:31-34`), so `sys.modules`
  is the only place the set can be read. `gcsl.py` imports the layouts (`gcsl.py:63`), so `layouts.py` is in every
  run's loaded set. A probe replaces `sys.modules["gcsl"]` by a patched copy whose `__file__` still names the
  unpatched file (probe:33-36): a capsule would hold the unpatched `gcsl.py` and the probe script that contains the
  patch. Bare module names collide: two versions of `gcsl` cannot both be `sys.modules["gcsl"]`, and
  `quasimetric_video.py:16` shows four methods in one process, so a view that mixes an old and a new run needs a
  subprocess per capsule or private module names. The method code is small: 1,051 lines over four files (`gcsl.py`, `wgcsl.py`,
  `quasimetric.py`, `quasimetric_model.py`), plus the environment package.
- **Cost in this code.** About 40 lines to collect and deduplicate, about 40 to lay out and rerun. For R6, views
  would compute per run in that run's code and exchange plain arrays (paths, action fields), which changes
  `gcsl_video.py:78-96`. No version control is needed for it.

J5. The whole `Learner` as the one stored state: restart file, networks and buffer in a single generic dump.

- **What it is.** At chosen evaluation boundaries (always the last, optionally a sparse set) the complete `Learner`
  is written generically: flattened with its key paths, one array per leaf, named by path (`policy/0/0`,
  `weighting/encoder/1/1`, `buffer/states`, `opt_state/…`, `key`). The same file is the restart file for continuing,
  the networks (a subset of its leaves, so a method no longer has to name them through `Weighting.networks`), and a
  window on the experience (the buffer's leaves). The 81 network snapshots of today become an output that is made
  again by running from the nearest stored `Learner`: key frames and replay.
- **Where it comes from.** Checkpoint and restart files in simulation codes
  (https://en.wikipedia.org/wiki/Application_checkpointing); Orbax checkpoints of JAX pytrees (Apache-2.0;
  https://orbax.readthedocs.io/); key paths of pytrees (https://docs.jax.dev/en/latest/working-with-pytrees.html);
  safetensors, a flat map of names to arrays (Apache-2.0; https://github.com/huggingface/safetensors).
- **Facts it rests on.** `Learner` holds all a run needs to go on: policy, optimiser state, environment states,
  current goals, trajectory step, buffers, the weighting's state and the random key (`gcsl.py:110-118`). Only the
  policy and `weighting.networks(...)` are kept today (`gcsl.py:440-441`); optimiser states, buffers, WGCSL's queue
  of advantages (`wgcsl.py:141`), environment state and key are dropped, so no stored run can be continued.
  `train_between(learners, first_step, end_step)` already advances any `Learner` over any step range
  (`gcsl.py:423-428`); `train` only ever starts from `init` (`gcsl.py:434`). Size: for the quasimetric method with
  one model and 8 environments a `Learner` is about 5 MB (50,000 buffered steps at 32 bytes, plus Adam's state at
  about three times the 283,000 parameters); with GCSL's trajectory buffer about 16 to 20 MB; the 81 snapshots of the
  same quasimetric run are 91.7 MB. Two schedules depend on `config.steps`: the evaluation steps are spaced between
  `learn_start` and `steps` (`gcsl.py:371-377`), and buffer capacities use it (`gcsl.py:218`, `wgcsl.py:87`), so
  continuing past `steps` needs a rule for the evaluations after the old end. Leaf names come from the field names
  of `Ring`, `Critic`, `TimeToGoal`, `Learned` (`wgcsl.py:65-74`, `137-143`; `quasimetric.py:56-58`;
  `quasimetric_model.py:45-48`): after a rename, loading by path fails loudly. The buffers are not the whole
  experience: the ring keeps the last `buffer_steps` = 50,000 steps (`wgcsl.py:52`, `87`), and the trajectory buffer
  stores neither commanded goals nor resets (`gcsl.py:205-211`, `225-230`).
- **Cost in this code.** About 30 lines to dump and load by path. `train` gets a way to start from a given `Learner`
  and step (`gcsl.py:434-437`). A continued run is a new record that names its parent. Readers of networks
  (`gcsl_video.py:59-67`, `wgcsl/value_function.py`, the probes' check scripts) read by leaf path, or keep
  `load_checkpoints` on a regenerated snapshot file.

J6. The experience stream comes out of the shared loop, in the shape the human session already has.

- **What it is.** `collect` has, at every environment step, the position, the action, the commanded goal and the
  reset flag. `advance` hands them back next to the learner, `train_between` becomes a scan that returns the
  segment's stream, and the Python loop appends it at each evaluation boundary to the run's experience file:
  `positions (steps, environments, 2)`, `actions`, `resets`, and the goals once per trajectory. The human session
  stores the same things under `training` (start, positions, actions, resets) and `runs` (start, goal, positions,
  actions): one schema for both, "a session is a run whose learner is a person". The agent's evaluation rollouts
  could be stored in the `runs` shape as well. Since training is not repeatable to the bit, the stream is the only
  exact account of what an agent saw; at a few megabytes it can count as lasting or as large, as a setting.
- **Where it comes from.** The Minari dataset standard: episodes of observations, actions and end flags, collected
  by a wrapper around the environment (https://minari.farama.org/content/dataset_standards/; my search did not
  confirm the library's licence, and the layout can be followed without the library); RLDS (Apache-2.0;
  https://github.com/google-research/rlds); `jax.lax.scan`
  (https://docs.jax.dev/en/latest/_autosummary/jax.lax.scan.html).
- **Facts it rests on.** All four parts exist in one place, `gcsl.py:321-329`, and collection is the same code for
  every method: a method supplies only `make_buffer` and `make_weighting` (`gcsl.py:279-280`), so the stream needs
  no work per method. `collect` runs inside `fori_loop` under `vmap` over the models (`gcsl.py:424-428`), so nothing
  leaves the GPU between evaluations today. The segments grow by a constant factor; the longest is about 6.5 % of
  the run (`gcsl.py:376`), 13,000 of 200,000 steps. A raw step is 25 bytes (three pairs of float32 and a flag): 5 MB
  per model for 200,000 steps, less with goals per trajectory. Actions are stored as grid indices for the discrete
  head and as vectors for the continuous one (`gcsl.py:143`, `155`). At a reset the outcome of the step is replaced
  by the new start (`env.py:83-87`). The human record: `run.py:189-190`, `196-207`; its positions are per sub-step
  in real-time play (H-README:37). `review.py` computes coverage and blocked moves from such a record
  (`review.py:232-259`). Evaluation is reduced to two means per model (`gcsl.py:389-390`). Positions trace the free
  space of a layout (H-README:22), so a stream is as sensitive as the map; `main` refuses unplayed layouts
  (`gcsl.py:576`) but `train` has no such check (`gcsl.py:412-420`) and probes call `train` directly (probe:193).
- **Cost in this code.** `collect` and `advance` return one more value (about 10 lines), `train_between` scans (about
  5), the loop appends (about 10); a transfer of at most a few hundred kilobytes per segment and model. The effect
  on compile time and step time has to be measured. A reader that gives a session and a training run as the same
  `Recording` (`review.py:86-95`) is extra.

J7. An existing tracker behind the one loop.

- **What it is.** `train` calls a tracking library at three places: the start (parameters from `asdict(config)`;
  tags for kind, method and layout number), each evaluation (scores at `step`), the end (files as artifacts). The
  tool's run ID is the reference; its interface gives the live curves and the search.
- **Candidates, all free for private local use.** MLflow (Apache-2.0): local SQLite store and `mlflow ui`, an
  artifact folder per run (https://mlflow.org/docs/latest/ml/tracking/). Aim (Apache-2.0): a local `.aim` repository
  with an interface for comparing curves (https://github.com/aimhubio/aim). trackio (MIT): an interface like Weights
  & Biases', local SQLite, a local dashboard (https://huggingface.co/docs/trackio). Sacred (MIT): a file observer
  writing `config.json`, `run.json`, `metrics.json`, the captured output and deduplicated source copies; no
  interface of its own (https://sacred.readthedocs.io/en/stable/observers.html).
- **Facts it rests on.** The project has six dependencies and no tracker (`pyproject.toml:5-12`); none of these
  tools is installed. The loop has one point per evaluation where the scores are host values (`gcsl.py:438-445`),
  so three call sites cover every method and variant. Scores are a list of one value per model (`gcsl.py:439`): a
  tracker run per model, or metric names per model. Probes write JSON of their own shape (probe:224-229) and several
  result files per folder (`timing/*.json`, `*.log`): artifacts, or metrics defined per probe. A human session is
  one JSON artifact with scores per block. Trackers take the code's identity from a git commit, which is empty
  here; Sacred's source copies are the exception. Whatever is logged is shown by the tool, so the blindness check
  has to come before the first call: `main` has it (`gcsl.py:576`), `train` does not. The tool's store would sit in
  the snapshotted `/home` unless placed elsewhere, and its database would be part of the lasting record. Making
  outputs again (R18) and continuing (R13) are not functions of these tools.
- **Cost in this code.** One dependency (MLflow and trackio bring many of their own; Sacred few; wheels for Python
  3.14 to be checked for each); about 20 lines in `train` and `main`. `plot` and the videos either keep reading the
  JSON files next to the tracker, or ask the tracker.

J8. Study files: the record is written before the run, and runs are targets made when missing.

- **What it is.** A comparison is written down first, as a small declarative file (`studies/<name>.toml`): entries
  of method module, the settings that differ from the defaults, seeds and layout numbers. A runner makes every entry
  whose outputs are missing, as `make` builds targets; curves go next to the study, large outputs to a cache. The
  study with its curves is the lasting record; a run is referred to as `<study>#<entry>` with a realisation number.
  README tables are rendered from a study by a script that also names the reduction ("mean of the last five
  evaluations, as a part of one step"), so a reported number has a recorded derivation. What is kept follows from
  where a run stands: entries of a study stay, runs outside any study are throwaway. A probe is a study whose
  entries name a probe script; a human session is an entry that can only be made by playing.
- **Where it comes from.** Snakemake's rules and targets (MIT; https://snakemake.readthedocs.io/); DVC pipelines and
  `dvc repro` (https://dvc.org/doc/user-guide/pipelines); Hydra's multi-runs (MIT; https://hydra.cc/docs/intro/);
  preregistration (https://www.cos.io/initiatives/prereg); `make`
  (https://www.gnu.org/software/make/manual/make.html). The standard library's `tomllib` reads the file.
- **Facts it rests on.** The runs behind a README table are named in prose only: "the same, another seed", "the
  stored run", "the curves of the other runs in the table above are not kept" (Q-README:29-34, 36, 57, 61). A shell
  loop is the only machine-readable list of a comparison (`timing.sh.txt:6-8`: nine variants, one output each). The
  reductions behind README numbers are done by hand or in throwaway code; `run.py:374` is the one place in the code
  that computes "steps wasted". Every setting is already a command-line flag generated from the dataclass
  (`gcsl.py:570-572`) and settings can be rebuilt from a dictionary (`gcsl_video.py:63`), so an entry is a module
  and a few overrides. Folder names given to `--results`, such as
  `discounted-relabelling-only/random-actions-environment-goals`, are today's hand-made names of variants
  (`gcsl.py:577-581`). The temporary rule "one model, 8 environments and layout-02 only" (vault rules) is a default
  for all current studies that is held in instructions, not in a file. `play.py:45-47` already works out which
  conditions of a layout are left to play. `plot` takes "every version trained" from fixed names and the latest
  human session by sort order (`gcsl.py:514-515`, `496-498`).
- **Cost in this code.** A runner of about 100 lines (read the file, import the module, build the settings, call
  `train`, write) or a dependency on Snakemake; a table renderer or checker of about 50 lines; a change of habit:
  the study is written or extended before anything runs, and README tables are generated or checked, not typed.

## Other titles

- J9. One SQLite catalogue (standard library `sqlite3`): a row per run, a metrics table appended per evaluation; a
  run is found by query, never by path.
- J10. One line per run in an append-only `runs.jsonl` at the project root (ID, time, command line, settings, code
  hash, final scores, where the outputs are); nothing else changes.
- J11. Make training repeatable to the bit (deterministic GPU operations or runs on the CPU), so a run is a pure
  function of its recipe and no output needs keeping (https://openxla.org/xla/determinism).
- J12. Networks stored as exported functions: `jax.export` of `policy_outputs` and `time_to_goal` with the weights
  as inputs, callable after the method's code has changed, within the documented six-month window
  (https://docs.jax.dev/en/latest/export/export.html).
- J13. Two tiers by the filesystem: records in the project, large outputs under the same ID in a btrfs subvolume or
  `~/.cache`, which snapshots of `/home` do not descend into.
- J14. Remake as a test: making outputs again compares the new curves with the recorded ones against the recorded
  spread between seeds, and the record holds the conclusion as a check ("ends below 10 % wasted").
- J15. Throwaway by default, kept by an act: every run lands in a store that expires by age or size;
  `keep <id> "why"` moves its record to the lasting side; human sessions are born kept.
- J16. Kept because cited: a collector removes every run that no README, remark or study refers to, with the
  documents as roots.
- J17. Lineage links only: each record names its parents (continued from, remade from, probe of, compared with), in
  the style of W3C PROV (https://www.w3.org/TR/prov-overview/); identity and storage stay as they are.
- J18. Run cards in the notes vault: one Markdown file with front matter per run under
  `~/Cboost/Notes/multivariate-gaussian-interpolation/runs/`, read and annotated like the other notes.
- J19. Thin, don't delete: a kept run keeps every k-th of its 81 network snapshots (or the first, last and best);
  the rest are made again on demand.
- J20. A recording environment: the `gcrl_maze` package offers a recording `step` whose log is the experience of
  agent and person alike, so a later environment brings its own recorder.
- J21. The log is the record: the printed lines (step, both scores, seconds: `gcsl.py:442-445`) are kept under a
  header with the command line and settings, and parsed when needed, as `timing.sh.txt:10-13` already does.
- J22. A filesystem copy per run: `cp --reflink` of the source tree under the run's ID (btrfs only); the code is
  captured without any tool.
- J23. A hosted tracker in offline mode (Weights & Biases, personal tier): unlikely here, since run data would go
  to a third party and the service is not open source.
- J24. Runs as research objects: a kept run is packed as an RO-Crate (a metadata file next to its files) for
  archiving or handing on (https://www.researchobject.org/ro-crate/).

## Facts

Things about how runs are stored or made today that the brief's context does not mention and that could matter.

1. **A run's identity is its path, and its file says nothing about what made it.** The result JSON has the keys
   `layout`, `config`, `steps`, `curves` (and `best_of_grid` for discrete actions): no method, script, date or code
   (`gcsl.py:449-453`; `quasimetric/results/layout-02_continuous.json`, 4.9 KB, 31 settings). The method is implied
   by the folder (`Method.results`, `gcsl.py:276`), a variant by the folder name given to `--results`
   (`gcsl.py:577-581`). A `Method` has a display name only (`gcsl.py:275`).
2. **The default folders hold whichever run came last.** `quasimetric/results/layout-02_continuous.json` holds a run
   with 1 model and 8 environments. The READMEs cite numbers from runs that no longer exist: "from runs whose
   checkpoints are not kept" (Q-README:36), "(one run, not stored)" (Q-README:53), "The run stored there was made
   again on 2026-11-22 … the curves of the other runs in the table above are not kept" (Q-README:57), "their
   checkpoints were not kept" (W-README:291).
3. **Nothing reaches the disk before the end.** The 81 snapshots are collected in memory (`gcsl.py:440`) and written
   after training (`gcsl.py:601-602`); an interrupted run leaves nothing, and the printed lines (`gcsl.py:442-445`)
   are the only live signal.
4. **Probes go around `main`.** They call `gcsl.train` directly (probe:193), so they skip the settings checks
   (`gcsl.py:585-597`), the blindness check (`gcsl.py:576`) and the save. They patch `gcsl.py` in memory
   (probe:28-36), fix the layout in the script (probe:86), write JSON of their own shape (probe:224-229) and mostly
   drop the networks. There are 15 probe scripts in 11 probe folders; one folder also holds a shell driver and logs.
5. **The human baseline's results folder is the blindness gate.** `require_played` (`gcsl.py:553-559`), `play.py:41-42`
   and `review.py:98-124` all test for files named `<layout>_<condition>_*.json` there, and the figures take the
   latest session by sort order (`gcsl.py:496-498`). Those file names are an interface: moving or renaming sessions
   changes what is allowed and what is drawn. A session file holds positions that trace the layout's free space
   (H-README:22), also for a layout played in one condition only.
6. **A human session is saved once, at the end, and can be lost.** Nothing is saved unless one evaluation run was
   finished (`run.py:358-360`), and an error during play skips the save (`run.py:436-443`). The file holds the
   settings and every position and action (70 to 87 KB) but no code identity. Generated mazes are named by seed
   (`run.py:411-413`).
7. **What is stored cannot be continued.** Optimiser states, buffers, environment state, the random key and WGCSL's
   advantage queue are not saved (`gcsl.py:440-441` against `110-118`). The evaluation steps and the buffer sizes
   depend on `config.steps` (`gcsl.py:371-377`, `218`; `wgcsl.py:87`).
8. **Not everything that shapes a run is a setting.** Constants sit at module level (`wgcsl.py:130-134`,
   `quasimetric.py:44-45`). Readers rebuild the settings with `method.config(**stored)` (`gcsl_video.py:63`): a
   setting added later takes its new default for old files, and a removed or renamed one makes old files fail.
9. **The same seed gives other numbers for two stated reasons.** Code changes alter the random stream ("the same
   settings now give other random numbers", G-README:60), and runs of unchanged code differ ("as runs with the same
   seed do in the other experiments", Q-README:50). What I read does not name the cause of the second. About 8 s of
   every run is compilation (Q-README:163).
10. **Only means are kept of the evaluation.** Per model and evaluation, the mean over 200 runs (`gcsl.py:389-390`,
    `439`); the paths are computed again from the networks by the videos (`gcsl_video.py:78-87`). README numbers are
    further reductions of the curves ("last five evaluations", shortfall over step length) that no file records.
11. **Storage and machine.** Results take about 10 GB (`wgcsl` 7.7, `gcsl` 1.9, `quasimetric` 0.44 GB; the human
    baseline 2.6 MB), in 158 result JSON files and 39 checkpoint files; 665 GB of the disk are free. The filesystem
    is btrfs with zstd compression, and snapper keeps snapshots of `/home` (`/home/.snapshots`), so the checkpoint
    files are in those snapshots today. Checkpoints are uncompressed float32 (`np.savez`, `gcsl.py:473`), arrays of
    shape (evaluations, models, …). One GPU with 8 GB.
12. **Tools at hand.** The environment runs Python 3.14.9 (standard library: `sqlite3`, `tomllib`, `uuid.uuid7`,
    `compression.zstd`); `uv.lock` pins jax 0.12.0.1, numpy 2.5.5 and optax 0.2.9. `git`, `sqlite3`, `snapper` and
    `btrfs` are installed; DataLad, DVC, MLflow, Snakemake and DuckDB are not.
13. **Derived outputs are not tied to a run.** The figure, three videos per layout (1.7 to 5.8 MB each for
    `layout-02`) and the value-function files are written under fixed names next to the results (`gcsl.py:604`,
    G-README:90-92) and replaced with them.
14. **Two lines of `experiments/README.md` are out of date** (line 3: every experiment has a `run.py`; line 8: no
    result recorded yet for the maze). Not urgent; it shows that summaries are kept by hand.

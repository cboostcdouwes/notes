# r1-field: options from machine-learning and scientific-computing practice (letter F)

Lens: how the field itself records experiments. Written blind to the project: only the brief was read, no project
file or code. Nothing here is ranked or judged; pitfalls are reported as the sources state them.

How to read the tool notes: "checked" means a search on 2026-11-22 returned it (source URL given); "from memory"
means it was not confirmed in this search and should be checked before it is relied on.

## Reformulations

**In the lens's own terms.** The field calls this *experiment tracking* plus *artifact management*: each run gets an
identity, its inputs (config, seed, code version, environment) are captured, its metrics are streamed, and its
artifacts (checkpoints, datasets) are stored or made regenerable. The reproducibility literature splits the goal
into *repeatability* (same team, same setup, same result), *reproducibility* and *replicability* (ACM badging
terms); the brief's "same conclusions, numbers may differ" is the replicability end, which deep-RL practice treats
as a statistical statement over seeds, not a property of one run.

**Names the problem has in neighbouring fields that serve the same purpose:**

| Field | What it calls this | What it keeps |
|---|---|---|
| ML engineering | experiment tracking, run registry, model registry | params, metrics, artifacts per run ID |
| Computational science | retrospective provenance capture, simulation management | command, inputs, outputs, code version per execution |
| Scientific workflows, build systems | derived-data management, memoization, rebuildable targets | the recipe and its input hashes; outputs are a cache |
| HPC simulation | checkpoint/restart files, restart reproducibility, scratch purge policy | restart state on a rotation; scratch is deleted by age |
| Offline RL | dataset collection, replay logging | episodes of observations, actions, rewards, with environment metadata |
| Research data management (FAIR) | research object packaging, persistent identifiers | a self-describing package with a resolvable ID |
| Wet lab | lab notebook, sample tracking (LIMS) | a dated entry per experiment, a barcode per sample |
| Games, systems debugging | demo files, deterministic replay, record-and-replay | the seed and the input stream; state is re-simulated |
| Scientific publishing | reproducible article, executable paper | every figure and number is produced by a script in the build |
| Statistics of RL evaluation | run-to-run variance, seed sensitivity, interval estimates | a group of seeds and an aggregate with uncertainty |

**Wider.** How does a one-person research project keep an unbroken chain of evidence from a written claim to a
number, to the run or runs behind it, to the code and settings that made them, when most of what a run produces is
too large to keep?

**Narrower.** Which files does the one shared training loop write, under what name, at which moments, and which of
them are declared lasting and which regenerable?

**Inverted (the need goes away).** (a) Runs are never referred to: every reported number is a build target that is
recomputed from a pinned recipe, so there is nothing to find or keep but recipes. (b) Training is made bit-exact, so
a run *is* its seed and settings and nothing else needs recording. (c) The unit that lasts is the experiment (a
question answered over several seeds), and single runs are disposable members of it.

## Titles (all, before working out)

1. Plain self-describing run directory, append-only logs, index by scanning
2. Local tracker with a database store (MLflow, Trackio, Aim)
3. Parameter-addressed workspace: the ID is the hash of the settings (signac)
4. The run is a version-control commit with a rerun record (DataLad run, DVC experiments)
5. Outputs and reported numbers as cached build targets (Snakemake, redun, joblib, showyourwork)
6. The experience log is the primary record, in an offline-RL dataset standard (Minari, RLDS)
7. Bit-exact deterministic replay: seed plus input trace is the whole record
8. The experiment, not the run, is the lasting unit: seed groups with interval statistics (rliable practice)
9. Standard provenance package per run (Workflow Run RO-Crate, W3C PROV)
10. Launcher-wrapped lab notebook: the tool runs the command and logs it (Sumatra, Guild AI)
11. Observer pattern inside the script (Sacred with FileStorageObserver)
12. Config-snapshot output directories and sweeps (Hydra)
13. One embedded analytic database for all runs instead of files (SQLite, DuckDB, Parquet; SQLTrack, xetrack)
14. TensorBoard event files as the streaming format and live view (tensorboardX)
15. Checkpoint rotation and tiers: keep last-k, best and milestones (Orbax CheckpointManager; HPC restart rotation)
16. Code-independent network export (safetensors or npz of named arrays plus architecture config; jax.export)
17. Self-contained capsule: a copy of the code and a locked environment inside every run (DeepDIVA, Code Ocean style)
18. Minted persistent identifiers with a resolver (ULID or memorable names, DOI style)
19. Scratch with expiry: runs are throwaway by default and promoted to keep (HPC scratch purge policy)
20. One self-describing container file per run (HDF5, Zarr, NetCDF with global attributes)
21. Hosted tracker used offline or self-hosted (Weights & Biases offline mode, ClearML server)
22. Plain-text research log with run IDs, kept by hand or by the assistant (lab-notebook practice)

The eight worked out below are 1 to 8, chosen for differing mechanism: files, database, content address, version
control, build cache, dataset standard, determinism, statistics.

## Worked-out options

F1. Plain self-describing run directory, append-only logs, index by scanning: no tracking tool; a fixed layout is
the record and any index is derived from it.

- **What it is.** Each run gets its own directory named by a generated ID (timestamp plus short random suffix, or a
  ULID) and never by its settings, so a repeat makes a new directory instead of replacing one. Inside: a manifest
  written at the start (method, full resolved settings, seed, code identity, environment lock, start time, parent
  run if continued), metrics appended line by line as JSON Lines while training runs (so a second process can tail
  them for a live view), a status file written at the end, and a subdirectory for large regenerable outputs that is
  excluded from version control and backups. Finding a run is a scan of the manifests; a query layer (pandas, or
  DuckDB's `read_json` over a glob) is optional and holds no state of its own. Code identity in the field's practice
  is three things together: commit hash, a dirty flag, and the uncommitted diff saved as a patch (or a hash of it);
  commit hash alone is treated as insufficient, and some tools refuse to run from a dirty tree or copy the whole
  source into the run folder instead.
- **Where it comes from.** It is what most single researchers and small RL groups do: Hydra writes a per-run output
  directory holding `.hydra/config.yaml`, `hydra.yaml` and `overrides.yaml` (it records the composed config and the
  overrides, not the code version); CleanRL and the Stable-Baselines3 zoo write per-run folders with saved
  arguments; several small trackers (mtrick, tinytracker, mllogs) are thin wrappers around this layout.
  - Hydra working directory: https://hydra.cc/docs/tutorials/basic/running_your_app/working_directory/
  - CleanRL: https://github.com/vwxyzjn/cleanrl ; SB3 zoo: https://github.com/DLR-RM/rl-baselines3-zoo
  - Commit plus dirty flag plus diff per run: https://arxiv.org/pdf/2609.26178 (appendix A.14),
    https://arxiv.org/pdf/2604.25944 ; abort-or-patch hook: https://www.space.t.u-tokyo.ac.jp/capsula/hooks/capture-git-repo/ ;
    copy of the code per run: https://arxiv.org/pdf/1805.00329 (DeepDIVA)
  - mtrick (per-run directory, `meta.json`, JSONL): https://pypi.org/project/mtrick/
  - DuckDB over files without a server: https://osu-car-msl.github.io/lab-setup-guide/ml-workflows/duckdb-analytics
- **Tools named.** Hydra: MIT, Meta; 1.3 dates from December 2022 and a 1.4.0rc1 exists (checked; final 1.4 not
  confirmed); depends on OmegaConf and antlr runtime (from memory). DuckDB: MIT, active, one self-contained wheel of
  tens of MB with no Python dependencies (from memory). The layout itself needs only the standard library.
- **What it costs.** The schema, the ID scheme, the code-identity capture and the retention rule are all written
  and maintained by the project. No dashboard comes with it. The code-identity part presupposes version control (or
  a source-copy or source-hash fallback). Known pitfalls: schema drift between old and new manifests; scans slow
  down as runs reach the thousands unless an index is cached; a crashed run leaves a directory without a status
  file, which readers have to treat as a state of its own; timestamp-only names collide when runs start in the same
  second; a per-step append with a flush each step is the main source of slowdown and is usually batched.

F2. Local tracker with a database store (MLflow, Trackio or Aim): an existing tracking library is the record, and
its dashboard is the live view.

- **What it is.** The training loop calls a logging API (`log_params`, `log_metric`, `log_artifact` or
  `wandb`-style `init` and `log`); the tool assigns the run ID, stores parameters and metric series in a local
  database, stores or references artifacts, and serves a web UI on the workstation that updates while runs train
  and compares runs side by side. Runs are found by filtering on parameters and tags in the UI or through a query
  API. Tags carry "keep" versus "throwaway". Code identity is recorded as a git commit when a repository exists.
- **Where it comes from.** The mainstream of ML practice.
  - MLflow backend stores: https://mlflow.org/docs/latest/self-hosting/architecture/backend-store/ ; 3.7.0 release
    notes: https://mlflow.org/releases/3.7.0/
  - Trackio: https://huggingface.co/blog/trackio , https://github.com/gradio-app/trackio ,
    https://www.infoq.com/news/2025/09/hugging-face-trackio
  - Aim: https://github.com/aimhubio/aim , storage: https://aimstack.readthedocs.io/en/latest/understanding/data_storage.html
- **Tools named.**
  - MLflow: Apache-2.0, very active (3.x). Since 3.7.0 SQLite (`sqlite:///mlflow.db`) is the default backend; the
    plain-file store (`./mlruns`) is in maintenance mode, and a third-party report says 3.13+ refuses it unless
    `MLFLOW_ALLOW_FILE_STORE=true` is set (checked, the last point only through third parties). Large dependency
    set: Flask, SQLAlchemy, Alembic, pandas, pyarrow and more; `mlflow-skinny` is the reduced package (from memory).
  - Trackio: MIT, Hugging Face (gradio-app), active, versions 0.21 to 0.25 seen in 2026, described as beta with
    possible breaking changes to its SQLite schema. Local-first; data in `~/.cache/huggingface/trackio` unless
    `TRACKIO_DIR` is set; API compatible with `wandb` (`import trackio as wandb`); under 1,000 lines at launch;
    depends on Gradio for the dashboard (checked). Metrics only: no artifact or checkpoint store (from memory).
  - Aim: Apache-2.0; latest tagged release found is 3.28.0 (March 2025), repository pushed April 2026, 4.0 alphas
    on PyPI (checked). Storage is RocksDB per run plus a SQLite file; its own docs say queries slow down with
    thousands of runs and the UI "may get shaky" with thousands of metrics of tens of thousands of steps (checked).
- **What it costs.** A dependency that owns the record's format: the lasting record is a database file plus an
  artifact directory, readable through the tool's API and less so by hand, and a schema migration comes with tool
  upgrades. A UI process to start. Known pitfalls: the tracker records what the code tells it, so "what made it"
  is as complete as the logging calls; code version is a commit hash only, with no capture of uncommitted changes
  in MLflow by default (from memory); the dashboard shows everything logged to anyone who opens it; artifact
  stores grow without a built-in size budget and deleting a run in the UI is a soft delete until a garbage-collect
  command is run (MLflow, from memory); kinds of run that are not "params plus metric curves" (a human session, a
  probe with its own result shape) fit as artifacts and free-form tags.

F3. Parameter-addressed workspace (signac): the run's ID is the hash of its settings, so a run is found by
describing it.

- **What it is.** A "state point" (the dictionary of settings, including seed and method) is hashed to a job ID;
  the job's directory is `workspace/<id>/` and holds the state point as JSON, a small mutable "job document" for
  results and status, and any files. Finding a run is a query on state-point keys (`project.find_jobs({...})`),
  not a path lookup; opening a job with the same state point returns the same directory, so the store has no
  duplicates by construction. Schema changes across many jobs (add a key, rename one) are supported operations that
  move directories to their new IDs. A companion package, signac-flow or its successor row, defines operations and
  their completion conditions per job.
- **Where it comes from.** Computational materials science (Glotzer lab, Michigan), built for parameter-space
  studies of simulations run by small groups on file systems without a database server.
  - https://github.com/glotzerlab/signac , paper: https://arxiv.org/abs/1611.03543 , PyPI: https://pypi.org/project/signac
- **Tools named.** signac: BSD-3-Clause (from memory), maintained; 2.2.0 is the latest version found (checked
  through a mirror, date not confirmed). Pure Python with a very small dependency set (from memory). The ID is an
  MD5 of the JSON-encoded state point and the per-job files are `signac_statepoint.json` and
  `signac_job_document.json` (from memory, not confirmed in this search).
- **What it costs.** The identity rule is the opposite of "making a run again does not destroy an earlier one":
  the same settings resolve to the same directory, so a repeat needs a distinguishing key in the state point (a
  repeat counter, or the code version) and the choice of what belongs in the state point becomes the central
  design decision. Code version is not part of the model unless put there. An ID changes when a setting is added
  to the state point, so outside references need the migration step or a separate stable name. No dashboard and no
  metric streaming. Runs without a natural settings dictionary (a human session) need an invented one.

F4. The run is a version-control commit with a rerun record (DataLad run or DVC experiments): history is the
registry, and large outputs are droppable because the commit says how to make them.

- **What it is.** The command that performs a run is executed through the tool (`datalad run -i inputs -o outputs
  "python train.py ..."` or `dvc exp run`). The tool commits code, settings and small outputs to git and puts a
  machine-readable record (exact command, declared inputs and outputs) in the commit; large outputs go to an annex
  or cache outside git's object store and are represented in git by a pointer with a content hash. `datalad drop`
  or `dvc gc` removes the large content while the pointer and the recipe stay; `datalad rerun <commit>` or
  `dvc repro` makes it again and reports whether the regenerated content matches the recorded hash. The run's
  permanent name is the commit hash (DataLad) or an experiment name on a custom git ref (DVC). DVCLive adds metric
  streaming and plots.
- **Where it comes from.** Neuroscience data management (DataLad, on git-annex) and ML engineering (DVC).
  - DataLad run and rerun: https://handbook.datalad.org/en/latest/basics/101-113-summary.html ,
    https://stamped-principles.github.io/stamped-examples/examples/datalad-run-provenance/ ,
    https://stamped-principles.github.io/stamped-examples/examples/datalad-rerun-actionability/
  - "Huge binary data in annexed files all created via datalad run, reproduced by rerun": https://arxiv.org/pdf/2505.06558
  - DVC stewardship: https://lakefs.io/blog/lakefs-acquires-dvc/ ; experiments: https://dvc.org/doc/user-guide/experiment-management
- **Tools named.** DataLad: MIT, active (man pages at 1.5.0 seen); requires git and git-annex, a separate Haskell
  binary of roughly 100 MB (size from memory). DVC and DVCLive: Apache-2.0; the project moved from Iterative to
  lakeFS (announced late 2025), which states both stay maintained and repositories move to the Treeverse
  organisation (checked); requires git; a large Python dependency set (from memory).
- **What it costs.** Version control becomes a precondition and the unit of work: a clean tree before each run
  (or `--explicit`), declared inputs and outputs for every command, and one commit per run, which for hundreds of
  short runs fills the history with machine commits (DVC keeps experiments off the branch on hidden refs for this
  reason). Known pitfalls: with non-deterministic training a rerun never matches the recorded content hash, so
  every rerun registers as "changed" and produces a new commit; git-annex replaces files by symlinks or pointer
  files, which some programs and editors handle badly; a commit hash as the run name changes under any history
  rewrite; overhead per run is a few seconds of hashing and committing, noticeable against a 12-second run; a human
  session is recorded as a commit of data with no rerunnable command.

F5. Outputs and reported numbers as cached build targets (Snakemake, redun, joblib.Memory, showyourwork): nothing
is "kept"; the large outputs are a cache keyed by the recipe, and a number in a report is itself a target.

- **What it is.** The inverted formulation made concrete. A run is a pure function call `train(method, settings,
  seed)`; a memoizing layer hashes the arguments (and the function's code) to a key and stores the result under it.
  Asking for a result that is absent recomputes it; deleting the cache loses nothing; a cache size limit and
  eviction replace a retention policy. Downstream artifacts (a figure, a table cell, a number in a README) are
  declared as rules that depend on runs, so the dependency graph from number to run exists as code and can be
  walked in either direction. showyourwork is the publishing form: it builds an article from a Snakemake graph,
  links every figure to the script version that produced it, and caches expensive intermediate results with a
  record of their inputs so later builds fetch instead of recompute.
- **Where it comes from.** Bioinformatics workflow engines and scientific Python.
  - joblib on-demand recomputing: https://joblib.readthedocs.io/en/stable/memory.html
  - redun (hashes code and arguments, keeps a call-graph database): https://github.com/insitro/redun
  - Snakemake: https://snakemake.readthedocs.io/
  - showyourwork: https://showyourwork.readthedocs.io/en/stable/snakefile/ , https://showyourwork.readthedocs.io/en/stable/zenodo/
- **Tools named.** joblib: BSD-3-Clause, active, pure Python, no required dependencies; has a
  `cache_validation_callback` for custom invalidation and a `reduce_size` limit (checked for the callback; the
  rest from memory). Snakemake: MIT, active, a large dependency set (from memory). redun: Apache-2.0, insitro,
  SQLite-backed by default (from memory; activity not checked). showyourwork: MIT (from memory), wraps Snakemake
  and LaTeX; maintenance state not checked.
- **What it costs.** The training entry point has to be expressible as a function of its declared inputs, and
  everything else (live viewing, continuing a run, the experience log) sits outside the memoization model and
  needs its own mechanism. Known pitfalls, documented for joblib: the code hash is fragile in both directions (any
  edit to the function source, even a comment, invalidates; an edit to a function it calls does not), mutable or
  unhashable arguments cause spurious misses, and tool upgrades have invalidated whole caches. A cache key is not
  a name a person can cite, and a cache hit silently stands in for "a run", which conflicts with keeping two
  repeats of the same settings unless a repeat index is an argument. With non-deterministic training the cached
  result and a recomputed one differ, so "the number in the report" is whichever was built last.

F6. The experience log is the primary record, in an offline-RL dataset standard (Minari or RLDS): what the agent
or the human did is stored in a format built for it, and everything else hangs off that dataset.

- **What it is.** Every run, training, probe or human session, writes its episodes (observations, actions,
  rewards, terminations, truncations, per-step infos, per-episode seed and options) through a collector into a
  dataset with a versioned ID in a namespace (`maze/method-x/seed3-v0`). Dataset-level metadata carries the
  environment specification needed to rebuild the environment, the algorithm name, the code permalink and free
  fields; episodes can be filtered, sampled and iterated with a standard API. A human gamepad session and an
  agent's training run become the same kind of object, so comparing them and replaying either is one code path.
  Metrics and checkpoints are then secondary: metrics are recomputable from the episodes, and checkpoints are
  regenerable.
- **Where it comes from.** Offline RL (D4RL's successor Minari at the Farama Foundation; RLDS at Google).
  - Minari dataset standard: https://minari.farama.org/content/dataset_standards/ ; DataCollector:
    https://minari.farama.org/api/data_collector
  - RLDS: https://github.com/google-research/rlds
- **Tools named.** Minari: MIT (from memory), Farama Foundation, maintained; stores episodes as groups in
  `main_data.hdf5` or, in newer releases, Arrow (`data_format="arrow"`); metadata at file, episode and dataset
  level; custom per-episode metadata through `EpisodeMetadataCallback` (checked). Depends on Gymnasium, NumPy and
  h5py or pyarrow (from memory). RLDS: Apache-2.0, built on TensorFlow Datasets, so it pulls in TensorFlow; low
  activity (from memory).
- **What it costs.** Minari's collector is a wrapper around a Gymnasium-API environment stepped from Python, one
  transition at a time; a training loop compiled end to end in JAX with vectorised environments does not pass
  through such a wrapper, so the episodes have to be returned from the compiled loop as arrays and written through
  the lower-level dataset-creation call, or the format is adopted without the library. The standard's episode
  model assumes reset-bounded episodes; goal relabelling, resets inside a batch and replay-buffer sampling order
  are not part of it and go into `infos` or side files. Full observations are stored by default, which is where
  the megabytes and any sight of a layout sit. It does not cover settings provenance, live viewing or continuing a
  run, so it is a record of one requirement's data with hooks for the rest.

F7. Bit-exact deterministic replay: make training exactly repeatable, and the record shrinks to seed, settings,
code identity and, for a human, the input trace.

- **What it is.** The game-industry demo-file idea applied to training. Remove the sources of run-to-run
  difference, then a run is fully determined by a few kilobytes: settings, seed, exact code and library versions,
  hardware and flags. Everything else, including every checkpoint, the experience data and any intermediate
  moment of training, is re-simulated on demand and is guaranteed to be the same bytes, so a stored hash of the
  final network proves a regeneration is faithful. Continuing a run is replaying to its end and going on. A human
  session is recorded the way Doom and Quake demos are: the environment seed and the timed gamepad inputs, replayed
  through the environment to recover every position and reset. For XLA on GPU the documented sources of
  non-determinism are compile-time autotuning and operations with non-deterministic kernels (scatter, GEMM,
  convolution); the documented switches are `--xla_gpu_autotune_level=0` and
  `--xla_gpu_exclude_nondeterministic_ops`, the second of which makes compilation fail when an operation has no
  deterministic implementation. Running on CPU is the other route.
- **Where it comes from.** Game replay systems and record-and-replay debugging; in ML, the determinism
  documentation of the compilers.
  - XLA determinism: https://openxla.org/xla/determinism
  - Floating-point non-associativity and reproducibility in HPC and deep learning: https://arxiv.org/abs/2408.05148
  - Input-plus-seed replays and their pitfalls: https://gamesfromwithin.com/back-to-the-future-part-1/ ,
    https://gamedeveloper.com/design/things-that-can-muddle-your-replay-feature ; rr: https://rr-project.org/
- **Tools named.** None to install: XLA flags set through the `XLA_FLAGS` environment variable (the flag names
  above are from the OpenXLA documentation; community posts use a different name, `--xla_gpu_deterministic_ops`,
  so the name has to be checked against the installed version).
- **What it costs.** A speed cost on GPU (the cited 10 to 20 percent figure is anecdotal and unsourced) or the
  move to CPU; possibly a compile error that forces rewriting an operation. Exactness holds only for the same
  code, library versions, hardware and driver: any upgrade or refactor that reorders floating-point operations
  breaks byte equality, after which the stored hash no longer verifies and the guarantee silently degrades to
  "approximately". Examining an old run costs a full rerun of it (seconds to minutes today, more for larger runs),
  and so does continuing it. Replaying a human session requires the environment itself to be deterministic and
  unchanged; a change to the maze code invalidates old input traces unless full state was stored as well.

F8. The experiment, not the run, is the lasting unit: seed groups with interval statistics (rliable practice):
"approximately the same results" is defined and checked at the level where it is true.

- **What it is.** Deep-RL evaluation practice holds that a single run's number is not reproducible in principle
  (seed and hardware noise change it) and that claims belong to a set of runs. The lasting record is therefore an
  experiment entry: the question, the method and settings, the list of seeds, the code identity, and the aggregate
  with its uncertainty (interquartile mean, bootstrap confidence intervals, per-seed final scores, which are a few
  numbers per seed). Individual runs are members addressed as experiment-ID plus seed; their large outputs are
  disposable. A reported number cites the experiment and names the statistic. "Made again with the same
  conclusions" becomes a test that can be run: regenerate the seeds, and check that the new aggregate falls within
  the recorded interval or that the ordering between two methods is preserved. Runs that belong to no experiment
  are throwaway by definition, which gives the keep-or-discard rule without a per-run decision.
- **Where it comes from.** RL evaluation methodology and reproducibility terminology.
  - Henderson et al., "Deep Reinforcement Learning that Matters": https://arxiv.org/abs/1709.06560
  - Agarwal et al., "Deep RL at the Edge of the Statistical Precipice": https://arxiv.org/abs/2108.13264 ,
    library: https://github.com/google-research/rliable
  - Repeatability, reproducibility, replicability: https://www.acm.org/publications/policies/artifact-review-and-badging-current
- **Tools named.** rliable: Apache-2.0, google-research, low activity; depends on NumPy, SciPy, `arch`, matplotlib
  and seaborn (from memory). The statistics are a few dozen lines of NumPy or `scipy.stats.bootstrap` without it.
- **What it costs.** Every result worth citing costs several seeds instead of one (the literature's guidance is
  that three to five are few and intervals are wide at that size), which multiplies compute and disk during the
  run. A single remarkable run (one seed that behaved oddly) is not an addressable lasting object unless the
  member record is kept too. Kinds that are not seed-replicable, a human session above all, do not fit the model
  and need a second kind of record. It says nothing about file layout, live viewing or continuation, so it is a
  rule for what lasts and what a citation means, on top of some storage mechanism.

## Other titles, one line each

- F9. Standard provenance package per run (Workflow Run RO-Crate): each run directory carries an
  `ro-crate-metadata.json` (JSON-LD, Schema.org) with a `CreateAction` naming the tool (`instrument`), inputs
  (`object`) and outputs (`result`); Process Run Crate 0.5 is the simplest profile; `ro-crate-py` is Apache-2.0
  (from memory). https://www.researchobject.org/workflow-run-crate/profiles/process_run_crate/ ,
  https://w3id.org/ro/wfrun/process/0.5 , https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11386446/
- F10. Launcher-wrapped lab notebook: `smt run` or `guild run` executes an unmodified script and records command,
  parameters, code version, dependencies and output files. Sumatra: BSD-2-Clause, 0.8.0 in April 2025 and 0.8.1
  after it, Python 3.9+, Django dependency, low activity. Guild AI: Apache-2.0, last release 0.9.0 in February
  2023, appears unmaintained. https://sumatra.readthedocs.io/en/latest/releases/0.8.0.html ,
  https://github.com/open-research/sumatra , https://pypi.org/project/guildai/
- F11. Observer pattern inside the script (Sacred, `FileStorageObserver`): a decorator captures config, seed,
  source files, package versions, host info and stdout into numbered run folders; MIT (from memory), latest
  release found 0.8.5, low activity. https://sacred.readthedocs.io/en/latest/observers.html ,
  https://github.com/IDSIA/sacred
- F12. Config-snapshot output directories and sweeps (Hydra): covered inside F1 as the commonest layout; alone it
  records configuration and overrides only. https://hydra.cc/docs/tutorials/basic/running_your_app/working_directory/
- F13. One embedded analytic database for all runs instead of files: rows in SQLite, DuckDB or Parquet are the
  record (SQLTrack, xetrack, WaddleML), queried with SQL. https://sqltrack.readthedocs.io/en/latest/rant.html ,
  https://pypi.org/project/xetrack/ , https://github.com/briangu/waddleml
- F14. TensorBoard event files as the streaming format and live view: tensorboardX (MIT) writes them without
  TensorFlow; TensorBoard (Apache-2.0) reads a directory tree of runs live; concurrent writers to one directory
  confuse the reader. https://github.com/lanpa/tensorboardX
- F15. Checkpoint rotation and tiers: keep the last k, the best by a metric and fixed milestones, delete the rest
  as training goes (Orbax `CheckpointManager`, Apache-2.0, active); the HPC restart-file habit.
  https://orbax.readthedocs.io/en/stable/guides/checkpoint/v1/training.html
- F16. Code-independent network export: store parameters as a flat map of named arrays (safetensors, Apache-2.0,
  or `.npz`) plus an architecture description, restore without a target structure, or export the forward function
  itself with `jax.export` (StableHLO) so an old network runs without the old Python code. Orbax and Flax restore
  against a target that "should have the same structure as the saved checkpoint", which is where code changes
  break loading. https://orbax.readthedocs.io/en/latest/guides/checkpoint/v1/checkpointing_pytrees.html ,
  https://github.com/huggingface/safetensors , https://docs.jax.dev/en/latest/export/export.html
- F17. Self-contained capsule: a copy of the source tree and a locked environment (`uv.lock` or `pip freeze`)
  inside every run, so a run is rerunnable without version control. https://arxiv.org/pdf/1805.00329
- F18. Minted persistent identifiers with a resolver: runs get an opaque ID (ULID, or a memorable generated name
  as hosted trackers do) and a small lookup resolves ID to current location, the DOI pattern in miniature.
  https://www.researchobject.org/workflow-run-crate/profiles/
- F19. Scratch with expiry: every run lands in a scratch area purged by age or size, and lasting ones are promoted
  by an explicit act, the HPC scratch-filesystem policy. (No single source; standard HPC centre practice.)
- F20. One self-describing container file per run: an HDF5 or Zarr file with settings and provenance as global
  attributes and metrics, experience and networks as datasets, the climate-model NetCDF habit.
  https://minari.farama.org/content/dataset_standards/ (same attribute mechanism)
- F21. Hosted tracker used offline or self-hosted: Weights & Biases client is MIT with an offline mode, its server
  is proprietary; ClearML SDK is Apache-2.0 and its server SSPL, a multi-container deployment (licences from
  memory, not checked). https://github.com/wandb/wandb , https://github.com/clearml/clearml
- F22. Plain-text research log with run IDs: a dated notebook entry per experiment that cites run IDs and states
  what was concluded, kept by the researcher or the assistant, the wet-lab notebook carried over.
  https://www.the-scientist.com/electronic-lab-notebooks-are-failing-researchers-could-ai-tools-help-74024

## Limits of this search

- About 25 tool calls; the PyPI page for signac failed to load, so its version, licence and ID rule are partly
  from memory.
- Licences and dependency sets marked "from memory" were not confirmed today.
- The MLflow 3.13 file-store refusal rests on third-party reports, not on MLflow's own release notes.
- Sacred's and showyourwork's current maintenance state was not established.

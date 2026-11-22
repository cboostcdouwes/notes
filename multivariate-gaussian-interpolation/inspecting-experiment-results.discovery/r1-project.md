# Round 1, generator C: the problem's own field, with the project in view

Lens: reinforcement-learning and machine-learning research practice, read against what
`experiments/gcrl-maze` already has for storing and looking at results. Nothing below is ranked. Line counts,
sizes and times under "Costs" are my estimates unless a source is given; "unverified" marks what I did not check.

## Reformulations

**In the lens's own terms.** Post-hoc analysis of checkpointed training runs: a run leaves settings, score curves
and its networks at 81 moments; a *probe* turns networks plus the environment's ground truth into a picture or a
table; the open parts are a catalogue of runs, probes that do not know the method, and a way to name one view
(kind, run, moment, goal, state) that a person and an assistant can both follow.

**What the furthest corners of the field call it** (same purpose, other mechanism):

| Subfield | Its name for the problem | Its usual answer |
|---|---|---|
| MLOps | experiment tracking, run comparison | a tracker with a run table and per-step media (Aim, MLflow, TensorBoard, trackio) |
| Robotics | log replay, telemetry visualisation | record everything on timelines, scrub it in a viewer (rosbag/MCAP, Foxglove, Rerun) |
| Simulation science (HPC) | in situ against post hoc visualisation; image databases | render views over a parameter grid while the data exists, browse the images later (Cinema) |
| LLM evaluation | eval-log viewing, transcript inspection | one self-describing log per run, a viewer for the person, a reading API for scripts (Inspect View) |
| RL interpretability | policy debugging, visual analytics for RL | linked viewports of trajectories, distributions and tensors (Vizarel, RLInspect) |
| Data-centric ML | error analysis, slice discovery | mine the worst cases instead of looking at everything |
| This project | review, probe, check script | `review.py summary / figures / replay`; `results/probes/*.py.txt`; "another view of the training needs no new training" (`gcsl/README.md:64`) |

**Wider.** How do the person and the assistant keep one addressable body of evidence per run, so that a sentence
in a README, a remark and a picture all point at the same run, moment, goal and state?

**Narrower (a).** Given only a run's files, how does one get, without knowing the method, a callable
`act(state, goal)` and whichever learned functions the method has (`f(state, goal)`, `m(state, action)`)? With that
and a name for a view, any front end is thin.

**Narrower (b).** Where is the result? A regenerable index of runs: settings, final scores, what is stored for each.

**Inverted (the need goes away).** (i) Every run reports its own failure modes, with its worst cases picked for it,
so nobody has to go looking. (ii) A run takes 12 to 40 s (`gcsl/README.md:54`), so nothing derived is kept and
every view is recomputed from settings on demand. (iii) The assistant does the looking, and the person reads
conclusions with the evidence linked.

## What the project has today (every option meets these)

- **One store format, written by one function.** `<layout>_<actions>.json` (layout, config, steps, curves) and
  `_checkpoints.npz` with every network as arrays of (evaluations, models, ...) under a name prefix
  (`gcsl.py:449-450`, `gcsl.py:465-486`). The JSON does not name the method that made it.
- **Views exist as three kinds of script.** `plot` for curves (`gcsl.py:512-550`); three videos with fixed runs,
  goals and model (`gcsl_video.py:45-51`, `:315-346`); and check scripts that each rebuild the config and know one
  method's network names and how to call them (`wgcsl/value_function.py:67-88`,
  `quasimetric/results/probes/model/model_check.py.txt`, `.../probes/time_to_goal_check.py.txt`). The policy part is
  already method-independent (`gcsl_video.py:54-95`, `gcsl.greedy_policy`); the learned distance, value and model
  are not: `Method` (`gcsl.py:273-280`) has no field that says how to call them.
- **Drawing helpers are matplotlib** (`packages/gcrl-maze/src/gcrl_maze/plotting.py:10-50`), and `gcsl.py:65`
  selects the `Agg` backend at import.
- **The layout rule has one gate**, `gcsl.require_played` (`gcsl.py:553-559`); every script that takes a layout
  calls it. A tool that only shows stored files is covered as long as nothing is computed without the gate.
- **A run writes its files once, at the end** (`gcsl.py:598-602`); during training only a line per evaluation is
  printed (`gcsl.py:442-445`). Seeing a run as it comes in needs a write per evaluation, whatever shows it.
- **The data the agent saw is not stored**: only networks and curves. The whole stream of a 200,000-step run
  (position, action, commanded goal, reset flag) would be about 6 MB per model.
- **Most stored runs are curves only**: 158 JSON files against 39 checkpoint files; probe outputs have their own
  JSON shapes. Checkpoints are 90 to 330 MB per run file; the results total about 10 GB.
- **Start-up costs seconds**: about 8 s of every run is compilation (`quasimetric/README.md:163`), so a view from a
  fresh process is slow and one from a warm process is fast.
- **Installed**: matplotlib 3.11, pygame-ce, numpy, scipy, pillow; Python's `tkinter`, `sqlite3`, `http.server`;
  ffmpeg, kitty, Firefox, Chromium, VS Code. Not installed: tornado (matplotlib's WebAgg needs it), Jupyter, any
  tracker, fzf, mpv. The desktop is sway on Wayland.

## Worked-out options

C1. **One command, small multiples.** A single script, `look.py KIND RUN [RUN ...] --at STEP ... --goal ... --state ...`,
that draws one figure whose rows and columns are the lists given (runs by moments, or runs by goals), and prints
the same content as a table with `--table`.
- *What it is.* Each kind of view is an entry in a table of callables in the style of `Buffer`, `Weighting` and
  `Method` (`gcsl.py:194-203`, `:256-264`, `:273-280`): what it needs from a run (a policy; a function of state and
  goal; a model), how to compute its arrays, how to draw them on an axis, how to print them. A method says once
  how its networks become those functions. The command line is the view's name: the person types it, the
  assistant runs the identical line and reads the PNG or the table, and `--remark "text"` appends the line, the
  text and the image path to a remarks file. A run index is a second subcommand in the manner of
  `review.py summary` (`human-baseline/review.py:357-397`).
- *Where it comes from.* The project's own pattern: argparse built from the config (`gcsl.py:562-575`),
  `--results DIR --steps ... --model N` on the check scripts (`wgcsl/value_function.py:57-63`), subcommands in
  `review.py:460-470`.
- *Costs.* About 300 to 500 lines, most of it moved out of `gcsl_video.py` and the three check scripts; no new
  dependency. Every look starts a process and pays the compilation again (several seconds), so browsing is slow
  and typing coordinates for a goal or state is not pleasant. No live view of a running run beyond re-running the
  command, and that only once runs write per evaluation. Works over ssh as it is.

C2. **A live window from the figure code.** The same view table, shown in a matplotlib window with widgets: a
slider for the moment in training, buttons for runs and kinds, left click on the map sets the goal, right click
the state.
- *What it is.* One function draws a view description onto a figure. Under the `TkAgg` backend it is interactive
  (`matplotlib.widgets.Slider`, `RadioButtons`, `CheckButtons`, `button_press_event` with data coordinates); under
  `Agg` it writes the PNG the assistant reads. A key saves the current view description, its PNG, its numbers and
  a typed remark. Redraws can reuse the blitting already written for the rollouts video
  (`gcsl_video.py:221-251`). A timer re-reads a run in progress.
- *Where it comes from.* https://matplotlib.org/stable/gallery/widgets/slider_demo.html and
  https://matplotlib.org/stable/users/explain/figure/event_handling.html; `tkinter` is importable in the project's
  environment (checked), and all drawing helpers are already matplotlib (`plotting.py:10-50`).
- *Costs.* About 400 to 600 lines; no new dependency. `gcsl.py:65` forces `Agg` at import, so the backend choice
  has to move or be switched. Tk under sway is unverified. Text entry in a matplotlib window is crude. Not usable
  from another machine without X forwarding (the browser backend needs tornado). matplotlib redraws of several
  panels take tens of milliseconds each, so dragging feels stepped, not smooth.

C3. **An image database, browsed with someone else's viewer.** After a run (or at each evaluation), render every
kind of view over a fixed grid of moments, goals and states into image files, with one CSV that lists the
parameter values of each image.
- *What it is.* The Cinema "Spec D" layout from simulation science: a folder with `data.csv` (one row per image:
  method, run, seed, step, goal, kind, score, file path) and the images. Cinema:Compare shows several databases
  side by side with sliders tied to the CSV's columns; Cinema:Explorer adds parallel coordinates over the columns
  for finding runs. Both are static browser pages, so `python -m http.server` serves them, also to another
  machine. The assistant reads the same CSV and the same PNGs. A new kind of view is a new column value and more
  files. Remarks would be a column or a side file keyed by the CSV row; the viewers have no remark feature that I
  know of.
- *Where it comes from.* https://cinemascience.github.io/ and https://cinemascience.github.io/viewers.html; the
  known limit, "post hoc visualization is limited to the elements in the database", is stated in
  https://arxiv.org/pdf/2010.03936.
- *Costs.* The person chooses among sampled goals and states, not any. Storage: about 80 moments by 12 goals by
  5 kinds is some 5,000 images per run, 150 to 300 MB at ordinary sizes, so tens of GB over hundreds of runs
  unless only some runs get the full grid. Rendering 5,000 matplotlib figures takes minutes per run, against a
  run of 12 to 40 s. Whether the Cinema viewers are maintained is unverified. About 200 lines for the writer.

C4. **The address is the view.** A small local server keeps JAX warm and answers
`/view/<kind>?run=...&at=...&goal=x,y&state=x,y` with a PNG, and the same path ending in `.json` or `.csv` with
the numbers.
- *What it is.* Python's `http.server` plus matplotlib's `Figure` used without pyplot, as matplotlib's own
  web-server example does. One HTML page with plain controls builds addresses: drop-downs filled from a run index,
  a slider for the moment, a click on the picture for goal or state, a grid of several addresses for side by side.
  The assistant fetches the identical address with `curl`. A remark is the address plus text, posted to the server
  and appended to a file; pasting an address into the chat does the same job without any build. Bound to
  localhost; another machine reaches it through an ssh tunnel. A run in progress is one more address that the
  page polls.
- *Where it comes from.* https://docs.python.org/3/library/http.server.html and
  https://matplotlib.org/stable/gallery/user_interfaces/web_application_server_sgskip.html; the view functions are
  those of `gcsl_video.py:78-95` and the check scripts.
- *Costs.* About 500 to 800 lines including the page; no dependency. The first request for each method and shape
  compiles for seconds; later ones take about the time of a matplotlib render (0.1 to 0.5 s), so a slider steps,
  it does not glide. A long-running process holds GPU memory beside training on the one 8 GB card. Checkpoint
  files of 90 to 330 MB have to be cached or memory-mapped per run. Hand-written HTML and JavaScript are a second
  language in a Python project.

C5. **Record on timelines, scrub in a robotics viewer.** Each run also writes a Rerun recording: paths as line
strips, action fields as 2-D arrows, learned and true distance as images, scores as scalars, all stamped with the
training step (and the step within a rollout as a second timeline).
- *What it is.* Rerun's viewer supplies the time slider, panning and zooming, layouts saved as blueprints, and
  several recordings open at once with the same layout for comparison; it streams while a run trains and has a
  web viewer for another machine. The assistant does not see the viewer; it reads the recording back as dataframes
  on a chosen timeline. A new kind of view is a new entity path.
- *Where it comes from.* https://rerun.io/docs/howto/get-data-out, https://rerun.io/docs/reference/dataframes
  and https://github.com/rerun-io/rerun/blob/main/docs/content/concepts/blueprint.md.
- *Costs.* One dependency (`rerun-sdk`, a large binary wheel, version 0.x; the reading API changed between
  versions, per the two APIs in the docs above). Goal and state are chosen among those recorded; a free choice
  needs a companion process that computes and re-logs on request. No remark feature that I know of. What the
  assistant reads (tables) is not the picture the person sees. About 150 to 300 lines of logging code; recordings
  are a second copy of derived data.

C6. **An experiment tracker as the catalogue.** Runs log their settings, both scores at every evaluation and a
handful of diagnostic images per evaluation into a local tracker; its interface is the run finder and the
comparison.
- *What it is.* The field's standard answer. The tracker gives a searchable, filterable run table over all
  settings, overlaid curves of any runs, an image panel with a step slider, live updates during training, and a
  server that another machine can open. Candidates: TensorBoard (event files; `tbparse` or TensorBoard's dataframe
  API reads them back for the assistant), trackio (local SQLite, an API modelled on wandb's, a Gradio dashboard,
  images and tables; described by its makers as beta), Aim (built for thousands of runs, image explorer; run notes
  from memory, unverified), MLflow (local interface, notes and tags on runs, from memory).
- *Where it comes from.* https://github.com/aimhubio/aim, https://huggingface.co/docs/trackio/index,
  https://www.tensorflow.org/tensorboard/dataframe_api, https://tbparse.readthedocs.io/.
- *Costs.* One dependency tree of some size (TensorBoard installs without TensorFlow but brings several
  packages; Aim's support for Python 3.13 is unverified). Views are pictures rendered in advance: no free choice of goal or state.
  The hundreds of existing runs need an importer from the JSON files. Remarks, where the tracker has notes, attach
  to a run, not to a moment and place. About 100 lines of logging plus the importer. The tracker's store is a
  second home for results next to `results/`.

C7. **Arrays with named axes; the controls come from the axes.** Every diagnostic is stored as one labelled array
(`run`, `step`, `goal`, `y`, `x`, and `component` for vectors) in one format, and a generic viewer makes a slider
or drop-down for every axis that is not on the screen.
- *What it is.* xarray datasets on disk (netCDF or zarr), shown with hvPlot, where `groupby` on a dimension yields
  the widget and `panel serve` puts it in a browser, also for another machine. A new kind of diagnostic is a new
  variable with its axes and gets its controls without viewer code; side by side is a facet over the `run` axis.
  The assistant reads the same file with `.sel(step=..., goal=...)` and gets numbers, or renders the same plot to a
  PNG. napari, from microscopy, is the same idea on the desktop: image, vector, track and point layers with a
  slider per extra axis.
- *Where it comes from.* https://hvplot.holoviz.org/user_guide/Interactive.html,
  https://tutorial.xarray.dev/intermediate/hvplot.html, https://napari.org/.
- *Costs.* A heavy dependency tree (xarray, pandas, hvPlot, HoloViews, Panel, Bokeh; napari brings Qt). Goals and
  states are those on the stored grid; an action field over 100 goals at 81 moments is about 20 MB per run and
  diagnostic. A report of errors with several sliders at once exists
  (https://github.com/pydata/xarray/issues/3709; current state unverified). Generic plots do not draw walls, paths
  over maps or arrows coloured by waste without custom code, which brings back part of the per-view work. No
  remark feature.

C8. **A run sheet at every evaluation, with the worst cases picked for you.** No viewer: change what a run writes.
Each run keeps one folder with a fixed-template page that is rewritten at every evaluation, and an index page
links all runs.
- *What it is.* The agent's counterpart of `review.py figures` (one image per layout with rows for paths, per-step
  shortfall, coverage and conditions; `human-baseline/review.py:320-341`): curves so far; the worst evaluation
  runs of the latest moment drawn as paths over the optimal ones; the action field towards the goals of those
  worst runs; learned against true distance or value where the method has one; where the collected data went.
  Next to it a small table that splits the wasted steps by cause (standing still, short steps, wrong direction,
  the last step) from numbers the project already computes per step and per grid point
  (`evaluation.shortfalls`, `packages/gcrl-maze/src/gcrl_maze/evaluation.py:67`; `wasted_parts`,
  `gcsl_video.py:258-272`). The page and the table are files the assistant reads as they are. A remark is a line
  in a `remarks.md` in the run's folder, naming the panel. Two runs side by side are two pages in two windows, or
  the index's table.
- *Where it comes from.* `review.py` as above; the place a run would write from is the evaluation loop
  (`gcsl.py:437-447`); mining worst cases instead of browsing is the "error analysis" habit of supervised
  learning, and the linked trajectory and distribution views are those of https://arxiv.org/abs/2008.07331.
- *Costs.* About 300 to 400 lines; no dependency. The person does not choose goal or state: the sheet chooses,
  and any other look is again a script or a flag. Each evaluation gets slower by a figure render (about 0.5 to
  1 s, so 40 to 80 s on a run of 12 to 40 s) unless the sheet is drawn every few evaluations or by a second
  process. The causes in the table are a fixed list that has to be kept honest as methods change. Existing runs
  get sheets only where checkpoints were kept.

## Other titles

- **The baseline's window, turned around.** The pygame view of the human baseline (`human-baseline/run.py:242-279`,
  `review.py:403-457`): the person steers the goal or the agent's position with the gamepad and watches the stored
  policy respond live; a button writes a snapshot and a remark.
- **A reactive notebook that is also a script.** marimo: one `.py` file is the person's app with sliders
  (`marimo run`) and the assistant's batch job with arguments (`marimo export html nb.py -- --run ...`);
  https://docs.marimo.io/guides/scripts/.
- **One SQLite file for everything.** Runs, curves and diagnostic values as rows through the standard library's
  `sqlite3`; found with Datasette's facets, read by the assistant with SQL; https://docs.datasette.io/en/stable/.
- **The videos, made comparable.** Keep frames per evaluation next to each mp4, so frame number is evaluation
  number; any two runs side by side with ffmpeg's `xstack` or https://github.com/pixop/video-compare; a remark
  names file and frame.
- **A folder per run and a generated index.** Fixed file names, one `INDEX.md` or HTML page with thumbnails and
  final scores; the file manager and an image viewer are the tool.
- **The assistant as the interface.** A skill plus one fixed command: the person asks in words, the assistant runs
  the command (no new script) and shows the picture; the chat is the remark channel.
- **A published page with comments.** A run's atlas as a private web page whose comments reach the assistant with
  their anchor; results leave the workstation and pages have size limits.
- **Flight recorder.** Store each run's stream (positions, actions, commanded goals, sample weights; about 6 MB),
  so "what data it saw" becomes a view of a file.
- **Re-run instead of store.** Keep settings and seed only and recompute any view by running again with a hook;
  today the same settings give other random numbers after a code change (`gcsl/README.md:60`).
- **An append-only run log.** One line and one checkpoint file per evaluation instead of two files at the end
  (`gcsl.py:598-602`), so that any viewer can show a run in progress.
- **The difference as the unit of view.** Views take two runs and draw what differs (angle between their actions
  at every point, score difference per evaluation run) instead of two pictures to compare by eye.
- **A terminal picker with pictures.** A fuzzy finder over the run index with kitty's inline images as preview;
  https://sw.kovidgoyal.net/kitty/kittens/icat/.
- **Training as a trace.** Write evaluations and events as a trace file for a timeline viewer, as the project did
  once with `jax.profiler` (`gcsl/README.md:58`).
- **A static site from data loaders.** Observable Framework: pages in Markdown, Python loaders compute the data,
  charts with sliders in the browser, live preview on change; https://observablehq.com/framework/data-loaders.
- **One log file per run with its own viewer and reading API.** The eval-log pattern of LLM evaluation;
  https://inspect.aisi.org.uk/log-viewer.html.

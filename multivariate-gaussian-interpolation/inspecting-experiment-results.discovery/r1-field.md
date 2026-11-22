# R1, lens "the field": inspecting experiment results

Generator report, option letter A. Lens: the state of the art in inspecting, debugging and comparing machine-learning
and reinforcement-learning experiments, blind to the project (only the brief was read). Searched 2026-11-22. Nothing
here is ranked or recommended.

Versions and licences come from the pages named per option. Where a fact comes from memory and was not confirmed in
this search, it says "not verified".

## 1. Reformulations

**What neighbouring fields call this problem** (same purpose, far from a maze agent):

| Field | Their name for it | Their usual answer |
|---|---|---|
| MLOps | experiment tracking, run comparison, ML metadata store | a tracker: every run logs settings, metrics and media to one store with a web UI |
| Robotics and autonomy | log replay, time-travel visualisation of multimodal recordings | record everything on timelines, scrub through it in a viewer (rosbag with RViz, Foxglove, Rerun) |
| Information visualisation | coordinated multiple views; "overview first, zoom and filter, details on demand"; small multiples | linked panels where a selection in one updates the others |
| Game development | gameplay and AI debugging: visual logger, rewind debugger, debug draw | record debug shapes per frame, draw them over the level, scrub a timeline |
| LLM evaluation | eval log viewing, transcript inspection, tracing | one standard log file per run plus a bundled viewer and a read API |
| Computer-vision data work | dataset exploration, error analysis, curation | a sample browser with filters, tags and saved views |
| Scientific computing | post-processing of simulation output | a pipeline browser over stored fields with a time slider |
| Software testing | test reports, golden or snapshot tests, CI dashboards | checks that pass or fail, and a report of only what changed |
| Explainable RL | policy summarisation, critical states | pick and show the few moments that explain the behaviour |

**Wider.** How do two parties, a person and an AI assistant with different senses (one can click, one can only read
files and run commands), keep one shared, navigable body of evidence about a research project, and talk about the
same piece of it?

**Narrower.** Given an address (run, moment in training, goal, state, kind of view), produce that one picture and its
numbers, and place several such addresses next to each other. Everything else (finding, live updates, remarks) is
built around that one operation.

**Inverted (what if the need went away?).**
- Nobody looks: each run is judged by automatic checks, and only failed checks reach a person.
- Nothing is stored to browse: a run takes 40 seconds and the networks are kept, so any view is computed on demand
  when asked for, and "finding the file" stops being a problem.
- Only the assistant looks: it reads every diagnostic and hands the user a short written diagnosis with the three
  pictures that matter.

## 2. Worked-out options

A1. **A local experiment tracker as the single home for runs.**
Every run logs its settings, score curves and diagnostic pictures (keyed by name and training step) to one store, and
the tracker's own web UI does the browsing, filtering by settings, side-by-side comparison and live updating. This is
the field's default answer. The candidates differ mainly in who can read them and how alive they are:
- *MLflow*: Apache-2.0 (not verified in this search; long-standing), fully local (`mlflow ui` over a folder or
  SQLite), very active: 3.18.0 on PyPI, November 2026. `log_image(key=..., step=...)` stores time-stepped images,
  `log_figure` stores matplotlib figures, `log_table` stores tables. An official MCP server (`mlflow mcp run`, from
  3.5.1) lets an assistant query it; its default tool set is aimed at LLM traces, a second set covers runs. That the
  UI shows stepped images with a slider is from memory, not verified here.
- *trackio* (Hugging Face): MIT, local by default (SQLite, no account), 0.45.1 on 12 November 2026, still marked
  beta ("DB schema may change"). The same API as Weights & Biases. Built with assistants in mind: `trackio list`,
  `trackio get`, and read-only SQL from the command line. Logs images, tables, video.
- *Aim*: Apache-2.0, self-hosted, a query language over runs and explorers for images and figures. PyPI shows 3.29.1
  from 8 May 2025 as latest (one search result mentioned a 4.0.1 page I could not confirm), so upkeep looks slow.
- *TensorBoard*: Apache-2.0, local, 2.21.0 on 29 June 2026; image step sliders and a settings table; maintained but
  barely developing (my reading, not verified).
- Not local or not free: Weights & Biases' self-hosted server needs a licence (free tier is cloud); Neptune's hosted
  service shut down in March 2026 after OpenAI bought it; ClearML's server is open but needs MongoDB and
  Elasticsearch.
Sources: https://mlflow.org/docs/latest/genai/mcp/ , https://github.com/gradio-app/trackio ,
https://github.com/aimhubio/aim , https://pypi.org/project/tensorboard/ , https://docs.neptune.ai/transition_hub
Cost: small to start (a logging call per diagnostic; a new diagnostic is one more logged key, a new method logs the
same keys). What it does not give: trackers show what was logged, so "choose the goal and the state yourself" only
works for combinations computed beforehand; goal and state are not axes any tracker knows, only step is. Remarks are
at most a free-text note per run, not tied to a place in a picture. The UI's layout is the tool's, not yours. A
filter for layouts the user may not see yet would have to sit at logging time. One more service and one more store
that must stay in step with the run folders.

A2. **A time-scrubbable recording per run, in a robotics log viewer (Rerun).**
From robotics, where the problem is called log replay. A run is written as a recording: 2-D points, line strips,
arrows, images, tensors, scalars and text, each stamped on one or more timelines (training step, step within an
episode). The viewer has a time slider, a tree of everything logged, and a layout ("blueprint") that can be set from
Python and saved. It streams live while a run trains, and saves `.rrd` files. Paths, action arrows over the map and
value heat maps are native shapes here, not pictures of plots, so they can be zoomed, toggled and overlaid. The
recording can be queried as dataframes or SQL, and since 0.33 (May 2026) there is a headless mode and a screenshot
call that the release notes describe as meant for automation and LLM use (marked experimental).
Licence MIT and Apache-2.0 (dual); runs fully locally as a native or browser viewer; very active (rerun-sdk 0.43.2 on
PyPI, 13 November 2026; another source showed 0.36.0 in September, I did not reconcile the two). Open core: the
commercial part is a hosted catalogue, not the viewer.
Source: https://github.com/rerun-io/rerun , https://ref.rerun.io/docs/python/main/
Cost: medium. Each diagnostic is rewritten from "draw a matplotlib figure" to "log shapes", once, independent of the
method. The API still changes between releases. Putting two runs next to each other in one view, and scrubbing two
timelines at once (training step and episode step), were weak spots as I remember them; not verified for the current
version. Goal is not a built-in axis: it becomes part of the entity path or a separate recording. Remarks are not a
feature. The viewer is a Rust program the user cannot reshape beyond blueprints.

A3. **A reactive notebook or Python data app over a registry of view functions.**
The inspector is a small Python program: dropdowns and sliders for run, checkpoint, goal and state, and a table of
"view kinds", each a function from that selection to a figure and its numbers. Changing a control recomputes the
view from the stored networks, so nothing has to be computed beforehand. A new diagnostic is one more function in
the table. The same functions can be called from the command line, which is how the assistant gets the identical
picture. Three families:
- *marimo*: Apache-2.0, 0.25.2 on 19 October 2026, very active. A notebook stored as a plain `.py` file; cells
  re-run when a control they depend on changes; `marimo run` serves it as an app with the code hidden; the same file
  runs as a script. Has a mode for pairing with coding assistants.
- *Streamlit*: Apache-2.0, 1.67.0 on 5 November 2026. A script that re-runs top to bottom on every control change;
  the largest ecosystem; caching decorators for expensive loads.
- *Panel* (HoloViz): BSD-3, 1.10.0 on 23 October 2026. Works inside Jupyter and as a server; widgets bind to
  functions; closest to matplotlib and to linked plots.
Sources: https://github.com/marimo-team/marimo , https://pypi.org/project/streamlit/ , https://pypi.org/project/panel/
Cost: medium, and all of it is own code: the registry, the run index, the layout for side-by-side columns, the
remark box. In return goal and state are real controls, and the spoiler filter is one function at the run index. All
three serve over the network. Live results need a refresh timer. Loading JAX networks per click must be fast or
cached. The upkeep risk is that the app grows per-method branches unless every method exposes the same few calls
(act, value, model step).

A4. **A report card per run and a static gallery, generated, with no server.**
From workflow tools and publishing. When a run ends (and at intervals while it trains), a fixed template renders one
HTML page for it: settings, curves, and every diagnostic at a few chosen checkpoints and goals. An index page lists
all runs with their settings and final scores, sortable, linking to the cards; a compare page is the same template
rendered with two or more runs in columns. The assistant reads the same PNGs and tables the pages embed.
- *Metaflow cards*: Apache-2.0, 2.19.41 on 6 November 2026. `@card` attaches one HTML file to each task; "dynamic
  cards" (from 2.11) refresh while the task runs; charts are Vega-Lite; any card of a past run is retrievable by run
  ID. Using cards means adopting Metaflow's flows.
- *Quarto* with parameters (Jupyter side uses papermill): one template rendered many times with different
  parameters; 1.10 was in pre-release in May 2026. Licence MIT, not verified.
- *Inspect AI* (LLM evaluations, MIT) shows the pattern taken furthest: `inspect view bundle` writes a
  self-contained folder with viewer and logs that can be opened or published anywhere.
Sources: https://docs.metaflow.org/metaflow/visualizing-results ,
https://docs.metaflow.org/metaflow/visualizing-results/dynamic-cards ,
https://opensource.posit.co/blog/2025-07-24_parameterized-reports-python/ , https://inspect.aisi.org.uk/log-viewer.html
Cost: low to medium. A new diagnostic is a new section in the template; old cards can be re-rendered from stored
networks. Reading from another machine is copying a folder or any static file server. What it does not give: the
user picks only among what was rendered, so a free choice of goal and state means either rendering a grid of them in
advance (hundreds of runs times 80 checkpoints times goals grows fast) or a small script inside the page.
Side-by-side for arbitrary runs needs a compare page rendered on request. Remarks need something beside the page.

A5. **A queryable catalogue of every stored result, browsed as a database.**
From data journalism and dataset curation. A crawler turns the result folders into one table of records: run,
method, seed, settings, checkpoint, goal, kind of diagnostic, path to the image or numbers, headline scores. Finding
becomes filtering and faceting that table, and the assistant queries the same table with SQL.
- *Datasette*: Apache-2.0, 0.65.6 stable and 1.0a43, both 15 November 2026, very active. Serves a SQLite file as a
  browsable site with facets, saved queries, a JSON API, and plugins (image rendering, charts, row comments;
  the 2026 alphas added a write interface in the table pages).
- *FiftyOne*: open-source 1.22.1 on 28 September 2026; Apache-2.0 according to a third-party listing. A grid of
  image "samples" with typed fields; a sidebar to filter on any field; tags and saved views; Python panels as
  plugins. Tags and views are stored in its database and readable from Python, so a tag doubles as a remark the
  assistant can read. Needs a bundled MongoDB (not verified).
Sources: https://pypi.org/project/datasette/ , https://simonwillison.net/tags/datasette/ ,
https://docs.voxel51.com/release-notes.html
Cost: low for the catalogue (a crawler and a schema; a new diagnostic is a new value in the "kind" column), and it
does not touch the methods at all. It answers "where is it" and "which runs have X", not "what is the agent doing":
the pictures are whatever was already made. Placing runs side by side is a filtered grid, not an aligned comparison.
The spoiler filter is a WHERE clause on layout, applied in the crawler. The catalogue goes stale unless the crawler
runs after every run.

A6. **A purpose-built RL debugger of linked views (the Vizarel pattern).**
From visual-analytics research on RL. Vizarel (Deshpande, Eysenbach, Schneider, CMU, 2020) is built from "viewports",
each backed by a simple spec (image buffer, line plot, scatter plot, histogram) over the same data stream. Temporal
viewports show state, action and reward along an episode; spatial viewports show the replay buffer as a scatter with
point size by TD error, the distribution of actions for a lassoed group of points, a tensor comparison that
highlights the dimensions that differ, and a trajectory view. The point is the linking: hovering a timestep shows
that state; selecting buffer points pulls up their trajectory. New viewports are meant to be added as plugins.
Related: DQNViz (four coordinated views: statistics, epoch, trajectory, segment), DRLViz (the agent's memory over an
episode), RLInspect (2024; state, action, architecture, reward modules).
Status: research prototypes. I found the papers and a demo link but no maintained code for Vizarel; licences not
verified. So this is a design to build, not a tool to install, on a plotting stack with linked selections (Plotly
Dash, MIT; Bokeh or Panel, BSD-3; licences not verified in this search).
Sources: https://arxiv.org/abs/2008.07331 , https://arxiv.org/abs/1909.02982 , https://arxiv.org/abs/2411.08392
Cost: high. Linked selection across views is the expensive part and is custom per pair of views. In a 2-D maze the
map itself can be the shared spatial view (click a cell to set state or goal; paths, action arrows and value all draw
on it), which is simpler than Vizarel's projected scatter. Interaction that lives in hover and lasso is exactly what
the assistant cannot use, so every linked state would also need a way to be written out as an image and numbers.

A7. **Checks that replace looking: probe tasks, health statistics, and a verdict per run.**
The inverted formulation, and what RL practitioners recommend before any viewer. Three pieces from the field:
- *Probe environments* (Andy Jones, "Debugging RL, Without the Agonizing Pain"): five tiny tasks, each adding one
  feature (constant reward; observation-dependent reward; delayed reward; action-dependent reward; both), trained in
  seconds with answers checkable by hand, so the first one that fails names the broken part. Also probe agents: a
  cheating agent given the answer, a hand-written policy, a tabular agent. Packaged versions exist
  (`probing-environments` on PyPI, AgileRL's docs).
- *Health statistics logged always* (same post): relative policy entropy, KL between acting and learning policy,
  residual variance of the value fit, value-target and advantage distributions, episode-length distribution, sample
  staleness, each with a stated healthy range.
- *Behaviour suites*: DeepMind's bsuite (Apache-2.0; no archive banner; last release date not verified) scores an
  agent on separate capabilities (memory, exploration, credit assignment, noise) and generates a one-page report
  with a radar chart; rliable gives intervals for comparing methods over few seeds.
For this project the equivalent would be numbers such as steps wasted against the shortest path, share of states
where the chosen action moves away from the goal, and rank agreement between learned and true distance, computed for
every run and checkpoint, with thresholds. The result is a table of pass, fail and "look here" that both parties
read, which also serves as the index into whichever viewer exists.
Sources: https://andyljones.com/posts/rl-debugging.html , https://github.com/google-deepmind/bsuite ,
https://arxiv.org/abs/1908.03568 , https://pypi.org/project/probing-environments
Cost: low per check, and method-independent if written against behaviour. Thresholds must be chosen and kept
honest. It answers "which run, which moment, which goal is odd" and not "why": it narrows where to look, it does not
remove the looking. It does nothing for remarks or side-by-side viewing on its own.

A8. **Addressable views: one headless renderer, an address for every view, remarks anchored to addresses.**
From the narrower formulation and from how tools are being opened to assistants. The core is a command, not a
window: `view <kind> --run R --step S --goal G --state X` writes a PNG and a small JSON or CSV of the numbers behind
it. Every view therefore has a canonical address (a short URL-like string). Anything interactive is a thin shell
that builds addresses and shows the result; a comparison is a list of addresses; a remark is a record "address,
optional region in the picture, text, author, date" in a plain file the assistant reads at the start of a session
and answers in the same file.
Existing pieces that show the shape:
- The W3C Web Annotation Data Model (Recommendation, 23 February 2017): an annotation has a body (the remark) and a
  target with a source, a state (which version, at what time) and a selector (which part: a fragment, an SVG region,
  a data range). It is a ready-made schema for "this remark is about that place in that picture of that checkpoint".
- Trackers are growing the assistant-facing half: MLflow's MCP server, the Weights & Biases MCP server, trackio's
  CLI with JSON output and SQL, Rerun's screenshot call for "automation and LLM usage", Inspect AI's log-reading API
  next to its viewer.
Sources: https://www.w3.org/TR/annotation-model/ , https://mlflow.org/docs/latest/genai/mcp/ ,
https://wandb.ai/site/mcp , https://huggingface.co/docs/trackio , https://inspect.aisi.org.uk/eval-logs.html
Cost: low to medium, all own code, but small and with no service to keep running. It is not a viewer by itself: the
human side still needs a shell from one of the other options, or a cache folder of rendered views opened in an image
viewer. Its discipline is that no view may exist only in a window, which rules out hover-only interaction. The
spoiler filter is one check inside the command. Following the W3C model strictly is more ceremony than a two-party
project needs; its vocabulary (target, state, selector) is the useful part.

## 3. Other titles

- **Hosted tracker with written reports** (Weights & Biases reports, as the Open RL Benchmark does for thousands of
  RL runs with videos): the richest UI and report documents, but data leaves the machine and the local server is
  licensed. https://arxiv.org/abs/2402.03046
- **Git-native experiments** (DVC experiments, `dvc plots diff`, DVCLive, the VS Code extension; DVC moved to lakeFS
  in November 2025, which says it will keep it maintained): runs are commits, comparison is a diff that renders a
  static HTML page. Assumes a git repository.
- **One self-describing log file per run with a bundled viewer** (the Inspect AI pattern): a standard file format, a
  viewer that needs nothing else, a read API for the assistant. A format decision more than a tool.
- **Game-engine replay debugger** (Unreal's Visual Logger and Rewind Debugger): the agent's code emits debug shapes
  and text per step; a timeline scrubs them over the level; built for "why did the AI do that".
- **Declarative chart specs as the diagnostic format** (Vega-Lite, Altair): each diagnostic is data plus a spec; the
  browser gives linked selections in a static page, the assistant reads the same JSON.
- **Static site with data loaders** (Observable Framework 1.13, Evidence, Quarto dashboards): Python scripts produce
  data snapshots at build time, the pages are interactive without a server. JavaScript on the page side.
- **Contact sheets and small multiples only**: one montage image per question (runs across, checkpoints down),
  opened in an ordinary image viewer; no interface at all.
- **Visual regression baselines** (pytest-mpl style): diagnostics are compared against a stored baseline and only
  the differences are shown.
- **Settings-space overview for finding runs** (parallel coordinates as in HiPlot or TensorBoard's HParams, the
  embedding projector): helps choose among hundreds of runs, shows nothing inside a run.
- **Assistant-written diagnosis with comments** (lab-notebook practice): after each run the assistant reads all
  diagnostics and writes a dated entry with the few pictures that matter; the user comments in the document.
- **Compute on demand, store nothing to browse**: no result files besides networks and curves; every view is
  recomputed when asked (pairs with A3 or A8).
- **Step-through play viewer**: the environment's own renderer with overlays, where the user advances the agent one
  step at a time or moves it by hand. Shows the layout itself, so it collides with the spoiler rule.
- **Episodes as traces in an LLM-observability tool** (Phoenix, Langfuse, Docent): an episode becomes a trace of
  spans with built-in annotation and comparison. Unlikely fit: these tools expect text, not maps.
- **Scientific-visualisation post-processor** (ParaView, VisIt): value and action fields as fields on a grid with a
  time slider and saved state files. Unlikely: heavy, and built for 3-D meshes.
- **Terminal interface with inline images** (Textual with a terminal graphics protocol): the user and the assistant
  literally use the same commands. Unlikely: awkward for side-by-side pictures.
- **Older file- or Mongo-based trackers** (Sacred with Omniboard, Guild AI): same shape as A1; maintenance status
  not checked.

# Generator B: far fields with the same purpose

Lens: fields far from machine learning in which a person and an assistant review many recorded "runs" with layered
measurements, find the relevant one, compare, point at a precise moment and place, and leave remarks for someone
else. Only the brief was read, nothing of the project. Machine-learning experiment trackers are left out on purpose.
Options are not ranked.

## Reformulations

**What the far fields call this problem**

| Field | Their name for it | What maps onto what |
|---|---|---|
| Motorsport, flight test | post-session data review, debrief | run = lap or flight; diagnostic = math channel; comparing = lap overlay against a reference lap |
| Radiology | reading a study from a worklist, then reporting | run = study; views = hanging protocol; remark = key image note with a saved presentation state |
| Sports video analysis | coding a match, then match review | run = match; interesting moment = coded instance; finding = search over codes |
| Game development, robotics | replay debugging, visual logging | run = recording; diagnostic = debug-draw category; moment = scrubbed frame |
| Chess | post-game analysis, annotation | episode = game; state = position; wasted step = blunder; remark = comment inside the game record |
| Archives, museums | discovery through a finding aid | hundreds of runs = holdings; "where is it stored" = shelf mark the reader never needs |
| Microscopy | browsing a multi-dimensional image | diagnostics = channels of one image; run, moment, goal = extra axes with a slider each |
| Software observability | trace exploration, time-travel debugging | run = recorded execution; question = query; pointer = link to a moment |
| Seismology | analyst review of an automatic catalogue | detector proposes, analyst confirms or revises |

**Wider.** Two reviewers with different senses share one body of evidence: one sees and clicks, the other reads files
and runs commands. Whatever one of them points at must be something the other can resolve to the same picture and
the same numbers. Inspection, comparison and remarks all follow from that.

**Narrower.** One addressing scheme: `(view kind, run, moment in training, goal, state)` gives a picture and its
numbers. Finding is a list of addresses, comparing is two addresses next to each other, a remark is an address plus
text, live results are addresses that start to exist.

**Inverted (the need goes away).** Three ways the far fields remove the looking or the remarking:
- The user does not browse: limits are checked on every run and only flagged runs reach a person (airline flight-data
  monitoring).
- The user does not read the raw evidence: the assistant writes a report with a few key images and the user opens the
  evidence only when in doubt (the referring doctor reads the radiologist's report, not the scan).
- The user does not write where they were: the tool keeps a trail of what was opened and the user only clicks "keep"
  (Pernosco's notebook).

## Worked-out options

Merged before working out, because they were near duplicates: Unreal Visual Logger, Rewind Debugger, Rerun and
Foxglove (into B4); Perfetto, Pernosco and Datasette (into B8); finding aids and IIIF (into B6); key image notes and
structured reports (into B2).

B1. Telemetry workbook: named channels, a reference lap and a delta

- **In its home field.** A race engineer's analysis package (MoTeC i2) holds logged channels and *math channels*
  (quantities derived by a formula). Laps are overlaid on a main lap, aligned by track distance; a *variance* trace
  shows the time gained or lost against the reference lap at the same place on the track; the cursor and zoom are
  linked across every graph and the track map; *workbooks* and *worksheets* are saved page layouts, one per question
  (braking, gearing).
- **Applied here.** Every quantity of a run is a named channel with declared axes: `score` over training time, `path`
  over episode step, `value_error` over map cell and training time. A diagnostic is a math channel: a function
  registered under a name that computes the channel from the stored networks and the environment. The viewer knows
  channels, not methods (R1, R3). One cursor `(moment, goal, state)` is shared by all panels: moving it on the score
  curve changes the maps, clicking a map cell sets the state (R8, R10). Comparing means choosing a reference run:
  other runs are overlaid on the curves and shown as difference maps, the "variance" (where on the map does run B
  need more steps than run A). The truth is simply the standing reference lap (R4b, R11). Worksheets are small layout
  files, one per question of R4b. For the assistant, a command takes a worksheet and a cursor and writes the same
  panels as images and the channel values as tables (R7). A remark is worksheet + cursor + text in a file (R15).
- **Source.** https://www.motec.com.au/i2/ (overlays, cursor and zoom linking, reference lap, workbooks);
  https://forum.motec.com.au/viewtopic.php?p=5676 (variance; forum, not official documentation).
- **Cost.** Must be built: i2 itself is closed, made for time series, and (from memory, not checked) Windows only. An
  open look-alike turned up (https://github.com/racer-coder/TrackDataAnalysis) but was not examined. The parts are a
  channel registry, computing on demand with a cache, and a linked-cursor interface in a local web or desktop
  application; the linked cursor is the largest part. Overlaying works for curves; for maps it needs difference maps,
  which only exist between runs on the same layout. R6: the gate sits in the run picker, before any channel loads.

B2. Reading-room protocol: worklist, hanging protocols, key images with a saved view state

- **In its home field.** A radiologist takes a study from a worklist. A *hanging protocol* (in DICOM: selection,
  processing, layout) puts the right image series in the right viewports for that kind of study, with the earlier
  study next to it. Images that matter are marked in a *Key Object Selection* document with a title such as "For
  Report Attachment"; each can carry a *presentation state* that stores the display settings and the "electronic
  grease pencil" marks apart from the pixels. The report refers to those objects.
- **Applied here.** The worklist is a table of all runs with a status (new, looked at, flagged, has an open remark),
  filtered by method, experiment, seed and date (R9). Hanging protocols are declarative files: "for a run of this
  kind and this question, show these views in this grid, with the previous run of the same method as the prior".
  Opening a run then needs no choices, and every choice can still be changed (R10, R17). The key image note is the
  remark: a small file with the view state (run, moment, goal, state, view kind, marked region), the text, and a
  rendered snapshot (R15). Because the view state is kept apart from the picture, the assistant can render it again
  or read the numbers under the marked region (R7). It works both ways: the assistant writes key image notes for the
  user, and opening one restores the view. Unread notes are the assistant's inbox at the start of a session.
- **Source.** https://dicom.nema.org/medical/dicom/2024c/output/chtml/part17/chapter_X.html (key objects,
  presentation states, reports that refer to images);
  https://dicom.nema.org/medical/dicom/2024c/output/chtml/part17/chapter_V.html (hanging protocols). Not verified:
  how DICOM reports mark a region inside an image (the SCOORD item); the search returned nothing on it.
- **Cost.** This is the organisation around a viewer, not the rendering; it needs one underneath. To build: the
  worklist index, the protocol files, a view-state format and a renderer that takes a view-state file. DICOM itself
  would not be used (medical and heavy), only its division of roles. The view-state format becomes the contract
  everything depends on; changing it later means converting old remarks. Protocol files need upkeep as views are
  added, unless each view kind has a default place. R6: the worklist lists only cleared layouts.

B3. Coded timeline: events tagged on runs and searched across all of them

- **In its home field.** A sports analyst *codes* a match in Sportscode: every event becomes an *instance* on a
  timeline row (one row per code), with labels. A Find window searches the labels across open timelines, folders and
  databases; a code matrix counts codes against labels; found instances go into a playlist or organizer and are
  played back one after another, also across several matches.
- **Applied here.** Detectors written by the assistant, one per kind of event, run over every finished run and write
  instances `(run, span of training, goal, state or region, code, labels, a number)`: "score dropped", "stuck against
  a wall", "walks in a loop", "learned value far from the truth here", "goal never reached", "model error jumped".
  Each run gets timeline rows along training. A matrix of methods against codes counts events over hundreds of runs;
  clicking a cell gives a playlist of moments, and each opens the views at that address. Finding becomes "all runs
  in which X happened" (R9); comparing is two matrix columns or two timelines above each other (R11). The user codes
  by hand too: a key press on what they look at adds an instance with a label and a note. That is the remark, stored
  in the same table as the detectors' events (R15). The table is a plain file the assistant reads (R7). A new
  diagnostic may bring a new detector and code; the others stay (R3).
- **Source.** https://www.hudl.com/support/manuals/sportscode/review-and-analyze/the-find-window (search across
  windows, folders, network); https://hudl.com/blog/multigame-analysis-in-hudl-sportscode (multi-game analysis; title
  seen, page not read); https://www.hudl.com/support/manuals/sportscode/code/the-timeline.
- **Cost.** To build: the event table, the detectors, the matrix and playlist. It needs some viewer to play an
  instance in, so it pairs with an option that renders. Detectors have thresholds that need tuning and can miss or
  over-flag; research on airline exceedance monitoring reports anomalies that threshold checks missed
  (https://web.stanford.edu/%7Egorin/papers/DFM_CIDU_2012.pdf). Running detectors over hundreds of runs with about 80
  moments each costs computing time. A run without events is invisible unless empty rows are shown. R6: detectors
  may run on every layout, but instances of uncleared layouts must not be listed.

B4. Debug-draw recording: diagnostics log shapes, one generic timeline viewer draws them

- **In its home field.** In Unreal's Visual Logger, game code logs shapes (segments, boxes, cones, capsules) and text
  per actor under categories; the viewer has a timeline scrubber and category filters and draws the shapes in the
  level at the scrubbed moment. Robotics has the same idea as a product: Rerun's Python SDK logs points, line
  strips, arrows, images, numbers and text to named entity paths on named timelines, saves recordings to `.rrd`
  files, lays out views with *blueprints* written in code, and can serve a web viewer.
- **Applied here.** A diagnostic no longer makes a figure. It logs primitives in maze coordinates: a path is a line
  strip, the action field is arrows, a learned value is an image, the true value a second image, the score a number,
  each under a path such as `goal_3/value/learned`, on the timelines `training_step` and `episode_step`. The viewer
  knows nothing about methods or diagnostics; a new diagnostic is a new entity path (R1, R3). With Rerun: one
  recording per run, scrub training time, switch layers on and off, open several recordings, stream while the run
  trains (R13), web viewer for another machine (R14). The assistant reads the same primitives as arrays or tables
  written next to the recording, plus a headless picture drawn from them (R7). For remarks, the viewer's share link
  carries the time and the selection; the user pastes it with a line of text into a remarks file (R15).
- **Source.** https://dev.epicgames.com/documentation/en-us/unreal-engine/visual-logger-in-unreal-engine;
  https://github.com/rerun-io/rerun/blob/main/docs/content/getting-started/data-in/python.md;
  https://rerun.io/docs/reference/cli.md (headless mode);
  https://docs.rs/crate/re_viewer/0.30.0/source/src/ui/share_modal.rs (share link built from time and selection).
  Not verified: a built-in comment feature in Rerun (none found); reading a recording back as a table through
  Rerun's dataframe interface (from memory); showing two recordings side by side inside one view.
- **Cost.** A log viewer shows what was logged. A state the user picks freely has no logged answer, so either states
  are logged on a grid beforehand or R10 is met only for logged states. Logging every diagnostic at every moment for
  every goal up front costs computing time and disk for hundreds of runs. Rerun is a dependency whose interface
  moves fast (versions 0.19 to 0.33 appeared in the sources of one search). Colour scales shared between learned and
  true values have to be fixed in the logging code. The alternative is to build a small viewer that draws about five
  kinds of primitive. R6: recordings of uncleared layouts are not offered for opening.

B5. Annotated game record: the run as text, with machine-marked blunders

- **In its home field.** A chess game is a text record (PGN). After the game an engine evaluates every position;
  Lichess marks each move as inaccuracy, mistake or blunder by how much winning chance it gave away and draws an
  evaluation graph over the moves; clicking the graph jumps to the position. Comments, judgement symbols, coloured
  arrows `[%cal Ge2e4]` and coloured squares `[%csl Rf7]` sit inside the record, next to the move they are about. A
  position has a one-line text address.
- **Applied here.** In the maze the "engine" is exact, because the true distance to the goal is known. Each step of
  the agent's path gets a loss: how much the true distance failed to go down (0 is perfect, 1 is a wasted step, 2 is
  a step away). An episode becomes a text record: a header (run, moment, goal, start), then per step the state, the
  action, the learned value, the true distance, the loss and a mark (`?`, `??`). The evaluation graph exists twice:
  true distance along the episode, and summed loss per moment along training; a click on either jumps there. This
  answers "where does the agent waste steps" and "what it learned next to the truth" per step (R4b, R12). A position
  is one line that both parties can type, `run@moment/goal/cell`. Remarks are comments inside the record at the step
  they concern, from the user or the assistant, with arrows and squares as text marks (R15). The assistant reads the
  record as it is; no picture is needed (R7). The viewer is a board-like page, stepped with the arrow keys through
  the episode and through training, or even a terminal program.
- **Source.** https://www.lichess.org/page/accuracy (accuracy from winning chances);
  https://chesstempo.com/user-guide/en/pgnViewerCommentAnnotations.html (`%cal`, `%csl` in comments). The exact
  thresholds for inaccuracy, mistake and blunder come from forum posts, not official documentation.
- **Cost.** To build: the record format, a recorder for episodes per (moment, goal, start), a stepping viewer. Views
  over the whole map (a value at every point) are not a game record and need a second form: character grids are
  coarse, pictures next to the text are a separate piece. If positions are continuous they must be turned into cells
  for addresses (not checked; the brief only says "small 2-D maze"). Loss marks only exist where a true distance is
  defined. It does little for "what data it saw". Side by side (R11) is two records next to each other or two paths
  on one board. R6: records of uncleared layouts are not written to where the user reads.

B6. Finding aid with addressable pictures (archives, IIIF)

- **In its home field.** An archive's finding aid describes the holdings from the top down (collection, series,
  file, item) with a scope note at each level, so a reader finds material without knowing the shelf. For images,
  IIIF adds: a manifest that lists the canvases of an object; viewers such as Mirador that place windows from
  different sources next to each other; W3C Web Annotations, notes that target a region of a canvas with
  `#xywh=x,y,w,h`; and *Content State*, a link that says "open this object at this canvas and region".
- **Applied here.** Three parts. (a) A generated finding aid: pages from experiment to method to run to moment to
  view, with a scope note per level (what was changed, how it ended; numbers filled in automatically, the sentence
  by the assistant when the run ends), so finding is browsing and reading (R9). (b) Every view is an address,
  `/view/<kind>/<run>/<moment>/<goal>/<state>.png`, and the same address ending in `.csv` gives the numbers. A small
  local server renders on first request and keeps the result. The user's controls only change the address (R10); the
  assistant fetches the same address with a command and gets the same picture and numbers (R7). Side by side is a
  page with several addresses in a grid (R11). (c) A remark is an annotation record: target = address plus region,
  body = text, appended to a file the assistant reads (R15). It is a web server, so another machine can use it
  (R14). New results appear as addresses that start to answer (R13). A new diagnostic is a new `<kind>` (R3).
- **Source.** https://iiif.io/api/presentation/ (canvases, `#xywh` regions); https://iiif.io/api/content-state/0.2
  (a link that carries what to look at); https://projectmirador.org and https://ask.library.harvard.edu/faq/392399
  (windows side by side); https://github.com/ProjectMirador/mirador-annotations/blob/master/README.md.
- **Cost.** To build: the rendering server and the index generator; existing matplotlib figures can become routes.
  Pictures are static, so no values on hover; the numbers come from the `.csv` twin. Choosing a state by clicking in
  the picture needs a little code that turns a click into map coordinates. Scope notes go stale unless regenerated.
  Adopting IIIF and Mirador literally costs more than borrowing the pattern: manifests must be generated, the
  annotation plugin works with Mirador 3 and not with Mirador 4, and one module's notes call Mirador 3 no longer
  recommended (https://omeka.org/s/modules/Mirador/). R6: one gate in the server refuses every address of an
  uncleared layout and leaves it out of the index.

B7. N-dimensional layer stack (microscopy, napari)

- **In its home field.** A microscope produces images with more axes than the screen has (time, channel, depth, y,
  x). napari, a viewer written in Python, shows a 2-D slice with one slider per extra axis; layers (image, points,
  shapes, vectors, tracks) lie on top of each other with their own colour map and opacity; grid mode puts layers
  next to each other with a shared camera and shared sliders; points and shapes layers are the annotations and can
  be saved; it reads numpy arrays directly and can take screenshots without a window.
- **Applied here.** Each diagnostic is an array with named axes `(run, moment, goal, y, x)`: learned value, true
  value, their difference, the action field as a vectors layer, paths as a tracks or shapes layer. The sliders are
  moment and goal; runs are a third slider or stand side by side in grid mode, moving together (R10, R11). The state
  is the cursor position. A remark is a point or shape with a text column in an annotation layer; it carries all
  coordinates (run, moment, goal, y, x) and is saved as a table the assistant reads. The assistant can write such a
  layer too, to show the user where to look (R15). The assistant reads the arrays themselves, which are the
  diagnostic, and takes a screenshot at given slider positions (R7). A new diagnostic is a new array and layer;
  nothing in the viewer changes (R3). Arrays grow along the moment axis while a run trains (R13).
- **Source.** https://napari.github.io/dev/tutorials/fundamentals/viewer.html (sliders per extra axis);
  https://sources.debian.org/src/napari/0.6.6-3/examples/grid_mode.py (grid mode);
  https://napari.github.io/dev/howtos/headless.html (headless use). Not verified: the column layout of the built-in
  CSV writer for points; whether napari can be used through a browser.
- **Cost.** napari and Qt as dependencies; a desktop program, so another machine only through a remote desktop (R14).
  Arrays over every combination of run, moment and goal cost computing time and disk, unless they are lazy and
  computed when a slider moves. Curves over training (scores) do not fit an image viewer and need a plot add-on or a
  second window, which strains R8. Diagnostics that depend on a chosen start state add more axes. Runs on different
  layouts do not stack on one axis. R6: uncleared layouts are never loaded as layers.

B8. Record once, ask later: a queryable run database with links to moments

- **In its home field.** Three relatives. Perfetto's trace processor loads recorded traces into tables and answers
  SQL from its interface, a shell or Python. Pernosco records a program once and afterwards gives any state at any
  moment without running it again; its links carry the moment, and a notebook writes down each navigation step
  tentatively, kept and annotated with a click and shared by everyone on that recording. Datasette, from data
  journalism, turns a database file into a browsable site with filters by facet in the address, a `.json` twin of
  every page, and saved queries.
- **Applied here.** When a run ends, a step writes its settings, score curves and all diagnostic numbers into one
  database (tables for runs, moments, episodes, steps, and fields as `run, moment, goal, cell, quantity, value`).
  The user browses by facet (method, seed, setting, final score) and uses saved queries such as "runs whose value
  error rose after moment N" (R9); side by side is a query that returns the rows of two runs (R11). Every page
  address is a permanent link. The assistant opens the same link as JSON or asks the database directly, which is its
  native way of working (R7). From Pernosco: the viewer keeps a trail of what the user opened (run, moment, goal,
  state, view); one click keeps an entry with a line of text. The remark costs a click, and the trail tells the
  assistant what was looked at before it (R15). A new diagnostic is new rows under a new `quantity` name (R3).
- **Source.** https://perfetto.dev/docs/analysis/trace-processor (seen through a mirror:
  https://cobalt.googlesource.com/cobalt/+/HEAD/third_party/perfetto/docs/quickstart/trace-analysis.md);
  https://robert.ocallahan.org/2019/11/the-power-of-collaborative-debugging.html (Pernosco links and notebook; from
  2019, may be out of date); https://docs.datasette.io/en/latest/facets.html (facets, `.json`).
- **Cost.** Tables are not pictures. Maps need a rendering add-on that has to be written; out of the box the user
  sees rows, which strains R12 and R18. A table layout and an export step are needed for every diagnostic. Field
  tables over about 80 moments, all goals, all cells and hundreds of runs become large; the size should be estimated
  first, and a column store is the alternative. Only what was computed beforehand can be queried, unless computing
  on demand is added. Datasette is a dependency (a local web server, so R14 comes with it). R6: uncleared layouts
  are not exported, or are hidden behind a database view.

## Other titles

- **Quick-look sheet** (flight test, survey astronomy): one fixed page with all standard diagnostics, made when a
  run ends, same layout for every method; comparing is laying two sheets next to each other.
- **Exceedance gatekeeper** (airline flight-data monitoring): limits checked on every run, only flagged runs reach
  the user. https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_120-82.pdf
- **Dailies review** (film): each run rendered as a video with training time as film time; comments tied to a frame,
  drawings on the frame, comments exported as a table, wipe between two versions.
  https://help.frame.io/en/articles/9105309-comment-printing-and-comment-exporting
- **Ghost run** (racing games, speedrunning): the reference agent, the shortest path or the user's own play drawn as
  a translucent ghost in the same maze, with split times at landmarks.
- **Tools that tell each other where to look** (astronomy, SAMP): a run table, a map viewer and a curve plotter stay
  separate programs and send each other "point at this"; the assistant is one more participant that can send "show
  the user this" and receive "the user pointed here". https://arxiv.org/pdf/1501.01139
- **Analyst review of an automatic catalogue** (seismology): detectors propose, the user sets each entry to
  confirmed, rejected or revised; the status change is the remark. https://seiscomp.de/doc/apps/scolv.html
- **Laboratory notebook as the front door**: dated entries are the main interface, evidence is embedded by address,
  and views are opened from the entry instead of the other way round.
- **Case file per failure** (accident investigation, hospital case conferences): only failures get a dossier with
  timeline, evidence and findings; the assistant prepares it, the user reviews it.
- **Report with key images, written by the assistant** (radiology, inverted): the user reads the report and opens
  the evidence only when in doubt.
- **Dashboard with variables** (operations monitoring, Grafana): run, moment and goal as drop-downs above panels
  that are declared as data; notes on the time axis; refreshes by itself.
- **Map atlas** (geographic information systems): diagnostics as map layers with a time control; an atlas prints one
  page per run from a single template.
- **Contact sheet with a loupe** (photo editing): thumbnails of one view over all runs and moments in a grid, with
  flag and reject marks; a click opens the full view.
- **Exhibit numbers** (court evidence): every picture or table ever produced gets a short permanent number printed
  on it; remarks cite the number; no viewer changes at all.
- **Step-cost map** (profiling, flame graphs): wasted steps summed over all episodes and goals into one picture of
  where on the map steps are lost, instead of browsing episodes.
- **Black-box replay** (flight data recorders): one episode replayed with an instrument panel beside it (learned
  value, true distance, the weight given to each action).

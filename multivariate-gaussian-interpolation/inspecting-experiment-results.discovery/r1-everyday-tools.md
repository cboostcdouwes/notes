# Generator E: options that live inside everyday tools

Lens: where the solution lives. Every option here gets its character from a tool the user and the assistant already
have open (VS Code, the Claude Code chat, kitty, the sway desktop, a browser on local files, claude.ai Artifacts),
not from a new program or service. Nothing is ranked or recommended.

How things were checked: web search and the vendors' documentation on 2026-11-22, plus two first-hand sources in the
running Claude Code build (2.1.327): the Artifact capability roster and the mod (plugin) API type file. "Not verified"
means I found no source or only user reports. No option was tried on the workstation.

## 1. The problem, restated

**In the lens's terms.** VS Code, the chat, the terminal and the desktop already have a finder (Quick Open, fuzzy
search, tag filters), side-by-side placement (editor splits, sway tiles), live reload, and a place to type. Today's
outputs are not shaped so that these can be used: a look is a script the assistant writes, not a thing a tool can
open. Restated: *make every look an addressable thing (run, moment, goal, state, kind of view) that a tool already
open can show, put next to another one, and point at.*

Names far-away fields give the same problem:

- Photography: **culling on a light table** (contact sheets; find the few frames worth a look among thousands, lay
  them side by side, flag and caption them).
- Radiology: **a PACS viewer with hanging protocols** (a fixed arrangement of a study's image series, scrubbed in
  sync, with a report written against key images).
- Astronomy: **blink comparison** (flip between two aligned images so the difference jumps out).
- Film: **dailies review** with frame-accurate notes.
- Code review: **inline review comments** (the remark is stored with the line it is about).
- Collaboration research: **joint attention / deixis** ("this, here"): two parties need common ground, and one of
  them cannot see the other's screen.

**Wider.** A shared evidence desk for two parties, one human and one that cannot operate a window: both must be able
to look at the same thing and point at it, now and in a later session.

**Narrower.** One function "address in, picture and numbers out" for any method and any kind of diagnostic, plus a
way to say an address without typing a file path.

**Inverted (what if the need went away).** The user does not look around at all: after every run the assistant
looks at everything and brings a few key views with a claim, as a radiologist's report does, and the user confirms
or refutes. Navigation then matters little and the remark channel matters most. A weaker form: runs describe
themselves well enough that only disagreements need a look.

**What all options below share.** Each one needs the same non-viewer part: one command or library call that turns
an address (run, moment, goal, state, kind) into a PNG and a table, with a registry where a new kind of diagnostic
is added once (R1, R3, R7), and where the spoiler rule (R6) is enforced before anything is listed or drawn. The
options differ in where the looking and the pointing happen. Calling that command cold pays Python and JAX start-up
each time (probably seconds; not measured); options with a warm process avoid it.

## 2. Eight worked-out options

E1. **Notebook cockpit in VS Code.** One notebook, `inspect.ipynb`, opened in VS Code's Jupyter editor. Its first
cell builds controls from the registry of views with ipywidgets: pickers for method, seed and run, a slider over the
~80 stored moments, a dropdown for the kind of view, a clickable map for goal and state (matplotlib's widget backend
`ipympl`, or an `anywidget` canvas), an "add column" button that puts a second run, method or seed next to the
first, a refresh button for a run that is still training, and a note box whose button appends the remark with the
current address and the image path to a remarks file. The kernel stays warm, so JAX and the loaded networks are
reused and scrubbing through training is fast.
The assistant cannot operate the widgets and cannot read a widget's picture from the notebook, so the cockpit also
writes what is on screen to a "current view" file (address, PNG, table), and the assistant calls the same library
headless. Claude Code can also run code in the open notebook's kernel through its built-in `mcp__ide__executeCode`
tool; each call inserts a cell and asks the user to confirm in a Quick Pick.
A lighter variant is a Python file with `# %%` cells in the Interactive Window: three variables at the top instead
of widgets (not covered by the pages I read).
- Sources: <https://github.com/microsoft/vscode-jupyter/wiki/Component:-IPyWidgets> (all ipywidgets, custom ones
  included, are supported); <https://github.com/microsoft/vscode-jupyter/wiki/IPyWidget-Support-in-VS-Code-Python>
  (widget scripts are downloaded from jsDelivr or unpkg, setting `jupyter.widgetScriptSources`);
  <https://github.com/matplotlib/ipympl> (0.10.0, January 2026); <https://proceedings.scipy.org/articles/NRPV2311>
  (anywidget lists VS Code as a platform); <https://code.claude.com/docs/en/vs-code> (`mcp__ide__executeCode`,
  NotebookEdit).
- Cost: the cockpit is code in a notebook that the assistant maintains (about a day or two on top of the shared
  view command; an estimate). Widgets in VS Code have a history of trouble: a 2025 report of `%matplotlib widget`
  figures not appearing, and custom widgets need their scripts from a CDN, so an internet connection or extra
  setup. A kernel has to be started and kept alive. The notebook file changes on every use. Remarks need the note
  widget; there is no built-in comment on a notebook output. Use from another machine goes through VS Code
  Remote-SSH (general knowledge, not checked).

E2. **The chat is the viewer.** No window at all. A `/inspect` skill tells the assistant how to turn a request into
a call of the existing view command: "wgcsl seed 3, halfway, value against truth, goal C4, next to seed 5". The
assistant asks multiple-choice questions when something is open (which run, which moment), runs the command (it
writes no new code), reads the PNG and the table itself, and answers with the table in Markdown, a link to the
image file, and its own reading of what the picture shows. Goal and state are named by cell labels printed on the
map, as on a chess board. A remark is simply the next chat message: it already has the conversation as context,
and the skill appends it with the address to a remarks file so a later session finds it.
- Sources: <https://code.claude.com/docs/en/skills> (a skill in `.claude/skills/<name>/SKILL.md` becomes
  `/name`); <https://code.claude.com/docs/en/agent-sdk/user-input> (AskUserQuestion: multiple-choice questions);
  <https://code.claude.com/docs/en/vs-code> (the open file and the selection are shared with Claude; `Alt+K`
  inserts `@file#5-10`; right-click "Claude Code: Add to Chat" in the Explorer).
- Not verified, and it matters here: whether the VS Code chat panel shows a PNG inline. The official page is
  silent, and user-filed reports from July to September 2026 say it shows an `[Image]` placeholder
  (<https://claudeissues.com/issue/95797-feature-vs-code-extension-show-images-inline-in-the-chat-panel-re-file-of-stale>).
  If so, the picture opens in an editor tab from a link, or is drawn as vector graphics by a mod (see E4). This
  session does have a plugin tool that draws charts into the chat from a table, which would cover score curves; how
  it looks in VS Code I did not check.
- Cost: smallest build (the view command and one skill file). Every look costs a model turn: seconds to tens of
  seconds and tokens, so scrubbing through 80 moments is not practical. The user chooses everything, but through
  the assistant, never without it. Side by side is a composed image per request. R7 holds by construction: the
  assistant sees each view before the user does.

E3. **Artifact review page with anchored comments.** For a question or a comparison ("three methods, seeds 1 to 3,
layout 2") the assistant publishes a private page on claude.ai: score curves and diagnostics of the chosen runs
together on one page, selectors for run, moment, goal and state that switch between data embedded in the page, and
columns for side by side. The user comments on a place on the page; a comment sent to Claude wakes the running
session, and comments stay on the page, so a later session reads them with the address they are pinned to. While a
run trains, the assistant republishes to the same link and open pages update in place; with the `db` capability it
can instead push new points into a small database the page listens to. The page opens in any browser signed in to
the account, so it also works from another machine.
- Sources: <https://code.claude.com/docs/en/artifacts> (private by default; republish to the same URL updates open
  views; comments reach the session through "Send to Claude" or `@claude`; 16 MiB page; images only as data URIs;
  no network requests except to five script CDNs and Google Fonts; plans Pro and up, signed in). First-hand in this
  session: the capability roster (runtime contract 0.2.98) lists `comments` with page-defined anchors, `db` with
  live snapshots, and `assets` (uploaded files up to 20 MiB each, referenced from the page), and the publish tool
  takes supporting data files (up to 255 files and 64 MB per publish), so data need not pass through the model.
- Not verified: that a single user on a personal plan can comment on their own unshared page (the docs describe
  comments from people the page is shared with in an organization). The docs say a published page cannot call
  local MCP servers; this session's roster describes `host:` servers that answer only in the Claude desktop app.
  I could not resolve that, so I assume no computation on demand.
- Cost: nothing is computed when the user clicks, so every goal and state the user may choose has to be computed
  before publishing; whether all goals of one run fit in 16 MiB depends on the maze size, which I do not know.
  Hundreds of runs do not fit in one page: it is a page per question, plus perhaps an index page. The data leaves
  the workstation for Anthropic's servers (private to the account), so the R6 filter must run before each publish,
  and it needs an internet connection. The assistant authors the page (tokens; a reusable template lowers that).
  The assistant reads the same data files locally, not the page.

E4. **An inspector pane inside the chat panel.** A Claude Code mod (a small plugin the assistant writes) opens a
pane beside the conversation in VS Code. The pane holds dropdowns for method, run, seed, moment and kind of view,
buttons for the previous and next moment, a field for goal and state as cell names, and the view itself as a
vector drawing. The mod runs the view command, refreshes on a timer while a run trains, and adds the pane's
current address to every prompt the user sends, so "why does it turn left here?" arrives together with run,
moment, goal, state and the paths of the image and table the assistant should read.
- Sources: <https://code.claude.com/docs/en/vs-code> ("A plugin containing a mod can draw in the chat panel",
  extension v2.1.299+). First-hand: the mod API types shipped with this build
  (`/tmp/claude-1000/bundled-skills/2.1.327/31e83a55421e1a3f8506d1b7a86319db/plugin-authoring/types/claude-code.d.ts`):
  on the `vscode` surface a pane can draw Box, Text, Button, Input, Select, Svg, Link, Code, Markdown and Progress;
  a hook on `prompt.submit` can rewrite the prompt text; `$.process` and `$.clock` run commands and timers.
- Limits read from those types: no raster image element in VS Code; an Svg holds at most 131,072 characters, must
  be pure vector (no embedded bitmap), and in the editor it is drawn as an image, so hover and clicks on the map do
  not work.
- Not verified: how much room a pane gets in VS Code, and whether two drawings side by side stay legible there.
- Cost: a TypeScript module the assistant maintains, on an API that is new. Views must also exist as small pure
  vector drawings, a second rendering path next to today's PNGs; or the pane holds only the controls and a link
  that opens the PNG in an editor tab, as a remote control. Side by side of many runs will be cramped.

E5. **Terminal light table in kitty.** A fuzzy finder over an index of all runs (method, seed, layout, score, date)
in kitty: typing filters the list, and the preview window shows the selected run's view as an inline image through
kitty's graphics protocol. Keys step the moment forward and back, switch the kind of view, mark several runs and
compose them side by side, and open the editor to write a remark that is stored with the address. A file-manager
variant: yazi, with a custom previewer that shows a run folder as its summary image.
- Sources: <https://newreleases.io/project/github/junegunn/fzf/release/0.43.0> (fzf: experimental kitty image
  support in the preview window; later a `fzf-preview.sh` example); <https://sw.kovidgoyal.net/kitty/kittens/icat/>;
  <https://yazi-rs.github.io/docs/image-preview> (yazi uses the kitty protocol; Lua previewer plugins, such as one
  that pipes any shell command); <https://code.visualstudio.com/docs/terminal/advanced> (VS Code's own terminal
  shows images only by the Sixel and iTerm protocols, so this option runs in a kitty window, not in VS Code's
  terminal panel).
- Not verified: use over SSH from another machine, and how fast the preview is when each step renders a new view.
- Cost: shell glue that tends to grow (fzf key bindings and reload commands). fzf calls the feature experimental,
  and there are reports of image previews breaking after updates
  (<https://www.github.com/hpjansson/chafa/discussions/139>). No clicking on the map: goal and state are typed or
  picked from a list. Every preview pays the command's start-up unless views are rendered beforehand or a warm
  render process runs. The assistant reads the same PNG and table files the preview shows.

E6. **Photo-manager light table.** Treat each rendered view as a photograph. The view command writes PNGs with
keywords and a description in their metadata (method, seed, layout, moment, kind, goal, state), and a photo manager
on the desktop does the rest: digiKam's tag tree and search find views without knowing where they are stored, its
Light Table puts two views side by side with synchronized zoom and pan, and the user's ratings, colour labels and
captions are written to an XMP sidecar file next to the image. The assistant reads those sidecars with `exiftool`,
and each remark is attached to an image whose metadata says exactly which run, moment, goal and state it shows.
- Sources: <https://docs.digikam.org/en/light_table/lighttable_overview.html> (Light Table, synchronized mode,
  per-side metadata panels); <https://docs.digikam.org/en/setup_application/metadata_settings.html> (reading and
  writing XMP sidecars);
  <https://sources.debian.org/src/libimage-exiftool-perl/12.16%2Bdfsg-2/html/TagNames/PNG.html> (ExifTool writes
  XMP into PNG); <https://bugs.kde.org/show_bug.cgi?id=508419> (a sidecar bug for writable files, fixed in 8.8.0).
- Not verified: that digiKam reads keywords from PNG reliably (one informal 2020 mailing-list answer says it
  should), and how quickly it notices new files while a run trains.
- Cost: only views that were rendered beforehand exist. An arbitrary goal and state needs a render first, and
  rendering everything multiplies quickly (hundreds of runs, 80 moments, several kinds, many goals), so rendering
  would be per run of interest. Tables and numbers have no natural place in a photo manager. digiKam is a large
  application with its own database, outside VS Code. Results and diagnostics appear together only if they are
  composed into one "run sheet" image.

E7. **A page on local files, without a server.** One static `inspect.html` in the results folder, opened from disk
in a browser, or in a VS Code tab with "Open in Integrated Browser". It lists runs from an index, draws fields from
stored arrays in the browser, has a slider for the moment, a click on the map for goal and state, and columns for
side by side. The address of the current view is in the URL (`#run=...&t=40&goal=C4`), so pasting the URL into the
chat is a remark with an exact anchor. A "Copy as prompt" button, or a link to
`vscode://anthropic.claude-code/open?prompt=...`, opens a Claude Code tab with the remark and the address filled
in. In a Chromium browser the page can ask once for the results folder (File System Access API), then read any
file in it and write the remarks file itself.
- Sources: <https://code.visualstudio.com/docs/debugtest/integrated-browser> (local `.html` files open in the
  integrated browser; setting `workbench.browser.autoReloadOnFileChange` reloads `file://` pages when files
  change); <https://code.claude.com/docs/en/vs-code> (the URI handler: the prompt is filled in, not sent);
  <https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker> and
  <https://caniuse.com/mdn-api_window_showdirectorypicker> (Chromium only; Firefox and Safari do not have it).
- Not verified: that the folder picker works on a page opened from `file://` (MDN requires a secure context); that
  a `vscode://` link clicked inside the integrated browser reaches Claude Code; that the integrated browser's "Add
  Element to Chat" and "Comment on Elements" reach any chat other than VS Code's own. From general knowledge, not
  checked: pages opened from disk cannot `fetch` neighbouring files, so data would be loaded as script files and
  images.
- Cost: this is a web app in one file, written and maintained by the assistant. Without a backend nothing is
  computed on a click, so every choice is limited to arrays written beforehand, and the view command has to write
  browser-readable data next to its PNGs. The assistant reads the same index, arrays and PNGs from disk, not the
  page. From another machine: copy or mount the folder.

E8. **A private VS Code extension for runs.** A small unpublished extension, loaded from a folder: a "Runs" tree in
the side bar (method, then seed, then run, with a filter); a custom editor bound to a run's settings file, so
opening a run from the tree, the Explorer or Quick Open shows the inspector instead of raw JSON; and VS Code's own
editor splits for side by side. A click on the map sends a message to the extension, which asks a Python process
for the view, so any goal and state can be computed on demand. A file watcher refreshes views while a run trains.
A "Remark on this view" command stores the remark with the address and can open Claude Code with both filled in.
- Sources: <https://code.visualstudio.com/api/extension-guides/custom-editors> (custom editors are webviews bound
  to file-name patterns; the webview talks to the extension by messages);
  <https://vscode-api.js.org/interfaces/vscode.CommentController.html> (the Comments API; its range provider takes
  a text document, so comment threads fit a view's table as text, and I found nothing that anchors one to a place
  in a picture); <https://code.claude.com/docs/en/vs-code> (URI handler). Existing extensions that cover parts:
  <https://github.com/wcong/PyDataViewer> (opens Python data files in a custom editor, generic);
  <https://github.com/dkzlv/local-review> (comment threads on any line, copied to the clipboard).
- Not verified: the tree view guide (not fetched; the API is long-standing), and that it runs unchanged over
  Remote-SSH.
- Cost: the largest build of the eight: TypeScript for the extension, JavaScript for the webview, and a bridge to
  Python. The assistant cannot see the webview, so the view command is still needed for R7. If the webview only
  shows images and tables that the registry produces, a new kind of diagnostic needs no change to the extension.

## 3. Other titles

- **Quick Pick tasks and two viewport files.** VS Code tasks with pick-list inputs run the view command into fixed
  files (`left.png`, `right.png`, `current.json`) kept open in an editor split; no interface code at all. Built-in
  pick lists are static; an extension fills them from a shell command
  (<https://code.visualstudio.com/docs/reference/variables-reference>,
  <https://github.com/augustocdias/vscode-shell-command>).
- **Stamped views and screenshot remarks.** Every rendered image carries a printed footer with its address; the
  user pastes a screenshot of whatever is on screen into the chat and the assistant reads the address from the
  pixels. Works with any viewer.
- **Sway "hanging protocol" with imv.** Tiled image-viewer windows driven by `imv-msg`; one key steps all tiles to
  the next moment together; the launcher is the run picker (<https://man.archlinux.org/man/imv.1.en>).
- **mpv scrubbing.** Training time as a video's time axis: each view an image sequence, frame-step keys, a key that
  writes a note with the frame number (from memory, not verified).
- **Blink comparator.** Flip between two aligned images of two runs at the same moment with one key, instead of
  placing them side by side.
- **Annotated PDF atlas.** One PDF per run, a page per moment and kind; highlights and notes made in the PDF viewer
  are read back by the assistant (not verified).
- **Markdown run cards in the VS Code preview.** Each run has a `card.md` with curves, images and a table; the user
  points by selecting lines, which Claude Code shares automatically, and types remarks into the same file.
- **Quick Open naming convention.** Pre-rendered files named `method__seed__t40__value.png`, so Ctrl+P is the
  finder and the editor grid is the comparison.
- **Runs table in a data viewer.** One table of all runs (settings, final scores, paths) opened in a VS Code table
  viewer to sort and filter.
- **A notebook per question.** The assistant leaves a short executed notebook per question; the user changes the
  address in the first cell and re-runs.
- **The kernel as shared instrument.** One long-lived Jupyter kernel with the networks loaded; the user works in
  the Interactive Window and the assistant through `mcp__ide__executeCode`, both calling the same `show(...)`.
- **"Add to Chat" as the remark channel.** Right-click a view file in the Explorer and choose "Claude Code: Add to
  Chat"; a sidecar file next to each image says what it shows.
- **Desktop notifications as the live feed.** When a run finishes, a notification with a thumbnail and an action
  that opens its view.
- **Diff editor for two runs.** VS Code's compare view on two runs' text summaries, to see what differs before
  looking at pictures.
- **The debugger as inspector.** Open a run paused in the VS Code debugger with the networks loaded, and look
  around from the debug console (unlikely).
- **Artifact page that calls a local server.** An Artifact whose page asks a local MCP server to compute views on
  demand; the roster in this session and the public docs disagree on whether that is possible.
- **Spreadsheet contact sheet.** A sheet with a row per run, images in cells and cell comments as remarks
  (unlikely).

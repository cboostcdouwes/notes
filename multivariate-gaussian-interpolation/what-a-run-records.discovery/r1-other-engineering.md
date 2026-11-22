# What a run records: options from other kinds of engineering (generator G)

Lens: engineering fields outside machine learning that must tell what produced an output, keep a small lasting
description of a large reproducible thing, or name things so that references stay valid. Only the brief was read;
no project file or code. Nothing here is ranked or judged.

How to read the sources: a claim with a URL was seen in a search result or a fetched page in this session. Claims
marked "(from memory)" were not checked this session. Costs are estimates, none was measured.

## Reformulations

**In the lens's terms.** Eight fields have the same problem under another name:

| Field | What the field calls the problem |
|---|---|
| Functional package management (Nix, Guix) | Realising a derivation; a store with garbage-collector roots |
| Climate modelling | Suite (experiment) management, restartability, "climate reproducibility" when bit-for-bit is not possible |
| Pharmaceutical manufacturing (GMP) | Master record and batch record; lot traceability; batch disposition; reserve samples |
| Archives and libraries | Accessioning, fixity, persistent identifiers, retention |
| Game engineering, tool-assisted speedruns | Replay (demo, movie) files; determinism; desync |
| Particle physics | Run bookkeeping, conditions data, data-quality certification, data tiers, reprocessing |
| Bookkeeping and audit | The audit trail: vouching a reported figure back to its source document |
| Research data management (neuroimaging) | Computational provenance capture; droppable derived data |

**Wider.** How does one person keep a small, trustworthy memory of everything they have made, so that any claim
resting on it can be checked or re-derived long after the thing itself is gone?

**Narrower.** What is a run's name, who or what issues it, and what are the few kilobytes filed under that name?

**Inverted (the need goes away).**

- Runs take 12 s to a few minutes. If no run is kept at all, only *claims* need a record: each reported number
  carries its own recipe and is recomputed when doubted. The run stops being a thing that is found; the claim is.
  (Options G1, G7 and the title "Clinical-report traceability" lean this way.)
- If every run is born from an entry written *before* it starts (a plan, a test matrix, a trial registration), a
  run is never searched for: the plan entry is found, and the run hangs under it. (Titles "Trial pre-registration"
  and "Wind-tunnel test matrix".)
- If training were exactly deterministic, the record would be the inputs alone and "the run" would be a function
  value. The brief says it is not deterministic today, so each option below says what its field does when a remake
  differs.

## Worked-out options

G1. Derivation and store with garbage-collector roots (functional package management): a run's name is the hash of the small recipe that makes it, its outputs live in a store that may be emptied, and a "root" is the only thing that keeps outputs alive.

- **What the field does.** Nix describes every build as a *derivation*: a small file (`.drv`) that lists the
  builder, the settings and every input, where inputs are themselves store objects named by hash. An
  input-addressed output's store path "is a function not of the output itself, but of the derivation that produced
  it", so the name is known before the build runs. Source code is copied into the store and named by hash too. The
  garbage collector deletes every store path that is not reachable from a *root*; roots are symlinks in a `gcroots`
  folder, and a build's `result` symlink is registered as one automatically. With the default settings
  (`keep-derivations` true, `keep-outputs` false) the derivations behind a root are kept while outputs that
  nothing needs are deleted. Asking for a missing output realises it again.
- **Carried over whole.** Before a run starts, a derivation file is written: method, every setting, seed, the hash
  of a snapshot of the code tree (the snapshot is itself stored by hash, which works without version control), the
  library versions, and the names of the runs it depends on (the run it continues from, for R13). The run's name is
  the hash of that file. Outputs go to `store/<hash>-<label>/` and nowhere else. A `roots/` folder holds named
  symlinks ("gcsl-baseline", "readme-table-2"); a collector deletes outputs not reachable from a root and keeps
  every derivation. A view or a continued run that needs a missing output triggers a remake. A human baseline
  session maps to what Nix calls a fixed-output derivation: something that cannot be built, only held, named by the
  hash of its content, and always rooted.
- **What the field does when a remake differs.** Nix treats two realisations of one derivation as interchangeable
  and offers a check build that rebuilds and compares. Under this option a remake has the same name as the run it
  remakes: the name means "any realisation of this recipe". Content-addressed derivations are the field's other
  mode, where the name depends on the output instead.
- **Cost.** Hashing the code tree and writing a small file per run (milliseconds, estimate). A store folder, a
  roots folder, a collector and a "realise" function, on the order of a few hundred lines of standard-library
  Python (estimate). The rule that everything that influences a run must be in the derivation: an input left out
  gives two different runs one name. Using Nix or Guix themselves is not needed for the pattern; Nix is
  LGPL-2.1 (from memory), actively maintained (manual 2.35 seen), a system-wide install with its own store and
  daemon; Guix is GPL-3 or later (from memory).
- **Sources.** https://nix.dev/manual/nix/2.34/store/derivation/outputs/input-address ,
  https://nix.dev/manual/nix/2.34/store/derivation/outputs/content-address ,
  https://nix.dev/manual/nix/2.34/package-management/garbage-collector-roots ,
  https://nixos.org/guides/nix-pills/11-garbage-collector.html

G2. Suite ID, rolling restart dumps and a statistical "same climate" test (climate modelling): a registry issues each experiment a short opaque ID at creation, the run can restart from periodic dumps, and "made again" is defined as statistically indistinguishable from an accepted ensemble.

- **What the field does.** At the Met Office and its partners a model experiment is a *suite* with an ID made of a
  prefix and a short unique part (two letters and three digits, for example `u-dr215`), issued when the suite is
  created or copied with `rosie copy`. The suite's `rose-suite.info` file holds its discovery information (owner,
  project, title), which feeds a searchable database. Places follow from the ID: the working copy sits under
  `~/roses/<ID>`, the output under `~/cylc-run/<ID>`. The model writes restart dumps at a set frequency
  (`DUMPFREQ`), a suite can be warm-started from a cycle point, and a new suite can start from another suite's
  dumps by naming the parent suite ID (`WARM_RESTART_RUNID`). Climate models are often not bit-for-bit reproducible
  (a new machine or compiler changes the bits), so the CESM community built the Ensemble Consistency Test: an
  accepted ensemble is made from runs with tiny initial perturbations, and a new run passes "if the new output is
  statistically indistinguishable from the distribution of the ensemble" (principal component analysis over global
  means). An ultra-fast variant tests after nine time steps.
- **Carried over whole.** A registry (one file) issues the next ID; the ID says nothing about content or place.
  The suite is a small folder under that ID with the complete settings and an info file (title, kind of run,
  method, why it was made). Outputs go to a scratch area whose path is derived from the ID, so a move of the
  scratch area changes one base path. A copy of a suite gets a new ID and records its parent. Restart dumps are
  written at a set frequency and a continued run names its parent ID. "Made again with the same conclusions" (R12)
  gets a definition and a test: per method a small accepted ensemble of seeds' score curves is kept in the lasting
  record, and a remake passes when it is statistically indistinguishable from that ensemble.
- **What the field does when a remake differs.** That is the designed-for case: the test replaces the bit
  comparison, and a failure means "the climate changed", which is investigated.
- **Cost.** A registry file and an ID counter. Extra runs per method to form the ensemble: cheap at 12 s to a few
  minutes, dearer when runs grow. A test (numpy is enough for global-mean style statistics) and a choice of which
  curves are the "global means". Keeping only the last few dumps is field practice (from memory), which bounds
  disk use per run. The tools themselves are far larger than the need: Rose and Cylc are GPL-3 (from memory),
  maintained by the Met Office, and Rosie needs a Subversion repository and a web service (from memory); pyCECT
  (NCAR; license not checked) depends on netCDF and MPI. The option carries the method, not the tools.
- **Sources.** https://www.ukca.ac.uk/wiki/index.php/Using_the_UM_Cylc8_test_suites ,
  https://github-wiki-see.page/m/ACCESS-NRI/accessdev-Trac-archive/wiki/access_RoseBriefTour ,
  https://research.csiro.au/access/wiki/access-training/access-cm2-training/using-cm2-suites-in-rose-and-cylc ,
  https://cms-helpdesk.ncas.ac.uk/t/cycle-point-for-restarting-suites/476 ,
  https://metomi.github.io/rose/doc/html/api/command-reference.html ,
  https://gmd.copernicus.org/articles/8/2829/2015/gmd-8-2829-2015.pdf ,
  https://www.cesm.ucar.edu/sites/default/files/2024-03/2024-cesm-sewg-abaker.pdf

G3. Master record, executed batch record and disposition (pharmaceutical manufacturing): each run copies the method's approved master in full, is filled in while it happens, ends with a release or reject decision, and leaves a small reserve sample when the bulk is gone.

- **What the field does.** Under 21 CFR 211.186 every product has a *master production record*, prepared by one
  person and independently checked. Under 211.188 each batch gets a *batch production record* that is an accurate
  reproduction of the master, checked, dated and signed, and then documents each significant step as it is done:
  dates, equipment, the specific identification of each batch of component used, actual amounts, in-process
  results. The master lists the ideal; the executed record shows what was actually used. Records are to be
  attributable, legible, contemporaneously recorded, original or a true copy, and accurate (ALCOA). The record is
  reviewed before the batch is released or rejected (211.192). A reserve sample representative of each lot is kept,
  identified by its lot (211.170). Records are held for a stated retention period (211.180).
- **Carried over whole.** Each method has a master record: its procedure and default settings, versioned. A run
  begins by copying the master in full into its own batch record under a new lot number, so the record never
  depends on what the defaults are later. Lines are then appended as the run proceeds: start time, code identity,
  the "component lots" (layout number, parent run, library versions), each evaluation point as it is measured, and
  deviations (interrupted, restarted, not-a-number). Because it is written during the run, the same file is what is
  looked at while it trains (R4) and what is left after a crash. The run ends with a disposition set by a reviewer
  (the user or the assistant): *released*, *rejected* or *quarantined*. Only released lots may be cited as
  evidence; the retention period follows from the disposition (R17). When the bulk (the 81 networks) is deleted, a
  reserve sample stays with the record: a small representative piece, identified by lot number. A probe is a
  development batch with a lighter master. A human baseline session is a batch whose operator is the user and whose
  raw data is the original record, which the field never allows to be replaced by a copy made later.
- **What the field does when a remake differs.** A remake is a new batch with a new lot number made from the same
  master; batches are expected to differ within specification, and the in-process limits in the master say what
  "within specification" is.
- **Cost.** One appended line per evaluation point; whether writing from inside the training loop slows a
  JAX-compiled loop is not known here (assumption to check against R16). A review step per run, which is attention
  from the user or the assistant, not machine time. One master record per method to keep current (R10). No tool is
  needed; plain files.
- **Sources.** https://www.ecfr.gov/current/title-21/chapter-I/subchapter-C/part-211/subpart-J/section-211.186 ,
  https://www.ecfr.gov/current/title-21/chapter-I/subchapter-C/part-211/subpart-J/section-211.188 ,
  https://www.law.cornell.edu/cfr/text/21/211.170 ,
  https://www.govinfo.gov/content/pkg/CFR-2019-title21-vol4/pdf/CFR-2019-title21-vol4-sec211-192.pdf ,
  https://www.pharmtech.com/view/frequently-asked-questions-about-batch-records ,
  https://www.beckman.com/resources/industry-standards/alcoa

G4. Accession register, bag with fetch list, and resolver (archives and libraries): a register issues a number that is never reused, the run is a self-describing package whose manifest lists every file including the absent ones, and all references go through a resolver.

- **What the field does.** An archive enters each arrival in an accession register and gives it a number that is
  not reused (from memory). The BagIt format (RFC 8493) packages an item as a folder with a declaration
  (`bagit.txt`), metadata as `key: value` lines (`bag-info.txt`), a payload folder (`data/`), and a payload
  manifest with a checksum per file; a bag is valid when every checksum verifies. `fetch.txt` lists payload files
  that are *not in the bag* but can be obtained elsewhere, each with a URL, a length and a path; the manifest still
  carries their checksums. For naming, the ARK scheme separates the name from the place: a resolver (a replaceable
  "name mapping authority", with N2T as a global fallback) maps the name to wherever the object is now, and adding
  `?info` to an ARK returns a metadata record and a *commitment statement*, the provider's stated promise about
  how long and how faithfully this object is kept.
- **Carried over whole.** An accession register file issues the next number at the start of a run. The run is a
  bag: settings, score curves and remarks in the payload; the networks and the experience stream listed in the
  manifest with checksum and size and also in `fetch.txt`, so their absence is a stated, valid condition and not a
  broken package. In place of a URL the fetch line gives how to obtain the file again, which here is the command
  that makes it. One resolver table maps accession number to current path; README lines, remarks and views cite
  the number, and a move changes one row (R1, R11). An `info` command on a number prints the metadata and the
  commitment: "kept for good", "outputs regenerable", "throwaway until <date>" (R17, R18).
- **What the field does when a remake differs.** BagIt has no notion of it: a regenerated file whose checksum
  differs fails validation. Carried over, the manifest line for a regenerable file would have to be rewritten on
  each remake, or checksums kept only for files that cannot be made again (the human session).
- **Cost.** Hashing 90 to 330 MB of networks at the end of a run, under a second to a few seconds (estimate).
  A register and a resolver table to keep. `fetch.txt` is bent from "URL" to "command". Tool: `bagit` (bagit-python,
  Library of Congress), version 1.9.0 of 2025-06-13, public domain by its PyPI classifier, a 23 KB source package
  with no dependencies, Python 3.
- **Sources.** https://www.rfc-editor.org/rfc/rfc8493.html , https://pypi.org/project/bagit/ ,
  https://libraryofcongress.github.io/bagit-python/ , https://datatracker.ietf.org/doc/html/draft-kunze-ark-44 ,
  https://en.wikipedia.org/wiki/Archival_Resource_Key , https://arks-stg.cdlib.org/about/ark-features/

G5. Replay file: header, input log, checksums and anchor state (game engineering): the lasting record is the stream of what went in, not the state that came out, in one format shared by the agent's runs and the human's sessions.

- **What the field does.** A game replay stores the seed and the inputs per frame, never the game state; the state
  is produced again by re-simulating, under the rule that the simulation may use only its seeded random generator
  and the recorded inputs. BizHawk's `.bk2` movie is a ZIP archive with a *Header* (format version, emulator
  version, core, platform, hash of the game), an *Input Log* (one text line per frame, one column per button or
  analog axis), *SyncSettings* (the core settings needed for the replay to stay in sync), *Comments*, *Subtitles*,
  and optionally a *CoreState*: a savestate the movie starts from, which is what makes a movie
  "savestate-anchored". Engines add periodic checksums of the state (for example every 30 frames) so that a replay
  that drifts from the original is detected as a *desync*, and full or delta keyframes so a viewer can seek.
- **Carried over whole.** A run's lasting record is one archive: a header (format version, code identity, method,
  maze number), the sync settings (every setting and the seed), and the input log, which for an agent is the stream
  the brief calls "what the agent experienced" (positions, actions, goals, resets; a few megabytes), plus periodic
  checksums and optional keyframes. A human baseline session is the native case: the gamepad input per frame is
  the input log, in the same format and opened by the same viewer, and it is the one part nothing can make again.
  The anchor state is a stored network that a continued run starts from (R13). Comments hold remarks; subtitles
  are remarks tied to a training step. Examining a run afterwards (R5) is playing its log with seeking.
- **What the field does when a remake differs.** It calls it a desync and treats it as a fault of the engine or
  its version, found by the checksums. Training here is not exactly repeatable, so the checksum slot would hold
  something compared with a tolerance (a score at that step), or the log is kept as a record of what happened and
  not as a means to re-simulate; a search result titled "OGN is a record, not a replay" names that distinction
  (page not read).
- **Cost.** Getting a few megabytes of experience out of the training loop per run and writing them; the slowdown
  in a JAX-compiled loop is not known here (assumption to check against R16). A file format and a viewer. Hundreds
  of runs at a few megabytes each is on the order of a gigabyte, before compression (estimate). A log of a layout
  shows the layout, so the blindness rule (R8) applies to the viewer and to the file. ZIP is in the standard
  library; no tool is needed. BizHawk is the format's source only.
- **Sources.** https://tasvideos.org/Bizhawk/BK2Format , https://tasvideos.org/Bizhawk/SavestateFormat ,
  https://svermeulen.github.io/trecs/advanced/recording-and-playback/ ,
  https://iron-curtain-engine.github.io/iron-curtain-design-docs/formats/save-replay-formats.html ,
  https://docs.rs/proof-engine/0.1.0/src/proof_engine/replay/mod.rs.html ,
  https://overgrid.swyx.io/blog/ogn-is-a-record-not-a-replay

G6. Run number, run registry, global tag, good-run list and data tiers (particle physics): runs are numbered by a counter and described in one queryable registry, what they depended on is a named frozen tag valid for a range of run numbers, and a separate certified list says which runs may be used as evidence.

- **What the field does.** Every data-taking run has a run number. In CMS the results of data-quality checks by
  shifters and experts are kept in the *Run Registry*; from it a JSON file of certified runs is produced, and each
  such list "describes which luminosity sections in which runs are considered good and should be processed".
  Analyses load the list as a filter. ATLAS does the same under the name Good Runs Lists. Calibration and
  alignment live in a *conditions database*: payloads that cannot be modified after creation, each attached to an
  *interval of validity* (a range of runs), collected under a *global tag* that is the top-level configuration of
  all conditions; a new global tag is usually created for every round of reprocessing. Good-run lists are named
  after the reprocessing they belong to ("22Jan2013ReReco", "Legacy2016"). Raw data is kept; derived tiers are
  made again in each reprocessing campaign (tiers: from memory).
- **Carried over whole.** A counter issues run numbers. A registry holds one row per run with the things it is
  searched by: kind (training, probe, human session), method, settings, seed, layout number, time, global tag,
  quality flags, where its tiers are (R11). A global tag is a named, frozen bundle of everything a run depended on
  besides its own settings (code state, library versions, maze version) with the range of run numbers it is valid
  for; a run cites its tag instead of carrying a copy (R3), and a network from run N is read with the tag whose
  interval contains N (R6). A good-run list is a small versioned file of run numbers certified as evidence; a
  report cites the list by name and only numbers from runs on it (R14, R17). Outputs are tiers with their own
  deletion rules: the record (kept), the experience stream, the networks, the pictures; making the upper tiers
  again is a named reprocessing campaign.
- **What the field does when a remake differs.** Reprocessing is expected to change derived data; that is why
  each campaign and each good-run list carries a name and a version, and results cite both.
- **Cost.** A registry schema that grows when a new thing becomes worth searching by. Someone has to cut a new
  global tag whenever code or environment changes; without version control that means a snapshot of the code tree.
  A certification step per run or per batch of runs. Tool: SQLite through Python's standard `sqlite3` module
  (public domain, no extra dependency) would hold the registry; the CMS and ATLAS systems themselves are not
  reusable.
- **Sources.** https://opendata.cern.ch/record/14210 , https://opendata.cern.ch/record/1000 ,
  https://atlassoftwaredocs.web.cern.ch/analysis-software/AnalysisSWTutorial/cpalg_grl ,
  https://software.belle2.org/sphinx/release-05-02-17/framework/doc/conditions-database.html ,
  https://indico.cern.ch/event/1280790/contributions/5380512/attachments/2638633/4565771/HSF%20Conditions%20Database%20use%20cases%20and%20requirements_v1.0.pdf ,
  https://indico.cern.ch/event/773049/contributions/3474768/attachments/1933595/3210589/ATL-COM-TILECAL-2019-040.pdf

G7. One append-only journal with vouchers and reversing entries (bookkeeping and audit): everything that happens to any run is a numbered line in a single text journal that is never edited, every list and index is a report computed from it, and a reported number cites its journal entry.

- **What the field does.** Bookkeeping enters every transaction in a chronological journal with a reference to
  its source document, the voucher (from memory). Posted entries are never modified: "corrections are made by
  posting reversing entries", so the original and its correction both stay visible. Ledgers, balances and
  statements are derived from the journal and can be produced again from it. An auditor *vouches* a reported
  figure back through the entries to the source document and *traces* a document forward into the reports (from
  memory). Plain text accounting keeps the journal as a text file that tools read and append to, with every report
  computed on demand; under version control each change to the journal is a reviewable difference.
- **Carried over whole.** The project has one journal file. Each event is an appended, dated, numbered entry: run
  made, run continued from entry N, outputs deleted, outputs made again, run cited in the README, run voided. An
  entry names its voucher, the run's settings file, held by content so it cannot change under the entry. Nothing
  is ever edited or removed: a wrong or superseded run gets a voiding entry that points at it, which also means a
  remake cannot destroy what came before (R2). There is no separate index to go stale: "all runs of method X",
  "runs whose outputs are on disk", "what the README rests on" are reports over the journal (R11). A number in a
  report carries its entry number, for example `[J-0412]`; vouching goes from the number to the entry to the
  voucher, tracing goes from a run to every report that cites it (R14). At the end of a working session the books
  are closed: the assistant checks that every cited number vouches.
- **What the field does when a remake differs.** A remake is a new entry that refers to the old one; both stay.
  Which of them a citation means is fixed by the entry number it carries.
- **Cost.** A fixed entry format decided early, a parser and a handful of reports (standard library). The journal
  grows for good, at a few hundred bytes per entry (estimate). Two processes appending at once need a lock. The
  field's tools are built for money and are not reusable here; for reference only: hledger (GPL-3), Beancount
  (GPL-2), Ledger (BSD), licenses from memory.
- **Sources.** https://plaintextaccounting.org/What-is-Plain-Text-Accounting ,
  https://beancount.io/docs/Solutions/transparent-and-auditable.md , https://man.archlinux.org/man/hledger.1.en ,
  https://citadel-739b83.gitlab.io/services/book-keeper/adrs/event-sourcing-for-audit-trail

G8. Run records in the version history with droppable content (research data management in neuroimaging): an existing tool, DataLad on git-annex, executes each run, commits the result with a machine-readable record of the command, and lets the large outputs be dropped and made again by rerunning the commit.

- **What the field does.** `datalad run` executes a command and saves the result as a commit whose message holds
  a run record (the command, its declared inputs and outputs); the commit hash identifies the run, and code and
  settings are in the same repository, so the commit is also the exact code state. Large files are *annexed*: the
  history tracks a pointer named by checksum, the content is stored apart and can be removed with `datalad drop`.
  `datalad rerun <hash>` executes the record again, fetching declared inputs if needed; the rerun is saved as a
  new commit under the original message, and a rerun that changes no content is not recorded. One worked example
  states the lifecycle directly: if every derived file came from a `datalad run` commit, those files "can be
  dropped from local storage (using datalad drop) and regenerated on demand". Rerun works only on commits made by
  `run` or `rerun`, not on a plain save.
- **Carried over whole.** The project becomes a DataLad dataset, which also puts it under version control. Every
  training run and probe goes through `datalad run` with its outputs declared; a run is referred to by its commit
  hash or a tag on it. Networks are annexed and dropped whenever disk is wanted; the pointers and the run record
  stay in the history, which is the small part that is backed up (R19). Making a run again is `datalad rerun`.
  A human baseline session is a plain save of its recording: kept, findable in the history, not rerunnable.
- **What the field does when a remake differs.** A remake with different bytes becomes a new commit; the earlier
  commit stays in the history with its pointers, though its content may be gone.
- **Cost.** One commit per run; with runs of 12 s the commit and checksum step may be a noticeable share (not
  measured). Code changes and runs share one history. Annexed files are locked against writing by default, which
  changes how outputs are overwritten. The run is committed when it ends, so seeing results while it trains (R4)
  is outside the tool. What is committed stays in the history, which matters for the blindness rule (R8). Tool:
  DataLad, MIT license, version 1.8.0 on PyPI (a Zenodo listing in the search results showed 1.6.0 dated
  2026-06-09; the two were not reconciled), Python 3.10 or later, about twenty Python dependencies (among them
  boto3, keyring, requests, python-gitlab, tqdm, msgpack), plus git and git-annex. git-annex is AGPL-3, written in
  Haskell, a large binary, actively maintained (all from memory).
- **Sources.** https://handbook.datalad.org/basics/101-109-rerun.html ,
  https://handbook.datalad.org/basics/101-113-summary.html , https://www.mankier.com/1/datalad-rerun ,
  https://stamped-principles.github.io/stamped-examples/examples/datalad-rerun-actionability/ ,
  https://pypi.org/project/datalad/

## Other titles

Not worked out; sources are given only where one was seen this session.

- **Slate and circled takes (film production).** Each take is named scene-and-take on a slate recorded into the
  take itself, the camera and sound reports list every take, and only the takes the director circles are printed.
  https://en.wikipedia.org/wiki/Script_supervisor
- **Concept name and version name (scholarly publishing).** Every run has two names: one for "this experiment,
  whichever making is current" and one for "this exact making"; citations use the second.
  https://zenodo.org/help/versioning
- **Signed provenance statement beside the artefact (software supply chain).** A separate small statement names
  the output by digest and lists the builder and the materials, so the output itself carries nothing (SLSA,
  in-toto, Debian `.buildinfo`; from memory).
- **Edit recipe in a sidecar (photography and video post-production).** The original is never touched; a small
  sidecar or edit decision list holds the steps, and every export or render is disposable (from memory).
- **Flight recorder ring buffer (aviation, runtime profilers).** Everything is recorded cheaply into a bounded
  buffer that overwrites itself, and a recording is kept only when something marks the flight as worth it (from
  memory).
- **Process historian with deadband compression (industrial control).** A value is stored only when it differs
  enough from the last stored one, which bounds what a long run writes (from memory).
- **Wind-tunnel test matrix and run log (aerospace testing).** Runs are numbered against a matrix written before
  the test; the run log notes configuration, conditions and anomalies per run number (from memory).
- **Trial pre-registration (clinical research).** A run is registered with its question and settings before it
  starts; the registry number appears in every report, and unregistered runs are not evidence (from memory).
- **Clinical-report traceability (drug trial statistics).** Every cell of a reported table has a documented
  derivation path back to the source data, kept in a machine-readable definition file (from memory).
- **Configuration baselines and as-built records (systems engineering).** Code and settings are frozen as a named
  baseline; a run cites the baseline and lists only its deviations from it (from memory).
- **Calibration certificate chain (metrology).** Each result cites the certificate of what it was measured
  against, so a continued run or a remade network leads back link by link to an original (from memory).
- **Accession and deaccession register (museums).** Numbers of the form year.lot.item are never reused, and
  removing an object is itself an entry (from memory).
- **Event log with disposable snapshots (databases).** The log of events is the truth; snapshots only make
  reading faster and may be dropped and rebuilt, and old log segments are compacted (from memory).
- **Materialised view (databases).** Outputs are declared as a query over the records; the system, not the user,
  decides when a result is kept, dropped or refreshed (from memory).
- **Viability retest (seed banks).** A sample of stored recipes is made again on a schedule to check that they
  still give the same conclusions, before the day one is needed (from memory).
- **Chain-of-custody tag (forensics).** Every handling of an item (moved, deleted, made again, continued) is a
  signed line on the tag that travels with it (from memory).
- **Bound notebook with numbered pages (laboratory practice).** A run is cited as notebook and page; pages are
  never removed and corrections are struck through, not erased (from memory).

Dropped as near duplicates while rewriting the list: lockfile of pinned inputs (inside G1), build-system target
cache (G1 with a different trigger), write-ahead intent record (inside G3), OAIS information packages (inside G4),
chess game notation (G5 without keyframes).

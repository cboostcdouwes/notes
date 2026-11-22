# R1 generator H: far fields (laboratories, record-keeping organisations, nature)

Lens: fields far from software that serve the same purpose. Only the brief was read; no project file or code.
Not ranked, not judged. Where a detail comes from general knowledge and not from a page found in the search, it says
"unsourced".

## Reformulations

- **In the lens's terms.** No far field calls this "run tracking". The names found:
  - museums: *accessioning*, *location and movement control*, *deaccessioning* (identity of a thing, kept apart from
    where it is and from whether it still exists);
  - pharmaceutical manufacture: *batch record*, *lot traceability*, *quarantine and release*;
  - experimental physics: *run registry*, *data certification*, *reprocessing*;
  - auditing: the *audit trail*, *vouching* and *tracing*;
  - law: *medium-neutral citation* (a reference that does not depend on where the text is printed);
  - records management and archives: *retention schedule*, *disposition*, *appraisal*;
  - art conservation: documenting a work that exists only while installed (*identity report*, *iteration report*);
  - clinical research: *allocation concealment*, *code break* (who may see what, and when);
  - games and sport: the *scoresheet* (keep the moves, not the positions), *ratification* of a record;
  - nature: recipe and organism (genotype and phenotype), and *which memories are kept*.
- **Wider.** How does a one-person research practice keep every claim it makes answerable months later: which
  evidence it rests on, whether that evidence still exists, and whether it could be produced again?
- **Narrower.** What has to be written down at the moment a run starts and while it goes, so that its bulky product
  can be thrown away the same day without loss?
- **Inverted (the need goes away).**
  - Nothing is found again because nothing is kept: a run is a performance of a recipe and is performed again each
    time it is wanted (the wall drawing that is painted over; the seed, not the plant).
  - Nothing is traced because no report holds a number: every reported number is recomputed from its runs when the
    report is built.
  - Nothing is sorted into keep and throw away because a rule fixed before the run (a trigger) already decided how
    much of it is recorded at all.

## Worked-out options

H1. The registrar's accession register (museums): a run's identity is a number given once from one register, marked
on everything the run produces, and kept apart from where the run is stored and from whether its outputs still exist.

- **What it is in its own field.** A museum gives each object a unique number, assigns it to the object and marks it
  physically on the object, and keeps an accession register listing acquisitions by number. The number is a code for
  identification and cross-referral only: the Spectrum numbering guidance advises against building catalogue
  information such as a classification or a storage location into it. Where the object is lives in a separate
  location and movement record that is updated on every move. When an object is disposed of, a file is opened on the
  disposal, the reasons are recorded and the exit is recorded; registrars' advice is "change the status, not the
  accession number". (That a number is never reused is common practice, but the search did not find it stated in
  Spectrum.) Objects that arrive but are not yet accessioned get an entry record of their own first (unsourced:
  Spectrum "object entry").
- **Carried over whole.**
  - One small register file in the lasting record, append-only. A run gets the next number before training starts.
    The number says nothing about method, layout or place.
  - The number is written inside every file the run produces ("marked on the object"), so a file that was moved or
    copied still says which run it belongs to.
  - A separate location record says where each run's parts are now. It can be rebuilt at any time by scanning for
    the marks, so moving things never breaks a reference (R1, R11).
  - Making a run again is a new accession whose entry names the earlier number as the one it remakes (R2).
  - Deleting networks is a status change in the register ("large outputs disposed, date, reason"); the entry stays
    (R18).
  - Entry before accession: every run first enters under a temporary number; accessioning is a separate act for
    runs worth keeping, and unaccessioned entries are cleared by rule (R17).
  - A probe and a human baseline session are other kinds of object in the same register (R7).
  - Roles and habits: one registrar (the assistant) issues numbers and nobody else does; nothing is ever cited by
    path, only by number; a periodic inventory check that register and shelves agree.
- **Cost.** One place that issues numbers; marking every output; the numbers are opaque, so a finding aid (a list by
  method, date, layout number) has to exist beside the register; the register says that a run exists, not what made
  it, so each number needs an object file as well; an inventory habit.
- **Sources.** https://www.obs-traffic.museum/sites/default/files/ressources/files/SPECTRUM_numbering.pdf ;
  https://edemocracy.coventry.gov.uk/documents/s59556/Appendix%208%20-%20SPECTRUM%20Deaccessioning%20and%20disposal.pdf ;
  https://community.aam-us.org/question/question-regarding-policy-for-handling-numbering-issues-in-certain-situations ;
  https://www.amnh.org/research/paleontology/collections/collections-management/acquiring-fossils/accessioning-and-deaccessioning

H2. Run number, data tiers and the good-run list (particle-physics experiments): runs are numbered, recorded in
tiers of which only the first is kept, judged after the fact, and only runs on a published list of certified runs
may be used for a result.

- **What it is in its own field.** Data taking at an LHC experiment is cut into numbered runs. The first copy of the
  RAW data is kept safe; the reconstructed and compact analysis formats (RECO, AOD) are derived from it and are made
  again by *reprocessing* when the software improves. Shifters and then detector experts judge the quality of each
  run; the verdicts are stored in a Run Registry; a data-quality group publishes a file that maps run numbers to the
  certified parts of each run, and every analysis must apply that list. The certification is repeated for each
  reprocessing. A trigger decides at recording time which events are kept at all; "scouting" streams keep a compact
  form of about 1% of the size for the rest. (Live monitoring plots and the shift logbook entry at run start and
  stop are part of the practice but unsourced here.)
- **Carried over whole.**
  - A run number from one counter.
  - Tiers fixed in advance: tier 0 is the lasting record (settings, seed, code identity, score curves); tier 1 is
    what the agent experienced; tier 2 is the networks. Tier 2 is derived and may be deleted and reprocessed (R18,
    R19).
  - A trigger rule, set before a run starts, says at which tier this kind of run records: a probe may record in the
    "scouting" form only (R15, R16, R17).
  - A verdict per run after it ends (good, bad, unchecked, with a reason), entered by the shifter (the assistant)
    and confirmed by the expert (the user).
  - A good-run list per report: a small file naming the certified runs the report's numbers may be computed from.
    The list is the trace from a number to its runs (R14) and the list of what must stay reproducible (R12).
  - Reprocessing campaigns: after a code change, the networks of listed runs are made again and the runs certified
    again (R6).
  - A logbook entry at each run start and stop, in words, by whoever is on shift.
- **Cost.** A verdict habit after every run; a list to maintain per report; three tiers to define for each kind of
  run; re-certification after reprocessing costs computing time; two roles for one person and one assistant.
- **Sources.** https://opendata.cern.ch/record/14210 ; https://opendata.cern.ch/record/1000 ;
  https://cms-opendata-guide.web.cern.ch/analysis/selection/validatedRuns ; https://arxiv.org/pdf/2404.06335 ;
  https://jinst.sissa.it/LHC/CMS/ch11.pdf ; https://arxiv.org/pdf/2408.03881

H3. The scoresheet and the sealed move (chess, baseball scorebooks): the lasting record is the sequence of moves,
written as they are played; positions are made again by replaying, and a game is continued from a sealed envelope.

- **What it is in its own field.** A chess game is kept as its moves, written move by move during play on a
  scoresheet that also holds clock times and draw offers; any position can be reached again by replaying. At an
  adjournment the player on move writes the next move without playing it; both scoresheets go into an envelope that
  shows the players' names, the position before the sealed move, the time each has used, who sealed and the move
  number; the arbiter keeps it. An ambiguous sealed move loses the game. If the envelope is lost, play continues
  from the recorded position; if the position cannot be re-established, the game is annulled and played anew.
  Retrosheet rebuilt decades of baseball games play by play from scorebooks, and marks as "deduced" the games it
  reconstructed from partial accounts.
- **Carried over whole.**
  - The lasting record of a run is what the agent experienced (positions, actions, goals, resets), written while
    training goes on, by the training loop itself, never filled in afterwards. That is R5 as the core of the record
    and not as an extra, and it can be read during the game (R4).
  - Networks are positions: they are reached again by replaying the training on the recorded experience (R18). The
    replay is as close as the learning step is repeatable, which the brief allows ("the numbers may differ").
  - A human baseline session fits the same sheet, and for it the sheet is the only record there can be (R7).
  - Continuing (R13) is an adjournment: an envelope with a fixed list of contents (the run, the step, the position
    to resume from, time used) held by the arbiter (the assistant). An envelope whose contents are ambiguous is
    invalid; a lost envelope means replaying to the position; if that fails the run is declared void and made anew.
  - Anything reconstructed from partial information is marked "deduced" for good.
- **Cost.** A few megabytes per run in the lasting record, which sits badly with keeping the lasting record small
  (R19) once there are hundreds of runs; writing during the run slows it (R16); the sheet of a run in a layout the
  user has not played shows that layout, so such sheets must stay sealed (R8); the method, settings and code still
  have to be recorded beside the moves (R3).
- **Sources.** https://rcc.fide.com/article8/ ; https://en.wikipedia.org/wiki/Adjournment_(games) ;
  https://www.fide.com/FIDE/handbook/LawsOfChess.pdf ; https://www.retrosheet.org/GameFiles.pdf ;
  https://retrosheet.org/game.htm

H4. Certificate, instructions and iteration report (conceptual art and time-based media conservation): the lasting
thing is the instructions plus a statement of what must stay the same; each execution is a new iteration with its
own report, and the executed thing itself is painted over.

- **What it is in its own field.** A Sol LeWitt wall drawing is owned as a certificate of authenticity and a diagram
  or instructions. When the owner moves, the wall is painted over and the drawing is installed again by approved
  drafters; no two executions are identical and all are the same work. Losing the certificate and diagram destroys
  the work. Museums that keep such works write two documents (templates from the Guggenheim's conservation
  department, taken up by the Met and the Hirshhorn): an *identity report* for the work, and an *iteration report*
  for every installation, which records who was involved, the space and equipment settings, the decisions taken,
  and whether the iteration was judged successful. The Variable Media Questionnaire asks the artist beforehand which
  relationships the work depends on and what to do when one breaks. Reports written long after the fact have to
  lean on secondary sources and stay incomplete.
- **Carried over whole.**
  - Two levels of identity: the *work* (an experiment: method, settings, code identity, the instructions) and the
    *iteration* (one run of it). A reference points at the work, which stays valid across remakes, or at one
    iteration (R1). A remake is another iteration, never a replacement (R2).
  - The identity report states what is essential and what may vary: the conclusions that must hold in any faithful
    iteration, and the numbers that are allowed to differ. That turns "approximately the same results" (R12) into
    something that can be checked.
  - The iteration report is written at the time of the run: what it ran on, what deviated, the outcome, and whether
    it counts as a faithful iteration when held against the identity report.
  - The networks are the painted wall: deleted without ceremony, because the work was never in them (R18).
  - Roles: the artist's interview (the user says, when an experiment is first run, what would count as the same
    conclusion); the drafter (the assistant) executes and writes the iteration report; nobody writes one later.
- **Cost.** A statement of essentials per experiment, which needs the user's judgement each time a new kind of
  experiment starts (R10); a judgement step after every remake; two levels of identity to keep apart; nothing in it
  helps to find a run or to watch one.
- **Sources.** https://landmarks.utexas.edu/blogs/conservation-case-study-wall-drawing-520 ;
  https://www.sfmoma.org/read/follow-the-lines/ ; https://blackbird.vcu.edu/v8n1/gallery/smith_e/lewitt_541.shtml ;
  https://www.metmuseum.org/about-the-met/conservation-and-scientific-research/time-based-media-working-group/documentation ;
  https://resources.culturalheritage.org/emg-review/?p=1599 ; https://vtape.org/critical-writing-index-article?id=4549 ;
  https://si.edu/TBMA/sites/default/files/downloads/hmsg_iteration-report-template.docx

H5. Master record, executed batch record, quarantine and release (pharmaceutical manufacture): each run fills in a
copy of an approved template while it goes, under its own lot number, and stays in quarantine until someone compares
the filled-in copy with the template and releases or rejects it.

- **What it is in its own field.** The master batch record is the approved template of the process. For each batch a
  copy is issued and filled in during production: the actual quantities, the lot numbers of the materials used,
  timestamps, signatures and deviations (21 CFR 211.188). The lot number ties the filled-in record to its master,
  and every manufacturing run gets a different one, for traceability and recall. Quality assurance compares the
  completed record with the master and the specifications and makes a documented decision to release or reject;
  until then the batch waits. (That a small reserve sample of every lot is retained is common practice, unsourced
  here. Terms vary by company.)
- **Carried over whole.**
  - One master per kind of run: the declared recipe and its default settings, itself versioned.
  - Each run issues a copy and fills it in as it goes: the settings as they were actually used, the lot numbers of
    its inputs (code identity, layout number, and the lot of the run it continues, which gives a line of descent for
    R13), a timestamp per stage, and deviations written down when they happen (a crash, a restart, a stop by hand).
  - Quarantine: a new run lands in a holding area that is cleared by rule. Release moves it to the kept runs;
    rejection is recorded with its reason. Only released lots may be cited (R17, R14).
  - A reserve sample: one small piece of each released lot is kept after the bulk is deleted, to check a remake
    against (R12, R18).
  - Roles: the operator (the training loop and the assistant) fills in; a different role (the user, or a written
    rule) releases. The one who made the batch does not release it.
- **Cost.** A master to keep current per kind of run (one may do while all methods share one training loop);
  writing during the run; a release step for every run that is to be kept; probes fit only if a looser
  "development batch" form exists; the reserve sample adds to the lasting record.
- **Sources.** https://www.pharmtech.com/view/frequently-asked-questions-about-batch-records ;
  https://gmpinsiders.com/?p=9636 ; https://www.glitter.io/glossary/batch-record ;
  https://www.govinfo.gov/content/pkg/CFR-2019-title21-vol4/pdf/CFR-2019-title21-vol4-sec211-192.pdf

H6. The auditor's working papers (accounting and audit): every reported number has a numbered paper that lists the
runs it is made of and must add up to it, with marks for each check done, so a number can be followed to its runs
and a run to the numbers that rest on it.

- **What it is in its own field.** For each line of the financial statements the auditor keeps a *lead schedule*: a
  working paper listing the ledger accounts that make up the line, whose total has to match the statement. It is
  the front page of its section and is cross-referenced to the supporting papers filed behind it. Working papers are
  numbered so they can be found. *Tick marks* are symbols for a check that was performed, always with a legend (for
  example F, "footed": the arithmetic was added up again). Undocumented changes to the papers afterwards are
  prohibited. *Vouching* follows a recorded figure back to its source document and *tracing* follows a source
  document forward into the records (the two directions are standard audit usage; the pages found name both terms
  without defining them).
- **Carried over whole.**
  - Each number in the README or a report gets a lead schedule: a small file with the number, how it is computed,
    and the runs it is computed from. Recomputing from the listed runs has to give the number ("it foots"). The
    report carries the schedule's index next to the number (R14).
  - A short fixed legend of tick marks for checks done on a run or a number (recomputed from the stored curves;
    made again and the conclusion held; settings compared with what was declared), each with a date.
  - Vouching as a routine: take a reported number and follow it to its runs. Tracing as the opposite routine: take
    a kept run and list the numbers that rest on it. Tracing tells what a delete would orphan, and a run that no
    schedule names is a candidate for throwing away (R17, R18).
  - Closing the books: when a report is declared finished, the runs its schedules name are frozen against
    replacement (R2).
  - Roles: a preparer (the assistant) writes the schedule; a reviewer (the user) initials it. No number is typed
    into a report by hand.
- **Cost.** A schedule per reported number and the discipline never to bypass it; it does little for runs that are
  never reported; it gives no live view and no way to continue a run; it presumes runs already have stable names.
- **Sources.** https://www.accountingtools.com/articles/lead-schedule ;
  https://auditnz.govt.nz/publications-resources/csf/lead-schedules ;
  https://accountingtools.com/articles/what-are-audit-tick-marks.html ;
  https://www.journalofaccountancy.com/issues/2017/nov/effective-audit-documentation/ ;
  https://theiia.org/globalassets/site/content/articles/global-knowledge-brief/2018/may/effective-work-papers_update.pdf

H7. Allocation concealment and the unblinded pharmacist (clinical trials): every run's record is split when it is
made into an open part and a sealed part, one named role may handle the sealed part, and opening it is a recorded
event that happens only after the user has played that layout.

- **What it is in its own field.** In a blinded trial the allocation code is held by people who do not assess
  outcomes. Only the unblinded pharmacist and pharmacy staff can reach the randomisation schedule, under signed
  statements filed in the trial master file. Sealed code-break envelopes stay unopened at the site until data
  collection ends, unless an emergency requires one; each opening is recorded with date, reason and the initials of
  whoever broke the code, and the sponsor is told at once. The whole trial is unblinded only after the analysis
  plan is signed and the database is locked. Sealed envelopes fell out of favour after reports of envelopes opened
  early or held up to the light.
- **Carried over whole.**
  - Every record, of every kind of run, has two parts from the moment it is created. The open part holds the
    layout number and what cannot reveal a layout. The sealed part holds whatever could: what the agent
    experienced, pictures, anything shaped like the maze (R8, R9).
  - One role is unblinded: the assistant. It may read sealed parts to do its work and never renders them into
    anything the user is shown.
  - A register of layouts, played or not played, that every view consults before it shows anything.
  - Unblinding is an event with a record: date, layout number, reason ("played in session S"). The human baseline
    session for that layout is recorded and closed first (the database lock); only then do the sealed parts of that
    layout's runs open.
  - A code break outside that order is a deliberate, logged act and never a side effect of browsing.
  - The "held up to the light" lesson as a habit: check for indirect leaks (file names, sizes, thumbnails, summary
    numbers from which a layout could be guessed).
- **Cost.** Two parts for every record; a played/unplayed register that has to be right; every view built to refuse
  sealed parts; the assistant has to report on blind runs in layout-neutral terms; by itself it covers R8 and R9
  and none of naming, finding or keeping.
- **Sources.** https://en.wikipedia.org/wiki/Code-break_procedure ;
  https://cdn.clinicaltrials.gov/large-docs/20/NCT03979820/Prot_000.pdf ;
  https://cdn.clinicaltrials.gov/large-docs/58/NCT05256758/Prot_SAP_000.pdf ;
  https://cdn.clinicaltrials.gov/large-docs/78/NCT02661178/Prot_000.pdf

H8. Evaporating trails and tagged memories (ant colonies, sleep): nobody decides which runs to keep; every run is
kept at first, fades unless it is used, and a pass between sessions makes lasting the ones that use has marked.

- **What it is in its own field.** An ant trail's pheromone evaporates all the time. A path lasts only while ants
  keep walking it and depositing more; an unused path fades without any ant deciding so, which lets the colony
  "slowly forget its past history" and keeps early choices from locking it in. (How much evaporation matters in real
  ants is unclear; the strongest evidence is from artificial ant systems.) In sleep, consolidation is selective:
  experiences get a salience tag at or soon after encoding (novelty, repetition, reward), the number of awake
  replays of an experience predicts whether it is replayed in sleep, replayed traces are strengthened and the rest
  are trimmed by synaptic downscaling. (Mostly rodent evidence.)
- **Carried over whole.**
  - Every run is recorded in full into a short-term store of fixed size. Nothing is sorted at the start.
  - Each run has a strength that falls with time and with pressure on the store. Every use deposits more: being
    opened, compared, shown in a figure, cited in a remark or a report, continued. Some events tag strongly at
    once: the first run of a new method (novelty), the best score so far (reward), a run the user remarked on.
  - A consolidation pass between sessions ("sleep"): runs above a threshold get their small record made lasting
    and their bulky outputs marked as remakeable; runs below it fade in stages, networks first, then what the agent
    experienced, the small record last or never.
  - The disk limit (R15) is the evaporation rate, and R17 has no decider.
  - Role: the assistant runs the pass at the end of a session and says what faded.
- **Cost.** Every reader has to record its use, or strength means nothing; a wrong fade is noticed only when the
  run is wanted (softened if the kilobyte-sized record never fades); thresholds to tune; less predictable than a
  written rule; a run that a report cites has to be pinned outright, which is a second mechanism beside the fading.
- **Sources.** https://www.Wikipedia.org/wiki/Artificial_Ants ; https://arxiv.org/pdf/1402.5611 ;
  https://pmc.ncbi.nlm.nih.gov/articles/PMC5826623 ; https://www.nature.com/articles/s41467-023-43939-z.pdf ;
  https://elifesciences.org/articles/07903v1

## Other titles

- H9. Notebook-page naming (laboratory notebook): a run is named by the bound, numbered page on which it was started
  (book, page, item); the front pages are a table of contents filled in when each entry begins; entries in ink at
  the time, signed, witnessed by someone not involved. https://chemlab.truman.edu/the-laboratory-notebook/ ;
  https://research.columbia.edu/sites/default/files/content/RCT%20content/ReaDI%20Program/Turro_Notebook_Procedures.pdf
- H10. Retention schedule by series (records management): how long a record is kept, from which cut-off date, and how
  it is disposed of are fixed per series when the record is made, not decided per item; some series need a review
  before disposal. https://archives.utah.gov/?p=9280 ; https://www.archives.gov/records-mgmt/scheduling/sch-records
- H11. Viability test and regeneration (genebanks): kept seed is germination-tested at set intervals and grown out
  again when viability falls below a threshold (85% in the FAO standards); here, a sample of kept records is made
  again on a schedule to check that they still "germinate". https://link.springer.com/article/10.1007/s10722-024-02019-x ;
  https://cropgenebank.sgrp.cgiar.org/index.php/47-procedures/quality-testing?start=4
- H12. Court-assigned neutral citation (law): year, court, serial number, with numbered paragraphs for pinpoints,
  given by the court itself and independent of any publisher or page; later reports are added behind it.
  https://free.law/advocacy/neutral-citations/ ; https://iclr.co.uk/knowledge/case-law/neutral-citations
- H13. Single-context sheets (archaeology): digging destroys what it studies, so each unit gets a unique number and a
  pre-printed sheet filled in before it is removed, finds are bagged with that number, and special sheets exist for
  special kinds (masonry, timber, skeletons), as probes and human sessions would have theirs.
  https://en.wikipedia.org/wiki/Single_context_recording
- H14. The ratification dossier (athletics records): a performance becomes a record only after an application with
  the instruments' evidence (wind reading, photo-finish image, zero test, complete results) inside a deadline; until
  then it is a mark and cannot be cited as a record. https://worldathletics.org/records/recordsrules ;
  https://www.usatf.org/resources/statistics/record-applications
- H15. Voucher and type specimen (herbaria): every published claim cites a specimen deposited where it will be
  curated, so the identification can be checked later, and a name stays permanently attached to one type; here, a
  small deposited piece of the run that a number cites. https://www.linnean.org/learning/type-definitions ;
  https://bioone.org/journals/Applications-in-Plant-Sciences/volume-1/issue-11/apps.1300076/Why-Vouchers-Matter-in-Botanical-Research/10.3732/apps.1300076.full
- H16. The watch log (ship's deck log, anaesthesia chart): entries at fixed intervals by whoever is on watch while it
  happens (at least every five minutes under anaesthesia), signed at the end of each watch, corrections struck
  through with one line and never erased. https://navyadvancement.tpub.com/12024/css/Ships-Deck-Log-70.htm ;
  https://anaesthetists.org/Portals/0/PDFs/Archive%20guidelines%20PDFs/Archived_guidelines_Standards_monitoring_anaesthesia_recovery_4th_2007.pdf
- H17. The tailor's pattern on file (crafts): the tailor keeps the customer's paper pattern, not the suit, and applies
  every later alteration to the pattern so it stays current; the record of a run is corrected forward the same way.
  https://steed.co.uk/bespoke/
- H18. Tree rings (nature; unsourced): the record is laid down inside the thing as a side effect of growing, so a
  stored network carries its own history and there is no separate record to lose or to mismatch.
- H19. The shrine rebuilt every twenty years (crafts and ritual; unsourced, unlikely): nothing is kept but the
  knowledge of how to build; every kept result is made again on a fixed cycle, and what cannot be made again is
  declared lost.
- H20. Work, expression, manifestation, item (library cataloguing, FRBR; unsourced): four levels of "the same thing",
  so that a reference can say whether it means the experiment, one setting of it, one run, or one copy of its files.

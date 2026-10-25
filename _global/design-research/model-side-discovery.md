# Model-side discovery

## Problem
In design-research runs, the better option keeps turning up when the current options are presented to the user: the
out-of-the-box thinking is done by the user, not by the model, although finding those options is what the skill is
for. The research must find them itself, before the user sees the options.

The bottleneck is generating novel options, not evaluating them: the skill already evaluates plenty (user, round 2).

## Related decisions
- Parent: `option-discovery.md` (decided 2026-10-24, "for now"): the leader is drafted and put through its real use
  each round; the user still does the discovery legwork (its D10, known gap). Installed 2026-10-25, not yet tested.
- Siblings: `requirement-reasons.md`, `skill-rule-following.md`, `skill-and-log-size.md` (all decided).
- Possible later child: fact-checking the claims each rejection rests on (round 1's O15, evaluation side; out of
  scope here, cheap on its own).

## Known so far
Cases where the user found the better option (P1-P3, H1-H3 in `option-discovery.md`; details in the rounds file).
The user, round 2: stop fitting the fix to how options were found in past conversations; look broadly. This run's
own experience: the reframing in other fields' terms and searching under those names (asked by the user at the
start) produced most of the options of round 1; two fresh generators in round 2 roughly doubled them.

## Reframings
Kept out of *Problem* so the generators don't inherit them (round 2 checks).

The same problem in other fields' terms (rounds 1-2), each with how that field answers it:
- Creativity research: *design fixation*, the first ideas narrow the next ones; LLMs show it too (Deng et al. 2026).
  *Problem finding*: time spent reformulating the problem predicts more original solutions (Getzels &
  Csikszentmihalyi). *Serial order effect*: later ideas are more original than the first.
- Machine learning: *mode collapse* after alignment (typicality bias); the *LLM hivemind* (outputs share one semantic
  space, even across vendors); *quality-diversity search* (fill an archive across niches, not one best answer).
- Organisations: brainstorming groups produce less than the same people working alone (*nominal groups*, 18 of 22
  experiments; Diehl & Stroebe 1987); *broadcast search*: winning solvers come from fields far from the problem's
  (Jeppesen & Lakhani 2010); public law's "range of reasonable alternatives" (NEPA); defence's *analysis of
  alternatives*, found too narrow when sponsors "chose a solution too early" (GAO).
- Engineering design: *design-space exploration*, morphological matrices, TRIZ, design-by-analogy, set-based design.

## Success criteria
- Judged by the user in the next real runs: the options that change the leader come from the research before the
  user names them; counted per run as "found by the model" vs "found by the user".
- No held-out cases remain; only new runs are a clean test.
- SKILL.md body stays under the size warning (~4,800 estimated tokens; installed now ~4,550 by chars/2.9).

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Status |
|---|---|---|---|---|
| M1 | The model finds novel options itself; the user isn't relied on to feed them | that discovery is what the skill is for; otherwise the legwork stays with the user | parent D10; user, round 2 ("do not rely on the user to feed options") | core (user, round 2) |
| M2 | The always-loaded skill stays followed reliably and cheap (measured by the size warning, ~4,800 est. tokens) | a bigger always-loaded skill is followed worse and costs more | parent D1b (user, 2026-10-24) | preference |
| M3b | Extra agents and time may go to finding options, scaled with the problem's size; evaluation needs no more | evaluation is already plentiful, novel options are the bottleneck; a small decision shouldn't pay a large one's cost | user, round 2 (replaces M3); round 3: "scale with the problem" | preference |
| M4 | The bias check isn't told the leading option | the researcher's bias reaches the check | parent D4 | preference |
| M5 | The rejection check stays focused on correcting wrongly filled information | each check's brief stays focused | parent D9 | preference |
| M6 | The wording fits programming first and other fields too, not shaped by the trial runs | the skill is mostly used for programming, also other fields | parent D7, D7b | preference |
| M7 | The skill is self-contained and sharable as one unit | sharable later | parent D3 | preference |
| M8b | Finding options doesn't inherit the researcher's anchors: its leader, its framing, an option list already written | a model reflecting on its own answer stops exploring (DoT), and the first options narrow the next (fixation) | inferred round 1 (Liang et al., Huang et al., Deng et al.); user, round 2: "must be fresh", discovery best "at the first step, when there is no bias in the options list yet" | core (user, round 2) |
| M10 | Generators aren't anchored on the solution the project has now | the project's current solution narrows what they look for, like an option list does | user, round 3 ("leave them blind to the current project") | preference |
| M11 | The generators' options stay relevant to what matters | options that miss the requirements cost evaluation, which isn't where effort should go | user, round 4 (chose *Problem* + *Requirements* over O32) | preference (reason inferred from the answer: unverified) |
| M9 | Discovery generalizes: it isn't fitted to how options happened to be found in a few past runs | fitted to a few cases, it misses what new problems need | user, round 2 | preference (stated firmly) |

## Options
| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O19 | Blind lens generators at the start of Phase 3 (`discovery.md`): before the researcher lists any option, fresh subagents, their number and lenses chosen by the researcher from the problem's purpose and size (user, round 3; far-apart fields serving the same purpose; the own field blind to the project), each given only a solution-free *Problem*, *Requirements* and its lens; each finds the problem in its lens's distant fields, searches under their names, writes 15+ titles (some unlikely ones), makes them distinct, works out 8. Their options open the list; rerun when *Problem* changes | M1, M8b (no option list yet; fresh context), M3b, M6, M7, M9 (no past cases in it); M2: +~400 characters (~4,690 tokens est.). Built from: nominal groups, broadcast search (distance), problem finding, persona + titles-first (Deng: beat the human baseline), verbalized tail | ~50K tokens and ~1 min per generator (measured twice), ~200K per research for four, in parallel; ~8K tokens of results for the researcher to merge; same model in every generator (hivemind); pooled prompts didn't beat titles-first alone in Meincke et al. | cheap | leading |
| O21 | Design-space map: after merging, lay the options on two or three axes of the design (morphological matrix; quality-diversity archive) and send generators at the empty cells | M1, M8b ~ (axes chosen after the list exists), M9; structural, where prompt wording alone raised single-idea novelty but not set diversity (IDEAFix, Heuresis, via the own-field generator; unverified) | a step per round and a second generator pass; axes may be chosen badly; overlaps the "radically different framings" bullet | cheap | add-on (user, round 3; in the draft) |
| O22 | Later rounds: rerun the generators with the current options as "things to avoid" (similarity seeding), instead of only when *Problem* changes | M1 in later rounds, M3b | the avoid list anchors them (M8b ~); a pass per round | cheap | add-on candidate (asked) |
| O20 | Researcher reframes the problem itself in Phase 1 (other fields' terms, search under their names), no agents | M3b, M6, no SKILL.md file read; what worked in round 1 when the user asked for it | same context: holds the user's proposal and the researcher's framing (M8b ~, core); SKILL.md +~150 characters | cheap | runner-up (its reframing runs in a context that already holds the user's proposal; tiebreak within M8b ~) |
| O23 | Red cell later in the research: the bias check also searches the web for missing options (round 1's O16) | M1 in later rounds; M4 ✓; no extra agent | it sees the options (M8b ~); widens the bias check | cheap | add-on candidate |
| O24 | Different models per generator (Sonnet, Opus, Haiku in Claude Code) | less shared bias | the hivemind spans vendors too; only one vendor's models in Claude Code (M6/M7 portability ~); unverified gain | cheap | trailing (tiebreak: no evidence of gain) |
| O25 | Phase 3 categories from public law and defence: an option outside your stack or jurisdiction; a non-code option first (process, training, policy) | M1 ~, M6; ~100 characters | "do nothing / change the process" already covers most of it | cheap | add-on candidate (small) |
| O26 | Anonymous pooling (design competitions): the researcher merges the generators' options without knowing which lens gave which | M8b | the researcher writes no option before merging under O19, so there is little bias to hide | cheap | trailing (tiebreak: nothing to remove) |
| O27 | Explicit far-analogy steps (design-by-analogy, BioSpark): abstract the function, find distant domains with that function, map their mechanism, transfer | M1, M6 | mostly in `discovery.md` step 1-2 already ("fields furthest away that serve the same purpose") | cheap | absorbed into O19 |
| O34 | Two own-field generators, one with the project's code and docs and one blind (user, round 3) | the blind one meets M10; the other finds what the project already has, free of the researcher's leader | the context one is anchored on the current solution (M10 ~); duplicates Phase 3's "what the project already has", which the researcher covers with the same context; +~50K per research | cheap | in the leader as drafted: a lens for large problems in an existing project (user, round 4); the grades are for the "always" form |
| O32 | Generators get *Problem* only, not *Requirements* (found by the map's empty cell "fresh agent, before requirements") | M8b: *Requirements* are written by the researcher and may carry its framing | more options that miss what matters; Phase 2 already words requirements as needs | cheap | trailing (user, round 4: generators keep *Requirements*) |
| O33 | The round report shows the design-space map, not only the list (found by the map's empty cell "structure shown to the user") | gaps in the space are visible; the own-field generator's inverted reformulation | M1 ~: the user may still fill the gaps; report length (parent D5) | cheap | not chosen (user, round 4) |
| O35 | Requirement-relaxation lens: a generator gives one option per requirement that breaks or relaxes it | assumed requirements hide the best option (the skill's own Phase 2 warning; H1 in the parent); M1, M8b | one more generator (M3b, scaled); options that break core requirements are noise unless the requirement is wrong | cheap | out of scope here: better suited to the bias or requirement check (user, round 4); open child |
| O36 | User-context generator: one generator gets the user's context (notes, earlier decisions, stated preferences), not the project's code nor the researcher's options | targets the other explanation of past misses: the user won by context, not by free thinking | user notes may not exist outside this setup (M6, M7 ~); anchored on past preferences | cheap | trailing (user, round 4: little benefit overall) |
| O29 | Simulated-user gate: just before the options are shown, a fresh agent gets *Problem*, what is known of the user's context, and the options, and answers "what would this user propose that beats these?" | M1 at the moment it failed in past runs | sees the options (M8b ~); one agent per round (M3b: discovery, so acceptable); simulators are too cooperative (Zhou et al.); close to round 1's first-look check, but on the option list, not the draft | cheap | not chosen (round 2) |
| O30 | Miss diagnosis: when the user names a better option, record why the research missed it (context it lacked, a hidden requirement, a field never searched) and propose the fix to the skill | M1 over time; M9 (a cause, not a list of moves) | one `decision.md` line; acts only after a miss | cheap | not chosen (rounds 2 and 4) |
| O31 | Needs-first problem finding with the user: ask about the goal behind the request, not for options | M1 (asks for needs, not options) | Phase 1-2 already do this (restate without the solution; ask what each requirement protects) | cheap | absorbed (already in the skill) |
| O1 | Do nothing: test the parent's change first | no work | discovery stays with the user (M1 ✗, core) | cheap | not applicable (M1, core) |
| O14 | Ask the user earlier for the shape they expect | cheap | hands discovery to the user (M1 ✗, core) | cheap | not applicable (M1, core) |
| O2, O3, O9, O13, O18 | Titles first; personas/fields as sampling cues; verbalized sampling; TRIZ; ensembles | | | cheap | absorbed into O19 (O13 as a field a generator may use) |
| O4, O5, O6, O7, O8, O10, O11, O12, O15, O16, O17 | Round 1's evaluation-side options (first-look check on the draft, moves catalogue, fact-checked rejections, debate, set-based drafting, counter-plan, ...) | | add evaluation, which isn't the bottleneck (M3b); O5's moves list is fitted to past cases (M9) | cheap | trailing (M3b; O5 also M9); O15 a possible separate change |

## Matrix
| Option | M1 | M2 | M3b | M4 | M5 | M6 | M7 | M8b | M9 | M10 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| *status* | core | preference | preference | preference | preference | preference | preference | core | preference | preference | |
| O19 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ M8b (the researcher writes *Problem* and picks the lenses; user accepted, round 3) |
| O21 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ M8b |
| O22 | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ M1, M8b |
| O20 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ~ | ~ M8b, M10 (the researcher reframes with the project's current solution in view) |
| O23 | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ M1, M8b |
| O24 | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ~ M6 (only Claude models in Claude Code; other tools differ) |
| O25 | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ~ M1, M8b |
| O34 | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ~ M3b, M10 |
| O32 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| O33 | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ M1 |
| O35 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| O36 | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ~ | ✓ | ✓ | ✓ | ~ M6, M7 |
| O26 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| O1 | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ | ✗ M1 |
| O14 | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ M1 |
| O4-O17 (evaluation side) | ~ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ~ (most run in the researcher's context or see its options) | ✓ (O5 ✗) | ✓ | ✗ M3b |

M1 ✓ for O19 means it targets discovery itself at the right moment; whether it beats the user is only shown by runs.

## Evaluation
Draft of the leader (O19), as the exact text, in `<scratchpad>/msd-draft/` (round 1's draft kept in
`<scratchpad>/msd-draft-round1/`):
- new `discovery.md` (round 3): *Choosing the generators* (number and lenses by purpose and size; own field blind to
  the project; far fields serving the same purpose; for a large problem in an existing project, also the own field
  with the project), *The design-space map* (two or three axes, empty cells become lenses of more generators), and
  *Brief for a generator* (four steps);
- SKILL.md Phase 3, new first paragraph: "Start with discovery, before listing any option yourself (`discovery.md`):
  fresh generator subagents, each given only *Problem*, *Requirements* and its lens. *Problem* holds no option hints
  or other fields' terms: finding those is their job. Their options open the list, placed on a design-space map whose
  empty cells get more generators. Run them again when an answer changes *Problem* or *Requirements*." ("List options" becomes "Then
  list options".) SKILL.md body 13,596 characters, ~4,690 tokens est. (~110 left to the warning).

Stress test of the map (round 3, by hand on this log's options): axes *when* (start, each round, before showing,
after a miss), *who* (fresh agent, researcher, user), *form* (prompt wording, structure, process rule). Empty cells
gave two options nobody had listed: O32 (fresh agent before requirements: generators get *Problem* only) and O33 (a
structure shown to the user: the report shows the map). Cost: a few minutes of the researcher's time, no agent.

Stress test (real use, round 2): two generators (own field; organisations and people) on this problem, given only a
solution-free *Problem* and the requirements (`<scratchpad>/gen-input.md`). 49K and 50K tokens, 61 s and 64 s, 13 tool
calls each. Each returned 5-6 reformulations, 8 worked-out options with sources and 13-19 more titles. Against my
round 1 list (14 options), roughly half were new: broadcast search and distance, NEPA's alternatives rules, defence's
non-materiel-first, anonymous design competitions, patent classification as a map of neighbouring fields, the
design-space map with empty cells, far-analogy pipelines, similarity seeding, heterogeneous models with a facet-based
novelty check. Overlap: nominal groups, set-based design, morphological analysis, verbalized sampling, personas +
titles-first, TRIZ, step-back. Both stayed within the brief; neither ranked. Not shown: the science and engineering
lenses (not run), and whether this finds a leader-changing option in a programming problem.

Why the user would reject it once in use: four generators on a small decision are heavy (~200K tokens) and the merge
of ~60 titles may be skimmed; the lenses read as fixed even where a field is far-fetched.

Rejection records:
- O1, O14, not applicable (M1, core, user round 2): both leave discovery with the user. Best variants (O1 with a
  stopping rule; O14 asked after the generators) still leave M1 to the user, or reduce to O19.
- O20, runner-up: M8b ~ is shared with O19 (both get the researcher's framing) and doesn't count against it. The
  real difference, within M8b's own wording ("its leader, an option list already written"): O20 reframes in the
  researcher's context, which already holds the user's proposal and, after round 1, the option list and leader;
  O19's generators never see those. And M10 ~: the researcher reframes with the project's current solution in view.
  O20 wins on M2 and cost (no agents). Comes back if a run shows the generators add nothing the researcher's own
  reframing doesn't.
- O24, trailing (tiebreak, plus M6 ~): no evidence the gain is real; the hivemind spans vendors. Comes back if a run shows the
  generators converging.
- O26, trailing (tiebreak): it hides which lens gave an option, not how familiar an option looks, and the anchoring
  at the merge (Harms) is about familiarity; so it doesn't address the remaining bias. No requirement fails: it trails
  on a tiebreak only, and comes back if a run shows the merge dropping the generators' options (round 3 bias check).
- Evaluation-side options (O4-O17), trailing (M3b, preference; O5 also M9): they spend effort on judging options,
  which the user says is already plentiful. O15 (fact-checking rejections) stays a cheap separate candidate.
- O21, O22, O23, O25, O29, O30: add-ons, not rivals; asked.
- O31, absorbed: Phase 1-2 already ask for needs, not options.
- O34 (user's proposal, round 3: always two own-field generators, with and without the project): the blind one is in
  O19. The context one: M10 ~ (anchored on the current solution, as the user's own remark says) and it repeats Phase
  3's "what the project already has", which the researcher covers with the same project context; +~50K each time.
  Its gain: that search runs free of the researcher's leader (in round 1 there is none yet, only the user's
  proposal). Best variant, drafted: a lens the researcher adds for large problems in an existing project. Asked.
- O32, O33: add-on candidates from the map. O32 is ✓ on M8b where O19 is ~: it removes the researcher's
  *Requirements* (and their framing) from the generators; its cost (options that miss what matters) is covered by no
  requirement. By the grades it improves the leader on a core requirement: asked as such, not as a tweak. O33 ~ M1: the user may fill the visible gaps instead of the research.

Round 2 checks: the rejection check found O19's M8b overstated (the generators get the researcher's *Problem*, and
this log's *Problem* held its reframing); fixed by a draft rule (*Problem* holds no option hints or other fields'
terms) and by moving this log's reframings to their own section. The bias check found the generators blind to the
project (the own-field lens now reads its code and docs), the fixed lenses copied from this run (M9 ~), and a
possible confound: in past cases the user may have won by context (hidden requirements, project knowledge) more than
by creativity; generators without that context share the gap. Novelty evidence measures novel ideas, not whether they
change the leader.
Round 3 checks: the rejection check found O20 charged an M8b cost O19 shares (record rewritten around the real
difference), O20's M1 ~ and O24's M7 ~ stretched, O26's M1 ~ unexplained (removed), O34 graded in its "always" form,
and O32 better than the leader on M8b (now asked as such). The bias check found the rerun trigger too narrow (hidden
requirements change *Requirements*, not *Problem*: fixed in the draft), new options O35 (relaxation lens) and O36
(user-context generator), and again the untested cause: whether the user won by context or by free thinking; O30
(miss diagnosis) is the only option that tells them apart. More options also means more to evaluate.
Harms (O19):
- Cost ~50K tokens per generator, plus one per empty cell of the map, each time *Problem* changes. The researcher
  sizes it; a researcher in a hurry may pick one lens for everything (the skill gives "one or two for a small decision"
  as the floor).
- The researcher picks the lenses and the map's axes: its framing reaches the generators through those (M8b ~,
  accepted by the user in round 3).
- Convergence: all generators are the same model; their lists may overlap (in the test, overlap was about half of each
  list with mine, less with each other).
- Merge load: ~60 titles; a hurried researcher keeps the familiar ones (the anchoring moves to the merge). The rule
  "their options open the list" keeps them in, but evaluation may still favour familiar ones.
- Web noise: generators cite preprints; the researcher still cross-checks deciding claims (Phase 3 rule).
Reversibility: every option cheap (skill text and one brief).

## Open questions
None deciding. Answered round 4: generators keep *Requirements* (O32 out); the project-context lens only for large
problems (O34 as drafted); O30, O33, O35, O36 not chosen; no rerun on *Requirements* changes; the bias check's ideas
are suspect by default (user).
Answered round 3: budget scales with the problem; lenses chosen by the researcher; O21 in; O22, O23, O25, O29, O30 not
chosen.

## Sources
| Claim | Source (URL or `file:line`) | Date | Reliability |
|---|---|---|---|
| LLMs show fixation; titles first, then made distinct, then expanded reduces it; ordinary personas as sampling cues increase collective diversity; both combined beat the human baseline | https://arxiv.org/abs/2602.20408 (Deng, Brucks, Toubia), text read; CoT cross-checked: https://papers.ssrn.com/abstract=4708466 (Meincke et al.) | 2026-10-25 | preprint, read |
| Pooling idea sets from different prompts did not beat CoT on diversity | Deng et al. 2026 §2 citing Meincke et al. 2024 | 2026-10-25 | secondary in a read preprint |
| Alignment narrows output diversity; asking for several answers with probabilities raises diversity 1.6-2.1× | https://arxiv.org/abs/2510.01171 (Zhang et al., ICML 2026); also found by the own-field generator | 2026-10-25 | peer reviewed, abstract |
| Self-reflection stops exploring once confident; intrinsic self-correction doesn't improve reasoning | https://arxiv.org/abs/2305.19118; https://arxiv.org/abs/2310.01798 | 2026-10-25 | peer reviewed, abstracts |
| Nominal groups outperform interacting brainstorming groups (18 of 22 experiments); production blocking is the main cause | https://en.wikipedia.org/wiki/Production_blocking; Diehl & Stroebe 1987 via https://homepages.se.edu/cvonbergen/files/2013/01/Productivity-Loss-In-Brainstorming_Toward-the-Solution-of-a-Riddle.pdf | 2026-10-25 | secondary, consistent |
| Problem finders produced more original work | Getzels & Csikszentmihalyi, via https://thereader.mitpress.mit.edu/the-1960s-art-school-experiment-that-redefined-creativity/ | 2026-10-25 | secondary only |
| LLM far analogies changed problem formulations in ~80% of cases | Ding et al., C&C 2023, via search abstract (https://ar5iv.labs.arxiv.org/html/2302.12832) | 2026-10-25 | abstract only |
| Winning broadcast-search solvers come from fields far from the problem | https://dash.harvard.edu/bitstream/1/3351241/2/Jeppesen_Marginality.pdf (organisations generator) | 2026-10-25 | primary, not read by me: unverified |
| Prompting raises single-idea novelty but not set diversity | IDEAFix, Heuresis (own-field generator: https://arxiv.org/pdf/2605.09764, https://arxiv.org/pdf/2606.00875) | 2026-10-25 | not read by me: unverified |
| Later ideas are more original (serial order effect), also in LLMs | human literature consistent; LLM: preprints.org 202609.2250 | 2026-10-25 | human: well established; LLM: one preprint |
| LLM user simulators are too cooperative | https://arxiv.org/abs/2603.11245 | 2026-10-25 | preprint, abstract |
| Generator cost ~50K tokens, ~1 min each | measured, round 2 (two runs) | 2026-10-25 | measured |
| SKILL.md body: installed 13,202 characters; draft 13,444 (~4,640 tokens by chars/2.9) | measured | 2026-10-25 | measured |

## Round checklist
Checklist:
- [x] Log (first round): its path in the report; new or resumed, and what was outdated (n/a: round 3)
- [x] Problem and success criteria (first round): stated without solution words (n/a)
- [x] Scope: split, widened or unchanged (unchanged)
- [x] Requirements: new or changed ones, each a need (no mechanism) with reason, source and status (M3b amount, M10 new)
- [x] Replaced requirements: new IDs, old rows moved; options re-checked from the old matrix column (n/a: M3b sharpened, same meaning)
- [x] Written requirements: evidence found for each (commit, decision log) (n/a)
- [x] Deciding unverified requirements: asked this round, or assumptions after "can't answer" (none deciding; O34, O32, O33 asked)
- [x] Options: added, by the categories of Phase 3 (O32-O34)
- [x] Searches: recorded in the round's entry; or "no web search", said in the report (no web search this round; said in the report)
- [x] Deciding claims: cross-checked against a second source, or marked unverified (n/a)
- [x] Matrix: updated
- [x] Rejection records: one per trailing or not applicable option (scenario, best variant, leader's cells compared)
- [x] Harms: scenarios for the leading option
- [x] Reversibility: every option rated; one-way means extra stress-testing, said in the report (all cheap)
- [x] Draft and stress test: of the leading option; the draft's path in the report (map tried on this log)
- [x] Bias check: findings in the log and the report; or "not independent"
- [x] Rejection check: findings in the log and the report; verdicts corrected
- [x] Ranking change: recorded
- [x] Report: what changed, recommendation, runner-up, core rejections, the checks' findings
- [x] Questions: deciding unverified ones first, ordered by ranking impact, through the question tool, remarks last (O32, O34-O36, O30, O33)
- [x] Pushback: if the user picked a worse option, asked what makes it better (O30 asked again)

## Rounds
- Round 1: reframed in five fields; leading O4 + O5 + O15 (first-look check on the draft, moves list, fact-checked
  rejections), runner-up O1.
- Round 2: user: novel options are the bottleneck, not evaluation; fresh discovery is core, at the first step; no
  fitting to past cases. Leader O19 (blind lens generators at the start of Phase 3); two generators run on this problem
  added ~half new options; evaluation-side options trail (M3b); O1, O14 not applicable (M1 core).
- Round 2 (after the checks): *Problem* kept solution-free for the generators; own-field lens reads the project;
  O19 ~ on M8b, M9; O29-O31 new; O20 runner-up depends on the cost answer.
- Round 3: user: scale with the problem, the researcher picks number and lenses, the map in, generators blind to the
  project (M10), proposes two own-field generators (O34). Draft redone; the map tried on this log found O32, O33.
  After the checks: rerun also on *Requirements* changes; O35, O36 new; O20's record rewritten; no ranking change.
- Round 4: answers keep the draft (rerun on *Requirements* changes reverted); no new requirement that moves the
  ranking, no ranking change: stop condition met. Decision drafted.

## Decision
Reviewed by the user, 2026-10-25 ("seems good, go ahead"; asked whether the generators search the web: they do,
step 2; the brief now also says to load the search tool first, as the test prompts had to). Installed 2026-10-25:
SKILL.md Phase 3 paragraph, new `discovery.md`; SKILL.md body ~4,690 tokens est.; backup of the old skill in the
session scratchpad (`design-research-before-model-side-discovery/`). Added after the review (user): Phase 4 step 5,
the bias check's proposals are candidates to weigh, not findings to adopt (~4,710 tokens est.).

**Choice:** O19 + O21, blind generators at the start of Phase 3 and a design-space map (draft in
`<scratchpad>/msd-draft/`, SKILL.md body ~13,600 characters, ~4,690 tokens est.):
1. SKILL.md Phase 3 opens with discovery: before listing any option, the researcher runs fresh generator subagents,
   each given only *Problem*, *Requirements* and a lens; *Problem* holds no option hints or other fields' terms. Their
   options open the list, placed on a design-space map whose empty cells get more generators; they rerun when an
   answer changes *Problem*.
2. New `discovery.md`: choosing the generators (number and lenses by purpose and size; the own field blind to the
   project; far fields serving the same purpose; a with-project own-field lens only for large problems in an existing
   project), the design-space map, and the generator brief (find the problem in distant fields, search under their
   names, fifteen titles first including unlikely ones, made distinct, eight worked out with sources).

**Why:**
1. Novel options are the bottleneck, not evaluation; the model must find them itself (M1, core, user round 2) and
   fresh, before any option list exists (M8b, core, user round 2; the first-step timing is the user's remark).
2. Spend on discovery scaled with the problem, chosen by the researcher (M3b, preference, user rounds 2-3).
3. Generators blind to the project's current solution (M10, preference, user round 3).
4. The map: the user picked it (round 2); tried by hand on this log, its empty cells gave two new options.
Evidence it rests on: independent generation beats interacting groups (nominal groups); distant solvers win
(broadcast search, unread by me); problem finding first; titles first then made distinct, with varied cues (Deng et
al. 2026). Real use: two generators on this problem, ~50K tokens and ~1 min each, about half their options new.

**Rejected (closest first):**
- O20, the researcher reframing in its own context: it already holds the user's proposal and the project's current
  solution (M8b, M10); comes back if generators add nothing over it.
- O32, generators without *Requirements*: user, round 4 (options stay relevant).
- Round 1's evaluation-side leader (first-look check, moves catalogue, fact-checked rejections): evaluation isn't the
  bottleneck (M3b); the catalogue was fitted to past cases (M9).
- O1 (test the parent change first), O14 (ask the user earlier): leave discovery with the user (M1, core).
- O29, O30, O33, O36, O22, O23, O25: not chosen by the user; O24, O26: tiebreaks.

**Known gaps:**
- Untested whether past misses came from free thinking or from context the model lacked; blind generators don't help
  with the second (bias checks rounds 2-3; O30 not chosen).
- The researcher still writes *Problem* and *Requirements*, picks the lenses and the axes, and merges: its framing
  reaches the generators through those (M8b ~, accepted).
- Novelty evidence measures novel ideas, not whether they change the leader; only real runs show that.
- All generators are the same model (hivemind); more options also mean more to evaluate.
- Only two of the lenses were run for real; no programming problem tried yet.
- ~110 tokens of room left to the SKILL.md size warning.

**Open child decisions:** requirement relaxation (one option per requirement that breaks it) in the bias or
requirement check (user, round 4); fact-checking the claims each rejection rests on (round 1's O15).

**Plan:**
1. Install the draft: SKILL.md Phase 3 paragraph, new `discovery.md` (in a session that isn't running the skill).
2. Once a real run has used it, ask the user what it showed; amend *Decision* or reopen a round.

Decision checklist:
- [x] Stop condition: no new requirements, no ranking change, nothing deciding left unverified (M11's reason inferred; not deciding)
- [x] Why and Rejected: each on a requirement the user confirmed; confirmed by the user
- [x] Known gaps and open child decisions: listed in *Decision*
- [x] Documentation: updated where the rule takes effect; overstated requirements corrected; commit message proposed (the rule takes effect in the skill itself; no git there)
- [x] Success criteria: carried over only as project rules (none carried over)
- [x] Out of scope: noted where open work is kept (`~/Cboost/Notes/_global/TODO.md`)
- [x] Overview: choice, pros and cons, rejected, gaps, plan, files
- [x] Review: in open chat; nothing implemented before it

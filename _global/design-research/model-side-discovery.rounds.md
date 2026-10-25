# Model-side discovery: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| M3 | Extra agents or waiting per round only when they pay for themselves | rounds stay fast; agents cost tokens | parent D2; `skill-rule-following.md` S5 | M3b (round 2: user, effort goes to discovery, evaluation is plentiful) |
| M8 | What helps discovery must work against the model's own fixation, not only add instructions to the same context | self-reflection by the same model stops exploring once confident (DoT); intrinsic self-correction doesn't improve answers | inferred from Liang et al. 2024, Huang et al. 2024 | M8b (round 1, bias check: named the mechanism "same context") |

## Round 1
Resumed the stub. Problem restated in five fields' terms (creativity research, machine learning, organisations,
engineering design, usability), at the user's request. Requirements M1-M7 carried from the parent and sibling logs;
M8 inferred from the self-correction literature. Re-read H1 and H3 in their logs: H1's rejection rested on a false fact
and a never-asked requirement taken from the researcher's own answer option; H3's transpose rests partly on the
user's reading preference (knowledge only the user had), the roll-back on "read every round" (countable).
First leader O4 + O5 (first-look check on the draft with a moves list grown from real misses); runner-up O1.
Rejection check: O6's rejection rested on a false claim (the parent's bullet was installed after H1-H3); O12 and O11
✗ M3 stretched; O9 inconsistent with O2/O3; O1 charged a shared cost and an n/a cell; O10's verdict depends on M3.
All fixed.
Bias check (partly not independent: read *Options* before its own list): O4 can't catch H1 (it sees only the draft):
new O15 (the rejection check verifies the facts behind each rejection; fits M5); strengthen the bias check (O16);
another model (O17); ensembles (O18); M8 named a mechanism (now M8b); O4's M8b only ~ (same model priors); M1 is the
goal; O1 needs a stopping rule; O5 grows only after a miss.
First-look check run on its own draft (40K tokens, 34 s): four changes; taken: one line per move with "tried,
nothing" (no forced changes), run from step 5 with *Problem*, the skill's path for new moves; asked: apply the moves
in Phase 3 too (O6 as add-on).
Ranking change: O15 joins the leader; O9 to add-on candidate.

Searches: web (standard): verbalized sampling and mode collapse (Zhang et al., ICML 2026); LLM design fixation and
idea diversity (Deng, Brucks, Toubia 2026, full text read; Ma et al. JCISE; arXiv 2502.05870); simulated-user
critique (PREFINE, Proxona; Sim2Real gap, Zhou et al. 2026; persona bias, NeurIPS 2025); self-correction (Huang et
al., ICLR 2024); SCAMPER/TRIZ with LLMs (TRIZ-GPT, AutoTRIZ, TRIZBench; no SCAMPER evaluation found); dialectical
inquiry and SAST (Mason & Mitroff; Fjermestad review, secondary); multi-agent debate (Liang et al., EMNLP 2024); idea
saturation (Si et al.); pre-mortem (Mitchell, Russo & Pennington 1989, secondhand only); analogical and step-back
prompting (Yasunaga et al.; Zheng et al., ICLR 2024); set-based design (Sobek, Ward & Liker 1999); Meincke et al.
"Prompting Diverse Ideas" (abstract). Local: parent log and rounds, H1 in `skill-rule-following.md` round 7-8, H3 in
`skill-and-log-size.md`; installed SKILL.md, checks, decision.md; body size measured.

Round 1 *Evaluation*, as it stood before round 2 (the evaluation-side leader O4 + O5 + O15):

Draft of the leader (O4 + O5 + O15), as the exact text, in `<scratchpad>/msd-draft/` (SKILL.md body 13,400 characters,
~4,620 tokens est. by chars/2.9):
- new `checks/first-look.md` (the brief with five moves: challenge a rejection, change the form, count the cost of
  each use, rename the problem, reuse what is at hand);
- SKILL.md Phase 4 step 4 bullet points to step 5; step 5 runs "fresh subagents", a third one "when the draft is new,
  the first-look check, given only the draft and *Problem*; what it proposes is weighed as new options" (+~200
  characters);
- `checks/rejection.md`: "check the facts its rejection rests on (a doc, the code, a command): is each still true?" (O15);
- `decision.md`: when the user found an option the research missed, name the move; propose adding it to the brief.

Rejection records (none rests on a core requirement; all requirements are preferences or unverified):
- O1, runner-up: ✗ M1 (preference) by design; M8b n/a (it adds nothing). "Waits on runs" is shared with O4 (only new runs test either) and doesn't count. Its strength: the parent's change is untested, so adding a
  second change now mixes two effects in the next run's data. O4 carries no M1 cost O1 lacks. O1 wins if the user
  wants clean data first; it needs a stopping rule (N runs), since one run is an anecdote.
- O6, trailing (M8b, unverified): the same model judging its own draft, anchored on its research. (Round 1 claimed the
  parent's installed bullet "didn't find H1-H3": false, it was installed after them; dropped.) Best variant: the list in a file read at step 4 (no SKILL.md
  growth). Compared with O4: same M1 ~, wins on M3, loses on M8b. The choice is M3 against M8b, both unverified: asked.
- O7, trailing (M4, preference): the draft names the leader to the bias check. Best variant: a draft with the
  options anonymised; impossible, the draft is the leader. O4 is ? on M3 where O7 is ✓; O7 ✗ M4.
- O8, trailing (M5, preference): widens the rejection check. Best variant: the first look as a second section in
  the same agent's brief; still widens its job. Comes back if M3 turns out core and M5 weaker.
- O9: now an add-on candidate like O2, O3 (same context, M8b ~); the weakest evidence of the three.
- O10, trailing (M3 ✗, unverified; the verdict depends on open question 1): three agents per round. Best variant: two agents, no judge (the researcher
  judges): still one more than O4. If M3 allows one agent, O4 is the cheaper way to an outside view.
- O11, trailing (M3 ?): a draft per option per round, no agent; whether it pays for itself is unknown. Best variants:
  titles-level drafts of the top three (then close to O2), or drafting the top three only when scores are close (the
  parent's O14 already drafts a close runner-up). Same M1 ~ as O4. Trails on a tiebreak: cost per round.
- O12, trailing: its core move (reverse the leader's assumptions) is O4's "challenge a rejection"; as a separate
  agent ? M3, like O4. Trails on overlap only (tiebreak).
- O18, trailing (M3 ✗, unverified): k agents; and pooled separate prompts did not beat CoT on diversity (Meincke et
  al., via Deng et al. 2026). Best variant: k=2 with different personas (O3 in two agents): still ✗ M3.
- O15, O16, O17 (round 1 bias check): O15 joins the leader (H1 is a rejection, which O4 never sees); O16, O17 add-on
  candidates.
- O14, trailing (M1, preference): it asks the user to do the discovery.
- O2, O3, O13: add-on candidates, not rivals: generation-side (Phase 3), same context (M8b ~). O2 and O3 have the
  best direct evidence (idea diversity) but on product ideas, not design options. O3 is the user's own move this run.

Stress test (real use, round 1): the first-look brief run on its own draft (40K tokens, 3 tool calls, 34 s) gave four
concrete changes, three taken: answer per move with "tried, nothing" instead of "at least two changes" (each forced
change would need a rejection record); run it from step 5 with *Problem*, not a researcher-written paragraph (which
carries the leader's framing); name the skill's path for new moves. The fourth (apply the moves in Phase 3 too) is O6
as an add-on: asked. Not shown yet: whether it finds a leader-changing option in a run it wasn't built from.
Harms (O4 + O5 + O15):
- A third subagent when the draft is new: ~40K tokens and ~35 s measured once (round 1), more for a large code draft. It runs in parallel with the two checks, so little extra waiting.
- Cooperative-simulator bias: it may propose shallow changes to fill "at least two"; the researcher must weigh them,
  which costs report space if many are noise.
- Overfit: the moves list is built from five cases; it may steer the check toward past moves and away from new ones.
  O5 grows it only from real misses, so it never shrinks by itself.
- For costly artifacts (CAD, hardware), the draft may be a description; the first look then judges a description.
Reversibility: every option cheap (skill text and one brief).


## Round 2
Answers (round 1): evaluating drafts isn't the bottleneck, there is plenty of evaluation but not enough novel
options; stop fixating on how options were found in past conversations and look broadly; don't rely on the user to
feed options (M1 core). Fresh discovery is core (M8b). Add now. Remark: discovery should probably be in the first
step, when no option list biases it yet, with more time for searching and rephrasing, as at the start of this research.
Leader changed from O4 + O5 + O15 (evaluation side) to O19 (blind lens generators at the start of Phase 3).
Real use: two generators (own field; organisations and people) on this problem: ~50K tokens, ~1 min each; about half
their options were new to round 1's list (details in the log's *Evaluation*).
Rejection check: O19's M8b overstated (the researcher writes *Problem*, which here held its reframing); O20's
record leaned on an unconfirmed cost; O26's record contradicted O19's harms; three matrix cells without reasons. All
fixed.
Bias check: generators blind to the project; lenses copied from this run (M9 ~); context-vs-creativity confound in the
past cases; novelty isn't leader change; M2, M7, M4, M5 word mechanisms (M2, M7 reworded); new options O29
(simulated-user gate), O30 (miss diagnosis), O31 (needs first, absorbed), a context-rich generator (absorbed into the
own-field lens), "discard the first N titles" (covered by "later ones tend to be more original").

Searches: web (standard): nominal groups and production blocking (Diehl & Stroebe); LLM research-ideation systems
(ResearchAgent, Scideator, Chain of Ideas, TrustResearcher); design-by-analogy with LLMs (Ding et al. 2023; analogy
mining); problem finding (Getzels & Csikszentmihalyi, secondary); serial order effect in humans and LLMs; design-space
exploration in software architecture (PerOpteryx, morphological matrices, dominance filtering). Generators: own field
(10 searches: verbalized sampling, LLM hivemind, quality-diversity, BioSpark, TRIZ agents, morphological matrix,
IDEAFix/Heuresis, AI Scientist novelty check) and organisations (9 searches: NEPA, analysis of alternatives, red
teams, broadcast search, design competitions, set-based design, morphological analysis, patent search).

## Round 3
Answers (round 2): scale the cost with the problem; O21 (design-space map) in; the main model chooses the number of
generators and their fields from the problem's purpose and complexity; remark: telling the generators where the
project is anchors them in current solutions, leave them blind; proposes two current-field generators, one with and
one without context (O34).
Draft redone: `discovery.md` gets *Choosing the generators*, *The design-space map*, *Brief for a generator*; the
project-context lens only for large problems in an existing project. The map, tried by hand on this log's options,
found O32 (generators without *Requirements*) and O33 (map in the report).
Rejection check: O20 charged a shared M8b cost; O20 M1, O24 M7, O26 M1 cells stretched or unexplained; O34 graded in
its "always" form; O32 better than the leader on M8b. All fixed.
Bias check: rerun on *Requirements* changes too (fixed); O35 (requirement-relaxation lens), O36 (user-context
generator); the cause of past misses (context vs free thinking) is untested, O30 would tell; merging re-anchors;
more options, more evaluation; M2, M3b word mechanisms (noted).
Searches: no web search this round.

## Round 4
Answers (round 3): generators keep *Requirements* (O32 out); the project-context lens only for large problems (as
drafted); no further add-ons (O30, O35, O33 out). Remarks: too trusting of the bias check; no rerun on requirement
changes (reverted); requirement relaxation sounds good but belongs in the bias or requirement check (open child); the
user-context generator has little benefit; treat the bias check's ideas as suspect by default.
No ranking change; stop condition met; decision drafted.

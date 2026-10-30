# Problem understanding: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| U2 | Whether the problem was confirmed is visible before option research starts, and the step can't be silently skipped | skipped steps are the main failure of past runs | user, round 1 | U2b (round 2, bias check: named a mechanism) |
| U4 | Understanding a problem works on its own, outside a design decision | wanted for more than design decisions | user, round 1 | U4b (round 2, bias check: pre-selected a separate skill) |
| U5 | No broad search or generator runs on a problem the user hasn't confirmed | wasted time; anchored results | user, round 1 | U5b (round 2, bias check: named a tool) |

## Dropped requirements
| # | Requirement | Why it isn't one (user's reason) | Source | Round |
|---|---|---|---|---|

## Round 1
New log. Request (2026-10-30): "The research-design skill currently starts a broad exploration before the problem is
fully well-understood. I want to split up the first steps into a problem formulation skill."

Round 1 is framing only: problem, success criteria, unverified requirements, four preliminary options, questions.
Discovery, the matrix, the draft and both checks were left out on purpose, because running them on an unconfirmed
problem is the failure under research. The user is asked whether this is right.

Searches: no web search. Local: SKILL.md, README.md, requirements.md, discovery.md, splitting.md, decision.md,
log-template.md, scripts/round-gate.py; `_global/TODO.md`; the benchmark README and the 2026-10-28 score and run
notes; the *Problem* sections of the other logs in this folder (none matches).

## Round 2
Answers (round 1): all four symptoms (options before input, missed situation, wrong problem, too broad too early);
also seen in flexcompose's `machine-release-programs` run (taken as held-out case). Separate skill for: use on its
own, core size limit, clear handover. Boundary: problem, situation and requirements. Framing-only round 1: right.

Discovery: two generators (Sonnet). Own field: grill-me, superpowers brainstorming (hard gate), Spec Kit clarify,
problem statement apart from the proposed solution (XY problem), EARS, prior-context-first intake. Far fields: Peña
programming (problem statement as hand-off), Weed's problem-oriented record, surgical time-out, SPIN ladder,
mechanic's "verify the complaint", Klein's premortem, ethnographic grand-tour question.
Draft: problem-formulation/SKILL.md (~1,060 tokens) and the design-research changes (core -280 words).
Held-out stress test: the draft's situation questions and write-back would likely have caught all three failures of
the machine-release-programs run (wrong framing, training vs inference repo, the pending repo-layout decision).
Rejection check: O2 lacked its variant O2b (one skill, "problem only" entry); O3 composes with any option; leader's
U2b/U5b only ~ (gate checks a line, not the asking; no web-search gate); O4's U4b/U2b cells; O8's U1b record; O7's U6
cost stretched; O2's U3 unstated (stub ~40 words; the moved Phase 1-2 free 353).
Bias check: U2, U4, U5 named mechanisms (reworded); U1 must unverified, ask first; U6 inferred, no bound; O11 scale
the intake by vagueness (added); O7 can't find unsaid facts (now trailing); the gate checks an artifact, not the
behaviour (harm, variant noted); benchmark replay is circular (already said in success criteria).
Ranking: leader O1 + O3 + O5 + O6 + O11; runner-up O2b (close: U4b ~ vs ✓, plus tie-breaks).

Searches: web: superpowers brainstorming SKILL.md (raw GitHub) and its license (MIT); grill-me SKILL.md (a stub
calling "grilling"); "mattpocock skills grill-me SKILL.md github". The generators' own searches are in their
reports (not kept). Local: machine-release-programs.md, its rounds 1-4, integration-problem.md.

## Round 3
Answers (round 2): U1 should; separate skill (O1 holds over O2b); scale by clarity (O11; U6 verified); no hook
(O3's hook out, the confirmation line stays; reason asked). The researcher rewrote O11 to scale by open situation
facts, not by how clear the request reads (the benchmark's request read clear and hid the owned rack).
Rejection check: O0's record cited U1 as must and "✓ on all five"; verdict columns didn't match the records (O4, O8,
O10); "+ O3" rows stale after the hook was dropped; O3 needs a record (compared, not rejected: preference only); O7
needs a row; O2b's tie-break gains vs the leader's trigger competition stated as tie-breaks. All fixed.
Bias check: the round gate catches a missing confirmation only at design-research's first question call, after the
costly work; the line is self-attested; steps 4-6 could cost three calls on a clear request (now batched); "likely
answers as options" anchors situation questions (now kinds of answer); the premortem is hard to answer (reworded to
"what does it leave out"); U4b partly: the description overlaps design-research's trigger, and a bug gets a
design-format log. Missing options: a gate on the first subagent call (O3, asked), the write-back as the first call
(now step 4's shortcut).
Found while fixing: the round gate ignores a log without *Rounds*, so problem-formulation's calls pass; stated in the
draft's hand-over.

Searches: no web search.

## Review (2026-10-30)
User: "what you own" is specific to the benchmark and covered by "what exists now"; stricter use conditions, mostly
called by design-research; wording independent of design-research, dependency one way only; the log format is a
shared dependency. Applied to the draft as amendments (they keep the choice). Found while applying: `requirements.md`
uses design-research terms (rounds file, *Phase 6*, matrix, checks) in its sections on dropped and replaced
requirements; those parts stay in design-research. Asked where the shared log format lives.

## Review, resumed (2026-10-30)
`skill-packaging.md` decided (shared files in `research/shared/`). Answers: name `research:problem-formulation`;
shared files split (base log template and generic requirement rules in `shared/`, design's extensions in its own
folder); asked for the whole overview before step 1.

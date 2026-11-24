# Plan for goal 1: a robot that trains on its own

The plan for the first goal in `GOALS.md` (project root of the experiments project). Written by Claude on 2026-11-24
at the user's request ("Make a plan on how to proceed in the long run"), after two rounds of questions. No design
research is behind it. Everything marked *proposal* waits for the user's word, and the readings in the second section
are not confirmed. A stage ends when its gate is met, not on a date.

## The goal and what the user said about it

"The eventual goal would be a robot that trains on its own and can be commanded in some way; the environment would be
resource constrained by definition, rollouts and GPU power limited." User, 2026-11-24.

| Point | Answer | Source |
|---|---|---|
| Where the learning runs | On the robot only | user, 2026-11-24 (chosen option) |
| Kind of robot | "Any kind, it should be generalizable." | user, 2026-11-24 |
| A physical robot | "I want a general method that I could apply whenever I have an idea for an actual robot." | user, 2026-11-24 |
| Command | A goal observation first; other forms later | user, 2026-11-24 (chosen option "Open: other forms later") |
| Resets | Not decided; the plan tests both and treats no resets as the harder case a method must also pass | user, 2026-11-24 (chosen option) |
| What a robot may start with | Not decided; from scratch first, the decision on priors comes once the limit of from scratch is measured | user, 2026-11-24 (chosen option) |
| Damage and getting stuck | Out of scope for now | user, 2026-11-24 (chosen option) |
| How scarce experience is | No number; fewer is better, curves are compared | user, 2026-11-24 (chosen option) |

## Goal 2, stated after this plan was written

"an RL agent trained from scratch that can use play any game in full just out of intrinsic curiosity." User,
2026-11-24. The user's answers of that day: single-player video games; "in full" means seeing everything (every
level, room and mechanic), measured from outside; a game's own controls, discrete ones included; one method for both
goals; goal 1's limits on experience and computation apply to games too. Recorded in `GOALS.md`.

The stages below are not reworked for it; that waits for the user's word. What it changes:

| # | Change | Why |
|---|---|---|
| G1 | Curiosity is the shared core of both goals. It is the collection rule of this plan: what the agent does in the stretch where no goal is given. Stage 1's lever "directed collection" becomes a line of work of its own. | "curiosity is how the robot explores" (the chosen option) |
| G2 | A second measure is needed next to the score: how much of a world the agent has seen per step of experience, with no goal given (*proposal* M7). In the maze it can be computed exactly (the share of the free space reached); for a game it has to be defined per game from the game's own state. | "in full" = seeing everything; `PROBLEM_STATEMENT.md` scores commanded behaviour only |
| G3 | Single-player video games join the problem set of stage 3, and one of them could replace the "problem that is not a maze" of stage 1. | "any game"; one method for both |
| G4 | The method needs a discrete form for games. The discrete versions of GCSL, WGCSL and the quasimetric method exist and were set aside under the continuous-only rule. | the rule is lifted for goal 2 only |
| G5 | Screens as observations bring stage 5 forward, unless a game's state is taken as the observation first. Open in `GOALS.md`. | games are observed through the screen |
| G6 | Known obstacle, from memory and not checked against the papers: curiosity that rewards what it cannot predict is drawn to things that are unpredictable and meaningless, and some parts of a game are reached only by repeating something that has stopped being new. "Seeing everything" is the target that novelty serves best; it does not remove either problem. | to be covered by stage 0's literature survey |

## What follows from it (Claude's reading, not confirmed)

| # | Consequence | Follows from |
|---|---|---|
| P1 | The product is a learner together with the way to apply it. Someone names a robot's observations, actions, control rate and compute budget; the learner trains itself and can then be commanded. | "a general method that I could apply whenever I have an idea for an actual robot" |
| P2 | One configuration for every problem. Tuning per robot costs rollouts the robot does not have. A setting that has to differ between problems must adjust itself from the data. | limited rollouts; any kind of robot |
| P3 | Compute is part of the score: a budget per environment step for acting and learning together, and bounded memory. | learning on the robot only; GPU power limited |
| P4 | Learning never finishes: the robot learns while it is used, and its body and surroundings may change. | "trains on its own" |
| P5 | Simulations serve to develop the learner, not to prepare a robot. Nothing learned in simulation is carried to a robot unless the user allows something given at the start. | from scratch until decided |
| P6 | On a robot nothing measures the cost unless an instrument is added, so the person applying the method needs signs from the learner itself that it is working. These are diagnostics, not grading. | `PROBLEM_STATEMENT.md`: grading is from outside |

## Approach (*proposal*)

| | Approach | For | Against |
|---|---|---|---|
| A | Finish the method in the maze, then widen | The maze has exact truth and runs in under a minute | Everything is tuned on a 2D maze with uniform restarts; a failure to transfer shows late |
| B | Take an established robot learner and strip it down to the conditions | Starts from something that works on robots | Built around rewards and large compute; hard to see why each part is there, and hard for the user to follow |
| C | Fix the measure and a small, varied set of problems first; let the project's own method and stripped-down established ones compete under equal budgets; widen the set in stages and hold one family of problems back | "General" becomes something measured; the maze stays the place where every learned part can be checked against the truth | Groundwork comes before new results |

Recommended: C. It keeps what A is good at (the maze as a microscope) and brings in B's methods as competitors.

## Measuring (*proposals*, each a change to `PROBLEM_STATEMENT.md` or to how methods are compared)

| # | Proposal | Why | Alternatives |
|---|---|---|---|
| M1 | The environment names a resource budget: computation per environment step for acting and learning together, and memory. Methods are compared at equal budgets, and the curve is shown at two or three budget levels. | P3. Without it the cheapest way to need less experience is more computation per step, which the robot does not have | A single fixed budget (hides the trade); no budget, compute only reported (methods are then not comparable) |
| M2 | Computation is counted as operations per environment step, taken from the compiler (`cost_analysis()` of a compiled JAX function gives `flops`; checked on 2026-11-24 with JAX 0.12, not yet for loops), with memory as parameters plus stored experience. Wall clock on this laptop's CPU is the check. | Independent of the machine and of how well the code is written | Wall clock only (depends on machine and code); gradient steps (ignores network size); energy (needs the hardware) |
| M3 | The budget levels are set in stage 0, from what the present methods use and what a robot's computer gives per control step. | No number exists yet. My estimate, not measured: for networks of the present size an embedded computer at a robot's control rate allows more computation per step than the runs use now; the limit will bite with cameras and larger networks | Fixing numbers now |
| M4 | Every method is reported with rare resets and with no resets. | Resets are undecided; no resets is the case a robot on its own is in | Only the statement's default |
| M5 | Tables and racing use two numbers taken from the curve: the steps needed to reach a reference level, and the area under the curve on a logarithmic step axis. The curve stays the comparison. | Thousands of runs cannot be compared by eye | The value at the end of the run (says nothing about experience needed) |
| M6 | One configuration per method for all problems; a method's sensitivity to its settings is reported with it. | P2 | Tuning per problem with an equal budget (not possible on a robot) |
| M7 | Added for goal 2 on 2026-11-24: a second curve next to the score, the share of a world the agent has seen against its steps of experience, with no goal given. The environment computes it from its own state and the agent never sees it: in the maze the share of the free space reached, in a game a count the game's state allows (levels, rooms, distinct situations). | Goal 2's "in full" means seeing everything, and the score in `PROBLEM_STATEMENT.md` measures commanded behaviour only | Counting distinct observations (a screen changes without anything new being reached); the game's own score (measures playing well, which the user did not choose) |

For reference, the best agent today (quasimetric with a model, `layout-02`, one model, 8 environments, run
`20261123-231605-quasimetric-model`): 0.18 ms of training per environment step on this laptop's GPU, about 14 s of
startup and compiling per run, and, as far as the notes say, one gradient step per 8 environment steps.

## Stages

Sizes are guesses at the pace of this project so far, with runs going most of the day. Stages 2 to 4 may overlap.

### Stage 0: the yardstick and the groundwork (about a week)

- Decide M1 to M6 (user).
- The first table: the four present methods on `layout-01` to `layout-12`, 8 seeds, with and without resets, with the
  compute count. Needs the temporary experiment-size rule lifted for sweeps.
- A sweep runner that compiles once and batches settings and seeds, with one record and one commit per sweep; sweep
  runs store no experience and no networks.
- Same-seed runs that repeat exactly, then a small set of canary runs repeated after every change to shared code.
- The compute count (M2) and the curve numbers (M5) in the run record; the manifest's `method` field fixed first
  (`TODO.md`: it is `__main__` for every run).
- Methods as combinable parts in one package (collection, relabelling, time-to-goal, policy step, model,
  approximator), and an environment interface that carries the cost and the best step. Both through
  `research:design`.
- A findings ledger (claim, evidence, run IDs, status), so `TODO.md` holds work and not results.
- A literature survey instead of the nine-paper check, also covering learning on real robots within hours, learning
  from a stream without stored experience, and acting in real time with delay. To read first, named from memory and
  not checked: DayDreamer (Wu et al., 2022), "A Walk in the Park" (Smith et al., 2022), streaming deep reinforcement
  learning (Elsayed et al., 2024). It also settles which Zhang paper was meant (`TODO.md`).
- `layout-13` to `layout-20` played in both conditions (user): the sealed test with a human reference.

Gate: any two methods can be ranked on experience at a given compute budget, with stated uncertainty, within minutes.

### Stage 1: where the experience goes (two to four weeks)

The maze as a microscope. The person with the walls hidden reached their level after 270 to 820 steps moved; the
best agent needs 100,000 to 143,000 on `layout-02`.

- Swap one learned part at a time for the truth (exact distance, exact step) to find what each lever can gain at most.
- Compare learners on fixed recorded experience before any full run.
- The levers, each with its compute cost, so the result is a trade between experience and computation: gradient
  steps per environment step, directed collection in place of 10,000 random steps, more use of the model (imagined
  steps, planning when acting), a memory of visited states.
- Gaussian attention as the approximator of the model and of the time-to-goal: the same accuracy with fewer
  operations, sharper walls from fewer samples, and its behaviour when the data shifts.
- Two reference lines: the person's curve, and an agent with maze knowledge built in as the floor.
- One problem that is not a maze, used only to see whether the ranking of methods agrees with the maze's.

Gate: the gap to the person's curve is split into the levers and confirmed on `layout-04` to `layout-12` with one
configuration. Either the gap has closed by a large part, or the ceilings show what prevents it. The second outcome
is the evidence for the user's decision on what a robot may start with.

### Stage 2: a robot's conditions, one at a time (one to two months)

Small problems, with a true cost wherever one can be computed.

- No resets; noise in the steps and in the observations; momentum, which makes the time from A to B differ from B to
  A; a delay between observing and acting; an observation that is not the state (sensor readings), including what a
  goal observation means when two places look alike; a world that changes during a run; more dimensions.
- The result is a table of methods against conditions. A failure gets a general remedy or none (rule in `CLAUDE.md`).

Gate: one method with one configuration passes every condition, where passing is staying within a factor of its
plain-maze curve that is set from the noise measured in stage 1.

### Stage 3: other bodies (two to three months)

- A set of small simulated robots of different kinds: an arm among obstacles, pushing an object (contact), a body
  that moves on legs or wheels. Experience is limited by design, so slow simulators are acceptable and existing ones
  can be used; which ones is a library decision for `research:design`.
- For each baseline a published number reproduced first, so a weak baseline is the method's fault and not mine.
- Established robot learners, stripped to the conditions, as competitors at equal budgets.
- One method family kept in the comparison whose learned object also serves other commands (a reward given at
  command time), so stage 6 stays open.
- One family of problems held back and used once, at the end of the stage.

Gate: on the family held back, with nothing changed, the method learns within a stated factor of its efficiency on
the families it was developed on.

### Stage 4: the robot's computer (about a month)

- The learner runs in real time inside the budget: acting at a control rate while learning, with bounded memory,
  for days without interruption (stability, forgetting).
- First emulated on this laptop (CPU only, limited cores), then on an embedded board (the user's decision to buy).

Gate: the curves of simulated time are reproduced in real time within the budget over a run of several days.

### Stage 5: sensors (not sized)

Camera-like observations inside the budget. Depends on the decision on what a robot may start with (a pretrained
encoder is a general prior), and development needs more than this laptop's 8 GB.

### Stage 6: other forms of command (not sized)

Part of an observation, a reward given at command time, language, a demonstration. Which ones is the user's decision
at that time.

### Stage 7: the first robot (when the user has an idea for one)

An application sheet: what the person supplies (observations, actions, control rate, budget, limits) and what the
learner reports about itself (P6). Damage and getting stuck, out of scope now, come back here at the latest.

## Standing practice

- The cheapest question first: a truth swap or a fixed-data test before a full run.
- Candidates race: two seeds on two layouts first, the full evidence only for the last two or three.
- A sealed test set per milestone, used once; a family of problems held back per stage.
- A budget and a stop criterion per question, written down before its first run.
- When the best method changes, the earlier findings that still matter are tested again on it.
- A literature search every month.
- A weekly review with the user that includes explaining what was built; a fixed share of time for upkeep.

## Needed from the user

Now:

1. A decision on M1 to M6, and on approach C.
2. The temporary experiment-size rule lifted for sweeps (`CLAUDE.md`).
3. `layout-13` to `layout-20` played, about an hour.
4. Yes or no to `research:design` for the methods package and for the environment interface with its problem set.
5. P1 to P6 confirmed or corrected.

At later gates: resets (after stage 1 or 2), what a robot may start with (after stage 1), an embedded board (stage 4),
hardware for cameras (stage 5), forms of command (stage 6), damage and getting stuck (stage 7).

## Not planned

- Discrete actions for goal 1's problems (rule in `CLAUDE.md`; lifted for goal 2's games on 2026-11-24, see G4).
- Carrying anything learned in simulation to a robot (P5), unless the user allows a prior.
- A specific robot; damage and getting stuck (out of scope by the user's answer of 2026-11-24).
- Publishing: the repository cannot be published as it is (`CLAUDE.md`).
- More work on the attention toys or on the viewer than a stage asks for.

## Risks

| Risk | What the plan does about it |
|---|---|
| "Any kind of robot" cannot be proven | The claim is bounded: it holds over the problem set, including a family never used for development |
| What is found in the maze does not transfer | A problem that is not a maze enters in stage 1; stage 3's gate is on a family held back |
| One configuration for everything is too strict | Settings that adjust themselves become work of their own; sensitivity is reported (M6) |
| The operation count misleads (a device limited by memory, loops counted wrongly) | Wall clock on a CPU as the check (M2); stage 4 measures on a real board |
| Simulations hide what a robot does (delay, wear, noisy sensors) | Delay, noise and a changing world are conditions of stage 2 |
| Damage and getting stuck are not addressed | Named here; comes back at stage 7 at the latest |
| My mistakes build on each other over months | Gates, canaries, a fresh check of each baseline, sealed tests, the weekly review |
| The user loses track of what was built | Explaining is part of the weekly review |

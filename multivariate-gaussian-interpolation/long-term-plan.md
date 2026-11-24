# Long-term plan for goals 1 and 2

**The current plan is `PLAN.md` in the project root of the experiments project** (2026-11-24, at the user's request:
"Rework the plan into a `PLAN.md` in the project without any history and redundant parts removed"). This file keeps
who decided what, when and why, and the changes made to `PLAN.md` afterwards (last section). Where the two differ,
`PLAN.md` holds.

One plan for both goals in `GOALS.md` (project root of the experiments project): a robot that trains on its own, and
a curious agent that plays any game. Written by Claude on 2026-11-24 after the user's answers of that day ("Yes,
rework it now"). It replaces [self-training-robot-plan.md](self-training-robot-plan.md), which was written for goal 1
before goal 2 existed and is kept as the first version. A stage ends when its gate is met, not on a date.

## What is decided

By the user, 2026-11-24. The goals themselves, with every answer, are in `GOALS.md`.

| Point | Decision |
|---|---|
| Way of working | Fix the measure and a small, varied set of problems first; the project's own method and stripped-down established ones compete under equal budgets; the maze stays the place where learned parts are checked against the truth ("Measure first, then compete") |
| One method | The same learner trains a robot and plays games; curiosity is how the robot explores |
| Compute | A budget of computation per environment step and of memory, at two or three levels, counted in operations per step. In `PROBLEM_STATEMENT.md` since 2026-11-24 |
| Games | Single-player video games, observed through the screen from the start, with their own controls; nobody commands the agent in a game; "in full" means seeing everything |
| Run size | The experiment-size rule is lifted entirely, with the condition below |
| How time is spent | "make sure to always storms your time wisely; past runs have spent far too much time running verification instead of trying new ideas" |
| Design research | None for the methods package and the environment interface: "No, build directly" |
| Priors for a robot | "Trying priors is an interesting question that you could attempt either way." |
| `layout-13` to `layout-20` | The user plays them later; work does not wait, and they stay untouched until then |
| Left to Claude | How methods are run with respect to resets ("Whatever is necessary to advance the research"); whether settings may differ between problems ("This is a question that you can answer, ideally one configuration would suffice"); how far the goals are possible ("The extent of what is possible is an open question that you can answer") |

## Decided by Claude under that delegation (2026-11-24; each can be overturned by the user)

| # | Decision | Reason |
|---|---|---|
| C1 | Resets are chosen per question. Questions about curiosity run with no resets, or with restarts from one place; questions about goal reaching keep the present rare resets, which earlier results used. A gate is checked in both. | With uniform restarts every 100 steps the map is covered without any curiosity, so that setting cannot test it. Running everything twice is verification the user does not want |
| C2 | While ideas are tried, settings may differ freely. A claim at a gate is made with one configuration for all its problems. | The user's ideal is one configuration; holding to it during the search would slow the search |
| C3 | Three budget levels, a factor of 8 apart, anchored on the operations per step the best method uses now. The numbers are set in stage 0, after counting. | No count exists yet |
| C4 | A curve is summarised by two numbers in tables: the steps needed to reach a reference level, and the area under the curve on a logarithmic step axis. | Many runs cannot be compared by eye; the value at the end says nothing about experience needed |
| C5 | "Seeing everything" is measured as the share of a world the agent has reached, counted by the environment from its own state and never shown to the agent: in the maze the share of the free space, in a game what its state allows (rooms, levels, distinct situations). | Counting distinct screens fails: a screen changes without anything new being reached |
| C6 | The test games are small games made for this project first, on small screens, with an exact count of what was seen; an existing collection of games follows in stage 3. | They run inside the budget on this laptop, and each can hold one difficulty at a time |
| C7 | At most about one run in four is a confirmation. An idea gets the least evidence that can show an effect (often one seed on one layout); more seeds and layouts go only to what the next step is built on, and to a gate. | The user's condition on how time is spent |
| C8 | The quasimetric method keeps its interval embedding; the number of model updates per step is no longer a separate question but part of the trade under the compute budget; experience is recorded for single runs and not for sweeps. | Three older open points from `TODO.md` that are questions of how to run |

## Working hypothesis

One method can serve both goals in this form: curiosity picks a place to go to, a goal the agent sets itself; the
goal-reaching part takes it there; what it finds trains both. A robot is in addition commanded from outside with the
same goal-reaching part. In a game nobody commands, and the same machinery runs on its own goals only.

The alternative is curiosity as a reward the agent gives itself that drives a policy directly, without goals. Goal
reaching for a robot would then be a second system. Stage 1 races the two.

Known obstacle, from memory and not checked against the papers: curiosity that rewards what it cannot predict is
drawn to things that are unpredictable and meaningless, and some parts of a game are reached only by repeating
something that has stopped being new. Stage 2 builds both into small games on purpose.

## Stages

### Stage 0: tools for speed (days)

Only what makes trying an idea faster or is needed by a decision above.

- A sweep runner that compiles once and batches settings and seeds, with one record and one commit per sweep.
  Startup and compiling are 14 of 55 s of a run today.
- The operation count per environment step in the run record (`cost_analysis()` of a compiled JAX function gives
  `flops`; checked on JAX 0.12, not yet for loops), and the three budget levels (C3).
- The share seen (C5) in the maze, logged with every run; no resets and restarts from one place as settings.
- A small reference: the best method and GCSL on three layouts with two seeds, at the three budgets.
- A quick reading pass on curiosity and on learning with little computation, run beside the rest.
- The manifest's `method` field fixed (`TODO.md`), since tables key on it.

Gate: a new idea is tried against the best method at a named budget in under ten minutes of machine time.

### Stage 1: curiosity in the maze

The shared core of both goals, where the truth is exact. No resets or restarts from one place, walls unknown.

- Ideas for what to do when no goal is given, raced against each other and against random movement: self-set goals
  at the edge of what was seen, rarely visited places, places where the model is wrong, places where learning is
  still progressing, and the direct form without goals (the alternative above). The person's own goal-free stretches
  in the human sessions are a reference.
- Two curves per idea: the share seen, and the goal-reaching score.
- Before building a lever, swap in the truth (exact distance, exact step) to see what it can gain at most.
- The levers on experience, each inside the compute budget: gradient steps per step, more use of the model
  (imagined steps, planning when acting), a memory of visited places, and Gaussian attention as the approximator
  (the same accuracy for fewer operations, sharper walls from fewer samples).
- Priors may be tried here when from scratch shows its limit.

Gate: without resets, one rule sees the maze within a small multiple of the steps an agent with maze knowledge built
in needs, and afterwards reaches goals as well as the present method does with uniform restarts. The multiple is set
once that reference agent is measured.

### Stage 2: small games on a screen

- The maze shown as a screen first: the same world with a picture as the observation, which separates learning to
  see from everything else.
- Small games made here (C6), each holding one difficulty: rooms with doors and keys, things that move, something
  unpredictable and meaningless, a part reached only by repeating. Discrete controls, so the method gets its
  discrete form here.
- Everything inside the compute budget, which with pictures is where the budget first binds.

Gate: one method with one configuration sees everything in these games inside the budget, and still passes stage 1's
gate.

### Stage 3: wider

- A robot's conditions as the research needs them: noise, momentum, delay between observing and acting, a world that
  changes during a run, more dimensions.
- Small simulated robots of different kinds (an arm among obstacles, pushing an object, legs or wheels) and an
  existing collection of games. Experience is limited by design, so slow simulators are acceptable.
- Established learners, stripped to the conditions, as competitors at equal budgets; for each, one published number
  reproduced first.
- One family of problems held back and used once.

Gate: on the family held back, with nothing changed, the method learns within a stated factor of its efficiency on
the families it was developed on.

### Stage 4: the robot's computer

The learner runs in real time inside the budget, acting at a control rate while learning, with bounded memory, for
days. First emulated on this laptop (CPU only, limited cores), then on an embedded board, which is the user's
decision to buy.

Gate: the curves of simulated time are reproduced in real time over a run of several days.

### Later, each on the user's word

Other forms of command for a robot; a first real robot, with a sheet of what the person supplies and what the
learner reports about itself; damage and getting stuck, which are out of scope now.

## How the time is spent

- New ideas come first; verification is at most about a quarter of the runs (C7).
- The cheapest question first: a truth swap or a test on fixed recorded experience before a full run.
- Candidates race: the clearly worse are dropped early, and only the last two or three get more seeds and layouts.
- A budget and a stop criterion per question, written down before its first run.
- With every result: its layout, models, environments and seeds (rule in `CLAUDE.md`).
- Questions of how to measure, run or compare are decided by Claude and reported; the user is asked about the
  goals, their time, their data and permissions (rule in `CLAUDE.md`).

## Needed from the user

Nothing blocks stage 0. Later: `layout-13` to `layout-20` played when convenient; an embedded board at stage 4; the
points under *Later*.

## Not planned

- Discrete actions for goal 1's problems (rule in `CLAUDE.md`); games take their own controls.
- A command inside a game; a specific robot; damage and getting stuck.
- A table of every method on every layout, or any other standing verification.
- Publishing: the repository cannot be published as it is (`CLAUDE.md`).

## Risks

| Risk | What the plan does about it |
|---|---|
| "Any robot" and "any game" cannot be proven | The claim is bounded by the problem set, including a family never used for development |
| What is found in the maze does not transfer | The maze as a screen and small games come in stage 2, before anything is widened |
| Too little verification lets a wrong result be built on | What the next step is built on is confirmed (C7), and so is every gate |
| Pictures do not fit the compute budget on this laptop | Small screens and small games first; the budget levels show what each costs |
| The operation count misleads | Wall clock on a CPU as the check; stage 4 measures on a real board |
| The user loses track of what was built | Results are reported with their evidence; explaining is offered after large changes |

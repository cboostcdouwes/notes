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
| C9 | For *A session* in `PLAN.md`: the opening check covers both searching the package for parts to reuse and writing what will be used again as a part, limited to the item at hand; machine time is summed from the `seconds` of the run records, per question and per stage; a sweep still running at the end of a session is handed over on the work list with what its result decides; the weekly review and the monthly search are triggered by their dates on the work list. | The user asked for the process to be written down and left these open. An open-ended search for components at every start builds parts before a second use shows their interface, which the rule of fixing at the second workaround is there to prevent |
| C10 | Stage 0's preparation (2026-11-24), in this order: the findings file; the repeat check; a baseline of the present methods from the old code; the package with the environment interface, sweeps and canaries; worktrees. Same-seed runs repeat by turning GPU autotuning off when `gcrl` is imported. The package is checked against the old code by identical numbers, not by seed spread. The two stores keep their own relabelling (trajectories with uniform later goals; the ring with geometric offsets) instead of a store and a relabelling that combine freely. The Floyd-Warshall try-out is deleted, not made a part. Working trees go in `.worktrees/` inside the repository, each with its own Python environment. Canaries are six short runs on `layout-02`, compared to the bit, and skipped on another GPU or JAX. | Autotuning was the cause of the differences and costs 3 % to turn off. Identical numbers check everything at once and cost one set of runs; seed spread would need more seeds. Separating store and relabelling would change the random draws and lose the exact check, and no question in sight needs another combination yet (stage 1's item 4 would). The try-out has no use in sight and is worse than the quasimetric time-to-goal. Inside the repository the agents' trees are within Claude Code's working folder; their own environments are needed because an editable install points at one tree's source |

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

## Changes to `PLAN.md`

### 2026-11-24: written from this file and refined in rounds

The user: "Rework the plan into a `PLAN.md` in the project without any history and redundant parts removed, then
spend several iterations refining it."

**Counted for it** (read-only, `layout-02`, 8 environments, JAX 0.12 on the CPU, no training run):

| What | Count |
|---|---|
| One advance of the quasimetric method with a model (8 environment steps and one gradient step) | 1.51 × 10^9 operations, so 1.9 × 10^8 per environment step |
| One advance of GCSL, continuous | 1.93 × 10^8, so 2.4 × 10^7 per environment step |
| Learned state of the quasimetric method with a model | policy 122,902 numbers, the rest (time-to-goal, step model and what the weighting keeps) 848,792 numbers; stored experience 1.6 MB (GCSL: 16.1 MB) |
| A loop in `cost_analysis()` | counted once: a scan of 1, 10 and 100 iterations gives the same `flops` |
| Hand check | a 4-400-300-2 network at batch 256: 62.9 × 10^6 `flops` forward, which is 2 × parameters × batch; 188 × 10^6 for a gradient step |

**Round 2, an independent reader's review (a subagent given only `PLAN.md`, `GOALS.md` and
`PROBLEM_STATEMENT.md`), 15 findings.** Applied: stage 0 split into what the first race needs and what is built
when first needed; "a method at a budget" defined, at one environment; budget levels named independent of the
present method; a formula for seeing and a definition of the explorer; gates as formulas with layouts, seeds and
the score named; a box of machine time per stage, after which the curves go to the user; gate numbers fixed once
and changed only with the user; gates met from scratch, a prior for goal 1 only; discrete controls as a step of
their own before the games; "seeing" kept for the measure and the part renamed *Encoding*; stages 3 and 4 as
outlines; no reproduction of published numbers unless a decision rests on it; the learner's own signs as an item of
stage 1; working rules that copy `CLAUDE.md` removed; a list of what needs the user.

**Round 3, a literature review (a subagent with web search), 11 findings.** Applied: three forms of curiosity are
raced, with "goal, then curiosity" as the form to beat; a share of stretches ends with staying at the goal, since
the score charges not resting; three maze variants (a noise coordinate, a random step, a one-way door) so the rules
can separate before pictures; candidates for picking goals defined on what the learner has, with ensemble
disagreement added and the farthest place and raw model error kept as controls only; the quasimetric time-to-goal
raced against a contrastive distance under a random step; the levers ordered, with a memory of visited places and
planning first, what the buffer keeps second, and gradient steps per step tested on a long changing run; a
streaming form for the lowest budget; games from existing JAX collections with a counter over their state; the
state explorer as the reference in games; losing as a transition of the game and not a reset; the person as a line
and not a gate in games; a plain statement that the gates lie beyond published results.

**Round 4, the reader's second review of the rewritten plan, 9 findings.** Applied: the gates moved to the level of
10^9 operations per step, since the best agent does not fit 10^8 (one gradient step costs 1.5 × 10^9; at 10^8 it
would get one per 15 steps, about 550 within the gate's horizon where it now needs over 12,000), and "GPU power
limited" in the goal points at a small GPU, which is my rough guess for that level; $c$ defined as a mean over 100
steps with acting alone inside it at every step; stage 1 numbered, with truth swaps, the three forms with three
scores and the memory of visited places before a first try at the gate, and everything else only if the gate is
missed; the two controls expected to lose cut; the streaming form moved to stage 4 and the changing maze to stage
3; the contrastive time-to-goal and Gaussian attention made conditional; a stretch, the share of stretches that end
resting and "acting on a score" defined; a rule for dropping a form; the state explorer redefined as a search in
the game's true dynamics, since a table of visits fails where no state repeats; Craftax-Classic moved to stage 3
and *Repeating* and *Skill* made here; four variants named, with the television in one room and the one-way door
on a loop; the gate's reaching clause written out with its numbers (the person's mean $J^{\text{reach}}$ on
`layout-04` to `layout-12` is 0.021, the median steps moved 551); the prior's trigger set to the gate's fifteen
times; `layout-13` to `layout-20` given a use (one run, unchanged); the person dropped as a reference in games; the
section of questions and the unsourced claims about published work removed. The Crafter figures were removed from
the plan: by that reviewer's memory, not checked, they are Crafter scores (a mean over success rates per episode)
and not a share of the game unlocked.

**Round 5, the user's own reading, 2026-11-24** ("The `PLAN.md` seems to be missing several parts from the original
workflow here"). Put back, on the user's choice: how the search is run (pairing, screening designs, one record per
sweep, exact repeats and canaries, parallel agents in worktrees, a fresh agent checking each baseline, the cap of
one confirmation in four), keeping knowledge (`FINDINGS.md`, a survey and a monthly search, re-testing when the
best method changes, upkeep), and working with the owner (a weekly review with explaining, who decides what).
Removed, in the user's words: "The plan should not include any details about the far-away goals; they are out of
scope for now, with the current focus on improving the models themselves instead of converging on specific use
cases." So stages 3 and 4, the guesses about a robot's computer and the embedded board are gone from `PLAN.md`;
this file and `self-training-robot-plan.md` keep them. Stage 2 (pictures and small games) was kept, as my reading
of "the models themselves"; not confirmed.

**Decisions of mine in *Decided by Claude* above that changed with it:** C1 (gates are met without resets only;
the present rare resets are no longer run next to it), C3 (levels 10^9, 10^8 and 10^7 with 256, 16 and 1 MB, named
independent of the method, with the gates at the first; C3 had anchored them on the method), C6 (games from an
existing collection where one holds the difficulty, made here only otherwise).

**Not applied:** a third reset setting of one reset every 10^5 steps (for runs shorter than that it equals no
resets); the agent-only picture as a fourth variant in stage 1 (it stays the second step of stage 2, where the form
is decided again); a maze version of the *Repeating* game.

**Open for the user:** whether seeing becomes a score in `PROBLEM_STATEMENT.md`, which says methods are compared on
$J$ "and on nothing else" and has no score for the case without a command.

### 2026-11-24: how a session runs

The user asked what each session would look like, based on the plan. `PLAN.md` had no answer of its own: its unit
was the question, and three things were open (where the machine hours against a box are added up, how a sweep that
outlasts a session is picked up, what triggers the weekly review). The user then: "I would also start by searching
for implementing reusable components at each session start", and, after my answer that this should be limited to
the item at hand: "I'd like to formalize this process in the plan, so each session does not have to rediscover it."

Added to `PLAN.md`: a section *A session* (one item at a time; the work list as what one session hands to the next;
five steps at the start and five at the end; how machine time is counted), a sentence in the introduction that
points to it, and an opening check in *Keeping the tools sharp* next to the close-out check. Nothing was removed.

Not confirmed by the user: which of the two searches was meant (parts that exist, or code that should become a
part). Both are in the check (C9). The limit to the item at hand is mine as well.

### 2026-11-24: split into the owner's plan and Claude's approach

The user asked how long autonomous sessions could be guaranteed not to change the problem statement, the plan and
the goals. My answer: only a lock the user holds (`chattr +i`) guarantees it; deny rules, hooks and a check against
an approved version stop accidents and make changes visible; and `PLAN.md` must first be split, since part of it is
meant to change. The user: "Make the split."

Kept in `PLAN.md` (the user's): scope, the measures and reference lines, the stage rules and layouts, stage 0 whole
(its steps are its gate), each later stage's condition, gate and box, stage 2's problems (the eight games, without
where each comes from), *What would change the plan*, *A session*, *How the search is run*, *Keeping the tools
sharp*, *Keeping knowledge*, *Working with the owner*. New text there: who may change it, that a stage's questions
are in `APPROACH.md`, and that stage 1's own signs of working are required (their choice moved out).

Moved to `APPROACH.md` (mine): the starting point, the learner and its three forms, stage 1's eight questions with
their order and drop rules, stage 2's order and the NAVIX sources, and what is known beforehand about the games.
The starting point now counts seven runs of the best agent (the two baseline seeds of 2026-11-24 added; their
package repeats are identical, not new evidence).

Reading of mine, not confirmed: the measures and the search rules are in the locked part although how to measure,
run and compare was delegated to me, because the gates depend on the measures and the search rules are the user's
conditions on how time is spent. A change there now goes to the user as a proposal.

### 2026-11-24: no boxes; a stage ends on the owner's word

After I recommended keeping boxes as the stop rule and dropping the gates' pass/fail numbers, the user: "Remove the
entire box mechanism. The plan is to work on one part until I say it's ready."

Removed from `PLAN.md`: the boxes of stages 0, 1 and 2 (10, 60 and 120 hours), stage 1's limit of six questions
before the first try at the gate, a stage's machine time counted against its box, and the decision due when a box
is used up. New: work stays on one stage until the owner says it is ready; a gate is the stage's measurement, shown
at every weekly review and with a proposal that the stage is ready, and neither reaching nor missing its numbers ends
the stage. In `APPROACH.md`, "a first try at the gate" became "a first measurement of the gate".

Kept, as my reading: each question's own budget of machine time and stop criterion (*How the search is run*), which
serve the user's condition on how time is spent rather than ending a stage. I read "one part" as one stage. Both are
said to the user.

### 2026-11-24: no weekly review and no monthly search

The user asked which specific time intervals the plan still named (the weekly review, the monthly search of the
literature; besides them only facts: 14 of 55 s of a run, six months of JAX releases), then: "Remove the weekly
review and the monthly search."

Removed from `PLAN.md`: the weekly review (from *Working with the owner*, from a session's start, and as the place a
gate is shown), the monthly search (from *Keeping knowledge* and from a session's start), and their dates on the work
list. Kept: the survey before stage 1's first race, which is tied to an event, not a date. A gate is now shown when I
propose that a stage is ready; what the review held besides (what was built, the debt list with what was paid off,
the decisions due) has no fixed place any more; a session's report still gives results, decisions on measuring and
what is needed from the user.

### 2026-11-25: the owner has played all twenty layouts

On the user's word ("The rest of the layouts have been played", then "Update `PLAN.md`"); the lock on the file was
lifted. Two passages changed, nothing else:

- The layouts' paragraph no longer says `layout-13` to `layout-20` are run "after the owner has played them". It
  now says the owner has played all twenty, and spells out what the hold-out means until the one run: nothing
  trained, tuned or evaluated on them. That sentence is my wording of what "run once, unchanged" already implied; it
  was added because the code's check (`require_played`) no longer keeps runs off these layouts.
- *Working with the owner* no longer lists the layouts among what is needed from the owner.

## Changes to `APPROACH.md`

### 2026-11-24: after the survey before stage 1

From the survey (`stage-1-survey.md`), made on the user's word "Do the reading survey first, then start the hour
long session".

- Which stored experience is kept moved from after the first gate measurement to question 2. Three replay studies
  agree that a first-in-first-out store under a narrowing visit distribution loses coverage and forgets far regions,
  and the reset-free successes kept their whole history; every later question runs on the store.
- The race of three forms by three scores became a race of the scores inside goal, then curiosity, with goals only
  and curiosity only run once each. Two ablations in continuous mazes (Cell-Free Latent Go-Explore; First Go, then
  Post-Explore) and PEG already favour that form, and one-step curiosity only was near random; racing them in full
  would be verification, not a new idea.
- The scores got their robust forms: the density score measured by the time-to-goal (counts on coordinates fail
  under a noise coordinate), disagreement as a divergence if the copies predict a spread, learning progress as the
  previous copy's error minus the present one.
- The memory: landmarks by farthest-point sampling, edges cleaned online, planning first in training.
- Imagined steps start as imagined goals of real steps; Gaussian attention is raced beside a Fourier first layer;
  the time-to-goal for the random step starts as an added averaging term, not a contrastive one.
- A sign of being stuck added to the learner's own signs.

### 2026-11-25: the theory session's candidates into stage 1

On the user's word ("The findings from the theory session are very interesting to me, put them into the plan at
stage 1"). They went into `APPROACH.md` and not `PLAN.md`: they are what is tried, which the split of 2026-11-24
puts in `APPROACH.md`, and `PLAN.md`'s gates and conditions are untouched. The candidates and their derivations are
in `theory-session-2026-11-25.md`; none is tested and their sources are cited from memory.

The questions keep their numbers, since the notes and the run records refer to them; each candidate went into the
question it bears on.

- Question 1 (truth swaps) got three additions. The measurement of the true time, the data's shortest path and the
  learned time comes before the swaps because it is made on stored experience without a run and decides between two
  remedies for finding 10. Learning on the model only is a fourth swap because its first run uses the exact step,
  which the swaps already build; with the learned model it runs right after them only if the exact step at least
  halves the steps, the swaps' own criterion. The tie between step model and time-to-goal is logged there because
  only the swaps can say whether it points at the part that is wrong.
- Question 2 (the store) got the interference test, because forgetting has two remedies and the test is cheap: no
  environment, recorded experience only. It can move question 7 before the first measurement of the gate.
- Question 3 (the scores) got two variants run with the leading score only, not raced over all scores: a score of
  a place and an action there, and the score per step of travel.
- Question 5 (the budget) measures the two gains it trades. Question 6 points to the fourth swap as its far end.
  Question 7 got the second yardstick and four candidate changes for the attention as a step model. Question 8 got
  the reason relabelled bounds fail under a random step.
- The learner's signs got a candidate fourth.

Not taken over: nothing was left out.

The sources were checked the same day, on the user's word ("Check the theory session's sources"): four agents, one
per group, reading the papers; each source with what it says and how it was checked is in
`theory-session-2026-11-25.md`, *Sources*. Two statements of the dialog were wrong (softmax policy gradient is slow
in the horizon, not in the number of states; a wide network is not a Gaussian process with the tangent kernel) and
thirteen were too loose. No candidate fell. Two lines changed in `APPROACH.md`: the fourth swap names learning from
real and generated steps both as its fallback, since that is what Dyna does, and the score of a place and an action
names the proof that uses such goals (Richens et al. 2025). Seven books and papers could not be opened and rest on
secondary sources or abstracts; the note lists them.

### 2026-11-25: the best agent's operation count after the sort was removed

*Starting point*, *Its computation*: 1.5 × 10^9 and 1.9 × 10^8 became 1.6 × 10^9 and 2.0 × 10^8. The interval
time-to-goal sorted its endpoints, and `cost_analysis()` counts a sort as almost nothing; it now compares pairs, with
the same values, and the count rose by the comparisons it now sees. The method is unchanged (`FINDINGS.md` 24).

### 2026-11-25: a learned rule that does the updating, as a potential experiment

On the user's word ("Write these results into the theory session notes, add the second way as a potential
experiment in stage 1"), after a second dialog on a trained part as a prior and on learning without
backpropagation. The results are sections 8 to 11 of `theory-session-2026-11-25.md`; "the second way" is its
section 11. `PLAN.md` and `GOALS.md` are untouched.

- It is question 9, after question 8 and outside the order. It is a prior, and its training is computation off
  the robot, which `GOALS.md` does not allow for goal 1 and which goal 2's "from scratch" excludes. So it is a
  try-out and no candidate for a gate, taken up on the owner's word or put to the owner with the first row of
  `PLAN.md`'s *What would change the plan*. Trying a prior is allowed by `GOALS.md` ("could attempt either way").
- Decided by Claude, as how to run and compare: the cheapest form comes first, the rule as the step model only,
  on stored experience with no environment in the loop (`PLAN.md`, *How the search is run*, the cheapest question
  first). It is compared by the experience needed to reach the same error at equal operations per step at use,
  with the operations of the training beforehand reported next to it and not counted in the budget, since the
  budget is per environment step. The rule acts only if that form is clearly ahead.
- Training worlds come from `gcrl_maze.layouts.generate`; the test is on `layout-01` to `layout-03`, the layouts
  for trying ideas.
- Not taken over: sections 8 to 10 (a frozen trained part with keys added, the map by closed-form updates, a
  policy read off the map). The user's word named the second way only. Section 10's first form is question 4 with
  a closed-form inverse of the step model, and is a candidate to add there.

The sources of the second dialog were checked the same day by one agent, not on the user's word: the note's
*Sources*, *The second dialog*. One statement of mine was wrong (learned rules were said to work only in worlds
like their training worlds; RL² was tested on larger mazes and lost little) and two were too loose. Question 9
names what the published rules do not show for this problem: no reward as an input, and one long life.

### 2026-11-25: the truth swaps run with resets

Question 1: the swaps run with one environment and a restart every 100 steps. In stage 1's condition the best agent
saw 9 to 94 % of F and never reached the person's level (finding 26), so the criterion "halves the steps to the
person's level" would be undefined and a swap's worth hidden behind the missing exploration. With resets the agent
reaches the level in 37,000 to 40,000 steps (finding 23), which separates knowing from exploring. Told to the user
before the session; the user then opened stage 1.

### 2026-11-26: question 2's remedy after question 3's first score; new candidates for questions 3 and 7

Question 2: the store forgets much only where the agent saw much (finding 29), and before curiosity it seldom did
(finding 26), so the store's remedy waits for question 3's first score, its first test being a store that keeps every
step. Question 3: two more candidates, never resting (the last tenth of the maze takes most of the steps) and the
score per step of travel, both built as settings. Question 7: the Fourier first layer goes before the attention,
since on the forgetting test it fitted best and forgot far less than the plain network while the attention was not
clearly better (finding 30).

### 2026-11-26: the form stops resting; question 1's verdicts so far

Question 3: never resting saw 95 % of `layout-01` 4 to 5 times sooner and reached no worse (finding 35), so the form
no longer rests on every second stretch and the race's remaining scores run without resting. Question 1: the step model
gets no work (its truth reached no sooner on `layout-02` and worse on `layout-01`); the time-to-goal's verdict waits on
the multiplier on `layout-01`, since its truth made the level reachable there and gained nothing on `layout-02`.

### 2026-11-26: the time-to-goal gets work

Question 1: on `layout-01` the multiplier, which fixes the learned time's scale, reaches no better than the learned agent
(J^reach 0.052 and 0.038 at step 143,019) while the exact time is at the person's level by step 60,000, so an error
beyond the scale holds reaching back and the time-to-goal gets work: first where its error lies, on recorded
experience, then the Fourier first layer of question 7.

## Sources

From the literature review of 2026-11-24; the survey before stage 1 is in `stage-1-survey.md`, and three labels
below were raised by it. The sources of the theory session of 2026-11-25 are in
`theory-session-2026-11-25.md`, *Sources*, each with how it was checked. The reliability is the reviewing subagent's own label and was not checked
again: *read* = it fetched the paper's page in that session; *abstract* = the abstract page only; *recalled* = from
memory.

| Claim | Source | Reliability |
|---|---|---|
| Go to a goal, then explore on ensemble disagreement; beats Skew-Fit, MEGA, LEXA and Plan2Explore; without the explore phase it drops to 0 % | Planning Goals for Exploration, Hu et al. 2023, https://arxiv.org/abs/2303.13002 | read |
| A separate explorer and achiever on one world model; the separate explorer is crucial | LEXA, Mendonca et al. 2021, https://arxiv.org/abs/2110.09514 | read |
| Goals at low density of achieved goals; assumes a reward function, a success threshold and a low-dimensional goal space; random actions once the goal is achieved | MEGA, Pitis et al. 2020, https://arxiv.org/abs/2007.02832 | read |
| Return, then explore; detachment and derailment | First return, then explore, Ecoffet et al. 2021, https://arxiv.org/abs/2004.12919 | read |
| Without resets on a real robot from pixels: a task policy alternated with an RND-driven one; the visited states are too narrow, the agent stays at the goal | Zhu et al. 2020, https://arxiv.org/abs/2004.12570 | read |
| Counting states explores best with low-dimensional observations and degrades with pictures | Kayal, Pignatelli, Toni 2025, https://arxiv.org/abs/2501.11533 | abstract |
| Prediction error on raw pixels does badly; a noisy TV slows learning; without a done signal the agent avoids dying because it returns to the known start | Burda et al. 2018, https://arxiv.org/abs/1808.04355 | read |
| RND: exploration that needs coordinated decisions over long horizons is beyond it | Burda et al. 2018, https://arxiv.org/abs/1810.12894 | read |
| QRL is derived for deterministic dynamics; an image holds only part of the state | Wang et al. 2023, https://arxiv.org/abs/2304.01203 | read |
| Offline: QRL 82 % on a point maze, 4 % on its stochastic teleport version, 0 % on visual ant mazes; contrastive RL is robust to stochasticity | OGBench, Park et al. 2024, https://arxiv.org/abs/2410.20092 | read |
| A successor distance obeys the triangle inequality under stochasticity; theory for discrete states | Myers et al. 2024, https://arxiv.org/abs/2406.17098 | read |
| The closest published relative: a QRL-trained representation for goal selection, exploration reward and goal reaching; slow from pixels, 28 to 56 million steps on state tasks | TLDR, Bae, Park, Lee 2024, https://arxiv.org/abs/2407.08464 | read |
| A latent state that keeps only what the agent controls, from a multi-step inverse model | Lamb et al. 2022, https://arxiv.org/abs/2207.08229 | abstract |
| Reset-free learning degrades with the training horizon; agents get stuck in parts of the state space | EARL, Sharma et al. 2021, https://arxiv.org/abs/2112.09605 | read |
| Reset-free PEG over-explores; corners and walls are sink states | Yang et al. 2024, https://arxiv.org/abs/2408.09807 | read |
| A selectively kept long-term memory prevents forgetting where a first-in-first-out buffer does not | Isele, Cosgun 2018, https://arxiv.org/abs/1802.10269 | read (survey before stage 1, `stage-1-survey.md`) |
| Noisy TV: RND does poorly in MiniGrid, ensemble disagreement is robust there and breaks in Atari with many novel states; subtracting a predicted variance works | Mavor-Parker et al. 2021, https://arxiv.org/abs/2102.04399 | read |
| Learning progress is not drawn to noise (with oracle object features) | Kim et al. 2020, https://arxiv.org/abs/2007.07853 | read |
| Reachability from an episodic memory is robust to stochasticity; 1.84 times slower than PPO | Savinov et al. 2018, https://arxiv.org/abs/1810.02274 | read |
| Operations per time step as the binding constraint of continual learning; no counting protocol | Kumar et al. 2023, https://arxiv.org/abs/2307.04345 | read in part |
| On a Jetson Nano a SAC update is very slow and memory cut the image buffer to 25,000 transitions | Wang, Vasan, Mahmood 2022, https://arxiv.org/abs/2210.02317 | read |
| Learning from the stream alone can match batch methods | Elsayed et al. 2024, https://arxiv.org/abs/2410.14606 | abstract |
| Many gradient steps per step overfit early data; periodic resets of part of the agent fix it | Nikishin et al. 2022, https://arxiv.org/abs/2205.07802 | abstract |
| Networks lose the ability to learn over long changing streams | Dohare et al. 2023, https://arxiv.org/abs/2306.13812 | abstract |
| `cost_analysis()` is meant for visualisation and debugging and may differ between versions | https://docs.jax.dev/en/latest/jax.stages.html | read |
| MiniGrid in JAX with symbolic, RGB and first-person views; the true state is returned | NAVIX, Pignatelli et al. 2024, https://arxiv.org/abs/2407.19396 | read |
| Craftax-Classic: 22 achievements, pictures of 63 × 63 × 3 | Matthews et al. 2024, https://arxiv.org/abs/2402.16801 | read |
| Crafter without reward at a million steps: Plan2Explore 2.1 %, RND 2.0 %, random 1.6 %, people 50.5 % | Hafner 2021, https://arxiv.org/abs/2109.06780 | read |
| Mazes from states take about 0.6 to 1 million steps (PEG) and under a million (MEGA) | the two papers above; for PEG the subagent's calculation from episode counts | read, partly computed |
| Bonus methods that are best on Montezuma often lose to epsilon-greedy on easier games | Taïga et al. 2020, https://arxiv.org/abs/2109.11052 | abstract |
| A graph over stored states with search when acting | Search on the Replay Buffer, Eysenbach et al. 2019, https://arxiv.org/abs/1906.05253 | read (survey before stage 1, `stage-1-survey.md`) |
| Goals drawn in proportion to the disagreement of an ensemble of 3 goal-conditioned Q-functions, the candidates drawn uniformly from the goal space | Zhang, Abbeel, Pinto 2020, https://arxiv.org/abs/2006.09641 | read (survey before stage 1, `stage-1-survey.md`) |

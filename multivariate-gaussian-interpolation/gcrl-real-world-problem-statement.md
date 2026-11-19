# Goal-conditioned RL under real-world conditions: problem statement

## Problem
(Not confirmed yet; first restatement, 2026-11-20.)
The user wants a precise statement of the goal-conditioned control problem as it presents itself on a real system, where (a) only a limited number of rollouts can be collected and (b) the system gives no reward signal. The statement should say what the learner is given, what it may do, and what counts as having solved it. What the statement is for (guiding the experiments here, choosing or judging methods, a text for others, a real system to be controlled) is not known yet and is the first question.

The user's words (2026-11-20): "I'd like to formalize the problem of GCRL in the real world: limited rollouts, no reward signal."

## Situation
- The request came through `/research:problem-formulation` without a description; the user chose "Something new" over the open TODO items, then gave the sentence above. User, 2026-11-20.
- The project is an experiments folder on Gaussian/vMF attention for discontinuous functions (2D regression toys, log in `EXPERIMENTS.md`) plus a maze environment package `packages/gcrl-maze`. Read: project folder, 2026-11-20.
- The maze environment already encodes part of "no reward signal": its step never returns a reward other than 0, the task reward exists only in the ground-truth definitions, and agents must model the reward themselves (R7b, must, verified); rollouts end only at a fixed time limit, with no success signal (R16). Read: `gcrl-discontinuous-test-environment.md`, Requirements, 2026-11-20.
- That environment was built as "a stand-in for complex discontinuous cost, expected reward, or world model functions in the context of GCRL"; its consumers are online GCRL training, critic evaluation against exact ground truth and world-model learning; offline dataset generation was out of scope. Read: same log, Situation, 2026-11-20.
- The simulated environment has no rollout limit: 4.3 M steps/s with 4096 parallel environments. Read: same log, Decision status, 2026-11-20.
- No RL training code exists yet in the project; whether to use a JAX RL library was undecided on 2026-11-18. Read: same log, Situation. Still true on 2026-11-20: assumed (the folder shows no new scripts since 2026-11-18).
- Open TODO items that touch RL: "Experiment 4: Gaussian-attention critic in the maze environment", the scoring method for staircase vs wall edges, continuous drift. Read: `TODO.md`, 2026-11-20.
- Nothing in the experiments log, the notes or the earlier log mentions a real system, real-world data, a rollout budget or sample efficiency. Read: grep over `EXPERIMENTS.md` and the notes folder, 2026-11-20.
- Whether a concrete real system (a robot, a machine) is behind "the real world": not known.
- What "limited rollouts" means (how many, how long, whether resets are possible, whether earlier data or a simulator exists): not known.
- What "no reward signal" means (no reward at all, only the reached states, a success check available at evaluation only): not known. Assumed link: the same sense as R7b of the maze log.
- What form the result should take (mathematical definition, written text, benchmark protocol, constraints on the maze experiments): not known.
- Time horizon, what the user values, what happens if nothing is done: not known.

## Related decisions
- `gcrl-discontinuous-test-environment.md` (decided 2026-11-18, steps 1-3 implemented): the simulated test environment. Relation assumed: the problem statement here would set the conditions under which methods are run in that environment; not a parent or child until the user confirms.

## Options
None proposed by the user. ("Formalize" is read as the wish for a precise statement, not as a solution; to be confirmed.)

## Open questions
1. What is the statement for? Decides its form, its level of rigour and who must be able to read it.
2. Is there a concrete real system behind it, or is "real world" the class of conditions to imitate? Decides whether the constraints are measured facts or chosen parameters.
3. What exactly is limited about rollouts, and what else is available (resets, earlier data, a simulator, demonstrations)? Decides the learner's inputs.
4. What exactly is absent with "no reward signal", and how is success then defined and measured? Decides the objective and the evaluation.
5. Relation to the maze environment and the attention-critic experiments. Decides whether this log is a parent of that work.
6. Time horizon, what is valued beyond the stated need, what happens if nothing is done.

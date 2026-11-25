# Theory session of 2026-11-25: results worth exploring

A dialog with the user on what an exact world model gives, how the worth of a gradient step and of a real step can
be written as a function, and what that means for exploration, for the world model's form and for the time-to-goal.
This note keeps the results that bear on the project. Nothing here is tested, and `APPROACH.md` is not changed:
these are candidates.

Every paper named here is cited from memory and was not checked in the session (list at the end). The derivations
(marked *derived*) were made in the dialog and not checked by a second reader.

## The three most promising

1. An agent that learns its time-to-goal and policy only from the model (section 1), tried first with the exact
   step in the model's place.
2. Whether the time-to-goal's excess of 1.3 to 1.4 comes from the soft bound or from the data (section 2): one
   measurement on stored experience decides it.
3. Interference as a second yardstick for the Gaussian attention (section 5): an approximator whose gradient steps
   stay local needs less of the old experience replayed.

## 1. An agent that learns only on the model

**Result.** With an exact model the optimal policy is fixed by the model alone (Bellman's equation). Real steps are
then needed only to learn the model. The agent has three parts:

- the model, trained by supervised regression on real steps and on nothing else;
- the time-to-goal, trained on single steps the model generates: draw s, a and g, take s′ = m(s, a), and require
  d(s, g) ≤ 1 + d(s′, g);
- the policy, trained through the model to minimise d(m(s, π(s, g)), g), which is the model term the best agent has.

This is Dyna (Sutton 1991) with goals. The model can be asked about any input in any order, so the time-to-goal's
training is plain supervised learning without the limits of a trajectory, and single steps keep the model's error
from adding up over a rollout.

**What follows.**

- The policy's loss is bounded by the model's error (simulation lemma, Kearns and Singh 2002). No real step
  corrects the time-to-goal directly.
- Generated inputs must stay where the model is right: s from visited states, the action and the goal free.
- Actions never taken can be learned from, which relabelled trajectories cannot give.

**In the project.** All three exact parts exist in `gcrl-maze` (`move`, differentiable; `geodesic`;
`optimal_policy`), used for scoring only. The agent is the best agent with one change: the time-to-goal learns from
generated steps, not from relabelled trajectories.

**A first test.** The exact `move` as the model. That separates the learning of time-to-goal and policy from the
learning of the model, and it is the truth swap "the exact step" of stage 1's question 1 taken one step further.
Touches questions 1 and 6.

## 2. Two sources for the time-to-goal: bounds from rollouts, consistency from the model

**Result.** In a world without randomness, a real rollout from s to g in k steps proves d\*(s, g) ≤ k. Bounds
compose by the triangle inequality, so the tightest bound the data allow is the shortest path in the graph of all
experienced steps. It equals d\* only where the data hold an optimal path. No rollout gives a lower bound; that
needs the model, or prior knowledge (straight-line distance over the step length). The two sources are
complementary: rollouts bound from above without model error, the model's step-by-step consistency pulls the
estimate down to d\*.

**An open question it raises.** Finding 10: the quasimetric time-to-goal is 1.3 to 1.4 times too long at all
ranges. There are two explanations, and they predict about the same number:

- *The soft bound* (the write-up's own, `quasimetric/README.md`): the push upwards is a fixed weight against a
  squared penalty, so every bound is exceeded a little and the excess adds up along a path.
- *The data's bound* (from this session, a guess): the steps in the store are shorter than a full step (random
  actions in the unit disk are 2/3 of a step long on average, the policy's 0.74), so the shortest path made of
  experienced steps takes about 1.35 to 1.5 times as many steps as the optimal one.

In the dialog I named only the second; the write-up's own explanation is the first, and I had not reread it.

**A first test.** On one run's stored experience, compute the shortest path in the graph of experienced steps for
a sample of pairs, and compare three numbers: d\*, that bound, and the learned d. If the learned d is above the
data's bound, the soft bound is the cause and a growing multiplier is the remedy. If it sits at the data's bound,
the data are the cause and the remedy is the model's consistency term of section 1, with full-length actions.
Joining rollouts needs a rule for when two states count as the same; within a small fraction of a step and in
sight of each other is the obvious one. Touches question 1.

**A limit.** With a random step, a rollout that arrived in k steps shows only that k is possible. Relabelling
selects the lucky outcomes, so the bounds are too low for the expected time. This is the reason behind question 8,
and it says the valid alternative averages over the model's outcomes.

## 3. State-action goals for exploring

**Result.**

- An optimal policy for goals that are states does not fix the dynamics: it says which action wins, not where an
  action leads. Scale is lost, and so is every action that never wins (*derived*).
- A policy that can be commanded "go to s and take a there" is enough to build a complete model of everything
  reachable from its rollouts: every state-action pair can be visited by command. With goals that are states only,
  an action that is never the best way anywhere is never taken, and its outcome stays unknown (*derived*).
- With the goal chosen again whenever it is reached, such a policy can express every policy, since the single
  actions are among its goals (the options result, Sutton, Precup and Singh 1999).

**In the project.** The form *goal* of the learner commands a state. The result says to command a state and the
action to take there, both chosen by the model's uncertainty. It is the smallest version of "reach, then explore":
one chosen step after arriving, against a random phase.

**A first test.** Inside question 3: the goal's score also picks the first action after arrival (the action the
model is least sure of at the goal), against a random first action. Measured by the step model's error on actions
the policy does not prefer, and by seeing.

## 4. Gain as a function, and travel as its price

**Result.**

- The worth of one gradient step through the model is a function, u(θ) = J(θ after the step) − J(θ). With a smooth
  J and step size 1/L it is at least ‖∇J‖²/(2L) (descent lemma).
- Always taking the step of largest one-step gain does not reach the lower bound on the number of steps for convex
  objectives (it misses by a square root), and reaches it up to constants for non-convex ones.
- A real step's worth is an expectation under a belief about the world (value of information). Choosing real steps
  is then a planning problem whose state is the pair (place, what is known): the Bayes-adaptive problem (Duff 2002).
- With resets anywhere this is only a choice of samples. **Without resets, reaching an informative state costs
  steps, and that travel is what makes it planning.**
- Greedy choice has a guarantee only under special structure (adaptive submodularity, Golovin and Krause 2011).
- If the policy learns only through the model, a real step's worth for the policy passes through the model:
  real step → model's gain → policy's gain.

**In the project.**

- The scores of question 3 (density, disagreement, learning progress) are estimates of a real step's gain for the
  model. None of them counts the travel. A candidate: the score divided by the learned time-to-goal from where the
  agent is, plus one, so a goal is chosen by gain per step and not by gain.
- The budget split of question 5 is a trade between the two gains: a real step's for the model, a gradient step's
  for the policy. Learning progress (the previous copy's error minus the present one) measures the first after the
  fact; the change of J^reach per gradient step would measure the second.

## 5. Gradient steps that stay local

**Result.** A gradient step at input x changes the output at x′ by −α · K(x′, x) · ∂L/∂f(x), with
K(x′, x) = ∇f(x′) · ∇f(x) over the parameters (the tangent kernel). The step leaves x′ alone exactly when the two
gradients are orthogonal.

- Exact: parameters that each act on a bounded region (tables, tile coding, splines, compactly supported units),
  or a separate network per region.
- Approximate: Gaussian units, sparse activations. A plain network has neither.
- **The price:** K is interference and generalisation at once. The best K is the covariance of the target under a
  prior over worlds; a Gaussian process with that kernel makes the best update, and a model linear in features φ
  with φ(x) · φ(x′) equal to it has it as its tangent kernel (Mercer).
- Dynamics are not just "near is alike": one part is shared by all inputs (the same law of motion everywhere), one
  part is local (walls). The fitting kernel is a sum of a global part of low rank and a local part.

**In the project.**

- Finding 22: without resets one seed grew worse late (J^reach 0.070 at the end), and the store holds only the
  latest 50,000 steps. If the cause is forgetting, it is interference: steps on the region the agent is in now
  change the output for regions no longer in the store. Question 2 treats this by what is kept in the store. The
  theory names the second remedy: an approximator whose steps do not reach the other regions.
- So question 7 can be judged on a second yardstick besides accuracy per operation: how much the error on region A
  rises while training on region B only.

**A first test.** On recorded experience split by region: train each approximator (plain network, Fourier first
layer, Gaussian attention) on A, then on B only, and report the error on A before and after. It is cheap and has
no environment in the loop.

## 6. The Gaussian attention as a world model

**Result** (*derived* from the model's form, f(x) = Σ wᵢ(x) · vᵢ(x) with softmax weights and local polynomial
values; all the experiments so far are regression of 2-D functions):

- For the values, K(x, x′) = Σ wᵢ(x) · wᵢ(x′) · (1 + dᵢ(x) · dᵢ(x′) + …). At a high logit scale the weights are
  nearly one-hot, so a step is felt only inside the key's cell.
- The keys' positions and precisions have a gradient only where two cells meet and disagree.
- The cells are a learned kernel: their borders settle on the jumps, so inputs on two sides of a wall become
  orthogonal though close.
- The law of motion in free space is linear in state and action, so one key with linear values covers a whole free
  region exactly. Keys are needed only at walls.
- With the weights fixed the model is linear in the values, so Bayesian linear regression per key gives a
  posterior variance. That is an uncertainty score without an ensemble: the expected information gain of a step at
  x is ½ · log(1 + variance / noise).

**Where it falls short, each with what could be tried.**

| Shortfall | Candidate |
|---|---|
| No part shared by all keys: each learns the law of motion itself | A global linear term, the attention fitting the remainder |
| Every input belongs to some key, so a sample from a new region pulls on the nearest key | New keys for new regions; a key's weight limited to its reach |
| Exploring shifts the inputs; a sharp model adapts badly to a sudden shift (E18), slow drift is harmless (E20) | The learned global logit scale of E20 |
| Changing the keys moves predictions everywhere | Two speeds: keys slowly, values fast (in closed form per key) |
| State and action make 4 inputs: a full precision has 10 parameters per key, not 3 | Diagonal plus rank one, which was about equal to diagonal in 2-D |

Touches question 7, and question 3 through the uncertainty score.

## 7. The model and the time-to-goal say the same thing twice

**Result** (*derived*). The time to g after first taking a in s, d\*(s, a, g), fixes the dynamics of a world
without randomness: the successor of (s, a) is the one g at distance 1. So an exact model and an exact
time-to-goal are tied by d(s, g) ≤ 1 + d(m(s, a), g) for every action, with equality for the best one.

**In the project.** How often and by how much the learned pair breaks that tie can be measured on any stored
state without the truth. It is a candidate signal for where one of the two is wrong, beside the truth swaps, and a
candidate uncertainty score. Which of the two is wrong it does not say.

## Sources named, all from memory and unchecked

- Steps needed by gradient methods: Nemirovski and Yudin 1983; Nesterov 2004; Carmon, Duchi, Hinder and Sidford
  ("Lower bounds for finding stationary points"); Li et al. 2021 (softmax policy gradient can take exponentially
  many steps); Yue, Fang and Lin 2023 (gradient descent is optimal under the Polyak–Łojasiewicz condition).
- Worth of a computation and of a sample: Russell and Wefald 1991; Howard 1966; Lindley 1956; Golovin and Krause
  2011.
- Exploration as planning: Bellman 1961; Duff 2002; Kearns and Singh 2002 (E³, simulation lemma); Brafman and
  Tennenholtz 2002 (R-max).
- What a policy says about the world: Richens, Everitt et al. 2025 ("General agents need world models"); Grimm et
  al. 2020 (value equivalence); Sutton, Precup and Singh 1999 (options).
- Kernels and local updates: Farajtabar et al. 2020 (orthogonal gradient descent); Wilson et al. 2016 (deep kernel
  learning); Baratin et al. 2021 (the tangent kernel aligns in training); Deisenroth and Rasmussen 2011 (PILCO);
  Harrison et al. 2018 (ALPaCA).
- Learning from a model: Sutton 1991 (Dyna).

# Theory session of 2026-11-25: results worth exploring

A dialog with the user on what an exact world model gives, how the worth of a gradient step and of a real step can
be written as a function, and what that means for exploration, for the world model's form and for the time-to-goal.
This note keeps the results that bear on the project. Nothing here is tested: these are candidates. On the user's
word of the same day they were written into stage 1 of `APPROACH.md`, each into the question it bears on
(`long-term-plan.md`, *Changes to `APPROACH.md`*).

The papers were named from memory in the session and checked afterwards, on 2026-11-25 (section *Sources* at the
end: what each says, how it was checked, and what the dialog had wrong). The text below is corrected to match. The
derivations (marked *derived*) were made in the dialog and not checked by a second reader.

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

This is Dyna (Sutton 1990, 1991) with goals, taken to its end: in Dyna itself the value function and the policy
learn from the real steps as well as from generated ones. The model can be asked about any input in any order, so the time-to-goal's
training is plain supervised learning without the limits of a trajectory, and single steps keep the model's error
from adding up over a rollout.

**What follows.**

- In a finite world a policy's value in the model differs from its value in the world by at most the model's
  error times a factor that grows with the square of the horizon (simulation lemma, Kearns and Singh 2002; in
  this form Jiang's notes), and the policy that is best in the model loses at most twice that. No real step
  corrects the time-to-goal directly.
- Dyna's own form, learning from real and generated steps both, is the fallback if the model alone falls short.
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
  actions are among its goals (a remark in Sutton, Precup and Singh 1999, not a theorem there).
- **Backed by the literature.** Richens, Everitt and Abel (2025) prove that a policy near-optimal on composite
  goals of depth n fixes the transition probabilities to within about 1/√n, and their goals are sets of
  state-action pairs: the proof needs goals of the kind "take a in s" to force an action. For goals to be met on
  the very next step they prove that nothing about the transitions follows. They prove nothing about plain
  "reach g" goals, so the first point above stays *derived*. Their measure is the probability of meeting a goal,
  not the time to it, and at a fixed depth the error does not vanish as the policy gets better.

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
  objectives (it misses by a square root), and reaches it up to constants for non-convex ones. These bounds are
  worst cases over a class of functions and need a dimension larger than about twice the number of steps.
- A real step's worth is an expectation under a belief about the world (value of information). Choosing real steps
  is then a planning problem whose state is the pair (place, what is known): Bellman's adaptive control process,
  which Duff named the Bayes-adaptive Markov decision process.
- With resets anywhere this is only a choice of samples. **Without resets, reaching an informative state costs
  steps, and that travel is what makes it planning.**
- Greedy choice has a guarantee only under special structure (adaptive submodularity and monotonicity, Golovin
  and Krause 2011). That guarantee is for choosing k items with no cost of getting from one to the next, so it
  does not cover exploring without resets.
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
  prior over worlds: a Gaussian process with that kernel makes the best update, if the prior is right, the noise
  Gaussian and the loss squared. A model linear in features φ with φ(x) · φ(x′) equal to it has it as its tangent
  kernel; such features exist for every covariance (Moore–Aronszajn; Mercer's theorem needs more).
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
  posterior variance. That is an uncertainty score without an ensemble: the information gain of a step at x is
  ½ · log(1 + variance / noise), the variance being that of the function's value at x after the data so far
  (Srinivas et al. 2010).

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

## Sources

Checked on 2026-11-25, on the user's word ("Check the theory session's sources"). Four agents of the session each
took a group, were told to look for where the recollection was wrong, and reported quotes and the pages they
opened; I checked their quotes for Li et al., Richens et al. and Sutton, Precup and Singh against the downloaded
text and did not reread the rest. *Full text*: the paper itself was read. *Secondary*: a source that quotes it.

### What the dialog had wrong or too loose

1. **Softmax policy gradient** (wrong). I said the steps can be exponential in the number of states. The bound
   is exponential in the effective horizon 1/(1 − γ) and a power of the number of states.
2. **Wide networks** (wrong). I said a very wide network is a Gaussian process with the tangent kernel. At the
   start it is a Gaussian process with a different kernel; the tangent kernel governs training, and the trained
   network is in general not the posterior of any Gaussian process.
3. **Dyna** learns from real and generated experience both, not from generated experience only.
4. **Richens et al.** The error bound falls with the goals' depth; at a fixed depth it does not vanish as the
   policy improves. "No model implied" is proved only for goals to be met on the next step.
5. **Simulation lemma.** Kearns and Singh state it as an accuracy the model needs, with the number of states in
   it; "error times a horizon factor" is the later textbook form, and it bounds one policy's value, not a loss.
6. **Features for a covariance** follow from Moore–Aronszajn, not from Mercer's theorem, which needs more.
7. **The tangent kernel aligning in training** (Baratin et al.) is an observation on two image benchmarks, with
   class labels, not a theorem about target functions.
8. **Orthogonal gradient descent** stores gradients of the outputs on earlier tasks' samples, not the inputs, and
   keeps the outputs unchanged only near the parameters where they were stored.
9. **The non-convex bound** is in part I of Carmon et al., reads Δ · L · ε^-2 and holds for randomised methods
   and methods using higher derivatives too.
10. **All the lower bounds** need a dimension that grows with the number of steps.
11. **Value of computation.** Russell and Wefald define a net value against acting now, and credit Good (1968).
12. **Lindley's measure** is the fall in entropy; the Kullback–Leibler form equals it only on average.
13. **The greedy guarantee** is for k items without travel.
14. **E³** works with known states and its bound is polynomial also in the horizon, 1/ε and 1/δ.
15. **Attention's similarity** is not symmetric or positive semi-definite, so it is a kernel smoother and not a
    covariance.

No candidate of this note falls with these. The state-action goals gain a backer (Richens et al.).

### Steps needed by gradient methods

| Source | What it says | How checked |
|---|---|---|
| Nemirovsky and Yudin, *Problem Complexity and Method Efficiency in Optimization*, 1983; Nesterov, *Introductory Lectures on Convex Optimization*, 2004 | Smooth convex: at least about √(L·R²/ε) steps, R the distance from the start to the optimum, while the step count is below half the dimension. Strongly convex: about √κ · log(1/ε). | Secondary: Bubeck, *Convex Optimization: Algorithms and Complexity*, 2015, theorems 3.14 and 3.15, full text. Neither book was opened. |
| Bubeck 2015; Drori and Teboulle 2012 | Nesterov's accelerated method reaches the convex bound; gradient descent needs about L·R²/ε, and that is tight. | Full text |
| Nocedal and Wright, *Numerical Optimization*, 2006 | Steepest descent with exact line search on a quadratic shrinks the gap in function value by ((κ − 1)/(κ + 1))² per step; conjugate gradient needs about √κ · log(1/ε), the best rate for first-order methods. | Secondary: lecture notes of UT Austin and Cornell, and Bubeck 2015, full text |
| Carmon, Duchi, Hinder and Sidford, "Lower bounds for finding stationary points I", *Mathematical Programming* 2020 (arXiv 2017) | Lipschitz gradient only: at least c · Δ · L · ε^-2 queries to reach a gradient of at most ε, for any method, randomised or using higher derivatives. Gradient descent reaches it. | Full text (arXiv v3) |
| Li, Wei, Chi and Chen, "Softmax policy gradient methods can take exponential time to converge", COLT 2021 (with Gu) and *Mathematical Programming* 2023 | With exact gradients, at least (c/η) · \|S\|^(2^(c/(1 − γ))) steps on some discounted MDP with at most three actions per state. | Full text (arXiv v3), theorem 1; quote checked by me |
| Yue, Fang and Lin, "On the lower bound of minimizing Polyak-Łojasiewicz functions", COLT 2023 | At least about κ · log(1/ε) gradient steps for deterministic first-order methods, so gradient descent is optimal up to a constant. | Full text (arXiv v2) |

### The worth of a computation and of a sample

| Source | What it says | How checked |
|---|---|---|
| Russell and Wefald, "Principles of metareasoning", *Artificial Intelligence* 1991 | The net value of a computation is the rise in utility against taking the default action now; keep computing while some computation has a positive expected net value. They credit the notion to Good (1968). | Full text (author's preprint) |
| Howard, "Information value theory", *IEEE Transactions on Systems Science and Cybernetics* 1966 | A number can be put on removing or reducing an uncertainty. | Abstract only, and secondary |
| Lindley, "On a measure of the information provided by an experiment", *Annals of Mathematical Statistics* 1956 | The information of an experiment as the expected fall in the entropy of the belief. | Secondary only (Huan, Jagalur and Marzouk 2024); the paper could not be opened |
| Srinivas, Krause, Kakade and Seeger, "Gaussian process optimization in the bandit setting", ICML 2010 | The information gain of T observations is ½ · Σ log(1 + variance before each / noise). | Full text (arXiv v4), lemma 5.3 |
| Golovin and Krause, "Adaptive submodularity", *JAIR* 2011 | Greedy choice of k items reaches at least (1 − 1/e) of the best adaptive policy's expected value, if the objective is adaptive monotone and adaptive submodular under the prior. | Full text, theorem 5.2 |
| Settles, "Active learning literature survey", 2009 (2010 update); Dasgupta 2004 | A threshold on a line without noise: about log(1/ε) chosen queries against about 1/ε random ones. | Full text |

### Exploration as planning

| Source | What it says | How checked |
|---|---|---|
| Bellman and Kalaba, "On adaptive control processes", 1959; Bellman, *Adaptive Control Processes*, 1961 | Learning while acting is dynamic programming over a state that holds the physical state and what is known. | Secondary (Guez's thesis 2015; Duff's papers); neither opened |
| Duff, *Optimal Learning: Computational Procedures for Bayes-Adaptive Markov Decision Processes*, thesis, 2002 | The name "Bayes-adaptive Markov decision process", used by Duff from 2001. | His papers of 2001 and 2003 in full text; the thesis was not opened |
| Gittins, "Bandit processes and dynamic allocation indices", *JRSS B* 1979 | An index per arm solves the discounted bandit exactly, if arms are independent and an arm not played does not change. | Abstract, and secondary for the conditions |
| Kearns and Singh, "Near-optimal reinforcement learning in polynomial time", *Machine Learning* 2002 | E³: a state is known once every action was tried there often enough; the learner either exploits or heads for the unknown states. Steps polynomial in the states, the horizon, 1/ε and 1/δ. The simulation lemma is its lemma 4. | Full text |
| Brafman and Tennenholtz, "R-max", *JMLR* 2002 | The same guarantee by treating every unknown state-action pair as the best possible. | Full text |
| Jiang, notes on tabular methods, 2020; Agarwal, Jiang, Kakade and Sun, *Reinforcement Learning: Theory and Algorithms* | The simulation lemma in its usual form: a policy's values in two models differ by at most ε_R/(1 − γ) + γ · ε_P · R_max/(2(1 − γ)²). | Full text |

### What a policy says about the world, and learning from a model

| Source | What it says | How checked |
|---|---|---|
| Richens, Everitt and Abel, "General agents need world models", ICML 2025 (arXiv 2506.01622, four authors with Bellot, titled "General agents contain world models" from its third version) | In a finite, fully observed, stationary world where every state can be reached from every other: a policy within a factor 1 − δ of the best probability of meeting every composite goal of depth n > 1 fixes each transition probability to within √(2p(1 − p)/((n − 1)(1 − δ))). Goals are sets of state-action pairs, in sequences and either-or. For goals to be met on the next step, nothing follows. | Full text, both versions; quotes checked by me |
| Grimm, Barreto, Singh and Silver, "The value equivalence principle for model-based reinforcement learning", NeurIPS 2020 | Two models are value equivalent for a set of policies and a set of functions if their Bellman operators agree on them; a model need only be told apart on the policies and functions it will be used with. | Full text, sections 1 to 3 |
| Sutton, Precup and Singh, "Between MDPs and semi-MDPs", *Artificial Intelligence* 1999 | "The conventional optimal value functions V* and Q* are not affected by the introduction of options": a remark in section 3. | Full text; quote checked by me |
| Sutton, "Integrated architectures for learning, planning, and reacting based on approximating dynamic programming", ICML 1990; "Dyna, an integrated architecture for learning, planning, and reacting", *SIGART Bulletin* 1991 | Dyna: reinforcement learning on each real step, the model updated from it, then K steps of the same learning on steps the model generates. | First pages of both, as page images |
| Bertsekas and Shreve, *Stochastic Optimal Control: The Discrete-Time Case*, 1978 | Discounted cost: with finitely many actions an optimal stationary policy without randomness exists; so it does with a compact action space, continuous dynamics and a lower semicontinuous cost bounded below; otherwise only ε-optimal ones. | Full text, corollaries 9.17.1 and 9.17.2, proposition 9.19 |

### Kernels and local updates

| Source | What it says | How checked |
|---|---|---|
| Jacot, Gabriel and Hongler, "Neural tangent kernel", NeurIPS 2018 | Training moves the output by the tangent kernel times the loss's gradient at the training inputs. In the limit of infinite width the kernel stays fixed, and with squared loss the trained mean is kernel regression with it. | Full text |
| Lee et al., "Deep neural networks as Gaussian processes", ICLR 2018; Lee et al., "Wide neural networks of any depth evolve as linear models under gradient descent", NeurIPS 2019 | At the start a wide network is a Gaussian process with another kernel. After training its outputs are Gaussian but not a posterior, unless only the last layer is trained. | Full text |
| Farajtabar, Azizan, Mott and Li, "Orthogonal gradient descent for continual learning", AISTATS 2020 | Each step is projected orthogonal to stored gradients of the outputs on earlier tasks' samples. | Full text |
| Wilson, Hu, Salakhutdinov and Xing, "Deep kernel learning", AISTATS 2016 | A base kernel on a network's features, all trained by the Gaussian process's marginal likelihood. | Full text |
| Baratin et al., "Implicit regularization via neural feature alignment", AISTATS 2021 | On MNIST and CIFAR10 the tangent kernel grows more alike to the class labels during training (centred kernel alignment). | Full text |
| Deisenroth and Rasmussen, "PILCO", ICML 2011 | Dynamics as a Gaussian process on state and action predicting the change of state, its length scales and variances fitted by evidence maximisation. | Full text |
| Harrison, Sharma and Pavone, "Meta-learning priors for efficient online Bayesian regression" (ALPaCA), WAFR 2018 | Bayesian linear regression on a network's last layer, the features and the prior learned across tasks; applied to dynamics in the paper itself. | Full text |
| Rasmussen and Williams, *Gaussian Processes for Machine Learning*, 2006 | The posterior mean and covariance (equations 2.22 to 2.24); the mean is the best guess under squared loss. Every positive definite function has a feature space (theorem 6.1); Mercer's theorem (4.2) needs a finite measure and a bounded kernel. | Full text of chapters 2, 4 and 6 |
| Tsai et al., "Transformer dissection", EMNLP 2019; *Dive into Deep Learning*, chapter 11 | Attention is a kernel smoother over the inputs; the book names it Nadaraya–Watson regression with a learned similarity. | Full text |
| Albus, "A new approach to manipulator control: the cerebellar model articulation controller", 1975; Sutton and Barto, *Reinforcement Learning*, 2nd edition, section 9.5.4 | Tile coding generalises only to states that share a tile. Hashed tiles are not local. Sutton and Barto credit tile coding to Albus 1971 and 1981. | Full text of both |

Not opened at all: Nemirovsky and Yudin 1983, Nesterov 2004, Lindley 1956, Bellman 1961, Duff's thesis, Puterman
1994, Hernández-Lerma and Lasserre 1996. Howard 1966 and Gittins 1979 by abstract only.

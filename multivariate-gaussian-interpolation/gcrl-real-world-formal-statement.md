# Reward-free goal-conditioned control: formal statement

Formal version of the problem in [gcrl-real-world-problem-statement.md](gcrl-real-world-problem-statement.md)
(R-numbers refer to it). Draft, no design research behind it. **(choice)** marks what the problem statement leaves open.

## 1. System

A controlled process without reward:

$$\mathcal{M} = (\mathcal{S}, \mathcal{A}, \mathcal{O}, P, \Omega, \rho_0)$$

- states $s \in \mathcal{S}$, actions $a \in \mathcal{A}$, observations $o \in \mathcal{O}$;
- dynamics $s_{t+1} \sim P(\cdot \mid s_t, a_t)$, observation $o_t = \Omega(s_t)$;
- the starting state is sampled from a distribution, $s_0 \sim \rho_0$, at the start and after every reset.

The system emits $o_t$ and a reset flag $z_t \in \{0, 1\}$, and nothing else: no reward, no success flag, no distance
to a goal (R1). The agent's knowledge at time $t$ is the history $h_t = (o_0, z_0, a_0, \dots, o_t, z_t)$.

## 2. Goals

A goal is an observation $o^g \in \mathcal{O}$ the agent is asked to go to; $s^g$ is the state behind it.

The event $o_t = o^g$ has probability 0 in general and is used nowhere: not as a reward, not as a success test,
not in a score (R2c). Whatever reward the agent uses internally, it constructs itself.

## 3. Protocol

**Training.** One stream of interaction with $\mathcal{M}$, in which no goals are given (R5c). At every step $t$ the
agent acts with $a_t \sim \mathfrak{A}(\cdot \mid h_t)$, where $\mathfrak{A}$ is the method.

The environment may reset the agent at any time: $s_{t+1} \sim \rho_0$ in place of $s_{t+1} \sim P(\cdot \mid s_t, a_t)$.
The agent neither requests nor controls resets (R4b). A reset is announced: $z_{t+1} = 1$ exactly when one happened.

At any time $t$ the method exposes its current goal-conditioned policy $\pi_t(a \mid h, o^g)$.

**Evaluation.** Done in separate environments, at any time $t$ during training, not as a phase after it; how they
are provided is left to the environment.
For $o^g \sim p_g$, $s_0 \sim \rho_0$, the experimenter runs $\pi_t$ for $T$ steps. The agent reports nothing: no
"reached", no distance (R2c). **(choice)** evaluation does not advance $t$, and the agent does not learn from it.

## 4. Grading (R7c)

Grading is done from outside, with a quantity the agent never sees. Sections 1 to 3 are the whole problem as the
agent meets it; which $\ell$ is used is a choice of the instance.

The instance supplies a cost $\ell : \mathcal{S} \times \mathcal{S} \to \mathbb{R}_{\ge 0}$ between a state and the
goal state, with $\ell(s, s) = 0$: ground truth in simulation, an instrument on a real system.

The score of the policy at training time $t$ is its regret against the optimal policy, over all $T$ steps of an
evaluation run, both started from the same $s_0$ with the same goal:

$$J_\ell(t) = \mathbb{E}_{o^g,\, s_0}\Big[\, \frac{1}{T}\sum_{k=1}^{T} \ell(s_k^{\pi_t}, s^g) \;-\; \frac{1}{T}\sum_{k=1}^{T} \ell(s_k^{\pi^*}, s^g) \,\Big], \qquad \pi^* = \arg\min_\pi \mathbb{E}\Big[\sum_{k=1}^{T} \ell(s_k^{\pi}, s^g)\Big]$$

$J_\ell(t) \ge 0$, with 0 exactly when $\pi_t$ does as well as possible. Where $\pi^*$ is not available (a real
system), the first term alone is reported.

In the maze, $\ell$ is the exact geodesic distance $d$, $\pi^*$ steps along the shortest path, and its term is
$\frac{1}{T}\sum_{k} \max(d(s_0, s^g) - kL,\, 0)$ with $L$ the step length.

Methods are compared on the curve $J_\ell(t)$ only.

**Diagnostics, not grading.** What a method learned on the way (a critic, a reward model, a world model) may be
inspected to explain its behaviour, for example a world model's error against $P$. It never enters the comparison:
there is no reward here, so no $Q^*$ and no true reward to score against, and not every method has these functions.

## 5. Relaxations

| Condition | Parameter | Relaxed by |
|---|---|---|
| resets outside the agent's control (R4b) | reset times | none (one continuing stream), or every $H$ steps (episodic) |
| no goals during training (R5c) | training stream | giving goals $o^g \sim p_g$ during training |
| nothing else given (R6) | inputs | giving a dataset $\mathcal{D}_0$ or a model $\tilde{P}$ at $t = 0$ |
| no reward, success or distance signal (R1, R2c, must) | none | not relaxable |

## 6. Relation to existing formulations

Checked 2026-11-20 against the papers' text (parts read only through a summary are marked †); six searches, nine
papers, not a survey. No paper found states this whole problem; every part of it has a precedent.

| Work | Same as here | Differs |
|---|---|---|
| Autonomous exploration (Lim & Auer 2012; Tarbouriech et al. 2020, arXiv:2012.14755) | reward-free process $\langle \mathcal{S}, \mathcal{A}, p, s_0 \rangle$; goals are states; output is a goal-conditioned policy per goal; cost counted in time steps. Calls itself "a goal-conditioned counterpart to the reward-free exploration framework" | the agent has a RESET action, here resets are outside its control; finite state space, so a goal state is hit exactly, which is not available here; goals restricted to states reachable within $L$ expected steps from $s_0$; criterion is expected hitting time $\le L + \varepsilon$, not a success rate; no declared arrival |
| Reward-free exploration (Jin et al. 2020, arXiv:2002.02794) | exploration phase without reward, then a task; measured by exploration sample complexity | the task is a revealed reward function; tabular, finite horizon |
| LEXA (Mendonca et al. 2021, arXiv:2110.09514) | unsupervised phase without rewards or given goals, then goals given as observations (images) and solved "zero-shot without any additional learning" | evaluation only after the unsupervised phase, here at any time; success measured by the benchmark with distance thresholds on simulator state† |
| Embodied navigation evaluation (Anderson et al. 2018, arXiv:1807.06757) | the agent must declare arrival ("DONE") and is judged "at the time this action is produced, not at some favorable preceding time"; no declaration counts as failure. Also a "time-limited exploration by the agent" regime with performance "as a function of exploration extent", like the curves over $t$ here | here the agent declares nothing; success there is a distance threshold $\tau$ checked by the benchmark, a special case of the behaviour score; adds a path-efficiency measure (SPL) |
| Multi-goal RL at $\varepsilon = 0$ (Blier & Ollivier 2021, arXiv:2106.08863) | exact reaching as the limit of $\mathbb{1}[\lVert \varphi(s) - g \rVert \le \varepsilon]$ | the limit is a Dirac reward $\delta_{\varphi(s)}(dg)$, a measure; values become densities |
| Contrastive RL (Eysenbach et al. 2022, arXiv:2206.07568) | no tolerance and no distance metric in the objective: reward is the density $(1-\gamma)\, p(s_{t+1} = s_g \mid s_t, a_t)$ | objective is a discounted density, not a 0/1 event; experiments still score with thresholds (5 cm, 0.5 m)† |
| Autonomous RL (EARL; Sharma et al. 2021, arXiv:2112.09605) | non-episodic training, $s_0 \sim \rho$ sampled once; resets as interventions outside the agent's control, $\tilde{p} = (1-\varepsilon)\,p + \varepsilon\,\rho$; "deployed" evaluation = the policy $\pi_t$ at any time $t$ of training, started from $\rho$ in the evaluation environment, as here | reward is given; fixes the reset times as random with probability $\varepsilon$ per step, here they are left open; also defines "continuing" evaluation (reward collected during training) |
| Zero-shot RL (Touati et al. 2022, arXiv:2209.14935) | reward-free data first; a goal can be given at test time (reward "1 at a known goal state and 0 elsewhere") | the reward-free phase is an offline dataset, not interaction |
| URLB (Laskin et al. 2021, arXiv:2110.15191) | reward-free pre-training with a step budget $N_{PT}$ | followed by fine-tuning with extrinsic reward for $N_{FT}$ steps |
| Reward-free goal-conditioning wrapper (Åström et al. 2025, arXiv:2511.04598) | agents never see external reward; goal success judged without the environment | judged by a wrapper, not the agent; normalized distance $< 0.1$ in continuous environments, exact match only in discrete ones; no phases |

## 7. The maze as an instance

$\mathcal{S} = \mathcal{O} =$ free space, $\Omega = \text{id}$, $P$ deterministic (geodesic step), $\ell = d$
(exact geodesic distance, already implemented), $\pi^*$ in closed form. To match this statement it needs: no goal in the observation during
training, and the exact-match parts removed (the step that snaps onto
its target, the success test "state equals goal" and the values built on it).

# Reward-free goal-conditioned control: formal statement

Translation of the problem in [gcrl-real-world-problem-statement.md](gcrl-real-world-problem-statement.md)
(R-numbers refer to it). Second draft, 2026-11-20, after the user's correction: nothing is graded on an exact match
with the goal, and the agent gives no goal-reached or distance signal. No design research behind it. Choices that the
problem statement does not make are marked **(choice)**.

## 1. System

A controlled process without reward:

$$\mathcal{M} = (\mathcal{S}, \mathcal{A}, \mathcal{O}, P, \Omega, \rho_0)$$

- states $s \in \mathcal{S}$, actions $a \in \mathcal{A}$, observations $o \in \mathcal{O}$;
- dynamics $s_{t+1} \sim P(\cdot \mid s_t, a_t)$, observation $o_t = \Omega(s_t)$, initial state $s_0 \sim \rho_0$.

The system emits $o_t$ and nothing else: no reward, no success flag, no distance to a goal, no termination (R1).
The agent's knowledge at time $t$ is the history $h_t = (o_0, a_0, \dots, o_t)$.

## 2. Goals

A goal is a point the agent is asked to go to. A goal map $\phi : \mathcal{O} \to \mathcal{G}$ is a parameter of the
problem (R13):

| $\phi$ | Goal is |
|---|---|
| identity | a full observation |
| a projection | a part of the observation (e.g. a position) |
| an encoder | a point in a latent space |

A goal is handed to the agent as a goal observation $o^g$ **(choice)**, with $g = \phi(o^g)$ and $s^g$ the state
behind it.

The event $\phi(o_t) = g$ has probability 0 in general and is used nowhere: not as a reward, not as a success test,
not in a score (R2c). Whatever reward the agent uses internally, it constructs itself.

## 3. Protocol

Parameters: exploration budget $B \in \mathbb{N} \cup \{\infty\}$ (R3), reset cost $c \in [0, \infty]$ in steps (R4),
evaluation horizon $T$, evaluation goal distribution $p_g$.

**Phase 1, exploration (R5).** No goal is given. The agent acts with any $a_t \sim \pi^{\text{exp}}(\cdot \mid h_t)$
and may request a reset to $\rho_0$. With $n$ steps and $k$ resets:

$$n + c \cdot k \le B$$

It outputs a goal-conditioned policy $\pi(a \mid h, o^g)$, and whatever functions it learned on the way (a critic
$\hat{Q}$, a reward model $\hat{r}$, a world model $\hat{P}$), if it has them.

**Phase 2, evaluation.** For $o^g \sim p_g$, $s_0 \sim \rho_0$, run $\pi$ for $T$ steps. The agent reports nothing:
no "reached", no distance (R2c).

**(choice)** $\pi$ is frozen in phase 2 and its steps do not count against $B$ (open question 1 of the log).

## 4. Grading (R7)

Grading is done from outside, with quantities the agent never sees. It has two kinds, kept apart (user, 2026-11-20).

**Behaviour.** The instance supplies a cost $\ell : \mathcal{S} \times \mathcal{S} \to \mathbb{R}_{\ge 0}$ between a
state and the goal state, with $\ell(s, s) = 0$: ground truth in simulation, an instrument on a real system.

$$J_\ell = \mathbb{E}_{o^g,\, s_0}\big[\, \ell(s_T, s^g) \,\big] \qquad \text{(lower is better)}$$

**(choice)** the cost is taken at the final step; an instance may aggregate over the trajectory instead.
In the maze, $\ell$ can be the exact geodesic distance $d$.

**Learned functions.** For a learned function $\hat{f}$ that has a reference $f^*$ in the instance, and an evaluation
distribution $\mu$:

$$E_f = \mathbb{E}_{x \sim \mu}\big[\, \lVert \hat{f}(x) - f^*(x) \rVert \,\big]$$

Only where a reference exists (simulation). For the dynamics, $f^* = P$. For a critic or reward model the reference
depends on the reward the method built for itself, so there is no single $f^*$; what the reference is, is open
(section 6.1).

**Is the grading an implementation detail?** Half. Sections 1 to 3 are the whole problem as the agent meets it, and no
grading appears in them. Which $\ell$, when it is measured and which function errors are reported are choices of a
benchmark instance. But that some outside $\ell$ exists is part of the problem: without it "go to the goal" has no
meaning and methods cannot be ordered (R8).

A method is a map $(\mathcal{M}\text{ via interaction}, B, c) \mapsto (\pi, \hat{Q}, \hat{r}, \hat{P})$; methods are
compared on $J_\ell$ and $E_f$ as functions of $B$.

## 5. Relaxations

| Condition | Parameter | Relaxed by |
|---|---|---|
| bounded interaction (R3, should) | $B$ | $B = \infty$ |
| no free resets (R4, should) | $c$ | $c = 0$ (free), $c = \infty$ (none: one continuing stream) |
| goal-free exploration (R5, should) | phase 1 | giving goals $o^g \sim p_g$ during phase 1 |
| nothing else given (R6) | inputs | adding a dataset $\mathcal{D}_0$ or a model $\tilde{P}$ to phase 1 |
| no reward, success or distance signal (R1, R2c, must) | none | not relaxable |

## 6. Consequences and open points

1. **Reference for critics and reward models.** Without an exact-match reward there is no given $Q^*$. A reference
   could be built from $\ell$ (for example the optimal cost-to-go under $\ell$), but a method whose own reward
   differs is then not comparable on it. Not settled.
2. **A learned $\phi$ is no longer gameable.** Grading uses $\ell$ on states, so a degenerate latent space gains
   nothing.
3. **Evaluation start and resets.** Phase 2 draws $s_0 \sim \rho_0$ for each goal; with $c = \infty$ it would instead
   continue from the last state. Not settled (open questions 1 and 2).
4. **$\ell$ decides what "close" means.** Two instances with different $\ell$ can rank methods differently; the
   statement does not pick one.

## 7. Relation to existing formulations

Checked 2026-11-20 against the papers' text (arXiv HTML or PDF; parts read only through a summary are marked †).
Not an exhaustive survey: six searches, nine papers. No paper found states this whole problem; every part of it has a
precedent. The comparison was made against the first draft and adjusted after the correction of 2026-11-20.

| Work | Same as here | Differs |
|---|---|---|
| Autonomous exploration (Lim & Auer 2012; Tarbouriech et al. 2020, arXiv:2012.14755) | reward-free process $\langle \mathcal{S}, \mathcal{A}, p, s_0 \rangle$; goals are states; output is a goal-conditioned policy per goal; cost counted in time steps; RESET is an action (here $c = 1$). Calls itself "a goal-conditioned counterpart to the reward-free exploration framework" | finite state space, so a goal state is hit exactly, which is not available here; goals restricted to states reachable within $L$ expected steps from $s_0$; criterion is expected hitting time $\le L + \varepsilon$, not a success rate; no declared arrival |
| Reward-free exploration (Jin et al. 2020, arXiv:2002.02794) | exploration phase without reward, then a task; measured by exploration sample complexity | the task is a revealed reward function; tabular, finite horizon |
| LEXA (Mendonca et al. 2021, arXiv:2110.09514) | unsupervised phase without rewards or given goals, then goals given as observations (images) and solved "zero-shot without any additional learning": the protocol of section 3 and both **(choice)**s | success measured by the benchmark with distance thresholds on simulator state†; no stated budget |
| Embodied navigation evaluation (Anderson et al. 2018, arXiv:1807.06757) | the agent must declare arrival ("DONE") and is judged "at the time this action is produced, not at some favorable preceding time"; no declaration counts as failure. Also a "time-limited exploration by the agent" regime with performance "as a function of exploration extent": exactly $B$ | here the agent declares nothing (user, 2026-11-20); success there is a distance threshold $\tau$ checked by the benchmark, a special case of the behaviour score; adds a path-efficiency measure (SPL) |
| Multi-goal RL at $\varepsilon = 0$ (Blier & Ollivier 2021, arXiv:2106.08863) | goal map $\varphi$ on states; exact reaching as the limit of $\mathbb{1}[\lVert \varphi(s) - g \rVert \le \varepsilon]$ | the limit is a Dirac reward $\delta_{\varphi(s)}(dg)$, a measure; values become densities |
| Contrastive RL (Eysenbach et al. 2022, arXiv:2206.07568) | no tolerance and no distance metric in the objective: reward is the density $(1-\gamma)\, p(s_{t+1} = s_g \mid s_t, a_t)$ | objective is a discounted density, not a 0/1 event; experiments still score with thresholds (5 cm, 0.5 m)† |
| Autonomous RL (EARL; Sharma et al. 2021, arXiv:2112.09605) | non-episodic training, $s_0 \sim \rho$ sampled once; resets as a parameter; "deployed" evaluation = start from $\rho$ after training (phase 2 here) | reward is given; resets modelled as random interventions with probability $\varepsilon$ per step, not as a cost; also defines "continuing" evaluation (reward during training) |
| Zero-shot RL (Touati et al. 2022, arXiv:2209.14935) | reward-free data first; a goal can be given at test time (reward "1 at a known goal state and 0 elsewhere") | the reward-free phase is an offline dataset, not interaction |
| URLB (Laskin et al. 2021, arXiv:2110.15191) | two phases with step budgets $N_{PT}$, $N_{FT}$ | phase 2 fine-tunes with extrinsic reward |
| Reward-free goal-conditioning wrapper (Åström et al. 2025, arXiv:2511.04598) | agents never see external reward; goal success judged without the environment | judged by a wrapper, not the agent; normalized distance $< 0.1$ in continuous environments, exact match only in discrete ones; no phases |

### What the check changes

1. **The literature agrees that exact reaching is not an event to grade.** Blier & Ollivier: "In general, the
   probability of reaching any goal exactly is 0." The tolerance-free formulations work with densities (Blier &
   Ollivier; contrastive RL), and every benchmark found grades from outside on the true state, usually with a
   thresholded distance: a special case of $J_\ell$.
2. **Declared arrival is not adopted.** Anderson et al. require the agent to signal "DONE"; here the agent gives no
   such signal (user, 2026-11-20).
3. **Missing here: which goals count.** Autonomous exploration scores only goals reachable within $L$ expected steps;
   here $p_g$ and $T$ are free, so unreachable goals worsen every method's score alike. A reachability condition on
   $p_g$ is a candidate addition.
4. **Missing here: efficiency.** $J_\ell$ at the final step ignores how the agent got there; Anderson et al. weight
   by optimal over actual path length (SPL), autonomous exploration bounds the hitting time.
5. **Resets have two existing models:** an action with a step cost (autonomous exploration; the $c$ used here) and
   random interventions (EARL). Evaluation from $\rho_0$ after reset-free training is EARL's "deployed" setting.

## 8. The maze as an instance

$\mathcal{S} = \mathcal{O} =$ free space, $\Omega = \phi = \text{id}$, $P$ deterministic (geodesic step), $\ell = d$
(exact geodesic distance, already implemented). To match this statement it needs: no goal in the observation during
phase 1, resets only on request, a step counter for $B$, and the exact-match parts removed (the step that snaps onto
its target, the success test "state equals goal" and the values built on it; user, 2026-11-20: a bug).

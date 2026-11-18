# GCRL test environment with discontinuous value, reward and dynamics: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| R8a | The true optimal Q(s, a, g) of the discrete-step task (step-count staircase included) can be evaluated for any state, action and goal, with discontinuity positions exact near walls | Critics are judged on edge position (E11, E14) and on max-over-actions overestimation; an approximate truth would blur exactly what is measured | user, 2026-11-18 | R8c (round 1: fixed evaluation goals suffice) |
| R2 | The agent is a circle in a 2D plane, controlled each step by a continuous 2D action | Keeps the state and action 2D, so Q-functions and keys can be plotted like the toy experiments | user, 2026-11-18 | R2b (round 1 follow-up: point agent is fine) |
| R7 | The reward is sparse success (0/1), episodes end on success | Standard in GCRL, so results transfer to common setups (HER, contrastive RL) | user, 2026-11-18 | R7b (decision review: step returns 0 reward; agents model reward) |

## Round 1
Problem formulation (2026-11-18): consumers online GCRL training, critic evaluation vs truth, world-model learning; no training code or library yet; starts small, may grow; ground truth = optimal Q(s,a,g), exact near walls, both the discrete-step staircase Q* and a path-length truth; hundreds of envs; reasons for earlier choices: fixed layouts to plot/compare, 0/1 reward standard in GCRL, sliding no particular reason. Musts confirmed: R1, R3, R4, R8a, R8b, R10, R11; R2 should; R9 could.

Discovery: generators G (RL environments, JAX-native), H (motion planning / computational geometry / game engines), J (optimal control / DP / numerical analysis); reports in gcrl-discontinuous-test-environment.discovery/r1-*.md. All three independently found that exact step counts under natural straight/sliding steps are a hard geometry problem (bounded-link min-link), and that exact geodesic distance is cheap via a tangent graph. Ways to exactness: certified bounds (J3), dynamics making N a closed form of d (J5), restricted geometry (H3/J6, J4), lattice MDP (G5), per-goal exact sets (G6/J2/H4).

Ranking: D2 leading (geodesic-step dynamics: every must met plainly), D3 runner-up (square agent breaks R2), D1 (user's proposal in best form) trailing on R8a ~ and R9.

Searches: generator G — JAX RL environment libraries and GCRL benchmarks (QDax PointMaze, CAMAR, Jax2D/Kinetix, JaxGCRL/MJX, MuJoCo Playground, OGBench/D4RL pointmaze oracles, SoRB, MDPax, jaxdp, Gymnasium FuncEnv, gymnax, Jumanji, NAVIX, XLand-MiniGrid); ~27 tool calls. Generator H — C-space inflation, visibility graphs (pyvisgraph, extremitypathfinder), continuous Dijkstra / shortest path maps, min-link paths, swept AABB and collide-and-slide (Fauerby, Quake 3), SDF projection (Quilez, PBD, Moreau), RVO2, CGAL Minkowski sums; ~21 tool calls. Generator J — minimum-time HJB, viability/capture basins, constrained eikonal viscosity solutions, min-link complexity, sweeping process / catch-up, SIVIA interval methods, manufactured solutions, CGAL arrangements, hj_reachability; ~19 tool calls. Researcher: no separate web search this round; documented route = JaxGCRL / Brax envs (from G), recorded as D7.

User's answers at the end of round 1: R13 must; dynamics physicality not sure (draft wanted); fixed evaluation goals suffice (R8a → R8c); remark: movement bounded to a unit circle around the agent (R14).
Follow-up answers: draft approved; R14 reason: makes cost and value functions less axis-aligned (should, verified); R2 → R2b: point agent among polygon walls is fine.

## Round 2
Draft built (user approved): D2 closed form exact on 3710/3710 starts; D1m/D5 undecided set 51 % of starts (not slivers). Matrix updated for R8c, R2b, R13, R14. D2 leading, D5 runner-up. No web search this round.

## Decision review
User (2026-11-18): "The goal should be exact; during rollouts the step function should never return anything other than 0 reward. The agent will have to model the reward itself." → R15 (point goal), R7b replaces R7; amended in place (keeps the choice).

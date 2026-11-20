# GCRL test environment with discontinuous value, reward and dynamics

## Problem
Confirmed by the user: 2026-11-18
The Gaussian/vMF attention experiments need a goal-conditioned control task on which critics, reward models and world models can be trained and checked. Its value, reward and dynamics functions must have discontinuities shaped by obstacles, the way contact and constraint-heavy tasks do, and it must run fast enough, batched on the GPU next to the JAX training code, to support many seeds and sweeps. Exact ground truth is needed to measure learned critics and world models against. Out of scope: offline dataset generation, random layouts per episode.

## Situation
- The project is an experiments folder with JAX scripts for 2D regression toys ([toy2d.py], [toy2d_oblique.py], [diagnose.py], [sweep.py], [moving.py], [drift.py]) and a log [EXPERIMENTS.md]; no RL code, no environment yet. Read: project folder, 2026-11-18.
- Stack: uv project, Python 3.14 venv, `jax[cuda13]`, optax, matplotlib; GPU RTX 2070 Super Max-Q, 8 GB. Read: pyproject.toml, nvidia-smi, 2026-11-17.
- Not a git repo. Read: environment info.
- The user's notes ("Gaussian / vMF Attention for Discontinuous Q-Functions — Working Notes") list an RL checklist: key placement over (s, a) or state-conditioned over actions (RBF-DQN style) or keys from a replay buffer; observation normalisation and tanh-bounded actions; dead-key monitoring and re-init at high-TD-error samples; max-over-actions overestimation; offline-RL pessimism from distance to keys; and experiment 4 "drop-in critic for a constraint/contact-heavy continuous-control task; compare TD error and overestimation". Read: user's notes, pasted 2026-11-17.
- Findings so far that bear on the environment: sharp Gaussian critics lock in when the data distribution moves (E18) and need re-softening; continuous drift (E20) is being tested now. Read: EXPERIMENTS.md, 2026-11-18.
- The user asked for "a JAX-based parallelizable 2D maze environment with a continuous [x, y] action space controlling the movement of a circle per step", as "a stand-in for complex discontinuous cost, expected reward, or world model functions in the context of GCRL". User, 2026-11-18.
- Choices the user made before this research (via question tool, 2026-11-18): fixed hand-drawn ASCII maps with the same map across a batch (over random mazes per episode); circle slides along walls on collision (over stop-at-contact and reject-step); sparse 0/1 reward, 1 on reaching the goal, terminate on success (over -1 per step and dense distance). The reasons behind them were not stated.
- The user often has difficulty understanding produced code (global instructions). Read: ~/.claude/CLAUDE.md.
- Consumers: online GCRL training, critic evaluation against ground truth, and world-model learning; not offline dataset generation. User, 2026-11-18.
- No existing RL training code; whether to use a JAX RL library is not decided. User, 2026-11-18.
- Time horizon: starts small as a stand-in for these experiments, may grow; don't block making it reusable later. User, 2026-11-18.
- Ground truth wanted: optimal Q(s, a, g) for any state, action and goal, with the positions of its discontinuities exact near walls. User, 2026-11-18.
- Scale: hundreds of parallel environments; simplicity matters more than speed. User, 2026-11-18.
- Note (confirmed relevant by the user's answer): with discrete steps, a step-length limit, a 0/1 success reward and discount gamma, Q* = gamma^(steps to goal), a staircase in the number of steps; its level sets are discontinuities in addition to the wall-shaped ones.
- Reasons behind the earlier choices: fixed layouts so learned functions and keys can be plotted and compared across runs; sparse 0/1 reward because it is standard in GCRL so results transfer; sliding along walls had no particular reason beyond being the usual choice. User, 2026-11-18.
- Ground truth: both the exact discrete-step Q* (staircase included) and a version continuous in path length are wanted, separately. User, 2026-11-18.

## Requirements
| # | Requirement | Reason (what breaks without it) | Source | Priority | Verified |
|---|---|---|---|---|---|
| R1 | Rollouts of hundreds of environments do not bottleneck the (JAX) training code and need no per-step host round trip; simplicity over raw speed | Without it, rollouts bottleneck the experiments | user, 2026-11-18 (reworded after the bias check: "on the GPU inside compiled JAX" named the mechanism; JAX is the fixed stack) | must | yes |
| R2b | The agent's state and action are 2D and continuous; the agent may be a point (drawn as a circle) among walls given as polygons | Keeps state and action 2D so Q-functions and keys can be plotted like the toy experiments; a true circle collision shape is not needed | user, 2026-11-18 round 1 follow-up (replaces R2) | should | yes |
| R3 | The value, reward and/or dynamics have obstacle-shaped discontinuities | This is the property under test; without it the environment cannot stand in for contact/constraint tasks | user, 2026-11-18 (confirmed with the problem) | must | yes |
| R4 | Tasks are goal-conditioned: the goal is part of the input, success is defined relative to it | GCRL is the target setting | user, 2026-11-18 (confirmed with the problem) | must | yes |
| R5 | Learned functions and keys can be plotted over one known layout and compared across runs and seeds | Comparing runs and seeds needs the same layout everywhere | user, 2026-11-18 (reworded from "fixed ASCII maps, same across a batch", a mechanism) | should | yes (reason) |
| R6 | Contact with walls keeps the tangential part of the motion | No particular reason beyond being the usual choice | user, 2026-11-18 | could | yes |
| R7b | During rollouts the environment's step never returns a reward other than 0; the task's reward (1 on reaching the goal) exists only in the ground-truth definitions, and agents must model the reward themselves | The agent's own reward model is part of what is learned and tested (stand-in for learned cost / expected-reward functions); a reward from the environment would make that unnecessary | user, 2026-11-18 decision review (replaces R7) | must | yes |
| R16 | Rollouts end only at a fixed time limit (no termination on success) | Goal and actions are continuous, so a rollout essentially never lands exactly on the goal; termination would also leak success | user, 2026-11-18 decision review | must | yes |
| R15 | The goal is an exact point: success means the state after a step equals the goal point exactly (no goal radius) | User: "The goal should be exact" | user, 2026-11-18 decision review | must | yes |
| R8c | The true optimal Q(s, a, g) of the discrete-step task (step-count staircase included) can be evaluated for any state and action, for a fixed set of evaluation goals per layout, with discontinuity positions exact near walls; training goals may be arbitrary without truth | Critics are judged on edge position (E11, E14) and on max-over-actions overestimation; an approximate truth would blur exactly what is measured; evaluation only needs fixed goals | user, 2026-11-18 round 1 (replaces R8a) | must | yes |
| R8b | A ground truth continuous in path length (e.g. shortest-path distance to the goal around walls) can be evaluated, exact near walls | Separates the wall-shaped discontinuities from the step quantization | user, 2026-11-18 | must | yes |
| R9 | The user can read and follow the environment code | The user often has difficulty understanding produced code | global instructions; user, 2026-11-18 | could | yes |
| R10 | Many environments can be rolled out in parallel for online training, episodes restarting as they end | Online GCRL training is a consumer | user, 2026-11-18 | must | yes |
| R11 | The true dynamics can be evaluated directly on arbitrary (state, action) pairs, batched | World-model learning is a consumer: learned dynamics must be compared with the real ones, including at walls | user, 2026-11-18 | must | yes |
| R12 | The interface does not block later use with an RL library or reuse in other projects | Time horizon "starts small, may grow"; no library chosen yet | user, 2026-11-18 | should | yes |
| R13 | The value, reward and dynamics have no discontinuities other than those caused by obstacles and by the step count (no artefacts of a lattice, solver or axis order) | Artefact discontinuities everywhere would swamp the obstacle-shaped edges whose positions are measured (edge offsets ~1e-3, E11/E14) | user, 2026-11-18 round 1 | must | yes |
| R14 | Each step's movement stays within a circle of fixed radius around the agent (action set = a disk) | Makes the cost and value functions less axis-aligned (an action box gives axis-aligned reachable sets and value level sets) | user, 2026-11-18 round 1 follow-up | should | yes |

## Options
Complete designs (D) are built from the generators' components; each raw row below names the design it joins and why. All designs share the reward (R7: 0/1 on reaching the goal disk, terminate) and goal conditioning (R4); they differ in dynamics and in how the exact truth is obtained. Shared component **T1** = exact geodesic distance d(s, g) around walls by a tangent/visibility graph (per layout: graph + Floyd–Warshall in numpy; per query: batched visibility tests in JAX); cross-checked on CPU by extremitypathfinder (MIT).

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| O1 | (user's proposal) A JAX 2D maze environment written in this project: circle agent, continuous [x, y] action per step, fixed ASCII maps, sliding collisions, sparse 0/1 reward with termination on success, vmap/jit-parallel | as D1 | as D1 | costly | its best form is D1 |
| D1 | User's proposal in best form: circle agent, natural sliding; R8b by T1; R8a by a certified bracket: lower bound ceil(d(s, goal set)/L) valid for any dynamics but not tight behind convex corners, upper bound from a constructive policy, branch-and-bound over the action disk where they differ (J3). Variants differ in f near corners and in cost: **D1a** projection f(s,a) = Proj_free(s + a) via SDFs (J7/H7; closed form; tunnels through walls thinner than the step unless walls are thick enough); **D1b** collide-and-slide with time of impact (H6; iterated, keeps path length ≤ L, which may make the bracket tighter) | physical-looking sliding; every must but R8a met plainly | exact N needs certification (bounded-link min-link is hard in general, J, H); may leave undecided slivers behind convex corners; per-query search is slow; size of the undecided set not yet quantified | costly | trailing (R8a, R9) |
| D1m | (from the bias check) D1 with the undecided slivers masked out of scoring and their area reported: exact truth wherever it is scored | keeps physical sliding | **draft (round 2): the undecided set is not a sliver: lower and upper bound disagree on 51 % of starts in a U-maze (every start whose path bends), gap up to 2 steps, also with the farthest-visible upper bound**; truth not evaluable there (R8c) | costly | not applicable (R8c, must) |
| D12 | (from the round-2 bias check) Polygonal action set (regular 12–16-gon instead of a disk) with straight-move stop-at-contact dynamics, point agent among polygon walls: dynamics piecewise affine, every backward-reachable set a union of polygons, exact staircase per evaluation goal by polygon arithmetic (Shapely/GEOS floats, MIT/LGPL) | keeps physical stopping at walls (contact discontinuities at corners); exact truth without CGAL | n-gon is not a disk (R14 ~; near-isotropic); polygon complexity may blow up over k steps; visibility-clipped Minkowski sums are non-trivial code (R9 ✗); float polygon ops are exact only to rounding; unproven in a draft | costly | runner-up (trailing R14, R6, R9; untested) |
| D2 | Geodesic-step dynamics: f(s,a) moves the agent up to L along the shortest free path from s toward t = Proj_free(s + a) (J5); then N = ceil((d − r_goal)/L) exactly and Q* = γ^N(f(s,a)) in closed form from T1. Where the straight segment s→t is free (most states) f equals free motion; pushing into a wall gives the projection only where the segment s→Proj_free(s+a) is free (not near thin walls or concave corners); for targets hidden behind a corner the agent wraps around it | every must met plainly (draft on one layout); exact Q* and d everywhere (arbitrary goals: an uncovered gain under R8c); dynamics discontinuous in a near thin walls and at the cut locus (R3) | **drops contact-like stopping around corners exactly where R3/R11 want contact discontinuities**; its added cut-locus discontinuity comes from the geodesic definition, not from contact; non-standard "path-following" dynamics, weaker transfer; f needs the geodesic path (next-hop table); cut-locus ties need a fixed rule; goal disks must not be cut by walls (placement rule, else d − r_goal is wrong); arc bookkeeping for a circle agent (variant D2b: point agent among pre-inflated polygon walls, no arcs) | costly | leading (draft, round 2: closed form exact on 3710/3710 starts, one layout) |
| D3 | Rectilinear tile world (H3 = J6): square agent, axis-aligned walls from an ASCII map, action box [−L, L]^2 applied as a clamped x move then a clamped y move (per-axis sliding); every reachable set is a union of rectangles, so exact N per goal by BFS over compressed coordinates (on demand for any goal); d by visibility graph over rectangle corners | every must met; simplest code (R9); exact everything with rectangle arithmetic | not a circle (R2); uncovered costs: anisotropic motion, x-then-y order is an artefact (may count under R13 if verified), discontinuities only axis-aligned (may favour axis-aligned critics such as diag Gaussians, E1b, E11) | costly | not applicable (R13, must: x-then-y axis order) |
| D4 | Lattice-quantized finite MDP (G5): circle agent, continuous actions, outcome of f snapped to a fine lattice; exact Q* for that MDP by BFS/value iteration per goal on GPU (on demand for any lattice goal); R8b by T1 | exact truth for the env as defined; simple truth code (R9); sliding (R6) | uncovered (fails R13 if verified): f is piecewise constant in a everywhere (actions below half a lattice step do nothing), so Q* and f have lattice discontinuities everywhere, swamping the obstacle-shaped edges; edge positions become lattice artefacts; |S| per goal memory | costly | not applicable (R13, must) |
| D5 | Straight moves without sliding (blocked = stay, or stop at contact) + exact k-step backward reachable sets per goal (G6/J2/H4 with CGAL arrangements or Minkowski sums; cheaper unproven variant: H2 pivot propagation), computed on demand per goal | exact N for any state and any goal (slow per new goal; speed is uncovered) | no sliding (R6); C++/GPL CGAL or unproven conjecture; hard to read (R9) | costly | trailing (R12, R6, R9; exact truth only via CGAL/GPL or an unproven conjecture) |
| D6 | Link-distance world (H5): an action is a displacement of any length; the agent moves straight until the target or a wall; N = link distance (window partition), so the staircase is shaped only by obstacles. Exact N via iterated weak-visibility regions: exact for a point agent among polygons; a circle agent gives arc boundaries that Shapely approximates (exact needs arc booleans) | R8b by T1; simpler code with Shapely (R9 ~) | unbounded steps (R14); R8c ~ for a circle agent (arcs) | costly | trailing (R14) |
| D7 | Physics-engine maze: Jax2D/Kinetix (G3), MJX/Brax point mass in the JaxGCRL mould (G7, also the documented JAX GCRL route), or CAMAR soft contact (G2) | closest to real contact; JaxGCRL training code reusable (R12) | no exact Q* possible: solver/impulse/soft contact (R8a); second-order state (R2) | costly | not applicable (R8a, must) |
| D8 | Reuse an existing JAX maze env (QDax PointMaze, G1) with the field's cell-level oracle | little env code | the field's oracle is approximate near walls (R8a); adding an exact R8a oracle to someone else's dynamics turns it into D1/D5 | costly | not applicable (R8a, must) |
| D11 | (from the bias check) Disk-only or capsule-only obstacles (also zero-thickness segment walls): C-obstacles are disks/capsules, so the geodesic code is much simpler; a geometry variant combinable with D1, D2 or D6 | simpler T1 (R9); fewer arc cases | fewer maze-like layouts (no square rooms); rounded discontinuity shapes only | costly | dropped in round 2: with a point agent (R2b) there are no arcs left to simplify |
| A4 | Add-on (split from G8 by the bias check): port OGBench/D4RL pointmaze layouts as extra maps of the chosen design, truth by T1 | comparability with published GCRL layouts (R7's reason, R12) | giant layouts large for plots | cheap | add-on, optional |
| D9 | Do nothing / change the process: no environment; keep testing critics on analytic 2D regression targets with known discontinuities (as E1–E20) | no new code; exact truth by construction | no online GCRL training (R10) and no dynamics for world models (R11) | cheap | not applicable (R10, R11, must) |
| D10 | Discount by path length (semi-MDP, H): Q* = γ^(d/L), so the staircase disappears and R8a collapses into R8b | simplest exact truth (T1 only) | no step-count staircase, which R8a explicitly includes | cheap | not applicable (R8a, must) |
| A1 | Add-on: manufactured-solution layout ladder (J4): empty room, thin wall, doorway, U-trap, two rooms with hand-derivable d, N, Q as unit tests of the truth code and graded difficulty | catches silent errors in any oracle (harm 4 of D2) | small | cheap | add-on, recommended with the leader |
| A2 | Add-on: discontinuity-catalogue layout (J8): thin-wall jumps, shadow rays, cut-locus hyperbolas, staircase edges, action-space jumps, each with exact loci | lets E11/E14-style edge scoring report per discontinuity type | small, on top of T1 | cheap | add-on, recommended with the leader |
| A3 | Add-on: exact action-space edge maps for Q*(s, ·, g) (H8, velocity obstacles) | exact max-over-actions and Q(s,a) plots | ~80 lines | cheap | add-on, optional |

Generator rows (raw), each merged as stated:

| # | Summary | Fits | Costs | Reversibility | Verdict |
|---|---|---|---|---|---|
| G1 | Reuse QDax PointMaze — pure-JAX point maze, Brax env interface, >1.5M steps/s (https://arxiv.org/pdf/2211.13742, https://qdax.readthedocs.io; MIT, InstaDeep/Imp | | | | merged into D8 (reuse of an existing JAX maze env); it provides neither the oracle nor sliding |
| G2 | CAMAR in single-agent mode — JAX continuous routing; circles for agents and obstacles (walls as circle clusters), smooth force contact, holonomic or diff-drive; | | | | merged into D7 (physics/soft-contact engine): soft force contact, RRT* references |
| G3 | Rigid-body circle in a fixed polygon maze on Jax2D (Kinetix engine) — Box2D-style JAX physics, fixated polygon walls, vmappable scenes (https://github.com/Micha | | | | merged into D7 (physics engine): impulse solver |
| G4 | Hand-written pure-JAX circle maze with an analytic tangent-graph geodesic oracle (~150 lines) — state 2D position, action = displacement clipped to norm v, circ | | | | component: dynamics part = projection sliding (merged into D1); oracle part = tangent graph (shared component T1 of D1, D2, D4, D5, D6) |
| G5 | Lattice-backed finite MDP with exact tabular Q* — continuous actions but f's outcome quantized to a fine lattice (e.g. 1/64 cell), collision on lattice points;  | | | | merged into D4 (lattice-quantized finite MDP) |
| G6 | Exact backward-reachable-set staircase — for a goal, compute k-step backward reachable sets B_k exactly with polygon/arc arithmetic offline; V* = -min{k : s in  | | | | merged into D5 (exact backward reachable sets, per goal) |
| G7 | Tiny MJX/Brax point-mass maze in the JaxGCRL / MuJoCo Playground mould — MuJoCo XML ball with planar slide joints and wall boxes (as Gymnasium-Robotics PointMaz | | | | merged into D7 (physics engine, MJX/Brax; also the documented JAX GCRL route) |
| G8 | Port the standard benchmark layouts and their oracle protocol — OGBench / D4RL pointmaze layouts as ASCII in JAX, oracle = BFS over cells + Euclidean within a c | | | | merged into D8 (standard layouts + cell-level oracle) |
| J1 | Tangent-graph geodesic distance in JAX (exact d, R8b) — C-space of a circle among polygon walls = rounded polygons; shortest paths = tangent segments + arcs aro | | | | component T1 (exact geodesic distance d by tangent graph), used by D1, D2, D4, D5, D6 |
| J2 | Exact k-step backward reachable sets as an arc/segment arrangement (exact N by discrete-time reachability) — R_0 = goal ball, R_k = Pre(R_{k-1}) ∪ R_{k-1} as CG | | | | merged into D5 (exact reachable sets as CGAL arrangements) |
| J3 | Certified staircase bracket with refinement only where undecided — lower bound L = ceil(d/r) (J1, any dynamics); upper bound U = steps of a constructive policy  | | | | merged into D1 (certified bracket gives R8a for natural sliding dynamics) |
| J4 | Manufactured-solution layout ladder — layouts with hand-derivable exact d, N, Q (empty room, one thin wall, slit/doorway, U-trap, two rooms) as unit tests for t | | | | add-on A1 (manufactured-solution layout ladder as tests), compatible with every design |
| J5 | Eikonal-consistent ("geodesic-step") dynamics, so N = ceil((d − ε)/r) exactly — the step moves up to |a| along the shortest free path from s toward the target s | | | | merged into D2 (geodesic-step dynamics) |
| J6 | Separable rectilinear world — square agent, axis-aligned box walls, |a_x|,|a_y| ≤ r applied as clamped x move then clamped y move (per-axis sliding); Pre of a u | | | | merged into D3 (same design as H3) |
| J7 | Catch-up (projection) dynamics with steps below the free space's reach — f(s,a) = Proj_free(s + a); rounded C-space is prox-regular (constant ≈ ρ) except at cus | | | | merged into D1 (projection / catch-up sliding dynamics) |
| J8 | Discontinuity catalogue: one layout containing every viscosity-solution feature with exact loci — (1) value jumps across thin walls (Soner), (2) shadow rays fro | | | | add-on A2 (discontinuity catalogue layout), compatible with every design |
| H1 | Tangent-visibility-graph oracle in JAX (C-space inflation) — R8b. Capsule walls (segments inflated by agent radius); shortest paths = bitangent lines + arcs aro | | | | component T1 (same as J1) |
| H2 | Discrete-step wavefront ("quantized continuous Dijkstra" / pivot propagation) — exact R8a without sliding. Boundaries of B_k are arcs of radius jr (+ goal radiu | | | | merged into D5 as its cheaper, unproven variant (pivot propagation, no sliding) |
| H3 | Axis-separated tile world (platformer collision) — exact everything by rectangle arithmetic. Square (AABB) agent, axis-aligned rectangular walls from an ASCII t | | | | merged into D3 (rectilinear tile world) |
| H4 | Exact-arithmetic backward reachable sets (Minkowski sums + visibility clipping) — general R8a by brute force. Per goal, B_{k+1} = Pre(B_k) with exact 2D geometr | | | | merged into D5 (exact reachable sets by Minkowski sums) |
| H5 | Waypoint actions / link-distance world (inverted: redefine the step). Action = displacement of any length; move straight until target or wall (stop or slide); s | | | | merged into D6 (link-distance world) |
| H6 | Collide-and-slide kinematic controller with analytic time of impact — dynamics for R1, R6, R10, R11. Sweep circle along a, earliest TOI against capsule walls, m | | | | merged into D1 as an alternative sliding implementation (collide-and-slide) |
| H7 | Projection dynamics through exact signed distance functions (sweeping process / position-based dynamics). s' = Π_free(s + a) via analytic SDFs of inflated walls | | | | merged into D1 (projection sliding via SDFs; same dynamics as J7) |
| H8 | Velocity-obstacle maps of action-space edges — exact discontinuity positions over actions. For fixed s, actions hitting wall i within one step form a truncated  | | | | add-on A3 (exact action-space edge maps), compatible with every design |

## Matrix
| Option | R1 | R2b | R3 | R4 | R5 | R6 | R7 | R8c | R8b | R9 | R10 | R11 | R12 | R13 | R14 | ✗ or ~ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *priority, verified* | must, yes | should, yes | must, yes | must, yes | should, yes | could, yes | should, yes | must, yes | must, yes | could, yes | must, yes | must, yes | should, yes | must, yes | should, yes | |
| D1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ R8c, ✗ R9 |
| D1m | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ R8c, ~ R9 |
| D2 | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ | ~ R6, ~ R9 |
| D3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ R13, ✗ R14 |
| D4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ R13 |
| D5 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ~ | ✓ | ✓ | ✗ R6, ✗ R9, ~ R12 |
| D12 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ? | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ~ | ~ R14, ✗ R6, ✗ R9, ? R8c (untested) |
| D6 | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✗ | ~ R6, ~ R9, ✗ R14 |
| D7 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ R8c, ✗ R2b (4D state), ✗ R13 |
| D8 | ✓ | ✓ | ✓ | ✓ | ✓ | ? | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ? | ? | ✗ R8c |
| D9 | – | ✓ | ✓ | ~ | ✓ | – | – | ✓ | ✓ | ✓ | ✗ | ✗ | – | – | – | ✗ R10, ✗ R11 |
| D10 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ R8c |

(R8c replaces R8a: exact truth for a fixed set of evaluation goals. Under R8c the per-goal costs of D5 no longer matter. D1/D1m stay ~: exact step counts under sliding are hard even for one goal.)

## Evaluation
Rejection records (rewritten in round 2 against the current requirements R2b, R8c, R13, R14):
- **D1 (trailing: R8c, R9).** R8c as worded: "the true optimal Q(s, a, g) of the discrete-step task … for any state and action, for a fixed set of evaluation goals, with discontinuity positions exact near walls". Scenario: under sliding (or straight) steps the cheap lower bound ceil(d/L) is valid but not tight past convex corners; in the draft's U-maze it disagrees with the best path-following upper bound on 51 % of starts, and no path-following policy can close the gap, because past a convex corner no further point of the geodesic is visible (draft add-on, round 2). Exact N there needs a search over action sequences (bounded-length min-link). No requirement accepts an inexact truth. Best variant: projection sliding with a certified bracket refined by branch-and-bound per scored point. Compared with D2: ~ R8c (must) against ✓; D1's ✓ R6 (could) does not outweigh it. Would come back if R8c is relaxed to a tolerance at scored points (question to the user, round 2).
- **D1m (not applicable: R8c, must).** The masked region is half the maze, so Q* is not evaluable "for any state and action" as R8c asks. Best variant: none that avoids it, short of solving the search (= D1).
- **D3 (not applicable: R13, must).** R13 as worded bans discontinuities from "a lattice, solver or axis order"; D3's x-then-y clamping is the axis-order artefact. Also fails R14 (should): box actions. Best variant: none keeps rectangle-exact sets without per-axis order.
- **D4 (not applicable: R13, must).** f is piecewise constant in a everywhere (lattice snapping), so Q* and f jump everywhere, not only at walls. Best variant: none.
- **D5 (trailing: R12, R6, R9).** Straight moves that stop at contact; exact per-goal reachable sets need exact arc/polygon arithmetic: CGAL (GPL; R12 ~ "does not block reuse in other projects") or the unproven H2 pivot conjecture; no sliding (R6 ✗, could); hard code (R9 ✗, could). Compared with D2: D2 ✓ R12 (should), ~ R6, ~ R9. Arbitrary-goal truth is not counted (uncovered under R8c).
- **D6 (trailing: R14).** Unbounded per-step displacement fails R14 (should) as worded. With a point agent (R2b) its truth is exact (R8c ✓). Best variant: cap the step length — but then it is no longer link distance and loses its exact truth (becomes D5).
- **D7 (not applicable: R8c, R13, must).** Solver/impulse/soft contact: no exact Q*, solver artefacts. Also R2b ✗ (position + velocity is a 4D state).
- **D8 (not applicable: R8c, must).** Cell-level oracle is approximate near walls; layouts split off as A4.
- **D9 (not applicable: R10, R11, must).** No environment.
- **D10 (not applicable: R8c, must).** No step-count staircase; offered as an extra truth channel next to the leader.
- **D12 (runner-up; trailing: R14, R6, R9; R8c untested).** n-gon actions are near-isotropic but not a disk (R14 ~); stop-at-contact, no sliding (R6 ✗); visibility-clipped polygon Minkowski sums are hard code (R9 ✗); exactness is float-polygon exact and unproven (R8c ?). Compared with D2: D2 ✓ R14, ~ R6, ~ R9, ✓ R8c (drafted). D12 is the option if physical stopping at corners is required and a disk is negotiable.

Checks, round 1:
- Rejection check: D4 stretched R2 (fixed: ✓, D4 now ties D2); D6's best variant avoids its R9 ✗ (fixed: ~, and R8a ~ for arcs); R8a scored inconsistently between per-goal BFS (D3, D4) and per-goal exact sets (D5) (fixed: D5 ✓); D7/D8 R8b cells contradicted T1 (fixed: ✓); D3's anisotropy is not in R2 (moved to uncovered); D1 wording "bound wrong" → "not tight" (fixed).
- Bias check: R8a "any goal" and "exact" may be stronger than the need (asked again: fixed evaluation goals? tolerance with masked slivers?); R9 as could looks low given the global instructions (the user set it to could explicitly on 2026-11-18; kept); R1 named a mechanism (reworded); R2 "circle" (asked); D2's costs understated: it drops contact-like stopping around corners and its cut-locus discontinuity is an artefact of the definition (added to Costs); D2's goal term needs goal disks not cut by walls (added); D1's slivers were never quantified (D1m added, measurement proposed in the draft); missing options added: D1m, D11 (disk/capsule obstacles), A4 (split from D8); D1 split into D1a/D1b.
- User's answers (end of round 1): R13 must (D4 not applicable); dynamics: "not sure", a draft comparing both near corners would help; R8a replaced by R8c (fixed evaluation goals); new R14 (movement within a circle around the agent; reason not stated). New ranking: D2 leads if path-following around corners is acceptable; D5 (straight moves, stop at contact, exact per-goal sets) runner-up and leader if physical contact is needed; D1/D1m stay ~ on R8c. D3 (box actions) and D6 (unbounded steps) fail R14.
- Ranking right after the checks (superseded by the answers above): no option leads on verified requirements alone. D4 leads only on coulds and falls if R13 is verified; D2 leads if R13 holds and path-following around corners is acceptable; D1m leads if physical sliding is required and "exact wherever scored" is enough.

Draft and stress test (round 2): [drafts/maze_draft.py](gcrl-discontinuous-test-environment.drafts/maze_draft.py), figure [drafts/maze_draft.png](gcrl-discontinuous-test-environment.drafts/maze_draft.png). U-maze (7×5 cells, one wall), point agent, L = 0.3, goal disk radius 0.2, action in the unit disk.
- D2 closed form: greedy policy reaches the goal in exactly N = ceil(d/L) steps from 3710/3710 random free starts; lower-bound property d(f(s,a)) ≥ d(s) − L holds with min slack 1.7e-16 on 3710 random (s, a); max displacement = L exactly (R14); all next states free.
- D5 (stop at contact) / D1 (sliding): lower bound ceil(d/L) equals a greedy straight-move upper bound on only 49 % of starts; on 51 % (every start whose path bends at the wall end) they differ by up to 2 steps, so exact N needs search there. D1m's "small slivers" assumption is false for this geometry.
- Behaviour near the corner: D2's one-step reachable set equals stop-at-contact's except a small patch behind the corner that D2 can wrap into; action-space maps of γ^N(f(s0, ·)) look alike.
- Cost of the draft: ~330 lines incl. plots; one bug found in the draft's straight-move policy (stalled on a corner node), none in D2.
- Why the user might reject D2 in use: wrap-around steps behind corners are non-physical; a learned world model must represent them.

Checks, round 2:
- Rejection check: stale records citing R8a/R2 (rewritten above); D3 fails R13 as worded (axis order) → not applicable; D1m fails R8c as worded → not applicable; D2's "arbitrary goals" is uncovered under R8c (marked); D2's R13 ✓ needs a reason: the cut locus is caused by the obstacles (two routes around a wall), only which side is taken exactly on that measure-zero line depends on node order (kept ✓, tie rule to be fixed and asked); D2's evidence is one layout (noted; A1 tests must cover thin walls, concave corners, goal placement); D5 R12 → ~ (GPL); D7 R2b → ✗ (4D state); D10 R7 → ✓; D11 dropped.
- Bias check: the 51 % came from a weak upper bound → rerun with the farthest-visible policy: identical (49 % decided, 51 % undecided, every undecided start bends; drafts/maze_draft_bound.py), with the geometric reason above. "Exact" in R8c may be a tolerance need (asked); "any state and action" may be stronger than scoring needs (asked together); the staircase edges every L across the map must be told apart from wall edges in scoring (R8b gives a separate channel; scoring method is a child decision); missing option D12 (polygonal action set) added; tolerance-certified truth = D1 with relaxed R8c (asked); D6's "slide" variant does not share D6's cells (noted under D6's best variant); D2's success rule (end of step) and tie rule must be fixed (spec items for the decision).

Harms and growth scenarios for D2 (leader):
1. Transfer: conclusions about critics may not transfer to physical contact tasks, because near corners the dynamics follow a path rather than slide. Mitigation: they coincide with projection sliding wherever the straight segment is free; quantify how often corner-wrapping happens in rollouts.
2. World-model difficulty: f contains a short-range planner (a target hidden behind a corner moves the agent around it), so learned world models face a harder f than physical sliding. Feature or confound depending on the experiment.
3. Extra discontinuities: at the cut locus (two equal routes to t) f needs a tie-break rule and jumps there; deterministic, but must be documented and included in the truth.
4. Silent truth errors: arc and tangent bookkeeping bugs give confident wrong ground truth. Mitigation: A1 ladder + extremitypathfinder cross-check + brute-force check that no random action sequence beats N.
5. Growth: random layouts later need the graph and Floyd–Warshall per layout; possible in JAX (fixed max vertex count), not blocked by this design. Per-step cost O(V^2) visibility tests per environment: fine for hundreds of environments and small maps, would need pruning for large maps.
6. Lock-in: training code built on the env's step semantics; switching dynamics later invalidates comparisons across experiments (costly, not one-way).

Reversibility: D1–D8 costly (experiments and training code build on the dynamics and the truth); D9, D10 cheap. None one-way (experiments folder, not distributed).

## Open questions
1. (answered round 3: path-following around corners is acceptable) Must the dynamics behave like physical contact everywhere (sliding along walls, also around corners), or is "move along the shortest free path toward the commanded point" acceptable as the stand-in? Decides D2 (leading) vs D1/D3; hidden requirement behind the problem's "the way contact and constraint-heavy tasks do".
3. Is a world model learning a short-range planner (D2's f) acceptable for the world-model experiments? Decides whether harm 2 counts against D2.
4. Draft approved (2026-11-18): point agent among polygon walls; T1 + D2 geodesic-step f + D5 stop-at-contact f on a U-maze; plots near corners; D2 closed form checked numerically; D5/D1 sliver size measured as lower-vs-upper-bound disagreement.

## Sources
| Claim | Source (URL or `file:line`) | Date | Reliability |
|---|---|---|---|
| Under straight or sliding steps, N ≠ ceil(d/L) behind convex corners (counter-example: path 2L bending 0.5L from start needs 3 steps) | generator H report (r1-motion-planning.md); independently generator J (bounded-link min-link hardness, r1-optimal-control.md); my own geometric check (the midpoint would have to see both ends past the corner) | 2026-11-18 | cross-checked (two independent generators + derivation) |
| Any dynamics with per-step free travel ≤ L has N ≥ ceil(d(s, goal set)/L) | generators G and J independently; follows from path length ≤ k·L | 2026-11-18 | cross-checked |
| Geodesic-step dynamics give N = ceil(d(s, goal set)/L) exactly (subpaths of shortest paths are shortest, so stepping L along the geodesic is always available) | generator J (J5, https://arxiv.org/pdf/2303.10705); my derivation: the target L along the geodesic is free and within Euclidean distance L, so a = t − s is a valid action | 2026-11-18 | cross-checked by derivation; to confirm with the draft |
| Exact geodesic distance among capsule/rounded obstacles by tangent graph (bitangents + arcs) | generators G, H, J independently; https://lavalle.pl/planning/node271.html | 2026-11-18 | cross-checked |
| extremitypathfinder and pyvisgraph are MIT | generator H (confirmed), G (confirmed), J (believed) | 2026-11-18 | cross-checked (two generators) |
| CGAL is GPL-3.0-or-later or commercial | generator H (confirmed); J (not verified) | 2026-11-18 | one source confirmed |
| No existing JAX environment provides an exact value oracle | generator G | 2026-11-18 | unverified (one source) |
| Field's standard pointmaze oracle = BFS over cells + Euclidean within a cell | generator G (OGBench follow-ups found by search, not opened) | 2026-11-18 | unverified |

## Round checklist
Checklist:
- [x] Log (first round): its path in the report; new or resumed, and what was outdated — n/a: round 2
- [x] Problem (first round): confirmed by the user (the line in *Problem*) — n/a: round 2
- [x] Scope: split, widened or unchanged — unchanged
- [x] Requirements: new or changed ones, each a need (no mechanism) with reason, source, priority and verified — R13 verified must; R14 verified should; R2 → R2b; R8a → R8c
- [x] Replaced requirements: new IDs, old rows moved; options re-checked from the old matrix column — R8a→R8c (D5 now ✓), R2→R2b (D3 ✓, D6 ✓ with point agent)
- [x] Written requirements: evidence found for each (commit, decision log) — n/a: none written
- [x] Deciding unverified requirements: asked this round, or assumptions after "can't answer" — none unverified; open hidden question: dynamics physicality (Q1)
- [x] Options: added, by the categories of Phase 3 — none new this round (D1m, D11, A4 added after round-1 checks)
- [x] Searches: recorded in the round's entry; or "no web search", said in the report — no web search this round (draft only)
- [x] Deciding claims: cross-checked against a second source, or marked unverified — D2 closed form now also checked numerically
- [x] Matrix: updated
- [x] Rejection records: one per trailing or not applicable option (scenario, best variant, leader's cells compared)
- [x] Harms: scenarios for the leading option
- [x] Reversibility: every option rated; one-way means extra stress-testing, said in the report
- [x] Draft and stress test: of the leading option; the draft's path in the report
- [x] Bias check: findings in the log and the report; or "not independent"
- [x] Rejection check: findings in the log and the report; verdicts corrected
- [x] Ranking change: recorded
- [x] Report: what changed, recommendation, runner-up, must rejections, the checks' findings
- [x] Questions: deciding unverified ones first, ordered by ranking impact, through the question tool, remarks last — Q1 dynamics, R8c tolerance, cut-locus rule
- [x] Pushback: if the user picked a worse option, asked what makes it better — n/a

## Rounds
- Round 3 (2026-11-18, closing): user accepted D2's corner wrap-around and its cut-locus jump (obstacle-caused under R13), kept R8c exact; no new requirements, no ranking change → stop condition met; Decision drafted.
- Round 2 (2026-11-18): draft confirms D2's closed form (3710/3710) and shows the straight/sliding undecided set is half the maze (51 %, also with the strongest path-following bound); D1m, D3 not applicable; D12 (polygonal actions) new runner-up; D2 leading; open: corner wrap-around, R8c tolerance, cut-locus rule.
- Round 1 (2026-11-18): three generators (G RL environments, H motion planning, J optimal control); after the checks no option leads on verified requirements alone: D4 (lattice) leads on coulds, D2 (geodesic step) if R13 holds, D1m (sliding, masked slivers) if physical sliding is required; D7, D8, D9, D10 not applicable on R8a/R10/R11.

## Decision
Reviewed (2026-11-18, user: "The review is complete")

**Choice: D2, geodesic-step dynamics with an exact geodesic oracle (T1), point agent among polygon walls.**
- State: 2D position of a point agent (drawn as a circle); walls: grid cells of a fixed ASCII map as polygons (no pinch points: wall cells touching only diagonally are not allowed).
- Action: a ∈ unit disk; target t = Proj_free(s + L·a); the agent moves up to L along the shortest free path from s to t. Ties between equally short paths (cut locus) are broken by a fixed, documented rule (lowest node index).
- Goal: an exact point g in free space (R15); observation contains s and g; the step function always returns reward 0 (R7b); no termination on success, rollouts end only at the fixed time limit T (R16); auto-reset for batched rollouts. A step whose target is within reach lands exactly on it (position snapped to the target on arrival, so float rounding cannot miss the goal).
- Truth (task definition, not returned by step): success = f(s, a) == g; reward 1 on success, absorbing; d(s, g) exact geodesic distance (R8b); N(s) = ceil(d(s, g)/L); V* = γ^(N−1), Q*(s, a, g) = γ^N(f(s, a)) with N(g) = 0 (R8c); plus γ^(d/L) as an optional continuous channel.

**Why** (each on a requirement the user confirmed, 2026-11-18):
1. It is the only design whose exact Q* (staircase included) is a closed form for every state and action (R8c, must): verified on 3710/3710 random starts in the draft, and true by construction (every step travels a free path of length ≤ L, and stepping L along the geodesic is always available).
2. All functions are discontinuous only where walls or the step count put the jumps (R13, must); the user accepted the cut-locus jump as wall-caused.
3. Movement per step stays within a circle of radius L (R14, should), so value level sets and reachable sets are not axis-aligned.
4. One geometry routine (T1) gives the dynamics, the path-length truth (R8b, must) and the step-count truth; batched in JAX (R1, R10, R11, musts).
5. The user accepted that steps aimed just behind a corner wrap around it instead of stopping (round 3).

**Rejected:**
- D1 (user's original: natural sliding + certified truth): exact step counts need a search on about half the maze (51 % of starts in the draft's U-maze, even with the strongest path-following bound) → R8c (must, exact; user kept "exact" in round 3).
- D1m (D1 with masked slivers): the masked region is half the maze → R8c.
- D3 (rectilinear tile world): x-then-y axis order is an artefact (R13, must) and box actions are axis-aligned (R14).
- D4 (lattice MDP): lattice discontinuities everywhere (R13, must).
- D5 (straight moves, exact reachable sets): needs CGAL (GPL, R12 ~) or an unproven conjecture, no sliding, hard code; D2 meets the same musts.
- D6 (link-distance world): unbounded steps (R14).
- D7 (physics engines Jax2D/MJX/CAMAR): no exact Q*, solver artefacts, 4D state (R8c, R13, R2b).
- D8 (reuse QDax PointMaze / field oracle): approximate oracle near walls (R8c).
- D9 (no environment): no online training, no dynamics (R10, R11).
- D10 (discount by path length): no step-count staircase (R8c); kept as an extra truth channel.
- D12 (polygonal action set, polygon reachable sets): only needed if stopping at corners were required; untested, n-gon not a disk (R14), harder code.

**Changes from the review (2026-11-18):** rollouts end only at the fixed time limit (R16; a rollout essentially never lands exactly on a continuous goal); goal is an exact point (R15) instead of a wall-free disk; the step function always returns 0 reward and the task reward exists only in the truth definitions (R7b replaces R7). Both keep the choice (every design could do the same; no ranking change) and simplify D2: N = ceil(d(s, g)/L), no goal-placement rule. Claim checked: with a point goal the closed form holds with r_goal = 0, provided a step lands exactly on its target when the path to it is ≤ L (spec item, to be tested in plan step 2).

**Reported as a bug by the user (2026-11-20, see [gcrl-real-world-problem-statement.md](gcrl-real-world-problem-statement.md)):** the agent can never reach the goal exactly and must not be graded on an exact match. Affected here: R15 (exact point goal with success = equality), the step that snaps onto its target, the success predicate, the task reward and N, V*, Q* built on it. Changed on 2026-11-20 at the user's request ("Update the maze environment to match the problem statement", `PROBLEM_STATEMENT.md` in the experiments project), without a new research round:
- `env`: state and observation are the position only (no goal); `step` returns (observation, state, was_reset) with no reward, done or info; the snap onto the target is removed; the reset every `max_steps` steps stays, as the environment's own reset, announced by the flag.
- `truth` is removed (success, N, V*, Q*, gamma ** (d / L), task reward). `evaluation` replaces it: rollouts of a policy (position, goal) -> action without resets, cost = geodesic distance, regret against the optimal policy averaged over the steps of the run.
- This overrides R7b (as far as it speaks of a task reward in the truth), R8c, R15 and R16's "time limit" wording of this log, and the Decision's "Truth" item; R8b (exact geodesic distance) stays and is now the cost. 62 tests pass.
- Claude's choices, not checked with the user: policies are stateless functions of (position, goal); start and goal for evaluation are uniform over the free space.

**Known gaps:**
- Evidence is one layout (U-maze); thin walls, concave corners and several corners in sequence are untested; the draft used a goal disk (r = 0.2), the point goal (R15) relies on exact landing on the target, untested → the first implementation step carries these as tests (A1 ladder + extremitypathfinder cross-check).
- Transfer: near corners the dynamics are path-following, not contact; conclusions about critics may transfer less to physical contact tasks (accepted by the user).
- World models face a short-range planner inside f near corners.
- Step cost grows with the number of graph nodes (O(V^2) visibility tests per query); fine for small fixed maps.

**Open child decisions:**
- ~~Interface style for R12~~ resolved at implementation (2026-11-18): gymnax-style functional API (pure `reset`/`step` on NamedTuple state and params, auto-reset, `info["final_observation"]`), no gymnax dependency; chosen by Claude as the JAX-native default, open to the user's override.
- Scoring method that tells staircase edges apart from wall edges (uses the R8b channel); decide with the first critic experiment.
- Optional add-ons: A2 discontinuity-catalogue layout, A3 action-space edge maps, A4 OGBench layouts.

**Where it is documented:** the module docstrings of the environment package (user, 2026-11-18); this log stays the full record.

**Plan (one commit-sized step at a time, as a separate package in the experiments project's uv workspace — user, 2026-11-18):**
1. Geometry and exact geodesic distance: ASCII map → wall polygons, convex-corner graph with next-hop table, batched `visible`, `geodesic`; tests: manufactured layouts (empty room, thin wall, doorway, U-trap, two rooms), cross-check against extremitypathfinder on random pairs.
2. Dynamics and environment: `project_free`, geodesic-step `f` (snaps to the target on arrival), reset/step with auto-reset, reward always 0; tests: displacement ≤ L, next states free, lower-bound property, determinism and tie rule, batched equals unbatched, exact landing on a reachable goal, step reward is 0 everywhere.
3. Ground truth: success predicate, task reward, N, V*, Q* and the d channel; tests: greedy policy lands exactly on the goal in exactly N steps on every manufactured layout; plotting helpers.
Status (2026-11-18): steps 1–3 implemented in `packages/gcrl-maze` (modules `geometry`, `env`, `truth`, `plotting`); 56 tests pass. Known gaps now tested: thin walls, concave corners, corners in sequence (rooms, spiral layouts), exact landing on a point goal (optimal policy lands in exactly N steps, also in float32 on 4 layouts × 1000 pairs). Tolerance: "exactly on g" means within `maze.tol` (64 ulp × map size). Throughput: 4.3 M steps/s (4096 envs, float32, RTX 2070 Super).
4. Once the first step is in use: ask the user what using it showed, then amend *Decision* or reopen a round.

Decision checklist:
- [x] Stop condition: no new requirements, no ranking change, nothing deciding left unverified
- [x] Why and Rejected: each on a requirement the user confirmed; confirmed by the user (2026-11-18: "The why and rejected are correct")
- [x] Known gaps and open child decisions: listed in *Decision*
- [x] Documentation: updated where the rule takes effect; overstated requirements corrected; commit message proposed — location: package module docstrings (user, 2026-11-18), written with plan steps 1–3
- [x] Out of scope: noted where open work is kept — TODO.md in the notes folder
- [x] Overview: choice, pros and cons, rejected, gaps, plan, files
- [x] Review: in open chat; nothing implemented before it — user, 2026-11-18: "The review is complete"

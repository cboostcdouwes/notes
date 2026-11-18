# Round 1, generator G: RL environments and GCRL benchmarks (JAX-native)

## Reformulations
- Field's own name: a JAX-native goal-conditioned PointMaze / Maze2D with an oracle value function ("ground-truth temporal distance", "shortest-path oracle"; SoRB defines V(s,g) = -shortest-path distance; OGBench follow-ups use pointmaze temporal distance as graph geodesic).
- Far fields in the lens: multi-agent robot routing (CAMAR, MPE: continuous MAPF with circles among obstacles); quality-diversity (QDax: deceptive / hard-exploration maze); UED / procedural levels (JaxUED, Kinetix: a "level" of wall polygons); HJ reachability (minimum-time value function / backward reachable tube — exactly R8a); tabular RL (exact value iteration on a finite MDP).
- Wider: a value-estimation testbed with analytically known optimal Q for any dynamics with state constraints ("critic-evaluation benchmark" rather than an environment).
- Narrower: an exact distance and step-count oracle for one fixed maze, paired with any existing JAX maze env.
- Inverted: choose dynamics where truth is trivial (lattice MDP, closed-form geometry), or accept a planner/Monte-Carlo reference (RRT*, long rollouts).
- Cross-cutting: deterministic dynamics give Q*(s,a,g) = r(s,a,g) + γ·V*(f(s,a),g), so R8a reduces to an exact f (R11) plus an exact step-count V*; the hard part is the step-count V* under sliding contact; ceil(d_geo/v) is only a lower bound when paths bend at corners.

## Worked-out options
G1. Reuse QDax PointMaze — pure-JAX point maze, Brax env interface, >1.5M steps/s (https://arxiv.org/pdf/2211.13742, https://qdax.readthedocs.io; MIT, InstaDeep/Imperial). Cost: one fixed deceptive QD layout; wall behaviour unverified; point agent; needs goal conditioning, sparse reward and the whole oracle.
G2. CAMAR in single-agent mode — JAX continuous routing; circles for agents and obstacles (walls as circle clusters), smooth force contact, holonomic or diff-drive; string_grid ASCII / MovingAI / labmaze maps; up to 562k steps/s; ego-centric goal + radius (https://arxiv.org/html/2508.12845v2, https://github.com/AIRI-Institute/CAMAR; license unconfirmed). Cost: soft contact smooths the discontinuities (R3); scalloped circle walls make exact geodesics a tangent graph over thousands of circles; RRT* references, no exact oracle; multi-agent API.
G3. Rigid-body circle in a fixed polygon maze on Jax2D (Kinetix engine) — Box2D-style JAX physics, fixated polygon walls, vmappable scenes (https://github.com/MichaelTMatthews/Jax2D MIT; https://arxiv.org/abs/2410.23208). Cost: iterative impulse solver with restitution/friction makes f hard to state exactly; exact Q* would require reverse-engineering the solver; closest stand-in for real contact, furthest from R8a.
G4. Hand-written pure-JAX circle maze with an analytic tangent-graph geodesic oracle (~150 lines) — state 2D position, action = displacement clipped to norm v, circle-vs-segment collision resolved by projecting out the normal component (R6), i.e. a point against walls inflated by r with rounded corners. R8b exact: shortest paths are bitangent segments plus radius-r arcs around convex corners; Floyd–Warshall over fixed tangent points once per layout; query = min over direct (if visible) and corner-routed paths, vmapped. Interface gymnax-style, Jumanji Environment or Gymnasium FuncEnv + FunctionalJaxEnv (R12). Sources: https://www.osti.gov/biblio/6997654, extremitypathfinder (MIT) https://extremitypathfinder.readthedocs.io/ as CPU reference, https://gymnasium.farama.org/api/functional/. Cost: arc-tangent geometry is the hardest code for R9; R8a staircase under sliding still needs G5 or G6.
G5. Lattice-backed finite MDP with exact tabular Q* — continuous actions but f's outcome quantized to a fine lattice (e.g. 1/64 cell), collision on lattice points; finite deterministic MDP; exact V* step counts by BFS/value iteration on GPU; Q* exact for the lattice env; geodesic by lattice Dijkstra (exact only for the lattice metric). Sources: MDPax https://www.theoj.org/joss-papers/joss.08897/10.21105.joss.08897.pdf, jaxdp https://github.com/TolgaOk/jaxdp, SoRB https://arxiv.org/abs/1906.05253. Cost: |S|^2 memory for all goals (per-goal or goal subsets); state no longer truly continuous; simplest truth code.
G6. Exact backward-reachable-set staircase — for a goal, compute k-step backward reachable sets B_k exactly with polygon/arc arithmetic offline; V* = -min{k : s in B_k}; batched point-in-region tests in JAX. Sources: https://arxiv.org/pdf/2011.02082, hj_reachability (MIT) https://github.com/StanfordASL/hj_reachability as approximate cross-check. Cost: with sliding contact the predecessor operator is not a plain dilation (research-grade geometry); per goal; exact edges.
G7. Tiny MJX/Brax point-mass maze in the JaxGCRL / MuJoCo Playground mould — MuJoCo XML ball with planar slide joints and wall boxes (as Gymnasium-Robotics PointMaze), Brax PipelineEnv subclass so JaxGCRL CRL/SAC/HER code applies (https://michalbortkiewicz.github.io/JaxGCRL/environments, https://arxiv.org/html/2408.11052v3, https://robotics.farama.org/envs/maze/point_maze/, MuJoCo Playground Apache-2.0 https://arxiv.org/html/2502.08844v1). Cost: soft contact and solver tuning blur discontinuities; second-order state (position + velocity, not 2D, R2); no exact oracle; strongest for R12 and comparability.
G8. Port the standard benchmark layouts and their oracle protocol — OGBench / D4RL pointmaze layouts as ASCII in JAX, oracle = BFS over cells + Euclidean within a cell (https://arxiv.org/pdf/2410.20092, https://minari.farama.org/datasets/D4RL/pointmaze; follow-ups https://arxiv.org/pdf/2609.39901, https://arxiv.org/pdf/2609.38383 found by search, not opened). Cost: cell-level oracle approximate near walls/corners; only a "standard" layer with G4/G5 for exactness.

## Other titles
- JaxMARL MPE with one agent and landmark obstacles (https://arxiv.org/html/2311.10090v5)
- gymnax PointRobot-misc (BOReL point robot, no walls) extended with walls
- Jumanji Maze (Apache-2.0, boolean wall grid) lifted to continuous control
- NAVIX or XLand-MiniGrid (Apache-2.0) with continuous actions mapped onto grid moves
- JaxUED maze level format reused for a continuous agent
- Gymnasium FuncEnv as single source of truth, auto-wrapped for gymnax/Jumanji consumers (gxm, envrax)
- Square axis-aligned agent in a rectilinear maze so C-space stays polygonal and the geodesic is a pure visibility graph
- Stop-at-contact dynamics without sliding, to simplify the predecessor operator
- Teleport-on-free-endpoint dynamics: move only if the swept segment is free, otherwise stay
- Signed-distance-field walls: collision and normal from an analytic SDF, branch-free in JAX
- Fast-marching / eikonal geodesic on a fine grid (scikit-fmm) as approximate cross-check
- RRT* or Monte-Carlo rollout reference values instead of exact truth
- Discretized-action twin so max-over-actions overestimation can be computed exactly
- Physics-informed GCRL contact-discontinuity papers as test-case sources (https://arxiv.org/pdf/2605.30503, https://arxiv.org/pdf/2509.06782)
- Unit-test-backed oracle: NumPy extremitypathfinder reference vs JAX geodesic on random pairs

## Notes
Licenses confirmed: MIT (Jax2D, hj_reachability, extremitypathfinder); Apache-2.0 (MuJoCo Playground, XLand-MiniGrid, NAVIX weaker evidence). Unconfirmed: CAMAR code, QDax PointMaze internals, gymnax. No existing JAX env found provides an exact value oracle.

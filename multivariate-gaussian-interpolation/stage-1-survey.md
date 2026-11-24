# Survey before stage 1's first race

The reading `PLAN.md` asks for in *Keeping knowledge*: "a survey before the first race of stage 1. Each source is kept
with how it was checked." Made on 2026-11-24 by four reading agents in parallel, one per group of `APPROACH.md`'s
stage 1 questions. Sources already in `long-term-plan.md`, *Sources*, are not repeated unless a check changed their
label.

*Checked* is the reading agent's own label, not checked again by me: **read** = it read the named part of the paper;
**abstract** = the abstract or publisher page only. A source it could not fetch was dropped. Numbers are given only
where it read them.

## 1. No resets, and which experience to keep (questions 2 and 4; the explorer)

| Claim | Source | Checked | Bearing |
|---|---|---|---|
| A long-term store kept beside a small first-in-first-out (FIFO) buffer: reservoir sampling keeps most when training is spread evenly; keeping coverage (evict the entry with most neighbours within a distance) keeps more of a task trained 12.5 times less. A FIFO of 1,000 entries forgot earlier tasks. | Isele, Cosgun 2018, *Selective Experience Replay for Lifelong Learning*, https://arxiv.org/abs/1802.10269 | read, §3.2–3.3, §5.2–5.4 (was *abstract*) | Ours is the uneven case (time spent where the agent is, reaching scored everywhere): coverage eviction plus a small recent buffer |
| Local forgetting: when a new sample's neighbourhood already holds N samples, the oldest one there is deleted. Keeps a world model right over the whole state space; a FIFO ends up concentrated where the agent recently was (MountainCar, Fig. 4). | Rahimi-Kalahroudi et al. 2023, *Replay Buffer with Local Forgetting*, https://arxiv.org/abs/2303.08690 | read, §4–6, Fig. 3–4 | First to try: the maze cell as the neighbourhood, at most N per cell, oldest in the cell evicted; cheap per step, and suits the step model |
| A FIFO of the last 50 episodes did much worse than keeping all 4 × 10^5 samples on a pendulum swing-up: as exploration narrowed the buffer lost coverage and the policy forgot one swing direction. Reservoir retention suffers most from a buffer that is too small. Rule of thumb: a buffer of about 90 % of the steps to final performance. | de Bruin, Kober, Tuyls, Babuška 2018, *Experience Selection in Deep RL for Control*, JMLR 19, https://jmlr.org/papers/v19/17-131.html | read, §6.1–6.2, §7.1, §9 | Avoid a plain FIFO of 50,000 without resets; plain reservoir also risky at that size |
| Keeping the training distribution between the policy's own and uniform reduces the need for sustained exploration; beats TD-error sampling with small buffers. | de Bruin et al. 2016, *Improved deep RL for robotics through distribution-based experience retention*, https://repository.tudelft.nl/record/uuid:1f7633c7-d884-4947-8aef-0538a6cf8f74 | abstract | A variant: a uniform-over-cells store mixed with a recent one |
| Greedy mapping (walk the shortest path to the closest unvisited place) needs at most \|V\| + 2\|V\| ln \|V\| moves; on random grids and mazes of width 51 its travel grew about linearly in \|V\| and was "not much larger" than \|V\|. | Tovey, Koenig 2003, *Improved Analysis of Greedy Mapping*, https://idm-lab.org/bib/abstracts/Koen03d.html | read, §4–6, Fig. 1, 3 | The closest published match to the explorer of `PLAN.md`; a yardstick for its numbers |
| Greedy mapping first described: move to the closest place not yet visited. | Koenig, Tovey, Halliburton 2001, *Greedy Mapping of Terrain*, https://idm-lab.org/bib/abstracts/Koen01i.html | abstract (full text refused) | The citation for the explorer |
| Closest frontier by path length against a random frontier and a decision-theoretic choice, distance to full coverage: hospital 281 m against 669 m and 313 m; two more maps alike. | Holz, Basilico, Amigoni, Behnke 2010, *Evaluating the Efficiency of Frontier-based Exploration Strategies*, https://www.ais.uni-bonn.de/~holz/papers/holz_2010_isr.pdf | read, §2–4, Tables 1–3 | The nearest-first rule is the strong one; a random frontier costs 1.4 to 2.4 times the path |
| Frontier-based exploration: drive to the border between known free space and unknown space. | Yamauchi 1997, *A Frontier-Based Approach for Autonomous Exploration*, CIRA, doi:10.1109/CIRA.1997.613851 | abstract (metadata only; definition as Holz 2010 quotes it) | The citation for frontier exploration |
| Being stuck detected without supervision: recent windows of the trajectory whose spread of states is below a threshold are counted, and the agent acts when the count is reached. Learning without resets suffers from too little variety of states. | Zhang, Weihs 2023, *When Learning Is Out of Reach, Reset*, https://arxiv.org/abs/2303.17600 | read, §1, §4.1–4.2, §5.5, Table 1 | A learner's own sign of being stuck at a wall or corner; it could hand over to a goal instead of a reset |
| Without resets, targets must bootstrap through time-outs and goal switches, not treat them as ends; leaving that out gives a significant drop. Goals are switched early when a learned critic says they are mastered. | Patil, Rajendran, Berseth, Chandar 2024, *Intelligent Switching for Reset-Free RL* (RISC), https://arxiv.org/abs/2405.01684 | read, §4.1–4.2, §5.1, §5.3, Table 5 | Check that our time-to-goal never treats a trajectory cut (every 50 steps) as an end |
| Goals for practice near the start chosen by a value threshold over stored states. Episodic RL with a horizon of 200,000 and no resets degraded markedly. | Sharma et al. 2021, *Autonomous RL via Subgoal Curricula* (VaPRL), https://arxiv.org/abs/2107.12931 | read, §3, §4.1–4.2, §5.1 | Its goals come from the buffer, so a buffer of recent places narrows them too |
| Without demonstrations, forward and backward goals by optimal transport over stored states, at most one per trajectory; beats VaPRL and MEDAL. Its buffer held 10^6, so nothing was evicted. | Kim, Cho, Kim 2023, *Demonstration-free Autonomous RL via Implicit and Bidirectional Curriculum* (IBC), https://arxiv.org/abs/2305.09943 | read, §1, §3–5, Table 2 | The reset-free successes kept their whole history |
| SAC and MBPO updated without resets after pretraining failed catastrophically; planning with a learned model and only model updates stayed stable; value updates destabilised it. | Lu, Grover, Abbeel, Mordatch 2021, *Reset-Free Lifelong Learning with Skill-Space Planning* (LiSP), https://arxiv.org/abs/2012.03548 | read, §1, §4.1–4.2 | Watch the policy and time-to-goal drift over one long stream |
| Matching the state distribution of a few demonstrations; 40 % gain on the hardest EARL task. | Sharma, Ahmad, Finn 2022, *A State-Distribution Matching Approach to Non-Episodic RL* (MEDAL), https://arxiv.org/abs/2205.05212 | abstract | Needs demonstrations; not for us |
| More randomness in the environment eases learning without episodes. | Co-Reyes et al. 2020, *Ecological Reinforcement Learning*, https://arxiv.org/abs/2006.12478 | abstract | Low priority |

What it means:

- Which experience is kept is likely the stronger lever. All three replay papers agree that a FIFO under a narrowing
  visit distribution loses coverage and forgets far regions, and the reset-free successes kept their whole history.
  This argues for raising `APPROACH.md`'s question 4 (now after the first gate measurement).
- Cheapest test: the no-reset agent with the present store and with a store capped per cell; log the share of
  reachable cells present in the store over time, and score the time-to-goal against the true distances.
- The known failures without resets: sinks at walls and corners, narrowing coverage, drift of the learned values.
  The windowed sign of being stuck is a candidate for the learner's own signs of working.
- Not found: coverage over time in a single-stream continuous maze from the first step; a comparison of retention
  rules inside a reset-free goal-conditioned agent; quasimetric work without resets. Unchecked leads: single-life RL
  (https://arxiv.org/abs/2210.08863), CLEAR, a coverage study on FourRooms (https://arxiv.org/abs/2507.19725), a
  continual-RL survey (https://arxiv.org/abs/2506.21872).

## 2. The three forms and the three scores (question 2; the noise variants)

The reading agent read the named sections itself; a smaller model drew the numbers out of those pages, and only
LPM's Table 2 was fetched again and compared word for word. *Figure only*: the paper gives no number in its text.

| Claim | Source | Checked | Bearing |
|---|---|---|---|
| In a continuous 2-D maze, cells visited over 10 seeds: only going to a goal (LGE, Go-Explore) clearly beats random; ICM barely; Skew-Fit and DIAYN not significantly. Leaving out the exploration after the goal hurts significantly. Goals are the reached states of lowest density (nearest neighbours in a latent space); after the goal it moves at random, repeating its last action with probability 0.9. Figure only. | Gallouédec, Dellandréa 2023, *Cell-Free Latent Go-Explore*, ICML, https://arxiv.org/abs/2208.14928 | read, §3, §4.4–4.5 | The closest published version of our race, in our kind of maze: goal, then curiosity beats goals only, and curiosity only (one step ahead) is near random. Its phase after the goal is random, not on a score, and there is no noise |
| After a goal chosen by counts is reached, 50 steps of random actions: the spread of visited states is higher throughout, and goal reaching better (PointUMaze, FetchReach, MiniGrid). The gain is missing early (few goals reached) and late (all covered). Figure only. | Yang, Moerland, Preuss, Plaat 2022, *First Go, then Post-Explore*, https://arxiv.org/abs/2212.03251 | read, §4.2, §5.2, App. A | A second check of goal, then curiosity against goals only, with our stretch of 50 steps; the gap is largest midway and behind bottlenecks |
| Goals drawn in proportion to the spread of an ensemble of 3 goal-conditioned Q-functions, the candidates drawn uniformly from the goal space (not from reached goals); better than HER, RIAC, ALP-GMM and GoalGAN on most of 18 tasks, 5 seeds. 10 members did no better than 3. No noise test. Figure only. | Zhang, Abbeel, Pinto 2020, *Automatic Curriculum Learning through Value Disagreement*, NeurIPS, https://arxiv.org/abs/2006.09641 | read, §3–4, App. E–G (was *recalled* in `long-term-plan.md`) | Goals only, at the edge of what can be reached; needs a known goal space. An ensemble of time-to-goals would give the same signal |
| MAX: the score is the Jensen-Shannon divergence between the ensemble's Gaussian next-state predictions, so noise shows as confusion of all models, not as conflict. Plans only in the learned model. On a chain of 50: all transitions in about 15 episodes, against about 40 % in 60 for the baselines (Fig. 1b). A random trap slowed it; with state noise the prediction-error baseline did poorly. | Shyam, Jaśkowski, Gomez 2019, *Model-Based Active Exploration*, https://arxiv.org/abs/1810.12162 | read, §2, §3.1–3.2, App. C.1 | Curiosity only through the model, with disagreement. If the step model predicts a variance, the divergence separates step noise from newness where the plain variance does not |
| Disagreement as the variance of 5 bootstrapped step models: on noisy MNIST it falls to about zero on random states while prediction error stays high; in a 3-D maze equal to prediction-error curiosity without a television and better with one. Figure only. | Pathak, Gandhi, Gupta 2019, *Self-Supervised Exploration via Disagreement*, https://arxiv.org/abs/1906.04161 | read, §2.1, §4.2 | Score 2 should survive the television and the noise coordinate; the evidence has no numbers |
| Few-shot averages: Plan2Explore 643.73, curiosity 537.95, one-step disagreement 258.78, MAX 210.46, random 155.23. "The one-step planning agent is not able to plan to visit states that are more than one step away from the replay buffer." | Sekar et al. 2020, *Planning to Explore via Self-Supervised World Models*, https://arxiv.org/abs/2005.05960 | read, §3, §5.4, Tables 1–2 | Our acting on the score looks one step ahead, the weak variant: expect curiosity only to circle local maxima of the score |
| Learning progress as the predicted error of the previous model minus the present error. Mountain Car coverage, deterministic to a noisy action (Table 2): learning progress 76.50 to 67.04 (−12 %), ensemble disagreement 91.22 to 61.02 (−33 %), RND 45.50 to 28.00. In MiniWorld with a noisy wall every baseline degrades significantly. | Hou, An, Du 2025, *Beyond Noisy-TVs: Noise-Robust Exploration via Learning Progress Monitoring*, ICLR 2026, https://arxiv.org/abs/2509.25438 | read, §3, §5.1–5.3, Table 2 (numbers compared word for word) | The only direct comparison of learning progress and disagreement under noise: disagreement leads without noise, learning progress loses least with it. A recipe for score 3 |
| The bonus is the least learned temporal distance (a quasimetric, contrastive) to earlier states of the episode. MiniGrid with noise on the states: count-based NovelD fails completely, E3B and DEIR stay reasonable, this one is best. The minimum beat 10 nearest neighbours. Episodic only; assumes every state can be returned to. Figure only. | Jiang et al. 2025, *Episodic Novelty Through Temporal Distance*, ICLR, https://arxiv.org/abs/2501.15418 | read, §3–4, §5.2–5.3, App. A | Score 1 measured with our time-to-goal is this robust version; counts on raw coordinates fail. Our maze has no episodes, so it needs a lifelong form; the one-way door breaks its assumption |
| NGU: an episodic pseudo-count from 10 nearest neighbours on an inverse-dynamics embedding, emptied every episode, times a lifelong RND factor. In a maze whose wall colours change every step the learned embedding keeps finding new positions; random projections and RND do not. Figure only. | Badia et al. 2020, *Never Give Up*, https://arxiv.org/abs/2002.06038 | read, §2, §4.1, Table 6 | Score 1 survives distractors only on an embedding that drops what the agent does not control |
| E3B: an elliptical episodic bonus, in the tabular case 1/N. When every state is unique the count is always 1; a time counter in the observation made NovelD fail. Lifetime variants were significantly worse. | Henaff et al. 2022, *Exploration via Elliptical Episodic Bonuses*, https://arxiv.org/abs/2210.05805 | read, §3–4, §5.1.2–5.1.3 | The noise coordinate makes raw counts degenerate. Its lifetime result is from changing environments, unlike our single maze |
| APT: a nearest-neighbour entropy reward in a contrastive representation. Atari, 26 games at 100,000 steps, median human-normalised: 47.50; 20.80 with random neighbours; 33.24 with a fixed random encoder. | Liu, Abbeel 2021, *Behavior From the Void*, https://arxiv.org/abs/2103.04551 | read, §3, Tables 2, 4 | For score 1 both the neighbours and the representation matter |
| Skew-Fit: goals are visited states reweighted by their density to a negative power; converges to uniform over valid states under idealised assumptions. In 2-D four rooms with an ideal goal reacher it covers nearly uniformly. | Pong et al. 2019, *Skew-Fit*, https://arxiv.org/abs/1903.03698 | read, §3, §6, App. B | The theory of goals only with a density score; with a learned reacher LGE found it no better than random |
| A 2-D tool world with 10 distractors that move by themselves, median % of cells reached: random motor parameters 0, random goals 11, random modular goals 36, learning-progress modular goals 61. Distractors hurt a random choice of module, not the learning-progress one. | Forestier, Portelas, Mollard, Oudeyer 2017, *Intrinsically Motivated Goal Exploration Processes*, https://arxiv.org/abs/1708.02190 | read, §3–4, Table 1, Fig. 20 | Learning progress over regions of goals ignores things that move by themselves |
| Modules chosen by absolute learning progress over windows of 300 rollouts; the gain over a random choice grows with 4 and 7 impossible distractor modules; after a sensor fault it recovers about 45 % faster. | Colas et al. 2019, *CURIOUS*, https://arxiv.org/abs/1810.06284 | read, §2.2, §4.3–4.4 | Learning progress needs a measure of success and coarse regions, and reacts slowly |
| Minecraft, items found of 107 (one run each): uniform 17; with a dynamic bonus about 70; learning progress on gains only 79, in cycles of forgetting; on gains and drops 82. A short window follows noise, a long one lags. | Kanitscheider et al. 2021, *Multi-task curriculum learning in a complex, visual, hard-exploration domain: Minecraft*, https://arxiv.org/abs/2106.14876 | read, §2–3, App. A | Learning progress must count drops too, to return to what was forgotten: the *Repeating* game |

Fetched, abstract only, not in the table: Bellemare et al. 2016 (pseudo-counts), Proto-RL (2021), GoalGAN (2018),
DISCERN (2018), Hazan et al. 2019 (maximum entropy). OMEGA is in the MEGA paper already listed (§3.1, read).

What it means:

- The forms: two ablations in continuous mazes (LGE; Yang et al.) and PEG already favour goal, then curiosity over
  goals only, and curiosity only, one step ahead, was near random in LGE's maze. For the maze without noise this
  part of the race is largely answered by the literature; open is whether a phase after the goal driven by a score
  beats a random one. That is a smaller race than `APPROACH.md`'s three forms by three scores.
- Without noise, density (score 1) and disagreement (score 2) should lead: disagreement had the best coverage in LPM.
- The noise coordinate: counts and nearest neighbours on raw coordinates collapse, since every state is new. They
  hold when distance is measured in a space the agent controls or in temporal distance (NGU, ETD), which is what our
  time-to-goal gives.
- A random step and the television: disagreement degrades (−33 % in LPM) without collapsing, the divergence form of
  MAX separates noise; learning progress loses least (−12 %) and ignores things that move by themselves, at the
  cost of lag, window noise, and forgetting unless drops count too.
- Not found: a race of all three forms with one score, under noise or not; any noise test in a continuous 2-D maze
  without resets; one-way doors; a lifelong (not episodic) temporal-distance score; learning progress per place
  outside LPM. A 2026 preprint argues that learning progress from prediction error mistakes noise for learnable
  structure (Blad, Längkvist, Loutfi, https://arxiv.org/abs/2605.05856, abstract only).

## 3. A memory of visited places with planning, and imagined steps (questions 3 and 6)

Operation counts marked *est.* are the reading agent's own arithmetic, assuming a time-to-goal of about 10^5
parameters.

| Claim | Source | Checked | Bearing |
|---|---|---|---|
| A graph over stored states, edges where the learned distance is below a maximum, searched for waypoints. Its 2-D environment is ours: the position, an action in [−1, 1]² added to it, walls by projection. 1,000 stored states; ten times fewer gave no visible drop. Sensitive to the maximum edge length. Without distributional values it did worse than random; ensembles added 10 to 20 % for goals 10 steps or more away. Cost: \|B\|² distance calls and a Floyd-Warshall now and then, \|B\| calls per action. | Eysenbach, Salakhutdinov, Levine 2019, *Search on the Replay Buffer* (SoRB), https://arxiv.org/abs/1906.05253 | read, §2.3–5, App. A–D, Table 1 (was *recalled* in `long-term-plan.md`) | Buys reach to far goals with a fixed policy, not fewer steps of experience |
| Nodes merged by two-way consistency and only nearest-neighbour edges kept, so wrong edges grow linearly, not quadratically; an edge the agent fails to cross is deleted online. Point environment with thin walls: SoRB 28 %, with this 100 %. Time per action 0.550 s against 0.077 s. | Emmons et al. 2020, *Sparse Graphical Memory for Robust Planning*, https://arxiv.org/abs/2003.06417 | read, §4, Table 1, App. E Table 4 | The online clean-up fits one stream without resets |
| Landmarks by farthest-point sampling, edges where the local distance is below a threshold, shortest paths between all pairs; also used in training, where the landmarks at the edge of what was visited help exploration. Large AntMaze: 0.3 success at a million steps against HIRO 0.0 at two million. | Huang, Liu, Su 2019, *Mapping State Space using Landmarks for Universal Goal Reaching*, https://arxiv.org/abs/1908.05451 | read, Alg. 1, §6.2, Table 1 | Farthest-point sampling by our time-to-goal |
| Learned landmarks: 50 where the method above used 400 and SoRB tens of thousands. Two failures named: waypoints switching in loops through wormholes (edges too short), and proposing again a waypoint that already failed. | Zhang, Yang, Stadie 2021, *World Model as a Graph* (L3P), https://arxiv.org/abs/2011.12491 | read, §5.2, Fig. 6 | Few nodes may do; keep a waypoint for about its distance in steps |
| A landmark graph with planning to a frontier landmark, then exploring from there. ViZDoom, hard goals: 67 % against SGM 26 %, in 2 million steps. Discrete actions. | Hoang et al. 2021, *Successor Feature Landmarks*, https://arxiv.org/abs/2111.09858 | read, §5, Tables 1–2 | A curiosity rule: go to the least visited landmark |
| Graph search only in training, to choose waypoints for collecting; acting needs no search. 2-D mazes: learns faster; on an 11 × 11 maze the only method that progresses. Searching at test time as well gained nothing. | Zhang, Eysenbach et al. 2021, *C-Planning*, https://arxiv.org/abs/2110.12080 | read, §1, §5.1, Fig. 7 | Moves the cost of planning into training |
| The policy conditioned on waypoints is distilled into the goal-conditioned policy. Large U-AntMaze at a million steps: 57 % against 19 % for the landmark method above; works without a planner at test time. | Kim et al. 2023, *Imitating Graph-Based Planning* (PIG), https://arxiv.org/abs/2303.11166 | read, §1, §5.2 | A further term in our policy's loss |
| Offline: nodes are clusters at fixed intervals of temporal distance, under 1 % of the states; giant AntMaze stitching 88.3 against QRL 0.4 and HIQL 1.0. | Baek et al. 2025, *Graph-Assisted Stitching* (GAS), https://arxiv.org/abs/2506.07744 | read, Tables 1, 3, App. | A test on recorded experience |
| Offline: a QRL-like quasimetric, 100 learned keypoints, Floyd-Warshall. Giant point maze, stitching 99 against QRL 50; navigation 92 against 68. | Kobanda et al. 2025, *Projective Quasimetric Planning* (ProQ), https://arxiv.org/abs/2506.18847 | read, §4, Table 1, App. | The closest to our agent: a QRL distance in a point maze |
| Offline: a sparse cover built greedily from a quasimetric; edges whose observed crossing time exceeds the quasimetric are pruned; "up to 100× fewer keypoints". | Kobanda et al. 2026, *Adaptive Quasimetric Mapping* (AQM), https://iclr.cc/virtual/2026/10012738 | abstract | The pruning rule |
| Imagined rollouts of one step keep much of the gain; 200 steps are accurate but learn worse. Model error grows with the policy's shift. Ant at 300,000 steps equals SAC at 3 million, with 400 model rollouts and 20 to 40 policy updates per environment step. | Janner et al. 2019, *MBPO*, https://arxiv.org/abs/1906.08253 | read, §4.3, §6, App. C Table 1 | *est.* about 10^10 operations per step at 20 updates, over our budget |
| Imagined horizons of 10, cut to 3 where the model was poor, which shrank the gain; even with the true model gains fall as the horizon grows. | Feinberg et al. 2018, *Model-Based Value Expansion*, https://arxiv.org/abs/1803.00101 | read, §4, Figs. 3, 6 | Avoid long imagined horizons |
| Imagined horizons weighted by the inverse of the ensemble's variance: with a perfect model 5 times fewer samples than TD; with a noisy one MVE diverges and this still gains 2 times. | Buckman et al. 2018, *STEVE*, https://arxiv.org/abs/1807.01675 | read, abstract, Fig. 1, §4.3–4.4 | If imagined targets are used |
| Relabelling by the model: from a real state the policy is rolled n steps in the model, and the imagined end is the goal of the real transition (only the goal is imagined); n = 5 best of 0 to 7. MBPO and MVE contribute little on sparse goal tasks. A one-layer model did as well as four layers. | Yang et al. 2021, *MHER*, https://arxiv.org/abs/2107.00306 | read, §4.2, §5.1–5.3, App. B | First to try: the cheapest form, and it uses our step model and time-to-goal |
| Imagined rollouts of 50 steps with hindsight relabelling, and ensemble disagreement as curiosity: 30, 15, 7 and 4 times less data on four Fetch tasks. One model was exploited unless the imagined data was made again; an ensemble of 5 was best. | McCarthy, Wang, Redmond 2021, *Imaginary Hindsight Experience Replay*, https://arxiv.org/abs/2110.02414 | read, §V | The step model's ensemble serves score 2 as well |

Fetched, not in the table: MapGo (https://arxiv.org/abs/2105.06350, method read), GOPlan
(https://arxiv.org/abs/2310.20025, introduction read), DHRL (https://arxiv.org/abs/2210.05150, title only).

What it means:

- A memory: a sparse graph of landmarks chosen by farthest-point sampling with our time-to-goal; published counts
  run from 50 to about 1,000. Edges where the time-to-goal is short; an edge that fails is deleted (SGM). *est.* With
  200 nodes a rebuild costs about 4 × 10^9 operations spread over many steps, and acting about 2 × 10^7 per step;
  about 160 KB.
- Our time-to-goal errs on the long side, which is the safe side: every graph failure reported comes from edges too
  short. A graph of short edges may also correct the long-range excess.
- Planning pays in training (C-Planning, PIG); SoRB alone buys reach to far goals, not fewer steps.
- Cheapest test of the memory, on recorded experience: landmarks, shortest paths over the graph, against the true
  distances; the ratio and the ranking, for the raw time-to-goal and the graph's path.
- Imagined steps: relabelling by the model with 1 to 5 steps (MHER), real transitions kept. Cheapest test: the step
  model's error over 1 to 5 steps near walls and in the open, on recorded experience; then the time-to-goal trained
  with and without goals relabelled by the model.
- Not found: any test at about 8,300 steps of one stream without resets (most report 10^5 to 10^6 with resets);
  operation counts (only time or O-notation); graph planning with a distance too long throughout; a threshold of
  step-model error, or its error at walls apart.

### Which Zhang extended GCSL (`TODO.md`)

Found among the works citing GCSL (OpenAlex) and by an arXiv search:

1. Lunjun Zhang, Stadie 2022, *Understanding Hindsight Goal Relabeling from a Divergence Minimization Perspective*
   (HDM), https://arxiv.org/abs/2209.13046 (read: abstract, §3, results): GCSL derived as a divergence
   minimisation, plus Q-learning, and imitation only of actions that bring the agent closer by Q; on GCSL's own five
   environments, Four Rooms 96.3 % against 78.3 %. The likeliest.
2. Yang et al. 2022, last author Chongjie Zhang, *WGCSL*, https://arxiv.org/abs/2202.04478 (abstract): the method
   already run in `experiments/gcrl-maze/wgcsl`.
3. Zeqiang Zhang et al. 2025, *GCSL with Negative Feedback*, https://arxiv.org/abs/2509.03206 (abstract): scores
   each trajectory against its original goal by a contrastive similarity.
4. Less likely: Tianjun Zhang et al. 2021, C-Planning (never mentions GCSL); Tianjun Zhang et al. 2023, *Hindsight
   Instruction Relabeling* (language models); Hanbo Zhang et al. 2019, *Hindsight TRPO*; Lunjun Zhang et al. 2021,
   L3P (builds on HER).

## 4. Truth swaps, the split of the budget, Gaussian approximators, the time-to-goal (questions 1, 5, 7 and 8)

| Claim | Source | Checked | Bearing |
|---|---|---|---|
| Offline, success in %: on the point maze with teleports TMD 29.3, CMD 15.7, QRL 8.6, contrastive RL 4.1, a plain goal-conditioned value method (GCIVL) 44.4; on the ant maze with teleports TMD 49.6, CRL 19.5, QRL 2.3. Without its contrastive loss 9.8, without its invariance loss (a backup that averages over the dynamics) 18.5. | Myers, Zheng, Eysenbach, Levine 2025, *Offline Goal-conditioned RL with Quasimetric Representations* (TMD), https://arxiv.org/abs/2509.20478 | read, Tables 1, 4, method | For the variant with a random step: the invariance term as an addition to the quasimetric time-to-goal. Offline only, and a plain value method beats it there |
| Online value-based RL, critic widths 256 to 4,096, 1 to 8 updates per step. Data needed relative to the best split, mean of 4 tasks: more updates only 1.26, more width only 1.11, the best split 1.03. Larger batches raise the held-out TD error of small networks only. Budget counted as wall-clock time; the best split is called "fundamentally unpredictable". | Fu, Rybkin, Zhou, Nauman, Abbeel, Levine, Kumar 2025, *Compute-Optimal Scaling for Value-Based Deep RL*, https://arxiv.org/abs/2508.14881 | read, §4–7, Table 2, App. D | Its trade is in time and at one update per step or more; a smaller batch with smaller networks is worth trying |
| Critics of 0.55 to 26 million parameters, 1 to 15 updates per step: the model's size matters much more, with a plateau near 5 million; a large model at 1 update per step beats a small one at 15 in about a third of the time. | Nauman et al. 2024, *Bigger, Regularized, Optimistic* (BRO), https://arxiv.org/abs/2405.16158 | read, §2.2, App. B.4, E.1 | Measured in time on a GPU, where width is cheap in time but not in operations; does not carry over to an operation count |
| Exact Q-functions by exact fitted Q-iteration on 8 small domains, among them gridworlds with random walls and 5 % of steps going the wrong way. Small networks settle on worse solutions through bootstrapping; a middle number of gradient steps per sample works best, too many hurt. | Fu, Kumar, Soh, Levine 2019, *Diagnosing Bottlenecks in Deep Q-learning Algorithms*, https://arxiv.org/abs/1902.10250 | read, §3–5 | The recipe for our truth: solve a fine discretised copy of the maze exactly, the random step included |
| A Fourier first layer, with no more parameters, matches the plain network with a quarter (Walker) to a sixth (Quadruped) of the updates per step, and 32 % less time; the gain is in the critic. Its bandwidth is tuned per task. | Yang, Ajay, Agrawal 2022, *Overcoming the Spectral Bias of Neural Value Approximation*, https://arxiv.org/abs/2206.04672 | read, §3, §5–7, App. A.7 | A Fourier or Gaussian first layer on the time-to-goal's 2-D input; a cut of 4 to 6 in gradient steps is the kind of saving the budget levels need |
| Planning with the true dynamics against the best learned model at a million steps: HalfCheetah 14,777 against 4,513, Walker2D 7,720 against 1,932, Ant 12,115 against 1,675, Hopper 3,232 against 2,963. | Wang, Bao, Clavera et al. 2019, *Benchmarking Model-Based Reinforcement Learning*, https://arxiv.org/abs/1907.02057 | read, §4.5 | The truth swap of the step model can be worth much; in a 2-D maze probably less (a guess) |
| In an analytic model where the value's noise grows with distance, a flat policy picks wrong actions more often for far goals, and subgoals fix it. A value without actions is unbiased only with deterministic dynamics. Procgen Maze, far goals: 59.9 against 47.2. | Park, Ghosh, Eysenbach, Levine 2023, *HIQL*, https://arxiv.org/abs/2307.11949 | read, §4.3 | What matters is noise against the differences in distance, not a constant factor such as our 1.3 |
| Trained on goals up to 10 m: generalisation to longer horizons at 15 m, CMD 0.93 against contrastive RL 0.10; at 25 m 0.25 against 0.00. Quasimetric policies are planning-invariant. | Myers, Ji, Eysenbach 2025, *Horizon Generalization in RL*, https://arxiv.org/abs/2501.02709 | read, §4–6, Figs. 5–7 | Keep a quasimetric head even if it is trained contrastively |
| Online contrastive RL in JAX: an L2 energy is best; wider and deeper networks help (deeper needs layer norm); from about 1 to about 64 updates per step, only one task improved. | Bortkiewicz et al. 2024, *Accelerating Goal-Conditioned RL Algorithms and Research* (JaxGCRL), https://arxiv.org/abs/2408.11052 | read, §4–5 | More updates per step did not help online goal-conditioned RL: supports a low update rate |
| The contrastive critic estimates the Q-function of the average policy that collected the data, much like Monte Carlo. Stochastic dynamics not analysed. | Eysenbach, Zhang, Salakhutdinov, Levine 2022, *Contrastive Learning as Goal-Conditioned RL*, https://arxiv.org/abs/2206.07568 | read, §4, Fig. 2, Table 1 | As the only time-to-goal in one stream it measures how long the exploring policy takes, not the shortest time |
| Width four times at 8 updates per step on Atari; below four times width, sharp losses. | Schwarzer et al. 2023, *Bigger, Better, Faster*, https://arxiv.org/abs/2305.19452 | read, §4–5 | Pictures and Atari; little carries over to a 2-D input |
| MuZero: planning with the simulator is "somewhat better" than with the learned model; more simulations add a median of about 2 points. | Hamrick et al. 2021, *On the role of planning in model-based deep RL*, https://arxiv.org/abs/2011.04021 | read, §4.4 | A truth swap of the step model can gain little when the value or the policy is the real limit |
| Fourier features improve reward and sample efficiency of networks in RL, with less interference. | Brellmann, Filliat, Frehse 2023, *Fourier Features in RL with Neural Networks*, TMLR, https://researchportal.ip-paris.fr/en/publications/fourier-features-in-reinforcement-learning-with-neural-networks/ | abstract | For a 2-D input the full Fourier basis stays small |
| Resets of the agent allow about 10 times more updates per step. | D'Oro et al. 2023, *Breaking the Replay Ratio Barrier*, ICLR, https://mlanthology.org/iclr/2023/doro2023iclr-sampleefficient | abstract | Needs many updates per step; our budgets give fewer than one |
| A radial-basis output layer over actions, so the maximum over actions is easy; competitive with actor-critic methods. | Asadi et al. 2021, *Deep Radial-Basis Value Functions for Continuous Control*, https://arxiv.org/abs/2002.01883 | abstract | Over actions, not states; no precedent for walls or operation counts |

What it means:

- At its present size (1.5 × 10^9 operations per gradient step) the best agent can take at most 0.67, 0.067 and
  0.0067 gradient steps per environment step at the three budget levels. Every study of the split works at one
  update per step or more, and counts time, not operations.
- Truth swaps: the gain of a true step model ranges from large (MuJoCo, 3 to 7 times) to small (MuZero). By HIQL's
  analysis a uniform 1.3 times too long a time-to-goal should change no greedy choice (an inference, not measured).
  Cheapest truth: value iteration on a fine grid of the maze (Fu 2019), which also handles the random step.
- The split: the measured trades favour width over updates, but in time on a GPU; in operations a layer's cost grows
  with its width squared. JaxGCRL and Fu 2019 find more updates per sample give nothing or hurt. A test at 10^8:
  widths 1, ½, ¼ against two batch sizes, with the update interval set so the operations are equal.
- Gaussian approximators: no RL paper uses Gaussian-kernel attention as a value or distance approximator, and none
  measures radial-basis against plain networks at equal operations near discontinuities. The nearest evidence is the
  Fourier first layer (a cut of 4 to 6 in updates). Cheapest test, on fixed recorded experience: regress the exact
  distance with a plain network, a Fourier first layer and a Gaussian first layer at equal operations; the error
  within one step of a wall, elsewhere, and the rank correlation.
- Contrastive or quasimetric: with teleports neither plain form wins offline (QRL 8.6, CRL 4.1, TMD 29.3, GCIVL
  44.4). Contrastive RL measures the exploring policy's time; the quasimetric head generalises further. Test: in the
  maze with a random step, QRL's distance against the exact expected time for every pair; it may be too optimistic,
  fitting lucky steps (a guess).
- Not found: a learned quasimetric swapped for the exact distance inside a goal-conditioned agent; a study of the
  split in operations, below one update per step, or model-based and goal-conditioned; measured learning on a device
  with 1 MB (RLtools, Eschmann et al. 2024, https://arxiv.org/abs/2306.03530, read §4, Table 1, App. E, claims
  training on a 600 MHz microcontroller with 1,024 KB but gives no time, memory or curve); an online comparison of
  quasimetric and contrastive distances with random steps. Abstract only: Rybkin et al. 2025, *Value-Based Deep RL
  Scales Predictably*, https://arxiv.org/abs/2502.04327; Akella et al. 2023 (expected steps against the chance of
  reaching under randomness), https://mlanthology.org/icmlw/2023/akella2023icmlw-distributional.

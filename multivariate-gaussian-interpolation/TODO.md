# TODO — multivariate-gaussian-interpolation

## GCRL maze environment (decision: [gcrl-discontinuous-test-environment.md](gcrl-discontinuous-test-environment.md), D2 geodesic-step; package `packages/gcrl-maze` in the uv workspace)
- [x] Step 1: geometry and exact geodesic distance (ASCII map → walls, corner graph, `visible`, `geodesic`), tests on manufactured layouts + extremitypathfinder cross-check
- [x] Step 2: dynamics and environment (`project_free`, geodesic-step `f` snapping to targets, reset/step with auto-reset, reward always 0, rollouts end only at the time limit)
- [x] Step 3: ground truth (success predicate, task reward, N, V*, Q*, d channel), exact-steps test, plotting helpers
- [ ] Step 4: after first use, ask what using it showed; amend the decision or reopen a round
- Child decisions (open):
  - [x] Interface style: gymnax-style functional (chosen at implementation; user may override)
  - [ ] Scoring method that separates staircase edges from wall edges (uses the d channel) — decide with the first critic experiment
- Optional add-ons: discontinuity-catalogue layout (A2), exact action-space edge maps (A3), OGBench/D4RL layouts (A4)
- Out of scope for now (won't): offline dataset generation; random layouts per episode (the design does not block per-layout graphs later)

## Attention-critic experiments ([EXPERIMENTS.md](../../Experiments/multivariate-gaussian-interpolation/EXPERIMENTS.md))
- [ ] Test the learned global logit scale (E20 `auto`) in the static cosine-LR setting of E2 — does it match the 1→16 schedule?
- [ ] Continuous drift: periodic re-annealing vs. beta tied to recent loss; spurious OOD jumps (distance-dependent logit scale); edge placement (importance sampling near high error)
- [ ] Experiment 4 of the notes: Gaussian-attention critic in the maze environment

## Code cleanup candidates (experiments project)
- [ ] `toy2d.py`: unused `from functools import partial`
- [ ] `toy2d_oblique.py` `draw_interfaces`: the `np.allclose` part of `closed` is always true
- [ ] `sweep.py` `blend` repeats the value blending in `make_gauss`; move quadratic values and reach into `make_gauss` if they stay
- [ ] `moving.py`: prints `nan` for OOD columns it does not compute

## Real-world GCRL problem statement ([gcrl-real-world-problem-statement.md](gcrl-real-world-problem-statement.md))
- [ ] Problem confirmed (confirmed 2026-11-20, withdrawn the same day)
- [x] Direct draft of the formal statement: [gcrl-real-world-formal-statement.md](gcrl-real-world-formal-statement.md) (2026-11-20, no design research)
- [x] Literature check of the draft (2026-11-20): section 7 of the formal statement; sources in the log
- [x] Formal statement rewritten after the correction of 2026-11-20 (second draft)
- [ ] User to confirm the rewritten problem paragraph; grading settled 2026-11-20: behaviour cost only, learned functions are diagnostics
- [ ] Maze environment: the user reports exact match as a bug there (R15, exact landing, success predicate); both the exact landing and the success test with its values; candidate fix after the grading decision of 2026-11-20: remove the snap, the success test and the step-count values, keep the geodesic distance as the cost; confirm in the maze log, then fix
- [ ] Review the draft: its marked choices and section 6 (exact match needs reachability, learned goal maps are gameable, evaluation start); design research if they need more than a quick answer

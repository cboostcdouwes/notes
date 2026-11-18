# TODO — multivariate-gaussian-interpolation

## GCRL maze environment (decision: [gcrl-discontinuous-test-environment.md](gcrl-discontinuous-test-environment.md), D2 geodesic-step)
- [ ] Step 1: geometry and exact geodesic distance (ASCII map → walls, corner graph, `visible`, `geodesic`), tests on manufactured layouts + extremitypathfinder cross-check
- [ ] Step 2: dynamics and environment (`project_free`, geodesic-step `f` snapping to targets, reset/step with auto-reset, reward always 0, rollouts end only at the time limit)
- [ ] Step 3: ground truth (success predicate, task reward, N, V*, Q*, d channel), exact-steps test, plotting helpers
- [ ] Step 4: after first use, ask what using it showed; amend the decision or reopen a round
- Child decisions (open):
  - [ ] Interface style for reuse with RL libraries (gymnax-style functional vs Gymnasium FuncEnv vs Jumanji) — decide in step 2
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

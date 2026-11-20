# TODO — multivariate-gaussian-interpolation

## GCRL maze environment (decision: [gcrl-discontinuous-test-environment.md](gcrl-discontinuous-test-environment.md), D2 geodesic-step; package `packages/gcrl-maze` in the uv workspace)
- [x] Step 1: geometry and exact geodesic distance (ASCII map → walls, corner graph, `visible`, `geodesic`), tests on manufactured layouts + extremitypathfinder cross-check
- [x] Step 2: dynamics and environment (`project_free`, geodesic-step `f` snapping to targets, reset/step with auto-reset, reward always 0, rollouts end only at the time limit)
- [x] Step 3: ground truth (success predicate, task reward, N, V*, Q*, d channel), exact-steps test, plotting helpers
- [ ] Step 4: after first use, ask what using it showed; amend the decision or reopen a round (the maze log's requirements table still shows the pre-2026-11-20 requirements; its Decision notes what was overridden)
- Child decisions (open):
  - [x] Interface style: gymnax-style functional (chosen at implementation; user may override)
  - [x] ~~Scoring method that separates staircase edges from wall edges~~ obsolete 2026-11-20: the step-count values are removed, learned functions are diagnostics only
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
- [x] Final statement written to the experiments project: [PROBLEM_STATEMENT.md](../../Experiments/multivariate-gaussian-interpolation/PROBLEM_STATEMENT.md) (2026-11-20). The draft `gcrl-real-world-formal-statement.md` here is superseded by it; the log keeps the history
- [ ] The log's problem paragraph is still unconfirmed since the exact-match correction
- [x] Maze environment updated to match PROBLEM_STATEMENT.md (2026-11-20): no goal, reward or snap in `env`; reset flag; `truth` replaced by `evaluation` (regret in geodesic distance); see the maze log's Decision
- [ ] Review the draft: its marked choices and section 6 (exact match needs reachability, learned goal maps are gameable, evaluation start); design research if they need more than a quick answer

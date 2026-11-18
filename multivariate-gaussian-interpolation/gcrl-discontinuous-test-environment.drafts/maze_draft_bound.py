"""Draft add-on: stronger upper bound for straight-move (stop-at-contact) dynamics.

Policy: each step moves straight to the farthest point along the geodesic to the goal that is
visible from the current position and at most L along the path (bisection on arc length).
"""
import sys
sys.argv = [sys.argv[0], "/dev/null"]
import importlib.util, os
spec = importlib.util.spec_from_file_location("md", os.path.join(os.path.dirname(os.path.abspath(__file__)), "maze_draft.py"))
md = importlib.util.module_from_spec(spec); spec.loader.exec_module(md)
import jax, jax.numpy as jnp, numpy as np


def farthest_visible_action(s):
    g = jnp.array(md.GOAL)
    dist, i, j = md.geodesic(s, g)
    reach = jnp.minimum(md.L, dist)
    def point(lam):
        return md.walk_path(s, g, i, j, lam)
    def body(_, lohi):
        lo, hi = lohi
        mid = 0.5 * (lo + hi)
        ok = md.visible(s, point(mid))
        return jnp.where(ok, mid, lo), jnp.where(ok, hi, mid)
    lo, hi = jax.lax.fori_loop(0, 40, body, (0.0, reach))
    lo = jnp.where(md.visible(s, point(reach)), reach, lo)
    a = (point(lo) - s) / md.L
    return a / jnp.maximum(1.0, jnp.linalg.norm(a))


key = jax.random.PRNGKey(0)
s = md.free_samples(jax.random.split(key)[0], 4000)
n_lower = jax.vmap(md.steps_to_goal)(s)
weak, _ = jax.vmap(lambda p: md.rollout_steps(md.f_stop, md.greedy_straight_action, p))(s)
strong, _ = jax.vmap(lambda p: md.rollout_steps(md.f_stop, farthest_visible_action, p))(s)
for name, up in (("first-leg policy (round-2 draft)", weak), ("farthest-visible policy", strong)):
    gap = np.asarray(up - n_lower)
    print(f"{name}: lower bound == upper bound on {np.mean(gap == 0):.4f}; gap 1: {np.mean(gap == 1):.4f}; gap >= 2: {np.mean(gap >= 2):.4f}")
bends = np.asarray(jax.vmap(lambda p: md.geodesic(p, jnp.array(md.GOAL))[1] >= 0)(s))
print(f"starts whose geodesic bends: {bends.mean():.4f}; undecided among straight-line (no bend) starts: {np.mean((np.asarray(strong - n_lower) > 0)[~bends]):.4f}")

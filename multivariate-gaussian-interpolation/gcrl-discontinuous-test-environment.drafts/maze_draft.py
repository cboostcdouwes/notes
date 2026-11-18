"""Throwaway draft for the maze design research (not project code).

Point agent among axis-aligned wall cells (from an ASCII map), action a in the unit disk,
step length L. Compares two dynamics near corners:
  D2 geodesic step: move up to L along the shortest free path toward t = Proj_free(s + L a)
  D5 stop at contact: move straight along s -> s + L a until the first wall contact
Truth: exact geodesic distance d(p, g) by a visibility graph over convex wall corners (T1);
for D2, N(p) = ceil(d(p, goal disk) / L) and Q*(s, a) = gamma ** N(f(s, a)).
Checks: (1) D2 lower bound d(f(s,a)) >= d(s) - L for random s, a; (2) the greedy D2 policy
reaches the goal in exactly N steps; (3) for D5, where the lower bound ceil(d/L) and a
greedy-policy upper bound disagree (the undecided sliver set).
"""

import sys

import jax
import jax.numpy as jnp
import matplotlib.pyplot as plt
import numpy as np

jax.config.update("jax_enable_x64", True)

MAZE = [
    "#######",
    "#.....#",
    "#####.#",
    "#.....#",
    "#######",
]
L = 0.3          # step length
GOAL = np.array([1.5, 1.5])
GOAL_R = 0.2
GAMMA = 0.95
EPS = 1e-9

# ---------------------------------------------------------------- geometry

H, W = len(MAZE), len(MAZE[0])
wall = np.array([[c == "#" for c in row] for row in MAZE])


def cell_box(i, j):
    """(xmin, ymin, xmax, ymax) of grid cell (row i, col j); row 0 is the top."""
    return j, H - 1 - i, j + 1, H - i


def is_wall(i, j):
    return not (0 <= i < H and 0 <= j < W) or wall[i, j]


# Wall cells expanded by EXPAND towards neighbouring wall cells, so a segment running along
# an internal edge between two wall cells counts as inside; exterior edges stay exact.
EXPAND = 1e-7
boxes = []
for i in range(H):
    for j in range(W):
        if wall[i, j]:
            x0, y0, x1, y1 = cell_box(i, j)
            if is_wall(i, j - 1): x0 -= EXPAND
            if is_wall(i, j + 1): x1 += EXPAND
            if is_wall(i + 1, j): y0 -= EXPAND
            if is_wall(i - 1, j): y1 += EXPAND
            boxes.append((x0, y0, x1, y1))
BOXES = jnp.array(boxes)

# Exterior wall edges (between a wall cell and a free cell): projection targets.
edges = []
for i in range(H):
    for j in range(W):
        if not wall[i, j]:
            continue
        x0, y0, x1, y1 = cell_box(i, j)
        if not is_wall(i, j - 1): edges.append((x0, y0, x0, y1))
        if not is_wall(i, j + 1): edges.append((x1, y0, x1, y1))
        if not is_wall(i + 1, j): edges.append((x0, y0, x1, y0))
        if not is_wall(i - 1, j): edges.append((x0, y1, x1, y1))
EDGES = jnp.array(edges)

# Convex wall corners = graph nodes: grid vertices with exactly one wall cell among the four
# cells around them (the corner sticks out into free space).
nodes = []
for vi in range(H + 1):
    for vj in range(W + 1):
        around = [is_wall(vi - 1, vj - 1), is_wall(vi - 1, vj), is_wall(vi, vj - 1), is_wall(vi, vj)]
        inside = 0 < vi < H and 0 < vj < W
        if inside and sum(around) == 1:
            nodes.append((vj, H - vi))
NODES = jnp.array(nodes, dtype=float)


def segment_hits_box(p, q, box):
    """True if the open segment p-q passes through the open interior of the box (slab test)."""
    d = q - p
    lo, hi = box[:2], box[2:]
    with np.errstate(divide="ignore"):
        inv = jnp.where(jnp.abs(d) > 0, 1.0 / jnp.where(jnp.abs(d) > 0, d, 1.0), jnp.inf)
    t0 = (lo - p) * inv
    t1 = (hi - p) * inv
    tmin = jnp.minimum(t0, t1)
    tmax = jnp.maximum(t0, t1)
    # axis with d == 0: inside slab iff strictly between lo and hi
    inside_slab = (p > lo + EPS) & (p < hi - EPS)
    tmin = jnp.where(jnp.abs(d) > 0, tmin, jnp.where(inside_slab, -jnp.inf, jnp.inf))
    tmax = jnp.where(jnp.abs(d) > 0, tmax, jnp.where(inside_slab, jnp.inf, -jnp.inf))
    enter = jnp.max(tmin)
    leave = jnp.min(tmax)
    return (leave - enter > EPS) & (leave > EPS) & (enter < 1 - EPS)


def visible(p, q):
    return ~jnp.any(jax.vmap(lambda b: segment_hits_box(p, q, b))(BOXES))


# ---------------------------------------------------------------- T1: exact geodesic distance

n_nodes = len(nodes)
vis_nn = np.array(jax.vmap(lambda a: jax.vmap(lambda b: visible(a, b))(NODES))(NODES))
dist_nn = np.linalg.norm(np.array(NODES)[:, None] - np.array(NODES)[None], axis=-1)
D = np.where(vis_nn, dist_nn, np.inf)
np.fill_diagonal(D, 0.0)
NEXT = np.where(np.isfinite(D), np.arange(n_nodes)[None, :], -1)
for k in range(n_nodes):  # Floyd–Warshall with next-hop table
    via = D[:, k:k + 1] + D[k:k + 1, :]
    better = via < D
    D = np.where(better, via, D)
    NEXT = np.where(better, NEXT[:, k:k + 1], NEXT)
D_J, NEXT_J = jnp.array(D), jnp.array(NEXT)


def geodesic(p, q):
    """Exact shortest free-path length p -> q and the first and last graph node (-1: direct)."""
    direct = jnp.where(visible(p, q), jnp.linalg.norm(q - p), jnp.inf)
    vis_p = jax.vmap(lambda c: visible(p, c))(NODES)
    vis_q = jax.vmap(lambda c: visible(c, q))(NODES)
    to_p = jnp.where(vis_p, jnp.linalg.norm(NODES - p, axis=-1), jnp.inf)
    to_q = jnp.where(vis_q, jnp.linalg.norm(NODES - q, axis=-1), jnp.inf)
    total = to_p[:, None] + D_J + to_q[None, :]
    flat = jnp.argmin(total)
    i, j = flat // n_nodes, flat % n_nodes
    routed = total[i, j]
    use_direct = direct <= routed
    return jnp.where(use_direct, direct, routed), jnp.where(use_direct, -1, i), jnp.where(use_direct, -1, j)


def goal_distance(p):
    """Exact geodesic distance to the goal disk (goal disk is wall-free)."""
    return jnp.maximum(geodesic(p, jnp.array(GOAL))[0] - GOAL_R, 0.0)


def steps_to_goal(p):
    """D2 exact step count N(p) = ceil(d(p, goal disk) / L)."""
    return jnp.ceil(goal_distance(p) / L - 1e-9)


# ---------------------------------------------------------------- dynamics


def project_free(p):
    """Nearest free point: p itself if free, else the nearest point on an exterior wall edge."""
    inside = jnp.any(jax.vmap(lambda b: jnp.all((p > b[:2]) & (p < b[2:])))(BOXES))
    a, b = EDGES[:, :2], EDGES[:, 2:]
    t = jnp.clip(jnp.sum((p - a) * (b - a), -1) / jnp.sum((b - a) ** 2, -1), 0, 1)
    proj = a + t[:, None] * (b - a)
    nearest = proj[jnp.argmin(jnp.linalg.norm(proj - p, axis=-1))]
    return jnp.where(inside, nearest, p)


def walk_path(s, t, i, j, length):
    """Point at arc length `length` along the path s -> node i -> ... -> node j -> t."""
    def body(carry, _):
        pos, current, remaining, done = carry
        nxt_node = jnp.where(current < 0, -1, NEXT_J[jnp.maximum(current, 0), j])
        target = jnp.where(current < 0, t, NODES[jnp.maximum(current, 0)])
        seg = jnp.linalg.norm(target - pos)
        move = jnp.minimum(remaining, seg)
        new_pos = jnp.where(seg > 0, pos + (target - pos) * move / jnp.maximum(seg, 1e-12), pos)
        arrived = move >= seg - 1e-12
        # after reaching node `current`, the next target is the next hop towards j, then t
        next_current = jnp.where(current == j, -1, NEXT_J[jnp.maximum(current, 0), j])
        new_current = jnp.where(arrived & (current >= 0), next_current, current)
        new_done = done | (current < 0) & arrived | (remaining - move <= 1e-12)
        pos = jnp.where(done, pos, new_pos)
        return (pos, jnp.where(done, current, new_current), jnp.where(done, remaining, remaining - move), new_done), None

    start = jnp.where(i < 0, -1, i)
    (pos, _, _, _), _ = jax.lax.scan(body, (s, start, length, False), None, length=n_nodes + 2)
    return pos


def f_geodesic(s, a):
    """D2: move up to L along the shortest free path toward t = Proj_free(s + L a)."""
    t = project_free(s + L * a)
    dist, i, j = geodesic(s, t)
    return walk_path(s, t, i, j, jnp.minimum(L, dist))


def f_stop(s, a):
    """D5: move straight toward s + L a, stopping at the first wall contact."""
    q = s + L * a
    d = q - s

    def entry_time(box):
        lo, hi = box[:2], box[2:]
        inv = jnp.where(jnp.abs(d) > 0, 1.0 / jnp.where(jnp.abs(d) > 0, d, 1.0), jnp.inf)
        t0, t1 = (lo - s) * inv, (hi - s) * inv
        inside_slab = (s > lo + EPS) & (s < hi - EPS)
        tmin = jnp.where(jnp.abs(d) > 0, jnp.minimum(t0, t1), jnp.where(inside_slab, -jnp.inf, jnp.inf))
        tmax = jnp.where(jnp.abs(d) > 0, jnp.maximum(t0, t1), jnp.where(inside_slab, jnp.inf, -jnp.inf))
        enter, leave = jnp.max(tmin), jnp.min(tmax)
        hit = (leave - enter > EPS) & (leave > EPS) & (enter < 1 - EPS)
        return jnp.where(hit, jnp.maximum(enter, 0.0), 1.0)

    t_hit = jnp.min(jax.vmap(entry_time)(BOXES))
    return s + t_hit * d


# ---------------------------------------------------------------- policies


def greedy_action(s):
    """Aim at the point L along the geodesic to the goal (the D2-optimal action)."""
    g = jnp.array(GOAL)
    dist, i, j = geodesic(s, g)
    target = walk_path(s, g, i, j, jnp.minimum(L, dist))
    a = (target - s) / L
    return a / jnp.maximum(1.0, jnp.linalg.norm(a))


def greedy_straight_action(s):
    """For straight-move dynamics: move along the first leg of the geodesic (never cut a corner)."""
    g = jnp.array(GOAL)
    dist, i, j = geodesic(s, g)
    first = jnp.where(i < 0, g, NODES[jnp.maximum(i, 0)])
    # standing on the first node: aim at the next hop (or the goal) instead
    after = jnp.where(i == j, g, NODES[jnp.maximum(NEXT_J[jnp.maximum(i, 0), j], 0)])
    first = jnp.where((i >= 0) & (jnp.linalg.norm(first - s) < 1e-9), after, first)
    leg = first - s
    n = jnp.linalg.norm(leg)
    return jnp.where(n > 0, leg / jnp.maximum(n, 1e-12) * jnp.minimum(1.0, n / L), 0.0 * leg)


def rollout_steps(f, policy, s, max_steps=60):
    def body(carry, _):
        pos, steps, done = carry
        reached = jnp.linalg.norm(pos - jnp.array(GOAL)) <= GOAL_R + 1e-9
        new_pos = jnp.where(done | reached, pos, f(pos, policy(pos)))
        return (new_pos, steps + jnp.where(done | reached, 0, 1), done | reached), pos
    (pos, steps, done), path = jax.lax.scan(body, (s, 0, False), None, length=max_steps)
    return steps, path


# ---------------------------------------------------------------- checks and plots


def free_samples(key, n):
    pts = jax.random.uniform(key, (n * 3, 2), minval=jnp.array([0.0, 0.0]), maxval=jnp.array([W, H]))
    free = ~jax.vmap(lambda p: jnp.any(jax.vmap(lambda b: jnp.all((p > b[:2]) & (p < b[2:])))(BOXES)))(pts)
    return pts[np.asarray(free)][:n]


def main(out):
    key = jax.random.PRNGKey(0)
    ks, ka = jax.random.split(key)
    s = free_samples(ks, 4000)
    ang = jax.random.uniform(ka, (len(s),), maxval=2 * jnp.pi)
    rad = jnp.sqrt(jax.random.uniform(jax.random.fold_in(ka, 1), (len(s),)))
    a = jnp.stack([rad * jnp.cos(ang), rad * jnp.sin(ang)], -1)

    d_s = jax.vmap(goal_distance)(s)
    s_next = jax.vmap(f_geodesic)(s, a)
    d_next = jax.vmap(goal_distance)(s_next)
    moved = jnp.linalg.norm(s_next - s, axis=-1)
    print(f"nodes {n_nodes}; check 1 (D2 lower bound d(f) >= d - L): min slack {float(jnp.min(d_next - d_s + L)):.2e} "
          f"(>= 0 expected); max displacement {float(moved.max()):.4f} (<= L = {L})")
    s_next_free = ~jax.vmap(lambda p: jnp.any(jax.vmap(lambda b: jnp.all((p > b[:2] + 1e-6) & (p < b[2:] - 1e-6)))(BOXES)))(s_next)
    print(f"         D2 next states free: {float(s_next_free.mean()):.4f}")

    n_closed = jax.vmap(steps_to_goal)(s)
    steps_greedy, _ = jax.vmap(lambda p: rollout_steps(f_geodesic, greedy_action, p))(s)
    agree = np.asarray(steps_greedy == n_closed)
    print(f"check 2 (D2 greedy policy reaches the goal in exactly N steps): {agree.mean():.4f} of {len(s)} starts")
    if not agree.all():
        bad = np.flatnonzero(~agree)[:5]
        print("   mismatches (start, N, greedy):", [(np.round(np.asarray(s[b]), 3).tolist(), int(n_closed[b]), int(steps_greedy[b])) for b in bad])

    steps_stop, _ = jax.vmap(lambda p: rollout_steps(f_stop, greedy_straight_action, p))(s)
    undecided = np.asarray(steps_stop > n_closed)
    print(f"check 3 (D5 stop-at-contact): lower bound ceil(d/L) == greedy upper bound on {1 - undecided.mean():.4f} of starts; "
          f"undecided (exact N needs search) on {undecided.mean():.4f}; max gap {int((steps_stop - n_closed).max())} step(s)")

    # ---- plots
    nx, ny = 280, 200
    xs, ys = np.linspace(0, W, nx), np.linspace(0, H, ny)
    grid = jnp.array(np.stack(np.meshgrid(xs, ys), -1).reshape(-1, 2))
    in_wall = np.asarray(jax.vmap(lambda p: jnp.any(jax.vmap(lambda b: jnp.all((p > b[:2]) & (p < b[2:])))(BOXES)))(grid))
    d_grid = np.array(jax.lax.map(goal_distance, grid, batch_size=2048))
    d_grid[in_wall] = np.nan
    n_grid = np.ceil(d_grid / L - 1e-9)

    fig, axes = plt.subplots(2, 3, figsize=(18, 9))
    ext = (0, W, 0, H)
    def draw_walls(ax):
        for (x0, y0, x1, y1) in boxes:
            ax.add_patch(plt.Rectangle((x0, y0), x1 - x0, y1 - y0, color="0.25"))
        ax.add_patch(plt.Circle(GOAL, GOAL_R, fill=False, color="red"))
        ax.set_xlim(0, W); ax.set_ylim(0, H); ax.set_aspect("equal")

    ax = axes[0, 0]
    im = ax.imshow(d_grid.reshape(ny, nx), origin="lower", extent=ext, cmap="viridis")
    fig.colorbar(im, ax=ax, shrink=0.7); draw_walls(ax); ax.set_title("R8b: exact geodesic distance to goal (T1)")
    ax = axes[0, 1]
    im = ax.imshow((GAMMA ** n_grid).reshape(ny, nx), origin="lower", extent=ext, cmap="viridis")
    fig.colorbar(im, ax=ax, shrink=0.7); draw_walls(ax); ax.set_title(f"D2: exact V* = gamma^N, N = ceil(d/L), L={L}")

    # trajectories from a few starts
    ax = axes[0, 2]
    draw_walls(ax)
    for start, col in [((5.5, 3.5), "tab:blue"), ((3.2, 3.5), "tab:orange"), ((5.2, 2.6), "tab:green")]:
        _, path = rollout_steps(f_geodesic, greedy_action, jnp.array(start), 40)
        path = np.unique(np.round(np.asarray(path), 9), axis=0, return_index=True)
        p = np.asarray(rollout_steps(f_geodesic, greedy_action, jnp.array(start), 40)[1])
        ax.plot(p[:, 0], p[:, 1], "-o", ms=2.5, color=col, lw=1, label=f"D2 from {start}")
        q = np.asarray(rollout_steps(f_stop, greedy_straight_action, jnp.array(start), 40)[1])
        ax.plot(q[:, 0], q[:, 1], "--x", ms=3, color=col, lw=0.8, alpha=0.7)
    ax.set_title("greedy trajectories: D2 solid, D5 (stop at contact) dashed"); ax.legend(fontsize=7)

    # action-space maps at a state just before the corner
    s0 = jnp.array([5.15, 2.85])
    na = 161
    aa = np.linspace(-1, 1, na)
    A = np.stack(np.meshgrid(aa, aa), -1).reshape(-1, 2)
    in_disk = np.linalg.norm(A, axis=-1) <= 1
    A_j = jnp.array(A)
    for col, (name, f) in enumerate([("D2 geodesic step", f_geodesic), ("D5 stop at contact", f_stop)]):
        nxt = jax.vmap(lambda act: f(s0, act))(A_j)
        q = GAMMA ** np.array(jax.vmap(steps_to_goal)(nxt))
        q[~in_disk] = np.nan
        ax = axes[1, col]
        im = ax.imshow(q.reshape(na, na), origin="lower", extent=(-1, 1, -1, 1), cmap="viridis")
        fig.colorbar(im, ax=ax, shrink=0.7)
        ax.set_title(f"{name}: gamma^N(f(s0, a)) over the action disk\n(s0 = {np.asarray(s0).tolist()}; D5 values use D2's N as a stand-in)")
        ax.set_xlabel("a_x"); ax.set_ylabel("a_y")
    ax = axes[1, 2]
    draw_walls(ax)
    ax.plot(*np.asarray(s0), "k*", ms=10)
    for name, f, col in [("D2", f_geodesic, "tab:blue"), ("D5", f_stop, "tab:red")]:
        ends = np.asarray(jax.vmap(lambda act: f(s0, act))(A_j[in_disk][::7]))
        ax.plot(ends[:, 0], ends[:, 1], ".", ms=2, color=col, label=f"{name} reachable in one step")
    ax.set_xlim(4.3, 6.1); ax.set_ylim(1.9, 3.7); ax.legend(fontsize=8)
    ax.set_title("one-step reachable sets from s0 (zoom on the corner)")
    fig.tight_layout()
    fig.savefig(out, dpi=110)
    print("figure:", out)


if __name__ == "__main__":
    main(sys.argv[1])

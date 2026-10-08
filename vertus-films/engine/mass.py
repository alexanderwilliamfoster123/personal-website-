"""The Vertus living mass: a lobed, folded, cerebral form and the beads that skin it.

Shape: hierarchical lobes (cauliflower growth) fused with a smooth-min, pushed
around by an ink-like domain warp, then sculpted with billow bumps and ridged
gyri folds. Matter: millions of packed beads sampled in a thin shell under the
surface, relaxed so they touch without fusing, coloured along the brand ramp.
"""
import math
import numpy as np
from numba import njit, prange

from .noise import PERM, fbm, billow, ridged
from . import palette

# ----------------------------------------------------------------------------- shape


class MassShape:
    """Parameter bundle for the mass SDF (plain arrays so numba can take them).

    A uniform grid over the lobes lists, per cell, only the lobes that can touch
    the smooth-min there, so a 1,000-lobe plume field costs about as much as a
    20-lobe blob.
    """

    def __init__(self, lobes, k=0.35, warp_amp=0.18, warp_freq=0.9, t=0.0,
                 bump_amp=0.06, bump_freq=3.2, fold_amp=0.035, fold_freq=5.5,
                 perm=PERM, ribbons=None, grid_h=None):
        self.lobes = np.ascontiguousarray(lobes, dtype=np.float64)
        self.k = float(k)
        self.warp_amp = float(warp_amp)
        self.warp_freq = float(warp_freq)
        self.t = float(t)
        self.bump_amp = float(bump_amp)
        self.bump_freq = float(bump_freq)
        self.fold_amp = float(fold_amp)
        self.fold_freq = float(fold_freq)
        self.perm = perm
        # ribbons: (M, 7) capsule chain segments ax ay az bx by bz r
        self.ribbons = (np.zeros((0, 7)) if ribbons is None
                        else np.ascontiguousarray(ribbons, dtype=np.float64))
        self.grid_h = grid_h
        self._grid = None

    def grid(self):
        if self._grid is None:
            r = self.lobes[:, 3]
            h = self.grid_h or float(np.clip(np.median(r) * 0.9, 0.04, 0.16))
            pad = float(r.max() * (1 + self.k) + 0.1)
            self._grid = build_lobe_grid(self.lobes, self.k, h, pad)
        return self._grid

    def args(self):
        g = self.grid()
        return (self.lobes, self.ribbons, self.k, self.warp_amp, self.warp_freq, self.t,
                self.bump_amp, self.bump_freq, self.fold_amp, self.fold_freq, self.perm) + tuple(g)

    def sdf(self, P):
        return mass_sdf(np.ascontiguousarray(P, dtype=np.float64), *self.args())

    def grad(self, P, eps=2e-3):
        return mass_grad(np.ascontiguousarray(P, dtype=np.float64), eps, *self.args())

    def bbox(self, pad=0.35):
        L = self.lobes
        lo = (L[:, :3] - L[:, 3:4]).min(0)
        hi = (L[:, :3] + L[:, 3:4]).max(0)
        if len(self.ribbons):
            R = self.ribbons
            lo = np.minimum(lo, np.minimum(R[:, 0:3], R[:, 3:6]).min(0) - R[:, 6].max())
            hi = np.maximum(hi, np.maximum(R[:, 0:3], R[:, 3:6]).max(0) + R[:, 6].max())
        return lo - pad, hi + pad


@njit(cache=True, parallel=True)
def _grid_pass(lobes, k, lo, n, h, start, items, fill):
    L = lobes.shape[0]
    nc = n[0] * n[1] * n[2]
    half = h * math.sqrt(3.0) * 0.5
    counts = np.zeros(nc, dtype=np.int64)
    for c in prange(nc):
        ix = c // (n[1] * n[2]); iy = (c // n[2]) % n[1]; iz = c % n[2]
        cx = lo[0] + (ix + 0.5) * h; cy = lo[1] + (iy + 0.5) * h; cz = lo[2] + (iz + 0.5) * h
        best = 1e18
        for j in range(L):
            dx = cx - lobes[j, 0]; dy = cy - lobes[j, 1]; dz = cz - lobes[j, 2]
            best = min(best, math.sqrt(dx * dx + dy * dy + dz * dz) + half - lobes[j, 3])
        w = start[c] if fill else 0
        cnt = 0
        for j in range(L):
            dx = cx - lobes[j, 0]; dy = cy - lobes[j, 1]; dz = cz - lobes[j, 2]
            # generous margin: the running smooth-min sits a little below the true min
            if math.sqrt(dx * dx + dy * dy + dz * dz) - half - lobes[j, 3] < best + 2.0 * k * lobes[j, 3] + 0.03:
                if fill:
                    items[w + cnt] = j
                cnt += 1
        counts[c] = cnt
    return counts


def build_lobe_grid(lobes, k, h, pad):
    lo = (lobes[:, :3] - lobes[:, 3:4]).min(0) - pad
    hi = (lobes[:, :3] + lobes[:, 3:4]).max(0) + pad
    n = (np.ceil((hi - lo) / h).astype(np.int64) + 1)
    dummy = np.zeros(1, dtype=np.int64)
    counts = _grid_pass(lobes, k, lo, n, h, dummy, dummy, False)
    start = np.concatenate([[0], np.cumsum(counts)]).astype(np.int64)
    items = np.empty(start[-1], dtype=np.int64)
    _grid_pass(lobes, k, lo, n, h, start, items, True)
    return lo, np.array([h]), n, start, items


@njit(cache=True, fastmath=True, inline="always")
def _smin(a, b, k):
    h = max(k - abs(a - b), 0.0) / k
    return min(a, b) - h * h * k * 0.25


@njit(cache=True, fastmath=True)
def _sdf1(x, y, z, lobes, ribbons, k, wa, wf, t, ba, bf, fa, ff, perm, glo, gh, gn, gstart, gitems):
    # ink billow: low-frequency vector warp, animated
    if wa > 0.0:
        qx = x + wa * fbm(x * wf + 31.4, y * wf + t, z * wf - 12.7, 3, 2.03, 0.5, perm)
        qy = y + wa * fbm(x * wf - 19.1 + t, y * wf + 44.2, z * wf + 7.3, 3, 2.03, 0.5, perm)
        qz = z + wa * fbm(x * wf + 3.3, y * wf - 27.9, z * wf + 51.6 + t, 3, 2.03, 0.5, perm)
    else:
        qx = x; qy = y; qz = z
    d = 1e9
    h = gh[0]
    ix = int(math.floor((qx - glo[0]) / h)); iy = int(math.floor((qy - glo[1]) / h))
    iz = int(math.floor((qz - glo[2]) / h))
    if 0 <= ix < gn[0] and 0 <= iy < gn[1] and 0 <= iz < gn[2]:
        c = (ix * gn[1] + iy) * gn[2] + iz
        for s in range(gstart[c], gstart[c + 1]):
            j = gitems[s]
            dx = qx - lobes[j, 0]; dy = qy - lobes[j, 1]; dz = qz - lobes[j, 2]
            dj = math.sqrt(dx * dx + dy * dy + dz * dz) - lobes[j, 3]
            d = _smin(d, dj, k * lobes[j, 3])
    else:
        for j in range(lobes.shape[0]):
            dx = qx - lobes[j, 0]; dy = qy - lobes[j, 1]; dz = qz - lobes[j, 2]
            dj = math.sqrt(dx * dx + dy * dy + dz * dz) - lobes[j, 3]
            d = _smin(d, dj, k * lobes[j, 3])
    for j in range(ribbons.shape[0]):
        ax = ribbons[j, 0]; ay = ribbons[j, 1]; az = ribbons[j, 2]
        bx = ribbons[j, 3] - ax; by = ribbons[j, 4] - ay; bz = ribbons[j, 5] - az
        px = qx - ax; py = qy - ay; pz = qz - az
        bb = bx * bx + by * by + bz * bz
        hh = (px * bx + py * by + pz * bz) / bb if bb > 0 else 0.0
        hh = min(max(hh, 0.0), 1.0)
        ex = px - bx * hh; ey = py - by * hh; ez = pz - bz * hh
        dj = math.sqrt(ex * ex + ey * ey + ez * ez) - ribbons[j, 6]
        d = _smin(d, dj, k * 0.5)
    # cauliflower bumps and gyri folds only matter near the surface
    if d < 0.6:
        if ba > 0.0:
            d -= ba * billow(qx * bf, qy * bf, qz * bf, 4, 2.13, 0.52, perm)
        if fa > 0.0:
            d -= fa * ridged(qx * ff + 9.1, qy * ff, qz * ff - 3.3, 3, 2.07, 0.5, perm)
    return d


@njit(parallel=True, cache=True, fastmath=True)
def mass_sdf(P, lobes, ribbons, k, wa, wf, t, ba, bf, fa, ff, perm, glo, gh, gn, gstart, gitems):
    n = P.shape[0]
    out = np.empty(n)
    for i in prange(n):
        out[i] = _sdf1(P[i, 0], P[i, 1], P[i, 2], lobes, ribbons, k, wa, wf, t, ba, bf, fa, ff, perm,
                       glo, gh, gn, gstart, gitems)
    return out


@njit(parallel=True, cache=True, fastmath=True)
def mass_grad(P, e, lobes, ribbons, k, wa, wf, t, ba, bf, fa, ff, perm, glo, gh, gn, gstart, gitems):
    n = P.shape[0]
    out = np.empty((n, 3))
    for i in prange(n):
        x = P[i, 0]; y = P[i, 1]; z = P[i, 2]
        gx = _sdf1(x + e, y, z, lobes, ribbons, k, wa, wf, t, ba, bf, fa, ff, perm, glo, gh, gn, gstart, gitems) - \
            _sdf1(x - e, y, z, lobes, ribbons, k, wa, wf, t, ba, bf, fa, ff, perm, glo, gh, gn, gstart, gitems)
        gy = _sdf1(x, y + e, z, lobes, ribbons, k, wa, wf, t, ba, bf, fa, ff, perm, glo, gh, gn, gstart, gitems) - \
            _sdf1(x, y - e, z, lobes, ribbons, k, wa, wf, t, ba, bf, fa, ff, perm, glo, gh, gn, gstart, gitems)
        gz = _sdf1(x, y, z + e, lobes, ribbons, k, wa, wf, t, ba, bf, fa, ff, perm, glo, gh, gn, gstart, gitems) - \
            _sdf1(x, y, z - e, lobes, ribbons, k, wa, wf, t, ba, bf, fa, ff, perm, glo, gh, gn, gstart, gitems)
        inv = 1.0 / (2 * e)
        out[i, 0] = gx * inv; out[i, 1] = gy * inv; out[i, 2] = gz * inv
    return out


def grow_lobes(seed=3, n=46, root_r=0.62, shrink=(0.42, 0.78), bias=(0.0, 0.0, 0.25),
               spread=(1.35, 0.8, 1.0), attach=0.86, root=(0.0, 0.0, 0.0)):
    """Cauliflower growth: each new lobe buds off the surface of an existing one.

    `spread` squashes the bud directions (wider than tall reads as a brain, a
    tall spread reads as an ink tower); `bias` leans growth (e.g. upward billow).
    """
    rng = np.random.default_rng(seed)
    lobes = [np.array([*root, root_r])]
    bias = np.asarray(bias, dtype=np.float64)
    spread = np.asarray(spread, dtype=np.float64)
    for _ in range(n - 1):
        L = np.array(lobes)
        w = L[:, 3] ** 2.2
        parent = L[rng.choice(len(L), p=w / w.sum())]
        d = rng.normal(size=3) * spread + bias
        d /= np.linalg.norm(d) + 1e-9
        r = parent[3] * rng.uniform(*shrink)
        c = parent[:3] + d * parent[3] * attach
        lobes.append(np.array([*c, r]))
    return np.array(lobes)


def cauliflower(seed=1, base_r=0.55, arms=4, arm_ratio=(0.55, 0.85), levels=(6, 5, 4),
                ratios=(0.5, 0.48, 0.45), protrude=0.42, bias=(0.0, 0.0, 0.35),
                spread=(1.0, 0.8, 1.0), jitter=0.28, root=(0.0, 0.0, 0.0)):
    """Hierarchical lobes: a few big arms, each budding smaller lobes, recursively.

    Children sit on the parent's exposed surface (pointing away from the cluster
    centre) and protrude, so every level stays legible as a rounded bulb with a
    cleft around it. This is the cauliflower / brain-coral / ink-plume read.
    """
    rng = np.random.default_rng(seed)
    bias = np.asarray(bias, float); spread = np.asarray(spread, float)
    root = np.asarray(root, float)
    S = [np.array([*root, base_r])]
    level_of = [0]

    def rdir(away, w=1.0):
        d = rng.normal(size=3) * spread + bias + away * w
        return d / (np.linalg.norm(d) + 1e-9)

    # arms: big lobes budding off the root in varied directions
    for a in range(arms):
        d = rdir(np.zeros(3))
        r = base_r * rng.uniform(*arm_ratio)
        c = root + d * (base_r + r * (protrude - 0.5) * 2 * 0.6)
        S.append(np.array([*c, r])); level_of.append(1)
    frontier = list(range(len(S)))
    for li, nkids in enumerate(levels):
        new = []
        for idx in frontier:
            pc = S[idx][:3]; pr = S[idx][3]
            away = pc - root
            na = np.linalg.norm(away)
            away = away / na if na > 1e-6 else np.zeros(3)
            for _ in range(nkids):
                d = rdir(away, 1.1)
                r = pr * ratios[li] * np.exp(rng.normal(0, jitter))
                c = pc + d * (pr + r * (protrude * 2 - 1))
                S.append(np.array([*c, r])); level_of.append(li + 2)
                new.append(len(S) - 1)
        frontier = new
    return np.array(S)


def plume_field(seed=4, n=5, extent=(1.8, 1.4), height=(1.3, 2.4), base_r=(0.22, 0.34),
                cap=1.35, sway=0.35, buds=(4, 3), bud_ratio=(0.5, 0.48), protrude=0.5):
    """Rising ink plumes made of lobes: towers that swell into cauliflower caps.

    Seen from low and across, they stack in depth like the hero reference.
    """
    rng = np.random.default_rng(seed)
    out = []
    for i in range(n):
        x = rng.uniform(-extent[0] / 2, extent[0] / 2)
        y = rng.uniform(-extent[1] / 2, extent[1] / 2)
        H = rng.uniform(*height)
        r0 = rng.uniform(*base_r)
        steps = int(H / (r0 * 0.9)) + 2
        ph = rng.uniform(0, 2 * np.pi, 2)
        for k in range(steps):
            u = k / (steps - 1)
            z = -0.9 + u * H
            sx = sway * np.sin(ph[0] + u * 2.6) * u
            sy = sway * np.sin(ph[1] + u * 2.1) * u
            r = r0 * (0.8 + (cap - 0.8) * u ** 2.2)
            out.append([x + sx, y + sy, z, r])
            # buds: smaller lobes around each tower segment, more near the cap
            nb = int(buds[0] * (0.5 + u))
            for b in range(nb):
                d = rng.normal(size=3) + np.array([0, 0, 0.6 * u])
                d /= np.linalg.norm(d)
                rb = r * bud_ratio[0] * np.exp(rng.normal(0, 0.25))
                cb = np.array([x + sx, y + sy, z]) + d * (r + rb * (protrude * 2 - 1))
                out.append([*cb, rb])
                for b2 in range(buds[1] if u > 0.5 else 1):
                    d2 = d + rng.normal(size=3) * 0.8
                    d2 /= np.linalg.norm(d2)
                    r2 = rb * bud_ratio[1] * np.exp(rng.normal(0, 0.25))
                    out.append([*(cb + d2 * (rb + r2 * (protrude * 2 - 1))), r2])
    return np.array(out)


# ----------------------------------------------------------------------------- beads


def surface_cells(shape, h, band):
    """Coarse grid pass: centres of cells that straddle the surface band."""
    lo, hi = shape.bbox()
    n = np.ceil((hi - lo) / h).astype(int)
    xs = [lo[i] + (np.arange(n[i]) + 0.5) * h for i in range(3)]
    G = np.stack(np.meshgrid(*xs, indexing="ij"), -1).reshape(-1, 3)
    d = shape.sdf(G)
    keep = np.abs(d) < band + h * 0.9
    return G[keep], d[keep]


@njit(cache=True)
def _build_hash(P, cell):
    n = P.shape[0]
    keys = np.empty(n, dtype=np.int64)
    for i in range(n):
        ix = int(math.floor(P[i, 0] / cell)) & 1023
        iy = int(math.floor(P[i, 1] / cell)) & 1023
        iz = int(math.floor(P[i, 2] / cell)) & 1023
        keys[i] = (ix << 20) | (iy << 10) | iz
    order = np.argsort(keys)
    return keys, order


@njit(cache=True)
def _lookup(sorted_keys, key):
    lo = np.searchsorted(sorted_keys, key, side="left")
    hi = np.searchsorted(sorted_keys, key, side="right")
    return lo, hi


@njit(parallel=True, cache=True, fastmath=True)
def _relax_step(P, R, cell, sorted_keys, order, strength):
    n = P.shape[0]
    D = np.zeros((n, 3))
    for i in prange(n):
        x = P[i, 0]; y = P[i, 1]; z = P[i, 2]
        cx = int(math.floor(x / cell)); cy = int(math.floor(y / cell)); cz = int(math.floor(z / cell))
        ax = 0.0; ay = 0.0; az = 0.0
        for ox in range(-1, 2):
            for oy in range(-1, 2):
                for oz in range(-1, 2):
                    key = (((cx + ox) & 1023) << 20) | (((cy + oy) & 1023) << 10) | ((cz + oz) & 1023)
                    lo, hi = _lookup(sorted_keys, key)
                    for s in range(lo, hi):
                        j = order[s]
                        if j == i:
                            continue
                        dx = x - P[j, 0]; dy = y - P[j, 1]; dz = z - P[j, 2]
                        dd = dx * dx + dy * dy + dz * dz
                        rr = (R[i] + R[j]) * 0.92
                        if dd < rr * rr and dd > 1e-18:
                            dist = math.sqrt(dd)
                            push = (rr - dist) / dist * 0.5 * strength
                            # big pearls barely move, small beads get out of the way
                            wgt = R[j] / (R[i] + R[j])
                            ax += dx * push * wgt * 2.0
                            ay += dy * push * wgt * 2.0
                            az += dz * push * wgt * 2.0
        D[i, 0] = ax; D[i, 1] = ay; D[i, 2] = az
    return D


def relax(P, R, iters=3, strength=0.8):
    P = P.copy()
    cell = float(2.0 * R.max() * 0.92)
    for _ in range(iters):
        keys, order = _build_hash(P, cell)
        sk = keys[order]
        P += _relax_step(P, R, cell, sk, order, strength)
    return P


def sample_beads(shape, n, r_small=0.0042, r_big=0.016, shell=0.05, fringe=0.10,
                 stray=0.035, pearl_patch=0.22, seed=11, h=0.05, relax_iters=3,
                 size_freq=1.6, size_sigma=0.28, big_base=0.02, big_patch=0.55):
    """Pack ~n beads into the outer shell of the mass.

    Returns dict(P positions (N,3), R radii (N,), depth (N,), t colour param (N,)).
    """
    rng = np.random.default_rng(seed)
    cells, _ = surface_cells(shape, h, shell + fringe)
    out_P = []; out_d = []
    need = n
    batch = max(2_000_000, n * 3)
    tries = 0
    while need > 0 and tries < 40:
        tries += 1
        idx = rng.integers(0, len(cells), batch)
        P = cells[idx] + rng.uniform(-0.5 * h, 0.5 * h, (batch, 3))
        d = shape.sdf(P)
        u = rng.random(batch)
        inside = (d <= 0.0) & (d > -shell)
        # density falls off with depth (deep beads are hidden anyway)
        p_in = np.exp(d / (shell * 0.55))
        acc = inside & (u < p_in)
        # strays: a sparse halo of loose beads past the surface, like the refs
        out = (d > 0.0) & (d < fringe) & (u < stray * np.exp(-d / (fringe * 0.35)))
        k = acc | out
        out_P.append(P[k]); out_d.append(d[k])
        need -= int(k.sum())
    P = np.concatenate(out_P)[:n]
    d = np.concatenate(out_d)[:n]

    # bead size: lognormal around r_small, with low-frequency "pearl patches"
    # where big pale beads clump (the light streaks in Expected Flurries)
    from .noise import fbm_v
    patch = fbm_v(P, size_freq, 3, np.array([4.2, -1.3, 8.8]), PERM)
    patch = np.clip((patch - (0.5 - pearl_patch)) / 0.3 + 0.5, 0, 1) if pearl_patch > 0 else np.zeros(len(P))
    big = rng.random(len(P)) < (big_base + big_patch * patch ** 2.0)
    R = r_small * np.exp(rng.normal(0, size_sigma, len(P)))
    R[big] = r_big * np.exp(rng.normal(0, size_sigma * 0.8, big.sum()))
    # strays are small
    R[d > 0] *= 0.8
    if relax_iters:
        P = relax(P, R, iters=relax_iters)
    depth = np.clip(-d / shell, 0, 1)
    expo = exposure(shape, P)
    tone = fbm_v(P, 2.4, 3, np.array([-7.7, 2.2, 0.4]), PERM)
    B = dict(P=P, R=R, depth=depth, d=d, big=big.astype(np.float32), expo=expo, tone=tone,
             patch=patch)
    B["t"] = bead_tone(B, rng)
    return B


def exposure(shape, P, delta=0.14):
    """0 in a cleft, 1 on an open crest: SDF probed one step out along the normal.

    Drives the albedo so folds sit in wine-dark shadow and crests go pearl,
    exactly the value structure of the reference stills.
    """
    G = shape.grad(P)
    n = G / (np.linalg.norm(G, axis=1, keepdims=True) + 1e-9)
    d0 = shape.sdf(P)
    d1 = shape.sdf(P + n * delta)
    d2 = shape.sdf(P + n * delta * 2.5)
    e = 0.5 * np.clip((d1 - d0) / delta, 0, 1) + 0.5 * np.clip((d2 - d0) / (delta * 2.5), 0, 1)
    return e


def bead_tone(B, rng=None, base=0.16, k_expo=0.42, k_tone=0.30, k_big=0.22, k_depth=0.12,
              jitter=0.07):
    rng = rng or np.random.default_rng(0)
    t = (base + k_expo * B["expo"] ** 1.3 + k_tone * B["tone"] + k_big * B["big"]
         - k_depth * B["depth"] + rng.normal(0, jitter, len(B["P"])))
    return np.clip(t, 0.0, 1.0)


def bead_albedo(t, sat=1.12, lift=-0.08):
    return palette.albedo(t, lift=lift, sat=sat)

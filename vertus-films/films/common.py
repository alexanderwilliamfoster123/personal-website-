"""Shared building blocks for every Vertus film: forms, bead states, fibres, gel,
tissue, the thought-pulse, and one renderer that turns a scene spec into a frame.

A scene spec is a plain dict, so storyboard keyframes and final animation frames
come out of the same code path (the films evaluate specs at time t).
"""
import os
import sys
import time
import hashlib
import json

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from engine import mass as M  # noqa: E402
from engine import palette  # noqa: E402
from engine.noise import curl_v, fbm_v, PERM  # noqa: E402

CACHE = os.environ.get("VTX_CACHE", "/opt/vtx/out/cache")
os.makedirs(CACHE, exist_ok=True)

# ----------------------------------------------------------------------------- canonical forms

# The Vertus mass. Cauliflower lobes + slow ink warp: the shape every film returns to.
HERO_FORM = dict(seed=2, base_r=0.5, arms=5, levels=(4, 4, 3), ratios=(0.55, 0.5, 0.45), protrude=0.5,
                 bias=(0, 0, 0.2), k=0.3, warp_amp=0.35, warp_freq=0.45, bump_amp=0.05, bump_freq=3.0)
# Macro plume field: bead towers in depth (the hero still's world).
PLUME_FORM = dict(seed=11, n=7, extent=(2.8, 2.2), height=(0.9, 2.7), base_r=(0.15, 0.25), cap=1.6,
                  k=0.3, warp_amp=0.22, warp_freq=0.55, bump_amp=0.025, bump_freq=4.0)
BEADS_HERO = dict(r_small=0.0085, r_big=0.0125, shell=0.075, fringe=0.12, stray=0.025, size_sigma=0.13,
                  big_base=0.01, big_patch=0.3)
BEADS_MACRO = dict(r_small=0.0105, r_big=0.0145, shell=0.08, fringe=0.12, stray=0.025, size_sigma=0.12,
                   big_base=0.01, big_patch=0.3)
TONE = dict(base=0.2, k_expo=0.28, k_tone=0.12, k_big=0.15, k_depth=0.1)


def shape_from(form, **over):
    f = dict(form, **over)
    if "n" in f and "extent" in f:
        L = M.plume_field(seed=f["seed"], n=f["n"], extent=f["extent"], height=f["height"],
                          base_r=f["base_r"], cap=f["cap"])
    else:
        L = M.cauliflower(seed=f["seed"], base_r=f["base_r"], arms=f["arms"], levels=f["levels"],
                          ratios=f["ratios"], protrude=f["protrude"], bias=f["bias"])
    L = L.copy()
    s = f.get("scale", 1.0)
    L[:, :4] *= s
    L[:, :3] += np.asarray(f.get("offset", (0, 0, 0)))
    return M.MassShape(L, k=f["k"], warp_amp=f["warp_amp"] * s, warp_freq=f["warp_freq"] / s,
                       t=f.get("t", 0.0), bump_amp=f["bump_amp"] * s, bump_freq=f["bump_freq"] / s,
                       fold_amp=f.get("fold_amp", 0.0) * s, fold_freq=f.get("fold_freq", 6.0) / s)


def beads(form, n, bead_kw=None, **over):
    """Cached bead skin for a form (sampling 1M beads costs ~1 min, reuse it)."""
    bead_kw = dict(BEADS_HERO if bead_kw is None else bead_kw)
    key = hashlib.md5(json.dumps([form, over, bead_kw, n], sort_keys=True, default=str).encode()).hexdigest()[:12]
    path = f"{CACHE}/b_{key}.npz"
    if os.path.exists(path):
        return dict(np.load(path))
    shape = shape_from(form, **over)
    B = M.sample_beads(shape, n, relax_iters=3, **bead_kw)
    np.savez(path, **B)
    return B


def tone_cols(B, rng=None, **tone):
    t = M.bead_tone(B, rng or np.random.default_rng(1), **dict(TONE, **tone))
    return palette.albedo(t), t


def fixed_cols(n, t_center, spread=0.06, seed=0):
    rng = np.random.default_rng(seed)
    return palette.albedo(np.clip(t_center + rng.normal(0, spread, n), 0, 1))


# ----------------------------------------------------------------------------- bead states


def sunflower(n, c=0.012, tilt=0.6, thickness=0.12, seed=0, r0=0.03, r1=0.008):
    """Phyllotaxis division: bead k at golden angle k*137.5deg, radius c*sqrt(k)."""
    rng = np.random.default_rng(seed)
    k = np.arange(n)
    ang = k * np.deg2rad(137.50776)
    rad = c * np.sqrt(k + 0.5)
    x = rad * np.cos(ang); y = rad * np.sin(ang)
    z = rng.normal(0, 1, n) * thickness * rad * 0.35 + 0.15 * rad ** 2
    P = np.stack([x, y, z], 1)
    ct, st = np.cos(tilt), np.sin(tilt)
    P = P @ np.array([[1, 0, 0], [0, ct, -st], [0, st, ct]]).T
    u = k / max(n - 1, 1)
    R = (r0 * (1 - u) + r1 * u) * np.exp(rng.normal(0, 0.08, n))
    return P, R, u


def stream_beads(n_streams=60, steps=420, dt=0.012, seed=3, radius=1.15, swirl=1.1, pull=0.9,
                 freq=0.9, tube=0.035, per_point=3, r=0.0085, t=0.0, center=(0, 0, 0)):
    """Flocking: beads riding braided streamlines of a swirling divergence-free field."""
    rng = np.random.default_rng(seed)
    c = np.asarray(center, float)
    d = rng.normal(size=(n_streams, 3)); d /= np.linalg.norm(d, axis=1, keepdims=True)
    X = c + d * radius * rng.uniform(0.9, 1.4, (n_streams, 1))
    paths = np.empty((steps, n_streams, 3))
    for s in range(steps):
        paths[s] = X
        rel = X - c
        dist = np.linalg.norm(rel, axis=1, keepdims=True) + 1e-6
        tang = np.cross(np.array([0.15, 0.25, 1.0]), rel); tang /= np.linalg.norm(tang, axis=1, keepdims=True) + 1e-9
        v = curl_v(X * 1.0, freq, 2, t + s * dt * 0.3, PERM) * 0.8 + tang * swirl - rel / dist * pull * (dist - 0.55)
        X = X + v * dt
    pts = paths.reshape(-1, 3)
    along = np.repeat(np.linspace(0, 1, steps), n_streams)
    P = np.repeat(pts, per_point, 0) + rng.normal(0, tube, (len(pts) * per_point, 3))
    u = np.repeat(along, per_point)
    R = r * np.exp(rng.normal(0, 0.15, len(P)))
    return P, R, u


def cloud(form_seed, center, scale, n, tone_t, spread=0.07, bead_r=0.009, seed=0):
    """A small cauliflower cloud of beads with a fixed tone (for Confluence)."""
    form = dict(HERO_FORM, seed=form_seed, levels=(4, 3), arms=4)
    B = beads(form, n, dict(BEADS_HERO, r_small=bead_r / scale, r_big=bead_r * 1.4 / scale, shell=0.12,
                            stray=0.05, fringe=0.2))
    P = B["P"] * scale + np.asarray(center)
    R = B["R"] * scale
    return P, R, fixed_cols(len(P), tone_t, spread, seed), B


def advect(P, steps, dt, freq=0.8, t0=0.0, amp=1.0, weight=None, drift=None):
    P = P.copy()
    for s in range(steps):
        v = curl_v(P, freq, 2, t0 + s * dt, PERM) * amp
        if drift is not None:
            v = v + drift
        if weight is not None:
            v = v * weight(P)[:, None]
        P += v * dt
    return P


def helix(n, turns=2.6, radius=0.55, height=2.6, tube=0.13, phase=0.0, seed=0, r=0.0095,
          center=(0, 0, 0), taper=0.35):
    """One strand of the Expected Flurries helix: a bead tube wound around z."""
    rng = np.random.default_rng(seed)
    s = rng.random(n)
    a = phase + s * turns * 2 * np.pi
    rad = radius * (1 - taper * (np.abs(s - 0.5) * 2) ** 2)
    cx = rad * np.cos(a); cy = rad * np.sin(a); cz = (s - 0.5) * height
    # tube cross-section, denser in the core, frayed at the edge
    q = rng.normal(size=(n, 3)); q /= np.linalg.norm(q, axis=1, keepdims=True)
    rr = tube * (rng.random(n) ** 0.85) * (0.7 + 0.9 * fbm_v(np.stack([cx, cy, cz], 1), 2.6, 3, np.array([1.0, 2, 3]), PERM))
    rr = rr * np.where(rng.random(n) < 0.06, 1.0 + rng.random(n) * 1.2, 1.0)  # loose strays at the edge
    P = np.stack([cx, cy, cz], 1) + q * rr[:, None] + np.asarray(center)
    R = r * np.exp(rng.normal(0, 0.18, n))
    edge = rr / tube
    return P, R, s, edge


# ----------------------------------------------------------------------------- fibres


def strand_fibers(centerline, n_fibers=120, radius=0.03, twist=6.0, fray_start=0.75, fray=0.25,
                  seed=0, samples=None, r_fiber=0.0012, curl_amp=0.03, flyaway=0.06):
    """A twisted strand of fibres around a centerline, fraying open past fray_start.

    centerline (S,3). Returns pts (F,S,3), radii (F,S).
    """
    rng = np.random.default_rng(seed)
    C = np.asarray(centerline, float)
    S = len(C)
    T = np.gradient(C, axis=0); T /= np.linalg.norm(T, axis=1, keepdims=True) + 1e-9
    ref = np.array([0.0, 0.0, 1.0])
    N = np.cross(T, ref)
    bad = np.linalg.norm(N, axis=1) < 1e-3
    N[bad] = np.cross(T[bad], np.array([1.0, 0, 0]))
    N /= np.linalg.norm(N, axis=1, keepdims=True)
    Bv = np.cross(T, N)
    u = np.linspace(0, 1, S)
    pts = np.empty((n_fibers, S, 3))
    for f in range(n_fibers):
        r0 = radius * np.sqrt(rng.random())
        ph = rng.uniform(0, 2 * np.pi)
        ang = ph + u * twist * 2 * np.pi
        fr = np.clip((u - fray_start) / max(1 - fray_start, 1e-3), 0, 1) ** 1.5
        rr = r0 + fr * fray * rng.uniform(0.3, 1.0)
        off = N * (rr * np.cos(ang))[:, None] + Bv * (rr * np.sin(ang))[:, None]
        jitter = rng.normal(0, 1, (S, 3)).cumsum(0) * curl_amp * 0.02 * fr[:, None]
        if rng.random() < flyaway:
            # a loose fibre lifting off the strand partway along it
            u0 = rng.uniform(0.1, 0.8)
            lift = np.clip((u - u0) / 0.25, 0, 1) ** 1.4 * rng.uniform(0.02, 0.07)
            dirn = rng.normal(size=3); dirn /= np.linalg.norm(dirn)
            jitter = jitter + lift[:, None] * dirn[None, :]
        pts[f] = C + off + jitter
    radii = np.full((n_fibers, S), r_fiber) * (1 - 0.6 * np.linspace(0, 1, S) ** 4)[None, :]
    return pts, radii


def fur(P, normals, length=0.06, seg=8, curl=0.25, seed=0, r_fiber=0.0011, t=0.0):
    """Fur grown along surface normals with a curl-noise lean (the fuzzy state)."""
    rng = np.random.default_rng(seed)
    n = len(P)
    L = length * np.exp(rng.normal(0, 0.25, n))
    pts = np.empty((n, seg, 3))
    X = P.copy()
    d = normals + rng.normal(0, 0.25, (n, 3))
    d /= np.linalg.norm(d, axis=1, keepdims=True)
    for s in range(seg):
        pts[:, s] = X
        lean = curl_v(X, 3.0, 1, t, PERM)
        d = d + lean * curl * 0.35
        d /= np.linalg.norm(d, axis=1, keepdims=True)
        X = X + d * (L / (seg - 1))[:, None]
    u = np.linspace(0, 1, seg)
    radii = r_fiber * (1 - 0.7 * u ** 2)[None, :].repeat(n, 0)
    return pts, radii


# ----------------------------------------------------------------------------- gel + tissue


def iso_mesh(sdf, lo, hi, res=160, level=0.0):
    from skimage.measure import marching_cubes
    lo = np.asarray(lo, float); hi = np.asarray(hi, float)
    h = (hi - lo).max() / res
    n = np.ceil((hi - lo) / h).astype(int) + 1
    xs = [lo[i] + np.arange(n[i]) * h for i in range(3)]
    G = np.stack(np.meshgrid(*xs, indexing="ij"), -1).reshape(-1, 3)
    d = sdf(G).reshape(n)
    V, F, Nn, _ = marching_cubes(d, level, spacing=(h, h, h))
    # skimage already winds faces outward for negative-inside fields
    return V + lo, F


def tube_sdf(curve, radius):
    """SDF of a variable-radius tube along a polyline (for gel knots)."""
    from scipy.spatial import cKDTree
    C = np.asarray(curve, float)
    dense = np.concatenate([np.linspace(C[i], C[i + 1], 6, endpoint=False) for i in range(len(C) - 1)] + [C[-1:]])
    rad = np.interp(np.linspace(0, 1, len(dense)), np.linspace(0, 1, len(C)),
                    radius if np.ndim(radius) else np.full(len(C), radius))
    tree = cKDTree(dense)

    def f(P):
        d, i = tree.query(P, k=1)
        return d - rad[i]
    return f


def bubbles_in(sdf, lo, hi, n, r=(0.004, 0.03), seed=0, margin=0.01):
    rng = np.random.default_rng(seed)
    lo = np.asarray(lo); hi = np.asarray(hi)
    P = lo + rng.random((n * 20, 3)) * (hi - lo)
    d = sdf(P)
    rr = r[0] * np.exp(rng.random(len(P)) * np.log(r[1] / r[0]))
    ok = d < -(rr + margin)
    P, rr = P[ok][:n], rr[ok][:n]
    return P, rr


# ----------------------------------------------------------------------------- pulse


def pulse_glow(P, origin, radius, width=0.12, tail=0.5):
    """Thought-pulse: a luminous shell expanding from origin (emission attribute)."""
    d = np.linalg.norm(P - np.asarray(origin), axis=1)
    x = (d - radius) / width
    g = np.where(x > 0, np.exp(-x * x * 4), np.exp(-(x / (1 + tail * 8)) ** 2))
    return np.clip(g, 0, 1)


# ----------------------------------------------------------------------------- render


def render_spec(spec, out_png, res=(540, 960), spp=64, threshold=0.03, finish=True, seed=0):
    """Build the Blender scene for a spec and render it. Returns (path, seconds)."""
    from engine import bl, post
    t0 = time.time()
    bl.reset()
    L = spec.get("lights", {})
    bl.setup_render(res=res, spp=spp, threshold=threshold, view=spec.get("view", "Standard"),
                    exposure=spec.get("exposure", 0.0), bounces=spec.get("bounces", (3, 3, 10, 8)))
    bl.world_studio(strength=L.get("world", 0.06), flags=L.get("flags", False))
    bl.studio_lights(center=tuple(L.get("center", (0, 0, 0))), key=L.get("key", 1.0), rim=L.get("rim", 1.0),
                     top=L.get("top", 0.0), kick=L.get("kick", 0.0), scale=L.get("scale", 1.0),
                     key_dir=tuple(L.get("key_dir", (-0.45, -0.35, 0.82))),
                     rim_dir=tuple(L.get("rim_dir", (0.45, 0.75, 0.35))))
    for j, (loc, energy, color, radius) in enumerate(L.get("points", [])):
        bl.point_light(f"pt{j}", loc, energy, color, radius)
    mats = {}
    for i, it in enumerate(spec["items"]):
        k = it["kind"]
        mk = json.dumps([k, it.get("mat", {})], sort_keys=True)
        if mk not in mats:
            mp = it.get("mat", {})
            mats[mk] = {"beads": bl.mat_beads, "fiber": bl.mat_fiber, "gel": bl.mat_gel,
                        "bubble": bl.mat_bubble, "tissue": bl.mat_tissue}[it.get("shader", k)](**mp)
        m = mats[mk]
        if k == "beads":
            attrs = {"glow": it["glow"]} if it.get("glow") is not None else None
            bl.pointcloud(f"b{i}", it["P"], it["R"], cols=np.clip(it["col"], 0, 1), mat=m, attrs=attrs)
        elif k == "bubble":
            bl.pointcloud(f"bb{i}", it["P"], it["R"], mat=m)
        elif k == "fiber":
            bl.curves(f"c{i}", it["pts"], it["radii"], cols=np.clip(it["col"], 0, 1), mat=m)
        elif k in ("gel", "tissue"):
            bl.mesh(f"m{i}", it["V"], it["F"], mat=m, cols=it.get("col"))
    cam = spec["camera"]
    bl.camera(tuple(cam["loc"]), tuple(cam["target"]), lens=cam.get("lens", 70), fstop=cam.get("fstop", 2.0),
              focus=cam.get("focus"))
    raw = out_png.replace(".png", "_raw.png")
    bl.render(raw)
    if finish:
        post.finish(raw, out_png, seed=seed)
    return out_png, time.time() - t0

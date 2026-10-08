"""Storyboards for the Vertus flagship film series.

Each film lists its beats; each beat has a timecode, notes, and `build()` that
returns a scene spec for that moment, rendered by films.common.render_spec.
"""
import numpy as np

from films.common import (HERO_FORM, PLUME_FORM, BEADS_HERO, BEADS_MACRO, shape_from, beads, tone_cols,
                          fixed_cols, sunflower, stream_beads, cloud, advect, helix, strand_fibers, fur,
                          iso_mesh, tube_sdf, bubbles_in, pulse_glow, palette)
from engine.noise import fbm_v, curl_v, PERM

N_HERO = 900_000
N_MACRO = 700_000

BEAD_MAT = dict(sss=0.5, sss_scale=0.01, rough=0.5, coat=0.0, sheen=0.22)
FIBER_MAT = dict(rough=0.32, radial=0.4)
HERO_LIGHT = dict(world=0.06, key=1.15, rim=1.0, key_dir=(-0.45, -0.35, 0.82), rim_dir=(0.45, 0.75, 0.35))


def hero():
    B = beads(HERO_FORM, N_HERO, BEADS_HERO)
    col, t = tone_cols(B)
    return B, col, t


def hero_normals(B):
    shape = shape_from(HERO_FORM)
    G = shape.grad(B["P"])
    return G / (np.linalg.norm(G, axis=1, keepdims=True) + 1e-9)


HERO_C = np.array([0.03, -0.19, 0.16])


def cam_wide(dist=7.2, lens=62, fstop=1.8, up=1.1, side=0.6, aim=(0, 0, -0.05), c=None):
    c = HERO_C if c is None else np.asarray(c)
    return dict(loc=(c[0] + side, c[1] - dist, c[2] + up), target=tuple(c + np.asarray(aim)), lens=lens, fstop=fstop)


def bead_item(P, R, col, glow=None, mat=None):
    return dict(kind="beads", P=P, R=R, col=col, glow=glow, mat=mat or BEAD_MAT)


# ============================================================================= 01 ORIGIN


def f01_seed():
    P = np.array([[-0.016, 0, 0], [0.016, 0, 0.0], [0.0, 0.0, 0.0]])
    R = np.array([0.03, 0.03, 0.02])
    # three daughter beads just budding at the seam
    P = np.concatenate([P, [[0.0, -0.024, 0.017], [0.003, -0.026, -0.013], [-0.002, 0.027, 0.004]]])
    R = np.concatenate([R, [0.0065, 0.005, 0.0055]])
    col = palette.albedo(np.array([0.7, 0.7, 0.8, 0.5, 0.48, 0.52]))
    glow = np.array([0.04, 0.04, 0.5, 0.2, 0.2, 0.2])
    return dict(items=[bead_item(P, R, col, glow)],
                camera=dict(loc=(0.08, -0.62, 0.12), target=(0, 0, 0.0), lens=100, fstop=8.0),
                lights=dict(world=0.08, key=1.0, rim=0.8, scale=0.25, key_dir=(-0.5, -0.4, 0.75)))


def f01_division():
    P, R, u = sunflower(2600, c=0.0125, tilt=0.62, thickness=0.05, r0=0.0118, r1=0.0098, seed=2)
    col = palette.albedo(np.clip(0.78 - 0.5 * u ** 0.7 + np.random.default_rng(0).normal(0, 0.05, len(u)), 0, 1))
    glow = np.clip(1 - u * 8, 0, 1) * 0.3
    return dict(items=[bead_item(P, R, col, glow)],
                camera=dict(loc=(0.0, -5.6, 2.2), target=(0, 0, 0.0), lens=85, fstop=5.6),
                lights=dict(HERO_LIGHT, scale=0.5))


def f01_flock():
    P, R, u = stream_beads(n_streams=26, steps=720, dt=0.009, seed=5, per_point=5, tube=0.016, r=0.0085)
    t = np.clip(0.25 + 0.5 * u + np.random.default_rng(1).normal(0, 0.08, len(u)), 0, 1)
    return dict(items=[bead_item(P, R, palette.albedo(t))],
                camera=dict(loc=(0.7, -4.0, 0.6), target=(0.0, 0.0, 0.0), lens=50, fstop=2.8, focus=3.3),
                lights=HERO_LIGHT)


def f01_fold():
    B, col, t = hero()
    Nrm = hero_normals(B)
    P = B["P"]
    z = P[:, 2]
    tau = (z - z.min()) / (z.max() - z.min()) + 0.18 * fbm_v(P, 1.4, 2, np.array([3.0, 1, 2]), PERM)
    front = 0.62
    placed = tau < front
    flying = (tau >= front) & (tau < front + 0.22) & (np.random.default_rng(7).random(len(P)) < 0.35)
    lag = (tau[flying] - front) / 0.22
    sw = curl_v(P[flying], 1.2, 2, 0.0, PERM)
    Pf = P[flying] + Nrm[flying] * (lag[:, None] ** 1.5) * 1.1 + sw * lag[:, None] * 0.5
    glow = np.exp(-((tau - front) / 0.03) ** 2) * 0.3
    items = [bead_item(P[placed], B["R"][placed], col[placed], glow[placed]),
             bead_item(Pf, B["R"][flying] * (1 - 0.3 * lag), palette.albedo(np.full(flying.sum(), 0.7)),
                       glow[flying] * 0.5)]
    return dict(items=items, camera=cam_wide(dist=6.2, up=0.55, side=1.3, lens=55, fstop=2.2, aim=(0, 0, 0.15)),
                lights=HERO_LIGHT)


def f01_wake():
    B, col, t = hero()
    glow = pulse_glow(B["P"], origin=(-0.7, -0.5, 0.5), radius=0.85, width=0.06, tail=0.05) * 0.32
    return dict(items=[bead_item(B["P"], B["R"], col, glow)], camera=cam_wide(), lights=HERO_LIGHT)


def f01_name():
    B, col, t = hero()
    return dict(items=[bead_item(B["P"], B["R"], col)],
                camera=cam_wide(dist=9.2, lens=62, fstop=2.8, up=1.0, aim=(0, 0, -0.55)), lights=HERO_LIGHT,
                endcard=dict(tagline="A mind for high-stakes decisions.", mark_y=0.70))


# ============================================================================= 02 CONFLUENCE

WINE, PEARL = 0.13, 0.9


def f02_sources():
    Pa, Ra, Ca, _ = cloud(21, (-0.62, 0, 0.95), 0.62, 380_000, WINE, seed=1)
    Pb, Rb, Cb, _ = cloud(34, (0.42, 0.3, -0.95), 0.62, 380_000, PEARL, seed=2)
    return dict(items=[bead_item(Pa, Ra, Ca), bead_item(Pb, Rb, Cb)],
                camera=dict(loc=(0.2, -6.4, 0.2), target=(-0.05, 0, 0), lens=50, fstop=2.8), lights=HERO_LIGHT)


def _swirl(P, theta0=2.6, core=0.75, axis=(0.0, 1.0, 0.0)):
    a = np.asarray(axis, float); a /= np.linalg.norm(a)
    r_vec = P - np.outer(P @ a, a)
    r = np.linalg.norm(r_vec, axis=1)
    th = theta0 * np.exp(-(r / core) ** 2)
    c, s_ = np.cos(th)[:, None], np.sin(th)[:, None]
    return P * c + np.cross(a, P) * s_ + np.outer(P @ a, a) * (1 - c)


def _contact(drift_scale=1.0, steps=40):
    Pa, Ra, Ca, _ = cloud(21, (-0.36, 0, 0.36), 0.62, 380_000, WINE, seed=1)
    Pb, Rb, Cb, _ = cloud(34, (0.36, 0.2, -0.36), 0.62, 380_000, PEARL, seed=2)
    Pa = _swirl(Pa); Pb = _swirl(Pb)
    wgt = lambda P: np.exp(-(np.linalg.norm(P, axis=1) / 0.9) ** 2) * 0.8 + 0.1
    Pa = advect(Pa, steps // 2, 0.012, freq=0.75, amp=0.7 * drift_scale, weight=wgt, t0=0.0)
    Pb = advect(Pb, steps // 2, 0.012, freq=0.75, amp=0.7 * drift_scale, weight=wgt, t0=0.0)
    return Pa, Ra, Ca, Pb, Rb, Cb


def f02_contact():
    Pa, Ra, Ca, Pb, Rb, Cb = _contact()
    return dict(items=[bead_item(Pa, Ra, Ca), bead_item(Pb, Rb, Cb)],
                camera=dict(loc=(0.6, -5.6, 0.25), target=(0, 0, 0), lens=55, fstop=2.4), lights=HERO_LIGHT)


def f02_braid():
    Pa, Ra, sa, ea = helix(240_000, turns=2.2, radius=0.6, height=3.0, tube=0.21, phase=0.0, seed=1)
    Pb, Rb, sb, eb = helix(240_000, turns=2.2, radius=0.6, height=3.0, tube=0.21, phase=np.pi, seed=2)
    return dict(items=[bead_item(Pa, Ra, fixed_cols(len(Pa), WINE, 0.05, 1)),
                       bead_item(Pb, Rb, fixed_cols(len(Pb), PEARL, 0.04, 2))],
                camera=dict(loc=(0.9, -5.0, -1.1), target=(0, 0, 0.15), lens=50, fstop=2.2), lights=HERO_LIGHT)


def f02_resolve():
    B, col, t = hero()
    n = len(B["P"])
    rng = np.random.default_rng(3)
    home = rng.random(n) < 0.8
    m = int((~home).sum())
    Pa, Ra, sa, ea = helix(m // 2, turns=1.7, radius=1.05, height=2.6, tube=0.12, phase=0.4, seed=5,
                           center=HERO_C)
    Pb, Rb, sb, eb = helix(m - m // 2, turns=1.7, radius=1.05, height=2.6, tube=0.12, phase=0.4 + np.pi, seed=6,
                           center=HERO_C)
    items = [bead_item(B["P"][home], B["R"][home], col[home]),
             bead_item(Pa, Ra, fixed_cols(len(Pa), WINE, 0.05, 1)),
             bead_item(Pb, Rb, fixed_cols(len(Pb), PEARL, 0.04, 2))]
    return dict(items=items, camera=cam_wide(dist=8.4), lights=HERO_LIGHT)


def f02_answer():
    B, col, t = hero()
    return dict(items=[bead_item(B["P"], B["R"], col)],
                camera=cam_wide(dist=9.2, lens=62, fstop=2.8, up=1.0, aim=(0, 0, -0.55)), lights=HERO_LIGHT,
                endcard=dict(tagline="Every source. One answer.", mark_y=0.70))


# ============================================================================= 03 RESOLVE


def _strand_lines(n, length, seed, center=(0, 0, 0), spread=0.8, steps=90):
    rng = np.random.default_rng(seed)
    lines = []
    for i in range(n):
        x0 = np.asarray(center) + rng.normal(0, spread, 3) * np.array([1, 0.5, 1])
        d = rng.normal(size=3); d /= np.linalg.norm(d)
        X = x0.copy(); pts = []
        for s in range(steps):
            pts.append(X.copy())
            v = curl_v(X[None], 0.9, 2, i * 0.37, PERM)[0] * 0.6 + d * 0.8
            X = X + v / np.linalg.norm(v) * (length / steps)
        lines.append(np.array(pts))
    return lines


def _fiber_items(lines, fibers=140, radius=0.028, twist=3.0, fray_start=0.72, fray=0.16, seed=0,
                 t_range=(0.28, 0.62), r_fiber=0.0011, flyaway=0.06):
    rng = np.random.default_rng(seed)
    allp, allr, allc = [], [], []
    for i, C in enumerate(lines):
        pts, rad = strand_fibers(C, n_fibers=fibers, radius=radius, twist=twist, fray_start=fray_start,
                                 fray=fray, seed=seed * 100 + i, r_fiber=r_fiber, flyaway=flyaway)
        allp.append(pts); allr.append(rad)
        tc = rng.uniform(*t_range)
        allc.append(palette.albedo(np.clip(tc + rng.normal(0, 0.06, fibers), 0, 1)))
    return dict(kind="fiber", pts=np.concatenate(allp), radii=np.concatenate(allr), col=np.concatenate(allc),
                mat=FIBER_MAT)


def f03_tension():
    lines = _strand_lines(9, 1.5, seed=7, spread=0.42)
    return dict(items=[_fiber_items(lines, fibers=300, radius=0.042, twist=9.0, fray_start=0.68, fray=0.3, seed=1,
                                    r_fiber=0.0013, flyaway=0.08)],
                camera=dict(loc=(0.15, -2.0, 0.1), target=(0, 0, 0.1), lens=70, fstop=4.0, focus=1.8),
                lights=dict(HERO_LIGHT, scale=0.6))


def _cord(path, n_strands=7, strand_r=0.045, cord_twist=4.0, unravel=None):
    C = np.asarray(path, float)
    S = len(C)
    T = np.gradient(C, axis=0); T /= np.linalg.norm(T, axis=1, keepdims=True)
    N = np.cross(T, np.array([0, 0, 1.0]))
    bad = np.linalg.norm(N, axis=1) < 1e-3
    N[bad] = np.cross(T[bad], np.array([1.0, 0, 0]))
    N /= np.linalg.norm(N, axis=1, keepdims=True)
    Bv = np.cross(T, N)
    u = np.linspace(0, 1, S)
    lines = []
    for k in range(n_strands):
        ang = k / n_strands * 2 * np.pi + u * cord_twist * 2 * np.pi
        rr = strand_r * np.ones(S)
        if unravel is not None:
            rr = rr + np.clip((u - unravel) / (1 - unravel), 0, 1) ** 2 * 0.35
        lines.append(C + N * (rr * np.cos(ang))[:, None] + Bv * (rr * np.sin(ang))[:, None])
    return lines


def f03_twist():
    z = np.linspace(-1.1, 1.1, 260)
    path = np.stack([0.08 * np.sin(z * 1.7), 0.05 * np.cos(z * 1.3), z], 1)
    lines = _cord(path, n_strands=7, strand_r=0.05, cord_twist=2.6, unravel=0.62)
    return dict(items=[_fiber_items(lines, fibers=130, radius=0.03, twist=-3.5, fray_start=0.9, fray=0.12, seed=2)],
                camera=dict(loc=(0.5, -2.4, -0.55), target=(0, 0, 0.15), lens=70, fstop=2.8),
                lights=dict(HERO_LIGHT, scale=0.6))


def _rosette(turns=2.6, r0=0.08, r1=0.75, S=900, lift=0.25):
    th = np.linspace(0, turns * 2 * np.pi, S)
    r = r0 + (r1 - r0) * th / th[-1]
    return np.stack([r * np.cos(th), r * np.sin(th), lift * np.sin(th * 0.5) * (th / th[-1]) - 0.1 * (th / th[-1]) ** 2], 1)


def f03_coil():
    path = _rosette()
    lines = _cord(path, n_strands=7, strand_r=0.05, cord_twist=14.0)
    return dict(items=[_fiber_items(lines, fibers=110, radius=0.03, twist=-18.0, fray_start=0.97, fray=0.1, seed=3)],
                camera=dict(loc=(0.4, -1.9, 1.9), target=(0, 0, -0.02), lens=50, fstop=2.4),
                lights=dict(HERO_LIGHT, scale=0.6))


GEL_MAT = dict(color=(1.0, 0.24, 0.5), density=8.0, ior=1.42, rough=0.015)


def _gel_rosette(frac=1.0):
    path = _rosette()
    m = int(len(path) * frac)
    sub = path[:max(m, 8)]
    rad = np.full(len(sub), 0.115)
    rad[-30:] *= np.linspace(1, 0.6, 30) if frac < 1 else 1
    f = tube_sdf(sub, rad)
    lo = sub.min(0) - 0.2; hi = sub.max(0) + 0.2
    V, F = iso_mesh(f, lo, hi, res=220)
    Pb, Rb = bubbles_in(f, lo, hi, 900, r=(0.004, 0.022), seed=4)
    return path, V, F, Pb, Rb


def f03_lock():
    path, V, F, Pb, Rb = _gel_rosette(0.55)
    m = int(len(path) * 0.55)
    lines = _cord(path[m - 20:], n_strands=7, strand_r=0.05, cord_twist=14.0 * 0.45)
    return dict(items=[dict(kind="gel", V=V, F=F, mat=GEL_MAT), dict(kind="bubble", P=Pb, R=Rb, mat={}),
                       _fiber_items(lines, fibers=110, radius=0.03, twist=-8.0, fray_start=0.97, fray=0.1, seed=3)],
                camera=dict(loc=(0.4, -1.9, 1.9), target=(0, 0, -0.02), lens=50, fstop=2.4),
                lights=dict(HERO_LIGHT, scale=0.6, world=0.12, flags=True), bounces=(3, 4, 16, 8))


def f03_clarity():
    path, V, F, Pb, Rb = _gel_rosette(1.0)
    return dict(items=[dict(kind="gel", V=V, F=F, mat=GEL_MAT), dict(kind="bubble", P=Pb, R=Rb, mat={})],
                camera=dict(loc=(1.5, -2.7, 1.75), target=(0, 0, -0.42), lens=55, fstop=3.5),
                lights=dict(HERO_LIGHT, scale=0.6, world=0.14, flags=True), bounces=(3, 4, 16, 8),
                endcard=dict(tagline="Decide with conviction.", mark_y=0.74, mark_width=0.36))


# ============================================================================= 04 STATES

MACRO_CAM = dict(loc=(1.4, -4.4, 0.1), target=(0.1, 0.0, 0.5), lens=70, fstop=1.6)


def plume():
    B = beads(PLUME_FORM, N_MACRO, BEADS_MACRO)
    col, t = tone_cols(B)
    return B, col, t


def plume_normals(B):
    shape = shape_from(PLUME_FORM)
    G = shape.grad(B["P"])
    return shape, G / (np.linalg.norm(G, axis=1, keepdims=True) + 1e-9)


def _front(P, x0, wob=0.25):
    return P[:, 0] - x0 + wob * fbm_v(P, 1.8, 3, np.array([2.0, 5, 1]), PERM)


def f04_bead():
    B, col, t = plume()
    return dict(items=[bead_item(B["P"], B["R"], col)], camera=MACRO_CAM, lights=HERO_LIGHT)


def f04_fibre():
    B, col, t = plume()
    shape, Nrm = plume_normals(B)
    f = _front(B["P"], 0.15)
    sel = (f > 0) & (B["d"] > -0.02)
    rng = np.random.default_rng(0)
    idx = np.where(sel)[0]
    idx = idx[rng.random(len(idx)) < 0.9]
    grow = np.clip(f[idx] / 0.45, 0, 1) ** 0.7
    pts, rad = fur(B["P"][idx], Nrm[idx], length=0.15, seg=8, curl=0.3, seed=1, r_fiber=0.0016)
    pts = B["P"][idx][:, None] + (pts - B["P"][idx][:, None]) * grow[:, None, None]
    return dict(items=[bead_item(B["P"], B["R"], col),
                       dict(kind="fiber", pts=pts, radii=rad, col=col[idx] * 1.1, mat=FIBER_MAT)],
                camera=dict(MACRO_CAM, loc=(1.6, -4.4, 0.1), target=(0.3, 0.0, 0.5)), lights=HERO_LIGHT)


def f04_gel():
    B, col, t = plume()
    shape = shape_from(PLUME_FORM, bump_amp=0.0, warp_amp=0.18)
    gate = lambda P: np.clip(_front(P, 0.25, 0.3) * 4, -1, 1)
    # gel coat: a smoothed, dilated plume surface, only past the front
    sdf = lambda P: np.maximum(shape.sdf(P) - 0.085, -gate(P) * 0.4)
    lo = np.array([-0.4, -1.4, -0.9]); hi = np.array([1.7, 1.3, 1.9])
    V, F = iso_mesh(sdf, lo, hi, res=210)
    Pb, Rb = bubbles_in(sdf, lo, hi, 1400, r=(0.003, 0.016), seed=2)
    return dict(items=[bead_item(B["P"], B["R"], col), dict(kind="gel", V=V, F=F, mat=dict(GEL_MAT, density=2.8)),
                       dict(kind="bubble", P=Pb, R=Rb, mat={})],
                camera=dict(MACRO_CAM, loc=(1.8, -4.4, 0.2), target=(0.5, 0.0, 0.5)),  # gel coat
                lights=dict(HERO_LIGHT, world=0.1, flags=True), bounces=(3, 4, 16, 8))


def f04_tissue():
    shape = shape_from(PLUME_FORM)
    lo, hi = shape.bbox(pad=0.12)
    V, F = iso_mesh(shape.sdf, lo, hi, res=260)
    from engine.mass import exposure
    e = exposure(shape, V)
    tone = fbm_v(V, 2.4, 3, np.array([-7.7, 2.2, 0.4]), PERM)
    tcol = palette.albedo(np.clip(0.08 + 0.3 * e + 0.12 * tone, 0, 1))
    # stipple: sparse micro beads sitting on the tissue (the Vertus card texture)
    rng = np.random.default_rng(5)
    pick = rng.choice(len(V), 160_000)
    G = shape.grad(V[pick]); G /= np.linalg.norm(G, axis=1, keepdims=True)
    Ps = V[pick] + G * 0.002
    Rs = 0.0042 * np.exp(rng.normal(0, 0.2, len(Ps)))
    return dict(items=[dict(kind="tissue", V=V, F=F, col=tcol, mat=dict(sss=0.55, rough=0.55, sheen=0.08)),
                       bead_item(Ps, Rs, tcol[pick] * 1.05)],
                camera=dict(loc=(1.0, -4.2, 1.3), target=(0.2, 0.0, 0.55), lens=55, fstop=2.0),
                lights=HERO_LIGHT)


def f04_whole():
    B, col, t = hero()
    shape = shape_from(HERO_FORM)
    P = B["P"]
    x = P[:, 0] + 0.15 * fbm_v(P, 1.5, 2, np.array([0.0, 3, 1]), PERM)
    band = np.digitize(x, [-0.45, 0.05, 0.55])  # 0 bead, 1 fibre, 2 gel, 3 tissue
    items = [bead_item(P[band <= 2], B["R"][band <= 2], col[band <= 2])]
    G = shape.grad(P[band == 1]); G /= np.linalg.norm(G, axis=1, keepdims=True)
    idx = np.random.default_rng(0).random(int((band == 1).sum())) < 0.5
    pts, rad = fur(P[band == 1][idx], G[idx], length=0.12, seg=7, curl=0.3, seed=2, r_fiber=0.0015)
    items.append(dict(kind="fiber", pts=pts, radii=rad, col=col[band == 1][idx], mat=FIBER_MAT))
    lo, hi = shape.bbox(pad=0.1)
    xw = lambda Q: Q[:, 0] + 0.15 * fbm_v(Q, 1.5, 2, np.array([0.0, 3, 1]), PERM)
    smooth = shape_from(HERO_FORM, bump_amp=0.0)
    gel_sdf = lambda Q: np.maximum(np.maximum(smooth.sdf(Q) - 0.08, 0.05 - xw(Q)), xw(Q) - 0.55)
    V, F = iso_mesh(gel_sdf, lo, hi, res=200)
    items.append(dict(kind="gel", V=V, F=F, mat=dict(GEL_MAT, density=5.0)))
    tis_sdf = lambda Q: np.maximum(shape.sdf(Q), 0.55 - xw(Q))
    Vt, Ft = iso_mesh(tis_sdf, lo, hi, res=200)
    from engine.mass import exposure
    e = exposure(shape, Vt)
    items.append(dict(kind="tissue", V=Vt, F=Ft, col=palette.albedo(np.clip(0.2 + 0.32 * e, 0, 1)),
                      mat=dict(sss=0.55, rough=0.55, sheen=0.08)))
    return dict(items=items, camera=cam_wide(dist=8.8, aim=(0, 0, -0.55)), lights=dict(HERO_LIGHT, world=0.09, flags=True),
                bounces=(3, 4, 14, 8),
                endcard=dict(tagline="Adaptive by nature.", mark_y=0.74, mark_width=0.36))


# ============================================================================= 05 PULSE

PULSE_CAM = dict(loc=(-0.6, -3.4, 0.55), target=(-0.25, 0.0, 0.75), lens=70, fstop=1.8)


def f05_still():
    B, col, t = hero()
    return dict(items=[bead_item(B["P"], B["R"], col)], camera=PULSE_CAM, lights=HERO_LIGHT)


def f05_fire():
    B, col, t = hero()
    g = pulse_glow(B["P"], origin=(-1.5, -0.9, 0.2), radius=1.32, width=0.05, tail=0.04)
    return dict(items=[bead_item(B["P"], B["R"], col, g)], camera=PULSE_CAM, lights=HERO_LIGHT)


def f05_flurry():
    """Beads peel off behind the wavefront in spiral sheets around the mass axis."""
    B, col, t = hero()
    Nrm = hero_normals(B)
    P = B["P"]
    o = np.array([-1.5, -0.9, 0.2])
    d = np.linalg.norm(P - o, axis=1)
    rng = np.random.default_rng(2)
    arms = 0.5 + 0.5 * np.sin(np.arctan2(P[:, 1] - HERO_C[1], P[:, 0] - HERO_C[0]) * 3 + 4 * P[:, 2])
    lift = np.clip((2.3 - d) / 1.0, 0, 1) ** 1.1 * (0.45 + 0.9 * arms) * (0.8 + 0.4 * rng.random(len(P)))
    c = HERO_C
    rel = P - c
    ang = lift * 3.6                      # sheets wind around the vertical axis
    ca, sa = np.cos(ang), np.sin(ang)
    x = rel[:, 0] * ca - rel[:, 1] * sa
    y = rel[:, 0] * sa + rel[:, 1] * ca
    rad = 1 + lift * 1.3                  # and fling outward
    Q = c + np.stack([x * rad, y * rad, rel[:, 2] + lift * 0.55], 1) + Nrm * lift[:, None] * 0.12
    Q = Q + curl_v(Q, 1.1, 2, 0.4, PERM) * lift[:, None] * 0.12
    g = pulse_glow(P, origin=o, radius=1.75, width=0.06, tail=0.04) * 0.8
    R = B["R"] * (1 - 0.25 * np.clip(lift, 0, 1))
    return dict(items=[bead_item(Q, R, col, g)],
                camera=dict(loc=(0.4, -7.4, 1.4), target=(-0.1, 0.0, 0.45), lens=45, fstop=2.4), lights=HERO_LIGHT)


def f05_helix():
    core = beads(dict(HERO_FORM, scale=0.62), 380_000, BEADS_HERO)
    ccol, _ = tone_cols(core)
    Pa, Ra, sa, ea = helix(380_000, turns=1.5, radius=1.0, height=3.4, tube=0.26, phase=0.0, seed=1, r=0.0095)
    Pb, Rb, sb, eb = helix(380_000, turns=1.5, radius=1.0, height=3.4, tube=0.26, phase=np.pi, seed=2, r=0.0095)
    ta = np.clip(0.55 - 0.35 * ea + np.random.default_rng(1).normal(0, 0.07, len(ea)), 0, 1)
    tb = np.clip(0.55 - 0.35 * eb + np.random.default_rng(2).normal(0, 0.07, len(eb)), 0, 1)
    return dict(items=[bead_item(core["P"], core["R"], ccol),
                       bead_item(Pa, Ra, palette.albedo(ta)), bead_item(Pb, Rb, palette.albedo(tb))],
                camera=dict(loc=(0.6, -6.4, -0.9), target=(0, 0, 0.1), lens=45, fstop=2.4), lights=HERO_LIGHT)


def f05_newidea():
    form = dict(HERO_FORM, seed=6, arms=6, levels=(4, 3, 3))
    B = beads(form, N_HERO, BEADS_HERO)
    col, t = tone_cols(B)
    return dict(items=[bead_item(B["P"], B["R"], col)],
                camera=cam_wide(dist=10.0, lens=62, fstop=2.8, up=1.0, aim=(0, 0, -0.9)), lights=HERO_LIGHT,
                endcard=dict(tagline="Thought, in motion.", mark_y=0.70))


# ============================================================================= 06 DEPTH


def f06_approach():
    B, col, t = plume()
    return dict(items=[bead_item(B["P"], B["R"], col)],
                camera=dict(loc=(0.15, -3.3, -0.75), target=(0.05, 0.6, 0.35), lens=32, fstop=2.0, focus=2.4),
                lights=HERO_LIGHT)


CANYON_FORM = None


def _canyon_lobes(seed=3):
    rng = np.random.default_rng(seed)
    L = []
    for side in (-1, 1):
        for y in np.linspace(-1.5, 3.5, 22):
            x = side * (0.42 + 0.08 * rng.normal())
            for z in np.linspace(-0.9, 1.6, 6):
                r = rng.uniform(0.16, 0.26)
                L.append([x + side * rng.uniform(0, 0.25), y + rng.normal(0, 0.1), z + rng.normal(0, 0.1), r])
    return np.array(L)


def canyon():
    from engine.mass import MassShape, sample_beads
    import os, hashlib
    from films.common import CACHE
    path = f"{CACHE}/canyon_v1.npz"
    if os.path.exists(path):
        return dict(np.load(path))
    shape = MassShape(_canyon_lobes(), k=0.35, warp_amp=0.2, warp_freq=0.6, bump_amp=0.03, bump_freq=3.5)
    B = sample_beads(shape, 1_000_000, relax_iters=2, **BEADS_MACRO)
    np.savez(path, **B)
    return B


def f06_canyon():
    B = canyon()
    col, t = tone_cols(B)
    return dict(items=[bead_item(B["P"], B["R"], col)],
                camera=dict(loc=(0.0, -1.2, 0.05), target=(0.0, 2.5, 0.5), lens=24, fstop=2.8, focus=1.6),
                lights=dict(HERO_LIGHT, key_dir=(-0.2, -0.3, 0.93), world=0.08))


def f06_membrane():
    B = canyon()
    col, t = tone_cols(B)
    def sheet(P):
        y = P[:, 1] + 0.12 * fbm_v(P, 1.3, 3, np.array([1.0, 0, 7]), PERM)
        return np.abs(y + 0.25) - 0.035
    lo = np.array([-1.0, -0.6, -0.9]); hi = np.array([1.0, 0.1, 1.5])
    V, F = iso_mesh(sheet, lo, hi, res=200)
    Pb, Rb = bubbles_in(sheet, lo, hi, 2500, r=(0.002, 0.014), seed=3, margin=0.002)
    return dict(items=[bead_item(B["P"], B["R"], col), dict(kind="gel", V=V, F=F, mat=dict(GEL_MAT, density=1.1)),
                       dict(kind="bubble", P=Pb, R=Rb, mat={})],
                camera=dict(loc=(0.0, -1.2, 0.05), target=(0.0, 2.5, 0.45), lens=28, fstop=2.8, focus=0.95),
                lights=dict(HERO_LIGHT, key_dir=(-0.2, -0.3, 0.93), world=0.1), bounces=(3, 4, 16, 8))


def f06_cathedral():
    from engine.mass import MassShape
    from engine.noise import billow
    rng = np.random.default_rng(9)
    # inside a vast folded chamber: the inverted mass
    L = np.array([[0, 0, 0, 2.2]] + [[*(rng.normal(size=3) * 1.4), rng.uniform(0.5, 0.9)] for _ in range(10)])
    shape = MassShape(L, k=0.4, warp_amp=0.35, warp_freq=0.45, bump_amp=0.22, bump_freq=1.3, fold_amp=0.12,
                      fold_freq=1.7)
    inner = lambda P: -shape.sdf(P)
    V, F = iso_mesh(inner, (-3.4, -3.4, -3.4), (3.4, 3.4, 3.4), res=200)
    tone = fbm_v(V, 0.9, 3, np.array([-7.7, 2.2, 0.4]), PERM)
    tcol = palette.albedo(np.clip(0.16 + 0.25 * tone, 0, 1))
    # fibres bridging the chamber, a few carrying a pulse
    lines = []
    for i in range(11):
        a = rng.normal(size=3); a /= np.linalg.norm(a); b = -a + rng.normal(0, 0.5, 3); b /= np.linalg.norm(b)
        A = a * 1.9; Bp = b * 1.9
        s = np.linspace(0, 1, 120)[:, None]
        mid = (A + Bp) / 2 * 0.6
        C = (1 - s) ** 2 * A + 2 * (1 - s) * s * mid + s ** 2 * Bp
        lines.append(C)
    fib = _fiber_items(lines, fibers=110, radius=0.032, twist=6.0, fray_start=0.95, fray=0.05, seed=4,
                       t_range=(0.45, 0.7), r_fiber=0.0018)
    glow_core = dict(kind="beads", P=np.array([[0.0, 0.6, 0.1]]), R=np.array([0.12]), col=np.array([[1, 0.6, 0.75]]),
                     glow=np.array([1.0]), mat=dict(BEAD_MAT, sss=0.0))
    return dict(items=[dict(kind="tissue", V=V, F=F, col=tcol, mat=dict(sss=0.4, rough=0.45)), fib, glow_core],
                camera=dict(loc=(0.2, -1.7, -0.3), target=(0.0, 0.8, 0.15), lens=22, fstop=4.0),
                lights=dict(world=0.0, key=0.0, rim=0.0,
                            points=[((0.0, 0.6, 0.1), 420.0, (1.0, 0.78, 0.86), 0.35),
                                    ((-0.9, 0.2, 1.3), 160.0, (1.0, 0.92, 0.96), 0.4)]))


def f06_insight():
    B, col, t = hero()
    g = pulse_glow(B["P"], origin=(0.0, -0.2, 0.1), radius=0.0, width=0.9, tail=0.0)
    return dict(items=[bead_item(B["P"], B["R"], col, np.clip(g * 1.2, 0, 1))],
                camera=cam_wide(dist=8.6, lens=62, fstop=2.8, up=1.0, aim=(0, 0, -0.6)),
                lights=dict(HERO_LIGHT, world=0.12), exposure=0.35,
                endcard=dict(tagline="Go deeper.", mark_y=0.70))


# ============================================================================= the series

FILMS = [
    dict(id="01", slug="origin", title="Origin", faculty="Emergence", runtime=20,
         logline="From a single bead, the Vertus mind assembles itself: dividing, flocking, folding into a living cerebral mass.",
         floor="Particles (crystal tendrils accreting and coiling) and Ice (macro surface into a scale reveal).",
         above=["Every bead's path is simulated, not keyframed: division, flocking and settling are one continuous system.",
                "One unbroken camera move from a 100mm macro on a single bead to the full 900k-bead mass.",
                "Sound is generated from the simulation's own division events, so every click lands on a real bead."],
         beats=[
             dict(tc="00:00", name="Seed", fn=f01_seed, shot="ECU · 100mm · f/2",
                  action="White void. A single pearl bead, mid-division, glows from inside. Focus breathes in.",
                  camera="Locked off, slow focus pull from soft to sharp.", sound="Room tone. One soft sub pulse."),
             dict(tc="00:03", name="Division", fn=f01_division, shot="CU · 85mm · f/2.2",
                  action="It divides: 2, 4, 8, 2,600. Beads unfurl on the golden angle, each generation a shade deeper magenta.",
                  camera="Push in 15%, slight tilt to reveal the spiral's depth.", sound="Glassy clicks, one per division, accelerating."),
             dict(tc="00:06", name="Flock", fn=f01_flock, shot="MCU · 50mm · f/1.6",
                  action="Thousands of beads stream on swirling currents, braiding into ribbons around an invisible core.",
                  camera="Drift through the streams; foreground beads pass as bokeh.", sound="Granular rush, stereo-panned with the streams."),
             dict(tc="00:10", name="Fold", fn=f01_fold, shot="MS · 55mm · f/2",
                  action="Streams land and lock into lobes. A pale growth front climbs the mass as it builds itself from the base up.",
                  camera="Slow orbit 20° left while rising.", sound="Clicks settle into a dense, pleasant crackle."),
             dict(tc="00:14", name="Wake", fn=f01_wake, shot="WS · 62mm · f/1.8",
                  action="Complete. The mass breathes once, and a pulse of light ripples through the lobes: its first thought.",
                  camera="Continuous pull back to the full form.", sound="A single warm chord blooms on the pulse."),
             dict(tc="00:17", name="Name", fn=f01_name, shot="WS · end card",
                  action="The mass settles high in frame. The Vertus wordmark resolves beneath it.",
                  camera="Hold.", sound="Chord resolves; tail into silence.", super="A mind for high-stakes decisions."),
         ]),
    dict(id="02", slug="confluence", title="Confluence", faculty="Synthesis", runtime=15,
         logline="A wine-dark stream of market signal and a pearl stream of research collide, braid, and resolve into one coherent mind.",
         floor="Pyro RBD Advect (black and white particle clouds colliding through a smoke solve).",
         above=["Two bead populations advected through a divergence-free field, so they swirl without clumping.",
                "The colours do not just mix: they re-sort into the brand gradient, pale crests over wine-dark folds.",
                "The collision resolves into the Expected Flurries helix before it settles into the mass."],
         beats=[
             dict(tc="00:00", name="Two sources", fn=f02_sources, shot="WS · 50mm · f/2.8",
                  action="Wine beads billow in from top-left, pearl beads from bottom-right. Slow, heavy, opposite.",
                  camera="Locked off, diagonal composition.", sound="Two low drones a fifth apart."),
             dict(tc="00:03", name="Contact", fn=f02_contact, shot="MS · 55mm · f/2",
                  action="They meet at centre. Leading edges curl into each other; beads ricochet and interleave.",
                  camera="Slow push in on the contact zone.", sound="Granular friction, rising."),
             dict(tc="00:06", name="Braid", fn=f02_braid, shot="MS · 50mm · f/2.2",
                  action="The two streams wind into a double helix and climb the frame.",
                  camera="Orbit 40° around the helix, low angle.", sound="The two drones converge toward unison."),
             dict(tc="00:10", name="Resolve", fn=f02_resolve, shot="WS · 62mm · f/1.8",
                  action="The helix contracts into the mass. Every bead re-sorts by tone: wine into the folds, pearl onto the crests.",
                  camera="Pull back as the form closes.", sound="Unison. Clicks fall into rhythm."),
             dict(tc="00:13", name="Answer", fn=f02_answer, shot="WS · end card",
                  action="One mind, breathing. Wordmark resolves.", camera="Hold.", sound="Clean tone, cut.",
                  super="Every source. One answer."),
         ]),
    dict(id="03", slug="resolve", title="Resolve", faculty="Decision", runtime=15,
         logline="Loose, frayed threads writhe under tension, twist into one cord, coil into a spiral, and crystallise into clear magenta gel.",
         floor="Particles (tendrils coiling into a spiral rose) and mirage_xyz (twisted red cord, frayed ends).",
         above=["Real hair-shaded fibres, over 100,000 strands, twisted with true rope geometry.",
                "A crystallisation front turns fibre into refractive gel with trapped bubbles and caustics.",
                "The coil is an exact spiral, so the decision reads as precise rather than chaotic."],
         beats=[
             dict(tc="00:00", name="Tension", fn=f03_tension, shot="MCU · 70mm · f/2",
                  action="Sixteen magenta strands drift and curl, ends fraying open. A slight tremble: indecision.",
                  camera="Slow lateral drift.", sound="Taut string harmonics, unresolved."),
             dict(tc="00:03", name="Twist", fn=f03_twist, shot="MCU · 70mm · f/2.2",
                  action="The strands find each other and twist into a single cord, still unravelling at the top.",
                  camera="Low angle, tilt up the cord.", sound="Fibre creak; tension rises."),
             dict(tc="00:06", name="Coil", fn=f03_coil, shot="MS top-down · 50mm · f/2.4",
                  action="The cord loops inward into a tight spiral rosette.",
                  camera="Crane up to a three-quarter top view.", sound="A held, rising tone."),
             dict(tc="00:09", name="Lock", fn=f03_lock, shot="MS · 50mm · f/2.4",
                  action="A beat of silence. Then a crystallisation front races out from the core: fibre turns to glass-clear gel.",
                  camera="Hold, then a small push on the front.", sound="Silence, then a bright crystalline snap."),
             dict(tc="00:12", name="Clarity", fn=f03_clarity, shot="MS · 55mm · end card",
                  action="The gel knot turns slowly; light refracts through it and bubbles hang inside.",
                  camera="Slow orbit 30°.", sound="Resonant glass tone, decaying.", super="Decide with conviction."),
         ]),
    dict(id="04", slug="states", title="States", faculty="Adaptability", runtime=15,
         logline="One continuous macro glide across the mass while a transformation front sweeps through it: bead to fibre, fibre to gel, gel to tissue.",
         floor="Gold (macro clusters with rack focus, a fractal burn-front transforming a bust).",
         above=["Four physically distinct materials in one shot: beads, hair-shaded fur, refractive gel, folded tissue.",
                "The fronts are noise-driven, so each change crawls organically instead of wiping across.",
                "It ends on the whole mass wearing all four states at once, like strata of thought."],
         beats=[
             dict(tc="00:00", name="Bead", fn=f04_bead, shot="ECU · 70mm · f/1.6",
                  action="Bead towers in macro, the hero look.", camera="Slider move left to right begins.",
                  sound="Soft bead texture."),
             dict(tc="00:03", name="Fibre", fn=f04_fibre, shot="ECU · 70mm · f/1.6",
                  action="A front crawls across. Behind it, beads sprout fur with spore-white tips.",
                  camera="Slider continues.", sound="Velvet hiss, like a brush on felt."),
             dict(tc="00:06", name="Gel", fn=f04_gel, shot="ECU · 70mm · f/1.6",
                  action="A second front: the fur melts into refractive gel, beads suspended inside it like amber.",
                  camera="Slider continues; slight rise.", sound="Liquid swell, bubbles."),
             dict(tc="00:09", name="Tissue", fn=f04_tissue, shot="MCU · 55mm · f/2",
                  action="The gel cools into smooth folded tissue, stippled with micro-beads (the Vertus card texture).",
                  camera="Rise and pull back begins.", sound="Warm low tone."),
             dict(tc="00:12", name="Whole", fn=f04_whole, shot="WS · 62mm · end card",
                  action="Reveal: the whole mass wears all four states in bands.", camera="Pull back completes, hold.",
                  sound="All four textures layer into one chord.", super="Adaptive by nature."),
         ]),
    dict(id="05", slug="pulse", title="Pulse", faculty="Thinking", runtime=12,
         logline="A calm mass fires. A luminous pulse races across it, lifting the surface into a flurry that spirals into a helix and snaps back as a new idea.",
         floor="Ice (a snow-sphere disintegrating into a swirling blizzard) and Expected Flurries (the bead helix).",
         above=["Per-bead light: the pulse is emission carried by the beads themselves, like a neuron firing.",
                "Close to a million beads lift in sheets behind the wavefront and organise into a precise helix.",
                "The reassembly lands on a different shape, so the change itself is the message."],
         beats=[
             dict(tc="00:00", name="Stillness", fn=f05_still, shot="MCU · 70mm · f/1.6",
                  action="The mass at rest. Close on a lobe; it breathes.", camera="Locked off.", sound="Near silence."),
             dict(tc="00:02", name="Fire", fn=f05_fire, shot="MCU · 70mm · f/1.6",
                  action="A pale pink pulse races across the surface, bead by bead.", camera="Locked off.",
                  sound="A fast rising sweep, synced to the front."),
             dict(tc="00:04", name="Flurry", fn=f05_flurry, shot="MS · 55mm · f/2",
                  action="Behind the wave, beads lift off in sheets and spiral outward.", camera="Quick pull back.",
                  sound="Airy rush, thousands of tiny ticks."),
             dict(tc="00:07", name="Helix", fn=f05_helix, shot="WS · 45mm · f/2.4",
                  action="The flurry organises into a double helix towering around the remaining core.",
                  camera="Low angle, slow orbit.", sound="Rhythmic pulse, tempo locks in."),
             dict(tc="00:10", name="New idea", fn=f05_newidea, shot="WS · end card",
                  action="Snap: beads rush home and reassemble into a new configuration. Cut to wordmark on the beat.",
                  camera="Hold.", sound="Impact, then silence.", super="Thought, in motion."),
         ]),
    dict(id="06", slug="depth", title="Depth", faculty="Insight", runtime=15,
         logline="A first-person flight into the mass: down bead canyons, through a gel membrane, into a cathedral of folded tissue where signals travel on fibres.",
         floor="The hero still (bead towers meeting a gel edge with bubbles).",
         above=["A continuous FPV path through a million-bead interior, with no cuts.",
                "Passing through the membrane bends the whole world (real refraction, not a wipe).",
                "Inside, the mass is architectural: folds as vaults, fibres as bridges carrying light."],
         beats=[
             dict(tc="00:00", name="Approach", fn=f06_approach, shot="WS low · 32mm · f/2",
                  action="Skimming low across the bead towers toward a gap.", camera="FPV dolly forward, slight bank.",
                  sound="Wind through beads."),
             dict(tc="00:03", name="Canyon", fn=f06_canyon, shot="FPV · 24mm · f/2.8",
                  action="Between towering bead walls; beads whip past as bokeh.", camera="Accelerate forward.",
                  sound="Doppler swishes."),
             dict(tc="00:06", name="Membrane", fn=f06_membrane, shot="FPV · 28mm · f/2.8",
                  action="A gel membrane ahead. We punch through it; the canyon bends, bubbles stream past.",
                  camera="Through the sheet.", sound="Muffled underwater swell, then release."),
             dict(tc="00:09", name="Cathedral", fn=f06_cathedral, shot="FPV · 22mm · f/4",
                  action="Inside: vast folded chambers lit from within, fibres bridging the void, pulses running along them.",
                  camera="Slow glide, tilt up.", sound="Choral pad, reverberant."),
             dict(tc="00:12", name="Insight", fn=f06_insight, shot="WS · end card",
                  action="The core flares; the mass glows from within and the frame lifts to white around the wordmark.",
                  camera="Pull out.", sound="Swell to bright, cut clean.", super="Go deeper."),
         ]),
]

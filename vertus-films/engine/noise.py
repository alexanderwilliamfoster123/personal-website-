"""Fast 3D gradient noise, fBm, billow and curl noise (numba, parallel).

Everything that moves or folds in the Vertus mass is driven from these fields,
so they are deterministic (seeded permutation) and smooth in space and time.
"""
import numpy as np
from numba import njit, prange

_GRAD3 = np.array([
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
    [1, 1, 0], [0, -1, 1], [-1, 1, 0], [0, -1, -1],
], dtype=np.float64)


def make_perm(seed=7):
    p = np.random.default_rng(seed).permutation(256).astype(np.int64)
    return np.concatenate([p, p])


PERM = make_perm(7)


@njit(cache=True, fastmath=True, inline="always")
def _fade(t):
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0)


@njit(cache=True, fastmath=True, inline="always")
def _g(h, x, y, z):
    h = h & 15
    return _GRAD3[h, 0] * x + _GRAD3[h, 1] * y + _GRAD3[h, 2] * z


@njit(cache=True, fastmath=True)
def perlin(x, y, z, perm):
    fx = np.floor(x); fy = np.floor(y); fz = np.floor(z)
    X = int(fx) & 255; Y = int(fy) & 255; Z = int(fz) & 255
    x -= fx; y -= fy; z -= fz
    u = _fade(x); v = _fade(y); w = _fade(z)
    A = perm[X] + Y; AA = perm[A] + Z; AB = perm[A + 1] + Z
    B = perm[X + 1] + Y; BA = perm[B] + Z; BB = perm[B + 1] + Z
    x1 = x - 1.0; y1 = y - 1.0; z1 = z - 1.0
    l0 = _g(perm[AA], x, y, z) + u * (_g(perm[BA], x1, y, z) - _g(perm[AA], x, y, z))
    l1 = _g(perm[AB], x, y1, z) + u * (_g(perm[BB], x1, y1, z) - _g(perm[AB], x, y1, z))
    l2 = _g(perm[AA + 1], x, y, z1) + u * (_g(perm[BA + 1], x1, y, z1) - _g(perm[AA + 1], x, y, z1))
    l3 = _g(perm[AB + 1], x, y1, z1) + u * (_g(perm[BB + 1], x1, y1, z1) - _g(perm[AB + 1], x, y1, z1))
    m0 = l0 + v * (l1 - l0)
    m1 = l2 + v * (l3 - l2)
    return m0 + w * (m1 - m0)


@njit(cache=True, fastmath=True)
def fbm(x, y, z, octaves, lac, gain, perm):
    s = 0.0; a = 1.0; f = 1.0; norm = 0.0
    for o in range(octaves):
        s += a * perlin(x * f + 17.13 * o, y * f + 3.71 * o, z * f + 9.07 * o, perm)
        norm += a
        a *= gain
        f *= lac
    return s / norm


@njit(cache=True, fastmath=True)
def billow(x, y, z, octaves, lac, gain, perm):
    """abs-noise fBm: rounded cauliflower bumps (positive, ~[0,1])."""
    s = 0.0; a = 1.0; f = 1.0; norm = 0.0
    for o in range(octaves):
        s += a * (1.0 - np.abs(perlin(x * f + 5.3 * o, y * f + 1.9 * o, z * f + 7.7 * o, perm)) * 1.6)
        norm += a
        a *= gain
        f *= lac
    return s / norm


@njit(cache=True, fastmath=True)
def ridged(x, y, z, octaves, lac, gain, perm):
    """Ridged fBm: sharp crests, used for gyri-like folds."""
    s = 0.0; a = 1.0; f = 1.0; norm = 0.0
    for o in range(octaves):
        n = 1.0 - np.abs(perlin(x * f + 2.1 * o, y * f + 8.3 * o, z * f + 4.4 * o, perm))
        s += a * n * n
        norm += a
        a *= gain
        f *= lac
    return s / norm


@njit(parallel=True, cache=True, fastmath=True)
def fbm_v(P, freq, octaves, offset, perm):
    n = P.shape[0]
    out = np.empty(n)
    for i in prange(n):
        out[i] = fbm(P[i, 0] * freq + offset[0], P[i, 1] * freq + offset[1],
                     P[i, 2] * freq + offset[2], octaves, 2.03, 0.5, perm)
    return out


@njit(parallel=True, cache=True, fastmath=True)
def vec_fbm_v(P, freq, octaves, t, perm):
    """Vector-valued fBm (three decorrelated channels), animated by t."""
    n = P.shape[0]
    out = np.empty((n, 3))
    for i in prange(n):
        x = P[i, 0] * freq; y = P[i, 1] * freq; z = P[i, 2] * freq
        out[i, 0] = fbm(x + 31.4, y + t, z - 12.7, octaves, 2.03, 0.5, perm)
        out[i, 1] = fbm(x - 19.1 + t, y + 44.2, z + 7.3, octaves, 2.03, 0.5, perm)
        out[i, 2] = fbm(x + 3.3, y - 27.9, z + 51.6 + t, octaves, 2.03, 0.5, perm)
    return out


@njit(cache=True, fastmath=True, inline="always")
def _pot(x, y, z, t, octaves, perm, c):
    if c == 0:
        return fbm(x + 31.4, y + t, z - 12.7, octaves, 2.03, 0.5, perm)
    elif c == 1:
        return fbm(x - 19.1 + t, y + 44.2, z + 7.3, octaves, 2.03, 0.5, perm)
    return fbm(x + 3.3, y - 27.9, z + 51.6 + t, octaves, 2.03, 0.5, perm)


@njit(parallel=True, cache=True, fastmath=True)
def curl_v(P, freq, octaves, t, perm):
    """Divergence-free velocity field (curl of a noise vector potential).

    Bead streams advected through it swirl like ink without bunching up.
    """
    n = P.shape[0]
    out = np.empty((n, 3))
    e = 1e-3
    for i in prange(n):
        x = P[i, 0] * freq; y = P[i, 1] * freq; z = P[i, 2] * freq
        dz_dy = (_pot(x, y + e, z, t, octaves, perm, 2) - _pot(x, y - e, z, t, octaves, perm, 2)) / (2 * e)
        dy_dz = (_pot(x, y, z + e, t, octaves, perm, 1) - _pot(x, y, z - e, t, octaves, perm, 1)) / (2 * e)
        dx_dz = (_pot(x, y, z + e, t, octaves, perm, 0) - _pot(x, y, z - e, t, octaves, perm, 0)) / (2 * e)
        dz_dx = (_pot(x + e, y, z, t, octaves, perm, 2) - _pot(x - e, y, z, t, octaves, perm, 2)) / (2 * e)
        dy_dx = (_pot(x + e, y, z, t, octaves, perm, 1) - _pot(x - e, y, z, t, octaves, perm, 1)) / (2 * e)
        dx_dy = (_pot(x, y + e, z, t, octaves, perm, 0) - _pot(x, y - e, z, t, octaves, perm, 0)) / (2 * e)
        out[i, 0] = dz_dy - dy_dz
        out[i, 1] = dx_dz - dz_dx
        out[i, 2] = dy_dx - dx_dy
    return out

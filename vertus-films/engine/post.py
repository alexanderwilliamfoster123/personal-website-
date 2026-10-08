"""Finishing: backdrop composite, halation, lens fringing, grain, typography plate.

Cycles renders the mass over transparency; the studio backdrop is painted here
so every film shares an identical, banding-free white cyc.
"""
import numpy as np
import cv2

from .palette import hex_to_srgb


def load_rgba(path):
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if im is None:
        raise FileNotFoundError(path)
    scale = 65535.0 if im.dtype == np.uint16 else 255.0
    im = im.astype(np.float32) / scale
    if im.shape[2] == 3:
        im = np.concatenate([im, np.ones_like(im[..., :1])], -1)
    rgb = im[..., [2, 1, 0]]
    return rgb, im[..., 3:4]


def backdrop(h, w, top="#FEFDFE", bottom="#F1EEF2", glow=0.035, center=(0.5, 0.42)):
    """Seamless cyc: soft vertical falloff plus a faint light pool behind the subject."""
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    x = np.linspace(0, 1, w, dtype=np.float32)[None, :, None]
    a = hex_to_srgb(top).astype(np.float32)
    b = hex_to_srgb(bottom).astype(np.float32)
    g = a + (b - a) * (y ** 1.6)
    r = np.sqrt(((x - center[0]) * (w / h)) ** 2 + (y - center[1]) ** 2)
    g = g + glow * np.exp(-(r / 0.45) ** 2)
    return np.clip(g, 0, 1)


def fringe(img, amount=0.0012):
    """Lateral chromatic aberration: red scales out, blue scales in, from centre."""
    if amount <= 0:
        return img
    h, w = img.shape[:2]
    out = img.copy()
    for ch, s in ((0, 1 + amount), (2, 1 - amount)):
        M = np.float32([[s, 0, (1 - s) * w / 2], [0, s, (1 - s) * h / 2]])
        out[..., ch] = cv2.warpAffine(img[..., ch], M, (w, h), flags=cv2.INTER_LINEAR,
                                      borderMode=cv2.BORDER_REFLECT)
    return out


def halation(img, strength=0.06, radius=0.02, tint=(1.0, 0.55, 0.7)):
    """Soft magenta-tinted bloom around the brightest edges (film halation)."""
    if strength <= 0:
        return img
    h, w = img.shape[:2]
    lum = img.mean(-1, keepdims=True)
    hi = np.clip((lum - 0.75) / 0.25, 0, 1) * img
    k = int(radius * max(h, w)) | 1
    bl = cv2.GaussianBlur(hi, (k, k), 0)
    return np.clip(img + strength * bl * np.array(tint, dtype=np.float32), 0, 1)


def grain(img, amount=0.012, seed=0, size=1.0):
    rng = np.random.default_rng(seed)
    h, w = img.shape[:2]
    n = rng.normal(0, 1, (h, w, 1)).astype(np.float32)
    if size > 1.0:
        k = int(size * 2) | 1
        n = cv2.GaussianBlur(n, (k, k), 0)[..., None] * size
    # grain sits mostly in the mids, not the white cyc
    lum = img.mean(-1, keepdims=True)
    wgt = 4 * lum * (1 - lum) + 0.15
    return np.clip(img + n * amount * wgt, 0, 1)


def finish(rgba_path, out_path, bg=None, fringe_amt=0.0010, halo=0.05, grain_amt=0.010,
           seed=0, vignette=0.06):
    rgb, a = load_rgba(rgba_path)
    h, w = rgb.shape[:2]
    if bg is None:
        bg = backdrop(h, w)
    img = rgb * a + bg * (1 - a)
    img = halation(img, halo)
    img = fringe(img, fringe_amt)
    if vignette > 0:
        y = np.linspace(-1, 1, h, dtype=np.float32)[:, None, None]
        x = np.linspace(-1, 1, w, dtype=np.float32)[None, :, None] * (w / h)
        img = img * (1 - vignette * np.clip(x * x + y * y - 0.35, 0, None) ** 1.2)
    img = grain(img, grain_amt, seed)
    out = (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)
    cv2.imwrite(out_path, out[..., ::-1])
    return out_path

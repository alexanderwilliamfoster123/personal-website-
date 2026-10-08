"""Vertus mass palette.

The eight stops were sampled (k-means, background removed) from the campaign
references: "Expected Flurries", "Turning a Corner", "Refractive Sculptures" and
the hero bead/gel still. All four agree to within a few RGB steps, so this ramp
is the brand's material colour, wine in the folds through pearl on the crests.
"""
import numpy as np

# Rendered-colour targets (sRGB, what the camera should see).
RAMP_HEX = [
    "#4C0111",  # wine        deepest folds
    "#800325",  # garnet
    "#AE083D",  # raspberry
    "#D91159",  # vertus magenta (core brand colour)
    "#F23078",  # hot pink
    "#F85995",  # flamingo
    "#FB87B2",  # blush
    "#FCBAD8",  # pearl       crests, large beads
]
STUDIO_WHITE = "#FEFDFE"
STUDIO_GREY = "#EEEEEF"


def hex_to_srgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)])


def srgb_to_linear(c):
    c = np.asarray(c, dtype=np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


RAMP_SRGB = np.stack([hex_to_srgb(h) for h in RAMP_HEX])
RAMP_LIN = srgb_to_linear(RAMP_SRGB)


def ramp(t, ramp_lin=RAMP_LIN):
    """Sample the ramp at t in [0,1] (array), returns linear RGB (N,3)."""
    t = np.clip(np.asarray(t, dtype=np.float64), 0.0, 1.0) * (len(ramp_lin) - 1)
    i0 = np.floor(t).astype(np.int64)
    i1 = np.minimum(i0 + 1, len(ramp_lin) - 1)
    f = (t - i0)[..., None]
    return ramp_lin[i0] * (1 - f) + ramp_lin[i1] * f


# Albedo is darker and more saturated than the rendered target: a high-key white
# studio lifts everything, and AgX rolls saturated highlights toward white.
# This curve is tuned against the references by render tests (see tools/).
# Hue trim measured on render tests: subsurface scatter and the white key pull
# the beads ~8 degrees toward red, so the albedo leans magenta to land on target.
ALBEDO_TRIM = np.array([1.0, 0.92, 1.38])


def albedo(t, lift=0.0, sat=1.0):
    c = ramp(t) * ALBEDO_TRIM
    lum = (c * np.array([0.2126, 0.7152, 0.0722])).sum(-1, keepdims=True)
    c = lum + (c - lum) * sat
    return np.clip(c * (1.0 + lift), 0.0, 1.0)

"""End cards and supers: the real Vertus wordmark (rasterised from the brand SVG)
plus a quiet Inter Display line, composited over a finished frame."""
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FONT_DIR = "/usr/share/fonts"
WORDMARK = {"wine": "/opt/vtx/out/wordmark_wine.png", "white": "/opt/vtx/out/wordmark_white.png"}


def _font(weight="Medium", size=32):
    import glob
    hits = glob.glob(f"{FONT_DIR}/**/InterDisplay-{weight}.otf", recursive=True) or \
        glob.glob(f"{FONT_DIR}/**/Inter-{weight}.otf", recursive=True)
    return ImageFont.truetype(hits[0], size)


def _tracked(draw, xy, text, font, fill, tracking=0.0, anchor_center=True):
    """Draw text with letter-spacing (tracking in em)."""
    em = font.size
    widths = [draw.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * em * (len(text) - 1)
    x, y = xy
    if anchor_center:
        x -= total / 2
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=font, fill=fill)
        x += w + tracking * em
    return total


def endcard(frame_u8, tagline=None, mark="wine", mark_width=0.42, mark_y=0.80,
            line_gap=0.035, color=(28, 7, 16), sub=None, opacity=1.0):
    """frame_u8: HxWx3 uint8. Returns uint8 with wordmark (+ tagline) composited."""
    im = Image.fromarray(frame_u8).convert("RGBA")
    W, H = im.size
    wm = Image.open(WORDMARK[mark])
    tw = int(W * mark_width)
    th = int(wm.height * tw / wm.width)
    wm = wm.resize((tw, th), Image.LANCZOS)
    if opacity < 1:
        a = np.asarray(wm).copy()
        a[..., 3] = (a[..., 3] * opacity).astype(np.uint8)
        wm = Image.fromarray(a)
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    layer.paste(wm, (int((W - tw) / 2), int(H * mark_y - th / 2)), wm)
    d = ImageDraw.Draw(layer)
    if tagline:
        f = _font("Medium", max(12, int(W * 0.034)))
        _tracked(d, (W / 2, H * mark_y + th / 2 + H * line_gap * 0.6), tagline, f,
                 (*color, int(235 * opacity)), tracking=0.01)
    if sub:
        f2 = _font("Regular", max(10, int(W * 0.022)))
        _tracked(d, (W / 2, H * 0.955), sub.upper(), f2, (*color, int(150 * opacity)), tracking=0.18)
    im = Image.alpha_composite(im, layer)
    return np.asarray(im.convert("RGB"))


def super_line(frame_u8, text, y=0.86, size=0.038, color=(28, 7, 16), weight="Medium"):
    im = Image.fromarray(frame_u8).convert("RGBA")
    W, H = im.size
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    _tracked(d, (W / 2, H * y), text, _font(weight, int(W * size)), (*color, 240), tracking=0.005)
    return np.asarray(Image.alpha_composite(im, layer).convert("RGB"))

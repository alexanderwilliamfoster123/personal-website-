"""Render the four matter-state cards (4:5) for the storyboard page.
usage: python storyboard/render_states.py OUT_DIR [res] [spp]"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import cv2
from films import boards as B
from films.common import render_spec

out = sys.argv[1]
W, H = (int(v) for v in (sys.argv[2] if len(sys.argv) > 2 else "864x1080").split("x"))
spp = int(sys.argv[3]) if len(sys.argv) > 3 else 64
os.makedirs(out, exist_ok=True)
for key, fn in [("fibre", B.f04_fibre), ("gel", B.f03_clarity), ("tissue", B.f04_tissue)]:
    spec = fn()
    spec.pop("endcard", None)
    png = f"{out}/state_{key}.png"
    _, t = render_spec(spec, png, res=(W, H), spp=spp)
    cv2.imwrite(f"{out}/state_{key}.jpg", cv2.imread(png), [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(key, f"{t:.0f}s", flush=True)

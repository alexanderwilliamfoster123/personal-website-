"""Render every storyboard panel. Usage:
   python -m films.render_boards OUT_DIR [--only 01:0,02:3] [--res 540x960] [--spp 64] [--force]"""
import argparse, json, os, sys, time, traceback
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
import cv2
from films.boards import FILMS
from films.common import render_spec
from engine import typeset

ap = argparse.ArgumentParser()
ap.add_argument("out")
ap.add_argument("--only", default="")
ap.add_argument("--res", default="540x960")
ap.add_argument("--spp", type=int, default=64)
ap.add_argument("--force", action="store_true")
a = ap.parse_args()
W, H = (int(v) for v in a.res.split("x"))
os.makedirs(a.out, exist_ok=True)
only = set(a.only.split(",")) if a.only else None
log_path = os.path.join(a.out, "times.json")
log = json.load(open(log_path)) if os.path.exists(log_path) else {}
for film in FILMS:
    for i, beat in enumerate(film["beats"]):
        key = f"{film['id']}:{i}"
        if only and key not in only and film["id"] not in only:
            continue
        png = os.path.join(a.out, f"f{film['id']}_{i}.png")
        if os.path.exists(png) and not a.force:
            continue
        t0 = time.time()
        try:
            spec = beat["fn"]()
            tb = time.time() - t0
            _, tr = render_spec(spec, png, res=(W, H), spp=a.spp, seed=i)
            if spec.get("endcard"):
                im = cv2.imread(png)[..., ::-1]
                ec = dict(spec["endcard"])
                im = typeset.endcard(np.ascontiguousarray(im), tagline=ec.pop("tagline", None), **ec)
                cv2.imwrite(png, im[..., ::-1])
            jpg = png.replace(".png", ".jpg")
            cv2.imwrite(jpg, cv2.imread(png), [cv2.IMWRITE_JPEG_QUALITY, 88])
            log[key] = dict(build=round(tb, 1), render=round(tr, 1), res=[W, H], spp=a.spp)
            print(f"{key} {film['title']}/{beat['name']}: build {tb:.0f}s render {tr:.0f}s", flush=True)
        except Exception:
            print(f"{key} FAILED", flush=True)
            traceback.print_exc()
        json.dump(log, open(log_path, "w"), indent=1)

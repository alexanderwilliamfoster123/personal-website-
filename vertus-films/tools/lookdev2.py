"""Bead look-dev: one bead set, several material/light/colour variants, contact sheet vs reference.
Usage: lookdev2.py OUT_PREFIX VARIANTS_JSON [w h spp nbeads form_idx]"""
import sys, os, json, time, hashlib
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from engine import mass as M
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from formdev import VARIANTS as FORMS, build

out = sys.argv[1]
VAR = json.loads(open(sys.argv[2]).read())
W, H, SPP, NB, FI = (int(a) for a in (sys.argv[3:8] if len(sys.argv) > 7 else (432, 768, 48, 500000, 0)))
bead_kw = VAR.get("beads", dict(r_small=0.0068, r_big=0.017, shell=0.07, fringe=0.14, stray=0.03))
key = hashlib.md5(json.dumps([FORMS[FI], bead_kw, NB]).encode()).hexdigest()[:10]
cache = f"/opt/vtx/out/cache/beads_{key}.npz"
os.makedirs("/opt/vtx/out/cache", exist_ok=True)
shape = build(FORMS[FI])
if os.path.exists(cache):
    B = dict(np.load(cache))
else:
    t0 = time.time()
    B = M.sample_beads(shape, NB, relax_iters=3, **bead_kw)
    np.savez(cache, **B)
    print(f"beads {len(B['P'])} {time.time()-t0:.1f}s", flush=True)

from engine import bl, post
import cv2
tiles = []
for i, v in enumerate(VAR["variants"]):
    t1 = time.time()
    bl.reset()
    bl.setup_render(res=(W, H), spp=SPP, threshold=0.03, look=v.get("look", "None"), view=v.get("view", "Khronos PBR Neutral"),
                    exposure=v.get("exposure", 0.0))
    bl.world_studio(strength=v.get("world", 0.5))
    c = B['P'].mean(0)
    bl.studio_lights(center=tuple(c), key=v.get("key", 1.0), rim=v.get("rim", 1.0), top=v.get("top", 0.7),
                     kick=v.get("kick", 0.0), key_dir=tuple(v.get("key_dir", (-0.55, -0.7, 0.62))),
                     rim_dir=tuple(v.get("rim_dir", (0.6, 0.55, 0.45))))
    tone_kw = v.get("tone", {})
    t = M.bead_tone(B, np.random.default_rng(1), **tone_kw)
    cols = M.palette.albedo(t, lift=v.get("lift", 0.0), sat=v.get("sat", 1.0)) * v.get("gain", 1.0)
    mat = bl.mat_beads(sss=v.get("sss", 0.35), rough=v.get("rough", 0.38), sheen=v.get("sheen", 0.25),
                       coat=v.get("coat", 0.15), sss_scale=v.get("sss_scale", 0.004))
    bl.pointcloud("mass", B['P'], B['R'], cols=np.clip(cols, 0, 1), mat=mat)
    cam = v.get("cam", [0.6, -7.2, 1.1])
    bl.camera((c[0] + cam[0], c[1] + cam[1], c[2] + cam[2]), tuple(c + np.array(v.get("aim", [0, 0, -0.05]))),
              lens=v.get("lens", 62), fstop=v.get("fstop", 1.8))
    raw = f"{out}_{i}_raw.png"; fin = f"{out}_{i}.png"
    bl.render(raw)
    post.finish(raw, fin)
    im = cv2.imread(fin)
    cv2.putText(im, f"{i} {v.get('name','')}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (40, 40, 40), 2)
    tiles.append(im)
    print(i, v.get('name', ''), f"{time.time()-t1:.1f}s", flush=True)
ref = cv2.imread(VAR.get("ref", "/tmp/claude-0/-home-user-personal-website-/fe971315-afb5-571b-a7ba-672a3fcd5cb1/images/1.webp"))
ref = cv2.resize(ref, (int(ref.shape[1] * H / ref.shape[0]), H))
cv2.imwrite(out + "_sheet.jpg", np.concatenate([ref] + tiles, 1), [cv2.IMWRITE_JPEG_QUALITY, 90])

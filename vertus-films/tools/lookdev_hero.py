"""Look-dev: hero bead mass, one still. Usage: python lookdev_hero.py OUT_PREFIX [w h spp nbeads]"""
import sys, time, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from engine import mass as M

out = sys.argv[1]
W, H, SPP, NB = (int(a) for a in (sys.argv[2:6] if len(sys.argv) > 5 else (540, 960, 64, 600000)))

t0 = time.time()
lobes = M.grow_lobes(seed=5, n=52, root_r=0.62, spread=(1.4, 0.9, 0.85), bias=(0.0, 0.0, 0.15))
shape = M.MassShape(lobes, k=0.30, warp_amp=0.22, warp_freq=0.85, bump_amp=0.07,
                    bump_freq=3.0, fold_amp=0.03, fold_freq=6.0)
B = M.sample_beads(shape, NB, r_small=0.0062, r_big=0.019, shell=0.07, fringe=0.14,
                   stray=0.03, relax_iters=3)
print(f"beads {len(B['P'])} in {time.time()-t0:.1f}s; bbox", B['P'].min(0).round(2), B['P'].max(0).round(2))
np.savez_compressed(out + "_beads.npz", **B)

t1 = time.time()
from engine import bl
bl.reset()
bl.setup_render(res=(W, H), spp=SPP, threshold=0.03)
bl.world_studio(strength=0.9)
c = B['P'].mean(0)
bl.studio_lights(center=tuple(c), key=1.0, rim=0.8, top=0.7)
cols = M.bead_albedo(B['t'])
mat = bl.mat_beads()
bl.pointcloud("mass", B['P'], B['R'], cols=cols, mat=mat)
lo, hi = B['P'].min(0), B['P'].max(0)
size = (hi - lo).max()
cam_loc = (c[0] + 0.6, c[1] - 7.2, c[2] + 1.1)
bl.camera(cam_loc, (c[0], c[1], c[2] - 0.05), lens=62, fstop=1.8)
bl.render(out + "_raw.png")
print(f"render {W}x{H} spp{SPP}: {time.time()-t1:.1f}s")
from engine import post
post.finish(out + "_raw.png", out + ".png")

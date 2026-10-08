"""Form-dev: clay renders of mass SDF variants, side by side. Usage: formdev.py OUT.png"""
import sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import numpy as np
from skimage.measure import marching_cubes
from engine import mass as M

VARIANTS = [
    dict(seed=2, base_r=0.5, arms=5, levels=(4, 4, 3), ratios=(0.55, 0.5, 0.45), protrude=0.5, bias=(0, 0, 0.2),
         k=0.3, warp_amp=0.35, warp_freq=0.45, bump_amp=0.05, bump_freq=3.0, fold_amp=0.0, fold_freq=6.0),
    dict(seed=2, base_r=0.5, arms=5, levels=(4, 3), ratios=(0.55, 0.5), protrude=0.5, bias=(0, 0, 0.2),
         k=0.3, warp_amp=0.3, warp_freq=0.5, bump_amp=0.22, bump_freq=1.7, fold_amp=0.0, fold_freq=6.0),
    dict(seed=9, base_r=0.42, arms=4, levels=(4, 4, 3), ratios=(0.55, 0.5, 0.45), protrude=0.5, bias=(0, 0, 1.4),
         k=0.3, warp_amp=0.4, warp_freq=0.5, bump_amp=0.06, bump_freq=2.6, fold_amp=0.0, fold_freq=6.0),
    dict(seed=4, base_r=0.55, arms=5, levels=(4, 3), ratios=(0.55, 0.5), protrude=0.4, bias=(0, 0, 0.0),
         k=0.3, warp_amp=0.25, warp_freq=0.5, bump_amp=0.05, bump_freq=2.5, fold_amp=0.09, fold_freq=2.6),
    dict(seed=4, base_r=0.55, arms=4, levels=(5, 4, 3), ratios=(0.5, 0.5, 0.45), protrude=0.35, bias=(0, 0, 0.1),
         k=0.25, warp_amp=0.45, warp_freq=0.42, bump_amp=0.04, bump_freq=3.2, fold_amp=0.03, fold_freq=4.0),
    dict(seed=12, base_r=0.45, arms=6, levels=(5, 4, 3), ratios=(0.42, 0.45, 0.45), protrude=0.6, bias=(0, 0, 0.3),
         k=0.3, warp_amp=0.4, warp_freq=0.45, bump_amp=0.03, bump_freq=4.0, fold_amp=0.0, fold_freq=6.0),
    dict(kind='plumes', seed=4, n=6, k=0.3, warp_amp=0.25, warp_freq=0.5, bump_amp=0.03, bump_freq=3.5, fold_amp=0.0, fold_freq=6.0),
    dict(kind='plumes', seed=11, n=7, extent=(2.8, 2.2), height=(0.9, 2.7), base_r=(0.15, 0.25), cap=1.6,
         k=0.3, warp_amp=0.22, warp_freq=0.55, bump_amp=0.025, bump_freq=4.0, fold_amp=0.0, fold_freq=6.0),
]

def build(v):
    if v.get('kind') == 'plumes':
        L = M.plume_field(seed=v['seed'], n=v.get('n', 5), extent=v.get('extent', (1.8, 1.4)),
                          height=v.get('height', (1.3, 2.4)), base_r=v.get('base_r', (0.22, 0.34)),
                          cap=v.get('cap', 1.35))
        return M.MassShape(L, k=v['k'], warp_amp=v['warp_amp'], warp_freq=v['warp_freq'], bump_amp=v['bump_amp'],
                           bump_freq=v['bump_freq'], fold_amp=v['fold_amp'], fold_freq=v['fold_freq'])
    L = M.cauliflower(seed=v['seed'], base_r=v['base_r'], arms=v['arms'], levels=v['levels'], ratios=v['ratios'],
                      protrude=v['protrude'], bias=v['bias'], spread=v.get('spread', (1.0, 0.8, 1.0)))
    return M.MassShape(L, k=v['k'], warp_amp=v['warp_amp'], warp_freq=v['warp_freq'], bump_amp=v['bump_amp'],
                       bump_freq=v['bump_freq'], fold_amp=v['fold_amp'], fold_freq=v['fold_freq'])

def mc(shape, res=150):
    lo, hi = shape.bbox(pad=0.25)
    h = (hi - lo).max() / res
    n = np.ceil((hi - lo) / h).astype(int) + 1
    xs = [lo[i] + np.arange(n[i]) * h for i in range(3)]
    G = np.stack(np.meshgrid(*xs, indexing='ij'), -1).reshape(-1, 3)
    d = shape.sdf(G).reshape(n)
    V, F, _, _ = marching_cubes(d, 0.0, spacing=(h, h, h))
    return V + lo, F

if __name__ == '__main__':
    out = sys.argv[1]
    which = json.loads(sys.argv[2]) if len(sys.argv) > 2 else list(range(len(VARIANTS)))
    from engine import bl
    import bpy
    tiles = []
    for i in which:
        t0 = time.time()
        shape = build(VARIANTS[i])
        V, F = mc(shape)
        bl.reset(); bl.setup_render(res=(360, 640), spp=24, threshold=0.05, transparent=False)
        bl.world_studio(strength=0.6)
        c = V.mean(0)
        bl.studio_lights(center=tuple(c))
        m = bl.mat_tissue(); 
        bl.mesh('m', V, F, mat=m, cols=np.tile([[0.55, 0.05, 0.15]], (len(V), 1)))
        size = (V.max(0) - V.min(0)).max()
        bl.camera((c[0] + 0.5, c[1] - size * 2.6, c[2] + 0.5), tuple(c), lens=50, fstop=None)
        p = f'/opt/vtx/out/lookdev/form_{i}.png'
        bl.render(p); tiles.append(p)
        print(i, f'{time.time()-t0:.1f}s tris {len(F)}', flush=True)
    import cv2
    ims = [cv2.imread(p) for p in tiles]
    for k, im in enumerate(ims):
        cv2.putText(im, str(which[k]), (12, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 0), 2)
    cv2.imwrite(out, np.concatenate(ims, 1))

# Vertus pink mass film

Procedural generator for the pink bead-mass hero film (`public/videos/vertus-pink-mass.mp4`).

Tens of thousands of glossy bead impostors per shot (three.js points with per-pixel sphere depth),
a half-res scatter-as-gather bokeh DOF pass, haze, grade and grain. Rendered frame by frame in
headless Chromium and piped into ffmpeg, so output is deterministic.

Shots (31s @ 30fps): Emerge → Terrain → Bloom → Drift → Core.

```bash
cd scripts/pink-mass-film
npm i --no-save three playwright
node render.mjs out.mp4                                      # full 1920x1080 film
node render.mjs stills --stills --w 960 --h 540 --step 90   # quick preview frames
```

Needs ffmpeg on PATH (or set `FFMPEG=/path/to/ffmpeg`).

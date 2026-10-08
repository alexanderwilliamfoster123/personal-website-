# Vertus flagship films

Code-only production of the Vertus "living mass" film series: form, simulation,
materials, camera, render, finishing and type are all generated from this folder.

## Setup

```bash
python3 -m venv /opt/vtx/venv
/opt/vtx/venv/bin/pip install bpy==5.2.2 numpy scipy numba opencv-python-headless pillow scikit-image
node tools/wordmark.cjs assets/vertus-wordmark.svg /opt/vtx/out/wordmark_wine.png 3200 '#1C0710'
node tools/wordmark.cjs assets/vertus-wordmark.svg /opt/vtx/out/wordmark_white.png 3200 '#FFFFFF'
```

`bpy` is Blender 5.2 as a Python module (Cycles included), so everything runs headless.

## Layout

| Path | What it is |
| --- | --- |
| `engine/palette.py` | The 8-stop magenta ramp sampled from the campaign references, plus the albedo trim |
| `engine/noise.py` | numba Perlin, fBm, billow, ridged and curl noise |
| `engine/mass.py` | The mass: cauliflower and plume lobe growth, SDF, bead packing, exposure-based tone |
| `engine/bl.py` | Blender layer: studio, lights, macro camera, bead/fibre/gel/tissue materials, geometry from arrays |
| `engine/post.py` | Backdrop composite, halation, lens fringing, grain |
| `engine/typeset.py` | End cards with the real wordmark and Inter Display |
| `films/common.py` | Shared shot building blocks and `render_spec` |
| `films/boards.py` | The six films, their beats, and a scene builder per beat |
| `films/render_boards.py` | Renders every storyboard panel |
| `storyboard/build_page.py` | Builds the storyboard page from `boards.py` and the panels |
| `tools/` | Look-dev and form-dev harnesses |

## Render the storyboards

```bash
cd vertus-films
/opt/vtx/venv/bin/python films/render_boards.py /opt/vtx/out/boards --res 540x960 --spp 64
/opt/vtx/venv/bin/python storyboard/build_page.py /opt/vtx/out/boards /opt/vtx/out/page /opt/vtx/out/page_extra
```

Renders and caches live outside the repo (`/opt/vtx/out`), so nothing heavy is committed.

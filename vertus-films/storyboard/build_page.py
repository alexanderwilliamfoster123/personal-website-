"""Build the storyboard page from films/boards.py metadata + rendered panels.

usage: python storyboard/build_page.py PANEL_DIR OUT_DIR
Writes OUT_DIR/index.html and OUT_DIR/img/*.jpg (publish OUT_DIR as the artifact).
"""
import html
import json
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
from films.boards import FILMS  # noqa: E402
from engine.palette import RAMP_HEX  # noqa: E402

panels, out = sys.argv[1], sys.argv[2]
os.makedirs(f"{out}/img", exist_ok=True)
esc = html.escape
times = json.load(open(f"{panels}/times.json")) if os.path.exists(f"{panels}/times.json") else {}

RAMP_NAMES = ["Wine", "Garnet", "Raspberry", "Vertus magenta", "Hot pink", "Flamingo", "Blush", "Pearl"]
EXTRA = sys.argv[3] if len(sys.argv) > 3 else None  # dir with hero.jpg + state crops


def copy(src, name):
    if os.path.exists(src):
        shutil.copy(src, f"{out}/img/{name}")
        return f"img/{name}"
    return None


svg = open(f"{ROOT}/assets/vertus-wordmark.svg").read()
svg = svg.replace('width="106" height="25"', 'viewBox="0 0 106 25" role="img" aria-label="Vertus"', 1)
svg = svg.replace('fill="black"', 'fill="currentColor"').replace(' viewBox="0 0 106 25" fill="none"', ' fill="none"', 1)

total = sum(f["runtime"] for f in FILMS)
shots = sum(len(f["beats"]) for f in FILMS)
fps = 24

hero_img = copy(f"{EXTRA}/hero.jpg", "hero.jpg") if EXTRA else None
states = []
for key, label, note in [("bead", "Bead", "Millions of packed satin beads with subsurface glow. The default state."),
                         ("fibre", "Fibre", "Hair-shaded fur with spore-white tips. Threads of reasoning."),
                         ("gel", "Gel", "Refractive magenta gel with trapped bubbles. A decision, made clear."),
                         ("tissue", "Tissue", "Smooth folded tissue stippled with micro-beads. Memory and structure.")]:
    src = copy(f"{EXTRA}/state_{key}.jpg", f"state_{key}.jpg") if EXTRA else None
    states.append((src, label, note))

# ------------------------------------------------------------------ page
H = []
w = H.append
w("""<title>Vertus Living Mass Storyboards</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..800&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Layout: a production board. Masthead, then one sheet per film: an info rail and a strip of 9:16 frames read left to right in time. */
:root {
  --paper: #FAF8F9; --sheet: #FFFFFF; --ink: #1C0710; --ink-2: #6B5361; --rule: #EADFE5;
  --accent: #C30F4E; --wine: #4C0111; --pearl: #FCBAD8; --frame-edge: #E4D6DD;
  --display: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --body: "Instrument Sans", "Helvetica Neue", Arial, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px; --s5: 24px; --s6: 40px; --s7: 64px; --s8: 104px;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --paper: #120A0F; --sheet: #1B1117; --ink: #F7EEF2; --ink-2: #BBA4B0; --rule: #33222C;
  --accent: #FF5C95; --frame-edge: #3A2732; color-scheme: dark } }
:root[data-theme="dark"] {
  --paper: #120A0F; --sheet: #1B1117; --ink: #F7EEF2; --ink-2: #BBA4B0; --rule: #33222C;
  --accent: #FF5C95; --frame-edge: #3A2732; color-scheme: dark }
* { box-sizing: border-box }
body { background: var(--paper); color: var(--ink); font: 400 16px/1.55 var(--body); margin: 0 }
.wrap { max-width: 1320px; margin: 0 auto; padding-inline: clamp(16px, 4vw, 48px); padding-block: var(--s6) var(--s8) }
h1, h2, h3, h4 { font-family: var(--display); margin: 0; text-wrap: balance }
p { margin: 0 }
.eyebrow { font: 500 12px/1.3 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--ink-2) }
.mono { font-family: var(--mono) }
a { color: inherit }
a:focus-visible, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px }

/* masthead */
.mast { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: var(--s6); align-items: end;
  padding-bottom: var(--s6); border-bottom: 1px solid var(--rule) }
.mark { width: min(300px, 62%); color: var(--ink); display: block; margin-bottom: var(--s6) }
.mark svg { width: 100%; height: auto; display: block }
.mast h1 { font-size: clamp(44px, 7.4vw, 104px); font-variation-settings: "wdth" 118; font-weight: 700;
  line-height: .92; letter-spacing: -.02em; margin-block: var(--s3) var(--s5) }
.mast h1 em { font-style: normal; color: var(--accent) }
.dek { font-size: clamp(17px, 1.5vw, 20px); max-width: 34em; color: var(--ink) }
.specs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s4) var(--s5); margin: var(--s6) 0 0; padding: 0 }
.specs div { border-top: 1px solid var(--rule); padding-top: var(--s2) }
.specs dt { font: 500 11px/1.3 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-2) }
.specs dd { margin: 2px 0 0; font: 600 15px/1.3 var(--body); font-variant-numeric: tabular-nums }
.status { display: inline-flex; align-items: center; gap: var(--s2); font: 500 12px/1 var(--mono); letter-spacing: .08em;
  text-transform: uppercase; color: var(--accent); border: 1px solid currentColor; border-radius: 999px; padding: 6px 12px }
.status::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: currentColor }
.hero { margin: 0; justify-self: end; width: min(100%, 420px) }
.hero img, .frame img { display: block; width: 100%; aspect-ratio: 9 / 16; object-fit: cover; background: #fff }
.hero img { border: 1px solid var(--frame-edge) }
.hero figcaption { font: 400 12px/1.45 var(--mono); color: var(--ink-2); margin-top: var(--s2) }

/* index */
.index { list-style: none; margin: 0; padding: var(--s5) 0; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--s3); border-bottom: 1px solid var(--rule) }
.index a { display: grid; gap: 2px; text-decoration: none; padding: var(--s2) 0 }
.index .n { font: 500 12px var(--mono); color: var(--accent) }
.index .t { font: 650 19px/1.1 var(--display); font-variation-settings: "wdth" 112 }
.index .f { font-size: 13px; color: var(--ink-2) }
.index a:hover .t { color: var(--accent) }

/* sections */
section { padding-top: var(--s7) }
.sec-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); gap: var(--s6); align-items: end; margin-bottom: var(--s5) }
.sec-head h2 { font-size: clamp(30px, 3.6vw, 48px); font-variation-settings: "wdth" 112; font-weight: 680; line-height: 1 }
.sec-head p { color: var(--ink-2); max-width: 40em }

.ramp { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 0; border: 1px solid var(--frame-edge) }
.chip { aspect-ratio: 1 / 1.25; display: flex; flex-direction: column; justify-content: flex-end; padding: var(--s2);
  font: 500 11px/1.35 var(--mono); min-width: 0 }
.chip b { font: 600 12px/1.2 var(--body); display: block; overflow-wrap: anywhere }
.states { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--s4); margin-top: var(--s5) }
.state img { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; display: block; border: 1px solid var(--frame-edge); background: #fff }
.state h3 { font-size: 18px; font-variation-settings: "wdth" 112; margin-top: var(--s2) }
.state p { font-size: 14px; color: var(--ink-2) }
.rules { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--s5); margin-top: var(--s6) }
.rules h3 { font: 500 12px/1.3 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--accent); margin-bottom: var(--s2) }
.rules p { font-size: 14.5px }

/* film sheets */
.film { border-top: 1px solid var(--rule); margin-top: var(--s7); padding-top: var(--s6) }
.film-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); gap: var(--s6); margin-bottom: var(--s5) }
.film-title { display: flex; align-items: baseline; gap: var(--s4); flex-wrap: wrap }
.film-title .num { font: 500 15px var(--mono); color: var(--accent) }
.film-title h2 { font-size: clamp(42px, 6vw, 84px); font-variation-settings: "wdth" 120; font-weight: 720; line-height: .95; letter-spacing: -.015em }
.film-meta { margin-top: var(--s3); display: flex; gap: var(--s2) var(--s4); flex-wrap: wrap; font: 500 12px/1.3 var(--mono);
  letter-spacing: .06em; text-transform: uppercase; color: var(--ink-2) }
.logline { font-size: clamp(18px, 1.6vw, 21px); line-height: 1.45; margin-bottom: var(--s4) }
.floor { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); gap: var(--s4); font-size: 14.5px }
.floor h3 { font: 500 11px/1.3 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-2); margin-bottom: var(--s1) }
.floor ul { margin: 0; padding-left: 1.1em }
.floor li + li { margin-top: var(--s1) }

.panels { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s4) var(--s3);
  grid-template-columns: repeat(var(--n), minmax(0, 1fr)) }
.panel { display: grid; grid-template-rows: auto 1fr; min-width: 0 }
.frame { all: unset; cursor: zoom-in; display: block; position: relative; border: 1px solid var(--frame-edge) }
.frame:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px }
.frame .safe { position: absolute; left: 0; right: 0; top: 14.84%; bottom: 14.84%; border-block: 1px dashed rgba(195, 15, 78, .35); pointer-events: none }
.cap { padding-top: var(--s3); display: grid; gap: 6px; align-content: start; font-size: 13.5px; line-height: 1.45 }
.tc { display: flex; justify-content: space-between; font: 500 11px/1 var(--mono); letter-spacing: .06em; color: var(--ink-2); font-variant-numeric: tabular-nums }
.tc b { color: var(--accent); font-weight: 500 }
.cap h4 { font-size: 17px; font-variation-settings: "wdth" 110; font-weight: 650 }
.spec { font: 400 11.5px/1.35 var(--mono); color: var(--ink-2) }
.cap dl { margin: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 2px var(--s2); font-size: 12.5px; color: var(--ink-2) }
.cap dt { font: 500 10.5px/1.6 var(--mono); letter-spacing: .06em; text-transform: uppercase }
.cap dd { margin: 0 }
.super { font-weight: 600; color: var(--ink); border-left: 2px solid var(--accent); padding-left: var(--s2) }

/* production */
.pipeline { list-style: none; counter-reset: step; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: var(--s4) }
.pipeline li { counter-increment: step; border-top: 2px solid var(--ink); padding-top: var(--s3); font-size: 14px; min-width: 0 }
.pipeline li::before { content: counter(step, decimal-leading-zero); font: 500 12px var(--mono); color: var(--accent); display: block; margin-bottom: var(--s1) }
.pipeline b { display: block; font: 650 16px/1.2 var(--display); font-variation-settings: "wdth" 110; margin-bottom: var(--s1) }
.tbl { overflow-x: auto; margin-top: var(--s6) }
table { border-collapse: collapse; width: 100%; min-width: 640px; font-size: 14px; font-variant-numeric: tabular-nums }
th, td { text-align: left; padding: 10px 12px 10px 0; border-bottom: 1px solid var(--rule); vertical-align: top }
th { font: 500 11px/1.3 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--ink-2) }
td.num, th.num { text-align: right }
tfoot td { font-weight: 600; border-bottom: 0 }
.cols2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--s6); margin-top: var(--s6) }
.cols2 h3 { font-size: 22px; font-variation-settings: "wdth" 112; margin-bottom: var(--s3) }
.cols2 ul, .cols2 ol { margin: 0; padding-left: 1.2em; display: grid; gap: var(--s2) }
.foot { margin-top: var(--s7); padding-top: var(--s4); border-top: 1px solid var(--rule); font: 400 12px/1.5 var(--mono); color: var(--ink-2) }

/* lightbox */
dialog { border: 0; padding: 0; background: transparent; max-width: min(96vw, 620px); max-height: 96vh }
dialog::backdrop { background: rgba(18, 6, 12, .82) }
dialog img { display: block; max-height: 86vh; width: auto; max-width: 100%; margin: 0 auto; background: #fff }
dialog p { color: #F7EEF2; font: 400 13px/1.4 var(--mono); margin-top: var(--s2); text-align: center }
dialog button { position: fixed; top: max(12px, env(safe-area-inset-top, 0px)); right: 12px; font: 500 13px var(--mono); color: #F7EEF2;
  background: rgba(255, 255, 255, .12); border: 1px solid rgba(255, 255, 255, .3); border-radius: 999px; padding: 8px 14px; cursor: pointer }

@media (max-width: 1100px) {
  .panels { grid-template-columns: repeat(3, minmax(0, 1fr)) }
  .pipeline { grid-template-columns: repeat(3, minmax(0, 1fr)) }
  .rules { grid-template-columns: repeat(2, minmax(0, 1fr)) }
  .index { grid-template-columns: repeat(3, minmax(0, 1fr)) }
}
@media (max-width: 760px) {
  .mast, .film-head, .sec-head, .floor, .cols2 { grid-template-columns: minmax(0, 1fr) }
  .hero { justify-self: start }
  .panels { grid-template-columns: repeat(2, minmax(0, 1fr)) }
  .states { grid-template-columns: repeat(2, minmax(0, 1fr)) }
  .ramp { grid-template-columns: repeat(4, minmax(0, 1fr)) }
  .pipeline { grid-template-columns: minmax(0, 1fr) }
  .specs { grid-template-columns: repeat(2, minmax(0, 1fr)) }
  .index { grid-template-columns: repeat(2, minmax(0, 1fr)) }
}
@media (prefers-reduced-motion: no-preference) { .frame img { transition: transform .4s ease } .frame:hover img { transform: scale(1.012) } }
</style>
""")

w('<div class="wrap">')
w('<header class="mast"><div>')
w(f'<span class="mark">{svg}</span>')
w('<span class="status">Storyboards v1 · for approval</span>')
w('<h1>The Living <em>Mass</em></h1>')
w(f'<p class="dek">{len(FILMS)} flagship films for the November launch. Each one is a single behaviour of the same living mass: '
  'how a mind forms, merges, decides, adapts, fires and goes deep. Every panel below was rendered by the production engine, '
  'so this is the real look at preview resolution, not a sketch.</p>')
w('<dl class="specs">')
for k, v in [("Films", str(len(FILMS))), ("Total runtime", f"{total} s"), ("Shots", str(shots)),
             ("Master", "1080 × 1920 · 9:16"), ("Frame rate", f"{fps} fps"), ("Render", "Path-traced, Cycles")]:
    w(f'<div><dt>{k}</dt><dd>{v}</dd></div>')
w('</dl></div>')
if hero_img:
    w(f'<figure class="hero"><img src="{hero_img}" alt="Bead towers of the Vertus mass in macro, magenta on a white studio cyclorama" '
      'width="1080" height="1920"><figcaption>Look-dev frame at full master resolution, 1080 × 1920. 700,000 beads, '
      '64 samples, 147 s on one 4-core machine.</figcaption></figure>')
w('</header>')

w('<nav aria-label="Films"><ol class="index">')
for f in FILMS:
    w(f'<li><a href="#f{f["id"]}"><span class="n">{f["id"]}</span><span class="t">{esc(f["title"])}</span>'
      f'<span class="f">{esc(f["faculty"])} · {f["runtime"]} s</span></a></li>')
w('</ol></nav>')

# the mass
w('<section id="mass"><div class="sec-head"><h2>One mass, four states</h2>'
  '<p>Every film uses the same organism. Its colour is the campaign ramp, sampled from your references, '
  'and it only ever changes state, never identity.</p></div>')
w('<div class="ramp" role="list" aria-label="Mass palette, deep to light">')
for i, (hx, nm) in enumerate(zip(RAMP_HEX, RAMP_NAMES)):
    fg = "#FFFFFF" if i < 5 else "#1C0710"
    w(f'<div class="chip" role="listitem" style="background:{hx};color:{fg}"><b>{nm}</b>{hx}</div>')
w('</div>')
if any(s[0] for s in states):
    w('<div class="states">')
    for src, label, note in states:
        if src:
            w(f'<figure class="state" style="margin:0"><img src="{src}" alt="{label} state of the mass" loading="lazy">'
              f'<h3>{label}</h3><p>{esc(note)}</p></figure>')
    w('</div>')
w('<div class="rules">')
for h, p in [("Light", "White cyclorama. One big soft key and a rim from behind, almost no fill, so the folds fall to wine."),
             ("Lens", "Macro primes, 22 to 100 mm, f/1.6 to f/8. Shallow focus does the depth work."),
             ("Motion", "Nothing is keyframed. Beads ride divergence-free flow fields, and the mass breathes on a four-second cycle."),
             ("Sound", "Built from the simulation. Each division, collision and pulse fires its own sound, in sync by construction."),
             ("Type", "The Vertus wordmark from the brand SVG, plus one line in Inter Display. Nothing else on screen.")]:
    w(f'<div><h3>{h}</h3><p>{p}</p></div>')
w('</div></section>')

# films
for f in FILMS:
    n = len(f["beats"])
    w(f'<section class="film" id="f{f["id"]}">')
    w('<div class="film-head"><div>')
    w(f'<div class="film-title"><span class="num">{f["id"]}</span><h2>{esc(f["title"])}</h2></div>')
    frames = f["runtime"] * fps
    w(f'<p class="film-meta"><span>{esc(f["faculty"])}</span><span>{f["runtime"]} s</span><span>{n} shots</span>'
      f'<span>{frames} frames</span></p>')
    w('</div><div>')
    w(f'<p class="logline">{esc(f["logline"])}</p>')
    w('<div class="floor"><div><h3>Reference floor</h3>'
      f'<p>{esc(f["floor"])}</p></div><div><h3>Where we go past it</h3><ul>')
    for a in f["above"]:
        w(f'<li>{esc(a)}</li>')
    w('</ul></div></div></div></div>')
    w(f'<ol class="panels" style="--n:{n}">')
    for i, b in enumerate(f["beats"]):
        img = copy(f"{panels}/f{f['id']}_{i}.jpg", f"f{f['id']}_{i}.jpg")
        alt = f"{f['title']}, shot {i + 1}: {b['name']}"
        w('<li class="panel">')
        if img:
            w(f'<button class="frame" type="button" data-full="{img}" data-cap="{esc(alt)} · {b["tc"]}" aria-label="Enlarge {esc(alt)}">'
              f'<img src="{img}" alt="{esc(alt)}" loading="lazy" width="540" height="960"><span class="safe" aria-hidden="true"></span></button>')
        w('<div class="cap">')
        w(f'<p class="tc"><b>SH {i + 1:02d}</b><span>{b["tc"]}</span></p>')
        w(f'<h4>{esc(b["name"])}</h4><p class="spec">{esc(b["shot"])}</p>')
        w(f'<p>{esc(b["action"])}</p>')
        w(f'<dl><dt>Cam</dt><dd>{esc(b["camera"])}</dd><dt>Sound</dt><dd>{esc(b["sound"])}</dd></dl>')
        if b.get("super"):
            w(f'<p class="super">Super: {esc(b["super"])}</p>')
        w('</div></li>')
    w('</ol></section>')

# production
rows = []
for f in FILMS:
    frames = f["runtime"] * fps
    heavy = f["slug"] in ("resolve", "states", "depth")
    spf = 240 if heavy else 150
    hrs = frames * spf / 3600
    rows.append((f, frames, spf, hrs))
tot_frames = sum(r[1] for r in rows)
tot_hrs = sum(r[3] for r in rows)
w('<section id="production"><div class="sec-head"><h2>How it gets made</h2>'
  '<p>Everything is code: form, simulation, materials, camera and sound. The same scripts that drew these boards render the masters.</p></div>')
w('<ol class="pipeline">')
for t, d in [("Form", "Lobed cerebral mass from signed distance fields and noise, grown like cauliflower."),
             ("Matter", "Up to a million beads packed per shot, plus fibres, gel and tissue meshes."),
             ("Motion", "Flow-field simulation per frame: division, flocking, collision, flurry."),
             ("Render", "Blender Cycles path tracing: subsurface beads, hair shading, refraction, true depth of field."),
             ("Finish", "Studio backdrop, halation, lens fringing and grain, plus the wordmark end card."),
             ("Sound", "Procedural sound design generated from the simulation's own events, then the mix.")]:
    w(f'<li><b>{t}</b>{d}</li>')
w('</ol>')
w('<div class="tbl"><table><thead><tr><th>Film</th><th class="num">Runtime</th><th class="num">Frames</th>'
  '<th class="num">Est. s / frame</th><th class="num">One machine</th><th class="num">Six in parallel</th></tr></thead><tbody>')
for f, frames, spf, hrs in rows:
    w(f'<tr><td>{f["id"]} {esc(f["title"])}</td><td class="num">{f["runtime"]} s</td><td class="num">{frames:,}</td>'
      f'<td class="num">{spf}</td><td class="num">{hrs:.0f} h</td><td class="num">{hrs:.0f} h</td></tr>')
w(f'</tbody><tfoot><tr><td>Series</td><td class="num">{total} s</td><td class="num">{tot_frames:,}</td><td></td>'
  f'<td class="num">{tot_hrs:.0f} h</td><td class="num">{max(r[3] for r in rows):.0f} h</td></tr></tfoot></table></div>')
w('<p class="spec" style="margin-top:8px">Seconds per frame measured on look-dev at 1080 × 1920 and 64 samples: 147 s for bead shots; '
  'fibre and gel shots are estimated higher. "Six in parallel" runs each film in its own render session at the same time. '
  'The same code on a single NVIDIA GPU renders roughly 10 to 20 times faster.</p>')
w('<div class="cols2"><div><h3>Deliverables per film</h3><ul>'
  '<li>9:16 master, 1080 × 1920, 24 fps, H.264 high bitrate plus ProRes 422 HQ</li>'
  '<li>4:5 feed cut, 1080 × 1350 (the dashed lines on every panel mark that crop)</li>'
  '<li>Sound design stem and full mix</li>'
  '<li>Six-second hook cutdown for paid placements</li>'
  '<li>Still frames from every shot at master resolution</li></ul></div>')
w('<div><h3>What I need from you</h3><ol>'
  '<li>Approve, cut or reorder the six films. Origin is the hero; the others can ship as a sequence.</li>'
  '<li>Approve or rewrite the six supers (the one line on each end card).</li>'
  '<li>Runtimes: 12 to 20 s as boarded. Say if Reels needs anything shorter.</li>'
  '<li>Sound: procedural sound design only (as boarded), or a composed music bed.</li>'
  '<li>Render plan: run the six films in parallel sessions to finish in about a day.</li></ol></div></div>')
w('</section>')
w('<p class="foot">Panels: 540 × 960 previews from the production engine (Blender 5.2 Cycles via Python, numba simulation), '
  'lower sample counts than the masters. Palette sampled from the campaign references. Wordmark from the Vertus brand SVG.</p>')
w('</div>')
w("""<dialog id="lb" aria-label="Enlarged frame"><button type="button" id="lbx">Close</button><img id="lbi" alt=""><p id="lbc"></p></dialog>
<script>
(() => {
  const lb = document.getElementById('lb'), img = document.getElementById('lbi'), cap = document.getElementById('lbc');
  document.querySelectorAll('.frame').forEach(b => b.addEventListener('click', () => {
    img.src = b.dataset.full; img.alt = b.dataset.cap; cap.textContent = b.dataset.cap;
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
  }));
  const close = () => { if (lb.close) lb.close(); else lb.removeAttribute('open'); };
  document.getElementById('lbx').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
})();
</script>""")
open(f"{out}/index.html", "w").write("\n".join(H))
print("wrote", f"{out}/index.html", sum(os.path.getsize(f"{out}/img/{x}") for x in os.listdir(f"{out}/img")) // 1024, "KB images")

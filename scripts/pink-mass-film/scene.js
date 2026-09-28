// Vertus "pink mass" film — original shot design.
// Opaque sphere impostors (correct per-pixel depth) -> half-res bokeh DOF -> haze/grade/grain.
import * as THREE from 'three';

const params = new URLSearchParams(location.search);
const W = +(params.get('w') || 1920), H = +(params.get('h') || 1080);
const FPS = 30;

// ---------- deterministic RNG + simplex noise ----------
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const grad3 = new Float32Array([1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1]);
const perm = new Uint8Array(512);
{ const r = mulberry(1337); const p = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) perm[i] = p[i & 255]; }
const F3 = 1 / 3, G3 = 1 / 6;
function noise3(x, y, z) {
  const s = (x + y + z) * F3; const i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s);
  const t = (i + j + k) * G3; const x0 = x - i + t, y0 = y - j + t, z0 = z - k + t;
  let i1, j1, k1, i2, j2, k2;
  if (x0 >= y0) { if (y0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; } else if (x0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; } else { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; } }
  else { if (y0 < z0) { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; } else if (x0 < z0) { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; } else { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; } }
  const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3, x2 = x0 - i2 + 2*G3, y2 = y0 - j2 + 2*G3, z2 = z0 - k2 + 2*G3, x3 = x0 - 1 + 3*G3, y3 = y0 - 1 + 3*G3, z3 = z0 - 1 + 3*G3;
  const ii = i & 255, jj = j & 255, kk = k & 255;
  let n = 0, tt, g;
  tt = 0.6 - x0*x0 - y0*y0 - z0*z0; if (tt > 0) { g = (perm[ii + perm[jj + perm[kk]]] % 12) * 3; tt *= tt; n += tt*tt*(grad3[g]*x0 + grad3[g+1]*y0 + grad3[g+2]*z0); }
  tt = 0.6 - x1*x1 - y1*y1 - z1*z1; if (tt > 0) { g = (perm[ii+i1 + perm[jj+j1 + perm[kk+k1]]] % 12) * 3; tt *= tt; n += tt*tt*(grad3[g]*x1 + grad3[g+1]*y1 + grad3[g+2]*z1); }
  tt = 0.6 - x2*x2 - y2*y2 - z2*z2; if (tt > 0) { g = (perm[ii+i2 + perm[jj+j2 + perm[kk+k2]]] % 12) * 3; tt *= tt; n += tt*tt*(grad3[g]*x2 + grad3[g+1]*y2 + grad3[g+2]*z2); }
  tt = 0.6 - x3*x3 - y3*y3 - z3*z3; if (tt > 0) { g = (perm[ii+1 + perm[jj+1 + perm[kk+1]]] % 12) * 3; tt *= tt; n += tt*tt*(grad3[g]*x3 + grad3[g+1]*y3 + grad3[g+2]*z3); }
  return 32 * n;
}
// "cauliflower" fbm: billowy (abs) octaves so the surface is lumps-on-lumps
function lumps(x, y, z, oct = 4) {
  let a = 0.5, f = 1, s = 0;
  for (let o = 0; o < oct; o++) { s += a * Math.abs(noise3(x*f + o*17.1, y*f - o*9.3, z*f + o*3.7)); a *= 0.5; f *= 2.07; }
  return s;
}
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, alpha: false });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
document.body.appendChild(renderer.domElement);

const SS = 1; // scene target scale
const sceneRT = new THREE.WebGLRenderTarget(W*SS, H*SS, { type: THREE.HalfFloatType, depthBuffer: true, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
const halfRT = new THREE.WebGLRenderTarget(W/2, H/2, { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
const dofRT = new THREE.WebGLRenderTarget(W/2, H/2, { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });

const camera = new THREE.PerspectiveCamera(28, W / H, 0.05, 60);
const scene = new THREE.Scene();

const beadMat = new THREE.ShaderMaterial({
  glslVersion: THREE.GLSL3,
  uniforms: { uScale: { value: H / (2 * Math.tan(THREE.MathUtils.degToRad(28) / 2)) }, uLight: { value: new THREE.Vector3(-0.45, 0.75, 0.5).normalize() }, uProj: { value: new THREE.Matrix4() } },
  vertexShader: /* glsl */`
    in float aRadius; in vec3 aTint;
    uniform float uScale;
    out vec3 vCenter; out float vRadius; out vec3 vTint;
    void main(){
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vCenter = mv.xyz; vRadius = aRadius; vTint = aTint;
      gl_Position = projectionMatrix * mv;
      gl_PointSize = max(1.5, 2.0 * aRadius * uScale / -mv.z);
    }`,
  fragmentShader: /* glsl */`
    precision highp float;
    in vec3 vCenter; in float vRadius; in vec3 vTint;
    uniform vec3 uLight; uniform mat4 uProj;
    layout(location=0) out vec4 outColor;
    void main(){
      vec2 q = gl_PointCoord * 2.0 - 1.0; q.y = -q.y;
      float r2 = dot(q, q); if (r2 > 1.0) discard;
      vec3 n = vec3(q, sqrt(1.0 - r2));
      vec3 pos = vCenter + n * vRadius;
      vec4 clip = uProj * vec4(pos, 1.0);
      gl_FragDepth = clip.z / clip.w * 0.5 + 0.5;
      // view-space light (fixed to camera-ish so the look is consistent between shots)
      vec3 L = uLight; vec3 V = vec3(0,0,1);
      float ndl = dot(n, L);
      float wrap = clamp((ndl + 0.55) / 1.55, 0.0, 1.0);
      vec3 H = normalize(L + V);
      float spec = pow(max(dot(n, H), 0.0), 60.0);
      float fres = pow(1.0 - n.z, 2.5);
      vec3 base = vTint;
      // subsurface: shadowed side goes deeper/more saturated instead of grey
      vec3 deep = base * vec3(0.66, 0.40, 0.74);
      vec3 col = mix(deep, base * 1.1, wrap);
      col += vec3(1.0, 0.86, 0.93) * spec * 0.55;
      col += mix(base, vec3(1.0, 0.8, 0.9), 0.5) * fres * 0.35 * (0.4 + 0.6 * wrap);
      outColor = vec4(col, -pos.z); // alpha carries linear depth
    }`,
});

let points = null;
function setParticles(n) {
  if (points) { scene.remove(points); points.geometry.dispose(); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute('aRadius', new THREE.BufferAttribute(new Float32Array(n), 1));
  g.setAttribute('aTint', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  points = new THREE.Points(g, beadMat); points.frustumCulled = false; scene.add(points);
  return g;
}

// ---------- full-screen passes ----------
const fsGeo = new THREE.BufferGeometry();
fsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1,-1,0, 3,-1,0, -1,3,0]), 3));
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
function pass(frag, uniforms) {
  const m = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, uniforms, depthTest: false, depthWrite: false,
    vertexShader: `out vec2 vUv; void main(){ vUv = position.xy*0.5+0.5; gl_Position = vec4(position.xy,0.0,1.0); }`, fragmentShader: frag });
  const s = new THREE.Scene(); const mesh = new THREE.Mesh(fsGeo, m); mesh.frustumCulled = false; s.add(mesh);
  return { m, run(target) { renderer.setRenderTarget(target); renderer.render(s, fsCam); } };
}

// background + haze + CoC prep at half res (rgb = hazed color, a = signed CoC in half-res px)
const COMMON = /* glsl */`
  uniform vec3 uBgA; uniform vec3 uBgB; uniform vec3 uHaze; uniform float uHazeDist; uniform float uHazeAmt;
  uniform float uFocus; uniform float uAperture; uniform float uMaxCoc; uniform vec2 uBgBlob;
  vec3 bgAt(vec2 uv){
    float g = smoothstep(-0.2, 1.2, uv.y + 0.15*sin(uv.x*2.3));
    vec3 c = mix(uBgA, uBgB, g);
    // soft out-of-focus colour blooms far behind the subject
    float d = length((uv - uBgBlob) * vec2(1.6, 1.0));
    c = mix(c, uHaze, smoothstep(0.9, 0.0, d) * 0.55);
    return c;
  }
  vec4 shade(vec2 uv, vec4 s){
    float depth = s.a;
    bool bg = depth <= 0.0;
    vec3 c = bg ? bgAt(uv) : s.rgb;
    if (bg) depth = 60.0;
    else { float h = 1.0 - exp(-max(depth - uHazeDist, 0.0) * uHazeAmt); c = mix(c, bgAt(uv), clamp(h,0.0,1.0)); }
    float coc = clamp((1.0/uFocus - 1.0/depth) * uAperture, -1.0, 1.0) * uMaxCoc;
    return vec4(c, coc);
  }`;
const hazeU = {
  tScene: { value: sceneRT.texture }, uBgA: { value: new THREE.Color() }, uBgB: { value: new THREE.Color() }, uHaze: { value: new THREE.Color() },
  uHazeDist: { value: 3 }, uHazeAmt: { value: 0.3 }, uFocus: { value: 3 }, uAperture: { value: 1 }, uMaxCoc: { value: 22 }, uBgBlob: { value: new THREE.Vector2(0.7, 0.6) },
};
const prepPass = pass(/* glsl */`precision highp float; in vec2 vUv; uniform sampler2D tScene; out vec4 o; ${COMMON}
  uniform vec2 uTexel;
  void main(){
    // 2x2 downsample keeping the nearest sample's depth for stable edges
    vec4 a = texture(tScene, vUv + uTexel*vec2(-0.5,-0.5)), b = texture(tScene, vUv + uTexel*vec2(0.5,-0.5));
    vec4 c = texture(tScene, vUv + uTexel*vec2(-0.5,0.5)), d = texture(tScene, vUv + uTexel*vec2(0.5,0.5));
    vec4 sa = shade(vUv, a), sb = shade(vUv, b), sc = shade(vUv, c), sd = shade(vUv, d);
    vec3 col = (sa.rgb + sb.rgb + sc.rgb + sd.rgb) * 0.25;
    float coc = sa.a; if (abs(sb.a) < abs(coc)) coc = sb.a; if (abs(sc.a) < abs(coc)) coc = sc.a; if (abs(sd.a) < abs(coc)) coc = sd.a;
    // near-field: let foreground blur dominate
    float nearC = min(min(sa.a, sb.a), min(sc.a, sd.a)); if (nearC < -1.0) coc = nearC;
    o = vec4(col, coc);
  }`, { ...hazeU, uTexel: { value: new THREE.Vector2(1 / W, 1 / H) } });

// scatter-as-gather bokeh (after D. Gustafsson), in half-res pixels
const dofPass = pass(/* glsl */`precision highp float; in vec2 vUv; uniform sampler2D tHalf; uniform vec2 uPx; uniform float uMaxCoc; out vec4 o;
  const float GA = 2.39996323;
  void main(){
    vec4 c0 = texture(tHalf, vUv);
    float cs = abs(c0.a);
    vec3 col = c0.rgb; float tot = 1.0; float radius = 0.6;
    for (float ang = 0.0; radius < uMaxCoc; ang += GA) {
      vec4 s = texture(tHalf, vUv + vec2(cos(ang), sin(ang)) * uPx * radius);
      float ss = abs(s.a);
      if (s.a > c0.a) ss = min(ss, cs * 2.0);          // things behind can't bleed over sharper foreground
      float m = smoothstep(radius - 0.6, radius + 0.6, ss);
      // bokeh highlights: bright samples get a little more weight
      float w = 1.0 + 0.6 * smoothstep(0.85, 1.1, dot(s.rgb, vec3(0.33)));
      col += mix(col / tot, s.rgb, m) * w; tot += w;
      radius += 1.1 / radius;
    }
    o = vec4(col / tot, c0.a);
  }`, { tHalf: { value: halfRT.texture }, uPx: { value: new THREE.Vector2(2 / W, 2 / H) }, uMaxCoc: hazeU.uMaxCoc });

const finalPass = pass(/* glsl */`precision highp float; in vec2 vUv; uniform sampler2D tScene; uniform sampler2D tDof; out vec4 o; ${COMMON}
  uniform float uTime; uniform float uFade; uniform vec3 uFadeCol; uniform float uGrain;
  float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  void main(){
    vec4 full = shade(vUv, texture(tScene, vUv));
    vec4 blur = texture(tDof, vUv);
    float coc = abs(blur.a);
    vec3 c = mix(full.rgb, blur.rgb, smoothstep(0.4, 1.6, max(coc, abs(full.a))));
    // gentle bloom-ish lift of highlights from the blurred buffer
    c += max(blur.rgb - 0.82, 0.0) * 0.35;
    // grade: slightly lifted blacks, warm-pink highlights
    c = pow(max(c, 0.0), vec3(0.97, 1.0, 0.98));
    float v = smoothstep(1.25, 0.35, length((vUv - 0.5) * vec2(1.25, 1.0)));
    c *= mix(0.86, 1.0, v);
    c = mix(c, uFadeCol, uFade);
    c = pow(c, vec3(1.0/2.2));
    c += (hash(vUv * 1000.0 + uTime * 7.13) - 0.5) * uGrain;
    o = vec4(c, 1.0);
  }`, { ...hazeU, tDof: { value: dofRT.texture }, uTime: { value: 0 }, uFade: { value: 0 }, uFadeCol: { value: new THREE.Color() }, uGrain: { value: 0.035 } });
for (const p of [prepPass, finalPass]) for (const k of Object.keys(hazeU)) p.m.uniforms[k] = hazeU[k];

// ---------- palette (linear) ----------
const hex = h => new THREE.Color(h).convertSRGBToLinear();
const PAL = {
  pale: hex('#fde3f1'), light: hex('#f9a6d4'), mid: hex('#f455aa'), hot: hex('#ec1a98'), deep: hex('#c40a8c'),
  bgA: hex('#f7eef2'), bgB: hex('#fbf6f8'), haze: hex('#f3bcd6'),
};
function tintFor(v, out, o, jitter) { // v: 0 valley .. 1 peak
  const stops = [PAL.deep, PAL.hot, PAL.mid, PAL.light, PAL.pale];
  const x = clamp(v + jitter, 0, 0.999) * (stops.length - 1); const i = Math.floor(x), f = x - i;
  const a = stops[i], b = stops[i + 1];
  out[o] = lerp(a.r, b.r, f); out[o+1] = lerp(a.g, b.g, f); out[o+2] = lerp(a.b, b.b, f);
}

// ---------- mass builders ----------
// field(p) < 0 inside. Samples beads in a shell of thickness th below the surface.
function buildMass({ n, bbox, field, th = 0.08, rMin = 0.024, rMax = 0.042, seed = 1, tone }) {
  const rnd = mulberry(seed);
  const P = new Float32Array(n * 3), R = new Float32Array(n), T = new Float32Array(n * 3), D = new Float32Array(n), S = new Float32Array(n);
  let k = 0, guard = 0;
  while (k < n && guard++ < n * 400) {
    const x = lerp(bbox[0], bbox[3], rnd()), y = lerp(bbox[1], bbox[4], rnd()), z = lerp(bbox[2], bbox[5], rnd());
    const f = field(x, y, z);
    if (f > 0 || f < -th) continue;
    P[k*3] = x; P[k*3+1] = y; P[k*3+2] = z;
    R[k] = lerp(rMin, rMax, Math.pow(rnd(), 1.6));
    const depth = -f / th;
    const v = tone(x, y, z) * (1 - 0.55 * depth);
    tintFor(v, T, k*3, (rnd() - 0.5) * 0.18);
    D[k] = depth; S[k] = rnd();
    k++;
  }
  return { n: k, P, R, T, D, S };
}

// ---------- shots ----------
// each shot: dur (s), build(), update(t, lt, geo) sets positions+camera, look {focus, aperture, haze...}
const shots = [];

// 1. EMERGE — pale haze; a billowing mass rises into frame as focus pulls in
shots.push({
  dur: 6,
  build() {
    const field = (x, y, z) => { const b = lumps(x*1.1, y*1.1, z*1.1, 4); return (y - (-0.2 + 0.8*Math.exp(-(x*x)*0.12 - z*z*0.1))) - (b - 0.3) * 0.9; };
    return buildMass({ n: 560000, bbox: [-5, -1.6, -2.6, 5, 1.4, 4.7], field, th: 0.09, seed: 11, tone: (x, y, z) => smooth(-0.9, 0.9, y + 0.45*lumps(x*1.1,y*1.1,z*1.1,2) - 0.2) });
  },
  update(lt, u, m, pos) {
    const rise = ease(clamp(lt / 4.5, 0, 1));
    for (let i = 0; i < m.n; i++) {
      const x = m.P[i*3], y = m.P[i*3+1], z = m.P[i*3+2];
      const w = noise3(x*0.9 + lt*0.18, y*0.9, z*0.9 - lt*0.1) * 0.06;
      pos[i*3] = x + w; pos[i*3+1] = y - 1.3*(1 - rise) * (0.6 + 0.4*m.S[i]) + w; pos[i*3+2] = z;
    }
    camera.position.set(lerp(-0.9, 0.5, ease(u)), lerp(0.55, 0.75, u), 5.6 - 0.7*u);
    camera.lookAt(lerp(-0.2, 0.3, u), 0.05, 0);
    return { focus: lerp(2.2, 5.3, smooth(0.05, 0.6, u)), aperture: 1.0, haze: [5.2, 0.35], blob: [0.75, 0.75], fadeIn: 1.0 };
  },
});

// 2. TERRAIN — extreme macro slide across a rolling bead landscape, deep magenta valleys
shots.push({
  dur: 6,
  build() {
    const field = (x, y, z) => y - (lumps(x*0.9, 0.3, z*0.9, 5) - 0.6) * 1.1 - 0.25*Math.sin(x*0.8 + z*0.3);
    return buildMass({ n: 360000, bbox: [-3.2, -1.2, -3.0, 3.6, 0.9, 1.8], field, th: 0.075, rMin: 0.02, rMax: 0.036, seed: 22,
      tone: (x, y, z) => smooth(-0.55, 0.55, y - 0.25*Math.sin(x*0.8 + z*0.3)) });
  },
  update(lt, u, m, pos) {
    for (let i = 0; i < m.n; i++) {
      const x = m.P[i*3], y = m.P[i*3+1], z = m.P[i*3+2];
      const sw = noise3(x*0.7 - lt*0.25, z*0.7, lt*0.1) * 0.08 * (1 - m.D[i]*0.5);
      pos[i*3] = x; pos[i*3+1] = y + sw; pos[i*3+2] = z;
    }
    const e = ease(u);
    camera.position.set(lerp(-1.6, 1.4, e), 0.62 - 0.1*e, 1.75);
    camera.lookAt(lerp(-1.0, 1.9, e), 0.05, -0.6);
    return { focus: lerp(1.95, 2.25, u), aperture: 1.6, haze: [2.8, 0.3], blob: [0.3, 0.85] };
  },
});

// 3. BLOOM — a dense cluster erupts outward in slow motion, beads peel off its edges
shots.push({
  dur: 6,
  build() {
    const field = (x, y, z) => Math.hypot(x, y*1.05, z) - 0.62 - (lumps(x*2.2, y*2.2, z*2.2, 4) - 0.5) * 0.55;
    return buildMass({ n: 260000, bbox: [-1.3, -1.3, -1.3, 1.3, 1.3, 1.3], field, th: 0.12, rMin: 0.02, rMax: 0.034, seed: 33,
      tone: (x, y, z) => 0.15 + smooth(0.45, 1.05, Math.hypot(x, y, z)) * 0.65 + 0.2*smooth(-1, 1, y) });
  },
  update(lt, u, m, pos) {
    const e = ease(clamp(u * 1.05, 0, 1));
    for (let i = 0; i < m.n; i++) {
      const x = m.P[i*3], y = m.P[i*3+1], z = m.P[i*3+2];
      const r = Math.hypot(x, y, z) + 1e-5;
      const loose = m.S[i] > 0.93 && m.D[i] < 0.4; // surface stragglers
      const lumpy = lumps(x*1.3, y*1.3, z*1.3, 2);
      let s = 1 + e * (0.16 + 0.55 * (lumpy - 0.3)) * (1 - 0.5*m.D[i]);
      if (loose) s += e * e * (0.2 + 0.5 * m.S[i]);
      const tw = noise3(x*1.5 + lt*0.3, y*1.5, z*1.5) * 0.05 * e;
      const a = e * 0.35 * (1 - m.D[i]); // slight twist as it opens
      const cx = x*Math.cos(a) - z*Math.sin(a), cz = x*Math.sin(a) + z*Math.cos(a);
      pos[i*3] = cx * s + tw; pos[i*3+1] = y * s + tw + (loose ? e*e*0.4*m.S[i] : 0); pos[i*3+2] = cz * s;
    }
    camera.position.set(0.35, 0.25, lerp(4.6, 3.9, ease(u)));
    camera.lookAt(0, 0, 0);
    return { focus: lerp(3.8, 3.2, ease(u)), aperture: 1.25, haze: [5, 0.4], blob: [0.25, 0.3] };
  },
});

// 4. DRIFT — a floating cloud mass, slow orbit, strands drifting off
shots.push({
  dur: 6,
  build() {
    const field = (x, y, z) => {
      const d1 = Math.hypot(x + 0.5, y*1.3, z) - 0.8, d2 = Math.hypot(x - 0.7, (y - 0.25)*1.2, z + 0.3) - 0.62, d3 = Math.hypot(x - 0.1, y + 0.45, z - 0.5) - 0.5;
      const k = 0.35; let d = Math.min(d1, d2, d3);
      d = -k * Math.log(Math.exp(-d1/k) + Math.exp(-d2/k) + Math.exp(-d3/k));
      return d - (lumps(x*2, y*2, z*2, 4) - 0.5) * 0.5;
    };
    return buildMass({ n: 300000, bbox: [-1.9, -1.4, -1.4, 1.9, 1.4, 1.4], field, th: 0.1, rMin: 0.02, rMax: 0.036, seed: 44,
      tone: (x, y, z) => 0.25 + 0.75 * smooth(-0.4, 0.2, lumps(x*2, y*2, z*2, 3) - 0.5 + 0.35*y) });
  },
  update(lt, u, m, pos) {
    for (let i = 0; i < m.n; i++) {
      const x = m.P[i*3], y = m.P[i*3+1], z = m.P[i*3+2];
      let dx = noise3(x*0.8 + lt*0.2, y*0.8, z*0.8) * 0.05, dy = noise3(x*0.8, y*0.8 + lt*0.2, z*0.8 + 5) * 0.05, dz = 0;
      if (m.S[i] > 0.955 && m.D[i] < 0.5) { // drifting strands, peeling up and to the right
        const k = clamp(lt / this.dur, 0, 1) * (0.5 + m.S[i]);
        dx += k * 1.1 * (0.6 + noise3(x*3, y*3, z*3)); dy += k * 0.7 * (0.5 + noise3(x*3 + 7, y*3, z*3));
        dz += k * 0.3 * noise3(x*3, y*3 + 9, z*3);
      }
      pos[i*3] = x + dx; pos[i*3+1] = y + dy; pos[i*3+2] = z + dz;
    }
    const a = lerp(-0.55, 0.45, ease(u));
    camera.position.set(Math.sin(a) * 4.4, 0.55 + 0.25*u, Math.cos(a) * 4.4);
    camera.lookAt(0.1, 0.0, 0);
    return { focus: 4.3 - 0.2*Math.sin(u*3), aperture: 1.1, haze: [4.8, 0.45], blob: [0.8, 0.25] };
  },
});

// 5. CORE — scattered beads converge into one breathing sphere, then pull back into haze
shots.push({
  dur: 7,
  build() {
    const field = (x, y, z) => Math.hypot(x, y, z) - 0.85 - (lumps(x*3, y*3, z*3, 3) - 0.5) * 0.12;
    const m = buildMass({ n: 220000, bbox: [-1.1, -1.1, -1.1, 1.1, 1.1, 1.1], field, th: 0.09, rMin: 0.02, rMax: 0.034, seed: 55,
      tone: (x, y, z) => 0.2 + 0.8 * smooth(-0.9, 0.9, 0.7*y - 0.5*x + 0.5*(lumps(x*2, y*2, z*2, 2) - 0.5)) });
    const rnd = mulberry(99); m.F = new Float32Array(m.n * 3);
    for (let i = 0; i < m.n; i++) { // scattered start positions: wide swirling cloud
      // tilted swirling disc of loose beads around the forming core
      const arm = Math.floor(rnd() * 3), r = 1.3 + Math.pow(rnd(), 0.8) * 3.2;
      const th = arm * 2.094 + r * 1.25 + (rnd() - 0.5) * 0.5, h = (rnd() - 0.5) * 0.35 * r;
      const x = Math.cos(th) * r, z = Math.sin(th) * r, tilt = 0.9;
      m.F[i*3] = x; m.F[i*3+1] = h * Math.cos(tilt) + z * Math.sin(tilt); m.F[i*3+2] = z * Math.cos(tilt) - h * Math.sin(tilt);
    }
    return m;
  },
  update(lt, u, m, pos) {
    const gather = clamp(lt / 3.6, 0, 1);
    const breathe = 1 + 0.035 * Math.sin(lt * 2.2) * smooth(3.2, 4.2, lt);
    for (let i = 0; i < m.n; i++) {
      const x = m.P[i*3], y = m.P[i*3+1], z = m.P[i*3+2];
      const delay = m.S[i] * 0.45 + (1 - m.D[i]) * 0.1;
      const g = ease(clamp((gather - delay * 0.9) / (1 - delay * 0.9 + 1e-3), 0, 1));
      const sw = (1 - g) * 2.2; // spiral in
      const fx = m.F[i*3], fy = m.F[i*3+1], fz = m.F[i*3+2];
      const px = fx*Math.cos(sw) - fz*Math.sin(sw), pz = fx*Math.sin(sw) + fz*Math.cos(sw);
      const wob = noise3(x*1.4 + lt*0.35, y*1.4, z*1.4) * 0.05;
      pos[i*3] = lerp(px, x * breathe + wob, g); pos[i*3+1] = lerp(fy, y * breathe + wob, g); pos[i*3+2] = lerp(Math.min(pz, 1.8), z * breathe, g);
    }
    const back = smooth(4.6, 7, lt);
    camera.position.set(0.2, 0.15, lerp(lerp(5.5, 3.6, ease(clamp(lt / 4.2, 0, 1))), 9, back));
    camera.lookAt(0, 0, 0);
    const d = camera.position.length();
    return { focus: d, aperture: lerp(0.9, 1.6, back), haze: [4.8, 0.35 + back * 0.4], blob: [0.5, 0.5], fadeOut: 1.0 };
  },
});

// ---------- timeline ----------
const starts = []; { let s = 0; for (const sh of shots) { starts.push(s); s += sh.dur; } }
const TOTAL = starts[starts.length - 1] + shots[shots.length - 1].dur;
let current = -1, mass = null, geo = null;

function renderFrame(frame) {
  const t = frame / FPS;
  let si = shots.length - 1; for (let i = 0; i < shots.length; i++) if (t < starts[i] + shots[i].dur) { si = i; break; }
  const sh = shots[si];
  if (si !== current) { current = si; mass = sh.build(); geo = setParticles(mass.n); geo.attributes.aRadius.array.set(mass.R.subarray(0, mass.n)); geo.attributes.aRadius.needsUpdate = true; geo.attributes.aTint.array.set(mass.T.subarray(0, mass.n * 3)); geo.attributes.aTint.needsUpdate = true; }
  const lt = t - starts[si], u = lt / sh.dur;
  const pos = geo.attributes.position.array;
  const look = sh.update(lt, u, mass, pos);
  geo.attributes.position.needsUpdate = true;
  camera.updateMatrixWorld(); beadMat.uniforms.uProj.value.copy(camera.projectionMatrix);

  hazeU.uBgA.value.copy(PAL.bgA); hazeU.uBgB.value.copy(PAL.bgB); hazeU.uHaze.value.copy(PAL.haze);
  hazeU.uFocus.value = look.focus; hazeU.uAperture.value = look.aperture * 1.6;
  hazeU.uHazeDist.value = look.haze[0]; hazeU.uHazeAmt.value = look.haze[1];
  hazeU.uBgBlob.value.set(look.blob[0], look.blob[1]);
  // dip-to-haze transitions between shots (8 frames each side)
  const edge = 8 / FPS; let fade = 0;
  if (si > 0 || look.fadeIn) fade = Math.max(fade, 1 - smooth(0, si === 0 ? 1.2 : edge, lt));
  if (si < shots.length - 1 || look.fadeOut) fade = Math.max(fade, smooth(sh.dur - (si === shots.length - 1 ? 1.0 : edge), sh.dur, lt));
  finalPass.m.uniforms.uFade.value = fade * (si === 0 || si === shots.length - 1 ? 1 : 0.85);
  finalPass.m.uniforms.uFadeCol.value.copy(PAL.bgB);
  finalPass.m.uniforms.uTime.value = frame;

  renderer.setRenderTarget(sceneRT); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera);
  prepPass.run(halfRT); dofPass.run(dofRT); finalPass.run(null);
}

window.FILM = { renderFrame, frames: Math.round(TOTAL * FPS), W, H };
window.FILM_READY = true;

// usage: node render.mjs <out.mp4|dir> [--w 1920 --h 1080 --from 0 --to N --step 1 --stills]
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const out = args[0];
const W = +opt('w', 1920), H = +opt('h', 1080);
const stills = args.includes('--stills');
const FF = process.env.FFMPEG || 'ffmpeg';
const root = path.dirname(new URL(import.meta.url).pathname);

const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('console', m => console.log('[page]', m.text()));
page.on('pageerror', e => console.log('[err]', e.message));
await page.goto(`http://localhost:${port}/index.html?w=${W}&h=${H}`);
await page.waitForFunction(() => window.FILM_READY, null, { timeout: 60000 });
const total = await page.evaluate(() => FILM.frames);
const from = +opt('from', 0), to = +opt('to', total), step = +opt('step', 1);

let ff;
if (!stills) {
  ff = spawn(FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
} else fs.mkdirSync(out, { recursive: true });

const t0 = Date.now();
for (let f = from; f < to; f += step) {
  const b64 = await page.evaluate(async (f) => {
    FILM.renderFrame(f);
    const blob = await new Promise(r => document.querySelector('canvas').toBlob(r, 'image/png'));
    const buf = new Uint8Array(await blob.arrayBuffer());
    let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return btoa(s);
  }, f);
  const buf = Buffer.from(b64, 'base64');
  if (stills) fs.writeFileSync(path.join(out, `f${String(f).padStart(4, '0')}.png`), buf);
  else if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if ((f - from) % (30 * step) === 0) console.log(`frame ${f}/${to}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
if (ff) { ff.stdin.end(); await new Promise(r => ff.on('close', r)); }
await browser.close(); server.close();
console.log('done', ((Date.now() - t0) / 1000).toFixed(0) + 's');

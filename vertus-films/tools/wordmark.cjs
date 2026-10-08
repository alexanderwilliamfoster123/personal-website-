// Rasterise the Vertus wordmark SVG to a transparent PNG at any width/colour.
// usage: node wordmark.cjs in.svg out.png width [fill]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [,, inp, out, w, fill] = process.argv;
  let svg = fs.readFileSync(inp, 'utf8');
  const W = +w, H = Math.round(W * 25 / 106);
  svg = svg.replace(/width="106" height="25"/, `width="${W}" height="${H}"`);
  if (fill) svg = svg.replace(/fill="black"/g, `fill="${fill}"`);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
  await p.screenshot({ path: out, omitBackground: true });
  await b.close();
})();

import puppeteer from 'puppeteer-core';
import { statSync } from 'node:fs';
const [url, dist] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--ignore-certificate-errors'] });
for (const [name, vp] of [['mobile 412@2.6', { width: 412, height: 823, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true }], ['desktop 1440@1', { width: 1440, height: 900, deviceScaleFactor: 1 }]]) {
  const p = await b.newPage(); await p.setViewport(vp);
  await p.goto(url, { waitUntil: 'networkidle0' });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 400) { await p.evaluate((y) => scrollTo(0, y), y); await new Promise((r) => setTimeout(r, 120)); }
  await new Promise((r) => setTimeout(r, 1500));
  const rows = await p.evaluate(() => [...document.querySelectorAll('img')].map((i) => { const r = i.getBoundingClientRect(); return { src: new URL(i.currentSrc || i.src).pathname, cssW: Math.round(r.width), cssH: Math.round(r.height), natW: i.naturalWidth, natH: i.naturalHeight, lazy: i.loading, dec: i.decoding, fp: i.fetchPriority, vis: r.width > 0 }; }));
  let tot = 0, waste = 0;
  const seen = new Set(); const out = [];
  for (const r of rows) { if (!r.src.startsWith('/img/') || seen.has(r.src + r.cssW)) continue; seen.add(r.src + r.cssW); let kb = 0; try { kb = statSync(dist + r.src).size; } catch {} const need = r.cssW * vp.deviceScaleFactor; const ratio = r.natW / need; tot += kb; if (ratio > 1.25 && r.cssW) waste += kb * (1 - 1 / ratio); out.push({ f: r.src.slice(5, 40), css: `${r.cssW}x${r.cssH}`, nat: r.natW, need: Math.round(need), over: +ratio.toFixed(2), kb: Math.round(kb / 1000), lz: r.lazy[0] }); }
  console.log(`\n${name}: ${out.length} distinct imgs, ${Math.round(tot / 1000)} KB total, est. oversize waste ${Math.round(waste / 1000)} KB`);
  console.table(out.filter((r) => r.over > 1.3 || r.over < 0.8));
}
await b.close();

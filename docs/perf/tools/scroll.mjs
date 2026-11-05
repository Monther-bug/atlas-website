// Scroll the whole page in steps; record rAF frame deltas, long tasks, LoAF, per-section stats. Usage: node scroll.mjs url mode(desktop|touch) [cpu]
import puppeteer from 'puppeteer-core';
const [url, mode = 'desktop', cpuArg = '1'] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--ignore-certificate-errors'] });
const p = await b.newPage();
const touch = mode === 'touch';
await p.setViewport(touch ? { width: 412, height: 823, deviceScaleFactor: 2.6, isMobile: true, hasTouch: true } : { width: 1440, height: 900 });
const cdp = await p.createCDPSession();
await p.evaluateOnNewDocument(() => {
  window.__s = { frames: [], lt: [], loaf: [], sec: '' };
  let last = 0; (function f(t) { if (last) window.__s.frames.push([window.__s.sec, +(t - last).toFixed(1)]); last = t; requestAnimationFrame(f); })(0);
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__s.lt.push([window.__s.sec, Math.round(e.duration)]))).observe({ type: 'longtask' });
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__s.loaf.push([window.__s.sec, Math.round(e.duration), Math.round(e.blockingDuration), e.scripts.map((s) => (s.sourceURL || '').split('/').pop() + ':' + Math.round(s.duration)).join(',')]))).observe({ type: 'long-animation-frame' }); } catch {}
});
await p.goto(url, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 3500));
await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(cpuArg) });
const total = await p.evaluate(() => document.documentElement.scrollHeight);
const vh = await p.evaluate(() => innerHeight);
const secAt = () => p.evaluate(() => { const y = scrollY + innerHeight / 2; const s = [...document.querySelectorAll('main > section, footer')].find((e) => { const r = e.getBoundingClientRect(); return r.top + scrollY <= y && r.bottom + scrollY > y; }); window.__s.sec = s ? s.id || s.tagName : 'x'; });
const STEP = touch ? 280 : 160; // px per gesture / wheel tick
let y = 0, guard = 0;
while (y < total - vh && guard++ < 400) {
  await secAt();
  if (touch) await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: 600, yDistance: -STEP * 3, speed: 1400, gestureSourceType: 'touch' });
  else { for (let i = 0; i < 6; i++) { await p.mouse.wheel({ deltaY: STEP }); await new Promise((r) => setTimeout(r, 16)); } }
  await new Promise((r) => setTimeout(r, touch ? 120 : 60));
  y = await p.evaluate(() => scrollY);
}
await new Promise((r) => setTimeout(r, 800));
const s = await p.evaluate(() => window.__s);
const bySec = {};
for (const [sec, d] of s.frames) { (bySec[sec] ??= []).push(d); }
const pct = (a, q) => a.slice().sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * q))];
const out = Object.entries(bySec).map(([sec, a]) => ({ sec, n: a.length, p50: pct(a, 0.5), p95: pct(a, 0.95), max: Math.max(...a), over33: a.filter((x) => x > 33).length, over50: a.filter((x) => x > 50).length }));
console.log(mode, 'cpu', cpuArg, 'scrolled', y, '/', total, 'frames', s.frames.length, 'longtasks', s.lt.length, 'LT total ms', s.lt.reduce((a, t) => a + t[1], 0), 'LoAF>50', s.loaf.length);
console.table(out);
console.log('long tasks', JSON.stringify(s.lt));
console.log('loaf', JSON.stringify(s.loaf.slice(0, 12)));
// reveal sanity: any element still pre-hidden after scrolling through?
const hidden = await p.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.05).length);
console.log('reveal elements still invisible at end:', hidden, 'of', await p.evaluate(() => document.querySelectorAll('[data-reveal]').length));
await b.close();

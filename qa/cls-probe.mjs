// Layout-shift stress test of the first screen. Each case loads a page in a fresh context and, before the
// render-blocking CSS has arrived (its responses are held back 300 ms), forces one style pass, as a tap, assistive
// tech or an extension does on a real phone. It records every layout shift with its sources and fails on CLS >= 0.01.
// This is the condition behind the intermittent hero shift (CLS 0.15 at 390 px, 0.34 at 320 px, reduced motion only):
// the reduced-motion reset gave every element a 0.01 ms transition of every property, and the hero (a size container)
// then painted their start values, the unstyled UA sizes, for a frame (src/styles.css). Then a plain load of each case.
// Usage (a built site being served): node qa/cls-probe.mjs [baseUrl]
// Env: CLS_RUNS (plain loads per case, default 2), CLS_HOLD_MS (CSS hold, default 300).
import puppeteer from 'puppeteer-core';
import { sessionCls } from './lib/checks.mjs';

const BASE = (process.argv[2] ?? process.env.QA_BASE ?? 'http://localhost:4173').replace(/\/$/, '');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RUNS = Number(process.env.CLS_RUNS ?? 2);
const HOLD = Number(process.env.CLS_HOLD_MS ?? 300);
const CASES = ['/', '/en/'].flatMap((path) =>
  [
    { width: 390, height: 844, reduced: true },
    { width: 390, height: 844, reduced: false },
    { width: 390, height: 844, reduced: true, touch: true },
    { width: 320, height: 640, reduced: true },
    { width: 768, height: 1024, reduced: true },
    { width: 1440, height: 900, reduced: true },
    { width: 1440, height: 900, reduced: false },
  ].map((vp) => ({ path, ...vp })),
);

/** Runs in the page before any of its own scripts: layout shifts with sources; optionally one early style pass. */
function instrument(force) {
  const name = (n) => {
    if (!n || n.nodeType !== 1) return n ? n.nodeName : 'null';
    const cls = typeof n.className === 'string' ? n.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    return n.tagName.toLowerCase() + (n.id ? `#${n.id}` : '') + (cls ? `.${cls}` : '');
  };
  const box = (r) => [r.x, r.y, r.width, r.height].map(Math.round).join(',');
  window.__shifts = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      window.__shifts.push({
        value: e.value,
        startTime: e.startTime,
        hadRecentInput: e.hadRecentInput,
        sources: (e.sources ?? []).map((s) => `${name(s.node)} [${box(s.previousRect)}]→[${box(s.currentRect)}]`),
      });
    }
  }).observe({ type: 'layout-shift', buffered: true });
  if (force) {
    document.addEventListener('readystatechange', () => {
      // Parsing is done and the stylesheets are still on their way: one style pass over the first screen.
      if (document.readyState === 'interactive') getComputedStyle(document.querySelector('h1') ?? document.body).fontSize;
    });
  }
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-first-run'] });
let failures = 0;
for (const c of CASES) {
  for (const forced of [true, ...Array(RUNS).fill(false)]) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width: c.width, height: c.height, isMobile: !!c.touch, hasTouch: !!c.touch, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: c.reduced ? 'reduce' : 'no-preference' }]);
    if (forced) {
      await page.setRequestInterception(true);
      page.on('request', (req) => (/\.css(\?|$)/.test(req.url()) ? setTimeout(() => req.continue(), HOLD) : req.continue()));
    }
    await page.evaluateOnNewDocument(instrument, forced);
    await page.goto(BASE + c.path, { waitUntil: 'load', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1500)); // the hero has settled; reduced motion runs no intro
    const shifts = await page.evaluate(() => window.__shifts);
    await context.close();
    const cls = sessionCls(shifts);
    const ok = cls < 0.01;
    if (!ok) failures++;
    const tag = `${c.path} ${c.width}×${c.height} ${c.reduced ? 'reduced' : 'motion'}${c.touch ? ' touch' : ''} ${forced ? 'early style pass' : 'plain load'}`;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${tag}: CLS ${cls}`);
    if (!ok) for (const s of shifts) console.log(`        ${s.value.toFixed(4)} @${Math.round(s.startTime)} ms  ${s.sources.join('  ')}`);
  }
}
await browser.close();
console.log(failures ? `\n${failures} case(s) shifted` : '\nNo layout shift on the first screen.');
process.exit(failures ? 1 : 0);

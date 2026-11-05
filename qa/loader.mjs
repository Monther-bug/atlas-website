// First-visit loader (index.html, en/index.html) in real Chrome. For AR and EN at 1440x900 and 390x844 it checks:
// a first visit shows the curtain and lifts it within the cap, a reload in the same session and a deep link show none,
// reduced motion and no-JS show none, a key or a press lifts it at once, Slow 4G never leaves a stuck screen; no console
// errors and no layout shift. With --storyboard it records a screencast of each first visit and writes the frames at
// 0, 300, 700, 1100 and 1500 ms after the curtain's first frame to docs/reviews/v2-loader/ (JPEG).
// Usage (preview running): node qa/loader.mjs [baseUrl] [--storyboard]
import { mkdir, writeFile } from 'node:fs/promises';
import puppeteer, { PredefinedNetworkConditions } from 'puppeteer-core';
import sharp from 'sharp';

const args = process.argv.slice(2);
const BASE = (args.find((a) => !a.startsWith('--')) ?? process.env.QA_BASE ?? 'http://localhost:4173').replace(/\/$/, '');
const STORYBOARD = args.includes('--storyboard');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = new URL('../docs/reviews/v2-loader/', import.meta.url).pathname;
const FRAMES = [0, 300, 700, 1100, 1500];
const CAP_MS = 1600; // first frame -> curtain gone, fast connection
const FAILSAFE_MS = 2500; // gone by then after navigation (the script), or after its first frame (the CSS failsafe)
const PAGES = [
  { id: 'ar', path: '/' },
  { id: 'en', path: '/en/' },
];
const VIEWPORTS = [
  { id: '1440', viewport: { width: 1440, height: 900, deviceScaleFactor: 1 } },
  { id: '390', phone: true, viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
];

let failures = 0;
const report = (ok, label, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Records, in page time (performance.now()), when the curtain first painted, lifted, and left the DOM. */
function probe() {
  const t = (window.__loader = { first: null, lift: null, gone: null, motion: null, paint: null, events: 0, shifts: 0, loaderShifts: 0, visibleAtFirstFrame: null });
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) if (e.name === 'first-paint') t.paint = e.startTime;
  }).observe({ type: 'paint', buffered: true });
  addEventListener('atlas:loader-done', () => {
    t.events++;
    t.lift ??= performance.now();
  });
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.hadRecentInput) continue;
      t.shifts += e.value;
      const al = document.getElementById('al');
      if (al && e.sources.some((src) => src.node && al.contains(src.node))) t.loaderShifts += e.value;
    }
  }).observe({ type: 'layout-shift', buffered: true });
  const frame = () => {
    const al = document.getElementById('al');
    if (al && t.first === null) {
      t.first = performance.now();
      t.visibleAtFirstFrame = getComputedStyle(al).display !== 'none';
      new MutationObserver(() => {
        if (!al.isConnected && t.gone === null) t.gone = performance.now();
      }).observe(document.body, { childList: true });
    }
    if (document.documentElement.dataset.motion && t.motion === null) t.motion = performance.now();
    if (t.gone === null || t.motion === null) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

const state = (page) =>
  page.evaluate(() => {
    const al = document.getElementById('al');
    return {
      loader: document.documentElement.hasAttribute('data-loader'),
      shown: !!al && getComputedStyle(al).display !== 'none',
      present: !!al,
      t: window.__loader ?? null,
      timeOrigin: performance.timeOrigin,
    };
  });

async function open(browser, { viewport, path, js = true, reduced = false, network = null, cpu = 1 }) {
  const context = await browser.createBrowserContext(); // fresh profile and sessionStorage = a first visit
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.setViewport(viewport);
  if (!js) await page.setJavaScriptEnabled(false);
  if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  if (network) await page.emulateNetworkConditions(network);
  if (cpu > 1) await page.emulateCPUThrottling(cpu);
  if (js) await page.evaluateOnNewDocument(probe);
  return { context, page, errors, url: BASE + path };
}

/** Screencast frames (JPEG) with wall-clock timestamps, while `run` loads the page. */
async function screencast(page, viewport, run) {
  const cdp = await page.createCDPSession();
  const frames = [];
  cdp.on('Page.screencastFrame', (f) => {
    frames.push({ at: f.metadata.timestamp * 1000, data: f.data });
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 82, everyNthFrame: 1, maxWidth: viewport.width * viewport.deviceScaleFactor, maxHeight: viewport.height * viewport.deviceScaleFactor });
  await run();
  await cdp.send('Page.stopScreencast');
  return frames;
}

async function storyboard(frames, firstWall, name, viewport) {
  const shots = [];
  for (const ms of FRAMES) {
    const target = firstWall + ms;
    // The last frame on screen at that moment (a screencast frame is sent when the screen changes).
    const frame = [...frames].reverse().find((f) => f.at <= target + 8) ?? frames[0];
    let jpg = await sharp(Buffer.from(frame.data, 'base64')).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
    if (jpg.length > 200_000) jpg = await sharp(jpg).jpeg({ quality: 62, mozjpeg: true }).toBuffer();
    const file = `${name}-${String(ms).padStart(4, '0')}ms.jpg`;
    await writeFile(OUT + file, jpg);
    shots.push({ file, kb: Math.round(jpg.length / 100) / 10, offset: Math.round(frame.at - firstWall) });
  }
  // One strip per run, for reading the sequence at a glance.
  const h = viewport.width > 600 ? 300 : 420;
  const tiles = await Promise.all(shots.map((s) => sharp(OUT + s.file).resize({ height: h }).toBuffer({ resolveWithObject: true })));
  const w = tiles[0].info.width;
  const gap = 8;
  const strip = await sharp({ create: { width: w * tiles.length + gap * (tiles.length - 1), height: h, channels: 3, background: '#ffffff' } })
    .composite(tiles.map((t, i) => ({ input: t.data, left: i * (w + gap), top: 0 })))
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
  await writeFile(`${OUT}${name}-strip.jpg`, strip);
  return shots;
}

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-first-run'] });
const timings = [];

for (const p of PAGES) {
  for (const v of VIEWPORTS) {
    const tag = `${p.id} ${v.id}`;

    // 0. Phones (< 768 px) get no curtain at all: the hero is the first thing painted (perf plan, loader).
    if (v.phone) {
      const { context, page, errors, url } = await open(browser, { viewport: v.viewport, path: p.path });
      await page.goto(url, { waitUntil: 'load' });
      await sleep(600);
      const s = await page.evaluate(() => {
        const al = document.getElementById('al');
        return { loader: document.documentElement.hasAttribute('data-loader'), shown: !!al && getComputedStyle(al).display !== 'none', events: window.__loader?.events ?? 0 };
      });
      report(!s.loader && !s.shown, `${tag} first visit: no curtain on a phone`);
      report(errors.length === 0, `${tag} first visit: no console errors`, errors.join(' | '));
      await context.close();
    }

    if (!v.phone) {
    // 1. First visit: the curtain is up at its first frame, lifts within the cap, hands over once, then a reload in the
    //    same tab session shows nothing.
    {
      const { context, page, errors, url } = await open(browser, { viewport: v.viewport, path: p.path });
      let frames = [];
      const load = async () => {
        await page.goto(url, { waitUntil: 'load' });
        await sleep(2600);
      };
      if (STORYBOARD) frames = await screencast(page, v.viewport, load);
      else await load();
      const s = await state(page);
      const t = s.t;
      const held = t.lift - t.first;
      const total = t.gone - t.first;
      report(t.visibleAtFirstFrame === true, `${tag} first visit: curtain shown at its first frame`, `first frame at ${Math.round(t.first)} ms`);
      report(t.lift !== null && held > 400, `${tag} first visit: the hook lifts the curtain when ready`, `lift starts ${Math.round(held)} ms after the first frame`);
      report(t.gone !== null && total <= CAP_MS, `${tag} first visit: curtain gone within ${CAP_MS} ms`, `${Math.round(total)} ms (nav ${Math.round(t.gone)} ms)`);
      report(t.events === 1 && !s.loader && !s.present, `${tag} first visit: one atlas:loader-done, data-loader removed, curtain removed`, `events=${t.events}`);
      // The page's own CLS is reported as is (a header font swap of ~0.00004 at 1440 happens with or without the loader).
      report(t.loaderShifts === 0 && t.shifts < 0.001, `${tag} first visit: the loader shifts nothing; page CLS ≈ 0`, `page CLS ${t.shifts.toFixed(5)}`);
      report(errors.length === 0, `${tag} first visit: no console errors`, errors.join(' | '));
      timings.push({ page: p.id, viewport: v.id, firstFrame: Math.round(t.first), liftStart: Math.round(t.lift), gone: Math.round(t.gone), held: Math.round(held), total: Math.round(total), motionStart: t.motion && Math.round(t.motion) });
      if (STORYBOARD) {
        const shots = await storyboard(frames, s.timeOrigin + t.first, `${p.id}-${v.id}`, v.viewport);
        console.log(`      storyboard ${p.id}-${v.id}: ${shots.map((x) => `${x.file} (${x.kb} KB, +${x.offset} ms)`).join(', ')}`);
        report(shots.every((x) => x.kb <= 200), `${tag} storyboard frames ≤ 200 KB`);
      }
      await page.reload({ waitUntil: 'load' });
      const again = await state(page);
      report(!again.loader && !again.shown, `${tag} reload in the same session: no loader`);
      await context.close();
    }

    }

    // 2. Deep link, reduced motion, no JS: never.
    for (const c of [
      { label: 'deep link /#request', path: `${p.path}#request` },
      { label: 'reduced motion', path: p.path, reduced: true },
      { label: 'JavaScript off', path: p.path, js: false },
    ]) {
      const { context, page, errors, url } = await open(browser, { viewport: v.viewport, ...c });
      await page.goto(url, { waitUntil: 'load' });
      const s = await page.evaluate(() => {
        const al = document.getElementById('al');
        return { loader: document.documentElement.hasAttribute('data-loader'), shown: !!al && getComputedStyle(al).display !== 'none', first: window.__loader?.first ?? null };
      });
      report(!s.loader && !s.shown, `${tag} ${c.label}: no loader`);
      report(errors.length === 0, `${tag} ${c.label}: no console errors`, errors.join(' | '));
      await context.close();
    }

    if (!v.phone) {
    // 3. Skip: a key (Escape) or a press lifts it at once.
    for (const how of ['Escape', 'press']) {
      const { context, page, url } = await open(browser, { viewport: v.viewport, path: p.path });
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.__loader?.first !== null && window.__loader?.first !== undefined);
      await sleep(150);
      const at = await page.evaluate(() => performance.now());
      if (how === 'Escape') await page.keyboard.press('Escape');
      else if (v.viewport.hasTouch) await page.touchscreen.tap(v.viewport.width / 2, v.viewport.height / 2);
      else await page.mouse.click(v.viewport.width / 2, v.viewport.height / 2);
      await page.waitForFunction(() => window.__loader.gone !== null, { timeout: 3000 }).catch(() => {});
      const t = (await state(page)).t;
      report(t.gone !== null && t.gone - at < 600 && t.lift - at < 100, `${tag} ${how} skips at once`, `lift +${Math.round(t.lift - at)} ms, gone +${Math.round(t.gone - at)} ms`);
      await context.close();
    }
    }
  }

  // 4. Never ready (the hero photo never arrives): the hook still lifts at the hold cap.
  {
    const { context, page, errors, url } = await open(browser, { viewport: VIEWPORTS[0].viewport, path: p.path });
    await page.setRequestInterception(true);
    page.on('request', (r) => (/\/img\/.*(desktop|mobile)_/.test(r.url()) ? undefined : r.continue()));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await sleep(2600);
    const s = await state(page);
    const t = s.t;
    report(t.lift !== null && t.lift - t.first <= 1000 && !s.loader && !s.present, `${p.id} 1440 photo never arrives: lifts at the hold cap`, `lift ${Math.round(t.lift - t.first)} ms after the first frame`);
    report(errors.length === 0, `${p.id} 1440 photo never arrives: no console errors`, errors.join(' | '));
    await context.close();
  }

  // 5. The script stalls (no animation frames at all): the CSS failsafe hides the curtain and the page is handed over.
  {
    const { context, page, url } = await open(browser, { viewport: VIEWPORTS[0].viewport, path: p.path, js: true });
    await page.evaluateOnNewDocument(() => {
      window.__handover = 0;
      addEventListener('atlas:loader-done', () => window.__handover++);
      window.requestAnimationFrame = () => 0;
    });
    await page.goto(url, { waitUntil: 'load' });
    const at = await page.evaluate(() => performance.now());
    await sleep(Math.max(0, 2900 - at));
    const s = await page.evaluate(() => {
      const al = document.getElementById('al');
      return { loader: document.documentElement.hasAttribute('data-loader'), visible: !!al && getComputedStyle(al).visibility !== 'hidden' && getComputedStyle(al).display !== 'none', handover: window.__handover, now: Math.round(performance.now()) };
    });
    report(!s.loader && !s.visible && s.handover === 1, `${p.id} 1440 script stalls: CSS failsafe hides it and hands over`, `checked at ${s.now} ms, handover=${s.handover}`);
    await context.close();
  }

  // 6. Slow 4G + 4x CPU (phone): never a stuck screen; gone by the failsafe or dropped unseen.
  {
    const network = PredefinedNetworkConditions['Slow 4G'] ?? { download: (1.6 * 1000 * 1000) / 8 * 0.9, upload: (750 * 1000) / 8 * 0.9, latency: 150 * 3.75 };
    let run = await open(browser, { viewport: VIEWPORTS[1].viewport, path: p.path, network, cpu: 4 });
    try {
      await run.page.goto(run.url, { waitUntil: 'load', timeout: 60000 });
    } catch (error) {
      // Headless Chrome now and then detaches a throttled frame mid-navigation: one retry in a fresh context.
      console.log(`      (retrying Slow 4G ${p.id}: ${error.message})`);
      await run.context.close().catch(() => {});
      run = await open(browser, { viewport: VIEWPORTS[1].viewport, path: p.path, network, cpu: 4 });
      await run.page.goto(run.url, { waitUntil: 'load', timeout: 60000 });
    }
    const { context, page, errors } = run;
    await sleep(3000);
    const s = await state(page);
    const t = s.t;
    // Removed before the first paint = the visitor never saw it (the script drops it when the first frame comes late).
    const seen = t.gone === null || t.paint === null || t.gone > t.paint;
    const detail = t.gone === null ? 'never removed' : `first paint ${Math.round(t.paint)} ms, curtain removed ${Math.round(t.gone)} ms (${seen ? `${Math.round(t.gone - t.paint)} ms on screen` : 'dropped before it was painted'})`;
    report(!s.loader && t.gone === null, `${p.id} 390 Slow 4G: phone has no curtain`, detail);
    report(t.events === 0, `${p.id} 390 Slow 4G: no loader hand-over`, `events=${t.events}`);
    report(errors.length === 0, `${p.id} 390 Slow 4G: no console errors`, errors.join(' | '));
    timings.push({ page: p.id, viewport: '390 Slow 4G', firstFrame: Math.round(t.first), liftStart: Math.round(t.lift), gone: Math.round(t.gone), held: Math.round(t.lift - t.first), total: Math.round(t.gone - t.first), motionStart: t.motion && Math.round(t.motion) });
    await context.close();
  }
}

await browser.close();
console.log('\nTimings (ms; page time from navigation start; held = first frame -> lift start; total = first frame -> removed):');
console.table(timings);
console.log(failures ? `\n${failures} check(s) failed` : '\nAll loader checks passed');
process.exit(failures ? 1 : 0);

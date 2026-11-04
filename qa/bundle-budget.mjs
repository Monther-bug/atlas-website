// Bundle and first-load budget (spec §9). Static part: gzip sizes of the JS/CSS the Arabic page
// loads up front (from dist/index.html). Network part: every response while the Arabic page
// loads on a phone (375×812, DPR 2, touch) and on desktop (1440×900), with no scrolling.
// Text responses count as gzip -9 of the built file (vite preview does not compress); binary
// files count at their real size. Usage (preview running): node qa/bundle-budget.mjs [baseUrl]
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import puppeteer from 'puppeteer-core';
import { assetRefs, checkBundle } from './lib/budgets.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = path.join(ROOT, 'dist');
const DEFAULT_CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TEXT_TYPES = new Set(['document', 'script', 'stylesheet', 'xhr', 'fetch', 'manifest']);
const TEXT_EXT = /\.(js|mjs|css|html|svg|json|xml|txt|webmanifest)$/i;

const gz = (buf) => gzipSync(buf, { level: 9 }).length;
const kb = (bytes) => bytes / 1000;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

async function distFile(urlPath) {
  const rel = decodeURIComponent(urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath);
  try {
    return await readFile(path.join(DIST, rel));
  } catch {
    return null;
  }
}

async function capture(browser, base, { width, height, touch }) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width, height, isMobile: touch, hasTouch: touch, deviceScaleFactor: touch ? 2 : 1 });
  const origin = new URL(base).origin;
  const responses = [];
  const pending = [];
  page.on('response', (res) => {
    pending.push(
      (async () => {
        const url = new URL(res.url());
        if (url.protocol === 'data:' || res.status() >= 300) return;
        const type = res.request().resourceType();
        const local = url.origin === origin ? await distFile(url.pathname) : null;
        let bytes;
        if (local) bytes = TEXT_TYPES.has(type) || TEXT_EXT.test(url.pathname) ? gz(local) : local.length;
        else bytes = (await res.buffer().catch(() => Buffer.alloc(0))).length;
        responses.push({ url: url.origin === origin ? url.pathname : url.href, type, bytes });
      })(),
    );
  });
  await page.goto(`${base}/`, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000)); // motion core loads after hydration
  const heroSrc = await page.evaluate(() => {
    const img = document.querySelector('[data-hero-photo] img');
    return img ? new URL(img.currentSrc || img.src, location.href).pathname : null;
  });
  const fontPreloads = await page.$$eval('link[rel="preload"][as="font"]', (ls) => ls.length);
  await Promise.all(pending);
  await context.close();
  return { responses, heroSrc, fontPreloads };
}

export async function measureBundle({ base = 'http://localhost:4173', chrome = DEFAULT_CHROME } = {}) {
  const html = await readFile(path.join(DIST, 'index.html'), 'utf8');
  const refs = assetRefs(html);
  const sized = async (ref) => {
    const buf = await distFile(new URL(ref, 'http://x').pathname);
    return { file: ref, gzipKB: buf ? kb(gz(buf)) : NaN };
  };
  const initialJs = await Promise.all(refs.js.map(sized));
  const css = await Promise.all(refs.css.map(sized));
  const jsFiles = (await readdir(path.join(DIST, 'assets'))).filter((f) => f.endsWith('.js'));
  const lazyJs = [];
  for (const f of jsFiles) {
    const ref = `/assets/${f}`;
    if (!refs.js.includes(ref)) lazyJs.push({ file: ref, gzipKB: kb(gz(await readFile(path.join(DIST, 'assets', f)))) });
  }

  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-first-run'] });
  let mobile;
  let desktop;
  try {
    mobile = await capture(browser, base, { width: 375, height: 812, touch: true });
    desktop = await capture(browser, base, { width: 1440, height: 900, touch: false });
  } finally {
    await browser.close();
  }
  const byType = (cap) => {
    const t = {};
    for (const r of cap.responses) t[r.type] = Math.round(((t[r.type] ?? 0) + kb(r.bytes)) * 10) / 10;
    return t;
  };
  const heroKB = (cap) => kb(cap.responses.find((r) => r.url === cap.heroSrc)?.bytes ?? NaN);
  const measure = {
    initialJsKB: sum(initialJs.map((f) => f.gzipKB)),
    cssKB: sum(css.map((f) => f.gzipKB)),
    firstLoadKB: kb(sum(mobile.responses.map((r) => r.bytes))),
    heroMobileKB: heroKB(mobile),
    heroDesktopKB: heroKB(desktop),
  };
  return {
    measure,
    rows: checkBundle(measure),
    details: {
      initialJs,
      css,
      lazyJs,
      mobile: { requests: mobile.responses.length, byTypeKB: byType(mobile), hero: mobile.heroSrc, fontPreloads: mobile.fontPreloads },
      desktop: { requests: desktop.responses.length, firstLoadKB: kb(sum(desktop.responses.map((r) => r.bytes))), byTypeKB: byType(desktop), hero: desktop.heroSrc },
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const base = (process.argv[2] ?? process.env.QA_BASE ?? 'http://localhost:4173').replace(/\/$/, '');
  const r = await measureBundle({ base });
  console.table(r.rows);
  console.log(JSON.stringify(r.details, null, 2));
  process.exit(r.rows.every((x) => x.pass) ? 0 : 1);
}

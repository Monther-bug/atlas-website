// Bundle and first-load budget (spec §9). Static part: gzip sizes of the JS/CSS the Arabic page
// loads up front (from dist/index.html), and the same for every other built page (the English
// home page and the ten crane pages, each on the same budgets). Network part: every response
// while the Arabic page, and the Arabic crane page BUNDLE_CRANE (default gmk6350), load on a
// phone (375×812, DPR 2, touch) and on desktop (1440×900), with no scrolling.
// Text responses count as gzip -9 of the built file (vite preview does not compress); binary
// files count at their real size. Usage (preview running): node qa/bundle-budget.mjs [baseUrl]
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import puppeteer from 'puppeteer-core';
import { assetRefs, checkBundle, checkCraneLoad, checkPageBundles, pagePath } from './lib/budgets.mjs';

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

/** Every built HTML page under dist/ (relative paths), the Arabic home page first. */
async function htmlPages(dir = DIST, rel = '') {
  const out = [];
  for (const entry of await readdir(path.join(dir, rel), { withFileTypes: true })) {
    const child = path.join(rel, entry.name);
    if (entry.isDirectory() && entry.name !== 'assets') out.push(...(await htmlPages(dir, child)));
    else if (entry.isFile() && entry.name === 'index.html') out.push(child);
  }
  return out.sort((a, b) => a.split(path.sep).length - b.split(path.sep).length || a.localeCompare(b));
}

async function capture(browser, base, { width, height, touch }, { pagePath: target = '/', heroSelector = '[data-hero-photo] img' } = {}) {
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
  await page.goto(`${base}${target}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000)); // motion core loads after hydration
  const heroSrc = await page.evaluate((selector) => {
    const img = document.querySelector(selector);
    return img ? new URL(img.currentSrc || img.src, location.href).pathname : null;
  }, heroSelector);
  const fontPreloads = await page.$$eval('link[rel="preload"][as="font"]', (ls) => ls.length);
  await Promise.all(pending);
  await context.close();
  return { responses, heroSrc, fontPreloads };
}

export async function measureBundle({ base = 'http://localhost:4173', chrome = DEFAULT_CHROME, craneId = process.env.BUNDLE_CRANE ?? 'gmk6350' } = {}) {
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

  // Every other page, on the same budgets.
  const pages = [];
  for (const file of (await htmlPages()).filter((f) => f !== 'index.html')) {
    const r = assetRefs(await readFile(path.join(DIST, file), 'utf8'));
    const js = await Promise.all(r.js.map(sized));
    const cssFiles = await Promise.all(r.css.map(sized));
    pages.push({ page: pagePath(file), initialJsKB: sum(js.map((f) => f.gzipKB)), cssKB: sum(cssFiles.map((f) => f.gzipKB)), js: js.map((f) => f.file) });
  }

  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-first-run'] });
  const cranePage = `/cranes/${craneId}/`;
  const craneHero = { pagePath: cranePage, heroSelector: '[data-crane-hero-photo] img' };
  let mobile;
  let desktop;
  let craneMobile;
  let craneDesktop;
  try {
    mobile = await capture(browser, base, { width: 375, height: 812, touch: true });
    desktop = await capture(browser, base, { width: 1440, height: 900, touch: false });
    craneMobile = await capture(browser, base, { width: 375, height: 812, touch: true }, craneHero);
    craneDesktop = await capture(browser, base, { width: 1440, height: 900, touch: false }, craneHero);
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
  const crane = {
    page: cranePage,
    firstLoadKB: kb(sum(craneMobile.responses.map((r) => r.bytes))),
    heroMobileKB: heroKB(craneMobile),
    heroDesktopKB: heroKB(craneDesktop),
  };
  return {
    measure,
    rows: [...checkBundle(measure), ...checkPageBundles(pages), ...checkCraneLoad(crane)],
    details: {
      initialJs,
      css,
      pages,
      crane: {
        ...crane,
        mobile: { requests: craneMobile.responses.length, byTypeKB: byType(craneMobile), hero: craneMobile.heroSrc, fontPreloads: craneMobile.fontPreloads },
        desktop: { requests: craneDesktop.responses.length, firstLoadKB: kb(sum(craneDesktop.responses.map((r) => r.bytes))), byTypeKB: byType(craneDesktop), hero: craneDesktop.heroSrc },
      },
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

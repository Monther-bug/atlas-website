// PDF screen exports (spec §2: in place of Figma files). AR / EN × desktop 1440 / mobile 390.
// One tall single-page PDF per combination (page width = viewport width, height = the whole document) plus a PNG
// preview of the first screen beside it. Builds nothing: point it at a running build.
// Usage: npm run pdf [-- baseUrl]   (or QA_BASE=...; default http://localhost:4173)
//
// Motion: the page loads with `prefers-reduced-motion: reduce`, which the site renders as its complete final state
// (static hero, Hoist static stack, counters final, nothing hidden), and with the loader skipped
// (sessionStorage['atlas-intro']='1'). The script then scrolls the whole page so lazily mounted sections (the crane
// list) mount, and waits until the document height stops changing and every image has decoded.
//
// Why the PDF is made of screen captures: Chrome's own print layout of one very tall page re-resolves vh/svh units
// against the page height and dropped painted content (the Services tiles came out blank), so a vector print did not
// match the site. Instead each screen-high slice is captured exactly as it renders in the browser (JPEG), and the
// slices are stacked into one PDF page. Text in the PDF is therefore an image, not selectable.
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const BASE = (process.argv[2] ?? process.env.QA_BASE ?? 'http://localhost:4173').replace(/\/$/, '');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = new URL('../docs/exports/', import.meta.url).pathname;
const PAGES = [
  { lang: 'ar', path: '/' },
  { lang: 'en', path: '/en/' },
];
const DEVICES = [
  { id: 'desktop', width: 1440, height: 900, mobile: false },
  { id: 'mobile', width: 390, height: 844, mobile: true },
];
const MAX_PDF_BYTES = 15_000_000;
const JPEG_QUALITY = 82;

/** Pure: the scroll offsets (and visible crop) that tile a document of `total` px with `step` px screens. */
export function sliceOffsets(total, step) {
  const slices = [];
  for (let y = 0; y < total; y += step) {
    const height = Math.min(step, total - y);
    // The last screen cannot scroll past the end: scroll to total - step and keep only its lower part.
    const scroll = Math.max(0, Math.min(y, total - step));
    slices.push({ y, scroll, crop: y - scroll, height });
  }
  return slices;
}

/** Pure: count pages in a PDF buffer (leaf /Type /Page objects). */
export function countPdfPages(buf) {
  return (buf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
}

const HIDE_FLOATING = '[data-request-bar], .progress-rope, .motion-ghost { display: none !important; }';

async function settle(page) {
  await page.addStyleTag({ content: HIDE_FLOATING });
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
    // Scroll in steps so IntersectionObserver-mounted sections (crane list...) mount; repeat until the height settles.
    let last = -1;
    for (let round = 0; round < 6; round++) {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += Math.round(innerHeight * 0.6)) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await sleep(120);
      }
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
      await sleep(400);
      const now = document.documentElement.scrollHeight;
      if (now === last) break;
      last = now;
    }
    await Promise.all([...document.images].map((img) => (img.complete ? null : img.decode().catch(() => null))));
    await document.fonts.ready;
    window.scrollTo({ top: 0, behavior: 'instant' });
    await sleep(400);
  });
}

async function capture(page, d) {
  const total = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
  const shots = [];
  let first = null;
  for (const [i, s] of sliceOffsets(total, d.height).entries()) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), s.scroll);
    // The fixed header belongs on the first screen only.
    if (i === 1) await page.addStyleTag({ content: 'header { visibility: hidden !important; }' });
    await new Promise((r) => setTimeout(r, 250));
    if (i === 0) first = await page.screenshot({ type: 'png' });
    // Clip is in document coordinates: the screen at scroll s.scroll, from s.crop down.
    const clip = { x: 0, y: s.scroll + s.crop, width: d.width, height: s.height };
    shots.push((await page.screenshot({ type: 'jpeg', quality: JPEG_QUALITY, clip, captureBeyondViewport: false })).toString('base64'));
  }
  return { total, shots, first };
}

async function main() {
  const ping = await fetch(`${BASE}/`).catch(() => null);
  if (!ping?.ok) {
    console.error(`Cannot reach ${BASE}/. Build, then start the preview: npx vite preview --port 4173`);
    process.exit(2);
  }
  await mkdir(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-first-run'] });
  const rows = [];
  let failed = 0;
  try {
    for (const p of PAGES) {
      for (const d of DEVICES) {
        const context = await browser.createBrowserContext();
        const page = await context.newPage();
        await page.setViewport({ width: d.width, height: d.height, isMobile: d.mobile, hasTouch: d.mobile, deviceScaleFactor: 1 });
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
        await page.evaluateOnNewDocument(() => {
          try {
            sessionStorage.setItem('atlas-intro', '1');
          } catch {}
        });
        await page.goto(BASE + p.path, { waitUntil: 'networkidle0', timeout: 60000 });
        await page.evaluate(() => new Promise((r) => setTimeout(r, 800)));
        await settle(page);
        const { total, shots, first } = await capture(page, d);
        const base = `${OUT}atlas-${p.lang}-${d.id}`;
        await writeFile(`${base}.png`, first);

        // Stack the slices into one tall PDF page: width = viewport width, height = document height.
        const sheet = await context.newPage();
        const imgs = shots.map((b64) => `<img src="data:image/jpeg;base64,${b64}">`).join('');
        await sheet.setContent(
          `<style>@page{margin:0}html,body{margin:0;background:#fff}img{display:block;width:${d.width}px}</style>${imgs}`,
          { waitUntil: 'load' },
        );
        await sheet.pdf({
          path: `${base}.pdf`,
          width: `${d.width}px`,
          height: `${total + 2}px`,
          printBackground: true,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
          pageRanges: '1',
        });
        const buf = await readFile(`${base}.pdf`);
        const { size } = await stat(`${base}.pdf`);
        const pages = countPdfPages(buf);
        const ok = buf.subarray(0, 5).toString('latin1') === '%PDF-' && size > 50_000 && size < MAX_PDF_BYTES && pages === 1;
        if (!ok) failed++;
        rows.push({ file: `docs/exports/atlas-${p.lang}-${d.id}.pdf`, pages, size, height: total, ok });
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log('\nfile                                   pages  height   size      status');
  for (const r of rows) {
    console.log(`${r.file.padEnd(38)} ${String(r.pages).padStart(5)}  ${String(r.height).padStart(6)}  ${(r.size / 1e6).toFixed(2).padStart(5)} MB  ${r.ok ? 'OK' : 'FAIL'}`);
  }
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();

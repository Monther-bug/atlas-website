// Checks the prerendered pages: the served HTML is complete (lang/dir, font preloads, blur
// placeholders), the page is complete with JavaScript off, then React hydrates the server DOM
// without errors or warnings. Usage (preview running):
//   node qa/smoke-prerender.mjs [baseUrl]
import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
import { countFontPreloads } from '../scripts/lib/prerender-helpers.mjs';

const BASE = (process.argv[2] ?? process.env.QA_BASE ?? 'http://localhost:4173').replace(/\/$/, '');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENS = new URL('./reports/screens/', import.meta.url).pathname;
const PAGES = [
  { id: 'ar', path: '/', lang: 'ar', dir: 'rtl' },
  { id: 'en', path: '/en/', lang: 'en', dir: 'ltr' },
];
const FONT_PRELOADS = 3; // vite/font-preload.ts, spec §4.5
const PLACEHOLDER = 'data:image/webp;base64,'; // 24-px blur placeholders (src/components/Picture.tsx)
const HYDRATION = /hydrat|did not match|server rendered html|server-rendered/i;
let failures = 0;
const report = (ok, label, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
};

await mkdir(SCREENS, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-first-run'] });

for (const p of PAGES) {
  // 0. The HTML exactly as served: what crawlers and the first paint get.
  {
    const res = await fetch(BASE + p.path);
    const html = await res.text();
    const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? '';
    report(
      res.ok && htmlTag.includes(`lang="${p.lang}"`) && htmlTag.includes(`dir="${p.dir}"`),
      `${p.id} HTML: <html lang="${p.lang}" dir="${p.dir}">`,
      `${res.status} ${htmlTag}`,
    );
    const fonts = countFontPreloads(html);
    report(fonts === FONT_PRELOADS, `${p.id} HTML: ${FONT_PRELOADS} font preloads`, `found ${fonts}`);
    report(!html.includes('<!--app-->') && !html.includes('<!--head-->'), `${p.id} HTML: prerender markers replaced`);
    // Picture.tsx renders the placeholder as the <img>'s background-image, in the server render only.
    const imgs = [...html.matchAll(/<picture\b[\s\S]*?<\/picture>/g)].map((m) => m[0].match(/<img\b[^>]*>/)?.[0] ?? '');
    const blurred = imgs.filter((tag) => tag.includes(`background-image:url(${PLACEHOLDER}`)).length;
    report(imgs.length > 0 && blurred === imgs.length, `${p.id} HTML: every <picture> <img> has a blur placeholder`, `${blurred}/${imgs.length}`);
  }
  // 1. JavaScript off: the static HTML alone must show the whole page.
  {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.goto(BASE + p.path, { waitUntil: 'load' });
    const s = await page.evaluate(() => {
      const hidden = [...document.querySelectorAll('[data-intro], [data-split], [data-reveal], [data-hero-photo] img')]
        .filter((e) => {
          const cs = getComputedStyle(e);
          return cs.opacity !== '1' || cs.visibility === 'hidden';
        })
        .map((e) => e.tagName.toLowerCase());
      return {
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        hero: !!document.querySelector('[data-hero]'),
        heroImg: !!document.querySelector('[data-hero-photo] img'),
        h1: document.querySelector('h1')?.textContent?.trim() ?? '',
        hoist: document.querySelectorAll('[data-hoist-item]').length,
        cards: document.querySelectorAll('[data-testid="crane-card"]').length,
        form: !!document.querySelector('[data-testid="request-form"]'),
        hidden,
      };
    });
    report(s.lang === p.lang && s.dir === p.dir, `${p.id} no-JS: lang/dir`, `${s.lang}/${s.dir}`);
    report(s.hero && s.heroImg && s.h1.length > 10, `${p.id} no-JS: hero, hero photo and H1 are in the HTML`, s.h1.slice(0, 60));
    report(s.hoist > 0 && s.hoist === s.cards, `${p.id} no-JS: Hoist items and crane cards rendered`, `hoist=${s.hoist} cards=${s.cards}`);
    report(s.form, `${p.id} no-JS: request form rendered`);
    report(s.hidden.length === 0, `${p.id} no-JS: nothing hidden waiting for motion`, s.hidden.join(', '));
    await page.screenshot({ path: `${SCREENS}nojs-${p.id}-390.png`, fullPage: true });
    await context.close();
  }
  // 2. JavaScript on: React must adopt the server DOM (no client re-render) with a clean console.
  {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    const errors = [];
    const scripts = [];
    page.on('console', (m) => {
      if (m.type() === 'error' || (m.type() === 'warning' && HYDRATION.test(m.text()))) errors.push(`${m.type()}: ${m.text()}`);
    });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e}`));
    page.on('response', (r) => {
      if (r.request().resourceType() !== 'script') return;
      scripts.push(r.text().then((text) => ({ url: r.url(), text }), () => null));
    });
    // Tag the server-rendered nodes while the HTML is parsed. The first readystatechange
    // ("interactive") fires when parsing ends, before any module script (React) runs.
    await page.evaluateOnNewDocument(() => {
      const tag = () => {
        for (const selector of ['[data-header]', '[data-hero]']) {
          const node = document.querySelector(selector);
          if (node) node.__qaServerNode = true;
        }
      };
      const observer = new MutationObserver(tag);
      observer.observe(document, { childList: true, subtree: true });
      document.addEventListener('readystatechange', () => { tag(); observer.disconnect(); }, { once: true });
    });
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(BASE + p.path, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 3000));
    const kept = await page.evaluate(() => ({
      header: document.querySelector('[data-header]')?.__qaServerNode === true,
      hero: document.querySelector('[data-hero]')?.__qaServerNode === true,
    }));
    report(kept.header, `${p.id} hydration kept the server header (no client re-render)`);
    report(kept.hero, `${p.id} hydration kept the server DOM (no client re-render)`);
    report(errors.length === 0, `${p.id} no console errors or hydration warnings`, errors.join(' | '));
    const bodies = (await Promise.all(scripts)).filter(Boolean);
    const leaking = bodies.filter((b) => b.text.includes(PLACEHOLDER)).map((b) => b.url);
    report(
      bodies.length > 0 && leaking.length === 0,
      `${p.id} client JS carries no blur placeholders`,
      leaking.length ? leaking.join(', ') : `${bodies.length} script(s) checked`,
    );
    await context.close();
  }
}

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : '\nAll prerender checks passed');
process.exit(failures ? 1 : 0);

// Checks the prerendered pages: the served HTML is complete (lang/dir, font preloads, blur
// placeholders), the page is complete with JavaScript off, then React hydrates the server DOM
// without errors or warnings. The two home pages, then the ten crane pages (/cranes/<id>/,
// /en/cranes/<id>/), whose body is a static island the client JS must neither carry nor re-render.
// Usage (preview running):
//   node qa/smoke-prerender.mjs [baseUrl]
// Env: SMOKE_CRANES=gmk6350,rt700e narrows the crane pages (SMOKE_CRANES=none skips them).
import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
import { countFontPreloads } from '../scripts/lib/prerender-helpers.mjs';
import { CRANES, EASTERN_DIGITS, cranePages, normModel, otherCranes, photoIdFromUrl, toWestern } from './lib/checks.mjs';

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

// ── The crane pages ──────────────────────────────────────────────────────────
// Their first screen is set in other faces than the home page's (vite/font-preload.ts CRANE_PRELOADS): the H1 is the
// model code in Plex Mono, the capacity the Poppins 700 readout, the rest body text. Still three files.
const CRANE_FONTS = { ar: ['plex-mono-500', 'poppins-700', 'tajawal-ar-400'], en: ['plex-mono-500', 'poppins-700', 'poppins-400'] };
// Markup and data only the static body has (src/crane-page/CraneBody.tsx): a crane page's scripts must carry none.
const BODY_MARKERS = ['cp-specs__groups', 'cp-story__steps', 'cp-tile__value', 'cp-load__panel'];
const SMOKE_CRANES = (process.env.SMOKE_CRANES ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const CRANE_PAGES = SMOKE_CRANES.includes('none') ? [] : cranePages(SMOKE_CRANES.length ? SMOKE_CRANES : undefined);
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1] ?? null;

for (const p of CRANE_PAGES) {
  const crane = CRANES[p.crane];
  let sources = [];
  let markers = [];
  // 0. The HTML exactly as served.
  {
    const res = await fetch(BASE + p.path);
    const html = await res.text();
    const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? '';
    report(
      res.ok && htmlTag.includes(`lang="${p.lang}"`) && htmlTag.includes(`dir="${p.dir}"`),
      `${p.id} HTML: <html lang="${p.lang}" dir="${p.dir}">`,
      `${res.status} ${htmlTag}`,
    );
    report(html.includes(`data-crane-page="${p.crane}"`), `${p.id} HTML: prerendered body of ${crane.model} (data-crane-page="${p.crane}")`);
    const fonts = (html.match(/<link\b[^>]*>/gi) ?? []).filter((t) => /\brel="preload"/.test(t) && /\bas="font"/.test(t)).map((t) => attr(t, 'href') ?? '');
    const named = CRANE_FONTS[p.lang].every((n) => fonts.some((f) => f.split('/').pop().startsWith(`${n}-`)));
    report(countFontPreloads(html) === FONT_PRELOADS && named, `${p.id} HTML: ${FONT_PRELOADS} font preloads (${CRANE_FONTS[p.lang].join(', ')})`, fonts.map((f) => f.split('/').pop()).join(', '));
    report(!html.includes('<!--app-->') && !html.includes('<!--head-->'), `${p.id} HTML: prerender markers replaced`);
    const pictures = [...html.matchAll(/<picture\b[\s\S]*?<\/picture>/g)].map((m) => m[0].match(/<img\b[^>]*>/)?.[0] ?? '');
    const blurred = pictures.filter((tag) => tag.includes(`background-image:url(${PLACEHOLDER}`)).length;
    report(pictures.length > 0 && blurred === pictures.length, `${p.id} HTML: every <picture> <img> has a blur placeholder`, `${blurred}/${pictures.length}`);
    // The hero photo: preloaded (only it, at high priority: on phones the page may open on text and leave the photo at
    // the fold, so a crop may go without a preload), eager and high priority itself; every other photo is lazy.
    const hero = html.match(/data-crane-hero-photo[^>]*>[\s\S]*?(<img\b[^>]*>)/)?.[1] ?? '';
    const heroId = photoIdFromUrl(attr(hero, 'src'));
    const imagePreloads = (html.match(/<link\b[^>]*>/gi) ?? []).filter((t) => /\brel="preload"/.test(t) && /\bas="image"/.test(t));
    const strays = imagePreloads.filter((t) => attr(t, 'fetchpriority') !== 'high' || (attr(t, 'imagesrcset') ?? attr(t, 'href') ?? '').split(',').some((c) => photoIdFromUrl(c.trim()) !== heroId));
    const lazy = pictures.filter((tag) => tag !== hero && attr(tag, 'loading') !== 'lazy').length;
    report(
      !!heroId && imagePreloads.length >= 1 && strays.length === 0 && attr(hero, 'fetchpriority') === 'high' && attr(hero, 'loading') !== 'lazy' && lazy === 0,
      `${p.id} HTML: only the hero photo is preloaded (high priority); it is eager and high priority; the other ${pictures.length - 1} photos lazy`,
      `hero ${heroId ?? 'missing'} loading=${attr(hero, 'loading')} fetchpriority=${attr(hero, 'fetchpriority')} · image preloads ${imagePreloads.length} (${imagePreloads.map((t) => attr(t, 'media') ?? 'all').join(' | ')}), not the hero or not high ${strays.length} · eager others ${lazy}`,
    );
    const sized = pictures.filter((tag) => attr(tag, 'width') && attr(tag, 'height')).length;
    report(sized === pictures.length, `${p.id} HTML: every photo reserves its box (width and height)`, `${sized}/${pictures.length}`);
    sources = [...(html.match(/class="cp-sources"[\s\S]*?<\/ul>/)?.[0] ?? '').matchAll(/href="(https:[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
    report(sources.length > 0, `${p.id} HTML: the specification lists its sources`, `${sources.length} source(s)`);
    markers = BODY_MARKERS.filter((m) => html.includes(m));
  }
  // 1. JavaScript off: the whole page, final state.
  {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.goto(BASE + p.path, { waitUntil: 'load' });
    const s = await page.evaluate(() => {
      const shown = (e) => {
        const cs = getComputedStyle(e);
        return Number(cs.opacity) >= 1 && cs.visibility !== 'hidden';
      };
      const hidden = [...document.querySelectorAll('[data-reveal], [data-crane-hero-photo] img, .cp-readout__fig, [data-ticker]')].filter((e) => !shown(e)).map((e) => e.className || e.tagName.toLowerCase());
      // Tickers and meters render their final state (the motion layer is what counts them up).
      const tickers = [...document.querySelectorAll('[data-ticker]')].filter((t) => t.textContent !== t.parentElement?.querySelector('.cp-fig__ghost')?.textContent).length;
      const meters = [...document.querySelectorAll('[data-meter]')].filter((m) => {
        const t = getComputedStyle(m).transform;
        return t.startsWith('matrix(0,') || t.startsWith('matrix(0 ');
      }).length;
      return {
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        h1: document.querySelector('h1')?.textContent?.trim() ?? '',
        readout: document.querySelector('.cp-readout__fig')?.textContent?.trim() ?? '',
        heroImg: !!document.querySelector('[data-crane-hero-photo] img'),
        tiles: document.querySelectorAll('.cp-tile').length,
        steps: document.querySelectorAll('[data-story-step]').length,
        rows: document.querySelectorAll('.cp-row').length,
        rail: [...document.querySelectorAll('a[data-crane-link]')].map((a) => a.dataset.craneLink),
        bar: !!document.querySelector('[data-request-bar]')?.checkVisibility({ visibilityProperty: true }),
        text: document.body.innerText,
        hidden,
        tickers,
        meters,
      };
    });
    report(s.lang === p.lang && s.dir === p.dir, `${p.id} no-JS: lang/dir`, `${s.lang}/${s.dir}`);
    report(normModel(s.h1).endsWith(normModel(crane.model)) && s.heroImg, `${p.id} no-JS: H1 names ${crane.model}; hero photo in the HTML`, s.h1);
    report(Number(toWestern(s.readout)) === crane.t, `${p.id} no-JS: the readout shows ${crane.t} t`, s.readout);
    report(
      s.tiles >= 3 && s.steps >= 1 && s.rows > 0 && s.rail.join() === otherCranes(p.crane).join() && s.bar,
      `${p.id} no-JS: figures, photo story, specification, the other four cranes and the request bar rendered`,
      `tiles=${s.tiles} steps=${s.steps} rows=${s.rows} rail=${s.rail.join(',')} bar=${s.bar}`,
    );
    report(s.hidden.length === 0 && s.tickers === 0 && s.meters === 0, `${p.id} no-JS: nothing hidden waiting for motion; figures and meters final`, `hidden: ${s.hidden.join(', ') || 'none'} · tickers off ${s.tickers} · empty meters ${s.meters}`);
    report(!EASTERN_DIGITS.test(s.text), `${p.id} no-JS: Western digits only`, (s.text.match(/[^\s]*[٠-٩۰-۹][^\s]*/g) ?? []).slice(0, 5).join(' '));
    await page.screenshot({ path: `${SCREENS}nojs-${p.id}-390.png`, fullPage: true });
    await context.close();
  }
  // 2. JavaScript on: React adopts the server DOM (header, and the body island as it is) with a clean console.
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
    await page.evaluateOnNewDocument(() => {
      const tag = () => {
        for (const selector of ['[data-header]', '#crane-body', '#crane-hero', '#specification', '[data-request-bar]']) {
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
    await new Promise((r) => setTimeout(r, 3000)); // the motion chunk loads on idle
    const kept = await page.evaluate(() => {
      const of = (s) => document.querySelector(s)?.__qaServerNode === true;
      return { header: of('[data-header]'), body: of('#crane-body'), hero: of('#crane-hero'), specs: of('#specification'), bar: of('[data-request-bar]'), motion: document.documentElement.dataset.motion ?? null };
    });
    report(kept.header && kept.bar, `${p.id} hydration kept the server header and request bar (no client re-render)`, JSON.stringify(kept));
    report(kept.body && kept.hero && kept.specs, `${p.id} hydration kept the static body island (no client re-render)`, JSON.stringify(kept));
    report(kept.motion === 'desktop', `${p.id} the idle motion layer started (data-motion="desktop")`, `data-motion=${kept.motion}`);
    report(errors.length === 0, `${p.id} no console errors or hydration warnings`, errors.join(' | '));
    const bodies = (await Promise.all(scripts)).filter(Boolean);
    const leaking = bodies.filter((b) => b.text.includes(PLACEHOLDER)).map((b) => b.url);
    report(
      bodies.length > 0 && leaking.length === 0,
      `${p.id} client JS carries no blur placeholders`,
      leaking.length ? leaking.join(', ') : `${bodies.length} script(s) checked`,
    );
    // Only markers the served body really has count (a renamed class must not turn this into a check of nothing).
    const carrying = bodies.flatMap((b) => [...markers, ...sources].filter((m) => b.text.includes(m)).map((m) => `${new URL(b.url).pathname} has "${m}"`));
    report(
      markers.length >= 2 && sources.length > 0 && carrying.length === 0,
      `${p.id} client JS carries none of the body (markup, specification sources)`,
      carrying.join(' | ') || `${bodies.length} script(s) checked for ${markers.length} markup marker(s) and ${sources.length} source(s)`,
    );
    await context.close();
  }
}

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : '\nAll prerender checks passed');
process.exit(failures ? 1 : 0);

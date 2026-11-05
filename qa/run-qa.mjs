// Functional QA for the Atlas Alshraa v2 site (E.3, adapted to the v2 DOM hooks).
// Drives the installed Chrome through both pages × 7 viewports × 3 motion modes (desktop, touch, reduced) and no-JS,
// exercises every control, runs axe-core (WCAG 2.0/2.1/2.2 A + AA rules), and checks the SEO head, the truth gate and
// the deploy CSP. Writes qa/reports/results.json, qa/reports/summary.md and first-screen JPEGs in qa/reports/screens/.
//
// Usage: build, start the preview, then `npm run qa` (or `node qa/run-qa.mjs [baseUrl]`).
// Env:
//   CHROME_PATH        Chrome binary (default: the macOS app)
//   QA_BASE            base URL (default http://localhost:4173; argv[2] wins)
//   SITE_URL           must match the build (canonical, hreflang, og:url); default http://localhost:4173
//   QA_TARGET          staging (draft badges + [[CONFIRM]] expected) | production (both forbidden); default staging
//   QA_FORM_ENDPOINT   the build's VITE_FORM_ENDPOINT; this script answers it (500, then 200) to test failure and
//                      success. Unset: the form is expected to hand the request off to WhatsApp / email instead.
//   QA_ONLY            comma list of sections: matrix,controls,keyboard,nojs,seo,truth,csp (default: all)
//   QA_CONCURRENCY     parallel matrix cases (default 3); QA_PAGES=ar,en QA_WIDTHS=320,1440 QA_MODES=touch narrow the matrix
//                      and QA_CONTROLS=desktop,touch,reduced the control cases (a partial run is for the fix loop only)
//   QA_PROD_GATE=0     skip the production truth-gate build; QA_VITE_CONFIG = config file for that build
// Exit: 0 all passed, 1 at least one FAIL, 2 the preview could not be reached.
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { parseHead } from '../scripts/lib/head.mjs';
import { normalizeSiteUrl } from '../scripts/lib/seo.mjs';
import {
  CRANES,
  EASTERN_DIGITS,
  caseTag,
  decodedHref,
  expectedForFilter,
  expectedForLoad,
  expectedMotion,
  hasDraftToken,
  headingIssues,
  isEncodedHref,
  nextKey,
  normModel,
  photoIdFromUrl,
  prevKey,
  sessionCls,
  smallTargets,
} from './lib/checks.mjs';
import { summarize } from './lib/report.mjs';

const BASE = (process.argv[2] ?? process.env.QA_BASE ?? 'http://localhost:4173').replace(/\/$/, '');
const SITE = normalizeSiteUrl(process.env.SITE_URL);
const TARGET = process.env.QA_TARGET === 'production' ? 'production' : 'staging';
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FORM_STUB = process.env.QA_FORM_ENDPOINT || null;
const ONLY = (process.env.QA_ONLY ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const CONCURRENCY = Math.max(1, Number(process.env.QA_CONCURRENCY ?? 3));
const ROOT = new URL('..', import.meta.url).pathname;
const OUT = new URL('./reports/', import.meta.url).pathname;
const SCREENS = `${OUT}screens/`;
const EMAIL = 'atlasalsahralibya@gmail.com';
const want = (section) => !ONLY.length || ONLY.includes(section);

const PAGES = [
  { id: 'ar', path: '/', lang: 'ar', dir: 'rtl', other: '/en/', otherLang: 'en' },
  { id: 'en', path: '/en/', lang: 'en', dir: 'ltr', other: '/', otherLang: 'ar' },
];
const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 657 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];
const MODES = ['desktop', 'touch', 'reduced'].filter((m) => !process.env.QA_MODES || process.env.QA_MODES.split(',').includes(m));
const WIDTHS_ONLY = (process.env.QA_WIDTHS ?? '').split(',').filter(Boolean).map(Number);
const PAGES_ONLY = (process.env.QA_PAGES ?? '').split(',').filter(Boolean);
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// ── Results ─────────────────────────────────────────────────────────────────
const results = [];
function record(area, name, pass, detail = '', kase = undefined) {
  results.push({ area, name, pass: !!pass, detail: String(detail ?? ''), ...(kase ? { case: kase } : {}) });
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${area}] ${name}${detail ? ` — ${String(detail).slice(0, 400)}` : ''}`);
}
async function step(area, name, fn, kase) {
  try {
    const r = await fn();
    record(area, name, r.pass, r.detail ?? '', kase);
    return r;
  } catch (e) {
    record(area, name, false, `threw: ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`, kase);
    return { pass: false };
  }
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function pool(items, n, fn) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(n, queue.length) }, async () => {
      while (queue.length) await fn(queue.shift());
    }),
  );
}

// ── Preflight ───────────────────────────────────────────────────────────────
const ping = await fetch(`${BASE}/`).catch(() => null);
if (!ping?.ok) {
  console.error(`Cannot reach ${BASE}/. Build, then start the preview (npx vite preview).`);
  process.exit(2);
}
const axeSource = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
await mkdir(SCREENS, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-first-run', '--no-default-browser-check', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});

/** What the build was configured with, read from the served page (wa.me vs mailto; GA on or off). */
const PROFILE = await (async () => {
  const html = await (await fetch(`${BASE}/`)).text();
  return {
    whatsapp: /href="https:\/\/wa\.me\//.test(html),
    phone: /href="tel:/.test(html),
    form: !!FORM_STUB,
  };
})();
console.log(`Base ${BASE} · target ${TARGET} · WhatsApp ${PROFILE.whatsapp ? 'configured' : 'mailto fallback'} · phone ${PROFILE.phone ? 'yes' : 'no'} · form endpoint ${FORM_STUB ?? 'none (hand-off)'}`);

/**
 * A fresh, isolated page. Every external hand-off (wa.me, mailto:, tel:, Facebook, window.open) is recorded and kept
 * from leaving the page; gtag.js and the form endpoint are answered locally. `loader: false` (default) marks the
 * first-visit intro as seen, so the page opens as on a repeat visit.
 */
async function open(urlPath, { width = 1440, height = 900, touch = false, reduced = false, js = true, loader = false, csp = null } = {}) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  const problems = { console: [], page: [], requests: [], external: [], posts: [] };
  const state = { formStatus: 200 };
  page.on('console', (m) => {
    const text = m.text();
    // Newer Chrome logs a launched mailto:/whatsapp:/tel: hand-off as an info line, older Chrome as an error.
    if (m.type() !== 'error' && /Launched external handler for '(mailto|whatsapp|tel):/i.test(text)) problems.external.push(text);
    if (m.type() === 'error') {
      // Headless Chrome cannot launch mailto:/whatsapp:/tel: handlers; that is a hand-off working, not an error.
      if (/Failed to launch '(mailto|whatsapp|tel):/i.test(text)) problems.external.push(text);
      // The stubbed endpoint's own 500 (the failure test) is logged by Chrome as a resource error.
      else if (FORM_STUB && /Failed to load resource/.test(text) && (m.location()?.url ?? '').startsWith(FORM_STUB)) return;
      else problems.console.push(text);
    } else if (m.type() === 'warning' && /hydrat|did not match|server rendered/i.test(text)) {
      problems.console.push(`warning: ${text}`);
    }
  });
  page.on('pageerror', (e) => problems.page.push(String(e)));
  page.on('requestfailed', (r) => {
    const url = r.url();
    if (url.startsWith('data:') || /^(mailto|tel|whatsapp):/.test(url)) return;
    if (r.failure()?.errorText === 'net::ERR_ABORTED' && /\.(avif|webp|jpg|png)(\?|$)/.test(url)) return; // a picture swapped its source
    problems.requests.push(`${r.failure()?.errorText ?? 'failed'} ${url}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && !(FORM_STUB && r.url().startsWith(FORM_STUB))) problems.requests.push(`${r.status()} ${r.url()}`);
  });
  await page.setRequestInterception(true);
  page.on('request', async (req) => {
    const url = req.url();
    try {
      if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(url) || /^https:\/\/(www\.)?facebook\.com\//.test(url)) {
        problems.external.push(url);
        return req.respond({ status: 204, body: '' });
      }
      if (/^https:\/\/www\.googletagmanager\.com\//.test(url)) return req.respond({ status: 200, contentType: 'text/javascript', body: '' });
      if (/google-analytics\.com/.test(url)) return req.respond({ status: 204, body: '' });
      if (FORM_STUB && url.startsWith(FORM_STUB)) {
        if (req.method() === 'POST') problems.posts.push(req.postData() ?? '');
        return req.respond({
          status: req.method() === 'OPTIONS' ? 204 : state.formStatus,
          contentType: 'application/json',
          headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' },
          body: state.formStatus < 300 ? '{"ok":true}' : '{"error":"qa"}',
        });
      }
      if (csp && req.isNavigationRequest() && req.resourceType() === 'document' && url.startsWith(BASE)) {
        const res = await fetch(url);
        return req.respond({ status: res.status, contentType: 'text/html; charset=utf-8', headers: { 'Content-Security-Policy': csp }, body: await res.text() });
      }
      return req.continue();
    } catch (e) {
      problems.requests.push(`interception: ${e instanceof Error ? e.message : e}`);
    }
  });
  await page.setJavaScriptEnabled(js);
  await page.setViewport({ width, height, isMobile: touch, hasTouch: touch, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }]);
  await page.evaluateOnNewDocument((seen) => {
    try {
      if (seen) sessionStorage.setItem('atlas-intro', '1');
    } catch {}
    window.__opened = [];
    window.__csp = [];
    window.__shifts = [];
    window.open = (...args) => {
      window.__opened.push(String(args[0] ?? ''));
      return null;
    };
    // Hand-offs never leave the page: the link's own handlers (analytics) still run; the navigation is recorded.
    window.addEventListener(
      'click',
      (e) => {
        const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
        if (!a) return;
        const href = a.getAttribute('href') ?? '';
        if (/^(mailto:|tel:|https?:\/\/(wa\.me|api\.whatsapp\.com|(www\.)?facebook\.com)\/)/.test(href)) {
          e.preventDefault();
          window.__opened.push(a.href);
        }
      },
      true,
    );
    document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) window.__shifts.push({ value: e.value, startTime: e.startTime, hadRecentInput: e.hadRecentInput });
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
  }, !loader);
  await page.goto(BASE + urlPath, { waitUntil: 'networkidle0', timeout: 60000 });
  await wait(2600); // the hero intro is still by ~1.9 s; the motion core and lazy islands have loaded
  return { page, context, problems, state };
}

const errorsOf = (s) => [...s.problems.console, ...s.problems.page].join(' | ');
/**
 * Jumps the page to `y`. A Lenis glide still easing out (its lerp tail can run past 2 s on a long way) would put its
 * own position back on the next frame, so wait for it to finish first, as a visitor's next action would.
 */
async function scrollToY(page, y) {
  await page.waitForFunction(() => !document.documentElement.classList.contains('lenis-scrolling'), { timeout: 5000, polling: 100 }).catch(() => {});
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 420) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 110));
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 400));
  });
}

/** Centres an element (so the floating bar never covers it), then clicks it like a pointer. */
async function tap(page, target, settle = 450) {
  const el = typeof target === 'string' ? await page.$(target) : target;
  if (!el) throw new Error(`not found: ${target}`);
  await el.evaluate((e) => e.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
  await wait(settle);
  await el.click();
  return el;
}
async function firstVisible(page, selector) {
  for (const h of await page.$$(selector)) if (await h.evaluate((e) => e.checkVisibility({ visibilityProperty: true }))) return h;
  return null;
}
/** GA4 events queued by src/lib/analytics.ts (gtag pushes `arguments` objects). */
const events = (page) =>
  page.evaluate(() =>
    (window.dataLayer ?? [])
      .map((a) => Array.from(a))
      .filter((a) => a[0] === 'event')
      .map((a) => ({ name: a[1], ...(a[2] ?? {}) })),
  );
const gaOn = (page) => page.evaluate(() => typeof window.gtag === 'function');
async function eventAfter(page, before, name, match = {}) {
  const all = await events(page);
  return all.slice(before).find((e) => e.name === name && Object.entries(match).every(([k, v]) => e[k] === v)) ?? null;
}
const eventCount = async (page) => (await events(page)).length;
const barChip = (page) => page.$eval('[data-testid="bar-chip"]', (e) => e.textContent ?? '').catch(() => null);
const barHref = (page) => page.$eval('[data-testid="bar-whatsapp"]', (a) => a.getAttribute('href') ?? '');
const formCrane = (page) => page.$eval('[data-testid="request-form"] [name="crane"]', (el) => el.value).catch(() => null);

// ── 1. Matrix: page × viewport × motion mode ────────────────────────────────
async function matrixCase(p, vp, mode) {
  const touch = mode === 'touch';
  const reduced = mode === 'reduced';
  const kase = { page: p.id, width: vp.width, mode };
  const tag = caseTag(kase);
  const rec = (area, name, pass, detail) => record(area, `${tag} ${name}`, pass, detail, kase);
  let s;
  try {
    s = await open(p.path, { width: vp.width, height: vp.height, touch, reduced });
    const { page, problems } = s;
    const want = expectedMotion({ width: vp.width, touch, reduced });
    const motion = await page.evaluate(() => document.documentElement.dataset.motion ?? null);
    rec('motion', `motion context is "${want}"`, motion === want, `data-motion=${motion}`);

    const hero = await page.evaluate(() => {
      const b = document.querySelector('[data-testid="sling-whatsapp"]') ?? document.querySelector('[data-testid="hero-whatsapp"]');
      const hero = document.querySelector('[data-hero]');
      if (!b || !hero) return { ok: false, detail: 'no hero WhatsApp button' };
      const r = b.getBoundingClientRect();
      const h = hero.getBoundingClientRect();
      const inHero = r.top >= h.top - 1 && r.bottom <= h.bottom + 1 && r.left >= h.left - 1 && r.right <= h.right + 1;
      const inView = r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth;
      const big = r.width >= 44 && r.height >= 44;
      const shown = b.checkVisibility({ opacityProperty: true, visibilityProperty: true });
      // The H1 lines must sit inside the viewport too (not clipped by its edges).
      const lines = [...hero.querySelectorAll('h1 .hero-line')].map((l) => l.getBoundingClientRect());
      const clipped = lines.filter((l) => l.left < -1 || l.right > window.innerWidth + 1).length;
      return {
        ok: shown && inHero && inView && big && clipped === 0,
        detail: `${b.dataset.testid} ${Math.round(r.width)}×${Math.round(r.height)} inHero=${inHero} inView=${inView} shown=${shown} h1 lines past the viewport edge=${clipped}`,
      };
    });
    rec('hero', 'hero WhatsApp button on screen, ≥ 44 px; H1 inside the viewport', hero.ok, hero.detail);

    const loadCls = sessionCls(await page.evaluate(() => window.__shifts));
    rec('cls', 'CLS while loading ≤ 0.05', loadCls <= 0.05, `CLS ${loadCls}`);

    await scrollThrough(page);
    const end = await page.evaluate(() => {
      // At the very bottom, the floating bar must not sit on any text (the footer leaves room for it).
      const bar = document.querySelector('[data-request-bar]');
      const b = bar?.getBoundingClientRect();
      const barShown = bar && getComputedStyle(bar).visibility !== 'hidden' && Number(getComputedStyle(bar).opacity) > 0.1;
      const covered = [];
      if (b && barShown) {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          if (!n.nodeValue?.trim() || bar.contains(n) || n.parentElement?.closest('.sr-only, [aria-hidden="true"], dialog:not([open])')) continue;
          const range = document.createRange();
          range.selectNodeContents(n);
          for (const r of range.getClientRects()) {
            if (r.width < 1 || r.height < 1) continue;
            if (r.right > b.left && r.left < b.right && r.bottom > b.top && r.top < b.bottom) {
              covered.push(n.nodeValue.trim().slice(0, 30));
              break;
            }
          }
        }
      }
      return { covered: [...new Set(covered)] };
    });
    rec('layout', 'at the end of the page the request bar covers no text', end.covered.length === 0, end.covered.join(' | '));

    await scrollToY(page, 0);
    await wait(900);
    const m = await page.evaluate(() => {
      const visible = (el) => el.checkVisibility({ visibilityProperty: true });
      const hiddenReveal = [...document.querySelectorAll('[data-reveal]')]
        .flatMap((el) => (el.dataset.reveal === 'stagger' ? [...el.children] : [el]))
        .filter((e) => {
          const cs = getComputedStyle(e);
          return Number(cs.opacity) < 0.99 || cs.visibility === 'hidden' || /inset\(100%/.test(cs.clipPath);
        }).length;
      const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => visible(h) && !h.closest('dialog:not([open])')).map((h) => Number(h.tagName[1]));
      const scoped = (el) => !el.parentElement?.closest('article, aside, main, nav, section');
      const landmarks = {
        banner: [...document.querySelectorAll('header')].filter(scoped).length,
        main: document.querySelectorAll('main').length,
        contentinfo: [...document.querySelectorAll('footer')].filter(scoped).length,
        nav: [...document.querySelectorAll('nav')].filter(visible).length,
      };
      // Interactive targets: the visible box of each control (a native radio is measured by its label).
      const targets = [];
      for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [tabindex="0"]')) {
        if (el.closest('dialog:not([open]), [inert], .sr-only') || el.matches('.motion-ghost *, .motion-ghost')) continue;
        const box = el.matches('input[type=radio], input[type=checkbox]') ? (el.closest('label') ?? el) : el;
        if (!visible(box)) continue;
        const r = box.getBoundingClientRect();
        if (r.width <= 2 || r.height <= 2) continue;
        if (el.matches('[tabindex="0"]') && r.width > 200 && r.height > 200) continue; // scroll regions
        const cs = getComputedStyle(el);
        const block = el.parentElement?.closest('p, li, dd, td, figcaption, span') ?? null;
        const inline = el.tagName === 'A' && cs.display === 'inline' && !!block && block.textContent.trim().length > el.textContent.trim().length + 2;
        const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 32);
        targets.push({ name, width: Math.round(r.width * 10) / 10, height: Math.round(r.height * 10) / 10, inline });
      }
      const text = document.body.innerText;
      const dataAttrs = [...document.querySelectorAll('[data-value], [data-capacity], [data-ticker], [data-lineup-ticker]')]
        .map((e) => e.getAttribute('data-value') ?? e.getAttribute('data-capacity') ?? e.getAttribute('data-ticker') ?? e.getAttribute('data-lineup-ticker'))
        .join(' ');
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.checkVisibility()).map((i) => i.currentSrc || i.src),
        missingAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).map((i) => i.src.slice(-40)),
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        hiddenReveal,
        lenis: document.documentElement.classList.contains('lenis'),
        levels,
        landmarks,
        targets,
        eastern: (text.match(/[^\s]*[٠-٩۰-۹][^\s]*/g) ?? []).slice(0, 5),
        easternData: /[٠-٩۰-۹]/.test(dataAttrs),
        tokens: (text.match(/\[\[[A-Z]+[:\]]/g) ?? []).length,
        badges: document.querySelectorAll('[data-testid="draft-badge"]').length,
        ghosts: document.querySelectorAll('.motion-ghost').length,
      };
    });
    rec('layout', 'no horizontal overflow', m.overflow <= 0, m.overflow > 0 ? `${m.overflow}px wider than the viewport` : '');
    rec('page', `lang="${p.lang}" dir="${p.dir}"`, m.lang === p.lang && m.dir === p.dir, `${m.lang}/${m.dir}`);
    rec('assets', 'images load', m.brokenImages.length === 0, m.brokenImages.join(', '));
    rec('a11y', 'every <img> has alt', m.missingAlt.length === 0, m.missingAlt.join(', '));
    const hIssues = headingIssues(m.levels);
    rec('a11y', 'one h1, headings in order', hIssues.length === 0, hIssues.join('; '));
    const lm = m.landmarks;
    rec('a11y', 'landmarks: one banner, one main, one contentinfo, a nav', lm.banner === 1 && lm.main === 1 && lm.contentinfo === 1 && lm.nav >= 1, JSON.stringify(lm));
    const small = smallTargets(m.targets);
    rec('a11y', 'interactive targets ≥ 44 px', small.length === 0, small.slice(0, 12).map((t) => `${t.name} ${t.width}×${t.height}`).join('; '));
    rec('data', 'Western digits only (text and data attributes)', m.eastern.length === 0 && !m.easternData, m.eastern.join(' '));
    if (TARGET === 'staging') rec('truth', 'draft badges and [[CONFIRM]] tokens shown (staging)', m.badges > 0 && m.tokens > 0, `${m.badges} badges, ${m.tokens} tokens`);
    else rec('truth', 'no draft badge, no [[CONFIRM]] token (production)', m.badges === 0 && m.tokens === 0, `${m.badges} badges, ${m.tokens} tokens`);
    if (reduced) rec('motion', 'reduced: all content visible, no smooth scroll', m.hiddenReveal === 0 && !m.lenis, `hidden=${m.hiddenReveal} lenis=${m.lenis}`);
    else rec('motion', 'reveals have finished after scrolling through; no ghost left', m.hiddenReveal === 0 && m.ghosts === 0, `hidden=${m.hiddenReveal} ghosts=${m.ghosts}`);
    const allCls = sessionCls(await page.evaluate(() => window.__shifts));
    rec('cls', 'CLS over the whole visit (load + scroll) ≤ 0.05', allCls <= 0.05, `CLS ${allCls}`);

    await page.evaluate(axeSource);
    const axe = await page.evaluate(async (tags) => {
      const r = await window.axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, where: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
    }, AXE_TAGS);
    rec('axe', 'no WCAG 2.2 A/AA violations (axe)', axe.length === 0, axe.map((v) => `${v.id} (${v.impact}) ×${v.nodes}: ${v.where.join(' ; ')}`).join(' | '));

    await page.screenshot({ path: `${SCREENS}${p.id}-${vp.width}-${mode}.jpg`, type: 'jpeg', quality: 60 });
    rec('errors', 'no console errors, page errors or hydration warnings', !problems.console.length && !problems.page.length, errorsOf(s));
    rec('network', 'no failed requests or 4xx/5xx', problems.requests.length === 0, problems.requests.join(' | '));
  } catch (e) {
    rec('run', 'case completed', false, e instanceof Error ? e.message : String(e));
  } finally {
    await s?.context.close();
  }
}

// ── 2. Controls ─────────────────────────────────────────────────────────────
const CONTROL_CASES = [
  { id: 'desktop', width: 1440, height: 900, touch: false, reduced: false },
  { id: 'touch', width: 390, height: 844, touch: true, reduced: false },
  { id: 'reduced', width: 1440, height: 900, touch: false, reduced: true },
];

async function skipLinkCheck(page) {
  await page.keyboard.press('Tab');
  await wait(250);
  const f = await page.evaluate(() => {
    const el = document.activeElement;
    const r = el?.getBoundingClientRect();
    return { href: el?.getAttribute('href') ?? null, inView: !!r && r.top >= 0 && r.bottom <= window.innerHeight && r.width > 0 };
  });
  await page.keyboard.press('Enter');
  await wait(500);
  const main = await page.evaluate(() => document.activeElement?.id ?? document.activeElement?.tagName);
  return { pass: f.href === '#main' && f.inView && main === 'main', detail: `first Tab ${JSON.stringify(f)}; Enter → focus #${main}` };
}

async function heroWhatsAppCheck(page) {
  const el = (await page.$('[data-testid="sling-whatsapp"]')) ?? (await page.$('[data-testid="hero-whatsapp"]'));
  if (!el) return { pass: false, detail: 'no hero WhatsApp button' };
  const info = await el.evaluate((a) => ({ href: a.getAttribute('href') ?? '', target: a.getAttribute('target'), rel: a.getAttribute('rel') ?? '' }));
  const expected = PROFILE.whatsapp ? /^https:\/\/wa\.me\/\d+\?text=/ : new RegExp(`^mailto:${EMAIL}\\?subject=`);
  const external = !PROFILE.whatsapp || (info.target === '_blank' && /noopener/.test(info.rel));
  const ga = await gaOn(page);
  const before = await eventCount(page);
  await el.evaluate((a) => a.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await wait(300);
  await el.click();
  await wait(300);
  const opened = await page.evaluate(() => window.__opened.at(-1) ?? '');
  const ev = ga ? await eventAfter(page, before, 'whatsapp_click', { location: 'hero' }) : null;
  const pass = expected.test(info.href) && isEncodedHref(info.href) && external && opened.length > 0 && (!ga || !!ev);
  return { pass, detail: `${decodedHref(info.href).slice(0, 70).replace(/\n/g, ' / ')} target=${info.target} rel=${info.rel} opened=${!!opened} analytics=${ga ? JSON.stringify(ev) : 'off'}` };
}

/** Desktop nav: each link scrolls to its section and becomes aria-current="location" (scroll spy). */
async function navCheck(page) {
  const links = await page.$$('header nav a[data-nav]');
  if (!links.length) return { pass: false, detail: 'no desktop nav links' };
  const out = [];
  let ok = true;
  for (const link of links) {
    const { key, href } = await link.evaluate((a) => ({ key: a.dataset.nav, href: a.getAttribute('href') }));
    await scrollToY(page, 0);
    await wait(500);
    await link.click();
    await wait(2200);
    const r = await page.evaluate((h) => {
      const t = document.querySelector(h)?.getBoundingClientRect();
      const current = [...document.querySelectorAll('header nav a[aria-current]')].map((a) => a.dataset.nav);
      return { top: t ? Math.round(t.top) : null, current };
    }, href);
    const good = r.top !== null && r.top >= -4 && r.top <= 130 && r.current.length === 1 && r.current[0] === key;
    ok &&= good;
    out.push(`${key}: top ${r.top} current=${r.current.join(',') || 'none'}`);
  }
  return { pass: ok, detail: out.join('; ') };
}

async function menuCheck(page, p) {
  const btn = await firstVisible(page, '[data-testid="menu-open"]');
  if (!btn) return { pass: false, detail: 'no visible menu button' };
  await btn.focus();
  await page.keyboard.press('Enter');
  await wait(700);
  const opened = await page.evaluate(() => {
    const d = document.querySelector('dialog[data-testid="menu-dialog"]');
    return { open: !!d?.open, modal: !!d?.matches(':modal'), links: d ? d.querySelectorAll('nav a[href^="#"]').length : 0, lang: d?.querySelector('[data-testid="menu-lang-switch"]')?.getAttribute('href') ?? null };
  });
  // A native modal <dialog> keeps focus off the inert page; past its last control Tab may visit the browser's own UI
  // (document.activeElement is then <body>), as the platform intends. Any focused page element outside it fails.
  let trapped = true;
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('Tab');
    trapped &&= await page.evaluate(() => document.activeElement === document.body || !!document.activeElement?.closest('dialog[data-testid="menu-dialog"]'));
  }
  await page.keyboard.press('Escape');
  await wait(600);
  const afterEsc = await page.evaluate(() => ({
    open: !!document.querySelector('dialog[data-testid="menu-dialog"]')?.open,
    focus: document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName,
  }));
  // A link closes the menu and lands on its section.
  await btn.click();
  await wait(700);
  const link = await page.$('dialog[data-testid="menu-dialog"] nav a[href="#services"]');
  await link?.click();
  await wait(1800);
  const landed = await page.evaluate(() => ({
    open: !!document.querySelector('dialog[data-testid="menu-dialog"]')?.open,
    top: Math.round(document.getElementById('services')?.getBoundingClientRect().top ?? -9999),
  }));
  const pass =
    opened.open && opened.modal && opened.links === 4 && opened.lang === p.other && trapped && !afterEsc.open && afterEsc.focus === 'menu-open' && !landed.open && landed.top >= -4 && landed.top <= 130;
  return { pass, detail: `open=${JSON.stringify(opened)} focusTrapped=${trapped} esc=${JSON.stringify(afterEsc)} link→#services ${JSON.stringify(landed)}` };
}

/** The sling button docks into the bar past the hero, and comes back on the way up (motion); reduced: no flight. */
async function dockCheck(page, reduced) {
  const read = () =>
    page.evaluate(() => {
      const bar = document.querySelector('[data-request-bar]');
      const sling = document.querySelector('[data-testid="sling-whatsapp"]');
      const cs = bar ? getComputedStyle(bar) : null;
      return {
        bar: !!cs && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.9,
        sling: sling ? Number(getComputedStyle(sling).opacity) : null,
        ghosts: document.querySelectorAll('.motion-ghost').length,
      };
    });
  await scrollToY(page, 0);
  await wait(1200);
  const top = await read();
  const heroBottom = await page.evaluate(() => document.getElementById('top').getBoundingClientRect().bottom + window.scrollY);
  const vh = await page.evaluate(() => window.innerHeight);
  await scrollToY(page, Math.max(0, heroBottom - vh * 0.4));
  await wait(250);
  const midFlight = await read();
  await wait(1500);
  const docked = await read();
  await scrollToY(page, 0);
  await wait(1800);
  const back = await read();
  const pass = reduced
    ? !top.bar && docked.bar && !back.bar && midFlight.ghosts === 0
    : !top.bar && top.sling === 1 && docked.bar && docked.sling === 0 && docked.ghosts === 0 && !back.bar && back.sling === 1 && back.ghosts === 0;
  return { pass, detail: `top ${JSON.stringify(top)} · in flight ghosts=${midFlight.ghosts} · past hero ${JSON.stringify(docked)} · back ${JSON.stringify(back)}` };
}

async function browseCheck(page) {
  await scrollToY(page, 0);
  await wait(500);
  const link = await page.$('#top a[href="#cranes"]');
  if (!link) return { pass: false, detail: 'no Browse cranes link in the hero' };
  await link.click();
  await wait(2200);
  const top = await page.evaluate(() => Math.round(document.getElementById('cranes').getBoundingClientRect().top));
  return { pass: top >= -4 && top <= 130, detail: `#cranes top ${top}px` };
}

/** Desktop stage: wheel snap, Page keys, progress links, readout gap. Static list: progress links jump to the crane. */
async function hoistCheck(page, staged) {
  const settled = () =>
    page.evaluate(() => {
      const items = [...document.querySelectorAll('[data-hoist-item]')];
      const active = items.findIndex((i) => i.hasAttribute('data-hoist-active'));
      const tags = items.map((i) => Number(getComputedStyle(i.querySelector('[data-load-tag]')).opacity));
      const it = items[active];
      const counter = it?.querySelector('[data-counter]')?.textContent?.trim();
      const exact = it?.querySelector('[data-readout] .sr-only')?.textContent?.trim();
      const link = [...document.querySelectorAll('[data-chapter]')].findIndex((a) => a.getAttribute('aria-current') === 'step');
      return { active, link, shown: tags.map((t) => Math.round(t * 100) / 100), exact: !!counter && counter === exact, counter };
    });
  const restsOn = (s, i) => s.active === i && s.link === i && s.exact && s.shown[i] > 0.98 && s.shown.every((t, k) => k === i || t < 0.05);
  if (!staged) {
    const links = await page.$$('[data-chapter]');
    const out = [];
    let ok = links.length === 5;
    for (const [i, link] of links.entries()) {
      if (i % 2) continue;
      await tap(page, link);
      await wait(1200);
      const r = await link.evaluate((a) => {
        const t = document.querySelector(a.getAttribute('href'))?.getBoundingClientRect();
        return t ? Math.round(t.top) : null;
      });
      ok &&= r !== null && r >= -4 && r <= 140;
      out.push(`chapter ${i + 1}: top ${r}`);
    }
    return { pass: ok, detail: out.join('; ') };
  }
  const track = await page.evaluate(() => {
    const t = document.querySelector('[data-hoist-track]').getBoundingClientRect();
    return { top: t.top + window.scrollY, height: t.height };
  });
  const vh = await page.evaluate(() => window.innerHeight);
  // Wheel: stop part-way into the second beat; the stage must come to rest on a crane.
  await scrollToY(page, Math.round(track.top + 0.2 * vh));
  await wait(1500);
  await page.mouse.move(700, Math.round(vh / 2));
  await page.mouse.wheel({ deltaY: Math.round(vh * 0.18) });
  await wait(2600);
  const afterWheel = await settled();
  const wheelOk = afterWheel.active >= 0 && restsOn(afterWheel, afterWheel.active);
  // Page Down moves one crane; Page Up moves back.
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  const from = afterWheel.active;
  await page.keyboard.press('PageDown');
  await wait(2200);
  const down = await settled();
  await page.keyboard.press('PageUp');
  await wait(2200);
  const up = await settled();
  const keysOk = down.active === from + 1 && restsOn(down, from + 1) && up.active === from && restsOn(up, from);
  // Progress links glide to their crane.
  const out = [];
  let linksOk = true;
  for (const i of [3, 0, 4]) {
    const link = (await page.$$('[data-chapter]'))[i];
    await link.click();
    await wait(2600);
    const s = await settled();
    linksOk &&= restsOn(s, i);
    out.push(`link ${i + 1} → active ${s.active + 1}${restsOn(s, i) ? '' : ` (shown ${s.shown.join('/')}, exact=${s.exact})`}`);
  }
  // The readout gap: sample the stage through one beat; a photo should never be on screen without a readout.
  const gaps = await page.evaluate(async (t) => {
    const items = [...document.querySelectorAll('[data-hoist-item]')];
    const start = t.top;
    const beat = window.innerHeight * 0.55;
    let empty = 0;
    let total = 0;
    for (let y = start; y <= start + beat * 4; y += beat / 20) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 70));
      const shown = items.some((i) => Number(getComputedStyle(i.querySelector('[data-load-tag]')).opacity) > 0.5);
      total++;
      if (!shown) empty++;
    }
    return { empty, total };
  }, track);
  const pass = wheelOk && keysOk && linksOk;
  return {
    pass,
    detail: `wheel → rests on ${afterWheel.active + 1} (${wheelOk}) · PageDown ${from + 1}→${down.active + 1}, PageUp →${up.active + 1} (${keysOk}) · ${out.join('; ')} · info: no readout in ${gaps.empty}/${gaps.total} scroll samples`,
  };
}

/** Each Hoist "Request this crane" puts that crane on the hook (bar chip, pressed state, WhatsApp text). */
async function hoistRequestCheck(page, staged) {
  const out = [];
  let ok = true;
  const ga = await gaOn(page);
  for (const id of ['rt700e', 'gmk6350']) {
    const before = await eventCount(page);
    const btn = await page.$(`[data-hoist-request="${id}"]`);
    if (!btn) return { pass: false, detail: `no [data-hoist-request="${id}"]` };
    if (staged) {
      await btn.focus(); // focus brings that crane to rest on the stage
      await wait(2400);
      await page.keyboard.press('Enter');
    } else {
      await tap(page, btn);
    }
    await wait(1500);
    const chip = await barChip(page);
    const pressed = await btn.evaluate((b) => b.getAttribute('aria-pressed'));
    const href = decodedHref(await barHref(page));
    const ev = ga ? await eventAfter(page, before, 'request_crane', { crane_id: id, location: 'hoist' }) : true;
    const good = chip !== null && normModel(chip).includes(normModel(CRANES[id].model)) && pressed === 'true' && normModel(href).includes(normModel(CRANES[id].model)) && !!ev;
    ok &&= good;
    out.push(`${id}: chip="${(chip ?? 'none').trim()}" pressed=${pressed} hrefNames=${normModel(href).includes(normModel(CRANES[id].model))} analytics=${ga ? !!ev : 'off'}`);
  }
  return { pass: ok, detail: out.join('; ') };
}

/** Why Atlas's WhatsApp names the crane on the hook and shows its chip; email and form links work. */
async function whyCheck(page) {
  const r = await page.evaluate((email) => {
    const root = document.getElementById('why-atlas');
    const wa = root?.querySelector('[data-why-whatsapp]');
    const chip = root?.querySelector('[data-why-picked]');
    const links = [...(root?.querySelectorAll('a[href]') ?? [])].map((a) => a.getAttribute('href'));
    return {
      href: wa?.getAttribute('href') ?? '',
      chip: chip && !chip.hidden ? chip.textContent.trim() : null,
      mail: links.includes(`mailto:${email}`),
      form: links.includes('#request') && !!document.getElementById('request'),
      list: links.includes('#crane-list') && !!document.getElementById('crane-list'),
    };
  }, EMAIL);
  const crane = await barChip(page);
  const model = crane ? Object.values(CRANES).find((c) => normModel(crane).includes(normModel(c.model)))?.model : null;
  const names = model ? normModel(decodedHref(r.href)).includes(normModel(model)) && !!r.chip && normModel(r.chip).includes(normModel(model)) : !r.chip;
  const ga = await gaOn(page);
  const before = await eventCount(page);
  const wa = await page.$('#why-atlas [data-why-whatsapp]');
  await tap(page, wa);
  await wait(300);
  const ev = ga ? await eventAfter(page, before, 'whatsapp_click', { location: 'why' }) : true;
  return {
    pass: isEncodedHref(r.href) && names && r.mail && r.form && r.list && !!ev,
    detail: `on hook=${model ?? 'none'} hrefNames=${names} chip="${r.chip ?? ''}" email=${r.mail} form=${r.form} list=${r.list} analytics=${ga ? !!ev : 'off'}`,
  };
}

/** The bar's ✕ clears the crane: chip gone, focus on the bar's WhatsApp, message general again, form crane cleared. */
async function clearChipCheck(page) {
  if (!(await page.$('[data-testid="bar-chip-clear"]'))) return { pass: false, detail: 'no crane on the hook to clear' };
  await tap(page, '[data-testid="bar-chip-clear"]', 200);
  await wait(800);
  const r = await page.evaluate(() => ({
    chip: !!document.querySelector('[data-testid="bar-chip"]'),
    focus: document.activeElement?.hasAttribute('data-bar-whatsapp') ?? false,
    why: document.querySelector('[data-why-picked]')?.hidden ?? true,
  }));
  const decoded = normModel(decodedHref(await barHref(page)));
  const named = Object.values(CRANES).some((c) => decoded.includes(normModel(c.model)));
  const form = await formCrane(page);
  return { pass: !r.chip && r.focus && !named && r.why && (form === '' || form === null), detail: `chip=${r.chip} focusOnBarWhatsApp=${r.focus} hrefNamesCrane=${named} whyChipHidden=${r.why} formCrane=${JSON.stringify(form)}` };
}

/** Each service's "Ask about this service" carries that service in its WhatsApp text and is tracked with its id. */
async function servicesCheck(page) {
  const tiles = await page.$$('#services [data-service-tile]');
  if (tiles.length !== 4) return { pass: false, detail: `${tiles.length} service tiles` };
  const ga = await gaOn(page);
  const out = [];
  let ok = true;
  for (const tile of tiles) {
    const r = await tile.evaluate((t) => {
      const a = t.querySelector('[data-testid="service-ask"]');
      return { id: t.dataset.serviceTile, title: t.querySelector('h3')?.textContent?.trim() ?? '', href: a?.getAttribute('href') ?? '', target: a?.getAttribute('target'), rel: a?.getAttribute('rel') ?? '' };
    });
    const before = await eventCount(page);
    const link = await tile.$('[data-testid="service-ask"]');
    await tap(page, link, 250);
    await wait(250);
    const ev = ga ? await eventAfter(page, before, 'whatsapp_click', { location: 'services', service: r.id }) : true;
    const good = decodedHref(r.href).includes(r.title) && isEncodedHref(r.href) && (!PROFILE.whatsapp || (r.target === '_blank' && /noopener/.test(r.rel))) && !!ev;
    ok &&= good;
    out.push(`${r.id}: text names "${r.title}"=${decodedHref(r.href).includes(r.title)} analytics=${ga ? !!ev : 'off'}`);
  }
  return { pass: ok, detail: out.join('; ') };
}

// Find your crane ──────────────────────────────────────────────────────────
async function lineupLive(page) {
  await page.$eval('#crane-list', (e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  for (let i = 0; i < 30; i++) {
    if (await page.evaluate(() => document.getElementById('crane-list')?.hasAttribute('data-live'))) return true;
    await wait(200);
  }
  return false;
}

async function filterCheck(page) {
  const visible = () => page.$$eval('#crane-list [data-testid="crane-card"]', (cards) => cards.filter((c) => c.checkVisibility()).map((c) => c.dataset.crane).sort());
  const count = () => page.$eval('#crane-list .lineup-count', (p) => p.textContent.trim());
  const all = await visible();
  const values = await page.$$eval('#crane-list [data-testid="filter-chip"]', (chips) => chips.map((c) => c.dataset.value));
  if (!values.includes('all')) return { pass: false, detail: `chips: ${values.join(', ') || 'none'}` };
  const ga = await gaOn(page);
  const before = await eventCount(page);
  const lines = [];
  let ok = true;
  let changed = false;
  for (const value of [...values.filter((v) => v !== 'all'), 'all']) {
    const chip = await page.$(`#crane-list [data-testid="filter-chip"][data-value="${value}"]`);
    await tap(page, chip, 250);
    await wait(1100); // Flip reflow
    const got = await visible();
    const expected = expectedForFilter(all, value);
    const pressed = await page.$$eval('#crane-list [data-testid="filter-chip"][aria-pressed="true"]', (cs) => cs.map((c) => c.dataset.value));
    const text = await count();
    const same = got.join() === expected.join();
    const countOk = text.includes(String(got.length)) || (got.length === 2 && /two|اثن|رافعتان/i.test(text)) || (got.length === 1 && /one|^1|واحدة|رافعة واحدة/i.test(text));
    if (got.length !== all.length) changed = true;
    ok &&= same && pressed.length === 1 && pressed[0] === value && countOk && !EASTERN_DIGITS.test(text);
    lines.push(`${value}: ${got.length}${same ? '' : ` (want ${expected.join('/')})`} "${text}"${countOk ? '' : ' COUNT?'}`);
  }
  const ev = ga ? await eventAfter(page, before, 'filter_use') : true;
  return { pass: ok && changed && !!ev, detail: `all=${all.length}; ${lines.join('; ')}; analytics=${ga ? !!ev : 'off'}` };
}

async function loadCheck(page) {
  const input = await page.$('#load-check-input');
  if (!input) return { pass: false, detail: 'no load check input' };
  const all = await page.$$eval('#crane-list [data-testid="crane-card"]', (cs) => cs.map((c) => c.dataset.crane).sort());
  await input.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await input.click({ clickCount: 3 });
  await page.keyboard.type('٢٠٠'); // 200 in Arabic-Indic digits
  await wait(900);
  const ok200 = await page.evaluate(() => ({
    yes: [...document.querySelectorAll('#crane-list [data-testid="crane-card"][data-fit="yes"]')].map((c) => c.dataset.crane).sort(),
    result: document.getElementById('load-check-result')?.textContent?.trim() ?? '',
    state: document.getElementById('load-check-result')?.dataset.state,
    invalid: document.getElementById('load-check-input')?.getAttribute('aria-invalid'),
  }));
  const fitOk = ok200.yes.join() === expectedForLoad(all, 200).join() && ok200.state === 'ok' && ok200.result.includes('200') && !EASTERN_DIGITS.test(ok200.result) && ok200.invalid !== 'true';
  await input.click({ clickCount: 3 });
  await page.keyboard.type('abc');
  await wait(900);
  const bad = await page.evaluate(() => ({
    invalid: document.getElementById('load-check-input')?.getAttribute('aria-invalid'),
    state: document.getElementById('load-check-result')?.dataset.state,
    result: document.getElementById('load-check-result')?.textContent?.trim() ?? '',
    fits: document.querySelectorAll('#crane-list [data-fit]').length,
  }));
  const clear = await page.$('#crane-list .lineup-load__clear');
  await clear?.click();
  await wait(500);
  const cleared = await page.evaluate(() => ({ value: document.getElementById('load-check-input')?.value, focus: document.activeElement?.id }));
  const pass = fitOk && bad.invalid === 'true' && bad.state === 'invalid' && bad.result.length > 0 && cleared.value === '' && cleared.focus === 'load-check-input';
  return { pass, detail: `«٢٠٠» → fits ${ok200.yes.join(',')} "${ok200.result}" · «abc» → ${JSON.stringify(bad)} · clear → ${JSON.stringify(cleared)}` };
}

async function sheetCheck(page) {
  const btn = await page.$('#crane-list [data-details][data-crane="gmk6350"]');
  if (!btn) return { pass: false, detail: 'no Details button for gmk6350' };
  await btn.evaluate((b) => b.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await wait(300);
  await btn.focus();
  await page.keyboard.press('Enter');
  await wait(1400);
  const opened = await page.evaluate(() => {
    const d = document.getElementById('crane-sheet');
    return { open: !!d?.open, modal: !!d?.matches(':modal'), focusInside: !!document.activeElement?.closest('#crane-sheet'), title: d?.querySelector('h2')?.textContent?.trim() ?? '' };
  });
  let trapped = true;
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    trapped &&= await page.evaluate(() => document.activeElement === document.body || !!document.activeElement?.closest('#crane-sheet'));
  }
  await page.keyboard.press('Escape');
  await wait(900);
  const closed = await page.evaluate(() => ({
    open: !!document.getElementById('crane-sheet')?.open,
    back: document.activeElement?.matches('[data-details][data-crane="gmk6350"]') ?? false,
  }));
  return {
    pass: opened.open && opened.modal && opened.focusInside && /GMK6350/.test(opened.title) && trapped && !closed.open && closed.back,
    detail: `Enter → ${JSON.stringify(opened)} · Tab stays inside=${trapped} · Esc → ${JSON.stringify(closed)}`,
  };
}

async function compareCheck(page) {
  const state = () =>
    page.evaluate(() => ({
      pressed: [...document.querySelectorAll('[data-testid="compare-pick"][aria-pressed="true"]')].map((b) => b.dataset.crane),
      cols: [...document.querySelectorAll('#crane-compare thead th[data-col]')].filter((th) => th.checkVisibility()).map((th) => th.dataset.col),
      status: document.querySelector('#crane-compare .lineup-compare__status')?.textContent?.trim() ?? '',
    }));
  const s0 = await state();
  const unpicked = await page.$$eval('[data-testid="compare-pick"][aria-pressed="false"]', (bs) => bs.map((b) => b.dataset.crane));
  let s1 = s0;
  if (unpicked[0]) {
    await tap(page, `[data-testid="compare-pick"][data-crane="${unpicked[0]}"]`, 250);
    await wait(500);
    s1 = await state();
  }
  await tap(page, `[data-testid="compare-pick"][data-crane="${s1.pressed[0]}"]`, 250);
  await wait(500);
  const s2 = await state();
  const pass =
    s0.pressed.length === 3 &&
    s0.cols.join() === s0.pressed.join() &&
    s1.pressed.length === 3 &&
    s1.pressed.includes(unpicked[0]) &&
    s1.status.length > 0 &&
    s1.cols.length === 3 &&
    s2.pressed.length === 2 &&
    s2.cols.length === 2;
  return { pass, detail: `default ${s0.pressed.join(',')} cols ${s0.cols.join(',')} · +${unpicked[0]} → ${s1.pressed.join(',')} "${s1.status}" · −${s1.pressed[0]} → ${s2.pressed.join(',')} cols ${s2.cols.length}` };
}

/** Request this crane (card) → the chip rides into the bar → bar chip, encoded WhatsApp text, form select. */
async function requestRideCheck(page, motion) {
  const btn = await page.$('#crane-list [data-testid="request-crane-button"][data-crane="gmk6350"]');
  if (!btn) return { pass: false, detail: 'no request button for gmk6350' };
  const ga = await gaOn(page);
  const before = await eventCount(page);
  await btn.evaluate((b) => b.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await wait(350);
  await btn.click();
  await wait(140);
  const flying = await page.evaluate(() => document.querySelectorAll('.motion-ghost').length);
  await wait(1500);
  const r = await page.evaluate(() => ({
    ghosts: document.querySelectorAll('.motion-ghost').length,
    card: document.querySelector('#crane-list [data-testid="crane-card"][data-crane="gmk6350"]')?.hasAttribute('data-on-hook'),
    formChip: document.querySelector('[data-testid="form-hook-chip"]')?.textContent?.trim() ?? null,
  }));
  const chip = await barChip(page);
  const href = await barHref(page);
  const form = await formCrane(page);
  const ev = ga ? await eventAfter(page, before, 'request_crane', { crane_id: 'gmk6350', location: 'card' }) : true;
  const pass =
    (!motion || flying > 0) &&
    r.ghosts === 0 &&
    r.card &&
    chip !== null &&
    normModel(chip).includes('GMK6350') &&
    normModel(decodedHref(href)).includes('GMK6350') &&
    isEncodedHref(href) &&
    form === 'crane:gmk6350' &&
    !!r.formChip &&
    !!ev;
  return { pass, detail: `ride ghost=${flying} (motion ${motion}) left=${r.ghosts} chip="${(chip ?? '').trim()}" card on hook=${r.card} form=${form} formChip="${r.formChip}" analytics=${ga ? !!ev : 'off'} href=${decodedHref(href).slice(0, 60).replace(/\n/g, ' / ')}` };
}

/** The sheet's own Request closes the sheet and puts its crane on the hook. */
async function sheetRequestCheck(page) {
  const btn = await page.$('#crane-list [data-details][data-crane="quy250"]');
  if (!btn) return { pass: false, detail: 'no Details for quy250' };
  await tap(page, btn);
  await wait(1400);
  const req = await page.$('#crane-sheet [data-testid="sheet-request"]');
  if (!req) return { pass: false, detail: 'sheet did not open' };
  await req.click();
  await wait(1600);
  const open = await page.evaluate(() => !!document.getElementById('crane-sheet')?.open);
  const chip = await barChip(page);
  return { pass: !open && chip !== null && normModel(chip).includes('QUY250'), detail: `sheet open=${open} chip="${(chip ?? '').trim()}"` };
}

// Gallery ───────────────────────────────────────────────────────────────────
const stripState = (page) =>
  page.evaluate(() => {
    const t = document.getElementById('sites-track');
    const [prev, next] = document.querySelectorAll('#sites .ui-carousel__controls button[aria-controls="sites-track"]');
    const strip = document.querySelector('[data-sites-strip]');
    const tx = /translate3d\((-?[\d.]+)px/.exec(t?.style.transform ?? '');
    return {
      // The drift loop (src/motion/sites.ts) adds aria-hidden copies of the cards: count only the real ones.
      n: t?.querySelectorAll('[data-testid="site-photo"]').length ?? 0,
      loop: !!strip?.dataset.loop,
      phase: tx ? Math.round(Number(tx[1])) : 0,
      x: Math.round(Math.abs(t?.scrollLeft ?? 0)),
      prev: prev?.getAttribute('aria-disabled') === 'true',
      next: next?.getAttribute('aria-disabled') === 'true',
      label: document.querySelector('[data-sites-strip]')?.getAttribute('aria-label') ?? '',
      photos: [...(t?.querySelectorAll('[data-testid="site-photo"]') ?? [])].map((b) => b.dataset.photo),
    };
  });

async function galleryPickerCheck(page) {
  await page.$eval('#sites', (e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await wait(800);
  const all = await stripState(page);
  const labels = await page.$$('#sites .sites-filter label');
  const counts = [];
  for (const label of [...labels.slice(1), labels[0]]) {
    await label.click();
    await wait(900);
    const s = await stripState(page);
    const checked = await label.evaluate((l) => l.querySelector('input').checked);
    counts.push({ n: s.n, label: s.label, checked });
  }
  const [a, b, back] = counts;
  const pass = labels.length === 3 && all.n > 0 && a.n > 0 && b.n > 0 && a.n + b.n === all.n && back.n === all.n && counts.every((c) => c.checked) && a.label !== b.label;
  return { pass, detail: `all ${all.n} · ${a.n} "${a.label}" · ${b.n} "${b.label}" · back ${back.n}` };
}

/** Drift loop (motion on): it moves by itself, Pause stops it, paddles and arrow keys nudge by one card, a drag takes over. */
async function galleryLoopCheck(page, p, touch) {
  const rtl = p.dir === 'rtl';
  const phase = async () => (await stripState(page)).phase;
  const forward = (a, b) => (rtl ? b - a : a - b); // content travels towards the start edge
  await page.mouse.move(2, 2);
  await page.$eval('#sites-track', (t) => t.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await wait(1500);
  const a0 = await phase();
  await wait(1000);
  const a1 = await phase();
  const drifts = forward(a0, a1) > 20; // ~120 px/s towards the reading start (Arabic: left to right)
  const toggle = await page.$('#sites [data-sites-motion]');
  const name0 = await toggle.evaluate((e) => e.textContent.trim());
  await toggle.click();
  await wait(1600);
  const name1 = await toggle.evaluate((e) => e.textContent.trim());
  const b0 = await phase();
  await wait(800);
  const b1 = await phase();
  const stopped = Math.abs(b1 - b0) < 2 && name1 !== name0;
  const step = await page.evaluate(() => {
    const l = document.querySelectorAll('#sites-track > li');
    return Math.abs(l[13].offsetLeft - l[12].offsetLeft);
  });
  const [prev, next] = await page.$$('#sites .ui-carousel__controls button[aria-controls="sites-track"]');
  await next.click();
  await wait(1100);
  const c1 = await phase();
  await prev.click();
  await wait(1100);
  const c2 = await phase();
  await page.$eval('#sites-track li:not([data-clone]) button', (b) => b.focus());
  await page.keyboard.press(nextKey(p.dir));
  await wait(1100);
  const c3 = await phase();
  const nudge = Math.abs(forward(b1, c1) - step) < 4 && Math.abs(c2 - b1) < 4 && Math.abs(forward(c2, c3) - step) < 4;
  await page.$eval('#sites-track', (t) => t.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await wait(300);
  const box = await page.$eval('#sites .sites-viewport', (v) => {
    const r = v.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: Math.min(Math.max(r.top + r.height / 2, 80), window.innerHeight - 140) };
  });
  const dx = (rtl ? 1 : -1) * 240;
  if (touch) {
    await page.touchscreen.touchStart(box.x - dx / 2, box.y);
    for (let i = 1; i <= 10; i++) await page.touchscreen.touchMove(box.x - dx / 2 + (dx * i) / 10, box.y);
    await page.touchscreen.touchEnd();
  } else {
    await page.mouse.move(box.x - dx / 2, box.y);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) await page.mouse.move(box.x - dx / 2 + (dx * i) / 8, box.y, { steps: 2 });
    await page.mouse.up();
  }
  await wait(300);
  const d1 = await phase();
  const dragged = Math.abs(d1 - c3) > 100;
  await page.mouse.move(2, 2);
  await toggle.click(); // play again, so later checks see the loop as a visitor would
  await wait(400);
  const pass = drifts && stopped && nudge && dragged;
  return { pass, detail: `drift ${forward(a0, a1)} px/s · Pause "${name0}" → "${name1}" stops (${b1 - b0}) · paddle ${forward(b1, c1)} / back ${c2 - b1} / key ${forward(c2, c3)} (card ${step}) · ${touch ? 'swipe' : 'drag'} ${d1 - c3}` };
}

async function galleryPaddleKeyCheck(page, p, touch, drag) {
  await page.$eval('#sites', (e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await wait(700);
  const s0 = await stripState(page);
  if (s0.loop) return galleryLoopCheck(page, p, touch);
  const [prev, next] = await page.$$('#sites .ui-carousel__controls button[aria-controls="sites-track"]');
  await next.click();
  await wait(1000);
  const s1 = await stripState(page);
  await prev.click();
  await wait(1000);
  const s2 = await stripState(page);
  // Keys on the focused track follow the reading direction (native scroll; ArrowLeft goes forward in Arabic).
  await page.$eval('#sites-track', (t) => t.focus());
  await page.keyboard.press(nextKey(p.dir));
  await wait(900);
  const s3 = await stripState(page);
  await page.$eval('#sites-track', (t) => t.scrollTo({ left: 0, behavior: 'instant' }));
  await wait(400);
  // Swipe (touch) or drag (desktop motion: src/motion/sites.ts startSitesDrag) forward in the reading direction.
  await page.$eval('#sites-track', (t) => t.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await wait(400);
  const box = await page.$eval('#sites-track', (t) => {
    const r = t.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: Math.min(Math.max(r.top + r.height / 2, r.top + 40), window.innerHeight - 140), w: r.width };
  });
  const dx = (p.dir === 'rtl' ? 1 : -1) * Math.min(260, box.w * 0.4);
  const gesture = touch ? 'swipe' : drag ? 'drag' : null;
  if (touch) {
    await page.touchscreen.touchStart(box.x - dx / 2, box.y);
    for (let i = 1; i <= 10; i++) await page.touchscreen.touchMove(box.x - dx / 2 + (dx * i) / 10, box.y);
    await page.touchscreen.touchEnd();
  } else if (drag) {
    await page.mouse.move(box.x - dx / 2, box.y);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) await page.mouse.move(box.x - dx / 2 + (dx * i) / 8, box.y, { steps: 2 });
    await page.mouse.up();
  }
  await wait(1200);
  const s4 = await stripState(page);
  const pass = s0.prev && s0.x <= 2 && s1.x > 20 && !s1.prev && s2.x <= 2 && s2.prev && s3.x > 20 && (!gesture || s4.x > 20);
  return { pass, detail: `start x=${s0.x} prevDisabled=${s0.prev} · next → x=${s1.x} · prev → x=${s2.x} · ${nextKey(p.dir)} → x=${s3.x}${gesture ? ` · ${gesture} → x=${s4.x}` : ''}` };
}

async function lightboxCheck(page, dir) {
  await page.$eval('#sites-track', (t) => t.scrollTo({ left: 0, behavior: 'instant' }));
  const buttons = await page.$$('#sites-track [data-testid="site-photo"]');
  if (buttons.length < 3) return { pass: false, detail: `${buttons.length} photos` };
  const ids = await Promise.all(buttons.map((b) => b.evaluate((e) => e.dataset.photo)));
  const shown = () =>
    page.evaluate(() => {
      const d = document.querySelector('dialog[data-testid="lightbox"]');
      const img = d ? [...d.querySelectorAll('img')].find((i) => i.checkVisibility()) : null;
      return { open: !!d?.open, modal: !!d?.matches(':modal'), src: img ? img.currentSrc || img.getAttribute('src') || '' : '' };
    });
  await buttons[1].evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
  await wait(300);
  await buttons[1].focus();
  await page.keyboard.press('Enter');
  await wait(1100);
  const s0 = await shown();
  await page.keyboard.press(nextKey(dir));
  await wait(700);
  const s1 = await shown();
  await page.keyboard.press(prevKey(dir));
  await wait(700);
  await page.keyboard.press(prevKey(dir));
  await wait(700);
  const s2 = await shown();
  await page.keyboard.press('End');
  await wait(700);
  const s3 = await shown();
  await page.keyboard.press('Home');
  await wait(700);
  await page.keyboard.press(nextKey(dir));
  await wait(700);
  await page.keyboard.press('Escape');
  await wait(1000);
  const after = await page.evaluate(() => ({
    open: !!document.querySelector('dialog[data-testid="lightbox"]')?.open,
    focus: document.activeElement?.closest('[data-testid="site-photo"]')?.dataset.photo ?? document.activeElement?.tagName,
  }));
  const got = [s0, s1, s2, s3].map((s) => photoIdFromUrl(s.src));
  const pass = s0.open && s0.modal && got[0] === ids[1] && got[1] === ids[2] && got[2] === ids[0] && got[3] === ids.at(-1) && !after.open && after.focus === ids[1];
  return { pass, detail: `strip ${ids.slice(0, 3).join(',')}…${ids.at(-1)} · Enter on #2 → ${got[0]}, ${nextKey(dir)} → ${got[1]}, ${prevKey(dir)}×2 → ${got[2]}, End → ${got[3]} · Esc → open=${after.open} focus=${after.focus}` };
}

// Form ──────────────────────────────────────────────────────────────────────
async function emptySubmitCheck(page) {
  await tap(page, '[data-testid="form-submit"]');
  await wait(700);
  const r = await page.evaluate(() => {
    const sum = document.querySelector('[data-testid="form-error-summary"]');
    const links = sum ? [...sum.querySelectorAll('a[href^="#"]')] : [];
    const targetsOk = links.length > 0 && links.every((a) => !!document.getElementById(a.getAttribute('href').slice(1)));
    const invalid = ['weight', 'phone'].filter((n) => document.querySelector(`[data-testid="request-form"] [name="${n}"]`)?.getAttribute('aria-invalid') === 'true');
    return { summary: !!sum?.checkVisibility(), focused: document.activeElement === sum, links: links.length, targetsOk, invalid, first: links[0]?.getAttribute('href') ?? '' };
  });
  const link = await page.$('[data-testid="form-error-summary"] a');
  await link?.click();
  await wait(500);
  const field = await page.evaluate(() => `#${document.activeElement?.id ?? ''}`);
  return {
    pass: r.summary && r.focused && r.links >= 2 && r.targetsOk && r.invalid.length === 2 && field === r.first,
    detail: `summary=${r.summary} focused=${r.focused} links=${r.links} targetsOk=${r.targetsOk} invalid=${r.invalid.join(',')} · first link → focus ${field}`,
  };
}

/** Arabic-Indic weight, a phone typed with "+" and spaces, a crane from the select: valid, echoed, Western in the hand-off. */
async function fillFormCheck(page) {
  const weight = await page.$('[data-testid="form-weight"]');
  const phone = await page.$('[data-testid="form-phone"]');
  if (!weight || !phone) return { pass: false, detail: 'form-weight or form-phone missing' };
  await weight.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await weight.click({ clickCount: 3 });
  await page.keyboard.type('٣٥٫٥');
  await phone.click({ clickCount: 3 });
  await page.keyboard.type('+218 91 234 5678');
  await page.select('[data-testid="request-form"] select[name="crane"]', 'crane:ac200-1');
  await wait(900);
  const r = await page.evaluate(() => {
    const ph = document.querySelector('[data-testid="form-phone"]');
    const alt = [...document.querySelectorAll('[data-testid="request-form"] a[href^="https://wa.me"], [data-testid="request-form"] a[href^="mailto:"]')].at(-1);
    return {
      phoneDir: ph ? getComputedStyle(ph).direction : null,
      phoneValue: ph?.value,
      phoneStartsPlus: ph ? ph.getBoundingClientRect().left : 0,
      alt: alt?.getAttribute('href') ?? '',
      weightInvalid: document.querySelector('[data-testid="form-weight"]')?.getAttribute('aria-invalid'),
    };
  });
  const chip = await barChip(page);
  const sent = decodedHref(r.alt);
  const digitsOk = !EASTERN_DIGITS.test(sent) && /35\.5/.test(sent) && sent.replace(/\s/g, '').includes('+218912345678');
  const pass =
    r.phoneDir === 'ltr' &&
    r.phoneValue === '+218 91 234 5678' &&
    isEncodedHref(r.alt) &&
    digitsOk &&
    normModel(sent).includes('AC200-1') &&
    chip !== null &&
    normModel(chip).includes('AC200-1');
  return {
    pass,
    detail: `phone dir=${r.phoneDir} value="${r.phoneValue}" · hand-off link Western=${digitsOk} names AC200-1=${normModel(sent).includes('AC200-1')} · select → bar chip "${(chip ?? '').trim()}"`,
  };
}

async function submitCheck(page, s) {
  const ga = await gaOn(page);
  if (FORM_STUB) {
    s.state.formStatus = 500;
    const before = await eventCount(page);
    await tap(page, '[data-testid="form-submit"]');
    await wait(1800);
    const fail = await page.evaluate(() => ({
      shown: !!document.querySelector('[data-testid="form-failure"]')?.checkVisibility(),
      focused: document.activeElement?.getAttribute('data-testid') === 'form-failure',
      retry: !!document.querySelector('[data-testid="form-failure"] button[type="submit"]'),
      live: document.querySelector('[data-testid="form-live"]')?.textContent?.trim() ?? '',
    }));
    const evFail = ga ? await eventAfter(page, before, 'form_submit', { result: 'failed' }) : true;
    s.state.formStatus = 200;
    await wait(3200); // past the hand-off lock
    const retry = await page.$('[data-testid="form-failure"] button[type="submit"]');
    if (retry) await tap(page, retry);
    await wait(1800);
    const ok = await page.evaluate(() => ({
      shown: !!document.querySelector('[data-testid="form-success"]')?.checkVisibility(),
      focused: document.activeElement?.getAttribute('data-testid') === 'form-success',
    }));
    const evOk = ga ? await eventAfter(page, before, 'form_submit', { result: 'sent' }) : true;
    const body = s.problems.posts.at(-1) ?? '';
    const payloadOk = /35\.5/.test(body) && !EASTERN_DIGITS.test(body) && /ac200-1|AC200-1/.test(body);
    return {
      pass: fail.shown && fail.focused && fail.retry && fail.live.length > 0 && ok.shown && ok.focused && payloadOk && !!evFail && !!evOk,
      detail: `500 → failure ${JSON.stringify(fail)} · 200 → success ${JSON.stringify(ok)} · payload Western/35.5/crane=${payloadOk} (${s.problems.posts.length} POST) · analytics=${ga ? `${!!evFail}/${!!evOk}` : 'off'}`,
    };
  }
  const before = s.problems.external.length;
  await page.evaluate(() => (window.__opened = []));
  await tap(page, '[data-testid="form-submit"]');
  await wait(1500);
  const live = await page.$eval('[data-testid="form-live"]', (e) => e.textContent.trim()).catch(() => '');
  const sent = [...s.problems.external.slice(before), ...(await page.evaluate(() => window.__opened))].map(decodedHref).join('\n');
  const pass = live.length > 0 && /35\.5/.test(sent) && !EASTERN_DIGITS.test(sent) && normModel(sent).includes('AC200-1');
  return { pass, detail: `hand-off live="${live}" sent=${sent.slice(0, 120).replace(/\n/g, ' / ')}` };
}

// Footer, documents, back to top, language ─────────────────────────────────
async function footerCheck(page) {
  const r = await page.evaluate((email) => {
    const f = document.querySelector('footer[data-footer]');
    const bad = [];
    for (const a of f?.querySelectorAll('a[href]') ?? []) {
      const href = a.getAttribute('href');
      if (href.startsWith('#')) {
        if (!document.getElementById(href.slice(1))) bad.push(`${href} has no target`);
      } else if (href.startsWith('mailto:')) {
        if (href !== `mailto:${email}`) bad.push(href);
      } else if (/^https?:/.test(href)) {
        if (a.getAttribute('target') !== '_blank' || !/noopener/.test(a.getAttribute('rel') ?? '')) bad.push(`${href} not a safe new tab`);
      }
    }
    return { links: f?.querySelectorAll('a[href]').length ?? 0, bad, documents: !!document.getElementById('documents') || !!document.querySelector('a[href="#documents"]') };
  }, EMAIL);
  return { pass: r.links > 5 && r.bad.length === 0 && !r.documents, detail: `${r.links} links ${r.bad.join('; ')} · documents section or link present=${r.documents}` };
}

async function backToTopCheck(page, reduced) {
  await scrollToY(page, 1e7);
  await wait(1200);
  const before = await page.evaluate(() => Math.round(window.scrollY));
  await tap(page, '[data-testid="back-to-top"]', 300);
  await wait(reduced ? 900 : 3200);
  const after = await page.evaluate(() => Math.round(window.scrollY));
  return { pass: before > 500 && after <= 2, detail: `scrollY ${before} → ${after}` };
}

async function langSwitchCheck(page, p) {
  await scrollToY(page, 0);
  await wait(500);
  const link = await firstVisible(page, '[data-testid="lang-switch"]');
  if (!link) return { pass: false, detail: 'no visible [data-testid="lang-switch"]' };
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }), link.click()]);
  const after = await page.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang, dir: document.documentElement.dir }));
  return { pass: after.path === p.other && after.lang === p.otherLang, detail: JSON.stringify(after) };
}

async function controlsFor(p, c) {
  const tag = `${p.id} @${c.width} ${c.id}`;
  const motion = !c.reduced;
  const staged = c.id === 'desktop';
  const group = async (name, fn) => {
    let s;
    try {
      s = await open(p.path, { width: c.width, height: c.height, touch: c.touch, reduced: c.reduced });
      await fn(s);
      record('errors', `${tag} ${name}: no console/page errors`, !s.problems.console.length && !s.problems.page.length, errorsOf(s));
    } catch (e) {
      record('run', `${tag} ${name} completed`, false, e instanceof Error ? e.message : String(e));
    } finally {
      await s?.context.close();
    }
  };
  await group('chrome', async ({ page }) => {
    await step('keyboard', `${tag} skip link is the first Tab stop and moves focus to #main`, () => skipLinkCheck(page));
    await step('hero', `${tag} hero WhatsApp: encoded message, safe new tab, tracked`, () => heroWhatsAppCheck(page));
    if (c.width >= 1024) await step('nav', `${tag} header nav scrolls to each section; scroll spy sets aria-current`, () => navCheck(page));
    else await step('menu', `${tag} menu: modal, focus trapped, Esc returns focus, a link lands on its section`, () => menuCheck(page, p));
    await step('dock', `${tag} ${motion ? 'sling WhatsApp docks into the bar past the hero and returns' : 'bar appears past the hero (no flight)'}`, () => dockCheck(page, c.reduced));
    await step('hero', `${tag} Browse cranes lands on the Hoist`, () => browseCheck(page));
  });
  await group('hoist, why, services', async ({ page }) => {
    await page.$eval('#cranes', (e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await wait(1500);
    await step('hoist', `${tag} Hoist ${staged ? 'stage: wheel snaps to a crane, Page keys move one crane, progress links glide' : 'progress links jump to each crane'}`, () => hoistCheck(page, staged));
    await step('request', `${tag} Hoist Request buttons put the crane on the hook (chip, pressed, WhatsApp text)`, () => hoistRequestCheck(page, staged));
    await step('why', `${tag} Why Atlas: WhatsApp names the crane on the hook; email, form and list links`, () => whyCheck(page));
    await step('bar', `${tag} bar chip ✕ clears the crane and returns focus to the bar's WhatsApp`, () => clearChipCheck(page));
    await step('services', `${tag} each "Ask about this service" carries its service`, () => servicesCheck(page));
  });
  await group('find your crane', async ({ page }) => {
    const live = await lineupLive(page);
    record('lineup', `${tag} lineup island mounts when near`, live);
    await step('lineup', `${tag} type filters show the right cranes, one pressed, live count`, () => filterCheck(page));
    await step('lineup', `${tag} load check: «٢٠٠» marks the cranes rated ≥ 200 t; invalid input flagged; clear refocuses`, () => loadCheck(page));
    await step('lineup', `${tag} Details sheet: Enter opens a modal, focus stays inside, Esc returns focus`, () => sheetCheck(page));
    await step('lineup', `${tag} compare: three by default, a fourth replaces the oldest, columns follow`, () => compareCheck(page));
    await step('request', `${tag} Request this crane rides into the bar: chip, encoded text, form select`, () => requestRideCheck(page, motion));
    await step('request', `${tag} the sheet's Request closes it and puts its crane on the hook`, () => sheetRequestCheck(page));
  });
  await group('gallery', async ({ page }) => {
    await step('gallery', `${tag} site picker narrows the strip and comes back`, () => galleryPickerCheck(page));
    const gesture = c.touch ? ' and swipe' : staged ? ' and mouse drag' : '';
    await step('gallery', `${tag} paddles, ${nextKey(p.dir)}${gesture} move the strip forward`, () => galleryPaddleKeyCheck(page, p, c.touch, staged));
    await step('lightbox', `${tag} lightbox: Enter opens, arrows follow ${p.dir}, Home/End, Esc returns focus`, () => lightboxCheck(page, p.dir));
  });
  await group('form', async (s) => {
    await s.page.$eval('#request', (e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await wait(900);
    await step('form', `${tag} empty submit: summary focused, links focus their fields`, () => emptySubmitCheck(s.page));
    await step('form', `${tag} «٣٥٫٥» t, bidi phone, crane select: Western digits in the hand-off`, () => fillFormCheck(s.page));
    await step('form', `${tag} ${FORM_STUB ? 'endpoint 500 → failure focused; 200 → success focused' : 'submit hands the request off (WhatsApp / email)'}`, () => submitCheck(s.page, s));
  });
  await group('footer', async ({ page }) => {
    await step('footer', `${tag} footer links valid; Documents absent (no files yet)`, () => footerCheck(page));
    await step('nav', `${tag} back to top returns to scrollY 0`, () => backToTopCheck(page, c.reduced));
    await step('lang', `${tag} language switch opens ${p.other}`, () => langSwitchCheck(page, p));
  });
}

// ── 3. Keyboard walk: focus ring, never under the bar or the header ────────
async function keyboardWalk(p, c) {
  const tag = `${p.id} @${c.width}x${c.height} ${c.id}`;
  const s = await open(p.path, { width: c.width, height: c.height, touch: c.touch, reduced: c.reduced });
  const { page } = s;
  try {
    const misses = { ring: [], contrast: [], bar: [], header: [], off: [], faded: [] };
    let stops = 0;
    let lastKey = '';
    const seen = new Set();
    for (let i = 0; i < 260; i++) {
      await page.keyboard.press('Tab');
      await wait(c.id === 'desktop' ? 260 : 140);
      let r = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const lum = (rgb) => {
          const [r, g, b] = rgb.map((v) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const parse = (c) => (c.match(/[\d.]+/g) ?? []).map(Number);
        const surface = { night: [10, 10, 10], dark: [10, 10, 10], brand: [35, 32, 122], navy: [35, 32, 122] };
        // The ground behind a ring: the first opaque background up the tree, else the section surface, else the
        // declared ground (the fixed header and the bar are glass: data-ground="dark" stands for their black glass).
        const bgOf = (node) => {
          for (let n = node; n; n = n.parentElement) {
            const c = parse(getComputedStyle(n).backgroundColor);
            if (c.length >= 3 && (c[3] ?? 1) > 0.9) return c.slice(0, 3);
            const sf = n.getAttribute?.('data-surface');
            if (sf && surface[sf]) return surface[sf];
            const g = n.getAttribute?.('data-ground');
            if (g === 'dark') return [10, 10, 10];
          }
          return [255, 255, 255];
        };
        // The ring may be drawn on the element, a wrapping label (radios) or a card that :has(:focus-visible).
        let ringEl = null;
        for (let n = el, k = 0; n && k < 4; n = n.parentElement, k++) {
          const cs = getComputedStyle(n);
          if ((cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 1) || (cs.boxShadow !== 'none' && n === el)) {
            ringEl = n;
            break;
          }
        }
        let ratio = null;
        if (ringEl) {
          const cs = getComputedStyle(ringEl);
          if (cs.outlineStyle !== 'none') {
            const a = lum(parse(cs.outlineColor).slice(0, 3));
            const b = lum(bgOf(ringEl.parentElement ?? ringEl));
            ratio = Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 10) / 10;
          }
        }
        const box = (ringEl ?? el).getBoundingClientRect();
        const rect = { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
        // Hit-test a 5×3 grid inside the focused box: a point is covered when the topmost element there belongs to
        // the bar or the header (z-order counts: the skip link sits above the header). Returns the covered share.
        const cover = (sel) => {
          const o = document.querySelector(sel);
          if (!o || o.contains(el)) return 0;
          const cs = getComputedStyle(o);
          if (cs.visibility === 'hidden' || Number(cs.opacity) < 0.1) return 0;
          let hit = 0;
          let n = 0;
          for (const fx of [0.08, 0.3, 0.5, 0.7, 0.92]) {
            for (const fy of [0.15, 0.5, 0.85]) {
              const x = rect.left + (rect.right - rect.left) * fx;
              const y = rect.top + (rect.bottom - rect.top) * fy;
              if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue;
              n++;
              const top = document.elementFromPoint(x, y);
              if (top && o.contains(top) && !el.contains(top)) hit++;
            }
          }
          return n ? Math.round((hit / n) * 100) : 0;
        };
        // Visible opacity of the control (a native radio is drawn by its label); a disabled paddle may be dimmed.
        const shown = el.matches('input[type=radio], input[type=checkbox]') ? (el.closest('label') ?? el) : el;
        let opacity = 1;
        for (let n = shown; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
        if (el.getAttribute('aria-disabled') === 'true') opacity = 1;
        const inDialog = !!el.closest('dialog');
        const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || el.id || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 28);
        return {
          key: `${el.tagName}#${el.id}|${name}|${Math.round(box.top + window.scrollY)}|${Math.round(box.left)}`,
          name,
          ring: !!ringEl,
          ratio,
          bar: inDialog ? 0 : cover('[data-request-bar]'),
          header: inDialog ? 0 : cover('[data-header]'),
          off: box.bottom < 0 || box.top > window.innerHeight || box.width === 0,
          opacity: Math.round(opacity * 100) / 100,
          hoist: !!el.closest('[data-hoist]'),
          isMain: el.id === 'main',
        };
      });
      if (!r) continue;
      if (r.opacity < 0.9 || (r.hoist && c.id === 'desktop')) {
        await wait(r.hoist && c.id === 'desktop' ? 1800 : 600); // a transition, or the stage gliding to that crane
        r = { ...r, ...(await page.evaluate(() => {
          const el = document.activeElement;
          const shown = el.matches('input[type=radio], input[type=checkbox]') ? (el.closest('label') ?? el) : el;
          let o = 1;
          for (let n = shown; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
          if (el.getAttribute('aria-disabled') === 'true') o = 1;
          return { opacity: Math.round(o * 100) / 100 };
        })) };
      }
      // Wrapped around to an element met earlier. A date field's day/month/year segments are consecutive stops on the
      // same element, so only a non-consecutive repeat ends the walk.
      if (seen.has(r.key) && r.key !== lastKey && stops > 5) break;
      const repeat = r.key === lastKey;
      lastKey = r.key;
      seen.add(r.key);
      if (repeat) continue;
      if (r.isMain) continue;
      stops++;
      if (!r.ring) misses.ring.push(r.name);
      if (r.ratio !== null && r.ratio < 3) misses.contrast.push(`${r.name} ${r.ratio}:1`);
      if (r.bar > 0) misses.bar.push(`${r.name} (${r.bar}% covered)`);
      if (r.header > 0) misses.header.push(`${r.name} (${r.header}% covered)`);
      if (r.off) misses.off.push(r.name);
      if (r.opacity < 0.9) misses.faded.push(`${r.name} ${r.opacity}`);
    }
    const fmt = (xs) => `${xs.length}${xs.length ? `: ${xs.slice(0, 10).join(', ')}` : ''}`;
    record('keyboard', `${tag} every tab stop shows a focus ring (${stops} stops)`, misses.ring.length === 0 && stops > 40, fmt(misses.ring));
    record('keyboard', `${tag} focus ring contrast ≥ 3:1 against its ground`, misses.contrast.length === 0, fmt(misses.contrast));
    record('keyboard', `${tag} no focused element under the floating request bar`, misses.bar.length === 0, fmt(misses.bar));
    record('keyboard', `${tag} no focused element under the fixed header`, misses.header.length === 0, fmt(misses.header));
    record('keyboard', `${tag} focused element scrolled into view and fully opaque`, misses.off.length === 0 && misses.faded.length === 0, `off-screen ${fmt(misses.off)} · faded ${fmt(misses.faded)}`);
    record('errors', `${tag} keyboard walk: no console/page errors`, !s.problems.console.length && !s.problems.page.length, errorsOf(s));
  } finally {
    await s.context.close();
  }
}

// ── 4. Without JavaScript the prerendered page is complete ─────────────────
async function noJs(p, width, height) {
  const tag = `${p.id} @${width} no-JS`;
  const kase = { page: p.id, width, mode: 'no-js' };
  const s = await open(p.path, { width, height, touch: width < 1024, js: false });
  try {
    await step(
      'nojs',
      `${tag} hero, Hoist, lineup, comparison, gallery and form present and visible`,
      async () => {
        const m = await s.page.evaluate(() => ({
          h1: (document.querySelector('h1')?.textContent ?? '').trim().length,
          hoist: document.querySelectorAll('[data-hoist-item]').length,
          cards: document.querySelectorAll('[data-testid="crane-card"]').length,
          compareCols: [...document.querySelectorAll('#crane-compare thead th[data-col]')].filter((th) => th.checkVisibility()).length,
          photos: document.querySelectorAll('[data-testid="site-photo"]').length,
          form: !!document.querySelector('[data-testid="request-form"]'),
          bar: !!document.querySelector('[data-request-bar]')?.checkVisibility({ visibilityProperty: true }),
          hidden: [...document.querySelectorAll('[data-reveal], [data-hero-photo] img, [data-load-tag], [data-why-bar]')].filter((e) => {
            const cs = getComputedStyle(e);
            return Number(cs.opacity) < 1 || cs.visibility === 'hidden';
          }).length,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          levels: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => h.checkVisibility({ visibilityProperty: true })).map((h) => Number(h.tagName[1])),
        }));
        const issues = headingIssues(m.levels);
        const pass = m.h1 > 10 && m.hoist === 5 && m.cards === 5 && m.compareCols === 5 && m.photos >= 12 && m.form && m.bar && m.hidden === 0 && m.overflow <= 0 && issues.length === 0;
        return { pass, detail: `${JSON.stringify({ ...m, levels: undefined })} headings: ${issues.join('; ') || 'ok'}` };
      },
      kase,
    );
    await s.page.screenshot({ path: `${SCREENS}${p.id}-${width}-nojs.jpg`, type: 'jpeg', quality: 60 });
  } finally {
    await s.context.close();
  }
}

// ── 5. Head, SEO files ──────────────────────────────────────────────────────
async function seoChecks() {
  for (const p of PAGES) {
    await step('seo', `${p.id} head: lang, title, description, canonical, hreflang, Open Graph, JSON-LD, prerendered`, async () => {
      const res = await fetch(BASE + p.path);
      const html = await res.text();
      const h = parseHead(html);
      const bad = [];
      if (h.lang !== p.lang || h.dir !== p.dir) bad.push(`lang/dir ${h.lang}/${h.dir}`);
      if (h.title.length < 20 || h.title.length > 70) bad.push(`title length ${h.title.length}`);
      const d = h.meta.description ?? '';
      if (d.length < 60 || d.length > 160) bad.push(`description length ${d.length}`);
      if (h.canonical !== SITE + p.path) bad.push(`canonical ${h.canonical}`);
      if (h.meta['og:url'] !== SITE + p.path) bad.push(`og:url ${h.meta['og:url']}`);
      const alt = { ar: `${SITE}/`, en: `${SITE}/en/`, 'x-default': `${SITE}/` };
      for (const [k, v] of Object.entries(alt)) if (h.alternates[k] !== v) bad.push(`hreflang ${k}=${h.alternates[k]}`);
      if (h.meta['og:image'] !== `${SITE}/og-${p.lang}.jpg`) bad.push(`og:image ${h.meta['og:image']}`);
      if (h.meta['og:image:width'] !== '1200' || h.meta['og:image:height'] !== '630') bad.push('og:image size');
      if (h.meta['twitter:card'] !== 'summary_large_image') bad.push('twitter:card');
      if (html.includes('%SITE_URL%')) bad.push('unfilled %SITE_URL%');
      if (html.includes('<!--app-->') || html.includes('<!--head-->')) bad.push('prerender marker left');
      if (!html.includes('data-hero')) bad.push('not prerendered');
      const ld = h.jsonLd[0];
      if (!ld || h.jsonLdErrors.length) bad.push(`JSON-LD ${h.jsonLdErrors.join(', ') || 'missing'}`);
      else {
        const types = [].concat(ld['@type']);
        // Spec §10 (decision E.2): LocalBusiness only once a verified address exists (Google requires one).
        if (!types.includes('Organization') || types.includes('LocalBusiness') !== !!ld.address) bad.push(`@type ${types.join(',')} address=${!!ld.address}`);
        if (ld.email !== EMAIL) bad.push(`email ${ld.email}`);
        if (!Array.isArray(ld.sameAs) || !ld.sameAs.some((u) => /facebook\.com|fb\.com/.test(u))) bad.push('sameAs has no Facebook URL');
        if (ld.url !== `${SITE}/`) bad.push(`url ${ld.url}`);
        if (EASTERN_DIGITS.test(JSON.stringify(ld))) bad.push('Eastern digits in JSON-LD');
      }
      return { pass: res.ok && bad.length === 0, detail: bad.join('; ') };
    });
  }
  await step('seo', 'ar: «رافعة» and «كرين» in the meta tags and in the page text', async () => {
    const html = await (await fetch(`${BASE}/`)).text();
    const h = parseHead(html);
    const metaText = `${h.meta.keywords ?? ''} ${h.meta.description ?? ''}`;
    const body = html.replace(/<head[\s\S]*?<\/head>/i, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');
    const inMeta = ['رافعة', 'كرين'].filter((w) => metaText.includes(w));
    const inBody = ['رافعة', 'كرين'].filter((w) => body.includes(w));
    return { pass: inMeta.length === 2 && inBody.length === 2, detail: `meta: ${inMeta.join(',') || 'none'} · body: ${inBody.join(',') || 'none'}` };
  });
  for (const [file, type] of [
    ['/robots.txt', 'text/plain'],
    ['/sitemap.xml', 'xml'],
    ['/og-ar.jpg', 'image/jpeg'],
    ['/og-en.jpg', 'image/jpeg'],
    ['/brand/badge.png', 'image/png'],
  ]) {
    await step('seo', `${file} is served as ${type}`, async () => {
      const r = await fetch(BASE + file);
      const ct = r.headers.get('content-type') ?? '';
      return { pass: r.ok && ct.includes(type), detail: `${r.status} ${ct}` };
    });
  }
  await step('seo', 'robots.txt points at the sitemap; the sitemap lists both pages', async () => {
    const robots = await (await fetch(`${BASE}/robots.txt`)).text();
    const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
    const ok = robots.includes(`Sitemap: ${SITE}/sitemap.xml`) && sitemap.includes(`<loc>${SITE}/</loc>`) && sitemap.includes(`<loc>${SITE}/en/</loc>`);
    return { pass: ok, detail: ok ? '' : `robots: ${robots.trim().replace(/\n/g, ' / ')}` };
  });
}

// ── 6. Truth gate ───────────────────────────────────────────────────────────
async function truthChecks() {
  for (const p of PAGES) {
    await step('truth', `${p.id} served HTML: [[CONFIRM]] tokens ${TARGET === 'staging' ? 'present (staging)' : 'absent (production)'}`, async () => {
      const html = await (await fetch(BASE + p.path)).text();
      const n = (html.match(/\[\[[A-Z]+[:\]]/g) ?? []).length;
      return { pass: TARGET === 'staging' ? n > 0 : n === 0 && !hasDraftToken(html), detail: `${n} token(s)` };
    });
  }
  if (process.env.QA_PROD_GATE === '0') return;
  await step('truth', 'BUILD_TARGET=production build is refused by the truth gate while facts are unverified', async () => {
    const out = await mkdtemp(path.join(tmpdir(), 'atlas-prod-gate-'));
    const args = ['vite', 'build', '--outDir', out, '--emptyOutDir', '--logLevel', 'error'];
    if (process.env.QA_VITE_CONFIG) args.push('--config', process.env.QA_VITE_CONFIG);
    const r = spawnSync('npx', args, { cwd: ROOT, env: { ...process.env, BUILD_TARGET: 'production' }, encoding: 'utf8', timeout: 240000 });
    const text = `${r.stdout}\n${r.stderr}`;
    const gate = /truth gate|unverified|\[\[CONFIRM/i.test(text);
    const line = text.split('\n').find((l) => /truth|unverified/i.test(l)) ?? text.trim().split('\n')[0];
    return { pass: r.status !== 0 && gate, detail: `exit ${r.status}; ${line?.slice(0, 200)}` };
  });
}

// ── 7. Deploy CSP (vercel.json) ─────────────────────────────────────────────
async function cspChecks() {
  const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const csp = vercel.headers.flatMap((h) => h.headers).find((h) => h.key === 'Content-Security-Policy')?.value;
  if (!csp) return record('csp', 'vercel.json has a Content-Security-Policy', false);
  for (const p of PAGES) {
    const s = await open(p.path, { width: 1440, height: 900, csp });
    try {
      await step('csp', `${p.id} under the vercel.json CSP: inline script runs, motion starts, no violations`, async () => {
        const r = await s.page.evaluate(() => ({ cls: document.documentElement.className, motion: document.documentElement.dataset.motion ?? null, violations: window.__csp }));
        const pass = /\bjs\b/.test(r.cls) && /\bmotion-ok\b/.test(r.cls) && r.motion === 'desktop' && r.violations.length === 0;
        return { pass, detail: `class="${r.cls}" data-motion=${r.motion} violations: ${r.violations.join(' | ') || 'none'}` };
      });
    } finally {
      await s.context.close();
    }
  }
}

// ── Run ─────────────────────────────────────────────────────────────────────
const started = Date.now();
try {
  if (want('seo')) await seoChecks();
  if (want('truth')) await truthChecks();
  if (want('csp')) await cspChecks();
  if (want('matrix')) {
    const cases = PAGES.filter((p) => !PAGES_ONLY.length || PAGES_ONLY.includes(p.id)).flatMap((p) =>
      VIEWPORTS.filter((vp) => !WIDTHS_ONLY.length || WIDTHS_ONLY.includes(vp.width)).flatMap((vp) => MODES.map((mode) => ({ p, vp, mode }))),
    );
    await pool(cases, CONCURRENCY, ({ p, vp, mode }) => matrixCase(p, vp, mode));
  }
  if (want('nojs')) for (const p of PAGES.filter((x) => !PAGES_ONLY.length || PAGES_ONLY.includes(x.id))) for (const [w, h] of [[390, 844], [1440, 900]]) await noJs(p, w, h);
  const pagesWanted = PAGES.filter((p) => !PAGES_ONLY.length || PAGES_ONLY.includes(p.id));
  const controlsWanted = CONTROL_CASES.filter((c) => !process.env.QA_CONTROLS || process.env.QA_CONTROLS.split(',').includes(c.id));
  if (want('controls')) for (const p of pagesWanted) for (const c of controlsWanted) await controlsFor(p, c);
  if (want('keyboard'))
    for (const p of pagesWanted)
      for (const c of [
        { id: 'desktop', width: 1440, height: 900, touch: false, reduced: false },
        { id: 'desktop', width: 1366, height: 657, touch: false, reduced: false },
        { id: 'touch', width: 390, height: 844, touch: true, reduced: false },
      ])
        await keyboardWalk(p, c);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.pass);
const meta = {
  date: new Date().toISOString(),
  base: BASE,
  site: SITE,
  target: TARGET,
  profile: `WhatsApp ${PROFILE.whatsapp ? 'configured' : 'mailto fallback'}, phone ${PROFILE.phone ? 'configured' : 'none'}, form ${FORM_STUB ? `endpoint ${FORM_STUB} (stubbed)` : 'hand-off'}${ONLY.length ? `, sections ${ONLY.join(',')}` : ''}`,
  seconds: Math.round((Date.now() - started) / 1000),
};
await writeFile(`${OUT}results.json`, JSON.stringify({ ...meta, total: results.length, failed: failed.length, results }, null, 2));
await writeFile(`${OUT}summary.md`, summarize(results, meta));
console.log(`\n${results.length - failed.length}/${results.length} checks passed in ${meta.seconds}s. See qa/reports/summary.md`);
process.exit(failed.length ? 1 : 0);

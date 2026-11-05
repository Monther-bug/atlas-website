// Lighthouse medians and performance budgets (spec §1, §9). For each page (LH_PATHS, default the two
// home pages and the GMK6350 crane page in both languages) it runs mobile and desktop, for a first
// visit and a repeat visit, LH_RUNS times each (default 3), with a fresh Chrome per run, and takes
// the median of each metric.
//   first:  a fresh profile, as Lighthouse always loads: the first-visit loader shows.
//   repeat: the same tab loads the page once, then Lighthouse loads it again without clearing
//           storage: the loader was seen this session (it does not show) and the HTTP cache is warm.
// It adds one applied-throttling Slow 4G run of each Arabic page (first visit, informational) and the
// bundle budget. Writes qa/reports/lighthouse.json and lighthouse.md. Exit 1 if any budget fails.
// Usage (preview running): npm run lighthouse [-- baseUrl]. LH_VISITS=first|repeat|first,repeat.
// LH_PATHS=/cranes/gmk6350/,/en/cranes/gmk6350/ (comma list of paths) measures only those pages.
import { mkdir, writeFile } from 'node:fs/promises';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer-core';
import { measureBundle } from './bundle-budget.mjs';
import { BUDGETS, checkBudgets, firstSnippet, lhPages, medianResult, toMarkdown } from './lib/budgets.mjs';

const BASE = (process.argv[2] ?? process.env.QA_BASE ?? 'http://localhost:4173').replace(/\/$/, '');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RUNS = Number(process.env.LH_RUNS ?? 3);
const OUT = new URL('./reports/', import.meta.url).pathname;
const PAGES = lhPages(process.env.LH_PATHS);
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const VISITS = (process.env.LH_VISITS ?? 'first,repeat').split(',').filter((v) => v === 'first' || v === 'repeat');

// Presets from Lighthouse itself; the built-in copy is used only if that import fails (E.4 Step 3).
const constants = await import('lighthouse/core/config/constants.js').catch(() => null);
const SLOW_4G = constants?.throttling?.mobileSlow4G ?? {
  rttMs: 150,
  throughputKbps: 1638.4,
  requestLatencyMs: 562.5,
  downloadThroughputKbps: 1474.56,
  uploadThroughputKbps: 675,
  cpuSlowdownMultiplier: 4,
};
const DESKTOP_THROTTLING = constants?.throttling?.desktopDense4G ?? {
  rttMs: 40,
  throughputKbps: 10240,
  cpuSlowdownMultiplier: 1,
  requestLatencyMs: 0,
  downloadThroughputKbps: 0,
  uploadThroughputKbps: 0,
};
const DESKTOP_SCREEN = constants?.screenEmulationMetrics?.desktop ?? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false };
const DESKTOP_UA =
  constants?.userAgents?.desktop ??
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
console.log(`Throttling presets: ${constants ? 'from Lighthouse' : 'built-in copy'}`);

const CONFIGS = {
  mobile: { extends: 'lighthouse:default' }, // Lighthouse default: mobile, simulated Slow 4G
  desktop: {
    extends: 'lighthouse:default',
    settings: { formFactor: 'desktop', throttling: DESKTOP_THROTTLING, screenEmulation: DESKTOP_SCREEN, emulatedUserAgent: DESKTOP_UA },
  },
  slow4g: { extends: 'lighthouse:default', settings: { throttlingMethod: 'devtools', throttling: SLOW_4G } },
};

function pick(lhr) {
  const score = (id) => (lhr.categories[id]?.score == null ? NaN : Math.round(lhr.categories[id].score * 100));
  const num = (id) => lhr.audits[id]?.numericValue ?? NaN;
  const failing = [];
  for (const cat of Object.values(lhr.categories)) {
    for (const ref of cat.auditRefs) {
      const a = lhr.audits[ref.id];
      if (ref.weight > 0 && a && a.score !== null && a.score < 0.9) failing.push(`${cat.id}: ${a.id} (${a.score}) ${a.displayValue ?? ''}`.trim());
    }
  }
  return {
    performance: score('performance'),
    accessibility: score('accessibility'),
    bestPractices: score('best-practices'),
    seo: score('seo'),
    lcp: num('largest-contentful-paint'),
    cls: num('cumulative-layout-shift'),
    tbt: num('total-blocking-time'),
    fcp: num('first-contentful-paint'),
    si: num('speed-index'),
    // Lighthouse 13 moved the LCP element from 'largest-contentful-paint-element' into the LCP breakdown insight.
    lcpElement: firstSnippet(lhr.audits['largest-contentful-paint-element']?.details ?? lhr.audits['lcp-breakdown-insight']?.details),
    failing,
    runtimeError: lhr.runtimeError?.message ?? null,
    version: lhr.lighthouseVersion,
  };
}

async function runOnce(url, config, visit = 'first') {
  const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: ['--headless=new', '--no-first-run', '--no-default-browser-check'] });
  let browser = null;
  try {
    const flags = { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: CATEGORIES };
    let page;
    if (visit === 'repeat') {
      // The visit before: same tab, so sessionStorage (the loader's once-per-session flag) and the HTTP cache carry over.
      browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}`, defaultViewport: null });
      page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      await new Promise((r) => setTimeout(r, 1500));
      flags.disableStorageReset = true;
    }
    const result = await lighthouse(url, flags, config, page);
    if (!result) throw new Error('Lighthouse returned no result');
    return pick(result.lhr);
  } finally {
    await browser?.disconnect().catch(() => {});
    await chrome.kill();
  }
}

const ping = await fetch(`${BASE}/`).catch(() => null);
if (!ping?.ok) {
  console.error(`Cannot reach ${BASE}/. Build, then start the preview: npx vite preview --port 4173`);
  process.exit(2);
}
await mkdir(OUT, { recursive: true });

console.log('Bundle budget…');
const bundle = await measureBundle({ base: BASE, chrome: CHROME });
console.table(bundle.rows);

const configs = [];
for (const p of PAGES) {
  for (const formFactor of ['mobile', 'desktop']) {
    for (const visit of VISITS) {
      const runs = [];
      for (let i = 1; i <= RUNS; i++) {
        process.stdout.write(`${p.id} ${formFactor} ${visit} run ${i}/${RUNS}… `);
        try {
          const r = await runOnce(BASE + p.path, CONFIGS[formFactor], visit);
          runs.push(r);
          console.log(`perf ${r.performance} a11y ${r.accessibility} bp ${r.bestPractices} seo ${r.seo} LCP ${Math.round(r.lcp)} ms CLS ${r.cls.toFixed(3)} TBT ${Math.round(r.tbt)} ms`);
        } catch (e) {
          runs.push({ error: e instanceof Error ? e.message : String(e) });
          console.log(`ERROR ${e instanceof Error ? e.message : e}`);
        }
      }
      const med = medianResult(runs);
      configs.push({
        page: p.id,
        formFactor,
        visit,
        runs,
        median: med,
        checks: checkBudgets(med, BUDGETS),
        lcpElement: runs.find((r) => r.lcpElement)?.lcpElement ?? null,
        failingAudits: [...new Set(runs.flatMap((r) => r.failing ?? []))],
      });
    }
  }
}

const slow4g = [];
for (const p of PAGES.filter((x) => x.lang === 'ar')) {
  try {
    process.stdout.write(`${p.id} mobile Slow 4G (applied throttling)… `);
    const r = await runOnce(BASE + p.path, CONFIGS.slow4g);
    slow4g.push({ page: p.id, result: r, checks: checkBudgets(r, BUDGETS) });
    console.log(`perf ${r.performance} LCP ${Math.round(r.lcp)} ms`);
  } catch (e) {
    slow4g.push({ page: p.id, error: e instanceof Error ? e.message : String(e) });
    console.log('ERROR');
  }
}

const report = { date: new Date().toISOString(), base: BASE, runsPerConfig: RUNS, budgets: BUDGETS, configs, slow4g, bundle };
await writeFile(`${OUT}lighthouse.json`, JSON.stringify(report, null, 2));
await writeFile(`${OUT}lighthouse.md`, toMarkdown(report));

const failed = [
  ...configs.flatMap((c) => c.checks.filter((x) => !x.pass).map((x) => `${c.page} ${c.formFactor} ${c.visit} ${x.metric}=${x.value}`)),
  ...bundle.rows.filter((r) => !r.pass).map((r) => `bundle ${r.metric}=${r.value} KB`),
];
console.log(failed.length ? `\nFAIL: ${failed.join(', ')}` : '\nAll budgets met.');
console.log('Report: qa/reports/lighthouse.md');
process.exit(failed.length ? 1 : 0);

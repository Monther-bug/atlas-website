// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { BUDGETS, assetRefs, checkBudgets, checkBundle, checkCraneLoad, checkPageBundles, firstSnippet, lhPages, median, medianResult, pagePath, toMarkdown } from './budgets.mjs';

const GOOD = { performance: 95, accessibility: 100, bestPractices: 100, seo: 100, lcp: 1800, cls: 0.01, tbt: 90 };

describe('median', () => {
  it('takes the middle of an odd list', () => expect(median([3, 1, 2])).toBe(2));
  it('averages the middle pair of an even list', () => expect(median([4, 1, 3, 2])).toBe(2.5));
  it('ignores runs that produced no number', () => expect(median([NaN, 5, undefined, 7])).toBe(6));
  it('is NaN when nothing is left', () => expect(median([])).toBeNaN());
  it('does not reorder the input', () => {
    const xs = [3, 1, 2];
    median(xs);
    expect(xs).toEqual([3, 1, 2]);
  });
});

describe('checkBudgets', () => {
  it('passes a result inside every budget', () => expect(checkBudgets(GOOD, BUDGETS).every((c) => c.pass)).toBe(true));
  it('treats the limits as inclusive', () => {
    const edge = { performance: 90, accessibility: 100, bestPractices: 100, seo: 100, lcp: 2000, cls: 0.05, tbt: 150 };
    expect(checkBudgets(edge, BUDGETS).every((c) => c.pass)).toBe(true);
  });
  it('holds accessibility, best practices and SEO at 100 (Q.1 brief), performance at 90', () => {
    const bad = checkBudgets({ ...GOOD, accessibility: 98, bestPractices: 96, seo: 92 }, BUDGETS)
      .filter((c) => !c.pass)
      .map((c) => c.metric);
    expect(bad).toEqual(['accessibility', 'bestPractices', 'seo']);
  });
  it('fails each metric that is over its budget', () => {
    const bad = checkBudgets({ ...GOOD, performance: 89, lcp: 2001, cls: 0.06, tbt: 151 }, BUDGETS)
      .filter((c) => !c.pass)
      .map((c) => c.metric);
    expect(bad).toEqual(['performance', 'lcp', 'cls', 'tbt']);
  });
  it('fails a missing value instead of passing it', () => {
    expect(checkBudgets({ ...GOOD, seo: NaN }, BUDGETS).find((c) => c.metric === 'seo')?.pass).toBe(false);
  });
});

describe('medianResult', () => {
  it('takes the median of each metric separately', () => {
    const runs = [
      { ...GOOD, performance: 90, lcp: 2100 },
      { ...GOOD, performance: 99, lcp: 1500 },
      { ...GOOD, performance: 95, lcp: 1800 },
    ];
    const m = medianResult(runs);
    expect([m.performance, m.lcp]).toEqual([95, 1800]);
  });
  it('skips a run that errored', () => expect(medianResult([{ error: 'x' }, GOOD]).performance).toBe(95));
});

describe('assetRefs', () => {
  it('finds the entry script, module preloads and stylesheets', () => {
    const html =
      '<script type="module" crossorigin src="/assets/index-a1.js"></script>' +
      '<link rel="modulepreload" crossorigin href="/assets/react-b2.js">' +
      '<link rel="stylesheet" crossorigin href="/assets/index-c3.css">' +
      '<link rel="preload" as="font" href="/assets/kufi.woff2" crossorigin>' +
      '<script src="/legacy.js"></script>';
    expect(assetRefs(html)).toEqual({ js: ['/assets/index-a1.js', '/assets/react-b2.js'], css: ['/assets/index-c3.css'] });
  });
});

describe('checkBundle', () => {
  it('compares each measure with its budget in KB', () => {
    const rows = checkBundle({ initialJsKB: 109.9, cssKB: 25.1, firstLoadKB: 850, heroMobileKB: 64, heroDesktopKB: 77 });
    expect(rows.map((r) => [r.metric, r.pass])).toEqual([
      ['initial JS (gzip)', true],
      ['CSS (gzip)', false],
      ['first load, AR mobile', true],
      ['hero image, mobile', true],
      ['hero image, desktop', true],
    ]);
  });
  it('fails a measure that could not be taken', () => {
    expect(checkBundle({ initialJsKB: NaN, cssKB: 1, firstLoadKB: 1, heroMobileKB: 1, heroDesktopKB: 1 })[0].pass).toBe(false);
  });
});

describe('pagePath', () => {
  it('maps a built HTML file to the address it is served at', () => {
    expect(pagePath('index.html')).toBe('/');
    expect(pagePath('en/index.html')).toBe('/en/');
    expect(pagePath('cranes/gmk6350/index.html')).toBe('/cranes/gmk6350/');
    expect(pagePath('en\\cranes\\rt700e\\index.html')).toBe('/en/cranes/rt700e/');
  });
});

describe('lhPages', () => {
  it('defaults to the two home pages and the GMK6350 crane page in both languages', () => {
    expect(lhPages(undefined)).toEqual([
      { id: 'ar', path: '/', lang: 'ar' },
      { id: 'en', path: '/en/', lang: 'en' },
      { id: 'ar-gmk6350', path: '/cranes/gmk6350/', lang: 'ar' },
      { id: 'en-gmk6350', path: '/en/cranes/gmk6350/', lang: 'en' },
    ]);
  });
  it('reads a comma list, adding the slashes a path lacks, without duplicates', () => {
    expect(lhPages(' /cranes/rt700e, en/cranes/rt700e/ ,/cranes/rt700e/')).toEqual([
      { id: 'ar-rt700e', path: '/cranes/rt700e/', lang: 'ar' },
      { id: 'en-rt700e', path: '/en/cranes/rt700e/', lang: 'en' },
    ]);
  });
});

describe('checkPageBundles', () => {
  it('holds every page to the initial JS and CSS budgets', () => {
    const rows = checkPageBundles([
      { page: '/en/', initialJsKB: 101, cssKB: 15 },
      { page: '/cranes/gmk6350/', initialJsKB: 110.04, cssKB: 25.2 },
    ]);
    expect(rows.map((r) => [r.metric, r.value, r.pass])).toEqual([
      ['initial JS (gzip), /en/', 101, true],
      ['CSS (gzip), /en/', 15, true],
      ['initial JS (gzip), /cranes/gmk6350/', 110, false],
      ['CSS (gzip), /cranes/gmk6350/', 25.2, false],
    ]);
  });
  it('fails a page whose files could not be measured', () => expect(checkPageBundles([{ page: '/x/', initialJsKB: NaN, cssKB: 1 }])[0].pass).toBe(false));
});

describe('checkCraneLoad', () => {
  it('holds a crane page to the first-load and hero image budgets', () => {
    const rows = checkCraneLoad({ page: '/cranes/gmk6350/', firstLoadKB: 420, heroMobileKB: 81, heroDesktopKB: 99 });
    expect(rows.map((r) => [r.metric, r.pass])).toEqual([
      ['first load, mobile, /cranes/gmk6350/', true],
      ['hero image, mobile, /cranes/gmk6350/', false],
      ['hero image, desktop, /cranes/gmk6350/', true],
    ]);
  });
});

describe('firstSnippet', () => {
  it('finds the LCP element snippet however deeply Lighthouse nests it', () => {
    const details = { type: 'list', items: [{ type: 'table', items: [{ node: { type: 'node', snippet: '<img src="/img/6398.avif">' } }] }] };
    expect(firstSnippet(details)).toBe('<img src="/img/6398.avif">');
  });
  it('returns null when there is none', () => expect(firstSnippet({ items: [] })).toBeNull());
});

describe('toMarkdown', () => {
  it('writes a PASS/FAIL row per configuration, the bundle table and the diagnostics', () => {
    const report = {
      date: '2026-11-13T10:00:00.000Z',
      base: 'http://localhost:4173',
      runsPerConfig: 3,
      budgets: BUDGETS,
      configs: [
        { page: 'ar', formFactor: 'mobile', runs: [GOOD], median: GOOD, checks: checkBudgets(GOOD, BUDGETS), lcpElement: '<img>', failingAudits: [] },
        {
          page: 'en',
          formFactor: 'mobile',
          visit: 'repeat',
          runs: [GOOD],
          median: { ...GOOD, lcp: 2400 },
          checks: checkBudgets({ ...GOOD, lcp: 2400 }, BUDGETS),
          lcpElement: null,
          failingAudits: ['performance: largest-contentful-paint (0.6) 2.4 s'],
        },
      ],
      slow4g: [{ page: 'ar', result: GOOD, checks: checkBudgets(GOOD, BUDGETS) }],
      bundle: { rows: checkBundle({ initialJsKB: 100, cssKB: 20, firstLoadKB: 800, heroMobileKB: 60, heroDesktopKB: 90 }) },
    };
    const md = toMarkdown(report);
    expect(md).toContain('| ar | mobile | first | 95 | 100 | 100 | 100 | 1800 | 0.010 | 90 | PASS |');
    expect(md).toContain('| en | mobile | repeat | 95 | 100 | 100 | 100 | 2400 | 0.010 | 90 | FAIL (lcp) |');
    expect(md).toContain('| first load, AR mobile | 800.0 | ≤ 1000 KB | PASS |');
    expect(md).toContain('  - performance: largest-contentful-paint (0.6) 2.4 s');
  });
});

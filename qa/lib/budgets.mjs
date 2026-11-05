// Pure helpers for qa/lighthouse.mjs and qa/bundle-budget.mjs (tested in budgets.test.mjs).

/**
 * Spec §1 and §9 (E.4: every score ≥ 90), tightened by the Q.1 brief: performance ≥ 90, accessibility, best
 * practices and SEO 100. Scores are 0–100.
 */
export const BUDGETS = {
  minScores: { performance: 90, accessibility: 100, bestPractices: 100, seo: 100 },
  maxLcpMs: 2000,
  maxCls: 0.05,
  maxTbtMs: 150,
};
/** Spec §9, in KB of 1,000 bytes. JS = what the page loads up front (the Hoist chunk is lazy). */
export const BUNDLE_LIMITS = { initialJsKB: 110, cssKB: 25, firstLoadKB: 1000, heroMobileKB: 80, heroDesktopKB: 120 };

const SCORE_KEYS = ['performance', 'accessibility', 'bestPractices', 'seo'];
const finite = (v) => typeof v === 'number' && Number.isFinite(v);

/** Median of the finite numbers; NaN when there are none. Does not mutate the input. */
export function median(nums) {
  const xs = nums.filter(finite).sort((a, b) => a - b);
  if (!xs.length) return NaN;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
}

/** Median of each metric across runs, taken separately. */
export function medianResult(runs) {
  const keys = [...SCORE_KEYS, 'lcp', 'cls', 'tbt', 'fcp', 'si'];
  return Object.fromEntries(keys.map((k) => [k, median(runs.map((r) => r[k]))]));
}

/** One row per budget. A missing value fails. Limits are inclusive. */
export function checkBudgets(result, budgets = BUDGETS) {
  const rows = SCORE_KEYS.map((k) => ({
    metric: k,
    value: result[k],
    limit: `≥ ${budgets.minScores[k]}`,
    pass: finite(result[k]) && result[k] >= budgets.minScores[k],
  }));
  rows.push({ metric: 'lcp', value: result.lcp, limit: `≤ ${budgets.maxLcpMs} ms`, pass: finite(result.lcp) && result.lcp <= budgets.maxLcpMs });
  rows.push({ metric: 'cls', value: result.cls, limit: `≤ ${budgets.maxCls}`, pass: finite(result.cls) && result.cls <= budgets.maxCls });
  rows.push({ metric: 'tbt', value: result.tbt, limit: `≤ ${budgets.maxTbtMs} ms`, pass: finite(result.tbt) && result.tbt <= budgets.maxTbtMs });
  return rows;
}

/** Up-front assets referenced by a built HTML page: module entry + modulepreloads, stylesheets. */
export function assetRefs(html) {
  const js = [];
  const css = [];
  for (const m of html.matchAll(/<script\b[^>]*>/g)) {
    const src = m[0].match(/\bsrc="([^"]+)"/)?.[1];
    if (src && /\btype="module"/.test(m[0]) && !js.includes(src)) js.push(src);
  }
  for (const m of html.matchAll(/<link\b[^>]*>/g)) {
    const href = m[0].match(/\bhref="([^"]+)"/)?.[1];
    if (!href) continue;
    if (/\brel="modulepreload"/.test(m[0]) && !js.includes(href)) js.push(href);
    else if (/\brel="stylesheet"/.test(m[0]) && !css.includes(href)) css.push(href);
  }
  return { js, css };
}

const round1 = (v) => (finite(v) ? Math.round(v * 10) / 10 : NaN);

export function checkBundle(m, limits = BUNDLE_LIMITS) {
  const row = (metric, value, limit) => ({ metric, value: round1(value), limit: `≤ ${limit} KB`, pass: finite(value) && value <= limit });
  return [
    row('initial JS (gzip)', m.initialJsKB, limits.initialJsKB),
    row('CSS (gzip)', m.cssKB, limits.cssKB),
    row('first load, AR mobile', m.firstLoadKB, limits.firstLoadKB),
    row('hero image, mobile', m.heroMobileKB, limits.heroMobileKB),
    row('hero image, desktop', m.heroDesktopKB, limits.heroDesktopKB),
  ];
}

/** First `snippet` string anywhere inside a Lighthouse details object (LCP element). */
export function firstSnippet(node) {
  if (!node || typeof node !== 'object') return null;
  if (typeof node.snippet === 'string') return node.snippet;
  for (const value of Object.values(node)) {
    const found = firstSnippet(value);
    if (found) return found;
  }
  return null;
}

const fmt = (v, digits = 0) => (finite(v) ? v.toFixed(digits) : 'n/a');

export function toMarkdown(r) {
  const out = [
    '# Lighthouse and budget report',
    '',
    `- Date: ${r.date}`,
    `- Base URL: ${r.base}`,
    `- Runs per configuration: ${r.runsPerConfig} (median of each metric, taken separately)`,
    `- Budgets: performance ≥ ${r.budgets.minScores.performance}, accessibility ≥ ${r.budgets.minScores.accessibility}, best practices ≥ ${r.budgets.minScores.bestPractices}, SEO ≥ ${r.budgets.minScores.seo}; LCP ≤ ${r.budgets.maxLcpMs} ms; CLS ≤ ${r.budgets.maxCls}; TBT ≤ ${r.budgets.maxTbtMs} ms`,
    '- Visits: "first" = a fresh profile (the first-visit loader shows); "repeat" = the same tab again (loader seen this session, warm HTTP cache)',
    '- Sizes: KB = 1,000 bytes; text files measured as gzip -9 of the built file',
    '',
    '## Medians',
    '',
    '| Page | Form factor | Visit | Perf | A11y | BP | SEO | LCP (ms) | CLS | TBT (ms) | Result |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
  ];
  for (const c of r.configs) {
    const m = c.median;
    const bad = c.checks.filter((x) => !x.pass).map((x) => x.metric);
    out.push(
      `| ${c.page} | ${c.formFactor} | ${c.visit ?? 'first'} | ${fmt(m.performance)} | ${fmt(m.accessibility)} | ${fmt(m.bestPractices)} | ${fmt(m.seo)} | ${fmt(m.lcp)} | ${fmt(m.cls, 3)} | ${fmt(m.tbt)} | ${bad.length ? `FAIL (${bad.join(', ')})` : 'PASS'} |`,
    );
  }
  out.push('', '## Slow 4G, applied throttling (1 run, informational)', '', '| Page | Perf | LCP (ms) | CLS | TBT (ms) | FCP (ms) |', '|---|---|---|---|---|---|');
  for (const s of r.slow4g) {
    out.push(
      s.error
        ? `| ${s.page} | error: ${s.error} | | | | |`
        : `| ${s.page} | ${fmt(s.result.performance)} | ${fmt(s.result.lcp)} | ${fmt(s.result.cls, 3)} | ${fmt(s.result.tbt)} | ${fmt(s.result.fcp)} |`,
    );
  }
  out.push('', '## Bundle budget', '', '| Measure | Value (KB) | Budget | Result |', '|---|---|---|---|');
  for (const b of r.bundle.rows) out.push(`| ${b.metric} | ${fmt(b.value, 1)} | ${b.limit} | ${b.pass ? 'PASS' : 'FAIL'} |`);
  out.push('', '## Diagnostics', '');
  for (const c of r.configs) {
    out.push(`### ${c.page} ${c.formFactor} ${c.visit ?? 'first'}`, '', `- LCP element: ${c.lcpElement ? '`' + c.lcpElement.replace(/`/g, "'") + '`' : 'n/a'}`);
    const errors = c.runs.filter((x) => x.error || x.runtimeError).map((x) => x.error ?? x.runtimeError);
    if (errors.length) out.push(`- Run errors: ${errors.join(' | ')}`);
    if (c.failingAudits.length) out.push('- Audits below 0.9:', ...c.failingAudits.map((a) => `  - ${a}`));
    else out.push('- Audits below 0.9: none');
    out.push('');
  }
  return out.join('\n') + '\n';
}

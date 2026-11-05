// Pure helpers for qa/run-qa.mjs (tested in checks.test.mjs). No browser, no I/O.

/** The cranes on the page (src/content/cranes.ts, capacities as the site shows them). If that file changes, update this. */
export const CRANES = {
  rt700e: { model: 'RT700E', type: 'rough-terrain', t: 55 },
  'atf60-3': { model: 'ATF 60-3', type: 'all-terrain', t: 60 },
  'ac200-1': { model: 'AC200-1', type: 'all-terrain', t: 200 },
  quy250: { model: 'QUY250', type: 'crawler', t: 250 },
  gmk6350: { model: 'GMK6350', type: 'all-terrain', t: 317.5 },
};

/** Filter values (C9, src/sections/crane-filters.ts): 'all' | type | 'band:0-60' | 'band:61-200' | 'band:201+'. */
export function matchesFilter(value, crane) {
  if (value === 'all') return true;
  if (value === 'band:0-60') return crane.t <= 60;
  if (value === 'band:61-200') return crane.t > 60 && crane.t <= 200;
  if (value === 'band:201+') return crane.t > 200;
  if (value === 'rough-terrain' || value === 'all-terrain' || value === 'crawler') return crane.type === value;
  return false;
}

/** Crane ids that should stay visible for a filter, given the ids shown under "all" (sorted). */
export function expectedForFilter(allIds, value) {
  return allIds.filter((id) => value === 'all' || (CRANES[id] !== undefined && matchesFilter(value, CRANES[id]))).sort();
}

/** Crane ids whose maximum rating is at least `tonnes` (the load check's honest test, src/sections/crane-list/load.ts). */
export function expectedForLoad(allIds, tonnes) {
  return allIds.filter((id) => CRANES[id] !== undefined && CRANES[id].t >= tonnes).sort();
}

/** Compare model codes regardless of spaces, no-break spaces, bidi marks/isolates and case. */
export function normModel(s) {
  return String(s ?? '')
    .normalize('NFKC')
    .replace(/[\s ‎‏⁦-⁩]/g, '')
    .toUpperCase();
}

/** URL-decoded href (wa.me or mailto); '+' counts as a space. */
export function decodedHref(href) {
  if (!href) return '';
  try {
    return decodeURIComponent(String(href).replace(/\+/g, ' '));
  } catch {
    return String(href);
  }
}

/** True when an href is fully encoded: printable ASCII only, no spaces, no raw Arabic. */
export function isEncodedHref(href) {
  return typeof href === 'string' && /^[\x21-\x7e]+$/.test(href);
}

/** '6398' from '/img/6398-desktop_16x9-1920.<hash>.avif' (C6 URL scheme). */
export function photoIdFromUrl(s) {
  return String(s ?? '').match(/\/img\/(\d{4})-/)?.[1] ?? null;
}

export const nextKey = (dir) => (dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
export const prevKey = (dir) => (dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft');

/** The html[data-motion] value core.ts should set (C10: desktop = ≥ 64rem with a fine pointer). */
export function expectedMotion({ width, touch, reduced }) {
  if (reduced) return 'reduced';
  return width >= 1024 && !touch ? 'desktop' : 'touch';
}

/** Arabic-Indic (U+0660–0669) and Extended/Persian (U+06F0–06F9) digits. */
export const EASTERN_DIGITS = /[٠-٩۰-۹]/;

/** '٣٥٫٥' → '35.5' (the same mapping as src/lib/digits.ts toAsciiDigits). */
export function toWestern(s) {
  return String(s ?? '')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, '.')
    .replace(/٬/g, '');
}

/** True when a staging token is left in the text: [[CONFIRM]], [[CONFIRM: …]], [[CAPACITY:…]] and the like. */
export const hasDraftToken = (s) => /\[\[[A-Z]+[:\]]/.test(String(s ?? ''));

/**
 * Problems in a page's heading outline, given its heading levels in document order: exactly one h1, the h1 first,
 * and no level skipped on the way down (h2 → h4). Going back up any number of levels is fine.
 */
export function headingIssues(levels) {
  const issues = [];
  const h1 = levels.filter((l) => l === 1).length;
  if (h1 !== 1) issues.push(`${h1} h1`);
  if (levels.length && levels[0] !== 1) issues.push(`first heading is h${levels[0]}`);
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) issues.push(`h${levels[i - 1]} → h${levels[i]} (#${i + 1})`);
  }
  return issues;
}

/** Area of the intersection of two rects ({left, top, right, bottom}), 0 when they do not overlap. */
export function overlapArea(a, b) {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

/** Share (0–1) of rect `a` covered by rect `b`. */
export function coveredShare(a, b) {
  const area = Math.max(0, a.right - a.left) * Math.max(0, a.bottom - a.top);
  return area > 0 ? overlapArea(a, b) / area : 0;
}

/**
 * Targets below the size floor (PRODUCT.md: 44 px). Targets inside a sentence are exempt (WCAG 2.5.8's inline
 * exception), and so are targets that do not render. Each target: { name, width, height, inline }.
 */
export function smallTargets(targets, min = 44) {
  return targets.filter((t) => !t.inline && t.width > 0 && t.height > 0 && (t.width < min - 0.5 || t.height < min - 0.5));
}

/**
 * Cumulative Layout Shift as Core Web Vitals defines it: the largest session window (shifts less than 1 s apart, a
 * window at most 5 s long). Entries: { value, startTime, hadRecentInput }; shifts after recent input do not count.
 */
export function sessionCls(entries) {
  let max = 0;
  let current = 0;
  let first = 0;
  let last = 0;
  for (const e of [...entries].filter((x) => !x.hadRecentInput).sort((a, b) => a.startTime - b.startTime)) {
    if (current > 0 && e.startTime - last < 1000 && e.startTime - first < 5000) {
      current += e.value;
    } else {
      current = e.value;
      first = e.startTime;
    }
    last = e.startTime;
    max = Math.max(max, current);
  }
  return Math.round(max * 10000) / 10000;
}

/** Index of the snap point nearest to `progress` and its distance (the Hoist stage's resting points). */
export function nearestSnap(snaps, progress) {
  let best = -1;
  let distance = Infinity;
  snaps.forEach((s, i) => {
    const d = Math.abs(s - progress);
    if (d < distance) {
      distance = d;
      best = i;
    }
  });
  return { index: best, distance };
}

/** One readable tag per QA case, e.g. "ar @390 touch". */
export const caseTag = ({ page, width, mode }) => `${page} @${width} ${mode}`;

// ── Crane pages (/cranes/<id>/, /en/cranes/<id>/; scripts/prerender.mjs, src/content/crane-pages.ts) ──────────────────

const LANGS = { ar: { dir: 'rtl', home: '/' }, en: { dir: 'ltr', home: '/en/' } };

/** '/cranes/gmk6350/' or '/en/cranes/gmk6350/' (the same rule as cranePath in src/content/crane-pages.ts). */
export const cranePagePath = (id, lang) => `${lang === 'en' ? '/en' : ''}/cranes/${id}/`;

/** One page per visible crane and language (Arabic first, lineup order), with its language twin and its home page. */
export function cranePages(ids = Object.keys(CRANES)) {
  return ['ar', 'en'].flatMap((lang) => {
    const other = lang === 'ar' ? 'en' : 'ar';
    return ids
      .filter((id) => CRANES[id] !== undefined)
      .map((id) => ({
        id: `${lang}-${id}`,
        crane: id,
        path: cranePagePath(id, lang),
        lang,
        dir: LANGS[lang].dir,
        other: cranePagePath(id, other),
        otherLang: other,
        home: LANGS[lang].home,
      }));
  });
}

/** The crane a path is about, or null (hidden cranes such as CKE2500 have no page). */
export function craneIdFromPath(pathname) {
  const id = /^(?:\/en)?\/cranes\/([a-z0-9-]+)\/?(?:index\.html)?$/.exec(String(pathname ?? ''))?.[1] ?? null;
  return id !== null && CRANES[id] !== undefined ? id : null;
}

/** The four other cranes a page's rail links to, in the lineup order. */
export const otherCranes = (id) => Object.keys(CRANES).filter((k) => k !== id);

/** Where an href on `fromPath` leads on this site: { path, search, hash } (hash without '#'), or null when it leaves. */
export function linkTarget(href, fromPath) {
  const base = new URL(fromPath, 'http://qa.local');
  let url;
  try {
    url = new URL(href, base);
  } catch {
    return null;
  }
  if (url.origin !== base.origin) return null;
  return { path: url.pathname, search: url.search, hash: decodeURIComponent(url.hash.replace(/^#/, '')) };
}

/**
 * Specification values that are not values: empty cells, dash placeholders, "n/a"/"not stated"/"unknown" and
 * estimates (~, ≈, approx.). The crane pages omit a row the source lacks instead (truth floor, spec §16.17).
 */
export function badSpecValues(values) {
  return values.filter((v) => {
    const s = String(v ?? '').trim();
    return !s || /^[—–-]+$/.test(s) || /[~≈]/.test(s) || /\b(n\/a|tbd|tba|approx|unknown|not stated)\b/i.test(s) || /غير (متوفر|معروف|محدد|مذكور)/.test(s);
  });
}

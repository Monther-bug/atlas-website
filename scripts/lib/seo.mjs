// SEO helpers shared by the Vite site-url plugin (vite/site-url.ts) and scripts/prerender.mjs.
export const DEFAULT_SITE_URL = 'http://localhost:4173';

/** Both pages. x-default points at the Arabic root (spec §10). */
export const PAGES = [
  { lang: 'ar', path: '/' },
  { lang: 'en', path: '/en/' },
];

/** SITE_URL without trailing slash; the local preview address when unset. */
export function normalizeSiteUrl(raw) {
  const value = String(raw ?? '').trim() || DEFAULT_SITE_URL;
  if (!/^https?:\/\/[^/\s]+/i.test(value)) throw new Error(`SITE_URL must start with http:// or https:// (got "${value}")`);
  return value.replace(/\/+$/, '');
}

/**
 * The site address from the environment, before normalizeSiteUrl: VITE_SITE_URL, then SITE_URL (the shell first, then
 * the .env files). With neither set, on Vercel, the project's production domain: the system variable
 * VERCEL_PROJECT_PRODUCTION_URL (a bare host, e.g. atlas-websitely.vercel.app), so a Vercel build never ships
 * canonical, hreflang, Open Graph and sitemap links to localhost. Undefined otherwise (normalizeSiteUrl then uses the
 * local preview address). Used by vite.config.ts and scripts/prerender.mjs.
 */
export function siteUrlFromEnv(env, fileEnv = {}) {
  for (const source of [env, fileEnv]) {
    for (const key of ['VITE_SITE_URL', 'SITE_URL']) {
      const value = String(source?.[key] ?? '').trim();
      if (value) return value;
    }
  }
  const host = String(env?.VERCEL_PROJECT_PRODUCTION_URL || fileEnv?.VERCEL_PROJECT_PRODUCTION_URL || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
  return host ? `https://${host}` : undefined;
}

/** Replaces every %SITE_URL% placeholder (index.html heads, public/robots.txt). */
export function fillSiteUrl(text, siteUrl) {
  return text.replaceAll('%SITE_URL%', siteUrl);
}

const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * sitemap.xml with hreflang alternates. lastmod is YYYY-MM-DD. `groups` are sets of language versions of one page
 * ([{ lang, path }, ...]); the home page pair (PAGES) always comes first, then e.g. each crane page pair. x-default of
 * a group is its Arabic page.
 */
export function buildSitemap(siteUrl, lastmod, groups = []) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) throw new Error(`lastmod must be YYYY-MM-DD (got "${lastmod}")`);
  const base = normalizeSiteUrl(siteUrl);
  const urls = [PAGES, ...groups].flatMap((group) => {
    const xDefault = (group.find((p) => p.lang === 'ar') ?? group[0]).path;
    const alternates = [
      ...group.map((p) => `    <xhtml:link rel="alternate" hreflang="${p.lang}" href="${xml(base + p.path)}" />`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${xml(base + xDefault)}" />`,
    ].join('\n');
    return group.map((p) => ['  <url>', `    <loc>${xml(base + p.path)}</loc>`, `    <lastmod>${lastmod}</lastmod>`, alternates, '  </url>'].join('\n'));
  });
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    `${urls.join('\n')}\n</urlset>\n`
  );
}

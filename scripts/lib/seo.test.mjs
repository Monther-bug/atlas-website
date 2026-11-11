// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildSitemap, fillSiteUrl, normalizeSiteUrl, siteUrlFromEnv } from './seo.mjs';

const EXPECTED_SITEMAP =
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    '  <url>',
    '    <loc>https://atlas.example/</loc>',
    '    <lastmod>2026-11-13</lastmod>',
    '    <xhtml:link rel="alternate" hreflang="ar" href="https://atlas.example/" />',
    '    <xhtml:link rel="alternate" hreflang="en" href="https://atlas.example/en/" />',
    '    <xhtml:link rel="alternate" hreflang="x-default" href="https://atlas.example/" />',
    '  </url>',
    '  <url>',
    '    <loc>https://atlas.example/en/</loc>',
    '    <lastmod>2026-11-13</lastmod>',
    '    <xhtml:link rel="alternate" hreflang="ar" href="https://atlas.example/" />',
    '    <xhtml:link rel="alternate" hreflang="en" href="https://atlas.example/en/" />',
    '    <xhtml:link rel="alternate" hreflang="x-default" href="https://atlas.example/" />',
    '  </url>',
    '</urlset>',
  ].join('\n') + '\n';

describe('normalizeSiteUrl', () => {
  it('defaults to the local preview address', () => {
    expect(normalizeSiteUrl(undefined)).toBe('http://localhost:4173');
    expect(normalizeSiteUrl('  ')).toBe('http://localhost:4173');
  });
  it('drops trailing slashes and spaces', () => {
    expect(normalizeSiteUrl(' https://atlas.example// ')).toBe('https://atlas.example');
  });
  it('rejects a value without a scheme', () => {
    expect(() => normalizeSiteUrl('atlas.example')).toThrow(/http/);
  });
});

describe('siteUrlFromEnv', () => {
  it('uses VITE_SITE_URL, then SITE_URL, from the shell before the .env files', () => {
    expect(siteUrlFromEnv({ VITE_SITE_URL: 'https://a.example', SITE_URL: 'https://b.example' })).toBe('https://a.example');
    expect(siteUrlFromEnv({ SITE_URL: 'https://b.example' }, { VITE_SITE_URL: 'https://file.example' })).toBe('https://b.example');
    expect(siteUrlFromEnv({}, { SITE_URL: 'https://file.example' })).toBe('https://file.example');
  });
  it('falls back to the Vercel production domain when no address is set', () => {
    expect(siteUrlFromEnv({ VERCEL_PROJECT_PRODUCTION_URL: 'atlas-websitely.vercel.app' })).toBe('https://atlas-websitely.vercel.app');
    expect(siteUrlFromEnv({ SITE_URL: ' ', VERCEL_PROJECT_PRODUCTION_URL: 'atlas-websitely.vercel.app' })).toBe('https://atlas-websitely.vercel.app');
  });
  it('never lets the Vercel domain override a set address', () => {
    expect(siteUrlFromEnv({ SITE_URL: 'https://atlas.example', VERCEL_PROJECT_PRODUCTION_URL: 'atlas-websitely.vercel.app' })).toBe('https://atlas.example');
  });
  it('is undefined locally, so normalizeSiteUrl keeps the localhost default', () => {
    expect(siteUrlFromEnv({}, {})).toBeUndefined();
    expect(normalizeSiteUrl(siteUrlFromEnv({ VERCEL_PROJECT_PRODUCTION_URL: '' }))).toBe('http://localhost:4173');
  });
});

describe('fillSiteUrl', () => {
  it('replaces every placeholder', () => {
    expect(fillSiteUrl('Sitemap: %SITE_URL%/sitemap.xml\n%SITE_URL%/', 'https://atlas.example')).toBe(
      'Sitemap: https://atlas.example/sitemap.xml\nhttps://atlas.example/',
    );
  });
});

describe('buildSitemap', () => {
  it('lists both pages with hreflang alternates and x-default on the Arabic root', () => {
    expect(buildSitemap('https://atlas.example/', '2026-11-13')).toBe(EXPECTED_SITEMAP);
  });
  it('rejects a malformed lastmod', () => {
    expect(() => buildSitemap('https://atlas.example', '13/11/2026')).toThrow(/YYYY-MM-DD/);
  });
  it('escapes XML special characters in the address', () => {
    expect(buildSitemap('https://atlas.example/a&b', '2026-11-13')).toContain('<loc>https://atlas.example/a&amp;b/</loc>');
  });
});

describe('buildSitemap with the crane pages', () => {
  it('lists each crane page pair with its own hreflang alternates and x-default on the Arabic page', () => {
    const xml = buildSitemap('https://atlas.example', '2026-11-13', [[{ lang: 'ar', path: '/cranes/gmk6350/' }, { lang: 'en', path: '/en/cranes/gmk6350/' }]]);
    expect(xml.match(/<loc>/g)).toHaveLength(4);
    expect(xml).toContain('<loc>https://atlas.example/en/cranes/gmk6350/</loc>');
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://atlas.example/cranes/gmk6350/" />');
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="en" href="https://atlas.example/en/cranes/gmk6350/" />');
  });
});

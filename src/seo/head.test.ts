import { describe, expect, it } from 'vitest';
import arHtml from '../../index.html?raw';
import enHtml from '../../en/index.html?raw';
import { parseHead } from '../../scripts/lib/head.mjs';
import { getCopy } from '@/content/all';
import type { Lang } from '@/content/types';

const PAGES: { lang: Lang; html: string; path: string; dir: string; locale: string; altLocale: string; siteName: string }[] = [
  { lang: 'ar', html: arHtml, path: '/', dir: 'rtl', locale: 'ar_LY', altLocale: 'en_GB', siteName: 'أطلس الصحراء' },
  { lang: 'en', html: enHtml, path: '/en/', dir: 'ltr', locale: 'en_GB', altLocale: 'ar_LY', siteName: 'Atlas Alshraa' },
];

describe.each(PAGES)('$lang page head', (p) => {
  const head = parseHead(p.html);
  const meta = getCopy(p.lang).meta;

  it('declares language and direction', () => {
    expect(head.lang).toBe(p.lang);
    expect(head.dir).toBe(p.dir);
  });
  it('uses the copy deck §1 strings from src/content', () => {
    expect(head.title).toBe(meta.title);
    expect(head.meta.description).toBe(meta.description);
    expect(head.meta['og:title']).toBe(meta.ogTitle);
    expect(head.meta['og:description']).toBe(meta.ogDescription);
    expect(head.meta['og:image:alt']).toBe(meta.ogImageAlt);
    expect(head.meta['twitter:title']).toBe(meta.ogTitle);
    expect(head.meta['twitter:description']).toBe(meta.ogDescription);
    expect(head.meta['twitter:image:alt']).toBe(meta.ogImageAlt);
    expect(head.meta['og:site_name']).toBe(p.siteName);
  });
  it('links canonical, og:url and hreflang through %SITE_URL%', () => {
    expect(head.canonical).toBe(`%SITE_URL%${p.path}`);
    expect(head.meta['og:url']).toBe(`%SITE_URL%${p.path}`);
    expect(head.alternates).toEqual({ ar: '%SITE_URL%/', en: '%SITE_URL%/en/', 'x-default': '%SITE_URL%/' });
  });
  it('uses its own 1200×630 Open Graph image', () => {
    expect(head.meta['og:image']).toBe(`%SITE_URL%/og-${p.lang}.jpg`);
    expect(head.meta['og:image:type']).toBe('image/jpeg');
    expect(head.meta['og:image:width']).toBe('1200');
    expect(head.meta['og:image:height']).toBe('630');
    expect(head.meta['twitter:card']).toBe('summary_large_image');
    expect(head.meta['twitter:image']).toBe(`%SITE_URL%/og-${p.lang}.jpg`);
  });
  it('sets locales, theme colour and the temporary badge icon', () => {
    expect(head.meta['og:locale']).toBe(p.locale);
    expect(head.meta['og:locale:alternate']).toBe(p.altLocale);
    expect(head.meta['theme-color']).toBe('#0D0C2B');
    expect(head.icons).toEqual(['/brand/badge-64.png', '/brand/badge-180.png']);
  });
  it('keeps the prerender markers and the module entry', () => {
    expect(p.html).toContain('<div id="root"><!--app--></div>');
    expect(p.html.match(/<!--head-->/g)).toHaveLength(1);
    expect(p.html).toContain(`<script type="module" src="/src/main-${p.lang}.tsx"></script>`);
  });
});

describe('Arabic search terms (spec §10)', () => {
  const head = parseHead(arHtml);
  it('meta keywords carry both رافعة and كرين', () => {
    expect(head.meta.keywords).toContain('رافعة');
    expect(head.meta.keywords).toContain('كرين');
  });
  it('meta description carries كرين (الكرينات)', () => {
    expect(head.meta.description).toContain('كرين');
  });
});

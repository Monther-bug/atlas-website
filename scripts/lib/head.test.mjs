// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parseAttrs, parseHead } from './head.mjs';

const SAMPLE = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <title>أطلس الصحراء | تأجير</title>
    <meta name="description" content="وصف &amp; نص" />
    <meta property="og:title" content="عنوان" />
    <link rel="canonical" href="https://atlas.example/" />
    <link rel="alternate" hreflang="ar" href="https://atlas.example/" />
    <link rel="alternate" hreflang="en" href="https://atlas.example/en/" />
    <link rel="alternate" hreflang="x-default" href="https://atlas.example/" />
    <link rel="icon" href="/brand/badge.png" type="image/png" />
    <script type="application/ld+json">{"@type":["Organization","LocalBusiness"],"email":"a@b.c"}</script>
  </head>
  <body><header data-header><title>not this</title></header></body>
</html>`;

describe('parseAttrs', () => {
  it('reads quoted, unquoted and empty attributes', () => {
    expect(parseAttrs(`<link rel="preload" as=font crossorigin href='/a.woff2'>`)).toEqual({
      rel: 'preload',
      as: 'font',
      crossorigin: '',
      href: '/a.woff2',
    });
  });
});

describe('parseHead', () => {
  const h = parseHead(SAMPLE);
  it('reads lang and dir from <html>', () => {
    expect([h.lang, h.dir]).toEqual(['ar', 'rtl']);
  });
  it('reads the head title only, decoding entities in meta', () => {
    expect(h.title).toBe('أطلس الصحراء | تأجير');
    expect(h.meta.description).toBe('وصف & نص');
    expect(h.meta['og:title']).toBe('عنوان');
  });
  it('reads canonical, hreflang alternates and icons', () => {
    expect(h.canonical).toBe('https://atlas.example/');
    expect(h.alternates).toEqual({ ar: 'https://atlas.example/', en: 'https://atlas.example/en/', 'x-default': 'https://atlas.example/' });
    expect(h.icons).toEqual(['/brand/badge.png']);
  });
  it('parses JSON-LD blocks', () => {
    expect(h.jsonLd).toEqual([{ '@type': ['Organization', 'LocalBusiness'], email: 'a@b.c' }]);
    expect(h.jsonLdErrors).toEqual([]);
  });
  it('reports JSON-LD that does not parse', () => {
    const bad = parseHead('<html><head><script type="application/ld+json">{oops}</script></head></html>');
    expect(bad.jsonLd).toEqual([]);
    expect(bad.jsonLdErrors).toHaveLength(1);
  });
});

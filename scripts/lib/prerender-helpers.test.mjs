// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  countFontPreloads,
  dropDuplicateLinks,
  extractLeadingLinks,
  findTokens,
  injectApp,
  injectHead,
  resolveBuildTarget,
} from './prerender-helpers.mjs';

const PAGE =
  '<!doctype html><html lang="ar" dir="rtl"><head><title>t</title><!--head--></head>' +
  '<body><div id="root"><!--app--></div></body></html>';

describe('injectApp', () => {
  it('puts the rendered app inside #root in place of the marker', () => {
    expect(injectApp(PAGE, '<header data-header></header>')).toContain('<div id="root"><header data-header></header></div>');
  });
  it('leaves no marker behind', () => {
    expect(injectApp(PAGE, '<main></main>')).not.toContain('<!--app-->');
  });
  it('copies $ sequences literally (no String.replace patterns)', () => {
    expect(injectApp(PAGE, '<p>$& $1 $$ $`</p>')).toContain('<div id="root"><p>$& $1 $$ $`</p></div>');
  });
  it('throws when the marker is missing', () => {
    expect(() => injectApp('<div id="root"></div>', '<main></main>')).toThrow(/<!--app-->/);
  });
  it('throws when the marker appears twice', () => {
    expect(() => injectApp(PAGE + '<!--app-->', '<main></main>')).toThrow(/more than once/);
  });
  it('throws when the rendered app is empty', () => {
    expect(() => injectApp(PAGE, '   ')).toThrow(/empty/);
  });
});

describe('injectHead', () => {
  it('puts tags where <!--head--> was', () => {
    expect(injectHead(PAGE, '<script type="application/ld+json">{}</script>')).toContain(
      '<title>t</title><script type="application/ld+json">{}</script></head>',
    );
  });
  it('accepts an empty string and removes the marker', () => {
    expect(injectHead(PAGE, '')).not.toContain('<!--head-->');
  });
  it('throws when the marker is missing', () => {
    expect(() => injectHead('<head></head>', '')).toThrow(/<!--head-->/);
  });
});

describe('extractLeadingLinks', () => {
  it('moves resource hints that React put before the app markup', () => {
    const r = extractLeadingLinks(
      '<link rel="preload" as="image" href="/brand/badge.png"/><link rel="preload" as="image" href="/x.png"/><a href="#main">Skip</a>',
    );
    expect(r.links).toBe('<link rel="preload" as="image" href="/brand/badge.png"/><link rel="preload" as="image" href="/x.png"/>');
    expect(r.body).toBe('<a href="#main">Skip</a>');
  });
  it('returns the html untouched when nothing precedes it', () => {
    expect(extractLeadingLinks('<a href="#main">Skip</a><link rel="x">')).toEqual({
      links: '',
      body: '<a href="#main">Skip</a><link rel="x">',
    });
  });
});

describe('findTokens', () => {
  it('lists each unresolved token once, sorted', () => {
    expect(findTokens('<p>[[PHONE]]</p><p>[[CAPACITY:RT700E]]</p><a>[[PHONE]]</a>')).toEqual(['[[CAPACITY:RT700E]]', '[[PHONE]]']);
  });
  it('catches CONFIRM markers with spaces', () => {
    expect(findTokens('Name [[CONFIRM: English spelling]].')).toEqual(['[[CONFIRM: English spelling]]']);
  });
  it('reports a stray opening bracket pair', () => {
    expect(findTokens('<p>broken [[PHO</p>')).toEqual(['[[PHO</p>']);
  });
  it('returns [] for clean html', () => {
    expect(findTokens('<p>350 t</p>')).toEqual([]);
  });
});

// Same rule as vite.config.ts (syncEnv + target): a non-empty shell value wins over the .env files.
describe('resolveBuildTarget', () => {
  it('reads BUILD_TARGET from the .env files when the shell does not set it', () => {
    expect(resolveBuildTarget({}, { BUILD_TARGET: 'production' })).toBe('production');
  });
  it('lets the shell win over the .env files', () => {
    expect(resolveBuildTarget({ BUILD_TARGET: 'staging' }, { BUILD_TARGET: 'production' })).toBe('staging');
    expect(resolveBuildTarget({ BUILD_TARGET: 'production' }, { BUILD_TARGET: 'staging' })).toBe('production');
  });
  it('treats an empty shell value as unset', () => {
    expect(resolveBuildTarget({ BUILD_TARGET: '' }, { BUILD_TARGET: 'production' })).toBe('production');
  });
  it('defaults to staging, also for unknown values', () => {
    expect(resolveBuildTarget({}, {})).toBe('staging');
    expect(resolveBuildTarget({ BUILD_TARGET: 'prod' }, {})).toBe('staging');
  });
});

describe('countFontPreloads', () => {
  it('counts <link rel="preload" as="font"> tags in any attribute order', () => {
    const head =
      '<link rel="preload" as="font" type="font/woff2" href="/assets/a.woff2" crossorigin>' +
      '<link as="font" href="/assets/b.woff2" rel="preload" crossorigin/>' +
      "<link rel='preload' as='font' href='/assets/c.woff2' crossorigin>";
    expect(countFontPreloads(head)).toBe(3);
  });
  it('ignores image preloads, stylesheets and modulepreloads', () => {
    const head =
      '<link rel="preload" as="image" href="/brand/badge.png"/>' +
      '<link rel="stylesheet" href="/assets/main.css">' +
      '<link rel="modulepreload" href="/assets/x.js">';
    expect(countFontPreloads(head)).toBe(0);
  });
});

describe('dropDuplicateLinks', () => {
  const page = '<head><link rel="preload" as="font" href="/a.woff2"><link rel="icon" href="/brand/badge.png"><link rel="x" href="/q?a=1&amp;b=2"></head>';
  it('drops a hoisted link already in the page (same rel, as and href)', () => {
    expect(dropDuplicateLinks('<link rel="preload" as="font" href="/a.woff2">', page)).toEqual([]);
  });
  it('keeps an image preload that only shares its href with the favicon', () => {
    const tag = '<link rel="preload" as="image" href="/brand/badge.png">';
    expect(dropDuplicateLinks(tag, page)).toEqual([tag]);
  });
  it('handles & in href', () => {
    expect(dropDuplicateLinks('<link rel="x" href="/q?a=1&amp;b=2">', page)).toEqual([]);
    expect(dropDuplicateLinks('<link rel="x" href="/q?a=1&b=2">', page)).toEqual([]);
  });
  it('keeps new links in order', () => {
    const a = '<link rel="preload" as="image" href="/n1.jpg">';
    const b = '<link rel="preload" as="image" href="/n2.jpg">';
    expect(dropDuplicateLinks(a + '\n' + b, page)).toEqual([a, b]);
  });
});

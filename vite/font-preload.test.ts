// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { fontPreloadTags } from './font-preload';

const BUNDLE = [
  'assets/main-CoU9e-14.js',
  'assets/main-DJFV_b92.css',
  'assets/archivo-wght-wdth-BJLyxoHe.woff2',
  'assets/kufi-wght-Bf_xsutm.woff2',
  'assets/plex-ar-400-DPfaHKGf.woff2',
  'assets/plex-ar-600--Q2n8xaD.woff2',
  'assets/plex-la-400-BA30v0Pd.woff2',
  'assets/plex-la-600-DyUes8Yx.woff2',
  'assets/plex-mono-500-cj9RCqy4.woff2',
];

const hrefs = (path: string) => fontPreloadTags(path, BUNDLE).map((t) => t.attrs?.href);

describe('fontPreloadTags', () => {
  it('preloads Kufi, Plex Arabic 400 and Archivo on the Arabic page', () => {
    expect(hrefs('/index.html')).toEqual([
      '/assets/kufi-wght-Bf_xsutm.woff2',
      '/assets/plex-ar-400-DPfaHKGf.woff2',
      '/assets/archivo-wght-wdth-BJLyxoHe.woff2',
    ]);
  });

  it('preloads Archivo, Plex Latin 400 and Plex Latin 600 on the English page', () => {
    expect(hrefs('/en/index.html')).toEqual([
      '/assets/archivo-wght-wdth-BJLyxoHe.woff2',
      '/assets/plex-la-400-BA30v0Pd.woff2',
      '/assets/plex-la-600-DyUes8Yx.woff2',
    ]);
  });

  it('emits crossorigin font preload links at the top of <head>', () => {
    const [tag] = fontPreloadTags('/index.html', BUNDLE);
    expect(tag).toEqual({
      tag: 'link',
      attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: '/assets/kufi-wght-Bf_xsutm.woff2', crossorigin: true },
      injectTo: 'head-prepend',
    });
  });

  it('honours a non-root base path', () => {
    expect(fontPreloadTags('/en/index.html', BUNDLE, '/site/')[0].attrs?.href).toBe(
      '/site/assets/archivo-wght-wdth-BJLyxoHe.woff2',
    );
  });

  it('fails the build when a wanted font is missing from the bundle', () => {
    const withoutKufi = BUNDLE.filter((f) => !f.includes('kufi'));
    expect(() => fontPreloadTags('/index.html', withoutKufi)).toThrow(/kufi-wght/);
  });
});

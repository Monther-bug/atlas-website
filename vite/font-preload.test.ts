// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { fontPreloadTags } from './font-preload';

const BUNDLE = [
  'assets/main-CoU9e-14.js',
  'assets/main-DJFV_b92.css',
  'assets/tajawal-ar-400-DPfaHKGf.woff2',
  'assets/tajawal-ar-500-Aa1b2c3d.woff2',
  'assets/tajawal-ar-700--Q2n8xaD.woff2',
  'assets/tajawal-ar-800-Bf_xsutm.woff2',
  'assets/poppins-400-BA30v0Pd.woff2',
  'assets/poppins-500-Ee5f6g7h.woff2',
  'assets/poppins-600-DyUes8Yx.woff2',
  'assets/poppins-700-BJLyxoHe.woff2',
  'assets/fill-ar-Zz9y8x7w.woff2',
  'assets/fill-la-Yy8x7w6v.woff2',
  'assets/plex-mono-500-cj9RCqy4.woff2',
];

const hrefs = (path: string) => fontPreloadTags(path, BUNDLE).map((t) => t.attrs?.href);

describe('fontPreloadTags', () => {
  it('preloads Tajawal 800, 700 and 400 on the Arabic page', () => {
    expect(hrefs('/index.html')).toEqual([
      '/assets/tajawal-ar-800-Bf_xsutm.woff2',
      '/assets/tajawal-ar-700--Q2n8xaD.woff2',
      '/assets/tajawal-ar-400-DPfaHKGf.woff2',
    ]);
  });

  it('preloads Poppins 700, 600 and 400 on the English page', () => {
    expect(hrefs('/en/index.html')).toEqual([
      '/assets/poppins-700-BJLyxoHe.woff2',
      '/assets/poppins-600-DyUes8Yx.woff2',
      '/assets/poppins-400-BA30v0Pd.woff2',
    ]);
  });

  it('emits crossorigin font preload links at the top of <head>', () => {
    const [tag] = fontPreloadTags('/index.html', BUNDLE);
    expect(tag).toEqual({
      tag: 'link',
      attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: '/assets/tajawal-ar-800-Bf_xsutm.woff2', crossorigin: true },
      injectTo: 'head-prepend',
    });
  });

  it('honours a non-root base path', () => {
    expect(fontPreloadTags('/en/index.html', BUNDLE, '/site/')[0].attrs?.href).toBe(
      '/site/assets/poppins-700-BJLyxoHe.woff2',
    );
  });

  it('fails the build when a wanted font is missing from the bundle', () => {
    const withoutDisplay = BUNDLE.filter((f) => !f.includes('tajawal-ar-800'));
    expect(() => fontPreloadTags('/index.html', withoutDisplay)).toThrow(/tajawal-ar-800/);
  });
});

// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderHtml } from '@/test/render';
import { App } from './App';
import { REVEAL_KINDS } from '@/components/ui';

describe('App', () => {
  it('renders the skip link, main and the progress rope', () => {
    const html = renderHtml(<App />, 'ar');
    expect(html.querySelector('a[href="#main"]')?.textContent).toBe('انتقل إلى المحتوى');
    expect(html.querySelector('main#main')).not.toBeNull();
    const rope = html.querySelector('[data-progress-rope]');
    expect(rope?.getAttribute('aria-hidden')).toBe('true');
    expect(rope?.className).toBe('progress-rope');
  });

  it('uses the English skip link on the English page', () => {
    expect(renderHtml(<App />, 'en').querySelector('a[href="#main"]')?.textContent).toBe('Skip to content');
  });

  it('renders the sections in spec order (documents hidden until files exist)', () => {
    const ids = [...renderHtml(<App />, 'ar').querySelectorAll('main#main > section[id]')].map((s) => s.id);
    expect(ids).toEqual(['top', 'about', 'cranes', 'services', 'crane-list', 'sites', 'request']);
  });

  it('meets the v2 floor on both pages (spec 2026-11-05 §16)', () => {
    for (const lang of ['ar', 'en'] as const) {
      const html = renderHtml(<App />, lang);
      for (const heading of html.querySelectorAll('main h1, main h2')) {
        expect(heading.previousElementSibling, heading.textContent ?? '').toBeNull(); // no eyebrow above a heading
      }
      expect(html.querySelector('main')?.textContent).not.toMatch(/\b0[1-9]\b/); // no section numbers
      expect(html.innerHTML).not.toMatch(/[\u2715\u2716\u00D7\u2713\u2192\u2190]/); // icons are SVG, not glyphs
      // v2 floor §16.6 (replaces spec §15.6): shadows only from the elevation scale.
      for (const el of html.querySelectorAll('[class*="shadow-"]')) {
        const shadows = el.className.split(/\s+/).filter((c) => /(^|:)shadow-/.test(c));
        for (const c of shadows) expect(c, el.outerHTML.slice(0, 80)).toMatch(/(^|:)shadow-(e[1-4]|bar|none)$/);
      }
      // v2 floor §16.4 (replaces spec §15.4): reveals speak the shared vocabulary and never touch the hero.
      for (const el of html.querySelectorAll('[data-reveal]')) {
        expect(REVEAL_KINDS).toContain(el.getAttribute('data-reveal'));
        expect(el.closest('#top')).toBeNull();
      }
    }
  });

  it('gives every image alt text from the deck or an explicit empty alt', () => {
    for (const img of renderHtml(<App />, 'en').querySelectorAll('img')) {
      expect(img.hasAttribute('alt')).toBe(true);
    }
  });
});

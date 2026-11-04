// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderHtml } from '@/test/render';
import { App } from './App';

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
    expect(ids).toEqual(['top', 'cranes', 'services', 'crane-list', 'sites', 'request']);
  });

  it('meets the spec §15 floor on both pages', () => {
    for (const lang of ['ar', 'en'] as const) {
      const html = renderHtml(<App />, lang);
      for (const heading of html.querySelectorAll('main h1, main h2')) {
        expect(heading.previousElementSibling, heading.textContent ?? '').toBeNull(); // no eyebrow above a heading
      }
      expect(html.querySelector('main')?.textContent).not.toMatch(/\b0[1-9]\b/); // no section numbers
      expect(html.innerHTML).not.toMatch(/[\u2715\u2716\u00D7\u2713\u2192\u2190]/); // icons are SVG, not glyphs
      const shadowed = [...html.querySelectorAll('[class*="shadow-"]')];
      expect(shadowed.map((el) => el.getAttribute('data-testid'))).toEqual(['request-bar']);
      expect(html.querySelectorAll('[data-reveal]')).toHaveLength(0);
    }
  });

  it('gives every image alt text from the deck or an explicit empty alt', () => {
    for (const img of renderHtml(<App />, 'en').querySelectorAll('img')) {
      expect(img.hasAttribute('alt')).toBe(true);
    }
  });
});

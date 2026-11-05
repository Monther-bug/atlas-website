// @vitest-environment node
// The first-visit loader lives in the two HTML entries (inline head script + style, #al before #root). These tests run
// the real head script, as written and as minified for the build, in a fresh DOM per visit.
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import arHtml from '../index.html?raw';
import enHtml from '../en/index.html?raw';
import { minifyInlineScripts } from '../vite/inline-script';
import { getCopy } from '@/content/all';

interface Visit {
  hash?: string;
  reduced?: boolean;
  hidden?: boolean;
  /** sessionStorage already holds the flag (a later load in the same tab session). */
  seen?: boolean;
  /** sessionStorage throws (storage disabled). */
  noStorage?: boolean;
}

function visit(html: string, v: Visit = {}) {
  const events: string[] = [];
  const dom = new JSDOM(html, {
    url: `http://localhost/${v.hash ?? ''}`,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = ((query: string) => ({ matches: !!v.reduced && query.includes('reduce'), media: query })) as never;
      if (v.hidden) Object.defineProperty(window.document, 'visibilityState', { value: 'hidden' });
      if (v.seen) window.sessionStorage.setItem('atlas-intro', '1');
      if (v.noStorage) {
        Object.defineProperty(window, 'sessionStorage', {
          get() {
            throw new Error('SecurityError');
          },
        });
      }
      window.addEventListener('atlas:loader-done', () => events.push('done'));
    },
  });
  const { window } = dom;
  const html_ = window.document.documentElement;
  return {
    window,
    events,
    classes: () => [...html_.classList],
    loader: () => html_.hasAttribute('data-loader'),
    curtain: () => window.document.getElementById('al'),
  };
}

const PAGES = [
  { lang: 'ar' as const, html: arHtml },
  { lang: 'en' as const, html: enHtml },
];

describe.each(PAGES)('$lang page: first-visit loader markup', ({ lang, html }) => {
  const doc = new JSDOM(html).window.document;
  const al = doc.getElementById('al')!;

  it('sits in <body> before #root, outside the prerendered app', () => {
    const root = doc.getElementById('root')!;
    expect(al.parentElement).toBe(doc.body);
    expect(al.compareDocumentPosition(root) & 4).toBeTruthy(); // root follows the loader
    expect(root.contains(al)).toBe(false);
  });

  it('is hidden from assistive tech, holds no focusable element and no text for crawlers', () => {
    expect(al.getAttribute('aria-hidden')).toBe('true');
    expect(al.querySelector('a, button, input, select, textarea, [tabindex]')).toBeNull();
    expect(al.textContent?.trim()).toBe('');
    expect(al.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it("draws the page's own name over its other-language twin (generated content)", () => {
    const copy = getCopy(lang);
    expect(al.querySelector('.al-w')?.getAttribute('data-w')).toBe(copy.header.name);
    const twin = al.querySelector('.al-t')!;
    expect(twin.getAttribute('data-w')).toBe(copy.header.nameAlt);
    expect(twin.getAttribute('lang')).toBe(lang === 'ar' ? 'en' : 'ar');
  });

  it('is display:none unless html[data-loader] (no JS, no loader)', () => {
    const css = doc.querySelector('style')?.textContent ?? '';
    expect(css).toMatch(/\.al\{display:none;/);
    expect(css).toMatch(/html\[data-loader\] \.al\{display:block;animation:al-x \.3s 2\.2s forwards\}/);
  });
});

describe('both pages', () => {
  it('carry the same loader script and style', () => {
    const block = (html: string) => {
      const doc = new JSDOM(html).window.document;
      return [doc.querySelector('head > script:not([type]):not([src])')?.textContent, doc.querySelector('head > style')?.textContent];
    };
    expect(block(enHtml)).toEqual(block(arHtml));
  });
});

const SOURCES = [
  { name: 'as written', html: arHtml },
  { name: 'minified (build)', html: minifyInlineScripts(arHtml) },
];

describe.each(SOURCES)('head script $name', ({ html }) => {
  it('shows the loader on a first visit and remembers it for the tab session', () => {
    const v = visit(html);
    expect(v.classes()).toEqual(['js', 'motion-ok']);
    expect(v.loader()).toBe(true);
    expect(v.window.sessionStorage.getItem('atlas-intro')).toBe('1');
    v.window.close();
  });

  it('never shows it again in the same session, on a deep link, in a hidden tab or without storage', () => {
    for (const opts of [{ seen: true }, { hash: '#request' }, { hidden: true }, { noStorage: true }]) {
      const v = visit(html, opts);
      expect(v.classes(), JSON.stringify(opts)).toEqual(['js', 'motion-ok']);
      expect(v.loader(), JSON.stringify(opts)).toBe(false);
      v.window.close();
    }
  });

  it('never shows it with reduced motion', () => {
    const v = visit(html, { reduced: true });
    expect(v.classes()).toEqual(['js']);
    expect(v.loader()).toBe(false);
    expect(v.window.sessionStorage.getItem('atlas-intro')).toBeNull();
    v.window.close();
  });

  it('lifts at once on a key, a press, a wheel or a touch, and hands over exactly once', () => {
    for (const type of ['keydown', 'pointerdown', 'wheel', 'touchstart']) {
      const v = visit(html);
      v.window.dispatchEvent(new v.window.Event(type));
      expect(v.loader(), type).toBe(false);
      expect(v.events, type).toEqual(['done']);
      // jsdom has no Web Animations: the curtain is removed instead of lifted.
      expect(v.curtain(), type).toBeNull();
      v.window.dispatchEvent(new v.window.Event('keydown'));
      expect(v.events, type).toEqual(['done']);
      v.window.close();
    }
  });

  it('lifts by itself when the page is ready, within the hold cap', async () => {
    const v = visit(html);
    const t0 = v.window.performance.now();
    await new Promise<void>((resolve, reject) => {
      v.window.addEventListener('atlas:loader-done', () => resolve());
      setTimeout(() => reject(new Error('the loader never lifted')), 2500);
    });
    const held = v.window.performance.now() - t0;
    expect(held).toBeGreaterThan(500); // the rope pays out over ≥ 600 ms; it never jumps to 100
    expect(held).toBeLessThan(1300);
    expect(v.loader()).toBe(false);
    expect(v.events).toEqual(['done']);
    v.window.close();
  });
});

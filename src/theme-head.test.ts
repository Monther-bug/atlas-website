// @vitest-environment node
// The no-flash half of the theme (src/lib/theme.ts): the inline head script applies a saved dark theme before first
// paint and otherwise leaves the page light, whatever the OS prefers. Runs the real script, as written and minified.
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import arHtml from '../index.html?raw';
import enHtml from '../en/index.html?raw';
import craneArHtml from '../cranes/index.html?raw';
import craneEnHtml from '../en/cranes/index.html?raw';
import { minifyInlineScripts } from '../vite/inline-script';

function load(html: string, { saved, osDark = false, reduced = false, noStorage = false }: { saved?: string; osDark?: boolean; reduced?: boolean; noStorage?: boolean }) {
  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = ((query: string) => ({
        matches: (osDark && query.includes('dark')) || (reduced && query.includes('reduce')),
        media: query,
      })) as never;
      window.sessionStorage.setItem('atlas-intro', '1');
      if (saved) window.localStorage.setItem('atlas-theme', saved);
      if (noStorage) {
        Object.defineProperty(window, 'localStorage', {
          get() {
            throw new Error('SecurityError');
          },
        });
      }
    },
  });
  return dom.window.document.documentElement;
}

describe.each([
  ['ar', arHtml],
  ['en', enHtml],
  ['ar minified', minifyInlineScripts(arHtml)],
  ['en minified', minifyInlineScripts(enHtml)],
  ['crane ar', craneArHtml],
  ['crane en minified', minifyInlineScripts(craneEnHtml)],
])('%s head script: theme', (_name, html) => {
  it('opens light on a first visit, even when the OS prefers dark', () => {
    expect(load(html, { osDark: true }).hasAttribute('data-theme')).toBe(false);
  });

  it('applies a saved dark theme before first paint (also with reduced motion)', () => {
    expect(load(html, { saved: 'dark' }).getAttribute('data-theme')).toBe('dark');
    expect(load(html, { saved: 'dark', reduced: true }).getAttribute('data-theme')).toBe('dark');
  });

  it('stays light when light was chosen, and when storage is blocked', () => {
    expect(load(html, { saved: 'light', osDark: true }).hasAttribute('data-theme')).toBe(false);
    const h = load(html, { noStorage: true });
    expect(h.hasAttribute('data-theme')).toBe(false);
    expect(h.classList.contains('js')).toBe(true);
  });

  it('ships light in the HTML: no theme attribute and a light color-scheme', () => {
    expect(html).not.toMatch(/<html[^>]*data-theme/);
    expect(html).toContain('<meta name="color-scheme" content="light" />');
  });
});

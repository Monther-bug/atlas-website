// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from '@/components/ThemeToggle';
import { click, mount, renderHtml } from '@/test/render';
import { THEME_KEY, toggleTheme } from './theme';

const html = document.documentElement;

afterEach(() => {
  delete html.dataset.theme;
  localStorage.clear();
  vi.unstubAllGlobals();
  delete (document as { startViewTransition?: unknown }).startViewTransition;
});

describe('toggleTheme', () => {
  it('switches to dark and back, and remembers the choice', () => {
    toggleTheme();
    expect(html.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    toggleTheme();
    expect(html.hasAttribute('data-theme')).toBe(false);
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
  });

  it('switches inside a View Transition where the browser has one', () => {
    const start = vi.fn((update: () => void) => update());
    (document as { startViewTransition?: unknown }).startViewTransition = start;
    toggleTheme();
    expect(start).toHaveBeenCalledOnce();
    expect(html.dataset.theme).toBe('dark');
  });

  it('still switches when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    toggleTheme();
    expect(html.dataset.theme).toBe('dark');
    vi.restoreAllMocks();
  });
});

describe('ThemeToggle', () => {
  it('prerenders light: a named toggle button, not pressed, both glyph shapes (CSS shows one)', () => {
    for (const [lang, name] of [
      ['ar', 'الوضع الداكن'],
      ['en', 'Dark mode'],
    ] as const) {
      const button = renderHtml(<ThemeToggle label={name} className="x" />, lang).querySelector('button');
      expect(button?.getAttribute('type')).toBe('button');
      expect(button?.getAttribute('aria-pressed')).toBe('false');
      expect(button?.textContent).toBe(name);
      expect(button?.querySelectorAll('svg[aria-hidden="true"] > *')).toHaveLength(2); // sun, moon
    }
  });

  it('reads the theme after hydration and toggles it; theme-color keeps its one dark value', async () => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#0D0C2B';
    document.head.append(meta);
    html.dataset.theme = 'dark';
    const { host, unmount } = await mount(<ThemeToggle label="Dark mode" className="x" />, 'en');
    const button = host.querySelector('button');
    expect(button?.getAttribute('aria-pressed')).toBe('true');
    expect(meta.content).toBe('#0D0C2B');
    await click(button);
    await act(async () => {}); // React re-renders from the theme store
    expect(html.hasAttribute('data-theme')).toBe(false);
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(meta.content).toBe('#0D0C2B');
    await unmount();
    meta.remove();
  });
});

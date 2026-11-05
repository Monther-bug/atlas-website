import { useSyncExternalStore } from 'react';

/**
 * Light / dark theme (user: "add dark mode but make the default theme the light, not based on the system").
 * The state is `data-theme="dark"` on <html>, nothing else: CSS variables do the rest (styles.css, ui.css).
 * - First visit: light, whatever prefers-color-scheme says. The choice is kept in localStorage (same origin, so it
 *   holds for both languages); the inline head script (index.html, en/index.html) applies it before first paint.
 * - The prerendered HTML is always light and React never reads the theme while rendering on the server or during
 *   hydration (useSyncExternalStore's server snapshot is `false`), so hydration cannot mismatch.
 * Kept tiny on purpose: it ships in the main bundle (budget: 0.5 KB gzip with the toggle).
 */
export const THEME_KEY = 'atlas-theme';

const root = () => document.documentElement;
const isDark = () => root().dataset.theme === 'dark';

// Only the head script (before hydration) and toggleTheme ever change the theme, so the toggle notifies directly.
const listeners = new Set<() => void>();
function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** True while the dark theme is on. `false` on the server and during hydration, then the real value. */
export function useDark(): boolean {
  return useSyncExternalStore(subscribe, isDark, () => false);
}

/**
 * Switches the theme and remembers it. Where View Transitions exist the page cross-fades from one theme to the other
 * as two composited snapshots (no per-element colour transitions, no repaint storm; reduced motion: styles.css drops
 * the cross-fade); without the API it switches at once. Only colours change, so nothing moves (no layout shift).
 */
export function toggleTheme() {
  const dark = !isDark();
  const apply = () => {
    if (dark) root().dataset.theme = 'dark';
    else delete root().dataset.theme;
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch {
      // Private mode or storage off: the switch still works on this page.
    }
    listeners.forEach((f) => f());
  };
  if (document.startViewTransition) document.startViewTransition(apply);
  else apply();
}

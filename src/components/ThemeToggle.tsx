import { ThemeIcon } from '@/components/Icons';
import { toggleTheme, useDark } from '@/lib/theme';

/**
 * Dark-mode switch (header bar from sm; the mobile menu shows its name with `[&>span]:not-sr-only`): a 44 px native
 * toggle button, aria-pressed (the only pressed button in the header: tests and QA find it as
 * `header button[aria-pressed]`), named «الوضع الداكن» / "Dark mode". The glyph shows the current theme (sun, moon) and,
 * like the pressed fill the caller sets with `dark:`, follows html[data-theme] in CSS, so it is right before hydration;
 * aria-pressed follows the same attribute once hydrated.
 * <meta name="theme-color"> keeps its one dark value (#0D0C2B) in both themes: the browser chrome meets the header,
 * which is dark glass over the dark hero in either theme; a per-theme value cost 67 B gzip of main JS for a colour
 * 1.04:1 away from black.
 */
export function ThemeToggle({ label, className }: { label: string; className: string }) {
  const dark = useDark();
  return (
    <button type="button" aria-pressed={dark} onClick={toggleTheme} className={className}>
      <ThemeIcon className="size-5" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

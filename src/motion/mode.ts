import type { Lang } from '@/content/types';

export type MotionMode = 'desktop' | 'touch' | 'reduced';

const NO_PREF = '(prefers-reduced-motion: no-preference)';

/**
 * The three gsap.matchMedia contexts (contract C10).
 * The breakpoint is Tailwind's `lg` in rem (`width >= 64rem`), so motion and layout switch at the same
 * width, there is no fractional-pixel gap at 1024px, and it follows the visitor's default font size.
 * `touch` is written as a comma list (OR) because `… and not (…)` is not valid MQ4 grammar.
 * This list is the exact complement of desktop: narrower than 64rem, or a coarse pointer, or no pointer.
 */
export const MOTION_QUERIES: Record<MotionMode, string> = {
  desktop: `(width >= 64rem) and (pointer: fine) and ${NO_PREF}`,
  touch: [
    `${NO_PREF} and (width < 64rem)`,
    `${NO_PREF} and (pointer: coarse)`,
    `${NO_PREF} and (pointer: none)`,
  ].join(', '),
  reduced: '(prefers-reduced-motion: reduce)',
};

/** Pure: pass `(q) => window.matchMedia(q).matches` in the browser, a stub in tests. */
export function detectMotionMode(matches: (query: string) => boolean): MotionMode {
  if (matches(MOTION_QUERIES.reduced)) return 'reduced';
  if (matches(MOTION_QUERIES.desktop)) return 'desktop';
  return 'touch';
}

/** `<html lang>` → content language. */
export function langOf(tag: string | null | undefined): Lang {
  return (tag ?? '').toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

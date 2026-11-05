import type { HTMLAttributes, ReactNode } from 'react';

/**
 * The reveal vocabulary the motion layer understands (src/motion/reveals.ts). Content is ALWAYS visible in the
 * rendered HTML; the motion layer sets a from-state only on elements that start below the fold, then settles them
 * with expo-out when they enter. Reduced motion and no-JS show the final state.
 *
 * - rise:    text blocks and cards: 28 px up + fade (touch: 16 px).
 * - mask:    photographs: the frame opens bottom-up (clip-path), the image settles from 1.06 scale. The "hoist".
 * - stagger: a list or grid: its direct children rise one after another (40 ms apart, capped at 8).
 * - fade:    opacity only, for things that must not move (tables, forms).
 *
 * Budget (v2 floor §16.4): one reveal pattern per section, never on every heading, never on the hero (it has its own
 * intro), never on the RequestBar or anything sticky.
 */
export type RevealKind = 'rise' | 'mask' | 'stagger' | 'fade';
export const REVEAL_KINDS: readonly RevealKind[] = ['rise', 'mask', 'stagger', 'fade'];

/** Spread onto any element: `<ul {...reveal('stagger')}>`. `delay` in ms, for a second element in the same section. */
export function reveal(kind: RevealKind, delay?: number): Record<string, string> {
  return delay ? { 'data-reveal': kind, 'data-reveal-delay': String(delay) } : { 'data-reveal': kind };
}

export interface RevealProps extends HTMLAttributes<HTMLElement> {
  kind?: RevealKind;
  delay?: number;
  as?: 'div' | 'section' | 'ul' | 'ol' | 'figure' | 'p';
  children: ReactNode;
}

/** Wrapper form of reveal(). Prefer the spread on an element you already render. */
export function Reveal({ kind = 'rise', delay, as: Tag = 'div', children, ...rest }: RevealProps) {
  return (
    <Tag {...rest} {...reveal(kind, delay)}>
      {children}
    </Tag>
  );
}

/** Desktop pointer only: the element leans up to 6 px toward the cursor. Primary CTAs only (v2 floor §16.16). */
export const magnetic = { 'data-magnetic': '' } as const;

/** Desktop only: media inside a .frame drifts with scroll (scale 1.08 -> 1, scrubbed). One per section. */
export const parallax = { 'data-parallax': '' } as const;

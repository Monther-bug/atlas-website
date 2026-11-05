import { useRef } from 'react';
import { useIsoLayoutEffect } from './util';

export const FLIP_MS = 480;
export const FLIP_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Pure: the inverse transform that puts an element back where it was (First minus Last). */
export function invert(first: { left: number; top: number }, last: { left: number; top: number }): string | null {
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  return Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 ? null : `translate(${dx}px, ${dy}px)`;
}

/**
 * FLIP reflow for a list that filters or reorders (crane cards under type chips, gallery tabs). Children carry
 * `data-flip-id`; when `key` changes, each child that stayed slides from its old position to its new one and each
 * new child fades up. Web Animations API only (no GSAP in the main bundle). Reduced motion or no `animate`: nothing
 * moves, the new layout simply appears.
 */
export function useFlip(container: { current: HTMLElement | null }, key: unknown): void {
  const rects = useRef(new Map<string, { left: number; top: number }>());
  useIsoLayoutEffect(() => {
    const el = container.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>(':scope > [data-flip-id]'));
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const prev = rects.current;
    const next = new Map<string, { left: number; top: number }>();
    for (const item of items) {
      const r = item.getBoundingClientRect();
      const id = item.dataset.flipId ?? '';
      next.set(id, { left: r.left, top: r.top });
      if (reduced || typeof item.animate !== 'function' || prev.size === 0) continue;
      const before = prev.get(id);
      if (before) {
        const from = invert(before, { left: r.left, top: r.top });
        if (from) item.animate([{ transform: from }, { transform: 'none' }], { duration: FLIP_MS, easing: FLIP_EASE });
      } else {
        item.animate([{ opacity: 0, transform: 'translateY(12px) scale(0.98)' }, { opacity: 1, transform: 'none' }], {
          duration: FLIP_MS,
          easing: FLIP_EASE,
        });
      }
    }
    rects.current = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

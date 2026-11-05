import { useEffect, useLayoutEffect, useState } from 'react';

/** Joins class names, dropping empty parts. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** useLayoutEffect in the browser, useEffect in the Node prerender (no warning, same markup). */
export const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Fills `{key}` placeholders (same grammar as the copy deck). */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Live `prefers-reduced-motion: reduce`. False during the prerender and the first client render (no mismatch). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);
  return reduced;
}

/**
 * Measures `target()` inside `container` (offsetLeft/offsetWidth, physical px from the container's left edge, so it
 * works the same in RTL) and re-measures on resize and once fonts load. Returns null until the first measurement.
 */
export function useMeasure(
  container: { current: HTMLElement | null },
  target: () => HTMLElement | null,
  deps: readonly unknown[],
): { x: number; w: number } | null {
  const [box, setBox] = useState<{ x: number; w: number } | null>(null);
  useIsoLayoutEffect(() => {
    const el = container.current;
    if (!el) return;
    const measure = () => {
      const t = target();
      if (!t) return;
      setBox((prev) => (prev && prev.x === t.offsetLeft && prev.w === t.offsetWidth ? prev : { x: t.offsetLeft, w: t.offsetWidth }));
    };
    measure();
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    ro?.observe(el);
    let alive = true;
    void document.fonts?.ready.then(() => alive && measure());
    return () => {
      alive = false;
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return box;
}

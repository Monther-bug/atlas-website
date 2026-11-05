import { useEffect } from 'react';

/** Must equal MOTION_QUERIES.reduced in mode.ts (index.test.tsx checks it); this file imports only React. */
const REDUCED = '(prefers-reduced-motion: reduce)';

type Start = () => () => void;

/**
 * Starts a motion layer once, after hydration (contract C10). `load` imports the page's motion chunk and returns its
 * start function (the home page: ./core; a crane page: ./crane).
 * Only React is imported at top level, so this file is safe in the Node prerender.
 * GSAP, Lenis and every timeline arrive in the lazy chunk, which reduced-motion visitors never download unless they
 * turn reduced motion off while the page is open. `idle`: wait for an idle moment before loading (a page whose first
 * screen needs no motion code, so the chunk never competes with the first paint or input).
 */
export function useMotionLayer(load: () => Promise<Start>, { idle = false }: { idle?: boolean } = {}): void {
  useEffect(() => {
    const root = document.documentElement;
    let stop: (() => void) | undefined;
    let unlisten: (() => void) | undefined;
    let cancelled = false;
    let idleId: number | undefined;

    const run = () => {
      load()
        .then((start) => {
          if (!cancelled) stop = start();
        })
        .catch((error: unknown) => {
          console.error('[motion]', error);
          // Un-hide the intro now, instead of waiting for the 3 s CSS fallback.
          if (!cancelled) root.dataset.motion = 'reduced';
        });
    };
    const begin = () => {
      if (!idle) return run();
      if (typeof window.requestIdleCallback === 'function') idleId = window.requestIdleCallback(run, { timeout: 1500 });
      else idleId = window.setTimeout(run, 200);
    };

    const reduced = window.matchMedia?.(REDUCED);
    if (reduced?.matches) {
      root.dataset.motion = 'reduced'; // the final state React rendered; no chunk needed
      const onChange = (event: { matches: boolean }) => {
        if (event.matches) return;
        unlisten?.();
        unlisten = undefined;
        run(); // the chunk's own matchMedia takes over from here
      };
      reduced.addEventListener('change', onChange);
      unlisten = () => reduced.removeEventListener('change', onChange);
    } else {
      begin();
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) {
        if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId);
        window.clearTimeout(idleId);
      }
      unlisten?.();
      stop?.();
    };
    // `load` is a module-level function on every page; the layer starts once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

const loadCore = () => import('./core').then((m) => m.startMotion);

/** The home page's motion layer (./core). */
export function useSiteMotion(): void {
  useMotionLayer(loadCore);
}

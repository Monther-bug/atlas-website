import { useEffect } from 'react';

/** Must equal MOTION_QUERIES.reduced in mode.ts (index.test.tsx checks it); this file imports only React. */
const REDUCED = '(prefers-reduced-motion: reduce)';

/**
 * Starts the motion layer once, after hydration (contract C10).
 * Only React is imported at top level, so this file is safe in the Node prerender.
 * GSAP, Lenis and every timeline arrive in the separate `core` chunk, which reduced-motion
 * visitors never download unless they turn reduced motion off while the page is open.
 */
export function useSiteMotion(): void {
  useEffect(() => {
    const root = document.documentElement;
    let stop: (() => void) | undefined;
    let unlisten: (() => void) | undefined;
    let cancelled = false;

    const load = () => {
      import('./core')
        .then(({ startMotion }) => {
          if (!cancelled) stop = startMotion();
        })
        .catch((error: unknown) => {
          console.error('[motion]', error);
          // Un-hide the intro now, instead of waiting for the 3 s CSS fallback.
          if (!cancelled) root.dataset.motion = 'reduced';
        });
    };

    const reduced = window.matchMedia?.(REDUCED);
    if (reduced?.matches) {
      root.dataset.motion = 'reduced'; // the final state React rendered; no core needed
      const onChange = (event: { matches: boolean }) => {
        if (event.matches) return;
        unlisten?.();
        unlisten = undefined;
        load(); // core's own matchMedia takes over from here
      };
      reduced.addEventListener('change', onChange);
      unlisten = () => reduced.removeEventListener('change', onChange);
    } else {
      load();
    }

    return () => {
      cancelled = true;
      unlisten?.();
      stop?.();
    };
  }, []);
}

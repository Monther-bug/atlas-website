import type Lenis from 'lenis';
import type { Lang } from '@/content/types';

export type Dispose = () => void;
export const noop: Dispose = () => {};

export interface MotionEnv {
  lang: Lang;
  rtl: boolean;
  /**
   * True when motion started more than 2.8 s after navigation: the 3 s CSS failsafe in motion.css has
   * revealed the hero, or is about to. Intro modules (D.3) then skip their from-states and leave the hero
   * as rendered instead of hiding it again. Never true while the first-visit curtain still covers the page
   * (loader.ts): the hero has not been seen, and its intro waits for the lift. Computed once, in startMotion(); a context that re-runs later
   * (a resize across the breakpoint) gets the same value, so a module that must not replay keeps its own flag.
   */
  late: boolean;
}

/** One motion feature. Finds its own targets, returns a cleanup that restores React's DOM. */
export type MotionModule = (env: MotionEnv) => Dispose;

/** The desktop Lenis instance (null on touch and reduced). */
export const lenisRef: { current: Lenis | null } = { current: null };

/** Runs cleanups in reverse order of creation; one failing cleanup never blocks the others. */
export function runAll(disposers: Dispose[]): void {
  for (const dispose of [...disposers].reverse()) {
    try {
      dispose();
    } catch (error) {
      console.error('[motion]', error);
    }
  }
}

/** A module that throws is logged and skipped. The content is already visible without it. */
export function safely(module: MotionModule, env: MotionEnv): Dispose {
  try {
    return module(env);
  } catch (error) {
    console.error('[motion]', error);
    return noop;
  }
}

/** Calls `run` once, when `el` comes within one viewport of the screen (C10). */
export function whenNear(el: Element, run: () => void): Dispose {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        io.disconnect();
        run();
      }
    },
    { rootMargin: '100% 0px' },
  );
  io.observe(el);
  return () => io.disconnect();
}

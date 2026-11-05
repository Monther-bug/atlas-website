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

type GlideTarget = Parameters<Lenis['scrollTo']>[0];
type GlideOptions = NonNullable<Parameters<Lenis['scrollTo']>[1]>;

/** The in-page glide in flight (a nav link, back to top), so a module that changes the page's height can re-aim it. */
export const glideRef: { current: { target: GlideTarget; options: GlideOptions } | null } = { current: null };

/**
 * Glides to an in-page target with Lenis and remembers it until it lands. Lenis measures an element target once, when
 * the glide starts; if the layout above it changes mid-flight (the Hoist stage is built when it comes near), the
 * module that changed it calls reaimGlide() and the glide lands where the target now is.
 */
export function glide(lenis: Lenis, target: GlideTarget, options: GlideOptions = {}): void {
  const entry = { target, options };
  glideRef.current = entry;
  // The visitor taking over (wheel, touch, a press, a key) ends the glide's claim on the page.
  const inputs = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
  const opts = { capture: true, passive: true } as const;
  const release = () => {
    if (glideRef.current === entry) glideRef.current = null;
    for (const type of inputs) window.removeEventListener(type, release, opts);
  };
  for (const type of inputs) window.addEventListener(type, release, opts);
  lenis.scrollTo(target, {
    ...options,
    onComplete: (instance) => {
      release();
      options.onComplete?.(instance);
    },
  });
}

/** After a layout change: re-aim the glide in flight at its target's new position. False when nothing was gliding. */
export function reaimGlide(lenis: Lenis): boolean {
  const g = glideRef.current;
  if (!g) return false;
  // Sync Lenis with the scroll position the browser kept (scroll anchoring), then glide on from there.
  lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  glide(lenis, g.target, g.options);
  return true;
}

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

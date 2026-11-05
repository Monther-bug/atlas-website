import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { startLenis } from './lenis';
import { MOTION_QUERIES, detectMotionMode, langOf, type MotionMode } from './mode';
import { startBackToTop } from './rope';
import { startMagnetic, startRevealsDesktop, startRevealsTouch, startTickers } from './reveals';
import { noop, runAll, safely, type Dispose, type MotionEnv, type MotionModule } from './shared';

/**
 * Motion for the crane pages (/cranes/<id>/), loaded on idle (src/crane-page/CraneApp.tsx). The hero's entrance is
 * CSS and needs none of this (crane-page.css). Here: the figures tick and their meters fill as they come into view,
 * sections rise or fade in (data-reveal), the primary CTA leans toward the pointer and Lenis glides (desktop), the
 * footer's back-to-top hoists. None of the home page's modules (hero, hoist, lineup, WebGL) are in this chunk.
 * Reduced motion never loads it: the page is already in its final state.
 */

/** Meters ([data-meter], a fill whose width is its share of the largest of the five) grow from zero once, in view. */
export const startMeters: MotionModule = () => {
  const meters = Array.from(document.querySelectorAll<HTMLElement>('[data-meter]')).filter((el) => el.getBoundingClientRect().top > window.innerHeight);
  if (meters.length === 0) return noop;
  const ctx = gsap.context(() => {
    gsap.set(meters, { scaleX: 0 });
  });
  const triggers = meters.map((el, i) =>
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => ctx.add(() => gsap.to(el, { scaleX: 1, duration: 1.1, ease: 'expo.out', delay: Math.min(i % 5, 4) * 0.06 })),
    }),
  );
  return () => {
    triggers.forEach((t) => t.kill());
    ctx.revert();
  };
};

const DESKTOP: MotionModule[] = [startLenis, startRevealsDesktop, startTickers, startMeters, startMagnetic, startBackToTop];
const TOUCH: MotionModule[] = [startRevealsTouch, startTickers, startMeters, startBackToTop];

function setMode(mode: MotionMode): void {
  document.documentElement.dataset.motion = mode;
}

function run(modules: MotionModule[], env: MotionEnv): Dispose {
  const disposers = modules.map((module) => safely(module, env));
  return () => runAll(disposers);
}

export function startCraneMotion(): Dispose {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const root = document.documentElement;
  const env: MotionEnv = { lang: langOf(root.lang), rtl: root.dir === 'rtl', late: false };
  setMode(detectMotionMode((query) => window.matchMedia(query).matches));
  const mm = gsap.matchMedia();
  try {
    mm.add(MOTION_QUERIES.desktop, () => {
      setMode('desktop');
      return run(DESKTOP, env);
    });
    mm.add(MOTION_QUERIES.touch, () => {
      setMode('touch');
      return run(TOUCH, env);
    });
    mm.add(MOTION_QUERIES.reduced, () => {
      setMode('reduced');
    });
  } catch (error) {
    mm.revert();
    throw error;
  }
  return () => {
    mm.revert();
    delete root.dataset.motion;
  };
}

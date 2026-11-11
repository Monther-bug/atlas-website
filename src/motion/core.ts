import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { startRide } from './ride';
import { MOTION_QUERIES, detectMotionMode, langOf, type MotionMode } from './mode';
import { startServiceArt } from './services';
import { startWhyBars, startWhyStepsDesktop, startWhyStepsTouch } from './why';
import { startBackToTop, startProgressRope } from './rope';
import { startLenis } from './lenis';
import { noop, runAll, safely, whenNear, type Dispose, type MotionEnv, type MotionModule } from './shared';
import { heroIntro } from './hero';
import { afterLoader, loaderShowing } from './loader';
import { startMagnetic, startParallax, startRevealsDesktop, startRevealsTouch, startTickers } from './reveals';
import { startAboutDesktop, startAboutTouch } from './about';
import { startSitesLoopDesktop, startSitesLoopTouch, startSitesSlidesDesktop, startSitesSlidesTouch } from './sites';

/** Motion that starts later than this (ms after navigation) finds the hero already revealed by the CSS failsafe. */
const LATE_MS = 2800;

/**
 * The Hoist chunk loads when #cranes is within one viewport (C10): the sticky stage on desktop, the load
 * stack on touch. whenNear's own cleanup only disconnects its observer, so this also drops a late import
 * and disposes what the chunk started.
 */
function hoistLazy(kind: 'desktop' | 'touch'): MotionModule {
  return (env) => {
    const section = document.querySelector<HTMLElement>('[data-hoist]');
    if (!section) return noop;
    let dispose: Dispose = noop;
    let alive = true;
    const stop = whenNear(section, () => {
      import('./hoist')
        .then((m) => {
          if (!alive) return;
          try {
            dispose = kind === 'desktop' ? m.hoistDesktop(section, env.lang, env.rtl) : m.hoistTouch(section, env.lang);
          } catch (error) {
            console.error('[motion] hoist', error);
          }
        })
        .catch((error: unknown) => console.error('[motion] hoist', error));
    });
    return () => {
      alive = false;
      stop();
      dispose();
      dispose = noop;
    };
  };
}

/**
 * The «اعثر على رافعتك» lineup chunk (card entrance and tickers, Flip reflow on filter, the segmented thumb, desktop
 * photo drift) loads when #crane-list is within one viewport, like the Hoist. The section's own live DOM arrives
 * from a lazy island; the chunk binds to it on the island's 'mount' event. Cleanup drops a late import.
 */
function lineupLazy(kind: 'desktop' | 'touch'): MotionModule {
  return (env) => {
    const section = document.getElementById('crane-list');
    if (!section) return noop;
    let dispose: Dispose = noop;
    let alive = true;
    const stop = whenNear(section, () => {
      import('./lineup')
        .then((m) => {
          if (!alive) return;
          try {
            dispose = m.lineupMotion(section, kind, env);
          } catch (error) {
            console.error('[motion] lineup', error);
          }
        })
        .catch((error: unknown) => console.error('[motion] lineup', error));
    });
    return () => {
      alive = false;
      stop();
      dispose();
      dispose = noop;
    };
  };
}

/**
 * The hero intro waits for the first-visit curtain (loader.ts): it starts the moment the hook lifts it, or at once when
 * there is none. One wrapped module for both contexts.
 */
const heroIntroAfterLoader = afterLoader(heroIntro);

/** Desktop context. Order matters: Lenis first, then the hero intro (it must set its from-states in this same task). */
const DESKTOP: MotionModule[] = [
  startLenis,
  heroIntroAfterLoader,
  startProgressRope,
  // Services + Why Atlas (v2): line drawings, capacity bars, the scrubbed process line.
  startServiceArt,
  startWhyBars,
  startWhyStepsDesktop,
  startBackToTop,
  startRide,
  hoistLazy('desktop'),
  lineupLazy('desktop'),
  // v2 shared hooks (reveals.ts): no-ops until a section renders data-reveal / data-ticker / data-magnetic / data-parallax.
  startRevealsDesktop,
  startTickers,
  startMagnetic,
  startParallax,
  // S.about: About statement highlight (scrubbed); On site cards stagger, then the strip drifts in a loop (drag, wheel, paddles).
  startAboutDesktop,
  startSitesSlidesDesktop,
  startSitesLoopDesktop,
];

/** Touch context: no Lenis, no sticky stage, one-shot reveals. */
const TOUCH: MotionModule[] = [
  heroIntroAfterLoader,
  startServiceArt,
  startWhyBars,
  startWhyStepsTouch,
  startBackToTop,
  startRide,
  hoistLazy('touch'),
  lineupLazy('touch'),
  startRevealsTouch,
  startTickers,
  // S.about: About statement highlight (one pass); On site cards stagger.
  startAboutTouch,
  startSitesSlidesTouch,
  startSitesLoopTouch,
];

function setMode(mode: MotionMode): void {
  document.documentElement.dataset.motion = mode;
}

function run(modules: MotionModule[], env: MotionEnv): Dispose {
  const disposers = modules.map((module) => safely(module, env));
  return () => runAll(disposers);
}

export function startMotion(): Dispose {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const root = document.documentElement;
  // Under the first-visit curtain the hero has not been seen yet, so a start after LATE_MS is not late: the intro waits
  // for the lift instead (afterLoader).
  const env: MotionEnv = { lang: langOf(root.lang), rtl: root.dir === 'rtl', late: performance.now() > LATE_MS && !loaderShowing() };

  // Set the mode before any context runs. The CSS pre-hide stops here, so every module
  // that wants a from-state sets it synchronously, in this same task, before the next paint.
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
      setMode('reduced'); // no timelines: React already rendered the final state
    });
  } catch (error) {
    // Undo any context that already ran (Lenis, listeners); index.ts then marks the page reduced.
    mm.revert();
    throw error;
  }

  return () => {
    mm.revert();
    delete root.dataset.motion;
  };
}

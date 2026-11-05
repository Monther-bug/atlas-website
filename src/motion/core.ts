import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import Lenis from 'lenis';
import { startRide } from './ride';
import { MOTION_QUERIES, detectMotionMode, langOf, type MotionMode } from './mode';
import { startServiceSetDown, startServiceSlings } from './reveal';
import { startBackToTop, startProgressRope } from './rope';
import { lenisRef, noop, runAll, safely, whenNear, type Dispose, type MotionEnv, type MotionModule } from './shared';
import { heroDock, heroIntro } from './hero';
import { startMagnetic, startParallax, startRevealsDesktop, startRevealsTouch, startTickers } from './reveals';
import { startAboutDesktop, startAboutTouch } from './about';
import { startSitesDrag, startSitesDrift, startSitesSlidesDesktop, startSitesSlidesTouch } from './sites';

/** Motion that starts later than this (ms after navigation) finds the hero already revealed by the CSS failsafe. */
const LATE_MS = 2800;

/**
 * In-page links glide with Lenis. Lenis's own `anchors` option is not used: it ignores clicks that a
 * component already handled (the form's error-summary links call preventDefault() and focus a field),
 * and then scrolls back from a stale position. The browser still follows the link (hash, :target,
 * focus starting point); Lenis only animates the scroll, and applies scroll-padding-top itself.
 */
function glideToAnchors(lenis: Lenis): Dispose {
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
    if (!link?.hash) return;
    let target = link.hash;
    try {
      target = decodeURIComponent(target);
    } catch {
      // A malformed escape: use the hash as written.
    }
    lenis.scrollTo(target);
  };
  window.addEventListener('click', onClick);
  return () => window.removeEventListener('click', onClick);
}

/** No smooth scroll runs under a native <dialog> (menu, lightbox): stop Lenis while any is open. */
function pauseUnderDialogs(lenis: Lenis): Dispose {
  const sync = () => (document.querySelector('dialog[open]') ? lenis.stop() : lenis.start());
  const observer = new MutationObserver(sync);
  observer.observe(document.body, { subtree: true, attributeFilter: ['open'] });
  sync();
  return () => observer.disconnect();
}

/** Smooth scroll, desktop only, driven by GSAP's ticker so ScrollTrigger stays in sync (spec §7). */
const startLenis: MotionModule = () => {
  const lenis = new Lenis({
    autoRaf: false,
    lerp: 0.085,
    // Menus and the lightbox are native <dialog>s: let them scroll natively.
    prevent: (node) => node.closest('dialog') !== null,
  });
  const onTick = (time: number) => lenis.raf(time * 1000);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(onTick);
  gsap.ticker.lagSmoothing(0);
  lenisRef.current = lenis;
  const stopAnchors = glideToAnchors(lenis);
  const stopDialogs = pauseUnderDialogs(lenis);
  return () => {
    stopDialogs();
    stopAnchors();
    gsap.ticker.remove(onTick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
    if (lenisRef.current === lenis) lenisRef.current = null;
  };
};

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

/** Desktop context. Order matters: Lenis first, then the hero intro (it must set its from-states in this same task). */
const DESKTOP: MotionModule[] = [
  startLenis,
  heroIntro,
  heroDock,
  startProgressRope,
  startServiceSetDown,
  startServiceSlings,
  startBackToTop,
  startRide,
  hoistLazy('desktop'),
  // v2 shared hooks (reveals.ts): no-ops until a section renders data-reveal / data-ticker / data-magnetic / data-parallax.
  startRevealsDesktop,
  startTickers,
  startMagnetic,
  startParallax,
  // S.about: About statement highlight (scrubbed); On site cards stagger, strip drift and mouse drag.
  startAboutDesktop,
  startSitesSlidesDesktop,
  startSitesDrift,
  startSitesDrag,
];

/** Touch context: no Lenis, no sticky stage, one-shot reveals. */
const TOUCH: MotionModule[] = [
  heroIntro,
  heroDock,
  startServiceSetDown,
  startBackToTop,
  startRide,
  hoistLazy('touch'),
  startRevealsTouch,
  startTickers,
  // S.about: About statement highlight (one pass); On site cards stagger.
  startAboutTouch,
  startSitesSlidesTouch,
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
  const env: MotionEnv = { lang: langOf(root.lang), rtl: root.dir === 'rtl', late: performance.now() > LATE_MS };

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

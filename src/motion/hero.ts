import { gsap } from 'gsap';
import { startLiveHook } from './hero-live';
import { noop, type Dispose, type MotionModule } from './shared';

/**
 * Heroes whose intro has played (or was skipped). The intro plays once per page load and never again
 * after a context switch (a resize across 64rem re-runs the context with the same hero element).
 */
const played = new WeakSet<Element>();
/** The running intro, so scrolling can finish it first. */
let introTimeline: gsap.core.Timeline | null = null;

/** Jumps a running intro to its end state (all visible, at rest). Safe to call at any time. */
export function finishIntro(): void {
  introTimeline?.progress(1);
}

/**
 * Hero intro, direction B "The Luff" (docs/reviews/hero-concepts.md §4). Desktop and touch contexts.
 * The H1 is never moved or hidden (it is the LCP element), the photo never moves.
 * - 0.15–1.25: the cut luffs down on the hook side, from half-raked (`--luff` 0.5 on the field wrapper) to its full
 *   rake. Still by 1.25 s.
 * Nothing hangs from the hook (client, 11 Nov 2026): the WhatsApp load, its sling, their pay-out and swing, and the
 * dock into the request bar are gone; the bar carries WhatsApp past the hero.
 * Under the first-visit loader, core.ts runs this through afterLoader (loader.ts): it starts as the curtain lifts.
 * Desktop adds the scroll (the cut closes over the photo) and, after the intro, the live hook (hero-live.ts: the real
 * rope's cursor pendulum in the lazy WebGL depth layer).
 */
export const heroIntro: MotionModule = (env) => {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return noop;
  const field = hero.querySelector<HTMLElement>('[data-hero-field]');
  const rig = hero.querySelector<HTMLElement>('[data-hero-rig]');
  const desktop = document.documentElement.dataset.motion === 'desktop';
  const disposers: Dispose[] = [];

  // Late start: the 3 s CSS fallback has shown everything already, so never hide it again (core.ts does not count a
  // start under the loader's curtain as late). Already played: a context re-run must not replay it.
  const skip = played.has(hero) || env.late;
  played.add(hero);

  const ctx = gsap.context(() => {
    if (!skip && field) {
      const tl = gsap.timeline({
        onComplete: () => {
          if (introTimeline === tl) introTimeline = null;
        },
      });
      introTimeline = tl;
      // Dev server only: lets the review storyboard seek the intro (docs/reviews/v2-hero). Folded away in production.
      if (import.meta.env.DEV) (window as unknown as { __heroIntro?: gsap.core.Timeline }).__heroIntro = tl;
      // 0.5 matches the from-state motion.css sets before this runs, so the hand-over does not jump.
      tl.fromTo(field, { '--luff': 0.5 }, { '--luff': 1, duration: 1.1, ease: 'power2.inOut', immediateRender: true }, 0.15);
    }

    // Scroll (desktop): as the hero leaves, the cut closes over the photo and the hero becomes the ground of the next
    // section (the second half of the hero's scroll, as when the load rose first).
    if (desktop && field) {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
            onUpdate: (self) => {
              if (self.progress > 0) finishIntro();
            },
          },
        })
        .fromTo(field, { '--close': 0 }, { '--close': 1, ease: 'none', duration: 0.5, immediateRender: false }, 0.5);
    }
  });

  // Desktop, after the intro: the live hook (cursor pendulum, hero-live.ts) and, from there, the WebGL depth layer
  // (hero-gl.ts, its own lazy chunk, fetched on idle).
  if (desktop && rig) {
    let stopLive: Dispose = noop;
    let alive = true;
    const begin = () => {
      if (alive) stopLive = startLiveHook(hero, rig, env);
    };
    const tl = introTimeline;
    if (tl && tl.progress() < 1) tl.eventCallback('onComplete', () => {
      if (introTimeline === tl) introTimeline = null;
      begin();
    });
    else begin();
    disposers.push(() => {
      alive = false;
      stopLive();
    });
  }

  return () => {
    for (const dispose of disposers.splice(0)) dispose();
    introTimeline = null;
    ctx.revert();
  };
};

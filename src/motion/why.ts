import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { noop, type MotionModule } from './shared';

/**
 * Why Atlas (src/sections/WhyAtlas.tsx):
 * - startWhyBars: the capacity bars grow from the inline start, 80 ms apart, once the list enters.
 * - startWhySteps: the process line. Desktop scrubs it with scroll (the line fills as the steps pass through the
 *   viewport, and each step lights up when the fill reaches it); touch plays it once on entry.
 * The rendered state is final (every bar full, every step reached). From-states are set only when the target starts
 * below the fold, and cleanup restores the rendered DOM. Reduced motion never loads this file.
 */

const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight;

/**
 * Pure: at overall progress `p` (0..1) through `steps` steps, how full each connector is (0..1) and which steps are
 * reached. Step 1 is always reached; step i is reached when the connector before it is (nearly) full.
 */
export function stepProgress(p: number, steps: number): { fills: number[]; reached: boolean[] } {
  const n = Math.max(1, Math.floor(steps));
  const segments = Math.max(1, n - 1);
  const x = (Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : 1) * segments;
  return {
    fills: Array.from({ length: n - 1 }, (_, i) => Math.min(1, Math.max(0, x - i))),
    reached: Array.from({ length: n }, (_, i) => x >= i - 0.02),
  };
}

export const startWhyBars: MotionModule = ({ rtl }) => {
  const list = document.querySelector<HTMLElement>('[data-why-bars]');
  if (!list || !below(list)) return noop;
  const bars = Array.from(list.querySelectorAll<HTMLElement>('[data-why-bar]'));
  if (bars.length === 0) return noop;
  let done = false;
  const ctx = gsap.context(() => {
    gsap.set(bars, { scaleX: 0, transformOrigin: rtl ? '100% 50%' : '0% 50%' });
  });
  const play = (fast = false) => {
    if (done) return;
    done = true;
    ctx.add(() => {
      gsap.to(bars, { scaleX: 1, duration: fast ? 0.4 : 1.1, ease: 'expo.out', stagger: fast ? 0 : 0.08, delay: fast ? 0 : 0.25 });
    });
  };
  const trigger = ScrollTrigger.create({ trigger: list, start: 'top 85%', once: true, onEnter: () => play() });
  const finishPassed = () => {
    if (!done && list.getBoundingClientRect().top < window.innerHeight * 0.85) play(true);
  };
  ScrollTrigger.addEventListener('refresh', finishPassed);
  return () => {
    ScrollTrigger.removeEventListener('refresh', finishPassed);
    trigger.kill();
    ctx.revert();
  };
};

function makeSteps(mode: 'desktop' | 'touch'): MotionModule {
  return ({ rtl }) => {
    const list = document.querySelector<HTMLElement>('[data-why-steps]');
    if (!list || !below(list)) return noop;
    const steps = Array.from(list.querySelectorAll<HTMLElement>('[data-why-step]'));
    const fills = Array.from(list.querySelectorAll<HTMLElement>('[data-why-fill]'));
    if (steps.length < 2) return noop;

    const apply = (p: number) => {
      const { fills: amount, reached } = stepProgress(p, steps.length);
      fills.forEach((fill, i) => {
        const track = fill.parentElement;
        // Horizontal from md (a row of four), vertical on phones: read it from the track, so a resize just works.
        const horizontal = !track || track.offsetWidth >= track.offsetHeight;
        fill.style.transformOrigin = horizontal ? (rtl ? '100% 50%' : '0% 50%') : '50% 0%';
        fill.style.transform = horizontal ? `scaleX(${amount[i] ?? 1})` : `scaleY(${amount[i] ?? 1})`;
      });
      steps.forEach((step, i) => step.toggleAttribute('data-todo', !reached[i]));
    };
    const state = { p: 0 };
    apply(0);

    let tween: gsap.core.Tween | null = null;
    let trigger: ScrollTrigger | null = null;
    let finishPassed: (() => void) | null = null;
    if (mode === 'desktop') {
      tween = gsap.to(state, {
        p: 1,
        ease: 'none',
        onUpdate: () => apply(state.p),
        scrollTrigger: { trigger: list, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
      });
    } else {
      let played = false;
      const play = (fast = false) => {
        if (played) return;
        played = true;
        tween = gsap.to(state, { p: 1, duration: fast ? 0.3 : 1.8, ease: 'power1.inOut', onUpdate: () => apply(state.p) });
      };
      trigger = ScrollTrigger.create({ trigger: list, start: 'top 85%', once: true, onEnter: () => play() });
      finishPassed = () => {
        if (!played && list.getBoundingClientRect().top < window.innerHeight * 0.85) play(true);
      };
      ScrollTrigger.addEventListener('refresh', finishPassed);
    }

    return () => {
      if (finishPassed) ScrollTrigger.removeEventListener('refresh', finishPassed);
      trigger?.kill();
      tween?.scrollTrigger?.kill();
      tween?.kill();
      fills.forEach((fill) => {
        fill.style.removeProperty('transform');
        fill.style.removeProperty('transform-origin');
      });
      steps.forEach((step) => step.removeAttribute('data-todo'));
    };
  };
}

export const startWhyStepsDesktop: MotionModule = makeSteps('desktop');
export const startWhyStepsTouch: MotionModule = makeSteps('touch');

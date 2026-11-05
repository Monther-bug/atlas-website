import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatNumber } from '@/lib/numbers';
import { noop, type Dispose, type MotionModule } from './shared';

/**
 * v2 shared motion (docs/superpowers/specs/2026-11-05-atlas-v2-design.md §9). Four hooks, each driven by a data
 * attribute that src/components/ui renders:
 *   [data-reveal]   startReveals   desktop + touch   one-shot entrances for elements that start below the fold
 *   [data-ticker]   startTickers   desktop + touch   numbers count up once when they enter view
 *   [data-magnetic] startMagnetic  desktop only      primary CTAs lean toward the pointer (max 6 px)
 *   [data-parallax] startParallax  desktop only      media inside a frame settles from 1.08 scale as it scrolls by
 * Reduced motion never loads this file (motion/index.ts). Every module leaves React's DOM as rendered on cleanup.
 */

/** Distance and duration per context: touch moves less and finishes sooner. */
export const REVEAL_TUNING = {
  desktop: { rise: 28, duration: 0.9 },
  touch: { rise: 16, duration: 0.6 },
} as const;
export const STAGGER_S = 0.04;
export const STAGGER_CAP = 8;

/** Pure: the from-state for one reveal kind (exported for tests). */
export function fromState(kind: string, rise: number): gsap.TweenVars | null {
  switch (kind) {
    case 'rise':
      return { y: rise, opacity: 0 };
    case 'fade':
      return { opacity: 0 };
    case 'mask':
      return { clipPath: 'inset(100% 0% 0% 0%)' };
    default:
      return null;
  }
}

/** Pure: stagger delays, 40 ms apart, capped so a long list never waits more than 8 steps. */
export function staggerDelay(index: number): number {
  return Math.min(index, STAGGER_CAP) * STAGGER_S;
}

const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight;

function makeReveals(mode: keyof typeof REVEAL_TUNING): MotionModule {
  return () => {
    const { rise, duration } = REVEAL_TUNING[mode];
    const all = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    // Only elements that start below the fold get a from-state: anything already on screen stays as rendered.
    const targets = all.filter(below);
    if (targets.length === 0) return noop;
    const done = new Set<HTMLElement>();

    const ctx = gsap.context(() => {
      for (const el of targets) {
        const kind = el.dataset.reveal ?? 'rise';
        if (kind === 'stagger') {
          gsap.set(Array.from(el.children), { y: rise, opacity: 0 });
        } else if (kind === 'mask') {
          gsap.set(el, fromState('mask', rise) ?? {});
          const media = el.querySelector('img, video, picture');
          if (media) gsap.set(media, { scale: 1.06 });
        } else {
          const from = fromState(kind, rise);
          if (from) gsap.set(el, from);
        }
      }
    });

    const play = (el: HTMLElement, fast = false) => {
      if (done.has(el)) return;
      done.add(el);
      const kind = el.dataset.reveal ?? 'rise';
      const delay = fast ? 0 : Number(el.dataset.revealDelay ?? 0) / 1000;
      const d = fast ? 0.4 : duration;
      ctx.add(() => {
        if (kind === 'stagger') {
          gsap.to(Array.from(el.children), { y: 0, opacity: 1, duration: d, ease: 'expo.out', delay, stagger: (i) => staggerDelay(i), overwrite: true });
        } else if (kind === 'mask') {
          gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: d * 1.15, ease: 'expo.out', delay, overwrite: true });
          const media = el.querySelector('img, video, picture');
          if (media) gsap.to(media, { scale: 1, duration: d * 1.4, ease: 'expo.out', delay, overwrite: true });
        } else {
          gsap.to(el, { y: 0, opacity: 1, duration: d, ease: 'expo.out', delay, overwrite: true });
        }
      });
    };

    const triggers = targets.map((el) =>
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => play(el) }),
    );
    // Safety net: anything whose trigger is already behind us (anchor jump, resize) settles quickly instead of staying hidden.
    const finishPassed = () => {
      for (const el of targets) {
        if (!done.has(el) && el.getBoundingClientRect().top < window.innerHeight * 0.88) play(el, true);
      }
    };
    ScrollTrigger.addEventListener('refresh', finishPassed);

    return () => {
      ScrollTrigger.removeEventListener('refresh', finishPassed);
      triggers.forEach((t) => t.kill());
      ctx.revert();
    };
  };
}

export const startRevealsDesktop: MotionModule = makeReveals('desktop');
export const startRevealsTouch: MotionModule = makeReveals('touch');

/** Numbers count from data-ticker-from to data-ticker once, when they enter view. Text is aria-hidden (Stat). */
export const startTickers: MotionModule = ({ lang }) => {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-ticker]'));
  if (els.length === 0) return noop;
  const finals = new Map(els.map((el) => [el, el.textContent ?? '']));
  const tweens: gsap.core.Tween[] = [];
  const triggers = els.map((el) => {
    const to = Number(el.dataset.ticker);
    const from = Number(el.dataset.tickerFrom ?? 0);
    const decimals = Number(el.dataset.tickerDecimals ?? 0);
    if (!Number.isFinite(to) || !Number.isFinite(from)) return null;
    const write = (n: number) => {
      // D-notes #1: formatNumber throws on NaN/Infinity; only ever pass finite values.
      if (Number.isFinite(n)) el.textContent = formatNumber(n, lang, { maximumFractionDigits: decimals });
    };
    return ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        const state = { n: from };
        write(from);
        tweens.push(
          gsap.to(state, {
            n: to,
            duration: 1.2,
            ease: 'expo.out',
            onUpdate: () => write(decimals > 0 ? state.n : Math.round(state.n)),
            onComplete: () => write(to),
          }),
        );
      },
    });
  });
  return () => {
    triggers.forEach((t) => t?.kill());
    tweens.forEach((t) => t.kill());
    finals.forEach((text, el) => {
      el.textContent = text;
    });
  };
};

/** Pure: the pull toward the pointer, clamped to `max` px on each axis. */
export function magneticOffset(dx: number, dy: number, strength = 0.25, max = 6): { x: number; y: number } {
  const clamp = (v: number) => Math.max(-max, Math.min(max, v * strength));
  return { x: clamp(dx), y: clamp(dy) };
}

export const startMagnetic: MotionModule = () => {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'));
  if (els.length === 0) return noop;
  const offs: Dispose[] = els.map((el) => {
    const toX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'expo.out' });
    const toY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'expo.out' });
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const { x, y } = magneticOffset(event.clientX - (r.left + r.width / 2), event.clientY - (r.top + r.height / 2));
      toX(x);
      toY(y);
    };
    const leave = () => {
      toX(0);
      toY(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: 'transform' });
    };
  });
  return () => offs.forEach((off) => off());
};

export const startParallax: MotionModule = () => {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (els.length === 0) return noop;
  const ctx = gsap.context(() => {
    for (const el of els) {
      gsap.fromTo(
        el,
        { scale: 1.08 },
        { scale: 1, ease: 'none', scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
      );
    }
  });
  return () => ctx.revert();
};

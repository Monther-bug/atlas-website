import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { noop, type MotionModule } from './shared';

/**
 * About Atlas (v2): the statement is read as you scroll. Every word starts in a quiet grey and lights up in brand
 * navy in reading order, and the logo badge gains its colour with the first words (Apple-style text highlight).
 *
 * The rendered HTML is the final state (all navy). The quiet grey is neutral-500, 3.45:1 on white: the statement is
 * large text (30 px and up), so even the start of the highlight passes WCAG AA, and nothing is ever hidden.
 *   desktop  scrubbed to the scroll: the words follow the reader down the paragraph.
 *   touch    one pass when the statement enters (no scrubbed effects on touch, v2 spec §9).
 *   reduced  never runs (core does not load).
 */
export const ABOUT_SCRUB = { start: 'top 85%', end: 'bottom 55%' } as const;

/** Pure: when word `index` of `count` starts and how long it takes, as fractions of the highlight (0..1). */
export function wordWindow(index: number, count: number, overlap = 4): { at: number; span: number } {
  if (count <= 0) return { at: 0, span: 1 };
  const span = Math.min(1, overlap / (count + overlap - 1));
  const step = count > 1 ? (1 - span) / (count - 1) : 0;
  return { at: index * step, span };
}

function color(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function targets() {
  const root = document.querySelector<HTMLElement>('[data-about-statement]');
  if (!root) return null;
  const words = Array.from(root.querySelectorAll<HTMLElement>('[data-about-word]'));
  const badge = root.querySelector<HTMLElement>('[data-about-badge]');
  return words.length ? { root, words, badge } : null;
}

export const startAboutDesktop: MotionModule = () => {
  const t = targets();
  if (!t) return noop;
  const quiet = color('--color-neutral-500', '#8a8a8a');
  const lit = color('--color-brand', '#23207a');
  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: t.root, start: ABOUT_SCRUB.start, end: ABOUT_SCRUB.end, scrub: 0.6 },
    });
    t.words.forEach((word, i) => {
      const { at, span } = wordWindow(i, t.words.length);
      tl.fromTo(word, { color: quiet }, { color: lit, duration: span }, at);
    });
    if (t.badge) tl.fromTo(t.badge, { opacity: 0.35, filter: 'grayscale(1)' }, { opacity: 1, filter: 'grayscale(0)', duration: 0.2 }, 0);
  });
  return () => ctx.revert();
};

export const startAboutTouch: MotionModule = () => {
  const t = targets();
  // One pass, and only when the statement starts below the fold: anything already on screen stays as rendered.
  if (!t || t.root.getBoundingClientRect().top <= window.innerHeight) return noop;
  const quiet = color('--color-neutral-500', '#8a8a8a');
  const lit = color('--color-brand', '#23207a');
  const ctx = gsap.context(() => {
    gsap.set(t.words, { color: quiet });
    if (t.badge) gsap.set(t.badge, { opacity: 0.35, filter: 'grayscale(1)' });
  });
  const trigger = ScrollTrigger.create({
    trigger: t.root,
    start: 'top 80%',
    once: true,
    onEnter: () =>
      ctx.add(() => {
        gsap.to(t.words, { color: lit, duration: 0.5, ease: 'power2.out', stagger: { amount: 1.1 } });
        if (t.badge) gsap.to(t.badge, { opacity: 1, filter: 'grayscale(0)', duration: 0.6, ease: 'expo.out' });
      }),
  });
  return () => {
    trigger.kill();
    ctx.revert();
  };
};

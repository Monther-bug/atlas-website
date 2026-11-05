import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { REVEAL_TUNING, staggerDelay } from './reveals';
import { noop, runAll, type Dispose, type MotionModule } from './shared';

/**
 * On site gallery (v2 spec §9.4: "first slides stagger"; the brief's subtle scroll-linked motion on desktop).
 *   startSitesSlides  desktop + touch  the cards in view rise one after another when the strip enters (once)
 *   startSitesDrift   desktop          the strip drifts in from the end of the reading direction and settles on the
 *                                      page grid as the section comes up (scrubbed, at most 6 % of its width)
 *   startSitesDrag    desktop          a mouse can drag the strip sideways; snapping resumes on release
 * The section clips horizontal overflow, so the drift never makes the page scroll sideways.
 */
export const SITES_DRIFT_PERCENT = 6;
const SLIDES_IN_VIEW = 4;

function strip(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-sites-strip]');
}

function makeSlides(mode: keyof typeof REVEAL_TUNING): MotionModule {
  return () => {
    const el = strip();
    if (!el || el.getBoundingClientRect().top <= window.innerHeight) return noop; // already on screen: leave it
    const { rise, duration } = REVEAL_TUNING[mode];
    const cards = Array.from(el.querySelectorAll<HTMLElement>('.ui-carousel__track > li')).slice(0, SLIDES_IN_VIEW);
    if (cards.length === 0) return noop;
    const ctx = gsap.context(() => gsap.set(cards, { y: rise, opacity: 0 }));
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () =>
        ctx.add(() => gsap.to(cards, { y: 0, opacity: 1, duration, ease: 'expo.out', stagger: (i) => staggerDelay(i) * 2 })),
    });
    return () => {
      trigger.kill();
      ctx.revert();
    };
  };
}

export const startSitesSlidesDesktop: MotionModule = makeSlides('desktop');
export const startSitesSlidesTouch: MotionModule = makeSlides('touch');

export const startSitesDrift: MotionModule = ({ rtl }) => {
  const el = strip();
  const section = el?.closest('section');
  if (!el || !section) return noop;
  const ctx = gsap.context(() => {
    gsap.fromTo(
      el,
      { xPercent: rtl ? -SITES_DRIFT_PERCENT : SITES_DRIFT_PERCENT },
      { xPercent: 0, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 20%', scrub: 0.6 } },
    );
  });
  return () => ctx.revert();
};

/** Pure: past this many px of pointer travel a press is a drag, and the click that ends it must not open a photo. */
export const DRAG_SLOP = 6;

export const startSitesDrag: MotionModule = () => {
  const el = strip();
  if (!el) return noop;
  let drag: { id: number; x: number; left: number; track: HTMLElement; moved: boolean } | null = null;
  const down = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const track = (event.target as Element | null)?.closest<HTMLElement>('.ui-carousel__track');
    if (!track) return;
    drag = { id: event.pointerId, x: event.clientX, left: track.scrollLeft, track, moved: false };
  };
  const move = (event: PointerEvent) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < DRAG_SLOP) return;
    if (!drag.moved) {
      drag.moved = true;
      el.dataset.dragging = '';
      drag.track.setPointerCapture?.(event.pointerId);
    }
    // scrollLeft is physical (negative in RTL), so the same subtraction follows the pointer in both directions.
    drag.track.scrollLeft = drag.left - dx;
  };
  const up = (event: PointerEvent) => {
    if (!drag || drag.id !== event.pointerId) return;
    const { moved, track } = drag;
    drag = null;
    if (!moved) return;
    delete el.dataset.dragging; // snapping returns and settles the strip on the nearest card
    track.releasePointerCapture?.(event.pointerId);
    // The click that ends a drag lands on a card: swallow it once.
    const swallow = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    el.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => el.removeEventListener('click', swallow, { capture: true }), 0);
  };
  const noDrag = (event: DragEvent) => event.preventDefault(); // images would start a native drag-and-drop
  const offs: Dispose[] = [
    () => el.removeEventListener('pointerdown', down),
    () => el.removeEventListener('dragstart', noDrag),
    () => window.removeEventListener('pointermove', move),
    () => window.removeEventListener('pointerup', up),
    () => window.removeEventListener('pointercancel', up),
    () => delete el.dataset.dragging,
  ];
  el.addEventListener('pointerdown', down);
  el.addEventListener('dragstart', noDrag);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  return () => runAll(offs);
};

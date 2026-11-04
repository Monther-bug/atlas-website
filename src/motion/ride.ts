import { gsap } from 'gsap';
import { HOOK_EVENT, type HookEventDetail } from '@/lib/request';
import { makeGhost } from './ghost';
import { centerOn } from './math';
import type { MotionModule } from './shared';

/** How many frames to wait for React to render the bar chip. */
const MAX_FRAMES = 10;

/** "Request this crane": a ghost of the model chip rides the hook from the card button into the bar. */
export const startRide: MotionModule = () => {
  let ghost: HTMLElement | null = null;
  let flight: gsap.core.Timeline | null = null;
  let chipShown: HTMLElement | null = null;
  let frame = 0;

  /** Ends any flight: kills the tween, removes the ghost, shows the real chip. Safe to call at any time. */
  const land = () => {
    flight?.kill();
    flight = null;
    ghost?.remove();
    ghost = null;
    if (chipShown) gsap.set(chipShown, { clearProps: 'opacity' });
    chipShown = null;
  };

  const fly = (chip: HTMLElement, from: DOMRect) => {
    land();
    const to = chip.getBoundingClientRect();
    const start = centerOn(from, to);
    const g = makeGhost(chip, start);
    g.classList.add('motion-ghost--chip');
    ghost = g;
    chipShown = chip;
    gsap.set(chip, { opacity: 0 });
    flight = gsap
      .timeline({ onComplete: land })
      .to(g, { x: to.left - start.left, duration: 0.7, ease: 'power2.inOut' }, 0)
      .to(g, { y: to.top - start.top, duration: 0.7, ease: 'power2.in' }, 0)
      .fromTo(g, { scale: 1.06 }, { scale: 1, duration: 0.7, ease: 'expo.out' }, 0);
  };

  const onHook = (event: Event) => {
    const { craneId, source } = (event as CustomEvent<HookEventDetail>).detail;
    cancelAnimationFrame(frame);
    land(); // a newer press or a clear always ends the previous flight first
    if (!craneId || !source || !source.isConnected) return;
    const from = source.getBoundingClientRect();
    let tries = 0;
    // Poll up to 10 frames: React normally renders the chip on the next one.
    const waitForChip = () => {
      const chip = document.querySelector<HTMLElement>('[data-bar-chip]');
      if (chip && chip.getBoundingClientRect().width > 0) {
        fly(chip, from);
        return;
      }
      if (++tries < MAX_FRAMES) frame = requestAnimationFrame(waitForChip);
    };
    frame = requestAnimationFrame(waitForChip);
  };

  window.addEventListener(HOOK_EVENT, onHook);
  return () => {
    window.removeEventListener(HOOK_EVENT, onHook);
    cancelAnimationFrame(frame);
    land();
  };
};

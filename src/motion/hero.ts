import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { makeGhost } from './ghost';
import { flightDelta, type Rect } from './math';
import { noop, type MotionModule } from './shared';

/**
 * Heroes whose intro has played (or was skipped). The intro plays once per page load and never again
 * after a context switch (a resize across 64rem re-runs the context with the same hero element).
 */
const played = new WeakSet<Element>();
/** The running intro, so the dock (D.4) can finish it before measuring the button. */
let introTimeline: gsap.core.Timeline | null = null;

/** Jumps a running intro to its end state (all visible, at rest). Safe to call at any time. */
export function finishIntro(): void {
  introTimeline?.progress(1);
}

/** The hero's sling overlay that is laid out at this width (Part C renders one per crop and hides the other). */
export function visibleSling(hero: ParentNode): SVGSVGElement | null {
  return Array.from(hero.querySelectorAll<SVGSVGElement>('svg[data-sling]')).find((svg) => svg.getBoundingClientRect().width > 0) ?? null;
}

/** Draw a sling leg from whichever end is higher on screen: that end is on the hook. */
function drawFrom(leg: SVGPathElement): string {
  if (typeof leg.getTotalLength !== 'function') return '0% 0%';
  const length = leg.getTotalLength();
  const start = leg.getPointAtLength(0);
  const end = leg.getPointAtLength(length);
  return start.y <= end.y ? '0% 0%' : '100% 100%';
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/** Everything is still by this time (spec §5.2), counted from the start of the intro. */
const STILL_BY = 1.95;
const H1_START = 0.35;
const H1_DURATION = 0.9;
const H1_STAGGER = 0.1;
/** Split the H1 after this long even if fonts are not ready (autoSplit re-splits when they arrive). */
const FONT_WAIT_MS = 800;

/**
 * Hero, first 2 s (concept §2 table, spec §5.2). Desktop and touch contexts.
 * Transform and opacity only. The hero <img> (LCP) is never hidden: only its <picture> scales,
 * inside the photo box's own overflow clip, and the sling overlay scales about the same point.
 * Geometry is read from real rects (the photo box can be taller than 74svh, and the sling holder is
 * clamped inside the photo), so the swing pivots on the hook pin at every width.
 */
export const heroIntro: MotionModule = ({ lang, late }) => {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return noop;
  // Late start: the 3 s CSS fallback has shown everything already, so never hide it again.
  // Already played: a context that re-runs after a resize must not replay it either.
  if (played.has(hero) || late) {
    played.add(hero);
    return noop;
  }
  played.add(hero);

  const picture = hero.querySelector<HTMLElement>('[data-hero-photo] > *');
  const sling = visibleSling(hero);
  const legs = sling ? Array.from(sling.querySelectorAll<SVGPathElement>('[data-sling-leg]')) : [];
  const pin = sling?.querySelector<SVGCircleElement>('[data-hook-pin]') ?? null;
  const button = hero.querySelector<HTMLElement>('[data-sling-button]');
  const h1 = hero.querySelector<HTMLElement>('[data-split]');
  const intro = Array.from(hero.querySelectorAll<HTMLElement>('[data-intro]'));

  // Measure now: data-motion is already set, so the CSS pre-scale is gone and nothing is transformed yet.
  let svgOrigin: string | null = null;
  let buttonOrigin: string | null = null;
  if (pin) {
    const cx = pin.getAttribute('cx');
    const cy = pin.getAttribute('cy');
    if (cx && cy) svgOrigin = `${cx} ${cy}`;
    const hook = pin.getBoundingClientRect();
    const b = button?.getBoundingClientRect();
    if (b && b.width > 0 && hook.width > 0) {
      buttonOrigin = `${hook.left + hook.width / 2 - b.left}px ${hook.top + hook.height / 2 - b.top}px`;
    }
  }

  let split: SplitText | null = null;
  let cancelled = false;
  const startedAt = performance.now();

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (introTimeline === tl) introTimeline = null;
      },
    });
    introTimeline = tl;

    // 0.00–2.00 The photo settles inside its frame; the sling overlay settles about the same point,
    // so the legs stay on the real hook.
    const settle = [picture, sling].filter((el): el is HTMLElement | SVGSVGElement => el !== null);
    if (settle.length) {
      tl.fromTo(settle, { scale: 1.05, transformOrigin: '50% 100%' }, { scale: 1, duration: STILL_BY, ease: 'expo.out', immediateRender: true }, 0);
    }

    // 0.15–0.85 The sling legs pay out downward from the hook, like rope running off a drum.
    if (legs.length) {
      gsap.set(legs, { opacity: 0 });
      tl.set(legs, { opacity: 1 }, 0.15);
      for (const leg of legs) {
        tl.fromTo(leg, { drawSVG: drawFrom(leg) }, { drawSVG: '0% 100%', duration: 0.7, ease: 'power2.in', immediateRender: true }, 0.15);
      }
    }

    // 0.80–1.20 The button settles onto the sling ends (tappable throughout)…
    if (button) {
      tl.fromTo(button, { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'expo.out', immediateRender: true }, 0.8);
      // …1.20–1.70 then one damped swing about the hook pin. Capped at one cycle (concept risk 2).
      const swing = { keyframes: { rotation: [0, 4, -2.5, 1, 0], easeEach: 'sine.inOut' }, duration: 0.5, ease: 'none' };
      if (buttonOrigin) {
        gsap.set(button, { transformOrigin: buttonOrigin });
        tl.to(button, swing, 1.2);
      }
      if (svgOrigin && legs.length) {
        gsap.set(legs, { svgOrigin });
        tl.to(legs, swing, 1.2);
      }
    }

    // 1.10–1.75 The services line and "Browse cranes" rise.
    if (intro.length) {
      tl.fromTo(intro, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.08, immediateRender: true }, 1.1);
    }

    // The H1 stays transparent until it is split (CSS hid it before data-motion). Opacity only, never
    // visibility: the heading stays in the accessibility tree the whole time.
    if (h1) gsap.set(h1, { opacity: 0 });
  });

  // 0.35–1.25 The H1 rises in masked lines once fonts are ready (spec §7).
  if (h1) {
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    void Promise.race([fontsReady, wait(FONT_WAIT_MS)]).then(() => {
      if (cancelled) return;
      try {
        ctx.add(() => {
          split = SplitText.create(h1, {
            type: lang === 'ar' ? 'lines,words' : 'lines', // never chars: Arabic letters must stay joined
            linesClass: 'split-line',
            mask: 'lines',
            autoSplit: true,
            onSplit(self) {
              gsap.set(h1, { opacity: 1 });
              const start = Math.max(H1_START, (performance.now() - startedAt) / 1000);
              const stagger = self.lines.length > 1 ? H1_STAGGER : 0;
              const room = STILL_BY - start - stagger * (self.lines.length - 1);
              return gsap.from(self.lines, {
                yPercent: 105,
                duration: Math.max(0.4, Math.min(H1_DURATION, room)),
                ease: 'expo.out',
                stagger,
                delay: Math.max(0, H1_START - (performance.now() - startedAt) / 1000),
                // Hand the H1 back to React's plain markup: no masks left to clip Arabic marks.
                onComplete: () => {
                  split?.revert();
                  split = null;
                },
              });
            },
          });
        });
      } catch (error) {
        console.error('[motion]', error);
        split?.revert();
        split = null;
        gsap.set(h1, { clearProps: 'opacity' });
      }
    });
  }

  return () => {
    cancelled = true;
    introTimeline = null;
    split?.revert();
    split = null;
    ctx.revert();
  };
};

/** The bar's WhatsApp button, if it is laid out. */
function barWhatsapp(): HTMLElement | null {
  const el = document.querySelector<HTMLElement>('[data-bar-whatsapp]');
  return el && el.getBoundingClientRect().width > 0 ? el : null;
}

const FLIGHT = 0.6;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  left: lerp(a.left, b.left, t),
  top: lerp(a.top, b.top, t),
  width: lerp(a.width, b.width, t),
  height: lerp(a.height, b.height, t),
});

/**
 * On scroll past the hero, the WhatsApp button "is set down where it will stay" (spec §5.2): a ghost of the
 * sling button flies into the bar's WhatsApp button, and the bar button pulses once. Scrolling back reverses it.
 * No React node moves; only the inert clone flies. Landing targets are read live every frame, so the flight
 * lands on the button while the page keeps scrolling (Lenis glide, touch momentum), in either direction and
 * either reading direction (the bar's WhatsApp sits at the inline end: bottom-left in RTL on desktop).
 *
 * While docked the sling button is transparent and ignores the pointer, but it stays in the accessibility
 * tree and in the tab order: a screen reader gets the same page, and keyboard focus shows it again
 * (the :focus-within rule in motion.css).
 */
export const heroDock: MotionModule = () => {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const button = hero?.querySelector<HTMLElement>('[data-sling-button]') ?? null;
  if (!hero || !button) return noop;

  let docked = false;
  let armed = false;
  let ghost: HTMLElement | null = null;
  let flight: gsap.core.Tween | null = null;
  let pulse: gsap.core.Tween | null = null;

  const land = () => {
    flight?.kill();
    flight = null;
    ghost?.remove();
    ghost = null;
  };
  const clearBar = (bar: HTMLElement) => gsap.set(bar, { clearProps: 'transform,translate,rotate,scale' });
  const hideButton = () => gsap.set(button, { opacity: 0, pointerEvents: 'none' });
  const showButton = () => gsap.set(button, { clearProps: 'opacity,pointerEvents' });

  /** Flies a ghost of the sling button between two live rects; `fade` maps time progress to its opacity. */
  const fly = (from: () => Rect, to: () => Rect, fade: (t: number) => number, onDone: () => void) => {
    const start = from();
    const g = makeGhost(button, start);
    g.style.transformOrigin = '0 0';
    ghost = g;
    const state = { p: 0 };
    flight = gsap.to(state, {
      p: 1,
      duration: FLIGHT,
      ease: 'power2.inOut',
      onUpdate() {
        const d = flightDelta(start, lerpRect(from(), to(), state.p));
        g.style.transform = `translate(${d.x}px, ${d.y}px) scale(${d.scaleX}, ${d.scaleY})`;
        g.style.opacity = String(fade(this.progress()));
      },
      onComplete: () => {
        land();
        onDone();
      },
    });
  };

  const dock = (animate: boolean) => {
    if (docked) return;
    docked = true;
    land();
    finishIntro(); // measure the button at rest, never mid-swing
    const bar = barWhatsapp();
    // The ghost lifts off where the button is now and flies in viewport space: it no longer rides the page.
    const from = button.getBoundingClientRect();
    hideButton();
    if (!animate || !bar || from.width === 0) return;
    fly(() => from, () => bar.getBoundingClientRect(), (t) => (t < 0.75 ? 1 : (1 - t) / 0.25), () => {
      pulse?.kill();
      pulse = gsap.to(bar, {
        keyframes: { scale: [1, 1.08, 1], easeEach: 'power2.inOut' },
        duration: 0.36,
        ease: 'none',
        onComplete: () => clearBar(bar),
      });
    });
  };

  const undock = (animate: boolean) => {
    if (!docked) return;
    docked = false;
    land();
    const bar = barWhatsapp();
    // The target is read live: the sling button (still laid out while transparent) moves with the page.
    const live = () => button.getBoundingClientRect();
    if (!animate || !bar || live().width === 0) {
      showButton();
      return;
    }
    fly(() => bar.getBoundingClientRect(), live, (t) => Math.min(1, t / 0.25), showButton);
  };

  const st = ScrollTrigger.create({
    trigger: hero,
    start: 'bottom 65%',
    end: 'max',
    onEnter: () => dock(armed),
    onLeaveBack: () => undock(armed),
  });
  // Loaded (or the context re-entered after a resize) past the hero: hide the sling button without a flight.
  // progress, not isActive: at the very bottom of the page the trigger is past its end and no longer active.
  if (st.progress > 0) dock(false);
  const frame = requestAnimationFrame(() => {
    armed = true;
  });

  return () => {
    cancelAnimationFrame(frame);
    st.kill();
    land();
    pulse?.kill();
    pulse = null;
    gsap.set(button, { clearProps: 'opacity,pointerEvents' });
    const bar = document.querySelector<HTMLElement>('[data-bar-whatsapp]');
    if (bar) clearBar(bar);
  };
};

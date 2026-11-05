import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { makeGhost } from './ghost';
import { flightDelta, type Rect } from './math';
import { startLiveHook } from './hero-live';
import { noop, type Dispose, type MotionModule } from './shared';

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

/** The two heights (left, right edge, px) of a field polygon's top edge, as the browser resolved its clip-path. */
function cutHeights(el: Element | null): [number, number] | null {
  const cp = el ? getComputedStyle(el).clipPath : '';
  const open = cp.indexOf('(');
  if (open < 0) return null;
  const pts = cp.slice(open + 1, cp.lastIndexOf(')')).split(',').map((p) => p.trim().split(/\s+/));
  const yl = parseFloat(pts[0]?.[1] ?? '');
  const yr = parseFloat(pts[1]?.[1] ?? '');
  return Number.isFinite(yl) && Number.isFinite(yr) ? [yl, yr] : null;
}

/**
 * The luff the intro starts from: as low as 0.5 (half-raked), but never so flat that the navy plane covers the raised
 * load and the real hook above it. Solved on the measured final cut (luff 1): the cut's height at the load's corner
 * on the far side is linear in the luff, so the smallest safe value is one division.
 */
export function startLuff(hero: HTMLElement, load: HTMLElement, drop: number): number {
  const cut = cutHeights(hero.querySelector('.hero-field--accent'));
  const box = hero.getBoundingClientRect();
  if (!cut || box.width === 0) return 0.5;
  const [yl, yr] = cut.map((y) => y + box.top);
  const near = Math.max(yl, yr);
  const far = Math.min(yl, yr);
  if (near - far < 1) return 0.5;
  const b = load.getBoundingClientRect();
  const target = b.bottom - drop * 0.85 + 12; // the raised load's bottom, plus a margin
  // the far-side corner of the load, as a fraction of the way from the far edge to the near edge
  const t = yr > yl ? (b.left - box.left) / box.width : 1 - (b.right - box.left) / box.width;
  const need = t > 0 ? (target - far) / ((near - far) * t) : 1;
  return Math.min(1, Math.max(0.5, need));
}

/** One damped swing about the hook: the rig is a zero-size box on the hook, so rotating it swings the load. */
const swing = (degrees: number) => ({
  keyframes: { rotation: [0, degrees, -degrees * 0.58, degrees * 0.24, 0], easeEach: 'sine.inOut' },
  ease: 'none',
});

/**
 * Hero intro, direction B "The Luff" (docs/reviews/hero-concepts.md §4). Desktop and touch contexts.
 * The H1 is never moved or hidden (it is the LCP element), the photo never moves.
 * - 0.00: the cut is part-raked (startLuff: 0.5 or as much more as keeps the raised load and the real hook clear);
 *   the load hangs close under the hook.
 * - 0.15–1.25: the cut luffs down on the hook side to its full rake (`--luff` on the field wrapper) while the hook
 *   line pays out (legs 0.15 → 1) and the WhatsApp load lowers into the sky the cut has just opened.
 * - 1.25–1.85: one damped swing about the hook. Still by 1.85 s.
 * Under the first-visit loader, core.ts runs this through afterLoader (loader.ts): it starts as the curtain lifts.
 * Desktop adds the scroll hoist (A's move) and, after the intro, the live hook (hero-live.ts: cursor pendulum and
 * the lazy WebGL depth layer).
 */
export const heroIntro: MotionModule = (env) => {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return noop;
  const field = hero.querySelector<HTMLElement>('[data-hero-field]');
  const rig = hero.querySelector<HTMLElement>('[data-hero-rig]');
  const legs = hero.querySelector<SVGSVGElement>('svg[data-sling]');
  const load = hero.querySelector<HTMLElement>('[data-hero-load]');
  const desktop = document.documentElement.dataset.motion === 'desktop';
  const drop = legs?.getBoundingClientRect().height || 0;
  const disposers: Dispose[] = [];

  // Late start: the 3 s CSS fallback has shown everything already, so never hide it again (core.ts does not count a
  // start under the loader's curtain as late). Already played: a context re-run must not replay it.
  const skip = played.has(hero) || env.late;
  played.add(hero);

  const ctx = gsap.context(() => {
    if (!skip && field && legs && load && rig && drop > 0) {
      const tl = gsap.timeline({
        onComplete: () => {
          if (introTimeline === tl) introTimeline = null;
        },
      });
      introTimeline = tl;
      // Dev server only: lets the review storyboard seek the intro (docs/reviews/v2-hero). Folded away in production.
      if (import.meta.env.DEV) (window as unknown as { __heroIntro?: gsap.core.Timeline }).__heroIntro = tl;
      const from = startLuff(hero, load, drop);
      tl.fromTo(field, { '--luff': from }, { '--luff': 1, duration: 1.1, ease: 'power2.inOut', immediateRender: true }, 0.15);
      tl.fromTo(legs, { scaleY: 0.15 }, { scaleY: 1, duration: 1.1, ease: 'power2.inOut', immediateRender: true }, 0.15);
      tl.fromTo(load, { y: -drop * 0.85 }, { y: 0, duration: 1.1, ease: 'power2.inOut', immediateRender: true }, 0.15);
      tl.to(rig, { ...swing(3), duration: 0.6 }, 1.25);
    }

    // Scroll (desktop): the hoist. The load rises to the hook as the hero leaves (it docks into the bar at the dock
    // line, heroDock); then the cut closes over the photo and the hero becomes the ground of the next section.
    if (desktop && field && legs && load && drop > 0) {
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
        .fromTo(legs, { scaleY: 1 }, { scaleY: 0.3, ease: 'none', duration: 0.4, immediateRender: false }, 0)
        .fromTo(load, { y: 0 }, { y: -drop * 0.7, ease: 'none', duration: 0.4, immediateRender: false }, 0)
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

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { REVEAL_TUNING, staggerDelay } from './reveals';
import { noop, type MotionModule } from './shared';
import { LOOP, clamp, copiesNeeded, easeToward, skewFor, wrapPhase } from './sites-loop';

/**
 * On site gallery (v2 spec §9.4: "first slides stagger"; the owner's "make the images moving").
 *   startSitesSlides  desktop + touch  the cards in view rise one after another when the strip enters (once)
 *   startSitesLoop    desktop + touch  the strip drifts by itself in a seamless loop: copies of the cards, ONE
 *                                      transform on the track per frame, no per-card work, no scroll listeners.
 * The frame loop exists only while something moves: it stops completely when the strip is off screen, the tab is
 * hidden, the lightbox is open, the pointer hovers, keyboard focus is in the strip or the visitor pressed Pause.
 * Reduced motion never starts it (the static scroll-snap strip stays).
 */
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

const STORE = 'atlas-sites-motion';
const storedOff = (): boolean => {
  try {
    return sessionStorage.getItem(STORE) === 'off';
  } catch {
    return false;
  }
};

const BUTTON = (li: Element | null) => li?.querySelector<HTMLElement>('button[data-photo]') ?? null;

/**
 * The drift loop. DOM: [one set of copies][the 12 real cards][enough copies to fill the width]; the track is moved by
 * ONE translate (plus, on desktop, a lean while the speed changes). Phase p (px, reading direction) wraps at one
 * period, which shows the identical picture. Copies are aria-hidden, tab-less, share the photo URLs (lazy; the
 * browser fetches each file once) and a click on one is handed to its real card. Everything stops (no frame loop) when
 * nothing moves. Reading direction: content travels towards the START edge and new photos enter from the END edge,
 * exactly what the "Next" paddle does (Arabic: left to right).
 */
function makeLoop(mode: 'desktop' | 'touch'): MotionModule {
  return ({ rtl }) => {
    const el = strip();
    const section = el?.closest('section');
    const viewport = el?.querySelector<HTMLElement>('.sites-viewport');
    if (!el || !section || !viewport) return noop;
    const root = el as HTMLElement & { sitesOrigin?: (photo: string) => HTMLElement | null };
    const toggle = el.querySelector<HTMLButtonElement>('[data-sites-motion]');
    const toggleLabel = toggle?.querySelector('.sr-only') ?? null;
    const pauseText = toggleLabel?.textContent ?? '';
    const paddles = Array.from(el.querySelectorAll<HTMLButtonElement>('.ui-carousel__controls > button[aria-controls="sites-track"]'));
    const s = rtl ? 1 : -1; // physical sign of the track's translate

    let ul: HTMLElement | null = null;
    let originals: HTMLElement[] = [];
    let all: HTMLElement[] = [];
    let n = 0;
    let step = 0;
    let cardW = 0;
    let pad = 0;
    let period = 0;
    let width = 0;
    let dpr = 1;
    let cruise = 0; // px/s
    let p = 0;
    let v = 0;
    let pending = 0;
    let tau = LOOP.stop as number;
    let skew = 0;
    let last = 0;
    let frame = 0;
    let state = '';
    let mirror: HTMLElement | null = null;
    let userPaused = storedOff();
    let visible = false;
    let hover = false;
    let focusHold = false;
    let holding = false;
    let drag: { id: number; x: number; u: number; moved: boolean; samples: { t: number; u: number }[] } | null = null;

    const lightboxOpen = () => !!section.querySelector('dialog[open]');
    const paused = () => userPaused || hover || focusHold || holding || !visible || document.hidden || lightboxOpen();

    const render = () => {
      if (!ul) return;
      const x = Math.round(s * (period + p) * dpr) / dpr;
      ul.style.transform = skew ? `translate3d(${x}px,0,0) skewX(${skew}deg)` : `translate3d(${x}px,0,0)`;
    };

    const setState = (next: string) => {
      if (state === next) return;
      state = next;
      el.dataset.loopState = next;
    };

    const tick = (now: number) => {
      frame = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const hold = !visible || document.hidden;
      const target = paused() ? 0 : cruise;
      if (hold) {
        v = 0;
        pending = 0;
      }
      if (!drag?.moved) {
        let t: number = target > 0 ? LOOP.resume : LOOP.stop;
        if (tau === LOOP.fling) {
          if (Math.abs(v - target) < 25) tau = LOOP.stop;
          else t = LOOP.fling;
        }
        v = easeToward(v, target, dt, t);
        const g = Math.abs(pending) < 0.4 ? pending : pending * (1 - Math.exp(-dt / 0.14));
        pending -= g;
        p = wrapPhase(p + v * dt + g, period);
      }
      skew = mode === 'desktop' && !hold ? Number(skewFor(v, target).toFixed(2)) : 0;
      if (Math.abs(skew) < 0.06) skew = 0;
      render();
      const settled = !drag?.moved && target === 0 && Math.abs(v) < 1 && pending === 0 && skew === 0;
      if (settled) {
        v = 0;
        last = 0;
        setState('paused');
        syncMirror();
        return;
      }
      setState('running');
      frame = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!frame && ul) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    /** The copy of card k nearest the middle: its index among all cards and its offset from the middle (px, forward positive). */
    const nearest = (k: number) => {
      let best = { c: 1, d: Infinity };
      for (let c = 0; c < all.length / n; c++) {
        const d = pad + (c * n + k) * step + cardW / 2 - (period + p) - width / 2;
        if (Math.abs(d) < Math.abs(best.d)) best = { c, d };
      }
      return best;
    };
    const fits = (d: number) => Math.abs(d) <= width / 2 - cardW / 2 - 8;
    const syncMirror = () => {
      mirror?.classList.remove('is-mirror');
      mirror = null;
      const li = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>('li');
      const k = li && !li.hasAttribute('data-clone') ? originals.indexOf(li) : -1;
      if (!li || k < 0) return;
      const { c } = nearest(k);
      if (c !== 1) {
        mirror = all[c * n + k] ?? null;
        mirror?.classList.add('is-mirror');
      }
    };

    const build = (fresh: boolean) => {
      const next = viewport.querySelector<HTMLElement>('#sites-track');
      if (!next) return;
      const ratio = !fresh && period ? p / period : 0;
      ul = next;
      ul.querySelectorAll('li[data-clone]').forEach((c) => c.remove());
      el.dataset.loop = mode;
      ul.removeAttribute('tabindex');
      originals = Array.from(ul.children) as HTMLElement[];
      n = originals.length;
      if (n === 0) return;
      const a = originals[0] as HTMLElement;
      const b = originals[1];
      step = b ? Math.abs(b.offsetLeft - a.offsetLeft) : a.offsetWidth;
      cardW = a.offsetWidth;
      pad = parseFloat(getComputedStyle(ul).paddingInlineStart) || 0;
      period = n * step;
      width = viewport.clientWidth;
      dpr = window.devicePixelRatio || 1;
      cruise = (step * LOOP.cards) / LOOP.seconds;
      const copy = () => {
        const f = document.createDocumentFragment();
        for (const li of originals) {
          const c = li.cloneNode(true) as HTMLElement;
          c.dataset.clone = '';
          c.setAttribute('aria-hidden', 'true');
          c.removeAttribute('style');
          c.querySelectorAll('[data-testid]').forEach((x) => x.removeAttribute('data-testid'));
          c.querySelectorAll('button').forEach((x) => x.setAttribute('tabindex', '-1'));
          f.append(c);
        }
        return f;
      };
      const sets = copiesNeeded(width, period);
      ul.prepend(copy());
      for (let i = 2; i < sets; i++) ul.append(copy());
      all = Array.from(ul.children) as HTMLElement[];
      p = wrapPhase(ratio * period, period);
      mirror = null;
      for (const x of paddles) x.removeAttribute('aria-disabled');
      render();
      if (fresh && state) ul.animate?.([{ opacity: 0, translate: '0 16px' }, { opacity: 1, translate: '0 0' }], { duration: 480, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
      kick();
    };

    const nudge = (dir: 1 | -1) => {
      pending += dir * step;
      kick();
    };

    const updateToggle = () => {
      if (!toggle) return;
      toggle.dataset.state = userPaused ? 'paused' : 'playing';
      if (toggleLabel) toggleLabel.textContent = userPaused ? (toggle.dataset.play ?? pauseText) : pauseText;
    };

    // ── pointer: drag / swipe with momentum, hover pause ──
    const down = (e: PointerEvent) => {
      if (drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
      drag = { id: e.pointerId, x: e.clientX, u: p, moved: false, samples: [] };
      holding = true;
    };
    const move = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < LOOP.slop) return;
        drag.moved = true;
        el.dataset.dragging = '';
        viewport.setPointerCapture?.(e.pointerId);
        pending = 0;
      }
      const u = drag.u + s * dx;
      p = wrapPhase(u, period);
      const now = performance.now();
      drag.samples.push({ t: now, u });
      while (drag.samples.length > 2 && now - (drag.samples[0] as { t: number }).t > 100) drag.samples.shift();
      render();
    };
    const up = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      const { moved, samples } = drag;
      drag = null;
      holding = false;
      if (moved) {
        delete el.dataset.dragging;
        viewport.releasePointerCapture?.(e.pointerId);
        const a = samples[0];
        const b = samples[samples.length - 1];
        const fling = a && b && b.t > a.t && e.type !== 'pointercancel' ? ((b.u - a.u) / (b.t - a.t)) * 1000 : 0;
        v = clamp(fling, -LOOP.maxFling, LOOP.maxFling);
        tau = LOOP.fling;
        const swallow = (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        el.addEventListener('click', swallow, { capture: true, once: true });
        setTimeout(() => el.removeEventListener('click', swallow, { capture: true }), 0);
      }
      kick();
    };
    const enter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      hover = true;
      kick();
    };
    const leave = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      hover = false;
      kick();
    };
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      p = wrapPhase(p - s * e.deltaX, period);
      render();
    };
    const noDrag = (e: Event) => e.preventDefault();

    // ── keyboard, focus, clicks on copies ──
    const key = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
      e.preventDefault();
      nudge((e.key === 'ArrowLeft') === rtl ? 1 : -1);
    };
    const focusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      const li = t.closest<HTMLElement>('#sites-track > li');
      if (li?.hasAttribute('data-clone')) {
        // A copy was focused (a mouse press, a script): the real card takes it.
        BUTTON(originals.find((o) => BUTTON(o)?.dataset.photo === BUTTON(li)?.dataset.photo) ?? null)?.focus({ preventScroll: true });
        return;
      }
      if (t === toggle) {
        focusHold = false;
        return;
      }
      focusHold = t.matches(':focus-visible');
      if (focusHold && li) {
        const { c, d } = nearest(originals.indexOf(li));
        if (!fits(d)) pending += d;
        mirror?.classList.remove('is-mirror');
        mirror = c !== 1 ? (all[c * n + originals.indexOf(li)] ?? null) : null;
        mirror?.classList.add('is-mirror');
      }
      kick();
    };
    const focusOut = (e: FocusEvent) => {
      if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return;
      focusHold = false;
      mirror?.classList.remove('is-mirror');
      mirror = null;
      kick();
    };
    const clickCopy = (e: MouseEvent) => {
      const li = (e.target as Element).closest<HTMLElement>('#sites-track > li[data-clone]');
      if (!li) return;
      e.preventDefault();
      e.stopPropagation();
      BUTTON(originals.find((o) => BUTTON(o)?.dataset.photo === BUTTON(li)?.dataset.photo) ?? null)?.click();
    };
    root.sitesOrigin = (photo) => {
      const k = originals.findIndex((o) => BUTTON(o)?.dataset.photo === photo);
      if (k < 0) return null;
      let hit = nearest(k);
      if (!fits(hit.d) && Math.abs(hit.d) > width / 2 - cardW / 2 + 8) {
        // Off screen (the lightbox moved to another photo): bring it in while the dialog covers the page.
        p = wrapPhase(p + hit.d, period);
        pending = 0;
        render();
        hit = nearest(k);
      }
      return all[hit.c * n + k]?.querySelector<HTMLElement>('[data-sites-thumb]') ?? null;
    };

    const paddleHandlers = paddles.map((btn, i) => {
      const h = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        nudge(i === 0 ? -1 : 1);
      };
      btn.addEventListener('click', h, true);
      return h;
    });
    const onToggle = () => {
      userPaused = !userPaused;
      try {
        if (userPaused) sessionStorage.setItem(STORE, 'off');
        else sessionStorage.removeItem(STORE);
      } catch {
        /* private mode: the choice lasts for this page view */
      }
      updateToggle();
      kick();
    };
    toggle?.addEventListener('click', onToggle);
    updateToggle();

    const wake = () => kick();
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((x) => x.isIntersecting);
      kick();
    });
    io.observe(el);
    const dialogs = new MutationObserver(wake);
    dialogs.observe(section, { subtree: true, attributes: true, attributeFilter: ['open'] });
    const swap = new MutationObserver(() => {
      const next = viewport.querySelector('#sites-track');
      if (next && next !== ul) build(true);
    });
    swap.observe(viewport, { childList: true });
    const ariaGuard = new MutationObserver((records) => {
      for (const r of records) (r.target as Element).removeAttribute('aria-disabled');
    });
    for (const x of paddles) ariaGuard.observe(x, { attributes: true, attributeFilter: ['aria-disabled'] });
    let seen = 0;
    const ro = new ResizeObserver(() => {
      const w = viewport.clientWidth;
      if (seen && w !== seen) build(false);
      seen = w;
    });
    ro.observe(viewport);

    viewport.addEventListener('pointerdown', down);
    viewport.addEventListener('pointerenter', enter);
    viewport.addEventListener('pointerleave', leave);
    viewport.addEventListener('wheel', wheel, { passive: false });
    viewport.addEventListener('dragstart', noDrag);
    viewport.addEventListener('click', clickCopy, true);
    el.addEventListener('keydown', key);
    el.addEventListener('focusin', focusIn);
    el.addEventListener('focusout', focusOut);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    document.addEventListener('visibilitychange', wake);

    build(true);

    return () => {
      cancelAnimationFrame(frame);
      frame = 0;
      io.disconnect();
      dialogs.disconnect();
      swap.disconnect();
      ariaGuard.disconnect();
      ro.disconnect();
      viewport.removeEventListener('pointerdown', down);
      viewport.removeEventListener('pointerenter', enter);
      viewport.removeEventListener('pointerleave', leave);
      viewport.removeEventListener('wheel', wheel);
      viewport.removeEventListener('dragstart', noDrag);
      viewport.removeEventListener('click', clickCopy, true);
      el.removeEventListener('keydown', key);
      el.removeEventListener('focusin', focusIn);
      el.removeEventListener('focusout', focusOut);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      document.removeEventListener('visibilitychange', wake);
      toggle?.removeEventListener('click', onToggle);
      paddles.forEach((btn, i) => btn.removeEventListener('click', paddleHandlers[i] as EventListener, true));
      delete root.sitesOrigin;
      ul?.querySelectorAll('li[data-clone]').forEach((c) => c.remove());
      if (ul) {
        ul.style.transform = '';
        ul.setAttribute('tabindex', '0');
      }
      paddles[0]?.setAttribute('aria-disabled', 'true');
      delete el.dataset.loop;
      delete el.dataset.loopState;
      delete el.dataset.dragging;
    };
  };
}

export const startSitesLoopDesktop: MotionModule = makeLoop('desktop');
export const startSitesLoopTouch: MotionModule = makeLoop('touch');

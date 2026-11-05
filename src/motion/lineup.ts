import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatNumber } from '@/lib/numbers';
import { LINEUP_EVENT, type LineupPhase } from '@/lib/lineup';
import { STAGGER_S, staggerDelay } from './reveals';
import type { Dispose, MotionEnv } from './shared';

/**
 * «اعثر على رافعتك» motion (lazy chunk, loaded when the section is near; never under reduced motion).
 * The section's live DOM arrives from its own lazy island (sections/crane-list/mount.tsx), which announces 'mount';
 * everything below binds to the live nodes then (or at once, when the island was first).
 * - Entrance: cards still below the fold rise in, 40 ms apart, when they enter; each capacity counts up once.
 * - Filter reflow: 'before' (Flip records the cards) / 'after' (React has committed): cards that stay glide and
 *   resize to their new cells; cards that arrive rise in.
 * - Type filter: the segmented thumb is measured here (not in the main bundle) and slides to the pressed option;
 *   without this chunk the pressed option paints its own fill.
 * - Desktop only: each card photo drifts a few percent against the scroll (scrubbed) inside its clipped frame.
 * Cleanup restores React's DOM (inline styles cleared, ticker text restored).
 */
export function lineupMotion(section: HTMLElement, kind: 'desktop' | 'touch', env: MotionEnv): Dispose {
  gsap.registerPlugin(Flip, ScrollTrigger);
  const rise = kind === 'desktop' ? 32 : 18;
  const items = () => Array.from(section.querySelectorAll<HTMLElement>('[data-lineup-item]'));
  let state: Flip.FlipState | null = null;
  let flip: gsap.core.Timeline | null = null;
  let scene: gsap.Context | null = null;
  let ro: ResizeObserver | null = null;
  const tickerText = new Map<HTMLElement, string>();
  const counts: gsap.core.Tween[] = [];

  // ── Segmented thumb: offsets are physical px from the track's left edge, so RTL needs nothing special.
  const placeThumb = (instant: boolean) => {
    const seg = section.querySelector<HTMLElement>('[data-lineup-seg]');
    const thumb = seg?.querySelector<HTMLElement>('.ui-seg__thumb');
    if (!seg || !thumb) return;
    const on = seg.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!on) {
      delete seg.dataset.measured;
      return;
    }
    if (instant) thumb.style.transition = 'none';
    seg.style.setProperty('--seg-x', `${on.offsetLeft}px`);
    seg.style.setProperty('--seg-w', `${on.offsetWidth}px`);
    seg.dataset.measured = '';
    if (instant) {
      void thumb.offsetWidth; // commit the position before transitions come back
      thumb.style.transition = '';
    }
  };

  const count = (el: HTMLElement) => {
    const to = Number(el.dataset.lineupTicker);
    const decimals = Number(el.dataset.tickerDecimals ?? 0);
    if (!Number.isFinite(to) || el.dataset.ticked !== undefined) return;
    el.dataset.ticked = '';
    if (!tickerText.has(el)) tickerText.set(el, el.textContent ?? '');
    const n = { v: 0 };
    const write = () => {
      if (Number.isFinite(n.v)) el.textContent = formatNumber(n.v, env.lang, { maximumFractionDigits: decimals });
    };
    write();
    counts.push(gsap.to(n, { v: to, duration: 1.2, ease: 'expo.out', onUpdate: write, onComplete: () => (el.textContent = tickerText.get(el) ?? '') }));
  };

  /** Entrance + tickers + drift for whatever cards are in the section now. */
  const bind = () => {
    scene?.revert();
    ro?.disconnect();
    placeThumb(true);
    const seg = section.querySelector<HTMLElement>('[data-lineup-seg]');
    ro = typeof ResizeObserver === 'undefined' || !seg ? null : new ResizeObserver(() => placeThumb(true));
    if (seg) ro?.observe(seg);

    scene = gsap.context(() => {
      const below = items().filter((li) => li.getBoundingClientRect().top > window.innerHeight * 0.9);
      if (below.length) {
        gsap.set(below, { y: rise, opacity: 0 });
        ScrollTrigger.batch(below, {
          start: 'top 90%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { y: 0, opacity: 1, duration: kind === 'desktop' ? 0.9 : 0.6, ease: 'expo.out', stagger: (i) => staggerDelay(i), overwrite: true }),
        });
      }
      for (const el of section.querySelectorAll<HTMLElement>('[data-lineup-ticker]')) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) continue; // already in view: leave the figure as is
        ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => count(el) });
      }
      if (kind === 'desktop') {
        for (const photo of section.querySelectorAll<HTMLElement>('[data-lineup-photo]')) {
          gsap.fromTo(
            photo,
            { yPercent: -4, scale: 1.1 },
            {
              yPercent: 4,
              scale: 1.1,
              ease: 'none',
              scrollTrigger: { trigger: photo.parentElement ?? photo, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
            },
          );
        }
      }
    }, section);
    // Safety net: a card whose trigger is already behind us (an anchor jump) never stays hidden.
    ScrollTrigger.refresh();
  };

  const onLineup = (event: Event) => {
    const phase = (event as CustomEvent<LineupPhase>).detail;
    if (phase === 'mount') {
      bind();
      return;
    }
    if (phase === 'before') {
      flip?.progress(1); // a second press finishes the first move before recording
      state = Flip.getState(items());
      return;
    }
    placeThumb(false);
    if (!state) return;
    const from = state;
    state = null;
    flip = Flip.from(from, {
      targets: items(),
      duration: 0.62,
      ease: 'expo.out',
      nested: true,
      prune: true,
      onEnter: (entering) =>
        gsap.fromTo(entering, { opacity: 0, y: rise }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', delay: 0.06, stagger: STAGGER_S }),
      onComplete: () => {
        flip = null;
        ScrollTrigger.refresh();
      },
    });
  };

  window.addEventListener(LINEUP_EVENT, onLineup);
  if (section.dataset.live !== undefined) bind();

  return () => {
    window.removeEventListener(LINEUP_EVENT, onLineup);
    ro?.disconnect();
    flip?.progress(1).kill();
    scene?.revert();
    const seg = section.querySelector<HTMLElement>('[data-lineup-seg]');
    if (seg) {
      delete seg.dataset.measured;
      seg.style.removeProperty('--seg-x');
      seg.style.removeProperty('--seg-w');
    }
    counts.forEach((t) => t.kill());
    tickerText.forEach((text, el) => {
      el.textContent = text;
      delete el.dataset.ticked;
    });
    gsap.set(items(), { clearProps: 'opacity,transform' });
  };
}

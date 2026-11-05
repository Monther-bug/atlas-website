import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { noop, type MotionModule } from './shared';

/**
 * Services: the two line drawings draw themselves once their tile has landed (src/sections/service-art.tsx).
 * - The derrick: every `[data-draw]` stroke draws in, ground first, 70 ms apart.
 * - The route: the start ring and the drop zone are drawn, then the load (`[data-load]`) travels from the start to the
 *   drop zone and the route (`[data-route]`) is traced behind it.
 * Only drawings that start below the fold get a from-state; on cleanup every stroke and the load are back as rendered.
 * Runs on desktop and touch (lazy core chunk); reduced motion never loads it.
 */

const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight;

interface PathSampler {
  getTotalLength(): number;
  getPointAtLength(length: number): { x: number; y: number };
}

/** Pure: the point at progress `t` (clamped 0..1) along a path (exported for tests). */
export function pointAt(path: PathSampler, t: number): { x: number; y: number } {
  const k = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 1;
  const p = path.getPointAtLength(path.getTotalLength() * k);
  return { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 };
}

export const startServiceArt: MotionModule = () => {
  const arts = Array.from(document.querySelectorAll<SVGSVGElement>('svg[data-service-art]')).filter(below);
  if (arts.length === 0) return noop;
  const done = new Set<SVGSVGElement>();
  const homes = new Map<SVGGElement, string | null>();
  const ctx = gsap.context(() => {});

  for (const svg of arts) {
    const load = svg.querySelector<SVGGElement>('[data-load]');
    if (load) homes.set(load, load.getAttribute('transform'));
    ctx.add(() => {
      gsap.set(svg.querySelectorAll('[data-draw]'), { drawSVG: '0%' });
      if (load) gsap.set(load, { opacity: 0 });
    });
  }

  const play = (svg: SVGSVGElement, fast = false) => {
    if (done.has(svg)) return;
    done.add(svg);
    const strokes = Array.from(svg.querySelectorAll<SVGElement>('[data-draw]'));
    const route = svg.querySelector<SVGPathElement & PathSampler>('[data-route]');
    const load = svg.querySelector<SVGGElement>('[data-load]');
    ctx.add(() => {
      if (fast) {
        gsap.to(strokes, { drawSVG: '100%', duration: 0.4, ease: 'expo.out' });
        if (load) gsap.to(load, { opacity: 1, duration: 0.3 });
        return;
      }
      if (route && load && typeof route.getPointAtLength === 'function') {
        const home = homes.get(load) ?? null;
        const tl = gsap.timeline({ delay: 0.35 });
        tl.to(strokes.filter((s) => s !== route), { drawSVG: '100%', duration: 0.6, ease: 'expo.out', stagger: 0.08 });
        const state = { t: 0 };
        const place = () => {
          const p = pointAt(route, state.t);
          load.setAttribute('transform', `translate(${p.x} ${p.y})`);
          gsap.set(route, { drawSVG: `0% ${state.t * 100}%` });
        };
        tl.add(() => {
          place();
          gsap.set(load, { opacity: 1 });
        }, '-=0.3');
        tl.to(state, {
          t: 1,
          duration: 1.6,
          ease: 'power2.inOut',
          onUpdate: place,
          onComplete: () => {
            if (home) load.setAttribute('transform', home);
            gsap.set(route, { drawSVG: '100%' });
          },
        });
      } else {
        gsap.to(strokes, { drawSVG: '100%', duration: 1.1, ease: 'expo.out', stagger: 0.07, delay: 0.3 });
        if (load) gsap.to(load, { opacity: 1, duration: 0.4, delay: 0.6 });
      }
    });
  };

  const triggers = arts.map((svg) => ScrollTrigger.create({ trigger: svg, start: 'top 82%', once: true, onEnter: () => play(svg) }));
  // Safety net: a drawing whose trigger is already behind us (anchor jump, resize) finishes at once.
  const finishPassed = () => {
    for (const svg of arts) if (!done.has(svg) && svg.getBoundingClientRect().top < window.innerHeight * 0.82) play(svg, true);
  };
  ScrollTrigger.addEventListener('refresh', finishPassed);

  return () => {
    ScrollTrigger.removeEventListener('refresh', finishPassed);
    triggers.forEach((t) => t.kill());
    ctx.revert();
    homes.forEach((home, load) => {
      if (home === null) load.removeAttribute('transform');
      else load.setAttribute('transform', home);
    });
  };
};

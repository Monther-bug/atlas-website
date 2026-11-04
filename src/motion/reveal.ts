import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { noop, type Dispose, type MotionModule } from './shared';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Service rows are "set down" as they enter (spec §5.4). Visible throughout: only a 16 px settle. */
export const startServiceSetDown: MotionModule = () => {
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-service-row]'));
  // Rows already on screen when motion starts stay exactly as rendered.
  const below = rows.filter((row) => row.getBoundingClientRect().top > window.innerHeight);
  if (below.length === 0) return noop;
  const settled = new Set<HTMLElement>();
  const ctx = gsap.context(() => {
    gsap.set(below, { y: -16 });
    ScrollTrigger.batch(below, {
      start: 'top 85%',
      once: true,
      onEnter: (batch) => {
        batch.forEach((el) => settled.add(el as HTMLElement));
        gsap.to(batch, { y: 0, duration: 1, ease: 'expo.out', stagger: 0.1, overwrite: true });
      },
    });
  });
  // Safety net: a row whose trigger point is already behind us never stays 16 px up.
  const finishPassed = () => {
    for (const row of below) {
      if (settled.has(row) || row.getBoundingClientRect().top > window.innerHeight * 0.85) continue;
      settled.add(row);
      gsap.to(row, { y: 0, duration: 0.4, ease: 'expo.out', overwrite: true });
    }
  };
  ScrollTrigger.addEventListener('refresh', finishPassed);
  return () => {
    ScrollTrigger.removeEventListener('refresh', finishPassed);
    ctx.revert();
  };
};

/** Desktop: hovering or focusing a service row draws a short sling from the progress rope to the row. */
export const startServiceSlings: MotionModule = ({ rtl }) => {
  const rope = document.querySelector<HTMLElement>('[data-progress-rope]');
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-service-row]'));
  if (!rope || rows.length === 0) return noop;

  const measureRow = (row: HTMLElement) => {
    const ropeRect = rope.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    const reach = Math.max(0, Math.round(rtl ? ropeRect.left - r.right : r.left - ropeRect.right));
    row.style.setProperty('--sling-reach', `${reach}px`);
  };
  const measure = () => rows.forEach(measureRow);
  /** Keyboard focus only: a mouse click on the row's link must not keep the sling drawn. */
  const focusVisibleIn = (row: HTMLElement) => {
    try {
      return row.querySelector(':focus-visible') !== null;
    } catch {
      return row.matches(':focus-within');
    }
  };

  const offs: Dispose[] = rows.map((row) => {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'service-sling');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('viewBox', '0 0 100 24');
    svg.setAttribute('preserveAspectRatio', 'none');
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M0 6 Q50 22 100 12'); // rope side (x 0) -> row side (x 100), with a little sag
    svg.append(path);
    row.append(svg);
    gsap.set(path, { drawSVG: '0% 0%' });

    const show = () => {
      measureRow(row);
      gsap.to(path, { drawSVG: '0% 100%', duration: 0.45, ease: 'expo.out', overwrite: true });
    };
    const showFocus = () => {
      if (focusVisibleIn(row)) show();
    };
    const hide = (event: Event) => {
      // Keep the sling while the other input (keyboard focus or pointer) still holds the row.
      if (event.type === 'pointerleave' && focusVisibleIn(row)) return;
      if (event.type === 'focusout' && row.matches(':hover')) return;
      if (event instanceof FocusEvent && event.relatedTarget instanceof Node && row.contains(event.relatedTarget)) return;
      gsap.to(path, { drawSVG: '0% 0%', duration: 0.25, ease: 'power2.in', overwrite: true });
    };
    row.addEventListener('pointerenter', show);
    row.addEventListener('pointerleave', hide);
    row.addEventListener('focusin', showFocus);
    row.addEventListener('focusout', hide);

    return () => {
      row.removeEventListener('pointerenter', show);
      row.removeEventListener('pointerleave', hide);
      row.removeEventListener('focusin', showFocus);
      row.removeEventListener('focusout', hide);
      gsap.killTweensOf(path);
      svg.remove();
      row.style.removeProperty('--sling-reach');
    };
  });

  measure();
  ScrollTrigger.addEventListener('refresh', measure);
  return () => {
    ScrollTrigger.removeEventListener('refresh', measure);
    offs.forEach((off) => off());
  };
};

// @vitest-environment jsdom
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { pointAt, startServiceArt } from './services';

beforeAll(() => {
  window.matchMedia ??= ((query: string) =>
    ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList);
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
});

afterEach(() => {
  document.body.innerHTML = '';
});

const env = { lang: 'en', rtl: false, late: false } as const;

function at<T extends Element>(el: T, top: number): T {
  el.getBoundingClientRect = () => ({ top, bottom: top + 100, left: 0, right: 100, width: 100, height: 100, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;
  return el;
}

const ROUTE = `<svg data-service-art="route"><path data-draw data-route d="M0 0 L100 0"/><circle data-draw cx="0" cy="0" r="7"/><g data-load transform="translate(288 52)"><rect/></g></svg>`;

describe('pointAt (pure)', () => {
  const line = { getTotalLength: () => 200, getPointAtLength: (l: number) => ({ x: l, y: l / 2 }) };

  it('samples the path at a clamped progress, rounded to 0.1 px', () => {
    expect(pointAt(line, 0)).toEqual({ x: 0, y: 0 });
    expect(pointAt(line, 0.5)).toEqual({ x: 100, y: 50 });
    expect(pointAt(line, 2)).toEqual({ x: 200, y: 100 });
    expect(pointAt(line, -1)).toEqual({ x: 0, y: 0 });
    expect(pointAt(line, Number.NaN)).toEqual({ x: 200, y: 100 }); // non-finite = arrived
  });
});

describe('startServiceArt', () => {
  it('is a no-op without drawings, and leaves a drawing that starts on screen as rendered', () => {
    expect(() => startServiceArt(env)()).not.toThrow();
    document.body.innerHTML = ROUTE;
    at(document.querySelector('svg')!, 100);
    startServiceArt(env)();
    expect(document.querySelector<SVGGElement>('[data-load]')!.getAttribute('style')).toBeNull();
  });

  it('hides the load below the fold, and cleanup restores the load where it rests', () => {
    document.body.innerHTML = ROUTE;
    at(document.querySelector('svg')!, window.innerHeight + 400);
    const load = document.querySelector<SVGGElement>('[data-load]')!;
    const dispose = startServiceArt(env);
    expect(load.style.opacity).toBe('0');
    load.setAttribute('transform', 'translate(10 10)'); // as if mid-journey
    dispose();
    expect(load.getAttribute('transform')).toBe('translate(288 52)');
    expect(load.style.opacity).toBe('');
  });
});

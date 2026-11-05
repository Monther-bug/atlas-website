// @vitest-environment jsdom
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { stepProgress, startWhyBars, startWhyStepsTouch } from './why';

beforeAll(() => {
  window.matchMedia ??= ((query: string) =>
    ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList);
  gsap.registerPlugin(ScrollTrigger);
});

afterEach(() => {
  document.body.innerHTML = '';
});

const env = { lang: 'en', rtl: false, late: false } as const;

function at<T extends Element>(el: T, top: number): T {
  el.getBoundingClientRect = () => ({ top, bottom: top + 100, left: 0, right: 100, width: 100, height: 100, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;
  return el;
}

function steps(top: number) {
  document.body.innerHTML = `<ol data-why-steps>${[0, 1, 2, 3]
    .map((i) => `<li data-why-step>${i < 3 ? '<span><span data-why-fill></span></span>' : ''}</li>`)
    .join('')}</ol>`;
  return at(document.querySelector<HTMLElement>('[data-why-steps]')!, top);
}

describe('stepProgress (pure)', () => {
  it('fills the connectors one after another and reaches each step as its connector fills', () => {
    expect(stepProgress(0, 4)).toEqual({ fills: [0, 0, 0], reached: [true, false, false, false] });
    const half = stepProgress(0.5, 4);
    expect(half.fills).toEqual([1, 0.5, 0]);
    expect(half.reached).toEqual([true, true, false, false]);
    expect(stepProgress(1, 4)).toEqual({ fills: [1, 1, 1], reached: [true, true, true, true] });
  });

  it('clamps out-of-range and non-finite progress to a valid state (non-finite = done)', () => {
    expect(stepProgress(-2, 4).fills).toEqual([0, 0, 0]);
    expect(stepProgress(7, 4).reached.every(Boolean)).toBe(true);
    expect(stepProgress(Number.NaN, 4).reached.every(Boolean)).toBe(true);
    expect(stepProgress(0.5, 1)).toEqual({ fills: [], reached: [true] });
  });
});

describe('startWhySteps', () => {
  it('leaves a process that starts on screen exactly as rendered', () => {
    steps(100);
    startWhyStepsTouch(env)();
    expect(document.querySelector('[data-todo]')).toBeNull();
    expect(document.querySelector<HTMLElement>('[data-why-fill]')!.style.transform).toBe('');
  });

  it('empties the line below the fold, dims the steps not reached, and cleanup restores the rendered DOM', () => {
    steps(window.innerHeight + 500);
    const dispose = startWhyStepsTouch(env);
    expect([...document.querySelectorAll('[data-why-step]')].map((s) => s.hasAttribute('data-todo'))).toEqual([false, true, true, true]);
    expect(document.querySelector<HTMLElement>('[data-why-fill]')!.style.transform).toMatch(/scale[XY]\(0\)/);
    dispose();
    expect(document.querySelector('[data-todo]')).toBeNull();
    expect(document.querySelector<HTMLElement>('[data-why-fill]')!.getAttribute('style') ?? '').toBe('');
  });
});

describe('startWhyBars', () => {
  it('grows bars only when the list starts below the fold, from the inline start, and cleanup restores them', () => {
    document.body.innerHTML = '<ul data-why-bars><li><span data-why-bar style="inline-size: 50%"></span></li></ul>';
    const list = at(document.querySelector('[data-why-bars]')!, window.innerHeight + 300);
    const bar = document.querySelector<HTMLElement>('[data-why-bar]')!;
    const dispose = startWhyBars({ ...env, rtl: true });
    expect(bar.style.transform).toContain('scale(0, 1)');
    expect(bar.style.transformOrigin).toBe('100% 50%');
    dispose();
    expect(bar.style.transform).toBe('');
    expect(bar.style.inlineSize).toBe('50%');

    at(list, 50);
    startWhyBars(env)();
    expect(bar.style.transform).toBe('');
  });
});

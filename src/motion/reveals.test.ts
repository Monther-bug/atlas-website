// @vitest-environment jsdom
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { REVEAL_TUNING, fromState, magneticOffset, staggerDelay, startRevealsDesktop, startTickers } from './reveals';

beforeAll(() => {
  // jsdom has no matchMedia; ScrollTrigger needs one to register.
  window.matchMedia ??= ((query: string) =>
    ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList);
  gsap.registerPlugin(ScrollTrigger);
});

afterEach(() => {
  document.body.innerHTML = '';
});

/** jsdom has no layout: place an element at a given viewport top. */
function at(el: HTMLElement, top: number) {
  el.getBoundingClientRect = () => ({ top, bottom: top + 100, left: 0, right: 100, width: 100, height: 100, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;
  return el;
}

describe('reveal tuning (pure)', () => {
  it('uses the reveal vocabulary and shorter moves on touch', () => {
    expect(fromState('rise', 28)).toEqual({ y: 28, opacity: 0 });
    expect(fromState('fade', 28)).toEqual({ opacity: 0 });
    expect(fromState('mask', 28)).toEqual({ clipPath: 'inset(100% 0% 0% 0%)' });
    expect(fromState('unknown', 28)).toBeNull();
    expect(REVEAL_TUNING.touch.rise).toBeLessThan(REVEAL_TUNING.desktop.rise);
  });

  it('staggers 40 ms apart and caps the wait at 8 steps', () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(2)).toBeCloseTo(0.08);
    expect(staggerDelay(30)).toBeCloseTo(0.32);
  });

  it('pulls toward the pointer and never more than 6 px', () => {
    expect(magneticOffset(8, -4)).toEqual({ x: 2, y: -1 });
    expect(magneticOffset(400, -400)).toEqual({ x: 6, y: -6 });
  });
});

describe('startRevealsDesktop', () => {
  it('only hides elements that start below the fold, and cleanup restores the rendered DOM', () => {
    const onScreen = at(Object.assign(document.createElement('p'), { textContent: 'a' }), 100);
    const below = at(Object.assign(document.createElement('p'), { textContent: 'b' }), window.innerHeight + 400);
    onScreen.dataset.reveal = 'rise';
    below.dataset.reveal = 'rise';
    document.body.append(onScreen, below);

    const dispose = startRevealsDesktop({ lang: 'en', rtl: false, late: false });
    expect(onScreen.style.opacity).toBe('');
    expect(below.style.opacity).toBe('0');
    dispose();
    expect(below.style.opacity).toBe('');
    expect(below.style.transform).toBe('');
  });

  it('is a no-op when nothing asks for a reveal', () => {
    document.body.append(document.createElement('p'));
    expect(() => startRevealsDesktop({ lang: 'ar', rtl: true, late: false })()).not.toThrow();
  });
});

describe('startTickers', () => {
  it('keeps the rendered final value after cleanup', () => {
    const span = document.createElement('span');
    span.textContent = '317.5';
    span.dataset.ticker = '317.5';
    span.dataset.tickerFrom = '0';
    span.dataset.tickerDecimals = '1';
    document.body.append(at(span, 2000));
    const dispose = startTickers({ lang: 'en', rtl: false, late: false });
    dispose();
    expect(span.textContent).toBe('317.5');
  });
});

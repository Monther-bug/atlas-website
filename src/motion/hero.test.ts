// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HERO_PHOTO } from '@/sections/Hero';
import { finishIntro, heroIntro } from './hero';
import { LIVE_PHOTO, ROPE_TOP } from './hero-live';
import type { MotionEnv } from './shared';

const ENV: MotionEnv = { lang: 'ar', rtl: true, late: false };

const HERO = `
  <section id="top" data-hero>
    <div data-hero-photo><picture><img alt="crane" src="x.webp"></picture></div>
    <div data-hero-field></div>
    <h1 id="hero-title"><span class="hero-line">Lead,</span> <span class="hero-line">Main line</span></h1>
    <div data-hero-rig>
      <svg data-sling><path data-sling-leg></path><path data-sling-leg></path></svg>
      <div><div data-hero-load><a href="https://wa.me/1" data-sling-button>WhatsApp</a></div></div>
    </div>
  </section>`;

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const inlineStyles = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-hero] *'))
    .map((el) => el.getAttribute('style') ?? '')
    .filter(Boolean);

beforeEach(() => {
  document.body.innerHTML = HERO;
  // jsdom has no layout: give the legs their drop so the intro has something to pay out.
  q('svg[data-sling]').getBoundingClientRect = () => new DOMRect(0, 0, 60, 80);
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('heroIntro (direction B)', () => {
  it('does nothing without a hero', () => {
    document.body.innerHTML = '';
    expect(() => heroIntro(ENV)()).not.toThrow();
  });

  it('sets its from-states synchronously, and never touches the photo or the H1 (the LCP element)', () => {
    const dispose = heroIntro(ENV);
    expect(q('[data-hero-field]').style.getPropertyValue('--luff')).toBe('0.5');
    expect(q('svg[data-sling]').style.transform).toContain('scale');
    expect(q('[data-hero-load]').style.transform).toContain('translate');
    expect(q('[data-hero-photo] img').getAttribute('style')).toBeNull();
    expect(q('[data-hero-photo] picture').getAttribute('style')).toBeNull();
    expect(q('h1').getAttribute('style')).toBeNull();
    expect(q('[data-sling-button]').getAttribute('style')).toBeNull(); // tappable from the first frame
    dispose();
  });

  it('puts the DOM back exactly as rendered on cleanup', () => {
    heroIntro(ENV)();
    expect(inlineStyles()).toEqual([]);
  });

  it('is skipped when motion started late, and plays once per page', () => {
    heroIntro({ ...ENV, late: true })();
    const again = heroIntro(ENV);
    expect(inlineStyles()).toEqual([]);
    again();
  });

  it('finishIntro() jumps a running intro to its end state', () => {
    const dispose = heroIntro(ENV);
    finishIntro();
    expect(Number(q('[data-hero-field]').style.getPropertyValue('--luff'))).toBe(1);
    dispose();
  });

  it('keeps the live hook in step with the hero photos, with a rope top for each', () => {
    expect(LIVE_PHOTO).toEqual(HERO_PHOTO);
    for (const photo of Object.values(HERO_PHOTO)) expect(ROPE_TOP[photo]).toBeDefined();
  });

});

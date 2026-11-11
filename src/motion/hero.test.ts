// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HERO_PHOTO } from '@/sections/Hero';
import { finishIntro, heroIntro } from './hero';
import { LIVE_PHOTO, ROPE_TOP } from './hero-live';
import type { MotionEnv } from './shared';

const ENV: MotionEnv = { lang: 'ar', rtl: true, late: false };

// As Hero.tsx renders it: nothing hangs from the hook, the rig is an empty box on it.
const HERO = `
  <section id="top" data-hero>
    <div data-hero-photo><picture><img alt="crane" src="x.webp"></picture></div>
    <div data-hero-field></div>
    <h1 id="hero-title"><span class="hero-line hero-line-1">Line one</span> <span class="hero-line hero-line-2">Line two</span></h1>
    <div data-hero-rig aria-hidden="true"></div>
  </section>`;

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const inlineStyles = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-hero] *'))
    .map((el) => el.getAttribute('style') ?? '')
    .filter(Boolean);

beforeEach(() => {
  document.body.innerHTML = HERO;
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('heroIntro (direction B)', () => {
  it('does nothing without a hero', () => {
    document.body.innerHTML = '';
    expect(() => heroIntro(ENV)()).not.toThrow();
  });

  it('luffs the cut from half-raked, and never touches the photo, the H1 (the LCP element) or the hook point', () => {
    const dispose = heroIntro(ENV);
    expect(q('[data-hero-field]').style.getPropertyValue('--luff')).toBe('0.5');
    expect(q('[data-hero-photo] img').getAttribute('style')).toBeNull();
    expect(q('[data-hero-photo] picture').getAttribute('style')).toBeNull();
    expect(q('h1').getAttribute('style')).toBeNull();
    expect(q('[data-hero-rig]').getAttribute('style')).toBeNull();
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

// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { finishIntro, heroIntro } from './hero';
import type { MotionEnv } from './shared';

gsap.registerPlugin(SplitText);

const ENV: MotionEnv = { lang: 'ar', rtl: true, late: false };

const HERO = `
  <section data-hero>
    <div><div data-hero-photo><picture><img alt="crane" src="x.webp"></picture></div></div>
    <a href="https://wa.me/1" data-sling-button data-testid="sling-whatsapp">WhatsApp</a>
    <h1 id="hero-title" data-split><span class="block">Lead,</span> <span class="block">Main line</span></h1>
    <p data-intro>Services</p>
    <div data-intro><a href="#cranes">Browse cranes</a></div>
  </section>`;


const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
/** Inline styles GSAP left on any hero element. */
const inlineStyles = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-hero] *'))
    .map((el) => el.getAttribute('style') ?? '')
    .filter(Boolean);

let originalH1 = '';

// Each test renders a new hero element, so the "already played" memory (per hero element) starts empty.
beforeEach(() => {
  document.body.innerHTML = HERO;
  originalH1 = q('[data-split]').innerHTML;
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('heroIntro', () => {
  it('does nothing without a hero', () => {
    document.body.innerHTML = '';
    expect(() => heroIntro(ENV)()).not.toThrow();
  });

  it('sets its from-states synchronously, never on the <img>, and keeps the H1 in the accessibility tree', () => {
    const dispose = heroIntro(ENV);
    expect(q('[data-sling-button]').style.opacity).toBe('0');
    expect(q('[data-intro]').style.opacity).toBe('0');
    expect(q('[data-split]').style.opacity).toBe('0');
    expect(q('[data-split]').style.visibility).not.toBe('hidden');
    expect(q('[data-hero-photo] picture').style.transform).toContain('scale(1.05');
    expect(q('[data-hero-photo] img').getAttribute('style')).toBeNull();
    dispose();
  });

  it('puts the DOM back exactly as rendered on cleanup', async () => {
    const dispose = heroIntro(ENV);
    await new Promise((resolve) => setTimeout(resolve, 900)); // fonts fallback → SplitText
    dispose();
    expect(inlineStyles()).toEqual([]);
    expect(q('[data-split]').innerHTML).toBe(originalH1);
    expect(q('[data-split]').hasAttribute('aria-label')).toBe(false);
  });

  it('splits the H1 with an aria-label and aria-hidden pieces, never into characters', async () => {
    const dispose = heroIntro(ENV);
    await new Promise((resolve) => setTimeout(resolve, 900));
    const h1 = q('[data-split]');
    expect(h1.getAttribute('aria-label')).toBe('Lead, Main line');
    expect(h1.querySelectorAll('.split-line').length).toBeGreaterThan(0);
    expect(Array.from(h1.querySelectorAll('.split-line')).every((line) => line.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(h1.style.opacity).toBe('1');
    dispose();
  });

  it('is skipped when motion started late (the CSS failsafe already showed the hero), and never plays after', () => {
    heroIntro({ ...ENV, late: true })();
    const again = heroIntro(ENV);
    expect(inlineStyles()).toEqual([]);
    again();
  });

  it('plays once per page: a context that re-runs after a resize leaves the hero at rest', () => {
    heroIntro(ENV)();
    const rerun = heroIntro(ENV);
    expect(inlineStyles()).toEqual([]);
    rerun();
  });

  it('finishIntro() jumps a running intro to its visible end state', () => {
    const dispose = heroIntro(ENV);
    finishIntro();
    expect(q('[data-sling-button]').style.opacity).toBe('1');
    for (const el of document.querySelectorAll<HTMLElement>('[data-intro]')) expect(el.style.opacity).toBe('1');
    dispose();
  });
});

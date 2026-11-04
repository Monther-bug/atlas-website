// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface FakeTrigger {
  vars: { trigger: Element; start: string; end: string; onEnter: () => void; onLeaveBack: () => void };
  progress: number;
  kill: ReturnType<typeof vi.fn>;
}

const { triggers, startProgress } = vi.hoisted(() => ({ triggers: [] as FakeTrigger[], startProgress: { value: 0 } }));

// jsdom has no layout, so ScrollTrigger is replaced by a stand-in whose callbacks the tests fire by hand.
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: (vars: FakeTrigger['vars']) => {
      const st: FakeTrigger = { vars, progress: startProgress.value, kill: vi.fn() };
      triggers.push(st);
      return st;
    },
  },
}));

import { heroDock } from './hero';
import type { MotionEnv } from './shared';

const ENV: MotionEnv = { lang: 'ar', rtl: true, late: false };
const FLIGHT_MS = 600;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const ghosts = () => document.querySelectorAll('.motion-ghost');

function rect(el: Element, left: number, top: number, width: number, height: number) {
  (el as HTMLElement).getBoundingClientRect = () => new DOMRect(left, top, width, height);
}

beforeEach(() => {
  triggers.length = 0;
  startProgress.value = 0;
  document.body.innerHTML = `
    <section data-hero><div><a href="https://wa.me/1" class="btn" data-sling-button data-testid="sling-whatsapp">WhatsApp</a></div></section>
    <aside data-request-bar><a href="https://wa.me/2" data-testid="bar-whatsapp" data-bar-whatsapp>WA</a></aside>`;
  rect(q('[data-sling-button]'), 900, 500, 200, 56);
  rect(q('[data-bar-whatsapp]'), 24, 820, 120, 48);
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('heroDock', () => {
  it('does nothing without a hero sling button', () => {
    document.body.innerHTML = '<section data-hero></section>';
    expect(() => heroDock(ENV)()).not.toThrow();
    expect(triggers).toHaveLength(0);
  });

  it('watches the hero bottom passing 65 % of the viewport', () => {
    const dispose = heroDock(ENV);
    expect(triggers).toHaveLength(1);
    expect(triggers[0].vars.trigger).toBe(q('[data-hero]'));
    expect(triggers[0].vars.start).toBe('bottom 65%');
    dispose();
  });

  it('hides the sling button without a flight when the page loads past the hero, and keeps it for keyboard and screen readers', () => {
    startProgress.value = 1; // at the very bottom ScrollTrigger is no longer "active", but progress says we are past
    const dispose = heroDock(ENV);
    const button = q('[data-sling-button]');
    expect(button.style.opacity).toBe('0');
    expect(button.style.pointerEvents).toBe('none');
    expect(button.style.visibility).not.toBe('hidden');
    expect(button.hasAttribute('aria-hidden')).toBe(false);
    expect(ghosts()).toHaveLength(0);
    dispose();
  });

  it('flies one inert ghost from the sling into the bar, then removes it and pulses the bar button', async () => {
    const dispose = heroDock(ENV);
    await nextFrame();
    triggers[0].vars.onEnter();
    expect(ghosts()).toHaveLength(1);
    const ghost = ghosts()[0] as HTMLElement;
    expect(ghost.parentElement).toBe(document.body);
    expect(ghost.getAttribute('aria-hidden')).toBe('true');
    expect(ghost.hasAttribute('inert')).toBe(true);
    expect(document.querySelectorAll('[data-testid="sling-whatsapp"]')).toHaveLength(1);
    expect(q('[data-sling-button]').style.opacity).toBe('0');
    await sleep(FLIGHT_MS + 150);
    expect(ghosts()).toHaveLength(0);
    expect(q('[data-bar-whatsapp]').style.transform).toContain('scale');
    await sleep(500);
    expect(q('[data-bar-whatsapp]').getAttribute('style') ?? '').toBe(''); // the pulse cleans up after itself
    dispose();
  });

  it('flies back to the sling on scroll back, then shows the real button', async () => {
    const dispose = heroDock(ENV);
    await nextFrame();
    triggers[0].vars.onEnter();
    await sleep(FLIGHT_MS + 100);
    triggers[0].vars.onLeaveBack();
    expect(ghosts()).toHaveLength(1);
    expect(q('[data-sling-button]').style.opacity).toBe('0');
    await sleep(FLIGHT_MS + 150);
    expect(ghosts()).toHaveLength(0);
    expect(q('[data-sling-button]').getAttribute('style') ?? '').toBe(''); // back as rendered
    dispose();
  });

  it('never leaves more than one ghost when the scroll flips back and forth', async () => {
    const dispose = heroDock(ENV);
    await nextFrame();
    for (let i = 0; i < 5; i += 1) {
      triggers[0].vars.onEnter();
      expect(ghosts().length).toBeLessThanOrEqual(1);
      triggers[0].vars.onLeaveBack();
      expect(ghosts().length).toBeLessThanOrEqual(1);
    }
    await sleep(FLIGHT_MS + 150);
    expect(ghosts()).toHaveLength(0);
    expect(q('[data-sling-button]').style.opacity).not.toBe('0'); // ended undocked, so visible
    dispose();
  });

  it('ignores repeated callbacks for the state it is already in', async () => {
    const dispose = heroDock(ENV);
    await nextFrame();
    triggers[0].vars.onLeaveBack(); // already undocked
    expect(ghosts()).toHaveLength(0);
    expect(q('[data-sling-button]').getAttribute('style')).toBeNull();
    dispose();
  });

  it('docks without a flight when the bar button is not laid out', async () => {
    rect(q('[data-bar-whatsapp]'), 0, 0, 0, 0);
    const dispose = heroDock(ENV);
    await nextFrame();
    triggers[0].vars.onEnter();
    expect(ghosts()).toHaveLength(0);
    expect(q('[data-sling-button]').style.opacity).toBe('0');
    dispose();
  });

  it('cleans up mid-flight: no ghost, the button and the bar back as rendered, the trigger killed', async () => {
    const dispose = heroDock(ENV);
    await nextFrame();
    triggers[0].vars.onEnter();
    await sleep(100);
    dispose();
    expect(ghosts()).toHaveLength(0);
    expect(q('[data-sling-button]').getAttribute('style') ?? '').toBe('');
    expect(q('[data-bar-whatsapp]').getAttribute('style') ?? '').toBe('');
    expect(triggers[0].kill).toHaveBeenCalled();
    await sleep(FLIGHT_MS);
    expect(ghosts()).toHaveLength(0);
  });
});

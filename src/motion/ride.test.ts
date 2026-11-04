// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { gsap } from 'gsap';
import { HOOK_EVENT } from '@/lib/request';
import { startRide } from './ride';
import type { MotionEnv } from './shared';

const ENV: MotionEnv = { lang: 'ar', rtl: true, late: false };
const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

let dispose: () => void;

function press(craneId: string | null, source: HTMLElement | null) {
  window.dispatchEvent(new CustomEvent(HOOK_EVENT, { detail: { craneId, source } }));
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Jumps GSAP's clock past the 0.7 s flight instead of waiting for it. */
const finish = () => gsap.globalTimeline.totalTime(gsap.globalTimeline.time() + 1);
const ghosts = () => document.querySelectorAll('.motion-ghost');

beforeEach(() => {
  document.body.innerHTML =
    '<button id="b1">Request</button><button id="b2">Request</button>' +
    '<span data-bar-chip data-testid="bar-chip"><bdi>GMK6350</bdi></span>';
  document.getElementById('b1')!.getBoundingClientRect = () => rect(400, 300, 120, 44);
  document.getElementById('b2')!.getBoundingClientRect = () => rect(600, 300, 120, 44);
  document.querySelector('[data-bar-chip]')!.getBoundingClientRect = () => rect(50, 700, 200, 44);
  dispose = startRide(ENV) as () => void;
});

afterEach(() => {
  dispose();
  document.body.innerHTML = '';
});

describe('startRide', () => {
  it('flies one ghost of the chip while the real chip is hidden, then lands', async () => {
    press('gmk6350', document.getElementById('b1'));
    await wait(50);
    expect(ghosts()).toHaveLength(1);
    expect(ghosts()[0].textContent).toContain('GMK6350');
    expect(document.querySelectorAll('[data-testid="bar-chip"]')).toHaveLength(1);
    expect((document.querySelector('[data-bar-chip]') as HTMLElement).style.opacity).toBe('0');
    finish();
    expect(ghosts()).toHaveLength(0);
    expect((document.querySelector('[data-bar-chip]') as HTMLElement).style.opacity).toBe('');
  });

  it('never leaves two ghosts after rapid presses', async () => {
    press('gmk6350', document.getElementById('b1'));
    await wait(50);
    press('ltm1100', document.getElementById('b2'));
    press('ltm1100', document.getElementById('b2'));
    await wait(50);
    expect(ghosts()).toHaveLength(1);
    finish();
    expect(ghosts()).toHaveLength(0);
  });

  it('does nothing for a clear or a missing source, and clearing ends a flight', async () => {
    press('gmk6350', null);
    await wait(100);
    expect(ghosts()).toHaveLength(0);
    press('gmk6350', document.getElementById('b1'));
    await wait(50);
    expect(ghosts()).toHaveLength(1);
    press(null, null);
    expect(ghosts()).toHaveLength(0);
    expect((document.querySelector('[data-bar-chip]') as HTMLElement).style.opacity).toBe('');
  });

  it('cleanup mid-flight restores the real chip', async () => {
    press('gmk6350', document.getElementById('b1'));
    await wait(50);
    dispose();
    expect((document.querySelector('[data-bar-chip]') as HTMLElement).style.opacity).toBe('');
    dispose = startRide(ENV) as () => void;
  });

  it('leaves no ghost when the chip never renders', async () => {
    document.querySelector('[data-bar-chip]')!.remove();
    press('gmk6350', document.getElementById('b1'));
    await wait(400);
    expect(ghosts()).toHaveLength(0);
  });

  it('cleanup removes the ghost and the listener', async () => {
    press('gmk6350', document.getElementById('b1'));
    await wait(50);
    dispose();
    expect(ghosts()).toHaveLength(0);
    press('gmk6350', document.getElementById('b1'));
    await wait(50);
    expect(ghosts()).toHaveLength(0);
    dispose = startRide(ENV) as () => void;
  });
});

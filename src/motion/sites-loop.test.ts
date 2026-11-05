import { describe, expect, it } from 'vitest';
import { LOOP, clamp, copiesNeeded, easeToward, skewFor, wrapPhase } from './sites-loop';

describe('sites loop maths', () => {
  it('wraps the phase into one period, both ways', () => {
    expect(wrapPhase(5100, 5000)).toBe(100);
    expect(wrapPhase(-100, 5000)).toBe(4900);
    expect(wrapPhase(2500, 5000)).toBe(2500);
    expect(wrapPhase(10, 0)).toBe(0);
  });

  it('eases towards a target without overshooting, independent of the frame rate', () => {
    const at60 = Array.from({ length: 60 }).reduce<number>((v) => easeToward(v, 100, 1 / 60, 0.5), 0);
    const at30 = Array.from({ length: 30 }).reduce<number>((v) => easeToward(v, 100, 1 / 30, 0.5), 0);
    expect(at60).toBeCloseTo(at30, 6);
    expect(at60).toBeGreaterThan(80);
    expect(at60).toBeLessThan(100);
  });

  it('needs the real set plus one copy either side, more on a wide screen over a short strip', () => {
    expect(copiesNeeded(1440, 5040)).toBe(3);
    expect(copiesNeeded(390, 1700)).toBe(3);
    expect(copiesNeeded(2560, 2100)).toBe(4);
    expect(copiesNeeded(1440, 0)).toBe(3);
  });

  it('leans only while the speed differs from the cruising speed, and never past the limit', () => {
    expect(skewFor(120, 120)).toBe(0);
    expect(Math.abs(skewFor(900, 120))).toBeGreaterThan(0.5);
    expect(skewFor(1e6, 0)).toBe(LOOP.maxSkew);
    expect(skewFor(-1e6, 0)).toBe(-LOOP.maxSkew);
  });

  it('takes 30 to 45 s for a pass over the cards', () => {
    expect(LOOP.seconds).toBeGreaterThanOrEqual(30);
    expect(LOOP.seconds).toBeLessThanOrEqual(45);
    expect(clamp(5, 0, 3)).toBe(3);
  });
});

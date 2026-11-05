import { describe, expect, it } from 'vitest';
import {
  HOIST,
  centerOn,
  counterLabel,
  counterSteps,
  counterText,
  coverPositionY,
  directionalSnap,
  flightDelta,
  hoistPinLength,
  hoistPinUnits,
  hoistTimelineUnits,
  coverPositionX,
  hoistSnapPoints,
  hookToBox,
  nearestSnap,
  type Point,
} from './math';

function expectPoint(p: Point, x: number, y: number, digits = 6) {
  expect(p.x).toBeCloseTo(x, digits);
  expect(p.y).toBeCloseTo(y, digits);
}

describe('hookToBox (object-fit: cover; object-position: 50% 0)', () => {
  it('cuts the sides equally when the box is taller than the crop', () => {
    // scale = max(400/1000, 400/500) = 0.8 → drawn 800 wide, 200 px cut from each side
    expectPoint(hookToBox({ x: 600, y: 250 }, { left: 100, top: 0, width: 1000, height: 500 }, { width: 400, height: 400 }), 200, 200);
  });

  it('cuts only the bottom when the box is wider than the crop (top-anchored)', () => {
    // scale = max(1000/1000, 200/500) = 1 → drawn 1000×500, anchored at the top
    expectPoint(hookToBox({ x: 600, y: 250 }, { left: 100, top: 0, width: 1000, height: 500 }, { width: 1000, height: 200 }), 500, 250);
  });

  it('maps the crop corners onto the box corners when the aspect ratios match', () => {
    const rect = { left: 1160, top: 0, width: 1921, height: 2401 };
    const box = { width: 1921 / 5, height: 2401 / 5 };
    expectPoint(hookToBox({ x: 1160, y: 0 }, rect, box), 0, 0);
    expectPoint(hookToBox({ x: 1160 + 1921, y: 2401 }, rect, box), 384.2, 480.2);
  });

  it('honours another object-position when asked', () => {
    // 50% 50%: crop 1000×500 in a 400×400 box → scale 0.8, offset (-200, 0)
    expectPoint(hookToBox({ x: 500, y: 250 }, { left: 0, top: 0, width: 1000, height: 500 }, { width: 400, height: 400 }, { x: 0.5, y: 0.5 }), 200, 200);
  });
});

describe('Hoist timeline (v2: 100 vh entrance, 55 vh per crane change, 30 vh exit)', () => {
  it('counts vh units from the number of cranes', () => {
    expect(HOIST).toEqual({ enterUnits: 100, beatUnits: 55, outUnits: 30, setDownAt: 0.85 });
    // Stuck part: one beat per change of crane (n - 1) plus the exit.
    expect(hoistPinUnits(5)).toBe(250);
    expect(hoistPinUnits(3)).toBe(140);
    expect(hoistPinUnits(1)).toBe(30);
    expect(hoistPinUnits(0)).toBe(30);
    // The whole scrubbed timeline adds the entrance (the stage rising into view).
    expect(hoistTimelineUnits(5)).toBe(350);
  });

  it('converts units to pixels for a viewport height', () => {
    expect(hoistPinLength(5, 900)).toBe(2250);
    expect(hoistPinLength(3, 1000)).toBe(1400);
  });

  it('treats negative and fractional counts safely', () => {
    expect(hoistPinUnits(-2)).toBe(30);
    expect(hoistPinUnits(2.7)).toBe(85);
  });
});

describe('hoistSnapPoints', () => {
  it('snaps to each crane once it is set down, then to the end; never inside the entrance', () => {
    const points = hoistSnapPoints(5);
    expect(points).toHaveLength(6);
    expect(points[0]).toBeCloseTo(100 / 350, 10); // the first crane: the stage has just stuck
    expect(points[1]).toBeCloseTo((100 + 55 * 0.85) / 350, 10);
    expect(points[4]).toBeCloseTo((100 + 3 * 55 + 55 * 0.85) / 350, 10);
    expect(points[5]).toBe(1);
    for (let i = 1; i < points.length; i++) expect(points[i]).toBeGreaterThan(points[i - 1]);
  });

  it('returns only the end for an empty list', () => {
    expect(hoistSnapPoints(0)).toEqual([1]);
    expect(hoistSnapPoints(1)).toEqual([100 / 130, 1]);
  });
});

describe('coverPositionX', () => {
  const rect = { left: 0, top: 0, width: 4240, height: 2385 };
  const box = { width: 760, height: 570 }; // 4:3 box: the 16:9 crop overflows sideways

  it('stays centred while the point is inside the margins', () => {
    expect(coverPositionX({ x: 2120, y: 1000 }, rect, box, 0.1)).toBe(0.5);
  });

  it('moves the crop just enough to bring a point near the edge inside the margin', () => {
    const p = coverPositionX({ x: 885, y: 1868 }, rect, box, 0.12);
    expect(p).toBeLessThan(0.5);
    const shown = hookToBox({ x: 885, y: 1868 }, rect, box, { x: p, y: 0 });
    expect(shown.x / box.width).toBeCloseTo(0.12, 6);
  });

  it('returns 0.5 when nothing is cut sideways', () => {
    expect(coverPositionX({ x: 10, y: 10 }, rect, { width: 1600, height: 400 }, 0.2)).toBe(0.5);
  });
});

describe('counterSteps', () => {
  it('runs each counter from the previous capacity to its own', () => {
    expect(counterSteps([55, 60, 200, 250, 350])).toEqual([
      { from: 0, to: 55 },
      { from: 55, to: 60 },
      { from: 60, to: 200 },
      { from: 200, to: 250 },
      { from: 250, to: 350 },
    ]);
  });

  it('returns nothing for no cranes', () => {
    expect(counterSteps([])).toEqual([]);
  });
});

describe('counterText', () => {
  it('rounds to whole tonnes with Western digits in both languages', () => {
    expect(counterText(349.6, 'en')).toBe('350');
    expect(counterText(54.4, 'ar')).toBe('54');
    expect(counterText(-0.3, 'en')).toBe('0');
  });
});

describe('flightDelta and centerOn', () => {
  it('maps one rect onto another with a 0 0 transform origin', () => {
    expect(flightDelta({ left: 10, top: 20, width: 100, height: 40 }, { left: 210, top: 620, width: 50, height: 40 })).toEqual({
      x: 200,
      y: 600,
      scaleX: 0.5,
      scaleY: 1,
    });
  });

  it('never divides by zero', () => {
    expect(flightDelta({ left: 0, top: 0, width: 0, height: 0 }, { left: 5, top: 5, width: 10, height: 10 })).toEqual({ x: 5, y: 5, scaleX: 1, scaleY: 1 });
  });

  it('centres a size on an anchor rect', () => {
    expect(centerOn({ left: 100, top: 100, width: 200, height: 50 }, { width: 80, height: 30 })).toEqual({ left: 160, top: 110, width: 80, height: 30 });
  });
});

describe('nearestSnap', () => {
  it('returns the closest snap point to the current progress', () => {
    expect(nearestSnap([0, 0.25, 0.5, 1], 0.3)).toBe(0.25);
    expect(nearestSnap([0, 0.25, 0.5, 1], 0.4)).toBe(0.5);
    expect(nearestSnap([0, 0.25, 0.5, 1], 0.97)).toBe(1);
  });

  it('returns the progress itself when there are no points', () => {
    expect(nearestSnap([], 0.3)).toBe(0.3);
  });
});

describe('directionalSnap', () => {
  const points = [0, 0.25, 0.5, 1];

  it('goes on to the next point in the direction of the last scroll', () => {
    expect(directionalSnap(points, 0.3, 1)).toBe(0.5);
    expect(directionalSnap(points, 0.3, -1)).toBe(0.25);
    expect(directionalSnap(points, 0.26, 1)).toBe(0.5);
    expect(directionalSnap(points, 0.49, -1)).toBe(0.25);
  });

  it('stays on a point that is within the tolerance, whatever the direction', () => {
    expect(directionalSnap(points, 0.252, 1, 0.005)).toBe(0.25);
    expect(directionalSnap(points, 0.248, -1, 0.005)).toBe(0.25);
  });

  it('never runs past the first or last point', () => {
    expect(directionalSnap(points, 1.2, 1)).toBe(1);
    expect(directionalSnap(points, -0.1, -1)).toBe(0);
  });

  it('falls back to the nearest point without a direction, and to the progress without points', () => {
    expect(directionalSnap(points, 0.3, 0)).toBe(0.25);
    expect(directionalSnap([], 0.3, 1)).toBe(0.3);
  });
});

describe('coverPositionY (keep a hook point inside a top-anchored cover crop)', () => {
  const rect = { left: 0, top: 0, width: 4240, height: 2385 };
  const hook = { x: 885, y: 1868 }; // IMG_6389, the GMK6350's real hook

  it('stays top-anchored (0) when the hook is already high enough', () => {
    // 1328×821: scale = max(0.3132, 0.3442) = 0.3442 → hook at 643 of 821 (78 %)
    expect(coverPositionY(hook, rect, { width: 1328, height: 821 }, 0.8)).toBe(0);
  });

  it('moves the crop down just enough to lift the hook to the limit', () => {
    const box = { width: 1328, height: 629 };
    const y = coverPositionY(hook, rect, box, 0.8);
    expect(y).toBeGreaterThan(0);
    expect(y).toBeLessThan(1);
    expect(hookToBox(hook, rect, box, { x: 0.5, y }).y).toBeCloseTo(0.8 * 629, 6);
  });

  it('is 0 when nothing is cut vertically, and never more than 1', () => {
    expect(coverPositionY(hook, rect, { width: 400, height: 900 }, 0.5)).toBe(0);
    expect(coverPositionY({ x: 885, y: 2380 }, rect, { width: 4240, height: 400 }, 0.1)).toBe(1);
  });
});

describe('counterLabel (whole tonnes mid-run, the exact rating at the end)', () => {
  const gmk = { from: 250, to: 317.5 }; // the GMK6350's metric rating

  it('lands on the exact final value, decimals included, in both languages', () => {
    expect(counterLabel(317.5, gmk, 'en')).toBe('317.5');
    expect(counterLabel(317.5, gmk, 'ar')).toBe('317.5');
    expect(counterLabel(55, { from: 0, to: 55 }, 'ar')).toBe('55');
  });

  it('shows whole tonnes in between, never one past the final value', () => {
    expect(counterLabel(290.4, gmk, 'en')).toBe('290');
    expect(counterLabel(317.3, gmk, 'en')).toBe('317');
    expect(counterLabel(317.49, gmk, 'en')).toBe('317'); // Math.round would say 318
  });

  it('starts on the exact previous value and clamps outside the run', () => {
    expect(counterLabel(317.5, { from: 317.5, to: 400 }, 'en')).toBe('317.5');
    expect(counterLabel(317.6, { from: 317.5, to: 400 }, 'en')).toBe('318');
    expect(counterLabel(-5, { from: 0, to: 55 }, 'en')).toBe('0');
    expect(counterLabel(400, gmk, 'en')).toBe('317.5');
  });

  it('also runs downwards, and never throws on a non-finite value', () => {
    expect(counterLabel(57.6, { from: 60, to: 55 }, 'en')).toBe('58');
    expect(counterLabel(55, { from: 60, to: 55 }, 'en')).toBe('55');
    expect(counterLabel(Number.NaN, gmk, 'en')).toBe('250');
    expect(counterLabel(Number.POSITIVE_INFINITY, gmk, 'en')).toBe('250');
  });
});

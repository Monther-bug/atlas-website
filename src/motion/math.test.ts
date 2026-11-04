import { describe, expect, it } from 'vitest';
import {
  HOIST,
  centerOn,
  counterSteps,
  counterText,
  flightDelta,
  hoistPinLength,
  hoistPinUnits,
  hoistSnapPoints,
  hookToBox,
  viewBoxToBox,
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

describe('viewBoxToBox (SVG preserveAspectRatio="xMidYMin slice")', () => {
  it('gives exactly the same point as hookToBox for 500 random crops, boxes and points', () => {
    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = 0; i < 500; i++) {
      const rect = {
        left: Math.round(rand() * 2000),
        top: Math.round(rand() * 500),
        width: 300 + Math.round(rand() * 4000),
        height: 300 + Math.round(rand() * 3000),
      };
      const box = { width: 280 + rand() * 1800, height: 200 + rand() * 1200 };
      const p = { x: rect.left + rand() * rect.width, y: rect.top + rand() * rect.height };
      const a = hookToBox(p, rect, box);
      const b = viewBoxToBox(p, { x: rect.left, y: rect.top, width: rect.width, height: rect.height }, box);
      expectPoint(b, a.x, a.y);
    }
  });

  it('also works when the viewBox starts at 0 0 and the point is relative to the crop', () => {
    expectPoint(viewBoxToBox({ x: 500, y: 250 }, { x: 0, y: 0, width: 1000, height: 500 }, { width: 400, height: 400 }), 200, 200);
  });
});

describe('Hoist pin length (spec §5: 30 vh in, 55 vh per crane, 30 vh out)', () => {
  it('counts vh units from the number of cranes', () => {
    expect(HOIST).toEqual({ inUnits: 30, beatUnits: 55, outUnits: 30, setDownAt: 0.85 });
    expect(hoistPinUnits(5)).toBe(335);
    expect(hoistPinUnits(3)).toBe(225);
    expect(hoistPinUnits(0)).toBe(60);
  });

  it('converts units to pixels for a viewport height', () => {
    expect(hoistPinLength(5, 900)).toBe(3015);
    expect(hoistPinLength(3, 1000)).toBe(2250);
  });

  it('treats negative and fractional counts safely', () => {
    expect(hoistPinUnits(-2)).toBe(60);
    expect(hoistPinUnits(2.7)).toBe(170);
  });
});

describe('hoistSnapPoints', () => {
  it('snaps to the start, to each crane once its tag is set down, and to the end', () => {
    const points = hoistSnapPoints(5);
    expect(points).toHaveLength(7);
    expect(points[0]).toBe(0);
    expect(points[6]).toBe(1);
    expect(points[1]).toBeCloseTo((30 + 55 * 0.85) / 335, 10);
    expect(points[5]).toBeCloseTo((30 + 4 * 55 + 55 * 0.85) / 335, 10);
    for (let i = 1; i < points.length; i++) expect(points[i]).toBeGreaterThan(points[i - 1]);
  });

  it('returns just the two ends for an empty list', () => {
    expect(hoistSnapPoints(0)).toEqual([0, 1]);
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

// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { encodePlan, hookInRect, imageFileName, widthsFor } from './assets-helpers.mjs';

describe('encodePlan', () => {
  it('caps the 9:16 mobile hero at 1080 px with AVIF q45', () => {
    expect(encodePlan('mobile_9x16', 1351, true)).toEqual({ widths: [640, 828, 1080], avifQuality: 45 });
  });
  it('ships the crop width when narrower than the smallest ladder width', () => {
    expect(encodePlan('mobile_9x16', 500, true)).toEqual({ widths: [500], avifQuality: 45 });
  });
  it('uses widthsFor and q50 for every other crop', () => {
    expect(encodePlan('desktop_16x9', 4240, true)).toEqual({ widths: [640, 1280, 1920, 2560], avifQuality: 50 });
    expect(encodePlan('mobile_4x5', 1921, false)).toEqual({ widths: [640, 1280, 1920], avifQuality: 50 });
  });
});

describe('widthsFor', () => {
  it('uses 640/1280/1920 for a wide crop', () => {
    expect(widthsFor(4240, false)).toEqual([640, 1280, 1920]);
  });
  it('adds 2560 for hero photos', () => {
    expect(widthsFor(4240, true)).toEqual([640, 1280, 1920, 2560]);
  });
  it('never upscales: a narrow crop stops at its own width', () => {
    expect(widthsFor(1889, false)).toEqual([640, 1280, 1889]);
    expect(widthsFor(500, false)).toEqual([500]);
  });
  it('skips the crop width when it is within 10% of the last ladder width', () => {
    expect(widthsFor(1921, true)).toEqual([640, 1280, 1920]);
    expect(widthsFor(1351, true)).toEqual([640, 1280]);
  });
});

describe('hookInRect', () => {
  const rect = { left: 1160, top: 0, width: 1921, height: 2401 };
  it('returns the hook when it lies inside the crop', () => {
    expect(hookInRect({ x: 1407, y: 1523 }, rect)).toEqual({ x: 1407, y: 1523 });
  });
  it('returns null when the hook is outside the crop', () => {
    expect(hookInRect({ x: 3219, y: 1234 }, rect)).toBeNull();
    expect(hookInRect({ x: 1407, y: 2500 }, rect)).toBeNull();
  });
  it('treats the right and bottom edges as outside', () => {
    expect(hookInRect({ x: 3081, y: 10 }, rect)).toBeNull();
    expect(hookInRect({ x: 1160, y: 0 }, rect)).toEqual({ x: 1160, y: 0 });
  });
  it('returns null when there is no hook', () => {
    expect(hookInRect(undefined, rect)).toBeNull();
  });
});

describe('imageFileName', () => {
  it('builds <photo>-<crop>-<width>.<hash8>.<ext> from the file bytes', () => {
    const name = imageFileName('6398', 'desktop_16x9', 1920, 'avif', Buffer.from('abc'));
    expect(name).toBe('6398-desktop_16x9-1920.ba7816bf.avif');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import type Lenis from 'lenis';
import { glide, glideRef, reaimGlide } from './shared';

function fakeLenis() {
  const calls: Array<[unknown, Record<string, unknown> | undefined]> = [];
  const lenis = { scrollTo: vi.fn((target: unknown, options?: Record<string, unknown>) => calls.push([target, options])) };
  return { lenis: lenis as unknown as Lenis, calls };
}

afterEach(() => {
  glideRef.current = null;
});

describe('glide / reaimGlide (a link glide survives a layout change above its target)', () => {
  it('records the glide until it lands, and keeps the caller onComplete', () => {
    const { lenis, calls } = fakeLenis();
    const done = vi.fn();
    glide(lenis, '#services', { duration: 1, onComplete: done });
    expect(glideRef.current?.target).toBe('#services');
    (calls[0][1]?.onComplete as (l: Lenis) => void)(lenis);
    expect(done).toHaveBeenCalledOnce();
    expect(glideRef.current).toBeNull();
  });

  it('re-aims the glide in flight: syncs to the kept scroll position, then glides to the same target', () => {
    const { lenis, calls } = fakeLenis();
    glide(lenis, '#services', { duration: 1.4 });
    expect(reaimGlide(lenis)).toBe(true);
    expect(calls[1]).toEqual([window.scrollY, { immediate: true, force: true }]);
    expect(calls[2][0]).toBe('#services');
    expect(calls[2][1]).toMatchObject({ duration: 1.4 });
  });

  it('does nothing when no glide is in flight', () => {
    const { lenis, calls } = fakeLenis();
    expect(reaimGlide(lenis)).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it('a wheel, touch, press or key from the visitor ends the glide claim', () => {
    for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
      const { lenis } = fakeLenis();
      glide(lenis, '#top');
      window.dispatchEvent(new Event(type));
      expect(glideRef.current).toBeNull();
    }
  });
});

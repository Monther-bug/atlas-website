import { describe, expect, it } from 'vitest';
import { MOTION_QUERIES, detectMotionMode, langOf, type MotionMode } from './mode';

type Pointer = 'fine' | 'coarse' | 'none';
/** `rootPx` is the browser's default font size: media-query rem follows it, not the page's CSS. */
interface Env { width: number; pointer: Pointer; reduced: boolean; rootPx?: number }

const FEATURE = /^\(([a-z-]+):\s*([a-z0-9.-]+)\)$/;
const RANGE = /^\((width)\s*(>=|<)\s*([0-9.]+)rem\)$/;
const KNOWN = new Set(['pointer', 'prefers-reduced-motion']);

/** Every feature in a query: "," = or, "and" = and. Nothing else is allowed (no `not`, no `only`). */
function features(query: string): string[] {
  return query.split(',').flatMap((part) => part.trim().split(/\s+and\s+/)).map((f) => f.trim());
}

/** A tiny matchMedia stand-in for the plain features and rem width ranges above. */
function evaluate(query: string, env: Env): boolean {
  return query.split(',').some((part) =>
    part.trim().split(/\s+and\s+/).every((raw) => {
      const range = RANGE.exec(raw.trim());
      if (range) {
        const px = parseFloat(range[3]) * (env.rootPx ?? 16);
        return range[2] === '>=' ? env.width >= px : env.width < px;
      }
      const [, name, value] = FEATURE.exec(raw.trim()) ?? [];
      switch (name) {
        case 'pointer': return env.pointer === value;
        case 'prefers-reduced-motion': return value === 'reduce' ? env.reduced : !env.reduced;
        default: throw new Error(`unsupported media feature: ${raw}`);
      }
    }),
  );
}

const MODES = Object.keys(MOTION_QUERIES) as MotionMode[];
const widths = [320, 375, 768, 1023, 1023.5, 1023.99, 1024, 1100, 1279.5, 1280, 1440, 1920];
const pointers: Pointer[] = ['fine', 'coarse', 'none'];
const envs: Env[] = widths.flatMap((width) =>
  pointers.flatMap((pointer) =>
    [false, true].flatMap((reduced) => [16, 20].map((rootPx) => ({ width, pointer, reduced, rootPx }))),
  ),
);

describe('MOTION_QUERIES', () => {
  it('uses only plain features and rem width ranges, joined by "and" and ","', () => {
    for (const query of Object.values(MOTION_QUERIES)) {
      for (const feature of features(query)) {
        if (RANGE.test(feature)) continue;
        const match = FEATURE.exec(feature);
        expect(match, feature).not.toBeNull();
        expect(KNOWN.has(match![1]), feature).toBe(true);
      }
    }
  });

  it('keeps the queries exactly as contract C10 writes them (lg = 64rem, as in Tailwind)', () => {
    expect(MOTION_QUERIES.desktop).toBe('(width >= 64rem) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    expect(MOTION_QUERIES.touch).toBe(
      '(prefers-reduced-motion: no-preference) and (width < 64rem), ' +
        '(prefers-reduced-motion: no-preference) and (pointer: coarse), ' +
        '(prefers-reduced-motion: no-preference) and (pointer: none)',
    );
    expect(MOTION_QUERIES.reduced).toBe('(prefers-reduced-motion: reduce)');
  });

  it('matches exactly one context in every environment', () => {
    for (const env of envs) {
      const hits = MODES.filter((mode) => evaluate(MOTION_QUERIES[mode], env));
      expect(hits, JSON.stringify(env)).toHaveLength(1);
    }
  });

  it('gives desktop only to wide screens with a fine pointer and no reduced motion', () => {
    expect(evaluate(MOTION_QUERIES.desktop, { width: 1440, pointer: 'fine', reduced: false })).toBe(true);
    expect(evaluate(MOTION_QUERIES.touch, { width: 1440, pointer: 'coarse', reduced: false })).toBe(true);
    expect(evaluate(MOTION_QUERIES.touch, { width: 800, pointer: 'fine', reduced: false })).toBe(true);
  });

  it('leaves no gap just below 1024 px (no 1023.98 px edge)', () => {
    expect(evaluate(MOTION_QUERIES.touch, { width: 1023.99, pointer: 'fine', reduced: false })).toBe(true);
    expect(evaluate(MOTION_QUERIES.desktop, { width: 1024, pointer: 'fine', reduced: false })).toBe(true);
  });

  it("follows the visitor's default font size", () => {
    expect(evaluate(MOTION_QUERIES.touch, { width: 1100, pointer: 'fine', reduced: false, rootPx: 20 })).toBe(true);
    expect(evaluate(MOTION_QUERIES.desktop, { width: 1280, pointer: 'fine', reduced: false, rootPx: 20 })).toBe(true);
  });
});

describe('detectMotionMode', () => {
  it('agrees with the query that matches, for every environment', () => {
    for (const env of envs) {
      const expected = MODES.find((mode) => evaluate(MOTION_QUERIES[mode], env));
      expect(detectMotionMode((query) => evaluate(query, env)), JSON.stringify(env)).toBe(expected);
    }
  });

  it('lets reduced motion win over everything', () => {
    expect(detectMotionMode(() => true)).toBe('reduced');
  });

  it('falls back to touch when nothing matches', () => {
    expect(detectMotionMode(() => false)).toBe('touch');
  });
});

describe('langOf', () => {
  it('reads the html lang attribute', () => {
    expect(langOf('ar')).toBe('ar');
    expect(langOf('ar-LY')).toBe('ar');
    expect(langOf('AR')).toBe('ar');
    expect(langOf('en')).toBe('en');
    expect(langOf('')).toBe('en');
    expect(langOf(null)).toBe('en');
    expect(langOf(undefined)).toBe('en');
  });
});

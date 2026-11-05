import { describe, expect, it } from 'vitest';
import { craneSpecs, type CraneSpec } from './crane-specs';

const ids = ['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350'] as const;

const numericFields = (s: CraneSpec): string[] =>
  Object.entries(s)
    .filter(([, v]) => typeof v === 'number' || (v && typeof v === 'object' && !Array.isArray(v)))
    .map(([k]) => k);

describe('crane specs', () => {
  it('has every fleet model', () => {
    expect(Object.keys(craneSpecs).sort()).toEqual([...ids].sort());
  });

  for (const id of ids) {
    describe(id, () => {
      const s = craneSpecs[id];

      it('has positive numbers', () => {
        for (const [k, v] of Object.entries(s)) {
          if (typeof v === 'number') expect(v, k).toBeGreaterThan(0);
        }
        if (s.dimensionsM) for (const v of Object.values(s.dimensionsM)) expect(v).toBeGreaterThan(0);
      });

      it('boomMax >= boomMin', () => {
        if (s.boomMinM !== undefined && s.boomMaxM !== undefined) expect(s.boomMaxM).toBeGreaterThanOrEqual(s.boomMinM);
      });

      it('has a source entry for every numeric field', () => {
        const sourced = new Set(s.sources.map((x) => x.field));
        for (const f of numericFields(s)) expect(sourced.has(f), f).toBe(true);
      });

      it('sources are https URLs and refer to real fields', () => {
        for (const src of s.sources) {
          expect(src.url).toMatch(/^https?:\/\//);
          expect(src.field in s, src.field).toBe(true);
        }
      });
    });
  }
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { craneListCopy } from './crane-list-copy';

/** The lazy copy of «اعثر على رافعتك» follows the same rules as ar.ts / en.ts (copy.test.ts, font-coverage.test.tsx). */

function leaves(value: unknown, path = ''): { path: string; value: string }[] {
  if (typeof value === 'string') return [{ path, value }];
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
  return [];
}

const ar = leaves(craneListCopy.ar);
const en = leaves(craneListCopy.en);

describe('crane-list copy', () => {
  it('has the same keys in both languages, none empty', () => {
    expect(ar.map((l) => l.path)).toEqual(en.map((l) => l.path));
    for (const { path, value } of [...ar, ...en]) expect(value.trim(), path).not.toBe('');
  });

  it('keeps the same {placeholders} in both languages', () => {
    const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    ar.forEach(({ path, value }, i) => expect(vars(value), path).toEqual(vars(en[i]?.value ?? '')));
  });

  it('uses Arabic punctuation, no tatweel and no dash ranges in Arabic', () => {
    for (const { path, value } of ar.filter(({ value }) => /[؀-ۿ]/.test(value))) {
      expect(value.replace(/\{[a-zA-Z]+\}/g, ''), path).not.toMatch(/[,;?]/);
      expect(value, path).not.toMatch(/ـ/);
      expect(value, path).not.toMatch(/\d\s*–\s*\d/);
    }
  });

  it('never promises a lift: the load check talks about maximum ratings and the radius', () => {
    expect(craneListCopy.en.load.caveat).toMatch(/shortest radius/);
    expect(craneListCopy.ar.load.caveat).toMatch(/أقصر نصف قطر/);
    for (const { path, value } of [...leaves(craneListCopy.en.load), ...leaves(craneListCopy.ar.load)]) {
      expect(value, path).not.toMatch(/\bcan lift\b|\bwill lift\b|guarantee/i);
    }
  });

  it('only uses characters the subset fonts cover', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/fonts.css'), 'utf8');
    const ranges: [number, number][] = [];
    for (const m of css.matchAll(/unicode-range:\s*([^;]+);/g)) {
      for (const part of (m[1] ?? '').split(',')) {
        const r = part.trim().match(/^U\+([0-9A-F]+)(?:-([0-9A-F]+))?$/i);
        if (r?.[1]) ranges.push([parseInt(r[1], 16), parseInt(r[2] ?? r[1], 16)]);
      }
    }
    const missing = new Set<string>();
    for (const { value } of [...ar, ...en]) {
      for (const ch of value) {
        const cp = ch.codePointAt(0) ?? 0;
        if (cp >= 0x20 && !ranges.some(([a, b]) => cp >= a && cp <= b)) missing.add(`U+${cp.toString(16).toUpperCase()}`);
      }
    }
    expect([...missing]).toEqual([]);
  });
});

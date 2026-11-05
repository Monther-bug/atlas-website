// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { App } from '@/App';
import { ar } from '@/content/ar';
import { craneSpecs } from '@/content/crane-specs';
import { en } from '@/content/en';
import { Kitchen } from '@/kitchen/Kitchen';
import { renderHtml } from '@/test/render';

/**
 * Every character the site can render must be inside a subset font's unicode-range (src/fonts.css, built by
 * scripts/subset-fonts.mjs). A character outside them falls back to a system font: a visible regression.
 * v2 primitives and copy blocks (ui, specs) and the manufacturer specs are covered too.
 */
const css = readFileSync(resolve(process.cwd(), 'src/fonts.css'), 'utf8');
const ranges: Array<[number, number]> = [];
for (const match of css.matchAll(/unicode-range:\s*([^;]+);/g)) {
  for (const part of (match[1] ?? '').split(',')) {
    const m = part.trim().match(/^U\+([0-9A-F]+)(?:-([0-9A-F]+))?$/i);
    if (m?.[1]) ranges.push([parseInt(m[1], 16), parseInt(m[2] ?? m[1], 16)]);
  }
}
const covered = (cp: number) => cp < 0x20 || ranges.some(([a, b]) => cp >= a && cp <= b);

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

function missing(texts: string[]): string[] {
  const out = new Set<string>();
  for (const text of texts) {
    let i = 0;
    for (const ch of text) {
      const cp = ch.codePointAt(0) ?? 0;
      if (!covered(cp)) out.add(`U+${cp.toString(16).toUpperCase().padStart(4, '0')} in "${text.slice(Math.max(0, i - 30), i + 10)}"`);
      i += ch.length;
    }
  }
  return [...out];
}

describe('font subset coverage', () => {
  it('parsed the unicode ranges', () => {
    expect(ranges.length).toBeGreaterThan(20);
  });

  it('covers every copy string in both languages', () => {
    expect(missing([...strings(ar), ...strings(en)])).toEqual([]);
  });

  it('covers the manufacturer spec values that can be shown', () => {
    const shown = Object.values(craneSpecs).flatMap((s) => [s.officialName, s.manufacturer, s.drive ?? '', s.engineMake ?? '']);
    expect(missing(shown)).toEqual([]);
  });

  it('covers the rendered page and the v2 kitchen in both languages', () => {
    for (const lang of ['ar', 'en'] as const) {
      expect(missing([renderHtml(<App />, lang).textContent ?? ''])).toEqual([]);
      expect(missing([renderHtml(<Kitchen />, lang).textContent ?? ''])).toEqual([]);
    }
  });
});

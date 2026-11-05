import { describe, expect, it } from 'vitest';
import { getCopy } from '@/content/all';
import { visibleCranes } from '@/content';
import { craneListCopy } from '@/content/crane-list-copy';
import { craneSpecs } from '@/content/crane-specs';
import type { Crane } from '@/content/types';
import { KEY_ROWS, MORE_GROUPS, axlesText, keyCell, keyLabel } from './compare-data';
import { SPEC_GROUPS, specOf, specParts } from './lineup-data';

const ar = getCopy('ar');
const en = getCopy('en');
const byId = (id: string) => visibleCranes.find((c) => c.id === id) as Crane;
const MAX = Math.max(...visibleCranes.map((c) => c.capacityT));
const key = (row: (typeof KEY_ROWS)[number], id: string, lang: 'ar' | 'en' = 'en') =>
  keyCell(row, byId(id), specOf(byId(id))!, lang === 'ar' ? ar : en, craneListCopy[lang], lang, MAX);

describe('comparison rows', () => {
  it('shows seven key rows by default and keeps every other spec row, once, for "show all"', () => {
    expect(KEY_ROWS).toHaveLength(7);
    const more = MORE_GROUPS.flatMap((g) => g.rows);
    expect(new Set(more).size).toBe(more.length);
    // What the key rows already show is not repeated; everything else in the sheet's groups is reachable.
    const shown = ['maxCapacity', 'capacityRadius', 'boom', 'tipHeight', 'counterweight', 'axles', 'drive', 'enginePower', 'transportWeight'];
    for (const row of SPEC_GROUPS.flatMap((g) => g.rows)) expect(shown.includes(row) || more.includes(row), row).toBe(true);
    for (const row of more) expect(shown, row).not.toContain(row);
  });

  it('labels the key rows with the site’s field names', () => {
    expect(KEY_ROWS.map((r) => keyLabel(r, en, craneListCopy.en))).toEqual([
      'Max capacity',
      'Main boom',
      'Max tip height',
      'Counterweight',
      'Carrier',
      'Engine power',
      'Basic weight',
    ]);
  });
});

describe('comparison cells', () => {
  it('split the figure from its unit, Western digits in Arabic', () => {
    expect(key('capacity', 'gmk6350', 'ar')).toMatchObject({ value: '317.5', unit: 'طن', secondary: false });
    expect(key('boom', 'rt700e', 'ar')).toMatchObject({ value: 'من 11 إلى 33.5', unit: 'م' });
    expect(specParts(craneSpecs.gmk6350, 'length', en, 'en')).toMatchObject({ value: '19.68', unit: 'm', latin: false, secondary: false });
    expect(specParts(craneSpecs['ac200-1'], 'length', en, 'en')).toBeNull();
  });

  it('give the capacity the card figure, its radius, and one fixed bar scale', () => {
    expect(key('capacity', 'gmk6350')).toMatchObject({ caption: [{ text: 'at 2.44 m radius' }], bar: 1 });
    expect(key('capacity', 'rt700e')?.caption).toBeUndefined();
    expect(key('capacity', 'rt700e')?.bar).toBeCloseTo(55 / 317.5);
  });

  it('show the QUY250 at 250 t (the cards’ figure), captioned as to be confirmed, never as the manufacturer’s 260 t', () => {
    expect(key('capacity', 'quy250')).toMatchObject({ value: '250', caption: [{ text: craneListCopy.en.conflict.label }] });
    expect(key('capacity', 'quy250', 'ar')?.caption?.[0]?.text).toBe(craneListCopy.ar.conflict.label);
  });

  it('fall back to the tip height with jib, and say so', () => {
    expect(key('tipHeight', 'rt700e')).toMatchObject({ value: '36.4', unit: 'm', secondary: false });
    expect(key('tipHeight', 'rt700e')?.caption).toBeUndefined();
    expect(key('tipHeight', 'atf60-3')).toMatchObject({ value: '58.4', secondary: true, caption: [{ text: 'with jib' }] });
    expect(key('tipHeight', 'ac200-1')).toBeNull();
  });

  it('describe the carrier by type, axles and drive formula', () => {
    expect(key('carrier', 'gmk6350')).toEqual({ value: 'All-terrain', latin: false, word: true, secondary: false, caption: [{ text: '6 axles' }, { text: '12x6x12', latin: true }] });
    expect(key('carrier', 'rt700e', 'ar')?.caption?.[0]?.text).toBe('محوران');
    expect(key('carrier', 'quy250')).toEqual({ value: 'Crawler', latin: false, word: true, secondary: false });
  });

  it('mark figures from a spec database', () => {
    expect(key('counterweight', 'quy250')?.secondary).toBe(true);
    expect(key('boom', 'quy250')?.secondary).toBe(false);
  });

  it('count axles with the Arabic forms', () => {
    expect([1, 2, 5, 12].map((n) => axlesText(n, craneListCopy.ar, 'ar'))).toEqual(['محور واحد', 'محوران', '5 محاور', '12 محوراً']);
    expect(axlesText(6, craneListCopy.en, 'en')).toBe('6 axles');
  });
});

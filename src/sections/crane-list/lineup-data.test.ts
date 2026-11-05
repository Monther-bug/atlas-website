import { describe, expect, it } from 'vitest';
import { getCopy } from '@/content/all';
import { visibleCranes } from '@/content';
import { craneSpecs } from '@/content/crane-specs';
import { SPEC_ORDER } from '@/content/spec-rows';
import type { Crane } from '@/content/types';
import { craneListCopy } from '@/content/crane-list-copy';
import { CARD_FACTS, keySpecs, ratingDiffers, ratingRadius } from './card-facts';
import { COMPARE_MAX, addToCompare, compareSlots, defaultCompare, swapCompare, toggleCompare } from './compare-store';
import { SPEC_GROUPS, capacityCell, loadResult, specCell, specOf } from './lineup-data';
import { parseLoad, ratedFor } from './load';
import { CRANE_PHOTOS, craneMessage, sourcesOf, specGroups } from './sheet-data';

const ar = getCopy('ar');
const en = getCopy('en');
const NBSP = ' ';
const byId = (id: string) => visibleCranes.find((c) => c.id === id) as Crane;

describe('spec groups', () => {
  it('place every default spec field exactly once (dimensions as three rows)', () => {
    const rows = SPEC_GROUPS.flatMap((g) => g.rows);
    expect(new Set(rows).size).toBe(rows.length);
    const expected = SPEC_ORDER.filter((f) => f !== 'dimensions');
    for (const field of expected) expect(rows, field).toContain(field);
    expect(rows).toEqual(expect.arrayContaining(['length', 'width', 'height']));
  });

  it('leave out what the manufacturer does not state (no row, no estimate)', () => {
    const groups = specGroups(craneSpecs['ac200-1'], en, craneListCopy.en, 'en');
    const ids = groups.flatMap((g) => g.rows.map((r) => r.id));
    expect(ids).not.toContain('tipHeight');
    expect(ids).not.toContain('length');
    expect(ids).not.toContain('capacityRadius');
    expect(groups.map((g) => g.id)).toContain('carrier'); // axles + drive
  });

  it('format values with a no-break space before the unit, Western digits in Arabic', () => {
    expect(specCell(craneSpecs.gmk6350, 'maxCapacity', ar, 'ar')?.text).toBe(`317.5${NBSP}طن`);
    expect(specCell(craneSpecs.gmk6350, 'length', en, 'en')?.text).toBe(`19.68${NBSP}m`);
    expect(specCell(craneSpecs.rt700e, 'boom', ar, 'ar')?.text).toBe(`من 11 إلى 33.5${NBSP}م`);
    expect(specCell(craneSpecs.rt700e, 'boom', en, 'en')?.text).toBe(`11–33.5${NBSP}m`);
    expect(specCell(craneSpecs.gmk6350, 'drive', ar, 'ar')).toMatchObject({ text: '12x6x12', latin: true });
    expect(specCell(craneSpecs['ac200-1'], 'length', en, 'en')).toBeNull();
  });

  it('mark spec-database figures as secondary', () => {
    expect(specCell(craneSpecs.quy250, 'counterweight', en, 'en')?.secondary).toBe(true);
    expect(specCell(craneSpecs.quy250, 'boom', en, 'en')?.secondary).toBe(false);
    expect(specCell(craneSpecs['atf60-3'], 'tipHeightJib', en, 'en')?.secondary).toBe(true);
  });

  it('list each source document once, manufacturer documents first', () => {
    const list = sourcesOf(craneSpecs.quy250);
    expect(new Set(list.map((s) => s.url)).size).toBe(list.length);
    expect(list[0]?.official).toBe(true);
    expect(list.at(-1)?.official).toBe(false);
  });

  it('has photos for every model, the card photo first', () => {
    for (const crane of visibleCranes) {
      const id = crane.id as keyof typeof CRANE_PHOTOS;
      expect(CRANE_PHOTOS[id]?.[0], crane.id).toBe(crane.cardPhoto);
    }
  });
});

describe('cards', () => {
  it('show the same three key specs for every model', () => {
    for (const crane of visibleCranes) expect(keySpecs(crane, en, 'en').map((k) => k.id), crane.id).toEqual(['boomMax', 'jib', 'counterweight']);
    expect(keySpecs(byId('gmk6350'), ar, 'ar').map((k) => k.text)).toEqual([`60${NBSP}م`, `61${NBSP}م`, `100${NBSP}طن`]);
    expect(keySpecs(byId('quy250'), en, 'en').map((k) => k.secondary)).toEqual([false, true, true]);
  });

  it('copy their figures from crane-specs.ts exactly (no drift, no estimate)', () => {
    for (const crane of visibleCranes) {
      const spec = specOf(crane)!;
      const facts = CARD_FACTS[crane.id]!;
      expect([facts.boomMaxM, facts.jibMaxM, facts.counterweightT], crane.id).toEqual([spec.boomMaxM, spec.jibMaxM, spec.counterweightT]);
      const official = (field: string) => spec.sources.find((s) => s.field === field)?.official !== false;
      const secondary = [
        ...(official('boomMaxM') ? [] : ['boomMax']),
        ...(official('jibMaxM') ? [] : ['jib']),
        ...(official('counterweightT') ? [] : ['counterweight']),
      ];
      expect([...facts.secondary], crane.id).toEqual(secondary);
      // The radius of the rating, only where the spec's rating is the one the card shows.
      const radius = spec.maxCapacityT === crane.capacityT ? spec.maxCapacityRadiusM : undefined;
      expect(facts.radiusM, crane.id).toBe(radius);
    }
  });

  it('give the radius of the rating only when the card shows that same rating', () => {
    expect(ratingRadius(byId('gmk6350'))).toBe(2.44);
    expect(ratingRadius(byId('atf60-3'))).toBe(2.5);
    expect(ratingRadius(byId('rt700e'))).toBeUndefined();
    expect(ratingRadius(byId('quy250'))).toBeUndefined(); // 250 on the card, 260 in Fuwa's data
  });

  it('builds the per-crane WhatsApp message (template B)', () => {
    expect(craneMessage(byId('gmk6350'), en)).toContain('the Grove GMK6350 (All-terrain)');
    expect(craneMessage(byId('quy250'), ar)).toContain('Fuwa QUY250 (مجنزرة)');
  });
});

describe('load check', () => {
  it('parses Western, Arabic-Indic and comma-decimal input', () => {
    expect(parseLoad('')).toEqual({ state: 'empty' });
    expect(parseLoad('  ')).toEqual({ state: 'empty' });
    expect(parseLoad('120')).toEqual({ state: 'ok', tonnes: 120 });
    expect(parseLoad('١٢٠')).toEqual({ state: 'ok', tonnes: 120 });
    expect(parseLoad('٢٥٫٥')).toEqual({ state: 'ok', tonnes: 25.5 });
    expect(parseLoad('12,5')).toEqual({ state: 'ok', tonnes: 12.5 });
  });

  it('rejects zero, text and absurd values', () => {
    for (const bad of ['0', 'abc', '-5', '12t', '99999']) expect(parseLoad(bad), bad).toEqual({ state: 'invalid' });
  });

  it('compares against the maximum rating only, inclusive', () => {
    expect(ratedFor(byId('atf60-3'), 60)).toBe(true);
    expect(ratedFor(byId('atf60-3'), 60.5)).toBe(false);
    expect(visibleCranes.filter((c) => ratedFor(c, 120)).map((c) => c.id)).toEqual(['ac200-1', 'quy250', 'gmk6350']);
  });

  it('announces the result with Arabic plural forms and Western digits', () => {
    expect([0, 1, 2, 3].map((n) => loadResult(n, 120, craneListCopy.ar, 'ar'))).toEqual([
      `لا يوجد طراز هنا تصنيفه الأقصى 120${NBSP}طن أو أكثر. أرسل لنا التفاصيل لنراجعها.`,
      `طراز واحد تصنيفه الأقصى 120${NBSP}طن أو أكثر.`,
      `طرازان تصنيفهما الأقصى 120${NBSP}طن أو أكثر.`,
      `3 طرازات تصنيفها الأقصى 120${NBSP}طن أو أكثر.`,
    ]);
    expect(loadResult(3, 12.5, craneListCopy.en, 'en')).toBe(`3 models have a maximum rating of 12.5${NBSP}t or more.`);
  });
});

describe('comparison selection', () => {
  it('starts with the smallest, a middle and the largest model', () => {
    expect(defaultCompare(visibleCranes)).toEqual(['rt700e', 'ac200-1', 'gmk6350']);
    expect(defaultCompare(visibleCranes.slice(0, 2))).toEqual(['rt700e', 'atf60-3']);
  });

  it('keeps between one and three models', () => {
    const three = defaultCompare(visibleCranes);
    expect(three).toHaveLength(COMPARE_MAX);
    expect(toggleCompare(three, 'quy250')).toBe(three); // full: refused
    expect(toggleCompare(three, 'ac200-1')).toEqual(['rt700e', 'gmk6350']);
    expect(toggleCompare(['rt700e'], 'rt700e')).toEqual(['rt700e']); // never empty
    expect(toggleCompare(['rt700e'], 'quy250')).toEqual(['rt700e', 'quy250']);
  });

  it('makes room for a model added from the sheet', () => {
    expect(addToCompare(['rt700e', 'ac200-1', 'gmk6350'], 'quy250')).toEqual(['ac200-1', 'gmk6350', 'quy250']);
    expect(addToCompare(['rt700e'], 'rt700e')).toEqual(['rt700e']);
  });

  it('fills every column with a different model, the pick first', () => {
    expect(compareSlots(null, visibleCranes)).toEqual(['rt700e', 'ac200-1', 'gmk6350']);
    expect(compareSlots(['quy250'], visibleCranes)).toEqual(['quy250', 'rt700e', 'ac200-1']);
    expect(compareSlots(['gmk6350', 'gmk6350', 'cke2500'], visibleCranes)).toEqual(['gmk6350', 'rt700e', 'ac200-1']);
    expect(compareSlots(['atf60-3'], visibleCranes.slice(0, 2))).toEqual(['atf60-3', 'rt700e']);
  });

  it('swaps a column; a model already shown trades places, so columns stay distinct', () => {
    const slots = ['rt700e', 'ac200-1', 'gmk6350'] as const;
    expect(swapCompare(slots, 0, 'quy250')).toEqual(['quy250', 'ac200-1', 'gmk6350']);
    expect(swapCompare(slots, 0, 'gmk6350')).toEqual(['gmk6350', 'ac200-1', 'rt700e']);
    expect(swapCompare(slots, 1, 'ac200-1')).toBe(slots);
    expect(swapCompare(slots, 5, 'quy250')).toBe(slots);
  });
});

describe('one capacity per crane on the page (QUY250: 250 t by the model name, 260 t on Fuwa’s page)', () => {
  it('records the listed maximum exactly where the spec differs from the figure shown', () => {
    for (const crane of visibleCranes) {
      const spec = specOf(crane)!;
      const differs = spec.maxCapacityT !== undefined && spec.maxCapacityT !== crane.capacityT;
      expect(CARD_FACTS[crane.id]?.listedMaxT, crane.id).toBe(differs ? spec.maxCapacityT : undefined);
      expect(ratingDiffers(crane), crane.id).toBe(differs);
    }
  });

  it('shows the card figure, marked, in the comparison and the sheet; agrees elsewhere', () => {
    const quy = byId('quy250');
    expect(capacityCell(quy, specOf(quy)!, en, 'en')).toEqual({ text: `250${NBSP}t`, latin: false, secondary: false, conflict: true });
    expect(capacityCell(byId('gmk6350'), specOf(byId('gmk6350'))!, en, 'en')).toBeNull();
    const row = specGroups(specOf(quy)!, ar, craneListCopy.ar, 'ar', quy).flatMap((g) => g.rows).find((r) => r.id === 'maxCapacity');
    expect(row?.cell).toMatchObject({ text: `250${NBSP}طن`, conflict: true });
  });

  it('explains the difference in the rating note, with both figures', () => {
    for (const lang of ['ar', 'en'] as const) {
      expect(craneListCopy[lang].capacityNotes.quy250).toMatch(/260/);
      expect(craneListCopy[lang].capacityNotes.quy250).toMatch(/250/);
    }
  });
});

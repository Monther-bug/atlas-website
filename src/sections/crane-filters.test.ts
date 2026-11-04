import { describe, expect, it } from 'vitest';
import { getCopy, visibleCranes } from '@/content';
import type { Crane } from '@/content/types';
import { applyFilter, availableFilters, bandLabel, bandOf, resultCount } from './crane-filters';

const NNBSP = '\u00A0';
const verified = (cranes: readonly Crane[]) => cranes.map((c) => ({ ...c, verified: true }));
const ids = (cranes: readonly Crane[]) => cranes.map((c) => c.id);

describe('bandOf', () => {
  it('follows the deck band rule (60 is in the first band)', () => {
    expect([55, 60, 61, 200, 201, 350].map(bandOf)).toEqual(['0-60', '0-60', '61-200', '61-200', '201+', '201+']);
  });
});

describe('availableFilters', () => {
  it('always offers the types present, in a fixed order', () => {
    expect(availableFilters(visibleCranes).types).toEqual(['rough-terrain', 'all-terrain', 'crawler']);
    expect(availableFilters(visibleCranes.filter((c) => c.type !== 'crawler')).types).toEqual(['rough-terrain', 'all-terrain']);
  });

  it('hides tonnage bands while any visible crane is unverified', () => {
    expect(availableFilters(visibleCranes).bands).toEqual([]);
    const mixed = verified(visibleCranes).map((c) => (c.id === 'quy250' ? { ...c, verified: false } : c));
    expect(availableFilters(mixed).bands).toEqual([]);
  });

  it('shows the bands that have cranes once every crane is verified', () => {
    expect(availableFilters(verified(visibleCranes)).bands).toEqual(['0-60', '61-200', '201+']);
    expect(availableFilters(verified(visibleCranes.filter((c) => c.capacityT <= 60))).bands).toEqual(['0-60']);
  });
});

describe('applyFilter', () => {
  it('filters by type and by band, keeping the capacity order', () => {
    expect(ids(applyFilter(visibleCranes, 'all'))).toEqual(['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350']);
    expect(ids(applyFilter(visibleCranes, 'all-terrain'))).toEqual(['atf60-3', 'ac200-1', 'gmk6350']);
    expect(ids(applyFilter(visibleCranes, 'crawler'))).toEqual(['quy250']);
    expect(ids(applyFilter(visibleCranes, 'band:0-60'))).toEqual(['rt700e', 'atf60-3']);
    expect(ids(applyFilter(visibleCranes, 'band:61-200'))).toEqual(['ac200-1']);
    expect(ids(applyFilter(visibleCranes, 'band:201+'))).toEqual(['quy250', 'gmk6350']);
  });
});

describe('labels', () => {
  it('counts cranes with Arabic plural forms', () => {
    const ar = getCopy('ar');
    expect([1, 2, 3, 10, 11, 100].map((n) => resultCount(n, ar))).toEqual([
      'رافعة واحدة',
      'رافعتان',
      '3 رافعات',
      '10 رافعات',
      '11 رافعة',
      '100 رافعة',
    ]);
  });

  it('counts cranes in English', () => {
    const en = getCopy('en');
    expect([1, 2, 5].map((n) => resultCount(n, en))).toEqual(['1 crane', '2 cranes', '5 cranes']);
  });

  it('formats band chips through formatNumber/formatTonnes', () => {
    expect(bandLabel('0-60', getCopy('ar'))).toBe(`حتى 60${NNBSP}طن`);
    expect(bandLabel('61-200', getCopy('ar'))).toBe(`من 60 إلى 200${NNBSP}طن`);
    expect(bandLabel('61-200', getCopy('en'))).toBe(`60–200${NNBSP}t`);
    expect(bandLabel('201+', getCopy('en'))).toBe(`Over 200${NNBSP}t`);
  });
});

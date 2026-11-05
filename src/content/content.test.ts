import { describe, expect, it } from 'vitest';
import type { GalleryPhotoId } from './types';
import { cranes, siteInfo, sites, visibleCranes } from './index';
import { getCopy } from './all';

describe('cranes', () => {
  it('lists the visible cranes from smallest to largest', () => {
    expect(visibleCranes.map((c) => c.id)).toEqual(['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350']);
    expect(visibleCranes.map((c) => c.capacityT)).toEqual([55, 60, 200, 250, 317.5]);
  });

  it('never shows the Kobelco', () => {
    expect(visibleCranes.some((c) => c.id === 'cke2500')).toBe(false);
    expect(cranes.find((c) => c.id === 'cke2500')?.hidden).toBe(true);
  });

  it('keeps make and model exactly as printed on the machines', () => {
    expect(cranes.map((c) => [c.id, c.make, c.model, c.type])).toEqual([
      ['rt700e', 'Grove', 'RT700E', 'rough-terrain'],
      ['atf60-3', 'Tadano Faun', 'ATF 60-3', 'all-terrain'],
      ['ac200-1', 'Terex', 'AC200-1', 'all-terrain'],
      ['quy250', 'Fuwa', 'QUY250', 'crawler'],
      ['gmk6350', 'Grove', 'GMK6350', 'all-terrain'],
      ['cke2500', 'Kobelco', 'CKE2500', 'crawler'],
    ]);
  });

  it('uses the photos from spec §3', () => {
    expect(visibleCranes.map((c) => [c.hoistPhoto, c.cardPhoto])).toEqual([
      ['6364', '6363'],
      ['6395', '6397'],
      ['6375', '6376'],
      ['6385', '6380'],
      ['6389', '6392'],
    ]);
  });

  it('marks every crane unverified until Atlas confirms', () => {
    expect(cranes.every((c) => c.verified === false)).toBe(true);
  });
});

describe('sites', () => {
  it('has the two galleries from spec §4.2', () => {
    expect(sites.map((g) => [g.id, [...g.photos]])).toEqual([
      ['construction', ['6374', '6376', '6379', '6380', '6382', '6388', '6393']],
      ['coast', ['6360', '6364', '6396', '6397', '6398']],
    ]);
  });

  it('uses exactly the GalleryPhotoId set, each photo once', () => {
    const ids: Record<GalleryPhotoId, true> = {
      '6374': true, '6376': true, '6379': true, '6380': true, '6382': true, '6388': true,
      '6393': true, '6360': true, '6364': true, '6396': true, '6397': true, '6398': true,
    };
    const all: string[] = sites.flatMap((g) => [...g.photos]);
    expect(all).toHaveLength(12);
    expect([...all].sort()).toEqual(Object.keys(ids).sort());
  });

  it('contains no Kobelco photos', () => {
    const all: string[] = sites.flatMap((g) => [...g.photos]);
    for (const kobelco of ['6367', '6370', '6371']) expect(all).not.toContain(kobelco);
  });
});

describe('site info and copy', () => {
  it('holds only confirmed contact facts', () => {
    expect(siteInfo).toEqual({
      email: 'atlasalsahralibya@gmail.com',
      facebook: 'https://www.facebook.com/share/19qKUy2hxg/',
      address: null,
      documents: [],
    });
  });

  it('returns the copy for each language', () => {
    expect(getCopy('ar').lang).toBe('ar');
    expect(getCopy('en').lang).toBe('en');
  });
});

// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  CRANES,
  caseTag,
  coveredShare,
  decodedHref,
  expectedForFilter,
  expectedForLoad,
  expectedMotion,
  hasDraftToken,
  headingIssues,
  isEncodedHref,
  matchesFilter,
  nearestSnap,
  nextKey,
  normModel,
  overlapArea,
  photoIdFromUrl,
  prevKey,
  sessionCls,
  smallTargets,
  toWestern,
  EASTERN_DIGITS,
} from './checks.mjs';

const ALL = ['ac200-1', 'atf60-3', 'gmk6350', 'quy250', 'rt700e'];

describe('expectedForFilter', () => {
  it('keeps every crane for "all"', () => expect(expectedForFilter(ALL, 'all')).toEqual(ALL));
  it('filters by type', () => {
    expect(expectedForFilter(ALL, 'rough-terrain')).toEqual(['rt700e']);
    expect(expectedForFilter(ALL, 'all-terrain')).toEqual(['ac200-1', 'atf60-3', 'gmk6350']);
    expect(expectedForFilter(ALL, 'crawler')).toEqual(['quy250']);
  });
  it('filters by tonnage band (≤ 60 · 61–200 · > 200)', () => {
    expect(expectedForFilter(ALL, 'band:0-60')).toEqual(['atf60-3', 'rt700e']);
    expect(expectedForFilter(ALL, 'band:61-200')).toEqual(['ac200-1']);
    expect(expectedForFilter(ALL, 'band:201+')).toEqual(['gmk6350', 'quy250']);
  });
  it('only expects cranes that are on the page', () => expect(expectedForFilter(['gmk6350'], 'all-terrain')).toEqual(['gmk6350']));
  it('expects nothing for an unknown id under a real filter', () => expect(expectedForFilter(['x'], 'crawler')).toEqual([]));
});

describe('matchesFilter', () => {
  it('rejects an unknown filter value', () => expect(matchesFilter('weird', CRANES.gmk6350)).toBe(false));
  it('puts 317.5 t in the top band', () => expect(matchesFilter('band:201+', CRANES.gmk6350)).toBe(true));
});

describe('expectedForLoad', () => {
  it('keeps the cranes rated at least the load', () => {
    expect(expectedForLoad(ALL, 200)).toEqual(['ac200-1', 'gmk6350', 'quy250']);
    expect(expectedForLoad(ALL, 300)).toEqual(['gmk6350']);
    expect(expectedForLoad(ALL, 400)).toEqual([]);
  });
});

describe('normModel', () => {
  it('ignores spaces, no-break spaces, bidi isolates and case', () => {
    expect(normModel(' gmk 6350 ')).toBe('GMK6350');
    expect(normModel('⁦ATF 60-3⁩')).toBe('ATF60-3');
  });
});

describe('decodedHref', () => {
  it('decodes percent-encoded Arabic text', () => {
    expect(decodedHref('https://wa.me/218900000000?text=%D8%A7%D9%84%D8%B1%D8%A7%D9%81%D8%B9%D8%A9%20GMK6350')).toBe(
      'https://wa.me/218900000000?text=الرافعة GMK6350',
    );
  });
  it('treats + as a space (form encoding)', () => expect(decodedHref('mailto:a@b.c?body=ATF+60-3')).toBe('mailto:a@b.c?body=ATF 60-3'));
  it('returns malformed input unchanged', () => expect(decodedHref('x%E0%A4%A')).toBe('x%E0%A4%A'));
  it('returns "" for nothing', () => expect(decodedHref(null)).toBe(''));
});

describe('isEncodedHref', () => {
  it('accepts a fully percent-encoded link', () => expect(isEncodedHref('https://wa.me/1?text=%D8%A7%20x')).toBe(true));
  it('rejects raw Arabic, spaces and new lines', () => {
    expect(isEncodedHref('https://wa.me/1?text=ا')).toBe(false);
    expect(isEncodedHref('https://wa.me/1?text=a b')).toBe(false);
    expect(isEncodedHref('https://wa.me/1?text=a\nb')).toBe(false);
    expect(isEncodedHref(null)).toBe(false);
  });
});

describe('photoIdFromUrl', () => {
  it('reads the photo id from image URLs and srcsets', () => {
    expect(photoIdFromUrl('/img/6398-desktop_16x9-1920.ab12cd34.avif')).toBe('6398');
    expect(photoIdFromUrl('http://localhost:4173/img/6359-mobile_9x16-640.ab12cd34.webp 640w')).toBe('6359');
    expect(photoIdFromUrl('/brand/badge.png')).toBeNull();
  });
});

describe('arrow keys follow the reading direction', () => {
  it('rtl: ArrowLeft is next', () => expect([nextKey('rtl'), prevKey('rtl')]).toEqual(['ArrowLeft', 'ArrowRight']));
  it('ltr: ArrowRight is next', () => expect([nextKey('ltr'), prevKey('ltr')]).toEqual(['ArrowRight', 'ArrowLeft']));
});

describe('expectedMotion (C10 contexts)', () => {
  it('maps viewport, pointer and preference to the context', () => {
    expect(expectedMotion({ width: 1440, touch: false, reduced: false })).toBe('desktop');
    expect(expectedMotion({ width: 1024, touch: false, reduced: false })).toBe('desktop');
    expect(expectedMotion({ width: 768, touch: false, reduced: false })).toBe('touch');
    expect(expectedMotion({ width: 1440, touch: true, reduced: false })).toBe('touch');
    expect(expectedMotion({ width: 1440, touch: false, reduced: true })).toBe('reduced');
    expect(expectedMotion({ width: 390, touch: true, reduced: true })).toBe('reduced');
  });
});

describe('digits', () => {
  it('maps Arabic-Indic and Persian digits and the Arabic decimal sign', () => {
    expect(toWestern('٣٥٫٥')).toBe('35.5');
    expect(toWestern('۳۵۰')).toBe('350');
    expect(toWestern('١٬٠٠٠')).toBe('1000');
  });
  it('detects Eastern digits', () => {
    expect(EASTERN_DIGITS.test('317.5 طن')).toBe(false);
    expect(EASTERN_DIGITS.test('٣١٧')).toBe(true);
  });
});

describe('hasDraftToken', () => {
  it('finds [[CONFIRM]] and [[CONFIRM: …]] and other tokens', () => {
    expect(hasDraftToken('a [[CONFIRM]] b')).toBe(true);
    expect(hasDraftToken('[[CONFIRM: English spelling]]')).toBe(true);
    expect(hasDraftToken('[[CAPACITY:CKE2500]]')).toBe(true);
    expect(hasDraftToken('[x] [[ not a token')).toBe(false);
  });
});

describe('headingIssues', () => {
  it('accepts one h1 first and no skipped levels', () => expect(headingIssues([1, 2, 3, 3, 2, 3, 4, 2])).toEqual([]));
  it('reports a missing or second h1, a late h1 and a skipped level', () => {
    expect(headingIssues([2, 3])).toEqual(['0 h1', 'first heading is h2']);
    expect(headingIssues([1, 2, 1])).toEqual(['2 h1']);
    expect(headingIssues([1, 2, 4])).toEqual(['h2 → h4 (#3)']);
  });
});

describe('rect overlap', () => {
  const a = { left: 0, top: 0, right: 100, bottom: 50 };
  it('measures the shared area', () => {
    expect(overlapArea(a, { left: 50, top: 25, right: 150, bottom: 75 })).toBe(1250);
    expect(overlapArea(a, { left: 100, top: 0, right: 200, bottom: 50 })).toBe(0);
  });
  it('gives the covered share of the first rect', () => {
    expect(coveredShare(a, { left: 0, top: 0, right: 50, bottom: 50 })).toBe(0.5);
    expect(coveredShare({ left: 0, top: 0, right: 0, bottom: 0 }, a)).toBe(0);
  });
});

describe('smallTargets', () => {
  it('flags targets under 44 px, except inline links and unrendered ones', () => {
    const got = smallTargets([
      { name: 'ok', width: 44, height: 44, inline: false },
      { name: 'short', width: 120, height: 32, inline: false },
      { name: 'inline', width: 60, height: 20, inline: true },
      { name: 'hidden', width: 0, height: 0, inline: false },
    ]);
    expect(got.map((t) => t.name)).toEqual(['short']);
  });
});

describe('sessionCls', () => {
  it('sums shifts within one session window and keeps the largest window', () => {
    const entries = [
      { value: 0.01, startTime: 100 },
      { value: 0.02, startTime: 600 },
      { value: 0.05, startTime: 4000 },
      { value: 0.5, startTime: 4100, hadRecentInput: true },
    ];
    expect(sessionCls(entries)).toBe(0.05);
    expect(sessionCls([{ value: 0.03, startTime: 0 }, { value: 0.03, startTime: 900 }])).toBe(0.06);
    expect(sessionCls([])).toBe(0);
  });
  it('closes a window after 5 s even when shifts keep coming', () => {
    const entries = Array.from({ length: 12 }, (_, i) => ({ value: 0.01, startTime: i * 900 }));
    expect(sessionCls(entries)).toBe(0.06);
  });
});

describe('nearestSnap', () => {
  it('finds the closest resting point', () => {
    expect(nearestSnap([0.1, 0.3, 0.5], 0.32)).toEqual({ index: 1, distance: expect.closeTo(0.02, 5) });
    expect(nearestSnap([], 0.5).index).toBe(-1);
  });
});

describe('caseTag', () => {
  it('names a case', () => expect(caseTag({ page: 'ar', width: 390, mode: 'touch' })).toBe('ar @390 touch'));
});

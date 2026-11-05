// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { matrix, summarize } from './report.mjs';

const RESULTS = [
  { area: 'layout', name: 'ar @320 touch no horizontal overflow', pass: true, detail: '', case: { page: 'ar', width: 320, mode: 'touch' } },
  { area: 'layout', name: 'en @320 touch no horizontal overflow', pass: false, detail: '12px wider than the viewport', case: { page: 'en', width: 320, mode: 'touch' } },
  { area: 'axe', name: 'ar @320 touch no WCAG A/AA violations', pass: true, detail: '', case: { page: 'ar', width: 320, mode: 'touch' } },
];

describe('summarize', () => {
  const md = summarize(RESULTS, { base: 'http://localhost:4280', date: '2026-11-05T10:00:00.000Z', target: 'staging' });
  it('gives the overall count', () => expect(md).toContain('- Checks: 2/3 passed'));
  it('tables each area alphabetically', () => expect(md).toContain('| axe | 1 | 0 |\n| layout | 1 | 1 |'));
  it('lists each failure verbatim', () =>
    expect(md).toContain('- [layout] en @320 touch no horizontal overflow — 12px wider than the viewport'));
  it('says None when nothing failed', () => expect(summarize([RESULTS[0]])).toContain('## Failures\n\nNone.'));
  it('adds the page × width × mode matrix', () => expect(md).toContain('| ar | 320 | touch | 2 | 0 |\n| en | 320 | touch | 0 | 1 |'));
  it('keeps a failure detail on one table-safe line', () =>
    expect(summarize([{ area: 'x', name: 'n', pass: false, detail: 'a|b\nc' }])).toContain('- [x] n — a\\|b c'));
});

describe('matrix', () => {
  it('skips results without a case and sorts by page, width, mode', () => {
    const cells = matrix([
      ...RESULTS,
      { area: 'seo', name: 'head', pass: true, detail: '' },
      { area: 'layout', name: 'ar 1440', pass: true, detail: '', case: { page: 'ar', width: 1440, mode: 'desktop' } },
    ]);
    expect(cells.map((c) => `${c.page}${c.width}${c.mode}`)).toEqual(['ar320touch', 'ar1440desktop', 'en320touch']);
  });
});

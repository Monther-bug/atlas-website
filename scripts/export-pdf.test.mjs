import { describe, expect, it } from 'vitest';
import { countPdfPages, sliceOffsets } from './export-pdf.mjs';

describe('sliceOffsets', () => {
  it('tiles the document in screen-high slices that add up to its height', () => {
    const slices = sliceOffsets(2000, 900);
    expect(slices.map((s) => s.y)).toEqual([0, 900, 1800]);
    expect(slices.reduce((n, s) => n + s.height, 0)).toBe(2000);
  });
  it('scrolls the last screen back and crops its lower part', () => {
    expect(sliceOffsets(2000, 900).at(-1)).toEqual({ y: 1800, scroll: 1100, crop: 700, height: 200 });
  });
  it('handles a document shorter than one screen', () => {
    expect(sliceOffsets(500, 900)).toEqual([{ y: 0, scroll: 0, crop: 0, height: 500 }]);
  });
});

describe('countPdfPages', () => {
  it('counts leaf pages, not the page tree', () => {
    const pdf = Buffer.from('<< /Type /Pages /Count 1 >> << /Type /Page /Parent 1 0 R >>');
    expect(countPdfPages(pdf)).toBe(1);
  });
});

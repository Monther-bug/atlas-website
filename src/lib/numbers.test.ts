import { describe, expect, it } from 'vitest';
import { formatMetres, formatNumber, formatTonnes } from './numbers';

const NBSP = '\u00A0'; // no-break space (U+202F is in none of the fonts)

describe('formatNumber', () => {
  it('formats English with comma groups and a dot decimal', () => {
    expect(formatNumber(1250.5, 'en')).toBe('1,250.5');
    expect(formatNumber(350, 'en')).toBe('350');
  });

  it('formats Arabic with Western digits and a dot decimal', () => {
    expect(formatNumber(350.5, 'ar')).toBe('350.5');
    expect(formatNumber(350.5, 'ar')).not.toBe('350,5');
    const big = formatNumber(1250.5, 'ar');
    expect(big).toMatch(/^[0-9.,]+$/);
    expect(big.endsWith('.5')).toBe(true);
  });

  it('never prints Arabic-Indic digits or separators', () => {
    for (const n of [0, 7.5, 55, 350, 1250.5]) {
      expect(formatNumber(n, 'ar')).not.toMatch(/[\u0660-\u0669\u06F0-\u06F9\u066B\u066C]/);
    }
  });

  it('rounds to maximumFractionDigits (default 2)', () => {
    expect(formatNumber(7.456, 'en')).toBe('7.46');
    expect(formatNumber(7.456, 'ar', { maximumFractionDigits: 0 })).toBe('7');
  });

  it('uses a plain hyphen-minus with no bidi marks', () => {
    expect(formatNumber(-5, 'ar')).toBe('-5');
    expect(formatNumber(-5, 'en')).toBe('-5');
  });
});

describe('formatTonnes and formatMetres', () => {
  it('joins number and unit with a no-break space (U+00A0)', () => {
    expect(formatTonnes(350, 'en')).toBe(`350${NBSP}t`);
    expect(formatTonnes(350, 'ar')).toBe(`350${NBSP}طن`);
    expect(formatMetres(12, 'en')).toBe(`12${NBSP}m`);
    expect(formatMetres(12, 'ar')).toBe(`12${NBSP}م`);
  });

  it('keeps Arabic tonnage in Western digits', () => {
    const value = formatTonnes(350, 'ar');
    expect(value).not.toContain('\u0663');
    expect(value).toMatch(/^[0-9.,\u00A0طن]+$/);
  });

  it('throws on non-finite input in both languages', () => {
    for (const lang of ['en', 'ar'] as const) {
      expect(() => formatNumber(NaN, lang)).toThrow(RangeError);
      expect(() => formatNumber(Infinity, lang)).toThrow(RangeError);
      expect(() => formatNumber(-Infinity, lang)).toThrow(RangeError);
    }
  });

  it('normalises negative zero to plain zero', () => {
    expect(formatNumber(-0, 'en')).toBe('0');
    expect(formatNumber(-0.001, 'ar')).toBe('0');
  });

  it('clamps maximumFractionDigits instead of throwing', () => {
    expect(() => formatNumber(1.23456, 'en', { maximumFractionDigits: 99 })).not.toThrow();
  });

  it('groups large integers with commas in both languages', () => {
    expect(formatNumber(12345678, 'ar')).toBe('12,345,678');
    expect(formatNumber(12345678, 'en')).toBe('12,345,678');
  });
});

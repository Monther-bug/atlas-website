import { describe, expect, it } from 'vitest';
import { parseDecimal, toAsciiDigits } from './digits';

describe('toAsciiDigits', () => {
  it('converts Arabic-Indic digits', () => {
    expect(toAsciiDigits('٣٥٠')).toBe('350');
  });

  it('converts Persian digits and the Arabic decimal separator', () => {
    expect(toAsciiDigits('۱۲٫۵')).toBe('12.5');
  });

  it('drops the Arabic thousands separator', () => {
    expect(toAsciiDigits('1٬250')).toBe('1250');
  });

  it('leaves everything else alone', () => {
    expect(toAsciiDigits('+٢١٨ 91-abc')).toBe('+218 91-abc');
  });
});

describe('parseDecimal', () => {
  it('parses plain and Arabic-digit numbers', () => {
    expect(parseDecimal('350')).toBe(350);
    expect(parseDecimal('٣٥٠')).toBe(350);
    expect(parseDecimal('۱۲٫۵')).toBe(12.5);
    expect(parseDecimal(' 7.5 ')).toBe(7.5);
  });

  it('accepts a comma decimal and comma grouping', () => {
    expect(parseDecimal('7,5')).toBe(7.5);
    expect(parseDecimal('1,250')).toBe(1250);
    expect(parseDecimal('1,250.5')).toBe(1250.5);
    expect(parseDecimal('1٬250')).toBe(1250);
  });

  it('returns null for empty or invalid input', () => {
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('   ')).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal('12abc')).toBeNull();
    expect(parseDecimal('1.2.3')).toBeNull();
    expect(parseDecimal('-5')).toBeNull();
  });
});

describe('invisible direction and format marks', () => {
  it('strips a right-to-left mark inserted by Arabic keyboards', () => {
    expect(parseDecimal('‏٣٥٠')).toBe(350);
  });

  it('strips a left-to-right mark', () => {
    expect(parseDecimal('‎12.5')).toBe(12.5);
  });

  it('strips surrounding spaces around Arabic digits', () => {
    expect(parseDecimal(' ٣٥٠ ')).toBe(350);
  });
});

describe('grouping and leading zeros', () => {
  it('rejects a leading zero before a thousands group', () => {
    expect(parseDecimal('0,001')).toBeNull();
  });

  it('still accepts a zero comma decimal', () => {
    expect(parseDecimal('0,5')).toBe(0.5);
  });
});

describe('documented ambiguity rules', () => {
  it('reads a comma followed by three digits as grouping', () => {
    expect(parseDecimal('1,250')).toBe(1250);
    expect(parseDecimal('12,500')).toBe(12500);
    expect(parseDecimal('1,234,567')).toBe(1234567);
  });

  it('reads a comma followed by one or two digits as a decimal', () => {
    expect(parseDecimal('1,25')).toBe(1.25);
    expect(parseDecimal('12,50')).toBe(12.5);
  });

  it('rejects a comma group that is not exactly three digits', () => {
    expect(parseDecimal('1,2500')).toBeNull();
  });

  it('rejects dot grouping mixed with a comma decimal', () => {
    expect(parseDecimal('1.250,5')).toBeNull();
  });

  it('rejects exponent, infinity, hex and unit text', () => {
    expect(parseDecimal('1e3')).toBeNull();
    expect(parseDecimal('Infinity')).toBeNull();
    expect(parseDecimal('0x10')).toBeNull();
    expect(parseDecimal('350 t')).toBeNull();
  });

  it('accepts a leading or trailing dot and zero', () => {
    expect(parseDecimal('.5')).toBe(0.5);
    expect(parseDecimal('5.')).toBe(5);
    expect(parseDecimal('0')).toBe(0);
  });

  it('mixes Arabic and Persian digits with ASCII', () => {
    expect(toAsciiDigits('١۲3')).toBe('123');
  });
});

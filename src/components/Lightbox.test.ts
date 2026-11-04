import { describe, expect, it } from 'vitest';
import { stepFor, wrapIndex } from './Lightbox';

describe('stepFor', () => {
  it('moves forward with the arrow that points the reading direction', () => {
    expect(stepFor('ArrowRight', 'ltr')).toBe(1);
    expect(stepFor('ArrowLeft', 'ltr')).toBe(-1);
    expect(stepFor('ArrowLeft', 'rtl')).toBe(1);
    expect(stepFor('ArrowRight', 'rtl')).toBe(-1);
  });

  it('ignores other keys', () => {
    expect(stepFor('Enter', 'rtl')).toBe(0);
    expect(stepFor('Escape', 'ltr')).toBe(0);
  });
});

describe('wrapIndex', () => {
  it('wraps around both ends', () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(2, 5)).toBe(2);
  });
});

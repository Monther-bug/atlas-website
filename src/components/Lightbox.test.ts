// @vitest-environment jsdom
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderHtml } from '@/test/render';
import { Lightbox, stepFor, wrapIndex } from './Lightbox';

describe('Lightbox markup', () => {
  const photos = ['6374', '6376'] as never;
  const render = () =>
    renderHtml(createElement(Lightbox, { photos, index: 0, title: 'Sites', onIndexChange: () => {}, onClose: () => {} }), 'en');

  it('contains overscroll on the dialog', () => {
    expect(render().querySelector('dialog')?.className).toContain('overscroll-contain');
  });

  it('announces the position and the caption in the live region', () => {
    const live = render().querySelector('[aria-live="polite"]');
    expect(live?.textContent).toMatch(/^1 of 2 \u2014 \S/);
  });
});

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

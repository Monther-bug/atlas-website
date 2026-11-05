// @vitest-environment jsdom
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderHtml } from '@/test/render';
import { cropWithin, flipFrom, swipeStep } from './lightbox-math';
import { Lightbox, stepFor, wrapIndex } from './Lightbox';

describe('Lightbox markup', () => {
  const photos = ['6374', '6376'] as never;
  const render = (lang: 'ar' | 'en' = 'en') =>
    renderHtml(createElement(Lightbox, { photos, index: 0, title: 'Sites', onIndexChange: () => {}, onClose: () => {} }), lang);

  it('is a labelled native dialog on a dark ground that contains overscroll', () => {
    const dialog = render().querySelector('dialog[data-testid="lightbox"]');
    expect(dialog?.className).toContain('overscroll-contain');
    expect(dialog?.getAttribute('aria-label')).toBe('Sites');
    expect(dialog?.getAttribute('data-ground')).toBe('dark');
  });

  it('announces the position and the caption in the live region', () => {
    const live = render().querySelector('[aria-live="polite"]');
    expect(live?.textContent).toMatch(/^1 of 2 — \S/);
    expect(render('ar').querySelector('[aria-live="polite"]')?.textContent).toMatch(/^1 من 2 — موقع إنشاءات/);
  });

  it('shows the photo with its deck alt text and the caption on its own plate (never over the photo)', () => {
    const html = render();
    expect(html.querySelector('.lb__frame img')?.getAttribute('alt')).toMatch(/Terex/);
    const plate = html.querySelector('.lb__plate');
    expect(plate?.closest('.lb__frame')).toBeNull();
    expect(plate?.textContent).toBe('Building siteWhite counterweight with red chevrons, boom rising into a blue sky');
  });

  it('names its controls: close, previous and next', () => {
    const labels = [...render().querySelectorAll('button .sr-only')].map((s) => s.textContent);
    expect(labels).toEqual(['Close', 'Previous', 'Next']);
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

describe('swipeStep', () => {
  it('treats a swipe like the arrow key on the side the content comes from', () => {
    // Finger to the left = ArrowRight: next in English, previous in Arabic.
    expect(swipeStep(-80, 'ltr')).toBe(stepFor('ArrowRight', 'ltr'));
    expect(swipeStep(-80, 'rtl')).toBe(stepFor('ArrowRight', 'rtl'));
    expect(swipeStep(80, 'ltr')).toBe(stepFor('ArrowLeft', 'ltr'));
    expect(swipeStep(80, 'rtl')).toBe(stepFor('ArrowLeft', 'rtl'));
  });

  it('ignores short or broken moves', () => {
    expect(swipeStep(20, 'ltr')).toBe(0);
    expect(swipeStep(-47, 'rtl')).toBe(0);
    expect(swipeStep(Number.NaN, 'ltr')).toBe(0);
  });
});

describe('FLIP geometry', () => {
  // 6374: 16:9 view crop 4168x2344 at 0,0; 4:5 thumbnail crop 1889x2361 from x=1140.
  const view = { left: 0, top: 0, width: 4168, height: 2344 };
  const thumbCrop = { left: 1140, top: 0, width: 1889, height: 2361 };

  it('finds the thumbnail inside the frame and clamps it to the frame', () => {
    const sub = cropWithin(thumbCrop, view, 1600, 900);
    expect(sub.left).toBeCloseTo((1140 / 4168) * 1600, 3);
    expect(sub.top).toBe(0);
    expect(sub.width).toBeCloseTo((1889 / 4168) * 1600, 3);
    expect(sub.height).toBe(900); // the 4:5 crop is 17 px taller than the view: clamped
  });

  it('maps the sub-rectangle onto the thumbnail, and is the identity when they already match', () => {
    const frame = { left: 100, top: 50, width: 800, height: 450 };
    const same = flipFrom({ left: 100, top: 50, width: 800, height: 450 }, frame, { left: 0, top: 0, width: 800, height: 450 }, 28);
    expect(same.transform).toBe('translate(0px, 0px) scale(1)');
    expect(same.clipPath).toBe('inset(0px 0px 0px 0px round 28px)');

    const sub = { left: 200, top: 0, width: 360, height: 450 };
    const thumb = { left: 10, top: 600, width: 180, height: 225 };
    const { transform, clipPath } = flipFrom(thumb, frame, sub, 20);
    // k = 0.5: the sub-rectangle's centre (380, 225) lands on the thumbnail's centre (100, 712.5).
    expect(transform).toBe(`translate(${100 - (100 + 380 * 0.5)}px, ${712.5 - (50 + 225 * 0.5)}px) scale(0.5)`);
    expect(clipPath).toBe('inset(0px 240px 0px 200px round 40px)');
  });
});

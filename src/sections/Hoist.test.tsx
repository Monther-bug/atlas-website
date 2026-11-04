// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import type { CropImage } from '@/generated/images';
import { renderHtml } from '@/test/render';
import { cropVisibility, Hoist, hookPosition } from './Hoist';

describe('hookPosition', () => {
  it('turns a source-pixel hook point into percentages of the crop', () => {
    const image: CropImage = {
      photo: '6389',
      crop: 'desktop_16x9',
      rect: { left: 0, top: 100, width: 4240, height: 2385 },
      avif: [],
      webp: [],
      placeholder: '',
      hook: { x: 2120, y: 577 },
    };
    expect(hookPosition(image)).toEqual({ left: '50%', top: '20%' });
    expect(hookPosition({ ...image, hook: null })).toBeNull();
  });
});

describe('Hoist', () => {
  const html = renderHtml(<Hoist />, 'ar');
  const items = [...html.querySelectorAll('section#cranes[data-hoist] ol[data-hoist-list] > li[data-hoist-item]')];

  it('is an ordered list of the visible cranes, smallest first', () => {
    expect(items.map((li) => li.getAttribute('data-crane'))).toEqual(['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350']);
    expect(items.map((li) => li.getAttribute('data-capacity'))).toEqual(['55', '60', '200', '250', '350']);
  });

  it('gives every item a photo box, a load tag and a final-value counter', () => {
    for (const li of items) {
      expect(li.querySelector('[data-hoist-photo] img')).not.toBeNull();
      const counter = li.querySelector('[data-load-tag] [data-counter]');
      expect(counter?.getAttribute('data-value')).toBe(li.getAttribute('data-capacity'));
      expect(counter?.textContent).toBe(li.getAttribute('data-capacity')); // Western digits, already final
    }
  });

  it('labels the capacity inside the tag and isolates model codes', () => {
    const tag = items[4]?.querySelector('[data-load-tag]');
    expect(tag?.textContent).toContain('أقصى حمولة');
    expect(tag?.textContent).toContain('طن');
    expect(tag?.querySelector('bdi')?.textContent).toBe('Grove GMK6350');
  });

  it('shows a draft badge on every unverified crane in staging', () => {
    expect(html.querySelectorAll('[data-hoist-item] [data-testid="draft-badge"]')).toHaveLength(5);
  });

  it('puts nothing above the heading and offers a skip link to the full list', () => {
    expect(html.querySelector('h2#hoist-title')?.previousElementSibling).toBeNull();
    expect(html.querySelector('a[href="#crane-list"]')?.textContent).toBe('اعرض كل الرافعات');
    expect(html.querySelector('ol[data-hoist-list]')?.getAttribute('aria-labelledby')).toBe('hoist-list-title');
  });
});

describe('cropVisibility', () => {
  it.each([
    [true, true, ''],
    [true, false, 'max-md:hidden'],
    [false, true, 'md:hidden'],
    [false, false, null],
  ])('desktop=%s mobile=%s', (d, m, expected) => {
    expect(cropVisibility(d, m)).toBe(expected);
  });
});

describe('Hoist Part D contract', () => {
  const html = renderHtml(<Hoist />, 'ar');
  const item = (id: string) => html.querySelector(`[data-hoist-item][data-crane="${id}"]`);

  it('has exactly one hook anchor, desktop-only, inside the gmk6350 photo box', () => {
    const anchors = html.querySelectorAll('[data-hook-anchor]');
    expect(anchors).toHaveLength(1);
    const photo = item('gmk6350')?.querySelector('[data-hoist-photo]');
    expect(photo?.contains(anchors[0] ?? null)).toBe(true);
    expect(anchors[0]?.className).toContain('max-md:hidden');
    const style = photo?.getAttribute('style') ?? '';
    expect(style).toContain('--hx-d');
    expect(style).toContain('--hy-d');
    expect(style).not.toContain('--hx-m');
    for (const id of ['rt700e', 'atf60-3', 'ac200-1', 'quy250']) {
      expect(item(id)?.querySelector('[data-hook-anchor]')).toBeNull();
    }
  });

  it('gives every photo box both aspect ratios and the list a list role', () => {
    for (const photo of html.querySelectorAll('[data-hoist-photo]')) {
      const style = photo.getAttribute('style') ?? '';
      expect(style).toContain('--ar-d');
      expect(style).toContain('--ar-m');
    }
    expect(html.querySelector('ol[data-hoist-list]')?.getAttribute('role')).toBe('list');
  });
});

describe('LoadTag accessibility and layout', () => {
  it.each(['ar', 'en'] as const)('hides the counter from AT and repeats the final number for it (%s)', (lang) => {
    const html = renderHtml(<Hoist />, lang);
    const counters = html.querySelectorAll('[data-counter]');
    expect(counters).toHaveLength(5);
    for (const counter of counters) {
      expect(counter.getAttribute('aria-hidden')).toBe('true');
      const sibling = counter.nextElementSibling;
      expect(sibling?.className).toContain('sr-only');
      expect(sibling?.textContent).toBe(counter.textContent);
    }
  });

  it('stacks Model and Type until 26rem', () => {
    const dl = renderHtml(<Hoist />, 'ar').querySelector('[data-load-tag] dl');
    expect(dl?.className).toContain('grid-cols-1');
    expect(dl?.className).toContain('min-[26rem]:grid-cols-2');
  });
});

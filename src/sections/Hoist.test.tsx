// @vitest-environment jsdom
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import type { CropImage } from '@/generated/images';
import { click, mount, renderHtml } from '@/test/render';
import { getRequestedCrane, setRequestedCrane } from '@/lib/request';
import { cropVisibility, Hoist, hookPosition } from './Hoist';

describe('hookPosition', () => {
  it('turns a source-pixel hook point into percentages of the crop', () => {
    const image: CropImage = {
      photo: '6389',
      crop: 'desktop_16x9',
      rect: { left: 0, top: 100, width: 4240, height: 2385 },
      avif: [],
      webp: [],
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
    expect(items.map((li) => li.getAttribute('data-capacity'))).toEqual(['55', '60', '200', '250', '317.5']);
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

  it('holds the readout at a size its column can always fit', () => {
    const readout = renderHtml(<Hoist />, 'ar').querySelector('[data-load-tag] [data-readout]');
    expect(readout?.className).toContain('t-readout');
    expect(readout?.className).toContain('cqi'); // sized by its container, so "317.5 طن" never wraps
    expect(readout?.closest('[data-load-tag]')?.className).toContain('@container');
  });
});

describe('Hoist v2', () => {
  it.each(['ar', 'en'] as const)('explains the "350 TON" on the GMK6350 boom with its metric rating, on that crane only (%s)', (lang) => {
    const html = renderHtml(<Hoist />, lang);
    const notes = [...html.querySelectorAll('[data-load-tag] p')];
    expect(notes).toHaveLength(1);
    expect(notes[0]?.closest('[data-hoist-item]')?.getAttribute('data-crane')).toBe('gmk6350');
    expect(notes[0]?.textContent).toContain('350');
    expect(notes[0]?.textContent).toContain(lang === 'ar' ? '317.5\u00A0طن' : '317.5\u00A0t');
    expect(notes[0]?.textContent).not.toContain('{');
  });

  it('renders the five capacities as an index above the list, one link per crane, each pointing at its item', () => {
    const html = renderHtml(<Hoist />, 'en');
    const nav = html.querySelector('nav[data-hoist-chapters]');
    expect(nav?.className).toContain('order-first'); // above the list until hoist.ts moves it into the stage
    expect(nav?.querySelector('[data-chapter-track]')?.className).toContain('hidden'); // progress tracks: stage only
    expect(nav?.getAttribute('aria-label')).toBe('Go to a crane');
    const links = [...(nav?.querySelectorAll('a[data-chapter]') ?? [])];
    expect(links.map((a) => a.getAttribute('data-chapter'))).toEqual(['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350']);
    for (const a of links) {
      const id = a.getAttribute('href')?.slice(1) ?? '';
      expect(html.querySelector(`[data-hoist-item][id="${id}"]`)?.getAttribute('data-crane')).toBe(a.getAttribute('data-chapter'));
      expect(a.querySelector('[data-chapter-fill]')?.closest('[aria-hidden="true"]')).not.toBeNull();
    }
    expect(links[4]?.textContent).toBe('317.5\u00A0tGMK6350');
    // In Arabic the Latin code must sit under its own capacity (start = right), not stretch and align left.
    for (const bdi of nav?.querySelectorAll('bdi') ?? []) expect(bdi.className).toContain('self-start');
  });

  it('puts the list and the progress links inside the sticky stage, inside its track', () => {
    const html = renderHtml(<Hoist />, 'ar');
    const stage = html.querySelector('[data-hoist-track] > [data-hoist-stage]');
    expect(stage?.querySelector(':scope > ol[data-hoist-list]')).not.toBeNull();
    expect(stage?.querySelector(':scope > nav[data-hoist-chapters]')).not.toBeNull();
  });

  it('is a v2 black section with rounded photo frames and none of the v1 look', () => {
    for (const lang of ['ar', 'en'] as const) {
      const section = renderHtml(<Hoist />, lang).querySelector('section#cranes');
      expect(section?.getAttribute('data-ground')).toBe('dark');
      expect(section?.className).toContain('surface-dark');
      for (const photo of section?.querySelectorAll('[data-hoist-photo]') ?? []) expect(photo.className).toContain('frame');
      expect(section?.outerHTML).not.toMatch(/bg-navy-950|t-h2|t-lead|section-y|text-steel|outline-on-dark/);
      expect(section?.querySelector('h2')?.className).toContain('t-headline');
    }
  });

  it('closes on a white pill to the request form, leaving red to the header and the request bar', () => {
    const html = renderHtml(<Hoist />, 'en');
    const cta = html.querySelector('section#cranes a[href="#request"]');
    expect(cta?.textContent).toBe('Send the details');
    expect(cta?.className).toContain('bg-white');
    expect(html.querySelectorAll('section#cranes .bg-red')).toHaveLength(0);
  });

  it('states the radius caveat before the list, not after it', () => {
    const html = renderHtml(<Hoist />, 'en');
    const caveat = [...html.querySelectorAll('section#cranes p')].find((p) => p.textContent?.startsWith('Maximum capacity is'));
    const list = html.querySelector('[data-hoist-track]');
    expect(caveat && list && caveat.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('gives every crane a heading and a "Request this crane" button named after it', () => {
    const html = renderHtml(<Hoist />, 'ar');
    const items = [...html.querySelectorAll('[data-hoist-item]')];
    for (const li of items) {
      expect(li.querySelector('h4')?.textContent).toMatch(/^(Grove|Tadano|Terex|Fuwa)/);
      const button = li.querySelector('button[data-hoist-request]');
      expect(button?.getAttribute('data-hoist-request')).toBe(li.getAttribute('data-crane'));
      expect(button?.textContent).toContain('اطلب هذه الرافعة');
      expect(button?.textContent).toContain(li.querySelector('h4')?.textContent ?? '?');
    }
  });

  it('puts the crane on the hook when its button is pressed', async () => {
    const { host } = await mount(<Hoist />, 'en');
    const button = host.querySelector('button[data-hoist-request="ac200-1"]');
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    await click(button);
    expect(getRequestedCrane()).toBe('ac200-1');
    expect(button?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelectorAll('button[data-hoist-request][aria-pressed="true"]')).toHaveLength(1);
    await act(async () => setRequestedCrane(null));
    expect(button?.getAttribute('aria-pressed')).toBe('false');
  });
});

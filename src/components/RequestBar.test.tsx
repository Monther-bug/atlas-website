// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
  target: 'staging' as 'staging' | 'production',
  siteUrl: 'http://localhost:4173',
  whatsapp: null as string | null,
  phone: null as string | null,
  formEndpoint: null as string | null,
  ga4Id: null as string | null,
}));
vi.mock('@/env', () => ({ env: mockEnv }));

import { getRequestedCrane, setRequestedCrane } from '@/lib/request';
import { click, mount, renderHtml } from '@/test/render';
import { RequestBar } from './RequestBar';

beforeEach(() => {
  mockEnv.whatsapp = '218911234567';
  mockEnv.phone = null;
});
afterEach(() => setRequestedCrane(null));

describe('RequestBar', () => {
  it('offers WhatsApp with the general message and no Call without a phone', () => {
    const html = renderHtml(<RequestBar />, 'en');
    const bar = html.querySelector('[data-request-bar][data-testid="request-bar"]');
    const whatsapp = bar?.querySelector('a[data-testid="bar-whatsapp"][data-bar-whatsapp]');
    expect(whatsapp?.getAttribute('href')).toBe(
      `https://wa.me/218911234567?text=${encodeURIComponent('Hello Atlas Alshraa,\nI found you through your website and would like to ask about your services.')}`,
    );
    expect(bar?.querySelector('[data-testid="bar-call"]')).toBeNull();
    expect(bar?.querySelector('[data-testid="bar-chip"]')).toBeNull();
  });

  it('adds Call when a phone number is set', () => {
    mockEnv.phone = '+218 91 123 4567';
    const call = renderHtml(<RequestBar />, 'ar').querySelector('a[data-testid="bar-call"]');
    expect(call?.getAttribute('href')).toBe('tel:+218911234567');
    expect(call?.getAttribute('aria-label')).toBe('اتصل بنا على +218 91 123 4567');
  });

  it('is a floating glass pill on the dark ground with an elevation token from the scale', () => {
    const bar = renderHtml(<RequestBar />).querySelector('[data-request-bar]');
    const classes = bar?.className.split(' ') ?? [];
    expect(classes).toEqual(expect.arrayContaining(['glass-dark', 'rounded-full', 'shadow-e3']));
    expect(bar?.getAttribute('data-ground')).toBe('dark');
    expect(bar?.querySelector('[data-bar-whatsapp]')?.className).toContain('bg-red');
  });

  it('keeps the bar clear of the dock: it only fades, it never carries a transform class', () => {
    const bar = renderHtml(<RequestBar />).querySelector('[data-request-bar]');
    expect(bar?.className).not.toMatch(/(^|\s)(-?translate|scale|rotate)/);
    expect(bar?.className).toContain('transition-[opacity,visibility]');
  });

  it('gives the crane chip its own solid fill, so the ride ghost looks the same in flight', async () => {
    const { host, unmount } = await mount(<RequestBar />, 'en');
    await act(async () => setRequestedCrane('gmk6350'));
    expect(host.querySelector('[data-bar-chip]')?.className).toContain('bg-neutral-800');
    await unmount();
  });

  it('shows the crane on the hook, switches to template B and clears with an SVG close button', async () => {
    const { host, unmount } = await mount(<RequestBar />, 'en');
    await act(async () => setRequestedCrane('gmk6350'));
    const chip = host.querySelector('[data-bar-chip][data-testid="bar-chip"]');
    expect(chip?.textContent).toContain('On the hook:');
    expect(chip?.querySelector('bdi')?.textContent).toBe('GMK6350');
    const href = host.querySelector('[data-testid="bar-whatsapp"]')?.getAttribute('href') ?? '';
    expect(new URL(href).searchParams.get('text')).toContain('I would like to ask about the Grove GMK6350 (All-terrain).');
    const clear = host.querySelector('button[data-testid="bar-chip-clear"]');
    expect(clear?.getAttribute('aria-label')).toBe('Remove this crane from the request');
    expect(clear?.querySelector('svg')).not.toBeNull();
    expect(clear?.textContent).toBe('');
    await click(clear);
    expect(document.activeElement).toBe(host.querySelector('[data-testid="bar-whatsapp"]'));
    expect(getRequestedCrane()).toBeNull();
    expect(host.querySelector('[data-testid="bar-chip"]')).toBeNull();
    await unmount();
  });

  it('announces the crane on the hook in the live region', async () => {
    const { host, unmount } = await mount(<RequestBar />, 'en');
    await act(async () => setRequestedCrane('gmk6350'));
    expect(host.querySelector('[aria-live="polite"]')?.textContent).toMatch(/^On the hook: .*GMK6350/);
    await unmount();
  });

  it('renders no chip for an unknown crane id', async () => {
    const { host, unmount } = await mount(<RequestBar />, 'en');
    await act(async () => setRequestedCrane('nope' as never));
    expect(host.querySelector('[data-testid="bar-chip"]')).toBeNull();
    await unmount();
  });

  describe('waits while the hero is on screen (Impeccable gate 1)', () => {
    let observers: { cb: (e: { isIntersecting: boolean }[]) => void; disconnect: ReturnType<typeof vi.fn> }[];
    beforeEach(() => {
      observers = [];
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          disconnect = vi.fn();
          observe = vi.fn();
          constructor(cb: (e: { isIntersecting: boolean }[]) => void) {
            observers.push({ cb, disconnect: this.disconnect });
          }
        },
      );
    });
    afterEach(() => {
      vi.unstubAllGlobals();
      document.getElementById('top')?.remove();
    });

    it('is marked over-hero in the prerendered HTML, so it never covers the first screen', () => {
      expect(renderHtml(<RequestBar />).querySelector('[data-request-bar]')?.hasAttribute('data-over-hero')).toBe(true);
    });

    it('shows once the hero leaves the viewport and waits again when it returns', async () => {
      const hero = document.createElement('section');
      hero.id = 'top';
      document.body.append(hero);
      const { host, unmount } = await mount(<RequestBar />, 'en');
      const bar = () => host.querySelector('[data-request-bar]');
      expect(observers).toHaveLength(1);
      expect(bar()?.hasAttribute('data-over-hero')).toBe(true);
      await act(async () => observers[0].cb([{ isIntersecting: false }]));
      expect(bar()?.hasAttribute('data-over-hero')).toBe(false);
      await act(async () => observers[0].cb([{ isIntersecting: true }]));
      expect(bar()?.hasAttribute('data-over-hero')).toBe(true);
      await unmount();
      expect(observers[0].disconnect).toHaveBeenCalled();
    });

    it('shows straight away on a page without a hero', async () => {
      const { host, unmount } = await mount(<RequestBar />, 'en');
      expect(host.querySelector('[data-request-bar]')?.hasAttribute('data-over-hero')).toBe(false);
      await unmount();
    });
  });

  describe('keyboard focus and the bar (WCAG 2.4.11)', () => {
    const rect = (top: number, bottom: number) => ({ top, bottom, left: 0, right: 400, width: 400, height: bottom - top, x: 0, y: top, toJSON() {} }) as DOMRect;

    it('scrolls a control that lands under the bar clear of it, and steps aside when it cannot', async () => {
      const { host, unmount } = await mount(<RequestBar />, 'en');
      const bar = host.querySelector<HTMLElement>('[data-request-bar]')!;
      bar.getBoundingClientRect = () => rect(760, 830);
      const field = document.createElement('button');
      document.body.append(field);
      let box = rect(700, 790); // its lower part under the bar
      field.getBoundingClientRect = () => box;
      field.scrollIntoView = vi.fn(() => {
        box = rect(500, 590); // cleared
      });
      await act(async () => field.focus());
      expect(field.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
      expect(bar.hasAttribute('data-yield')).toBe(false);

      // Too tall to clear: the bar steps aside while it has focus, and comes back when focus moves on.
      const card = document.createElement('button');
      document.body.append(card);
      card.getBoundingClientRect = () => rect(80, 800);
      card.scrollIntoView = vi.fn();
      // jsdom has no keyboard modality: say this focus is a keyboard (focus-visible) one.
      card.matches = ((selector: string) => selector === ':focus-visible' || Element.prototype.matches.call(card, selector)) as typeof card.matches;
      await act(async () => card.focus());
      expect(bar.hasAttribute('data-yield')).toBe(true);
      await act(async () => card.blur());
      expect(bar.hasAttribute('data-yield')).toBe(false);
      field.remove();
      card.remove();
      await unmount();
    });
  });
});

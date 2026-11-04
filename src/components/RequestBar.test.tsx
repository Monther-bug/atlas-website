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
vi.mock('@/env', () => ({ env: mockEnv, isDraft: (verified: boolean) => !verified && mockEnv.target !== 'production' }));

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

  it('uses the one shadow token from spec §15.6 (C11 `shadow-bar`)', () => {
    const bar = renderHtml(<RequestBar />).querySelector('[data-request-bar]');
    expect(bar?.className.split(' ')).toContain('shadow-bar');
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
});

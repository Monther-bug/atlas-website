// @vitest-environment jsdom
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

// A fresh module per test, because loadAnalytics() runs only once per page.
const load = () => import('./analytics');
const entries = () => (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  // Force the setTimeout fallback so fake timers control it, whether or not this jsdom has requestIdleCallback.
  Object.defineProperty(window, 'requestIdleCallback', { value: undefined, configurable: true, writable: true });
  delete window.gtag;
  delete window.dataLayer;
  document.head.innerHTML = '';
  mockEnv.ga4Id = null;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('analytics', () => {
  it('does nothing without a GA4 id', async () => {
    const { loadAnalytics, track } = await load();
    track('whatsapp_click', { location: 'hero' });
    loadAnalytics();
    window.dispatchEvent(new Event('load'));
    vi.runAllTimers();
    expect(window.dataLayer).toBeUndefined();
    expect(window.gtag).toBeUndefined();
    expect(document.querySelector('script')).toBeNull();
  });

  it('queues events in the dataLayer before gtag.js arrives', async () => {
    mockEnv.ga4Id = 'G-TEST123';
    const { track } = await load();
    track('whatsapp_click', { location: 'hero' });
    track('call_click');
    const queued = entries();
    expect(queued[0]?.[0]).toBe('js');
    expect(queued[1]).toEqual(['config', 'G-TEST123']);
    expect(queued[2]).toEqual(['event', 'whatsapp_click', { location: 'hero' }]);
    expect(queued[3]).toEqual(['event', 'call_click', {}]);
    expect(document.querySelector('script')).toBeNull();
  });

  it('injects gtag.js once, after load and idle time', async () => {
    mockEnv.ga4Id = 'G-TEST123';
    const { loadAnalytics } = await load();
    loadAnalytics();
    loadAnalytics();
    window.dispatchEvent(new Event('load'));
    expect(document.querySelectorAll('script')).toHaveLength(0);
    vi.runAllTimers();
    const scripts = document.querySelectorAll('script');
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.getAttribute('src')).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST123');
    expect(scripts[0]?.async).toBe(true);
  });
});

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
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));
vi.mock('@/env', () => ({ env: mockEnv, isDraft: (verified: boolean) => !verified && mockEnv.target !== 'production' }));

import { track } from '@/lib/analytics';
import { click, mount, renderHtml } from '@/test/render';
import { Header } from './Header';

beforeEach(() => {
  mockEnv.phone = null;
  mockEnv.whatsapp = null;
});

describe('Header', () => {
  it('is the C9 header with the four nav targets in order', () => {
    const html = renderHtml(<Header />, 'ar');
    expect(html.querySelector('header[data-header]')).not.toBeNull();
    const links = [...html.querySelectorAll('header > div nav a')].map((a) => [a.getAttribute('href'), a.textContent]);
    expect(links).toEqual([
      ['#services', 'الخدمات'],
      ['#cranes', 'الرافعات'],
      ['#sites', 'مواقع العمل'],
      ['#request', 'تواصل معنا'],
    ]);
    expect(html.querySelector('header > div > div a[href="#request"]')?.textContent).toBe('اطلب رافعة');
  });

  it('switches to the other language with lang and hreflang set', () => {
    const ar = renderHtml(<Header />, 'ar').querySelector('[data-testid="lang-switch"]');
    expect([ar?.getAttribute('href'), ar?.getAttribute('hreflang'), ar?.getAttribute('lang'), ar?.textContent]).toEqual([
      '/en/',
      'en',
      'en',
      'English',
    ]);
    const en = renderHtml(<Header />, 'en').querySelector('[data-testid="lang-switch"]');
    expect([en?.getAttribute('href'), en?.getAttribute('lang'), en?.textContent]).toEqual(['/', 'ar', 'عربي']);
  });

  it('has a native dialog menu with WhatsApp and no Call without a phone', () => {
    const html = renderHtml(<Header />, 'en');
    expect(html.querySelector('button[data-testid="menu-open"]')).not.toBeNull();
    const dialog = html.querySelector('dialog[data-testid="menu-dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.querySelector('a[href^="mailto:"]')?.textContent).toContain('Message us on WhatsApp');
    expect(dialog?.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it('adds Call to the menu when a phone number is set', () => {
    mockEnv.phone = '+218 91 123 4567';
    const call = renderHtml(<Header />, 'en').querySelector('dialog a[href="tel:+218911234567"]');
    expect(call?.getAttribute('aria-label')).toBe('Call us on +218 91 123 4567');
  });
});

describe('Header behaviour', () => {
  let observers: { cb: (e: { isIntersecting: boolean }[]) => void; disconnect: ReturnType<typeof vi.fn> }[];
  let mqListeners: ((e: { matches: boolean }) => void)[];
  const realShowModal = HTMLDialogElement.prototype.showModal;
  const realClose = HTMLDialogElement.prototype.close;

  beforeEach(() => {
    observers = [];
    mqListeners = [];
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
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => mqListeners.push(cb),
      removeEventListener: vi.fn(),
    }));
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    HTMLDialogElement.prototype.showModal = realShowModal;
    HTMLDialogElement.prototype.close = realClose;
    document.getElementById('top')?.remove();
  });

  const addHero = () => {
    const hero = document.createElement('div');
    hero.id = 'top';
    document.body.append(hero);
  };

  it('is solid by default in the server markup', () => {
    const header = renderHtml(<Header />, 'en').querySelector('header');
    expect(header?.hasAttribute('data-top')).toBe(false);
    expect(header?.className).toContain('bg-navy-950');
  });

  it('opens the menu with showModal and syncs aria-expanded, also on native close', async () => {
    const { host } = await mount(<Header />, 'en');
    const toggle = host.querySelector('[data-testid="menu-open"]');
    expect(toggle?.getAttribute('aria-controls')).toBe('menu-dialog');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    await click(toggle);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    await act(async () => host.querySelector('dialog')?.dispatchEvent(new Event('close')));
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the menu when the viewport becomes desktop width', async () => {
    const { host } = await mount(<Header />, 'en');
    const toggle = host.querySelector('[data-testid="menu-open"]');
    await click(toggle);
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    await act(async () => mqListeners.forEach((cb) => cb({ matches: true })));
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the menu when a menu link is clicked', async () => {
    const { host } = await mount(<Header />, 'en');
    await click(host.querySelector('dialog nav a'));
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it('sets data-top only while the hero intersects, and disconnects on unmount', async () => {
    addHero();
    const { host, unmount } = await mount(<Header />, 'en');
    const header = host.querySelector('header');
    await act(async () => observers[0]?.cb([{ isIntersecting: true }]));
    expect(header?.hasAttribute('data-top')).toBe(true);
    await act(async () => observers[0]?.cb([{ isIntersecting: false }]));
    expect(header?.hasAttribute('data-top')).toBe(false);
    await unmount();
    expect(observers[0]?.disconnect).toHaveBeenCalled();
  });

  it('stays solid without a #top element', async () => {
    const { host } = await mount(<Header />, 'en');
    expect(observers).toHaveLength(0);
    expect(host.querySelector('header')?.hasAttribute('data-top')).toBe(false);
  });

  it('tracks the language switch', async () => {
    const { host } = await mount(<Header />, 'en');
    host.querySelector('[data-testid="lang-switch"]')?.addEventListener('click', (e) => e.preventDefault());
    await click(host.querySelector('[data-testid="lang-switch"]'));
    expect(track).toHaveBeenCalledWith('lang_switch');
  });

  it('wraps the phone in direction marks in the Arabic call label', () => {
    mockEnv.phone = '+218 91 123 4567';
    const call = renderHtml(<Header />, 'ar').querySelector('dialog a[href^="tel:"]');
    expect(call?.getAttribute('aria-label')).toContain('\u200E+218 91 123 4567\u200E');
  });
});

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
    const links = [...html.querySelectorAll('header > div > nav a')].map((a) => [a.getAttribute('href'), a.textContent]);
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
  let mqListeners: ((e: { matches: boolean }) => void)[];
  let grounds: Element[];
  const realShowModal = HTMLDialogElement.prototype.showModal;
  const realClose = HTMLDialogElement.prototype.close;
  const realFromPoint = (document as { elementsFromPoint?: unknown }).elementsFromPoint;

  beforeEach(() => {
    mqListeners = [];
    grounds = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0; // a synchronous frame: read() has already run and reset its own handle
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => mqListeners.push(cb),
      removeEventListener: vi.fn(),
    }));
    Object.defineProperty(document, 'elementsFromPoint', { configurable: true, value: () => grounds });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
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
    Object.defineProperty(document, 'elementsFromPoint', { configurable: true, value: realFromPoint });
    document.body.innerHTML = '';
  });

  const addEl = (html: string) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const el = wrap.firstElementChild as HTMLElement;
    document.body.append(el);
    return el;
  };
  const scroll = async (y: number) => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
    await act(async () => window.dispatchEvent(new Event('scroll')));
  };

  it('is dark glass in the server markup: nothing transparent, no data-top, nothing active', () => {
    const html = renderHtml(<Header />, 'en');
    const header = html.querySelector('header');
    expect(header?.hasAttribute('data-top')).toBe(false);
    expect(header?.getAttribute('data-ground')).toBe('dark');
    expect(header?.querySelector('.glass-dark')?.className).toContain('opacity-100');
    expect(header?.querySelector('.glass-light')?.className).toContain('opacity-0');
    expect(header?.querySelector('[aria-current]')).toBeNull();
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

  it('is transparent (data-top) only within the first pixels of a page that has a hero', async () => {
    addEl('<section id="top"></section>');
    const { host } = await mount(<Header />, 'en');
    const header = host.querySelector('header');
    expect(header?.hasAttribute('data-top')).toBe(true);
    expect(header?.querySelector('.glass-dark')?.className).toContain('opacity-0');
    await scroll(200);
    expect(header?.hasAttribute('data-top')).toBe(false);
    expect(header?.querySelector('.glass-dark')?.className).toContain('opacity-100');
    await scroll(0);
    expect(header?.hasAttribute('data-top')).toBe(true);
  });

  it('stays glass without a #top element', async () => {
    const { host } = await mount(<Header />, 'en');
    expect(host.querySelector('header')?.hasAttribute('data-top')).toBe(false);
  });

  it('turns to white glass over a light ground and back to black over a dark one', async () => {
    grounds = [addEl('<section data-ground="light"><p></p></section>')];
    const { host } = await mount(<Header />, 'en');
    const header = host.querySelector('header');
    expect(header?.getAttribute('data-ground')).toBe('light');
    expect(header?.querySelector('.glass-light')?.className).toContain('opacity-100');
    expect(header?.querySelector('.glass-dark')?.className).toContain('opacity-0');
    grounds = [addEl('<section data-ground="dark"></section>')];
    await scroll(100);
    expect(header?.getAttribute('data-ground')).toBe('dark');
  });

  it('reads the ground from the first opaque background when a section declares none', async () => {
    grounds = [addEl('<section style="background-color: rgb(255, 255, 255)"><p></p></section>')];
    const { host } = await mount(<Header />, 'en');
    expect(host.querySelector('header')?.getAttribute('data-ground')).toBe('light');
    grounds = [addEl('<section style="background-color: rgb(10, 10, 10)"></section>')];
    await scroll(50);
    expect(host.querySelector('header')?.getAttribute('data-ground')).toBe('dark');
  });

  it('marks the nav target under the spy line as current, and none between targets', async () => {
    const inView = addEl('<section id="cranes"></section>');
    addEl('<section id="services"></section>');
    vi.spyOn(inView, 'getBoundingClientRect').mockReturnValue({ top: -300, bottom: 600 } as DOMRect);
    const { host } = await mount(<Header />, 'en');
    const current = host.querySelectorAll('header > div > nav [aria-current]');
    expect(current).toHaveLength(1);
    expect(current[0]?.getAttribute('href')).toBe('#cranes');
    vi.spyOn(inView, 'getBoundingClientRect').mockReturnValue({ top: 200, bottom: 900 } as DOMRect);
    await scroll(10);
    expect(host.querySelector('header > div > nav [aria-current]')).toBeNull();
  });

  it('puts the sliding pill behind a focused link and takes it away when focus leaves the nav', async () => {
    const { host } = await mount(<Header />, 'en');
    const pill = host.querySelector<HTMLElement>('header > div > nav ul > span');
    expect(pill?.dataset.on).toBe('false');
    const link = host.querySelector<HTMLElement>('[data-nav="sites"]');
    await act(async () => link?.focus());
    expect(pill?.dataset.on).toBe('true');
    await act(async () => link?.blur());
    expect(pill?.dataset.on).toBe('false');
  });

  it('removes its scroll listeners on unmount', async () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = await mount(<Header />, 'en');
    await unmount();
    expect(remove.mock.calls.map((c) => c[0])).toEqual(expect.arrayContaining(['scroll', 'resize', 'hashchange']));
  });

  it('tracks the language switch', async () => {
    const { host } = await mount(<Header />, 'en');
    host.querySelector('[data-testid="lang-switch"]')?.addEventListener('click', (e) => e.preventDefault());
    await click(host.querySelector('[data-testid="lang-switch"]'));
    expect(track).toHaveBeenCalledWith('lang_switch');
  });

  it('also offers the language switch inside the menu sheet, which covers the bar', () => {
    const link = renderHtml(<Header />, 'ar').querySelector('dialog [data-testid="menu-lang-switch"]');
    expect(link?.getAttribute('href')).toBe('/en/');
  });

  it('wraps the phone in direction marks in the Arabic call label', () => {
    mockEnv.phone = '+218 91 123 4567';
    const call = renderHtml(<Header />, 'ar').querySelector('dialog a[href^="tel:"]');
    expect(call?.getAttribute('aria-label')).toContain('\u200E+218 91 123 4567\u200E');
  });
});

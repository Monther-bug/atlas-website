// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
  target: 'staging' as 'staging' | 'production',
  siteUrl: 'http://localhost:4173',
  whatsapp: null as string | null,
  phone: null as string | null,
  formEndpoint: null as string | null,
  ga4Id: null as string | null,
}));
vi.mock('@/lib/analytics', () => ({ track: vi.fn(), loadAnalytics: vi.fn() }));
vi.mock('@/env', () => ({ env: mockEnv, isDraft: (verified: boolean) => !verified && mockEnv.target !== 'production' }));

import { track } from '@/lib/analytics';
import { setRequestedCrane } from '@/lib/request';
import { changeValue, click, mount, renderHtml } from '@/test/render';
import { RequestForm } from './RequestForm';
import { REQUEST_FIELDS } from './request-form-logic';

afterEach(() => setRequestedCrane(null));

describe('RequestForm', () => {
  it('is #request with the heading first and the dialect line below it', () => {
    const html = renderHtml(<RequestForm />, 'ar');
    const h2 = html.querySelector('section#request h2');
    expect(h2?.textContent).toBe('شنو الرافعة اللي يحتاجها مشروعك؟');
    expect(h2?.previousElementSibling).toBeNull();
    expect(h2?.nextElementSibling?.textContent).toBe('تواصلوا معانا وخلي الباقي علينا');
  });

  it('shows five fields by default and keeps the other six behind one closed disclosure', () => {
    const form = renderHtml(<RequestForm />, 'en').querySelector('form[data-testid="request-form"]');
    const names = (root: ParentNode | null | undefined) => [...(root?.querySelectorAll<HTMLElement>('[name]') ?? [])].map((el) => el.getAttribute('name'));
    const more = form?.querySelector('details[data-testid="form-more"]');
    expect(more?.hasAttribute('open')).toBe(false);
    expect(more?.querySelector('summary')?.textContent).toContain('Add more details (optional)');
    expect(names(more)).toEqual(['company', 'radius', 'height', 'start', 'duration', 'message']);
    expect(names(form).filter((n) => !names(more).includes(n))).toEqual(['phone', 'weight', 'crane', 'site', 'name']);
    expect([...REQUEST_FIELDS].sort()).toEqual(names(form).sort());
    // Only the phone keeps a hint; the controls carry no stray describedby.
    for (const el of form?.querySelectorAll<HTMLElement>('[name]') ?? []) {
      const d = el.getAttribute('aria-describedby');
      if (el.getAttribute('name') === 'phone') expect(form?.querySelector(`#${d}`)?.textContent).toContain('country code');
      else expect(d).toBeNull();
    }
    expect(form?.querySelectorAll('legend, fieldset, h3').length).toBe(0);
    expect(form?.querySelector('[data-testid="form-lift-summary"]')).toBeNull();
    const weight = form?.querySelector('[data-testid="form-weight"]');
    expect([weight?.getAttribute('inputmode'), weight?.getAttribute('aria-required')]).toEqual(['decimal', 'true']);
    const phone = form?.querySelector('[data-testid="form-phone"]');
    expect([phone?.getAttribute('type'), phone?.getAttribute('aria-required')]).toEqual(['tel', 'true']);
    const submit = form?.querySelector('[data-testid="form-submit"]');
    // Idle and busy labels share one grid cell so the button keeps its width.
    expect(submit?.textContent).toBe('Send requestSending…');
    expect(form?.querySelector('[data-testid="form-error-summary"]')).toBeNull();
  });

  it('offers every service and every visible crane', () => {
    const options = [...renderHtml(<RequestForm />, 'en').querySelectorAll('select[name="crane"] option')];
    expect(options.map((o) => o.getAttribute('value'))).toEqual([
      '',
      'service:crane-hire',
      'service:heavy-transport',
      'service:handling',
      'service:oil-services',
      'crane:rt700e',
      'crane:atf60-3',
      'crane:ac200-1',
      'crane:quy250',
      'crane:gmk6350',
    ]);
  });

  it('pre-fills the crane on the hook and clears it when the hook is cleared', async () => {
    const { host, unmount } = await mount(<RequestForm />, 'en');
    const select = host.querySelector<HTMLSelectElement>('select[name="crane"]');
    await act(async () => setRequestedCrane('gmk6350'));
    expect(select?.value).toBe('crane:gmk6350');
    await act(async () => setRequestedCrane(null));
    expect(select?.value).toBe('');
    await unmount();
  });

  it('shows and focuses an error summary, then clears it as fields are fixed', async () => {
    const { host, unmount } = await mount(<RequestForm />, 'ar');
    await click(host.querySelector('[data-testid="form-submit"]'));
    const summary = host.querySelector<HTMLElement>('[data-testid="form-error-summary"]');
    expect(summary).not.toBeNull();
    expect(document.activeElement).toBe(summary);
    expect([...(summary?.querySelectorAll('a') ?? [])].map((a) => a.getAttribute('href'))).toEqual([
      '#request-phone',
      '#request-weight',
    ]);
    expect(host.querySelector('[data-testid="form-weight"]')?.getAttribute('aria-invalid')).toBe('true');
    expect(host.querySelector('[data-testid="form-weight"]')?.getAttribute('aria-describedby')).toBe('request-weight-error');
    await changeValue(host.querySelector('[data-testid="form-weight"]'), '٣٥٠');
    await changeValue(host.querySelector('[data-testid="form-phone"]'), '0912345678');
    expect(host.querySelector('[data-testid="form-error-summary"]')).toBeNull();
    expect(host.querySelector('[data-testid="form-weight"]')?.hasAttribute('aria-invalid')).toBe(false);
    await unmount();
  });

  it('posts to the endpoint, announces busy then success in its live region', async () => {
    mockEnv.formEndpoint = 'https://forms.example/x';
    let resolve!: (r: { ok: boolean }) => void;
    const fetchMock = vi.fn(() => new Promise((r) => (resolve = r)));
    vi.stubGlobal('fetch', fetchMock);
    const { host, unmount } = await mount(<RequestForm />, 'en');
    await changeValue(host.querySelector('[data-testid="form-weight"]'), '12');
    await changeValue(host.querySelector('[data-testid="form-phone"]'), '0912345678');
    await click(host.querySelector('[data-testid="form-submit"]'));
    const submit = host.querySelector('[data-testid="form-submit"]');
    expect(submit?.getAttribute('aria-busy')).toBe('true');
    expect(host.querySelector('[data-testid="form-live"]')?.textContent).toBe('Sending…');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect([url, init.method, init.signal instanceof AbortSignal]).toEqual(['https://forms.example/x', 'POST', true]);
    await act(async () => resolve({ ok: true }));
    expect(host.querySelector('[data-testid="form-success"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="form-live"]')?.textContent).toBe('We have your request');
    await unmount();
    vi.unstubAllGlobals();
    mockEnv.formEndpoint = null;
  });

  it('shows the failure box when the endpoint fails', async () => {
    mockEnv.formEndpoint = 'https://forms.example/x';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500 })),
    );
    const { host, unmount } = await mount(<RequestForm />, 'en');
    await changeValue(host.querySelector('[data-testid="form-weight"]'), '12');
    await changeValue(host.querySelector('[data-testid="form-phone"]'), '0912345678');
    await click(host.querySelector('[data-testid="form-submit"]'));
    expect(host.querySelector('[data-testid="form-failure"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="request-form"]')).not.toBeNull();
    await unmount();
    vi.unstubAllGlobals();
    mockEnv.formEndpoint = null;
  });

  it('without an endpoint, hands the message to whatsappHref via window.location', async () => {
    const loc = { href: '' };
    vi.stubGlobal('location', loc);
    const { host, unmount } = await mount(<RequestForm />, 'en');
    await changeValue(host.querySelector('[data-testid="form-weight"]'), '12');
    await changeValue(host.querySelector('[data-testid="form-phone"]'), '0912345678');
    await click(host.querySelector('[data-testid="form-submit"]'));
    expect(loc.href).toMatch(/^mailto:/);
    expect(decodeURIComponent(loc.href)).toContain('Load weight: 12 t');
    await unmount();
    vi.unstubAllGlobals();
  });

  const fill = async (host: HTMLElement) => {
    await changeValue(host.querySelector('[data-testid="form-weight"]'), '12');
    await changeValue(host.querySelector('[data-testid="form-phone"]'), '0912345678');
  };

  it('aborts after 10 s and shows the failure state', async () => {
    vi.useFakeTimers();
    mockEnv.formEndpoint = 'https://forms.example/x';
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_, reject) => init.signal?.addEventListener('abort', () => reject(new Error('aborted')))),
      ),
    );
    const { host, unmount } = await mount(<RequestForm />, 'en');
    await fill(host);
    await click(host.querySelector('[data-testid="form-submit"]'));
    expect(host.querySelector('[data-testid="form-failure"]')).toBeNull();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(host.querySelector('[data-testid="form-failure"]')).not.toBeNull();
    await unmount();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    mockEnv.formEndpoint = null;
  });

  it('treats a non-2xx response as a failure', async () => {
    mockEnv.formEndpoint = 'https://forms.example/x';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 422 })),
    );
    const { host, unmount } = await mount(<RequestForm />, 'en');
    await fill(host);
    await click(host.querySelector('[data-testid="form-submit"]'));
    expect(host.querySelector('[data-testid="form-failure"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="form-success"]')).toBeNull();
    await unmount();
    vi.unstubAllGlobals();
    mockEnv.formEndpoint = null;
  });

  it('sends one request when submitted twice while sending', async () => {
    mockEnv.formEndpoint = 'https://forms.example/x';
    const fetchMock = vi.fn(() => new Promise(() => {}));
    vi.stubGlobal('fetch', fetchMock);
    const { host, unmount } = await mount(<RequestForm />, 'en');
    await fill(host);
    const form = host.querySelector('form') as HTMLFormElement;
    await act(async () => form.requestSubmit());
    await act(async () => form.requestSubmit());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await unmount();
    vi.unstubAllGlobals();
    mockEnv.formEndpoint = null;
  });

  it('announces the hand-off, ignores repeats for 3 s, and caps the note in the URL', async () => {
    vi.useFakeTimers();
    const loc = { href: '' };
    vi.stubGlobal('location', loc);
    const { host, unmount } = await mount(<RequestForm />, 'en');
    await fill(host);
    await changeValue(host.querySelector('[name="message"]'), 'y'.repeat(900));
    const form = host.querySelector('form') as HTMLFormElement;
    await act(async () => form.requestSubmit());
    expect(host.querySelector('[data-testid="form-live"]')?.textContent).toBe('Opening your messaging app to send the request.');
    expect(decodeURIComponent(loc.href)).toContain('y'.repeat(500) + '…');
    expect(decodeURIComponent(loc.href)).not.toContain('y'.repeat(501));
    loc.href = '';
    await act(async () => form.requestSubmit());
    expect(loc.href).toBe('');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3100);
    });
    await act(async () => form.requestSubmit());
    expect(loc.href).not.toBe('');
    await unmount();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('caps the free text in the failure-box links and the WhatsApp alternative', async () => {
    mockEnv.formEndpoint = 'https://forms.example/x';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500 })),
    );
    const { host, unmount } = await mount(<RequestForm />, 'en');
    await changeValue(host.querySelector('[data-testid="form-weight"]'), '12');
    await changeValue(host.querySelector('[data-testid="form-phone"]'), '0912345678');
    await changeValue(host.querySelector('[name="message"]'), 'z'.repeat(900));
    await click(host.querySelector('[data-testid="form-submit"]'));
    const links = [...host.querySelectorAll<HTMLAnchorElement>('[data-testid="form-failure"] a, form > div > a')].map((a) =>
      decodeURIComponent(a.getAttribute('href') ?? ''),
    );
    expect(links.length).toBeGreaterThanOrEqual(3);
    for (const href of links) {
      expect(href).toContain('z'.repeat(500) + '…');
      expect(href).not.toContain('z'.repeat(501));
    }
    await unmount();
    vi.unstubAllGlobals();
    mockEnv.formEndpoint = null;
  });

  it('tracks the hand-off as mailto without a WhatsApp number, whatsapp with one', async () => {
    for (const [number, expected] of [
      [null, 'mailto'],
      ['+218912345678', 'whatsapp'],
    ] as const) {
      mockEnv.whatsapp = number;
      vi.mocked(track).mockClear();
      vi.stubGlobal('location', { href: '' });
      const { host, unmount } = await mount(<RequestForm />, 'en');
      await changeValue(host.querySelector('[data-testid="form-weight"]'), '12');
      await changeValue(host.querySelector('[data-testid="form-phone"]'), '0912345678');
      await click(host.querySelector('[data-testid="form-submit"]'));
      expect(track).toHaveBeenCalledWith('form_submit', { result: expected });
      await unmount();
      vi.unstubAllGlobals();
    }
    mockEnv.whatsapp = null;
  });

  it('shows the crane chip when a crane is on the hook', async () => {
    const { host, unmount } = await mount(<RequestForm />, 'en');
    expect(host.querySelector('[data-testid="form-hook-chip"]')).toBeNull();
    await act(async () => setRequestedCrane('gmk6350'));
    expect(host.querySelector('[data-testid="form-hook-chip"]')?.textContent).toContain('GMK6350');
    await unmount();
  });

  it('opens the disclosure for an error inside it, and its summary link focuses that field', async () => {
    const { host, unmount } = await mount(<RequestForm />, 'en');
    await fill(host);
    const more = host.querySelector<HTMLDetailsElement>('details[data-testid="form-more"]');
    expect(more?.open).toBe(false);
    await changeValue(host.querySelector('[name="radius"]'), 'abc');
    await click(host.querySelector('[data-testid="form-submit"]'));
    expect(more?.open).toBe(true);
    const link = host.querySelector<HTMLAnchorElement>('[data-testid="form-error-summary"] a[href="#request-radius"]');
    expect(link).not.toBeNull();
    await click(link);
    expect(document.activeElement?.id).toBe('request-radius');
    expect(host.querySelector('[name="radius"]')?.getAttribute('aria-invalid')).toBe('true');
    await unmount();
  });
});

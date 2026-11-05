// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));

import { track } from '@/lib/analytics';
import { mount, renderHtml } from '@/test/render';
import { Services } from './Services';

const tiles = (html: ParentNode) => [...html.querySelectorAll<HTMLElement>('section#services li[data-service-tile]')];

describe('Services (v2 bento)', () => {
  const html = renderHtml(<Services />, 'en');

  it('is a light (mist) section with the four services in deck order, as a list', () => {
    const section = html.querySelector('section#services');
    expect(section?.getAttribute('data-ground')).toBe('light');
    expect(section?.getAttribute('data-surface')).toBe('mist');
    expect(section?.getAttribute('aria-labelledby')).toBe('services-title');
    expect(section?.querySelector('ul[role="list"]')).not.toBeNull();
    expect(tiles(html).map((t) => t.querySelector('h3')?.textContent)).toEqual([
      'Crane hire',
      'Heavy transport',
      'Handling and rigging',
      'Oil services',
    ]);
    expect(html.textContent).not.toMatch(/\b0[1-4]\b/);
  });

  it('gives every tile a drawn icon and a different kind of media', () => {
    const [hire, transport, handling, oil] = tiles(html);
    for (const tile of tiles(html)) expect(tile.querySelector('h3 svg[aria-hidden="true"]')).not.toBeNull();
    expect(hire?.querySelector('[data-parallax] picture img')?.getAttribute('alt')).toMatch(/GMK6350/);
    expect(transport?.querySelector('svg[data-service-art="route"]')).not.toBeNull();
    expect(handling?.querySelector('picture img')?.getAttribute('alt')).toMatch(/sling/);
    expect(oil?.querySelector('svg[data-service-art="derrick"]')).not.toBeNull();
    expect(oil?.querySelector('picture')).toBeNull(); // no oil photo until Atlas supplies one
    expect(new Set(tiles(html).map((t) => t.getAttribute('data-tone'))).size).toBeGreaterThan(1);
  });

  it('keeps every [[CONFIRM]] visible in staging', () => {
    const text = html.querySelector('section#services')?.textContent ?? '';
    expect(text).toContain('[[CONFIRM: Every crane comes with an experienced operator.]]');
    expect(text).toContain('[[CONFIRM: by road, on low-bed trailers]]');
    expect(text).toContain('[[CONFIRM: with a rigging crew, slings and lifting gear, and a lift plan]]');
    expect(text).toContain('[[CONFIRM: exact scope, for example lifting and transport at oil fields]]');
  });

  it('asks about each service with its own message, name and analytics id', () => {
    const links = tiles(html).map((t) => t.querySelector<HTMLAnchorElement>('a[data-testid="service-ask"]'));
    expect(links.every(Boolean)).toBe(true);
    expect(links.map((a) => a?.dataset.trackService)).toEqual(['crane-hire', 'heavy-transport', 'handling', 'oil-services']);
    expect(links.every((a) => a?.dataset.track === 'whatsapp_click' && a.dataset.trackLocation === 'services')).toBe(true);
    expect(decodeURIComponent(links[3]?.getAttribute('href') ?? '')).toContain('I would like to ask about Oil services.');
    expect(new Set(links.map((a) => a?.textContent)).size).toBe(4); // "Ask about this service: <title>"
    expect(links.every((a) => (a?.className ?? '').includes('min-h-11'))).toBe(true); // 44 px target
  });

  it('offers to combine services in one request', () => {
    const combine = html.querySelector('section#services header a[href="#request"]');
    expect(combine?.textContent).toBe('Combine them in one request');
  });

  it('renders the stagger reveal and one parallax frame only', () => {
    expect(html.querySelectorAll('section#services [data-reveal]')).toHaveLength(1);
    expect(html.querySelector('section#services [data-reveal]')?.getAttribute('data-reveal')).toBe('stagger');
    expect(html.querySelectorAll('section#services [data-parallax]')).toHaveLength(1);
  });

  it('draws the load at rest in the drop zone (the final state, before any motion)', () => {
    const load = html.querySelector('[data-service-art="route"] [data-load]');
    expect(load?.getAttribute('transform')).toBe('translate(288 52)');
    expect(load?.querySelector('rect')?.getAttribute('class')).toBe('fill-red');
  });

  it('renders in Arabic with Arabic titles and per-service messages', () => {
    const ar = renderHtml(<Services />, 'ar');
    const arTiles = tiles(ar);
    expect(arTiles.map((t) => t.querySelector('h3')?.textContent)).toEqual(['تأجير الرافعات', 'النقل الثقيل', 'المناولة', 'الخدمات النفطية']);
    arTiles.forEach((tile) => {
      const href = decodeURIComponent(tile.querySelector('a[data-testid="service-ask"]')?.getAttribute('href') ?? '');
      expect(href).toContain(`أريد الاستفسار عن ${tile.querySelector('h3')?.textContent}.`);
    });
    expect(ar.querySelector('section#services header a[href="#request"]')?.textContent).toBe('اجمعها في طلب واحد');
  });

  it('tracks a click on a service link with the service id (delegated, so the static island needs no handlers)', async () => {
    const { host, unmount } = await mount(<Services />, 'en');
    const link = host.querySelector<HTMLAnchorElement>('[data-track-service="handling"]')!;
    link.addEventListener('click', (e) => e.preventDefault(), { once: true });
    link.querySelector('span')!.click();
    expect(track).toHaveBeenCalledWith('whatsapp_click', { location: 'services', service: 'handling' });
    await unmount();
  });
});

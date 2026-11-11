// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));

import { visibleCranes } from '@/content';
import { whyCopy } from '@/content/why';
import { track } from '@/lib/analytics';
import { setRequestedCrane } from '@/lib/request';
import { mount, renderHtml } from '@/test/render';
import { WhyAtlas, barPercent, channelMessage } from './WhyAtlas';
import { en } from '@/content/en';

const section = (html: ParentNode) => html.querySelector<HTMLElement>('section#why-atlas');

afterEach(() => {
  setRequestedCrane(null);
});

describe('WhyAtlas', () => {
  const html = renderHtml(<WhyAtlas />, 'en');
  const root = section(html)!;

  it('is the brand-navy band, labelled by its two-tone heading', () => {
    expect(root.getAttribute('data-surface')).toBe('brand');
    expect(root.getAttribute('data-ground')).toBe('dark');
    const h2 = root.querySelector('h2#why-title');
    expect(root.getAttribute('aria-labelledby')).toBe('why-title');
    expect(h2?.textContent).toBe('Why Atlas Alshraa? A crane the size your job needs.');
    expect(h2?.previousElementSibling).toBeNull(); // no eyebrow
  });

  it('shows the capacity range from the data, with a final value for screen readers', () => {
    const min = visibleCranes[0]!.capacityT;
    const max = visibleCranes.at(-1)!.capacityT;
    expect([min, max]).toEqual([55, 317.5]);
    const figure = root.querySelector('[data-why-tile="range"] h3');
    expect(figure?.querySelector('.sr-only')?.textContent).toBe('55–317.5 t');
    expect([...figure!.querySelectorAll('[data-ticker]')].map((t) => t.textContent)).toEqual(['55', '317.5']);
  });

  it('draws one bar per visible model, smallest first, sized from the capacity', () => {
    const rows = [...root.querySelectorAll('[data-why-bars] > li')];
    expect(rows.map((r) => r.querySelector('bdi')?.textContent)).toEqual(visibleCranes.map((c) => c.model));
    expect(rows.map((r) => (r.querySelector('[data-why-bar]') as HTMLElement).style.inlineSize)).toEqual(
      visibleCranes.map((c) => `${barPercent(c.capacityT)}%`),
    );
    expect(rows.at(-1)?.textContent).toContain('317.5 t');
    expect(root.querySelector('[data-why-bars]')?.getAttribute('aria-label')).toBe('Maximum capacity by model');
  });

  it('sizes bars on a 340 t scale and never past the end', () => {
    expect(barPercent(340)).toBe(100);
    expect(barPercent(317.5)).toBe(93.4);
    expect(barPercent(55)).toBe(16.2);
    expect(barPercent(1000)).toBe(100);
    expect(barPercent(0)).toBe(0);
    expect(barPercent(Number.NaN)).toBe(0);
  });

  it('lists the three crane types with the make and model of each, in a stagger reveal (the one reveal here)', () => {
    const types = [...root.querySelectorAll('[data-why-tile="types"] > ul > li')];
    expect(types.map((t) => t.querySelector('p')?.textContent)).toEqual(['Rough-terrain crane', 'All-terrain crane', 'Crawler crane']);
    expect(types[1]?.textContent).toContain('Tadano Faun ATF 60-3');
    expect(types[1]?.textContent).toContain('Grove GMK6350');
    expect([...root.querySelectorAll('[data-reveal]')].map((el) => el.getAttribute('data-reveal'))).toEqual(['stagger']);
  });

  it('does not repeat its neighbours: no second list of the four services, no Hoist footnote', () => {
    expect(root.querySelector('[data-why-tile="services"]')).toBeNull();
    expect(root.textContent).not.toContain(en.hoist.footnote);
    expect(root.textContent).not.toContain(en.services.items[1].title);
  });

  it('invents nothing: no years, fleet counts, clients or certificates', () => {
    const text = root.textContent ?? '';
    expect(text).not.toMatch(/\b(19|20)\d\d\b/);
    expect(text).not.toMatch(/ISO|certif|client|since|years/i);
    expect(text).toContain('[[CONFIRM: An experienced operator comes with it.]]');
  });

  it('numbers the four steps of a hire in order, as a list, all reached in the rendered state', () => {
    const steps = [...root.querySelectorAll('ol[data-why-steps] > li[data-why-step]')];
    expect(steps.map((s) => s.querySelector('h4')?.textContent)).toEqual(whyCopy.en.steps.items.map((s) => s.title));
    expect(steps.map((s) => s.querySelector('span[aria-hidden]')?.textContent)).toEqual(['1', '2', '3', '4']);
    expect(steps.some((s) => s.hasAttribute('data-todo'))).toBe(false);
    expect(root.querySelectorAll('[data-why-fill]')).toHaveLength(3);
    expect(root.querySelector('ol[data-why-steps]')?.getAttribute('aria-labelledby')).toBe('why-steps-title');
  });

  it('uses red only for the action: one primary, on the one light tile', () => {
    const primaries = [...root.querySelectorAll('a')].filter((a) => a.className.includes('bg-red'));
    expect(primaries).toHaveLength(1);
    expect(primaries[0]?.closest('[data-why-tile]')?.getAttribute('data-ground')).toBe('light');
    expect(root.querySelector('a[href="#request"]')?.textContent).toBe('Fill in the request form');
    expect(root.querySelector('a[href="mailto:info@atlas-alshraa.com.ly"]')?.textContent).toBe('Email');
    expect(root.querySelector('a[href="#crane-list"]')?.textContent).toBe('the crane list');
  });

  it('closes the band on the channels strip, after the four steps (peak-end)', () => {
    const blocks = [...root.querySelectorAll('[data-why-tile], ol[data-why-steps]')].map(
      (el) => el.getAttribute('data-why-tile') ?? 'steps',
    );
    expect(blocks).toEqual(['range', 'types', 'steps', 'channels']);
  });

  it('builds the channel message like the request bar: general, or naming the crane on the hook', () => {
    expect(channelMessage(en, null)).toBe(en.whatsapp.general);
    const gmk = visibleCranes.find((c) => c.id === 'gmk6350')!;
    expect(channelMessage(en, gmk)).toContain('Grove GMK6350 (All-terrain)');
  });

  it('puts the crane on the hook into the WhatsApp link and the chip, and tracks the click', async () => {
    const { host, unmount } = await mount(<WhyAtlas />, 'en');
    const link = host.querySelector<HTMLAnchorElement>('[data-why-whatsapp]')!;
    const chip = host.querySelector<HTMLElement>('[data-why-picked]')!;
    expect(chip.hidden).toBe(true);
    await act(async () => setRequestedCrane('gmk6350'));
    expect(chip.hidden).toBe(false);
    expect(chip.textContent).toContain('GMK6350');
    expect(decodeURIComponent(link.href)).toContain('Grove GMK6350');
    await act(async () => setRequestedCrane(null));
    expect(chip.hidden).toBe(true);
    link.addEventListener('click', (e) => e.preventDefault(), { once: true });
    link.click();
    expect(track).toHaveBeenCalledWith('whatsapp_click', { location: 'why' });
    await unmount();
  });

  it('renders Arabic first-class: the range reads «من … إلى … طن», models isolated', () => {
    const ar = section(renderHtml(<WhyAtlas />, 'ar'))!;
    expect(ar.querySelector('h2')?.textContent).toBe('لماذا أطلس الصحراء؟ رافعة بالحجم الذي يحتاجه عملك.');
    expect(ar.querySelector('[data-why-tile="range"] h3 .sr-only')?.textContent).toBe('من 55 إلى 317.5 طن');
    for (const bdi of ar.querySelectorAll('[data-why-bars] bdi')) expect(bdi.getAttribute('dir')).toBe('ltr');
  });
});

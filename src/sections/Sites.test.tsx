// @vitest-environment jsdom
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { getCopy } from '@/content';
import { mount, renderHtml } from '@/test/render';
import { Sites } from './Sites';
import { ALL_SITE_PHOTOS, photosFor, splitCaption } from './sites-logic';

const copy = getCopy('ar');
const DECK_ORDER = ['6374', '6376', '6379', '6380', '6382', '6388', '6393', '6360', '6364', '6396', '6397', '6398'];

describe('Sites', () => {
  const html = renderHtml(<Sites />, 'ar');
  const buttons = () => [...html.querySelectorAll<HTMLButtonElement>('button[data-testid="site-photo"]')];

  it('renders every gallery photo in one full-bleed scroll-snap strip (C9: data-sites-strip, site-photo)', () => {
    const strips = html.querySelectorAll('section#sites [data-sites-strip]');
    expect(strips).toHaveLength(1);
    const track = strips[0]?.querySelector('ul.ui-carousel__track');
    expect(track?.querySelectorAll('button[data-testid="site-photo"]')).toHaveLength(12);
    expect(buttons().map((b) => b.dataset.photo)).toEqual(DECK_ORDER);
  });

  it('labels each slide with its position in the strip', () => {
    const slides = [...html.querySelectorAll('[data-sites-strip] ul > li > [role="group"]')];
    expect(slides).toHaveLength(12);
    expect(slides[0]?.getAttribute('aria-label')).toBe('1 من 12');
    expect(html.querySelector('[data-sites-strip][role="region"]')?.getAttribute('aria-label')).toBe(`${copy.sites.title} · ${copy.sites.all}`);
  });

  it('keeps every sr-only label inside the scrolling strip in a position: relative button (no page overflow)', () => {
    const labels = [...html.querySelectorAll('[data-sites-strip] ul .sr-only')];
    expect(labels).toHaveLength(12);
    for (const label of labels) {
      const button = label.closest('button[data-testid="site-photo"]');
      expect(button?.classList.contains('relative')).toBe(true);
    }
  });

  it('never loads a Kobelco photo', () => {
    expect(html.innerHTML).not.toMatch(/\/img\/(6367|6370|6371)-/);
  });

  it('captions every photo from the deck on the card (site, then detail), so the image is decorative', () => {
    const [first, second] = buttons();
    expect(first?.textContent).toContain('موقع إنشاءات');
    expect(first?.textContent).toContain(splitCaption(copy.sites.captions['6374']).detail);
    expect(second?.querySelector('.sites-detail')?.textContent).toBe('كابينة المشغّل وبابها مفتوح');
    for (const button of buttons()) {
      expect(button.querySelector('img')?.getAttribute('alt')).toBe('');
      expect(button.textContent).toContain(copy.sites.open);
    }
  });

  it('offers a site picker (radios) with "All" checked', () => {
    const group = html.querySelector('[role="radiogroup"]');
    expect(group?.getAttribute('aria-label')).toBe(copy.sites.filterLabel);
    const radios = [...html.querySelectorAll<HTMLInputElement>('input[name="sites-filter"]')];
    expect(radios.map((r) => r.value)).toEqual(['all', 'construction', 'coast']);
    expect(radios.map((r) => r.checked)).toEqual([true, false, false]);
    expect(group?.textContent).toBe(`${copy.sites.all}${copy.sites.galleries.construction}${copy.sites.galleries.coast}`);
  });

  it('renders one closed lightbox dialog (C9) and leaves the viewer code for later', () => {
    const dialog = html.querySelector('dialog[data-testid="lightbox"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.hasAttribute('open')).toBe(false);
    expect(html.querySelectorAll('dialog')).toHaveLength(1);
  });

  it('uses the v2 look: mist ground, rounded cards, no v1 square strip classes', () => {
    const section = html.querySelector('section#sites');
    expect(section?.className).toContain('surface-mist');
    expect(section?.getAttribute('data-ground')).toBe('light');
    expect(html.innerHTML).not.toMatch(/bg-concrete|t-h2|t-h3|section-y/);
  });

  it('narrows the strip to one site and back', async () => {
    const { host, unmount } = await mount(<Sites />, 'en');
    const pick = async (value: string) => {
      const radio = host.querySelector<HTMLInputElement>(`input[name="sites-filter"][value="${value}"]`);
      await act(async () => radio?.click());
    };
    const shown = () => [...host.querySelectorAll<HTMLButtonElement>('button[data-testid="site-photo"]')].map((b) => b.dataset.photo);
    await pick('coast');
    expect(shown()).toEqual(['6360', '6364', '6396', '6397', '6398']);
    expect(host.querySelector('[data-sites-strip] li > [role="group"]')?.getAttribute('aria-label')).toBe('1 of 5');
    expect(host.querySelector('[data-sites-strip][role="region"]')?.getAttribute('aria-label')).toBe('On site · Coastal site');
    await pick('construction');
    expect(shown()).toHaveLength(7);
    await pick('all');
    expect(shown()).toEqual(DECK_ORDER);
    await unmount();
  });
});

describe('sites logic', () => {
  it('tags every photo with its site, in deck order', () => {
    expect(ALL_SITE_PHOTOS.map((p) => p.photo)).toEqual(DECK_ORDER);
    expect(photosFor('construction').every((p) => p.site === 'construction')).toBe(true);
    expect(photosFor('coast')).toHaveLength(5);
    expect(photosFor('all')).toHaveLength(12);
  });

  it('splits a deck caption into the site and the detail', () => {
    expect(splitCaption('Coastal site · Two cranes set up on the sand')).toEqual({ site: 'Coastal site', detail: 'Two cranes set up on the sand' });
    expect(splitCaption('No separator')).toEqual({ site: '', detail: 'No separator' });
  });
});

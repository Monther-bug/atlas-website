// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { getCopy } from '@/content';
import { renderHtml } from '@/test/render';
import { Sites } from './Sites';

const copy = getCopy('ar');

describe('Sites', () => {
  const html = renderHtml(<Sites />, 'ar');

  it('renders the two galleries as scroll-snap strips', () => {
    const strips = [...html.querySelectorAll('section#sites ul[data-sites-strip]')];
    expect(strips).toHaveLength(2);
    expect(strips.map((strip) => strip.querySelectorAll('button[data-testid="site-photo"]').length)).toEqual([7, 5]);
  });

  it('keeps every sr-only label inside the scrolling strip (position: relative ancestor)', () => {
    const labels = [...html.querySelectorAll('[data-sites-strip] .sr-only')];
    expect(labels).toHaveLength(12);
    for (const label of labels) {
      const button = label.closest('button[data-testid="site-photo"]');
      expect(button?.classList.contains('relative')).toBe(true);
    }
  });

  it('never loads a Kobelco photo', () => {
    expect(html.innerHTML).not.toMatch(/\/img\/(6367|6370|6371)-/);
  });

  it('captions every photo from the deck, so the image is decorative inside the button', () => {
    const buttons = [...html.querySelectorAll('button[data-testid="site-photo"]')];
    expect(buttons[0]?.querySelector('span.t-small')?.textContent).toBe(copy.sites.captions['6374']);
    expect(buttons[1]?.querySelector('span.t-small')?.textContent).toBe('موقع إنشاءات · كابينة المشغّل وبابها مفتوح');
    for (const button of buttons) expect(button.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('includes one closed lightbox dialog', () => {
    const dialog = html.querySelector('dialog[data-testid="lightbox"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.hasAttribute('open')).toBe(false);
  });
});

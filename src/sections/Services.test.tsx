// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderHtml } from '@/test/render';
import { Services } from './Services';

describe('Services', () => {
  const html = renderHtml(<Services />, 'en');
  const rows = [...html.querySelectorAll('section#services li[data-service-row]')];

  it('has four service rows in deck order, without section numbers', () => {
    expect(rows.map((row) => row.querySelector('h3')?.textContent)).toEqual([
      'Crane hire',
      'Heavy transport',
      'Handling and rigging',
      'Oil services',
    ]);
    expect(html.textContent).not.toMatch(/\b0[1-4]\b/);
  });

  it('draws the derrick only on oil services', () => {
    expect(rows.map((row) => Boolean(row.querySelector('h3 svg')))).toEqual([false, false, false, true]);
  });

  it('keeps the [[CONFIRM]] sentence for crane hire until Atlas answers', () => {
    expect(rows[0]?.textContent).toContain('[[CONFIRM: Every crane comes with an experienced operator.]]');
    expect(rows[3]?.querySelectorAll('p')).toHaveLength(1);
  });

  it('is a dark-ground section', () => {
    expect(html.querySelector('section#services')?.getAttribute('data-ground')).toBe('dark');
  });

  it('links each row to a WhatsApp message about that service', () => {
    const link = rows[3]?.querySelector('a');
    expect(link?.textContent).toContain('Ask about this service');
    expect(decodeURIComponent(link?.getAttribute('href') ?? '')).toContain('I would like to ask about Oil services.');
  });

  it('gives the list list semantics and each link a distinct name', () => {
    expect(html.querySelector('section#services ul')?.getAttribute('role')).toBe('list');
    const names = rows.map((row) => row.querySelector('a')?.textContent);
    expect(new Set(names).size).toBe(4);
  });

  it('renders in Arabic with Arabic titles and service links', () => {
    const ar = renderHtml(<Services />, 'ar');
    const arRows = [...ar.querySelectorAll('section#services li[data-service-row]')];
    expect(arRows.map((row) => row.querySelector('h3')?.textContent)).toEqual([
      'تأجير الرافعات',
      'النقل الثقيل',
      'المناولة',
      'الخدمات النفطية',
    ]);
    const hrefs = arRows.map((row) => decodeURIComponent(row.querySelector('a')?.getAttribute('href') ?? ''));
    hrefs.forEach((href, i) => {
      expect(href).toContain('أريد الاستفسار عن ' + arRows[i]?.querySelector('h3')?.textContent + '.');
    });
    expect(new Set(arRows.map((row) => row.querySelector('a')?.textContent)).size).toBe(4);
  });
});

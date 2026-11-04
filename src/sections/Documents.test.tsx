// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DocumentFile } from '@/content/types';

const mockSite = vi.hoisted(() => ({
  email: 'atlasalsahralibya@gmail.com',
  facebook: 'https://www.facebook.com/share/19qKUy2hxg/',
  address: null,
  documents: [] as DocumentFile[],
}));
vi.mock('@/content/site', () => ({ siteInfo: mockSite }));

import { renderHtml } from '@/test/render';
import { Documents } from './Documents';

afterEach(() => {
  mockSite.documents = [];
});

describe('Documents', () => {
  it('renders nothing while there are no real files', () => {
    expect(renderHtml(<Documents />, 'ar').innerHTML).toBe('');
  });

  it('lists each file with its language and date once one exists', () => {
    mockSite.documents = [{ id: 'profile', href: '/docs/atlas-profile.pdf', lang: 'both', date: '2026-11-01' }];
    const html = renderHtml(<Documents />, 'ar');
    expect(html.querySelector('section#documents')).not.toBeNull();
    const row = html.querySelector('li');
    expect(row?.textContent).toContain('ملف الشركة');
    expect(row?.textContent).toContain('PDF · عربي وإنجليزي · آخر تحديث 2026-11-01');
    expect(row?.querySelector('a[download]')?.getAttribute('href')).toBe('/docs/atlas-profile.pdf');
    expect(row?.querySelector('a[href^="mailto:"]')?.getAttribute('href')).toContain(encodeURIComponent('طلب وثيقة: ملف الشركة'));
  });
});

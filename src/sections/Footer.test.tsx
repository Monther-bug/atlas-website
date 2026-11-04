// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
  target: 'staging' as 'staging' | 'production',
  siteUrl: 'http://localhost:4173',
  whatsapp: null as string | null,
  phone: null as string | null,
  formEndpoint: null as string | null,
  ga4Id: null as string | null,
}));
vi.mock('@/env', () => ({ env: mockEnv, isDraft: (verified: boolean) => !verified && mockEnv.target !== 'production' }));

import { renderHtml } from '@/test/render';
import { Footer } from './Footer';

describe('Footer', () => {
  afterEach(() => {
    mockEnv.phone = null;
    mockEnv.whatsapp = null;
  });

  const html = renderHtml(<Footer />, 'ar');

  it('is the C9 footer with a back-to-top link and the outrigger pad', () => {
    expect(html.querySelector('footer[data-footer]')).not.toBeNull();
    const top = html.querySelector('a[data-testid="back-to-top"][data-back-to-top]');
    expect(top?.getAttribute('href')).toBe('#top');
    expect(top?.textContent).toBe('العودة إلى الأعلى');
    expect(html.querySelector('svg[data-footer-pad]')).not.toBeNull();
  });

  it('shows only confirmed contact facts', () => {
    expect(html.querySelector('a[href="mailto:atlasalsahralibya@gmail.com"]')).not.toBeNull();
    expect(html.querySelector('a[href^="tel:"]')).toBeNull();
    const facebook = html.querySelector('a[href="https://www.facebook.com/share/19qKUy2hxg/"]');
    expect(facebook?.getAttribute('target')).toBe('_blank');
  });

  it('prints the copyright with the current year', () => {
    expect(html.textContent).toContain(`© ${new Date().getFullYear()} أطلس الصحراء. جميع الحقوق محفوظة.`);
  });

  it('shows the phone and WhatsApp rows when configured', () => {
    mockEnv.phone = '+218 91 123 4567';
    mockEnv.whatsapp = '218911234567';
    const withContact = renderHtml(<Footer />, 'ar');
    const tel = withContact.querySelector('a[href^="tel:"] bdi[dir="ltr"]');
    expect(tel?.textContent).toBe('+218 91 123 4567');
    const wa = withContact.querySelector('a[href^="https://wa.me/"] bdi[dir="ltr"]');
    expect(wa?.textContent).toBe('+218911234567');
  });
});

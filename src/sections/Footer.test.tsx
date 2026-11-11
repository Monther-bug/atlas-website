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

  it('is the C9 footer on the black ground with a back-to-top link and no outrigger pad', () => {
    expect(html.querySelector('footer[data-footer]')).not.toBeNull();
    const top = html.querySelector('a[data-testid="back-to-top"][data-back-to-top]');
    expect(top?.getAttribute('href')).toBe('#top');
    expect(top?.textContent).toBe('العودة إلى الأعلى');
    expect(html.querySelector('svg[data-footer-pad]')).toBeNull();
    const footer = html.querySelector('footer');
    expect(footer?.getAttribute('data-ground')).toBe('dark');
    expect(footer?.className).toContain('surface-dark');
  });

  it('closes with the positioning line and the one action', () => {
    expect(html.querySelector('footer p.t-headline')?.textContent).toBe('شريك تشغيلي يواكب احتياجات المشاريع.'); // headline size: never louder than the hero H1
    const request = html.querySelector('footer a[href="#request"]');
    expect(request?.textContent).toBe('اطلب رافعة');
    expect(request?.className).toContain('bg-red');
  });

  it('lists the four services and the page links', () => {
    const services = html.querySelectorAll('nav[aria-labelledby="footer-services"] a');
    expect(services).toHaveLength(4);
    expect([...html.querySelectorAll('nav[aria-labelledby="footer-page"] a')].map((a) => a.getAttribute('href'))).toEqual([
      '#cranes',
      '#sites',
      '#request',
    ]);
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

  it('credits Core with a link that opens in a new tab', () => {
    const credit = html.querySelector('[data-testid="footer-credit"]');
    expect(credit?.textContent).toContain('تصميم وتطوير');
    const link = credit?.querySelector('a[href="https://core.com.ly/"]');
    expect(link?.textContent).toContain('Core');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(renderHtml(<Footer />, 'en').querySelector('[data-testid="footer-credit"]')?.textContent).toContain(
      'Designed and built by',
    );
  });

  it('adds a WhatsApp action beside the request only when a number is set', () => {
    expect(html.querySelectorAll('footer a[href^="https://wa.me/"]')).toHaveLength(0);
    mockEnv.whatsapp = '218911234567';
    expect(renderHtml(<Footer />, 'en').querySelectorAll('footer a[href^="https://wa.me/"]').length).toBeGreaterThan(1);
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

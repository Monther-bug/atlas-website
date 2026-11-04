// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { BUTTON_LG_HEIGHT, buttonClass } from '@/components/Button';
import { slingClearance, slingGeometry, slingMaxHeight } from '@/components/Sling';
import { getImage } from '@/generated/images';
import { renderHtml } from '@/test/render';
import { HERO_PHOTO, Hero } from './Hero';

describe('Hero', () => {
  it('is #top with one H1 that holds both clauses, the services line below it', () => {
    const html = renderHtml(<Hero />, 'ar');
    expect(html.querySelector('section#top[data-hero]')).not.toBeNull();
    const h1 = html.querySelector('h1[data-split]');
    expect(h1?.textContent).toBe('من الرافعات الصغيرة للكبيرات، لكل مشروع رافعته المناسبة');
    expect(h1?.previousElementSibling).toBeNull(); // nothing above the heading (spec §15.1)
    expect(h1?.className).toBe('t-h1'); // .t-h1 already balances; no utility overrides
    const intro = html.querySelectorAll('[data-intro]');
    expect(intro[0]?.textContent).toBe('تأجير الرافعات · النقل الثقيل · المناولة · الخدمات النفطية');
    expect(h1!.compareDocumentPosition(intro[0]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('uses 6398 in Arabic and 6359 in English, eagerly loaded', () => {
    for (const lang of ['ar', 'en'] as const) {
      const photo = renderHtml(<Hero />, lang).querySelector('[data-hero-photo]');
      expect(photo?.innerHTML).toContain(`/img/${HERO_PHOTO[lang]}-`);
      expect(photo?.querySelector('img')?.getAttribute('fetchpriority')).toBe('high');
    }
  });

  it('hangs the WhatsApp button on the sling only where the crop has a hook point', () => {
    for (const lang of ['ar', 'en'] as const) {
      const desktop = getImage(HERO_PHOTO[lang], 'desktop_16x9');
      const mobile = getImage(HERO_PHOTO[lang], 'mobile_9x16');
      const html = renderHtml(<Hero />, lang);
      const slings = [...html.querySelectorAll('svg[data-sling]')];
      expect(slings).toHaveLength(Number(Boolean(desktop.hook)) + Number(Boolean(mobile.hook)));
      for (const svg of slings) {
        expect(svg.querySelectorAll('path[data-sling-leg]')).toHaveLength(2);
        expect(svg.querySelectorAll('circle[data-hook-pin]')).toHaveLength(1);
      }
      const onSling = html.querySelector('a[data-sling-button][data-testid="sling-whatsapp"]');
      expect(Boolean(onSling)).toBe(Boolean(desktop.hook || mobile.hook));
      expect(Boolean(html.querySelector('[data-testid="hero-whatsapp"]'))).toBe(!(desktop.hook && mobile.hook));
    }
  });

  it('has a hook point in both hero crops, so phones get the sling too (C11)', () => {
    for (const lang of ['ar', 'en'] as const) {
      expect(getImage(HERO_PHOTO[lang], 'desktop_16x9').hook, `${lang} desktop`).not.toBeNull();
      expect(getImage(HERO_PHOTO[lang], 'mobile_9x16').hook, `${lang} mobile`).not.toBeNull();
      const html = renderHtml(<Hero />, lang);
      expect(html.querySelectorAll('svg[data-sling]')).toHaveLength(2);
      expect(html.querySelector('[data-testid="hero-whatsapp"]')).toBeNull();
    }
  });

  it('grows the photo box when needed so the hook, the legs and the button stay inside the photo', () => {
    for (const lang of ['ar', 'en'] as const) {
      const desktopImage = getImage(HERO_PHOTO[lang], 'desktop_16x9');
      const mobileImage = getImage(HERO_PHOTO[lang], 'mobile_9x16');
      const box = renderHtml(<Hero />, lang).querySelector<HTMLElement>('[data-hero-photo]')?.parentElement;
      expect(box?.style.getPropertyValue('--clear-d')).toBe(
        slingClearance(slingGeometry(desktopImage)!, desktopImage.rect, `${BUTTON_LG_HEIGHT.md} + 1.5rem`),
      );
      expect(box?.style.getPropertyValue('--clear-m')).toBe(
        slingClearance(slingGeometry(mobileImage)!, mobileImage.rect, `${BUTTON_LG_HEIGHT.base} + 1rem`),
      );
      expect(box?.className).toContain('h-[max(calc(60svh-4.5rem),var(--clear-m,0px))]');
    }
  });

  it('caps the md photo box so a tall tablet never crops the hook out at the sides', () => {
    for (const lang of ['ar', 'en'] as const) {
      const desktopImage = getImage(HERO_PHOTO[lang], 'desktop_16x9');
      const box = renderHtml(<Hero />, lang).querySelector<HTMLElement>('[data-hero-photo]')?.parentElement;
      expect(box?.style.getPropertyValue('--max-d')).toBe(slingMaxHeight(slingGeometry(desktopImage)!, desktopImage.rect, '1rem'));
      expect(box?.className).toContain('md:h-[min(max(calc(74svh-4.5rem),var(--clear-d,0px)),var(--max-d,100svh))]');
    }
  });

  it('reserves exactly the lg button height that Button renders', () => {
    const lg = buttonClass('primary-red', 'lg');
    expect(lg).toContain(`min-h-[${BUTTON_LG_HEIGHT.base}]`);
    expect(lg).toContain(`md:min-h-[${BUTTON_LG_HEIGHT.md}]`);
  });

  it('centres the sling button on the hook, clamped so it can never leave the photo sideways', () => {
    for (const lang of ['ar', 'en'] as const) {
      const holder = renderHtml(<Hero />, lang).querySelector('[data-sling-button]')?.parentElement;
      const classes = holder?.className.split(' ') ?? [];
      expect(holder?.className).toBe(holder?.className.trim());
      expect(classes).toEqual(
        expect.arrayContaining([
          'w-max',
          'max-w-[calc(100cqw-2rem)]',
          '[--sx:var(--sx-m)]',
          'md:[--sx:var(--sx-d)]',
          'left-[var(--sx)]',
          // Centre on the hook (-50% of its own width), but keep both edges 1rem inside the photo.
          'translate-x-[clamp(calc(1rem-var(--sx)),-50%,calc(100cqw-1rem-var(--sx)-100%))]',
        ]),
      );
    }
  });

  it('draws the sling button focus ring inside the red, never on the photo (WCAG 1.4.11)', () => {
    const button = renderHtml(<Hero />, 'en').querySelector('[data-sling-button]');
    expect(button?.className).toContain('focus-visible:outline-offset-[-6px]');
  });

  it('links Browse cranes to the Hoist', () => {
    const browse = [...renderHtml(<Hero />, 'en').querySelectorAll('a')].find((a) => a.textContent === 'Browse cranes');
    expect(browse?.getAttribute('href')).toBe('#cranes');
  });
});

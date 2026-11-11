// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { getImage } from '@/generated/images';
import { renderHtml } from '@/test/render';
import { HERO_PHOTO, Hero, PORTRAIT, hookCss, hookSide } from './Hero';

describe('Hero (direction B, "The Luff")', () => {
  it('is #top with one H1 of two lines (Atlas, 11 Nov 2026), and nothing above the heading (spec §16.1)', () => {
    for (const lang of ['ar', 'en'] as const) {
      const html = renderHtml(<Hero />, lang);
      expect(html.querySelector('section#top[data-hero][data-ground="dark"]')).not.toBeNull();
      const h1 = html.querySelector('h1#hero-title');
      expect(h1?.textContent?.replace(/\s+/g, ' ')).toBe(
        lang === 'ar' ? 'شريك تشغيلي يواكب احتياجات المشاريع' : 'An operating partner for every project’s needs',
      );
      expect([...h1!.children].map((line) => [line.className, line.textContent])).toEqual(
        lang === 'ar'
          ? [['hero-line hero-line-1', 'شريك تشغيلي'], ['hero-line hero-line-2', 'يواكب احتياجات المشاريع']]
          : [['hero-line hero-line-1', 'An operating partner'], ['hero-line hero-line-2', 'for every project’s needs']],
      );
      expect(h1?.parentElement?.previousElementSibling?.matches('.hero-fields')).toBe(true);
      // The H1 is the LCP element: nothing in the hero is a reveal or pre-hidden by the motion layer.
      expect(html.querySelector('#top [data-reveal], #top [data-split], #top [data-intro]')).toBeNull();
    }
  });

  it('reads H1 → WhatsApp → lead → Browse, in that order (WCAG 2.4.3)', () => {
    const html = renderHtml(<Hero />, 'ar');
    const order = ['h1#hero-title', '[data-sling-button]', 'p.hero-sub', 'a[href="#cranes"]'].map((s) => html.querySelector(s)!);
    for (let i = 1; i < order.length; i++) {
      expect(order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it('uses 6398 in Arabic and 6359 in English, eagerly loaded, the 9:16 crop for every portrait viewport', () => {
    for (const lang of ['ar', 'en'] as const) {
      const photo = renderHtml(<Hero />, lang).querySelector('[data-hero-photo]')!;
      expect(photo.innerHTML).toContain(`/img/${HERO_PHOTO[lang]}-`);
      const img = photo.querySelector('img')!;
      expect(img.getAttribute('loading')).toBe('eager');
      expect(img.getAttribute('fetchpriority')).toBe('high');
      const portrait = [...photo.querySelectorAll('source')].filter((s) => s.getAttribute('media') === PORTRAIT);
      expect(portrait).toHaveLength(2);
      expect(portrait[0].getAttribute('srcset')).toContain('-mobile_9x16-');
    }
  });

  it('pins the rig on the real hook of both crops, in container units (no JS needed)', () => {
    for (const lang of ['ar', 'en'] as const) {
      const section = renderHtml(<Hero />, lang).querySelector<HTMLElement>('#top')!;
      for (const [crop, key] of [['desktop_16x9', 'd'], ['mobile_9x16', 'm']] as const) {
        const css = hookCss(getImage(HERO_PHOTO[lang], crop))!;
        expect(section.style.getPropertyValue(`--hx-${key}`)).toBe(css.x);
        expect(section.style.getPropertyValue(`--hy-${key}`)).toBe(css.y);
        expect(section.hasAttribute(`data-sling-${key}`)).toBe(true);
      }
    }
    expect(renderHtml(<Hero />, 'ar').querySelectorAll('[data-sling-leg]')).toHaveLength(2);
    expect(renderHtml(<Hero />, 'ar').querySelector('[data-testid="hero-whatsapp"]')).toBeNull(); // both crops have a hook
  });

  it('maps the hook for a bottom-anchored cover image filling the first screen (6398 desktop: dx 1106, dy 1085)', () => {
    expect(hookCss(getImage('6398', 'desktop_16x9'))).toEqual({
      x: 'calc(50cqw + 1106 * max(100cqw / 4240, var(--stage) / 2385))',
      y: 'calc(var(--stage) - 1085 * max(100cqw / 4240, var(--stage) / 2385))',
    });
  });

  it('rakes the cut away from the hook side, and marks whether it is on the reading-start side of the text', () => {
    const ar = renderHtml(<Hero />, 'ar').querySelector<HTMLElement>('#top')!;
    expect(hookSide(getImage('6398', 'desktop_16x9'))).toBe('right');
    expect(ar.dataset.nearD).toBe('right');
    expect(ar.dataset.cutD).toBe('start');
    expect(ar.dataset.cutM).toBe('start');
    const en = renderHtml(<Hero />, 'en').querySelector<HTMLElement>('#top')!;
    expect(en.dataset.nearD).toBe('left');
    expect(en.dataset.cutD).toBe('start');
    expect(en.dataset.nearM).toBe('right'); // 6359's 9:16 crop puts the hook right of centre
    expect(en.dataset.cutM).toBe('end');
  });

  it('names the WhatsApp load for the dock and the tests, and links Browse cranes to the Hoist', () => {
    const html = renderHtml(<Hero />, 'en');
    const button = html.querySelector('[data-sling-button]');
    expect(button?.getAttribute('data-testid')).toBe('sling-whatsapp');
    expect(button?.className).toContain('hero-whatsapp'); // focus ring drawn inside the red (hero.css)
    const browse = [...html.querySelectorAll('a')].find((a) => a.textContent === 'Browse cranes');
    expect(browse?.getAttribute('href')).toBe('#cranes');
  });

  it('sets Atlas’s lead as one plain paragraph in the foot, then Browse cranes on its own row', () => {
    for (const lang of ['ar', 'en'] as const) {
      const foot = renderHtml(<Hero />, lang).querySelector('.hero-foot')!;
      expect([...foot.children].map((el) => el.matches('p.hero-sub') || el.matches('a.hero-browse[href="#cranes"]'))).toEqual([true, true]);
      expect(foot.querySelector('p.hero-sub')?.textContent).toBe(
        lang === 'ar'
          ? 'من الرافعات والنقل الثقيل إلى المناولة والخدمات النفطية، توفّر أطلس الصحراء خدمات تدعم احتياجات مواقع العمل وتسهم في إنجاز المهام بكفاءة وانسيابية.'
          : 'From cranes and heavy transport to handling and oil services, Atlas Alshraa provides services that support worksite needs and help get the work done efficiently and smoothly.',
      );
      expect(foot.querySelector('.hero-services, .hero-dot, h2, h3')).toBeNull(); // the old services line is gone
    }
  });
});

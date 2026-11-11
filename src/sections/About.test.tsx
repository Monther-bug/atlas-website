// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { getCopy } from '@/content/all';
import { siteInfo } from '@/content';
import { wordWindow } from '@/motion/about';
import { renderHtml } from '@/test/render';
import { ABOUT_PHOTOS, About, splitWords } from './About';

describe('About', () => {
  for (const lang of ['ar', 'en'] as const) {
    const copy = getCopy(lang);
    const html = renderHtml(<About />, lang);
    const section = html.querySelector('section#about');

    describe(lang, () => {
      it('is a white v2 section labelled by its heading, the heading first in its block', () => {
        expect(section?.className).toContain('surface-white');
        expect(section?.getAttribute('data-ground')).toBe('light');
        expect(section?.getAttribute('aria-labelledby')).toBe('about-title');
        const h2 = html.querySelector('h2#about-title');
        expect(h2?.previousElementSibling).toBeNull();
        expect(h2?.textContent?.trim()).toBe(copy.about.title);
      });

      it('sets the statement as words for the scroll highlight, with the decorative badge inline', () => {
        const words = [...html.querySelectorAll('[data-about-statement] [data-about-word]')].map((w) => w.textContent);
        expect(words).toEqual([...splitWords(copy.about.title), ...splitWords(copy.about.statement)]);
        expect(html.querySelector('[data-about-statement]')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
          `${copy.about.title} ${copy.about.statement}`,
        );
        expect(html.querySelector('[data-about-badge] img')?.getAttribute('alt')).toBe('');
      });

      it('shows the Arabic legal name (marked Arabic on the English page) and the four lines of work', () => {
        const legal = html.querySelector('.about-legal');
        expect(legal?.textContent).toBe('شركة أطلس الصحراء المساهمة للخدمات النفطية والنقل الثقيل والمناولة وتأجير الرافعات');
        if (lang === 'en') expect(legal?.querySelector('[lang="ar"][dir="rtl"]')).not.toBeNull();
        const chips = [...html.querySelectorAll('.about-chip')].map((c) => c.textContent);
        expect(chips).toEqual(copy.services.items.map((s) => s.title));
      });

      it('links only the confirmed channels: Facebook and TikTok (icon only, new tab) and the email', () => {
        for (const [href, name] of [[siteInfo.facebook, copy.about.facebook], [siteInfo.tiktok, copy.about.tiktok]]) {
          const link = html.querySelector(`a[href="${href}"]`);
          expect(link?.getAttribute('target')).toBe('_blank');
          expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
          expect(link?.querySelectorAll('svg')).toHaveLength(1); // the brand icon, no visible text
          expect(link?.querySelector('.sr-only')?.textContent).toBe(name); // its name, for screen readers
          expect(link?.textContent).toContain(copy.misc.newTab);
        }
        expect(html.querySelector(`a[href="mailto:${siteInfo.email}"]`)?.textContent).toBe(siteInfo.email);
        expect(html.querySelector('a[href^="tel:"], a[href*="wa.me"]')).toBeNull();
      });

      it('shows one real photo from each shoot site (never the hero photo), with deck alt text', () => {
        expect(ABOUT_PHOTOS.map((p) => p.site)).toEqual(['construction', 'coast']);
        const imgs = [...html.querySelectorAll('figure img')];
        expect(imgs.map((i) => i.getAttribute('alt'))).toEqual(ABOUT_PHOTOS.map((p) => copy.alt[p.photo]));
        expect(html.innerHTML).not.toMatch(/\/img\/6398-/);
        expect([...html.querySelectorAll('figcaption .ui-chip')].map((c) => c.textContent)).toEqual([
          copy.sites.galleries.construction,
          copy.sites.galleries.coast,
        ]);
      });

      it('uses the shared motion vocabulary: one mask reveal kind and one parallax frame', () => {
        expect(new Set([...html.querySelectorAll('[data-reveal]')].map((e) => e.getAttribute('data-reveal')))).toEqual(new Set(['mask']));
        expect(html.querySelectorAll('[data-parallax]')).toHaveLength(1);
      });

      it('claims nothing unconfirmed: no numbers, years or mission/vision blocks until Atlas supplies them', () => {
        expect(copy.about.values).toEqual([]);
        expect(section?.textContent).not.toMatch(/\d/);
        expect(section?.textContent).not.toMatch(/\[\[/);
        expect(html.querySelectorAll('.about-facts > div')).toHaveLength(2);
      });
    });
  }
});

describe('about motion (pure)', () => {
  it('lights the words in reading order and finishes the last one at the end of the scroll', () => {
    const n = 20;
    const windows = Array.from({ length: n }, (_, i) => wordWindow(i, n));
    expect(windows[0]?.at).toBe(0);
    for (let i = 1; i < n; i++) expect(windows[i]!.at).toBeGreaterThan(windows[i - 1]!.at);
    const last = windows[n - 1]!;
    expect(last.at + last.span).toBeCloseTo(1, 10);
  });

  it('handles a single word and an empty statement', () => {
    expect(wordWindow(0, 1)).toEqual({ at: 0, span: 1 });
    expect(wordWindow(0, 0)).toEqual({ at: 0, span: 1 });
  });
});

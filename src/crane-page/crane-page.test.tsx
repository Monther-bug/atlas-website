// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { REVEAL_KINDS } from '@/components/ui';
import { getCopy } from '@/content/all';
import { cranePageCopy } from '@/content/crane-page-copy';
import { CRANE_PAGES, craneIdFromPath, cranePath, isCranePage } from '@/content/crane-pages';
import { cranes } from '@/content/cranes';
import type { Crane, Lang } from '@/content/types';
import { LangProvider, homeHref } from '@/lib/lang';
import { CraneApp } from './CraneApp';
import { craneHead, craneMeta } from './head';
import './register';

const LANGS: Lang[] = ['ar', 'en'];

function page(crane: Crane, lang: Lang): HTMLDivElement {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(
    <LangProvider lang={lang} copy={getCopy(lang)} crane={crane.id}>
      <CraneApp crane={crane} />
    </LangProvider>,
  );
  return host;
}

const byId = (id: string) => CRANE_PAGES.find((c) => c.id === id)!;

describe('crane page routes', () => {
  it('has one page per visible crane, never the hidden CKE2500', () => {
    expect(CRANE_PAGES.map((c) => c.id)).toEqual(['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350']);
    expect(isCranePage('cke2500')).toBe(false);
    expect(cranes.find((c) => c.id === 'cke2500')?.hidden).toBe(true);
  });

  it('builds and reads the paths in both languages', () => {
    expect(cranePath('gmk6350', 'ar')).toBe('/cranes/gmk6350/');
    expect(cranePath('atf60-3', 'en')).toBe('/en/cranes/atf60-3/');
    expect(craneIdFromPath('/en/cranes/atf60-3/')).toBe('atf60-3');
    expect(craneIdFromPath('/cranes/gmk6350')).toBe('gmk6350');
    expect(craneIdFromPath('/cranes/cke2500/')).toBeNull();
    expect(craneIdFromPath('/')).toBeNull();
  });

  it('points home-page links at the home page from a crane page', () => {
    expect(homeHref({ home: '/', path: '' }, '#services')).toBe('#services');
    expect(homeHref({ home: '/en/', path: 'cranes/gmk6350/' }, '#services')).toBe('/en/#services');
  });
});

describe.each(LANGS)('crane page body (%s)', (lang) => {
  const copy = getCopy(lang);
  const home = lang === 'ar' ? '/' : '/en/';

  it.each(CRANE_PAGES.map((c) => [c.id]))('%s: one h1 with the model, headings in order, a breadcrumb', (id) => {
    const crane = byId(id);
    const html = page(crane, lang);
    const h1 = html.querySelectorAll('h1');
    expect(h1).toHaveLength(1);
    expect(h1[0]?.textContent).toContain(crane.model);
    const levels = [...html.querySelectorAll('main h1, main h2, main h3, main h4')].map((h) => Number(h.tagName[1]));
    levels.forEach((level, i) => expect(level - (levels[i - 1] ?? 0), `${id} heading ${i}`).toBeLessThanOrEqual(1));
    const crumbs = html.querySelector(`nav[aria-label="${cranePageCopy[lang].breadcrumb.label}"]`);
    expect([...(crumbs?.querySelectorAll('a') ?? [])].map((a) => a.getAttribute('href'))).toEqual([home, `${home}#crane-list`]);
    expect(crumbs?.querySelector('[aria-current="page"]')?.textContent).toBe(crane.model);
  });

  it.each(CRANE_PAGES.map((c) => [c.id]))('%s: request, form, compare and the other four cranes', (id) => {
    const crane = byId(id);
    const html = page(crane, lang);
    const wa = html.querySelector('[data-testid="crane-page-whatsapp"]')?.getAttribute('href') ?? '';
    expect(decodeURIComponent(wa)).toContain(`${crane.make} ${crane.model}`);
    expect(html.querySelector('[data-testid="crane-page-form"]')?.getAttribute('href')).toBe(`${home}?crane=${id}#request`);
    expect(html.querySelector('[data-testid="crane-page-compare"]')?.getAttribute('href')).toBe(`${home}?compare=${id}#crane-compare`);
    const rail = [...html.querySelectorAll('a[data-crane-link]')].map((a) => a.getAttribute('href'));
    expect(rail).toEqual(CRANE_PAGES.filter((c) => c.id !== id).map((c) => cranePath(c.id, lang)));
    // Header and footer lead to the home page; the language switch to the same crane.
    expect(html.querySelector('[data-testid="lang-switch"]')?.getAttribute('href')).toBe(cranePath(crane.id, lang === 'ar' ? 'en' : 'ar'));
    expect(html.querySelector('[data-nav="services"]')?.getAttribute('href')).toBe(`${home}#services`);
    expect(html.querySelector('[data-testid="header-request"]')?.getAttribute('href')).toBe(`${home}?crane=${id}#request`);
    expect(html.querySelector('[data-testid="back-to-top"]')?.getAttribute('href')).toBe('#main');
  });

  it.each(CRANE_PAGES.map((c) => [c.id]))('%s: specification has no empty rows and names its sources', (id) => {
    const html = page(byId(id), lang);
    const spec = html.querySelector('#specification');
    expect(spec).not.toBeNull();
    expect(spec?.textContent).not.toContain('—');
    for (const dd of spec?.querySelectorAll('dd') ?? []) expect(dd.textContent?.trim()).not.toBe('');
    expect(spec?.querySelectorAll('a[target="_blank"][rel~="noopener"]').length).toBeGreaterThan(0);
  });

  it('GMK6350: 317.5 t at 2.44 m, the US-ton note, never "350 t"', () => {
    const html = page(byId('gmk6350'), lang);
    const text = html.querySelector('main')?.textContent ?? '';
    expect(html.querySelector('.cp-readout .sr-only')?.textContent).toBe(`317.5 ${copy.hoist.unit}`);
    expect(text).toContain('2.44');
    expect(text).toContain(lang === 'ar' ? 'أمريكي' : 'US tons');
    expect(text).not.toMatch(/350\s?t\b|350\s?طن(?!اً أمريكي)/);
  });

  it('QUY250: 250 t labelled as the model name, the 260 t note, a † on the capacity row', () => {
    const html = page(byId('quy250'), lang);
    const hero = html.querySelector('#crane-hero')?.textContent ?? '';
    expect(hero).toContain(lang === 'ar' ? 'حسب اسم الطراز' : 'From the model name');
    expect(hero).toContain('260');
    expect(html.querySelector('[data-row="maxCapacity"] dd')?.textContent).toContain('250');
    expect(html.querySelector('[data-row="maxCapacity"] dd .cp-dagger')).not.toBeNull();
    expect(html.querySelector('[data-row="maxCapacity"] dd .sr-only')?.textContent).toContain(lang === 'ar' ? 'ملاحظة' : 'note');
  });

  it('keeps reveals to the shared vocabulary and off the hero; every image has alt', () => {
    for (const crane of CRANE_PAGES) {
      const html = page(crane, lang);
      for (const el of html.querySelectorAll('[data-reveal]')) {
        expect(REVEAL_KINDS).toContain(el.getAttribute('data-reveal'));
        expect(el.closest('#crane-hero')).toBeNull();
      }
      for (const img of html.querySelectorAll('img')) expect(img.hasAttribute('alt')).toBe(true);
      expect(html.querySelector('[data-crane-hero-photo] img')?.getAttribute('fetchpriority')).toBe('high');
      expect(html.innerHTML).not.toMatch(/[✕✖✓→←]/);
    }
  });
});

describe('crane page head', () => {
  const SITE = 'https://atlas.example';
  it.each(LANGS.flatMap((lang) => CRANE_PAGES.map((c) => [lang, c.id] as const)))('%s %s: title, description, canonical, hreflang, OG, breadcrumb', (lang, id) => {
    const crane = byId(id);
    const head = craneHead(crane, getCopy(lang), lang, SITE);
    const { title, description } = craneMeta(crane, getCopy(lang), lang);
    expect(title.length).toBeGreaterThanOrEqual(20);
    expect(title.length).toBeLessThanOrEqual(70);
    expect(description.length).toBeGreaterThanOrEqual(60);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(head).toContain(`<link rel="canonical" href="${SITE}${cranePath(id, lang)}" />`);
    expect(head).toContain(`hreflang="ar" href="${SITE}/cranes/${id}/"`);
    expect(head).toContain(`hreflang="en" href="${SITE}/en/cranes/${id}/"`);
    expect(head).toContain(`hreflang="x-default" href="${SITE}/cranes/${id}/"`);
    expect(head).toContain(`<meta property="og:image" content="${SITE}/og/cranes/${id}.jpg" />`);
    expect(head.match(/rel="preload" as="image" type="image\/avif" fetchpriority="high" media="\(min-width: 768px\)"/g)).toHaveLength(1);
    expect(head.match(/rel="preload"/g)).toHaveLength(1);
    const ld = JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '{}');
    expect(ld['@type']).toBe('BreadcrumbList');
    expect(ld.itemListElement).toHaveLength(3);
    expect(head).not.toMatch(/"Product"|"Offer"|aggregateRating/);
    expect(head).not.toMatch(/[٠-٩]/);
  });

  it('QUY250 states no capacity in its description (the figure is still to be confirmed)', () => {
    for (const lang of LANGS) expect(craneMeta(byId('quy250'), getCopy(lang), lang).description).not.toMatch(/(250|260)[\s\u00A0]?(t\b|طن)/);
  });

  it('has an Open Graph image for every crane page', () => {
    for (const c of CRANE_PAGES) expect(() => readFileSync(resolve(process.cwd(), `public/og/cranes/${c.id}.jpg`))).not.toThrow();
  });
});

describe('crane page copy', () => {
  const leaves = (value: unknown, path = ''): { path: string; value: string }[] =>
    typeof value === 'string'
      ? [{ path, value }]
      : value && typeof value === 'object'
        ? Object.entries(value).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k))
        : [];
  const ar = leaves(cranePageCopy.ar);
  const en = leaves(cranePageCopy.en);

  it('has the same keys and {placeholders} in both languages, none empty', () => {
    expect(ar.map((l) => l.path)).toEqual(en.map((l) => l.path));
    const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    ar.forEach(({ path, value }, i) => {
      expect(value.trim(), path).not.toBe('');
      expect(vars(value), path).toEqual(vars(en[i]?.value ?? ''));
    });
  });

  it('uses Arabic punctuation and no dash ranges in Arabic; promises no lift', () => {
    for (const { path, value } of ar.filter(({ value }) => /[؀-ۿ]/.test(value))) {
      expect(value.replace(/\{[a-zA-Z]+\}/g, ''), path).not.toMatch(/[,;?]/);
      expect(value, path).not.toMatch(/\d\s*–\s*\d|ـ/);
    }
    for (const { path, value } of [...ar, ...en]) expect(value, path).not.toMatch(/\bcan lift\b|\bwill lift\b|guarantee|our fleet|our cranes|أسطولنا|رافعاتنا/i);
  });

  it('captions every photo a crane page shows', () => {
    for (const lang of LANGS) for (const c of CRANE_PAGES) expect(page(c, lang).querySelectorAll('.cp-story__step h3').length).toBeGreaterThan(0);
  });
});

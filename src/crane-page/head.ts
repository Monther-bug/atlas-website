import { cranePageCopy } from '@/content/crane-page-copy';
import { cranePath } from '@/content/crane-pages';
import type { Copy, Crane, Lang } from '@/content/types';
import { getImage } from '@/generated/images';
import { fillTemplate } from '@/lib/whatsapp';
import { ORG_NAME, jsonLdScript } from '@/seo/jsonld';
import { HERO_SIZES } from './CraneBody';
import { boomRange, nameOf, photosFor, rating } from './data';

/**
 * The <head> of one crane page (prerender): title, description, canonical, the hreflang pair + x-default, Open Graph
 * and Twitter (the crane's own photo, public/og/cranes/<id>.jpg), the hero photo's preloads (one per art-directed
 * crop, AVIF, high priority) and a BreadcrumbList. No Product or Offer schema: there is no price, and no rating may
 * be invented. Pure: takes the site URL, returns HTML.
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function craneMeta(crane: Crane, copy: Copy, lang: Lang): { title: string; description: string } {
  const page = cranePageCopy[lang].meta;
  const name = nameOf(crane);
  const type = copy.craneTypes[crane.type].full;
  const r = rating(crane, copy, lang);
  const lead = r.conflict
    ? ''
    : fillTemplate(r.radius !== undefined ? page.capacity : page.capacityNoRadius, {
        capacity: r.text,
        radius: r.radius !== undefined ? `${r.radius.toString()} ${copy.specs.units.m}` : '',
      });
  return {
    title: fillTemplate(page.title, { name, type }),
    description: fillTemplate(page.description, { name, type, lead, boom: boomRange(crane, copy, lang) ?? '' }).replace(/ /g, ' '),
  };
}

export function craneHead(crane: Crane, copy: Copy, lang: Lang, siteUrl: string): string {
  const site = siteUrl.replace(/\/+$/, '');
  const { title, description } = craneMeta(crane, copy, lang);
  const url = (l: Lang) => `${site}${cranePath(crane.id, l)}`;
  const { lead } = photosFor(crane);
  const og = `${site}/og/cranes/${crane.id}.jpg`;
  const alt = copy.alt[lead];
  const other: Lang = lang === 'ar' ? 'en' : 'ar';
  const desktop = getImage(lead, 'desktop_16x9');
  const srcset = (list: { url: string; width: number }[]) => list.map((s) => `${s.url} ${s.width}w`).join(', ');
  const crumbs = cranePageCopy[lang].breadcrumb;
  const home = `${site}${lang === 'en' ? '/en/' : '/'}`;
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: crumbs.home, item: home },
      { '@type': 'ListItem', position: 2, name: crumbs.cranes, item: `${home}#crane-list` },
      { '@type': 'ListItem', position: 3, name: nameOf(crane), item: url(lang) },
    ],
  };
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url(lang)}" />`,
    `<link rel="alternate" hreflang="ar" href="${url('ar')}" />`,
    `<link rel="alternate" hreflang="en" href="${url('en')}" />`,
    `<link rel="alternate" hreflang="x-default" href="${url('ar')}" />`,
    // The hero photo, before the stylesheet and scripts, from 768 px (where it is on the first screen). On phones it
    // starts at the fold (crane-page.css), so it is not preloaded there and never competes with the fonts.
    `<link rel="preload" as="image" type="image/avif" fetchpriority="high" media="(min-width: 768px)" imagesrcset="${srcset(desktop.avif)}" imagesizes="${HERO_SIZES}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${url(lang)}" />`,
    `<meta property="og:site_name" content="${ORG_NAME[lang]}" />`,
    `<meta property="og:locale" content="${lang === 'ar' ? 'ar_LY' : 'en_GB'}" />`,
    `<meta property="og:locale:alternate" content="${other === 'ar' ? 'ar_LY' : 'en_GB'}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${og}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(alt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${og}" />`,
    `<meta name="twitter:image:alt" content="${esc(alt)}" />`,
    jsonLdScript(breadcrumb),
  ].join('\n    ');
}

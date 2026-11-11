import type { Lang } from '@/content/types';

/** og:site_name values from copy deck §1. */
export const ORG_NAME = { ar: 'أطلس الصحراء', en: 'Atlas Alshraa' } as const;

export interface JsonLdInput {
  lang: Lang;
  siteUrl: string; // no trailing slash
  email: string; // siteInfo.email (confirmed)
  facebook: string; // siteInfo.facebook (confirmed)
  tiktok: string; // siteInfo.tiktok (confirmed)
  phone: string | null; // env.phone: set only once Atlas supplies it (production requires it)
  address: { ar: string; en: string } | null; // siteInfo.address: null until verified
}

/** Organization (plus LocalBusiness once an address exists, since Google requires one) with confirmed fields only (spec §10). Phone and address join
 *  automatically when their data exists. Geo and opening hours are added the same way later. */
export function buildJsonLd(input: JsonLdInput): Record<string, unknown> {
  const other: Lang = input.lang === 'ar' ? 'en' : 'ar';
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': input.address ? ['Organization', 'LocalBusiness'] : 'Organization',
    '@id': `${input.siteUrl}/#organization`,
    name: ORG_NAME[input.lang],
    alternateName: ORG_NAME[other],
    url: `${input.siteUrl}/`,
    logo: `${input.siteUrl}/brand/badge.png`,
    email: input.email,
    sameAs: [input.facebook, input.tiktok],
  };
  if (input.phone) data.telephone = input.phone;
  if (input.address) data.address = { '@type': 'PostalAddress', streetAddress: input.address[input.lang], addressCountry: 'LY' };
  return data;
}

/** The <script> tag. '<' is escaped so no string inside can end the script early. */
export function jsonLdScript(data: Record<string, unknown>): string {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

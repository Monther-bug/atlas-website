import type { Plugin } from 'vite';
import { fillSiteUrl, normalizeSiteUrl } from '../scripts/lib/seo.mjs';

/**
 * Writes the site address into both HTML entries (canonical, hreflang, Open Graph, Twitter).
 * SITE_URL (or VITE_SITE_URL) sets it; without one the local preview address is used.
 */
export function siteUrl(raw: string | undefined = process.env.VITE_SITE_URL ?? process.env.SITE_URL): Plugin {
  const url = normalizeSiteUrl(raw);
  return {
    name: 'atlas-site-url',
    transformIndexHtml: { order: 'pre', handler: (html: string) => fillSiteUrl(html, url) },
  };
}

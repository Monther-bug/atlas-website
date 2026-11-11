export declare const DEFAULT_SITE_URL: string;
export declare const PAGES: ReadonlyArray<{ lang: 'ar' | 'en'; path: string }>;
export declare function normalizeSiteUrl(raw: string | null | undefined): string;
export declare function siteUrlFromEnv(
  env: Record<string, string | undefined>,
  fileEnv?: Record<string, string | undefined>,
): string | undefined;
export declare function fillSiteUrl(text: string, siteUrl: string): string;
export declare function buildSitemap(siteUrl: string, lastmod: string): string;

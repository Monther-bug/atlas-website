export type BuildTarget = 'staging' | 'production';
declare const __BUILD_TARGET__: BuildTarget;          // injected by vite `define`
export const env = {
  target: __BUILD_TARGET__,
  siteUrl: (import.meta.env.VITE_SITE_URL as string | undefined) || 'http://localhost:4173',
  whatsapp: (import.meta.env.VITE_WHATSAPP as string | undefined) || null, // digits only, e.g. 2189XXXXXXXX
  phone: (import.meta.env.VITE_PHONE as string | undefined) || null,       // e.g. +2189XXXXXXXX
  formEndpoint: (import.meta.env.VITE_FORM_ENDPOINT as string | undefined) || null,
  ga4Id: (import.meta.env.VITE_GA4_ID as string | undefined) || null,
} as const;
/** True when an unverified value must show the DraftBadge (staging only). */
export const isDraft = (verified: boolean) => !verified && env.target !== 'production';

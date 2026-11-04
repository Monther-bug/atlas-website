import { env } from '@/env';

export type AnalyticsEvent = 'whatsapp_click' | 'call_click' | 'request_crane' | 'form_submit' | 'filter_use' | 'lang_switch';

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

let started = false;

/** Creates the gtag queue the first time it is needed. gtag.js later drains it. */
function ensureGtag(id: string): Gtag {
  if (window.gtag) return window.gtag;
  const dataLayer = (window.dataLayer ??= []);
  // gtag.js reads `arguments` objects from the dataLayer, not arrays.
  const gtag: Gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id);
  return gtag;
}

/** Sends a GA4 event (queued until gtag.js loads). No-op without VITE_GA4_ID. */
export function track(event: AnalyticsEvent, params: Record<string, string> = {}): void {
  if (!env.ga4Id || typeof window === 'undefined') return;
  ensureGtag(env.ga4Id)('event', event, params);
}

/** Loads gtag.js after `load` and an idle slot, once. Call it from App's effect. */
export function loadAnalytics(): void {
  const id = env.ga4Id;
  if (!id || started || typeof window === 'undefined') return;
  started = true;

  const inject = () => {
    ensureGtag(id);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.append(script);
  };

  const whenIdle = () => {
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(inject, { timeout: 5000 });
    else window.setTimeout(inject, 1);
  };

  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}

// Server entry for the build-time prerender (scripts/prerender.mjs). Never shipped to browsers.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from '@/App';
import { siteInfo } from '@/content';
import type { Lang } from '@/content/types';
import { env } from '@/env';
import { LangProvider } from '@/lib/lang';
import { buildJsonLd, jsonLdScript } from '@/seo/jsonld';

/** Static HTML for one page: the same tree src/main.tsx hydrates. */
export function render(lang: Lang): string {
  return renderToString(
    <StrictMode>
      <LangProvider lang={lang}>
        <App />
      </LangProvider>
    </StrictMode>,
  );
}

/** Extra <head> tags for one page, injected at <!--head-->: the JSON-LD block. */
export function head(lang: Lang): string {
  return jsonLdScript(
    buildJsonLd({
      lang,
      siteUrl: env.siteUrl.replace(/\/+$/, ''),
      email: siteInfo.email,
      facebook: siteInfo.facebook,
      phone: env.phone,
      address: siteInfo.address,
    }),
  );
}

// Server entry for the build-time prerender (scripts/prerender.mjs). Never shipped to browsers.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from '@/App';
import { siteInfo } from '@/content';
import { getCopy } from '@/content/all';
import type { Lang } from '@/content/types';
import { env } from '@/env';
import { LangProvider } from '@/lib/lang';
// The lineup's load check and comparison render into the HTML here; the browser loads them as lazy islands.
import '@/sections/crane-list/server-islands';
import { buildJsonLd, jsonLdScript } from '@/seo/jsonld';
import { CRANE_PAGES } from '@/content/crane-pages';
import type { CraneId } from '@/content/types';
import { CraneApp } from '@/crane-page/CraneApp';
// The crane page body renders into the HTML here; the browser keeps it as a static island.
import '@/crane-page/register';
import { craneHead } from '@/crane-page/head';
import { cranePageCopy } from '@/content/crane-page-copy';

/** Static HTML for one page: the same tree src/boot.tsx hydrates. */
export function render(lang: Lang): string {
  return renderToString(
    <StrictMode>
      <LangProvider lang={lang} copy={getCopy(lang)}>
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

/** The crane pages to write: every visible crane, in both languages (never the hidden CKE2500). */
export const cranePageIds: readonly CraneId[] = CRANE_PAGES.map((c) => c.id);

function craneOf(id: CraneId) {
  const crane = CRANE_PAGES.find((c) => c.id === id);
  if (!crane) throw new Error(`prerender: no crane page for "${id}"`);
  return crane;
}

/** Static HTML for one crane page: the same tree src/boot-crane.tsx hydrates. */
export function renderCrane(lang: Lang, id: CraneId): string {
  const crane = craneOf(id);
  return renderToString(
    <StrictMode>
      <LangProvider lang={lang} copy={getCopy(lang)} crane={crane.id}>
        <CraneApp crane={crane} />
      </LangProvider>
    </StrictMode>,
  );
}

/** The <head> tags of one crane page, injected at <!--head-->. */
export function headCrane(lang: Lang, id: CraneId): string {
  return craneHead(craneOf(id), getCopy(lang), lang, env.siteUrl);
}

/** Strings the truth gate scans at prerender too (they never reach the client). */
export const cranePageStrings = cranePageCopy;

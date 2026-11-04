// Server entry for the build-time prerender (scripts/prerender.mjs). Never shipped to browsers.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from '@/App';
import type { Lang } from '@/content/types';
import { LangProvider } from '@/lib/lang';

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

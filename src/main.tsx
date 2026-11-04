import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from '@/App';
import type { Lang } from '@/content/types';
import { LangProvider } from '@/lib/lang';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from the page');

// Each HTML entry declares its language on <html> (index.html = ar, en/index.html = en).
const lang: Lang = document.documentElement.lang === 'en' ? 'en' : 'ar';

// The same tree src/entry-server.tsx renders for the prerender.
const app = (
  <StrictMode>
    <LangProvider lang={lang}>
      <App />
    </LangProvider>
  </StrictMode>
);

if (container.firstElementChild) {
  // Built pages: the HTML was prerendered by scripts/prerender.mjs, so React adopts it.
  hydrateRoot(container, app, {
    onRecoverableError(error, info) {
      // Make every hydration mismatch visible to QA (qa/smoke-prerender.mjs, qa/run-qa.mjs).
      console.error('[hydration]', error, info.componentStack ?? '');
    },
  });
} else {
  // Dev server: #root only holds the <!--app--> comment (not an element), so render from scratch.
  createRoot(container).render(app);
}

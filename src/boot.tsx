import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from '@/App';
import type { Copy } from '@/content/types';
import { LangProvider } from '@/lib/lang';
import { KeepPageBoundary } from '@/lib/KeepPageBoundary';
import './styles.css';

/**
 * Starts the page. Called by the per-language entries (src/main-ar.tsx, src/main-en.tsx), each of which imports only
 * its own copy, so a page never downloads the other language's text.
 */
export function boot(copy: Copy): void {
  const container = document.getElementById('root');
  if (!container) throw new Error('#root is missing from the page');


  // The same tree src/entry-server.tsx renders for the prerender.
  // If a render error ever happens, the boundary puts the prerendered page back rather than leaving it blank.
  const snapshot = container.innerHTML;
  const app = (
    <StrictMode>
      <KeepPageBoundary snapshot={snapshot}>
        <LangProvider lang={copy.lang} copy={copy}>
          <App />
        </LangProvider>
      </KeepPageBoundary>
    </StrictMode>
  );

  // DEV ONLY: the v2 kitchen (/?v2=kitchen, /en/?v2=kitchen). `import.meta.env.DEV` is false in builds, so the branch and
  // the kitchen chunk are dropped from production.
  const kitchen = import.meta.env.DEV && new URLSearchParams(window.location.search).get('v2') === 'kitchen';

  if (kitchen) {
    void import('./kitchen/Kitchen').then(({ Kitchen }) => {
      createRoot(container).render(
        <StrictMode>
          <LangProvider lang={copy.lang} copy={copy}>
            <Kitchen />
          </LangProvider>
        </StrictMode>,
      );
    });
  } else if (container.firstElementChild) {
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
}

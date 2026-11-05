import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { visibleCranes } from '@/content';
import { craneIdFromPath } from '@/content/crane-pages';
import type { Copy } from '@/content/types';
import { CraneApp } from '@/crane-page/CraneApp';
import { LangProvider } from '@/lib/lang';
import './styles.css';
import './crane-page/crane-page.css';

/**
 * Starts a crane page (/cranes/<id>/, /en/cranes/<id>/). Called by src/main-crane-ar.tsx / main-crane-en.tsx, which
 * import only their own copy. The crane comes from the address (the prerendered #root also names it). The tree is the
 * one src/entry-server.tsx renders for that page; the body is a static island, so hydration adopts it as it is.
 */
export async function bootCrane(copy: Copy): Promise<void> {
  // DEV ONLY: the dev server has no prerendered body, so it renders the full one (compiled out of builds).
  if (import.meta.env.DEV) await import('./crane-page/register');
  const container = document.getElementById('root');
  if (!container) throw new Error('#root is missing from the page');
  const id = craneIdFromPath(window.location.pathname) ?? (container.querySelector<HTMLElement>('[data-crane-page]')?.dataset.cranePage as string | undefined);
  const crane = visibleCranes.find((c) => c.id === id);
  if (!crane) throw new Error(`No crane page for ${window.location.pathname}`);

  const app = (
    <StrictMode>
      <LangProvider lang={copy.lang} copy={copy} crane={crane.id}>
        <CraneApp crane={crane} />
      </LangProvider>
    </StrictMode>
  );

  if (container.firstElementChild) {
    hydrateRoot(container, app, {
      onRecoverableError(error, info) {
        console.error('[hydration]', error, info.componentStack ?? '');
      },
    });
  } else {
    createRoot(container).render(app); // dev server: no prerendered HTML
  }
}

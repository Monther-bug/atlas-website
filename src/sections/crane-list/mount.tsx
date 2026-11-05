import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { Copy, Crane } from '@/content/types';
import { LangProvider } from '@/lib/lang';
import { announceLineup } from '@/lib/lineup';
import { CraneListBody } from './CraneList';
import { loadStore } from './load';

/**
 * Lazy entry of «اعثر على رافعتك»: renders the live body into the prerendered <section> (one synchronous commit
 * replaces the identical static HTML, so nothing flashes), keeps a load the visitor may already have typed, and tells
 * the motion layer the live cards exist (it binds the entrance, tickers, thumb and Flip to them).
 */
export function mountLineup(section: HTMLElement, copy: Copy, cranes: readonly Crane[]): () => void {
  const field = section.querySelector<HTMLInputElement>('input[name="load-check"]');
  const focused = field !== null && document.activeElement === field;
  if (field?.value) loadStore.set(field.value);
  // The comparison loads later, as its own chunk: until then it stays exactly as prerendered.
  const keptCompare = section.querySelector('#crane-compare')?.outerHTML;
  const root = createRoot(section);
  flushSync(() =>
    root.render(
      <LangProvider lang={copy.lang} copy={copy}>
        <CraneListBody cranes={cranes} keptCompare={keptCompare} />
      </LangProvider>,
    ),
  );
  section.dataset.live = '';
  if (focused) {
    const next = section.querySelector<HTMLInputElement>('input[name="load-check"]');
    next?.focus();
    next?.setSelectionRange(next.value.length, next.value.length);
  }
  announceLineup('mount');
  return () => {
    delete section.dataset.live;
    root.unmount();
  };
}

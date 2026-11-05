import type { Crane } from '@/content/types';
import { craneBodyRegistry } from './registry';

let kept: { __html: string } | null = null;

/** The prerendered body, read once before hydration (the same markup, so a client re-render rebuilds it, never blanks it). */
function keptBody(): { __html: string } {
  kept ??= { __html: typeof document === 'undefined' ? '' : (document.getElementById('crane-body')?.innerHTML ?? '') };
  return kept;
}

/**
 * The crane page body as a static island (the pattern of src/sections/island.tsx). Where the full body is registered
 * (prerender, dev server, tests) it renders in full; in the browser build it is never registered, so the page's
 * JavaScript carries none of its code, specifications or copy, and hydration adopts the prerendered HTML as it is.
 * Behaviour lives in effects on the DOM (CraneApp.tsx: photo story, click tracking, the view transition name) and in
 * the idle-loaded motion chunk (src/motion/crane.ts), which find their targets by data attributes.
 */
export function CraneBody({ crane }: { crane: Crane }) {
  const Full = craneBodyRegistry.full;
  if (Full) {
    return (
      <div id="crane-body" data-crane-page={crane.id}>
        <Full crane={crane} />
      </div>
    );
  }
  return <div id="crane-body" data-crane-page={crane.id} dangerouslySetInnerHTML={keptBody()} suppressHydrationWarning />;
}

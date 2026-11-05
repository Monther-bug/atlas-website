import { useEffect } from 'react';
import { track, type AnalyticsEvent } from '@/lib/analytics';

/**
 * Static islands: how Services and Why Atlas stay inside the main-JS budget (≤ 110 KB gz).
 *
 * Neither section holds React state. They render in full only where their HTML is produced: the prerender (SSR build),
 * the dev server and tests. Each section file branches on `import.meta.env.SSR || import.meta.env.DEV`, which Vite
 * folds to a literal, so in the client build the full tree, its art and its prerender-only copy drop out of the bundle.
 *
 * On the client the section keeps its outer element and a `.shell` with `dangerouslySetInnerHTML`. React claims the
 * element during hydration but never hydrates or patches what is inside it (react-dom 19: `shouldSetTextContent` is
 * true, and `innerHTML` is written only when `__html` changes). The DOM after hydration is the prerendered DOM, node
 * for node. `__html` holds that same prerendered markup, read once before hydration, so if React ever has to
 * client-render the root (a hydration error elsewhere), the section is rebuilt from it instead of going blank.
 *
 * Rules for an island: no React state or handlers inside; behaviour goes in effects that work on the DOM
 * (useTrackedClicks; WhyAtlas's crane on the hook); motion finds its targets by data attributes, as everywhere else.
 */
const kept = new Map<string, { __html: string }>();

/**
 * The prerendered markup of `#id > .shell`. Client builds only (the island branch is compiled out of the prerender),
 * read on the first render, before React has touched the DOM, and cached so every later render passes the same object.
 */
export function keptHtml(id: string): { __html: string } {
  let html = kept.get(id);
  if (!html) {
    html = { __html: document.getElementById(id)?.querySelector(':scope > .shell')?.innerHTML ?? '' };
    kept.set(id, html);
  }
  return html;
}

/** The client half of an island: the section's shell, adopted as prerendered. */
export function KeptShell({ id }: { id: string }) {
  return <div className="shell" dangerouslySetInnerHTML={keptHtml(id)} suppressHydrationWarning />;
}

/**
 * Analytics for an island, by delegation: a click on any `[data-track]` inside `#id` sends that event with
 * `data-track-location` and, when present, `data-track-service`. Works the same on the full render (dev, tests).
 */
export function useTrackedClicks(id: string): void {
  useEffect(() => {
    const root = document.getElementById(id);
    if (!root) return;
    const onClick = (event: MouseEvent) => {
      const el = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-track]') : null;
      if (!el || !root.contains(el)) return;
      const { track: name, trackLocation, trackService } = el.dataset;
      const params: Record<string, string> = { location: trackLocation ?? id };
      if (trackService) params.service = trackService;
      track(name as AnalyticsEvent, params);
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [id]);
}

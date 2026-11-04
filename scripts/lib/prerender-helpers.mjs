// Pure helpers for scripts/prerender.mjs (unit-tested in prerender-helpers.test.mjs).
export const APP_MARKER = '<!--app-->';
export const HEAD_MARKER = '<!--head-->';

function replaceOnce(html, marker, content) {
  const at = html.indexOf(marker);
  if (at === -1) throw new Error(`prerender: marker ${marker} not found in the page`);
  if (html.indexOf(marker, at + marker.length) !== -1) throw new Error(`prerender: marker ${marker} appears more than once`);
  // slice + concat, not String.replace: app HTML may contain "$&" and similar sequences.
  return html.slice(0, at) + content + html.slice(at + marker.length);
}

/** Replaces <!--app--> (inside <div id="root">) with the server-rendered app. */
export function injectApp(html, appHtml) {
  if (!appHtml || !appHtml.trim()) throw new Error('prerender: render() returned empty HTML');
  return replaceOnce(html, APP_MARKER, appHtml);
}

/** Replaces <!--head--> (just before </head>) with extra head tags; '' just removes the marker. */
export function injectHead(html, headHtml) {
  return replaceOnce(html, HEAD_MARKER, headHtml);
}

/** React 19 may emit <link rel="preload"> hints before the app markup. They belong in <head>,
 *  and #root must start with the app's first element or hydration will not match. */
export function extractLeadingLinks(appHtml) {
  const match = appHtml.match(/^(?:\s*<link\b[^>]*>)+/);
  if (!match) return { links: '', body: appHtml };
  return { links: match[0].trim(), body: appHtml.slice(match[0].length) };
}

/** Unresolved [[TOKEN]]s in rendered HTML. The truth gate fails a production build on any. */
export function findTokens(html) {
  const found = new Set(html.match(/\[\[[^\]\n]{0,80}\]\]/g) ?? []);
  if (found.size === 0 && html.includes('[[')) {
    const at = html.indexOf('[[');
    found.add(html.slice(at, at + 30));
  }
  return [...found].sort();
}

/** 'production' | 'staging', decided like vite.config.ts does: `shellEnv` is process.env, `fileEnv`
 *  is what Vite's loadEnv() read from the .env files. A non-empty shell value wins; anything but
 *  'production' builds staging. */
export function resolveBuildTarget(shellEnv, fileEnv) {
  const raw = shellEnv.BUILD_TARGET || fileEnv.BUILD_TARGET;
  return raw === 'production' ? 'production' : 'staging';
}

/** Number of <link rel="preload" as="font"> tags in the html (vite/font-preload.ts adds 3 per page). */
export function countFontPreloads(html) {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  return links.filter((tag) => /\brel\s*=\s*["']?preload["'\s/>]/i.test(tag) && /\bas\s*=\s*["']?font["'\s/>]/i.test(tag)).length;
}

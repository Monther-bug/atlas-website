import { minifySync, type Plugin } from 'vite';

/** Classic inline scripts only: `<script>` with no attributes (never modules, JSON-LD or src scripts). */
const INLINE = /<script>([\s\S]*?)<\/script>/g;

/**
 * Minifies every attribute-less inline <script> in a page. Their source in index.html / en/index.html stays commented
 * and readable (the head script that sets js / motion-ok / the first-visit loader); the built pages ship them minified.
 * ES2015 output: the script must also parse in browsers too old for the app, so they still get the plain page.
 */
export function minifyInlineScripts(html: string): string {
  return html.replace(INLINE, (_whole, code: string) => {
    const result = minifySync('inline.js', code, { compress: { target: 'es2015' }, mangle: true });
    if (result.errors.length) throw new Error(`inline-script: ${result.errors.map((e) => e.message).join('; ')}`);
    return `<script>${result.code.trim()}</script>`;
  });
}

/** Vite plugin (build only): ships the inline head script minified. */
export function inlineScriptMinify(): Plugin {
  return {
    name: 'atlas-inline-script-minify',
    apply: 'build',
    transformIndexHtml: { order: 'post', handler: (html: string) => minifyInlineScripts(html) },
  };
}

import type { HtmlTagDescriptor, Plugin } from 'vite';

/**
 * The three font files each page preloads (spec §4.5), by the name they are
 * emitted under (`assets/<name>-<hash>.woff2`). The others load on demand
 * through unicode-range.
 */
const PRELOADS = {
  ar: ['kufi-wght', 'plex-ar-400', 'archivo-wght-wdth'],
  en: ['archivo-wght-wdth', 'plex-la-400', 'plex-la-600'],
} as const;

/** Builds the preload tags for one HTML page from the emitted bundle file names. */
export function fontPreloadTags(htmlPath: string, bundleFiles: string[], base = '/'): HtmlTagDescriptor[] {
  const lang = htmlPath.startsWith('/en/') ? 'en' : 'ar';
  return PRELOADS[lang].map((name) => {
    const file = bundleFiles.find((f) => f.endsWith('.woff2') && f.split('/').pop()!.startsWith(`${name}-`));
    if (!file) throw new Error(`font-preload: no emitted .woff2 for "${name}". Did src/fonts.css change?`);
    return {
      tag: 'link',
      attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `${base}${file}`, crossorigin: true },
      injectTo: 'head-prepend',
    };
  });
}

/** Vite plugin: adds the per-page font preloads to the built HTML (build only). */
export function fontPreload(): Plugin {
  let base = '/';
  return {
    name: 'atlas-font-preload',
    apply: 'build',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        return { html, tags: fontPreloadTags(ctx.path, Object.keys(ctx.bundle), base) };
      },
    },
  };
}

import type { HtmlTagDescriptor, Plugin } from 'vite';

/**
 * The three font files each page preloads (spec §4.5; v2 spec §4), by the name they are emitted under
 * (`assets/<name>-<hash>.woff2`): the faces of the first screen. Arabic: the H1 (Tajawal 800), header/buttons
 * (Tajawal 700) and body/lead (Tajawal 400). English: H1 (Poppins 700), header/buttons (Poppins 600) and body
 * (Poppins 400). The others (Poppins on the Arabic page, Plex Mono, the fill faces) load on demand.
 */
const PRELOADS = {
  ar: ['tajawal-ar-800', 'tajawal-ar-700', 'tajawal-ar-400'],
  en: ['poppins-700', 'poppins-600', 'poppins-400'],
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

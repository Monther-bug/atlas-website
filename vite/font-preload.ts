import type { HtmlTagDescriptor, Plugin } from 'vite';

/**
 * The three font files each page preloads (spec §4.5; v2 spec §4), by the name they are emitted under
 * (`assets/<name>-<hash>.woff2`): the faces of the first screen. Arabic: the H1 (Cairo 800), header/buttons
 * (Cairo 700) and body/lead (Cairo 400). English: H1 (Poppins 700), header/buttons (Poppins 600) and body
 * (Poppins 400). The others (Poppins on the Arabic page, Plex Mono, the fill faces) load on demand.
 */
const PRELOADS = {
  ar: ['cairo-ar-800', 'cairo-ar-700', 'cairo-ar-400'],
  en: ['poppins-700', 'poppins-600', 'poppins-400'],
} as const;

/**
 * The crane pages' first screen is set differently: the H1 is the model code in Plex Mono (Latin on both pages), the
 * capacity is the Poppins 700 readout, the rest is body text (Cairo 400 / Poppins 400). Still three files.
 */
const CRANE_PRELOADS = {
  ar: ['plex-mono-500', 'poppins-700', 'cairo-ar-400'],
  en: ['plex-mono-500', 'poppins-700', 'poppins-400'],
} as const;

/** The 404 page: Arabic first (H1 Cairo 800, buttons 700), then the Poppins 700 "404". */
const NOT_FOUND_PRELOADS = ['cairo-ar-800', 'cairo-ar-700', 'poppins-700'] as const;

/** Builds the preload tags for one HTML page from the emitted bundle file names. */
export function fontPreloadTags(htmlPath: string, bundleFiles: string[], base = '/'): HtmlTagDescriptor[] {
  const lang = htmlPath.startsWith('/en/') ? 'en' : 'ar';
  const crane = /(^|\/)cranes\//.test(htmlPath);
  const names = /(^|\/)404\.html$/.test(htmlPath) ? NOT_FOUND_PRELOADS : (crane ? CRANE_PRELOADS : PRELOADS)[lang];
  return names.map((name) => {
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

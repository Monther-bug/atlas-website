import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fontPreload } from './vite/font-preload.ts';
import { inlineScriptMinify } from './vite/inline-script.ts';
import { siteUrl } from './vite/site-url.ts';
import { truthGate } from './vite/truth-gate.ts';
import { cranePagesDev } from './vite/crane-pages-dev.ts';
import { notFoundFallback } from './vite/not-found-fallback.ts';
import { siteUrlFromEnv } from './scripts/lib/seo.mjs';

const path = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/**
 * Copy the build settings from `.env*` files into process.env, so that the
 * `define` below and the Node-side plugins see the same values as the client.
 * Values already in the shell environment win.
 *
 * It runs before Vite reads `import.meta.env`, so what it sets here reaches the client, the truth gate and (through
 * the SSR build that scripts/prerender.mjs starts with this config) the prerender and the 404 page's contact action.
 */
function syncEnv(mode: string) {
  const all = loadEnv(mode, process.cwd(), '');
  for (const key of ['BUILD_TARGET', 'SITE_URL', 'VITE_SITE_URL', 'VITE_WHATSAPP', 'VITE_PHONE']) {
    if (all[key] && !process.env[key]) process.env[key] = all[key];
  }
  // Atlas's phone and WhatsApp number, 0926367570 (Libya), confirmed by Atlas on 11 Nov 2026. It is the default, so
  // every build has the WhatsApp links (wa.me) and the Call buttons; VITE_WHATSAPP / VITE_PHONE still override it.
  process.env.VITE_WHATSAPP ||= '218926367570';
  process.env.VITE_PHONE ||= '+218 92 636 7570';
  // SITE_URL is the documented name; the client reads it as VITE_SITE_URL. With neither set, a Vercel build uses the
  // project's production domain (VERCEL_PROJECT_PRODUCTION_URL); locally it stays unset (the localhost default).
  const siteUrl = siteUrlFromEnv(process.env);
  if (siteUrl) process.env.VITE_SITE_URL = siteUrl;
}

export default defineConfig(({ mode }) => {
  syncEnv(mode);
  const raw = process.env.BUILD_TARGET;
  if (raw && raw !== 'staging' && raw !== 'production') {
    console.warn(`[atlas] BUILD_TARGET="${raw}" is not 'staging' or 'production'; treating it as 'staging'.`);
  }
  const target = raw === 'production' ? 'production' : 'staging';
  return {
    plugins: [
      siteUrl(),
      cranePagesDev(),
      notFoundFallback(),
      react(),
      tailwindcss(),
      fontPreload(),
      inlineScriptMinify(),
      truthGate({
        target,
        env: { siteUrl: process.env.VITE_SITE_URL, whatsapp: process.env.VITE_WHATSAPP, phone: process.env.VITE_PHONE },
      }),
    ],
    resolve: { alias: { '@': path('./src') } },
    define: { __BUILD_TARGET__: JSON.stringify(target) },
    build: {
      // The two home pages, and the two crane page templates (scripts/prerender.mjs writes /cranes/<id>/ from them).
      rollupOptions: {
        input: {
          ar: path('./index.html'),
          en: path('./en/index.html'),
          'crane-ar': path('./cranes/index.html'),
          'crane-en': path('./en/cranes/index.html'),
          // The 404 page (dist/404.html): static, no React; scripts/prerender.mjs fills its contact action.
          'not-found': path('./404.html'),
        },
      },
      // Never inline fonts as base64: the tiny unicode-range fill face (fill-la) must stay a separate file
      // that loads only when one of its characters is on screen, not ride in the CSS for every visitor.
      assetsInlineLimit: (file: string) => (file.endsWith('.woff2') ? false : undefined),
    },
  };
});

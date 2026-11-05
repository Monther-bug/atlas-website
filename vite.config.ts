import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fontPreload } from './vite/font-preload.ts';
import { inlineScriptMinify } from './vite/inline-script.ts';
import { siteUrl } from './vite/site-url.ts';
import { truthGate } from './vite/truth-gate.ts';

const path = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/**
 * Copy the build settings from `.env*` files into process.env, so that the
 * `define` below and the Node-side plugins see the same values as the client.
 * Values already in the shell environment win.
 */
function syncEnv(mode: string) {
  const all = loadEnv(mode, process.cwd(), '');
  for (const key of ['BUILD_TARGET', 'SITE_URL', 'VITE_SITE_URL', 'VITE_WHATSAPP', 'VITE_PHONE']) {
    if (all[key] && !process.env[key]) process.env[key] = all[key];
  }
  // SITE_URL is the documented name; the client reads it as VITE_SITE_URL.
  if (!process.env.VITE_SITE_URL && process.env.SITE_URL) process.env.VITE_SITE_URL = process.env.SITE_URL;
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
      rollupOptions: { input: { ar: path('./index.html'), en: path('./en/index.html') } },
      // Never inline fonts as base64: the tiny unicode-range fill faces (fill-ar, fill-la) must stay separate files
      // that load only when one of their characters is on screen, not ride in the CSS for every visitor.
      assetsInlineLimit: (file: string) => (file.endsWith('.woff2') ? false : undefined),
    },
  };
});

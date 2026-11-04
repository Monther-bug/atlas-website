// Build-time prerender: renders both pages with React on the server and writes the HTML
// into dist/. Runs after `vite build` (package.json "build"). Set KEEP_SSR=1 to keep
// dist-ssr/ for debugging a crash.
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build, loadEnv } from 'vite';
import { extractLeadingLinks, findTokens, injectApp, injectHead, resolveBuildTarget } from './lib/prerender-helpers.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = path.join(ROOT, 'dist');
const SSR_DIR = path.join(ROOT, 'dist-ssr');
// `vite build` runs in 'production' mode unless --mode is given; the SSR build below does the same.
const MODE = 'production';
// BUILD_TARGET may come from the shell or from .env files, exactly as in vite.config.ts.
const TARGET = resolveBuildTarget(process.env, loadEnv(MODE, ROOT, ''));
const PAGES = [
  { lang: 'ar', file: 'index.html' },
  { lang: 'en', file: path.join('en', 'index.html') },
];

// A string `ssr` entry replaces the two HTML inputs from vite.config.ts for this build.
const result = await build({
  root: ROOT,
  mode: MODE,
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir: 'dist-ssr', emptyOutDir: true, copyPublicDir: false, minify: false, sourcemap: false },
});
const chunks = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output ?? []);
const entry = chunks.find((chunk) => chunk.type === 'chunk' && chunk.isEntry);
if (!entry) throw new Error('prerender: the SSR build produced no entry chunk');

try {
  const server = await import(pathToFileURL(path.join(SSR_DIR, entry.fileName)).href);
  for (const page of PAGES) {
    const file = path.join(DIST, page.file);
    const html = await readFile(file, 'utf8');
    const { links, body } = extractLeadingLinks(server.render(page.lang));
    const out = injectHead(injectApp(html, body), links);
    const tokens = findTokens(out);
    if (tokens.length && TARGET === 'production') throw new Error(`truth gate: ${page.file} still contains ${tokens.join(', ')}`);
    if (tokens.length) console.warn(`prerender: ${page.file} shows ${tokens.length} draft token(s) (allowed in staging): ${tokens.join(', ')}`);
    await writeFile(file, out);
    console.log(`prerender: ${page.file} (${page.lang}) ${(Buffer.byteLength(out) / 1024).toFixed(1)} KB`);
  }
} finally {
  if (!process.env.KEEP_SSR) await rm(SSR_DIR, { recursive: true, force: true });
}

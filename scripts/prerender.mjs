// Build-time prerender: renders both home pages and the ten crane pages (/cranes/<id>/, /en/cranes/<id>/) with React on
// the server, injects their head tags, and writes sitemap.xml + robots.txt for SITE_URL. The crane pages are written from
// the two crane templates (cranes/index.html, en/cranes/index.html), which are then removed from dist/. Runs after `vite build` (package.json
// "build"). Set KEEP_SSR=1 to keep dist-ssr/ for debugging a crash.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build, loadEnv } from 'vite';
import { buildSitemap, fillSiteUrl, normalizeSiteUrl, siteUrlFromEnv } from './lib/seo.mjs';
import { dropDuplicateLinks, extractLeadingLinks, fillNotFound, findTokens, injectApp, injectHead, resolveBuildTarget } from './lib/prerender-helpers.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = path.join(ROOT, 'dist');
const SSR_DIR = path.join(ROOT, 'dist-ssr');
// `vite build` runs in 'production' mode unless --mode is given; the SSR build below does the same.
const MODE = 'production';
// BUILD_TARGET may come from the shell or from .env files, exactly as in vite.config.ts.
const TARGET = resolveBuildTarget(process.env, loadEnv(MODE, ROOT, ''));
const FILE_ENV = loadEnv(MODE, ROOT, '');
// Resolved here, before the SSR build below runs vite.config.ts: the same order as there (shell, then .env files, then
// the Vercel production domain), so sitemap.xml and robots.txt match the pages' canonical links.
const SITE_URL = normalizeSiteUrl(siteUrlFromEnv(process.env, FILE_ENV));
const LASTMOD = process.env.SITEMAP_LASTMOD ?? new Date().toISOString().slice(0, 10);
const PAGES = [
  { lang: 'ar', file: 'index.html' },
  { lang: 'en', file: path.join('en', 'index.html') },
];
const CRANE_TEMPLATES = { ar: path.join('cranes', 'index.html'), en: path.join('en', 'cranes', 'index.html') };

/** Hoisted links + body + head tags into a page; the truth gate's token scan; returns the HTML. */
function compose(html, rendered, head, label) {
  const { links, body } = extractLeadingLinks(rendered);
  // Skip hoisted links the built page already carries (e.g. the font preloads).
  const newLinks = dropDuplicateLinks(links, html);
  const headTags = [...newLinks, head].filter(Boolean).join('\n    ');
  const out = injectHead(injectApp(html, body), headTags);
  const tokens = findTokens(out);
  if (tokens.length && TARGET === 'production') throw new Error(`truth gate: ${label} still contains ${tokens.join(', ')}`);
  if (tokens.length) console.warn(`prerender: ${label} shows ${tokens.length} draft token(s) (allowed in staging): ${tokens.join(', ')}`);
  return out;
}

try {
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
  const server = await import(pathToFileURL(path.join(SSR_DIR, entry.fileName)).href);
  for (const page of PAGES) {
    const file = path.join(DIST, page.file);
    const html = await readFile(file, 'utf8');
    const out = compose(html, server.render(page.lang), server.head(page.lang), page.file);
    await writeFile(file, out);
    console.log(`prerender: ${page.file} (${page.lang}) ${(Buffer.byteLength(out) / 1024).toFixed(1)} KB`);
  }
  // The crane pages: one per visible crane and language, from that language's template.
  for (const lang of ['ar', 'en']) {
    const template = await readFile(path.join(DIST, CRANE_TEMPLATES[lang]), 'utf8');
    for (const id of server.cranePageIds) {
      const rel = path.join(lang === 'en' ? 'en' : '', 'cranes', id, 'index.html');
      const out = compose(template, server.renderCrane(lang, id), server.headCrane(lang, id), rel);
      await mkdir(path.dirname(path.join(DIST, rel)), { recursive: true });
      await writeFile(path.join(DIST, rel), out);
      console.log(`prerender: ${rel} (${lang}) ${(Buffer.byteLength(out) / 1024).toFixed(1)} KB`);
    }
  }
  // The templates themselves are not pages.
  for (const rel of Object.values(CRANE_TEMPLATES)) await rm(path.join(DIST, rel), { force: true });
  // The 404 page: no React, only its two contact markers (WhatsApp when configured, else email). VITE_WHATSAPP is set
  // by now even with no .env: the SSR build above ran vite.config.ts, whose syncEnv defaults it to Atlas's number.
  const notFound = path.join(DIST, '404.html');
  const nfHtml = fillNotFound(await readFile(notFound, 'utf8'), {
    whatsapp: process.env.VITE_WHATSAPP || FILE_ENV.VITE_WHATSAPP,
    email: server.siteInfo.email,
  });
  await writeFile(notFound, nfHtml);
  console.log(`prerender: 404.html ${(Buffer.byteLength(nfHtml) / 1024).toFixed(1)} KB`);
  const craneGroups = server.cranePageIds.map((id) => [
    { lang: 'ar', path: `/cranes/${id}/` },
    { lang: 'en', path: `/en/cranes/${id}/` },
  ]);
  await writeFile(path.join(DIST, 'sitemap.xml'), buildSitemap(SITE_URL, LASTMOD, craneGroups));
  const robots = path.join(DIST, 'robots.txt');
  await writeFile(robots, fillSiteUrl(await readFile(robots, 'utf8'), SITE_URL));
  console.log(`prerender: sitemap.xml and robots.txt for ${SITE_URL}`);
} finally {
  if (!process.env.KEEP_SSR) await rm(SSR_DIR, { recursive: true, force: true });
}

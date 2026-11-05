// Open Graph images of the crane pages: public/og/cranes/<id>.jpg, 1200 × 630, from the lead (card) photo of each
// visible crane, cut from its already-processed 16:9 crop in public/img (the originals are not needed, so this runs
// anywhere). Run after `npm run assets` whenever a card photo changes: `node scripts/build-crane-og.mjs`.
import { mkdir, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const IMG = path.join(ROOT, 'public', 'img');
const OUT = path.join(ROOT, 'public', 'og', 'cranes');

// The visible cranes and their card photos, read from cranes.ts (one entry per line).
const source = await readFile(path.join(ROOT, 'src', 'content', 'cranes.ts'), 'utf8');
const cranes = [...source.matchAll(/\{ id: '([^']+)'[^\n]*cardPhoto: '(\d+)'[^\n]*hidden: (true|false) \}/g)]
  .filter((m) => m[3] === 'false')
  .map((m) => ({ id: m[1], photo: m[2] }));
if (cranes.length === 0) throw new Error('build-crane-og: no visible crane found in cranes.ts');

const files = await readdir(IMG);
await mkdir(OUT, { recursive: true });
for (const { id, photo } of cranes) {
  // The widest WebP of the 16:9 crop.
  const best = files
    .map((f) => ({ f, m: f.match(new RegExp(`^${photo}-desktop_16x9-(\\d+)\\.[0-9a-f]+\\.webp$`)) }))
    .filter((x) => x.m)
    .sort((a, b) => Number(b.m[1]) - Number(a.m[1]))[0];
  if (!best) throw new Error(`build-crane-og: no 16:9 WebP for photo ${photo} (crane ${id})`);
  const out = path.join(OUT, `${id}.jpg`);
  const info = await sharp(path.join(IMG, best.f))
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(out);
  console.log(`og: ${path.relative(ROOT, out)} from ${best.f} (${(info.size / 1024).toFixed(0)} KB)`);
}

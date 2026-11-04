// Visual check for assets-src/hook-points.json, plus the temporary logo stand-in.
// Run: node scripts/mark-hooks.mjs   (PHOTOS_DIR as in build-assets.mjs)
// Writes .work/hooks/<photo>-<crop>.jpg (whole crop, 1200 px wide, red crosshair on the hook)
// and .work/hooks/<photo>-zoom.jpg (600x600 source pixels around the hook, 1:1),
// then public/brand/badge.png (the round badge cut from IMG_6363's watermark, 512 px).
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { hookInRect } from './lib/assets-helpers.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PHOTOS_DIR = path.resolve(process.env.PHOTOS_DIR ?? path.join(ROOT, '..'));
const OUT = path.join(ROOT, '.work/hooks');
const crops = JSON.parse(await readFile(path.join(ROOT, 'assets-src/crops.json'), 'utf8'));
const hooks = JSON.parse(await readFile(path.join(ROOT, 'assets-src/hook-points.json'), 'utf8'));
await mkdir(OUT, { recursive: true });

/** A red crosshair with a centre ring, as an SVG the size of the image it is laid over. */
const crosshair = (w, h, x, y) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      `<g stroke="#ff2a1f" stroke-width="2" fill="none">` +
      `<line x1="${x}" y1="0" x2="${x}" y2="${h}"/><line x1="0" y1="${y}" x2="${w}" y2="${y}"/>` +
      `<circle cx="${x}" cy="${y}" r="12"/></g></svg>`,
  );

for (const [id, hook] of Object.entries(hooks)) {
  const photo = crops.photos[id];
  const file = path.join(PHOTOS_DIR, photo.file);
  for (const [cropName, crop] of Object.entries(photo.crops)) {
    const rect = { left: crop.left, top: crop.top, width: crop.width, height: crop.height };
    if (crop.status !== 'OK' || !hookInRect(hook, rect)) {
      console.log(`${id} ${cropName}: hook outside the crop, no sling on this crop`);
      continue;
    }
    const scale = 1200 / rect.width;
    const h = Math.round(rect.height * scale);
    const x = Math.round((hook.x - rect.left) * scale);
    const y = Math.round((hook.y - rect.top) * scale);
    await sharp(file).extract(rect).resize({ width: 1200 })
      .composite([{ input: crosshair(1200, h, x, y) }]).jpeg({ quality: 82 })
      .toFile(path.join(OUT, `${id}-${cropName}.jpg`));
    const pct = `${(((hook.x - rect.left) / rect.width) * 100).toFixed(1)}% × ${(((hook.y - rect.top) / rect.height) * 100).toFixed(1)}%`;
    console.log(`${id} ${cropName}: hook at ${pct} of the crop -> .work/hooks/${id}-${cropName}.jpg`);
  }
  const zoom = {
    left: Math.max(0, hook.x - 300),
    top: Math.max(0, hook.y - 300),
    width: Math.min(600, photo.source.width - Math.max(0, hook.x - 300)),
    height: Math.min(600, photo.source.height - Math.max(0, hook.y - 300)),
  };
  await sharp(file).extract(zoom)
    .composite([{ input: crosshair(zoom.width, zoom.height, hook.x - zoom.left, hook.y - zoom.top) }])
    .jpeg({ quality: 90 }).toFile(path.join(OUT, `${id}-zoom.jpg`));
  console.log(`${id} zoom (1:1 around the hook) -> .work/hooks/${id}-zoom.jpg`);
}

// TEMPORARY logo stand-in (flagged in the README, Part E): the round badge burned into
// every photo as a watermark, cut from IMG_6363 using the watermark model in
// docs/04-asset-plan.md (centre x = w/2, y = h − 265·(w/4240), radius 135·(w/4240)).
// Replace public/brand/badge.png when Atlas sends the vector logo.
const badgeSrc = crops.photos['6363'];
const k = badgeSrc.source.width / 4240;
const cx = Math.round(badgeSrc.source.width / 2);
const cy = Math.round(badgeSrc.source.height - 265 * k);
const r = Math.round(135 * k);
const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><circle cx="256" cy="256" r="256"/></svg>`);
await mkdir(path.join(ROOT, 'public/brand'), { recursive: true });
await sharp(path.join(PHOTOS_DIR, badgeSrc.file))
  .extract({ left: cx - r, top: cy - r, width: 2 * r, height: 2 * r })
  .resize(512, 512, { kernel: 'lanczos3' })
  .ensureAlpha()
  .composite([{ input: mask, blend: 'dest-in' }])
  .png({ palette: true, compressionLevel: 9 })
  .toFile(path.join(ROOT, 'public/brand/badge.png'));
console.log(`public/brand/badge.png 512x512 (cut from ${badgeSrc.file}, centre ${cx},${cy}, r ${r})`);

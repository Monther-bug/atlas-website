// Builds every shipped photo from Atlas's originals. Run with `npm run assets`.
// Reads:  assets-src/crops.json (copy of docs/asset-crops.json), assets-src/hook-points.json,
//         the original JPEGs in PHOTOS_DIR (default: the folder that contains this repo). Never modified.
// Writes: public/img/*.avif + *.webp (folder wiped first), public/og-ar.jpg, public/og-en.jpg,
//         src/generated/images.ts (the manifest <Picture> reads).
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { encodePlan, hookInRect, imageFileName } from './lib/assets-helpers.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PHOTOS_DIR = path.resolve(process.env.PHOTOS_DIR ?? path.join(ROOT, '..'));
const OUT_IMG = path.join(ROOT, 'public/img');
const OUT_TS = path.join(ROOT, 'src/generated/images.ts');

const SKIP = new Set(['6367', '6370', '6371']); // Kobelco: carries another company's logo (spec §3)
const HERO = new Set(['6398', '6359']); // hero photos also get 2560 px
const CROP_NAMES = ['desktop_16x9', 'mobile_4x5', 'mobile_9x16'];
const OG = { 'og-ar.jpg': '6398', 'og-en.jpg': '6359' }; // from each photo's desktop_16x9 crop

const crops = JSON.parse(await readFile(path.join(ROOT, 'assets-src/crops.json'), 'utf8'));
const hooks = JSON.parse(await readFile(path.join(ROOT, 'assets-src/hook-points.json'), 'utf8'));
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

/** Throws if the original's size or EXIF orientation differs from crops.json. */
async function checkOriginal(photo) {
  const file = path.join(PHOTOS_DIR, photo.file);
  await access(file).catch(() => {
    throw new Error(`Missing original ${photo.file} in ${PHOTOS_DIR}. Set PHOTOS_DIR to the folder with the IMG_63*.JPG files.`);
  });
  const meta = await sharp(file).metadata();
  if (meta.width !== photo.source.width || meta.height !== photo.source.height || (meta.orientation ?? 1) !== 1) {
    throw new Error(
      `${file} is ${meta.width}x${meta.height} (EXIF orientation ${meta.orientation ?? 1}), but crops.json ` +
        `expects ${photo.source.width}x${photo.source.height}. Re-measure the crops before rebuilding.`,
    );
  }
  return file;
}

/** Decodes one crop of an original to raw pixels and returns a factory for fresh sharp pipelines. */
async function loadCrop(photo, rect) {
  const file = await checkOriginal(photo);
  const { data, info } = await sharp(file).extract(rect).raw().toBuffer({ resolveWithObject: true });
  const raw = { width: info.width, height: info.height, channels: info.channels };
  return () => sharp(data, { raw });
}

// Validate every original (exists, size, orientation) before wiping the previous output.
const used = Object.entries(crops.photos).filter(([id]) => !SKIP.has(id));
for (const [, photo] of used) await checkOriginal(photo);

for (const id of Object.keys(hooks)) {
  if (!crops.photos[id]) console.warn(`warning: hook-points.json has "${id}", which is not in crops.json; ignored.`);
  else if (SKIP.has(id)) console.warn(`warning: hook-points.json has "${id}", which is skipped (Kobelco); ignored.`);
}

await rm(OUT_IMG, { recursive: true, force: true });
await mkdir(OUT_IMG, { recursive: true });
await mkdir(path.dirname(OUT_TS), { recursive: true });

const images = {};
const placeholders = {}; // 24 px blurred WebP data URIs, kept out of the client bundle
const photoIds = [];
let total = 0;

for (const [id, photo] of used) {
  photoIds.push(id);
  for (const cropName of CROP_NAMES) {
    const crop = photo.crops[cropName];
    if (crop?.status !== 'OK') {
      console.warn(`warning: ${id} ${cropName} skipped (status ${crop?.status ?? 'missing'}).`);
      continue;
    }
    const rect = { left: crop.left, top: crop.top, width: crop.width, height: crop.height };
    const pipeline = await loadCrop(photo, rect);
    const entry = { photo: id, crop: cropName, rect, avif: [], webp: [], hook: hookInRect(hooks[id], rect) };
    const sizes = [];
    const plan = encodePlan(cropName, rect.width, HERO.has(id));
    for (const width of plan.widths) {
      const [avif, webp] = await Promise.all([
        pipeline().resize({ width }).avif({ quality: plan.avifQuality, effort: 4 }).toBuffer(),
        pipeline().resize({ width }).webp({ quality: 72 }).toBuffer(),
      ]);
      for (const [format, bytes] of [['avif', avif], ['webp', webp]]) {
        const name = imageFileName(id, cropName, width, format, bytes);
        await writeFile(path.join(OUT_IMG, name), bytes);
        entry[format].push({ url: `/img/${name}`, width });
        total += bytes.length;
      }
      sizes.push(`${width}: ${kb(avif.length)}`);
    }
    const tiny = await pipeline().resize({ width: 24 }).webp({ quality: 50 }).toBuffer();
    placeholders[`${id}:${cropName}`] = `data:image/webp;base64,${tiny.toString('base64')}`;
    images[`${id}:${cropName}`] = entry;
    console.log(`${id} ${cropName.padEnd(12)} avif ${sizes.join(' · ')}${entry.hook ? '  [hook]' : ''}`);
  }
}

for (const [file, id] of Object.entries(OG)) {
  const source = images[`${id}:desktop_16x9`];
  if (!source) throw new Error(`Cannot build ${file}: photo ${id} has no desktop_16x9 crop with status OK in assets-src/crops.json.`);
  const { rect } = source;
  const pipeline = await loadCrop(crops.photos[id], rect);
  const bytes = await pipeline().resize({ width: 1200, height: 630, fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  await writeFile(path.join(ROOT, 'public', file), bytes);
  console.log(`public/${file} 1200x630 ${kb(bytes.length)}`);
}

const union = photoIds.map((id) => `'${id}'`).join(' | ');
const ts = `// Generated by scripts/build-assets.mjs. Do not edit: change assets-src/* and run \`npm run assets\`.
export type PhotoId = ${union};
export type CropName = 'desktop_16x9' | 'mobile_4x5' | 'mobile_9x16';
export interface ImageSource { url: string; width: number }
export interface CropImage {
  photo: PhotoId; crop: CropName;
  rect: { left: number; top: number; width: number; height: number }; // in source pixels
  avif: ImageSource[]; webp: ImageSource[];                          // ascending width
  hook: { x: number; y: number } | null;                            // source-pixel hook point, if any
}

export const images: Partial<Record<\`\${PhotoId}:\${CropName}\`, CropImage>> = ${JSON.stringify(images, null, 2)};

export function getImage(photo: PhotoId, crop: CropName): CropImage {
  const image = images[\`\${photo}:\${crop}\`];
  if (!image) throw new Error(\`No image \${photo}:\${crop}. Add the crop to assets-src/crops.json and run npm run assets.\`);
  return image;
}
`;
await writeFile(OUT_TS, ts);
const phTs = `// Generated by scripts/build-assets.mjs. Do not edit: change assets-src/* and run \`npm run assets\`.
// Blur placeholders (24 px WebP data URIs). Only the prerendered HTML uses them (see Picture.tsx),
// so they must be imported behind \`import.meta.env.SSR\` to stay out of the client bundle.
import type { CropName, PhotoId } from './images';

export const placeholders: Partial<Record<\`\${PhotoId}:\${CropName}\`, string>> = ${JSON.stringify(placeholders, null, 2)};
`;
await writeFile(path.join(path.dirname(OUT_TS), 'placeholders.ts'), phTs);
console.log(`\n${Object.keys(images).length} crops, ${kb(total)} of AVIF + WebP in public/img; wrote src/generated/images.ts and placeholders.ts`);

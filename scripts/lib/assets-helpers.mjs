// Pure helpers for scripts/build-assets.mjs and scripts/mark-hooks.mjs (tested in assets-helpers.test.mjs).
import { createHash } from 'node:crypto';

/**
 * Output widths for one crop. Every ladder width the crop can fill is used. If the crop is
 * too narrow for the next ladder width, its own full width is added too, unless that is
 * within 10% of the last width (no visible gain). Never upscales.
 */
export function widthsFor(cropWidth, isHero) {
  const ladder = isHero ? [640, 1280, 1920, 2560] : [640, 1280, 1920];
  const widths = ladder.filter((w) => w <= cropWidth);
  const last = widths.at(-1) ?? 0;
  if (widths.length < ladder.length && cropWidth > last * 1.1) widths.push(cropWidth);
  return widths.length ? widths : [cropWidth];
}

/**
 * Widths and AVIF quality for one crop. The 9:16 mobile hero is capped at 1080 px with AVIF q40,
 * so a 390 px-wide 3x phone (needs 1170) picks 1080 instead of 1280. That keeps it inside the
 * 80 KB mobile-hero budget (spec §9); the 8% resolution shortfall is not visible. Other crops
 * use widthsFor() at q42 (effort 6; perf plan: PSNR -1.1 dB, -30% bytes, no visible change at 100%).
 */
export function encodePlan(cropName, cropWidth, isHero) {
  if (cropName === 'mobile_9x16') {
    const widths = [640, 828, 1080].filter((w) => w <= cropWidth);
    return { widths: widths.length ? widths : [cropWidth], avifQuality: 40 };
  }
  return { widths: widthsFor(cropWidth, isHero), avifQuality: 42 };
}

/** The hook point (source pixels) if it lies inside the crop rectangle, else null. */
export function hookInRect(hook, rect) {
  if (!hook) return null;
  const inside =
    hook.x >= rect.left && hook.x < rect.left + rect.width && hook.y >= rect.top && hook.y < rect.top + rect.height;
  return inside ? { x: hook.x, y: hook.y } : null;
}

/** `<photo>-<crop>-<width>.<hash8>.<ext>`; the hash is the first 8 hex chars of the file's SHA-256. */
export function imageFileName(photo, crop, width, ext, bytes) {
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 8);
  return `${photo}-${crop}-${width}.${hash}.${ext}`;
}

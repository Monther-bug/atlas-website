/* Pure geometry for the lightbox (lazy chunk with Lightbox.tsx): swipe steps and the FLIP from a thumbnail. */

/**
 * A horizontal swipe in the lightbox, as a step through the photos. A swipe to the left is the same gesture as
 * the ArrowRight key: it brings in what lies to the right, which is the next photo in English and the previous one
 * in Arabic. Below `threshold` px it is not a swipe.
 */
export function swipeStep(dx: number, dir: 'rtl' | 'ltr', threshold = 48): -1 | 0 | 1 {
  if (!Number.isFinite(dx) || Math.abs(dx) < threshold) return 0;
  const towardRight = dx < 0; // finger moved left: content to the right comes in
  if (dir === 'ltr') return towardRight ? 1 : -1;
  return towardRight ? -1 : 1;
}

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Where the thumbnail's picture lies inside the lightbox frame, in frame pixels. Both are crops of the same source
 * photo (`thumbCrop` and `viewCrop` in source pixels), so the thumbnail is a sub-rectangle of what the lightbox
 * shows; it is clamped to the frame when the thumbnail's crop reaches past the view's.
 */
export function cropWithin(thumbCrop: Box, viewCrop: Box, frameW: number, frameH: number): Box {
  const sx = frameW / viewCrop.width;
  const sy = frameH / viewCrop.height;
  const left = Math.max(0, (thumbCrop.left - viewCrop.left) * sx);
  const top = Math.max(0, (thumbCrop.top - viewCrop.top) * sy);
  const right = Math.min(frameW, (thumbCrop.left + thumbCrop.width - viewCrop.left) * sx);
  const bottom = Math.min(frameH, (thumbCrop.top + thumbCrop.height - viewCrop.top) * sy);
  return { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}

/**
 * FLIP start state for the lightbox frame: a transform (origin top-left) and an inset clip that make the part of
 * the frame showing `sub` sit exactly over the thumbnail at `thumb` (viewport px). Animating both to identity grows
 * the thumbnail into the full photo. `radius` is the thumbnail's corner radius in screen px.
 */
export function flipFrom(thumb: Box, frame: Box, sub: Box, radius: number): { transform: string; clipPath: string } {
  const k = Math.max(thumb.width / sub.width, thumb.height / sub.height);
  const tx = thumb.left + thumb.width / 2 - (frame.left + (sub.left + sub.width / 2) * k);
  const ty = thumb.top + thumb.height / 2 - (frame.top + (sub.top + sub.height / 2) * k);
  // Clip to the thumbnail's own box (in frame px), which can be a little smaller than `sub` when aspects differ.
  const cw = thumb.width / k;
  const ch = thumb.height / k;
  const cl = sub.left + (sub.width - cw) / 2;
  const ct = sub.top + (sub.height - ch) / 2;
  const r = (n: number) => Math.round(n * 100) / 100;
  return {
    transform: `translate(${r(tx)}px, ${r(ty)}px) scale(${r(k * 1e4) / 1e4})`,
    clipPath: `inset(${r(ct)}px ${r(frame.width - cl - cw)}px ${r(frame.height - ct - ch)}px ${r(cl)}px round ${r(radius / k)}px)`,
  };
}

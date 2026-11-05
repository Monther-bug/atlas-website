import type { Lang } from '@/content/types';
import { formatNumber } from '@/lib/numbers';

export interface Point { x: number; y: number }
export interface Size { width: number; height: number }
/** Same shape as a DOMRect's left/top/width/height and as C6's crop `rect`. */
export interface Rect { left: number; top: number; width: number; height: number }

/**
 * A point given in source pixels (inside the crop `rect`), mapped to CSS pixels inside
 * an element of size `box` that shows the crop with `object-fit: cover` and
 * `object-position: position.x position.y` (default 50% 0, contract C6).
 * This is the CSS Images 3 formula: concrete size = rect × max scale, offset = (box − size) × position.
 */
export function hookToBox(hook: Point, rect: Rect, box: Size, position: Point = { x: 0.5, y: 0 }): Point {
  const scale = Math.max(box.width / rect.width, box.height / rect.height);
  const offsetX = (box.width - rect.width * scale) * position.x;
  const offsetY = (box.height - rect.height * scale) * position.y;
  return { x: offsetX + (hook.x - rect.left) * scale, y: offsetY + (hook.y - rect.top) * scale };
}

/**
 * Hoist timeline units, in vh of scroll (v2 fleet showcase). The entrance is the 100 vh the stage takes to rise into
 * view (the first crane is hoisted in on the way); then the stage is stuck for one beat per change of crane and the
 * exit, where its rope hands over to the progress rope. A crane is set down at `setDownAt` of its beat.
 */
export const HOIST = { enterUnits: 100, beatUnits: 55, outUnits: 30, setDownAt: 0.85 } as const;

const craneCount = (count: number) => Math.max(0, Math.floor(count));

/** The stuck part of the stage, in vh: (n − 1) beats plus the exit. */
export function hoistPinUnits(count: number): number {
  return Math.max(0, craneCount(count) - 1) * HOIST.beatUnits + HOIST.outUnits;
}

/** The whole scrubbed timeline, in vh: the entrance plus the stuck part. */
export function hoistTimelineUnits(count: number): number {
  return HOIST.enterUnits + hoistPinUnits(count);
}

/** Scroll distance the stage stays stuck for, in px, for a viewport `vh` px tall. */
export function hoistPinLength(count: number, vh: number): number {
  return (hoistPinUnits(count) * vh) / 100;
}

/**
 * Progress values (0–1 of the whole timeline) to snap to: each crane once it is set down (the first one the moment the
 * stage sticks), then the end. Nothing inside the entrance: the page never pulls a reader into the stage.
 */
export function hoistSnapPoints(count: number): number[] {
  const n = craneCount(count);
  const total = hoistTimelineUnits(n);
  const cranes = Array.from({ length: n }, (_, i) =>
    i === 0 ? HOIST.enterUnits / total : (HOIST.enterUnits + (i - 1) * HOIST.beatUnits + HOIST.beatUnits * HOIST.setDownAt) / total,
  );
  return [...cranes, 1];
}

/** Each counter runs from the previous crane's capacity to its own; the first starts at 0. */
export function counterSteps(values: number[]): Array<{ from: number; to: number }> {
  return values.map((to, i) => ({ from: i === 0 ? 0 : values[i - 1], to }));
}

/** What a counter shows mid-run: whole tonnes, Western digits (global rule 4). */
export function counterText(value: number, lang: Lang): string {
  return formatNumber(Math.max(0, Math.round(value)), lang);
}

/**
 * What a counter shows at `value` on its run from one rating to the next: the exact rating at either end
 * (a metric rating may have a decimal, e.g. 317.5 t), whole tonnes in between, never a whole number beyond
 * the end it is heading for. Non-finite values show the start: counterText/formatNumber would throw on them.
 */
export function counterLabel(value: number, step: { from: number; to: number }, lang: Lang): string {
  const { from, to } = step;
  const direction = Math.sign(to - from);
  if (direction === 0) return formatNumber(to, lang);
  if (!Number.isFinite(value) || (value - from) * direction <= 0) return formatNumber(from, lang);
  if ((value - to) * direction >= 0) return formatNumber(to, lang);
  const lo = Math.ceil(Math.min(from, to));
  const hi = Math.floor(Math.max(from, to));
  if (lo > hi) return formatNumber(from, lang);
  return formatNumber(Math.min(hi, Math.max(lo, Math.round(value))), lang);
}

/** Transform (with transform-origin 0 0) that moves and scales `from` onto `to`. */
export function flightDelta(from: Rect, to: Rect): { x: number; y: number; scaleX: number; scaleY: number } {
  return {
    x: to.left - from.left,
    y: to.top - from.top,
    scaleX: from.width ? to.width / from.width : 1,
    scaleY: from.height ? to.height / from.height : 1,
  };
}

/** A rect of `size`, centred on `anchor`. */
export function centerOn(anchor: Rect, size: Size): Rect {
  return {
    left: anchor.left + anchor.width / 2 - size.width / 2,
    top: anchor.top + anchor.height / 2 - size.height / 2,
    width: size.width,
    height: size.height,
  };
}

/** The snap point closest to `progress` (0–1). */
export function nearestSnap(points: number[], progress: number): number {
  return points.reduce((best, p) => (Math.abs(p - progress) < Math.abs(best - progress) ? p : best), points[0] ?? progress);
}

/**
 * The snap point to settle on after a scroll that moved in `direction` (1 down, −1 up, 0 unknown):
 * the next point that way, so a short scroll always reaches the next crane instead of being pulled
 * back (GSAP's own snap is directional too). A point within `tolerance` of `progress` keeps it there.
 */
export function directionalSnap(points: number[], progress: number, direction: number, tolerance = 0): number {
  if (points.length === 0) return progress;
  const nearest = nearestSnap(points, progress);
  if (direction === 0 || Math.abs(nearest - progress) <= tolerance) return nearest;
  if (direction > 0) {
    const ahead = points.filter((p) => p >= progress);
    return ahead.length ? Math.min(...ahead) : Math.max(...points);
  }
  const behind = points.filter((p) => p <= progress);
  return behind.length ? Math.max(...behind) : Math.min(...points);
}

/**
 * The vertical object-position (0 = top, 1 = bottom) that keeps `hook` (source px) no lower than
 * `maxFraction` of the box height when the crop `rect` is shown with `object-fit: cover`.
 * 0 (the C6 default, top-anchored) whenever the hook is already high enough or nothing is cut vertically.
 */
export function coverPositionY(hook: Point, rect: Rect, box: Size, maxFraction: number): number {
  const scale = Math.max(box.width / rect.width, box.height / rect.height);
  const overflow = rect.height * scale - box.height;
  if (overflow <= 1e-9) return 0;
  const needed = ((hook.y - rect.top) * scale - maxFraction * box.height) / overflow;
  return Math.min(1, Math.max(0, needed));
}

/**
 * The horizontal object-position (0 = left, 1 = right) that shows `point` (source px) at least `margin` (a fraction of
 * the box width) inside both side edges when the crop `rect` fills `box` with `object-fit: cover`. Stays at 0.5
 * (centred) whenever it can; 0.5 too when nothing is cut sideways.
 */
export function coverPositionX(point: Point, rect: Rect, box: Size, margin: number): number {
  const scale = Math.max(box.width / rect.width, box.height / rect.height);
  const overflow = rect.width * scale - box.width;
  if (overflow <= 1e-9) return 0.5;
  const x = (point.x - rect.left) * scale; // the point's distance from the image's left edge
  // Shown at x − overflow × p; keep it within [margin, 1 − margin] × width.
  const lo = (x - (1 - margin) * box.width) / overflow;
  const hi = (x - margin * box.width) / overflow;
  return Math.min(1, Math.max(0, Math.min(hi, Math.max(lo, 0.5))));
}

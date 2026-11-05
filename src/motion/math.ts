import type { Lang } from '@/content/types';
import { formatNumber } from '@/lib/numbers';

export interface Point { x: number; y: number }
export interface Size { width: number; height: number }
/** Same shape as a DOMRect's left/top/width/height and as C6's crop `rect`. */
export interface Rect { left: number; top: number; width: number; height: number }
/** Same shape as `SVGSVGElement.viewBox.baseVal`. */
export interface ViewBox { x: number; y: number; width: number; height: number }

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
 * The same mapping, as SVG 2 §8.2 computes `preserveAspectRatio="xMidYMin slice"`.
 * Kept separate on purpose: the test proves both give the same point.
 */
export function viewBoxToBox(point: Point, viewBox: ViewBox, box: Size): Point {
  // Steps 1–2: per-axis scale factors.
  const sx = box.width / viewBox.width;
  const sy = box.height / viewBox.height;
  // Step 3: "slice" uses the larger factor for both axes.
  const scale = Math.max(sx, sy);
  // Step 4: translate so the viewBox origin lands on the viewport origin.
  let tx = -viewBox.x * scale;
  const ty = -viewBox.y * scale;
  // Step 5: xMid centres horizontally; YMin keeps the top edge.
  tx += (box.width - viewBox.width * scale) / 2;
  return { x: point.x * scale + tx, y: point.y * scale + ty };
}

/** Hoist timeline units, in vh of scroll (spec §5: 30 in, 55 per crane, 30 out). */
export const HOIST = { inUnits: 30, beatUnits: 55, outUnits: 30, setDownAt: 0.85 } as const;

export function hoistPinUnits(count: number): number {
  const n = Math.max(0, Math.floor(count));
  return HOIST.inUnits + n * HOIST.beatUnits + HOIST.outUnits;
}

/** Scroll distance of the sticky stage, in px, for a viewport `vh` px tall. */
export function hoistPinLength(count: number, vh: number): number {
  return (hoistPinUnits(count) * vh) / 100;
}

/** Scroll progress values to snap to: 0, each crane once its tag is set down, 1. */
export function hoistSnapPoints(count: number): number[] {
  const n = Math.max(0, Math.floor(count));
  const total = hoistPinUnits(n);
  const beats = Array.from({ length: n }, (_, i) => (HOIST.inUnits + i * HOIST.beatUnits + HOIST.beatUnits * HOIST.setDownAt) / total);
  return [0, ...beats, 1];
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

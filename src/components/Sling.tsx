import type { CropImage } from '@/generated/images';

/** Leg length and half-spread in source pixels for a ~2400 px tall crop. */
export const LEG_DROP = 110;
export const LEG_SPREAD = 34;
export const PIN_RADIUS = 14;

export interface Point {
  x: number;
  y: number;
}

export interface SlingGeometry {
  viewBox: string;
  pin: Point;
  legEnds: [Point, Point];
  pinRadius: number;
  /** CSS lengths that put the button's top-centre on the legs' ends inside a `container-type: size` box. */
  anchorLeft: string;
  anchorTop: string;
}

const round = (n: number) => Math.round(n * 10) / 10;

export function slingGeometry(image: CropImage): SlingGeometry | null {
  const { rect, hook } = image;
  if (!hook) return null;
  const scale = rect.height / 2400;
  const drop = round(LEG_DROP * scale);
  const spread = round(LEG_SPREAD * scale);
  const endY = round(hook.y + drop);
  const centreX = rect.left + rect.width / 2;
  // One source pixel on screen under object-fit: cover (the larger of the two scale factors).
  const px = `max(100cqw / ${rect.width}, 100cqh / ${rect.height})`;
  return {
    viewBox: `${rect.left} ${rect.top} ${rect.width} ${rect.height}`,
    pin: hook,
    legEnds: [
      { x: round(hook.x - spread), y: endY },
      { x: round(hook.x + spread), y: endY },
    ],
    pinRadius: round(PIN_RADIUS * scale),
    anchorLeft: `calc(50cqw + ${round(hook.x - centreX)} * ${px})`,
    anchorTop: `calc(${round(endY - rect.top)} * ${px})`,
  };
}

type Rect = CropImage['rect'];

/**
 * The smallest height of a full-width photo box that keeps the hook, the legs and `below` (a CSS sum such as
 * `3.5rem + 1.5rem`: the button plus a margin) inside the photo. It uses the width-driven scale (100vw / width),
 * which holds while the box is wider than the crop's aspect. In a taller box the scale is height-driven and the
 * leg ends sit at a fixed fraction of the box height, so the room below them is `H × (1 − fraction)`. For the
 * current hero crops the fraction is at most 0.72 (6359), which leaves well over 5rem at any real box height;
 * a hook near a crop's bottom edge would need its own check.
 */
export function slingClearance(geometry: SlingGeometry, rect: Rect, below: string): string {
  return `calc(${round(geometry.legEnds[0].y - rect.top)} * 100vw / ${rect.width} + ${below})`;
}

/**
 * The tallest full-width photo box that keeps the pin and both legs `margin` inside the side edges. In a box
 * taller than the crop's aspect the scale is height-driven (H / rect.height) and the image is wider than the box,
 * centred, so the outer leg end sits (|dx| + spread) × H / rect.height from the centre. Hence
 * H ≤ (50vw − margin) × rect.height / (|dx| + spread); the factor is floored so the cap errs on the safe side.
 * For the current hero crops this cap is above both the width-driven threshold and slingClearance at every
 * md width (tested), so it only ever trims boxes on tall portrait tablets.
 */
export function slingMaxHeight(geometry: SlingGeometry, rect: Rect, margin: string): string {
  const { pin, legEnds } = geometry;
  const reach = Math.abs(pin.x - (rect.left + rect.width / 2)) + (legEnds[1].x - pin.x);
  const factor = Math.floor((rect.height / reach) * 1000) / 1000;
  return `calc((50vw - ${margin}) * ${factor})`;
}

/** '' = show at all widths; 'hidden md:block' = desktop crop only; 'md:hidden' = mobile crop only; null = never. */
export function cropVisibility(desktop: boolean, mobile: boolean): string | null {
  if (desktop && mobile) return '';
  if (desktop) return 'hidden md:block';
  if (mobile) return 'md:hidden';
  return null;
}

/** The two sling legs and the hook pin, drawn in the crop's own source-pixel space (C9). */
export function SlingSvg({ geometry, className = '' }: { geometry: SlingGeometry; className?: string }) {
  const { viewBox, pin, legEnds, pinRadius } = geometry;
  return (
    <svg
      data-sling=""
      viewBox={viewBox}
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {legEnds.map((end, i) => (
        <path
          key={i}
          data-sling-leg=""
          d={`M${pin.x} ${pin.y}L${end.x} ${end.y}`}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-red"
        />
      ))}
      <circle data-hook-pin="" cx={pin.x} cy={pin.y} r={pinRadius} className="fill-red" />
    </svg>
  );
}

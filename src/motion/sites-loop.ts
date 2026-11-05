/** Pure maths of the On site drift loop (src/motion/sites.ts). Phase p is how far the strip has moved, in px, in the reading direction. */
export const LOOP = {
  /** Seconds for one pass over every card: the speed is a fixed share of the card pitch, so a filtered strip moves as fast. */
  seconds: 40,
  /** Cards in a full pass (the "All" strip); used only to turn `seconds` into px per second. */
  cards: 12,
  /** Easing time constants (s): picking the speed back up, slowing to a stop, momentum after a drag. */
  resume: 0.7,
  stop: 0.35,
  fling: 0.9,
  /** A press that travels less than this (px) is a click, not a drag. */
  slop: 6,
  maxFling: 3200,
  maxSkew: 2.2,
} as const;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Keeps the phase inside [0, period): one period is exactly one pass, and the copies are identical, so the wrap is invisible. */
export function wrapPhase(p: number, period: number): number {
  return period > 0 ? ((p % period) + period) % period : 0;
}

/** Frame-rate independent ease of v towards target (time constant tau, seconds). */
export function easeToward(v: number, target: number, dt: number, tau: number): number {
  return v + (target - v) * (1 - Math.exp(-dt / tau));
}

/** Whole sets of cards the track needs: one before the originals, the originals, and enough after to fill the width at the widest phase. */
export function copiesNeeded(width: number, period: number): number {
  return period > 0 ? Math.max(3, 2 + Math.ceil(width / period)) : 3;
}

/** A gentle lean (degrees) while the strip speeds up or slows down: zero at the cruising speed. */
export function skewFor(v: number, target: number): number {
  return clamp((v - target) / 1200, -1, 1) * LOOP.maxSkew;
}

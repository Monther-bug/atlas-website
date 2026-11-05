/**
 * The crane lineup tells the motion layer when its layout is about to change and when React has committed it, so
 * src/motion/lineup.ts can Flip the cards from where they were to where they are. Nothing listens under reduced
 * motion (the core chunk is never loaded), so the cards simply jump.
 */
export const LINEUP_EVENT = 'atlas:lineup';

export type LineupPhase = 'before' | 'after' | 'mount';

export function announceLineup(phase: LineupPhase): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<LineupPhase>(LINEUP_EVENT, { detail: phase }));
}

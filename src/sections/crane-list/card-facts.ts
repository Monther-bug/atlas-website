import type { Copy, Crane, CraneId, Lang } from '@/content/types';
import { formatNumber } from '@/lib/numbers';

/**
 * The few manufacturer figures a lineup card shows, copied from crane-specs.ts so the initial bundle does not carry
 * the whole spec file (it loads with the sheet and the comparison). card-facts.test.ts fails if a value drifts from
 * crane-specs.ts. `secondary` lists figures taken from a spec database; `radiusM` is the radius of the maximum rating,
 * given only where the spec's rating is the one the card shows.
 */
export interface CardFacts {
  boomMaxM: number;
  jibMaxM: number;
  counterweightT: number;
  secondary: readonly KeySpecId[];
  radiusM?: number;
}

export type KeySpecId = 'boomMax' | 'jib' | 'counterweight';

export const CARD_FACTS: Partial<Record<CraneId, CardFacts>> = {
  rt700e: { boomMaxM: 33.5, jibMaxM: 17.1, counterweightT: 5.553, secondary: [] },
  'atf60-3': { boomMaxM: 40.2, jibMaxM: 16, counterweightT: 13.2, secondary: [], radiusM: 2.5 },
  'ac200-1': { boomMaxM: 68, jibMaxM: 33, counterweightT: 69, secondary: [] },
  quy250: { boomMaxM: 72.2, jibMaxM: 36, counterweightT: 88.5, secondary: ['jib', 'counterweight'] },
  gmk6350: { boomMaxM: 60, jibMaxM: 61, counterweightT: 100, secondary: [], radiusM: 2.44 },
};

export interface KeySpec {
  id: KeySpecId;
  label: string;
  text: string;
  secondary: boolean;
}

const NBSP = ' ';

/** The three key specs on a card. All five models have them, so the cards line up row for row. */
export function keySpecs(crane: Crane, copy: Copy, lang: Lang): KeySpec[] {
  const f = CARD_FACTS[crane.id];
  if (!f) return [];
  const n = (v: number) => formatNumber(v, lang, { maximumFractionDigits: 3 });
  const { units, fields } = copy.specs;
  return [
    { id: 'boomMax', label: copy.grid.card.boomMax, text: `${n(f.boomMaxM)}${NBSP}${units.m}`, secondary: f.secondary.includes('boomMax') },
    { id: 'jib', label: fields.jib, text: `${n(f.jibMaxM)}${NBSP}${units.m}`, secondary: f.secondary.includes('jib') },
    { id: 'counterweight', label: fields.counterweight, text: `${n(f.counterweightT)}${NBSP}${units.t}`, secondary: f.secondary.includes('counterweight') },
  ];
}

export function ratingRadius(crane: Crane): number | undefined {
  return CARD_FACTS[crane.id]?.radiusM;
}

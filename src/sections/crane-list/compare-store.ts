import { useSyncExternalStore } from 'react';
import type { Crane, CraneId } from '@/content/types';

/**
 * Which models are in the comparison. Shared by the comparison island and the detail sheet ("Compare with other
 * models"); both are lazy chunks, so this never ships in the initial bundle. null = the default pick. The array is the
 * column order: the comparison shows COMPARE_MAX columns (two on phones) and tops a shorter pick up (compareSlots).
 */
export const COMPARE_MAX = 3;

/** Smallest, middle and largest: the range in three columns. */
export function defaultCompare(cranes: readonly Crane[]): CraneId[] {
  if (cranes.length <= COMPARE_MAX) return cranes.map((c) => c.id);
  const mid = Math.floor((cranes.length - 1) / 2);
  return [cranes[0], cranes[mid], cranes[cranes.length - 1]].filter((c): c is Crane => c !== undefined).map((c) => c.id);
}

/** Toggle one model. Keeps at least one and at most COMPARE_MAX; a refused change returns the same array. */
export function toggleCompare(selected: readonly CraneId[], id: CraneId): readonly CraneId[] {
  if (selected.includes(id)) return selected.length > 1 ? selected.filter((x) => x !== id) : selected;
  return selected.length < COMPARE_MAX ? [...selected, id] : selected;
}

/** Add one model from the sheet: when the table is full, the oldest pick makes room. */
export function addToCompare(selected: readonly CraneId[], id: CraneId): readonly CraneId[] {
  if (selected.includes(id)) return selected;
  return selected.length < COMPARE_MAX ? [...selected, id] : [...selected.slice(1), id];
}

/**
 * The models in the columns, in order: the pick (unknown or repeated ids dropped), topped up to COMPARE_MAX (or every
 * model, when there are fewer) from the default range, then the rest. Every column always holds a different model.
 */
export function compareSlots(selected: readonly CraneId[] | null, cranes: readonly Crane[]): CraneId[] {
  const known = new Set(cranes.map((c) => c.id));
  const size = Math.min(COMPARE_MAX, known.size);
  const out: CraneId[] = [];
  for (const id of [...(selected ?? []), ...defaultCompare(cranes), ...cranes.map((c) => c.id)]) {
    if (out.length === size) break;
    if (known.has(id) && !out.includes(id)) out.push(id);
  }
  return out;
}

/**
 * The model in column `slot` becomes `id`. A model already in another column trades places with it, so the columns
 * stay distinct and nothing the visitor chose disappears. An unknown slot returns the same array.
 */
export function swapCompare(slots: readonly CraneId[], slot: number, id: CraneId): readonly CraneId[] {
  const old = slots[slot];
  if (old === undefined || old === id) return slots;
  const from = slots.indexOf(id);
  return slots.map((x, i) => (i === slot ? id : i === from ? old : x));
}

let picked: readonly CraneId[] | null = null;
const listeners = new Set<() => void>();

export const compareStore = {
  get: (): readonly CraneId[] | null => picked,
  set(next: readonly CraneId[] | null): void {
    if (next === picked) return;
    picked = next;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** The current pick for `cranes` (the default until the visitor changes it). */
export function useCompare(cranes: readonly Crane[]): readonly CraneId[] {
  const value = useSyncExternalStore(compareStore.subscribe, compareStore.get, () => null);
  return value ?? defaultCompare(cranes);
}

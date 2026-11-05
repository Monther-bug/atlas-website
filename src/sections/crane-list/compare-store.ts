import { useSyncExternalStore } from 'react';
import type { Crane, CraneId } from '@/content/types';

/**
 * Which models are in the comparison. Shared by the comparison island and the detail sheet ("Compare with other
 * models"); both are lazy chunks, so this never ships in the initial bundle. null = the default pick.
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

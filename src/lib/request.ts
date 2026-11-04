import { useSyncExternalStore } from 'react';
import type { CraneId } from '@/content/types';

export const HOOK_EVENT = 'atlas:hook';

export interface HookEventDetail {
  craneId: CraneId | null;
  source: HTMLElement | null;
}

let current: CraneId | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRequestedCrane(): CraneId | null {
  return current;
}

/** Puts a crane on the hook (or clears it), then tells the motion layer via HOOK_EVENT. */
export function setRequestedCrane(id: CraneId | null, source: HTMLElement | null = null): void {
  current = id;
  listeners.forEach((listener) => listener());
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<HookEventDetail>(HOOK_EVENT, { detail: { craneId: id, source } }));
  }
}

/** The crane on the hook. Always null while prerendering. */
export function useRequestedCrane(): CraneId | null {
  return useSyncExternalStore(subscribe, getRequestedCrane, () => null);
}

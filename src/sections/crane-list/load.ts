import { useSyncExternalStore } from 'react';
import type { Crane, CraneListCopy, Lang } from '@/content/types';
import { parseDecimal } from '@/lib/digits';
import { formatNumber, formatTonnes } from '@/lib/numbers';
import { fillTemplate } from '@/lib/whatsapp';

/**
 * The load typed into the load check. The check itself is a lazy island; the cards (main bundle) read the same
 * store to show "rated for … or more" / "below …". Empty while prerendering.
 */
export type Load = { state: 'empty' } | { state: 'invalid' } | { state: 'ok'; tonnes: number };

/** Upper bound on what a visitor may type: far above any crane, so it only rejects typos like 25000. */
export const MAX_LOAD_T = 5000;

/** Parses the load field in any digit system (Arabic-Indic and Persian digits, '٫' decimal). */
export function parseLoad(input: string): Load {
  if (input.trim() === '') return { state: 'empty' };
  const n = parseDecimal(input);
  if (n === null || n <= 0 || n > MAX_LOAD_T) return { state: 'invalid' };
  return { state: 'ok', tonnes: n };
}

/** The honest test: the crane's maximum rating (at its shortest radius) is at least the load. Never a promise. */
export function ratedFor(crane: Crane, tonnes: number): boolean {
  return crane.capacityT >= tonnes;
}

/** "3 models have a maximum rating of 120 t or more." Arabic plural forms as in resultCount (n < 100). */
export function loadResult(n: number, tonnes: number, text: CraneListCopy, lang: Lang): string {
  const { none, one, two, few, many } = text.load.result;
  const template = n === 0 ? none : n === 1 ? one : n === 2 ? two : n <= 10 ? few : many;
  return fillTemplate(template, { n: formatNumber(n, lang), load: formatTonnes(tonnes, lang) });
}

let text = '';
const listeners = new Set<() => void>();

export const loadStore = {
  get: (): string => text,
  set(next: string): void {
    if (next === text) return;
    text = next;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useLoadText(): string {
  return useSyncExternalStore(loadStore.subscribe, loadStore.get, () => '');
}

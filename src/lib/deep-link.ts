import { useEffect } from 'react';
import { isCranePage } from '@/content/crane-pages';
import type { CraneId } from '@/content/types';
import { setRequestedCrane } from './request';

/**
 * Deep links into the home page from a crane page (/cranes/<id>/):
 *   /?crane=<id>#request         "Use the request form": the crane is put on the hook, so the request bar shows it and
 *                                the form's crane field is pre-selected (RequestForm follows the request store).
 *   /?compare=<id>#crane-compare "Compare": the comparison opens with this crane picked (the lineup island reads it
 *                                with takeCompare() when it mounts).
 * The browser scrolls to the hash itself. Unknown or hidden ids are ignored. The query is read once, then removed
 * from the address bar (history.replaceState keeps the hash), so a reload or a shared link stays clean.
 */
export interface DeepLink {
  crane: CraneId | null;
  compare: CraneId | null;
}

let parsed: DeepLink | null = null;

/** Pure: the deep link in a query string ('?crane=gmk6350'). */
export function parseDeepLink(search: string): DeepLink {
  const q = new URLSearchParams(search);
  const pick = (key: string) => {
    const id = q.get(key);
    return isCranePage(id) ? id : null;
  };
  return { crane: pick('crane'), compare: pick('compare') };
}

/** The page's deep link, read from the URL the first time it is asked for (before the query is removed). */
export function deepLink(): DeepLink {
  if (!parsed) parsed = typeof window === 'undefined' ? { crane: null, compare: null } : parseDeepLink(window.location.search);
  return parsed;
}

/** The crane to add to the comparison, once: the next call returns null. */
export function takeCompare(): CraneId | null {
  const link = deepLink();
  const id = link.compare;
  parsed = { ...link, compare: null };
  return id;
}

/** Home page: applies ?crane= after hydration (the prerendered HTML never depends on the query) and tidies the URL. */
export function useDeepLink(): void {
  useEffect(() => {
    const link = deepLink();
    if (link.crane) setRequestedCrane(link.crane, null);
    const url = new URL(window.location.href);
    if (url.searchParams.has('crane') || url.searchParams.has('compare')) {
      url.searchParams.delete('crane');
      url.searchParams.delete('compare');
      history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);
}

/** For tests: forget the parsed link. */
export function resetDeepLink(): void {
  parsed = null;
}

import { visibleCranes } from './index';
import type { Crane, CraneId, Lang } from './types';

/**
 * The crane pages (/cranes/<id>/ in Arabic, /en/cranes/<id>/ in English): one per visible crane, in the lineup order
 * (smallest to largest). A hidden crane (CKE2500) never gets a page. Small on purpose: the home page's lineup imports
 * it for its links.
 */
export const CRANE_PAGES: readonly Crane[] = visibleCranes;

export function isCranePage(id: string | null | undefined): id is CraneId {
  return CRANE_PAGES.some((c) => c.id === id);
}

/** '/cranes/gmk6350/' or '/en/cranes/gmk6350/'. */
export function cranePath(id: CraneId, lang: Lang): string {
  return `${lang === 'en' ? '/en' : ''}/cranes/${id}/`;
}

/** The crane a path is about ('/en/cranes/gmk6350/' → 'gmk6350'), or null when it is not a crane page. */
export function craneIdFromPath(pathname: string): CraneId | null {
  const id = /^(?:\/en)?\/cranes\/([a-z0-9-]+)\/?(?:index\.html)?$/.exec(pathname)?.[1] ?? null;
  return isCranePage(id) ? id : null;
}

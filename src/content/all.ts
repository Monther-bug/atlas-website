import { ar } from './ar';
import { en } from './en';
import type { Copy, Lang } from './types';

/**
 * Both languages at once. For the server entry (prerender) and tests only: client code must never import this, or
 * every page would ship both decks. The browser entries import `./ar` or `./en` directly (src/main-ar.tsx, main-en.tsx).
 */
const COPY: Record<Lang, Copy> = { ar, en };

export function getCopy(lang: Lang): Copy {
  return COPY[lang];
}

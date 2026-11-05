import type { CraneId } from '@/content/types';

/** "Use the request form": the home page's form with this crane on the hook (src/lib/deep-link.ts reads it). */
export const formHref = (home: string, id: CraneId) => `${home}?crane=${id}#request`;

/** "Compare": the home page's comparison with this crane picked. */
export const compareHref = (home: string, id: CraneId) => `${home}?compare=${id}#crane-compare`;

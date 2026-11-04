import type { CSSProperties } from 'react';

/** The red/white chevron motif (spec §6) as a class from styles.css. Prefer it to the inline style below. */
export const CHEVRON_CLASS = 'chevron-stripes';

/** The red/white chevron motif (spec §6): only on draft badges, loading states and the footer pad. */
export const CHEVRON_STRIPES: CSSProperties = {
  backgroundImage: 'repeating-linear-gradient(135deg, var(--color-red) 0 4px, var(--color-white) 4px 8px)',
};

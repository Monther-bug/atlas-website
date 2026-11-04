import { ar } from './ar';
import { cranes } from './cranes';
import { en } from './en';
import type { Copy, Crane, Lang } from './types';

export { cranes } from './cranes';
export { siteInfo } from './site';
export { sites } from './sites';
export type {
  CapacityBand,
  Copy,
  Crane,
  CraneId,
  CraneType,
  CraneTypeCopy,
  DocumentFile,
  DocumentSlot,
  DurationId,
  FieldCopy,
  Lang,
  ServiceCopy,
  ServiceId,
  SiteGallery,
  SiteGalleryId,
  SiteInfo,
} from './types';

const COPY: Record<Lang, Copy> = { ar, en };

export function getCopy(lang: Lang): Copy {
  return COPY[lang];
}

/** Cranes that may be rendered, smallest capacity first (the Hoist order). */
export const visibleCranes: readonly Crane[] = cranes.filter((c) => !c.hidden).sort((a, b) => a.capacityT - b.capacityT);

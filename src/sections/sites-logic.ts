import { sites } from '@/content';
import type { GalleryPhotoId, SiteGalleryId } from '@/content/types';

/** The site picker's value: every photo, or one shoot site. */
export type SiteFilter = 'all' | SiteGalleryId;
export const SITE_FILTERS: readonly SiteFilter[] = ['all', ...sites.map((g) => g.id)];

export interface SitePhoto {
  photo: GalleryPhotoId;
  site: SiteGalleryId;
}

/** Every gallery photo in deck order (building site first), each tagged with its site. */
export const ALL_SITE_PHOTOS: readonly SitePhoto[] = sites.flatMap((g) => g.photos.map((photo) => ({ photo, site: g.id })));

export function photosFor(filter: SiteFilter): readonly SitePhoto[] {
  return filter === 'all' ? ALL_SITE_PHOTOS : ALL_SITE_PHOTOS.filter((p) => p.site === filter);
}

/** Deck captions read "Site · detail". The cards and the lightbox set the two parts as label and text. */
export function splitCaption(caption: string): { site: string; detail: string } {
  const at = caption.indexOf(' · ');
  return at === -1 ? { site: '', detail: caption } : { site: caption.slice(0, at), detail: caption.slice(at + 3) };
}

import type { SiteGallery } from './types';

/** Spec §4.2. Kobelco photos 6367, 6370 and 6371 are excluded. */
export const sites: readonly SiteGallery[] = [
  { id: 'construction', photos: ['6374', '6376', '6379', '6380', '6382', '6388', '6393'] },
  { id: 'coast', photos: ['6360', '6364', '6396', '6397', '6398'] },
];

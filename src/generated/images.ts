// STUB until Task A2.3: scripts/build-assets.mjs overwrites this file with the real manifest.
// It exists so Part B's `import type { PhotoId } from '@/generated/images'` type-checks.
export type PhotoId = '6359'|'6360'|'6363'|'6364'|'6374'|'6375'|'6376'|'6379'|'6380'|'6382'|'6385'|'6388'|'6389'|'6392'|'6393'|'6395'|'6396'|'6397'|'6398';
export type CropName = 'desktop_16x9' | 'mobile_4x5' | 'mobile_9x16';
export interface ImageSource { url: string; width: number }
export interface CropImage {
  photo: PhotoId; crop: CropName;
  rect: { left: number; top: number; width: number; height: number }; // in source pixels
  avif: ImageSource[]; webp: ImageSource[];                          // ascending width
  placeholder: string;                                              // data:image/webp;base64 (24 px wide)
  hook: { x: number; y: number } | null;                            // source-pixel hook point, if any
}

export const images: Partial<Record<`${PhotoId}:${CropName}`, CropImage>> = {};

export function getImage(photo: PhotoId, crop: CropName): CropImage {
  const image = images[`${photo}:${crop}`];
  if (!image) throw new Error(`No image ${photo}:${crop}. Run npm run assets (Task A2.3).`);
  return image;
}

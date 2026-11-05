import type { JSX } from 'react';
import { placeholders } from '@/generated/placeholders';
import { getImage, type CropName, type ImageSource, type PhotoId } from '@/generated/images';

export interface PictureProps {
  photo: PhotoId;
  crop: CropName;                 // used ≥ 768px (or always, when mobileCrop is absent)
  mobileCrop?: CropName;          // used < 768px (or where `mobileMedia` matches)
  /** When the mobile crop applies; default `(max-width: 767.98px)`. The hero uses portrait (aspect < 1) instead. */
  mobileMedia?: string;
  /** Alternative text; an empty string marks the image as decorative. */
  alt: string;
  sizes: string;
  priority?: boolean;             // fetchpriority="high", loading="eager"
  className?: string;             // applied to <img>
  pictureClassName?: string;      // applied to <picture>
}

const MOBILE = '(max-width: 767.98px)';
const srcSet = (list: ImageSource[]) => list.map((s) => `${s.url} ${s.width}w`).join(', ');

/** Art-directed, responsive photo from the generated manifest (scripts/build-assets.mjs). */
export function Picture({ photo, crop, mobileCrop, mobileMedia = MOBILE, alt, sizes, priority = false, className, pictureClassName }: PictureProps): JSX.Element {
  const main = getImage(photo, crop);
  const mobile = mobileCrop ? getImage(photo, mobileCrop) : null;
  // The <img> fallback: the WebP whose width is closest to 1280 px (ties go to the larger).
  const fallback = main.webp.reduce((best, s) => {
    const d = Math.abs(s.width - 1280);
    const bd = Math.abs(best.width - 1280);
    return d < bd || (d === bd && s.width > best.width) ? s : best;
  });
  // Blur placeholder: prerendered HTML only. The client renders none, and suppressHydrationWarning
  // below keeps the server's inline style (React does not patch attribute mismatches on hydration).
  const ph = import.meta.env.SSR ? placeholders[`${photo}:${crop}`] : undefined;
  return (
    <picture className={pictureClassName}>
      {mobile && (
        <>
          <source media={mobileMedia} type="image/avif" srcSet={srcSet(mobile.avif)} sizes={sizes} width={mobile.rect.width} height={mobile.rect.height} />
          <source media={mobileMedia} type="image/webp" srcSet={srcSet(mobile.webp)} sizes={sizes} width={mobile.rect.width} height={mobile.rect.height} />
        </>
      )}
      <source type="image/avif" srcSet={srcSet(main.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(main.webp)} sizes={sizes} />
      <img
        src={fallback.url}
        alt={alt}
        width={main.rect.width}
        height={main.rect.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? undefined : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        className={className}
        suppressHydrationWarning
        style={{
          ...(ph ? { backgroundImage: `url(${ph})`, backgroundSize: 'cover', backgroundPosition: '50% 0' } : null),
          objectFit: 'cover',
          objectPosition: '50% 0',
        }}
      />
    </picture>
  );
}

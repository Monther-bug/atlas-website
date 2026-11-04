import { useEffect, useRef, type KeyboardEvent } from 'react';
import { ArrowIcon, CloseIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import type { GalleryPhotoId } from '@/content/types';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';
import { fillTemplate } from '@/lib/whatsapp';

/** +1 = next. In RTL the next photo is to the left, so ArrowLeft moves forward. */
export function stepFor(key: string, dir: 'rtl' | 'ltr'): -1 | 0 | 1 {
  if (key === 'ArrowRight') return dir === 'rtl' ? -1 : 1;
  if (key === 'ArrowLeft') return dir === 'rtl' ? 1 : -1;
  return 0;
}

export function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

export interface LightboxProps {
  photos: readonly GalleryPhotoId[];
  index: number | null; // null = closed
  title: string; // the gallery's name, used as the dialog label
  onIndexChange: (index: number) => void;
  onClose: () => void; // fires on Esc, the close button and close()
}

/** Native modal <dialog>: Esc closes it and the browser returns focus to the opener. */
export function Lightbox({ photos, index, title, onIndexChange, onClose }: LightboxProps) {
  const { copy, dir, lang } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const isOpen = index !== null && photos.length > 0;

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (isOpen && !el.open) el.showModal();
    if (!isOpen && el.open) el.close();
  }, [isOpen]);

  const photo = index === null ? undefined : photos[index];
  const go = (delta: number) => {
    if (index !== null) onIndexChange(wrapIndex(index + delta, photos.length));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    const step = stepFor(event.key, dir);
    if (step !== 0) {
      event.preventDefault();
      go(step);
    }
  };

  return (
    <dialog
      ref={dialog}
      data-testid="lightbox"
      aria-label={title}
      onClose={onClose}
      onKeyDown={onKeyDown}
      data-lenis-prevent=""
      className="m-0 h-dvh max-h-none w-full max-w-none overscroll-contain bg-navy-950 p-0 text-white backdrop:bg-navy-950"
    >
      {photo !== undefined && index !== null && (
        <div className="flex h-full flex-col">
          <div className="shell flex h-[4.5rem] w-full shrink-0 items-center justify-between gap-4">
            <p className="t-small tabular-nums text-steel" aria-live="polite">
              {fillTemplate(copy.sites.counter, { i: formatNumber(index + 1, lang), n: formatNumber(photos.length, lang) })}
              <span className="sr-only">{` \u2014 ${copy.sites.captions[photo]}`}</span>
            </p>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="inline-flex size-11 items-center justify-center transition-colors hover:bg-white/10"
            >
              <CloseIcon className="size-6" />
              <span className="sr-only">{copy.sites.close}</span>
            </button>
          </div>
          <figure className="flex min-h-0 flex-1 flex-col">
            <Picture
              key={photo}
              photo={photo}
              crop="desktop_16x9"
              alt={copy.alt[photo]}
              sizes="100vw"
              pictureClassName="block min-h-0 flex-1"
              className="h-full w-full object-contain! object-center!"
            />
            <figcaption className="shell t-small w-full py-4 text-steel">{copy.sites.captions[photo]}</figcaption>
          </figure>
          <div className="shell flex w-full shrink-0 items-center justify-between gap-4 pb-6">
            <button
              type="button"
              onClick={() => go(-1)}
              className="inline-flex min-h-11 items-center gap-2 px-3 font-semibold transition-colors hover:bg-white/10"
            >
              <ArrowIcon direction="back" className="size-5" />
              {copy.sites.prev}
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="inline-flex min-h-11 items-center gap-2 px-3 font-semibold transition-colors hover:bg-white/10"
            >
              {copy.sites.next}
              <ArrowIcon className="size-5" />
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

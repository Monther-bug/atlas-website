import { useCallback, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { ArrowIcon, CloseIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import { IconButton } from '@/components/ui';
import { useIsoLayoutEffect } from '@/components/ui/util';
import type { GalleryPhotoId } from '@/content/types';
import { getImage } from '@/generated/images';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';
import { fillTemplate } from '@/lib/whatsapp';
import { splitCaption } from '@/sections/sites-logic';
import { cropWithin, flipFrom, swipeStep, type Box } from './lightbox-math';
import './lightbox.css';

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
  /** Fires once the dialog has closed (Esc, the close button, a click beside the photo, dialog.close()). */
  onClose: () => void;
  /** The thumbnail frame of a photo in the gallery: the photo opens from it, returns to it, and focus goes back to its button. */
  originFor?: (photo: GalleryPhotoId) => HTMLElement | null;
}

const MOBILE = '(max-width: 767.98px)';
const EASE_SET = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_SWAP = 'cubic-bezier(0.65, 0, 0.35, 1)';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

function box(el: Element): Box {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

function onScreen(b: Box): boolean {
  return b.width > 0 && b.height > 0 && b.left < window.innerWidth && b.left + b.width > 0 && b.top < window.innerHeight && b.top + b.height > 0;
}

/** Scrolls the gallery strip (only the strip, never the page) until the thumbnail is fully in view. */
function revealInStrip(thumb: HTMLElement): void {
  const track = thumb.closest<HTMLElement>('ul');
  const item = thumb.closest('li');
  if (!track || !item) return;
  const t = track.getBoundingClientRect();
  const r = item.getBoundingClientRect();
  const pad = parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
  const delta = r.left < t.left + pad ? r.left - t.left - pad : r.right > t.right - pad ? r.right - t.right + pad : 0;
  if (delta !== 0) track.scrollBy({ left: delta, behavior: 'instant' });
}

/** The FLIP start state from a thumbnail (always the 4:5 crop) to the frame (16:9, or 4:5 on phones). */
function flipState(photo: GalleryPhotoId, thumb: HTMLElement, frame: HTMLElement) {
  const f = box(frame);
  const view = getImage(photo, window.matchMedia?.(MOBILE).matches ? 'mobile_4x5' : 'desktop_16x9').rect;
  const sub = cropWithin(getImage(photo, 'mobile_4x5').rect, view, f.width, f.height);
  const radius = parseFloat(getComputedStyle(thumb).borderTopLeftRadius) || 0;
  return flipFrom(box(thumb), f, sub, radius);
}

/**
 * Photo viewer on a native modal <dialog> (v2), loaded on first open (Sites.tsx). A black stage, the photo in a
 * rounded frame sized to its aspect, the caption on a solid navy plate under the photo (never over the sky). Esc,
 * the focus trap and the inert page come from the platform. The photo grows out of its thumbnail and returns to it
 * (FLIP, Web Animations API), swipes and arrow keys follow the reading direction, a polite live region says
 * "n of m — caption", and focus returns to the thumbnail of the photo on screen when it closes.
 */
export function Lightbox({ photos, index, title, onIndexChange, onClose, originFor }: LightboxProps) {
  const { copy, dir, lang } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const isOpen = index !== null && photos.length > 0;
  const photo = index === null ? undefined : photos[index];
  const shown = useRef<GalleryPhotoId | undefined>(undefined); // the photo on screen when the dialog closes
  shown.current = photo;
  const closing = useRef(false);
  const lastStep = useRef<-1 | 0 | 1>(0);
  const drag = useRef<{ id: number; x: number; dx: number; onStage: boolean } | null>(null);

  // Open (then grow the photo out of its thumbnail once it has decoded, 320 ms at most) and close.
  useIsoLayoutEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (!isOpen) {
      if (el.open) el.close();
      return;
    }
    // Development StrictMode runs this twice; the second run must still play the flight.
    if (!el.open) {
      closing.current = false;
      delete el.dataset.closing;
      el.showModal();
    }
    const f = frame.current;
    const thumb = photo ? originFor?.(photo) : null;
    if (!f || !photo || !thumb || reducedMotion() || !onScreen(box(thumb))) return;
    f.style.opacity = '0';
    const img = f.querySelector('img');
    const decoded = img?.decode ? img.decode().catch(() => undefined) : Promise.resolve();
    let cancelled = false;
    void Promise.race([decoded, new Promise((r) => setTimeout(r, 320))]).then(() => {
      if (cancelled || !f.isConnected) return;
      f.style.opacity = '';
      const { transform, clipPath } = flipState(photo, thumb, f);
      const end = getComputedStyle(f).borderTopLeftRadius;
      f.animate([{ transform, clipPath }, { transform: 'none', clipPath: `inset(0px round ${end})` }], { duration: 560, easing: EASE_SET });
    });
    return () => {
      cancelled = true;
      f.style.opacity = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // A new photo slides in from the side it was asked for (previous/next, keys, swipe).
  useIsoLayoutEffect(() => {
    const f = frame.current;
    const step = lastStep.current;
    lastStep.current = 0;
    if (!f || step === 0 || reducedMotion()) return;
    const from = step * (dir === 'rtl' ? -1 : 1) * 12;
    f.animate([{ transform: `translateX(${from}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: EASE_SET });
  }, [photo]);

  const go = (step: -1 | 1) => {
    if (index === null || photos.length < 2) return;
    lastStep.current = step;
    onIndexChange(wrapIndex(index + step, photos.length));
  };

  /** Close with the reverse flight to the thumbnail (scrolled into view first), or a short fade. */
  const requestClose = useCallback(() => {
    const el = dialog.current;
    if (!el?.open || closing.current) return;
    closing.current = true;
    el.dataset.closing = '';
    const f = frame.current;
    const finish = () => el.open && el.close();
    if (!f || !photo || reducedMotion()) return finish();
    const thumb = originFor?.(photo);
    if (thumb) revealInStrip(thumb);
    const back = thumb && onScreen(box(thumb)) ? flipState(photo, thumb, f) : null;
    const end = getComputedStyle(f).borderTopLeftRadius;
    const anim = back
      ? f.animate([{ transform: 'none', clipPath: `inset(0px round ${end})` }, back], { duration: 420, easing: EASE_SWAP, fill: 'forwards' })
      : f.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(0.96)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
    anim.onfinish = finish;
    anim.oncancel = finish;
  }, [photo, originFor]);

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    const step = stepFor(event.key, dir);
    if (step !== 0) {
      event.preventDefault();
      go(step);
    } else if ((event.key === 'Home' || event.key === 'End') && index !== null) {
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : photos.length - 1;
      if (target !== index) {
        lastStep.current = target > index ? 1 : -1;
        onIndexChange(target);
      }
    }
  };

  // Swipe (touch, pen or a mouse drag) on the stage; a plain click beside the photo closes.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || closing.current) return;
    drag.current = { id: event.pointerId, x: event.clientX, dx: 0, onStage: event.target === event.currentTarget };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const f = frame.current;
    if (!d || d.id !== event.pointerId || !f) return;
    d.dx = event.clientX - d.x;
    if (Math.abs(d.dx) > 4 && photos.length > 1) {
      f.style.transform = `translateX(${d.dx}px)`;
      f.style.opacity = String(Math.max(0.4, 1 - Math.abs(d.dx) / 900));
    }
  };
  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const f = frame.current;
    if (!d || d.id !== event.pointerId) return;
    drag.current = null;
    const up = event.type === 'pointerup';
    const step = photos.length > 1 && up ? swipeStep(d.dx, dir) : 0;
    if (f) {
      const moved = f.style.transform;
      f.style.transform = '';
      f.style.opacity = '';
      if (step === 0 && moved && !reducedMotion()) f.animate([{ transform: moved }, { transform: 'none' }], { duration: 260, easing: EASE_SET });
    }
    if (step !== 0) go(step);
    else if (up && d.onStage && Math.abs(d.dx) < 6) requestClose();
  };

  const caption = photo ? copy.sites.captions[photo] : '';
  const parts = splitCaption(caption);
  const counter =
    index === null ? '' : fillTemplate(copy.sites.counter, { i: formatNumber(index + 1, lang), n: formatNumber(photos.length, lang) });

  return (
    <dialog
      ref={dialog}
      data-testid="lightbox"
      aria-label={title}
      data-ground="dark"
      data-lenis-prevent=""
      onClose={() => {
        const el = dialog.current;
        if (el) delete el.dataset.closing;
        closing.current = false;
        const last = shown.current;
        onClose();
        // The platform returns focus to the opener; move it on to the thumbnail of the photo that was on screen.
        const thumb = last ? originFor?.(last) : null;
        thumb?.closest<HTMLElement>('button, a')?.focus({ preventScroll: true });
      }}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onKeyDown={onKeyDown}
      className="lb overscroll-contain"
    >
      <div className="lb__bar lb__chrome shell">
        <p className="t-small tabular-nums text-neutral-300" aria-live="polite">
          {counter}
          {photo ? <span className="sr-only">{` — ${caption}`}</span> : null}
        </p>
        <IconButton label={copy.sites.close} tone="dark" onClick={requestClose}>
          <CloseIcon className="size-5" />
        </IconButton>
      </div>

      <div className="lb__stage" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}>
        {photo !== undefined && (
          <>
            <div ref={frame} key={photo} className="lb__frame">
              <Picture
                photo={photo}
                crop="desktop_16x9"
                mobileCrop="mobile_4x5"
                alt={copy.alt[photo]}
                sizes="(max-width: 767.98px) 100vw, 82vw"
                priority
                pictureClassName="block size-full"
                className="size-full select-none"
              />
            </div>
            <div className="lb__side lb__chrome" data-side="start">
              <IconButton label={copy.sites.prev} tone="dark" onClick={() => go(-1)}>
                <ArrowIcon direction="back" className="size-5" />
              </IconButton>
            </div>
            <div className="lb__side lb__chrome" data-side="end">
              <IconButton label={copy.sites.next} tone="dark" onClick={() => go(1)}>
                <ArrowIcon className="size-5" />
              </IconButton>
            </div>
          </>
        )}
      </div>

      <div className="lb__foot lb__chrome shell">
        {photo !== undefined && (
          <p className="lb__plate">
            <span className="lb__site t-caption block">{parts.site}</span>
            <span className="t-body block text-white">{parts.detail}</span>
          </p>
        )}
      </div>
    </dialog>
  );
}

export default Lightbox;

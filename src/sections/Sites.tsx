import { useCallback, useRef, useState, type CSSProperties, type UIEvent } from 'react';
import { ArrowIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import { IconButton, Section, SectionHeader, fill } from '@/components/ui';
import { pageStep } from '@/components/ui/Carousel';
import type { GalleryPhotoId } from '@/content/types';
import { useLang } from '@/lib/lang';
import { SITE_FILTERS, photosFor, splitCaption, type SiteFilter } from './sites-logic';
import './sites.css';

type Viewer = typeof import('@/components/Lightbox').Lightbox;

/** The lightbox is a separate chunk: it loads when the visitor first reaches for a photo (pointer or focus). */
const loadViewer = () => import('@/components/Lightbox').then((m) => m.Lightbox);

/** First slide on the page grid, the track bleeding to the viewport edge on both sides (shell = 90rem + gutters). */
const INSET = 'max(clamp(1rem, 4vw, 3.5rem), calc((100% - 90rem) / 2 + clamp(1rem, 4vw, 3.5rem)))';
const TRACK_STYLE = {
  '--slide-w': 'var(--sites-slide)',
  '--carousel-inset': INSET,
} as CSSProperties;

/**
 * On site (v2 spec §10): every real photo from the two shoot sites in one full-bleed, scroll-snap carousel of
 * rounded 4:5 cards, captions on the card under the photo (never over the sky). A site picker (native radios in the
 * shared .ui-seg look; its navy fill glides to the pick) narrows it to one site; the switch remounts the strip and
 * the slides settle in (CSS). The strip is the shared carousel pattern (spec §8.9: .ui-carousel CSS, region + slide
 * groups, paddles that page by whole cards and turn aria-disabled at the ends), written inline because the strip
 * remounts per site and every byte of main JS counts. Arrow keys on the track, swipe on touch, mouse drag on desktop. A photo opens in the lazy-loaded Lightbox, which grows it
 * out of its card. Without JS the picker hides and all twelve photos stay in the strip.
 */
export function Sites() {
  const { copy, dir } = useLang();
  const s = copy.sites;
  const [filter, setFilter] = useState<SiteFilter>('all');
  const [switched, setSwitched] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [View, setView] = useState<Viewer | null>(null);
  const [edge, setEdge] = useState<'start' | 'mid' | 'end'>('start');
  const strip = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const photos = photosFor(filter);

  const preload = () => void loadViewer();
  const show = (index: number) => {
    if (View) return setOpen(index);
    void loadViewer().then((v) => {
      setView(() => v);
      setOpen(index);
    });
  };
  const originFor = useCallback(
    (photo: GalleryPhotoId) => strip.current?.querySelector<HTMLElement>(`[data-photo="${photo}"] [data-sites-thumb]`) ?? null,
    [],
  );

  /** The navy fill glides from the old pick to the new one (WAAPI on ::before; sizes measured now, so resizes are safe). */
  const choose = (next: SiteFilter, to: HTMLElement) => {
    const from = to.parentElement?.querySelector(`input[value="${filter}"]`)?.closest('label');
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (from && from !== to && !reduced && to.animate) {
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      to.animate(
        [
          {
            transform: `translateX(${a.left - b.left}px) scaleX(${a.width / b.width})`,
          },
          { transform: 'none' },
        ],
        {
          duration: 320,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          pseudoElement: '::before',
        },
      );
    }
    setFilter(next);
    setSwitched(true);
    setEdge('start');
  };

  const onScroll = (event: UIEvent<HTMLUListElement>) => {
    const t = event.currentTarget;
    const pos = Math.abs(t.scrollLeft); // negative in RTL
    setEdge(pos <= 2 ? 'start' : pos >= t.scrollWidth - t.clientWidth - 2 ? 'end' : 'mid');
  };
  /** Pages by whole cards in the reading direction; CSS smooth-scrolls unless motion is reduced. */
  const page = (step: 1 | -1) => {
    const t = track.current;
    const card = t?.firstElementChild as HTMLElement | null;
    if (!t || !card) return;
    const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
    t.scrollBy({
      left: step * pageStep(t.clientWidth, card.offsetWidth, gap) * (dir === 'rtl' ? -1 : 1),
    });
  };

  // Unique name for the strip (the section landmark is already "On site"): "On site · All", "On site · Coastal site".
  const label = `${s.title} · ${filter === 'all' ? s.all : s.galleries[filter]}`;
  const slides = photos.map(({ photo }, index) => {
    const { site, detail } = splitCaption(s.captions[photo]);
    return (
      // The <li> stays a list item (axe `list`); the slide group (APG carousel) sits inside it.
      <li key={photo}>
        <div
          role="group"
          aria-roledescription={copy.ui.slide}
          aria-label={fill(copy.ui.slideOf, { i: index + 1, n: photos.length })}
          className="h-full"
        >
          <button
            type="button"
            data-testid="site-photo"
            data-photo={photo}
            onClick={() => show(index)}
            className="sites-card ui-zoom group relative flex h-full w-full flex-col text-start"
          >
            <span data-sites-thumb="" className="sites-thumb">
              <Picture
                photo={photo}
                crop="mobile_4x5"
                alt=""
                sizes="(min-width: 1024px) 25rem, (min-width: 640px) 21rem, 78vw"
                pictureClassName="block size-full"
                className="size-full"
              />
            </span>
            <span className="sites-caption">
              <span className="t-caption t-accent block">{site}</span>
              <span className="sites-detail mt-1 block">{detail}</span>
            </span>
            <span className="sr-only"> {s.open}</span>
          </button>
        </div>
      </li>
    );
  });

  return (
    <Section id="sites" surface="mist" width="bleed" aria-labelledby="sites-title" className="overflow-x-clip">
      <div className="shell">
        <SectionHeader
          id="sites-title"
          title={s.title}
          lead={s.intro}
          actions={
            <div role="radiogroup" aria-label={s.filterLabel} className="ui-seg sites-filter">
              {SITE_FILTERS.map((value) => (
                <label key={value} className="ui-seg__option">
                  <input
                    type="radio"
                    name="sites-filter"
                    value={value}
                    checked={filter === value}
                    onChange={(event) => choose(value, event.currentTarget.parentElement as HTMLElement)}
                  />
                  {value === 'all' ? s.all : s.galleries[value]}
                </label>
              ))}
            </div>
          }
        />
      </div>
      <div
        ref={strip}
        data-sites-strip=""
        data-sites-drift=""
        role="region"
        aria-roledescription={copy.ui.carousel}
        aria-label={label}
        onPointerEnter={preload}
        onFocus={preload}
        className={`flex flex-col gap-4 ${switched ? 'sites-carousel is-switched' : 'sites-carousel'}`}
      >
        <ul
          key={filter}
          ref={track}
          id="sites-track"
          tabIndex={0}
          onScroll={onScroll}
          className="ui-carousel__track"
          style={TRACK_STYLE}
        >
          {slides}
        </ul>
        <div className="ui-carousel__controls" style={{ paddingInline: INSET }}>
          <IconButton
            label={copy.ui.prev}
            aria-controls="sites-track"
            aria-disabled={edge === 'start' || undefined}
            onClick={() => edge !== 'start' && page(-1)}
          >
            <ArrowIcon direction="back" className="size-5" />
          </IconButton>
          <IconButton
            label={copy.ui.next}
            aria-controls="sites-track"
            aria-disabled={edge === 'end' || undefined}
            onClick={() => edge !== 'end' && page(1)}
          >
            <ArrowIcon className="size-5" />
          </IconButton>
        </div>
      </div>
      {View ? (
        <View
          photos={photos.map((p) => p.photo)}
          index={open}
          title={label}
          onIndexChange={setOpen}
          onClose={() => setOpen(null)}
          originFor={originFor}
        />
      ) : (
        <dialog data-testid="lightbox" aria-label={label} className="lb" />
      )}
    </Section>
  );
}

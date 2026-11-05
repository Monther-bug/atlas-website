import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowIcon } from '@/components/Icons';
import { useLang } from '@/lib/lang';
import { IconButton } from './IconButton';
import { cx, fill, useReducedMotion } from './util';

export interface CarouselProps {
  /** Accessible name of the carousel region. */
  label: string;
  /** One node per slide. Keep slides free of autoplaying media. */
  slides: readonly ReactNode[];
  /** Width of one slide (any CSS length); default min(85%, 22rem). */
  slideWidth?: string;
  /** Start/end padding of the track, so the first slide lines up with the page shell while the track bleeds. */
  inset?: string;
  tone?: 'light' | 'dark';
  /** Where the paddles sit. `header` renders nothing here: pass <CarouselControls> to a SectionHeader instead. */
  controls?: 'below' | 'none';
  className?: string;
}

/** Scroll position along the reading direction: 0 at the start, growing toward the end, in LTR and RTL. */
export function readingOffset(scrollLeft: number): number {
  return Math.abs(scrollLeft);
}

/** Pixels to scroll for a "next"/"previous" press: whole slides that fit in the viewport, at least one. */
export function pageStep(viewport: number, slide: number, gap: number): number {
  const unit = slide + gap;
  if (unit <= 0) return viewport;
  return Math.max(1, Math.floor((viewport + gap) / unit)) * unit;
}

/**
 * Horizontal carousel on native scroll-snap (no autoplay, no JS needed to browse). Flows in the reading direction:
 * the first slide sits at the inline start in Arabic and English alike. Previous/next paddles page by whole slides;
 * the track itself is a focusable region, so arrow keys scroll it. Paddles become aria-disabled at the ends.
 */
export function Carousel({ label, slides, slideWidth, inset, tone = 'light', controls = 'below', className }: CarouselProps) {
  const { copy, dir } = useLang();
  const id = useId();
  const track = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const t = track.current;
    if (!t) return;
    const max = t.scrollWidth - t.clientWidth;
    const pos = readingOffset(t.scrollLeft);
    setEdges((prev) => {
      const next = { start: pos <= 2, end: pos >= max - 2 };
      return prev.start === next.start && prev.end === next.end ? prev : next;
    });
  }, []);

  useEffect(() => {
    const t = track.current;
    if (!t) return;
    update();
    t.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    ro?.observe(t);
    return () => {
      t.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, [update]);

  const go = (step: 1 | -1) => {
    const t = track.current;
    if (!t) return;
    const first = t.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
    const amount = pageStep(t.clientWidth, first?.offsetWidth ?? t.clientWidth, gap);
    // scrollLeft grows to the right in LTR and toward negative values in RTL.
    t.scrollBy({ left: step * amount * (dir === 'rtl' ? -1 : 1), behavior: reduced ? 'auto' : 'smooth' });
  };

  const style = {
    ...(slideWidth ? { '--slide-w': slideWidth } : {}),
    ...(inset ? { '--carousel-inset': inset } : {}),
  } as CSSProperties;

  return (
    <div role="region" aria-roledescription={copy.ui.carousel} aria-label={label} className={cx('flex min-w-0 flex-col gap-4', className)}>
      <ul ref={track} id={id} tabIndex={0} className="ui-carousel__track" style={style}>
        {slides.map((slide, i) => (
          <li key={i} role="group" aria-roledescription={copy.ui.slide} aria-label={fill(copy.ui.slideOf, { i: i + 1, n: slides.length })}>
            {slide}
          </li>
        ))}
      </ul>
      {controls === 'below' ? (
        <div className="ui-carousel__controls" style={inset ? { paddingInline: inset } : undefined}>
          <IconButton
            label={copy.ui.prev}
            tone={tone === 'dark' ? 'dark' : 'light'}
            aria-controls={id}
            aria-disabled={edges.start || undefined}
            onClick={() => !edges.start && go(-1)}
          >
            <ArrowIcon direction="back" className="size-5" />
          </IconButton>
          <IconButton
            label={copy.ui.next}
            tone={tone === 'dark' ? 'dark' : 'light'}
            aria-controls={id}
            aria-disabled={edges.end || undefined}
            onClick={() => !edges.end && go(1)}
          >
            <ArrowIcon className="size-5" />
          </IconButton>
        </div>
      ) : null}
    </div>
  );
}

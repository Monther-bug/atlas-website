import { useEffect } from 'react';
import { RequestBar } from '@/components/RequestBar';
import type { Crane } from '@/content/types';
import { loadAnalytics, track, type AnalyticsEvent } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { nameForTransition } from '@/lib/view-transition';
import { useMotionLayer } from '@/motion';
import { Footer } from '@/sections/Footer';
import { Header } from '@/sections/Header';
import { CraneBody } from './CraneIsland';

const loadMotion = () => import('@/motion/crane').then((m) => m.startCraneMotion);

/**
 * The photo story (≥ 64rem): the photo of the step crossing the middle of the screen shows in the sticky stage. An
 * IntersectionObserver on the static island's steps; CSS does the crossfade (instant under reduced motion). Below
 * 64rem, and without JavaScript, each step shows its own photo inline and this changes nothing visible.
 */
function storySteps(): () => void {
  const steps = Array.from(document.querySelectorAll<HTMLElement>('[data-story-step]'));
  if (steps.length < 2 || typeof IntersectionObserver === 'undefined') return () => {};
  const frames = Array.from(document.querySelectorAll<HTMLElement>('[data-story-frame]'));
  const show = (i: string) => {
    for (const el of steps) el.toggleAttribute('data-active', el.dataset.storyStep === i);
    for (const el of frames) el.toggleAttribute('data-active', el.dataset.storyFrame === i);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) show((entry.target as HTMLElement).dataset.storyStep ?? '0');
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  steps.forEach((s) => io.observe(s));
  return () => io.disconnect();
}

/**
 * Clicks inside the island: analytics by delegation (`data-track` + `data-track-location`, with the crane id), and the
 * view-transition name for a card that leads to another crane page (its photo grows into that page's hero).
 */
function bodyClicks(crane: Crane): () => void {
  const root = document.getElementById('crane-body');
  if (!root) return () => {};
  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    const tracked = target?.closest<HTMLElement>('[data-track]');
    if (tracked && root.contains(tracked)) {
      const { track: name, trackLocation } = tracked.dataset;
      track(name as AnalyticsEvent, { location: trackLocation ?? 'crane-page', crane_id: crane.id });
    }
    const link = target?.closest<HTMLAnchorElement>('a[data-crane-link]');
    if (link && !event.defaultPrevented && event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) {
      // One name per page: this page's hero gives its name up to the card that was clicked.
      document.querySelector<HTMLElement>('[data-crane-hero-photo]')?.style.setProperty('view-transition-name', 'none');
      nameForTransition(link.querySelector('[data-crane-link-photo]'));
    }
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}

/** A crane page (/cranes/<id>/): the home page's header, footer and request bar around the static body island. */
export function CraneApp({ crane }: { crane: Crane }) {
  const { copy } = useLang();

  // Motion is not needed for the first paint (the hero entrance is CSS): load it when the browser is idle.
  useMotionLayer(loadMotion, { idle: true });

  useEffect(() => {
    loadAnalytics();
    const stopStory = storySteps();
    const stopClicks = bodyClicks(crane);
    return () => {
      stopStory();
      stopClicks();
    };
  }, [crane]);

  return (
    <>
      <a
        href="#main"
        className="fixed start-3 top-3 z-50 -translate-y-24 bg-(--surface-raised) px-5 py-3 font-semibold text-(--surface-fg) transition-transform focus:translate-y-0"
      >
        {copy.header.skipLink}
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <CraneBody crane={crane} />
      </main>
      <Footer />
      <RequestBar defaultCrane={crane.id} />
    </>
  );
}

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from './util';

export interface StoryStep {
  id: string;
  /** The picture for this step (a <Picture> or a figure). Rendered in the sticky stage on desktop, inline on phones. */
  media: ReactNode;
  content: ReactNode;
}

export interface StickyStoryProps {
  steps: readonly StoryStep[];
  /** Accessible name of the step list. */
  label: string;
  className?: string;
}

/**
 * Sticky storytelling without a pin: from 64rem the media stage sticks beside the steps and swaps (crossfade +
 * 1.04 -> 1 settle) as each step crosses the middle of the screen; the active step is found with an
 * IntersectionObserver (no GSAP, no scroll handler). On phones, and without JS, each step shows its own media
 * inline. Reduced motion: the swap is instant. The fleet showcase keeps its own GSAP pin; this is for About / Why.
 */
export function StickyStory({ steps, label, className }: StickyStoryProps) {
  const [active, setActive] = useState(steps[0]?.id ?? '');
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = list.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive((entry.target as HTMLElement).dataset.step ?? '');
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    el.querySelectorAll('[data-step]').forEach((step) => io.observe(step));
    return () => io.disconnect();
  }, [steps.length]);

  return (
    <div className={cx('ui-story', className)}>
      <ol ref={list} aria-label={label} className="ui-story__steps">
        {steps.map((step) => (
          <li key={step.id} data-step={step.id} data-active={step.id === active ? '' : undefined} className="ui-story__step">
            <div className="ui-story__inline-media">{step.media}</div>
            <div className="ui-story__content">{step.content}</div>
          </li>
        ))}
      </ol>
      <div className="ui-story__stage" aria-hidden="true">
        {steps.map((step) => (
          <div key={step.id} className="ui-story__frame frame" data-active={step.id === active ? '' : undefined}>
            {step.media}
          </div>
        ))}
      </div>
    </div>
  );
}

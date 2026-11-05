import type { ReactNode } from 'react';
import { cx } from './util';

export interface MarqueeProps {
  /** Accessible name of the strip. */
  label: string;
  /** Plain items (text, a model and its capacity). No links: the moving copy is inert. */
  items: readonly ReactNode[];
  /** Repeat the items inside each copy so one copy is wider than the screen (short lists). */
  repeat?: number;
  className?: string;
  itemClassName?: string;
}

/**
 * A strip of real facts (models and capacities, the four services) that moves ONLY while the visitor scrolls: a CSS
 * scroll-driven animation (`animation-timeline: view()`), so there is no autoplay loop to pause (WCAG 2.2.2 does not
 * apply; Impeccable's `marquee` rule flags infinite loops, which this is not). It needs no JS. Browsers without
 * scroll-driven animations, and reduced motion, get a static wrapped list. One per page (v2 floor §16.15).
 */
export function Marquee({ label, items, repeat = 1, className, itemClassName }: MarqueeProps) {
  const list = Array.from({ length: Math.max(1, repeat) }, () => items).flat();
  const renderList = (copyIndex: number) =>
    list.map((item, i) => (
      <li key={`${copyIndex}-${i}`} className={itemClassName}>
        {item}
      </li>
    ));
  return (
    <div role="region" aria-label={label} className={cx('ui-marquee', className)}>
      <div className="ui-marquee__rail">
        <ul className="ui-marquee__list">{renderList(0)}</ul>
        <ul className="ui-marquee__list" aria-hidden="true" inert>
          {renderList(1)}
        </ul>
      </div>
    </div>
  );
}

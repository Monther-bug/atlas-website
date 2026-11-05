import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './util';

export type BentoSpan = 'third' | 'half' | 'half-wide' | 'two-thirds' | 'full';
export type BentoTone = 'raised' | 'tile' | 'night' | 'navy' | 'photo';

export interface BentoGridProps extends HTMLAttributes<HTMLElement> {
  /** `ul` when the tiles are a list of like things (services); `div` otherwise. */
  as?: 'div' | 'ul';
  children: ReactNode;
}

/**
 * Container-query grid: 1 column, 2 from a 40rem container, 6 tracks from 60rem. Tiles name their span; `dense`
 * packing fills holes, so DOM order (= reading and focus order) stays the source of truth.
 */
export function BentoGrid({ as: Tag = 'div', className, children, ...rest }: BentoGridProps) {
  return (
    <div className="ui-bento">
      <Tag {...rest} className={cx('ui-bento__grid', Tag === 'ul' ? 'm-0 list-none p-0' : '', className)}>
        {children}
      </Tag>
    </div>
  );
}

export interface BentoTileProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'li' | 'article';
  span?: BentoSpan;
  /** 2 = the tile spans two rows from 60rem (a tall photo or figure tile). */
  rows?: 1 | 2;
  tone?: BentoTone;
  children: ReactNode;
}

/**
 * One tile. Tiles in a grid must differ in content type (photo, figure, list, action), not repeat one
 * icon+heading+text recipe (v2 floor §16.13). `night`, `navy` and `photo` tiles are dark grounds and `tile` is a light
 * one wherever it sits; `data-ground` and the --surface-* variables follow automatically.
 */
export function BentoTile({ as: Tag = 'div', span = 'third', rows = 1, tone = 'raised', className, children, ...rest }: BentoTileProps) {
  const dark = tone === 'night' || tone === 'navy' || tone === 'photo';
  // `tile` is always a light ground (white -> mist), even inside a dark section; `raised` follows its section.
  const ground = dark ? 'dark' : tone === 'tile' ? 'light' : undefined;
  return (
    <Tag
      {...rest}
      data-span={span}
      data-rows={rows === 2 ? '2' : undefined}
      data-tone={tone}
      data-ground={ground}
      className={cx('ui-bento__tile', tone === 'navy' ? 'surface-navy' : dark ? 'surface-dark' : tone === 'tile' ? 'surface-white' : '', className)}
    >
      {children}
    </Tag>
  );
}

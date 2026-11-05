import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './util';

/**
 * Grounds (v2 spec §5). Yard = light grounds where machines are looked at; Chart = dark grounds where numbers are
 * read and requests are made, on black. `night` adds a graphite glow and the faint load-chart grid; `navy` is the
 * brand colour as a ground, for one accent tile or band at most.
 */
export type Surface = 'white' | 'mist' | 'tint' | 'dark' | 'night' | 'navy';
export type Ground = 'light' | 'dark';

const DARK: ReadonlySet<Surface> = new Set(['dark', 'night', 'navy']);

export function groundOf(surface: Surface): Ground {
  return DARK.has(surface) ? 'dark' : 'light';
}

const WIDTH = {
  default: 'shell',
  narrow: 'shell-narrow',
  wide: 'shell-wide',
} as const;

const PAD = {
  default: 'section-v2',
  top: 'pt-(--space-section)',
  bottom: 'pb-(--space-section)',
  none: '',
} as const;

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  surface?: Surface;
  /** `bleed` renders children without the centred shell (full-width media, carousels that run to the edge). */
  width?: keyof typeof WIDTH | 'bleed';
  pad?: keyof typeof PAD;
  as?: 'section' | 'div' | 'aside' | 'footer' | 'article';
  children: ReactNode;
}

/**
 * Section shell: sets the surface (colours + the semantic --surface-* variables primitives read) and `data-ground`,
 * which drives the focus ring, caret and selection colours (styles.css base layer).
 */
export function Section({ surface = 'white', width = 'default', pad = 'default', as: Tag = 'section', className, children, ...rest }: SectionProps) {
  return (
    <Tag {...rest} data-ground={groundOf(surface)} data-surface={surface} className={cx(`surface-${surface}`, PAD[pad], className)}>
      {width === 'bleed' ? children : <div className={WIDTH[width]}>{children}</div>}
    </Tag>
  );
}

export interface SectionHeaderProps {
  /** id of the heading, for the section's aria-labelledby. */
  id?: string;
  title: ReactNode;
  /** Stripe-style continuation: a second sentence in the same heading, in the surface's tertiary tone. */
  continuation?: ReactNode;
  lead?: ReactNode;
  /** Actions on the inline-end side (a link to compare, carousel controls). */
  actions?: ReactNode;
  level?: 2 | 3;
  className?: string;
}

/**
 * Heading block. There is deliberately no eyebrow/kicker slot (Impeccable ban, v2 floor §16.1): the heading is the
 * first thing in its block.
 */
export function SectionHeader({ id, title, continuation, lead, actions, level = 2, className }: SectionHeaderProps) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <header className={cx('mb-(--space-head) flex flex-wrap items-end justify-between gap-x-10 gap-y-6', className)}>
      <div className="max-w-[52rem]">
        <H id={id} className={level === 2 ? 't-headline' : 't-title'}>
          {title}
          {continuation ? (
            <>
              {' '}
              <span className="t-muted">{continuation}</span>
            </>
          ) : null}
        </H>
        {lead ? <p className="t-sub mt-5 max-w-[40rem] text-(--surface-fg-2)">{lead}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}

import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './util';

export type CardTone = 'raised' | 'outline' | 'sunken' | 'plain';

const PADDING = { none: '', sm: 'p-5', md: 'p-6 md:p-7', lg: 'p-(--space-tile)' } as const;

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'article' | 'div' | 'li';
  tone?: CardTone;
  /** Hover lift (desktop) and a raised state while anything inside has keyboard focus. Pair with <CardLink>. */
  interactive?: boolean;
  padding?: keyof typeof PADDING;
  /** Full-bleed media at the top; the card clips it to its own radius (concentric by construction). */
  media?: ReactNode;
  children: ReactNode;
}

/**
 * A container for ONE thing (a crane, a document, a step). Not the page structure: a grid of identical
 * icon+heading+text cards is refused by the v2 floor (§16.13). Cards never nest.
 */
export function Card({ as: Tag = 'div', tone = 'raised', interactive = false, padding = 'md', media, className, children, ...rest }: CardProps) {
  return (
    <Tag
      {...rest}
      data-tone={tone}
      data-interactive={interactive ? '' : undefined}
      className={cx('ui-card flex flex-col', media ? 'overflow-clip' : '', className)}
    >
      {media ? <div className="relative aspect-[4/3] overflow-clip bg-(--surface-sunken)">{media}</div> : null}
      <div className={cx('flex flex-1 flex-col', PADDING[padding])}>{children}</div>
    </Tag>
  );
}

/**
 * The card's primary link, stretched over the whole card with ::after. Other controls inside the card must be
 * `relative z-10` to stay clickable above it.
 */
export function CardLink({ className, children, ...rest }: HTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) {
  return (
    <a {...rest} className={cx('after:absolute after:inset-0 after:rounded-[inherit] after:content-[""] focus-visible:outline-offset-4', className)}>
      {children}
    </a>
  );
}

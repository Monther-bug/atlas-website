import type { ReactNode } from 'react';
import { DraftBadge } from '@/components/DraftBadge';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';
import { cx } from './util';

export interface StatProps {
  value: number;
  unit?: string;
  label: ReactNode;
  /** Ticker start value (the motion layer counts from here to `value` once, when it enters view). Omit for no ticker. */
  from?: number;
  decimals?: number;
  /** false = unverified: shows the DraftBadge (staging) next to the label. */
  verified?: boolean;
  size?: 'figure' | 'readout';
  className?: string;
}

/**
 * A number that is a fact about Atlas (a capacity, a count of crane types). Never an invented statistic, and never
 * the "hero metric" row of big number + small label + supporting stats (v2 floor §16.14): place stats inside an
 * instrument (a scale, a spec list) or beside the thing they measure.
 *
 * Accessibility (D-notes #2): the visible digits are aria-hidden so the ticker can animate them; the final value is
 * an sr-only twin. The prerendered HTML already shows the final value.
 */
export function Stat({ value, unit, label, from, decimals = 2, verified = true, size = 'figure', className }: StatProps) {
  const { lang } = useLang();
  const shown = formatNumber(value, lang, { maximumFractionDigits: decimals });
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <p className="ui-stat__value m-0">
        <span
          className={size === 'readout' ? 't-readout' : 't-figure'}
          // Poppins figures are proportional: hold the final width while the ticker runs (end-aligned, no jitter).
          style={from === undefined ? undefined : { display: 'inline-block', minInlineSize: `${shown.length * 0.62}em`, textAlign: 'end' }}
          aria-hidden="true"
          data-ticker={from === undefined ? undefined : String(value)}
          data-ticker-from={from === undefined ? undefined : String(from)}
          data-ticker-decimals={from === undefined ? undefined : String(decimals)}
        >
          {shown}
        </span>
        {unit ? (
          <span className="t-sub t-accent" aria-hidden="true">
            {unit}
          </span>
        ) : null}
        <span className="sr-only">{unit ? `${shown} ${unit}` : shown}</span>
      </p>
      <p className="t-small m-0 flex flex-wrap items-center gap-2 text-(--surface-fg-2)">
        {label}
        <DraftBadge verified={verified} />
      </p>
    </div>
  );
}

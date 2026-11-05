import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cx, useMeasure } from './util';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  /** Radio group name (unique on the page). */
  name: string;
  /** Accessible name of the group. */
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  tone?: 'light' | 'dark';
  className?: string;
}

/**
 * Apple-style segmented control built on native radio inputs: arrow keys, form semantics and screen-reader
 * announcements come from the platform. The white thumb slides to the checked option (measured offsets,
 * RTL-safe); before measuring, or without JS, the checked option paints its own fill. Use it to pick ONE value
 * (a crane, a unit); use <Tabs> to switch whole panels of content.
 */
export function SegmentedControl<T extends string>({ name, label, options, value, onChange, tone = 'light', className }: SegmentedControlProps<T>) {
  const track = useRef<HTMLDivElement>(null);
  const box = useMeasure(track, () => track.current?.querySelector<HTMLElement>('input:checked')?.closest('label') ?? null, [value, options.length]);
  // Transitions start one frame after the first measurement, so the thumb never slides in from the edge on load.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!box || settled) return;
    const id = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(id);
  }, [box, settled]);
  // Keep the checked option visible when the track scrolls sideways (five models on a phone). Only the track scrolls:
  // scrollIntoView could also scroll the page. A physical delta works in RTL too (scrollLeft is negative there).
  const changed = useRef(false);
  useEffect(() => {
    const t = track.current;
    const checked = t?.querySelector<HTMLElement>('input:checked')?.closest('label');
    if (!t || !checked || t.scrollWidth <= t.clientWidth) return;
    const tr = t.getBoundingClientRect();
    const lr = checked.getBoundingClientRect();
    const pad = 16;
    const delta = lr.left < tr.left ? lr.left - tr.left - pad : lr.right > tr.right ? lr.right - tr.right + pad : 0;
    if (delta === 0) return;
    const smooth = changed.current && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    t.scrollBy?.({ left: delta, behavior: smooth ? 'smooth' : 'auto' });
  }, [value]);

  const style = box ? ({ '--seg-x': `${box.x}px`, '--seg-w': `${box.w}px` } as CSSProperties) : undefined;
  return (
    <div
      ref={track}
      role="radiogroup"
      aria-label={label}
      data-tone={tone}
      data-measured={box ? '' : undefined}
      className={cx('ui-seg', className)}
      style={style}
    >
      <span className="ui-seg__thumb" aria-hidden="true" style={settled ? undefined : { transition: 'none' }} />
      {options.map((option) => (
        <label key={option.value} className="ui-seg__option">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => {
              changed.current = true;
              onChange(option.value);
            }}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

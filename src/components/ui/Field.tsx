import { useId, type ReactNode } from 'react';
import { cx } from './util';

/** Class for <input>, <select> and <textarea> on any ground (border >= 3:1, 14 px radius, 52 px tall). */
export const fieldClass = 'ui-field__control';

export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
  className: string;
}

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  /** Error text names the problem and the fix (copy deck §9). Present = invalid. */
  error?: ReactNode;
  required?: boolean;
  /** «مطلوب / Required» or «اختياري / Optional», from copy. */
  tag?: ReactNode;
  /** Render the control with the wired props: `{(p) => <input {...p} type="text" />}`. */
  children: (props: FieldControlProps) => ReactNode;
  className?: string;
}

/**
 * Label, hint, control and error, wired with ids (aria-describedby lists hint then error; aria-invalid on error).
 * The form announces errors in its own summary/live region; a Field does not add a second live region.
 */
export function Field({ label, hint, error, required = false, tag, children, className }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="t-body font-semibold">
          {label}
        </label>
        {tag ? <span className="t-caption text-(--surface-fg-3)">{tag}</span> : null}
      </div>
      {hint ? (
        <p id={hintId} className="t-small m-0 text-(--surface-fg-2)">
          {hint}
        </p>
      ) : null}
      {children({
        id,
        className: fieldClass,
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        ...(error ? { 'aria-invalid': true as const } : {}),
        ...(required ? { 'aria-required': true as const } : {}),
      })}
      {error ? (
        <p id={errorId} className="t-small m-0 font-semibold text-(--surface-danger)">
          {error}
        </p>
      ) : null}
    </div>
  );
}

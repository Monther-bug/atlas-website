import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cx } from './util';

/** Static tag: a crane type, a unit, a status. Not interactive. */
export function Chip({ className, children, ...rest }: HTMLAttributes<HTMLSpanElement> & { children: ReactNode }) {
  return (
    <span {...rest} className={cx('ui-chip', className)}>
      {children}
    </span>
  );
}

export interface ToggleChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onChange'> {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  children: ReactNode;
}

/** Filter chip: a toggle button (aria-pressed), 44 px tall. Group several inside a role="group" with a label. */
export function ToggleChip({ pressed, onPressedChange, className, children, type = 'button', ...rest }: ToggleChipProps) {
  return (
    <button {...rest} type={type} aria-pressed={pressed} onClick={() => onPressedChange(!pressed)} className={cx('ui-chip', className)}>
      {children}
    </button>
  );
}

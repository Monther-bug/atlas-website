import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './util';

const TONE = {
  light: 'bg-brand-50 text-brand enabled:not-aria-disabled:hover:bg-brand-100',
  dark: 'bg-white/10 text-white enabled:not-aria-disabled:hover:bg-white/20',
  glass: 'glass-dark text-white enabled:not-aria-disabled:hover:bg-black/80',
  outline: 'border border-(--surface-control) text-(--surface-fg) enabled:not-aria-disabled:hover:border-(--surface-fg)',
} as const;

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Accessible name (rendered sr-only). Required: an icon alone has no name. */
  label: string;
  tone?: keyof typeof TONE;
  children: ReactNode;
}

/** Round 44 px icon button (carousel paddles, sheet close, marquee pause). */
export function IconButton({ label, tone = 'light', className, children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-[background-color,border-color,opacity,transform] duration-(--dur-state) ease-ui enabled:not-aria-disabled:active:scale-95 aria-disabled:cursor-default aria-disabled:opacity-40',
        TONE[tone],
        className,
      )}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { useLang } from '@/lib/lang';

export type ButtonVariant = 'primary-red' | 'outline-on-dark' | 'outline-on-light';
export type ButtonSize = 'lg' | 'md';

import { CHEVRON_STRIPES } from '@/components/stripes';

export { CHEVRON_STRIPES };

// The focus ring is the global `:focus-visible` rule; its colour comes from `--ring`, set by the ground (A1).
// Never override the outline colour here.
const BASE =
  'relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-none font-body font-semibold leading-none text-center transition-[background-color,border-color,color,filter] duration-200 [&:lang(ar)]:text-[1.0625rem]';
/**
 * Rendered height of a size="lg" button: 52 px, 56 px from md (typography §4). The hero sling reserves this
 * room under the hook. Tailwind needs literal class names, so SIZES.lg spells the same values (a test checks).
 */
export const BUTTON_LG_HEIGHT = { base: '3.25rem', md: '3.5rem' } as const;
const SIZES: Record<ButtonSize, string> = {
  lg: 'min-h-[3.25rem] px-6 text-base md:min-h-[3.5rem]', // BUTTON_LG_HEIGHT
  md: 'min-h-12 px-4 text-base', // 48 px, for the 64 px request bar
};
// Native buttons use enabled: plus not-aria-disabled: so hover and active never fire while disabled or loading;
// anchors have no disabled state.
const ANCHOR_VARIANTS: Record<ButtonVariant, string> = {
  'primary-red': 'bg-red text-white hover:brightness-90 active:brightness-75',
  'outline-on-dark': 'border border-white/70 text-white hover:border-white hover:bg-white hover:text-navy-950',
  'outline-on-light': 'border border-navy text-navy hover:bg-navy hover:text-white',
};
const NATIVE_VARIANTS: Record<ButtonVariant, string> = {
  'primary-red':
    'bg-red text-white enabled:not-aria-disabled:hover:brightness-90 enabled:not-aria-disabled:active:brightness-75',
  'outline-on-dark':
    'border border-white/70 text-white enabled:not-aria-disabled:hover:border-white enabled:not-aria-disabled:hover:bg-white enabled:not-aria-disabled:hover:text-navy-950',
  'outline-on-light':
    'border border-navy text-navy enabled:not-aria-disabled:hover:bg-navy enabled:not-aria-disabled:hover:text-white',
};
const IDLE = 'disabled:cursor-not-allowed disabled:opacity-60';
const BUSY = 'cursor-progress';

export function buttonClass(variant: ButtonVariant = 'primary-red', size: ButtonSize = 'lg', extra = '', native = false): string {
  return [BASE, SIZES[size], (native ? NATIVE_VARIANTS : ANCHOR_VARIANTS)[variant], extra].filter(Boolean).join(' ');
}

/** target/rel for http(s) links; mailto: and tel: stay in place. */
export function externalProps(href: string): { target?: '_blank'; rel?: string } {
  return /^https?:\/\//.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

/** Screen-reader note for links that open a new tab. */
export function NewTabNote() {
  const { copy } = useLang();
  return <span className="sr-only"> ({copy.misc.newTab})</span>;
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconEnd?: ReactNode;
  className?: string;
  children: ReactNode;
}

export type AnchorButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'> & {
    href: string;
    /** http(s) links open in a new tab and say so. */
    external?: boolean;
  };

export type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & {
    href?: undefined;
    /**
     * Busy: stays focusable (aria-disabled + aria-busy, no `disabled`), activation is ignored, and a chevron
     * strip runs along the bottom edge. Forms must announce busy/success/failure in their own aria-live region.
     */
    loading?: boolean;
    /** Busy label from copy. Stacked with the idle label in one grid cell so the button keeps the wider width. */
    loadingLabel?: ReactNode;
  };

export type ButtonProps = AnchorButtonProps | NativeButtonProps;

function isAnchor(props: ButtonProps): props is AnchorButtonProps {
  return typeof props.href === 'string';
}

/** Square-cornered button or link (spec §6). */
export function Button(props: ButtonProps) {
  if (isAnchor(props)) {
    const { variant, size, icon, iconEnd, className, children, external, target, rel, ...rest } = props;
    const ext = external === true ? externalProps(rest.href) : {};
    const finalTarget = target ?? ext.target;
    const blank = finalTarget === '_blank';
    return (
      <a
        {...rest}
        target={finalTarget}
        rel={blank ? 'noopener noreferrer' : rel}
        className={buttonClass(variant, size, className)}
      >
        {icon}
        <span>{children}</span>
        {iconEnd}
        {blank && <NewTabNote />}
      </a>
    );
  }
  const { variant, size, icon, iconEnd, className, children, loading = false, loadingLabel, disabled, type = 'button', onClick, ...rest } = props;
  const guard = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  const stacked = loadingLabel !== undefined;
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled === true}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={guard}
      className={buttonClass(variant, size, `${loading ? BUSY : IDLE} ${className ?? ''}`, true)}
    >
      {icon}
      {stacked ? (
        <span className="inline-grid">
          <span className={`[grid-area:1/1]${loading ? ' invisible' : ''}`}>{children}</span>
          <span className={`[grid-area:1/1]${loading ? '' : ' invisible'}`}>{loadingLabel}</span>
        </span>
      ) : (
        <span>{children}</span>
      )}
      {iconEnd}
      {loading && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1" style={CHEVRON_STRIPES} />}
    </button>
  );
}

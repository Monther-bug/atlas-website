import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { useLang } from '@/lib/lang';

import { CHEVRON_CLASS, CHEVRON_STRIPES } from '@/components/stripes';

export { CHEVRON_STRIPES };

/**
 * v2 variants (docs/superpowers/specs/2026-11-05-atlas-v2-design.md §8.1). Name = role, plus the ground it sits on:
 * - primary      red pill: the one action of a view (request, WhatsApp). Never two primaries side by side.
 * - secondary    black pill on light grounds (v2 palette: white and black, a little red and navy).
 *   Navy is not a button colour in v2: it stays for the logo, links (plain on light), focus and the tab ink.
 * - inverse      white pill on dark grounds.
 * - ghost-light  ink hairline pill on light grounds.
 * - ghost-dark   white/40 hairline pill on dark grounds.
 * - glass        frosted pill over photographs (glass-dark).
 * - plain        text action with a trailing arrow; no fill.
 * v1 names are aliases until every section migrates: primary-red -> primary, outline-on-dark -> ghost-dark,
 * outline-on-light -> ghost-light.
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'inverse'
  | 'ghost-light'
  | 'ghost-dark'
  | 'glass'
  | 'plain'
  | 'primary-red'
  | 'outline-on-dark'
  | 'outline-on-light';
export type ButtonSize = 'lg' | 'md' | 'sm';

type V2Variant = Exclude<ButtonVariant, 'primary-red' | 'outline-on-dark' | 'outline-on-light'>;
const ALIAS: Record<ButtonVariant, V2Variant> = {
  primary: 'primary',
  secondary: 'secondary',
  inverse: 'inverse',
  'ghost-light': 'ghost-light',
  'ghost-dark': 'ghost-dark',
  glass: 'glass',
  plain: 'plain',
  'primary-red': 'primary',
  'outline-on-dark': 'ghost-dark',
  'outline-on-light': 'ghost-light',
};

// The focus ring is the global `:focus-visible` rule; its colour comes from `--ring`, set by the ground (A1).
// Never override the outline colour here. Press feedback is a 2 % scale (transform), hover is colour only.
const BASE =
  'relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-body font-semibold leading-tight text-center transition-[background-color,border-color,color,transform] duration-(--dur-state) ease-ui [&:lang(ar)]:text-[1.0625rem]';
/**
 * Rendered height of a size="lg" button: 52 px, 56 px from md (typography §4). The hero sling reserves this
 * room under the hook. Tailwind needs literal class names, so SIZES.lg spells the same values (a test checks).
 */
export const BUTTON_LG_HEIGHT = { base: '3.25rem', md: '3.5rem' } as const;
const SIZES: Record<ButtonSize, string> = {
  lg: 'min-h-[3.25rem] px-7 text-base md:min-h-[3.5rem]', // BUTTON_LG_HEIGHT
  md: 'min-h-12 px-5 text-base', // 48 px, for the 64 px request bar
  sm: 'min-h-11 px-4 text-[0.9375rem]', // 44 px: the tap-target floor
};
const PLAIN_SIZE = 'min-h-11 px-1 text-base';

// Anchors: plain hover/active. Native buttons: enabled:not-aria-disabled: so hover and press never fire while
// disabled or loading. Every class is spelled out in full: Tailwind only compiles names it can read in the source.
const ANCHOR: Record<V2Variant, string> = {
  primary: 'bg-red text-white hover:bg-red-600 active:scale-[0.98]',
  secondary: 'bg-ink text-white hover:bg-neutral-800 active:scale-[0.98]',
  inverse: 'bg-white text-ink hover:bg-neutral-200 active:scale-[0.98]',
  'ghost-light': 'border border-ink text-ink hover:bg-ink hover:text-white active:scale-[0.98]',
  'ghost-dark': 'border border-white/40 text-white hover:border-white hover:bg-white hover:text-ink active:scale-[0.98]',
  glass: 'glass-dark text-white hover:bg-black/80 active:scale-[0.98]',
  plain: 'text-(--surface-accent) underline-offset-[0.28em] decoration-1 hover:underline active:opacity-80',
};
const NATIVE: Record<V2Variant, string> = {
  primary: 'bg-red text-white enabled:not-aria-disabled:hover:bg-red-600 enabled:not-aria-disabled:active:scale-[0.98]',
  secondary: 'bg-ink text-white enabled:not-aria-disabled:hover:bg-neutral-800 enabled:not-aria-disabled:active:scale-[0.98]',
  inverse: 'bg-white text-ink enabled:not-aria-disabled:hover:bg-neutral-200 enabled:not-aria-disabled:active:scale-[0.98]',
  'ghost-light':
    'border border-ink text-ink enabled:not-aria-disabled:hover:bg-ink enabled:not-aria-disabled:hover:text-white enabled:not-aria-disabled:active:scale-[0.98]',
  'ghost-dark':
    'border border-white/40 text-white enabled:not-aria-disabled:hover:border-white enabled:not-aria-disabled:hover:bg-white enabled:not-aria-disabled:hover:text-ink enabled:not-aria-disabled:active:scale-[0.98]',
  glass: 'glass-dark text-white enabled:not-aria-disabled:hover:bg-black/80 enabled:not-aria-disabled:active:scale-[0.98]',
  plain:
    'text-(--surface-accent) underline-offset-[0.28em] decoration-1 enabled:not-aria-disabled:hover:underline enabled:not-aria-disabled:active:opacity-80',
};
const IDLE = 'disabled:cursor-not-allowed disabled:opacity-60';
const BUSY = 'cursor-progress';

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'lg', extra = '', native = false): string {
  const v = ALIAS[variant];
  return [BASE, v === 'plain' ? PLAIN_SIZE : SIZES[size], (native ? NATIVE : ANCHOR)[v], extra].filter(Boolean).join(' ');
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
  /** Desktop only: the button leans a few pixels toward the pointer (src/motion/reveals.ts). Primary CTAs only. */
  magnetic?: boolean;
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

/** Pill button or link (v2 spec §8.1). */
export function Button(props: ButtonProps) {
  if (isAnchor(props)) {
    const { variant, size, icon, iconEnd, className, children, external, target, rel, magnetic, ...rest } = props;
    const ext = external === true ? externalProps(rest.href) : {};
    const finalTarget = target ?? ext.target;
    const blank = finalTarget === '_blank';
    return (
      <a
        {...rest}
        target={finalTarget}
        rel={blank ? 'noopener noreferrer' : rel}
        data-magnetic={magnetic ? '' : undefined}
        className={buttonClass(variant, size, className)}
      >
        {icon}
        <span>{children}</span>
        {iconEnd}
        {blank && <NewTabNote />}
      </a>
    );
  }
  const {
    variant,
    size,
    icon,
    iconEnd,
    className,
    children,
    loading = false,
    loadingLabel,
    disabled,
    type = 'button',
    onClick,
    magnetic,
    ...rest
  } = props;
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
      data-magnetic={magnetic ? '' : undefined}
      className={buttonClass(variant, size, `${loading ? BUSY : IDLE} ${className ?? ''}`, true)}
    >
      {icon}
      {stacked ? (
        // Both labels share one grid cell (col/row 1). Class names stay whole words: Tailwind's scanner missed the
        // earlier `[grid-area:1/1]${…}` template, so the labels stacked in two rows and the label sat off-centre.
        <span className="inline-grid">
          <span className={loading ? 'col-start-1 row-start-1 invisible' : 'col-start-1 row-start-1'}>{children}</span>
          <span className={loading ? 'col-start-1 row-start-1' : 'col-start-1 row-start-1 invisible'}>{loadingLabel}</span>
        </span>
      ) : (
        <span>{children}</span>
      )}
      {iconEnd}
      {loading && <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-1 ${CHEVRON_CLASS}`} />}
    </button>
  );
}

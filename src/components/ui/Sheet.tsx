import { useId, type ButtonHTMLAttributes, type MouseEvent, type ReactNode, type SyntheticEvent } from 'react';
import { CloseIcon } from '@/components/Icons';
import { useLang } from '@/lib/lang';
import { IconButton } from './IconButton';
import { cx } from './util';

/**
 * Props that make any <button> open the sheet `sheetId`. Uses HTML invoker commands (`commandfor`/`command`), which
 * open the dialog with no JS in browsers that support them; the click handler covers the rest.
 */
export function sheetTrigger(sheetId: string, onClick?: (event: MouseEvent<HTMLButtonElement>) => void): ButtonHTMLAttributes<HTMLButtonElement> {
  const invoker = { commandfor: sheetId, command: 'show-modal' } as Record<string, string>;
  return {
    ...invoker,
    'aria-haspopup': 'dialog',
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      const dialog = document.getElementById(sheetId);
      if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal();
    },
  };
}

export interface SheetProps {
  /** id of the <dialog>; triggers point at it with sheetTrigger(id). */
  id: string;
  title: ReactNode;
  /** `end`: slides from the inline-end edge from 48rem (left in Arabic); always a bottom sheet on phones. */
  side?: 'end' | 'bottom';
  /** Fires on Esc, the close button, a backdrop click and dialog.close(). */
  onClose?: () => void;
  /** Sticky footer (the request action). */
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Detail sheet on a native modal <dialog>: focus trap, Esc, inert background and focus return come from the platform;
 * the page scroll lock is global (styles.css) and Lenis stops while a dialog is open (motion/core.ts).
 * Content inside a closed dialog is not rendered for anyone, so a sheet may only ELABORATE: every fact in it must
 * also be reachable on the page (a spec list or the compare table), which keeps the no-JS page complete.
 */
export function Sheet({ id, title, side = 'end', onClose, footer, className, children }: SheetProps) {
  const { copy } = useLang();
  const titleId = useId();
  const closedBy = { closedby: 'any' } as Record<string, string>;
  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  };
  return (
    <dialog
      {...closedBy}
      id={id}
      aria-labelledby={titleId}
      data-side={side}
      data-ground="light"
      data-lenis-prevent=""
      onClose={(_event: SyntheticEvent<HTMLDialogElement>) => onClose?.()}
      onClick={onBackdrop}
      className={cx('ui-sheet surface-white', className)}
    >
      <div className="ui-sheet__body">
        <span className="ui-sheet__grabber" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 px-(--space-tile) pt-4 pb-4 md:pt-6">
          <h2 id={titleId} className="t-title">
            {title}
          </h2>
          <IconButton
            label={copy.ui.close}
            tone="light"
            {...({ commandfor: id, command: 'close' } as Record<string, string>)}
            onClick={(event) => {
              const dialog = event.currentTarget.closest('dialog');
              if (dialog?.open) dialog.close();
            }}
          >
            <CloseIcon className="size-5" />
          </IconButton>
        </div>
        <div className="ui-sheet__scroll">{children}</div>
        {footer ? (
          <div className="border-t border-(--color-line) px-(--space-tile) pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">{footer}</div>
        ) : null}
      </div>
    </dialog>
  );
}

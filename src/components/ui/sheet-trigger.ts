import type { ButtonHTMLAttributes, MouseEvent } from 'react';

/* Its own module so a trigger (the header menu button) does not pull the whole Sheet component into the main chunk
   when a lazy chunk uses Sheet (bundlers place a module in one chunk). */

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

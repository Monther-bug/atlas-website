/**
 * Shared-element open for the crane detail sheet: the card photo morphs into the sheet's lead photo with a same-document
 * View Transition (the snapshot layer sits above the top layer, so the photo can travel from the page into the modal).
 * Runs only when the motion layer is on (html[data-motion] is desktop or touch: reduced motion and no-JS never get
 * here) and the browser supports startViewTransition; otherwise the dialog simply opens with its own CSS entry.
 * Tiny and dependency-free, so it can live in the main bundle next to the sheet trigger.
 */
const NAME = 'crane-photo';

type StartViewTransition = (update: () => void) => { finished: Promise<void> };

function motionOn(): boolean {
  const mode = document.documentElement.dataset.motion;
  return (mode === 'desktop' || mode === 'touch') && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Opens `dialog` as a modal; `from` (the card photo) morphs into the dialog's [data-sheet-media] when possible. */
export function openWithMorph(dialog: HTMLDialogElement, from: HTMLElement | null): void {
  const to = dialog.querySelector<HTMLElement>('[data-sheet-media]');
  const start = (document as Document & { startViewTransition?: StartViewTransition }).startViewTransition?.bind(document);
  if (!start || !from || !to || !motionOn() || !from.isConnected) {
    dialog.showModal();
    return;
  }
  // The sheet's own slide-in would fight the morph: the view transition draws the entry instead.
  dialog.dataset.snap = '';
  from.style.viewTransitionName = NAME;
  let transition: { finished: Promise<void> };
  try {
    transition = start(() => {
      from.style.viewTransitionName = '';
      to.style.viewTransitionName = NAME;
      dialog.showModal();
    });
  } catch {
    from.style.viewTransitionName = '';
    delete dialog.dataset.snap;
    if (!dialog.open) dialog.showModal();
    return;
  }
  void transition.finished.finally(() => {
    to.style.viewTransitionName = '';
    delete dialog.dataset.snap;
  });
}

/** Closes `dialog` at once (no slide-out), so a motion that starts on the page right after is not hidden behind it. */
export function closeNow(dialog: HTMLDialogElement | null): void {
  if (!dialog?.open) return;
  dialog.dataset.snap = '';
  dialog.close();
  requestAnimationFrame(() => {
    delete dialog.dataset.snap;
  });
}

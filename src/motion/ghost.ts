import type { Rect } from './math';

const STRIP = new Set(['id', 'href', 'for', 'name', 'tabindex']);

/**
 * The only way motion makes a flying element (global rule 6): a deep clone that keeps
 * the source's classes (so it looks the same), loses every id, link and data-* hook
 * (so tests and selectors never see two), is inert and aria-hidden, and sits fixed
 * at `at` in <body>. The caller removes it after landing.
 */
export function makeGhost(source: HTMLElement, at: Rect): HTMLElement {
  const ghost = source.cloneNode(true) as HTMLElement;
  for (const el of [ghost, ...Array.from(ghost.querySelectorAll('*'))]) {
    for (const name of el.getAttributeNames()) {
      if (name.startsWith('data-') || STRIP.has(name)) el.removeAttribute(name);
    }
  }
  ghost.classList.add('motion-ghost');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.setAttribute('inert', '');
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${at.left}px`,
    top: `${at.top}px`,
    width: `${at.width}px`,
    height: `${at.height}px`,
    margin: '0',
    boxSizing: 'border-box',
    opacity: '1',
    visibility: 'visible',
    transform: 'none',
    pointerEvents: 'none',
    zIndex: '70',
  });
  document.body.append(ghost);
  return ghost;
}

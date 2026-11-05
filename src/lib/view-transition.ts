/**
 * Cross-document View Transition into a crane page (progressive enhancement; Chrome/Edge 126+, Safari 18.2+). Both
 * pages opt in with `@view-transition { navigation: auto }` (motion allowed only). The crane page's hero photo is
 * always named `crane-hero`; on the page being left, the photo of the card that was clicked takes the same name at
 * the moment of the click, so that photo grows into the hero. Only one element may carry a name at a time, so the
 * previous one is cleared first. Browsers without the feature navigate normally; the name is then inert.
 */
export const HERO_TRANSITION = 'crane-hero';

let named: HTMLElement | null = null;

export function nameForTransition(el: Element | null | undefined): void {
  if (named && named !== el) named.style.removeProperty('view-transition-name');
  named = null;
  if (!(el instanceof HTMLElement)) return;
  el.style.setProperty('view-transition-name', HERO_TRANSITION);
  named = el;
}

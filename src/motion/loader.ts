import { noop, safely, type Dispose, type MotionModule } from './shared';

/**
 * The first-visit loader (the inline script and #al in index.html / en/index.html) marks <html data-loader> while its
 * curtain covers the page. The moment the hook starts to lift it (or a key, press, wheel or touch skips it, or its
 * failsafe fires) the attribute goes and this event fires on window.
 */
export const LOADER_DONE = 'atlas:loader-done';
/** If the event never comes, the waiting module still runs after this long (the CSS failsafe hides the curtain by 2.5 s). */
export const LOADER_WAIT_MS = 2600;

/** True while the first-visit curtain covers the page. */
export function loaderShowing(): boolean {
  return document.documentElement.hasAttribute('data-loader');
}

/**
 * Runs `module` at once, or, while the curtain covers the page, the moment it lifts: an intro that starts under the
 * curtain would play unseen. Its from-states are set in the same task as the event, before the lift's first frame.
 */
export function afterLoader(module: MotionModule): MotionModule {
  return (env) => {
    if (!loaderShowing()) return module(env);
    let dispose: Dispose = noop;
    let settled = false;
    let timer = 0;
    const stop = () => {
      window.clearTimeout(timer);
      window.removeEventListener(LOADER_DONE, go);
    };
    function go() {
      if (settled) return;
      settled = true;
      stop();
      dispose = safely(module, env);
    }
    timer = window.setTimeout(go, LOADER_WAIT_MS);
    window.addEventListener(LOADER_DONE, go);
    return () => {
      settled = true;
      stop();
      dispose();
      dispose = noop;
    };
  };
}

// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MOTION_QUERIES, type MotionMode } from './mode';

interface FakeLenis {
  options: Record<string, unknown>;
  isStopped: boolean;
  scrollTo: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

const { lenises } = vi.hoisted(() => ({ lenises: [] as FakeLenis[] }));

vi.mock('lenis', () => ({
  default: class {
    options: Record<string, unknown>;
    isStopped = false;
    scrollTo = vi.fn();
    stop = vi.fn(() => {
      this.isStopped = true;
    });
    start = vi.fn(() => {
      this.isStopped = false;
    });
    destroy = vi.fn();
    on = vi.fn();
    raf = vi.fn();
    constructor(options: Record<string, unknown>) {
      this.options = options;
      lenises.push(this as unknown as FakeLenis);
    }
  },
}));

import { startMotion } from './core';

/** A matchMedia stand-in where exactly one motion context matches. */
function stubMode(mode: MotionMode, throwOn?: (query: string, call: number) => boolean) {
  let call = 0;
  vi.stubGlobal('matchMedia', (query: string) => {
    call += 1;
    if (throwOn?.(query, call)) throw new Error('matchMedia exploded');
    return {
      matches: query === MOTION_QUERIES[mode],
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: () => false,
    };
  });
}

function link(href: string, inner?: string): HTMLAnchorElement {
  const a = document.createElement('a');
  a.href = href;
  if (inner) a.innerHTML = inner;
  else a.textContent = 'link';
  document.body.append(a);
  return a;
}

const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve));

let dispose: (() => void) | undefined;

beforeEach(() => {
  lenises.length = 0;
});

afterEach(() => {
  dispose?.();
  dispose = undefined;
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  delete document.documentElement.dataset.motion;
});

describe('startMotion', () => {
  it('runs Lenis on desktop only, without its own anchor handling', () => {
    stubMode('desktop');
    dispose = startMotion();
    expect(document.documentElement.dataset.motion).toBe('desktop');
    expect(lenises).toHaveLength(1);
    expect(lenises[0].options.anchors).toBeFalsy();
  });

  it('creates no Lenis on touch or with reduced motion', () => {
    for (const mode of ['touch', 'reduced'] as const) {
      stubMode(mode);
      const stop = startMotion();
      expect(document.documentElement.dataset.motion).toBe(mode);
      stop();
    }
    expect(lenises).toHaveLength(0);
  });

  it('reverts what already ran when setting up a later context throws', () => {
    // The 1st reduced lookup is detectMotionMode; the 2nd is gsap.matchMedia adding the reduced context.
    let reducedCalls = 0;
    stubMode('desktop', (query) => query === MOTION_QUERIES.reduced && ++reducedCalls === 2);
    expect(() => startMotion()).toThrow('matchMedia exploded');
    expect(lenises).toHaveLength(1);
    expect(lenises[0].destroy).toHaveBeenCalledTimes(1);
    link('#request').click();
    expect(lenises[0].scrollTo).not.toHaveBeenCalled();
  });
});

describe('desktop in-page links', () => {
  beforeEach(() => {
    stubMode('desktop');
    dispose = startMotion();
  });

  it('glide to the target and still let the browser follow the link (hash)', () => {
    const a = link('#request');
    let prevented: boolean | undefined;
    window.addEventListener('click', (event) => (prevented = event.defaultPrevented), { once: true });
    a.click();
    expect(lenises[0].scrollTo).toHaveBeenCalledWith('#request', { onComplete: expect.any(Function) });
    expect(prevented).toBe(false);
  });

  it('decode the hash and work from an element inside the link', () => {
    link('#%D8%AE%D8%AF%D9%85%D8%A7%D8%AA', '<span>services</span>').querySelector('span')!.click();
    expect(lenises[0].scrollTo).toHaveBeenCalledWith('#خدمات', { onComplete: expect.any(Function) });
  });

  it('are left alone when a handler already took the click (error summary links)', () => {
    const a = link('#request-weight');
    a.addEventListener('click', (event) => event.preventDefault());
    a.click();
    expect(lenises[0].scrollTo).not.toHaveBeenCalled();
  });

  it('are left alone with a modifier key or a non-primary button', () => {
    const a = link('#request');
    for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
    }
    expect(lenises[0].scrollTo).not.toHaveBeenCalled();
  });

  it('ignore links to other pages and empty hashes', () => {
    // Registered after the motion handler, so it only cancels jsdom's navigation to /en/.
    const stayHere = (event: Event) => event.preventDefault();
    window.addEventListener('click', stayHere);
    link('/en/').click();
    link('#').click();
    window.removeEventListener('click', stayHere);
    expect(lenises[0].scrollTo).not.toHaveBeenCalled();
  });

  it('stop being handled after cleanup', () => {
    dispose?.();
    dispose = undefined;
    link('#request').click();
    expect(lenises[0].scrollTo).not.toHaveBeenCalled();
    expect(lenises[0].destroy).toHaveBeenCalledTimes(1);
    expect(document.documentElement.dataset.motion).toBeUndefined();
  });
});

describe('desktop dialogs', () => {
  it('stop Lenis while any dialog is open and start it again after', async () => {
    stubMode('desktop');
    dispose = startMotion();
    const dialog = document.createElement('dialog');
    document.body.append(dialog);

    dialog.setAttribute('open', '');
    await flush();
    expect(lenises[0].stop).toHaveBeenCalledTimes(1);
    expect(lenises[0].isStopped).toBe(true);

    dialog.removeAttribute('open');
    await flush();
    expect(lenises[0].isStopped).toBe(false);
  });

  it('start stopped when a dialog is already open', () => {
    const dialog = document.createElement('dialog');
    dialog.setAttribute('open', '');
    document.body.append(dialog);
    stubMode('desktop');
    dispose = startMotion();
    expect(lenises[0].isStopped).toBe(true);
  });

  it('are no longer watched after cleanup', async () => {
    stubMode('desktop');
    dispose = startMotion();
    dispose();
    dispose = undefined;
    const dialog = document.createElement('dialog');
    document.body.append(dialog);
    dialog.setAttribute('open', '');
    await flush();
    expect(lenises[0].stop).not.toHaveBeenCalled();
  });
});

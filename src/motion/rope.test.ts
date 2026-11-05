// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { startBackToTop, startProgressRope } from './rope';
import { lenisRef } from './shared';

// The v1 service set-down and service slings (reveal.ts) were replaced by the v2 Services/Why Atlas motion:
// src/motion/services.ts and src/motion/why.ts, tested in services.test.ts and why.test.ts.

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    batch: vi.fn(),
    create: vi.fn(),
    maxScroll: vi.fn(() => 4000),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
}));

const env = { lang: 'en', rtl: false, late: false } as const;
const st = ScrollTrigger as unknown as Record<string, ReturnType<typeof vi.fn>>;

afterEach(() => {
  document.body.innerHTML = '';
  lenisRef.current = null;
  vi.restoreAllMocks();
  Object.values(st).forEach((fn) => fn.mockClear?.());
});

describe('missing targets', () => {
  it('every module is a no-op without its C9 attributes', () => {
    for (const m of [startProgressRope]) {
      expect(() => m(env)()).not.toThrow();
    }
    expect(document.body.innerHTML).toBe('');
  });
});

describe('startProgressRope', () => {
  it('runs the full height of the page, ends at max scroll, and toggles is-live from onToggle', () => {
    document.body.innerHTML = '<div data-progress-rope></div><section id="services"></section>';
    const rope = document.querySelector('[data-progress-rope]')!;
    const fromTo = vi.spyOn(gsap, 'fromTo').mockReturnValue(undefined as never);

    startProgressRope(env);
    expect(fromTo.mock.calls[0][1]).toEqual({ scaleY: 0 });
    expect(fromTo.mock.calls[0][2]).toMatchObject({ scaleY: 1, scrollTrigger: { start: 0, end: 'max' } });

    const cfg = st.create.mock.calls[0][0];
    expect(cfg.end()).toBe(4001);
    cfg.onToggle({ isActive: true });
    expect(rope.classList.contains('is-live')).toBe(true);
    cfg.onToggle({ isActive: false });
    expect(rope.classList.contains('is-live')).toBe(false);
  });

  it('goes live when the Hoist track ends (its bottom meets the viewport bottom), ahead of #services', () => {
    document.body.innerHTML =
      '<div data-progress-rope></div><div data-hoist-track id="track"></div><section id="services"></section>';
    vi.spyOn(gsap, 'fromTo').mockReturnValue(undefined as never);
    startProgressRope(env);
    const cfg = st.create.mock.calls[0][0];
    expect(cfg.trigger.id).toBe('track');
    expect(cfg.start).toBe('bottom bottom');
  });

  it('hands over after the Hoist when there is no Services section, and clears is-live on cleanup', () => {
    document.body.innerHTML = '<div data-progress-rope class="is-live"></div><section id="cranes"></section>';
    vi.spyOn(gsap, 'fromTo').mockReturnValue(undefined as never);
    const dispose = startProgressRope(env);
    expect(st.create.mock.calls[0][0].trigger.id).toBe('cranes');
    dispose();
    expect(document.querySelector('[data-progress-rope]')!.classList.contains('is-live')).toBe(false);
  });
});

describe('startBackToTop', () => {
  it('glides with Lenis on a plain click only; native for no-Lenis, ctrl and middle clicks; cleanup reverts', () => {
    document.body.innerHTML = '<a href="#top" data-back-to-top><svg></svg></a>';
    const fromTo = vi.spyOn(gsap, 'fromTo').mockReturnValue(undefined as never);
    const dispose = startBackToTop(env);
    const link = document.querySelector('a')!;
    const click = (init: MouseEventInit = {}) => {
      const e = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });
      link.dispatchEvent(e);
      return e;
    };

    expect(click().defaultPrevented).toBe(false); // touch: no Lenis

    const scrollTo = vi.fn();
    lenisRef.current = { scrollTo } as never;
    expect(click({ ctrlKey: true }).defaultPrevented).toBe(false);
    expect(click({ button: 1 }).defaultPrevented).toBe(false);
    expect(scrollTo).not.toHaveBeenCalled();

    expect(click().defaultPrevented).toBe(true);
    expect(scrollTo).toHaveBeenCalledWith(0, expect.objectContaining({ duration: 1.4 }));
    expect(fromTo).toHaveBeenCalled();

    dispose();
    click();
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { startBackToTop, startProgressRope } from './rope';
import { startServiceSetDown, startServiceSlings } from './reveal';
import { lenisRef } from './shared';

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

function rect(top: number, extra: Partial<DOMRect> = {}): DOMRect {
  return { top, bottom: top + 100, left: 100, right: 500, width: 400, height: 100, x: 100, y: top, toJSON() {}, ...extra } as DOMRect;
}
function stubRect(el: Element, r: DOMRect) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(r);
}

afterEach(() => {
  document.body.innerHTML = '';
  lenisRef.current = null;
  vi.restoreAllMocks();
  Object.values(st).forEach((fn) => fn.mockClear?.());
});

describe('missing targets', () => {
  it('every module is a no-op without its C9 attributes', () => {
    for (const m of [startProgressRope, startServiceSetDown, startServiceSlings]) {
      expect(() => m(env)()).not.toThrow();
    }
    expect(document.body.innerHTML).toBe('');
  });
});

describe('startServiceSetDown', () => {
  function setup() {
    document.body.innerHTML = '<ul><li data-service-row id="a"></li><li data-service-row id="b"></li></ul>';
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    stubRect(document.getElementById('a')!, rect(100)); // on screen
    stubRect(document.getElementById('b')!, rect(2000)); // below the fold
    const set = vi.spyOn(gsap, 'set').mockReturnValue(undefined as never);
    const to = vi.spyOn(gsap, 'to').mockReturnValue(undefined as never);
    return { set, to };
  }

  it('only moves rows below the fold', () => {
    const { set } = setup();
    startServiceSetDown(env);
    expect(set).toHaveBeenCalledTimes(1);
    expect((set.mock.calls[0][0] as HTMLElement[]).map((e) => e.id)).toEqual(['b']);
    expect(st.batch.mock.calls[0][0].map((e: HTMLElement) => e.id)).toEqual(['b']);
  });

  it('is a no-op when every row is on screen', () => {
    setup();
    stubRect(document.getElementById('b')!, rect(300));
    startServiceSetDown(env)();
    expect(st.batch).not.toHaveBeenCalled();
  });

  it('refresh safety net finishes a row whose trigger is already passed, and cleanup removes the listener', () => {
    const { to } = setup();
    const dispose = startServiceSetDown(env);
    const add = st.addEventListener.mock.calls.find((c) => c[0] === 'refresh')!;
    const onRefresh = add[1] as () => void;
    onRefresh();
    expect(to).not.toHaveBeenCalled(); // still below 85%
    stubRect(document.getElementById('b')!, rect(300));
    onRefresh();
    expect(to).toHaveBeenCalledTimes(1);
    onRefresh();
    expect(to).toHaveBeenCalledTimes(1); // only once
    dispose();
    expect(st.removeEventListener).toHaveBeenCalledWith('refresh', onRefresh);
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

  it('hands over after the Hoist when there is no Services section, and clears is-live on cleanup', () => {
    document.body.innerHTML = '<div data-progress-rope class="is-live"></div><section id="cranes"></section>';
    vi.spyOn(gsap, 'fromTo').mockReturnValue(undefined as never);
    const dispose = startProgressRope(env);
    expect(st.create.mock.calls[0][0].trigger.id).toBe('cranes');
    dispose();
    expect(document.querySelector('[data-progress-rope]')!.classList.contains('is-live')).toBe(false);
  });
});

describe('startServiceSlings', () => {
  function setup() {
    document.body.innerHTML =
      '<div data-progress-rope></div><ul><li data-service-row><a href="#x">a</a></li></ul>';
    vi.spyOn(gsap, 'set').mockReturnValue(undefined as never);
    const to = vi.spyOn(gsap, 'to').mockReturnValue(undefined as never);
    const row = document.querySelector<HTMLElement>('[data-service-row]')!;
    stubRect(document.querySelector('[data-progress-rope]')!, rect(0, { left: 10, right: 11 }));
    stubRect(row, rect(0, { left: 111, right: 900 }));
    return { row, to };
  }

  it('adds an aria-hidden sling, measures only the shown row, and removes everything on cleanup', () => {
    const { row, to } = setup();
    const dispose = startServiceSlings(env);
    const svg = row.querySelector('svg.service-sling')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(row.style.getPropertyValue('--sling-reach')).toBe('100px');
    row.dispatchEvent(new Event('pointerenter'));
    expect(to).toHaveBeenCalledTimes(1);
    const refresh = st.addEventListener.mock.calls.find((c) => c[0] === 'refresh')![1];
    dispose();
    expect(st.removeEventListener).toHaveBeenCalledWith('refresh', refresh);
    expect(row.querySelector('svg')).toBeNull();
    expect(row.style.getPropertyValue('--sling-reach')).toBe('');
  });

  it('keeps the sling on pointer leave while keyboard focus holds the row, and draws only on focus-visible', () => {
    const { row, to } = setup();
    startServiceSlings(env);
    const link = row.querySelector('a')!;
    const original = row.querySelector.bind(row);
    let visible = false;
    vi.spyOn(row, 'querySelector').mockImplementation(((sel: string) =>
      sel === ':focus-visible' ? (visible ? link : null) : original(sel)) as never);

    link.dispatchEvent(new FocusEvent('focusin', { bubbles: true })); // mouse focus: not focus-visible
    expect(to).not.toHaveBeenCalled();

    visible = true;
    link.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(to).toHaveBeenCalledTimes(1);
    row.dispatchEvent(new Event('pointerleave'));
    expect(to).toHaveBeenCalledTimes(1); // retained

    visible = false;
    row.dispatchEvent(new Event('pointerleave'));
    expect(to).toHaveBeenCalledTimes(2); // retracted
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

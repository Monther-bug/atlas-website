// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mount } from '@/test/render';
import { Hoist } from '@/sections/Hoist';
import { hoistDesktop, hoistTouch } from './hoist';

// No layout in jsdom: the scroll side is stubbed, GSAP itself runs for real.
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: vi.fn(),
    refresh: vi.fn(),
    sort: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
}));
const st = ScrollTrigger as unknown as Record<string, ReturnType<typeof vi.fn>>;

async function renderHoist(lang: 'ar' | 'en' = 'en') {
  const { host } = await mount(createElement(Hoist), lang);
  const section = host.querySelector<HTMLElement>('[data-hoist]')!;
  return { section, html: section.outerHTML };
}

beforeEach(() => {
  Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true });
});

afterEach(() => {
  Object.values(st).forEach((fn) => fn.mockClear());
});

describe('hoistDesktop', () => {
  it('is a no-op without the Hoist markup', () => {
    const section = document.createElement('section');
    expect(() => hoistDesktop(section, 'en', false)()).not.toThrow();
    expect(section.outerHTML).toBe('<section></section>');
  });

  it('stages with motion-owned, aria-hidden nodes only: still "list, 5 items"', async () => {
    const { section } = await renderHoist();
    const dispose = hoistDesktop(section, 'en', false);
    const list = section.querySelector('[data-hoist-list]')!;
    expect(section.classList.contains('hoist--staged')).toBe(true);
    expect([...list.children].every((li) => li.hasAttribute('data-hoist-item'))).toBe(true);
    expect(list.children).toHaveLength(5);
    const rig = section.querySelector('[data-hoist-stage] > .hoist-rig');
    expect(rig?.getAttribute('aria-hidden')).toBe('true');
    expect(rig?.querySelector('a, button, [tabindex]')).toBeNull();
    // The track stays stuck for one beat per change of crane plus the exit: 100vh + 250vh at 900 px.
    expect((section.querySelector('[data-hoist-track]') as HTMLElement).style.blockSize).toBe('3150px');
    expect(st.addEventListener).toHaveBeenCalledWith('scrollEnd', expect.any(Function));
    dispose();
  });

  it('starts with every readout parked and every counter on the rating before it', async () => {
    const { section } = await renderHoist('en');
    const dispose = hoistDesktop(section, 'en', false);
    const counters = [...section.querySelectorAll('[data-counter]')].map((c) => c.textContent);
    expect(counters).toEqual(['0', '55', '60', '200', '250']);
    for (const tag of section.querySelectorAll<HTMLElement>('[data-load-tag]')) expect(tag.style.opacity).toBe('0');
    const photos = [...section.querySelectorAll<HTMLElement>('[data-hoist-photo]')];
    expect(photos[1].style.clipPath).toContain('inset(100%');
    dispose();
    expect([...section.querySelectorAll('[data-counter]')].map((c) => c.textContent)).toEqual(['55', '60', '200', '250', '317.5']);
  });

  it('never touches the screen-reader twin of a counter', async () => {
    const { section } = await renderHoist('ar');
    const twins = () => [...section.querySelectorAll('[data-counter] + .sr-only')].map((el) => el.outerHTML);
    const before = twins();
    const dispose = hoistDesktop(section, 'ar', true);
    expect(twins()).toEqual(before);
    dispose();
    expect(twins()).toEqual(before);
  });

  it('leaves the progress links without aria-current once it stops', async () => {
    const { section } = await renderHoist('ar');
    hoistDesktop(section, 'ar', true)();
    expect(section.querySelector('[aria-current]')).toBeNull();
  });

  it('puts the DOM back exactly as React rendered it, listeners included', async () => {
    for (const lang of ['ar', 'en'] as const) {
      const { section, html } = await renderHoist(lang);
      const dispose = hoistDesktop(section, lang, lang === 'ar');
      expect(section.outerHTML).not.toBe(html);
      dispose();
      expect(section.outerHTML).toBe(html);
      for (const type of ['scrollEnd', 'refreshInit']) {
        const added = st.addEventListener.mock.calls.filter(([t]) => t === type).map(([, f]) => f);
        const removed = st.removeEventListener.mock.calls.filter(([t]) => t === type).map(([, f]) => f);
        expect(removed).toEqual(added);
      }
      Object.values(st).forEach((fn) => fn.mockClear());
    }
  });
});

describe('hoistTouch (the load stack)', () => {
  /** Card tops in px from the top of a 900 px viewport. */
  function place(section: HTMLElement, tops: number[]) {
    section.querySelectorAll('[data-hoist-item]').forEach((item, i) => {
      vi.spyOn(item, 'getBoundingClientRect').mockReturnValue({ top: tops[i], bottom: tops[i] + 600 } as DOMRect);
    });
  }
  const finishAll = () => gsap.globalTimeline.getChildren(false, false, true).forEach((t) => t.progress(1));
  const counters = (section: HTMLElement) => [...section.querySelectorAll('[data-counter]')].map((c) => c.textContent);

  it('leaves cards already on screen exactly as rendered, and arms one "top 88%" trigger per card below', async () => {
    const { section } = await renderHoist('en');
    const items = [...section.querySelectorAll<HTMLElement>('[data-hoist-item]')];
    const before = items.map((el) => el.outerHTML);
    place(section, [100, 850, 1200, 1900, 2600]); // the second card's top is on screen, just above the bottom edge
    const dispose = hoistTouch(section, 'en');
    expect(items[0].outerHTML).toBe(before[0]);
    expect(items[1].outerHTML).toBe(before[1]);
    expect(items[2].outerHTML).not.toBe(before[2]);
    expect(st.create).toHaveBeenCalledTimes(3);
    expect(st.create.mock.calls.map(([vars]) => [vars.trigger, vars.start, vars.once])).toEqual(items.slice(2).map((el) => [el, 'top 88%', true]));
    dispose();
    expect(items.map((el) => el.outerHTML)).toEqual(before);
  });

  it('plays each card once and comes to rest on the exact rating with React\'s own DOM', async () => {
    const { section, html } = await renderHoist('en');
    place(section, [1000, 1700, 2400, 3100, 3800]);
    const dispose = hoistTouch(section, 'en');
    expect(counters(section)).toEqual(['0', '55', '60', '200', '250']); // waiting at the previous rating
    const tag = section.querySelectorAll<HTMLElement>('[data-load-tag]')[4];
    expect(tag.style.transform).not.toBe(''); // waits 16 px low, transparent: the shared "rise"
    expect(tag.style.opacity).toBe('0');
    expect(section.querySelectorAll<HTMLElement>('[data-hoist-photo]')[4].style.clipPath).toContain('inset(100%');
    for (const [vars] of st.create.mock.calls) vars.onEnter();
    finishAll();
    expect(counters(section)).toEqual(['55', '60', '200', '250', '317.5']);
    expect(section.outerHTML).toBe(html);
    dispose();
    expect(section.outerHTML).toBe(html);
  });

  it('puts everything back when it stops before a card has played', async () => {
    const { section, html } = await renderHoist('ar');
    place(section, [1000, 1700, 2400, 3100, 3800]);
    hoistTouch(section, 'ar')();
    expect(section.outerHTML).toBe(html);
  });
});

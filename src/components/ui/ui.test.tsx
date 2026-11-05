// @vitest-environment jsdom
import { act, useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { buttonClass } from '@/components/Button';
import { click, mount, renderHtml } from '@/test/render';
import {
  BentoGrid,
  BentoTile,
  Card,
  Carousel,
  Chip,
  CompareTable,
  Field,
  Marquee,
  Reveal,
  Section,
  SectionHeader,
  SegmentedControl,
  Sheet,
  SpecList,
  Stat,
  StickyStory,
  Tabs,
  ToggleChip,
  pageStep,
  readingOffset,
  reveal,
  sheetTrigger,
  tabStep,
  invert,
  useFlip,
} from './index';

const key = (el: Element | null, k: string) =>
  act(async () => {
    el?.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
  });

describe('Section and SectionHeader', () => {
  it('sets surface class, data-surface and the ground that drives focus/selection colours', () => {
    const html = renderHtml(
      <Section id="s" surface="night">
        <p>x</p>
      </Section>,
    );
    const s = html.querySelector('section#s');
    expect(s?.className).toContain('surface-night');
    expect(s?.getAttribute('data-ground')).toBe('dark');
    expect(s?.querySelector('.shell > p')).not.toBeNull();
    expect(renderHtml(<Section surface="mist">x</Section>).firstElementChild?.getAttribute('data-ground')).toBe('light');
  });

  it('renders the heading first (no eyebrow slot) with a muted continuation and a lead', () => {
    const html = renderHtml(<SectionHeader id="h" title="Cranes." continuation="From 55 t to 317.5 t." lead="Pick one." />, 'en');
    const h2 = html.querySelector('h2#h');
    expect(h2?.previousElementSibling).toBeNull();
    expect(h2?.querySelector('.t-muted')?.textContent).toBe('From 55 t to 317.5 t.');
    expect(html.querySelector('p.t-sub')?.textContent).toBe('Pick one.');
  });
});

describe('Card and Bento', () => {
  it('marks tone and interactivity, and clips full-bleed media to the card', () => {
    const html = renderHtml(
      <Card as="article" tone="outline" interactive media={<img alt="" src="x.jpg" />}>
        <h3>GMK6350</h3>
      </Card>,
    );
    const card = html.querySelector('article');
    expect(card?.getAttribute('data-tone')).toBe('outline');
    expect(card?.hasAttribute('data-interactive')).toBe(true);
    expect(card?.className).toContain('overflow-clip');
  });

  it('lays tiles out by named span and gives dark tiles a dark ground', () => {
    const html = renderHtml(
      <BentoGrid as="ul">
        <BentoTile as="li" span="two-thirds" rows={2} tone="night">
          a
        </BentoTile>
        <BentoTile as="li" tone="tile">
          b
        </BentoTile>
      </BentoGrid>,
    );
    const [a, b] = [...html.querySelectorAll('li')];
    expect(a?.getAttribute('data-span')).toBe('two-thirds');
    expect(a?.getAttribute('data-rows')).toBe('2');
    expect(a?.getAttribute('data-ground')).toBe('dark');
    expect(b?.getAttribute('data-ground')).toBe('light');
    expect(html.querySelector('ul.ui-bento__grid')).not.toBeNull();
  });
});

describe('SegmentedControl', () => {
  const options = [
    { value: 'rt700e', label: 'RT700E' },
    { value: 'gmk6350', label: 'GMK6350' },
  ] as const;

  it('is a labelled radio group of native radios with one checked', () => {
    const html = renderHtml(<SegmentedControl name="crane" label="Crane" options={options} value="gmk6350" onChange={() => {}} />);
    const group = html.querySelector('[role="radiogroup"]');
    expect(group?.getAttribute('aria-label')).toBe('Crane');
    const radios = [...html.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    expect(radios.map((r) => r.name)).toEqual(['crane', 'crane']);
    expect(radios.filter((r) => r.checked).map((r) => r.value)).toEqual(['gmk6350']);
    expect(html.querySelector('.ui-seg__thumb')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('reports the chosen value', async () => {
    function Host() {
      const [v, setV] = useState<'rt700e' | 'gmk6350'>('rt700e');
      return <SegmentedControl name="c2" label="Crane" options={options} value={v} onChange={setV} />;
    }
    const { host, unmount } = await mount(<Host />);
    await click(host.querySelectorAll('input')[1] ?? null);
    expect(host.querySelector<HTMLInputElement>('input:checked')?.value).toBe('gmk6350');
    await unmount();
  });
});

describe('Tabs', () => {
  const items = [
    { id: 'overview', label: 'Overview', panel: <p>o</p> },
    { id: 'specs', label: 'Specs', panel: <p>s</p> },
    { id: 'photos', label: 'Photos', panel: <p>p</p> },
  ];

  it('prerenders every panel, wires tab/panel ids and marks inactive panels', () => {
    const html = renderHtml(<Tabs items={items} label="Crane details" />);
    const tabs = [...html.querySelectorAll('[role="tab"]')];
    const panels = [...html.querySelectorAll('[role="tabpanel"]')];
    expect(html.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe('Crane details');
    expect(panels).toHaveLength(3);
    tabs.forEach((tab, i) => {
      expect(tab.getAttribute('aria-controls')).toBe(panels[i]?.id);
      expect(panels[i]?.getAttribute('aria-labelledby')).toBe(tab.id);
    });
    expect(tabs.map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    expect(panels.map((p) => p.hasAttribute('data-inactive'))).toEqual([false, true, true]);
  });

  it('moves with arrows in reading direction, plus Home and End', async () => {
    expect(tabStep('ArrowLeft', 'rtl')).toBe(1);
    expect(tabStep('ArrowRight', 'ltr')).toBe(1);
    const { host, unmount } = await mount(<Tabs items={items} label="x" />, 'ar');
    const tabs = () => [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    await key(tabs()[0] ?? null, 'ArrowLeft'); // RTL: left = next
    expect(tabs()[1]?.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs()[1]);
    await key(tabs()[1] ?? null, 'End');
    expect(tabs()[2]?.getAttribute('aria-selected')).toBe('true');
    await key(tabs()[2] ?? null, 'Home');
    expect(tabs()[0]?.getAttribute('aria-selected')).toBe('true');
    expect(host.querySelectorAll('[role="tabpanel"][data-inactive]')).toHaveLength(2);
    await unmount();
  });
});

describe('Sheet', () => {
  it('is a labelled modal dialog with an invoker-ready trigger and a named close button', () => {
    const html = renderHtml(
      <>
        <button type="button" {...sheetTrigger('sheet-gmk')}>
          Details
        </button>
        <Sheet id="sheet-gmk" title="Grove GMK6350">
          <p>body</p>
        </Sheet>
      </>,
      'en',
    );
    const dialog = html.querySelector('dialog#sheet-gmk');
    const title = html.querySelector(`#${CSS.escape(dialog?.getAttribute('aria-labelledby') ?? '')}`);
    expect(title?.textContent).toBe('Grove GMK6350');
    expect(dialog?.getAttribute('closedby')).toBe('any');
    const trigger = html.querySelector('button[aria-haspopup="dialog"]');
    expect(trigger?.getAttribute('commandfor')).toBe('sheet-gmk');
    expect(trigger?.getAttribute('command')).toBe('show-modal');
    expect(dialog?.querySelector('button[command="close"]')?.textContent).toBe('Close');
  });

  it('opens through the click fallback where invokers are missing', async () => {
    const showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    const proto = HTMLDialogElement.prototype as unknown as { showModal: () => void };
    const original = proto.showModal;
    proto.showModal = showModal;
    const { host, unmount } = await mount(
      <>
        <button type="button" {...sheetTrigger('s2')}>
          Open
        </button>
        <Sheet id="s2" title="T">
          x
        </Sheet>
      </>,
    );
    await click(host.querySelector('button[aria-haspopup]'));
    expect(showModal).toHaveBeenCalledTimes(1);
    proto.showModal = original;
    await unmount();
  });
});

describe('SpecList and CompareTable', () => {
  it('renders a description list with units and isolated Latin values', () => {
    const html = renderHtml(
      <SpecList
        items={[
          { id: 'cap', label: 'أقصى حمولة', value: '317.5', unit: 'طن' },
          { id: 'engine', label: 'المحرك', value: 'Mercedes-Benz OM502LA', latin: true },
        ]}
      />,
    );
    expect(html.querySelectorAll('dl > div > dt')).toHaveLength(2);
    expect(html.querySelector('dd')?.textContent).toBe('317.5 طن');
    expect(html.querySelector('bdi[lang="en"]')?.textContent).toBe('Mercedes-Benz OM502LA');
  });

  it('is a captioned table in a focusable, labelled scroll region with sr text for empty cells', () => {
    const html = renderHtml(
      <CompareTable
        caption="Manufacturer specification"
        name="Crane comparison"
        columns={[
          { id: 'a', header: 'RT700E' },
          { id: 'b', header: 'GMK6350', highlight: true },
        ]}
        rows={[{ id: 'tip', label: 'Max tip height', cells: { a: { value: '36.4', unit: 'm' }, b: null } }]}
      />,
      'en',
    );
    const region = html.querySelector('[role="region"]');
    expect(region?.getAttribute('tabindex')).toBe('0');
    expect(region?.getAttribute('aria-label')).toBe('Crane comparison, scrolls sideways');
    expect(html.querySelector('caption')?.textContent).toBe('Manufacturer specification');
    expect([...html.querySelectorAll('thead th')].map((th) => th.getAttribute('scope'))).toEqual(['col', 'col', 'col']);
    expect(html.querySelector('tbody th')?.getAttribute('scope')).toBe('row');
    const empty = html.querySelector('td[data-empty]');
    expect(empty?.hasAttribute('data-highlight')).toBe(true);
    expect(empty?.querySelector('.sr-only')?.textContent).toBe('Not stated');
  });
});

describe('Carousel', () => {
  it('labels the region and each slide, and starts with Previous disabled', () => {
    const html = renderHtml(<Carousel label="On site" slides={[<p key="1">1</p>, <p key="2">2</p>, <p key="3">3</p>]} />, 'en');
    const region = html.querySelector('[role="region"]');
    expect(region?.getAttribute('aria-roledescription')).toBe('carousel');
    expect([...html.querySelectorAll('li[role="group"]')].map((li) => li.getAttribute('aria-label'))).toEqual(['1 of 3', '2 of 3', '3 of 3']);
    expect(html.querySelector('ul')?.getAttribute('tabindex')).toBe('0');
    const [prev, next] = [...html.querySelectorAll('.ui-carousel__controls button')];
    expect(prev?.getAttribute('aria-disabled')).toBe('true');
    expect(next?.hasAttribute('aria-disabled')).toBe(false);
    expect(prev?.textContent).toBe('Previous');
  });

  it('pages by whole slides and measures position along the reading direction', () => {
    expect(pageStep(1000, 300, 20)).toBe(960); // 3 slides of 320
    expect(pageStep(250, 300, 20)).toBe(320); // at least one
    expect(readingOffset(-420)).toBe(420); // RTL scrollLeft is negative
  });

  it('scrolls toward negative scrollLeft for Next in Arabic', async () => {
    const { host, unmount } = await mount(<Carousel label="x" slides={['a', 'b', 'c']} />, 'ar');
    const track = host.querySelector('ul') as HTMLUListElement;
    const scrollBy = vi.fn();
    track.scrollBy = scrollBy as unknown as typeof track.scrollBy;
    Object.defineProperty(track, 'clientWidth', { value: 300, configurable: true });
    Object.defineProperty(track, 'scrollWidth', { value: 900, configurable: true });
    Object.defineProperty(track.firstElementChild, 'offsetWidth', { value: 300, configurable: true });
    await act(async () => {
      track.dispatchEvent(new Event('scroll'));
    });
    await click(host.querySelectorAll('.ui-carousel__controls button')[1] ?? null);
    expect(scrollBy.mock.calls[0]?.[0]?.left).toBeLessThan(0);
    await unmount();
  });
});

describe('Marquee', () => {
  it('renders a labelled strip with an inert aria-hidden copy and no autoplay control (scroll-driven, no loop)', () => {
    const html = renderHtml(<Marquee label="Cranes" items={['RT700E · 55 t', 'GMK6350 · 317.5 t']} repeat={2} />, 'en');
    const lists = html.querySelectorAll('ul');
    expect(html.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Cranes');
    expect(lists).toHaveLength(2);
    expect(lists[0]?.querySelectorAll('li')).toHaveLength(4);
    expect(lists[1]?.getAttribute('aria-hidden')).toBe('true');
    expect(lists[1]?.hasAttribute('inert')).toBe(true);
    expect(html.querySelector('button')).toBeNull();
  });
});

describe('Stat, Chip, Field, Reveal', () => {
  it('Stat: aria-hidden digits, sr-only final value, ticker attributes only when asked, draft badge when unverified', () => {
    const html = renderHtml(<Stat value={317.5} unit="t" label="Max capacity" from={0} decimals={1} verified={false} />, 'en');
    const digits = html.querySelector('[data-ticker]');
    expect(digits?.getAttribute('aria-hidden')).toBe('true');
    expect(digits?.textContent).toBe('317.5');
    expect(digits?.getAttribute('data-ticker-from')).toBe('0');
    expect(html.querySelector('.sr-only')?.textContent).toBe('317.5 t');
    expect(html.querySelector('[data-testid="draft-badge"]')).not.toBeNull();
    expect(renderHtml(<Stat value={3} label="Types" />).querySelector('[data-ticker]')).toBeNull();
  });

  it('Chip is static; ToggleChip is a pressed-state button', async () => {
    expect(renderHtml(<Chip>Crawler</Chip>).querySelector('span.ui-chip')).not.toBeNull();
    function Host() {
      const [on, setOn] = useState(false);
      return (
        <ToggleChip pressed={on} onPressedChange={setOn}>
          Crawler
        </ToggleChip>
      );
    }
    const { host, unmount } = await mount(<Host />);
    await click(host.querySelector('button'));
    expect(host.querySelector('button')?.getAttribute('aria-pressed')).toBe('true');
    await unmount();
  });

  it('Field wires label, hint, error and aria-invalid', () => {
    const html = renderHtml(
      <Field label="Load weight" hint="A rough figure is fine." error="Enter a number." required tag="Required">
        {(p) => <input {...p} inputMode="decimal" />}
      </Field>,
      'en',
    );
    const input = html.querySelector('input');
    expect(html.querySelector('label')?.getAttribute('for')).toBe(input?.id);
    const described = input?.getAttribute('aria-describedby')?.split(' ') ?? [];
    expect(described.map((id) => html.querySelector(`#${CSS.escape(id)}`)?.textContent)).toEqual(['A rough figure is fine.', 'Enter a number.']);
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-required')).toBe('true');
    expect(input?.className).toBe('ui-field__control');
  });

  it('Reveal speaks the motion vocabulary through data attributes', () => {
    expect(reveal('stagger')).toEqual({ 'data-reveal': 'stagger' });
    expect(reveal('rise', 120)).toEqual({ 'data-reveal': 'rise', 'data-reveal-delay': '120' });
    expect(renderHtml(<Reveal kind="mask" as="figure">x</Reveal>).querySelector('figure')?.getAttribute('data-reveal')).toBe('mask');
  });
});

describe('Button v2', () => {
  it('keeps v1 variant names as aliases of the v2 looks', () => {
    expect(buttonClass('primary-red')).toBe(buttonClass('primary'));
    expect(buttonClass('outline-on-dark')).toBe(buttonClass('ghost-dark'));
    expect(buttonClass('outline-on-light', 'md', '', true)).toBe(buttonClass('ghost-light', 'md', '', true));
  });

  it('is a pill with a 44 px minimum even at size sm', () => {
    const cls = buttonClass('secondary', 'sm');
    expect(cls).toContain('rounded-full');
    expect(cls).toContain('min-h-11');
  });
});

describe('StickyStory and useFlip', () => {
  it('renders an ordered, labelled step list with inline media and an aria-hidden sticky stage', () => {
    const html = renderHtml(
      <StickyStory
        label="How a request works"
        steps={[
          { id: 'a', media: <img alt="" src="a.jpg" />, content: <p>Send the load</p> },
          { id: 'b', media: <img alt="" src="b.jpg" />, content: <p>We suggest a crane</p> },
        ]}
      />,
      'en',
    );
    expect(html.querySelector('ol')?.getAttribute('aria-label')).toBe('How a request works');
    const steps = [...html.querySelectorAll('li[data-step]')];
    expect(steps.map((s) => s.hasAttribute('data-active'))).toEqual([true, false]);
    expect(html.querySelector('.ui-story__stage')?.getAttribute('aria-hidden')).toBe('true');
    expect(html.querySelectorAll('.ui-story__frame')).toHaveLength(2);
  });

  it('inverts from the old position and skips tiny moves', () => {
    expect(invert({ left: 100, top: 40 }, { left: 20, top: 40 })).toBe('translate(80px, 0px)');
    expect(invert({ left: 10, top: 10 }, { left: 10.2, top: 10 })).toBeNull();
  });

  it('animates kept items from their old place when the key changes', async () => {
    const calls: string[] = [];
    function List({ ids }: { ids: string[] }) {
      const ref = useRef<HTMLUListElement>(null);
      useFlip(ref, ids.join());
      return (
        <ul ref={ref}>
          {ids.map((id) => (
            <li key={id} data-flip-id={id}>
              {id}
            </li>
          ))}
        </ul>
      );
    }
    const proto = HTMLElement.prototype as unknown as { animate?: unknown; getBoundingClientRect: () => DOMRect };
    const originalRect = proto.getBoundingClientRect;
    let offset = 0;
    proto.animate = function (this: HTMLElement) {
      calls.push(this.dataset.flipId ?? '');
      return {} as Animation;
    };
    proto.getBoundingClientRect = function (this: HTMLElement) {
      const i = [...(this.parentElement?.children ?? [])].indexOf(this);
      return { left: 0, top: i * 50 + offset, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    };
    window.matchMedia ??= ((q: string) => ({ matches: false, media: q }) as MediaQueryList);
    function Host() {
      const [ids, setIds] = useState(['a', 'b', 'c']);
      return (
        <>
          <button type="button" onClick={() => setIds(['c', 'a'])}>
            go
          </button>
          <List ids={ids} />
        </>
      );
    }
    const { host, unmount } = await mount(<Host />);
    offset = 0;
    await click(host.querySelector('button'));
    expect(calls.sort()).toEqual(['a', 'c']); // b left; a and c moved
    proto.getBoundingClientRect = originalRect;
    delete proto.animate;
    await unmount();
  });
});

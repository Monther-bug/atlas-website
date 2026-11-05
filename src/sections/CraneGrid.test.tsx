// @vitest-environment jsdom
import { act, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCopy } from '@/content/all';
import { visibleCranes } from '@/content';
import { craneListCopy } from '@/content/crane-list-copy';
import type { Crane } from '@/content/types';
import { HOOK_EVENT, getRequestedCrane, setRequestedCrane, type HookEventDetail } from '@/lib/request';
import { changeValue, click, mount, renderHtml } from '@/test/render';
import { CraneGrid, CraneGridView } from './CraneGrid';
import { compareStore } from './crane-list/compare-store';
// Render the lineup's islands statically, as the prerender does (crane-list/island-registry.ts).
import './crane-list/server-islands';
import { loadStore } from './crane-list/load';
import { LineupShell } from './crane-list/LineupShell';

const trackMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/analytics', () => ({ track: trackMock }));

const unverified: Crane[] = visibleCranes.map((c) => ({ ...c, verified: false }));
const verified: Crane[] = visibleCranes.map((c) => ({ ...c, verified: true }));

// jsdom has no modal dialogs: open/close by the attribute, as Header.test does.
const realShowModal = HTMLDialogElement.prototype.showModal;
const realClose = HTMLDialogElement.prototype.close;
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

afterEach(() => {
  HTMLDialogElement.prototype.showModal = realShowModal;
  HTMLDialogElement.prototype.close = realClose;
  setRequestedCrane(null);
  loadStore.set('');
  compareStore.set(null);
  trackMock.mockClear();
});

/** Presses Details and waits for the lazy sheet chunk to render and open itself. */
async function openSheet(host: Element, id: string): Promise<HTMLDialogElement> {
  await click(host.querySelector(`button[data-details][data-crane="${id}"]`));
  for (let i = 0; i < 100; i++) {
    const dialog = host.querySelector<HTMLDialogElement>('dialog#crane-sheet');
    if (dialog?.open && dialog.querySelector('h2')?.textContent?.includes(id === 'gmk6350' ? 'GMK6350' : '')) return dialog;
    await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
  }
  throw new Error(`sheet for ${id} did not open`);
}

const chipValues = (root: Element) =>
  [...root.querySelectorAll('button[data-testid="filter-chip"]')].map((chip) => chip.getAttribute('data-value'));

describe('LineupShell (browser side)', () => {
  it('keeps the prerendered section: same attributes, innerHTML left to the server HTML', () => {
    const html = renderHtml(<LineupShell cranes={unverified} />, 'ar');
    const section = html.querySelector('section#crane-list');
    expect(section?.getAttribute('aria-labelledby')).toBe('grid-title');
    expect(section?.className).toBe('surface-mist crane-list');
    expect(section?.innerHTML).toBe('');
  });
});

describe('CraneGrid', () => {
  it('renders the visible cranes (smoke)', () => {
    const html = renderHtml(<CraneGrid />, 'ar');
    expect(html.querySelectorAll('article[data-testid="crane-card"]')).toHaveLength(visibleCranes.length);
  });
});

describe('CraneGridView', () => {
  it('renders one card per crane with the C9 attributes', () => {
    const html = renderHtml(<CraneGridView cranes={unverified} />, 'ar');
    expect(html.querySelector('section#crane-list [data-crane-grid]')).not.toBeNull();
    const cards = [...html.querySelectorAll('article[data-testid="crane-card"]')];
    expect(cards.map((card) => card.getAttribute('data-crane'))).toEqual(['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350']);
    const button = cards[4]?.querySelector('button[data-testid="request-crane-button"]');
    expect(button?.getAttribute('data-crane')).toBe('gmk6350');
    expect(cards[4]?.querySelector('h3 bdi')?.textContent).toBe('Grove GMK6350');
  });

  it('shows type chips only while capacities are unverified', () => {
    const chips = [...renderHtml(<CraneGridView cranes={unverified} />, 'en').querySelectorAll('button[data-testid="filter-chip"]')];
    expect(chips.map((chip) => [chip.getAttribute('data-value'), chip.getAttribute('aria-pressed')])).toEqual([
      ['all', 'true'],
      ['rough-terrain', 'false'],
      ['all-terrain', 'false'],
      ['crawler', 'false'],
    ]);
  });

  it('shows band chips once every crane is verified', () => {
    expect(chipValues(renderHtml(<CraneGridView cranes={verified} />, 'en'))).toEqual([
      'all', 'rough-terrain', 'all-terrain', 'crawler', 'band:0-60', 'band:61-200', 'band:201+',
    ]);
  });

  it('filters by type and announces the new count', async () => {
    const { host, unmount } = await mount(<CraneGridView cranes={unverified} />, 'ar');
    const chip = host.querySelector('[data-testid="filter-chip"][data-value="crawler"]');
    await click(chip);
    expect(host.querySelectorAll('[data-testid="crane-card"]')).toHaveLength(1);
    expect(chip?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('[data-testid="filter-chip"][data-value="all"]')?.getAttribute('aria-pressed')).toBe('false');
    expect(host.querySelector('[aria-live="polite"]')?.textContent).toBe('رافعة واحدة');
    await unmount();
  });

  it('tracks filter_use once and ignores a re-click on the active chip', async () => {
    const { host, unmount } = await mount(<CraneGridView cranes={unverified} />, 'en');
    const chip = host.querySelector('[data-testid="filter-chip"][data-value="crawler"]');
    await click(chip);
    await click(chip);
    expect(chip?.getAttribute('aria-pressed')).toBe('true');
    expect(trackMock.mock.calls.filter(([event]) => event === 'filter_use')).toHaveLength(1);
    await unmount();
  });

  it('replaces the announced node on each change, even when the count is the same', async () => {
    const { host, unmount } = await mount(<CraneGridView cranes={unverified} />, 'en');
    await click(host.querySelector('[data-value="crawler"]'));
    const before = host.querySelector('[aria-live="polite"] span');
    expect(before?.textContent).toBe('1 crane');
    // rough-terrain also has exactly one crane
    await click(host.querySelector('[data-value="rough-terrain"]'));
    const after = host.querySelector('[aria-live="polite"] span');
    expect(after?.textContent).toBe('1 crane');
    expect(after).not.toBe(before);
    await unmount();
  });

  it('shows the empty message when there are no cranes', async () => {
    const { host, unmount } = await mount(<CraneGridView cranes={[]} />, 'en');
    expect(host.querySelector('[aria-live="polite"]')?.textContent).toBe(getCopy('en').grid.empty);
    expect(host.querySelectorAll('[data-testid="crane-card"]')).toHaveLength(0);
    await unmount();
  });

  it('Show all resets the filter, restores the cards and focuses the count', async () => {
    let setList: (list: Crane[]) => void = () => {};
    function Harness() {
      const [list, set] = useState<Crane[]>(unverified);
      setList = set;
      return <CraneGridView cranes={list} />;
    }
    const { host, unmount } = await mount(<Harness />, 'en');
    await click(host.querySelector('[data-value="crawler"]'));
    await act(async () => setList(unverified.filter((c) => c.type !== 'crawler')));
    const live = host.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe(getCopy('en').grid.empty);
    expect(host.querySelectorAll('[data-testid="crane-card"]')).toHaveLength(0);
    const showAll = host.querySelector('[data-crane-grid] button');
    expect(showAll?.textContent).toBe(getCopy('en').grid.showAll);
    await click(showAll);
    expect(host.querySelector('[data-value="all"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelectorAll('[data-testid="crane-card"]')).toHaveLength(4);
    expect(document.activeElement).toBe(live);
    expect(live?.getAttribute('tabindex')).toBe('-1');
    await unmount();
  });

  it('gives every card action a distinct name', () => {
    const html = renderHtml(<CraneGridView cranes={unverified} />, 'en');
    const names = (selector: string) => [...html.querySelectorAll(selector)].map((el) => el.textContent);
    const buttons = names('button[data-testid="request-crane-button"]');
    expect(new Set(buttons).size).toBe(5);
    expect(buttons[4]).toContain('Grove GMK6350');
    const details = names('button[data-details]');
    expect(new Set(details).size).toBe(5);
    expect(details[0]).toBe('Details: Grove RT700E');
    expect(html.querySelector('button[data-testid="request-crane-button"]')?.hasAttribute('aria-describedby')).toBe(false);
  });

  it('labels capacities as manufacturer ratings and shows three key specs per card', () => {
    const html = renderHtml(<CraneGridView cranes={unverified} />, 'ar');
    const gmk = html.querySelector('[data-testid="crane-card"][data-crane="gmk6350"]');
    expect(gmk?.querySelector('[data-lineup-ticker]')?.textContent).toBe('317.5');
    expect(gmk?.textContent).toContain('على نصف قطر 2.44\u00A0م');
    expect(gmk?.textContent).toContain('تصنيف الشركة المصنّعة');
    expect(gmk?.querySelector('[data-testid="draft-badge"]')).not.toBeNull();
    expect([...(gmk?.querySelectorAll('dl dd') ?? [])].map((dd) => dd.textContent)).toEqual(['60\u00A0م', '61\u00A0م', '100\u00A0طن']);
    // QUY250: two key specs come from a spec database, so they carry the * mark and the card says what it means.
    const quy = html.querySelector('[data-testid="crane-card"][data-crane="quy250"]');
    expect(quy?.querySelectorAll('dl dd [aria-hidden="true"]')).toHaveLength(2);
    expect(quy?.textContent).toContain('من قاعدة بيانات مواصفات');
  });

  it('opens the detail sheet for the chosen crane, with the grouped manufacturer specification', async () => {
    const { host, unmount } = await mount(<CraneGridView cranes={unverified} />, 'en');
    const dialog = await openSheet(host, 'gmk6350');
    expect(dialog.open).toBe(true);
    expect(dialog?.querySelector('h2')?.textContent).toBe('Grove GMK6350');
    expect([...(dialog?.querySelectorAll('h4') ?? [])].map((h) => h.textContent)).toEqual([
      'Lifting',
      'Boom and jib',
      'Carrier',
      'Engine and travel',
      'Dimensions and weights',
      'Where the figures come from',
    ]);
    expect(dialog?.textContent).toContain('Manufacturer specification');
    expect(dialog?.textContent).toContain(craneListCopy.en.capacityNotes.gmk6350);
    expect(dialog?.querySelector('[data-testid="sheet-whatsapp"]')?.getAttribute('href')).toContain(encodeURIComponent('Grove GMK6350 (All-terrain)'));
    await unmount();
  });

  it('requests from the sheet: closes it and rides from the card button', async () => {
    const { host, unmount } = await mount(<CraneGridView cranes={unverified} />, 'en');
    const seen: HookEventDetail[] = [];
    const onHook = (event: Event) => seen.push((event as CustomEvent<HookEventDetail>).detail);
    window.addEventListener(HOOK_EVENT, onHook);
    await openSheet(host, 'quy250');
    await click(host.querySelector('[data-testid="sheet-request"]'));
    window.removeEventListener(HOOK_EVENT, onHook);
    expect(getRequestedCrane()).toBe('quy250');
    expect(host.querySelector<HTMLDialogElement>('dialog#crane-sheet')?.open).toBe(false);
    expect(seen).toHaveLength(1);
    expect(seen[0]?.craneId).toBe('quy250');
    expect(trackMock).toHaveBeenCalledWith('request_crane', { crane_id: 'quy250', location: 'sheet' });
    expect(host.querySelector('[data-testid="crane-card"][data-crane="quy250"]')?.hasAttribute('data-on-hook')).toBe(true);
    await unmount();
  });

  it('checks a load typed in Arabic-Indic digits against the maximum ratings', async () => {
    vi.useFakeTimers();
    const { host, unmount } = await mount(<CraneGridView cranes={unverified} />, 'ar');
    await changeValue(host.querySelector('input[name="load-check"]'), '١٢٠');
    const fit = (id: string) => host.querySelector(`[data-testid="crane-card"][data-crane="${id}"]`)?.getAttribute('data-fit');
    expect(['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350'].map(fit)).toEqual(['no', 'no', 'yes', 'yes', 'yes']);
    expect(host.textContent).toContain('مصنّفة لحمولة 120\u00A0طن أو أكثر على أقصر نصف قطر');
    await act(async () => vi.advanceTimersByTime(500));
    expect(host.querySelector('.lineup-load__result')?.textContent).toBe('3 طرازات تصنيفها الأقصى 120\u00A0طن أو أكثر.');
    // The caveat is always on screen, not only after typing.
    expect(host.querySelector('.lineup-load__caveat')?.textContent).toBe(craneListCopy.ar.load.caveat);
    await changeValue(host.querySelector('input[name="load-check"]'), 'abc');
    expect(host.querySelector('input[name="load-check"]')?.getAttribute('aria-invalid')).toBe('true');
    expect(fit('gmk6350')).toBeNull();
    await unmount();
    vi.useRealTimers();
  });

  it('compares one to three models; unpicked columns stay in the markup for no-JS', async () => {
    const html = renderHtml(<CraneGridView cranes={unverified} />, 'en');
    const heads = [...html.querySelectorAll('table thead th[data-col]')];
    expect(heads.map((th) => th.getAttribute('data-col'))).toEqual(['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350']);
    expect(heads.filter((th) => !th.hasAttribute('data-off')).map((th) => th.getAttribute('data-col'))).toEqual(['rt700e', 'ac200-1', 'gmk6350']);
    // Every row has a header cell; missing figures say so to screen readers.
    expect(html.querySelectorAll('table tbody th[scope="row"]').length).toBeGreaterThan(15);
    expect(html.querySelector('td[data-empty] .sr-only')?.textContent).toBe('Not stated by the manufacturer');
    expect(html.textContent).not.toContain('\u00D7');

    const { host, unmount } = await mount(<CraneGridView cranes={unverified} />, 'en');
    const pick = (id: string) => host.querySelector(`[data-testid="compare-pick"][data-crane="${id}"]`);
    const status = () => host.querySelector('.lineup-compare__status')?.textContent;
    expect(status()).toBe(''); // nothing to say before a change
    await click(pick('quy250')); // full: the oldest pick (rt700e) makes room, and the status says so
    expect(pick('quy250')?.getAttribute('aria-pressed')).toBe('true');
    expect(pick('rt700e')?.getAttribute('aria-pressed')).toBe('false');
    expect(status()).toBe(craneListCopy.en.compare.limit);
    const on = [...host.querySelectorAll('table thead th[data-col]:not([data-off])')].map((th) => th.getAttribute('data-col'));
    expect(on).toEqual(['ac200-1', 'quy250', 'gmk6350']);
    // Each model column offers the request, with a distinct name.
    const requests = [...host.querySelectorAll('.lineup-table__request')].map((b) => b.textContent);
    expect(new Set(requests).size).toBe(5);
    // Rows no picked model has are hidden; track width only exists for the crawler.
    const trackRow = [...host.querySelectorAll('table tbody tr')].find((tr) => tr.textContent?.startsWith('Track width'));
    expect(trackRow?.hasAttribute('data-off')).toBe(false);
    await click(pick('quy250'));
    expect(trackRow?.hasAttribute('data-off')).toBe(true);
    await unmount();
  });

  it('adds a model to the comparison from its sheet', async () => {
    const { host, unmount } = await mount(<CraneGridView cranes={unverified} />, 'en');
    await openSheet(host, 'atf60-3');
    const link = host.querySelector('dialog#crane-sheet a[href="#crane-compare"]');
    link?.addEventListener('click', (e) => e.preventDefault());
    await click(link);
    expect(host.querySelector('[data-testid="compare-pick"][data-crane="atf60-3"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector<HTMLDialogElement>('dialog#crane-sheet')?.open).toBe(false);
    await unmount();
  });
});

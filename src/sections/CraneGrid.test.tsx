// @vitest-environment jsdom
import { act, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCopy } from '@/content/all';
import { visibleCranes } from '@/content';
import type { Crane } from '@/content/types';
import { HOOK_EVENT, getRequestedCrane, setRequestedCrane, type HookEventDetail } from '@/lib/request';
import { click, mount, renderHtml } from '@/test/render';
import { CraneGrid, CraneGridView } from './CraneGrid';

const trackMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/analytics', () => ({ track: trackMock }));

const unverified: Crane[] = visibleCranes.map((c) => ({ ...c, verified: false }));
const verified: Crane[] = visibleCranes.map((c) => ({ ...c, verified: true }));

afterEach(() => {
  setRequestedCrane(null);
  trackMock.mockClear();
});

const chipValues = (root: Element) =>
  [...root.querySelectorAll('button[data-testid="filter-chip"]')].map((chip) => chip.getAttribute('data-value'));

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

  it('gives each request button and form link a distinct name', () => {
    const html = renderHtml(<CraneGridView cranes={unverified} />, 'en');
    const names = (selector: string) => [...html.querySelectorAll(selector)].map((el) => el.textContent);
    const buttons = names('button[data-testid="request-crane-button"]');
    expect(new Set(buttons).size).toBe(5);
    expect(buttons[4]).toContain('Grove GMK6350');
    expect(new Set(names('article a[href="#request"]')).size).toBe(5);
    expect(html.querySelector('button[data-testid="request-crane-button"]')?.hasAttribute('aria-describedby')).toBe(false);
  });

  it('puts the crane on the hook and fires the hook event from the button', async () => {
    const { host, unmount } = await mount(<CraneGridView cranes={unverified} />, 'en');
    const seen: HookEventDetail[] = [];
    const onHook = (event: Event) => seen.push((event as CustomEvent<HookEventDetail>).detail);
    window.addEventListener(HOOK_EVENT, onHook);
    const button = host.querySelector('[data-testid="request-crane-button"][data-crane="gmk6350"]');
    await click(button);
    window.removeEventListener(HOOK_EVENT, onHook);
    expect(getRequestedCrane()).toBe('gmk6350');
    expect(seen).toEqual([{ craneId: 'gmk6350', source: button }]);
    expect(trackMock).toHaveBeenCalledWith('request_crane', { crane_id: 'gmk6350', location: 'card' });
    await unmount();
  });

  it('the form link behaves like the button', async () => {
    const { host, unmount } = await mount(<CraneGridView cranes={unverified} />, 'en');
    const seen: HookEventDetail[] = [];
    const onHook = (event: Event) => seen.push((event as CustomEvent<HookEventDetail>).detail);
    window.addEventListener(HOOK_EVENT, onHook);
    const link = host.querySelectorAll('article a[href="#request"]')[4];
    link?.addEventListener('click', (e) => e.preventDefault());
    await click(link ?? null);
    window.removeEventListener(HOOK_EVENT, onHook);
    expect(seen).toEqual([{ craneId: 'gmk6350', source: link }]);
    expect(trackMock).toHaveBeenCalledWith('request_crane', { crane_id: 'gmk6350', location: 'card-link' });
    await unmount();
  });
});

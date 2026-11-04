// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { HOOK_EVENT, getRequestedCrane, setRequestedCrane, useRequestedCrane, type HookEventDetail } from './request';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Probe() {
  return <span>{useRequestedCrane() ?? 'none'}</span>;
}

afterEach(() => setRequestedCrane(null));

describe('request store', () => {
  it('names the event atlas:hook', () => {
    expect(HOOK_EVENT).toBe('atlas:hook');
  });

  it('sets and clears the crane on the hook', () => {
    setRequestedCrane('gmk6350');
    expect(getRequestedCrane()).toBe('gmk6350');
    setRequestedCrane(null);
    expect(getRequestedCrane()).toBeNull();
  });

  it('dispatches atlas:hook with the crane and the source element', () => {
    const seen: HookEventDetail[] = [];
    const onHook = (event: Event) => seen.push((event as CustomEvent<HookEventDetail>).detail);
    window.addEventListener(HOOK_EVENT, onHook);
    const button = document.createElement('button');
    setRequestedCrane('quy250', button);
    setRequestedCrane(null);
    window.removeEventListener(HOOK_EVENT, onHook);
    expect(seen).toEqual([
      { craneId: 'quy250', source: button },
      { craneId: null, source: null },
    ]);
  });

  it('re-renders subscribers when the crane changes', async () => {
    const host = document.createElement('div');
    const root = createRoot(host);
    await act(async () => root.render(<Probe />));
    expect(host.textContent).toBe('none');
    await act(async () => setRequestedCrane('rt700e'));
    expect(host.textContent).toBe('rt700e');
    await act(async () => setRequestedCrane(null));
    expect(host.textContent).toBe('none');
    await act(async () => root.unmount());
  });

  it('renders null on the server', () => {
    setRequestedCrane('ac200-1');
    expect(renderToStaticMarkup(<Probe />)).toBe('<span>none</span>');
  });
});

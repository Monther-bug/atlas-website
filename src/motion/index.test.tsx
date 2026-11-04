// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@/test/render';
import { MOTION_QUERIES } from './mode';

const { startMotion, stopMotion } = vi.hoisted(() => {
  const stopMotion = vi.fn();
  return { stopMotion, startMotion: vi.fn(() => stopMotion) };
});
vi.mock('./core', () => ({ startMotion }));

import { useSiteMotion } from './index';

function Probe() {
  useSiteMotion();
  return null;
}

type Listener = (event: { matches: boolean }) => void;
let reduced = false;
const listeners = new Set<Listener>();
const queries: string[] = [];

beforeEach(() => {
  reduced = false;
  listeners.clear();
  queries.length = 0;
  startMotion.mockClear();
  startMotion.mockImplementation(() => stopMotion);
  stopMotion.mockClear();
  vi.stubGlobal('matchMedia', (query: string) => {
    queries.push(query);
    return {
      get matches() {
        return query === MOTION_QUERIES.reduced ? reduced : false;
      },
      media: query,
      addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
      removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
    };
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete document.documentElement.dataset.motion;
});

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('useSiteMotion', () => {
  it('loads core and starts motion after mount, and stops it on unmount', async () => {
    const { unmount } = await mount(<Probe />);
    await vi.waitFor(() => expect(startMotion).toHaveBeenCalledTimes(1));
    await unmount();
    expect(stopMotion).toHaveBeenCalledTimes(1);
  });

  it('never starts core for reduced-motion visitors, and marks the page reduced at once', async () => {
    reduced = true;
    const { unmount } = await mount(<Probe />);
    await settle();
    expect(queries).toContain(MOTION_QUERIES.reduced);
    expect(document.documentElement.dataset.motion).toBe('reduced');
    expect(startMotion).not.toHaveBeenCalled();
    expect(listeners.size).toBe(1);
    await unmount();
    expect(listeners.size).toBe(0);
  });

  it('starts core once if the visitor turns reduced motion off', async () => {
    reduced = true;
    await mount(<Probe />);
    reduced = false;
    for (const listener of [...listeners]) listener({ matches: false });
    await vi.waitFor(() => expect(startMotion).toHaveBeenCalledTimes(1));
    expect(listeners.size).toBe(0);
  });

  it('ignores a change event that still says reduce', async () => {
    reduced = true;
    await mount(<Probe />);
    for (const listener of [...listeners]) listener({ matches: true });
    await settle();
    expect(startMotion).not.toHaveBeenCalled();
    expect(listeners.size).toBe(1);
  });

  it('logs and falls back to reduced when starting fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    startMotion.mockImplementation(() => {
      throw new Error('boom');
    });
    await mount(<Probe />);
    await vi.waitFor(() => expect(error).toHaveBeenCalledWith('[motion]', expect.any(Error)));
    expect(document.documentElement.dataset.motion).toBe('reduced');
  });
});

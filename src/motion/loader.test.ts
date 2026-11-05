// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LOADER_DONE, LOADER_WAIT_MS, afterLoader, loaderShowing } from './loader';
import type { MotionEnv } from './shared';

const env: MotionEnv = { lang: 'ar', rtl: true, late: false };
const html = document.documentElement;

function spyModule() {
  const disposed = vi.fn();
  const module = vi.fn(() => disposed);
  return { module, disposed };
}

afterEach(() => {
  html.removeAttribute('data-loader');
  vi.useRealTimers();
});

describe('afterLoader', () => {
  it('runs the module at once when no curtain covers the page', () => {
    const { module, disposed } = spyModule();
    const dispose = afterLoader(module)(env);
    expect(loaderShowing()).toBe(false);
    expect(module).toHaveBeenCalledWith(env);
    dispose();
    expect(disposed).toHaveBeenCalledTimes(1);
  });

  it('waits under the curtain and runs once when it lifts', () => {
    html.setAttribute('data-loader', '');
    const { module, disposed } = spyModule();
    const dispose = afterLoader(module)(env);
    expect(module).not.toHaveBeenCalled();
    html.removeAttribute('data-loader');
    window.dispatchEvent(new Event(LOADER_DONE));
    window.dispatchEvent(new Event(LOADER_DONE));
    expect(module).toHaveBeenCalledTimes(1);
    dispose();
    expect(disposed).toHaveBeenCalledTimes(1);
  });

  it('still runs if the event never comes', () => {
    vi.useFakeTimers();
    html.setAttribute('data-loader', '');
    const { module } = spyModule();
    afterLoader(module)(env);
    vi.advanceTimersByTime(LOADER_WAIT_MS - 1);
    expect(module).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(module).toHaveBeenCalledTimes(1);
  });

  it('never runs after its context was disposed (a resize across the breakpoint)', () => {
    vi.useFakeTimers();
    html.setAttribute('data-loader', '');
    const { module } = spyModule();
    afterLoader(module)(env)();
    window.dispatchEvent(new Event(LOADER_DONE));
    vi.advanceTimersByTime(LOADER_WAIT_MS * 2);
    expect(module).not.toHaveBeenCalled();
  });

  it('logs and skips a module that throws, like every other module', () => {
    html.setAttribute('data-loader', '');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const dispose = afterLoader(() => {
      throw new Error('boom');
    })(env);
    window.dispatchEvent(new Event(LOADER_DONE));
    expect(error).toHaveBeenCalled();
    expect(dispose).not.toThrow();
    error.mockRestore();
  });
});

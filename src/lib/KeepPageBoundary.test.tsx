// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, cleanup } from '@/test/render';
import { KeepPageBoundary } from './KeepPageBoundary';

function Boom(): never {
  throw new Error('boom');
}

afterEach(async () => {
  vi.restoreAllMocks();
  await cleanup();
});

describe('KeepPageBoundary', () => {
  it('renders its children untouched', async () => {
    const { host } = await mount(<KeepPageBoundary snapshot="<p>old</p>"><p>live</p></KeepPageBoundary>);
    expect(host.textContent).toBe('live');
  });
  it('shows the prerendered page and logs once when a child throws', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { host } = await mount(<KeepPageBoundary snapshot="<p>static page</p>"><Boom /></KeepPageBoundary>);
    expect(host.textContent).toBe('static page');
    expect(log.mock.calls.filter((c) => String(c[0]).startsWith('[atlas]'))).toHaveLength(1);
  });
});

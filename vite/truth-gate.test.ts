// @vitest-environment node
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import type { Plugin } from 'vite';
import { truthGate } from './truth-gate.ts';

const root = fileURLToPath(new URL('..', import.meta.url));

async function run(target: 'staging' | 'production', ssr: boolean) {
  const plugin = truthGate({ target, env: {} }) as Plugin & {
    configResolved: (c: unknown) => void;
    buildStart: (this: unknown) => Promise<void>;
  };
  plugin.configResolved({ root, build: { ssr } });
  const ctx = { error: vi.fn(), warn: vi.fn() };
  await plugin.buildStart.call(ctx);
  return ctx;
}

describe('truthGate', () => {
  it('errors with the problem list in production', async () => {
    const ctx = await run('production', false);
    expect(ctx.error).toHaveBeenCalledOnce();
    expect(ctx.error.mock.calls[0][0]).toContain('problem(s)');
  });
  it('warns with a count in staging', async () => {
    const ctx = await run('staging', false);
    expect(ctx.error).not.toHaveBeenCalled();
    expect(ctx.warn).toHaveBeenCalledOnce();
    expect(ctx.warn.mock.calls[0][0]).toMatch(/\d+ unverified item\(s\)/);
  });
  it('skips SSR builds', async () => {
    const ctx = await run('production', true);
    expect(ctx.error).not.toHaveBeenCalled();
    expect(ctx.warn).not.toHaveBeenCalled();
  });
});

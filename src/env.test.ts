import { afterEach, describe, expect, it, vi } from 'vitest';

declare const __BUILD_TARGET__: string;

/** Re-import env.ts so it reads the stubbed import.meta.env values. */
async function freshEnv() {
  vi.resetModules();
  return import('./env');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('test setup', () => {
  it('runs with the staging build target defined', () => {
    expect(__BUILD_TARGET__).toBe('staging');
  });

  it('runs in a DOM environment', () => {
    expect(typeof document.createElement).toBe('function');
  });
});

describe('env', () => {
  it('targets staging under Vitest', async () => {
    const { env } = await freshEnv();
    expect(env.target).toBe('staging');
  });

  it('defaults siteUrl to the local preview server', async () => {
    vi.stubEnv('VITE_SITE_URL', undefined);
    const { env } = await freshEnv();
    expect(env.siteUrl).toBe('http://localhost:4173');
  });

  it('defaults siteUrl when VITE_SITE_URL is empty', async () => {
    vi.stubEnv('VITE_SITE_URL', '');
    const { env } = await freshEnv();
    expect(env.siteUrl).toBe('http://localhost:4173');
  });

  it('reads VITE_SITE_URL when set', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://staging.example.ly');
    const { env } = await freshEnv();
    expect(env.siteUrl).toBe('https://staging.example.ly');
  });

  it('turns empty optional values into null', async () => {
    vi.stubEnv('VITE_WHATSAPP', '');
    vi.stubEnv('VITE_PHONE', '');
    vi.stubEnv('VITE_FORM_ENDPOINT', '');
    vi.stubEnv('VITE_GA4_ID', '');
    const { env } = await freshEnv();
    expect(env.whatsapp).toBeNull();
    expect(env.phone).toBeNull();
    expect(env.formEndpoint).toBeNull();
    expect(env.ga4Id).toBeNull();
  });

  it('keeps optional values that are set', async () => {
    vi.stubEnv('VITE_WHATSAPP', '218900000000');
    vi.stubEnv('VITE_PHONE', '+218900000000');
    const { env } = await freshEnv();
    expect(env.whatsapp).toBe('218900000000');
    expect(env.phone).toBe('+218900000000');
  });
});

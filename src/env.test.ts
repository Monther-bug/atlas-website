import { describe, expect, it } from 'vitest';

declare const __BUILD_TARGET__: string;

describe('test setup', () => {
  it('runs with the staging build target defined', () => {
    expect(__BUILD_TARGET__).toBe('staging');
  });

  it('runs in a DOM environment', () => {
    expect(typeof document.createElement).toBe('function');
  });
});

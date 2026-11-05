// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { deepLink, parseDeepLink, resetDeepLink, takeCompare } from './deep-link';

afterEach(() => {
  resetDeepLink();
  history.replaceState(null, '', '/');
});

describe('deep links from a crane page', () => {
  it('reads a known crane and a comparison pick, ignores unknown and hidden ids', () => {
    expect(parseDeepLink('?crane=gmk6350')).toEqual({ crane: 'gmk6350', compare: null });
    expect(parseDeepLink('?compare=atf60-3')).toEqual({ crane: null, compare: 'atf60-3' });
    expect(parseDeepLink('?crane=cke2500&compare=nope')).toEqual({ crane: null, compare: null });
    expect(parseDeepLink('')).toEqual({ crane: null, compare: null });
  });

  it('hands the comparison pick out once', () => {
    history.replaceState(null, '', '/en/?compare=quy250#crane-compare');
    expect(deepLink().compare).toBe('quy250');
    expect(takeCompare()).toBe('quy250');
    expect(takeCompare()).toBeNull();
  });
});

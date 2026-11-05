// @vitest-environment node
// The reduced-motion reset (src/styles.css) must switch transitions off, not shorten them. A tiny duration on `*`
// turns on a transition of every property on every element; after an early style pass (a tap before the CSS has
// arrived) the hero then painted the unstyled UA sizes for a frame: CLS 0.15 at 390 px. Browser check: qa/cls-probe.mjs.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

function reducedUniversalRule(source: string): string {
  const block = source.slice(source.indexOf('@media (prefers-reduced-motion: reduce)'));
  const rule = block.match(/\*,\s*\*::before,\s*\*::after\s*\{([^}]*)\}/);
  if (!rule) throw new Error('the reduced-motion rule for * is missing from src/styles.css');
  return rule[1]!;
}

describe('reduced-motion reset', () => {
  it('turns transitions off on every element (0s, no delay)', () => {
    const rule = reducedUniversalRule(css);
    expect(rule).toMatch(/transition-duration:\s*0s\s*!important/);
    expect(rule).toMatch(/transition-delay:\s*0s\s*!important/);
  });
});

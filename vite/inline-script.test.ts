// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { minifyInlineScripts } from './inline-script';

describe('minifyInlineScripts', () => {
  it('minifies attribute-less inline scripts and drops their comments', () => {
    const out = minifyInlineScripts('<head><script>\n  // a comment\n  (function (doc) { var list = doc.documentElement.classList; list.add("js"); })(document);\n</script></head>');
    expect(out).not.toContain('a comment');
    expect(out).toMatch(/^<head><script>\(function\(\w\)\{.*\}\)\(document\);<\/script><\/head>$/);
  });

  it('leaves module, src and JSON-LD scripts alone', () => {
    const html = [
      '<script type="module" src="/src/main-ar.tsx"></script>',
      '<script type="application/ld+json">{"a": 1}</script>',
      '<script type="module">import "x";  </script>',
    ].join('');
    expect(minifyInlineScripts(html)).toBe(html);
  });

  it('fails the build on a syntax error instead of shipping it', () => {
    expect(() => minifyInlineScripts('<script>var = ;</script>')).toThrow(/inline-script/);
  });
});

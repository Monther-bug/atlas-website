// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { siteUrl } from './site-url';

type HtmlHook = { order: 'pre'; handler: (html: string) => string };

describe('siteUrl plugin', () => {
  it('fills every %SITE_URL% before other HTML transforms run', () => {
    const hook = siteUrl('https://atlas.example/').transformIndexHtml as unknown as HtmlHook;
    expect(hook.order).toBe('pre');
    expect(hook.handler('<link rel="canonical" href="%SITE_URL%/"><meta property="og:image" content="%SITE_URL%/og-ar.jpg">')).toBe(
      '<link rel="canonical" href="https://atlas.example/"><meta property="og:image" content="https://atlas.example/og-ar.jpg">',
    );
  });
  it('falls back to the local preview address', () => {
    const hook = siteUrl('').transformIndexHtml as unknown as HtmlHook;
    expect(hook.handler('%SITE_URL%/en/')).toBe('http://localhost:4173/en/');
  });
});

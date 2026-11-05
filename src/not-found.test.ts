// @vitest-environment node
// The 404 template (404.html): noindex, both languages, the right links, and the same head script as every page
// (so the single CSP hash in vercel.json still covers it).
import { describe, expect, it } from 'vitest';
import html from '../404.html?raw';
import homeHtml from '../index.html?raw';
import { minifyInlineScripts } from '../vite/inline-script';
import vercel from '../vercel.json';

const script = (h: string) => minifyInlineScripts(h).match(/<script>[\s\S]*?<\/script>/)?.[0];

describe('404.html', () => {
  it('is Arabic first, noindex, with no canonical', () => {
    expect(html).toMatch(/<html lang="ar" dir="rtl"/);
    expect(html).toContain('<meta name="robots" content="noindex" />');
    expect(html).not.toContain('rel="canonical"');
  });
  it('shows the heading in both languages', () => {
    expect(html).toContain('هذه الصفحة غير موجودة');
    expect(html).toContain("This page doesn't exist");
    expect(html).toMatch(/<p class="nf-code"[^>]*>404<\/p>/);
  });
  it('links home and to the crane list in each language', () => {
    for (const href of ['/', '/#crane-list', '/en/', '/en/#crane-list']) expect(html).toContain(`href="${href}"`);
  });
  it('has one contact marker per language', () => {
    expect(html.match(/<!--contact-ar-->/g)).toHaveLength(1);
    expect(html.match(/<!--contact-en-->/g)).toHaveLength(1);
  });
  it('carries the same minified head script as the home page', () => {
    expect(script(html)).toBeTruthy();
    expect(script(html)).toBe(script(homeHtml));
  });
  it('is not a redirect target: vercel.json has no catch-all redirect or rewrite', () => {
    const cfg = vercel as { redirects?: { source: string }[]; rewrites?: unknown[] };
    expect(cfg.rewrites ?? []).toHaveLength(0);
    expect((cfg.redirects ?? []).every((r) => !/[(*:]/.test(r.source))).toBe(true);
  });
});

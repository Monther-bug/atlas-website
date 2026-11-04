// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderHtml } from '@/test/render';
import { App } from './App';

describe('App', () => {
  it('renders the skip link, main and the progress rope', () => {
    const html = renderHtml(<App />, 'ar');
    expect(html.querySelector('a[href="#main"]')?.textContent).toBe('انتقل إلى المحتوى');
    expect(html.querySelector('main#main')).not.toBeNull();
    const rope = html.querySelector('[data-progress-rope]');
    expect(rope?.getAttribute('aria-hidden')).toBe('true');
    expect(rope?.className).toBe('progress-rope');
  });

  it('uses the English skip link on the English page', () => {
    expect(renderHtml(<App />, 'en').querySelector('a[href="#main"]')?.textContent).toBe('Skip to content');
  });
});

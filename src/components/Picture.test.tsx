import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getImage } from '@/generated/images';
import { Picture } from './Picture';

/** Renders on the "server" and parses the markup back into DOM nodes. */
function render(ui: React.ReactElement) {
  const html = renderToStaticMarkup(ui);
  const host = document.createElement('div');
  host.innerHTML = html;
  const picture = host.querySelector('picture')!;
  return { html, picture, sources: [...host.querySelectorAll('source')], img: host.querySelector('img')! };
}

const srcset = (list: { url: string; width: number }[]) => list.map((s) => `${s.url} ${s.width}w`).join(', ');

describe('Picture', () => {
  const desktop = getImage('6398', 'desktop_16x9');
  const mobile = getImage('6398', 'mobile_9x16');

  it('renders AVIF then WebP sources for one crop', () => {
    const { html, sources } = render(<Picture photo="6398" crop="desktop_16x9" alt="Two cranes" sizes="100vw" />);
    expect(html.startsWith('<picture')).toBe(true);
    expect(sources.map((s) => s.getAttribute('type'))).toEqual(['image/avif', 'image/webp']);
    expect(sources[0].getAttribute('srcset')).toBe(srcset(desktop.avif));
    expect(sources[1].getAttribute('srcset')).toBe(srcset(desktop.webp));
    expect(sources.every((s) => !s.hasAttribute('media') && s.getAttribute('sizes') === '100vw')).toBe(true);
  });

  it('puts the mobile crop first behind a < 768px media query', () => {
    const { sources } = render(
      <Picture photo="6398" crop="desktop_16x9" mobileCrop="mobile_9x16" alt="Two cranes" sizes="100vw" />,
    );
    expect(sources.map((s) => `${s.getAttribute('media')} ${s.getAttribute('type')}`)).toEqual([
      '(max-width: 767.98px) image/avif',
      '(max-width: 767.98px) image/webp',
      'null image/avif',
      'null image/webp',
    ]);
    expect(sources[0].getAttribute('srcset')).toBe(srcset(mobile.avif));
    expect(sources[0].getAttribute('width')).toBe(String(mobile.rect.width));
    expect(sources[0].getAttribute('height')).toBe(String(mobile.rect.height));
  });

  it('gives the <img> the crop size, alt, placeholder and cover/top framing', () => {
    const { img } = render(<Picture photo="6398" crop="desktop_16x9" alt="Two cranes" sizes="100vw" />);
    expect(img.getAttribute('width')).toBe(String(desktop.rect.width));
    expect(img.getAttribute('height')).toBe(String(desktop.rect.height));
    expect(img.getAttribute('alt')).toBe('Two cranes');
    expect(img.getAttribute('src')).toMatch(/^\/img\/6398-desktop_16x9-\d+\.[0-9a-f]{8}\.webp$/);
    expect(img.style.backgroundImage).toContain('data:image/webp;base64,');
    expect(img.style.backgroundSize).toBe('cover');
    expect(img.style.objectFit).toBe('cover');
    expect(img.style.objectPosition).toBe('50% 0');
    expect(img.getAttribute('style')).toContain('background-position:50% 0');
    expect(img.hasAttribute('sizes')).toBe(false);
  });

  it('uses the WebP closest to 1280 px as the <img> src (ties go larger)', () => {
    const { img } = render(<Picture photo="6398" crop="desktop_16x9" alt="" sizes="100vw" />);
    const closest = [...desktop.webp].sort((a, b) => Math.abs(a.width - 1280) - Math.abs(b.width - 1280) || b.width - a.width)[0];
    expect(closest.width).toBe(1280);
    expect(img.getAttribute('src')).toBe(closest.url);
  });

  it('loads lazily by default', () => {
    const { img } = render(<Picture photo="6359" crop="desktop_16x9" alt="" sizes="50vw" />);
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
    expect(img.hasAttribute('fetchpriority')).toBe(false);
  });

  it('loads eagerly with high fetch priority when priority is set', () => {
    const { img } = render(<Picture photo="6359" crop="desktop_16x9" alt="" sizes="100vw" priority />);
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.hasAttribute('decoding')).toBe(false);
  });

  it('applies className to <img> and pictureClassName to <picture>', () => {
    const { img, picture } = render(
      <Picture photo="6359" crop="desktop_16x9" alt="" sizes="100vw" className="h-full w-full" pictureClassName="block" />,
    );
    expect(img.getAttribute('class')).toBe('h-full w-full');
    expect(picture.getAttribute('class')).toBe('block');
  });
});

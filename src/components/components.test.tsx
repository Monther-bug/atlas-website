// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderHtml } from '@/test/render';
import { vi } from 'vitest';
import { click, mount } from '@/test/render';
import { Button, CHEVRON_STRIPES } from './Button';
import { CHEVRON_STRIPES as STRIPES } from './stripes';
import { DraftBadge } from './DraftBadge';
import { Fill } from './Fill';
import { ArrowIcon, CloseIcon } from './Icons';
import { Logo } from './Logo';

describe('Button', () => {
  it('opens http links in a new tab and says so', () => {
    const a = renderHtml(<Button href="https://wa.me/218911234567" external>WhatsApp</Button>, 'en').querySelector('a');
    expect(a?.getAttribute('target')).toBe('_blank');
    expect(a?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(a?.textContent).toBe('WhatsApp (opens in a new tab)');
  });

  it('keeps mailto and tel links in the same tab', () => {
    const a = renderHtml(<Button href="mailto:atlasalsahralibya@gmail.com" external>Email</Button>, 'en').querySelector('a');
    expect(a?.hasAttribute('target')).toBe(false);
    expect(a?.textContent).toBe('Email');
  });

  it('is a type="button" by default and has hover and disabled styles', () => {
    const button = renderHtml(<Button>Go</Button>).querySelector('button');
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.className).toContain('hover:');
    expect(button?.className).toContain('disabled:opacity-60');
    expect(button?.className).toContain('rounded-full'); // v2: pill buttons (v2 spec §8.1)
  });

  it('shows a busy state while loading', () => {
    const button = renderHtml(<Button type="submit" loading>Sending…</Button>).querySelector('button');
    expect(button?.getAttribute('aria-disabled')).toBe('true');
    expect(button?.getAttribute('aria-busy')).toBe('true');
    expect(button?.querySelector('span[aria-hidden="true"]')).not.toBeNull();
  });

  it('leaves the focus ring to the global --ring rule', () => {
    const button = renderHtml(<Button>Go</Button>).querySelector('button');
    expect(button?.getAttribute('style')).toBeNull();
    expect(button?.className).not.toContain('outline');
  });
});

describe('Button states (review fixes)', () => {
  it('uses enabled: hover and active on native buttons, plain hover on anchors', () => {
    const b = renderHtml(<Button>Go</Button>).querySelector('button');
    expect(b?.className).toContain('enabled:not-aria-disabled:hover:');
    expect(b?.className).toContain('enabled:not-aria-disabled:active:');
    expect(b?.className).not.toMatch(/(^|\s)hover:/);
    const a = renderHtml(<Button href="/x">Go</Button>).querySelector('a');
    expect(a?.className).toMatch(/(^|\s)hover:/);
  });

  it('keeps a loading button focusable and ignores clicks', async () => {
    const onClick = vi.fn();
    const html = renderHtml(<Button loading onClick={onClick}>Sending</Button>).querySelector('button');
    expect(html?.hasAttribute('disabled')).toBe(false);
    expect(html?.getAttribute('aria-disabled')).toBe('true');
    expect(html?.getAttribute('aria-busy')).toBe('true');
    const { host, unmount } = await mount(<Button loading onClick={onClick}>Sending</Button>);
    await click(host.querySelector('button'));
    expect(onClick).not.toHaveBeenCalled();
    await unmount();
  });

  it('still disables on a real disabled prop', () => {
    expect(renderHtml(<Button disabled>Go</Button>).querySelector('button')?.hasAttribute('disabled')).toBe(true);
  });

  it('stacks idle and loading labels so the width is stable', () => {
    // One shared grid cell via plain col/row-start classes: the old `[grid-area:1/1]${…}` template was never compiled
    // by Tailwind, so the labels sat in two rows (Impeccable gate 1).
    const idle = renderHtml(<Button loadingLabel="Sending…">Send request</Button>).querySelector('button');
    const spans = idle?.querySelectorAll('span.col-start-1.row-start-1');
    expect(idle?.querySelector(':scope > span.inline-grid')).not.toBeNull();
    expect(spans?.length).toBe(2);
    expect(spans?.[0].className).not.toContain('invisible');
    expect(spans?.[1].className).toContain('invisible');
    const busy = renderHtml(<Button loading loadingLabel="Sending…">Send request</Button>).querySelector('button');
    const s2 = busy?.querySelectorAll('span.col-start-1.row-start-1');
    expect(s2?.[0].className).toContain('invisible');
    expect(s2?.[1].className).not.toContain('invisible');
    expect(busy?.textContent).toContain('Send request');
    expect(busy?.textContent).toContain('Sending…');
  });

  it('keeps icons beside stacked labels: only the two labels sit in the inline-grid', () => {
    const button = renderHtml(
      <Button icon={<svg data-testid="lead" />} iconEnd={<svg data-testid="trail" />} loadingLabel="Sending…">
        Send request
      </Button>,
    ).querySelector('button');
    expect(button?.className).toContain('inline-flex');
    expect(button?.className).not.toMatch(/(^|\s)grid(\s|$)/);
    const grid = button?.querySelector('span.inline-grid');
    expect(grid?.querySelectorAll('span.col-start-1.row-start-1').length).toBe(2);
    expect(grid?.querySelector('[data-testid="lead"]')).toBeNull();
    expect(grid?.querySelector('[data-testid="trail"]')).toBeNull();
    expect(button?.firstElementChild?.getAttribute('data-testid')).toBe('lead');
    expect(button?.lastElementChild?.getAttribute('data-testid')).toBe('trail');
  });

  it('never gives a loading native button a hover or active style without the not-aria-disabled guard', () => {
    const variants = ['primary-red', 'outline-on-dark', 'outline-on-light'] as const;
    for (const variant of variants) {
      const button = renderHtml(<Button variant={variant} loading>Sending</Button>).querySelector('button');
      const tokens = (button?.className ?? '').split(/\s+/).filter(Boolean);
      const stateTokens = tokens.filter((t) => /(^|:)(hover|active):/.test(t));
      expect(stateTokens.length).toBeGreaterThan(0);
      for (const token of stateTokens) {
        expect(token, `${variant}: ${token}`).toContain('not-aria-disabled:');
      }
    }
  });

  it('adds rel and the new-tab note for any _blank anchor', () => {
    const a = renderHtml(<Button href="/y" target="_blank">Go</Button>, 'en').querySelector('a');
    expect(a?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(a?.textContent).toBe('Go (opens in a new tab)');
  });

  it('lets labels wrap and shares the stripes', () => {
    expect(renderHtml(<Button>Go</Button>).querySelector('button')?.className).not.toContain('whitespace-nowrap');
    expect(CHEVRON_STRIPES).toBe(STRIPES);
  });
});

describe('Icons', () => {
  it('sizes to the text and is labelled only when asked', () => {
    const svg = renderHtml(<CloseIcon />).querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('1em');
    const labelled = renderHtml(<CloseIcon aria-label="Close" />).querySelector('svg');
    expect(labelled?.hasAttribute('aria-hidden')).toBe(false);
    expect(labelled?.getAttribute('role')).toBe('img');
  });

  it('mirrors the forward arrow in RTL only', () => {
    const svg = renderHtml(<ArrowIcon />).querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('rtl:-scale-x-100');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws the close icon as SVG, not a glyph', () => {
    const html = renderHtml(<CloseIcon />);
    expect(html.querySelector('svg path')).not.toBeNull();
    expect(html.textContent).toBe('');
  });
});

describe('Fill', () => {
  it('puts nodes where the {placeholders} are', () => {
    expect(renderHtml(<Fill template="Call {phone} now" vars={{ phone: <bdi>+218 91</bdi> }} />).innerHTML).toBe(
      'Call <bdi>+218 91</bdi> now',
    );
  });
});

describe('Logo', () => {
  it('sets the name in the page language with the other language beside it', () => {
    const html = renderHtml(<Logo />, 'ar');
    expect(html.querySelector('img')?.getAttribute('src')).toBe('/brand/badge.png');
    expect(html.textContent).toContain('أطلس الصحراء');
    expect(html.querySelector('img')?.getAttribute('class')).toContain('object-contain');
    expect(html.querySelector('[lang="en"]')?.textContent).toBe('Atlas Alshraa');
  });

  it('uses the 64 px badge and the full name in the footer', () => {
    const html = renderHtml(<Logo variant="footer" />, 'en');
    expect(html.querySelector('img')?.getAttribute('width')).toBe('64');
    expect(html.textContent).toBe('Atlas Alshraa · For oil services');
  });
});

describe('DraftBadge', () => {
  it('marks an unverified value in staging', () => {
    const badge = renderHtml(<DraftBadge verified={false} />, 'en').querySelector('[data-testid="draft-badge"]');
    expect(badge?.textContent).toBe('DRAFT · unverified');
  });

  it('renders nothing for a verified value', () => {
    expect(renderHtml(<DraftBadge verified />, 'en').innerHTML).toBe('');
  });
});

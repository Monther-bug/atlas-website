// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { makeGhost } from './ghost';

const AT = { left: 10, top: 20, width: 120, height: 48 };

function source(): HTMLElement {
  document.body.innerHTML =
    '<a id="wa" href="https://wa.me/1" data-testid="sling-whatsapp" data-sling-button class="btn" style="opacity:0;transform:rotate(4deg)">' +
    '<svg data-icon><path d="M0 0"></path></svg><span data-label>WhatsApp</span></a>';
  return document.getElementById('wa')!;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('makeGhost', () => {
  it('appends an inert clone, hidden from assistive tech, to <body> at the given rect', () => {
    const ghost = makeGhost(source(), AT);
    expect(ghost.parentElement).toBe(document.body);
    expect(ghost.getAttribute('aria-hidden')).toBe('true');
    expect(ghost.hasAttribute('inert')).toBe(true);
    expect(ghost.classList.contains('motion-ghost')).toBe(true);
    expect(ghost.classList.contains('btn')).toBe(true);
    expect(ghost.style.position).toBe('fixed');
    expect([ghost.style.left, ghost.style.top, ghost.style.width, ghost.style.height]).toEqual(['10px', '20px', '120px', '48px']);
    expect(ghost.style.opacity).toBe('1');
    expect(ghost.style.transform).toBe('none');
    expect(ghost.textContent).toBe('WhatsApp');
  });

  it('strips ids, links and every data-* attribute, so selectors and tests never find two', () => {
    const ghost = makeGhost(source(), AT);
    expect(ghost.id).toBe('');
    expect(ghost.hasAttribute('href')).toBe(false);
    for (const el of [ghost, ...Array.from(ghost.querySelectorAll('*'))]) {
      expect(el.getAttributeNames().filter((name) => name.startsWith('data-'))).toEqual([]);
    }
    expect(document.querySelectorAll('[data-testid="sling-whatsapp"]')).toHaveLength(1);
    expect(document.querySelectorAll('#wa')).toHaveLength(1);
  });

  it('leaves the source node untouched', () => {
    const el = source();
    const before = el.outerHTML;
    makeGhost(el, AT);
    expect(el.outerHTML).toBe(before);
    expect(el.parentElement).toBe(document.body);
  });
});

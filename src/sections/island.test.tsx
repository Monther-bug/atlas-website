// @vitest-environment jsdom
import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { KeptShell, keptHtml } from './island';

/**
 * The client half of a static island: React must adopt the prerendered markup node for node, never patch or blank it,
 * and still have the markup if it ever has to render the section from scratch.
 */
describe('static island', () => {
  it('reads the prerendered shell once and returns the same object on every render', () => {
    document.body.innerHTML = '<section id="isl-a"><div class="shell"><h2>Title</h2><p>Body</p></div></section>';
    const first = keptHtml('isl-a');
    expect(first.__html).toBe('<h2>Title</h2><p>Body</p>');
    document.body.innerHTML = '';
    expect(keptHtml('isl-a')).toBe(first); // cached: later renders pass the identical object
    expect(keptHtml('isl-missing').__html).toBe('');
  });

  it('hydrates without touching the prerendered nodes, and re-renders keep them', async () => {
    const container = document.createElement('div');
    container.innerHTML = '<section id="isl-b"><div class="shell"><h2 data-x="1">Kept</h2><ul><li>a</li></ul></div></section>';
    document.body.append(container);
    const heading = container.querySelector('h2');
    const errors: unknown[] = [];
    const tree = () => (
      <section id="isl-b">
        <KeptShell id="isl-b" />
      </section>
    );
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, tree(), { onRecoverableError: (e) => errors.push(e) });
    });
    expect(errors).toEqual([]);
    expect(container.querySelector('h2')).toBe(heading); // the same node, not a copy
    await act(async () => root.render(tree()));
    expect(container.querySelector('h2')).toBe(heading);
    expect(container.querySelector('li')?.textContent).toBe('a');
    await act(async () => root.unmount());
    container.remove();
  });
});

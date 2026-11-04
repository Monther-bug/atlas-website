// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { mount } from './render';

describe('automatic cleanup', () => {
  it('mounts a root and leaves it for the hook', async () => {
    await mount(<p data-testid="leftover">hi</p>);
    expect(document.body.querySelector('[data-testid="leftover"]')).not.toBeNull();
  });

  it('has no leftover host in the next test', () => {
    expect(document.body.querySelector('[data-testid="leftover"]')).toBeNull();
    expect(document.body.children.length).toBe(0);
  });
});

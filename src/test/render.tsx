import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Lang } from '@/content/types';
import { getCopy } from '@/content/all';
import { LangProvider } from '@/lib/lang';

/** Static HTML, as the prerender produces it, inside a detached <div> for DOM queries. Needs jsdom. */
export function renderHtml(node: ReactNode, lang: Lang = 'ar'): HTMLDivElement {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<LangProvider lang={lang} copy={getCopy(lang)}>{node}</LangProvider>);
  return host;
}

const mounted = new Set<() => Promise<void>>();

/** A live render: effects run and clicks work. Always await unmount() at the end. */
export async function mount(node: ReactNode, lang: Lang = 'ar'): Promise<{ host: HTMLDivElement; unmount: () => Promise<void> }> {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(<LangProvider lang={lang} copy={getCopy(lang)}>{node}</LangProvider>);
  });
  const unmount = async () => {
    mounted.delete(unmount);
    await act(async () => root.unmount());
    host.remove();
  };
  mounted.add(unmount);
  return { host, unmount };
}

/** Unmounts and removes every root still mounted. Called automatically after each test by setup.ts. */
export async function cleanup(): Promise<void> {
  for (const unmount of [...mounted]) await unmount();
}

/** Clicks inside act() so React flushes the update. */
export async function click(element: Element | null): Promise<void> {
  if (!(element instanceof HTMLElement)) throw new Error('click(): element not found');
  await act(async () => {
    element.click();
  });
}

/** Sets a controlled input, textarea or select the way a user would (React sees the change). */
export async function changeValue(element: Element | null, value: string): Promise<void> {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
    throw new Error('changeValue(): not a form control');
  }
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element) as object, 'value')?.set;
  await act(async () => {
    setter?.call(element, value);
    element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
  });
}

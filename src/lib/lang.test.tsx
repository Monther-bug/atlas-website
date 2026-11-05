import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ar } from '@/content/ar';
import { en } from '@/content/en';
import { LangProvider, useLang } from './lang';

function Probe() {
  const { lang, dir, otherLang, otherHref, copy } = useLang();
  return <p>{[lang, dir, otherLang, otherHref, copy.header.request].join('|')}</p>;
}

describe('LangProvider', () => {
  it('provides the Arabic page context', () => {
    expect(
      renderToStaticMarkup(
        <LangProvider lang="ar" copy={ar}>
          <Probe />
        </LangProvider>,
      ),
    ).toBe('<p>ar|rtl|en|/en/|اطلب رافعة</p>');
  });

  it('provides the English page context', () => {
    expect(
      renderToStaticMarkup(
        <LangProvider lang="en" copy={en}>
          <Probe />
        </LangProvider>,
      ),
    ).toBe('<p>en|ltr|ar|/|Request a crane</p>');
  });

  it('serves exactly the copy it is given (no lookup of its own)', () => {
    const custom = { ...en, header: { ...en.header, request: 'Custom label' } };
    expect(
      renderToStaticMarkup(
        <LangProvider lang="en" copy={custom}>
          <Probe />
        </LangProvider>,
      ),
    ).toBe('<p>en|ltr|ar|/|Custom label</p>');
  });

  it('fails loudly outside a provider', () => {
    expect(() => renderToStaticMarkup(<Probe />)).toThrow(/LangProvider/);
  });

  it('points the language switch at the same crane on a crane page', () => {
    expect(
      renderToStaticMarkup(
        <LangProvider lang="ar" copy={ar} crane="gmk6350">
          <Probe />
        </LangProvider>,
      ),
    ).toBe('<p>ar|rtl|en|/en/cranes/gmk6350/|اطلب رافعة</p>');
  });
});

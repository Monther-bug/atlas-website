import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LangProvider, useLang } from './lang';

function Probe() {
  const { lang, dir, otherLang, otherHref, copy } = useLang();
  return <p>{[lang, dir, otherLang, otherHref, copy.header.request].join('|')}</p>;
}

describe('LangProvider', () => {
  it('provides the Arabic page context', () => {
    expect(
      renderToStaticMarkup(
        <LangProvider lang="ar">
          <Probe />
        </LangProvider>,
      ),
    ).toBe('<p>ar|rtl|en|/en/|اطلب رافعة</p>');
  });

  it('provides the English page context', () => {
    expect(
      renderToStaticMarkup(
        <LangProvider lang="en">
          <Probe />
        </LangProvider>,
      ),
    ).toBe('<p>en|ltr|ar|/|Request a crane</p>');
  });

  it('fails loudly outside a provider', () => {
    expect(() => renderToStaticMarkup(<Probe />)).toThrow(/LangProvider/);
  });
});

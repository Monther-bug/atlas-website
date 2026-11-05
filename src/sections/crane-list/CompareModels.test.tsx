// @vitest-environment node
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getCopy } from '@/content/all';
import { visibleCranes } from '@/content';
import { LangProvider } from '@/lib/lang';
import { CompareModels } from './CompareModels';

/** The comparison as the prerender writes it (no window): complete without JS, cheap with it. */
function prerender(lang: 'ar' | 'en') {
  const html = renderToStaticMarkup(
    <LangProvider lang={lang} copy={getCopy(lang)}>
      <CompareModels cranes={visibleCranes} onDetails={() => undefined} />
    </LangProvider>,
  );
  return { html, doc: new JSDOM(html).window.document };
}

describe('CompareModels prerender', () => {
  it('holds every model: the default three shown, the others hidden by the .js rule, the middle marked for phones', () => {
    const { doc } = prerender('en');
    const heads = [...doc.querySelectorAll('table.cmp-table--key thead th[data-col]')];
    expect(heads.map((th) => th.getAttribute('data-col'))).toEqual(['rt700e', 'atf60-3', 'ac200-1', 'quy250', 'gmk6350']);
    expect(heads.filter((th) => !th.hasAttribute('data-off')).map((th) => th.getAttribute('data-col'))).toEqual(['rt700e', 'ac200-1', 'gmk6350']);
    expect(doc.querySelector('[data-mid]')?.getAttribute('data-col')).toBe('ac200-1');
    expect(doc.querySelectorAll('.cmp-swap')).toHaveLength(5);
  });

  it('renders the key rows only; the full table is in <noscript>, which a page with JS never parses', () => {
    const { html, doc } = prerender('ar');
    expect(doc.querySelectorAll('table.cmp-table--key tbody tr[data-row]')).toHaveLength(7);
    expect(doc.querySelector('select')).toBeNull(); // pickers are live-only; the names are plain text here
    expect(doc.querySelector('img')).toBeNull(); // photos are live-only; the frame keeps their box
    expect(doc.querySelectorAll('.cmp-photo')).toHaveLength(3); // the shown models only (no-JS hides the row)
    // Notes and sources: the prerender keeps the row's box (closed, empty disclosures for the shown models)…
    expect(doc.querySelectorAll('details.cmp-note')).toHaveLength(3);
    expect(doc.querySelector('details.cmp-note a')).toBeNull();
    const noscript = html.slice(html.indexOf('<noscript>'), html.indexOf('</noscript>'));
    expect(noscript).toContain('عرض الجنزير');
    expect(noscript).toContain('الطول الكلي');
    expect(noscript).toContain('صفحة Fuwa تذكر 260 طناً'); // …and every rating note is in the no-JS page
    expect(noscript).toContain('* من قاعدة بيانات مواصفات'); // the * on the QUY250's figures is explained there too
    // The toggle is in the prerender too, so mounting the island adds no height.
    expect(doc.querySelector('button[aria-controls="crane-compare-more"]')?.getAttribute('aria-expanded')).toBe('false');
  });
});

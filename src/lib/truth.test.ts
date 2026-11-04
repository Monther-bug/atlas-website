// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { findTruthProblems } from './truth';

const READY_ENV = { siteUrl: 'https://atlas.example.ly', whatsapp: '218910000000', phone: '+218910000000' };
const check = (input: Partial<Parameters<typeof findTruthProblems>[0]>) =>
  findTruthProblems({ copies: [], cranes: [], env: READY_ENV, ...input });

describe('findTruthProblems', () => {
  it('returns nothing when copy, cranes and env are ready', () => {
    expect(
      check({
        copies: [{ hero: { title: 'Every project has the right crane' }, count: 5, ok: true, none: null }],
        cranes: [{ id: 'gmk6350', verified: true, hidden: false }],
      }),
    ).toEqual([]);
  });

  it('reports a [[TOKEN]] with its key path', () => {
    expect(check({ copies: [{ footer: { phone: 'Call [[PHONE]]' } }] })).toEqual([
      'copies[0].footer.phone: unresolved [[PHONE]]',
    ]);
  });

  it('walks arrays and every copy, and lists every token in a string', () => {
    const ar = { services: { items: [{ text: 'ok' }, { text: '[[CONFIRM]] و [[HOURS]]' }] } };
    const en = { alt: { '6398': 'Two cranes [[CONFIRM]]' } };
    expect(check({ copies: [ar, en] })).toEqual([
      'copies[0].services.items[1].text: unresolved [[CONFIRM]], [[HOURS]]',
      'copies[1].alt.6398: unresolved [[CONFIRM]]',
    ]);
  });

  it('reports a dangling "[[" that never closes', () => {
    expect(check({ copies: [{ a: 'broken [[TOKEN' }] })).toEqual(['copies[0].a: unresolved [[TOKEN']);
  });

  it('ignores numbers, booleans, null and functions', () => {
    expect(check({ copies: [{ n: 1, b: false, z: null, f: () => '[[X]]' }] })).toEqual([]);
  });

  it('reports cranes that are shown but not verified, and skips hidden ones', () => {
    const cranes = [
      { id: 'rt700e', verified: false, hidden: false },
      { id: 'gmk6350', verified: true, hidden: false },
      { id: 'cke2500', verified: false, hidden: true },
    ];
    expect(check({ cranes })).toEqual(['crane rt700e: shown but not verified (set verified: true once Atlas confirms)']);
  });

  it('reports each missing env value, treating blanks as missing', () => {
    expect(check({ env: { siteUrl: '', whatsapp: null, phone: '  ' } })).toEqual([
      'SITE_URL is not set',
      'VITE_WHATSAPP is not set',
      'VITE_PHONE is not set',
    ]);
    expect(check({ env: {} })).toHaveLength(3);
  });
});

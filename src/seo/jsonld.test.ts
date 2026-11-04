import { describe, expect, it } from 'vitest';
import { buildJsonLd, jsonLdScript } from './jsonld';

// Test fixtures only: none of these values is an Atlas fact.
const base = {
  siteUrl: 'https://atlas.example',
  email: 'atlasalsahralibya@gmail.com',
  facebook: 'https://www.facebook.com/example-page',
  phone: null,
  address: null,
};

describe('buildJsonLd', () => {
  it('has only confirmed fields while phone and address are unknown', () => {
    const ld = buildJsonLd({ ...base, lang: 'ar' });
    expect(Object.keys(ld).sort()).toEqual(['@context', '@id', '@type', 'alternateName', 'email', 'logo', 'name', 'sameAs', 'url'].sort());
    expect(ld['@type']).toBe('Organization');
    expect(ld.name).toBe('أطلس الصحراء');
    expect(ld.alternateName).toBe('Atlas Alshraa');
    expect(ld.url).toBe('https://atlas.example/');
    expect(ld.logo).toBe('https://atlas.example/brand/badge.png');
    expect(ld.email).toBe('atlasalsahralibya@gmail.com');
    expect(ld.sameAs).toEqual(['https://www.facebook.com/example-page']);
  });
  it('names the English page in English first', () => {
    const ld = buildJsonLd({ ...base, lang: 'en' });
    expect([ld.name, ld.alternateName]).toEqual(['Atlas Alshraa', 'أطلس الصحراء']);
  });
  it('adds telephone and address once they are verified', () => {
    const ld = buildJsonLd({ ...base, lang: 'en', phone: '+218900000000', address: { ar: 'عنوان تجريبي', en: 'Test address' } });
    expect(ld['@type']).toEqual(['Organization', 'LocalBusiness']);
    expect(ld.telephone).toBe('+218900000000');
    expect(ld.address).toEqual({ '@type': 'PostalAddress', streetAddress: 'Test address', addressCountry: 'LY' });
  });
});

describe('jsonLdScript', () => {
  it('escapes < so the JSON cannot close the script tag', () => {
    const s = jsonLdScript({ x: '</script><b>' });
    expect(s.startsWith('<script type="application/ld+json">')).toBe(true);
    expect(s).not.toContain('</script><b>');
    expect(JSON.parse(s.replace(/^<script[^>]*>|<\/script>$/g, ''))).toEqual({ x: '</script><b>' });
  });
});

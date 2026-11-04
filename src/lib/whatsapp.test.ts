import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
  target: 'staging' as 'staging' | 'production',
  siteUrl: 'http://localhost:4173',
  whatsapp: null as string | null,
  phone: null as string | null,
  formEndpoint: null as string | null,
  ga4Id: null as string | null,
}));
vi.mock('@/env', () => ({ env: mockEnv, isDraft: (verified: boolean) => !verified }));

import { fillTemplate, mailtoHref, telHref, whatsappHref } from './whatsapp';

const message = 'السلام عليكم، أطلس الصحراء.\nأريد الاستفسار عن الرافعة Grove GMK6350 (رافعة لكل التضاريس).';

beforeEach(() => {
  mockEnv.whatsapp = null;
  mockEnv.phone = null;
});

describe('fillTemplate', () => {
  it('replaces every {key}', () => {
    expect(fillTemplate('{a} and {a}, then {b}', { a: '1', b: '2' })).toBe('1 and 1, then 2');
  });

  it('leaves unknown keys visible', () => {
    expect(fillTemplate('Call {phone}', {})).toBe('Call {phone}');
  });

  it('does not read inherited properties', () => {
    expect(fillTemplate('{toString}', {})).toBe('{toString}');
  });
});

describe('fillTemplate edge cases', () => {
  it('inserts a value containing $& literally', () => {
    expect(fillTemplate('Cost {a}', { a: '$&' })).toBe('Cost $&');
  });

  it('does not re-expand a value containing {x}', () => {
    expect(fillTemplate('{a}', { a: '{x}', x: 'no' })).toBe('{x}');
  });

  it('leaves {} and {a-b} untouched', () => {
    expect(fillTemplate('{} {a-b}', { a: '1' })).toBe('{} {a-b}');
  });
});

describe('whatsappHref', () => {
  it('builds a wa.me link with the message encoded', () => {
    mockEnv.whatsapp = '218911234567';
    const href = whatsappHref(message);
    expect(href).toBe(`https://wa.me/218911234567?text=${encodeURIComponent(message)}`);
    expect(href).toContain('%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85'); // السلام
    expect(href).toContain('%0A'); // the line break
    expect(new URL(href).searchParams.get('text')).toBe(message);
  });

  it('keeps only digits of the number', () => {
    mockEnv.whatsapp = '+218 91-123-4567';
    expect(whatsappHref('Hi')).toBe('https://wa.me/218911234567?text=Hi');
  });

  it('falls back to mailto when there is no WhatsApp number', () => {
    const href = whatsappHref(message);
    expect(href.startsWith('mailto:atlasalsahralibya@gmail.com?subject=')).toBe(true);
    const query = new URLSearchParams(href.slice(href.indexOf('?') + 1));
    expect(query.get('subject')).toBe('السلام عليكم، أطلس الصحراء.');
    expect(query.get('body')).toBe(message);
  });
});

describe('whatsappHref CRLF', () => {
  it('uses a CR-free first line as the mailto subject', () => {
    const href = whatsappHref('Line one\r\nLine two');
    const query = new URLSearchParams(href.slice(href.indexOf('?') + 1));
    expect(query.get('subject')).toBe('Line one');
    expect(href.split('&body=')[0]).not.toContain('%0D');
  });
});

describe('mailtoHref', () => {
  it('encodes subject and body', () => {
    expect(mailtoHref('Crane request: Grove GMK6350', 'a b\nc')).toBe(
      'mailto:atlasalsahralibya@gmail.com?subject=Crane%20request%3A%20Grove%20GMK6350&body=a%20b%0Ac',
    );
  });
});

describe('telHref', () => {
  it('is null without a phone number', () => {
    expect(telHref()).toBeNull();
  });

  it('keeps digits and the leading plus', () => {
    mockEnv.phone = '+218 91 123 4567';
    expect(telHref()).toBe('tel:+218911234567');
  });

  it('keeps + only as the first character and strips other characters', () => {
    mockEnv.phone = '+218 91-123 4567';
    expect(telHref()).toBe('tel:+218911234567');
    mockEnv.phone = '00218 91+x';
    expect(telHref()).toBe('tel:0021891');
  });

  it('is null when no digits remain', () => {
    mockEnv.phone = '   ';
    expect(telHref()).toBeNull();
    mockEnv.phone = 'abc';
    expect(telHref()).toBeNull();
  });
});

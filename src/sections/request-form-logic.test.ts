import { describe, expect, it } from 'vitest';
import { getCopy } from '@/content/all';
import {
  HANDOFF_MESSAGE_MAX,
  REQUEST_FIELDS,
  buildFollowUpMessage,
  buildRequestMessage,
  craneFromOption,
  emailSubject,
  emptyRequest,
  localIsoDate,
  requestPayload,
  requestVars,
  handoffMessage,
  validateRequest,
  type RequestValues,
} from './request-form-logic';

const ar = getCopy('ar');
const en = getCopy('en');
const TODAY = '2026-11-04';
const values = (overrides: Partial<RequestValues>): RequestValues => ({ ...emptyRequest(), ...overrides });
const valid = values({ weight: '12', phone: '0912345678' });

describe('fields', () => {
  it('lists the C9 field names in form order', () => {
    expect(REQUEST_FIELDS).toEqual([
      'name',
      'company',
      'phone',
      'crane',
      'weight',
      'radius',
      'height',
      'site',
      'start',
      'duration',
      'message',
    ]);
    expect(Object.keys(emptyRequest())).toEqual([...REQUEST_FIELDS]);
  });

  it('formats a local ISO date', () => {
    expect(localIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('reads a crane id back from its option value', () => {
    expect(craneFromOption('crane:gmk6350')).toBe('gmk6350');
    expect(craneFromOption('crane:nope')).toBeNull();
    expect(craneFromOption('service:handling')).toBeNull();
    expect(craneFromOption('')).toBeNull();
  });
});

describe('validateRequest', () => {
  it('requires only phone and load weight, with the language’s messages', () => {
    const errors = validateRequest(emptyRequest(), ar, TODAY);
    expect(Object.keys(errors)).toEqual(['phone', 'weight']);
    expect(errors.phone).toBe(ar.form.fields.phone.empty);
    expect(errors.weight).toBe(ar.form.fields.weight.empty);
    expect(validateRequest(emptyRequest(), en, TODAY).weight).toBe(en.form.fields.weight.empty);
  });

  it('accepts Arabic-Indic digits in weight and phone', () => {
    expect(validateRequest(values({ weight: '٣٥٠', phone: '٠٩١٢٣٤٥٦٧٨' }), ar, TODAY)).toEqual({});
    expect(validateRequest(values({ weight: '7,5', phone: '+218 91 234 5678' }), ar, TODAY)).toEqual({});
  });

  it('rejects a weight that is not a number above zero', () => {
    for (const weight of ['0', 'abc', '-3', '1.2.3']) {
      expect(validateRequest(values({ ...valid, weight }), en, TODAY).weight, weight).toBe(en.form.fields.weight.format);
    }
  });

  it('rejects an incomplete phone number', () => {
    for (const phone of ['12', '091-234', 'call me']) {
      expect(validateRequest(values({ ...valid, phone }), en, TODAY).phone, phone).toBe(en.form.fields.phone.format);
    }
  });

  it('checks optional numbers only when they are filled in', () => {
    expect(validateRequest(values({ ...valid, radius: '', height: '' }), en, TODAY)).toEqual({});
    const errors = validateRequest(values({ ...valid, radius: 'x', height: '٠' }), en, TODAY);
    expect(errors.radius).toBe(en.form.fields.radius.format);
    expect(errors.height).toBe(en.form.fields.height.format);
  });

  it('enforces the length limits from the deck', () => {
    const errors = validateRequest(
      values({ ...valid, name: 'a'.repeat(81), company: 'b'.repeat(121), site: 'c'.repeat(201), message: 'd'.repeat(1001) }),
      en,
      TODAY,
    );
    expect(Object.keys(errors)).toEqual(['name', 'company', 'site', 'message']);
    expect(validateRequest(values({ ...valid, name: 'a'.repeat(80), message: 'd'.repeat(1000) }), en, TODAY)).toEqual({});
  });

  it('refuses a start date in the past', () => {
    expect(validateRequest(values({ ...valid, start: '2026-11-03' }), en, TODAY).start).toBe(en.form.fields.start.past);
    expect(validateRequest(values({ ...valid, start: TODAY }), en, TODAY)).toEqual({});
  });
});

describe('buildRequestMessage', () => {
  it('writes template D, normalising digits and dropping empty lines', () => {
    const message = buildRequestMessage(values({ weight: '٣٥٠', phone: '٠٩١٢٣٤٥٦٧٨', crane: 'crane:gmk6350' }), ar);
    expect(message).toBe(
      [
        'السلام عليكم، أطلس الصحراء.',
        'طلب من الموقع الإلكتروني:',
        'الهاتف: \u200E0912345678\u200E',
        'الرافعة أو الخدمة: Grove GMK6350',
        'وزن الحمولة: 350 طن',
      ].join('\n'),
    );
  });

  it('labels services, durations and formatted numbers in English', () => {
    const message = buildRequestMessage(
      values({
        weight: '1250.5',
        phone: '+218 91 234 5678',
        crane: 'service:oil-services',
        duration: 'week',
        radius: '۱۲٫۵',
        start: '2026-11-20',
      }),
      en,
    );
    expect(message).toContain('Crane or service: Oil services');
    expect(message).toContain('Load weight: 1,250.5 t');
    expect(message).toContain('Lift radius: 12.5 m');
    expect(message).toContain('Duration: Two days to a week');
    expect(message).toContain('Start date: 2026-11-20');
    expect(message).not.toContain('\u200E');
    expect(message).not.toContain('Lift height:');
    expect(message).not.toContain('{');
  });
});

describe('bidi-safe phone', () => {
  it('accepts a phone pasted with direction marks and cleans it', () => {
    const phone = '\u202A+218 91 234 5678\u202C';
    expect(validateRequest(values({ ...valid, phone }), en, TODAY)).toEqual({});
    expect(requestVars(values({ ...valid, phone }), en).phone).toBe('+218 91 234 5678');
    expect(buildRequestMessage(values({ ...valid, phone: '\u200E0912345678\u200E' }), ar)).toContain('\u200E0912345678\u200E');
    expect(buildRequestMessage(values({ ...valid, phone: '\u200E0912345678\u200E' }), ar)).not.toContain('\u200E\u200E');
  });
});

describe('handoffMessage', () => {
  it('caps the free-text message for the URL, while the payload keeps it all', () => {
    const long = values({ ...valid, message: 'x'.repeat(900) });
    expect(handoffMessage(long, en)).toContain('x'.repeat(HANDOFF_MESSAGE_MAX) + '…');
    expect(handoffMessage(long, en)).not.toContain('x'.repeat(HANDOFF_MESSAGE_MAX + 1));
    expect(requestPayload(long, en).message).toHaveLength(900);
    expect(handoffMessage(values({ ...valid, message: 'short' }), en)).toBe(
      buildRequestMessage(values({ ...valid, message: 'short' }), en),
    );
  });
});

describe('handoffMessage cut point', () => {
  it('never leaves a lone surrogate when an emoji straddles the cap', () => {
    const note = 'a'.repeat(HANDOFF_MESSAGE_MAX - 1) + '\u{1F477}' + 'tail';
    const message = handoffMessage(values({ ...valid, message: note }), en);
    expect(() => encodeURIComponent(message)).not.toThrow();
    expect(message).toContain('a'.repeat(HANDOFF_MESSAGE_MAX - 1) + '…');
  });

  it('keeps an Arabic letter together with its marks', () => {
    // the letter below carries shadda + fatha; the cut falls inside that cluster
    const withMarks = 'ا'.repeat(HANDOFF_MESSAGE_MAX - 2) + 'بّ\u064E' + 'tail';
    const message = handoffMessage(values({ ...valid, message: withMarks }), ar);
    expect(message).not.toContain('ب\u0651');
    expect(message).toContain('ا'.repeat(HANDOFF_MESSAGE_MAX - 2) + '…');
  });
});

describe('Arabic direction marks', () => {
  it('wraps phone and start date in U+200E in the Arabic message only', () => {
    const message = buildRequestMessage(values({ ...valid, start: '2026-11-20' }), ar);
    expect(message).toContain('الهاتف: \u200E0912345678\u200E');
    expect(message).toContain('تاريخ البدء: \u200E2026-11-20\u200E');
    expect(buildFollowUpMessage(values({ ...valid, name: 'سالم' }), ar)).toContain('\u200E0912345678\u200E');
    expect(requestPayload(valid, ar).phone).toBe('0912345678');
  });
});

describe('follow-up, email subject and payload', () => {
  it('uses template E when there is a name, else the general message', () => {
    expect(buildFollowUpMessage(values({ ...valid, name: 'Salem' }), en)).toBe(
      'Hello Atlas Alshraa,\nI just sent a request through your website. Name: Salem, phone: 0912345678.',
    );
    expect(buildFollowUpMessage(valid, en)).toBe(en.whatsapp.general);
  });

  it('names the crane or service in the email subject', () => {
    expect(emailSubject(values({ crane: 'crane:quy250' }), en)).toBe('Website request: Fuwa QUY250');
    expect(emailSubject(emptyRequest(), ar)).toBe('طلب من الموقع: لست متأكداً، ساعدوني في الاختيار');
  });

  it('posts normalised values, the language and the message', () => {
    const payload = requestPayload(values({ weight: '٣٥٠', phone: '٠٩١٢٣٤٥٦٧٨' }), ar);
    expect(payload).toMatchObject({ lang: 'ar', weight: '350', phone: '0912345678', crane: '' });
    expect(payload.summary).toBe(buildRequestMessage(values({ weight: '٣٥٠', phone: '٠٩١٢٣٤٥٦٧٨' }), ar));
    expect(payload._subject).toBe('طلب من الموقع: لست متأكداً، ساعدوني في الاختيار');
  });
});

import { cranes } from '@/content';
import type { Copy, CraneId, DurationId, ServiceId } from '@/content/types';
import { parseDecimal, toAsciiDigits } from '@/lib/digits';
import { formatNumber } from '@/lib/numbers';
import { fillTemplate } from '@/lib/whatsapp';

/** C9 input names, in the order the form shows them. */
export const REQUEST_FIELDS = [
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
] as const;
export type RequestField = (typeof REQUEST_FIELDS)[number];
export type RequestValues = Record<RequestField, string>;
export type RequestErrors = Partial<Record<RequestField, string>>;

/** Copy deck §9 limits. */
export const LIMITS = { name: 80, company: 120, site: 200, message: 1000 } as const;
export const DURATIONS: readonly DurationId[] = ['day', 'week', 'month', 'long'];

export function emptyRequest(): RequestValues {
  return {
    name: '',
    company: '',
    phone: '',
    crane: '',
    weight: '',
    radius: '',
    height: '',
    site: '',
    start: '',
    duration: '',
    message: '',
  };
}

/** YYYY-MM-DD in the visitor's own time zone (what <input type="date"> uses). */
export function localIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function craneOptionValue(id: CraneId): string {
  return `crane:${id}`;
}

export function serviceOptionValue(id: ServiceId): string {
  return `service:${id}`;
}

export function craneFromOption(value: string): CraneId | null {
  if (!value.startsWith('crane:')) return null;
  const id = value.slice('crane:'.length);
  return cranes.some((c) => c.id === id && !c.hidden) ? (id as CraneId) : null;
}

export function craneOrServiceLabel(value: string, copy: Copy): string {
  const craneId = craneFromOption(value);
  if (craneId) {
    const crane = cranes.find((c) => c.id === craneId);
    return crane ? `${crane.make} ${crane.model}` : '';
  }
  return copy.services.items.find((s) => serviceOptionValue(s.id) === value)?.title ?? '';
}

const INVISIBLE = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\u061C\uFEFF]/g;
/** Phone as typed, minus direction marks and invisible characters (pasted numbers often carry them). */
const cleanPhone = (raw: string) => toAsciiDigits(raw.replace(INVISIBLE, '')).trim();

const isPositive = (raw: string) => {
  const n = parseDecimal(raw);
  return n !== null && n > 0;
};

/**
 * Copy-deck §9 rules: only phone and weight are required; Arabic-Indic digits
 * are accepted. Keys come back in form order, so the error summary follows it.
 */
export function validateRequest(values: RequestValues, copy: Copy, today: string = localIsoDate(new Date())): RequestErrors {
  const f = copy.form.fields;
  const v = (key: RequestField) => values[key].trim();
  const errors: RequestErrors = {};

  if (v('name').length > LIMITS.name) errors.name = f.name.tooLong;
  if (v('company').length > LIMITS.company) errors.company = f.company.tooLong;

  const phone = cleanPhone(values.phone);
  const digits = phone.replace(/\D/g, '').length;
  if (!phone) errors.phone = f.phone.empty;
  else if (!/^\+?[\d\s\-().]+$/.test(phone) || digits < 7 || digits > 15) errors.phone = f.phone.format;

  if (!v('weight')) errors.weight = f.weight.empty;
  else if (!isPositive(v('weight'))) errors.weight = f.weight.format;
  if (v('radius') && !isPositive(v('radius'))) errors.radius = f.radius.format;
  if (v('height') && !isPositive(v('height'))) errors.height = f.height.format;

  if (v('site').length > LIMITS.site) errors.site = f.site.tooLong;
  if (v('start') && v('start') < today) errors.start = f.start.past;
  if (values.message.length > LIMITS.message) errors.message = f.message.tooLong;

  return errors;
}

/** Normalised, human-readable values: ASCII digits, formatted numbers, labels instead of option values. */
export function requestVars(values: RequestValues, copy: Copy): RequestValues {
  const num = (raw: string) => {
    const n = parseDecimal(raw);
    return n === null ? '' : formatNumber(n, copy.lang);
  };
  const duration = (DURATIONS as readonly string[]).includes(values.duration)
    ? copy.form.fields.duration.options[values.duration as DurationId]
    : '';
  return {
    name: values.name.trim(),
    company: values.company.trim(),
    phone: cleanPhone(values.phone),
    crane: craneOrServiceLabel(values.crane, copy),
    weight: num(values.weight),
    radius: num(values.radius),
    height: num(values.height),
    site: values.site.trim(),
    start: values.start,
    duration,
    message: values.message.trim(),
  };
}

const LRM = '\u200E';

/** In Arabic text, digits and dates keep their order when wrapped in left-to-right marks. */
function directional(vars: RequestValues, copy: Copy): Record<string, string> {
  if (copy.lang !== 'ar') return { ...vars };
  const wrap = (v: string) => (v ? `${LRM}${v}${LRM}` : v);
  return { ...vars, phone: wrap(vars.phone), start: wrap(vars.start) };
}

/** WhatsApp template D: a line whose field is empty is dropped (deck §10). */
export function buildRequestMessage(values: RequestValues, copy: Copy): string {
  const vars = directional(requestVars(values, copy), copy);
  return copy.whatsapp.request
    .split('\n')
    .filter((line) => Array.from(line.matchAll(/\{(\w+)\}/g), (m) => m[1] ?? '').every((key) => Boolean(vars[key])))
    .map((line) => fillTemplate(line, vars))
    .join('\n');
}

/** Longest free-text note that goes into a wa.me / mailto URL. */
export const HANDOFF_MESSAGE_MAX = 500;

/** Longest prefix of whole graphemes (or code points, without Intl.Segmenter) that fits in `max` UTF-16 units. */
function cutGraphemes(text: string, max: number): string {
  const pieces: Iterable<string> =
    typeof Intl !== 'undefined' && 'Segmenter' in Intl
      ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), (s) => s.segment)
      : Array.from(text);
  let out = '';
  for (const piece of pieces) {
    if (out.length + piece.length > max) break;
    out += piece;
  }
  return out;
}

/** Template D for the no-endpoint hand-off: the note is capped so the URL stays short. */
export function handoffMessage(values: RequestValues, copy: Copy): string {
  const note = values.message.trim();
  const capped = note.length > HANDOFF_MESSAGE_MAX ? `${cutGraphemes(note, HANDOFF_MESSAGE_MAX).trimEnd()}…` : note;
  return buildRequestMessage({ ...values, message: capped }, copy);
}

/** Template E after a successful send; the general message when no name was given. */
export function buildFollowUpMessage(values: RequestValues, copy: Copy): string {
  const { name, phone } = directional(requestVars(values, copy), copy);
  return name ? fillTemplate(copy.whatsapp.followUp, { name, phone }) : copy.whatsapp.general;
}

export function emailSubject(values: RequestValues, copy: Copy): string {
  return fillTemplate(copy.form.emailSubject, { crane: craneOrServiceLabel(values.crane, copy) || copy.form.fields.crane.unsure });
}

/** JSON body for VITE_FORM_ENDPOINT (Formspree-style `_subject`). */
export function requestPayload(values: RequestValues, copy: Copy) {
  return {
    lang: copy.lang,
    ...requestVars(values, copy),
    _subject: emailSubject(values, copy),
    summary: buildRequestMessage(values, copy),
  };
}

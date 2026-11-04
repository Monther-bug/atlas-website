import type { Lang } from '@/content/types';

/**
 * Spec §3: Western digits in both languages, a fixed '.' decimal and ',' grouping.
 * The `-u-nu-latn` extension is the same as `{ numberingSystem: 'latn' }`. Never use bare 'ar'.
 */
const LOCALE: Record<Lang, string> = { ar: 'ar-LY-u-nu-latn', en: 'en-GB-u-nu-latn' };
const UNITS = {
  tonnes: { ar: 'طن', en: 't' },
  metres: { ar: 'م', en: 'm' },
} as const;
const NBSP = '\u00A0'; // no-break space (U+202F is in none of the fonts)
const BIDI_MARKS = /[\u061C\u200E\u200F]/g; // ALM, LRM, RLM

const formatters = new Map<string, Intl.NumberFormat>();

function clampFractionDigits(d: number): number {
  return Number.isFinite(d) ? Math.min(20, Math.max(0, Math.trunc(d))) : 2;
}

function formatter(lang: Lang, maximumFractionDigits: number): Intl.NumberFormat {
  const digits = clampFractionDigits(maximumFractionDigits);
  const key = `${lang}:${digits}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: digits, minimumFractionDigits: 0 });
    formatters.set(key, f);
  }
  return f;
}

export function formatNumber(n: number, lang: Lang, opts: { maximumFractionDigits?: number } = {}): string {
  if (!Number.isFinite(n)) throw new RangeError(`formatNumber: not a finite number (${n})`);
  const out = formatter(lang, opts.maximumFractionDigits ?? 2)
    .formatToParts(n)
    .map((part) => {
      if (part.type === 'decimal') return '.';
      if (part.type === 'group') return ',';
      if (part.type === 'minusSign') return '-';
      return part.value;
    })
    .join('')
    .replace(BIDI_MARKS, '');
  // Negative zero (-0, or -0.001 rounded to 2 places) renders as "-0": drop the sign.
  return /^-[0.,]*$/.test(out) ? out.slice(1) : out;
}

export function formatTonnes(n: number, lang: Lang): string {
  return `${formatNumber(n, lang)}${NBSP}${UNITS.tonnes[lang]}`;
}

export function formatMetres(n: number, lang: Lang): string {
  return `${formatNumber(n, lang)}${NBSP}${UNITS.metres[lang]}`;
}

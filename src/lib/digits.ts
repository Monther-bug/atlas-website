const ARABIC_INDIC = /[٠-٩]/g; // ٠–٩
const PERSIAN = /[۰-۹]/g; // ۰–۹

/** ٠–٩ and ۰–۹ → 0–9, '٫' → '.', '٬' → ''. Everything else is unchanged. For numeric fields only: '٬' is removed anywhere. */
export function toAsciiDigits(input: string): string {
  return input
    .replace(ARABIC_INDIC, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(PERSIAN, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, '.')
    .replace(/٬/g, '');
}

/**
 * Parses a non-negative decimal typed by a visitor, in any digit system.
 * Accepts "12", "12.5", ".5", "7,5" (comma decimal, 1–2 places) and "1,250"
 * (comma grouping). Returns null for empty or anything else.
 */
export function parseDecimal(input: string): number | null {
  const s = toAsciiDigits(input).replace(/[\s\u200B-\u200F\u202A-\u202E\u2066-\u2069\u061C\uFEFF]/g, '');
  if (s === '') return null;
  let normalised: string;
  if (/^[1-9]\d{0,2}(,\d{3})+(\.\d+)?$/.test(s)) normalised = s.replace(/,/g, '');
  else if (/^\d+,\d{1,2}$/.test(s)) normalised = s.replace(',', '.');
  else if (/^(\d+\.?\d*|\.\d+)$/.test(s)) normalised = s;
  else return null;
  const n = Number(normalised);
  return Number.isFinite(n) ? n : null;
}

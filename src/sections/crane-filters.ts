import type { CapacityBand, Copy, Crane, CraneType } from '@/content/types';
import { formatNumber, formatTonnes } from '@/lib/numbers';
import { fillTemplate } from '@/lib/whatsapp';

/** C9 filter chip values. */
export type FilterValue = 'all' | CraneType | `band:${CapacityBand}`;

export const TYPE_ORDER: readonly CraneType[] = ['rough-terrain', 'all-terrain', 'crawler'];
export const BAND_ORDER: readonly CapacityBand[] = ['0-60', '61-200', '201+'];

/** Deck §6: "Up to 60 t" includes 60; "60–200 t" means above 60 up to 200. */
export function bandOf(capacityT: number): CapacityBand {
  if (capacityT <= 60) return '0-60';
  if (capacityT <= 200) return '61-200';
  return '201+';
}

/** Type chips for every type on show; band chips only once every visible crane is verified (spec §5.5). */
export function availableFilters(cranes: readonly Crane[]): { types: CraneType[]; bands: CapacityBand[] } {
  const types = TYPE_ORDER.filter((type) => cranes.some((c) => c.type === type));
  const allVerified = cranes.length > 0 && cranes.every((c) => c.verified);
  const bands = allVerified ? BAND_ORDER.filter((band) => cranes.some((c) => bandOf(c.capacityT) === band)) : [];
  return { types, bands };
}

export function applyFilter(cranes: readonly Crane[], value: FilterValue): Crane[] {
  if (value === 'all') return [...cranes];
  if (value.startsWith('band:')) {
    const band = value.slice('band:'.length) as CapacityBand;
    return cranes.filter((c) => bandOf(c.capacityT) === band);
  }
  return cranes.filter((c) => c.type === value);
}

/** Arabic: 1 and 2 are words; 3–10 take the plural; 11 and up take the singular (valid for n < 100). */
export function resultCount(n: number, copy: Copy): string {
  const { one, two, few, many } = copy.grid.count;
  const template = n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? few : many;
  return fillTemplate(template, { n: formatNumber(n, copy.lang) });
}

export function bandLabel(band: CapacityBand, copy: Copy): string {
  const { lang } = copy;
  const template = copy.grid.bands[band];
  if (band === '0-60') return fillTemplate(template, { max: formatTonnes(60, lang) });
  if (band === '61-200') return fillTemplate(template, { min: formatNumber(60, lang), max: formatTonnes(200, lang) });
  return fillTemplate(template, { min: formatTonnes(200, lang) });
}

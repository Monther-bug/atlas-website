import type { CraneSpec, CraneSpecSource } from './crane-specs';
import type { Copy, Lang, SpecFieldId, SpecUnit } from './types';
import { formatNumber } from '@/lib/numbers';

/**
 * Turns a manufacturer specification (crane-specs.ts) into labelled, formatted rows for <SpecList> and
 * <CompareTable>. Fields the source omits produce no row: nothing is estimated (spec §3, v2 floor §16.17).
 * `country` is left out of the default order: for the ATF 60-3 it is inferred from the publisher's address.
 */
export const SPEC_ORDER: readonly SpecFieldId[] = [
  'maxCapacity',
  'capacityRadius',
  'boom',
  'tipHeight',
  'jib',
  'tipHeightJib',
  'maxRadius',
  'counterweight',
  'axles',
  'drive',
  'enginePower',
  'engine',
  'travelSpeed',
  'gradeability',
  'transportWeight',
  'dimensions',
  'trackWidth',
  'groundPressure',
];

/** The CraneSpec keys behind each row (a row's source is the first key that has one). */
const KEYS: Record<SpecFieldId, readonly (keyof CraneSpec)[]> = {
  maxCapacity: ['maxCapacityT'],
  capacityRadius: ['maxCapacityRadiusM'],
  boom: ['boomMinM', 'boomMaxM'],
  tipHeight: ['tipHeightM'],
  jib: ['jibMaxM'],
  tipHeightJib: ['tipHeightJibM'],
  maxRadius: ['maxRadiusM'],
  counterweight: ['counterweightT'],
  axles: ['axles'],
  drive: ['drive'],
  engine: ['engineMake'],
  enginePower: ['enginePowerKw'],
  travelSpeed: ['travelSpeedKmh'],
  gradeability: ['gradeabilityPct'],
  transportWeight: ['transportWeightT'],
  dimensions: ['dimensionsM'],
  trackWidth: ['trackWidthM'],
  groundPressure: ['groundPressureMpa'],
  country: ['countryOfManufacture'],
};

const UNIT: Partial<Record<SpecFieldId, SpecUnit>> = {
  maxCapacity: 't',
  capacityRadius: 'm',
  boom: 'm',
  tipHeight: 'm',
  jib: 'm',
  tipHeightJib: 'm',
  maxRadius: 'm',
  counterweight: 't',
  enginePower: 'kw',
  travelSpeed: 'kmh',
  gradeability: 'pct',
  transportWeight: 't',
  dimensions: 'm',
  trackWidth: 'm',
  groundPressure: 'mpa',
};

const COUNTRY: Record<string, { ar: string; en: string }> = {
  Germany: { ar: 'ألمانيا', en: 'Germany' },
  China: { ar: 'الصين', en: 'China' },
};

export interface SpecRow {
  id: SpecFieldId;
  label: string;
  /** Formatted number(s) or text, without the unit. */
  value: string;
  /** Localised unit, when the field has one. */
  unit?: string;
  /** Latin names and codes (engine make, drive formula): render inside <bdi lang="en">. */
  latin?: boolean;
  source?: CraneSpecSource;
}

const num = (n: number, lang: Lang) => formatNumber(n, lang, { maximumFractionDigits: 3 });

function valueOf(id: SpecFieldId, spec: CraneSpec, lang: Lang): { value: string; latin?: boolean } | null {
  switch (id) {
    case 'boom': {
      const { boomMinM: min, boomMaxM: max } = spec;
      if (min !== undefined && max !== undefined) {
        return { value: lang === 'ar' ? `من ${num(min, lang)} إلى ${num(max, lang)}` : `${num(min, lang)}–${num(max, lang)}` };
      }
      const one = max ?? min;
      return one === undefined ? null : { value: num(one, lang) };
    }
    case 'dimensions': {
      const d = spec.dimensionsM;
      return d ? { value: `${num(d.l, lang)} × ${num(d.w, lang)} × ${num(d.h, lang)}` } : null;
    }
    case 'drive':
      return spec.drive ? { value: spec.drive, latin: true } : null;
    case 'engine':
      return spec.engineMake ? { value: spec.engineMake, latin: true } : null;
    case 'country': {
      const c = spec.countryOfManufacture;
      if (!c) return null;
      const known = COUNTRY[c];
      return known ? { value: known[lang] } : { value: c, latin: true };
    }
    default: {
      const key = KEYS[id][0];
      const raw = key ? spec[key] : undefined;
      return typeof raw === 'number' && Number.isFinite(raw) ? { value: num(raw, lang) } : null;
    }
  }
}

export function specRows(spec: CraneSpec, copy: Copy, lang: Lang, fields: readonly SpecFieldId[] = SPEC_ORDER): SpecRow[] {
  const rows: SpecRow[] = [];
  for (const id of fields) {
    const v = valueOf(id, spec, lang);
    if (!v) continue;
    const unitId = UNIT[id];
    const source = KEYS[id].map((key) => spec.sources.find((s) => s.field === key)).find(Boolean);
    rows.push({
      id,
      label: copy.specs.fields[id],
      value: v.value,
      ...(unitId ? { unit: copy.specs.units[unitId] } : {}),
      ...(v.latin ? { latin: true } : {}),
      ...(source ? { source } : {}),
    });
  }
  return rows;
}

/** The union of fields any of `specs` has, in SPEC_ORDER: the row set for a comparison table. */
export function sharedFields(specs: readonly CraneSpec[], copy: Copy, lang: Lang, fields: readonly SpecFieldId[] = SPEC_ORDER): SpecFieldId[] {
  return fields.filter((id) => specs.some((spec) => specRows(spec, copy, lang, [id]).length > 0));
}

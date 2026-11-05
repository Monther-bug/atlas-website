import { craneSpecs, type CraneSpec, type CraneSpecId, type CraneSpecSource } from '@/content/crane-specs';
import { specRows } from '@/content/spec-rows';
import type { Copy, Crane, CraneId, CraneListCopy, Lang, SpecFieldId, SpecGroupId } from '@/content/types';
import { formatNumber, formatTonnes } from '@/lib/numbers';
import { fillTemplate } from '@/lib/whatsapp';

/**
 * Pure data for the «اعثر على رافعتك» lineup: spec groups, cells, the load check and the comparison selection.
 * Every figure comes from crane-specs.ts (manufacturer data) or cranes.ts (the rating shown on the cards). Nothing
 * here estimates: a field the source omits produces no value.
 */

/** A row of the sheet and the comparison. Dimensions are split so the comparison can read length against length. */
export type RowId = Exclude<SpecFieldId, 'dimensions' | 'country'> | 'length' | 'width' | 'height';

export const SPEC_GROUPS: readonly { id: SpecGroupId; rows: readonly RowId[] }[] = [
  { id: 'lifting', rows: ['maxCapacity', 'capacityRadius', 'counterweight'] },
  { id: 'boom', rows: ['boom', 'tipHeight', 'jib', 'tipHeightJib', 'maxRadius'] },
  { id: 'carrier', rows: ['axles', 'drive', 'trackWidth', 'groundPressure'] },
  { id: 'engine', rows: ['engine', 'enginePower', 'travelSpeed', 'gradeability'] },
  { id: 'dimensions', rows: ['transportWeight', 'length', 'width', 'height'] },
];

/** id of the detail sheet's <dialog> (rendered on demand by CraneList). */
export const SHEET_ID = 'crane-sheet';

export function specIdOf(id: CraneId): CraneSpecId | null {
  return Object.prototype.hasOwnProperty.call(craneSpecs, id) ? (id as CraneSpecId) : null;
}

export function specOf(crane: Crane): CraneSpec | null {
  const id = specIdOf(crane.id);
  return id ? craneSpecs[id] : null;
}

const DIM = { length: 'l', width: 'w', height: 'h' } as const;
type DimRow = keyof typeof DIM;
const isDim = (row: RowId): row is DimRow => row in DIM;

/** The number behind a row, for the comparison's magnitude bars (ranges use their top end). Capability rows only. */
const MAGNITUDE: Partial<Record<RowId, (s: CraneSpec) => number | undefined>> = {
  maxCapacity: (s) => s.maxCapacityT,
  boom: (s) => s.boomMaxM ?? s.boomMinM,
  tipHeight: (s) => s.tipHeightM,
  jib: (s) => s.jibMaxM,
  tipHeightJib: (s) => s.tipHeightJibM,
  maxRadius: (s) => s.maxRadiusM,
  counterweight: (s) => s.counterweightT,
  enginePower: (s) => s.enginePowerKw,
  travelSpeed: (s) => s.travelSpeedKmh,
};
// No bars on weights and dimensions: there, a longer bar is not "more crane".

export const hasBar = (row: RowId): boolean => row in MAGNITUDE;

export function magnitude(spec: CraneSpec, row: RowId): number | undefined {
  const v = MAGNITUDE[row]?.(spec);
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined;
}

/** Largest value of a row across `specs`: the fixed scale of its bars (the same scale whichever models are picked). */
export function rowMax(specs: readonly CraneSpec[], row: RowId): number | undefined {
  const values = specs.map((s) => magnitude(s, row)).filter((v): v is number => v !== undefined);
  return values.length ? Math.max(...values) : undefined;
}

export interface SpecCell {
  /** Formatted value; the unit is joined with a no-break space. */
  text: string;
  /** Latin names and codes: render inside <bdi lang="en">. */
  latin: boolean;
  /** true when the figure comes from a spec database rather than the manufacturer's own document. */
  secondary: boolean;
  /** true on a maximum that is the site's figure, not the manufacturer's listed one (a † and the rating note). */
  conflict?: boolean;
  source?: CraneSpecSource;
}

/**
 * The maximum-capacity cell: the figure the cards and the Hoist show (cranes.ts), so a model never reads as two
 * capacities on one page. Where the manufacturer lists another maximum (QUY250: 260 t), the cell is marked and the
 * rating note (capacityNotes) gives both. null when the spec agrees (use specCell).
 */
export function capacityCell(crane: Crane, spec: CraneSpec, copy: Copy, lang: Lang): SpecCell | null {
  if (spec.maxCapacityT === undefined || spec.maxCapacityT === crane.capacityT) return null;
  return { text: `${formatNumber(crane.capacityT, lang)}${NBSP}${copy.specs.units.t}`, latin: false, secondary: false, conflict: true };
}

const NBSP = ' ';

export function specCell(spec: CraneSpec, row: RowId, copy: Copy, lang: Lang): SpecCell | null {
  if (isDim(row)) {
    const d = spec.dimensionsM;
    if (!d) return null;
    const source = spec.sources.find((s) => s.field === 'dimensionsM');
    const value = formatNumber(d[DIM[row]], lang, { maximumFractionDigits: 3 });
    return { text: `${value}${NBSP}${copy.specs.units.m}`, latin: false, secondary: source ? !source.official : false, source };
  }
  const r = specRows(spec, copy, lang, [row])[0];
  if (!r) return null;
  return {
    text: r.unit ? `${r.value}${NBSP}${r.unit}` : r.value,
    latin: r.latin === true,
    secondary: r.source ? !r.source.official : false,
    source: r.source,
  };
}

export function rowLabel(row: RowId, copy: Copy, text: CraneListCopy): string {
  return isDim(row) ? text.dims[row] : copy.specs.fields[row];
}

/* ── Load check ───────────────────────────────────────────────────── */

/** "3 models have a maximum rating of 120 t or more." Arabic plural forms as in resultCount (n < 100). */
export function loadResult(n: number, tonnes: number, text: CraneListCopy, lang: Lang): string {
  const { none, one, two, few, many } = text.load.result;
  const template = n === 0 ? none : n === 1 ? one : n === 2 ? two : n <= 10 ? few : many;
  return fillTemplate(template, { n: formatNumber(n, lang), load: formatTonnes(tonnes, lang) });
}

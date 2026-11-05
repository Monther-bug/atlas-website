import { craneSpecs, type CraneSpec, type CraneSpecId, type CraneSpecSource } from '@/content/crane-specs';
import { specRows } from '@/content/spec-rows';
import type { Copy, Crane, CraneId, CraneListCopy, Lang, SpecFieldId, SpecGroupId } from '@/content/types';
import { formatNumber } from '@/lib/numbers';

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

/** A row's figure and unit apart (the comparison sets the figure large, the unit small); null when the source omits it. */
export interface SpecParts {
  value: string;
  unit?: string;
  latin: boolean;
  secondary: boolean;
  source?: CraneSpecSource;
}

export function specParts(spec: CraneSpec, row: RowId, copy: Copy, lang: Lang): SpecParts | null {
  if (isDim(row)) {
    const d = spec.dimensionsM;
    if (!d) return null;
    const source = spec.sources.find((s) => s.field === 'dimensionsM');
    const value = formatNumber(d[DIM[row]], lang, { maximumFractionDigits: 3 });
    return { value, unit: copy.specs.units.m, latin: false, secondary: source ? !source.official : false, source };
  }
  const r = specRows(spec, copy, lang, [row])[0];
  if (!r) return null;
  return { value: r.value, unit: r.unit, latin: r.latin === true, secondary: r.source ? !r.source.official : false, source: r.source };
}

export function specCell(spec: CraneSpec, row: RowId, copy: Copy, lang: Lang): SpecCell | null {
  const p = specParts(spec, row, copy, lang);
  return p && { text: p.unit ? `${p.value}${NBSP}${p.unit}` : p.value, latin: p.latin, secondary: p.secondary, source: p.source };
}

/** Unique source documents of one machine, manufacturer documents first (the sheet and the comparison). */
export function sourcesOf(spec: CraneSpec): CraneSpecSource[] {
  const seen = new Map<string, CraneSpecSource>();
  for (const s of spec.sources) if (!seen.has(s.url)) seen.set(s.url, s);
  return [...seen.values()].sort((a, b) => Number(b.official) - Number(a.official));
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function rowLabel(row: RowId, copy: Copy, text: CraneListCopy): string {
  return isDim(row) ? text.dims[row] : copy.specs.fields[row];
}

/* ── Load check ───────────────────────────────────────────────────── */

// The load check's sentence lives with the load check, so the lineup chunk does not pull in crane-specs.ts.
export { loadResult } from './load';

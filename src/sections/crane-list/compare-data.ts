import type { CraneSpec } from '@/content/crane-specs';
import type { Copy, Crane, CraneListCopy, Lang, SpecGroupId } from '@/content/types';
import { formatMetres, formatNumber } from '@/lib/numbers';
import { fillTemplate } from '@/lib/whatsapp';
import { specParts, type RowId, type SpecParts } from './lineup-data';

/**
 * Data for «قارن الطرازات» (CompareModels.tsx): the key rows a site manager decides with, shown by default, and every
 * other figure, grouped, on demand. Every value comes from crane-specs.ts, except the capacity (the figure the cards
 * show, cranes.ts) and the carrier type (the card's type chip). Nothing here estimates: a missing figure is null.
 */

export type KeyRowId = 'capacity' | 'boom' | 'tipHeight' | 'counterweight' | 'carrier' | 'enginePower' | 'transportWeight';

export const KEY_ROWS: readonly KeyRowId[] = ['capacity', 'boom', 'tipHeight', 'counterweight', 'carrier', 'enginePower', 'transportWeight'];

/**
 * The rest of the specification. The key rows already show the maximum and its radius, the boom, the boom-only tip
 * height, the counterweight, axles and drive, engine power and basic weight, so those are not repeated.
 */
export const MORE_GROUPS: readonly { id: SpecGroupId; rows: readonly RowId[] }[] = [
  { id: 'boom', rows: ['jib', 'tipHeightJib', 'maxRadius'] },
  { id: 'carrier', rows: ['trackWidth', 'groundPressure'] },
  { id: 'engine', rows: ['engine', 'travelSpeed', 'gradeability'] },
  { id: 'dimensions', rows: ['length', 'width', 'height'] },
];

/** A piece of a caption; Latin codes (drive formulas) render inside <bdi lang="en">. */
export interface CaptionPart {
  text: string;
  latin?: boolean;
}

export interface CompareCell extends SpecParts {
  /** A word, not a figure (the carrier type): set smaller than the numbers. */
  word?: boolean;
  /** A short qualifier under the value: the radius of the maximum, "with jib", axles and drive. */
  caption?: CaptionPart[];
  /** Capacity only: share of the largest capacity in the lineup (one fixed scale, 0–1). */
  bar?: number;
}

/** "6 axles" with the Arabic forms for 1, 2, 3–10 and 11+. */
export function axlesText(n: number, text: CraneListCopy, lang: Lang): string {
  const { one, two, few, many } = text.compare.axles;
  return fillTemplate(n === 1 ? one : n === 2 ? two : n <= 10 ? few : many, { n: formatNumber(n, lang) });
}

/** One key cell. `maxT` is the largest capacity in the lineup (the bar's scale). */
export function keyCell(row: KeyRowId, crane: Crane, spec: CraneSpec, copy: Copy, text: CraneListCopy, lang: Lang, maxT: number): CompareCell | null {
  switch (row) {
    case 'capacity': {
      // The figure the cards and the Hoist show. Where the manufacturer lists another maximum (QUY250: 260 t), the
      // caption says so as the cards do, and the column's note gives both figures.
      const differs = spec.maxCapacityT !== undefined && spec.maxCapacityT !== crane.capacityT;
      const radius = spec.maxCapacityRadiusM;
      const caption = differs
        ? text.conflict.label
        : radius !== undefined
          ? fillTemplate(copy.grid.card.atRadius, { radius: formatMetres(radius, lang) })
          : undefined;
      return {
        value: formatNumber(crane.capacityT, lang, { maximumFractionDigits: 1 }),
        unit: copy.specs.units.t,
        latin: false,
        secondary: false,
        ...(caption ? { caption: [{ text: caption }] } : {}),
        ...(maxT > 0 ? { bar: Math.min(1, crane.capacityT / maxT) } : {}),
      };
    }
    case 'tipHeight': {
      const own = specParts(spec, 'tipHeight', copy, lang);
      if (own) return own;
      const jib = specParts(spec, 'tipHeightJib', copy, lang);
      return jib ? { ...jib, caption: [{ text: text.compare.withJib }] } : null;
    }
    case 'carrier': {
      const caption: CaptionPart[] = [];
      if (spec.axles !== undefined) caption.push({ text: axlesText(spec.axles, text, lang) });
      if (spec.drive) caption.push({ text: spec.drive, latin: true });
      const axles = spec.sources.find((s) => s.field === 'axles');
      return {
        value: copy.craneTypes[crane.type].chip,
        latin: false,
        word: true,
        secondary: axles ? !axles.official : false,
        ...(caption.length ? { caption } : {}),
      };
    }
    default:
      return specParts(spec, row, copy, lang);
  }
}

export function keyLabel(row: KeyRowId, copy: Copy, text: CraneListCopy): string {
  switch (row) {
    case 'capacity':
      return copy.specs.fields.maxCapacity;
    case 'carrier':
      return text.groups.carrier;
    default:
      return copy.specs.fields[row];
  }
}

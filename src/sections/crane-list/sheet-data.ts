import type { CraneSpec, CraneSpecId, CraneSpecSource } from '@/content/crane-specs';
import type { Copy, Crane, CraneListCopy, Lang, SpecGroupId } from '@/content/types';
import type { PhotoId } from '@/generated/images';
import { fillTemplate } from '@/lib/whatsapp';
import { SPEC_GROUPS, capacityCell, rowLabel, specCell, specIdOf, type RowId, type SpecCell } from './lineup-data';

/* Data only the detail sheet needs: kept beside the lazy CraneSheet chunk, out of the initial bundle. */

/** Photos per crane, lead first (v2 spec §7; Kobelco excluded). The lead is the card photo. */
export const CRANE_PHOTOS: Record<CraneSpecId, readonly PhotoId[]> = {
  rt700e: ['6363', '6364', '6359', '6360'],
  'atf60-3': ['6397', '6395', '6396'],
  'ac200-1': ['6376', '6375', '6374', '6379'],
  quy250: ['6380', '6385', '6382'],
  gmk6350: ['6392', '6389', '6388', '6393'],
};

export function photosOf(crane: Crane): readonly PhotoId[] {
  const id = specIdOf(crane.id);
  return id ? CRANE_PHOTOS[id] : [crane.cardPhoto];
}

/**
 * Groups with the rows `spec` has, for one machine (the sheet). Missing rows are left out, never shown as "—". With
 * `crane`, the maximum is the figure the cards show (capacityCell), so the sheet never contradicts its own headline.
 */
export function specGroups(
  spec: CraneSpec,
  copy: Copy,
  text: CraneListCopy,
  lang: Lang,
  crane?: Crane,
): { id: SpecGroupId; rows: { id: RowId; label: string; cell: SpecCell }[] }[] {
  return SPEC_GROUPS.map((group) => ({
    id: group.id,
    rows: group.rows.flatMap((id) => {
      const own = crane && id === 'maxCapacity' ? capacityCell(crane, spec, copy, lang) : null;
      const cell = own ?? specCell(spec, id, copy, lang);
      return cell ? [{ id, label: rowLabel(id, copy, text), cell }] : [];
    }),
  })).filter((group) => group.rows.length > 0);
}

/** Unique source documents of one machine, manufacturer documents first. */
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

/** Template B (copy deck §10), the same message the request bar sends. */
export function craneMessage(crane: Crane, copy: Copy): string {
  return fillTemplate(copy.whatsapp.crane, { model: `${crane.make} ${crane.model}`, class: copy.craneTypes[crane.type].chip });
}

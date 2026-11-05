import { visibleCranes } from '@/content';
import { cranePageCopy } from '@/content/crane-page-copy';
import { craneListCopy } from '@/content/crane-list-copy';
import type { CraneSpec } from '@/content/crane-specs';
import type { Copy, Crane, CranePhotoId, Lang } from '@/content/types';
import { formatMetres, formatNumber } from '@/lib/numbers';
import { fillTemplate } from '@/lib/whatsapp';
import { ratingDiffers, ratingRadius } from '@/sections/crane-list/card-facts';
import { specIdOf, specOf } from '@/sections/crane-list/lineup-data';
import { photosOf, specGroups } from '@/sections/crane-list/sheet-data';

/**
 * The facts of one crane page, derived from cranes.ts (the capacity the whole site shows) and crane-specs.ts (the
 * manufacturer's figures). Prerender-only (the page body is a static island). Nothing is estimated: a figure the
 * source omits produces nothing, and a comparison is only ever among the five models on this site.
 */

const NBSP = ' ';
const n = (v: number, lang: Lang) => formatNumber(v, lang, { maximumFractionDigits: 3 });
const decimalsOf = (v: number) => (Number.isInteger(v) ? 0 : (String(v).split('.')[1]?.length ?? 0));

export const nameOf = (crane: Crane) => `${crane.make} ${crane.model}`;
const capitalise = (s: string, lang: Lang) => (lang === 'en' ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** The capacity as the cards and the Hoist show it ('317.5 t'), and what to call it. */
export function rating(crane: Crane, copy: Copy, lang: Lang) {
  const radius = ratingRadius(crane);
  const conflict = ratingDiffers(crane);
  const figure = formatNumber(crane.capacityT, lang, { maximumFractionDigits: 1 });
  const extra = craneListCopy[lang];
  const at = radius !== undefined ? ` ${fillTemplate(copy.grid.card.atRadius, { radius: formatMetres(radius, lang) })}` : '';
  return {
    figure,
    decimals: decimalsOf(crane.capacityT),
    text: `${figure}${NBSP}${copy.hoist.unit}`,
    radius,
    conflict,
    label: `${copy.grid.card.capacity}${at} · ${conflict ? extra.conflict.label : copy.grid.card.rating}`,
    /** The same without "Max capacity", under a heading that already says it. */
    sub: `${at ? `${capitalise(at.trim(), lang)} · ` : ''}${conflict ? extra.conflict.label : copy.grid.card.rating}`,
    /** The Hoist's line under a crane whose machine or source shows another number (GMK6350, QUY250). */
    note: copy.hoist.ratingNotes[crane.id] ? fillTemplate(copy.hoist.ratingNotes[crane.id] ?? '', { capacity: `${figure}${NBSP}${copy.hoist.unit}` }) : null,
  };
}

/** The lead photo (the card photo, so the card's photo grows into it) and the rest, in the deck's order. */
export function photosFor(crane: Crane): { lead: CranePhotoId; story: CranePhotoId[] } {
  const all = photosOf(crane) as readonly CranePhotoId[];
  return { lead: crane.cardPhoto as CranePhotoId, story: all.filter((p) => p !== crane.cardPhoto) };
}

export interface Bar {
  id: Crane['id'];
  model: string;
  text: string;
  ratio: number;
  current: boolean;
}

/** Capacity of the five models, smallest first, this one marked: the instrument beside the hero's number. */
export function capacityBars(crane: Crane, copy: Copy, lang: Lang): Bar[] {
  const max = Math.max(...visibleCranes.map((c) => c.capacityT));
  return visibleCranes.map((c) => ({
    id: c.id,
    model: c.model,
    text: `${formatNumber(c.capacityT, lang, { maximumFractionDigits: 1 })}${NBSP}${copy.hoist.unit}`,
    ratio: c.capacityT / max,
    current: c.id === crane.id,
  }));
}

type TileId = 'boom' | 'jib' | 'counterweight';
const FIELD: Record<TileId, { key: keyof CraneSpec; source: string; unit: 'm' | 't' }> = {
  boom: { key: 'boomMaxM', source: 'boomMaxM', unit: 'm' },
  jib: { key: 'jibMaxM', source: 'jibMaxM', unit: 'm' },
  counterweight: { key: 'counterweightT', source: 'counterweightT', unit: 't' },
};

export interface Tile {
  id: TileId;
  label: string;
  value: number;
  decimals: number;
  figure: string;
  unit: string;
  secondary: boolean;
  ratio: number;
  /** "The longest … of the five models." or "Longest of the five: {value}, {model}." split around {model}. */
  caption: { before: string; model: string | null; after: string };
  captionSecondary: boolean;
  /** A line under the label: the main boom's full range. */
  sub: string | null;
}

const valueOf = (spec: CraneSpec, key: keyof CraneSpec) => {
  const v = spec[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
};
const isSecondary = (spec: CraneSpec, field: string) => spec.sources.some((s) => s.field === field && !s.official);

/** Three figures every model has (main boom, jib, counterweight), each against the largest of the five. */
export function highlightTiles(crane: Crane, copy: Copy, lang: Lang): Tile[] {
  const spec = specOf(crane);
  if (!spec) return [];
  const text = cranePageCopy[lang].highlights;
  const all = visibleCranes.flatMap((c) => {
    const s = specOf(c);
    return s ? [{ crane: c, spec: s }] : [];
  });
  return (Object.keys(FIELD) as TileId[]).flatMap((id) => {
    const { key, source, unit } = FIELD[id];
    const value = valueOf(spec, key);
    if (value === undefined) return [];
    const ranked = all
      .map((m) => ({ ...m, v: valueOf(m.spec, key) }))
      .filter((m): m is typeof m & { v: number } => m.v !== undefined)
      .sort((a, b) => b.v - a.v);
    const top = ranked[0];
    if (!top) return [];
    const u = copy.specs.units[unit];
    const isTop = top.crane.id === crane.id;
    let caption: Tile['caption'];
    if (isTop) caption = { before: text.top[id], model: null, after: '' };
    else {
      const filled = fillTemplate(text.other[id], { value: `${n(top.v, lang)}${NBSP}${u}` });
      const [before = '', after = ''] = filled.split('{model}');
      caption = { before, model: top.crane.model, after };
    }
    const label = id === 'boom' ? copy.grid.card.boomMax : copy.specs.fields[id];
    const sub =
      id === 'boom' && spec.boomMinM !== undefined && spec.boomMaxM !== undefined
        ? `${copy.specs.fields.boom}: ${lang === 'ar' ? `من ${n(spec.boomMinM, lang)} إلى ${n(spec.boomMaxM, lang)}` : `${n(spec.boomMinM, lang)}–${n(spec.boomMaxM, lang)}`}${NBSP}${copy.specs.units.m}`
        : null;
    return [
      {
        id,
        label,
        value,
        decimals: decimalsOf(value),
        figure: n(value, lang),
        unit: u,
        secondary: isSecondary(spec, source),
        ratio: value / top.v,
        caption,
        captionSecondary: !isTop && isSecondary(top.spec, source),
        sub,
      },
    ];
  });
}

/** Grouped manufacturer rows (missing rows left out), the rating note and the source documents. */
export function specFor(crane: Crane, copy: Copy, lang: Lang) {
  const spec = specOf(crane);
  const id = specIdOf(crane.id);
  if (!spec || !id) return null;
  const extra = craneListCopy[lang];
  const groups = specGroups(spec, copy, extra, lang, crane);
  return {
    groups,
    anySecondary: groups.some((g) => g.rows.some((r) => r.cell.secondary)),
    note: extra.capacityNotes[id],
    spec,
  };
}

/** The main boom's range for the meta description ('15.5–60 m', «من 15.5 إلى 60 م»). */
export function boomRange(crane: Crane, copy: Copy, lang: Lang): string | null {
  const spec = specOf(crane);
  if (!spec || spec.boomMinM === undefined || spec.boomMaxM === undefined) return null;
  const range = lang === 'ar' ? `من ${n(spec.boomMinM, lang)} إلى ${n(spec.boomMaxM, lang)}` : `${n(spec.boomMinM, lang)}–${n(spec.boomMaxM, lang)}`;
  return `${range}${NBSP}${copy.specs.units.m}`;
}

/** The other models, in the lineup order. */
export const othersOf = (crane: Crane): readonly Crane[] => visibleCranes.filter((c) => c.id !== crane.id);

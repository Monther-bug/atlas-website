import { useLayoutEffect, useRef } from 'react';
import { Button, NewTabNote } from '@/components/Button';
import { DraftBadge } from '@/components/DraftBadge';
import { ArrowIcon, HookIcon, WhatsAppIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import { Carousel } from '@/components/ui/Carousel';
import { Sheet } from '@/components/ui/Sheet';
import { SpecList } from '@/components/ui/SpecTable';
import { fill } from '@/components/ui/util';
import { visibleCranes } from '@/content';
import { craneListCopy } from '@/content/crane-list-copy';
import type { Crane, CraneId } from '@/content/types';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { formatMetres, formatNumber } from '@/lib/numbers';
import { setRequestedCrane } from '@/lib/request';
import { fillTemplate, whatsappHref } from '@/lib/whatsapp';
import { closeNow, openWithMorph } from '@/motion/morph';
import { ratingDiffers, ratingRadius } from './card-facts';
import { addToCompare, compareStore, defaultCompare } from './compare-store';
import { SHEET_ID, specIdOf, specOf } from './lineup-data';
import { craneMessage, hostOf, photosOf, sourcesOf, specGroups } from './sheet-data';


/** The card's own request button: the ride (motion/ride.ts) starts from it once the sheet has closed. */
function cardButton(id: CraneId): HTMLElement | null {
  const el = document.querySelector<HTMLElement>(`[data-testid="request-crane-button"][data-crane="${id}"]`);
  return el && el.getClientRects().length > 0 ? el : null;
}

/** A request to open the sheet: `seq` changes on every press, so the same crane can be opened twice. */
export interface SheetRequest {
  id: CraneId;
  media: HTMLElement | null;
  seq: number;
}

/** Waits (briefly) for the lead photo, so the morph lands on a painted image. */
function painted(img: HTMLImageElement | null | undefined): Promise<void> {
  if (!img || typeof img.decode !== 'function' || (img.complete && img.naturalWidth > 0)) return Promise.resolve();
  return Promise.race([img.decode().catch(() => undefined), new Promise<void>((resolve) => setTimeout(resolve, 180))]);
}

/**
 * Detail sheet for one crane (v2 Sheet on a native modal <dialog>: focus trap, Esc, backdrop, focus return). It only
 * elaborates: every figure in it is also in the comparison table on the page, which shows all five models without JS.
 * Lazy chunk: CraneList loads it when the lineup comes near and renders it on the first "Details" press; it opens
 * itself after React has committed the requested crane.
 */
export default function CraneSheet({ crane, request }: { crane: Crane; request: SheetRequest }) {
  const { copy, lang } = useLang();
  const extra = craneListCopy[lang];
  const handled = useRef(0);
  useLayoutEffect(() => {
    if (handled.current === request.seq) return;
    handled.current = request.seq;
    const el = document.getElementById(SHEET_ID);
    if (!(el instanceof HTMLDialogElement) || el.open) return;
    const lead = el.querySelector<HTMLImageElement>('[data-sheet-media] img');
    void painted(lead).then(() => {
      if (!el.open) openWithMorph(el, request.media);
    });
  }, [request]);
  const spec = specOf(crane);
  const name = `${crane.make} ${crane.model}`;
  const photos = photosOf(crane);
  const type = copy.craneTypes[crane.type];
  const radius = ratingRadius(crane);
  const decimals = Number.isInteger(crane.capacityT) ? 0 : 1;
  const capacity = formatNumber(crane.capacityT, lang, { maximumFractionDigits: decimals });
  const specId = specIdOf(crane.id);
  const note = specId ? extra.capacityNotes[specId] : null;
  const groups = spec ? specGroups(spec, copy, extra, lang, crane) : [];
  const anySecondary = groups.some((g) => g.rows.some((r) => r.cell.secondary));
  const sources = spec ? sourcesOf(spec) : [];
  const dialog = () => document.getElementById(SHEET_ID) as HTMLDialogElement | null;

  const putOnHook = (location: string) => {
    closeNow(dialog());
    setRequestedCrane(crane.id, cardButton(crane.id));
    track('request_crane', { crane_id: crane.id, location });
  };

  return (
    <Sheet
      id={SHEET_ID}
      className="lineup-sheet"
      title={
        <bdi lang="en" dir="ltr">
          {name}
        </bdi>
      }
      footer={
        <div className="lineup-sheet__actions">
          <Button size="md" icon={<HookIcon className="size-5" />} data-testid="sheet-request" onClick={() => putOnHook('sheet')}>
            {copy.grid.card.request}
          </Button>
          <Button
            size="md"
            variant="ghost-light"
            href={whatsappHref(craneMessage(crane, copy))}
            external
            icon={<WhatsAppIcon className="size-5" />}
            data-testid="sheet-whatsapp"
            onClick={() => track('whatsapp_click', { location: 'sheet' })}
          >
            {extra.sheet.whatsapp}
          </Button>
        </div>
      }
    >
      <Carousel
        key={crane.id}
        label={fill(extra.sheet.photos, { name })}
        slideWidth="88%"
        slides={photos.map((photo, i) => (
          <div key={photo} className="frame lineup-sheet__photo" data-sheet-media={i === 0 ? '' : undefined}>
            <Picture
              photo={photo}
              crop="desktop_16x9"
              alt={copy.alt[photo]}
              sizes="(min-width: 48rem) 34rem, 88vw"
              priority={i === 0}
              className="h-full w-full"
            />
          </div>
        ))}
      />

      <p className="t-body lineup-sheet__type">
        <strong>{type.full}.</strong> {type.explainer}
      </p>

      <div className="lineup-sheet__rating">
        <p className="lineup-card__capacity">
          <span className="t-figure" dir="ltr" aria-hidden="true">
            {capacity}
          </span>
          <span className="t-sub lineup-card__unit" aria-hidden="true">
            {copy.hoist.unit}
          </span>
          <span className="sr-only">
            {capacity} {copy.hoist.unit}
          </span>
        </p>
        <p className="t-small lineup-card__rating">
          <span>
            {copy.grid.card.capacity}
            {radius !== undefined ? ` ${fillTemplate(copy.grid.card.atRadius, { radius: formatMetres(radius, lang) })}` : ''}
            {' · '}
            {ratingDiffers(crane) ? extra.conflict.label : copy.grid.card.rating}
          </span>
          <DraftBadge verified={crane.verified} />
        </p>
        {note ? (
          <div className="lineup-sheet__note">
            <h3 className="t-small">{extra.sheet.noteHeading}</h3>
            <p className="t-small">{note}</p>
          </div>
        ) : null}
      </div>

      {spec ? (
        <section className="lineup-sheet__specs" aria-labelledby={`${SHEET_ID}-specs`}>
          <h3 id={`${SHEET_ID}-specs`} className="t-title lineup-sheet__specs-title">
            {copy.specs.heading}
            <DraftBadge verified={crane.verified} />
          </h3>
          <p className="t-small lineup-sheet__muted">{copy.specs.disclaimer}</p>
          {groups.map((group) => (
            <div key={group.id} className="lineup-sheet__group">
              <h4 className="t-small lineup-sheet__group-title">{extra.groups[group.id]}</h4>
              <SpecList
                items={group.rows.map((row) => ({
                  id: row.id,
                  label: row.label,
                  value: row.cell.secondary ? (
                    <>
                      {row.cell.text}
                      <span aria-hidden="true">*</span>
                      <span className="sr-only"> ({extra.compare.secondary})</span>
                    </>
                  ) : row.cell.conflict ? (
                    <>
                      {row.cell.text}
                      <span aria-hidden="true">†</span>
                      <span className="sr-only"> ({extra.conflict.mark})</span>
                    </>
                  ) : (
                    row.cell.text
                  ),
                  latin: row.cell.latin,
                }))}
              />
            </div>
          ))}
          {anySecondary ? <p className="t-caption lineup-sheet__muted">{extra.compare.secondaryNote}</p> : null}

          <h4 className="t-small lineup-sheet__group-title">{extra.sheet.sourcesHeading}</h4>
          <ul className="lineup-sources">
            {sources.map((s) => (
              <li key={s.url} className="t-small">
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  <bdi lang="en" dir="ltr">
                    {hostOf(s.url)}
                  </bdi>
                  <NewTabNote />
                </a>{' '}
                <span className="lineup-sheet__muted">· {s.official ? copy.specs.official : copy.specs.secondary}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="lineup-sheet__links">
        <a
          href="#crane-compare"
          className="t-small lineup-link"
          onClick={() => {
            compareStore.set(addToCompare(compareStore.get() ?? defaultCompare(visibleCranes), crane.id));
            closeNow(dialog());
          }}
        >
          {extra.sheet.compareWith}
          <ArrowIcon direction="down" className="size-4" />
        </a>
        <a href="#request" className="t-small lineup-link" onClick={() => putOnHook('sheet-link')}>
          {copy.grid.card.formLink}
          <ArrowIcon direction="down" className="size-4" />
        </a>
      </div>
    </Sheet>
  );
}

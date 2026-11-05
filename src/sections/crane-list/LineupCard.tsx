import { useRef } from 'react';
import { Button } from '@/components/Button';
import { DraftBadge } from '@/components/DraftBadge';
import { ArrowIcon, HookIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import type { Crane } from '@/content/types';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { formatMetres, formatNumber } from '@/lib/numbers';
import { setRequestedCrane, useRequestedCrane } from '@/lib/request';
import { fillTemplate } from '@/lib/whatsapp';
import { craneListCopy } from '@/content/crane-list-copy';
import { cranePath } from '@/content/crane-pages';
import { nameForTransition } from '@/lib/view-transition';
import { keySpecs, ratingDiffers, ratingRadius } from './card-facts';
import { parseLoad, ratedFor, useLoadText } from './load';

/** Screen-reader suffix that makes every card action's name unique (": Grove GMK6350"). */
export function CraneName({ crane }: { crane: Crane }) {
  return (
    <span className="sr-only">
      : <bdi lang="en" dir="ltr">{crane.make} {crane.model}</bdi>
    </span>
  );
}

/**
 * One crane in the lineup (Apple-style product card): photo, make + model in mono, the capacity as the hero number,
 * the manufacturer-rating label, three key specs, and Request / Details. The whole card opens the crane's own page:
 * Details is the one real link and its ::after covers the card (the "stretched link" pattern, so one tab stop and one
 * screen-reader link, with no click handler on the article); Request sits above it as a separate control. Contract C9:
 * article[data-testid=crane-card] and its request button keep their hooks; ride.ts flies the chip from that button into
 * the bar.
 */
export function LineupCard({ crane }: { crane: Crane }) {
  const { copy, lang } = useLang();
  const onHook = useRequestedCrane() === crane.id;
  const media = useRef<HTMLDivElement>(null);
  const load = parseLoad(useLoadText());
  const titleId = `crane-${crane.id}-model`;
  const type = copy.craneTypes[crane.type];
  const specs = keySpecs(crane, copy, lang);
  const radius = ratingRadius(crane);
  const decimals = Number.isInteger(crane.capacityT) ? 0 : 1;
  const capacity = formatNumber(crane.capacityT, lang, { maximumFractionDigits: decimals });
  const fit = load.state === 'ok' ? (ratedFor(crane, load.tonnes) ? 'yes' : 'no') : undefined;
  const loadText = load.state === 'ok' ? `${formatNumber(load.tonnes, lang)} ${copy.hoist.unit}` : '';

  return (
    <article
      data-testid="crane-card"
      data-crane={crane.id}
      data-fit={fit}
      data-on-hook={onHook ? '' : undefined}
      aria-labelledby={titleId}
      data-tone="raised"
      data-interactive=""
      className="ui-card lineup-card"
    >
      <div ref={media} className="lineup-card__media" data-lineup-media="">
        <div className="lineup-card__photo" data-lineup-photo="">
          <Picture
            photo={crane.cardPhoto}
            crop="desktop_16x9"
            alt={copy.alt[crane.cardPhoto]}
            sizes="(min-width: 1024px) 30rem, (min-width: 640px) 46vw, 84vw"
            pictureClassName="block h-full w-full"
            className="h-full w-full"
          />
        </div>
        <span className="ui-chip glass-dark lineup-card__type">{type.chip}</span>
      </div>

      <div className="lineup-card__body">
        <h3 id={titleId} className="t-spec lineup-card__name">
          <bdi lang="en" dir="ltr">
            {crane.make} {crane.model}
          </bdi>
        </h3>

        <p className="lineup-card__capacity">
          {/* The ticker (motion/lineup.ts) counts in the first span; the hidden twin holds the final width, so nothing
              beside the figure moves while it counts (Poppins digits are proportional). */}
          <span className="t-figure lineup-card__figure" dir="ltr" aria-hidden="true">
            <span data-lineup-ticker={String(crane.capacityT)} data-ticker-decimals={String(decimals)}>
              {capacity}
            </span>
            <span className="lineup-card__ghost">{capacity}</span>
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
            {/* QUY250: the figure is not the manufacturer's listed maximum, so it is not called the manufacturer rating. */}
            {ratingDiffers(crane) ? craneListCopy[lang].conflict.label : copy.grid.card.rating}
          </span>
          <DraftBadge verified={crane.verified} />
        </p>

        {specs.length > 0 ? (
          <dl className="lineup-card__specs">
            {specs.map((s) => (
              <div key={s.id}>
                <dt className="t-caption">{s.label}</dt>
                <dd className="t-body">
                  {s.text}
                  {s.secondary ? (
                    <>
                      <span aria-hidden="true">*</span>
                      <span className="sr-only"> ({copy.grid.card.secondary})</span>
                    </>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {specs.some((s) => s.secondary) ? (
          <p className="t-caption lineup-card__foot" aria-hidden="true">
            * {copy.grid.card.secondary}
          </p>
        ) : null}

        {fit ? (
          <p className="t-small lineup-card__fit" data-fit={fit}>
            <span>{fillTemplate(fit === 'yes' ? copy.grid.fits : copy.grid.below, { load: loadText })}</span>
          </p>
        ) : null}

        <div className="lineup-card__actions">
          <Button
            size="md"
            icon={<HookIcon className="size-5" />}
            data-testid="request-crane-button"
            data-crane={crane.id}
            onClick={(event) => {
              setRequestedCrane(crane.id, event.currentTarget);
              track('request_crane', { crane_id: crane.id, location: 'card' });
            }}
          >
            {copy.grid.card.request}
            <CraneName crane={crane} />
          </Button>
          {/* The page link: prerendered, so crawlers and no-JS visitors reach all ten pages from here. Its ::after covers
              the card; the photo grows into the page's hero where cross-document view transitions run. */}
          <a
            href={cranePath(crane.id, lang)}
            className="ui-nudge lineup-card__details"
            data-details=""
            data-crane-page-link={crane.id}
            data-crane={crane.id}
            onClick={() => nameForTransition(media.current?.querySelector('[data-lineup-photo]'))}
          >
            <span>{copy.grid.card.details}</span>
            <CraneName crane={crane} />
            <ArrowIcon className="size-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

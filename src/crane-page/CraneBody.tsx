import type { CSSProperties, ReactNode } from 'react';
import { Button, NewTabNote } from '@/components/Button';
import { DraftBadge } from '@/components/DraftBadge';
import { ArrowIcon, HookIcon, WhatsAppIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import { reveal } from '@/components/ui/Reveal';
import { Section, SectionHeader } from '@/components/ui/Section';
import { fill } from '@/components/ui/util';
import { craneListCopy } from '@/content/crane-list-copy';
import { cranePageCopy } from '@/content/crane-page-copy';
import { cranePath } from '@/content/crane-pages';
import type { Crane, CranePhotoId } from '@/content/types';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';
import { whatsappHref } from '@/lib/whatsapp';
import { craneMessage, hostOf, sourcesOf } from '@/sections/crane-list/sheet-data';
import { capacityBars, highlightTiles, nameOf, othersOf, photosFor, rating, specFor } from './data';
import { compareHref, formHref } from './links';

/**
 * The body of a crane page (/cranes/<id>/), Apple product page in the v2 language: hero (name, the capacity as the
 * big number, the lead photo, the three ways to ask), key figures against the other four models, the photo story,
 * the full manufacturer specification, the honest load question, and the other cranes. Rendered in full by the
 * prerender (and the dev server); in the browser it is a static island (CraneIsland.tsx), so none of this code,
 * crane-specs.ts or the page copy ship in the page's JavaScript.
 */

export const HERO_SIZES = '(min-width: 100rem) 95rem, (min-width: 48rem) calc(100vw - 5rem), calc(100vw - 2rem)';
const STORY_SIZES = '(min-width: 64rem) 52vw, calc(100vw - 2rem)';
const CARD_SIZES = '(min-width: 64rem) 20rem, 72vw';

/** Latin runs inside Arabic text (GROVE, a model code) isolated in <bdi lang="en">, so they never reorder the line. */
function Text({ children }: { children: string }) {
  const { lang } = useLang();
  if (lang !== 'ar') return <>{children}</>;
  const parts = children.split(/([A-Za-z][A-Za-z0-9.\-]*(?:\s[A-Za-z0-9][A-Za-z0-9.\-]*)*)/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <bdi key={i} lang="en" dir="ltr">
            {part}
          </bdi>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * The dagger that marks a capacity which is not the manufacturer's listed maximum (QUY250), drawn: U+2020 is in none of
 * the subset fonts, so as text it would fall back to a system face.
 */
function Dagger() {
  return (
    <svg viewBox="0 0 8 14" width="0.45em" height="0.8em" aria-hidden="true" focusable="false" className="cp-dagger">
      <path d="M4 0.5v13M1 4.5h6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Code({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <bdi lang="en" dir="ltr" className={className}>
      {children}
    </bdi>
  );
}

/** A number the motion layer counts up once (data-ticker), over a hidden twin that holds its final width. */
function Figure({ value, decimals, text }: { value: number; decimals: number; text: string }) {
  return (
    <span className="cp-fig" dir="ltr" aria-hidden="true">
      <span data-ticker={String(value)} data-ticker-decimals={String(decimals)}>
        {text}
      </span>
      <span className="cp-fig__ghost">{text}</span>
    </span>
  );
}

function Hero({ crane }: { crane: Crane }) {
  const { copy, lang, home } = useLang();
  const page = cranePageCopy[lang];
  const extra = craneListCopy[lang];
  const r = rating(crane, copy, lang);
  const { lead } = photosFor(crane);
  const type = copy.craneTypes[crane.type];
  return (
    <Section id="crane-hero" surface="white" width="bleed" pad="none" aria-labelledby="cp-title" className="cp-hero">
      <div className="shell">
        <nav aria-label={page.breadcrumb.label} className="cp-crumbs">
          <ol>
            <li>
              <a href={home}>{page.breadcrumb.home}</a>
            </li>
            <li>
              <a href={`${home}#crane-list`}>{page.breadcrumb.cranes}</a>
            </li>
            <li>
              <span aria-current="page">
                <Code>{crane.model}</Code>
              </span>
            </li>
          </ol>
        </nav>
        <div className="cp-hero__grid">
          <div className="cp-hero__name">
            <h1 id="cp-title" className="cp-title">
              <Code>
                <span className="cp-title__make">{crane.make}</span> <span className="cp-title__code">{crane.model}</span>
              </Code>
            </h1>
            <p className="t-sub cp-hero__type">
              <strong>{type.full}.</strong> {type.explainer}
            </p>
          </div>
          <div className="cp-hero__rating">
            <p className="cp-readout">
              <span className="cp-readout__mask" aria-hidden="true">
                <span className="cp-readout__fig" dir="ltr">
                  {r.figure}
                </span>
                <span className="cp-readout__unit">{copy.hoist.unit}</span>
              </span>
              <span className="sr-only">{r.text}</span>
            </p>
            <p className="t-small cp-hero__label">
              <span>{r.label}</span>
              <DraftBadge verified={crane.verified} />
            </p>
            {r.note ? (
              <p className="t-small cp-hero__note">
                <Text>{r.note}</Text>
              </p>
            ) : null}
          </div>
          <div className="cp-hero__actions">
            <Button
              href={whatsappHref(craneMessage(crane, copy))}
              external
              magnetic
              icon={<WhatsAppIcon className="size-5" />}
              data-track="whatsapp_click"
              data-track-location="crane-page"
              data-testid="crane-page-whatsapp"
              className="cp-hero__cta"
            >
              {copy.grid.card.request}
            </Button>
            <Button
              href={formHref(home, crane.id)}
              variant="ghost-light"
              icon={<HookIcon className="size-5" />}
              data-track="request_crane"
              data-track-location="crane-page"
              data-testid="crane-page-form"
              className="cp-hero__cta"
            >
              {page.hero.form}
            </Button>
            <Button href={compareHref(home, crane.id)} variant="plain" iconEnd={<ArrowIcon className="size-4" />} className="ui-nudge" data-testid="crane-page-compare">
              {extra.sheet.compareWith}
            </Button>
          </div>
        </div>
      </div>
      <div className="shell-wide">
        <div className="frame cp-hero__frame" data-crane-hero-photo="">
          <Picture photo={lead} crop="desktop_16x9" mobileCrop="mobile_4x5" alt={copy.alt[lead]} sizes={HERO_SIZES} priority />
        </div>
      </div>
    </Section>
  );
}

function Bars({ crane }: { crane: Crane }) {
  const { copy, lang } = useLang();
  const bars = capacityBars(crane, copy, lang);
  return (
    <div className="cp-bars">
      <p id="cp-bars-label" className="t-caption cp-muted">
        {cranePageCopy[lang].highlights.lineup}
      </p>
      <ol aria-labelledby="cp-bars-label" className="cp-bars__list">
        {bars.map((b) => (
          <li key={b.id} className="cp-bars__row" data-current={b.current ? '' : undefined} aria-current={b.current ? 'true' : undefined}>
            <Code className="t-spec cp-bars__model">{b.model}</Code>
            <span className="cp-meter" aria-hidden="true">
              <span data-meter="" style={{ '--r': b.ratio.toFixed(3) } as CSSProperties} />
            </span>
            <span className="t-small cp-bars__value">{b.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Highlights({ crane }: { crane: Crane }) {
  const { copy, lang } = useLang();
  const page = cranePageCopy[lang].highlights;
  const extra = craneListCopy[lang];
  const r = rating(crane, copy, lang);
  const tiles = highlightTiles(crane, copy, lang);
  const anySecondary = tiles.some((t) => t.secondary || t.captionSecondary);
  return (
    <Section surface="night" aria-labelledby="cp-figures-title" className="cp-figures">
      <SectionHeader id="cp-figures-title" title={page.title} continuation={page.continuation} />
      <div className="cp-figures__grid" {...reveal('stagger')}>
        <article className="cp-tile cp-tile--wide" aria-labelledby="cp-tile-capacity">
          <div className="cp-tile__head">
            <h3 id="cp-tile-capacity" className="t-small cp-tile__label">
              {copy.specs.fields.maxCapacity}
            </h3>
            <p className="cp-tile__value">
              <Figure value={crane.capacityT} decimals={r.decimals} text={r.figure} />
              <span className="t-sub t-accent" aria-hidden="true">
                {copy.hoist.unit}
              </span>
              <span className="sr-only">{r.text}</span>
            </p>
            <p className="t-small cp-muted cp-tile__rating">
              <span>{r.sub}</span>
              <DraftBadge verified={crane.verified} />
            </p>
          </div>
          <Bars crane={crane} />
        </article>
        {tiles.map((t) => (
          <article key={t.id} className="cp-tile" aria-labelledby={`cp-tile-${t.id}`}>
            <h3 id={`cp-tile-${t.id}`} className="t-small cp-tile__label">
              {t.label}
            </h3>
            <p className="cp-tile__value">
              <Figure value={t.value} decimals={t.decimals} text={t.figure} />
              <span className="t-sub t-accent" aria-hidden="true">
                {t.unit}
                {t.secondary ? '*' : ''}
              </span>
              <span className="sr-only">
                {t.figure} {t.unit}
                {t.secondary ? ` (${extra.compare.secondary})` : ''}
              </span>
            </p>
            {t.sub ? <p className="t-small cp-muted">{t.sub}</p> : null}
            <span className="cp-meter cp-meter--solo" aria-hidden="true">
              <span data-meter="" style={{ '--r': t.ratio.toFixed(3) } as CSSProperties} />
            </span>
            <p className="t-small cp-tile__caption">
              {t.caption.before}
              {t.caption.model ? <Code>{t.caption.model}</Code> : null}
              {t.caption.after}
              {t.captionSecondary ? (
                <>
                  <span aria-hidden="true">*</span>
                  <span className="sr-only"> ({extra.compare.secondary})</span>
                </>
              ) : null}
            </p>
          </article>
        ))}
      </div>
      {anySecondary ? <p className="t-caption cp-muted cp-figures__note">{extra.compare.secondaryNote}</p> : null}
    </Section>
  );
}

function Story({ crane }: { crane: Crane }) {
  const { copy, lang } = useLang();
  const page = cranePageCopy[lang];
  const extra = craneListCopy[lang];
  const { story } = photosFor(crane);
  if (story.length === 0) return null;
  const media = (photo: CranePhotoId) => <Picture photo={photo} crop="desktop_16x9" mobileCrop="mobile_4x5" alt="" sizes={STORY_SIZES} />;
  return (
    <Section surface="white" aria-labelledby="cp-photos-title" className="cp-story-section">
      <SectionHeader id="cp-photos-title" title={`${fill(extra.sheet.photos, { name: nameOf(crane) })}.`} />
      <div className="cp-story" data-story="">
        <ol aria-label={page.story.label} className="cp-story__steps">
          {story.map((photo, i) => {
            const c = page.captions[photo];
            return (
              <li key={photo} className="cp-story__step" data-story-step={i} data-active={i === 0 ? '' : undefined}>
                <div className="frame cp-story__inline">{media(photo)}</div>
                <h3 className="t-title cp-story__title">
                  <Text>{c.text}</Text>
                </h3>
                <p className="t-body cp-story__text">
                  <Text>{copy.alt[photo]}</Text>
                </p>
                <p className="t-caption cp-muted">
                  {c.site ? `${copy.sites.galleries[c.site === 'coast' ? 'coast' : 'construction']} · ` : ''}
                  {fill(copy.ui.slideOf, { i: formatNumber(i + 1, lang), n: formatNumber(story.length, lang) })}
                </p>
              </li>
            );
          })}
        </ol>
        <div className="cp-story__stage" aria-hidden="true">
          {story.map((photo, i) => (
            <div key={photo} className="frame cp-story__frame" data-story-frame={i} data-active={i === 0 ? '' : undefined}>
              {media(photo)}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Specs({ crane }: { crane: Crane }) {
  const { copy, lang } = useLang();
  const extra = craneListCopy[lang];
  const data = specFor(crane, copy, lang);
  if (!data) return null;
  const sources = sourcesOf(data.spec);
  return (
    <Section surface="mist" aria-labelledby="cp-specs-title" className="cp-specs" id="specification">
      <header className="cp-specs__head">
        <h2 id="cp-specs-title" className="t-headline">
          {copy.specs.heading}
        </h2>
        <DraftBadge verified={crane.verified} />
        <p className="t-sub cp-specs__lead">{copy.specs.disclaimer}</p>
      </header>
      <div className="cp-specs__groups" {...reveal('stagger')}>
        {data.groups.map((group) => (
          <div key={group.id} className="cp-group" role="group" aria-labelledby={`cp-group-${group.id}`}>
            <h3 id={`cp-group-${group.id}`} className="t-title cp-group__title">
              {extra.groups[group.id]}
            </h3>
            <dl className="cp-group__rows">
              {group.rows.map((row) => (
                <div key={row.id} className="cp-row" data-row={row.id}>
                  <dt className="t-body cp-row__label">{row.label}</dt>
                  <dd className="t-body cp-row__value">
                    {row.cell.latin ? <Code>{row.cell.text}</Code> : row.cell.text}
                    {row.cell.secondary ? (
                      <>
                        <span aria-hidden="true">*</span>
                        <span className="sr-only"> ({extra.compare.secondary})</span>
                      </>
                    ) : null}
                    {row.cell.conflict ? (
                      <>
                        <Dagger />
                        <span className="sr-only"> ({extra.conflict.mark})</span>
                      </>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <div className="cp-specs__notes" {...reveal('fade')}>
        <div className="cp-note">
          <h3 className="t-small cp-note__title">{extra.sheet.noteHeading}</h3>
          <p className="t-body">
            <Text>{data.note}</Text>
          </p>
        </div>
        <div className="cp-sources">
          <h3 className="t-small cp-note__title">{extra.sheet.sourcesHeading}</h3>
          <ul>
            {sources.map((s) => (
              <li key={s.url} className="t-small">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="ui-link">
                  <Code>{hostOf(s.url)}</Code>
                  <NewTabNote />
                </a>{' '}
                <span className="cp-muted">· {s.official ? copy.specs.official : copy.specs.secondary}</span>
              </li>
            ))}
          </ul>
          {data.anySecondary ? <p className="t-caption cp-muted">{extra.compare.secondaryNote}</p> : null}
        </div>
      </div>
    </Section>
  );
}

function Load({ crane }: { crane: Crane }) {
  const { copy, lang, home } = useLang();
  const page = cranePageCopy[lang].load;
  const extra = craneListCopy[lang];
  const r = rating(crane, copy, lang);
  const lead = r.conflict
    ? page.leadNoCapacity
    : fill(r.radius !== undefined ? page.lead : page.leadNoRadius, {
        capacity: r.text,
        radius: r.radius !== undefined ? `${formatNumber(r.radius, lang)} ${copy.specs.units.m}` : '',
      });
  const needs = [copy.form.fields.weight.label, copy.form.fields.radius.label, copy.form.fields.height.label];
  return (
    <Section surface="brand" aria-labelledby="cp-load-title" className="cp-load">
      <div className="cp-load__grid" {...reveal('rise')}>
        <div>
          <h2 id="cp-load-title" className="t-headline">
            {page.title}
          </h2>
          <p className="t-sub cp-load__text">
            {lead} {page.rest}
          </p>
        </div>
        <div className="cp-load__panel">
          <h3 id="cp-needs" className="t-small cp-load__needs-title">
            {page.needs}
          </h3>
          <ol aria-labelledby="cp-needs" className="cp-needs">
            {needs.map((label, i) => (
              <li key={label} className="t-body">
                <span className="cp-needs__n t-accent" aria-hidden="true">
                  {formatNumber(i + 1, lang)}
                </span>
                {label}
              </li>
            ))}
          </ol>
          <div className="cp-load__actions">
            <Button href={formHref(home, crane.id)} data-track="request_crane" data-track-location="crane-page-load" data-testid="crane-page-load-form">
              {copy.hoist.closingButton}
            </Button>
            <Button
              href={whatsappHref(craneMessage(crane, copy))}
              external
              variant="ghost-dark"
              icon={<WhatsAppIcon className="size-5" />}
              data-track="whatsapp_click"
              data-track-location="crane-page-load"
            >
              {extra.sheet.whatsapp}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Rail({ crane }: { crane: Crane }) {
  const { copy, lang, home } = useLang();
  const page = cranePageCopy[lang];
  return (
    <Section surface="white" aria-labelledby="cp-rail-title" className="cp-rail-section">
      <SectionHeader
        id="cp-rail-title"
        title={page.rail.title}
        actions={
          <Button href={compareHref(home, crane.id)} variant="ghost-light" size="sm" iconEnd={<ArrowIcon className="size-4" />} data-testid="crane-page-compare-all">
            {copy.grid.compareLink}
          </Button>
        }
      />
      <ul className="cp-rail" {...reveal('stagger')}>
        {othersOf(crane).map((c) => (
          <li key={c.id}>
            <a href={cranePath(c.id, lang)} className="cp-card" data-crane-link={c.id}>
              <span className="frame cp-card__media" data-crane-link-photo="">
                <Picture photo={c.cardPhoto} crop="desktop_16x9" alt="" sizes={CARD_SIZES} />
              </span>
              <span className="cp-card__body">
                <h3 className="cp-card__name">
                  <Code>
                    <span className="cp-card__make">{c.make}</span> <span className="t-spec">{c.model}</span>
                  </Code>
                </h3>
                <span className="cp-card__meta">
                  <span className="cp-card__cap">
                    {formatNumber(c.capacityT, lang, { maximumFractionDigits: 1 })}
                    {' '}
                    {copy.hoist.unit}
                  </span>
                  <span className="ui-chip">{copy.craneTypes[c.type].chip}</span>
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** The whole body, as prerendered. */
export function CraneBodyFull({ crane }: { crane: Crane }) {
  return (
    <>
      <Hero crane={crane} />
      <Highlights crane={crane} />
      <Story crane={crane} />
      <Specs crane={crane} />
      <Load crane={crane} />
      <Rail crane={crane} />
    </>
  );
}

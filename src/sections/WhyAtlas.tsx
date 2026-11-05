import { useEffect } from 'react';
import { Button } from '@/components/Button';
import { DraftBadge } from '@/components/DraftBadge';
import { HookIcon, PhoneIcon, WhatsAppIcon } from '@/components/Icons';
import { Section, SectionHeader, cx, fill, reveal } from '@/components/ui';
import { cranes, siteInfo, visibleCranes } from '@/content';
import type { Copy, Crane, CraneType } from '@/content/types';
import { whyCopy } from '@/content/why';
import { env } from '@/env';
import { useLang } from '@/lib/lang';
import { formatNumber, formatTonnes } from '@/lib/numbers';
import { HOOK_EVENT, getRequestedCrane } from '@/lib/request';
import { fillTemplate, telHref, whatsappHref } from '@/lib/whatsapp';
import { KeptShell, useTrackedClicks } from './island';

/**
 * Why Atlas (v2 spec §10): the page's brand-navy band (palette follow-up, 5 Nov: navy as a visible secondary accent).
 * White text, a navy-tinted instrument panel, and red only on the action, which closes the band on the one white strip.
 *
 * It reads top to bottom, not as a second bento: the range (one figure and a bar per model, read like a load chart) →
 * which crane type suits which ground → how a hire runs (four steps) → how to ask. It says only what Services and the
 * Hoist do not: no second list of the four services, no repeated capacity footnote.
 *
 * Truth: only facts on hand (PRODUCT.md "Evidence on Hand"). The capacities are manufacturer ratings (DraftBadge until
 * Atlas confirms); anything Atlas has not confirmed stays a [[CONFIRM]] token. No years, counts of cranes, clients or
 * certificates: those stay HIDDEN UNTIL DATA (copy deck §8a). Channels show only what is configured (Call needs a
 * phone number); email is the one confirmed contact.
 *
 * Motion (src/motion/why.ts + reveals.ts): the range figure ticks and the bars grow once on entry; the ground types
 * rise in a stagger; the process line fills as the steps scroll by (desktop) or once on entry (touch). Rendered final:
 * no-JS and reduced motion see every bar full and every step reached.
 *
 * A static island (./island.tsx): the client keeps the prerendered HTML; click tracking and the crane on the hook run
 * as small effects on that DOM.
 */

const ID = 'why-atlas';

/** The bar scale, in tonnes: a little above the largest rating, so the longest bar never touches the end. */
export const SCALE_T = 340;
const GRID_T = [0, 100, 200, 300] as const;
const TYPES: readonly CraneType[] = ['rough-terrain', 'all-terrain', 'crawler'];

/** Pure: a bar's length as a percentage of the scale (exported for tests). */
export function barPercent(capacityT: number, scale = SCALE_T): number {
  if (!Number.isFinite(capacityT) || capacityT <= 0) return 0;
  return Math.min(100, Math.round((capacityT / scale) * 1000) / 10);
}

/** Pure: the WhatsApp message for the crane on the hook, or the general one (the same wording as the request bar). */
export function channelMessage(copy: Copy, crane: Crane | null): string {
  return crane
    ? fillTemplate(copy.whatsapp.crane, { model: `${crane.make} ${crane.model}`, class: copy.craneTypes[crane.type].chip })
    : copy.whatsapp.general;
}

/**
 * A number that ticks (src/motion/reveals.ts startTickers). The final value sits invisibly in the same grid cell, so
 * the box is exactly as wide as the final text from the first frame: no gap beside it, no jitter while it counts.
 */
function Ticker({ value, decimals, align }: { value: number; decimals: number; align: 'start' | 'end' }) {
  const { lang } = useLang();
  const shown = formatNumber(value, lang, { maximumFractionDigits: decimals });
  return (
    <span className="inline-grid">
      <span className="invisible col-start-1 row-start-1">{shown}</span>
      <span
        className={cx('col-start-1 row-start-1', align === 'end' ? 'text-end' : 'text-start')}
        data-ticker={String(value)}
        data-ticker-from="0"
        data-ticker-decimals={String(decimals)}
      >
        {shown}
      </span>
    </span>
  );
}

/** «من 55 إلى 317.5 طن» / "55–317.5 t": the digits tick (aria-hidden); an sr-only twin holds the final text. */
function RangeFigure({ min, max }: { min: number; max: number }) {
  const { copy, lang } = useLang();
  const template = whyCopy[lang].range.figure;
  const parts = template.split(/(\{min\}|\{max\})/).filter(Boolean);
  const final = `${fill(template, { min: formatNumber(min, lang), max: formatNumber(max, lang) })} ${copy.hoist.unit}`;
  return (
    <>
      <span aria-hidden="true" className="flex flex-wrap items-baseline gap-x-[0.3em]">
        <span className="t-figure">
          {parts.map((part, i) =>
            part === '{min}' ? (
              <Ticker key={i} value={min} decimals={0} align="end" />
            ) : part === '{max}' ? (
              <Ticker key={i} value={max} decimals={1} align="start" />
            ) : /\p{L}/u.test(part) ? (
              // Words («من», «إلى») are set at the sub size between the figures; a bare dash stays figure-sized.
              <span key={i} className="t-sub mx-[0.25em] text-(--surface-fg-2)">
                {part.trim()}
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </span>
        <span className="t-sub text-(--surface-fg-2)">{copy.hoist.unit}</span>
      </span>
      <span className="sr-only">{final}</span>
    </>
  );
}

/**
 * One bar per model, smallest first, on a 0-340 t scale with faint gridlines: read like a load chart. Wide: model,
 * bar, value in three columns. Narrow (under 30rem of its own width): model and value on one line, the bar full width
 * under them, so 55 t and 60 t can still be told apart on a phone.
 */
function CapacityBars({ list }: { list: readonly Crane[] }) {
  const { lang } = useLang();
  const WIDE = '@min-[30rem]:grid-cols-[6.5rem_minmax(0,1fr)_5.5rem] @min-[30rem]:gap-x-4';
  return (
    <div className="@container">
      <ul role="list" aria-label={whyCopy[lang].range.listLabel} data-why-bars="" className={cx('m-0 grid list-none gap-y-3 p-0 @min-[30rem]:gap-y-0', WIDE)}>
        {list.map((crane) => (
          <li key={crane.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 @min-[30rem]:col-span-3 @min-[30rem]:grid-cols-subgrid">
            <span className="t-spec col-start-1 row-start-1 truncate text-(--surface-fg-2)">
              <bdi lang="en" dir="ltr">
                {crane.model}
              </bdi>
            </span>
            <span
              aria-hidden="true"
              className="relative col-span-2 row-start-2 block h-3 @min-[30rem]:col-span-1 @min-[30rem]:col-start-2 @min-[30rem]:row-start-1 @min-[30rem]:h-9"
            >
              {/* gridlines: continuous from row to row when the rows sit flush (wide) */}
              {GRID_T.map((t) => (
                <span key={t} className="absolute inset-y-0 w-px bg-white/12" style={{ insetInlineStart: `${barPercent(t)}%` }} />
              ))}
              <span className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/15" />
              <span
                data-why-bar=""
                className="absolute start-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white"
                style={{ inlineSize: `${barPercent(crane.capacityT)}%` }}
              />
            </span>
            <span className="t-small col-start-2 row-start-1 text-end font-semibold whitespace-nowrap tabular-nums @min-[30rem]:col-start-3">
              {formatTonnes(crane.capacityT, lang)}
            </span>
          </li>
        ))}
      </ul>
      {/* axis labels under the tracks (decorative: every value is in the list itself) */}
      <div aria-hidden="true" className={cx('mt-2 grid', WIDE)}>
        <span className="hidden @min-[30rem]:block" />
        <span className="t-caption relative block h-5 text-(--surface-fg-3)">
          {GRID_T.map((t, i) => (
            <span
              key={t}
              className="absolute top-0 -translate-x-1/2 whitespace-nowrap tabular-nums rtl:translate-x-1/2"
              style={{ insetInlineStart: `${barPercent(t)}%` }}
            >
              {i === GRID_T.length - 1 ? formatTonnes(t, lang) : formatNumber(t, lang)}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

/** The band's instrument: the range as one figure (start), the bars (end). Navy-tinted panel, no shadow. */
function RangePanel() {
  const { lang } = useLang();
  const min = visibleCranes[0]?.capacityT ?? 0;
  const max = visibleCranes[visibleCranes.length - 1]?.capacityT ?? 0;
  const verified = visibleCranes.every((c) => c.verified);
  return (
    <div data-why-tile="range" className="@container rounded-xl border border-white/10 bg-white/[0.06] p-(--space-tile)">
      <div className="grid gap-8 @min-[56rem]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @min-[56rem]:items-center @min-[56rem]:gap-14">
        <div>
          <h3 className="m-0">
            <RangeFigure min={min} max={max} />
          </h3>
          <p className="t-small mt-4 max-w-[30rem] text-(--surface-fg-2)">{whyCopy[lang].range.label}</p>
          <DraftBadge verified={verified} className="mt-3" />
        </div>
        <CapacityBars list={visibleCranes} />
      </div>
    </div>
  );
}

/** Which crane type suits which ground (copy deck §4 class names and explainers), with the make and model of each. */
function GroundTypes() {
  const { copy, lang } = useLang();
  const verified = visibleCranes.every((c) => c.verified);
  return (
    <div data-why-tile="types" className="mt-(--space-head)">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h3 className="t-title">{whyCopy[lang].types.title}</h3>
        <DraftBadge verified={verified} />
      </div>
      <ul role="list" {...reveal('stagger')} className="m-0 mt-6 grid list-none gap-x-10 p-0 md:grid-cols-3">
        {TYPES.map((type) => {
          const models = visibleCranes.filter((c) => c.type === type);
          return (
            <li key={type} className="border-t border-(--surface-line) py-5">
              <p className="m-0 font-semibold">{copy.craneTypes[type].full}</p>
              <p className="t-small m-0 mt-1 text-(--surface-fg-2)">{copy.craneTypes[type].explainer}</p>
              {models.length > 0 && (
                <ul role="list" className="m-0 mt-3 list-none p-0">
                  {models.map((c) => (
                    <li key={c.id} className="t-small text-(--surface-fg-3)">
                      <bdi lang="en" dir="ltr">
                        {c.make} <span className="t-spec text-(--surface-fg-2)">{c.model}</span>
                      </bdi>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * The hire process. Numbered because the order is the information (v2 floor §16.2). The connector after each step is
 * a track with a fill; motion empties the fills and marks the steps not reached yet, then fills them as you scroll.
 * The step badge switches state at once (no colour transition): a cross-fade would pass through a low-contrast frame.
 */
function Steps() {
  const { lang } = useLang();
  const { title, items } = whyCopy[lang].steps;
  return (
    <div className="mt-(--space-head)">
      <h3 id="why-steps-title" className="t-title">
        {title}
      </h3>
      <ol aria-labelledby="why-steps-title" data-why-steps="" className="m-0 mt-8 grid list-none gap-8 p-0 md:grid-cols-4 md:gap-6">
        {items.map((step, i) => (
          <li key={step.title} data-why-step="" className="group/step relative ps-16 md:ps-0">
            <span
              aria-hidden="true"
              className="t-sub absolute start-0 top-0 flex size-11 items-center justify-center rounded-full border border-white bg-white font-semibold text-brand tabular-nums group-data-[todo]/step:border-white/40 group-data-[todo]/step:bg-transparent group-data-[todo]/step:text-(--surface-fg-3) md:static"
            >
              {formatNumber(i + 1, lang)}
            </span>
            {i < items.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute start-[1.3125rem] top-14 bottom-[-1.5rem] w-0.5 overflow-clip rounded-full bg-white/20 md:start-14 md:end-[-1rem] md:top-[1.3125rem] md:bottom-auto md:h-0.5 md:w-auto"
              >
                <span data-why-fill="" className="absolute inset-0 block rounded-full bg-white" />
              </span>
            )}
            <h4 className="t-body m-0 mt-2 font-semibold md:mt-5">{step.title}</h4>
            <p className="t-body m-0 mt-1 text-(--surface-fg-2)">{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** «… من {list} …»: the sentence with its link to the crane list. */
function ChannelsText() {
  const { lang } = useLang();
  const { text, listLink } = whyCopy[lang].channels;
  const [before, after = ''] = text.split('{list}');
  return (
    <p className="t-body mt-3 max-w-[34rem] text-(--surface-fg-2)">
      {before}
      <a href="#crane-list" className="ui-link">
        {listLink}
      </a>
      {after}
    </p>
  );
}

/**
 * The band ends on the action (peak-end): the one white strip, and the one red element, WhatsApp. Then the other
 * channels: Call (only when a number is configured), email (Atlas's one confirmed contact) and the request form.
 */
function ChannelsStrip() {
  const { copy, lang } = useLang();
  const tel = telHref();
  return (
    <div data-why-tile="channels" data-ground="light" className="surface-white @container mt-(--space-head) rounded-xl p-(--space-tile) shadow-e2">
      <div className="flex flex-col gap-6 @min-[56rem]:flex-row @min-[56rem]:items-end @min-[56rem]:justify-between @min-[56rem]:gap-12">
        <div className="flex flex-col">
          <h3 className="t-title">{whyCopy[lang].channels.title}</h3>
          <ChannelsText />
          {/* filled and shown by useCraneOnHook when a crane is picked anywhere on the page */}
          <p data-why-picked="" hidden className="ui-chip mt-4 self-start">
            <HookIcon className="size-4 text-red" />
            <span>
              {copy.bar.onHook} <bdi lang="en" dir="ltr" className="t-spec" />
            </span>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Button
            href={whatsappHref(channelMessage(copy, null))}
            external
            size="md"
            icon={<WhatsAppIcon className="size-5" />}
            data-why-whatsapp=""
            data-track="whatsapp_click"
            data-track-location="why"
          >
            {copy.header.menu.whatsapp}
          </Button>
          {tel && env.phone && (
            <Button
              href={tel}
              variant="ghost-light"
              size="md"
              icon={<PhoneIcon className="size-5" />}
              aria-label={fillTemplate(copy.header.call.label, { phone: env.phone })}
              data-track="call_click"
              data-track-location="why"
            >
              {copy.header.call.text}
            </Button>
          )}
          <Button href={`mailto:${siteInfo.email}`} variant="ghost-light" size="md">
            {copy.form.contact.email}
          </Button>
          <Button href="#request" variant="ghost-light" size="md">
            {whyCopy[lang].channels.form}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** The whole section, as the prerender (and dev, and tests) render it. */
export function WhyAtlasContent() {
  const { lang } = useLang();
  const why = whyCopy[lang];
  return (
    <div className="shell">
      <SectionHeader id="why-title" title={why.title} continuation={why.continuation} lead={why.lead} />
      <RangePanel />
      <GroundTypes />
      <Steps />
      <ChannelsStrip />
    </div>
  );
}

/**
 * Keeps the channels strip in step with the crane on the hook (src/lib/request.ts): the WhatsApp message names it and
 * the chip shows it. DOM writes inside the island only (React never re-renders this markup).
 */
function useCraneOnHook(copy: Copy): void {
  useEffect(() => {
    const root = document.getElementById(ID);
    const link = root?.querySelector<HTMLAnchorElement>('[data-why-whatsapp]');
    const chip = root?.querySelector<HTMLElement>('[data-why-picked]');
    const model = chip?.querySelector('bdi');
    if (!link || !chip || !model) return;
    const sync = () => {
      const id = getRequestedCrane();
      const crane = (id && cranes.find((c) => c.id === id)) || null;
      link.href = whatsappHref(channelMessage(copy, crane));
      model.textContent = crane ? crane.model : '';
      chip.hidden = !crane;
    };
    sync();
    window.addEventListener(HOOK_EVENT, sync);
    return () => window.removeEventListener(HOOK_EVENT, sync);
  }, [copy]);
}

export function WhyAtlas() {
  const { copy } = useLang();
  useTrackedClicks(ID);
  useCraneOnHook(copy);
  return (
    <Section id={ID} surface="brand" width="bleed" aria-labelledby="why-title">
      {import.meta.env.SSR || import.meta.env.DEV ? <WhyAtlasContent /> : <KeptShell id={ID} />}
    </Section>
  );
}

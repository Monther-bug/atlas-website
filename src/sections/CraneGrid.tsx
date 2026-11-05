import { useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/Button';
import { DraftBadge } from '@/components/DraftBadge';
import { HookIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import { visibleCranes } from '@/content';
import type { Crane } from '@/content/types';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';
import { setRequestedCrane, useRequestedCrane } from '@/lib/request';
import { applyFilter, availableFilters, bandLabel, resultCount, type FilterValue } from './crane-filters';

export function CraneGrid() {
  return <CraneGridView cranes={visibleCranes} />;
}

export function CraneGridView({ cranes }: { cranes: readonly Crane[] }) {
  const { copy } = useLang();
  const countRef = useRef<HTMLParagraphElement>(null);
  const [filter, setFilter] = useState<FilterValue>('all');
  const { types, bands } = availableFilters(cranes);
  const shown = applyFilter(cranes, filter);
  const choose = (value: FilterValue) => {
    if (value === filter) return;
    setFilter(value);
    track('filter_use');
  };

  return (
    <section id="crane-list" aria-labelledby="grid-title" className="section-y bg-concrete text-ink">
      <div className="shell">
        <h2 id="grid-title" className="t-h2 text-balance text-navy">
          {copy.grid.title}
        </h2>
        <p className="t-lead measure mt-5">{copy.grid.intro}</p>
        <p className="t-small measure mt-3 text-ink/75">{copy.grid.availability}</p>

        <div className="mt-10 flex flex-col gap-5">
          <FilterGroup id="grid-filter-type" label={copy.grid.typeLabel}>
            <Chip value="all" current={filter} onChoose={choose}>
              {copy.grid.all}
            </Chip>
            {types.map((type) => (
              <Chip key={type} value={type} current={filter} onChoose={choose}>
                {copy.craneTypes[type].chip}
              </Chip>
            ))}
          </FilterGroup>
          {bands.length > 0 && (
            <FilterGroup id="grid-filter-band" label={copy.grid.bandLabel}>
              {bands.map((band) => (
                <Chip key={band} value={`band:${band}`} current={filter} onChoose={choose}>
                  {bandLabel(band, copy)}
                </Chip>
              ))}
            </FilterGroup>
          )}
        </div>

        {/* The count doubles as the empty-state message (spec §15.8). */}
        <p ref={countRef} tabIndex={-1} aria-live="polite" className="t-small mt-8 tabular-nums text-ink/75">
          {/* Keyed child: the node is replaced on every change so an unchanged count is still announced. */}
          <span key={filter}>{shown.length > 0 ? resultCount(shown.length, copy) : copy.grid.empty}</span>
        </p>

        <div data-crane-grid="" className="mt-4">
          {shown.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((crane) => (
                <li key={crane.id}>
                  <CraneCard crane={crane} />
                </li>
              ))}
            </ul>
          ) : (
            <Button variant="outline-on-light" onClick={() => {
                setFilter('all');
                countRef.current?.focus();
              }}>
              {copy.grid.showAll}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterGroup({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <span id={id} className="t-label min-w-16 text-ink/75">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  value,
  current,
  onChoose,
  children,
}: {
  value: FilterValue;
  current: FilterValue;
  onChoose: (value: FilterValue) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      data-testid="filter-chip"
      data-value={value}
      aria-pressed={current === value}
      onClick={() => onChoose(value)}
      className="min-h-11 border border-navy px-4 text-[0.9375rem] font-semibold text-navy transition-colors hover:bg-navy/10 aria-pressed:bg-navy aria-pressed:text-white"
    >
      {children}
    </button>
  );
}

function CraneCard({ crane }: { crane: Crane }) {
  const { copy, lang } = useLang();
  const onHook = useRequestedCrane() === crane.id;
  const titleId = `crane-${crane.id}-model`;
  const type = copy.craneTypes[crane.type];

  return (
    <article
      data-testid="crane-card"
      data-crane={crane.id}
      aria-labelledby={titleId}
      className={`flex h-full flex-col border bg-white transition-colors ${onHook ? 'border-red' : 'border-line'}`}
    >
      <Picture
        photo={crane.cardPhoto}
        crop="desktop_16x9"
        alt={copy.alt[crane.cardPhoto]}
        sizes="(min-width: 1280px) 28rem, (min-width: 640px) 45vw, 100vw"
        pictureClassName="block aspect-[16/9] overflow-hidden"
        className="h-full w-full"
      />
      <div className="flex flex-1 flex-col p-6">
        <h3 id={titleId} className="t-spec text-ink">
          <bdi>
            {crane.make} {crane.model}
          </bdi>
        </h3>
        <dl className="mt-4 grid gap-4">
          <div>
            <dt className="t-label text-ink/75">{copy.grid.card.capacity}</dt>
            <dd className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-2">
              {/* Capacity is the biggest element on the card (spec §5.5). */}
              <span className="font-display text-[clamp(3rem,2.5rem+2.2vw,4.5rem)] leading-[0.9] font-extrabold tabular-nums [font-stretch:75%] text-navy">
                {formatNumber(crane.capacityT, lang)}
                {'\u00A0'}
                <span className="text-[0.36em] font-bold [font-stretch:100%] text-red">{copy.hoist.unit}</span>
              </span>
              <DraftBadge verified={crane.verified} />
            </dd>
          </div>
          <div>
            <dt className="t-label text-ink/75">{copy.grid.card.type}</dt>
            <dd className="t-body mt-1">{type.full}</dd>
            <dd className="t-small mt-1 text-ink/75">{type.explainer}</dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-col items-start gap-3 pt-6">
          <Button
            className="w-full"
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
          <a
            href="#request"
            onClick={(event) => {
              setRequestedCrane(crane.id, event.currentTarget);
              track('request_crane', { crane_id: crane.id, location: 'card-link' });
            }}
            className="inline-flex min-h-11 items-center text-[0.9375rem] font-semibold text-navy underline hover:decoration-2"
          >
            {copy.grid.card.formLink}
            <CraneName crane={crane} />
          </a>
        </div>
      </div>
    </article>
  );
}

function CraneName({ crane }: { crane: Crane }) {
  return (
    <span className="sr-only">
      : <bdi>{crane.make} {crane.model}</bdi>
    </span>
  );
}

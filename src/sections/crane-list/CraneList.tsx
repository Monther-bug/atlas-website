import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { ArrowIcon } from '@/components/Icons';
import { SectionHeader } from '@/components/ui/Section';
import type { Crane, CraneId } from '@/content/types';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { announceLineup } from '@/lib/lineup';
import { applyFilter, availableFilters, bandLabel, resultCount, type FilterValue } from '../crane-filters';
import type { SheetRequest } from './CraneSheet';
import { CompareModels } from './CompareModels';
import { LineupCard } from './LineupCard';
import { LoadCheck } from './LoadCheck';
import { SECTION_PROPS } from './section';
import { TypeFilter } from './TypeFilter';

/** The detail sheet is a lazy chunk: never prerendered (a closed dialog shows nothing, and every figure in it is also
 *  in the comparison), fetched when the lineup comes near, rendered on the first Details press. */
const loadSheet = () => import('./CraneSheet');
const CraneSheet = lazy(loadSheet);

/**
 * «اعثر على رافعتك» / "Find your crane" (v2), as the prerender renders it. Contract C9 hooks kept: section#crane-list,
 * [data-crane-grid], article[data-testid=crane-card], button[data-testid=request-crane-button],
 * button[data-testid=filter-chip]. In the browser the whole section is one lazy island (LineupShell.tsx): hydration
 * keeps this HTML and mount.tsx renders CraneListBody into the same <section> when it comes near.
 */
export function CraneList({ cranes }: { cranes: readonly Crane[] }) {
  return (
    <section {...SECTION_PROPS}>
      <CraneListBody cranes={cranes} />
    </section>
  );
}

/** Everything inside the section: header, filter, load check, cards, comparison, and the lazy sheet. */
export function CraneListBody({ cranes }: { cranes: readonly Crane[] }) {
  const { copy } = useLang();
  const countRef = useRef<HTMLParagraphElement>(null);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [sheet, setSheet] = useState<SheetRequest | null>(null);

  const { types, bands } = availableFilters(cranes);
  const shown = applyFilter(cranes, filter);
  const active = sheet ? (cranes.find((c) => c.id === sheet.id) ?? null) : null;

  // Flip: the motion layer records the cards before React changes the list and plays the move right after commit.
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    announceLineup('after');
  }, [filter]);

  // The body mounts when the section is near (or is the static prerender): fetch the sheet chunk now, after the
  // first paint, so the first Details press opens at once.
  useEffect(() => {
    const id = window.setTimeout(() => void loadSheet().catch(() => undefined), 200);
    return () => window.clearTimeout(id);
  }, []);

  const choose = (value: FilterValue) => {
    if (value === filter) return;
    announceLineup('before');
    setFilter(value);
    track('filter_use');
  };

  const openDetails = (crane: Crane, media: HTMLElement | null) => {
    setSheet((prev) => ({ id: crane.id as CraneId, media, seq: (prev?.seq ?? 0) + 1 }));
  };

  const typeOptions = [
    { value: 'all' as FilterValue, label: copy.grid.all },
    ...types.map((type) => ({ value: type as FilterValue, label: copy.craneTypes[type].chip })),
  ];

  return (
    <>
      <div className="shell lineup-top">
        <SectionHeader
          id="grid-title"
          title={`${copy.grid.title}.`}
          continuation={copy.grid.continuation}
          lead={`${copy.grid.intro} ${copy.grid.availability}`}
          actions={
            <Button href="#crane-compare" variant="ghost-light" size="sm" iconEnd={<ArrowIcon direction="down" className="size-4" />}>
              {copy.grid.compareLink}
            </Button>
          }
        />

        <div className="lineup-toolbar">
          <TypeFilter label={copy.grid.typeLabel} options={typeOptions} value={filter} onChoose={choose} />
          {bands.length > 0 ? (
            <div role="group" aria-label={copy.grid.bandLabel} className="lineup-bands">
              {bands.map((band) => (
                <button
                  key={band}
                  type="button"
                  aria-pressed={filter === `band:${band}`}
                  onClick={() => choose(`band:${band}`)}
                  data-testid="filter-chip"
                  data-value={`band:${band}`}
                  className="ui-chip"
                >
                  {bandLabel(band, copy)}
                </button>
              ))}
            </div>
          ) : null}
          {/* The count doubles as the empty-state message (spec §15.8). */}
          <p ref={countRef} tabIndex={-1} aria-live="polite" className="t-small lineup-count">
            {/* Keyed child: the node is replaced on every change so an unchanged count is still announced. */}
            <span key={filter}>{shown.length > 0 ? resultCount(shown.length, copy) : copy.grid.empty}</span>
          </p>
        </div>

        <LoadCheck cranes={cranes} />

        <div data-crane-grid="" className="lineup-grid">
          {shown.length > 0 ? (
            <ul className="lineup">
              {shown.map((crane) => (
                <li key={crane.id} data-lineup-item="" data-crane={crane.id}>
                  <LineupCard crane={crane} onDetails={openDetails} />
                </li>
              ))}
            </ul>
          ) : (
            <Button
              variant="ghost-light"
              onClick={() => {
                choose('all');
                countRef.current?.focus();
              }}
            >
              {copy.grid.showAll}
            </Button>
          )}
        </div>
      </div>

      <CompareModels cranes={cranes} />

      {active && sheet ? (
        <Suspense fallback={null}>
          <CraneSheet crane={active} request={sheet} />
        </Suspense>
      ) : null}
    </>
  );
}

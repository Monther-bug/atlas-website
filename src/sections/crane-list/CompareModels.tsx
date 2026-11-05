import { useEffect, useState, type CSSProperties } from 'react';
import { DraftBadge } from '@/components/DraftBadge';
import { craneListCopy } from '@/content/crane-list-copy';
import type { CraneSpec } from '@/content/crane-specs';
import type { Crane } from '@/content/types';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';
import { CheckIcon } from './icons';

/** Add a model to the comparison (24 px grid, 1.75 stroke, like the shared set). */
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="square" aria-hidden="true" focusable="false" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
import { HookIcon } from '@/components/Icons';
import { setRequestedCrane } from '@/lib/request';
import { track } from '@/lib/analytics';
import { COMPARE_MAX, addToCompare, compareStore, useCompare } from './compare-store';
import { SPEC_GROUPS, capacityCell, hasBar, magnitude, rowLabel, rowMax, specCell, specIdOf, specOf } from './lineup-data';

const off = (hidden: boolean) => (hidden ? { 'data-off': '' } : {});

/**
 * "Compare models" (Apple compare): pick one to three cranes; a real <table> lines their manufacturer specs up row by
 * row, grouped, with sticky model headers and a magnitude bar under each figure (one fixed scale per row, so a bar means
 * the same thing whichever models are picked). Every model is in the markup: without JS all five columns show (the
 * page stays complete); with JS the unpicked columns and the rows none of the picked models has are hidden (.js rule).
 * On phones the rows restack (label above, values side by side), so three models fit without sideways scrolling.
 * Prerendered, then mounted as a lazy island (islands.tsx); the pick lives in compare-store.ts (the sheet adds to it).
 */
export function CompareModels({ cranes }: { cranes: readonly Crane[] }) {
  const { copy, lang } = useLang();
  const extra = craneListCopy[lang];
  const text = extra.compare;
  const selected = useCompare(cranes);
  // A pick on a full table replaces the oldest pick (as "Compare with other models" in the sheet does); the last
  // model cannot be removed. The status line speaks only after such a change.
  const [note, setNote] = useState<'' | 'replaced' | 'min'>('');
  const onToggle = (id: Crane['id']) => {
    if (selected.includes(id)) {
      if (selected.length === 1) return setNote('min');
      setNote('');
      return compareStore.set(selected.filter((x) => x !== id));
    }
    setNote(selected.length >= COMPARE_MAX ? 'replaced' : '');
    compareStore.set(addToCompare(selected, id));
  };
  const models = cranes.flatMap((crane) => {
    const spec = specOf(crane);
    return spec ? [{ crane, spec, on: selected.includes(crane.id) }] : [];
  });
  const specs: CraneSpec[] = models.map((m) => m.spec);
  const picked = models.filter((m) => m.on);
  const status = note === 'replaced' ? text.limit : note === 'min' || (note === '' && picked.length === 1) ? text.needTwo : '';

  // The prerendered table (no JS) shows all five models and scrolls sideways: a focusable, labelled region. The live
  // table (mounted in the browser, never hydrated) restacks on phones and never scrolls, so it needs neither.
  const prerender = typeof window === 'undefined';
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const groups = SPEC_GROUPS.map((group) => ({
    id: group.id,
    rows: group.rows
      .map((row) => {
        const cells = models.map((m) => {
          // One capacity per crane on the page: the row shows the figure the cards show (see capacityCell).
          const own = row === 'maxCapacity' ? capacityCell(m.crane, m.spec, copy, lang) : null;
          return { id: m.crane.id, on: m.on, cell: own ?? specCell(m.spec, row, copy, lang), size: own ? m.crane.capacityT : magnitude(m.spec, row) };
        });
        return { row, cells, max: hasBar(row) ? rowMax(specs, row) : undefined, any: cells.some((c) => c.cell), anyPicked: cells.some((c) => c.on && c.cell) };
      })
      .filter((r) => r.any),
  })).filter((g) => g.rows.length > 0);

  const tableStyle = { '--cols': String(Math.max(1, picked.length)) } as CSSProperties;

  return (
    <section id="crane-compare" className="surface-white lineup-compare" data-ground="light" aria-labelledby="crane-compare-title">
      <div className="shell">
        <header className="lineup-compare__head">
          <h3 id="crane-compare-title" className="t-headline">
            {text.title}
          </h3>
          <p className="t-sub lineup-compare__lead">{text.lead}</p>
          <p className="t-small lineup-compare__muted">{copy.specs.disclaimer}</p>
        </header>

        <div className="lineup-compare__picker">
          <p id="crane-compare-picker" className="t-small lineup-compare__label">
            {text.pickerLabel}
          </p>
          <div role="group" aria-labelledby="crane-compare-picker" className="lineup-picks">
            {models.map(({ crane, on }) => {
              return (
                <button
                  key={crane.id}
                  type="button"
                  aria-pressed={on}
                  aria-disabled={(on && picked.length === 1) || undefined}
                  data-testid="compare-pick"
                  data-crane={crane.id}
                  onClick={() => onToggle(crane.id)}
                  className="lineup-pick"
                >
                  {on ? <CheckIcon className="size-4" /> : <PlusIcon className="size-4" />}
                  <bdi lang="en" dir="ltr" className="t-spec">
                    {crane.model}
                  </bdi>
                  <span className="lineup-pick__cap">
                    {formatNumber(crane.capacityT, lang)}
                    {' '}
                    {copy.hoist.unit}
                  </span>
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className="t-small lineup-compare__status">
            {status}
          </p>
        </div>

        <div className="lineup-compare__wrap" {...(prerender ? { role: 'region', tabIndex: 0, 'aria-label': text.tableName } : {})}>
          <table
            className="lineup-table"
            role="table"
            aria-describedby="crane-compare-missing"
            data-ready={ready ? '' : undefined}
            style={tableStyle}
          >
            <caption className="t-small lineup-table__caption">
              <span className="sr-only">{text.tableName}: </span>
              {copy.specs.heading}
              <DraftBadge verified={cranes.every((c) => c.verified)} />
            </caption>
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader" className="lineup-table__corner">
                  <span className="sr-only">{copy.ui.specification}</span>
                </th>
                {models.map(({ crane, on }) => (
                  <th key={crane.id} scope="col" role="columnheader" data-col={crane.id} {...off(!on)} className="lineup-table__model">
                    <span className="t-caption lineup-table__make">
                      <bdi lang="en" dir="ltr">
                        {crane.make}
                      </bdi>
                    </span>
                    <span className="t-spec lineup-table__code">
                      <bdi lang="en" dir="ltr">
                        {crane.model}
                      </bdi>
                    </span>
                    <button
                      type="button"
                      className="t-small lineup-table__request"
                      onClick={(event) => {
                        setRequestedCrane(crane.id, event.currentTarget);
                        track('request_crane', { crane_id: crane.id, location: 'compare' });
                      }}
                    >
                      <HookIcon className="size-4" />
                      {text.request}
                      <span className="sr-only">
                        : <bdi lang="en" dir="ltr">{crane.make} {crane.model}</bdi>
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.id} role="rowgroup" {...off(!group.rows.some((r) => r.anyPicked))}>
                <tr role="row" className="lineup-table__group">
                  <th scope="rowgroup" role="rowheader" colSpan={picked.length + 1} className="t-body">
                    {extra.groups[group.id]}
                  </th>
                </tr>
                {group.rows.map(({ row, cells, max, anyPicked }) => (
                  <tr key={row} role="row" {...off(!anyPicked)}>
                    <th scope="row" role="rowheader" className="t-small">
                      {rowLabel(row, copy, extra)}
                    </th>
                    {cells.map(({ id, on, cell, size }) =>
                      cell ? (
                        <td key={id} role="cell" data-col={id} {...off(!on)} className="t-body">
                          {cell.latin ? (
                            <bdi lang="en" dir="ltr">
                              {cell.text}
                            </bdi>
                          ) : (
                            // Number and unit stay on one line (CSS nowrap); only a phone column too narrow for a long
                            // unit («ميغاباسكال») may put the unit under its number instead of overflowing.
                            <span className="lineup-num">{cell.text.replace('\u00A0', ' ')}</span>
                          )}
                          {cell.secondary ? (
                            <>
                              <span aria-hidden="true">*</span>
                              <span className="sr-only"> ({text.secondary})</span>
                            </>
                          ) : null}
                          {cell.conflict ? (
                            <>
                              <span aria-hidden="true">†</span>
                              <span className="sr-only"> ({extra.conflict.mark})</span>
                            </>
                          ) : null}
                          {max !== undefined && size !== undefined ? (
                            <span className="lineup-bar" aria-hidden="true">
                              <span style={{ '--m': (size / max).toFixed(3) } as CSSProperties} />
                            </span>
                          ) : null}
                        </td>
                      ) : (
                        <td key={id} role="cell" data-col={id} data-empty="" {...off(!on)} className="t-body">
                          <span aria-hidden="true">—</span>
                          <span className="sr-only">{text.missing}</span>
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        <div className="lineup-compare__foot">
          <p id="crane-compare-missing" className="t-small lineup-compare__muted">
            {text.missingNote}
          </p>
          <p className="t-small lineup-compare__muted">{text.secondaryNote}</p>

          <h4 className="t-body lineup-compare__notes-title">{text.notesHeading}</h4>
          <dl className="lineup-notes">
            {models.map(({ crane, on }) => {
              const id = specIdOf(crane.id);
              return id ? (
                <div key={crane.id} {...off(!on)}>
                  <dt className="t-spec">
                    <bdi lang="en" dir="ltr">
                      {crane.make} {crane.model}
                    </bdi>
                  </dt>
                  <dd className="t-small">{extra.capacityNotes[id]}</dd>
                </div>
              ) : null;
            })}
          </dl>

        </div>
      </div>
    </section>
  );
}

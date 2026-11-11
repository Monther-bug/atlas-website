import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { Button, NewTabNote } from '@/components/Button';
import { ArrowIcon, HookIcon } from '@/components/Icons';
import { Picture } from '@/components/Picture';
import { fill } from '@/components/ui/util';
import { craneListCopy } from '@/content/crane-list-copy';
import { cranePath } from '@/content/crane-pages';
import type { CraneSpec } from '@/content/crane-specs';
import type { Crane, CraneId, CraneListCopy } from '@/content/types';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { setRequestedCrane } from '@/lib/request';
import { nameForTransition } from '@/lib/view-transition';
import { KEY_ROWS, MORE_GROUPS, keyCell, keyLabel, type CompareCell } from './compare-data';
import { compareSlots, compareStore, swapCompare, useCompare } from './compare-store';
import { ChevronDownIcon } from './icons';
import { hostOf, rowLabel, sourcesOf, specIdOf, specOf, specParts } from './lineup-data';
// Live-only styles travel with this lazy chunk; what the prerender needs is in crane-list.css.
import './compare-live.css';

/** Phones show two columns (the CSS uses the same query, so the prerender and the live table agree). */
const NARROW = '(width < 48rem)';
const media = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(NARROW) : null);
function subscribeNarrow(onChange: () => void): () => void {
  const mq = media();
  mq?.addEventListener('change', onChange);
  return () => mq?.removeEventListener('change', onChange);
}
const useNarrow = () => useSyncExternalStore(subscribeNarrow, () => media()?.matches ?? false, () => false);

/** The cards' `sizes`, so a column photo reuses the file its card already loaded (no extra download). */
const CARD_SIZES = '(min-width: 1024px) 30rem, (min-width: 640px) 46vw, 84vw';

interface Column {
  crane: Crane;
  spec: CraneSpec;
  /** Position in the comparison; -1 for a model only the no-JS page shows. */
  slot: number;
  /** Prerender only: shown without JS, hidden with it (not in the comparison). */
  off: boolean;
  /** Prerender only: the middle of three columns, which phones leave out. */
  mid: boolean;
}

/** Prerender: hidden with JS (data-off), left out on phones (data-mid). */
const slotAttrs = (c: Column) => ({
  ...(c.off ? { 'data-off': '' } : {}),
  ...(c.mid ? { 'data-mid': '' } : {}),
});
const colAttrs = (c: Column) => ({ 'data-col': c.crane.id, ...slotAttrs(c) });

/** Screen-reader suffix that makes a column's actions unique (": Grove GMK6350"), as on the cards. */
function CraneName({ crane }: { crane: Crane }) {
  return (
    <span className="sr-only">
      : <Latin>{`${crane.make} ${crane.model}`}</Latin>
    </span>
  );
}

function Latin({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <bdi lang="en" dir="ltr" className={className}>
      {children}
    </bdi>
  );
}

/** A cell as plain text, for the no-JS table. */
function plain(cell: CompareCell): ReactNode {
  const text = `${cell.value}${cell.unit ? `\u00A0${cell.unit}` : ''}${cell.secondary ? '*' : ''}`;
  return cell.latin ? <Latin>{text}</Latin> : text;
}

/** A figure set large with its unit small; "—" (and a spoken "not stated") where the manufacturer gives none. */
function Cell({ cell, text, mark }: { cell: CompareCell | null; text: CraneListCopy['compare']; mark: Record<string, string> }) {
  if (!cell) {
    return (
      <td role="cell" data-empty="" {...mark}>
        <span aria-hidden="true">—</span>
        <span className="sr-only">{text.missing}</span>
      </td>
    );
  }
  return (
    <td role="cell" {...mark}>
      <span className="cmp-v">
        {cell.latin ? (
          <Latin className="cmp-w">{cell.value}</Latin>
        ) : (
          <span className={cell.word ? 'cmp-w' : 'cmp-n'}>{cell.value}</span>
        )}
        {cell.unit ? <span className="cmp-u">{` ${cell.unit}`}</span> : null}
        {cell.secondary ? (
          <>
            <span aria-hidden="true" className="cmp-mark">
              *
            </span>
            <span className="sr-only"> ({text.secondary})</span>
          </>
        ) : null}
      </span>
      {cell.bar !== undefined ? (
        <span className="cmp-meter" aria-hidden="true">
          <span style={{ '--m': cell.bar.toFixed(3) } as CSSProperties} />
        </span>
      ) : null}
      {cell.caption ? (
        <span className="t-caption cmp-cap">
          {cell.caption.map((part, i) => (
            <span key={i}>
              {i > 0 ? ' · ' : ''}
              {part.latin ? <Latin>{part.text}</Latin> : part.text}
            </span>
          ))}
        </span>
      ) : null}
    </td>
  );
}

/** Column headers for screen readers; the visible names are the sticky pickers above the tables. */
function Head({ columns, corner }: { columns: Column[]; corner: string }) {
  return (
    <thead role="rowgroup" className="cmp-head">
      <tr role="row">
        <th scope="col" role="columnheader">
          <span className="sr-only">{corner}</span>
        </th>
        {columns.map((c) => (
          <th key={c.crane.id} scope="col" role="columnheader" {...colAttrs(c)}>
            <span className="sr-only">
              <Latin>{`${c.crane.make} ${c.crane.model}`}</Latin>
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
}

/**
 * «قارن الطرازات» / "Compare models" (Apple compare, simplified). Three columns (two on phones), each with a native
 * model picker that sticks under the header, the crane's photo, Request and Details (a link to the crane's page). One real <table> holds the seven
 * key rows; "Show all specs" renders the other rows, grouped, in a second table on demand (live only, so the default
 * DOM stays small). Notes and sources fold into one disclosure per column. Every figure is from crane-specs.ts.
 *
 * Prerendered with every model (unpicked ones data-off, hidden by the .js rule) so the page is complete without JS:
 * there the full table sits in <noscript>, which a page with JS never parses. In the browser the section is a lazy
 * island (mount.tsx) rendered with createRoot, never hydrated, so the live markup may differ from the prerender; the
 * boxes it keeps (photo frame, picker, toggle) have the same size in both, so mounting shifts nothing.
 */
export function CompareModels({ cranes }: { cranes: readonly Crane[] }) {
  const { copy, lang } = useLang();
  const extra = craneListCopy[lang];
  const text = extra.compare;
  // Build-time constant: the client bundle drops every prerender-only branch (no-JS table, notes in <noscript>).
  const prerender = import.meta.env.SSR;
  const narrow = useNarrow();
  const [all, setAll] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const models = cranes.flatMap((crane) => {
    const spec = specOf(crane);
    return spec ? [{ crane, spec }] : [];
  });
  const withSpec = models.map((m) => m.crane);
  const slots = compareSlots(useCompare(withSpec), withSpec);
  const byId = new Map(models.map((m) => [m.crane.id, m]));
  const three = slots.length === 3;
  // Phones keep the first and the last column: the range by default, and a model just added from a sheet.
  const shown = narrow && three ? [0, 2] : slots.map((_, i) => i);
  const columns: Column[] = prerender
    ? models.map((m) => {
        const slot = slots.indexOf(m.crane.id);
        return { ...m, slot, off: slot < 0, mid: three && slot === 1 };
      })
    : shown.flatMap((slot) => {
        const m = byId.get(slots[slot] as CraneId);
        return m ? [{ ...m, slot, off: false, mid: false }] : [];
      });
  const maxT = Math.max(0, ...models.map((m) => m.crane.capacityT));

  const keyRows = KEY_ROWS.map((row) => {
    const cells = columns.map((c) => ({ c, cell: keyCell(row, c.crane, c.spec, copy, extra, lang, maxT) }));
    return { row, label: keyLabel(row, copy, extra), cells, off: !cells.some((x) => !x.c.off && x.cell) };
  }).filter((r) => r.cells.some((x) => x.cell));

  const moreGroups = (cols: Column[]) =>
    MORE_GROUPS.map((group) => ({
      id: group.id,
      rows: group.rows
        .map((row) => ({ row, label: rowLabel(row, copy, extra), cells: cols.map((c) => ({ c, cell: specParts(c.spec, row, copy, lang) })) }))
        .filter((r) => r.cells.some((x) => x.cell)),
    })).filter((g) => g.rows.length > 0);
  const more = all && !prerender ? moreGroups(columns) : [];

  // The legend explains only the marks in the comparison. It reads every slot, not just a phone's two columns, so it
  // is the same in the prerender and the live table (mounting changes no height).
  const slotCells = KEY_ROWS.map((row) =>
    slots.flatMap((id) => {
      const m = byId.get(id);
      return m ? [keyCell(row, m.crane, m.spec, copy, extra, lang, maxT)] : [];
    }),
  ).filter((cells) => cells.some(Boolean));
  const moreCells = more.flatMap((g) => g.rows.flatMap((r) => r.cells.map((x) => x.cell)));
  const anyMissing = slotCells.some((cells) => cells.some((cell) => !cell)) || moreCells.some((cell) => !cell);
  const anySecondary = [...slotCells.flat(), ...moreCells].some((cell) => cell?.secondary);

  // Announce the models after a change (a swap here, or a pick from a sheet), never on load.
  const names = columns.filter((c) => !c.off).map((c) => `${c.crane.make} ${c.crane.model}`);
  const namesKey = names.join('|');
  const announced = useRef(namesKey);
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (announced.current === namesKey) return;
    announced.current = namesKey;
    setStatus(fill(text.nowComparing, { models: namesKey.split('|').join(lang === 'ar' ? '، ' : ', ') }));
  }, [namesKey, text.nowComparing, lang]);

  const style = {
    '--cols': String(columns.filter((c) => !c.off).length),
    '--cols-all': String(columns.length),
    '--cols-sm': String(Math.min(2, slots.length)),
  } as CSSProperties;

  const table = (cols: Column[], body: ReactNode, caption: ReactNode, describedBy?: string) => (
    <table className={describedBy ? 'cmp-table cmp-table--key' : 'cmp-table'} role="table" {...(describedBy ? { 'aria-describedby': describedBy } : {})}>
      {caption}
      <Head columns={cols} corner={copy.ui.specification} />
      {body}
    </table>
  );

  const groupBodies = (groups: ReturnType<typeof moreGroups>) =>
    groups.map((group) => (
      <tbody key={group.id} role="rowgroup">
        <tr role="row" className="cmp-group">
          <th scope="rowgroup" role="rowheader" colSpan={columns.length + 1} className="t-small">
            {extra.groups[group.id]}
          </th>
        </tr>
        {group.rows.map(({ row, label, cells }) => (
          <tr key={row} role="row">
            <th scope="row" role="rowheader" className="t-small">
              {label}
            </th>
            {cells.map(({ c, cell }) => (
              <Cell key={c.crane.id} cell={cell} text={text} mark={slotAttrs(c)} />
            ))}
          </tr>
        ))}
      </tbody>
    ));

  return (
    <section id="crane-compare" className="surface-white lineup-compare" data-ground="light" aria-labelledby="crane-compare-title">
      <div className="shell">
        <header className="lineup-compare__head">
          <h3 id="crane-compare-title" className="t-headline">
            {text.title}
          </h3>
          <p className="t-sub lineup-compare__lead">{text.lead}</p>
        </header>

        <div
          className="cmp"
          style={style}
          data-ready={ready ? '' : undefined}
          // The no-JS table holds every model and scrolls sideways: a focusable, labelled region.
          {...(prerender ? { role: 'region', tabIndex: 0, 'aria-label': text.tableName } : {})}
        >
          <div className="cmp-pick" role="group" aria-label={text.pickerLabel}>
            {columns.map((c) => (
              <div key={prerender ? c.crane.id : `slot-${c.slot}`} className="cmp-swap" {...colAttrs(c)}>
                <span className="t-caption cmp-swap__make">
                  <Latin>{c.crane.make}</Latin>
                </span>
                {prerender ? (
                  <span className="cmp-swap__model" lang="en" dir="ltr">
                    {c.crane.model}
                  </span>
                ) : (
                  <span className="cmp-swap__field">
                    <select
                      className="cmp-swap__model"
                      data-testid="compare-slot"
                      data-slot={c.slot}
                      aria-label={fill(text.slotLabel, { n: String(columns.indexOf(c) + 1) })}
                      value={c.crane.id}
                      onChange={(event) => compareStore.set(swapCompare(slots, c.slot, event.currentTarget.value as CraneId))}
                    >
                      {models.map(({ crane }) => (
                        <option key={crane.id} value={crane.id} lang="en">
                          {crane.model}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="cmp-swap__chev" />
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="cmp-media">
            {columns.filter((c) => !c.off).map((c) => (
              <div key={c.crane.id} className="cmp-model" {...slotAttrs(c)}>
                <div className="cmp-photo" data-cmp-photo="">
                  {prerender ? null : (
                    <Picture photo={c.crane.cardPhoto} crop="desktop_16x9" alt="" sizes={CARD_SIZES} pictureClassName="block h-full w-full" className="h-full w-full" />
                  )}
                </div>
                <div className="cmp-actions">
                  <Button
                    size="sm"
                    icon={<HookIcon className="size-4" />}
                    data-compare-request=""
                    data-crane={c.crane.id}
                    onClick={(event) => {
                      setRequestedCrane(c.crane.id, event.currentTarget);
                      track('request_crane', { crane_id: c.crane.id, location: 'compare' });
                    }}
                  >
                    {text.request}
                    <CraneName crane={c.crane} />
                  </Button>
                  <Button
                    size="sm"
                    variant="plain"
                    href={cranePath(c.crane.id, lang)}
                    iconEnd={<ArrowIcon className="size-4" />}
                    className="ui-nudge"
                    data-compare-details=""
                    data-crane-page-link={c.crane.id}
                    data-crane={c.crane.id}
                    onClick={(event: MouseEvent<HTMLElement>) => nameForTransition(event.currentTarget.closest('.cmp-model')?.querySelector('[data-cmp-photo]'))}
                  >
                    {copy.grid.card.details}
                    <CraneName crane={c.crane} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {table(
            columns,
            <tbody role="rowgroup">
              {keyRows.map(({ row, label, cells, off }) => (
                <tr key={row} role="row" data-row={row} {...(off ? { 'data-off': '' } : {})}>
                  <th scope="row" role="rowheader" className="t-small">
                    {label}
                  </th>
                  {cells.map(({ c, cell }) => (
                    <Cell key={c.crane.id} cell={cell} text={text} mark={slotAttrs(c)} />
                  ))}
                </tr>
              ))}
            </tbody>,
            <caption className="t-small cmp-caption">
              <span className="sr-only">{text.tableName}: </span>
              {copy.specs.heading}
            </caption>,
            'crane-compare-legend',
          )}

          {/* Kept in the prerender (inert until the island mounts) so mounting adds no height. */}
          <div className="cmp-more">
            <Button
              variant="ghost-light"
              size="sm"
              className="cmp-toggle"
              aria-expanded={all}
              aria-controls="crane-compare-more"
              iconEnd={<ChevronDownIcon className="size-4 cmp-toggle__chev" />}
              onClick={() => setAll((open) => !open)}
            >
              {all ? text.showKey : text.showAll}
            </Button>
            <div id="crane-compare-more" className="cmp-more__body" hidden={!all}>
              {more.length > 0
                ? table(columns, groupBodies(more), <caption className="sr-only">{text.moreName}</caption>)
                : null}
            </div>
          </div>
          {prerender ? (
            <noscript>
              <table className="cmp-table">
                <caption className="t-small cmp-caption">{text.moreName}</caption>
                <thead>
                  <tr>
                    <th scope="col" className="t-small">
                      {copy.ui.specification}
                    </th>
                    {columns.map((c) => (
                      <th key={c.crane.id} scope="col" className="t-small">
                        <Latin>{`${c.crane.make} ${c.crane.model}`}</Latin>
                      </th>
                    ))}
                  </tr>
                </thead>
                {moreGroups(columns).map((group) => (
                  <tbody key={group.id}>
                    <tr className="cmp-group">
                      <th scope="rowgroup" colSpan={columns.length + 1} className="t-small">
                        {extra.groups[group.id]}
                      </th>
                    </tr>
                    {group.rows.map(({ row, label, cells }) => (
                      <tr key={row}>
                        <th scope="row" className="t-small">
                          {label}
                        </th>
                        {cells.map(({ c, cell }) => (
                          <td key={c.crane.id}>{cell ? plain(cell) : '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
              <p className="t-small lineup-compare__muted cmp-plain-notes">{text.secondaryNote}</p>
              <dl className="t-small cmp-plain-notes">
                {columns.map((c) => {
                  const id = specIdOf(c.crane.id);
                  return id ? (
                    <div key={c.crane.id}>
                      <dt>
                        <Latin>{`${c.crane.make} ${c.crane.model}`}</Latin>
                      </dt>
                      <dd>{extra.capacityNotes[id]}</dd>
                    </div>
                  ) : null;
                })}
              </dl>
            </noscript>
          ) : null}

          {/* The prerender keeps this row's box (closed disclosures, the shown models only) so the live comparison
              changes no height above the next section; their contents are live-only (the no-JS page lists the notes
              in <noscript> and hides this row). */}
          <div className="cmp-notes">
            <p className="t-small cmp-notes__label">{extra.sheet.sourcesHeading}</p>
            {columns
              .filter((c) => !c.off)
              .map((c) => {
                const id = specIdOf(c.crane.id);
                return (
                  <details key={c.crane.id} className="cmp-note" {...slotAttrs(c)}>
                    <summary className="t-small">
                      <span>{text.notes}</span>
                      <CraneName crane={c.crane} />
                      <ChevronDownIcon className="cmp-note__chev" />
                    </summary>
                    {prerender ? null : (
                      <>
                        {id ? <p className="t-small">{extra.capacityNotes[id]}</p> : null}
                        <ul className="lineup-sources">
                          {sourcesOf(c.spec).map((s) => (
                            <li key={s.url} className="t-small">
                              <a href={s.url} target="_blank" rel="noopener noreferrer">
                                <Latin>{hostOf(s.url)}</Latin>
                                <NewTabNote />
                              </a>{' '}
                              <span className="lineup-compare__muted">· {s.official ? copy.specs.official : copy.specs.secondary}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </details>
                );
              })}
          </div>
        </div>

        <div id="crane-compare-legend" className="t-small lineup-compare__muted cmp-legend">
          {anyMissing ? <p>{text.missingNote}</p> : null}
          {anySecondary ? <p>{text.secondaryNote}</p> : null}
          <p>{copy.specs.disclaimer}</p>
        </div>
        <p aria-live="polite" className="sr-only">
          {status}
        </p>
      </div>
    </section>
  );
}

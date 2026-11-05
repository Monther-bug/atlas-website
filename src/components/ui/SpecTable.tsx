import type { ReactNode } from 'react';
import { useLang } from '@/lib/lang';
import { cx, fill } from './util';

export interface SpecItem {
  id: string;
  label: ReactNode;
  value: ReactNode;
  unit?: string;
  /** Latin names and codes: isolated with <bdi lang="en"> so they never reorder an Arabic line. */
  latin?: boolean;
  /** One line under the row (a source, a caveat). */
  note?: ReactNode;
}

function Value({ value, unit, latin }: Pick<SpecItem, 'value' | 'unit' | 'latin'>) {
  return (
    <>
      {latin ? (
        <bdi lang="en" dir="ltr">
          {value}
        </bdi>
      ) : (
        value
      )}
      {unit ? ` ${unit}` : null}
    </>
  );
}

/**
 * One machine's specification as a description list (term/value rows, hairline rules, tabular numerals).
 * Rows with no value are the caller's to drop (spec-rows.ts already omits them): never render "—" for a whole row.
 */
export function SpecList({ items, className }: { items: readonly SpecItem[]; className?: string }) {
  return (
    <dl className={cx('ui-spec', className)}>
      {items.map((item) => (
        <div key={item.id} className="ui-spec__row">
          <dt className="ui-spec__term t-body">{item.label}</dt>
          <dd className="ui-spec__value t-body">
            <Value value={item.value} unit={item.unit} latin={item.latin} />
          </dd>
          {item.note ? <dd className="ui-spec__note t-caption">{item.note}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

export interface CompareColumn {
  id: string;
  header: ReactNode;
  /** Tints the column (the crane the visitor picked). */
  highlight?: boolean;
}

export interface CompareRow {
  id: string;
  label: ReactNode;
  /** Keyed by column id. A missing or null cell shows an em dash with "Not stated" for screen readers. */
  cells: Readonly<Record<string, Omit<SpecItem, 'id' | 'label' | 'note'> | null | undefined>>;
}

export interface CompareTableProps {
  /** Visible caption: what is being compared and where the figures come from. */
  caption: ReactNode;
  /** Short plain-text name for the scroll region's label. */
  name: string;
  columns: readonly CompareColumn[];
  rows: readonly CompareRow[];
  className?: string;
}

/**
 * Side-by-side comparison as a real <table> (scope="col"/"row"). The first column and the header row stay put
 * while the table scrolls sideways inside a focusable, labelled region (keyboard users scroll it with arrows).
 */
export function CompareTable({ caption, name, columns, rows, className }: CompareTableProps) {
  const { copy } = useLang();
  return (
    <div role="region" aria-label={fill(copy.ui.scrollTable, { name })} tabIndex={0} className={cx('ui-compare', className)}>
      <table>
        <caption className="t-small">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="t-small">
              {copy.ui.specification}
            </th>
            {columns.map((col) => (
              <th key={col.id} scope="col" data-highlight={col.highlight ? '' : undefined} className="t-body">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row" className="t-small">
                {row.label}
              </th>
              {columns.map((col) => {
                const cell = row.cells[col.id];
                return cell ? (
                  <td key={col.id} data-highlight={col.highlight ? '' : undefined} className="t-body">
                    <Value value={cell.value} unit={cell.unit} latin={cell.latin} />
                  </td>
                ) : (
                  <td key={col.id} data-empty="" data-highlight={col.highlight ? '' : undefined} className="t-body">
                    <span aria-hidden="true">{'—'}</span>
                    <span className="sr-only">{copy.ui.notStated}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { ReactNode } from 'react';
import type { FilterValue } from '../crane-filters';

export interface FilterOption {
  value: FilterValue;
  label: ReactNode;
}

/**
 * The type filter as a segmented pill track (v2 SegmentedControl look). It stays a group of toggle buttons
 * (aria-pressed, data-testid="filter-chip": contract C9 and qa filterCheck), so exactly one is pressed at a time and
 * every option keeps its own Tab stop. The pressed option paints its own navy fill; with motion on, the lineup motion
 * chunk (src/motion/lineup.ts) measures it and slides the thumb instead. No option is pressed while a band is active.
 */
export function TypeFilter({
  label,
  options,
  value,
  onChoose,
}: {
  label: string;
  options: readonly FilterOption[];
  value: FilterValue;
  onChoose: (value: FilterValue) => void;
}) {
  return (
    <div role="group" aria-label={label} data-tone="light" data-lineup-seg="" className="ui-seg lineup-seg">
      <span className="ui-seg__thumb" aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          data-testid="filter-chip"
          data-value={option.value}
          aria-pressed={option.value === value}
          onClick={() => onChoose(option.value)}
          className="ui-seg__option"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

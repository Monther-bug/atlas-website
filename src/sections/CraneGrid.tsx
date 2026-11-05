import { visibleCranes } from '@/content';
import type { Crane } from '@/content/types';
import { lineupRegistry } from './crane-list/island-registry';
import { LineupShell } from './crane-list/LineupShell';

/** «اعثر على رافعتك» / "Find your crane": the v2 lineup, load check, detail sheet and comparison (./crane-list). */
export function CraneGrid() {
  return <CraneGridView cranes={visibleCranes} />;
}

/**
 * The prerender (and the lineup's tests) render the full section; the browser renders the shell, which keeps that
 * HTML and mounts the live section from a lazy chunk when it comes near (crane-list/island-registry.ts).
 */
export function CraneGridView({ cranes }: { cranes: readonly Crane[] }) {
  const Full = lineupRegistry.section;
  return Full ? <Full cranes={cranes} /> : <LineupShell cranes={cranes} />;
}

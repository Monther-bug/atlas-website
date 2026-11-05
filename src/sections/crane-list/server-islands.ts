import { CompareModels } from './CompareModels';
import { compareRegistry } from './CompareSlot';
import { CraneList } from './CraneList';
import { lineupRegistry } from './island-registry';

/** Registers the full section and its comparison for static rendering (prerender and tests only; see island-registry.ts). */
lineupRegistry.section = CraneList;
compareRegistry.component = CompareModels;

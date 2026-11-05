import { CraneList } from './CraneList';
import { lineupRegistry } from './island-registry';

/** Registers the full section for static rendering (prerender and tests only; see island-registry.ts). */
lineupRegistry.section = CraneList;

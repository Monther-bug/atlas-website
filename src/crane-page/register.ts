import { CraneBodyFull } from './CraneBody';
import { craneBodyRegistry } from './registry';

/** Registers the full body for static rendering (prerender, dev server, tests; see registry.ts). */
craneBodyRegistry.full = CraneBodyFull;

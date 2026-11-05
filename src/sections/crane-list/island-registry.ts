import type { ComponentType } from 'react';
import type { Crane } from '@/content/types';

/**
 * The full «اعثر على رافعتك» component, for static rendering. Filled only by server-islands.ts, which the prerender
 * (src/entry-server.tsx) and the lineup's tests import. The browser never imports it: there the section is a lazy
 * island (LineupShell.tsx), so none of its code or crane-specs ships in the main chunk.
 */
export const lineupRegistry: { section?: ComponentType<{ cranes: readonly Crane[] }> } = {};

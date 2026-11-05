import type { ComponentType } from 'react';
import type { Crane } from '@/content/types';

/**
 * The full crane page body, for static rendering only. Filled by ./register.ts, which the prerender
 * (src/entry-server.tsx), the dev server (src/boot-crane.tsx, DEV only) and the tests import. A browser build never
 * imports it, so none of the body's code, the specifications or the page copy reach the page's JavaScript.
 */
export const craneBodyRegistry: { full?: ComponentType<{ crane: Crane }> } = {};

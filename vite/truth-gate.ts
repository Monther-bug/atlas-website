import path from 'node:path';
import { runnerImport, type Plugin } from 'vite';
import { findTruthProblems, type TruthInput } from '../src/lib/truth.ts';

export interface TruthGateOptions {
  target: 'staging' | 'production';
  env: TruthInput['env'];
}

/**
 * Truth gate (spec §4.3). At the start of every build it loads the real content
 * (src/content/ar.ts, en.ts, cranes.ts) and checks it with findTruthProblems():
 * production builds FAIL and list every problem; staging builds warn with a count.
 *
 * The content is TypeScript that may use `@/` imports and extensionless relative
 * imports, so it is loaded with Vite's own module runner (runnerImport), the same
 * loader `vite --configLoader runner` uses. Node's built-in type stripping cannot
 * resolve `@/…` or `./site` (no extension), so it is not used.
 */
export function truthGate({ target, env }: TruthGateOptions): Plugin {
  let root = process.cwd();
  let isSsr = false;
  return {
    name: 'atlas-truth-gate',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      isSsr = Boolean(config.build.ssr);
    },
    async buildStart() {
      // Part E's prerender runs a second, SSR `vite build`. The client build has
      // already been checked, so the gate must not run (and fail/warn) twice.
      if (isSsr) return;
      const load = async <T>(file: string): Promise<T> => {
        try {
          const { module } = await runnerImport<T>(path.join(root, file), {
            configFile: false,
            root,
            logLevel: 'silent',
            resolve: { alias: { '@': path.join(root, 'src') } },
            define: { __BUILD_TARGET__: JSON.stringify(target) },
          });
          return module;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return this.error(`Truth gate: could not load ${file}: ${message}`);
        }
      };
      const { ar } = await load<{ ar: unknown }>('src/content/ar.ts');
      const { en } = await load<{ en: unknown }>('src/content/en.ts');
      const { cranes } = await load<{ cranes: TruthInput['cranes'] }>('src/content/cranes.ts');

      const problems = findTruthProblems({ copies: [ar, en], cranes, env });
      if (problems.length === 0) return;
      if (target === 'production') {
        this.error(
          `Truth gate: ${problems.length} problem(s) block the production build:\n  - ${problems.join('\n  - ')}`,
        );
      }
      this.warn(
        `Truth gate: ${problems.length} unverified item(s). Staging shows them with DraftBadges; ` +
          '`npm run build:production` lists them.',
      );
    },
  };
}

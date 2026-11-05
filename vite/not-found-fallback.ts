import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import type { Connect, Plugin, ResolvedConfig } from 'vite';

/**
 * `vite preview`: a path that is not a file or a page gets 404.html with status 404, as Vercel serves it
 * (a real 404, not the home page). Directories are pages only if they hold an index.html.
 */
export function notFoundFallback(): Plugin {
  let outDir = 'dist';
  return {
    name: 'atlas-not-found-fallback',
    configResolved(config: ResolvedConfig) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    configurePreviewServer(server) {
      const handler: Connect.NextHandleFunction = (req, res, next) => {
        const pathname = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
        const target = path.join(outDir, pathname);
        const inside = target.startsWith(outDir);
        const hit =
          inside &&
          existsSync(target) &&
          (statSync(target).isFile() || existsSync(path.join(target, 'index.html')));
        const page = path.join(outDir, '404.html');
        if (hit || !existsSync(page)) return next();
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(readFileSync(page));
      };
      // Returned function runs after Vite's own middlewares would, so register before them.
      server.middlewares.stack.unshift({ route: '', handle: handler });
    },
  };
}

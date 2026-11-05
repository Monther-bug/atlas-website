import type { Plugin } from 'vite';

/**
 * Dev server only: /cranes/<id>/ and /en/cranes/<id>/ are served from their language's template (cranes/index.html,
 * en/cranes/index.html), as the prerender does for the build. The client reads the crane from the address.
 */
export function cranePagesDev(): Plugin {
  return {
    name: 'atlas-crane-pages-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const match = /^(\/en)?\/cranes\/[a-z0-9-]+\/?(?:index\.html)?(\?.*)?$/.exec(req.url ?? '');
        if (match) req.url = `${match[1] ?? ''}/cranes/index.html${match[2] ?? ''}`;
        next();
      });
    },
  };
}

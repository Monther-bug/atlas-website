import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  define: { __BUILD_TARGET__: JSON.stringify('staging') },
  test: {
    environment: 'jsdom',
    // App tests live in src/; the Vite plugins (vite/) and build scripts (scripts/) have pure helpers with tests too.
    include: ['src/**/*.test.{ts,tsx}', 'vite/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
});

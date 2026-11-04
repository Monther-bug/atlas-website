import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  define: { __BUILD_TARGET__: JSON.stringify('staging') },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // App tests live in src/; the Vite plugins (vite/), build scripts (scripts/) and QA scripts (qa/) have pure helpers with tests too.
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs', 'qa/**/*.test.mjs', 'vite/**/*.test.ts'],
  },
});

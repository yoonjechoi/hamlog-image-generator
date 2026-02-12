import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/packages/app/chrome-extension',
  resolve: {
    alias: {
      '@hamlog/gemini-client': resolve(__dirname, '../../lib/gemini-client/dist/index.js'),
      '@hamlog/core': resolve(__dirname, '../../lib/core/dist/index.js'),
    },
  },
  test: {
    name: '@hamlog/chrome-extension',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      enabled: true,
      provider: 'v8',
      thresholds: { statements: 71, branches: 75, functions: 78, lines: 73 },
      exclude: ['**/*.po.ts'],
    },
    server: {
      deps: {
        inline: ['@luigi-project/client'],
      },
    },
  },
});

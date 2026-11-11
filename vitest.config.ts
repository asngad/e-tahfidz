import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{js,ts,tsx}'],
    exclude: ['node_modules/**', 'server/node_modules/**', 'test-results/**', 'playwright-report/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: [
        'App.tsx',
        'index.tsx',
        'components/**/*.{ts,tsx}',
        'services/**/*.ts',
        'mockData.ts',
        'constants.ts',
        // types.ts murni deklarasi tipe (tanpa kode runtime) -> tidak ikut coverage
        'server/app.js',
        'server/routes/**/*.js',
        'server/middleware/**/*.js',
        'server/config/**/*.js',
      ],
      exclude: ['**/*.test.*', '**/*.d.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});

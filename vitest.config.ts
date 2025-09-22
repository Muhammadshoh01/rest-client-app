/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/',
        '.next/',
        'public/',
        '**/*.stories.*',
        '**/*.test.*',
        '**/*.spec.*',
        'dist',
        'src/utils/constants',
        'src/types',
        'src/utils/supabase',
        'src/i18n/request.ts',
        'src/middleware.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 50,
          lines: 50,
          statements: 50,
        },
      },
      include: ['src/**/*.{js,jsx,ts,tsx}'],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    clearMocks: true,
    restoreMocks: true,
  },
});

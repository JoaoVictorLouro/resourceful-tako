import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import Path from 'path';
import * as DotEnv from 'dotenv';

const { parsed: env } = DotEnv.config({ path: Path.resolve(import.meta.dirname, './tests/config/tests.env') });

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  envDir: Path.resolve(import.meta.dirname, './tests/config'),
  test: {
    testTimeout: 35000,
    fileParallelism: false,
    environment: 'jsdom',
    coverage: {
      reporter: ['json', 'html'],
      include: ['src/**/*'],
    },
    env: {
      ...env,
    },
    globalSetup: Path.resolve(import.meta.dirname, './tests/config/global-setup.ts'),
  },
});

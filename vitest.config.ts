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
    environment: 'jsdom',
    coverage: {
      reporter: ['json'],
    },
    env: {
      ...env,
    },
    globalSetup: Path.resolve(import.meta.dirname, './tests/config/global-setup.ts'),
  },
});

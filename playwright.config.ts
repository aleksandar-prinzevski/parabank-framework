import { defineConfig, devices } from '@playwright/test';
import { loadRegion } from './src/core/config';

const region = loadRegion();

export default defineConfig({
  reporter: 'html',
  use: { trace: 'on-first-retry' },
  projects: [
    {
      name: 'web',
      testDir: './tests/web',
      use: { ...devices['Desktop Chrome'], baseURL: `${region.baseUrl}/` },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: `${region.baseUrl}/services/bank/` },
    },
  ],
});
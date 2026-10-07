import { defineConfig, devices } from '@playwright/test';
import { loadRegion } from './src/core/config';

const region = loadRegion();

export default defineConfig({
  workers: 1,
    // In CI: print a list and write the HTML report without trying to open it.
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'html',
    use: { trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: [
    {
      name: 'web',
      testDir: './tests/web',
      use: { ...devices['Desktop Chrome'], baseURL: `${region.baseUrl}/` },
    },
     {
      name: 'api-setup',
      testDir: './tests/setup',
      use: { ...devices['Desktop Chrome'], baseURL: `${region.baseUrl}/` },
    },
    {
      name: 'api',
      testDir: './tests/api',
      dependencies: ['api-setup'],
      use: { baseURL: `${region.baseUrl}/services/bank/` },
    },
  ],
});
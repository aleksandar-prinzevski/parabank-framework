import { defineConfig, devices } from '@playwright/test';
import { loadRegion } from './src/core/config';

const region = loadRegion();

export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  use: {
    baseURL: `${region.baseUrl}/`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
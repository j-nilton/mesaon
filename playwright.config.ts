import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'src/__tests__/e2e',
  timeout: 180000,
  retries: 0,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'android',
    },
  ],
});
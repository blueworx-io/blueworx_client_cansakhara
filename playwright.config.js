import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Creates the guest account and its signed-in state — see tests/global-setup.js.
  globalSetup: './tests/global-setup.js',
  // The specs mutate site-wide state; parallel workers against one WordPress
  // make one spec's "off" another spec's "on".
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:8881',
  },
});

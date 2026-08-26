import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // The specs mutate site-wide state; parallel workers against one WordPress
  // make one spec's "off" another spec's "on".
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  // Only tests/fidelity.spec.js calls toMatchSnapshot in this project (no
  // other spec uses screenshot/snapshot matching), so it is safe to point
  // this at tests/baselines/ for the whole suite. This makes the fidelity
  // gate compare against ONE reference file with no {platform}/{projectName}
  // token, so it resolves the same PNG on Windows and on a Linux CI runner
  // (a Windows-only "-win32" snapshot name would otherwise 404 in CI).
  //
  // WARNING: tests/baselines/*.png are the Task 1 Next.js-build baselines.
  // The Next.js app that produced them no longer exists in this tree, so
  // they CANNOT be regenerated. Never run
  // `npx playwright test --update-snapshots` (or any project script that
  // passes --update-snapshots) while this template points at
  // tests/baselines/ — it would silently overwrite the irreplaceable
  // reference images with whatever the plugin currently renders.
  snapshotPathTemplate: '{testDir}/baselines/{arg}{ext}',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:8881',
  },
});

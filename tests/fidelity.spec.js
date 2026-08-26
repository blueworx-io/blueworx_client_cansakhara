// The acceptance gate for the whole WordPress-plugin conversion.
//
// !!! DO NOT RUN WITH --update-snapshots !!!
// playwright.config.js points this spec's snapshotPathTemplate directly at
// tests/baselines/*.png — there is no separate copy anymore. Those PNGs are
// the Task 1 Next.js-build baselines and CANNOT be regenerated (the Next.js
// app that produced them no longer exists in this tree). Running
// `--update-snapshots` (or any script/CI step that passes it) against this
// spec would silently overwrite the irreplaceable reference images with
// whatever the plugin currently renders, permanently destroying the ground
// truth this gate compares against.
//
// Compares the plugin's rendered output against the Next.js baselines
// captured in Task 1 (tests/baselines/*.png). The Next.js app no longer
// exists in the working tree, so those baselines are the fixed reference
// and must never be modified or regenerated here.
//
// The capture method below reproduces Task 1's method exactly (see
// scripts/capture-baselines.mjs as recorded in
// .superpowers/sdd/2026-08-25-wordpress-plugin-conversion/task-1-report.md):
// same viewports, deviceScaleFactor, reducedMotion, the same scroller
// neutralisation (.site-shell is a 100dvh in-page scroll container, so
// without this only the first screen is captured), the same lazy-image
// forcing, and a full-page screenshot. Any deviation from this method
// would make the comparison meaningless.
//
// Uses Playwright's own bundled pixel comparator (toMatchSnapshot) rather
// than adding a new dependency — it reports the differing pixel count in
// the failure message and writes -expected/-actual/-diff PNGs to
// test-results/ on failure.
import { test, expect } from '@playwright/test';

// This is a LOCAL acceptance gate, and deliberately not a CI check.
//
// tests/baselines/*.png were captured on Windows, from a Next.js build that no
// longer exists. Windows rasterises text through DirectWrite; the Foundation's
// tests job runs on ubuntu-latest, which uses FreeType. The same page renders
// different pixels under the two, and nobody has measured whether that stays
// inside the 1% gate. If it did not, there would be no recovery: a Linux
// baseline can never be made, because the reference build is gone.
//
// So the gate runs where the reference is valid — on the machine whose fonts
// produced it — and skips under CI. Everything else in tests/ still runs there,
// which is what keeps the Foundation's "the suite executed zero tests" guard
// satisfied.
test.skip(
  !!process.env.CI,
  'Fidelity baselines were captured on Windows and cannot be regenerated for another platform — run this gate locally.'
);

const ROUTES = { home: '/', 'by-day': '/by-day/', 'by-night': '/by-night/' };
const WIDTHS = { mobile: 390, desktop: 1440 };

for (const [name, route] of Object.entries(ROUTES)) {
  for (const [size, width] of Object.entries(WIDTHS)) {
    test(`${name} at ${size} matches the Next.js baseline`, async ({ browser }) => {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
        // Same conditions the baselines were captured under: motion is
        // one-shot and time-based, so freezing it makes both sides land on
        // the initial slide/index deterministically.
        reducedMotion: 'reduce',
      });

      const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:8881';
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);

      // Neutralise the in-page scroller so the full route lays out in flow,
      // instead of being clipped to the first screen.
      await page.addStyleTag({
        content: `
          html, body, .site-shell {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
        `,
      });

      // Force lazy images to load now that the whole page is in flow, then
      // wait for reflow/layout and image decode before shooting.
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
          img.loading = 'eager';
        });
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
      });

      const shot = await page.screenshot({ fullPage: true });
      await page.close();

      expect(shot).toMatchSnapshot(`${name}-${size}.png`, {
        maxDiffPixelRatio: 0.01,
      });
    });
  }
}

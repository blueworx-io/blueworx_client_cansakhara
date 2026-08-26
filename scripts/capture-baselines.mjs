// Captures the reference screenshots the plugin port is graded against.
// Run once, against the Next.js build, before any of it is deleted.
//
// The site scrolls inside .site-shell (body is height: 100dvh; overflow:
// hidden, so .site-shell is the in-page scroll container). Screenshotting
// .site-shell directly only captures its rendered box — the first screen.
// Instead we neutralise the scroller (make everything flow to full content
// height) and take a full-page screenshot, so the whole route is captured.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const ROUTES = { home: '/', 'by-day': '/by-day', 'by-night': '/by-night' };
const WIDTHS = { mobile: 390, desktop: 1440 };
const BASE = process.env.BASELINE_URL ?? 'http://localhost:3000';
const OUT = 'tests/baselines';

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const [name, path] of Object.entries(ROUTES)) {
  for (const [size, width] of Object.entries(WIDTHS)) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
      // Motion is one-shot and time-based; freezing it makes the diff stable.
      reducedMotion: 'reduce',
    });
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
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
      // Give the browser a beat to reflow and kick off image loads.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await Promise.all(
        [...document.images].map((img) => img.decode().catch(() => {}))
      );
    });

    await page.screenshot({ path: `${OUT}/${name}-${size}.png`, fullPage: true });
    await page.close();
  }
}

await browser.close();
console.log('Baselines written to', OUT);

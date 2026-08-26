import { test, expect } from '@playwright/test';

// browser.newPage() does not inherit the config's use.baseURL, so specs that
// open their own page must resolve the host themselves or they silently test
// whatever is on the default port.
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:8881';

test('the motion layer runs and binds ScrollTrigger to the in-page scroller', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('the motion layer marks itself as running', async ({ page }) => {
  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => document.documentElement.hasAttribute('data-cansakhara-motion')))
    .toBe(true);
  // The pre-paint guard stays in force while the motion layer owns the reveal.
  const ready = await page.evaluate(() =>
    document.documentElement.classList.contains('motion-ready')
  );
  expect(ready).toBe(true);
});

test('a bundle that never runs degrades to the plain visible page', async ({ browser }) => {
  // The failure a caching or optimisation plugin causes: the pre-paint guard
  // hides the hero, then nothing arrives to reveal it. The watchdog must drop
  // the guard rather than leave the front page wordmark-less forever.
  const page = await browser.newPage();
  await page.route('**/assets/js/public.js*', (route) => route.abort());
  await page.goto(`${BASE}/`, { waitUntil: 'load' });

  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains('motion-ready')))
    .toBe(false);

  const opacity = await page
    .locator('.hero-wordmark')
    .evaluate((el) => getComputedStyle(el).opacity);
  expect(opacity).toBe('1');
  await page.close();
});

test('reduced motion leaves the hero visible rather than hidden', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.goto(`${BASE}/`);
  await expect(page.locator('.site-shell')).toBeVisible();
  // The no-FOUC guard must not have hidden anything when motion is reduced.
  const ready = await page.evaluate(() =>
    document.documentElement.classList.contains('motion-ready')
  );
  expect(ready).toBe(false);
  await page.close();
});

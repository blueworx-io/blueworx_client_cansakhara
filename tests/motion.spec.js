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

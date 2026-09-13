import { test, expect } from '@playwright/test';
import { GUEST_STATE } from './helpers/wp.js';

// These pages are private: browse them as the signed-in guest.
test.use({ storageState: GUEST_STATE });

test('the plugin stylesheet loads and no theme stylesheet does', async ({ page }) => {
  await page.goto('/home/');
  const hrefs = await page.locator('link[rel="stylesheet"]').evaluateAll(
    (links) => links.map((l) => l.getAttribute('href'))
  );
  expect(hrefs.some((h) => h.includes('blueworx-client-cansakhara/assets/css/public.css'))).toBe(true);
  expect(hrefs.some((h) => h.includes('/themes/'))).toBe(false);
});

test('the display font resolves to Montserrat', async ({ page }) => {
  await page.goto('/home/');
  await page.evaluate(() => document.fonts.ready);
  const family = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim()
  );
  expect(family).toContain('Montserrat');
});

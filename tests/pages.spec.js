import { test, expect } from '@playwright/test';
import { GUEST_STATE } from './helpers/wp.js';

// Every page but Welcome is private: browse as the signed-in guest.
test.use({ storageState: GUEST_STATE });

test('the four plugin pages are reachable', async ({ page }) => {
  for (const path of ['/', '/home/', '/by-day/', '/by-night/']) {
    const response = await page.goto(path);
    expect(response.status(), `${path} should return 200`).toBe(200);
  }
});

test('the front page is the plugin Welcome page, not the WordPress blog roll', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/page-cansakhara-welcome/);
});

test('the plugin renders the whole document, not the theme', async ({ page }) => {
  await page.goto('/by-day/');
  await expect(page.locator('body')).toHaveClass(/cansakhara-theme-day/);
  // A theme's own wrapper would appear here if get_header() were being used.
  await expect(page.locator('#page, .wp-site-blocks')).toHaveCount(0);
});

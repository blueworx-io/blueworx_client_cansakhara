import { test, expect } from '@playwright/test';

test('the four plugin pages are reachable', async ({ page }) => {
  for (const path of ['/', '/by-day/', '/by-night/', '/welcome/']) {
    const response = await page.goto(path);
    expect(response.status(), `${path} should return 200`).toBe(200);
  }
});

test('the front page is the plugin home page, not the WordPress blog roll', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/cansakhara-page/);
});

test('the plugin renders the whole document, not the theme', async ({ page }) => {
  await page.goto('/by-day/');
  await expect(page.locator('body')).toHaveClass(/cansakhara-theme-day/);
  // A theme's own wrapper would appear here if get_header() were being used.
  await expect(page.locator('#page, .wp-site-blocks')).toHaveCount(0);
});

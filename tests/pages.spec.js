import { test, expect } from '@playwright/test';

test('the three plugin pages are reachable', async ({ page }) => {
  for (const path of ['/', '/by-day/', '/by-night/']) {
    const response = await page.goto(path);
    expect(response.status(), `${path} should return 200`).toBe(200);
  }
});

test('the front page is the plugin home page, not the WordPress blog roll', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/cansakhara-page/);
});

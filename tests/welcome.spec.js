import { test, expect } from '@playwright/test';

test('the welcome page exists and is rendered by the plugin', async ({ page }) => {
  const response = await page.goto('/welcome/');
  expect(response.status()).toBe(200);
  await expect(page.locator('body')).toHaveClass(/page-cansakhara-welcome/);
  await expect(page.locator('body')).toHaveClass(/cansakhara-theme-welcome/);
});

test('the welcome page shows the mark, wordmark, IBIZA and both buttons', async ({ page }) => {
  await page.goto('/welcome/');
  await expect(page.locator('img[src*="logo-white.svg"]')).toBeVisible();
  await expect(page.locator('img[alt="Can Sakhara"]')).toBeVisible();
  await expect(page.getByText('Ibiza', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toHaveAttribute('data-cansakhara-popup-open', 'login');
  await expect(page.getByRole('button', { name: 'Enquire' })).toHaveAttribute('data-cansakhara-popup-open', 'enquire');
  // No site header, footer or side nav on the splash.
  await expect(page.locator('[data-cansakhara-header]')).toHaveCount(0);
  await expect(page.locator('footer')).toHaveCount(0);
});

test('the welcome page is not the front page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/page-cansakhara-home/);
});

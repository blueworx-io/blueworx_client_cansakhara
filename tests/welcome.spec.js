import { test, expect } from '@playwright/test';

test('the welcome page is the front page and is rendered by the plugin', async ({ page }) => {
  const response = await page.goto('/');
  expect(response.status()).toBe(200);
  await expect(page.locator('body')).toHaveClass(/page-cansakhara-welcome/);
  await expect(page.locator('body')).toHaveClass(/cansakhara-theme-welcome/);
});

test('the welcome page shows the mark, wordmark, IBIZA and both buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('img[src*="logo-white.svg"]')).toBeVisible();
  await expect(page.locator('img[alt="Can Sakhara"]')).toBeVisible();
  await expect(page.getByText('Ibiza', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toHaveAttribute('data-cansakhara-popup-open', 'login');
  await expect(page.getByRole('button', { name: 'Enquire' })).toHaveAttribute('data-cansakhara-popup-open', 'enquire');
  // No site header, footer or side nav on the splash.
  await expect(page.locator('[data-cansakhara-header]')).toHaveCount(0);
  await expect(page.locator('footer')).toHaveCount(0);
});

test('the welcome page plays the looping background video behind the content', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('main video');
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute('autoplay', '');
  await expect(video).toHaveAttribute('loop', '');
  await expect(video).toHaveAttribute('muted', '');
  await expect(video).toHaveAttribute('playsinline', '');
  // The still stays as the poster so nothing flashes while the file loads.
  await expect(video).toHaveAttribute('poster', /welcome-bg\.jpg/);
  const status = await page.request.get(await video.locator('source').getAttribute('src'));
  expect(status.status()).toBe(200);
  expect(status.headers()['content-type']).toContain('video/webm');
  // It sits behind the content: the LOGIN button is still clickable.
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('[data-cansakhara-popup="login"]')).toHaveAttribute('aria-hidden', 'false');
});

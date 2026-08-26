import { test, expect } from '@playwright/test';

test('the header renders with its menu trigger and enquire link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-cansakhara-header]')).toBeVisible();
  await expect(page.locator('[data-cansakhara-menu-open]')).toHaveAttribute('aria-expanded', 'false');
  await expect(
    page.locator('[data-cansakhara-header]').getByRole('link', { name: 'Enquire' })
  ).toHaveAttribute('href', 'mailto:reservations@cansakhara.com');
});

test('the drawer is present and closed on load', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#site-menu')).toHaveAttribute('aria-hidden', 'true');
});

test('the by-day header takes the day panel colour', async ({ page }) => {
  await page.goto('/by-day/');
  await expect(page.locator('[data-cansakhara-header]')).toHaveAttribute(
    'data-cansakhara-solid-color', '#ac9a8c'
  );
});

test('the footer renders its outbound links', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a[href="https://mdmsl.com/"]')).toHaveCount(1);
});

test('the side nav container is present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-cansakhara-side-nav]')).toHaveCount(1);
});

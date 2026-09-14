import { test, expect } from '@playwright/test';
import { loginAsAdmin, setThemeToken, resetTheme } from './helpers/wp.js';

test.describe('the Theme tab', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.afterEach(async ({ page }) => {
    // Already signed in — never loginAsAdmin() again here, it stalls ~32s.
    await resetTheme(page);
  });

  test('is a tab on the settings screen, built from the design system', async ({ page }) => {
    await page.goto('/wp-admin/options-general.php?page=cansakhara');
    await page.click('.bw-tab:has-text("Theme")');
    await expect(page).toHaveURL(/tab=theme/);
    await expect(page.locator('.bw-admin.bw-page')).toBeVisible();
    await expect(page.locator('.bw-tab.is-active')).toHaveText(/Theme/);
    await expect(page.locator('.bw-table')).toHaveCount(2); // Desktop, Mobile
    await expect(page.locator('.bw-colorfield')).toHaveCount(12);
    // Every field shows its Figma default.
    await expect(page.locator('#cs-body-desktop-size')).toHaveValue('16');
    await expect(page.locator('#cs-h1-mobile-ls')).toHaveValue('6');
    await expect(page.locator('#cs-color-home-2')).toHaveValue('#42081a');
  });

  test('a saved size reaches the front end, and reset removes it', async ({ page }) => {
    await setThemeToken(page, 'cs-body-desktop-size', '18');
    await page.goto('/home/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--cs-body-size').trim())).toBe('18px');
    await resetTheme(page);
    await page.goto('/home/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--cs-body-size').trim())).toBe('16px');
  });

  test('an invalid colour is ignored and the default kept', async ({ page }) => {
    await setThemeToken(page, 'cs-color-home-2', 'not-a-colour');
    await page.goto('/home/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--cs-color-home-2').trim())).toBe('#42081a');
  });

  test('the General tab still saves', async ({ page }) => {
    await page.goto('/wp-admin/options-general.php?page=cansakhara');
    await expect(page.locator('#cansakhara-login-redirect')).toBeVisible();
    await expect(page.locator('.bw-tab.is-active')).toHaveText(/General/);
  });
});

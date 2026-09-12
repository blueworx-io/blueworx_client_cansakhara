import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/wp.js';

test.describe('the settings screen', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('is built from the admin design system', async ({ page }) => {
    await page.goto('/wp-admin/options-general.php?page=cansakhara');
    await expect(page.locator('.bw-admin.bw-page')).toBeVisible();
    await expect(page.locator('.bw-pagehead__h1')).toHaveText('Settings');
    const css = page.locator('link[href*="blueworx-admin-design.css"]');
    await expect(css).toHaveCount(1);
  });

  test('saves the login destination and shows it after reload', async ({ page }) => {
    await page.goto('/wp-admin/options-general.php?page=cansakhara');
    await page.selectOption('#cansakhara-login-redirect', { label: 'By Day' });
    await page.click('button[type="submit"]:has-text("Save changes")');
    await page.waitForURL(/settings-updated=true/);
    await expect(page.locator('.bw-notice--success')).toBeVisible();

    await page.reload();
    await expect(page.locator('#cansakhara-login-redirect option:checked')).toHaveText('By Day');

    // Put it back so other specs start from the default.
    await page.selectOption('#cansakhara-login-redirect', { label: 'Home page' });
    await page.click('button[type="submit"]:has-text("Save changes")');
    await page.waitForURL(/settings-updated=true/);
  });

  test('explains the enquiry form picker when SureForms is not installed', async ({ page }) => {
    await page.goto('/wp-admin/options-general.php?page=cansakhara');
    const select = page.locator('#cansakhara-enquiry-form');
    await expect(select).toBeDisabled();
    await expect(page.locator('#cansakhara-enquiry-form-help')).toContainText('SureForms');
  });
});

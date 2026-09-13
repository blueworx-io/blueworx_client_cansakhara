import { test, expect } from '@playwright/test';
import { loginAsAdmin, setSettings } from './helpers/wp.js';

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

  test.describe('when the login destination is changed', () => {
    test.afterEach(async ({ page }) => {
      // Already signed in as admin (the outer beforeEach did it) — no
      // loginAsAdmin() here, since that navigates to /wp-login.php, which
      // stalls for ~32s when the browser is already authenticated.
      await setSettings(page, { loginRedirect: 'Home page' });
    });

    test('saves the login destination and shows it after reload', async ({ page }) => {
      await page.goto('/wp-admin/options-general.php?page=cansakhara');
      await page.selectOption('#cansakhara-login-redirect', { label: 'By Day' });
      await page.click('button[type="submit"]:has-text("Save changes")');
      await page.waitForURL(/settings-updated=true/);
      await expect(page.locator('.bw-notice--success')).toBeVisible();

      await page.reload();
      await expect(page.locator('#cansakhara-login-redirect option:checked')).toHaveText('By Day');
    });
  });

  test('explains the enquiry form picker when SureForms is not installed', async ({ page }) => {
    await page.goto('/wp-admin/options-general.php?page=cansakhara');
    const select = page.locator('#cansakhara-enquiry-form');
    await expect(select).toBeDisabled();
    await expect(page.locator('#cansakhara-enquiry-form-help')).toContainText('SureForms');
  });
});

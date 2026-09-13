import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/wp.js';

const enquire = (page) => page.locator('[data-cansakhara-popup="enquire"]');

test('with no form chosen, the enquire popup offers the email link and no settings hint to guests', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Enquire' }).click();
  await expect(enquire(page).getByRole('link', { name: 'Email us' })).toHaveAttribute(
    'href', 'mailto:reservations@cansakhara.com'
  );
  await expect(enquire(page).locator('[data-cansakhara-enquiry-hint]')).toHaveCount(0);
});

test('an administrator is pointed at the settings screen', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Enquire' }).click();
  const hint = enquire(page).locator('[data-cansakhara-enquiry-hint]');
  await expect(hint).toBeVisible();
  await expect(hint.getByRole('link')).toHaveAttribute('href', /options-general\.php\?page=cansakhara/);
});

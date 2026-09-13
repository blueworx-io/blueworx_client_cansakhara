import { test, expect } from '@playwright/test';
import { GUEST_STATE, loginAsAdmin, loginAsGuest } from './helpers/wp.js';

const PRIVATE = ['/home/', '/by-day/', '/by-night/'];

test.describe('signed out', () => {
  test('the front page is the Welcome page', async ({ page }) => {
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toHaveClass(/page-cansakhara-welcome/);
  });

  for (const path of PRIVATE) {
    test(`${path} sends a signed-out visitor to Welcome`, async ({ page }) => {
      const response = await page.request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(302);
      expect(new URL(response.headers()['location']).pathname).toBe('/');
    });
  }
});

test.describe('signed in as a guest', () => {
  test.use({ storageState: GUEST_STATE });

  for (const path of PRIVATE) {
    test(`${path} opens for a signed-in guest`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response.status()).toBe(200);
      expect(new URL(page.url()).pathname).toBe(path);
      await expect(page.locator('body')).toHaveClass(/cansakhara-page/);
    });
  }

  test('the home page lives at /home/', async ({ page }) => {
    await page.goto('/home/');
    await expect(page.locator('body')).toHaveClass(/page-cansakhara-home/);
  });

  test('a guest sees no WordPress admin bar on the site', async ({ page }) => {
    await page.goto('/home/');
    await expect(page.locator('#wpadminbar')).toHaveCount(0);
  });

  test('the header logo links to the home page, not Welcome', async ({ page }) => {
    await page.goto('/by-day/');
    await expect(page.locator('[data-cansakhara-header] a[aria-label="Can Sakhara home"]')).toHaveAttribute('href', /\/home\/$/);
  });

});

test('logging out from the menu lands on Welcome', async ({ page }) => {
  // Signs in afresh rather than using GUEST_STATE: logging out ends that
  // session on the server, which would sign every later spec out too.
  await loginAsGuest(page);
  await page.goto('/home/');
  await page.locator('[data-cansakhara-menu-open]').click();
  await page.locator('#site-menu').getByRole('link', { name: 'Log out' }).click();
  await page.waitForURL((url) => url.pathname === '/');
  await expect(page.locator('body')).toHaveClass(/page-cansakhara-welcome/);
  // And the private pages are closed again.
  const response = await page.request.get('/home/', { maxRedirects: 0 });
  expect(response.status()).toBe(302);
});

test('an editor still gets the admin bar on the site', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/home/');
  await expect(page.locator('#wpadminbar')).toHaveCount(1);
});

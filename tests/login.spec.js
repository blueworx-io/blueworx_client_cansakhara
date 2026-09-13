import { test, expect } from '@playwright/test';
import { loginAsAdmin, logout, adminEmail, adminPassword, setSettings } from './helpers/wp.js';

const GENERIC = 'Those details didn’t match. Please try again.';

let email;

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);
  email = await adminEmail(page);
  await logout(page);
});

test.afterEach(async ({ page }) => {
  await loginAsAdmin(page);
  await setSettings(page, { loginRedirect: 'Home page' });
});

test('the REST route rejects wrong details with one generic message', async ({ page }) => {
  const response = await page.request.post('/wp-json/cansakhara/v1/login', {
    data: { email, password: 'definitely-wrong' },
  });
  expect(response.status()).toBe(403);
  const body = await response.json();
  expect(body.message).toBe(GENERIC);
  // Never WordPress's own wording, which reveals whether the address exists.
  expect(JSON.stringify(body)).not.toMatch(/incorrect|unknown email|invalid_username|invalid_email/i);
});

test('a wrong password keeps the popup open and shows the message', async ({ page }) => {
  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.fill('#cansakhara-login-email', email);
  await page.fill('#cansakhara-login-password', 'definitely-wrong');
  await page.locator('[data-cansakhara-login-form] button[type="submit"]').click();

  await expect(page.locator('[data-cansakhara-login-error]')).toHaveText(GENERIC);
  await expect(page.locator('[data-cansakhara-popup="login"]')).toHaveAttribute('aria-hidden', 'false');
  expect(new URL(page.url()).pathname).toBe('/welcome/');
  await expect(page.locator('#cansakhara-login-email')).toHaveValue(email);
});

test('the right password sends the guest to the front page when nothing is chosen', async ({ page }) => {
  await loginAsAdmin(page);
  await setSettings(page, { loginRedirect: 'Home page' });
  await logout(page);

  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.fill('#cansakhara-login-email', email);
  await page.fill('#cansakhara-login-password', adminPassword());
  await page.locator('[data-cansakhara-login-form] button[type="submit"]').click();

  await page.waitForURL((url) => url.pathname === '/');
  await expect(page.locator('body')).toHaveClass(/page-cansakhara-home/);
});

test('the right password sends the guest to the chosen page', async ({ page }) => {
  // Three admin round trips (beforeEach, setting 'By Day', resetting to
  // 'Home page') against the slow single-threaded local PHP server outrun
  // the default 30s budget even though every step succeeds. The server log
  // shows an occasional ~30-40s stall with no requests served at all
  // (consistent with the single PHP worker blocking on a WP-cron self-
  // request), not a login failure, so this test gets generous headroom
  // rather than a tighter one that would flake on that stall.
  test.setTimeout(90000);
  await loginAsAdmin(page);
  await setSettings(page, { loginRedirect: 'By Day' });
  await logout(page);

  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.fill('#cansakhara-login-email', email);
  await page.fill('#cansakhara-login-password', adminPassword());
  await page.locator('[data-cansakhara-login-form] button[type="submit"]').click();

  await page.waitForURL(/\/by-day\//);
  await expect(page.locator('body')).toHaveClass(/page-cansakhara-by-day/);
});

test('a signed-in visitor sees the signed-in state instead of the form', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Login' }).click();
  const popup = page.locator('[data-cansakhara-popup="login"]');
  await expect(popup.getByText('You’re signed in.')).toBeVisible();
  await expect(popup.getByRole('link', { name: 'Continue' })).toBeVisible();
  await expect(popup.locator('[data-cansakhara-login-form]')).toHaveCount(0);
});

test('without JavaScript, a failed login redirects back with the popup open and the message', async ({ page }) => {
  const response = await page.request.post('/welcome/', {
    form: { cansakhara_action: 'login', email, password: 'definitely-wrong' },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(302);
  const location = response.headers()['location'];
  expect(location).toContain('cansakhara_login=failed');

  await page.goto(location);
  await expect(page.locator('[data-cansakhara-popup="login"]')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('[data-cansakhara-login-error]')).toHaveText(GENERIC);
});

test('without JavaScript, a successful login redirects to the destination', async ({ page }) => {
  const response = await page.request.post('/welcome/', {
    form: { cansakhara_action: 'login', email, password: adminPassword() },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(302);
  expect(new URL(response.headers()['location']).pathname).toBe('/');
});

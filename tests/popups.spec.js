import { test, expect } from '@playwright/test';

const login = (page) => page.locator('[data-cansakhara-popup="login"]');
const enquire = (page) => page.locator('[data-cansakhara-popup="enquire"]');

test('both popups are present and closed on load', async ({ page }) => {
  await page.goto('/welcome/');
  await expect(login(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(login(page)).not.toBeVisible();
});

test('LOGIN opens the login popup, focuses its heading, Escape closes and returns focus', async ({ page }) => {
  await page.goto('/welcome/');
  const trigger = page.getByRole('button', { name: 'Login' });
  await trigger.click();
  await expect(login(page)).toHaveAttribute('aria-hidden', 'false');
  await expect(login(page).getByRole('heading', { name: 'Login' })).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await page.keyboard.press('Escape');
  await expect(login(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('the close button closes the enquire popup', async ({ page }) => {
  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Enquire' }).click();
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'false');
  await enquire(page).locator('[data-cansakhara-popup-close]').click();
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'true');
});

test('"request private access password" swaps login for enquire', async ({ page }) => {
  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Login' }).click();
  await login(page).getByRole('button', { name: /request private access password/i }).click();
  await expect(login(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'false');
});

test('Tab stays inside an open popup', async ({ page }) => {
  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Login' }).click();
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() =>
      document.activeElement.closest('[data-cansakhara-popup="login"]') !== null
    );
    expect(inside).toBe(true);
  }
});

test('the header Enquire button opens the enquire popup on the home page and locks scroll', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-cansakhara-header]').getByRole('button', { name: 'Enquire' }).click();
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'false');
  const locked = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.site-shell')).overflow
  );
  expect(locked).toBe('hidden');
  await page.keyboard.press('Escape');
  const unlocked = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.site-shell')).overflow
  );
  expect(unlocked).not.toBe('hidden');
});

test('Login in the menu drawer closes the drawer and opens the login popup', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-cansakhara-menu-open]').click();
  await expect(page.locator('#site-menu')).toHaveAttribute('aria-hidden', 'false');
  await page.locator('#site-menu').getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#site-menu')).toHaveAttribute('aria-hidden', 'true');
  await expect(login(page)).toHaveAttribute('aria-hidden', 'false');
});

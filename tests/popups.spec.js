import { test, expect } from '@playwright/test';
import { GUEST_STATE } from './helpers/wp.js';

const login = (page) => page.locator('[data-cansakhara-popup="login"]');
const enquire = (page) => page.locator('[data-cansakhara-popup="enquire"]');

test('both popups are present and closed on load', async ({ page }) => {
  await page.goto('/');
  await expect(login(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(login(page)).not.toBeVisible();
});

test('LOGIN opens the login popup, focuses its heading, Escape closes and returns focus', async ({ page }) => {
  await page.goto('/');
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
  await page.goto('/');
  await page.getByRole('button', { name: 'Enquire' }).click();
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'false');
  await enquire(page).locator('[data-cansakhara-popup-close]').click();
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'true');
});

test('"request private access password" swaps login for enquire', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Login' }).click();
  await login(page).getByRole('button', { name: /request private access password/i }).click();
  await expect(login(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'false');
});

test('Tab stays inside an open popup', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Login' }).click();
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() =>
      document.activeElement.closest('[data-cansakhara-popup="login"]') !== null
    );
    expect(inside).toBe(true);
  }
});

test.describe('on the private home page', () => {
  test.use({ storageState: GUEST_STATE });

  test('the header Enquire button opens the enquire popup and locks scroll', async ({ page }) => {
    await page.goto('/home/');
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

  test('the menu drawer offers Log out, not Login, because everyone here is signed in', async ({ page }) => {
    await page.goto('/home/');
    await page.locator('[data-cansakhara-menu-open]').click();
    await expect(page.locator('#site-menu').getByRole('link', { name: 'Log out' })).toBeVisible();
    await expect(page.locator('#site-menu').getByRole('button', { name: 'Login' })).toHaveCount(0);
  });
});

test('the Mel de Magranetes mark in each popup links to mdmsl.com in a new tab', async ({ page }) => {
  await page.goto('/');
  for (const name of ['login', 'enquire']) {
    const link = page.locator(`[data-cansakhara-popup="${name}"] a:has(img[alt="Mel de Magranetes"])`);
    await expect(link).toHaveAttribute('href', 'https://mdmsl.com/');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
});

test('popup content stays vertically centred on a tall viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Login' }).click();
  const gaps = await page.evaluate(() => {
    const popup = document.querySelector('[data-cansakhara-popup="login"]');
    const heading = popup.querySelector('h2').getBoundingClientRect();
    const mark = popup.querySelector('img[alt="Mel de Magranetes"]').getBoundingClientRect();
    return { top: heading.top, bottom: window.innerHeight - mark.bottom };
  });
  // Centred: the space above the heading matches the space below the mark.
  expect(Math.abs(gaps.top - gaps.bottom)).toBeLessThan(4);
});

test('the enquire popup intro names what the team can help with', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Enquire' }).click();
  await expect(enquire(page).locator('p').first()).toHaveText(
    'Our team will assist you with availability and pricing for rentals, weddings, brand events and film/photoshoots'
  );
});

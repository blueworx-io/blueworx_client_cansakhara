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

test('the drawer opens, traps focus, closes on Escape and returns focus', async ({ page }) => {
  await page.goto('/');
  const trigger = page.locator('[data-cansakhara-menu-open]');
  await trigger.click();

  await expect(page.locator('#site-menu')).toHaveAttribute('aria-hidden', 'false');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-cansakhara-menu-close]')).toBeFocused();

  // The scroll container is locked while the drawer is open.
  const locked = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.site-shell')).overflow
  );
  expect(locked).toBe('hidden');

  await page.keyboard.press('Escape');
  await expect(page.locator('#site-menu')).toHaveAttribute('aria-hidden', 'true');
  await expect(trigger).toBeFocused();
});

test('the header hides on scroll down and returns on scroll up', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('[data-cansakhara-header]');
  await page.evaluate(() => { document.querySelector('.site-shell').scrollTop = 800; });
  await expect(header).toHaveClass(/-translate-y-full/);
  await page.evaluate(() => { document.querySelector('.site-shell').scrollTop = 400; });
  await expect(header).toHaveClass(/translate-y-0/);
});

test('re-activating the still-focusable trigger while the drawer is already open does not leak the scroll lock', async ({ page }) => {
  await page.goto('/');
  const trigger = page.locator('[data-cansakhara-menu-open]');

  const before = await page.evaluate(() => document.querySelector('.site-shell').style.overflow);

  await trigger.click();
  await expect(page.locator('#site-menu')).toHaveAttribute('aria-hidden', 'false');

  // The trigger stays focusable while the drawer is open (faithful to the
  // source), even though the drawer visually covers it — so a mouse click
  // can't reach it, but a keyboard user can Shift+Tab back to it and press
  // Enter. Re-opening an already-open drawer must be a no-op.
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#site-menu')).toHaveAttribute('aria-hidden', 'false');

  await page.keyboard.press('Escape');
  await expect(page.locator('#site-menu')).toHaveAttribute('aria-hidden', 'true');

  const after = await page.evaluate(() => document.querySelector('.site-shell').style.overflow);
  expect(after).toBe(before);
});

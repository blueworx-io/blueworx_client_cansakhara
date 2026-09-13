import { test, expect } from '@playwright/test';
import { GUEST_STATE } from './helpers/wp.js';

// These pages are private: browse them as the signed-in guest.
test.use({ storageState: GUEST_STATE });

test('the header renders with its menu trigger and enquire button', async ({ page }) => {
  await page.goto('/home/');
  await expect(page.locator('[data-cansakhara-header]')).toBeVisible();
  await expect(page.locator('[data-cansakhara-menu-open]')).toHaveAttribute('aria-expanded', 'false');
  await expect(
    page.locator('[data-cansakhara-header]').getByRole('button', { name: 'Enquire' })
  ).toHaveAttribute('data-cansakhara-popup-open', 'enquire');
});

test('the drawer is present and closed on load', async ({ page }) => {
  await page.goto('/home/');
  await expect(page.locator('#site-menu')).toHaveAttribute('aria-hidden', 'true');
});

test('the by-day header takes the day panel colour', async ({ page }) => {
  await page.goto('/by-day/');
  await expect(page.locator('[data-cansakhara-header]')).toHaveAttribute(
    'data-cansakhara-solid-color', '#ac9a8c'
  );
});

test('the footer renders its outbound links', async ({ page }) => {
  await page.goto('/home/');
  await expect(page.locator('footer a[href="https://mdmsl.com/"]')).toHaveCount(1);
});

test('the side nav container is present', async ({ page }) => {
  await page.goto('/home/');
  await expect(page.locator('[data-cansakhara-side-nav]')).toHaveCount(1);
});

test('the drawer opens, traps focus, closes on Escape and returns focus', async ({ page }) => {
  await page.goto('/home/');
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
  await page.goto('/home/');
  const header = page.locator('[data-cansakhara-header]');
  // Instant, not the shell's smooth scroll: otherwise the second scroll can
  // start while the first is still animating upward, and the header — which
  // only compares consecutive positions — never sees a scroll up.
  await page.evaluate(() => { document.querySelector('.site-shell').scrollTo({ top: 800, behavior: 'instant' }); });
  await expect(header).toHaveClass(/-translate-y-full/);
  await page.evaluate(() => { document.querySelector('.site-shell').scrollTo({ top: 400, behavior: 'instant' }); });
  await expect(header).toHaveClass(/translate-y-0/);
});

test('re-activating the still-focusable trigger while the drawer is already open does not leak the scroll lock', async ({ page }) => {
  await page.goto('/home/');
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

test('the side nav builds one dot per section and rings the one in view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/home/');
  const sections = await page.locator('.site-shell > section').count();
  expect(sections).toBeGreaterThan(1);
  await expect(page.locator('[data-cansakhara-side-nav] [data-cansakhara-dot]')).toHaveCount(sections);

  const activeDotIndex = () => page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('[data-cansakhara-side-nav] [data-cansakhara-dot]'));
    return dots.findIndex((dot) => dot.getAttribute('data-active') === 'true');
  });

  // Near the top of the page, exactly one dot is active — read which.
  await expect(page.locator('[data-cansakhara-side-nav] [data-cansakhara-dot][data-active="true"]')).toHaveCount(1);
  const topIndex = await activeDotIndex();

  // Scrolled well down, still exactly one active dot, but a later one — this
  // is what a hard-coded "dot 0 is always active" implementation would fail.
  // toHaveCount(1) alone isn't enough of a wait here: it's already true
  // (dot 0 still active) the instant scrollTop is set, before the scroll
  // handler has run — so poll for the index itself moving past topIndex.
  await page.evaluate(() => { document.querySelector('.site-shell').scrollTop = 2000; });
  await page.waitForFunction((initial) => {
    const dots = Array.from(document.querySelectorAll('[data-cansakhara-side-nav] [data-cansakhara-dot]'));
    const active = dots.filter((dot) => dot.getAttribute('data-active') === 'true');
    return active.length === 1 && dots.indexOf(active[0]) > initial;
  }, topIndex);

  await expect(page.locator('[data-cansakhara-side-nav] [data-cansakhara-dot][data-active="true"]')).toHaveCount(1);
  const scrolledIndex = await activeDotIndex();
  expect(scrolledIndex).toBeGreaterThan(topIndex);
});

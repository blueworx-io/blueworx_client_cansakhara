import { test, expect } from '@playwright/test';
import { GUEST_STATE } from './helpers/wp.js';

test.use({ storageState: GUEST_STATE });

const cssVar = (page, name) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

test('typography tokens are printed as CSS variables with the Figma desktop defaults', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/home/');
  expect(await cssVar(page, '--cs-body-size')).toBe('16px');
  expect(await cssVar(page, '--cs-body-weight')).toBe('300');
  expect(await cssVar(page, '--cs-h1-ls')).toBe('9.6px');
  expect(await cssVar(page, '--cs-h4-lh')).toBe('1.8');
});

test('mobile values take over below 796px', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 900 });
  await page.goto('/home/');
  expect(await cssVar(page, '--cs-body-size')).toBe('11px');
  expect(await cssVar(page, '--cs-h3-size')).toBe('12px');
  expect(await cssVar(page, '--cs-h2-size')).toBe('24px');
});

test('palette colours are printed as CSS variables', async ({ page }) => {
  await page.goto('/home/');
  expect(await cssVar(page, '--cs-color-home-2')).toBe('#42081a');
  expect(await cssVar(page, '--cs-color-night-1')).toBe('#031927');
});

test('the theme CSS is printed only on owned pages', async ({ page }) => {
  await page.goto('/?p=1'); // Hello World, a theme-rendered page
  const inline = await page.locator('#cansakhara-public-inline-css').count();
  expect(inline).toBe(0);
});

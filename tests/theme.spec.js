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

// Computed type of the first element matching a selector, with the first
// font-family stripped of quotes so it compares against the kit's names.
const fontOf = (page, selector) =>
  page.locator(selector).first().evaluate((el) => {
    const c = getComputedStyle(el);
    return {
      family: c.fontFamily.split(',')[0].replace(/"/g, ''),
      size: c.fontSize,
      weight: c.fontWeight,
      ls: c.letterSpacing,
      lh: c.lineHeight,
    };
  });

test('home page type follows the roles at desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/home/');
  await page.evaluate(() => document.fonts.ready);
  expect(await fontOf(page, '.section-eyebrow')).toMatchObject({ family: 'neulis-sans', size: '21px', weight: '400', ls: '4.2px' });
  expect(await fontOf(page, '.section-title')).toMatchObject({ size: '48px', weight: '300', ls: '9.6px' });
  expect(await fontOf(page, '.section-subtitle')).toMatchObject({ family: 'source-serif-4-variable', size: '28px', weight: '300', ls: '2.8px' });
  expect(await fontOf(page, '.welcome-copy p')).toMatchObject({ family: 'source-sans-3', size: '16px', weight: '300', ls: '0.8px' });
  expect(await fontOf(page, '.welcome-lockup-line.cs-hairline')).toMatchObject({ family: 'neulis-sans-hairline', weight: '100' });
  expect(await fontOf(page, '.outline-button')).toMatchObject({ family: 'neulis-sans', size: '14px', weight: '400', ls: '5.6px' });
});

test('home page type follows the roles at mobile', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 900 });
  await page.goto('/home/');
  await page.evaluate(() => document.fonts.ready);
  expect(await fontOf(page, '.section-eyebrow')).toMatchObject({ size: '12px', ls: '2.4px' });
  expect(await fontOf(page, '.welcome-heading .section-title')).toMatchObject({ size: '30px', ls: '6px' });
  expect(await fontOf(page, '.experience-heading .section-title')).toMatchObject({ size: '24px', ls: '4.8px' });
  expect(await fontOf(page, '.section-subtitle')).toMatchObject({ size: '13px', ls: '1.3px' });
  expect(await fontOf(page, '.welcome-copy p')).toMatchObject({ size: '11px', ls: '0.55px' });
  expect(await fontOf(page, '.outline-button')).toMatchObject({ size: '10px', ls: '4px' });
});

test('colours come from the palette variables', async ({ page }) => {
  await page.goto('/home/');
  const color = await page.locator('.section-heading').first().evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe('rgb(66, 8, 26)');
  const shell = await page.locator('main').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(shell).toBe('rgb(255, 255, 255)');
  // The By Day card paints with the day-1 swatch (#ac9a8c) through Tailwind's
  // bg-day-1 utility, which reads the palette variable rather than a hex.
  const card = await page.locator('.discover-card').first().evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(card).toBe('rgb(172, 154, 140)');
  // Overriding the variable recolours the card, proving the utility reads the
  // palette variable rather than carrying its own hex.
  await page.evaluate(() => document.documentElement.style.setProperty('--cs-color-day-1', '#ff0000'));
  const recoloured = await page.locator('.discover-card').first().evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(recoloured).toBe('rgb(255, 0, 0)');
});

for (const route of ['/by-day/', '/by-night/']) {
  test(`${route} type follows the roles at both sizes`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    expect(await fontOf(page, 'main h1')).toMatchObject({ family: 'neulis-sans', size: '48px', ls: '9.6px', weight: '300' });
    expect(await fontOf(page, '[data-anim="block-heading"] .cs-hairline')).toMatchObject({ family: 'neulis-sans-hairline', weight: '100' });
    expect(await fontOf(page, '[data-anim="block-subtitle"]')).toMatchObject({ family: 'source-serif-4-variable', size: '28px', ls: '2.8px' });
    expect(await fontOf(page, '[data-anim="block-copy"] p')).toMatchObject({ family: 'source-sans-3', size: '16px', weight: '300', ls: '0.8px' });
    expect(await fontOf(page, 'footer p')).toMatchObject({ family: 'neulis-sans', size: '14px', ls: '2.8px' });
    await page.setViewportSize({ width: 402, height: 900 });
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    expect(await fontOf(page, 'main h1')).toMatchObject({ size: '30px', ls: '6px' });
    expect(await fontOf(page, '[data-anim="block-subtitle"]')).toMatchObject({ size: '13px', ls: '1.3px' });
    expect(await fontOf(page, '[data-anim="block-copy"] p')).toMatchObject({ size: '11px', ls: '0.55px' });
    expect(await fontOf(page, 'footer p')).toMatchObject({ size: '8px', ls: '1.6px' });
  });
}

test('header MENU and popup links use the label role', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/home/');
  await page.evaluate(() => document.fonts.ready);
  expect(await fontOf(page, '[data-cansakhara-menu-open]')).toMatchObject({ family: 'neulis-sans', size: '14px', ls: '5.6px' });
  expect(await fontOf(page, '[data-cansakhara-header] [data-cansakhara-popup-open]')).toMatchObject({ family: 'neulis-sans', size: '14px', ls: '5.6px' });
  expect(await fontOf(page, '#cansakhara-popup-login-title')).toMatchObject({ family: 'neulis-sans', size: '48px', ls: '9.6px', weight: '300' });
  await page.setViewportSize({ width: 402, height: 900 });
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  expect(await fontOf(page, '[data-cansakhara-menu-open]')).toMatchObject({ size: '10px', ls: '4px' });
  expect(await fontOf(page, '#cansakhara-popup-login-title')).toMatchObject({ size: '30px', ls: '6px' });
});

test('the footer and popups paint with palette swatches', async ({ page }) => {
  await page.goto('/by-day/');
  // day-2 (#918074) via bg-day-2, no inline style.
  const footer = page.locator('footer');
  expect(await footer.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(145, 128, 116)');
  expect(await footer.getAttribute('style')).toBeNull();
  // home-5 (#5b0a00) on the popup panel.
  const popup = await page.locator('[data-cansakhara-popup="login"]').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(popup).toBe('rgb(91, 10, 0)');
  // Overriding the swatch recolours the footer.
  await page.evaluate(() => document.documentElement.style.setProperty('--cs-color-day-2', '#00ff00'));
  expect(await footer.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(0, 255, 0)');
});

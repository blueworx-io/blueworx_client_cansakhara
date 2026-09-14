import { test, expect } from '@playwright/test';
import { GUEST_STATE } from './helpers/wp.js';

// These pages are private: browse them as the signed-in guest.
test.use({ storageState: GUEST_STATE });

test('the plugin stylesheet loads and no theme stylesheet does', async ({ page }) => {
  await page.goto('/home/');
  const hrefs = await page.locator('link[rel="stylesheet"]').evaluateAll(
    (links) => links.map((l) => l.getAttribute('href'))
  );
  expect(hrefs.some((h) => h.includes('blueworx-client-cansakhara/assets/css/public.css'))).toBe(true);
  expect(hrefs.some((h) => h.includes('/themes/'))).toBe(false);
});

test('the Adobe Fonts kit stylesheet loads on owned pages', async ({ page }) => {
  await page.goto('/home/');
  const hrefs = await page.locator('link[rel="stylesheet"]').evaluateAll(
    (links) => links.map((l) => l.getAttribute('href'))
  );
  expect(hrefs.some((h) => h.includes('use.typekit.net/qij3qvf.css'))).toBe(true);
});

test('the fonts come from the Adobe kit: Neulis Sans, Source Sans 3, Source Serif 4', async ({ page }) => {
  await page.goto('/home/');
  await page.evaluate(() => document.fonts.ready);
  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return ['--font-display', '--font-body', '--font-serif'].map((t) => root.getPropertyValue(t).trim());
  });
  expect(tokens[0]).toContain('neulis-sans');
  expect(tokens[1]).toContain('source-sans-3');
  expect(tokens[2]).toContain('source-serif-4-variable');
});

test('the plugin stylesheet no longer declares its own font files', async ({ page }) => {
  await page.goto('/home/');
  const localFaces = await page.evaluate(() =>
    [...document.styleSheets]
      .filter((s) => s.href && s.href.includes('assets/css/public.css'))
      .flatMap((s) => [...s.cssRules])
      .filter((r) => r instanceof CSSFontFaceRule)
      .map((r) => r.style.getPropertyValue('font-family'))
  );
  expect(localFaces).toEqual([]);
});

// A theme's own skip link (WordPress's standard `screen-reader-text` class)
// must stay hidden even though the theme's stylesheet is swept off the page.
test('a theme-printed screen-reader-text skip link is not visible', async ({ page }) => {
  await page.goto('/home/');
  await page.evaluate(() => {
    const a = document.createElement('a');
    a.href = '#content';
    a.className = 'skip-link screen-reader-text';
    a.id = 'theme-skip-link';
    a.textContent = 'Skip to the content';
    document.body.prepend(a);
  });
  const link = page.locator('#theme-skip-link');
  const box = await link.boundingBox();
  expect(box.width).toBeLessThanOrEqual(1);
  expect(box.height).toBeLessThanOrEqual(1);
  expect(await link.evaluate((el) => getComputedStyle(el).position)).toBe('absolute');
});

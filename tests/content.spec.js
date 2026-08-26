import { test, expect } from '@playwright/test';

test('the home page renders its hero and feature figures', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-shell')).toBeVisible();
  await expect(page.getByText('6061')).toBeVisible();
  await expect(page.locator('.features-grid').getByText('Bedrooms')).toBeVisible();
  await expect(page.locator('[data-cansakhara-carousel="experience"]')).toHaveCount(1);
});

test('no image on the home page is broken', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const broken = await page.locator('img').evaluateAll((imgs) =>
    imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src)
  );
  expect(broken).toEqual([]);
});

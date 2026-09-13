import { test, expect } from '@playwright/test';
import { GUEST_STATE } from './helpers/wp.js';

// These pages are private: browse them as the signed-in guest.
test.use({ storageState: GUEST_STATE });

test('the home page renders its hero and feature figures', async ({ page }) => {
  await page.goto('/home/');
  await expect(page.locator('.site-shell')).toBeVisible();
  // The feature figures reveal on scroll (GSAP ScrollTrigger); scroll them
  // into the in-page scroller's view so the reveal fires before asserting.
  await page.locator('.features-grid').scrollIntoViewIfNeeded();
  await expect(page.getByText('6061')).toBeVisible();
  await expect(page.locator('.features-grid').getByText('Bedrooms')).toBeVisible();
  await expect(page.locator('[data-cansakhara-carousel="experience"]')).toHaveCount(1);
});

test('no image on the home page is broken', async ({ page }) => {
  await page.goto('/home/');
  await page.evaluate(() => document.fonts.ready);
  const broken = await page.locator('img').evaluateAll((imgs) =>
    imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src)
  );
  expect(broken).toEqual([]);
});

for (const path of ['/by-day/', '/by-night/']) {
  test(`${path} renders its enquire call to action and unbroken images`, async ({ page }) => {
    await page.goto(path);
    // Scoped to <main>: the header now also renders the Enquire popup
    // (templates/parts/popups.php) outside <main>, whose closed fallback
    // mailto link shares this href and would otherwise win an unscoped
    // .first(). The in-page CTA itself reveals on scroll (GSAP
    // ScrollTrigger), same as the features-grid figures above.
    const cta = page.locator('main a[href="mailto:reservations@cansakhara.com"]');
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeVisible();
    const broken = await page.locator('img').evaluateAll((imgs) =>
      imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src)
    );
    expect(broken).toEqual([]);
  });
}

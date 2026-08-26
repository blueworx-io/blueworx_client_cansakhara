import { test, expect } from '@playwright/test';

// The Experience carousel has no next/previous control in this design (see
// templates/parts/experience-carousel.php and task-9's report) — it advances
// only by pointer drag and by ArrowLeft/ArrowRight on the focused viewport.
// These tests drive it the same way a real visitor or keyboard user would.

test('keyboard advances the experience carousel and mirrors the index on the root', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('[data-cansakhara-carousel="experience"]');
  const viewport = root.locator('[role="group"]');
  const slideCount = await root.locator('[data-cansakhara-slide]').count();
  expect(slideCount).toBeGreaterThan(1);

  const before = await root.getAttribute('data-cansakhara-index');
  expect(before).not.toBeNull();

  await viewport.focus();
  await viewport.press('ArrowRight');
  await page.waitForTimeout(700);

  const after = await root.getAttribute('data-cansakhara-index');
  expect(after).not.toBe(before);
});

test('dragging the experience carousel advances it and does not lock up afterwards', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('[data-cansakhara-carousel="experience"]');
  const viewport = root.locator('[role="group"]');

  // The page scrolls inside .site-shell, not the window, and this section is
  // below the fold — bring it into view before computing coordinates, since
  // boundingBox() does not scroll for you the way locator actions do.
  await viewport.scrollIntoViewIfNeeded();
  const before = await root.getAttribute('data-cansakhara-index');

  const box = await viewport.boundingBox();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();
  // Let the snap transition settle (DURATION_MS is 650ms in the source).
  await page.waitForTimeout(800);

  const settled = await root.getAttribute('data-cansakhara-index');
  expect(settled).not.toBe(before);

  // The drag-snap lockup regression (fixed in a14c1dc): after a drag settles,
  // a further interaction must still be able to move the carousel.
  await viewport.focus();
  await viewport.press('ArrowRight');
  await page.waitForTimeout(700);
  const afterFurtherInteraction = await root.getAttribute('data-cansakhara-index');
  expect(afterFurtherInteraction).not.toBe(settled);
});

test('the experience carousel loop wraps rather than stalling at the end', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('[data-cansakhara-carousel="experience"]');
  const viewport = root.locator('[role="group"]');
  const slideCount = await root.locator('[data-cansakhara-slide]').count();
  // The clone list is [last real slide, ...real slides, clone of the first
  // two real slides] — 3 clones bracketing n real slides.
  const n = slideCount - 3;

  await viewport.focus();
  const start = await root.getAttribute('data-cansakhara-index');
  expect(start).not.toBeNull();

  let previous = start;
  for (let i = 0; i < n; i += 1) {
    await viewport.press('ArrowRight');
    await page.waitForTimeout(700);
    const current = await root.getAttribute('data-cansakhara-index');
    // Every step must actually move the carousel — a frozen index would pass
    // a well-formedness check (e.g. /^\d+$/) without ever proving progress.
    expect(current).not.toBe(previous);
    previous = current;
  }

  // A full lap (n steps) must land back on the slide it started from,
  // proving the loop wraps rather than stalling on a clone or running away
  // without ever closing the loop.
  expect(previous).toBe(start);
});

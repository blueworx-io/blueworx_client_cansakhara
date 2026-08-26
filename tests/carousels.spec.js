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

// The gallery peek strip (By Day / By Night) has no next/previous control
// either — see templates/parts/gallery-peek-strip.php. It advances only by
// pointer drag and ArrowLeft/ArrowRight on the focused viewport, plus its
// own 4s autoplay loop. The whole image list is tripled (not 3 asymmetric
// clones like the Experience carousel), and `index` starts at `n`, the
// first slide of the middle copy.

test('dragging the gallery peek strip advances it and does not lock up afterwards', async ({ browser }) => {
  // The desktop gallery-viewport is a fixed 1440px — wider than the default
  // test viewport — so widen the window first or the drag coordinates land
  // outside the visible page and never reach the element. At this width the
  // gallery switcher (Task 17) shows the scroll row instead of the peek
  // strip once motion is allowed, so this test — which specifically drives
  // the peek strip's own drag/snap logic — opts into reduced motion to keep
  // the peek strip the one that's mounted, the same way tests/motion.spec.js
  // forces it for the reduced-motion hero test.
  const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 1600, height: 900 } });
  await page.goto('http://127.0.0.1:8881/by-day/');
  const root = page.locator('[data-cansakhara-carousel="peek"]').first();
  await expect(root).toBeVisible();
  await root.scrollIntoViewIfNeeded();

  const before = await root.getAttribute('data-cansakhara-index');
  expect(before).not.toBeNull();

  const box = await root.boundingBox();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();
  // Let the snap transition settle (DURATION_MS is 650ms in the source).
  await page.waitForTimeout(800);

  const settled = await root.getAttribute('data-cansakhara-index');
  expect(settled).not.toBe(before);

  // After a drag settles, a further interaction must still be able to move
  // the carousel (the drag-snap lockup regression guarded on the Experience
  // carousel — this port must not reintroduce the equivalent for this
  // carousel's own settling guard).
  await root.focus();
  await root.press('ArrowRight');
  await page.waitForTimeout(700);
  const afterFurtherInteraction = await root.getAttribute('data-cansakhara-index');
  expect(afterFurtherInteraction).not.toBe(settled);
  await page.close();
});

test('the gallery peek strip loop wraps rather than stalling at the end', async ({ browser }) => {
  // Default viewport (1280px) is already >=796px and motion is allowed by
  // default in this environment, so — same reasoning as above — force
  // reduced motion so the switcher keeps the peek strip mounted.
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:8881/by-day/');
  const root = page.locator('[data-cansakhara-carousel="peek"]').first();
  const slideCount = await root.locator('[data-cansakhara-slide]').count();
  // The part triples the whole image list, so the real slide count is a
  // third of the rendered clone list, and `index` starts at n.
  const n = slideCount / 3;

  await root.focus();
  const start = await root.getAttribute('data-cansakhara-index');
  expect(start).not.toBeNull();

  let previous = start;
  for (let i = 0; i < n; i += 1) {
    await root.press('ArrowRight');
    await page.waitForTimeout(750);
    const current = await root.getAttribute('data-cansakhara-index');
    expect(current).not.toBe(previous);
    previous = current;
  }

  // A full lap (n steps) must land back on the slide it started from,
  // proving the loop wraps into the middle copy rather than stalling or
  // running off the tripled list.
  expect(previous).toBe(start);
  await page.close();
});

// The gallery scroll row (By Day / By Night, desktop with motion allowed) —
// see templates/parts/gallery-scroll-row.php and
// src/components/GalleryScrollRow.tsx. Unlike the two drag carousels above,
// it has no index/state machine: GSAP scrubs the track horizontally off the
// page's own scroll position while native CSS `position: sticky` (not
// ScrollTrigger's pin) holds the white band still. `GalleryCarousel.tsx`
// mounted this exactly on `(min-width: 796px)` with motion allowed and
// mounted `GalleryPeekStrip` otherwise, always starting from the peek strip
// on first paint (SSR state `false`) — the switcher tests below cover that
// the vanilla-JS port reproduces the same either/or, not a permanent both.

test('the gallery scroll row moves horizontally as the page scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/by-day/');
  const track = page.locator('[data-cansakhara-carousel="scroll-row"] [data-cansakhara-track]');
  await track.scrollIntoViewIfNeeded();
  const before = await track.evaluate((el) => getComputedStyle(el).transform);
  await page.evaluate(() => {
    document.querySelector('.site-shell').scrollTop += 600;
  });
  await page.waitForTimeout(400);
  const after = await track.evaluate((el) => getComputedStyle(el).transform);
  expect(after).not.toBe(before);
});

test('at desktop width with motion allowed, the scroll row is shown and the peek strip is not', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/by-day/');
  const scrollRow = page.locator('[data-cansakhara-carousel="scroll-row"]');
  const peek = page.locator('[data-cansakhara-carousel="peek"]').first();
  await expect(scrollRow).toBeVisible();
  await expect(peek).toBeHidden();
});

test('at mobile width, the peek strip is shown and the scroll row is not', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/by-day/');
  const scrollRow = page.locator('[data-cansakhara-carousel="scroll-row"]');
  const peek = page.locator('[data-cansakhara-carousel="peek"]').first();
  await expect(peek).toBeVisible();
  await expect(scrollRow).toBeHidden();
});

test('under reduced motion, the peek strip is shown even at desktop width', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 1600, height: 900 } });
  await page.goto('http://127.0.0.1:8881/by-day/');
  const scrollRow = page.locator('[data-cansakhara-carousel="scroll-row"]');
  const peek = page.locator('[data-cansakhara-carousel="peek"]').first();
  await expect(peek).toBeVisible();
  await expect(scrollRow).toBeHidden();
  await page.close();
});

test('the switcher re-evaluates when reduced motion is toggled after load', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/by-day/');
  const scrollRow = page.locator('[data-cansakhara-carousel="scroll-row"]');
  const peek = page.locator('[data-cansakhara-carousel="peek"]').first();
  await expect(scrollRow).toBeVisible();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(peek).toBeVisible();
  await expect(scrollRow).toBeHidden();
});

test('the peek strip autoplay does not run while the scroll row is the one shown', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/by-day/');
  const peek = page.locator('[data-cansakhara-carousel="peek"]').first();
  await expect(peek).toBeHidden();

  const before = await peek.getAttribute('data-cansakhara-index');
  // AUTOPLAY_MS is 4000ms in gallery-peek-strip.js — wait past a full dwell.
  await page.waitForTimeout(4500);
  const after = await peek.getAttribute('data-cansakhara-index');
  expect(after).toBe(before);
});

# Theme Tokens and Theme Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put every typography role and palette colour behind an editable token with Figma defaults, add a Theme tab to edit them, fix the footer padding and mobile spacing, and retire the Next.js screenshot gate.

**Architecture:** `includes/theme.php` owns one defaults array and turns the saved `cansakhara_theme` option into CSS custom properties printed inline after `public.css`. `app.css` defines one class per role (`.cs-h1` … `.cs-label`) that reads those properties; templates use the role classes and swatch utilities instead of hardcoded values. The Theme tab is a second tab on the existing settings screen, built from the blueworx-admin-design system.

**Tech Stack:** WordPress plugin (PHP 7.4+, Settings API), Tailwind v4 (`@tailwindcss/cli`), Playwright against the local harness, phpcs (WPCS).

**Spec:** `docs/superpowers/specs/2026-09-14-theme-tokens-design.md`

## Global Constraints

- Version becomes `0.5.0` in `blueworx-client-cansakhara.php` (header + `CANSAKHARA_VERSION`), `package.json`, `readme.txt` (Stable tag + changelog) and `CHANGELOG.md` — CI fails if they disagree.
- Admin markup only from the blueworx-admin-design system (`bw-*` classes). Invoke the skill ("Using the blueworx-admin-design skill for the Theme tab") before writing Task 6. A Write/Edit hook refuses non-design-system admin markup.
- Never edit `.claude/skills/blueworx-admin-design/` or `assets/blueworx-admin-design.css` — CI compares them to the foundation.
- No new npm dependencies (`approved-deps.json`).
- Any `class` attribute containing the word `wrap` is treated as admin markup by CI — use `text-balance`, never `[text-wrap:…]`.
- Run lint once at the end, present findings, don't loop.
- Harness: `node ../bluegroup_core_foundation/scripts/wp-test-env.mjs up --plugin .` then
  `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test <spec> --workers=1`.
  Never call `loginAsAdmin()` on an already signed-in page (stalls ~32s).
- Rebuild CSS after every `app.css` or template class change: `npm run build` (Tailwind scans `templates/`, `includes/`, `assets/js/src`).
- Commit after each task with a one-line plain message, ending with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Work on branch `theme-tokens` off `main`.

## Figma reference values

File key `zKsmL3KCTPUaunvBaVY1Eq`. Use `get_design_context` (load the `figma:figma-design-to-code` skill first) on these nodes when a value is needed:

| What | Desktop node | Mobile node |
| --- | --- | --- |
| Home intro (WELCOME / lockup / subtitle) | 5:871 | 5:419 |
| Home intro paragraph + Enquire button | 5:881 | 5:426 |
| Home stats (FEATURING) | 5:960 | 5:430 |
| Home experience heading | 5:888 | 5:472 |
| Home footer | 5:994 | 5:512 |
| Home whole frame | 5:870 (1440×6423) | 5:386 (402×4554) |
| By Day whole frame | 5:1280 (1440×4948) | 5:583 (402×3308) |
| By Night whole frame | 5:1445 (1440×4999) | 5:717 (402×3332) |

Palette (from the style guide 5:29): Home `#FFFFFF #42081A #422833 #F2EBE2 #5B0A00 #BF2C08`; By Day `#AC9A8C #918074 #5F5146`; By Night `#031927 #000E16 #33545A`.

---

### Task 1: Retire the Next.js screenshot gate

**Files:**
- Delete: `tests/fidelity.spec.js`, `tests/baselines/` (6 PNGs)
- Modify: `playwright.config.js` (remove `snapshotPathTemplate` and `updateSnapshots` and their comments)

- [ ] **Step 1: Confirm the gate exists and lists**

Run: `npx playwright test --list 2>&1 | grep -c fidelity`
Expected: `6`

- [ ] **Step 2: Delete the spec and baselines**

```bash
git rm -q tests/fidelity.spec.js tests/baselines/*.png
```

- [ ] **Step 3: Remove the snapshot settings from playwright.config.js**

Delete everything from the comment beginning `// Only tests/fidelity.spec.js calls toMatchSnapshot` through `updateSnapshots: 'none',` (both the `snapshotPathTemplate` and `updateSnapshots` lines and the comments above them). The `use:` block stays.

- [ ] **Step 4: Verify**

Run: `npx playwright test --list 2>&1 | grep -c fidelity`
Expected: `0`
Run: `npx playwright test --list 2>&1 | tail -1`
Expected: `Total: 73 tests in 12 files` (count may differ by one or two — must not error).

- [ ] **Step 5: Commit**

```bash
git add -A tests playwright.config.js
git commit -m "Retire the Next.js screenshot gate — Figma is the reference now"
```

---

### Task 2: Footer bottom padding

**Files:**
- Modify: `assets/css/src/app.css` (the desktop `@media (min-width: 796px)` block around lines 846–870: `.site-footer`, `.footer-brands`, `.footer-bottom`)
- Test: `tests/chrome.spec.js`

**Interfaces:**
- Produces nothing new; the footer keeps the classes in `templates/parts/footer.php` (`pt-[144px]`, `md:gap-20`, `md:pb-[50px]`).

- [ ] **Step 1: Write the failing test** (append to `tests/chrome.spec.js`)

```js
test('the footer keeps 50px below the copyright row on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/home/');
  const gap = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    const copy = [...footer.querySelectorAll('p')].find((p) => /2026/.test(p.textContent));
    return Math.round(footer.getBoundingClientRect().bottom - copy.getBoundingClientRect().bottom);
  });
  expect(gap).toBe(50);
});
```

Check the top of `tests/chrome.spec.js`: it must import `GUEST_STATE` and `test.use({ storageState: GUEST_STATE })` so `/home/` is reachable. Add both if missing (copy from `tests/assets.spec.js`).

- [ ] **Step 2: Run it — expect failure**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/chrome.spec.js -g "50px below" --workers=1`
Expected: FAIL, `Received: 2`

- [ ] **Step 3: Remove the override**

In `assets/css/src/app.css`, inside the desktop media query, delete these three rules and their comments entirely:

```css
  .site-footer {
    height: 858px;
    padding-top: 164px;
    background: #422833;
  }
  .footer-brands { … }
  .footer-bottom { … }
```

(`.footer-brands` and `.footer-bottom` match nothing in the templates.) Keep `.site-footer a:hover { opacity: 0.65; }`.

- [ ] **Step 4: Rebuild and run — expect pass**

Run: `npm run build && PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/chrome.spec.js --workers=1`
Expected: all pass. Also confirm the footer is still 858px tall at 1440 (Figma 5:994: 144 padding + 486 logo block + 80 gap + 1 divider + 80 gap + 17 text row + 50 padding = 858). The template already carries those values; the override was adding 20px of padding on top and then clipping the total back to 858, which is what squeezed the bottom padding out.

- [ ] **Step 5: Commit**

```bash
git add assets/css/src/app.css assets/css/public.css templates/parts/footer.php tests/chrome.spec.js
git commit -m "Give the footer its 50px bottom padding back on desktop"
```

---

### Task 3: Theme token model and front-end CSS variables

**Files:**
- Create: `includes/theme.php`
- Modify: `blueworx-client-cansakhara.php` (add `require_once CANSAKHARA_DIR . 'includes/theme.php';` after the `settings.php` require)
- Modify: `includes/assets.php` (call `wp_add_inline_style` after enqueuing `cansakhara-public`)
- Test: `tests/theme.spec.js` (new)

**Interfaces (produces):**
- `cansakhara_theme_roles(): array<string, array{label:string, family:string, italic:bool, uses:string}>` — keys `h1,h2,h3,h4,body,small,label`.
- `cansakhara_theme_colors(): array<string, array{label:string, group:string, uses:string}>` — keys `home-1 … home-6, day-1 … day-3, night-1 … night-3`.
- `cansakhara_theme_defaults(): array` — flat `token => value`, e.g. `'h1.desktop.size' => 48`, `'h1.mobile.ls' => 6`, `'color.home-2' => '#42081a'`. Sub-keys per role per breakpoint: `size` (px int), `lh` (float), `ls` (px float), `weight` (int).
- `cansakhara_theme(): array` — defaults merged with the saved option.
- `cansakhara_sanitize_theme( $input ): array` — returns only tokens that differ from defaults and are valid.
- `cansakhara_theme_css(): string` — the inline CSS.
- Option name constant `CANSAKHARA_THEME_OPTION = 'cansakhara_theme'`, settings group `cansakhara_theme_group`.
- CSS variable names: `--cs-{role}-size|lh|ls|weight` and `--cs-color-{name}`.

- [ ] **Step 1: Write the failing tests** (`tests/theme.spec.js`)

```js
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
```

- [ ] **Step 2: Run — expect failure**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/theme.spec.js --workers=1`
Expected: first three FAIL with `Received: ""`; the fourth passes (fine — it guards a regression).

- [ ] **Step 3: Create `includes/theme.php`**

```php
<?php
/**
 * Theme tokens: the typography roles and palette the site is built from.
 *
 * One defaults array feeds the Theme tab, the sanitiser and the CSS printed
 * on the front end, so there is no second copy to drift.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const CANSAKHARA_THEME_OPTION = 'cansakhara_theme';

/**
 * Typography roles. Family is fixed per role; the editable parts are size,
 * line height, letter-spacing and weight, for desktop and mobile.
 *
 * @return array<string, array{label: string, family: string, italic: bool, uses: string}>
 */
function cansakhara_theme_roles() {
	return array(
		'h1'    => array( 'label' => 'H1', 'family' => 'neulis-sans', 'italic' => false, 'uses' => __( 'Page intro lockup and By Day / By Night titles', 'blueworx-client-cansakhara' ) ),
		'h2'    => array( 'label' => 'H2', 'family' => 'neulis-sans', 'italic' => false, 'uses' => __( 'Section titles and card titles', 'blueworx-client-cansakhara' ) ),
		'h3'    => array( 'label' => 'H3', 'family' => 'neulis-sans', 'italic' => false, 'uses' => __( 'Eyebrows: WELCOME, EXPERIENCE, DISCOVER, FEATURING', 'blueworx-client-cansakhara' ) ),
		'h4'    => array( 'label' => 'H4', 'family' => 'source-serif-4-variable', 'italic' => true, 'uses' => __( 'Section subtitles', 'blueworx-client-cansakhara' ) ),
		'body'  => array( 'label' => 'Body', 'family' => 'source-sans-3', 'italic' => false, 'uses' => __( 'Paragraph copy', 'blueworx-client-cansakhara' ) ),
		'small' => array( 'label' => 'Small', 'family' => 'source-sans-3', 'italic' => false, 'uses' => __( 'Stat labels and captions', 'blueworx-client-cansakhara' ) ),
		'label' => array( 'label' => 'Label', 'family' => 'neulis-sans', 'italic' => false, 'uses' => __( 'Buttons, footer text, header MENU, popup links', 'blueworx-client-cansakhara' ) ),
	);
}

/**
 * Palette swatches, named as the mini style guide names them.
 *
 * @return array<string, array{label: string, group: string, uses: string}>
 */
function cansakhara_theme_colors() {
	return array(
		'home-1'  => array( 'label' => 'Home 1', 'group' => 'home', 'uses' => __( 'Page background, light text', 'blueworx-client-cansakhara' ) ),
		'home-2'  => array( 'label' => 'Home 2', 'group' => 'home', 'uses' => __( 'Headings and body text', 'blueworx-client-cansakhara' ) ),
		'home-3'  => array( 'label' => 'Home 3', 'group' => 'home', 'uses' => __( 'Footer and menu drawer', 'blueworx-client-cansakhara' ) ),
		'home-4'  => array( 'label' => 'Home 4', 'group' => 'home', 'uses' => __( 'Experience section background, map', 'blueworx-client-cansakhara' ) ),
		'home-5'  => array( 'label' => 'Home 5', 'group' => 'home', 'uses' => __( 'Welcome page and popups', 'blueworx-client-cansakhara' ) ),
		'home-6'  => array( 'label' => 'Home 6', 'group' => 'home', 'uses' => __( 'IBIZA accent, menu hover', 'blueworx-client-cansakhara' ) ),
		'day-1'   => array( 'label' => 'By Day 1', 'group' => 'day', 'uses' => __( 'By Day page background', 'blueworx-client-cansakhara' ) ),
		'day-2'   => array( 'label' => 'By Day 2', 'group' => 'day', 'uses' => __( 'By Day deep sections and footer', 'blueworx-client-cansakhara' ) ),
		'day-3'   => array( 'label' => 'By Day 3', 'group' => 'day', 'uses' => __( 'By Day hover', 'blueworx-client-cansakhara' ) ),
		'night-1' => array( 'label' => 'By Night 1', 'group' => 'night', 'uses' => __( 'By Night page background', 'blueworx-client-cansakhara' ) ),
		'night-2' => array( 'label' => 'By Night 2', 'group' => 'night', 'uses' => __( 'By Night deep sections and footer', 'blueworx-client-cansakhara' ) ),
		'night-3' => array( 'label' => 'By Night 3', 'group' => 'night', 'uses' => __( 'By Night buttons', 'blueworx-client-cansakhara' ) ),
	);
}

/**
 * Every token with its Figma value. Keys are "role.breakpoint.property" or
 * "color.name".
 *
 * @return array<string, int|float|string>
 */
function cansakhara_theme_defaults() {
	// role => [ desktop [size, lh, ls, weight], mobile [size, lh, ls, weight] ].
	$type = array(
		'h1'    => array( array( 48, 1, 9.6, 300 ), array( 30, 1, 6, 300 ) ),
		'h2'    => array( array( 48, 1, 9.6, 300 ), array( 24, 1, 4.8, 300 ) ),
		'h3'    => array( array( 21, 1, 4.2, 400 ), array( 12, 1, 2.4, 400 ) ),
		'h4'    => array( array( 28, 1.8, 2.8, 300 ), array( 13, 1.8, 1.3, 300 ) ),
		'body'  => array( array( 16, 1.6, 0.8, 300 ), array( 11, 1.6, 0.55, 300 ) ),
		'small' => array( array( 15, 1, 1.5, 300 ), array( 10, 1, 1, 300 ) ),
		'label' => array( array( 14, 1.4, 5.6, 400 ), array( 10, 1.4, 4, 400 ) ),
	);
	$colors = array(
		'home-1'  => '#ffffff',
		'home-2'  => '#42081a',
		'home-3'  => '#422833',
		'home-4'  => '#f2ebe2',
		'home-5'  => '#5b0a00',
		'home-6'  => '#bf2c08',
		'day-1'   => '#ac9a8c',
		'day-2'   => '#918074',
		'day-3'   => '#5f5146',
		'night-1' => '#031927',
		'night-2' => '#000e16',
		'night-3' => '#33545a',
	);

	$defaults = array();
	foreach ( $type as $role => $breakpoints ) {
		foreach ( array( 'desktop', 'mobile' ) as $i => $bp ) {
			list( $size, $lh, $ls, $weight )      = $breakpoints[ $i ];
			$defaults[ "$role.$bp.size" ]   = $size;
			$defaults[ "$role.$bp.lh" ]     = $lh;
			$defaults[ "$role.$bp.ls" ]     = $ls;
			$defaults[ "$role.$bp.weight" ] = $weight;
		}
	}
	foreach ( $colors as $name => $hex ) {
		$defaults[ "color.$name" ] = $hex;
	}
	return $defaults;
}

/**
 * The effective theme: defaults overlaid with whatever has been saved.
 *
 * @return array<string, int|float|string>
 */
function cansakhara_theme() {
	$saved = get_option( CANSAKHARA_THEME_OPTION, array() );
	return array_merge( cansakhara_theme_defaults(), is_array( $saved ) ? $saved : array() );
}

/**
 * Validates one token value against its default's type and range.
 *
 * @param string $key   Token key.
 * @param mixed  $value Submitted value.
 * @return int|float|string|null Clean value, or null if it is not usable.
 */
function cansakhara_theme_clean_value( $key, $value ) {
	if ( 0 === strpos( $key, 'color.' ) ) {
		$hex = sanitize_hex_color( is_string( $value ) ? trim( $value ) : '' );
		return ( $hex && 7 === strlen( $hex ) ) ? strtolower( $hex ) : null;
	}
	if ( ! is_numeric( $value ) ) {
		return null;
	}
	$n    = (float) $value;
	$prop = substr( $key, strrpos( $key, '.' ) + 1 );
	switch ( $prop ) {
		case 'size':
			return ( $n >= 6 && $n <= 120 ) ? (int) round( $n ) : null;
		case 'lh':
			return ( $n >= 0.8 && $n <= 3 ) ? round( $n, 2 ) : null;
		case 'ls':
			return ( $n >= -5 && $n <= 20 ) ? round( $n, 2 ) : null;
		case 'weight':
			return in_array( (int) $n, array( 100, 200, 300, 400, 500, 600, 700 ), true ) ? (int) $n : null;
	}
	return null;
}

/**
 * Settings API sanitiser. Stores only the tokens that differ from the design.
 *
 * @param mixed $input Submitted option value.
 * @return array<string, int|float|string>
 */
function cansakhara_sanitize_theme( $input ) {
	$defaults = cansakhara_theme_defaults();
	$clean    = array();
	foreach ( (array) $input as $key => $value ) {
		if ( ! isset( $defaults[ $key ] ) ) {
			continue;
		}
		$v = cansakhara_theme_clean_value( $key, $value );
		if ( null !== $v && (string) $v !== (string) $defaults[ $key ] ) {
			$clean[ $key ] = $v;
		}
	}
	return $clean;
}

/**
 * Registers the option.
 *
 * @return void
 */
function cansakhara_register_theme_setting() {
	register_setting(
		'cansakhara_theme_group',
		CANSAKHARA_THEME_OPTION,
		array(
			'type'              => 'array',
			'sanitize_callback' => 'cansakhara_sanitize_theme',
			'default'           => array(),
		)
	);
}
add_action( 'admin_init', 'cansakhara_register_theme_setting' );

/**
 * Formats one breakpoint's variables.
 *
 * @param array  $theme Effective theme.
 * @param string $bp    'desktop' or 'mobile'.
 * @return string
 */
function cansakhara_theme_css_vars( $theme, $bp ) {
	$out = '';
	foreach ( array_keys( cansakhara_theme_roles() ) as $role ) {
		$out .= "--cs-$role-size:{$theme["$role.$bp.size"]}px;";
		$out .= "--cs-$role-lh:{$theme["$role.$bp.lh"]};";
		$out .= "--cs-$role-ls:{$theme["$role.$bp.ls"]}px;";
		$out .= "--cs-$role-weight:{$theme["$role.$bp.weight"]};";
	}
	return $out;
}

/**
 * The inline stylesheet: desktop values on :root, mobile inside the site's
 * single 795px switch point, then the palette.
 *
 * @return string
 */
function cansakhara_theme_css() {
	$theme  = cansakhara_theme();
	$colors = '';
	foreach ( array_keys( cansakhara_theme_colors() ) as $name ) {
		$colors .= "--cs-color-$name:{$theme["color.$name"]};";
	}
	return ':root{' . cansakhara_theme_css_vars( $theme, 'desktop' ) . $colors . '}'
		. '@media (max-width:795px){:root{' . cansakhara_theme_css_vars( $theme, 'mobile' ) . '}}';
}
```

- [ ] **Step 4: Wire it in**

In `blueworx-client-cansakhara.php`, after the `includes/settings.php` require, add:

```php
require_once CANSAKHARA_DIR . 'includes/theme.php';
```

In `includes/assets.php`, inside `cansakhara_enqueue_assets()` directly after the `wp_enqueue_style( 'cansakhara-public', … );` call, add:

```php
	// Theme tokens ride behind the stylesheet so its role classes can read them.
	wp_add_inline_style( 'cansakhara-public', cansakhara_theme_css() );
```

- [ ] **Step 5: Run — expect pass**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/theme.spec.js --workers=1`
Expected: 4 passed.
Run: `vendor/bin/phpcs -q includes/theme.php includes/assets.php`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add includes/theme.php includes/assets.php blueworx-client-cansakhara.php tests/theme.spec.js
git commit -m "Print the site's type and colour tokens as CSS variables with the Figma defaults"
```

---

### Task 4: Role classes and swatch utilities; Home page and shared components on tokens

**Files:**
- Modify: `assets/css/src/app.css` (add `@theme` colours and `@layer components` role classes; change `.cansakhara-popup-submit` to use `.cs-label` values)
- Modify: `includes/components.php` (`cansakhara_section_heading()` lines ~120–126; any other hardcoded type/colour in that file)
- Modify: `templates/pages/home.php`
- Test: `tests/theme.spec.js`

**Interfaces (produces):**
- CSS classes: `.cs-h1 .cs-h2 .cs-h3 .cs-h4 .cs-body .cs-small .cs-label` (font-family, size, line-height, letter-spacing, weight; h1–h3 and label also `text-transform: uppercase`; h4 also `font-style: italic`), `.cs-hairline` (`font-family: "neulis-sans-hairline"; font-weight: 100`).
- Tailwind colour utilities from `@theme`: `--color-home-1 … --color-night-3` → `bg-home-2`, `text-home-2`, `border-home-2`, `bg-day-1`, etc., each `var(--cs-color-…)`.

- [ ] **Step 1: Write the failing tests** (append to `tests/theme.spec.js`)

```js
const fontOf = (page, selector) =>
  page.locator(selector).first().evaluate((el) => {
    const c = getComputedStyle(el);
    return { family: c.fontFamily.split(',')[0].replace(/"/g, ''), size: c.fontSize, weight: c.fontWeight, ls: c.letterSpacing, lh: c.lineHeight };
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
});

test('colours come from the palette variables', async ({ page }) => {
  await page.goto('/home/');
  const color = await page.locator('.section-heading').first().evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe('rgb(66, 8, 26)');
  const shell = await page.locator('main').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(shell).toBe('rgb(255, 255, 255)');
});
```

Before running, check the class names used above exist: `grep -n "welcome-copy\|welcome-heading\|experience-heading" templates/pages/home.php`. If `.welcome-copy` is not the paragraph wrapper's class, use whatever class wraps the "Every so often" paragraphs, or add `welcome-copy` to it in Step 3.

- [ ] **Step 2: Run — expect failure**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/theme.spec.js --workers=1`
Expected: the three new tests FAIL (mobile sizes wrong, hairline class absent).

- [ ] **Step 3: Add the tokens' CSS to `assets/css/src/app.css`**

Inside the existing `@theme { --breakpoint-md: 796px; }` block add the swatches:

```css
@theme {
  --breakpoint-md: 796px;

  /* Palette swatches read the Theme tab's variables (includes/theme.php), so
     bg-home-2 / text-day-1 etc. follow whatever is saved. */
  --color-home-1: var(--cs-color-home-1);
  --color-home-2: var(--cs-color-home-2);
  --color-home-3: var(--cs-color-home-3);
  --color-home-4: var(--cs-color-home-4);
  --color-home-5: var(--cs-color-home-5);
  --color-home-6: var(--cs-color-home-6);
  --color-day-1: var(--cs-color-day-1);
  --color-day-2: var(--cs-color-day-2);
  --color-day-3: var(--cs-color-day-3);
  --color-night-1: var(--cs-color-night-1);
  --color-night-2: var(--cs-color-night-2);
  --color-night-3: var(--cs-color-night-3);
}
```

Add a new components layer block after it:

```css
/* Typography roles. Values come from the CSS variables includes/theme.php
   prints (Figma defaults, editable on the Theme tab). Templates use these
   instead of per-element sizes so the client can change type in one place. */
@layer components {
  .cs-h1, .cs-h2, .cs-h3, .cs-label {
    font-family: var(--font-display), sans-serif;
    text-transform: uppercase;
  }
  .cs-h1 { font-size: var(--cs-h1-size); line-height: var(--cs-h1-lh); letter-spacing: var(--cs-h1-ls); font-weight: var(--cs-h1-weight); }
  .cs-h2 { font-size: var(--cs-h2-size); line-height: var(--cs-h2-lh); letter-spacing: var(--cs-h2-ls); font-weight: var(--cs-h2-weight); }
  .cs-h3 { font-size: var(--cs-h3-size); line-height: var(--cs-h3-lh); letter-spacing: var(--cs-h3-ls); font-weight: var(--cs-h3-weight); }
  .cs-h4 {
    font-family: var(--font-serif), serif;
    font-style: italic;
    font-size: var(--cs-h4-size); line-height: var(--cs-h4-lh); letter-spacing: var(--cs-h4-ls); font-weight: var(--cs-h4-weight);
  }
  .cs-body, .cs-small { font-family: var(--font-body), sans-serif; }
  .cs-body { font-size: var(--cs-body-size); line-height: var(--cs-body-lh); letter-spacing: var(--cs-body-ls); font-weight: var(--cs-body-weight); }
  .cs-small { font-size: var(--cs-small-size); line-height: var(--cs-small-lh); letter-spacing: var(--cs-small-ls); font-weight: var(--cs-small-weight); }
  .cs-label { font-size: var(--cs-label-size); line-height: var(--cs-label-lh); letter-spacing: var(--cs-label-ls); font-weight: var(--cs-label-weight); }
  /* The first line of a two-line lockup is the kit's hairline family. */
  .cs-hairline { font-family: "neulis-sans-hairline", var(--font-display), sans-serif; font-weight: 100; }
}
```

Change `.cansakhara-popup-submit` so its `font-family`, `font-size`, `line-height` and `letter-spacing` read the label variables (`var(--cs-label-size)` etc.) and keep `text-indent` equal to the letter-spacing (`text-indent: var(--cs-label-ls)`).

- [ ] **Step 4: Refactor `cansakhara_section_heading()`**

Replace the three inner elements' classes:

```php
<p class="section-eyebrow cs-h3"><?php echo esc_html( $eyebrow ); ?></p>
<h2 class="section-title cs-h2 mx-auto mt-9 max-w-full break-words"><?php echo $title; // phpcs:ignore … ?></h2>
<p class="section-subtitle cs-h4 mx-auto mt-8 max-w-[calc(100vw-3rem)] break-words md:mt-10 md:max-w-4xl"><?php echo $subtitle; // phpcs:ignore … ?></p>
```

and change `text-[#42081a]` in `$classes` to `text-home-2`. Add an optional `'title_role' => 'h1'|'h2'` argument (default `'h2'`) so the home intro and the By Day / By Night titles can ask for `cs-h1`:

```php
$role = ( isset( $args['title_role'] ) && 'h1' === $args['title_role'] ) ? 'cs-h1' : 'cs-h2';
```

and use `$role` in place of `cs-h2` on the `<h2>`.

- [ ] **Step 5: Refactor `templates/pages/home.php`**

Work through every `class="…"` in the file:

- Lockup: `'class' => 'welcome-lockup-line font-extralight'` → `'welcome-lockup-line cs-hairline'`. Pass `'title_role' => 'h1'` to the welcome `cansakhara_section_heading()` call.
- `<main … bg-white text-[#42081a]>` → `bg-home-1 text-home-2`.
- Hero buttons: replace `font-display text-xs uppercase tracking-[0.35em]` with `cs-label`; `bg-[#ac9a8c]` → `bg-day-1`; `bg-[#001c2b]` → `bg-night-1`; `hover:text-[#42081a]` → `hover:text-home-2`; `hover:text-[#001c2b]` → `hover:text-night-1`.
- Intro paragraphs wrapper: add class `welcome-copy` and give each `<p>` (or the wrapper) `cs-body`, removing `text-[…px] leading-[…] tracking-[…] font-light font-body`.
- Every "Enquire"/"Explore" button: `cs-label`, remove its size/tracking utilities; borders/colours to swatch utilities (`border-home-2`, `text-home-2`, `bg-home-2`).
- FEATURING label → `cs-h3`; stat numbers fit no role (Figma desktop numbers are 22px regular, mobile 13px regular — no role fits; keep `text-[13px] md:text-[22px] font-normal tracking-[0.05em]` with a comment `/* Figma 5:985 / 5:461 */`); stat labels (`PLOT`, `HOUSE`…) → `cs-small`.
- Experience section: background `bg-[#f2ebe2]` → `bg-home-4`; heading via `cansakhara_section_heading()` (already); carousel paragraph → `cs-body`.
- Discover cards: `BY DAY` / `BY NIGHT` titles → `cs-h2 text-home-1` (Figma 5:1029 is 48px light, matching H2), backgrounds `bg-day-1` / `bg-night-1`; Explore buttons `cs-label`, `bg-night-3` for the night button if it uses `#33545a`.
- Any remaining hex: map to the swatch with that value; anything not in the palette stays as is with a comment naming the Figma node.

Run `npm run build` after editing. Then verify desktop is unchanged by eye: `node` a quick 1440 capture of `/home/` and compare with `scratchpad/figma/home-desktop.png` from the review (or just check the pixel measurements in the test).

- [ ] **Step 6: Run — expect pass**

Run: `npm run build && PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/theme.spec.js tests/content.spec.js tests/welcome.spec.js tests/carousels.spec.js --workers=1`
Expected: all pass. `vendor/bin/phpcs -q includes/components.php templates/pages/home.php` → no output.

- [ ] **Step 7: Commit**

```bash
git add assets/css includes/components.php templates/pages/home.php tests/theme.spec.js
git commit -m "Home page reads its type and colours from the theme tokens"
```

---

### Task 5: By Day, By Night, Welcome and shared parts on tokens

**Files:**
- Modify: `templates/pages/by-day.php`, `templates/pages/by-night.php`, `templates/pages/welcome.php`
- Modify: `templates/parts/header.php`, `templates/parts/footer.php`, `templates/parts/popups.php`, `templates/parts/experience-carousel.php`, `templates/parts/menu-drawer.php` (colours only — links keep 16px), `includes/enquiry.php`
- Test: `tests/theme.spec.js`

**Interfaces (consumes):** role classes and swatch utilities from Task 4; `cansakhara_section_heading( … 'title_role' => 'h1' )`.

- [ ] **Step 1: Write the failing tests** (append to `tests/theme.spec.js`)

```js
for (const route of ['/by-day/', '/by-night/']) {
  test(`${route} type follows the roles at both sizes`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    expect(await fontOf(page, 'main h1')).toMatchObject({ size: '48px', ls: '9.6px', weight: '300' });
    expect(await fontOf(page, '.section-subtitle')).toMatchObject({ size: '28px' });
    expect(await fontOf(page, '.section-copy p')).toMatchObject({ size: '16px', weight: '300' });
    expect(await fontOf(page, 'footer p')).toMatchObject({ family: 'neulis-sans', size: '14px', ls: '2.8px' });
    await page.setViewportSize({ width: 402, height: 900 });
    await page.reload();
    expect(await fontOf(page, 'main h1')).toMatchObject({ size: '30px', ls: '6px' });
    expect(await fontOf(page, '.section-copy p')).toMatchObject({ size: '11px' });
    expect(await fontOf(page, 'footer p')).toMatchObject({ size: '8px' });
  });
}

test('header MENU and popup links use the label role', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/home/');
  expect(await fontOf(page, 'header button span')).toMatchObject({ family: 'neulis-sans', size: '14px', ls: '5.6px' });
  await page.setViewportSize({ width: 402, height: 900 });
  await page.reload();
  expect(await fontOf(page, 'header button span')).toMatchObject({ size: '10px', ls: '4px' });
});
```

Adjust selectors to the real markup: run `grep -n "<h1\|section-copy\|<span" templates/pages/by-day.php templates/parts/header.php | head` and use the classes/tags that exist; add `section-copy` to the paragraph wrappers in the page templates if there is no stable class.

- [ ] **Step 2: Run — expect failure**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/theme.spec.js --workers=1`
Expected: the new tests FAIL on mobile sizes.

- [ ] **Step 3: Refactor the templates**

Same mapping as Task 4 Step 5, file by file:

- `by-day.php` / `by-night.php`: page title `<h1>` → `cs-h1`; "CAN SAKHARA" sub-line under the title keeps its fixed size with a Figma node comment if it fits no role; section headings through `cansakhara_section_heading()`; two-line titles ("SUN-DRENCHED / SERENITY", "GLORIOUS / AFTERHOURS") wrap the first line in `<span class="cs-hairline block">`; paragraphs `cs-body` inside a `section-copy` wrapper; buttons `cs-label`; backgrounds `bg-day-1 / bg-day-2 / bg-night-1 / bg-night-2`; the by-day/by-night footer colour props stay as theme names and `footer.php` maps them to swatches.
- `welcome.php`: IBIZA line → `cs-h3 text-home-6`; LOGIN / ENQUIRE → `cs-label`; background `bg-home-5`.
- `header.php`: MENU text and ENQUIRE button → `cs-label`.
- `footer.php`: the `$cansakhara_footer_colors` array becomes swatch class names (`'home' => 'bg-home-3', 'day' => 'bg-day-2', 'night' => 'bg-night-2'`) applied as a class instead of the inline `style`; copyright row → `cs-label` and keep `text-[8px] tracking-[1.6px] md:text-[length:var(--cs-label-size)] md:tracking-[length:var(--cs-label-ls)]` — simpler: give the row `cs-label` plus a mobile-only override class `footer-legal` defined in app.css under `@media (max-width: 795px) { .footer-legal { font-size: 8px; letter-spacing: 1.6px; } }` with a comment `/* Figma 5:528: footer legal text is 8px on mobile, below the Label role. */`.
- `popups.php`: titles LOGIN / ENQUIRE → `cs-h1 text-home-1`; intro paragraphs → `cs-h4` (they are serif italic in Figma) ; "Request private access password" link → `cs-label`; input placeholders keep `cs-body`; background `bg-home-5`.
- `experience-carousel.php`: slide titles via `cs-h2`, copy `cs-body`.
- `menu-drawer.php`: `bg-[#422833]` → `bg-home-3` (and the day/night equivalents to `bg-day-2` / `bg-night-2`); links keep `text-[16px] tracking-[3.2px] font-light` with `/* Figma 5:1090 menu links are 16px; no role. */`.
- `includes/enquiry.php`: any SureForms restyle rule using hex or px type → swatch variable / label variables.

After editing run `grep -rn "text-\[#\|bg-\[#\|border-\[#" templates includes --include=*.php` — every remaining hit must carry a Figma-node comment on the same or previous line.

- [ ] **Step 4: Rebuild and run the whole suite**

Run: `npm run build && PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test --workers=1`
Expected: all pass. `vendor/bin/phpcs -q templates includes` → no output.

- [ ] **Step 5: Commit**

```bash
git add templates includes assets/css tests/theme.spec.js
git commit -m "Every page reads its type and colours from the theme tokens"
```

---

### Task 6: Theme tab on the settings screen

**Files:**
- Modify: `includes/settings.php` (tabs in `cansakhara_render_settings_page()`; General content moves into `cansakhara_render_general_tab()`)
- Create: `includes/theme-screen.php` (`cansakhara_render_theme_tab()`, reset handler)
- Modify: `blueworx-client-cansakhara.php` (require `includes/theme-screen.php` after `theme.php`)
- Modify: `assets/css/admin.css` (only if a layout tweak is unavoidable — prefer none)
- Test: `tests/theme-admin.spec.js` (new), `tests/helpers/wp.js` (add `setThemeToken()` and `resetTheme()` helpers)

**Interfaces:**
- Consumes: `cansakhara_theme_roles()`, `cansakhara_theme_colors()`, `cansakhara_theme_defaults()`, `cansakhara_theme()`, `CANSAKHARA_THEME_OPTION`, settings group `cansakhara_theme_group`.
- Produces: URL `options-general.php?page=cansakhara&tab=theme`; field names `cansakhara_theme[h1.desktop.size]` etc.; field ids `cs-h1-desktop-size`, colour ids `cs-color-home-2`; reset via `admin-post.php?action=cansakhara_reset_theme` with nonce `cansakhara_reset_theme`.

**Say out loud before writing markup:** "Using the blueworx-admin-design skill for the Theme tab" and invoke the skill. Read `components/layout/Tabs.jsx`, `components/forms/ColorField.jsx`, `components/forms/Input.jsx`, `components/forms/Select.jsx`, and `styles.css` `.bw-table` rules. Presets for every colour field are the twelve palette hexes (the design system says never offer a bare picker).

- [ ] **Step 1: Add helpers to `tests/helpers/wp.js`**

```js
// Saves one Theme tab field, e.g. setThemeToken(page, 'cs-body-desktop-size', '18').
export async function setThemeToken(page, fieldId, value) {
  await page.goto('/wp-admin/options-general.php?page=cansakhara&tab=theme');
  await page.fill(`#${fieldId}`, String(value));
  await page.click('button[type="submit"]:has-text("Save changes")');
  await page.waitForURL(/settings-updated=true/);
}

// Puts every token back to the Figma default.
export async function resetTheme(page) {
  await page.goto('/wp-admin/options-general.php?page=cansakhara&tab=theme');
  page.once('dialog', (d) => d.accept());
  await page.click('button:has-text("Reset to design defaults")');
  await page.waitForURL(/theme-reset=true/);
}
```

- [ ] **Step 2: Write the failing tests** (`tests/theme-admin.spec.js`)

```js
import { test, expect } from '@playwright/test';
import { loginAsAdmin, setThemeToken, resetTheme } from './helpers/wp.js';

test.describe('the Theme tab', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.afterEach(async ({ page }) => {
    await resetTheme(page);
  });

  test('is a tab on the settings screen, built from the design system', async ({ page }) => {
    await page.goto('/wp-admin/options-general.php?page=cansakhara');
    await page.click('.bw-tab:has-text("Theme")');
    await expect(page).toHaveURL(/tab=theme/);
    await expect(page.locator('.bw-admin.bw-page')).toBeVisible();
    await expect(page.locator('.bw-tab.is-active')).toHaveText(/Theme/);
    await expect(page.locator('.bw-table')).toHaveCount(2); // Desktop, Mobile
    await expect(page.locator('.bw-colorfield')).toHaveCount(12);
    // Every field shows its Figma default.
    await expect(page.locator('#cs-body-desktop-size')).toHaveValue('16');
    await expect(page.locator('#cs-h1-mobile-ls')).toHaveValue('6');
    await expect(page.locator('#cs-color-home-2')).toHaveValue('#42081a');
  });

  test('a saved size reaches the front end, and reset removes it', async ({ page }) => {
    await setThemeToken(page, 'cs-body-desktop-size', '18');
    await page.goto('/home/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--cs-body-size').trim())).toBe('18px');
    await resetTheme(page);
    await page.goto('/home/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--cs-body-size').trim())).toBe('16px');
  });

  test('an invalid colour is ignored and the default kept', async ({ page }) => {
    await setThemeToken(page, 'cs-color-home-2', 'not-a-colour');
    await page.goto('/home/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--cs-color-home-2').trim())).toBe('#42081a');
  });

  test('the General tab still saves', async ({ page }) => {
    await page.goto('/wp-admin/options-general.php?page=cansakhara');
    await expect(page.locator('#cansakhara-login-redirect')).toBeVisible();
    await expect(page.locator('.bw-tab.is-active')).toHaveText(/General/);
  });
});
```

Note: the admin, not the guest, visits `/home/` here; admins pass the private-page check.

- [ ] **Step 3: Run — expect failure**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test tests/theme-admin.spec.js --workers=1`
Expected: FAIL — no `.bw-tab` on the page.

- [ ] **Step 4: Add tabs to the settings screen**

In `includes/settings.php`:

1. Add a helper:

```php
/**
 * Which settings tab is showing. Only 'general' and 'theme' exist.
 *
 * @return string
 */
function cansakhara_settings_tab() {
	$tab = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'general'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only view switch.
	return 'theme' === $tab ? 'theme' : 'general';
}
```

2. In `cansakhara_render_settings_page()`, directly after `</header>` (the `.bw-pagehead`), print the tabs:

```php
<nav class="bw-tabs" role="tablist" aria-label="<?php esc_attr_e( 'Settings sections', 'blueworx-client-cansakhara' ); ?>">
	<a class="bw-tab <?php echo 'general' === $tab ? 'is-active' : ''; ?>" role="tab" aria-selected="<?php echo 'general' === $tab ? 'true' : 'false'; ?>" href="<?php echo esc_url( cansakhara_settings_url() ); ?>"><?php esc_html_e( 'General', 'blueworx-client-cansakhara' ); ?></a>
	<a class="bw-tab <?php echo 'theme' === $tab ? 'is-active' : ''; ?>" role="tab" aria-selected="<?php echo 'theme' === $tab ? 'true' : 'false'; ?>" href="<?php echo esc_url( add_query_arg( 'tab', 'theme', cansakhara_settings_url() ) ); ?>"><?php esc_html_e( 'Theme', 'blueworx-client-cansakhara' ); ?></a>
</nav>
```

3. The `<form>` must post the right option group: `settings_fields( 'theme' === $tab ? 'cansakhara_theme_group' : 'cansakhara_settings_group' )`. Change the lede to match the tab (`Theme`: "Type sizes, spacing and colours the site is built from. Defaults are the Figma design."). Move the two existing `<section class="bw-card …">` blocks into `cansakhara_render_general_tab( $settings, $sureforms, $forms )` and call it, or `cansakhara_render_theme_tab()` when `$tab === 'theme'`. Keep the save bar for both tabs. After a save WordPress redirects to `options-general.php?page=cansakhara&settings-updated=true` — add `tab=theme` back by hooking:

```php
add_filter( 'wp_redirect', function ( $location ) {
	if ( false !== strpos( $location, 'page=cansakhara' ) && isset( $_POST['option_page'] ) && 'cansakhara_theme_group' === $_POST['option_page'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- options.php has already verified the nonce.
		$location = add_query_arg( 'tab', 'theme', $location );
	}
	return $location;
} );
```

(Name it `cansakhara_keep_theme_tab_after_save` rather than a closure, to match the file's style.)

- [ ] **Step 5: Create `includes/theme-screen.php`**

Render two typography cards and three colour cards, plus the reset form. Skeleton (fill every role/colour from the arrays — no hand-typed rows):

```php
<?php
/**
 * The Theme tab: edit the typography roles and palette.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * One typography table for a breakpoint.
 *
 * @param string $bp    'desktop' or 'mobile'.
 * @param array  $theme Effective theme.
 * @return void
 */
function cansakhara_render_type_table( $bp, $theme ) {
	$weights = array( 100, 200, 300, 400, 500, 600, 700 );
	?>
	<div class="bw-tablescroll">
		<table class="bw-table">
			<thead>
				<tr>
					<th><?php esc_html_e( 'Role', 'blueworx-client-cansakhara' ); ?></th>
					<th><?php esc_html_e( 'Size (px)', 'blueworx-client-cansakhara' ); ?></th>
					<th><?php esc_html_e( 'Line height', 'blueworx-client-cansakhara' ); ?></th>
					<th><?php esc_html_e( 'Letter-spacing (px)', 'blueworx-client-cansakhara' ); ?></th>
					<th><?php esc_html_e( 'Weight', 'blueworx-client-cansakhara' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( cansakhara_theme_roles() as $role => $meta ) : ?>
				<tr>
					<td>
						<span class="bw-table__primary"><?php echo esc_html( $meta['label'] ); ?></span>
						<span class="bw-table__sub"><?php echo esc_html( $meta['family'] . ( $meta['italic'] ? ' italic' : '' ) . ' — ' . $meta['uses'] ); ?></span>
					</td>
					<?php foreach ( array( 'size' => array( 6, 120, 1 ), 'lh' => array( 0.8, 3, 0.05 ), 'ls' => array( -5, 20, 0.1 ) ) as $prop => $range ) : ?>
					<td>
						<input type="number" class="bw-input bw-input--sm" id="cs-<?php echo esc_attr( "$role-$bp-$prop" ); ?>"
							name="<?php echo esc_attr( CANSAKHARA_THEME_OPTION . "[$role.$bp.$prop]" ); ?>"
							value="<?php echo esc_attr( (string) $theme[ "$role.$bp.$prop" ] ); ?>"
							min="<?php echo esc_attr( (string) $range[0] ); ?>" max="<?php echo esc_attr( (string) $range[1] ); ?>" step="<?php echo esc_attr( (string) $range[2] ); ?>"
							aria-label="<?php echo esc_attr( $meta['label'] . ' ' . $bp . ' ' . $prop ); ?>" />
					</td>
					<?php endforeach; ?>
					<td>
						<span class="bw-select">
							<select class="bw-select__el" id="cs-<?php echo esc_attr( "$role-$bp-weight" ); ?>" name="<?php echo esc_attr( CANSAKHARA_THEME_OPTION . "[$role.$bp.weight]" ); ?>" aria-label="<?php echo esc_attr( $meta['label'] . ' ' . $bp . ' weight' ); ?>">
								<?php foreach ( $weights as $w ) : ?>
								<option value="<?php echo esc_attr( (string) $w ); ?>" <?php selected( (int) $theme[ "$role.$bp.weight" ], $w ); ?>><?php echo esc_html( (string) $w ); ?></option>
								<?php endforeach; ?>
							</select>
							<i class="bw-icon bw-icon--14 bw-select__arrow" data-lucide="chevron-down"></i>
						</span>
					</td>
				</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
	<?php
}
```

Then `cansakhara_render_theme_tab()`:

- a `bw-notice bw-notice--success` when `settings-updated=true` or `theme-reset=true` is in the URL;
- `<section class="bw-card bw-settingscard">` "Typography — Desktop (796px and up)" containing `cansakhara_render_type_table( 'desktop', $theme )`, and another for "Mobile (below 796px)"; card description: "Sizes and spacing are in pixels. The mobile intro subtitle and footer legal text are fixed in the design at 15px and 8px and don't follow these roles.";
- one `bw-card` per colour group (Home, By Day, By Night). Each swatch is a `bw-formrow` whose control is:

```php
<div class="bw-colorfield">
	<input type="color" class="bw-colorfield__swatch" value="<?php echo esc_attr( $hex ); ?>" aria-label="<?php echo esc_attr( $meta['label'] ); ?>" data-cs-color-for="cs-color-<?php echo esc_attr( $name ); ?>" />
	<span class="bw-colorfield__hex"><input type="text" class="bw-input bw-input--mono" id="cs-color-<?php echo esc_attr( $name ); ?>" name="<?php echo esc_attr( CANSAKHARA_THEME_OPTION . "[color.$name]" ); ?>" value="<?php echo esc_attr( $hex ); ?>" aria-label="<?php echo esc_attr( $meta['label'] . ' hex' ); ?>" /></span>
	<span class="bw-colorfield__presets"><?php foreach ( $palette as $p ) : ?><button type="button" class="bw-colorfield__preset <?php echo strtolower( $p ) === strtolower( $hex ) ? 'is-active' : ''; ?>" style="background:<?php echo esc_attr( $p ); ?>" title="<?php echo esc_attr( $p ); ?>" aria-label="<?php echo esc_attr( $p ); ?>" data-cs-preset="<?php echo esc_attr( $p ); ?>"></button><?php endforeach; ?></span>
</div>
```

  with the row label `$meta['label']` and help text `$meta['uses']`. `$palette` is the twelve default hexes from `cansakhara_theme_defaults()`.

- A small inline script (via `wp_add_inline_script` on `blueworx-admin-icons` or a `<script>` at the end of the tab, no external file) keeps swatch ↔ hex ↔ preset in sync: on `input` of the colour picker write to the hex field (`data-cs-color-for`), on hex `input` of a valid `#rrggbb` write to the picker, on preset click set both.

- Reset: a second `<form method="post" action="admin-post.php">` **outside** the settings form is not possible while the settings form wraps the page, so render the reset as a `bw-btn bw-btn--secondary` `<button type="submit" formaction="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" formmethod="post" name="cansakhara_reset" onclick="return confirm('<?php echo esc_js( __( 'Put every type size and colour back to the Figma design?', 'blueworx-client-cansakhara' ) ); ?>');">Reset to design defaults</button>` inside the save bar, plus hidden fields `action=cansakhara_reset_theme` and `wp_nonce_field( 'cansakhara_reset_theme', 'cansakhara_reset_nonce' )` printed only on the Theme tab. The handler:

```php
function cansakhara_handle_reset_theme() {
	if ( ! current_user_can( 'manage_options' ) || ! isset( $_POST['cansakhara_reset_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['cansakhara_reset_nonce'] ) ), 'cansakhara_reset_theme' ) ) {
		wp_die( esc_html__( 'Not allowed.', 'blueworx-client-cansakhara' ) );
	}
	delete_option( CANSAKHARA_THEME_OPTION );
	wp_safe_redirect( add_query_arg( array( 'tab' => 'theme', 'theme-reset' => 'true' ), cansakhara_settings_url() ) );
	exit;
}
add_action( 'admin_post_cansakhara_reset_theme', 'cansakhara_handle_reset_theme' );
```

  Because the reset button submits the same form with a different `formaction`, the settings fields travel with it harmlessly; the handler ignores them.

- [ ] **Step 6: Run — expect pass**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test tests/theme-admin.spec.js tests/settings.spec.js --workers=1`
Expected: all pass. `vendor/bin/phpcs -q includes/settings.php includes/theme-screen.php` → no output.

Open `http://127.0.0.1:8881/wp-admin/options-general.php?page=cansakhara&tab=theme` in the Playwright MCP browser and screenshot it; the tables must not overflow the card at 1280px wide (use `.bw-tablescroll` — already in the markup).

- [ ] **Step 7: Commit**

```bash
git add includes/settings.php includes/theme-screen.php blueworx-client-cansakhara.php tests/theme-admin.spec.js tests/helpers/wp.js
git commit -m "Add a Theme tab to edit the site's type sizes, spacing and colours"
```

---

### Task 7: Mobile section spacing to the pixel

**Files:**
- Modify: `templates/pages/home.php`, `templates/pages/by-day.php`, `templates/pages/by-night.php`, `templates/parts/*.php`, `assets/css/src/app.css` (mobile media query)
- Test: `tests/theme.spec.js`

**Interfaces:** none new.

- [ ] **Step 1: Write the failing test** (append to `tests/theme.spec.js`)

```js
// Full-page heights at 402px must match the Figma mobile frames.
const FIGMA_MOBILE_HEIGHTS = { '/home/': 4554, '/by-day/': 3308, '/by-night/': 3332 };

for (const [route, height] of Object.entries(FIGMA_MOBILE_HEIGHTS)) {
  test(`${route} lays out to the Figma mobile height`, async ({ page }) => {
    await page.setViewportSize({ width: 402, height: 874 });
    await page.goto(route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: 'html, body, .site-shell { height: auto !important; max-height: none !important; overflow: visible !important; }' });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(Math.abs(total - height)).toBeLessThanOrEqual(8);
  });
}
```

Note the Figma mobile frames are 874px tall at the hero (status bar included, 47px). The hero uses `h-[100svh]`; at an 874px viewport that equals the frame. If the Figma hero is 874 and the site hero is the viewport, they match by construction at this viewport size.

- [ ] **Step 2: Run — expect failure**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/theme.spec.js -g "Figma mobile height" --workers=1`
Expected: FAIL for `/home/` (about 5300 vs 4554); record the three received values.

- [ ] **Step 3: Audit section by section**

For each page, in order, call `get_design_context` on the mobile frame's section containers (use `get_metadata` on the frame id to list them — `5:386`, `5:583`, `5:717`) and set the site to the same values: section padding-top/bottom, gap between eyebrow / title / subtitle (Figma `gap-[20px]` on mobile vs `gap-[50px]` desktop in `cansakhara_section_heading()` — make the `mt-9`/`mt-8` utilities `mt-5 md:mt-9` / `mt-5 md:mt-8`), image heights (e.g. Home experience image `352×500` at x=25), map size (`181×146` at y=1173), stats grid (`270×188`), Discover cards (`270×298`, stacked with a 30px gap), video block (`80px` play button), footer (`pt-[80px]`, logo block `293px`, gap 30, `pb-[50px]`).

Method for each section: measure the site with

```js
await page.locator('#welcome').evaluate((el) => { const r = el.getBoundingClientRect(); return [Math.round(r.top + window.scrollY), Math.round(r.height)]; })
```

and compare with the Figma node's `y` and `height` from the metadata dump. Change one section at a time; keep the desktop utilities (`md:`) untouched so desktop stays identical. Re-run the height test after each page.

- [ ] **Step 4: Run — expect pass**

Run: `npm run build && PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test --workers=1`
Expected: all pass, including the three height tests.

- [ ] **Step 5: Commit**

```bash
git add templates assets/css tests/theme.spec.js
git commit -m "Match the mobile section spacing to the Figma frames"
```

---

### Task 8: Version, changelog, lint, PR

**Files:**
- Modify: `blueworx-client-cansakhara.php` (header `Version: 0.5.0`, `CANSAKHARA_VERSION`), `package.json`, `readme.txt`, `CHANGELOG.md`

- [ ] **Step 1: Bump and write the changelog**

`CHANGELOG.md` under a new `## [0.5.0] - <today>`:

```
### Added

- A Theme tab under Settings → Can Sakhara: edit every text style's size, line
  height, letter-spacing and weight (desktop and mobile) and the twelve palette
  colours, with a reset to the Figma design.

### Fixed

- Mobile type sizes, labels and section spacing now match the Figma mobile
  frames; desktop body copy is the design's light weight.
- The footer keeps its 50px bottom padding on desktop.

### Removed

- The old Next.js screenshot comparison; the Figma file is the reference.
```

`readme.txt` gets the same in its `= 0.5.0 =` block, one line per point.

- [ ] **Step 2: Lint once and run everything**

Run: `npm run lint && vendor/bin/phpcs -q . --ignore=vendor,node_modules,dist,.wp-test,plugin-update-checker,.claude && npm run build && PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test --workers=1`
Expected: lint clean or findings listed for Luke (do not fix them); phpcs no output; tests all pass.

- [ ] **Step 3: Commit, push, PR**

```bash
git add -A
git commit -m "Version 0.5.0"
git push -u origin theme-tokens
gh pr create --title "Theme tab, Figma type tokens, mobile spacing" --body "$(cat <<'EOF'
Adds a Theme tab (Settings → Can Sakhara) to edit every text style and palette colour, with a reset to the Figma design.

Mobile type and section spacing now match the Figma mobile frames; the footer gets its bottom padding back; the old Next.js screenshot check is retired.

Version 0.5.0.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```


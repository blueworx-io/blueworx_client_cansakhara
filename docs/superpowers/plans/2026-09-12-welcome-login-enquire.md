# Welcome Page, Login Popup & Enquire Popup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the red Welcome splash page and two site-wide popups — guest login (real WordPress accounts, redirect target from settings) and enquiry (a SureForms form chosen in settings) — plus the settings screen that drives both.

**Architecture:** Welcome is a fourth plugin-owned page using the existing `cansakhara_pages()` / `template_include` mechanism. The two popups are one template part rendered by the header (every owned page) and by the Welcome template directly, driven by a small vanilla-JS module in the existing esbuild bundle. Login goes through a REST route with a no-JS `template_redirect` fallback. Settings are one option, one Settings-API page, built from the blueworx-admin-design classes.

**Tech Stack:** PHP 8.1 / WordPress 6.4+, Tailwind v4 (compiled to `assets/css/public.css`), esbuild vanilla JS bundle, Playwright against the local WordPress harness, blueworx-admin-design (PHP class markup, no React).

**Spec:** `docs/superpowers/specs/2026-09-12-welcome-login-enquire-design.md`

## Global Constraints

- Branch `welcome-login-enquire` (already created off `wordpress-plugin-conversion`). Never commit to main.
- Version `0.1.0` → `0.2.0` in `blueworx-client-cansakhara.php` (header **and** `CANSAKHARA_VERSION`), `package.json`, `readme.txt` (Stable tag + changelog), `CHANGELOG.md`. `package-lock.json`'s own version field is left alone.
- No new npm/composer dependencies (`approved-deps.json` unchanged).
- Every new PHP file starts with the `ABSPATH` guard; all output escaped (`esc_html`, `esc_attr`, `esc_url`); text domain `blueworx-client-cansakhara`; tabs for indentation (WordPress standards, `phpcs.xml.dist`).
- JS: tabs, `ecmaVersion 2022`, browser globals only; `npm run lint` is run **once** at the end (Task 8), never in a loop.
- Tailwind classes only appear in `templates/`, `includes/`, `assets/js/src/` (the `@source` roots). Anything toggled from JS must exist as a string literal in JS.
- Run `npm run build` after any change to `templates/`, `includes/`, `assets/css/src/`, `assets/js/src/`; the built `assets/css/public.css` and `assets/js/public.js` are committed.
- The admin screen uses only `bw-*` classes from `assets/blueworx-admin-design.css`; the plugin's own admin stylesheet may contain only the chrome overrides the design system's readme documents (`.wrap.bw-wrap`, `body.settings_page_cansakhara #wpcontent`, `#wpbody-content`, `#wpfooter`). Never hand-edit any design-system copy.
- Harness: `node ../bluegroup_core_foundation/scripts/wp-test-env.mjs up --plugin .` then `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test --workers=1 <file>`. The harness admin is `admin` / `admin`, email `admin@example.com`. Tests must not depend on that email — read it from the profile screen.
- Commit messages: one plain line, ending with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Copy: British English, no exclamation marks, buttons are verbs, sentence case in the admin screen. Front-end copy is exactly what the Figma frames say.

---

## File map

| File | Responsibility |
|---|---|
| `assets/blueworx-admin-design.css`, `assets/blueworx-admin-design.php`, `assets/blueworx-admin-icons.js`, `assets/fonts/{inter,sora}-*.woff2` | Verbatim copies from the design system (Task 1) |
| `.claude/skills/blueworx-admin-design/` | Re-pulled from the foundation at `v1` (Task 1) |
| `includes/settings.php` | Option `cansakhara_settings`, sanitiser, accessors, Settings → Can Sakhara screen |
| `assets/css/admin.css` | Chrome overrides for that screen only |
| `includes/pages.php` | + `welcome` page; `cansakhara_install_pages( $set_front_page )` |
| `blueworx-client-cansakhara.php` | + requires, upgrade routine, version |
| `templates/pages/welcome.php` | The splash page |
| `templates/parts/popups.php` | Both popups' markup |
| `includes/enquiry.php` | SureForms detection, form render, fallback, keep-styles filter |
| `includes/login.php` | REST route, no-JS handler, `cansakhara_attempt_login()`, redirect URL, script data |
| `assets/js/src/popups.js` | Open/close/trap/swap for both popups |
| `assets/js/src/login.js` | Background submit of the login form |
| `assets/js/src/main.js` | + `initPopups()`, `initLoginForm()` |
| `assets/css/src/app.css` | + SureForms override rules scoped to `.cansakhara-popup` |
| `templates/parts/header.php`, `templates/parts/menu-drawer.php` | Enquire button → popup; Login / Log out entry |
| `scripts/build-zip.mjs` | + admin assets in the allowlist |
| `tests/helpers/wp.js` | `loginAsAdmin`, `adminEmail`, `logout`, `setSettings` |
| `tests/settings.spec.js`, `tests/welcome.spec.js`, `tests/popups.spec.js`, `tests/login.spec.js`, `tests/enquire.spec.js` | New specs |
| `tests/chrome.spec.js` | Updated for the Enquire button |
| `uninstall.php` | + `delete_option( 'cansakhara_settings' )` |

---

### Task 1: Ship the design system and build the settings screen

**Files:**
- Re-pull: `.claude/skills/blueworx-admin-design/` (from `../bluegroup_core_foundation`, tag `v1`)
- Create: `assets/blueworx-admin-design.css`, `assets/blueworx-admin-design.php`, `assets/blueworx-admin-icons.js`, `assets/fonts/inter-400.woff2` … `sora-700.woff2` (6 files)
- Create: `includes/settings.php`, `assets/css/admin.css`
- Modify: `blueworx-client-cansakhara.php` (requires), `scripts/build-zip.mjs:21-34` (allowlist), `uninstall.php`
- Test: `tests/helpers/wp.js`, `tests/settings.spec.js`

**Interfaces:**
- Produces: `cansakhara_settings()` → `array{login_redirect:int, enquiry_form:int}`; `cansakhara_login_redirect_url()` → string; `cansakhara_enquiry_form_id()` → int; `cansakhara_sureforms_active()` → bool; `cansakhara_settings_url()` → string. Option name `cansakhara_settings`. Screen slug `cansakhara` under `options-general.php`.

- [ ] **Step 1: Re-pull the design system and copy the shipped files**

Confirm the foundation checkout is clean and at `v1` (it is `main` == `v1` at the time of writing):

```bash
git -C ../bluegroup_core_foundation status --short
git -C ../bluegroup_core_foundation rev-parse v1 HEAD   # must print the same hash twice
```

Then, in Git Bash from the plugin root:

```bash
rm -rf .claude/skills/blueworx-admin-design
cp -R ../bluegroup_core_foundation/.claude/skills/blueworx-admin-design .claude/skills/
cp .claude/skills/blueworx-admin-design/styles.css assets/blueworx-admin-design.css
cp .claude/skills/blueworx-admin-design/design-system.php assets/blueworx-admin-design.php
cp .claude/skills/blueworx-admin-design/fonts/* assets/fonts/
cp .claude/skills/blueworx-admin-design/assets/icons/lucide-icons.js assets/blueworx-admin-icons.js
```

Verify: `diff -rq .claude/skills/blueworx-admin-design ../bluegroup_core_foundation/.claude/skills/blueworx-admin-design` prints nothing, and `ls assets/fonts | grep -c 'inter\|sora'` prints `6`.

- [ ] **Step 2: Write the test helper**

Create `tests/helpers/wp.js`:

```js
// Shared WordPress helpers for the Playwright suite. Every test that needs a
// signed-in admin goes through here, so the credentials live in one place.
const ADMIN_USER = process.env.WP_ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.WP_ADMIN_PASS ?? 'admin';

export async function loginAsAdmin(page) {
  await page.goto('/wp-login.php');
  await page.fill('#user_login', ADMIN_USER);
  await page.fill('#user_pass', ADMIN_PASS);
  await page.click('#wp-submit');
  await page.waitForURL(/wp-admin/);
}

export async function logout(page) {
  await page.context().clearCookies();
}

// The admin's email address, read from the profile screen rather than assumed.
export async function adminEmail(page) {
  await page.goto('/wp-admin/profile.php');
  return page.inputValue('#email');
}

export function adminPassword() {
  return ADMIN_PASS;
}

// Saves the plugin's settings screen with the given values. `loginRedirect`
// is an option label in the page dropdown ('Home page' or a page title).
export async function setSettings(page, { loginRedirect }) {
  await page.goto('/wp-admin/options-general.php?page=cansakhara');
  await page.selectOption('#cansakhara-login-redirect', { label: loginRedirect });
  await page.click('button[type="submit"]:has-text("Save changes")');
  await page.waitForURL(/settings-updated=true/);
}
```

- [ ] **Step 3: Write the failing settings test**

Create `tests/settings.spec.js`:

```js
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/wp.js';

test.describe('the settings screen', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('is built from the admin design system', async ({ page }) => {
    await page.goto('/wp-admin/options-general.php?page=cansakhara');
    await expect(page.locator('.bw-admin.bw-page')).toBeVisible();
    await expect(page.locator('.bw-pagehead__h1')).toHaveText('Settings');
    const css = page.locator('link[href*="blueworx-admin-design.css"]');
    await expect(css).toHaveCount(1);
  });

  test('saves the login destination and shows it after reload', async ({ page }) => {
    await page.goto('/wp-admin/options-general.php?page=cansakhara');
    await page.selectOption('#cansakhara-login-redirect', { label: 'By Day' });
    await page.click('button[type="submit"]:has-text("Save changes")');
    await page.waitForURL(/settings-updated=true/);
    await expect(page.locator('.bw-notice--success')).toBeVisible();

    await page.reload();
    await expect(page.locator('#cansakhara-login-redirect option:checked')).toHaveText('By Day');

    // Put it back so other specs start from the default.
    await page.selectOption('#cansakhara-login-redirect', { label: 'Home page' });
    await page.click('button[type="submit"]:has-text("Save changes")');
    await page.waitForURL(/settings-updated=true/);
  });

  test('explains the enquiry form picker when SureForms is not installed', async ({ page }) => {
    await page.goto('/wp-admin/options-general.php?page=cansakhara');
    const select = page.locator('#cansakhara-enquiry-form');
    await expect(select).toBeDisabled();
    await expect(page.locator('#cansakhara-enquiry-form-help')).toContainText('SureForms');
  });
});
```

- [ ] **Step 4: Run it to confirm it fails**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test tests/settings.spec.js --workers=1`
Expected: all three FAIL (no `.bw-admin` on the page — WordPress shows "Sorry, you are not allowed to access this page." for an unknown `page=`).

- [ ] **Step 5: Write `includes/settings.php`**

```php
<?php
/**
 * The plugin's settings: where a guest lands after signing in, and which
 * SureForms form the Enquire popup shows.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const CANSAKHARA_SETTINGS_OPTION = 'cansakhara_settings';
const CANSAKHARA_SETTINGS_SLUG   = 'cansakhara';

/**
 * The saved settings, with defaults filled in and values typed.
 *
 * @return array{login_redirect:int, enquiry_form:int}
 */
function cansakhara_settings() {
	$saved = (array) get_option( CANSAKHARA_SETTINGS_OPTION, array() );

	return array(
		'login_redirect' => isset( $saved['login_redirect'] ) ? (int) $saved['login_redirect'] : 0,
		'enquiry_form'   => isset( $saved['enquiry_form'] ) ? (int) $saved['enquiry_form'] : 0,
	);
}

/**
 * Where a guest is sent after signing in.
 *
 * The chosen page, or the front page when nothing is chosen or the chosen
 * page has since been deleted or unpublished.
 *
 * @return string URL.
 */
function cansakhara_login_redirect_url() {
	$page_id = cansakhara_settings()['login_redirect'];

	if ( $page_id > 0 && 'publish' === get_post_status( $page_id ) ) {
		$url = get_permalink( $page_id );

		if ( is_string( $url ) && '' !== $url ) {
			return $url;
		}
	}

	return home_url( '/' );
}

/**
 * The chosen SureForms form, or 0.
 *
 * @return int
 */
function cansakhara_enquiry_form_id() {
	return cansakhara_settings()['enquiry_form'];
}

/**
 * Whether SureForms is active on this site.
 *
 * @return bool
 */
function cansakhara_sureforms_active() {
	return post_type_exists( 'sureforms_form' ) && shortcode_exists( 'sureforms' );
}

/**
 * The settings screen's URL.
 *
 * @return string
 */
function cansakhara_settings_url() {
	return admin_url( 'options-general.php?page=' . CANSAKHARA_SETTINGS_SLUG );
}

/**
 * Sanitises the settings on save. Unknown keys are dropped; a page that is not
 * a page, or a form that is not a SureForms form, becomes 0.
 *
 * @param mixed $input Raw option value.
 * @return array{login_redirect:int, enquiry_form:int}
 */
function cansakhara_sanitize_settings( $input ) {
	$input = is_array( $input ) ? $input : array();

	$page_id = isset( $input['login_redirect'] ) ? absint( $input['login_redirect'] ) : 0;
	if ( $page_id > 0 && 'page' !== get_post_type( $page_id ) ) {
		$page_id = 0;
	}

	$form_id = isset( $input['enquiry_form'] ) ? absint( $input['enquiry_form'] ) : 0;
	if ( $form_id > 0 && 'sureforms_form' !== get_post_type( $form_id ) ) {
		$form_id = 0;
	}

	return array(
		'login_redirect' => $page_id,
		'enquiry_form'   => $form_id,
	);
}

/**
 * Registers the option.
 *
 * @return void
 */
function cansakhara_register_settings() {
	register_setting(
		'cansakhara_settings_group',
		CANSAKHARA_SETTINGS_OPTION,
		array(
			'type'              => 'array',
			'sanitize_callback' => 'cansakhara_sanitize_settings',
			'default'           => array(),
		)
	);
}
add_action( 'admin_init', 'cansakhara_register_settings' );

/**
 * Adds Settings → Can Sakhara.
 *
 * @return void
 */
function cansakhara_add_settings_page() {
	add_options_page(
		__( 'Can Sakhara', 'blueworx-client-cansakhara' ),
		__( 'Can Sakhara', 'blueworx-client-cansakhara' ),
		'manage_options',
		CANSAKHARA_SETTINGS_SLUG,
		'cansakhara_render_settings_page'
	);
}
add_action( 'admin_menu', 'cansakhara_add_settings_page' );

/**
 * Loads the design system and the chrome overrides on the settings screen only.
 *
 * @param string $hook_suffix Current admin screen.
 * @return void
 */
function cansakhara_enqueue_admin_assets( $hook_suffix ) {
	if ( 'settings_page_' . CANSAKHARA_SETTINGS_SLUG !== $hook_suffix ) {
		return;
	}

	blueworx_admin_design_enqueue();
	blueworx_admin_design_enqueue_icons();

	wp_enqueue_style(
		'cansakhara-admin',
		CANSAKHARA_URL . 'assets/css/admin.css',
		array( 'blueworx-admin-design' ),
		CANSAKHARA_VERSION
	);
}
add_action( 'admin_enqueue_scripts', 'cansakhara_enqueue_admin_assets' );

/**
 * Renders Settings → Can Sakhara from the blueworx-admin-design system.
 *
 * @return void
 */
function cansakhara_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$settings  = cansakhara_settings();
	$sureforms = cansakhara_sureforms_active();
	$forms     = $sureforms ? get_posts(
		array(
			'post_type'      => 'sureforms_form',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
		)
	) : array();
	$saved     = isset( $_GET['settings-updated'] ) && 'true' === $_GET['settings-updated']; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only flag set by options.php after a nonce-checked save.
	?>
	<div class="wrap bw-wrap">
		<?php // The form is the .bw-page itself, so the save bar is its last flex child and margin-top:auto pins it. ?>
		<form method="post" action="options.php" class="bw-admin bw-page">
			<?php settings_fields( 'cansakhara_settings_group' ); ?>
			<header class="bw-pagehead">
				<div class="bw-pagehead__titles">
					<p class="bw-pagehead__eyebrow"><?php esc_html_e( 'Can Sakhara', 'blueworx-client-cansakhara' ); ?></p>
					<h1 class="bw-pagehead__h1"><?php esc_html_e( 'Settings', 'blueworx-client-cansakhara' ); ?></h1>
					<p class="bw-pagehead__lede"><?php esc_html_e( 'Where guests go after they sign in, and which form the Enquire popup shows.', 'blueworx-client-cansakhara' ); ?></p>
				</div>
			</header>

			<div class="bw-page__body bw-page__body--single">
				<div class="bw-panels">
					<?php if ( $saved ) : ?>
					<div class="bw-notice bw-notice--success" role="status">
						<i class="bw-icon bw-notice__icon" data-lucide="circle-check"></i>
						<div class="bw-notice__body">
							<p class="bw-notice__text"><?php esc_html_e( 'Settings saved.', 'blueworx-client-cansakhara' ); ?></p>
						</div>
					</div>
					<?php endif; ?>

					<section class="bw-card bw-settingscard">
						<div class="bw-card__head">
							<div class="bw-card__titles">
								<p class="bw-card__eyebrow"><?php esc_html_e( 'Guests', 'blueworx-client-cansakhara' ); ?></p>
								<h2 class="bw-card__title"><?php esc_html_e( 'Sign in', 'blueworx-client-cansakhara' ); ?></h2>
								<p class="bw-settingscard__desc"><?php esc_html_e( 'Guests sign in from the Login popup with the WordPress account you have given them.', 'blueworx-client-cansakhara' ); ?></p>
							</div>
						</div>
						<div class="bw-card__body bw-settingscard__body">
							<div class="bw-formrow">
								<label class="bw-formrow__label" for="cansakhara-login-redirect"><?php esc_html_e( 'After login, send guests to', 'blueworx-client-cansakhara' ); ?></label>
								<div class="bw-formrow__control">
									<span class="bw-select">
										<?php
										wp_dropdown_pages(
											array(
												'name'              => CANSAKHARA_SETTINGS_OPTION . '[login_redirect]',
												'id'                => 'cansakhara-login-redirect',
												'class'             => 'bw-select__el',
												'selected'          => $settings['login_redirect'],
												'show_option_none'  => __( 'Home page', 'blueworx-client-cansakhara' ),
												'option_none_value' => '0',
											)
										);
										?>
										<i class="bw-icon bw-icon--14 bw-select__arrow" data-lucide="chevron-down"></i>
									</span>
									<p class="bw-formrow__help"><?php esc_html_e( 'The page a guest lands on once their details are accepted.', 'blueworx-client-cansakhara' ); ?></p>
								</div>
							</div>
						</div>
					</section>

					<section class="bw-card bw-settingscard">
						<div class="bw-card__head">
							<div class="bw-card__titles">
								<p class="bw-card__eyebrow"><?php esc_html_e( 'Enquiries', 'blueworx-client-cansakhara' ); ?></p>
								<h2 class="bw-card__title"><?php esc_html_e( 'Enquiry form', 'blueworx-client-cansakhara' ); ?></h2>
								<p class="bw-settingscard__desc"><?php esc_html_e( 'The Enquire popup shows this SureForms form, restyled to match the site.', 'blueworx-client-cansakhara' ); ?></p>
							</div>
						</div>
						<div class="bw-card__body bw-settingscard__body">
							<div class="bw-formrow">
								<label class="bw-formrow__label" for="cansakhara-enquiry-form"><?php esc_html_e( 'Enquiry form', 'blueworx-client-cansakhara' ); ?></label>
								<div class="bw-formrow__control">
									<span class="bw-select">
										<select
											name="<?php echo esc_attr( CANSAKHARA_SETTINGS_OPTION ); ?>[enquiry_form]"
											id="cansakhara-enquiry-form"
											class="bw-select__el"
											aria-describedby="cansakhara-enquiry-form-help"
											<?php disabled( ! $sureforms ); ?>
										>
											<option value="0"><?php esc_html_e( 'None', 'blueworx-client-cansakhara' ); ?></option>
											<?php foreach ( $forms as $form ) : ?>
											<option value="<?php echo esc_attr( (string) $form->ID ); ?>" <?php selected( $settings['enquiry_form'], $form->ID ); ?>>
												<?php echo esc_html( get_the_title( $form ) ); ?>
											</option>
											<?php endforeach; ?>
										</select>
										<i class="bw-icon bw-icon--14 bw-select__arrow" data-lucide="chevron-down"></i>
									</span>
									<p class="bw-formrow__help" id="cansakhara-enquiry-form-help">
										<?php
										if ( $sureforms ) {
											esc_html_e( 'Until a form is chosen, the popup shows an email link instead.', 'blueworx-client-cansakhara' );
										} else {
											esc_html_e( 'Install and activate SureForms to choose a form. Until then the popup shows an email link instead.', 'blueworx-client-cansakhara' );
										}
										?>
									</p>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>

			<div class="bw-savebar">
				<p class="bw-savebar__hint">
					<i class="bw-icon bw-icon--14" data-lucide="info"></i>
					<?php esc_html_e( 'Changes apply as soon as you save.', 'blueworx-client-cansakhara' ); ?>
				</p>
				<button type="submit" class="bw-btn bw-btn--primary"><?php esc_html_e( 'Save changes', 'blueworx-client-cansakhara' ); ?></button>
			</div>
		</form>
	</div>
	<?php
}
```

Note the `disabled()` on the SureForms select: a disabled control is not submitted, so a save with SureForms inactive leaves `enquiry_form` at 0 via the sanitiser's default. That is the intended behaviour.

- [ ] **Step 6: Write `assets/css/admin.css`** (chrome overrides only — nothing else may go in this file)

```css
/* Settings → Can Sakhara is a full-bleed blueworx-admin-design screen. These
   are the only rules the design system allows a plugin to keep of its own:
   dropping WordPress's chrome padding on this one screen. Everything visual
   comes from assets/blueworx-admin-design.css. */
.wrap.bw-wrap { margin: 0; }
body.settings_page_cansakhara #wpcontent { padding-left: 0; }
body.settings_page_cansakhara #wpbody-content { padding-bottom: 0; }
body.settings_page_cansakhara #wpfooter { display: none; }
```

- [ ] **Step 7: Wire it up**

In `blueworx-client-cansakhara.php`, after the existing `require_once` lines for `includes/`, add:

```php
// The design system registrar must load at top level, before any hook — see
// the header comment in that file.
require_once CANSAKHARA_DIR . 'assets/blueworx-admin-design.php';
require_once CANSAKHARA_DIR . 'includes/settings.php';
```

In `scripts/build-zip.mjs` `ALLOW`, after `'assets/fonts',` add:

```js
	// The admin design system, shipped verbatim (CI compares each against the
	// foundation), plus the one chrome-override stylesheet the settings
	// screen is allowed to carry.
	'assets/blueworx-admin-design.css',
	'assets/blueworx-admin-design.php',
	'assets/blueworx-admin-icons.js',
	'assets/css/admin.css',
```

In `uninstall.php`, after `delete_option( 'cansakhara_version' );` add `delete_option( 'cansakhara_settings' );`.

- [ ] **Step 8: Run the settings test**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test tests/settings.spec.js --workers=1`
Expected: 3 passed. Also open `http://127.0.0.1:8881/wp-admin/options-general.php?page=cansakhara` in the Playwright MCP browser and take a screenshot: Sora title, two white cards on the grey canvas, a sticky save bar, no WordPress `.wrap` margin. Fix anything that looks off before committing.

- [ ] **Step 9: Commit**

```bash
git add .claude/skills/blueworx-admin-design assets/blueworx-admin-design.css assets/blueworx-admin-design.php assets/blueworx-admin-icons.js assets/fonts assets/css/admin.css includes/settings.php blueworx-client-cansakhara.php scripts/build-zip.mjs uninstall.php tests/helpers/wp.js tests/settings.spec.js
git commit -m "Add the settings screen for the login destination and enquiry form

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: The Welcome page

**Files:**
- Modify: `includes/pages.php` (`cansakhara_pages()`, `cansakhara_install_pages()`)
- Modify: `blueworx-client-cansakhara.php` (upgrade routine)
- Create: `templates/pages/welcome.php`
- Asset (already downloaded, untracked): `assets/img/welcome-bg.jpg`
- Test: `tests/welcome.spec.js`, `tests/pages.spec.js`

**Interfaces:**
- Consumes: `cansakhara_document_open()`, `cansakhara_document_close()`, `cansakhara_part()` from `includes/render.php`.
- Produces: owned slug `welcome`; `cansakhara_install_pages( bool $set_front_page = true )`. The template calls `cansakhara_part( 'popups' )`, which Task 3 creates — until then the call is a silent no-op (`cansakhara_part` returns when the file is missing).

- [ ] **Step 1: Write the failing test**

Create `tests/welcome.spec.js`:

```js
import { test, expect } from '@playwright/test';

test('the welcome page exists and is rendered by the plugin', async ({ page }) => {
  const response = await page.goto('/welcome/');
  expect(response.status()).toBe(200);
  await expect(page.locator('body')).toHaveClass(/page-cansakhara-welcome/);
  await expect(page.locator('body')).toHaveClass(/cansakhara-theme-welcome/);
});

test('the welcome page shows the mark, wordmark, IBIZA and both buttons', async ({ page }) => {
  await page.goto('/welcome/');
  await expect(page.locator('img[src*="logo-white.svg"]')).toBeVisible();
  await expect(page.locator('img[alt="Can Sakhara"]')).toBeVisible();
  await expect(page.getByText('Ibiza', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toHaveAttribute('data-cansakhara-popup-open', 'login');
  await expect(page.getByRole('button', { name: 'Enquire' })).toHaveAttribute('data-cansakhara-popup-open', 'enquire');
  // No site header, footer or side nav on the splash.
  await expect(page.locator('[data-cansakhara-header]')).toHaveCount(0);
  await expect(page.locator('footer')).toHaveCount(0);
});

test('the welcome page is not the front page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/page-cansakhara-home/);
});
```

In `tests/pages.spec.js` change the first test's list to `['/', '/by-day/', '/by-night/', '/welcome/']` and its title to `'the four plugin pages are reachable'`.

- [ ] **Step 2: Run it to confirm it fails**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/welcome.spec.js tests/pages.spec.js --workers=1`
Expected: the welcome tests FAIL (404 — the harness's WordPress "Nothing here" page).

- [ ] **Step 3: Register the page**

In `includes/pages.php`, add to the array in `cansakhara_pages()` after `'by-night'`:

```php
		'welcome'  => array(
			'title'       => __( 'Welcome', 'blueworx-client-cansakhara' ),
			'template'    => 'pages/welcome.php',
			'description' => __( 'Sign in for private access to Can Sakhara, or enquire about availability.', 'blueworx-client-cansakhara' ),
		),
```

Update the docblock of `cansakhara_page_url()`: `@param string $slug Owned-page slug: 'home', 'by-day', 'by-night' or 'welcome'.`

Change `cansakhara_install_pages()` to take a flag, so the upgrade routine can create a missing page without re-imposing the front page on a site that changed it:

```php
/**
 * Creates any missing owned pages, stamps them, and (on activation) sets the
 * front page.
 *
 * Idempotent: an existing stamped page is reused rather than duplicated, so
 * reactivating the plugin never leaves a second copy behind.
 *
 * @param bool $set_front_page Whether to point the site's front page at the
 *                             owned home page. True on activation; false when
 *                             an update merely adds a page.
 * @return void
 */
function cansakhara_install_pages( $set_front_page = true ) {
```

and guard the last block:

```php
	if ( $set_front_page && isset( $ids['home'] ) && $ids['home'] > 0 ) {
```

- [ ] **Step 4: Add the upgrade routine**

In `blueworx-client-cansakhara.php`, after `register_activation_hook(...)`:

```php
/**
 * Creates pages added by an update, on sites that never reactivate.
 *
 * Updates arrive through the update checker, which does not fire the
 * activation hook — so a page added in a later version would never exist on
 * an existing site. Runs on the first request after an update, front end or
 * admin, and never touches the front-page setting.
 *
 * @return void
 */
function cansakhara_maybe_upgrade() {
	if ( get_option( 'cansakhara_version' ) === CANSAKHARA_VERSION ) {
		return;
	}

	cansakhara_install_pages( false );
	update_option( 'cansakhara_version', CANSAKHARA_VERSION );
}
add_action( 'init', 'cansakhara_maybe_upgrade' );
```

Also have `cansakhara_activate()` record the version: add `update_option( 'cansakhara_version', CANSAKHARA_VERSION );` after `cansakhara_install_pages();`.

- [ ] **Step 5: Write `templates/pages/welcome.php`**

Figma `1:30`: 1440×900 frame; mark centred at y = 450−106.5, wordmark 379×29 at y = 416, IBIZA at y = 494, LOGIN / ENQUIRE baselines at y = 805 (≈ 95px from the bottom), centres ≈ 276px apart.

```php
<?php
/**
 * Welcome page — the red splash from Figma frame LOGIN 01 (1:30).
 *
 * No header, footer or side nav: the page is the mark, the wordmark, IBIZA
 * and two buttons that open the Login and Enquire popups. The popups part
 * is included directly because there is no header here to bring it in.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

cansakhara_document_open( array( 'theme' => 'welcome' ) );
?>
<main
	id="content"
	class="site-shell relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#5b0a00] bg-cover bg-center text-white"
	style="background-image: url('<?php echo esc_url( CANSAKHARA_URL . 'assets/img/welcome-bg.jpg' ); ?>')"
>
	<div class="flex -translate-y-[40px] flex-col items-center gap-[24px] md:-translate-y-[60px] md:gap-[38px]">
		<img
			src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/logo-white.svg' ); ?>"
			alt=""
			width="55"
			height="55"
			class="size-[40px] md:size-[55px]"
		/>
		<img
			src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/hero-wordmark.svg' ); ?>"
			alt="Can Sakhara"
			width="379"
			height="29"
			class="h-auto w-[240px] md:w-[379px]"
		/>
		<p class="font-display text-[14px] uppercase leading-none tracking-[16px] indent-[16px] text-[#bf2c08] md:text-[22px] md:tracking-[33px] md:indent-[33px]">
			Ibiza
		</p>
	</div>

	<div class="absolute inset-x-0 bottom-[60px] flex items-center justify-center gap-[64px] md:bottom-[95px] md:gap-[200px]">
		<button
			type="button"
			data-cansakhara-popup-open="login"
			aria-haspopup="dialog"
			aria-expanded="false"
			aria-controls="cansakhara-popup-login"
			class="font-display text-[14px] font-light uppercase leading-none tracking-[6px] indent-[6px] text-white transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:text-[18px] md:tracking-[8.1px] md:indent-[8.1px]"
		>
			Login
		</button>
		<button
			type="button"
			data-cansakhara-popup-open="enquire"
			aria-haspopup="dialog"
			aria-expanded="false"
			aria-controls="cansakhara-popup-enquire"
			class="font-display text-[14px] font-thin uppercase leading-none tracking-[6px] indent-[6px] text-white transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:text-[18px] md:tracking-[8.1px] md:indent-[8.1px]"
		>
			Enquire
		</button>
	</div>
</main>
<?php
cansakhara_part( 'popups' );
cansakhara_document_close();
```

- [ ] **Step 6: Build, then run the tests**

Run: `npm run build`, then `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/welcome.spec.js tests/pages.spec.js --workers=1`
Expected: all pass. (The harness already has the plugin active; the `init` upgrade routine creates the page on the first request because the stored version is empty.) Open `/welcome/` in the Playwright MCP browser at 1440×900 and screenshot: compare against the Figma render — red textured background, white mark and wordmark, red IBIZA, two white buttons near the bottom.

- [ ] **Step 7: Commit**

```bash
git add includes/pages.php blueworx-client-cansakhara.php templates/pages/welcome.php assets/img/welcome-bg.jpg assets/css/public.css tests/welcome.spec.js tests/pages.spec.js
git commit -m "Add the Welcome splash page

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: The popups — markup and behaviour

**Files:**
- Create: `templates/parts/popups.php`, `assets/js/src/popups.js`
- Modify: `assets/js/src/main.js`, `templates/parts/header.php`, `templates/parts/menu-drawer.php`
- Test: `tests/popups.spec.js`, `tests/chrome.spec.js`, `tests/content.spec.js`

**Interfaces:**
- Consumes: `cansakhara_part()`; from Task 1 `cansakhara_login_redirect_url()`; from later tasks `cansakhara_enquiry_form()` (Task 5) and `cansakhara_login_error()` (Task 4) — this task creates stubs for both so the part renders now.
- Produces: markup contract — `[data-cansakhara-popup="login|enquire"]` panels; `[data-cansakhara-popup-open="login|enquire"]` triggers anywhere; `[data-cansakhara-popup-close]` inside a panel; `[data-cansakhara-popup-auto]` on a panel means "open on load"; `[data-cansakhara-login-form]`, `[data-cansakhara-login-error]`. JS export `initPopups()`.

- [ ] **Step 1: Write the failing tests**

Create `tests/popups.spec.js`:

```js
import { test, expect } from '@playwright/test';

const login = (page) => page.locator('[data-cansakhara-popup="login"]');
const enquire = (page) => page.locator('[data-cansakhara-popup="enquire"]');

test('both popups are present and closed on load', async ({ page }) => {
  await page.goto('/welcome/');
  await expect(login(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(login(page)).not.toBeVisible();
});

test('LOGIN opens the login popup, focuses its heading, Escape closes and returns focus', async ({ page }) => {
  await page.goto('/welcome/');
  const trigger = page.getByRole('button', { name: 'Login' });
  await trigger.click();
  await expect(login(page)).toHaveAttribute('aria-hidden', 'false');
  await expect(login(page).getByRole('heading', { name: 'Login' })).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await page.keyboard.press('Escape');
  await expect(login(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('the close button closes the enquire popup', async ({ page }) => {
  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Enquire' }).click();
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'false');
  await enquire(page).locator('[data-cansakhara-popup-close]').click();
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'true');
});

test('"request private access password" swaps login for enquire', async ({ page }) => {
  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Login' }).click();
  await login(page).getByRole('button', { name: /request private access password/i }).click();
  await expect(login(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'false');
});

test('Tab stays inside an open popup', async ({ page }) => {
  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Login' }).click();
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() =>
      document.activeElement.closest('[data-cansakhara-popup="login"]') !== null
    );
    expect(inside).toBe(true);
  }
});

test('the header Enquire button opens the enquire popup on the home page and locks scroll', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-cansakhara-header]').getByRole('button', { name: 'Enquire' }).click();
  await expect(enquire(page)).toHaveAttribute('aria-hidden', 'false');
  const locked = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.site-shell')).overflow
  );
  expect(locked).toBe('hidden');
  await page.keyboard.press('Escape');
  const unlocked = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.site-shell')).overflow
  );
  expect(unlocked).not.toBe('hidden');
});

test('Login in the menu drawer closes the drawer and opens the login popup', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-cansakhara-menu-open]').click();
  await expect(page.locator('#site-menu')).toHaveAttribute('aria-hidden', 'false');
  await page.locator('#site-menu').getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#site-menu')).toHaveAttribute('aria-hidden', 'true');
  await expect(login(page)).toHaveAttribute('aria-hidden', 'false');
});
```

In `tests/chrome.spec.js`, replace the first test with:

```js
test('the header renders with its menu trigger and enquire button', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-cansakhara-header]')).toBeVisible();
  await expect(page.locator('[data-cansakhara-menu-open]')).toHaveAttribute('aria-expanded', 'false');
  await expect(
    page.locator('[data-cansakhara-header]').getByRole('button', { name: 'Enquire' })
  ).toHaveAttribute('data-cansakhara-popup-open', 'enquire');
});
```

`tests/content.spec.js` asserts a `mailto:` link on By Day / By Night — those in-page CTAs are unchanged, so that test still passes; leave it.

- [ ] **Step 2: Run to confirm they fail**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/popups.spec.js tests/chrome.spec.js --workers=1`
Expected: every popups test FAILS (no `[data-cansakhara-popup]` elements); the chrome test FAILS (Enquire is still a link).

- [ ] **Step 3: Add the two stubs the part needs**

Create `includes/login.php` (Task 4 fills it in):

```php
<?php
/**
 * Guest login: the REST route the popup posts to, and the no-JS fallback.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The login error to show in the popup on this request, or '' for none.
 *
 * @return string
 */
function cansakhara_login_error() {
	return '';
}
```

Create `includes/enquiry.php` (Task 5 fills it in):

```php
<?php
/**
 * The enquiry form inside the Enquire popup.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Prints the enquiry form, or the fallback when none is configured.
 *
 * @return void
 */
function cansakhara_enquiry_form() {
	?>
	<a
		href="mailto:reservations@cansakhara.com"
		class="cansakhara-popup-submit"
	>
		<?php esc_html_e( 'Email us', 'blueworx-client-cansakhara' ); ?>
	</a>
	<?php
}
```

Require both in `blueworx-client-cansakhara.php` after `includes/settings.php`:

```php
require_once CANSAKHARA_DIR . 'includes/login.php';
require_once CANSAKHARA_DIR . 'includes/enquiry.php';
```

- [ ] **Step 4: Write `templates/parts/popups.php`**

Figma `1:67` / `1:109`, both 1440×900: heading top 118; intro top 190, 443 wide; first field top 270 (login) / 290 (enquire); fields 54 tall, 20 apart; request link top 438; submit top 495 (login) / 664 (enquire); Mel de Magranetes 150×50 at top 771.

```php
<?php
/**
 * The Login and Enquire popups — Figma frames LOGIN 02 (1:67) and LOGIN 03
 * (1:109).
 *
 * Rendered on every owned page by the header part, and directly by the
 * Welcome template (which has no header). Both start closed; popups.js opens
 * them from any [data-cansakhara-popup-open] trigger.
 *
 * The one exception: after the no-JS login fallback redirects back with
 * ?cansakhara_login=failed, the login panel is rendered already open, with
 * its message, so the failure is visible even with no script running at
 * all. It also carries data-cansakhara-popup-auto so popups.js, when it does
 * run, adopts it as the open popup (scroll lock, Escape, focus trap).
 *
 * Closed state: opacity-0 + invisible + pointer-events-none. `invisible`
 * (visibility: hidden) keeps every control inside untabbable without
 * touching each one's tabindex, and still lets the opacity transition run.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$cansakhara_login_error = cansakhara_login_error();
$cansakhara_login_open  = '' !== $cansakhara_login_error;
$cansakhara_logged_in   = is_user_logged_in();

$cansakhara_panel_base  = 'cansakhara-popup fixed inset-0 z-[60] overflow-y-auto bg-[#5b0a00] text-white transition-[opacity,visibility] duration-300 ease-out';
$cansakhara_panel_class = $cansakhara_panel_base . ' opacity-0 invisible pointer-events-none';
$cansakhara_login_class = $cansakhara_login_open ? $cansakhara_panel_base . ' opacity-100 visible' : $cansakhara_panel_class;
$cansakhara_close_class = 'absolute right-[20px] top-[19px] grid size-[33px] place-items-center border border-white transition-colors duration-200 hover:bg-white hover:text-[#5b0a00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:right-[50px] md:top-[46px] md:size-[52px]';
$cansakhara_inner_class = 'flex min-h-full w-full flex-col items-center px-5 pb-[40px] pt-[90px] md:pb-[79px] md:pt-[118px]';
$cansakhara_title_class = 'font-display text-[24px] font-thin uppercase leading-none tracking-[9.6px] indent-[9.6px] outline-none md:text-[32px] md:tracking-[12.8px] md:indent-[12.8px]';
$cansakhara_intro_class = 'mt-[30px] w-full max-w-[443px] text-center font-serif text-[13px] font-light italic leading-[1.4] tracking-[1.3px] md:mt-[43px] md:text-[14px] md:tracking-[1.4px]';
$cansakhara_field_class = 'cansakhara-popup-field w-full bg-[#490500] px-8 py-4 text-center font-body text-[16px] font-light leading-[1.4] tracking-[0.8px] text-white placeholder:text-white focus:outline focus:outline-2 focus:outline-white/60';
$cansakhara_mark_class  = 'mt-auto h-[50px] w-[150px] pt-[40px] md:pt-[60px] box-content';
?>
<div
	data-cansakhara-popup="login"
	id="cansakhara-popup-login"
	role="dialog"
	aria-modal="true"
	aria-labelledby="cansakhara-popup-login-title"
	aria-hidden="<?php echo $cansakhara_login_open ? 'false' : 'true'; ?>"
	<?php echo $cansakhara_login_open ? 'data-cansakhara-popup-auto' : ''; ?>
	class="<?php echo esc_attr( $cansakhara_login_class ); ?>"
>
	<button type="button" data-cansakhara-popup-close aria-label="Close" class="<?php echo esc_attr( $cansakhara_close_class ); ?>">
		<svg aria-hidden="true" viewBox="0 0 17 17" class="size-[17px] stroke-current" fill="none" stroke-width="1.3">
			<path d="M1 1 16 16M16 1 1 16" />
		</svg>
	</button>

	<div class="<?php echo esc_attr( $cansakhara_inner_class ); ?>">
		<h2 id="cansakhara-popup-login-title" tabindex="-1" class="<?php echo esc_attr( $cansakhara_title_class ); ?>">Login</h2>

		<?php if ( $cansakhara_logged_in ) : ?>
		<p class="<?php echo esc_attr( $cansakhara_intro_class ); ?>">You’re signed in.</p>
		<a href="<?php echo esc_url( cansakhara_login_redirect_url() ); ?>" class="cansakhara-popup-submit mt-[40px] w-full max-w-[443px] md:mt-[60px]">Continue</a>
		<?php else : ?>
		<p class="<?php echo esc_attr( $cansakhara_intro_class ); ?>">Please enter your email address, and the private access password that was emailed to you.</p>

		<form
			method="post"
			action=""
			data-cansakhara-login-form
			class="mt-[40px] flex w-full max-w-[443px] flex-col gap-[20px] md:mt-[60px]"
		>
			<input type="hidden" name="cansakhara_action" value="login" />
			<label for="cansakhara-login-email" class="sr-only">Email</label>
			<input
				id="cansakhara-login-email"
				type="email"
				name="email"
				placeholder="Email"
				autocomplete="email"
				required
				class="<?php echo esc_attr( $cansakhara_field_class ); ?>"
			/>
			<label for="cansakhara-login-password" class="sr-only">Password</label>
			<input
				id="cansakhara-login-password"
				type="password"
				name="password"
				placeholder="Password"
				autocomplete="current-password"
				required
				class="<?php echo esc_attr( $cansakhara_field_class ); ?>"
			/>

			<p
				data-cansakhara-login-error
				role="alert"
				<?php echo '' === $cansakhara_login_error ? 'hidden' : ''; ?>
				class="text-center font-body text-[12px] tracking-[0.6px] text-white"
			><?php echo esc_html( $cansakhara_login_error ); ?></p>

			<button
				type="button"
				data-cansakhara-popup-open="enquire"
				class="mx-auto mt-[20px] font-display text-[12px] uppercase tracking-[1.2px] indent-[1.2px] underline underline-offset-4 transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
			>
				Request private access password
			</button>

			<button type="submit" class="cansakhara-popup-submit mt-[25px]">Submit</button>
		</form>
		<?php endif; ?>

		<img src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/mel-de-magranetes.svg' ); ?>" alt="Mel de Magranetes" width="150" height="50" class="<?php echo esc_attr( $cansakhara_mark_class ); ?>" />
	</div>
</div>

<div
	data-cansakhara-popup="enquire"
	id="cansakhara-popup-enquire"
	role="dialog"
	aria-modal="true"
	aria-labelledby="cansakhara-popup-enquire-title"
	aria-hidden="true"
	class="<?php echo esc_attr( $cansakhara_panel_class ); ?>"
>
	<button type="button" data-cansakhara-popup-close aria-label="Close" class="<?php echo esc_attr( $cansakhara_close_class ); ?>">
		<svg aria-hidden="true" viewBox="0 0 17 17" class="size-[17px] stroke-current" fill="none" stroke-width="1.3">
			<path d="M1 1 16 16M16 1 1 16" />
		</svg>
	</button>

	<div class="<?php echo esc_attr( $cansakhara_inner_class ); ?>">
		<h2 id="cansakhara-popup-enquire-title" tabindex="-1" class="<?php echo esc_attr( $cansakhara_title_class ); ?>">Enquire</h2>
		<p class="<?php echo esc_attr( $cansakhara_intro_class ); ?>">Let us know a few details and our team will personally assist you with availability, pricing, tailored recommendations and Private Web Access Password</p>

		<div class="mt-[40px] flex w-full max-w-[443px] flex-col gap-[20px] md:mt-[60px]">
			<?php cansakhara_enquiry_form(); ?>
		</div>

		<img src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/mel-de-magranetes.svg' ); ?>" alt="Mel de Magranetes" width="150" height="50" class="<?php echo esc_attr( $cansakhara_mark_class ); ?>" />
	</div>
</div>
```

`cansakhara-popup-submit` is a real class (not a Tailwind utility) because SureForms' submit button (Task 5) needs the same look and cannot take utility classes. Add it to `assets/css/src/app.css`, after the existing `@theme` blocks:

```css
/* The outlined SUBMIT from the popup frames (Figma 1:108 / 1:155). A class
   rather than utilities so the SureForms submit button can share it. */
@layer components {
  .cansakhara-popup-submit {
    display: inline-flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    border: 1px solid #42071a;
    padding: 16px 32px;
    font-family: var(--font-display), sans-serif;
    font-size: 14px;
    line-height: 1.4;
    letter-spacing: 5.6px;
    text-indent: 5.6px;
    text-transform: uppercase;
    color: #fff;
    background: transparent;
    cursor: pointer;
    transition: background-color 200ms ease-out;
  }
  .cansakhara-popup-submit:hover { background-color: #490500; }
  .cansakhara-popup-submit:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }
  .cansakhara-popup-submit:disabled { opacity: .5; cursor: wait; }
}
```

- [ ] **Step 5: Render the part from the header, and change the two triggers**

`templates/parts/header.php` — replace the Enquire `<a … mailto …>` block with a button carrying the same classes:

```php
		<div class="justify-self-end">
			<button
				type="button"
				data-cansakhara-popup-open="enquire"
				aria-haspopup="dialog"
				aria-expanded="false"
				aria-controls="cansakhara-popup-enquire"
				class="inline-flex items-center justify-center whitespace-nowrap border border-current px-4 py-[10px] font-display text-[10px] uppercase tracking-[4px] transition-colors duration-200 hover:bg-white hover:text-[#42081a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:px-8 md:py-4 md:text-[14px] md:tracking-[5.6px]"
			>
				Enquire
			</button>
		</div>
```

and at the bottom of `header.php`, after the `menu-drawer` part call:

```php
cansakhara_part( 'popups' );
```

Update the header's docblock: add a line "Also renders the Login/Enquire popups (templates/parts/popups.php), so they exist on every page that has a header."

`templates/parts/menu-drawer.php` — after the `<?php endforeach; ?>` closing the links loop, add one more `<li>`. Logged-out visitors get a Login trigger; logged-in ones get a Log out link. Both take the drawer link classes so they animate in with the rest:

```php
			<li>
				<?php if ( is_user_logged_in() ) : ?>
				<a
					href="<?php echo esc_url( wp_logout_url( home_url( '/' ) ) ); ?>"
					tabindex="-1"
					style="transition-delay: 0ms"
					class="block font-display text-[16px] font-light uppercase leading-[1.4] tracking-[3.2px] text-white transition-[opacity,translate,color] duration-500 ease-out hover:text-white/70 md:text-[21px] md:tracking-[4.2px] translate-y-3 opacity-0"
				>
					Log out
				</a>
				<?php else : ?>
				<button
					type="button"
					data-cansakhara-popup-open="login"
					tabindex="-1"
					style="transition-delay: 0ms"
					class="block font-display text-[16px] font-light uppercase leading-[1.4] tracking-[3.2px] text-white transition-[opacity,translate,color] duration-500 ease-out hover:text-white/70 md:text-[21px] md:tracking-[4.2px] translate-y-3 opacity-0"
				>
					Login
				</button>
				<?php endif; ?>
			</li>
```

In `assets/js/src/header.js`, the drawer animates `drawer.querySelectorAll( 'a[href]' )`. Change that selector to `'a[href], button[data-cansakhara-popup-open]'` so the new entry reveals and becomes tabbable with the others. Update the comment beside it: `// Drawer entries: the page links plus the Login trigger.`

- [ ] **Step 6: Write `assets/js/src/popups.js`**

```js
// Login / Enquire popups. Both panels are rendered closed by
// templates/parts/popups.php; this opens one from any
// [data-cansakhara-popup-open] trigger, traps Tab inside it, closes it on
// Escape or a [data-cansakhara-popup-close] click, and puts focus back where
// it came from. Only one popup is ever open: opening the other swaps them.
//
// Deliberately no GSAP — the popups have to work when the motion layer does
// not, so the transition is CSS only.

const OPEN_CLASSES = [ 'opacity-100', 'visible' ];
const CLOSED_CLASSES = [ 'opacity-0', 'invisible', 'pointer-events-none' ];
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initPopups() {
	const panels = Array.from( document.querySelectorAll( '[data-cansakhara-popup]' ) );
	if ( ! panels.length ) return null;

	let current = null;
	let opener = null;
	let overflowRestore = null;

	function scroller() {
		return document.querySelector( '.site-shell' ) || document.body;
	}

	function panelFor( name ) {
		return panels.find( ( p ) => p.getAttribute( 'data-cansakhara-popup' ) === name ) || null;
	}

	function setExpanded( trigger, value ) {
		if ( trigger && trigger.hasAttribute( 'aria-expanded' ) ) {
			trigger.setAttribute( 'aria-expanded', value ? 'true' : 'false' );
		}
	}

	function closeDrawerIfOpen() {
		const drawer = document.getElementById( 'site-menu' );
		if ( drawer && drawer.getAttribute( 'aria-hidden' ) === 'false' ) {
			drawer.querySelector( '[data-cansakhara-menu-close]' )?.click();
		}
	}

	function open( name, trigger ) {
		const panel = panelFor( name );
		if ( ! panel ) return;

		// Swapping: keep the original opener so focus returns to the page,
		// not to a button inside the popup that is about to close.
		if ( current && current !== panel ) {
			hide( current );
		} else if ( ! current ) {
			closeDrawerIfOpen();
			opener = trigger || null;
			const el = scroller();
			overflowRestore = el.style.overflow;
			el.style.overflow = 'hidden';
			document.addEventListener( 'keydown', onKeydown );
		}

		current = panel;
		panel.classList.remove( ...CLOSED_CLASSES );
		panel.classList.add( ...OPEN_CLASSES );
		panel.setAttribute( 'aria-hidden', 'false' );
		setExpanded( opener, true );

		const heading = panel.querySelector( 'h2[tabindex="-1"]' );
		heading?.focus( { preventScroll: true } );
	}

	function hide( panel ) {
		panel.classList.remove( ...OPEN_CLASSES );
		panel.classList.add( ...CLOSED_CLASSES );
		panel.setAttribute( 'aria-hidden', 'true' );
	}

	function close() {
		if ( ! current ) return;
		hide( current );
		current = null;

		const el = scroller();
		el.style.overflow = overflowRestore ?? '';
		overflowRestore = null;
		document.removeEventListener( 'keydown', onKeydown );

		setExpanded( opener, false );
		opener?.focus();
		opener = null;
	}

	function onKeydown( event ) {
		if ( ! current ) return;

		if ( event.key === 'Escape' ) {
			event.preventDefault();
			close();
			return;
		}

		if ( event.key !== 'Tab' ) return;

		const items = Array.from( current.querySelectorAll( FOCUSABLE ) )
			.filter( ( el ) => el.offsetParent !== null );
		if ( ! items.length ) {
			event.preventDefault();
			return;
		}
		const first = items[ 0 ];
		const last = items[ items.length - 1 ];
		const active = document.activeElement;

		if ( event.shiftKey && ( active === first || ! current.contains( active ) ) ) {
			event.preventDefault();
			last.focus();
		} else if ( ! event.shiftKey && ( active === last || ! current.contains( active ) ) ) {
			event.preventDefault();
			first.focus();
		}
	}

	document.addEventListener( 'click', ( event ) => {
		const trigger = event.target.closest( '[data-cansakhara-popup-open]' );
		if ( trigger ) {
			event.preventDefault();
			open( trigger.getAttribute( 'data-cansakhara-popup-open' ), trigger );
			return;
		}
		if ( event.target.closest( '[data-cansakhara-popup-close]' ) ) {
			close();
		}
	} );

	// The no-JS login fallback redirects back with the popup marked to reopen.
	const auto = panels.find( ( p ) => p.hasAttribute( 'data-cansakhara-popup-auto' ) );
	if ( auto ) {
		open( auto.getAttribute( 'data-cansakhara-popup' ), null );
	}

	return { open, close };
}
```

In `assets/js/src/main.js` add `import { initPopups } from './popups.js';` and call `initPopups();` right after `initHeader();`. Update the entry comment's "all three pages" to "every owned page".

Note on the `header.js` Tab handling: the drawer has no Tab trap of its own, so there is nothing to conflict with. Escape: the drawer's Escape listener is removed when it closes (which `closeDrawerIfOpen()` does before the popup opens), so the two never both listen.

- [ ] **Step 7: Build, run the tests, look at it**

Run: `npm run build`, then `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/popups.spec.js tests/chrome.spec.js --workers=1`
Expected: all pass. Then open `/welcome/` in the Playwright MCP browser at 1440×900, click LOGIN, screenshot; click the request link, screenshot the Enquire popup. Compare with the Figma renders (heading at the top, italic intro, dark-red fields, outlined SUBMIT, mark at the bottom). Resize to 400 wide and screenshot both again — nothing may overflow horizontally.

- [ ] **Step 8: Commit**

```bash
git add templates/parts/popups.php templates/parts/header.php templates/parts/menu-drawer.php includes/login.php includes/enquiry.php blueworx-client-cansakhara.php assets/js/src/popups.js assets/js/src/main.js assets/js/src/header.js assets/css/src/app.css assets/css/public.css assets/js/public.js tests/popups.spec.js tests/chrome.spec.js
git commit -m "Add the Login and Enquire popups and open them from the header, drawer and Welcome page

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Login — REST route, no-JS fallback, background submit

**Files:**
- Modify: `includes/login.php` (replace the stub), `includes/assets.php` (script data), `assets/js/src/main.js`
- Create: `assets/js/src/login.js`
- Test: `tests/login.spec.js`

**Interfaces:**
- Consumes: `cansakhara_login_redirect_url()` (Task 1); `cansakhara_is_owned_request()` (`includes/assets.php`); markup from Task 3.
- Produces: `POST /wp-json/cansakhara/v1/login` `{email, password}` → `200 {redirect}` or `403 {code:"cansakhara_login_failed", message}`; `cansakhara_attempt_login( string $email, string $password )` → `WP_User|WP_Error`; `cansakhara_login_error()` now real; `window.cansakharaLogin = { endpoint, genericError }`; JS export `initLoginForm()`.

- [ ] **Step 1: Write the failing test**

Create `tests/login.spec.js`:

```js
import { test, expect } from '@playwright/test';
import { loginAsAdmin, logout, adminEmail, adminPassword, setSettings } from './helpers/wp.js';

const GENERIC = 'Those details didn’t match. Please try again.';

let email;

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);
  email = await adminEmail(page);
  await logout(page);
});

test('the REST route rejects wrong details with one generic message', async ({ page }) => {
  const response = await page.request.post('/wp-json/cansakhara/v1/login', {
    data: { email, password: 'definitely-wrong' },
  });
  expect(response.status()).toBe(403);
  const body = await response.json();
  expect(body.message).toBe(GENERIC);
  // Never WordPress's own wording, which reveals whether the address exists.
  expect(JSON.stringify(body)).not.toMatch(/incorrect|unknown email|invalid_username|invalid_email/i);
});

test('a wrong password keeps the popup open and shows the message', async ({ page }) => {
  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.fill('#cansakhara-login-email', email);
  await page.fill('#cansakhara-login-password', 'definitely-wrong');
  await page.locator('[data-cansakhara-login-form] button[type="submit"]').click();

  await expect(page.locator('[data-cansakhara-login-error]')).toHaveText(GENERIC);
  await expect(page.locator('[data-cansakhara-popup="login"]')).toHaveAttribute('aria-hidden', 'false');
  expect(new URL(page.url()).pathname).toBe('/welcome/');
  await expect(page.locator('#cansakhara-login-email')).toHaveValue(email);
});

test('the right password sends the guest to the front page when nothing is chosen', async ({ page }) => {
  await loginAsAdmin(page);
  await setSettings(page, { loginRedirect: 'Home page' });
  await logout(page);

  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.fill('#cansakhara-login-email', email);
  await page.fill('#cansakhara-login-password', adminPassword());
  await page.locator('[data-cansakhara-login-form] button[type="submit"]').click();

  await page.waitForURL((url) => url.pathname === '/');
  await expect(page.locator('body')).toHaveClass(/page-cansakhara-home/);
});

test('the right password sends the guest to the chosen page', async ({ page }) => {
  await loginAsAdmin(page);
  await setSettings(page, { loginRedirect: 'By Day' });
  await logout(page);

  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.fill('#cansakhara-login-email', email);
  await page.fill('#cansakhara-login-password', adminPassword());
  await page.locator('[data-cansakhara-login-form] button[type="submit"]').click();

  await page.waitForURL(/\/by-day\//);
  await expect(page.locator('body')).toHaveClass(/page-cansakhara-by-day/);

  await loginAsAdmin(page);
  await setSettings(page, { loginRedirect: 'Home page' });
});

test('a signed-in visitor sees the signed-in state instead of the form', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Login' }).click();
  const popup = page.locator('[data-cansakhara-popup="login"]');
  await expect(popup.getByText('You’re signed in.')).toBeVisible();
  await expect(popup.getByRole('link', { name: 'Continue' })).toBeVisible();
  await expect(popup.locator('[data-cansakhara-login-form]')).toHaveCount(0);
});

test('without JavaScript, a failed login redirects back with the popup open and the message', async ({ page }) => {
  const response = await page.request.post('/welcome/', {
    form: { cansakhara_action: 'login', email, password: 'definitely-wrong' },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(302);
  const location = response.headers()['location'];
  expect(location).toContain('cansakhara_login=failed');

  await page.goto(location);
  await expect(page.locator('[data-cansakhara-popup="login"]')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('[data-cansakhara-login-error]')).toHaveText(GENERIC);
});

test('without JavaScript, a successful login redirects to the destination', async ({ page }) => {
  const response = await page.request.post('/welcome/', {
    form: { cansakhara_action: 'login', email, password: adminPassword() },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(302);
  expect(new URL(response.headers()['location']).pathname).toBe('/');
});
```

- [ ] **Step 2: Run to confirm it fails**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test tests/login.spec.js --workers=1`
Expected: REST test FAILS (404 `rest_no_route`); wrong-password test FAILS (a native POST reloads the page — popup closed); redirect tests FAIL; the signed-in test PASSES already (Task 3 markup); no-JS tests FAIL (200, not 302).

- [ ] **Step 3: Replace `includes/login.php`**

```php
<?php
/**
 * Guest login: the REST route the popup posts to, and the no-JS fallback.
 *
 * There is deliberately no nonce on either path. WordPress's own wp-login.php
 * has none, and a nonce printed into a page that a caching plugin serves for
 * a day goes stale and locks every guest out. Nothing here is more exposed
 * than core's login form; brute-force protection is the host's job, as it is
 * for wp-login.php.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The one message a failed login ever shows.
 *
 * WordPress's own errors say whether the address exists; this does not.
 *
 * @return string
 */
function cansakhara_login_failed_message() {
	return __( 'Those details didn’t match. Please try again.', 'blueworx-client-cansakhara' );
}

/**
 * Signs a guest in with their email address and password.
 *
 * @param string $email    Email address (WordPress accepts it as the login).
 * @param string $password Password, untouched.
 * @return WP_User|WP_Error The signed-in user, or a generic error.
 */
function cansakhara_attempt_login( $email, $password ) {
	$email = sanitize_email( (string) $email );

	if ( '' === $email || '' === (string) $password ) {
		return new WP_Error( 'cansakhara_login_failed', cansakhara_login_failed_message() );
	}

	$user = wp_signon(
		array(
			'user_login'    => $email,
			'user_password' => (string) $password,
			'remember'      => false,
		),
		is_ssl()
	);

	if ( is_wp_error( $user ) ) {
		return new WP_Error( 'cansakhara_login_failed', cansakhara_login_failed_message() );
	}

	wp_set_current_user( $user->ID );

	return $user;
}

/**
 * Registers POST cansakhara/v1/login.
 *
 * @return void
 */
function cansakhara_register_login_route() {
	register_rest_route(
		'cansakhara/v1',
		'/login',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'cansakhara_rest_login',
			'permission_callback' => '__return_true',
			'args'                => array(
				'email'    => array(
					'required' => true,
					'type'     => 'string',
				),
				'password' => array(
					'required' => true,
					'type'     => 'string',
				),
			),
		)
	);
}
add_action( 'rest_api_init', 'cansakhara_register_login_route' );

/**
 * Handles the popup's background login.
 *
 * @param WP_REST_Request $request Request with 'email' and 'password'.
 * @return WP_REST_Response|WP_Error
 */
function cansakhara_rest_login( WP_REST_Request $request ) {
	$user = cansakhara_attempt_login( $request->get_param( 'email' ), $request->get_param( 'password' ) );

	if ( is_wp_error( $user ) ) {
		$user->add_data( array( 'status' => 403 ) );
		return $user;
	}

	return new WP_REST_Response( array( 'redirect' => cansakhara_login_redirect_url() ), 200 );
}

/**
 * The no-JS path: the popup's form posts to the page it is on.
 *
 * Only owned pages render the form, so only they accept the post. Success
 * redirects to the configured destination; failure redirects back to the
 * same page with ?cansakhara_login=failed, which renders the popup open with
 * the message (see cansakhara_login_error()).
 *
 * @return void
 */
function cansakhara_handle_login_post() {
	if ( ! cansakhara_is_owned_request() ) {
		return;
	}

	if ( ! isset( $_POST['cansakhara_action'] ) || 'login' !== $_POST['cansakhara_action'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- see the file header: login forms carry no nonce, as core's does not.
		return;
	}

	$email    = isset( $_POST['email'] ) ? wp_unslash( $_POST['email'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitised inside cansakhara_attempt_login().
	$password = isset( $_POST['password'] ) ? wp_unslash( $_POST['password'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- a password must reach wp_signon() untouched.

	$user = cansakhara_attempt_login( $email, $password );

	if ( is_wp_error( $user ) ) {
		wp_safe_redirect( add_query_arg( 'cansakhara_login', 'failed', get_permalink( get_queried_object_id() ) ) );
		exit;
	}

	wp_safe_redirect( cansakhara_login_redirect_url() );
	exit;
}
add_action( 'template_redirect', 'cansakhara_handle_login_post' );

/**
 * The login error to show in the popup on this request, or '' for none.
 *
 * @return string
 */
function cansakhara_login_error() {
	if ( isset( $_GET['cansakhara_login'] ) && 'failed' === $_GET['cansakhara_login'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a display flag set by this plugin's own redirect; it only selects a fixed string.
		return cansakhara_login_failed_message();
	}

	return '';
}
```

- [ ] **Step 4: Give the bundle its endpoint**

In `includes/assets.php`, inside `cansakhara_enqueue_assets()` after the `wp_enqueue_script( 'cansakhara-public', … )` call:

```php
	wp_localize_script(
		'cansakhara-public',
		'cansakharaLogin',
		array(
			'endpoint'     => rest_url( 'cansakhara/v1/login' ),
			'genericError' => cansakhara_login_failed_message(),
		)
	);
```

- [ ] **Step 5: Write `assets/js/src/login.js`**

```js
// Background submit for the login popup's form, so a wrong password keeps
// the popup open with a message instead of reloading the page. Without this
// script (or with it broken by an optimiser), the form still posts natively
// and includes/login.php handles it the same way.
export function initLoginForm() {
	const form = document.querySelector( '[data-cansakhara-login-form]' );
	const config = window.cansakharaLogin;
	if ( ! form || ! config || ! config.endpoint ) return;

	const error = form.querySelector( '[data-cansakhara-login-error]' );
	const submit = form.querySelector( 'button[type="submit"]' );

	function showError( message ) {
		if ( ! error ) return;
		error.textContent = message;
		error.hidden = false;
	}

	form.addEventListener( 'submit', async ( event ) => {
		event.preventDefault();
		if ( error ) error.hidden = true;
		if ( submit ) submit.disabled = true;

		try {
			const response = await fetch( config.endpoint, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify( {
					email: form.elements.email.value,
					password: form.elements.password.value,
				} ),
			} );
			const data = await response.json().catch( () => ( {} ) );

			if ( response.ok && data.redirect ) {
				window.location.assign( data.redirect );
				return;
			}
			showError( data.message || config.genericError );
		} catch ( e ) {
			showError( config.genericError );
		} finally {
			if ( submit ) submit.disabled = false;
		}
	} );
}
```

In `assets/js/src/main.js` add `import { initLoginForm } from './login.js';` and call `initLoginForm();` after `initPopups();`.

- [ ] **Step 6: Build and run the tests**

Run: `npm run build`, then `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test tests/login.spec.js --workers=1`
Expected: 7 passed.

If the no-JS test's 302 comes back as 200: the harness's PHP built-in server may route `POST /welcome/` through `index.php` fine, but check `.wp-test/php-server.log` for the request line and make sure `cansakhara_is_owned_request()` is true there (`is_singular('page')` on a POST is unaffected).

- [ ] **Step 7: Commit**

```bash
git add includes/login.php includes/assets.php assets/js/src/login.js assets/js/src/main.js assets/js/public.js assets/css/public.css tests/login.spec.js
git commit -m "Sign guests in from the login popup and send them to the chosen page

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Enquire — the SureForms form, its styling, and the fallback

**Files:**
- Modify: `includes/enquiry.php` (replace the stub), `assets/css/src/app.css`
- Test: `tests/enquire.spec.js`; a manual check with SureForms installed in the harness

**Interfaces:**
- Consumes: `cansakhara_enquiry_form_id()`, `cansakhara_sureforms_active()`, `cansakhara_settings_url()` (Task 1); `cansakhara_keep_styles` filter (`includes/assets.php`).
- Produces: `cansakhara_enquiry_form()` prints the form or the fallback.

- [ ] **Step 1: Write the failing test**

Create `tests/enquire.spec.js`:

```js
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/wp.js';

const enquire = (page) => page.locator('[data-cansakhara-popup="enquire"]');

test('with no form chosen, the enquire popup offers the email link and no settings hint to guests', async ({ page }) => {
  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Enquire' }).click();
  await expect(enquire(page).getByRole('link', { name: 'Email us' })).toHaveAttribute(
    'href', 'mailto:reservations@cansakhara.com'
  );
  await expect(enquire(page).locator('[data-cansakhara-enquiry-hint]')).toHaveCount(0);
});

test('an administrator is pointed at the settings screen', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/welcome/');
  await page.getByRole('button', { name: 'Enquire' }).click();
  const hint = enquire(page).locator('[data-cansakhara-enquiry-hint]');
  await expect(hint).toBeVisible();
  await expect(hint.getByRole('link')).toHaveAttribute('href', /options-general\.php\?page=cansakhara/);
});
```

- [ ] **Step 2: Run to confirm the second test fails**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test tests/enquire.spec.js --workers=1`
Expected: first PASSES (stub already renders the link), second FAILS (no hint).

- [ ] **Step 3: Replace `includes/enquiry.php`**

```php
<?php
/**
 * The enquiry form inside the Enquire popup.
 *
 * The form itself is SureForms — the site owner picks which one in Settings →
 * Can Sakhara. This file renders it, keeps SureForms' stylesheets from being
 * swept off the page, and falls back to an email link so the popup is never a
 * dead end.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Whether a usable SureForms form is configured.
 *
 * @return bool
 */
function cansakhara_enquiry_form_ready() {
	$form_id = cansakhara_enquiry_form_id();

	return $form_id > 0
		&& cansakhara_sureforms_active()
		&& 'sureforms_form' === get_post_type( $form_id )
		&& 'publish' === get_post_status( $form_id );
}

/**
 * Prints the enquiry form, or the fallback when none is configured.
 *
 * @return void
 */
function cansakhara_enquiry_form() {
	if ( cansakhara_enquiry_form_ready() ) {
		echo do_shortcode( '[sureforms id="' . (int) cansakhara_enquiry_form_id() . '"]' );
		return;
	}
	?>
	<a href="mailto:reservations@cansakhara.com" class="cansakhara-popup-submit">
		<?php esc_html_e( 'Email us', 'blueworx-client-cansakhara' ); ?>
	</a>
	<?php if ( current_user_can( 'manage_options' ) ) : ?>
	<p data-cansakhara-enquiry-hint class="mt-[20px] text-center font-body text-[12px] tracking-[0.6px] text-white/80">
		<?php
		printf(
			/* translators: %s: link to the settings screen. */
			esc_html__( 'Guests see this email link until you choose a form under %s.', 'blueworx-client-cansakhara' ),
			'<a class="underline underline-offset-4" href="' . esc_url( cansakhara_settings_url() ) . '">' . esc_html__( 'Settings → Can Sakhara', 'blueworx-client-cansakhara' ) . '</a>'
		);
		?>
	</p>
	<?php
	endif;
}

/**
 * Keeps SureForms' stylesheets on owned pages.
 *
 * The asset sweep in includes/assets.php drops every foreign stylesheet so
 * the design cannot be disturbed. SureForms' own layout and error states
 * need its CSS, so its handles (all prefixed srfm-) are let through and
 * restyled by the .cansakhara-popup rules in app.css.
 *
 * @param string[] $keep Stylesheet handles to keep.
 * @return string[]
 */
function cansakhara_keep_sureforms_styles( $keep ) {
	if ( ! cansakhara_enquiry_form_ready() ) {
		return $keep;
	}

	foreach ( wp_styles()->queue as $handle ) {
		if ( 0 === strpos( $handle, 'srfm-' ) ) {
			$keep[] = $handle;
		}
	}

	return $keep;
}
add_filter( 'cansakhara_keep_styles', 'cansakhara_keep_sureforms_styles' );
```

- [ ] **Step 4: Run the automated tests**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test tests/enquire.spec.js --workers=1`
Expected: 2 passed.

- [ ] **Step 5: Install SureForms in the local harness and style the real markup**

The harness cannot install extra plugins on its own and CI has no SureForms, so this part is verified by hand:

1. In the Playwright MCP browser, sign in at `http://127.0.0.1:8881/wp-admin/` (admin / admin), go to Plugins → Add New, search "SureForms", install and activate it. (If the SQLite drop-in refuses SureForms' table creation, note that in the final report and style from the live site's markup in `/tmp/cs.html` instead.)
2. Create one form with fields First name, Last name, Email, Phone, a GDPR checkbox labelled "Tick if you agree to our Privacy Policy" and a "Submit" button. Publish it.
3. Settings → Can Sakhara → choose that form → Save changes.
4. Open `/welcome/`, click ENQUIRE, screenshot at 1440×900 and at 400 wide.
5. Add scoped overrides to `assets/css/src/app.css` inside the same `@layer components` block, starting from these selectors (taken from the live site's SureForms 1.x markup: `.srfm-form`, `.srfm-block`, `.srfm-block-label`, `.srfm-input-common`, `.srfm-input-input`, `.srfm-gdpr-block`, `.srfm-submit-btn`, `.srfm-error-message`) and correcting them against what the installed version actually renders:

```css
  /* SureForms inside the Enquire popup, restyled to Figma 1:109. The
     selectors are SureForms' own; verify against the installed version. */
  .cansakhara-popup .srfm-form-container,
  .cansakhara-popup .srfm-form { background: transparent; padding: 0; max-width: none; }
  .cansakhara-popup .srfm-block { margin: 0 0 20px; }
  .cansakhara-popup .srfm-block-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .cansakhara-popup .srfm-input-common,
  .cansakhara-popup .srfm-input-input {
    width: 100%; background: #490500; color: #fff; border: 0; border-radius: 0;
    padding: 16px 32px; text-align: center;
    font-family: var(--font-body), sans-serif; font-weight: 300; font-size: 16px;
    line-height: 1.4; letter-spacing: .8px;
  }
  .cansakhara-popup .srfm-input-common::placeholder { color: #fff; opacity: 1; }
  .cansakhara-popup .srfm-gdpr-block { display: flex; justify-content: center; }
  .cansakhara-popup .srfm-gdpr-block label,
  .cansakhara-popup .srfm-gdpr-block .srfm-block-label {
    position: static; width: auto; height: auto; overflow: visible; clip: auto;
    color: #fff; font-family: var(--font-body), sans-serif; font-weight: 200;
    font-size: 12px; letter-spacing: .6px;
  }
  .cansakhara-popup .srfm-gdpr-block input[type="checkbox"] {
    appearance: none; width: 18px; height: 18px; border: 1px solid #fff; background: transparent; margin-right: 12px;
  }
  .cansakhara-popup .srfm-gdpr-block input[type="checkbox"]:checked { background: #fff; }
  .cansakhara-popup .srfm-submit-btn,
  .cansakhara-popup .srfm-button { all: unset; }
  .cansakhara-popup .srfm-submit-btn,
  .cansakhara-popup .srfm-button {
    display: inline-flex; width: 100%; box-sizing: border-box; align-items: center; justify-content: center;
    border: 1px solid #42071a; padding: 16px 32px; cursor: pointer;
    font-family: var(--font-display), sans-serif; font-size: 14px; line-height: 1.4;
    letter-spacing: 5.6px; text-indent: 5.6px; text-transform: uppercase; color: #fff;
    transition: background-color 200ms ease-out;
  }
  .cansakhara-popup .srfm-submit-btn:hover,
  .cansakhara-popup .srfm-button:hover { background-color: #490500; }
  .cansakhara-popup .srfm-error-message { color: #fff; font-size: 12px; text-align: center; }
```

6. `npm run build`, reload, screenshot again at both widths; iterate until the fields, checkbox and button match the Figma frame. Submit the form once and confirm the entry arrives in SureForms → Entries and the success message reads legibly on the red.
7. Set the form back to "None" in settings and deactivate SureForms, so the automated fallback tests still hold on this harness.

Save the two final screenshots to the scratchpad directory (not the repo) for the hand-off.

- [ ] **Step 6: Commit**

```bash
git add includes/enquiry.php assets/css/src/app.css assets/css/public.css tests/enquire.spec.js
git commit -m "Show the chosen SureForms form in the Enquire popup, styled to the design

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Full suite, mobile pass, and the fidelity gate

**Files:** none new — this task only runs things and fixes what they find.

- [ ] **Step 1: Run the whole suite**

Run: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 WP_ADMIN_USER=admin WP_ADMIN_PASS=admin npx playwright test --workers=1`
Expected: everything passes, including `tests/fidelity.spec.js` — the header's Enquire changed from `<a>` to `<button>` with identical classes and the popups are invisible, so the Home / By Day / By Night baselines must still match. If a fidelity diff appears, the cause is a visible change on one of the ported pages; find it and remove it — never touch `tests/baselines/`.

- [ ] **Step 2: Mobile pass**

In the Playwright MCP browser at 400×800: `/welcome/`, then each popup open. Check: no horizontal scroll (`document.documentElement.scrollWidth <= 400`), the buttons row fits, the popup content scrolls within the panel, the ✕ is reachable. Fix any Tailwind sizes in `templates/pages/welcome.php` / `templates/parts/popups.php`, rebuild, re-check.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A templates assets/css/public.css assets/js/public.js
git commit -m "Tidy the Welcome page and popups at phone width

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

(Skip the commit if nothing changed.)

---

### Task 7: Security review

- [ ] **Step 1: Run the review**

Invoke the `security-review` skill on the branch. Login is the sensitive part; the things it must confirm:
- The REST route and the no-JS handler return one fixed message for every failure, and never echo WordPress's own login errors.
- `password` is never sanitised or logged; `email` goes through `sanitize_email` only.
- `wp_safe_redirect()` is used for both redirects (destination is a same-site permalink or `home_url`).
- The settings sanitiser rejects non-page and non-SureForms IDs; the screen is `manage_options`-only; `settings_fields()` supplies the save nonce.
- The no-nonce decision is documented in `includes/login.php`'s header and matches core's `wp-login.php`.

- [ ] **Step 2: Fix anything it raises, re-run the affected spec, commit**

```bash
git commit -am "Address the security review findings on the login flow

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Version, changelog, lint, hand-off

**Files:**
- Modify: `blueworx-client-cansakhara.php`, `package.json`, `readme.txt`, `CHANGELOG.md`, `docs/superpowers/conversion-decisions.md` (only if a decision was taken during implementation that is not in the spec)

- [ ] **Step 1: Bump to 0.2.0**

- `blueworx-client-cansakhara.php`: `* Version: 0.2.0` and `define( 'CANSAKHARA_VERSION', '0.2.0' );`
- `package.json`: `"version": "0.2.0"`
- `readme.txt`: `Stable tag: 0.2.0`, and a new `= 0.2.0 =` changelog block above `= 0.1.0 =` with the same three bullets as below, in plain words.

- [ ] **Step 2: Changelog**

Insert above `## [0.1.0]` in `CHANGELOG.md`:

```markdown
## [0.2.0] - 2026-09-12

### Added

- A Welcome page (`/welcome/`): the red splash with the Can Sakhara mark and
  two buttons, Login and Enquire.
- A Login popup, available from the Welcome page and the menu on every page.
  Guests sign in with the WordPress account they have been given and land on
  a page you choose. Wrong details show one short message and never say
  whether the address exists.
- An Enquire popup, opened from the Welcome page and the header's Enquire
  button (which no longer opens an email). It shows the SureForms form you
  choose, restyled to the site; until one is chosen it shows an email link.
- Settings → Can Sakhara: where guests go after signing in, and which
  enquiry form to show. Built from the shared admin design system, which
  the plugin now ships.
- Sites already running the plugin get the Welcome page on their next
  update without reactivating.
```

- [ ] **Step 3: Run the version-sync check the way CI does**

Run: `node ../bluegroup_core_foundation/scripts/check-plugin-version-sync.mjs && node ../bluegroup_core_foundation/scripts/check-changelog.mjs`
Expected: both print OK. (`check-design-system-sync.mjs` needs `FOUNDATION_DIR`: run `FOUNDATION_DIR=../bluegroup_core_foundation node ../bluegroup_core_foundation/scripts/check-design-system-sync.mjs` and expect OK too.)

- [ ] **Step 4: Lint once — do not auto-fix**

Run: `npm run lint` and `vendor/bin/phpcs` (or `composer install` first if `vendor/` is missing). Record every finding verbatim for the hand-off; fix nothing unless Luke says so.

- [ ] **Step 5: Final build and commit**

```bash
npm run build
git add blueworx-client-cansakhara.php package.json readme.txt CHANGELOG.md assets/css/public.css assets/js/public.js
git commit -m "Bump to 0.2.0 and record the Welcome page, login and enquire popups

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 6: Hand-off**

Report, in under 80 words: what works, the two SureForms screenshots' location, any lint findings (verbatim, unfixed), and the one thing that still needs Luke — to drop his real SureForms form in on the live site and pick it in Settings → Can Sakhara. Do **not** push, open a PR, merge, or tag; Luke decides that (the finishing-a-development-branch skill runs when he says so).

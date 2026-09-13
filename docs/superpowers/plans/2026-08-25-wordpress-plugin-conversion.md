# Can Sakhara WordPress Plugin Conversion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Can Sakhara Next.js marketing site, in place, into a self-contained BlueWorx WordPress plugin whose rendered output is pixel-identical to the current Next.js build.

**Architecture:** The plugin creates three real WordPress Pages, stamps them with its own post meta, and takes over `template_include` to emit the entire HTML document itself, so the active theme cannot influence the design. Markup moves from JSX to PHP templates with the Tailwind class strings copied character-for-character; Tailwind's CLI scans the PHP and emits one committed stylesheet. The GSAP motion layer ports over almost unchanged, and the React components become vanilla behaviours bundled by esbuild.

**Tech Stack:** PHP 8.1+, WordPress 6.4+, Tailwind CSS v4 (CLI), esbuild, GSAP 3.15 (bundled), Playwright, PHPCS (WordPress standard).

**Spec:** [`docs/superpowers/specs/2026-08-25-wordpress-plugin-conversion-design.md`](../specs/2026-08-25-wordpress-plugin-conversion-design.md)

## Global Constraints

These apply to every task below without being repeated.

- **Plugin slug:** `blueworx-client-cansakhara`. Main file `blueworx-client-cansakhara.php` at the repo root.
- **PHP prefix:** every global function, constant, option, hook and meta key starts `cansakhara_` / `CANSAKHARA_`. A plugin shares one PHP process with every other plugin on the site.
- **Text domain:** `blueworx-client-cansakhara`.
- **Version:** starts at `0.1.0`, and must be identical in three places — the `Version:` plugin header, the `CANSAKHARA_VERSION` constant, and `package.json`. CI fails on a mismatch.
- **Every PR touches `CHANGELOG.md`** (Keep a Changelog format). CI fails a PR that does not, including CI-only ones.
- **Tailwind class strings are copied character-for-character** from the JSX. No re-expression, no tidying, no consolidation, no "equivalent" utilities. This is the mechanism that makes the design guarantee hold — a class string you improved is a defect.
- **Escape on output** (`esc_html`, `esc_attr`, `esc_url`), and `wp_kses_post` for anything containing markup.
- **Never `Compress-Archive`** for the plugin zip — it writes backslash entries and WordPress then reports "Plugin file does not exist." on activate. Use bsdtar (`/c/Windows/System32/tar.exe` on Windows).
- **Foundation ref is `v1`** everywhere it appears — the workflow `@ref`, the `foundation_ref` input, and the design system `--branch`. They must match.
- **Never push a git tag on your own initiative.** Tagging is a release decision.
- **The page scrolls inside `.site-shell`, not the window.** Every scroll listener, ScrollTrigger and scroll-lock binds to that element. This is the single most common source of bugs in this port.
- **The mobile/desktop switch is 796px**, set once via `--breakpoint-md`. There is no tablet layout.
- **Reference source:** the Next.js source is available at the `nextjs-final` tag after Task 1 — `git show nextjs-final:src/components/SiteHeader.tsx` and so on. Read it rather than guessing.

---

## File Structure

| Path | Responsibility |
|---|---|
| `blueworx-client-cansakhara.php` | Plugin header, constants, requires, activation/deactivation hooks |
| `uninstall.php` | Removes the plugin's own options only |
| `includes/pages.php` | The owned-page registry, ownership meta, page creation, front-page assignment |
| `includes/render.php` | `template_include` takeover, full-document open/close, template loading |
| `includes/assets.php` | Enqueues the plugin's CSS/JS on owned pages; sweeps foreign front-end assets |
| `includes/components.php` | Small reusable markup helpers ported from the JSX helper functions |
| `templates/pages/{home,by-day,by-night}.php` | Per-page markup |
| `templates/parts/*.php` | Header, drawer, footer, side nav, carousels |
| `assets/css/src/app.css` | Tailwind entry — the old `globals.css`, verbatim, plus `@source` |
| `assets/css/public.css` | Built stylesheet, committed |
| `assets/js/src/*.js` | Motion layer and component behaviours (ES modules) |
| `assets/js/public.js` | Built bundle, committed |
| `assets/fonts/`, `assets/img/` | Self-hosted woff2, site imagery |
| `scripts/build-assets.mjs`, `scripts/build-zip.mjs` | Asset build and zip packaging |
| `tests/*.spec.js` | Playwright specs, including the fidelity diff |
| `tests/baselines/` | Screenshots captured from the Next.js build in Task 1 |

---

## Task 1: Capture the fidelity baselines

Nothing else in this plan is safe until the reference build is preserved. This task produces the evidence every later task is graded against.

**Files:**
- Create: `tests/baselines/` (six PNGs)
- Create: `scripts/capture-baselines.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `tests/baselines/{home,by-day,by-night}-{mobile,desktop}.png`, and the git tag `nextjs-final`.

- [ ] **Step 1: Start the Next.js dev server**

```bash
npm run dev
```

Wait for `✓ Ready`. It serves on `http://localhost:3000`.

- [ ] **Step 2: Write the capture script**

Create `scripts/capture-baselines.mjs`:

```js
// Captures the reference screenshots the plugin port is graded against.
// Run once, against the Next.js build, before any of it is deleted.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const ROUTES = { home: '/', 'by-day': '/by-day', 'by-night': '/by-night' };
const WIDTHS = { mobile: 390, desktop: 1440 };
const BASE = process.env.BASELINE_URL ?? 'http://localhost:3000';
const OUT = 'tests/baselines';

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const [name, path] of Object.entries(ROUTES)) {
  for (const [size, width] of Object.entries(WIDTHS)) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
      // Motion is one-shot and time-based; freezing it makes the diff stable.
      reducedMotion: 'reduce',
    });
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // The page scrolls inside .site-shell, so a full-page shot of the window
    // captures only the first viewport. Screenshot the scroller instead.
    const shell = page.locator('.site-shell');
    await shell.screenshot({ path: `${OUT}/${name}-${size}.png`, scale: 'css' });
    await page.close();
  }
}

await browser.close();
console.log('Baselines written to', OUT);
```

- [ ] **Step 3: Install Playwright and run the capture**

```bash
npm install --no-save playwright
npx playwright install chromium
node scripts/capture-baselines.mjs
```

Expected: `Baselines written to tests/baselines`, and six PNG files on disk.

- [ ] **Step 4: Verify the baselines are real**

```bash
ls -l tests/baselines
```

Expected: six files, each well over 100 KB. A file under ~20 KB means the page rendered blank or the scroller selector missed — stop and fix before continuing, because every later check compares against these.

- [ ] **Step 5: Commit and tag**

```bash
git add tests/baselines scripts/capture-baselines.mjs
git commit -m "Capture Next.js render baselines before the plugin port"
git tag -a nextjs-final -m "Final Next.js build, before the WordPress plugin conversion"
```

Do not push the tag — say it exists and let Luke decide.

---

## Task 2: Plugin skeleton and Foundation scaffolding

**Files:**
- Create: `blueworx-client-cansakhara.php`, `uninstall.php`, `CHANGELOG.md`, `phpcs.xml.dist`, `composer.json`, `approved-deps.json`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`
- Modify: `package.json`, `.gitignore`

**Interfaces:**
- Consumes: nothing.
- Produces: constants `CANSAKHARA_VERSION` (string), `CANSAKHARA_DIR` (path with trailing slash), `CANSAKHARA_URL` (URL with trailing slash), `CANSAKHARA_SLUG` (`'blueworx-client-cansakhara'`). Activation hook `cansakhara_activate()`, deactivation hook `cansakhara_deactivate()`.

- [ ] **Step 1: Pull in the shared Foundation rules**

```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/blueworx-io/bluegroup_core_foundation/main/CLAUDE.md.template
curl -o approved-deps.json https://raw.githubusercontent.com/blueworx-io/bluegroup_core_foundation/main/templates/approved-deps.json
mkdir -p .github/ISSUE_TEMPLATE .claude/hooks .claude/skills
curl -o .github/PULL_REQUEST_TEMPLATE.md https://raw.githubusercontent.com/blueworx-io/bluegroup_core_foundation/main/.github/PULL_REQUEST_TEMPLATE.md
curl -o .github/ISSUE_TEMPLATE/task.md https://raw.githubusercontent.com/blueworx-io/bluegroup_core_foundation/main/.github/ISSUE_TEMPLATE/task.md
curl -o .claude/settings.json https://raw.githubusercontent.com/blueworx-io/bluegroup_core_foundation/main/.claude/settings.json
curl -o .claude/hooks/admin-ui-adherence.mjs https://raw.githubusercontent.com/blueworx-io/bluegroup_core_foundation/main/.claude/hooks/admin-ui-adherence.mjs
git clone -q --depth 1 --branch v1 https://github.com/blueworx-io/bluegroup_core_foundation.git /tmp/bw-foundation
cp -R /tmp/bw-foundation/.claude/skills/blueworx-admin-design .claude/skills/
rm -rf /tmp/bw-foundation
```

`CLAUDE.md` replaces the current Next.js-specific one. `AGENTS.md` is Figma build guidance for the Next.js site — delete it in Task 18, not now, because the design values in it are still the reference while porting.

`--branch v1` must match `foundation_ref: v1` below. Pulling `main` installs files newer than the baseline CI compares against and fails the design system check.

- [ ] **Step 2: Write the main plugin file**

Create `blueworx-client-cansakhara.php`:

```php
<?php
/**
 * Plugin Name: Can Sakhara
 * Description: The Can Sakhara marketing site, as a self-contained WordPress plugin.
 * Version: 0.1.0
 * Requires at least: 6.4
 * Requires PHP: 8.1
 * Author: BlueWorx
 * License: GPL-2.0-or-later
 * Text Domain: blueworx-client-cansakhara
 *
 * @package CanSakhara
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CANSAKHARA_VERSION', '0.1.0' );
define( 'CANSAKHARA_SLUG', 'blueworx-client-cansakhara' );
define( 'CANSAKHARA_DIR', plugin_dir_path( __FILE__ ) );
define( 'CANSAKHARA_URL', plugin_dir_url( __FILE__ ) );

require_once CANSAKHARA_DIR . 'includes/pages.php';
require_once CANSAKHARA_DIR . 'includes/render.php';
require_once CANSAKHARA_DIR . 'includes/assets.php';
require_once CANSAKHARA_DIR . 'includes/components.php';

/**
 * Creates the plugin's pages and flushes rewrites on activation.
 *
 * @return void
 */
function cansakhara_activate() {
	cansakhara_install_pages();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'cansakhara_activate' );

/**
 * Flushes rewrites on deactivation. Pages are deliberately left in place.
 *
 * @return void
 */
function cansakhara_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'cansakhara_deactivate' );
```

- [ ] **Step 3: Write `uninstall.php`**

```php
<?php
/**
 * Removes this plugin's own options. Nothing else.
 *
 * The pages this plugin created are left alone: they are content a site owner
 * can see, and deleting content silently on uninstall is not this plugin's
 * decision to make.
 *
 * @package CanSakhara
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'cansakhara_page_ids' );
delete_option( 'cansakhara_version' );
```

- [ ] **Step 4: Create empty include files so the requires resolve**

```bash
mkdir -p includes templates/pages templates/parts assets/css/src assets/js/src assets/img assets/fonts scripts tests
for f in pages render assets components; do
  printf '<?php\n/**\n * @package CanSakhara\n */\n\nif ( ! defined( '"'"'ABSPATH'"'"' ) ) {\n\texit;\n}\n' > includes/$f.php
done
```

- [ ] **Step 5: Rewrite `package.json`**

```json
{
  "name": "blueworx-client-cansakhara",
  "version": "0.1.0",
  "private": true,
  "description": "The Can Sakhara marketing site as a self-contained WordPress plugin.",
  "license": "GPL-2.0-or-later",
  "type": "module",
  "scripts": {
    "build": "node scripts/build-assets.mjs",
    "build:zip": "node scripts/build-zip.mjs",
    "lint": "eslint assets/js/src",
    "test": "playwright test --reporter=list,json"
  },
  "dependencies": {
    "gsap": "^3.15.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.61.1",
    "@tailwindcss/cli": "^4",
    "esbuild": "^0.25.0",
    "eslint": "^9",
    "tailwindcss": "^4"
  }
}
```

- [ ] **Step 6: Fill in `approved-deps.json`**

Every name in `package.json` must appear, and nothing beyond them:

```json
{
  "dependencies": ["gsap"],
  "devDependencies": [
    "@playwright/test",
    "@tailwindcss/cli",
    "esbuild",
    "eslint",
    "tailwindcss"
  ]
}
```

If the Foundation template uses a different shape, keep the template's shape and fill in these names.

- [ ] **Step 7: Add `composer.json` and `phpcs.xml.dist`**

```json
{
  "name": "blueworx/blueworx-client-cansakhara",
  "description": "Can Sakhara marketing site plugin.",
  "license": "GPL-2.0-or-later",
  "require-dev": {
    "squizlabs/php_codesniffer": "^3.9",
    "wp-coding-standards/wpcs": "^3.1"
  },
  "config": {
    "allow-plugins": {
      "dealerdirect/phpcodesniffer-composer-installer": true
    }
  }
}
```

```xml
<?xml version="1.0"?>
<ruleset name="CanSakhara">
	<description>WordPress coding standards for the Can Sakhara plugin.</description>

	<file>.</file>

	<exclude-pattern>*/vendor/*</exclude-pattern>
	<exclude-pattern>*/node_modules/*</exclude-pattern>
	<exclude-pattern>*/.wp-test/*</exclude-pattern>
	<exclude-pattern>*/dist/*</exclude-pattern>

	<rule ref="WordPress"/>

	<config name="testVersion" value="8.1-"/>
	<rule ref="WordPress.WP.I18n">
		<properties>
			<property name="text_domain" type="array" value="blueworx-client-cansakhara"/>
		</properties>
	</rule>
</ruleset>
```

- [ ] **Step 8: Add the CI and release caller workflows**

`.github/workflows/ci.yml`:

```yaml
name: CI
on: pull_request
jobs:
  guardrails:
    uses: blueworx-io/bluegroup_core_foundation/.github/workflows/ci-wordpress.yml@v1
    with:
      plugin_slug: blueworx-client-cansakhara
      use_local_wordpress: true
      foundation_ref: v1
    secrets: inherit
```

`.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    uses: blueworx-io/bluegroup_core_foundation/.github/workflows/release-wordpress.yml@v1
    with:
      plugin_slug: blueworx-client-cansakhara
      foundation_ref: v1
    permissions:
      contents: write
```

- [ ] **Step 9: Update `.gitignore` and start `CHANGELOG.md`**

Add to `.gitignore`:

```
.wp-test/
vendor/
test-results/
playwright-report/
dist/
```

`CHANGELOG.md`:

```markdown
# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-25

### Added

- The plugin skeleton: plugin header, activation and uninstall handling, PHP
  coding standards, and the shared CI and release workflows.
```

- [ ] **Step 10: Verify the PHP parses and the plugin activates**

```bash
find . -name '*.php' -not -path './vendor/*' -not -path './node_modules/*' -print0 | xargs -0 -n1 php -l
node ../bluegroup_core_foundation/scripts/wp-test-env.mjs up --plugin .
```

Expected: `No syntax errors detected` for every file, and the harness reports the plugin active on `http://127.0.0.1:8881`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "Add the WordPress plugin skeleton and shared CI guardrails"
```

---

## Task 3: Owned pages, ownership meta, front page

**Files:**
- Modify: `includes/pages.php`
- Test: `tests/pages.spec.js`

**Interfaces:**
- Consumes: `CANSAKHARA_DIR` from Task 2.
- Produces:
  - `cansakhara_pages(): array` — slug => `array( 'title' => string, 'template' => string )`.
  - `cansakhara_install_pages(): void` — creates missing pages, stamps them, sets the front page.
  - `cansakhara_page_is_ours( int $post_id ): bool`.
  - `cansakhara_page_slug( int $post_id ): string` — `''` when not ours.
  - Constant `CANSAKHARA_PAGE_META` = `'_cansakhara_page'`.
  - Option `cansakhara_page_ids` — slug => post ID map.

- [ ] **Step 1: Write the failing test**

Create `tests/pages.spec.js`:

```js
import { test, expect } from '@playwright/test';

test('the three plugin pages are reachable', async ({ page }) => {
  for (const path of ['/', '/by-day/', '/by-night/']) {
    const response = await page.goto(path);
    expect(response.status(), `${path} should return 200`).toBe(200);
  }
});

test('the front page is the plugin home page, not the WordPress blog roll', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/cansakhara-page/);
});
```

- [ ] **Step 2: Add the Playwright config, then run the test to see it fail**

Create `playwright.config.js`:

```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // The specs mutate site-wide state; parallel workers against one WordPress
  // make one spec's "off" another spec's "on".
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:8881',
  },
});
```

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/pages.spec.js --workers=1
```

Expected: FAIL — `/by-day/` returns 404, and the body has no `cansakhara-page` class.

- [ ] **Step 3: Implement the page registry**

Replace `includes/pages.php`:

```php
<?php
/**
 * The pages this plugin owns, and how it claims them.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Post meta stamped onto every page this plugin creates.
 *
 * Ownership is read from this stamp and never inferred from the slug. A site
 * with its own page slugged "home" would otherwise have it adopted, rendered
 * by this plugin, and stripped of the theme's styles by the sweep in
 * assets.php. A slug is a coincidence; the stamp is a fact.
 */
const CANSAKHARA_PAGE_META = '_cansakhara_page';

/**
 * The pages this plugin owns and renders.
 *
 * Real WordPress pages are created for these so permalinks, menus and SEO
 * plugins behave normally. Rendering is taken over in includes/render.php, so
 * the active theme never gets a say in how they look.
 *
 * @return array<string, array{title: string, template: string}>
 */
function cansakhara_pages() {
	return array(
		'home'     => array(
			'title'    => __( 'Home', 'blueworx-client-cansakhara' ),
			'template' => 'pages/home.php',
		),
		'by-day'   => array(
			'title'    => __( 'By Day', 'blueworx-client-cansakhara' ),
			'template' => 'pages/by-day.php',
		),
		'by-night' => array(
			'title'    => __( 'By Night', 'blueworx-client-cansakhara' ),
			'template' => 'pages/by-night.php',
		),
	);
}

/**
 * Creates any missing owned pages, stamps them, and sets the front page.
 *
 * Idempotent: an existing stamped page is reused rather than duplicated, so
 * reactivating the plugin never leaves a second copy behind.
 *
 * @return void
 */
function cansakhara_install_pages() {
	$ids = (array) get_option( 'cansakhara_page_ids', array() );

	foreach ( cansakhara_pages() as $slug => $page ) {
		$existing = isset( $ids[ $slug ] ) ? (int) $ids[ $slug ] : 0;

		if ( $existing > 0 && 'page' === get_post_type( $existing ) && 'trash' !== get_post_status( $existing ) ) {
			continue;
		}

		$post_id = wp_insert_post(
			array(
				'post_type'      => 'page',
				'post_status'    => 'publish',
				'post_title'     => $page['title'],
				'post_name'      => $slug,
				'post_content'   => '',
				'comment_status' => 'closed',
				'ping_status'    => 'closed',
			)
		);

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			continue;
		}

		update_post_meta( $post_id, CANSAKHARA_PAGE_META, $slug );
		$ids[ $slug ] = (int) $post_id;
	}

	update_option( 'cansakhara_page_ids', $ids );

	if ( isset( $ids['home'] ) && $ids['home'] > 0 ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', (int) $ids['home'] );
	}
}

/**
 * Whether a page was created by this plugin.
 *
 * @param int $post_id Page ID.
 * @return bool True when this plugin created the page.
 */
function cansakhara_page_is_ours( $post_id ) {
	return '' !== cansakhara_page_slug( $post_id );
}

/**
 * The owned-page slug for a post, or '' when the post is not ours.
 *
 * @param int $post_id Page ID.
 * @return string Slug, or '' when not an owned page.
 */
function cansakhara_page_slug( $post_id ) {
	$post_id = (int) $post_id;

	if ( $post_id <= 0 ) {
		return '';
	}

	$slug = (string) get_post_meta( $post_id, CANSAKHARA_PAGE_META, true );

	return isset( cansakhara_pages()[ $slug ] ) ? $slug : '';
}
```

- [ ] **Step 4: Reactivate the plugin and re-run the test**

```bash
node ../bluegroup_core_foundation/scripts/wp-test-env.mjs down
node ../bluegroup_core_foundation/scripts/wp-test-env.mjs up --plugin .
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/pages.spec.js --workers=1
```

Expected: the first test PASSES (three pages return 200). The second still FAILS — nothing renders a `cansakhara-page` body class yet. That is Task 4.

- [ ] **Step 5: Commit**

```bash
git add includes/pages.php tests/pages.spec.js playwright.config.js
git commit -m "Create and claim the plugin's three pages on activation"
```

---

## Task 4: Full-document rendering

**Files:**
- Modify: `includes/render.php`
- Create: `templates/pages/home.php`, `templates/pages/by-day.php`, `templates/pages/by-night.php` (placeholders, filled in Tasks 9–11)

**Interfaces:**
- Consumes: `cansakhara_page_slug()`, `cansakhara_pages()` from Task 3.
- Produces:
  - `cansakhara_document_open( array $args = array() ): void` — accepts `body_class` (string) and `theme` (`'home'|'day'|'night'`).
  - `cansakhara_document_close(): void`.
  - `cansakhara_part( string $name, array $args = array() ): void` — loads `templates/parts/{$name}.php` with `$args` in scope.
  - Filter callback on `template_include`.

- [ ] **Step 1: Write the placeholder templates**

```bash
for p in home by-day by-night; do
  cat > templates/pages/$p.php <<'PHP'
<?php
/**
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<main class="site-shell">
	<h1>PLACEHOLDER</h1>
</main>
PHP
done
```

These are replaced wholesale in Tasks 9–11. They exist now so the rendering seam can be tested on its own.

- [ ] **Step 2: Implement the renderer**

Replace `includes/render.php`:

```php
<?php
/**
 * Full-document rendering for the plugin's own pages.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Declares title-tag support so an owned page always emits a <title>.
 *
 * WordPress only prints one when the active theme has opted in. These pages
 * must not depend on that seam — the whole point of rendering the document
 * ourselves is that the output is identical regardless of the active theme.
 *
 * @return void
 */
function cansakhara_ensure_title_tag_support() {
	add_theme_support( 'title-tag' );
}
add_action( 'after_setup_theme', 'cansakhara_ensure_title_tag_support' );

/**
 * Takes over rendering for pages this plugin owns.
 *
 * @param string $template Template path WordPress resolved.
 * @return string Template path to use.
 */
function cansakhara_template_include( $template ) {
	if ( ! is_singular( 'page' ) ) {
		return $template;
	}

	$slug = cansakhara_page_slug( get_queried_object_id() );

	if ( '' === $slug ) {
		return $template;
	}

	$page = cansakhara_pages()[ $slug ];
	$path = CANSAKHARA_DIR . 'templates/' . $page['template'];

	return file_exists( $path ) ? $path : $template;
}
add_filter( 'template_include', 'cansakhara_template_include' );

/**
 * Opens a complete HTML document for a plugin-rendered page.
 *
 * Deliberately does not call get_header(): the plugin renders the whole
 * document so the site is identical regardless of the active theme. wp_head()
 * and wp_footer() are still called so other plugins, the admin bar and SEO
 * output keep working.
 *
 * @param array $args Optional. 'body_class' => string, 'theme' => string.
 * @return void
 */
function cansakhara_document_open( $args = array() ) {
	$body_class = isset( $args['body_class'] ) ? (string) $args['body_class'] : '';
	$theme      = isset( $args['theme'] ) ? (string) $args['theme'] : 'home';
	?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<?php wp_head(); ?>
	<script>
		/* Pre-paint no-FOUC guard: hide the above-the-fold hero entrance
		   elements before first paint, but only when JS runs and motion is
		   allowed. Ported verbatim from the Next.js layout. */
		try {
			if ( ! matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
				document.documentElement.classList.add( 'motion-ready' );
			}
		} catch ( e ) {}
	</script>
</head>
<body <?php body_class( 'cansakhara-page cansakhara-theme-' . sanitize_html_class( $theme ) . ' ' . $body_class ); ?>>
	<?php wp_body_open(); ?>
	<a class="sr-only" href="#content"><?php echo esc_html__( 'Skip to the content', 'blueworx-client-cansakhara' ); ?></a>
	<?php
}

/**
 * Closes the document opened by cansakhara_document_open().
 *
 * @return void
 */
function cansakhara_document_close() {
	wp_footer();
	?>
</body>
</html>
	<?php
}

/**
 * Loads a template part from templates/parts/.
 *
 * @param string $name Part name, without the .php extension.
 * @param array  $args Variables made available to the part as $args.
 * @return void
 */
function cansakhara_part( $name, $args = array() ) {
	$path = CANSAKHARA_DIR . 'templates/parts/' . $name . '.php';

	if ( ! file_exists( $path ) ) {
		return;
	}

	include $path;
}
```

- [ ] **Step 3: Wire the placeholder templates to the document**

Rewrite each of the three placeholders to call the document functions, e.g. `templates/pages/home.php`:

```php
<?php
/**
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

cansakhara_document_open( array( 'theme' => 'home' ) );
?>
<main id="content" class="site-shell">
	<h1>PLACEHOLDER</h1>
</main>
<?php
cansakhara_document_close();
```

Use `'theme' => 'day'` for `by-day.php` and `'theme' => 'night'` for `by-night.php`.

- [ ] **Step 4: Add a test that proves the theme is not in charge**

Append to `tests/pages.spec.js`:

```js
test('the plugin renders the whole document, not the theme', async ({ page }) => {
  await page.goto('/by-day/');
  await expect(page.locator('body')).toHaveClass(/cansakhara-theme-day/);
  // A theme's own wrapper would appear here if get_header() were being used.
  await expect(page.locator('#page, .wp-site-blocks')).toHaveCount(0);
});
```

- [ ] **Step 5: Run the tests**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/pages.spec.js --workers=1
```

Expected: all three tests PASS.

- [ ] **Step 6: Commit**

```bash
git add includes/render.php templates/pages tests/pages.spec.js
git commit -m "Render owned pages as a complete document, independent of the theme"
```

---

## Task 5: Stylesheet pipeline and fonts

**Files:**
- Create: `assets/css/src/app.css`, `scripts/build-assets.mjs`, `assets/fonts/*.woff2`
- Modify: `includes/assets.php`
- Test: `tests/assets.spec.js`

**Interfaces:**
- Consumes: `cansakhara_page_slug()` from Task 3.
- Produces: `cansakhara_enqueue_assets(): void` on `wp_enqueue_scripts`; handles `cansakhara-public` (style) and `cansakhara-public` (script, registered here, built in Task 12). `npm run build` writes `assets/css/public.css` and `assets/js/public.js`.

- [ ] **Step 1: Move `globals.css` across verbatim and point Tailwind at the PHP**

```bash
git show nextjs-final:src/app/globals.css > assets/css/src/app.css
```

Then add the source directives immediately after the existing `@import "tailwindcss";` line at the top, and nothing else:

```css
@import "tailwindcss";

/* Tailwind v4 scans for class names itself. The plugin's markup is PHP, which
   is outside the default scan roots, so name them explicitly. */
@source "../../../templates";
@source "../../../includes";
```

Do not change another byte of this file. The `--breakpoint-md: 796px` override, the `.site-shell` scroller rules, the `100dvh`/`overflow: hidden` body and every hand-written rule stay exactly as they are.

- [ ] **Step 2: Replace the `next/font` variables with self-hosted faces**

`next/font` set `--font-display`, `--font-body` and `--font-serif` on the `<html>` element. Nothing does that now, so declare the faces and the variables at the top of `assets/css/src/app.css`, directly after the `@source` lines.

Download the latin woff2 files for the exact families, weights and styles the Next.js build used — Montserrat 100/200/300/400/500, Source Sans 3 300/400, Source Serif 4 300/400 plus 300/400 italic — into `assets/fonts/`, named `<family>-<weight><-italic>.woff2`. Then, for each file:

```css
@font-face {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 100;
  font-display: swap;
  src: url("../fonts/montserrat-100.woff2") format("woff2");
}
/* …one block per weight and style… */

:root {
  --font-display: "Montserrat";
  --font-body: "Source Sans 3";
  --font-serif: "Source Serif 4";
}
```

`font-display: swap` matches `next/font`'s default. The variable names must stay exactly these three — `@theme inline` further down the file already maps them, and every `font-display` / `font-body` / `font-serif` utility in the markup resolves through them.

- [ ] **Step 3: Write the asset build script**

Create `scripts/build-assets.mjs`:

```js
// Builds the plugin's committed front-end assets: one stylesheet from Tailwind,
// one JS bundle from esbuild. Both outputs are committed, so the plugin renders
// from a plain checkout and the zip needs no Node step.
import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';
import { existsSync } from 'node:fs';

const dev = process.argv.includes('--watch');

execFileSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  [
    '@tailwindcss/cli',
    '-i', 'assets/css/src/app.css',
    '-o', 'assets/css/public.css',
    ...(dev ? ['--watch'] : ['--minify']),
  ],
  { stdio: 'inherit' }
);

if (existsSync('assets/js/src/main.js')) {
  await build({
    entryPoints: ['assets/js/src/main.js'],
    bundle: true,
    minify: !dev,
    format: 'iife',
    target: ['es2020'],
    outfile: 'assets/js/public.js',
    logLevel: 'info',
  });
}
```

The `existsSync` guard lets this task's build succeed before Task 12 creates any JS.

- [ ] **Step 4: Implement the enqueue and the foreign-asset sweep**

Replace `includes/assets.php`:

```php
<?php
/**
 * Front-end assets for the plugin's own pages.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Whether the current request is one of this plugin's pages.
 *
 * @return bool
 */
function cansakhara_is_owned_request() {
	return is_singular( 'page' ) && '' !== cansakhara_page_slug( get_queried_object_id() );
}

/**
 * Enqueues the plugin's stylesheet and bundle on owned pages only.
 *
 * @return void
 */
function cansakhara_enqueue_assets() {
	if ( ! cansakhara_is_owned_request() ) {
		return;
	}

	wp_enqueue_style(
		'cansakhara-public',
		CANSAKHARA_URL . 'assets/css/public.css',
		array(),
		CANSAKHARA_VERSION
	);

	wp_enqueue_script(
		'cansakhara-public',
		CANSAKHARA_URL . 'assets/js/public.js',
		array(),
		CANSAKHARA_VERSION,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'cansakhara_enqueue_assets', 20 );

/**
 * Drops theme and third-party front-end styles on owned pages.
 *
 * The design is guaranteed only if nothing else can reach these pages. The
 * admin bar's own styles are kept, since a logged-in editor still needs it.
 *
 * @return void
 */
function cansakhara_sweep_foreign_assets() {
	if ( ! cansakhara_is_owned_request() ) {
		return;
	}

	$keep = array( 'cansakhara-public', 'admin-bar', 'dashicons' );

	foreach ( wp_styles()->queue as $handle ) {
		if ( ! in_array( $handle, $keep, true ) ) {
			wp_dequeue_style( $handle );
		}
	}
}
add_action( 'wp_enqueue_scripts', 'cansakhara_sweep_foreign_assets', 100 );
```

- [ ] **Step 5: Write the failing test**

Create `tests/assets.spec.js`:

```js
import { test, expect } from '@playwright/test';

test('the plugin stylesheet loads and no theme stylesheet does', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('link[rel="stylesheet"]').evaluateAll(
    (links) => links.map((l) => l.getAttribute('href'))
  );
  expect(hrefs.some((h) => h.includes('blueworx-client-cansakhara/assets/css/public.css'))).toBe(true);
  expect(hrefs.some((h) => h.includes('/themes/'))).toBe(false);
});

test('the display font resolves to Montserrat', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const family = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim()
  );
  expect(family).toContain('Montserrat');
});
```

- [ ] **Step 6: Build and run**

```bash
npm install
npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/assets.spec.js --workers=1
```

Expected: `assets/css/public.css` exists and is non-trivial in size, and both tests PASS.

- [ ] **Step 7: Commit**

```bash
git add assets includes/assets.php scripts/build-assets.mjs tests/assets.spec.js package.json
git commit -m "Build and enqueue the plugin stylesheet, with self-hosted fonts"
```

---

## Task 6: Markup helpers

**Files:**
- Modify: `includes/components.php`

**Interfaces:**
- Consumes: nothing.
- Produces, each echoing markup:
  - `cansakhara_outline_button( string $label, string $href, string $class = '', string $anim = '' ): void`
  - `cansakhara_secondary_button( string $label, string $href, string $class = '', string $anim = '' ): void`
  - `cansakhara_section_line( string $class = '' ): void`
  - `cansakhara_section_heading( array $args ): void` — keys `eyebrow`, `title`, `subtitle`, `class`
  - `cansakhara_sun_icon( string $class = '' ): void`, `cansakhara_moon_icon( string $class = '' ): void`

- [ ] **Step 1: Read the originals**

```bash
git show nextjs-final:src/app/page.tsx | sed -n '18,120p'
git show nextjs-final:src/components/SunMoonIcon.tsx
```

`OutlineButton`, `SecondaryButton`, `SectionLine` and `SectionHeading` are defined inline in `page.tsx`; `by-day.tsx` and `by-night.tsx` have their own copies. Check all three and confirm the class strings match before consolidating — if any differs, keep the difference as a parameter rather than picking one.

- [ ] **Step 2: Port `OutlineButton`**

Add to `includes/components.php`. The class string below is copied verbatim from `page.tsx`; re-read it from the tag rather than trusting this transcription:

```php
/**
 * The outlined uppercase call-to-action button.
 *
 * @param string $label Button text.
 * @param string $href  Destination. Internal paths start with '/'.
 * @param string $class Extra classes appended to the base string.
 * @param string $anim  Optional data-anim value used by the motion layer.
 * @return void
 */
function cansakhara_outline_button( $label, $href, $class = '', $anim = '' ) {
	$classes = 'outline-button inline-flex h-[54px] items-center justify-center gap-4 whitespace-nowrap border border-current px-8 font-display text-[14px] uppercase tracking-[0.4em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ' . $class;
	?>
	<a
		href="<?php echo esc_url( $href ); ?>"
		class="<?php echo esc_attr( trim( $classes ) ); ?>"
		<?php echo '' !== $anim ? 'data-anim="' . esc_attr( $anim ) . '"' : ''; ?>
	>
		<span><?php echo esc_html( $label ); ?></span>
	</a>
	<?php
}
```

`next/link` becomes a plain anchor: there is no client-side router any more, and the design does not depend on one.

- [ ] **Step 3: Port the remaining four helpers the same way**

`SecondaryButton`, `SectionLine`, `SectionHeading`, and the two icons from `SunMoonIcon.tsx`. Same rule throughout: copy the class strings and the SVG path data character-for-character, escape on output, and turn each JSX prop into a PHP parameter with the same default.

- [ ] **Step 4: Verify the PHP parses**

```bash
php -l includes/components.php
```

Expected: `No syntax errors detected`.

- [ ] **Step 5: Commit**

```bash
git add includes/components.php
git commit -m "Port the shared markup helpers from JSX to PHP"
```

---

## Task 7: Header and menu drawer markup

**Files:**
- Create: `templates/parts/header.php`, `templates/parts/menu-drawer.php`
- Test: `tests/chrome.spec.js`

**Interfaces:**
- Consumes: `cansakhara_part()` from Task 4.
- Produces: `cansakhara_part( 'header', array( 'theme' => 'home'|'day'|'night' ) )`. The header markup exposes the hooks the Task 13 behaviour binds to: `[data-cansakhara-header]` on the `<nav>`, `[data-cansakhara-menu-open]` on the trigger, `[data-cansakhara-logo-path]` on the SVG path, `#site-menu` on the drawer, `[data-cansakhara-menu-close]` on the close button, `[data-cansakhara-scrim]` on the scrim.

- [ ] **Step 1: Read the originals**

```bash
git show nextjs-final:src/components/SiteHeader.tsx
git show nextjs-final:src/components/MenuDrawer.tsx
```

- [ ] **Step 2: Port the header**

Create `templates/parts/header.php`. Points that need care:

- The `theme` argument selects the panel colour from the same map the JSX had: `home` `#422833`, `day` `#ac9a8c`, `night` `#031927`. Put that map in this file, not in `components.php` — it is the header's own concern.
- `solid` was `scrolled || theme !== 'home'`. Server-side there is no scroll position, so render the initial state — solid when `theme !== 'home'` — and let the Task 13 behaviour toggle the `scrolled` half. Emit the colour as a `data-cansakhara-solid-color` attribute so the JS does not have to know the map.
- The `hidden`/`open` translate classes start at `translate-y-0`; JS swaps them.
- The centre logo stays inlined SVG rather than the `logo-white.svg` asset — DrawSVG animates the path stroke and cannot do that through an `<img>`.
- `aria-expanded="false"` initially, `aria-haspopup="dialog"`, `aria-controls="site-menu"`.

Call `cansakhara_part( 'menu-drawer', array( 'panel_color' => $panel_color ) )` at the end of the file, as `SiteHeader` rendered `MenuDrawer` as a sibling.

- [ ] **Step 3: Port the drawer**

Create `templates/parts/menu-drawer.php`. The three links are `Experience` → `/`, `By Day` → `/by-day/`, `By Night` → `/by-night/` — note the trailing slashes, which WordPress permalinks use and Next.js did not. The drawer renders closed: whatever classes the JSX produced for `open={false}`, plus `aria-hidden="true"`.

- [ ] **Step 4: Add the header to the three page templates**

In each of `templates/pages/{home,by-day,by-night}.php`, immediately after `cansakhara_document_open()`:

```php
cansakhara_part( 'header', array( 'theme' => 'home' ) );
```

with `'day'` and `'night'` respectively.

- [ ] **Step 5: Write the test**

Create `tests/chrome.spec.js`:

```js
import { test, expect } from '@playwright/test';

test('the header renders with its menu trigger and enquire link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-cansakhara-header]')).toBeVisible();
  await expect(page.locator('[data-cansakhara-menu-open]')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('link', { name: 'Enquire' })).toHaveAttribute(
    'href', 'mailto:reservations@cansakhara.com'
  );
});

test('the drawer is present and closed on load', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#site-menu')).toHaveAttribute('aria-hidden', 'true');
});

test('the by-day header takes the day panel colour', async ({ page }) => {
  await page.goto('/by-day/');
  await expect(page.locator('[data-cansakhara-header]')).toHaveAttribute(
    'data-cansakhara-solid-color', '#ac9a8c'
  );
});
```

- [ ] **Step 6: Build and run**

```bash
npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/chrome.spec.js --workers=1
```

Expected: all three PASS. The drawer does not open yet — that is Task 13.

- [ ] **Step 7: Commit**

```bash
git add templates includes tests/chrome.spec.js assets/css/public.css
git commit -m "Port the header and menu drawer markup to PHP"
```

---

## Task 8: Footer and side progress nav markup

**Files:**
- Create: `templates/parts/footer.php`, `templates/parts/side-nav.php`
- Modify: `templates/pages/*.php`
- Test: `tests/chrome.spec.js`

**Interfaces:**
- Produces: `cansakhara_part( 'footer' )` and `cansakhara_part( 'side-nav' )`. The side nav exposes `[data-cansakhara-side-nav]` on its container; its dots are generated by JS in Task 14, since the original discovered sections at runtime.

- [ ] **Step 1: Read the originals**

```bash
git show nextjs-final:src/components/SiteFooter.tsx
git show nextjs-final:src/components/SideProgressNav.tsx
```

- [ ] **Step 2: Port the footer**

Straight markup port — no state. Keep the two outbound links (`https://mdmsl.com/`, `https://cansakhara.com/`) and the `can-sakhara-footer.svg` / `mel-de-magranetes.svg` assets, now referenced as `<?php echo esc_url( CANSAKHARA_URL . 'assets/img/can-sakhara-footer.svg' ); ?>`.

- [ ] **Step 3: Port the side nav shell**

The rail discovered its sections at runtime and rendered one dot per section, so the PHP emits only the empty container with the same classes the JSX gave it — including the `mix-blend-mode: difference` styling, the desktop-only visibility below 796px, and the initial hidden state. JS fills it.

- [ ] **Step 4: Copy the images across**

```bash
git show nextjs-final --stat -- public/images >/dev/null   # sanity check the tag has them
git checkout nextjs-final -- public/images
mv public/images/* assets/img/
rmdir public/images
```

- [ ] **Step 5: Add both parts to the page templates**

In each page template, after the closing `</main>`:

```php
cansakhara_part( 'side-nav' );
```

and `cansakhara_part( 'footer' );` inside the `.site-shell` at the foot of the content, matching where `SiteFooter` sat in each JSX page — check each page individually rather than assuming they agree.

- [ ] **Step 6: Extend the test**

Append to `tests/chrome.spec.js`:

```js
test('the footer renders its outbound links', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a[href="https://mdmsl.com/"]')).toHaveCount(1);
});

test('the side nav container is present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-cansakhara-side-nav]')).toHaveCount(1);
});
```

- [ ] **Step 7: Build, run, commit**

```bash
npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/chrome.spec.js --workers=1
git add -A && git commit -m "Port the footer and side progress nav markup to PHP"
```

---

## Task 9: Carousel markup parts

**Files:**
- Create: `templates/parts/experience-carousel.php`, `templates/parts/gallery-peek-strip.php`, `templates/parts/gallery-scroll-row.php`

**Interfaces:**
- Produces: `cansakhara_part( 'experience-carousel' )`, and `cansakhara_part( 'gallery-peek-strip', array( 'images' => array<string>, 'alt' => array<string> ) )`, `cansakhara_part( 'gallery-scroll-row', array( 'images' => array<string> ) )`. Behaviour hooks: `[data-cansakhara-carousel="experience"]`, `[data-cansakhara-carousel="peek"]`, `[data-cansakhara-carousel="scroll-row"]`, each with a `[data-cansakhara-track]` child and `[data-cansakhara-slide]` children.

- [ ] **Step 1: Read the originals**

```bash
git show nextjs-final:src/components/ExperienceCarousel.tsx
git show nextjs-final:src/components/GalleryPeekStrip.tsx
git show nextjs-final:src/components/GalleryScrollRow.tsx
git show nextjs-final:src/components/GalleryCarousel.tsx
```

`GalleryCarousel` is 36 lines and is a thin wrapper — check whether it is used at all before porting it, and if it is only a pass-through, fold it into its caller rather than creating a part for it.

- [ ] **Step 2: Port the slide markup only**

Each of these components computed a `transform` and a `transition` on the track in JS. The PHP emits the initial, un-transformed state: the track, the slides in source order, and the inline `style` attributes the JSX set at index 0. Everything time-varying belongs to Tasks 15–17.

The `ExperienceCarousel` slide copy is prose held in a JS array in the component. Move it into a PHP array at the top of the part, preserving the exact characters — the copy contains typographic apostrophes and em dashes that must not be normalised.

- [ ] **Step 3: Verify the PHP parses**

```bash
for f in templates/parts/*.php; do php -l "$f"; done
```

Expected: `No syntax errors detected` for each.

- [ ] **Step 4: Commit**

```bash
git add templates/parts
git commit -m "Port the carousel markup to PHP template parts"
```

---

## Task 10: Home page markup

**Files:**
- Modify: `templates/pages/home.php`
- Test: `tests/content.spec.js`

**Interfaces:**
- Consumes: every helper from Task 6 and every part from Tasks 7–9.
- Produces: the finished home page markup.

- [ ] **Step 1: Read the original**

```bash
git show nextjs-final:src/app/page.tsx
```

306 lines. Work top to bottom and port it section by section.

- [ ] **Step 2: Port the page**

Rules for this and the next two tasks:

- Every `className` string transfers character-for-character to `class`.
- Every `<Image>` becomes `<img>` with the same `width` and `height` the JSX passed, `alt` unchanged, and `loading="lazy"` on everything below the fold — the hero image gets `loading="eager"` and `fetchpriority="high"`, matching `next/image`'s `priority`.
- `fill` images become `<img>` with the classes already present plus whatever `object-*` utility the original relied on. Check the surrounding CSS before assuming.
- The `features` array (plot/house/bedrooms/sleeps/bathrooms/guest WC, six entries) becomes a PHP array in this file with the same values and units.
- `<Link href="/x">` becomes `<a href="<?php echo esc_url( home_url( '/x/' ) ); ?>">`.
- Keep `data-anim` and every other attribute the motion layer selects on. Grep the choreography for its selectors first:

```bash
git show nextjs-final:src/lib/motion/choreography.ts | grep -o 'querySelector[All]*([^)]*)' | sort -u
```

Anything named there is a contract, not decoration.

- [ ] **Step 3: Write the test**

Create `tests/content.spec.js`:

```js
import { test, expect } from '@playwright/test';

test('the home page renders its hero and feature figures', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-shell')).toBeVisible();
  await expect(page.getByText('6061')).toBeVisible();
  await expect(page.getByText('Bedrooms')).toBeVisible();
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
```

- [ ] **Step 4: Build and run**

```bash
npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/content.spec.js --workers=1
```

Expected: both PASS.

- [ ] **Step 5: Commit**

```bash
git add templates/pages/home.php tests/content.spec.js assets/css/public.css
git commit -m "Port the home page markup to PHP"
```

---

## Task 11: By Day and By Night page markup

**Files:**
- Modify: `templates/pages/by-day.php`, `templates/pages/by-night.php`
- Test: `tests/content.spec.js`

**Interfaces:**
- Consumes: the same helpers and parts as Task 10.

- [ ] **Step 1: Read the originals**

```bash
git show nextjs-final:src/app/by-day/page.tsx
git show nextjs-final:src/app/by-night/page.tsx
```

188 and 190 lines. They are close siblings — port `by-day` first, then diff the two originals and apply only the differences to `by-night`:

```bash
diff <(git show nextjs-final:src/app/by-day/page.tsx) <(git show nextjs-final:src/app/by-night/page.tsx)
```

- [ ] **Step 2: Port both pages**

Same rules as Task 10. The enquire call-to-action on both pages is `mailto:reservations@cansakhara.com` via `SecondaryButton` with `anim="block-button"` — keep that `data-anim` value.

- [ ] **Step 3: Extend the test**

Append to `tests/content.spec.js`:

```js
for (const path of ['/by-day/', '/by-night/']) {
  test(`${path} renders its enquire call to action and unbroken images`, async ({ page }) => {
    await page.goto(path);
    await expect(
      page.locator('a[href="mailto:reservations@cansakhara.com"]').first()
    ).toBeVisible();
    const broken = await page.locator('img').evaluateAll((imgs) =>
      imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src)
    );
    expect(broken).toEqual([]);
  });
}
```

- [ ] **Step 4: Build, run, commit**

```bash
npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/content.spec.js --workers=1
git add -A && git commit -m "Port the By Day and By Night page markup to PHP"
```

---

## Task 12: Motion layer

**Files:**
- Create: `assets/js/src/gsap.js`, `assets/js/src/animations.js`, `assets/js/src/choreography.js`, `assets/js/src/motion.js`, `assets/js/src/main.js`, `eslint.config.mjs`

**Interfaces:**
- Consumes: the DOM from Tasks 7–11.
- Produces:
  - `gsap.js` — exports `gsap`, `ScrollTrigger`, `SplitText`, `DrawSVGPlugin`, `EASE`, `DUR`, `STAGGER`, `DIST`, `SCROLLER_SELECTOR`, `getScroller()`, `scrollTriggerVars(trigger)`.
  - `animations.js` — same exports as the original module, including `drawSelf(path)` which returns a GSAP timeline.
  - `choreography.js` — `buildCommonChoreography(shell)`, `buildHomeHero(shell)`, `buildHomeScroll(shell)`, `buildDayNightHero(shell)`, `buildDayNightHeroTitle(shell)`, `buildDayNightScroll(shell)`.
  - `motion.js` — `initMotion(pageSlug)`, replacing the `MotionRoot` component.
  - `main.js` — the bundle entry, which reads the page slug from the body class and calls every module's init.

- [ ] **Step 1: Port the three motion modules**

```bash
git show nextjs-final:src/lib/motion/gsap.ts     > assets/js/src/gsap.js
git show nextjs-final:src/lib/motion/animations.ts > assets/js/src/animations.js
git show nextjs-final:src/lib/motion/choreography.ts > assets/js/src/choreography.js
```

Then, in each file, delete the TypeScript and nothing else: type annotations, `as const`, generic arguments on `querySelector<HTMLElement>`, and the `import { useGSAP } from "@gsap/react"` line together with `useGSAP` in the `registerPlugin` call and the re-export. The logic does not change — these modules are already plain imperative GSAP.

`SCROLLER_SELECTOR` stays `".site-shell"`. Every ScrollTrigger stays bound to it via `scrollTriggerVars`.

- [ ] **Step 2: Write `motion.js`, replacing `MotionRoot`**

```js
// The motion entry point. Replaces the MotionRoot client island: resolves the
// in-page scroller, waits for fonts, and builds per-page choreography inside a
// reduced-motion-gated matchMedia block.
import { gsap, ScrollTrigger } from './gsap.js';
import {
  buildCommonChoreography,
  buildHomeHero,
  buildHomeScroll,
  buildDayNightHero,
  buildDayNightHeroTitle,
  buildDayNightScroll,
} from './choreography.js';

export function initMotion( pageSlug ) {
  const shell = document.querySelector( '.site-shell' );
  if ( ! shell ) return;

  const mm = gsap.matchMedia();
  const isDayNight = pageSlug === 'by-day' || pageSlug === 'by-night';

  // Phase 1 — above-the-fold page load. Runs immediately so hero elements never
  // flash visible before animating.
  mm.add( '(prefers-reduced-motion: no-preference)', () => {
    if ( pageSlug === 'home' ) buildHomeHero( shell );
    else if ( isDayNight ) buildDayNightHero( shell );
  } );

  // Phase 2 — scroll and text reveals. Deferred until webfonts settle so
  // SplitText line breaks are measured against the real fonts.
  const buildScroll = () => {
    mm.add( '(prefers-reduced-motion: no-preference)', () => {
      buildCommonChoreography( shell );
      if ( pageSlug === 'home' ) buildHomeScroll( shell );
      else if ( isDayNight ) {
        buildDayNightHeroTitle( shell );
        buildDayNightScroll( shell );
      }
    } );
    ScrollTrigger.refresh();
  };

  if ( document.fonts?.status === 'loaded' ) buildScroll();
  else document.fonts?.ready.then( buildScroll );
}
```

There is no cleanup function: the Next.js version needed one because the island re-ran on client-side navigation. A WordPress page load is a full document load, so the page teardown is the browser's.

- [ ] **Step 3: Write the bundle entry**

```js
// Bundle entry. Reads the page identity from the body class the PHP renderer
// set, then starts every behaviour. Each init is a no-op when its markup is
// absent, so one bundle serves all three pages.
import { initMotion } from './motion.js';

function pageSlug() {
  const match = document.body.className.match( /page-cansakhara-([\w-]+)/ );
  if ( match ) return match[ 1 ];
  return document.body.classList.contains( 'home' ) ? 'home' : '';
}

function start() {
  const slug = pageSlug();
  initMotion( slug );
}

if ( document.readyState === 'loading' ) {
  document.addEventListener( 'DOMContentLoaded', start );
} else {
  start();
}
```

This needs the body class it reads. In `includes/render.php`, extend the `body_class` call in `cansakhara_document_open()` to add `'page-cansakhara-' . $slug`, taking `$slug` from a new `'slug'` key in `$args`, and pass it from each page template.

- [ ] **Step 4: Add the ESLint config**

```js
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['assets/js/src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
    },
  },
];
```

Add `@eslint/js` and `globals` to `package.json` devDependencies and to `approved-deps.json`.

- [ ] **Step 5: Build and check the bundle exists**

```bash
npm install
npm run build
npm run lint
ls -l assets/js/public.js
```

Expected: lint clean, and a bundle well over 100 KB (GSAP and its three plugins are in it).

- [ ] **Step 6: Write the test**

Create `tests/motion.spec.js`:

```js
import { test, expect } from '@playwright/test';

test('the motion layer runs and binds ScrollTrigger to the in-page scroller', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('reduced motion leaves the hero visible rather than hidden', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:8881/');
  await expect(page.locator('.site-shell')).toBeVisible();
  // The no-FOUC guard must not have hidden anything when motion is reduced.
  const ready = await page.evaluate(() =>
    document.documentElement.classList.contains('motion-ready')
  );
  expect(ready).toBe(false);
  await page.close();
});
```

- [ ] **Step 7: Run and commit**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/motion.spec.js --workers=1
git add -A && git commit -m "Port the GSAP motion layer and bundle it with esbuild"
```

---

## Task 13: Header and drawer behaviour

**Files:**
- Create: `assets/js/src/header.js`
- Modify: `assets/js/src/main.js`
- Test: `tests/chrome.spec.js`

**Interfaces:**
- Consumes: the markup hooks from Task 7, `drawSelf` from Task 12.
- Produces: `initHeader(): void`, exported from `header.js`, called by `main.js`.

- [ ] **Step 1: Write the failing test**

Append to `tests/chrome.spec.js`:

```js
test('the drawer opens, traps focus, closes on Escape and returns focus', async ({ page }) => {
  await page.goto('/');
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
  await page.goto('/');
  const header = page.locator('[data-cansakhara-header]');
  await page.evaluate(() => { document.querySelector('.site-shell').scrollTop = 800; });
  await expect(header).toHaveClass(/-translate-y-full/);
  await page.evaluate(() => { document.querySelector('.site-shell').scrollTop = 400; });
  await expect(header).toHaveClass(/translate-y-0/);
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/chrome.spec.js --workers=1
```

Expected: the two new tests FAIL — no JS is bound to the header yet.

- [ ] **Step 3: Implement `header.js`**

Port `SiteHeader`'s two effects and `MenuDrawer`'s one, with the React state replaced by class toggles on the same elements:

- `open` → toggle the drawer's open/closed classes, `aria-hidden` on `#site-menu`, `aria-expanded` on the trigger, focus to the close button on open and back to the trigger on close, Escape listener bound while open, and `.site-shell`'s `style.overflow` saved and restored.
- `scrolled` → past 100px of `.site-shell` scroll, apply the solid background colour from `data-cansakhara-solid-color`; below it, restore the transparent `bg-white/5 backdrop-blur-[3px]` classes. On `by-day` and `by-night` the header is solid from the start, exactly as `solid = scrolled || theme !== 'home'` did.
- `hidden` → the same 4px jitter threshold and 100px floor as the original; toggle `-translate-y-full` against `translate-y-0`, and never hide while the drawer is open.
- The logo draw → `drawSelf()` on the `[data-cansakhara-logo-path]` element inside a `gsap.matchMedia( '(prefers-reduced-motion: no-preference)' )` block, holding the returned timeline so the scroll-up transition can `restart( true )` it, exactly as the original did.

Bind the scroll listener to `.site-shell` with `{ passive: true }`. Binding it to `window` is the failure this port is most likely to make.

- [ ] **Step 4: Call it from `main.js`**

```js
import { initHeader } from './header.js';
// …inside start():
initHeader();
```

- [ ] **Step 5: Build, run, commit**

```bash
npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/chrome.spec.js --workers=1
git add -A && git commit -m "Port the header and drawer behaviour to vanilla JS"
```

---

## Task 14: Side progress nav behaviour

**Files:**
- Create: `assets/js/src/side-nav.js`
- Modify: `assets/js/src/main.js`
- Test: `tests/chrome.spec.js`

**Interfaces:**
- Consumes: `[data-cansakhara-side-nav]` from Task 8.
- Produces: `initSideNav(): void`.

- [ ] **Step 1: Write the failing test**

```js
test('the side nav builds one dot per section and rings the one in view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const sections = await page.locator('.site-shell > section').count();
  expect(sections).toBeGreaterThan(1);
  await expect(page.locator('[data-cansakhara-side-nav] [data-cansakhara-dot]')).toHaveCount(sections);

  await page.evaluate(() => { document.querySelector('.site-shell').scrollTop = 2000; });
  await expect(page.locator('[data-cansakhara-side-nav] [data-cansakhara-dot][data-active="true"]')).toHaveCount(1);
});
```

- [ ] **Step 2: Run it and watch it fail**

Expected: zero dots found.

- [ ] **Step 3: Implement `side-nav.js`**

Port `SideProgressNav` as-is, with React state replaced by DOM writes:

- Discover `scroller.querySelectorAll(':scope > section')` and render one dot per section into the container, each with `data-cansakhara-dot`.
- `topOf(scroller, el)` is the original's `getBoundingClientRect` arithmetic — copy it exactly; it is correct regardless of each section's `offsetParent`, which a naive `offsetTop` is not.
- Active section is the last one whose top has crossed a line 40% down the viewport.
- The rail reveals once `scrollTop > scroller.clientHeight * 0.6`.
- Mark the active dot with `data-active="true"` and give it the ring class the JSX used.
- Rebuild on `resize`, since section heights change.

There is no route change to re-run on, so the effect's `pathname` dependency disappears.

- [ ] **Step 4: Build, run, commit**

```bash
npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/chrome.spec.js --workers=1
git add -A && git commit -m "Port the side progress nav behaviour to vanilla JS"
```

---

## Task 15: Experience carousel behaviour

**Files:**
- Create: `assets/js/src/experience-carousel.js`
- Modify: `assets/js/src/main.js`
- Test: `tests/carousels.spec.js`

**Interfaces:**
- Consumes: `[data-cansakhara-carousel="experience"]` from Task 9.
- Produces: `initExperienceCarousel(): void`.

This is the largest single piece of the port — 361 lines of drag, snap, transition-end handling and an infinite loop. Read the original in full before writing anything.

- [ ] **Step 1: Read the original**

```bash
git show nextjs-final:src/components/ExperienceCarousel.tsx
```

Note in particular: `DURATION_MS`, `EASING`, the `transitionend` guard that ignores any `propertyName` other than `transform`, and the comment that the track's transform lives in CSS so the per-slide step can change at the breakpoint. Two prior commits fixed rendering and drag-snap lockups in this component (`a14c1dc`, `12ff3d8`) — read them so the port does not reintroduce what they fixed:

```bash
git show a14c1dc -- src/components/ExperienceCarousel.tsx
git show 12ff3d8 -- src/components/GalleryScrollRow.tsx
```

- [ ] **Step 2: Write the failing test**

Create `tests/carousels.spec.js`:

```js
import { test, expect } from '@playwright/test';

test('the experience carousel advances and wraps', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('[data-cansakhara-carousel="experience"]');
  const next = root.locator('[data-cansakhara-next]');
  const slides = await root.locator('[data-cansakhara-slide]').count();
  expect(slides).toBeGreaterThan(1);

  const before = await root.getAttribute('data-cansakhara-index');
  await next.click();
  await expect(root).not.toHaveAttribute('data-cansakhara-index', before);

  // Wrapping past the last slide returns to the first rather than stalling.
  for (let i = 0; i < slides; i += 1) {
    await next.click();
    await page.waitForTimeout(120);
  }
  await expect(root).toHaveAttribute('data-cansakhara-index', /^\d+$/);
});

test('dragging the experience carousel snaps and does not lock up', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('[data-cansakhara-carousel="experience"]');
  const box = await root.boundingBox();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(600);

  // After the snap settles a further click must still advance it.
  const settled = await root.getAttribute('data-cansakhara-index');
  await root.locator('[data-cansakhara-next]').click();
  await expect(root).not.toHaveAttribute('data-cansakhara-index', settled);
});
```

- [ ] **Step 3: Run it and watch it fail**

Expected: FAIL — no `data-cansakhara-index` attribute, no bound controls.

- [ ] **Step 4: Implement the behaviour**

Port the component's logic, replacing React state with an internal `state` object and a `render()` that writes to the DOM. The index is mirrored onto the root as `data-cansakhara-index` so it is observable from a test — that attribute is new, and the only thing in this port that the original did not have.

Keep verbatim: the duration and easing constants, the reduced-motion `1ms` transition substitution, the `propertyName !== 'transform'` guard, the drag threshold, and the pointer-event handling including `setPointerCapture`.

- [ ] **Step 5: Build, run, commit**

```bash
npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/carousels.spec.js --workers=1
git add -A && git commit -m "Port the experience carousel behaviour to vanilla JS"
```

---

## Task 16: Gallery peek strip behaviour

**Files:**
- Create: `assets/js/src/gallery-peek-strip.js`
- Modify: `assets/js/src/main.js`
- Test: `tests/carousels.spec.js`

**Interfaces:**
- Consumes: `[data-cansakhara-carousel="peek"]` from Task 9.
- Produces: `initGalleryPeekStrip(): void`.

- [ ] **Step 1: Read the original**

```bash
git show nextjs-final:src/components/GalleryPeekStrip.tsx
```

228 lines, and structurally the same machine as Task 15 with a different pitch: the 278px mobile slide, with the pitch and gap in the CSS track transform.

- [ ] **Step 2: Write the failing test**

```js
test('the gallery peek strip advances', async ({ page }) => {
  await page.goto('/by-day/');
  const root = page.locator('[data-cansakhara-carousel="peek"]').first();
  await expect(root).toBeVisible();
  const before = await root.getAttribute('data-cansakhara-index');
  await root.locator('[data-cansakhara-next]').click();
  await page.waitForTimeout(600);
  await expect(root).not.toHaveAttribute('data-cansakhara-index', before);
});
```

Confirm from the ported templates which page actually carries this strip before fixing the route in the test.

- [ ] **Step 3: Run it, implement, re-run**

Same porting rules as Task 15. Do not attempt to share code between the two carousels on this pass — they differ in pitch, peek and wrap behaviour, and merging them is how the design drifts. Extracting a shared core is a reasonable follow-up once both are proven identical.

- [ ] **Step 4: Build, run, commit**

```bash
npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/carousels.spec.js --workers=1
git add -A && git commit -m "Port the gallery peek strip behaviour to vanilla JS"
```

---

## Task 17: Gallery scroll row behaviour

**Files:**
- Create: `assets/js/src/gallery-scroll-row.js`
- Modify: `assets/js/src/main.js`
- Test: `tests/carousels.spec.js`

**Interfaces:**
- Consumes: `[data-cansakhara-carousel="scroll-row"]` from Task 9.
- Produces: `initGalleryScrollRow(): void`.

- [ ] **Step 1: Read the original**

```bash
git show nextjs-final:src/components/GalleryScrollRow.tsx
```

134 lines. Its header comment explains why it does **not** use ScrollTrigger's transform-pin: inside the custom `.site-shell` scroller, pinning has to rewrite a transform every frame to counteract the scroll, which lags real momentum. Whatever it does instead, port that — do not "simplify" it back to a pin.

- [ ] **Step 2: Write the failing test**

```js
test('the gallery scroll row moves horizontally as the page scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const track = page.locator('[data-cansakhara-carousel="scroll-row"] [data-cansakhara-track]');
  await track.scrollIntoViewIfNeeded();
  const before = await track.evaluate((el) => getComputedStyle(el).transform);
  await page.evaluate(() => { document.querySelector('.site-shell').scrollTop += 600; });
  await page.waitForTimeout(400);
  const after = await track.evaluate((el) => getComputedStyle(el).transform);
  expect(after).not.toBe(before);
});
```

Confirm which page carries this row before fixing the route.

- [ ] **Step 3: Run it, implement, re-run**

- [ ] **Step 4: Build, run the whole suite, commit**

```bash
npm run build
npm run lint
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test --workers=1
git add -A && git commit -m "Port the gallery scroll row behaviour to vanilla JS"
```

---

## Task 18: The fidelity diff

This is the acceptance gate for the whole plan. Everything before it was preparation for this comparison.

**Files:**
- Create: `tests/fidelity.spec.js`
- Modify: whatever the diff says is wrong

**Interfaces:**
- Consumes: `tests/baselines/*.png` from Task 1, and the finished plugin.

- [ ] **Step 1: Write the fidelity spec**

Create `tests/fidelity.spec.js`:

```js
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const ROUTES = { home: '/', 'by-day': '/by-day/', 'by-night': '/by-night/' };
const WIDTHS = { mobile: 390, desktop: 1440 };

for (const [name, path] of Object.entries(ROUTES)) {
  for (const [size, width] of Object.entries(WIDTHS)) {
    test(`${name} at ${size} matches the Next.js baseline`, async ({ browser }) => {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
        // Same conditions the baselines were captured under.
        reducedMotion: 'reduce',
      });
      await page.goto((process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:8881') + path,
        { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);

      const shot = await page.locator('.site-shell').screenshot({ scale: 'css' });
      const baseline = readFileSync(`tests/baselines/${name}-${size}.png`);

      expect(shot).toMatchSnapshot(`${name}-${size}.png`, {
        maxDiffPixelRatio: 0.01,
      });
      expect(baseline.length).toBeGreaterThan(0);
      await page.close();
    });
  }
}
```

- [ ] **Step 2: Seed the snapshots from the baselines**

```bash
mkdir -p tests/fidelity.spec.js-snapshots
for n in home by-day by-night; do
  for s in mobile desktop; do
    cp "tests/baselines/$n-$s.png" "tests/fidelity.spec.js-snapshots/$n-$s-chromium-win32.png"
  done
done
```

Adjust the platform suffix to whatever Playwright reports on the first run — it will name the file it expected in the failure message.

- [ ] **Step 3: Run the diff**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test tests/fidelity.spec.js --workers=1
```

- [ ] **Step 4: Fix what it finds**

For every failure, open the diff image Playwright writes to `test-results/` and fix the **plugin**, never the baseline. Rank the likely causes in this order before looking anywhere else:

1. A Tailwind class string that was retyped rather than copied.
2. A font weight or style missing from `assets/fonts/`, so the browser synthesised it.
3. An `<img>` missing the `width`/`height` the JSX supplied, changing the layout box.
4. A section wrapper element dropped in the port, collapsing a margin the design depends on.

Never widen `maxDiffPixelRatio` to make a failure go away. If a difference is genuinely acceptable — antialiasing on a rotated element, say — say so to Luke and get it agreed before recording it.

- [ ] **Step 5: Commit**

```bash
git add tests/fidelity.spec.js tests/fidelity.spec.js-snapshots
git commit -m "Add the fidelity diff against the Next.js baselines"
```

---

## Task 19: Remove Next.js and finish the packaging

Only start this once Task 18 is green. Until then the Next.js app is the reference.

**Files:**
- Delete: `src/`, `next.config.ts`, `next-env.d.ts`, `postcss.config.mjs`, `tsconfig.json`, `tsconfig.tsbuildinfo`, `.next/`, `AGENTS.md`, `DOMSCRIBE-FIXES-CHECKLIST.md`, `.domscribe/`, `scripts/capture-baselines.mjs`
- Create: `scripts/build-zip.mjs`, `readme.txt`
- Modify: `README.md`, `CHANGELOG.md`, `blueworx-client-cansakhara.php`

- [ ] **Step 1: Delete the Next.js app**

```bash
git rm -r --quiet src next.config.ts next-env.d.ts postcss.config.mjs tsconfig.json AGENTS.md DOMSCRIBE-FIXES-CHECKLIST.md scripts/capture-baselines.mjs
rm -rf .next .domscribe tsconfig.tsbuildinfo
```

`AGENTS.md` goes here rather than in Task 2 because it holds the Figma design rules that were the reference throughout the port. Its design-fidelity rules still apply to this plugin — before deleting it, move the **Design fidelity** and **Layout** sections into `README.md` so they survive.

- [ ] **Step 2: Write the zip build script**

Create `scripts/build-zip.mjs`. It must:

- Stage from an **explicit allowlist** — `blueworx-client-cansakhara.php`, `uninstall.php`, `readme.txt`, `includes/`, `templates/`, `assets/` — into `dist/blueworx-client-cansakhara/`. A new development directory should be excluded because nobody added it to the list, not shipped because nobody remembered to exclude it.
- Read the version from the `Version:` header of the main plugin file, not from `package.json`.
- Remove any existing `../blueworx-client-cansakhara*.zip` first, so exactly one is ever present.
- Build with bsdtar, never `Compress-Archive`:

```js
const tar = process.platform === 'win32'
  ? `${process.env.WINDIR}\\System32\\tar.exe`
  : 'tar';
execFileSync(tar, ['-a', '-c', '-f', `../blueworx-client-cansakhara-${version}.zip`,
  '-C', 'dist', 'blueworx-client-cansakhara'], { stdio: 'inherit' });
```

- Verify the artifact it just built by listing it and asserting every entry starts `blueworx-client-cansakhara/`, uses forward slashes, and is nested exactly one level, with `blueworx-client-cansakhara/blueworx-client-cansakhara.php` present. Exit non-zero if not.

- [ ] **Step 3: Add the auto-update bootstrap**

Vendor the Plugin Update Checker and paste in `templates/plugin-update-checker-bootstrap.php` from the Foundation, following `docs/wordpress-auto-updates.md`. Add the vendored library to the zip allowlist.

- [ ] **Step 4: Rewrite `README.md`**

What the plugin is, how to run the local WordPress harness, how to build, and the design-fidelity rules carried over from `AGENTS.md`. Delete the Next.js instructions.

- [ ] **Step 5: Verify the zip**

```bash
npm run build
npm run build:zip
unzip -l ../blueworx-client-cansakhara-0.1.0.zip | head -20
```

Expected: every entry reads `blueworx-client-cansakhara/…` with forward slashes, nested one level, with the main PHP file directly inside. Any backslash means the archive is broken — rebuild with bsdtar.

- [ ] **Step 6: Run everything**

```bash
npm run lint
find . -name '*.php' -not -path './vendor/*' -not -path './node_modules/*' -not -path './dist/*' -print0 | xargs -0 -n1 php -l
composer install --quiet && ./vendor/bin/phpcs
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8881 npx playwright test --workers=1
```

Expected: lint clean, PHP clean, PHPCS clean, every spec passing and none skipped.

- [ ] **Step 7: Update the changelog and open the pull request**

Record the conversion under `0.1.0`. Then open the PR — do not merge it, and do not push a tag.

```bash
git add -A
git commit -m "Remove the Next.js app and package the plugin for release"
```

---

## Self-review notes

- Spec sections and their tasks: repo shape → 2, 19; routing and rendering → 3, 4; markup → 6–11; styles and fonts → 5; images → 8, 10; behaviour → 12–17; build → 5, 19; testing → 1, 18 and the specs throughout; CI and releases → 2, 19.
- Names used consistently across tasks: `cansakhara_page_slug`, `cansakhara_part`, `cansakhara_document_open`/`_close`, `initMotion`, `initHeader`, `initSideNav`, `initExperienceCarousel`, `initGalleryPeekStrip`, `initGalleryScrollRow`.
- Task 12 adds a `'slug'` argument to `cansakhara_document_open()` that Task 4 did not define. That is deliberate and called out in Task 12 Step 3 — do not skip it, or `main.js` reads an empty page slug and no per-page choreography runs.

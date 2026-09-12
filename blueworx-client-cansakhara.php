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

// The design system registrar must load at top level, before any hook — see
// the header comment in that file.
require_once CANSAKHARA_DIR . 'assets/blueworx-admin-design.php';
require_once CANSAKHARA_DIR . 'includes/settings.php';

require_once CANSAKHARA_DIR . 'plugin-update-checker/plugin-update-checker.php';

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

// Sites update themselves from this repo's GitHub Releases. The third argument
// must equal the plugin's folder name, the release workflow's plugin_slug, and
// the site's installed directory name; if they disagree, WordPress installs the
// update alongside the original as a second copy and deactivates it.
$cansakhara_update_checker = PucFactory::buildUpdateChecker(
	'https://github.com/blueworx-io/blueworx_client_cansakhara/',
	__FILE__,
	CANSAKHARA_SLUG
);

/*
 * The repo is private, so a site needs a token to see releases at all. It
 * lives in wp-config.php — never in the plugin, never in the repo:
 *
 *     define( 'BLUEWORX_PLUGIN_UPDATE_TOKEN', 'github_pat_...' );
 */
if ( defined( 'BLUEWORX_PLUGIN_UPDATE_TOKEN' ) && BLUEWORX_PLUGIN_UPDATE_TOKEN ) {
	$cansakhara_update_checker->setAuthentication( BLUEWORX_PLUGIN_UPDATE_TOKEN );
}

/*
 * Install the zip attached to the Release, not GitHub's auto-generated source
 * tarball, whose folder is named <repo>-<version> — WordPress would treat that
 * as a different plugin and deactivate the original, and it would ship every
 * dev file in the repo.
 */
$cansakhara_update_checker->getVcsApi()->enableReleaseAssets();

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

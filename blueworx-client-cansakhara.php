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

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

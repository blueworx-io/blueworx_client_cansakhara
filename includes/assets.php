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
 * The ownership test itself lives in one place — cansakhara_page_is_ours() —
 * so there is no second copy to drift. This only adds "and it is the page
 * being viewed".
 *
 * @return bool
 */
function cansakhara_is_owned_request() {
	return is_singular( 'page' ) && cansakhara_page_is_ours( get_queried_object_id() );
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

	wp_localize_script(
		'cansakhara-public',
		'cansakharaLogin',
		array(
			'endpoint'     => rest_url( 'cansakhara/v1/login' ),
			'genericError' => cansakhara_login_failed_message(),
		)
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

	/**
	 * Filters the stylesheet handles the sweep leaves alone on owned pages.
	 *
	 * Foreign scripts are kept by design, so a consent banner or chat widget
	 * still runs — but its stylesheet is dropped with everything else and it
	 * renders unstyled. This is the seam for rescuing that one handle without
	 * editing the plugin:
	 *
	 *     add_filter( 'cansakhara_keep_styles', function ( $keep ) {
	 *         $keep[] = 'my-consent-banner';
	 *         return $keep;
	 *     } );
	 *
	 * Anything added here is, by definition, allowed to affect the design.
	 *
	 * @param string[] $keep Stylesheet handles to keep.
	 */
	$keep = (array) apply_filters(
		'cansakhara_keep_styles',
		array( 'cansakhara-public', 'admin-bar', 'dashicons' )
	);

	foreach ( wp_styles()->queue as $handle ) {
		if ( ! in_array( $handle, $keep, true ) ) {
			wp_dequeue_style( $handle );
		}
	}
}
add_action( 'wp_enqueue_scripts', 'cansakhara_sweep_foreign_assets', 100 );

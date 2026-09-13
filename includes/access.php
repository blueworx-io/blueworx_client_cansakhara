<?php
/**
 * Private access: every owned page except Welcome needs a signed-in visitor.
 *
 * The Welcome page is the site's front door and the only public page. A
 * signed-out visitor who lands anywhere else is sent there to sign in or
 * enquire. Signing in is handled in includes/login.php; this file only
 * decides who may see what.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Whether an owned page is open to signed-out visitors.
 *
 * @param string $slug Owned-page slug.
 * @return bool
 */
function cansakhara_page_is_public( $slug ) {
	return 'welcome' === $slug;
}

/**
 * Sends signed-out visitors from a private page to Welcome.
 *
 * Runs before the login post handler on the same hook, but never touches
 * Welcome, which is the only page whose login form a signed-out visitor
 * can reach.
 *
 * @return void
 */
function cansakhara_require_login() {
	if ( is_user_logged_in() || ! cansakhara_is_owned_request() ) {
		return;
	}

	if ( cansakhara_page_is_public( cansakhara_page_slug( get_queried_object_id() ) ) ) {
		return;
	}

	wp_safe_redirect( cansakhara_page_url( 'welcome' ) );
	exit;
}
add_action( 'template_redirect', 'cansakhara_require_login', 5 );

/**
 * Hides the WordPress admin bar from guests on the front end.
 *
 * A guest's account exists only to open the door; the site should look the
 * same to them as it does to a signed-out visitor. Anyone who can edit
 * content keeps the bar.
 *
 * @param bool $show Whether WordPress would show it.
 * @return bool
 */
function cansakhara_hide_admin_bar_from_guests( $show ) {
	if ( is_admin() || current_user_can( 'edit_posts' ) ) {
		return $show;
	}

	return false;
}
add_filter( 'show_admin_bar', 'cansakhara_hide_admin_bar_from_guests' );

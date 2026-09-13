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

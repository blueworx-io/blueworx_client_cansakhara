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

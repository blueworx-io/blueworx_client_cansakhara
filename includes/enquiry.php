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

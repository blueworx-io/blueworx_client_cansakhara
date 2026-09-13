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

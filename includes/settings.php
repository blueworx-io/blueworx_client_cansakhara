<?php
/**
 * The plugin's settings: where a guest lands after signing in, and which
 * SureForms form the Enquire popup shows.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const CANSAKHARA_SETTINGS_OPTION = 'cansakhara_settings';
const CANSAKHARA_SETTINGS_SLUG   = 'cansakhara';

/**
 * The saved settings, with defaults filled in and values typed.
 *
 * @return array{login_redirect:int, enquiry_form:int}
 */
function cansakhara_settings() {
	$saved = (array) get_option( CANSAKHARA_SETTINGS_OPTION, array() );

	return array(
		'login_redirect' => isset( $saved['login_redirect'] ) ? (int) $saved['login_redirect'] : 0,
		'enquiry_form'   => isset( $saved['enquiry_form'] ) ? (int) $saved['enquiry_form'] : 0,
	);
}

/**
 * Where a guest is sent after signing in.
 *
 * The chosen page, or the Home page when nothing is chosen or the chosen
 * page has since been deleted or unpublished.
 *
 * @return string URL.
 */
function cansakhara_login_redirect_url() {
	$page_id = cansakhara_settings()['login_redirect'];

	if ( $page_id > 0 && 'publish' === get_post_status( $page_id ) ) {
		$url = get_permalink( $page_id );

		if ( is_string( $url ) && '' !== $url ) {
			return $url;
		}
	}

	return cansakhara_page_url( 'home' );
}

/**
 * The chosen SureForms form, or 0.
 *
 * @return int
 */
function cansakhara_enquiry_form_id() {
	return cansakhara_settings()['enquiry_form'];
}

/**
 * Whether SureForms is active on this site.
 *
 * @return bool
 */
function cansakhara_sureforms_active() {
	return post_type_exists( 'sureforms_form' ) && shortcode_exists( 'sureforms' );
}

/**
 * The settings screen's URL.
 *
 * @return string
 */
function cansakhara_settings_url() {
	return admin_url( 'options-general.php?page=' . CANSAKHARA_SETTINGS_SLUG );
}

/**
 * Sanitises the settings on save. Unknown keys are dropped; a page that is not
 * a page, or a form that is not a SureForms form, becomes 0.
 *
 * @param mixed $input Raw option value.
 * @return array{login_redirect:int, enquiry_form:int}
 */
function cansakhara_sanitize_settings( $input ) {
	$input = is_array( $input ) ? $input : array();

	$page_id = isset( $input['login_redirect'] ) ? absint( $input['login_redirect'] ) : 0;
	if ( $page_id > 0 && 'page' !== get_post_type( $page_id ) ) {
		$page_id = 0;
	}

	// The select is `disabled` (and so unsubmitted) while SureForms is
	// inactive; treat its absence as "unchanged" rather than clearing the
	// saved choice out from under a site owner who has just deactivated it.
	if ( isset( $input['enquiry_form'] ) ) {
		$form_id = absint( $input['enquiry_form'] );
		if ( $form_id > 0 && 'sureforms_form' !== get_post_type( $form_id ) ) {
			$form_id = 0;
		}
	} else {
		$form_id = cansakhara_settings()['enquiry_form'];
	}

	return array(
		'login_redirect' => $page_id,
		'enquiry_form'   => $form_id,
	);
}

/**
 * Registers the option.
 *
 * @return void
 */
function cansakhara_register_settings() {
	register_setting(
		'cansakhara_settings_group',
		CANSAKHARA_SETTINGS_OPTION,
		array(
			'type'              => 'array',
			'sanitize_callback' => 'cansakhara_sanitize_settings',
			'default'           => array(),
		)
	);
}
add_action( 'admin_init', 'cansakhara_register_settings' );

/**
 * Adds Settings → Can Sakhara.
 *
 * @return void
 */
function cansakhara_add_settings_page() {
	add_options_page(
		__( 'Can Sakhara', 'blueworx-client-cansakhara' ),
		__( 'Can Sakhara', 'blueworx-client-cansakhara' ),
		'manage_options',
		CANSAKHARA_SETTINGS_SLUG,
		'cansakhara_render_settings_page'
	);
}
add_action( 'admin_menu', 'cansakhara_add_settings_page' );

/**
 * Loads the design system and the chrome overrides on the settings screen only.
 *
 * @param string $hook_suffix Current admin screen.
 * @return void
 */
function cansakhara_enqueue_admin_assets( $hook_suffix ) {
	if ( 'settings_page_' . CANSAKHARA_SETTINGS_SLUG !== $hook_suffix ) {
		return;
	}

	blueworx_admin_design_enqueue();
	blueworx_admin_design_enqueue_icons();

	wp_enqueue_style(
		'cansakhara-admin',
		CANSAKHARA_URL . 'assets/css/admin.css',
		array( 'blueworx-admin-design' ),
		CANSAKHARA_VERSION
	);
}
add_action( 'admin_enqueue_scripts', 'cansakhara_enqueue_admin_assets' );

/**
 * Renders Settings → Can Sakhara from the blueworx-admin-design system.
 *
 * @return void
 */
function cansakhara_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$settings  = cansakhara_settings();
	$sureforms = cansakhara_sureforms_active();
	$forms     = $sureforms ? get_posts(
		array(
			'post_type'      => 'sureforms_form',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
		)
	) : array();
	$saved     = isset( $_GET['settings-updated'] ) && 'true' === $_GET['settings-updated']; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only flag set by options.php after a nonce-checked save.
	?>
	<div class="wrap bw-wrap">
		<?php // The form is the .bw-page itself, so the save bar is its last flex child and margin-top:auto pins it. ?>
		<form method="post" action="options.php" class="bw-admin bw-page">
			<?php settings_fields( 'cansakhara_settings_group' ); ?>
			<header class="bw-pagehead">
				<div class="bw-pagehead__titles">
					<p class="bw-pagehead__eyebrow"><?php esc_html_e( 'Can Sakhara', 'blueworx-client-cansakhara' ); ?></p>
					<h1 class="bw-pagehead__h1"><?php esc_html_e( 'Settings', 'blueworx-client-cansakhara' ); ?></h1>
					<p class="bw-pagehead__lede"><?php esc_html_e( 'Where guests go after they sign in, and which form the Enquire popup shows.', 'blueworx-client-cansakhara' ); ?></p>
				</div>
			</header>

			<div class="bw-page__body bw-page__body--single">
				<div class="bw-panels">
					<?php if ( $saved ) : ?>
					<div class="bw-notice bw-notice--success" role="status">
						<i class="bw-icon bw-notice__icon" data-lucide="circle-check"></i>
						<div class="bw-notice__body">
							<p class="bw-notice__text"><?php esc_html_e( 'Settings saved.', 'blueworx-client-cansakhara' ); ?></p>
						</div>
					</div>
					<?php endif; ?>

					<section class="bw-card bw-settingscard">
						<div class="bw-card__head">
							<div class="bw-card__titles">
								<p class="bw-card__eyebrow"><?php esc_html_e( 'Guests', 'blueworx-client-cansakhara' ); ?></p>
								<h2 class="bw-card__title"><?php esc_html_e( 'Sign in', 'blueworx-client-cansakhara' ); ?></h2>
								<p class="bw-settingscard__desc"><?php esc_html_e( 'Guests sign in from the Login popup with the WordPress account you have given them.', 'blueworx-client-cansakhara' ); ?></p>
							</div>
						</div>
						<div class="bw-card__body bw-settingscard__body">
							<div class="bw-formrow">
								<label class="bw-formrow__label" for="cansakhara-login-redirect"><?php esc_html_e( 'After login, send guests to', 'blueworx-client-cansakhara' ); ?></label>
								<div class="bw-formrow__control">
									<span class="bw-select">
										<?php
										// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_dropdown_pages() escapes every attribute and label it prints.
										wp_dropdown_pages(
											array(
												'name'     => CANSAKHARA_SETTINGS_OPTION . '[login_redirect]',
												'id'       => 'cansakhara-login-redirect',
												'class'    => 'bw-select__el',
												'selected' => $settings['login_redirect'],
												'show_option_none' => __( 'Home page', 'blueworx-client-cansakhara' ),
												'option_none_value' => '0',
											)
										);
										// phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped
										?>
										<i class="bw-icon bw-icon--14 bw-select__arrow" data-lucide="chevron-down"></i>
									</span>
									<p class="bw-formrow__help"><?php esc_html_e( 'The page a guest lands on once their details are accepted.', 'blueworx-client-cansakhara' ); ?></p>
								</div>
							</div>
						</div>
					</section>

					<section class="bw-card bw-settingscard">
						<div class="bw-card__head">
							<div class="bw-card__titles">
								<p class="bw-card__eyebrow"><?php esc_html_e( 'Enquiries', 'blueworx-client-cansakhara' ); ?></p>
								<h2 class="bw-card__title"><?php esc_html_e( 'Enquiry form', 'blueworx-client-cansakhara' ); ?></h2>
								<p class="bw-settingscard__desc"><?php esc_html_e( 'The Enquire popup shows this SureForms form, restyled to match the site.', 'blueworx-client-cansakhara' ); ?></p>
							</div>
						</div>
						<div class="bw-card__body bw-settingscard__body">
							<div class="bw-formrow">
								<label class="bw-formrow__label" for="cansakhara-enquiry-form"><?php esc_html_e( 'Enquiry form', 'blueworx-client-cansakhara' ); ?></label>
								<div class="bw-formrow__control">
									<span class="bw-select">
										<select
											name="<?php echo esc_attr( CANSAKHARA_SETTINGS_OPTION ); ?>[enquiry_form]"
											id="cansakhara-enquiry-form"
											class="bw-select__el"
											aria-describedby="cansakhara-enquiry-form-help"
											<?php disabled( ! $sureforms ); ?>
										>
											<option value="0"><?php esc_html_e( 'None', 'blueworx-client-cansakhara' ); ?></option>
											<?php foreach ( $forms as $form ) : ?>
											<option value="<?php echo esc_attr( (string) $form->ID ); ?>" <?php selected( $settings['enquiry_form'], $form->ID ); ?>>
												<?php echo esc_html( get_the_title( $form ) ); ?>
											</option>
											<?php endforeach; ?>
										</select>
										<i class="bw-icon bw-icon--14 bw-select__arrow" data-lucide="chevron-down"></i>
									</span>
									<p class="bw-formrow__help" id="cansakhara-enquiry-form-help">
										<?php
										if ( $sureforms ) {
											esc_html_e( 'Until a form is chosen, the popup shows an email link instead.', 'blueworx-client-cansakhara' );
										} else {
											esc_html_e( 'Install and activate SureForms to choose a form. Until then the popup shows an email link instead.', 'blueworx-client-cansakhara' );
										}
										?>
									</p>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>

			<div class="bw-savebar">
				<p class="bw-savebar__hint">
					<i class="bw-icon bw-icon--14" data-lucide="info"></i>
					<?php esc_html_e( 'Changes apply as soon as you save.', 'blueworx-client-cansakhara' ); ?>
				</p>
				<button type="submit" class="bw-btn bw-btn--primary"><?php esc_html_e( 'Save changes', 'blueworx-client-cansakhara' ); ?></button>
			</div>
		</form>
	</div>
	<?php
}

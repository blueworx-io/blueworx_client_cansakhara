<?php
/**
 * The Theme tab: edit the typography roles and palette.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Which settings tab is showing. Only 'general' and 'theme' exist.
 *
 * @return string
 */
function cansakhara_settings_tab() {
	$tab = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'general'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only view switch.
	return 'theme' === $tab ? 'theme' : 'general';
}

/**
 * The General / Theme tab strip under the page header.
 *
 * @param string $tab Current tab.
 * @return void
 */
function cansakhara_render_settings_tabs( $tab ) {
	?>
	<nav class="bw-tabs" role="tablist" aria-label="<?php esc_attr_e( 'Settings sections', 'blueworx-client-cansakhara' ); ?>">
		<a class="bw-tab <?php echo 'general' === $tab ? 'is-active' : ''; ?>" role="tab" aria-selected="<?php echo 'general' === $tab ? 'true' : 'false'; ?>" href="<?php echo esc_url( cansakhara_settings_url() ); ?>"><?php esc_html_e( 'General', 'blueworx-client-cansakhara' ); ?></a>
		<a class="bw-tab <?php echo 'theme' === $tab ? 'is-active' : ''; ?>" role="tab" aria-selected="<?php echo 'theme' === $tab ? 'true' : 'false'; ?>" href="<?php echo esc_url( add_query_arg( 'tab', 'theme', cansakhara_settings_url() ) ); ?>"><?php esc_html_e( 'Theme', 'blueworx-client-cansakhara' ); ?></a>
	</nav>
	<?php
}

/**
 * One typography table for a breakpoint.
 *
 * @param string $bp    'desktop' or 'mobile'.
 * @param array  $theme Effective theme.
 * @return void
 */
function cansakhara_render_type_table( $bp, $theme ) {
	$weights = array( 100, 200, 300, 400, 500, 600, 700 );
	$ranges  = array(
		'size' => array( 6, 120, 1 ),
		'lh'   => array( 0.8, 3, 0.01 ),
		'ls'   => array( -5, 20, 0.01 ),
	);
	// Column widths, as the design system's DataTable takes them: the role
	// column flexes, the four controls get room for their widest value.
	$columns = array(
		array( __( 'Role', 'blueworx-client-cansakhara' ), 'auto' ),
		array( __( 'Size (px)', 'blueworx-client-cansakhara' ), '14%' ),
		array( __( 'Line height', 'blueworx-client-cansakhara' ), '14%' ),
		array( __( 'Letter-spacing (px)', 'blueworx-client-cansakhara' ), '20%' ),
		array( __( 'Weight', 'blueworx-client-cansakhara' ), '15%' ),
	);
	?>
	<div class="bw-tablescroll">
		<table class="bw-table">
			<thead>
				<tr>
					<?php foreach ( $columns as $column ) : ?>
					<th style="width:<?php echo esc_attr( $column[1] ); ?>"><?php echo esc_html( $column[0] ); ?></th>
					<?php endforeach; ?>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( cansakhara_theme_roles() as $role => $meta ) : ?>
				<tr>
					<td>
						<span class="bw-table__primary"><?php echo esc_html( $meta['label'] ); ?></span>
						<span class="bw-table__sub"><?php echo esc_html( $meta['family'] . ( $meta['italic'] ? ' italic' : '' ) . ' — ' . $meta['uses'] ); ?></span>
					</td>
					<?php foreach ( $ranges as $prop => $range ) : ?>
					<td>
						<input type="number" class="bw-input bw-input--sm" id="cs-<?php echo esc_attr( "$role-$bp-$prop" ); ?>"
							name="<?php echo esc_attr( CANSAKHARA_THEME_OPTION . "[$role.$bp.$prop]" ); ?>"
							value="<?php echo esc_attr( (string) $theme[ "$role.$bp.$prop" ] ); ?>"
							min="<?php echo esc_attr( (string) $range[0] ); ?>" max="<?php echo esc_attr( (string) $range[1] ); ?>" step="<?php echo esc_attr( (string) $range[2] ); ?>"
							aria-label="<?php echo esc_attr( $meta['label'] . ' ' . $bp . ' ' . $prop ); ?>" />
					</td>
					<?php endforeach; ?>
					<td>
						<span class="bw-select">
							<select class="bw-select__el" id="cs-<?php echo esc_attr( "$role-$bp-weight" ); ?>" name="<?php echo esc_attr( CANSAKHARA_THEME_OPTION . "[$role.$bp.weight]" ); ?>" aria-label="<?php echo esc_attr( $meta['label'] . ' ' . $bp . ' weight' ); ?>">
								<?php foreach ( $weights as $w ) : ?>
								<option value="<?php echo esc_attr( (string) $w ); ?>" <?php selected( (int) $theme[ "$role.$bp.weight" ], $w ); ?>><?php echo esc_html( (string) $w ); ?></option>
								<?php endforeach; ?>
							</select>
							<i class="bw-icon bw-icon--14 bw-select__arrow" data-lucide="chevron-down"></i>
						</span>
					</td>
				</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
	<?php
}

/**
 * One typography card: title, description and the table for a breakpoint.
 *
 * @param string $bp    'desktop' or 'mobile'.
 * @param string $title Card title.
 * @param array  $theme Effective theme.
 * @return void
 */
function cansakhara_render_type_card( $bp, $title, $theme ) {
	?>
	<section class="bw-card bw-settingscard bw-card--flush">
		<div class="bw-card__head">
			<div class="bw-card__titles">
				<p class="bw-card__eyebrow"><?php esc_html_e( 'Typography', 'blueworx-client-cansakhara' ); ?></p>
				<h2 class="bw-card__title"><?php echo esc_html( $title ); ?></h2>
				<p class="bw-settingscard__desc"><?php esc_html_e( 'Sizes and spacing are in pixels. The mobile intro subtitle and footer legal text are fixed in the design at 15px and 8px and don\'t follow these roles.', 'blueworx-client-cansakhara' ); ?></p>
			</div>
		</div>
		<div class="bw-card__body">
			<?php cansakhara_render_type_table( $bp, $theme ); ?>
		</div>
	</section>
	<?php
}

/**
 * One palette card for a colour group.
 *
 * @param string $group   'home', 'day' or 'night'.
 * @param string $title   Card title.
 * @param string $desc    Card description.
 * @param array  $theme   Effective theme.
 * @param array  $palette The twelve design hexes, offered as presets.
 * @return void
 */
function cansakhara_render_color_card( $group, $title, $desc, $theme, $palette ) {
	?>
	<section class="bw-card bw-settingscard">
		<div class="bw-card__head">
			<div class="bw-card__titles">
				<p class="bw-card__eyebrow"><?php esc_html_e( 'Colours', 'blueworx-client-cansakhara' ); ?></p>
				<h2 class="bw-card__title"><?php echo esc_html( $title ); ?></h2>
				<p class="bw-settingscard__desc"><?php echo esc_html( $desc ); ?></p>
			</div>
		</div>
		<div class="bw-card__body bw-settingscard__body">
			<?php
			foreach ( cansakhara_theme_colors() as $name => $meta ) :
				if ( $group !== $meta['group'] ) {
					continue;
				}
				$hex = (string) $theme[ "color.$name" ];
				?>
			<div class="bw-formrow">
				<label class="bw-formrow__label" for="cs-color-<?php echo esc_attr( $name ); ?>"><?php echo esc_html( $meta['label'] ); ?></label>
				<div class="bw-formrow__control">
					<div class="bw-colorfield">
						<input type="color" class="bw-colorfield__swatch" value="<?php echo esc_attr( $hex ); ?>" aria-label="<?php echo esc_attr( $meta['label'] ); ?>" data-cs-color-for="cs-color-<?php echo esc_attr( $name ); ?>" />
						<span class="bw-colorfield__hex"><input type="text" class="bw-input bw-input--mono" id="cs-color-<?php echo esc_attr( $name ); ?>" name="<?php echo esc_attr( CANSAKHARA_THEME_OPTION . "[color.$name]" ); ?>" value="<?php echo esc_attr( $hex ); ?>" aria-label="<?php echo esc_attr( $meta['label'] . ' hex' ); ?>" /></span>
						<span class="bw-colorfield__presets">
							<?php foreach ( $palette as $p ) : ?>
							<button type="button" class="bw-colorfield__preset <?php echo strtolower( $p ) === strtolower( $hex ) ? 'is-active' : ''; ?>" style="background:<?php echo esc_attr( $p ); ?>" title="<?php echo esc_attr( $p ); ?>" aria-label="<?php echo esc_attr( $p ); ?>" data-cs-preset="<?php echo esc_attr( $p ); ?>"></button>
							<?php endforeach; ?>
						</span>
					</div>
					<p class="bw-formrow__help"><?php echo esc_html( $meta['uses'] ); ?></p>
				</div>
			</div>
			<?php endforeach; ?>
		</div>
	</section>
	<?php
}

/**
 * The Theme tab's content: two typography cards, three colour cards, and the
 * hidden fields the reset button posts.
 *
 * @return void
 */
function cansakhara_render_theme_tab() {
	$theme    = cansakhara_theme();
	$palette  = array();
	$defaults = cansakhara_theme_defaults();
	foreach ( array_keys( cansakhara_theme_colors() ) as $name ) {
		$palette[] = (string) $defaults[ "color.$name" ];
	}
	$saved = isset( $_GET['settings-updated'] ) && 'true' === $_GET['settings-updated']; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only flag set by options.php after a nonce-checked save.
	$reset = isset( $_GET['theme-reset'] ) && 'true' === $_GET['theme-reset']; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only flag set after the nonce-checked reset.
	?>
	<?php if ( $saved || $reset ) : ?>
	<div class="bw-notice bw-notice--success" role="status">
		<i class="bw-icon bw-notice__icon" data-lucide="circle-check"></i>
		<div class="bw-notice__body">
			<p class="bw-notice__text">
				<?php
				if ( $reset ) {
					esc_html_e( 'Theme reset to the design defaults.', 'blueworx-client-cansakhara' );
				} else {
					esc_html_e( 'Theme saved.', 'blueworx-client-cansakhara' );
				}
				?>
			</p>
		</div>
	</div>
	<?php endif; ?>

	<?php
	cansakhara_render_type_card( 'desktop', __( 'Desktop (796px and up)', 'blueworx-client-cansakhara' ), $theme );
	cansakhara_render_type_card( 'mobile', __( 'Mobile (below 796px)', 'blueworx-client-cansakhara' ), $theme );
	cansakhara_render_color_card( 'home', __( 'Home', 'blueworx-client-cansakhara' ), __( 'The Welcome, Home and popup palette.', 'blueworx-client-cansakhara' ), $theme, $palette );
	cansakhara_render_color_card( 'day', __( 'By Day', 'blueworx-client-cansakhara' ), __( 'The By Day page palette.', 'blueworx-client-cansakhara' ), $theme, $palette );
	cansakhara_render_color_card( 'night', __( 'By Night', 'blueworx-client-cansakhara' ), __( 'The By Night page palette.', 'blueworx-client-cansakhara' ), $theme, $palette );
	?>

	<?php
	// The reset button in the save bar posts this same form to admin-post.php;
	// the script below adds `action=cansakhara_reset_theme` only at that moment.
	// A hidden `action` field here would also reach options.php on an ordinary
	// Save and stop it saving. Only the nonce travels from here.
	wp_nonce_field( 'cansakhara_reset_theme', 'cansakhara_reset_nonce' );
	?>
	<script>
	// Runs once the page is parsed: the reset button sits in the save bar, after this script.
	document.addEventListener( 'DOMContentLoaded', function () {
		var reset = document.querySelector( '[data-cs-reset-theme]' );
		if ( reset ) {
			reset.addEventListener( 'click', function () {
				if ( ! window.confirm( reset.getAttribute( 'data-cs-confirm' ) ) ) {
					return;
				}
				var form   = reset.form;
				var action = document.createElement( 'input' );
				action.type  = 'hidden';
				action.name  = 'action';
				action.value = 'cansakhara_reset_theme';
				// Appended last, so PHP reads this `action`, not settings_fields()' `update`.
				form.appendChild( action );
				// The form has a field named `action`, which shadows form.action.
				form.setAttribute( 'action', reset.getAttribute( 'data-cs-reset-theme' ) );
				form.noValidate = true;
				HTMLFormElement.prototype.submit.call( form );
			} );
		}
		document.querySelectorAll( '.bw-colorfield' ).forEach( function ( field ) {
			var swatch = field.querySelector( '.bw-colorfield__swatch' );
			var hex    = field.querySelector( '.bw-colorfield__hex input' );
			var presets = field.querySelectorAll( '.bw-colorfield__preset' );
			var mark = function ( value ) {
				presets.forEach( function ( b ) {
					b.classList.toggle( 'is-active', b.getAttribute( 'data-cs-preset' ).toLowerCase() === value.toLowerCase() );
				} );
			};
			swatch.addEventListener( 'input', function () {
				hex.value = swatch.value;
				mark( swatch.value );
			} );
			hex.addEventListener( 'input', function () {
				if ( /^#[0-9a-fA-F]{6}$/.test( hex.value ) ) {
					swatch.value = hex.value;
					mark( hex.value );
				}
			} );
			presets.forEach( function ( b ) {
				b.addEventListener( 'click', function () {
					hex.value    = b.getAttribute( 'data-cs-preset' );
					swatch.value = hex.value;
					mark( hex.value );
				} );
			} );
		} );
	} );
	</script>
	<?php
}

/**
 * Reset every token: delete the option so the defaults show through.
 *
 * @return void
 */
function cansakhara_handle_reset_theme() {
	if ( ! current_user_can( 'manage_options' ) || ! isset( $_POST['cansakhara_reset_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['cansakhara_reset_nonce'] ) ), 'cansakhara_reset_theme' ) ) {
		wp_die( esc_html__( 'Not allowed.', 'blueworx-client-cansakhara' ) );
	}
	delete_option( CANSAKHARA_THEME_OPTION );
	wp_safe_redirect(
		add_query_arg(
			array(
				'tab'         => 'theme',
				'theme-reset' => 'true',
			),
			cansakhara_settings_url()
		)
	);
	exit;
}
add_action( 'admin_post_cansakhara_reset_theme', 'cansakhara_handle_reset_theme' );

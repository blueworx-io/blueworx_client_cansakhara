<?php
/**
 * Theme tokens: the typography roles and palette the site is built from.
 *
 * One defaults array feeds the Theme tab, the sanitiser and the CSS printed
 * on the front end, so there is no second copy to drift.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const CANSAKHARA_THEME_OPTION = 'cansakhara_theme';

/**
 * Typography roles. Family is fixed per role; the editable parts are size,
 * line height, letter-spacing and weight, for desktop and mobile.
 *
 * @return array<string, array{label: string, family: string, italic: bool, uses: string}>
 */
function cansakhara_theme_roles() {
	return array(
		'h1'    => array(
			'label'  => 'H1',
			'family' => 'neulis-sans',
			'italic' => false,
			'uses'   => __( 'Page intro lockup and By Day / By Night titles', 'blueworx-client-cansakhara' ),
		),
		'h2'    => array(
			'label'  => 'H2',
			'family' => 'neulis-sans',
			'italic' => false,
			'uses'   => __( 'Section titles and card titles', 'blueworx-client-cansakhara' ),
		),
		'h3'    => array(
			'label'  => 'H3',
			'family' => 'neulis-sans',
			'italic' => false,
			'uses'   => __( 'Eyebrows: WELCOME, EXPERIENCE, DISCOVER, FEATURING', 'blueworx-client-cansakhara' ),
		),
		'h4'    => array(
			'label'  => 'H4',
			'family' => 'source-serif-4-variable',
			'italic' => true,
			'uses'   => __( 'Section subtitles', 'blueworx-client-cansakhara' ),
		),
		'body'  => array(
			'label'  => 'Body',
			'family' => 'source-sans-3',
			'italic' => false,
			'uses'   => __( 'Paragraph copy', 'blueworx-client-cansakhara' ),
		),
		'small' => array(
			'label'  => 'Small',
			'family' => 'source-sans-3',
			'italic' => false,
			'uses'   => __( 'Stat labels and captions', 'blueworx-client-cansakhara' ),
		),
		'label' => array(
			'label'  => 'Label',
			'family' => 'neulis-sans',
			'italic' => false,
			'uses'   => __( 'Buttons, footer text, header MENU, popup links', 'blueworx-client-cansakhara' ),
		),
	);
}

/**
 * Palette swatches, named as the mini style guide names them.
 *
 * @return array<string, array{label: string, group: string, uses: string}>
 */
function cansakhara_theme_colors() {
	return array(
		'home-1'  => array(
			'label' => 'Home 1',
			'group' => 'home',
			'uses'  => __( 'Page background, light text', 'blueworx-client-cansakhara' ),
		),
		'home-2'  => array(
			'label' => 'Home 2',
			'group' => 'home',
			'uses'  => __( 'Headings and body text', 'blueworx-client-cansakhara' ),
		),
		'home-3'  => array(
			'label' => 'Home 3',
			'group' => 'home',
			'uses'  => __( 'Footer and menu drawer', 'blueworx-client-cansakhara' ),
		),
		'home-4'  => array(
			'label' => 'Home 4',
			'group' => 'home',
			'uses'  => __( 'Experience section background, map', 'blueworx-client-cansakhara' ),
		),
		'home-5'  => array(
			'label' => 'Home 5',
			'group' => 'home',
			'uses'  => __( 'Welcome page and popups', 'blueworx-client-cansakhara' ),
		),
		'home-6'  => array(
			'label' => 'Home 6',
			'group' => 'home',
			'uses'  => __( 'IBIZA accent, menu hover', 'blueworx-client-cansakhara' ),
		),
		'day-1'   => array(
			'label' => 'By Day 1',
			'group' => 'day',
			'uses'  => __( 'By Day page background', 'blueworx-client-cansakhara' ),
		),
		'day-2'   => array(
			'label' => 'By Day 2',
			'group' => 'day',
			'uses'  => __( 'By Day deep sections and footer', 'blueworx-client-cansakhara' ),
		),
		'day-3'   => array(
			'label' => 'By Day 3',
			'group' => 'day',
			'uses'  => __( 'By Day hover', 'blueworx-client-cansakhara' ),
		),
		'night-1' => array(
			'label' => 'By Night 1',
			'group' => 'night',
			'uses'  => __( 'By Night page background', 'blueworx-client-cansakhara' ),
		),
		'night-2' => array(
			'label' => 'By Night 2',
			'group' => 'night',
			'uses'  => __( 'By Night deep sections and footer', 'blueworx-client-cansakhara' ),
		),
		'night-3' => array(
			'label' => 'By Night 3',
			'group' => 'night',
			'uses'  => __( 'By Night buttons', 'blueworx-client-cansakhara' ),
		),
	);
}

/**
 * Every token with its Figma value. Keys are "role.breakpoint.property" or
 * "color.name".
 *
 * @return array<string, int|float|string>
 */
function cansakhara_theme_defaults() {
	// role => [ desktop [size, lh, ls, weight], mobile [size, lh, ls, weight] ].
	$type   = array(
		'h1'    => array( array( 48, 1, 9.6, 300 ), array( 30, 1, 6, 300 ) ),
		'h2'    => array( array( 48, 1, 9.6, 300 ), array( 24, 1, 4.8, 300 ) ),
		'h3'    => array( array( 21, 1, 4.2, 400 ), array( 12, 1, 2.4, 400 ) ),
		'h4'    => array( array( 28, 1.8, 2.8, 300 ), array( 13, 1.8, 1.3, 300 ) ),
		'body'  => array( array( 16, 1.6, 0.8, 300 ), array( 11, 1.6, 0.55, 300 ) ),
		'small' => array( array( 15, 1, 1.5, 300 ), array( 10, 1, 1, 300 ) ),
		'label' => array( array( 14, 1.4, 5.6, 400 ), array( 10, 1.4, 4, 400 ) ),
	);
	$colors = array(
		'home-1'  => '#ffffff',
		'home-2'  => '#42081a',
		'home-3'  => '#422833',
		'home-4'  => '#f2ebe2',
		'home-5'  => '#5b0a00',
		'home-6'  => '#bf2c08',
		'day-1'   => '#ac9a8c',
		'day-2'   => '#918074',
		'day-3'   => '#5f5146',
		'night-1' => '#031927',
		'night-2' => '#000e16',
		'night-3' => '#33545a',
	);

	$defaults = array();
	foreach ( $type as $role => $breakpoints ) {
		foreach ( array( 'desktop', 'mobile' ) as $i => $bp ) {
			list( $size, $lh, $ls, $weight ) = $breakpoints[ $i ];
			$defaults[ "$role.$bp.size" ]    = $size;
			$defaults[ "$role.$bp.lh" ]      = $lh;
			$defaults[ "$role.$bp.ls" ]      = $ls;
			$defaults[ "$role.$bp.weight" ]  = $weight;
		}
	}
	foreach ( $colors as $name => $hex ) {
		$defaults[ "color.$name" ] = $hex;
	}
	return $defaults;
}

/**
 * The effective theme: defaults overlaid with whatever has been saved.
 *
 * Each saved value is re-validated with cansakhara_theme_clean_value() so a
 * value edited directly in the database — bypassing the settings sanitiser —
 * can never reach the printed <style>.
 *
 * @return array<string, int|float|string>
 */
function cansakhara_theme() {
	$defaults = cansakhara_theme_defaults();
	$saved    = get_option( CANSAKHARA_THEME_OPTION, array() );
	$theme    = $defaults;
	foreach ( is_array( $saved ) ? $saved : array() as $key => $value ) {
		if ( ! isset( $defaults[ $key ] ) ) {
			continue;
		}
		$clean = cansakhara_theme_clean_value( $key, $value );
		if ( null !== $clean ) {
			$theme[ $key ] = $clean;
		}
	}
	return $theme;
}

/**
 * Validates one token value against its default's type and range.
 *
 * @param string $key   Token key.
 * @param mixed  $value Submitted value.
 * @return int|float|string|null Clean value, or null if it is not usable.
 */
function cansakhara_theme_clean_value( $key, $value ) {
	if ( 0 === strpos( $key, 'color.' ) ) {
		$hex = sanitize_hex_color( is_string( $value ) ? trim( $value ) : '' );
		return ( $hex && 7 === strlen( $hex ) ) ? strtolower( $hex ) : null;
	}
	if ( ! is_numeric( $value ) ) {
		return null;
	}
	$n    = (float) $value;
	$prop = substr( $key, strrpos( $key, '.' ) + 1 );
	switch ( $prop ) {
		case 'size':
			return ( $n >= 6 && $n <= 120 ) ? (int) round( $n ) : null;
		case 'lh':
			return ( $n >= 0.8 && $n <= 3 ) ? round( $n, 2 ) : null;
		case 'ls':
			return ( $n >= -5 && $n <= 20 ) ? round( $n, 2 ) : null;
		case 'weight':
			return in_array( (int) $n, array( 100, 200, 300, 400, 500, 600, 700 ), true ) ? (int) $n : null;
	}
	return null;
}

/**
 * Settings API sanitiser. Stores only the tokens that differ from the design.
 *
 * @param mixed $input Submitted option value.
 * @return array<string, int|float|string>
 */
function cansakhara_sanitize_theme( $input ) {
	$defaults = cansakhara_theme_defaults();
	$clean    = array();
	foreach ( (array) $input as $key => $value ) {
		if ( ! isset( $defaults[ $key ] ) ) {
			continue;
		}
		$v = cansakhara_theme_clean_value( $key, $value );
		if ( null !== $v && (string) $v !== (string) $defaults[ $key ] ) {
			$clean[ $key ] = $v;
		}
	}
	return $clean;
}

/**
 * Registers the option.
 *
 * @return void
 */
function cansakhara_register_theme_setting() {
	register_setting(
		'cansakhara_theme_group',
		CANSAKHARA_THEME_OPTION,
		array(
			'type'              => 'array',
			'sanitize_callback' => 'cansakhara_sanitize_theme',
			'default'           => array(),
		)
	);
}
add_action( 'admin_init', 'cansakhara_register_theme_setting' );

/**
 * Formats one breakpoint's variables.
 *
 * @param array  $theme Effective theme.
 * @param string $bp    'desktop' or 'mobile'.
 * @return string
 */
function cansakhara_theme_css_vars( $theme, $bp ) {
	$out = '';
	foreach ( array_keys( cansakhara_theme_roles() ) as $role ) {
		$out .= "--cs-$role-size:{$theme["$role.$bp.size"]}px;";
		$out .= "--cs-$role-lh:{$theme["$role.$bp.lh"]};";
		$out .= "--cs-$role-ls:{$theme["$role.$bp.ls"]}px;";
		$out .= "--cs-$role-weight:{$theme["$role.$bp.weight"]};";
	}
	return $out;
}

/**
 * The inline stylesheet: desktop values on :root, mobile inside the site's
 * single 795px switch point, then the palette.
 *
 * @return string
 */
function cansakhara_theme_css() {
	$theme  = cansakhara_theme();
	$colors = '';
	foreach ( array_keys( cansakhara_theme_colors() ) as $name ) {
		$colors .= "--cs-color-$name:{$theme["color.$name"]};";
	}
	return ':root{' . cansakhara_theme_css_vars( $theme, 'desktop' ) . $colors . '}'
		. '@media (max-width:795px){:root{' . cansakhara_theme_css_vars( $theme, 'mobile' ) . '}}';
}

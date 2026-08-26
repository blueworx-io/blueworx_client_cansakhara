<?php
/**
 * The pages this plugin owns, and how it claims them.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Post meta stamped onto every page this plugin creates.
 *
 * Ownership is read from this stamp and never inferred from the slug. A site
 * with its own page slugged "home" would otherwise have it adopted, rendered
 * by this plugin, and stripped of the theme's styles by the sweep in
 * assets.php. A slug is a coincidence; the stamp is a fact.
 */
const CANSAKHARA_PAGE_META = '_cansakhara_page';

/**
 * The pages this plugin owns and renders.
 *
 * Real WordPress pages are created for these so permalinks, menus and SEO
 * plugins behave normally. Rendering is taken over in includes/render.php, so
 * the active theme never gets a say in how they look.
 *
 * `description` carries the original Next.js build's per-page metadata
 * description (recovered from the `nextjs-final` tag). It is stored as each
 * page's `post_excerpt` on creation, not rendered as a hardcoded meta tag —
 * that would fight a real SEO plugin, which is free to read the excerpt (or
 * override it) normally.
 *
 * @return array<string, array{title: string, template: string, description: string}>
 */
function cansakhara_pages() {
	return array(
		'home'     => array(
			'title'       => __( 'Home', 'blueworx-client-cansakhara' ),
			'template'    => 'pages/home.php',
			'description' => __( 'Discover Can Sakhara, a private art-filled villa overlooking Ibiza and Formentera.', 'blueworx-client-cansakhara' ),
		),
		'by-day'   => array(
			'title'       => __( 'By Day', 'blueworx-client-cansakhara' ),
			'template'    => 'pages/by-day.php',
			'description' => __( 'Sun-drenched serenity at Can Sakhara — a myriad of spaces, both inside and out, inviting each guest to shape the day as they choose.', 'blueworx-client-cansakhara' ),
		),
		'by-night' => array(
			'title'       => __( 'By Night', 'blueworx-client-cansakhara' ),
			'template'    => 'pages/by-night.php',
			'description' => __( 'As the sun sets over the island, Can Sakhara comes alive in the glow of the afterhours — a warm and cinematic retreat for nights to remember.', 'blueworx-client-cansakhara' ),
		),
	);
}

/**
 * Creates any missing owned pages, stamps them, and sets the front page.
 *
 * Idempotent: an existing stamped page is reused rather than duplicated, so
 * reactivating the plugin never leaves a second copy behind.
 *
 * @return void
 */
function cansakhara_install_pages() {
	$ids = (array) get_option( 'cansakhara_page_ids', array() );

	foreach ( cansakhara_pages() as $slug => $page ) {
		$existing = isset( $ids[ $slug ] ) ? (int) $ids[ $slug ] : 0;

		if ( $existing > 0 && 'page' === get_post_type( $existing ) && 'trash' !== get_post_status( $existing ) && get_post_meta( $existing, CANSAKHARA_PAGE_META, true ) === $slug ) {
			update_post_meta( $existing, CANSAKHARA_PAGE_META, $slug );
			continue;
		}

		$post_id = wp_insert_post(
			array(
				'post_type'      => 'page',
				'post_status'    => 'publish',
				'post_title'     => $page['title'],
				'post_name'      => $slug,
				'post_content'   => '',
				'post_excerpt'   => $page['description'],
				'comment_status' => 'closed',
				'ping_status'    => 'closed',
			)
		);

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			continue;
		}

		update_post_meta( $post_id, CANSAKHARA_PAGE_META, $slug );
		$ids[ $slug ] = (int) $post_id;
	}

	update_option( 'cansakhara_page_ids', $ids );

	if ( isset( $ids['home'] ) && $ids['home'] > 0 ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', (int) $ids['home'] );
	}
}

/**
 * Whether a page was created by this plugin.
 *
 * @param int $post_id Page ID.
 * @return bool True when this plugin created the page.
 */
function cansakhara_page_is_ours( $post_id ) {
	return '' !== cansakhara_page_slug( $post_id );
}

/**
 * The owned-page slug for a post, or '' when the post is not ours.
 *
 * @param int $post_id Page ID.
 * @return string Slug, or '' when not an owned page.
 */
function cansakhara_page_slug( $post_id ) {
	$post_id = (int) $post_id;

	if ( $post_id <= 0 ) {
		return '';
	}

	$slug = (string) get_post_meta( $post_id, CANSAKHARA_PAGE_META, true );

	return isset( cansakhara_pages()[ $slug ] ) ? $slug : '';
}

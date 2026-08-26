<?php
/**
 * Full-document rendering for the plugin's own pages.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Declares title-tag support so an owned page always emits a <title>.
 *
 * WordPress only prints one when the active theme has opted in. These pages
 * must not depend on that seam — the whole point of rendering the document
 * ourselves is that the output is identical regardless of the active theme.
 *
 * @return void
 */
function cansakhara_ensure_title_tag_support() {
	add_theme_support( 'title-tag' );
}
add_action( 'after_setup_theme', 'cansakhara_ensure_title_tag_support' );

/**
 * Takes over rendering for pages this plugin owns.
 *
 * @param string $template Template path WordPress resolved.
 * @return string Template path to use.
 */
function cansakhara_template_include( $template ) {
	if ( ! is_singular( 'page' ) ) {
		return $template;
	}

	$slug = cansakhara_page_slug( get_queried_object_id() );

	if ( '' === $slug ) {
		return $template;
	}

	$page = cansakhara_pages()[ $slug ];
	$path = CANSAKHARA_DIR . 'templates/' . $page['template'];

	return file_exists( $path ) ? $path : $template;
}
add_filter( 'template_include', 'cansakhara_template_include' );

/**
 * Opens a complete HTML document for a plugin-rendered page.
 *
 * Deliberately does not call get_header(): the plugin renders the whole
 * document so the site is identical regardless of the active theme. wp_head()
 * and wp_footer() are still called so other plugins, the admin bar and SEO
 * output keep working.
 *
 * The owned-page slug is derived here, from the page currently being
 * queried, rather than accepted as an argument — the renderer already knows
 * which page it is rendering, so no caller should have to repeat that.
 *
 * @param array $args Optional. 'body_class' => string, 'theme' => string.
 * @return void
 */
function cansakhara_document_open( $args = array() ) {
	$body_class = isset( $args['body_class'] ) ? (string) $args['body_class'] : '';
	$theme      = isset( $args['theme'] ) ? (string) $args['theme'] : 'home';
	$slug       = cansakhara_page_slug( get_queried_object_id() );

	$classes = 'cansakhara-page cansakhara-theme-' . sanitize_html_class( $theme );

	if ( '' !== $slug ) {
		$classes .= ' page-cansakhara-' . sanitize_html_class( $slug );
	}

	if ( '' !== $body_class ) {
		$classes .= ' ' . $body_class;
	}
	?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<?php wp_head(); ?>
	<script>
		/* Pre-paint no-FOUC guard: hide the above-the-fold hero entrance
		   elements before first paint, but only when JS runs and motion is
		   allowed. Ported verbatim from the Next.js layout. */
		try {
			if ( ! matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
				document.documentElement.classList.add( 'motion-ready' );
			}
		} catch ( e ) {}
	</script>
</head>
<body <?php body_class( $classes ); ?>>
	<?php wp_body_open(); ?>
	<a class="sr-only" href="#content"><?php echo esc_html__( 'Skip to the content', 'blueworx-client-cansakhara' ); ?></a>
	<?php
}

/**
 * Closes the document opened by cansakhara_document_open().
 *
 * @return void
 */
function cansakhara_document_close() {
	wp_footer();
	?>
</body>
</html>
	<?php
}

/**
 * Loads a template part from templates/parts/.
 *
 * @param string $name Part name, without the .php extension.
 * @param array  $args Variables made available to the part as $args.
 * @return void
 */
function cansakhara_part( $name, $args = array() ) {
	$path = CANSAKHARA_DIR . 'templates/parts/' . $name . '.php';

	if ( ! file_exists( $path ) ) {
		return;
	}

	include $path;
}

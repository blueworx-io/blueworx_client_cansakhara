<?php
/**
 * Shared markup helpers ported from the small inline JSX components in
 * page.tsx, by-day/page.tsx, by-night/page.tsx, and SunMoonIcon.tsx.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The outlined uppercase call-to-action button (ported from OutlineButton in
 * src/app/page.tsx). next/link becomes a plain anchor: there is no
 * client-side router any more and the design does not depend on one.
 *
 * The source component takes no `anim` prop — no call site in page.tsx ever
 * passes one, so `data-anim` is never rendered there. The `$anim` parameter
 * exists here only to match the plugin's cross-task helper contract; it
 * mirrors the `data-anim` wiring already present on SecondaryButton so a
 * later task can opt an outline button into the motion layer if needed.
 *
 * @param string $label Button text.
 * @param string $href  Destination. Internal paths start with '/'.
 * @param string $class Extra classes appended to the base string.
 * @param string $anim  Optional data-anim value used by the motion layer.
 * @return void
 */
function cansakhara_outline_button( $label, $href, $class = '', $anim = '' ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound -- $class is the exact parameter name required by the plugin's cross-task helper contract.
	$classes = 'outline-button cs-label inline-flex h-[54px] items-center justify-center gap-4 whitespace-nowrap border border-current px-8 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ' . $class;
	?>
	<a
		href="<?php echo esc_url( $href ); ?>"
		class="<?php echo esc_attr( trim( $classes ) ); ?>"
		<?php echo '' !== $anim ? 'data-anim="' . esc_attr( $anim ) . '"' : ''; ?>
	>
		<span><?php echo esc_html( $label ); ?></span>
	</a>
	<?php
}

/**
 * The bordered "Secondary Button" (label only) from the design system.
 * Ported from the identical `SecondaryButton` defined separately in
 * src/app/by-day/page.tsx and src/app/by-night/page.tsx.
 *
 * The two source copies are identical except for the hover text colour:
 * by-day uses `hover:text-day-1`, by-night uses `hover:text-night-1`.
 * That single token is exposed here as a required `$hover_class` parameter
 * rather than folded into one hard-coded default, per the instruction to
 * keep any per-page difference as a parameter. This parameter is not in the
 * task's interface list. It is required, not defaulted: a defaulted value
 * would let a caller silently render the wrong hover colour with nothing
 * to catch it (no functional spec or screenshot diff asserts hover state),
 * so a missing argument fails loudly (PHP fatal) instead. It is required
 * to appear before `$class` and `$anim` because PHP disallows a required
 * parameter after optional ones.
 *
 * @param string $label       Button text.
 * @param string $href        Destination.
 * @param string $hover_class Required. Hover text-colour utility —
 *                             'hover:text-day-1' on by-day,
 *                             'hover:text-night-1' on by-night.
 * @param string $class       Extra classes appended to the base string.
 * @param string $anim        Optional data-anim value used by the motion layer.
 * @return void
 */
function cansakhara_secondary_button( $label, $href, $hover_class, $class = '', $anim = '' ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound -- $class is the exact parameter name required by the plugin's cross-task helper contract.
	$classes = 'cs-label inline-flex items-center justify-center whitespace-nowrap border border-home-1 px-4 py-[10px] text-home-1 transition-colors hover:bg-home-1 ' . $hover_class . ' focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:px-8 md:py-4 ' . $class;
	?>
	<a
		href="<?php echo esc_url( $href ); ?>"
		<?php echo '' !== $anim ? 'data-anim="' . esc_attr( $anim ) . '"' : ''; ?>
		class="<?php echo esc_attr( trim( $classes ) ); ?>"
	>
		<span><?php echo esc_html( $label ); ?></span>
	</a>
	<?php
}

/**
 * The vertical divider rule between sections (ported from `SectionLine` in
 * src/app/page.tsx).
 *
 * @param string $class Extra classes appended to the base string.
 * @return void
 */
function cansakhara_section_line( $class = '' ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound -- $class is the exact parameter name required by the plugin's cross-task helper contract.
	// Mobile: 106px tall (Figma 5:418), straddling the section edge 53/53 through the caller's -mt-[53px] / -mb-[53px].
	$classes = 'section-line mx-auto block h-[106px] w-px bg-home-2 md:h-40 md:w-[2px] ' . $class;
	?>
	<span aria-hidden="true" class="<?php echo esc_attr( trim( $classes ) ); ?>"></span>
	<?php
}

/**
 * The eyebrow/title/subtitle section header (ported from `SectionHeading`
 * in src/app/page.tsx).
 *
 * `title` and `subtitle` are typed as `React.ReactNode` in the source (the
 * one call site passes a composed lockup, not plain text, as `title`), so
 * they are echoed as trusted markup here rather than escaped — the caller
 * is responsible for escaping/building safe markup before passing it in,
 * same as JSX does not re-escape a child element. `eyebrow` is typed as a
 * plain `string`, so it is escaped with esc_html().
 *
 * Type comes from the theme roles (includes/theme.php): the eyebrow is H3,
 * the title H2 (or H1 when 'title_role' => 'h1', for the page intro lockup),
 * the subtitle H4. Colour is the home-2 swatch.
 *
 * @param array $args Section heading arguments. 'eyebrow' => string (escaped
 *                     as text), 'title' => string (trusted markup, echoed
 *                     unescaped), 'subtitle' => string (trusted markup,
 *                     echoed unescaped), 'class' => string (extra classes
 *                     appended to the base string), 'title_role' => 'h1'|'h2'
 *                     (role class for the title; default 'h2').
 * @return void
 */
function cansakhara_section_heading( $args ) {
	$eyebrow  = isset( $args['eyebrow'] ) ? (string) $args['eyebrow'] : '';
	$title    = isset( $args['title'] ) ? (string) $args['title'] : '';
	$subtitle = isset( $args['subtitle'] ) ? (string) $args['subtitle'] : '';
	$class    = isset( $args['class'] ) ? (string) $args['class'] : '';
	$role     = ( isset( $args['title_role'] ) && 'h1' === $args['title_role'] ) ? 'cs-h1' : 'cs-h2';

	$classes = 'section-heading mx-auto w-full min-w-0 max-w-5xl text-center text-home-2 ' . $class;
	?>
	<header class="<?php echo esc_attr( trim( $classes ) ); ?>">
		<p class="section-eyebrow cs-h3"><?php echo esc_html( $eyebrow ); ?></p>
		<h2 class="section-title <?php echo esc_attr( $role ); ?> mx-auto mt-[25px] max-w-full break-words md:mt-9"><?php echo $title; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted markup, see docblock. ?></h2>
		<p class="section-subtitle cs-h4 mx-auto mt-[25px] max-w-[calc(100vw-3rem)] break-words md:mt-10 md:max-w-4xl"><?php echo $subtitle; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted markup, see docblock. ?></p>
	</header>
	<?php
}

/**
 * The By Day (sun) mark, inlined so DrawSVG can animate its path strokes
 * (ported from `SunIcon` in src/components/SunMoonIcon.tsx). A circle and
 * eight rays, viewBox 0 0 180 180.
 *
 * @param string $class Classes controlling the icon's rendered size.
 * @return void
 */
function cansakhara_sun_icon( $class = '' ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound -- $class is the exact parameter name required by the plugin's cross-task helper contract.
	?>
	<svg aria-hidden="true" data-anim="draw-icon" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" class="<?php echo esc_attr( $class ); ?>">
		<path d="M90 134.182C114.401 134.182 134.182 114.401 134.182 90C134.182 65.5991 114.401 45.8182 90 45.8182C65.5991 45.8182 45.8182 65.5991 45.8182 90C45.8182 114.401 65.5991 134.182 90 134.182Z" stroke="white" stroke-width="2" stroke-miterlimit="10" />
		<path d="M159.031 89.994H180" stroke="white" stroke-width="2" stroke-miterlimit="10" />
		<path d="M0 89.994H20.9691" stroke="white" stroke-width="2" stroke-miterlimit="10" />
		<path d="M89.994 159.031V180" stroke="white" stroke-width="2" stroke-miterlimit="10" />
		<path d="M89.994 0V20.9691" stroke="white" stroke-width="2" stroke-miterlimit="10" />
		<path d="M138.814 41.1855L153.642 26.3578" stroke="white" stroke-width="2" stroke-miterlimit="10" />
		<path d="M26.3578 153.642L41.1855 138.814" stroke="white" stroke-width="2" stroke-miterlimit="10" />
		<path d="M41.1855 41.1855L26.3578 26.3578" stroke="white" stroke-width="2" stroke-miterlimit="10" />
		<path d="M153.642 153.642L138.814 138.814" stroke="white" stroke-width="2" stroke-miterlimit="10" />
	</svg>
	<?php
}

/**
 * The By Night (moon) mark, inlined so DrawSVG can animate its path stroke
 * (ported from `MoonIcon` in src/components/SunMoonIcon.tsx). A single
 * crescent, viewBox 0 0 180 180.
 *
 * @param string $class Classes controlling the icon's rendered size.
 * @return void
 */
function cansakhara_moon_icon( $class = '' ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound -- $class is the exact parameter name required by the plugin's cross-task helper contract.
	?>
	<svg aria-hidden="true" data-anim="draw-icon" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" class="<?php echo esc_attr( $class ); ?>">
		<path d="M161 114.303C150.241 141.652 123.653 161 92.5533 161C51.9316 161.012 19 127.996 19 87.2699C19 56.4305 37.8856 30.0176 64.6918 19C64.995 26.7463 67.1177 57.7074 91.9953 83.7798C119.359 112.455 154.123 114.121 161 114.303Z" stroke="white" stroke-width="2" stroke-miterlimit="10" />
	</svg>
	<?php
}

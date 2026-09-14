<?php
/**
 * Site header — ported from src/components/SiteHeader.tsx.
 *
 * The scroll-driven `scrolled`/`hidden` state from the source component has
 * no server-side equivalent, so this renders only the initial state: the
 * header starts unscrolled (`translate-y-0`) and, per the source's
 * `solid = scrolled || theme !== "home"`, solid whenever the theme is not
 * "home". Task 13's behaviour script owns toggling both afterwards, reading
 * the panel colour from `data-cansakhara-solid-color` rather than knowing the
 * colour map itself.
 *
 * The centre logo mark stays inline SVG (not the logo-white.svg asset) so
 * Task 12's DrawSVG animation can animate the path stroke.
 *
 * Also renders the Login/Enquire popups (templates/parts/popups.php), so they
 * exist on every page that has a header.
 *
 * @package CanSakhara
 *
 * @var array $args {
 *     @type string $theme Page theme: 'home', 'day' or 'night'. Default 'home'.
 * }
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Per-page panel swatch (Figma: home 1:979, day 1:1273, night 1:1373). The
// header paints it as a CSS variable so the scroll script can set it inline;
// the drawer takes the matching utilities. Class names are spelled out in
// full so Tailwind finds them when it scans this file.
$cansakhara_panels = array(
	'home'  => array(
		'color' => 'var(--cs-color-home-3)',
		'bg'    => 'bg-home-3',
		'hover' => 'hover:text-home-3',
	),
	'day'   => array(
		'color' => 'var(--cs-color-day-1)',
		'bg'    => 'bg-day-1',
		'hover' => 'hover:text-day-1',
	),
	'night' => array(
		'color' => 'var(--cs-color-night-1)',
		'bg'    => 'bg-night-1',
		'hover' => 'hover:text-night-1',
	),
);

$cansakhara_theme = isset( $args['theme'] ) ? (string) $args['theme'] : 'home';

if ( ! isset( $cansakhara_panels[ $cansakhara_theme ] ) ) {
	$cansakhara_theme = 'home';
}

$cansakhara_panel       = $cansakhara_panels[ $cansakhara_theme ];
$cansakhara_panel_color = $cansakhara_panel['color'];

// solid = scrolled || theme !== "home"; scrolled starts false server-side.
$cansakhara_solid = ( 'home' !== $cansakhara_theme );

$cansakhara_solid_class  = $cansakhara_solid ? '' : 'bg-white/5 backdrop-blur-[3px]';
$cansakhara_hidden_class = 'translate-y-0';

$cansakhara_nav_classes = "fixed inset-x-0 top-0 z-30 flex h-[90px] items-center px-5 text-home-1 transition-[translate,background-color] duration-500 ease-out md:h-[120px] md:px-20 {$cansakhara_solid_class} {$cansakhara_hidden_class}";
?>
<nav
	<?php if ( $cansakhara_solid ) : ?>
	style="background-color: <?php echo esc_attr( $cansakhara_panel_color ); ?>"
	<?php endif; ?>
	data-cansakhara-header
	data-cansakhara-solid-color="<?php echo esc_attr( $cansakhara_panel_color ); ?>"
	class="<?php echo esc_attr( $cansakhara_nav_classes ); ?>"
>
	<div class="mx-auto grid w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center">
		<button
			type="button"
			data-cansakhara-menu-open
			aria-haspopup="dialog"
			aria-expanded="false"
			aria-controls="site-menu"
			class="cs-label flex items-center gap-6 justify-self-start"
		>
			<span aria-hidden="true" class="flex w-7 flex-col gap-2 md:w-12">
				<span class="h-[2px] w-full bg-current"></span>
				<span class="h-[2px] w-full bg-current"></span>
			</span>
			<span>Menu</span>
		</button>

		<a
			href="<?php echo esc_url( cansakhara_page_url( 'home' ) ); ?>"
			aria-label="Can Sakhara home"
			class="grid place-items-center justify-self-center"
		>
			<svg
				aria-hidden="true"
				viewBox="0 0 52 52"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="h-[31px] w-[31px] md:h-[52px] md:w-[52px]"
			>
				<path
					data-cansakhara-logo-path
					d="M0 52H39.0067L0 13.0067V52.0135V52ZM0.728594 14.7608L37.2392 51.2714H0.728594V14.7608ZM52 0H38.9933L52 13.0067V0ZM12.4805 0L52 39.5195V38.494L13.5195 0H12.494H12.4805Z"
					fill="white"
					stroke="white"
					stroke-width="1"
					stroke-linejoin="round"
				/>
			</svg>
		</a>

		<div class="justify-self-end">
			<button
				type="button"
				data-cansakhara-popup-open="enquire"
				aria-haspopup="dialog"
				aria-expanded="false"
				aria-controls="cansakhara-popup-enquire"
				class="cs-label inline-flex items-center justify-center whitespace-nowrap border border-current px-4 py-[10px] transition-colors duration-200 hover:bg-home-1 hover:text-home-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:px-8 md:py-4"
			>
				Enquire
			</button>
		</div>
	</div>
</nav>
<?php
cansakhara_part( 'menu-drawer', array( 'panel' => $cansakhara_panel ) );
cansakhara_part( 'popups' );

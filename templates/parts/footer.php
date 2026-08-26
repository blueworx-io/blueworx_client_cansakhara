<?php
/**
 * Site footer — ported from src/components/SiteFooter.tsx.
 *
 * A straight markup port; the source component holds no client state. The
 * source's `theme` prop selects the background colour (home matches the
 * home drawer mark in SiteHeader; day/night take each page's deep section
 * colour), all footer content stays white on every theme. The `className`
 * prop is exposed here as `$args['class']` — by-day and by-night pass
 * `mt-[2px]`, home passes nothing.
 *
 * `next/image` with the `fill` prop becomes a plain `<img>` sized by its
 * anchor's fixed classes, absolutely positioned to fill it — the same
 * "Image fill is inherently absolute" allowance the project rules give for
 * next/image.
 *
 * @package CanSakhara
 *
 * @var array $args {
 *     @type string $theme Page theme: 'home', 'day' or 'night'. Default 'home'.
 *     @type string $class Extra classes appended to the footer's base string.
 * }
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Figma desktop 1:835 / mobile 1:352. Home is the Figma footer colour (which
// matches the home drawer mark in SiteHeader); day/night take each page's
// deep section colour.
$cansakhara_footer_colors = array(
	'home'  => '#422833',
	'day'   => '#918074',
	'night' => '#000e16',
);

$cansakhara_theme = isset( $args['theme'] ) ? (string) $args['theme'] : 'home';

if ( ! isset( $cansakhara_footer_colors[ $cansakhara_theme ] ) ) {
	$cansakhara_theme = 'home';
}

$cansakhara_footer_color = $cansakhara_footer_colors[ $cansakhara_theme ];
$cansakhara_class        = isset( $args['class'] ) ? (string) $args['class'] : ''; // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound -- $class is the exact parameter name required by the plugin's cross-task helper contract.

$cansakhara_footer_classes = 'site-footer w-full px-5 pb-[calc(50px+env(safe-area-inset-bottom))] pt-[80px] text-white md:px-20 md:pb-[50px] md:pt-[144px] ' . $cansakhara_class;
?>
<footer
	id="contact"
	style="background-color: <?php echo esc_attr( $cansakhara_footer_color ); ?>"
	class="<?php echo esc_attr( trim( $cansakhara_footer_classes ) ); ?>"
>
	<div class="mx-auto flex w-full flex-col gap-[30px] md:w-[1280px] md:gap-20">
		<div class="flex h-[293px] w-full flex-col items-center md:h-[486px]">
			<div
				data-anim="footer-item"
				class="relative mt-[28px] h-[59px] w-[177px] md:mt-[20px] md:h-[86px] md:w-[259px]"
			>
				<a
					href="https://mdmsl.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="relative block h-full w-full"
				>
					<img
						src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/mel-de-magranetes.svg' ); ?>"
						alt="Mel de Magranetes"
						class="absolute inset-0 h-full w-full"
					/>
				</a>
			</div>
			<div
				data-anim="footer-item"
				class="mt-[40px] flex justify-center gap-[51px] md:mt-[81.71px] md:gap-[191.77px]"
			>
				<a
					href="https://cansakhara.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="relative block h-[47px] w-[140px] md:h-[75px] md:w-[223px]"
				>
					<img
						src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/can-sakhara-footer.svg' ); ?>"
						alt="Can Sakhara"
						class="absolute inset-0 h-full w-full"
					/>
				</a>
				<a
					href="https://canergah.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="relative block h-[47px] w-[140px] md:h-[75px] md:w-[223px]"
				>
					<img
						src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/can-ergah.svg' ); ?>"
						alt="Can Ergâh"
						class="absolute inset-0 h-full w-full"
					/>
				</a>
			</div>
		</div>

		<span aria-hidden="true" class="h-px w-full bg-white"></span>

		<div
			data-anim="footer-item"
			class="flex flex-col-reverse items-center gap-5 font-display text-[8px] font-light uppercase leading-[1.2] tracking-[1.6px] md:flex-row md:items-center md:gap-0 md:text-[14px] md:tracking-[2.8px]"
		>
			<p class="text-center md:flex-1 md:text-left">
				© 2026 Mel de Magranetes SL
			</p>
			<nav class="flex items-center gap-[60px] md:gap-10">
				<a href="#">Terms</a>
				<a href="#">Cookies</a>
				<a href="#">Privacy</a>
			</nav>
		</div>
	</div>
</footer>

<?php
/**
 * Gallery scroll row — ported from src/components/GalleryScrollRow.tsx.
 *
 * Desktop-only, scroll-driven horizontal gallery: the band is held with
 * native CSS `position: sticky` and GSAP scrubs the track horizontally as
 * the page scrolls (see the source's header comment for why it avoids
 * ScrollTrigger's transform-pin). Mounted only at >=796px with motion
 * allowed; the peek-strip carousel (gallery-peek-strip.php) is the mobile
 * and reduced-motion fallback.
 *
 * The source never sets an inline `style` on the outer wrapper, the sticky
 * band, or the track at JSX-render time — `outer.style.height` and
 * `band.style.top` are only written once GSAP's `useGSAP` effect runs after
 * mount, and the track's horizontal position comes from a GSAP tween, not a
 * React style prop. So none of those elements carry an inline `style` here
 * either; Task 17 owns setting them.
 *
 * The task's own interface list gives this part only an `images` array, but
 * the source's `GalleryImage` type is `{ src, alt }` and every slide here
 * needs alt text — so, like gallery-peek-strip.php, this takes a parallel
 * `alt` array too.
 *
 * `next/image` with `fill` becomes a plain `<img>`, absolutely positioned to
 * fill its parent, keeping the `object-cover` utility the source applied and
 * the source's `draggable={false}`.
 *
 * No next/previous control exists in the source — desktop advances only by
 * scrolling the page. None is invented here.
 *
 * @package CanSakhara
 *
 * @var array $args {
 *     @type string[] $images Bare filenames under assets/img/, in display order.
 *     @type string[] $alt    Alt text, parallel to $images by index.
 * }
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$cansakhara_images = isset( $args['images'] ) && is_array( $args['images'] ) ? array_values( $args['images'] ) : array();
$cansakhara_alts   = isset( $args['alt'] ) && is_array( $args['alt'] ) ? array_values( $args['alt'] ) : array();
?>
<div class="relative">
	<div class="sticky top-0 bg-home-1 py-[20px] md:py-[30px]">
		<div class="flex justify-center">
			<div
				role="group"
				aria-roledescription="carousel"
				aria-label="Gallery"
				data-cansakhara-carousel="scroll-row"
				class="gallery-viewport"
			>
				<div class="gallery-track" data-cansakhara-track>
					<?php foreach ( $cansakhara_images as $cansakhara_i => $cansakhara_image ) : ?>
					<div aria-roledescription="slide" class="gallery-slide" data-cansakhara-slide>
						<img
							src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/' . $cansakhara_image ); ?>"
							alt="<?php echo esc_attr( isset( $cansakhara_alts[ $cansakhara_i ] ) ? $cansakhara_alts[ $cansakhara_i ] : '' ); ?>"
							draggable="false"
							class="absolute inset-0 h-full w-full object-cover"
						/>
					</div>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
	</div>
</div>

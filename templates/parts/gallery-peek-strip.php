<?php
/**
 * Gallery peek-strip carousel — ported from src/components/GalleryPeekStrip.tsx.
 *
 * Used on mobile at every breakpoint, and as the reduced-motion desktop
 * fallback for the pinned scroll row (see gallery-scroll-row.php). The
 * source triples whatever `images` list it receives — three back-to-back
 * copies — so the loop can wrap in either direction without a visible gap;
 * that tripling is reproduced here rather than left to the caller, matching
 * the source's own `slides = [...images, ...images, ...images]`.
 *
 * The source computes a `transform`/`transition` on the track in JS as the
 * user drags, steps, or auto-advances. This part renders only the initial,
 * un-transformed mount state: `index` starts at `n` (the images count as
 * passed in, before tripling — the first slide of the middle copy), so
 * `animate` and `isDragging` both start false and the track's `transition`
 * is "none" with a 0px drag offset. Everything time-varying — advancing,
 * dragging, autoplay, wrap-around, the live `data-cansakhara-index` mirror —
 * is Task 16's job.
 *
 * `next/image` with `fill` becomes a plain `<img>`, absolutely positioned to
 * fill its parent, keeping the `object-cover` utility the source applied and
 * the source's `draggable={false}` (native image drag would otherwise fight
 * the carousel's own pointer-drag handling once Task 16 wires it up).
 *
 * No next/previous control exists in the source — it is driven only by
 * pointer drag, arrow keys, and autoplay. None is invented here.
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
$cansakhara_n      = count( $cansakhara_images );

// Three back-to-back copies so the track can wrap seamlessly in either
// direction; `index` starts at the first slide of the middle copy.
$cansakhara_slides = array();
for ( $cansakhara_copy = 0; $cansakhara_copy < 3; $cansakhara_copy++ ) {
	foreach ( $cansakhara_images as $cansakhara_i => $cansakhara_image ) {
		$cansakhara_slides[] = array(
			'image' => $cansakhara_image,
			'alt'   => isset( $cansakhara_alts[ $cansakhara_i ] ) ? $cansakhara_alts[ $cansakhara_i ] : '',
		);
	}
}

$cansakhara_index = $cansakhara_n;
?>
<div class="bg-home-1 py-[20px] md:py-[30px]">
<div class="flex justify-center">
	<div
		role="group"
		tabindex="0"
		aria-roledescription="carousel"
		aria-label="Gallery image 1 of <?php echo esc_attr( $cansakhara_n ); ?>"
		data-cansakhara-carousel="peek"
		class="gallery-viewport cursor-grab focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
	>
		<div
			class="gallery-track"
			data-cansakhara-track
			style="--gallery-i: <?php echo esc_attr( $cansakhara_index ); ?>; --gallery-drag: 0px; transition: none;"
		>
			<?php foreach ( $cansakhara_slides as $cansakhara_slide ) : ?>
			<div aria-roledescription="slide" class="gallery-slide" data-cansakhara-slide>
				<img
					src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/' . $cansakhara_slide['image'] ); ?>"
					alt="<?php echo esc_attr( $cansakhara_slide['alt'] ); ?>"
					draggable="false"
					class="absolute inset-0 h-full w-full object-cover"
				/>
			</div>
			<?php endforeach; ?>
		</div>
	</div>
</div>
</div>

<?php
/**
 * By Night page — ported from src/app/by-night/page.tsx.
 *
 * No `next/image` in the source is marked `priority`, so every image on this
 * page — including the above-the-fold hero wordmark — gets `loading="lazy"`,
 * matching next/image's own default (the source's `SecondaryButton`'s hover
 * colour, `hover:text-[#031927]`, is passed as `cansakhara_secondary_button()`'s
 * required `$hover_class` argument).
 *
 * Gallery: the source's `GalleryCarousel` wrapper duplicates the 3 designed
 * images to 6 (`[...images, ...images]`) and mounts exactly one child —
 * `GalleryScrollRow` on desktop when motion is allowed, `GalleryPeekStrip`
 * otherwise — with SSR state `false`, so first paint is always the peek
 * strip. Both parts are rendered here instead of just one: the scroll row is
 * wrapped in a `hidden` container tagged `data-cansakhara-gallery-scroll-row`,
 * the peek strip in a container tagged `data-cansakhara-gallery-peek`. A
 * later task's behaviour script removes whichever is unused once it knows
 * the viewport and `prefers-reduced-motion`, reproducing both "only one
 * child's effects run" and the peek-strip first paint.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$cansakhara_gallery_images = array( 'bynight-gallery-1.png', 'bynight-gallery-2.png', 'bynight-gallery-3.png' );
$cansakhara_gallery_alts   = array(
	'Candlelit dinner table at Can Sakhara',
	'The illuminated pool and terraces at night',
	'A DJ at the decks during an evening gathering',
);
// The source's GalleryCarousel wrapper duplicates the 3 designed images to 6
// ([...images, ...images]) before handing them to whichever child it mounts.
$cansakhara_gallery_images = array_merge( $cansakhara_gallery_images, $cansakhara_gallery_images );
$cansakhara_gallery_alts   = array_merge( $cansakhara_gallery_alts, $cansakhara_gallery_alts );

cansakhara_document_open( array( 'theme' => 'night' ) );
cansakhara_part( 'header', array( 'theme' => 'night' ) );
?>
<main id="content" class="site-shell h-[100dvh] overflow-x-hidden overflow-y-auto bg-[#000e16] text-white">
	<?php // Hero — flat By Night navy, transparent navbar over it. ?>
	<section class="relative flex h-[100svh] w-full flex-col items-center justify-center bg-[#031927]">
		<span
			aria-hidden="true"
			data-anim="hero-rule"
			data-hero-rule
			class="absolute inset-x-0 top-[118px] mx-auto h-px w-[362px] bg-white md:top-[131px] md:w-[1280px]"
		></span>

		<div class="flex w-full flex-col items-center gap-[30px] md:w-[1064px] md:gap-[60px]">
			<?php cansakhara_moon_icon( 'size-20 md:size-[110px]' ); ?>
			<h1
				data-anim="hero-title"
				data-hero-hide
				class="font-display text-[34px] font-light uppercase leading-[1.4] tracking-[17px] text-white indent-[17px] md:text-[56px] md:tracking-[28px] md:indent-[28px]"
			>
				By Night
			</h1>
			<img
				src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/hero-wordmark-night.svg' ); ?>"
				alt="Can Sakhara"
				width="262"
				height="20"
				data-anim="hero-wordmark"
				data-hero-hide
				loading="lazy"
				class="h-auto w-[157px] md:w-[262px]"
			/>
		</div>
	</section>

	<?php
	// Full-width estate view — framed top and bottom by a 2px white divider
	// at every breakpoint (the white borders must always remain).
	?>
	<section
		data-anim="clip-image"
		class="relative mt-[2px] h-[300px] w-full border-y-2 border-white md:mt-0 md:h-[531px]"
	>
		<img
			src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/bynight-1.png' ); ?>"
			alt="Aerial view over Can Sakhara lit up at night"
			loading="lazy"
			class="absolute inset-0 h-full w-full object-cover"
		/>
	</section>

	<?php // Glorious afterhours. ?>
	<section class="flex h-[588px] w-full flex-col items-center bg-[#000e16] px-5 pt-[60px] md:h-[736px] md:px-0 md:pt-[116px]">
		<div class="flex w-full flex-col items-center gap-[25px] md:w-[1064px] md:gap-[50px]">
			<div
				data-anim="block-heading"
				class="text-center font-display text-[30px] uppercase leading-none text-white md:text-[48px]"
			>
				<p class="font-thin tracking-[6px] indent-[3px] md:tracking-[3.2px] md:indent-[1.6px]">
					Glorious
				</p>
				<p class="font-light tracking-[6px] indent-[3px] md:tracking-[9.6px] md:indent-[4.8px]">
					Afterhours
				</p>
			</div>
			<p
				data-anim="block-subtitle"
				class="w-[322px] text-center font-serif text-[15px] font-light italic leading-[1.8] tracking-[1.5px] text-white md:w-[1064px] md:text-[28px] md:tracking-[2.8px]"
			>
				As the sun sets over the island,
				<br />
				Can Sakhara comes alive in the glow of the afterhours
			</p>
			<div
				data-anim="block-copy"
				class="flex w-full max-w-[312px] flex-col items-center gap-[18px] text-center font-body text-[11px] font-light leading-[1.6] tracking-[0.55px] text-white md:w-auto md:max-w-none md:flex-row md:items-start md:justify-center md:gap-[19.5px] md:text-left md:text-[16px] md:tracking-[0.8px]"
			>
				<p class="md:w-[380px] md:text-right">
					The golden hour takes hold and Ibiza puts on a show. As daylight
					fades, Can Sakhara transforms into a warm and cinematic retreat.
					Your soundtrack flows seamlessly throughout the house as cocktails
					are mixed at the bar and dinner lingers long into the evening. From
					intimate corners to art-filled living spaces, every room is made
					for nights to remember.
				</p>
				<p class="md:w-[380px]">
					Outside, the magic deepens. The pool glows from within, the gardens
					are bathed in warm golden light, and the shimmering lights of Ibiza
					sparkle in the distance. Watch a film beneath the stars on the
					spectacular outdoor screen, share one final drink by the water, and
					savour long, unhurried conversations under the night sky. Within
					moments of the island’s most iconic nightlife, yet a world away.
				</p>
			</div>
		</div>
	</section>

	<?php
	// Gallery. Desktop: a pinned, scroll-driven horizontal row (sticky-held).
	// Mobile / reduced-motion: the snap-scrolling peek strip (278px slides).
	// The white band lives inside each gallery part's own markup so the
	// desktop sticky scroll-region can stay transparent and show the dark
	// page behind it.
	?>
	<section class="w-full">
		<div data-cansakhara-gallery-peek>
			<?php
			cansakhara_part(
				'gallery-peek-strip',
				array(
					'images' => $cansakhara_gallery_images,
					'alt'    => $cansakhara_gallery_alts,
				)
			);
			?>
		</div>
		<div data-cansakhara-gallery-scroll-row class="hidden">
			<?php
			cansakhara_part(
				'gallery-scroll-row',
				array(
					'images' => $cansakhara_gallery_images,
					'alt'    => $cansakhara_gallery_alts,
				)
			);
			?>
		</div>
	</section>

	<?php // Solace of slumber. ?>
	<section class="flex h-[332px] w-full flex-col items-center bg-[#031927] px-5 pt-[60px] md:h-[580px] md:px-0 md:pt-[115px]">
		<div class="flex w-full flex-col items-center gap-[30px] md:w-[1064px] md:gap-[50px]">
			<h2
				data-anim="block-heading"
				class="text-center font-display text-[24px] font-light uppercase leading-none tracking-[4.8px] text-white indent-[2.4px] md:text-[34px] md:leading-[1.4] md:tracking-[6.8px] md:indent-[3.4px]"
			>
				Solace of Slumber
			</h2>
			<p
				data-anim="block-subtitle"
				class="w-[312px] text-center font-serif text-[13px] font-light italic leading-[1.8] tracking-[1.3px] text-white md:w-[1064px] md:text-[28px] md:tracking-[2.8px]"
			>
				Whether retreating to the Primary Suite or one of seven individually
				designed guest rooms, each offers a private sanctuary where the day
				dissolves into deep, restorative rest.
			</p>
			<?php cansakhara_secondary_button( 'Enquire', 'mailto:reservations@cansakhara.com', 'hover:text-[#031927]', '', 'block-button' ); ?>
		</div>
	</section>

	<?php
	// Full-width pool view — framed top and bottom by a 2px white divider at
	// every breakpoint (the white borders must always remain).
	?>
	<section
		data-anim="clip-image"
		class="relative mt-[2px] h-[266px] w-full border-y-2 border-white md:h-[663px]"
	>
		<img
			src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/bynight-2.png' ); ?>"
			alt="The illuminated pool and terraces of Can Sakhara from above"
			loading="lazy"
			class="absolute inset-0 h-full w-full object-cover"
		/>
	</section>

	<?php
	cansakhara_part(
		'footer',
		array(
			'theme' => 'night',
			'class' => 'mt-[2px]',
		)
	);
	?>
</main>
<?php
cansakhara_part( 'side-nav' );
cansakhara_document_close();

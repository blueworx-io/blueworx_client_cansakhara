<?php
/**
 * By Day page — ported from src/app/by-day/page.tsx.
 *
 * No `next/image` in the source is marked `priority`, so every image on this
 * page — including the above-the-fold hero wordmark — gets `loading="lazy"`,
 * matching next/image's own default (the source's `SecondaryButton`'s hover
 * colour, `hover:text-[#ac9a8c]`, is passed as `cansakhara_secondary_button()`'s
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

$cansakhara_gallery_images = array( 'byday-gallery-1.png', 'byday-gallery-2.png', 'byday-gallery-3.png' );
$cansakhara_gallery_alts   = array(
	'Pool and terrace at Can Sakhara',
	'The villa framed by Mediterranean planting',
	'A light-filled interior at Can Sakhara',
);
// The source's GalleryCarousel wrapper duplicates the 3 designed images to 6
// ([...images, ...images]) before handing them to whichever child it mounts.
$cansakhara_gallery_images = array_merge( $cansakhara_gallery_images, $cansakhara_gallery_images );
$cansakhara_gallery_alts   = array_merge( $cansakhara_gallery_alts, $cansakhara_gallery_alts );

cansakhara_document_open( array( 'theme' => 'day' ) );
cansakhara_part( 'header', array( 'theme' => 'day' ) );
?>
<main id="content" class="site-shell h-[100dvh] overflow-x-hidden overflow-y-auto bg-white text-white">
	<?php // Hero — flat By Day taupe, transparent navbar over it. ?>
	<section class="relative flex h-[100svh] w-full flex-col items-center justify-center bg-[#ac9a8c]">
		<span
			aria-hidden="true"
			data-anim="hero-rule"
			data-hero-rule
			class="absolute inset-x-0 top-[118px] mx-auto h-px w-[362px] bg-white md:top-[131px] md:w-[1280px]"
		></span>

		<div class="flex w-full flex-col items-center gap-[30px] md:w-[1064px] md:gap-[60px]">
			<?php cansakhara_sun_icon( 'size-20 md:size-[110px]' ); ?>
			<h1
				data-anim="hero-title"
				data-hero-hide
				class="font-display text-[34px] font-light uppercase leading-[1.4] tracking-[17px] text-white indent-[17px] md:text-[56px] md:tracking-[28px] md:indent-[28px]"
			>
				By Day
			</h1>
			<img
				src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/hero-wordmark-day.svg' ); ?>"
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

	<?php // Full-width estate view. ?>
	<section
		data-anim="clip-image"
		class="relative mt-[2px] h-[300px] w-full md:h-[531px]"
	>
		<img
			src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/byday-1.png' ); ?>"
			alt="Aerial view over Can Sakhara and the hills of Ibiza"
			loading="lazy"
			class="absolute inset-0 h-full w-full object-cover"
		/>
	</section>

	<?php
	// Sun-drenched serenity — desktop is framed top and bottom by a 2px
	// white divider; mobile keeps the original layout, unchanged.
	?>
	<section class="flex h-[588px] w-full flex-col items-center bg-[#918074] px-5 pt-[60px] md:h-[736px] md:border-y-2 md:border-white md:px-0 md:pt-[116px]">
		<div class="flex w-full flex-col items-center gap-[25px] md:w-[1064px] md:gap-[50px]">
			<div
				data-anim="block-heading"
				class="text-center font-display text-[30px] uppercase leading-none text-white md:text-[48px]"
			>
				<p class="font-thin tracking-[6px] indent-[3px] md:tracking-[3.2px] md:indent-[1.6px]">
					Sun-Drenched
				</p>
				<p class="font-light tracking-[6px] indent-[3px] md:tracking-[9.6px] md:indent-[4.8px]">
					Serenity
				</p>
			</div>
			<p
				data-anim="block-subtitle"
				class="w-[322px] text-center font-serif text-[15px] font-light italic leading-[1.8] tracking-[1.5px] text-white md:w-[1064px] md:text-[28px] md:tracking-[2.8px]"
			>
				A myriad of spaces, both inside and out,
				<br />
				inviting each guest to shape the day as they choose
			</p>
			<div
				data-anim="block-copy"
				class="flex w-full max-w-[312px] flex-col items-center gap-[18px] text-center font-body text-[11px] font-light leading-[1.6] tracking-[0.55px] text-white md:w-[760px] md:max-w-none md:flex-row md:items-start md:gap-5 md:text-left md:text-[16px] md:tracking-[0.8px]"
			>
				<p class="md:w-[370px] md:text-right">
					As morning light pours across the terraces, Can Sakhara reveals its
					most restorative side. Whether energised and productive or completely
					at ease, the house adapts intuitively to your mood. Begin with an
					espresso in the kitchen, sink into an Eames lounge chair with a book,
					retreat to the gym for a focused workout, or drift through rooms
					filled with art, colour and tactile textures.
				</p>
				<p class="md:w-[370px]">
					Outside, the experience opens up on an extraordinary scale. The
					shimmering pool lies at the centre of vast sun-drenched terraces,
					framed by lush planting and uninterrupted views. Sink into a sun
					lounger and soak up the warmth, or dine al fresco as long lunches
					unfold and conversations unfurl, while guests and generations of
					family gather for long, unhurried hours together.
				</p>
			</div>
		</div>
	</section>

	<?php
	// Gallery. Desktop: a pinned, scroll-driven horizontal row (sticky-held).
	// Mobile / reduced-motion: the snap-scrolling peek strip (278px slides).
	// The white band lives inside each gallery part's own markup so the
	// desktop sticky scroll-region can stay transparent.
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

	<?php // Balearic bliss. ?>
	<section class="flex h-[308px] w-full flex-col items-center bg-[#ac9a8c] px-5 pt-[60px] md:h-[529px] md:px-0 md:pt-[115px]">
		<div class="flex w-full flex-col items-center gap-[30px] md:w-[1064px] md:gap-[50px]">
			<h2
				data-anim="block-heading"
				class="text-center font-display text-[24px] font-light uppercase leading-none tracking-[4.8px] text-white indent-[2.4px] md:text-[34px] md:leading-[1.4] md:tracking-[6.8px] md:indent-[3.4px]"
			>
				Balearic Bliss
			</h2>
			<p
				data-anim="block-subtitle"
				class="w-[312px] text-center font-serif text-[13px] font-light italic leading-[1.8] tracking-[1.3px] text-white md:w-[1064px] md:text-[28px] md:tracking-[2.8px]"
			>
				Whether seeking quiet restoration or vibrant island living, every
				moment unfolds with effortless ease beneath the Balearic sun.
			</p>
			<?php cansakhara_secondary_button( 'Enquire', 'mailto:reservations@cansakhara.com', 'hover:text-[#ac9a8c]', '', 'block-button' ); ?>
		</div>
	</section>

	<?php // Full-width terrace view. ?>
	<section
		data-anim="clip-image"
		class="relative mt-[2px] h-[266px] w-full md:h-[663px]"
	>
		<img
			src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/byday-2.png' ); ?>"
			alt="Sun loungers and planting on the terraces of Can Sakhara"
			loading="lazy"
			class="absolute inset-0 h-full w-full object-cover"
		/>
	</section>

	<?php
	cansakhara_part(
		'footer',
		array(
			'theme' => 'day',
			'class' => 'mt-[2px]',
		)
	);
	?>
</main>
<?php
cansakhara_part( 'side-nav' );
cansakhara_document_close();

<?php
/**
 * Experience carousel — ported from src/components/ExperienceCarousel.tsx.
 *
 * The source computes a `transform`/`transition` on the track in JS as the
 * user drags, steps, or the loop wraps. This part renders only the initial,
 * un-transformed mount state: `index` starts at 1 (the first real slide —
 * slide 0 is the trailing clone used for the backward wrap), `animate` and
 * `isDragging` both start false, so the track's `transition` is "none" and
 * its drag offset is 0px. Everything time-varying — advancing, dragging,
 * wrap-around, the live `data-cansakhara-index` mirror — is Task 15's job.
 *
 * The slide list clones the last real slide before the set and the first two
 * real slides after it, so the loop can wrap in either direction without a
 * visible gap (see the source's comment on `slides`). Six `<article>`
 * elements are rendered in that source order; only the one at slide index 1
 * (the real first slide) is `aria-hidden="false"` at mount, matching the
 * source's `aria-hidden={slideIndex !== index}` evaluated at `index === 1`.
 *
 * The slide copy (titles, subtitles, body paragraphs) is prose held in a JS
 * array in the source component. It is reproduced verbatim below, including
 * the typographic apostrophe and em dash in the second experience's copy —
 * do not let an editor normalise them to ASCII.
 *
 * Each experience's subtitle is two pre-composed line breaks: a mobile
 * variant with no `<br>` (a CSS balance utility reflows it) and a desktop
 * variant with an explicit `<br>` between two sentences, matching the
 * source's two `<span>`s (`md:hidden` / `hidden md:inline`).
 *
 * `next/image` with `fill` becomes a plain `<img>`, absolutely positioned to
 * fill its parent, keeping the `object-cover` utility the source applied and
 * the source's `draggable={false}` (native image drag would otherwise fight
 * the carousel's own pointer-drag handling once Task 15 wires it up).
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$cansakhara_experiences = array(
	array(
		'title'            => 'An island original',
		'subtitle_mobile'  => 'Can Sakhara is a magnet for non-conformists. Innovators. Individuals. Much like the island herself',
		'subtitle_desktop' => array(
			'Can Sakhara is a magnet for non-conformists.',
			'Innovators. Individuals. Much like the island herself',
		),
		'image'            => 'experience-1.png',
		'alt'              => 'The white exterior of Can Sakhara framed by palm trees',
		'paragraphs'       => array(
			'From the highest house on the hill in Sa Carroca, the island below is yours. From shimmering Salinas salt-flats to Formentera, meandering boats drifting on the sparkling sea, and the patterns of the stars. A heavenly hideaway.',
			'It’s a feeling to step into, an immersion into our art, culture and vibe — seamlessly intertwined into one home. This is where space transforms to ever-changing needs. An experience that morphs through the hours to become everything you want it to be and more. Join us for a new chapter.',
			'Your ultimate island home.',
		),
	),
	array(
		'title'            => 'Boldly beautiful',
		'subtitle_mobile'  => 'So much more than a conventional luxury villa rental. Tune-in to your personal Ibiza experience, unique in every way',
		'subtitle_desktop' => array(
			'So much more than a conventional luxury villa rental.',
			'Tune-in to your personal Ibiza experience, unique in every way',
		),
		'image'            => 'experience-2.png',
		'alt'              => 'The sculptural timber entrance to Can Sakhara',
		'paragraphs'       => array(
			'True sanctuary begins with space. Space to rest, to play, to revive.',
			'Wrapped by lush gardens and terraces, the house unfolds from the moment you step in. Greeted by a statement staircase and triple-height ceilings into an open living space, straight into our world of art and colour.',
			'Can Sakhara features a stunning Primary Suite and seven additional individually designed bedrooms, sleeping up to 16 guests.',
		),
	),
	array(
		'title'            => 'Heart of a home',
		'subtitle_mobile'  => 'Just as our changing moods shape how we use a space, so Can Sakhara shifts alongside us to match the tempo',
		'subtitle_desktop' => array(
			'Just as our changing moods shape how we use a space,',
			'so Can Sakhara shifts alongside us to match the tempo',
		),
		'image'            => 'experience-3.png',
		'alt'              => 'An art-filled lounge inside Can Sakhara',
		'paragraphs'       => array(
			'Iconic contemporary furniture and tactile fabrics. Tongue in cheek touches. A vintage jukebox. Eames lounge chairs. Limited edition disco ball sculptures.',
			'Discover the pulse of our place in bronze, travertine, smoked mirror glass, curated art and installations handpicked from artists across the globe.',
			'Rich, calm, beautiful, and bold.',
		),
	),
);

// Clones bracket the real slides so the track can wrap seamlessly in either
// direction: the last real slide is prepended, and the first two real slides
// are appended (see the source's comment on `slides` for why two, not one).
$cansakhara_n                 = count( $cansakhara_experiences );
$cansakhara_experience_slides = array(
	$cansakhara_experiences[ $cansakhara_n - 1 ],
	$cansakhara_experiences[0],
	$cansakhara_experiences[1],
	$cansakhara_experiences[2],
	$cansakhara_experiences[0],
	$cansakhara_experiences[1],
);

// `index` points into the cloned list and starts at 1 — the first real slide.
$cansakhara_index = 1;
?>
<section
	id="experience"
	data-cansakhara-carousel="experience"
	aria-roledescription="carousel"
	aria-label="Experience Can Sakhara"
	class="experience-section relative overflow-hidden bg-[#f2ebe2] py-28 md:py-0"
>
	<div
		role="group"
		tabindex="0"
		aria-label="Experience 1 of <?php echo esc_attr( $cansakhara_n ); ?>"
		class="experience-viewport md:cursor-grab focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#42081a]"
	>
		<div
			class="experience-track"
			data-cansakhara-track
			style="--carousel-i: <?php echo esc_attr( $cansakhara_index ); ?>; --carousel-drag: 0px; transition: none;"
		>
			<?php foreach ( $cansakhara_experience_slides as $cansakhara_slide_index => $cansakhara_experience ) : ?>
			<article
				aria-roledescription="slide"
				aria-hidden="<?php echo ( $cansakhara_slide_index === $cansakhara_index ) ? 'false' : 'true'; ?>"
				class="experience-slide"
				data-cansakhara-slide
			>
				<div class="experience-card-inner px-6 md:px-0">
					<header class="section-heading experience-heading mx-auto w-full min-w-0 max-w-5xl text-center text-[#42081a]">
						<p class="section-eyebrow font-display text-[12px] uppercase leading-none tracking-[2.4px] md:text-[22px] md:tracking-[4.4px]">Experience</p>
						<h2 class="section-title mx-auto mt-[20px] max-w-full break-words font-display text-[24px] font-light uppercase leading-none tracking-[4.8px] md:mt-[50px] md:text-5xl md:leading-none md:tracking-[0.2em]"><?php echo esc_html( $cansakhara_experience['title'] ); ?></h2>
						<p class="section-subtitle mx-auto mt-[20px] max-w-[calc(100vw-3rem)] break-words font-serif text-[13px] font-light italic leading-[1.8] tracking-[1.3px] md:mt-[50px] md:max-w-4xl md:text-[28px] md:tracking-[2.8px]">
							<span class="block [text-wrap:balance] md:hidden"><?php echo esc_html( $cansakhara_experience['subtitle_mobile'] ); ?></span>
							<span class="hidden md:inline"><?php echo esc_html( $cansakhara_experience['subtitle_desktop'][0] ); ?><br /><?php echo esc_html( $cansakhara_experience['subtitle_desktop'][1] ); ?></span>
						</p>
					</header>
					<div class="experience-layout mx-auto mt-10 grid max-w-6xl items-center gap-12 min-[1440px]:mt-0 min-[1440px]:grid-cols-[652px_304px] min-[1440px]:gap-[90px]">
						<div class="experience-image relative aspect-[1.3/1] overflow-hidden">
							<img
								src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/' . $cansakhara_experience['image'] ); ?>"
								alt="<?php echo esc_attr( $cansakhara_experience['alt'] ); ?>"
								draggable="false"
								class="absolute inset-0 h-full w-full object-cover"
							/>
						</div>
						<div class="experience-copy w-full min-w-0 max-w-[calc(100vw-3rem)] break-words text-center font-body text-[15px] font-light leading-[1.6] tracking-[0.05em] md:text-left min-[1440px]:max-w-none min-[1440px]:text-[16px]">
							<?php foreach ( $cansakhara_experience['paragraphs'] as $cansakhara_paragraph ) : ?>
							<p class="mt-6 first:mt-0"><?php echo esc_html( $cansakhara_paragraph ); ?></p>
							<?php endforeach; ?>
						</div>
					</div>
				</div>
			</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>

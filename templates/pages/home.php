<?php
/**
 * Home page — ported from src/app/page.tsx.
 *
 * The hero image is the page's only `priority` next/image, so it alone gets
 * `loading="eager"`/`fetchpriority="high"`; every other image on the page
 * (including the above-the-fold hero wordmark, which the source never marks
 * `priority`) gets `loading="lazy"`, matching next/image's own default.
 *
 * The `WelcomeTitleLockup`/`JustifiedLine` helpers from the source are not
 * promoted to includes/components.php (they are single-use, page-specific,
 * and the source itself keeps them local to this file) — they are ported
 * inline below. `JustifiedLine` renders a literal space character in its
 * source text as a non-breaking space (U+00A0) so the flex layout's
 * `justify-between` does not collapse a trailing whitespace-only cell; that
 * substitution is preserved here.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Six feature stats (Figma "Featuring" row). Entries without a unit (all but
// Plot/House) render only the value.
$cansakhara_features = array(
	array(
		'value' => '6061',
		'unit'  => 'm²',
		'label' => 'Plot',
	),
	array(
		'value' => '1261',
		'unit'  => 'm²',
		'label' => 'House',
	),
	array(
		'value' => '8',
		'label' => 'Bedrooms',
	),
	array(
		'value' => '16',
		'label' => 'Sleeps',
	),
	array(
		'value' => '7',
		'label' => 'Bathrooms',
	),
	array(
		'value' => '1',
		'label' => 'Guest WC',
	),
);

// The "Introducing / Can Sakhara" per-character justified lockup (ported from
// JustifiedLine/WelcomeTitleLockup in src/app/page.tsx). Built once here and
// passed to cansakhara_section_heading() as trusted 'title' markup.
$cansakhara_lockup_lines = array(
	array(
		'text'  => 'INTRODUCING',
		'class' => 'welcome-lockup-line font-extralight',
	),
	array(
		'text'  => 'CAN SAKHARA',
		'class' => 'welcome-lockup-line',
	),
);

ob_start();
?>
<span class="sr-only">Introducing Can Sakhara</span>
<span aria-hidden="true" class="welcome-lockup mx-auto flex flex-col">
	<?php foreach ( $cansakhara_lockup_lines as $cansakhara_line ) : ?>
	<span class="<?php echo esc_attr( trim( 'flex w-full justify-between ' . $cansakhara_line['class'] ) ); ?>">
		<?php foreach ( str_split( $cansakhara_line['text'] ) as $cansakhara_char ) : ?>
		<span><?php echo ( ' ' === $cansakhara_char ) ? '&nbsp;' : esc_html( $cansakhara_char ); ?></span>
		<?php endforeach; ?>
	</span>
	<?php endforeach; ?>
</span>
<?php
$cansakhara_welcome_title = ob_get_clean();

cansakhara_document_open( array( 'theme' => 'home' ) );
cansakhara_part( 'header', array( 'theme' => 'home' ) );
?>
<main id="content" class="site-shell h-[100dvh] overflow-x-hidden overflow-y-auto bg-white text-[#42081a]">
	<section class="hero-section relative flex h-[100svh] flex-col items-center justify-center overflow-hidden">
		<img
			src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/hero.png' ); ?>"
			alt="Can Sakhara villa in the hills of Ibiza"
			data-hero-scale
			loading="eager"
			fetchpriority="high"
			class="absolute inset-0 h-full w-full object-cover object-center"
		/>
		<div class="absolute inset-0 bg-black/20"></div>

		<div class="hero-content relative z-10 flex flex-col items-center px-5 text-center text-white max-[795px]:h-full max-[795px]:w-full max-[795px]:justify-center">
			<h1 class="sr-only">Can Sakhara</h1>
			<img
				src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/hero-wordmark.svg' ); ?>"
				alt=""
				width="655"
				height="50"
				data-hero-hide
				loading="lazy"
				class="hero-wordmark mx-auto h-auto w-[300px] sm:w-[520px] md:w-[655px]"
			/>
			<div class="hero-actions mt-12 flex flex-col items-center justify-center gap-4 min-[376px]:flex-row max-[795px]:absolute max-[795px]:inset-x-0 max-[795px]:bottom-[71px] max-[795px]:mt-0 max-[795px]:px-5">
				<a
					href="<?php echo esc_url( home_url( '/by-day/' ) ); ?>"
					data-hero-hide
					class="hero-choice flex h-[54px] w-40 items-center justify-center border border-white bg-[#ac9a8c] px-5 font-display text-xs uppercase tracking-[0.35em] transition-colors hover:bg-white hover:text-[#42081a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
				>
					By day
				</a>
				<a
					href="<?php echo esc_url( home_url( '/by-night/' ) ); ?>"
					data-hero-hide
					class="hero-choice flex h-[54px] w-40 items-center justify-center border border-white bg-[#001c2b] px-5 font-display text-xs uppercase tracking-[0.35em] transition-colors hover:bg-white hover:text-[#001c2b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
				>
					By night
				</a>
			</div>
		</div>
	</section>

	<section id="welcome" class="welcome-section relative bg-white">
		<?php cansakhara_section_line( 'welcome-line-top relative z-10 -mt-14 md:-mt-20' ); ?>
		<div class="welcome-inner px-6 pb-24 pt-16 md:px-16 md:pb-40">
			<?php
			cansakhara_section_heading(
				array(
					'class'    => 'welcome-heading',
					'eyebrow'  => 'Welcome',
					'title'    => $cansakhara_welcome_title,
					'subtitle' => 'Ibiza beckons. An iconic home, reimagined. A view like no other',
				)
			);
			?>

			<div class="welcome-content mx-auto mt-[25px] grid min-w-0 max-w-6xl items-center gap-[25px] md:mt-24 min-[1440px]:mt-0 min-[1440px]:grid-cols-[666px_346px] min-[1440px]:gap-[90px]">
				<div class="map-frame relative mx-auto aspect-[1.24/1] w-full max-w-[620px]">
					<div class="map-art relative size-full">
						<img
							src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/ibiza-map.svg' ); ?>"
							alt="Map of Ibiza showing the location of Can Sakhara"
							loading="lazy"
							class="absolute inset-0 h-full w-full object-contain"
						/>
					</div>
				</div>
				<div class="welcome-copy w-full min-w-0 max-w-[calc(100vw-3rem)] break-words text-center font-body text-[15px] font-light leading-[1.75] tracking-[0.04em] md:text-left min-[1440px]:max-w-none min-[1440px]:text-base">
					<p>
						Every so often the White Isle opens up to reveal one of her hidden gems, instantly challenging clichéd notions of the ‘real’ Ibiza.
					</p>
					<p class="mt-7">Welcome to Can Sakhara.</p>
					<p class="mt-7">
						Be the first to experience utmost privacy, coupled with absolute glamour. Colour for miles, amidst your own cinematic landscape. A hillside setting near to beach clubs, superclubs, and the island’s best restaurants, yet always tucked away. There for the taking or just the observing.
					</p>
					<p class="mt-7">
						Balearic rock ‘n roll, with a fine art heart.
					</p>
					<?php cansakhara_outline_button( 'Enquire', 'mailto:reservations@cansakhara.com', 'mt-10 hover:bg-[#42081a] hover:text-white' ); ?>
				</div>
			</div>

			<div class="features-block mx-auto mt-24 max-w-4xl md:mt-32">
				<h3 class="features-title text-center font-display text-[10px] uppercase leading-none tracking-[2px] md:text-[21px] md:tracking-[4.2px]">
					Featuring
				</h3>
				<div class="features-grid mt-[30px] grid grid-cols-3 gap-x-5 gap-y-5 md:mt-[50px] md:grid-cols-6">
					<?php foreach ( $cansakhara_features as $cansakhara_feature ) : ?>
					<div class="text-center">
						<div class="feature-circle mx-auto flex size-10 flex-col items-center justify-center rounded-full bg-[#f2ebe2] md:size-[68px]">
							<span class="font-body text-[12px] font-normal leading-none tracking-[0.6px] md:text-[22px] md:tracking-[1.1px]"><?php echo esc_html( $cansakhara_feature['value'] ); ?></span>
							<?php if ( ! empty( $cansakhara_feature['unit'] ) ) : ?>
							<span class="mt-0.5 font-body text-[6px] font-light leading-none tracking-[0.6px] md:mt-1 md:text-[11px] md:tracking-[1.1px]"><?php echo esc_html( $cansakhara_feature['unit'] ); ?></span>
							<?php endif; ?>
						</div>
						<p class="mt-[14px] font-body text-[10px] font-light uppercase leading-none tracking-[1px] md:mt-[18px] md:text-[15px] md:tracking-[1.5px]"><?php echo esc_html( $cansakhara_feature['label'] ); ?></p>
					</div>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
		<?php cansakhara_section_line( 'welcome-line-bottom relative z-10 -mb-14 md:-mb-20' ); ?>
	</section>

	<?php cansakhara_part( 'experience-carousel' ); ?>

	<section id="discover" class="discover-section relative bg-white">
		<?php cansakhara_section_line( 'discover-line-top relative z-10 -mt-14 md:-mt-20' ); ?>
		<div class="discover-inner px-6 pb-[49px] pt-10 md:px-16 md:pb-0 md:pt-24">
			<h2 class="discover-title text-center font-display text-lg uppercase tracking-[0.34em]">
				Discover
			</h2>
			<div class="discover-grid mx-auto mt-[38px] grid max-w-[1170px] justify-items-center gap-8 md:mt-20 md:justify-items-stretch min-[1440px]:grid-cols-[550px_550px] min-[1440px]:gap-[70px]">
				<article class="discover-card flex aspect-square flex-col items-center justify-center bg-[#ac9a8c] px-6 text-center text-white">
					<?php cansakhara_sun_icon( 'size-20 md:size-[180px]' ); ?>
					<h3 class="discover-card-title mt-10 font-display text-base font-light uppercase tracking-[0.5em] md:mt-[50px] md:text-[44px] md:tracking-[0.4em]">
						By day
					</h3>
					<?php cansakhara_outline_button( 'Explore', home_url( '/by-day/' ), 'mt-10 border-white bg-[#918074] hover:bg-white hover:text-[#ac9a8c] md:mt-[50px]' ); ?>
				</article>
				<article class="discover-card flex aspect-square flex-col items-center justify-center bg-[#031927] px-6 text-center text-white">
					<?php cansakhara_moon_icon( 'size-20 md:size-[180px]' ); ?>
					<h3 class="discover-card-title mt-10 font-display text-base font-light uppercase tracking-[0.5em] md:mt-[50px] md:text-[44px] md:tracking-[0.4em]">
						By night
					</h3>
					<?php cansakhara_outline_button( 'Explore', home_url( '/by-night/' ), 'mt-10 border-white bg-[#255a6b] hover:bg-white hover:text-[#001c2b] md:mt-[50px]' ); ?>
				</article>
			</div>
		</div>
		<?php cansakhara_section_line( 'discover-line-bottom relative z-10 -mb-14 md:-mb-20' ); ?>
	</section>

	<section class="video-section relative flex h-[430px] items-center justify-center md:h-[600px]">
		<img
			src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/video-cover.png' ); ?>"
			alt="Panoramic view from Can Sakhara over Ibiza"
			loading="lazy"
			class="absolute inset-0 h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-black/10"></div>
		<button
			type="button"
			aria-label="Play Can Sakhara film"
			class="relative size-24 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:size-[170px]"
		>
			<img
				src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/play.svg' ); ?>"
				alt=""
				loading="lazy"
				class="absolute inset-0 h-full w-full"
			/>
		</button>
	</section>

	<?php cansakhara_part( 'footer', array( 'theme' => 'home' ) ); ?>
</main>
<?php
cansakhara_part( 'side-nav' );
cansakhara_document_close();

<?php
/**
 * Home page — ported from src/app/page.tsx.
 *
 * The hero image is the page's only `priority` next/image, so it alone gets
 * `fetchpriority="high"`; every other below-the-fold image gets
 * `loading="lazy"`, matching next/image's own default.
 *
 * The hero wordmark is the exception: the source never marked it `priority`,
 * but it is above the fold, and lazy-loading an above-the-fold image only
 * delays it. It is `eager` here. This cannot move the fidelity comparison —
 * the capture forces every lazy image eager before it shoots.
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
		'class' => 'welcome-lockup-line cs-hairline',
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
<main id="content" class="site-shell h-[100dvh] overflow-x-hidden overflow-y-auto bg-home-1 text-home-2">
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

		<div class="hero-content relative z-10 flex flex-col items-center px-5 text-center text-home-1 max-[795px]:h-full max-[795px]:w-full max-[795px]:justify-center">
			<h1 class="sr-only">Can Sakhara</h1>
			<img
				src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/hero-wordmark.svg' ); ?>"
				alt=""
				width="655"
				height="50"
				data-hero-hide
				loading="eager"
				class="hero-wordmark mx-auto h-auto w-[300px] sm:w-[520px] md:w-[655px]"
			/>
			<div class="hero-actions mt-12 flex flex-col items-center justify-center gap-4 min-[376px]:flex-row max-[795px]:absolute max-[795px]:inset-x-0 max-[795px]:bottom-[71px] max-[795px]:mt-0 max-[795px]:px-5">
				<a
					href="<?php echo esc_url( cansakhara_page_url( 'by-day' ) ); ?>"
					data-hero-hide
					class="hero-choice cs-label flex h-[54px] w-40 items-center justify-center border border-home-1 bg-day-1 px-5 transition-colors hover:bg-home-1 hover:text-home-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
				>
					By day
				</a>
				<a
					href="<?php echo esc_url( cansakhara_page_url( 'by-night' ) ); ?>"
					data-hero-hide
					class="hero-choice cs-label flex h-[54px] w-40 items-center justify-center border border-home-1 bg-night-1 px-5 transition-colors hover:bg-home-1 hover:text-night-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
				>
					By night
				</a>
			</div>
		</div>
	</section>

	<section id="welcome" class="welcome-section relative bg-home-1">
		<?php cansakhara_section_line( 'welcome-line-top relative z-10 -mt-14 md:-mt-20' ); ?>
		<div class="welcome-inner px-6 pb-24 pt-16 md:px-16 md:pb-40">
			<?php
			cansakhara_section_heading(
				array(
					'class'      => 'welcome-heading',
					'title_role' => 'h1',
					'eyebrow'    => 'Welcome',
					'title'      => $cansakhara_welcome_title,
					'subtitle'   => 'Ibiza beckons. An iconic home, reimagined. A view like no other',
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
				<div class="welcome-copy cs-body w-full min-w-0 max-w-[calc(100vw-3rem)] break-words text-center md:text-left min-[1440px]:max-w-none">
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
					<?php cansakhara_outline_button( 'Enquire', 'mailto:reservations@cansakhara.com', 'mt-10 hover:bg-home-2 hover:text-home-1' ); ?>
				</div>
			</div>

			<div class="features-block mx-auto mt-24 max-w-4xl md:mt-32">
				<h3 class="features-title cs-h3 text-center">
					Featuring
				</h3>
				<div class="features-grid mt-[30px] grid grid-cols-3 gap-x-5 gap-y-5 md:mt-[50px] md:grid-cols-6">
					<?php foreach ( $cansakhara_features as $cansakhara_feature ) : ?>
					<div class="text-center">
						<div class="feature-circle mx-auto flex size-10 flex-col items-center justify-center rounded-full bg-home-4 md:size-[68px]">
							<?php // Stat numbers fit no type role: Figma 5:985 (desktop, 22px regular) / 5:461 (mobile, 13px regular). ?>
							<span class="font-body text-[13px] font-normal leading-none tracking-[0.05em] md:text-[22px]"><?php echo esc_html( $cansakhara_feature['value'] ); ?></span>
							<?php // The unit fits no role either: Figma 5:986 (desktop, 11px light) / 5:462 (mobile, 6.5px light). ?>
							<?php if ( ! empty( $cansakhara_feature['unit'] ) ) : ?>
							<span class="mt-0.5 font-body text-[6.5px] font-light leading-none tracking-[0.05em] md:mt-1 md:text-[11px] md:tracking-[1.1px]"><?php echo esc_html( $cansakhara_feature['unit'] ); ?></span>
							<?php endif; ?>
						</div>
						<p class="cs-small mt-[14px] uppercase md:mt-[18px]"><?php echo esc_html( $cansakhara_feature['label'] ); ?></p>
					</div>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
		<?php cansakhara_section_line( 'welcome-line-bottom relative z-10 -mb-14 md:-mb-20' ); ?>
	</section>

	<?php cansakhara_part( 'experience-carousel' ); ?>

	<section id="discover" class="discover-section relative bg-home-1">
		<?php cansakhara_section_line( 'discover-line-top relative z-10 -mt-14 md:-mt-20' ); ?>
		<div class="discover-inner px-6 pb-[49px] pt-10 md:px-16 md:pb-0 md:pt-24">
			<h2 class="discover-title cs-h3 text-center">
				Discover
			</h2>
			<div class="discover-grid mx-auto mt-[38px] grid max-w-[1170px] justify-items-center gap-8 md:mt-20 md:justify-items-stretch min-[1440px]:grid-cols-[550px_550px] min-[1440px]:gap-[70px]">
				<?php // Card titles fit no type role, so they carry the Figma values: 44px light, tracking 22px, leading 1.4 on desktop (5:1029); 16px, tracking 8px on mobile (5:492). ?>
				<article class="discover-card flex aspect-square flex-col items-center justify-center bg-day-1 px-6 text-center text-home-1">
					<?php cansakhara_sun_icon( 'size-20 md:size-[180px]' ); ?>
					<h3 class="discover-card-title mt-10 font-display text-base font-light uppercase leading-[1.4] tracking-[8px] md:mt-[50px] md:text-[44px] md:tracking-[22px]">
						By day
					</h3>
					<?php cansakhara_outline_button( 'Explore', cansakhara_page_url( 'by-day' ), 'mt-10 border-home-1 bg-day-2 hover:bg-home-1 hover:text-day-1 md:mt-[50px]' ); ?>
				</article>
				<article class="discover-card flex aspect-square flex-col items-center justify-center bg-night-1 px-6 text-center text-home-1">
					<?php cansakhara_moon_icon( 'size-20 md:size-[180px]' ); ?>
					<h3 class="discover-card-title mt-10 font-display text-base font-light uppercase leading-[1.4] tracking-[8px] md:mt-[50px] md:text-[44px] md:tracking-[22px]">
						By night
					</h3>
					<?php cansakhara_outline_button( 'Explore', cansakhara_page_url( 'by-night' ), 'mt-10 border-home-1 bg-night-3 hover:bg-home-1 hover:text-night-1 md:mt-[50px]' ); ?>
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

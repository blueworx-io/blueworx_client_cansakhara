<?php
/**
 * Welcome page — the red splash from Figma frame LOGIN 01 (1:30).
 *
 * No header, footer or side nav: the page is the mark, the wordmark, IBIZA
 * and two buttons that open the Login and Enquire popups. The popups part
 * is included directly because there is no header here to bring it in.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

cansakhara_document_open( array( 'theme' => 'welcome' ) );
?>
<main
	id="content"
	class="site-shell relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#5b0a00] bg-cover bg-center text-white"
	style="background-image: url('<?php echo esc_url( CANSAKHARA_URL . 'assets/img/welcome-bg.jpg' ); ?>')"
>
	<?php
	// The looping background. The still above stays as the poster (and as the
	// CSS background) so nothing flashes while the file loads, and a browser
	// that refuses autoplay simply shows the still.
	?>
	<video
		aria-hidden="true"
		autoplay
		loop
		muted
		playsinline
		poster="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/welcome-bg.jpg' ); ?>"
		class="pointer-events-none absolute inset-0 h-full w-full object-cover"
	>
		<source src="<?php echo esc_url( CANSAKHARA_URL . 'assets/video/welcome-loop.webm' ); ?>" type="video/webm" />
	</video>
	<h1 class="sr-only">Can Sakhara</h1>
	<div class="relative flex -translate-y-[40px] flex-col items-center gap-[24px] md:-translate-y-[60px] md:gap-[38px]">
		<img
			src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/logo-white.svg' ); ?>"
			alt=""
			width="55"
			height="55"
			class="size-[40px] md:size-[55px]"
		/>
		<img
			src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/hero-wordmark.svg' ); ?>"
			alt="Can Sakhara"
			width="379"
			height="29"
			class="h-auto w-[240px] md:w-[379px]"
		/>
		<p class="font-display text-[14px] uppercase leading-none tracking-[16px] indent-[16px] text-[#bf2c08] md:text-[22px] md:tracking-[33px] md:indent-[33px]">
			Ibiza
		</p>
	</div>

	<div class="absolute inset-x-0 bottom-[60px] flex items-center justify-center gap-[64px] md:bottom-[95px] md:gap-[200px]">
		<button
			type="button"
			data-cansakhara-popup-open="login"
			aria-haspopup="dialog"
			aria-expanded="false"
			aria-controls="cansakhara-popup-login"
			class="font-display text-[14px] font-light uppercase leading-none tracking-[6px] indent-[6px] text-white transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:text-[18px] md:tracking-[8.1px] md:indent-[8.1px]"
		>
			Login
		</button>
		<button
			type="button"
			data-cansakhara-popup-open="enquire"
			aria-haspopup="dialog"
			aria-expanded="false"
			aria-controls="cansakhara-popup-enquire"
			class="font-display text-[14px] font-thin uppercase leading-none tracking-[6px] indent-[6px] text-white transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:text-[18px] md:tracking-[8.1px] md:indent-[8.1px]"
		>
			Enquire
		</button>
	</div>
</main>
<?php
cansakhara_part( 'popups' );
cansakhara_document_close();

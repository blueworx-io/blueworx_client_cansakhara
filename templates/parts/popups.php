<?php
/**
 * The Login and Enquire popups — Figma frames LOGIN 02 (1:67) and LOGIN 03
 * (1:109).
 *
 * Rendered on every owned page by the header part, and directly by the
 * Welcome template (which has no header). Both start closed; popups.js opens
 * them from any [data-cansakhara-popup-open] trigger.
 *
 * The one exception: after the no-JS login fallback redirects back with
 * ?cansakhara_login=failed, the login panel is rendered already open, with
 * its message, so the failure is visible even with no script running at
 * all. It also carries data-cansakhara-popup-auto so popups.js, when it does
 * run, adopts it as the open popup (scroll lock, Escape, focus trap).
 *
 * Closed state: opacity-0 + invisible + pointer-events-none. `invisible`
 * (visibility: hidden) keeps every control inside untabbable without
 * touching each one's tabindex, and still lets the opacity transition run.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$cansakhara_login_error = cansakhara_login_error();
$cansakhara_login_open  = '' !== $cansakhara_login_error;
$cansakhara_logged_in   = is_user_logged_in();

// The opacity/visibility transition timing itself lives on the plain
// `.cansakhara-popup` rule in app.css, not as Tailwind utilities here — the
// two properties need different timing (visibility must flip to `visible`
// synchronously on open, so popups.js can focus and Tab-trap into the panel
// immediately, but only flip to `hidden` after the fade-out finishes on
// close), which a single `transition-*` utility can't express.
$cansakhara_panel_base  = 'cansakhara-popup fixed inset-0 z-[60] overflow-y-auto bg-[#5b0a00] text-white';
$cansakhara_panel_class = $cansakhara_panel_base . ' opacity-0 invisible pointer-events-none';
$cansakhara_login_class = $cansakhara_login_open ? $cansakhara_panel_base . ' opacity-100 visible' : $cansakhara_panel_class;
$cansakhara_close_class = 'absolute right-[20px] top-[19px] grid size-[33px] place-items-center border border-white transition-colors duration-200 hover:bg-white hover:text-[#5b0a00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:right-[50px] md:top-[46px] md:size-[52px]';
$cansakhara_inner_class = 'flex min-h-full w-full flex-col items-center px-5 pb-[40px] pt-[90px] md:pb-[79px] md:pt-[118px]';
$cansakhara_title_class = 'font-display text-[24px] font-thin uppercase leading-none tracking-[9.6px] indent-[9.6px] outline-none md:text-[32px] md:tracking-[12.8px] md:indent-[12.8px]';
$cansakhara_intro_class = 'mt-[30px] w-full max-w-[443px] text-center font-serif text-[13px] font-light italic leading-[1.4] tracking-[1.3px] md:mt-[43px] md:text-[14px] md:tracking-[1.4px]';
$cansakhara_field_class = 'cansakhara-popup-field w-full bg-[#490500] px-8 py-4 text-center font-body text-[16px] font-light leading-[1.4] tracking-[0.8px] text-white placeholder:text-white focus:outline focus:outline-2 focus:outline-white/60';
$cansakhara_mark_class  = 'h-[50px] w-[150px]';
?>
<div
	data-cansakhara-popup="login"
	id="cansakhara-popup-login"
	role="dialog"
	aria-modal="true"
	aria-labelledby="cansakhara-popup-login-title"
	aria-hidden="<?php echo $cansakhara_login_open ? 'false' : 'true'; ?>"
	<?php echo $cansakhara_login_open ? 'data-cansakhara-popup-auto' : ''; ?>
	class="<?php echo esc_attr( $cansakhara_login_class ); ?>"
>
	<button type="button" data-cansakhara-popup-close aria-label="Close" class="<?php echo esc_attr( $cansakhara_close_class ); ?>">
		<svg aria-hidden="true" viewBox="0 0 17 17" class="size-[17px] stroke-current" fill="none" stroke-width="1.3">
			<path d="M1 1 16 16M16 1 1 16" />
		</svg>
	</button>

	<div class="<?php echo esc_attr( $cansakhara_inner_class ); ?>">
		<h2 id="cansakhara-popup-login-title" tabindex="-1" class="<?php echo esc_attr( $cansakhara_title_class ); ?>">Login</h2>

		<?php if ( $cansakhara_logged_in ) : ?>
		<p class="<?php echo esc_attr( $cansakhara_intro_class ); ?>">You’re signed in.</p>
		<a href="<?php echo esc_url( cansakhara_login_redirect_url() ); ?>" class="cansakhara-popup-submit mt-[40px] w-full max-w-[443px] md:mt-[60px]">Continue</a>
		<?php else : ?>
		<p class="<?php echo esc_attr( $cansakhara_intro_class ); ?>">Please enter your email address, and the private access password that was emailed to you.</p>

		<form
			method="post"
			action=""
			data-cansakhara-login-form
			class="mt-[40px] flex w-full max-w-[443px] flex-col gap-[20px] md:mt-[60px]"
		>
			<input type="hidden" name="cansakhara_action" value="login" />
			<label for="cansakhara-login-email" class="sr-only">Email</label>
			<input
				id="cansakhara-login-email"
				type="email"
				name="email"
				placeholder="Email"
				autocomplete="email"
				required
				class="<?php echo esc_attr( $cansakhara_field_class ); ?>"
			/>
			<label for="cansakhara-login-password" class="sr-only">Password</label>
			<input
				id="cansakhara-login-password"
				type="password"
				name="password"
				placeholder="Password"
				autocomplete="current-password"
				required
				class="<?php echo esc_attr( $cansakhara_field_class ); ?>"
			/>

			<p
				data-cansakhara-login-error
				role="alert"
				<?php echo '' === $cansakhara_login_error ? 'hidden' : ''; ?>
				class="text-center font-body text-[12px] tracking-[0.6px] text-white"
			><?php echo esc_html( $cansakhara_login_error ); ?></p>

			<button
				type="button"
				data-cansakhara-popup-open="enquire"
				class="mx-auto mt-[20px] font-display text-[12px] uppercase tracking-[1.2px] indent-[1.2px] underline underline-offset-4 transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
			>
				Request private access password
			</button>

			<button type="submit" class="cansakhara-popup-submit mt-[25px]">Submit</button>
		</form>
		<?php endif; ?>

		<div class="mt-auto pt-[40px] md:pt-[60px]">
			<img src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/mel-de-magranetes.svg' ); ?>" alt="Mel de Magranetes" width="150" height="50" class="<?php echo esc_attr( $cansakhara_mark_class ); ?>" />
		</div>
	</div>
</div>

<div
	data-cansakhara-popup="enquire"
	id="cansakhara-popup-enquire"
	role="dialog"
	aria-modal="true"
	aria-labelledby="cansakhara-popup-enquire-title"
	aria-hidden="true"
	class="<?php echo esc_attr( $cansakhara_panel_class ); ?>"
>
	<button type="button" data-cansakhara-popup-close aria-label="Close" class="<?php echo esc_attr( $cansakhara_close_class ); ?>">
		<svg aria-hidden="true" viewBox="0 0 17 17" class="size-[17px] stroke-current" fill="none" stroke-width="1.3">
			<path d="M1 1 16 16M16 1 1 16" />
		</svg>
	</button>

	<div class="<?php echo esc_attr( $cansakhara_inner_class ); ?>">
		<h2 id="cansakhara-popup-enquire-title" tabindex="-1" class="<?php echo esc_attr( $cansakhara_title_class ); ?>">Enquire</h2>
		<p class="<?php echo esc_attr( $cansakhara_intro_class ); ?>">Let us know a few details and our team will personally assist you with availability, pricing, tailored recommendations and Private Web Access Password</p>

		<div class="mt-[40px] flex w-full max-w-[443px] flex-col gap-[20px] md:mt-[60px]">
			<?php cansakhara_enquiry_form(); ?>
		</div>

		<div class="mt-auto pt-[40px] md:pt-[60px]">
			<img src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/mel-de-magranetes.svg' ); ?>" alt="Mel de Magranetes" width="150" height="50" class="<?php echo esc_attr( $cansakhara_mark_class ); ?>" />
		</div>
	</div>
</div>

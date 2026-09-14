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
$cansakhara_panel_base  = 'cansakhara-popup fixed inset-0 z-[60] overflow-y-auto bg-home-5 text-home-1';
$cansakhara_panel_class = $cansakhara_panel_base . ' opacity-0 invisible pointer-events-none';
$cansakhara_login_class = $cansakhara_login_open ? $cansakhara_panel_base . ' opacity-100 visible' : $cansakhara_panel_class;
$cansakhara_close_class = 'absolute right-[20px] top-[19px] grid size-[33px] place-items-center border border-home-1 transition-colors duration-200 hover:bg-home-1 hover:text-home-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:right-[50px] md:top-[46px] md:size-[52px]';
// Vertically centred as one block (symmetric padding, so the centre is the
// true centre), with the padding clearing the close button. The mark keeps
// a fixed distance below the form rather than pinning to the bottom, so a
// tall viewport never splits the content top and bottom.
$cansakhara_inner_class = 'flex min-h-full w-full flex-col items-center justify-center px-5 py-[80px] md:py-[110px]';
// Figma 5:1217 / 5:1259: the titles are 32px thin with 12.8px tracking, which fits
// no role; there is no mobile frame, so mobile keeps the port's 24px / 9.6px.
$cansakhara_title_class = 'font-display text-[24px] font-thin uppercase leading-none tracking-[9.6px] indent-[9.6px] text-home-1 outline-none md:text-[32px] md:tracking-[12.8px] md:indent-[12.8px]';
// Figma 1:67 / 1:109 (LOGIN 02 / 03): the intro is serif italic light at 13px /
// 14px with 1.3px / 1.4px tracking, half the H4 role, so it keeps fixed values.
$cansakhara_intro_class = 'mt-[30px] w-full max-w-[443px] text-center font-serif italic font-light text-[13px] leading-[1.4] tracking-[1.3px] md:mt-[43px] md:text-[14px] md:tracking-[1.4px]';
// Field fill and size floor live on .cansakhara-popup-field in app.css.
$cansakhara_field_class = 'cansakhara-popup-field cs-body w-full px-8 py-4 text-center text-home-1 placeholder:text-home-1 focus:outline focus:outline-2 focus:outline-home-1/60';
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
				class="cs-small text-center text-home-1"
			><?php echo esc_html( $cansakhara_login_error ); ?></p>

			<button
				type="button"
				data-cansakhara-popup-open="enquire"
				class="cs-label mx-auto mt-[20px] underline underline-offset-4 transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
			>
				Request private access password
			</button>

			<button type="submit" class="cansakhara-popup-submit mt-[25px]">Submit</button>
		</form>
		<?php endif; ?>

		<a href="https://mdmsl.com/" target="_blank" rel="noopener noreferrer" class="mt-[40px] block md:mt-[60px]">
			<img src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/mel-de-magranetes.svg' ); ?>" alt="Mel de Magranetes" width="150" height="50" class="<?php echo esc_attr( $cansakhara_mark_class ); ?>" />
		</a>
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
		<p class="<?php echo esc_attr( $cansakhara_intro_class ); ?>">Our team will assist you with availability and pricing for rentals, weddings, brand events and film/photoshoots</p>

		<div class="mt-[40px] flex w-full max-w-[443px] flex-col gap-[20px] md:mt-[60px]">
			<?php cansakhara_enquiry_form(); ?>
		</div>

		<a href="https://mdmsl.com/" target="_blank" rel="noopener noreferrer" class="mt-[40px] block md:mt-[60px]">
			<img src="<?php echo esc_url( CANSAKHARA_URL . 'assets/img/mel-de-magranetes.svg' ); ?>" alt="Mel de Magranetes" width="150" height="50" class="<?php echo esc_attr( $cansakhara_mark_class ); ?>" />
		</a>
	</div>
</div>

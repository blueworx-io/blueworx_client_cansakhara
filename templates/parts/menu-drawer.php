<?php
/**
 * Slide-in menu drawer — ported from src/components/MenuDrawer.tsx.
 *
 * The source component is driven by an `open` boolean owned by the trigger.
 * There is no client state at render time, so this renders the closed state
 * only — the same classes the JSX produced for `open={false}` — and Task 13's
 * behaviour script toggles them open. `aria-hidden="true"` and `tabindex="-1"`
 * on the closed focusable elements match the source's `!open` values.
 *
 * @package CanSakhara
 *
 * @var array $args {
 *     @type array $panel Page-theme panel from header.php: 'bg' (background utility)
 *                        and 'hover' (close-button hover text utility).
 * }
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$cansakhara_panel_bg    = isset( $args['panel']['bg'] ) ? (string) $args['panel']['bg'] : 'bg-home-3';
$cansakhara_panel_hover = isset( $args['panel']['hover'] ) ? (string) $args['panel']['hover'] : 'hover:text-home-3';

// Drawer links — exact Figma order/labels. WordPress permalinks use trailing
// slashes; the Next.js source did not.
$cansakhara_menu_links = array(
	array(
		'label' => 'Experience',
		'href'  => cansakhara_page_url( 'home' ),
	),
	array(
		'label' => 'By Day',
		'href'  => cansakhara_page_url( 'by-day' ),
	),
	array(
		'label' => 'By Night',
		'href'  => cansakhara_page_url( 'by-night' ),
	),
);
?>
<div
	aria-hidden="true"
	data-cansakhara-scrim
	class="fixed inset-0 z-40 bg-black/35 transition-opacity duration-500 ease-out pointer-events-none opacity-0"
></div>

<aside
	id="site-menu"
	role="dialog"
	aria-modal="true"
	aria-label="Menu"
	aria-hidden="true"
	class="<?php echo esc_attr( $cansakhara_panel_bg ); ?> fixed inset-y-0 left-0 z-50 w-full text-home-1 transition-[translate] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:w-[450px] -translate-x-full"
>
	<button
		type="button"
		data-cansakhara-menu-close
		aria-label="Close menu"
		tabindex="-1"
		style="transition-delay: 0ms"
		class="<?php echo esc_attr( $cansakhara_panel_hover ); ?> absolute right-[20px] top-[19px] grid size-[33px] place-items-center border border-home-1 transition-[opacity,translate,background-color,color] duration-500 ease-out hover:bg-home-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:right-[50px] md:top-[46px] md:size-[52px] -translate-y-1 opacity-0"
	>
		<svg aria-hidden="true" viewBox="0 0 17 17" class="size-[17px] stroke-current" fill="none" stroke-width="1.3">
			<path d="M1 1 16 16M16 1 1 16" />
		</svg>
	</button>

	<div class="flex h-full flex-col items-center pt-[64px] pb-[64px] md:items-start md:pl-[50px] md:pt-[131px] md:pb-[131px]">
		<span aria-hidden="true" class="h-px w-[362px] bg-home-1 md:w-[350px]"></span>

		<?php // Figma 5:1090 / 5:1376 / 5:1533: menu links are 16px light with 3.2px tracking and fit no role, so they keep fixed type; only their colours are swatches. ?>
		<ul class="mt-[51px] flex w-[200px] flex-col items-end gap-[34.6px] text-right md:mt-[70px] md:w-auto md:items-start md:gap-[37.6px] md:text-left">
			<?php foreach ( $cansakhara_menu_links as $cansakhara_link ) : ?>
			<li>
				<a
					href="<?php echo esc_url( $cansakhara_link['href'] ); ?>"
					tabindex="-1"
					style="transition-delay: 0ms"
					class="block font-display text-[16px] font-light uppercase leading-[1.4] tracking-[3.2px] text-home-1 transition-[opacity,translate,color] duration-500 ease-out hover:text-home-1/70 md:text-[21px] md:tracking-[4.2px] translate-y-3 opacity-0"
				>
					<?php echo esc_html( $cansakhara_link['label'] ); ?>
				</a>
			</li>
			<?php endforeach; ?>
			<li>
				<?php // Everyone who can see this menu is signed in: the pages behind it are private. ?>
				<a
					href="<?php echo esc_url( wp_logout_url( cansakhara_page_url( 'welcome' ) ) ); ?>"
					tabindex="-1"
					style="transition-delay: 0ms"
					class="block font-display text-[16px] font-light uppercase leading-[1.4] tracking-[3.2px] text-home-1 transition-[opacity,translate,color] duration-500 ease-out hover:text-home-1/70 md:text-[21px] md:tracking-[4.2px] translate-y-3 opacity-0"
				>
					Log out
				</a>
			</li>
		</ul>

		<span aria-hidden="true" class="mt-auto h-px w-[362px] bg-home-1 md:w-[350px]"></span>
	</div>
</aside>

<?php
/**
 * Side progress nav shell — ported from src/components/SideProgressNav.tsx.
 *
 * The source component discovers the page's `<section>` elements at runtime
 * and renders one dot per section, ringing whichever is in view — there is
 * no fixed dot markup to port server-side. This renders only the empty
 * container: the same classes the JSX gave it (including the
 * `mix-blend-difference` styling, the `hidden md:block` desktop-only
 * visibility below the site's 796px breakpoint, and the initial
 * `pointer-events-none opacity-0` hidden state, matching the source's
 * `visible = false` on first render). Task 14's behaviour script discovers
 * the sections, fills this container with dots carrying `data-cansakhara-dot`,
 * and marks the active one `data-active="true"`.
 *
 * Mounted once per page, after the page's `<main>` closes — the source
 * mounts it in the root layout as a sibling of the routed page content, not
 * inside `SCROLLER` (`.site-shell`) itself.
 *
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<nav
	aria-label="Page progress"
	data-cansakhara-side-nav
	class="fixed left-7 top-1/2 z-30 hidden -translate-y-1/2 mix-blend-difference transition-opacity duration-700 ease-out md:block lg:left-10 pointer-events-none opacity-0"
></nav>

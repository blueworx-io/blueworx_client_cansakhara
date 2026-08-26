// Header + menu drawer behaviour. Ports the two `SiteHeader` effects and the
// one `MenuDrawer` effect from src/components/SiteHeader.tsx and
// src/components/MenuDrawer.tsx, with React state replaced by class toggles
// and attribute writes on the same elements the PHP templates already render.
//
// The page scrolls inside `.site-shell` (the <main>), not `window` — every
// listener here binds to that element, exactly as the source's `useEffect`
// did via `document.querySelector<HTMLElement>(".site-shell")`.
import { gsap } from './gsap.js';
import { drawSelf } from './animations.js';

// Same transparent classes the header PHP template renders for the `home`
// theme's unscrolled state (SiteHeader.tsx: `solid ? "" : "bg-white/5
// backdrop-blur-[3px]"`).
const TRANSPARENT_CLASSES = [ 'bg-white/5', 'backdrop-blur-[3px]' ];

export function initHeader() {
	const nav = document.querySelector( '[data-cansakhara-header]' );
	const trigger = document.querySelector( '[data-cansakhara-menu-open]' );
	const drawer = document.getElementById( 'site-menu' );

	if ( ! nav || ! trigger || ! drawer ) return;

	const closeButton = drawer.querySelector( '[data-cansakhara-menu-close]' );
	const scrim = document.querySelector( '[data-cansakhara-scrim]' );
	const drawerLinks = drawer.querySelectorAll( 'a[href]' );
	const logoPath = nav.querySelector( '[data-cansakhara-logo-path]' );
	const solidColor = nav.getAttribute( 'data-cansakhara-solid-color' ) || '';
	// theme !== "home": the header PHP template only sets an inline
	// background-color for themes other than "home" (see header.php's
	// `$cansakhara_solid` = theme !== 'home'), so its presence on load is the
	// signal this script reads in place of the React `theme` prop.
	const themeIsHome = ! nav.style.backgroundColor;

	let open = false;
	let overflowRestore = null;
	let escapeListener = null;
	let lastHidden = false;

	// ---- drawer open/close ------------------------------------------------

	function setDrawerOpen( next ) {
		open = next;

		drawer.classList.toggle( 'translate-x-0', open );
		drawer.classList.toggle( '-translate-x-full', ! open );
		drawer.setAttribute( 'aria-hidden', open ? 'false' : 'true' );
		trigger.setAttribute( 'aria-expanded', open ? 'true' : 'false' );

		if ( scrim ) {
			scrim.classList.toggle( 'opacity-100', open );
			scrim.classList.toggle( 'opacity-0', ! open );
			scrim.classList.toggle( 'pointer-events-none', ! open );
		}

		if ( closeButton ) {
			closeButton.tabIndex = open ? 0 : -1;
			closeButton.classList.toggle( 'translate-y-0', open );
			closeButton.classList.toggle( 'opacity-100', open );
			closeButton.classList.toggle( '-translate-y-1', ! open );
			closeButton.classList.toggle( 'opacity-0', ! open );
			closeButton.style.transitionDelay = open ? '120ms' : '0ms';
		}

		drawerLinks.forEach( ( link, i ) => {
			link.tabIndex = open ? 0 : -1;
			link.classList.toggle( 'translate-y-0', open );
			link.classList.toggle( 'opacity-100', open );
			link.classList.toggle( 'translate-y-3', ! open );
			link.classList.toggle( 'opacity-0', ! open );
			link.style.transitionDelay = open ? `${ 220 + i * 70 }ms` : '0ms';
		} );

		// The `-translate-y-full`/`translate-y-0` header state also depends on
		// `open` (SiteHeader.tsx: `hidden && !open`) — re-apply it here so
		// opening the drawer while the header happens to be hidden reveals it.
		applyHiddenClass( open ? false : lastHidden );

		if ( open ) {
			const scroller = document.querySelector( '.site-shell' ) || document.body;
			overflowRestore = scroller.style.overflow;
			scroller.style.overflow = 'hidden';

			escapeListener = ( event ) => {
				if ( event.key === 'Escape' ) closeDrawer();
			};
			document.addEventListener( 'keydown', escapeListener );

			closeButton?.focus();
		} else {
			const scroller = document.querySelector( '.site-shell' ) || document.body;
			scroller.style.overflow = overflowRestore ?? '';
			overflowRestore = null;

			if ( escapeListener ) {
				document.removeEventListener( 'keydown', escapeListener );
				escapeListener = null;
			}

			trigger.focus();
		}
	}

	function closeDrawer() {
		if ( open ) setDrawerOpen( false );
	}

	trigger.addEventListener( 'click', () => setDrawerOpen( true ) );
	closeButton?.addEventListener( 'click', closeDrawer );
	scrim?.addEventListener( 'click', closeDrawer );

	// ---- logo self-draw -----------------------------------------------

	let drawTl = null;

	if ( logoPath ) {
		const mm = gsap.matchMedia();
		mm.add( '(prefers-reduced-motion: no-preference)', () => {
			drawTl = drawSelf( logoPath );
			return () => {
				drawTl = null;
			};
		} );
	}

	// ---- scrolled / hidden -------------------------------------------

	const scroller = document.querySelector( '.site-shell' );
	if ( ! scroller ) return;

	function applySolidClass( solid ) {
		if ( solid ) {
			nav.style.backgroundColor = solidColor;
			nav.classList.remove( ...TRANSPARENT_CLASSES );
		} else {
			nav.style.backgroundColor = '';
			nav.classList.add( ...TRANSPARENT_CLASSES );
		}
	}

	function applyHiddenClass( hide ) {
		const effective = hide && ! open;
		nav.classList.toggle( '-translate-y-full', effective );
		nav.classList.toggle( 'translate-y-0', ! effective );
	}

	let lastY = scroller.scrollTop;
	let wasHidden = false;

	function onScroll() {
		const y = scroller.scrollTop;

		const scrolled = y > 100;
		applySolidClass( scrolled || ! themeIsHome );

		if ( Math.abs( y - lastY ) > 4 ) {
			const nowHidden = y > lastY && y > 100;
			if ( wasHidden && ! nowHidden ) drawTl?.restart( true );
			wasHidden = nowHidden;
			lastHidden = nowHidden;
			applyHiddenClass( nowHidden );
			lastY = y;
		}
	}

	scroller.addEventListener( 'scroll', onScroll, { passive: true } );
}

// Login / Enquire popups. Both panels are rendered closed by
// templates/parts/popups.php; this opens one from any
// [data-cansakhara-popup-open] trigger, traps Tab inside it, closes it on
// Escape or a [data-cansakhara-popup-close] click, and puts focus back where
// it came from. Only one popup is ever open: opening the other swaps them.
//
// Deliberately no GSAP — the popups have to work when the motion layer does
// not, so the transition is CSS only.

const OPEN_CLASSES = [ 'opacity-100', 'visible' ];
const CLOSED_CLASSES = [ 'opacity-0', 'invisible', 'pointer-events-none' ];
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initPopups() {
	const panels = Array.from( document.querySelectorAll( '[data-cansakhara-popup]' ) );
	if ( ! panels.length ) return null;

	let current = null;
	let opener = null;
	let overflowRestore = null;

	function scroller() {
		return document.querySelector( '.site-shell' ) || document.body;
	}

	function panelFor( name ) {
		return panels.find( ( p ) => p.getAttribute( 'data-cansakhara-popup' ) === name ) || null;
	}

	function setExpanded( trigger, value ) {
		if ( trigger && trigger.hasAttribute( 'aria-expanded' ) ) {
			trigger.setAttribute( 'aria-expanded', value ? 'true' : 'false' );
		}
	}

	function closeDrawerIfOpen() {
		const drawer = document.getElementById( 'site-menu' );
		if ( drawer && drawer.getAttribute( 'aria-hidden' ) === 'false' ) {
			drawer.querySelector( '[data-cansakhara-menu-close]' )?.click();
		}
	}

	function open( name, trigger ) {
		const panel = panelFor( name );
		if ( ! panel ) return;

		// Swapping: keep the original opener so focus returns to the page,
		// not to a button inside the popup that is about to close.
		if ( current && current !== panel ) {
			hide( current );
		} else if ( ! current ) {
			closeDrawerIfOpen();
			// A trigger inside the drawer (e.g. its Login entry) is now
			// tabindex="-1" and hidden off-screen — return focus to the
			// hamburger that reopens the drawer instead of parking it there.
			opener = trigger && trigger.closest( '#site-menu' )
				? document.querySelector( '[data-cansakhara-menu-open]' )
				: ( trigger || null );
			const el = scroller();
			overflowRestore = el.style.overflow;
			el.style.overflow = 'hidden';
			document.addEventListener( 'keydown', onKeydown );
		}

		current = panel;
		panel.classList.remove( ...CLOSED_CLASSES );
		panel.classList.add( ...OPEN_CLASSES );
		panel.setAttribute( 'aria-hidden', 'false' );
		setExpanded( opener, true );

		const heading = panel.querySelector( 'h2[tabindex="-1"]' );
		heading?.focus( { preventScroll: true } );
	}

	function hide( panel ) {
		panel.classList.remove( ...OPEN_CLASSES );
		panel.classList.add( ...CLOSED_CLASSES );
		panel.setAttribute( 'aria-hidden', 'true' );
	}

	function close() {
		if ( ! current ) return;
		hide( current );
		current = null;

		const el = scroller();
		el.style.overflow = overflowRestore ?? '';
		overflowRestore = null;
		document.removeEventListener( 'keydown', onKeydown );

		setExpanded( opener, false );
		opener?.focus();
		opener = null;
	}

	function onKeydown( event ) {
		if ( ! current ) return;

		if ( event.key === 'Escape' ) {
			event.preventDefault();
			close();
			return;
		}

		if ( event.key !== 'Tab' ) return;

		const items = Array.from( current.querySelectorAll( FOCUSABLE ) )
			.filter( ( el ) => el.offsetParent !== null );
		if ( ! items.length ) {
			event.preventDefault();
			return;
		}
		const first = items[ 0 ];
		const last = items[ items.length - 1 ];
		const active = document.activeElement;

		if ( event.shiftKey && ( active === first || ! current.contains( active ) ) ) {
			event.preventDefault();
			last.focus();
		} else if ( ! event.shiftKey && ( active === last || ! current.contains( active ) ) ) {
			event.preventDefault();
			first.focus();
		}
	}

	document.addEventListener( 'click', ( event ) => {
		const trigger = event.target.closest( '[data-cansakhara-popup-open]' );
		if ( trigger ) {
			event.preventDefault();
			open( trigger.getAttribute( 'data-cansakhara-popup-open' ), trigger );
			return;
		}
		if ( event.target.closest( '[data-cansakhara-popup-close]' ) ) {
			close();
		}
	} );

	// The no-JS login fallback redirects back with the popup marked to reopen.
	const auto = panels.find( ( p ) => p.hasAttribute( 'data-cansakhara-popup-auto' ) );
	if ( auto ) {
		open( auto.getAttribute( 'data-cansakhara-popup' ), null );
	}

	return { open, close };
}

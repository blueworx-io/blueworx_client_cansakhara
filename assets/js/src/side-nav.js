// Side progress nav behaviour. Ports the `SideProgressNav` effect from
// src/components/SideProgressNav.tsx, with React state (`count`/`active`/
// `visible`) replaced by DOM writes into the container the PHP template
// already rendered (`templates/parts/side-nav.php`).
//
// The page scrolls inside `.site-shell` (the <main>), not `window` — the
// scroll listener binds to that element, exactly as the source's `useEffect`
// did via `document.querySelector<HTMLElement>(".site-shell")`.
//
// There is no client-side route change here (each page is its own load), so
// the source's `pathname` effect dependency — which re-ran the scan on
// navigation — has no equivalent; the scan runs once on load and again on
// `resize`, since section heights change.

const SCROLLER = '.site-shell';

// Top of a section within the scroller's scroll space. getBoundingClientRect
// keeps this correct regardless of each section's offsetParent — copied
// exactly from the source's `topOf`.
function topOf( scroller, el ) {
	return (
		el.getBoundingClientRect().top -
		scroller.getBoundingClientRect().top +
		scroller.scrollTop
	);
}

export function initSideNav() {
	const nav = document.querySelector( '[data-cansakhara-side-nav]' );
	const scroller = document.querySelector( SCROLLER );

	if ( ! nav || ! scroller ) return;

	let sections = [];

	function goTo( i ) {
		const el = sections[ i ];
		if ( ! el ) return;
		scroller.scrollTo( { top: topOf( scroller, el ), behavior: 'smooth' } );
	}

	function update() {
		const y = scroller.scrollTop;
		const visible = y > scroller.clientHeight * 0.6;
		nav.classList.toggle( 'opacity-100', visible );
		nav.classList.toggle( 'pointer-events-none', ! visible );
		nav.classList.toggle( 'opacity-0', ! visible );

		// Active = the last section whose top has crossed a line 40% down the view.
		const line = y + scroller.clientHeight * 0.4;
		let current = 0;
		sections.forEach( ( el, i ) => {
			if ( topOf( scroller, el ) <= line ) current = i;
		} );

		const dots = nav.querySelectorAll( '[data-cansakhara-dot]' );
		dots.forEach( ( dot, i ) => {
			const isActive = i === current;
			dot.setAttribute( 'data-active', isActive ? 'true' : 'false' );
			if ( isActive ) {
				dot.setAttribute( 'aria-current', 'true' );
			} else {
				dot.removeAttribute( 'aria-current' );
			}

			const ring = dot.querySelector( '[data-cansakhara-dot-ring]' );
			if ( ring ) {
				ring.classList.toggle( 'scale-100', isActive );
				ring.classList.toggle( 'opacity-100', isActive );
				ring.classList.toggle( 'scale-50', ! isActive );
				ring.classList.toggle( 'opacity-0', ! isActive );
			}

			const mark = dot.querySelector( '[data-cansakhara-dot-mark]' );
			if ( mark ) {
				mark.classList.toggle( 'opacity-100', isActive );
				mark.classList.toggle( 'opacity-45', ! isActive );
				mark.classList.toggle( 'group-hover:opacity-90', ! isActive );
			}
		} );
	}

	function scan() {
		sections = Array.from( scroller.querySelectorAll( ':scope > section' ) );

		nav.innerHTML = '';

		if ( sections.length === 0 ) return;

		const list = document.createElement( 'ul' );
		list.className = 'flex flex-col items-center gap-[18px] text-white';

		sections.forEach( ( section, i ) => {
			const item = document.createElement( 'li' );

			const button = document.createElement( 'button' );
			button.type = 'button';
			button.setAttribute( 'data-cansakhara-dot', '' );
			button.setAttribute( 'aria-label', `Go to section ${ i + 1 }` );
			button.className = 'group relative grid size-6 place-items-center';
			button.addEventListener( 'click', () => goTo( i ) );

			const ring = document.createElement( 'span' );
			ring.setAttribute( 'aria-hidden', 'true' );
			ring.setAttribute( 'data-cansakhara-dot-ring', '' );
			ring.className = 'pointer-events-none absolute left-1/2 top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white transition-all duration-300 ease-out scale-50 opacity-0';

			const mark = document.createElement( 'span' );
			mark.setAttribute( 'aria-hidden', 'true' );
			mark.setAttribute( 'data-cansakhara-dot-mark', '' );
			mark.className = 'size-[5px] rounded-full bg-white transition-opacity duration-300 ease-out opacity-45 group-hover:opacity-90';

			button.appendChild( ring );
			button.appendChild( mark );
			item.appendChild( button );
			list.appendChild( item );
		} );

		nav.appendChild( list );

		update();
	}

	scan();
	scroller.addEventListener( 'scroll', update, { passive: true } );
	window.addEventListener( 'resize', scan );
}

// Gallery peek-strip carousel behaviour. Ports `GalleryPeekStrip.tsx`, the
// mobile / reduced-motion-desktop-fallback gallery on the By Day and By
// Night pages (`templates/parts/gallery-peek-strip.php`). Structurally the
// same drag/step/wrap machine as `experience-carousel.js` — React state
// (`index`/`animate`/`dragPx`/`isDragging`/`reduced`) replaced by one
// mutable `state` object and a `render()` that writes it into the DOM the
// PHP template already rendered — but with a different pitch, peek and wrap
// strategy, so it is kept as its own module rather than sharing a core with
// the Experience carousel (plan-mandated duplication; see the task-16
// report).
//
// There is no next/previous control anywhere in this design — the source
// component is driven only by pointer drag, ArrowLeft/ArrowRight on the
// focused viewport (`role="group"`), and its own endless 4s autoplay loop,
// and this port does the same.
//
// No component-local `useGSAP` in the source: `GalleryPeekStrip.tsx` imports
// no gsap and defines no entrance reveal of its own (unlike `SiteHeader`'s
// and `ExperienceCarousel`'s), so there is nothing to carry over here beyond
// the drag/step machine.
//
// The part triples the whole image list — three back-to-back copies, not 3
// asymmetric clones — so `index` (the leftmost visible slide in the tripled
// list) starts at `n`, the first slide of the middle copy, and can drift a
// full copy in either direction before a wrap is needed. When a transition
// lands outside the middle copy (`index < n || index >= 2n`), it jumps
// (without animation) to the matching slide inside it, exactly mirroring
// the source's `handleTransitionEnd`. The source guards re-entrancy during
// that jump with a `settlingRef` that a `requestAnimationFrame` clears once
// the jump has painted; `step()` and `onPointerDown()` both check it before
// doing anything, same as the source. Unlike the Experience carousel there
// is no additional "settle guarantee" here — the source itself has none for
// this component, so none is invented.
//
// The root element IS the pointer/keyboard viewport here (`role="group"`
// and `data-cansakhara-carousel="peek"` are on the same element in the PHP
// part), unlike the Experience carousel where the viewport is a child of
// the tagged root.

const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const DURATION_MS = 650;
// Dwell between automatic advances. The carousel auto-loops endlessly on
// every breakpoint; manual input simply resets this timer via
// scheduleAutoplay() so it never double-steps right after a swipe.
const AUTOPLAY_MS = 4000;
// Desktop slide width — drag-threshold fallback only, used if the rendered
// slide can't be measured. The live threshold is measured from the rendered
// slide so it adapts to the 278px mobile slide; the pitch and gap live in
// the CSS track transform (see app.css's --gallery-i/--gallery-drag rules).
const SLIDE_W = 460;

export function initGalleryPeekStrip() {
	const roots = document.querySelectorAll( '[data-cansakhara-carousel="peek"]' );
	roots.forEach( initOne );
}

function initOne( root ) {
	// The root itself is the `role="group"` viewport — no separate child to
	// find, unlike the Experience carousel.
	const viewport = root;
	const track = root.querySelector( '[data-cansakhara-track]' );
	const slides = Array.from( root.querySelectorAll( '[data-cansakhara-slide]' ) );

	// The part always renders exactly 3 copies of the image list.
	if ( ! track || slides.length < 3 || slides.length % 3 !== 0 ) return;

	const n = slides.length / 3;

	const state = {
		index: n,
		animate: false,
		dragPx: 0,
		isDragging: false,
		reduced: false,
	};

	let dragStartX = 0;
	let dragOffset = 0;
	let settling = false;
	let autoplayTimer = null;

	function render() {
		const transition = state.isDragging
			? 'none'
			: state.animate
				? `transform ${ state.reduced ? 1 : DURATION_MS }ms ${ EASING }`
				: 'none';

		track.style.setProperty( '--gallery-i', String( state.index ) );
		track.style.setProperty( '--gallery-drag', `${ state.dragPx }px` );
		track.style.transition = transition;

		const logical = ( ( state.index % n ) + n ) % n;
		viewport.setAttribute( 'aria-label', `Gallery image ${ logical + 1 } of ${ n }` );

		viewport.classList.toggle( 'cursor-grabbing', state.isDragging );
		viewport.classList.toggle( 'select-none', state.isDragging );

		// New in this port: mirrors the index onto the root so it is
		// observable — same precedent as experience-carousel.js.
		root.setAttribute( 'data-cansakhara-index', String( state.index ) );
	}

	// Step the carousel by ±1 (or 0 to settle back to the current slide).
	function step( delta ) {
		if ( settling ) return;
		state.animate = true;
		state.dragPx = 0;
		if ( delta !== 0 ) state.index += delta;
		render();
	}

	// When a transition lands outside the middle copy, jump (without
	// animation) to the matching slide inside it so the loop is endless and
	// invisible.
	function onTransitionEnd( event ) {
		if ( event.propertyName !== 'transform' ) return;
		if ( state.index < n || state.index >= 2 * n ) {
			settling = true;
			state.animate = false;
			state.index = ( ( state.index % n ) + n ) % n + n;
			render();
			// Once the no-animation jump has painted, release the input guard.
			requestAnimationFrame( () => {
				settling = false;
			} );
		}
	}

	function onPointerDown( event ) {
		if ( event.button !== 0 && event.pointerType === 'mouse' ) return;
		if ( settling ) return;
		dragStartX = event.clientX;
		dragOffset = 0;
		state.isDragging = true;
		state.animate = false;
		viewport.setPointerCapture( event.pointerId );
		scheduleAutoplay();
		render();
	}

	function onPointerMove( event ) {
		if ( ! state.isDragging ) return;
		const delta = event.clientX - dragStartX;
		dragOffset = delta;
		state.dragPx = delta;
		render();
	}

	function endDrag( event ) {
		if ( ! state.isDragging ) return;
		state.isDragging = false;
		if ( viewport.hasPointerCapture( event.pointerId ) ) {
			viewport.releasePointerCapture( event.pointerId );
		}

		// Threshold off the rendered slide width so the swipe feels right at
		// the 278px mobile size as well as the 460px desktop size.
		const slide = viewport.querySelector( '.gallery-slide' );
		const width = slide ? slide.offsetWidth : SLIDE_W;
		const dragged = dragOffset;

		// Advance only once dragged past half a slide.
		let delta = 0;
		if ( dragged <= -width / 2 ) delta = 1;
		else if ( dragged >= width / 2 ) delta = -1;
		step( delta );
		scheduleAutoplay();
	}

	function onKeyDown( event ) {
		if ( event.key === 'ArrowRight' ) {
			event.preventDefault();
			step( 1 );
			scheduleAutoplay();
		} else if ( event.key === 'ArrowLeft' ) {
			event.preventDefault();
			step( -1 );
			scheduleAutoplay();
		}
	}

	// Endless auto-loop on every breakpoint: advance one slide every dwell,
	// forever. Paused while the user drags and disabled under reduced-motion;
	// any manual input restarts the dwell so it never double-steps right
	// after a swipe or keypress.
	function scheduleAutoplay() {
		if ( autoplayTimer ) {
			window.clearInterval( autoplayTimer );
			autoplayTimer = null;
		}
		if ( state.reduced || state.isDragging ) return;
		autoplayTimer = window.setInterval( () => step( 1 ), AUTOPLAY_MS );
	}

	const media = window.matchMedia( '(prefers-reduced-motion: reduce)' );
	function updateReduced() {
		state.reduced = media.matches;
		scheduleAutoplay();
		render();
	}
	updateReduced();
	media.addEventListener( 'change', updateReduced );

	viewport.addEventListener( 'keydown', onKeyDown );
	viewport.addEventListener( 'pointerdown', onPointerDown );
	viewport.addEventListener( 'pointermove', onPointerMove );
	viewport.addEventListener( 'pointerup', endDrag );
	viewport.addEventListener( 'pointercancel', endDrag );
	track.addEventListener( 'transitionend', onTransitionEnd );

	render();
}

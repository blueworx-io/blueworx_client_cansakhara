// Experience carousel behaviour. Ports `ExperienceCarousel.tsx`, with React
// state (`index`/`animate`/`dragPx`/`isDragging`/`reduced`) replaced by one
// mutable `state` object and a `render()` that writes it into the DOM the PHP
// template already rendered (`templates/parts/experience-carousel.php`). It
// also carries the source's own local `useGSAP` entrance reveal (the drag/
// snap behaviour and the reveal shipped together in one component, so they
// stay together here too — same precedent as `header.js` carrying
// `SiteHeader`'s local `drawSelf` hook rather than living in the shared
// `choreography.js` orchestrator).
//
// There is no next/previous control anywhere in this design — the source
// component is driven only by pointer drag and ArrowLeft/ArrowRight on the
// focused viewport (`role="group"`), and this port does the same.
//
// Two prior commits fixed real bugs in the source component and both are
// preserved here:
//
// - a14c1dc appended a second trailing clone (`slides[n+2]`) so the desktop
//   peek strip is never blank past the last real slide, AND added the
//   "settle guarantee": once nothing is dragging or animating, the track
//   must rest on a real slide with zero drag offset. Without it, a pointerdown
//   that interrupts an in-flight wrap transition (cancelling it before
//   `transitionend` can swap the clone for its real slide) can strand the
//   index on a clone with no event left to fire the swap, freezing the track
//   half-exposed. `settle()` below is that same guarantee, called after every
//   state-changing handler exactly where the source's effect would re-run.
// - 12ff3d8 touched `GalleryScrollRow.tsx` (the By Day/By Night sticky
//   gallery), not this component — it fixed that carousel's vertical
//   centring, unrelated to Experience's drag/snap logic. Nothing from it
//   applies here.
//
// The clone list rendered by the PHP part is, in order:
// [experiences[n-1], experiences[0], experiences[1], experiences[2],
//  experiences[0], experiences[1]] — index 0 is the trailing clone (backward
// wrap), index n+1 and n+2 are the leading clones (forward wrap + its peek).
// `index` starts at 1, the first real slide.

import { gsap } from './gsap.js';
import { fadeUp, clipImageReveal } from './animations.js';

const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const DURATION_MS = 650;

export function initExperienceCarousel() {
	const root = document.querySelector( '[data-cansakhara-carousel="experience"]' );
	if ( ! root ) return;

	const track = root.querySelector( '[data-cansakhara-track]' );
	const viewport = root.querySelector( '[role="group"]' );
	const slides = Array.from( root.querySelectorAll( '[data-cansakhara-slide]' ) );

	if ( ! track || ! viewport || slides.length < 4 ) return;

	// slides = [last, ...experiences, experiences[0], experiences[1]], so the
	// real slide count is the clone list length minus the 3 clones.
	const n = slides.length - 3;

	const state = {
		index: 1,
		animate: false,
		dragPx: 0,
		isDragging: false,
		reduced: false,
	};

	let dragStartX = 0;
	let dragOffset = 0;

	function render() {
		const transition = state.isDragging
			? 'none'
			: state.animate
				? `transform ${ state.reduced ? 1 : DURATION_MS }ms ${ EASING }`
				: 'none';

		track.style.setProperty( '--carousel-i', String( state.index ) );
		track.style.setProperty( '--carousel-drag', `${ state.dragPx }px` );
		track.style.transition = transition;

		slides.forEach( ( slide, i ) => {
			slide.setAttribute( 'aria-hidden', i === state.index ? 'false' : 'true' );
		} );

		const logical = ( ( ( state.index - 1 ) % n ) + n ) % n;
		viewport.setAttribute( 'aria-label', `Experience ${ logical + 1 } of ${ n }` );

		viewport.classList.toggle( 'cursor-grabbing', state.isDragging );
		viewport.classList.toggle( 'select-none', state.isDragging );

		// New in this port: mirrors the index onto the root so it is
		// observable — the source has no equivalent, it only ever needed the
		// index inside React state.
		root.setAttribute( 'data-cansakhara-index', String( state.index ) );
	}

	// Settle guarantee (a14c1dc). Once nothing is dragging or animating, the
	// track MUST rest on a real slide with no drag offset. Returns whether it
	// changed anything, so callers can re-render and re-check.
	function settle() {
		if ( state.isDragging || state.animate ) return false;

		if ( state.index === 0 || state.index === n + 1 ) {
			// Stranded on a clone: teleport to the identical real slide.
			state.index = state.index === 0 ? n : 1;
			return true;
		}

		if ( state.dragPx !== 0 ) {
			// Leftover offset at a real slide: animate it back to a clean rest.
			state.dragPx = 0;
			state.animate = true;
			return true;
		}

		return false;
	}

	// Renders, then applies the settle guarantee, re-rendering after each
	// adjustment it makes — mirrors React running the settle effect after
	// every commit, including any commits the effect itself triggers.
	function commit() {
		render();
		while ( settle() ) {
			render();
		}
	}

	// Step the carousel by ±1 (or 0 to settle back to the current slide).
	// Always settle the drag offset and re-enable the transition first so a
	// released drag never freezes at a half-exposed offset, even when the
	// index change below is ignored.
	function step( delta ) {
		state.animate = true;
		state.dragPx = 0;
		// Ignore index changes while resting on a clone (a wrap is about to
		// fire) so a fast second input can't overshoot the rendered range.
		if ( state.index !== 0 && state.index !== n + 1 && delta !== 0 ) {
			state.index += delta;
		}
		commit();
	}

	// When a transition lands on a clone, jump (without animation) to the
	// matching real slide so the loop is endless and invisible.
	function onTransitionEnd( event ) {
		if ( event.propertyName !== 'transform' ) return;
		if ( state.index === 0 ) {
			state.animate = false;
			state.index = n;
			commit();
		} else if ( state.index === n + 1 ) {
			state.animate = false;
			state.index = 1;
			commit();
		}
	}

	function onPointerDown( event ) {
		if ( event.button !== 0 && event.pointerType === 'mouse' ) return;
		dragStartX = event.clientX;
		dragOffset = 0;
		state.isDragging = true;
		state.animate = false;
		viewport.setPointerCapture( event.pointerId );
		commit();
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

		// Snap relative to the rendered slide width (the viewport is wider
		// than a slide on desktop, where a peek of the neighbouring slides is
		// visible).
		const slide = viewport.querySelector( '[data-cansakhara-slide]' );
		const width = slide ? slide.offsetWidth : viewport.clientWidth || 1;
		const dragged = dragOffset;

		// Snap to the next/previous slide once dragged past a quarter of the
		// slide width.
		let delta = 0;
		if ( dragged <= -width / 4 ) delta = 1;
		else if ( dragged >= width / 4 ) delta = -1;
		step( delta );
	}

	function onKeyDown( event ) {
		if ( event.key === 'ArrowRight' ) {
			event.preventDefault();
			step( 1 );
		} else if ( event.key === 'ArrowLeft' ) {
			event.preventDefault();
			step( -1 );
		}
	}

	const media = window.matchMedia( '(prefers-reduced-motion: reduce)' );
	function updateReduced() {
		state.reduced = media.matches;
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

	// ---- entrance reveal ------------------------------------------------
	//
	// One-time reveal of the initially-visible slide's heading and image when
	// the section scrolls into view. The source's `useGSAP` call passes no
	// dependency array, which the GSAP React integration treats as "run once
	// on mount" — it never re-runs as `index` changes, so it does not track
	// which slide is currently active; it only ever reveals whichever slide
	// happened to be active at mount (always index 1, the first real slide,
	// since that is what the PHP template renders `aria-hidden="false"` on).
	// This port matches that: the active slide is resolved once, right here,
	// and never re-queried when `step()`/`commit()` later change `index`.
	//
	// Both fadeUp (heading) and clipImageReveal (image) trigger off the
	// section (`root`), not off the elements themselves — carried over
	// verbatim from the source's own comment: triggering on the elements
	// would leave the (lower) image clipped if the carousel were advanced
	// before the section itself had scrolled into view, since an
	// already-advanced slide's image trigger may never cross the ScrollTrigger
	// start line on its own.
	//
	// No `mm.revert()` cleanup: the source's `useGSAP` returns one for React's
	// unmount, but nothing here ever unmounts — each page is its own full
	// load, exactly like `header.js`'s `drawSelf` setup below, which sets up
	// its own `gsap.matchMedia()` the same way with no revert either.
	const entranceMedia = gsap.matchMedia();
	entranceMedia.add( '(prefers-reduced-motion: no-preference)', () => {
		const active = root.querySelector( '.experience-slide[aria-hidden="false"]' );
		if ( ! active ) return;
		const heading = active.querySelector( '.experience-heading' );
		const image = active.querySelector( '.experience-image' );
		if ( heading ) fadeUp( heading, { trigger: root } );
		if ( image ) clipImageReveal( image, { trigger: root } );
	} );

	commit();
}

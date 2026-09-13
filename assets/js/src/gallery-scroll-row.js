// Gallery scroll row behaviour. Ports `GalleryScrollRow.tsx` — the desktop,
// scroll-driven horizontal gallery on the By Day and By Night pages
// (`templates/parts/gallery-scroll-row.php`) — and, alongside it, the
// switcher that `GalleryCarousel.tsx` used to own: which of this component
// or the peek strip (`gallery-peek-strip.js`) is the one actually mounted.
//
// ---- the scroll row's own useGSAP block ------------------------------
//
// This is the fourth and last of the four components that carried their own
// local `useGSAP` block in the source (`MotionRoot`, `SiteHeader`,
// `ExperienceCarousel`, and this one) — same precedent as
// `experience-carousel.js`: a component's local GSAP effect ships in that
// component's own behaviour file, not the shared `choreography.js`
// orchestrator.
//
// Two prior commits shaped this component and both are preserved verbatim
// below:
//
// - 2a72a5e ("Fix gallery scroll jitter: hold band with native CSS sticky,
//   not ScrollTrigger pin") is the heart of the component. Inside the site's
//   custom `.site-shell` scroller, ScrollTrigger's JS transform-pin has to
//   rewrite a transform every frame to counteract the scroll, which lags
//   real momentum scrolling by a frame and made the band visibly bounce.
//   The fix replaces the pin with native CSS `position: sticky` — handled by
//   the browser on the compositor, no per-frame JS — and lets GSAP scrub
//   only the horizontal track. This port keeps the band's `sticky` class
//   from the PHP part untouched and, exactly like the source, never pins
//   anything: the only GSAP tween below is the horizontal `x` scrub.
// - 12ff3d8 (no message body) added the vertical centring on top of that:
//   the band is shorter than the viewport, so instead of sticking it at the
//   top (source's original `2a72a5e` shape, which left one large dead gap
//   below it) it sticks VERTICALLY CENTRED — `centerTop()` below — with the
//   ScrollTrigger start shifted down by that same offset so the horizontal
//   scrub runs exactly over the window the band is actually stuck for. Both
//   `centerTop()` and the shifted `start` are carried over verbatim.
//
// `outer` (the height-donor wrapper) and `band` (the sticky element) carry
// no data attributes of their own — Task 17 does not touch
// `gallery-scroll-row.php` (Tasks 9/11 finished it) — so they're recovered
// by walking up from the tagged viewport rather than querying by class,
// mirroring the part's fixed nesting:
//   outer(.relative) > band(.sticky) > flexWrapper(.flex.justify-center) >
//   viewport([data-cansakhara-carousel="scroll-row"]) > track([data-cansakhara-track])
//
// No `mm.revert()` cleanup: same reasoning as `experience-carousel.js` and
// `header.js` — nothing here ever unmounts, each page load is its own full
// load. GSAP's `matchMedia` still reverts and re-runs the callback on its
// own whenever `isDesktop`/`reduced` change, which is what makes the switcher
// below safe to key off the exact same two queries (see next section).
//
// ---- the switcher ------------------------------------------------------
//
// The source's `GalleryCarousel` mounted exactly one child — this component
// on `(min-width: 796px)` with motion allowed, `GalleryPeekStrip` otherwise
// — starting from the peek strip on first paint (SSR state `false`) so
// server and client markup matched. `templates/pages/by-day.php` and
// `by-night.php` reproduce that first paint statically: both parts are
// rendered, the peek strip visible and the scroll row wrapped in `hidden`.
// `initGalleryCarouselSwitcher()` below reproduces the rest — toggling
// `hidden` on whichever container is not the active one, on load and again
// whenever either media query changes, exactly like the source's `useEffect`
// (`update()` + two `addEventListener('change', update)`).
//
// It lives in this file, rather than a third module or inline in `main.js`,
// because it needs the exact same two queries this component's own
// `useGSAP` block already gates on — keeping them together means there is
// only one place that has to agree on what "desktop with motion allowed"
// means. That agreement is also what stops the *hidden* component's
// behaviour from running, without any teardown API on either carousel:
//
// - This component's own `gsap.matchMedia()` call, below, only builds its
//   ScrollTrigger/tween when `isDesktop && !reduced` — precisely the
//   condition under which the switcher shows it. When the switcher would
//   hide it, this callback's own guard already returns before creating
//   anything, and if the condition flips while a ScrollTrigger already
//   exists, GSAP's `matchMedia` auto-reverts it — no coordination with the
//   switcher required.
// - `gallery-peek-strip.js` has no desktop/motion gate of its own (the
//   source `GalleryPeekStrip.tsx` never did either — its mount/unmount was
//   entirely the parent's job), and `initGalleryPeekStrip()` is already
//   unconditionally initialised from `main.js` for every peek-strip root on
//   the page, switcher or not. Rather than invent a teardown/pause API
//   across modules, `gallery-peek-strip.js`'s autoplay loop checks its own
//   root's visibility (`offsetParent === null`, true whenever an ancestor —
//   here, the switcher's `hidden` container — is `display: none`) on every
//   tick before stepping. Pointer and keyboard input need no equivalent
//   guard: a `display: none` element cannot receive pointer events or hold
//   focus, so they are already inert once the switcher hides it.
//
// `main.js` calls `initGalleryCarouselSwitcher()` before
// `initGalleryScrollRow()` so the containers' visibility is already settled
// by the time this component measures the band/track — otherwise, on a
// desktop/motion-allowed load, `layout()` would take its first measurement
// while the container was still `hidden` (offsetHeight/scrollWidth all 0).

import { gsap, getScroller } from './gsap.js';

const DESKTOP_QUERY = '(min-width: 796px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

// querySelectorAll, matching initGalleryCarouselSwitcher() below — that
// function already documents pages carrying more than one gallery pair, and a
// single querySelector here would animate the first row and quietly leave the
// rest static.
export function initGalleryScrollRow() {
	document
		.querySelectorAll( '[data-cansakhara-carousel="scroll-row"]' )
		.forEach( setupScrollRow );
}

function setupScrollRow( viewport ) {
	const track = viewport.querySelector( '[data-cansakhara-track]' );
	const flexWrapper = viewport.parentElement;
	const band = flexWrapper ? flexWrapper.parentElement : null;
	const outer = band ? band.parentElement : null;

	if ( ! track || ! band || ! outer ) return;

	const mm = gsap.matchMedia();
	mm.add(
		{
			isDesktop: DESKTOP_QUERY,
			reduced: REDUCED_QUERY,
		},
		( context ) => {
			const { isDesktop, reduced } = context.conditions;
			if ( ! isDesktop || reduced ) return;

			// How far the row must travel so the last slide reaches the frame's
			// right edge.
			const travel = () => track.scrollWidth - viewport.clientWidth;
			// Offset that centres the band vertically within the scroll viewport
			// (`.site-shell`). Clamped at 0 so a band taller than the window just
			// sticks to the top.
			const centerTop = () => {
				const scroller = getScroller();
				const vh = scroller ? scroller.clientHeight : window.innerHeight;
				return Math.max( 0, ( vh - band.offsetHeight ) / 2 );
			};
			// Wrapper = band height + travel, so the sticky band holds for
			// exactly `travel` px (the centring offset shifts both stick point
			// and release point equally). Re-run on every ScrollTrigger refresh
			// so a window resize recentres the band.
			const layout = () => {
				outer.style.height = `${ band.offsetHeight + travel() }px`;
				band.style.top = `${ centerTop() }px`;
			};
			layout();

			gsap.to( track, {
				x: () => -travel(),
				ease: 'none',
				scrollTrigger: {
					trigger: outer,
					scroller: getScroller() ?? undefined,
					// Begin the scrub the moment the band reaches its centred stick point.
					start: () => 'top top+=' + centerTop(),
					end: () => '+=' + travel(),
					scrub: 1,
					invalidateOnRefresh: true,
					onRefreshInit: layout,
				},
			} );
		}
	);
}

// Pairs a scroll-row container with its peek-strip sibling by the explicit
// `data-cansakhara-gallery-peek` hook Task 9/11 already put there for this
// purpose, not by DOM adjacency/order — a `previousElementSibling` read
// would silently mispair (or fail to pair at all) the moment a future edit
// inserts something between the two containers or reorders them, and the
// resulting failure mode is a gallery silently showing the wrong component
// rather than an error. Scoped to `:scope > ` direct children of the
// scroll-row container's own parent, so on a page with more than one
// gallery pair, each pair's lookup only ever sees its own local parent's
// children — it cannot reach across and match a different pair's peek
// container.
function findPeekContainer( scrollRowContainer ) {
	const parent = scrollRowContainer.parentElement;
	if ( ! parent ) return null;
	return parent.querySelector( ':scope > [data-cansakhara-gallery-peek]' );
}

export function initGalleryCarouselSwitcher() {
	const scrollRowContainers = document.querySelectorAll( '[data-cansakhara-gallery-scroll-row]' );
	if ( ! scrollRowContainers.length ) return;

	const desktop = window.matchMedia( DESKTOP_QUERY );
	const reduced = window.matchMedia( REDUCED_QUERY );

	function update() {
		const useScrollRow = desktop.matches && ! reduced.matches;
		scrollRowContainers.forEach( ( scrollRowContainer ) => {
			const peekContainer = findPeekContainer( scrollRowContainer );
			scrollRowContainer.classList.toggle( 'hidden', ! useScrollRow );
			if ( peekContainer ) peekContainer.classList.toggle( 'hidden', useScrollRow );
		} );
	}

	update();
	desktop.addEventListener( 'change', update );
	reduced.addEventListener( 'change', update );
}

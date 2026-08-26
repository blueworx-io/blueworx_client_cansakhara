// The motion entry point. Replaces the MotionRoot client island: resolves the
// in-page scroller, waits for fonts, and builds per-page choreography inside a
// reduced-motion-gated matchMedia block.
import { gsap, ScrollTrigger } from './gsap.js';
import {
	buildCommonChoreography,
	buildHomeHero,
	buildHomeScroll,
	buildDayNightHero,
	buildDayNightHeroTitle,
	buildDayNightScroll,
} from './choreography.js';

export function initMotion( pageSlug ) {
	const shell = document.querySelector( '.site-shell' );
	if ( ! shell ) return;

	const mm = gsap.matchMedia();
	const isDayNight = pageSlug === 'by-day' || pageSlug === 'by-night';

	// Phase 1 — above-the-fold page load. Runs immediately so hero elements never
	// flash visible before animating.
	mm.add( '(prefers-reduced-motion: no-preference)', () => {
		if ( pageSlug === 'home' ) buildHomeHero( shell );
		else if ( isDayNight ) buildDayNightHero( shell );
	} );

	// The explicit "the motion layer is up" signal read by the pre-paint
	// guard's watchdog in includes/render.php. Set after the hero build, not
	// before it: if that build throws, nothing will reveal the hero, and the
	// watchdog should treat it as a failure rather than as a running layer.
	document.documentElement.setAttribute( 'data-cansakhara-motion', 'ready' );

	// Phase 2 — scroll and text reveals. Deferred until webfonts settle so
	// SplitText line breaks are measured against the real fonts.
	const buildScroll = () => {
		mm.add( '(prefers-reduced-motion: no-preference)', () => {
			buildCommonChoreography( shell );
			if ( pageSlug === 'home' ) buildHomeScroll( shell );
			else if ( isDayNight ) {
				buildDayNightHeroTitle( shell );
				buildDayNightScroll( shell );
			}
		} );
		ScrollTrigger.refresh();
	};

	if ( document.fonts?.status === 'loaded' ) buildScroll();
	else document.fonts?.ready.then( buildScroll );
}

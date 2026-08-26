// Bundle entry. Reads the page identity from the body class the PHP renderer
// set, then starts every behaviour. Each init is a no-op when its markup is
// absent, so one bundle serves all three pages.
import { initMotion } from './motion.js';
import { initHeader } from './header.js';
import { initSideNav } from './side-nav.js';
import { initExperienceCarousel } from './experience-carousel.js';
import { initGalleryPeekStrip } from './gallery-peek-strip.js';
import { initGalleryCarouselSwitcher, initGalleryScrollRow } from './gallery-scroll-row.js';

function pageSlug() {
	const match = document.body.className.match( /page-cansakhara-([\w-]+)/ );
	return match ? match[ 1 ] : '';
}

function start() {
	const slug = pageSlug();
	initMotion( slug );
	initHeader();
	initSideNav();
	initExperienceCarousel();
	// Switcher first: it settles which of the two gallery containers is
	// visible before initGalleryScrollRow() measures the band/track, so a
	// desktop/motion-allowed load never measures against a still-hidden
	// container (see gallery-scroll-row.js's header comment).
	initGalleryCarouselSwitcher();
	initGalleryScrollRow();
	initGalleryPeekStrip();
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', start );
} else {
	start();
}

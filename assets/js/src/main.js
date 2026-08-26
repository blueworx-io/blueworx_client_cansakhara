// Bundle entry. Reads the page identity from the body class the PHP renderer
// set, then starts every behaviour. Each init is a no-op when its markup is
// absent, so one bundle serves all three pages.
import { initMotion } from './motion.js';

function pageSlug() {
	const match = document.body.className.match( /page-cansakhara-([\w-]+)/ );
	return match ? match[ 1 ] : '';
}

function start() {
	const slug = pageSlug();
	initMotion( slug );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', start );
} else {
	start();
}

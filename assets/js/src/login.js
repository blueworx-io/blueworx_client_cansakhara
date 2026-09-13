// Background submit for the login popup's form, so a wrong password keeps
// the popup open with a message instead of reloading the page. Without this
// script (or with it broken by an optimiser), the form still posts natively
// and includes/login.php handles it the same way.
export function initLoginForm() {
	const form = document.querySelector( '[data-cansakhara-login-form]' );
	const config = window.cansakharaLogin;
	if ( ! form || ! config || ! config.endpoint ) return;

	const error = form.querySelector( '[data-cansakhara-login-error]' );
	const submit = form.querySelector( 'button[type="submit"]' );

	function showError( message ) {
		if ( ! error ) return;
		error.textContent = message;
		error.hidden = false;
	}

	form.addEventListener( 'submit', async ( event ) => {
		event.preventDefault();
		if ( error ) error.hidden = true;
		if ( submit ) submit.disabled = true;

		try {
			const response = await fetch( config.endpoint, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify( {
					email: form.elements.email.value,
					password: form.elements.password.value,
				} ),
			} );
			const data = await response.json().catch( () => ( {} ) );

			if ( response.ok && data.redirect ) {
				window.location.assign( data.redirect );
				return;
			}
			showError( data.message || config.genericError );
		} catch ( e ) {
			showError( config.genericError );
		} finally {
			if ( submit ) submit.disabled = false;
		}
	} );
}

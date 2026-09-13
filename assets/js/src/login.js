// Background submit for the login popup's form, so a wrong password keeps
// the popup open with a message instead of reloading the page. Anything
// other than a clean refusal — a blocked REST route, a non-JSON body, a
// thrown fetch — falls back to a native form submit, which includes/login.php
// handles the same way.
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

		let response;
		let data;
		try {
			response = await fetch( config.endpoint, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify( {
					email: form.elements.email.value,
					password: form.elements.password.value,
				} ),
			} );
			data = await response.json();
		} catch {
			// Blocked, offline, or a non-JSON body — hand off to the PHP path.
			// form.submit() does not re-trigger this listener.
			form.submit();
			return;
		}

		if ( response.ok && data.redirect ) {
			window.location.assign( data.redirect );
			return;
		}

		if ( 'cansakhara_login_failed' === data.code ) {
			showError( data.message || config.genericError );
			if ( submit ) submit.disabled = false;
			return;
		}

		// Any other status or code (a security plugin's own 401, for example)
		// isn't a real refusal — fall back to the native submit.
		form.submit();
	} );
}

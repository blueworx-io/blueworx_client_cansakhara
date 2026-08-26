<?php
/**
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

cansakhara_document_open( array( 'theme' => 'night' ) );
cansakhara_part( 'header', array( 'theme' => 'night' ) );
?>
<main id="content" class="site-shell">
	<h1>PLACEHOLDER</h1>
	<?php
	cansakhara_part(
		'footer',
		array(
			'theme' => 'night',
			'class' => 'mt-[2px]',
		)
	);
	?>
</main>
<?php
cansakhara_part( 'side-nav' );
cansakhara_document_close();

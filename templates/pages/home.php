<?php
/**
 * @package CanSakhara
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

cansakhara_document_open( array( 'theme' => 'home' ) );
cansakhara_part( 'header', array( 'theme' => 'home' ) );
?>
<main id="content" class="site-shell">
	<h1>PLACEHOLDER</h1>
	<?php cansakhara_part( 'footer', array( 'theme' => 'home' ) ); ?>
</main>
<?php
cansakhara_part( 'side-nav' );
cansakhara_document_close();

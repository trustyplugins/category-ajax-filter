<?php
/**
 * Load legacy CAF variable defaults into the current include scope.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once TC_CAF_PATH . 'includes/caf-legacy-variable-defaults.php';
extract( caf_get_legacy_variable_defaults(), EXTR_SKIP );

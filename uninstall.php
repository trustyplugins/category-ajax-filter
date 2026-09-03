<?php
/**
 * Uninstall handler for Category AJAX Filter.
 *
 * Policy: never delete user-created filter data (caf_posts, builder layout
 * options, post meta). Filters may belong to Pro or be re-used if the user
 * reinstalls. Only plugin-internal housekeeping options are removed.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Remove lightweight plugin-internal options that are not user content.
$internal_options = array(
	'tc_caf_plugin_version',
	'caf_client_error_log',
);

foreach ( $internal_options as $option_name ) {
	delete_option( $option_name );
}

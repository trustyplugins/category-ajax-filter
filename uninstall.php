<?php
/**
 * Uninstall cleanup for Category AJAX Filter.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

global $wpdb;

$static_options = array(
	'tc_caf_plugin_version',
	'caf_builder_layouts_list',
	'caf_custom_post_filter_layout',
	'caf_fa_icons',
	'caf_client_error_log',
	'caf_builder_custom_fonts',
);

foreach ( $static_options as $option_name ) {
	delete_option( $option_name );
}

// Layout JSON and other dynamic options (caf_{layout}_{index}, etc.).
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE 'caf\\_%'" );

// Legacy shortcode filter posts (caf_posts CPT).
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$filter_posts = $wpdb->get_col(
	$wpdb->prepare(
		"SELECT ID FROM {$wpdb->posts} WHERE post_type = %s",
		'caf_posts'
	)
);

if ( is_array( $filter_posts ) ) {
	foreach ( $filter_posts as $post_id ) {
		wp_delete_post( (int) $post_id, true );
	}
}

// Legacy filter meta stored on caf_posts and shortcode filter posts.
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$wpdb->query( "DELETE FROM {$wpdb->postmeta} WHERE meta_key LIKE 'caf\\_%' OR meta_key LIKE '\\_caf\\_%'" );

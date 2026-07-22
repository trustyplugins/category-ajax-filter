<?php
/**
 * Builder hook tier gating (free vs pro).
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builder hooks available on the free tier.
 *
 * @return array<int, string>
 */
function caf_builder_free_hook_names() {
	return array(
		'caf_builder_wrapper_attributes',
		'caf_builder_render_before',
		'caf_builder_render_after',
		'caf_builder_before_query',
		'caf_builder_after_query',
		// Lets the curated free Woo runtime unhide the product post type.
		'caf_pro_builder_excluded_post_types',
		// Range slider (Woo price) clamp + defaults on page load / render.
		'caf_builder_module_settings',
		'caf_builder_page_load_meta_query',
	);
}

/**
 * Whether the CAF Pro plugin is actually loaded (not just CAF_BUILDER_TIER).
 *
 * @return bool
 */
function caf_builder_hooks_is_pro_runtime() {
	if ( class_exists( 'CAF_Builder_Tier' ) ) {
		return CAF_Builder_Tier::is_pro();
	}

	return defined( 'TC_CAF_PRO_PLUGIN_VERSION' ) && class_exists( 'TC_CAF_PRO' );
}

/**
 * Whether a builder hook may run on the current tier.
 *
 * @param string $hook Hook name.
 * @return bool
 */
function caf_builder_hooks_is_allowed( $hook ) {
	if ( caf_builder_hooks_is_pro_runtime() ) {
		return true;
	}

	return in_array( (string) $hook, caf_builder_free_hook_names(), true );
}

/**
 * Apply a builder filter when allowed for the current tier.
 *
 * @param string $hook  Hook name.
 * @param mixed  $value Value to filter.
 * @param mixed  ...$args Extra arguments.
 * @return mixed
 */
function caf_builder_apply_filters( $hook, $value, ...$args ) {
	if ( ! caf_builder_hooks_is_allowed( $hook ) ) {
		return $value;
	}

	return apply_filters( $hook, $value, ...$args );
}

/**
 * Fire a builder action when allowed for the current tier.
 *
 * @param string $hook Hook name.
 * @param mixed  ...$args Action arguments.
 * @return void
 */
function caf_builder_do_action( $hook, ...$args ) {
	if ( ! caf_builder_hooks_is_allowed( $hook ) ) {
		return;
	}

	do_action( $hook, ...$args );
}

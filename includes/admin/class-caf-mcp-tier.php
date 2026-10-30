<?php
/**
 * Free MCP catalog — same limits as the Free builder.
 *
 * Pro-only tools are omitted from tools/list. Writes that hit a blocked
 * feature return a Pro-only error instead of applying Pro behavior.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'CAF_MCP_Tier', false ) ) {

class CAF_MCP_Tier {

	/**
	 * Tools Free MCP registers. Same URL as Pro; catalog is smaller.
	 *
	 * @return string[]
	 */
	public static function allowed_tools() {
		return array(
			'caf-list-layouts',
			'caf-create-layout',
			'caf-rename-layout',
			'caf-duplicate-layout',
			'caf-trash-layout',
			'caf-restore-layout',
			'caf-delete-layout',
			'caf-export-layout',
			'caf-import-layout',
			'caf-list-revisions',
			'caf-restore-revision',
			'caf-list-posts',
			'caf-manage-layout-settings',
			'caf-build-post',
			'caf-list-post-types',
			'caf-list-module-schemas',
			'caf-get-module-schema',
			'caf-get-layout-structure',
			'caf-list-taxonomies',
			'caf-list-woo-attributes',
			'caf-get-price-range',
			'caf-list-media',
			'caf-manage-modules',
			'caf-build-filter',
			'caf-create-preview-link',
		);
	}

	/**
	 * @param string $name Tool name.
	 * @return bool
	 */
	public static function is_allowed_tool( $name ) {
		return in_array( (string) $name, self::allowed_tools(), true );
	}

	/**
	 * @param array<int, array<string, mixed>> $tools Tool defs.
	 * @return array<int, array<string, mixed>>
	 */
	public static function filter_tool_defs( $tools ) {
		$out = array();
		foreach ( $tools as $tool ) {
			$name = isset( $tool['name'] ) ? (string) $tool['name'] : '';
			if ( self::is_allowed_tool( $name ) ) {
				$out[] = $tool;
			}
		}
		return array_values( $out );
	}

	/**
	 * Filter compose keys (checkbox_filter aliases included).
	 *
	 * @param string   $tree    filter|post.
	 * @param string[] $allowed Compose allowlist.
	 * @return string[]
	 */
	public static function allowed_compose_modules( $tree, $allowed ) {
		$free = ( 'post' === $tree )
			? array(
				'image',
				'title',
				'excerpt',
				'button',
				'author',
				'date',
				'commentcount',
				'categories',
				'woo_product_image',
				'product_price',
				'woo_add_to_cart',
				'badges',
				'pagination',
			)
			: array(
				'checkbox_filter',
				'dropdown_filter',
				'search',
				'reset',
				'customtext',
				'range_slider',
			);
		return array_values( array_intersect( $allowed, $free ) );
	}

	/**
	 * @param string $tree filter|post.
	 * @param array<string, mixed> $schemas Schema map.
	 * @return array<string, mixed>
	 */
	public static function filter_schema_map( $tree, $schemas ) {
		if ( ! is_array( $schemas ) ) {
			return array();
		}
		$keys = self::allowed_compose_modules( $tree, array_keys( $schemas ) );
		$out  = array();
		foreach ( $keys as $key ) {
			if ( isset( $schemas[ $key ] ) ) {
				$out[ $key ] = $schemas[ $key ];
			}
		}
		return $out;
	}

	/**
	 * Layout-settings / manage-modules keys that are Pro-only.
	 *
	 * @return string[]
	 */
	public static function blocked_setting_keys() {
		return array(
			'float_button_position',
			'float_position',
			'float_button_corner',
			'float_button',
			'float_button_value',
			'animation_type',
			'selected_enable',
			'show_selected',
			'active_filters',
			'selected_zone',
			'selected_close_button',
			'sorting_enable',
			'sorting_zone',
			'result_count_enable',
			'result_count_zone',
			'query_restriction',
			'filter_query',
			'custom_field',
			'bind_custom_field',
			'meta_relation',
			'dynamic_term_counts',
			'masonry',
			'global_font_family',
		);
	}

	/**
	 * @param array<string, mixed> $patch Settings patch.
	 * @return WP_Error|null
	 */
	public static function reject_pro_settings( $patch ) {
		if ( ! is_array( $patch ) ) {
			return null;
		}
		foreach ( self::blocked_setting_keys() as $key ) {
			if ( array_key_exists( $key, $patch ) ) {
				return self::pro_only_error( $key );
			}
		}
		if ( array_key_exists( 'filter_position', $patch ) ) {
			$pos = sanitize_key( (string) $patch['filter_position'] );
			if ( 'floating' === $pos ) {
				return self::pro_only_error( 'floating_filter' );
			}
		}
		if ( array_key_exists( 'pagination_type', $patch ) ) {
			$type = (string) $patch['pagination_type'];
			if ( 'number' !== $type ) {
				return self::pro_only_error( 'pagination_type' );
			}
		}
		if ( array_key_exists( 'layout_source', $patch ) ) {
			$source = sanitize_key( (string) $patch['layout_source'] );
			if ( 'elementor_loop' === $source ) {
				return self::pro_only_error( 'elementor_loop' );
			}
		}
		return null;
	}

	/**
	 * @param string $feature Feature or tool key.
	 * @return WP_Error
	 */
	public static function pro_only_error( $feature ) {
		return new WP_Error(
			'caf_mcp_pro_only',
			sprintf(
				/* translators: %s: feature key */
				__( '“%s” is available in Category Ajax Filter Pro. Free MCP matches the Free builder.', 'category-ajax-filter' ),
				$feature
			),
			array( 'status' => 403 )
		);
	}

	/**
	 * @param string $name Tool name.
	 * @return string
	 */
	public static function pro_only_message( $name ) {
		$err = self::pro_only_error( $name );
		return $err->get_error_message();
	}
}

}

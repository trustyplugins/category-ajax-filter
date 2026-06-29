<?php
/**
 * Builder tier configuration (free vs pro).
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Builder_Tier {

	const TIER_FREE = 'free';
	const TIER_PRO  = 'pro';

	/**
	 * Current builder tier slug.
	 *
	 * @return string
	 */
	public static function get_tier() {
		if ( defined( 'CAF_BUILDER_TIER' ) ) {
			return (string) CAF_BUILDER_TIER;
		}

		return self::TIER_PRO;
	}

	/**
	 * @return bool
	 */
	public static function is_pro() {
		return self::TIER_PRO === self::get_tier();
	}

	/**
	 * Tier limits for REST enforcement and JS localization.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_limits() {
		if ( self::is_pro() ) {
			return array(
				'max_layouts'      => -1,
				'filter_modules'   => array(),
				'post_modules'     => array(),
				'features'         => array(),
				'blocked_features' => array(),
			);
		}

		return array(
			'max_layouts'           => -1,
			'revision_max'          => 2,
			'revision_display_max'  => 10,
			'filter_modules'        => array( 'checkbox', 'dropdown', 'search', 'reset', 'customtext', 'woo_price_filter', 'woo_stock_filter', 'woo_sale_filter', 'woo_rating_filter' ),
      'single_instance_filter_modules' => array( 'checkbox_filter', 'dropdown_filter', 'search' ),
			'post_modules'          => array(
				'image',
				'title',
				'excerpt',
				'button',
				'author',
				'date',
				'commentcount',
				'categories',
				'woo_price',
				'woo_rating',
				'woo_add_to_cart',
			),
			'features'              => array( 'pagination', 'loader' ),
			'blocked_features'      => array(
				'analytics',
				'filter_url',
				'schema',
				'sorting',
				'result_counter',
				'active_filters',
				'floating_filter',
				'custom_fonts',
				'elementor_loop',
				'license_key',
				'global_settings',
				'smart_ai_search',
				'search_custom_field',
				'voice_search',
				'filter_custom_field',
				'filter_show_icon',
				'search_show_icon',
				'search_clear_input',
				'label_show_icon',
				'filter_label_collapse',
				'filter_term_default',
				'filter_term_icon',
				'reset_module_icon',
				'customtext_module_icon',
				'meta_relation',
				'post_image_custom_field',
				'post_link_custom_field',
				'post_prefix_suffix',
				'post_masonry',
				'scroll_to_container',
				'preview_loader_settings',
				'pagination_button',
				'pagination_number2',
				'pagination_load_more',
				'multiple_filters_per_page',
				'gradient_colors',
				'woo_rating_filter',
			),
		);
	}

	/**
	 * @return bool
	 */
	public static function is_woocommerce_active() {
		return class_exists( 'WooCommerce', false );
	}

	/**
	 * Whether layouts can target WooCommerce products in the builder.
	 *
	 * @return bool
	 */
	public static function can_use_product_post_type() {
		if ( ! self::is_woocommerce_active() ) {
			return false;
		}

		return self::can_use_feature( 'woo_product_post_type' );
	}

	/**
	 * Config passed to react-builder via tc_caf_ajax.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_ajax_config() {
		return array(
			'tier'                      => self::get_tier(),
			'is_pro'                    => self::is_pro(),
			'limits'                    => self::get_limits(),
			'upgrade_url'               => 'https://trustyplugins.com/category-ajax-filter-pro',
			'woocommerce_active'        => self::is_woocommerce_active(),
			'product_post_type_enabled' => self::can_use_product_post_type(),
		);
	}

	public static function normalize_filter_module_key( $module_key ) {
		$aliases = array(
			'checkbox_filter' => 'checkbox',
			'dropdown_filter' => 'dropdown',
		);
		$key = (string) $module_key;

		return isset( $aliases[ $key ] ) ? $aliases[ $key ] : $key;
	}

	/**
	 * @param string $module_key Module key slug.
	 * @return bool
	 */
	public static function can_use_filter_module( $module_key ) {
		$limits  = self::get_limits();
		$allowed = $limits['filter_modules'];

		if ( empty( $allowed ) ) {
			return true;
		}

		return in_array( self::normalize_filter_module_key( $module_key ), $allowed, true );
	}

	public static function normalize_post_module_key( $module_key ) {
		$aliases = array(
			'custom_text'  => 'customtext',
			'custom_field' => 'customfield',
		);
		$key = (string) $module_key;

		return isset( $aliases[ $key ] ) ? $aliases[ $key ] : $key;
	}

	/**
	 * @param string $module_key Module key slug.
	 * @return bool
	 */
	public static function can_use_post_module( $module_key ) {
		$limits  = self::get_limits();
		$allowed = $limits['post_modules'];

		if ( empty( $allowed ) ) {
			return true;
		}

		return in_array( self::normalize_post_module_key( $module_key ), $allowed, true );
	}

	/**
	 * @param string $feature_key Feature slug.
	 * @return bool
	 */
	public static function can_use_feature( $feature_key ) {
		$limits  = self::get_limits();
		$blocked = isset( $limits['blocked_features'] ) ? (array) $limits['blocked_features'] : array();

		if ( self::is_pro() ) {
			return true;
		}

		return ! in_array( (string) $feature_key, $blocked, true );
	}

	/**
	 * Whether a layout-control (DnD misc) item may render on the public frontend.
	 *
	 * @param string $item_key Misc item key (sorting, result_count, selected, pagination, …).
	 * @return bool
	 */
	public static function can_render_misc_item( $item_key ) {
		if ( self::is_pro() ) {
			return true;
		}

		$map = array(
			'sorting'      => 'sorting',
			'result_count' => 'result_counter',
			'selected'     => 'active_filters',
		);

		$item_key = (string) $item_key;
		if ( ! isset( $map[ $item_key ] ) ) {
			return true;
		}

		return self::can_use_feature( $map[ $item_key ] );
	}

	/**
	 * Default wp_option value for per-layout toggles (Enable vs Disable).
	 *
	 * @return string
	 */
	public static function get_layout_toggle_option_default() {
		return self::is_pro() ? 'Enable' : 'Disable';
	}

	/**
	 * @return int -1 means unlimited.
	 */
	public static function get_max_layouts() {
		$limits = self::get_limits();
		return isset( $limits['max_layouts'] ) ? (int) $limits['max_layouts'] : -1;
	}

	/**
	 * Count non-trash layouts in caf_builder_layouts_list.
	 *
	 * @return int
	 */
	public static function count_active_layouts() {
		$layouts = get_option( 'caf_builder_layouts_list', array() );
		if ( ! is_array( $layouts ) ) {
			return 0;
		}

		$count = 0;
		foreach ( $layouts as $layout ) {
			if ( ! is_array( $layout ) ) {
				continue;
			}
			$status = isset( $layout['post_status'] ) ? (string) $layout['post_status'] : 'draft';
			if ( 'trash' !== $status ) {
				++$count;
			}
		}

		return $count;
	}

	/**
	 * @return bool
	 */
	public static function can_create_layout() {
		$max = self::get_max_layouts();
		if ( $max < 0 ) {
			return true;
		}

		return self::count_active_layouts() < $max;
	}

	/**
	 * Max revision snapshots allowed for the current tier (builder session history).
	 *
	 * @return int
	 */
	public static function get_revision_max() {
		$limits = self::get_limits();

		if ( self::is_pro() ) {
			if ( isset( $limits['revision_display_max'] ) ) {
				return max( 1, (int) $limits['revision_display_max'] );
			}
			return 10;
		}

		if ( isset( $limits['revision_max'] ) ) {
			return max( 0, (int) $limits['revision_max'] );
		}

		return 2;
	}

	/**
	 * Trim a revision list to the tier maximum (defense-in-depth for any server-side storage).
	 *
	 * @param array<int, mixed> $revisions Revision entries.
	 * @return array<int, mixed>
	 */
	public static function cap_revision_entries( array $revisions ) {
		$max = self::get_revision_max();
		if ( $max <= 0 || count( $revisions ) <= $max ) {
			return $revisions;
		}

		return array_slice( $revisions, -$max );
	}

	/**
	 * Whether more than one [caf_filter] shortcode may render on the same front-end page.
	 *
	 * @return bool
	 */
	public static function allows_multiple_filters_per_page() {
		return self::can_use_feature( 'multiple_filters_per_page' );
	}

	/**
	 * Reserve one front-end filter slot per page (free tier: first shortcode only).
	 *
	 * @return bool False when a second filter shortcode should not render.
	 */
	public static function reserve_page_filter_instance() {
		if ( self::allows_multiple_filters_per_page() || is_admin() ) {
			return true;
		}

		static $count = 0;
		if ( $count >= 1 ) {
			return false;
		}

		++$count;
		return true;
	}

	/**
	 * Message shown when a second filter shortcode is blocked on free.
	 *
	 * @return string
	 */
	public static function get_multiple_filters_per_page_message() {
		$config = self::get_ajax_config();
		$url    = isset( $config['upgrade_url'] ) ? $config['upgrade_url'] : 'https://trustyplugins.com/category-ajax-filter-pro';

		return sprintf(
			'<div class="error-caf error-of-multiple-filters">%s <a href="%s" target="_blank" rel="noopener noreferrer">%s</a></div>',
			esc_html__( 'Only one CAF filter shortcode is allowed per page on the free version.', 'category-ajax-filter' ),
			esc_url( $url ),
			esc_html__( 'Upgrade to Pro', 'category-ajax-filter' )
		);
	}
}

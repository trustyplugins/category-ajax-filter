<?php
/**
 * WooCommerce builder bootstrap (product post type + filter modules).
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Woo_Builder {

	/**
	 * Register WooCommerce builder hooks.
	 */
	public static function init() {
		if ( ! class_exists( 'CAF_Builder_Tier' ) || ! CAF_Builder_Tier::is_woocommerce_active() ) {
			return;
		}

		self::load_dependencies();
		add_filter( 'caf_pro_builder_excluded_post_types', array( __CLASS__, 'filter_excluded_post_types' ), 10, 1 );
		add_action( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
	}

	/**
	 * @return void
	 */
	protected static function load_dependencies() {
		$base = defined( 'TC_CAF_PRO_PATH' ) ? TC_CAF_PRO_PATH : TC_CAF_PATH;
		$dir  = $base . 'includes/woocommerce/';

		self::ensure_filter_module_parents_loaded( $base );

		$files = array(
			'class-caf-woo-filter-helper.php',
			'class-caf-woo-filter-query.php',
			'class-caf-woo-post-helper.php',
			'class-caf-woo-post-renderer.php',
			'filters/class-caf-woo-filter-base-module.php',
			'filters/class-caf-woo-filter-price-module.php',
			'filters/class-caf-woo-filter-stock-module.php',
			'filters/class-caf-woo-filter-sale-module.php',
			'filters/class-caf-woo-filter-rating-module.php',
		);

		foreach ( $files as $file ) {
			$path = $dir . $file;
			if ( file_exists( $path ) ) {
				require_once $path;
			}
		}
	}

	/**
	 * Allow the product post type in builder UI when WooCommerce is active.
	 *
	 * @param array<int, string> $excluded Post type slugs hidden from the builder.
	 * @return array<int, string>
	 */
	public static function filter_excluded_post_types( $excluded ) {
		if ( ! CAF_Builder_Tier::can_use_product_post_type() ) {
			return $excluded;
		}

		if ( ! is_array( $excluded ) ) {
			return $excluded;
		}

		return array_values( array_diff( $excluded, array( 'product' ) ) );
	}

	/**
	 * @return void
	 */
	public static function register_rest_routes() {
		register_rest_route(
			'caf-custom-builder/v1',
			'/get-woo-product-price-range/',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'get_product_price_range' ),
				'permission_callback' => static function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}

	/**
	 * @return void
	 */
	public static function get_product_price_range() {
		if ( ! class_exists( 'CAF_Woo_Filter_Helper' ) ) {
			wp_send_json(
				array(
					'status' => 'error',
					'min'    => 0,
					'max'    => 1000,
				)
			);
		}

		$bounds = CAF_Woo_Filter_Helper::get_product_price_bounds();
		wp_send_json(
			array(
				'status' => 'success',
				'min'    => $bounds['min'],
				'max'    => $bounds['max'],
			)
		);
	}
}

CAF_Woo_Builder::init();

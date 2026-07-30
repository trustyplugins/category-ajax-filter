<?php
/**
 * Curated WooCommerce runtime for the free plugin.
 *
 * This file intentionally contains only behavior available in the free tier.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Free_Woo {

	const WOO_PRICE_META_KEY = '_price';

	/**
	 * Register the free WooCommerce integration.
	 *
	 * @return void
	 */
	public static function init() {
		add_filter( 'caf_pro_builder_excluded_post_types', array( __CLASS__, 'filter_excluded_post_types' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
		add_filter( 'caf_builder_module_settings', array( __CLASS__, 'filter_module_settings' ), 10, 2 );
		// Keep product listings + term counts aligned with Woo catalog visibility.
		add_filter( 'caf_builder_ajax_query_args', array( __CLASS__, 'filter_builder_query_args' ), 20, 2 );
		add_filter( 'caf_builder_page_load_query_args', array( __CLASS__, 'filter_builder_query_args' ), 20, 2 );
	}

	/**
	 * Apply catalog visibility rules to CAF builder product queries.
	 *
	 * @param array<string, mixed> $args    Query args.
	 * @param array<string, mixed> $context Hook context.
	 * @return array<string, mixed>
	 */
	public static function filter_builder_query_args( $args, $context = array() ) {
		unset( $context );
		return self::append_product_visibility_to_query_args( is_array( $args ) ? $args : array() );
	}

	/**
	 * Exclude hidden / out-of-stock products from catalog-style product queries.
	 *
	 * Mirrors WooCommerce shop rules so CAF counts and listings match the storefront.
	 *
	 * @param array<string, mixed> $args Query args.
	 * @return array<string, mixed>
	 */
	public static function append_product_visibility_to_query_args( $args ) {
		if ( ! class_exists( 'WooCommerce' ) || ! is_array( $args ) ) {
			return $args;
		}

		$post_type = isset( $args['post_type'] ) ? $args['post_type'] : '';
		if ( is_array( $post_type ) ) {
			if ( ! in_array( 'product', $post_type, true ) ) {
				return $args;
			}
		} elseif ( 'product' !== $post_type ) {
			return $args;
		}

		if ( ! taxonomy_exists( 'product_visibility' ) ) {
			return $args;
		}

		$visibility_terms = function_exists( 'wc_get_product_visibility_term_ids' )
			? wc_get_product_visibility_term_ids()
			: array();

		if ( empty( $visibility_terms ) || ! is_array( $visibility_terms ) ) {
			return $args;
		}

		$exclude_term_ids = array();
		$is_search        = ! empty( $args['s'] ) || ! empty( $args['caf_search_keyword'] );

		if ( $is_search ) {
			if ( ! empty( $visibility_terms['exclude-from-search'] ) ) {
				$exclude_term_ids[] = (int) $visibility_terms['exclude-from-search'];
			}
		} elseif ( ! empty( $visibility_terms['exclude-from-catalog'] ) ) {
			$exclude_term_ids[] = (int) $visibility_terms['exclude-from-catalog'];
		}

		if ( 'yes' === get_option( 'woocommerce_hide_out_of_stock_items' ) && ! empty( $visibility_terms['outofstock'] ) ) {
			$exclude_term_ids[] = (int) $visibility_terms['outofstock'];
		}

		$exclude_term_ids = array_values( array_unique( array_filter( $exclude_term_ids ) ) );
		if ( empty( $exclude_term_ids ) ) {
			return $args;
		}

		if ( empty( $args['tax_query'] ) || ! is_array( $args['tax_query'] ) ) {
			$args['tax_query'] = array();
		}

		foreach ( $args['tax_query'] as $clause ) {
			if ( is_array( $clause ) && isset( $clause['taxonomy'] ) && 'product_visibility' === $clause['taxonomy'] ) {
				return $args;
			}
		}

		$args['tax_query'][] = array(
			'taxonomy' => 'product_visibility',
			'field'    => 'term_taxonomy_id',
			'terms'    => $exclude_term_ids,
			'operator' => 'NOT IN',
		);

		return $args;
	}

	/**
	 * Catalog-visible product count for a taxonomy term (matches Woo frontend counts).
	 *
	 * Prefers Woo's stored visibility-aware term meta when present; otherwise runs a
	 * visibility-aware WP_Query (including child terms).
	 *
	 * @param int         $term_id  Term ID.
	 * @param string      $taxonomy Taxonomy slug.
	 * @param int|null    $fallback Optional baked fallback when Woo is unavailable.
	 * @return int
	 */
	public static function get_catalog_term_count( $term_id, $taxonomy, $fallback = null ) {
		$term_id  = absint( $term_id );
		$taxonomy = sanitize_key( (string) $taxonomy );
		$baked    = null !== $fallback ? (int) $fallback : 0;

		if ( ! $term_id || '' === $taxonomy || ! self::is_woocommerce_available() ) {
			return $baked;
		}

		$meta_count = get_term_meta( $term_id, 'product_count_' . $taxonomy, true );
		if ( '' !== $meta_count && is_numeric( $meta_count ) ) {
			return (int) $meta_count;
		}

		$args = array(
			'post_type'              => 'product',
			'post_status'            => 'publish',
			'fields'                 => 'ids',
			'posts_per_page'         => 1,
			'no_found_rows'          => false,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
			'tax_query'              => array(
				array(
					'taxonomy'         => $taxonomy,
					'field'            => 'term_id',
					'terms'            => $term_id,
					'include_children' => true,
				),
			),
		);
		$args  = self::append_product_visibility_to_query_args( $args );
		$query = new WP_Query( $args );

		return (int) $query->found_posts;
	}

	/**
	 * REST routes used by the React builder (price range for free Range Slider).
	 *
	 * @return void
	 */
	public static function register_rest_routes() {
		if ( ! class_exists( 'WooCommerce', false ) ) {
			return;
		}

		register_rest_route(
			'caf-custom-builder/v1',
			'/get-woo-product-price-range/',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_get_product_price_range' ),
				'permission_callback' => static function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}

	/**
	 * @return void
	 */
	public static function rest_get_product_price_range() {
		// Catalog auto-detect removed — static defaults only.
		return array(
			'status'   => 'success',
			'min'      => 0,
			'max'      => 100,
			'currency' => self::get_product_price_currency_symbol(),
		);
	}

	/**
	 * Clamp free Range Slider settings and apply Woo price defaults on frontend.
	 *
	 * @param object|mixed $settings Module settings.
	 * @param array        $context  Hook context.
	 * @return object|mixed
	 */
	public static function filter_module_settings( $settings, $context = array() ) {
		$module_type = isset( $context['module_type'] ) ? sanitize_key( (string) $context['module_type'] ) : '';
		if ( 'range_slider' !== $module_type || ! is_object( $settings ) ) {
			return $settings;
		}

		$settings = self::clamp_range_slider_settings_for_free( $settings );
		return self::apply_price_slider_defaults( $settings );
	}

	/**
	 * Force WooCommerce `_price` + strip Pro-only label options on free.
	 *
	 * @param object $settings Module settings.
	 * @return object
	 */
	public static function clamp_range_slider_settings_for_free( $settings ) {
		if ( ! is_object( $settings ) ) {
			return $settings;
		}

		$settings->data_source = 'custom_field';

		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'range_slider_custom_fields' ) ) {
			$settings->custom_field_data = array(
				(object) array(
					'custom_field_key'        => self::WOO_PRICE_META_KEY,
					'custom_field_value_list' => array(),
					'compare_operator'        => 'BETWEEN',
					'meta_type'               => 'NUMERIC',
				),
			);
		}

		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'label_show_icon' ) ) {
			if ( ! isset( $settings->label ) || ! is_object( $settings->label ) ) {
				$settings->label = new stdClass();
			}
			$settings->label->icons = (object) array(
				'visibility' => false,
				'icon'       => '',
				'type'       => 'icon',
				'position'   => 'before-label',
			);
		}

		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'filter_label_collapse' ) ) {
			$settings->enable_toggle = 'false';
			$settings->close_toggle  = 'false';
		}

		return $settings;
	}

	/**
	 * @return bool
	 */
	public static function is_woocommerce_available() {
		return class_exists( 'WooCommerce', false );
	}

	/**
	 * @return string
	 */
	public static function get_product_price_currency_symbol() {
		$symbol = function_exists( 'get_woocommerce_currency_symbol' ) ? get_woocommerce_currency_symbol() : '$';
		return self::decode_html_entities( (string) $symbol );
	}

	/**
	 * @param string $value Raw value.
	 * @return string
	 */
	public static function decode_html_entities( $value ) {
		$value = (string) $value;
		if ( '' === $value ) {
			return '';
		}
		return html_entity_decode( $value, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	}

	/**
	 * @return array{min: float, max: float}
	 */
	public static function get_product_price_bounds() {
		return self::compute_product_price_bounds();
	}

	/**
	 * @return array{min: float, max: float}
	 */
	protected static function compute_product_price_bounds() {
		$min = 0.0;
		$max = 1000.0;

		if ( ! class_exists( 'WooCommerce' ) ) {
			return array(
				'min' => $min,
				'max' => $max,
			);
		}

		global $wpdb;

		$lookup_table = $wpdb->prefix . 'wc_product_meta_lookup';
		$lookup_found = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $lookup_table ) );
		if ( $lookup_found === $lookup_table ) {
			$row = $wpdb->get_row(
				"SELECT MIN(min_price) AS min_price, MAX(max_price) AS max_price
				FROM {$lookup_table}
				WHERE min_price > 0 OR max_price > 0",
				ARRAY_A
			);
			if ( is_array( $row ) ) {
				if ( isset( $row['min_price'] ) && is_numeric( $row['min_price'] ) ) {
					$min = (float) $row['min_price'];
				}
				if ( isset( $row['max_price'] ) && is_numeric( $row['max_price'] ) ) {
					$max = (float) $row['max_price'];
				}
				if ( $max >= $min && $max > 0 ) {
					return array(
						'min' => floor( $min ),
						'max' => ceil( $max ),
					);
				}
			}
		}

		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT MIN(CAST(pm.meta_value AS DECIMAL(12,2))) AS min_price, MAX(CAST(pm.meta_value AS DECIMAL(12,2))) AS max_price
				FROM {$wpdb->postmeta} pm
				INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
				WHERE pm.meta_key = %s
				AND pm.meta_value <> ''
				AND p.post_type = %s
				AND p.post_status = %s",
				self::WOO_PRICE_META_KEY,
				'product',
				'publish'
			),
			ARRAY_A
		);

		if ( is_array( $row ) ) {
			if ( isset( $row['min_price'] ) && is_numeric( $row['min_price'] ) ) {
				$min = (float) $row['min_price'];
			}
			if ( isset( $row['max_price'] ) && is_numeric( $row['max_price'] ) ) {
				$max = (float) $row['max_price'];
			}
		}

		if ( $max < $min ) {
			$max = $min;
		}
		if ( $max <= 0 ) {
			$max = 1000.0;
		}

		return array(
			'min' => floor( $min ),
			'max' => ceil( $max ),
		);
	}

	/**
	 * @param object $settings Module settings.
	 * @return string
	 */
	public static function resolve_range_slider_meta_key_from_settings( $settings ) {
		if ( empty( $settings->custom_field_data ) ) {
			return '';
		}

		$data = $settings->custom_field_data;
		if ( is_array( $data ) && ! empty( $data[0] ) ) {
			$row = $data[0];
			if ( is_array( $row ) ) {
				$row = json_decode( wp_json_encode( $row ), false );
			}
			if ( is_object( $row ) && ! empty( $row->custom_field_key ) ) {
				$meta_key = trim( (string) $row->custom_field_key );
				return ( '' === $meta_key || '0' === $meta_key ) ? '' : $meta_key;
			}
		}

		if ( is_object( $data ) && ! empty( $data->custom_field_key ) ) {
			$meta_key = trim( (string) $data->custom_field_key );
			return ( '' === $meta_key || '0' === $meta_key ) ? '' : $meta_key;
		}

		return '';
	}

	/**
	 * @return array<int, string>
	 */
	public static function get_range_slider_meta_keys() {
		if ( ! self::is_woocommerce_available() ) {
			return array();
		}
		return array( self::WOO_PRICE_META_KEY );
	}

	/**
	 * @param string $meta_key Meta key.
	 * @return bool
	 */
	public static function is_allowed_builder_meta_key( $meta_key ) {
		return in_array( (string) $meta_key, self::get_range_slider_meta_keys(), true );
	}

	/**
	 * @param object $settings Module settings.
	 * @return bool
	 */
	public static function is_woo_price_slider_module( $settings ) {
		if ( ! self::is_woocommerce_available() || ! is_object( $settings ) ) {
			return false;
		}
		return self::WOO_PRICE_META_KEY === self::resolve_range_slider_meta_key_from_settings( $settings );
	}

	/**
	 * Whether a builder flag is enabled (supports "true"/true/1).
	 *
	 * @param mixed $value Raw flag.
	 * @return bool
	 */
	public static function is_setting_flag_enabled( $value ) {
		if ( true === $value || 1 === $value || '1' === $value ) {
			return true;
		}
		if ( is_string( $value ) && 'true' === strtolower( trim( $value ) ) ) {
			return true;
		}
		return false;
	}

	/**
	 * Whether a builder flag was explicitly disabled.
	 *
	 * @param mixed $value Raw flag.
	 * @return bool
	 */
	public static function is_setting_flag_disabled( $value ) {
		if ( false === $value || 0 === $value || '0' === $value ) {
			return true;
		}
		if ( is_string( $value ) && 'false' === strtolower( trim( $value ) ) ) {
			return true;
		}
		return false;
	}

	/**
	 * Seed currency/unit prefix only when unset — never override user toggle/value.
	 *
	 * @param object $slider        range_slider settings object.
	 * @param string $default_value Default prefix text (currency/unit).
	 * @return void
	 */
	public static function seed_range_slider_prefix_default( $slider, $default_value ) {
		if ( ! is_object( $slider ) ) {
			return;
		}
		if ( ! isset( $slider->prefix ) || ! is_object( $slider->prefix ) ) {
			$slider->prefix = new stdClass();
		}

		$default_value = self::decode_html_entities( (string) $default_value );
		$has_enable    = isset( $slider->prefix->is_enable );

		if ( ! $has_enable ) {
			$slider->prefix->is_enable = 'true';
			$slider->prefix->value     = $default_value;
			return;
		}

		if ( self::is_setting_flag_disabled( $slider->prefix->is_enable ) ) {
			$slider->prefix->is_enable = 'false';
			return;
		}

		if ( self::is_setting_flag_enabled( $slider->prefix->is_enable ) ) {
			$slider->prefix->is_enable = 'true';
			$prefix_value               = self::decode_html_entities(
				isset( $slider->prefix->value ) ? (string) $slider->prefix->value : ''
			);
			if ( '' === trim( $prefix_value ) || 'Prefix' === $prefix_value ) {
				$slider->prefix->value = $default_value;
			}
		}
	}

	/**
	 * Apply WooCommerce price slider defaults (_price meta + currency prefix).
	 * Min/max stay as saved settings; missing values default to 0–100 (no catalog scan).
	 *
	 * @param object $settings Module settings.
	 * @return object
	 */
	public static function apply_price_slider_defaults( $settings ) {
		if ( ! self::is_woocommerce_available() || ! is_object( $settings ) ) {
			return $settings;
		}

		if ( ! self::is_woo_price_slider_module( $settings ) ) {
			return $settings;
		}

		$currency = self::get_product_price_currency_symbol();

		if ( ! isset( $settings->custom_field_data ) || ! is_array( $settings->custom_field_data ) || empty( $settings->custom_field_data ) ) {
			$settings->custom_field_data = array(
				(object) array(
					'custom_field_key'        => self::WOO_PRICE_META_KEY,
					'custom_field_value_list' => array(),
					'compare_operator'        => 'BETWEEN',
					'meta_type'               => 'NUMERIC',
				),
			);
		} else {
			$first = $settings->custom_field_data[0];
			if ( is_array( $first ) ) {
				$first = (object) $first;
				$settings->custom_field_data[0] = $first;
			}
			if ( is_object( $first ) ) {
				$first->custom_field_key = self::WOO_PRICE_META_KEY;
				if ( empty( $first->compare_operator ) ) {
					$first->compare_operator = 'BETWEEN';
				}
				if ( empty( $first->meta_type ) ) {
					$first->meta_type = 'NUMERIC';
				}
			}
		}

		if ( ! isset( $settings->range_slider ) || ! is_object( $settings->range_slider ) ) {
			$settings->range_slider = new stdClass();
		}

		$slider = $settings->range_slider;

		if ( ! isset( $slider->min ) || ! is_numeric( $slider->min ) ) {
			$slider->min = 0;
		}
		if ( ! isset( $slider->max ) || ! is_numeric( $slider->max ) || (float) $slider->max <= 0 ) {
			$slider->max = 100;
		}
		if ( (float) $slider->max < (float) $slider->min ) {
			$slider->max = $slider->min;
		}

		if ( ! isset( $slider->step ) || ! is_numeric( $slider->step ) || (float) $slider->step <= 0 ) {
			$slider->step = 1;
		}

		self::seed_range_slider_prefix_default( $slider, $currency );

		$settings->range_slider = $slider;

		return $settings;
	}

	/**
	 * Meta query clause for range_slider defaults on initial page load.
	 *
	 * @param object $module_settings Module settings.
	 * @return array
	 */
	public static function build_range_slider_meta_query_for_page_load( $module_settings ) {
		if ( ! is_object( $module_settings ) ) {
			return array();
		}

		$module_settings = self::clamp_range_slider_settings_for_free( $module_settings );
		$meta_key        = self::resolve_range_slider_meta_key_from_settings( $module_settings );
		if ( '' === $meta_key ) {
			return array();
		}

		$cf_row    = null;
		$data      = $module_settings->custom_field_data;
		if ( is_array( $data ) && ! empty( $data[0] ) ) {
			$cf_row = is_object( $data[0] ) ? $data[0] : (object) $data[0];
		} elseif ( is_object( $data ) ) {
			$cf_row = $data;
		}
		$meta_type = ( $cf_row && isset( $cf_row->meta_type ) ) ? (string) $cf_row->meta_type : 'NUMERIC';

		$slider = isset( $module_settings->range_slider ) ? $module_settings->range_slider : new stdClass();
		$min    = isset( $slider->min ) ? (float) $slider->min : 0;
		$max    = isset( $slider->max ) ? (float) $slider->max : 100;
		$step   = isset( $slider->step ) ? (float) $slider->step : 1;
		$type   = isset( $slider->type ) ? sanitize_key( (string) $slider->type ) : 'double';
		if ( ! in_array( $type, array( 'single', 'double' ), true ) ) {
			$type = 'double';
		}

		if ( $max < $min ) {
			$tmp = $min;
			$min = $max;
			$max = $tmp;
		}
		if ( $step <= 0 ) {
			$step = 1;
		}

		$defaults_obj     = isset( $slider->default_values ) ? $slider->default_values : null;
		$defaults_enabled = true;
		if ( is_object( $defaults_obj ) && isset( $defaults_obj->is_enable ) ) {
			$defaults_enabled = ( 'true' === (string) $defaults_obj->is_enable );
		}

		if ( ! $defaults_enabled ) {
			return array();
		}

		$start_min = isset( $slider->start_min ) ? $slider->start_min : null;
		$start_max = isset( $slider->start_max ) ? $slider->start_max : null;
		$start_min = ( '' === $start_min || null === $start_min ) ? $min : (float) $start_min;
		$start_max = ( '' === $start_max || null === $start_max ) ? $max : (float) $start_max;
		$start_min = max( $min, min( $start_min, $max ) );
		$start_max = max( $min, min( $start_max, $max ) );
		if ( 'double' === $type && $start_min > $start_max ) {
			$start_max = $start_min;
		}

		if ( 'single' === $type ) {
			if ( $start_max === $max ) {
				return array();
			}
			return array(
				'key'     => $meta_key,
				'value'   => $start_max,
				'compare' => '<=',
				'type'    => $meta_type,
			);
		}

		if ( $start_min === $min && $start_max === $max ) {
			return array();
		}

		return array(
			'key'     => $meta_key,
			'value'   => array( $start_min, $start_max ),
			'compare' => 'BETWEEN',
			'type'    => $meta_type,
		);
	}

	/**
	 * Allow product layouts whenever WooCommerce is active.
	 *
	 * @param array<int, string> $excluded Excluded post types.
	 * @return array<int, string>
	 */
	public static function filter_excluded_post_types( $excluded ) {
		if ( ! class_exists( 'CAF_Builder_Tier' ) || ! CAF_Builder_Tier::can_use_product_post_type() ) {
			return $excluded;
		}

		return is_array( $excluded )
			? array_values( array_diff( $excluded, array( 'product' ) ) )
			: $excluded;
	}

	/**
	 * @param int $post_id Product ID.
	 * @return WC_Product|null
	 */
	public static function get_product( $post_id ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return null;
		}

		$product = wc_get_product( absint( $post_id ) );
		return $product instanceof WC_Product ? $product : null;
	}

	/**
	 * Product data used by the React preview.
	 *
	 * @param int $post_id Product ID.
	 * @return array<string, mixed>
	 */
	public static function get_preview_data( $post_id ) {
		$product = self::get_product( $post_id );
		if ( ! $product ) {
			return array();
		}

		return array(
			'price_html'       => $product->get_price_html(),
			'regular_price'    => $product->get_regular_price(),
			'sale_price'       => $product->get_sale_price(),
			'add_to_cart_text' => $product->add_to_cart_text(),
			'add_to_cart_url'  => $product->add_to_cart_url(),
			'is_purchasable'   => $product->is_purchasable(),
			'is_in_stock'      => $product->is_in_stock(),
			'is_on_sale'       => $product->is_on_sale(),
			'is_featured'      => $product->is_featured(),
			'stock_quantity'   => $product->get_stock_quantity(),
			'stock_status'     => $product->get_stock_status(),
			'sku'              => $product->get_sku(),
			'total_sales'      => $product->get_total_sales(),
			'date_created'     => $product->get_date_created() ? $product->get_date_created()->date( 'c' ) : '',
			'product_type'     => $product->get_type(),
			'product_id'       => $product->get_id(),
		);
	}

	/**
	 * Price data for the builder preview and frontend price module.
	 *
	 * Mirrors the Pro price data shape (currency, product_type, regular/sale
	 * price ranges) so the React preview and PHP render stay in sync.
	 *
	 * @param int $post_id Product ID.
	 * @return array<string, mixed>
	 */
	public static function get_price_data( $post_id ) {
		$post_id = absint( $post_id );
		if ( $post_id <= 0 || 'product' !== get_post_type( $post_id ) ) {
			return array();
		}

		$product = self::get_product( $post_id );
		if ( ! $product ) {
			return array();
		}

		$price_data = array(
			'currency'     => function_exists( 'get_woocommerce_currency_symbol' ) ? get_woocommerce_currency_symbol() : '$',
			'product_type' => $product->get_type(),
		);

		if ( self::is_variable_like_product( $product ) ) {
			$min_price     = $product->get_variation_regular_price( 'min' );
			$max_price     = $product->get_variation_regular_price( 'max' );
			$regular_price = '';

			if ( self::has_numeric_price_value( $min_price ) && self::has_numeric_price_value( $max_price ) ) {
				$regular_price               = ( (string) $min_price === (string) $max_price ) ? $min_price : $min_price . '-' . $max_price;
				$price_data['regular_price'] = $regular_price;
			}

			$min_sale_price = $product->get_variation_sale_price( 'min' );
			$max_sale_price = $product->get_variation_sale_price( 'max' );

			if ( self::has_numeric_price_value( $min_sale_price ) && self::has_numeric_price_value( $max_sale_price ) ) {
				$sale_price = ( (string) $min_sale_price === (string) $max_sale_price ) ? $min_sale_price : $min_sale_price . '-' . $max_sale_price;
				if ( (string) $sale_price !== (string) $regular_price ) {
					$price_data['sale_price'] = $sale_price;
				}
			}
		} elseif ( $product->is_type( 'grouped' ) ) {
			$regular_prices = array();
			$sale_prices    = array();

			foreach ( $product->get_children() as $child_id ) {
				$child_product = wc_get_product( $child_id );
				if ( ! $child_product ) {
					continue;
				}

				if ( self::is_variable_like_product( $child_product ) ) {
					$regular_prices[] = (float) $child_product->get_variation_regular_price( 'min' );
					$regular_prices[] = (float) $child_product->get_variation_regular_price( 'max' );

					$min_sale = $child_product->get_variation_sale_price( 'min' );
					$max_sale = $child_product->get_variation_sale_price( 'max' );
					if ( '' !== $min_sale && null !== $min_sale ) {
						$sale_prices[] = (float) $min_sale;
					}
					if ( '' !== $max_sale && null !== $max_sale ) {
						$sale_prices[] = (float) $max_sale;
					}
				} else {
					$child_regular = $child_product->get_regular_price();
					$child_sale    = $child_product->get_sale_price();
					if ( '' !== $child_regular && null !== $child_regular ) {
						$regular_prices[] = (float) $child_regular;
					}
					if ( '' !== $child_sale && null !== $child_sale ) {
						$sale_prices[] = (float) $child_sale;
					}
				}
			}

			$regular_price = '';
			if ( ! empty( $regular_prices ) ) {
				$min_regular                 = min( $regular_prices );
				$max_regular                 = max( $regular_prices );
				$regular_price               = ( $min_regular == $max_regular ) ? $min_regular : $min_regular . '-' . $max_regular;
				$price_data['regular_price'] = $regular_price;
			}

			if ( ! empty( $sale_prices ) ) {
				$min_sale_price = min( $sale_prices );
				$max_sale_price = max( $sale_prices );
				$sale_price     = ( $min_sale_price == $max_sale_price ) ? $min_sale_price : $min_sale_price . '-' . $max_sale_price;
				if ( (string) $sale_price !== (string) $regular_price ) {
					$price_data['sale_price'] = $sale_price;
				}
			}
		} else {
			$regular_price = $product->get_regular_price();
			if ( self::has_numeric_price_value( $regular_price ) ) {
				$price_data['regular_price'] = $regular_price;
			}
			if ( $product->is_on_sale() ) {
				$sale_price = $product->get_sale_price();
				if ( self::has_numeric_price_value( $sale_price ) ) {
					$price_data['sale_price'] = $sale_price;
				}
			}
		}

		return $price_data;
	}

	/**
	 * Render the free Product Image module (featured image only).
	 *
	 * Markup and link resolution mirror Pro's featured-image path.
	 *
	 * @param object $module       Module definition.
	 * @param int    $post_id      Product ID.
	 * @param string $fallback_url Fallback image.
	 * @return string
	 */
	public static function render_product_image( $module, $post_id, $fallback_url = '' ) {
		$settings   = isset( $module->settings ) && is_object( $module->settings ) ? $module->settings : new stdClass();
		$image_size = ! empty( $settings->image_size ) ? sanitize_key( $settings->image_size ) : 'medium_large';
		$fallback   = ! empty( $settings->placeholder_image )
			? (string) $settings->placeholder_image
			: (string) $fallback_url;

		$image_id  = absint( get_post_thumbnail_id( $post_id ) );
		$image_src = '';
		if ( $image_id > 0 ) {
			$sized = wp_get_attachment_image_src( $image_id, $image_size );
			if ( is_array( $sized ) && ! empty( $sized[0] ) ) {
				$image_src = (string) $sized[0];
			}
		}
		if ( '' === $image_src ) {
			$image_src = $fallback;
		}
		if ( '' === $image_src ) {
			return '';
		}

		$alt_text = '';
		if ( $image_id > 0 ) {
			$alt_text = (string) get_post_meta( $image_id, '_wp_attachment_image_alt', true );
		}
		if ( '' === trim( $alt_text ) ) {
			$alt_text = get_the_title( $post_id );
		}

		$onerror = '';
		if ( '' !== $fallback && $fallback !== $image_src ) {
			$onerror = ' onerror="this.onerror=null;this.src=\'' . esc_url( $fallback ) . '\';"';
		}

		$image_html = '<img src="' . esc_url( $image_src ) . '" alt="' . esc_attr( $alt_text ) . '" class="caf-post-img"' . $onerror . ' />';

		$link = isset( $settings->link ) && is_object( $settings->link ) ? $settings->link : new stdClass();
		if ( empty( $link->visibility ) || ! in_array( (string) $link->visibility, array( 'true', '1' ), true ) ) {
			return $image_html;
		}

		$url    = get_permalink( $post_id );
		$target = '_self';
		if ( ! empty( $link->type ) && 'custom-url' === (string) $link->type && ! empty( $link->customlink ) ) {
			$url = (string) $link->customlink;
		}
		if ( ! empty( $link->target ) && 'new-tab' === (string) $link->target ) {
			$target = '_blank';
		}

		return '<a href="' . esc_url( $url ) . '" target="' . esc_attr( $target ) . '">' . $image_html . '</a>';
	}

	/**
	 * Render the free Product Price module (default display mode with
	 * text / regular-price prefix and suffix; icon affixes are Pro-only).
	 *
	 * Markup mirrors the Pro renderer so shared builder CSS applies.
	 *
	 * @param object $module  Module definition.
	 * @param int    $post_id Product ID.
	 * @return string
	 */
	public static function render_product_price( $module, $post_id ) {
		$price_data = self::get_price_data( $post_id );
		if ( empty( $price_data ) ) {
			return '';
		}

		$main_price_text = self::format_main_price( $price_data );
		if ( '' === $main_price_text ) {
			return '';
		}

		$settings = isset( $module->settings ) && is_object( $module->settings ) ? $module->settings : new stdClass();
		$prefix   = isset( $settings->prefix ) && is_object( $settings->prefix ) ? $settings->prefix : new stdClass();
		$suffix   = isset( $settings->suffix ) && is_object( $settings->suffix ) ? $settings->suffix : new stdClass();

		$prefix_html = self::render_price_affix( $prefix, 'prefix', $price_data, $main_price_text );
		$suffix_html = self::render_price_affix( $suffix, 'suffix', $price_data, $main_price_text );
		$main_html   = '<div class="caf-builder-price-value price">' . esc_html( $main_price_text ) . '</div>';

		if ( '' === $suffix_html ) {
			$price_html = $prefix_html . $main_html;
		} elseif ( '' !== $prefix_html ) {
			$layout     = self::get_module_justify_content( isset( $module->style ) ? $module->style : null );
			$price_html = $prefix_html
				. '<div class="' . esc_attr( 'caf-builder-price-suffix-wrapper caf-layout-' . $layout ) . '">'
				. $main_html . $suffix_html
				. '</div>';
		} else {
			$price_html = $main_html . $suffix_html;
		}

		return $price_html;
	}

	/**
	 * Render a price prefix/suffix (text or regular price; icons are Pro-only).
	 *
	 * @param object               $affix_data      Affix settings.
	 * @param string               $type            prefix|suffix.
	 * @param array<string, mixed> $price_data      Price data.
	 * @param string               $main_price_text Formatted main price.
	 * @return string
	 */
	protected static function render_price_affix( $affix_data, $type, $price_data, $main_price_text ) {
		if ( ! is_object( $affix_data ) || ! isset( $affix_data->is_enable ) || 'true' !== (string) $affix_data->is_enable ) {
			return '';
		}

		$wrapper_class = 'prefix' === $type ? 'caf-builder-prefix-col' : 'caf-builder-suffix-col';
		$meta_type     = isset( $affix_data->meta_type ) ? (string) $affix_data->meta_type : 'text';
		$content       = '';

		if ( 'icon' === $meta_type ) {
			// Icon affixes are Pro-only.
			return '';
		}

		if ( 'regular_price' === $meta_type ) {
			if ( ! self::should_show_regular_price_affix( $price_data, $main_price_text ) ) {
				return '';
			}
			$regular_price = self::format_affix_regular_price( $price_data );
			$content       = '' !== $regular_price ? esc_html( $regular_price ) : '';
		} else {
			$product_type = isset( $price_data['product_type'] ) ? (string) $price_data['product_type'] : '';
			$text_visibility = isset( $affix_data->text_visibility )
				? (string) $affix_data->text_visibility
				: 'all';
			if ( ! self::should_show_affix_text_by_visibility( $product_type, $text_visibility ) ) {
				return '';
			}
			$only_group = isset( $affix_data->show_only_group_variable ) && 'true' === (string) $affix_data->show_only_group_variable;
			if ( $only_group && ! self::is_variable_or_grouped_type( $product_type ) ) {
				return '';
			}
			$content = isset( $affix_data->meta_text ) ? wp_kses_post( (string) $affix_data->meta_text ) : '';
		}

		if ( '' === $content ) {
			return '';
		}

		// Match React ModuleProductPrice wrappers (div) so builder CSS applies.
		return '<div class="' . esc_attr( $wrapper_class ) . '">' . $content . '</div>';
	}

	/**
	 * Format the main display price (mirrors Pro default / WooCommerce Default mode).
	 *
	 * @param array<string, mixed> $price_data Price data.
	 * @return string
	 */
	protected static function format_main_price( $price_data ) {
		if ( empty( $price_data ) || ! is_array( $price_data ) ) {
			return '';
		}

		$currency     = self::decode_currency( isset( $price_data['currency'] ) ? $price_data['currency'] : '' );
		$product_type = isset( $price_data['product_type'] ) ? (string) $price_data['product_type'] : '';

		// Simple + subscription: sale → regular (same as ModuleProductPrice.js).
		if ( ! self::is_variable_or_grouped_type( $product_type ) ) {
			$sale = self::format_price_amount_with_currency( isset( $price_data['sale_price'] ) ? $price_data['sale_price'] : '', $currency );
			if ( '' !== $sale ) {
				return self::maybe_append_subscription_period( $sale, $price_data );
			}

			$regular = self::format_price_amount_with_currency( isset( $price_data['regular_price'] ) ? $price_data['regular_price'] : '', $currency );
			return self::maybe_append_subscription_period( $regular, $price_data );
		}

		// Variable / grouped: prefer sale range, else regular range.
		$amount = '';
		if ( isset( $price_data['sale_price'] ) && self::has_numeric_price_value( $price_data['sale_price'] ) ) {
			$amount = (string) $price_data['sale_price'];
		} elseif ( isset( $price_data['regular_price'] ) && self::has_numeric_price_value( $price_data['regular_price'] ) ) {
			$amount = (string) $price_data['regular_price'];
		}

		$formatted = self::format_price_amount_with_currency( $amount, $currency );
		return self::maybe_append_subscription_period( $formatted, $price_data );
	}

	/**
	 * Whether a Woo price value is usable (Woo often returns false for empty prices).
	 *
	 * @param mixed $value Raw price value.
	 * @return bool
	 */
	protected static function has_numeric_price_value( $value ) {
		return null !== $value && false !== $value && '' !== $value;
	}

	/**
	 * @param WC_Product $product Product.
	 * @return bool
	 */
	protected static function is_variable_like_product( $product ) {
		return $product instanceof WC_Product
			&& ( $product->is_type( 'variable' ) || $product->is_type( 'variable-subscription' ) );
	}

	/**
	 * Format the regular price used by prefix/suffix affixes.
	 *
	 * @param array<string, mixed> $price_data Price data.
	 * @return string
	 */
	protected static function format_affix_regular_price( $price_data ) {
		if ( empty( $price_data ) || ! is_array( $price_data ) ) {
			return '';
		}

		$currency = self::decode_currency( isset( $price_data['currency'] ) ? $price_data['currency'] : '' );
		return self::format_price_amount_with_currency( isset( $price_data['regular_price'] ) ? $price_data['regular_price'] : '', $currency );
	}

	/**
	 * Whether the regular-price affix should render (only for on-sale products
	 * and only when it differs from the main price).
	 *
	 * @param array<string, mixed> $price_data      Price data.
	 * @param string               $main_price_text Formatted main price.
	 * @return bool
	 */
	protected static function should_show_regular_price_affix( $price_data, $main_price_text ) {
		$has_sale = isset( $price_data['sale_price'] ) && self::has_numeric_price_value( $price_data['sale_price'] );
		if ( ! $has_sale ) {
			return false;
		}

		$affix_price = self::format_affix_regular_price( $price_data );
		$main_cmp    = preg_replace( '/\s*\/\s*Year$/u', '', (string) $main_price_text );
		$main_cmp    = is_string( $main_cmp ) ? $main_cmp : '';

		if ( '' !== $affix_price && '' !== $main_cmp && $affix_price === $main_cmp ) {
			return false;
		}

		return true;
	}

	/**
	 * @param string $product_type    Product type.
	 * @param string $text_visibility all|simple_products|variable_products|grouped_products.
	 * @return bool
	 */
	protected static function should_show_affix_text_by_visibility( $product_type, $text_visibility ) {
		$visibility = sanitize_key( (string) $text_visibility );
		if ( '' === $visibility || 'all' === $visibility ) {
			return true;
		}
		if ( 'simple_products' === $visibility ) {
			return 'simple' === $product_type;
		}
		if ( 'variable_products' === $visibility ) {
			return 'variable' === $product_type;
		}
		if ( 'grouped_products' === $visibility ) {
			return 'grouped' === $product_type;
		}
		return true;
	}

	/**
	 * @param string $product_type Product type.
	 * @return bool
	 */
	protected static function is_variable_or_grouped_type( $product_type ) {
		return in_array( (string) $product_type, array( 'variable', 'variable-subscription', 'grouped' ), true );
	}

	/**
	 * @param mixed  $amount   Raw amount or hyphenated range.
	 * @param string $currency Currency symbol.
	 * @return string
	 */
	protected static function format_price_amount_with_currency( $amount, $currency ) {
		if ( ! self::has_numeric_price_value( $amount ) ) {
			return '';
		}

		$amount = (string) $amount;
		$parts  = array_values(
			array_filter(
				array_map( 'trim', explode( '-', $amount ) ),
				static function ( $part ) {
					return '' !== $part;
				}
			)
		);

		$low  = isset( $parts[0] ) ? $parts[0] : '';
		$high = isset( $parts[ count( $parts ) - 1 ] ) ? $parts[ count( $parts ) - 1 ] : $low;

		if ( count( $parts ) > 1 && '' !== $low && '' !== $high && $low !== $high ) {
			return $currency . $low . '-' . $currency . $high;
		}

		return $currency . $amount;
	}

	/**
	 * @param string               $price_text Price text.
	 * @param array<string, mixed> $price_data Price data.
	 * @return string
	 */
	protected static function maybe_append_subscription_period( $price_text, $price_data ) {
		if ( '' === $price_text ) {
			return '';
		}

		$type = isset( $price_data['product_type'] ) ? (string) $price_data['product_type'] : '';
		if ( in_array( $type, array( 'subscription', 'variable-subscription' ), true ) ) {
			return $price_text . ' / Year';
		}

		return $price_text;
	}

	/**
	 * @param mixed $currency Currency symbol possibly HTML-encoded.
	 * @return string
	 */
	protected static function decode_currency( $currency ) {
		return html_entity_decode( (string) $currency, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	}

	/**
	 * Read the module justify-content used for the suffix wrapper layout class.
	 *
	 * @param object|null $style Module style object.
	 * @return string
	 */
	protected static function get_module_justify_content( $style ) {
		if ( empty( $style ) || ! is_object( $style ) ) {
			return 'flex-start';
		}

		if ( isset( $style->desktop->default->justifyContent ) && is_string( $style->desktop->default->justifyContent ) ) {
			$justify = sanitize_key( (string) $style->desktop->default->justifyContent );
			return '' !== $justify ? $justify : 'flex-start';
		}

		return 'flex-start';
	}

	/**
	 * Render the free Add to Cart module (Open Product Page only).
	 *
	 * Ajax add to cart and prefix/suffix are Pro-only.
	 *
	 * @param object $module  Module definition.
	 * @param int    $post_id Product ID.
	 * @return string
	 */
	public static function render_add_to_cart( $module, $post_id ) {
		$product = self::get_product( $post_id );
		if ( ! $product ) {
			return '';
		}

		$settings    = isset( $module->settings ) && is_object( $module->settings ) ? $module->settings : new stdClass();
		$link_data   = isset( $settings->link ) && is_object( $settings->link ) ? $settings->link : new stdClass();
		$button_text = self::resolve_add_to_cart_button_text( $product, $settings );
		if ( '' === trim( (string) $button_text ) ) {
			$button_text = $product->add_to_cart_text();
		}

		$main_html = '<span class="caf-builder-button-value">' . esc_html( $button_text ) . '</span>';
		$classes   = array(
			'button',
			'product_type_' . $product->get_type(),
			'caf-woo-add-to-cart-button',
		);

		$url    = get_permalink( $post_id );
		$target = ! empty( $link_data->target ) && 'new-tab' === $link_data->target ? '_blank' : '_self';

		$attributes = array(
			'href'                   => esc_url( $url ),
			'class'                  => esc_attr( implode( ' ', array_map( 'sanitize_html_class', $classes ) ) ),
			'target'                 => esc_attr( $target ),
			'data-product_id'        => esc_attr( (string) $product->get_id() ),
			'data-product_sku'       => esc_attr( (string) $product->get_sku() ),
			'data-caf-atc-behaviour' => 'product_page',
			'data-caf-after-atc'     => 'none',
			'data-caf-after-atc-text'=> esc_attr( __( 'Added', 'category-ajax-filter' ) ),
			'aria-label'             => esc_attr( wp_strip_all_tags( $product->add_to_cart_description() ) ),
			'rel'                    => 'nofollow',
		);

		$attr_html = '';
		foreach ( $attributes as $attr_key => $attr_value ) {
			$attr_html .= sprintf( ' %s="%s"', $attr_key, $attr_value );
		}

		$link_html = '<a' . $attr_html . '>' . $main_html . '</a>';

		/**
		 * Allow themes/plugins to filter the free product-page add-to-cart link
		 * (same hook WooCommerce uses in loops).
		 *
		 * @param string     $link_html  Anchor HTML.
		 * @param WC_Product $product    Product.
		 * @param array      $args       Loop args.
		 */
		return (string) apply_filters(
			'woocommerce_loop_add_to_cart_link',
			$link_html,
			$product,
			array(
				'quantity'   => 1,
				'class'      => implode( ' ', $classes ),
				'attributes' => array(
					'data-product_id'  => $product->get_id(),
					'data-product_sku' => $product->get_sku(),
					'aria-label'       => wp_strip_all_tags( $product->add_to_cart_description() ),
					'rel'              => 'nofollow',
				),
			)
		);
	}

	/**
	 * Resolve free Add to Cart button label (no Ajax / icon-only path).
	 *
	 * @param WC_Product $product  Product.
	 * @param object     $settings Module settings.
	 * @return string
	 */
	protected static function resolve_add_to_cart_button_text( $product, $settings ) {
		$text_mode = isset( $settings->button_text_mode ) ? sanitize_key( (string) $settings->button_text_mode ) : 'woo_default';
		if ( ! in_array( $text_mode, array( 'woo_default', 'custom', 'by_product_type' ), true ) ) {
			$text_mode = 'woo_default';
		}

		if ( 'custom' === $text_mode ) {
			$custom = isset( $settings->changeButtonValue ) ? trim( (string) $settings->changeButtonValue ) : '';
			return '' !== $custom ? $custom : $product->add_to_cart_text();
		}

		if ( 'by_product_type' === $text_mode ) {
			$type_bucket  = 'simple';
			$product_type = $product->get_type();
			if ( 'grouped' === $product_type ) {
				$type_bucket = 'grouped';
			} elseif ( in_array( $product_type, array( 'external', 'affiliate' ), true ) ) {
				$type_bucket = 'external';
			} elseif ( in_array( $product_type, array( 'subscription', 'variable-subscription' ), true ) ) {
				$type_bucket = 'subscription';
			} elseif ( false !== strpos( $product_type, 'variable' ) ) {
				$type_bucket = 'variable';
			}

			$defaults = array(
				'simple'       => __( 'Add to cart', 'category-ajax-filter' ),
				'variable'     => __( 'Select options', 'category-ajax-filter' ),
				'grouped'      => __( 'View products', 'category-ajax-filter' ),
				'external'     => __( 'Buy product', 'category-ajax-filter' ),
				'subscription' => __( 'Subscribe', 'category-ajax-filter' ),
			);

			$by_type = array();
			if ( ! empty( $settings->button_text_by_type ) && ( is_array( $settings->button_text_by_type ) || is_object( $settings->button_text_by_type ) ) ) {
				$by_type = (array) $settings->button_text_by_type;
			}

			$label = isset( $by_type[ $type_bucket ] ) ? trim( (string) $by_type[ $type_bucket ] ) : '';
			if ( '' === $label ) {
				$label = isset( $defaults[ $type_bucket ] ) ? $defaults[ $type_bucket ] : $product->add_to_cart_text();
			}

			return $label;
		}

		return $product->add_to_cart_text();
	}

	/**
	 * Render the free Badges module (New and Sale; no prefix/suffix).
	 *
	 * @param object $module  Module definition.
	 * @param int    $post_id Product ID.
	 * @return string
	 */
	public static function render_badges( $module, $post_id ) {
		$product = self::get_product( $post_id );
		if ( ! $product ) {
			return '';
		}

		$settings   = isset( $module->settings ) && is_object( $module->settings ) ? $module->settings : new stdClass();
		$badge_type = isset( $settings->badge_type ) ? sanitize_key( (string) $settings->badge_type ) : 'new';
		// Free supports New and Sale; other types are Pro-only.
		if ( 'new' !== $badge_type && 'sale' !== $badge_type ) {
			return '';
		}

		if ( 'sale' === $badge_type ) {
			if ( ! $product->is_on_sale() ) {
				return '';
			}
			$badge_text = self::resolve_sale_badge_text( $settings );
		} else {
			if ( ! self::is_new_product( $product, $settings ) ) {
				return '';
			}
			$badge_text = self::resolve_new_badge_text( $settings );
		}

		if ( '' === trim( (string) $badge_text ) ) {
			return '';
		}

		return '<span class="caf-builder-badges-value">' . esc_html( $badge_text ) . '</span>';
	}

	/**
	 * @param WC_Product $product  Product.
	 * @param object     $settings Module settings.
	 * @return bool
	 */
	protected static function is_new_product( $product, $settings ) {
		$created = $product->get_date_created();
		if ( ! $created ) {
			return false;
		}

		$created_timestamp = $created->getTimestamp();
		if ( $created_timestamp <= 0 ) {
			return false;
		}

		$days_limit = self::resolve_badge_new_days( $settings );
		$days_old   = ( time() - $created_timestamp ) / DAY_IN_SECONDS;
		return $days_old >= 0 && $days_old <= $days_limit;
	}

	/**
	 * @param object $settings Module settings.
	 * @return int
	 */
	protected static function resolve_badge_new_days( $settings ) {
		$new_settings = self::get_badge_type_settings( $settings, 'new' );
		$condition    = isset( $new_settings->condition ) ? (string) $new_settings->condition : 'default';
		if ( 'days' === $condition ) {
			$days = isset( $new_settings->days ) ? absint( $new_settings->days ) : 30;
			return $days > 0 ? $days : 30;
		}
		return 30;
	}

	/**
	 * @param object $settings Module settings.
	 * @return string
	 */
	protected static function resolve_new_badge_text( $settings ) {
		$new_settings = self::get_badge_type_settings( $settings, 'new' );
		$text_source  = isset( $new_settings->text_source ) && 'custom_text' === (string) $new_settings->text_source
			? 'custom_text'
			: 'default';

		if ( 'custom_text' === $text_source ) {
			$custom_text = isset( $new_settings->custom_text ) ? trim( (string) $new_settings->custom_text ) : '';
			return '' !== $custom_text ? $custom_text : __( 'New', 'category-ajax-filter' );
		}

		return __( 'New', 'category-ajax-filter' );
	}

	/**
	 * Resolve sale badge label from module settings.
	 *
	 * @param object $settings Module settings.
	 * @return string
	 */
	protected static function resolve_sale_badge_text( $settings ) {
		$sale_settings = self::get_badge_type_settings( $settings, 'sale' );
		$text_source   = isset( $sale_settings->text_source ) && 'custom_text' === (string) $sale_settings->text_source
			? 'custom_text'
			: 'default';

		if ( 'custom_text' === $text_source ) {
			$custom_text = isset( $sale_settings->custom_text ) ? trim( (string) $sale_settings->custom_text ) : '';
			return '' !== $custom_text ? $custom_text : __( 'Sale', 'category-ajax-filter' );
		}

		return __( 'Sale', 'category-ajax-filter' );
	}

	/**
	 * @param object $settings   Module settings.
	 * @param string $badge_type Badge type key.
	 * @return object
	 */
	protected static function get_badge_type_settings( $settings, $badge_type ) {
		if ( ! is_object( $settings ) || empty( $settings->badge_settings ) || ! is_object( $settings->badge_settings ) ) {
			return new stdClass();
		}
		if ( empty( $settings->badge_settings->{$badge_type} ) || ! is_object( $settings->badge_settings->{$badge_type} ) ) {
			return new stdClass();
		}
		return $settings->badge_settings->{$badge_type};
	}
}

CAF_Free_Woo::init();

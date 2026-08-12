<?php
/**
 * Frontend Builder Data Handler
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Normalize a frontend media URL scheme to match the current request (HTTPS/HTTP).
 * Prevents mixed-content when baked placeholders or WP URLs are http on https pages.
 *
 * @param mixed $url Candidate media URL.
 * @return string
 */
function caf_normalize_frontend_media_url( $url ) {
	if ( ! is_string( $url ) ) {
		return '';
	}

	$url = trim( $url );
	if ( '' === $url || '#' === $url ) {
		return $url;
	}

	// Relative paths (not protocol-relative) — leave as-is.
	if ( 0 === strpos( $url, '/' ) && 0 !== strpos( $url, '//' ) ) {
		/**
		 * Filter normalized frontend media URL.
		 *
		 * @param string $url Media URL.
		 */
		return (string) apply_filters( 'caf_normalize_frontend_media_url', $url );
	}

	$is_absolute =
		0 === stripos( $url, 'http://' )
		|| 0 === stripos( $url, 'https://' )
		|| 0 === strpos( $url, '//' );

	if ( $is_absolute && function_exists( 'set_url_scheme' ) ) {
		$scheme = ( function_exists( 'is_ssl' ) && is_ssl() ) ? 'https' : 'http';
		$url    = set_url_scheme( $url, $scheme );
	}

	/**
	 * Filter normalized frontend media URL.
	 *
	 * @param string $url Media URL.
	 */
	return (string) apply_filters( 'caf_normalize_frontend_media_url', $url );
}

class CAF_Builder_Data {

	/**
	 * Raw builder data.
	 *
	 * @var object
	 */
	protected $builder_data;

	/**
	 * Shortcode index.
	 *
	 * @var int
	 */
	protected $short_index = 1;

	/**
	 * Constructor.
	 *
	 * @param object $builder_data Raw builder data.
	 * @param int    $short_index  Shortcode index.
	 */
	public function __construct( $builder_data, $short_index = 1 ) {
		$this->builder_data = is_object( $builder_data ) ? $builder_data : new stdClass();
		$this->short_index  = absint( $short_index );
	}

	/**
	 * Get raw builder data.
	 *
	 * @return object
	 */
	public function get_builder_data() {
		return $this->builder_data;
	}

	/**
	 * Get shortcode index.
	 *
	 * @return int
	 */
	public function get_short_index() {
		return $this->short_index;
	}

	/**
	 * Get unique wrapper class for this shortcode instance.
	 *
	 * @return string
	 */
	public function get_instance_class() {
		return 'caf-builder-instance-' . $this->short_index;
	}

	/**
	 * Get common data.
	 *
	 * @return object
	 */
	public function get_common_data() {
		return isset( $this->builder_data->common_data ) && is_object( $this->builder_data->common_data )
			? $this->builder_data->common_data
			: new stdClass();
	}

	/**
	 * Get filter layout data.
	 *
	 * @return object
	 */
	public function get_filter_layout_data() {
		return isset( $this->builder_data->filter_layout_data ) && is_object( $this->builder_data->filter_layout_data )
			? $this->builder_data->filter_layout_data
			: new stdClass();
	}

	/**
	 * Get post layout data.
	 *
	 * @return object
	 */
	public function get_post_layout_data() {
		return isset( $this->builder_data->post_layout_data ) && is_object( $this->builder_data->post_layout_data )
			? $this->builder_data->post_layout_data
			: new stdClass();
	}

	/**
	 * Get preview template data.
	 *
	 * @return object
	 */
	public function get_preview_data() {
		$common_data = $this->get_common_data();

		return isset( $common_data->preview_template_data ) && is_object( $common_data->preview_template_data )
			? $common_data->preview_template_data
			: new stdClass();
	}

	/**
	 * Get misc preview data.
	 *
	 * @return object
	 */
	public function get_misc_preview_data() {
		$preview_data = $this->get_preview_data();

		return isset( $preview_data->misc_preview_data ) && is_object( $preview_data->misc_preview_data )
			? $preview_data->misc_preview_data
			: new stdClass();
	}

	/**
	 * Get misc preview extra settings (post grid defaults).
	 *
	 * @return object
	 */
	public function get_misc_extra_data() {
		$misc_preview_data = $this->get_misc_preview_data();

		return isset( $misc_preview_data->extra ) && is_object( $misc_preview_data->extra )
			? $misc_preview_data->extra
			: new stdClass();
	}

	/**
	 * Default orderby from post grid settings.
	 *
	 * @return string
	 */
	public function get_default_sort_orderby() {
		$extra   = $this->get_misc_extra_data();
		$orderby = isset( $extra->orderby ) ? sanitize_key( (string) $extra->orderby ) : '';

		return '' !== $orderby ? $orderby : 'title';
	}

	/**
	 * Default order direction from post grid settings.
	 *
	 * @return string
	 */
	public function get_default_sort_order() {
		$extra = $this->get_misc_extra_data();
		$order = isset( $extra->order ) ? strtoupper( sanitize_text_field( (string) $extra->order ) ) : '';

		return in_array( $order, array( 'ASC', 'DESC' ), true ) ? $order : 'ASC';
	}

	/**
	 * Remove placeholder sorting so WP_Query uses WordPress core defaults.
	 *
	 * @param array $args Query args.
	 * @return array
	 */
	public function strip_placeholder_sort_from_query_args( $args ) {
		if ( ! is_array( $args ) ) {
			return array();
		}

		if ( empty( $args['orderby'] ) || '0' === (string) $args['orderby'] ) {
			unset( $args['orderby'] );
		}

		if ( empty( $args['order'] ) || '0' === (string) $args['order'] ) {
			unset( $args['order'] );
		}

		return $args;
	}

	/**
	 * Apply post grid default sort when query args omit sorting (initial page load only).
	 *
	 * @param array $args Query args.
	 * @return array
	 */
	public function apply_default_sort_to_query_args( $args ) {
		if ( ! is_array( $args ) ) {
			$args = array();
		}

		if ( empty( $args['orderby'] ) || '0' === (string) $args['orderby'] ) {
			$args['orderby'] = $this->get_default_sort_orderby();
		}

		if ( empty( $args['order'] ) || '0' === (string) $args['order'] ) {
			$args['order'] = $this->get_default_sort_order();
		}

		return $args;
	}

	/**
	 * Get filter preview data.
	 *
	 * @return object
	 */
	public function get_filter_preview_data() {
		$preview_data = $this->get_preview_data();

		return isset( $preview_data->filter_preview_data ) && is_object( $preview_data->filter_preview_data )
			? $preview_data->filter_preview_data
			: new stdClass();
	}

	/**
	 * Get post preview data.
	 *
	 * @return object
	 */
	public function get_post_preview_data() {
		$preview_data = $this->get_preview_data();

		return isset( $preview_data->post_preview_data ) && is_object( $preview_data->post_preview_data )
			? $preview_data->post_preview_data
			: new stdClass();
	}

	/**
	 * Get filter layout extra data.
	 *
	 * @return object
	 */
	public function get_filter_layout_extra_data() {
		$filter_layout_data = $this->get_filter_layout_data();

		return isset( $filter_layout_data->extra_data ) && is_object( $filter_layout_data->extra_data )
			? $filter_layout_data->extra_data
			: new stdClass();
	}

	/**
	 * Get filter layout initial loop data.
	 *
	 * @return array
	 */
	public function get_filter_layout_loop_data() {
		$filter_layout_data = $this->get_filter_layout_data();
		return isset( $filter_layout_data->initial_data ) && is_array( $filter_layout_data->initial_data )
			? $filter_layout_data->initial_data
			: array();
	}

	/**
	 * Get post layout extra data.
	 *
	 * @return object
	 */
	public function get_post_layout_extra_data() {
		$post_layout_data = $this->get_post_layout_data();

		return isset( $post_layout_data->extra_data ) && is_object( $post_layout_data->extra_data )
			? $post_layout_data->extra_data
			: new stdClass();
	}

	/**
	 * Listing target derived from post layout_source (caf_builder | main_query).
	 *
	 * @return string
	 */
	public function get_listing_target() {
		$extra  = $this->get_post_layout_extra_data();
		$source = isset( $extra->layout_source ) ? sanitize_key( (string) $extra->layout_source ) : 'caf_builder';
		return 'main_query' === $source ? 'main_query' : 'caf';
	}

	/**
	 * Whether filters drive the page main query instead of CAF posts.
	 *
	 * @return bool
	 */
	public function is_main_query_listing() {
		$extra  = $this->get_post_layout_extra_data();
		$source = isset( $extra->layout_source ) ? sanitize_key( (string) $extra->layout_source ) : 'caf_builder';
		return 'main_query' === $source;
	}

	/**
	 * Optional CSS selector for external results container.
	 *
	 * @return string
	 */
	public function get_results_selector() {
		$extra    = $this->get_post_layout_extra_data();
		$selector = isset( $extra->results_selector )
			? sanitize_text_field( (string) $extra->results_selector )
			: '';
		if ( '' === trim( $selector ) && $this->is_main_query_listing() ) {
			return 'ul.products';
		}
		return $selector;
	}

	/**
	 * Get post layout initial loop data.
	 *
	 * @return array
	 */
	public function get_post_layout_loop_data() {
		$post_layout_data = $this->get_post_layout_data();

		return isset( $post_layout_data->initial_data ) && is_array( $post_layout_data->initial_data )
			? $post_layout_data->initial_data
			: array();
	}

	/**
	 * Get filter query data.
	 *
	 * @return object
	 */
	public function get_filter_query_data() {
		$filter_layout_data = $this->get_filter_layout_data();

		return isset( $filter_layout_data->filter_query_data ) && is_object( $filter_layout_data->filter_query_data )
			? $filter_layout_data->filter_query_data
			: new stdClass();
	}

	/**
	 * Get misc container data.
	 *
	 * @return object
	 */
	public function get_misc_container_data() {
		$misc_preview_data = $this->get_misc_preview_data();

		return isset( $misc_preview_data->container ) && is_object( $misc_preview_data->container )
			? $misc_preview_data->container
			: new stdClass();
	}

	/**
	 * Get misc loader data.
	 *
	 * @return object
	 */
	public function get_misc_loader_data() {
		$misc_preview_data = $this->get_misc_preview_data();

		return isset( $misc_preview_data->loader ) && is_object( $misc_preview_data->loader )
			? $misc_preview_data->loader
			: new stdClass();
	}

	/**
	 * Get misc pagination data.
	 *
	 * @return object
	 */
	public function get_misc_pagination_data() {
		$misc_preview_data = $this->get_misc_preview_data();
		return isset( $misc_preview_data->pagination ) && is_object( $misc_preview_data->pagination )
			? $misc_preview_data->pagination
			: new stdClass();
	}
	/**
	 * Get misc pagination data New.
	 *
	 * @return object
	 */
	public function get_misc_pagination() {
		$misc_preview_data = $this->get_misc_preview_data();
		$pagination_data   = array();
		if ( ! empty( $misc_preview_data->dnd_column_data ) && is_array( $misc_preview_data->dnd_column_data ) ) {
			foreach ( $misc_preview_data->dnd_column_data as $column ) {
				if ( empty( $column->data ) || ! is_array( $column->data ) ) {
					continue;
				}

				foreach ( $column->data as $item ) {
					if (
						! empty( $item->key ) &&
						'pagination' === $item->key &&
						! empty( $item->settings->is_enable ) &&
						'true' === $item->settings->is_enable
					) {
						$pagination_data = $item;
						break 2;
					}
				}
			}
		}
		return $pagination_data;
	}

	/**
	 * Get post type.
	 *
	 * @return string
	 */
	public function get_post_type() {
		$common_data = $this->get_common_data();

		return isset( $common_data->post_type ) ? sanitize_key( $common_data->post_type ) : 'post';
	}

	/**
	 * Whether the layout post type is registered and queryable on this site.
	 *
	 * @return bool
	 */
	public function is_post_type_available() {
		$post_type = $this->get_post_type();
		if ( function_exists( 'caf_builder_layout_post_type_is_queryable' ) ) {
			return caf_builder_layout_post_type_is_queryable( $post_type );
		}

		return '' !== $post_type && post_type_exists( $post_type );
	}

	/**
	 * Get dummy image URL.
	 *
	 * @return string
	 */
	public function get_dummy_image_url() {
		$url = defined( 'TC_CAF_URL' ) ? TC_CAF_URL . 'assets/unnamed.jpg' : '';
		return function_exists( 'caf_normalize_frontend_media_url' )
			? caf_normalize_frontend_media_url( $url )
			: $url;
	}

	/**
	 * Check whether filter area is enabled.
	 *
	 * @return bool
	 */
	public function has_filters() {
		$extra_data = $this->get_filter_layout_extra_data();

		return isset( $extra_data->filter_type ) && 'true' === $extra_data->filter_type;
	}

	/**
	 * Get filter position class.
	 *
	 * @return string
	 */
	public function get_filter_position_class() {
		if ( ! $this->has_filters() ) {
			return '';
		}

		$filter_preview_data = $this->get_filter_preview_data();

		if ( empty( $filter_preview_data->filter_placement ) ) {
			return '';
		}

		switch ( $filter_preview_data->filter_placement ) {
			case 'top':
				return 'filter-position-top';

			case 'left':
				return 'filter-position-left';

			case 'right':
				return 'filter-position-right';

			default:
				return '';
		}
	}

	/**
	 * Get wrapper classes.
	 *
	 * @return array
	 */
	public function get_wrapper_classes() {
		$classes   = array();
		$classes[] = 'caf-builder-container';
		$classes[] = $this->get_instance_class();

		$filter_position_class = $this->get_filter_position_class();
		if ( ! empty( $filter_position_class ) ) {
			$classes[] = $filter_position_class;
		}

		$post_extra    = $this->get_post_layout_extra_data();
		$layout_source = isset( $post_extra->layout_source )
			? sanitize_key( (string) $post_extra->layout_source )
			: 'caf_builder';
		if ( 'caf_builder' !== $layout_source ) {
			$classes[] = 'caf-filter-only';
			$classes[] = 'caf-layout-source-' . sanitize_html_class( $layout_source );
		}

		$container_data = $this->get_misc_container_data();
		if ( ! empty( $container_data->custom_class ) ) {
			$classes[] = sanitize_html_class( $container_data->custom_class );
		}

		return array_filter( $classes );
	}

	/**
	 * Whether SEO filter URLs are enabled for this layout instance.
	 *
	 * @return bool
	 */
	protected function is_filter_urls_enabled() {
		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'filter_url' ) ) {
			return false;
		}

		$common = $this->get_common_data();
		if ( ! isset( $common->filter_url_enabled ) ) {
			return false;
		}

		$raw = $common->filter_url_enabled;
		if ( true === $raw || 1 === $raw || '1' === $raw ) {
			return true;
		}

		return 'true' === strtolower( (string) $raw );
	}

	/**
	 * Whether ItemList schema is enabled for this layout instance.
	 *
	 * @return bool
	 */
	protected function is_schema_enabled() {
		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'schema' ) ) {
			return false;
		}

		$common = $this->get_common_data();
		if ( ! isset( $common->schema_enabled ) ) {
			return false;
		}

		$raw = $common->schema_enabled;
		if ( true === $raw || 1 === $raw || '1' === $raw ) {
			return true;
		}

		return 'true' === strtolower( (string) $raw );
	}

	/**
	 * Get wrapper attributes for frontend container.
	 *
	 * @return array
	 */
	public function get_wrapper_attributes() {
		$misc_loader_data         = $this->get_misc_loader_data();
		$misc_pagination_data     = $this->get_misc_pagination_data();
		$filter_layout_extra_data = $this->get_filter_layout_extra_data();
		$misc_pagination          = $this->get_misc_pagination();
		$taxonomy_relation        = isset( $filter_layout_extra_data->taxonomy_relation ) ? $filter_layout_extra_data->taxonomy_relation : '';

		$attributes = array(
			'class'             => implode( ' ', $this->get_wrapper_classes() ),
			'loader-status'     => isset( $misc_loader_data->is_enable ) ? $misc_loader_data->is_enable : 'false',
			'selected-tag'      => 'false',
			'pagination'        => isset( $misc_pagination_data->is_enable ) ? $misc_pagination_data->is_enable : 'false',
			'result-count'      => 'false',
			'taxonomy-relation' => $taxonomy_relation,
			'meta-relation'     => 'IN',
			'post-type'         => $this->get_post_type(),
			'post-per-page'     => CAF_Builder_Query::normalize_posts_per_page_setting(
				isset( $misc_pagination->settings->posts_per_page ) ? $misc_pagination->settings->posts_per_page : -1
			),
			'caf-index'                     => $this->get_short_index(),
			'pagination-type'               => isset( $misc_pagination->settings->pagination_type ) ? $misc_pagination->settings->pagination_type : '',
			'data-caf-filter-urls'          => $this->is_filter_urls_enabled() ? '1' : '0',
			'data-caf-schema-enabled'       => $this->is_schema_enabled() ? '1' : '0',
			'data-caf-listing-target'       => $this->get_listing_target(),
			'data-caf-results-selector'     => $this->get_results_selector(),
		);

		if ( ! $this->has_filters() ) {
			$filter_query_args = ( new CAF_Builder_Query( $this ) )->get_filter_query_args();
			if ( ! empty( $filter_query_args['tax_query'] ) ) {
				$attributes['data-caf-query-tax'] = esc_attr( wp_json_encode( $filter_query_args['tax_query'] ) );
			}
			if ( ! empty( $filter_query_args['meta_query'] ) ) {
				$attributes['data-caf-query-meta'] = esc_attr( wp_json_encode( $filter_query_args['meta_query'] ) );
			}
			$attributes['data-caf-query-only'] = '1';
		}

		return $attributes;
	}
}

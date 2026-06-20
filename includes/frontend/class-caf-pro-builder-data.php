<?php
/**
 * Frontend Builder Data Handler
 *
 * @package TC_CAF_PRO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_PRO_Builder_Data {

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
	 * Get misc sorting data.
	 *
	 * @return object
	 */
	public function get_misc_sorting_data() {
		$misc_preview_data = $this->get_misc_preview_data();
		$sorting_data      = array();
		if ( ! empty( $misc_preview_data->dnd_column_data ) && is_array( $misc_preview_data->dnd_column_data ) ) {
			foreach ( $misc_preview_data->dnd_column_data as $column ) {
				if ( empty( $column->data ) || ! is_array( $column->data ) ) {
					continue;
				}

				foreach ( $column->data as $item ) {
					if (
						! empty( $item->key ) &&
						'sorting' === $item->key &&
						! empty( $item->settings->is_enable ) &&
						'true' === $item->settings->is_enable
					) {
						$sorting_data = $item;
						break 2;
					}
				}
			}
		}
		return $sorting_data;
	}

	/**
	 * Get misc result count data.
	 *
	 * @return object
	 */
	public function get_misc_result_count_data() {
		$misc_preview_data = $this->get_misc_preview_data();
		$result_count_data = array();
		if ( ! empty( $misc_preview_data->dnd_column_data ) && is_array( $misc_preview_data->dnd_column_data ) ) {
			foreach ( $misc_preview_data->dnd_column_data as $column ) {
				if ( empty( $column->data ) || ! is_array( $column->data ) ) {
					continue;
				}

				foreach ( $column->data as $item ) {
					if (
						! empty( $item->key ) &&
						'result_count' === $item->key &&
						! empty( $item->settings->is_enable ) &&
						'true' === $item->settings->is_enable
					) {
						$result_count_data = $item;
						break 2;
					}
				}
			}
		}
		return $result_count_data;
	}

	/**
	 * Get misc selected filter data.
	 *
	 * @return object
	 */
	public function get_misc_selected_filter_data() {
		$misc_preview_data = $this->get_misc_preview_data();

		$selected_filter_data = array();
		if ( ! empty( $misc_preview_data->dnd_column_data ) && is_array( $misc_preview_data->dnd_column_data ) ) {
			foreach ( $misc_preview_data->dnd_column_data as $column ) {
				if ( empty( $column->data ) || ! is_array( $column->data ) ) {
					continue;
				}

				foreach ( $column->data as $item ) {
					if (
						! empty( $item->key ) &&
						'selected' === $item->key &&
						! empty( $item->settings->is_enable ) &&
						'true' === $item->settings->is_enable
					) {
						$selected_filter_data = $item;
						break 2;
					}
				}
			}
		}
		return $selected_filter_data;
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
	 * Get dummy image URL.
	 *
	 * @return string
	 */
	public function get_dummy_image_url() {
		return defined( 'TC_CAF_URL' ) ? TC_CAF_URL . 'assets/unnamed.jpg' : '';
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

		$container_data = $this->get_misc_container_data();
		if ( ! empty( $container_data->custom_class ) ) {
			$classes[] = sanitize_html_class( $container_data->custom_class );
		}

		return array_filter( $classes );
	}

	/**
	 * Get wrapper attributes for frontend container.
	 *
	 * @return array
	 */
	public function get_wrapper_attributes() {
		$misc_preview_data         = $this->get_misc_preview_data();
		$misc_loader_data          = $this->get_misc_loader_data();
		$misc_selected_filter_data = $this->get_misc_selected_filter_data();
		$misc_pagination_data      = $this->get_misc_pagination_data();
		$misc_result_count_data    = $this->get_misc_result_count_data();
		$filter_layout_extra_data  = $this->get_filter_layout_extra_data();
		$misc_pagination           = $this->get_misc_pagination();
		$builder_index             = absint( $this->get_short_index() );
		$analytics_enabled         = ( 'Enable' === (string) get_option( 'caf_enable_analytics_builder_' . $builder_index, 'Disable' ) ) ? '1' : '0';
		$filter_url_enabled        = class_exists( 'CAF_PRO_Builder_Url_State' ) && CAF_PRO_Builder_Url_State::is_enabled( $builder_index ) ? '1' : '0';
		$schema_enabled            = class_exists( 'CAF_PRO_Builder_Seo' ) && CAF_PRO_Builder_Seo::is_enabled( $builder_index ) ? '1' : '0';
		$default_sort_orderby      = $this->get_default_sort_orderby();
		$default_sort_order        = $this->get_default_sort_order();
		// var_dump( $misc_selected_filter_data );
		return array(
			'class'             => implode( ' ', $this->get_wrapper_classes() ),
			'loader-status'     => isset( $misc_loader_data->is_enable ) ? $misc_loader_data->is_enable : 'false',
			'selected-tag'      => isset( $misc_selected_filter_data->settings->is_enable ) ? $misc_selected_filter_data->settings->is_enable : 'false',
			'pagination'        => isset( $misc_pagination_data->is_enable ) ? $misc_pagination_data->is_enable : 'false',
			'result-count'      => isset( $misc_result_count_data->is_enable ) ? $misc_result_count_data->is_enable : 'false',
			'taxonomy-relation' => isset( $filter_layout_extra_data->taxonomy_relation ) ? $filter_layout_extra_data->taxonomy_relation : '',
			'meta-relation'     => isset( $filter_layout_extra_data->meta_relation ) ? $filter_layout_extra_data->meta_relation : '',
			'post-type'         => $this->get_post_type(),
			'post-per-page'     => isset( $misc_pagination->settings->posts_per_page ) ? absint( $misc_pagination->settings->posts_per_page ) : 10,
			'caf-index'                     => $this->get_short_index(),
			'pagination-type'               => isset( $misc_pagination->settings->pagination_type ) ? $misc_pagination->settings->pagination_type : '',
			'data-caf-analytics-enabled'    => $analytics_enabled,
			'data-caf-filter-urls'          => $filter_url_enabled,
			'data-caf-schema-enabled'       => $schema_enabled,
			'data-default-orderby'          => $default_sort_orderby,
			'data-default-order'            => $default_sort_order,
		);
	}
}

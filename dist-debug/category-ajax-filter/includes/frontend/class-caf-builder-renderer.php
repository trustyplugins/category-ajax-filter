<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Frontend Builder Main Renderer
 *
 * @package Category_Ajax_Filter
 */
class CAF_Builder_Renderer {

	/**
	 * Builder data handler.
	 *
	 * @var CAF_Builder_Data
	 */
	protected $data_handler;

	/**
	 * Builder query handler.
	 *
	 * @var CAF_Builder_Query
	 */
	protected $query_builder;

	/**
	 * Builder CSS collector.
	 *
	 * @var CAF_Builder_Css
	 */
	protected $css_builder;

	/**
	 * Style generator.
	 *
	 * @var CAF_Builder_Style_Generator
	 */
	protected $style_generator;

	/**
	 * Constructor.
	 *
	 * @param CAF_Builder_Data            $data_handler  Builder data handler.
	 * @param CAF_Builder_Query           $query_builder Query builder.
	 * @param CAF_Builder_Css             $css_builder   CSS builder.
	 * @param CAF_Builder_Style_Generator $style_generator   CSS generator.
	 */
	public function __construct( CAF_Builder_Data $data_handler, CAF_Builder_Query $query_builder, CAF_Builder_Css $css_builder, CAF_Builder_Style_Generator $style_generator ) {
		$this->data_handler    = $data_handler;
		$this->query_builder   = $query_builder;
		$this->css_builder     = $css_builder;
		$this->style_generator = $style_generator;
	}

	/**
	 * Render full builder output.
	 *
	 * @return string
	 */
	public function render() {
		if ( method_exists( $this->data_handler, 'is_post_type_available' ) && ! $this->data_handler->is_post_type_available() ) {
			return $this->render_unavailable_post_type();
		}

		$query = $this->get_initial_query();
		caf_builder_do_action( 'caf_builder_render_before', $query, $this->get_hook_context() );

		$html  = $this->render_wrapper_open();
		$html .= $this->render_container_css();
		$html .= $this->render_preview_layout_wrapper_open();

		if ( $this->data_handler->has_filters() ) {
			$html .= $this->render_filter_area( $query );
		}

		if ( ! $this->data_handler->is_main_query_listing() ) {
			$html .= $this->render_post_area( $query );
		}
		$html .= $this->render_preview_layout_wrapper_close();
		$html .= $this->render_custom_css_block();
		$html .= $this->render_wrapper_close();
		$html  = caf_builder_apply_filters( 'caf_builder_render_html', $html, $this->get_hook_context( array( 'query' => $query ) ) );
		caf_builder_do_action( 'caf_builder_render_after', $html, $query, $this->get_hook_context() );
		return $html;
	}

	/**
	 * Soft-fail markup when the layout CPT is not registered (e.g. WooCommerce deactivated).
	 *
	 * @return string
	 */
	protected function render_unavailable_post_type() {
		$post_type   = $this->data_handler->get_post_type();
		$for_visitor = ! current_user_can( 'edit_posts' );
		$message     = function_exists( 'caf_builder_missing_post_type_message' )
			? caf_builder_missing_post_type_message( $post_type, $for_visitor )
			: __( 'This filter is temporarily unavailable.', 'category-ajax-filter' );

		$attributes = $this->data_handler->get_wrapper_attributes();
		$existing   = isset( $attributes['class'] ) ? (string) $attributes['class'] : '';
		$attributes['class'] = trim( $existing . ' caf-builder-post-type-unavailable' );
		$attributes['data-caf-post-type-unavailable'] = '1';
		$attributes['data-caf-missing-post-type']     = $post_type;
		$attributes = caf_builder_apply_filters( 'caf_builder_wrapper_attributes', $attributes, $this->get_hook_context() );

		$html  = '<div ' . $this->build_html_attributes( $attributes ) . '>';
		$html .= '<p class="caf-builder-unavailable-notice">' . esc_html( $message ) . '</p>';
		$html .= '</div>';

		return caf_builder_apply_filters(
			'caf_builder_unavailable_post_type_html',
			$html,
			$post_type,
			$this->get_hook_context()
		);
	}

	/**
	 * Get initial query object.
	 *
	 * @return WP_Query
	 */
	protected function get_initial_query() {
		if ( $this->data_handler->has_filters() ) {
			return $this->query_builder->get_page_load_query();
		}

		// Filter with query mode: only filter_query_data taxonomy groups; ignore saved module predefined_terms.
		return $this->query_builder->get_filter_query();
	}

	/**
	 * Render wrapper opening tag.
	 *
	 * @return string
	 */
	protected function render_wrapper_open() {
		$attributes = $this->data_handler->get_wrapper_attributes();
		$attributes = caf_builder_apply_filters( 'caf_builder_wrapper_attributes', $attributes, $this->get_hook_context() );

		$html = '<div ' . $this->build_html_attributes( $attributes ) . '>';
		return caf_builder_apply_filters( 'caf_builder_wrapper_open_html', $html, $attributes, $this->get_hook_context() );
	}

	/**
	 * Render wrapper closing tag.
	 *
	 * @return string
	 */
	protected function render_wrapper_close() {
		$html = '</div>';
		return caf_builder_apply_filters( 'caf_builder_wrapper_close_html', $html, $this->get_hook_context() );
	}

	/**
	 * Render container level CSS.
	 *
	 * @return string
	 */
	protected function render_container_css() {
		$container_data  = $this->data_handler->get_misc_container_data();
		$instance_class  = '.' . $this->data_handler->get_instance_class();
		$container_scope = $instance_class . ' .caf-builder-preview-template-container';
		$container_style = isset( $container_data->style ) ? $container_data->style : null;

		if ( ! empty( $container_style ) ) {
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$container_style,
					'default',
					$container_scope
				)
			);

			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$container_style,
					'hover',
					$container_scope . ':hover'
				)
			);
		}

		return '';
	}

	/**
	 * Render inner preview-layout wrapper opening tag.
	 *
	 * Mirrors builder preview DOM grouping to keep floating controls
	 * and post area aligned with the same layout context.
	 *
	 * @return string
	 */
	protected function render_preview_layout_wrapper_open() {
		$classes   = array( 'caf-builder-preview-template-container' );
		$container = $this->data_handler->get_misc_container_data();
		$custom    = isset( $container->custom_class ) ? sanitize_html_class( $container->custom_class ) : '';

		if ( '' !== $custom ) {
			$classes[] = $custom;
		}

		return '<div class="' . esc_attr( implode( ' ', array_filter( $classes ) ) ) . '">';
	}

	/**
	 * Render inner preview-layout wrapper closing tag.
	 *
	 * @return string
	 */
	protected function render_preview_layout_wrapper_close() {
		return '</div>';
	}

	/**
	 * Render filter area.
	 *
	 * For now this is a placeholder wrapper.
	 * Later it will delegate to CAF_Builder_Filter_Renderer.
	 *
	 * @return string
	 */
	protected function render_filter_area( $query ) {
		$query_args          = $this->query_builder->get_query_args();
		$filter_preview_data = $this->data_handler->get_filter_preview_data();
		$instance_class      = '.' . $this->data_handler->get_instance_class();
		$custom_class        = ! empty( $filter_preview_data->custom_class ) ? sanitize_html_class( $filter_preview_data->custom_class ) : '';
		$filter_area_class   = 'caf-builder-filter filter-layout-container';
		$filter_style        = isset( $filter_preview_data->style ) ? $filter_preview_data->style : null;
		$post_count_per_page = isset( $query_args['posts_per_page'] ) ? (int) $query_args['posts_per_page'] : -1;
		$current_page        = isset( $query_args['paged'] ) ? (int) $query_args['paged'] : 1;
		$found_posts         = ( $query instanceof WP_Query ) ? (int) $query->found_posts : 0;

		if ( ! empty( $custom_class ) ) {
			$filter_area_class .= ' ' . $custom_class;
		}

		
		if ( ! empty( $filter_style ) ) {
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$filter_style,
					'default',
					$instance_class . ' .filter-layout-container'
				)
			);

			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$filter_style,
					'hover',
					$instance_class . ' .filter-layout-container:hover'
				)
			);
		}

		$filter_renderer = new CAF_Builder_Filter_Renderer(
			$this->data_handler,
			$this->css_builder,
			$this->style_generator
		);

		$filter_top_html = $this->render_misc_zone(
			'filter_top',
			$query,
			$post_count_per_page,
			$current_page,
			$found_posts
		);
		$filter_top_zone = $this->get_misc_zone_data( 'filter_top' );

		$filter_bottom_html = $this->render_misc_zone(
			'filter_bottom',
			$query,
			$post_count_per_page,
			$current_page,
			$found_posts
		);
		$filter_bottom_zone = $this->get_misc_zone_data( 'filter_bottom' );

		$html = '<div class="' . esc_attr( $filter_area_class ) . '">';

		if ( '' !== $filter_top_html ) {
			$this->collect_misc_zone_wrapper_css(
				$filter_top_zone,
				$instance_class . ' .caf-builder-template-preview-filter-top-wrapper'
			);
			$html .= '<div class="' . esc_attr( $this->get_misc_zone_wrapper_class( 'caf-builder-template-preview-filter-top-wrapper', $filter_top_zone ) ) . '">';
			$html .= $filter_top_html;
			$html .= '</div>';
		}

		$html .= $filter_renderer->render();

		if ( '' !== $filter_bottom_html ) {
			$this->collect_misc_zone_wrapper_css(
				$filter_bottom_zone,
				$instance_class . ' .caf-builder-template-preview-filter-bottom-wrapper'
			);
			$html .= '<div class="' . esc_attr( $this->get_misc_zone_wrapper_class( 'caf-builder-template-preview-filter-bottom-wrapper', $filter_bottom_zone ) ) . '">';
			$html .= $filter_bottom_html;
			$html .= '</div>';
		}

		$html .= '</div>';

		return caf_builder_apply_filters( 'caf_builder_filter_area_html', $html, $this->get_hook_context( array( 'query' => $query ) ) );
	}

	/**
	 * Render post area.
	 *
	 * For now this includes only the main structure placeholders.
	 * Later it will delegate to post/misc/pagination renderers.
	 *
	 * @param WP_Query $query Query object.
	 * @return string
	 */
	protected function render_post_area( $query ) {
		$query_args           = $this->query_builder->get_query_args();
		$post_preview_data    = $this->data_handler->get_post_preview_data();
		$instance_class       = '.' . $this->data_handler->get_instance_class();
		$post_container_class = 'post-layout-container';
		$post_inner_class     = $this->get_post_inner_classes();
		$post_count_per_page  = isset( $query_args['posts_per_page'] ) ? (int) $query_args['posts_per_page'] : -1;
		$current_page         = isset( $query_args['paged'] ) ? (int) $query_args['paged'] : 1;
		$found_posts          = ( $query instanceof WP_Query ) ? (int) $query->found_posts : 0;

		$this->collect_post_container_css( $post_preview_data, $instance_class );

		$post_renderer = new CAF_Builder_Post_Renderer(
			$this->data_handler,
			$this->css_builder,
			$query,
			$this->style_generator
		);

		$html = '<div class="' . esc_attr( $post_container_class ) . '">';

		// Render draggable misc items assigned to post_top.
		$post_top_html = $this->render_misc_zone(
			'post_top',
			$query,
			$post_count_per_page,
			$current_page,
			$found_posts
		);
		$post_top_zone = $this->get_misc_zone_data( 'post_top' );

		if ( '' !== $post_top_html ) {
			$this->collect_misc_zone_wrapper_css(
				$post_top_zone,
				$instance_class . ' .caf-builder-template-preview-post-top-wrapper'
			);
			$html .= '<div class="' . esc_attr( $this->get_misc_zone_wrapper_class( 'caf-builder-template-preview-post-top-wrapper', $post_top_zone ) ) . '">';
			$html .= $post_top_html;
			$html .= '</div>';
		}

		$html .= '<div class="caf-builder-template-preview-search-result-container">';
		$html .= esc_html__( 'Search Results for: ', 'category-ajax-filter' );
		$html .= '<span class="search-keyword"></span>';
		$html .= '</div>';

		$html .= $this->render_loader_placeholder();

		$html .= '<div class="' . esc_attr( $post_inner_class ) . '">';
		$html .= $post_renderer->render();
		$html .= '</div>';

		// Render draggable misc items assigned to post_bottom.

		$post_bottom_html = $this->render_misc_zone(
			'post_bottom',
			$query,
			$post_count_per_page,
			$current_page,
			$found_posts
		);
		$post_bottom_zone = $this->get_misc_zone_data( 'post_bottom' );

		if ( '' !== $post_bottom_html ) {
			$this->collect_misc_zone_wrapper_css(
				$post_bottom_zone,
				$instance_class . ' .caf-builder-template-preview-post-bottom-wrapper'
			);
			$html .= '<div class="' . esc_attr( $this->get_misc_zone_wrapper_class( 'caf-builder-template-preview-post-bottom-wrapper', $post_bottom_zone ) ) . '">';
			$html .= $post_bottom_html;
			$html .= '</div>';
		}

		$html .= '</div>';

		return caf_builder_apply_filters( 'caf_builder_post_area_html', $html, $this->get_hook_context( array( 'query' => $query ) ) );
	}
	/**
	 * Render misc zone based on builder drag-drop configuration.
	 *
	 * Loops through the zone (e.g., filter_top, post_bottom) and renders
	 * enabled misc items like sorting, result count, pagination, etc.
	 *
	 * @param string   $zone_key            Zone identifier (filter_top, filter_bottom, post_top, post_bottom).
	 * @param WP_Query $query               WordPress query object.
	 * @param int      $post_count_per_page Number of posts per page.
	 * @param int      $current_page        Current pagination page.
	 * @param int      $found_posts         Total found posts.
	 * @param int      $selected_filters    Selected Tags.
	 * @return string Rendered HTML output of the misc zone.
	 */
	public function render_misc_zone( $zone_key, $query, $post_count_per_page, $current_page, $found_posts, $selected_filters = array() ) {
		$misc_data = $this->data_handler->get_misc_preview_data();

		if ( empty( $misc_data->dnd_column_data ) || ! is_array( $misc_data->dnd_column_data ) ) {
			return '';
		}

		$zone = $this->find_misc_zone_by_key( $misc_data->dnd_column_data, $zone_key );
		if ( empty( $zone ) || empty( $zone->data ) || ! is_array( $zone->data ) ) {
			return '';
		}

		$html = '';

		foreach ( $zone->data as $item ) {
			if ( empty( $item->key ) ) {
				continue;
			}
			$is_enabled = isset( $item->settings->is_enable ) ? (string) $item->settings->is_enable : 'false';
			if ( 'true' !== $is_enabled ) {
				continue;
			}

			if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_render_misc_item( (string) $item->key ) ) {
				continue;
			}

			$html .= $this->render_misc_item(
				$item,
				$query,
				$post_count_per_page,
				$current_page,
				$found_posts,
				$selected_filters
			);
		}

		return $html;
	}

	/**
	 * Find a misc zone by its key from zone collection.
	 *
	 * @param array  $zones    List of zone objects.
	 * @param string $zone_key Zone key to search for.
	 *
	 * @return object|null Zone object if found, otherwise null.
	 */
	public function find_misc_zone_by_key( $zones, $zone_key ) {
		if ( empty( $zones ) || ! is_array( $zones ) ) {
			return null;
		}

		foreach ( $zones as $zone ) {
			if ( isset( $zone->key ) && $zone->key === $zone_key ) {
				return $zone;
			}
		}

		return null;
	}

	/**
	 * Get misc zone object by key.
	 *
	 * @param string $zone_key Zone key.
	 * @return object|null
	 */
	protected function get_misc_zone_data( $zone_key ) {
		$misc_data = $this->data_handler->get_misc_preview_data();
		if ( empty( $misc_data->dnd_column_data ) || ! is_array( $misc_data->dnd_column_data ) ) {
			return null;
		}

		return $this->find_misc_zone_by_key( $misc_data->dnd_column_data, $zone_key );
	}

	/**
	 * Collect CSS for misc zone wrappers from saved layout style.
	 *
	 * @param object|null $zone     Zone object.
	 * @param string      $selector Wrapper selector.
	 * @return void
	 */
	protected function collect_misc_zone_wrapper_css( $zone, $selector ) {
		if ( empty( $zone ) || ! is_object( $zone ) || empty( $zone->style ) || ! is_object( $zone->style ) || empty( $selector ) ) {
			return;
		}

		$settings = isset( $zone->settings ) && is_object( $zone->settings ) ? $zone->settings : new stdClass();

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$zone->style,
				'default',
				$selector,
				array(
					'settings' => $settings,
				)
			)
		);

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$zone->style,
				'hover',
				$selector . ':hover',
				array(
					'settings' => $settings,
				)
			)
		);
	}

	/**
	 * Build wrapper class list for misc zone containers.
	 *
	 * @param string      $base_class Base wrapper class.
	 * @param object|null $zone       Zone object.
	 * @return string
	 */
	protected function get_misc_zone_wrapper_class( $base_class, $zone ) {
		$classes = array( $base_class );
		if ( ! empty( $zone ) && is_object( $zone ) && isset( $zone->settings ) && is_object( $zone->settings ) && ! empty( $zone->settings->custom_class ) ) {
			$classes[] = sanitize_text_field( (string) $zone->settings->custom_class );
		}
		if ( ! empty( $zone ) && is_object( $zone ) && isset( $zone->settings ) && is_object( $zone->settings ) && isset( $zone->settings->visibility ) && is_object( $zone->settings->visibility ) ) {
			if ( isset( $zone->settings->visibility->desktop ) && 'true' === (string) $zone->settings->visibility->desktop ) {
				$classes[] = 'caf-hide-desktop';
			}
			if ( isset( $zone->settings->visibility->tablet ) && 'true' === (string) $zone->settings->visibility->tablet ) {
				$classes[] = 'caf-hide-tablet';
			}
			if ( isset( $zone->settings->visibility->mobile ) && 'true' === (string) $zone->settings->visibility->mobile ) {
				$classes[] = 'caf-hide-mobile';
			}
		}
		return implode( ' ', array_filter( $classes ) );
	}

	/**
	 * Render individual misc item based on its type.
	 *
	 * Supports rendering of:
	 * - selected filters
	 * - result count
	 * - sorting
	 * - pagination
	 *
	 * @param object   $item                Misc item configuration object.
	 * @param WP_Query $query               WordPress query object.
	 * @param int      $post_count_per_page Number of posts per page.
	 * @param int      $current_page        Current pagination page.
	 * @param int      $found_posts         Total found posts.
	 * @param int      $selected_filters    Selected Tags.
	 * @return string Rendered HTML output for the misc item.
	 */
	public function render_misc_item( $item, $query, $post_count_per_page, $current_page, $found_posts, $selected_filters = array() ) {
		$key = isset( $item->key ) ? $item->key : '';
		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_render_misc_item( (string) $key ) ) {
			return '';
		}
		switch ( $key ) {
			case 'pagination':
				return $this->render_pagination_placeholder( $query, $item );

			default:
				return '';
		}
	}
	/**
	 * Get rendered misc zones for AJAX response.
	 *
	 * @param WP_Query $query               WordPress query object.
	 * @param int      $post_count_per_page Number of posts per page.
	 * @param int      $current_page        Current page number.
	 * @param int      $found_posts         Total found posts.
	 * @param int      $selected_filters     Selected tags.
	 *
	 * @return array
	 */
	public function get_ajax_misc_zones( $query, $post_count_per_page, $current_page, $found_posts, $selected_filters ) {
		return array(
			'filter_top_data'    => $this->render_misc_zone(
				'filter_top',
				$query,
				$post_count_per_page,
				$current_page,
				$found_posts,
				$selected_filters
			),
			'filter_bottom_data' => $this->render_misc_zone(
				'filter_bottom',
				$query,
				$post_count_per_page,
				$current_page,
				$found_posts,
				$selected_filters
			),
			'post_top_data'      => $this->render_misc_zone(
				'post_top',
				$query,
				$post_count_per_page,
				$current_page,
				$found_posts,
				$selected_filters
			),
			'post_bottom_data'   => $this->render_misc_zone(
				'post_bottom',
				$query,
				$post_count_per_page,
				$current_page,
				$found_posts,
				$selected_filters
			),
		);
	}

	/**
	 * Render only post-area misc zones for lightweight AJAX responses.
	 *
	 * Skips filter top/bottom wrappers because filter markup is unchanged client-side.
	 *
	 * @param WP_Query $query               WordPress query object.
	 * @param int      $post_count_per_page Number of posts per page.
	 * @param int      $current_page        Current page number.
	 * @param int      $found_posts         Total found posts.
	 * @param array    $selected_filters    Selected tags payload.
	 * @return array
	 */
	public function get_ajax_posts_zones( $query, $post_count_per_page, $current_page, $found_posts, $selected_filters ) {
		return array(
			'post_top_data'    => $this->render_misc_zone(
				'post_top',
				$query,
				$post_count_per_page,
				$current_page,
				$found_posts,
				$selected_filters
			),
			'post_bottom_data' => $this->render_misc_zone(
				'post_bottom',
				$query,
				$post_count_per_page,
				$current_page,
				$found_posts,
				$selected_filters
			),
		);
	}
	/**
	 * Get post inner wrapper classes.
	 *
	 * @return string
	 */
	protected function get_post_inner_classes() {
		$post_preview_data = $this->data_handler->get_post_preview_data();
		$classes           = array( 'caf-builder-post', 'post-layout-container-inner' );

		if ( isset( $post_preview_data->layout_type ) && 'grid' === $post_preview_data->layout_type ) {
			$classes[] = 'caf-grid';

			if ( ! empty( $post_preview_data->grid->device_columns->desktop ) ) {
				$classes[] = 'caf-grid-' . absint( $post_preview_data->grid->device_columns->desktop );
			}
		}

		return implode( ' ', array_filter( $classes ) );
	}

	/**
	 * Collect post container CSS.
	 *
	 * @param object $post_preview_data Post preview data.
	 * @param string $instance_class    Instance selector.
	 * @return void
	 */
	protected function collect_post_container_css( $post_preview_data, $instance_class ) {
		if ( empty( $post_preview_data->layout_type ) || 'grid' !== $post_preview_data->layout_type ) {
			return;
		}

		$grid_style  = isset( $post_preview_data->grid->style ) ? $post_preview_data->grid->style : null;
		$inner_style = isset( $post_preview_data->inner->style ) ? $post_preview_data->inner->style : null;

		if ( ! empty( $grid_style ) ) {
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$grid_style,
					'default',
					$instance_class . ' .post-layout-container'
				)
			);

			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$grid_style,
					'hover',
					$instance_class . ' .post-layout-container:hover'
				)
			);
		}

		if ( ! empty( $inner_style ) ) {
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$inner_style,
					'default',
					$instance_class . ' .post-layout-container-inner'
				)
			);

			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$inner_style,
					'hover',
					$instance_class . ' .post-layout-container-inner:hover'
				)
			);
		}

		$this->collect_post_grid_device_columns_css( $post_preview_data, $instance_class );
	}

	/**
	 * Collect responsive grid column-count CSS from device settings.
	 *
	 * @param object $post_preview_data Post preview data object.
	 * @param string $instance_class    Instance selector (prefixed with dot).
	 * @return void
	 */
	protected function collect_post_grid_device_columns_css( $post_preview_data, $instance_class ) {
		if ( empty( $post_preview_data->grid ) || ! is_object( $post_preview_data->grid ) || empty( $post_preview_data->grid->device_columns ) || ! is_object( $post_preview_data->grid->device_columns ) ) {
			return;
		}

		$device_columns = $post_preview_data->grid->device_columns;
		$desktop_cols   = isset( $device_columns->desktop ) ? max( 1, absint( $device_columns->desktop ) ) : 0;
		if ( $desktop_cols < 1 ) {
			return;
		}

		$tablet_cols = isset( $device_columns->tablet ) ? max( 1, absint( $device_columns->tablet ) ) : $desktop_cols;
		$mobile_cols = isset( $device_columns->mobile ) ? max( 1, absint( $device_columns->mobile ) ) : $tablet_cols;

		$selector = $instance_class . ' .post-layout-container-inner.caf-grid';
		$css      = $selector . ' { grid-template-columns: repeat(' . $desktop_cols . ', minmax(0,1fr)); }';
		$css     .= '@media (max-width: 1024px) { ' . $selector . ' { grid-template-columns: repeat(' . $tablet_cols . ', minmax(0,1fr)); } }';
		$css     .= '@media (max-width: 767px) { ' . $selector . ' { grid-template-columns: repeat(' . $mobile_cols . ', minmax(0,1fr)); } }';

		$this->css_builder->add( $css );
	}

	/**
	 * Render loader placeholder.
	 *
	 * @return string
	 */
	protected function render_loader_placeholder() {
		$misc_renderer = new CAF_Builder_Misc_Renderer(
			$this->data_handler,
			$this->css_builder,
			$this->query_builder,
			$this->style_generator
		);

		return $misc_renderer->render_loader();
	}

	/**
	 * Render pagination placeholder.
	 *
	 * @param WP_Query $query Query object.
	 * @return string
	 */
	protected function render_pagination_placeholder( $query, $pagination_item = null ) {
		// var_dump($query);
		if ( ! ( $query instanceof WP_Query ) ) {
			return '';
		}

		$query_args   = $this->query_builder->get_query_args();
		$current_page = isset( $query_args['paged'] ) ? (int) $query_args['paged'] : 1;

		$pagination_renderer = new CAF_Builder_Pagination_Renderer(
			$this->data_handler,
			$this->css_builder,
			$this->style_generator,
			$query,
			$current_page,
			$pagination_item
		);

		return $pagination_renderer->render();
	}

	/**
	 * Render custom CSS block.
	 *
	 * For now this keeps compatibility with your old approach.
	 * Later you should move this into wp_add_inline_style() after sanitization.
	 *
	 * @return string
	 */
	protected function render_custom_css_block() {
		$container_data = $this->data_handler->get_misc_container_data();

		if ( empty( $container_data->custom_css ) || ! is_string( $container_data->custom_css ) ) {
			return '';
		}

		return '<style id="caf-builder-custom-css">' . wp_strip_all_tags( $container_data->custom_css ) . '</style>';
	}

	/**
	 * Build HTML attributes string.
	 *
	 * @param array $attributes Attributes array.
	 * @return string
	 */
	protected function build_html_attributes( $attributes ) {
		$output = array();

		foreach ( $attributes as $key => $value ) {
			if ( '' === $value || null === $value ) {
				continue;
			}

			$output[] = sprintf(
				'%1$s="%2$s"',
				esc_attr( $key ),
				esc_attr( $value )
			);
		}

		return implode( ' ', $output );
	}

	/**
	 * Build common hook context.
	 *
	 * @param array $extra Extra context values.
	 * @return array
	 */
	protected function get_hook_context( $extra = array() ) {
		$context = array(
			'builder_index'  => $this->data_handler->get_short_index(),
			'instance_class' => $this->data_handler->get_instance_class(),
			'post_type'      => $this->data_handler->get_post_type(),
			'is_ajax'        => wp_doing_ajax(),
		);

		if ( ! empty( $extra ) ) {
			$context = array_merge( $context, $extra );
		}

		return $context;
	}
}

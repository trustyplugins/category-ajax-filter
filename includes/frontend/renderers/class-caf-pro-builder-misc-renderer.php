<?php
/**
 * Frontend Builder Misc Renderer
 *
 * @package TC_CAF_PRO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_PRO_Builder_Misc_Renderer {

	/**
	 * Builder data handler.
	 *
	 * @var CAF_PRO_Builder_Data
	 */
	protected $data_handler;

	/**
	 * Builder CSS collector.
	 *
	 * @var CAF_PRO_Builder_Css
	 */
	protected $css_builder;
	/**
	 * Style generator instance.
	 *
	 * @var CAF_PRO_Builder_Style_Generator
	 */
	protected $style_generator;
	/**
	 * Query builder.
	 *
	 * @var CAF_PRO_Builder_Query
	 */
	protected $query_builder;

	/**
	 * Constructor.
	 *
	 * @param CAF_PRO_Builder_Data            $data_handler    Data handler.
	 * @param CAF_PRO_Builder_Css             $css_builder     CSS builder.
	 * @param CAF_PRO_Builder_Query           $query_builder   Query builder.
	 * @param CAF_PRO_Builder_Style_Generator $style_generator Style generator.
	 */
	public function __construct(
		CAF_PRO_Builder_Data $data_handler,
		CAF_PRO_Builder_Css $css_builder,
		CAF_PRO_Builder_Query $query_builder,
		CAF_PRO_Builder_Style_Generator $style_generator
	) {
		$this->data_handler    = $data_handler;
		$this->css_builder     = $css_builder;
		$this->query_builder   = $query_builder;
		$this->style_generator = $style_generator;
	}

	/**
	 * Render loader.
	 *
	 * @return string
	 */
	public function render_loader() {
		$loader_data = $this->data_handler->get_misc_loader_data();

		if ( empty( $loader_data->is_enable ) || 'true' !== $loader_data->is_enable ) {
			return '';
		}

		$custom_class = ! empty( $loader_data->custom_class ) ? sanitize_html_class( $loader_data->custom_class ) : '';
		$class        = 'caf-builder-template-preview-loader-container';

		if ( ! empty( $custom_class ) ) {
			$class .= ' ' . $custom_class;
		}

		$container_selector = '.caf-builder-container .caf-builder-template-preview-loader-container';
		$content_selector   = '.caf-builder-container .caf-builder-template-preview-loader-container .caf-builder-template-preview-loader-content';
		$image_selector     = '.caf-builder-container .caf-builder-template-preview-loader-container .caf-builder-template-preview-loader-content .common-img';

		if ( ! empty( $loader_data->icon_data->style ) ) {
			$this->collect_loader_css( $loader_data->icon_data->style, $container_selector );
		}

		$html  = '<div class="' . esc_attr( $class ) . '">';
		$html .= '<div class="caf-builder-template-preview-loader-content">';

		if ( isset( $loader_data->loader_type ) && 'false' === $loader_data->loader_type ) {
			if ( ! empty( $loader_data->icon_data->style ) ) {
				$this->collect_misc_css( $loader_data->icon_data->style, $content_selector );
			}

			$text  = ! empty( $loader_data->loader_text ) ? $loader_data->loader_text : '';
			$html .= '<span class="caf-builder-template-preview-loader-text">' . esc_html( $text ) . '</span>';
		} elseif ( ! empty( $loader_data->icon_data->source ) && 'list' === $loader_data->icon_data->source ) {
			if ( ! empty( $loader_data->icon_data->style ) ) {
				$this->collect_misc_css( $loader_data->icon_data->style, $content_selector );
			}

			$icon = ! empty( $loader_data->icon_data->icon ) ? $loader_data->icon_data->icon : '';
			if ( ! empty( $icon ) ) {
				$html .= '<i class="' . esc_attr( $icon ) . '"></i>';
			}
		} elseif ( ! empty( $loader_data->icon_data->source ) && 'upload' === $loader_data->icon_data->source ) {
			if ( ! empty( $loader_data->icon_data->style ) ) {
				$this->collect_misc_css( $loader_data->icon_data->style, $image_selector );
			}

			$url = ! empty( $loader_data->icon_data->upload->url ) ? $loader_data->icon_data->upload->url : '';
			if ( ! empty( $url ) ) {
				$html .= '<img src="' . esc_url( $url ) . '" class="upload-loader-img common-img" alt="" />';
			}
		} else {
			if ( ! empty( $loader_data->icon_data->style ) ) {
				$this->collect_misc_css( $loader_data->icon_data->style, $image_selector );
			}

			$url = ! empty( $loader_data->icon_data->url ) ? $loader_data->icon_data->url : '';
			if ( ! empty( $url ) ) {
				$html .= '<img src="' . esc_url( $url ) . '" class="url-loader-img common-img" alt="" />';
			}
		}

		$html .= '</div>';
		$html .= '</div>';

		return $html;
	}

	/**
	 * Render selected filters container.
	 *
	 * @param array $selected_filters Selected Tags.
	 * @return string
	 */
	public function render_selected_filters( $selected_filters = array(), $selected_filter_item = null ) {
		$selected_filter_data = ( ! empty( $selected_filter_item ) && is_object( $selected_filter_item ) ) ? $selected_filter_item : $this->data_handler->get_misc_selected_filter_data();

		if ( empty( $selected_filter_data->settings->is_enable ) || 'true' !== $selected_filter_data->settings->is_enable ) {
			return '';
		}

		$custom_class = ! empty( $selected_filter_data->settings->custom_class ) ? sanitize_text_field( $selected_filter_data->settings->custom_class ) : '';
		$close_status = ! empty( $selected_filter_data->settings->close_button ) ? $selected_filter_data->settings->close_button : 'false';

		$class = 'caf-builder-template-preview-selected-tags-container';
		if ( ! empty( $custom_class ) ) {
			$class .= ' ' . $custom_class;
		}
		$class .= $this->get_visibility_classes( isset( $selected_filter_data->settings ) ? $selected_filter_data->settings : null );
		if ( ! empty( $selected_filter_data->style ) ) {

			$this->collect_misc_css( $selected_filter_data->style->container, '.caf-builder-container .caf-builder-template-preview-selected-tags-container' );
			$this->collect_misc_css( $selected_filter_data->style->meta, '.caf-builder-container .caf-builder-template-preview-selected-tags-container .caf-builder-template-preview-selected-tag-single-item' );
			$this->collect_misc_css( $selected_filter_data->style->meta1, '.caf-builder-container .caf-builder-template-preview-selected-tags-container .caf-builder-template-preview-selected-tag-single-item .caf-builder-template-preview-selected-tag-close-btn' );
		}
		$html  = '';
		$html .= '<ul class="' . esc_attr( $class ) . '" data-close-button="' . esc_attr( $close_status ) . '">';
		if ( ! empty( $selected_filters ) && is_array( $selected_filters ) ) {
			foreach ( $selected_filters as $item ) {
				if ( ! is_array( $item ) ) {
					continue;
				}

				$value       = isset( $item['value'] ) ? sanitize_text_field( wp_unslash( $item['value'] ) ) : '';
				$label       = isset( $item['label'] ) ? sanitize_text_field( wp_unslash( $item['label'] ) ) : '';
				$row_id      = isset( $item['row_id'] ) ? absint( $item['row_id'] ) : 0;
				$column_id   = isset( $item['column_id'] ) ? absint( $item['column_id'] ) : 0;
				$module_id   = isset( $item['module_id'] ) ? absint( $item['module_id'] ) : 0;
				$unique_id   = isset( $item['unique_id'] ) ? sanitize_text_field( wp_unslash( $item['unique_id'] ) ) : '';
				$data_source = isset( $item['data_source'] ) ? sanitize_text_field( wp_unslash( $item['data_source'] ) ) : '';
				$filter_type = isset( $item['filter_type'] ) ? sanitize_text_field( wp_unslash( $item['filter_type'] ) ) : '';

				if ( '' === $value || '' === $label ) {
					continue;
				}

				$html .= '<li class="caf-builder-template-preview-selected-tag-single-item"';
				$html .= ' data-value="' . esc_attr( $value ) . '"';
				$html .= ' data-row-id="' . esc_attr( $row_id ) . '"';
				$html .= ' data-column-id="' . esc_attr( $column_id ) . '"';
				$html .= ' data-module-id="' . esc_attr( $module_id ) . '"';
				$html .= ' data-unique-id="' . esc_attr( $unique_id ) . '"';
				$html .= ' data-source="' . esc_attr( $data_source ) . '"';
				$html .= ' data-filter-type="' . esc_attr( $filter_type ) . '"';
				$html .= '>';
				if ( 'true' === $close_status ) {
					$html .= '<span class="caf-builder-template-preview-selected-tag-close-btn" role="button" tabindex="0" aria-label="' . esc_attr__( 'Remove selected filter', 'tc-caf-pro' ) . '">';
					$html .= '<i class="fa fa-times" aria-hidden="true"></i>';
					$html .= '</span>';
				}
				$html .= '<span class="caf-builder-template-preview-selected-tag-term-name">';
				$html .= esc_html( $label );
				$html .= '</span>';

				$html .= '</li>';
			}
		}

		$html .= '</ul>';
		return $html;
	}

	/**
	 * Render result count.
	 *
	 * @param int $posts_per_page Posts per page.
	 * @param int $current_page   Current page.
	 * @param int $total_posts    Total posts.
	 * @return string
	 */
	public function render_result_count( $posts_per_page, $current_page, $total_posts, $result_count_item = null ) {
		$result_count_data = ( ! empty( $result_count_item ) && is_object( $result_count_item ) ) ? $result_count_item : $this->data_handler->get_misc_result_count_data();
		$posts_per_page    = max( 1, (int) $posts_per_page );
		$current_page      = max( 1, (int) $current_page );
		$total_posts       = max( 0, (int) $total_posts );
		$custom_class      = ! empty( $result_count_data->settings->custom_class ) ? sanitize_html_class( $result_count_data->settings->custom_class ) : '';
		$class             = 'caf-builder-template-preview-result-count-container';
		if ( empty( $result_count_data ) ) {
			return;
		}
		if ( ! empty( $custom_class ) ) {
			$class .= ' ' . $custom_class;
		}
		$class .= $this->get_visibility_classes( isset( $result_count_data->settings ) ? $result_count_data->settings : null );
		if ( ! empty( $result_count_data->style ) ) {
			$this->collect_misc_css( $result_count_data->style->container, '.caf-builder-container .caf-builder-template-preview-result-count-container' );
			$this->collect_misc_css( $result_count_data->style->meta, '.caf-builder-container .caf-builder-template-preview-result-count-container .caf-builder-template-preview-result-count-prefix-text' );
			$this->collect_misc_css( $result_count_data->style->meta1, '.caf-builder-container .caf-builder-template-preview-result-count-container .caf-builder-template-preview-result-count-suffix-text' );
		}
		// echo "<pre>";
		// print_r($result_count_data);
		// echo "</pre>";
		$html = '<div class="' . esc_attr( $class ) . '">';
		if ( $result_count_data->settings->prefix->is_enable === 'true' ) {
			$html .= '<span class="caf-builder-template-preview-result-count-prefix-text">';
			$html .= esc_html( $result_count_data->settings->prefix->value );
			$html .= '</span>';
		}
		$html .= '<span class="caf-builder-template-preview-total-results">' . esc_html( $total_posts ) . '</span>';
		if ( $result_count_data->settings->suffix->is_enable === 'true' ) {
			$html .= '<span class="caf-builder-template-preview-result-count-suffix-text">';
			$html .= esc_html( $result_count_data->settings->suffix->value );
			$html .= '</span>';
		}
		$html .= '</div>';

		return $html;
	}

	/**
	 * Render sorting.
	 *
	 * @param array $query_args Query Arguments.
	 * @return string
	 */
	public function render_sorting( $query_args = array(), $sorting_item = null ) {
		$sorting_data = ( ! empty( $sorting_item ) && is_object( $sorting_item ) ) ? $sorting_item : $this->data_handler->get_misc_sorting_data();

		if ( empty( $sorting_data->settings->is_enable ) || 'true' !== $sorting_data->settings->is_enable ) {
			return '';
		}

		$query_args      = is_array( $query_args ) ? $query_args : array();
		$current_order   = ! empty( $query_args['order'] ) ? strtoupper( sanitize_text_field( $query_args['order'] ) ) : '0';
		$current_orderby = ! empty( $query_args['orderby'] ) ? strtolower( sanitize_text_field( $query_args['orderby'] ) ) : '0';

		$custom_class = ! empty( $sorting_data->settings->custom_class ) ? sanitize_html_class( $sorting_data->settings->custom_class ) : '';
		$class        = 'caf-builder-template-preview-sorting-container';

		if ( ! empty( $custom_class ) ) {
			$class .= ' ' . $custom_class;
		}
		$class .= $this->get_visibility_classes( isset( $sorting_data->settings ) ? $sorting_data->settings : null );

		if ( ! empty( $sorting_data->style ) ) {
			$this->collect_misc_css( $sorting_data->style->container, '.caf-builder-container .caf-builder-template-preview-sorting-container' );
			$this->collect_misc_css( $sorting_data->style->meta2, '.caf-builder-container .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type' );
			$this->collect_misc_css( $sorting_data->style->meta4, '.caf-builder-container .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type .caf-dropdown-opt-list' );
			$this->collect_misc_css( $sorting_data->style->meta, '.caf-builder-container .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type .caf-selectbox' );
			$this->collect_misc_css( $sorting_data->style->meta1, '.caf-builder-container .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type .caf-dropdown-opt-list .caf-dropdown-opt-list-item' );

			$this->collect_misc_css( $sorting_data->style->meta3, '.caf-builder-container .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by' );
			$this->collect_misc_css( $sorting_data->style->meta4, '.caf-builder-container .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by .caf-dropdown-opt-list' );
			$this->collect_misc_css( $sorting_data->style->meta, '.caf-builder-container .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by .caf-selectbox' );
			$this->collect_misc_css( $sorting_data->style->meta5, '.caf-builder-container .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by .caf-selectbox' );
			$this->collect_misc_css( $sorting_data->style->meta1, '.caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by .caf-dropdown-opt-list .caf-dropdown-opt-list-item' );
		}

		$html = '<div class="' . esc_attr( $class ) . '">';

		if ( $sorting_data->settings->order->is_enable === 'true' && ! empty( $sorting_data->settings->order->values ) ) {
			$order_placeholder = ( '0' !== $current_order ) ? $current_order : $sorting_data->settings->order->placeholder;
			$order_select_class  = ( '0' !== $current_order ) ? 'caf-item-selected' : 'caf-placeholder-selected';

			$html .= '<div class="caf-builder-template-preview-sorting-content-dropdown-order-type caf-custom-dropdown-wrapper" data-value="' . esc_attr( $current_order ) . '">';
			$html .= '<div class="caf-selectbox ' . esc_attr( $order_select_class ) . '">';

			if ( $sorting_data->settings->order->icon_position === 'left' ) {
				$html .= '<span class="caf-dropdown-arrow"><i class="fas fa-caret-down"></i></span> ';
			}

			$html .= '<span class="caf-sorting-placeholder">' . esc_html( $order_placeholder ) . '</span>';

			if ( $sorting_data->settings->order->icon_position === 'right' ) {
				$html .= '<span class="caf-dropdown-arrow"><i class="fas fa-caret-down"></i></span> ';
			}

			$html .= '</div>';
			$html .= '<ul class="caf-dropdown-opt-list">';
			$html .= '<li class="caf-dropdown-opt-list-item order-plc">' . esc_html( $sorting_data->settings->order->placeholder ) . '</li>';

			foreach ( $sorting_data->settings->order->values as $item ) {
				$item_value   = strtoupper( sanitize_text_field( $item ) );
				$active_class = ( $item_value === $current_order ) ? ' active' : '';

				$html .= '<li class="caf-dropdown-opt-list-item' . esc_attr( $active_class ) . '" data-value="' . esc_attr( $item_value ) . '">';
				$html .= esc_html( $item );
				$html .= '</li>';
			}

			$html .= '</ul>';
			$html .= '</div>';
		}

		if ( $sorting_data->settings->order_by->is_enable === 'true' && ! empty( $sorting_data->settings->order_by->values ) ) {
			$orderby_placeholder = ( '0' !== $current_orderby ) ? $current_orderby : $sorting_data->settings->order_by->placeholder;
			$orderby_select_class  = ( '0' !== $current_orderby ) ? 'caf-item-selected' : 'caf-placeholder-selected';

			$html .= '<div class="caf-builder-template-preview-sorting-content-dropdown-order-by caf-custom-dropdown-wrapper" data-value="' . esc_attr( $current_orderby ) . '">';
			$html .= '<div class="caf-selectbox ' . esc_attr( $orderby_select_class ) . '">';

			if ( $sorting_data->settings->order_by->icon_position === 'left' ) {
				$html .= '<span class="caf-dropdown-arrow"><i class="fas fa-caret-down"></i></span> ';
			}

			$html .= '<span class="caf-sorting-placeholder">' . esc_html( $orderby_placeholder ) . '</span>';

			if ( $sorting_data->settings->order_by->icon_position === 'right' ) {
				$html .= '<span class="caf-dropdown-arrow"><i class="fas fa-caret-down"></i></span> ';
			}

			$html .= '</div>';
			$html .= '<ul class="caf-dropdown-opt-list">';
			$html .= '<li class="caf-dropdown-opt-list-item order-plc">' . esc_html( $sorting_data->settings->order_by->placeholder ) . '</li>';

			foreach ( $sorting_data->settings->order_by->values as $item ) {
				$item_value   = strtolower( sanitize_text_field( $item ) );
				$active_class = ( $item_value === $current_orderby ) ? ' active' : '';

				$html .= '<li class="caf-dropdown-opt-list-item' . esc_attr( $active_class ) . '" data-value="' . esc_attr( $item_value ) . '">';
				$html .= esc_html( $item );
				$html .= '</li>';
			}

			$html .= '</ul>';
			$html .= '</div>';
		}

		$html .= '</div>';

		return $html;
	}
	/**
	 * Collect default and hover CSS for misc module.
	 *
	 * @param mixed  $style    Style object.
	 * @param string $selector CSS selector.
	 * @return void
	 */
	protected function collect_misc_css( $style, $selector ) {
		if ( empty( $style ) || empty( $selector ) ) {
			return;
		}

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style,
				'default',
				$selector,
				array(
					'background_image_mode' => 'always',
				)
			)
		);

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style,
				'hover',
				$selector . ':hover',
				array(
					'background_image_mode' => 'always',
				)
			)
		);
	}

	/**
	 * Collect loader overlay/container CSS.
	 *
	 * @param mixed  $style    Style object.
	 * @param string $selector CSS selector.
	 * @return void
	 */
	protected function collect_loader_css( $style, $selector ) {
		if ( empty( $style ) || empty( $selector ) ) {
			return;
		}

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style,
				'default',
				$selector,
				array(
					'overlay_as_background' => true,
				)
			)
		);

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style,
				'hover',
				$selector . ':hover',
				array(
					'overlay_as_background' => true,
				)
			)
		);
	}

	/**
	 * Build visibility classes from device visibility settings.
	 *
	 * @param object|null $settings Settings object.
	 * @return string
	 */
	protected function get_visibility_classes( $settings ) {
		if ( empty( $settings ) || ! is_object( $settings ) || empty( $settings->visibility ) || ! is_object( $settings->visibility ) ) {
			return '';
		}

		$classes = array();
		if ( isset( $settings->visibility->desktop ) && 'true' === (string) $settings->visibility->desktop ) {
			$classes[] = 'caf-hide-desktop';
		}
		if ( isset( $settings->visibility->tablet ) && 'true' === (string) $settings->visibility->tablet ) {
			$classes[] = 'caf-hide-tablet';
		}
		if ( isset( $settings->visibility->mobile ) && 'true' === (string) $settings->visibility->mobile ) {
			$classes[] = 'caf-hide-mobile';
		}

		return empty( $classes ) ? '' : ' ' . implode( ' ', $classes );
	}
}

<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Frontend Builder Pagination Renderer
 *
 * @package Category_Ajax_Filter
 */
class CAF_Builder_Pagination_Renderer {

	/**
	 * Builder data handler.
	 *
	 * @var CAF_Builder_Data
	 */
	protected $data_handler;

	/**
	 * Builder CSS collector.
	 *
	 * @var CAF_Builder_Css
	 */
	protected $css_builder;
	/**
	 * Style generator instance.
	 *
	 * @var CAF_Builder_Style_Generator
	 */
	protected $style_generator;
	/**
	 * Query object.
	 *
	 * @var WP_Query
	 */
	protected $query;

	/**
	 * Current page.
	 *
	 * @var int
	 */
	protected $current_page = 1;
	/**
	 * Optional pagination item override from misc zone.
	 *
	 * @var object|null
	 */
	protected $pagination_item_override = null;

	/**
	 * Constructor.
	 *
	 * @param CAF_Builder_Data            $data_handler    Data handler.
	 * @param CAF_Builder_Css             $css_builder     CSS builder.
	 * @param CAF_Builder_Style_Generator $style_generator Style generator.
	 * @param WP_Query                        $query           Query object.
	 * @param int                             $current_page    Current page (1-based).
	 */
	public function __construct(
		CAF_Builder_Data $data_handler,
		CAF_Builder_Css $css_builder,
		CAF_Builder_Style_Generator $style_generator,
		WP_Query $query,
		int $current_page = 1,
		$pagination_item_override = null
	) {
		$this->data_handler    = $data_handler;
		$this->css_builder     = $css_builder;
		$this->style_generator = $style_generator;
		$this->query           = $query;
		$this->current_page    = max( 1, $current_page );
		$this->pagination_item_override = ( ! empty( $pagination_item_override ) && is_object( $pagination_item_override ) ) ? $pagination_item_override : null;
	}

	/**
	 * Render pagination.
	 *
	 * @return string
	 */
	public function render() {
		$pagination_data = ! empty( $this->pagination_item_override ) ? $this->pagination_item_override : $this->data_handler->get_misc_pagination();
		// echo '<pre>';
		// print_r( $pagination_data );
		// echo '</pre>';
		if ( empty( $pagination_data->settings->is_enable ) || 'true' !== $pagination_data->settings->is_enable ) {
			return '';
		}

		if ( ! ( $this->query instanceof WP_Query ) ) {
			return '';
		}

		$custom_class = ! empty( $pagination_data->settings->custom_class ) ? sanitize_html_class( $pagination_data->settings->custom_class ) : '';
		$class        = 'caf-builder-preview-pagination-container caf-builder-preview-pagination';

		if ( ! empty( $custom_class ) ) {
			$class .= ' ' . $custom_class;
		}
		$class .= $this->get_visibility_classes( isset( $pagination_data->settings ) ? $pagination_data->settings : null );

		$html = '<div class="' . esc_attr( $class ) . '" data-current-page="' . esc_attr( $this->current_page ) . '">';

		if ( ! empty( $pagination_data->settings->pagination_type ) && 'number' === $pagination_data->settings->pagination_type ) {
			$html .= $this->render_number_pagination( $pagination_data, false );
		}

		$can_use_number_with_buttons = ! class_exists( 'CAF_Builder_Tier' ) || CAF_Builder_Tier::can_use_feature( 'pagination_number2' );
		if (
			$can_use_number_with_buttons
			&& ! empty( $pagination_data->settings->pagination_type )
			&& 'number2' === $pagination_data->settings->pagination_type
		) {
			$html .= $this->render_number_pagination( $pagination_data, true );
		} elseif (
			! $can_use_number_with_buttons
			&& ! empty( $pagination_data->settings->pagination_type )
			&& 'number2' === $pagination_data->settings->pagination_type
		) {
			$html .= $this->render_number_pagination( $pagination_data, false );
		}

		$html .= '</div>';

		return $html;
	}

	/**
	 * Read pagination config from saved builder settings.
	 *
	 * @param object $pagination_data Pagination module data.
	 * @param string $key             Config key (prev, next, load_more, ellipsis).
	 * @return object|null
	 */
	protected function get_pagination_setting( $pagination_data, $key ) {
		if ( ! empty( $pagination_data->settings ) && is_object( $pagination_data->settings ) && isset( $pagination_data->settings->$key ) ) {
			return $pagination_data->settings->$key;
		}

		if ( isset( $pagination_data->$key ) ) {
			return $pagination_data->$key;
		}

		return null;
	}

	/**
	 * Build page number markup to match builder preview ellipsis behavior.
	 *
	 * @param object $pagination_data Pagination data.
	 * @param int    $total_pages     Total pages.
	 * @return string
	 */
	protected function build_page_number_markup( $pagination_data, $total_pages ) {
		$html              = '';
		$ellipsis_settings = $this->get_pagination_setting( $pagination_data, 'ellipsis' );
		$ellipsis_enabled  = ! empty( $ellipsis_settings->is_enable ) && 'true' === (string) $ellipsis_settings->is_enable;
		$ellipsis_text     = ! empty( $ellipsis_settings->value ) ? (string) $ellipsis_settings->value : '...';

		$render_page = function ( $page_no ) {
			$is_active = (int) $page_no === (int) $this->current_page ? 'active' : '';
			$html      = '<span class="caf-builder-preview-page-no ' . esc_attr( $is_active ) . '" page="' . esc_attr( $page_no ) . '">';
			$html     .= esc_html( $page_no );
			$html     .= '</span>';
			return $html;
		};

		if ( ! $ellipsis_enabled || $total_pages <= 5 ) {
			for ( $page_no = 1; $page_no <= $total_pages; $page_no++ ) {
				$html .= $render_page( $page_no );
			}
			return $html;
		}

		for ( $page_no = 1; $page_no <= $total_pages; $page_no++ ) {
			if (
				1 === $page_no ||
				$total_pages === $page_no ||
				$page_no === $this->current_page ||
				$page_no === ( $this->current_page - 1 ) ||
				$page_no === ( $this->current_page + 1 )
			) {
				$html .= $render_page( $page_no );
				continue;
			}

			if (
				( $page_no === ( $this->current_page - 2 ) && $this->current_page > 3 ) ||
				( $page_no === ( $this->current_page + 2 ) && $this->current_page < ( $total_pages - 2 ) )
			) {
				$html .= '<span class="ellipsis-dots">' . esc_html( $ellipsis_text ) . '</span>';
			}
		}

		return $html;
	}

	/**
	 * Collect shared number-pagination styles.
	 *
	 * @param object $pagination_data Pagination data.
	 * @param bool   $include_pages   Whether to include pages container styles.
	 * @return void
	 */
	protected function collect_number_pagination_styles( $pagination_data, $include_pages = true ) {
		$style = isset( $pagination_data->style ) ? $pagination_data->style : null;

		if ( empty( $style ) ) {
			return;
		}

		$this->collect_pagination_css(
			$style->container,
			'.caf-builder-container .caf-builder-preview-pagination-container'
		);

		$this->collect_pagination_css(
			$style->meta,
			'.caf-builder-container .caf-builder-preview-pagination .caf-builder-preview-prev-btn'
		);

		$this->collect_pagination_css(
			$style->meta1,
			'.caf-builder-container .caf-builder-preview-pagination .caf-builder-preview-page-no'
		);

		if ( $include_pages ) {
			$this->collect_pagination_css(
				$style->meta2,
				'.caf-builder-container .caf-builder-preview-pagination-container .caf-builder-preview-pages'
			);
		}

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style->meta1,
				'hover',
				'.caf-builder-container .caf-builder-preview-pagination .caf-builder-preview-page-no:hover'
			)
		);
		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style->meta1,
				'selected',
				'.caf-builder-container .caf-builder-preview-pagination .caf-builder-preview-page-no.active'
			)
		);

		$this->collect_pagination_css(
			$style->meta,
			'.caf-builder-container .caf-builder-preview-pagination .caf-builder-preview-next-btn'
		);
	}

	/**
	 * Render number pagination.
	 *
	 * @param object $pagination_data Pagination data.
	 * @param bool   $next_prev         Whether to render prev/next controls.
	 * @return string
	 */
	protected function render_number_pagination( $pagination_data, $next_prev ) {
		$total_pages = max( 1, (int) $this->query->max_num_pages );

		if ( $total_pages <= 1 ) {
			return '';
		}

		$this->collect_number_pagination_styles( $pagination_data, (bool) $next_prev );

		$html = '';

		if ( $next_prev && $this->current_page > 1 ) {
			$html .= '<div class="caf-builder-preview-prev-btn" type="prev">';
			$html .= $this->render_pagination_button_content( $pagination_data, 'prev' );
			$html .= '</div>';
		}

		$page_markup = $this->build_page_number_markup( $pagination_data, $total_pages );

		if ( $next_prev ) {
			$html .= '<div class="caf-builder-preview-pages">';
			$html .= $page_markup;
			$html .= '</div>';
		} else {
			$html .= $page_markup;
		}

		if ( $next_prev && $this->current_page < $total_pages ) {
			$html .= '<div class="caf-builder-preview-next-btn" type="next">';
			$html .= $this->render_pagination_button_content( $pagination_data, 'next' );
			$html .= '</div>';
		}

		return $html;
	}

	/**
	 * Render pagination button inner content (text or icon).
	 *
	 * @param object $pagination_data Pagination data.
	 * @param string $direction       Either "prev" or "next".
	 * @return string
	 */
	protected function render_pagination_button_content( $pagination_data, $direction ) {
		$config = $this->get_pagination_setting( $pagination_data, 'prev' === $direction ? 'prev' : 'next' );

		if ( empty( $config ) || ! is_object( $config ) ) {
			return esc_html( 'prev' === $direction ? __( 'Previous', 'category-ajax-filter' ) : __( 'Next', 'category-ajax-filter' ) );
		}

		$type = isset( $config->type ) ? (string) $config->type : 'text';

		if ( 'icon' === $type && ! empty( $config->icons ) && is_object( $config->icons ) ) {
			$icon_data = clone $config->icons;
			if ( empty( $icon_data->type ) ) {
				$icon_data->type = 'icon';
			}
			if ( 'icon' === $icon_data->type && empty( $icon_data->icon ) ) {
				$icon_data->icon = 'prev' === $direction ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
			}
			return $this->render_pagination_icon_markup( $icon_data );
		}

		$fallback = 'prev' === $direction ? __( 'Previous', 'category-ajax-filter' ) : __( 'Next', 'category-ajax-filter' );
		$text     = ! empty( $config->text ) ? (string) $config->text : $fallback;

		return esc_html( $text );
	}

	/**
	 * Render icon markup for pagination buttons.
	 *
	 * @param object $icon_data Icon settings object.
	 * @return string
	 */
	protected function render_pagination_icon_markup( $icon_data ) {
		if ( ! $this->is_builder_flag_enabled( isset( $icon_data->visibility ) ? $icon_data->visibility : false ) ) {
			return '';
		}

		$type = isset( $icon_data->type ) ? (string) $icon_data->type : 'icon';

		if ( 'svg' === $type && ! empty( $icon_data->icon ) && is_object( $icon_data->icon ) && ! empty( $icon_data->icon->url ) ) {
			return '<img class="caf-inline-svg-icon svg-dynamic" src="' . esc_url( $icon_data->icon->url ) . '" alt="" />';
		}

		if ( 'icon' === $type && ! empty( $icon_data->icon ) ) {
			return '<i class="' . esc_attr( (string) $icon_data->icon ) . '" aria-hidden="true"></i>';
		}

		return '';
	}

	/**
	 * Whether a builder boolean flag is enabled.
	 *
	 * @param mixed $value Raw flag value.
	 * @return bool
	 */
	protected function is_builder_flag_enabled( $value ) {
		if ( true === $value || 1 === $value ) {
			return true;
		}

		return 'true' === strtolower( (string) $value );
	}

	/**
	 * Collect pagination CSS.
	 *
	 * @param mixed  $style    Style object.
	 * @param string $selector CSS selector.
	 * @return void
	 */
	protected function collect_pagination_css( $style, $selector ) {
		if ( empty( $style ) || empty( $selector ) ) {
			return;
		}

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style,
				'default',
				$selector
			)
		);

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style,
				'hover',
				$selector . ':hover'
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

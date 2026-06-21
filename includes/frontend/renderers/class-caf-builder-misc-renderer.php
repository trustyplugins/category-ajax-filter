<?php
/**
 * Frontend Builder Misc Renderer
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Builder_Misc_Renderer {

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
	 * Query builder.
	 *
	 * @var CAF_Builder_Query
	 */
	protected $query_builder;

	/**
	 * Constructor.
	 *
	 * @param CAF_Builder_Data            $data_handler    Data handler.
	 * @param CAF_Builder_Css             $css_builder     CSS builder.
	 * @param CAF_Builder_Query           $query_builder   Query builder.
	 * @param CAF_Builder_Style_Generator $style_generator Style generator.
	 */
	public function __construct(
		CAF_Builder_Data $data_handler,
		CAF_Builder_Css $css_builder,
		CAF_Builder_Query $query_builder,
		CAF_Builder_Style_Generator $style_generator
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

		if ( ! empty( $loader_data->icon_data->style ) && ! empty( $loader_data->overlay ) && 'true' === $loader_data->overlay ) {
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

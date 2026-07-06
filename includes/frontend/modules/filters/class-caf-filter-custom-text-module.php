<?php
/**
 * Frontend Builder Custom Text Filter Module
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Filter_Custom_Text_Module extends CAF_Filter_Base_Module {

	/**
	 * Render module.
	 *
	 * @return string
	 */
	public function render() {
		$settings    = $this->get_settings();
		$custom_text = __( 'Custom Text', 'category-ajax-filter' );
		if ( isset( $settings->customText ) && '' !== trim( (string) $settings->customText ) ) {
			$custom_text = (string) $settings->customText;
		}
		$icon_data   = isset( $settings->icons ) ? $settings->icons : new stdClass();

		$this->collect_css();

		$html  = $this->render_custom_text_icon( $icon_data, 'before-customtext', 'margin-right:5px;' );
		$html .= '<div class="caf-filter-custom-text-content">' . wp_kses_post( (string) $custom_text ) . '</div>';
		$html .= $this->render_custom_text_icon( $icon_data, 'after-customtext', 'margin-left:5px;' );

		return $html;
	}

	/**
	 * Collect module CSS.
	 *
	 * @return void
	 */
	protected function collect_css() {
		$container_style = $this->get_style_section( 'container' );
		$icon_style      = $this->get_style_section( 'icon' );
		$module_selector = $this->get_module_selector();

		$this->collect_default_and_hover_css( $container_style, $module_selector );
		$this->collect_default_and_hover_css( $icon_style, $module_selector . ' i' );
		$this->collect_default_and_hover_css( $icon_style, $module_selector . ' svg' );
		$this->collect_default_and_hover_css( $icon_style, $module_selector . ' img.caf-inline-svg-icon' );
	}

	/**
	 * Render before/after custom text icon markup.
	 *
	 * @param object $icon_data Icon settings.
	 * @param string $position  Expected icon position slug.
	 * @param string $style     Inline style attribute value.
	 * @return string
	 */
	protected function render_custom_text_icon( $icon_data, $position, $style = '' ) {
		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'customtext_module_icon' ) ) {
			return '';
		}

		if ( empty( $icon_data ) || ! is_object( $icon_data ) ) {
			return '';
		}

		if ( ! $this->is_truthy( isset( $icon_data->visibility ) ? $icon_data->visibility : false ) ) {
			return '';
		}

		$icon_position = isset( $icon_data->position ) ? (string) $icon_data->position : '';
		if ( '' === $icon_position || $position !== $icon_position ) {
			return '';
		}

		$icon_type  = isset( $icon_data->type ) ? (string) $icon_data->type : 'icon';
		$icon_value = isset( $icon_data->icon ) ? $icon_data->icon : '';

		if ( 'svg' === $icon_type && is_object( $icon_value ) && ! empty( $icon_value->url ) ) {
			return '<img class="caf-inline-svg-icon svg-dynamic" src="' . esc_url( $icon_value->url ) . '" alt="" style="' . esc_attr( $style ) . '" />';
		}

		if ( is_string( $icon_value ) && '' !== $icon_value ) {
			return '<i data-icon-name="' . esc_attr( $icon_value ) . '" value="' . esc_attr( $icon_value ) . '" class="' . esc_attr( $icon_value ) . '" style="' . esc_attr( $style ) . '"></i>';
		}

		return '';
	}
}

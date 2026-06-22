<?php
/**
 * Frontend Builder Reset Filter Module
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Filter_Reset_Module extends CAF_Filter_Base_Module {

	/**
	 * Default reset button label.
	 *
	 * @var string
	 */
	const DEFAULT_RESET_LABEL = 'Reset Filters';

	/**
	 * Default reset icon class.
	 *
	 * @var string
	 */
	const DEFAULT_RESET_ICON = 'fas fa-redo';

	/**
	 * Render module.
	 *
	 * @return string
	 */
	public function render() {
		$settings    = $this->get_settings();
		$reset_label = isset( $settings->reset_label ) && '' !== (string) $settings->reset_label
			? (string) $settings->reset_label
			: self::DEFAULT_RESET_LABEL;

		$this->collect_css();

		$toggle_closed_class = $this->get_toggle_closed_class();
		$output_class        = 'caf-filter-module-reset-output';
		if ( '' !== $toggle_closed_class ) {
			$output_class .= ' ' . $toggle_closed_class;
		}

		$html  = $this->render_label();
		$html .= '<div class="' . esc_attr( $output_class ) . '">';
		$html .= $this->render_reset_content( $settings, $reset_label );
		$html .= '</div>';

		return $html;
	}

	/**
	 * Render reset button content (icon + label or plain label).
	 *
	 * @param object $settings    Module settings.
	 * @param string $reset_label Reset label text.
	 * @return string
	 */
	protected function render_reset_content( $settings, $reset_label ) {
		$icons = isset( $settings->icons ) && is_object( $settings->icons ) ? $settings->icons : null;

		if ( ! $this->should_show_reset_icon( $icons ) ) {
			return esc_html( $reset_label );
		}

		$icon_data = clone $icons;
		if ( empty( $icon_data->type ) ) {
			$icon_data->type = 'icon';
		}
		if ( 'icon' === $icon_data->type && ( ! isset( $icon_data->icon ) || '' === (string) $icon_data->icon ) ) {
			$icon_data->icon = self::DEFAULT_RESET_ICON;
		}
		$html  = $this->render_icon_markup( $icon_data );
		$html .= esc_html( $reset_label );
		return $html;
	}

	/**
	 * Whether reset icon should be rendered (matches builder ModuleReset logic).
	 *
	 * @param object|null $icons Icons settings object.
	 * @return bool
	 */
	protected function should_show_reset_icon( $icons ) {
		if ( empty( $icons ) || ! is_object( $icons ) ) {
			return false;
		}

		if ( ! $this->is_truthy( isset( $icons->visibility ) ? $icons->visibility : false ) ) {
			return false;
		}

		$type = isset( $icons->type ) ? (string) $icons->type : 'icon';

		if ( 'svg' === $type ) {
			$icon = isset( $icons->icon ) ? $icons->icon : null;
			if ( ! is_object( $icon ) || empty( $icon->url ) ) {
				return false;
			}
			return (bool) preg_match( '/\.svg$/i', (string) $icon->url );
		}

		$icon = isset( $icons->icon ) ? $icons->icon : '';
		return is_string( $icon ) && '' !== $icon;
	}

	/**
	 * Collect module CSS.
	 *
	 * @return void
	 */
	protected function collect_css() {
		$container_style   = $this->get_style_section( 'container' );
		$icon_style        = $this->get_style_section( 'icon' );
		$module_selector   = $this->get_module_selector();
		$output_selector   = $module_selector . ' .caf-filter-module-reset-output';
		$icon_selector_i   = $module_selector . ' i';
		$icon_selector_svg = $module_selector . ' svg';
		$icon_selector_img = $module_selector . ' img.caf-inline-svg-icon';

		//$this->collect_default_and_hover_css( $container_style, $output_selector );
		$this->collect_default_and_hover_css( $icon_style, $icon_selector_i );
		$this->collect_default_and_hover_css( $icon_style, $icon_selector_svg );
		$this->collect_default_and_hover_css( $icon_style, $icon_selector_img );
	}
}

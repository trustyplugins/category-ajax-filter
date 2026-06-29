<?php
/**
 * Shared WooCommerce checkbox-style filter module base.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class CAF_Woo_Filter_Base_Module extends CAF_PRO_Filter_Base_Module {

	/**
	 * @return string
	 */
	abstract protected function get_woo_data_source();

	/**
	 * @return string
	 */
	abstract protected function get_woo_meta_key();

	/**
	 * @return string
	 */
	abstract protected function get_woo_meta_compare();

	/**
	 * @return string
	 */
	abstract protected function get_woo_meta_type();

	/**
	 * @return string
	 */
	abstract protected function get_list_css_class();

	/**
	 * @return array<int, array<string, string>>
	 */
	abstract protected function get_default_options();

	/**
	 * Render module.
	 *
	 * @return string
	 */
	public function render() {
		$settings = $this->get_settings();
		$this->collect_css();
		$html  = $this->render_label();
		$html .= $this->render_options_markup( $settings );
		return $html;
	}

	/**
	 * @param object $settings Module settings.
	 * @return string
	 */
	protected function render_options_markup( $settings ) {
		$options       = $this->resolve_options( $settings );
		$multiple_term = isset( $settings->multiple_term ) ? (string) $settings->multiple_term : 'true';
		$show_checkbox = $this->is_truthy( isset( $settings->show_checkbox ) ? $settings->show_checkbox : 'true' );
		$list_class    = $this->get_list_css_class();
		$module_id     = (string) $this->module_key;
		$data_source   = $this->get_woo_data_source();
		$meta_key      = $this->get_woo_meta_key();
		$meta_compare  = $this->get_woo_meta_compare();
		$meta_type     = $this->get_woo_meta_type();

		$html  = '<ul class="caf-terms-list ' . esc_attr( $list_class ) . '"';
		$html .= ' data-source="' . esc_attr( $data_source ) . '"';
		$html .= ' filter-type="checkbox"';
		$html .= ' multiple-term="' . esc_attr( $multiple_term ) . '"';
		$html .= ' row-id="' . esc_attr( $this->row_key ) . '"';
		$html .= ' column-id="' . esc_attr( $this->column_key ) . '"';
		$html .= ' data-key="' . esc_attr( $meta_key ) . '"';
		$html .= ' meta-operator="' . esc_attr( $meta_compare ) . '"';
		$html .= ' meta-type="' . esc_attr( $meta_type ) . '"';
		$html .= ' module-id="' . esc_attr( $module_id ) . '"';
		$html .= ' category-relation="OR"';
		$html .= '>';

		foreach ( $options as $option ) {
			$value = isset( $option['value'] ) ? (string) $option['value'] : '';
			$label = isset( $option['label'] ) ? (string) $option['label'] : $value;
			if ( '' === $value ) {
				continue;
			}

			$html .= '<li class="caf-terms-list-item caf-layout-row" data-key="' . esc_attr( $meta_key ) . '" term-id="' . esc_attr( $value ) . '" term-value="' . esc_attr( $value ) . '">';
			if ( $show_checkbox ) {
				$html .= '<input type="checkbox" style="display:none" class="caf-taxo-input checkbox_skin1" value="' . esc_attr( $value ) . '" />';
				$html .= '<span class="caf-checkbox-box"></span>';
			}
			$html .= '<div class="manage-ic-lbl caf-layout-row"><div class="manage-text-lbl caf-layout-row">';
			$html .= '<span class="trm-name caf-term-label">' . esc_html( $label ) . '</span>';
			$html .= '</div></div></li>';
		}

		$html .= '</ul>';
		return $html;
	}

	/**
	 * @param object $settings Module settings.
	 * @return array<int, array<string, string>>
	 */
	protected function resolve_options( $settings ) {
		if ( isset( $settings->woo_options ) && is_array( $settings->woo_options ) && ! empty( $settings->woo_options ) ) {
			$options = array();
			foreach ( $settings->woo_options as $option ) {
				if ( is_object( $option ) ) {
					$options[] = array(
						'value' => isset( $option->value ) ? (string) $option->value : '',
						'label' => isset( $option->label ) ? (string) $option->label : '',
					);
				} elseif ( is_array( $option ) ) {
					$options[] = array(
						'value' => isset( $option['value'] ) ? (string) $option['value'] : '',
						'label' => isset( $option['label'] ) ? (string) $option['label'] : '',
					);
				}
			}
			if ( ! empty( $options ) ) {
				return $options;
			}
		}

		return $this->get_default_options();
	}

	/**
	 * Collect checkbox-style CSS (reuse checkbox module tabs).
	 *
	 * @return void
	 */
	protected function collect_css() {
		$settings        = $this->get_settings();
		$module_selector = $this->get_module_selector();
		$list_class      = $this->get_list_css_class();
		$ul_selector     = $module_selector . ' ul.' . $list_class;
		$li_selector     = $ul_selector . ' li';

		$this->collect_default_and_hover_css( $this->get_style_section( 'meta' ), $ul_selector );
		$this->collect_default_and_hover_css( $this->get_style_section( 'meta1' ), $li_selector );
	}
}

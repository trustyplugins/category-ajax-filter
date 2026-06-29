<?php
/**
 * WooCommerce product price range filter module.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Woo_Filter_Price_Module extends CAF_PRO_Filter_Range_Slider_Module {

	/**
	 * Render module with WooCommerce _price meta.
	 *
	 * @return string
	 */
	public function render() {
		if ( ! class_exists( 'CAF_Woo_Filter_Helper' ) ) {
			return '';
		}

		$settings = $this->get_settings();
		$bounds   = CAF_Woo_Filter_Helper::get_product_price_bounds();

		if ( ! isset( $settings->range_slider ) || ! is_object( $settings->range_slider ) ) {
			$settings->range_slider = new stdClass();
		}

		$settings->range_slider->min = isset( $settings->range_slider->min ) ? (float) $settings->range_slider->min : $bounds['min'];
		$settings->range_slider->max = isset( $settings->range_slider->max ) ? (float) $settings->range_slider->max : $bounds['max'];
		if ( $settings->range_slider->max <= 0 ) {
			$settings->range_slider->max = $bounds['max'];
		}
		if ( $settings->range_slider->min < 0 ) {
			$settings->range_slider->min = $bounds['min'];
		}

		if ( ! isset( $settings->custom_field_data ) || ! is_array( $settings->custom_field_data ) || empty( $settings->custom_field_data ) ) {
			$settings->custom_field_data = array(
				(object) array(
					'custom_field_key'        => '_price',
					'custom_field_value_list' => array(),
					'compare_operator'        => 'BETWEEN',
					'meta_type'               => 'NUMERIC',
				),
			);
		} else {
			$settings->custom_field_data[0]->custom_field_key = '_price';
		}

		if ( empty( $settings->range_slider->prefix ) || ! is_object( $settings->range_slider->prefix ) ) {
			$currency                                      = function_exists( 'get_woocommerce_currency_symbol' ) ? get_woocommerce_currency_symbol() : '$';
			$settings->range_slider->prefix                = new stdClass();
			$settings->range_slider->prefix->is_enable     = 'true';
			$settings->range_slider->prefix->value         = $currency;
		}

		$this->module->settings = $settings;

		return parent::render();
	}
}

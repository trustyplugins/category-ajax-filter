<?php
/**
 * WooCommerce on-sale filter module.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Woo_Filter_Sale_Module extends CAF_Woo_Filter_Base_Module {

	protected function get_woo_data_source() {
		return 'woo_sale';
	}

	protected function get_woo_meta_key() {
		return '_on_sale';
	}

	protected function get_woo_meta_compare() {
		return '=';
	}

	protected function get_woo_meta_type() {
		return 'CHAR';
	}

	protected function get_list_css_class() {
		return 'caf-checkbox caf-woo-sale';
	}

	protected function get_default_options() {
		return array(
			array(
				'value' => 'yes',
				'label' => __( 'On sale', 'category-ajax-filter-pro' ),
			),
		);
	}
}

<?php
/**
 * WooCommerce stock status filter module.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Woo_Filter_Stock_Module extends CAF_Woo_Filter_Base_Module {

	protected function get_woo_data_source() {
		return 'woo_meta';
	}

	protected function get_woo_meta_key() {
		return '_stock_status';
	}

	protected function get_woo_meta_compare() {
		return 'IN';
	}

	protected function get_woo_meta_type() {
		return 'CHAR';
	}

	protected function get_list_css_class() {
		return 'caf-checkbox caf-woo-stock';
	}

	protected function get_default_options() {
		return array(
			array(
				'value' => 'instock',
				'label' => __( 'In stock', 'category-ajax-filter-pro' ),
			),
			array(
				'value' => 'outofstock',
				'label' => __( 'Out of stock', 'category-ajax-filter-pro' ),
			),
			array(
				'value' => 'onbackorder',
				'label' => __( 'On backorder', 'category-ajax-filter-pro' ),
			),
		);
	}
}

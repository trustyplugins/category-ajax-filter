<?php
/**
 * WooCommerce product rating filter module.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Woo_Filter_Rating_Module extends CAF_Woo_Filter_Base_Module {

	protected function get_woo_data_source() {
		return 'woo_rating';
	}

	protected function get_woo_meta_key() {
		return '_wc_average_rating';
	}

	protected function get_woo_meta_compare() {
		return '>=';
	}

	protected function get_woo_meta_type() {
		return 'DECIMAL';
	}

	protected function get_list_css_class() {
		return 'caf-checkbox caf-woo-rating';
	}

	protected function get_default_options() {
		return array(
			array(
				'value' => '5',
				'label' => __( '5 stars & up', 'category-ajax-filter-pro' ),
			),
			array(
				'value' => '4',
				'label' => __( '4 stars & up', 'category-ajax-filter-pro' ),
			),
			array(
				'value' => '3',
				'label' => __( '3 stars & up', 'category-ajax-filter-pro' ),
			),
			array(
				'value' => '2',
				'label' => __( '2 stars & up', 'category-ajax-filter-pro' ),
			),
			array(
				'value' => '1',
				'label' => __( '1 star & up', 'category-ajax-filter-pro' ),
			),
		);
	}
}

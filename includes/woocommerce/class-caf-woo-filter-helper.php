<?php
/**
 * WooCommerce filter helpers.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Woo_Filter_Helper {

	/**
	 * @return array{min: float, max: float}
	 */
	public static function get_product_price_bounds() {
		$min = 0.0;
		$max = 1000.0;

		if ( ! class_exists( 'WooCommerce' ) ) {
			return array(
				'min' => $min,
				'max' => $max,
			);
		}

		global $wpdb;

		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT MIN(CAST(pm.meta_value AS DECIMAL(12,2))) AS min_price, MAX(CAST(pm.meta_value AS DECIMAL(12,2))) AS max_price
				FROM {$wpdb->postmeta} pm
				INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
				WHERE pm.meta_key = %s
				AND pm.meta_value <> ''
				AND p.post_type = %s
				AND p.post_status = %s",
				'_price',
				'product',
				'publish'
			),
			ARRAY_A
		);

		if ( is_array( $row ) ) {
			if ( isset( $row['min_price'] ) && is_numeric( $row['min_price'] ) ) {
				$min = (float) $row['min_price'];
			}
			if ( isset( $row['max_price'] ) && is_numeric( $row['max_price'] ) ) {
				$max = (float) $row['max_price'];
			}
		}

		if ( $max < $min ) {
			$max = $min;
		}

		if ( $max <= 0 ) {
			$max = 1000.0;
		}

		return array(
			'min' => floor( $min ),
			'max' => ceil( $max ),
		);
	}

	/**
	 * @return array<int>
	 */
	public static function get_on_sale_product_ids() {
		if ( function_exists( 'wc_get_product_ids_on_sale' ) ) {
			$ids = wc_get_product_ids_on_sale();
			return array_map( 'absint', is_array( $ids ) ? $ids : array() );
		}
		return array();
	}
}

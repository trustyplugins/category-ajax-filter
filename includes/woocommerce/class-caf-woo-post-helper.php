<?php
/**
 * WooCommerce product data helpers for post layout modules.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Woo_Post_Helper {

	/**
	 * @param int $post_id Product post ID.
	 * @return WC_Product|null
	 */
	public static function get_product( $post_id ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return null;
		}

		$product = wc_get_product( $post_id );
		if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
			return null;
		}

		return $product;
	}

	/**
	 * Product fields for builder preview JSON.
	 *
	 * @param int $post_id Product post ID.
	 * @return array<string, mixed>
	 */
	public static function get_preview_data( $post_id ) {
		$product = self::get_product( $post_id );
		if ( ! $product ) {
			return self::get_placeholder_preview_data();
		}

		$rating      = (float) $product->get_average_rating();
		$review_count = (int) $product->get_review_count();

		return array(
			'price_html'       => $product->get_price_html(),
			'regular_price'    => $product->get_regular_price(),
			'sale_price'       => $product->get_sale_price(),
			'average_rating'   => $rating,
			'review_count'     => $review_count,
			'rating_html'      => function_exists( 'wc_get_rating_html' ) ? wc_get_rating_html( $rating, $review_count ) : '',
			'add_to_cart_text' => $product->add_to_cart_text(),
			'add_to_cart_url'  => $product->add_to_cart_url(),
			'is_purchasable'   => $product->is_purchasable(),
			'is_in_stock'      => $product->is_in_stock(),
			'product_type'     => $product->get_type(),
			'product_id'       => $product->get_id(),
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	public static function get_placeholder_preview_data() {
		$currency = function_exists( 'get_woocommerce_currency_symbol' ) ? get_woocommerce_currency_symbol() : '$';

		return array(
			'price_html'       => '<span class="woocommerce-Price-amount amount"><span class="woocommerce-Price-currencySymbol">' . esc_html( $currency ) . '</span>29.00</span>',
			'regular_price'    => '29',
			'sale_price'       => '',
			'average_rating'   => 4.5,
			'review_count'     => 3,
			'rating_html'      => function_exists( 'wc_get_rating_html' ) ? wc_get_rating_html( 4.5, 3 ) : '',
			'add_to_cart_text' => __( 'Add to cart', 'woocommerce' ),
			'add_to_cart_url'  => '#',
			'is_purchasable'   => true,
			'is_in_stock'      => true,
			'product_type'     => 'simple',
			'product_id'       => 0,
		);
	}
}

<?php
/**
 * WooCommerce post layout module renderers.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Woo_Post_Renderer {

	/**
	 * @param object $settings Module settings.
	 * @param string $key      Setting key.
	 * @param mixed  $default  Default value.
	 * @return mixed
	 */
	protected static function get_setting( $settings, $key, $default = '' ) {
		return isset( $settings->{$key} ) ? $settings->{$key} : $default;
	}

	/**
	 * @param mixed $value Raw value.
	 * @return bool
	 */
	protected static function is_truthy( $value ) {
		return in_array( $value, array( true, 1, '1', 'true', 'yes', 'on' ), true );
	}

	/**
	 * @param object $module  Module object.
	 * @param int    $post_id Product post ID.
	 * @return string
	 */
	public static function render_price( $module, $post_id ) {
		$product = CAF_Woo_Post_Helper::get_product( $post_id );
		if ( ! $product ) {
			return '';
		}

		$price_html = $product->get_price_html();
		if ( '' === $price_html ) {
			return '';
		}

		return '<div class="caf-woo-price-output price">' . $price_html . '</div>';
	}

	/**
	 * @param object $module  Module object.
	 * @param int    $post_id Product post ID.
	 * @return string
	 */
	public static function render_rating( $module, $post_id ) {
		$product = CAF_Woo_Post_Helper::get_product( $post_id );
		if ( ! $product ) {
			return '';
		}

		$settings     = isset( $module->settings ) ? $module->settings : new stdClass();
		$show_count   = self::is_truthy( self::get_setting( $settings, 'show_review_count', 'true' ) );
		$rating       = (float) $product->get_average_rating();
		$review_count = (int) $product->get_review_count();
		$html         = '';

		if ( function_exists( 'wc_get_rating_html' ) ) {
			$stars = wc_get_rating_html( $rating, $review_count );
			if ( $stars ) {
				$html .= '<div class="caf-woo-rating-output star-rating">' . $stars . '</div>';
			}
		}

		if ( $show_count && $review_count > 0 ) {
			/* translators: %d: review count */
			$html .= '<span class="caf-woo-review-count">(' . esc_html( sprintf( _n( '%d review', '%d reviews', $review_count, 'category-ajax-filter-pro' ), $review_count ) ) . ')</span>';
		}

		return $html;
	}

	/**
	 * @param object $module  Module object.
	 * @param int    $post_id Product post ID.
	 * @return string
	 */
	public static function render_add_to_cart( $module, $post_id ) {
		$product = CAF_Woo_Post_Helper::get_product( $post_id );
		if ( ! $product ) {
			return '';
		}

		$settings    = isset( $module->settings ) ? $module->settings : new stdClass();
		$button_text = self::get_setting( $settings, 'changeButtonValue', '' );
		if ( '' === trim( (string) $button_text ) ) {
			$button_text = $product->add_to_cart_text();
		}

		$classes = array(
			'button',
			'product_type_' . $product->get_type(),
			'add_to_cart_button',
			'caf-woo-add-to-cart-button',
		);

		if ( $product->supports( 'ajax_add_to_cart' ) && $product->is_purchasable() && $product->is_in_stock() ) {
			$classes[] = 'ajax_add_to_cart';
		}

		$attributes = array(
			'data-product_id'  => $product->get_id(),
			'data-product_sku' => $product->get_sku(),
			'aria-label'       => wp_strip_all_tags( $product->add_to_cart_description() ),
			'rel'              => 'nofollow',
		);

		if ( $product->supports( 'ajax_add_to_cart' ) ) {
			$attributes['data-quantity'] = '1';
		}

		$attr_string = '';
		foreach ( $attributes as $attr_key => $attr_value ) {
			if ( '' === (string) $attr_value ) {
				continue;
			}
			$attr_string .= ' ' . esc_attr( $attr_key ) . '="' . esc_attr( (string) $attr_value ) . '"';
		}

		$link = sprintf(
			'<a href="%s" class="%s"%s>%s</a>',
			esc_url( $product->add_to_cart_url() ),
			esc_attr( implode( ' ', array_filter( $classes ) ) ),
			$attr_string,
			esc_html( $button_text )
		);

		if ( function_exists( 'apply_filters' ) && function_exists( 'wc_implode_html_attributes' ) ) {
			$link = apply_filters(
				'woocommerce_loop_add_to_cart_link',
				$link,
				$product,
				array(
					'quantity'   => 1,
					'class'      => implode( ' ', array_filter( $classes ) ),
					'attributes' => $attributes,
				)
			);
		}

		return '<div class="caf-woo-add-to-cart-output">' . $link . '</div>';
	}
}

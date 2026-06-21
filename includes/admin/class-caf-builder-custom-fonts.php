<?php
/**
 * Custom fonts — free tier stub (upload/registry is Pro-only).
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Builder_Custom_Fonts {

	const OPTION_KEY = 'caf_builder_custom_fonts';

	/**
	 * @return array<string, array<string, mixed>>
	 */
	public static function get_registry() {
		return array();
	}

	/**
	 * @return array<string, string>
	 */
	public static function get_family_css_map() {
		return array();
	}

	/**
	 * @param string $family Font family.
	 * @return string
	 */
	public static function get_css_url_for_family( $family ) {
		return '';
	}

	/**
	 * @return array<int, array<string, mixed>>
	 */
	public static function get_fonts_for_api() {
		return array();
	}

	/**
	 * @return true|WP_Error
	 */
	protected static function assert_custom_fonts_allowed() {
		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'custom_fonts' ) ) {
			return new WP_Error(
				'caf_tier_forbidden',
				__( 'Custom fonts are available in Category Ajax Filter Pro.', 'category-ajax-filter' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_list_fonts() {
		$allowed = self::assert_custom_fonts_allowed();
		if ( is_wp_error( $allowed ) ) {
			return $allowed;
		}

		return rest_ensure_response(
			array(
				'status' => 'success',
				'fonts'  => array(),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_upload_font( $request ) {
		$allowed = self::assert_custom_fonts_allowed();
		if ( is_wp_error( $allowed ) ) {
			return $allowed;
		}

		return new WP_Error(
			'caf_tier_forbidden',
			__( 'Custom font upload is not available in the free version.', 'category-ajax-filter' ),
			array( 'status' => 403 )
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_delete_font( $request ) {
		$allowed = self::assert_custom_fonts_allowed();
		if ( is_wp_error( $allowed ) ) {
			return $allowed;
		}

		return new WP_Error(
			'caf_tier_forbidden',
			__( 'Custom font delete is not available in the free version.', 'category-ajax-filter' ),
			array( 'status' => 403 )
		);
	}
}

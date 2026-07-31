<?php
/**
 * Frontend Builder Font Loader
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Builder_Font_Loader {

	/**
	 * Enqueued fonts.
	 *
	 * @var array
	 */
	protected static $enqueued_fonts = array();

	/**
	 * Enqueue font family once.
	 *
	 * @param string $font_family Font family.
	 * @return void
	 */
	public static function enqueue_font_family( $font_family ) {
		if ( empty( $font_family ) || ! is_string( $font_family ) ) {
			return;
		}

		if ( in_array( $font_family, self::$enqueued_fonts, true ) ) {
			return;
		}

		self::$enqueued_fonts[] = $font_family;

		$custom_css_url = '';
		if ( ! class_exists( 'CAF_Builder_Tier' ) || CAF_Builder_Tier::can_use_feature( 'custom_fonts' ) ) {
			if ( ! class_exists( 'CAF_Builder_Custom_Fonts' ) ) {
				$custom_fonts_file = defined( 'TC_CAF_PATH' )
					? TC_CAF_PATH . 'includes/admin/class-caf-builder-custom-fonts.php'
					: '';
				if ( $custom_fonts_file && file_exists( $custom_fonts_file ) ) {
					require_once $custom_fonts_file;
				}
			}
			if ( class_exists( 'CAF_Builder_Custom_Fonts' ) ) {
				$custom_css_url = CAF_Builder_Custom_Fonts::get_css_url_for_family( $font_family );
			}
		}

		if ( ! empty( $custom_css_url ) ) {
			wp_enqueue_style(
				'caf-builder-custom-font-' . sanitize_title( $font_family ),
				$custom_css_url,
				array(),
				defined( 'TC_CAF_PLUGIN_VERSION' ) ? TC_CAF_PLUGIN_VERSION : null
			);
			return;
		}

		if ( ! class_exists( 'CAF_Builder_Google_Fonts' ) ) {
			$google_fonts_file = defined( 'TC_CAF_PATH' )
				? TC_CAF_PATH . 'includes/frontend/class-caf-builder-google-fonts.php'
				: '';
			if ( $google_fonts_file && file_exists( $google_fonts_file ) ) {
				require_once $google_fonts_file;
			}
		}

		$google_fonts_url = class_exists( 'CAF_Builder_Google_Fonts' )
			? CAF_Builder_Google_Fonts::build_stylesheet_url( $font_family )
			: 'https://fonts.googleapis.com/css2?family=' . rawurlencode( preg_replace( '/\s+/', '+', $font_family ) ) . ':wght@100;200;300;400;500;600;700;800;900&display=swap';

		wp_enqueue_style(
			'caf-builder-custom-font-' . sanitize_title( $font_family ),
			$google_fonts_url,
			array(),
			defined( 'TC_CAF_PLUGIN_VERSION' ) ? TC_CAF_PLUGIN_VERSION : null
		);
	}
}
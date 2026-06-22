<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'CAF_Fa_Icons' ) ) {
	class CAF_Fa_Icons {
		/**
		 * @var array<int, array{class: string}>|null
		 */
		public $icons;

		public function __construct() {}

		public function caf_generate_icon_array() {
			$icons = get_option( 'caf_fa_icons' );
			if ( ! $icons ) {
				$json_path = TC_CAF_PATH . 'admin/fa-icons/fontawesome-5.json';
				if ( ! file_exists( $json_path ) ) {
					$this->icons = array();
					return;
				}

				// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local bundled JSON file.
				$all_icons = json_decode( file_get_contents( $json_path ), true );
				$icons     = array();
				if ( is_array( $all_icons ) ) {
					foreach ( $all_icons as $icon ) {
						$icons[] = array( 'class' => $icon );
					}
					update_option( 'caf_fa_icons', $icons );
				}
			}
			$this->icons = is_array( $icons ) ? $icons : array();
		}
	}
}

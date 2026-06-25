<?php
/**
 * Enqueue react-builder on the caf_posts list screen (free tier).
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Builder_Admin {

	public function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_builder_assets' ) );
		add_filter( 'admin_body_class', array( $this, 'append_builder_body_class' ) );
	}

	/**
	 * @param string $classes Space-separated admin body classes.
	 * @return string
	 */
	public function append_builder_body_class( $classes ) {
		global $post_type, $pagenow;

		if ( 'caf_posts' === $post_type && 'edit.php' === $pagenow ) {
			$classes .= ' post-type-caf_posts';
		}

		return $classes;
	}

	/**
	 * @param string $hook_suffix Current admin page hook.
	 * @return void
	 */
	public function enqueue_builder_assets( $hook_suffix ) {
		global $post_type;

		if ( 'caf_posts' !== $post_type || 'edit.php' !== $hook_suffix ) {
			return;
		}

		wp_enqueue_style(
			'tc_caf-custom-admin-font-style',
			TC_CAF_URL . 'admin/css/custom-font.css',
			array(),
			TC_CAF_PLUGIN_VERSION
		);

		$builder_asset_path = TC_CAF_PATH . 'react-builder/build/index.asset.php';
		$builder_asset_url  = trailingslashit( TC_CAF_URL ) . 'react-builder/build/';

		if ( ! file_exists( TC_CAF_PATH . 'react-builder/build/index.js' ) ) {
			add_action(
				'admin_notices',
				static function () {
					echo '<div class="notice notice-warning"><p>';
					echo esc_html__(
						'CAF Builder assets are missing. Run npm run build in the Pro plugin react-builder folder, then npm run sync:free.',
						'category-ajax-filter'
					);
					echo '</p></div>';
				}
			);
			return;
		}

		wp_enqueue_style(
			'tc_caf-custom-builder-admin-style',
			TC_CAF_URL . 'admin/css/custom-builder.css',
			array(),
			TC_CAF_PLUGIN_VERSION
		);

		wp_enqueue_style(
			'tc-caf-font-awesome-all-style',
			TC_CAF_URL . 'assets/css/fontawesome/css/all.min.css',
			array(),
			TC_CAF_PLUGIN_VERSION
		);
		wp_enqueue_style(
			'tc-caf-font-awesome-style',
			TC_CAF_URL . 'assets/css/fontawesome/css/font-awesome.min.css',
			array(),
			TC_CAF_PLUGIN_VERSION
		);

		wp_enqueue_style(
			'google-fonts-inter',
			'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
			array(),
			null
		); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion

		wp_enqueue_media();

		$asset_meta      = file_exists( $builder_asset_path ) ? require $builder_asset_path : array(
			'dependencies' => array( 'wp-element' ),
			'version'      => null,
		);
		$builder_deps    = ! empty( $asset_meta['dependencies'] ) ? $asset_meta['dependencies'] : array( 'wp-element' );

		// Ensure React packages are registered on admin screens that do not load the block editor.
		foreach ( array( 'wp-element', 'react', 'react-dom', 'react-jsx-runtime' ) as $script_handle ) {
			if ( in_array( $script_handle, $builder_deps, true ) && wp_script_is( $script_handle, 'registered' ) ) {
				wp_enqueue_script( $script_handle );
			}
		}

		$builder_version = ! empty( $asset_meta['version'] )
			? $asset_meta['version']
			: filemtime( TC_CAF_PATH . 'react-builder/build/index.js' );

		wp_enqueue_style(
			'caf-react-builder-style',
			$builder_asset_url . 'index.css',
			array(),
			$builder_version
		);

		wp_enqueue_script(
			'caf-react-builder-script',
			$builder_asset_url . 'index.js',
			$builder_deps,
			$builder_version,
			true
		);

		wp_localize_script(
			'caf-react-builder-script',
			'tc_caf_ajax',
			array_merge(
				array(
					'ajax_url'      => admin_url( 'admin-ajax.php' ),
					'nonce'         => wp_create_nonce( 'tc_caf_ajax_nonce' ),
					'rest_nonce'    => wp_create_nonce( 'wp_rest' ),
					'plugin_path'   => TC_CAF_URL,
					'site_base_url' => site_url(),
					'rest_api_base' => esc_url_raw( rest_url( 'caf-custom-builder/v1/' ) ),
					'custom_fonts'  => array(),
					'support_env'   => class_exists( 'CAF_Support_Diagnostics' )
						? CAF_Support_Diagnostics::get_support_env()
						: array(),
				),
				CAF_Builder_Tier::get_ajax_config()
			)
		);

		wp_enqueue_script(
			'tc-caf-builder-script',
			TC_CAF_URL . 'admin/js/custom-builder.js',
			array( 'jquery', 'wp-element' ),
			TC_CAF_PLUGIN_VERSION,
			true
		);
	}
}

new CAF_Builder_Admin();

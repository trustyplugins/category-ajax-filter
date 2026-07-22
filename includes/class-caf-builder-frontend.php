<?php
/**
 * Public-site renderer for visual builder layouts ([caf_filter id="caf_N"]).
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Boots builder frontend assets and renders published layout JSON on the public site.
 */
class CAF_Builder_Frontend {

	/**
	 * Per-request HTML cache keyed by shortcode index.
	 *
	 * @var array<int, string>
	 */
	protected static $builder_render_cache = array();

	/**
	 * Singleton instance.
	 *
	 * @var self|null
	 */
	protected static $instance = null;

	/**
	 * Get singleton.
	 *
	 * @return self
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		add_filter( 'the_posts', array( $this, 'maybe_prerender_on_the_posts' ), 20, 1 );
	}

	/**
	 * Render builder shortcode output.
	 *
	 * @param string $id Shortcode id (caf_{index}).
	 * @return string
	 */
	public function render_shortcode( $id ) {
		$shortindex = $this->parse_builder_shortindex( $id );
		if ( null === $shortindex ) {
			return esc_html( $id . " does not have a numeric index after 'caf_'" );
		}

		if ( array_key_exists( $shortindex, self::$builder_render_cache ) ) {
			return self::$builder_render_cache[ $shortindex ];
		}

		if ( ! is_admin() ) {
			$this->enqueue_builder_frontend_bootstrap();
		}

		$html = $this->prerender_builder_shortcode_for_head( $id );
		if ( null !== $html ) {
			return $html;
		}

		return esc_html__( 'Layout does not exist or is not published.', 'category-ajax-filter' );
	}

	/**
	 * Pre-render builder shortcodes during the_posts so CSS loads in head.
	 *
	 * @param array $posts Queried posts.
	 * @return array
	 */
	public function maybe_prerender_on_the_posts( $posts ) {
		if ( is_admin() || empty( $posts ) || ! is_array( $posts ) ) {
			return $posts;
		}

		$builder_ids = array();
		foreach ( $posts as $post ) {
			if ( empty( $post->post_content ) ) {
				continue;
			}
			$builder_ids = array_merge(
				$builder_ids,
				$this->extract_builder_shortcode_ids_from_content( $post->post_content )
			);
		}

		$builder_ids = array_values( array_unique( array_filter( $builder_ids ) ) );
		if ( empty( $builder_ids ) ) {
			return $posts;
		}

		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::allows_multiple_filters_per_page() ) {
			$builder_ids = array_slice( $builder_ids, 0, 1 );
		}

		$this->enqueue_builder_frontend_bootstrap();
		foreach ( $builder_ids as $builder_id ) {
			$this->prerender_builder_shortcode_for_head( $builder_id );
		}

		return $posts;
	}

	/**
	 * Parse caf_{index} into integer index.
	 *
	 * @param string $id Shortcode id.
	 * @return int|null
	 */
	public function parse_builder_shortindex( $id ) {
		if ( ! is_string( $id ) || 0 !== strpos( $id, 'caf_' ) ) {
			return null;
		}

		$suffix = substr( $id, 4 );
		if ( '' === $suffix || ! is_numeric( $suffix ) ) {
			return null;
		}

		return (int) $suffix;
	}

	/**
	 * Whether the shortcode id targets a visual builder layout.
	 *
	 * @param mixed $id Shortcode id.
	 * @return bool
	 */
	public function is_builder_shortcode_id( $id ) {
		return is_string( $id ) && 0 === strpos( $id, 'caf_' ) && null !== $this->parse_builder_shortindex( $id );
	}

	/**
	 * Extract builder shortcode ids from post content.
	 *
	 * @param string $content Post content.
	 * @return array<int, string>
	 */
	protected function extract_builder_shortcode_ids_from_content( $content ) {
		$ids = array();

		if ( ! is_string( $content ) || '' === $content || false === stripos( $content, '[caf_filter' ) ) {
			return $ids;
		}

		if ( ! preg_match_all( '/\[caf_filter\b[^\]]*?\bid\s*=\s*([\'"])([^\'"]+)\1/i', $content, $matches, PREG_SET_ORDER ) ) {
			return $ids;
		}

		foreach ( $matches as $match ) {
			$id = trim( (string) $match[2] );
			if ( $this->is_builder_shortcode_id( $id ) ) {
				$ids[] = $id;
			}
		}

		return array_values( array_unique( $ids ) );
	}

	/**
	 * Render once and enqueue dynamic CSS for head.
	 *
	 * @param string $id Builder shortcode id.
	 * @return string|null
	 */
	protected function prerender_builder_shortcode_for_head( $id ) {
		$shortindex = $this->parse_builder_shortindex( $id );
		if ( null === $shortindex ) {
			return null;
		}

		if ( array_key_exists( $shortindex, self::$builder_render_cache ) ) {
			return self::$builder_render_cache[ $shortindex ];
		}

		$this->enqueue_builder_assets();
		$this->load_builder_dependencies();

		if ( ! class_exists( 'CAF_Builder_Ajax_Performance' ) || ! class_exists( 'CAF_Builder_Framework' ) ) {
			return null;
		}

		$layout_bundle = CAF_Builder_Ajax_Performance::get_layout_bundle( $shortindex );
		if ( empty( $layout_bundle ) || empty( $layout_bundle['builder_data'] ) ) {
			return null;
		}

		$builder = new CAF_Builder_Framework( $layout_bundle['builder_data'], $shortindex );
		$html    = $builder->render();

		self::$builder_render_cache[ $shortindex ] = $html;

		return $html;
	}

	/**
	 * Register shared frontend handles (ajax config + common.css).
	 *
	 * @return void
	 */
	protected function register_frontend_asset_handles() {
		if ( wp_script_is( 'tc-caf-builder-ajax-config', 'registered' ) ) {
			return;
		}

		wp_register_script(
			'tc-caf-builder-ajax-config',
			false,
			array(),
			TC_CAF_PLUGIN_VERSION,
			true
		);

		$custom_font_css_map = array();

		wp_localize_script(
			'tc-caf-builder-ajax-config',
			'tc_caf_ajax',
			array(
				'ajax_url'    => admin_url( 'admin-ajax.php' ),
				'nonce'       => wp_create_nonce( 'tc_caf_ajax_nonce' ),
				'plugin_path' => TC_CAF_URL,
			)
		);

		wp_register_style(
			'tc-caf-builder-common-style',
			TC_CAF_URL . 'assets/css/common/common.css',
			array(),
			TC_CAF_PLUGIN_VERSION,
			'all'
		);
	}

	/**
	 * Enqueue minimal shared assets for builder shortcodes.
	 *
	 * @return void
	 */
	public function enqueue_builder_frontend_bootstrap() {
		if ( is_admin() ) {
			return;
		}
		$this->register_frontend_asset_handles();
		wp_enqueue_script( 'tc-caf-builder-ajax-config' );
		wp_enqueue_style( 'tc-caf-builder-common-style' );
	}

	/**
	 * Enqueue builder JS/CSS (framework, FA, dynamic base).
	 *
	 * @return void
	 */
	protected function enqueue_builder_assets() {
		$this->register_frontend_asset_handles();

		if ( ! wp_script_is( 'tc-caf-builder-front-script', 'registered' ) ) {
			wp_register_script(
				'tc-caf-builder-front-script',
				TC_CAF_URL . 'assets/js/builder-framework.js',
				array( 'jquery', 'jquery-ui-slider', 'tc-caf-builder-ajax-config' ),
				TC_CAF_PLUGIN_VERSION,
				true
			);
		}
		wp_enqueue_script( 'jquery-ui-slider' );
		wp_enqueue_script( 'tc-caf-builder-front-script' );

		$this->ensure_dynamic_base_style();

		wp_enqueue_style(
			'tc-caf-font-awesome-all-style',
			TC_CAF_URL . 'assets/css/fontawesome/css/all.min.css',
			array(),
			TC_CAF_PLUGIN_VERSION
		);
	}

	/**
	 * Register/enqueue shared dynamic-styles.css shell for inline builder CSS.
	 *
	 * @return void
	 */
	protected function ensure_dynamic_base_style() {
		$handle = 'caf-builder-style';
		$src    = TC_CAF_URL . 'assets/css/dynamic-styles.css';
		if ( ! wp_style_is( $handle, 'registered' ) ) {
			wp_register_style( $handle, $src, array(), TC_CAF_PLUGIN_VERSION, 'all' );
		}
		wp_enqueue_style( $handle );
	}

	/**
	 * Load PHP dependencies for builder frontend render.
	 *
	 * @return void
	 */
	public function load_builder_dependencies() {
		if ( is_admin() ) {
			return;
		}

		static $loaded = false;
		if ( $loaded ) {
			return;
		}
		$loaded = true;

		$base = TC_CAF_PATH . 'includes/frontend/';
		require_once $base . 'class-caf-builder-data.php';
		require_once $base . 'class-caf-builder-css.php';
		require_once $base . 'class-caf-builder-google-fonts.php';
		require_once $base . 'class-caf-builder-font-loader.php';
		require_once $base . 'class-caf-builder-style-generator.php';
		require_once $base . 'class-caf-builder-query.php';
		require_once $base . 'modules/filters/class-caf-filter-base-module.php';
		require_once $base . 'modules/filters/class-caf-filter-search-module.php';
		require_once $base . 'modules/filters/class-caf-filter-reset-module.php';
		require_once $base . 'modules/filters/class-caf-filter-custom-text-module.php';
		require_once $base . 'modules/filters/class-caf-filter-checkbox-module.php';
		require_once $base . 'modules/filters/class-caf-filter-dropdown-module.php';
		if ( file_exists( $base . 'modules/filters/class-caf-filter-range-slider-module.php' ) ) {
			require_once $base . 'modules/filters/class-caf-filter-range-slider-module.php';
		}
		require_once $base . 'modules/filters/class-caf-filter-module-factory.php';
		require_once $base . 'renderers/class-caf-builder-filter-renderer.php';
		require_once $base . 'renderers/class-caf-builder-post-renderer.php';
		require_once $base . 'renderers/class-caf-builder-pagination-renderer.php';
		require_once $base . 'renderers/class-caf-builder-misc-renderer.php';
		require_once $base . 'class-caf-builder-renderer.php';
		require_once $base . 'class-caf-builder-ajax-performance.php';
		require_once $base . 'class-caf-builder-framework.php';
	}
}

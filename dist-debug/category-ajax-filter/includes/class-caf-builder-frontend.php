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

		// Boot Main Query bridge early (before Woo/Elementor product queries).
		if ( did_action( 'init' ) ) {
			$this->boot_builder_main_query_bridge();
		} else {
			add_action( 'init', array( $this, 'boot_builder_main_query_bridge' ), 5 );
		}
		add_action( 'wp', array( $this, 'maybe_prerender_main_query_builders_for_head' ), 5 );
	}

	/**
	 * Boot main-query listing bridge (Woo archives + Elementor/Divi custom pages).
	 *
	 * @return void
	 */
	public function boot_builder_main_query_bridge() {
		if ( is_admin() && ! wp_doing_ajax() ) {
			return;
		}

		$base = TC_CAF_PATH . 'includes/frontend/';
		$deps = array(
			'class-caf-builder-ajax-performance.php',
			'class-caf-builder-data.php',
			'class-caf-builder-query.php',
			'class-caf-builder-main-query.php',
		);
		foreach ( $deps as $file ) {
			$path = $base . $file;
			if ( file_exists( $path ) ) {
				require_once $path;
			}
		}

		if ( class_exists( 'CAF_Builder_Main_Query' ) ) {
			CAF_Builder_Main_Query::init();
		}
	}

	/**
	 * Pre-render filter-only layouts on matching archives so CSS is in wp_head.
	 *
	 * @return void
	 */
	public function maybe_prerender_main_query_builders_for_head() {
		if ( is_admin() || wp_doing_ajax() || is_feed() ) {
			return;
		}

		if ( ! class_exists( 'CAF_Builder_Main_Query' ) ) {
			return;
		}

		$indexes = CAF_Builder_Main_Query::get_main_query_indexes();
		if ( empty( $indexes ) ) {
			return;
		}

		$active = CAF_Builder_Main_Query::resolve_active_builder_index();
		if ( null === $active ) {
			return;
		}

		$index = absint( $active );
		if ( array_key_exists( $index, self::$builder_render_cache ) ) {
			return;
		}

		$this->prerender_builder_shortcode_for_head( 'caf_' . $index );
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

		// Custom page: bind Main Query when shortcode renders (Elementor/Divi/widgets).
		if ( class_exists( 'CAF_Builder_Main_Query' )
			&& CAF_Builder_Main_Query::is_main_query_layout( $shortindex )
		) {
			CAF_Builder_Main_Query::bind_layout_to_request( $shortindex );
		}

		if ( array_key_exists( $shortindex, self::$builder_render_cache ) ) {
			return self::$builder_render_cache[ $shortindex ];
		}

		if ( $this->allows_builder_frontend_render() ) {
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

		$main_query_per_page = 10;
		if ( class_exists( 'CAF_Builder_Main_Query' ) && method_exists( 'CAF_Builder_Main_Query', 'get_default_catalog_per_page' ) ) {
			$main_query_per_page = (int) CAF_Builder_Main_Query::get_default_catalog_per_page();
		} elseif ( function_exists( 'wc_get_default_products_per_row' ) && function_exists( 'wc_get_default_product_rows_per_page' ) ) {
			$main_query_per_page = max( 1, (int) wc_get_default_products_per_row() * (int) wc_get_default_product_rows_per_page() );
		} else {
			$main_query_per_page = max( 1, (int) get_option( 'posts_per_page', 10 ) );
		}

		wp_localize_script(
			'tc-caf-builder-ajax-config',
			'tc_caf_ajax',
			array(
				'ajax_url'            => admin_url( 'admin-ajax.php' ),
				'nonce'               => wp_create_nonce( 'tc_caf_ajax_nonce' ),
				'plugin_path'         => TC_CAF_URL,
				'main_query_per_page' => $main_query_per_page,
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
	 * Whether builder frontend render/assets may run.
	 *
	 * Elementor editor re-renders widgets via admin-ajax (is_admin() === true).
	 * Without this exception, shortcode/widget preview returns a false "not published" error.
	 *
	 * @return bool
	 */
	protected function allows_builder_frontend_render() {
		if ( ! is_admin() ) {
			return true;
		}

		// Elementor re-renders widgets via admin-ajax only.
		if ( wp_doing_ajax() ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only request routing.
			$action = isset( $_REQUEST['action'] ) ? sanitize_key( wp_unslash( $_REQUEST['action'] ) ) : '';
			if ( 'elementor_ajax' === $action ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Enqueue minimal shared assets for builder shortcodes.
	 *
	 * @return void
	 */
	public function enqueue_builder_frontend_bootstrap() {
		if ( ! $this->allows_builder_frontend_render() ) {
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

		$is_elementor_canvas = class_exists( 'CAF_Elementor' ) && CAF_Elementor::is_editor_or_preview_render();

		// Never load builder-framework.js inside Elementor editor/AJAX — it blanks the canvas.
		if ( ! $is_elementor_canvas ) {
			if ( ! wp_script_is( 'tc-caf-builder-front-script', 'registered' ) ) {
				$builder_js = TC_CAF_PATH . 'assets/js/builder-framework.js';
				wp_register_script(
					'tc-caf-builder-front-script',
					TC_CAF_URL . 'assets/js/builder-framework.js',
					array( 'jquery', 'jquery-ui-slider', 'tc-caf-builder-ajax-config' ),
					file_exists( $builder_js ) ? (string) filemtime( $builder_js ) : TC_CAF_PLUGIN_VERSION,
					true
				);
			}
			wp_enqueue_script( 'jquery-ui-slider' );
			wp_enqueue_script( 'tc-caf-builder-front-script' );
		}

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
		$path   = TC_CAF_PATH . 'assets/css/dynamic-styles.css';
		$ver    = file_exists( $path ) ? (string) filemtime( $path ) : TC_CAF_PLUGIN_VERSION;
		if ( ! wp_style_is( $handle, 'registered' ) ) {
			wp_register_style( $handle, $src, array(), $ver, 'all' );
		}
		wp_enqueue_style( $handle );
	}

	/**
	 * Load PHP dependencies for builder frontend render.
	 *
	 * @return void
	 */
	public function load_builder_dependencies() {
		if ( ! $this->allows_builder_frontend_render() ) {
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
		require_once $base . 'caf-builder-uploaded-icon.php';
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

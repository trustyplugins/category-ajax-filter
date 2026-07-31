<?php
/**
 * Elementor integration bootstrap (Free + Pro).
 *
 * Registers a simple "CAF Filter" widget that embeds an existing builder layout
 * via the standard [caf_filter] shortcode.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class CAF_Elementor
 */
class CAF_Elementor {

	/**
	 * Singleton.
	 *
	 * @var CAF_Elementor|null
	 */
	protected static $instance = null;

	/**
	 * Get singleton instance.
	 *
	 * @return CAF_Elementor
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
	protected function __construct() {
		add_action( 'elementor/elements/categories_registered', array( $this, 'register_category' ) );
		add_action( 'elementor/widgets/register', array( $this, 'register_widgets' ) );
		// Elementor < 3.5 compatibility.
		add_action( 'elementor/widgets/widgets_registered', array( $this, 'register_widgets_legacy' ) );
		// Styles only — never register CAF frontend JS here (would break normal pages).
		add_action( 'elementor/frontend/after_register_styles', array( __CLASS__, 'register_preview_assets' ) );
		add_action( 'elementor/preview/enqueue_styles', array( __CLASS__, 'enqueue_preview_assets' ) );
	}

	/**
	 * Plugin root URL (Pro or Free).
	 *
	 * @return string
	 */
	public static function plugin_url() {
		if ( defined( 'TC_CAF_PRO_URL' ) ) {
			return TC_CAF_PRO_URL;
		}
		if ( defined( 'TC_CAF_URL' ) ) {
			return TC_CAF_URL;
		}
		return '';
	}

	/**
	 * Plugin version string.
	 *
	 * @return string
	 */
	public static function plugin_version() {
		if ( defined( 'TC_CAF_PRO_PLUGIN_VERSION' ) ) {
			return TC_CAF_PRO_PLUGIN_VERSION;
		}
		if ( defined( 'TC_CAF_PLUGIN_VERSION' ) ) {
			return TC_CAF_PLUGIN_VERSION;
		}
		return '1.0.0';
	}

	/**
	 * Whether this request is Elementor AJAX widget render or preview iframe.
	 * Strict checks only — do not use is_edit_mode() (unsafe for frontend).
	 *
	 * @return bool
	 */
	public static function is_editor_or_preview_render() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only request routing.
		if ( isset( $_GET['elementor-preview'] ) ) {
			return true;
		}

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
	 * Common CSS handle (differs Free vs Pro).
	 *
	 * @return string
	 */
	public static function common_style_handle() {
		return defined( 'TC_CAF_PRO_URL' ) ? 'tc-caf-pro-common-style' : 'tc-caf-builder-common-style';
	}

	/**
	 * Style handles Elementor should load with the CAF Filter widget.
	 *
	 * @return array<int, string>
	 */
	public static function get_preview_style_handles() {
		return array(
			self::common_style_handle(),
			'caf-builder-style',
			'tc-caf-font-awesome-all-style',
		);
	}

	/**
	 * Register base CAF styles used by the Elementor widget preview (CSS only).
	 *
	 * @return void
	 */
	public static function register_preview_assets() {
		$url = self::plugin_url();
		$ver = self::plugin_version();
		if ( '' === $url ) {
			return;
		}

		$common = self::common_style_handle();
		if ( ! wp_style_is( $common, 'registered' ) ) {
			wp_register_style( $common, $url . 'assets/css/common/common.css', array(), $ver, 'all' );
		}

		if ( ! wp_style_is( 'caf-builder-style', 'registered' ) ) {
			$path = self::plugin_path() . 'assets/css/dynamic-styles.css';
			wp_register_style(
				'caf-builder-style',
				$url . 'assets/css/dynamic-styles.css',
				array(),
				file_exists( $path ) ? (string) filemtime( $path ) : $ver,
				'all'
			);
		}

		if ( ! wp_style_is( 'tc-caf-font-awesome-all-style', 'registered' ) ) {
			wp_register_style(
				'tc-caf-font-awesome-all-style',
				$url . 'assets/css/fontawesome/css/all.min.css',
				array(),
				$ver,
				'all'
			);
		}
	}

	/**
	 * Enqueue base styles inside Elementor preview iframe.
	 *
	 * @return void
	 */
	public static function enqueue_preview_assets() {
		self::register_preview_assets();
		foreach ( self::get_preview_style_handles() as $handle ) {
			wp_enqueue_style( $handle );
		}
	}

	/**
	 * Plugin root path (Pro or Free).
	 *
	 * @return string
	 */
	public static function plugin_path() {
		if ( defined( 'TC_CAF_PRO_PATH' ) ) {
			return TC_CAF_PRO_PATH;
		}
		if ( defined( 'TC_CAF_PATH' ) ) {
			return TC_CAF_PATH;
		}
		return '';
	}

	/**
	 * Text domain for widget strings.
	 *
	 * @return string
	 */
	public static function text_domain() {
		return defined( 'TC_CAF_PRO_PLUGIN_VERSION' )
			? 'category-ajax-filter-pro'
			: 'category-ajax-filter';
	}

	/**
	 * Register Elementor widget category.
	 *
	 * @param \Elementor\Elements_Manager $elements_manager Elements manager.
	 * @return void
	 */
	public function register_category( $elements_manager ) {
		if ( ! is_object( $elements_manager ) || ! method_exists( $elements_manager, 'add_category' ) ) {
			return;
		}
		$elements_manager->add_category(
			'category-ajax-filter',
			array(
				'title' => __( 'Category AJAX Filter', 'category-ajax-filter' ),
				'icon'  => 'fa fa-filter',
			)
		);
	}

	/**
	 * Register widgets (Elementor 3.5+).
	 *
	 * @param \Elementor\Widgets_Manager $widgets_manager Widgets manager.
	 * @return void
	 */
	public function register_widgets( $widgets_manager ) {
		$this->include_widget_files();
		if ( ! class_exists( 'CAF_Elementor_Layout_Widget' ) ) {
			return;
		}
		if ( is_object( $widgets_manager ) && method_exists( $widgets_manager, 'register' ) ) {
			$widgets_manager->register( new CAF_Elementor_Layout_Widget() );
		}
	}

	/**
	 * Register widgets (legacy Elementor hook).
	 *
	 * @return void
	 */
	public function register_widgets_legacy() {
		// Elementor 3.5+ also fires elementor/widgets/register — avoid double registration.
		if ( did_action( 'elementor/widgets/register' ) ) {
			return;
		}
		$this->include_widget_files();
		if ( ! class_exists( 'CAF_Elementor_Layout_Widget' ) || ! class_exists( '\Elementor\Plugin' ) ) {
			return;
		}
		$manager = \Elementor\Plugin::instance()->widgets_manager;
		if ( is_object( $manager ) && method_exists( $manager, 'register_widget_type' ) ) {
			$manager->register_widget_type( new CAF_Elementor_Layout_Widget() );
		}
	}

	/**
	 * Load widget class files.
	 *
	 * @return void
	 */
	protected function include_widget_files() {
		if ( ! class_exists( '\Elementor\Widget_Base' ) ) {
			return;
		}
		$path = self::plugin_path() . 'includes/elementor/widgets/class-caf-elementor-layout-widget.php';
		if ( file_exists( $path ) ) {
			require_once $path;
		}
	}

	/**
	 * Builder layout options for the Elementor select control.
	 * Keys are shortcode ids (caf_0). Old Panel filters are excluded.
	 *
	 * @return array<string, string>
	 */
	public static function get_builder_layout_options() {
		$options = array(
			'' => __( 'Select a CAF filter', 'category-ajax-filter' ),
		);

		$list = get_option( 'caf_builder_layouts_list', array() );
		if ( empty( $list ) || ! is_array( $list ) ) {
			return $options;
		}

		foreach ( $list as $index => $layout ) {
			if ( ! is_array( $layout ) ) {
				continue;
			}
			if ( isset( $layout['post_status'] ) && 'publish' !== (string) $layout['post_status'] ) {
				continue;
			}

			$key   = isset( $layout['key'] ) ? sanitize_key( (string) $layout['key'] ) : '';
			$label = isset( $layout['label'] ) ? (string) $layout['label'] : '';
			if ( '' === $label ) {
				$label = sprintf(
					/* translators: %d: layout index */
					__( 'CAF Layout %d', 'category-ajax-filter' ),
					(int) $index
				);
			}

			$short_id = 'caf_' . (int) $index;
			$suffix   = self::resolve_layout_type_suffix( $key, (int) $index );
			if ( '' !== $suffix ) {
				$label .= ' — ' . $suffix;
			}

			$options[ $short_id ] = $label;
		}

		return $options;
	}

	/**
	 * Human-readable type suffix for a builder layout.
	 *
	 * @param string $layout_key Layout key from list entry.
	 * @param int    $index      Layout list index.
	 * @return string
	 */
	protected static function resolve_layout_type_suffix( $layout_key, $index ) {
		$option_name = 'caf_' . $layout_key . '_' . $index;
		$raw         = get_option( $option_name );
		if ( empty( $raw ) ) {
			return __( 'Builder', 'category-ajax-filter' );
		}

		$data = maybe_unserialize( $raw );
		if ( is_string( $data ) ) {
			$decoded = json_decode( $data );
			if ( is_object( $decoded ) ) {
				$data = $decoded;
			}
		}
		if ( ! is_object( $data ) && ! is_array( $data ) ) {
			return __( 'Builder', 'category-ajax-filter' );
		}

		$source = '';
		if ( is_object( $data ) ) {
			$source = isset( $data->post_layout_data->extra_data->layout_source )
				? (string) $data->post_layout_data->extra_data->layout_source
				: '';
		} elseif ( is_array( $data ) ) {
			$source = isset( $data['post_layout_data']['extra_data']['layout_source'] )
				? (string) $data['post_layout_data']['extra_data']['layout_source']
				: '';
		}

		if ( 'main_query' === sanitize_key( $source ) ) {
			return __( 'Filter only', 'category-ajax-filter' );
		}

		return __( 'Builder', 'category-ajax-filter' );
	}

	/**
	 * Admin URL for the CAF Builder list screen.
	 *
	 * @param string $short_id Unused; kept for call-site compatibility.
	 * @return string
	 */
	public static function get_edit_layout_url( $short_id = '' ) {
		unset( $short_id );
		return admin_url( 'edit.php?post_type=caf_posts' );
	}
}

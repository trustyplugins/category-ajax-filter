<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Frontend Builder Framework
 *
 * @package Category_Ajax_Filter
 */
class CAF_Builder_Framework {

	/**
	 * Raw builder data.
	 *
	 * @var object
	 */
	protected $builder_data;

	/**
	 * Shortcode index.
	 *
	 * @var int
	 */
	protected $short_index;

	/**
	 * Normalized builder data handler.
	 *
	 * @var CAF_Builder_Data
	 */
	protected $data_handler;

	/**
	 * Query builder instance.
	 *
	 * @var CAF_Builder_Query
	 */
	protected $query_builder;

	/**
	 * CSS collector instance.
	 *
	 * @var CAF_Builder_Css
	 */
	protected $css_builder;
	/**
	 * Style generator instance.
	 *
	 * @var CAF_Builder_Style_Generator
	 */
	protected $style_generator;
	/**
	 * Main renderer instance.
	 *
	 * @var CAF_Builder_Renderer
	 */
	protected $renderer;

	/**
	 * Constructor.
	 *
	 * @param object $builder_data Builder data.
	 * @param int    $short_index  Shortcode index.
	 */
	public function __construct( $builder_data, $short_index = 1 ) {
		$this->builder_data = $builder_data;
		$this->short_index  = absint( $short_index );

		$this->boot();
	}

	/**
	 * Initialize dependent classes.
	 *
	 * @return void
	 */
	protected function boot() {
		$this->data_handler    = new CAF_Builder_Data(
			$this->builder_data,
			$this->short_index
		);
		$this->css_builder     = new CAF_Builder_Css();
		$this->style_generator = new CAF_Builder_Style_Generator(
			array( 'CAF_Builder_Font_Loader', 'enqueue_font_family' )
		);
		$this->query_builder   = new CAF_Builder_Query(
			$this->data_handler
		);
		$this->renderer        = new CAF_Builder_Renderer(
			$this->data_handler,
			$this->query_builder,
			$this->css_builder,
			$this->style_generator
		);
	}

	/**
	 * Render full frontend builder output.
	 *
	 * @return string
	 */
	public function render() {
		$html = $this->renderer->render();

		$dynamic_css = $this->css_builder->get_unique_css();

		if ( ! empty( $dynamic_css ) ) {
			$handle = 'caf-builder-style';
			if ( ! wp_style_is( $handle, 'registered' ) ) {
				wp_register_style(
					$handle,
					TC_CAF_URL . 'assets/css/dynamic-styles.css',
					array(),
					defined( 'TC_CAF_PLUGIN_VERSION' ) ? TC_CAF_PLUGIN_VERSION : null,
					'all'
				);
			}
			wp_enqueue_style( $handle );

			// After <head>, or Elementor AJAX canvas (no style queue printed): keep CSS with markup.
			$force_inline = did_action( 'wp_print_styles' )
				|| did_action( 'wp_head' )
				|| ( class_exists( 'CAF_Elementor' ) && CAF_Elementor::is_editor_or_preview_render() );

			if ( ! $force_inline ) {
				wp_add_inline_style( $handle, $dynamic_css );
			} else {
				$html = '<style id="caf-builder-dynamic-' . absint( $this->short_index ) . '">'
					. wp_strip_all_tags( $dynamic_css )
					. '</style>'
					. $html;
			}
		}

		if ( class_exists( 'CAF_Builder_Ajax_Performance' ) ) {
			CAF_Builder_Ajax_Performance::set_layout_css_snapshot( $this->short_index, $dynamic_css );
			$html = CAF_Builder_Ajax_Performance::inject_css_hash_on_container(
				$html,
				CAF_Builder_Ajax_Performance::get_dynamic_css_hash( $dynamic_css )
			);
		}

		return $html;
	}
}

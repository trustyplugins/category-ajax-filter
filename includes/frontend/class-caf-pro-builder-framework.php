<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Frontend Builder Framework
 *
 * @package TC_CAF_PRO
 */
class CAF_PRO_Builder_Framework {

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
	 * @var CAF_PRO_Builder_Data
	 */
	protected $data_handler;

	/**
	 * Query builder instance.
	 *
	 * @var CAF_PRO_Builder_Query
	 */
	protected $query_builder;

	/**
	 * CSS collector instance.
	 *
	 * @var CAF_PRO_Builder_Css
	 */
	protected $css_builder;
	/**
	 * Style generator instance.
	 *
	 * @var CAF_PRO_Builder_Style_Generator
	 */
	protected $style_generator;
	/**
	 * Main renderer instance.
	 *
	 * @var CAF_PRO_Builder_Renderer
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
		$this->data_handler    = new CAF_PRO_Builder_Data(
			$this->builder_data,
			$this->short_index
		);
		$this->css_builder     = new CAF_PRO_Builder_Css();
		$this->style_generator = new CAF_PRO_Builder_Style_Generator(
			array( 'CAF_PRO_Builder_Font_Loader', 'enqueue_font_family' )
		);
		$this->query_builder   = new CAF_PRO_Builder_Query(
			$this->data_handler
		);
		$this->renderer        = new CAF_PRO_Builder_Renderer(
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
			wp_add_inline_style( 'caf-builder-style', $dynamic_css );
		}

		if ( class_exists( 'CAF_PRO_Builder_Ajax_Performance' ) ) {
			CAF_PRO_Builder_Ajax_Performance::set_layout_css_snapshot( $this->short_index, $dynamic_css );
			$html = CAF_PRO_Builder_Ajax_Performance::inject_css_hash_on_container(
				$html,
				CAF_PRO_Builder_Ajax_Performance::get_dynamic_css_hash( $dynamic_css )
			);
		}

		return $html;
	}
}

<?php
/**
 * Frontend Builder Filter Renderer
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Builder_Filter_Renderer {

	/**
	 * Builder data handler.
	 *
	 * @var CAF_Builder_Data
	 */
	protected $data_handler;

	/**
	 * Builder CSS collector.
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
	 * Constructor.
	 *
	 * @param CAF_Builder_Data            $data_handler    Builder data handler.
	 * @param CAF_Builder_Css             $css_builder     CSS collector.
	 * @param CAF_Builder_Style_Generator $style_generator Style generator.
	 */
	public function __construct( CAF_Builder_Data $data_handler, CAF_Builder_Css $css_builder, CAF_Builder_Style_Generator $style_generator ) {
		$this->data_handler    = $data_handler;
		$this->css_builder     = $css_builder;
		$this->style_generator = $style_generator;
	}

	/**
	 * CSS prefix so filter rules are scoped to this builder instance (avoids collisions with multiple shortcodes).
	 *
	 * @return string e.g. ".caf-builder-instance-1"
	 */
	protected function get_filter_layout_css_scope_prefix() {
		return '.' . sanitize_html_class( $this->data_handler->get_instance_class() );
	}

	/**
	 * Render full filter layout.
	 *
	 * @return string
	 */
	public function render() {
		$loop_data = $this->data_handler->get_filter_layout_loop_data();
		if ( empty( $loop_data ) || ! is_array( $loop_data ) ) {
			return '';
		}

		$html = '';

		foreach ( $loop_data as $row_key => $row ) {
			$html .= $this->render_row( $row, $row_key );
		}

		return $html;
	}

	/**
	 * Render one row.
	 *
	 * @param object $row     Row object.
	 * @param int    $row_key Row key.
	 * @return string
	 */
	protected function render_row( $row, $row_key ) {
		if ( empty( $row ) || ! is_object( $row ) ) {
			return '';
		}

		if ( empty( $row->type ) || 'row' !== $row->type ) {
			return '';
		}

		$scope            = $this->get_filter_layout_css_scope_prefix();
		$row_class        = 'caf-builder-row-main caf-fl-row-' . absint( $row_key );
		$custom_class     = '';
		$row_selector     = $scope . ' .filter-layout-container .caf-fl-row-' . absint( $row_key );
		$row_style    = isset( $row->style ) ? $row->style : null;
		$row_settings = isset( $row->settings ) ? $row->settings : null;
		$row_columns  = isset( $row->data ) && is_array( $row->data ) ? $row->data : array();

		if ( ! empty( $row_settings->custom_class ) ) {
			$custom_class = sanitize_html_class( $row_settings->custom_class );
			$row_class   .= ' ' . $custom_class;
		}
		$row_class .= $this->get_visibility_classes( $row_settings );

		$this->collect_default_and_hover_css( $row_style, $row_selector );

		$html = '<div class="' . esc_attr( $row_class ) . '">';

		foreach ( $row_columns as $column_key => $column ) {
			$html .= $this->render_column( $column, $row_key, $column_key );
		}

		$html .= '</div>';

		return $html;
	}

	/**
	 * Render one column.
	 *
	 * @param object $column     Column object.
	 * @param int    $row_key    Row key.
	 * @param int    $column_key Column key.
	 * @return string
	 */
	protected function render_column( $column, $row_key, $column_key ) {
		if ( empty( $column ) || ! is_object( $column ) ) {
			return '';
		}

		if ( empty( $column->type ) || 'column' !== $column->type ) {
			return '';
		}

		$scope            = $this->get_filter_layout_css_scope_prefix();
		$column_class      = 'caf-builder-column-main caf-fl-column-' . absint( $column_key );
		$custom_class      = '';
		$column_selector   = $scope . ' .filter-layout-container .caf-fl-row-' . absint( $row_key ) . ' .caf-fl-column-' . absint( $column_key );
		$column_style    = isset( $column->style ) ? $column->style : null;
		$column_settings = isset( $column->settings ) ? $column->settings : null;
		$modules         = isset( $column->data ) && is_array( $column->data ) ? $column->data : array();

		if ( ! empty( $column_settings->custom_class ) ) {
			$custom_class  = sanitize_html_class( $column_settings->custom_class );
			$column_class .= ' ' . $custom_class;
		}
		$column_class .= $this->get_visibility_classes( $column_settings );

		$this->collect_default_and_hover_css( $column_style, $column_selector );

		$html = '<div class="' . esc_attr( $column_class ) . '">';

		foreach ( $modules as $module_key => $module ) {
			$html .= $this->render_module( $module, $row_key, $column_key, $module_key );
		}

		$html .= '</div>';

		return $html;
	}

	/**
	 * Render one filter module wrapper.
	 *
	 * @param object $module     Module object.
	 * @param int    $row_key    Row key.
	 * @param int    $column_key Column key.
	 * @param int    $module_key Module key.
	 * @return string
	 */
	protected function render_module( $module, $row_key, $column_key, $module_key ) {
		if ( empty( $module ) || ! is_object( $module ) ) {
			return '';
		}

		$module_type = isset( $module->key ) ? sanitize_key( $module->key ) : 'unknown';
		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_filter_module( $module_type ) ) {
			return '';
		}

		$scope            = $this->get_filter_layout_css_scope_prefix();
		$module_class      = 'caf-builder-module-main caf-module-filter caf-fl-module-' . absint( $module_key ) . ' caf-module-type-' . $module_type;
		$custom_class      = '';
		$module_style      = isset( $module->style->container ) ? $module->style->container : null;
		$module_settings   = isset( $module->settings ) ? $module->settings : null;
		$module_selector   = $scope . ' .filter-layout-container .caf-fl-row-' . absint( $row_key ) . ' .caf-fl-column-' . absint( $column_key ) . ' .caf-fl-module-' . absint( $module_key );

		if ( ! empty( $module_settings->custom_class ) ) {
			$custom_class  = sanitize_html_class( $module_settings->custom_class );
			$module_class .= ' ' . $custom_class;
		}
		if (
			! empty( $module_settings->enable_toggle )
			&& 'true' === (string) $module_settings->enable_toggle
			&& ( ! class_exists( 'CAF_Builder_Tier' ) || CAF_Builder_Tier::can_use_feature( 'filter_label_collapse' ) )
		) {
			$module_class .= ' toggled';
		}
		$module_class .= $this->get_visibility_classes( $module_settings );

		$this->collect_default_and_hover_css( $module_style, $module_selector );

		$html  = '<div class="' . esc_attr( $module_class ) . '"';
		$html .= ' data-module-type="' . esc_attr( $module_type ) . '"';
		$html .= ' data-row-id="' . esc_attr( $row_key ) . '"';
		$html .= ' data-column-id="' . esc_attr( $column_key ) . '"';
		$html .= ' data-module-id="' . esc_attr( $module_key ) . '">';
		$html .= $this->render_module_content( $module, $row_key, $column_key, $module_key );
		$html .= '</div>';

		return $html;
	}

	/**
	 * Render module content.
	 *
	 * Delegates rendering to the filter module factory.
	 *
	 * @param object $module     Module object.
	 * @param int    $row_key    Row key.
	 * @param int    $column_key Column key.
	 * @param int    $module_key Module key.
	 * @return string
	 */
	protected function render_module_content( $module, $row_key, $column_key, $module_key ) {
		$instance_css_prefix = $this->get_filter_layout_css_scope_prefix();
		$module_instance     = CAF_Filter_Module_Factory::create(
			$module,
			$row_key,
			$column_key,
			$module_key,
			$this->css_builder,
			$this->style_generator,
			$instance_css_prefix
		);

		if ( $module_instance ) {
			return $module_instance->render();
		}

		return '';
	}




	/**
	 * Collect default and hover CSS.
	 *
	 * This is intentionally generic for now.
	 * Once your real CSS generator class/helper is added, wire it here.
	 *
	 * @param mixed  $style    Style object.
	 * @param string $selector CSS selector.
	 * @return void
	 */
	protected function collect_default_and_hover_css( $style, $selector ) {
		if ( empty( $style ) || empty( $selector ) ) {
			return;
		}

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style,
				'default',
				$selector
			)
		);

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style,
				'hover',
				$selector . ':hover'
			)
		);
	}

	/**
	 * Build visibility classes from device settings.
	 *
	 * @param object|null $settings Settings object.
	 * @return string
	 */
	protected function get_visibility_classes( $settings ) {
		if ( empty( $settings ) || ! is_object( $settings ) || empty( $settings->visibility ) || ! is_object( $settings->visibility ) ) {
			return '';
		}

		$classes = array();
		if ( isset( $settings->visibility->desktop ) && 'true' === (string) $settings->visibility->desktop ) {
			$classes[] = 'caf-hide-desktop';
		}
		if ( isset( $settings->visibility->tablet ) && 'true' === (string) $settings->visibility->tablet ) {
			$classes[] = 'caf-hide-tablet';
		}
		if ( isset( $settings->visibility->mobile ) && 'true' === (string) $settings->visibility->mobile ) {
			$classes[] = 'caf-hide-mobile';
		}

		return empty( $classes ) ? '' : ' ' . implode( ' ', $classes );
	}
}

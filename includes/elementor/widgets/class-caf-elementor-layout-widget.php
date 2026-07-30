<?php
/**
 * Elementor widget: pick and render a CAF Builder filter.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class CAF_Elementor_Layout_Widget
 */
class CAF_Elementor_Layout_Widget extends \Elementor\Widget_Base {

	/**
	 * Widget slug.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'caf_filter';
	}

	/**
	 * Widget title.
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'CAF Filter', 'category-ajax-filter' );
	}

	/**
	 * Widget icon.
	 *
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-filter';
	}

	/**
	 * Widget categories.
	 *
	 * @return array<int, string>
	 */
	public function get_categories() {
		return array( 'category-ajax-filter', 'general' );
	}

	/**
	 * Keywords for Elementor search.
	 *
	 * @return array<int, string>
	 */
	public function get_keywords() {
		return array( 'caf', 'filter', 'ajax', 'category', 'layout', 'builder' );
	}

	/**
	 * CSS handles for frontend + Elementor preview shell.
	 *
	 * @return array<int, string>
	 */
	public function get_style_depends() {
		if ( class_exists( 'CAF_Elementor' ) ) {
			CAF_Elementor::register_preview_assets();
			return CAF_Elementor::get_preview_style_handles();
		}
		return array();
	}

	/**
	 * Register controls.
	 *
	 * @return void
	 */
	protected function register_controls() {
		$options = class_exists( 'CAF_Elementor' )
			? CAF_Elementor::get_builder_layout_options()
			: array( '' => __( 'Select a CAF filter', 'category-ajax-filter' ) );

		$this->start_controls_section(
			'section_layout',
			array(
				'label' => __( 'CAF Filter', 'category-ajax-filter' ),
			)
		);

		$this->add_control(
			'caf_layout_id',
			array(
				'label'       => __( 'Select filter', 'category-ajax-filter' ),
				'type'        => \Elementor\Controls_Manager::SELECT,
				'options'     => $options,
				'default'     => '',
				'label_block' => true,
			)
		);

		$this->add_control(
			'caf_layout_help',
			array(
				'type'            => \Elementor\Controls_Manager::RAW_HTML,
				'raw'             => sprintf(
					'<p style="margin:0 0 8px;">%s</p><p style="margin:0;"><a href="%s" target="_blank" rel="noopener noreferrer">%s</a></p>',
					esc_html__( 'Pick a published CAF Builder filter. Live interactive preview runs on the frontend (View Page / Preview) — Elementor canvas shows a summary card only.', 'category-ajax-filter' ),
					esc_url( admin_url( 'edit.php?post_type=caf_posts' ) ),
					esc_html__( 'Open CAF Builder', 'category-ajax-filter' )
				),
				'content_classes' => 'elementor-panel-alert elementor-panel-alert-info',
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Frontend / editor render.
	 *
	 * @return void
	 */
	protected function render() {
		$settings  = $this->get_settings_for_display();
		$layout_id = isset( $settings['caf_layout_id'] ) ? sanitize_text_field( (string) $settings['caf_layout_id'] ) : '';

		// Elementor canvas/AJAX: stable summary card (CAF JS + admin-ajax render fights Elementor).
		if ( $this->should_use_editor_placeholder() ) {
			$this->render_editor_placeholder( $layout_id );
			return;
		}

		if ( '' === $layout_id || 0 !== strpos( $layout_id, 'caf_' ) ) {
			return;
		}

		$index = substr( $layout_id, 4 );
		if ( '' === $index || ! is_numeric( $index ) ) {
			return;
		}

		// Live site / normal frontend — same path as the shortcode.
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- CAF shortcode returns escaped HTML.
		echo do_shortcode( sprintf( "[caf_filter id='caf_%d']", (int) $index ) );
	}

	/**
	 * Whether to show the editor summary card instead of running CAF.
	 *
	 * @return bool
	 */
	protected function should_use_editor_placeholder() {
		if ( class_exists( 'CAF_Elementor' ) && CAF_Elementor::is_editor_or_preview_render() ) {
			return true;
		}
		return $this->is_elementor_edit_mode();
	}

	/**
	 * Summary card for Elementor editor canvas.
	 *
	 * @param string $layout_id Selected shortcode id (caf_N) or empty.
	 * @return void
	 */
	protected function render_editor_placeholder( $layout_id ) {
		$label = '';
		if ( class_exists( 'CAF_Elementor' ) && '' !== $layout_id ) {
			$options = CAF_Elementor::get_builder_layout_options();
			$label   = isset( $options[ $layout_id ] ) ? (string) $options[ $layout_id ] : '';
		}

		echo '<div class="caf-elementor-layout-placeholder" style="padding:20px;border:1px dashed #8c8f94;border-radius:4px;background:#f6f7f7;text-align:left;color:#1d2327;font-family:inherit;line-height:1.5;">';
		echo '<div style="font-weight:600;margin-bottom:6px;">' . esc_html__( 'CAF Filter', 'category-ajax-filter' ) . '</div>';

		if ( '' === $layout_id || 0 !== strpos( $layout_id, 'caf_' ) ) {
			echo '<div style="color:#50575e;">' . esc_html__( 'Select a CAF filter in the widget settings.', 'category-ajax-filter' ) . '</div>';
		} else {
			if ( '' !== $label ) {
				echo '<div style="margin-bottom:4px;">' . esc_html( $label ) . '</div>';
			}
			echo '<code style="display:inline-block;padding:2px 6px;background:#fff;border:1px solid #dcdcde;border-radius:3px;font-size:12px;">';
			echo esc_html( sprintf( "[caf_filter id='%s']", $layout_id ) );
			echo '</code>';
			echo '<div style="margin-top:10px;font-size:12px;color:#50575e;">';
			echo esc_html__( 'Interactive filter preview is shown on the live page / Preview — not inside the Elementor canvas.', 'category-ajax-filter' );
			echo '</div>';
		}

		echo '</div>';
	}

	/**
	 * Whether Elementor editor canvas is active.
	 *
	 * @return bool
	 */
	protected function is_elementor_edit_mode() {
		if ( ! class_exists( '\Elementor\Plugin' ) || empty( \Elementor\Plugin::$instance->editor ) ) {
			return false;
		}
		return (bool) \Elementor\Plugin::$instance->editor->is_edit_mode();
	}
}

<?php
/**
 * Frontend Builder Filter Module Factory
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Filter_Module_Factory {

	/**
	 * Create filter module instance.
	 *
	 * @param object                          $module          Module object.
	 * @param int                             $row_key         Row key.
	 * @param int                             $column_key      Column key.
	 * @param int                             $module_key      Module key.
	 * @param CAF_Builder_Css             $css_builder     CSS builder.
	 * @param CAF_Builder_Style_Generator $style_generator       Style generator.
	 * @param string                          $instance_css_prefix Optional instance scope (e.g. ".caf-builder-instance-1").
	 * @return object|null
	 */
	public static function create(
		$module,
		$row_key,
		$column_key,
		$module_key,
		CAF_Builder_Css $css_builder,
		CAF_Builder_Style_Generator $style_generator,
		$instance_css_prefix = ''
	) {
		$module_type = isset( $module->key ) ? sanitize_key( $module->key ) : '';

		switch ( $module_type ) {
			case 'search':
				return new CAF_Filter_Search_Module(
					$module,
					$row_key,
					$column_key,
					$module_key,
					$css_builder,
					$style_generator,
					$instance_css_prefix
				);

			case 'reset':
				return new CAF_Filter_Reset_Module(
					$module,
					$row_key,
					$column_key,
					$module_key,
					$css_builder,
					$style_generator,
					$instance_css_prefix
				);
			case 'customtext':
				return new CAF_Filter_Custom_Text_Module(
					$module,
					$row_key,
					$column_key,
					$module_key,
					$css_builder,
					$style_generator,
					$instance_css_prefix
				);
			case 'checkbox_filter':
				return new CAF_Filter_Checkbox_Module(
					$module,
					$row_key,
					$column_key,
					$module_key,
					$css_builder,
					$style_generator,
					$instance_css_prefix
				);
			case 'dropdown_filter':
				return new CAF_Filter_Dropdown_Module(
					$module,
					$row_key,
					$column_key,
					$module_key,
					$css_builder,
					$style_generator,
					$instance_css_prefix
				);
			case 'range_slider':
				if ( ! class_exists( 'CAF_Filter_Range_Slider_Module' ) ) {
					return null;
				}
				return new CAF_Filter_Range_Slider_Module(
					$module,
					$row_key,
					$column_key,
					$module_key,
					$css_builder,
					$style_generator,
					$instance_css_prefix
				);

			default:
				return null;
		}
	}
}

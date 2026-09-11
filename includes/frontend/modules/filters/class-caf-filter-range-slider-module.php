<?php
/**
 * Frontend Builder Range Slider Filter Module
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Filter_Range_Slider_Module extends CAF_Filter_Base_Module {

	/**
	 * Render module.
	 *
	 * @return string
	 */
	public function render() {
		$settings = $this->get_settings();
		if ( class_exists( 'CAF_Free_Woo' ) ) {
			$settings = CAF_Free_Woo::clamp_range_slider_settings_for_free( $settings );
			$settings = CAF_Free_Woo::apply_price_slider_defaults( $settings );
			$this->module->settings = $settings;
		}
		$this->collect_css();

		$slider = isset( $settings->range_slider ) ? $settings->range_slider : new stdClass();
		$decimal_places = self::resolve_display_decimal_places( $slider );
		$min    = isset( $slider->min ) ? (float) $slider->min : 0;
		$max    = isset( $slider->max ) ? (float) $slider->max : 100;
		$step   = isset( $slider->step ) ? (float) $slider->step : 1;
		$type   = isset( $slider->type ) ? sanitize_key( $slider->type ) : 'double';
		if ( ! in_array( $type, array( 'single', 'double' ), true ) ) {
			$type = 'double';
		}
		$placement = isset( $slider->placement ) ? sanitize_key( $slider->placement ) : 'horizontal';
		if ( ! in_array( $placement, array( 'horizontal', 'vertical' ), true ) ) {
			$placement = 'horizontal';
		}

		$prefix_obj      = isset( $slider->prefix ) ? $slider->prefix : new stdClass();
		$suffix_obj      = isset( $slider->suffix ) ? $slider->suffix : new stdClass();
		$prefix_enabled  = ( isset( $prefix_obj->is_enable ) && 'true' === $prefix_obj->is_enable );
		$suffix_enabled  = ( isset( $suffix_obj->is_enable ) && 'true' === $suffix_obj->is_enable );
		$prefix_text     = ( $prefix_enabled && isset( $prefix_obj->value ) ) ? (string) $prefix_obj->value : '';
		$suffix_text     = ( $suffix_enabled && isset( $suffix_obj->value ) ) ? (string) $suffix_obj->value : '';
		if ( class_exists( 'CAF_Free_Woo' ) ) {
			$prefix_text = CAF_Free_Woo::decode_html_entities( $prefix_text );
			$suffix_text = CAF_Free_Woo::decode_html_entities( $suffix_text );
		}
		$custom_field_key = '';
		if ( isset( $settings->custom_field_data ) && is_array( $settings->custom_field_data ) && ! empty( $settings->custom_field_data[0] ) ) {
			$first_group = $settings->custom_field_data[0];
			if ( is_object( $first_group ) && isset( $first_group->custom_field_key ) ) {
				$custom_field_key = (string) $first_group->custom_field_key;
			} elseif ( is_array( $first_group ) && isset( $first_group['custom_field_key'] ) ) {
				$custom_field_key = (string) $first_group['custom_field_key'];
			}
		} elseif ( isset( $settings->custom_field_data ) && is_object( $settings->custom_field_data ) && isset( $settings->custom_field_data->custom_field_key ) ) {
			$custom_field_key = (string) $settings->custom_field_data->custom_field_key;
		}

		if ( $max < $min ) {
			$tmp = $min;
			$min = $max;
			$max = $tmp;
		}
		if ( $step <= 0 ) {
			$step = 1;
		}

		$defaults_obj      = isset( $slider->default_values ) ? $slider->default_values : null;
		$defaults_enabled  = true;
		if ( is_object( $defaults_obj ) && isset( $defaults_obj->is_enable ) ) {
			$defaults_enabled = ( 'true' === (string) $defaults_obj->is_enable );
		}

		if ( ! $defaults_enabled ) {
			$start_min = $min;
			$start_max = $max;
		} else {
			$start_min = isset( $slider->start_min ) ? $slider->start_min : null;
			$start_max = isset( $slider->start_max ) ? $slider->start_max : null;
			$start_min = ( '' === $start_min || null === $start_min ) ? $min : (float) $start_min;
			$start_max = ( '' === $start_max || null === $start_max ) ? $max : (float) $start_max;
			$start_min = max( $min, min( $start_min, $max ) );
			$start_max = max( $min, min( $start_max, $max ) );
			if ( 'double' === $type && $start_min > $start_max ) {
				$start_max = $start_min;
			}
		}

		$min_text         = isset( $slider->min ) ? trim( (string) $slider->min ) : '';
		$max_text         = isset( $slider->max ) ? trim( (string) $slider->max ) : '';
		$start_min_text   = ( isset( $slider->start_min ) && '' !== $slider->start_min && null !== $slider->start_min )
			? trim( (string) $slider->start_min )
			: '';
		$start_max_text   = ( isset( $slider->start_max ) && '' !== $slider->start_max && null !== $slider->start_max )
			? trim( (string) $slider->start_max )
			: '';
		$pref_display_min = $defaults_enabled && '' !== $start_min_text ? $start_min_text : $min_text;
		$pref_display_max = $defaults_enabled && '' !== $start_max_text ? $start_max_text : $max_text;

		$display_start_min = self::format_display_number( $start_min, $decimal_places, $pref_display_min );
		$display_start_max = self::format_display_number( $start_max, $decimal_places, $pref_display_max );

		$html  = $this->render_label();
		$toggle_closed_class = $this->get_toggle_closed_class();
		$toggle_closed_style = '' !== $toggle_closed_class ? 'display:none;' : 'display:flex;';
		$output_class        = 'caf-range-slider-output';
		if ( '' !== $toggle_closed_class ) {
			$output_class .= ' ' . $toggle_closed_class;
		}
		// Inline style mirrors checkbox modules so design CSS (display:flex) cannot override collapse.
		$html .= '<div class="' . esc_attr( $output_class ) . '" style="' . esc_attr( $toggle_closed_style ) . '">';
		if ( 'single' === $type ) {
			$html .= '<div class="caf-range-slider-values caf-range-slider-values--single">';
			$html .= '<span class="caf-range-slider-min">' . esc_html( $prefix_text . $display_start_max . $suffix_text ) . '</span>';
			$html .= '</div>';
		} else {
			$html .= '<div class="caf-range-slider-values">';
			$html .= '<span class="caf-range-slider-min">' . esc_html( $prefix_text . $display_start_min . $suffix_text ) . '</span>';
			$html .= '<span class="caf-range-slider-sep">-</span>';
			$html .= '<span class="caf-range-slider-max">' . esc_html( $prefix_text . $display_start_max . $suffix_text ) . '</span>';
			$html .= '</div>';
		}
		$html .= '<div class="caf-range-slider-ui-wrapper caf-range-slider-placement-' . esc_attr( $placement ) . '">';
		$html .= '<div class="caf-range-slider-ui"';
		$html .= ' data-min="' . esc_attr( $min ) . '"';
		$html .= ' data-max="' . esc_attr( $max ) . '"';
		$html .= ' data-step="' . esc_attr( $step ) . '"';
		$html .= ' data-start-min="' . esc_attr( $start_min ) . '"';
		$html .= ' data-start-max="' . esc_attr( $start_max ) . '"';
		$html .= ' data-min-text="' . esc_attr( $min_text ) . '"';
		$html .= ' data-max-text="' . esc_attr( $max_text ) . '"';
		$html .= ' data-start-min-text="' . esc_attr( $start_min_text ) . '"';
		$html .= ' data-start-max-text="' . esc_attr( $start_max_text ) . '"';
		$html .= ' data-decimal-places="' . esc_attr( (string) $decimal_places ) . '"';
		$html .= ' data-range-type="' . esc_attr( $type ) . '"';
		$html .= ' data-placement="' . esc_attr( $placement ) . '"';
		$html .= ' data-prefix-enable="' . esc_attr( $prefix_enabled ? 'true' : 'false' ) . '"';
		$html .= ' data-prefix-text="' . esc_attr( $prefix_text ) . '"';
		$html .= ' data-suffix-enable="' . esc_attr( $suffix_enabled ? 'true' : 'false' ) . '"';
		$html .= ' data-suffix-text="' . esc_attr( $suffix_text ) . '"';
		$html .= ' data-meta-key="' . esc_attr( $custom_field_key ) . '"';
		// DECIMAL(p,s): WP "NUMERIC" → SIGNED truncates decimals (0.540 → 0). Bare DECIMAL also truncates.
		$html .= ' data-meta-type="DECIMAL(16,6)"';
		$html .= '></div>';
		$html .= '</div>';
		$html .= '</div>';

		return $html;
	}

	/**
	 * Count typed decimal places in a raw setting (e.g. "0.540" → 3).
	 *
	 * @param mixed $raw Raw setting value.
	 * @return int
	 */
	protected static function count_decimal_places( $raw ) {
		if ( null === $raw || '' === $raw ) {
			return 0;
		}
		$s = trim( (string) $raw );
		$dot = strpos( $s, '.' );
		if ( false === $dot ) {
			return 0;
		}
		return strlen( substr( $s, $dot + 1 ) );
	}

	/**
	 * Max decimal places across min/max/step/defaults for float rounding.
	 *
	 * @param object $slider Range slider settings.
	 * @return int
	 */
	protected static function resolve_display_decimal_places( $slider ) {
		if ( ! is_object( $slider ) ) {
			return 0;
		}
		$places = 0;
		foreach ( array( 'min', 'max', 'step', 'start_min', 'start_max' ) as $key ) {
			if ( isset( $slider->$key ) ) {
				$places = max( $places, self::count_decimal_places( $slider->$key ) );
			}
		}
		return min( $places, 12 );
	}

	/**
	 * Format a number for range slider labels.
	 * Prefer exact typed setting text when values match; otherwise round then strip padding zeros.
	 *
	 * @param float|int $num       Numeric value.
	 * @param int       $places    Decimal places for rounding.
	 * @param string    $preferred Typed setting text (optional).
	 * @return string
	 */
	protected static function format_display_number( $num, $places, $preferred = '' ) {
		$preferred = trim( (string) $preferred );
		if ( '' !== $preferred && is_numeric( $preferred ) && (float) $preferred === (float) $num ) {
			return $preferred;
		}
		$places = (int) $places;
		if ( $places > 0 ) {
			$s = number_format( (float) $num, $places, '.', '' );
			if ( false !== strpos( $s, '.' ) ) {
				$s = rtrim( $s, '0' );
				$s = rtrim( $s, '.' );
			}
			return $s;
		}
		return (string) ( 0 + (float) $num );
	}

	/**
	 * Collect CSS.
	 *
	 * @return void
	 */
	protected function collect_css() {
		$module_selector = $this->get_module_selector();
		$wrapper_style   = $this->get_style_section( 'meta' );
		$text_style       = $this->get_style_section( 'meta1' );
		$track_style      = $this->get_style_section( 'meta2' );
		$thumb_style      = $this->get_style_section( 'meta3' );

		// Slider Wrapper (.caf-range-slider-output).
		$wrapper_sel = $module_selector . ' .caf-range-slider-output';
		$this->collect_default_and_hover_css( $wrapper_style, $wrapper_sel );

		// Values text — exclude layout props (mirrors generateFilterLabelCSS).
		$values_sel       = $module_selector . ' .caf-range-slider-values';
		$label_excluded   = array( 'display', 'flex-flow', 'justify-content', 'align-items', 'gap', 'float' );
		$label_args       = array( 'excluded_properties' => $label_excluded );
		if ( ! empty( $text_style ) ) {
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css( $text_style, 'default', $values_sel, $label_args )
			);
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css( $text_style, 'hover', $values_sel . ':hover', $label_args )
			);
		}

		$settings   = $this->get_settings();
		$slider_cfg = isset( $settings->range_slider ) ? $settings->range_slider : new stdClass();
		$orientation = isset( $slider_cfg->placement ) ? $slider_cfg->placement : 'horizontal';
		if ( ! in_array( $orientation, array( 'horizontal', 'vertical' ), true ) ) {
			$orientation = 'horizontal';
		}
		$orientation_class = 'ui-slider-' . $orientation;
		$track_sel = $module_selector . ' .caf-range-slider-ui.' . $orientation_class;
		$this->collect_default_and_hover_css( $track_style, $track_sel );

		if ( 'vertical' === $orientation ) {
			$range_sel = $module_selector . ' .caf-range-slider-ui.' . $orientation_class . ' .ui-slider-range';
			$this->css_builder->add( $range_sel . '{width:100%;}' );
			// Single-handle vertical: jQuery sets height % only; base theme anchors min/max — ensure without full jquery-ui theme.
			$this->css_builder->add( $module_selector . ' .caf-range-slider-ui.' . $orientation_class . ' .ui-slider-range-min{bottom:0;top:auto;}' );
			$this->css_builder->add( $module_selector . ' .caf-range-slider-ui.' . $orientation_class . ' .ui-slider-range-max{top:0;bottom:auto;}' );
		}

		// Filled track segment (jQuery UI range) — background only; driven by meta2 "active" state.
		$range_active_sel = $module_selector . ' .caf-range-slider-ui-wrapper .ui-slider-range.ui-corner-all.ui-widget-header';
		$active_bg_args     = array(
			'allowed_properties' => array( 'background-color', 'background-image' ),
		);
		if ( ! empty( $track_style ) ) {
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css( $track_style, 'active', $range_active_sel, $active_bg_args )
			);
			$active_fill_has_gradient = $this->track_fill_has_gradient_merged( $track_style );
			if ( ! $active_fill_has_gradient ) {
				$this->css_builder->add( $range_active_sel . '{background-image:none;}' );
			}
		}

		$thumb_sel = $module_selector . ' .caf-range-slider-ui .ui-slider-handle';
		$this->collect_default_and_hover_css( $thumb_style, $thumb_sel );

		$track_has_gradient = $this->style_has_gradient( $track_style );
		$thumb_has_gradient = $this->style_has_gradient( $thumb_style );

		if ( ! $track_has_gradient ) {
			$this->css_builder->add( $track_sel . '{background-image:none;}' );
		}
		if ( ! $thumb_has_gradient ) {
			$this->css_builder->add( $thumb_sel . '{background-image:none;}' );
		}
	}

	/**
	 * Check whether a style section has a gradient background-color.
	 *
	 * @param object|null $style Style section data.
	 * @return bool
	 */
	private function style_has_gradient( $style ) {
		if ( empty( $style ) ) {
			return false;
		}
		$bg = isset( $style->desktop->default->backgroundColor )
			? $style->desktop->default->backgroundColor
			: '';
		return is_string( $bg ) && false !== strpos( $bg, 'gradient(' );
	}

	/**
	 * Whether merged default + active track backgrounds include a CSS gradient (for range fill reset).
	 *
	 * @param object|null $style Track style section (meta2).
	 * @return bool
	 */
	private function track_fill_has_gradient_merged( $style ) {
		if ( empty( $style ) || ! isset( $style->desktop ) || ! is_object( $style->desktop ) ) {
			return false;
		}
		foreach ( array( 'default', 'active' ) as $state_key ) {
			if ( ! isset( $style->desktop->{$state_key}->backgroundColor ) ) {
				continue;
			}
			$bg = $style->desktop->{$state_key}->backgroundColor;
			if ( is_string( $bg ) && false !== strpos( $bg, 'gradient(' ) ) {
				return true;
			}
		}
		return false;
	}
}

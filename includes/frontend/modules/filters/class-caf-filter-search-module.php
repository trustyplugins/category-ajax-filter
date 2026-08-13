<?php
/**
 * Frontend Builder Search Filter Module
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Filter_Search_Module extends CAF_Filter_Base_Module {

	/**
	 * Render module.
	 *
	 * @return string
	 */
	public function render() {
		$settings = isset( $this->module->settings ) ? $this->module->settings : new stdClass();
		if ( ! isset( $settings->smart_ai_search ) || ! is_object( $settings->smart_ai_search ) ) {
			$settings->smart_ai_search = new stdClass();
		}
		$settings->smart_ai_search->is_enable = 'false';
		if ( ! isset( $settings->keyword_search ) || ! is_object( $settings->keyword_search ) ) {
			$settings->keyword_search = new stdClass();
		}
		$settings->keyword_search->is_enable = 'true';
		if ( ! isset( $settings->source ) || ! is_object( $settings->source ) ) {
			$settings->source = new stdClass();
		}
		$settings->source->custom_field = false;
		$settings->custom_field         = '0';
		if ( ! isset( $settings->voice_icon ) || ! is_object( $settings->voice_icon ) ) {
			$settings->voice_icon = new stdClass();
		}
		$settings->voice_icon->is_enable = 'false';

		$search_icon_data = isset( $settings->search_icon ) && is_object( $settings->search_icon ) ? clone $settings->search_icon : (object) array();
		$voice_icon_data  = isset( $settings->voice_icon ) && is_object( $settings->voice_icon ) ? clone $settings->voice_icon : (object) array();
		$clear_icon_data  = isset( $settings->clear_icon ) && is_object( $settings->clear_icon ) ? clone $settings->clear_icon : (object) array();
		if ( empty( $search_icon_data->type ) ) {
			$search_icon_data->type = 'icon';
		}
		if ( 'icon' === $search_icon_data->type && empty( $search_icon_data->icon ) ) {
			$search_icon_data->icon = 'fas fa-search';
		}
		if ( empty( $voice_icon_data->type ) ) {
			$voice_icon_data->type = 'icon';
		}
		if ( 'icon' === $voice_icon_data->type && empty( $voice_icon_data->icon ) ) {
			$voice_icon_data->icon = 'fas fa-microphone';
		}
		if ( empty( $clear_icon_data->type ) ) {
			$clear_icon_data->type = 'icon';
		}
		if ( 'icon' === $clear_icon_data->type && empty( $clear_icon_data->icon ) ) {
			$clear_icon_data->icon = 'fas fa-times';
		}

		$placeholder = isset( $settings->search_placeholder ) ? $settings->search_placeholder : '';

		$search_icon_enabled  = ! isset( $settings->search_icon->is_enable ) || 'true' === (string) $settings->search_icon->is_enable;
		$search_icon_position = isset( $settings->search_icon->position ) && '' !== (string) $settings->search_icon->position ? $settings->search_icon->position : 'right';
		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'search_show_icon' ) ) {
			// Free tier: show the built-in search icon on the right; icon settings stay locked in the builder.
			$search_icon_enabled  = true;
			$search_icon_position = 'right';
			$search_icon_data->type = 'icon';
			$search_icon_data->icon = 'fas fa-search';
		}

		$voice_icon_enabled  = false;
		$voice_icon_position = 'right';

		$clear_icon_enabled    = ! isset( $settings->clear_icon->is_enable ) || 'true' === (string) $settings->clear_icon->is_enable;
		$clear_icon_position   = isset( $settings->clear_icon->position ) && '' !== (string) $settings->clear_icon->position ? $settings->clear_icon->position : 'right';
		$clear_icon_visibility = isset( $settings->clear_icon->visibility ) ? $settings->clear_icon->visibility : '';
		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'search_clear_input' ) ) {
			$clear_icon_enabled = false;
		}

		$has_left_icons = (
			( $search_icon_enabled && 'left' === $search_icon_position ) ||
			( $voice_icon_enabled && 'left' === $voice_icon_position ) ||
			( $clear_icon_enabled && 'left' === $clear_icon_position )
		);

		$has_right_icons = (
			( $search_icon_enabled && 'right' === $search_icon_position ) ||
			( $voice_icon_enabled && 'right' === $voice_icon_position ) ||
			( $clear_icon_enabled && 'right' === $clear_icon_position )
		);

		$search_trigger = $this->normalize_attr_value( isset( $settings->search_trigger ) ? $settings->search_trigger : '' );
		$search_source  = isset( $settings->source ) ? $settings->source : null;
		$custom_field   = $this->normalize_attr_value( isset( $settings->custom_field ) ? $settings->custom_field : '' );
		$char_limit     = $this->normalize_attr_value( isset( $settings->char_limit->limit ) ? $settings->char_limit->limit : '' );
		$voice_placeholder = $this->normalize_attr_value( isset( $settings->voice_icon->placeholder ) ? $settings->voice_icon->placeholder : '' );
		$char_limit_enabled = isset( $settings->char_limit->is_enable ) ? (string) $settings->char_limit->is_enable : 'false';
		$smart_search_enabled = 'false';
		$keyword_search_enabled = isset( $settings->keyword_search->is_enable ) ? $settings->keyword_search->is_enable : 'true';

		$this->collect_css();
		$toggle_closed_class = $this->get_toggle_closed_class();
		$search_output_class = 'caf-filter-module-search-output';
		if ( '' !== $toggle_closed_class ) {
			$search_output_class .= ' ' . $toggle_closed_class;
		}

		$html  = $this->render_label();
		$html .= '<div class="' . esc_attr( $search_output_class ) . '"';
		$html .= ' row-id="' . esc_attr( $this->row_key ) . '"';
		$html .= ' column-id="' . esc_attr( $this->column_key ) . '"';
		$html .= ' module-id="' . esc_attr( $this->module_key ) . '"';
		$html .= ' filter-type="search"';
		$html .= ' data-search-trigger="' . esc_attr( $search_trigger ) . '"';
		$html .= ' data-search-source="' . esc_attr( wp_json_encode( $search_source ) ) . '"';
		$html .= ' data-search-custom-field="' . esc_attr( $custom_field ) . '"';
		$html .= ' data-char-limit="' . esc_attr( $char_limit ) . '"';
		$html .= ' data-char-limit-enabled="' . esc_attr( $char_limit_enabled ) . '"';
		$html .= ' data-voice-placeholder="' . esc_attr( $voice_placeholder ) . '"';
		$html .= ' data-search-source-everything="' . esc_attr( ( isset( $settings->source->everything ) && true === $settings->source->everything ) ? 'true' : 'false' ) . '"';
		$html .= ' data-search-source-title="' . esc_attr( ( isset( $settings->source->title ) && true === $settings->source->title ) ? 'true' : 'false' ) . '"';
		$html .= ' data-search-source-descriptions="' . esc_attr( ( isset( $settings->source->descriptions ) && true === $settings->source->descriptions ) ? 'true' : 'false' ) . '"';
		$html .= ' data-search-source-custom-field="' . esc_attr( ( isset( $settings->source->custom_field ) && true === $settings->source->custom_field ) ? 'true' : 'false' ) . '"';
		$html .= ' data-smart-search-enabled="' . esc_attr( $smart_search_enabled ) . '"';
		$html .= ' data-keyword-search-enabled="' . esc_attr( $keyword_search_enabled ) . '">';

		if ( $has_left_icons ) {
			$html .= '<div class="caf-search-left-col">';

			if ( $search_icon_enabled && 'left' === $search_icon_position ) {
				$html .= '<span class="search-icon">';
				$html .= $this->render_icon_markup( $search_icon_data );
				$html .= '</span>';
			}

			if ( $voice_icon_enabled && 'left' === $voice_icon_position ) {
				$html .= '<span class="voice-icon">';
				$html .= $this->render_icon_markup( $voice_icon_data );
				$html .= '</span>';
			}

			if ( $clear_icon_enabled && 'left' === $clear_icon_position && ( 'always' === $clear_icon_visibility || 'type' === $clear_icon_visibility ) ) {
				$html .= '<span class="clear-icon on-' . esc_attr( $clear_icon_visibility ) . '">';
				$html .= $this->render_icon_markup( $clear_icon_data );
				$html .= '</span>';
			}

			$html .= '</div>';
		}

		$html .= '<input type="search" class="caf-search-input-field" placeholder="' . esc_attr( $placeholder ) . '" />';

		if ( $has_right_icons ) {
			$html .= '<div class="caf-search-right-col">';

			if ( $search_icon_enabled && 'right' === $search_icon_position ) {
				$html .= '<span class="search-icon">';
				$html .= $this->render_icon_markup( $search_icon_data );
				$html .= '</span>';
			}

			if ( $voice_icon_enabled && 'right' === $voice_icon_position ) {
				$html .= '<span class="voice-icon">';
				$html .= $this->render_icon_markup( $voice_icon_data );
				$html .= '</span>';
			}

			if ( $clear_icon_enabled && 'right' === $clear_icon_position && ( 'always' === $clear_icon_visibility || 'type' === $clear_icon_visibility ) ) {
				$html .= '<span class="clear-icon on-' . esc_attr( $clear_icon_visibility ) . '">';
				$html .= $this->render_icon_markup( $clear_icon_data );
				$html .= '</span>';
			}

			$html .= '</div>';
		}

		$html .= '</div>';

		return $html;
	}

	/**
	 * Collect module CSS.
	 *
	 * @return void
	 */
	protected function collect_css() {
		$module_selector = $this->get_module_selector();
		$meta1_style     = $this->get_style_section( 'meta1' );
		$meta2_style     = $this->get_style_section( 'meta2' );
		$input_style     = $this->get_style_section( 'input' );
		$icon_style     = $this->get_style_section( 'icon' );
		$icon2_style    = $this->get_style_section( 'icon2' );
		$icon3_style    = $this->get_style_section( 'icon3' );
		$meta1_selector = $module_selector . ' .caf-filter-module-search-output .caf-search-left-col';
		$meta2_selector = $module_selector . ' .caf-filter-module-search-output .caf-search-right-col';
		$input_selector = $module_selector . ' .caf-filter-module-search-output';
		$icon_selector  = $module_selector . ' .caf-filter-module-search-output .search-icon i';
		$icon2_selector = $module_selector . ' .caf-filter-module-search-output .voice-icon i';
		$icon3_selector = $module_selector . ' .caf-filter-module-search-output .clear-icon i';
		$focused        = $module_selector . ' .caf-filter-module-search-output.caf-focused';
		$placeholder    = $module_selector . ' .caf-filter-module-search-output input.caf-search-input-field::placeholder';

		$this->collect_default_and_hover_css( $meta1_style, $meta1_selector );
		$this->collect_default_and_hover_css( $meta2_style, $meta2_selector );
		$this->collect_default_and_hover_css( $input_style, $input_selector );
		$this->collect_default_and_hover_css( $this->strip_focus_layout_from_style( $input_style ), $focused, 'selected' );
		$this->collect_default_and_hover_css( $input_style, $placeholder, 'placeholder' );
		$this->collect_default_and_hover_css( $icon_style, $icon_selector );
		$this->collect_default_and_hover_css( $icon2_style, $icon2_selector );
		$this->collect_default_and_hover_css( $icon3_style, $icon3_selector );
	}

	/**
	 * Normalize builder setting value for safe HTML attributes.
	 *
	 * @param mixed $value Raw builder setting value.
	 * @return string
	 */
	protected function normalize_attr_value( $value ) {
		if ( is_scalar( $value ) || null === $value ) {
			return (string) $value;
		}

		if ( is_object( $value ) ) {
			foreach ( array( 'value', 'id', 'slug', 'key', 'name' ) as $prop ) {
				if ( isset( $value->$prop ) && is_scalar( $value->$prop ) ) {
					return (string) $value->$prop;
				}
			}

			return '';
		}

		if ( is_array( $value ) ) {
			foreach ( array( 'value', 'id', 'slug', 'key', 'name' ) as $key ) {
				if ( isset( $value[ $key ] ) && is_scalar( $value[ $key ] ) ) {
					return (string) $value[ $key ];
				}
			}
		}

		return '';
	}
}

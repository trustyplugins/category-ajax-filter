<?php
/**
 * Frontend Builder Dropdown Filter Module
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Filter_Dropdown_Module extends CAF_Filter_Base_Module {
	/**
	 * Render module.
	 *
	 * @return string
	 */
	public function render() {
		$settings = $this->get_settings();

		$this->collect_css();

		$html  = $this->render_label();
		$html .= $this->render_terms_markup( $settings );

		return $html;
	}

	/**
	 * Collect CSS.
	 *
	 * @return void
	 */
	protected function collect_css() {
		$meta_style                   = $this->get_style_section( 'meta' );
		$mainmeta_style               = $this->get_style_section( 'mainmeta' );
		$meta1_style                  = $this->get_style_section( 'meta1' );
		$icon_style                   = $this->get_style_section( 'icon' );
		$count_style                  = $this->get_style_section( 'count' );
		$meta3_style                  = $this->get_style_section( 'meta3' );
		$meta4_style                  = $this->get_style_section( 'meta4' );
		$selectmeta_style             = $this->get_style_section( 'selectmeta' );
		$selecticon_style             = $this->get_style_section( 'selecticon' );
		$module_selector              = $this->get_module_selector();
		$meta_selector                = $module_selector . ' ul.caf-terms-list.caf-dropdown';
		$mainmeta_selector            = $module_selector . ' ul.caf-terms-list.caf-dropdown ul.caf-dropdown-child';
		$meta1_selector               = $module_selector . ' li.caf-terms-list-item';
		$icon_selector                = $module_selector . ' ul.caf-terms-list.caf-dropdown li.caf-terms-list-item i';
		$icon_selector_svg            = $module_selector . ' ul.caf-terms-list.caf-dropdown li.caf-terms-list-item svg';
		$count_selector               = $module_selector . ' ul.caf-terms-list.caf-dropdown li.caf-terms-list-item .manage-text-lbl span.count-span';
		$meta3_selector               = $module_selector . ' ul.caf-terms-list.caf-dropdown li.caf-terms-list-item .manage-text-lbl';
		$select_meta_selector         = $module_selector . ' li .caf-selected-term-main.caf-all-selected';
		$meta4_selector               = $module_selector . ' li .caf-selected-term-main .result ';
		$selecticon_selector          = $module_selector . ' li .caf-selected-term-main.caf-all-selected .result i ';
		$selecticon_selector_svg      = $module_selector . ' li .caf-selected-term-main.caf-all-selected .result svg ';
		$meta1_selector_selected      = $module_selector . ' li.caf-terms-list-item.active';
		$icon_selector_selected       = $module_selector . ' ul.caf-terms-list.caf-dropdown li.caf-terms-list-item.active i';
		$icon2_selector_selected      = $module_selector . ' ul.caf-terms-list.caf-dropdown li.caf-terms-list-item.active svg';
		$count_selector_selected      = $module_selector . ' ul.caf-terms-list.caf-dropdown li.caf-terms-list-item.active .manage-text-lbl span.count-span';
		$meta3_selector_selected      = $module_selector . ' ul.caf-terms-list.caf-dropdown li.caf-terms-list-item.active .manage-text-lbl';
		$selectmeta_selector_selected = $module_selector . ' li .caf-selected-term-main';
		$selecticon_selector_selected = $module_selector . ' li .caf-selected-term-main .result i';
		$selecticon2_selector_selected = $module_selector . ' li .caf-selected-term-main .result svg';

		$this->collect_default_and_hover_css( $meta_style, $meta_selector );
		$this->collect_default_and_hover_css( $mainmeta_style, $mainmeta_selector );
		$this->collect_default_and_hover_css( $meta1_style, $meta1_selector );
		$this->collect_default_and_hover_css( $icon_style, $icon_selector );
		$this->collect_default_and_hover_css( $icon_style, $icon_selector_svg );
		$this->collect_default_and_hover_css( $count_style, $count_selector );
		$this->collect_default_and_hover_css( $meta3_style, $meta3_selector );
		$this->collect_default_and_hover_css( $selectmeta_style, $select_meta_selector );
		$this->collect_default_and_hover_css( $meta4_style, $meta4_selector );
		$this->collect_default_and_hover_css( $selecticon_style, $selecticon_selector );
		$this->collect_default_and_hover_css( $selecticon_style, $selecticon_selector_svg );
		$this->collect_default_and_hover_css( $meta1_style, $meta1_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $icon_style, $icon_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $icon_style, $icon2_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $count_style, $count_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $meta3_style, $meta3_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $selectmeta_style, $selectmeta_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $selecticon_style, $selecticon_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $selecticon_style, $selecticon2_selector_selected, 'selected' );

		// $this->collect_default_and_hover_css( $meta_style, $selected_selector );
		// $this->collect_default_and_hover_css( $meta_style, $active_selector );
	}

	/**
	 * Render terms markup.
	 *
	 * @param object $settings Module settings.
	 * @return string
	 */
	protected function render_terms_markup( $settings ) {
		if ( isset( $settings->data_source ) && 'taxonomy' === $settings->data_source ) {
			return $this->render_taxonomy_terms( $settings );
		}

		return '';
	}

	/**
	 * Render taxonomy dropdown.
	 *
	 * @param object $settings Module settings.
	 * @return string
	 */
	protected function render_taxonomy_terms( $settings ) {
		if ( empty( $settings->taxonomy_data ) ) {
			return '';
		}
		$multiple_term    = isset( $settings->multiple_term ) ? (string) $settings->multiple_term : 'false';
		// echo '<pre>';
		// print_r( $settings);
		// echo '</pre>';
		$active_icon      = ! empty( $settings->dropdown_data->icons->active_icon ) ? $settings->dropdown_data->icons->active_icon : '';
		$inactive_icon    = ! empty( $settings->dropdown_data->icons->inactive_icon ) ? $settings->dropdown_data->icons->inactive_icon : '';
		$all_option_value = ! empty( $settings->dropdown_data->all_option->value ) ? $settings->dropdown_data->all_option->value : __( 'All', 'category-ajax-filter' );
		$toggle_class     = $this->get_toggle_closed_class();

		$all_active_class = '';
		if ( empty( $settings->predefined_terms ) ) {
			$all_active_class = 'active';
		}

		$first_taxonomy_key = $this->get_first_taxonomy_key_with_terms( $settings );

		$html  = '<div class="caf-manage-dropdown-labels-filter-dropdown">';
		$html .= '<ul class="caf-terms-list caf-dropdown ' . esc_attr( $toggle_class ) . '"';
		$html .= ' data-source="taxonomy"';
		$html .= ' data-all-option-label="' . esc_attr( $all_option_value ) . '"';
		$html .= ' multiple-term="' . esc_attr( $multiple_term ) . '"';
		$html .= ' filter-type="dropdown"';
		$html .= ' active-icon="' . esc_attr( is_string( $active_icon ) ? $active_icon : '' ) . '"';
		$html .= ' inactive-icon="' . esc_attr( is_string( $inactive_icon ) ? $inactive_icon : '' ) . '"';
		$html .= ' row-id="' . esc_attr( $this->row_key ) . '"';
		$html .= ' column-id="' . esc_attr( $this->column_key ) . '"';
		$html .= ' module-id="' . esc_attr( $this->module_key ) . '"';
		$html .= ' category-relation="' . esc_attr( isset( $settings->category_relation ) ? $settings->category_relation : '' ) . '"';
		$html .= ' meta-operator=""';
		$html .= ' meta-type="">';
		$html .= '<li class="caf-terms-list-item-wrraper" term-value="all" term-id="0">';
		$html .= '<div class="caf-selected-term-main' . ( empty( $settings->predefined_terms ) ? ' caf-all-selected' : '' ) . '">';
		$selectmeta = $this->get_style_section( 'selectmeta' );
		$meta1      = $this->get_style_section( 'meta1' );
		// echo '<pre>';
		// var_dump($selectmeta);
		// echo '</pre>';
		$selectbox = $this->get_style_justify_content( $selectmeta, 'flex-start' );
		$textcount = $this->get_style_justify_content( $meta1, 'flex-start' );
		$html     .= '<div class="result caf-layout-' . $selectbox . '"><div class="manage-text-lbl caf-layout-' . $textcount . '">';
		$html     .= $this->render_taxonomy_selected_label( $settings, $all_option_value );
		$html     .= '</div></div>';
		$html .= '<span class="selected-icon"><i class="fas fa-chevron-down"></i></span>';

		$html .= '</div>';

		$html .= '<ul class="caf-dropdown-child caf-disable">';

		if ( '' !== $first_taxonomy_key ) {
			$html .= $this->render_dropdown_all_list_item(
				$settings,
				$all_option_value,
				$all_active_class,
				$textcount,
				$first_taxonomy_key,
				'0'
			);
		}

		foreach ( $settings->taxonomy_data as $tax_index => $taxonomy ) {
			if ( empty( $taxonomy->term_data ) ) {
				continue;
			}

			foreach ( $taxonomy->term_data as $term ) {
				if ( ! $this->verify_taxonomy_term( $taxonomy->key, $term->key ) ) {
					continue;
				}

				$term_predefine    = 'false';
				$term_active_class = '';

				if ( $this->is_taxonomy_term_predefined_single( $settings, $taxonomy->key, $term->key ) ) {
					$term_predefine    = 'true';
					$term_active_class = 'active';
				}

				$html .= '<li class="caf-terms-list-item ' . esc_attr( $term_active_class ) . ' caf-layout-' . $textcount . '" taxonomy="' . esc_attr( $taxonomy->key ) . '" data-key="' . esc_attr( $taxonomy->key ) . '" term-id="' . esc_attr( $term->key ) . '" term-slug="' . esc_attr( $this->get_term_slug_attr( $taxonomy->key, $term->key ) ) . '" predefine="' . esc_attr( $term_predefine ) . '">';

				if ( ! empty( $term->icons->icon ) && ! empty( $term->icons->position ) && $settings->show_icon == 'true' ) {
					$html .= '<i class="fa-solid ' . esc_attr( $term->icons->icon ) . ' filter-before-icon"></i>';
				}
				$html .= '<div class="manage-text-lbl caf-layout-' . $textcount . '">';
				$html .= '<span class="trm-name">' . esc_html( $term->value ) . '</span>';
				if ( $settings->show_count == 'true' ) {
					$html .= '<span class="count-span">' . $this->format_count_text( $term->count, $settings ) . '</span>';
				}
				$html .= '</div>';
				$html .= '</li>';
			}
		}

		$html .= '</ul>';
		$html .= '</li>';
		$html .= '</ul>';
		$html .= '</div>';

		return $html;
	}

	/**
	 * Render taxonomy selected label.
	 *
	 * @param object $settings         Module settings.
	 * @param string $all_option_value All option text.
	 * @return string
	 */
	protected function render_taxonomy_selected_label( $settings, $all_option_value ) {
		if ( ! empty( $settings->predefined_terms ) && ! empty( $settings->predefined_terms[0] ) ) {
			foreach ( $settings->taxonomy_data as $taxonomy ) {
				if ( empty( $taxonomy->term_data ) ) {
					continue;
				}

				foreach ( $taxonomy->term_data as $term ) {
					if ( ! $this->verify_taxonomy_term( $taxonomy->key, $term->key ) ) {
						continue;
					}

					if ( $this->is_taxonomy_term_predefined_single( $settings, $taxonomy->key, $term->key ) ) {
						$html = '';

						if ( ! empty( $term->icons->icon ) && ! empty( $term->icons->position ) && 'before' === $term->icons->position ) {
							$html .= '<i class="fa-solid ' . esc_attr( $term->icons->icon ) . ' filter-before-icon"></i>';
						}

						$html .= esc_html( $term->value );

						if ( ! empty( $term->icons->icon ) && ! empty( $term->icons->position ) && 'after' === $term->icons->position ) {
							$html .= '<i class="fa-solid ' . esc_attr( $term->icons->icon ) . ' filter-after-icon"></i>';
						}

						return $html;
					}
				}
			}
		}

		return $this->render_all_option_with_icons( $settings, $all_option_value );
	}

	/**
	 * Whether the dropdown "All" placeholder option is enabled.
	 *
	 * @param object $settings Module settings.
	 * @return bool
	 */
	protected function is_all_option_enabled( $settings ) {
		if ( empty( $settings->dropdown_data->all_option ) ) {
			return true;
		}

		$flag = isset( $settings->dropdown_data->all_option->is_enable )
			? (string) $settings->dropdown_data->all_option->is_enable
			: '';

		if ( '' === $flag ) {
			return true;
		}

		return 'true' === $flag;
	}

	/**
	 * First taxonomy key that has at least one configured term.
	 *
	 * @param object $settings Module settings.
	 * @return string
	 */
	protected function get_first_taxonomy_key_with_terms( $settings ) {
		if ( empty( $settings->taxonomy_data ) || ! is_array( $settings->taxonomy_data ) ) {
			return '';
		}

		foreach ( $settings->taxonomy_data as $taxonomy ) {
			if ( ! empty( $taxonomy->term_data ) && ! empty( $taxonomy->key ) ) {
				return (string) $taxonomy->key;
			}
		}

		return '';
	}

	/**
	 * Render the dropdown list item for the "All" placeholder option.
	 *
	 * @param object $settings         Module settings.
	 * @param string $all_option_value All option label.
	 * @param string $active_class     Active class string.
	 * @param string $textcount        Layout class suffix.
	 * @param string $data_key         Taxonomy or custom-field key.
	 * @param string $term_id          All term id attribute.
	 * @param string $label_class      Label span class.
	 * @return string
	 */
	protected function render_dropdown_all_list_item( $settings, $all_option_value, $active_class, $textcount, $data_key = '', $term_id = '0', $label_class = 'trm-name' ) {
		$html  = '<li class="caf-terms-list-item caf-dropdown-all-option ' . esc_attr( $active_class ) . ' caf-layout-' . esc_attr( $textcount ) . '"';
		$html .= ' predefine="false"';
		$html .= ' term-value="all"';
		$html .= ' term-id="' . esc_attr( $term_id ) . '"';
		if ( '' !== $data_key ) {
			$html .= ' data-key="' . esc_attr( $data_key ) . '"';
		}
		$html .= '>';

		$all_option_icons = isset( $settings->dropdown_data->all_option->icons ) ? $settings->dropdown_data->all_option->icons : null;
		$show_icon        = ! empty( $settings->show_icon ) && 'true' === $settings->show_icon;
		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'filter_show_icon' ) ) {
			$show_icon = false;
		}
		$icon_visible     = $this->is_truthy( isset( $all_option_icons->visibility ) ? $all_option_icons->visibility : false ) && $show_icon;
		$icon_position    = isset( $all_option_icons->position ) ? (string) $all_option_icons->position : 'before-option';
		$icon_markup      = $this->render_icon_markup( $all_option_icons, 'filter-before-icon' );

		if ( $icon_visible && 'before-option' === $icon_position ) {
			$html .= $icon_markup;
		}

		$html .= '<div class="manage-text-lbl caf-layout-' . esc_attr( $textcount ) . '">';
		$html .= '<span class="' . esc_attr( $label_class ) . '">' . esc_html( $all_option_value ) . '</span>';
		$html .= '</div>';

		if ( $icon_visible && 'after-option' === $icon_position ) {
			$html .= str_replace( 'filter-before-icon', 'filter-after-icon', $icon_markup );
		}

		$html .= '</li>';

		return $html;
	}

	/**
	 * Render all option with optional icons.
	 *
	 * @param object $settings         Module settings.
	 * @param string $all_option_value All option value.
	 * @return string
	 */
	protected function render_all_option_with_icons( $settings, $all_option_value ) {
		$html = '';

		$all_option_icons = isset( $settings->dropdown_data->all_option->icons ) ? $settings->dropdown_data->all_option->icons : null;
		$show_icon        = ! empty( $settings->show_icon ) && 'true' === $settings->show_icon;
		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'filter_show_icon' ) ) {
			$show_icon = false;
		}
		$icon_visible     = $this->is_truthy( isset( $all_option_icons->visibility ) ? $all_option_icons->visibility : false ) && $show_icon;
		$icon_position    = isset( $all_option_icons->position ) ? (string) $all_option_icons->position : 'before-option';
		$icon_markup      = $this->render_icon_markup( $all_option_icons, 'filter-before-icon' );
		if ( $icon_visible && 'before-option' === $icon_position ) {
			$html .= $icon_markup;
		}

		$html .= esc_html( $all_option_value );

		if ( $icon_visible && 'after-option' === $icon_position ) {
			$html .= str_replace( 'filter-before-icon', 'filter-after-icon', $icon_markup );
		}

		return $html;
	}
}

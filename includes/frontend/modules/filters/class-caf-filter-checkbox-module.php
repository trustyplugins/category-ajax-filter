<?php
/**
 * Frontend Builder Checkbox Filter Module
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Filter_Checkbox_Module extends CAF_Filter_Base_Module {

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
		$settings                      = $this->get_settings();
		$show_checkbox                 = $this->is_truthy( isset( $settings->show_checkbox ) ? $settings->show_checkbox : '' );
		$show_icon                     = $this->is_truthy( isset( $settings->show_icon ) ? $settings->show_icon : '' );
		$show_count                    = $this->is_truthy( isset( $settings->show_count ) ? $settings->show_count : '' );
		$module_selector               = $this->get_module_selector();
		$ul_style                      = $this->get_style_section( 'meta' );
		$ul_selector                   = $module_selector . ' ul.caf-checkbox';
		$ul_li_style                   = $this->get_style_section( 'meta1' );
		$ul_li_selector                = $module_selector . ' ul.caf-checkbox li';
		$ul_li_input_style             = $this->get_style_section( 'input' );
		$ul_li_input_selector          = $module_selector . ' ul.caf-checkbox li span.caf-checkbox-box';
		$ul_li_icon_style              = $this->get_style_section( 'icon' );
		$ul_li_icon_selector_0         = $module_selector . ' ul.caf-checkbox li .manage-ic-lbl i';
		$ul_li_icon_selector_1         = $module_selector . ' ul.caf-checkbox li .manage-ic-lbl svg';
		$ul_li_icon_selector_2         = $module_selector . ' ul.caf-checkbox li .manage-ic-lbl .caf-term-swatch';
		$ul_li_count_style             = $this->get_style_section( 'count' );
		$ul_li_count_selector          = $module_selector . ' ul.caf-checkbox li .manage-text-lbl span.count-span';
		$ul_li_meta1_style             = $this->get_style_section( 'meta1' );
		$ul_li_meta2_style             = $this->get_style_section( 'meta2' );
		$ul_li_meta2_selector          = $module_selector . ' ul.caf-checkbox li .manage-ic-lbl';
		$ul_li_meta3_style             = $this->get_style_section( 'meta3' );
		$ul_li_meta3_selector          = $module_selector . ' ul.caf-checkbox li .manage-text-lbl';
		$ul_li_meta1_selector_selected = $module_selector . ' ul.caf-checkbox li.caf-selected';
		$ul_li_input_selector_selected = $module_selector . ' ul.caf-checkbox li.caf-selected span.caf-checkbox-box';
		$ul_li_meta2_selector_selected = $module_selector . ' ul.caf-checkbox li.caf-selected .manage-ic-lbl';
		$ul_li_meta3_selector_selected = $module_selector . ' ul.caf-checkbox li.caf-selected .manage-text-lbl';
		$ul_li_icon_selector_selected = $module_selector . ' ul.caf-checkbox li.caf-selected .manage-ic-lbl i';
		$ul_li_icon2_selector_selected = $module_selector . ' ul.caf-checkbox li.caf-selected .manage-ic-lbl svg';
		$ul_li_icon3_selector_selected = $module_selector . ' ul.caf-checkbox li.caf-selected .manage-ic-lbl .caf-term-swatch';
		$ul_li_count_selector_selected = $module_selector . ' ul.caf-checkbox li.caf-selected .manage-text-lbl span.count-span';
		$this->collect_default_and_hover_css( $ul_style, $ul_selector );
		$this->collect_default_and_hover_css( $ul_li_style, $ul_li_selector );
		$this->collect_default_and_hover_css( $ul_li_input_style, $ul_li_input_selector );
		$this->collect_default_and_hover_css( $ul_li_icon_style, $ul_li_icon_selector_0 );
		$this->collect_default_and_hover_css( $ul_li_icon_style, $ul_li_icon_selector_1 );
		$this->collect_default_and_hover_css( $ul_li_icon_style, $ul_li_icon_selector_2 );
		$this->collect_default_and_hover_css( $ul_li_count_style, $ul_li_count_selector );
		$this->collect_default_and_hover_css( $ul_li_meta2_style, $ul_li_meta2_selector );
		$this->collect_default_and_hover_css( $ul_li_meta3_style, $ul_li_meta3_selector );
		$this->collect_default_and_hover_css( $ul_li_meta1_style, $ul_li_meta1_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $ul_li_input_style, $ul_li_input_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $ul_li_meta2_style, $ul_li_meta2_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $ul_li_meta3_style, $ul_li_meta3_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $ul_li_icon_style, $ul_li_icon_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $ul_li_icon_style, $ul_li_icon2_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $ul_li_icon_style, $ul_li_icon3_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $ul_li_count_style, $ul_li_count_selector_selected, 'selected' );

		/*
		$this->collect_default_and_hover_css( $meta_style, $active_selector );
		if ( ! empty( $meta_style ) ) {
		$this->css_builder->add(
		$this->style_generator->generate_droppable_div_css(
		$meta_style,
		'desktop',
		'default',
		$droppable_selector
		)
		);
		}*/
	}

	/**
	 * Resolve checkbox inline layout class from a style tab only when its UI block is enabled.
	 *
	 * @param string $meta_key     Style tab key: meta1, meta2, or meta3.
	 * @param object $settings     Module settings.
	 * @param string $setting_key  Feature toggle: show_checkbox, show_icon, or show_count.
	 * @param string $default      Default justify value.
	 * @return string
	 */
	protected function get_resolved_checkbox_layout_justify( $meta_key, $settings, $setting_key, $default = 'flex-start' ) {
		$enabled = $this->is_truthy( isset( $settings->{$setting_key} ) ? $settings->{$setting_key} : '' );
		if ( ! $enabled ) {
			return $default;
		}

		return $this->get_style_justify_content( $this->get_style_section( $meta_key ), $default );
	}

	/**
	 * Build checkbox layout classes used by frontend markup.
	 *
	 * @param object $settings Module settings.
	 * @return array{row:string,icon:string,text:string}
	 */
	protected function get_checkbox_layout_classes( $settings ) {
		return array(
			'row'  => $this->get_resolved_checkbox_layout_justify( 'meta1', $settings, 'show_checkbox' ),
			'icon' => $this->get_resolved_checkbox_layout_justify( 'meta2', $settings, 'show_icon' ),
			'text' => $this->get_resolved_checkbox_layout_justify( 'meta3', $settings, 'show_count' ),
		);
	}

	/**
	 * Render terms markup.
	 *
	 * @param object $settings Module settings.
	 * @return string
	 */
	protected function render_terms_markup( $settings ) {
		$multiple_term       = isset( $settings->multiple_term ) ? $settings->multiple_term : 'false';
		$toggle_closed_style = $this->get_toggle_closed_style();
		$category_relation   = isset( $settings->category_relation ) ? $settings->category_relation : '';

		if ( isset( $settings->data_source ) && 'taxonomy' === $settings->data_source ) {
			return $this->render_taxonomy_terms(
				$settings,
				$multiple_term,
				$toggle_closed_style,
				$category_relation,
				'',
				''
			);
		}

		return '';
	}

	/**
	 * Render taxonomy terms.
	 *
	 * @param object $settings             Module settings.
	 * @param string $multiple_term        Multiple term flag.
	 * @param string $toggle_closed_style  Toggle style.
	 * @param string $category_relation    Category relation.
	 * @param string $meta_operator        Meta operator.
	 * @param string $meta_type            Meta type.
	 * @return string
	 */
	protected function render_taxonomy_terms( $settings, $multiple_term, $toggle_closed_style, $category_relation, $meta_operator, $meta_type ) {
		if ( empty( $settings->taxonomy_data ) ) {
			return '';
		}

		$html            = '<ul class="caf-terms-list caf-checkbox" style="' . esc_attr( $toggle_closed_style ) . '"';
		$html           .= ' data-source="taxonomy"';
		$html           .= ' multiple-term="' . esc_attr( $multiple_term ) . '"';
		$html           .= ' filter-type="checkbox"';
		$html           .= ' row-id="' . esc_attr( $this->row_key ) . '"';
		$html           .= ' column-id="' . esc_attr( $this->column_key ) . '"';
		$html           .= ' module-id="' . esc_attr( $this->module_key ) . '"';
		$html           .= ' category-relation="' . esc_attr( $category_relation ) . '"';
		$html           .= ' meta-operator="' . esc_attr( $meta_operator ) . '"';
		$html           .= ' meta-type="' . esc_attr( $meta_type ) . '">';
		$layout_classes  = $this->get_checkbox_layout_classes( $settings );

		foreach ( $settings->taxonomy_data as $taxonomy ) {
			if ( empty( $taxonomy->term_data ) ) {
				continue;
			}

			foreach ( $taxonomy->term_data as $term ) {
				if ( ! $this->verify_taxonomy_term( $taxonomy->key, $term->key ) ) {
					continue;
				}

				$html .= $this->render_taxonomy_term_item(
					$taxonomy->key,
					$term,
					$settings,
					$multiple_term,
					$layout_classes
				);
			}
		}
		$html .= '</ul>';

		return $html;
	}

	/**
	 * Render one taxonomy term item.
	 *
	 * @param string $taxonomy_key  Taxonomy key.
	 * @param object $term          Term object.
	 * @param object $settings      Module settings.
	 * @param string $multiple_term Multiple term flag.
	 * @param array  $layout_classes Layout classes for row/icon/text wrappers.
	 * @return string
	 */
	protected function render_taxonomy_term_item( $taxonomy_key, $term, $settings, $multiple_term, $layout_classes ) {
		// echo '<pre>';
		// var_dump( $settings );
		// echo '</pre>';
		$active_class = '';
		$checked      = '';
		$predefine    = 'false';
		$skin         = isset( $settings->skins->checkbox ) ? $settings->skins->checkbox : 'checkbox_skin1';

		if ( 'true' === $multiple_term ) {
			if ( $this->is_taxonomy_term_predefined_multi( $settings, $taxonomy_key, $term ) ) {
				$active_class = 'active caf-selected';
				$checked      = 'checked';
				$predefine      = 'true';
			}
		} elseif ( $this->is_taxonomy_term_predefined_single( $settings, $taxonomy_key, $term->key ) ) {
			$active_class = 'active caf-selected';
			$checked      = 'checked';
			$predefine      = 'true';
		}

		$html = '<li class="caf-terms-list-item ' . esc_attr( $active_class ) . ' caf-layout-' . esc_attr( $layout_classes['row'] ) . ( $this->should_hide_term_label( $settings ) ? ' caf-hide-term-label' : '' ) . $this->get_term_tooltip_li_class( $settings ) . '" taxonomy="' . esc_attr( $taxonomy_key ) . '" data-key="' . esc_attr( $taxonomy_key ) . '" term-id="' . esc_attr( $term->key ) . '" term-slug="' . esc_attr( $this->get_term_slug_attr( $taxonomy_key, $term->key ) ) . '" predefine="' . esc_attr( $predefine ) . '"' . $this->get_term_tooltip_data_attr( $settings, isset( $term->value ) ? ucfirst( $term->value ) : '' ) . $this->get_term_label_data_attr( isset( $term->value ) ? ucfirst( $term->value ) : '' ) . '>';
		$html .= $this->render_term_label_tooltip( $settings, isset( $term->value ) ? ucfirst( $term->value ) : '' );
		// $html .= '<label class="caf-taxo-checkbox-main" taxonomy="' . esc_attr( $taxonomy_key ) . '" data-key="' . esc_attr( $taxonomy_key ) . '" predefine="' . esc_attr( $predefine ) . '" style="display:flex;align-items:center;">';
		$html .= '<input type="checkbox" style="display:none" class="caf-taxo-input ' . esc_attr( $skin ) . '" ' . $checked . ' value="' . esc_attr( $term->key ) . '" />';
		if ( $settings->show_checkbox === 'true' ) {
			$html .= '<span class="caf-checkbox-box"></span>';
		}
		$html .= '<div class="manage-ic-lbl caf-layout-' . esc_attr( $layout_classes['icon'] ) . '">';
		if ( ! empty( $settings->show_icon ) && 'true' === (string) $settings->show_icon ) {
			$position = ! empty( $term->icons->position ) ? (string) $term->icons->position : 'before';
			if ( 'before' === $position ) {
				$html .= $this->render_term_visual_markup( $settings, isset( $term->icons ) ? $term->icons : null, 'filter-before-icon' );
			}
		}
		$hide_label = $this->should_hide_term_label( $settings );
		$show_count = $this->is_truthy( isset( $settings->show_count ) ? $settings->show_count : '' );
		if ( ! $hide_label || $show_count ) {
			$html .= '<div class="manage-text-lbl caf-layout-' . esc_attr( $layout_classes['text'] ) . '">';
			if ( ! $hide_label ) {
				$html .= '<span class="trm-name caf-term-label">' . esc_html( ucfirst( $term->value ) ) . '</span>';
			}
			if ( $show_count ) {
				$display_count = $this->resolve_term_display_count( $taxonomy_key, $term );
				if ( $display_count > 0 ) {
					$html .= '<span class="count-span">' . $this->format_count_text( $display_count, $settings ) . '</span>';
				}
			}
			$html .= '</div>';
		}
		// Keep after-swatch inside .manage-ic-lbl so Design (icon) CSS selectors apply.
		if ( ! empty( $settings->show_icon ) && 'true' === (string) $settings->show_icon && ! empty( $term->icons->position ) && 'after' === $term->icons->position ) {
			$html .= $this->render_term_visual_markup( $settings, isset( $term->icons ) ? $term->icons : null, 'filter-after-icon' );
		}
		$html .= '</div>';

		// $html .= '</label>';

		if ( ! empty( $term->children_data ) && is_array( $term->children_data ) ) {
			$html .= '<ul class="children">';

			foreach ( $term->children_data as $child_term ) {
				if ( ! $this->verify_taxonomy_term( $taxonomy_key, $child_term->key ) ) {
					continue;
				}

				$html .= $this->render_taxonomy_child_term_item(
					$taxonomy_key,
					$child_term,
					$settings,
					$multiple_term
				);
			}

			$html .= '</ul>';
		}

		$html .= '</li>';

		return $html;
	}

	/**
	 * Render one taxonomy child term item.
	 *
	 * @param string $taxonomy_key  Taxonomy key.
	 * @param object $term          Child term object.
	 * @param object $settings      Module settings.
	 * @param string $multiple_term Multiple term flag.
	 * @return string
	 */
	protected function render_taxonomy_child_term_item( $taxonomy_key, $term, $settings, $multiple_term ) {
		$active_class = '';
		$checked      = '';
		$predefine    = 'false';
		$skin         = isset( $settings->skins->checkbox ) ? $settings->skins->checkbox : 'checkbox_skin1';

		if ( 'true' === $multiple_term ) {
			if ( $this->is_taxonomy_term_predefined_multi( $settings, $taxonomy_key, $term ) ) {
				$active_class = 'active caf-selected';
				$checked      = 'checked';
				$predefine      = 'true';
			}
		} elseif ( $this->is_taxonomy_term_predefined_single( $settings, $taxonomy_key, $term->key ) ) {
			$active_class = 'active caf-selected';
			$checked      = 'checked';
			$predefine      = 'true';
		}

		$html  = '<li class="caf-terms-list-item child ' . esc_attr( $active_class ) . ( $this->should_hide_term_label( $settings ) ? ' caf-hide-term-label' : '' ) . $this->get_term_tooltip_li_class( $settings ) . '" taxonomy="' . esc_attr( $taxonomy_key ) . '" data-key="' . esc_attr( $taxonomy_key ) . '" term-id="' . esc_attr( $term->key ) . '" term-slug="' . esc_attr( $this->get_term_slug_attr( $taxonomy_key, $term->key ) ) . '" predefine="' . esc_attr( $predefine ) . '" parent-id="' . esc_attr( isset( $term->parent_id ) ? $term->parent_id : '' ) . '"' . $this->get_term_tooltip_data_attr( $settings, isset( $term->value ) ? ucfirst( $term->value ) : '' ) . $this->get_term_label_data_attr( isset( $term->value ) ? ucfirst( $term->value ) : '' ) . '>';
		$html .= $this->render_term_label_tooltip( $settings, isset( $term->value ) ? ucfirst( $term->value ) : '' );
		$html .= '<label class="caf-taxo-checkbox-main" taxonomy="' . esc_attr( $taxonomy_key ) . '" data-key="' . esc_attr( $taxonomy_key ) . '" predefine="' . esc_attr( $predefine ) . '" style="display:flex;align-items:center;">';
		$html .= '<input type="checkbox" class="caf-taxo-input ' . esc_attr( $skin ) . '" ' . $checked . ' value="' . esc_attr( $term->key ) . '" />';

		if ( ! empty( $settings->show_icon ) && 'true' === $settings->show_icon ) {
			$position = ! empty( $term->icons->position ) ? (string) $term->icons->position : 'before';
			if ( 'before' === $position ) {
				$html .= $this->render_term_visual_markup( $settings, isset( $term->icons ) ? $term->icons : null, 'filter-before-icon' );
			}
		}

		if ( ! $this->should_hide_term_label( $settings ) ) {
			$html .= esc_html( ucfirst( $term->value ) );
		}

		if ( ! empty( $settings->show_icon ) && 'true' === $settings->show_icon && ! empty( $term->icons->position ) && 'after' === $term->icons->position ) {
			$html .= $this->render_term_visual_markup( $settings, isset( $term->icons ) ? $term->icons : null, 'filter-after-icon' );
		}

		$html .= '</label>';
		$html .= '</li>';

		return $html;
	}
}

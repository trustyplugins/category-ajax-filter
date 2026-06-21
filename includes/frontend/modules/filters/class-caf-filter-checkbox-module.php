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
		$ul_li_count_selector_selected = $module_selector . ' ul.caf-checkbox li.caf-selected .manage-text-lbl span.count-span';
		$this->collect_default_and_hover_css( $ul_style, $ul_selector );
		$this->collect_default_and_hover_css( $ul_li_style, $ul_li_selector );
		$this->collect_default_and_hover_css( $ul_li_input_style, $ul_li_input_selector );
		$this->collect_default_and_hover_css( $ul_li_icon_style, $ul_li_icon_selector_0 );
		$this->collect_default_and_hover_css( $ul_li_icon_style, $ul_li_icon_selector_1 );
		$this->collect_default_and_hover_css( $ul_li_count_style, $ul_li_count_selector );
		$this->collect_default_and_hover_css( $ul_li_meta2_style, $ul_li_meta2_selector );
		$this->collect_default_and_hover_css( $ul_li_meta3_style, $ul_li_meta3_selector );
		$this->collect_default_and_hover_css( $ul_li_meta1_style, $ul_li_meta1_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $ul_li_input_style, $ul_li_input_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $ul_li_meta2_style, $ul_li_meta2_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $ul_li_meta3_style, $ul_li_meta3_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $ul_li_icon_style, $ul_li_icon_selector_selected, 'selected' );
		$this->collect_default_and_hover_css( $ul_li_icon_style, $ul_li_icon2_selector_selected, 'selected' );
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
		$meta1           = $this->get_style_section( 'meta1' );
		$meta2           = $this->get_style_section( 'meta2' );
		$checkboxContent = $this->get_style_justify_content( $meta1, 'flex-start' );
		$iconText        = $this->get_style_justify_content( $meta2, 'flex-start' );

		// echo "<pre>";
		// print_r($meta1);
		// echo "</pre>";
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
					$checkboxContent,
					$iconText
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
	 * @param string $checkboxContent Checkbox layout class.
	 * @param string $iconText      Icon layout class.
	 * @return string
	 */
	protected function render_taxonomy_term_item( $taxonomy_key, $term, $settings, $multiple_term, $checkboxContent, $iconText ) {
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

		$html = '<li class="caf-terms-list-item ' . esc_attr( $active_class ) . ' caf-layout-' . esc_attr( $checkboxContent ) . '" taxonomy="' . esc_attr( $taxonomy_key ) . '" data-key="' . esc_attr( $taxonomy_key ) . '" term-id="' . esc_attr( $term->key ) . '" term-slug="' . esc_attr( $this->get_term_slug_attr( $taxonomy_key, $term->key ) ) . '" predefine="' . esc_attr( $predefine ) . '">';
		// $html .= '<label class="caf-taxo-checkbox-main" taxonomy="' . esc_attr( $taxonomy_key ) . '" data-key="' . esc_attr( $taxonomy_key ) . '" predefine="' . esc_attr( $predefine ) . '" style="display:flex;align-items:center;">';
		$html .= '<input type="checkbox" style="display:none" class="caf-taxo-input ' . esc_attr( $skin ) . '" ' . $checked . ' value="' . esc_attr( $term->key ) . '" />';
		if ( $settings->show_checkbox === 'true' ) {
			$html .= '<span class="caf-checkbox-box"></span>';
		}
		$html .= '<div class="manage-ic-lbl caf-layout-' . esc_attr( $iconText ) . '">';
		if ( ! empty( $settings->show_icon ) && 'true' === (string) $settings->show_icon ) {
			if ( ! empty( $term->icons->icon ) && ! empty( $term->icons->position ) && 'before' === $term->icons->position ) {
				$html .= '<i class="fa-solid ' . esc_attr( $term->icons->icon ) . ' filter-before-icon"></i>';
			}
		}
		$html .= '<div class="manage-text-lbl caf-layout-' . esc_attr( $checkboxContent ) . '">';

		$html .= '<span class="trm-name caf-term-label">' . esc_html( ucfirst( $term->value ) ) . '</span>';

		if ( ! empty( $term->count ) && $settings->show_count === 'true' ) {
			$html .= '<span class="count-span">' . $this->format_count_text( $term->count, $settings ) . '</span>';
		}
		$html .= '</div>';
		$html .= '</div>';

		if ( ! empty( $settings->show_icon ) && 'true' === (string) $settings->show_icon && ! empty( $term->icons->icon ) && ! empty( $term->icons->position ) && 'after' === $term->icons->position ) {
			$html .= '<i class="fa-solid ' . esc_attr( $term->icons->icon ) . ' filter-after-icon"></i>';
		}

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

		$html  = '<li class="caf-terms-list-item child ' . esc_attr( $active_class ) . '" taxonomy="' . esc_attr( $taxonomy_key ) . '" data-key="' . esc_attr( $taxonomy_key ) . '" term-id="' . esc_attr( $term->key ) . '" term-slug="' . esc_attr( $this->get_term_slug_attr( $taxonomy_key, $term->key ) ) . '" predefine="' . esc_attr( $predefine ) . '" parent-id="' . esc_attr( isset( $term->parent_id ) ? $term->parent_id : '' ) . '">';
		$html .= '<label class="caf-taxo-checkbox-main" taxonomy="' . esc_attr( $taxonomy_key ) . '" data-key="' . esc_attr( $taxonomy_key ) . '" predefine="' . esc_attr( $predefine ) . '" style="display:flex;align-items:center;">';
		$html .= '<input type="checkbox" class="caf-taxo-input ' . esc_attr( $skin ) . '" ' . $checked . ' value="' . esc_attr( $term->key ) . '" />';

		if ( ! empty( $settings->show_icon ) && 'true' === $settings->show_icon && ! empty( $term->icons->icon ) && ! empty( $term->icons->position ) && 'before' === $term->icons->position ) {
			$html .= '<i class="fa-solid ' . esc_attr( $term->icons->icon ) . ' filter-before-icon"></i>';
		}

		$html .= esc_html( ucfirst( $term->value ) );

		if ( ! empty( $settings->show_icon ) && 'true' === $settings->show_icon && ! empty( $term->icons->icon ) && ! empty( $term->icons->position ) && 'after' === $term->icons->position ) {
			$html .= '<i class="fa-solid ' . esc_attr( $term->icons->icon ) . ' filter-after-icon"></i>';
		}

		$html .= '</label>';
		$html .= '</li>';

		return $html;
	}
}

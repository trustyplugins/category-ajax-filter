<?php
/**
 * Frontend Builder Base Filter Module
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class CAF_Filter_Base_Module {

	/**
	 * Module object.
	 *
	 * @var object
	 */
	protected $module;

	/**
	 * Row key.
	 *
	 * @var int
	 */
	protected $row_key;

	/**
	 * Column key.
	 *
	 * @var int
	 */
	protected $column_key;

	/**
	 * Module key.
	 *
	 * @var int
	 */
	protected $module_key;

	/**
	 * CSS builder.
	 *
	 * @var CAF_Builder_Css
	 */
	protected $css_builder;

	/**
	 * Style generator.
	 *
	 * @var CAF_Builder_Style_Generator
	 */
	protected $style_generator;
	/**
	 * CSS scope prefix for this shortcode instance (e.g. ".caf-builder-instance-1").
	 *
	 * @var string
	 */
	protected $instance_css_prefix = '';
	/**
	 * Cached taxonomy term IDs.
	 *
	 * @var array
	 */
	protected $taxonomy_term_ids_cache = array();
	/**
	 * Constructor.
	 *
	 * @param object                          $module              Module object.
	 * @param int                             $row_key             Row key.
	 * @param int                             $column_key          Column key.
	 * @param int                             $module_key          Module key.
	 * @param CAF_Builder_Css             $css_builder         CSS builder.
	 * @param CAF_Builder_Style_Generator $style_generator     Style generator.
	 * @param string                          $instance_css_prefix Optional. Prepended to filter selectors for instance scoping.
	 */
	public function __construct(
		$module,
		$row_key,
		$column_key,
		$module_key,
		CAF_Builder_Css $css_builder,
		CAF_Builder_Style_Generator $style_generator,
		$instance_css_prefix = ''
	) {
		$this->module          = $module;
		$this->row_key         = absint( $row_key );
		$this->column_key      = absint( $column_key );
		$this->module_key      = absint( $module_key );
		$this->css_builder     = $css_builder;
		$this->style_generator = $style_generator;
		$this->instance_css_prefix = is_string( $instance_css_prefix ) ? trim( $instance_css_prefix ) : '';
	}

	/**
	 * Render module.
	 *
	 * @return string
	 */
	abstract public function render();

	/**
	 * Get module settings.
	 *
	 * @return object
	 */
	protected function get_settings() {
		return isset( $this->module->settings ) ? $this->module->settings : new stdClass();
	}

	/**
	 * Get module style section.
	 *
	 * @param string $section Style section key.
	 * @return mixed|null
	 */
	protected function get_style_section( $section ) {
		return isset( $this->module->style->{$section} ) ? $this->module->style->{$section} : null;
	}

	/**
	 * Get module wrapper selector.
	 *
	 * @return string
	 */
	protected function get_module_selector() {
		$path = '.filter-layout-container .caf-fl-row-' . $this->row_key . ' .caf-fl-column-' . $this->column_key . ' .caf-fl-module-' . $this->module_key;
		if ( '' !== $this->instance_css_prefix ) {
			return $this->instance_css_prefix . ' ' . $path;
		}
		return $path;
	}

	/**
	 * Collect default and hover CSS.
	 *
	 * @param mixed  $style    Style object.
	 * @param string $selector CSS selector.
	 * @param string $selected Selected state key or "false".
	 * @param array  $args     Optional style generator args.
	 * @return void
	 */
	protected function collect_default_and_hover_css( $style, $selector, $selected = 'false', $args = array() ) {
		if ( empty( $style ) || empty( $selector ) ) {
			return;
		}
		if ( $selected === 'false' ) {
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					'default',
					$selector,
					$args
				)
			);

			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					'hover',
					$selector . ':hover',
					$args
				)
			);
		}

		if ( $selected !== 'false' ) {
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					$selected,
					$selector,
					$args
				)
			);
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					$selected,
					$selector . ':hover',
					$args
				)
			);
		}
	}


	/**
	 * Verify taxonomy term exists.
	 *
	 * @param string $taxonomy Taxonomy.
	 * @param int    $term_id  Term ID.
	 * @return bool
	 */
	protected function verify_taxonomy_term( $taxonomy, $term_id ) {
		$taxonomy = (string) $taxonomy;
		$term_id  = (int) $term_id;

		if ( '' === $taxonomy || $term_id < 1 ) {
			return false;
		}

		if ( ! isset( $this->taxonomy_term_ids_cache[ $taxonomy ] ) ) {
			$terms = get_terms(
				array(
					'taxonomy'   => $taxonomy,
					'hide_empty' => false,
					'fields'     => 'ids',
				)
			);

			if ( is_wp_error( $terms ) || empty( $terms ) ) {
				$this->taxonomy_term_ids_cache[ $taxonomy ] = array();
			} else {
				$this->taxonomy_term_ids_cache[ $taxonomy ] = array_map( 'intval', $terms );
			}
		}

		return in_array( $term_id, $this->taxonomy_term_ids_cache[ $taxonomy ], true );
	}

	/**
	 * Term slug for readable filter URLs.
	 *
	 * @param string $taxonomy Taxonomy slug.
	 * @param int    $term_id  Term ID.
	 * @return string
	 */
	protected function get_term_slug_attr( $taxonomy, $term_id ) {
		$term = get_term( (int) $term_id, sanitize_key( (string) $taxonomy ) );
		if ( $term && ! is_wp_error( $term ) && ! empty( $term->slug ) ) {
			return (string) $term->slug;
		}

		return (string) absint( $term_id );
	}

	/**
	 * Render common module label.
	 *
	 * @return string
	 */
	protected function render_label() {
		$settings = $this->get_settings();
		// echo '<pre>';
		// print_r( $settings );
		// echo '</pre>';
		if ( empty( $settings->label ) || empty( $settings->label->is_label ) || 'true' !== $settings->label->is_label ) {
			return '';
		}

		$header_style         = $this->get_style_section( 'header' );
		$header_selector      = $this->get_module_selector() . ' .caf-filter-label-common';
		$label_inner_selector = $this->get_module_selector() . ' .caf-filter-label-common .caf-builder-filter-label-wrapper';
		$layout_properties    = array( 'display', 'flex-flow', 'justify-content', 'align-items', 'gap', 'float' );

		$this->collect_default_and_hover_css(
			$header_style,
			$header_selector,
			'false',
			array( 'excluded_properties' => $layout_properties )
		);
		$this->collect_default_and_hover_css(
			$header_style,
			$label_inner_selector,
			'false',
			array( 'allowed_properties' => $layout_properties )
		);

		$label_text = ! empty( $settings->label->value ) ? $settings->label->value : __( 'Label', 'category-ajax-filter' );
		$icon_data  = isset( $settings->label->icons ) ? $settings->label->icons : null;
		$icon_pos   = isset( $icon_data->position ) ? (string) $icon_data->position : 'before-label';
		$show_icon  = $this->is_truthy( isset( $icon_data->visibility ) ? $icon_data->visibility : false );
		$toggle_pos = isset( $settings->toggle_position ) ? (string) $settings->toggle_position : 'right';

		$html  = '<div class="caf-filter-label-common label-header">';
		if ( ! empty( $settings->enable_toggle ) && 'true' === $settings->enable_toggle && 'left' === $toggle_pos ) {
			$is_closed = ! empty( $settings->close_toggle ) && 'true' === $settings->close_toggle;
			$html     .= '<div class="caf-builder-filter-toggle-icon"><span class="label-icon-common">';
			$html     .= $is_closed ? '<i class="fas fa-chevron-down"></i>' : '<i class="fas fa-chevron-up"></i>';
			$html     .= '</span></div>';
		}
		$html .= '<div class="caf-builder-filter-label-wrapper">';
		if ( $show_icon && 'before-label' === $icon_pos ) {
			$html .= $this->render_icon_markup( $icon_data, 'caf-builder-before-label before-common' );
		}
		$html .= '<span class="caf-builder-filter-label">' . esc_html( $label_text ) . '</span>';
		if ( $show_icon && 'after-label' === $icon_pos ) {
			$html .= $this->render_icon_markup( $icon_data, 'caf-builder-after-label after-common' );
		}
		$html .= '</div>';

		if ( ! empty( $settings->enable_toggle ) && 'true' === $settings->enable_toggle && 'left' !== $toggle_pos ) {
			$is_closed = ! empty( $settings->close_toggle ) && 'true' === $settings->close_toggle;

			$html .= '<div class="caf-builder-filter-toggle-icon">';
			$html .= '<span class="label-icon-common">';
			$html .= $is_closed
				? '<i class="fas fa-chevron-down"></i>'
				: '<i class="fas fa-chevron-up"></i>';
			$html .= '</span>';
			$html .= '</div>';
		}

		$html .= '</div>';

		return $html;
	}

	/**
	 * Get toggle closed inline style.
	 *
	 * @return string
	 */
	protected function get_toggle_closed_style() {
		$settings = $this->get_settings();

		if ( ! empty( $settings->enable_toggle ) && ! empty( $settings->close_toggle ) && 'true' === $settings->close_toggle ) {
			return 'display:none;';
		}

		return 'display:flex;';
	}
	protected function get_toggle_closed_class() {
		$settings = $this->get_settings();

		if ( ! empty( $settings->enable_toggle ) && ! empty( $settings->close_toggle ) && 'true' === $settings->close_toggle ) {
			return 'toggle_closed';
		}

		return '';
	}

	/**
	 * Resolve active device key for frontend rendering.
	 *
	 * @return string One of desktop|tablet|mobile.
	 */
	protected function get_active_frontend_device_key() {
		$user_agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? strtolower( (string) wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '';
		$is_tablet  = false !== strpos( $user_agent, 'ipad' )
			|| false !== strpos( $user_agent, 'tablet' )
			|| false !== strpos( $user_agent, 'kindle' )
			|| false !== strpos( $user_agent, 'silk' )
			|| false !== strpos( $user_agent, 'playbook' );

		if ( $is_tablet ) {
			return 'tablet';
		}

		if ( wp_is_mobile() ) {
			return 'mobile';
		}

		return 'desktop';
	}

	/**
	 * Get style section justify-content with device fallback.
	 *
	 * @param object|null $style_section Style section object.
	 * @param string      $default       Default value.
	 * @return string
	 */
	protected function get_style_justify_content( $style_section, $default = 'flex-start' ) {
		if ( empty( $style_section ) || ! is_object( $style_section ) ) {
			return $default;
		}

		$device = $this->get_active_frontend_device_key();
		if ( isset( $style_section->{$device} ) && is_object( $style_section->{$device} ) && isset( $style_section->{$device}->default ) && is_object( $style_section->{$device}->default ) && isset( $style_section->{$device}->default->justifyContent ) ) {
			return (string) $style_section->{$device}->default->justifyContent;
		}

		if ( isset( $style_section->desktop ) && is_object( $style_section->desktop ) && isset( $style_section->desktop->default ) && is_object( $style_section->desktop->default ) && isset( $style_section->desktop->default->justifyContent ) ) {
			return (string) $style_section->desktop->default->justifyContent;
		}

		return $default;
	}

	/**
	 * Check whether a setting value should be treated as true.
	 *
	 * @param mixed $value Value to evaluate.
	 * @return bool
	 */
	protected function is_truthy( $value ) {
		if ( true === $value || 1 === $value || '1' === (string) $value ) {
			return true;
		}
		return is_string( $value ) && 'true' === strtolower( $value );
	}

	/**
	 * Render icon/sprite markup for icon objects.
	 *
	 * @param mixed  $icon_data   Icon data object.
	 * @param string $extra_class Extra css class.
	 * @return string
	 */
	protected function render_icon_markup( $icon_data, $extra_class = '' ) {
		if ( empty( $icon_data ) || ! is_object( $icon_data ) ) {
			return '';
		}
		$type = isset( $icon_data->type ) ? (string) $icon_data->type : 'icon';
		$icon = isset( $icon_data->icon ) ? $icon_data->icon : '';
		$cls  = '' !== $extra_class ? ' ' . $extra_class : '';

		if ( 'svg' === $type && is_object( $icon ) && ! empty( $icon->url ) ) {
			return '<img src="' . esc_url( $icon->url ) . '" class="caf-inline-svg-icon' . esc_attr( $cls ) . '" alt="" />';
		}
		if ( is_string( $icon ) && '' !== $icon ) {
			return '<i class="' . esc_attr( $icon . $cls ) . '"></i>';
		}
		return '';
	}

	/**
	 * Format count value according to settings separator rules.
	 *
	 * @param mixed  $count    Count value.
	 * @param object $settings Module settings.
	 * @return string
	 */
	protected function format_count_text( $count, $settings ) {
		$count_str  = esc_html( (string) $count );
		$separator  = isset( $settings->count_separator ) ? (string) $settings->count_separator : '';
		$prefix     = isset( $settings->count_prefix ) ? (string) $settings->count_prefix : '';
		$suffix     = isset( $settings->count_suffix ) ? (string) $settings->count_suffix : '';

		if ( 'brackets' === $separator ) {
			return '(' . $count_str . ')';
		}
		if ( 'hyphen' === $separator ) {
			return '- ' . $count_str;
		}
		if ( 'custom' === $separator ) {
			return esc_html( $prefix ) . $count_str . esc_html( $suffix );
		}
		return $count_str;
	}

	/**
	 * Single-select taxonomy: term matches saved predefined_terms[0] (taxonomy___term_id or legacy id-only).
	 *
	 * @param object $settings     Module settings.
	 * @param string $taxonomy_key Taxonomy slug.
	 * @param string $term_key     Term id / key from layout data.
	 * @return bool
	 */
	protected function is_taxonomy_term_predefined_single( $settings, $taxonomy_key, $term_key ) {
		if ( 'true' === ( isset( $settings->multiple_term ) ? (string) $settings->multiple_term : 'false' ) ) {
			return false;
		}
		if ( empty( $settings->predefined_terms ) || ! is_array( $settings->predefined_terms ) || empty( $settings->predefined_terms[0] ) ) {
			return false;
		}
		$raw = trim( (string) $settings->predefined_terms[0] );
		if ( false !== strpos( $raw, '___' ) ) {
			$parts = explode( '___', $raw, 2 );
			return isset( $parts[0], $parts[1] ) && (string) $parts[0] === (string) $taxonomy_key && (string) $parts[1] === (string) $term_key;
		}
		if ( preg_match( '/\d+/', $raw, $m ) ) {
			return (string) $term_key === (string) $m[0];
		}
		return (string) $raw === (string) $term_key;
	}

	/**
	 * Multi-select taxonomy: term flagged in layout or listed in predefined_terms.
	 *
	 * @param object $settings     Module settings.
	 * @param string $taxonomy_key Taxonomy slug.
	 * @param object $term_object  Term row from layout JSON.
	 * @return bool
	 */
	protected function is_taxonomy_term_predefined_multi( $settings, $taxonomy_key, $term_object ) {
		if ( 'true' !== ( isset( $settings->multiple_term ) ? (string) $settings->multiple_term : 'false' ) ) {
			return false;
		}
		if ( ! is_object( $term_object ) ) {
			return false;
		}
		if ( ! empty( $term_object->predefine ) && 'true' === (string) $term_object->predefine ) {
			return true;
		}
		if ( empty( $term_object->key ) || empty( $settings->predefined_terms ) || ! is_array( $settings->predefined_terms ) ) {
			return false;
		}
		$needle = (string) $taxonomy_key . '___' . (string) $term_object->key;
		foreach ( $settings->predefined_terms as $t ) {
			if ( (string) $t === $needle ) {
				return true;
			}
		}
		return false;
	}
}

<?php
/**
 * Frontend Builder Style Generator
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-caf-builder-css-optimizer.php';

class CAF_Builder_Style_Generator {

	/**
	 * Optional font enqueue callback.
	 *
	 * @var callable|null
	 */
	protected $font_enqueue_callback = null;

	/**
	 * Constructor.
	 *
	 * @param callable|null $font_enqueue_callback Font enqueue callback.
	 */
	public function __construct( $font_enqueue_callback = null ) {
		if ( is_callable( $font_enqueue_callback ) ) {
			$this->font_enqueue_callback = $font_enqueue_callback;
		}
	}

	/**
	 * Convert camelCase to CSS property string.
	 *
	 * @param string $key Style key.
	 * @return string
	 */
	public function camel_case_to_css_string( $key ) {
		$key = preg_replace( '/([a-z])([A-Z])/', '$1-$2', $key );
		$key = strtolower( $key );

		return $key;
	}

	/**
	 * Remove duplicate CSS property from array.
	 *
	 * @param array  $rules CSS rules array.
	 * @param string $property CSS property.
	 * @return array
	 */
	public function remove_duplicate_property( $rules, $property ) {
		if ( empty( $rules ) || empty( $property ) ) {
			return $rules;
		}

		$deleted_value = '';

		foreach ( $rules as $rule ) {
			$parts = explode( ':', $rule );

			if ( isset( $parts[0] ) && $property === $parts[0] ) {
				$deleted_value = $rule;
				break;
			}
		}

		if ( '' !== $deleted_value ) {
			return array_filter(
				$rules,
				function ( $item ) use ( $deleted_value ) {
					return $item !== $deleted_value;
				}
			);
		}

		return $rules;
	}

	/**
	 * Generate generic CSS.
	 *
	 * @param object $style    Style object.
	 * @param string $device   Device: desktop|tablet|mobile.
	 * @param string $state    State: default|hover.
	 * @param string $selector CSS selector.
	 * @param array  $args     Optional. `allowed_properties`, `excluded_properties` (arrays of kebab-case CSS property names).
	 * @return string
	 */
	public function generate_css( $style, $device, $state, $selector, $args = array() ) {
		return $this->build_css_rule_set(
			$style,
			$device,
			$state,
			$selector,
			$args
		);
	}

	/**
	 * Generate responsive CSS for desktop/tablet/mobile.
	 *
	 * @param object $style    Style object.
	 * @param string $state    State: default|hover|selected|placeholder.
	 * @param string $selector CSS selector.
	 * @param array  $args     Optional generator args.
	 * @return string
	 */
	public function generate_responsive_css( $style, $state, $selector, $args = array() ) {
		$output = '';

		$desktop_css = $this->generate_css( $style, 'desktop', $state, $selector, $args );
		if ( '' !== $desktop_css ) {
			$output .= $desktop_css;
		}

		$tablet_css = $this->generate_css( $style, 'tablet', $state, $selector, $args );
		if ( '' !== $tablet_css ) {
			$output .= '@media (max-width: 1024px) {' . $tablet_css . '}';
		}

		$mobile_css = $this->generate_css( $style, 'mobile', $state, $selector, $args );
		if ( '' !== $mobile_css ) {
			$output .= '@media (max-width: 767px) {' . $mobile_css . '}';
		}

		return $output;
	}
	/**
	 * Generate post container CSS.
	 *
	 * @param object $style    Style object.
	 * @param string $device   Device.
	 * @param string $state    State.
	 * @param string $selector Selector.
	 * @return string
	 */
	public function generate_post_container_css( $style, $device, $state, $selector ) {
		return $this->build_css_rule_set(
			$style,
			$device,
			$state,
			$selector
		);
	}

	/**
	 * Generate post container inner CSS.
	 *
	 * Only "gap" is allowed from the style object here,
	 * matching your old logic.
	 *
	 * @param object $style    Style object.
	 * @param string $device   Device.
	 * @param string $state    State.
	 * @param string $selector Selector.
	 * @return string
	 */
	public function generate_post_container_inner_css( $style, $device, $state, $selector ) {
		return $this->build_css_rule_set(
			$style,
			$device,
			$state,
			$selector,
			array(
				'allowed_properties' => array( 'gap', 'columnGap', 'rowGap' ),
			)
		);
	}

	/**
	 * Generate post single CSS.
	 *
	 * Only "gap" is allowed from the style object here,
	 * matching your old logic.
	 *
	 * @param object $style    Style object.
	 * @param string $device   Device.
	 * @param string $state    State.
	 * @param string $selector Selector.
	 * @return string
	 */
	public function generate_post_single_css( $style, $device, $state, $selector ) {
		return $this->build_css_rule_set(
			$style,
			$device,
			$state,
			$selector,
			array(
				'allowed_properties' => array( 'gap' ),
			)
		);
	}

	/**
	 * Generate post area inner CSS.
	 *
	 * Handles backgroundImage only when builder background_image is empty.
	 *
	 * @param object $style     Style object.
	 * @param string $device    Device.
	 * @param string $state     State.
	 * @param string $selector  Selector.
	 * @param object $settings  Module/row/column settings.
	 * @return string
	 */
	public function generate_post_area_inner_css( $style, $device, $state, $selector, $settings ) {
		return $this->build_css_rule_set(
			$style,
			$device,
			$state,
			$selector,
			array(
				'background_image_mode' => 'conditional',
				'settings'              => $settings,
			)
		);
	}

	/**
	 * Generate misc module CSS.
	 *
	 * backgroundImage becomes url(...)
	 *
	 * @param object $style    Style object.
	 * @param string $device   Device.
	 * @param string $state    State.
	 * @param string $selector Selector.
	 * @return string
	 */
	public function generate_misc_module_css( $style, $device, $state, $selector ) {
		return $this->build_css_rule_set(
			$style,
			$device,
			$state,
			$selector,
			array(
				'background_image_mode' => 'always',
			)
		);
	}

	/**
	 * Generate misc loader CSS.
	 *
	 * overlay becomes background-color.
	 *
	 * @param object $style    Style object.
	 * @param string $device   Device.
	 * @param string $state    State.
	 * @param string $selector Selector.
	 * @return string
	 */
	public function generate_misc_module_loader_css( $style, $device, $state, $selector ) {
		return $this->build_css_rule_set(
			$style,
			$device,
			$state,
			$selector,
			array(
				'overlay_as_background' => true,
			)
		);
	}

	/**
	 * Generate droppable div CSS.
	 *
	 * Only width is allowed, and width:auto adds margin:0.
	 *
	 * @param object $style    Style object.
	 * @param string $device   Device.
	 * @param string $state    State.
	 * @param string $selector Selector.
	 * @return string
	 */
	public function generate_droppable_div_css( $style, $device, $state, $selector ) {
		return $this->build_css_rule_set(
			$style,
			$device,
			$state,
			$selector,
			array(
				'allowed_properties' => array( 'width' ),
				'width_auto_margin'  => true,
			)
		);
	}

	/**
	 * Generate link parent CSS.
	 *
	 * Only justify-content is used, plus width:100%.
	 *
	 * @param object $style    Style object.
	 * @param string $device   Device.
	 * @param string $state    State.
	 * @param string $selector Selector.
	 * @return string
	 */
	public function generate_link_parent_css( $style, $device, $state, $selector ) {
		return $this->build_css_rule_set(
			$style,
			$device,
			$state,
			$selector,
			array(
				'allowed_properties' => array( 'justify-content' ),
				'force_width_100'    => true,
				'justify_width_100'  => true,
			)
		);
	}
	/**
	 * Build final CSS rule set.
	 *
	 * @param object $style    Style object.
	 * @param string $device   Device.
	 * @param string $state    State.
	 * @param string $selector Selector.
	 * @param array  $args     Special behavior args.
	 * @return string
	 */
	protected function build_css_rule_set( $style, $device, $state, $selector, $args = array() ) {
		if ( empty( $style ) || empty( $selector ) || ! is_object( $style ) ) {
			return '';
		}

		$rules  = array();
		$layers = $this->get_style_layers( $style, $device, $state );
		foreach ( $layers as $layer ) {
			$rules = $this->merge_style_layer( $rules, $layer, $args );
		}

		if ( ! empty( $args['force_width_100'] ) ) {
			$rules   = $this->remove_duplicate_property( $rules, 'width' );
			$rules[] = 'width:100%;';
		}

		$rules = CAF_Builder_Css_Optimizer::optimize_declaration_rules( $rules );

		if ( empty( $rules ) ) {
			return '';
		}

		return $selector . ' { ' . implode( ' ', $rules ) . ' }';
	}

	/**
	 * Get ordered style layers for device/state inheritance.
	 *
	 * @param object $style  Style object.
	 * @param string $device Device.
	 * @param string $state  State.
	 * @return array
	 */
	protected function get_style_layers( $style, $device, $state ) {
		$layers = array();

		if ( 'desktop' === $device ) {
			if ( 'default' === $state ) {
				$layers[] = $this->get_style_subtree( $style, 'desktop', 'default' );
			} elseif ( 'placeholder' === $state ) {
				$layers[] = $this->get_style_subtree( $style, 'desktop', $state );
			} elseif ( 'selected' === $state ) {
				$layers[] = $this->get_style_subtree( $style, 'desktop', 'default' );
				$layers[] = $this->get_style_subtree( $style, 'desktop', 'selected' );
			} else {
				$layers[] = $this->get_style_subtree( $style, 'desktop', $state );
			}
		} elseif ( in_array( $device, array( 'tablet', 'mobile' ), true ) ) {
			if ( 'default' === $state ) {
				$layers[] = $this->get_style_subtree( $style, 'desktop', 'default' );
				$layers[] = $this->get_style_subtree( $style, $device, 'default' );
			} elseif ( 'placeholder' === $state ) {
				$layers[] = $this->get_style_subtree( $style, 'desktop', $state );
				$layers[] = $this->get_style_subtree( $style, $device, $state );
			} elseif ( 'selected' === $state ) {
				$layers[] = $this->get_style_subtree( $style, 'desktop', 'default' );
				$layers[] = $this->get_style_subtree( $style, $device, 'default' );
				$layers[] = $this->get_style_subtree( $style, 'desktop', 'selected' );
				$layers[] = $this->get_style_subtree( $style, $device, 'selected' );
			} else {
				$layers[] = $this->get_style_subtree( $style, 'desktop', $state );
				$layers[] = $this->get_style_subtree( $style, $device, $state );
			}
		}

		return array_filter(
			$layers,
			function ( $layer ) {
				return ! empty( $layer ) && is_object( $layer ) && count( get_object_vars( $layer ) ) > 0;
			}
		);
	}

	/**
	 * Get style subtree safely.
	 *
	 * @param object $style  Style object.
	 * @param string $device Device.
	 * @param string $state  State.
	 * @return object|null
	 */
	protected function get_style_subtree( $style, $device, $state ) {
		if ( ! isset( $style->{$device} ) || ! is_object( $style->{$device} ) ) {
			return null;
		}

		if ( ! isset( $style->{$device}->{$state} ) || ! is_object( $style->{$device}->{$state} ) ) {
			return null;
		}

		return $style->{$device}->{$state};
	}

	/**
	 * Merge one style layer into rules array.
	 *
	 * @param array       $rules Existing rules.
	 * @param object|null $layer Style layer object.
	 * @param array       $args  Behavior args.
	 * @return array
	 */
	protected function merge_style_layer( $rules, $layer, $args = array() ) {
		if ( empty( $layer ) || ! is_object( $layer ) ) {
			return $rules;
		}

		foreach ( $layer as $key => $value ) {
			if ( '' === $value || null === $value ) {
				continue;
			}

			$property = $this->camel_case_to_css_string( $key );

			if ( ! empty( $args['allowed_properties'] ) && ! in_array( $property, $args['allowed_properties'], true ) ) {
				continue;
			}

			if ( ! empty( $args['excluded_properties'] ) && in_array( $property, $args['excluded_properties'], true ) ) {
				continue;
			}

			$rules = $this->remove_duplicate_property( $rules, $property );

			$special_rule = $this->build_special_rule( $key, $property, $value, $args );

			if ( null !== $special_rule ) {
				if ( is_array( $special_rule ) ) {
					foreach ( $special_rule as $rule ) {
						$rules[] = $rule;
					}
				} else {
					$rules[] = $special_rule;
				}
			} else {
				$rules[] = $property . ':' . $value . ';';
			}

			if ( 'font-family' === $property ) {
				$this->enqueue_font( $value );
			}
		}

		return $rules;
	}

	/**
	 * Build special-case CSS rule.
	 *
	 * @param string $key      Original key.
	 * @param string $property CSS property.
	 * @param mixed  $value    Value.
	 * @param array  $args     Behavior args.
	 * @return string|array|null
	 */
	protected function build_special_rule( $key, $property, $value, $args = array() ) {
		if ( 'background-color' === $property && is_string( $value ) && false !== strpos( $value, 'gradient(' ) ) {
			// Gradients are not valid for background-color; emit background shorthand.
			return 'background:' . $value . ';';
		}

		if ( ! empty( $args['overlay_as_background'] ) && 'overlay' === $key ) {
			return 'background-color:' . $value . ';';
		}

		if ( 'backgroundImage' === $key ) {
			$mode = isset( $args['background_image_mode'] ) ? $args['background_image_mode'] : '';

			if ( 'always' === $mode ) {
				return $property . ':url(' . $value . ');';
			}

			if ( 'conditional' === $mode ) {
				$settings = isset( $args['settings'] ) ? $args['settings'] : null;

				if ( empty( $settings->background_image ) ) {
					return $property . ':url(' . $value . ');';
				}

				return null;
			}
		}

		if ( ! empty( $args['width_auto_margin'] ) && 'width' === $key ) {
			$rules   = array();
			$rules[] = $property . ':' . $value . ';';

			if ( 'auto' === $value ) {
				$rules[] = 'margin:0;';
			}

			return $rules;
		}

		if ( ! empty( $args['justify_width_100'] ) && 'justify-content' === $property ) {
			return array(
				$property . ':' . $value . ';',
				'width:100%;',
			);
		}

		return null;
	}

	/**
	 * Enqueue font if callback exists.
	 *
	 * @param string $font_family Font family.
	 * @return void
	 */
	protected function enqueue_font( $font_family ) {
		if ( empty( $font_family ) || ! is_callable( $this->font_enqueue_callback ) ) {
			return;
		}

		call_user_func( $this->font_enqueue_callback, $font_family );
	}
}
